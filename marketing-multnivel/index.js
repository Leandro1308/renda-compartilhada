const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "..", "public")));

const USUARIOS_PATH = "./marketing-multinivel/usuarios.json";
const CURSOS_PATH = "./marketing-multinivel/cursos.json";
const SEGREDO_JWT = "segredo";

// Página inicial
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// Cadastro com indicação
app.post("/cadastro", (req, res) => {
  const { nome, email, senha, indicadoPor } = req.body;

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
    indicadoPor: indicadoPor || null,
    nivel1: indicadoPor || null,
    nivel2: null,
    nivel3: null,
    ganhos: 0
  };

  // Gerar níveis 2 e 3 com base no ID do indicadoPor
  if (indicadoPor) {
    const nivel1 = usuarios.find((u) => u.id == indicadoPor);
    if (nivel1) {
      novoUsuario.nivel2 = nivel1.indicadoPor || null;
      const nivel2 = usuarios.find((u) => u.id == nivel1.indicadoPor);
      if (nivel2) {
        novoUsuario.nivel3 = nivel2.indicadoPor || null;
      }
    }
  }

  usuarios.push(novoUsuario);
  fs.writeFileSync(USUARIOS_PATH, JSON.stringify(usuarios, null, 2));

  res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!", id: novoUsuario.id });
});

// Login
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

// Servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
