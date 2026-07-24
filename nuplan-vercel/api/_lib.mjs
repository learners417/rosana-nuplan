// NuPlan · utilidades compartidas por las funciones de IA.

export const MODELO = process.env.MODELO_IA || "claude-sonnet-5";

export async function llamarIA(prompt, maxTokens = 8000) {
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
      model: MODELO,
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
