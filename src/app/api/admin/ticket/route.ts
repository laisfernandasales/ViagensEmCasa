import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/services/database/firebaseAdmin';

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
    const ticketData = await req.json();
    const newTicketRef = firestore.collection('Tickets').doc();
    await newTicketRef.set({
      ...ticketData,
      enabled: true,
      ticketsSold: 0,
    });

    return NextResponse.json({ id: newTicketRef.id, ...ticketData, enabled: true, ticketsSold: 0 }, { status: 201 });
  } catch (error) {
    console.error('Error creating museum ticket:', error);
    return NextResponse.json({ error: 'Failed to create museum ticket' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, ...updateData } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 });
    }

    const ticketRef = firestore.collection('Tickets').doc(id);
    await ticketRef.update(updateData);

    return NextResponse.json({ id, ...updateData }, { status: 200 });
  } catch (error) {
    console.error('Error updating museum ticket:', error);
    return NextResponse.json({ error: 'Failed to update museum ticket' }, { status: 500 });
  }
}
