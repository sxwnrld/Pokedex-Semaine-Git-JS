// =====================================
// DARK MODE
// =====================================

const themeButton = document.getElementById("theme-toggle");


// Récupération du thème sauvegardé

const savedTheme = localStorage.getItem("theme");


// Si l'utilisateur avait choisi le dark mode

if (savedTheme === "dark") {

    document.body.classList.add("dark");

    themeButton.textContent = "☀";

}


// =====================================
// CHANGEMENT DE THÈME
// =====================================

themeButton.addEventListener("click", () => {

    document.body.classList.toggle("dark");


    const isDark =
        document.body.classList.contains("dark");


    if (isDark) {

        themeButton.textContent = "☀";

        localStorage.setItem("theme", "dark");

    } else {

        themeButton.textContent = "☾";

        localStorage.setItem("theme", "light");

    }

});