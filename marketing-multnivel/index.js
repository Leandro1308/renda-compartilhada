const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3000;

const USUARIOS_PATH = "./marketing-multinivel/usuarios.json";
const CURSOS_PATH = "./marketing-multinivel/cursos.json";
const SEGREDO_JWT = "segredo_supersecreto";

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "..", "public")));

// Página principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// Cadastro com até 3 níveis de afiliados via ?ref=ID
app.post("/cadastro", (req, res) => {
  const { nome, email, senha } = req.body;
  const ref = req.query.ref;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: "Nome, e-mail e senha são obrigatórios." });
  }

  const usuarios = JSON.parse(fs.readFileSync(USUARIOS_PATH));
  const usuarioExistente = usuarios.find((u) => u.email === email);
  if (usuarioExistente) {
    return res.status(400).json({ erro: "E-mail já cadastrado." });
  }

  let indicadorDiretoId = null;
  let indicadorNivel2Id = null;
  let indicadorNivel3Id = null;

  if (ref) {
    const indicadorDireto = usuarios.find((u) => u.id === parseInt(ref));
    if (indicadorDireto) {
      indicadorDiretoId = indicadorDireto.id;

      const nivel2 = usuarios.find((u) => u.id === indicadorDireto.indicadorDiretoId);
      if (nivel2) {
        indicadorNivel2Id = nivel2.id;

        const nivel3 = usuarios.find((u) => u.id === nivel2.indicadorDiretoId);
        if (nivel3) {
          indicadorNivel3Id = nivel3.id;
        }
      }
    }
  }

  const senhaCriptografada = bcrypt.hashSync(senha, 10);
  const novoUsuario = {
    id: Date.now(),
    nome,
    email,
    senha: senhaCriptografada,
    indicadorDiretoId,
    indicadorNivel2Id,
    indicadorNivel3Id,
  };

  usuarios.push(novoUsuario);
  fs.writeFileSync(USUARIOS_PATH, JSON.stringify(usuarios, null, 2));
  res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!" });
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

  res.json({ mensagem: "Login realizado com sucesso!", token });
});

// Lista de cursos protegida
app.get("/cursos", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ erro: "Token ausente." });

  const token = auth.split(" ")[1];
  try {
    jwt.verify(token, SEGREDO_JWT);
    const cursos = JSON.parse(fs.readFileSync(CURSOS_PATH));
    res.json(cursos);
  } catch (err) {
    res.status(401).json({ erro: "Token inválido ou expirado." });
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
