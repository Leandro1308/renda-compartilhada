import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ✅ ROTA DE VERIFICAÇÃO
app.post('/verificar', (req, res) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', () => {
    try {
      const { token } = JSON.parse(body);
      const usuarios = JSON.parse(fs.readFileSync(path.join(__dirname, 'usuarios.json'), 'utf-8'));
      const usuario = usuarios.find(u => u.token === token);

      if (usuario) {
        res.status(200).json({ autenticado: true, email: usuario.email });
      } else {
        res.status(401).json({ autenticado: false });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ erro: 'Erro no servidor' });
    }
  });
});

// ✅ INICIAR SERVIDOR
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
