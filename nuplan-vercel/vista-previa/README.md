# Vista previa de la app de NuPlan

Carpeta estatica. No toca el build de Vercel ni la app de Rosana.

## Como se sube (GitHub web)

1. Entrar a github.com/learners417/rosana-nuplan
2. Pararse en la RAIZ del repo (no entrar a ninguna carpeta)
3. Add file -> Upload files
4. Arrastrar la carpeta `nuplan-vercel` ENTERA (la de este ZIP).
   GitHub la mezcla con la que ya existe, no la reemplaza.
5. Commit changes
6. Vercel deploya solo. Queda en: /vista-previa/

## Importante

- No renombrar la carpeta `vista-previa`.
- No mover el archivo a `api/`. Solo los `.mjs` van ahi.
- Si el archivo baja con nombre tipo "index (1).html", renombrarlo a
  `index.html` antes de subir: los parentesis rompen el deploy entero.

## Que trae

- Onboarding de 6 pantallas (antes del dia 1)
- Los 90 dias, con los 24 ejercicios de las 6 landings + la balanza
  ubicados cada uno en su dia y en su letra
- Modo consultante: 7 pantallas
- Modo Rosana: 5 pantallas, incluido el editor de los 90 dias
- La IA con 6 situaciones reales
- Boton de correccion en cada dia, cada pantalla y cada paso del onboarding

## Como vuelven las correcciones

Por el webhook de GHL que ya existe, con el contrato de campos de siempre:
paso, nombre, email, fecha, mensaje, mensaje_html.
Llegan dos asuntos posibles:
  "Correcciones de la app"  o  "Reviso la app y esta bien"

Lo que ella edita y anota vive en el navegador donde lo abrio.
Que empiece y termine en el mismo dispositivo, y que toque el boton
de enviar antes de cerrar.
