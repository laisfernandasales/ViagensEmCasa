const express = require('express');
const { testFirebaseConnection } = require('./firebaseConfig'); // Importa a função de teste de conectividade
const port = 4000;

const server = express();

server.get('/', (req, res) => {
  res.send('Olá Mundo!');
});

// Testar conexões na inicialização e iniciar o servidor após testes
(async () => {
  const firebaseConnection = await testFirebaseConnection();

  if (firebaseConnection.connected) {
    server.listen(port, () => {
      console.log(`Servidor a correr em http://localhost:${port}`);
    });
  } else {
    console.error('Falha ao conectar com o Firebase. O servidor não será iniciado.');
    console.error(`Motivo: ${firebaseConnection.error}`);
  }
})();
