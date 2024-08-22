import { NextRequest, NextResponse } from 'next/server';
import { firestore, storage } from '@/services/database/firebaseAdmin';

export async function GET() {
  try {
    const ticketsCollection = firestore.collection('Tickets');
    const ticketsSnapshot = await ticketsCollection.get();
    const tickets = ticketsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ tickets }, { status: 200 });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const formData = await req.formData();
    const ticketId = formData.get('ticketId') as string;

    if (!ticketId) {
      return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 });
    }

    const ticketRef = firestore.collection('Tickets').doc(ticketId);
    const existingTicketDoc = await ticketRef.get();

    if (!existingTicketDoc.exists) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const ticketData = existingTicketDoc.data();
    const totalTicketsFromForm = parseInt(formData.get('totalTickets') as string, 10);

    // Atualiza o número total de bilhetes vendidos com base no histórico de vendas
    const salesHistoryCollection = firestore.collection('TicketSaleshistory');
    const salesSnapshot = await salesHistoryCollection.where('ticketId', '==', ticketId).get();
    const totalSoldFromHistory = salesSnapshot.docs.reduce((acc, saleDoc) => {
      return acc + (saleDoc.data().ticketQuantity || 0);
    }, 0);

    // Atualiza o total de bilhetes disponíveis
    const availableTickets = totalTicketsFromForm - totalSoldFromHistory;

    const existingImages = ticketData?.images || [];
    const newImageUrls: string[] = [];
    const images = formData.getAll('images');

    for (const image of images) {
      if (image instanceof File) {
        const storageRef = storage.file(`tickets_images/${ticketId}/${image.name}`);
        await storageRef.save(Buffer.from(await image.arrayBuffer()), {
          contentType: image.type,
        });
        const [url] = await storageRef.getSignedUrl({
          action: 'read',
          expires: '03-01-2500',
        });
        newImageUrls.push(url);
      }
    }

    const imagesToKeep = formData.getAll('existingImages') as string[];
    const updatedImages = [...imagesToKeep, ...newImageUrls];

    const updateData = {
      name: formData.get('name') as string,
      address: formData.get('address') as string,
      ticketPrice: parseFloat(formData.get('ticketPrice') as string),
      totalTickets: totalTicketsFromForm, // Atualiza o total de bilhetes com o novo valor
      ticketsSold: totalSoldFromHistory, // Atualiza o total de bilhetes vendidos com base no histórico
      ticketsAvailable: availableTickets, // Atualiza os bilhetes disponíveis corretamente
      images: updatedImages,
      enabled: formData.get('enabled') === 'true',
    };

    await ticketRef.update(updateData);

    return NextResponse.json({ id: ticketId, ...updateData }, { status: 200 });
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
  }
}