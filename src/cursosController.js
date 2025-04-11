const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../cursos.json');

const getCursos = (req, res) => {
  const data = JSON.parse(fs.readFileSync(filePath));
  res.json(data);
};

module.exports = { getCursos };
