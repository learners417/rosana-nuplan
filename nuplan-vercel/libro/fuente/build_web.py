# -*- coding: utf-8 -*-
# Embudo low de NuPlan · las cuatro páginas para El Consultorio (GHL), con la identidad de la app.
# Copy público en voseo, como habla Ro (20 nov 2026). El libro (imágenes) va en la voz de Ro.
import base64, html, json, os, sys
os.chdir(os.path.dirname(os.path.abspath(__file__)))
E = html.escape
BASE = os.path.dirname(os.path.abspath(__file__))
_anch = os.path.join(BASE, "anchors-solo.json")
ANCH = json.load(open(_anch if os.path.exists(_anch) else os.path.join(BASE, "..", "anchors-solo.json"), encoding="utf-8"))["anchors"]

# ---------- lo que se cambia en El Consultorio ----------
URL_PAGO = "https://metodo.nuplan.com.ar/libro-pago"      # página con el formulario de pago (libro + casilla)
URL_GRACIAS = "https://metodo.nuplan.com.ar/libro-gracias"
URL_AGENDA = "https://metodo.nuplan.com.ar/libro-agenda"   # después de pagar la sesión: elige el horario
URL_PDF = os.environ.get("URL_PDF", "PEGAR_LINK_DEL_PDF")      # el PDF de la edición sola
CAL_SESION = os.environ.get("CAL_SESION", "PEGAR_ID_DEL_CALENDARIO")  # calendario «Sesión 1-1 con Rosana» (el pago va antes, en el formulario)
PRECIO_LIBRO, PRECIO_SESION = "USD 27", "USD 97"
NOTA_PAGO = "Pagás en pesos con Mercado Pago."

IMG_BASE = os.environ.get("IMG_BASE", "")                # con IMG_BASE, las imágenes van por URL (para El Consultorio)
def b64(name):
    if IMG_BASE:
        return f"{IMG_BASE}{name}.webp"
    return "data:image/webp;base64," + base64.b64encode(open(os.path.join(BASE, "img", f"{name}.webp"), "rb").read()).decode()

# ---------- íconos (los del libro) ----------
P = {
 "tierra": '<path d="M3 5h18L12 20z"/><path d="M6.6 11h10.8"/>',
 "agua": '<path d="M3 5h18L12 20z"/>',
 "fuego": '<path d="M12 4l9 15H3z"/>',
 "aire": '<path d="M12 4l9 15H3z"/><path d="M6.6 13h10.8"/>',
 "libro": '<path d="M3 5.5c3-1.4 6-1.4 9 .5 3-1.9 6-1.9 9-.5V19c-3-1.4-6-1.4-9 .5-3-1.9-6-1.9-9-.5z"/><path d="M12 6v13.5"/>',
 "chispa": '<path d="M12 3.5c.7 4.6 3.4 7.3 8 8-4.6.7-7.3 3.4-8 8-.7-4.6-3.4-7.3-8-8 4.6-.7 7.3-3.4 8-8z"/>',
 "dado": '<rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="9" cy="9" r=".8"/><circle cx="15" cy="9" r=".8"/><circle cx="12" cy="12" r=".8"/><circle cx="9" cy="15" r=".8"/><circle cx="15" cy="15" r=".8"/>',
 "termo": '<path d="M10 4a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0z"/><path d="M12 9v7"/>',
 "carta": '<rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M9 8h6M9 12h6M9 16h3"/>',
 "pin": '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>',
 "check": '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8 12.5l3 3 5-6"/>',
 "ok": '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>',
 "sesion": '<circle cx="9" cy="8" r="3"/><circle cx="16.5" cy="9.5" r="2.4"/><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5M14 14.6c2.6-.4 5 1 5.6 4.4"/>',
 "lapiz": '<path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/>',
 "semana": '<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
 "flecha": '<path d="M5 12h14M13 6l6 6-6 6"/>',
}
def ic(n, cls="ic", color="currentColor", sw=1.8):
    return (f'<svg viewBox="0 0 24 24" class="{cls}" fill="none" stroke="{color}" stroke-width="{sw}" '
            f'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{P[n]}</svg>')

FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700;9..40,800&family=Space+Mono&display=swap" rel="stylesheet">'

CSS = """
#nlb{--bg:#fff6f3;--sf:#ffffff;--tx:#1a1a1a;--mu:#5f6672;--bd:#e5e7eb;--co:#e8472a;--cl:#f47a62;--ac:#f6a29a;--cd:#c53a1e;--ti:#fdebe6;
 font-family:"DM Sans",system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--tx);background:var(--bg);font-size:19px;line-height:1.6;
 -webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;overflow-x:hidden}
#nlb *{box-sizing:border-box;margin:0;padding:0}
#nlb img{display:block;max-width:100%;height:auto}
#nlb a{color:inherit}
#nlb .wrap{max-width:1080px;margin:0 auto;padding:0 22px}
#nlb .sec{padding:76px 0}
#nlb .white{background:var(--sf)}
#nlb .coral{background:var(--co);color:#fff}
#nlb .lab{display:flex;align-items:center;gap:9px;font-family:"Space Mono",monospace;font-size:15px;letter-spacing:.12em;text-transform:uppercase;color:var(--cd);margin-bottom:16px}
#nlb .coral .lab{color:var(--ti)}
#nlb .lab .ic{width:20px;height:20px}
#nlb h1{font-size:clamp(42px,11vw,78px);line-height:1.02;letter-spacing:-.025em;font-weight:800;color:var(--tx)}
#nlb h1 em{font-style:normal;color:var(--co)}
#nlb h2{font-size:clamp(31px,7.4vw,50px);line-height:1.08;letter-spacing:-.02em;font-weight:800;margin-bottom:22px}
#nlb h3{font-size:22px;line-height:1.25;font-weight:700}
#nlb p{margin-bottom:18px}
#nlb .lead{font-size:clamp(20px,2.6vw,23px);line-height:1.55;color:#33373d;max-width:640px}
#nlb .mu{color:var(--mu)}
#nlb .ic{width:26px;height:26px;flex:none}
/* barra */
#nlb .bar{display:flex;justify-content:space-between;align-items:center;padding:18px 22px;max-width:1080px;margin:0 auto;font-family:"Space Mono",monospace;font-size:15px;letter-spacing:.08em;color:var(--cd)}
#nlb .bar b{font-family:"DM Sans",sans-serif;font-size:20px;letter-spacing:0;color:var(--tx)}
#nlb .bar b span{color:var(--co)}
/* botón */
#nlb .cta{display:inline-flex;align-items:center;justify-content:center;gap:12px;background:var(--co);color:#fff;text-decoration:none;font-weight:800;font-size:21px;
 line-height:1.2;padding:21px 26px;border-radius:1rem;width:100%;box-shadow:0 14px 30px -12px rgba(197,58,30,.55);transition:transform .2s,background .2s;min-height:64px;text-align:center}
#nlb .cta:hover{background:var(--cd);transform:translateY(-2px)}
#nlb .cta .ic{width:24px;height:24px}
#nlb .cta.inv{background:#fff;color:var(--cd);box-shadow:0 14px 30px -12px rgba(90,20,8,.45)}
#nlb .micro{font-family:"Space Mono",monospace;font-size:15px;letter-spacing:.04em;color:var(--mu);margin-top:14px}
#nlb .coral .micro{color:var(--ti)}
/* héroe */
#nlb .hero{padding:26px 0 70px}
#nlb .hgrid{display:grid;gap:42px;align-items:center}
#nlb .eyb{font-family:"Space Mono",monospace;font-size:15px;letter-spacing:.14em;color:var(--cd);margin-bottom:18px;display:inline-block;background:var(--ti);padding:7px 13px;border-radius:.5rem}
#nlb .hero .lead{margin:22px 0 30px}
#nlb .chips{display:flex;flex-wrap:wrap;gap:10px;margin-top:26px}
#nlb .chip{display:inline-flex;align-items:center;gap:8px;background:var(--sf);border:1px solid var(--bd);border-radius:999px;padding:8px 15px;font-size:16px;font-weight:600}
#nlb .chip .ic{width:19px;height:19px;color:var(--co)}
/* libro 3D */
#nlb .bk3{--w:250px;--h:353px;--d:18px;position:relative;width:var(--w);height:var(--h);margin:10px auto 34px;perspective:1700px}
#nlb .bk{position:absolute;inset:0;transform-style:preserve-3d;transform:rotateY(-26deg) rotateX(5deg);transition:transform .5s ease-out;animation:nlbfloat 7s ease-in-out infinite}
#nlb .bkf,#nlb .bkb{position:absolute;inset:0;border-radius:3px 10px 10px 3px}
#nlb .bkf{background:var(--cover) center/cover no-repeat;transform:translateZ(calc(var(--d) / 2));box-shadow:inset 6px 0 9px -5px rgba(0,0,0,.3)}
#nlb .bkf::after{content:"";position:absolute;inset:0;border-radius:inherit;background:linear-gradient(105deg,rgba(255,255,255,0) 0%,rgba(255,255,255,.16) 34%,rgba(255,255,255,0) 58%,rgba(0,0,0,.08) 100%)}
#nlb .bkb{background:var(--cd);transform:translateZ(calc(var(--d) / -2)) rotateY(180deg)}
#nlb .bks{position:absolute;top:0;left:calc(var(--d) / -2);width:var(--d);height:100%;transform:rotateY(-90deg);background:linear-gradient(90deg,#b5321a,#d4432a 45%,#c53a1e)}
#nlb .bkp{position:absolute;top:4px;right:calc(var(--d) / -2);width:var(--d);height:calc(100% - 8px);transform:rotateY(90deg);background:repeating-linear-gradient(90deg,#fffaf7 0 2px,#eadfda 2px 3px)}
#nlb .bksh{position:absolute;left:8%;right:-4%;bottom:-26px;height:34px;border-radius:50%;background:radial-gradient(closest-side,rgba(140,35,15,.32),rgba(140,35,15,0));filter:blur(4px)}
@keyframes nlbfloat{0%,100%{translate:0 0}50%{translate:0 -8px}}
/* escena */
#nlb .quote{background:var(--co);color:#fff;border-radius:1.5rem;padding:34px 28px;margin:30px 0}
#nlb .quote p{font-size:clamp(27px,6vw,38px);line-height:1.15;font-weight:800;letter-spacing:-.015em;margin-bottom:14px}
#nlb .quote span{font-family:"Space Mono",monospace;font-size:15px;letter-spacing:.08em;color:var(--ti)}
#nlb .narrow{max-width:720px}
/* lista del libro */
#nlb .feat{display:grid;gap:14px;margin:30px 0 18px}
#nlb .fi{display:flex;gap:16px;align-items:flex-start;background:var(--bg);border-radius:1rem;padding:20px}
#nlb .white .fi{background:var(--bg)}
#nlb .fi .ic{width:30px;height:30px;color:var(--co);margin-top:2px}
#nlb .fi h3{margin-bottom:4px}
#nlb .fi p{margin:0;color:#3d4148;font-size:18px}
/* semana */
#nlb .spread{border-radius:1rem;overflow:hidden;box-shadow:0 30px 60px -28px rgba(120,40,20,.45);background:#e5d6d0;margin:8px 0 16px}
#nlb .cap{font-size:17px;color:var(--mu);text-align:center;margin-bottom:34px}
#nlb .strip{display:grid;grid-auto-flow:column;grid-auto-columns:46%;gap:14px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:10px;-webkit-overflow-scrolling:touch}
#nlb .th{scroll-snap-align:start}
#nlb .th img{border-radius:.75rem;box-shadow:0 14px 28px -16px rgba(120,40,20,.5);border:1px solid var(--bd)}
#nlb .th p{font-family:"Space Mono",monospace;font-size:15px;color:var(--cd);margin:10px 0 0;text-align:center}
/* dimensiones */
#nlb .dims{display:grid;gap:14px;grid-template-columns:1fr 1fr;margin-top:30px}
#nlb .dim{background:var(--sf);border-radius:1.5rem;padding:22px 18px;border:1px solid var(--bd)}
#nlb .dim .ic{width:38px;height:38px;color:var(--co);margin-bottom:12px}
#nlb .dim h3{font-size:21px}
#nlb .dim .el{font-family:"Space Mono",monospace;font-size:15px;color:var(--cd);margin:2px 0 10px}
#nlb .dim p{font-size:17px;line-height:1.45;margin:0;color:#3d4148}
/* camino */
#nlb .path{display:grid;gap:12px;margin-top:30px;counter-reset:n}
#nlb .st{display:flex;align-items:center;gap:16px;background:var(--bg);border-radius:1rem;padding:16px 18px}
#nlb .st .lt{flex:none;width:52px;height:52px;border-radius:50%;background:var(--cd);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:26px}
#nlb .st h3{font-size:20px}
#nlb .st .dd{font-family:"Space Mono",monospace;font-size:15px;color:var(--cd)}
#nlb .st p{margin:2px 0 0;font-size:17px;color:#3d4148;line-height:1.4}
/* termómetro */
#nlb .tcard{background:#fff;color:var(--tx);border-radius:1.5rem;padding:22px 16px;margin-top:30px;box-shadow:0 30px 60px -30px rgba(90,20,8,.6)}
#nlb .trow{display:grid;grid-template-columns:1fr repeat(3,58px);gap:8px;align-items:center;padding:12px 4px;border-bottom:1px dashed var(--ac)}
#nlb .trow:last-child{border-bottom:0}
#nlb .trow.h{font-family:"Space Mono",monospace;font-size:15px;color:var(--cd);text-align:center;border-bottom:1px solid var(--ac)}
#nlb .trow.h span:first-child{text-align:left}
#nlb .trow span{font-size:17px;font-weight:600;line-height:1.3}
#nlb .tb{height:44px;border:2px solid var(--ac);border-radius:.5rem;background:var(--bg)}
/* autora */
#nlb .agrid{display:grid;gap:26px}
#nlb .sig{font-family:"Space Mono",monospace;font-size:15px;color:var(--cd);letter-spacing:.06em}
#nlb .aq{font-size:clamp(26px,5.6vw,36px);font-weight:800;line-height:1.15;color:var(--co);letter-spacing:-.015em}
/* para quién */
#nlb .who{display:grid;gap:12px;margin-top:26px}
#nlb .wi{display:flex;gap:14px;align-items:flex-start;font-size:20px;line-height:1.45;font-weight:600;background:var(--bg);border-radius:1rem;padding:18px}
#nlb .wi .ic{color:var(--co);width:28px;height:28px;margin-top:1px}
/* oferta */
#nlb .offer{background:#fff;border-radius:1.5rem;padding:30px 22px;box-shadow:0 40px 80px -40px rgba(120,40,20,.5);border:1px solid var(--bd);display:grid;gap:26px;align-items:center}
#nlb .offer .bk3{--w:190px;--h:268px;--d:14px;margin:6px auto 26px}
#nlb .ot{font-size:clamp(28px,6vw,38px);font-weight:800;line-height:1.08;letter-spacing:-.02em}
#nlb .os{font-family:"Space Mono",monospace;font-size:15px;color:var(--cd);margin:10px 0 20px}
#nlb .inc{list-style:none;display:grid;gap:10px;margin-bottom:24px}
#nlb .inc li{display:flex;gap:12px;align-items:flex-start;font-size:18px;line-height:1.4}
#nlb .inc .ic{width:24px;height:24px;color:var(--co)}
#nlb .price{font-size:54px;font-weight:800;letter-spacing:-.02em;line-height:1;margin-bottom:8px}
#nlb .price small{font-size:20px;font-weight:700;color:var(--mu);letter-spacing:0}
#nlb .pnote{font-size:17px;color:var(--mu);margin-bottom:22px}
#nlb .offer .cta{width:100%}
/* preguntas */
#nlb details{background:var(--bg);border-radius:1rem;padding:0 20px;margin-bottom:12px}
#nlb summary{list-style:none;cursor:pointer;font-weight:700;font-size:20px;line-height:1.35;padding:20px 34px 20px 0;position:relative}
#nlb summary::-webkit-details-marker{display:none}
#nlb summary::after{content:"+";position:absolute;right:0;top:15px;font-size:30px;font-weight:400;color:var(--co)}
#nlb details[open] summary::after{content:"–"}
#nlb details p{font-size:18px;color:#3d4148;padding-bottom:20px;margin:0}
/* cierre */
#nlb .final{text-align:center}
#nlb .final h2{color:#fff}
#nlb .final .lead{color:#fff;margin:0 auto 30px}
#nlb .foot{text-align:center;font-family:"Space Mono",monospace;font-size:15px;color:var(--mu);padding:34px 22px;line-height:2.1}
#nlb .foot a{color:var(--cd);text-decoration:underline;text-underline-offset:3px;white-space:nowrap}
/* oferta única y gracias */
#nlb .conf{display:flex;gap:16px;align-items:center;background:var(--sf);border:1px solid var(--bd);border-radius:1.5rem;padding:22px 20px;margin:12px 0 30px}
#nlb .conf .ic{width:44px;height:44px;color:var(--co)}
#nlb .conf b{display:block;font-size:24px;line-height:1.2}
#nlb .conf span{font-size:18px;color:var(--mu)}
#nlb .once{display:inline-block;font-family:"Space Mono",monospace;font-size:15px;letter-spacing:.1em;background:var(--cd);color:#fff;border-radius:.5rem;padding:8px 13px;margin-bottom:18px}
#nlb .steps{display:grid;gap:14px;margin:28px 0}
#nlb .step{display:flex;gap:16px;align-items:flex-start;background:var(--sf);border-radius:1rem;padding:20px;border:1px solid var(--bd)}
#nlb .sn{flex:none;width:44px;height:44px;border-radius:50%;background:var(--ti);color:var(--cd);font-weight:800;font-size:20px;display:flex;align-items:center;justify-content:center}
#nlb .step h3{font-size:20px;margin-bottom:4px}
#nlb .step p{margin:0;font-size:18px;color:#3d4148}
#nlb .acu{background:var(--co);color:#fff;border-radius:1.5rem;padding:24px 22px;margin:8px 0 28px}
#nlb .acu .lab{color:var(--ti)}
#nlb .acu ol{list-style:none;display:grid;gap:10px;counter-reset:a}
#nlb .acu li{counter-increment:a;display:flex;gap:12px;align-items:center;background:rgba(255,255,255,.12);border-radius:.75rem;padding:12px 14px;font-size:18px;font-weight:600}
#nlb .acu li::before{content:counter(a);flex:none;width:32px;height:32px;border-radius:50%;background:#fff;color:var(--cd);display:flex;align-items:center;justify-content:center;font-weight:800}
#nlb .cred{border:2px dashed var(--ac);border-radius:1.5rem;padding:22px;margin-bottom:28px;background:var(--sf)}
#nlb .cred p{margin:0;font-size:19px}
#nlb .calw{background:var(--sf);border-radius:1.5rem;border:1px solid var(--bd);padding:10px;min-height:120px}
#nlb .calph{display:flex;align-items:center;justify-content:center;text-align:center;min-height:220px;font-family:"Space Mono",monospace;font-size:15px;color:var(--mu);padding:20px}
#nlb .no{display:block;text-align:center;margin:26px 0 6px;font-size:18px;color:var(--mu);text-decoration:underline;text-underline-offset:4px}
#nlb .firma{margin-top:30px;font-weight:700;font-size:20px}
#nlb .firma span{display:block;font-family:"Space Mono",monospace;font-weight:400;font-size:15px;color:var(--cd);margin-top:4px}
#nlb .dl{width:100%;margin:6px 0 12px}
#nlb .day1{display:grid;gap:12px;margin:24px 0}
#nlb .ph{display:flex;gap:18px;align-items:center;background:#fff;border:1px solid var(--bd);border-radius:1.5rem;padding:16px 18px;margin-bottom:18px}
#nlb .ph img{width:76px;border-radius:4px 8px 8px 4px;box-shadow:0 10px 20px -10px rgba(120,40,20,.5)}
#nlb .ph b{display:block;font-size:20px;line-height:1.25}
#nlb .ph span{font-size:17px;color:var(--mu)}
/* aparición */
#nlb .rv{opacity:0;transform:translateY(22px);transition:opacity .7s ease,transform .7s ease}
#nlb .rv.in{opacity:1;transform:none}
@media (min-width:760px){
 #nlb{font-size:20px}
 #nlb .sec{padding:104px 0}
 #nlb .hgrid{grid-template-columns:1.15fr .85fr}
 #nlb .cta{width:auto}
 #nlb .offer .cta,#nlb .dl{width:100%}
 #nlb .bk3{--w:300px;--h:424px;--d:22px}
 #nlb .feat{grid-template-columns:1fr 1fr}
 #nlb .strip{grid-auto-flow:row;grid-template-columns:repeat(6,1fr);grid-auto-columns:auto;overflow:visible}
 #nlb .dims{grid-template-columns:repeat(4,1fr)}
 #nlb .path{grid-template-columns:1fr 1fr 1fr}
 #nlb .trow{grid-template-columns:1fr repeat(3,90px);padding:14px 10px}
 #nlb .tcard{padding:28px 30px}
 #nlb .agrid{grid-template-columns:1.2fr .8fr;align-items:center}
 #nlb .who{grid-template-columns:1fr 1fr}
 #nlb .offer{grid-template-columns:.8fr 1.2fr;padding:44px}
 #nlb .steps{grid-template-columns:1fr 1fr 1fr}
}
@media (prefers-reduced-motion:reduce){#nlb .bk{animation:none}#nlb .rv{opacity:1;transform:none;transition:none}}
"""

JS = """<script>(function(){var r=document.getElementById('nlb');if(!r)return;
var els=r.querySelectorAll('.rv');
if(!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in')});}
else{var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);}})},{threshold:.12});
els.forEach(function(e){io.observe(e)});setTimeout(function(){els.forEach(function(e){e.classList.add('in')})},2600);}
if(window.matchMedia&&window.matchMedia('(hover:hover) and (pointer:fine)').matches){r.querySelectorAll('.bk3').forEach(function(w){var b=w.querySelector('.bk');
w.addEventListener('mousemove',function(ev){var q=w.getBoundingClientRect(),x=(ev.clientX-q.left)/q.width-.5,y=(ev.clientY-q.top)/q.height-.5;b.style.transform='rotateY('+(-26+x*22)+'deg) rotateX('+(5-y*12)+'deg)';});
w.addEventListener('mouseleave',function(){b.style.transform='';});});}
})();</script>"""

GHL_CSS = """
.c-section:has(#nlb){padding:0!important;margin:0!important;background:transparent!important}
.c-section:has(#nlb)>.inner{max-width:none!important;width:100%!important;padding:0!important}
.c-row:has(#nlb){padding:0!important;margin:0!important;max-width:none!important}
.c-row:has(#nlb)>.inner{max-width:none!important;padding:0!important}
.c-column:has(#nlb),.c-column:has(#nlb)>.inner{padding:0!important;margin:0!important}
.c-custom-code:has(#nlb){padding:0!important;margin:0!important}
#preview-container,.hl_page-preview--content{background:#fff6f3!important}
#nlb title{display:none}
.c-order-form,.c-order-form *:not(i):not(svg):not(path):not([class*="icon"]):not([class*="fa-"]){font-family:"DM Sans",system-ui,-apple-system,"Segoe UI",sans-serif!important}
.c-order-form .order-form__prod-name,.c-order-form .order-form__prod-price{white-space:normal!important}
.c-order-form .order-form__prod-price{text-align:right}
"""

def page(title, inner, cover=True, bare=False):
    var = f'style="--cover:url({b64("cover")})"' if cover else ""
    if bare:  # va en la misma página que otro bloque que ya trae estilos y fuentes
        return f'<div id="nlb">{inner}</div>'

    return (f'<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            f'<title>{E(title)}</title>{FONTS}<style>html,body{{margin:0;background:#fff6f3}}{GHL_CSS}{CSS}</style></head>'
            f'<body><div id="nlb" {var}>{inner}</div>{JS}</body></html>')

def book3d():
    return '<div class="bk3" aria-hidden="true"><div class="bk"><div class="bkb"></div><div class="bkp"></div><div class="bks"></div><div class="bkf"></div></div><div class="bksh"></div></div>'

BAR = '<div class="bar"><b>Nu<span>Plan</span>™</b><span>LIC. ROSANA ROLDÁN</span></div>'
MET = "https://metodo.nuplan.com.ar"
FOOT = (f'<p class="foot">NuPlan™ · Lic. Rosana Roldán · M.N. 3884<br>'
        f'<a href="{MET}/legales#arrepentimiento" target="_top">Botón de arrepentimiento</a> · '
        f'<a href="{MET}/legales#baja" target="_top">Botón de baja</a> · '
        f'<a href="{MET}/legales" target="_top">Términos y privacidad</a></p>')

def cta(texto="Quiero recuperar mi energía", cls="cta", href=URL_PAGO):
    return f'<a class="{cls}" href="{href}" target="_top">{E(texto)}{ic("flecha")}</a>'

# ---------- 1 · landing del libro ----------
FEAT = [("chispa", "90 invitaciones", "Una por día, de 5 a 10 minutos, para probar en tu vida real."),
        ("libro", "12 capítulos", "Uno por semana: una historia del consultorio, lo que hay debajo y tu regla."),
        ("dado", "6 juegos", "Para entender tu forma de comer sin culparte."),
        ("termo", "Tu energía, medida", "El día 1, el 43 y el 90, con los mismos cinco números."),
        ("carta", "8 cartas de rescate", "Para recortar y tener a mano en los momentos difíciles."),
        ("pin", "Un afiche para la heladera", "Cuatro pasos para las nueve de la noche.")]
THUMBS = [("cap", "El capítulo"), ("frase", "La frase"), ("juego", "El juego"), ("termo", "Tu termómetro"), ("cartas", "Tus cartas"), ("afiche", "El afiche")]
DIMS = [("tierra", "Física", "Tierra", "Qué comés, cuánto y cuándo. Lo concreto del plato."),
        ("agua", "Emocional", "Agua", "Lo que fluye por debajo: qué te lleva a comer."),
        ("fuego", "Energética", "Fuego", "Tus ritmos, tu descanso, cómo llegás a la noche."),
        ("aire", "Mental", "Aire", "Tu voz interna: lo que te decís antes y después de comer.")]
CAMINO = [("N", "Nutrir", "Días 1 a 14", "Mirar cómo comés, sin cambiar nada."),
          ("U", "Unir", "Días 15 a 28", "Entender qué hay debajo del hambre."),
          ("P", "Personalizar", "Días 29 a 42", "Armar tu forma de comer, no la de nadie."),
          ("L", "Liberar", "Días 43 a 56", "Que un desliz deje de ser el final."),
          ("A", "Activar", "Días 57 a 70", "Juntar pruebas de lo que ya cambió."),
          ("N", "Naturalizar", "Días 71 a 90", "Quedarte con tus propias reglas.")]
TERMO = ["Energía al despertar", "Energía a las seis de la tarde", "Cómo dormís", "Paz con la comida", "Cuánto disfrutás comer"]
WHO = ["Llegás a la tarde sin batería y a la noche comés lo que encontrás.", "Ya probaste planes y volviste a lo de antes.",
       "Comés rápido, parada o frente a una pantalla.", "Querés entender qué te pasa con la comida, a tu ritmo."]
INC = ["90 invitaciones, una para cada día", "12 capítulos con historias del consultorio", "6 juegos con sus soluciones",
       "Tu termómetro del día 1, el 43 y el 90", "8 cartas de rescate y el afiche de la heladera", "170 páginas para completar en la pantalla o imprimir"]
FAQ = [("¿Trae menús o listas de comidas?", "Trae algo que te sirve más: una invitación por día para mirar cómo comés y un capítulo por semana para entender por qué. Lo que comés lo vas eligiendo vos, con lo que descubrís."),
       ("¿Cuánto tiempo me lleva?", "De 5 a 10 minutos por día, y media hora el día que cerrás la semana con el capítulo."),
       ("¿Cómo lo recibo?", "Apenas pagás, te llega a tu correo. Es un PDF que completás en la pantalla o imprimís."),
       ("¿Y si un día no puedo?", "Seguís al día siguiente. No se empieza de nuevo el lunes."),
       ("¿Cómo pago?", "Con tarjeta, en pesos, por Mercado Pago."),
       ("¿Reemplaza una consulta?", "Es un libro para mirar cómo comés, no una indicación médica. Si tenés un diagnóstico o estás en tratamiento, seguí con quien te atiende."),
       ("¿Y si quiero hacerlo acompañada?", "Al final del libro te cuento cómo es el programa NuPlan, con la app y conmigo.")]

def landing():
    feat = "".join(f'<div class="fi rv">{ic(i)}<div><h3>{E(t)}</h3><p>{E(d)}</p></div></div>' for i, t, d in FEAT)
    thumbs = "".join(f'<div class="th"><img src="{b64(n)}" alt="{E(c)} del libro" width="320"><p>{E(c)}</p></div>' for n, c in THUMBS)
    dims = "".join(f'<div class="dim rv">{ic(i, sw=1.6)}<h3>{E(d)}</h3><p class="el">{E(el)}</p><p>{E(t)}</p></div>' for i, d, el, t in DIMS)
    camino = "".join(f'<div class="st rv"><span class="lt">{L}</span><div><h3>{E(n)}</h3><span class="dd">{E(dd)}</span><p>{E(t)}</p></div></div>' for L, n, dd, t in CAMINO)
    termo = '<div class="trow h"><span>Tu termómetro</span><span>Día 1</span><span>Día 43</span><span>Día 90</span></div>'
    termo += "".join(f'<div class="trow"><span>{E(t)}</span><i class="tb"></i><i class="tb"></i><i class="tb"></i></div>' for t in TERMO)
    who = "".join(f'<div class="wi rv">{ic("check")}<span>{E(w)}</span></div>' for w in WHO)
    inc = "".join(f'<li>{ic("ok")}<span>{E(x)}</span></li>' for x in INC)
    faq = "".join(f'<details><summary>{E(q)}</summary><p>{E(a)}</p></details>' for q, a in FAQ)
    inner = f"""{BAR}
<section class="hero"><div class="wrap hgrid">
 <div><span class="eyb">LIBRO DIGITAL · 90 DÍAS</span>
  <h1>Un libro para llegar a la noche <em>con energía</em></h1>
  <p class="lead">Noventa días, un ejercicio chico por día, en tu vida real. Lo escribí para las mujeres que viven aceleradas y comen por estrés.</p>
  {cta()}<p class="micro">{PRECIO_LIBRO} · lo recibís en tu correo al instante</p>
  <div class="chips"><span class="chip">{ic("chispa")}90 invitaciones</span><span class="chip">{ic("libro")}12 capítulos</span><span class="chip">{ic("dado")}6 juegos</span></div>
 </div>
 <div>{book3d()}</div>
</div></section>

<section class="sec white"><div class="wrap narrow">
 <p class="lab">{ic("semana")}Lo que se repite</p>
 <h2 class="rv">Son las nueve de la noche y abrís la heladera</h2>
 <p class="lead rv">No tenés hambre: tenés un día entero encima. Un café de desayuno, un almuerzo entre dos reuniones, la batería en cero a las seis de la tarde. Comés parada, rápido, sin mirar. Y te prometés empezar de nuevo mañana.</p>
 <div class="quote rv"><p>El hambre de la noche se arma a la mañana.</p><span>ROSANA ROLDÁN</span></div>
 <p class="lead rv">La voluntad no es lo que te falta: dirigís un equipo, sostenés una casa y llegás a todo. Lo que pasa a las nueve tiene un orden, y se puede mirar. Para eso escribí este libro: para que mires qué estás comiendo de verdad, un día a la vez.</p>
</div></section>

<section class="sec"><div class="wrap">
 <p class="lab">{ic("libro")}El libro</p>
 <h2 class="rv">Un libro para hacer, no para leer y guardar</h2>
 <div class="feat">{feat}</div>
 <p class="mu rv">Son 170 páginas que completás en la pantalla o imprimís.</p>
</div></section>

<section class="sec white"><div class="wrap">
 <p class="lab">{ic("semana")}Por dentro</p>
 <h2 class="rv">Así es una semana</h2>
 <div class="spread rv"><img src="{b64("spread")}" alt="Una semana del libro: siete días con su invitación y su casilla" width="1126"></div>
 <p class="cap rv">Cada día, una invitación con su casilla. El séptimo, cerrás la semana con el capítulo.</p>
 <div class="strip">{thumbs}</div>
</div></section>

<section class="sec"><div class="wrap">
 <p class="lab">{ic("chispa")}El método</p>
 <h2 class="rv">Comer tiene cuatro dimensiones</h2>
 <p class="lead rv">Todo lo que probaste hasta hoy trabajó una sola: qué comés. Es como pintar arriba de una pared con humedad: queda linda unas semanas y después vuelve a salir la mancha. En el libro trabajás las cuatro, en orden.</p>
 <div class="dims">{dims}</div>
</div></section>

<section class="sec white"><div class="wrap">
 <p class="lab">{ic("flecha")}El camino</p>
 <h2 class="rv">De la N a la N, en 90 días</h2>
 <div class="path">{camino}</div>
</div></section>

<section class="sec coral"><div class="wrap narrow">
 <p class="lab">{ic("termo", color="#fdebe6")}Medible</p>
 <h2 class="rv" style="color:#fff">Tu cambio, en números tuyos</h2>
 <p class="lead rv" style="color:#fff">El día 1 completás tu termómetro: cinco números del 0 al 10. Lo repetís el día 43 y el día 90. No te lo cuento yo: lo ves vos.</p>
 <div class="tcard rv">{termo}</div>
</div></section>

<section class="sec"><div class="wrap agrid">
 <div class="rv"><p class="lab">{ic("lapiz")}Quién lo escribió</p>
  <h2>Lic. Rosana Roldán</h2>
  <p>Licenciada en Nutrición por la Universidad de Buenos Aires (M.N. 3884), con más de veinte años de consultorio. Lleva programas de salud en empresas desde 2005, y se formó en nutrición clínica, en abordaje grupal de enfermedades crónicas, en ayurveda, en mindfulness nutricional y en coaching.</p>
  <p>Creó NuPlan™, el método de nutrición en cuatro dimensiones, después de ver durante años lo mismo: una consulta de cuatro minutos y una hoja no cambian nada. Lo que cambia es mirar qué estás comiendo de verdad.</p></div>
 <div class="rv"><p class="aq">«¿Qué estás comiendo de verdad?»</p><p class="sig">— ROSANA ROLDÁN</p></div>
</div></section>

<section class="sec white"><div class="wrap">
 <p class="lab">{ic("check")}Para quién es</p>
 <h2 class="rv">Es para vos si…</h2>
 <div class="who">{who}</div>
</div></section>

<section class="sec" id="libro"><div class="wrap">
 <div class="offer rv">
  <div>{book3d()}</div>
  <div><p class="ot">Recuperá tu energía en 90 días</p><p class="os">LIBRO DIGITAL · 170 PÁGINAS · LIC. ROSANA ROLDÁN</p>
   <ul class="inc">{inc}</ul>
   <p class="price">{PRECIO_LIBRO}</p><p class="pnote">{NOTA_PAGO} Lo recibís en tu correo al instante.</p>
   {cta()}</div>
 </div>
</div></section>

<section class="sec white"><div class="wrap narrow">
 <p class="lab">{ic("chispa")}Preguntas</p>
 <h2 class="rv">Lo que suelen preguntarme</h2>
 {faq}
</div></section>

<section class="sec coral final"><div class="wrap narrow">
 <h2 class="rv">Tu día 1 puede ser hoy</h2>
 <p class="lead rv">Una invitación chica, cinco minutos, y la casilla marcada.</p>
 {cta(cls="cta inv")}<p class="micro">{PRECIO_LIBRO} · libro digital</p>
</div></section>
{FOOT}"""
    return page("Recuperá tu energía en 90 días · el libro de NuPlan", inner)

# ---------- 2 · encabezado de la página de pago (va arriba del formulario nativo) ----------
def pago_header():
    inner = f"""{BAR}
<div class="wrap" style="padding-bottom:10px">
 <div class="ph"><img src="{b64("cover")}" alt="Tapa del libro" width="76"><div><b>Recuperá tu energía en 90 días</b><span>Libro digital · 170 páginas · lo recibís en tu correo al instante.</span></div></div>
 <p class="mu" style="font-size:17px;margin:0">{NOTA_PAGO}</p>
</div>{FOOT}"""
    return page("Tu libro · pago", inner, cover=False)

# ---------- 3 · oferta única: la sesión (va arriba del formulario nativo de la sesión) ----------
def sesion():
    pasos = [("Antes", "Me mandás tu termómetro del día 1 y la curva de energía de tu apertura. Así llego a la sesión sabiendo de vos."),
             ("En la sesión", "Miramos juntas en qué dimensión se te va la energía: física, emocional, energética o mental, y qué la dispara."),
             ("Al final", "Te llevás tus 3 acuerdos para las próximas dos semanas, escritos, con día y hora.")]
    steps = "".join(f'<div class="step rv"><span class="sn">{i}</span><div><h3>{E(t)}</h3><p>{E(d)}</p></div></div>' for i, (t, d) in enumerate(pasos, 1))
    inner = f"""{BAR}
<section class="hero" style="padding-top:8px;padding-bottom:10px"><div class="wrap narrow">
 <div class="conf">{ic("ok")}<div><b>Listo, tu libro va en camino</b><span>Te llega a tu correo en unos minutos.</span></div></div>
 <span class="once">UNA SOLA VEZ</span>
 <h1 style="font-size:clamp(38px,9vw,64px)">Tu primera sesión <em>conmigo</em></h1>
 <p class="lead" style="margin-top:18px">45 minutos por videollamada para mirar juntas tu forma de comer y salir con un plan para las próximas dos semanas. Esta propuesta aparece solo ahora.</p>
 <div class="steps">{steps}</div>
 <div class="acu rv"><p class="lab">{ic("lapiz", color="#fdebe6")}Con lo que salís</p><ol><li>Tu primer acuerdo, con día y hora</li><li>Tu segundo acuerdo, con día y hora</li><li>Tu tercer acuerdo, con día y hora</li></ol></div>
 <div class="cred rv"><p><b>Y si después querés hacer el programa NuPlan conmigo</b>, los {PRECIO_SESION} de esta sesión se descuentan si entrás en los 7 días siguientes.</p></div>
 <p class="price rv">{PRECIO_SESION}</p>
 <p class="pnote rv">{NOTA_PAGO} Completas tus datos aquí abajo y en el paso siguiente elegís tu horario. Tengo cuatro horarios por semana para estas sesiones.</p>
</div></section>"""
    return page("Tu primera sesión con Rosana", inner, cover=False)

# ---------- 3b · pie de la página de la sesión (va debajo del formulario) ----------
def sesion_pie():
    inner = f"""<div class="wrap narrow" style="padding-bottom:40px">
 <a class="no" href="{URL_GRACIAS}" target="_top">No, gracias. Prefiero empezar con el libro.</a>
 <p class="firma">Lic. Rosana Roldán<span>NUPLAN™ · M.N. 3884</span></p>
</div>{FOOT}"""
    return page("Tu primera sesión con Rosana · pie", inner, cover=False, bare=True)

# ---------- 3c · agenda: después de pagar la sesión ----------
def agenda():
    inner = f"""{BAR}
<section class="hero" style="padding-top:8px"><div class="wrap narrow">
 <div class="conf">{ic("ok")}<div><b>Listo, tu sesión está reservada</b><span>Ahora elegí el día y la hora.</span></div></div>
 <h1 style="font-size:clamp(38px,9vw,60px)">Elegí tu <em>horario</em></h1>
 <p class="lead" style="margin-top:18px">45 minutos por videollamada. Apenas elegís, te llega la confirmación a tu correo con el link para entrar.</p>
 <div class="calw rv" id="cal" style="margin-top:26px"></div>
 <p class="firma">Nos vemos pronto.<span>LIC. ROSANA ROLDÁN · NUPLAN™</span></p>
</div></section>{FOOT}
<script>(function(){{var ID="{CAL_SESION}",w=document.getElementById('cal');if(!w)return;
if(ID.indexOf('PEGAR')===0){{w.innerHTML='<div class="calph">Acá va el calendario de la sesión.</div>';return;}}
w.innerHTML='<iframe src="https://api.leadconnectorhq.com/widget/booking/'+ID+'" style="width:100%;border:none;overflow:hidden;min-height:680px" scrolling="no" id="'+ID+'_nlb"></iframe>';
var s=document.createElement('script');s.src='https://link.msgsndr.com/js/form_embed.js';document.body.appendChild(s);}})();</script>"""
    return page("Elegí tu horario · sesión con Rosana", inner, cover=False)

# ---------- 4 · gracias ----------
def gracias():
    dia1 = [("Dibuja tu curva de energía", f"Pág. {ANCH['apertura-ex']}. Como es hoy, no como te gustaría."),
            ("Completá tu termómetro del día 1", f"Pág. {ANCH['termo1']}. Cinco números, sin pensarlo mucho."),
            ("Hacé tu primera invitación", f"Pág. {ANCH['semana1']}. Y marcá la casilla.")]
    d1 = "".join(f'<div class="step"><span class="sn">{i}</span><div><h3>{E(t)}</h3><p>{E(d)}</p></div></div>' for i, (t, d) in enumerate(dia1, 1))
    inner = f"""{BAR}
<section class="hero" style="padding-top:8px"><div class="wrap narrow">
 <div class="ph"><img src="{b64("cover")}" alt="Tapa del libro" width="76"><div><b>Listo. Ya es tuyo.</b><span>También te lo mandé a tu correo.</span></div></div>
 <a class="cta dl" href="{URL_PDF}" target="_blank" rel="noopener">Descargar mi libro{ic("flecha")}</a>
 <h2 class="rv" style="margin-top:44px">Tu día 1, hoy</h2>
 <div class="day1">{d1}</div>
 <div class="cred rv"><p><b>Si reservaste tu sesión</b>, te llega la confirmación con el link de la videollamada.</p></div>
 <div class="cred rv"><p><b>Si elegiste que te escriba cada mañana</b>, el primer mail te llega a la mañana, entre las 7 y las 8.</p></div>
 <p class="firma">Nos vemos en el día 1.<span>LIC. ROSANA ROLDÁN · NUPLAN™</span></p>
</div></section>
{FOOT}"""
    return page("Tu libro · gracias", inner, cover=False)

OUT = {"nuplan-libro-landing.html": landing, "nuplan-libro-pago-encabezado.html": pago_header,
       "nuplan-libro-sesion.html": sesion, "nuplan-libro-sesion-pie.html": sesion_pie,
       "nuplan-libro-agenda.html": agenda, "nuplan-libro-gracias.html": gracias}
if __name__ == "__main__":
    out_dir = os.environ.get("OUT_DIR", ".")
    for name, fn in OUT.items():
        h = fn()
        open(os.path.join(out_dir, name), "w", encoding="utf-8").write(h)
        print(name, len(h) // 1024, "KB")
