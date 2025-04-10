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

// ROTA LOGIN
app.post('/login', (req, res) => {
  try {
    const { email, senha } = req.body;
    const usuarios = JSON.parse(fs.readFileSync(path.join(__dirname, 'usuarios.json'), 'utf-8'));
    const usuario = usuarios.find(u => u.email === email && u.senha === senha);

    if (usuario) {
      res.status(200).json({ sucesso: true, token: usuario.token });
    } else {
      res.status(401).json({ sucesso: false, mensagem: 'Credenciais inválidas.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor.' });
  }
});

// ROTA VERIFICAR TOKEN
app.post('/verificar', (req, res) => {
  try {
    const { token } = req.body;
    const usuarios = JSON.parse(fs.readFileSync(path.join(__dirname, 'usuarios.json'), 'utf-8'));
    const usuario = usuarios.find(u => u.token === token);

    if (usuario) {
      res.status(200).json({ sucesso: true, email: usuario.email });
    } else {
      res.status(401).json({ sucesso: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor.' });
  }
});

// ROTA CADASTRO NOVO USUÁRIO
app.post('/cadastro', (req, res) => {
  try {
    const { nome, email, senha, indicadoPor, token } = req.body;
    const usuariosPath = path.join(__dirname, 'usuarios.json');
    const usuarios = JSON.parse(fs.readFileSync(usuariosPath, 'utf-8'));

    const existe = usuarios.find(u => u.email === email);

    if (existe) {
      return res.status(400).json({ sucesso: false, mensagem: 'Email já cadastrado.' });
    }

    usuarios.push({ nome, email, senha, indicadoPor, token });

    fs.writeFileSync(usuariosPath, JSON.stringify(usuarios, null, 2));

    res.status(201).json({ sucesso: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
