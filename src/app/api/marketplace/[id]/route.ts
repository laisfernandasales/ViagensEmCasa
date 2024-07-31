import { NextResponse } from 'next/server';
import { firestore } from '@/services/database/firebaseAdmin';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = params.id;

    // Busca o documento do Firestore pelo ID
    const productDoc = await firestore.collection('products').doc(productId).get();

    if (!productDoc.exists) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Combina os dados do produto com o ID do documento
    const product = { id: productDoc.id, ...productDoc.data() };

    // Retorna o produto encontrado
    return NextResponse.json({ product }, { status: 200 });
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    // Retorna um erro genérico se a busca falhar
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
