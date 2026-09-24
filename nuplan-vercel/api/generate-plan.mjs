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
      "type": "string — etiqueta corta en mayúsculas: DESAYUNO, MEDIA MAÑANA, ALMUERZO, COLACIÓN POST ENTRENAMIENTO, MERIENDA, CENA",
      "title": "string — SOLO el horario, ej: '8:00 hs'. NO repitas el nombre de la comida: ya se muestra en type",
      "items": ["string — un grupo de alimentos con su porción y 3 o 4 opciones equivalentes separadas por \" / \""],
      "tip": "string — cómo combinar los renglones de esa comida, con ejemplos concretos"
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
  "microHabits": [
    { "habit": "string — el micro hábito u objetivo tal como lo indicó la profesional", "tip": "string — cómo empezar esta semana, concreto" }
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
function reglasDeEstructura(metrics = {}, etiquetas = [], objetivos = "", plato = null) {
  // Si la profesional definió el plato a mano, esa proporción manda.
  if (plato && Number.isFinite(plato.veg) && Number.isFinite(plato.prot) && Number.isFinite(plato.carb)) {
    return [
      "PERFIL: plato definido a mano por la Lic. Roldán para este paciente.",
      `Almuerzo y cena: ${plato.veg}% del plato de vegetales, ${plato.prot}% de proteína, ${plato.carb}% de carbohidrato.`,
      "Desayuno y merienda: 1 lácteo o proteína + carbohidrato + fruta, con porciones acordes a esa proporción.",
      plato.carb >= 35
        ? "El carbohidrato tiene peso en cada comida: porciones generosas."
        : "El carbohidrato acompaña: porciones moderadas.",
      etiquetas.includes("Deportista") ? "Sumar una colación post entrenamiento con carbohidrato y proteína." : "",
    ].filter(Boolean).join("\n");
  }
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

${reglasClinicas}

SI DOS GUÍAS SE CONTRADICEN, GANA SIEMPRE LA PROHIBICIÓN.
Ejemplo: si una guía pide priorizar legumbres y otra las prohíbe, las legumbres
NO van. En ese caso cubrí lo que pedía la primera guía con un alimento permitido
por todas (para el hierro, por ejemplo, carne vacuna, pollo, pescado o huevo en
lugar de legumbres). Nunca resuelvas un choque incluyendo el alimento prohibido.`
    : "El paciente no tiene patologías ni características particulares marcadas.";

  const habitos = Array.isArray(preferences?.microHabits) ? preferences.microHabits.filter(Boolean) : [];
  const objetivosEsp = Array.isArray(preferences?.specificObjectives) ? preferences.specificObjectives.filter(Boolean) : [];
  const bloqueHabitos = (habitos.length || objetivosEsp.length)
    ? `MICRO HÁBITOS Y OBJETIVOS ESPECÍFICOS INDICADOS POR LA PROFESIONAL:
${habitos.length ? "Micro hábitos a incorporar: " + habitos.join(" · ") : ""}
${objetivosEsp.length ? "Objetivos específicos: " + objetivosEsp.join(" · ") : ""}
En el campo "microHabits" devolvé cada uno con un tip concreto de cómo empezar esta semana. Es lo primero que la paciente tiene que mejorar: escribilo como un resumen de lo que la profesional escuchó que le hace falta, no como una lista genérica.`
    : "";

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
${reglasDeEstructura(metrics, etiquetas, preferences?.objectives, preferences?.plate)}

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

ASÍ ARMA EL PLAN LA LIC. ROLDÁN — ESTO ES LO MÁS IMPORTANTE DE TODO:

El plan NO es un menú cerrado con una sola comida por momento. Es un ESQUEMA POR
INTERCAMBIOS, como lo arma una nutricionista en el consultorio: cada ítem es UN
GRUPO de alimentos, con su porción, y ofrece de 3 a 4 opciones equivalentes
separadas por " / ". La paciente elige una de cada renglón.

Así se ve un desayuno bien armado:
- "1/2 taza de avena o granola / 2 rebanadas de pan integral / 4 galletitas integrales / 3 galletas de arroz"
- "1 huevo revuelto / 1 taza de leche o yogur / 2 cucharadas soperas de queso untable / 1 rebanada de queso"
- "1 fruta / palta / frutos secos"
- "Infusión a gusto: té, mate o café"

Así se ve un almuerzo bien armado:
- "1/4 plato de arroz, pasta, legumbres o feculentos (papa, batata, choclo) / 2 rebanadas de pan integral / 2 rapiditas"
- "150 g de pollo / pescado / 1 lata chica de atún / 2 huevos / carne vacuna magra"
- "1/2 plato de vegetales crudos o cocidos"
- "1 cucharada de aceite de oliva"
- "1 fruta"

Reglas del esquema:
- Alimentos CLÁSICOS de consultorio argentino. Nada exótico, nada de combinaciones raras, nada que una paciente no encuentre en el super del barrio.
- Todas las opciones de un mismo renglón son equivalentes entre sí en porción y en aporte.
- El tip de cada comida muestra cómo COMBINAR los renglones, con ejemplos concretos. Ej: "avena con leche y frutas, tostada con huevo y palta, café con leche con pan integral y queso".
- MERIENDA: un único ítem que diga "Repetir las opciones del desayuno". El tip aclara que mantiene la misma estructura y que tiene que ser generosa y completa.
- CENA: primer ítem "Repetir el mismo esquema del almuerzo"; segundo ítem con la alternativa de distribuir (carbohidratos y vegetales en el almuerzo, proteína y vegetales en la cena); y el aceite.
- Si el paciente es deportista, sumá COLACIÓN POST ENTRENAMIENTO, aunque sea solo con el tip de cuándo tomarla.
- Las fracciones de plato ("1/4 plato", "1/2 plato") SÍ se usan, siempre acompañadas de los alimentos concretos, como en los ejemplos de arriba.
- NUNCA escribas el nombre de un grupo solo. Ni "vegetales grupo A", ni "vegetales grupo B", ni "carnes magras", ni "frutas", ni "lácteos", ni "cereales". Cada vez que aparezca un grupo, van los alimentos concretos separados por " / ". Está mal: "1/2 plato de vegetales grupo A". Está bien: "1/2 plato de lechuga / acelga / zapallito / berenjena / brócoli / tomate". Está mal: "150 g de carnes magras". Está bien: "150 g de lomo / nalga / peceto / cuadrada / pechuga de pollo".
- La misma regla vale para la LISTA DE COMPRAS: solo alimentos concretos que la paciente pueda buscar en la góndola. Si en la lista aparece el nombre de un grupo en vez de alimentos, la lista está mal.

PORCIONES DE REFERENCIA:
- Quesos: 30 g, 1 rebanada, o 2 cucharadas soperas de untable.
- Proteína animal en comida principal: 150 g.
- Pan: 2 rebanadas. Galletas de arroz o maíz: 3 unidades. Galletitas integrales: 4.
- Cereales y legumbres cocidos: 1/2 a 1 taza.
- Frutos secos como colación: 6 almendras o 2 nueces.
- Frutas: 1 unidad. Nunca cuentes unidades de frutas chicas: va "1 taza de arándanos", no "5 o 6 arándanos".
- Leche, yogur o bebida vegetal: 1 taza. Aceite: 1 cucharada.
Ningún ítem puede ser un condimento suelto disfrazado de alimento: el queso rallado,
las semillas o el aceite para espolvorear van dentro de la descripción de un plato.

REGLAS DE SUPLEMENTACIÓN (campo "supplements"):
- Solo suplementos nutricionales de venta libre y uso habitual: vitamina D, hierro, calcio, B12, Omega 3, magnesio, proteína en polvo, ácido fólico.
- Como máximo 3, y únicamente si hay un motivo concreto en los datos del paciente o en las guías clínicas.
- Nunca incluyas medicamentos, fitoterápicos, quemadores, probióticos de marca, ni nada que requiera receta.
- "name" es el nutriente, no una marca. "dosage" es una dosis estándar de uso habitual (ej: "1000 UI por día"). "reason" explica en una línea por qué se sugiere para ESTE paciente.
- Si no hay un motivo claro, devolvé una lista vacía. Una lista vacía es una respuesta correcta y preferible a un suplemento forzado.
- Si hay embarazo o lactancia, la lista va vacía: los suplementos los indica el médico obstetra.

${bloqueHabitos}

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
