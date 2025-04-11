const express = require('express');
const app = express();
const path = require('path');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

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
