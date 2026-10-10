// Všechny texty hry na jednom místě. Úpravy textů dělej jen tady.
// Možnosti odpovědí: {v: uložená hodnota, t: zobrazený text}. U textů závislých na režimu je t objekt {z, p, h}
// (z = zkušenost, p = plán, h = hypoteticky). Pomocné značky: x:true = výlučná možnost u výběru více.
window.CONTENT = {
  intro: {
    title: "Cesta od 18 do 30",
    paragraphs: [
      "Ahoj! Jsem Filip, studuju a píšu případovou studii o tom, jak mladí lidé řeší peníze, hlavně kolem velkých životních změn.",
      "Budu ti hrozně vděčný, když mi věnuješ pár minut. Nic tu není špatně, zajímá mě tvůj pravdivý názor."
    ],
    privacy: [
      "Dobrovolné a anonymní, neptám se na jméno ani e-mail",
      "Zabere to asi 3 až 5 minut",
      "Data použiju jen ve své studii a nikomu je nepředám",
      "Můžeš to kdykoli zavřít"
    ],
    button: "Jdeme na to"
  },

  notice: {
    title: "Než vyrazíme",
    text: "U každé zastávky se ptám jen na to, jak řešíš peníze, nic osobního. Kdykoli můžeš zastávku přeskočit.",
    button: "Rozumím"
  },

  skip: "Tohle teď neřeším",
  back: "Zpět",
  next: "Dál",
  toastNextStop: "Díky, jedeme dál",
  hypoRibbon: "Tahle zastávka je jen představa. Odpovídej, jak bys to asi řešil/a.",
  sceneGo: "Jedeme",
  moneyChanges: "Co se s penězi mění:",

  under18: {
    title: "Díky, že jsi tu",
    text: "Studii dělám pro lidi od 18 do 30 let, takže tě tu bohužel nepotřebuju. Nic jsem si o tobě neuložil. Díky za zájem a hezký den."
  },

  // ---------- Základ ----------
  banks: [
    { v: "csas", t: "Česká spořitelna" },
    { v: "csob", t: "ČSOB" },
    { v: "kb", t: "Komerční banka" },
    { v: "rb", t: "Raiffeisenbank" },
    { v: "air", t: "Air Bank" },
    { v: "moneta", t: "Moneta" },
    { v: "fio", t: "Fio" },
    { v: "mbank", t: "mBank" },
    { v: "revolut", t: "Revolut nebo jiná fintech banka" },
    { v: "jina", t: "Jiná" }
  ],

  base: {
    vek: {
      q: "Kolik ti je?",
      options: [
        { v: "18-21", t: "18 až 21" },
        { v: "22-25", t: "22 až 25" },
        { v: "26-30", t: "26 až 30" },
        { v: "jine", t: "Je mi víc než 30" },
        { v: "pod18", t: "Je mi míň než 18" }
      ]
    },
    cinnost: {
      q: "Čím se teď živíš?",
      options: [
        { v: "studuju", t: "Studuju" },
        { v: "pracuju", t: "Pracuju" },
        { v: "studuju_pracuju", t: "Studuju a pracuju" },
        { v: "jine", t: "Jiné" }
      ]
    },
    banka: { q: "Která banka je tvoje hlavní, tu, kterou nejvíc používáš?", extra: [{ v: "nevim", t: "Nevím" }] },
    dalsiUcet: {
      q: "Máš účet nebo kartu i u další banky nebo fintechu?",
      options: [{ v: "ano", t: "Ano" }, { v: "ne", t: "Ne" }]
    },
    dalsiKde: { q: "U které? Můžeš vybrat víc." }
  },

  // ---------- Výběr zastávek ----------
  pick: {
    q: "Které zastávky na cestě řešíš?",
    hint: "Klepni na ty, které se tě týkají, a u každé vyber, jestli se to dělo nebo bude dít.",
    modes: [
      { v: "zkusenost", t: "Dělo se mi to v posledních 12 měsících" },
      { v: "plan", t: "Čeká mě to v příštích 12 měsících" }
    ],
    none: "Nic z toho mě teď netrápí",
    needMode: "U vybraných zastávek ještě vyber, kdy se to děje.",
    needAny: "Vyber aspoň jednu možnost."
  },

  // ---------- Události ----------
  // kvuli: "kvůli ..." (3. pád), situace: "Představ si, ..." (jen hypotetický režim)
  events: [
    {
      id: "podnajem", icon: "🏠", short: "Podnájem", title: "Stěhuju se do podnájmu",
      card: "Poprvé bydlíš jinde než u rodičů, ale ne ve vlastním",
      kvuli: "stěhování do podnájmu", situace: "že se poprvé stěhuješ do podnájmu",
      scene: "První vlastní klíče od bytu, který ale pořád někomu patří. Kauce, nájem a zálohy na energie jsou najednou tvoje věc.",
      mění: "Přibývají pravidelné platby a musíš sehnat kauci.",
      barriers: [
        { k: "K", t: "Nevím, kolik si můžu dovolit a kolik si odkládat." },
        { k: "T", t: "Bojím se, že mi někdo naúčtuje něco navíc nebo zneužije, že tomu nerozumím (smlouvy, kauce, nabídky)." },
        { k: "P", t: "Chybí mi nástroj, který by usnadnil kauci, společné placení nebo pravidelné platby." },
        { k: "S", t: "Hlavní problém jsou vysoké nájmy, ne peníze nebo rady." }
      ]
    },
    {
      id: "brigada", icon: "💼", short: "Brigáda", title: "Brigáda nebo první příjem",
      card: "Studentská brigáda nebo první příjem vedle školy",
      kvuli: "brigádě nebo prvnímu příjmu vedle školy", situace: "že máš brigádu nebo první příjem vedle školy",
      scene: "Přišly první peníze, které nejsou kapesné. Jsou na účtu a nikdo ti neříká, co s nimi.",
      mění: "Máš vlastní příjem a sám/sama rozhoduješ, co s ním.",
      barriers: [
        { k: "K", t: "Nevím, co si z toho nechat, co zdanit a jak s tím nakládat." },
        { k: "T", t: "Nejsem si jistý/á, jestli rady, které najdu, nejsou hlavně prodejní." },
        { k: "P", t: "Chybí mi jednoduchý způsob, jak peníze rozdělit (kapsy, spoření) a mít přehled." },
        { k: "S", t: "Vydělávám tak málo, že se to nedá řešit." }
      ]
    },
    {
      id: "zahranici", icon: "✈️", short: "Zahraničí", title: "Zahraničí",
      card: "Studium, práce nebo cestování v zahraničí",
      kvuli: "pobytu v zahraničí (studium, práce nebo cestování)", situace: "že vyrážíš do zahraničí (studium, práce nebo cestování)",
      scene: "Erasmus, práce za hranicemi nebo delší výlet. Karta, kurzy a poplatky jsou najednou věc.",
      mění: "Platíš v jiné měně a řešíš kurzy a poplatky.",
      barriers: [
        { k: "K", t: "Nevím, jak levně platit, směňovat a jaké jsou poplatky." },
        { k: "T", t: "Bojím se podvodů nebo problému s kartou v zahraničí." },
        { k: "P", t: "Chybí mi účet nebo karta, která funguje v cizí měně bez poplatků." },
        { k: "S", t: "Většinu řeší škola, zaměstnavatel nebo pravidla země, ne já." }
      ]
    },
    {
      id: "uvazek", icon: "🧑‍💼", short: "První úvazek", title: "První plný úvazek po škole",
      card: "Škola skončila a nastupuješ do práce na plno",
      kvuli: "prvnímu plnému úvazku po škole", situace: "že nastupuješ na první plný úvazek po škole",
      scene: "Škola skončila a první výplata je na světě. Je větší než z brigády a otázka je, co s ní.",
      mění: "Příjem je vyšší a pravidelný, rozhoduješ o rezervě i spoření.",
      barriers: [
        { k: "K", t: "Nevím, co dělat s vyšším příjmem (rezerva, spoření, investice, benefity)." },
        { k: "T", t: "Nabídky bank a poradců mi přijdou prodejní a nevím, čemu z toho věřit." },
        { k: "P", t: "Chybí mi jednoduchý plán, který se sám postará o rezervu a spoření." },
        { k: "S", t: "Příjem nebo pracovní podmínky jsou nejistější, než jsem čekal/a." }
      ]
    },
    {
      id: "partner", icon: "👫", short: "Společné peníze", title: "Společné finance s partnerem nebo partnerkou",
      card: "Společné nákupy, dovolená, bydlení nebo rozpočet ve dvou",
      kvuli: "společným financím s partnerem nebo partnerkou", situace: "že začínáš řešit společné finance s partnerem nebo partnerkou",
      scene: "Společné nákupy, dovolená, třeba společné bydlení. Účtenky se najednou dělí na dvě strany.",
      mění: "Část peněz se začíná řešit společně.",
      barriers: [
        { k: "K", t: "Nevím, jak si peníze férově rozdělit a vést společný rozpočet." },
        { k: "T", t: "Nechci sdílet detaily o penězích s bankou nebo aplikací." },
        { k: "P", t: "Chybí mi nástroj pro společný rozpočet a sdílené cíle." },
        { k: "S", t: "Je to hlavně věc dohody mezi námi dvěma, ne banky." }
      ]
    },
    {
      id: "bydleni", icon: "🔑", short: "Vlastní bydlení", title: "Vlastní bydlení",
      card: "Koupě, hypotéka nebo spoření na podíl",
      kvuli: "vlastnímu bydlení (koupě, hypotéka, spoření na podíl)", situace: "že řešíš vlastní bydlení (koupě, hypotéka, spoření na podíl)",
      scene: "Vlastní byt je velký sen a taky velké číslo na papíře. Hypotéka, našetřený podíl, odhad ceny.",
      mění: "Spoříš na velkou částku a řešíš dlouhodobý závazek.",
      barriers: [
        { k: "K", t: "Nevím, jak na hypotéku, kolik potřebuju našetřit a co všechno to obnáší." },
        { k: "T", t: "Bojím se, že mi někdo naúčtuje skryté poplatky nebo mi poradí ve svůj prospěch." },
        { k: "P", t: "Chybí mi způsob, jak se k vlastnímu bydlení dostat postupně a bezpečně." },
        { k: "S", t: "Ceny nemovitostí jsou prostě mimo dosah, to nevyřeší banka." }
      ]
    },
    {
      id: "rodina", icon: "👶", short: "Rodina", title: "Rodina",
      card: "Narození dítěte nebo plánování rodiny",
      kvuli: "narození dítěte nebo plánování rodiny", situace: "že plánuješ rodinu nebo narození dítěte",
      scene: "Plánování rodiny nebo dítě na cestě znamená hlavně nový rozpočet. Ptám se jen na peníze a praktické kroky.",
      mění: "Mění se příjmy, výdaje a pojištění.",
      barriers: [
        { k: "K", t: "Nevím, jak se na to finančně připravit (rodičovská, pojištění, daně)." },
        { k: "T", t: "Nejsem si jistý/á, kterým radám o pojištění a spoření pro rodinu věřit." },
        { k: "P", t: "Chybí mi jednoduchý přehled a produkty, které s tím počítají." },
        { k: "S", t: "Největší problém je chybějící podpora státu nebo zaměstnavatele." }
      ]
    },
    {
      id: "vydaj", icon: "🔧", short: "Nečekaný výdaj", title: "Nečekaný výdaj nebo výpadek příjmu",
      card: "Rozbitý telefon, oprava, výpadek brigády nebo dlouhé hledání práce",
      kvuli: "nečekanému výdaji nebo výpadku příjmu", situace: "že přijde nečekaný výdaj nebo výpadek příjmu",
      scene: "Někdy se stane něco, s čím jsi nepočítal/a, a peníze musí najednou vyjít jinak. Třeba rozbitý telefon nebo vypadlá brigáda.",
      mění: "Musíš rychle sehnat peníze nebo upravit rozpočet.",
      barriers: [
        { k: "K", t: "Nevím, co udělat jako první, abych měl/a peníze pod kontrolou." },
        { k: "T", t: "Nevím, jestli bych v takové chvíli bance nebo aplikaci věřil/a, že mi nabídne férové řešení (půjčka, odklad splátek)." },
        { k: "P", t: "Chybí mi rezerva nebo rychlé řešení bez drahých poplatků." },
        { k: "S", t: "Je to hlavně o práci nebo situaci kolem mě, s penězi to nevyřeším." }
      ]
    }
  ],

  // Přidá k A5 pátou možnost "nic mě nebrzdí" (kód prázdný). Smaž, pokud ji nechceš.
  noBarrier: { k: "", t: "Nic mě v tom nebrzdí." },

  // ---------- Otázky A1 až A6 u každé zastávky ----------
  stopQ: {
    a1: {
      q: {
        z: function (e) { return "Jak moc se u tebe kvůli " + e.kvuli + " řešily peníze víc než jindy?"; },
        p: function (e) { return "Jak moc se u tebe kvůli " + e.kvuli + " budou řešit peníze víc než jindy?"; },
        h: function (e) { return "Představ si " + e.situace + ". Jak moc by se u tebe řešily peníze víc než jindy?"; }
      },
      lo: "Vůbec", hi: "Hodně"
    },
    a2: {
      q: {
        z: "Co jsi kvůli tomu s penězi dělal/a? Vyber všechno, co sedí.",
        p: "Co s penězi kvůli tomu plánuješ? Vyber všechno, co sedí.",
        h: "Co bys kvůli tomu s penězi dělal/a? Vyber všechno, co sedí."
      },
      options: [
        { v: "sleduju_vydaje", t: { z: "Sleduju výdaje", p: "Budu sledovat výdaje", h: "Sledoval/a bych výdaje" } },
        { v: "rozpocet", t: { z: "Nastavuju si rozpočet", p: "Nastavím si rozpočet", h: "Nastavil/a bych si rozpočet" } },
        { v: "sporim", t: { z: "Začínám spořit nebo odkládat", p: "Začnu spořit nebo odkládat", h: "Začal/a bych spořit nebo odkládat" } },
        { v: "srovnavam", t: { z: "Srovnávám nabídky (účty, pojištění, ...)", p: "Budu srovnávat nabídky (účty, pojištění, ...)", h: "Srovnával/a bych nabídky (účty, pojištění, ...)" } },
        { v: "hledam_radu", t: { z: "Hledám informace nebo radu", p: "Budu hledat informace nebo radu", h: "Hledal/a bych informace nebo radu" } },
        { v: "nic", t: "Nic zvláštního", x: true }
      ]
    },
    a3: {
      q: {
        z: "Kde jsi hledal/a informace k penězům jako první?",
        p: "Kam půjdeš pro informace k penězům jako první?",
        h: "Kam bys šel/šla pro informace k penězům jako první?"
      },
      options: [
        { v: "moje_banka", t: "Moje banka (appka nebo web)" },
        { v: "jina_banka", t: "Jiná banka nebo fintech (Revolut, Wise...)" },
        { v: "google", t: "Google, srovnávače, weby" },
        { v: "kamaradi_rodina", t: "Kamarádi nebo rodina" },
        { v: "socialni_site", t: "Sociální sítě, YouTube, podcasty" },
        { v: "ai", t: "AI asistent (ChatGPT, Gemini, Claude...)" },
        { v: "poradce", t: "Poradce nebo odborník" },
        { v: "zamestnavatel_skola", t: "Zaměstnavatel, škola, univerzita" },
        { v: "nikam", t: "Zatím nikam, nevím" }
      ]
    },
    a4: {
      q: {
        z: "Kde jsi to nakonec vyřídil/a?",
        p: "Kde to asi budeš vyřizovat?",
        h: "Kde bys to asi vyřizoval/a?"
      },
      options: [
        { v: "moje_banka", t: "V mé bance" },
        { v: "jina_banka", t: "V jiné bance nebo fintechu" },
        { v: "jinde", t: "Jinde (pojišťovna, realitka, úřad...)" },
        { v: "nevyrizuju", t: "Nevyřizuju" },
        { v: "nevim", t: "Nevím" }
      ]
    },
    a5: {
      q: {
        z: "Co ti v tom nejvíc brání?",
        p: "Co ti v tom nejspíš bude bránit?",
        h: "Co by ti v tom nejspíš bránilo?"
      }
    },
    a6: {
      q: "Od koho bys v tom přijal/a pomoc s penězi? Vyber všechny možnosti, které sedí.",
      options: [
        { v: "moje_banka", t: "Moje banka" },
        { v: "rodice_rodina", t: "Rodiče nebo rodina" },
        { v: "skola", t: "Škola, univerzita" },
        { v: "zamestnavatel", t: "Zaměstnavatel" },
        { v: "obec_stat", t: "Obec nebo stát" },
        { v: "kamaradi", t: "Kamarádi" },
        { v: "online_obsah", t: "Online obsah" },
        { v: "ai", t: "AI asistent" },
        { v: "nikdo", t: "Nikdo, zvládnu to sám/sama", x: true }
      ]
    }
  },

  // ---------- Společný blok ----------
  commonIntro: { title: "Poslední úsek", text: "Ještě pár otázek, které nejsou vázané na žádnou zastávku. Skoro hotovo.", button: "Jedeme" },

  common: {
    cetnost: {
      q: "Jak často jinak řešíš svoje finance (rozpočet, výdaje, spoření)?",
      options: [
        { v: "denne", t: "Denně" },
        { v: "tydne", t: "Týdně" },
        { v: "mesicne", t: "Měsíčně" },
        { v: "mene", t: "Méně než jednou za půl roku" }
      ]
    },
    novyProdukt: {
      q: "Otevřel/a jsi za posledních 12 měsíců nový účet, kartu nebo investiční účet u jiné firmy, než je tvoje hlavní banka?",
      options: [{ v: "ano", t: "Ano" }, { v: "ne", t: "Ne" }]
    },
    novyProduktKde: {
      q: "U koho?",
      options: [
        { v: "banka", t: "U banky" },
        { v: "fintech", t: "U fintechu" },
        { v: "broker", t: "U brokera" },
        { v: "jine", t: "Jinde" }
      ]
    },
    investovani: {
      q: "Jak je to u tebe s investováním?",
      options: [
        { v: "neinvestuju", t: "Neinvestuju" },
        { v: "banka", t: "Investuju přes banku" },
        { v: "broker", t: "Investuju přes brokera (například XTB, Trading 212)" },
        { v: "krypto", t: "Investuju do kryptoměn" },
        { v: "nezajem", t: "Nemám zájem" },
        { v: "chtel_bych", t: "Nemám, ale chtěl/a bych" }
      ]
    },
    cenaScenar: "Představ si, že ti banka nabídne osobní plán peněz (rozpočet, rezerva, spoření na bydlení), sestavený s pomocí AI. Banka za doporučení ručí a v důležitých chvílích s tebou mluví člověk.",
    cenaPrices: [0, 49, 99, 149, 249],
    cenaQ: function (c) {
      return c === 0
        ? "Kdyby to bylo zdarma (0 Kč měsíčně), využil/a bys to?"
        : "Zaplatil/a bys " + c + " Kč měsíčně?";
    },
    cenaOptions: [
      { v: "urcite_ano", t: "Určitě ano" },
      { v: "spise_ano", t: "Spíš ano" },
      { v: "spise_ne", t: "Spíš ne" },
      { v: "urcite_ne", t: "Určitě ne" }
    ],
    hodnota: {
      q: "Připadalo by ti to jako...",
      options: [
        { v: "pridana_hodnota", t: "Přidaná hodnota, za kterou bych platil/a" },
        { v: "zdarma", t: "Hezké, ale mělo by to být zdarma" },
        { v: "informace_na_webu", t: "Informace, kterou si najdu na internetu" }
      ]
    },
    duvera: {
      q: "Komu bys nejspíš věřil/a s radou o penězích?",
      options: [
        { v: "moje_banka", t: "Moje banka" },
        { v: "banka_ai", t: "Banka s AI asistentem" },
        { v: "ai_tech", t: "AI asistent od technologické firmy (ChatGPT, Gemini...)" },
        { v: "nezavisly_poradce", t: "Nezávislý poradce" },
        { v: "influencer", t: "Influencer nebo tvůrce" },
        { v: "kamaradi_rodina", t: "Kamarádi, rodina" },
        { v: "nikomu", t: "Nikomu" }
      ]
    },
    duveraZvysi: {
      q: "Co by tvoji důvěru zvýšilo? Vyber všechno, co sedí.",
      options: [
        { v: "ruceni", t: "Banka za doporučení ručí" },
        { v: "vysvetleni", t: "Vysvětlení, proč radí právě tohle" },
        { v: "clovek", t: "Člověk po ruce v důležitých chvílích" },
        { v: "overeni", t: "Nezávislé ověření" },
        { v: "nic", t: "Nic by nepomohlo", x: true }
      ]
    },
    podvody: {
      q: "Zprávy o podvodech a falešných hovorech v poslední době: změnily tvoji důvěru v banky?",
      options: [
        { v: "snizily", t: "Snížily ji" },
        { v: "beze_zmeny", t: "Beze změny" },
        { v: "zvysily", t: "Zvýšily ji" }
      ]
    },
    sdileni: {
      q: "Co bys bance dovolil/a vidět, kdyby ti to jasně pomohlo? Vyber všechno, co sedí.",
      options: [
        { v: "prijmy_vydaje", t: "Příjmy a výdaje na účtu" },
        { v: "nakupy", t: "Podrobnosti o nákupech" },
        { v: "prace_studium", t: "Informace o práci nebo studiu" },
        { v: "partner_rodina", t: "Údaje o partnerovi nebo rodině" },
        { v: "poloha", t: "Polohu" },
        { v: "nic", t: "Nic z toho", x: true }
      ]
    },
    aiObava: {
      q: "Bojím se, že kvůli AI bude těžší najít dobrou první práci nebo udržet příjem.",
      lo: "Vůbec", hi: "Úplně"
    },
    aiOdlozeni: {
      q: "Odložil/a jsem nebo změnil/a nějaké finanční rozhodnutí kvůli nejistotě kolem práce.",
      options: [{ v: "ano", t: "Ano" }, { v: "ne", t: "Ne" }, { v: "mozna", t: "Možná" }]
    },
    otevrena: {
      q: "Co by ti banky měly umět, aby sis na ně vzpomněl/a, když řešíš velké životní změny?",
      placeholder: "Napiš pár slov (nepovinné)",
      button: "Hotovo"
    }
  },

  // ---------- Závěr ----------
  ending: {
    title: "Díky, fakt moc",
    paragraphs: [
      "Právě jsi mi pomohl/a s celou studií. Každá odpověď se počítá a já si toho moc vážím.",
      "Pokud znáš někoho mezi 18 a 30, komu by to zabralo pár minut, pošli mu to dál. Čím víc různých lidí, tím užitečnější data."
    ],
    share: "Pošli to dál",
    copied: "Odkaz je zkopírovaný",
    shareText: "Pomoz mi s případovou studií o tom, jak mladí lidé řeší peníze. Zabere to 3 až 5 minut a je to anonymní.",
    note: "Tohle je orientační průzkum na menším vzorku lidí, ne reprezentativní statistika."
  },

  // ---------- Časová osa ----------
  timeline: { ticks: [18, 21, 24, 27, 30], ageLabel: "Je ti teď" }
};
