const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../usuarios.json');

const getUsuarios = (req, res) => {
  const data = JSON.parse(fs.readFileSync(filePath));
  res.json(data);
};

const createUsuario = (req, res) => {
  const usuarios = JSON.parse(fs.readFileSync(filePath));
  const novoUsuario = req.body;
  usuarios.push(novoUsuario);
  fs.writeFileSync(filePath, JSON.stringify(usuarios, null, 2));
  res.status(201).json({ mensagem: 'Usuário criado com sucesso!' });
};

module.exports = { getUsuarios, createUsuario };
