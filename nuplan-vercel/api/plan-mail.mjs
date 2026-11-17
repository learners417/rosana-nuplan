// NuPlan · «Mandar por mail» el plan alimentario (bloque 5, A20).
// Solo el equipo. Le llega a la persona desde rosana@nuplan.com.ar con el plan completo
// (para leer en el teléfono o imprimir), a quien lo manda le llega una copia, y queda la
// constancia en el plan guardado (input.envios).
//
//   POST { docId, para, html, texto }  →  { ok, mail: "enviado" | "sin_config" | "error", envio }

import { leerJSON, origenPermitido, respuestaJSON, registrar, usuariaDeToken, esEquipo, ErrorDeAcceso, supabaseConToken } from "./_lib.mjs";
import { MAIL_OK, esc, mandarMail } from "./_correo.mjs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// El cuerpo lo arma NuPlan; igual se limpia: nada que se ejecute ni que cargue cosas de afuera.
function limpiar(html) {
  return String(html || "")
    .replace(/<(script|style|iframe|object|embed|form|input|button|link|meta)\b[\s\S]*?(<\/\1>|>)/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*("|')\s*(javascript|data):[^"']*\2/gi, "")
    .slice(0, 400000);
}

export async function POST(req) {
  if (!origenPermitido(req)) return respuestaJSON(403, { error: "Esto solo responde dentro de NuPlan." });
  let d;
  try {
    d = await leerJSON(req, 450000);
  } catch (e) {
    return respuestaJSON(400, { error: String((e && e.message) || e) });
  }
  let u;
  try {
    u = await usuariaDeToken(req, "plan-mail");
  } catch (e) {
    return respuestaJSON(e instanceof ErrorDeAcceso ? e.status : 503, { error: e.message });
  }
  if (!(await esEquipo(u.token, u.id))) return respuestaJSON(403, { error: "Solo el equipo de NuPlan manda planes." });
  const docId = String(d.docId || "");
  const para = String(d.para || "").trim().toLowerCase();
  if (!UUID.test(docId)) return respuestaJSON(400, { error: "Primero se tiene que guardar el plan." });
  if (!MAIL_OK.test(para) || para.length > 160) return respuestaJSON(400, { error: "Revisá el mail: así no le va a llegar." });
  const cuerpo = limpiar(d.html);
  if (cuerpo.length < 50) return respuestaJSON(400, { error: "El plan llegó vacío. Volvé a abrirlo y probá de nuevo." });

  // el plan tiene que existir y verse con esta sesión (la base decide)
  const g = await supabaseConToken(`/rest/v1/generated_documents?select=id,patient_name,input&id=eq.${docId}`, u.token, {
    signal: AbortSignal.timeout(8000),
  }).catch(() => null);
  const doc = g && g.ok ? (await g.json().catch(() => []))[0] : null;
  if (!doc) return respuestaJSON(404, { error: "No encontré ese plan guardado. Volvé a abrirlo desde Planes guardados." });

  const nombre = String(doc.patient_name || "").trim();
  const primero = nombre.split(" ")[0];
  const fecha = new Date().toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Argentina/Buenos_Aires" });
  const html =
    '<div style="font-family:\'DM Sans\',Helvetica,Arial,sans-serif;color:#1a1a1a;background:#fff6f3;padding:24px 12px;line-height:1.55">' +
    '<div style="max-width:680px;margin:0 auto;background:#fff;border:1px solid #f6d9d1;border-radius:16px;padding:26px 22px">' +
    '<p style="margin:0 0 6px;font-size:15px;letter-spacing:2px;text-transform:uppercase;color:#c53a1e;font-weight:700">Plan alimentario</p>' +
    `<h1 style="margin:0 0 6px;font-size:26px;line-height:1.25">${esc(nombre || "Tu plan")}</h1>` +
    `<p style="margin:0 0 20px;padding-bottom:14px;border-bottom:2px solid #e8472a;font-size:16px;color:#4b5563">${esc(fecha)} · Lic. Rosana Roldán</p>` +
    cuerpo +
    '<p style="margin:26px 0 0;padding-top:14px;border-top:1px solid #e5e7eb;font-size:15px;color:#6b7280">Para imprimirlo, imprimí este mail. Cualquier duda, respondé este mail o escribile a Rosana.</p>' +
    "</div></div>";
  const copia = [u.email, process.env.NUPLAN_MAIL_COPIA || ""].map((x) => String(x || "").toLowerCase()).filter((x, i, a) => MAIL_OK.test(x) && x !== para && a.indexOf(x) === i);
  const r = await mandarMail({
    para,
    copia,
    asunto: primero ? `${primero}, tu plan alimentario` : "Tu plan alimentario",
    html,
    texto: `${nombre ? nombre + "\n" : ""}Plan alimentario · ${fecha} · Lic. Rosana Roldán\n\n${String(d.texto || "").slice(0, 60000)}`,
  });
  const mail = r.ok ? "enviado" : r.sinConfig ? "sin_config" : "error";
  let envio = null;
  if (r.ok) {
    envio = { a: para, fecha: new Date().toISOString(), por: u.email || "", copia };
    const input = doc.input && typeof doc.input === "object" ? doc.input : {};
    const envios = Array.isArray(input.envios) ? input.envios.slice(-19) : [];
    envios.push(envio);
    await supabaseConToken(`/rest/v1/generated_documents?id=eq.${docId}`, u.token, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ input: Object.assign({}, input, { envios }) }),
      signal: AbortSignal.timeout(8000),
    }).catch(() => null);
  }
  registrar("plan_mail", { mail });
  return respuestaJSON(200, { ok: true, mail, envio });
}
