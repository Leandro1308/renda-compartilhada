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
    });

    await novoUsuario.save();

    // Adicionar como indicado
    if (indicadoPor) {
      const indicante = await Usuario.findById(indicadoPor);
      if (indicante) {
        indicante.indicados.push(novoUsuario._id);
        await indicante.save();
      }
    }

    // PAGAMENTO DAS COMISSÕES MMN (simulando valor de R$40 da assinatura)
    let nivel1 = await Usuario.findById(novoUsuario.indicadoPor);
    if (nivel1) {
      nivel1.saldo += 40 * 0.4;
      await nivel1.save();

      let nivel2 = await Usuario.findById(nivel1.indicadoPor);
      if (nivel2) {
        nivel2.saldo += 40 * 0.07;
        await nivel2.save();

        let nivel3 = await Usuario.findById(nivel2.indicadoPor);
        if (nivel3) {
          nivel3.saldo += 40 * 0.03;
          await nivel3.save();
        }
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

module.exports = router;
