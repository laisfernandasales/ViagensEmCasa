import { collection, query, where, getDocs } from 'firebase/firestore';
import { database } from '../lib/firebase';

// Defina a interface User aqui
interface User {
  id: string;
  email: string;
  password: string;
  role: string; // Hash da senha
  // Adicione outras propriedades conforme necessário
}

// Função para buscar usuário no Firestore
export const getUserFromDb = async (email: string): Promise<User | null> => {
  try {
    const usersRef = collection(database, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null; // Nenhum usuário encontrado
    }

    // Retorna o primeiro usuário encontrado
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data() as User;

    return {
      id: userDoc.id,
      email: userData.email,
      password: userData.password,
      role: userData.role, // Hash da senha
      // Adicione outras propriedades conforme necessário
    } as User;
  } catch (error) {
    console.error('Error getting user from Firestore:', error);
    throw new Error('Error getting user from Firestore');
  }
};
