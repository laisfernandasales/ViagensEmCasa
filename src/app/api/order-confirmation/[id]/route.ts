import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  return NextResponse.json({ message: `Order confirmation for ID: ${id}` });
}


export async function POST(request: Request) {
  const formData = await request.json();

  const productData = {
    id: 'unique-product-id',
    productName: formData.productName as string,
    description: formData.description as string,
    price: Number(formData.price),
    image: formData.image as string,
    category: formData.category as string,
    stockQuantity: Number(formData.stockQuantity),
    weight: Number(formData.weight),
    productStatus: formData.productStatus as string,
    userId: formData.userId as string,
    versionId: formData.versionId as string,
    createdAt: new Date().toISOString(),
    enabled: true,
  };

  return NextResponse.json({ message: 'Product created', data: productData });
}
