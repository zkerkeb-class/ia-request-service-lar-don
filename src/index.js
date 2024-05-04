const axios = require('axios');
require('dotenv').config();
const express = require('express');
const PORT = process.env.PORT;
const openai = require('./config/open-ai');
const app = express();
const cors = require('cors');
const { webMetrics } = require('./utils/webMetrics');

app.use(express.json());
app.use(cors());

app.get('/metrics', webMetrics);

let messageHistory = [];
let chatId;
app.post('/chat', async (req, res) => {
  const { message, champion } = req.body;
  if (!message) {
    return res.status(400).send({ error: 'No message provided' });
  }
  if (!req.body.chatId) {
    let contentChamp;
    await axios
      .get(`${process.env.LOL_API_URL}/champion/${champion}.json`)
      .then((response) => {
        contentChamp = response.data;
      })
      .catch((error) => {
        console.error("Erreur lors de l'appel riot : ", error.response.data);
      });

    const content = `Vous incarnez maintenant un personnage basé sur des données structurées fournies dans un objet JSON. Vous devez lire et interpréter ces données pour comprendre et adopter les traits, le rôle, l'histoire et le style de communication du personnage. Utilisez ces informations pour façonner vos réponses de manière à ce qu'elles reflètent authentiquement la voix, le ton, et les perspectives du personnage dans diverses interactions. Voici les éléments clés à considérer : 
    - **Nom et Rôle** : Identifiez le nom et le rôle du personnage dans son univers;
    - **Traits de Personnalité** : Absorbez les traits de personnalité décrits pour influencer le ton et le style de vos réponses, notamment des onomatopés ou des manières de tourner sa phrase;
    - **Expériences Marquantes** : Utilisez les événements clés de l'histoire du personnage pour donner du contexte à vos réponses;
    - **Langage et Jargon Spécifique** : Adaptez votre langage pour inclure tout jargon ou style de langage spécifique au personnage. 

    Incarne le champion comme si nous nous croisions dans la faille de l'invocateur. Donc si un champion ne parle pas dans le jeu, il ne sera pas capable de parler quand tu l'incarneras. Voici l'objet JSON : ${JSON.stringify(
      contentChamp
    )}`;

    await axios
      .post(`${process.env.BDD_API}/`, {
        content: content,
      })
      .then((response) => {
        messageHistory = response.data.history;
        chatId = response.data._id;
      })
      .catch((error) => {
        console.error("Erreur lors de l'appel BDD : ", error);
      });
  } else {
    await axios
      .get(`${process.env.BDD_API}/${req.body.chatId}`)
      .then((response) => {
        messageHistory = response.data.history;
        chatId = response.data._id;
      })
      .catch((error) => {
        console.error("Erreur lors de l'appel BDD : ", error.response.data);
      });
  }

  try {
    const messages = messageHistory.map(({ role, content }) => ({
      role,
      content,
    }));

    messages.push({ role: 'user', content: message });

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
    });

    const completionText = completion.choices[0].message.content;
    messageHistory.push({ role: 'user', content: message });
    messageHistory.push({ role: 'assistant', content: completionText });

    await axios
      .put(`${process.env.BDD_API}/${chatId}`, {
        history: [
          { role: 'user', content: message },
          { role: 'assistant', content: completionText },
        ],
      })
      .then((response) => {
        messageHistory = response.data.history;
      })
      .catch((error) => {
        console.error("Erreur lors de l'appel BDD : ", error.response.data);
      });

    return res
      .status(200)
      .json({ _id: chatId, messageHistory: messageHistory });
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    res.status(500).send({ error: 'Failed to fetch response from OpenAI' });
  }
});

app.listen(PORT, () => {
  console.info(`[IA] Server is running on port ${PORT}`);
});
