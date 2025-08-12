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
// Número aprovado para WhatsApp no Twilio (sem prefixo “whatsapp:” na variável)
const fromNumberRaw  = process.env.TWILIO_WHATSAPP_NUMBER;

// Prefixa “whatsapp:” se faltar
const fromNumber = fromNumberRaw.startsWith('whatsapp:')
  ? fromNumberRaw
  : `whatsapp:${fromNumberRaw}`;

const client = twilio(accountSid, authToken);

// 🚪 Rota para envio de mensagem de serviço via template
app.post('/send-message', async (req, res) => {
  try {
    const { to, template_id, Cliente, Pedido, Data } = req.body;

    if (!to || !template_id || !Cliente || !Pedido || !Data) {
      return res.status(400).json({
        error: 'Parâmetros "to", "template_id", "Cliente", "Pedido" e "Data" são obrigatórios.'
      });
    }

    // Normaliza o número do cliente
    const toNumber = to.startsWith('whatsapp:')
      ? to
      : `whatsapp:${to}`;

    console.log('📨 [SEND-MESSAGE] Payload recebido:', {
      toNumber, template_id, Cliente, Pedido, Data
    });

    const response = await client.messages.create({
      to:               toNumber,
      from:             fromNumber,
      contentSid:       template_id,
      contentVariables: JSON.stringify({
        '1': Cliente,
        '2': Pedido,
        '3': Data
      })
    });

    return res.status(200).json({ success: true, sid: response.sid });
  } catch (error) {
    console.error('❌ [SEND-MESSAGE] Erro ao enviar mensagem:', error);
    return res.status(500).json({ error: 'Erro ao enviar mensagem.' });
  }
});

// 🛍️ Rota para envio do catálogo promocional (3 mensagens)

// inicio do novo bloco

app.post('/send-catalogo', async (req, res) => {
  // filtro rápido: só executa o catálogo para inbound text
  // nos status callbacks e outros eventos devolve 200 e pára aqui
  if (req.body.Direction !== 'inbound' || req.body.MessageType !== 'text') {
    console.log('Webhook ignorado (não é inbound text):', req.body);
    return res.sendStatus(200);
  }

  // a partir daqui, tenho certeza que é um inbound text
  const rawClientNum = req.body.From || req.body.to;
  const to = rawClientNum.startsWith('whatsapp:')
    ? rawClientNum
    : `whatsapp:${rawClientNum}`;

  console.log('▶️ inbound text detectado, enviando catálogo para', to);

  try {
    await client.messages.create({ from: fromNumber, to, body: 'Segue nosso catálogo de promoções…' });
    await client.messages.create({ from: fromNumber, to,
      mediaUrl: ['https://drive.google.com/uc?export=view&id=1HYLcNxPXQR0c7-uVy3CzARigdcbJep3O']
    });
    await client.messages.create({ from: fromNumber, to,
      mediaUrl: ['https://drive.google.com/uc?export=view&id=1Rex51Lhmtn0DO2kSDHKSDio26zaVYARE']
    });
    return res.json({ success: true, message: 'Catálogo enviado.' });
  } catch (err) {
    console.error('Erro ao enviar catálogo:', err);
    return res.status(500).json({ error: 'Falha ao enviar catálogo.' });
  }
});



// fim do novo bloco


// 🚀 Inicializa o servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
