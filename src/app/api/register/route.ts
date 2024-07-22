import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { firestore } from '@/services/database/firebaseAdmin';
import { saltAndHashPassword } from '@/services/auth/password';

// Define the Zod schema for registration
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

// Helper function to handle registration
const handleRegister = async (req: NextRequest) => {
  try {
    // Parse and validate request body
    const body = await req.json();
    const { email, password } = registerSchema.parse(body);

    // Hash the password
    const passwordHash = await saltAndHashPassword(password);

    // Save user to Firestore
    const usersCollection = firestore.collection('users');
    const userQuery = await usersCollection.where('email', '==', email).get();

    if (!userQuery.empty) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const newUserDoc = await usersCollection.add({
      email,
      password: passwordHash,
      role: 'client',
    });

    return NextResponse.json({ message: 'User registered successfully', userId: newUserDoc.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }
    console.error('Error registering user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
};

// Export named function for POST method
export async function POST(req: NextRequest) {
  return await handleRegister(req);
}

// Export named function for other HTTP methods if needed
export async function GET() {
  return NextResponse.json({ message: 'This is the registration endpoint' });
}
