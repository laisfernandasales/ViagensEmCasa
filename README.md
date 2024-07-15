# Projecto Final - Viagens em Casa 

## Como Iniciar o Projeto

- **Instalar as dependencias**

  ```bash
  npm install
  ```

- **Iniciar o projeto**
  ```bash
  npm run dev
  ```

O projeto vai abrir no endereço [http://localhost:3000](http://localhost:3000)

## Dependencias

O projeto requer o Node.js LTS instalado no sistema operativo.

[Como instalar o node.js](https://nodejs.org/en/download/package-manager)



# Configuração Inicial do Projeto e Integração de Dependências

## Índice

1. [Criação do projeto em nextjs](#criação-do-projeto-em-nextjs)
2. [Configuração do Plugin Daisyui](#configuração-do-plugin-daisyui)


## Criação do projeto em nextjs

1. **Criamos os novo projeto NEXTJS**:
   
    - Executar o comando na raiz do projeto:
    ```bash
    npx create-next-app@latest .
    ```
    - Escolhemos as opções selecionadas por defeito:
    ```bash
    Would you like to use TypeScript? Yes
    Would you like to use ESLint? Yes
    Would you like to use Tailwind CSS? Yes
    Would you like to use `src/` directory?  Yes
    Would you like to use App Router? (recommended) Yes
    Would you like to customize the default import alias (@/*)? No
    ```
   - [Nextjs getting started installation - docs](https://nextjs.org/docs/getting-started/installation).

## Configuração do Plugin Daisyui
1. **Instalamos a biblioteca**:

    - Executamos o comando:
    ```bash
    npm i -D daisyui@latest
    ```
    
    - Adicionamos o plugin ao ficheiro "tailwind.config.ts" e ativamos os temas "light" e "dark" :
    ```bash
      plugins: [
      require('daisyui'),
    ],
    daisyui: {
      themes: ["light", "dark"],
      darkTheme: "dark", 
      base: true, 
      styled: true, 
      utils: true, 
      prefix: "", 
      logs: false, 
      themeRoot: ":root", 
    },
    ```
    - [Instalar o daisyUI como um plugin do Tailwind CSS](https://daisyui.com/docs/install/).
    - [Next js 14 Theming with Daisy UI - Light and Dark Mode](https://daisyui.com/resources/videos/next-js-14-theming-with-daisy-ui-light-and-dark-mode-zxrnzv0rews/).


instalar os modulos e modificar o config do tailwind
npm i -D @iconify/tailwind
npm install @iconify-json/mdi
npm install @iconify-json/mdi-light

autenticação
https://authjs.dev/getting-started/installation?framework=next.js

zod
dotenv
