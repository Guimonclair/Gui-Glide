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
app.post('/webhook', async (req, res) => {
  console.log('📨 Dados recebidos no webhook:', req.body);

  const from = req.body.From; // número do cliente
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

  try {
    // Mensagem 1: apenas o texto explicativo
    await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_NUMBER}`,
      to: from,
      body: 'Seguem nossas promoções da semana. Aproveite para renovar seu estoque!'
    });

    // Mensagem 2: primeira imagem
    await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_NUMBER}`,
      to: from,
      mediaUrl: ['https://drive.google.com/uc?export=view&id=1HYLcNxPXQR0c7-uVy3CzARigdcbJep3O']
    });

    // Mensagem 3: segunda imagem
    await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_NUMBER}`,
      to: from,
      mediaUrl: ['https://drive.google.com/uc?export=view&id=1Rex51Lhmtn0DO2kSDHKSDio26zaVYARE']
    });

    res.sendStatus(200);
  } catch (error) {
    console.error('Erro ao enviar mensagens:', error.message);
    res.status(500).send('Erro ao enviar mensagens');
  }
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
});
