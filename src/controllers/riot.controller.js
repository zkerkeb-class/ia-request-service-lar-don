exports.getChampion = async (req, res) => {
  const { champion } = req.params;
  try {
    const response = await axios.get(
      `https://ddragon.leagueoflegends.com/cdn/14.8.1/data/fr_FR/champion/${champion}.json`
    );
    res.send(response.data.data[champion]);
  } catch (error) {
    console.error('Error calling Riot API:', error);
    res.status(500).send({ error: 'Failed to fetch champion data' });
  }
};

exports.getAllChampions = async (req, res) => {
  try {
    const response = await axios.get(
      'https://ddragon.leagueoflegends.com/cdn/14.8.1/data/fr_FR/champion.json'
    );
    res.send(response.data.data);
  } catch (error) {
    console.error('Error calling Riot API:', error);
    res.status(500).send({ error: 'Failed to fetch champion data' });
  }
};
