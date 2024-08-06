// app/api/seller/edit-product/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { firestore, storage } from '@/services/database/firebaseAdmin';
import { auth } from '@/services/auth/auth';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const productId = params.id; // Extração correta do ID
    const productRef = firestore.collection('products').doc(productId);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const product = productDoc.data();
    return NextResponse.json({ product }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch product', error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const productId = params.id; // Extração correta do ID
    const productRef = firestore.collection('products').doc(productId);
    const formData = await req.formData();

    const productData: any = {
      productName: formData.get('productName'),
      description: formData.get('description'),
      price: formData.get('price'),
      category: formData.get('category'),
      stockQuantity: formData.get('stockQuantity'),
      weight: formData.get('weight'),
      productStatus: formData.get('productStatus'),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const newImages: File[] = [];
    formData.forEach((value, key) => {
      if (key === 'images' && value instanceof File) {
        newImages.push(value);
      }
    });

    const existingProductDoc = await productRef.get();
    if (!existingProductDoc.exists) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const existingProduct = existingProductDoc.data();
    let imageUrls: string[] = existingProduct?.images || [];

    if (newImages.length > 0) {
      // Delete old images
      const deletePromises = imageUrls.map((url) => {
        const fileName = url.split('/').pop();
        return storage.file(`products_images/${productId}/${fileName}`).delete();
      });
      await Promise.all(deletePromises);

      // Upload new images
      imageUrls = [];
      const uploadPromises = newImages.map(async (image) => {
        const storageRef = storage.file(`products_images/${productId}/${image.name}`);
        await storageRef.save(Buffer.from(await image.arrayBuffer()), { contentType: image.type });
        const [url] = await storageRef.getSignedUrl({ action: 'read', expires: '03-01-2500' });
        imageUrls.push(url);
      });
      await Promise.all(uploadPromises);

      productData.images = imageUrls;
    }

    await productRef.update(productData);

    return NextResponse.json({ message: 'Product updated successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to update product', error: (error as Error).message }, { status: 500 });
  }
}
