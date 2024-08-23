import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';
import { auth } from '@/services/auth/auth';
import { z } from 'zod';
import { firestore } from '@/services/database/firebaseAdmin';
import { generateVerificationCode, saltAndHashVerificationCode } from '@/services/auth/codes';

const sendVerificationSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { email } = sendVerificationSchema.parse(body);

    if (session.user.email !== email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const verificationCode = generateVerificationCode();

    const hash = await saltAndHashVerificationCode(verificationCode);

    sgMail.setApiKey(process.env.SENDGRID_API_KEY ?? '');

    const msg = {
      to: email,
      from: 'viagensemcasa@gmail.com',
      subject: 'Seu Código de Verificação',
      text: `Seu código de verificação é ${verificationCode}`,
      html: `<p>Seu código de verificação é <strong>${verificationCode}</strong></p>`,
    };

    await sgMail.send(msg);

    const verificationCodeExpiresAt = new Date(Date.now() + 3600000);

    const userDoc = await firestore.collection('users').doc(session.user.id).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    await userDoc.ref.update({
      verificationCodeHash: hash,
      verificationCodeExpiresAt,
    });

    return NextResponse.json({ message: 'Verification code sent successfully' }, { status: 200 });

  } catch (error) {
    console.error(error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json({ error: 'Failed to send verification email', details: errorMessage }, { status: 500 });
  }
}
