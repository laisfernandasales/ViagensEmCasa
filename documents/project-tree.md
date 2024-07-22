src/
├── app/
│   ├── layout.tsx                // Layout principal da aplicação
│   ├── page.tsx                  // Página inicial
│   ├── login/
│   │   └── page.tsx              // Página de login
│   ├── register/
│   │   └── page.tsx              // Página de registro
│   ├── forgot-password/
│   │   └── page.tsx              // Página de recuperação de senha
│   ├── marketplace/
│   │   └── page.tsx              // Listagem de todos os produtos com filtros
│   ├── profile/
│   │   └── [id]/
│   │       └── page.tsx          // Página de perfil do usuário com ID dinâmico
│   ├── cart/
│   │   └── page.tsx              // Página do carrinho de compras
│   ├── checkout/
│   │   └── page.tsx              // Página de finalização de compra
│   ├── order-confirmation/
│   │   └── [id]/
│   │       └── page.tsx          // Página de confirmação de pedido com ID dinâmico
│   ├── verify-email/
│   │   └── [token]/
│   │       └── page.tsx          // Página de verificação de e-mail
│   ├── admin/
│   │   ├── page.tsx              // Dashboard de administração
│   │   ├── users/
│   │   │   └── page.tsx          // Gerenciamento de usuários
│   │   ├── products/
│   │   │   └── page.tsx          // Gerenciamento de produtos
│   │   └── orders/
│   │       └── page.tsx          // Gerenciamento de pedidos
└── seller/
    └── [id]/
        ├── page.tsx              // Dashboard de vendedores com ID dinâmico
        ├── add-product/
        │   └── page.tsx          // Adicionar novos produtos
        ├── edit-product/
        │   └── [productId]/
        │       └── page.tsx      // Editar produtos existentes com ID dinâmico
        ├── all-products/
        │   └── page.tsx          // Listagem de todos os produtos do vendedor
        └── product/
            └── [productId]/
                └── page.tsx      // Detalhes de um produto específico
api/
├── login/
│   └── route.ts                 // API para login
├── register/
│   └── route.ts                 // API para registro
├── forgot-password/
│   └── route.ts                 // API para recuperação de senha
├── marketplace/
│   ├── route.ts                 // API para listar produtos
│   └── [id]/
│       └── route.ts             // API para detalhes de um produto específico
├── profile/
│   └── [id]/
│       └── route.ts             // API para perfil do usuário
├── order-confirmation/
│   └── [id]/
│       └── route.ts             // API para confirmação de pedido
├── verify-email/
│   └── [token]/
│       └── route.ts             // API para verificação de e-mail
├── admin/
│   ├── users/
│   │   └── route.ts             // API para gerenciamento de usuários
│   ├── products/
│   │   └── route.ts             // API para gerenciamento de produtos
│   └── orders/
│       └── route.ts             // API para gerenciamento de pedidos
└── seller/
    └── [id]/
        ├── add-product/
        │   └── route.ts         // API para adicionar produto do vendedor
        ├── edit-product/
        │   └── route.ts         // API para editar produto do vendedor
        ├── all-products/
        │   └── route.ts         // API para listar produtos do vendedor
        └── product/
            └── [productId]/
                └── route.ts     // API para detalhes de um produto específico do vendedor
