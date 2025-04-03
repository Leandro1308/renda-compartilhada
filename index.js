const express = require("express");
const app = express();

// Rota de teste para verificar se o servidor está rodando
app.get("/", (req, res) => {
  res.send("Servidor está funcionando 🚀");
});

// Usa a porta fornecida pelo Railway ou 3000 localmente
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
