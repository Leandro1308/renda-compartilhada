const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3000;
const SEGREDO_JWT = "segredo";

// Caminhos para os arquivos JSON
const USUARIOS_PATH = path.join(__dirname, "marketing-multinivel", "usuarios.json");
const CURSOS_PATH = path.join(__dirname, "marketing-multinivel", "cursos.json");

// Middlewares
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public"))); // <-- Correção aqui

// Rota principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Rota de cadastro
app.post("/cadastro", (req, res) => {
  const { nome, email, senha, indicador } = req.body;

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
    indicador: indicador || null,
  };

  usuarios.push(novoUsuario);
  fs.writeFileSync(USUARIOS_PATH, JSON.stringify(usuarios, null, 2));

  res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!" });
});

// Rota de login
app.post("/login", (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: "E-mail e senha são obrigatórios." });
  }

  const usuarios = JSON.parse(fs.readFileSync(USUARIOS_PATH));

  const usuario = usuarios.find((u) => u.email === email);
  if (!usuario) {
    return res.status(401).json({ erro: "Usuário não encontrado." });
  }

  const senhaCorreta = bcrypt.compareSync(senha, usuario.senha);
  if (!senhaCorreta) {
    return res.status(401).json({ erro: "Senha incorreta." });
  }

  const token = jwt.sign({ id: usuario.id, email: usuario.email }, SEGREDO_JWT, {
    expiresIn: "1h",
  });

  res.status(200).json({ mensagem: "Login realizado com sucesso!", token });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
