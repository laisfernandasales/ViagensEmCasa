import { NextResponse } from 'next/server';
import { firestore } from '@/services/database/firebaseAdmin';

export async function GET() {
  try {
    // Referência para a coleção de usuários no Firestore
    const usersRef = firestore.collection('users');
    const snapshot = await usersRef.get();

    // Array para armazenar os dados dos usuários
    const users = snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        ...data, // Inclui todos os campos do documento do usuário
      };
    });

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 });
  }
}
