import { NextResponse } from 'next/server';
import { firestore } from '@/services/database/firebaseAdmin';

export async function GET() {
  try {
    const allProductsSnapshot = await firestore
      .collection('products')
      .where('enabled', '==', true)
      .get();

    const allProducts = allProductsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const randomProducts = allProducts
      .sort(() => 0.5 - Math.random())
      .slice(0, 5);

    const calculateAverageRating = (comments: any[]) => {
      if (comments.length === 0) return 0;
      const totalRating = comments.reduce((sum, comment) => sum + comment.rating, 0);
      return totalRating / comments.length;
    };

    const productsWithRatings = await Promise.all(randomProducts.map(async (product) => {
      const commentsSnapshot = await firestore
        .collection('products')
        .doc(product.id)
        .collection('comments')
        .get();
      
      const comments = commentsSnapshot.docs.map(doc => doc.data());
      const averageRating = calculateAverageRating(comments);
      
      return { ...product, averageRating };
    }));

    return NextResponse.json({ products: productsWithRatings }, { status: 200 });
  } catch (error) {
    console.error('Error fetching highlighted products:', error);
    return NextResponse.json({ error: 'Failed to fetch highlighted products' }, { status: 500 });
  }
}
