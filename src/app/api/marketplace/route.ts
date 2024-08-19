import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/services/database/firebaseAdmin';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name') || '';
  const minPrice = parseFloat(searchParams.get('minPrice') || '0');
  const maxPrice = parseFloat(searchParams.get('maxPrice') || 'Infinity');
  const category = searchParams.get('category') || '';
  const sortOrder = searchParams.get('sortOrder') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  try {
    console.log('Starting query setup');

    let query = firestore.collection('products').where('enabled', '==', true);

    if (name) {
      console.log('Applying name filter');
      query = query
        .where('productName', '>=', name)
        .where('productName', '<=', name + '\uf8ff');
    }
    if (minPrice > 0) {
      console.log('Applying minPrice filter');
      query = query.where('price', '>=', minPrice);
    }
    if (maxPrice < Infinity) {
      console.log('Applying maxPrice filter');
      query = query.where('price', '<=', maxPrice);
    }
    if (category) {
      console.log('Applying category filter');
      query = query.where('category', '==', category);
    }

    if (sortOrder) {
      const [field, order] = sortOrder.split('-');
      const direction = order === 'asc' || order === 'desc' ? order : 'asc';
      console.log(`Applying orderBy: ${field}, ${direction}`);
      query = query.orderBy(field, direction);
    }

    console.log('Executing query');
    const snapshot = await query
      .offset((page - 1) * limit)
      .limit(limit)
      .get();

    console.log('Query executed successfully');
    console.log(`Fetched ${snapshot.size} products`);

    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const totalProducts = (await firestore.collection('products').where('enabled', '==', true).get()).size;
    const totalPages = Math.ceil(totalProducts / limit);

    console.log(`Total products: ${totalProducts}, Total pages: ${totalPages}`);

    return NextResponse.json({ products, totalPages, currentPage: page });
  } catch (error: unknown) {
    let errorMessage = 'An unknown error occurred';

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    console.error('Error fetching products:', errorMessage);

    return NextResponse.json(
      { message: 'Failed to fetch products', error: errorMessage },
      { status: 500 }
    );
  }
}
