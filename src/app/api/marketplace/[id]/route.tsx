// File: /app/api/marketplace/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/services/database/firebaseAdmin';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = params.id;

    // Fetch the product document
    const productDoc = await firestore.collection('products').doc(productId).get();

    if (!productDoc.exists) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = { id: productDoc.id, ...productDoc.data() };

    // Fetch comments subcollection
    const commentsSnapshot = await firestore
      .collection('products')
      .doc(productId)
      .collection('comments')
      .orderBy('createdAt', 'desc') // Sort comments by date
      .get();

    const comments = commentsSnapshot.docs.map((doc) => {
      const commentData = doc.data();
      return {
        id: doc.id,
        ...commentData,
        createdAt: commentData.createdAt.toDate().toISOString(), // Convert to ISO string
      };
    });

    // Return product data along with comments
    return NextResponse.json({ product, comments }, { status: 200 });
  } catch (error) {
    console.error('Error fetching product and comments by ID:', error);
    return NextResponse.json({ error: 'Failed to fetch product and comments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = params.id;
    const { text, rating, userId } = await request.json();

    if (!text || rating < 1 || !userId) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const userSnapshot = await firestore.collection('users').doc(userId).get();
    const userName = userSnapshot.exists ? userSnapshot.data()?.username || 'Anônimo' : 'Anônimo';

    // Use Firestore's server timestamp
    const createdAt = new Date();

    const commentRef = await firestore
      .collection('products')
      .doc(productId)
      .collection('comments')
      .add({
        text,
        rating,
        userId,
        userName,
        createdAt, // Store date as Date object
      });

    const newComment = { id: commentRef.id, text, rating, userName, createdAt: createdAt.toISOString() };

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error('Error posting comment:', error);
    return NextResponse.json({ error: 'Failed to submit comment' }, { status: 500 });
  }
}
