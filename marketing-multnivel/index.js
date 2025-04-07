const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3000;
const SEGREDO_JWT = "segredo";

const USUARIOS_PATH = path.join(__dirname, "usuarios.json");
const CURSOS_PATH = path.join(__dirname, "cursos.json");

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public"))); // serve arquivos HTML

// Rota principal (opcional)
app.get("/", (req, res) => {
  res.send("API Renda Compartilhada está no ar!");
});

// Cadastro de usuário
app.post("/cadastro", (req, res) => {
  const { nome, email, senha, indicadoPor } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: "Preencha todos os campos." });
  }

  let usuarios = [];
  if (fs.existsSync(USUARIOS_PATH)) {
    const dados = fs.readFileSync(USUARIOS_PATH);
    usuarios = JSON.parse(dados);
  }

  const emailJaCadastrado = usuarios.find((u) => u.email === email);
  if (emailJaCadastrado) {
    return res.status(400).json({ erro: "E-mail já cadastrado." });
  }

  const senhaCriptografada = bcrypt.hashSync(senha, 10);

  const novoUsuario = {
    id: Date.now(),
    nome,
    email,
    senha: senhaCriptografada,
    indicadoPor: indicadoPor || null,
    indicados: [],
    dataCadastro: new Date().toISOString(),
  };

  usuarios.push(novoUsuario);
  fs.writeFileSync(USUARIOS_PATH, JSON.stringify(usuarios, null, 2));

  res.status(201).json({ mensagem: "Usuário cadastrado com sucesso." });
});

// Login
app.post("/login", (req, res) => {
  const { email, senha } = req.body;

  const dados = fs.readFileSync(USUARIOS_PATH);
  const usuarios = JSON.parse(dados);

  const usuario = usuarios.find((u) => u.email === email);
  if (!usuario || !bcrypt.compareSync(senha, usuario.senha)) {
    return res.status(401).json({ erro: "Credenciais inválidas." });
  }

  const token = jwt.sign({ id: usuario.id, email: usuario.email }, SEGREDO_JWT, {
    expiresIn: "2h",
  });

  res.json({ mensagem: "Login realizado com sucesso!", token });
});

// Servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
