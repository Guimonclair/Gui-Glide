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
  console.log('📨 Dados recebidos no webhook:', req.body);

  const MessagingResponse = twilio.twiml.MessagingResponse;
  const twiml = new MessagingResponse();

  // Cria mensagem com texto explicativo e duas imagens
  const message = twiml.message();
  message.body('Seguem nossas promoções da semana. Aproveite para renovar seu estoque!');
  message.media('https://drive.google.com/uc?export=view&id=1HYLcNxPXQR0c7-uVy3CzARigdcbJep3O');
  message.media('https://drive.google.com/uc?export=view&id=1Rex51Lhmtn0DO2kSDHKSDio26zaVYARE');

  res.type('text/xml');
  res.send(twiml.toString());
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
});
