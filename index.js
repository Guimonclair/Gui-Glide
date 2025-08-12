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
app.use(express.urlencoded({ extended: true })); // Para receber dados de formulário

// Twilio client
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Rota principal
app.get('/', (req, res) => {
  res.send('Servidor Twilio WhatsApp está rodando 🚀');
});

// Rota para enviar mensagem de template
app.post('/send-message', async (req, res) => {
  const { to, templateName, ...rest } = req.body;

  const templateParams = Object.fromEntries(
    Object.entries(rest)
      .filter(([key]) => key.startsWith('templateParams.'))
      .map(([key, value]) => [key.split('.')[1], value])
  );

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

// 🆕 Rota para receber mensagens de clientes via webhook da Twilio

app.post('/webhook', (req, res) => {
  const from = req.body.From;
  const body = req.body.Body;
  const waId = req.body.WaId;

  console.log('📩 Mensagem recebida via webhook!');
  console.log(`De: ${from} | WhatsApp ID: ${waId}`);
  console.log(`Conteúdo: ${body}`);

  res.set('Content-Type', 'text/xml');
  res.status(200).send('<Response></Response>');
});


// Rota para debug de webhook
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

// Rota genérica
app.all('*', (req, res) => {
  res.status(200).json({
    message: 'Rota genérica ativada',
    method: req.method,
    path: req.path,
    headers: req.headers,
    body: req.body
  });
});

// Inicia o servidor

const app = express();

app.use(express.urlencoded({ extended: true }));

app.post('/webhook', (req, res) => {
  const { From, Body, WaId } = req.body;

  console.log('📩 Webhook recebido!');
  console.log(`De: ${From} | Conteúdo: ${Body} | WaId: ${WaId}`);

  res.set('Content-Type', 'text/xml');
  res.status(200).send('<Response></Response>');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});


