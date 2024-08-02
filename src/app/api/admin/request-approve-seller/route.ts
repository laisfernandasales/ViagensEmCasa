import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/services/database/firebaseAdmin';
import { auth } from '@/services/auth/auth'; // Importando o serviço auth

export async function POST(req: NextRequest) {
  try {
    // Obtenha a sessão ou informações do usuário autenticado
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    // Extrai o requestId do corpo da requisição
    const { requestId } = await req.json();

    if (!requestId) {
      return NextResponse.json({ error: 'Request ID não fornecido' }, { status: 400 });
    }

    // Referência à solicitação de vendedor
    const sellerRequestRef = firestore.collection('sellerRequests').doc(requestId);
    const sellerRequestDoc = await sellerRequestRef.get();

    if (!sellerRequestDoc.exists) {
      return NextResponse.json({ error: 'Solicitação não encontrada' }, { status: 404 });
    }

    const sellerRequestData = sellerRequestDoc.data();

    // Atualiza o status da solicitação para 'approved'
    await sellerRequestRef.update({ status: 'approved' });

    // Atualiza o papel do usuário para 'seller'
    const userId = sellerRequestData?.userId;
    if (userId) {
      const userRef = firestore.collection('users').doc(userId);
      await userRef.update({ role: 'seller' });
    }

    return NextResponse.json({ message: 'Solicitação aprovada com sucesso e usuário atualizado para vendedor' }, { status: 200 });
  } catch (error) {
    console.error('Erro ao aprovar solicitação de vendedor:', error);
    return NextResponse.json({ error: 'Erro ao aprovar solicitação de vendedor' }, { status: 500 });
  }
}
