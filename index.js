const express    = require('express');
const bodyParser = require('body-parser');
const twilio     = require('twilio');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('✅ Backend está funcionando!');
});

// 🔐 Credenciais do Twilio
const accountSid     = process.env.TWILIO_ACCOUNT_SID;
const authToken      = process.env.TWILIO_AUTH_TOKEN;
const whatsappSender = process.env.TWILIO_WHATSAPP_NUMBER; 
// Exemplo: TWILIO_WHATSAPP_NUMBER=+15076903704 (sem prefixo)

const client = twilio(accountSid, authToken);

// ... sua rota /send-message permanece igual ...

// 🛍️ Rota para envio do catálogo promocional (3 mensagens)
app.post('/send-catalogo', async (req, res) => {
  try {
    // 1) Se vier do Glide manualmente: req.body.to
    // 2) Se for callback do Twilio inbound: req.body.From
    const rawClientNum = req.body.to   ||
                         req.body.To   || 
                         req.body.From || 
                         req.body.from;

    if (!rawClientNum) {
      return res
        .status(400)
        .json({ error: 'Nenhum número de cliente detectado em "to" ou "From".' });
    }
     console.log('DEBUG -> from:', from);
     console.log('DEBUG -> to:', to);

    //  Prefixa whatsapp: se faltar

const rawClientNum = req.body.to   ||
                     req.body.From ||
                     '';
const to = rawClientNum.startsWith('whatsapp:')
  ? rawClientNum
  : `whatsapp:${rawClientNum}`;

const from = process.env.TWILIO_WHATSAPP_NUMBER.startsWith('whatsapp:')
  ? process.env.TWILIO_WHATSAPP_NUMBER
  : `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;

console.log('Enviando de', from, 'para', to);



    // 1) Texto
    await client.messages.create({ from, to, body: 'Segue nosso catálogo de promoções. Aproveite! 😉' });

    // 2) Imagem página 1
    await client.messages.create({
      from,
      to,
      mediaUrl: ['https://i.imgur.com/ExdKOOz.png']
    });

    // 3) Imagem página 2
    await client.messages.create({
      from,
      to,
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
