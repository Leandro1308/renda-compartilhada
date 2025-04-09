const express = require('express');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'sua_chave_secreta';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Login
app.post('/login', (req, res) => {
  const { email, senha } = req.body;
  fs.readFile('./usuarios.json', 'utf8', (err, data) => {
    if (err) return res.status(500).json({ erro: 'Erro ao ler os dados.' });

    const usuarios = JSON.parse(data);
    const usuario = usuarios.find(u => u.email === email && u.senha === senha);

    if (usuario) {
      const token = jwt.sign({ email: usuario.email }, SECRET_KEY, { expiresIn: '1h' });
      return res.json({ token });
    } else {
      return res.status(401).json({ erro: 'Email ou senha inválidos.' });
    }
  });
});

// Verificação de token
app.get('/verificar', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ erro: 'Token não enviado.' });

  const token = authHeader.split(' ')[1];

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ erro: 'Token inválido.' });
    return res.json({ sucesso: true });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
