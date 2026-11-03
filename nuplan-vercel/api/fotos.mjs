// NuPlan · Fotos del programa (las que suben las consultantes desde /mi-plan/).
// Quedan en una carpeta privada de Supabase, una subcarpeta por consultante.
// Solo pasan por acá: la consultante sube y ve las suyas; el equipo ve las de todas.
//
//   { accion: "subir", id, img }  img = la foto en JPEG, en base64  → { ok, ruta }
//   { accion: "ver", rutas: [...] }                                 → { ok, urls: { ruta: dirección } }
//
// Las direcciones que devuelve "ver" valen una hora.

import {
  leerJSON,
  origenPermitido,
  respuestaJSON,
  registrar,
  usuariaDeToken,
  esEquipo,
  topePublico,
  subirFoto,
  firmarFotos,
  ErrorDeAcceso,
} from "./_lib.mjs";

const RUTA = /^[0-9a-f-]{36}\/[A-Za-z0-9_-]{6,80}\.jpg$/;
const ID = /^[A-Za-z0-9_-]{6,80}$/;

export async function POST(req) {
  if (!origenPermitido(req)) {
    return respuestaJSON(403, { error: "Esto solo responde dentro de la app de NuPlan." });
  }
  let d;
  try {
    d = await leerJSON(req, 2100000);
  } catch (e) {
    return respuestaJSON(400, { error: String((e && e.message) || e) });
  }
  let u;
  try {
    u = await usuariaDeToken(req, "fotos");
  } catch (e) {
    const status = e instanceof ErrorDeAcceso ? e.status : 503;
    return respuestaJSON(status, { error: e.message, codigo: e.codigo || "sin_verificar" });
  }

  if (d.accion === "subir") {
    const id = String(d.id || "");
    if (!ID.test(id)) return respuestaJSON(400, { error: "La foto llegó sin identificador." });
    const b64 = String(d.img || "").replace(/^data:image\/jpeg;base64,/, "");
    let bytes;
    try {
      bytes = Buffer.from(b64, "base64");
    } catch {
      bytes = Buffer.alloc(0);
    }
    if (bytes.length < 200 || bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) {
      return respuestaJSON(400, { error: "La foto no llegó bien. Probá sacarla de nuevo." });
    }
    if (bytes.length > 1500000) {
      return respuestaJSON(413, { error: "La foto es demasiado pesada." });
    }
    const tope = await topePublico(req, "fotos", id, u.id);
    if (tope) return respuestaJSON(429, { error: tope.mensaje, codigo: tope.codigo, reintentar: true });
    const ruta = `${u.id}/${id}.jpg`;
    try {
      const r = await subirFoto(ruta, bytes);
      registrar("foto_ok", { usuaria: u.id, kb: Math.round(bytes.length / 1024), yaEstaba: r.yaEstaba || undefined });
      return respuestaJSON(200, { ok: true, ruta });
    } catch (e) {
      registrar("foto_error", { usuaria: u.id, error: String((e && e.message) || e).slice(0, 300) });
      return respuestaJSON(502, { error: "No se pudo guardar la foto ahora. Queda en tu teléfono y se sube sola.", reintentar: true });
    }
  }

  if (d.accion === "ver") {
    const pedidas = Array.isArray(d.rutas) ? d.rutas.map(String).filter((r) => RUTA.test(r)) : [];
    const rutas = [...new Set(pedidas)].slice(0, 100);
    const propias = rutas.filter((r) => r.startsWith(u.id + "/"));
    let permitidas = propias;
    if (propias.length < rutas.length && (await esEquipo(u.token, u.id))) permitidas = rutas;
    try {
      const urls = await firmarFotos(permitidas);
      return respuestaJSON(200, { ok: true, urls });
    } catch (e) {
      registrar("foto_error", { usuaria: u.id, accion: "ver", error: String((e && e.message) || e).slice(0, 300) });
      return respuestaJSON(502, { error: "No se pudieron mostrar las fotos ahora." });
    }
  }

  return respuestaJSON(400, { error: "Pedido inválido" });
}
