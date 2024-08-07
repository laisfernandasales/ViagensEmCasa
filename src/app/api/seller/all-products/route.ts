import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/services/database/firebaseAdmin';
import { auth } from '@/services/auth/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const productsRef = firestore.collection('products');
    const snapshot = await productsRef.where('userId', '==', userId).get();

    if (snapshot.empty) {
      return NextResponse.json({ products: [] }, { status: 200 });
    }

    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch products', error: (error as Error).message }, { status: 500 });
  }
}
