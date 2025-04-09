import express from "express";
import fs from "fs/promises";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

// Corrigindo caminhos absolutos com ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;
    const dados = await fs.readFile("./usuarios.json", "utf-8");
    const usuarios = JSON.parse(dados);

    const usuario = usuarios.find(
      (u) => u.email === email && u.senha === senha
    );

    if (usuario) {
      return res.json({ token: "token-falso-aprovado" });
    } else {
      return res.status(401).json({ erro: "Credenciais inválidas." });
    }
  } catch (err) {
    return res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
