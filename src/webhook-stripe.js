const express = require('express');
const fs = require('fs');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

// Rota do webhook
router.post('/webhook-stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Erro ao verificar webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Evento de pagamento concluído
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.customer_email;

    // Ler usuários
    const usuariosPath = './src/usuarios.json';
    let usuarios = JSON.parse(fs.readFileSync(usuariosPath));

    const usuario = usuarios.find(u => u.email === email);
    if (!usuario) {
      console.log('Usuário não encontrado com email:', email);
      return res.status(200).send('OK'); // Não impede o Stripe
    }

    // Ativar assinatura
    usuario.status = 'ativo';
    usuario.ultimaAssinatura = new Date().toISOString();

    // Distribuição de comissões
    const valor = 1.00;
    const nivel1 = usuarios.find(u => u.codigo === usuario.indicador);
    const nivel2 = nivel1 && usuarios.find(u => u.codigo === nivel1.indicador);
    const nivel3 = nivel2 && usuarios.find(u => u.codigo === nivel2.indicador);

    if (nivel1) nivel1.saldo = (nivel1.saldo || 0) + (valor * 0.40);
    if (nivel2) nivel2.saldo = (nivel2.saldo || 0) + (valor * 0.07);
    if (nivel3) nivel3.saldo = (nivel3.saldo || 0) + (valor * 0.03);

    // Salvar alterações
    fs.writeFileSync(usuariosPath, JSON.stringify(usuarios, null, 2));

    console.log('Assinatura confirmada e comissões distribuídas para:', email);
  }

  res.status(200).send('Webhook recebido com sucesso');
});

module.exports = router;
