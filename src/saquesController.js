const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../saques.json');

const getSaques = (req, res) => {
  const data = JSON.parse(fs.readFileSync(filePath));
  res.json(data);
};

const createSaque = (req, res) => {
  const saques = JSON.parse(fs.readFileSync(filePath));
  const novoSaque = req.body;
  saques.push(novoSaque);
  fs.writeFileSync(filePath, JSON.stringify(saques, null, 2));
  res.status(201).json({ mensagem: 'Saque solicitado com sucesso!' });
};

module.exports = { getSaques, createSaque };
