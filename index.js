// index.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const twilio = require('twilio');

// Carrega variáveis do .env
dotenv.config();

// Inicializa o app
const app = express();
app.use(cors());
app.use(express.json());

// Twilio client
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// Rota principal
app.get('/', (req, res) => {
  res.send('Servidor Twilio WhatsApp está rodando 🚀');
});

// Rota para enviar mensagem de template
app.post('/send-message', async (req, res) => {
  const { to, templateName, templateParams } = req.body;

  try {
    const response = await client.messages.create({
      to: `whatsapp:${to}`,
      from: `whatsapp:${process.env.TWILIO_NUMBER}`,
      contentSid: templateName,
      contentVariables: JSON.stringify(templateParams)
    });

    res.send({ success: true, sid: response.sid });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error.message);
    res.status(500).send({ success: false, error: error.message });
  }
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});


app.post('/debug-webhook', (req, res) => {
  console.log('🔍 Webhook recebido!');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);

  res.status(200).json({
    message: 'Webhook recebido com sucesso!',
    receivedHeaders: req.headers,
    receivedBody: req.body
  });
});
