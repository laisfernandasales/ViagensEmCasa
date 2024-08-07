// app/api/marketplace/route.ts
import { NextResponse } from 'next/server';
import { firestore } from '@/services/database/firebaseAdmin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const nameFilter = searchParams.get('name')?.toLowerCase() || '';
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || 'Infinity');

    let query = firestore.collection('products') as FirebaseFirestore.Query<FirebaseFirestore.DocumentData>;

    if (nameFilter) {
      query = query
        .where('productName', '>=', nameFilter)
        .where('productName', '<=', nameFilter + '\uf8ff');
    }

    if (!isNaN(minPrice)) {
      query = query.where('price', '>=', minPrice);
    }

    if (!isNaN(maxPrice)) {
      query = query.where('price', '<=', maxPrice);
    }

    const productsSnapshot = await query.get();
    const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
