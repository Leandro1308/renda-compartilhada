const express = require('express');
const fs = require('fs');
const router = express.Router();

const usuariosPath = './src/usuarios.json';

// Função para ler os usuários
function lerUsuarios() {
  const data = fs.readFileSync(usuariosPath);
  return JSON.parse(data);
}

// Função para salvar os usuários
function salvarUsuarios(usuarios) {
  fs.writeFileSync(usuariosPath, JSON.stringify(usuarios, null, 2));
}

// Gerar ID simples
function gerarId() {
  return Date.now().toString();
}

// Criar novo usuário com indicação
router.post('/cadastro', (req, res) => {
  const { nome, email, senha, indicadoPor } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });
  }

  const usuarios = lerUsuarios();
  const novoUsuario = {
    id: gerarId(),
    nome,
    email,
    senha,
    indicadoPor: indicadoPor || null,
    indicados: [],
    contaBancaria: null,
    comissoes: [],
    linkAfiliado: '', // será gerado após salvar
  };

  // Salva usuário
  usuarios.push(novoUsuario);
  novoUsuario.linkAfiliado = `https://clubedamente.com.br/inscricao?ref=${novoUsuario.id}`;
  salvarUsuarios(usuarios);

  // Adiciona aos indicados de quem o indicou
  if (indicadoPor) {
    const indicante = usuarios.find(u => u.id === indicadoPor);
    if (indicante) {
      indicante.indicados.push(novoUsuario.id);
      salvarUsuarios(usuarios);
    }
  }

  res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!', linkAfiliado: novoUsuario.linkAfiliado });
});

// Login
router.post('/login', (req, res) => {
  const { email, senha } = req.body;
  const usuarios = lerUsuarios();
  const usuario = usuarios.find(u => u.email === email && u.senha === senha);

  if (!usuario) {
    return res.status(401).json({ erro: 'Credenciais inválidas.' });
  }

  res.status(200).json({
    mensagem: 'Login realizado com sucesso!',
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      linkAfiliado: usuario.linkAfiliado,
      contaBancaria: usuario.contaBancaria,
      indicados: usuario.indicados,
      comissoes: usuario.comissoes
    }
  });
});

// Atualizar dados bancários (só 1 vez ou sobrescreve)
router.post('/conta-bancaria', (req, res) => {
  const { id, banco, agencia, conta } = req.body;
  const usuarios = lerUsuarios();
  const usuario = usuarios.find(u => u.id === id);

  if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' });

  usuario.contaBancaria = { banco, agencia, conta };
  salvarUsuarios(usuarios);

  res.status(200).json({ mensagem: 'Conta bancária atualizada com sucesso.' });
});

// Ver todos os usuários (admin)
router.get('/', (req, res) => {
  const usuarios = lerUsuarios();
  res.json(usuarios);
});

module.exports = router;
