import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { firestore } from '@/services/database/firebaseAdmin';
import { verifyVerificationCode } from '@/services/auth/codes';
import { saltAndHashPassword } from '@/services/auth/password';

const confirmResetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().min(6).max(6),
  newPassword: z.string().min(8),
  confirmPassword: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code, newPassword, confirmPassword } = confirmResetPasswordSchema.parse(body);

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    const usersCollection = firestore.collection('users');
    const emailQuery = await usersCollection.where('email', '==', email).get();

    if (emailQuery.empty) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }

    const userDoc = emailQuery.docs[0];
    const userData = userDoc.data();

    if (!userData.resetPasswordCode || !userData.resetPasswordExpiresAt) {
      return NextResponse.json({ error: 'Reset process not initiated' }, { status: 400 });
    }

    if (new Date() > userData.resetPasswordExpiresAt.toDate()) {
      return NextResponse.json({ error: 'Reset code expired' }, { status: 400 });
    }

    const isCodeValid = await verifyVerificationCode(userData.resetPasswordCode, code);
    if (!isCodeValid) {
      return NextResponse.json({ error: 'Invalid reset code' }, { status: 400 });
    }

    const passwordHash = await saltAndHashPassword(newPassword);

    await userDoc.ref.update({
      password: passwordHash,
      resetPasswordCode: null,
      resetPasswordExpiresAt: null,
      resetPasswordAttempts: 0,
    });

    return NextResponse.json({ message: 'Password reset successfully' }, { status: 200 });
} catch (error) {
    console.error('Error resetting password:', error);
  
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  
    return NextResponse.json({ error: 'Failed to reset password', details: errorMessage }, { status: 500 });
  }
}
