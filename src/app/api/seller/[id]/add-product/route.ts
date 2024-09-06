import { firestore, storage, realtimeDatabase } from '@/services/database/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/services/auth/auth';
import fetch from 'node-fetch';

type VersionIdResponse = {
  newVersionId: string;
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ errorCode: 401 }, { status: 401 });
    }

    const baseUrl = process.env.NEXTAUTH_URL;
    if (!baseUrl) {
      throw new Error('NEXTAUTH_URL is not defined');
    }

    const versionIdResponse = await fetch(`${baseUrl}/api/seller/incrementVersionId`, {
      method: 'POST'
    });

    if (!versionIdResponse.ok) {
      throw new Error('Failed to generate version ID');
    }

    const { newVersionId } = await versionIdResponse.json() as VersionIdResponse;

    const userId = session.user.id;
    const formData = await req.formData();
    const productId = firestore.collection('products').doc().id;

    const productName = formData.get('productName') as string;
    const description = formData.get('description') as string;
    const price = Number(formData.get('price'));
    const stockQuantity = Number(formData.get('stockQuantity'));
    const weight = formData.get('weight') as string;
    const productStatus = formData.get('productStatus') as string;
    const category = formData.get('category') as string;

    if (!productName || !description || price === undefined || !weight || !category || !productStatus) {
      return NextResponse.json({ errorCode: 4001 }, { status: 400 });
    }

    if (price < 0) {
      return NextResponse.json({ errorCode: 4002 }, { status: 400 });
    }

    if (stockQuantity === 0 && productStatus === 'Disponível') {
      return NextResponse.json({ errorCode: 4003 }, { status: 400 });
    }

    const imageUrls: string[] = [];
    const images: File[] = [];

    formData.forEach((value, key) => {
      if (key.startsWith('image') && value instanceof File) {
        images.push(value);
      }
    });

    if (images.length === 0) {
      return NextResponse.json({ errorCode: 4004 }, { status: 400 });
    }

    await Promise.all(images.map(async (image) => {
      const storageRef = storage.file(`products_images/${productId}/${image.name}`);
      await storageRef.save(Buffer.from(await image.arrayBuffer()), { contentType: image.type });
      const [url] = await storageRef.getSignedUrl({ action: 'read', expires: '03-01-2500' });
      imageUrls.push(url);
    }));

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
      versionId: newVersionId,
      createdAt: FieldValue.serverTimestamp(),
      enabled: true,
    };

    const docRef = await firestore.collection('products').add(productData);
    const generatedProductId = docRef.id;

    await firestore
      .collection('productsHistory')
      .doc(generatedProductId)
      .collection('versions')
      .doc(newVersionId)
      .set({
        productName: productData.productName,
        description: productData.description,
        price: productData.price,
        createdAt: FieldValue.serverTimestamp(),
      });

    const notificationRef = firestore.collection('users').doc(userId).collection('notifications').doc();
    const notificationData = {
      title: 'Produto Criado com Sucesso',
      message: `Seu produto "${productData.productName}" foi criado e está ativo no mercado.`,
      isRead: false,
      isNotified: false,
      timestamp: Date.now(),
    };

    await notificationRef.set(notificationData);

    const notificationAlertRef = realtimeDatabase.ref(`notifications_alerts/${userId}`);
    await notificationAlertRef.set({
      notificationId: notificationRef.id,
      timestamp: notificationData.timestamp,
    });

    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    return NextResponse.json({ errorCode: 5000 }, { status: 500 });
  }
}
