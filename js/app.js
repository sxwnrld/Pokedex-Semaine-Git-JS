/* =========================================================
   POKÉDEX
   Liste des Pokémon + recherche + filtre + détails
========================================================= */

class Pokedex {

    constructor() {

        this.pokemonList = [];
        this.filteredPokemon = [];

        // Éléments HTML
        this.pokemonContainer =
            document.getElementById("pokemon-list");

        this.searchInput =
            document.getElementById("search");

        this.typeFilter =
            document.getElementById("type-filter");

        this.statusMessage =
            document.getElementById("status-message");

        this.overlay =
            document.getElementById("overlay");

        this.modalContent =
            document.getElementById("modal-content");

        this.closeModalButton =
            document.getElementById("close-modal");

        this.init();
    }


    /* =====================================================
       INITIALISATION
    ===================================================== */

    async init() {

        this.showStatus("Chargement des Pokémon...");

        try {

            await this.loadPokemon();

            this.createTypeFilter();

            this.filteredPokemon = [...this.pokemonList];

            this.render();

            this.hideStatus();

            this.setupEvents();

        } catch (error) {

            console.error(error);

            this.showStatus(
                "Impossible de charger les Pokémon."
            );
        }
    }


    /* =====================================================
       API POKÉAPI
    ===================================================== */

    async loadPokemon() {

        const response = await fetch(
            "https://pokeapi.co/api/v2/pokemon?limit=151"
        );

        if (!response.ok) {
            throw new Error(
                "Erreur lors du chargement de la liste."
            );
        }

        const data = await response.json();


        /*
         * La première requête donne les 151 Pokémon.
         * Ensuite on récupère les détails de chacun.
         */

        const requests = data.results.map(
            async (pokemon) => {

                const response =
                    await fetch(pokemon.url);

                if (!response.ok) {
                    throw new Error(
                        `Erreur pour ${pokemon.name}`
                    );
                }

                return await response.json();
            }
        );


        this.pokemonList =
            await Promise.all(requests);
    }


    /* =====================================================
       FILTRE PAR TYPE
    ===================================================== */

    createTypeFilter() {

        const types = new Set();


        this.pokemonList.forEach((pokemon) => {

            pokemon.types.forEach((typeInfo) => {

                types.add(
                    typeInfo.type.name
                );

            });

        });


        [...types]
            .sort()
            .forEach((type) => {

                const option =
                    document.createElement("option");

                option.value = type;

                option.textContent =
                    this.capitalize(type);

                this.typeFilter.appendChild(option);

            });
    }


    /* =====================================================
       ÉVÉNEMENTS
    ===================================================== */

    setupEvents() {

        // Recherche
        this.searchInput.addEventListener(
            "input",
            () => {

                this.filterPokemon();

            }
        );


        // Filtre par type
        this.typeFilter.addEventListener(
            "change",
            () => {

                this.filterPokemon();

            }
        );


        // Fermer la modale
        this.closeModalButton.addEventListener(
            "click",
            () => {

                this.closeModal();

            }
        );


        // Cliquer sur le fond
        this.overlay.addEventListener(
            "click",
            (event) => {

                if (event.target === this.overlay) {

                    this.closeModal();

                }

            }
        );


        // Touche Échap
        document.addEventListener(
            "keydown",
            (event) => {

                if (event.key === "Escape") {

                    this.closeModal();

                }

            }
        );


        /*
         * Event delegation pour les cartes.
         *
         * Le bouton favori est ignoré ici car
         * il est géré par favoris.js.
         */

        this.pokemonContainer.addEventListener(
            "click",
            (event) => {

                if (
                    event.target.closest(
                        ".favorite-btn"
                    )
                ) {
                    return;
                }


                const card =
                    event.target.closest(".card");


                if (!card) {
                    return;
                }


                const id =
                    Number(card.dataset.id);


                const pokemon =
                    this.pokemonList.find(
                        (pokemon) =>
                            pokemon.id === id
                    );


                if (pokemon) {

                    this.showDetails(pokemon);

                }

            }
        );
    }


    /* =====================================================
       RECHERCHE + FILTRE
    ===================================================== */

    filterPokemon() {

        const search =
            this.searchInput.value
                .trim()
                .toLowerCase();


        const selectedType =
            this.typeFilter.value;


        this.filteredPokemon =
            this.pokemonList.filter(
                (pokemon) => {

                    const matchesName =
                        pokemon.name
                            .toLowerCase()
                            .includes(search);


                    const matchesType =
                        selectedType === "all" ||
                        pokemon.types.some(
                            (typeInfo) =>
                                typeInfo.type.name ===
                                selectedType
                        );


                    return (
                        matchesName &&
                        matchesType
                    );
                }
            );


        this.render();


        if (
            this.filteredPokemon.length === 0
        ) {

            this.showStatus(
                "Aucun Pokémon ne correspond à votre recherche."
            );

        } else {

            this.hideStatus();

        }
    }


    /* =====================================================
       AFFICHAGE DES CARTES
    ===================================================== */

    render() {

        this.pokemonContainer.innerHTML = "";


        this.filteredPokemon.forEach(
            (pokemon) => {

                const card =
                    document.createElement("article");

                card.className = "card";

                card.dataset.id =
                    pokemon.id;


                // Récupération des types
                const types =
                    pokemon.types.map(
                        (typeInfo) =>
                            typeInfo.type.name
                    );


                const typesHTML =
                    types
                        .map(
                            (type) => `
                                <span class="type t-${type}">
                                    ${this.capitalize(type)}
                                </span>
                            `
                        )
                        .join("");


                /*
                 * Création de la carte.
                 *
                 * Le bouton .favorite-btn est volontairement
                 * vide : favoris.js s'occupe de l'étoile.
                 */

                card.innerHTML = `

                    <button
                        class="favorite-btn"
                        data-id="${pokemon.id}"
                        type="button"
                        aria-label="Ajouter aux favoris"
                    ></button>


                    <img
                        src="${pokemon.sprites.other["official-artwork"].front_default}"
                        alt="${this.capitalize(pokemon.name)}"
                    >


                    <h3>
                        ${this.capitalize(pokemon.name)}
                    </h3>


                    <div class="types">
                        ${typesHTML}
                    </div>

                `;


                this.pokemonContainer.appendChild(card);

            }
        );


        /*
         * IMPORTANT :
         * On prévient favoris.js que les cartes
         * viennent d'être créées.
         */

        if (window.pokedexFavorites) {

            window.pokedexFavorites.updateButtons();

            window.pokedexFavorites.displayFavorites();

        }
    }


    /* =====================================================
       DÉTAILS DU POKÉMON
    ===================================================== */

    showDetails(pokemon) {

        const types =
            pokemon.types
                .map(
                    (typeInfo) => `
                        <span class="type t-${typeInfo.type.name}">
                            ${this.capitalize(
                                typeInfo.type.name
                            )}
                        </span>
                    `
                )
                .join("");


        const stats =
            pokemon.stats
                .map(
                    (statInfo) => {

                        const statName =
                            this.formatStatName(
                                statInfo.stat.name
                            );


                        return `

                            <div class="stat-row">

                                <span class="stat-name">
                                    ${statName}
                                </span>

                                <strong>
                                    ${statInfo.base_stat}
                                </strong>

                            </div>

                        `;
                    }
                )
                .join("");


        this.modalContent.innerHTML = `

            <div class="pokemon-details">

                <img
                    class="details-image"
                    src="${pokemon.sprites.other["official-artwork"].front_default}"
                    alt="${this.capitalize(pokemon.name)}"
                >


                <h2>

                    #${this.formatId(pokemon.id)}

                    ${this.capitalize(pokemon.name)}

                </h2>


                <div class="details-types">

                    ${types}

                </div>


                <div class="physical-info">

                    <div>

                        <span>
                            Hauteur
                        </span>

                        <strong>
                            ${pokemon.height / 10} m
                        </strong>

                    </div>


                    <div>

                        <span>
                            Poids
                        </span>

                        <strong>
                            ${pokemon.weight / 10} kg
                        </strong>

                    </div>

                </div>


                <h3>
                    Statistiques
                </h3>


                <div class="stats">

                    ${stats}

                </div>

            </div>

        `;


        this.overlay.classList.remove("hidden");

        document.body.classList.add(
            "modal-open"
        );
    }


    /* =====================================================
       FERMER LA MODALE
    ===================================================== */

    closeModal() {

        if (!this.overlay) {
            return;
        }

        this.overlay.classList.add("hidden");

        document.body.classList.remove(
            "modal-open"
        );
    }


    /* =====================================================
       MESSAGES
    ===================================================== */

    showStatus(message) {

        if (!this.statusMessage) {
            return;
        }

        this.statusMessage.textContent =
            message;

        this.statusMessage.classList.remove(
            "hidden"
        );
    }


    hideStatus() {

        if (!this.statusMessage) {
            return;
        }

        this.statusMessage.classList.add(
            "hidden"
        );
    }


    /* =====================================================
       OUTILS
    ===================================================== */

    capitalize(text) {

        return (
            text.charAt(0).toUpperCase() +
            text.slice(1)
        );
    }


    formatId(id) {

        return String(id).padStart(3, "0");
    }


    formatStatName(stat) {

        const names = {

            hp: "PV",

            attack: "Attaque",

            defense: "Défense",

            "special-attack": "Attaque Spé.",

            "special-defense": "Défense Spé.",

            speed: "Vitesse"

        };


        return (
            names[stat] ||
            this.capitalize(stat)
        );
    }
}


/* =========================================================
   LANCEMENT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        window.pokedex =
            new Pokedex();

    }
);