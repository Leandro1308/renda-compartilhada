const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./db');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ROTAS
const usuarios = require('./usuarios');
const saques = require('./saques');
const pagamentos = require('./pagamentos');
const cursos = require('./cursos');
const anuncios = require('./anuncios');
const configuracao = require('./configuracao');
const renovarAssinaturas = require('./renovacao'); // <- Nova função de renovação automática

app.use('/usuarios', usuarios);
app.use('/saques', saques);
app.use('/pagamentos', pagamentos);
app.use('/cursos', cursos);
app.use('/anuncios', anuncios);
app.use('/configuracao', configuracao);

// Executa renovação automática a cada 5 minutos
setInterval(renovarAssinaturas, 5 * 60 * 1000);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
