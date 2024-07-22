import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      email: string; // Incluindo o email no tipo da sessão do usuário
    };
  }

  interface User {
    id: string;
    email: string;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    email: string; // Incluindo o email no tipo do JWT
  }
}
