import { NextResponse } from 'next/server';
import { firestore } from '@/services/database/firebaseAdmin';  // Adaptar para a tua configuração do Firebase

export async function GET() {
  try {
    const snapshot = await firestore.collection('categoriesTickets').get();
    const categories = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Error fetching categories' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const categoryRef = await firestore.collection('categoriesTickets').add({ name, enabled: true });
    const newCategory = await categoryRef.get();

    return NextResponse.json({ category: { id: newCategory.id, ...newCategory.data() } }, { status: 201 });
  } catch (error) {
    console.error('Error adding category:', error);
    return NextResponse.json({ error: 'Error adding category' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, name } = await req.json();

    if (!id || !name) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const categoryRef = firestore.collection('categoriesTickets').doc(id);
    const doc = await categoryRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    await categoryRef.update({ name });
    return NextResponse.json({ id, name }, { status: 200 });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Error updating category' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, enabled } = await req.json();

    if (!id || typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const categoryRef = firestore.collection('categoriesTickets').doc(id);
    const doc = await categoryRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    await categoryRef.update({ enabled });
    return NextResponse.json({ id, enabled }, { status: 200 });
  } catch (error) {
    console.error('Error toggling category status:', error);
    return NextResponse.json({ error: 'Error toggling category status' }, { status: 500 });
  }
}