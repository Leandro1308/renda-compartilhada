const express = require("express");
const app = express();
app.get("/", (req, res) => {
  res.send("Funcionando! 🚀");
});
app.listen(3000);
