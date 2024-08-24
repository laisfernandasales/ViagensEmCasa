import { NextRequest, NextResponse } from 'next/server';
import { firestore} from '@/services/database/firebaseAdmin';

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
    const ticketId = formData.get('id') as string;
    const enabled = formData.get('enabled') === 'true';

    if (!ticketId) {
      return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 });
    }

    const ticketRef = firestore.collection('Tickets').doc(ticketId);
    const existingTicketDoc = await ticketRef.get();

    if (!existingTicketDoc.exists) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

   
    await ticketRef.update({ enabled });

    return NextResponse.json({ id: ticketId, enabled }, { status: 200 });
  } catch (error) {
    console.error('Error updating ticket status:', error);
    return NextResponse.json({ error: 'Failed to update ticket status' }, { status: 500 });
  }
}
