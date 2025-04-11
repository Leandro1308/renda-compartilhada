const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../pagamentos.json');

const getPagamentos = (req, res) => {
  const data = JSON.parse(fs.readFileSync(filePath));
  res.json(data);
};

const createPagamento = (req, res) => {
  const pagamentos = JSON.parse(fs.readFileSync(filePath));
  const novoPagamento = req.body;
  pagamentos.push(novoPagamento);
  fs.writeFileSync(filePath, JSON.stringify(pagamentos, null, 2));
  res.status(201).json({ mensagem: 'Pagamento registrado com sucesso!' });
};

module.exports = { getPagamentos, createPagamento };
