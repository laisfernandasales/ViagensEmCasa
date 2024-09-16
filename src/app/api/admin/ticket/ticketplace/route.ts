import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';
import { firestore } from '@/services/database/firebaseAdmin';
import { getStorage } from 'firebase-admin/storage';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

async function generateTicketPDF(ticketName: string, customerName: string, ticketQuantity: number, totalPrice: number): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  
    const imagePath = path.resolve('public/icons/home.png');
    const imageBytes = fs.readFileSync(imagePath);
    const image = await pdfDoc.embedPng(imageBytes);

    const { width, height } = page.getSize();
    const fontSize = 24;

    const imageWidth = 50;
    const imageHeight = 50;
    const imageX = 50;
    const imageY = height - imageHeight - 50;
    page.drawImage(image, {
        x: imageX,
        y: imageY,
        width: imageWidth,
        height: imageHeight,
    });

   
    page.drawText('Viagens em Casa', {
        x: imageX + imageWidth + 10,
        y: imageY + (imageHeight / 2) - (fontSize / 2),
        size: fontSize,
        font: titleFont,
        color: rgb(0.2, 0.6, 0.8),
    });

  
    const titleY = height - 6 * fontSize;
    page.drawText('Bilhete de Entrada', {
        x: width / 2 - 100,
        y: titleY,
        size: fontSize + 6,
        font: titleFont,
        color: rgb(0, 0.2, 0.8),
    });

  
    page.drawLine({
        start: { x: 50, y: titleY - 15 },
        end: { x: width - 50, y: titleY - 15 },
        thickness: 2,
        color: rgb(0.2, 0.6, 0.8),
    });

 
    const detailsFontSize = 16;
    const detailsYStart = titleY - 60;
    const detailsLineHeight = 1.5 * detailsFontSize;

    page.drawText(`Nome do Cliente: ${customerName}`, {
        x: 50,
        y: detailsYStart,
        size: detailsFontSize,
        font: font,
        color: rgb(0, 0, 0),
    });

    page.drawText(`Nome do Evento: ${ticketName}`, {
        x: 50,
        y: detailsYStart - detailsLineHeight,
        size: detailsFontSize,
        font: font,
        color: rgb(0, 0, 0.4),
    });

    page.drawText(`Quantidade de Bilhetes: ${ticketQuantity}`, {
        x: 50,
        y: detailsYStart - 2 * detailsLineHeight,
        size: detailsFontSize,
        font: font,
        color: rgb(0, 0, 0),
    });

    page.drawText(`Preço Total: €${totalPrice.toFixed(2)}`, {
        x: 50,
        y: detailsYStart - 3 * detailsLineHeight,
        size: detailsFontSize,
        font: font,
        color: rgb(0, 0.4, 0),
    });

    
    page.drawLine({
        start: { x: 50, y: 100 },
        end: { x: width - 50, y: 100 },
        thickness: 1.5,
        color: rgb(0.2, 0.6, 0.8),
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

       
        if (userId) {
            purchaseData.userId = userId;
        }

        const pdfBuffer = await generateTicketPDF(ticketName, customerName, ticketQuantity, totalPrice);

        const pdfFileName = `${uuidv4()}.pdf`;
        const pdfUrl = await uploadPDFToFirebase(pdfBuffer, ticketId, pdfFileName);

    
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