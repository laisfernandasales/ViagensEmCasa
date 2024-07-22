import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { ZodError } from "zod";
import { signInSchema } from "./zod";
import { verifyPassword } from "./password";
import { getUserFromDb } from './users';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      authorize: async (credentials) => {
        try {
          const { email, password } = await signInSchema.parseAsync(credentials);

          const user = await getUserFromDb(email);

          if (!user) {
            throw new Error("User not found.");
          }

          const isPasswordValid = await verifyPassword(user.password, password);

          if (!isPasswordValid) {
            throw new Error("Invalid password.");
          }

          // Verificar se id, email e role não são nulos ou indefinidos
          if (!user.id || !user.email || !user.role) {
            throw new Error("User data is incomplete.");
          }

          return {
            id: user.id,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          if (error instanceof ZodError) {
            console.error("Validation error:", error.errors);
          }
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id as string;  // Adicione o ID do usuário ao token JWT
        token.email = user.email as string;  // Adicione o email do usuário ao token JWT
        token.role = user.role as string;  // Adicione o papel do usuário ao token JWT
      }
      return token;
    },
    session: ({ session, token }) => {
      if (token.id && token.email && token.role) {
        session.user.id = token.id as string;  // Adicione o ID do usuário à sessão
        session.user.email = token.email as string;  // Adicione o email do usuário à sessão
        session.user.role = token.role as string;  // Adicione o papel do usuário à sessão
      }
      return session;
    },
  },
});
