const mongoose = require('mongoose');

const PagamentoSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  valor: Number,
  data: { type: Date, default: Date.now },
  status: { type: String, default: 'aprovado' }
});

module.exports = mongoose.model('Pagamento', PagamentoSchema);
