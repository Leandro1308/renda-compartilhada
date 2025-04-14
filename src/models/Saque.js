const mongoose = require('mongoose');

const SaqueSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  valor: Number,
  chavePix: String,
  status: { type: String, default: 'Pendente' },
  data: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Saque', SaqueSchema);
