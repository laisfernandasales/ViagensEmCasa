require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
const { getStorage } = require('firebase/storage');

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

async function testFirebaseConnection() {
  try {
    // Teste básico de inicialização
    if (db && storage) {
      console.log('Conexão com o Firebase bem-sucedida.');
      return { connected: true };
    } else {
      throw new Error('Falha na inicialização do Firebase.');
    }
  } catch (error) {
    console.error(`Erro ao conectar com o Firebase: ${error.message}`);
    return { connected: false, error: error.message };
  }
}

module.exports = { db, storage, testFirebaseConnection };
