const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
  nome: String,
  email: { type: String, unique: true },
  senha: String,
  indicadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', default: null },
  indicados: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }],
  contaBancaria: {
    banco: String,
    agencia: String,
    conta: String,
    pix: String,
  },
  saldo: { type: Number, default: 0 },
  statusSaque: { type: String, default: 'nenhum' },
});

module.exports = mongoose.model('Usuario', UsuarioSchema);
