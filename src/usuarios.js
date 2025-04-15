const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('./models/Usuario');
require('dotenv').config();

const router = express.Router();

// Cadastro
router.post('/cadastro', async (req, res) => {
  const { nome, email, senha, indicadoPor } = req.body;

  try {
    const existe = await Usuario.findOne({ email });
    if (existe) return res.status(400).json({ erro: 'Email já cadastrado' });

    const senhaHash = await bcrypt.hash(senha, 10);

    const novoUsuario = new Usuario({
      nome,
      email,
      senha: senhaHash,
      indicadoPor: indicadoPor || null,
      statusAssinatura: 'ativo',
      saldo: 0,
      renovacaoAutomatica: false
    });

    await novoUsuario.save();

    if (indicadoPor) {
      const indicante = await Usuario.findById(indicadoPor);
      if (indicante) {
        indicante.indicados.push(novoUsuario._id);
        await indicante.save();
      }
    }

    res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao cadastrar usuário' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(400).json({ erro: 'Email não encontrado' });

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) return res.status(400).json({ erro: 'Senha incorreta' });

    const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({ mensagem: 'Login realizado com sucesso', token });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao realizar login' });
  }
});

// Verificação
router.post('/verificar', async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findById(decoded.id);

    if (!usuario) return res.status(401).json({ erro: 'Usuário não encontrado' });

    res.json({
      sucesso: true,
      id: usuario._id,
      email: usuario.email,
      saldo: usuario.saldo,
      statusAssinatura: usuario.statusAssinatura,
      renovacaoAutomatica: usuario.renovacaoAutomatica,
      valorAssinatura: 2
    });

  } catch (error) {
    res.status(401).json({ erro: 'Token inválido' });
  }
});

// Renovar assinatura manualmente
router.post('/renovar', async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findById(decoded.id);

    if (usuario.saldo < 2) {
      return res.status(400).json({ mensagem: 'Saldo insuficiente para renovar.' });
    }

    usuario.saldo -= 2;
    usuario.statusAssinatura = 'ativo';
    await usuario.save();

    res.json({ mensagem: 'Assinatura renovada com sucesso!' });

  } catch (error) {
    res.status(401).json({ erro: 'Token inválido' });
  }
});

// Ativar / Desativar Renovação Automática
router.post('/renovacao-automatica', async (req, res) => {
  const { token, ativar } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findById(decoded.id);

    usuario.renovacaoAutomatica = ativar;
    await usuario.save();

    res.json({ mensagem: ativar ? 'Renovação automática ativada!' : 'Renovação automática desativada!' });

  } catch (error) {
    res.status(401).json({ erro: 'Token inválido' });
  }
});

module.exports = router;
