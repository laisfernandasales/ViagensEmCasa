import { NextResponse } from 'next/server';
import { firestore } from '@/services/database/firebaseAdmin';

export async function GET() {
  try {
    // Busca os primeiros 5 produtos habilitados
    const productsSnapshot = await firestore
      .collection('products')
      .where('enabled', '==', true)
      .limit(5) // Limita a consulta aos primeiros 5 produtos
      .get();
    
    // Mapeia os produtos retornados
    const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Função para calcular a média das avaliações
    const calculateAverageRating = (comments: any[]) => {
      if (comments.length === 0) return 0;
      const totalRating = comments.reduce((sum, comment) => sum + comment.rating, 0);
      return totalRating / comments.length;
    };

    // Adicionando a média de avaliações a cada produto
    const productsWithRatings = await Promise.all(products.map(async (product) => {
      const commentsSnapshot = await firestore
        .collection('products')
        .doc(product.id)
        .collection('comments')
        .get();
      
      const comments = commentsSnapshot.docs.map(doc => doc.data());
      const averageRating = calculateAverageRating(comments);
      
      return { ...product, averageRating };
    }));

    // Retorna os produtos com a média de avaliações calculada
    return NextResponse.json({ products: productsWithRatings }, { status: 200 });
  } catch (error) {
    console.error('Error fetching highlighted products:', error);
    return NextResponse.json({ error: 'Failed to fetch highlighted products' }, { status: 500 });
  }
}
