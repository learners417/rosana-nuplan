/* Ejercicios de Rosana dentro de las landings del método (GHL). Una sola línea en un bloque de código:
     <script src="https://rosana-nuplan.vercel.app/ejercicios/embed.js" data-ejercicios="barca,equilibrio"></script>
   Pone cada ejercicio justo donde está la línea, en un marco que crece con su contenido. Lo que la persona escribe
   queda en su teléfono y se lo manda a Rosana desde el mismo ejercicio. Si la página tiene ?nombre=, lo pasa. */
(function () {
  "use strict";
  var RUTAS = { barca: "/barca/", equilibrio: "/zona-de-equilibrio/", glotona: "/parte-glotona/" };
  var TITULOS = { barca: "La barca de las acciones", equilibrio: "Zona de equilibrio", glotona: "Reconciliate con tu parte glotona" };
  var marcos = [];

  function origenDe(s) {
    var o = s.getAttribute("data-origen");
    if (o) return o.replace(/\/+$/, "");
    try { return new URL(s.src).origin; } catch (e) { return "https://rosana-nuplan.vercel.app"; }
  }
  function montar(s) {
    if (!s || s.getAttribute("data-np-montado")) return;
    s.setAttribute("data-np-montado", "1");
    var origen = origenDe(s);
    var lista = String(s.getAttribute("data-ejercicios") || "").split(",").map(function (x) { return x.trim(); }).filter(function (x) { return RUTAS[x]; });
    var nombre = "";
    try { nombre = (new URLSearchParams(location.search).get("nombre") || "").trim().slice(0, 60); } catch (e) {}
    var cont = document.createElement("div");
    cont.className = "np-ejercicios";
    cont.style.cssText = "display:flex;flex-direction:column;gap:28px;width:100%;max-width:760px;margin:0 auto;";
    lista.forEach(function (id) {
      var f = document.createElement("iframe");
      f.src = origen + RUTAS[id] + "?embed=1" + (nombre ? "&nombre=" + encodeURIComponent(nombre) : "");
      f.title = TITULOS[id];
      f.loading = "lazy";
      f.setAttribute("data-np-ej", id);
      f.style.cssText = "display:block;width:100%;height:760px;border:0;border-radius:20px;background:#fff6f3;overflow:hidden;";
      f.setAttribute("scrolling", "no");
      cont.appendChild(f);
      marcos.push({ f: f, origen: origen });
    });
    s.parentNode.insertBefore(cont, s.nextSibling);
  }
  window.addEventListener("message", function (e) {
    var d = e.data;
    if (!d || typeof d !== "object" || !d.np) return;
    marcos.forEach(function (m) {
      if (e.origin !== m.origen || e.source !== m.f.contentWindow) return;
      if (d.np === "alto" && d.h > 200 && d.h < 20000) m.f.style.height = Math.ceil(d.h) + "px";
      if (d.np === "arriba") {
        var r = m.f.getBoundingClientRect();
        if (r.top < 0 || r.top > window.innerHeight * 0.6) m.f.scrollIntoView({ block: "start", behavior: "smooth" });
      }
    });
  });
  if (document.currentScript) montar(document.currentScript);
  // por si el constructor de la página corre las líneas de otra forma
  var todos = document.querySelectorAll('script[src*="/ejercicios/embed.js"]');
  for (var i = 0; i < todos.length; i++) montar(todos[i]);
})();
