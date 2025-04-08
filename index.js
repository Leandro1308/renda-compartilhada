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

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.send("API Renda Compartilhada está no ar!");
});

// Cadastro
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

  const emailJaExiste = usuarios.find((u) => u.email === email);
  if (emailJaExiste) {
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

  // Atualiza indicados de quem indicou
  if (indicadoPor) {
    const indicador = usuarios.find((u) => u.email === indicadoPor);
    if (indicador) {
      indicador.indicados.push(email);
    }
  }

  fs.writeFileSync(USUARIOS_PATH, JSON.stringify(usuarios, null, 2));

  res.status(201).json({ mensagem: "Usuário cadastrado com sucesso." });
});

// Login
app.post("/login", (req, res) => {
  const { email, senha } = req.body;

  if (!fs.existsSync(USUARIOS_PATH)) {
    return res.status(500).json({ erro: "Banco de dados não encontrado." });
  }

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

// Painel
app.get("/painel", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.json({ erro: "Token não enviado." });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SEGREDO_JWT);

    const dados = fs.readFileSync(USUARIOS_PATH);
    const usuarios = JSON.parse(dados);

    const usuario = usuarios.find((u) => u.email === decoded.email);
    if (!usuario) return res.json({ erro: "Usuário não encontrado" });

    // 1º nível
    const nivel1 = usuario.indicados || [];

    // 2º nível
    const nivel2 = nivel1.flatMap(email1 => {
      const u1 = usuarios.find(u => u.email === email1);
      return u1 ? u1.indicados : [];
    });

    // 3º nível
    const nivel3 = nivel2.flatMap(email2 => {
      const u2 = usuarios.find(u => u.email === email2);
      return u2 ? u2.indicados : [];
    });

    // Cálculo de ganhos por nível
    const ganho1 = nivel1.length * 5.00;
    const ganho2 = nivel2.length * 3.00;
    const ganho3 = nivel3.length * 2.00;
    const total = ganho1 + ganho2 + ganho3;

    res.json({
      nome: usuario.nome,
      email: usuario.email,
      nivel1: nivel1.length,
      nivel2: nivel2.length,
      nivel3: nivel3.length,
      ganhos: {
        nivel1: ganho1,
        nivel2: ganho2,
        nivel3: ganho3,
        total
      }
    });
  } catch (error) {
    return res.json({ erro: "Token inválido ou expirado." });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
