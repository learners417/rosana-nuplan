// NuPlan · generación de plan alimentario
// Reemplazo de la función original. Devuelve exactamente la estructura
// que espera el frontend ya publicado.

import { MODELO, llamarIA, responderConLatido, leerJSON } from "./_lib.mjs";

const ESQUEMA = `{
  "planObjective": "string — 2 o 3 frases, objetivo del plan para este paciente",
  "dailyPlan": [
    {
      "type": "string — etiqueta corta en mayúsculas: DESAYUNO, MEDIA MAÑANA, ALMUERZO, MERIENDA, CENA, COLACIÓN",
      "title": "string — nombre y horario sugerido, ej: 'Desayuno · 8:00'",
      "items": ["string — cada opción con medida casera"],
      "tip": "string — un consejo breve para esa comida"
    }
  ],
  "hydrationPlan": {
    "targetLiters": 0,
    "equivalentGlasses": 0,
    "wakeupTip": "string — hidratación al despertar",
    "workDayTip": "string — hidratación durante la jornada",
    "nightTip": "string — hidratación en la noche"
  },
  "healthyPlate": { "proteinsPct": 0, "carbsPct": 0, "fatsPct": 0 },
  "foodGroupsDetail": {
    "carbs": ["string"],
    "proteins": ["string"],
    "fats": ["string"],
    "vegetablesA": ["string"],
    "vegetablesB": ["string"],
    "fruits": ["string"]
  },
  "menuIdeas": {
    "carbsIdeas": ["string — ideas de platos con carbohidratos"],
    "proteinIdeas": ["string — ideas de platos con proteínas"]
  },
  "recommendationsAndRecipes": [
    { "title": "string", "content": "string — receta o recomendación desarrollada" }
  ],
  "supplements": [
    { "name": "string", "dosage": "string", "reason": "string" }
  ],
  "substitutes": [
    { "category": "string — ej: Reemplazos de pan", "options": ["string"] }
  ],
  "shoppingList": {
    "carbsAndLegumes": ["string"],
    "proteins": ["string"],
    "dairy": ["string"],
    "vegetablesAndFruits": ["string"],
    "fats": ["string"],
    "canned": ["string"],
    "frozen": ["string"]
  }
}`;

function construirPrompt({ patientInfo, metrics, preferences }) {
  return `Sos nutricionista clínico y armás un plan alimentario personalizado.

DATOS DEL PACIENTE:
${JSON.stringify(patientInfo, null, 2)}

CÁLCULOS YA REALIZADOS POR EL SISTEMA (usalos tal cual, no los recalcules):
${JSON.stringify(metrics, null, 2)}

PREFERENCIAS Y CONDICIONES INDICADAS POR LA PROFESIONAL:
${JSON.stringify(preferences, null, 2)}

REGLAS INNEGOCIABLES:
1. Respetá de forma absoluta los alimentos excluidos, alergias e intolerancias. Si un alimento figura como no permitido, no puede aparecer en ninguna parte del plan, ni como opción ni como reemplazo.
2. Ajustate al valor calórico objetivo y a los gramos de proteína ya calculados. No inventes otros números ni corrijas los cálculos del sistema.
3. Si en las preferencias figura ocultar el requerimiento calórico (pacientes con trastorno de la conducta alimentaria), no menciones calorías, kilocalorías, gramos, macros ni ninguna cifra numérica en ningún texto del plan. Hablá de porciones y medidas caseras.
4. Contemplá embarazo, lactancia, menopausia o práctica deportiva si están indicados.
5. Alimentos de disponibilidad habitual en Argentina. Español rioplatense, trato de vos, claro y sin tecnicismos innecesarios.
6. Porciones en medidas caseras (taza, cucharada, plato, unidad).
7. No incluyas diagnósticos médicos ni indicaciones farmacológicas. En "supplements" incluí solo suplementos nutricionales de uso habitual y, si no corresponde ninguno, devolvé una lista vacía.

FORMATO DE SALIDA:
Respondé ÚNICAMENTE con un objeto JSON válido que siga exactamente esta estructura, sin texto antes ni después, sin explicaciones y sin bloques de código:

${ESQUEMA}

El plan diario debe tener entre 4 y 6 comidas. Cada lista de alimentos, entre 4 y 8 ítems.`;
}

async function generar(datos) {
  const plan = await llamarIA(construirPrompt(datos), 8000);
  if (!plan.hydrationPlan || typeof plan.hydrationPlan !== "object") plan.hydrationPlan = {};
  if (!plan.healthyPlate || typeof plan.healthyPlate !== "object") plan.healthyPlate = {};
  if (!Array.isArray(plan.dailyPlan)) plan.dailyPlan = [];
  return plan;
}

export default async (req) => {
  let datos;
  try {
    datos = await leerJSON(req);
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e.message || e) }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  return responderConLatido(() => generar(datos));
};
