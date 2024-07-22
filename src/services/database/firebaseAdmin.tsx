import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import * as admin from "firebase-admin";


if (!getApps().length) {
  initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}


const firestore = getFirestore();
const storage = getStorage().bucket();

export { firestore, storage };
