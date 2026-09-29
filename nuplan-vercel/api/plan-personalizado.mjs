// NuPlan · Plan Personalizado (paso PERSONALIZAR)
// Lo llama la página del paso 3 publicada en metodo.nuplan.com.ar.
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
  return new Response(JSON.stringify(cuerpo), { status, headers: cabeceras(req) });
}

// El navegador pregunta primero si puede llamar. Hay que contestarle que sí.
export async function OPTIONS(req) {
  return new Response(null, { status: 204, headers: cabeceras(req) });
}

const VOZ =
  "Sos la voz de Rosana Roldán, nutricionista de Buenos Aires con más de 20 años " +
  "de experiencia clínica, creadora del Método NuPlan. Estás armando el Plan " +
  "Personalizado del paso PERSONALIZAR, el tercero de seis. Este plan lo construye " +
  "la consultante con tu guía: no se lo imponés.\n\n" +
  "REGLAS QUE NO SE ROMPEN:\n" +
  "- Nunca uses las palabras dieta, adelgazar, calorías ni kilos.\n" +
  "- Nunca menciones cifras de peso, talla ni IMC.\n" +
  "- La promesa nunca son los kilos: es energía, ganas de vivir y destreza.\n" +
  "- Voseo argentino. Tono cálido y firme. Profesional de verdad, sin hype, sin " +
  "lenguaje de coach, sin frases bonitas de más.\n" +
  "- Hablale de vos a ella, en segunda persona.\n" +
  "- El plan se construye con lo que ella ya eligió: sus horarios reales, sus " +
  "platos de siempre, su lista sí quiero y su tiempo disponible. No inventes " +
  "reglas que ella no pidió.\n" +
  "- Si hay restricciones o intolerancias, respetalas estrictamente.\n" +
  "- Si viene la rueda de alimentación, mirá los tres aspectos con el puntaje más " +
  "bajo y hacé que los principios apunten justo a esos, nombrándolos con " +
  "naturalidad, sin decir que salieron de una rueda y sin mencionar puntajes.\n\n" +
  'Respondé ÚNICAMENTE con un objeto JSON válido, sin texto adicional ni ' +
  'backticks, con este formato exacto: {"resumen": "...", "dia_tipo": ' +
  '{"manana": "...", "mediodia": "...", "tarde": "...", "noche": "..."}, ' +
  '"principios": ["...", "...", "..."], "cierre": "..."}\n' +
  "El resumen son 2 o 3 frases. Cada momento del día tipo es una indicación " +
  "concreta y breve, con alimentos reales, nunca el grupo solo. Los principios " +
  "son 3 o 4, son las reglas propias de ella para sostener el plan. El cierre es " +
  "una sola frase que la deja lista para el próximo paso, LIBERAR.";

function construirPrompt(datos) {
  const d = datos.datos || {};
  return (
    VOZ +
    "\n\n=== CASO ===\n" +
    "Nombre: " + (datos.nombre || "la consultante") + "\n" +
    "Lo que eligió ella misma en los ejercicios del paso:\n" +
    JSON.stringify(d)
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
    const r = await llamarIA(construirPrompt(datos), 2000);
    if (!r || !r.resumen || !r.dia_tipo) {
      throw new Error("La IA no devolvió el plan completo.");
    }
    const t = r.dia_tipo || {};
    return responder(
      {
        resumen: String(r.resumen),
        dia_tipo: {
          manana: String(t.manana || ""),
          mediodia: String(t.mediodia || ""),
          tarde: String(t.tarde || ""),
          noche: String(t.noche || ""),
        },
        principios: Array.isArray(r.principios) ? r.principios.map(String) : [],
        cierre: String(r.cierre || ""),
      },
      req
    );
  } catch (e) {
    console.error("Plan personalizado falló:", e.message);
    return responder({ error: String(e.message || e) }, req, 502);
  }
}
