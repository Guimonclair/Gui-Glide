const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');

const app = express();
const port = process.env.PORT || 3000;

// Middleware para interpretar dados do tipo x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Rota principal para teste
app.get('/', (req, res) => {
  res.send('Servidor Twilio WhatsApp está rodando 🚀');
});

// Rota do webhook
app.post('/webhook', (req, res) => {
  // Log dos dados recebidos no terminal
  console.log('📨 Dados recebidos no webhook:', req.body);

  // Cria resposta Twilio (TwiML)
  const MessagingResponse = twilio.twiml.MessagingResponse;
  const twiml = new MessagingResponse();

  // Mensagem de resposta automática
  twiml.message('Olá! Recebemos sua mensagem 😊');

  // Envia resposta como XML
  res.type('text/xml');
  res.send(twiml.toString());
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
});
