const toggle = document.querySelector("[data-nav-toggle]");
const menu = document.querySelector("[data-nav-menu]");
const infoToggles = document.querySelectorAll(".info-toggle");
const localeSwitchers = document.querySelectorAll(".locale-switcher");
const localeOptions = document.querySelectorAll("[data-locale-option]");

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
    if (window.matchMedia("(min-width: 641px)").matches) closeMenu();
  });
}

for (const infoToggle of infoToggles) {
  infoToggle.addEventListener("click", () => {
    const card = infoToggle.closest(".metric-help");
    if (card) card.classList.toggle("is-open");
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
    if (event.key === "Escape") closeLocaleMenu();
  });
}

for (const localeOption of localeOptions) {
  localeOption.addEventListener("click", () => {
    localStorage.setItem("qwc-preferred-locale", localeOption.dataset.localeOption);
  });
}
