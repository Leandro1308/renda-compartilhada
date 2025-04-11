const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'saques.json');

const readData = () => JSON.parse(fs.readFileSync(filePath));

router.get('/', (req, res) => {
  res.json(readData());
});

router.post('/', (req, res) => {
  const saques = readData();
  saques.push(req.body);
  fs.writeFileSync(filePath, JSON.stringify(saques, null, 2));
  res.status(201).send('Saque solicitado com sucesso!');
});

module.exports = router;
