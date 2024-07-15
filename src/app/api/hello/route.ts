import { NextResponse } from 'next/server';

// Handler para requisições GET
export async function GET() {
  return NextResponse.json({ message: 'Hello from Next.js!' });
}

// Handler para requisições POST
export async function POST() {
  return NextResponse.json({ message: 'POST request received' });
}
