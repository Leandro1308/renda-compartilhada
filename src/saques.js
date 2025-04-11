const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = './src/saques.json';

router.get('/', (req, res) => {
  const saques = JSON.parse(fs.readFileSync(path));
  res.json(saques);
});

router.post('/solicitar', (req, res) => {
  const saques = JSON.parse(fs.readFileSync(path));
  const saque = req.body;
  saque.id = Date.now();
  saque.status = 'Pendente';
  saques.push(saque);
  fs.writeFileSync(path, JSON.stringify(saques, null, 2));
  res.json({ mensagem: 'Saque solicitado com sucesso!' });
});

module.exports = router;
