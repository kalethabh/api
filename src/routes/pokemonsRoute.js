const express = require("express");
const getPokemonRute = require("../controllers/getPokemons");
const getPokemonById = require("../controllers/getPokemonsById");
const createPokemon = require("../controllers/createPokemon");

const router = express.Router();

router.get("/", getPokemonRute);

router.get("/:id", getPokemonById);

router.post("/", createPokemon);

module.exports = router;
