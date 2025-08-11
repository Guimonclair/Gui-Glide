const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Olá, Heloisa! Seu app está rodando no Railway 🚂');
});
<h1>Olá, Heloisa! Agora estamos no Render 🚀</h1>

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
