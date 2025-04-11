const express = require('express');
const fs = require('fs');
const router = express.Router();
const path = require('path');

const caminhoArquivo = path.join(__dirname, 'pagamentos.json');

// Listar todos os pagamentos
router.get('/', (req, res) => {
  const pagamentos = JSON.parse(fs.readFileSync(caminhoArquivo));
  res.json(pagamentos);
});

// Registrar um novo pagamento
router.post('/', (req, res) => {
  const pagamentos = JSON.parse(fs.readFileSync(caminhoArquivo));
  const novoPagamento = {
    id: pagamentos.length + 1,
    usuarioId: req.body.usuarioId,
    valor: req.body.valor,
    data: new Date().toISOString().slice(0, 10),
    status: 'aprovado'
  };
  pagamentos.push(novoPagamento);
  fs.writeFileSync(caminhoArquivo, JSON.stringify(pagamentos, null, 2));
  res.status(201).json(novoPagamento);
});

module.exports = router;
