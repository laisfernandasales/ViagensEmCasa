
import { NextRequest, NextResponse } from 'next/server'; 
import { firestore } from '@/services/database/firebaseAdmin'; 
import { auth } from '@/services/auth/auth';

export async function POST(req: NextRequest) {
    try {
      const session = await auth();
      if (!session?.user) {
        return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
      }
  
      const { requestId } = await req.json();
      if (!requestId) {
        return NextResponse.json({ error: 'Request ID não fornecido' }, { status: 400 });
      }
  
      const sellerRequestRef = firestore.collection('sellerRequests').doc(requestId);
      const sellerRequestDoc = await sellerRequestRef.get();
      if (!sellerRequestDoc.exists) {
        return NextResponse.json({ error: 'Solicitação não encontrada' }, { status: 404 });
      }
  
      const { userId } = sellerRequestDoc.data() || {};
      if (!userId) {
        return NextResponse.json({ error: 'User ID não encontrado na solicitação' }, { status: 400 });
      }
  
      const userRef = firestore.collection('users').doc(userId);
      const userDoc = await userRef.get();
      if (!userDoc.exists) {
        return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
      }
  
      await Promise.all([
        sellerRequestRef.update({ status: 'approved' }),
        userRef.update({ role: 'seller' }),
      ]);
  
      return NextResponse.json({ message: 'Solicitação aprovada com sucesso e usuário atualizado para vendedor' }, { status: 200 });
    } catch (error) {
      console.error('Erro ao aprovar solicitação de vendedor:', error);
      return NextResponse.json({ error: 'Erro ao aprovar solicitação de vendedor' }, { status: 500 });
    }
  }