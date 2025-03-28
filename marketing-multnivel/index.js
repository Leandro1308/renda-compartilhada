const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("<h1>Servidor funcionando! Bem-vindo ao sistema de afiliados.</h1>");
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
