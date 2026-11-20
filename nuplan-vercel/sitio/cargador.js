/* ═══════════════════════════════════════════════════════════════
   Cargador de las páginas de NuPlan en GHL (metodo.nuplan.com.ar).

   En GHL, cada página tiene una sola línea (ghl-linea.html) que trae
   este archivo. Este archivo trae la página desde sitio/src/<archivo>.html
   y la monta dentro de la página de GHL, al lado de lo que GHL hace por
   detrás: estadísticas del embudo, atribución, formularios, calendarios.

   La ruta de GHL decide el archivo: /vsl → sitio/src/nuplan-vsl.html.
   Fuente principal: el deploy de Vercel, que ya sirve /sitio/src/* con
   CORS abierto y sin caché (vercel.json). Respaldo: GitHub.

   Las páginas salen de sitio/build_sitio.py. Para cambiar una página se
   edita el build y se publica: la página en GHL no se toca nunca más.
   Vista previa de una rama: ?rama=<nombre>.
   ═══════════════════════════════════════════════════════════════ */
(function (d, w) {
  if (w.__nuplanCargador) return;
  w.__nuplanCargador = 1;

  var REPO = 'learners417/rosana-nuplan';
  var BASE = 'nuplan-vercel/sitio/src/';
  /* La ruta de GHL → el archivo que arma build_sitio.py. Una ruta que no está acá se deja como viene:
     los encabezados de las páginas de pago son un pedazo, no una página entera, y no pasan por acá. */
  var MAPA = {
    'vsl': 'nuplan-vsl.html',
    'preparacion': 'nuplan-preparacion.html',
    'masterclass': 'nuplan-clase.html',
    'inicio': 'nuplan-inicio.html',
    'empresas': 'nuplan-empresas.html',
    'legales': 'nuplan-legales.html',
    'bienvenida': 'nuplan-bienvenida.html',
    'programa-segundo-gracias': 'nuplan-programa-segundo-gracias.html',
    /* El embudo del libro: sale de libro/fuente/build_web.py a libro/src/ (Vercel lo sirve igual, con CORS). */
    'libro': '../../libro/src/nuplan-libro-landing.html',
    'libro-agenda': '../../libro/src/nuplan-libro-agenda.html',
    'libro-gracias': '../../libro/src/nuplan-libro-gracias.html'
  };
  var rama = 'main';
  try { var pedida = new URLSearchParams(location.search).get('rama'); if (pedida && /^[a-z0-9-]{2,30}$/.test(pedida)) rama = pedida; } catch (e) {}
  var ruta = location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  var pagina = w.NUPLAN_PAGINA || ruta;
  var archivo = MAPA[pagina];
  if (!archivo) return;                      /* ruta sin página propia: GHL sigue como siempre */
  var FUENTES = (rama === 'main'
    ? ['https://rosana-nuplan.vercel.app/sitio/src/' + archivo,
       'https://raw.githubusercontent.com/' + REPO + '/main/' + BASE + archivo]
    : ['https://raw.githubusercontent.com/' + REPO + '/' + rama + '/' + BASE + archivo]);
  var carga = w.__nuplanCarga = { pagina: pagina, rama: rama, inicio: Math.round(performance.now()) };

  /* La tapa: oculta lo visible de GHL mientras llega la página. */
  var tapa = d.getElementById('nuplan-tapa');
  if (!tapa) {
    tapa = d.createElement('style');
    tapa.id = 'nuplan-tapa';
    tapa.textContent = '#__nuxt,#teleports{display:none!important}html{background:#fff6f3}';
    d.head.appendChild(tapa);
  }

  /* Las conexiones que la página usa al montarse se abren ya. */
  if (rama === 'main') {
    ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'].forEach(function (u) {
      try { var l = d.createElement('link'); l.rel = 'preconnect'; l.href = u; if (u.indexOf('gstatic') > 0) l.crossOrigin = ''; d.head.appendChild(l); } catch (e) {}
    });
  }

  function traer(url, ms) {
    return new Promise(function (ok, no) {
      var reloj = setTimeout(function () { no('tiempo'); }, ms);
      fetch(url, { cache: 'no-cache' })
        .then(function (r) { if (!r.ok) throw r.status; return r.text(); })
        .then(function (t) { clearTimeout(reloj); ok(t); },
              function (e) { clearTimeout(reloj); no(e); });
    });
  }
  /* Si Vercel no contesta en 1,5 segundos, se pide también a GitHub y gana la primera que llega. */
  function primera() {
    return new Promise(function (ok, no) {
      var gano = false, fallas = 0, pedidas = 0, reserva = null;
      function pide(i) {
        if (i >= FUENTES.length || i < pedidas) return;
        pedidas = i + 1;
        traer(FUENTES[i], 12000).then(function (t) {
          if (gano) return;
          gano = true; clearTimeout(reserva); carga.fuente = FUENTES[i]; ok(t);
        }, function () {
          fallas++;
          if (gano) return;
          if (pedidas < FUENTES.length) { clearTimeout(reserva); pide(pedidas); }
          else if (fallas >= FUENTES.length) no('sin fuente');
        });
      }
      pide(0);
      reserva = setTimeout(function () { if (!gano) pide(1); }, 1500);
    });
  }

  /* Los estilos de GHL quedan apagados: la página trae los suyos. */
  function esDeGHL(n) {
    if (n.nodeType !== 1 || n.hasAttribute('data-nuplan') || n.id === 'nuplan-tapa') return false;
    if (n.tagName === 'LINK') return /stylesheet/.test(n.rel) && /leadconnectorhq\.com\/_preview\//.test(n.href);
    if (n.tagName === 'STYLE') return /hl_page-preview|c-section|--headlinefont|bg-fixed/.test(n.textContent);
    return false;
  }
  function apagar(n) { if (n.media !== 'not all') n.media = 'not all'; }
  function apagarGHL() {
    var l = d.querySelectorAll('head style, head link[rel~="stylesheet"], #__nuxt style, #teleports style');
    for (var i = 0; i < l.length; i++) {
      var n = l[i];
      if (n.hasAttribute('data-nuplan') || n.id === 'nuplan-tapa') continue;
      if (n.closest('#__nuxt, #teleports') || n.parentNode === d.head) apagar(n);
    }
    try {
      new MutationObserver(function (cambios) {
        cambios.forEach(function (c) { [].forEach.call(c.addedNodes, function (n) { if (esDeGHL(n)) apagar(n); }); });
      }).observe(d.head, { childList: true });
    } catch (e) {}
  }

  function copiarAtributos(de, a) {
    for (var i = 0; i < de.attributes.length; i++) a.setAttribute(de.attributes[i].name, de.attributes[i].value);
  }

  /* Un script nuevo con lo mismo: los que vienen del texto no corren solos. */
  function correr(viejo, sigue) {
    var s = d.createElement('script');
    for (var i = 0; i < viejo.attributes.length; i++) {
      var nombre = viejo.attributes[i].name;
      if (nombre !== 'type' && nombre !== 'data-tipo') s.setAttribute(nombre, viejo.attributes[i].value);
    }
    var tipo = viejo.getAttribute('data-tipo');
    if (tipo) s.type = tipo;
    if (viejo.getAttribute('src')) {
      /* 18 nov: un script con async (o de tipo module) no frena a los demás, como en cualquier página.
         Antes la página esperaba a que cargara el reproductor de Wistia: en el celular, /preparacion-h quedó
         casi un minuto en blanco (lo que aparece al bajar no se muestra hasta que corre su script). */
      if (viejo.hasAttribute('async') || tipo === 'module') {
        viejo.parentNode.replaceChild(s, viejo);
        sigue();
        return;
      }
      /* Los demás esperan, pero nunca más de 4 segundos. */
      var hecho = false, seguir = function () { if (!hecho) { hecho = true; sigue(); } };
      s.async = false;
      s.onload = s.onerror = seguir;
      setTimeout(seguir, 4000);
      viejo.parentNode.replaceChild(s, viejo);
    } else {
      s.text = viejo.text;
      viejo.parentNode.replaceChild(s, viejo);
      sigue();
    }
  }

  function montar(html) {
    var x = new DOMParser().parseFromString(html, 'text/html');
    var titulo = x.title;

    /* Los scripts esperan hasta que la página entera esté puesta. */
    var esperan = x.querySelectorAll('script');
    for (var i = 0; i < esperan.length; i++) {
      esperan[i].setAttribute('data-tipo', esperan[i].getAttribute('type') || '');
      esperan[i].setAttribute('type', 'text/nuplan-espera');
    }

    apagarGHL();
    copiarAtributos(x.documentElement, d.documentElement);
    copiarAtributos(x.body, d.body);
    if (titulo) d.title = titulo;

    [].slice.call(x.head.childNodes).forEach(function (n) {
      if (n.nodeType !== 1 || n.tagName === 'TITLE') return;
      var m = d.importNode(n, true);
      m.setAttribute('data-nuplan', '');
      d.head.appendChild(m);
    });

    var parte = d.createDocumentFragment();
    [].slice.call(x.body.childNodes).forEach(function (n) { parte.appendChild(d.importNode(n, true)); });
    var ghl = d.getElementById('__nuxt');
    d.body.insertBefore(parte, ghl && ghl.parentNode === d.body ? ghl : d.body.firstChild);

    var lista = d.querySelectorAll('script[type="text/nuplan-espera"]');
    (function siguiente(k) {
      if (k < lista.length) return correr(lista[k], function () { siguiente(k + 1); });
      listo(titulo);
    })(0);
  }

  function listo(titulo) {
    carga.listo = Math.round(performance.now());
    d.documentElement.setAttribute('data-nuplan-pagina', pagina);
    if (location.hash) {
      try { var meta = d.getElementById(decodeURIComponent(location.hash.slice(1))); if (meta) meta.scrollIntoView(); } catch (e) {}
    }
    /* GHL puede reescribir el título al terminar de cargar: vuelve el de la página. */
    if (titulo) {
      var poner = function () { if (d.title !== titulo) d.title = titulo; };
      try { new MutationObserver(poner).observe(d.head, { childList: true, subtree: true, characterData: true }); } catch (e) {}
      w.addEventListener('load', poner);
    }
  }

  function aviso() {
    carga.error = 1;
    tapa.textContent += 'body:before{content:"La página se está actualizando. Volvé a abrirla en un momento.";display:block;font:20px/1.6 "DM Sans",system-ui,sans-serif;color:#1a1a1a;text-align:center;margin:30vh 24px 0}';
  }

  primera().then(montar).catch(aviso);
})(document, window);
