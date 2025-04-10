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

// Login
app.post('/login', (req, res) => {
  const { email, senha } = req.body;
  const usuarios = JSON.parse(fs.readFileSync(path.join(__dirname, 'usuarios.json')));
  const usuario = usuarios.find(u => u.email === email && u.senha === senha);
  
  if (usuario) {
    res.json({ sucesso: true, token: usuario.token });
  } else {
    res.status(401).json({ sucesso: false, mensagem: 'Credenciais inválidas' });
  }
});

// Verificar token
app.post('/verificar', (req, res) => {
  const { token } = req.body;
  const usuarios = JSON.parse(fs.readFileSync(path.join(__dirname, 'usuarios.json')));
  const usuario = usuarios.find(u => u.token === token);

  if (usuario) {
    res.json({ sucesso: true, email: usuario.email });
  } else {
    res.status(401).json({ sucesso: false });
  }
});

// Listar Saques
app.get('/saques', (req, res) => {
  const saques = JSON.parse(fs.readFileSync(path.join(__dirname, 'saques.json')));
  res.json(saques);
});

// Alterar Status de Saque
app.post('/alterar-saque', (req, res) => {
  const { id, status } = req.body;
  const saquesPath = path.join(__dirname, 'saques.json');
  const saques = JSON.parse(fs.readFileSync(saquesPath));

  const saque = saques.find(s => s.id === id);

  if (saque) {
    saque.status = status;
    fs.writeFileSync(saquesPath, JSON.stringify(saques, null, 2));
    res.json({ sucesso: true });
  } else {
    res.status(404).json({ sucesso: false, mensagem: 'Saque não encontrado' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
