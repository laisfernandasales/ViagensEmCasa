import { NextRequest, NextResponse } from 'next/server';
import { firestore, storage } from '@/services/database/firebaseAdmin';

export const dynamic = 'force-dynamic';

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
      const tickets = ticketsSnapshot.docs.map((doc) => ({
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

    const ticketData = extractTicketData(formData);

    if (id) {
      const response = await updateTicket(id, ticketData, formData);
      return response;
    } else {
      const response = await createTicket(ticketData, formData);
      return response;
    }
  } catch (error) {
    console.error('Error saving ticket:', error);
    return NextResponse.json({ error: 'Failed to save ticket' }, { status: 500 });
  }
}

function extractTicketData(formData: FormData) {
  return {
    name: formData.get('name') as string,
    address: formData.get('address') as string,
    ticketPrice: parseFloat(formData.get('ticketPrice') as string),
    totalTickets: parseInt(formData.get('totalTickets') as string, 10),
    enabled: formData.has('enabled') ? formData.get('enabled') === 'true' : true,
    images: [] as string[],
  };
}

async function updateTicket(id: string, ticketData: any, formData: FormData) {
  const ticketRef = firestore.collection('Tickets').doc(id);
  const existingTicketDoc = await ticketRef.get();

  if (!existingTicketDoc.exists) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  }

  const newImageUrls = await handleImages(id, formData, ticketData.images);

  const imagesToKeep = formData.getAll('existingImages') as string[];
  ticketData.images = [...imagesToKeep, ...newImageUrls];

  await ticketRef.update(ticketData);
  return NextResponse.json({ id, ...ticketData }, { status: 200 });
}

async function createTicket(ticketData: any, formData: FormData) {
  const newTicketRef = firestore.collection('Tickets').doc();
  const newImageUrls = await handleImages(newTicketRef.id, formData);

  ticketData.images = newImageUrls;
  await newTicketRef.set(ticketData);

  return NextResponse.json({ id: newTicketRef.id, ...ticketData }, { status: 201 });
}

async function handleImages(ticketId: string, formData: FormData, existingImages: string[] = []) {
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

  return newImageUrls;
}
