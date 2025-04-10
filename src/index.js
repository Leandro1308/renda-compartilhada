const express = require('express')
const mongoose = require('mongoose')

const app = express()

app.use(express.json())

const PORT = process.env.PORT || 8080
const MONGODB_URI = process.env.MONGODB_URI

// Conexão com MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Conectado ao MongoDB com sucesso!'))
  .catch((error) => console.log('Erro ao conectar ao MongoDB:', error))

app.get('/', (req, res) => {
  res.send('API está funcionando perfeitamente!')
})

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})
