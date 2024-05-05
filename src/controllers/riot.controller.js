exports.getChampion = async (req, res) => {
  const { champion } = req.params;
  try {
    fetch(`${process.env.LOL_API_URL}/champion/${champion}.json`)
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
    fetch(`${process.env.LOL_API_URL}/champion.json`)
      .then((response) => response.json())
      .then((data) => {
        res.send(data);
      });
  } catch (error) {
    console.error('Error calling Riot API:', error);
    res.status(500).send({ error: 'Failed to fetch champion data' });
  }
};

exports.getChampionBio = async (req, res) => {
  const { champion } = req.params;

  try {
    fetch(`${process.env.LOL_UNIVERSE_URL}/story/champion/${champion}/`).then(
      (data) => {
        res.send(data);
      }
    );
  } catch (error) {
    console.error('Error calling Riot Universe Website:', error);
    res.status(500).send({ error: 'Failed to fetch champion bio' });
  }
};
