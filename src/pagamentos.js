const express = require('express');
const Pagamento = require('./models/Pagamento');
const Usuario = require('./models/Usuario');
const auth = require('./middleware/auth');

const router = express.Router();

// Histórico de Pagamentos do Usuário
router.post('/historico', auth, async (req, res) => {
  const pagamentos = await Pagamento.find({ usuario: req.usuarioId }).sort({ data: -1 });
  res.json({ sucesso: true, pagamentos });
});

// Criar Pagamento (simulação)
router.post('/registrar', async (req, res) => {
  const { usuarioId, valor } = req.body;

  try {
    const pagamento = new Pagamento({
      usuario: usuarioId,
      valor,
    });

    await pagamento.save();

    res.status(201).json({ mensagem: 'Pagamento registrado' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao registrar pagamento' });
  }
});

module.exports = router;
