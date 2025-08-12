app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // Adicionado para aceitar JSON

app.post('/webhook', async (req, res) => {
  console.log('📨 Dados recebidos no webhook:', req.body);

  const from = `whatsapp:${req.body.From}`; // Garante o prefixo
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

  try {
    await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_NUMBER}`,
      to: from,
      body: 'Seguem nossas promoções da semana. Aproveite para renovar seu estoque!'
    });

    await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_NUMBER}`,
      to: from,
      mediaUrl: [https://drive.google.com/uc?export=view&id=1HYLcNxPXQR0c7-uVy3CzARigdcbJep3O]
    });

    await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_NUMBER}`,
      to: from,
      mediaUrl: ['https://drive.google.com/uc?export=view&id=1Rex51Lhmtn0DO2kSDHKSDio26zaVYARE']
    });

    res.sendStatus(204);
    
  } catch (error) {
    console.error('Erro ao enviar mensagens:', error);
    res.status(500).send('Erro ao enviar mensagens');
  }
});
