import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { firestore } from '@/services/database/firebaseAdmin';
import { auth } from '@/services/auth/auth';

const profileUpdateSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  shippingAddress: z.string().optional().nullable(),
  billingAddress: z.string().optional().nullable(),
});

const handleProfileUpdate = async (req: NextRequest) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const uid = session.user.id;

    let body: Record<string, any>;
    try {
      body = await req.json();
    } catch (err) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const parsedData = profileUpdateSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsedData.error.errors }, { status: 400 });
    }

    const {
      name,
      phone = null,
      birthDate = null,
      gender = null,
      shippingAddress = null,
      billingAddress = null,
    } = parsedData.data;

    const userDoc = firestore.collection('users').doc(uid);
    const userSnapshot = await userDoc.get();

    if (!userSnapshot.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userSnapshot.data();
    const updatedData: Partial<typeof userData> = {
      ...(userData?.name !== name && { name }),
      ...(userData?.phone !== phone && { phone }),
      ...(userData?.birthDate !== birthDate && { birthDate }),
      ...(userData?.gender !== gender && { gender }),
      ...(userData?.shippingAddress !== shippingAddress && { shippingAddress }),
      ...(userData?.billingAddress !== billingAddress && { billingAddress }),
    };

    if (Object.keys(updatedData).length === 0) {
      return NextResponse.json({ message: 'No changes detected' }, { status: 200 });
    }

    await userDoc.update(updatedData);

    return NextResponse.json({ ...userData, ...updatedData }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
};

export async function POST(req: NextRequest) {
  return await handleProfileUpdate(req);
}
