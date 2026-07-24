// NuPlan · normalización de Excel importado.
// Recibe { headers: [...], rows: [[...], ...] } (encabezados y filas crudas).
// La IA solo decide QUÉ columna corresponde a QUÉ campo (column_mapping);
// la transformación de las filas se hace acá, en código, de forma
// determinística. Devuelve { rows: [objetos], column_mapping }.

import { llamarIA, responderConLatido, leerJSON } from "./_lib.mjs";

const CAMPOS = [
  "first_name",
  "last_name",
  "email",
  "phone",
  "birth_date",
  "sex",
  "area",
  "initial_weight",
  "height",
  "first_session_date",
  "adherence",
  "hydration",
  "physical_activity",
  "consumo_frutas_verduras",
  "energy_level",
  "sleep_quality",
];

function construirPrompt(headers, filasEjemplo) {
  return `Recibís los encabezados de una planilla de pacientes de nutrición y algunas filas de ejemplo. Tu única tarea es mapear cada campo del sistema a la columna de la planilla que le corresponde.

CAMPOS DEL SISTEMA:
${CAMPOS.join(", ")}

Significado: first_name y last_name (nombre y apellido — si la planilla trae el nombre completo en una sola columna, asigná esa columna a first_name y dejá last_name sin mapear), email, phone (teléfono), birth_date (fecha de nacimiento), sex (sexo/género), area (área o empresa), initial_weight (peso en kg), height (altura en cm), first_session_date (fecha de primera consulta), adherence (adherencia), hydration (hidratación), physical_activity (actividad física), consumo_frutas_verduras, energy_level (nivel de energía), sleep_quality (calidad de sueño).

ENCABEZADOS DE LA PLANILLA (con su índice):
${JSON.stringify(headers.map((h, i) => ({ indice: i, encabezado: h })), null, 2)}

FILAS DE EJEMPLO:
${JSON.stringify(filasEjemplo, null, 2)}

Respondé ÚNICAMENTE con un objeto JSON, sin texto adicional, con esta forma:
{"column_mapping": {"first_name": 0, "last_name": 1}}

Reglas:
- Las claves son campos del sistema; los valores, el ÍNDICE numérico de la columna.
- Incluí solo los campos que realmente puedas mapear con confianza. No inventes.
- Ningún índice puede repetirse en dos campos.`;
}

function texto(v) {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

function numero(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function fecha(v) {
  const s = texto(v);
  if (s === null) {
    // número de serie de Excel
    const n = numero(v);
    if (n !== null && n > 20000 && n < 60000) {
      const d = new Date(Date.UTC(1899, 11, 30) + n * 86400000);
      return d.toISOString().slice(0, 10);
    }
    return null;
  }
  const n = numero(s);
  if (n !== null && n > 20000 && n < 60000 && /^\d+(\.\d+)?$/.test(s)) {
    const d = new Date(Date.UTC(1899, 11, 30) + n * 86400000);
    return d.toISOString().slice(0, 10);
  }
  let m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  m = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})/);
  if (m) {
    let a = m[3].length === 2 ? (Number(m[3]) > 30 ? "19" + m[3] : "20" + m[3]) : m[3];
    return `${a}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  }
  return s;
}

function transformar(campo, v) {
  if (v === null || v === undefined) return null;
  if (campo === "birth_date" || campo === "first_session_date") return fecha(v);
  if (campo === "initial_weight" || campo === "height") return numero(v);
  return texto(v);
}

async function normalizar({ headers, rows }) {
  if (!Array.isArray(headers) || !Array.isArray(rows)) {
    throw new Error("La planilla llegó vacía o en un formato no reconocido.");
  }

  const ejemplo = rows.slice(0, 5);
  const r = await llamarIA(construirPrompt(headers, ejemplo), 1500);
  const mapping = r.column_mapping || {};

  const filas = rows.map((fila) => {
    const obj = {};
    for (const campo of CAMPOS) {
      const idx = mapping[campo];
      if (idx === undefined || idx === null) continue;
      const crudo = Array.isArray(fila) ? fila[idx] : fila[headers[idx]];
      obj[campo] = transformar(campo, crudo);
    }
    return obj;
  });

  // column_mapping legible para la interfaz: campo -> nombre de columna
  const mapeoLegible = {};
  for (const [campo, idx] of Object.entries(mapping)) {
    mapeoLegible[campo] = headers[idx] ?? String(idx);
  }

  return { rows: filas, column_mapping: mapeoLegible };
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
  return responderConLatido(() => normalizar(datos));
}
