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
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { email } = sendVerificationSchema.parse(body);

    const verificationCode = generateVerificationCode();
    const hash = await saltAndHashVerificationCode(verificationCode);
    
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('Chave de API do SendGrid não definida.');
    }
    
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: email,
      from: 'viagensemcasa@gmail.com',
      subject: 'Código de Verificação',
      text: `O código de verificação para o seu email é ${verificationCode}`,
      html: `<p>O código de verificação para o seu email é <strong>${verificationCode}</strong></p>`,
    };

    try {
      await sgMail.send(msg);
    } catch (sendError) {
      return NextResponse.json({ error: 'Falha ao enviar o email de verificação' }, { status: 500 });
    }

    const verificationCodeExpiresAt = new Date(Date.now() + 3600000);

    const userDoc = await firestore.collection('users').doc(session.user.id).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'Utilizador não encontrado' }, { status: 404 });
    }

    await userDoc.ref.update({
      verificationCodeHash: hash,
      verificationCodeExpiresAt,
      newEmail: email, 
    });

    return NextResponse.json({ message: 'Código de verificação enviado com sucesso' }, { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido';
    return NextResponse.json({ error: 'Falha ao enviar o email de verificação', details: errorMessage }, { status: 500 });
  }
}