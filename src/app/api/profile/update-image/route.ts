import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/services/auth/auth';
import { storage } from '@/services/database/firebaseAdmin'; 

const handleImageUpdate = async (req: NextRequest) => {
  try {
    const session = await auth();
    const uid = session?.user?.id;
    if (!uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    const imagePath = `user_images/${uid}/profile.png`;
    const file = storage.file(imagePath);

    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await file.save(buffer, {
      contentType: imageFile.type,
    });

    return NextResponse.json({ message: 'Image updated successfully' }, { status: 200 });
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
