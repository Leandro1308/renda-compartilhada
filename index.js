const express = require("express");
const path = require("path");
const app = express();

// Middleware para servir arquivos estáticos da pasta "public"
app.use(express.static(path.join(__dirname, "public")));

// Rota principal para testar se o servidor está rodando
app.get("/", (req, res) => {
  res.send("Servidor está funcionando 🚀");
});

// Porta do Railway ou 3000 localmente
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
