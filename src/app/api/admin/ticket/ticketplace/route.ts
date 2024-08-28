import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';
import { firestore } from '@/services/database/firebaseAdmin';
import { getStorage } from 'firebase-admin/storage';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { v4 as uuidv4 } from 'uuid';

async function generateTicketPDF(ticketName: string, customerName: string, ticketQuantity: number, totalPrice: number): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const { width, height } = page.getSize();
    const fontSize = 24;

    page.drawText('Bilhete de Entrada', {
        x: 50,
        y: height - 4 * fontSize,
        size: fontSize,
        font: font,
    });

    page.drawText(`Nome do Cliente: ${customerName}`, {
        x: 50,
        y: height - 6 * fontSize,
        size: 16,
        font: font,
    });

    page.drawText(`Nome do Evento: ${ticketName}`, {
        x: 50,
        y: height - 7.5 * fontSize,
        size: 16,
        font: font,
    });

    page.drawText(`Quantidade de Bilhetes: ${ticketQuantity}`, {
        x: 50,
        y: height - 9 * fontSize,
        size: 16,
        font: font,
    });

    page.drawText(`Preço Total: €${totalPrice.toFixed(2)}`, {
        x: 50,
        y: height - 10.5 * fontSize,
        size: 16,
        font: font,
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
}

async function sendTicketEmail(email: string, pdfBuffer: Buffer) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

    const msg = {
        to: email,
        from: 'viagensemcasa@gmail.com',
        subject: 'Seu Bilhete de Entrada',
        text: 'Obrigado pela sua compra. Em anexo está o seu bilhete.',
        attachments: [
            {
                filename: 'ticket.pdf',
                content: pdfBuffer.toString('base64'),
                type: 'application/pdf',
                disposition: 'attachment',
            },
        ],
    };

    await sgMail.send(msg);
}

async function uploadPDFToFirebase(pdfBuffer: Buffer, ticketId: string, fileName: string): Promise<string> {
    const bucket = getStorage().bucket();
    const file = bucket.file(`tickets/${ticketId}/${fileName}`);
    await file.save(pdfBuffer, {
        metadata: {
            contentType: 'application/pdf',
        },
    });
    return file.publicUrl();
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const customerName = formData.get('customerName') as string;
        const customerNif = formData.get('customerNif') as string;
        const customerEmail = formData.get('customerEmail') as string;
        const paymentMethod = formData.get('paymentMethod') as string;
        const ticketQuantity = parseInt(formData.get('ticketQuantity') as string, 10);
        const totalPrice = parseFloat(formData.get('totalPrice') as string);
        const ticketId = formData.get('ticketId') as string;
        const ticketName = formData.get('ticketName') as string;
        const userId = formData.get('userId') as string | null; // Novo campo opcional para o userId do usuário logado

        // Verificar campos obrigatórios
        const missingFields = [];
        if (!customerName) missingFields.push('customerName');
        if (!customerNif) missingFields.push('customerNif');
        if (!customerEmail) missingFields.push('customerEmail');
        if (!paymentMethod) missingFields.push('paymentMethod');
        if (!ticketQuantity) missingFields.push('ticketQuantity');
        if (!totalPrice) missingFields.push('totalPrice');
        if (!ticketId) missingFields.push('ticketId');
        if (!ticketName) missingFields.push('ticketName');

        if (missingFields.length > 0) {
            console.error('Erro ao processar a compra: Campos obrigatórios ausentes:', missingFields);
            return NextResponse.json({ error: `Campos obrigatórios ausentes: ${missingFields.join(', ')}` }, { status: 400 });
        }

        // Salvar a compra e os detalhes do pagamento no Firestore
        const purchaseRef = firestore.collection('Ticketsaleshistory').doc();
        const purchaseData: any = {
            customerName,
            customerNif,
            email: customerEmail,
            paymentMethod,
            ticketQuantity,
            totalPrice,
            ticketId,
            ticketName,
            purchasedAt: new Date(),
            paymentDetails: {
                customerEmail,
                paymentMethod,
                totalPrice,
                paymentDate: new Date(),
            }
        };

        // Adiciona o userId apenas se estiver presente
        if (userId) {
            purchaseData.userId = userId;
        }

        const pdfBuffer = await generateTicketPDF(ticketName, customerName, ticketQuantity, totalPrice);

        const pdfFileName = `${uuidv4()}.pdf`;
        const pdfUrl = await uploadPDFToFirebase(pdfBuffer, ticketId, pdfFileName);

        // Adiciona a URL do PDF ao Firestore
        purchaseData.pdfUrl = pdfUrl;

        await purchaseRef.set(purchaseData);

        const ticketRef = firestore.collection('Tickets').doc(ticketId);
        const ticketDoc = await ticketRef.get();

        if (!ticketDoc.exists) {
            return NextResponse.json({ error: 'Ticket não encontrado' }, { status: 404 });
        }

        const ticketData = ticketDoc.data();
        const updatedTotalTickets = (ticketData?.totalTickets || 0) - ticketQuantity;

        if (updatedTotalTickets < 0) {
            return NextResponse.json({ error: 'Não há bilhetes suficientes disponíveis' }, { status: 400 });
        }

        await ticketRef.update({
            totalTickets: updatedTotalTickets
        });

        await sendTicketEmail(customerEmail, pdfBuffer);

        return NextResponse.json({ success: true, purchaseId: purchaseRef.id, pdfUrl }, { status: 201 });
    } catch (error) {
        console.error('Erro ao processar a compra:', error);
        return NextResponse.json({ error: 'Falha ao processar a compra' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const ticketsCollection = firestore.collection('Tickets');
        const ticketsSnapshot = await ticketsCollection
            .where('totalTickets', '>', 0)
            .get();
        const tickets = ticketsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return NextResponse.json({ tickets }, { status: 200 });
    } catch (error) {
        console.error('Error fetching available tickets:', error);
        return NextResponse.json({ error: 'Failed to fetch available tickets' }, { status: 500 });
    }
}