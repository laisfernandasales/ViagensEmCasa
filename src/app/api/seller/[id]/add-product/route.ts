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
    
    // Processando as imagens enviadas
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

    // Validação dos campos obrigatórios
    const productName = formData.get('productName') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const category = formData.get('category') as string;
    const stockQuantity = parseInt(formData.get('stockQuantity') as string);
    const weight = formData.get('weight') as string;
    const productStatus = formData.get('productStatus') as string;

    if (!productName || !description || isNaN(price) || !category || isNaN(stockQuantity) || !weight || !productStatus) {
      return NextResponse.json({ message: 'Todos os campos obrigatórios devem ser preenchidos' }, { status: 400 });
    }

    const productData = {
      productName,
      description,
      price,
      category,
      stockQuantity,
      weight,
      productStatus,
      images: imageUrls,
      userId,
      enabled: true, 
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await firestore.collection('products').doc(productId).set(productData);

    return NextResponse.json({ message: 'Produto adicionado com sucesso', id: productId }, { status: 200 });
  } catch (error) {
    console.error('Erro ao adicionar produto:', error);
    return NextResponse.json({ message: 'Erro ao adicionar produto', error: (error as Error).message }, { status: 500 });
  }
}
