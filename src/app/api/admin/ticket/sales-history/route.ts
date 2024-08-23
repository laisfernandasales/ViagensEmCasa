import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/services/database/firebaseAdmin';

export async function GET() {
    try {
        const salesCollection = firestore.collection('Ticketsaleshistory');
        const salesSnapshot = await salesCollection.get();

        const sales = salesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return NextResponse.json({ sales }, { status: 200 });
    } catch (error) {
        console.error('Error fetching sales history:', error);
        return NextResponse.json({ error: 'Failed to fetch sales history' }, { status: 500 });
    }
}
