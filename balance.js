// Výběr zastávek (pravidlo z oddílu 6 zadání). Čistá funkce bez závislosti na DOM, testuje se v tests/balance.test.js.
(function (root) {
  function total(counts, id) {
    var c = counts && counts[id];
    if (!c) return 0;
    return (c.zkusenost || 0) + (c.plan || 0) + (c.hypoteticky || 0);
  }

  function shuffle(arr, rng) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // Seřadí podle počtu vzestupně, při shodě náhodně.
  function sortByCount(items, counts, rng) {
    return items
      .map(function (it) { return { it: it, c: total(counts, it.id || it), r: rng() }; })
      .sort(function (a, b) { return a.c - b.c || a.r - b.r; })
      .map(function (x) { return x.it; });
  }

  /**
   * opts.selected  [{id, mode}] události vybrané respondentem (mode: 'zkusenost' | 'plan')
   * opts.allIds    [id] všechny události
   * opts.counts    {id: {zkusenost, plan, hypoteticky}} počty dokončených odpovědí, nebo null (výpadek)
   * opts.target    TARGET_PER_EVENT
   * opts.rng       volitelně, výchozí Math.random
   * Vrací {stops: [{id, mode, hypo}], kontrola: bool}; hypotetická zastávka je nejvýš jedna a vždy poslední
   * (výjimka: skupina "nic z toho mě teď netrápí" dostane tři hypotetické).
   */
  function selectStops(opts) {
    var rng = opts.rng || Math.random;
    var counts = opts.counts || null;
    var half = 0.5 * opts.target;
    var selected = opts.selected || [];
    var selIds = selected.map(function (s) { return s.id; });

    if (!selected.length) {
      var ids = counts ? sortByCount(opts.allIds, counts, rng) : shuffle(opts.allIds, rng);
      return {
        kontrola: true,
        stops: ids.slice(0, 3).map(function (id) { return { id: id, mode: 'hypoteticky', hypo: true }; })
      };
    }

    var sorted = counts ? sortByCount(selected, counts, rng) : shuffle(selected, rng);
    var real = sorted.slice(0, 3).map(function (s) { return { id: s.id, mode: s.mode, hypo: false }; });
    var hypo = null;

    if (counts) {
      var under = opts.allIds.filter(function (id) {
        return selIds.indexOf(id) < 0 && total(counts, id) < half;
      });
      if (under.length) {
        var pick = sortByCount(under, counts, rng)[0];
        hypo = { id: pick, mode: 'hypoteticky', hypo: true };
      }
    }

    if (hypo) {
      if (real.length < 3) real.push(hypo);
      else if (total(counts, real[2].id) >= half) real[2] = hypo; // třetí vybraná je už dost pokrytá
    }
    return { kontrola: false, stops: real };
  }

  var api = { selectStops: selectStops, total: total };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Balance = api;
})(typeof window !== 'undefined' ? window : this);
