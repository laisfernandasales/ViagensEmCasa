import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/services/database/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const packageData = await req.json();

    // Cria um novo documento na coleção "packages" com os dados do pacote
    const newPackageRef = await firestore.collection('packages').add({
      packageName: packageData.packageName,
      description: packageData.description,
      price: parseFloat(packageData.price),
      hotels: packageData.hotels,
      restaurants: packageData.restaurants,
      museumTickets: packageData.museumTickets,
      createdAt: new Date(),
    });

    return NextResponse.json({ id: newPackageRef.id, ...packageData }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar pacote:', error);
    return NextResponse.json({ error: 'Erro ao criar pacote' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const packagesCollection = firestore.collection('packages');
    const snapshot = await packagesCollection.orderBy('createdAt', 'desc').get();

    const packages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ packages }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar pacotes:', error);
    return NextResponse.json({ error: 'Erro ao buscar pacotes' }, { status: 500 });
  }
}
