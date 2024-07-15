import NextAuth from "next-auth";
import { FirestoreAdapter } from "@auth/firebase-adapter";
import Credentials from "next-auth/providers/credentials";
import { ZodError } from "zod";
import { signInSchema } from "../lib/zod";
import { verifyPassword } from "../utils/password";
import { firestoreAdmin } from "../lib/firebaseAdmin";
import { getUserFromDb } from '../db/users';

// Define a custom logger with type definitions
const customLogger = {
  error(code: Error, ...message: any[]) {
    const errorCode = code.name;
    if (errorCode === 'CredentialsSignin' || errorCode === 'CallbackRouteError') {
      // Suppress specific error messages
      return;
    }
    console.error(`[auth][error] ${errorCode}`, ...message);
  },
  warn(code: string, ...message: any[]) {
    console.warn(`[auth][warn] ${code}`, ...message);
  },
  debug(code: string, ...message: any[]) {
    console.debug(`[auth][debug] ${code}`, ...message);
  }
};

// Defining the class CredentialsSignin as per the documentation
class CredentialsSignin extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "CredentialsSignin";
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      authorize: async (credentials) => {
        try {
          console.log("Authorizing user...");
          const { email, password } = await signInSchema.parseAsync(credentials);
          console.log("Parsed credentials:", { email, password });

          const user = await getUserFromDb(email);
          console.log("User from DB:", user);

          if (!user) {
            console.log("User not found");
            throw new CredentialsSignin("User not found.");
          }

          const isPasswordValid = await verifyPassword(user.password, password);
          console.log("Password valid:", isPasswordValid);

          if (!isPasswordValid) {
            console.log("Invalid password");
            throw new CredentialsSignin("Invalid password.");
          }

          return {
            id: user.id,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          if (error instanceof ZodError) {
            console.error("ZodError:", error);
            return null;
          }
          if (error instanceof CredentialsSignin) {
            console.warn("User not found or invalid password:", { email: credentials?.email });
            return null;
          }
          console.error("Error in authorize:", error);
          return null;
        }
      },
    }),
  ],
  adapter: FirestoreAdapter(firestoreAdmin),
  logger: customLogger,
});
