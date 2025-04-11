const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = './src/pagamentos.json';

router.get('/', (req, res) => {
  const pagamentos = JSON.parse(fs.readFileSync(path));
  res.json(pagamentos);
});

router.post('/registro', (req, res) => {
  const pagamentos = JSON.parse(fs.readFileSync(path));
  const pagamento = req.body;
  pagamento.id = Date.now();
  pagamento.status = 'Confirmado';
  pagamentos.push(pagamento);
  fs.writeFileSync(path, JSON.stringify(pagamentos, null, 2));
  res.json({ mensagem: 'Pagamento registrado!' });
});

module.exports = router;
