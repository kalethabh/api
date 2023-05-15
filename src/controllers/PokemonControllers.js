const axios = require("axios");
const { Pokemon, Type } = require("../db");
const { Sequelize } = require("sequelize");
const { URL, AMOUNT_POKEMONSNEXT} = process.env;

async function getPokemonsApi() {
  let arrayPokemonsApi = [];

  // carga de pokeAPI -----------------------------------------
  await axios
    .get(`${URL}?limit=${AMOUNT_POKEMONSNEXT}`)
    .then(async (response) => {
      let arrayResultApi = response.data.results;
      let arrayPromises = [];
      arrayResultApi.map((p) => arrayPromises.push(axios.get(p.url)));
      // se obtiene uno por uno los datos de cada pokemon

      await Promise.all(arrayPromises)
        .then((pokemons) => {
          arrayPokemonsApi = pokemons.map((p) => {
            return {
              id: p.data.id,
              name: p.data.name,
              image: p.data.sprites.other.dream_world.front_default, // url imagen
              hp: p.data.stats[0].base_stat,
              attack: p.data.stats[1].base_stat,
              defense: p.data.stats[2].base_stat,
              speed: p.data.stats[3].base_stat,
              height: p.data.height,
              weight: p.data.weight,
              types: p.data.types.map((t) => {
                return {
                  name: t.type.name,
                };
              }),
            }; // return
          }); // map
        })
    })
    .catch((error) => {
      return error;
    });
  // ------------------------------- end - carga de poke API
  return arrayPokemonsApi;
}

async function getPokemonsDb() {
  try {
    const arrayPokemonsDb = await Pokemon.findAll();
    

    return arrayPokemonsDb;
  } catch (error) {
    return error;
  }
  // ------------------------------- end - carga de poke DB
}

async function getAllPokemons() {
  try {
    let apiPokemons = await getPokemonsApi();
    let dbPokemons = await getPokemonsDb();
    if (dbPokemons.name == "SequelizeEagerLoadingError"){
      dbPokemons = {msg:"No hay pokemons en la base de datos."}
      apiPokemons.map((pokes)=>{
        Pokemon.create({name, image, hp, attack, defense, speed, height, weight, types})
      })

    }
    return dbPokemons.concat(apiPokemons);
  } catch (error) {
    return error;
  }
}

async function getPokemonApiById(idSearch) {
  try {
    const searchPokemonsApi = await axios.get(`${URL}/${idSearch}`);

    if (searchPokemonsApi) {
      let p = searchPokemonsApi;

      return {
        id: p.data.id,
        name: p.data.name,
        image: p.data.sprites.other.dream_world.front_default, // url imagen
        hp: p.data.stats[0].base_stat,
        attack: p.data.stats[1].base_stat,
        defense: p.data.stats[2].base_stat,
        speed: p.data.stats[3].base_stat,
        height: p.data.height,
        weight: p.data.weight,
        types: p.data.types.map((t) => {
          return {
            name: t.type.name,
            img: `https://typedex.app/images/ui/types/dark/${t.type.name}.svg`,
          };
        }),
      }; // return
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}

async function getPokemonDbById(idSearch) {
  try {
    const searchPokemon = await Pokemon.findOne({
      where: {
        id: idSearch,
      },
      include: {
        attributes: ["name"],
        model: Type,
      },
    });

    return searchPokemon;
  } catch (error) {
    return null;
  }
}
  
async function getPokemonApiByName(nameSearch) {
  try {
    const searchPokemonsApi = await axios.get(
      `${URL}/${nameSearch}`
    );

    if (searchPokemonsApi) {
      let p = searchPokemonsApi;
      return {
        id: p.data.id,
        name: p.data.name,
        image: p.data.sprites.other.dream_world.front_default, // url imagen
        hp: p.data.stats[0].base_stat,
        attack: p.data.stats[1].base_stat,
        defense: p.data.stats[2].base_stat,
        speed: p.data.stats[3].base_stat,
        height: p.data.height,
        weight: p.data.weight,
        types: p.data.types.map((t) => {
          return { name: t.type.name };
        }),
      }; // return
    } else {
      return null;
    }
  } catch (error) {
    return { error: "Not found" };
  }
}

async function getPokemonsDbByName(nameSearch) {
  try {
    const searchPokemon = await Pokemon.findOne({
      where: Sequelize.where(
        Sequelize.fn("lower", Sequelize.col("pokemons.name")),
        Sequelize.fn("lower", nameSearch)
      ),

      include: {
        attributes: ["name"],
        model: Type,
      },
    });

    return searchPokemon;
  } catch (error) {
    return error;
  }
}
/* {name, image, hp, attack, defense, speed, height, weight, types} */
async function createPokemon(req, res) {
  
  try {
    const {name, image, hp, attack, defense, speed, height, weight, types} = req.body
    if (!name || !image) {
      return res
        .status(400)
        .json({ error: "Name and image are requerid fields." });
    }
  
    //Verificar que el nombre este disponible.
    let pokemonSearch = await getPokemonApiByName(name);
    console.log(pokemonSearch)
    // busqueda en la base de datos
    if (pokemonSearch.error) {
      // no encontrado en la API externa
      pokemonSearch = await getPokemonsDbByName(name);
      console.log(pokemonSearch);
    }
  
    if (pokemonSearch == null) {
      return res.status(500).json({ error: "Pokemon name already existing." });
    }
    await Pokemon.create({name, image, hp, attack, defense, speed, height, weight, types});
    delete Pokemon.createdAt;
    delete Pokemon.updatedAt;
    res.status(201).send("Pokemon creado correctamente.");
  } catch (error) {
    res.status(400).send({ error: "Error al crear el pokemon." });
  }
}

async function getPokemonsRutes(req, res){
  try {
    const allPokemons = await getAllPokemons();
    return res.status(200).json(allPokemons);
  }catch (error) {
    next(error);
  }
}

async function getPokemonsByIdRutes(req, res, next){
  try {       
        const {idPokemon} = req.params;
        if (idPokemon){
            let pokemonSearch = null;
            pokemonSearch = await getPokemonApiById(idPokemon);
             if (!isNaN(idPokemon)) {
               console.log("De la api");
             } else {
               pokemonSearch = await getPokemonDbById(idPokemon);
               console.log("De la db ");
             }
            if (pokemonSearch){ // no encontrado en la API externa
                return res.status(200).json(pokemonSearch);
            }
        }
        return res.status(404).send("Pokemon Id no encontrado...");
    } catch (error) {
        next(error);
    }
}
async function getPokemonsByNameRutes(req, res, next) {
  try {
    const {nameSearch} = req.query
    const ya = await getPokemonApiByName(nameSearch)
    console.log(ya);
    /* const { name } = req.query;
     if (name) {
      // -------------------------------- consultar por name
      // busqueda en la API externa
      let pokemonSearch = await getPokemonApiByName(name);

      // busqueda en la base de datos
      if (pokemonSearch.error) {
        // no encontrado en la API externa
        pokemonSearch = await getPokemonsDbByName(name);

        if (pokemonSearch) {
          return res.status(404).json({ message: "Pokemon not found" });
        }
      }
      return res.status(200).json(pokemonSearch);
    } 

    // ------------------------------------- retornar todos los pokemon
    const allPokemons = await getAllPokemons();*/
    return res.status(200).json(ya); 
  } catch (error) {
    next(error);
  }
    
}

module.exports = {
  createPokemon,
  getPokemonsRutes,
  getPokemonsByIdRutes,
  getPokemonsByNameRutes,
};
