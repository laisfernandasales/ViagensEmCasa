import { NextRequest, NextResponse } from 'next/server';
import { firestore, storage } from '@/services/database/firebaseAdmin';
import { v4 as uuidv4 } from 'uuid';
import { auth } from '@/services/auth/auth'; // Importando o serviço auth

export async function POST(req: NextRequest) {
  try {
    // Obtenha a sessão ou informações do usuário autenticado
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const userId = session.user.id;

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

    // Cria um novo documento no Firestore para obter o ID
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
      userId, // Adiciona o userId ao documento
    });

    // ID único gerado pelo Firestore
    const requestId = newSellerRequest.id;

    // Cria a pasta 'sellerRequests' e armazena o PDF na subpasta identificada pelo ID da solicitação
    const pdfFileName = `${uuidv4()}.pdf`; // Gerar um nome único para o arquivo
    const pdfFileBuffer = Buffer.from(await pdfFile.arrayBuffer()); // Converter Blob para Buffer

    // Definir o caminho do arquivo dentro da estrutura de pastas
    const folderPath = `sellerRequests/${requestId}/`; // Exemplo: 'sellerRequests/abcd1234/'
    const fileUpload = storage.file(`${folderPath}${pdfFileName}`);

    // Fazer o upload do arquivo para o Firebase Storage
    await fileUpload.save(pdfFileBuffer, {
      metadata: {
        contentType: 'application/pdf',
      },
    });

    // URL do PDF armazenado
    const pdfFileUrl = `https://storage.googleapis.com/${storage.name}/${folderPath}${pdfFileName}`;

    // Atualiza o documento no Firestore com a URL do PDF
    await sellerRequestsRef.doc(requestId).update({
      pdfFileUrl, // Adiciona a URL do PDF ao documento
    });

    return NextResponse.json({ message: 'Solicitação enviada com sucesso', id: requestId }, { status: 201 });
  } catch (error) {
    console.error('Erro ao enviar solicitação de vendedor:', error);
    return NextResponse.json({ error: 'Erro ao enviar solicitação de vendedor' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ message: 'Método GET ainda não implementado' }, { status: 501 });
}
