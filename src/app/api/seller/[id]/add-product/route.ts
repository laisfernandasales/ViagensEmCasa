import { firestore, storage } from '@/services/database/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/services/auth/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    const formData = await req.formData();
    const productId = firestore.collection('products').doc().id;

    const imageUrls: string[] = [];
    const images: File[] = [];
    formData.forEach((value, key) => {
      if (key.startsWith('image') && value instanceof File) {
        images.push(value);
      }
    });

    await Promise.all(images.map(async (image) => {
      const storageRef = storage.file(`products_images/${productId}/${image.name}`);
      await storageRef.save(Buffer.from(await image.arrayBuffer()), { contentType: image.type });
      const [url] = await storageRef.getSignedUrl({ action: 'read', expires: '03-01-2500' });
      imageUrls.push(url);
    }));

    const productData = {
      productName: formData.get('productName') as string,
      description: formData.get('description') as string,
      price: formData.get('price') as string,
      category: formData.get('category') as string,
      stockQuantity: formData.get('stockQuantity') as string,
      weight: formData.get('weight') as string,
      productStatus: formData.get('productStatus') as string,
      images: imageUrls,
      userId,
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await firestore.collection('products').add(productData);

    return NextResponse.json({ message: 'Produto adicionado com sucesso', id: docRef.id }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Erro ao adicionar produto', error: (error as Error).message }, { status: 500 });
  }
}