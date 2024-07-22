#!/bin/bash

# Criar diretórios principais dentro de src/app e src/api
mkdir -p src/app/{login,register,forgot-password,marketplace,profile/[id],verify-email/[token],order-confirmation/[id],admin/{users,products,orders},seller/[id]/{add-product,edit-product/[productId],all-products,product/[productId]}}
mkdir -p src/api/{login,register,forgot-password,marketplace/[id],profile/[id],order-confirmation/[id],verify-email/[token],admin/{users,products,orders},seller/[id]/{add-product,edit-product,all-products,product/[productId]}}

# Função para criar páginas com conteúdo padrão
create_page() {
  local path=$1
  local page_name=$2
  cat <<EOL > $path
import React from 'react';

export default function $page_name() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">$page_name</h1>
    </div>
  );
}
EOL
}

# Função para criar arquivos de API com conteúdo padrão
create_api() {
  local path=$1
  cat <<EOL > $path
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ message: 'API working' });
}
EOL
}

# Criar arquivos em src/app com conteúdo padrão
create_page src/app/login/page.tsx Login
create_page src/app/register/page.tsx Register
create_page src/app/forgot-password/page.tsx ForgotPassword
create_page src/app/marketplace/page.tsx Marketplace
create_page src/app/profile/[id]/page.tsx UserProfile
create_page src/app/cart/page.tsx Cart
create_page src/app/checkout/page.tsx Checkout
create_page src/app/order-confirmation/[id]/page.tsx OrderConfirmation
create_page src/app/verify-email/[token]/page.tsx VerifyEmail
create_page src/app/admin/page.tsx Admin
create_page src/app/admin/users/page.tsx AdminUsers
create_page src/app/admin/products/page.tsx AdminProducts
create_page src/app/admin/orders/page.tsx AdminOrders
create_page src/app/seller/[id]/page.tsx SellerDashboard
create_page src/app/seller/[id]/add-product/page.tsx AddProduct
create_page src/app/seller/[id]/edit-product/[productId]/page.tsx EditProduct
create_page src/app/seller/[id]/all-products/page.tsx AllProducts
create_page src/app/seller/[id]/product/[productId]/page.tsx ProductDetails

# Criar arquivos de API com conteúdo padrão
create_api src/api/login/route.ts
create_api src/api/register/route.ts
create_api src/api/forgot-password/route.ts
create_api src/api/marketplace/route.ts
create_api src/api/marketplace/[id]/route.ts
create_api src/api/profile/[id]/route.ts
create_api src/api/order-confirmation/[id]/route.ts
create_api src/api/verify-email/[token]/route.ts
create_api src/api/admin/users/route.ts
create_api src/api/admin/products/route.ts
create_api src/api/admin/orders/route.ts
create_api src/api/seller/[id]/add-product/route.ts
create_api src/api/seller/[id]/edit-product/route.ts
create_api src/api/seller/[id]/all-products/route.ts
create_api src/api/seller/[id]/product/[productId]/route.ts

echo "Estrutura de diretórios e arquivos criada com sucesso!"
