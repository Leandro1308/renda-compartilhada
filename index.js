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

// Caminho do banco de dados local
const USUARIOS_PATH = path.join(__dirname, 'usuarios.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ROTA DE CADASTRO
app.post('/cadastro', (req, res) => {
  const { nome, email, senha, indicadoPor } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });
  }

  let usuarios = [];

  if (fs.existsSync(USUARIOS_PATH)) {
    usuarios = JSON.parse(fs.readFileSync(USUARIOS_PATH, 'utf-8'));
  }

  if (usuarios.find((u) => u.email === email)) {
    return res.status(400).json({ erro: 'Este e-mail já está cadastrado.' });
  }

  const novoUsuario = {
    id: Date.now(),
    nome,
    email,
    senha,
    indicadoPor: indicadoPor || null,
    indicados: [],
    token: uuidv4(), // gera token único
    ganhos: 0.0,
    dataCadastro: new Date().toISOString()
  };

  // Salva o indicado no usuário que o indicou
  if (indicadoPor) {
    const indicador = usuarios.find((u) => u.token === indicadoPor);
    if (indicador) {
      indicador.indicados.push(novoUsuario.token);
    }
  }

  usuarios.push(novoUsuario);
  fs.writeFileSync(USUARIOS_PATH, JSON.stringify(usuarios, null, 2));

  res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso.' });
});

// ROTA DE LOGIN
app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  const usuarios = JSON.parse(fs.readFileSync(USUARIOS_PATH, 'utf-8'));
  const usuario = usuarios.find((u) => u.email === email && u.senha === senha);

  if (usuario) {
    res.status(200).json({ token: usuario.token });
  } else {
    res.status(401).json({ erro: 'Credenciais inválidas.' });
  }
});

// ROTA DE VERIFICAÇÃO
app.post('/verificar', (req, res) => {
  const { token } = req.body;

  const usuarios = JSON.parse(fs.readFileSync(USUARIOS_PATH, 'utf-8'));
  const usuario = usuarios.find((u) => u.token === token);

  if (usuario) {
    res.status(200).json({ sucesso: true, email: usuario.email });
  } else {
    res.status(401).json({ sucesso: false });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
