import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import { config } from 'dotenv';

config(); // Carrega as variáveis do .env

const app = express();
app.use(express.json());
app.use(cors());

const client = new MongoClient(process.env.MONGO_URL);

async function conectarBanco() {
  try {
    await client.connect();
    console.log('MongoDB conectado com sucesso!');
  } catch (error) {
    console.error('Erro ao conectar no MongoDB:', error);
  }
}
conectarBanco();

const database = client.db('bancodedados'); // nome do banco
const collection = database.collection('dados'); // nome da coleção

app.get('/', (req, res) => {
  res.send('API Renda Compartilhada funcionando!');
});

app.post('/adicionar', async (req, res) => {
  const dados = req.body;
  await collection.insertOne(dados);
  res.send('Dados salvos com sucesso!');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
