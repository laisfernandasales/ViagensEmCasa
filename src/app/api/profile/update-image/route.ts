// src/app/api/profile/update-image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/services/auth/auth';
import { storage, firestore } from '@/services/database/firebaseAdmin'; // Certifique-se de que 'storage' e 'firestore' estão configurados corretamente
import { v4 as uuidv4 } from 'uuid'; // Para gerar nomes aleatórios

const handleImageUpdate = async (req: NextRequest) => {
  try {
    // Obter o UID da sessão
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

    // Gerar um nome aleatório para a nova imagem
    const randomFileName = `${uuidv4()}.png`;
    const newImagePath = `user_images/${uid}/${randomFileName}`;
    const file = storage.file(newImagePath);

    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Salvar a nova imagem no Firebase Storage
    await new Promise<void>((resolve, reject) => {
      file.createWriteStream({ contentType: imageFile.type })
        .end(buffer)
        .on('finish', resolve)
        .on('error', reject);
    });

    // Obter URL pública da nova imagem
    const [imageUrl] = await file.getSignedUrl({
      action: 'read',
      expires: '03-09-2491'
    });

    // Atualizar o caminho da imagem no Firestore
    const userRef = firestore.collection('users').doc(uid);
    await userRef.update({
      image: imageUrl,
    });

    // Apagar a imagem antiga do Firebase Storage, se existir
    if (currentImagePath) {
      const oldFile = storage.file(currentImagePath);
      await oldFile.delete();
    }

    // Retornar uma resposta de sucesso com a nova URL da imagem
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
