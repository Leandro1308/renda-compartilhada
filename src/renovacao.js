const Usuario = require('./models/Usuario');

async function renovarAssinaturas() {
  const usuarios = await Usuario.find({ renovacaoAutomatica: true, statusAssinatura: 'inativo' });

  for (const u of usuarios) {
    if (u.saldo >= 2) {
      u.saldo -= 2;
      u.statusAssinatura = 'ativo';
      await u.save();
      console.log(`Assinatura renovada automaticamente para ${u.email}`);
    }
  }
}

module.exports = renovarAssinaturas;
