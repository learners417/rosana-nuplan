// NuPlan · Protocolo de deslices (paso LIBERAR)
// Lo llama la página del paso 4 publicada en metodo.nuplan.com.ar.
// Mismo molde que diagnostico.mjs y plan-personalizado.mjs.

import { llamarIA, leerJSON } from "./_lib.mjs";

// Solo estos dominios pueden llamar a esta función desde el navegador.
const PERMITIDOS = [
  "https://metodo.nuplan.com.ar",
  "https://nuplan.com.ar",
  "https://www.nuplan.com.ar",
  "https://app.nuplan.com.ar",
];

function cabeceras(req) {
  const origen = req.headers.get("origin") || "";
  const h = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
  if (PERMITIDOS.includes(origen)) h["Access-Control-Allow-Origin"] = origen;
  return h;
}

function responder(cuerpo, req, status = 200) {
  return new Response(JSON.stringify(cuerpo), { status, headers: cabeceras(req) });
}

// El navegador pregunta primero si puede llamar. Hay que contestarle que sí.
export async function OPTIONS(req) {
  return new Response(null, { status: 204, headers: cabeceras(req) });
}

const VOZ =
  "Sos la voz de Rosana Roldán, nutricionista de Buenos Aires con más de 20 años " +
  "de experiencia clínica, creadora del Método NuPlan. Estás blindando el Protocolo " +
  "de deslices de una consultante en el paso LIBERAR, el cuarto de seis.\n\n" +
  "QUÉ ES EL PROTOCOLO: los 3 pasos que ella escribe DE ANTEMANO para cuando coma " +
  "algo fuera de su plan, para que el desliz no se convierta en abandono. Cuando " +
  "llegue el momento no tiene que pensar: tiene que leer.\n\n" +
  "REGLAS QUE NO SE ROMPEN:\n" +
  "- Nunca uses las palabras dieta, adelgazar, calorías ni kilos.\n" +
  "- Nunca menciones cifras de peso, talla ni IMC.\n" +
  "- La promesa nunca son los kilos: es energía, ganas de vivir y destreza.\n" +
  "- Voseo argentino. Tono cálido y firme. Profesional de verdad, sin hype, sin " +
  "lenguaje de coach, sin frases motivacionales de cartel.\n" +
  "- Nunca digas paciente: decí consultante, o hablale de vos directamente.\n" +
  "- El desliz es un dato, nunca un veredicto sobre quién es ella.\n\n" +
  "TU TRABAJO: pulir SUS tres pasos, no inventar otros distintos. Dejarlos concretos, " +
  "accionables y compasivos, en primera persona. Si compartió su frase de culpa, " +
  "desarmala sin discutirla: mostrale de dónde viene y qué le cuesta.";

function construirPrompt(d) {
  const c = (x) => String(x == null ? "" : x).trim().slice(0, 1200);
  const partes = [
    VOZ,
    "",
    "LO QUE ESCRIBIÓ ELLA",
    "Frase de culpa que se dice después de un desliz: " + (c(d.frase_de_culpa) || "(no la compartió)"),
    "Paso 1 · qué me voy a decir: " + (c(d.que_me_digo) || "(vacío)"),
    "Paso 2 · qué no voy a hacer: " + (c(d.que_no_hago) || "(vacío)"),
    "Paso 3 · cuál es mi próxima comida normal: " + (c(d.proxima_comida) || "(vacío)"),
    "",
    "RESPONDÉ ÚNICAMENTE con un objeto JSON válido, sin texto adicional y sin backticks:",
    '{"apertura": "...", "pasos": ["...", "...", "..."], "recordatorio": "..."}',
    "",
    "- apertura: una o dos frases que enmarcan el protocolo como algo que ella ya " +
      "escribió y solo tiene que leer en el momento.",
    "- pasos: exactamente tres, los de ella pulidos, en primera persona, concretos.",
    "- recordatorio: UNA sola frase corta y firme, en primera persona, para " +
      "reemplazar la frase de culpa.",
  ];
  return partes.join("\n");
}

export async function POST(req) {
  let datos;
  try {
    datos = await leerJSON(req);
  } catch (e) {
    return responder({ error: String(e.message || e) }, req, 400);
  }

  const algo =
    String(datos.que_me_digo || "").trim() ||
    String(datos.que_no_hago || "").trim() ||
    String(datos.proxima_comida || "").trim();
  if (!algo) {
    return responder({ error: "Faltan los tres pasos de la consultante." }, req, 400);
  }

  try {
    const r = await llamarIA(construirPrompt(datos), 1200);
    if (!r || !r.apertura || !Array.isArray(r.pasos) || !r.pasos.length) {
      throw new Error("La IA no devolvió el protocolo completo.");
    }
    return responder(
      {
        apertura: String(r.apertura),
        pasos: r.pasos.map(String).slice(0, 3),
        recordatorio: String(r.recordatorio || ""),
      },
      req
    );
  } catch (e) {
    console.error("Protocolo de deslices falló:", e.message);
    return responder({ error: String(e.message || e) }, req, 502);
  }
}
