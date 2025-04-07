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

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Rota inicial
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
    ganhos: 0,
    dataCadastro: new Date().toISOString(),
  };

  // Atualiza a lista de indicados do padrinho, se houver
  if (novoUsuario.indicadoPor) {
    const padrinho = usuarios.find((u) => u.email === novoUsuario.indicadoPor);
    if (padrinho) {
      padrinho.indicados.push(novoUsuario.email);
      padrinho.ganhos = (padrinho.ganhos || 0) + 5.0; // Exemplo de comissão
    }
  }

  usuarios.push(novoUsuario);
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

// Painel (exibição de dados)
app.get("/painel", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ erro: "Token ausente" });

  try {
    const decodificado = jwt.verify(token, SEGREDO_JWT);
    const dados = fs.readFileSync(USUARIOS_PATH);
    const usuarios = JSON.parse(dados);

    const usuario = usuarios.find((u) => u.email === decodificado.email);
    if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado" });

    const ganhos = usuario.ganhos || 0;

    res.json({
      nome: usuario.nome,
      email: usuario.email,
      indicados: usuario.indicados || [],
      ganhos: ganhos,
    });

  } catch (e) {
    res.status(401).json({ erro: "Token inválido ou expirado" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
