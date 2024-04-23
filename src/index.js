require('dotenv').config();
const express = require('express');
const OpenAI = require('openai');
const PORT = process.env.PORT;
const app = express();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
app.use(express.json());
app.use('/ia-api', require('./routes/index'));
app.set('openai', openai);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
