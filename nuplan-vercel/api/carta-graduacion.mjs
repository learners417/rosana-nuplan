// NuPlan · Carta de graduación (paso NATURALIZAR)
// Lo llama la página del paso 6 publicada en metodo.nuplan.com.ar.
// Mismo molde que diagnostico.mjs, plan-personalizado.mjs, protocolo-deslices.mjs
// e informe-evidencia.mjs. Cierra el método completo.

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
  "de experiencia clínica, creadora del Método NuPlan. Estás escribiendo la Carta " +
  "de graduación que cierra el método completo, al final del paso NATURALIZAR, el " +
  "sexto de seis.\n\n" +
  "QUÉ SE CIERRA ACÁ: doce semanas atrás ella empezó con un mapa en blanco. Hoy " +
  "tiene su patrón nombrado, su raíz entendida, su plan propio, su protocolo " +
  "blindado, su evidencia y su manual. La medida del éxito es contraintuitiva: " +
  "que no necesite volver.\n\n" +
  "REGLAS QUE NO SE ROMPEN:\n" +
  "- Nunca uses las palabras dieta, adelgazar, calorías ni kilos.\n" +
  "- Nunca menciones cifras de peso, talla ni IMC.\n" +
  "- La promesa nunca son los kilos: es energía, ganas de vivir y destreza.\n" +
  "- Voseo argentino. Tono cálido y firme. Profesional de verdad, sin hype, sin " +
  "lenguaje de coach, sin frases motivacionales de cartel, sin cursilería.\n" +
  "- Nunca digas paciente: decí consultante, o hablale de vos directamente.\n" +
  "- Las reglas del manual son de ella, no tuyas. Vos las pulís, no las reemplazás: " +
  "misma cantidad, mismo orden, en primera persona.";

function construirPrompt(d) {
  const c = (x) => String(x == null ? "" : x).trim().slice(0, 600);
  const manual = Array.isArray(d.manual) ? d.manual.slice(0, 5) : [];
  const p = d.plan_semanas_dificiles || {};

  const partes = [
    VOZ,
    "",
    "SU NOMBRE: " + (c(d.nombre) || "la consultante"),
    "",
    "SU MANUAL DE AUTONOMÍA (las reglas que escribió ella)",
    manual.length
      ? manual.map((r, i) => i + 1 + ". " + c(r)).join("\n")
      : "(no escribió ninguna)",
    "",
    "SU PLAN PARA LAS SEMANAS DIFÍCILES",
    "Señal de alerta: " + (c(p.senal) || "(no la escribió)"),
    "Lo primero que hace: " + (c(p.primero) || "(no lo escribió)"),
    "Lo que no hace, pase lo que pase: " + (c(p.no_hago) || "(no lo escribió)"),
    "Lo que contestó sobre las semanas difíciles: " +
      (c(d.semana_dificil_pregunta_3) || "(no contestó)"),
    "",
    "RESPONDÉ ÚNICAMENTE con un objeto JSON válido, sin texto adicional y sin backticks:",
    '{"manual": ["...", "..."], "carta": "..."}',
    "",
    "- manual: las MISMAS reglas de ella, pulidas. Misma cantidad (" + manual.length +
      ") y mismo orden, en primera persona, claras y firmes.",
    "- carta: de cuatro a seis frases, de Rosana para ella, empezando por su nombre. " +
      "Celebra la identidad nueva, deja claro que el éxito es no necesitar volver, y " +
      "le recuerda que esas reglas son suyas.",
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

  const manual = Array.isArray(datos.manual) ? datos.manual.filter(Boolean) : [];
  if (manual.length < 3) {
    return responder({ error: "Hacen falta al menos 3 reglas del manual." }, req, 400);
  }

  try {
    const r = await llamarIA(construirPrompt(datos), 1400);
    if (!r || !r.carta) {
      throw new Error("La IA no devolvió la carta completa.");
    }
    return responder(
      {
        manual: Array.isArray(r.manual) ? r.manual.map(String) : manual,
        carta: String(r.carta),
      },
      req
    );
  } catch (e) {
    console.error("Carta de graduación falló:", e.message);
    return responder({ error: String(e.message || e) }, req, 502);
  }
}
