const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'anuncios.json');

const readData = () => JSON.parse(fs.readFileSync(filePath));

router.get('/', (req, res) => {
  res.json(readData());
});

router.post('/', (req, res) => {
  const anuncios = readData();
  anuncios.push(req.body);
  fs.writeFileSync(filePath, JSON.stringify(anuncios, null, 2));
  res.status(201).send('Anúncio criado com sucesso!');
});

module.exports = router;
