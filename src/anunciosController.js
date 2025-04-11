const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../anuncios.json');

const getAnuncios = (req, res) => {
  const data = JSON.parse(fs.readFileSync(filePath));
  res.json(data);
};

const createAnuncio = (req, res) => {
  const anuncios = JSON.parse(fs.readFileSync(filePath));
  const novoAnuncio = req.body;
  anuncios.push(novoAnuncio);
  fs.writeFileSync(filePath, JSON.stringify(anuncios, null, 2));
  res.status(201).json({ mensagem: 'Anúncio criado com sucesso!' });
};

module.exports = { getAnuncios, createAnuncio };
