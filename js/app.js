
//Traduction des types de Pokémon en français
const traductionTypes = {
    fire: "feu",
    water: "eau",
    grass: "plante",
    electric: "electrik",
    normal: "normal",
    ice: "glace",
    fighting: "combat",
    poison: "poison",
    ground: "sol",
    flying: "vol",
    psychic : "psy",
    bug : "insecte",
    rock : "roche",
    ghost : "spectre",
    dragon: "dragon",
    dark : "ténèbres",
    steel : "acier",
    fairy : "fée"
};




//Affichage des données API
const ficheDetails = document.querySelector('.details-carte');

if(ficheDetails){
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');


fetch("https://pokeapi.co/api/v2/pokemon/"+ id)
.then(response => response.json())
.then(pokemon => {
    document.querySelector('.pokemon-name').textContent = pokemon.name;
    document.querySelector('.pokemon-image').src = pokemon.sprites.other['official-artwork'].front_default;
    document.querySelector('.pokemon-image').alt = pokemon.name;
    document.querySelector('.type').textContent = traductionTypes[pokemon.types[0].type.name];
    document.querySelector('.taille').textContent = pokemon.height + "m";
    document.querySelector('.poids').textContent = pokemon.weight +"kg";
    document.querySelector('.attaque').textContent = pokemon.stats[1].base_stat;
    document.querySelector('.défense').textContent = pokemon.stats[2].base_stat;
    document.querySelector('.pv').textContent = pokemon.stats[0].base_stat;
});
}



if (window.pokedexFavorites) {
    window.pokedexFavorites.updateButtons();
    window.pokedexFavorites.displayFavorites();
}







// async loadPokemon() {

//         const response = await fetch(
//             "https://pokeapi.co/api/v2/pokemon?limit=151"
//         );

//         if (!response.ok) {
//             throw new Error(
//                 "Erreur lors du chargement de la liste."
//             );
//         }

//         const data = await response.json();


//         /*
//          * La première requête donne les 151 Pokémon.
//          * Ensuite on récupère les détails de chacun.
//          */

//         const requests = data.results.map(
//             async (pokemon) => {

//                 const response =
//                     await fetch(pokemon.url);

//                 if (!response.ok) {
//                     throw new Error(
//                         `Erreur pour ${pokemon.name}`
//                     );
//                 }

//                 return await response.json();
//             }
//         );


//         this.pokemonList =
//             await Promise.all(requests);
//     }