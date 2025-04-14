const mongoose = require('mongoose');

const ConfiguracaoSchema = new mongoose.Schema({
  valorAssinatura: { type: Number, required: true },
  periodicidade: { type: String, enum: ['semanal', 'mensal', 'anual'], default: 'mensal' },
  valorMinimoSaque: { type: Number, required: true }
});

module.exports = mongoose.model('Configuracao', ConfiguracaoSchema);
