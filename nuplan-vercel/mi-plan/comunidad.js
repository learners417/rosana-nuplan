/* NuPlan · «Hablalo en la comunidad».
   Un botón en «Hoy» que abre el canal de la etapa en el grupo «Programa NuPlan · 90 días»
   (El Consultorio), y en la pestaña Rosana, el canal de los lives. En los días de check-in
   el botón lleva a «Logros». Los links salen de la pestaña «Comunidades» del plan de Ro.
   Va aparte del index para no tocar la app: envuelve pintarHoy y pintarRosana. */
(function(){
  var G = "https://s44qfsrypntorlrdgjbo.app.clientclub.net/communities/groups/rosana-roldan-programa";
  var CANAL = {
    inicio: G + "/home",
    P: G + "/channels/P-%C2%B7-Personalizar-4jPrCv",
    L: G + "/channels/L-%C2%B7-Liberar-3jQi0d",
    A: G + "/channels/A-%C2%B7-Activar-6qDB8E",
    N: G + "/channels/N-%C2%B7-Naturalizar-8aEz4j",
    lives: G + "/channels/Lives-8wAZWg",
    logros: G + "/channels/Logros-7oRmgS"
  };
  var CHECKIN = [14, 28, 42, 56, 70, 84];

  function canalDelDia(d){
    if(CHECKIN.indexOf(d) >= 0) return { url: CANAL.logros, txt: "Contá tu logro en la comunidad" };
    if(d <= 28) return { url: CANAL.inicio, txt: "Hablalo en la comunidad" };
    if(d <= 42) return { url: CANAL.P, txt: "Hablalo en la comunidad &middot; canal P" };
    if(d <= 56) return { url: CANAL.L, txt: "Hablalo en la comunidad &middot; canal L" };
    if(d <= 70) return { url: CANAL.A, txt: "Hablalo en la comunidad &middot; canal A" };
    return { url: CANAL.N, txt: "Hablalo en la comunidad &middot; canal N" };
  }

  function boton(url, txt, clase){
    var a = document.createElement("a");
    a.href = url; a.target = "_blank"; a.rel = "noopener"; a.className = clase;
    a.innerHTML = '<span class="ic"><svg class="i" aria-hidden="true"><use href="#i-chat"/></svg></span>' + txt;
    return a;
  }

  function enHoy(){
    var cont = document.querySelector("#tHoy .bt");
    if(!cont || cont.querySelector(".np-com")) return;
    var d = typeof diaActual === "function" ? diaActual() : 1;
    var c = canalDelDia(d);
    /* va antes de «Marcar el día como hecho», que queda siempre último */
    cont.insertBefore(boton(c.url, c.txt, "np-com"), cont.lastElementChild);
  }

  function enRosana(){
    var av = document.getElementById("ckAviso");
    if(!av || !av.parentNode || av.parentNode.querySelector(".np-lives")) return;
    var w = document.createElement("div");
    w.className = "bt np-lives"; w.style.marginTop = "14px";
    w.appendChild(boton(CANAL.lives, "Los lives de Rosana, en la comunidad", "np-com"));
    av.parentNode.insertBefore(w, av.nextSibling);
  }

  function envolver(nombre, extra){
    var f = window[nombre];
    if(typeof f !== "function" || f.__np) return;
    var g = function(){ var r = f.apply(this, arguments); try { extra() } catch(e){} return r };
    g.__np = true;
    window[nombre] = g;
  }

  envolver("pintarHoy", enHoy);
  envolver("pintarRosana", enRosana);
  try { enHoy() } catch(e){}
})();
