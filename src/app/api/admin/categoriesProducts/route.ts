import { NextResponse } from 'next/server';
import { firestore } from '@/services/database/firebaseAdmin';

export async function GET() {
  try {
    const snapshot = await firestore.collection('categories').get();
    const categories = snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      enabled: doc.data().enabled || false,
    }));
    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    const categoryRef = firestore.collection('categories').doc();
    await categoryRef.set({ name, enabled: true });
    return NextResponse.json({ id: categoryRef.id, name, enabled: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add category' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, name } = await req.json();

    if (!id || !name) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const categoryRef = firestore.collection('categories').doc(id);
    const doc = await categoryRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    await categoryRef.update({ name });
    return NextResponse.json({ id, name }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, enabled } = await req.json();

    if (!id || typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const categoryRef = firestore.collection('categories').doc(id);
    const doc = await categoryRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    await categoryRef.update({ enabled });
    return NextResponse.json({ id, enabled }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to toggle category status' }, { status: 500 });
  }
}
