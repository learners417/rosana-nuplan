/* NuPlan · el plan por porciones de la Lic. Rosana Roldán (pedido del 19/11, audio de Ro).
   Cada comida dice cuántas porciones lleva de cada grupo; cada porción es UNA opción de la lista de equivalencias
   y la persona elige cuál. Todo sale del valor calórico del plan (el calculado o el que Ro pone a mano).
   La tabla de porciones la armó TCD con medidas caseras de uso común en Argentina y queda a validación de Ro:
   cuando Ro mande un cambio, se cambia ACÁ y en ningún otro lado. */
(function (g) {
  "use strict";

  /* Grupos: k · nombre en singular · energía aproximada de UNA porción (kcal) */
  var GRUPOS = [
    { k: "lac", t: "lácteo", kcal: 80 },
    { k: "carb", t: "carbohidrato", kcal: 80 },
    { k: "prot", t: "proteína", kcal: 75 },
    { k: "fru", t: "fruta", kcal: 65 },
    { k: "gra", t: "grasa buena", kcal: 45 }
  ];
  var VEG_KCAL = 50; // la mitad del plato de vegetales, en almuerzo y cena
  var MOMENTOS = [
    { k: "desayuno", t: "Desayuno", h: "8:00 hs" },
    { k: "mm", t: "Media mañana", h: "10:30 hs" },
    { k: "almuerzo", t: "Almuerzo", h: "13:00 hs" },
    { k: "merienda", t: "Merienda", h: "17:00 hs" },
    { k: "cena", t: "Cena", h: "21:00 hs" }
  ];
  var PRINCIPAL = { almuerzo: 1, cena: 1 };
  var MAX = 12;

  function grupo(k) { return GRUPOS.filter(function (x) { return x.k === k; })[0]; }
  function momento(k) { return MOMENTOS.filter(function (x) { return x.k === k; })[0]; }

  /* Equivalencias: lo que vale UNA porción. dieta: n normal · v vegetariana · g vegana. cel: sin TACC. */
  function equivalencias(k, mom, dieta, cel) {
    var principal = !!PRINCIPAL[mom];
    if (k === "lac") {
      if (dieta === "g") return ["1 taza de bebida de soja sin azúcar", "1 yogur de soja", "1 taza de bebida de almendras o de coco"];
      return ["1 taza de leche descremada", "1 yogur descremado", "1 rebanada de queso port salut descremado (30 g)", "2 cucharadas tipo postre de queso untable descremado"];
    }
    if (k === "carb") {
      if (!principal) return cel
        ? ["1 rebanada de pan sin TACC", "1 pancake de avena certificada sin TACC", "1/4 de taza de avena certificada sin TACC", "1/3 de taza de copos de arroz sin azúcar", "2 galletitas sin TACC", "3 galletas de arroz"]
        : ["1 rebanada de pan integral", "1 pancake de avena chico", "1/4 de taza de avena arrollada", "2 cucharadas de granola sin azúcar", "2 galletitas integrales o de salvado", "3 galletas de arroz", "1/2 pan árabe chico"];
      return cel
        ? ["1/2 taza de pasta sin TACC cocida", "1/3 de taza de arroz cocido", "1/3 de taza de legumbres cocidas", "1 papa chica o 1/2 batata chica", "1/2 choclo", "1/2 taza de polenta cocida", "1/3 de taza de quinoa cocida", "1 rebanada de pan sin TACC"]
        : ["1/2 taza de pasta cocida", "1/3 de taza de arroz cocido", "1/3 de taza de legumbres cocidas", "1 papa chica o 1/2 batata chica", "1/2 choclo", "1/2 taza de polenta cocida", "1/2 taza de cous cous cocido", "1 rebanada de pan integral"];
    }
    if (k === "prot" && mom === "desayuno") {
      /* Pedido de Ro (24/11): en el desayuno, lácteo y proteína van juntos como «proteína». */
      if (dieta === "g") return ["1 taza de bebida de soja sin azúcar", "1 yogur de soja", "1 rebanada de tofu (60 g)", "2 cucharadas de pasta de garbanzos (hummus)"];
      return ["1 taza de leche descremada", "1 yogur descremado", "1 rebanada de queso port salut descremado (30 g)", "2 cucharadas tipo postre de queso untable descremado",
        "1 huevo", "2 claras de huevo", "2 cucharadas soperas de ricota"];
    }
    if (k === "prot") {
      var seitan = cel ? [] : ["40 g de seitán"];
      if (dieta === "g") return ["1 rebanada de tofu (60 g)", "1/2 taza de soja texturizada ya hidratada", "1/2 taza de legumbres cocidas"].concat(seitan);
      if (dieta === "v") return ["1 huevo", "1 rebanada de queso fresco (30 g)", "1 rebanada de tofu (60 g)", "1/2 taza de soja texturizada ya hidratada"].concat(seitan);
      if (!principal) return ["1 huevo", "2 claras de huevo", "1 rebanada de queso fresco (30 g)"];
      return ["50 g de carne magra cocida (vaca o cerdo)", "50 g de pollo sin piel o de pescado", "1 huevo", "1/2 lata de atún al natural", "1 rebanada de queso fresco (30 g)"];
    }
    if (k === "fru") return ["1 fruta mediana (manzana, naranja o pera)", "1 banana chica", "1 taza de frutas cortadas o de frutillas", "2 mandarinas"];
    if (k === "gra") return principal
      ? ["1 cucharadita de aceite de oliva", "2 cucharadas de palta", "6 aceitunas", "1 cucharada de semillas (chía, lino o sésamo)"]
      : ["6 almendras", "2 nueces", "10 maníes sin sal", "1 cucharadita de pasta de maní", "2 cucharadas de palta"];
    return [];
  }
  var VEGETALES = "Crudos, al vapor, al horno o salteados: hojas verdes, tomate, zapallito, brócoli, zanahoria, berenjena, pimiento, chauchas.";
  var TIPS = {
    desayuno: "Un desayuno completo evita el picoteo el resto del día.",
    mm: "Adecuá la colación a tus horarios y a tu actividad.",
    almuerzo: "La mitad del plato, vegetales. La otra mitad, tus porciones.",
    merienda: "",
    cena: ""
  };

  /* Porciones del día según el valor calórico */
  function totalesDe(kcal) {
    var T = Math.max(800, Math.min(6000, Math.round(+kcal || 1500)));
    var t = {
      lac: T >= 2000 ? 3 : 2,
      fru: T >= 2600 ? 4 : T >= 1600 ? 3 : 2,
      gra: Math.max(2, Math.min(8, Math.round(T / 500))),
      prot: Math.max(3, Math.round(T * 0.28 / 75))
    };
    var resto = T - 2 * VEG_KCAL - t.lac * 80 - t.fru * 65 - t.gra * 45 - t.prot * 75;
    t.carb = Math.max(3, Math.round(resto / 80));
    return t;
  }

  /* Reparto entre las comidas. Sin carbohidrato a la noche (modelo de Ro) o con carbohidrato igual que el almuerzo. */
  function repartir(t, cenaSinCarbo) {
    var c = { desayuno: {}, mm: {}, almuerzo: {}, merienda: {}, cena: {} };
    function add(k, gk, n) { if (n > 0) c[k][gk] = (c[k][gk] || 0) + n; }
    function ciclo(gk, n, orden) { for (var i = 0; i < n; i++) add(orden[i % orden.length], gk, 1); }
    ciclo("lac", t.lac, ["desayuno", "merienda", "mm", "cena", "almuerzo"]);
    ciclo("fru", t.fru, ["mm", "almuerzo", "merienda", "cena", "desayuno"]);
    ciclo("gra", t.gra, ["almuerzo", "cena", "mm", "merienda"]); // el desayuno sin grasa fija (Ro, 24/11): se suma con «Agregar»
    var P = t.prot, pd = P >= 8 ? 1 : 0, pr = P - pd;
    add("desayuno", "prot", pd); add("almuerzo", "prot", Math.ceil(pr / 2)); add("cena", "prot", Math.floor(pr / 2));
    var C = t.carb, d, m, a, n = 0;
    if (cenaSinCarbo !== false) {
      d = Math.min(C, Math.max(1, Math.round(C * 0.3))); m = Math.min(C - d, Math.max(1, Math.round(C * 0.2))); a = C - d - m;
    } else {
      d = Math.min(C, Math.max(1, Math.round(C * 0.25))); m = Math.min(C - d, Math.max(1, Math.round(C * 0.15)));
      var r = C - d - m; a = Math.ceil(r / 2); n = r - a;
    }
    add("desayuno", "carb", d); add("merienda", "carb", m); add("almuerzo", "carb", a); add("cena", "carb", n);
    if (c.desayuno.lac) { add("desayuno", "prot", c.desayuno.lac); delete c.desayuno.lac; } // lácteo + proteína = «proteína» en el desayuno
    return c;
  }

  function kcalDe(comidas) {
    var s = 0;
    MOMENTOS.forEach(function (mo) {
      var x = (comidas || {})[mo.k] || {};
      GRUPOS.forEach(function (gr) { s += (+x[gr.k] || 0) * gr.kcal; });
      if (PRINCIPAL[mo.k]) s += VEG_KCAL;
    });
    return s;
  }
  /* Las opciones de una porción: las que Ro dejó en ESTE plan (si las cambió) o las de la tabla. */
  function opciones(p, mom, gk) {
    var o = p && p.opciones && p.opciones[mom + "." + gk];
    if (Array.isArray(o)) { o = o.map(function (x) { return String(x == null ? "" : x).replace(/\s+/g, " ").trim(); }).filter(Boolean); if (o.length) return o; }
    return equivalencias(gk, mom, p && (p.dieta || p.tipo), p && (p.celiaco || p.cel));
  }
  /* Grupos que se pueden sumar en una comida (en el desayuno, el lácteo ya está dentro de «proteína») */
  function agregables(mom, x) {
    return GRUPOS.filter(function (gr) { return !(+(x || {})[gr.k] > 0) && !(mom === "desayuno" && gr.k === "lac"); });
  }
  function cuantas(comidas) { var n = 0; MOMENTOS.forEach(function (mo) { var x = (comidas || {})[mo.k] || {}; GRUPOS.forEach(function (gr) { n += (+x[gr.k] || 0); }); }); return n; }

  /* «2 porciones de carbohidrato» */
  function rotulo(n, gk) { var gr = grupo(gk); return n + (n === 1 ? " porción de " : " porciones de ") + (gr ? gr.t : gk); }

  /* Lo que se guarda en el plan */
  function nuevo(o) {
    o = o || {};
    var kcal = +o.kcal > 0 ? Math.round(+o.kcal) : 0;
    var tips = Object.assign({}, TIPS);
    if (o.cenaSinCarbo !== false) tips.cena = "A la noche, la mitad del plato con vegetales y la otra mitad con proteína.";
    return { v: 1, kcal: kcal || 1500, sinValor: !kcal, cenaSinCarbo: o.cenaSinCarbo !== false,
      dieta: o.dieta || "n", celiaco: !!o.celiaco, comidas: repartir(totalesDe(kcal || 1500), o.cenaSinCarbo), tips: tips };
  }
  function cambiar(p, mom, gk, n) {
    var q = JSON.parse(JSON.stringify(p));
    n = Math.max(0, Math.min(MAX, Math.round(+n || 0)));
    q.comidas[mom] = q.comidas[mom] || {};
    if (n) q.comidas[mom][gk] = n; else delete q.comidas[mom][gk];
    return q;
  }
  function rearmar(p, kcal) {
    var q = JSON.parse(JSON.stringify(p));
    if (+kcal > 0) { q.kcal = Math.max(800, Math.min(6000, Math.round(+kcal))); q.sinValor = false; }
    q.comidas = repartir(totalesDe(q.kcal), q.cenaSinCarbo);
    return q;
  }
  /* Qué tan cerca está la suma del objetivo: ok (±7 %), sobra o falta, y cuántas porciones mover */
  function estado(p) {
    var s = kcalDe(p.comidas), dif = s - p.kcal, tol = Math.max(80, p.kcal * 0.07);
    return { suma: s, dif: dif, ok: Math.abs(dif) <= tol, porciones: Math.max(1, Math.round(Math.abs(dif) / 75)) };
  }

  /* El texto de «Tus comidas» (dailyPlan), para lo que todavía lee el plan en texto */
  function diario(p) {
    return MOMENTOS.map(function (mo) {
      var x = p.comidas[mo.k] || {}, items = [];
      if (mo.k === "desayuno" || mo.k === "merienda") items.push("Infusión libre: té, mate o café");
      GRUPOS.forEach(function (gr) {
        var n = +x[gr.k] || 0; if (!n) return;
        items.push(rotulo(n, gr.k) + ". Cada una: " + opciones(p, mo.k, gr.k).join(" / "));
      });
      if (PRINCIPAL[mo.k]) items.push("Vegetales libres: la mitad del plato. " + VEGETALES);
      return { type: mo.t.toUpperCase(), title: mo.h, items: items, tip: (p.tips || {})[mo.k] || "" };
    }).filter(function (c) { return c.items.length; });
  }

  g.NPPorc = { GRUPOS: GRUPOS, MOMENTOS: MOMENTOS, VEG_KCAL: VEG_KCAL, VEGETALES: VEGETALES, MAX: MAX, PRINCIPAL: PRINCIPAL,
    grupo: grupo, momento: momento, equivalencias: equivalencias, opciones: opciones, agregables: agregables, totalesDe: totalesDe, repartir: repartir, kcalDe: kcalDe, cuantas: cuantas,
    rotulo: rotulo, nuevo: nuevo, cambiar: cambiar, rearmar: rearmar, estado: estado, diario: diario };
})(typeof window !== "undefined" ? window : globalThis);
