// NuPlan · Avisos a Rosana: lo que mandan las consultantes desde su app (diario,
// ejercicios, check-in, preguntas que la IA deriva) y los ejercicios sueltos
// (Menú de Palabras, Mi registro). Van al webhook de GHL que le manda el mail.
// Pasan por acá en vez de ir directo a GHL por dos razones:
// 1. Cada envío trae un identificador. Si el teléfono reintenta porque se cortó
//    la conexión, el mail no llega dos veces (ni se cobra dos veces en GHL).
// 2. La dirección del webhook sale de las páginas de la app, y esto solo responde
//    a las páginas de NuPlan, con tope por día. (La dirección vieja sigue andando
//    hasta que se cree una nueva en GHL y se cargue en GHL_WEBHOOK_AVISOS.)
// Sin identificador también anda (lo pone el servidor): así una página que hoy
// manda directo a GHL se pasa acá cambiando solo la dirección. Por lo mismo,
// acepta el cuerpo como JSON, como formulario o como texto, pasa a GHL todos los
// campos que lleguen (no solo los de siempre) y toma cuerpo_html como mensaje_html.

import { randomUUID } from "node:crypto";
import {
  leerJSON,
  origenPermitido,
  topePublico,
  tomarAviso,
  marcarAviso,
  mandarAGHL,
  registrar,
  ORIGENES,
} from "./_lib.mjs";

function cabeceras(req) {
  const origen = req.headers.get("origin") || "";
  const h = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
  if (ORIGENES.includes(origen)) h["Access-Control-Allow-Origin"] = origen;
  return h;
}

function responder(cuerpo, req, status = 200) {
  return new Response(JSON.stringify(cuerpo), { status, headers: cabeceras(req) });
}

export async function OPTIONS(req) {
  return new Response(null, { status: 204, headers: cabeceras(req) });
}

// Lo que llega a GHL: los mismos campos que usan las páginas del método.
const LARGOS = {
  paso: 200,
  asunto: 250,
  nombre: 120,
  email: 160,
  fecha: 40,
  mensaje: 20000,
  mensaje_html: 100000,
  paso_slug: 60,
};

// Lee el cuerpo como venga: JSON (lo normal), formulario (application/x-www-form-urlencoded
// o multipart/form-data) o texto con JSON adentro (fetch con mode "no-cors").
async function leerCuerpo(req, max) {
  const tipo = (req.headers.get("content-type") || "").toLowerCase();
  if (tipo.includes("multipart/form-data")) {
    const largo = Number(req.headers.get("content-length") || 0);
    if (largo > max * 4) throw new Error("El pedido es demasiado largo.");
    let f;
    try {
      f = await req.formData();
    } catch {
      throw new Error("Pedido inválido");
    }
    const d = {};
    for (const [k, v] of f.entries()) if (typeof v === "string") d[k] = v;
    return d;
  }
  if (tipo.includes("application/x-www-form-urlencoded")) {
    const largo = Number(req.headers.get("content-length") || 0);
    if (largo > max * 4) throw new Error("El pedido es demasiado largo.");
    const texto = await req.text().catch(() => "");
    if (texto.length > max) throw new Error("El pedido es demasiado largo.");
    return Object.fromEntries(new URLSearchParams(texto));
  }
  return leerJSON(req, max);
}

const CAMPO = /^[A-Za-z][A-Za-z0-9_]{0,39}$/;

export async function POST(req) {
  if (!origenPermitido(req, ORIGENES)) {
    return responder({ error: "Solo se puede mandar desde las páginas de NuPlan." }, req, 403);
  }
  let d;
  try {
    d = await leerCuerpo(req, 140000);
  } catch (e) {
    return responder({ error: String(e.message || e) }, req, 400);
  }
  if (!d.mensaje_html && d.cuerpo_html) d.mensaje_html = d.cuerpo_html;

  const id = d.id == null || d.id === "" ? "srv-" + randomUUID() : String(d.id);
  if (!/^[A-Za-z0-9_-]{8,80}$/.test(id)) {
    return responder({ error: "El identificador del envío no es válido." }, req, 400);
  }
  const cuerpo = {};
  // Primero, cualquier otro campo simple que haya mandado la página (hasta 20, cortos), tal cual:
  // así una página del método pasa acá cambiando solo la dirección, mande los campos que mande.
  let extra = 0;
  for (const [campo, valor] of Object.entries(d)) {
    if (campo === "id" || Object.prototype.hasOwnProperty.call(LARGOS, campo) || !CAMPO.test(campo) || extra >= 20) continue;
    if (valor == null || !["string", "number", "boolean"].includes(typeof valor)) continue;
    cuerpo[campo] = String(valor).slice(0, campo === "cuerpo_html" ? 100000 : 5000);
    extra++;
  }
  for (const [campo, max] of Object.entries(LARGOS)) {
    cuerpo[campo] = String(d[campo] == null ? "" : d[campo]).slice(0, max);
  }
  const conContenido = Object.entries(cuerpo).some(
    ([campo, valor]) => !["paso", "asunto", "nombre", "email", "fecha", "paso_slug"].includes(campo) && String(valor).trim()
  );
  if (!conContenido) {
    return responder({ error: "El envío llegó vacío." }, req, 400);
  }
  if (!cuerpo.paso.trim()) cuerpo.paso = "Mensaje de la app";
  cuerpo.id_envio = id;

  // ¿Ya llegó? (si el teléfono reintenta, no se manda de nuevo)
  let estado;
  try {
    estado = await tomarAviso(id);
  } catch (e) {
    registrar("aviso_error", { id, error: "no se pudo consultar: " + String(e.message || e).slice(0, 200) });
    estado = "sin_registro";
  }
  if (estado === "enviado") {
    registrar("aviso_repetido", { id });
    return responder({ ok: true, duplicado: true }, req);
  }
  if (estado === "en_curso") {
    return responder({ ok: false, reintentar: true, error: "Ese envío está saliendo ahora." }, req, 409);
  }

  const tope = await topePublico(req, "aviso", id);
  if (tope) {
    if (estado === "nuevo") await marcarAviso(id, false).catch(() => {});
    return responder({ ok: false, reintentar: true, error: tope.mensaje, codigo: tope.codigo }, req, 429);
  }

  try {
    await mandarAGHL(cuerpo);
  } catch (e) {
    registrar("aviso_error", { id, paso: cuerpo.paso, error: String(e.message || e).slice(0, 300) });
    if (estado === "nuevo") await marcarAviso(id, false).catch(() => {});
    return responder({ ok: false, reintentar: true, error: "No se pudo mandar ahora. Se reintenta solo." }, req, 502);
  }
  if (estado === "nuevo") {
    await marcarAviso(id, true).catch((e) =>
      registrar("aviso_error", { id, error: "salió, pero no se pudo anotar: " + String(e.message || e).slice(0, 200) })
    );
  }
  registrar("aviso_ok", { id, paso: cuerpo.paso, sin_registro: estado === "sin_registro" || undefined });
  return responder({ ok: true }, req);
}
