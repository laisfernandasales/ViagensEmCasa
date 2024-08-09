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
  phone: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  shippingAddress: z.string().optional().nullable(),
  billingAddress: z.string().optional().nullable(),
  accountStatus: z.enum(['healthy', 'disabled']).default('healthy'),
});

const handleRegister = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const {
      username,
      email,
      password,
      phone = null,
      birthDate = null,
      gender = null,
      shippingAddress = null,
      billingAddress = null,
      accountStatus = 'healthy',
    } = registerSchema.parse(body);

    const passwordHash = await saltAndHashPassword(password);

    const usersCollection = firestore.collection('users');

    // Check if username or email already exists
    const emailQuery = await usersCollection.where('email', '==', email).get();
    const usernameQuery = await usersCollection.where('username', '==', username).get();

    if (!emailQuery.empty) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    if (!usernameQuery.empty) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }

    const newUserDoc = await usersCollection.add({
      username,
      email,
      password: passwordHash,
      phone,
      birthDate,
      gender,
      shippingAddress,
      billingAddress,
      accountStatus,
      role: 'client',
      verifiedEmail: false,
      verificationCodeHash: null, 
      verificationCodeExpiresAt: null, 
      verificationAttempts: 0,
    });

    const defaultImagePath = join(process.cwd(), 'public', 'images', 'profile.png');
    const imagePath = `user_images/${newUserDoc.id}/profile.png`;
    const file = storage.file(imagePath);

    await new Promise<void>((resolve, reject) => {
      createReadStream(defaultImagePath)
        .pipe(file.createWriteStream({ contentType: 'image/png' }))
        .on('finish', () => resolve())
        .on('error', (err: Error) => reject(err));
    });

    const [imageUrl] = await file.getSignedUrl({
      action: 'read',
      expires: '03-09-2491'
    });

    await newUserDoc.update({ image: imageUrl });

    return NextResponse.json({ message: 'User registered successfully', userId: newUserDoc.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
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