const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

const usuariosPath = path.join(__dirname, 'marketing-multinivel', 'usuarios.json');

// Função para ler os usuários
function lerUsuarios() {
  try {
    const dados = fs.readFileSync(usuariosPath, 'utf-8');
    return JSON.parse(dados);
  } catch (error) {
    return [];
  }
}

// Função para salvar os usuários
function salvarUsuarios(usuarios) {
  fs.writeFileSync(usuariosPath, JSON.stringify(usuarios, null, 2), 'utf-8');
}

// Cadastro de novo usuário
app.post('/api/cadastrar', (req, res) => {
  const { nome, email, senha, indicadoPor } = req.body;
  const usuarios = lerUsuarios();

  const id = Date.now();

  const novoUsuario = {
    id,
    nome,
    email,
    senha,
    indicadoPor: indicadoPor || null,
    indicados: [],
    comissao: 0,
    dataCadastro: new Date().toISOString()
  };

  usuarios.push(novoUsuario);

  // Atualiza a árvore de indicação (níveis 1 a 3)
  if (indicadoPor) {
    const nivel1 = usuarios.find(u => u.email === indicadoPor);
    if (nivel1) {
      nivel1.indicados.push(email);
      nivel1.comissao += 2;

      const nivel2 = usuarios.find(u => u.email === nivel1.indicadoPor);
      if (nivel2) {
        nivel2.comissao += 0.70;

        const nivel3 = usuarios.find(u => u.email === nivel2.indicadoPor);
        if (nivel3) {
          nivel3.comissao += 0.30;
        }
      }
    }
  }

  salvarUsuarios(usuarios);
  res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!' });
});

// Login
app.post('/api/login', (req, res) => {
  const { email, senha } = req.body;
  const usuarios = lerUsuarios();
  const usuario = usuarios.find(u => u.email === email && u.senha === senha);

  if (usuario) {
    res.json(usuario);
  } else {
    res.status(401).json({ erro: 'Usuário ou senha inválidos' });
  }
});

// Obter painel do usuário
app.get('/api/usuario/:email', (req, res) => {
  const usuarios = lerUsuarios();
  const usuario = usuarios.find(u => u.email === req.params.email);

  if (usuario) {
    res.json(usuario);
  } else {
    res.status(404).json({ erro: 'Usuário não encontrado' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
