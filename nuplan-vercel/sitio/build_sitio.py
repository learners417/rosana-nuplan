# -*- coding: utf-8 -*-
# NuPlan · el sitio completo para El Consultorio (GHL): inicio, empresas, la clase, legales,
# pago del programa, bienvenida y segundo pago. Misma identidad que la app y que el libro.
# Copy público en tuteo neutro. Rosana habla en primera persona.
# Sale a nuplan-vercel/sitio/src/*.html; en GHL cada página va como un elemento de código.
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_web as W
from build_web import E, P, ic, FONTS, GHL_CSS, CSS, JS

OUT = os.environ.get("OUT_DIR", "/home/claude/rosana-nuplan/nuplan-vercel/sitio/src")

# ---------- direcciones ----------
M = "https://metodo.nuplan.com.ar"
U = {
    "inicio": f"{M}/inicio",
    "vsl": f"{M}/vsl",
    "agenda": f"{M}/vsl#agenda",
    "clase": f"{M}/masterclass",
    "test": f"{M}/test-cansancio",
    "auditoria": f"{M}/auditoria-express",
    "calculadora": f"{M}/calculadora-energia",
    "libro": f"{M}/libro",
    "empresas": f"{M}/empresas",
    "legales": f"{M}/legales",
    "arrep": f"{M}/legales#arrepentimiento",
    "baja": f"{M}/legales#baja",
    "cap1": "https://rosana-nuplan.vercel.app/libro/capitulo-1-recupera-tu-energia.pdf",
    "app": "https://rosana-nuplan.vercel.app/mi-plan/",
    "mesa": "https://s44qfsrypntorlrdgjbo.app.clientclub.net/communities/groups/rosana-roldan-mesa/home",
    "wa": "https://wa.me/5491151426830",
    "ig": "https://www.instagram.com/lic.rosanaroldan/",
}
API_AVISO = "https://rosana-nuplan.vercel.app/api/aviso"
YT = "IZ31CxyafrY"   # la clase de Rosana en YouTube (10:42)
CAL_APERTURA = os.environ.get("CAL_APERTURA", "")   # calendario «Apertura del programa» (si está, va embebido)

# ---------- íconos que suma el sitio ----------
P.update({
 "app": '<rect x="6.5" y="2.8" width="11" height="18.4" rx="2.6"/><path d="M10.5 18h3"/>',
 "empresa": '<path d="M4 20V6.5L12 3l8 3.5V20"/><path d="M9 20v-4.5h6V20M8.5 9h1M14.5 9h1M8.5 12.5h1M14.5 12.5h1"/>',
 "play": '<circle cx="12" cy="12" r="9"/><path d="M10 8.6l5.4 3.4-5.4 3.4z"/>',
 "grupo": '<circle cx="8" cy="9" r="2.6"/><circle cx="16" cy="9" r="2.6"/><path d="M3.5 18.5c.5-2.8 2.3-4.3 4.5-4.3s4 1.5 4.5 4.3M11.5 18.5c.5-2.8 2.3-4.3 4.5-4.3s4 1.5 4.5 4.3"/>',
 "informe": '<path d="M5 20V10M10 20V5M15 20v-7M20 20V8"/>',
 "wa": '<path d="M4.5 19.5l1.2-3.6A7.8 7.8 0 1 1 8.6 19z"/><path d="M9.3 8.6c.3 2.6 2.2 4.6 4.9 5.2l1.3-1.3 1.8.8-.4 1.6c-3.8.4-7.6-3.3-7.4-7.2l1.6-.4.8 1.8z"/>',
 "escudo": '<path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.2-7.5 9.5-4.3-1.3-7.5-4.9-7.5-9.5V6z"/><path d="M8.8 12.2l2.2 2.2 4.2-4.6"/>',
 "reloj": '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.4 2"/>',
 "mail": '<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="M4.5 7l7.5 6 7.5-6"/>',
 "mesa": '<path d="M3 10h18M6 10v9M18 10v9M8 6.5c1.2-1.6 2.5-2.5 4-2.5s2.8.9 4 2.5"/>',
})

# ---------- estilos que suma el sitio (sobre los del libro) ----------
CSS_SITIO = """
#nlb .bar a{color:inherit;text-decoration:none}
#nlb .bar .bcta{font-family:"DM Sans",sans-serif;font-weight:800;font-size:16px;letter-spacing:0;background:var(--co);color:#fff;border-radius:999px;padding:11px 18px;text-decoration:none;white-space:nowrap}
#nlb .nav{display:flex;gap:8px;overflow-x:auto;padding:4px 22px 6px;max-width:1080px;margin:0 auto;scrollbar-width:none}
#nlb .nav::-webkit-scrollbar{display:none}
#nlb .nav a{flex:none;font-size:16px;font-weight:700;text-decoration:none;background:var(--sf);border:1px solid var(--bd);border-radius:999px;padding:9px 15px;color:var(--tx)}
#nlb .nav a:hover{border-color:var(--co);color:var(--cd)}
#nlb .ctas{display:grid;gap:12px;margin-top:6px}
#nlb .cta.sec2{background:var(--sf);color:var(--cd);border:2px solid var(--ac);box-shadow:none}
#nlb .cta.sec2:hover{background:var(--ti);color:var(--cd)}
/* tarjetas de vertientes */
#nlb .vgrid{display:grid;gap:14px;margin-top:30px}
#nlb .vcard{display:flex;flex-direction:column;gap:10px;background:var(--sf);border:1px solid var(--bd);border-radius:1.5rem;padding:24px 22px;text-decoration:none;color:var(--tx);transition:transform .25s,box-shadow .25s,border-color .25s}
#nlb .vcard:hover{transform:translateY(-4px);box-shadow:0 26px 50px -30px rgba(120,40,20,.55);border-color:var(--ac)}
#nlb .vcard .vi{width:52px;height:52px;border-radius:1rem;background:var(--ti);display:flex;align-items:center;justify-content:center}
#nlb .vcard .vi .ic{width:28px;height:28px;color:var(--cd)}
#nlb .vcard h3{font-size:23px}
#nlb .vcard p{margin:0;font-size:18px;color:#3d4148;line-height:1.45;flex:1}
#nlb .vcard .go{display:flex;align-items:center;gap:8px;font-weight:800;color:var(--cd);font-size:18px;margin-top:6px}
#nlb .vcard .go .ic{width:22px;height:22px}
#nlb .vcard .tag{align-self:flex-start;font-family:"Space Mono",monospace;font-size:15px;color:var(--cd);background:var(--ti);border-radius:.5rem;padding:4px 10px}
#nlb .vcard.dest{background:var(--co);border-color:var(--co);color:#fff}
#nlb .vcard.dest p,#nlb .vcard.dest .go{color:#fff}
#nlb .vcard.dest .vi{background:rgba(255,255,255,.18)}
#nlb .vcard.dest .vi .ic{color:#fff}
/* video */
#nlb .vid{position:relative;width:100%;aspect-ratio:16/9;border-radius:1.5rem;overflow:hidden;background:#2a1712;box-shadow:0 34px 70px -36px rgba(120,40,20,.6)}
#nlb .vid iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
#nlb .vnote{font-family:"Space Mono",monospace;font-size:15px;color:var(--mu);text-align:center;margin:14px 0 0}
/* capítulos */
#nlb .caps{display:grid;gap:10px;margin-top:26px}
#nlb .capi{display:flex;gap:16px;align-items:flex-start;background:var(--bg);border:1px solid transparent;border-radius:1rem;padding:16px 18px;cursor:pointer;text-align:left;width:100%;font:inherit;color:inherit;transition:border-color .2s,background .2s}
#nlb .capi:hover{border-color:var(--ac);background:#fff}
#nlb .capi .ts{flex:none;font-family:"Space Mono",monospace;font-size:16px;color:#fff;background:var(--cd);border-radius:.5rem;padding:5px 9px;margin-top:2px}
#nlb .capi b{display:block;font-size:20px;line-height:1.3}
#nlb .capi span{display:block;font-size:17px;color:#3d4148;line-height:1.4;margin-top:3px}
/* formulario */
#nlb .form{background:var(--sf);border:1px solid var(--bd);border-radius:1.5rem;padding:26px 20px;box-shadow:0 30px 60px -40px rgba(120,40,20,.5);margin-top:26px}
#nlb .campo{margin-bottom:18px}
#nlb .campo>label,#nlb .campo>.lb{display:block;font-weight:700;font-size:18px;margin-bottom:8px}
#nlb .campo .op{font-weight:400;color:var(--mu)}
#nlb input[type=text],#nlb input[type=email],#nlb input[type=tel],#nlb input[type=date],#nlb select,#nlb textarea{width:100%;font:inherit;font-size:18px;color:var(--tx);background:var(--bg);border:2px solid var(--bd);border-radius:.875rem;padding:14px 16px;min-height:56px;outline:none;transition:border-color .2s,background .2s;-webkit-appearance:none;appearance:none}
#nlb textarea{min-height:110px;resize:vertical;line-height:1.45}
#nlb select{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23c53a1e' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center;background-size:22px;padding-right:46px}
#nlb input:focus,#nlb select:focus,#nlb textarea:focus{border-color:var(--co);background:#fff}
#nlb .opts{display:flex;flex-wrap:wrap;gap:10px}
#nlb .opt{position:relative}
#nlb .opt input{position:absolute;opacity:0;pointer-events:none}
#nlb .opt span{display:inline-flex;align-items:center;min-height:48px;font-size:17px;font-weight:600;background:var(--bg);border:2px solid var(--bd);border-radius:999px;padding:9px 16px;cursor:pointer;transition:all .2s}
#nlb .opt input:checked+span{background:var(--co);border-color:var(--co);color:#fff}
#nlb .opt input:focus-visible+span{outline:3px solid var(--ac);outline-offset:2px}
#nlb .form .cta{width:100%;border:0;cursor:pointer;font-family:inherit}
#nlb .form .cta[disabled]{opacity:.6;cursor:wait}
#nlb .est{font-size:18px;margin:14px 0 0;min-height:1em}
#nlb .est.mal{color:var(--cd);font-weight:700}
#nlb .listo{display:none;text-align:center;padding:10px 0}
#nlb .listo .ic{width:64px;height:64px;color:var(--co);margin:0 auto 14px}
#nlb .listo h3{font-size:28px;margin-bottom:10px}
#nlb .listo p{font-size:19px;color:#3d4148}
#nlb .codigo{display:inline-block;font-family:"Space Mono",monospace;font-size:24px;letter-spacing:.06em;background:var(--ti);color:var(--cd);border-radius:.75rem;padding:12px 18px;margin:6px 0 16px}
#nlb .form.ok form{display:none}
#nlb .form.ok .listo{display:block}
/* listas de texto (legales) */
#nlb .legal{max-width:760px}
#nlb .legal h2{margin-top:10px}
#nlb .legal h3{font-size:23px;margin:30px 0 10px}
#nlb .legal p,#nlb .legal li{font-size:19px;color:#2e3238;line-height:1.6}
#nlb .legal ol,#nlb .legal ul{padding-left:24px;margin-bottom:18px;display:grid;gap:8px}
#nlb .aviso{background:var(--sf);border-left:5px solid var(--co);border-radius:.75rem;padding:18px 20px;margin:18px 0}
#nlb .aviso p{margin:0;font-size:18px}
#nlb .boton2{display:grid;gap:14px;margin:26px 0}
/* pie */
#nlb .pie{background:var(--sf);border-top:1px solid var(--bd);padding:44px 0 34px}
#nlb .pie .pg{display:grid;gap:26px}
#nlb .pie b{display:block;font-size:20px;margin-bottom:10px}
#nlb .pie a{display:block;text-decoration:none;font-size:18px;color:#2e3238;padding:5px 0}
#nlb .pie a:hover{color:var(--cd)}
#nlb .pie .leg{display:flex;flex-wrap:wrap;gap:10px 18px;margin-top:30px;padding-top:22px;border-top:1px solid var(--bd)}
#nlb .pie .leg a{display:inline-flex;align-items:center;gap:8px;font-weight:700;color:var(--cd);font-size:17px;padding:0}
#nlb .pie .leg a .ic{width:20px;height:20px}
#nlb .pie .fir{font-family:"Space Mono",monospace;font-size:15px;color:var(--mu);margin-top:18px;letter-spacing:.04em}
/* bloques varios */
#nlb .split{display:grid;gap:30px;align-items:center}
#nlb .cred2{display:grid;gap:10px;margin:22px 0}
#nlb .cred2 div{display:flex;gap:12px;align-items:flex-start;font-size:18px;line-height:1.45}
#nlb .cred2 .ic{width:24px;height:24px;color:var(--co);margin-top:2px}
#nlb .big{font-size:clamp(28px,6.2vw,42px);font-weight:800;line-height:1.12;letter-spacing:-.015em;color:var(--co)}
#nlb .tick{display:flex;align-items:center;gap:10px;font-family:"Space Mono",monospace;font-size:15px;color:var(--cd);margin-top:18px}
#nlb .tick .ic{width:20px;height:20px}
#nlb .rings{max-width:430px;width:100%;margin:6px auto 0}
#nlb .rings svg{display:block;width:100%;height:auto;overflow:visible}
#nlb .rings circle.r{fill:rgba(232,71,42,.10);stroke:#e8472a;stroke-width:2;transform-box:fill-box;transform-origin:center;animation:nlbbr 6s ease-in-out infinite}
#nlb .rings circle.r2{animation-delay:-1.5s}#nlb .rings circle.r3{animation-delay:-3s}#nlb .rings circle.r4{animation-delay:-4.5s}
#nlb .rings text{font-family:"DM Sans",sans-serif;font-weight:800;font-size:25px;fill:#1a1a1a;text-anchor:middle;paint-order:stroke;stroke:#fff6f3;stroke-width:7px;stroke-linejoin:round}
#nlb .rings text.el{font-family:"Space Mono",monospace;font-weight:400;font-size:19px;fill:#c53a1e;letter-spacing:.06em;stroke-width:6px}
@keyframes nlbbr{0%,100%{transform:scale(1)}50%{transform:scale(1.045)}}
@media (prefers-reduced-motion:reduce){#nlb .rings circle.r{animation:none}}
@media (min-width:760px){
 #nlb .vgrid{grid-template-columns:1fr 1fr 1fr}
 #nlb .vgrid.dos{grid-template-columns:1fr 1fr}
 #nlb .ctas{grid-template-columns:auto auto;justify-content:start}
 #nlb .hgrid .ctas{grid-template-columns:auto;justify-items:start}
 #nlb .hgrid{grid-template-columns:1.25fr .75fr}
 #nlb .caps{grid-template-columns:1fr 1fr}
 #nlb .form{padding:36px 34px}
 #nlb .dosc{display:grid;grid-template-columns:1fr 1fr;gap:0 18px}
 #nlb .split{grid-template-columns:1fr 1fr;gap:56px}
 #nlb .pie .pg{grid-template-columns:1.4fr 1fr 1fr 1fr}
 #nlb .boton2{grid-template-columns:1fr 1fr}
}
"""

# ---------- envío de formularios: van a la app (api/aviso) y de ahí al mail de Rosana ----------
JS_FORM = """<script>(function(){
var API=%s;
function rid(){var a=new Uint8Array(10);(window.crypto||window.msCrypto).getRandomValues(a);return Array.prototype.map.call(a,function(b){return('0'+b.toString(16)).slice(-2)}).join('')}
function cod(p){var c='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',a=new Uint8Array(6),s='';(window.crypto||window.msCrypto).getRandomValues(a);for(var i=0;i<6;i++)s+=c[a[i]%%c.length];return p+'-'+s}
function e(x){return String(x==null?'':x).replace(/[&<>"]/g,function(m){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]})}
function hoy(){var d=new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)}
document.querySelectorAll('#nlb form[data-tipo]').forEach(function(f){
 f.addEventListener('submit',function(ev){ev.preventDefault();
  var box=f.closest('.form'),est=f.querySelector('.est'),btn=f.querySelector('button[type=submit]');
  if(!f.checkValidity()){f.reportValidity();return}
  var tipo=f.getAttribute('data-tipo'),filas=[],extra={};
  f.querySelectorAll('[data-l]').forEach(function(el){var v;
   if(el.classList.contains('opts')){v=Array.prototype.map.call(el.querySelectorAll('input:checked'),function(i){return i.value}).join(', ')}
   else v=(el.value||'').trim();
   if(v){filas.push([el.getAttribute('data-l'),v]);extra[el.name||el.getAttribute('data-n')]=v.slice(0,500)}});
  var nombre=(f.querySelector('[name=nombre]')||{}).value||'',email=(f.querySelector('[name=email]')||{}).value||'';
  var codigo=f.getAttribute('data-cod')?cod(f.getAttribute('data-cod')):'';
  var paso=f.getAttribute('data-paso')+(codigo?' · '+codigo:'');
  var html='<div style="font-family:Arial,sans-serif;color:#1a1a1a"><p style="font-size:13px;letter-spacing:.08em;color:#c53a1e;margin:0 0 8px">NUPLAN · SITIO</p><h2 style="margin:0 0 16px;font-size:22px">'+e(paso)+'</h2><table style="border-collapse:collapse;width:100%%">'+
   filas.map(function(r){return'<tr><td style="padding:8px 10px;border-bottom:1px solid #f0e2dd;color:#6b7280;width:38%%;vertical-align:top">'+e(r[0])+'</td><td style="padding:8px 10px;border-bottom:1px solid #f0e2dd;font-weight:600">'+e(r[1]).replace(/\\n/g,'<br>')+'</td></tr>'}).join('')+
   '</table><p style="margin-top:16px;color:#6b7280;font-size:13px">Llegó desde '+e(location.href.split('#')[0])+'</p></div>';
  var texto=paso+'\\n\\n'+filas.map(function(r){return r[0]+': '+r[1]}).join('\\n');
  var body=Object.assign({},extra,{id:'web-'+rid(),paso:paso,asunto:paso+' · '+nombre,nombre:nombre,email:email,fecha:hoy(),mensaje:texto,mensaje_html:html,paso_slug:tipo,codigo:codigo});
  btn.disabled=true;est.className='est';est.textContent='Enviando…';
  fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
   .then(function(r){return r.json().catch(function(){return{}}).then(function(j){return{ok:r.ok&&j&&j.ok===true}})})
   .then(function(x){if(!x.ok)throw 0;var c=box.querySelector('.codigo');if(c)c.textContent=codigo;box.classList.add('ok');box.scrollIntoView({behavior:'smooth',block:'center'})})
   .catch(function(){btn.disabled=false;est.className='est mal';est.innerHTML='No se pudo enviar. Escríbeme por WhatsApp: <a href="%s" target="_blank" rel="noopener">11 5142-6830</a>'});
 });});
})();</script>""" % (json.dumps(API_AVISO), U["wa"])


def page(title, inner, extra_js=""):
    return (f'<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            f'<title>{E(title)}</title>{FONTS}<style>html,body{{margin:0;background:#fff6f3}}{GHL_CSS}{CSS}{CSS_SITIO}</style></head>'
            f'<body><div id="nlb">{inner}</div>{JS}{extra_js}</body></html>')


def bar(cta=True):
    b = f'<a class="bcta" href="{U["agenda"]}" target="_top">Agendar</a>' if cta else '<span>M.N. 3884</span>'
    return f'<div class="bar"><a href="{U["inicio"]}" target="_top"><b>Nu<span>Plan</span>™</b></a>{b}</div>'


def btn(texto, href, cls="cta", icono="flecha"):
    return f'<a class="{cls}" href="{href}" target="_top">{E(texto)}{ic(icono)}</a>'


def lab(texto, icono=None):
    return f'<p class="lab">{ic(icono) if icono else ""}{E(texto)}</p>'


def pie():
    return f'''<footer class="pie"><div class="wrap">
<div class="pg">
 <div><b>Nu<span style="color:var(--co)">Plan</span>™</b>
  <p class="mu" style="font-size:18px;margin:0">Nutrición en 4 dimensiones. Lic. Rosana Roldán, nutricionista (UBA), M.N. 3884. Buenos Aires.</p>
  <p style="font-size:18px;margin:16px 0 0"><b style="display:inline;font-size:18px">Atención:</b> WhatsApp <a style="display:inline" href="{U["wa"]}" target="_blank" rel="noopener">11 5142-6830</a>, de lunes a viernes de 9 a 17 h.</p></div>
 <div><b>Para ti</b><a href="{U["vsl"]}" target="_top">El programa</a><a href="{U["libro"]}" target="_top">El libro</a><a href="{U["clase"]}" target="_top">La clase de 11 minutos</a><a href="{U["mesa"]}" target="_blank" rel="noopener">La Mesa · comunidad</a></div>
 <div><b>Empresas</b><a href="{U["empresas"]}" target="_top">NuPlan para empresas</a><a href="{U["empresas"]}#contacto" target="_top">Hablemos</a></div>
 <div><b>Consultantes</b><a href="{U["app"]}" target="_blank" rel="noopener">Entrar a mi app</a><a href="{U["ig"]}" target="_blank" rel="noopener">Instagram</a></div>
</div>
<div class="leg">
 <a href="{U["arrep"]}" target="_top">{ic("escudo")}Botón de arrepentimiento</a>
 <a href="{U["baja"]}" target="_top">{ic("escudo")}Botón de baja de servicio</a>
 <a href="{U["legales"]}" target="_top">Términos y privacidad</a>
</div>
<p class="fir">NUPLAN™ · LIC. ROSANA ROLDÁN · M.N. 3884</p>
</div></footer>'''


# ---------- los datos del método (los mismos del libro) ----------
DIMS = W.DIMS
CAMINO = W.CAMINO


# =============================== 1 · INICIO ===============================
RINGS = ('<div class="rings rv"><svg viewBox="0 0 420 420" role="img" aria-label="Las cuatro dimensiones de NuPlan: física, emocional, energética y mental">'
         '<circle class="r r1" cx="210" cy="140" r="98"/><circle class="r r2" cx="280" cy="210" r="98"/>'
         '<circle class="r r3" cx="210" cy="280" r="98"/><circle class="r r4" cx="140" cy="210" r="98"/>'
         '<circle cx="210" cy="210" r="10" fill="#c53a1e"/>'
         '<text x="210" y="84">Física</text><text class="el" x="210" y="110">TIERRA</text>'
         '<text x="338" y="206">Emocional</text><text class="el" x="338" y="232">AGUA</text>'
         '<text x="210" y="334">Energética</text><text class="el" x="210" y="360">FUEGO</text>'
         '<text x="82" y="206">Mental</text><text class="el" x="82" y="232">AIRE</text></svg></div>')


def inicio():
    v = [
        ("sesion", "El programa NuPlan · 90 días", "Te acompaño una a una, con mi equipo, mi app y un plan hecho para tu semana real.", "Ver el video y agendar", U["vsl"], "dest", ""),
        ("libro", "El libro", "Recupera tu energía en 90 días: una invitación por día para hacerlo a tu ritmo.", "Ver el libro", U["libro"], "", "USD 27"),
        ("empresa", "Para empresas", "Programas de nutrición para equipos: consultas en la oficina, jornadas de salud e informes.", "Llevarlo a tu empresa", U["empresas"], "", ""),
        ("play", "La clase de 11 minutos", "Por qué comes por estrés, explicado con biología y objetos sobre la mesa.", "Ver la clase", U["clase"], "", "Sin costo"),
        ("app", "La app NuPlan", "Donde vive el programa: un ejercicio por día, tu diario y tu plan, en tu teléfono.", "Cómo funciona", "#app", "", ""),
        ("mesa", "La Mesa", "Mi comunidad abierta: herramientas, videos, el libro y preguntas.", "Sumarte a La Mesa", U["mesa"], "", "Comunidad"),
    ]
    def card(x):
        icono, t, d, go, href, cls, tag = x
        tgt = '_blank" rel="noopener' if href.startswith("https://s44") else "_top"
        tg = f'<span class="tag">{E(tag)}</span>' if tag else ""
        return (f'<a class="vcard rv {cls}" href="{href}" target="{tgt}"><span class="vi">{ic(icono)}</span>{tg}'
                f'<h3>{E(t)}</h3><p>{E(d)}</p><span class="go">{E(go)}{ic("flecha")}</span></a>')
    dims = "".join(f'<div class="dim rv">{ic(i)}<h3>{E(n)}</h3><p class="el">{E(el)}</p><p>{E(d)}</p></div>' for i, n, el, d in DIMS)
    camino = "".join(f'<div class="st rv"><span class="lt">{E(l)}</span><div><h3>{E(n)}</h3><span class="dd">{E(dd)}</span><p>{E(d)}</p></div></div>' for l, n, dd, d in CAMINO)
    app_items = [
        ("semana", "Hoy", "El ejercicio del día, de 5 a 10 minutos, y lo que acordaste conmigo."),
        ("pin", "Camino", "Los 90 días en un mapa. Se abre uno por día."),
        ("lapiz", "Diario", "Una carga por día: qué comiste y qué te llevó a comerlo."),
        ("sesion", "Rosana", "Tus check-in y tus mensajes conmigo. Te contesto yo."),
    ]
    app = "".join(f'<div class="fi rv">{ic(i)}<div><h3>{E(t)}</h3><p>{E(d)}</p></div></div>' for i, t, d in app_items)
    recursos = [
        ("termo", "Test de cansancio", "¿Tu cansancio es normal o es una señal? Cinco preguntas, menos de un minuto.", "Hacer el test", U["test"]),
        ("lapiz", "Auditoría express", "Escribes lo que comiste ayer y te devuelvo los tres patrones más claros.", "Hacer la auditoría", U["auditoria"]),
        ("chispa", "Calculadora de energía", "Ocho preguntas y tu energía real: la tuya, no la del café.", "Calcular mi energía", U["calculadora"]),
        ("libro", "Capítulo 1 del libro", "Léelo completo, sin costo, y mira si este camino es para ti.", "Leer el capítulo 1", U["cap1"]),
    ]
    rec = "".join(f'<a class="vcard rv" href="{h}" target="{"_blank" if h.endswith(".pdf") else "_top"}"><span class="vi">{ic(i)}</span><h3>{E(t)}</h3><p>{E(d)}</p><span class="go">{E(g)}{ic("flecha")}</span></a>' for i, t, d, g, h in recursos)
    inner = f'''{bar()}
<nav class="nav" aria-label="Secciones"><a href="#empezar">Por dónde empezar</a><a href="#metodo">El método</a><a href="#app">La app</a><a href="#rosana">Quién soy</a><a href="#recursos">Recursos</a><a href="{U["empresas"]}" target="_top">Empresas</a></nav>
<section class="hero"><div class="wrap hgrid"><div>
 <span class="eyb">NUTRICIÓN EN 4 DIMENSIONES</span>
 <h1>Recupera tu energía y tus <em>ganas de vivir.</em></h1>
 <p class="lead">Soy Rosana Roldán, nutricionista. Hace más de 20 años acompaño a mujeres que viven aceleradas a comer en paz y llegar con energía al final del día.</p>
 <div class="ctas">{btn("Ver cómo funciona el programa", U["vsl"])}{btn("Empezar por la clase de 11 minutos", U["clase"], "cta sec2", "play")}</div>
 <div class="chips"><span class="chip">{ic("check")}+20 años de clínica</span><span class="chip">{ic("check")}UBA · M.N. 3884</span><span class="chip">{ic("check")}Empresas desde 2005</span></div>
</div>{RINGS}</div></section>
<section class="sec white" id="empezar"><div class="wrap">
 {lab("Por dónde empezar", "flecha")}
 <h2>Elige tu camino.</h2>
 <p class="lead">Todo NuPlan en un solo lugar: para ti, para tu empresa y para tu biblioteca.</p>
 <div class="vgrid">{"".join(card(x) for x in v)}</div>
</div></section>
<section class="sec" id="metodo"><div class="wrap">
 {lab("El método", "chispa")}
 <h2>Nutrición en 4 dimensiones.</h2>
 <p class="lead">Lo que comes es una parte. La otra es cómo llegas a la comida: con qué emoción, con qué energía y con qué ideas en la cabeza. NuPlan trabaja las cuatro a la vez.</p>
 <div class="dims">{dims}</div>
 <h3 style="margin:56px 0 6px;font-size:26px">Seis pasos, noventa días</h3>
 <p class="mu" style="font-size:18px">Uno detrás del otro, a tu ritmo y con acompañamiento.</p>
 <div class="path">{camino}</div>
</div></section>
<section class="sec white" id="app"><div class="wrap split">
 <div>
  {lab("La app NuPlan", "app")}
  <h2>Tu programa vive en tu teléfono.</h2>
  <p class="lead">Entras con tu mail, sin contraseña. Se abre un día por vez y todo lo que cargas me llega a mí.</p>
  <div class="cred2"><div>{ic("empresa")}<span>En las empresas, cada consulta queda cargada y el informe para Recursos Humanos se arma solo.</span></div></div>
  {btn("Ya soy consultante · entrar a mi app", U["app"], "cta sec2", "app").replace('target="_top"', 'target="_blank" rel="noopener"')}
 </div>
 <div class="feat" style="grid-template-columns:1fr">{app}</div>
</div></section>
<section class="sec" id="rosana"><div class="wrap split">
 <div>
  {lab("Quién soy", "sesion")}
  <h2>Rosana Roldán</h2>
  <p>Licenciada en Nutrición (UBA), M.N. 3884. Posgrado en Nutrición Clínica en la Universidad Favaloro, posgrado en abordaje grupal de enfermedades crónicas y pasantía en el Hospital Durand en trastornos de la conducta alimentaria. Formación en ayurveda y mindfulness nutricional.</p>
  <p>Más de 20 años de consultorio y programas de nutrición en empresas desde 2005. Y algo más: pasé por el mismo agotamiento del que hablo.</p>
  <p class="big">«Mi propio cuerpo fue mi primer laboratorio.»</p>
 </div>
 <div><div class="vid rv"><iframe src="https://www.youtube.com/embed/{YT}?rel=0&amp;modestbranding=1&amp;playsinline=1" title="La clase de Rosana Roldán" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>
 <p class="vnote">LA CLASE · 11 MINUTOS</p></div>
</div></section>
<section class="sec white" id="recursos"><div class="wrap">
 {lab("Recursos", "chispa")}
 <h2>Empieza hoy, sin costo.</h2>
 <p class="lead">Herramientas cortas para mirar cómo comes y cómo llegas a la noche.</p>
 <div class="vgrid dos" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">{rec}</div>
</div></section>
<section class="sec coral final"><div class="wrap narrow">
 <h2>¿Hablamos 30 minutos?</h2>
 <p class="lead">Me cuentas tu caso y te digo con honestidad si el programa tiene sentido para ti.</p>
 {btn("Agendar mi llamada", U["agenda"], "cta inv")}
 <p class="micro">SIN COSTO · POR VIDEOLLAMADA</p>
</div></section>
{pie()}'''
    return page("NuPlan™ · Lic. Rosana Roldán · Nutrición en 4 dimensiones", inner)


# =============================== 2 · EMPRESAS ===============================
def empresas():
    que = [
        ("sesion", "Programa en la empresa", "Consultas uno a uno en la oficina, con seguimiento: cada persona vuelve a su control y se ve qué cambió."),
        ("semana", "Jornadas y ferias de salud", "Mediciones, una consulta breve y recomendaciones impresas en el día. Cada persona carga sus datos desde un QR mientras espera."),
        ("informe", "Informe para Recursos Humanos", "Participación, energía y hábitos, por empresa y por área, comparado jornada a jornada."),
        ("app", "La app NuPlan", "Cada consulta queda cargada y firmada por quien atiende. El informe se arma solo."),
    ]
    q = "".join(f'<div class="fi rv">{ic(i)}<div><h3>{E(t)}</h3><p>{E(d)}</p></div></div>' for i, t, d in que)
    pasos = [
        ("Una reunión de 30 minutos", "Me cuentas cuántas personas son, cómo trabajan y qué quieren lograr."),
        ("Una propuesta a medida", "Formato, frecuencia y alcance, por escrito."),
        ("La primera jornada", "Mi equipo atiende en tu empresa o en línea."),
        ("El informe", "Lo que cambió, con números, para tu equipo de Recursos Humanos."),
    ]
    ps = "".join(f'<div class="step rv"><span class="sn">{n}</span><div><h3>{E(t)}</h3><p>{E(d)}</p></div></div>' for n, (t, d) in enumerate(pasos, 1))
    personas = ["Hasta 50", "De 51 a 200", "De 201 a 1.000", "Más de 1.000"]
    interes = ["Programa en la empresa", "Jornada o feria de salud", "Informe para RR. HH.", "La app NuPlan"]
    form = f'''<div class="form rv" id="contacto">
 <form data-tipo="empresas" data-paso="Empresas · consulta desde la web" novalidate>
  <div class="dosc">
   <div class="campo"><label for="e-nom">Tu nombre y apellido</label><input id="e-nom" name="nombre" type="text" data-l="Nombre" autocomplete="name" required></div>
   <div class="campo"><label for="e-emp">Empresa</label><input id="e-emp" name="empresa" type="text" data-l="Empresa" autocomplete="organization" required></div>
   <div class="campo"><label for="e-car">Tu cargo <span class="op">(opcional)</span></label><input id="e-car" name="cargo" type="text" data-l="Cargo" autocomplete="organization-title"></div>
   <div class="campo"><label for="e-per">¿Cuántas personas son?</label><select id="e-per" name="personas" data-l="Personas" required><option value="">Elige una opción</option>{"".join(f"<option>{E(x)}</option>" for x in personas)}</select></div>
   <div class="campo"><label for="e-mail">Mail</label><input id="e-mail" name="email" type="email" data-l="Mail" autocomplete="email" required></div>
   <div class="campo"><label for="e-tel">WhatsApp</label><input id="e-tel" name="telefono" type="tel" data-l="WhatsApp" autocomplete="tel" placeholder="11 5555-5555" required></div>
  </div>
  <div class="campo"><span class="lb">¿Qué les interesa? <span class="op">(puedes marcar varias)</span></span>
   <div class="opts" data-l="Le interesa" data-n="interes">{"".join(f'<label class="opt"><input type="checkbox" value="{E(x)}"><span>{E(x)}</span></label>' for x in interes)}</div></div>
  <div class="campo"><label for="e-pre">¿Con qué prepaga trabaja la empresa? <span class="op">(opcional)</span></label><input id="e-pre" name="prepaga" type="text" data-l="Prepaga"></div>
  <div class="campo"><label for="e-msj">Algo más que quieras contarme <span class="op">(opcional)</span></label><textarea id="e-msj" name="detalle" data-l="Mensaje"></textarea></div>
  <button class="cta" type="submit">Enviar{ic("flecha")}</button>
  <p class="est" aria-live="polite"></p>
 </form>
 <div class="listo" role="status">{ic("ok")}<h3>Listo, ya me llegó.</h3><p>Te escribo dentro de las 24 horas hábiles para coordinar la reunión.</p></div>
</div>'''
    inner = f'''{bar(False)}
<section class="hero"><div class="wrap">
 <span class="eyb">NUPLAN PARA EMPRESAS</span>
 <h1>Equipos con energía hasta el <em>final del día.</em></h1>
 <p class="lead">Programas de nutrición para empresas desde 2005: consultas en la oficina, jornadas de salud y un informe para Recursos Humanos que muestra qué cambió.</p>
 {btn("Hablemos de tu empresa", "#contacto").replace('target="_top"', "")}
 <div class="chips"><span class="chip">{ic("check")}Desde 2005</span><span class="chip">{ic("check")}Equipo de nutricionistas</span><span class="chip">{ic("check")}Informe por empresa</span></div>
</div></section>
<section class="sec white"><div class="wrap">
 {lab("Qué hacemos", "empresa")}
 <h2>Cuatro formas de trabajar con tu equipo.</h2>
 <div class="feat">{q}</div>
</div></section>
<section class="sec"><div class="wrap">
 {lab("Cómo trabajamos", "semana")}
 <h2>De la primera charla al primer informe.</h2>
 <div class="steps" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">{ps}</div>
</div></section>
<section class="sec white"><div class="wrap split">
 <div>
  {lab("Por qué NuPlan", "chispa")}
  <h2>Además de lo que comen, cómo llegan a la comida.</h2>
  <p class="lead">El estrés del trabajo también se come. Por eso trabajo las cuatro dimensiones: la física, la emocional, la energética y la mental.</p>
 </div>
 <div class="cred2">
  <div>{ic("check")}<span><b>Más de 20 años de clínica.</b> Licenciada en Nutrición (UBA), M.N. 3884.</span></div>
  <div>{ic("check")}<span><b>Máster en empresas saludables.</b> Programas en empresas desde 2005.</span></div>
  <div>{ic("check")}<span><b>Un equipo de nutricionistas</b> que atiende en tu empresa o en línea.</span></div>
 </div>
</div></section>
<section class="sec"><div class="wrap narrow">
 {lab("Hablemos", "mail")}
 <h2>Cuéntame de tu empresa.</h2>
 <p class="lead">Con esto preparo la reunión. Te respondo yo.</p>
 {form}
 <a class="no" href="{U["wa"]}?text={E("Hola Rosana, te escribo por un programa de nutrición para mi empresa.").replace(" ", "%20")}" target="_blank" rel="noopener">¿Prefieres WhatsApp? Escríbeme aquí</a>
</div></section>
{pie()}'''
    return page("NuPlan™ para empresas · Lic. Rosana Roldán", inner, JS_FORM)


# =============================== 3 · LA CLASE ===============================
CAPS = [
    ("0:00", 0, "Lo que te pasa no es normal (y nadie te lo dijo)", "Cuatro preguntas. Si respondes que sí a dos o más, no es la edad."),
    ("0:43", 43, "Tu intestino tiene más neuronas que tu médula", "Quinientos millones. Tu segundo cerebro, y con qué lo estás alimentando."),
    ("1:14", 74, "Qué le pasa a tu cuerpo cuando comes dos veces al día", "Metabolismo adaptativo, con la porción real sobre la mesa."),
    ("2:06", 126, "«Sacas las harinas y desbarrancas peor»", "Por qué la restricción es el camino más rápido al descontrol."),
    ("2:49", 169, "El plan que se comió el perro", "Historias de veinte años de consultorio, y la consulta de cuatro minutos."),
    ("5:07", 307, "Las 4 dimensiones que tu plan no toca", "Cortisol, serotonina y por qué a la noche comes sin hambre."),
    ("8:09", 489, "«No la metas en la cárcel, negocia»", "La pizza del sábado, y por qué comer también es disfrute."),
    ("9:33", 573, "Tres herramientas para empezar hoy", "Lo que puedes hacer esta misma noche."),
]
QUE = [
    ("Metabolismo adaptativo", "Por qué comer dos veces por día pone a tu cuerpo en modo ahorro: gasta menos y guarda más."),
    ("Eje intestino-cerebro", "El 90 % de tu serotonina se produce en el intestino. Si tu microbiota está alterada, se caen el ánimo, el sueño y la saciedad."),
    ("La trampa de sacar harinas", "Sacas las harinas, entras en hipoglucemia reactiva y después comes las de antes y las nuevas. Es bioquímica, no debilidad."),
    ("Sedentarismo oculto", "Ocho horas sentada te hacen sedentaria aunque entrenes. Cinco minutos de pausa activa cada dos horas valen más."),
    ("Cortisol crónico", "Por qué a la noche tu cerebro te pide azúcar y pan: busca alivio rápido después de un día en alerta."),
    ("Las 4 dimensiones", "La física, la emocional, la energética y la mental. Lo que probaste antes trabajaba una sola."),
]
JS_CLASE = """<script>(function(){var f=document.getElementById('yt');if(!f)return;
var base='https://www.youtube.com/embed/%s?rel=0&modestbranding=1&playsinline=1';
document.querySelectorAll('#nlb .capi').forEach(function(b){b.addEventListener('click',function(){
f.src=base+'&autoplay=1&start='+b.getAttribute('data-t');f.scrollIntoView({behavior:'smooth',block:'center'});});});})();</script>""" % YT


def clase():
    caps = "".join(f'<button class="capi rv" type="button" data-t="{t}"><span class="ts">{m}</span><span><b>{E(n)}</b><span>{E(d)}</span></span></button>' for m, t, n, d in CAPS)
    que = "".join(f'<div class="fi rv">{ic("chispa")}<div><h3>{E(t)}</h3><p>{E(d)}</p></div></div>' for t, d in QUE)
    herr = [
        ("termo", "Herramienta 1", "¿Tu cansancio es normal o es una señal?", "Cinco preguntas, menos de un minuto. Te devuelvo qué dimensión está pesando más en tu caso.", "Hacer el test", U["test"]),
        ("lapiz", "Herramienta 2", "Auditoría express de tu día", "Escribes lo que comiste ayer y te devuelvo los tres patrones más claros, leídos desde las cuatro dimensiones.", "Hacer la auditoría", U["auditoria"]),
        ("chispa", "Herramienta 3", "¿Cuánta energía real tienes?", "Ocho preguntas y tu energía vital. La tuya, no la del café, que es prestada y te la cobra a las tres de la tarde.", "Calcular mi energía", U["calculadora"]),
    ]
    h = "".join(f'<a class="vcard rv" href="{hr}" target="_top"><span class="vi">{ic(i)}</span><span class="tag">{E(k)}</span><h3>{E(t)}</h3><p>{E(d)}</p><span class="go">{E(g)}{ic("flecha")}</span></a>' for i, k, t, d, g, hr in herr)
    inner = f'''{bar()}
<section class="hero"><div class="wrap narrow">
 <span class="eyb">LA CLASE · 11 MINUTOS · SIN COSTO</span>
 <h1 style="font-size:clamp(38px,9vw,64px)">Por qué comes por estrés <em>(y lo que nadie te explicó)</em></h1>
 <p class="lead">Vives acelerada, comes lo que puedes y a la noche pierdes el control. Tiene explicación biológica: tu sistema nervioso lleva meses en alerta y encontró un regulador. La comida.</p>
 <div class="vid" id="video"><iframe id="yt" src="https://www.youtube.com/embed/{YT}?rel=0&amp;modestbranding=1&amp;playsinline=1" title="Por qué comes por estrés · Rosana Roldán" allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>
 <p class="vnote">SIN REGISTRO · DALE PLAY</p>
</div></section>
<section class="sec white"><div class="wrap">
 {lab("Qué vas a entender", "chispa")}
 <h2>Biología, con objetos sobre la mesa.</h2>
 <div class="feat">{que}</div>
</div></section>
<section class="sec"><div class="wrap">
 {lab("Los capítulos", "reloj")}
 <h2>Ve directo a lo que te interesa.</h2>
 <p class="mu" style="font-size:18px">Toca un capítulo y el video arranca ahí.</p>
 <div class="caps">{caps}</div>
</div></section>
<section class="sec white"><div class="wrap split">
 <div>
  {lab("Quién te habla", "sesion")}
  <h2>Rosana Roldán</h2>
  <p>Nutricionista recibida en la UBA, M.N. 3884. Posgrado en Nutrición Clínica en la Universidad Favaloro, segundo posgrado en abordaje grupal de enfermedades crónicas y pasantía en el Hospital Durand estudiando trastornos de la conducta alimentaria. Formación en ayurveda y mindfulness nutricional.</p>
  <p>Más de veinte años de consultorio acompañando a mujeres ejecutivas. Y algo más: pasé por el mismo agotamiento del que te hablo en el video.</p>
 </div>
 <div><p class="big">«Mi propio cuerpo fue mi primer laboratorio.»</p></div>
</div></section>
<section class="sec coral final"><div class="wrap narrow">
 {lab("El paso siguiente", "flecha")}
 <h2>Ya entiendes qué te pasa. Ahora te muestro cómo se trabaja.</h2>
 <p class="lead">El Método NuPlan son 90 días trabajando las cuatro dimensiones a la vez. Te lo explico completo en el próximo video, y ahí mismo puedes agendar una llamada de 30 minutos conmigo.</p>
 {btn("Ver cómo funciona el método", U["vsl"], "cta inv")}
 <p class="micro">13 MINUTOS · SIN COSTO</p>
</div></section>
<section class="sec"><div class="wrap">
 {lab("Las herramientas del minuto 9", "chispa")}
 <h2>Empieza hoy, sin costo.</h2>
 <div class="vgrid">{h}</div>
 <a class="no" href="{U["agenda"]}" target="_top">¿Prefieres hablar directamente? Agenda 30 minutos conmigo</a>
</div></section>
{pie()}'''
    return page("La clase · Por qué comes por estrés · NuPlan™", inner, JS_CLASE)


# =============================== 4 · LEGALES ===============================
def legales():
    compras = ["El libro digital", "Rosana te escribe cada mañana (mails)", "Sesión 1-1 con Rosana", "Programa NuPlan · 90 días"]
    servicios = ["Rosana te escribe cada mañana (mails)", "Programa NuPlan · 90 días"]
    def formulario(tipo, paso, prefijo, opciones, texto_ok, campo_fecha):
        f = f'''<div class="form" id="{tipo}-form">
 <form data-tipo="legales" data-paso="{E(paso)}" data-cod="{prefijo}" novalidate>
  <div class="dosc">
   <div class="campo"><label for="{tipo}-nom">Nombre y apellido</label><input id="{tipo}-nom" name="nombre" type="text" data-l="Nombre" autocomplete="name" required></div>
   <div class="campo"><label for="{tipo}-mail">El mail con el que compraste</label><input id="{tipo}-mail" name="email" type="email" data-l="Mail" autocomplete="email" required></div>
   <div class="campo"><label for="{tipo}-que">¿Qué compraste?</label><select id="{tipo}-que" name="producto" data-l="Producto" required><option value="">Elige una opción</option>{"".join(f"<option>{E(x)}</option>" for x in opciones)}</select></div>
   {f'<div class="campo"><label for="{tipo}-fec">Fecha de compra</label><input id="{tipo}-fec" name="fecha_compra" type="date" data-l="Fecha de compra" required></div>' if campo_fecha else '<div class="campo"><label for="'+tipo+'-tel">WhatsApp <span class="op">(opcional)</span></label><input id="'+tipo+'-tel" name="telefono" type="tel" data-l="WhatsApp" autocomplete="tel"></div>'}
  </div>
  <div class="campo"><label for="{tipo}-msj">Algo que quieras contarme <span class="op">(opcional)</span></label><textarea id="{tipo}-msj" name="detalle" data-l="Mensaje"></textarea></div>
  <button class="cta" type="submit">Enviar mi pedido{ic("flecha")}</button>
  <p class="est" aria-live="polite"></p>
 </form>
 <div class="listo" role="status">{ic("ok")}<h3>Tu pedido quedó registrado.</h3><p>Tu código de pedido:</p><span class="codigo">—</span><p>{E(texto_ok)}</p></div>
</div>'''
        return f
    inner = f'''{bar(False)}
<section class="hero" style="padding-bottom:30px"><div class="wrap legal">
 <span class="eyb">LEGALES</span>
 <h1 style="font-size:clamp(36px,8vw,58px)">Términos, privacidad y tus derechos.</h1>
 <p class="lead">Todo lo que compras en NuPlan, explicado claro.</p>
 <div class="boton2">
  <a class="cta" href="#arrepentimiento">Botón de arrepentimiento{ic("escudo")}</a>
  <a class="cta sec2" href="#baja">Botón de baja de servicio{ic("escudo")}</a>
 </div>
</div></section>
<section class="sec white" style="padding-top:60px"><div class="wrap legal">
 <h2>Términos y condiciones</h2>
 <h3>Quién vende</h3>
 <p>Lic. Rosana Roldán, nutricionista (UBA), M.N. 3884, Ciudad de Buenos Aires, Argentina. Atención por WhatsApp al 11 5142-6830, de lunes a viernes de 9 a 17 h.</p>
 <h3>Qué vendo</h3>
 <ul>
  <li><b>El libro digital</b> «Recupera tu energía en 90 días»: un PDF que llega a tu mail en el momento del pago.</li>
  <li><b>Rosana te escribe cada mañana:</b> 90 mails, uno por día, desde el día siguiente al pago.</li>
  <li><b>Sesión 1-1 con Rosana:</b> 45 minutos por videollamada, en el horario que eliges al pagar.</li>
  <li><b>Programa NuPlan · 90 días:</b> el acompañamiento completo. Lo rige el acuerdo de participación que firmas al empezar.</li>
 </ul>
 <h3>Precios y pago</h3>
 <p>Los precios se muestran en dólares y se pagan en pesos con Mercado Pago, al valor que ves en el momento del pago.</p>
 <h3>Devoluciones del programa</h3>
 <p>En el programa te devuelvo el 100 % si cambias de idea antes de tu encuentro de apertura conmigo, sin explicaciones. Desde la apertura, el trabajo clínico ya empezó y se rige por tu acuerdo de participación.</p>
 <h3>Tu derecho de arrepentimiento</h3>
 <p>Tienes 10 días corridos para arrepentirte de una compra, contados desde la compra o desde que recibes el producto, lo último que ocurra (artículo 34 de la Ley 24.240 y artículo 1110 del Código Civil y Comercial). Lo pides con el botón de arrepentimiento, sin registrarte ni hacer ningún otro trámite.</p>
 <p>Por ley, este derecho no aplica a los archivos digitales que ya descargaste, como el libro en PDF (artículo 1116 del Código Civil y Comercial), ni a un servicio que ya usaste por completo.</p>
 <h3>Baja de un servicio</h3>
 <p>Puedes dar de baja los mails diarios o el programa por el mismo medio por el que los contrataste, con el botón de baja de servicio. Los mails también traen, al pie, la opción para dejar de recibirlos.</p>
 <h3>Salud</h3>
 <p>NuPlan es educación y acompañamiento nutricional, y trabaja junto con tu médico. Si tienes un diagnóstico, tomas medicación o estás embarazada, cuéntamelo al empezar.</p>
</div></section>
<section class="sec" id="privacidad"><div class="wrap legal">
 <h2>Privacidad</h2>
 <p>Uso tus datos (nombre, mail, teléfono y lo que me cuentas en los formularios y en la app) para entregarte lo que compraste, coordinar tus encuentros y escribirte. Los ven solo mi equipo y yo; lo que cargas sobre tu salud, solo la coordinadora del programa y yo. No los vendo ni los comparto.</p>
 <p>Puedes pedirme en cualquier momento ver, corregir o borrar tus datos, por WhatsApp al 11 5142-6830.</p>
 <div class="aviso"><p>La Agencia de Acceso a la Información Pública, en su carácter de Órgano de Control de la Ley N.º 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos personales.</p></div>
</div></section>
<section class="sec white" id="arrepentimiento"><div class="wrap legal">
 {lab("Botón de arrepentimiento", "escudo")}
 <h2>Arrepentirme de una compra</h2>
 <p>Completa estos datos y envía tu pedido. Te muestro tu código de pedido en el momento y te escribo dentro de las 24 horas para devolverte el dinero.</p>
 {formulario("arrep", "Botón de arrepentimiento", "NP-A", compras, "Te escribo dentro de las 24 horas al mail que dejaste para devolverte el dinero.", True)}
</div></section>
<section class="sec" id="baja"><div class="wrap legal">
 {lab("Botón de baja de servicio", "escudo")}
 <h2>Dar de baja un servicio</h2>
 <p>Completa estos datos y envía tu pedido. Te muestro tu código en el momento y la baja queda hecha dentro de las 24 horas.</p>
 {formulario("baja", "Botón de baja de servicio", "NP-B", servicios, "La baja queda hecha dentro de las 24 horas y te lo confirmo por mail.", False)}
</div></section>
{pie()}'''
    return page("Legales · NuPlan™", inner, JS_FORM)


# =============================== 5 · PAGO DEL PROGRAMA ===============================
def programa():
    inc = [
        "8 encuentros por videollamada: 3 conmigo (apertura, tu plan y cierre) y 5 con María Julia, coordinadora del programa",
        "La app NuPlan: un ejercicio por día, tu diario y tus check-in conmigo",
        "Tu plan personalizado, armado por mí con lo que te gusta y tu semana real",
        "El libro «Recupera tu energía en 90 días», edición del programa",
        "El grupo privado del programa, con lives y un canal por etapa",
        "Taller de planificación en grupo y WhatsApp de coordinación",
    ]
    li = "".join(f"<li>{ic('check')}<span>{E(x)}</span></li>" for x in inc)
    inner = f'''{bar(False)}
<section class="hero" style="padding-bottom:20px"><div class="wrap narrow">
 <span class="eyb">PROGRAMA NUPLAN · 90 DÍAS</span>
 <h1 style="font-size:clamp(38px,9vw,64px)">Tu lugar en el <em>programa.</em></h1>
 <p class="lead">Noventa días para recuperar tu energía y tu relación con la comida, con mi acompañamiento uno a uno.</p>
 <div class="offer" style="grid-template-columns:1fr;margin-top:26px">
  <div>
   <p class="ot">Qué incluye</p>
   <ul class="inc" style="margin-top:18px">{li}</ul>
   <p class="price">USD 1.000 <small>en un pago</small></p>
   <p class="pnote">O dos pagos de USD 550: el segundo, a los 30 días. Pagas en pesos con Mercado Pago.</p>
   <div class="cred"><p><b>¿Hiciste la sesión 1-1 conmigo en los últimos 7 días?</b> Escribe tu código de descuento en el formulario y se descuentan los USD 97.</p></div>
   <p class="tick">{ic("escudo")}100 % DE DEVOLUCIÓN HASTA TU APERTURA</p>
  </div>
 </div>
 <p class="micro" style="text-align:center;margin-top:30px">ELIGE UN PAGO O DOS Y COMPLETA TUS DATOS ↓</p>
</div></section>'''
    return page("Programa NuPlan · 90 días · Tu lugar", inner)


def segundo_pago():
    inner = f'''{bar(False)}
<section class="hero" style="padding-bottom:20px"><div class="wrap narrow">
 <span class="eyb">PROGRAMA NUPLAN · SEGUNDO PAGO</span>
 <h1 style="font-size:clamp(38px,9vw,64px)">Tu segundo <em>pago.</em></h1>
 <p class="lead">Ya vas por el día 30. Con este pago completas tu programa.</p>
 <div class="conf">{ic("ok")}<div><b>USD 550</b><span>Pagas en pesos con Mercado Pago.</span></div></div>
 <p class="micro" style="text-align:center">COMPLETA TUS DATOS ↓</p>
</div></section>'''
    return page("Programa NuPlan · Segundo pago", inner)


def segundo_gracias():
    inner = f'''{bar(False)}
<section class="hero"><div class="wrap narrow">
 <div class="conf">{ic("ok")}<div><b>Pago recibido.</b><span>Tu programa quedó completo.</span></div></div>
 <h1 style="font-size:clamp(38px,9vw,64px)">Gracias. <em>Seguimos.</em></h1>
 <p class="lead">Tu recorrido sigue igual en la app. Cualquier duda, me escribes.</p>
 {btn("Entrar a mi app", U["app"], "cta").replace('target="_top"', 'target="_blank" rel="noopener"')}
 <p class="firma">Rosana<span>LIC. ROSANA ROLDÁN · M.N. 3884</span></p>
</div></section>
{pie()}'''
    return page("Programa NuPlan · Pago recibido", inner)


# =============================== 6 · BIENVENIDA ===============================
def bienvenida():
    pasos = [
        ("En el día", "Tu acceso a la app", "Te llega un mail con tu acceso. Entras desde el teléfono con tu mail, sin contraseña. Con el acceso llega también la invitación al grupo privado del programa."),
        ("En 48 horas", "Tu bienvenida", "María Julia, coordinadora del programa, te escribe por WhatsApp para tu bienvenida de 15 minutos. Ahí firman tu acuerdo del programa."),
        ("Días 1 a 3", "Tu apertura conmigo", "45 minutos por videollamada: tu historia y la dirección de tu plan."),
    ]
    st = "".join(f'<div class="step rv"><span class="sn">{n}</span><div><p class="dd" style="font-family:Space Mono,monospace;font-size:15px;color:var(--cd);margin:0 0 4px">{E(cu)}</p><h3>{E(t)}</h3><p>{E(d)}</p></div></div>' for n, (cu, t, d) in enumerate(pasos, 1))
    if CAL_APERTURA:
        agenda = (f'<div class="calw" style="margin-top:20px"><iframe src="https://api.leadconnectorhq.com/widget/booking/{CAL_APERTURA}" style="width:100%;border:none;overflow:hidden;min-height:620px" scrolling="no" id="{CAL_APERTURA}_ap"></iframe></div>'
                  '<script src="https://link.msgsndr.com/js/form_embed.js" type="text/javascript"></script>')
    else:
        agenda = btn("Coordinar mi apertura por WhatsApp", U["wa"] + "?text=Hola%20Rosana%2C%20ya%20pagu%C3%A9%20el%20programa.%20Quiero%20coordinar%20mi%20apertura.", "cta", "wa").replace('target="_top"', 'target="_blank" rel="noopener"')
    inner = f'''{bar(False)}
<section class="hero"><div class="wrap narrow">
 <div class="conf">{ic("ok")}<div><b>Pago recibido.</b><span>Ya estás adentro.</span></div></div>
 <h1 style="font-size:clamp(40px,10vw,68px)">Bienvenida al <em>programa.</em></h1>
 <p class="lead">Esto es lo que pasa ahora, en orden.</p>
 <div class="steps" style="grid-template-columns:1fr">{st}</div>
 <h2 style="font-size:clamp(28px,6vw,38px);margin-top:20px">Elige el horario de tu apertura</h2>
 {agenda}
 <p class="firma">Te espero.<span>ROSANA · LIC. ROSANA ROLDÁN · M.N. 3884</span></p>
</div></section>
{pie()}'''
    return page("Bienvenida al programa NuPlan", inner)


PAGES = {
    "nuplan-inicio.html": inicio,
    "nuplan-empresas.html": empresas,
    "nuplan-clase.html": clase,
    "nuplan-legales.html": legales,
    "nuplan-programa-encabezado.html": programa,
    "nuplan-programa-segundo-pago-encabezado.html": segundo_pago,
    "nuplan-programa-segundo-gracias.html": segundo_gracias,
    "nuplan-bienvenida.html": bienvenida,
}

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for name, fn in PAGES.items():
        html_ = fn()
        open(os.path.join(OUT, name), "w", encoding="utf-8").write(html_)
        print(f"{name}: {len(html_):,} bytes")
