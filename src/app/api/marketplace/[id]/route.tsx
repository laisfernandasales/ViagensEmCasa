import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/services/database/firebaseAdmin';

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productDoc = await firestore
      .collection('products')
      .doc(params.id)
      .get();

    if (!productDoc.exists) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = { id: productDoc.id, ...productDoc.data() };

    const commentsSnapshot = await firestore
      .collection('products')
      .doc(params.id)
      .collection('comments')
      .orderBy('createdAt', 'desc')
      .get();

    const comments = commentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate().toISOString(),
    }));

    return NextResponse.json({ product, comments }, { status: 200 });
  } catch (error) {
    console.error('Error fetching product and comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product and comments' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { text, rating, userId } = await request.json();

    if (!text || rating < 1 || !userId) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const userDoc = await firestore.collection('users').doc(userId).get();
    const userName = userDoc.exists
      ? userDoc.data()?.username || 'Anônimo'
      : 'Anônimo';

    const createdAt = new Date();

    const commentRef = await firestore
      .collection('products')
      .doc(params.id)
      .collection('comments')
      .add({ text, rating, userId, userName, createdAt });

    return NextResponse.json(
      {
        id: commentRef.id,
        text,
        rating,
        userName,
        createdAt: createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error posting comment:', error);
    return NextResponse.json({ error: 'Failed to submit comment' }, { status: 500 });
  }
}
