const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3000;
const SEGREDO_JWT = "segredo"; // Substituir futuramente por variável de ambiente

// Caminhos para os arquivos JSON
const USUARIOS_PATH = path.join(__dirname, "usuarios.json");
const CURSOS_PATH = path.join(__dirname, "cursos.json");

// Middlewares
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "..", "public"))); // arquivos da pasta /public

// Rota principal - Página inicial
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// Rota de cadastro de usuário
app.post("/cadastro", (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: "Nome, e-mail e senha são obrigatórios." });
  }

  let usuarios = [];
  if (fs.existsSync(USUARIOS_PATH)) {
    usuarios = JSON.parse(fs.readFileSync(USUARIOS_PATH));
  }

  const usuarioExiste = usuarios.find((u) => u.email === email);
  if (usuarioExiste) {
    return res.status(400).json({ erro: "E-mail já cadastrado." });
  }

  const senhaCriptografada = bcrypt.hashSync(senha, 10);

  const novoUsuario = {
    id: Date.now(),
    nome,
    email,
    senha: senhaCriptografada,
  };

  usuarios.push(novoUsuario);
  fs.writeFileSync(USUARIOS_PATH, JSON.stringify(usuarios, null, 2));

  res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!" });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
