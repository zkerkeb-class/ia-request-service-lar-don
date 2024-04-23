require('dotenv').config();
const express = require('express');
const OpenAI = require("openai");

const app = express();
app.use(express.json());



const openai = new OpenAI({
    apiKey: 'sk-proj-VFzFhic1bGzqB1rYGsZdT3BlbkFJPkMelIrDHwbHopMjCWRb',
});

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).send({ error: 'No message provided' });
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    "role": "user",
                    "content": message
                }
            ],
            temperature: 1,
            max_tokens: 150,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        });

        res.send({ reply: response });
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        res.status(500).send({ error: 'Failed to fetch response from OpenAI' });
    }
});

const PORT = 4004;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
