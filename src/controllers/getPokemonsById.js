const { getAllPokemon } = require("./getFromApiDb");

const getPokemonById = async (req, res) => {
  const { id } = req.params;
  const allPokesId = await getAllPokemon();

  try {
    if (id) {
      const pokemonById = allPokesId.filter((e) => e.id == id);

      if (pokemonById.length) {
        res.status(200).send(pokemonById);
      } else {
        res.status(404).send("Pokemon not found");
      }
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = getPokemonById;
