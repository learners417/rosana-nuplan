// NuPlan · Hitos de la consultante para la comunidad de GHL.
// La app de la consultante avisa cuando empieza y cuando llega a cada etapa (Unir, Personalizar,
// Liberar, Activar, Naturalizar, el cierre y el egreso). Solo con su sesión, solo si Ro la dio de
// alta, y solo su mail, su nombre, su teléfono y el día: ningún dato de salud.
//
//   POST { evento, dia }  →  { ok, estado: "ok" | "ya" }

import { leerJSON, origenPermitido, respuestaJSON, registrar, usuariaDeToken, ErrorDeAcceso, supabaseConToken, topePublico } from "./_lib.mjs";
import { HITOS, avisarComunidad } from "./_comunidad.mjs";

async function altaDe(email, token) {
  for (const campos of ["nombre,telefono", "nombre"]) {
    const r = await supabaseConToken(`/rest/v1/programa_altas?select=${campos}&email=eq.${encodeURIComponent(email)}&limit=1`, token, {
      signal: AbortSignal.timeout(8000),
    }).catch(() => null);
    if (!r) return { error: "sin conexión" };
    if (r.ok) {
      const filas = await r.json().catch(() => []);
      return { fila: Array.isArray(filas) && filas[0] ? filas[0] : null };
    }
    const t = await r.text().catch(() => "");
    if (campos !== "nombre" && /telefono/i.test(t)) continue; // todavía sin la columna del teléfono
    return { error: t.slice(0, 200), falta: /programa_altas|schema cache|does not exist/i.test(t) };
  }
  return { error: "sin respuesta" };
}

export async function POST(req) {
  if (!origenPermitido(req)) return respuestaJSON(403, { error: "Esto solo responde dentro de NuPlan." });
  let d;
  try {
    d = await leerJSON(req, 2000);
  } catch (e) {
    return respuestaJSON(400, { error: String((e && e.message) || e) });
  }
  let u;
  try {
    u = await usuariaDeToken(req, "comunidad");
  } catch (e) {
    return respuestaJSON(e instanceof ErrorDeAcceso ? e.status : 503, { error: e.message });
  }
  const evento = String(d.evento || "");
  const dia = parseInt(d.dia, 10);
  if (!Object.prototype.hasOwnProperty.call(HITOS, evento)) return respuestaJSON(400, { error: "Ese aviso no existe." });
  if (!(dia >= HITOS[evento] && dia <= 90)) return respuestaJSON(400, { error: "Ese día no corresponde a ese aviso." });
  const email = String(u.email || "").toLowerCase();
  if (!email) return respuestaJSON(400, { error: "Tu cuenta no tiene mail." });

  const a = await altaDe(email, u.token);
  if (a.error) {
    registrar("comunidad_error", { evento, error: a.error });
    return respuestaJSON(a.falta ? 503 : 502, { error: "No se pudo confirmar tu alta. Se reintenta solo.", reintentar: !a.falta });
  }
  if (!a.fila) return respuestaJSON(403, { error: "Tu cuenta no está dada de alta en el programa.", sin_alta: true });

  const tope = await topePublico(req, "comunidad", null, u.id);
  if (tope) return respuestaJSON(429, { error: "Por hoy ya salieron muchos avisos. Se reintenta mañana.", reintentar: true });

  const estado = await avisarComunidad({ evento, email, nombre: a.fila.nombre, telefono: a.fila.telefono || "", dia });
  if (estado === "error") return respuestaJSON(502, { error: "La comunidad no respondió. Se reintenta solo.", reintentar: true });
  if (estado === "en_curso") return respuestaJSON(409, { error: "Ese aviso está saliendo ahora.", reintentar: true });
  return respuestaJSON(200, { ok: true, estado });
}
