exports.getChampion = async (req, res) => {
  const { champion } = req.params;
  try {
    fetch(
      `https://ddragon.leagueoflegends.com/cdn/14.8.1/data/fr_FR/champion/${champion}.json`
    )
      .then((response) => response.json())
      .then((data) => {
        res.send(data);
      });
  } catch (error) {
    console.error('Error calling Riot API:', error);
    res.status(500).send({ error: 'Failed to fetch champion data' });
  }
};

exports.getAllChampions = async (req, res) => {
  try {
    fetch(
      'https://ddragon.leagueoflegends.com/cdn/14.8.1/data/fr_FR/champion.json'
    )
      .then((response) => response.json())
      .then((data) => {
        res.send(data);
      });
  } catch (error) {
    console.error('Error calling Riot API:', error);
    res.status(500).send({ error: 'Failed to fetch champion data' });
  }
};
