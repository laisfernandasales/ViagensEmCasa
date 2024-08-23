import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/services/database/firebaseAdmin';

export async function POST(req: NextRequest, { params }: { params: { userId: string } }) {
  const { userId } = params;

  try {
    const userRef = firestore.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new Error('User not found');
    }

    const currentStatus = userDoc.data()?.accountStatus;
    const newStatus = currentStatus === 'healthy' ? 'disabled' : 'healthy';

    console.log('Updating user:', userId, 'from status:', currentStatus, 'to status:', newStatus);

    await userRef.update({ accountStatus: newStatus });

    return NextResponse.json({ success: true, newStatus }, { status: 200 });
  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json({ error: 'Failed to update user status' }, { status: 500 });
  }
}