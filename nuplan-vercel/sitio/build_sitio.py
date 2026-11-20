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
        ("libro", "El libro", "«Recuperá tu energía en 90 días»: una invitación por día para hacerlo a tu ritmo.", "Ver el libro", U["libro"], "", "USD 27"),
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
 <p class="micro">UN VIDEO DE 3 MINUTOS · SIN COSTO</p>
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
  <li><b>El libro digital</b> «Recuperá tu energía en 90 días»: un PDF que llega a tu mail en el momento del pago.</li>
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
        "El libro «Recuperá tu energía en 90 días», edición del programa",
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


# =============================== 9 · EL VIDEO Y LA AGENDA (/vsl) ===============================
CAL_ADMISION = "csuNSCxUTLqSGtRxTUKJ"   # «Entrevista de Admisión NuPlan™», 30 min, asignado a Rosana
CAL_ADMISION_LINK = "https://api.leadconnectorhq.com/widget/bookings/entrevista-admisin-con-ro"
VIDEO_VSL = "https://assets.cdn.filesafe.space/s44QfsRYPnToRlrDgJbo/media/6a6a5201c0edd70fbca745c5.mp4"   # 2:50
VIDEO_PREP = "https://assets.cdn.filesafe.space/s44QfsRYPnToRlrDgJbo/media/6a6a51e17d99a224644380a7.mp4"  # 0:32

CSS_VSL = """<style>
@media (prefers-reduced-motion:no-preference){html{scroll-behavior:smooth}}
#nlb .vid video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:#2a1712}
#nlb .vplay{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:inline-flex;align-items:center;gap:10px;white-space:nowrap;background:var(--co);color:#fff;border:0;border-radius:999px;padding:14px 22px;font:inherit;font-weight:800;font-size:19px;cursor:pointer;box-shadow:0 16px 34px -12px rgba(40,10,4,.6);transition:background .2s}
#nlb .vplay:hover{background:var(--cd)}
#nlb .vplay .ic{width:28px;height:28px}
#nlb .vid.on .vplay{display:none}
#nlb .hgrid .vid{margin:4px 0 22px}
#nlb .stats{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:34px}
#nlb .stat{background:var(--sf);border:1px solid var(--bd);border-radius:1rem;padding:16px 18px}
#nlb .stat b{display:block;font-size:40px;font-weight:800;letter-spacing:-.02em;color:var(--co);line-height:1}
#nlb .stat span{display:block;font-size:17px;color:#3d4148;margin-top:8px;line-height:1.3}
#nlb .mk{display:grid;gap:10px;margin-top:26px}
#nlb .mki{display:flex;align-items:center;gap:14px;width:100%;text-align:left;font:inherit;font-size:20px;font-weight:600;line-height:1.35;color:var(--tx);background:var(--bg);border:2px solid var(--bd);border-radius:1rem;padding:16px 18px;cursor:pointer;transition:border-color .2s,background .2s}
#nlb .mki .ic{width:30px;height:30px;flex:none;color:transparent;border:2px solid var(--ac);border-radius:.5rem;padding:3px;transition:all .2s}
#nlb .mki[aria-pressed="true"]{border-color:var(--co);background:#fff}
#nlb .mki[aria-pressed="true"] .ic{color:#fff;background:var(--co);border-color:var(--co)}
#nlb .mkr{margin-top:16px;background:var(--co);color:#fff;border-radius:1.5rem;padding:24px 22px}
#nlb .mkr b{display:block;font-family:"Space Mono",monospace;font-weight:400;font-size:15px;letter-spacing:.1em;color:var(--ti);margin-bottom:8px}
#nlb .mkr p{margin:0;font-size:21px;line-height:1.45}
#nlb .mkr a{display:inline-flex;align-items:center;gap:8px;margin-top:14px;color:#fff;font-weight:800;font-size:19px;text-underline-offset:4px}
#nlb .mkr a .ic{width:22px;height:22px}
#nlb .chart{max-width:560px;margin:30px 0 8px;background:var(--sf);border:1px solid var(--bd);border-radius:1.5rem;padding:18px 14px 10px}
#nlb .chart svg{display:block;width:100%;height:auto}
#nlb .chart .gl{stroke:#f0e2dd;stroke-width:1.5}
#nlb .chart .ax{font-family:"Space Mono",monospace;font-size:17px;fill:#c53a1e}
#nlb .chart .ln{fill:none;stroke:#e8472a;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset 2.4s ease .3s}
#nlb .chart .vt{fill:none;stroke:#1a1a1a;stroke-width:2.5;stroke-dasharray:7 7;opacity:.55}
#nlb .chart .cf{fill:#e8472a;stroke:#fff;stroke-width:3;opacity:0;transition:opacity .5s ease 2.2s}
#nlb .chart.in .ln{stroke-dashoffset:0}
#nlb .chart.in .cf{opacity:1}
#nlb .leg2{display:flex;flex-wrap:wrap;gap:8px 20px;font-size:16px;color:#3d4148;margin:0 0 22px}
#nlb .leg2 span{display:inline-flex;align-items:center;gap:8px}
#nlb .leg2 i{display:inline-block;width:26px;height:4px;border-radius:2px;background:var(--co)}
#nlb .leg2 i.d{background:repeating-linear-gradient(90deg,#8a8f98 0 6px,transparent 6px 11px)}
#nlb .tabs{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:28px}
#nlb .tab{display:flex;align-items:center;gap:8px;min-width:0;font:inherit;font-size:18px;font-weight:700;color:var(--tx);background:var(--bg);border:2px solid var(--bd);border-radius:1rem;padding:14px 12px;cursor:pointer;transition:all .2s}
#nlb .tab .ic{width:24px;height:24px;color:var(--co)}
#nlb .tab[aria-selected="true"]{background:var(--co);border-color:var(--co);color:#fff}
#nlb .tab[aria-selected="true"] .ic{color:#fff}
#nlb .tpan,#nlb .lpan{margin-top:14px;border-radius:1.5rem;padding:26px 22px}
#nlb .tpan{background:var(--bg);min-height:230px}
#nlb .lpan{background:var(--sf);border:1px solid var(--bd);min-height:220px}
#nlb .tpan .el,#nlb .lpan .wk{font-family:"Space Mono",monospace;font-size:15px;letter-spacing:.08em;color:var(--cd);margin-bottom:8px}
#nlb .tpan h3,#nlb .lpan h3{font-size:clamp(26px,5.4vw,34px);margin-bottom:12px}
#nlb .tpan .tx,#nlb .lpan .tx{font-size:20px;line-height:1.55;margin:0;color:#33373d}
#nlb .lts{display:flex;gap:6px;margin-top:26px}
#nlb .ltb{width:50px;height:50px;flex:none;border-radius:50%;font:inherit;font-size:24px;font-weight:800;color:var(--cd);background:var(--sf);border:2px solid var(--ac);cursor:pointer;transition:all .2s}
#nlb .ltb[aria-selected="true"]{background:var(--cd);border-color:var(--cd);color:#fff;transform:translateY(-3px)}
#nlb .dbar{position:relative;height:12px;border-radius:6px;background:var(--ti);margin:22px 0 8px}
#nlb .dbar i{position:absolute;top:0;bottom:0;border-radius:6px;background:var(--co);transition:left .4s ease,width .4s ease}
#nlb .dlab{display:flex;justify-content:space-between;font-family:"Space Mono",monospace;font-size:15px;color:var(--mu)}
#nlb .incb{background:var(--sf);border:1px solid var(--bd);border-radius:1.5rem;padding:26px 22px;margin-top:30px}
#nlb .incb .inc{margin:16px 0 0}
#nlb .gar{display:flex;gap:18px;align-items:flex-start;background:var(--sf);border:2px dashed var(--ac);border-radius:1.5rem;padding:24px 22px;margin:0 0 40px}
#nlb .gar>.ic{width:46px;height:46px;color:var(--co)}
#nlb .gar .el{font-family:"Space Mono",monospace;font-size:15px;letter-spacing:.1em;color:var(--cd);margin:0 0 6px}
#nlb .gar h3{font-size:24px;margin-bottom:8px}
#nlb .gar p{margin:0;font-size:18px;color:#3d4148}
#nlb .steps .sn{font-size:16px;width:auto;min-width:44px;padding:0 10px;border-radius:999px}
#nlb .calw iframe{display:block;width:100%;border:0;min-height:920px}
#nlb .avs{background:var(--sf);border:1px solid var(--bd);border-left:5px solid var(--co);border-radius:1rem;padding:22px 20px;margin-top:30px}
#nlb .avs .el{font-family:"Space Mono",monospace;font-size:15px;letter-spacing:.1em;color:var(--cd);margin:0 0 6px}
#nlb .avs h3{font-size:24px;margin-bottom:8px}
#nlb .avs p{font-size:18px;color:#3d4148}
#nlb .stk{position:fixed;left:12px;right:12px;bottom:12px;z-index:60;display:flex;align-items:center;justify-content:center;gap:10px;background:var(--co);color:#fff;text-decoration:none;font-weight:800;font-size:19px;line-height:1.2;padding:16px 18px;border-radius:1rem;box-shadow:0 16px 34px -12px rgba(120,30,10,.6);transform:translateY(160%);transition:transform .3s ease}
#nlb .stk .ic{width:22px;height:22px}
#nlb .stk.on{transform:none}
@media (min-width:760px){
 #nlb .hgrid.hv{grid-template-columns:1fr 1.1fr}
 #nlb .tab{font-size:19px;padding:14px 16px;gap:10px}
 #nlb .stats{grid-template-columns:repeat(4,1fr)}
 #nlb .mk{grid-template-columns:1fr 1fr}
 #nlb .tabs{grid-template-columns:repeat(4,1fr)}
 #nlb .lts{gap:10px}
 #nlb .ltb{width:58px;height:58px;font-size:26px}
 #nlb .tpan,#nlb .lpan{padding:34px 34px}
 #nlb .stk{display:none}
}
@media (prefers-reduced-motion:reduce){#nlb .chart .ln{stroke-dashoffset:0;transition:none}#nlb .chart .cf{opacity:1;transition:none}}
</style>"""

JS_VSL = """<script>(function(){var r=document.getElementById('nlb');if(!r)return;
var M=__M__,D=__D__,S=__S__;
r.querySelectorAll('.vid[data-v]').forEach(function(w){var v=w.querySelector('video'),b=w.querySelector('.vplay');if(!v||!b)return;
 b.addEventListener('click',function(){w.classList.add('on');v.controls=true;try{v.currentTime=0}catch(e){}var p=v.play();if(p&&p.catch)p.catch(function(){});});});
var mk=r.querySelectorAll('.mki'),n=r.querySelector('.mkn'),t=r.querySelector('.mkt');
function up(){var c=r.querySelectorAll('.mki[aria-pressed="true"]').length;if(n)n.textContent=c+' DE 6';if(t&&M)t.innerHTML=M[c];}
mk.forEach(function(b){b.addEventListener('click',function(){b.setAttribute('aria-pressed',b.getAttribute('aria-pressed')==='true'?'false':'true');up();});});
function tabs(sel,pan,data,render){var bs=r.querySelectorAll(sel),p=r.querySelector(pan);if(!p||!data)return;
 bs.forEach(function(b,i){b.addEventListener('click',function(){bs.forEach(function(x){x.setAttribute('aria-selected','false')});b.setAttribute('aria-selected','true');render(p,data[i]);});});}
tabs('.tab','.tpan',D,function(p,d){p.querySelector('.el').textContent=d[0];p.querySelector('h3').textContent=d[1];p.querySelector('.tx').textContent=d[2];});
tabs('.ltb','.lpan',S,function(p,d){p.querySelector('.wk').textContent=d[0];p.querySelector('h3').textContent=d[1];p.querySelector('.tx').textContent=d[2];
 var i=r.querySelector('.dbar i');if(i){i.style.left=d[3]+'%';i.style.width=d[4]+'%';}});
var ch=r.querySelector('.chart');if(ch){if('IntersectionObserver' in window){var o=new IntersectionObserver(function(e){if(e[0].isIntersecting){ch.classList.add('in');o.disconnect();}},{threshold:.35});o.observe(ch);setTimeout(function(){ch.classList.add('in')},9000);}else ch.classList.add('in');}
var s=r.querySelector('.stk'),h=r.querySelector('.hero'),a=document.getElementById('agenda');
if(s&&h&&('IntersectionObserver' in window)){var vh=true,va=false;var f=function(){if(!vh&&!va)s.classList.add('on');else s.classList.remove('on');};
 new IntersectionObserver(function(e){vh=e[0].isIntersecting;f();}).observe(h);
 if(a)new IntersectionObserver(function(e){va=e[0].isIntersecting;f();}).observe(a);}
})();</script>"""

MARCA = ["Como cualquier cosa en el trabajo.", "Llego a la noche y no tengo control.", "Arranco bien y después abandono.",
         "Estoy cansada todo el tiempo, sin energía.", "Necesito café para funcionar.", "Probé de todo y siempre vuelvo al mismo lugar."]
MARCA_R = [
    "Empieza marcando las que reconoces. Todas las respuestas valen.",
    "Una sola ya alcanza para mirarla. Casi siempre es la punta de un patrón más grande.",
    "Dos frases marcan un patrón, no un mal día. <strong>Tu cuerpo te está pidiendo algo que la comida no le está dando.</strong>",
    "Tres. Aquí ya no hablamos de la edad ni del estrés de esta semana: es tu sistema nervioso en alerta desde hace meses.",
    "Cuatro. Estás funcionando con <strong>energía prestada</strong>: café, adrenalina, inercia. Rindes, a un costo que todavía no ves.",
    "Cinco de seis. Esto es biología, y la biología se regula. <strong>Tiene solución.</strong>",
    "Las seis. Lee esto despacio: <strong>tu cuerpo está entero</strong>. Está en modo supervivencia, y nadie te explicó qué le está pasando.",
]
DIMS_VSL = [
    ("tierra", "Física", "FÍSICA · TIERRA", "Qué comes",
     "Lo concreto del plato, desde la inteligencia de tu cuerpo: tu biotipo, tu saciedad real, tu contexto. Es la dimensión que todos miran. Es necesaria, y es una de cuatro."),
    ("agua", "Emocional", "EMOCIONAL · AGUA", "Qué emoción estás comiendo",
     "El corazón del método. Aquí trabajas la ansiedad, el estrés y la culpa, que son los que mandan cualquier plan al cajón a los cuatro meses. Aprendes a distinguir hambre real de hambre emocional y a regularte con más recursos que la comida."),
    ("fuego", "Energética", "ENERGÉTICA · FUEGO", "Cuándo te pide comer tu cuerpo",
     "Tus ritmos, tu descanso y cómo llegas a la noche. Crononutrición y biotipo: dos personas con el mismo plan y distintos horarios tienen resultados distintos."),
    ("aire", "Mental", "MENTAL · AIRE", "Qué te dices",
     "«Ya fallé, sigo.» «Mañana empiezo.» Son programas instalados hace años. Se desactivan con técnica, y la técnica se aprende."),
]
PASOS_VSL = [
    ("N", "DÍAS 1 A 14 · DIAGNÓSTICO REAL", "Nutrir",
     "Tu apertura conmigo empieza por la pregunta que nadie te hizo: «¿qué estás comiendo de verdad?». Dos semanas para mirar cómo comes, tal como comes hoy.", 0, 15.6),
    ("U", "DÍAS 15 A 28 · RAÍZ EMOCIONAL", "Unir",
     "Distingues hambre real de hambre emocional y aprendes a regular tu sistema nervioso con más recursos que la comida.", 15.6, 15.6),
    ("P", "DÍAS 29 A 42 · TU PLAN, CONTIGO", "Personalizar",
     "Aquí aparece tu plan de comidas, construido contigo desde tu vida real y tus horarios reales. En el día 43 lo aprobamos juntas.", 31.1, 15.6),
    ("L", "DÍAS 43 A 56 · ANTI-RECAÍDA", "Liberar",
     "El punto donde se caen la mayoría de los planes. Aquí un desliz pasa a ser información.", 46.7, 15.6),
    ("A", "DÍAS 57 A 70 · DATOS REALES", "Activar",
     "Tu tablero con parámetros objetivos: energía, sueño, evolución. Ves tu avance en datos, más allá de cómo te sentiste hoy.", 62.2, 15.6),
    ("N", "DÍAS 71 A 90 · IDENTIDAD NUEVA", "Naturalizar",
     "El éxito del método es que sigas sola. Terminas con tus propias reglas y tus herramientas.", 77.8, 22.2),
]
INCLUYE = [
    "8 encuentros por videollamada: 3 conmigo (apertura, tu plan y cierre) y 5 con María Julia, coordinadora del programa",
    "La app NuPlan: un ejercicio por día, tu diario y tus check-in conmigo",
    "Tu plan personalizado, armado por mí con lo que te gusta y tu semana real",
    "El libro «Recuperá tu energía en 90 días», edición del programa",
    "El grupo privado del programa, con lives y un canal por etapa",
    "Taller de planificación en grupo y WhatsApp de coordinación",
]
FAQ_VSL = [
    ("¿Voy a tener un plan de comidas?",
     "Sí, y lo armamos juntas. Aparece en la etapa P, entre los días 29 y 42, con lo que te gusta y tu semana real. Si para ti es importante compartir la pizza que amasa tu marido los sábados, entra en tu plan."),
    ("Ya probé de todo. ¿Por qué esto sería distinto?",
     "Porque todo lo que probaste trabajó una sola dimensión: el plato, la cabeza o la química. Aquí trabajamos las cuatro a la vez: lo que comes, lo que sientes, tus ritmos y lo que te dices."),
    ("No tengo tiempo. ¿Cuánto me demanda?",
     "Diez minutos por día en la app, de lunes a sábado, y 8 encuentros por videollamada en los 90 días: 3 conmigo y 5 con María Julia, la coordinadora del programa. Está pensado para mujeres con agenda exigente."),
    ("¿Cuánto sale?",
     "Lo vemos en la llamada. Primero te digo si puedo ayudarte; después, los números y las formas de pago."),
    ("¿Y si después de pagar cambio de idea?",
     "Te devuelvo el 100 % hasta tu encuentro de apertura conmigo, sin explicaciones."),
]

CHART = ('<svg viewBox="0 0 350 232" role="img" aria-label="Tu energía durante el día: cada café la sube y la deja más abajo; tu energía vital baja hasta la noche">'
         '<line class="gl" x1="48" y1="16" x2="316" y2="16"/><line class="gl" x1="48" y1="101" x2="316" y2="101"/><line class="gl" x1="48" y1="186" x2="316" y2="186"/>'
         '<text class="ax" x="0" y="22">ALTA</text><text class="ax" x="0" y="192">BAJA</text>'
         '<path class="vt" d="M48,64 C130,74 220,108 316,168"/>'
         '<path class="ln" pathLength="1" d="M48,110 L56,116 L66,44 C80,70 96,112 112,124 L121,58 C138,88 156,126 172,136 L181,74 C198,104 214,140 228,150 L237,96 C250,124 262,150 272,162 S300,178 316,182"/>'
         '<circle class="cf" cx="56" cy="116" r="7"/><circle class="cf" cx="112" cy="124" r="7"/><circle class="cf" cx="172" cy="136" r="7"/><circle class="cf" cx="228" cy="150" r="7"/>'
         '<text class="ax" x="48" y="220" text-anchor="middle">7 h</text><text class="ax" x="115" y="220" text-anchor="middle">11 h</text>'
         '<text class="ax" x="182" y="220" text-anchor="middle">15 h</text><text class="ax" x="249" y="220" text-anchor="middle">19 h</text>'
         '<text class="ax" x="316" y="220" text-anchor="middle">23 h</text></svg>')


def vid(src, rot, ident, t0="0.1"):
    return (f'<div class="vid rv" data-v id="{ident}"><video src="{src}#t={t0}" preload="metadata" playsinline></video>'
            f'<button class="vplay" type="button">{ic("play")}<span>{E(rot)}</span></button></div>')


def js_vsl():
    return (JS_VSL.replace("__M__", json.dumps(MARCA_R, ensure_ascii=False))
                  .replace("__D__", json.dumps([[d[2], d[3], d[4]] for d in DIMS_VSL], ensure_ascii=False))
                  .replace("__S__", json.dumps([[p[1], p[2], p[3], p[4], p[5]] for p in PASOS_VSL], ensure_ascii=False)))


def vsl():
    marca = "".join(f'<button class="mki" type="button" aria-pressed="false">{ic("check")}<span>{E(x)}</span></button>' for x in MARCA)
    tabs = "".join(f'<button class="tab" type="button" role="tab" aria-selected="{"true" if i == 0 else "false"}">{ic(d[0])}<span>{E(d[1])}</span></button>' for i, d in enumerate(DIMS_VSL))
    d0 = DIMS_VSL[0]
    lts = "".join(f'<button class="ltb" type="button" role="tab" aria-selected="{"true" if i == 0 else "false"}" aria-label="{E(p[2])}">{p[0]}</button>' for i, p in enumerate(PASOS_VSL))
    p0 = PASOS_VSL[0]
    inc = "".join(f"<li>{ic('check')}<span>{E(x)}</span></li>" for x in INCLUYE)
    faq = "".join(f"<details><summary>{E(q)}</summary><p>{E(a)}</p></details>" for q, a in FAQ_VSL)
    minutos = [("0 a 10", "Me cuentas cómo es tu día", "Y dónde se te escapa el control."),
               ("10 a 20", "Te muestro qué dimensión manda", "La que está dominando en tu caso."),
               ("20 a 30", "Te digo si es para ti", "Con honestidad, y cómo seguimos si lo es.")]
    mins = "".join(f'<div class="step rv"><span class="sn">{E(m)}</span><div><h3>{E(t)}</h3><p>{E(d)}</p></div></div>' for m, t, d in minutos)
    inner = f'''{CSS_VSL}
<div class="bar"><a href="{U["inicio"]}" target="_top"><b>Nu<span>Plan</span>™</b></a><a class="bcta" href="#agenda">Agendar</a></div>
<section class="hero"><div class="wrap hgrid hv">
 <div>
  <span class="eyb">PROGRAMA NUPLAN · 90 DÍAS</span>
  <h1>Recupera tu energía y tus <em>ganas de vivir.</em></h1>
  <p class="lead">Para mujeres ejecutivas y profesionales con cargo que viven aceleradas, comen lo que pueden y a la noche sienten que perdieron el control.</p>
 </div>
 <div>
  {vid(VIDEO_VSL, "Ver el video · 3 min", "video")}
  <a class="cta" href="#agenda">Agendar mi llamada de 30 minutos{ic("flecha")}</a>
  <p class="micro">SIN COSTO · 5 CUPOS POR SEMANA</p>
 </div>
</div>
<div class="wrap"><div class="stats">
 <div class="stat rv"><b>20+</b><span>años de clínica</span></div>
 <div class="stat rv"><b>90</b><span>días de programa</span></div>
 <div class="stat rv"><b>4</b><span>dimensiones</span></div>
 <div class="stat rv"><b>8</b><span>encuentros por videollamada</span></div>
</div></div></section>
<section class="sec white" id="te-pasa"><div class="wrap">
 {lab("30 segundos", "reloj")}
 <h2>Marca las que te pasan.</h2>
 <p class="lead">Las escucho en consultorio hace veinte años. Siempre las mismas, dichas por mujeres distintas.</p>
 <div class="mk">{marca}</div>
 <div class="mkr" aria-live="polite"><b class="mkn">0 DE 6</b><p class="mkt">{MARCA_R[0]}</p><a href="#agenda">Cuéntamelo en la llamada{ic("flecha")}</a></div>
</div></section>
<section class="sec"><div class="wrap">
 {lab("Lo que nadie te explicó", "chispa")}
 <h2>Así se ve tu día por dentro.</h2>
 <p class="lead">Cada café te sube. Cada subida te deja más abajo que antes. A eso le llamo <strong>energía prestada</strong>.</p>
 <div class="chart">{CHART}</div>
 <div class="leg2"><span><i></i>Tu día hoy · los puntos son cafés</span><span><i class="d"></i>Tu energía vital</span></div>
 <p class="lead">Lo que te pasa tiene nombre: <strong>regulación</strong>. Tu sistema nervioso pasa catorce horas en alerta y a la noche busca bajar con lo único que tiene a mano.</p>
 <div class="quote rv"><p>«La restricción no encierra a la comida: te encierra a ti.»</p><span>LIC. ROSANA ROLDÁN</span></div>
</div></section>
<section class="sec white" id="metodo"><div class="wrap">
 {lab("El método", "chispa")}
 <h2>Las 4 dimensiones de tu energía.</h2>
 <p class="lead">Casi todo lo que probaste trabajó una sola: el plato. Lo que te pasa vive también en las otras tres, y NuPlan trabaja las cuatro a la vez.</p>
 <div class="tabs" role="tablist" aria-label="Las cuatro dimensiones">{tabs}</div>
 <div class="tpan" role="tabpanel" aria-live="polite"><p class="el">{E(d0[2])}</p><h3>{E(d0[3])}</h3><p class="tx">{E(d0[4])}</p></div>
</div></section>
<section class="sec" id="camino"><div class="wrap">
 {lab("Los 90 días", "semana")}
 <h2>Seis pasos, en orden.</h2>
 <p class="lead">Toca cada letra para ver qué pasa en cada etapa.</p>
 <div class="lts" role="tablist" aria-label="Las seis etapas">{lts}</div>
 <div class="dbar"><i style="left:0%;width:15.6%"></i></div>
 <div class="dlab"><span>DÍA 1</span><span>DÍA 90</span></div>
 <div class="lpan" role="tabpanel" aria-live="polite"><p class="wk">{E(p0[1])}</p><h3>{E(p0[2])}</h3><p class="tx">{E(p0[3])}</p></div>
 <div class="incb rv"><p class="ot" style="font-size:clamp(24px,5vw,30px)">Qué incluyen tus 90 días</p><ul class="inc">{inc}</ul></div>
</div></section>
<section class="sec white" id="rosana"><div class="wrap split">
 <div>
  {lab("Quién te va a acompañar", "sesion")}
  <h2>Rosana Roldán</h2>
  <p>Nutricionista de la UBA, M.N. 3884, con dos posgrados y más de veinte años de consultorio. Y te lo digo también desde otro lugar: <strong>yo viví ese mismo agotamiento</strong>. Trabajaba sin parar, comía lo que podía y a la noche no me alcanzaba la energía para nada.</p>
  <p>En el programa me acompaña María Julia, nutricionista y coordinadora del programa: te recibe el primer día y está contigo entre encuentro y encuentro.</p>
 </div>
 <div><p class="big">«Mi propio cuerpo fue mi primer laboratorio.»</p></div>
</div></section>
<section class="sec" id="agenda"><div class="wrap">
 <div class="gar rv">{ic("escudo")}<div><p class="el">TU GARANTÍA</p><h3>Si cambias de idea, te devuelvo el 100 %.</h3><p>Hasta tu encuentro de apertura conmigo, sin explicaciones. Así decides con calma.</p></div></div>
 {lab("El siguiente paso", "flecha")}
 <h2>Agenda 30 minutos conmigo.</h2>
 <p class="lead">Sin costo, por videollamada. Me cuentas tu caso y te digo con honestidad si el programa tiene sentido para ti.</p>
 <div class="steps">{mins}</div>
 <div class="calw"><iframe src="https://api.leadconnectorhq.com/widget/booking/{CAL_ADMISION}" scrolling="no" id="{CAL_ADMISION}_1787681177706" title="Agenda tu llamada con Rosana"></iframe></div>
 <script src="https://link.msgsndr.com/js/form_embed.js" type="text/javascript"></script>
 <p class="micro" style="text-align:center">ES ONLINE, DESDE CUALQUIER PAÍS · 5 CUPOS POR SEMANA</p>
 <a class="no" href="{CAL_ADMISION_LINK}" target="_blank" rel="noopener">¿No carga el calendario? Ábrelo aquí</a>
</div></section>
<section class="sec white" id="preguntas"><div class="wrap narrow">
 {lab("Antes de agendar", "chispa")}
 <h2>Lo que casi todas me preguntan.</h2>
 <div style="margin-top:26px">{faq}</div>
 <p class="big" style="margin-top:44px">«Comer es mucho más que ingerir nutrientes. Es defensa. Es expresión.»</p>
</div></section>
<section class="sec coral final"><div class="wrap narrow">
 <h2>¿Hablamos 30 minutos?</h2>
 <p class="lead">Me cuentas tu caso y te digo con honestidad si el programa tiene sentido para ti.</p>
 <a class="cta inv" href="#agenda">Agendar mi llamada{ic("flecha")}</a>
 <p class="micro">SIN COSTO · POR VIDEOLLAMADA</p>
</div></section>
{pie()}
<a class="stk" href="#agenda">Agendar mi llamada de 30 minutos{ic("flecha")}</a>'''
    return page("NuPlan™ · Recupera tu energía y tus ganas de vivir", inner, js_vsl())


# =============================== 10 · ANTES DE LA LLAMADA (/preparacion) ===============================
def preparacion():
    tres = [("Es una conversación", "Me cuentas qué te pasa, te escucho, y al final vemos juntas si tiene sentido seguir."),
            ("Todas las respuestas valen", "Habla como le contarías a una amiga. Lo que digas queda entre nosotras, y lo que prefieras guardarte, te lo guardas."),
            ("Del otro lado hay alguien que lo vivió", "Además de los veinte años de consultorio, mi propio cuerpo fue mi primer laboratorio: pasé por el mismo agotamiento que tú.")]
    t3 = "".join(f'<div class="step rv"><span class="sn">{i}</span><div><h3>{E(t)}</h3><p>{E(d)}</p></div></div>' for i, (t, d) in enumerate(tres, 1))
    cuatro = [("Busca un lugar tranquilo.", "Vamos a hablar de cosas que quizás nunca contaste en voz alta. Mejor sin nadie escuchando de fondo."),
              ("Bloquea los 30 minutos completos.", "Con el mail cerrado y sin reuniones pegadas. Es media hora para ti."),
              ("Usa auriculares.", "Se escucha mejor y te vas a sentir más cómoda para hablar."),
              ("Ven tal como estás.", "Tu historia es lo que necesito, y ya la tienes.")]
    c4 = "".join(f'<div class="step rv"><span class="sn">{i}</span><div><h3>{E(t)}</h3><p>{E(d)}</p></div></div>' for i, (t, d) in enumerate(cuatro, 1))
    wa_rep = U["wa"] + "?text=Hola%20Rosana%2C%20necesito%20reprogramar%20mi%20llamada."
    inner = f'''{CSS_VSL}
{bar(False)}
<section class="hero"><div class="wrap narrow">
 <div class="conf">{ic("ok")}<div><b>Listo. Tu llamada quedó agendada.</b><span>Te llegó un mail con el día, la hora y el link de la videollamada.</span></div></div>
 <span class="eyb">ANTES DE QUE HABLEMOS</span>
 <h1 style="font-size:clamp(38px,9vw,64px)">Mira este video de 30 segundos. Es lo único que te <em>pido.</em></h1>
 <p class="lead">Te cuento cómo va a ser nuestra conversación, para que llegues sabiendo qué esperar.</p>
 {vid(VIDEO_PREP, "Qué esperar · 30 s", "video", "0.6")}
</div></section>
<section class="sec white"><div class="wrap narrow">
 {lab("Lo que viene", "sesion")}
 <h2>Esos 30 minutos son tuyos.</h2>
 <p>Es media hora reservada para hablar de algo que probablemente vienes postergando hace años, porque siempre hubo algo más urgente.</p>
 <p>Vas a hablar tú y yo voy a escuchar, que es justo lo que casi nunca pasa en una consulta. Llegas como estás: sin análisis, sin registros, sin anotar lo que comiste.</p>
 <p>Al final te digo con honestidad si puedo ayudarte. Y si el método no es para ti, te digo quién puede.</p>
 <p class="big" style="margin-top:30px">«Mi trabajo empieza por escucharte.»</p>
</div></section>
<section class="sec"><div class="wrap">
 {lab("Para que llegues tranquila", "chispa")}
 <h2>Tres cosas que quiero que sepas.</h2>
 <div class="steps">{t3}</div>
</div></section>
<section class="sec white"><div class="wrap">
 {lab("El día de la llamada", "reloj")}
 <h2>Cómo llegar bien preparada.</h2>
 <div class="steps" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">{c4}</div>
 <div class="avs"><p class="el">SI NO PUEDES ASISTIR</p><h3>Avísame con 24 horas de anticipación.</h3><p>Con ese tiempo le ofrezco tu lugar a otra mujer que está esperando, y a ti te consigo otro horario. Cada semana hay solo cinco lugares.</p>
 {btn("Escribirme por WhatsApp para reprogramar", wa_rep, "cta sec2", "wa").replace('target="_top"', 'target="_blank" rel="noopener"')}</div>
</div></section>
<section class="sec coral final"><div class="wrap narrow">
 {lab("Mientras tanto", "play")}
 <h2>Si quieres ir entendiendo qué te pasa.</h2>
 <p class="lead">Grabé una clase de 11 minutos donde te explico, con biología y con objetos de mi consultorio, por qué comes por estrés. Las que la ven llegan a la llamada con las preguntas más afiladas.</p>
 {btn("Ver la clase de 11 minutos", U["clase"], "cta inv", "play")}
 <p class="micro">SIN COSTO · LA VES CUANDO QUIERAS</p>
</div></section>
{pie()}'''
    return page("NuPlan™ · Tu llamada está agendada", inner, js_vsl())



PAGES = {
    "nuplan-inicio.html": inicio,
    "nuplan-empresas.html": empresas,
    "nuplan-clase.html": clase,
    "nuplan-legales.html": legales,
    "nuplan-programa-encabezado.html": programa,
    "nuplan-programa-segundo-pago-encabezado.html": segundo_pago,
    "nuplan-programa-segundo-gracias.html": segundo_gracias,
    "nuplan-bienvenida.html": bienvenida,
    "nuplan-vsl.html": vsl,
    "nuplan-preparacion.html": preparacion,
}

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for name, fn in PAGES.items():
        html_ = fn()
        open(os.path.join(OUT, name), "w", encoding="utf-8").write(html_)
        print(f"{name}: {len(html_):,} bytes")
