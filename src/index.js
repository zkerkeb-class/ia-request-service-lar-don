require('dotenv').config();
const express = require('express');
const OpenAI = require('openai');
const PORT = process.env.PORT;
const app = express();
const cors = require('cors');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const iaRouter = require('./routes/index');

app.use(express.json());
app.use(cors());
app.use('/ia-api', iaRouter);
app.set('openai', openai);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
