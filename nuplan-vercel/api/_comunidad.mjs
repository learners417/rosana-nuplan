// NuPlan · La comunidad del programa en GHL («Programa NuPlan · 90 días»).
// La app le avisa al webhook de entrada que Javo armó en GHL (20/11):
//   - «alta»: crea o actualiza el contacto, le da acceso al grupo y le pone la etiqueta «programa nuplan».
//   - los hitos (inicio, cada etapa, cierre, egreso): solo crean o actualizan el contacto, con el día.
// Nunca viaja un dato de salud: solo mail, nombre, apellido, teléfono, el evento y el día.
// Cada aviso se anota con un identificador: si se repite (otro teléfono, un reintento, Ro que
// vuelve a mandar el acceso), no sale dos veces. Cada salida es una ejecución premium en GHL.
// La dirección vive acá, del lado del servidor: las páginas no la ven.

import { createHash } from "node:crypto";
import { registrar, tomarAviso, marcarAviso } from "./_lib.mjs";

const WEBHOOK_COMUNIDAD =
  "https://services.leadconnectorhq.com/hooks/s44QfsRYPnToRlrDgJbo/webhook-trigger/59ec65f2-7a99-4df9-bab9-0a0207a623a3";

// Evento → día del programa desde el que vale.
export const HITOS = { inicio: 1, unir: 15, personalizar: 29, liberar: 43, activar: 57, naturalizar: 71, cierre: 85, egreso: 90 };

// Celular en formato internacional (+549…). "" si no hay; null si no se entiende.
// Acepta 11 5555 1234, 011 5555-1234, +54 9 11 5555 1234, 54 11 5555 1234 y cualquier +código de otro país.
export function telefonoGHL(x) {
  const s = String(x == null ? "" : x).trim();
  if (!s) return "";
  const mas = s.startsWith("+") || s.startsWith("00");
  let d = s.replace(/\D/g, "");
  if (s.startsWith("00")) d = d.slice(2);
  if (mas) {
    if (/^54[1-8]\d{9}$/.test(d)) d = "549" + d.slice(2);
    return d.length >= 8 && d.length <= 15 ? "+" + d : null;
  }
  if (d.startsWith("54") && d.length >= 12) d = d.slice(2);
  if (d.startsWith("9") && d.length === 11) d = d.slice(1);
  if (d.startsWith("0")) d = d.slice(1);
  return /^[1-9]\d{9}$/.test(d) ? "+549" + d : null;
}
export const TELEFONO_MAL = "Revisá el celular: con código de área, sin 0 ni 15 (por ejemplo 11 5555 1234).";

export function partirNombre(n) {
  const p = String(n || "").replace(/\s+/g, " ").trim().split(" ");
  return { nombre: p[0] || "", apellido: p.slice(1).join(" ") };
}

// "ok" (salió), "ya" (había salido antes), "en_curso" (otro pedido lo está mandando) o "error".
export async function avisarComunidad({ evento, email, nombre, telefono = "", dia = 0 }) {
  const mail = String(email || "").trim().toLowerCase();
  const huella = createHash("sha256").update(evento === "alta" ? mail + "|" + (telefono || "") : mail).digest("hex").slice(0, 32);
  const id = "com-" + evento + "-" + huella;
  let estado;
  try {
    estado = await tomarAviso(id);
  } catch (e) {
    registrar("comunidad_error", { evento, error: "no se pudo consultar: " + String((e && e.message) || e).slice(0, 200) });
    estado = "sin_registro";
  }
  if (estado === "enviado") return "ya";
  if (estado === "en_curso") return "en_curso";
  const p = partirNombre(nombre);
  const cuerpo = { evento, email: mail, nombre: p.nombre, apellido: p.apellido, telefono: telefono || "", dia: Number(dia) || 0 };
  try {
    const r = await fetch(process.env.GHL_WEBHOOK_COMUNIDAD || WEBHOOK_COMUNIDAD, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cuerpo),
      signal: AbortSignal.timeout(15000),
    });
    if (!r.ok) throw new Error(`GHL respondió ${r.status}`);
  } catch (e) {
    registrar("comunidad_error", { evento, dia: cuerpo.dia, error: String((e && e.message) || e).slice(0, 200) });
    if (estado === "nuevo") await marcarAviso(id, false).catch(() => {});
    return "error";
  }
  if (estado === "nuevo") await marcarAviso(id, true).catch(() => {});
  registrar("comunidad_ok", { evento, dia: cuerpo.dia });
  return "ok";
}
