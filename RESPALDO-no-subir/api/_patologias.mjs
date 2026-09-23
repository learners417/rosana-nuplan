// NuPlan · biblioteca de patologías y características.
//
// Cada entrada traduce las guías clínicas de la Lic. Rosana Roldán a reglas
// que la IA debe respetar sí o sí al armar el plan. El texto sale de los
// documentos "Guía práctica de alimentación para vos" de Nuplan.
//
// La clave debe coincidir EXACTAMENTE con la etiqueta que muestra la app
// (arrays KR y GR del frontend). Los alias cubren nombres viejos guardados
// en planes anteriores.

export const PATOLOGIAS = {
  "Anemia": {
    alias: ["Anemia Ferropénica", "Anemia ferropenica"],
    objetivo:
      "Aumentar el aporte de hierro y mejorar su absorción. Los resultados se ven en meses, no en días.",
    priorizar: [
      "Hierro animal 4 a 5 veces por semana: carne vacuna, hígado, morcilla, pollo, pescado",
      "Hierro vegetal todos los días: legumbres, espinaca, acelga, quinoa, semillas de sésamo y zapallo",
      "Vitamina C en la misma comida que el hierro vegetal: naranja, mandarina, limón, kiwi, morrón, tomate",
      "Huevo, lácteos y frutos secos todos los días",
    ],
    evitar: [
      "Café, té o mate junto con las comidas (separarlos al menos 1 hora antes o después)",
      "Leche o quesos dentro de la comida principal: el calcio compite con el hierro",
    ],
    reglas: [
      "Toda comida con hierro vegetal debe llevar una fuente de vitamina C en el mismo plato.",
      "Los lácteos van en desayuno o merienda, nunca dentro del almuerzo o la cena.",
      "Las infusiones se ubican fuera de las comidas principales.",
    ],
    tips: [
      "Unas gotas de limón sobre ensaladas y legumbres mejoran la absorción del hierro.",
      "El cuerpo tarda entre 3 y 6 meses en recuperar sus reservas: el cansancio mejora de a poco.",
      "Si tomás suplemento de hierro, es normal que las heces se vean más oscuras.",
    ],
  },

  "SIBO": {
    alias: ["SiBO", "Sibo"],
    objetivo:
      "Reducir por un tiempo los alimentos que más fermentan, para bajar el gas y la distensión mientras avanza el tratamiento médico.",
    priorizar: [
      "Proteínas: carnes, pollo, pescado, huevo, tofu firme",
      "Vegetales: zanahoria, zapallo, chaucha, tomate, zapallito, espinaca, morrón rojo",
      "Frutas en porción moderada: banana firme, arándanos, frutilla, uva, mandarina, kiwi",
      "Cereales: arroz, avena sin gluten, quinoa, polenta",
      "Lácteos: leche sin lactosa, quesos duros (sardo, parmesano), bebida de almendras",
      "Grasas: aceite de oliva, un poco de palta, un puñado chico de frutos secos",
    ],
    evitar: [
      "Cebolla, ajo y trigo",
      "Legumbres: lentejas, garbanzos, porotos",
      "Leche, yogur común y quesos blandos (ricota, queso crema)",
      "Miel, manzana, pera, mango",
      "Sorbitol, xilitol, champiñones, coliflor",
      "Bebidas con gas",
    ],
    reglas: [
      "Ningún alimento de la lista de evitados puede aparecer en el plan, ni como opción ni como reemplazo.",
      "3 o 4 comidas ordenadas por día, sin colaciones permanentes: el intestino necesita pausas entre comidas.",
      "Es un plan de etapa inicial y transitorio: decilo así en el objetivo del plan.",
    ],
    tips: [
      "Comé despacio y mastícá bien: eso también reduce el gas.",
      "Anotar qué comés y cómo te sentís ayuda a identificar qué te cae mejor o peor.",
      "Este plan acompaña el tratamiento de tu médico, no lo reemplaza.",
    ],
  },

  "IMO": {
    alias: [],
    objetivo:
      "Mejorar el tránsito intestinal sin aumentar la hinchazón. El síntoma principal del IMO es la constipación.",
    priorizar: [
      "Fibra que ayuda al tránsito sin fermentar tanto: avena, chía y lino remojados, zanahoria y zapallo cocidos",
      "Agua: 1,5 a 2 litros por día, e infusiones sin cafeína",
      "Grasas saludables: aceite de oliva, un poco de palta",
      "Proteínas que generan poco gas: pollo, pescado, huevo",
      "Kiwi: 1 a 2 unidades por día",
    ],
    evitar: [
      "Legumbres y cereales integrales en exceso por ahora",
      "Cebolla, ajo y trigo en exceso",
      "Bebidas con gas y chicles",
      "Alcohol",
    ],
    reglas: [
      "La fibra se suma de a poco: el plan no debe arrancar con carga alta de fibra.",
      "Incluir kiwi todos los días.",
      "Cada aumento de fibra va acompañado de más agua.",
    ],
    tips: [
      "Un vaso de agua tibia al levantarte ayuda a estimular el tránsito.",
      "Caminar 20 a 30 minutos por día potencia mucho el efecto de la alimentación.",
      "Los primeros días es esperable sentir algo más de hinchazón: por eso se suma la fibra gradualmente.",
    ],
  },

  "Colon Irritable": {
    alias: ["Síndrome de Intestino Irritable", "Colon irritable"],
    objetivo:
      "Ordenar horarios y porciones, e identificar los disparadores propios de cada paciente.",
    priorizar: [
      "Si predomina constipación: avena, chía y lino remojados, ciruelas, kiwi",
      "Si predomina diarrea: arroz, zanahoria, banana firme, pollo, pescado, huevo",
      "En ambos casos: comidas ordenadas, porciones moderadas, comer despacio",
    ],
    evitar: [
      "Cebolla, ajo y trigo en exceso",
      "Bebidas con gas y alcohol",
      "Exceso de café",
      "Comidas muy abundantes o muy grasosas",
      "Miel, manzana y pera en exceso, sorbitol y xilitol",
    ],
    reglas: [
      "Porciones moderadas y horarios fijos: nada de comidas abundantes.",
      "Sin restricciones fuertes tipo FODMAP estricto salvo indicación expresa de la profesional.",
      "Si el paciente no tiene un patrón definido, armar el plan para cuadro mixto.",
    ],
    tips: [
      "Llevar un registro de comidas y síntomas ayuda a encontrar tus propios disparadores.",
      "No saltear comidas ni estirarlas demasiado: los horarios irregulares empeoran los síntomas.",
      "El manejo del estrés potencia mucho los resultados de la alimentación.",
    ],
  },

  "Constipación": {
    alias: ["Constipacion", "Estreñimiento"],
    objetivo:
      "Aumentar la fibra de a poco, sostener la hidratación y ordenar los horarios.",
    priorizar: [
      "Fibra que da volumen: salvado de trigo, cereales integrales, piel de frutas y verduras",
      "Fibra que ablanda: avena, chía y lino remojados, legumbres, manzana",
      "Efecto laxante natural: ciruelas pasas, jugo de ciruela, kiwi",
      "Grasas saludables: aceite de oliva, palta, frutos secos",
      "Probióticos: yogur con cultivos vivos, kéfir",
    ],
    evitar: [
      "Harinas refinadas y ultraprocesados como base de la alimentación",
      "Aumentar la fibra sin aumentar el agua",
    ],
    reglas: [
      "Incluir todos los días al menos una fuente de efecto laxante natural (ciruela o kiwi).",
      "La fibra sube de forma gradual, en 1 a 2 semanas.",
      "El desayuno debe ser la comida con más fibra del día.",
    ],
    tips: [
      "Ir al baño 20 a 30 minutos después del desayuno aprovecha un reflejo natural del cuerpo.",
      "Elevar los pies con un banquito al sentarte facilita la evacuación.",
      "Caminar todos los días, aunque sean 20 minutos, ayuda mucho al tránsito.",
    ],
  },

  "Enfermedad Diverticular": {
    alias: ["Diverticular", "Divertículos"],
    objetivo:
      "Sostener un buen aporte de fibra para prevenir complicaciones y mejorar el funcionamiento intestinal.",
    priorizar: [
      "Cereales integrales: avena, arroz integral, pan integral",
      "Legumbres sumadas de a poco: lentejas, garbanzos, porotos",
      "Frutas con piel bien lavadas: manzana, pera, ciruela",
      "Vegetales variados",
      "Frutos secos y semillas: nueces, chía, lino",
    ],
    evitar: [
      "Subir la fibra de golpe: genera gases y distensión",
    ],
    reglas: [
      "Las semillas, los frutos secos y el maíz NO se restringen: hoy no hay evidencia de que aumenten el riesgo.",
      "La fibra sube de forma gradual, en 1 a 2 semanas.",
      "Si el paciente está cursando un episodio agudo, el plan lo define el médico: no sumar fibra en esa etapa.",
    ],
    tips: [
      "Sumar caminatas o actividad física regular ayuda tanto como la alimentación.",
      "Si nunca comiste mucha fibra, aumentala de a poco para que el intestino se acostumbre.",
    ],
  },

  "Lactosa": {
    alias: ["Intolerancia a la Lactosa"],
    objetivo:
      "Encontrar cuánta lactosa tolera el paciente sin síntomas, sin eliminar los lácteos y sin perder calcio.",
    priorizar: [
      "Leche y yogur sin lactosa",
      "Quesos duros: parmesano, sardo, provolone estacionado",
      "Manteca",
      "Calcio sin lactosa: sardinas con espina, semillas de sésamo, brócoli, legumbres",
    ],
    evitar: [
      "Volúmenes grandes de leche o yogur común de una sola vez",
      "Quesos blandos: ricota, queso crema",
      "Lácteos en ayunas",
      "Productos procesados con lactosa escondida (fiambres, panificados, sopas instantáneas)",
    ],
    reglas: [
      "NO eliminar todos los lácteos: reemplazar por versiones sin lactosa y quesos duros.",
      "Los lácteos se reparten en porciones chicas a lo largo del día, nunca concentrados en una sola comida.",
      "Sostener el aporte de calcio con fuentes alternativas en cada día del plan.",
    ],
    tips: [
      "Combinar el lácteo con otra comida, y no tomarlo solo, mejora la tolerancia.",
      "Cada persona tiene su propio límite: se va probando de a poco.",
      "Las pastillas de lactasa sirven como ayuda puntual para comidas fuera de casa.",
    ],
  },

  "Embarazo y Lactancia": {
    alias: ["Embarazo", "Lactancia"],
    objetivo:
      "Comidas completas y ordenadas, con foco en hierro, calcio, ácido fólico, yodo y Omega 3.",
    priorizar: [
      "Ácido fólico: vegetales de hoja verde, legumbres, cereales fortificados",
      "Hierro: carnes rojas y legumbres combinadas con cítricos",
      "Calcio: lácteos, sardinas, semillas de sésamo",
      "Yodo: sal yodada, pescados de mar, lácteos",
      "Omega 3 (DHA): pescados grasos 2 veces por semana, chía y lino",
    ],
    evitar: [
      "Alcohol: no hay cantidad segura comprobada",
      "Atún rojo, pez espada y tiburón por el mercurio",
      "Quesos blandos sin pasteurizar y fiambres sin cocinar (listeriosis)",
      "Huevo crudo y carnes crudas, incluido sushi de pescado crudo (salmonelosis, toxoplasmosis)",
      "Más de 2 tazas de café por día",
    ],
    reglas: [
      "Ningún pescado de alto mercurio ni alimento crudo de origen animal puede figurar en el plan.",
      "Todos los días deben cubrirse hierro, calcio y Omega 3.",
      "No indicar suplementos: los define el médico obstetra. Dejar 'supplements' vacío salvo indicación expresa de la profesional.",
    ],
    tips: [
      "Si tenés náuseas, comer poco y seguido suele funcionar mejor que forzar comidas grandes.",
      "En la lactancia no hace falta eliminar alimentos por las dudas.",
      "Tomá agua a lo largo de todo el día, sobre todo si estás amamantando.",
    ],
  },

  // BORRADOR — pendiente de validación de la Lic. Roldán.
  // Basado en criterios generales de dieta baja en histamina, no en una guía propia.
  "Histaminosis": {
    alias: ["Intolerancia a la histamina"],
    borrador: true,
    objetivo:
      "Bajar la carga de histamina de la alimentación priorizando alimentos frescos y de preparación reciente.",
    priorizar: [
      "Carnes, pollo y pescado frescos, cocinados y consumidos el mismo día",
      "Vegetales frescos: zanahoria, zapallo, zapallito, brócoli, hojas verdes",
      "Frutas: manzana, pera, melón, arándanos",
      "Cereales: arroz, avena, quinoa, polenta",
      "Aceite de oliva",
    ],
    evitar: [
      "Quesos maduros y fermentados",
      "Embutidos, fiambres y conservas",
      "Pescado no fresco, enlatado o mal conservado",
      "Fermentados: chucrut, kéfir, vinagre, salsa de soja",
      "Tomate, espinaca, berenjena, palta, frutilla y cítricos",
      "Alcohol, sobre todo vino y cerveza",
      "Sobras recalentadas de más de 24 horas",
    ],
    reglas: [
      "Todo lo del plan se cocina y se consume fresco: sin sobras de más de un día.",
      "Sin fermentados ni curados en ninguna comida.",
    ],
    tips: [
      "Congelá las porciones apenas cocinás, en vez de guardarlas en la heladera varios días.",
      "Comprar y cocinar en el día hace más diferencia que cualquier lista de alimentos.",
    ],
  },
};

// Características que NO son patologías: ajustan el plan, no lo restringen.
export const CARACTERISTICAS = {
  "Menopausia": {
    reglas: [
      "Reforzar calcio y vitamina D todos los días.",
      "Sostener el aporte proteico en cada comida principal.",
      "Priorizar fibra y grasas saludables.",
    ],
  },
  "Deportista": {
    reglas: [
      "Distribuir los carbohidratos alrededor del entrenamiento.",
      "Proteína en las cuatro comidas principales.",
      "Sumar una colación post entrenamiento con carbohidrato y proteína.",
    ],
  },
  "Hipertensión": {
    reglas: [
      "Sin sal agregada, sin fiambres, embutidos, caldos concentrados ni snacks salados.",
      "Condimentar con hierbas, limón y especias.",
    ],
  },
  "Diabetes": {
    reglas: [
      "Carbohidratos complejos repartidos en todas las comidas, nunca concentrados en una sola.",
      "Sin azúcar agregada ni jugos de fruta: la fruta va entera.",
      "Cada porción de carbohidrato acompañada de proteína o fibra.",
    ],
  },
  "Colesterol Alto": {
    reglas: [
      "Sin grasas trans ni frituras. Priorizar aceite de oliva, palta, frutos secos y pescado graso.",
      "Sumar fibra soluble todos los días: avena, legumbres, manzana.",
    ],
  },
  "Triglicéridos Altos": {
    reglas: [
      "Sin azúcar agregada, sin harinas refinadas y sin alcohol.",
      "Pescado graso 2 veces por semana.",
    ],
  },
  "Gluten (Celíaco / Sin TACC)": {
    reglas: [
      "Cero trigo, avena no certificada, cebada y centeno, en ninguna forma ni como reemplazo.",
      "Usar únicamente productos rotulados sin TACC.",
    ],
  },
  "Intolerancia a la Fructosa": {
    reglas: [
      "Sin miel, jarabe de maíz de alta fructosa, manzana, pera, mango ni jugos de fruta.",
      "Frutas permitidas en porciones chicas: banana firme, cítricos, arándanos, frutilla.",
    ],
  },
  "Medicación GLP-1 (Saxenda / liraglutide)": {
    reglas: [
      "Porciones chicas y comidas frecuentes: el apetito está reducido.",
      "Priorizar proteína en cada comida para cuidar la masa muscular.",
      "Evitar comidas muy grasosas o muy abundantes: empeoran las náuseas.",
      "Reforzar la hidratación a lo largo del día.",
    ],
  },
};

// Busca una entrada por etiqueta exacta o alias.
function buscar(mapa, etiqueta) {
  if (mapa[etiqueta]) return { clave: etiqueta, dato: mapa[etiqueta] };
  const normal = String(etiqueta).trim().toLowerCase();
  for (const [clave, dato] of Object.entries(mapa)) {
    if (clave.toLowerCase() === normal) return { clave, dato };
    if ((dato.alias || []).some((a) => a.toLowerCase() === normal)) {
      return { clave, dato };
    }
  }
  return null;
}

// Arma el bloque de texto que se inyecta en el prompt para las etiquetas
// tildadas por la profesional. Devuelve "" si no hay ninguna reconocida.
export function reglasDeLasCaracteristicas(etiquetas = []) {
  const bloques = [];

  for (const etiqueta of etiquetas) {
    const p = buscar(PATOLOGIAS, etiqueta);
    if (p) {
      const d = p.dato;
      const partes = [`### ${p.clave}`, `Objetivo: ${d.objetivo}`];
      if (d.priorizar?.length) {
        partes.push(`Priorizar:\n- ${d.priorizar.join("\n- ")}`);
      }
      if (d.evitar?.length) {
        partes.push(
          `PROHIBIDO en todo el plan (ni como opción, ni como reemplazo, ni en la lista de compras):\n- ${d.evitar.join(
            "\n- "
          )}`
        );
      }
      if (d.reglas?.length) {
        partes.push(`Reglas obligatorias:\n- ${d.reglas.join("\n- ")}`);
      }
      if (d.tips?.length) {
        partes.push(
          `Tips que deben aparecer en el plan (reescritos con naturalidad):\n- ${d.tips.join(
            "\n- "
          )}`
        );
      }
      bloques.push(partes.join("\n"));
      continue;
    }

    const c = buscar(CARACTERISTICAS, etiqueta);
    if (c) {
      bloques.push(`### ${c.clave}\nReglas obligatorias:\n- ${c.dato.reglas.join("\n- ")}`);
    }
  }

  return bloques.join("\n\n");
}

// Devuelve las patologías con guía propia, para pedirle a la IA el menú modelo.
export function patologiasConGuia(etiquetas = []) {
  return etiquetas
    .map((e) => buscar(PATOLOGIAS, e))
    .filter(Boolean)
    .map((p) => p.clave);
}

// ---------------------------------------------------------------------------
// Red de seguridad: términos que NO pueden aparecer en un plan según la
// patología. Se revisa el plan ya generado; si algo se coló, se pide una
// corrección. Cada término lleva sus excepciones para no dar falsos positivos.
// ---------------------------------------------------------------------------

const VETADOS = {
  SIBO: [
    ["cebolla", []],
    ["ajo", ["ajo negro"]],
    ["trigo", []],
    ["pan", ["pan de arroz", "pan sin gluten", "pan sin tacc", "pan de maíz", "pan de mandioca"]],
    ["lentejas", []],
    ["garbanzos", []],
    ["porotos", []],
    ["miel", []],
    ["coliflor", []],
    ["champiñones", []],
  ],
  IMO: [
    ["cebolla", []],
    ["ajo", ["ajo negro"]],
    ["lentejas", []],
    ["garbanzos", []],
    ["porotos", []],
  ],
  "Colon Irritable": [
    ["cebolla", []],
    ["ajo", ["ajo negro"]],
    ["miel", []],
  ],
  "Gluten (Celíaco / Sin TACC)": [
    ["trigo", []],
    ["cebada", []],
    ["centeno", []],
    ["pan", ["pan de arroz", "pan sin gluten", "pan sin tacc", "pan de maíz", "pan de mandioca"]],
    ["harina", ["harina de arroz", "harina de maíz", "harina de mandioca", "harina de garbanzo"]],
  ],
  "Embarazo y Lactancia": [
    ["atún rojo", []],
    ["pez espada", []],
    ["tiburón", []],
    ["sushi", []],
    ["vino", []],
    ["cerveza", []],
    ["huevo crudo", []],
    ["carne cruda", []],
  ],
};

// Devuelve los términos vetados que aparecen en el texto del plan.
export function coladosEnElPlan(etiquetas = [], texto = "") {
  const t = String(texto).toLowerCase();
  const hallados = new Set();

  for (const etiqueta of etiquetas) {
    const p = buscar(PATOLOGIAS, etiqueta);
    const clave = p ? p.clave : etiqueta;
    const lista = VETADOS[clave];
    if (!lista) continue;

    for (const [termino, excepciones] of lista) {
      const re = new RegExp(`(^|[^a-záéíóúñ])${termino}([^a-záéíóúñ]|$)`, "i");
      if (!re.test(t)) continue;
      // si toda aparición está dentro de una excepción, no cuenta
      const limpio = excepciones.reduce((acc, ex) => acc.split(ex).join(" "), t);
      if (re.test(limpio)) hallados.add(`${termino} (${clave})`);
    }
  }
  return [...hallados];
}
