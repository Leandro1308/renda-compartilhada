const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = './src/anuncios.json';

router.get('/', (req, res) => {
  const anuncios = JSON.parse(fs.readFileSync(path));
  res.json(anuncios);
});

router.post('/novo', (req, res) => {
  const anuncios = JSON.parse(fs.readFileSync(path));
  const anuncio = req.body;
  anuncio.id = Date.now();
  anuncios.push(anuncio);
  fs.writeFileSync(path, JSON.stringify(anuncios, null, 2));
  res.json({ mensagem: 'Anúncio publicado!' });
});

module.exports = router;
