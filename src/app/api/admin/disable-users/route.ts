import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/services/database/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const { userIds } = await req.json();

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'Nenhum usuário selecionado' }, { status: 400 });
    }

    const batch = firestore.batch();

    userIds.forEach(userId => {
      const userRef = firestore.collection('users').doc(userId);
      batch.update(userRef, { accountStatus: 'disabled' }); // Atualiza o status da conta para 'disabled'
    });

    await batch.commit();

    return NextResponse.json({ message: 'Usuários desabilitados com sucesso' }, { status: 200 });
  } catch (error) {
    console.error('Erro ao desabilitar usuários:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
