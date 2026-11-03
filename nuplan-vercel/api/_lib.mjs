// NuPlan · utilidades compartidas por las funciones de IA.

import { createHash } from "node:crypto";

// El modelo se cambia con la variable de entorno MODELO_IA en Vercel.
export const MODELO = process.env.MODELO_IA || "claude-sonnet-5";

// Respaldo: si el modelo principal falla o está saturado, se reintenta con
// este otro antes de mostrarle un error a la profesional. Un plan hecho con
// el modelo de respaldo es peor que el bueno, pero muchísimo mejor que
// ningún plan con una paciente sentada enfrente. Cuando pasa, se avisa.
// (Haiku 5.5: vigente hasta octubre de 2027 como mínimo; Haiku 4.5 ya
// pasó su fecha más temprana de retiro, el 15/10/2026.)
export const MODELO_RESPALDO = process.env.MODELO_IA_RESPALDO || "claude-haiku-5-5";

// Todas las tareas de NuPlan devuelven un JSON de formato fijo: no necesitan
// razonamiento previo. En Claude Sonnet 5 el razonamiento viene prendido por
// defecto, cuesta como salida y se come el max_tokens; ahí se apaga. Lo mismo
// en Haiku 5.5 (lo acepta con su esfuerzo por defecto, "medium").
// (Solo en los modelos que aceptan apagarlo: los demás dan error 400.)
const ACEPTA_SIN_RAZONAMIENTO = /^claude-sonnet-5(-\d{8})?$|^claude-haiku-5-5/;

// ---------------------------------------------------------------------------
// Registro: queda en los logs de Vercel (Deployments → Logs), una línea JSON
// por evento, para ver usos, tiempos y errores sin tocar nada.
// ---------------------------------------------------------------------------
export function registrar(evento, datos) {
  try {
    const linea = JSON.stringify({ evento, ...datos });
    if (/error|fallo|rechazo/.test(evento)) console.error(linea);
    else console.log(linea);
  } catch {}
}

// Errores que justifican reintentar: caídas del servicio, saturación,
// tiempos de espera, cortes de red y respuestas cortadas o mal formadas.
// Un error de clave o de pedido mal armado NO se reintenta: va a fallar igual.
function convieneReintentar(e) {
  const m = String((e && e.message) || e);
  return (
    /La API respondió (404|429|500|502|503|504|529)/.test(m) ||
    /formato válido|vino cortada/.test(m) ||
    /fetch failed|network|timeout|ETIMEDOUT|ECONNRESET|socket/i.test(m)
  );
}

// Lo que ve la profesional cuando algo falla: siempre en castellano y con
// qué hacer. El detalle técnico queda en el registro.
export function mensajeParaPersona(e) {
  const m = String((e && e.message) || e || "");
  if (/specified API usage limits|usage limits?\b/i.test(m))
    return "La cuenta de inteligencia artificial llegó al tope de gasto que tiene configurado. Avisale a Javo: hasta que lo suba o empiece el mes, no se pueden armar planes ni recetas con IA.";
  if (/credit balance|billing|insufficient_quota|exceeded your current quota/i.test(m))
    return "La cuenta de inteligencia artificial se quedó sin crédito. Avisale a Javo: hasta que se cargue, no se pueden armar planes ni recetas con IA.";
  if (/ANTHROPIC_API_KEY|invalid x-api-key|authentication_error/i.test(m))
    return "Falta configurar la clave de la inteligencia artificial. Avisale a Javo.";
  if (/La API respondió (429|500|502|503|504|529)|overloaded|rate_limit/i.test(m))
    return "La inteligencia artificial está saturada. Probá de nuevo en 2 minutos.";
  if (/formato válido|vino cortada|JSON/i.test(m))
    return "La inteligencia artificial devolvió una respuesta incompleta. Probá de nuevo.";
  if (/tardó demasiado/.test(m))
    return "La inteligencia artificial tardó demasiado. Probá de nuevo en un minuto.";
  if (/fetch failed|network|timeout|ETIMEDOUT|ECONNRESET|socket/i.test(m))
    return "No se pudo hablar con la inteligencia artificial. Probá de nuevo en un minuto.";
  if (/no quiso responder/.test(m)) return m;
  if (/planilla llegó vacía/.test(m)) return m;
  return "Algo falló con la inteligencia artificial. Probá de nuevo en un minuto; si se repite, avisale a Javo.";
}

// Devuelve el JSON que respondió la IA. Si lo armó el modelo de respaldo,
// el objeto lo dice en una propiedad oculta (resultado.__respaldo === true)
// que no viaja al navegador por sí sola: cada función decide si avisar.
// opciones.limite = hora (ms) en la que la función tiene que haber terminado:
// si no queda tiempo para el respaldo, no se intenta, y el pedido se corta
// solo antes de que Vercel corte la función entera.
export async function llamarIA(prompt, maxTokens = 8000, funcion = "ia", opciones = {}) {
  const limite = Number(opciones.limite) || 0;
  try {
    return await pedirALaIA(prompt, maxTokens, MODELO, funcion, limite);
  } catch (e) {
    registrar("ia_error", { funcion, modelo: MODELO, error: String(e.message || e).slice(0, 400) });
    if (MODELO_RESPALDO === MODELO || !convieneReintentar(e)) throw e;
    if (limite && limite - Date.now() < 120000) {
      registrar("ia_error", { funcion, modelo: MODELO_RESPALDO, error: "sin tiempo para el respaldo" });
      throw e;
    }
    const r = await pedirALaIA(prompt, maxTokens, MODELO_RESPALDO, funcion, limite);
    Object.defineProperty(r, "__respaldo", { value: true, enumerable: false });
    // Por qué falló el principal (p. ej. un 404 si el modelo dejó de existir).
    Object.defineProperty(r, "__motivo", { value: String((e && e.message) || e).slice(0, 300), enumerable: false });
    return r;
  }
}

async function pedirALaIA(prompt, maxTokens, modelo, funcion, limite = 0) {
  const clave = process.env.ANTHROPIC_API_KEY;
  if (!clave) {
    throw new Error(
      "Falta la clave ANTHROPIC_API_KEY en las variables de entorno del proyecto."
    );
  }

  const cuerpo = {
    model: modelo,
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
  };
  if (ACEPTA_SIN_RAZONAMIENTO.test(modelo)) cuerpo.thinking = { type: "disabled" };

  const enviar = async () => {
    const corte = new AbortController();
    const espera = limite ? Math.max(1000, limite - Date.now() - 3000) : 0;
    const reloj = espera ? setTimeout(() => corte.abort(), espera) : null;
    try {
      return await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": clave,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(cuerpo),
        signal: corte.signal,
      });
    } catch (e) {
      if (corte.signal.aborted) throw new Error("La IA tardó demasiado (timeout).");
      throw e;
    } finally {
      if (reloj) clearTimeout(reloj);
    }
  };

  const t0 = Date.now();
  let r = await enviar();
  if (!r.ok && r.status === 400 && cuerpo.thinking) {
    // Si el modelo configurado no acepta apagar el razonamiento, se manda
    // el pedido tal cual era antes, sin ese campo.
    const detalle = await r.text();
    if (!/thinking/i.test(detalle)) {
      throw new Error(`La API respondió 400: ${detalle.slice(0, 300)}`);
    }
    delete cuerpo.thinking;
    r = await enviar();
  }

  if (!r.ok) {
    const detalle = await r.text();
    throw new Error(`La API respondió ${r.status}: ${detalle.slice(0, 300)}`);
  }

  const data = await r.json();
  registrar("ia_uso", {
    funcion,
    modelo,
    entrada: data.usage && data.usage.input_tokens,
    salida: data.usage && data.usage.output_tokens,
    fin: data.stop_reason,
    ms: Date.now() - t0,
  });

  if (data.stop_reason === "refusal") {
    throw new Error("La inteligencia artificial no quiso responder este pedido.");
  }
  if (data.stop_reason === "max_tokens") {
    throw new Error("La respuesta de la IA vino cortada (sin formato válido completo).");
  }

  let texto = (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();

  if (texto.startsWith("```")) {
    texto = texto.replace(/^```[a-zA-Z]*\s*/, "").replace(/```\s*$/, "");
  }
  const desde = texto.indexOf("{");
  const hasta = texto.lastIndexOf("}");
  if (desde === -1 || hasta === -1) {
    throw new Error("La IA no devolvió una respuesta en formato válido.");
  }
  try {
    return JSON.parse(texto.slice(desde, hasta + 1));
  } catch {
    throw new Error("La IA no devolvió una respuesta en formato válido.");
  }
}

// Responde en streaming: manda espacios mientras la IA trabaja para que la
// conexión no se corte por tiempo. Los espacios delante de un JSON son
// válidos y el navegador los ignora al parsear. Como el estado HTTP ya salió
// (200) cuando empieza el trabajo, un error viaja como {"error": "..."} y
// queda registrado en los logs.
export function responderConLatido(trabajo, funcion = "ia") {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const latido = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(" "));
        } catch {}
      }, 2000);
      try {
        const resultado = await trabajo();
        clearInterval(latido);
        controller.enqueue(encoder.encode(JSON.stringify(resultado)));
      } catch (e) {
        clearInterval(latido);
        registrar("ia_fallo", { funcion, error: String((e && e.message) || e).slice(0, 400) });
        controller.enqueue(
          encoder.encode(JSON.stringify({ error: mensajeParaPersona(e) }))
        );
      }
      controller.close();
    },
  });
  return new Response(stream, {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

// maxCaracteres: si se pasa, un pedido más largo se rechaza sin leerlo entero
// (las funciones públicas lo usan para que nadie mande textos gigantes a la IA).
export async function leerJSON(req, maxCaracteres = 0) {
  if (req.method !== "POST") {
    throw new Error("Método no permitido");
  }
  if (maxCaracteres) {
    const largo = Number(req.headers.get("content-length") || 0);
    if (largo > maxCaracteres * 4) throw new Error("El pedido es demasiado largo.");
    let texto;
    try {
      texto = await req.text();
    } catch {
      throw new Error("Pedido inválido");
    }
    if (texto.length > maxCaracteres) throw new Error("El pedido es demasiado largo.");
    let valor;
    try {
      valor = JSON.parse(texto);
    } catch {
      throw new Error("Pedido inválido");
    }
    if (!valor || typeof valor !== "object" || Array.isArray(valor)) throw new Error("Pedido inválido");
    return valor;
  }
  try {
    return await req.json();
  } catch {
    throw new Error("Pedido inválido");
  }
}

export function respuestaJSON(status, cuerpo) {
  return new Response(JSON.stringify(cuerpo), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

// ---------------------------------------------------------------------------
// ACCESO · las funciones de IA de la profesional solo responden a una usuaria
// que entró a la app (sesión de Supabase vigente y perfil habilitado), con un
// tope de usos por día. Sin esto, cualquiera con la dirección gasta el crédito.
// ---------------------------------------------------------------------------
// Nombres propios (NUPLAN_…) para que ninguna integración de Vercel los pise con otro proyecto.
const SUPABASE_URL = process.env.NUPLAN_SUPABASE_URL || "https://askebcmhmhmwtfklyxuf.supabase.co";
// Clave publicable: es la misma que ya está en las páginas. La de servicio nunca va acá.
const SUPABASE_PUBLICA =
  process.env.NUPLAN_SUPABASE_PUBLICA || "sb_publishable_bx_WMZGN85wAslrgjrfJWw_CwsL-YeS";
const TOPE_LEIDO = parseInt(process.env.TOPE_DIARIO_IA, 10);
const TOPE_DIARIO = Number.isFinite(TOPE_LEIDO) && TOPE_LEIDO > 0 ? TOPE_LEIDO : 60;

export class ErrorDeAcceso extends Error {
  constructor(status, mensaje, codigo) {
    super(mensaje);
    this.status = status;
    this.codigo = codigo;
  }
}

// Medianoche de Argentina (UTC−3, sin horario de verano) en formato ISO.
function inicioDelDia(ahora = Date.now()) {
  const ar = new Date(ahora - 3 * 3600 * 1000);
  return new Date(Date.UTC(ar.getUTCFullYear(), ar.getUTCMonth(), ar.getUTCDate(), 3)).toISOString();
}

async function consultarSupabase(ruta, token, opciones = {}) {
  return fetch(`${SUPABASE_URL}${ruta}`, {
    ...opciones,
    headers: {
      apikey: SUPABASE_PUBLICA,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(opciones.headers || {}),
    },
  });
}

export async function exigirUsuaria(req, funcion) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (!token || token.split(".").length !== 3) {
    throw new ErrorDeAcceso(401, "Para usar la inteligencia artificial tenés que entrar con tu usuario. Recargá la página y volvé a entrar.", "sin_sesion");
  }

  let usuaria;
  try {
    const r = await consultarSupabase("/auth/v1/user", token);
    if (r.status === 401 || r.status === 403) {
      throw new ErrorDeAcceso(401, "Tu sesión venció. Recargá la página y volvé a entrar.", "sesion_vencida");
    }
    if (!r.ok) throw new Error(`auth ${r.status}`);
    usuaria = await r.json();
  } catch (e) {
    if (e instanceof ErrorDeAcceso) throw e;
    registrar("acceso_error", { funcion, error: String(e.message || e) });
    throw new ErrorDeAcceso(503, "No se pudo verificar tu usuario. Probá de nuevo en un minuto.", "sin_verificar");
  }
  if (!usuaria || !usuaria.id) {
    throw new ErrorDeAcceso(401, "Tu sesión venció. Recargá la página y volvé a entrar.", "sesion_vencida");
  }

  // Perfil habilitado: el mismo criterio que usan las dos apps para dejar entrar
  // (sin perfil, o con el perfil en "pending", no entra).
  let perfil = null;
  try {
    const p = await consultarSupabase(`/rest/v1/profiles?select=role&id=eq.${encodeURIComponent(usuaria.id)}`, token);
    if (p.ok) {
      const filas = await p.json();
      perfil = Array.isArray(filas) && filas[0] ? filas[0] : null;
    } else {
      throw new Error(`profiles ${p.status}`);
    }
  } catch (e) {
    registrar("acceso_error", { funcion, error: String(e.message || e) });
    throw new ErrorDeAcceso(503, "No se pudo verificar tu usuario. Probá de nuevo en un minuto.", "sin_verificar");
  }
  const rol = perfil ? perfil.role : null;
  if (!perfil || rol === "pending") {
    registrar("acceso_rechazo", { funcion, usuaria: usuaria.id, rol });
    throw new ErrorDeAcceso(403, "Tu usuario todavía no está habilitado para usar la inteligencia artificial.", "sin_permiso");
  }

  // Tope diario. Usa la tabla uso_ia (la crea turno1.sql). Cuenta intentos,
  // no solo respuestas buenas. Si la tabla todavía no existe, la IA sigue
  // andando y queda registrado en los logs.
  try {
    const desde = encodeURIComponent(inicioDelDia());
    const c = await consultarSupabase(
      `/rest/v1/uso_ia?select=id&user_id=eq.${encodeURIComponent(usuaria.id)}&creado=gte.${desde}&limit=${TOPE_DIARIO + 1}`,
      token
    );
    if (c.ok) {
      const filas = await c.json();
      if (Array.isArray(filas) && filas.length >= TOPE_DIARIO) {
        registrar("acceso_rechazo", { funcion, usuaria: usuaria.id, motivo: "tope_diario", tope: TOPE_DIARIO });
        throw new ErrorDeAcceso(429, `Llegaste al tope de ${TOPE_DIARIO} usos de inteligencia artificial por hoy. Mañana se renueva; si lo necesitás antes, avisale a Javo.`, "tope_diario");
      }
      const alta = await consultarSupabase("/rest/v1/uso_ia", token, {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ funcion }),
      });
      if (!alta.ok) registrar("tope_error", { funcion, estado: alta.status });
    } else {
      registrar("tope_error", { funcion, estado: c.status, detalle: "sin tabla uso_ia: falta correr turno1.sql" });
    }
  } catch (e) {
    if (e instanceof ErrorDeAcceso) throw e;
    registrar("tope_error", { funcion, error: String(e.message || e) });
  }

  return { id: usuaria.id, email: usuaria.email, rol };
}

// Atajo para las funciones: valida y, si no corresponde, responde el error
// con su estado HTTP (401, 403, 429, 503) y un mensaje en castellano.
export async function conAcceso(req, funcion, siPasa) {
  if (req.method !== "POST") return respuestaJSON(405, { error: "Método no permitido" });
  try {
    await exigirUsuaria(req, funcion);
  } catch (e) {
    const status = e instanceof ErrorDeAcceso ? e.status : 503;
    const mensaje = e instanceof ErrorDeAcceso ? e.message : "No se pudo verificar tu usuario. Probá de nuevo en un minuto.";
    return respuestaJSON(status, { error: mensaje, codigo: e.codigo || "sin_verificar" });
  }
  return siPasa();
}

// Datos que la IA no necesita para armar un plan o una receta.
export function sinDatosPersonales(info) {
  if (!info || typeof info !== "object") return info;
  const copia = { ...info };
  for (const k of ["firstName", "lastName", "first_name", "last_name", "name", "fullName", "nombre", "apellido", "email", "phone", "telefono", "dni", "id"]) {
    delete copia[k];
  }
  return copia;
}

// ---------------------------------------------------------------------------
// ACCESO PÚBLICO · el chat y las devoluciones de las consultantes, y los
// avisos a Rosana, no piden usuario. Para que nadie de afuera gaste el crédito
// ni dispare mails: responden solo a las páginas de NuPlan, con un tope por
// conexión y un tope total por día. Los topes se cuentan en Supabase con la
// clave de servicio (SUPABASE_SERVICE_ROLE_KEY, solo en Vercel, nunca en una
// página). Sin esa clave, o sin correr el SQL, todo sigue andando como antes
// y queda anotado en los logs.
// ---------------------------------------------------------------------------
export const ORIGENES = [
  "https://rosana-nuplan.vercel.app",
  "https://app.nuplan.com.ar",
  "https://metodo.nuplan.com.ar",
  "https://nuplan.com.ar",
  "https://www.nuplan.com.ar",
];

// Usos por día. conexion = desde una misma dirección de internet; total = entre todas.
export const TOPES = {
  "np-chat": { conexion: 40, total: 400 },
  diagnostico: { conexion: 10, total: 80 },
  "plan-personalizado": { conexion: 10, total: 80 },
  "protocolo-deslices": { conexion: 10, total: 80 },
  "informe-evidencia": { conexion: 10, total: 80 },
  "carta-graduacion": { conexion: 10, total: 80 },
  aviso: { conexion: 60, total: 600 },
  // Las dos que piden cuenta cuentan por consultante, no por conexión.
  fotos: { conexion: 40, total: 3000 },
};

const MENSAJE_TOPE = {
  "np-chat": "Por hoy ya me hiciste muchas preguntas. Mañana seguimos. Si es algo que no puede esperar, escribile a Rosana por WhatsApp.",
  aviso: "Por hoy ya salieron muchos envíos desde esta conexión. Lo tuyo quedó guardado y se manda solo mañana.",
  fotos: "Por hoy ya subiste muchas fotos. Las que faltan quedaron en tu teléfono y se suben solas mañana.",
};
const MENSAJE_TOPE_METODO = "Por hoy ya no puedo armar más devoluciones. Probá de nuevo mañana.";

// Responde solo a pedidos que vienen de las páginas de NuPlan. Los navegadores
// siempre mandan el origen en un POST; un pedido sin origen no viene de una página.
export function origenPermitido(req, permitidos = ORIGENES) {
  const origen = req.headers.get("origin") || "";
  if (!origen) return false;
  if (permitidos.includes(origen)) return true;
  // También la página que se sirve desde la misma dirección que la función
  // (por ejemplo, otra dirección de Vercel de este mismo proyecto).
  try {
    if (origen === new URL(req.url).origin) return true;
  } catch {}
  const host = req.headers.get("host") || "";
  return !!host && origen === "https://" + host;
}

function ipDe(req) {
  const h = req.headers;
  const ip = (h.get("x-real-ip") || (h.get("x-forwarded-for") || "").split(",")[0] || "").trim();
  if (!ip) return "sin-ip";
  if (!ip.includes(":")) return ip;
  if (ip.includes(".")) return ip.split(":").pop(); // IPv4 dentro de IPv6 (::ffff:1.2.3.4)
  // IPv6: un mismo hogar o teléfono tiene un /64 entero; se cuenta por esa parte.
  const [izq, der] = ip.toLowerCase().split("::");
  const a = izq ? izq.split(":") : [];
  const b = der ? der.split(":") : [];
  const todo = der === undefined ? a : a.concat(Array(Math.max(0, 8 - a.length - b.length)).fill("0"), b);
  return todo.slice(0, 4).map((x) => x.replace(/^0+(?=.)/, "")).join(":") + "::/64";
}

function claveServicio() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

// Sirve tanto la clave nueva (sb_secret_…, solo en apikey) como la vieja
// (service_role, que es un JWT y va también como Bearer).
function cabecerasServicio(extra = {}) {
  const clave = claveServicio();
  const h = { apikey: clave, ...extra };
  if (clave.split(".").length === 3) h.Authorization = `Bearer ${clave}`;
  return h;
}

// Llama a una función de la base con la clave de servicio.
export async function rpcServicio(nombre, params) {
  const clave = claveServicio();
  if (!clave) return { sinClave: true };
  const h = cabecerasServicio({ "Content-Type": "application/json" });
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${nombre}`, {
    method: "POST",
    headers: h,
    body: JSON.stringify(params),
    signal: AbortSignal.timeout(8000),
  });
  const texto = await r.text();
  if (!r.ok) throw new Error(`rpc ${nombre} respondió ${r.status}: ${texto.slice(0, 200)}`);
  return { valor: texto ? JSON.parse(texto) : null };
}

// Devuelve null si puede seguir, o { codigo, mensaje } si llegó al tope.
// Si no se puede contar (falta la clave o el SQL), deja pasar y lo anota.
// quien: el id de la cuenta, cuando la función la pide (el tope es por persona).
export async function topePublico(req, funcion, ref = null, quien = "") {
  const t = TOPES[funcion] || { conexion: 20, total: 200 };
  const base = quien ? "usuaria|" + quien : "nuplan|" + ipDe(req);
  const clave = createHash("sha256").update(base).digest("hex").slice(0, 32);
  let r;
  try {
    r = await rpcServicio("nuplan_uso_publico", {
      p_funcion: funcion,
      p_clave: clave,
      p_tope_clave: t.conexion,
      p_tope_total: t.total,
      p_ref: ref,
    });
  } catch (e) {
    registrar("tope_error", { funcion, error: String((e && e.message) || e).slice(0, 300) });
    return null;
  }
  if (r.sinClave) {
    registrar("tope_error", { funcion, detalle: "falta SUPABASE_SERVICE_ROLE_KEY en Vercel: sin tope" });
    return null;
  }
  if (r.valor === "ok") return null;
  if (r.valor !== "tope_clave" && r.valor !== "tope_total") {
    registrar("tope_error", { funcion, detalle: "respuesta rara del tope", valor: String(r.valor).slice(0, 80) });
    return null;
  }
  registrar("acceso_rechazo", { funcion, motivo: r.valor });
  return { codigo: r.valor, mensaje: MENSAJE_TOPE[funcion] || MENSAJE_TOPE_METODO };
}

// Las páginas mandan textos con códigos HTML (&aacute;, &middot;…): a la IA le
// llegan como letras normales.
const ENTIDADES = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", middot: "·", hellip: "…",
  laquo: "«", raquo: "»", ndash: "–", mdash: "—", iquest: "¿", iexcl: "¡", deg: "°", trade: "™",
  aacute: "á", eacute: "é", iacute: "í", oacute: "ó", uacute: "ú", ntilde: "ñ", uuml: "ü",
  Aacute: "Á", Eacute: "É", Iacute: "Í", Oacute: "Ó", Uacute: "Ú", Ntilde: "Ñ", Uuml: "Ü",
};
export function sinCodigosHTML(x) {
  return String(x == null ? "" : x)
    .replace(/<[^>]{0,200}>/g, " ")
    .replace(/&#(\d{1,6});/g, (_, n) => {
      const c = Number(n);
      return c > 0 && c < 0x110000 ? String.fromCodePoint(c) : " ";
    })
    .replace(/&#x([0-9a-f]{1,6});/gi, (_, n) => {
      const c = parseInt(n, 16);
      return c > 0 && c < 0x110000 ? String.fromCodePoint(c) : " ";
    })
    .replace(/&([a-z]{2,8});/gi, (m, n) => (n in ENTIDADES ? ENTIDADES[n] : m))
    .replace(/[ \t]{2,}/g, " ");
}

// Para las consultantes y las páginas del método: sin «avisale a Javo».
export function mensajeParaConsultante(e, que = "contestarte") {
  const m = String((e && e.message) || e || "");
  if (/tardó demasiado|La API respondió (429|500|502|503|504|529)|overloaded|rate_limit|fetch failed|network|timeout|ETIMEDOUT|ECONNRESET|socket/i.test(m))
    return `No pude ${que} ahora. Probá de nuevo en unos minutos.`;
  return `No pude ${que} ahora. Probá de nuevo más tarde.`;
}

// El tipo de aviso técnico de una falla que ya pasó por el respaldo: si es un
// «modelo no existe», tampoco anduvo el de respaldo.
export function avisoDeFalla(e) {
  const t = tipoDeFalla(e);
  return t === "modelo" ? "sin_modelo" : t;
}

// Qué tipo de falla es: las que no se arreglan solas generan un aviso técnico.
export function tipoDeFalla(e) {
  const m = String((e && e.message) || e || "");
  if (/specified API usage limits|usage limits?\b/i.test(m)) return "tope";
  if (/credit balance|billing|insufficient_quota|exceeded your current quota/i.test(m)) return "credito";
  if (/ANTHROPIC_API_KEY|invalid x-api-key|authentication_error|permission_error/i.test(m)) return "clave";
  if (/La API respondió 404|not_found_error/i.test(m)) return "modelo";
  return "pasajera";
}

// ---------------------------------------------------------------------------
// AVISOS A ROSANA · pasan por /api/aviso, que los manda al webhook de GHL (el
// flujo «RESPUESTAS AUTOMATICAS POR MAIL - SERVICIO»). Cada envío trae un
// identificador: si el teléfono reintenta, no llega dos veces.
// ---------------------------------------------------------------------------
const WEBHOOK_GHL =
  "https://services.leadconnectorhq.com/hooks/s44QfsRYPnToRlrDgJbo/webhook-trigger/f61d5d97-2ada-4d37-a282-d27af06e1a86";

export async function mandarAGHL(cuerpo) {
  const r = await fetch(process.env.GHL_WEBHOOK_AVISOS || WEBHOOK_GHL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo),
    signal: AbortSignal.timeout(20000),
  });
  if (!r.ok) throw new Error(`GHL respondió ${r.status}`);
}

// "nuevo" (se puede mandar), "enviado" (ya llegó), "en_curso" (otro pedido lo
// está mandando ahora) o "sin_registro" (sin clave de servicio: no se puede saber).
export async function tomarAviso(id) {
  const r = await rpcServicio("nuplan_aviso_tomar", { p_id: id });
  if (r.sinClave) return "sin_registro";
  return ["nuevo", "enviado", "en_curso"].includes(r.valor) ? r.valor : "sin_registro";
}

export async function marcarAviso(id, enviado) {
  const r = await rpcServicio("nuplan_aviso_marcar", { p_id: id, p_enviado: !!enviado });
  return !r.sinClave;
}

// Fecha de Argentina (UTC−3, sin horario de verano), AAAA-MM-DD.
export function hoyArgentina(ahora = Date.now()) {
  return new Date(ahora - 3 * 3600 * 1000).toISOString().slice(0, 10);
}

const AVISO_TECNICO = {
  credito: ["la cuenta de inteligencia artificial se quedó sin crédito", "El chat y las devoluciones del método no contestan hasta que se cargue."],
  clave: ["la clave de la inteligencia artificial dejó de funcionar", "El chat y las devoluciones del método no contestan hasta que se cambie."],
  tope: ["la cuenta de inteligencia artificial llegó al tope de gasto que tiene configurado", "El chat y las devoluciones del método no contestan hasta que se suba el tope o empiece el mes."],
  modelo: ["el modelo principal de inteligencia artificial dejó de responder y se está usando el de respaldo", "Las consultantes no notan nada, pero hay que cambiar el modelo en Vercel."],
  sin_modelo: ["dejaron de responder el modelo de inteligencia artificial y también el de respaldo", "El chat y las devoluciones del método no contestan hasta que se cambie el modelo en Vercel."],
};

// Un mail a la casilla de Rosana, una sola vez por día y por tipo, cuando la
// IA tiene un problema que no se arregla solo. Sin la clave de servicio no se
// puede asegurar el «una vez por día», así que no se manda y queda en los logs.
export async function avisoTecnico(tipo, funcion) {
  if (!AVISO_TECNICO[tipo]) return false;
  const hoy = hoyArgentina();
  const id = `tecnico-${tipo}-${hoy}`;
  let estado;
  try {
    estado = await tomarAviso(id);
  } catch (e) {
    registrar("aviso_tecnico_error", { tipo, funcion, error: String((e && e.message) || e).slice(0, 200) });
    return false;
  }
  if (estado !== "nuevo") return false;
  const [que, consecuencia] = AVISO_TECNICO[tipo];
  const texto =
    `Hoy ${que} (lo detectó: ${funcion}). ${consecuencia}\n\n` +
    "Reenviale este mail a Javo para que lo resuelva. Este aviso llega una sola vez por día.";
  const html =
    '<div style="font-family:Helvetica,Arial,sans-serif;color:#1a1a1a;background:#fff6f3;padding:24px 16px;line-height:1.6">' +
    '<div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #f6d9d1;border-radius:16px;padding:26px">' +
    '<p style="margin:0 0 6px;font-size:15px;letter-spacing:2px;text-transform:uppercase;color:#c53a1e;font-weight:700">Aviso técnico para Javo</p>' +
    `<p style="margin:0 0 14px;font-size:18px">Hoy ${que} (lo detectó: ${funcion}).</p>` +
    `<p style="margin:0 0 14px;font-size:17px">${consecuencia}</p>` +
    '<p style="margin:0;font-size:17px;color:#4b5563">Reenviale este mail a Javo para que lo resuelva. Este aviso llega una sola vez por día.</p>' +
    "</div></div>";
  try {
    await mandarAGHL({
      paso: "Aviso técnico para Javo",
      asunto: "Aviso técnico para Javo · la IA de la app",
      nombre: "App NuPlan",
      email: "",
      fecha: hoy,
      mensaje: texto,
      mensaje_html: html,
      paso_slug: "aviso-tecnico",
      id_envio: id,
    });
    await marcarAviso(id, true);
    registrar("aviso_tecnico", { tipo, funcion });
    return true;
  } catch (e) {
    registrar("aviso_tecnico_error", { tipo, funcion, error: String((e && e.message) || e).slice(0, 200) });
    await marcarAviso(id, false).catch(() => {});
    return false;
  }
}

// ---------------------------------------------------------------------------
// CUENTAS DE LAS CONSULTANTES · entran a /mi-plan/ con su mail (código de un
// solo uso). El chat y las fotos piden esa cuenta: así nadie de afuera los usa,
// y el tope es por persona. El equipo (perfil habilitado en NuPlan) también
// tiene cuenta y puede ver las fotos de todas.
// ---------------------------------------------------------------------------
export function tokenDe(req) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  return token && token.split(".").length === 3 ? token : "";
}

// { id, email, token } o ErrorDeAcceso (401 sin sesión o vencida, 503 si no se pudo verificar).
export async function usuariaDeToken(req, funcion = "cuenta") {
  const token = tokenDe(req);
  if (!token) throw new ErrorDeAcceso(401, "Para esto tenés que entrar con tu mail.", "sin_sesion");
  let r;
  try {
    r = await consultarSupabase("/auth/v1/user", token, { signal: AbortSignal.timeout(8000) });
  } catch (e) {
    registrar("acceso_error", { funcion, error: String((e && e.message) || e).slice(0, 200) });
    throw new ErrorDeAcceso(503, "No se pudo verificar tu cuenta. Probá de nuevo en un minuto.", "sin_verificar");
  }
  if (r.status === 401 || r.status === 403) {
    throw new ErrorDeAcceso(401, "Tu sesión venció. Volvé a entrar con tu mail.", "sesion_vencida");
  }
  if (!r.ok) {
    registrar("acceso_error", { funcion, estado: r.status });
    throw new ErrorDeAcceso(503, "No se pudo verificar tu cuenta. Probá de nuevo en un minuto.", "sin_verificar");
  }
  const u = await r.json().catch(() => null);
  if (!u || !u.id) throw new ErrorDeAcceso(401, "Tu sesión venció. Volvé a entrar con tu mail.", "sesion_vencida");
  return { id: u.id, email: u.email || "", token };
}

// Del equipo = el mismo criterio que usan NuPlan y la app vieja para dejar entrar:
// tiene perfil y no está "pending". Ante la duda, no.
export async function esEquipo(token, id) {
  try {
    const p = await consultarSupabase(`/rest/v1/profiles?select=role&id=eq.${encodeURIComponent(id)}`, token, {
      signal: AbortSignal.timeout(8000),
    });
    if (!p.ok) return false;
    const filas = await p.json();
    const perfil = Array.isArray(filas) && filas[0] ? filas[0] : null;
    return !!perfil && perfil.role !== "pending";
  } catch {
    return false;
  }
}

// Fotos del programa: carpeta privada "programa-fotos", una subcarpeta por
// consultante (su id). Solo el servidor sube y firma, con la clave de servicio.
export const CARPETA_FOTOS = "programa-fotos";
const MAX_FOTO = 1500000;

async function crearCarpetaFotos() {
  const r = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: "POST",
    headers: cabecerasServicio({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      id: CARPETA_FOTOS,
      name: CARPETA_FOTOS,
      public: false,
      file_size_limit: MAX_FOTO,
      allowed_mime_types: ["image/jpeg"],
    }),
    signal: AbortSignal.timeout(10000),
  });
  const texto = await r.text();
  if (!r.ok && !/already exists|Duplicate|"409"/i.test(texto)) {
    throw new Error(`no se pudo crear la carpeta de fotos (${r.status}): ${texto.slice(0, 160)}`);
  }
  registrar("fotos_carpeta", { creada: r.ok });
}

// Sube una foto. Si ya estaba (un reintento), cuenta como subida.
export async function subirFoto(ruta, bytes) {
  if (!claveServicio()) throw new Error("falta SUPABASE_SERVICE_ROLE_KEY en Vercel");
  if (bytes.length > MAX_FOTO) throw new Error("foto demasiado grande");
  const subir = () =>
    fetch(`${SUPABASE_URL}/storage/v1/object/${CARPETA_FOTOS}/${ruta}`, {
      method: "POST",
      headers: cabecerasServicio({ "Content-Type": "image/jpeg", "x-upsert": "false", "cache-control": "max-age=31536000" }),
      body: bytes,
      signal: AbortSignal.timeout(20000),
    });
  for (let intento = 0; intento < 2; intento++) {
    const r = await subir();
    const texto = await r.text();
    if (r.ok) return { ok: true };
    if (/already exists|Duplicate|"409"/i.test(texto) || r.status === 409) return { ok: true, yaEstaba: true };
    if (intento === 0 && /bucket not found|"404"/i.test(texto)) {
      await crearCarpetaFotos();
      continue;
    }
    throw new Error(`storage respondió ${r.status}: ${texto.slice(0, 160)}`);
  }
  throw new Error("no se pudo subir la foto");
}

// Direcciones firmadas (valen una hora) para mostrar fotos privadas.
export async function firmarFotos(rutas, segundos = 3600) {
  if (!rutas.length) return {};
  if (!claveServicio()) throw new Error("falta SUPABASE_SERVICE_ROLE_KEY en Vercel");
  const r = await fetch(`${SUPABASE_URL}/storage/v1/object/sign/${CARPETA_FOTOS}`, {
    method: "POST",
    headers: cabecerasServicio({ "Content-Type": "application/json" }),
    body: JSON.stringify({ expiresIn: segundos, paths: rutas }),
    signal: AbortSignal.timeout(10000),
  });
  const texto = await r.text();
  if (!r.ok) {
    if (/bucket not found|"404"/i.test(texto)) return {};
    throw new Error(`storage respondió ${r.status}: ${texto.slice(0, 160)}`);
  }
  const filas = JSON.parse(texto || "[]");
  const urls = {};
  for (const f of Array.isArray(filas) ? filas : []) {
    const firmada = f && (f.signedURL || f.signedUrl);
    if (f && f.path && firmada && !f.error) {
      urls[f.path] = /^https?:/.test(firmada) ? firmada : encodeURI(`${SUPABASE_URL}/storage/v1${firmada}`);
    }
  }
  return urls;
}
