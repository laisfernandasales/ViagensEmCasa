import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';
import { z } from 'zod';
import { firestore } from '@/services/database/firebaseAdmin';
import { generateVerificationCode, saltAndHashVerificationCode } from '@/services/auth/codes';

const sendResetCodeSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = sendResetCodeSchema.parse(body);

    const usersCollection = firestore.collection('users');
    const emailQuery = await usersCollection.where('email', '==', email).get();

    if (emailQuery.empty) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }

    const userDoc = emailQuery.docs[0];
    const verificationCode = generateVerificationCode();
    const hash = await saltAndHashVerificationCode(verificationCode);
    const verificationCodeExpiresAt = new Date(Date.now() + 3600000);

    await userDoc.ref.update({
      resetPasswordCode: hash,
      resetPasswordExpiresAt: verificationCodeExpiresAt,
      resetPasswordAttempts: 0,
    });

    sgMail.setApiKey(process.env.SENDGRID_API_KEY ?? '');

    const msg = {
      to: email,
      from: 'viagensemcasa@gmail.com',
      subject: 'Código para Resetar Senha',
      text: `Seu código para resetar a senha é ${verificationCode}`,
      html: `<p>Seu código para resetar a senha é <strong>${verificationCode}</strong></p>`,
    };

    await sgMail.send(msg);

    return NextResponse.json({ message: 'Reset code sent successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error sending reset password code:', error);
  
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  
    return NextResponse.json({ error: 'Failed to send reset password code', details: errorMessage }, { status: 500 });
  }
}
