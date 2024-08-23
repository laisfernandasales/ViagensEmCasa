import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/services/database/firebaseAdmin';

const incrementVersionIdLogic = (currentVersionId: string): string => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const prefixLength = 4;
  const numericLength = 12;

  let prefix = currentVersionId.slice(0, prefixLength);
  let numericPart = parseInt(currentVersionId.slice(prefixLength), 10) + 1;

  if (numericPart > 10 ** numericLength - 1) {
    numericPart = 1;
    prefix = incrementPrefix(prefix, letters);
  }

  return `${prefix}${numericPart.toString().padStart(numericLength, '0')}`;
};

const incrementPrefix = (prefix: string, letters: string): string => {
  let newPrefix = '';
  let carry = 1;

  for (let i = prefix.length - 1; i >= 0; i--) {
    const currentIndex = letters.indexOf(prefix[i]) + carry;

    if (currentIndex >= letters.length) {
      carry = 1;
      newPrefix = letters[0] + newPrefix;
    } else {
      carry = 0;
      newPrefix = letters[currentIndex] + newPrefix;
    }
  }

  if (carry === 1) {
    newPrefix = letters[0] + newPrefix;
  }

  return newPrefix;
};

export async function POST(req: NextRequest) {
  try {
    const versionDocRef = firestore.collection('productsHistory').doc('globalVersionId');

    const newVersionId = await firestore.runTransaction(async (transaction) => {
      const versionDoc = await transaction.get(versionDocRef);
      if (!versionDoc.exists) {
        throw new Error("Version control document does not exist!");
      }

      const currentVersionId = versionDoc.data()?.lastVersionId as string;
      const nextVersionId = incrementVersionIdLogic(currentVersionId);

      transaction.update(versionDocRef, { lastVersionId: nextVersionId });

      return nextVersionId;
    });

    return NextResponse.json({ newVersionId });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to increment version ID' }, { status: 500 });
  }
}
