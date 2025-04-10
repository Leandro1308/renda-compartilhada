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

const usuariosPath = path.join(__dirname, 'usuarios.json');
const saquesPath = path.join(__dirname, 'saques.json');

// LOGIN
app.post('/login', (req, res) => {
  const { email, senha } = req.body;
  const usuarios = JSON.parse(fs.readFileSync(usuariosPath, 'utf-8'));

  const usuario = usuarios.find(u => u.email === email && u.senha === senha);

  if (usuario) {
    res.status(200).json({ sucesso: true, token: usuario.token });
  } else {
    res.status(401).json({ sucesso: false, mensagem: 'Credenciais inválidas.' });
  }
});

// VERIFICAR TOKEN + SALDO
app.post('/verificar', (req, res) => {
  const { token } = req.body;
  const usuarios = JSON.parse(fs.readFileSync(usuariosPath, 'utf-8'));

  const usuario = usuarios.find(u => u.token === token);

  if (usuario) {
    res.status(200).json({ sucesso: true, email: usuario.email, saldo: usuario.saldo || 0 });
  } else {
    res.status(401).json({ sucesso: false });
  }
});

// SAQUE
app.post('/saque', (req, res) => {
  const { token } = req.body;
  const usuarios = JSON.parse(fs.readFileSync(usuariosPath, 'utf-8'));
  const saques = JSON.parse(fs.readFileSync(saquesPath, 'utf-8'));

  const usuario = usuarios.find(u => u.token === token);

  if (!usuario) {
    return res.status(401).json({ sucesso: false, mensagem: 'Usuário não autenticado.' });
  }

  const saldo = usuario.saldo || 0;

  if (saldo < 5) {
    return res.status(400).json({ sucesso: false, mensagem: 'Saque mínimo de R$ 5,00.' });
  }

  saques.push({
    email: usuario.email,
    valor: saldo,
    data: new Date().toLocaleString(),
    status: 'Pendente'
  });

  usuario.saldo = 0;

  fs.writeFileSync(usuariosPath, JSON.stringify(usuarios, null, 2));
  fs.writeFileSync(saquesPath, JSON.stringify(saques, null, 2));

  res.status(200).json({ sucesso: true, mensagem: 'Saque solicitado com sucesso!' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
