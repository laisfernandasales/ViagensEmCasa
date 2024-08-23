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
    console.error('Error fetching museum tickets:', error);
    return NextResponse.json({ error: 'Failed to fetch museum tickets' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const newTicketRef = firestore.collection('Tickets').doc();
    
    const imageUrls: string[] = [];
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
        imageUrls.push(url);
      } else {
        console.error('Image is not a File instance');
      }
    }
    
    const ticketData = {
      name: formData.get('name') as string,
      address: formData.get('address') as string,
      ticketPrice: parseFloat(formData.get('ticketPrice') as string),
      totalTickets: parseInt(formData.get('totalTickets') as string, 10),
      images: imageUrls,
      enabled: true,
      ticketsSold: 0,
    };
    
    await newTicketRef.set(ticketData);

    return NextResponse.json({ id: newTicketRef.id, ...ticketData }, { status: 201 });
  } catch (error) {
    console.error('Error creating museum ticket:', error);
    return NextResponse.json({ error: 'Failed to create museum ticket' }, { status: 500 });
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
      } else {
        console.error('Image is not a File instance');
      }
    }

    const imagesToKeep = formData.getAll('existingImages') as string[];

    const updateData = {
      name: formData.get('name') as string,
      address: formData.get('address') as string,
      ticketPrice: parseFloat(formData.get('ticketPrice') as string),
      totalTickets: parseInt(formData.get('totalTickets') as string, 10),
      images: [...imagesToKeep, ...newImageUrls],
      enabled: formData.has('enabled') ? formData.get('enabled') === 'true' : existingTicketDoc.data()?.enabled,
    };

    await ticketRef.update(updateData);

    return NextResponse.json({ id, ...updateData }, { status: 200 });
  } catch (error) {
    console.error('Error updating museum ticket:', error);
    return NextResponse.json({ error: 'Failed to update museum ticket' }, { status: 500 });
  }
}
