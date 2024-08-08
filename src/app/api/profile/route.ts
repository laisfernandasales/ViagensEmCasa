// src/app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/services/database/firebaseAdmin';

// Helper function to get user data by userId
const getUserById = async (userId: string) => {
  const userDoc = await firestore.collection('users').doc(userId).get();
  if (!userDoc.exists) {
    return null;
  }
  return userDoc.data();
};

// Handler function for GET requests
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  try {
    const user = await getUserById(userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.accountStatus === 'disabled') {
      return NextResponse.json({ error: 'Sua conta foi desativada. Por favor, entre em contato com o suporte.' }, { status: 403 });
    }


    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
