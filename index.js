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
// 🚪 Rota para envio de mensagem via template WhatsApp
app.post('/send-message', async (req, res) => {
  // 1️⃣ Destruturação dos parâmetros esperados
  const { to, template_id, Cliente, Pedido, Data } = req.body;

  // 2️⃣ Validação básica dos campos obrigatórios
  if (!to || !template_id || !Cliente || !Pedido || !Data) {
    return res.status(400).json({
      error: 'Parâmetros "to", "template_id", "Cliente", "Pedido" e "Data" são obrigatórios.'
    });
  }

  // 3️⃣ Normalização do número para WhatsApp
  const toNumber    = to.startsWith('whatsapp:')    ? to    : `whatsapp:${to}`;
  const fromNumber  = fromNumberRaw.startsWith('whatsapp:') 
                        ? fromNumberRaw 
                        : `whatsapp:${fromNumberRaw}`;

  // 4️⃣ Log dos dados recebidos (ajuda a ver exatamente o que chegou)
  console.log('📨 [SEND-MESSAGE] Payload recebido:', {
    toNumber, template_id, Cliente, Pedido, Data
  });

  try {
    // 5️⃣ Montagem do objeto de variáveis do template
    const contentVariables = {
      '1': Cliente,
      '2': Pedido,
      '3': Data
    };

    // 6️⃣ Chamada ao Twilio
    const response = await client.messages.create({
      to:               toNumber,
      from:             fromNumber,
      contentSid:       template_id,       
      contentVariables,                     
    });

    // 7️⃣ Sucesso: retorna o SID da mensagem
    return res.status(200).json({
      success: true,
      sid:     response.sid
    });

  } catch (error) {
    // 8️⃣ Log detalhado do erro no servidor
    console.error('❌ [SEND-MESSAGE] Erro ao enviar mensagem:', {
      message:   error.message,
      code:      error.code || null,
      moreInfo:  error.moreInfo || null,
      stack:     error.stack
    });

    // 9️⃣ Retorno ao cliente com detalhes mínimos para debug
    return res.status(500).json({
      error:     error.message,
      code:      error.code,
      moreInfo:  error.moreInfo
    });
  }
});


// 🛍️ Rota para envio do catálogo promocional (3 mensagens)
app.post('/send-catalogo', async (req, res) => {
  try {
    // 1) Se vier do Glide manualmente: req.body.to
    // 2) Se for callback do Twilio inbound: req.body.From
   const rawClientNum = req.body.to   ||
                     req.body.From ||
                     '';
const to = rawClientNum.startsWith('whatsapp:')
  ? rawClientNum
  : `whatsapp:${rawClientNum}`;

const from = process.env.TWILIO_WHATSAPP_NUMBER.startsWith('whatsapp:')
  ? process.env.TWILIO_WHATSAPP_NUMBER
  : `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;
    if (!rawClientNum) {
      return res
        .status(400)
        .json({ error: 'Nenhum número de cliente detectado em "to" ou "From".' });
    }
     console.log('DEBUG -> from:', from);
     console.log('DEBUG -> to:', to);

    //  Prefixa whatsapp: se faltar



console.log('Enviando de', from, 'para', to);



    // 1) Texto
    await client.messages.create({ from, to, body: 'Segue nosso catálogo de promoções. Aproveite! 😉' });

    // 2) Imagem página 1
    await client.messages.create({
      from,
      to,
      mediaUrl: ['https://drive.google.com/uc?export=view&id=1HYLcNxPXQR0c7-uVy3CzARigdcbJep3O']
    });

    // 3) Imagem página 2
    await client.messages.create({
      from,
      to,
      mediaUrl: ['https://drive.google.com/uc?export=view&id=1Rex51Lhmtn0DO2kSDHKSDio26zaVYARE']
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
