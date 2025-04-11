const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'usuarios.json');

const readData = () => JSON.parse(fs.readFileSync(filePath));

router.get('/', (req, res) => {
  res.json(readData());
});

router.post('/', (req, res) => {
  const usuarios = readData();
  usuarios.push(req.body);
  fs.writeFileSync(filePath, JSON.stringify(usuarios, null, 2));
  res.status(201).send('Usuário criado com sucesso!');
});

module.exports = router;
