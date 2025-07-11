
const pokeApi = {};

            function convertPokeApiDetailToPokemon(pokeDetail) {
                const pokemon = new Pokemon();
                pokemon.number = pokeDetail.id;
                pokemon.name = pokeDetail.name;

                const types = pokeDetail.types.map((typeSlot) => typeSlot.type.name);
                const [type] = types;
                pokemon.types = types;
                pokemon.type = type;

                pokemon.photo = pokeDetail.sprites.other.dream_world.front_default;

                pokemon.stats = pokeDetail.stats.map(statSlot => statSlot.stat.name);
                pokeDetail.stats.forEach(statSlot => {
                    pokemon.baseStats[statSlot.stat.name] = statSlot.base_stat;
                });

                return pokemon;
            }

            pokeApi.getPokemonDetail = (pokemon) => {
                return fetch(pokemon.url)
                    .then((response) => response.json())
                    .then(convertPokeApiDetailToPokemon);
            }

            pokeApi.getPokemonById = (id) => {
                const url = `https://pokeapi.co/api/v2/pokemon/${id}`;
                return fetch(url)
                    .then((response) => response.json())
                    .then(convertPokeApiDetailToPokemon);
            }

            pokeApi.getPokemons = (offset = 0, limit = 10) => {
                const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`;
                return fetch(url)
                    .then((response) => response.json())
                    .then((jsonBody) => jsonBody.results)
                    .then((pokemons) => pokemons.map(pokeApi.getPokemonDetail))
                    .then((detailRequests) => Promise.all(detailRequests))
                    .then((pokemonsDetails) => pokemonsDetails);
            }