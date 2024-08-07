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

          if (!user.id || !user.email || !user.role || !user.username || !user.image) {
            throw new Error("User data is incomplete.");
          }

          return {
            id: user.id,
            email: user.email,
            role: user.role,
            username: user.username,
            image: user.image,
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
        token.id = user.id as string;
        token.email = user.email as string;
        token.role = user.role as string;
        token.username = user.username as string;
        token.image = user.image as string;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (token.id && token.email && token.role && token.username && token.image) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
        session.user.username = token.username as string;
        session.user.image = token.image as string;
      }
      return session;
    },
  },
});
