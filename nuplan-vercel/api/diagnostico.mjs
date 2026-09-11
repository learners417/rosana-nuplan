// NuPlan · Diagnóstico de las 4 Dimensiones (paso NUTRIR)
// Lo llaman las páginas del método publicadas en metodo.nuplan.com.ar.
// Usa la misma clave y el mismo respaldo de modelo que el resto de la app.

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
  return new Response(JSON.stringify(cuerpo), {
    status,
    headers: cabeceras(req),
  });
}

// El navegador pregunta primero si puede llamar. Hay que contestarle que sí.
export async function OPTIONS(req) {
  return new Response(null, { status: 204, headers: cabeceras(req) });
}

const VOZ =
  "Sos la voz de Rosana Roldán, nutricionista de Buenos Aires con más de 20 años " +
  "de experiencia clínica, creadora del Método NuPlan. Estás escribiendo el " +
  "Diagnóstico de las 4 Dimensiones que recibe una consultante al terminar el " +
  "paso NUTRIR, el primero del método.\n\n" +
  "REGLAS QUE NO SE ROMPEN:\n" +
  "- Nunca menciones cifras de peso, talla ni IMC en el texto. Los datos clínicos " +
  "te sirven de contexto interno y no se repiten.\n" +
  "- Nunca uses las palabras dieta, adelgazar, calorías ni kilos.\n" +
  "- La promesa nunca son los kilos: es energía, ganas de vivir y destreza.\n" +
  "- Voseo argentino. Tono cálido y firme. Profesional de verdad, sin hype, sin " +
  "lenguaje de coach, sin frases bonitas de más.\n" +
  "- Hablale de vos a ella, en segunda persona.\n\n" +
  "Recibís los datos clínicos de contexto y el resultado del quiz emocional: un " +
  "puntaje de 0 a 10 en cada una de las cuatro dimensiones (física, emocional, " +
  "energética y mental). Escribís un diagnóstico integrado: cuál parece ser la " +
  "dimensión raíz, cómo se conectan entre sí, y un cierre que la oriente al " +
  "próximo paso del método, que es UNIR, la raíz emocional.\n\n" +
  'Respondé ÚNICAMENTE con un objeto JSON válido, sin texto adicional ni ' +
  'backticks, con este formato exacto: {"diagnostico": "...", ' +
  '"dimension_raiz": "...", "giro_final": "..."}\n' +
  "El diagnóstico son 3 o 4 frases. La dimensión raíz es una sola palabra: " +
  "Física, Emocional, Energética o Mental. El giro final es una sola frase.";

function construirPrompt(datos) {
  const d = datos.dimensiones || {};
  const c = datos.clinico || {};
  return (
    VOZ +
    "\n\n=== CASO ===\n" +
    "Nombre: " + (datos.nombre || "la consultante") + "\n" +
    "Datos clínicos de contexto, uso interno, no los repitas: " +
    JSON.stringify(c) + "\n" +
    "Resultado del quiz, de 0 a 10 por dimensión: " +
    "Física=" + (d.fisica ?? 0) + ", " +
    "Emocional=" + (d.emocional ?? 0) + ", " +
    "Energética=" + (d.energetica ?? 0) + ", " +
    "Mental=" + (d.mental ?? 0)
  );
}

export async function POST(req) {
  let datos;
  try {
    datos = await leerJSON(req);
  } catch (e) {
    return responder({ error: String(e.message || e) }, req, 400);
  }

  try {
    const r = await llamarIA(construirPrompt(datos), 1200);
    if (!r || !r.diagnostico || !r.dimension_raiz) {
      throw new Error("La IA no devolvió el diagnóstico completo.");
    }
    return responder(
      {
        diagnostico: String(r.diagnostico),
        dimension_raiz: String(r.dimension_raiz),
        giro_final: String(r.giro_final || ""),
      },
      req
    );
  } catch (e) {
    console.error("Diagnóstico falló:", e.message);
    return responder({ error: String(e.message || e) }, req, 502);
  }
}
