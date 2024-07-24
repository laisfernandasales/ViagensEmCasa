import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '../../../../../services/database/firebase';
import { collection, addDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  const { productName, description, price, category } = await req.json();

  try {
    // Save the product data to Firestore
    await addDoc(collection(firestore, 'products'), {
      productName,
      description,
      price,
      category,
    });

    return NextResponse.json({ message: 'Produto adicionado com sucesso' }, { status: 200 });
  } catch (error) {
    console.error("Erro ao adicionar produto: ", error);
    return NextResponse.json({ message: 'Erro ao adicionar produto', error }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Método não permitido' }, { status: 405 });
}
