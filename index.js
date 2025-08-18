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
const fromNumberRaw  = process.env.TWILIO_WHATSAPP_NUMBER;

const fromNumber = fromNumberRaw.startsWith('whatsapp:')
  ? fromNumberRaw
  : `whatsapp:${fromNumberRaw}`;

const client = twilio(accountSid, authToken);

// 🚪 Rota para envio de mensagem de serviço via template
app.post('/send-message', async (req, res) => {
  try {
    const { to, to2, to3, template_id, Cliente, Pedido, Data, Mensagem } = req.body;

    if (!to || !template_id || !Cliente || !Pedido || !Data) {
      return res.status(400).json({
        error: 'Parâmetros "to", "template_id", "Cliente", "Pedido" e "Data" são obrigatórios.'
      });
    }

    const contentVariables = {
      '1': Cliente,
      '2': Pedido,
      '3': Data
    };

    if (Mensagem) {
      contentVariables['4'] = Mensagem;
    }

    const destinatarios = [to, to2, to3]
      .filter(num => typeof num === 'string' && num.trim() !== '')
      .map(num => num.startsWith('whatsapp:') ? num : `whatsapp:${num}`);

    console.log('📨 [SEND-MESSAGE] Enviando para:', destinatarios);
    console.log('📦 Variáveis:', contentVariables);

    const results = [];

    for (const numero of destinatarios) {
      try {
        const response = await client.messages.create({
          to: numero,
          from: fromNumber,
          contentSid: template_id,
          contentVariables: JSON.stringify(contentVariables)
        });

        results.push({ to: numero, sid: response.sid });
      } catch (err) {
        console.error(`❌ Erro ao enviar para ${numero}:`, err);
        results.push({ to: numero, error: true });
      }
    }

    return res.status(200).json({ success: true, results });
  } catch (error) {
    console.error('❌ [SEND-MESSAGE] Erro geral ao enviar mensagem:', error);
    return res.status(500).json({ error: 'Erro ao enviar mensagem.' });
  }
});

// 🛍️ Rota para envio do catálogo promocional (3 mensagens)

app.post('/send-catalogo', async (req, res) => {
  console.log('📥 Webhook /send-catalogo recebido:', req.body);

  const tipo = req.body.MessageType;
  if (req.body.SmsStatus !== 'received' || (tipo !== 'text' && tipo !== 'button')) {
    console.log(`🔇 Ignorando webhook (tipo "${tipo}" não é aceito).`);
    return res.sendStatus(200);
  }

  const rawClientNum = req.body.From;
  const to = rawClientNum.startsWith('whatsapp:')
    ? rawClientNum
    : `whatsapp:${rawClientNum}`;

  const payload = req.body.ButtonPayload?.trim().toLowerCase();
  const body    = req.body.Body?.trim().toLowerCase();

  const isPayloadOk = payload === 'ok';
  const isBodySim   = body === 'sim';
  const isBodyOk    = body === 'ok';

  if (!isPayloadOk && !isBodySim && !isBodyOk) {
    console.log('🛑 Condição não atendida. Catálogo não será enviado.');
    return res.sendStatus(200);
  }

  console.log('▶️ Condição atendida, enviando catálogo para', to);

  try {
    await client.messages.create({
      from: fromNumber,
      to,
      body: 'Segue nosso catálogo de promoções. Aproveite! 😉'
    });

    await client.messages.create({
      from: fromNumber,
      to,
      mediaUrl: ['https://drive.google.com/uc?export=view&id=1HYLcNxPXQR0c7-uVy3CzARigdcbJep3O']
    });

    await client.messages.create({
      from: fromNumber,
      to,
      mediaUrl: ['https://drive.google.com/uc?export=view&id=1Rex51Lhmtn0DO2kSDHKSDio26zaVYARE']
    });



    return res.sendStatus(204);
    
  } catch (error) {
    console.error('❌ [SEND-CATALOGO] Erro ao enviar catálogo:', error);
    return res.status(500).json({ error: 'Erro ao enviar catálogo.' });
  }
});

// 🚀 Inicializa o servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
