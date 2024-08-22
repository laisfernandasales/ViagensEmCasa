import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/services/database/firebaseAdmin';
import { auth } from '@/services/auth/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') ?? '1', 10);
    const pageSize = 10;
    const offset = (page - 1) * pageSize;

    const productsRef = firestore.collection('products');
    const snapshot = await productsRef
      .where('userId', '==', userId)
      .offset(offset)
      .limit(pageSize)
      .get();

    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    const hasNextPage = snapshot.size === pageSize;

    return NextResponse.json({
      products,
      pagination: {
        currentPage: page,
        hasNextPage,
      },
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Erro ao buscar produtos', error: (error as Error).message }, { status: 500 });
  }
}
