const toggle = document.querySelector("[data-nav-toggle]");
const menu = document.querySelector("[data-nav-menu]");
const localeSwitchers = document.querySelectorAll(".locale-switcher");
const localeOptions = document.querySelectorAll("[data-locale-option]");
const currentLocaleOption = document.querySelector('[data-locale-option][aria-current="true"]');
const localePaths = Object.fromEntries([...localeOptions].map((option) => [
  option.dataset.localeOption,
  option.dataset.localePath
]));

const updateLocaleTargets = () => {
  for (const localeOption of localeOptions) {
    const target = localeOption.dataset.localePath;
    if (target) localeOption.href = `${target}${window.location.hash}`;
  }
};

updateLocaleTargets();
window.addEventListener("hashchange", updateLocaleTargets);

let preferredLocale = null;
try {
  preferredLocale = localStorage.getItem("qwc-preferred-locale");
} catch {
  // Language links remain fully functional when storage is unavailable.
}
const currentLocale = currentLocaleOption?.dataset.localeOption;
if (window.location.pathname === "/" && preferredLocale && preferredLocale !== currentLocale && localePaths[preferredLocale]) {
  window.location.replace(`${localePaths[preferredLocale]}${window.location.hash}`);
}

if (toggle && menu) {
  const closeMenu = () => {
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  menu.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 1201px)").matches) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !menu.classList.contains("is-open")) return;
    if (document.querySelector(".locale-switcher.is-open")) return;
    closeMenu();
    toggle.focus();
  });
}

for (const localeSwitcher of localeSwitchers) {
  const localeToggle = localeSwitcher.querySelector("[data-locale-toggle]");
  if (!(localeToggle instanceof HTMLButtonElement)) continue;

  const closeLocaleMenu = () => {
    localeSwitcher.classList.remove("is-open");
    localeToggle.setAttribute("aria-expanded", "false");
  };

  localeToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = localeSwitcher.classList.toggle("is-open");
    localeToggle.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (event) => {
    if (!localeSwitcher.contains(event.target)) closeLocaleMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !localeSwitcher.classList.contains("is-open")) return;
    closeLocaleMenu();
    localeToggle.focus();
  });
}

for (const localeOption of localeOptions) {
  localeOption.addEventListener("click", () => {
    try {
      localStorage.setItem("qwc-preferred-locale", localeOption.dataset.localeOption);
    } catch {
      // The direct locale URL still records the user's choice in navigation history.
    }
  });
}
