import { NextRequest, NextResponse } from 'next/server';
import { firestore, storage } from '@/services/database/firebaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 });
    }

    const ticketRef = firestore.collection('Tickets').doc(id);
    const ticketDoc = await ticketRef.get();

    if (!ticketDoc.exists) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const ticketData = ticketDoc.data();

    return NextResponse.json({ ticket: { id: ticketDoc.id, ...ticketData } }, { status: 200 });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json({ error: 'Failed to fetch ticket' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const formData = await req.formData();
    const id = formData.get('id') as string;

    if (!id) {
      return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 });
    }

    const ticketRef = firestore.collection('Tickets').doc(id);
    const existingTicketDoc = await ticketRef.get();

    const newImageUrls: string[] = [];
    const images = formData.getAll('images');
    
    for (const image of images) {
      if (image instanceof File) {
        const storageRef = storage.file(`tickets_images/${id}/${image.name}`);
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
      totalTickets: parseInt(formData.get('totalTickets') as string, 10),
      images: updatedImages,
      enabled: formData.has('enabled') ? formData.get('enabled') === 'true' : existingTicketDoc.data()?.enabled,
    };

    await ticketRef.update(updateData);

    return NextResponse.json({ id, ...updateData }, { status: 200 });
  } catch (error) {
    console.error('Error updating museum ticket:', error);
    return NextResponse.json({ error: 'Failed to update museum ticket' }, { status: 500 });
  }
}
