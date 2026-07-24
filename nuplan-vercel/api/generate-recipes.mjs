// NuPlan · generación de recetas.
// Devuelve exactamente la estructura que espera el frontend publicado.

import { llamarIA, responderConLatido, leerJSON } from "./_lib.mjs";

function construirPrompt(d) {
  const cant = Math.max(1, Math.min(Number(d.count) || 3, 8));
  return `Sos nutricionista clínico y creás recetas para pacientes.

DATOS DEL PACIENTE (puede venir vacío si es una generación general):
${JSON.stringify(d.patientInfo || null, null, 2)}

PARÁMETROS DEL PEDIDO:
- Tipos de comida pedidos: ${JSON.stringify(d.mealTypes || [])}
- Objetivo indicado por la profesional: ${JSON.stringify(d.objective || "")}
- Tipo de alimentación: ${JSON.stringify(d.dietType || "Normal")}
- Intolerancias / patologías activas: ${JSON.stringify(d.intolerances || [])}
- Etapa de embarazo/lactancia: ${JSON.stringify(d.pregnancyStage || null)}
- Alimentos que NO puede consumir: ${JSON.stringify(d.foodRestrictions || "")}
- Ocultar cifras calóricas: ${d.hideCalories ? "SÍ" : "no"}
- Cantidad de recetas: ${cant}

REGLAS INNEGOCIABLES:
1. Respetá de forma absoluta las intolerancias, patologías y alimentos excluidos. Un alimento no permitido no puede aparecer en ningún ingrediente ni preparación, tampoco como opción.
2. Si "Ocultar cifras calóricas" es SÍ (paciente con trastorno de la conducta alimentaria), no menciones calorías, kilocalorías, gramos de macros ni ninguna cifra nutricional en ningún texto. Describí el aporte en cualidades ("rica en proteínas", "buena fuente de fibra").
3. Ingredientes de disponibilidad habitual en Argentina, con medidas caseras (taza, cucharada, unidad).
4. Español rioplatense, trato de vos, pasos claros y cortos.
5. Recetas realistas para una persona que trabaja: preparación simple, sin técnicas de restaurante.

FORMATO DE SALIDA:
Respondé ÚNICAMENTE con un objeto JSON válido, sin texto antes ni después y sin bloques de código, con exactamente esta estructura:

{
  "headerTitle": "string — título del recetario acorde al objetivo",
  "headerNote": "string — 1 o 2 frases de presentación para la paciente",
  "recipes": [
    {
      "title": "string",
      "objective": "string — para qué sirve esta receta en el plan",
      "prepTime": "string — ej: '25 min'",
      "servings": "string — ej: '2 porciones'",
      "difficulty": "Fácil | Medio | Difícil",
      "ingredients": ["string — con cantidad en medida casera"],
      "preparation": ["string — un paso por elemento"],
      "nutritionalHighlight": "string — aporte nutricional destacado",
      "tip": "string — consejo práctico"
    }
  ]
}

La lista "recipes" debe tener exactamente ${cant} recetas.`;
}

async function generar(datos) {
  const r = await llamarIA(construirPrompt(datos), 8000);
  if (!Array.isArray(r.recipes)) r.recipes = [];
  for (const rec of r.recipes) {
    if (!Array.isArray(rec.ingredients)) rec.ingredients = [];
    if (!Array.isArray(rec.preparation)) rec.preparation = [];
  }
  return r;
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
