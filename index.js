import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Função para carregar usuários
const carregarUsuarios = () => {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'usuarios.json'), 'utf-8'));
};

// Função para salvar usuários
const salvarUsuarios = (usuarios) => {
  fs.writeFileSync(path.join(__dirname, 'usuarios.json'), JSON.stringify(usuarios, null, 2));
};

// Rota de login
app.post('/login', (req, res) => {
  const { email, senha } = req.body;
  const usuarios = carregarUsuarios();
  const usuario = usuarios.find(u => u.email === email && u.senha === senha);

  if (usuario) {
    res.status(200).json({ sucesso: true, token: usuario.token });
  } else {
    res.status(401).json({ sucesso: false, mensagem: 'Credenciais inválidas.' });
  }
});

// Rota de verificação
app.post('/verificar', (req, res) => {
  const { token } = req.body;
  const usuarios = carregarUsuarios();
  const usuario = usuarios.find(u => u.token === token);

  if (usuario) {
    res.status(200).json({ sucesso: true, email: usuario.email, saldo: usuario.saldo || 0 });
  } else {
    res.status(401).json({ sucesso: false });
  }
});

// Rota de cadastro
app.post('/cadastro', (req, res) => {
  const { nome, email, senha, indicadoPor } = req.body;
  const usuarios = carregarUsuarios();

  if (usuarios.find(u => u.email === email)) {
    return res.status(400).json({ sucesso: false, mensagem: 'Email já cadastrado.' });
  }

  const novoUsuario = {
    nome,
    email,
    senha,
    token: uuidv4(),
    saldo: 0,
    indicadoPor
  };

  usuarios.push(novoUsuario);

  // Comissões automáticas
  const indicanteDireto = usuarios.find(u => u.email === indicadoPor);
  if (indicanteDireto) {
    indicanteDireto.saldo = (indicanteDireto.saldo || 0) + 2; // 40% de 5 reais
    const indicante2 = usuarios.find(u => u.email === indicanteDireto.indicadoPor);
    if (indicante2) {
      indicante2.saldo = (indicante2.saldo || 0) + 0.35; // 7% de 5 reais
      const indicante3 = usuarios.find(u => u.email === indicante2.indicadoPor);
      if (indicante3) {
        indicante3.saldo = (indicante3.saldo || 0) + 0.15; // 3% de 5 reais
      }
    }
  }

  salvarUsuarios(usuarios);
  res.status(201).json({ sucesso: true });
});

// Rota de saque
app.post('/saque', (req, res) => {
  const { token } = req.body;
  const usuarios = carregarUsuarios();
  const usuario = usuarios.find(u => u.token === token);

  if (!usuario) {
    return res.status(401).json({ sucesso: false, mensagem: 'Usuário não encontrado.' });
  }

  if ((usuario.saldo || 0) < 5) {
    return res.status(400).json({ sucesso: false, mensagem: 'Saldo insuficiente. Mínimo R$ 5,00.' });
  }

  usuario.saldo = 0; // zera o saldo após saque
  salvarUsuarios(usuarios);
  res.status(200).json({ sucesso: true, mensagem: 'Saque solicitado com sucesso!' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
