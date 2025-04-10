import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Carregar usuários
const loadUsuarios = () => JSON.parse(fs.readFileSync(path.join(__dirname, 'usuarios.json'), 'utf-8'));

// Carregar saques
const loadSaques = () => JSON.parse(fs.readFileSync(path.join(__dirname, 'saques.json'), 'utf-8'));

// Salvar saques
const saveSaques = (data) => fs.writeFileSync(path.join(__dirname, 'saques.json'), JSON.stringify(data, null, 2));

// LOGIN
app.post('/login', (req, res) => {
  const { email, senha } = req.body;
  const usuarios = loadUsuarios();
  const usuario = usuarios.find(u => u.email === email && u.senha === senha);

  if (usuario) {
    res.status(200).json({ sucesso: true, token: usuario.token });
  } else {
    res.status(401).json({ sucesso: false, mensagem: 'Credenciais inválidas.' });
  }
});

// VERIFICAR TOKEN
app.post('/verificar', (req, res) => {
  const { token } = req.body;
  const usuarios = loadUsuarios();
  const usuario = usuarios.find(u => u.token === token);

  if (usuario) {
    res.status(200).json({ sucesso: true, email: usuario.email });
  } else {
    res.status(401).json({ sucesso: false });
  }
});

// LISTAR SAQUES PARA ADMIN
app.get('/saques', (req, res) => {
  const saques = loadSaques();
  res.json(saques);
});

// ATUALIZAR STATUS DO SAQUE
app.post('/atualizar-saque', (req, res) => {
  const { index, status } = req.body;
  const saques = loadSaques();

  if (saques[index]) {
    saques[index].status = status;
    saveSaques(saques);
    res.status(200).json({ sucesso: true });
  } else {
    res.status(400).json({ sucesso: false, mensagem: 'Saque não encontrado' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
