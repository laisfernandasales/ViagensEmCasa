import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/services/database/firebaseAdmin';
import { z } from 'zod';
import { auth } from '@/services/auth/auth';
import { verifyVerificationCode } from '@/services/auth/codes';

const verifyEmailSchema = z.object({
  userId: z.string(),
  verificationCode: z.string().length(6),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { userId, verificationCode } = verifyEmailSchema.parse(body);

    if (session.user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userDoc = await firestore.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    if (!userData) {
      return NextResponse.json({ error: 'User data is missing' }, { status: 404 });
    }

    const isCodeValid = await verifyVerificationCode(userData.verificationCodeHash, verificationCode);

    if (isCodeValid && new Date() < userData.verificationCodeExpiresAt.toDate()) {
      await userDoc.ref.update({
        email: userData.newEmail, 
        newEmail: null, 
        verifiedEmail: true,
        verificationCodeHash: null,
        verificationCodeExpiresAt: null,
        verificationAttempts: 0,
      });

      return NextResponse.json({ message: 'Email verified successfully', updated: true }, { status: 200 });
    }

    await userDoc.ref.update({
      verificationAttempts: (userData.verificationAttempts || 0) + 1,
    });

    return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    console.error('Error verifying email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
  }
}
