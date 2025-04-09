const express = require("express");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const SEGREDO = "segredo-do-leandro"; // você pode alterar isso por segurança

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ===== ROTA DE LOGIN =====
app.post("/login", (req, res) => {
  const { email, senha } = req.body;

  const dadosUsuarios = JSON.parse(fs.readFileSync("usuarios.json", "utf8"));

  const usuarioEncontrado = dadosUsuarios.find(
    (u) => u.email === email && u.senha === senha
  );

  if (usuarioEncontrado) {
    const token = jwt.sign({ email }, SEGREDO, { expiresIn: "2h" });
    res.json({ token });
  } else {
    res.status(401).json({ erro: "Credenciais inválidas." });
  }
});

// ===== ROTA DE VERIFICAÇÃO DE TOKEN =====
app.post("/verificar", (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ erro: "Token ausente." });
  }

  try {
    const decoded = jwt.verify(token, SEGREDO);
    res.json({ sucesso: true, email: decoded.email });
  } catch (erro) {
    res.status(401).json({ erro: "Token inválido ou expirado." });
  }
});

// ===== INÍCIO DO SERVIDOR =====
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
