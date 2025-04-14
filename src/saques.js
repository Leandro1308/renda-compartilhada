const express = require('express');
const Saque = require('./models/Saque');
const Usuario = require('./models/Usuario');
const auth = require('./middleware/auth');

const router = express.Router();

// Listar todos os saques (Admin)
router.get('/', async (req, res) => {
  const saques = await Saque.find().populate('usuario');
  res.json(saques);
});

// Solicitar Saque
router.post('/', auth, async (req, res) => {
  const usuario = await Usuario.findById(req.usuarioId);
  const { valor } = req.body;

  if (!usuario.contaBancaria || !usuario.contaBancaria.pix) {
    return res.status(400).json({ erro: 'Cadastre sua conta bancária e chave PIX' });
  }

  if (usuario.saldo < 10) {
    return res.status(400).json({ erro: 'Saldo insuficiente para saque (mínimo R$10,00)' });
  }

  if (valor > usuario.saldo) {
    return res.status(400).json({ erro: 'Valor maior que o saldo disponível' });
  }

  usuario.saldo -= valor;
  await usuario.save();

  const novoSaque = new Saque({
    usuario: usuario._id,
    valor,
    chavePix: usuario.contaBancaria.pix,
  });

  await novoSaque.save();

  res.status(201).json({ mensagem: 'Saque solicitado com sucesso!' });
});

// Aprovar Saque (Admin)
router.post('/aprovar/:id', async (req, res) => {
  await Saque.findByIdAndUpdate(req.params.id, { status: 'Aprovado' });
  res.json({ mensagem: 'Saque aprovado!' });
});

// Recusar Saque (Admin)
router.post('/recusar/:id', async (req, res) => {
  const saque = await Saque.findById(req.params.id);
  if (!saque) return res.status(404).json({ erro: 'Saque não encontrado' });

  const usuario = await Usuario.findById(saque.usuario);
  usuario.saldo += saque.valor;
  await usuario.save();

  saque.status = 'Recusado';
  await saque.save();

  res.json({ mensagem: 'Saque recusado e saldo devolvido!' });
});

module.exports = router;
