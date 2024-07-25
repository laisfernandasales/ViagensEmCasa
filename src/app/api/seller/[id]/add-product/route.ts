import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '../../../../../services/database/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { auth } from '@/services/auth/auth';

export async function POST(req: NextRequest) {
  try {
    // Obter a sessão de autenticação
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const { productName, description, price, category, image } = await req.json();
    console.log("Dados recebidos:", { productName, description, price, category, image });

    // Salvar os dados do produto no Firestore
    const docRef = await firestore.collection('products').add({
      productName,
      description,
      price,
      category,
      image, // Adicionar a imagem se fornecida
      createdAt: FieldValue.serverTimestamp(),
    });

    console.log("Produto adicionado com sucesso, ID:", docRef.id);
    return NextResponse.json({ message: 'Produto adicionado com sucesso', id: docRef.id }, { status: 200 });
  } catch (error) {
    console.error("Erro ao adicionar produto:", error);
    return NextResponse.json({ message: 'Erro ao adicionar produto', error: (error as Error).message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Método não permitido' }, { status: 405 });
}