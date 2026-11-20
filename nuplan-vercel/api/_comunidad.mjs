// NuPlan · Aviso a la comunidad de El Consultorio («Programa NuPlan · 90 días»).
//
// El flujo «PROGRAMA | APP NUPLAN | alta → acceso a la comunidad» recibe un POST en JSON:
//   { evento, email, nombre, apellido, telefono, dia }
// «alta» le da acceso al grupo y le pone la etiqueta «programa nuplan». Cualquier otro
// evento (los hitos) solo crea o actualiza el contacto. Nunca viajan datos de salud:
// solo quién es, qué pasó y en qué día del programa.
//
// El disparador «Webhook entrante» es premium (GHL cobra cada aviso), así que se manda
// solo en el alta, cuando arranca y en los seis check-in: unos 8 avisos por consultante.

import { registrar } from "./_lib.mjs";

const WEBHOOK_COMUNIDAD =
  "https://services.leadconnectorhq.com/hooks/s44QfsRYPnToRlrDgJbo/webhook-trigger/59ec65f2-7a99-4df9-bab9-0a0207a623a3";

// «María José Pérez» → { nombre: "María", apellido: "José Pérez" }
export function partirNombre(completo) {
  const limpio = String(completo || "").replace(/\s+/g, " ").trim();
  if (!limpio || /^sin nombre$/i.test(limpio)) return { nombre: "", apellido: "" };
  const p = limpio.split(" ");
  return { nombre: p[0], apellido: p.slice(1).join(" ") };
}

export async function avisarComunidad(evento, { email, nombre = "", apellido = "", telefono = "", dia = 0 } = {}) {
  const mail = String(email || "").trim().toLowerCase();
  if (!mail) return { ok: false, motivo: "sin_mail" };
  const cuerpo = {
    evento: String(evento),
    email: mail,
    nombre: String(nombre || "").slice(0, 60),
    apellido: String(apellido || "").slice(0, 80),
    telefono: String(telefono || ""),
    dia: Math.max(0, Math.min(90, Number(dia) || 0)),
  };
  try {
    const r = await fetch(process.env.GHL_WEBHOOK_COMUNIDAD || WEBHOOK_COMUNIDAD, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cuerpo),
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) throw new Error(`GHL respondió ${r.status}`);
    registrar("comunidad_ok", { evento: cuerpo.evento, dia: cuerpo.dia });
    return { ok: true };
  } catch (e) {
    registrar("comunidad_error", { evento: cuerpo.evento, error: String((e && e.message) || e).slice(0, 200) });
    return { ok: false, motivo: "error" };
  }
}

// De un aviso de la app de la consultante (/mi-plan/), el hito que va a la comunidad, o null.
export function hitoDeAviso(paso, pasoSlug) {
  if (pasoSlug !== "mi-plan") return null;
  const p = String(paso || "").trim();
  if (/^arranc[oó] el programa/i.test(p)) return { evento: "comienzo", dia: 1 };
  const m = p.match(/^check-in\s*·\s*d[ií]a\s*(\d{1,2})\b/i);
  if (m) return { evento: "checkin", dia: Number(m[1]) };
  return null;
}
