import axios from "axios"
require('dotenv').config();
const express = require('express');
const PORT = process.env.PORT;
import openai from "./config/open-ai";
import {getChampion} from "./controllers/riot.controller";
const app = express();
const cors = require('cors');

app.use(express.json());
app.use(cors());

let messageHistory = []
app.post('/chat', async (req, res) => {
    const { message,chatId,champion } = req.body;
    if (!message) {
        return res.status(400).send({ error: 'No message provided' });
    }
    if(chatId === undefined) {
        let contentChamp;
        await axios.get(`https://ddragon.leagueoflegends.com/cdn/14.8.1/data/fr_FR/champion/${champion}.json`)
            .then(response => {
                contentChamp = response.data;
            })
            .catch(error => {
                console.error('Erreur lors de l\'appel riot : ', error.response.data);
            })

        const content = ' Voici un champion du jeu League of Legend, voici toute ces informations au format json' +
            ' tu es desormais ce champion : ' + contentChamp
        await axios.post(`${process.env.BDD_API}/`,
            {
               content:content
            })
            .then(response => {
                messageHistory = response.data.history;
            })
            .catch(error => {
                console.error('Erreur lors de l\'appel BDD : ', error.response.data);
            })
    } else {
        await axios.get(`${process.env.BDD_API}/${chatId}`)
            .then(response => {
                messageHistory = response.data.history;
            })
            .catch(error => {
                console.error('Erreur lors de l\'appel BDD : ', error.response.data);
            })
    }

    try {
        const messages = messageHistory.map(([role,content]) => ({role,content}));
        messages.push({role: 'user', content:message});

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages,
        });

        const completionText = completion.data.choices[0].message.content
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

        return res.status(200).json({messageHistory : messageHistory});
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        res.status(500).send({ error: 'Failed to fetch response from OpenAI' });
    }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
