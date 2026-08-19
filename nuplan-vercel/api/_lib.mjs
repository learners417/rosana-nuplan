// NuPlan · utilidades compartidas por las funciones de IA.

// El modelo se cambia con la variable de entorno MODELO_IA en Vercel.
// Sonnet razona antes de responder y ese razonamiento descuenta del mismo
// max_tokens, por eso los límites de las funciones tienen margen de sobra.
export const MODELO = process.env.MODELO_IA || "claude-sonnet-5";

// Respaldo: si el modelo principal falla o está saturado, se reintenta con
// este otro antes de mostrarle un error a la profesional. Un plan hecho con
// el modelo de respaldo es peor que el bueno, pero muchísimo mejor que
// ningún plan con una paciente sentada enfrente.
export const MODELO_RESPALDO = process.env.MODELO_IA_RESPALDO || "claude-haiku-4-5";

// Errores que justifican reintentar: caídas del servicio, saturación,
// tiempos de espera y cortes de red. Un error de clave o de pedido mal
// armado NO se reintenta, porque va a fallar igual.
function convieneReintentar(e) {
  const m = String((e && e.message) || e);
  return (
    /La API respondió (429|500|502|503|504|529)/.test(m) ||
    /formato válido/.test(m) ||
    /fetch failed|network|timeout|ETIMEDOUT|ECONNRESET|socket/i.test(m)
  );
}

export async function llamarIA(prompt, maxTokens = 8000) {
  try {
    return await pedirALaIA(prompt, maxTokens, MODELO);
  } catch (e) {
    if (MODELO_RESPALDO === MODELO || !convieneReintentar(e)) throw e;
    console.warn(
      `Falló ${MODELO} (${e.message}). Reintentando con ${MODELO_RESPALDO}.`
    );
    return await pedirALaIA(prompt, maxTokens, MODELO_RESPALDO);
  }
}

async function pedirALaIA(prompt, maxTokens, modelo) {
  const clave = process.env.ANTHROPIC_API_KEY;
  if (!clave) {
    throw new Error(
      "Falta la clave ANTHROPIC_API_KEY en las variables de entorno del proyecto."
    );
  }

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": clave,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: modelo,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!r.ok) {
    const detalle = await r.text();
    throw new Error(`La API respondió ${r.status}: ${detalle.slice(0, 300)}`);
  }

  const data = await r.json();
  let texto = (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();

  if (texto.startsWith("```")) {
    texto = texto.replace(/^```[a-zA-Z]*\s*/, "").replace(/```\s*$/, "");
  }
  const desde = texto.indexOf("{");
  const hasta = texto.lastIndexOf("}");
  if (desde === -1 || hasta === -1) {
    throw new Error("La IA no devolvió una respuesta en formato válido.");
  }
  return JSON.parse(texto.slice(desde, hasta + 1));
}

// Responde en streaming: manda espacios mientras la IA trabaja para que la
// conexión no se corte por tiempo. Los espacios delante de un JSON son
// válidos y el navegador los ignora al parsear.
export function responderConLatido(trabajo) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const latido = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(" "));
        } catch {}
      }, 2000);
      try {
        const resultado = await trabajo();
        clearInterval(latido);
        controller.enqueue(encoder.encode(JSON.stringify(resultado)));
      } catch (e) {
        clearInterval(latido);
        controller.enqueue(
          encoder.encode(JSON.stringify({ error: String(e.message || e) }))
        );
      }
      controller.close();
    },
  });
  return new Response(stream, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function leerJSON(req) {
  if (req.method !== "POST") {
    throw new Error("Método no permitido");
  }
  try {
    return await req.json();
  } catch {
    throw new Error("Pedido inválido");
  }
}
