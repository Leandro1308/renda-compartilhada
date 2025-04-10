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

// ROTA LOGIN
app.post('/login', (req, res) => {
  const { email, senha } = req.body;
  const usuarios = JSON.parse(fs.readFileSync(usuariosPath, 'utf-8'));
  const usuario = usuarios.find(u => u.email === email && u.senha === senha);

  if (!usuario) {
    return res.status(401).json({ sucesso: false, mensagem: 'Credenciais inválidas.' });
  }

  res.status(200).json({ sucesso: true, token: usuario.token });
});

// ROTA VERIFICAR
app.post('/verificar', (req, res) => {
  const { token } = req.body;
  const usuarios = JSON.parse(fs.readFileSync(usuariosPath, 'utf-8'));
  const usuario = usuarios.find(u => u.token === token);

  if (!usuario) {
    return res.status(401).json({ sucesso: false });
  }

  // Buscar indicados dos 3 níveis
  const nivel1 = usuarios.filter(u => u.indicadoPor === usuario.email);
  const nivel2 = usuarios.filter(u => nivel1.some(n1 => u.indicadoPor === n1.email));
  const nivel3 = usuarios.filter(u => nivel2.some(n2 => u.indicadoPor === n2.email));

  const ganhos1 = nivel1.length * 1.00;
  const ganhos2 = nivel2.length * 0.50;
  const ganhos3 = nivel3.length * 0.25;

  const total = ganhos1 + ganhos2 + ganhos3;

  const linkIndicacao = `https://seusite.com.br/cadastro.html?indicador=${usuario.email}`;

  res.status(200).json({
    sucesso: true,
    email: usuario.email,
    nivel1: nivel1.length,
    nivel2: nivel2.length,
    nivel3: nivel3.length,
    ganhos1: ganhos1.toFixed(2),
    ganhos2: ganhos2.toFixed(2),
    ganhos3: ganhos3.toFixed(2),
    total: total.toFixed(2),
    linkIndicacao
  });
});

// ROTA SAQUE
app.post('/saque', (req, res) => {
  const { token, valor, chavePix } = req.body;
  const usuarios = JSON.parse(fs.readFileSync(usuariosPath, 'utf-8'));
  const usuario = usuarios.find(u => u.token === token);

  if (!usuario) {
    return res.status(401).json({ sucesso: false, erro: 'Usuário não encontrado.' });
  }

  const nivel1 = usuarios.filter(u => u.indicadoPor === usuario.email);
  const nivel2 = usuarios.filter(u => nivel1.some(n1 => u.indicadoPor === n1.email));
  const nivel3 = usuarios.filter(u => nivel2.some(n2 => u.indicadoPor === n2.email));

  const ganhos1 = nivel1.length * 1.00;
  const ganhos2 = nivel2.length * 0.50;
  const ganhos3 = nivel3.length * 0.25;

  const total = ganhos1 + ganhos2 + ganhos3;

  if (valor > total) {
    return res.status(400).json({ sucesso: false, erro: 'Saldo insuficiente.' });
  }

  if (valor < 5) {
    return res.status(400).json({ sucesso: false, erro: 'Valor mínimo para saque é R$5,00.' });
  }

  let saques = [];
  if (fs.existsSync(saquesPath)) {
    saques = JSON.parse(fs.readFileSync(saquesPath, 'utf-8'));
  }

  saques.push({
    id: Date.now(),
    email: usuario.email,
    valor,
    chavePix,
    data: new Date().toISOString()
  });

  fs.writeFileSync(saquesPath, JSON.stringify(saques, null, 2));

  res.status(200).json({ sucesso: true, mensagem: 'Saque solicitado com sucesso!' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
