const { getAllPokemon } = require("./getFromApiDb");

const getPokemonRute = async (req, res) => {
  const { name } = req.query;
  const allPokesName = await getAllPokemon();

  try {
    if (name) {
      const poke = allPokesName.filter(
        (e) => e.name.toLowerCase() === name.toLowerCase()
      );

      if (poke.length) {
        res.status(200).send(poke);
      } else {
        res.status(404).send("Pokemon not found");
      }
    } else {
      const pokemons = await getAllPokemon();
      res.status(200).send(pokemons);
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = getPokemonRute;
