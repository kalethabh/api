const { Pokemon, Type } = require("../db");
const { getAllPokemon } = require("./getFromApiDb");

const createPokemon = async (req, res) => {
  const { name, hp, attack, defense, speed, height, weight, img, types } =
    req.body;
  try {
    if (name) {
      const allPoke = await getAllPokemon();
      const isPoke = allPoke.find((e) => e.name === name.toLowerCase());
      if (!isPoke) {
        const pokemon = await Pokemon.create({
          name,
          hp,
          attack,
          defense,
          speed,
          height,
          weight,
          img,
        });

        const typeDb = await Type.findAll({
          where: {
            name: types,
          },
        });
        pokemon.addType(typeDb);
        return res.status(200).send("Pokemon created succesfully");
      }
      return res.status(404).send("Pokemon name already exist");
    }
    if (!name) return res.status(404).send("Pokemon name is obligatory");
  } catch (e) {
    console.log(e);
  }
};

module.exports = createPokemon;
