// NuPlan · generación de plan alimentario
// Devuelve exactamente la estructura que espera el frontend ya publicado.
// Incorpora las guías clínicas de la Lic. Roldán (ver _patologias.mjs).

import { llamarIA, responderConLatido, leerJSON } from "./_lib.mjs";
import {
  reglasDeLasCaracteristicas,
  patologiasConGuia,
  coladosEnElPlan,
} from "./_patologias.mjs";

const ESQUEMA = `{
  "planObjective": "string — 2 o 3 frases, objetivo del plan para este paciente",
  "dailyPlan": [
    {
      "type": "string — etiqueta corta en mayúsculas: DESAYUNO, MEDIA MAÑANA, ALMUERZO, MERIENDA, CENA, COLACIÓN",
      "title": "string — SOLO el horario, ej: '8:00 hs'. NO repitas el nombre de la comida: ya se muestra en type",
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

// Estructura de las comidas según la situación del paciente.
// Criterio de la Lic. Roldán: en descenso de peso queda el reparto actual;
// en normopeso, aumento de peso o ganancia muscular sube el carbohidrato.
function reglasDeEstructura(metrics = {}, etiquetas = [], objetivos = "") {
  if (etiquetas.includes("Embarazo y Lactancia")) {
    return [
      "PERFIL: embarazo o lactancia.",
      "3 comidas principales + 2 o 3 colaciones, sin saltear ninguna.",
      "Cada comida principal lleva proteína, carbohidrato y vegetales.",
      "Desayuno y merienda con la misma estructura: lácteo o proteína + carbohidrato + fruta.",
    ].join("\n");
  }
  const categoria = String(metrics.bmiCategory || "");
  const texto = String(objetivos || "").toLowerCase();
  const deportista = etiquetas.includes("Deportista");
  const quiereSubir =
    /aumento de peso|subir de peso|ganar (masa )?muscular|masa muscular|hipertrofia/.test(
      texto
    );

  const descenso =
    categoria.startsWith("Sobrepeso") ||
    /descenso|bajar de peso|bajar grasa|perder peso/.test(texto);

  if (descenso && !quiereSubir) {
    return [
      "PERFIL: descenso de peso.",
      "Desayuno y merienda: 1 lácteo o proteína + 1 porción moderada de carbohidrato + 1 fruta.",
      "Almuerzo y cena: mitad del plato de vegetales, un cuarto de proteína, un cuarto de carbohidrato.",
      "Merienda con la misma estructura que el desayuno.",
    ].join("\n");
  }

  return [
    `PERFIL: ${
      quiereSubir || deportista ? "ganancia de peso o masa muscular" : "normopeso, mantenimiento"
    }.`,
    "El carbohidrato es el grupo que más peso tiene en cada comida: porciones más generosas que en un plan de descenso.",
    "Desayuno: carbohidrato como base (avena, pan, cereales) + proteína + fruta.",
    "Merienda: exactamente la misma estructura y volumen que el desayuno.",
    "Almuerzo y cena: un tercio del plato de carbohidrato, un cuarto de proteína, el resto de vegetales.",
    "La cena mantiene la misma estructura completa que el almuerzo: no es una comida reducida.",
    deportista
      ? "Sumar una colación post entrenamiento con carbohidrato y proteína."
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function construirPrompt({ patientInfo, metrics, preferences }) {
  const etiquetas = Array.isArray(preferences?.intolerances)
    ? preferences.intolerances
    : [];
  const reglasClinicas = reglasDeLasCaracteristicas(etiquetas);
  const conGuia = patologiasConGuia(etiquetas);
  const ocultarCalorias = !!preferences?.hideCalories;
  const embarazo = etiquetas.includes("Embarazo y Lactancia");

  const bloqueClinico = reglasClinicas
    ? `GUÍAS CLÍNICAS DE LA PROFESIONAL — SON DE CUMPLIMIENTO OBLIGATORIO.
Estas reglas están por encima de cualquier criterio general tuyo. Si algo del plan
las contradice, el plan está mal.

${reglasClinicas}`
    : "El paciente no tiene patologías ni características particulares marcadas.";

  const bloqueMenu = conGuia.length
    ? `MENÚ MODELO OBLIGATORIO:
Dentro de "recommendationsAndRecipes", la PRIMERA entrada debe titularse
"Menú modelo — ${conGuia.join(" · ")}" y desarrollar un menú completo de un día
(Desayuno, Media mañana, Almuerzo, Merienda, Cena), escrito en párrafo corrido y
alineado a las guías clínicas de arriba. Es el menú que la paciente se lleva impreso.`
    : "";

  return `Sos nutricionista clínico del equipo de la Lic. Rosana Roldán (NuPlan) y armás un plan alimentario personalizado.

DATOS DEL PACIENTE:
${JSON.stringify(patientInfo, null, 2)}

CÁLCULOS YA REALIZADOS POR EL SISTEMA (usalos tal cual, no los recalcules):
${JSON.stringify(metrics, null, 2)}

PREFERENCIAS Y CONDICIONES INDICADAS POR LA PROFESIONAL:
${JSON.stringify(preferences, null, 2)}

${bloqueClinico}

ESTRUCTURA DE LAS COMIDAS:
${reglasDeEstructura(metrics, etiquetas, preferences?.objectives)}

REGLAS INNEGOCIABLES:
1. Respetá de forma absoluta los alimentos excluidos, alergias e intolerancias, y todo lo que figure como prohibido en las guías clínicas. Un alimento no permitido no puede aparecer en ninguna parte del plan: ni en las comidas, ni en los grupos de alimentos, ni en las ideas de menú, ni en los reemplazos, ni en la lista de compras, ni en las recetas.
2. Ajustate al valor calórico objetivo y a los gramos de proteína ya calculados. No inventes otros números ni corrijas los cálculos del sistema.
3. ${
    ocultarCalorias
      ? "ESTÁ ACTIVADO EL MODO SIN CIFRAS (paciente con trastorno de la conducta alimentaria). No menciones calorías, kilocalorías, gramos, macros, porcentajes ni ninguna cifra numérica en ningún texto del plan. Hablá solo de porciones y medidas caseras."
      : embarazo
      ? "No organices el plan alrededor de las calorías ni menciones el IMC: en embarazo y lactancia el eje son las comidas completas, las porciones y la cobertura de nutrientes. Podés nombrar los gramos de proteína."
      : "Podés mencionar el valor calórico y los gramos de proteína cuando aporte claridad, siempre con las cifras que ya calculó el sistema."
  }
4. Contemplá embarazo, lactancia, menopausia o práctica deportiva si están indicados.
5. Alimentos de disponibilidad habitual en Argentina. Español rioplatense, trato de vos, claro y sin tecnicismos innecesarios.
6. Porciones en medidas caseras (taza, cucharada, plato, unidad).
7. No incluyas diagnósticos médicos ni indicaciones farmacológicas.

CÓMO SE ESCRIBE CADA COMIDA:
- Cada ítem es un alimento con su medida casera concreta: "1 taza de arroz cocido", "1 pechuga de pollo (150 g)".
- NUNCA escribas "mitad del plato", "un cuarto del plato" ni porcentajes dentro de un ítem. Esas proporciones son para que vos calcules, no para que las copies: el paciente tiene que leer comida, no una fórmula.
- Ningún ítem puede ser un condimento presentado como alimento. Un poco de queso rallado, una cucharadita de aceite o unas semillas para espolvorear van dentro de la descripción de un plato, nunca como ítem propio.
- La merienda tiene el mismo volumen que el desayuno, no una versión reducida.

PORCIONES MÍNIMAS — NO SE BAJA DE ACÁ:
- Quesos: 30 g (una feta o 2 cucharadas colmadas de rallado). Nunca "1 cucharada".
- Frutas chicas (arándanos, frutillas, uvas, cerezas): 1 taza o 1 puñado grande. Nunca "5 o 6 unidades".
- Frutas medianas: 1 unidad entera.
- Frutos secos: 1 puñado (30 g).
- Pan: 2 rebanadas. Galletas de arroz o maíz: 3 unidades.
- Cereales y legumbres cocidos: 1 taza.
- Proteína animal: 120 a 150 g.
- Vegetales cocidos o crudos: 2 tazas.
- Leche o bebida vegetal: 1 taza (200 a 250 ml). Yogur: 1 pote.
- Aceite: 1 cucharada.
Si el objetivo calórico no cierra, sacá ítems o bajá la cantidad de comidas: NUNCA achiques una porción por debajo de estos mínimos. Un plan con porciones irrisorias no se puede sostener y desprestigia a la profesional.

REGLAS DE SUPLEMENTACIÓN (campo "supplements"):
- Solo suplementos nutricionales de venta libre y uso habitual: vitamina D, hierro, calcio, B12, Omega 3, magnesio, proteína en polvo, ácido fólico.
- Como máximo 3, y únicamente si hay un motivo concreto en los datos del paciente o en las guías clínicas.
- Nunca incluyas medicamentos, fitoterápicos, quemadores, probióticos de marca, ni nada que requiera receta.
- "name" es el nutriente, no una marca. "dosage" es una dosis estándar de uso habitual (ej: "1000 UI por día"). "reason" explica en una línea por qué se sugiere para ESTE paciente.
- Si no hay un motivo claro, devolvé una lista vacía. Una lista vacía es una respuesta correcta y preferible a un suplemento forzado.
- Si hay embarazo o lactancia, la lista va vacía: los suplementos los indica el médico obstetra.

${bloqueMenu}

FORMATO DE SALIDA:
Respondé ÚNICAMENTE con un objeto JSON válido que siga exactamente esta estructura, sin texto antes ni después, sin explicaciones y sin bloques de código:

${ESQUEMA}

El plan diario debe tener entre 4 y 6 comidas. Cada lista de alimentos, entre 4 y 8 ítems.`;
}

// Suplementos permitidos. Filtra lo que la IA devuelva fuera de norma.
const SUPLEMENTOS_OK = [
  "vitamina d",
  "vitamina b12",
  "b12",
  "hierro",
  "calcio",
  "omega 3",
  "omega-3",
  "dha",
  "magnesio",
  "ácido fólico",
  "acido folico",
  "folato",
  "proteína",
  "proteina",
  "whey",
  "zinc",
  "vitamina c",
];

function limpiarSuplementos(lista, preferences) {
  if (!Array.isArray(lista)) return [];
  const etiquetas = Array.isArray(preferences?.intolerances)
    ? preferences.intolerances
    : [];
  if (etiquetas.includes("Embarazo y Lactancia")) return [];

  return lista
    .filter((s) => s && typeof s === "object" && s.name)
    .filter((s) => {
      const n = String(s.name).toLowerCase();
      return SUPLEMENTOS_OK.some((ok) => n.includes(ok));
    })
    .map((s) => ({
      name: String(s.name).trim(),
      dosage: String(s.dosage || "Según indicación profesional").trim(),
      reason: String(s.reason || "").trim(),
    }))
    .slice(0, 3);
}

// Junta todo el texto del plan para poder revisarlo.
function textoDelPlan(plan) {
  try {
    return JSON.stringify(plan);
  } catch {
    return "";
  }
}

async function generar(datos) {
  const etiquetas = Array.isArray(datos?.preferences?.intolerances)
    ? datos.preferences.intolerances
    : [];

  let plan = await llamarIA(construirPrompt(datos), 16000);

  // Red de seguridad: si se coló un alimento prohibido por la patología,
  // se pide una corrección una sola vez.
  const colados = coladosEnElPlan(etiquetas, textoDelPlan(plan));
  if (colados.length) {
    const correccion = `${construirPrompt(datos)}

CORRECCIÓN OBLIGATORIA:
Un intento anterior incluyó alimentos que están prohibidos para este paciente: ${colados.join(", ")}.
Rehacé el plan completo sin ninguno de esos alimentos, en ninguna comida, ni como opción, ni como reemplazo, ni en los grupos de alimentos, ni en las ideas de menú, ni en la lista de compras, ni en las recetas. Reemplazalos por alternativas permitidas según las guías clínicas.`;
    try {
      plan = await llamarIA(correccion, 16000);
    } catch (e) {
      console.error("Fallo el reintento de corrección:", e);
    }
  }
  if (!plan.hydrationPlan || typeof plan.hydrationPlan !== "object") plan.hydrationPlan = {};
  if (!plan.healthyPlate || typeof plan.healthyPlate !== "object") plan.healthyPlate = {};
  if (!Array.isArray(plan.dailyPlan)) plan.dailyPlan = [];
  plan.supplements = limpiarSuplementos(plan.supplements, datos?.preferences);

  const restantes = coladosEnElPlan(etiquetas, textoDelPlan(plan));
  if (restantes.length) {
    console.warn("Plan entregado con alimentos a revisar:", restantes.join(", "));
  }
  return plan;
}

export async function POST(req) {
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
}

// Exportado solo para pruebas locales.
export { construirPrompt, limpiarSuplementos };
