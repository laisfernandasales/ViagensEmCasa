# Projeto de Criação de Webpage

## Índice

1. [Configurar Chaves SSH e Clonar o Repositório](#etapa-0-configurar-chaves-ssh-e-clonar-o-repositório)
2. [Criar uma Webpage com Next.js, Tailwind CSS e DaisyUI](#etapa-1-criar-uma-webpage-com-nextjs-tailwind-css-e-daisyui)
3. [Criar um Servidor com Express](#etapa-2-criar-um-servidor-com-express)
4. [Criar uma Base de Dados Online Gratuita com MongoDB](#etapa-3-criar-uma-base-de-dados-online-gratuita-com-mongodb)

## Etapa 0: Configurar Chaves SSH e Clonar o Repositório

1. **Gerar chaves SSH**:
   - Executar o comando:
     ```bash
     ssh-keygen -t rsa -b 4096 -C "teu-email@exemplo.com"
     ```
   - Seguir as instruções no terminal e guardar a chave em `~/.ssh/id_rsa`.

   - Copiar a chave pública para o clipboard:
     ```bash
     cat ~/.ssh/id_rsa.pub
     ```
   - Adicionar a chave pública ao perfil GitLab.

        [Documentação do GitLab - (Use SSH keys to communicate with GitLab)](https://docs.gitlab.com/ee/user/ssh.html).

2. **Clonar o repositório**:
   - Clonar o repositório GitLab para o teu ambiente local:
     ```bash
     git clone git@gitlab.com:usuario/nome-do-repositorio.git
     cd nome-do-repositorio
     ```

## Etapa 1: Criar uma Webpage com Next.js, Tailwind CSS e DaisyUI

1. **Instalar Node.js e npm (Ubuntu)** : 
   - Instalar o Curl
        ```bash
        sudo apt-get install curl
        ```

   - Instalar o nvm (Pode ser preciso reiniciar a consola depois do comando):
        ```bash
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
        ``` 
    - Instalar o Node.js 
        ```bash
        nvm install --lts
        ```
    - Verificar as Instalações
        ```bash
        node -v
        npm -v
        ```
   - [Documentação Node.js - (Download Node.js the way you want.)](https://nodejs.org/en/download/package-manager)
   

2. **Criar um novo projeto Next.js**:
   - Executar o comando:
     ```bash
     npx create-next-app@latest nome-do-projeto

     ✔ Would you like to use TypeScript? … Yes
     ✔ Would you like to use ESLint? … Yes
     ✔ Would you like to use Tailwind CSS? … Yes
     ✔ Would you like to use `src/` directory? … Yes
     ✔ Would you like to use App Router? (recommended) … Yes
     ✔ Would you like to customize the default import alias (@/*)? … No
     ```
   - [Documentação Next.js - (Creating a new project)](https://nextjs.org/learn/dashboard-app/getting-started)


4. **Iniciar ou testar o servidor**:
    - Instalar dependencias
        ```bash
        npm install
        ```
    - Iniciar o Servidor
        ```bash
        npm run dev
        ```

## Etapa 2: Criar um Servidor com Express e Mongodb

1. **Criar um novo projeto Node.js para o servidor**:
   - Navegar para a pasta do servidor e inicializar um novo projeto Node.js:
     ```bash
     mkdir backend
     cd backend
     npm init -y
     ```

2. **Instalar Express**:
   - Adicionar Express ao projeto:
     ```bash
     npm install express
     ```
2. **Instalar dotenv para termos variaveis de ambiente**:
   - Adicionar Express ao projeto:
     ```bash
     npm install dotenv
     ```

3. **Criar um ficheiro básico `server.js`**:
   - Adicionar o seguinte código:
     ```js
     const express = require('express');
     const app = express();
     const port = 3000;

     app.get('/', (req, res) => {
       res.send('Olá Mundo!');
     });

     app.listen(port, () => {
       console.log(`Servidor a correr em http://localhost:${port}`);
     });
     ```
   - [Documentação Express](https://expressjs.com/pt-br/starter/hello-world.html)

## Etapa 3: Criar uma Base de Dados Online Gratuita com MongoDB

1. **Criar uma conta no MongoDB Atlas**:
   - Registar-te no MongoDB Atlas e criar um novo cluster.
   - [Documentação MongoDB Atlas](https://docs.atlas.mongodb.com/getting-started/)

2. **Conectar ao MongoDB Atlas a partir do teu servidor Express**:
   - Instalar a biblioteca MongoDB:
     ```bash
     npm install mongodb
     ```
   - Adicionar o código de conexão no `index.js`:
     ```js
     const { MongoClient } = require('mongodb');
     const uri = "a_tua_string_de_conexao";
     const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

     async function run() {
       try {
         await client.connect();
         console.log("Conectado ao MongoDB Atlas");
       } finally {
         await client.close();
       }
     }
     run().catch(console.dir);
     ```
   - [Documentação MongoDB Node.js](https://docs.mongodb.com/drivers/node/)
