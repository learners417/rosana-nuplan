/* Ejercicios sueltos de la Lic. Rosana Roldán · 13/11/26
   La barca de las acciones y Zona de equilibrio (paso ACTIVAR), Reconciliate con tu parte glotona (paso NATURALIZAR).
   Cada uno vive en su propia página (/barca/, /zona-de-equilibrio/, /parte-glotona/) y también entra en las landings
   del método con /ejercicios/embed.js. Sin login: lo escrito queda en el teléfono y se le manda a Rosana por mail
   (/api/aviso), con reintento si no hay conexión y un identificador por envío para que le llegue una sola vez.
   Textos propios, en voseo y neutros: sirven igual para mujeres y varones. */
(function () {
  "use strict";

  /* ---------- ilustraciones ---------- */
  var SVG_BARCAS =
    '<svg class="ilus" viewBox="0 0 640 190" aria-hidden="true" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M10 150c40-14 80 14 120 0s80 14 120 0 80 14 120 0 80 14 120 0 80 14 120 0" stroke="#f6a29a" stroke-width="4"/>' +
    '<path d="M40 176c40-12 80 12 120 0s80 12 120 0 80 12 120 0 80 12 120 0 80 12 120 0" stroke="#f6d3cb" stroke-width="4"/>' +
    // la barca que aleja (gris, mira a la izquierda)
    '<path d="M80 128h130l-18 22H104z" stroke="#9ca3af" stroke-width="4" fill="#fff"/>' +
    '<path d="M150 128V54l-46 74z" stroke="#9ca3af" stroke-width="4" fill="#fff"/>' +
    '<path d="M70 92l-26 0m10-10l-10 10 10 10" stroke="#9ca3af" stroke-width="4"/>' +
    // la barca que acerca (coral, mira a la derecha, hacia la bandera)
    '<path d="M380 128h140l-20 22H400z" stroke="#c53a1e" stroke-width="4" fill="#e8472a"/>' +
    '<path d="M446 128V44l56 84z" stroke="#c53a1e" stroke-width="4" fill="#fde9e4"/>' +
    '<path d="M540 92h28m-10-10l10 10-10 10" stroke="#e8472a" stroke-width="4"/>' +
    // tu objetivo
    '<path d="M606 150V36" stroke="#1a1a1a" stroke-width="4"/>' +
    '<path d="M606 38l30 12-30 12z" fill="#e8472a" stroke="#c53a1e" stroke-width="3"/>' +
    "</svg>";

  var ZONAS =
    '<div class="zonas" aria-hidden="true">' +
    '<div class="z-blanca">Zona blanca<small>lo que te negás</small></div>' +
    '<div class="z-negra">Zona negra<small>cuando aparece tu parte rebelde</small></div>' +
    '<div class="z-arco"><i><b style="background:#c53a1e"></b><b style="background:#e8472a"></b><b style="background:#f47a62"></b><b style="background:#f6a29a"></b><b style="background:#f6d3cb"></b></i>Zona arcoíris<small>el equilibrio</small></div>' +
    "</div>";

  function icono(d) {
    return '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + "</svg>";
  }
  var SENTIDOS = [
    { k: "vista", t: "Miralo", d: "El color, la forma, cómo está servido.", svg: icono('<path d="M4 24s7-12 20-12 20 12 20 12-7 12-20 12S4 24 4 24z"/><circle cx="24" cy="24" r="6"/>') },
    { k: "olfato", t: "Olelo", d: "Antes del primer bocado, sentí el aroma.", svg: icono('<path d="M24 6v18l-7 9a4 4 0 003 6h3"/><path d="M30 39h-3"/><path d="M34 14c3 3 3 7 0 10M39 10c5 5 5 13 0 18"/>') },
    { k: "oido", t: "Escuchalo", d: "Lo crocante, lo que cruje, lo que se rompe.", svg: icono('<path d="M16 30c0-4 2-6 2-12a8 8 0 0116 0c0 6-6 8-6 14a6 6 0 01-12 0"/><path d="M24 18a3 3 0 013 3"/>') },
    { k: "tacto", t: "Tocalo", d: "La textura, la temperatura, el peso en la mano.", svg: icono('<path d="M18 26V10a3 3 0 016 0v12"/><path d="M24 22v-4a3 3 0 016 0v6"/><path d="M30 24a3 3 0 016 0v6c0 8-5 12-12 12-5 0-8-3-10-7l-4-8a3 3 0 015-3l3 4"/>') },
    { k: "gusto", t: "Saborealo", d: "Despacio, bocado a bocado, sin hacer otra cosa.", svg: icono('<path d="M8 22c4 10 10 14 16 14s12-4 16-14"/><path d="M8 22c6-4 10-4 16 0 6-4 10-4 16 0"/><path d="M24 26v6"/>') },
  ];

  /* ---------- los tres ejercicios ---------- */
  var DEF = {
    barca: {
      titulo: "La barca de las acciones",
      lede: "Todos los días te subís a muchas barcas sin darte cuenta. Algunas te acercan a lo que querés y otras te alejan. Esta semana las vas a mirar.",
      intro: [
        "Imaginate en un puerto con dos barcas. Una va hacia tu objetivo; la otra, para el lado contrario. Cada cosa que hacés en el día te sube a una o a la otra.",
        "No se trata de no equivocarte nunca: se trata de darte cuenta a cuál te subiste y de volver a elegir.",
        "Lo vas completando día a día, dos minutos a la noche. Lo que escribís queda en tu teléfono y al final se lo mandás a Rosana.",
      ],
      ilus: SVG_BARCAS,
      pasos: [
        {
          nombre: "Tu objetivo",
          bloques: [
            { tipo: "texto", id: "objetivo", label: "¿A dónde querés llegar?", help: "Algo concreto, que se pueda ver. En vez de «comer mejor»: «llevarme la vianda al trabajo cuatro días por semana».", ph: "Mi objetivo es…" },
            {
              tipo: "html",
              html:
                '<div class="dos">' +
                '<div class="barca acerca"><h3>La barca que te acerca</h3><ul><li>Dejar la vianda preparada la noche anterior.</li><li>Sentarte a almorzar, aunque sean quince minutos.</li><li>Tener fruta a mano en el trabajo.</li></ul></div>' +
                '<div class="barca"><h3>La barca que te aleja</h3><ul><li>Saltear el almuerzo por una reunión.</li><li>Llegar con hambre y picar de parado.</li><li>Irte a dormir tarde con el celular.</li></ul></div>' +
                "</div>" +
                '<p class="lede">Son ejemplos. Las tuyas van a ser otras.</p>',
            },
          ],
        },
        {
          nombre: "Tu semana",
          bloques: [
            { tipo: "html", html: "<p>Cada noche, anotá una acción de cada barca. Si un día no te acordás, no pasa nada: seguís al otro.</p>" },
            { tipo: "semana", id: "semana" },
          ],
        },
        {
          nombre: "Lo que viste",
          bloques: [
            { tipo: "texto", id: "q1", label: "¿En cuál de las dos barcas te sentiste con más seguridad? ¿Por qué?", ph: "Me sentí con más seguridad en…" },
            { tipo: "texto", id: "q2", label: "Las veces que te subiste a la que te aleja, ¿qué aprendiste?", help: "Mirá qué estaba pasando: la hora, el cansancio, con quién estabas.", ph: "Aprendí que…" },
            { tipo: "texto", id: "q3", label: "Una acción de la barca que te acerca para repetir la semana que viene", ph: "Voy a repetir…", corto: true },
          ],
        },
      ],
      cierre: "Si la barca que te aleja aparece casi todos los días, contáselo a Rosana: es justo lo que se trabaja con ella.",
    },

    equilibrio: {
      titulo: "Zona de equilibrio",
      lede: "Con la comida no todo es blanco o negro. Hay una tercera zona, y ahí está el equilibrio.",
      intro: [
        "Cuando ponés un alimento en la lista de los que no se tocan, empieza a llamarte más. Y el día que aparece tu parte rebelde, lo comés de más y te sentís peor.",
        "Así se arma un ida y vuelta: de negártelo a comerlo sin medida, y otra vez a negártelo. Este ejercicio es para encontrar el punto del medio: tu zona arcoíris.",
        "Elegí de uno a cinco alimentos. Te lleva unos diez minutos.",
      ],
      ilus: ZONAS,
      pasos: [
        {
          nombre: "Tus alimentos",
          bloques: [
            {
              tipo: "filas",
              id: "alimentos",
              max: 5,
              rotulo: "Alimento",
              sumar: "Sumar otro alimento",
              campos: [
                { id: "blanca", zona: "blanca", etiqueta: "Zona blanca", label: "Un alimento que te negás seguido", ph: "Por ejemplo: alfajores", corto: true },
                { id: "negra", zona: "negra", etiqueta: "Zona negra", label: "¿Qué pasa con ese alimento cuando aparece tu parte rebelde?", ph: "Por ejemplo: me como dos, rápido, a la tarde" },
                { id: "arcoiris", zona: "arcoiris", etiqueta: "Zona arcoíris", label: "¿Cómo sería comerlo con equilibrio?", ph: "Por ejemplo: uno, con un café y sin apuro, dos veces por semana" },
              ],
            },
          ],
        },
        {
          nombre: "Tu compromiso",
          bloques: [
            { tipo: "texto", id: "compromiso", label: "¿Qué acción concreta vas a hacer esta semana para entrar en tu zona arcoíris?", help: "Con día y momento. Por ejemplo: «el miércoles y el sábado, un alfajor con el café de la tarde, en la mesa».", ph: "Esta semana voy a…" },
          ],
        },
      ],
      cierre: "Si con algún alimento sentís que no podés parar nunca, contáselo a Rosana: es algo que se trabaja con ella.",
    },

    glotona: {
      titulo: "Reconciliate con tu parte glotona",
      lede: "Hay una parte tuya a la que le encanta comer. Pelearte con ella no funciona: hoy vas a hacer las paces.",
      intro: [
        "Hay una parte tuya que disfruta muchísimo de comer y que, frente a ciertos alimentos, no frena. Acá la llamamos tu parte glotona.",
        "Cuanto más la retás, más fuerte vuelve: el tira y afloje lo termina ganando ella. No se va a ir nunca, así que conviene llevarse bien.",
        "Hoy acordás con ella qué alimentos que te dan placer entran en tu semana, y en qué momento. Te lleva unos diez minutos.",
      ],
      ilus: "",
      pasos: [
        {
          nombre: "El acuerdo",
          bloques: [
            {
              tipo: "filas",
              id: "placeres",
              max: 6,
              rotulo: "Placer",
              sumar: "Sumar otro",
              campos: [
                { id: "alimento", label: "Un alimento que te da placer", ph: "Por ejemplo: un helado", corto: true },
                { id: "momento", label: "¿En qué momento lo vas a comer?", ph: "Por ejemplo: el domingo a la tarde, en la heladería" },
              ],
            },
          ],
        },
        {
          nombre: "Los cinco sentidos",
          bloques: [
            { tipo: "html", html: "<p>Cuando llegue ese momento, comelo con los cinco sentidos. Tocá cada uno cuando lo hagas.</p>" },
            { tipo: "sentidos", id: "sentidos" },
            { tipo: "texto", id: "como", label: "¿Cómo fue? ¿Qué notaste?", help: "Escribilo después de la primera vez. Alcanza con una línea.", ph: "Noté que…" },
          ],
        },
      ],
      cierre: "Si después de comerlo aparece la culpa, anotalo igual y contáselo a Rosana: también es parte del trabajo.",
    },
  };
  var SLUG = { barca: "barca-de-las-acciones", equilibrio: "zona-de-equilibrio", glotona: "parte-glotona" };
  var DIAS = [["lun", "Lunes"], ["mar", "Martes"], ["mie", "Miércoles"], ["jue", "Jueves"], ["vie", "Viernes"], ["sab", "Sábado"], ["dom", "Domingo"]];

  var ID = document.body.getAttribute("data-ejercicio");
  var E = DEF[ID];
  if (!E) return;
  var P = new URLSearchParams(location.search);
  var EMBED = P.get("embed") === "1";
  var WA = "5491151426830"; // el WhatsApp del programa: el de Rosana
  var KEY = "nuplan-ej-" + ID + "-v1", COLA_KEY = "nuplan-ej-" + ID + "-cola", NOMBRE_KEY = "nuplan-sueltos-nombre";
  var NOMBRE = (P.get("nombre") || "").trim().slice(0, 60);
  if (EMBED) document.body.classList.add("embebido");

  function vacio() { return { empezo: false, step: 0, v: {}, filas: {}, semana: {}, marcas: {}, enviado: null, pend: false }; }
  function diaDeHoy() { return ["dom", "lun", "mar", "mie", "jue", "vie", "sab"][new Date().getDay()]; }
  var diaElegido = diaDeHoy();
  var S = vacio();
  try { var g = JSON.parse(localStorage.getItem(KEY)); if (g && typeof g === "object" && g.v) S = Object.assign(vacio(), g); } catch (e) {}
  function guardar() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function limpio(t) { return String(t || "").trim(); }

  /* ---------- armado de la página ---------- */
  var app = $("app");
  app.innerHTML =
    '<header><div class="eyebrow">NuPlan™ · Lic. Rosana Roldán</div><h1>' + esc(E.titulo) + '</h1><p class="lede">' + esc(E.lede) + "</p></header>" +
    '<section class="panel" id="inicio">' +
    '<div class="card suave"><h2>Antes de empezar</h2>' + E.intro.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") + "</div>" +
    (E.ilus || "") +
    '<button class="btn prim grande" id="empezar" type="button">Empezar</button></section>' +
    '<section class="panel" id="ejercicio" hidden>' +
    '<nav class="steps" aria-label="Pasos" style="grid-template-columns:repeat(' + E.pasos.length + ',1fr)">' +
    E.pasos.map(function (p, i) { return '<button type="button" data-step="' + i + '"><b>' + (i + 1) + "</b>" + esc(p.nombre) + "</button>"; }).join("") +
    "</nav>" +
    '<div id="paso"></div>' +
    '<div class="nav"><button class="btn" id="atras" type="button">Atrás</button><button class="btn prim" id="sig" type="button">Siguiente</button></div>' +
    '<div class="card" id="envio" hidden>' +
    "<h2>Mandáselo a Rosana</h2><p>Le llega a ella, con tu nombre. Lo podés mandar ahora y volver a mandarlo cuando sumes más.</p>" +
    '<div class="field" id="campoNombre" hidden><label for="tuNombre">Tu nombre</label><small>Para que Rosana sepa que es tuyo.</small><input type="text" id="tuNombre" autocomplete="given-name" maxlength="60"></div>' +
    '<button class="btn envio grande" id="mandar" type="button">Mandárselo a Rosana</button>' +
    '<p class="aviso" id="avisoEnvio" role="status"></p>' +
    '<a class="btn link" id="porWa" hidden target="_blank" rel="noopener">Si preferís, mandáselo por WhatsApp</a>' +
    '<p class="nota">' + esc(E.cierre) + "</p></div>" +
    '<div class="nav" style="justify-content:center"><button class="btn link" id="reset" type="button">Borrar todo y empezar de nuevo</button></div>' +
    '<p class="pie">Lo que escribís queda guardado en este teléfono.</p>' +
    "</section>";

  function campoTexto(b, valor, attr) {
    var idc = "c-" + attr.replace(/[^a-z0-9]/gi, "-");
    return '<div class="field"><label for="' + idc + '">' + esc(b.label) + "</label>" + (b.help ? "<small>" + esc(b.help) + "</small>" : "") +
      (b.corto
        ? '<input type="text" id="' + idc + '" data-b="' + esc(attr) + '" value="' + esc(valor) + '" placeholder="' + esc(b.ph || "") + '" maxlength="200">'
        : '<textarea id="' + idc + '" data-b="' + esc(attr) + '" rows="3" placeholder="' + esc(b.ph || "") + '" maxlength="2000">' + esc(valor) + "</textarea>") +
      "</div>";
  }
  function filasDe(id) { var f = S.filas[id]; if (!Array.isArray(f) || !f.length) { f = [{}]; S.filas[id] = f; } return f; }
  function puntosSemana() {
    var n = 0, html = DIAS.map(function (d) {
      var si = limpio((S.semana[d[0]] || {}).a); if (si) n++;
      return '<button type="button" data-dia="' + d[0] + '" class="' + (si ? "si" : "") + (d[0] === diaElegido ? " sel" : "") + '" aria-pressed="' + (d[0] === diaElegido) + '" aria-label="' + d[1] + (si ? ", con algo que te acercó" : "") + '">' + d[1].charAt(0) + "</button>";
    }).join("");
    return { n: n, html: html };
  }
  function pintarPuntos() {
    var p = puntosSemana(), el = $("puntos"), tx = $("puntosTxt");
    if (el) el.innerHTML = p.html;
    if (tx) tx.textContent = p.n === 1 ? "1 de 7 días con algo que te acercó" : p.n + " de 7 días con algo que te acercó";
    var ok = $("ok-dia"); if (ok) ok.textContent = limpio((S.semana[diaElegido] || {}).a) ? "✓" : "";
  }
  function bloqueHTML(b) {
    if (b.tipo === "html") return b.html;
    if (b.tipo === "texto") return '<div class="card">' + campoTexto(b, S.v[b.id] || "", "v|" + b.id) + "</div>";
    if (b.tipo === "semana") {
      var p = puntosSemana();
      var d = DIAS.filter(function (x) { return x[0] === diaElegido; })[0] || DIAS[0], v = S.semana[d[0]] || {};
      return '<div class="card"><p class="etiqueta">Elegí el día</p><div class="puntos" id="puntos">' + p.html + '</div><p class="lede" id="puntosTxt"></p>' +
        '<div class="dia"><h3>' + d[1] + (d[0] === diaDeHoy() ? " · hoy" : "") + ' <span class="ok" id="ok-dia"></span></h3>' +
        campoTexto({ label: "Me acercó", ph: "Algo que hice y me acercó", corto: false }, v.a || "", "s|" + d[0] + "|a") +
        campoTexto({ label: "Me alejó", ph: "Algo que hice y me alejó", corto: false }, v.b || "", "s|" + d[0] + "|b") +
        "</div></div>";
    }
    if (b.tipo === "filas") {
      var filas = filasDe(b.id);
      return filas.map(function (f, i) {
        return '<div class="fila"><div class="fila-cab"><span class="etiqueta">' + esc(b.rotulo) + " " + (i + 1) + "</span>" +
          (filas.length > 1 ? '<button type="button" class="x" data-quitar="' + b.id + "|" + i + '">Quitar</button>' : "") + "</div>" +
          b.campos.map(function (c) {
            var inner = campoTexto(c, f[c.id] || "", "f|" + b.id + "|" + i + "|" + c.id);
            return c.zona ? '<div class="zona ' + c.zona + '"><span class="etiqueta">' + esc(c.etiqueta) + "</span>" + inner + "</div>" : inner;
          }).join("") + "</div>";
      }).join("") +
        (filas.length < b.max ? '<button type="button" class="btn suma" data-sumar="' + b.id + '">+ ' + esc(b.sumar) + "</button>" : '<p class="lede">Llegaste al máximo: elegí los que más te importan.</p>');
    }
    if (b.tipo === "sentidos") {
      return '<div class="sentidos">' + SENTIDOS.map(function (s) {
        var on = !!S.marcas[s.k];
        return '<label class="sentido' + (on ? " on" : "") + '">' + s.svg + "<span><b>" + esc(s.t) + "</b>" + esc(s.d) + '</span><input type="checkbox" data-marca="' + s.k + '"' + (on ? " checked" : "") + ' aria-label="' + esc(s.t) + ': lo hice"></label>';
      }).join("") + "</div>";
    }
    return "";
  }

  function pintar() {
    $("inicio").hidden = S.empezo;
    $("ejercicio").hidden = !S.empezo;
    if (!S.empezo) return avisarAlto();
    var paso = E.pasos[S.step] || E.pasos[0];
    $("paso").innerHTML = '<div class="panel"><h2>' + (S.step + 1) + ". " + esc(paso.nombre) + "</h2>" + paso.bloques.map(bloqueHTML).join("") + "</div>";
    pintarPuntos();
    document.querySelectorAll(".steps button").forEach(function (b) {
      var i = +b.dataset.step;
      if (i === S.step) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
      b.classList.toggle("hecho", pasoConAlgo(i));
    });
    $("atras").hidden = S.step === 0;
    $("sig").hidden = S.step === E.pasos.length - 1;
    $("envio").hidden = S.step !== E.pasos.length - 1;
    pintarEnvio();
    avisarAlto();
  }
  function irA(i) {
    S.step = Math.max(0, Math.min(E.pasos.length - 1, i)); guardar(); pintar();
    if (EMBED) { try { parent.postMessage({ np: "arriba", ej: ID }, "*"); } catch (e) {} } else window.scrollTo({ top: 0 });
  }

  /* ---------- lo escrito ---------- */
  document.addEventListener("input", function (e) {
    var t = e.target, b = t.getAttribute && t.getAttribute("data-b");
    if (!b) return;
    var p = b.split("|"), val = t.value;
    if (p[0] === "v") S.v[p[1]] = val;
    else if (p[0] === "s") { S.semana[p[1]] = S.semana[p[1]] || {}; S.semana[p[1]][p[2]] = val; pintarPuntos(); }
    else if (p[0] === "f") { var f = filasDe(p[1]); var i = +p[2]; if (f[i]) f[i][p[3]] = val; }
    guardar();
    marcarPasos();
  });
  document.addEventListener("change", function (e) {
    var k = e.target.getAttribute && e.target.getAttribute("data-marca");
    if (!k) return;
    S.marcas[k] = e.target.checked; guardar();
    var l = e.target.closest(".sentido"); if (l) l.classList.toggle("on", e.target.checked);
    marcarPasos();
  });
  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("button") : null;
    if (!t) return;
    if (t.dataset.step != null) return irA(+t.dataset.step);
    if (t.dataset.dia) { diaElegido = t.dataset.dia; pintar(); var c = document.querySelector('[data-b="s|' + diaElegido + '|a"]'); if (c) c.focus({ preventScroll: true }); return; }
    if (t.dataset.sumar) {
      var id = t.dataset.sumar, bl = bloquePorId(id), f = filasDe(id);
      if (bl && f.length < bl.max) { f.push({}); guardar(); pintar(); var ins = document.querySelectorAll('[data-b^="f|' + id + "|" + (f.length - 1) + '|"]'); if (ins[0]) ins[0].focus(); }
      return;
    }
    if (t.dataset.quitar) {
      var q = t.dataset.quitar.split("|"), fl = filasDe(q[0]);
      if (t.dataset.armado) { fl.splice(+q[1], 1); if (!fl.length) fl.push({}); guardar(); pintar(); }
      else { t.dataset.armado = "1"; t.textContent = "¿Seguro? Tocá de nuevo"; setTimeout(function () { if (t.isConnected) { delete t.dataset.armado; t.textContent = "Quitar"; } }, 4000); }
      return;
    }
  });
  function bloquePorId(id) { var r = null; E.pasos.forEach(function (p) { p.bloques.forEach(function (b) { if (b.id === id) r = b; }); }); return r; }
  function pasoConAlgo(i) { return bloquesDe(E.pasos[i]).l.length > 0; }
  function marcarPasos() { document.querySelectorAll(".steps button").forEach(function (b) { b.classList.toggle("hecho", pasoConAlgo(+b.dataset.step)); }); }

  $("empezar").onclick = function () { S.empezo = true; guardar(); irA(S.step || 0); };
  $("atras").onclick = function () { irA(S.step - 1); };
  $("sig").onclick = function () { irA(S.step + 1); };
  $("reset").onclick = function (e) {
    var b = e.currentTarget;
    if (b.dataset.armado) { S = vacio(); delete b.dataset.armado; b.textContent = "Borrar todo y empezar de nuevo"; guardar(); pintar(); if (!EMBED) window.scrollTo({ top: 0 }); }
    else { b.dataset.armado = "1"; b.textContent = "¿Seguro? Tocá de nuevo para borrar"; setTimeout(function () { if (b.dataset.armado) { delete b.dataset.armado; b.textContent = "Borrar todo y empezar de nuevo"; } }, 4000); }
  };

  /* ---------- lo que le llega a Rosana ---------- */
  function bloquesDe(paso) {
    var l = [];
    paso.bloques.forEach(function (b) {
      if (b.tipo === "texto") { var v = limpio(S.v[b.id]); if (v) l.push({ k: b.label, v: v }); }
      if (b.tipo === "semana") DIAS.forEach(function (d) {
        var x = S.semana[d[0]] || {}, a = limpio(x.a), z = limpio(x.b);
        if (a || z) l.push({ k: d[1], v: (a ? "Me acercó: " + a : "") + (a && z ? "\n" : "") + (z ? "Me alejó: " + z : "") });
      });
      if (b.tipo === "filas") (S.filas[b.id] || []).forEach(function (f, i) {
        var partes = b.campos.map(function (c) { var v = limpio(f[c.id]); return v ? (c.etiqueta ? c.etiqueta + " · " : "") + c.label + ": " + v : ""; }).filter(Boolean);
        if (partes.length) l.push({ k: b.rotulo + " " + (i + 1), v: partes.join("\n") });
      });
      if (b.tipo === "sentidos") {
        var hechos = SENTIDOS.filter(function (s) { return S.marcas[s.k]; }).map(function (s) { return s.t; });
        if (hechos.length) l.push({ k: "Con los cinco sentidos", v: hechos.join(" · ") });
      }
    });
    return { t: paso.nombre, l: l };
  }
  function bloques() { return E.pasos.map(bloquesDe).filter(function (b) { return b.l.length; }); }
  function texto() {
    var L = ["*" + E.titulo + "*", ""];
    bloques().forEach(function (b) { L.push("*" + b.t + "*"); b.l.forEach(function (x) { L.push((x.k ? x.k + ": " : "") + x.v); }); L.push(""); });
    return L.join("\n").trim();
  }
  function mailHTML(titulo, sub, bl) {
    var H = ['<div style="font-family:\'DM Sans\',Helvetica,Arial,sans-serif;color:#1a1a1a;background:#fff6f3;padding:26px 18px;line-height:1.6"><div style="max-width:620px;margin:0 auto;background:#fff;border:1px solid #f6d9d1;border-radius:16px;padding:28px 24px">',
      '<p style="margin:0 0 6px;font-size:15px;letter-spacing:2px;text-transform:uppercase;color:#c53a1e;font-weight:700">Ejercicio NuPlan</p>',
      '<h1 style="margin:0 0 6px;font-size:26px;line-height:1.2">' + esc(titulo) + "</h1>",
      '<p style="margin:0 0 24px;padding-bottom:16px;border-bottom:2px solid #e8472a;font-size:16px;color:#4b5563">' + esc(sub) + "</p>"];
    bl.forEach(function (b) {
      H.push('<p style="margin:22px 0 10px;font-size:15px;letter-spacing:1.5px;text-transform:uppercase;color:#c53a1e;font-weight:700">' + esc(b.t) + "</p>");
      b.l.forEach(function (x) {
        H.push('<div style="margin:0 0 9px;padding:13px 15px;background:#fff6f3;border-left:4px solid #e8472a;border-radius:0 10px 10px 0">' +
          (x.k ? '<p style="margin:0 0 4px;font-size:15px;color:#6b7280">' + esc(x.k) + "</p>" : "") +
          '<p style="margin:0;font-size:16px;white-space:pre-wrap">' + esc(x.v) + "</p></div>");
      });
    });
    H.push('<p style="margin:28px 0 0;padding-top:16px;border-top:1px solid #e5e7eb;font-size:15px;color:#6b7280">Llegó desde el ejercicio ' + esc(titulo) + (EMBED ? ", dentro de la página del método" : "") + ".</p></div></div>");
    return H.join("");
  }
  function mailTexto(titulo, sub, bl) {
    var L = [titulo, sub, ""];
    bl.forEach(function (b) { L.push("== " + b.t + " =="); b.l.forEach(function (x) { L.push((x.k ? x.k + ": " : "") + x.v); }); L.push(""); });
    return L.join("\n");
  }
  function hoyISO() { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function nombreParaMandar() {
    var v = (NOMBRE || $("tuNombre").value || "").trim().slice(0, 60);
    if (v && !NOMBRE) { try { localStorage.setItem(NOMBRE_KEY, v); } catch (e) {} }
    return v;
  }
  function pintarEnvio() {
    $("mandar").textContent = S.pend ? "En camino · se manda solo" : S.enviado ? "✓ Le llegó · mandar de nuevo" : "Mandárselo a Rosana";
  }
  function alSalir() { S.enviado = new Date().toISOString(); S.pend = false; guardar(); pintarEnvio(); }
  $("mandar").onclick = function () {
    var bl = bloques(), av = $("avisoEnvio");
    if (!bl.length) { av.textContent = "Todavía no hay nada para mandar. Empezá por el paso 1."; return; }
    var nom = nombreParaMandar();
    if (!nom) { $("campoNombre").hidden = false; av.textContent = "Escribí tu nombre, así Rosana sabe que es tuyo."; $("tuNombre").focus(); avisarAlto(); return; }
    av.textContent = "Mandando…"; $("porWa").hidden = true;
    var sub = nom + " · " + new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
    S.pend = true; guardar(); pintarEnvio();
    encolar({ paso: E.titulo + " · " + nom, asunto: E.titulo + " · " + nom, nombre: nom, email: "", fecha: hoyISO(),
      mensaje: mailTexto(E.titulo, sub, bl), mensaje_html: mailHTML(E.titulo, sub, bl), paso_slug: SLUG[ID] },
    ID, function (r) {
      if (r === "ok") { av.textContent = "Listo, le llegó a Rosana."; return avisarAlto(); }
      if (r === "espera") { av.textContent = "Se está mandando. Si cerrás la página, sale solo cuando la vuelvas a abrir."; return avisarAlto(); }
      av.textContent = "Quedó guardado en tu teléfono y se manda solo apenas haya conexión.";
      var w = $("porWa"); w.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(texto()); w.hidden = false;
      avisarAlto();
    });
  };

  /* Cola de envíos: lo mandado queda guardado en el teléfono hasta que el servidor confirma que salió.
     Sin conexión se reintenta solo. Cada envío lleva un identificador: a Rosana le llega una sola vez. */
  var COLA = [], enviando = "", esperan = {};
  try { var cg = JSON.parse(localStorage.getItem(COLA_KEY)); if (Array.isArray(cg)) COLA = cg; } catch (e) {}
  function guardarCola() { try { localStorage.setItem(COLA_KEY, JSON.stringify(COLA)); return true; } catch (e) { return false; } }
  function nuevoId() {
    try { if (window.crypto && crypto.randomUUID) return crypto.randomUUID(); } catch (e) {}
    return "a" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
  }
  function encolar(cuerpo, clave, cb) {
    var firma = JSON.stringify(cuerpo), igual = COLA.filter(function (x) { return x.k === clave && JSON.stringify(x.c) === firma; })[0];
    if (igual) { if (cb) esperar(igual.id, cb); if (igual.id !== enviando) { igual.prox = 0; procesarCola(); } return; }
    COLA = COLA.filter(function (x) { return x.k !== clave || x.id === enviando; });
    var it = { id: nuevoId(), k: clave, c: cuerpo, n: 0, prox: 0 };
    COLA.push(it); guardarCola();
    if (cb) esperar(it.id, cb);
    procesarCola();
  }
  function esperar(id, cb) {
    esperan[id] = cb;
    setTimeout(function () { if (esperan[id] === cb) { try { cb("espera"); } catch (e) {} } }, 20000);
  }
  function contestar(id, estado) { var f = esperan[id]; if (!f) return; delete esperan[id]; try { f(estado); } catch (e) {} }
  function procesarCola() {
    if (enviando || !COLA.length || document.hidden) return;
    var ahora = Date.now(), it = COLA.filter(function (x) { return !x.prox || x.prox <= ahora; })[0];
    if (!it) return;
    enviando = it.id;
    var ct = window.AbortController ? new AbortController() : null, to = ct && setTimeout(function () { ct.abort(); }, 30000);
    fetch("/api/aviso", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.assign({ id: it.id }, it.c)), signal: ct ? ct.signal : undefined })
      .then(function (r) { return r.json().then(function (j) { return { s: r.status, j: j }; }, function () { return { s: r.status, j: {} }; }); })
      .then(function (res) { clearTimeout(to); terminarEnvio(it, res.s >= 200 && res.s < 300 && !!res.j && res.j.ok === true, res.s); })
      .catch(function () { clearTimeout(to); terminarEnvio(it, false, 0); });
  }
  function terminarEnvio(it, ok, status) {
    enviando = "";
    if (ok) { COLA = COLA.filter(function (x) { return x.id !== it.id; }); guardarCola(); alSalir(); contestar(it.id, "ok"); }
    else if (COLA.some(function (x) { return x.k === it.k && x.id !== it.id; })) { COLA = COLA.filter(function (x) { return x.id !== it.id; }); guardarCola(); contestar(it.id, "cola"); }
    else {
      it.n = (it.n || 0) + 1;
      it.prox = Date.now() + (status === 429 ? 3 * 3600000 : (status === 400 || status === 403) ? 6 * 3600000 : Math.min(1800000, 15000 * Math.pow(2, Math.min(it.n - 1, 7))));
      guardarCola(); contestar(it.id, "cola");
    }
    setTimeout(procesarCola, 300);
  }
  window.addEventListener("online", function () { COLA.forEach(function (x) { x.prox = 0; }); procesarCola(); });
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") procesarCola(); });
  setInterval(procesarCola, 30000); setTimeout(procesarCola, 1500);

  /* ---------- dentro de una landing: le avisa a la página cuánto mide ---------- */
  var ultimoAlto = 0;
  function avisarAlto() {
    if (!EMBED) return;
    var h = Math.ceil(Math.max(document.documentElement.scrollHeight, document.body.scrollHeight));
    if (h === ultimoAlto) return;
    ultimoAlto = h;
    try { parent.postMessage({ np: "alto", ej: ID, h: h }, "*"); } catch (e) {}
  }
  if (EMBED) {
    if (window.ResizeObserver) new ResizeObserver(function () { avisarAlto(); }).observe(document.body);
    window.addEventListener("load", avisarAlto);
    setTimeout(avisarAlto, 600);
  }

  if (S.pend && !COLA.some(function (x) { return x.k === ID; })) S.pend = false;
  if (!NOMBRE) { $("campoNombre").hidden = false; try { $("tuNombre").value = localStorage.getItem(NOMBRE_KEY) || ""; } catch (e) {} }
  window.__ejercicio = { texto: texto, bloques: bloques };
  pintar();
})();
