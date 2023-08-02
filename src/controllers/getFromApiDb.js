const { Pokemon, Type } = require("../db");
const axios = require("axios");

const TOTAL_POKEMONS = 500;
let cachedPokemonData = null;

const getApiInfo = async (page) => {
  try {
    const response = await axios.get(
      `https://pokeapi.co/api/v2/pokemon?limit=12&offset=${(page - 1) * 12}`
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

      // Insertar el Pokémon en la base de datos
      try {
        const createdPokemon = await Pokemon.create({
          id: pokemonData.id,
          name: pokemonData.name,
          img: pokemonData.sprites.other.home.front_default,
          hp: pokemonData.stats[0].base_stat,
          attack: pokemonData.stats[1].base_stat,
          defense: pokemonData.stats[2].base_stat,
          speed: pokemonData.stats[5].base_stat,
          height: pokemonData.height,
          weight: pokemonData.weight,
          createdInBd: true,
        });

        // Asociar los tipos del Pokémon a través de la tabla intermedia 'pokemon_types'
        for (const type of types) {
          const [createdType] = await Type.findOrCreate({
            where: { name: type.name },
            defaults: { img: type.img },
          });
          await createdPokemon.addType(createdType);
        }

        return {
          id: createdPokemon.id,
          name: createdPokemon.name,
          img: createdPokemon.img,
          types: types,
          hp: createdPokemon.hp,
          attack: createdPokemon.attack,
          defense: createdPokemon.defense,
          speed: createdPokemon.speed,
          height: createdPokemon.height,
          weight: createdPokemon.weight,
          createdInBd: true,
        };
      } catch (error) {
        console.error(
          "Error al insertar el Pokémon en la base de datos:",
          error
        );
        return null;
      }
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
  if (cachedPokemonData) {
    // Si los datos están en caché, devolverlos directamente
    return cachedPokemonData;
  }

  let allPokemon = [];

  const totalPages = Math.ceil(TOTAL_POKEMONS / 12);

  for (let page = 1; page <= totalPages; page++) {
    const apiInfo = await getApiInfo(page);
    allPokemon = allPokemon.concat(apiInfo);
  }

  const dbInfo = await getDbInfo();
  allPokemon = allPokemon.concat(dbInfo);

  // Almacenar los datos en caché o en una variable global
  cachedPokemonData = allPokemon;

  return allPokemon;
};

module.exports = {
  getApiInfo,
  getDbInfo,
  getAllPokemon,
};
