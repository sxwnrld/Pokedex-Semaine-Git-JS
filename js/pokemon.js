// ========================================
// POKÉDEX - POKEMON.JS
// ========================================

const API_URL = "https://pokeapi.co/api/v2/pokemon?limit=1025";

const pokemonContainer = document.getElementById("pokemon-container");
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const pokemonCount = document.getElementById("pokemon-count");
const loading = document.getElementById("loading");
const noResult = document.getElementById("no-result");

const typeButtons = document.querySelectorAll("[data-type]");

let allPokemon = [];
let currentType = "all";

const FAVORITES_KEY = "favorites";

// ========================================
// FAVORIS
// ========================================

function getFavorites() {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
}

function saveFavorites(favorites) {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

function isFavorite(id) {
    return getFavorites().includes(id);
}

function toggleFavorite(id) {
    let favorites = getFavorites();

    if (favorites.includes(id)) {
        favorites = favorites.filter((pokemonId) => pokemonId !== id);
    } else {
        favorites.push(id);
    }

    saveFavorites(favorites);

    renderPokemon(getFilteredPokemon());
}

// ========================================
// RÉCUPÉRATION DES POKÉMON
// ========================================

async function loadPokemon() {
    try {
        loading.style.display = "block";
        pokemonContainer.innerHTML = "";
        noResult.style.display = "none";

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Erreur lors de la récupération des Pokémon.");
        }

        const data = await response.json();

        // Récupération des détails de chaque Pokémon
        allPokemon = await Promise.all(
            data.results.map(async (pokemon) => {
                const response = await fetch(pokemon.url);
                return await response.json();
            })
        );

        // Trie par numéro
        allPokemon.sort((a, b) => a.id - b.id);

        loading.style.display = "none";

        renderPokemon(allPokemon);

    } catch (error) {
        console.error(error);

        loading.style.display = "none";

        pokemonContainer.innerHTML = `
            <div class="error-message">
                <h2>Impossible de charger le Pokédex</h2>
                <p>Vérifie ta connexion Internet puis recharge la page.</p>
            </div>
        `;
    }
}

// ========================================
// AFFICHAGE
// ========================================

function renderPokemon(pokemonList) {

    pokemonContainer.innerHTML = "";

    pokemonCount.textContent = `${pokemonList.length} Pokémon`;

    if (pokemonList.length === 0) {
        noResult.style.display = "block";
        return;
    }

    noResult.style.display = "none";

    const fragment = document.createDocumentFragment();

    pokemonList.forEach((pokemon) => {

        const card = document.createElement("article");
        card.className = "pokemon-card";

        const favorite = isFavorite(pokemon.id);

        const types = pokemon.types
            .map((typeInfo) => {
                const typeName = typeInfo.type.name;

                return `
                    <span class="type ${typeName}">
                        ${translateType(typeName)}
                    </span>
                `;
            })
            .join("");

        card.innerHTML = `
            <button
                class="favorite-btn ${favorite ? "active" : ""}"
                data-id="${pokemon.id}"
                aria-label="${favorite ? "Retirer des favoris" : "Ajouter aux favoris"}"
                title="${favorite ? "Retirer des favoris" : "Ajouter aux favoris"}"
            >
                ${favorite ? "★" : "☆"}
            </button>

            <span class="pokemon-id">
                #${String(pokemon.id).padStart(3, "0")}
            </span>

            <img
                src="${pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default}"
                alt="${pokemon.name}"
                loading="lazy"
            >

            <h2>${capitalize(pokemon.name)}</h2>

            <div class="pokemon-types">
                ${types}
            </div>

            <div class="pokemon-stats">
                <div>
                    <span>PV</span>
                    <strong>${pokemon.stats[0].base_stat}</strong>
                </div>

                <div>
                    <span>ATK</span>
                    <strong>${pokemon.stats[1].base_stat}</strong>
                </div>

                <div>
                    <span>DEF</span>
                    <strong>${pokemon.stats[2].base_stat}</strong>
                </div>
            </div>
        `;

        fragment.appendChild(card);
    });

    pokemonContainer.appendChild(fragment);

    // Événements des étoiles
    document.querySelectorAll(".favorite-btn").forEach((button) => {
        button.addEventListener("click", (event) => {

            event.stopPropagation();

            const id = Number(button.dataset.id);

            toggleFavorite(id);
        });
    });
}

// ========================================
// RECHERCHE + FILTRES
// ========================================

function getFilteredPokemon() {

    const search = searchInput.value
        .toLowerCase()
        .trim();

    return allPokemon.filter((pokemon) => {

        // Recherche par nom
        const matchesSearch =
            pokemon.name.toLowerCase().includes(search) ||
            String(pokemon.id).includes(search);

        // Filtre par type
        const matchesType =
            currentType === "all" ||
            pokemon.types.some(
                (typeInfo) => typeInfo.type.name === currentType
            );

        return matchesSearch && matchesType;
    });
}

// ========================================
// RECHERCHE
// ========================================

function searchPokemon() {
    const filteredPokemon = getFilteredPokemon();

    renderPokemon(filteredPokemon);
}

searchButton.addEventListener("click", searchPokemon);

searchInput.addEventListener("input", searchPokemon);

searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        searchPokemon();
    }
});

// ========================================
// FILTRES PAR TYPE
// ========================================

typeButtons.forEach((button) => {

    button.addEventListener("click", () => {

        currentType = button.dataset.type;

        // Retire l'état actif
        typeButtons.forEach((btn) => {
            btn.classList.remove("active");
        });

        // Active le bouton sélectionné
        button.classList.add("active");

        renderPokemon(getFilteredPokemon());
    });
});

// ========================================
// UTILITAIRES
// ========================================

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function translateType(type) {

    const types = {
        normal: "Normal",
        fire: "Feu",
        water: "Eau",
        electric: "Électrique",
        grass: "Plante",
        ice: "Glace",
        fighting: "Combat",
        poison: "Poison",
        ground: "Sol",
        flying: "Vol",
        psychic: "Psy",
        bug: "Insecte",
        rock: "Roche",
        ghost: "Spectre",
        dragon: "Dragon",
        dark: "Obscur",
        steel: "Acier",
        fairy: "Fée"
    };

    return types[type] || type;
}

// ========================================
// LANCEMENT
// ========================================

loadPokemon();