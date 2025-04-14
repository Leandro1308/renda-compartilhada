const express = require('express');
const Configuracao = require('./models/Configuracao');
const router = express.Router();

// Buscar configuração atual
router.get('/', async (req, res) => {
  const config = await Configuracao.findOne();
  res.json(config);
});

// Atualizar ou criar configuração
router.post('/', async (req, res) => {
  const { valorAssinatura, periodicidade, valorMinimoSaque } = req.body;
  let config = await Configuracao.findOne();

  if (config) {
    config.valorAssinatura = valorAssinatura;
    config.periodicidade = periodicidade;
    config.valorMinimoSaque = valorMinimoSaque;
  } else {
    config = new Configuracao({ valorAssinatura, periodicidade, valorMinimoSaque });
  }

  await config.save();
  res.json({ mensagem: 'Configuração atualizada com sucesso!' });
});

module.exports = router;
