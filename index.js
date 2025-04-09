import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

// Corrige __dirname em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rotas
app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  fs.readFile('./usuarios.json', 'utf8', (err, data) => {
    if (err) return res.status(500).json({ erro: 'Erro ao ler banco de dados.' });

    const usuarios = JSON.parse(data);
    const usuario = usuarios.find(u => u.email === email && u.senha === senha);

    if (usuario) {
      return res.json({ token: email }); // token provisório
    } else {
      return res.status(401).json({ erro: 'Email ou senha inválidos.' });
    }
  });
});

app.get('/usuario', (req, res) => {
  const token = req.headers.authorization;

  if (!token) return res.status(401).json({ erro: 'Token ausente' });

  fs.readFile('./usuarios.json', 'utf8', (err, data) => {
    if (err) return res.status(500).json({ erro: 'Erro ao ler banco de dados.' });

    const usuarios = JSON.parse(data);
    const usuario = usuarios.find(u => u.email === token);

    if (usuario) {
      res.json(usuario);
    } else {
      res.status(401).json({ erro: 'Token inválido' });
    }
  });
});

// Inicia servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
