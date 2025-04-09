const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

const USERS_FILE = path.join(__dirname, "usuarios.json");

function gerarToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function lerUsuarios() {
  try {
    const data = fs.readFileSync(USERS_FILE);
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function salvarUsuarios(usuarios) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(usuarios, null, 2));
}

// ROTA DE LOGIN
app.post("/login", (req, res) => {
  const { email, senha } = req.body;
  const usuarios = lerUsuarios();

  const usuario = usuarios.find(u => u.email === email && u.senha === senha);

  if (!usuario) {
    return res.status(401).json({ erro: "Email ou senha inválidos." });
  }

  const token = gerarToken();
  usuario.token = token;
  salvarUsuarios(usuarios);

  res.json({ token, nome: usuario.nome });
});

// ROTA DE AUTENTICAÇÃO PELO TOKEN
app.post("/auth", (req, res) => {
  const { token } = req.body;
  const usuarios = lerUsuarios();
  const usuario = usuarios.find(u => u.token === token);

  if (usuario) {
    res.json({ autenticado: true, nome: usuario.nome });
  } else {
    res.status(403).json({ autenticado: false });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
