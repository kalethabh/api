const axios = require("axios");
const { Pokemon, Type } = require("../db");

const getApiInfo = async () => {
  try {
    const response = await axios.get(
      "https://pokeapi.co/api/v2/pokemon?limit=100"
    );
    const results = response.data.results;

    const pokemonPromises = results.map(async (result) => {
      const pokemonResponse = await axios.get(result.url);
      const pokemonData = pokemonResponse.data;

      const types = pokemonData.types.map((type) => ({
        name: type.type.name,
        img: `https://typedex.app/images/ui/types/dark/${type.type.name}.svg`,
      }));

      const existingPokemon = await Pokemon.findOne({
        where: { name: pokemonData.name },
      });
      if (existingPokemon) {
        return null;
      }

      return {
        id: pokemonData.id,
        name: pokemonData.name,
        img: pokemonData.sprites.other.home.front_default,
        types: types,
        hp: pokemonData.stats[0].base_stat,
        attack: pokemonData.stats[1].base_stat,
        defense: pokemonData.stats[2].base_stat,
        speed: pokemonData.stats[5].base_stat,
        height: pokemonData.height,
        weight: pokemonData.weight,
        created: false,
      };
    });

    const pokemons = await Promise.all(pokemonPromises);
    const filteredPokemons = pokemons.filter((pokemon) => pokemon !== null);
    return filteredPokemons;
  } catch (error) {
    console.log(error);
    return [];
  }
};

const getDbInfo = async () => {
  try {
    const arrayPokemonsDb = await Pokemon.findAll({
      include: {
        attributes: ["name"],
        model: Type,
        through: {
          attributes: [],
        },
      },
    });

    return arrayPokemonsDb.map((pokemon) => ({
      id: pokemon.id,
      name: pokemon.name,
      img: pokemon.img,
      types: pokemon.types.map((type) => ({
        name: type.name,
        img: type.img,
      })),
      hp: pokemon.hp,
      attack: pokemon.attack,
      defense: pokemon.defense,
      speed: pokemon.speed,
      height: pokemon.height,
      weight: pokemon.weight,
      createdInBd: true,
    }));
  } catch (error) {
    console.log(error);
    return [];
  }
};


const getAllPokemon = async () => {
  const apiInfo = await getApiInfo();
  const dbInfo = await getDbInfo();
  const allPokemon = apiInfo.concat(dbInfo);
  return allPokemon;
};

module.exports = {
  getApiInfo,
  getDbInfo,
  getAllPokemon,
};
