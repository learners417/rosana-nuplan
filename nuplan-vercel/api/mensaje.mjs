// NuPlan · Ro le contesta a una consultante desde NuPlan → Programa (bloque 4).
// Solo el equipo. El mensaje queda en su hilo (programa_mensajes, con la sesión de quien
// contesta: la base decide si puede) y a ella le llega un mail con lo que le escribió.
//
//   POST { consultante, texto }  →  { ok, mensaje: { id, creado }, mail: "enviado" | "sin_config" | "sin_mail" | "error" }

import { leerJSON, origenPermitido, respuestaJSON, registrar, usuariaDeToken, esEquipo, ErrorDeAcceso, supabaseConToken } from "./_lib.mjs";
import { APP, MAIL_OK, mailNuPlan, mandarMail } from "./_correo.mjs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req) {
  if (!origenPermitido(req)) return respuestaJSON(403, { error: "Esto solo responde dentro de NuPlan." });
  let d;
  try {
    d = await leerJSON(req, 20000);
  } catch (e) {
    return respuestaJSON(400, { error: String((e && e.message) || e) });
  }
  let u;
  try {
    u = await usuariaDeToken(req, "mensaje");
  } catch (e) {
    return respuestaJSON(e instanceof ErrorDeAcceso ? e.status : 503, { error: e.message });
  }
  if (!(await esEquipo(u.token, u.id))) return respuestaJSON(403, { error: "Solo el equipo de NuPlan contesta desde acá." });
  const consultante = String(d.consultante || "");
  const texto = String(d.texto || "").trim().slice(0, 4000);
  if (!UUID.test(consultante)) return respuestaJSON(400, { error: "Falta a quién va el mensaje." });
  if (!texto) return respuestaJSON(400, { error: "Escribí el mensaje." });

  const g = await supabaseConToken("/rest/v1/programa_mensajes?select=id,creado", u.token, {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ consultante, de: "rosana", texto }),
    signal: AbortSignal.timeout(8000),
  }).catch(() => null);
  const filas = g && g.ok ? await g.json().catch(() => []) : null;
  if (!filas || !filas[0]) {
    const t = g ? await g.text().catch(() => "") : "";
    const falta = /programa_mensajes|schema cache|does not exist/i.test(t);
    registrar("mensaje_error", { status: g ? g.status : 0, error: t.slice(0, 200) });
    return respuestaJSON(falta ? 503 : 502, {
      error: falta ? "Falta correr el SQL del bloque 4 en Supabase. Avisale a Javo." : "No se pudo guardar el mensaje. Probá de nuevo en un minuto.",
    });
  }

  // a quién avisarle: el mail y el nombre con los que entra a su app
  let email = "", nombre = "";
  const p = await supabaseConToken(`/rest/v1/programa_estado?select=resumen&user_id=eq.${consultante}`, u.token, {
    signal: AbortSignal.timeout(8000),
  }).catch(() => null);
  if (p && p.ok) {
    const f = (await p.json().catch(() => []))[0];
    email = String((f && f.resumen && f.resumen.email) || "").toLowerCase();
    nombre = String((f && f.resumen && f.resumen.nombre) || "");
  }
  let mail = "sin_mail";
  const esCarta = /^\[\[carta\]\]/.test(texto);
  const cuerpo = texto.replace(/^\[\[carta\]\]\s*/, "");
  if (MAIL_OK.test(email)) {
    const primero = nombre.split(" ")[0] || "";
    const link = `${APP()}/mi-plan/?m=${encodeURIComponent(email)}`;
    const r = await mandarMail({
      para: email,
      asunto: esCarta ? "Tu carta de graduación" : "Rosana te contestó",
      html: mailNuPlan(esCarta ? {
        titulo: primero ? `${primero}, tu carta de graduación` : "Tu carta de graduación",
        parrafos: ["Rosana te escribió esta carta para cerrar tus 90 días:"],
        cita: cuerpo,
        boton: { texto: "Verla en mi app", url: link },
        pie: "Te queda guardada en tu app, en el día 85.",
      } : {
        titulo: primero ? `${primero}, te contestó Rosana` : "Te contestó Rosana",
        parrafos: ["Esto es lo que te escribió:"],
        cita: texto,
        boton: { texto: "Contestarle desde mi app", url: link },
        pie: "Lo tenés también en tu app, en la pestaña Rosana.",
      }),
      texto: esCarta
        ? `${primero ? primero + ", t" : "T"}u carta de graduación, de Rosana:\n\n${cuerpo}\n\nLa tenés en tu app: ${link}`
        : `${primero ? primero + ", te" : "Te"} contestó Rosana:\n\n${texto}\n\nContestale desde tu app: ${link}`,
    });
    mail = r.ok ? "enviado" : r.sinConfig ? "sin_config" : "error";
  }
  registrar("mensaje", { mail });
  return respuestaJSON(200, { ok: true, mensaje: filas[0], mail });
}
