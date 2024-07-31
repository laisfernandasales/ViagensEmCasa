import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ message: 'API working' });
}

export interface Product {
  id: string;
  productName: string;
  price: string;
  description: string;
  image: string;
  category: string;
  stockQuantity: number;
  weight: string;
  productStatus: string;
}
