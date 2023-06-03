const axios = require("axios");

async function getPokemonDetail(arg) {
  try {
    const apiData = await axios.get(`https://pokeapi.co/api/v2/pokemon/${arg}`);
    const data = await apiData.data;
    const pokemonData = {
      id: data.id,
      name: data.name,
      img: data.sprites.other.home.front_default,
      types: data.types.map((e) => {
        return {
          name: e.type.name,
          img: `https://typedex.app/images/ui/types/dark/${e.type.name}.svg`,
        };
      }),
      hp: data.stats[0].base_stat, 
      attack: data.stats[1].base_stat,
      defense: data.stats[2].base_stat,
      speed: data.stats[5].base_stat,
      height: data.height,
      weight: data.weight,
    };
    return pokemonData;
  } catch (e) {
    console.log(e); 
  }
}

module.exports = getPokemonDetail
