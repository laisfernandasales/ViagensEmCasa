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
      console.log('Unauthorized: No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { email } = sendVerificationSchema.parse(body);

    console.log(`Requested email: ${email}`);
    console.log(`Session email: ${session.user.email}`);

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


    try {
      await sgMail.send(msg);
      console.log(`Verification email sent to: ${email}`);
    } catch (sendError) {
      console.error('Error sending email:', sendError);
      return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
    }

    const verificationCodeExpiresAt = new Date(Date.now() + 3600000);


    const userDoc = await firestore.collection('users').doc(session.user.id).get();
    if (!userDoc.exists) {
      console.log('User not found in Firestore');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await userDoc.ref.update({
      verificationCodeHash: hash,
      verificationCodeExpiresAt,
      newEmail: email, 
    });

    console.log('User document updated with new email and verification code');
    return NextResponse.json({ message: 'Verification code sent successfully' }, { status: 200 });

  } catch (error) {
    console.error('API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: 'Failed to send verification email', details: errorMessage }, { status: 500 });
  }
}
