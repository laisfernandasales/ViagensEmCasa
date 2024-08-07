import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/services/database/firebaseAdmin';

export async function GET(req: NextRequest) {
  try {
    const productsCollection = firestore.collection('products');
    const productsSnapshot = await productsCollection.get();

    const products = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Exemplo de como lidar com a criação de um novo produto
  try {
    const productData = await req.json();
    const newProductRef = firestore.collection('products').doc();
    await newProductRef.set(productData);

    return NextResponse.json({ id: newProductRef.id, ...productData }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

// Se você não precisar de POST ou outros métodos HTTP, remova-os
