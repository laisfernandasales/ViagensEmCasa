// app/api/marketplace/route.ts
import { NextResponse } from 'next/server';
import { firestore } from '@/services/database/firebaseAdmin';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const nameFilter = url.searchParams.get('name');
    const minPrice = url.searchParams.get('minPrice');
    const maxPrice = url.searchParams.get('maxPrice');

    let query = firestore.collection('products') as FirebaseFirestore.Query<FirebaseFirestore.DocumentData>;

    if (nameFilter) {
      query = query.where('productName', '>=', nameFilter.toLowerCase())
                   .where('productName', '<=', nameFilter.toLowerCase() + '\uf8ff');
    }

    if (minPrice) {
      query = query.where('price', '>=', parseFloat(minPrice));
    }

    if (maxPrice) {
      query = query.where('price', '<=', parseFloat(maxPrice));
    }

    const productsSnapshot = await query.get();
    const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
