# ✈️ Viagens em Casa

> Plataforma digital para fomentar a economia local de regiões menos populares — conectando pequenos produtores e comerciantes ao mercado nacional.

---

## 📖 Sobre o Projecto

**Viagens em Casa** é um projecto de fim de curso que combina comércio e turismo numa única plataforma digital. O objectivo é dar visibilidade a regiões menos populares de Portugal, ligando pequenos produtores e comerciantes locais a consumidores e turistas de todo o país.

A plataforma inclui dois módulos principais:

- 🛒 **Mercado Regional** — Marketplace de produtos gastronómicos típicos de diversas regiões, com entrega directa ao consumidor, carrinho de compras, autenticação e painel de gestão.
- 🎟️ **Museus & Eventos** — Bilheteira virtual para museus, exposições e eventos culturais, com envio de bilhete por email via SendGrid.

> **Contexto académico:** Este projecto foi desenvolvido como demonstração técnica, provando a viabilidade de um marketplace dedicado ao comércio e turismo local. Embora não esteja em produção, representa uma solução concreta para a digitalização de regiões com menor desenvolvimento tecnológico, incentivando a adopção de tecnologia no sector turístico e comercial.

---

## 🚀 Stack Tecnológica

| Tecnologia | Utilização |
|---|---|
| **Next.js** | Framework React para frontend e API Routes |
| **Firebase** | Autenticação, base de dados Realtime e Cloud Storage |
| **Tailwind CSS** | Estilização da interface |
| **SendGrid** | Envio de emails e bilhetes |
| **Cloud Storage** | Armazenamento de ficheiros e imagens |
| **GitLab CI** | CI/CD e deploy automático |

---

## ✨ Funcionalidades em Destaque

### 🌍 Internacionalização
Suporte a múltiplos idiomas (PT, ES, EN) via **i18Next**, pensado para alcançar emigrantes e turistas internacionais.

### 🔐 Autenticação Segura
Login por email, Google OAuth e protecção contra bots com **reCAPTCHA v2**, usando Firebase Auth.

### 🔔 Notificações em Tempo Real
Actualizações automáticas via **Firebase Realtime Database** para stocks, reservas e estado de pedidos.

### ⭐ Avaliações e Comentários
Sistema de feedback de clientes em produtos e eventos, para promover transparência e confiança.

### 🏪 Gestão de Vendedores
Painel dedicado a vendedores, com ferramentas de moderação de conteúdo e gestão de catálogo.

---

## 🗂️ Módulos do Projecto

### 🛒 Mercado Regional
Produtos gastronómicos típicos de diversas regiões do país, com entrega directa ao consumidor. Inclui:
- Carrinho de compras
- Autenticação de utilizadores
- Painel de gestão de produtos e encomendas

### 🎟️ Museus & Eventos
Venda online de bilhetes para museus, exposições e eventos culturais. Inclui:
- Pesquisa e reserva de eventos
- Envio automático de bilhete por email via SendGrid
- Gestão de disponibilidade em tempo real

---

## ⚙️ Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- Conta Firebase
- Conta SendGrid
- Conta GitHub (para Actions)

### 1. Clonar o repositório
```bash
git clone https://github.com/utilizador/viagens-em-casa.git
cd viagens-em-casa
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
Cria um ficheiro `.env.local` na raiz do projecto com as seguintes variáveis:

```env
# NextAuth
AUTH_SECRET=                        # gera com: openssl rand -base64 32
AUTH_TRUST_HOST=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000

# Firebase (cliente)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBjmW2g_IFCaWjRw-D4sTQ1W7dl4104Cfg
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=final-project-firebase-d41d9.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=final-project-firebase-d41d9
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=final-project-firebase-d41d9.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=98818977714
NEXT_PUBLIC_FIREBASE_APP_ID=1:98818977714:web:db23629080dea7c3dcbeab
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://final-project-firebase-d41d9-default-rtdb.europe-west1.firebasedatabase.app/

# Firebase Admin SDK (escolhe uma das opções)
# Opção A — via ficheiro service account
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json

# Opção B — via variáveis individuais
FIREBASE_PROJECT_ID=final-project-firebase-d41d9
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-9yqfe@final-project-firebase-d41d9.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=                # conteúdo do service-account.json

# SendGrid
SENDGRID_API_KEY=                    # chave privada SendGrid
SEND_GRID_RECOVER=                   # chave de recuperação SendGrid

# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Le3GyUqAAAAAPUNBi3dH_uEs5FhtYtWTIs_xB-Z
RECAPTCHA_SECRET_KEY=                # chave secreta reCAPTCHA
```

### 4. Iniciar o servidor de desenvolvimento
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) no browser.

---

## 🚢 Deploy

O projecto usa **GitLab CI** para CI/CD automático (`.gitlab-ci.yml`). A cada push para a branch `main`, o pipeline executa testes e faz deploy automaticamente.

```bash
# Build de produção
npm run build

# Iniciar em produção
npm start
```

---

## 📁 Estrutura do Projecto

```
FINAL_PROJECT/
├── public/                        # Assets estáticos
├── report/                        # Relatório académico
├── src/
│   ├── app/
│   │   ├── [locale]/              # Rotas internacionalizadas (PT, ES, EN)
│   │   │   ├── about/             # Página sobre o projecto
│   │   │   ├── admin/             # Painel de administração
│   │   │   │   ├── categoriesProducts/   # Gestão de categorias de produtos
│   │   │   │   ├── categoriesTickets/    # Gestão de categorias de bilhetes
│   │   │   │   ├── products/             # Gestão de produtos
│   │   │   │   ├── request-sellers/      # Pedidos de registo de vendedores
│   │   │   │   ├── sales-history-products/ # Histórico de vendas
│   │   │   │   ├── tourism/ticket/       # Gestão de bilhetes de turismo
│   │   │   │   └── users/                # Gestão de utilizadores
│   │   │   ├── cart/              # Carrinho de compras
│   │   │   ├── checkout/          # Checkout e pagamento
│   │   │   ├── marketplace/       # Módulo Mercado Regional
│   │   │   ├── profile/           # Perfil do utilizador
│   │   │   ├── ticketplace/       # Módulo Museus & Eventos
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   └── api/                   # API Routes (Next.js)
│   ├── components/
│   │   ├── common/                # Componentes partilhados
│   │   └── modals/                # Modais reutilizáveis
│   ├── hooks/                     # Custom React Hooks
│   ├── messages/                  # Ficheiros i18n (PT, ES, EN)
│   ├── services/
│   │   ├── auth/                  # Autenticação Firebase
│   │   ├── cart/                  # Lógica do carrinho
│   │   ├── context/               # React Context providers
│   │   ├── database/              # Operações Firebase Realtime DB
│   │   ├── intl/                  # Configuração i18Next
│   │   └── themes/                # Gestão de temas
│   ├── types/                     # TypeScript types/interfaces
│   └── middleware.ts              # Middleware de i18n e autenticação
├── .env.local                     # Variáveis de ambiente (não incluído no repo)
├── .eslintrc.json
├── .gitignore
├── .gitlab-ci.yml                 # Pipeline CI/CD GitLab
├── next.config.mjs
├── next-sitemap.config.js
├── package.json
└── postcss.config.mjs
```

---

## 👥 Autores

Desenvolvido por **Lais Melo** & **Carlos Montes**


