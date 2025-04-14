const express = require('express');
const Curso = require('./models/Curso');
const auth = require('./middleware/auth');

const router = express.Router();

// Listar Cursos (disponível pra aluno logado)
router.get('/', auth, async (req, res) => {
  const cursos = await Curso.find().sort({ criadoEm: -1 });
  res.json(cursos);
});

// Criar Curso (Admin manual por enquanto)
router.post('/criar', async (req, res) => {
  const { titulo, descricao, tipo, url } = req.body;

  const novoCurso = new Curso({
    titulo,
    descricao,
    tipo,
    url
  });

  await novoCurso.save();

  res.status(201).json({ mensagem: 'Curso cadastrado com sucesso' });
});

module.exports = router;
