import { NextRequest, NextResponse } from 'next/server';
import { firestore, storage } from '@/services/database/firebaseAdmin';
import { v4 as uuidv4 } from 'uuid';
import { auth } from '@/services/auth/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const formData = await req.formData();
    const companyName = formData.get('companyName')?.toString();
    const businessAddress = formData.get('businessAddress')?.toString();
    const phoneNumber = formData.get('phoneNumber')?.toString();
    const website = formData.get('website')?.toString() || null;
    const nif = formData.get('nif')?.toString();
    const businessDescription = formData.get('businessDescription')?.toString();
    const pdfFile = formData.get('pdfFile') as Blob;

    if (!companyName || !businessAddress || !phoneNumber || !nif || !businessDescription || !pdfFile) {
      return NextResponse.json({ error: 'Todos os campos obrigatórios devem ser preenchidos, incluindo o arquivo PDF' }, { status: 400 });
    }

    const userId = session.user.id;
    const sellerRequestsRef = firestore.collection('sellerRequests');
    const newSellerRequest = await sellerRequestsRef.add({
      companyName,
      businessAddress,
      phoneNumber,
      website,
      nif,
      businessDescription,
      status: 'pending',
      createdAt: new Date(),
      userId,
    });

    const requestId = newSellerRequest.id;
    const pdfFileName = `${uuidv4()}.pdf`;
    const pdfFileBuffer = Buffer.from(await pdfFile.arrayBuffer());
    const folderPath = `sellerRequests/${requestId}/`;
    const fileUpload = storage.file(`${folderPath}${pdfFileName}`);

    await fileUpload.save(pdfFileBuffer, {
      metadata: {
        contentType: 'application/pdf',
        metadata: {
          firebaseStorageDownloadTokens: uuidv4(),
        },
      },
      predefinedAcl: 'publicRead',
    });

    const pdfFileUrl = `https://storage.googleapis.com/${storage.name}/${folderPath}${pdfFileName}`;

    await sellerRequestsRef.doc(requestId).update({
      pdfFileUrl,
    });

    return NextResponse.json({ message: 'Solicitação enviada com sucesso', id: requestId }, { status: 201 });
  } catch (error) {
    console.error('Erro ao enviar solicitação de vendedor:', error);
    return NextResponse.json({ error: 'Erro ao enviar solicitação de vendedor' }, { status: 500 });
  }
}
