const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');

const app = express();

const whatsappFrom = `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`;


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('✅ Backend está funcionando!');
});

// 🔐 Credenciais do Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken  = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

// 🚪 Rota para envio de mensagem de serviço via template
app.post('/send-message', async (req, res) => {
  try {
    const { to, template_id, Cliente, Pedido, Data } = req.body;
    if (!to || !template_id || !Cliente || !Pedido || !Data) {
      return res
        .status(400)
        .json({ error: 'Parâmetros "to", "template_id", "Cliente", "Pedido" e "Data" são obrigatórios.' });
    }

    console.log('📨 Dados recebidos do Glide:', { to, template_id, Cliente, Pedido, Data });

    const response = await client.messages.create({
      to: to,
      from: fromNumber,
      contentSid: template_id,
      contentVariables: JSON.stringify({ "1": Cliente, "2": Pedido, "3": Data })
    });

    res.status(200).json({ success: true, sid: response.sid });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ error: 'Erro ao enviar mensagem.' });
  }
});


// 🛍️ Rota para envio do catálogo promocional (3 mensagens)
app.post('/send-catalogo', async (req, res) => {
  // 1) Inspecione o que chega no corpo
  console.log('📥 Payload do catálogo:', req.body);

  // 2) Leia apenas o campo "to" (cliente)
  const toRaw = req.body.to;
  if (!toRaw) {
    return res
      .status(400)
      .json({ error: 'Parâmetro "to" (número do cliente) é obrigatório.' });
  }

  // 3) Monte os valores finais com prefixo
  const whatsappTo   = toRaw.startsWith('whatsapp:') 
    ? toRaw 
    : `whatsapp:${toRaw}`;
  const whatsappFrom = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;

  console.log('Enviando catálogo de', whatsappFrom, 'para', whatsappTo);

  try {
    // Mensagem de texto
    await client.messages.create({
      from: whatsappFrom,
      to:   whatsappTo,
      body: 'Segue nosso catálogo de promoções. Aproveite! 😉'
    });

    // Imagem 1
    await client.messages.create({
      from:     whatsappFrom,
      to:       whatsappTo,
      mediaUrl: ['https://i.imgur.com/ExdKOOz.png']
    });

    // Imagem 2
    await client.messages.create({
      from:     whatsappFrom,
      to:       whatsappTo,
      mediaUrl: ['https://i.imgur.com/ZF6s192.png']
    });

    return res
      .status(200)
      .json({ success: true, message: 'Catálogo enviado com sucesso.' });

  } catch (error) {
    console.error('Erro ao enviar catálogo:', error);
    return res
      .status(500)
      .json({ error: 'Erro ao enviar catálogo.' });
  }
});


// 🚀 Inicializa o servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
