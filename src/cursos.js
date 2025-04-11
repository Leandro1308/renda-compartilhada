const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'cursos.json');

const readData = () => JSON.parse(fs.readFileSync(filePath));

router.get('/', (req, res) => {
  res.json(readData());
});

router.post('/', (req, res) => {
  const cursos = readData();
  cursos.push(req.body);
  fs.writeFileSync(filePath, JSON.stringify(cursos, null, 2));
  res.status(201).send('Curso adicionado com sucesso!');
});

module.exports = router;
