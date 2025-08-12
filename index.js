const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('✅ Backend está funcionando!');
});

// 🔐 Credenciais do Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

// 🚪 Rota para envio de mensagem de serviço via template
app.post('/send-message', async (req, res) => {
  try {
    const { to, template_id, Cliente, Pedido, Data } = req.body;

    if (!to || !template_id || !Cliente || !Pedido || !Data) {
      return res.status(400).json({ error: 'Parâmetros "to", "template_id", "Cliente", "Pedido" e "Data" são obrigatórios.' });
    }

    console.log('📨 Dados recebidos do Glide:', { to, template_id, Cliente, Pedido, Data });

    const response = await client.messages.create({
      to: to,
      from: fromNumber,
      contentSid: template_id,
      contentVariables: JSON.stringify({
        "1": Cliente,
        "2": Pedido,
        "3": Data
      })
    });

    res.status(200).json({ success: true, sid: response.sid });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ error: 'Erro ao enviar mensagem.' });
  }
});

// 🛍️ Rota para envio do catálogo promocional (3 mensagens)
app.post('/send-catalogo', async (req, res) => {
  try {
    const { To } = req.body;

    if (!To) {
      return res.status(400).json({ error: 'Parâmetro "To" é obrigatório.' });
    }

    console.log('🛍️ Enviando catálogo promocional para:', to);

    // Mensagem 1: texto
    await client.messages.create({
      from: `whatsapp:${fromNumber}`,
      to: `whatsapp:${To}`,
      body: 'Segue nosso catálogo de promoções. Aproveite para renovar seu estoque! 😉'
    });

    // Mensagem 2: imagem da primeira página
    await client.messages.create({
      from: `whatsapp:${fromNumber}`,
      to: `whatsapp:${To}`,
      // mediaUrl: ['https://drive.google.com/uc?export=view&id=1HYLcNxPXQR0c7-uVy3CzARigdcbJep3O']
      mediaUrl: ['https://i.imgur.com/ExdKOOz.png'] // imagem 1
    });

    // Mensagem 3: imagem da segunda página
    await client.messages.create({
      from: `whatsapp:${fromNumber}`,
      to: `whatsapp:${To}`,
     //  mediaUrl: ['https://drive.google.com/uc?export=view&id=1Rex51Lhmtn0DO2kSDHKSDio26zaVYARE']
      mediaUrl: ['https://i.imgur.com/ZF6s192.png'] // imagem 2

    });

    res.status(200).json({ success: true, message: 'Catálogo enviado com sucesso.' });
  } catch (error) {
    console.error('Erro ao enviar catálogo:', error);
    res.status(500).json({ error: 'Erro ao enviar catálogo.' });
  }
});

// 🚀 Inicializa o servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
