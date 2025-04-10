import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const USUARIOS_PATH = path.join(__dirname, 'usuarios.json');

const lerUsuarios = () => {
  if (!fs.existsSync(USUARIOS_PATH)) return [];
  const dados = fs.readFileSync(USUARIOS_PATH);
  return JSON.parse(dados);
};

const salvarUsuarios = (usuarios) => {
  fs.writeFileSync(USUARIOS_PATH, JSON.stringify(usuarios, null, 2));
};

// Cadastro
app.post('/cadastro', (req, res) => {
  const { nome, email, senha, indicadoPor } = req.body;
  const usuarios = lerUsuarios();

  if (usuarios.find(u => u.email === email)) {
    return res.status(400).json({ sucesso: false, mensagem: 'Email já cadastrado.' });
  }

  const token = crypto.randomBytes(16).toString('hex');

  const novoUsuario = {
    nome,
    email,
    senha,
    token,
    saldo: 0,
    statusSaque: 'Nenhum',
    indicadoPor: indicadoPor || null,
  };

  // vincular indicado
  if (indicadoPor) {
    const indicador = usuarios.find(u => u.email === indicadoPor);
    if (indicador) {
      indicador.saldo += 1; // comissão simbólica de R$1 por cadastro
    }
  }

  usuarios.push(novoUsuario);
  salvarUsuarios(usuarios);

  res.json({ sucesso: true, mensagem: 'Cadastro realizado com sucesso!' });
});

// Login
app.post('/login', (req, res) => {
  const { email, senha } = req.body;
  const usuarios = lerUsuarios();

  const usuario = usuarios.find(u => u.email === email && u.senha === senha);
  if (!usuario) {
    return res.status(401).json({ sucesso: false, mensagem: 'Credenciais inválidas.' });
  }

  res.json({ sucesso: true, mensagem: 'Login realizado com sucesso!', token: usuario.token });
});

// Verificação
app.post('/verificar', (req, res) => {
  const { token } = req.body;
  const usuarios = lerUsuarios();

  const usuario = usuarios.find(u => u.token === token);
  if (!usuario) {
    return res.status(401).json({ sucesso: false });
  }

  res.json({
    sucesso: true,
    nome: usuario.nome,
    email: usuario.email,
    saldo: usuario.saldo,
    statusSaque: usuario.statusSaque
  });
});

// Solicitação de Saque
app.post('/sacar', (req, res) => {
  const { token } = req.body;
  const usuarios = lerUsuarios();

  const usuario = usuarios.find(u => u.token === token);
  if (!usuario) {
    return res.status(401).json({ sucesso: false, mensagem: 'Usuário não encontrado.' });
  }

  if (usuario.saldo < 10) {
    return res.json({ sucesso: false, mensagem: 'Saldo insuficiente (mínimo R$10,00).' });
  }

  usuario.statusSaque = 'Solicitado';
  salvarUsuarios(usuarios);

  res.json({ sucesso: true, mensagem: 'Solicitação de saque enviada com sucesso!' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
