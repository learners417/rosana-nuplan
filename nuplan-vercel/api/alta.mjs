// NuPlan · Alta de una consultante desde NuPlan → Programa (bloque 4).
// Solo el equipo. Guarda nombre y mail en programa_altas (con la sesión de quien la
// da de alta: la base decide si puede) y le manda el mail con el acceso a su app.
//
//   POST { nombre, email }  →  { ok, mail: "enviado" | "sin_config" | "error", link }

import { leerJSON, origenPermitido, respuestaJSON, registrar, usuariaDeToken, esEquipo, ErrorDeAcceso, supabaseConToken } from "./_lib.mjs";
import { APP, MAIL_OK, mailNuPlan, mandarMail } from "./_correo.mjs";

export async function POST(req) {
  if (!origenPermitido(req)) return respuestaJSON(403, { error: "Esto solo responde dentro de NuPlan." });
  let d;
  try {
    d = await leerJSON(req, 4000);
  } catch (e) {
    return respuestaJSON(400, { error: String((e && e.message) || e) });
  }
  let u;
  try {
    u = await usuariaDeToken(req, "alta");
  } catch (e) {
    return respuestaJSON(e instanceof ErrorDeAcceso ? e.status : 503, { error: e.message });
  }
  if (!(await esEquipo(u.token, u.id))) return respuestaJSON(403, { error: "Solo el equipo de NuPlan puede dar de alta." });

  const nombre = String(d.nombre || "").replace(/\s+/g, " ").trim().slice(0, 120);
  const email = String(d.email || "").trim().toLowerCase();
  if (nombre.length < 2) return respuestaJSON(400, { error: "Escribí su nombre y apellido." });
  if (!MAIL_OK.test(email) || email.length > 160) return respuestaJSON(400, { error: "Revisá el mail: así no le va a llegar." });

  const g = await supabaseConToken("/rest/v1/programa_altas?on_conflict=email", u.token, {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ email, nombre, creado_por: u.id }),
    signal: AbortSignal.timeout(8000),
  }).catch(() => null);
  if (!g || !g.ok) {
    const t = g ? await g.text().catch(() => "") : "";
    const falta = /programa_altas|schema cache|does not exist/i.test(t);
    registrar("alta_error", { status: g ? g.status : 0, error: t.slice(0, 200) });
    return respuestaJSON(falta ? 503 : 502, {
      error: falta ? "Falta correr el SQL del bloque 4 en Supabase. Avisale a Javo." : "No se pudo guardar el alta. Probá de nuevo en un minuto.",
    });
  }

  const link = `${APP()}/mi-plan/?m=${encodeURIComponent(email)}`;
  const primero = nombre.split(" ")[0];
  const parrafos = [
    "Ya tenés tu lugar en el programa de 90 días. Todo pasa en tu app: entrás desde el teléfono con tu mail y un código que te llega en el momento. Sin contraseña.",
    "La primera vez te hago unas preguntas cortas para conocerte. Te llevan 5 minutos.",
  ];
  const pie = "Guardá este mail: desde acá entrás siempre. Rosana Roldán · NuPlan";
  const r = await mandarMail({
    para: email,
    asunto: "Tu acceso al programa de Rosana Roldán",
    html: mailNuPlan({ titulo: `Hola, ${primero}`, parrafos, boton: { texto: "Entrar a mi app", url: link }, pie }),
    texto: `Hola, ${primero}\n\n${parrafos.join("\n\n")}\n\nEntrá acá: ${link}\n\n${pie}`,
  });
  let mail = r.ok ? "enviado" : r.sinConfig ? "sin_config" : "error";
  if (r.ok) {
    await supabaseConToken(`/rest/v1/programa_altas?email=eq.${encodeURIComponent(email)}`, u.token, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ mail_enviado: new Date().toISOString() }),
      signal: AbortSignal.timeout(8000),
    }).catch(() => null);
  }
  registrar("alta", { mail });
  return respuestaJSON(200, { ok: true, mail, link });
}
