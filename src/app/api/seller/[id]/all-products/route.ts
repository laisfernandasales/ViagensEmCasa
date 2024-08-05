import { firestore } from '@/services/database/firebaseAdmin';
import { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '@/services/auth/auth';  // Importando a autenticação

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Obter sessão do usuário autenticado
    const session = await auth();
    if (!session || !session.user) {
      return res.status(401).json({ message: 'Não autorizado' });
    }

    // Obter ID do usuário autenticado
    const userId = session.user.id;

    // Verificar o ID fornecido na URL
    const { id } = req.query;
    if (id !== userId) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    // Consultar produtos no Firestore associados ao userId
    const productsRef = firestore.collection('products').where('userId', '==', userId);
    const snapshot = await productsRef.get();

    // Retornar produtos ou lista vazia se não houver produtos
    const products = snapshot.empty
      ? []
      : snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

    return res.status(200).json({ products });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar produtos', error: (error as Error).message });
  }
}
