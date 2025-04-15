const express = require('express');
const Saque = require('./models/Saque');
const Usuario = require('./models/Usuario');
const auth = require('./middleware/auth');

const router = express.Router();

// Listar saques (admin)
router.get('/', async (req, res) => {
  const saques = await Saque.find().populate('usuario');
  res.json(saques);
});

// Solicitar saque
router.post('/', auth, async (req, res) => {
  const usuario = await Usuario.findById(req.usuarioId);
  const { valor } = req.body;

  if (usuario.statusAssinatura !== 'ativo') {
    return res.status(403).json({ erro: 'Assinatura inativa. Renove para solicitar saque.' });
  }

  if (!usuario.contaBancaria || !usuario.contaBancaria.pix) {
    return res.status(400).json({ erro: 'Cadastre sua conta bancária e chave PIX' });
  }

  if (usuario.saldo < valor || valor < 2) {
    return res.status(400).json({ erro: 'Saldo insuficiente ou valor abaixo do mínimo' });
  }

  usuario.saldo -= valor;
  await usuario.save();

  const novoSaque = new Saque({
    usuario: usuario._id,
    valor,
    chavePix: usuario.contaBancaria.pix
  });

  await novoSaque.save();

  res.status(201).json({ mensagem: 'Saque solicitado com sucesso!' });
});

// Aprovar saque (admin)
router.post('/aprovar/:id', async (req, res) => {
  await Saque.findByIdAndUpdate(req.params.id, { status: 'Aprovado' });
  res.json({ mensagem: 'Saque aprovado!' });
});

// Recusar saque (admin)
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
