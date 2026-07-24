# NuPlan — app de Rosana Roldán

App de gestión nutricional. Frontend compilado + funciones de IA propias.

## Estructura
- `index.html` + `assets/` — la aplicación (React compilado). Se conecta a Supabase (proyecto propio).
- `api/generate-plan.mjs` — genera el plan alimentario con IA.
- `api/generate-recipes.mjs` — genera recetas con IA.
- `api/normalize-excel.mjs` — mapea columnas de planillas importadas con IA.
- `vercel.json` — ruteo SPA y tiempo máximo de funciones.

## Deploy (Vercel)
1. Importar este repo en Vercel (Framework: **Other**, sin build command, output: raíz).
2. Variable de entorno obligatoria: `ANTHROPIC_API_KEY`.
3. Opcional: `MODELO_IA` para cambiar el modelo (por defecto claude-sonnet-5).

## Nota
El frontend es el bundle compilado recuperado el 24/7/2026 (con la URL de
Supabase corregida). Para modificar la interfaz o las fórmulas hay que
reconstruir el código fuente — proyecto aparte.
