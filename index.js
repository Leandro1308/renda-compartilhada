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

// LOGIN
app.post('/login', (req, res) => {
  try {
    const { email, senha } = req.body;
    const usuarios = JSON.parse(fs.readFileSync(path.join(__dirname, 'usuarios.json')));
    const usuario = usuarios.find(u => u.email === email && u.senha === senha);

    if (usuario) {
      res.status(200).json({ sucesso: true, token: usuario.token });
    } else {
      res.status(401).json({ sucesso: false, mensagem: 'Credenciais inválidas.' });
    }
  } catch (error) {
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor.' });
  }
});

// VERIFICAR TOKEN
app.post('/verificar', (req, res) => {
  try {
    const { token } = req.body;
    const usuarios = JSON.parse(fs.readFileSync(path.join(__dirname, 'usuarios.json')));
    const usuario = usuarios.find(u => u.token === token);

    if (usuario) {
      res.status(200).json({ sucesso: true, email: usuario.email });
    } else {
      res.status(401).json({ sucesso: false });
    }
  } catch (error) {
    res.status(500).json({ sucesso: false });
  }
});

// ROTA LISTAR SAQUES
app.get('/saques', (req, res) => {
  try {
    const saques = JSON.parse(fs.readFileSync(path.join(__dirname, 'saques.json')));
    res.status(200).json(saques);
  } catch (error) {
    res.status(500).json({ sucesso: false });
  }
});

// ROTA APROVAR SAQUE
app.post('/aprovar-saque', (req, res) => {
  try {
    const { id } = req.body;
    const saques = JSON.parse(fs.readFileSync(path.join(__dirname, 'saques.json')));
    const saque = saques.find(s => s.id === id);

    if (saque) {
      saque.status = 'Aprovado';
      fs.writeFileSync(path.join(__dirname, 'saques.json'), JSON.stringify(saques, null, 2));
      res.status(200).json({ sucesso: true });
    } else {
      res.status(404).json({ sucesso: false, mensagem: 'Saque não encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ sucesso: false });
  }
});

// ROTA REJEITAR SAQUE
app.post('/rejeitar-saque', (req, res) => {
  try {
    const { id } = req.body;
    const saques = JSON.parse(fs.readFileSync(path.join(__dirname, 'saques.json')));
    const saque = saques.find(s => s.id === id);

    if (saque) {
      saque.status = 'Rejeitado';
      fs.writeFileSync(path.join(__dirname, 'saques.json'), JSON.stringify(saques, null, 2));
      res.status(200).json({ sucesso: true });
    } else {
      res.status(404).json({ sucesso: false, mensagem: 'Saque não encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ sucesso: false });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
