const axios = require("axios");
const { Pokemon, Type } = require("../db");

// Función para obtener la información de la API
const getApiInfo = async () => {
  try {
    let url = "https://pokeapi.co/api/v2/pokemon/";
    let pokemones = [];

    do {
      let info = await axios.get(url);
      let pokemonesApi = info.data;
      let auxPokemones = pokemonesApi.results.map((e) => {
        return {
          name: e.name,
          url: e.url,
        };
      });

      pokemones.push(...auxPokemones);
      url = pokemonesApi.next;
    } while (url != null && pokemones.length < 40); // Puedes ajustar el límite de pokemones aquí

    let pokesWithData = await Promise.all(
      pokemones.map(async (e) => {
        let pokemon = await axios.get(e.url);
        return {
          id: pokemon.data.id,
          name: pokemon.data.name,
          img: pokemon.data.sprites.other.home.front_default,
          types: pokemon.data.types.map((e) => {
            return {
              name: e.type.name,
              img: `https://typedex.app/images/ui/types/dark/${e.type.name}.svg`,
            };
          }),
          hp: pokemon.data.stats[0].base_stat,
          attack: pokemon.data.stats[1].base_stat,
          defense: pokemon.data.stats[2].base_stat,
          speed: pokemon.data.stats[5].base_stat,
          height: pokemon.data.height,
          weight: pokemon.data.weight,
        };
      })
    );

    return pokesWithData;
  } catch (e) {
    console.log(e);
  }
};

// Función para obtener la información de todos los Pokémon en la base de datos
const getDbInfo = async () => {
  return await Pokemon.findAll({
    include: {
      model: Type,
      attributes: ["name"],
      through: {
        attributes: [],
      },
    },
  });
};

// Función para obtener todos los Pokémon, tanto de la API como de la base de datos
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
