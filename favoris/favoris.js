class Favoris {

    constructor() {
        // Même stockage que la page Pokémon
        const savedFavorites = localStorage.getItem("favorites");

        this.favorites = savedFavorites
            ? JSON.parse(savedFavorites).map(String)
            : [];

        this.counter = document.getElementById("favorites-count");
        this.favoritesList = document.getElementById("favorites-container");
        this.noFavorites = document.getElementById("empty-favorites");
        this.loading = document.getElementById("loading");

        this.init();
    }

    async init() {
        this.updateCounter();

        if (this.favorites.length === 0) {
            this.hideLoading();
            this.showEmpty();
            return;
        }

        try {
            await this.displayFavorites();
        } catch (error) {
            console.error("Erreur favoris :", error);

            if (this.loading) {
                this.loading.innerHTML = `
                    <p>Impossible de charger les favoris.</p>
                `;
            }
        }
    }

    updateCounter() {
        if (this.counter) {
            this.counter.textContent = this.favorites.length;
        }
    }

    async displayFavorites() {

        if (!this.favoritesList) {
            return;
        }

        this.favoritesList.innerHTML = "";

        if (this.favorites.length === 0) {
            this.hideLoading();
            this.showEmpty();
            return;
        }

        this.hideEmpty();

        // Charger tous les Pokémon favoris depuis PokéAPI
        const requests = this.favorites.map(async (id) => {

            const response = await fetch(
                `https://pokeapi.co/api/v2/pokemon/${id}`
            );

            if (!response.ok) {
                throw new Error(`Pokémon ${id} introuvable`);
            }

            return response.json();
        });

        const pokemonList = await Promise.all(requests);

        pokemonList.forEach((pokemon) => {
            this.createCard(pokemon);
        });

        this.hideLoading();
    }

    createCard(pokemon) {

        const card = document.createElement("article");

        card.className = "card";
        card.dataset.id = pokemon.id;

        const typesHTML = pokemon.types
            .map((typeInfo) => {
                const type = typeInfo.type.name;

                return `
                    <span class="type t-${type}">
                        ${this.capitalize(type)}
                    </span>
                `;
            })
            .join("");

        card.innerHTML = `
            <button
                class="favorite-btn active"
                data-id="${pokemon.id}"
                type="button"
                aria-label="Retirer des favoris"
                title="Retirer des favoris"
            >
                ★
            </button>

            <img
                src="${pokemon.sprites.other["official-artwork"].front_default}"
                alt="${this.capitalize(pokemon.name)}"
            >

            <p class="pokemon-id">
                #${this.formatId(pokemon.id)}
            </p>

            <h3>
                ${this.capitalize(pokemon.name)}
            </h3>

            <div class="types">
                ${typesHTML}
            </div>
        `;

        this.favoritesList.appendChild(card);
    }

    removeFavorite(pokemonId) {

        this.favorites = this.favorites.filter(
            (id) => id !== String(pokemonId)
        );

        localStorage.setItem(
            "favorites",
            JSON.stringify(this.favorites)
        );

        this.updateCounter();
        this.displayFavorites();
    }

    showEmpty() {
        if (this.noFavorites) {
            this.noFavorites.classList.remove("hidden");
        }
    }

    hideEmpty() {
        if (this.noFavorites) {
            this.noFavorites.classList.add("hidden");
        }
    }

    hideLoading() {
        if (this.loading) {
            this.loading.classList.add("hidden");
        }
    }

    capitalize(text) {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    formatId(id) {
        return String(id).padStart(3, "0");
    }
}


// Lancement
document.addEventListener("DOMContentLoaded", () => {

    window.pokedexFavorites = new Favoris();

    // Retirer un Pokémon des favoris
    document.addEventListener("click", (event) => {

        const button = event.target.closest(".favorite-btn");

        if (!button) {
            return;
        }

        const id = button.dataset.id;

        if (id && window.pokedexFavorites) {
            window.pokedexFavorites.removeFavorite(id);
        }
    });
});