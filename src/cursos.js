const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = './src/cursos.json';

router.get('/', (req, res) => {
  const cursos = JSON.parse(fs.readFileSync(path));
  res.json(cursos);
});

module.exports = router;
