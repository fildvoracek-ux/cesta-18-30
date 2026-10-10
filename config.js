// Nastavení hry. Po nasazení doplň hodnoty označené ← DOPLNIT.
window.CONFIG = {
  // URL webové aplikace z Google Apps Scriptu (končí na /exec). Prázdné = odpovědi se jen ukládají lokálně v prohlížeči.
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbzaWL-oV78Z9OH0i-Lid6PbTnW9b2ygZK7S63AsIVEwLeYt2nUpRAAaTEItnnhMjKpVXg/exec",                       // ← DOPLNIT

  // Cílový počet dokončených odpovědí na jednu událost (pro vyvažování výběru zastávek).
  TARGET_PER_EVENT: 25,

  // true = všechny odpovědi se zapíšou s test=true (stejný efekt jako ?test=1 v URL).
  TEST_MODE: false,

  // Veřejná adresa hry (pro sdílení). Po nasazení nahraď fildvoracek-ux a cesta-18-30. Dokud je tu placeholder, použije se aktuální adresa.
  SITE_URL: "https://fildvoracek-ux.github.io/cesta-18-30/",   // ← DOPLNIT

  // Timeout pro zjištění počtů z Apps Scriptu (ms). Po jeho uplynutí se vybírá náhodně.
  COUNTS_TIMEOUT_MS: 2000
};
