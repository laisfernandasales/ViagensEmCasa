import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/services/database/firebaseAdmin';

interface Product {
  id: string;
  productName: string;
  description?: string;
  price?: number;
  category?: string;
  stockQuantity?: number;
  weight?: string;
  productStatus?: string;
  images?: string[];
  userId?: string;
  versionId?: string;
}

async function getProducts(queryParams: URLSearchParams, page: number, limit: number): Promise<{ products: Product[]; totalPages: number; currentPage: number; }> {
  let query = firestore.collection('products').where('enabled', '==', true);
  const name = queryParams.get('name')?.toLowerCase() ?? '';
  const minPrice = parseFloat(queryParams.get('minPrice') ?? '0');
  const maxPrice = parseFloat(queryParams.get('maxPrice') ?? 'Infinity');
  const category = queryParams.get('category') ?? '';
  const sortOrder = queryParams.get('sortOrder') ?? '';

  if (minPrice > 0) {
    query = query.where('price', '>=', minPrice);
  }

  if (maxPrice < Infinity) {
    query = query.where('price', '<=', maxPrice);
  }

  if (category) {
    query = query.where('category', '==', category);
  }

  const snapshot = await query.get();

  let products: Product[] = snapshot.docs.map(doc => {
    const data = doc.data() as Omit<Product, 'id'>;
    return { id: doc.id, ...data } as Product;
  });

  if (name) {
    products = products.filter(product => product.productName?.toLowerCase().includes(name));
  }

  if (sortOrder) {
    const [field, order] = sortOrder.split('-');
    products.sort((a, b) => {
      const fieldA = a[field as keyof Product];
      const fieldB = b[field as keyof Product];

      if (fieldA === undefined || fieldB === undefined) return 0;

      if (order === 'asc') {
        return fieldA > fieldB ? 1 : -1;
      } else {
        return fieldA < fieldB ? 1 : -1;
      }
    });
  }

  const totalProducts = products.length;
  const totalPages = Math.ceil(totalProducts / limit);
  const paginatedProducts = products.slice((page - 1) * limit, page * limit);

  return { products: paginatedProducts, totalPages, currentPage: page };
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const limit = parseInt(searchParams.get('limit') ?? '10', 10);

  try {
    const { products, totalPages, currentPage } = await getProducts(searchParams, page, limit);
    return NextResponse.json({ products, totalPages, currentPage });
  } catch (error: unknown) {
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    console.error('Error fetching products:', errorMessage);
    return NextResponse.json({ message: 'Failed to fetch products', error: errorMessage }, { status: 500 });
  }
}
