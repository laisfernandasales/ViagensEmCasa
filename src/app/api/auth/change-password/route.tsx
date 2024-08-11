import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/services/auth/auth';
import { firestore } from '@/services/database/firebaseAdmin';
import { z } from 'zod';
import { verifyPassword, saltAndHashPassword } from '@/services/auth/password';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8),
  confirmPassword: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { currentPassword, newPassword, confirmPassword } = changePasswordSchema.parse(await req.json());

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'New passwords do not match' }, { status: 400 });
    }

    const userDoc = await firestore.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    if (!userData) {
      return NextResponse.json({ error: 'User data is missing' }, { status: 404 });
    }

    const isPasswordValid = await verifyPassword(userData.password, currentPassword);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    const hashedNewPassword = await saltAndHashPassword(newPassword);
    await userDoc.ref.update({ password: hashedNewPassword });

    return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    console.error('Error updating password:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
