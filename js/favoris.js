/* =========================================================
   GESTION DES FAVORIS
========================================================= */

class Favoris {

    constructor() {

        // Récupération des favoris sauvegardés
        const savedFavorites =
            localStorage.getItem("pokedex-favorites");

        this.favorites = savedFavorites
            ? JSON.parse(savedFavorites)
            : [];


        // Éléments HTML
        this.counter =
            document.getElementById("favorites-count");

        this.bottomCounter =
            document.getElementById(
                "favorites-count-bottom"
            );

        this.favoritesList =
            document.getElementById("favorites-list");

        this.noFavorites =
            document.getElementById("no-favorites");


        this.init();
    }


    /* =====================================================
       INITIALISATION
    ===================================================== */

    init() {

        /*
         * Event delegation :
         * fonctionne également avec les cartes
         * créées plus tard par app.js.
         */

        document.addEventListener("click", (event) => {

            const button =
                event.target.closest(".favorite-btn");

            if (!button) {
                return;
            }


            event.stopPropagation();


            const pokemonId =
                String(button.dataset.id);


            if (!pokemonId) {
                return;
            }


            this.toggleFavorite(pokemonId);
        });


        // Première mise à jour
        this.updateCounter();

        this.updateButtons();

        this.displayFavorites();
    }


    /* =====================================================
       AJOUT / SUPPRESSION
    ===================================================== */

    toggleFavorite(pokemonId) {

        const index =
            this.favorites.indexOf(pokemonId);


        // Si déjà favori → suppression
        if (index !== -1) {

            this.favorites.splice(index, 1);

        }

        // Sinon → ajout
        else {

            this.favorites.push(pokemonId);

        }


        // Sauvegarde
        this.save();


        // Mise à jour de l'interface
        this.updateCounter();

        this.updateButtons();

        this.displayFavorites();
    }


    /* =====================================================
       LOCAL STORAGE
    ===================================================== */

    save() {

        localStorage.setItem(
            "pokedex-favorites",
            JSON.stringify(this.favorites)
        );
    }


    /* =====================================================
       COMPTEUR
    ===================================================== */

    updateCounter() {

        const count =
            this.favorites.length;


        if (this.counter) {

            this.counter.textContent = count;

        }


        if (this.bottomCounter) {

            this.bottomCounter.textContent = count;

        }
    }


    /* =====================================================
       MISE À JOUR DES BOUTONS
    ===================================================== */

    updateButtons() {

        const buttons =
            document.querySelectorAll(
                ".favorite-btn"
            );


        buttons.forEach((button) => {

            const pokemonId =
                String(button.dataset.id);


            const isFavorite =
                this.favorites.includes(
                    pokemonId
                );


            if (isFavorite) {

                button.classList.add("active");

                button.innerHTML = "★";

                button.setAttribute(
                    "aria-label",
                    "Retirer des favoris"
                );

                button.setAttribute(
                    "title",
                    "Retirer des favoris"
                );

            }

            else {

                button.classList.remove("active");

                button.innerHTML = "☆";

                button.setAttribute(
                    "aria-label",
                    "Ajouter aux favoris"
                );

                button.setAttribute(
                    "title",
                    "Ajouter aux favoris"
                );
            }

        });
    }


    /* =====================================================
       AFFICHAGE DES FAVORIS
    ===================================================== */

    displayFavorites() {

        if (!this.favoritesList) {
            return;
        }


        // On vide la liste
        this.favoritesList.innerHTML = "";


        // Aucun favori
        if (this.favorites.length === 0) {

            if (this.noFavorites) {

                this.noFavorites.classList.remove(
                    "hidden"
                );
            }

            return;
        }


        // Il y a des favoris
        if (this.noFavorites) {

            this.noFavorites.classList.add(
                "hidden"
            );
        }


        /*
         * On récupère les cartes présentes
         * dans la liste principale.
         */

        const cards =
            document.querySelectorAll(
                "#pokemon-list .card"
            );


        this.favorites.forEach((pokemonId) => {

            cards.forEach((card) => {

                const button =
                    card.querySelector(
                        ".favorite-btn"
                    );


                if (!button) {
                    return;
                }


                const cardId =
                    String(button.dataset.id);


                if (cardId === pokemonId) {

                    // Copie de la carte
                    const clone =
                        card.cloneNode(true);


                    // Le bouton reste actif
                    const cloneButton =
                        clone.querySelector(
                            ".favorite-btn"
                        );


                    if (cloneButton) {

                        cloneButton.classList.add(
                            "active"
                        );

                        cloneButton.innerHTML =
                            "★";
                    }


                    this.favoritesList.appendChild(
                        clone
                    );
                }

            });

        });
    }
}


/* =========================================================
   LANCEMENT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        window.pokedexFavorites =
            new Favoris();

    }
);