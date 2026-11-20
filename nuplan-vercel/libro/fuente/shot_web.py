# Captura de las páginas con fuentes locales (en el sandbox no llegan las de Google).
import sys, asyncio, pathlib
from playwright.async_api import async_playwright
F = "/home/claude/libro-pdf/fonts/"
LOCAL = f"""<style>
@font-face{{font-family:"DM Sans";src:url("file://{F}DMSans-VF.ttf");font-weight:100 1000}}
@font-face{{font-family:"Space Mono";src:url("file://{F}SpaceMono-Regular.ttf")}}
</style>"""
async def main(src, out, w):
    html = pathlib.Path(src).read_text(encoding="utf-8").replace("</head>", LOCAL + "</head>")
    tmp = pathlib.Path("/tmp") / ("_shot_" + pathlib.Path(src).name)
    tmp.write_text(html, encoding="utf-8")
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--allow-file-access-from-files"])
        pg = await b.new_page(viewport={"width": w, "height": 900}, device_scale_factor=1)
        await pg.goto("file://" + str(tmp))
        await pg.wait_for_timeout(500)
        # que aparezca todo (el observador no corre sin scroll)
        await pg.evaluate("document.querySelectorAll('.rv').forEach(e=>e.classList.add('in'))")
        await pg.wait_for_timeout(900)
        sw = await pg.evaluate("document.documentElement.scrollWidth")
        small = await pg.evaluate("""() => { const out=[]; document.querySelectorAll('#nlb *').forEach(e=>{ if(!e.childNodes.length) return;
            const t=[...e.childNodes].some(n=>n.nodeType===3 && n.textContent.trim()); if(!t) return;
            const fs=parseFloat(getComputedStyle(e).fontSize); if(fs<15) out.push(e.tagName+'.'+e.className+':'+fs+':'+e.textContent.trim().slice(0,30)); }); return out; }""")
        print(pathlib.Path(src).name, w, "scrollWidth", sw, "· letra < 15 px:", small[:6])
        await pg.screenshot(path=out, full_page=True)
        await b.close()
asyncio.run(main(sys.argv[1], sys.argv[2], int(sys.argv[3])))
