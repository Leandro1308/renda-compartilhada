const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const arquivoPagamentos = path.join(__dirname, 'pagamentos.json');

// Buscar todos os pagamentos
router.get('/', (req, res) => {
  const pagamentos = JSON.parse(fs.readFileSync(arquivoPagamentos));
  res.json(pagamentos);
});

// Criar novo pagamento
router.post('/', (req, res) => {
  const pagamentos = JSON.parse(fs.readFileSync(arquivoPagamentos));
  const novoPagamento = req.body;
  novoPagamento.id = Date.now();
  pagamentos.push(novoPagamento);
  fs.writeFileSync(arquivoPagamentos, JSON.stringify(pagamentos, null, 2));
  res.status(201).json(novoPagamento);
});

module.exports = router;
