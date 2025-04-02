const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Permitir que arquivos estáticos sejam acessados da pasta "public"
app.use(express.static(path.join(__dirname, "..", "public")));

// Caminhos para os arquivos JSON
const USUARIOS_PATH = "./marketing-multinivel/usuarios.json";
const CURSOS_PATH = "./marketing-multinivel/cursos.json";
const SEGREDO_JWT = "segredo";

// Rota principal - carrega a interface do sistema (index.html)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// Rota de cadastro
app.post("/cadastro", (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: "Nome, e-mail e senha são obrigatórios." });
  }

  const usuarios = JSON.parse(fs.readFileSync(USUARIOS_PATH));

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
  console.log(`Servidor rodando na porta ${PORT}`);
});
