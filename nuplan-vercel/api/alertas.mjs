// NuPlan · Aviso a Ro cuando una consultante pasa 2 días sin cargar nada (bloque 4).
// Lo llama Vercel una vez por día (vercel.json → crons), con CRON_SECRET.
// Un solo mail con todas las que se frenaron; a cada una se la avisa una vez por
// cada vez que se frena (si vuelve a cargar y se vuelve a frenar, se avisa de nuevo).
// Necesita en Vercel: CRON_SECRET y SUPABASE_SERVICE_ROLE_KEY.

import { respuestaJSON, registrar, restServicio, mandarAGHL, hoyArgentina } from "./_lib.mjs";
import { esc } from "./_correo.mjs";

const DIA = 86400000;

function diaDel(inicio, hoy) {
  const a = String(inicio || "").split("-"), h = String(hoy).split("-");
  if (a.length < 3) return 0;
  const n = Math.floor((Date.UTC(+h[0], +h[1] - 1, +h[2]) - Date.UTC(+a[0], +a[1] - 1, +a[2])) / DIA) + 1;
  return isNaN(n) ? 0 : n;
}
function fechaLarga(ts) {
  try {
    return new Date(ts).toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", timeZone: "America/Argentina/Buenos_Aires" });
  } catch {
    return String(ts).slice(0, 10);
  }
}

export async function GET(req) {
  const secreto = process.env.CRON_SECRET || "";
  if (!secreto) return respuestaJSON(503, { error: "Falta CRON_SECRET en Vercel." });
  if ((req.headers.get("authorization") || "") !== `Bearer ${secreto}`) return respuestaJSON(401, { error: "No autorizado." });

  const hoy = hoyArgentina();
  const limite = new Date(Date.now() - 2 * DIA).toISOString();
  const r = await restServicio(
    `/rest/v1/programa_estado?select=user_id,resumen,actualizado&actualizado=lt.${encodeURIComponent(limite)}&order=actualizado.asc&limit=1000`
  ).catch((e) => ({ error: String((e && e.message) || e) }));
  if (r.sinClave) return respuestaJSON(503, { error: "Falta la clave de servicio de Supabase en Vercel." });
  if (r.error) {
    registrar("alertas_error", { error: r.error.slice(0, 200) });
    return respuestaJSON(502, { error: "No se pudo leer el programa." });
  }
  // en curso: empezó hace al menos 2 días y todavía no terminó los 90
  const quietas = (r.datos || []).filter((f) => {
    const d = diaDel(f.resumen && f.resumen.inicio, hoy);
    return d >= 3 && d <= 90;
  });
  if (!quietas.length) return respuestaJSON(200, { ok: true, avisadas: 0 });

  const ids = quietas.map((f) => f.user_id).join(",");
  const ya = await restServicio(`/rest/v1/programa_alertas?select=user_id,ref&tipo=eq.inactiva&user_id=in.(${ids})`).catch((e) => ({
    error: String((e && e.message) || e),
  }));
  if (ya.error) {
    registrar("alertas_error", { error: ya.error.slice(0, 200) });
    return respuestaJSON(502, { error: "Falta correr el SQL del bloque 4 o no se pudo leer." });
  }
  const avisadas = new Set((ya.datos || []).map((x) => x.user_id + "|" + x.ref));
  const nuevas = quietas.filter((f) => !avisadas.has(f.user_id + "|" + f.actualizado));
  if (!nuevas.length) return respuestaJSON(200, { ok: true, avisadas: 0 });

  const lineas = nuevas.map((f) => {
    const s = f.resumen || {};
    return {
      nombre: s.nombre || "Sin nombre",
      detalle: `Va por el día ${diaDel(s.inicio, hoy)} de 90 · lo último que cargó fue el ${fechaLarga(f.actualizado)}`,
    };
  });
  const titulo = nuevas.length === 1 ? "Una consultante lleva 2 días sin cargar nada" : `${nuevas.length} consultantes llevan 2 días sin cargar nada`;
  const texto = `${titulo}\n\n` + lineas.map((l) => `${l.nombre}: ${l.detalle}`).join("\n") +
    "\n\nUn mensaje tuyo hoy la ayuda a volver. Le podés escribir desde NuPlan → Programa.";
  const html =
    '<div style="font-family:\'DM Sans\',Helvetica,Arial,sans-serif;color:#1a1a1a;background:#fff6f3;padding:26px 18px;line-height:1.6">' +
    '<div style="max-width:620px;margin:0 auto;background:#fff;border:1px solid #f6d9d1;border-radius:16px;padding:30px">' +
    '<p style="margin:0 0 6px;font-size:15px;letter-spacing:2px;text-transform:uppercase;color:#c53a1e;font-weight:700">Programa NuPlan</p>' +
    `<h1 style="margin:0 0 18px;font-size:24px;line-height:1.25">${esc(titulo)}</h1>` +
    lineas.map((l) =>
      '<div style="margin:0 0 10px;padding:13px 15px;background:#fff6f3;border-left:4px solid #e8472a;border-radius:0 10px 10px 0">' +
      `<p style="margin:0 0 3px;font-size:18px;font-weight:700">${esc(l.nombre)}</p><p style="margin:0;font-size:16px;color:#4b5563">${esc(l.detalle)}</p></div>`
    ).join("") +
    '<p style="margin:18px 0 0;font-size:17px">Un mensaje tuyo hoy la ayuda a volver. Le podés escribir desde NuPlan → Programa.</p>' +
    "</div></div>";
  try {
    await mandarAGHL({
      paso: "Sin cargar hace 2 días",
      asunto: titulo,
      nombre: "App NuPlan",
      email: "",
      fecha: hoy,
      mensaje: texto,
      mensaje_html: html,
      paso_slug: "alerta-inactividad",
      id_envio: `inactiva-${hoy}`,
    });
  } catch (e) {
    registrar("alertas_error", { error: String((e && e.message) || e).slice(0, 200) });
    return respuestaJSON(502, { error: "No salió el mail a Rosana. Se reintenta mañana." });
  }
  await restServicio("/rest/v1/programa_alertas", {
    method: "POST",
    headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
    body: JSON.stringify(nuevas.map((f) => ({ user_id: f.user_id, tipo: "inactiva", ref: f.actualizado }))),
  }).catch(() => null);
  registrar("alertas", { avisadas: nuevas.length });
  return respuestaJSON(200, { ok: true, avisadas: nuevas.length });
}
