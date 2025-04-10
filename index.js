import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGO_URL);
await client.connect();
const db = client.db('renda-compartilhada');

app.get('/', (req, res) => {
  res.send('Servidor rodando na porta 8080');
});

app.listen(8080, () => {
  console.log('Servidor rodando na porta 8080');
});
