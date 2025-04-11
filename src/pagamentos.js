const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const pagamentosFilePath = path.join(__dirname, 'pagamentos.json');

// Função para ler os pagamentos
function lerPagamentos() {
  const data = fs.readFileSync(pagamentosFilePath);
  return JSON.parse(data);
}

// Função para salvar os pagamentos
function salvarPagamentos(pagamentos) {
  fs.writeFileSync(pagamentosFilePath, JSON.stringify(pagamentos, null, 2));
}

// Listar todos os pagamentos
router.get('/', (req, res) => {
  const pagamentos = lerPagamentos();
  res.json(pagamentos);
});

// Registrar novo pagamento
router.post('/', (req, res) => {
  const { usuario, valor, data } = req.body;

  if (!usuario || !valor || !data) {
    return res.status(400).json({ mensagem: 'Preencha todos os campos.' });
  }

  const pagamentos = lerPagamentos();

  pagamentos.push({ usuario, valor, data });

  salvarPagamentos(pagamentos);

  res.status(201).json({ mensagem: 'Pagamento registrado com sucesso.' });
});

module.exports = router;
