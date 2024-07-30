import { NextRequest, NextResponse } from 'next/server';
import { firestore, storage } from '../../../../../services/database/firebaseAdmin'; // Certifique-se de que o caminho está correto
import { FieldValue } from 'firebase-admin/firestore';
import { auth } from '@/services/auth/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const formData = await req.formData();
    const productName = formData.get('productName') as string;
    const description = formData.get('description') as string;
    const price = formData.get('price') as string;
    const category = formData.get('category') as string;
    const stockQuantity = formData.get('stockQuantity') as string;
    const dimensions = formData.get('dimensions') as string;
    const weight = formData.get('weight') as string;
    const productStatus = formData.get('productStatus') as string;

    const images: File[] = [];
    formData.forEach((value, key) => {
      if (key.startsWith('image') && value instanceof File) {
        images.push(value);
      }
    });

    console.log("Dados recebidos:", { productName, description, price, category, images });

    const imageUrls: string[] = [];
    const productId = firestore.collection('products').doc().id;

    for (const image of images) {
      const storageRef = storage.file(`products_images/${productId}/${image.name}`);
      await storageRef.save(Buffer.from(await image.arrayBuffer()), {
        contentType: image.type,
      });
      const [url] = await storageRef.getSignedUrl({ action: 'read', expires: '03-01-2500' });
      imageUrls.push(url);
    }

    const docRef = await firestore.collection('products').add({
      productName,
      description,
      price,
      category,
      stockQuantity,
      dimensions,
      weight,
      productStatus,
      images: imageUrls,
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
