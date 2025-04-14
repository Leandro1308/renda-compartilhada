const mongoose = require('mongoose');

const CursoSchema = new mongoose.Schema({
  titulo: String,
  descricao: String,
  tipo: { type: String, enum: ['video', 'pdf', 'link'] },
  url: String,
  criadoEm: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Curso', CursoSchema);
