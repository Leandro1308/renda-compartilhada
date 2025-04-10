const express = require('express');
const mongoose = require('mongoose');

const app = express();

// Conexão com o MongoDB usando variável de ambiente do Railway
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado ao MongoDB com sucesso!'))
  .catch((err) => console.error('Erro ao conectar ao MongoDB:', err));

// Rota principal (apenas pra teste se API está online)
app.get('/', (req, res) => {
  res.send('API está funcionando perfeitamente!');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
