const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = './src/usuarios.json';

router.get('/', (req, res) => {
  const usuarios = JSON.parse(fs.readFileSync(path));
  res.json(usuarios);
});

router.post('/cadastro', (req, res) => {
  const usuarios = JSON.parse(fs.readFileSync(path));
  const novo = req.body;

  novo.id = Date.now();
  novo.linkAfiliado = `https://clubedamente.com/inscricao/${novo.id}`;
  novo.contaBancaria = "";
  novo.indicados = [];
  novo.indicador = req.body.indicador || null;

  usuarios.push(novo);
  fs.writeFileSync(path, JSON.stringify(usuarios, null, 2));
  res.json({ mensagem: 'Usuário cadastrado com sucesso!', usuario: novo });
});

router.put('/conta/:id', (req, res) => {
  const usuarios = JSON.parse(fs.readFileSync(path));
  const { id } = req.params;
  const usuario = usuarios.find(u => u.id == id);

  if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });

  usuario.contaBancaria = req.body.contaBancaria;
  fs.writeFileSync(path, JSON.stringify(usuarios, null, 2));
  res.json({ mensagem: 'Conta bancária cadastrada com sucesso!' });
});

module.exports = router;
