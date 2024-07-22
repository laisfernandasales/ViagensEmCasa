import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { firestore } from '../../../services/database/firebaseAdmin';
import { auth } from '../../../services/auth/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await auth();

  if (!session || !session.user || typeof session.user.id !== 'string') {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const userId = session.user.id;

  try {
    const userDoc = await firestore.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    return res.status(200).json({ user: userData });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
