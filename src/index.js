const axios = require('axios');
require('dotenv').config();
const express = require('express');
const PORT = process.env.PORT;
const openai = require('./config/open-ai');
const app = express();
const cors = require('cors');

app.use(express.json());
app.use(cors());

let messageHistory = []
let chatId;
app.post('/chat', async (req, res) => {
    const { message,champion } = req.body;
    if (!message) {
        return res.status(400).send({ error: 'No message provided' });
    }
    if(!req.body.chatId) {
        let contentChamp;
        await axios.get(`https://ddragon.leagueoflegends.com/cdn/14.8.1/data/fr_FR/champion/${champion}.json`)
            .then(response => {
                contentChamp = response.data;
            })
            .catch(error => {
                console.error('Erreur lors de l\'appel riot : ', error.response.data);
            })

        const content = ' Voici un champion du jeu League of Legend, voici toute ces informations au format json' +
            ' incarne ce champion et adapte ton caractère et ta façon de parler par rapport à son histoire et son caractère dans le jeu: ' + JSON.stringify(contentChamp)
        await axios.post(`${process.env.BDD_API}/`,
            {
               content:content
            })
            .then(response => {
                messageHistory = response.data.history;
                chatId = response.data._id
            })
            .catch(error => {
                console.error('Erreur lors de l\'appel BDD : ', error);
            })
    } else {
        await axios.get(`${process.env.BDD_API}/${req.body.chatId}`)
            .then(response => {
                messageHistory = response.data.history;
                chatId = response.data._id
            })
            .catch(error => {
                console.error('Erreur lors de l\'appel BDD : ', error.response.data);
            })
    }

    try {
        const messages = messageHistory.map(({ role, content }) => ({ role, content }));

        messages.push({role: 'user', content:message});

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages,
        });

        const completionText = completion.choices[0].message.content
        messageHistory.push({role: 'user', content:message});
        messageHistory.push({role: 'assistant', content: completionText});

        await axios.put(`${process.env.BDD_API}/${chatId}`,{
            history:[{role: 'user', content:message},{role: 'assistant', content: completionText}]
        })
            .then(response => {
                messageHistory = response.data.history;
            })
            .catch(error => {
                console.error('Erreur lors de l\'appel BDD : ', error.response.data);
            })

        return res.status(200).json({_id:chatId,messageHistory : messageHistory});
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        res.status(500).send({ error: 'Failed to fetch response from OpenAI' });
    }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
