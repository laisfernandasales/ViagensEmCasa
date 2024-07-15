import { initFirestore } from "@auth/firebase-adapter";
import { cert, initializeApp as initializeAdminApp, getApps } from "firebase-admin/app";

const serviceAccount=process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!process.env.FIREBASE_PROJECT_ID) {
  throw new Error("FIREBASE_PROJECT_ID não está definida nas variáveis de ambiente");
}

if (!process.env.FIREBASE_CLIENT_EMAIL) {
  throw new Error("FIREBASE_CLIENT_EMAIL não está definida nas variáveis de ambiente");
}

if (!process.env.FIREBASE_PRIVATE_KEY) {
  throw new Error("FIREBASE_PRIVATE_KEY não está definida nas variáveis de ambiente");
}

// Ensure Firebase Admin is initialized only once
if (!getApps().length) {
  initializeAdminApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // The private key needs to be properly formatted
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

const firestoreAdmin = initFirestore({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

export { firestoreAdmin };