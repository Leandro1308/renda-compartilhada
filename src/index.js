const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./db');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const usuarios = require('./usuarios');
const saques = require('./saques');
const pagamentos = require('./pagamentos');
const cursos = require('./cursos');
const anuncios = require('./anuncios');

app.use('/usuarios', usuarios);
app.use('/saques', saques);
app.use('/pagamentos', pagamentos);
app.use('/cursos', cursos);
app.use('/anuncios', anuncios);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
