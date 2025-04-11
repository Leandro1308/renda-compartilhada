// Estrutura inicial da API do Clube da Mente

const express = require('express');
const app = express();
app.use(express.json());

// Rotas principais
const usuarios = require('./src/usuarios');
const saques = require('./src/saques');
const pagamentos = require('./src/pagamentos');
const cursos = require('./src/cursos');
const anuncios = require('./src/anuncios');

app.use('/usuarios', usuarios);
app.use('/saques', saques);
app.use('/pagamentos', pagamentos);
app.use('/cursos', cursos);
app.use('/anuncios', anuncios);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
