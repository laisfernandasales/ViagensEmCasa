import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { firestore, storage } from '@/services/database/firebaseAdmin';
import { saltAndHashPassword } from '@/services/auth/password';
import { createReadStream } from 'fs';
import { join } from 'path';

const registerSchema = z.object({
  username: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

const handleRegister = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { username, email, password } = registerSchema.parse(body);

    const passwordHash = await saltAndHashPassword(password);

    // Check if user already exists
    const usersCollection = firestore.collection('users');
    const userQuery = await usersCollection.where('email', '==', email).get();

    if (!userQuery.empty) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Create a new user document
    const newUserDoc = await usersCollection.add({
      username,
      email,
      password: passwordHash,
      role: 'client',
    });

    // Upload the default profile image to Firebase Storage
    const defaultImagePath = join(process.cwd(), 'public', 'images', 'profile.png');
    const imagePath = `user_images/${newUserDoc.id}/profile.png`;
    const file = storage.file(imagePath);

    await new Promise<void>((resolve, reject) => {
      createReadStream(defaultImagePath)
        .pipe(file.createWriteStream({ contentType: 'image/png' }))
        .on('finish', () => resolve())
        .on('error', (err: Error) => reject(err));
    });

    // Get the signed URL of the uploaded image
    const [imageUrl] = await file.getSignedUrl({
      action: 'read',
      expires: '03-09-2491' // Expiração no futuro para garantir que o URL seja válido
    });

    // Update the user document with the image URL
    await newUserDoc.update({ image: imageUrl });

    return NextResponse.json({ message: 'User registered successfully', userId: newUserDoc.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }
    console.error('Error registering user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
};

export async function POST(req: NextRequest) {
  return await handleRegister(req);
}

export async function GET() {
  return NextResponse.json({ message: 'This is the registration endpoint' });
}
