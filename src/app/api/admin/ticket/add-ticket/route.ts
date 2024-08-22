import { NextRequest, NextResponse } from 'next/server';
import { firestore, storage } from '@/services/database/firebaseAdmin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const ticketRef = firestore.collection('Tickets').doc(id);
      const ticketDoc = await ticketRef.get();

      if (!ticketDoc.exists) {
        return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
      }

      const ticketData = ticketDoc.data();
      return NextResponse.json({ ticket: { id: ticketDoc.id, ...ticketData } }, { status: 200 });
    } else {
      const ticketsSnapshot = await firestore.collection('Tickets').get();
      const tickets = ticketsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      return NextResponse.json({ tickets }, { status: 200 });
    }
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const id = formData.get('id') as string;

    const ticketData = {
      name: formData.get('name') as string,
      address: formData.get('address') as string,
      ticketPrice: parseFloat(formData.get('ticketPrice') as string),
      totalTickets: parseInt(formData.get('totalTickets') as string, 10),
      enabled: formData.has('enabled') ? formData.get('enabled') === 'true' : true,
      images: [] as string[],
    };

    if (id) {
      // Update existing ticket
      const ticketRef = firestore.collection('Tickets').doc(id);
      const existingTicketDoc = await ticketRef.get();

      if (!existingTicketDoc.exists) {
        return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
      }

      const existingImages = existingTicketDoc.data()?.images || [];
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
      ticketData.images = [...imagesToKeep, ...newImageUrls];

      await ticketRef.update(ticketData);
      return NextResponse.json({ id, ...ticketData }, { status: 200 });
    } else {
      // Create new ticket
      const newTicketRef = firestore.collection('Tickets').doc();
      const newImageUrls: string[] = [];
      const images = formData.getAll('images');

      for (const image of images) {
        if (image instanceof File) {
          const storageRef = storage.file(`tickets_images/${newTicketRef.id}/${image.name}`);
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

      ticketData.images = newImageUrls;
      await newTicketRef.set(ticketData);

      return NextResponse.json({ id: newTicketRef.id, ...ticketData }, { status: 201 });
    }
  } catch (error) {
    console.error('Error saving ticket:', error);
    return NextResponse.json({ error: 'Failed to save ticket' }, { status: 500 });
  }
}
