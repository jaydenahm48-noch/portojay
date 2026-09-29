/*-- TOGGLE STYLE SWITCHER --*/
const styleSwitcherToggle = document.querySelector(".style-switcher-toggler");
if (styleSwitcherToggle) {
    styleSwitcherToggle.addEventListener("click", () => {
        document.querySelector(".style-switcher").classList.toggle("open");
    });
}

// Hide style switcher on scroll
window.addEventListener("scroll", () => {
    const switcher = document.querySelector(".style-switcher");
    if (switcher && switcher.classList.contains("open")) {
        switcher.classList.remove("open");
    }
});

/*-- MAP WARNA DENGAN CSS VARIABLE --*/
const colorMap = {
    'color-1': '#ec1839', // Merah
    'color-2': '#fa5b0f', // Oranye
    'color-3': '#37b182', // Hijau
    'color-4': '#1854b4', // Biru
    'color-5': '#f021b2'  // Pink
};

function setActiveStyle(colorTitle) {
    // 1. Ambil warna hex sesuai title tombol yang diklik
    const hexColor = colorMap[colorTitle];
    if (hexColor) {
        // Apply langsung ke root HTML
        document.documentElement.style.setProperty('--skin-color', hexColor);
        localStorage.setItem("selected-skin-color", hexColor);
        localStorage.setItem("selected-theme-title", colorTitle);
    }

    // 2. Fallback jika masih pakai link stylesheet alternatif
    const alternateStyles = document.querySelectorAll(".alternate-style");
    alternateStyles.forEach((style) => {
        if (colorTitle === style.getAttribute("title")) {
            style.removeAttribute("disabled");
        } else {
            style.setAttribute("disabled", "true");
        }
    });
}

/*-- THEME LIGHTS & DARK --*/
const dayNight = document.querySelector(".day-night");

if (dayNight) {
    dayNight.addEventListener("click", () => {
        const icon = dayNight.querySelector("i");
        if (icon) {
            icon.classList.toggle("fa-sun");
            icon.classList.toggle("fa-moon");
        }
        document.body.classList.toggle("dark");

        if (document.body.classList.contains("dark")) {
            localStorage.setItem("theme-mode", "dark");
        } else {
            localStorage.setItem("theme-mode", "light");
        }
    });
}

/*-- RESTORE SETTINGS SINKRON KAPANPUN PAGE RENDERING --*/
function applySavedTheme() {
    // Restore Warna
    const savedHex = localStorage.getItem("selected-skin-color");
    const savedTitle = localStorage.getItem("selected-theme-title");
    if (savedHex) {
        document.documentElement.style.setProperty('--skin-color', savedHex);
    }
    if (savedTitle) {
        const alternateStyles = document.querySelectorAll(".alternate-style");
        alternateStyles.forEach((style) => {
            if (savedTitle === style.getAttribute("title")) {
                style.removeAttribute("disabled");
            } else {
                style.setAttribute("disabled", "true");
            }
        });
    }

    // Restore Mode Dark/Light
    const savedMode = localStorage.getItem("theme-mode");
    if (dayNight) {
        const icon = dayNight.querySelector("i");
        if (savedMode === "dark") {
            document.body.classList.add("dark");
            if (icon) {
                icon.classList.add("fa-sun");
                icon.classList.remove("fa-moon");
            }
        } else if (savedMode === "light") {
            document.body.classList.remove("dark");
            if (icon) {
                icon.classList.add("fa-moon");
                icon.classList.remove("fa-sun");
            }
        }
    }
}

// Jalankan saat pertama dimuat dan saat dokumen selesai loading
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applySavedTheme);
} else {
    applySavedTheme();
}
window.addEventListener("load", applySavedTheme);