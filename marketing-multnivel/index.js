const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

const USUARIOS_PATH = "./marketing-multinivel/usuarios.json";
const CURSOS_PATH = "./marketing-multinivel/cursos.json";
const SEGREDO_JWT = "segredo";

// Página inicial
app.get("/", (req, res) => {
  res.send("<h1>Servidor funcionando! Bem-vindo ao sistema de afiliados.</h1>");
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

// Rota de login
app.post("/login", (req, res) => {
  const { email, senha } = req.body;

  const usuarios = JSON.parse(fs.readFileSync(USUARIOS_PATH));

  const usuario = usuarios.find((u) => u.email === email);
  if (!usuario || !bcrypt.compareSync(senha, usuario.senha)) {
    return res.status(401).json({ erro: "E-mail ou senha inválidos." });
  }

  const token = jwt.sign({ id: usuario.id, nome: usuario.nome }, SEGREDO_JWT, {
    expiresIn: "2h",
  });

  res.json({ mensagem: "Login bem-sucedido!", token });
});

// Middleware de autenticação
function autenticarToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ erro: "Token não fornecido." });

  jwt.verify(token, SEGREDO_JWT, (err, usuario) => {
    if (err) return res.status(403).json({ erro: "Token inválido ou expirado." });
    req.usuario = usuario;
    next();
  });
}

// Rota protegida: acesso aos cursos
app.get("/cursos", autenticarToken, (req, res) => {
  const cursos = JSON.parse(fs.readFileSync(CURSOS_PATH));
  res.json(cursos);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
