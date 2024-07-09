const express = require('express');
const app = express();
const port = 3001;
require('dotenv').config();

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectToDatabase() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    throw err;
  }
}

// Call the connectToDatabase function to establish the connection
connectToDatabase().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Olá Mundo!');
});

app.listen(port, () => {
  console.log(`Servidor a correr em http://localhost:${port}`);
});
