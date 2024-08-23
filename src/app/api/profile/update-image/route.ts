import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/services/auth/auth';
import { storage, firestore } from '@/services/database/firebaseAdmin';
import { v4 as uuidv4 } from 'uuid';

const handleImageUpdate = async (req: NextRequest) => {
  try {
    const session = await auth();
    const uid = session?.user?.id;
    if (!uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const imageFile = formData.get('image') as File;
    const currentImagePath = formData.get('currentImagePath') as string;

    if (!imageFile) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    const randomFileName = `${uuidv4()}.png`;
    const newImagePath = `user_images/${uid}/${randomFileName}`;
    const file = storage.file(newImagePath);

    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await new Promise<void>((resolve, reject) => {
      file.createWriteStream({ contentType: imageFile.type })
        .end(buffer)
        .on('finish', resolve)
        .on('error', reject);
    });

    const [imageUrl] = await file.getSignedUrl({
      action: 'read',
      expires: '03-09-2491'
    });

    const userRef = firestore.collection('users').doc(uid);
    await userRef.update({
      image: imageUrl,
    });

    if (currentImagePath) {
      const oldFile = storage.file(currentImagePath);
      await oldFile.delete();
    }

    return NextResponse.json({ message: 'Image updated successfully', imagePath: imageUrl }, { status: 200 });
  } catch (error) {
    console.error('Error updating image:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
};

export async function POST(req: NextRequest) {
  return handleImageUpdate(req);
}

export async function GET() {
  return NextResponse.json({ message: 'This is the image update endpoint' });
}
