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

// Carregar usuários
const getUsuarios = () => {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'usuarios.json'), 'utf-8'));
};

// Salvar usuários
const saveUsuarios = (usuarios) => {
  fs.writeFileSync(path.join(__dirname, 'usuarios.json'), JSON.stringify(usuarios, null, 2));
};

// LOGIN
app.post('/login', (req, res) => {
  const { email, senha } = req.body;
  const usuarios = getUsuarios();
  const usuario = usuarios.find(u => u.email === email && u.senha === senha);

  if (usuario) {
    res.status(200).json({ sucesso: true, token: usuario.token });
  } else {
    res.status(401).json({ sucesso: false, mensagem: 'Credenciais inválidas.' });
  }
});

// VERIFICAR
app.post('/verificar', (req, res) => {
  const { token } = req.body;
  const usuarios = getUsuarios();
  const usuario = usuarios.find(u => u.token === token);

  if (usuario) {
    res.status(200).json({
      sucesso: true,
      nome: usuario.nome,
      email: usuario.email,
      saldo: usuario.saldo || 0,
      statusSaque: usuario.statusSaque || 'Nenhum'
    });
  } else {
    res.status(401).json({ sucesso: false });
  }
});

// CADASTRO
app.post('/cadastro', (req, res) => {
  const { nome, email, senha, indicadoPor } = req.body;
  const usuarios = getUsuarios();

  if (usuarios.find(u => u.email === email)) {
    return res.status(400).json({ sucesso: false, mensagem: 'Email já cadastrado.' });
  }

  const novoUsuario = {
    nome,
    email,
    senha,
    token: uuidv4(),
    indicadoPor: indicadoPor || null,
    saldo: 0,
    statusSaque: 'Nenhum'
  };

  usuarios.push(novoUsuario);

  // Creditar 10 para o indicante se existir
  if (indicadoPor) {
    const indicante = usuarios.find(u => u.email === indicadoPor);
    if (indicante) {
      indicante.saldo += 10;
    }
  }

  saveUsuarios(usuarios);
  res.status(201).json({ sucesso: true, mensagem: 'Cadastro realizado!' });
});

// SAQUE
app.post('/sacar', (req, res) => {
  const { token } = req.body;
  const usuarios = getUsuarios();
  const usuario = usuarios.find(u => u.token === token);

  if (!usuario) return res.status(401).json({ sucesso: false });

  if (usuario.saldo < 100) {
    return res.status(400).json({ sucesso: false, mensagem: 'Saldo insuficiente.' });
  }

  usuario.statusSaque = 'Pendente';

  saveUsuarios(usuarios);
  res.status(200).json({ sucesso: true, mensagem: 'Saque solicitado com sucesso!' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
