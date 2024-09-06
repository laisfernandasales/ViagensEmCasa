import { NextRequest, NextResponse } from 'next/server';
import { firestore, storage } from '@/services/database/firebaseAdmin';
import { auth } from '@/services/auth/auth';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const productId = params.id;
    const productRef = firestore.collection('products').doc(productId);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const product = productDoc.data();
    return NextResponse.json({ product }, { status: 200 });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ message: 'Failed to fetch product', error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const productId = params.id;
    const productRef = firestore.collection('products').doc(productId);
    const formData = await req.formData();

    const productName = formData.get('productName');
    const price = parseFloat(formData.get('price') as string);
    const stockQuantity = parseInt(formData.get('stockQuantity') as string, 10);

    if (!productName || typeof productName !== 'string' || productName.trim() === '') {
      return NextResponse.json({ message: 'Product name is required.' }, { status: 400 });
    }

    if (isNaN(price) || price < 0) {
      return NextResponse.json({ message: 'Price must be a positive number.' }, { status: 400 });
    }

    if (isNaN(stockQuantity) || stockQuantity < 0) {
      return NextResponse.json({ message: 'Stock quantity must be a non-negative integer.' }, { status: 400 });
    }

    const productData: any = {
      productName,
      description: formData.get('description'),
      price,
      category: formData.get('category'),
      stockQuantity,
      weight: formData.get('weight'),
      productStatus: formData.get('productStatus'),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const existingProductDoc = await productRef.get();
    if (!existingProductDoc.exists) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const existingProduct = existingProductDoc.data();
    let imageUrls: string[] = existingProduct?.images || [];
    const existingImages: string[] = [];

    formData.getAll('existingImages').forEach((value) => {
      if (typeof value === 'string') {
        existingImages.push(value);
      }
    });

    const newImages: File[] = [];
    formData.forEach((value, key) => {
      if (key === 'images' && value instanceof File) {
        newImages.push(value);
      }
    });

    const imagesToDelete = imageUrls.filter(url => !existingImages.includes(url));
    if (imagesToDelete.length > 0) {
      const deletePromises = imagesToDelete.map(async (url) => {
        const fileName = url.split('/').pop();
        if (fileName) {
          try {
            await storage.file(`products_images/${productId}/${fileName}`).delete();
          } catch (deleteError) {
            console.error(`Failed to delete image from storage: ${fileName}`, deleteError);
          }
        }
      });
      await Promise.all(deletePromises);
    }

    if (newImages.length > 0) {
      const uploadPromises = newImages.map(async (image) => {
        const storageRef = storage.file(`products_images/${productId}/${image.name}`);
        await storageRef.save(Buffer.from(await image.arrayBuffer()), { contentType: image.type });
        const [url] = await storageRef.getSignedUrl({ action: 'read', expires: '03-01-2500' });
        existingImages.push(url);
      });
      await Promise.all(uploadPromises);
    }

    if (existingImages.length === 0) {
      return NextResponse.json({ message: 'A product must have at least one image.' }, { status: 400 });
    }

    productData.images = existingImages;

    await productRef.update(productData);

    return NextResponse.json({ message: 'Product successfully updated.' }, { status: 200 });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ message: 'Failed to update product', error: (error as Error).message }, { status: 500 });
  }
}
