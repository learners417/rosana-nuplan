// NuPlan · Informe de evidencia (paso ACTIVAR)
// Lo llama la página del paso 5 publicada en metodo.nuplan.com.ar.
// Mismo molde que diagnostico.mjs, plan-personalizado.mjs y protocolo-deslices.mjs.

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
  "de experiencia clínica, creadora del Método NuPlan. Estás redactando el Informe " +
  "de evidencia del paso ACTIVAR, el quinto de seis.\n\n" +
  "QUÉ ES ESTE PASO: ella ya rompió el espiral de la recaída. Ahora juntamos la " +
  "prueba de que cambió, para los días en que la duda quiera convencerla de lo " +
  "contrario. La duda no se calla con ganas: se calla con datos.\n\n" +
  "REGLAS QUE NO SE ROMPEN:\n" +
  "- Nunca uses las palabras dieta, adelgazar, calorías ni kilos.\n" +
  "- Nunca menciones cifras de peso, talla ni IMC.\n" +
  "- Los números que te paso son escalas de 0 a 10 de energía, sueño, humor y " +
  "comidas sin hambre emocional. Podés citarlos: no son peso ni medidas del cuerpo.\n" +
  "- La promesa nunca son los kilos: es energía, ganas de vivir y destreza.\n" +
  "- Voseo argentino. Tono cálido y firme. Profesional de verdad, sin hype, sin " +
  "lenguaje de coach, sin frases motivacionales de cartel.\n" +
  "- Nunca digas paciente: decí consultante, o hablale de vos directamente.\n" +
  "- Si algún indicador bajó o quedó igual, nombralo sin dramatizar y proponelo " +
  "como tema para la próxima sesión. No lo escondas ni lo maquilles.";

function construirPrompt(d) {
  const ind = Array.isArray(d.indicadores) ? d.indicadores : [];
  const pruebas = Array.isArray(d.pruebas) ? d.pruebas.slice(0, 20) : [];
  const filas = ind.map(
    (i) =>
      "- " + String(i.indicador || "") + ": día 1 = " + Number(i.dia_1 || 0) +
      ", hoy = " + Number(i.hoy || 0)
  );
  const mejoraron = ind.filter((i) => Number(i.hoy) > Number(i.dia_1)).length;

  const partes = [
    VOZ,
    "",
    "SUS INDICADORES (escala 0 a 10)",
    filas.length ? filas.join("\n") : "(no cargó indicadores)",
    "Indicadores que mejoraron: " + mejoraron + " de " + ind.length,
    "",
    "SUS PRUEBAS CONCRETAS",
    pruebas.length
      ? pruebas.map((p, n) => n + 1 + ". " + String(p).slice(0, 300)).join("\n")
      : "(todavía no cargó ninguna)",
    "",
    "RESPONDÉ ÚNICAMENTE con un objeto JSON válido, sin texto adicional y sin backticks:",
    '{"lectura": "...", "dato_mas_fuerte": "...", "respuesta_a_la_duda": "..."}',
    "",
    "- lectura: dos o tres frases que integran los cuatro indicadores con sus pruebas.",
    "- dato_mas_fuerte: UNA frase que nombra el avance más contundente que tiene.",
    "- respuesta_a_la_duda: UNA frase en primera persona que ella pueda decirse " +
      "cuando la duda aparezca.",
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

  if (!Array.isArray(datos.indicadores) || !datos.indicadores.length) {
    return responder({ error: "Faltan los indicadores del tablero." }, req, 400);
  }

  try {
    const r = await llamarIA(construirPrompt(datos), 1200);
    if (!r || !r.lectura) {
      throw new Error("La IA no devolvió el informe completo.");
    }
    return responder(
      {
        lectura: String(r.lectura),
        dato_mas_fuerte: String(r.dato_mas_fuerte || ""),
        respuesta_a_la_duda: String(r.respuesta_a_la_duda || ""),
      },
      req
    );
  } catch (e) {
    console.error("Informe de evidencia falló:", e.message);
    return responder({ error: String(e.message || e) }, req, 502);
  }
}
