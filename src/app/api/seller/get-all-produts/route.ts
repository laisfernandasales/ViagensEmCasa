import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/services/database/firebaseAdmin';
import { auth } from '@/services/auth/auth';

export async function GET(req: NextRequest) {
  try {
    // Verifica a sessão do usuário
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;

    // Busca todos os produtos do vendedor autenticado
    const productsRef = firestore.collection('products');
    const snapshot = await productsRef.where('userId', '==', userId).get();

    // Caso nenhum produto seja encontrado, retorna uma lista vazia
    if (snapshot.empty) {
      return NextResponse.json({ products: [] }, { status: 200 });
    }

    // Mapeia os documentos para um array de produtos
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    // Em caso de erro, retorna a mensagem de erro
    return NextResponse.json({ message: 'Erro ao buscar produtos', error: (error as Error).message }, { status: 500 });
  }
}
