// =====================================
// GESTION DU DARK MODE
// =====================================

const themeButton = document.getElementById("theme-toggle");


// Récupère le thème enregistré

const savedTheme = localStorage.getItem("theme");


// =====================================
// CHARGEMENT DU THÈME
// =====================================

if (savedTheme === "dark") {

    document.body.classList.add("dark");

    if (themeButton) {
        themeButton.textContent = "☀";
    }

} else {

    document.body.classList.remove("dark");

    if (themeButton) {
        themeButton.textContent = "☾";
    }

}


// =====================================
// BOUTON DARK MODE
// =====================================

if (themeButton) {

    themeButton.addEventListener("click", () => {

        document.body.classList.toggle("dark");


        const isDark =
            document.body.classList.contains("dark");


        if (isDark) {

            themeButton.textContent = "☀";

            localStorage.setItem(
                "theme",
                "dark"
            );

        } else {

            themeButton.textContent = "☾";

            localStorage.setItem(
                "theme",
                "light"
            );

        }

    });

}