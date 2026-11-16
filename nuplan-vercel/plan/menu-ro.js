/* NuPlan · el menú de la Lic. Rosana Roldán, por porciones y sin IA.
   Lo usan NuPlan (Ro arma el plan) y la app de las consultantes (cada una elige sus opciones).
   Todo sale de sus modelos: «Plan alimentario hipocalórico 1500 HIPER PRO» (normal), vegetariano, vegano
   y normocalórico celíaco. Cuando Ro mande un cambio, se cambia ACÁ y en ningún otro lado.
   Las opciones marcadas con «revisar: true» se armaron con su lista de porciones (no estaban en sus ideas
   de menú): quedan a la vista de Ro para que las confirme. */
(function (g) {
  "use strict";

  var MOMENTOS = [
    { k: "desayuno", t: "Desayuno", h: "8:00 hs" },
    { k: "mm", t: "Media mañana", h: "10:30 hs" },
    { k: "almuerzo", t: "Almuerzo", h: "13:00 hs" },
    { k: "merienda", t: "Merienda", h: "17:00 hs" },
    { k: "cena", t: "Cena", h: "21:00 hs" }
  ];
  var DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  /* Compras: [grupo, alimento]. Grupos = los de la lista de compras del plan. */
  var C = { carbo: "carbsAndLegumes", prot: "proteins", lac: "dairy", veg: "vegetablesAndFruits", gra: "fats", lata: "canned", conge: "frozen" };

  /* Cada opción:
     id · m (momentos) · t (el plato) · p (la porción, con las medidas de Ro) · tipo (desayuno | colacion | carbo | prote)
     pr (proteína: vaca, cerdo, pollo, pescado, huevo, queso, vegetal) · d (dietas: n normal, v vegetariana, g vegana)
     gl (lleva gluten) · sg (cómo queda sin TACC; si no tiene, en celiaquía no se ofrece) · c (lo que suma a las compras) */
  var OP = [
    // ---------- desayunos y meriendas (normal y vegetariana)
    { id: "d1", m: ["desayuno", "merienda"], tipo: "desayuno", d: "nv", gl: true,
      t: "Licuado de leche y fruta, con cereales", p: "1 vaso de leche descremada, 1 fruta y 1/2 taza de copos sin azúcar",
      sg: { t: "Licuado de leche y fruta, con copos de arroz", p: "1 vaso de leche descremada, 1 fruta y 1/2 taza de copos de arroz sin TACC" },
      c: [[C.lac, "Leche descremada"], [C.veg, "Frutas de estación"], [C.carbo, "Copos de cereal sin azúcar"]] },
    { id: "d2", m: ["desayuno", "merienda"], tipo: "desayuno", d: "nv", gl: true,
      t: "Panqueque de avena con banana y yogurt", p: "1 taza tipo té de avena arrollada, 1 banana y 1 yogurt descremado",
      sg: { t: "Panqueque de avena con banana y yogurt", p: "1 taza tipo té de avena certificada sin TACC, 1 banana y 1 yogurt descremado" },
      c: [[C.carbo, "Avena arrollada"], [C.veg, "Banana"], [C.lac, "Yogurt descremado"]] },
    { id: "d3", m: ["desayuno", "merienda"], tipo: "desayuno", d: "nv", gl: true,
      t: "Café con leche con tostadas y queso untable", p: "Café con leche descremada, 2 rebanadas de pan integral y 2 cucharadas tipo postre de queso untable descremado",
      sg: { t: "Café con leche con tostadas sin TACC y queso untable", p: "Café con leche descremada, 2 rebanadas de pan sin TACC y 2 cucharadas tipo postre de queso untable descremado" },
      c: [[C.lac, "Leche descremada"], [C.carbo, "Pan integral"], [C.lac, "Queso untable descremado"]] },
    { id: "d4", m: ["desayuno", "merienda"], tipo: "desayuno", d: "nv", gl: true,
      t: "Sándwich de pan árabe y queso, con infusión", p: "1 pan árabe chico con 2 rebanadas de queso descremado y té, mate o café",
      c: [[C.carbo, "Pan árabe integral"], [C.lac, "Queso port salut descremado"]] },
    { id: "d5", m: ["desayuno", "merienda"], tipo: "desayuno", d: "nv", gl: true,
      t: "Ensalada de frutas con yogurt y granola", p: "1 taza de frutas, 1 yogurt descremado y 1/2 taza de granola",
      sg: { t: "Ensalada de frutas con yogurt y copos de arroz", p: "1 taza de frutas, 1 yogurt descremado y 1/2 taza de copos de arroz sin TACC" },
      c: [[C.veg, "Frutas de estación"], [C.lac, "Yogurt descremado"], [C.carbo, "Granola sin azúcar"]] },
    { id: "d6", m: ["desayuno", "merienda"], tipo: "desayuno", d: "nv", gl: true,
      t: "Pan con palta, queso untable y tomate", p: "1 rebanada de pan integral, 1/2 palta, 1 cucharada de queso untable descremado y tomate",
      sg: { t: "Pan sin TACC con palta, queso untable y tomate", p: "1 rebanada de pan sin TACC, 1/2 palta, 1 cucharada de queso untable descremado y tomate" },
      c: [[C.carbo, "Pan integral"], [C.gra, "Palta"], [C.lac, "Queso untable descremado"], [C.veg, "Tomate"]] },
    { id: "d7", m: ["desayuno", "merienda"], tipo: "desayuno", d: "nv", gl: true,
      t: "Huevos revueltos con café con leche y pan", p: "2 huevos, café con leche descremada y 1 rebanada de pan integral",
      sg: { t: "Huevos revueltos con café con leche y pan sin TACC", p: "2 huevos, café con leche descremada y 1 rebanada de pan sin TACC" },
      c: [[C.prot, "Huevos"], [C.lac, "Leche descremada"], [C.carbo, "Pan integral"]] },
    { id: "d8", m: ["desayuno", "merienda"], tipo: "desayuno", d: "nv", gl: false,
      t: "Arepa rellena de queso, con yogurt", p: "1 arepa de harina de maíz rellena de queso descremado y 1 yogurt descremado",
      c: [[C.carbo, "Harina de maíz para arepas"], [C.lac, "Queso port salut descremado"], [C.lac, "Yogurt descremado"]] },
    // ---------- desayunos y meriendas (vegana)
    { id: "dg1", m: ["desayuno", "merienda"], tipo: "desayuno", d: "g", gl: true,
      t: "Licuado de leche vegetal y fruta, con cereales", p: "1 vaso de leche de soja o almendras, 1 fruta y 1/2 taza de copos sin azúcar",
      sg: { t: "Licuado de leche vegetal y fruta, con copos de arroz", p: "1 vaso de leche de soja o almendras, 1 fruta y 1/2 taza de copos de arroz sin TACC" },
      c: [[C.prot, "Leche de soja o almendras"], [C.veg, "Frutas de estación"], [C.carbo, "Copos de cereal sin azúcar"]] },
    { id: "dg2", m: ["desayuno", "merienda"], tipo: "desayuno", d: "g", gl: true,
      t: "Panqueque de avena con banana y yogurt de soja", p: "1 taza tipo té de avena arrollada, 1 banana y 1 yogurt de soja",
      sg: { t: "Panqueque de avena con banana y yogurt de soja", p: "1 taza tipo té de avena certificada sin TACC, 1 banana y 1 yogurt de soja" },
      c: [[C.carbo, "Avena arrollada"], [C.veg, "Banana"], [C.prot, "Yogurt de soja"]] },
    { id: "dg3", m: ["desayuno", "merienda"], tipo: "desayuno", d: "g", gl: true,
      t: "Café con leche de almendras y tostadas con pasta de maní", p: "Café con leche de almendras y 2 rebanadas de pan integral con pasta de maní en poca cantidad",
      sg: { t: "Café con leche de almendras y tostadas sin TACC con pasta de maní", p: "Café con leche de almendras y 2 rebanadas de pan sin TACC con pasta de maní en poca cantidad" },
      c: [[C.prot, "Leche de almendras"], [C.carbo, "Pan integral"], [C.gra, "Pasta de maní"]] },
    { id: "dg4", m: ["desayuno", "merienda"], tipo: "desayuno", d: "g", gl: true,
      t: "Ensalada de frutas con yogurt de soja y granola", p: "1 taza de frutas, 1 yogurt de soja y 1/2 taza de granola",
      sg: { t: "Ensalada de frutas con yogurt de soja y copos de arroz", p: "1 taza de frutas, 1 yogurt de soja y 1/2 taza de copos de arroz sin TACC" },
      c: [[C.veg, "Frutas de estación"], [C.prot, "Yogurt de soja"], [C.carbo, "Granola sin azúcar"]] },
    { id: "dg5", m: ["desayuno", "merienda"], tipo: "desayuno", d: "g", gl: true,
      t: "Pan integral con palta y tomate", p: "2 rebanadas de pan integral con 1/2 palta y tomate",
      sg: { t: "Pan sin TACC con palta y tomate", p: "2 rebanadas de pan sin TACC con 1/2 palta y tomate" },
      c: [[C.carbo, "Pan integral"], [C.gra, "Palta"], [C.veg, "Tomate"]] },
    { id: "dg6", m: ["desayuno", "merienda"], tipo: "desayuno", d: "g", gl: true,
      t: "Granola con frutas y leche de almendras", p: "1/2 taza de granola, 1 fruta y 1 vaso de leche de almendras",
      sg: { t: "Copos de arroz con frutas y leche de almendras", p: "1/2 taza de copos de arroz sin TACC, 1 fruta y 1 vaso de leche de almendras" },
      c: [[C.carbo, "Granola sin azúcar"], [C.veg, "Frutas de estación"], [C.prot, "Leche de almendras"]] },

    // ---------- media mañana (colaciones)
    { id: "c1", m: ["mm"], tipo: "colacion", d: "nvg", gl: false, t: "Una fruta", p: "1 fruta (una cítrica por día: naranja, mandarina, kiwi o frutillas)", c: [[C.veg, "Frutas de estación"]] },
    { id: "c2", m: ["mm"], tipo: "colacion", d: "nv", gl: false, t: "Un yogurt descremado", p: "1 yogurt descremado", c: [[C.lac, "Yogurt descremado"]] },
    { id: "c3", m: ["mm"], tipo: "colacion", d: "nvg", gl: false, t: "Frutos secos", p: "6 almendras o 2 nueces", c: [[C.gra, "Almendras o nueces"]] },
    { id: "c4", m: ["mm"], tipo: "colacion", d: "nvg", gl: true, t: "Una barrita de cereal", p: "1 barrita de cereal",
      sg: { t: "Una barrita sin TACC", p: "1 barrita de cereal sin TACC" }, c: [[C.carbo, "Barritas de cereal"]] },
    { id: "c5", m: ["mm"], tipo: "colacion", d: "nvg", gl: false, t: "Un puñado de maní", p: "1 puñado de maní", c: [[C.gra, "Maní sin sal"]] },
    { id: "c6", m: ["mm"], tipo: "colacion", d: "nv", gl: false, t: "Queso", p: "1 rebanada de queso descremado", c: [[C.lac, "Queso port salut descremado"]] },

    // ---------- almuerzo y cena con carbohidrato (día por medio)
    { id: "k1", m: ["almuerzo", "cena"], tipo: "carbo", d: "nvg", gl: false,
      t: "Wok de arroz con vegetales", p: "1 pocillo de arroz integral, yamaní o parboil (medido crudo) con vegetales a gusto",
      c: [[C.carbo, "Arroz integral o parboil"], [C.veg, "Zanahoria"], [C.veg, "Zapallito"], [C.veg, "Cebolla"], [C.veg, "Pimiento"]] },
    { id: "k2", m: ["almuerzo", "cena"], tipo: "carbo", d: "nvg", gl: true,
      t: "Wok de fideos con vegetales", p: "2 tazas de pasta corta medida en cocido, con vegetales a gusto",
      sg: { t: "Wok de fideos de arroz con vegetales", p: "2 tazas de fideos de arroz sin TACC en cocido, con vegetales a gusto" },
      c: [[C.carbo, "Fideos secos"], [C.veg, "Zanahoria"], [C.veg, "Zapallito"], [C.veg, "Cebolla"]] },
    { id: "k3", m: ["almuerzo", "cena"], tipo: "carbo", d: "nvg", gl: true,
      t: "Fideos con ajo, tomates cherry y aceitunas negras", p: "2 tazas de pasta corta en cocido (o 80 g de spaghetti crudos) con aceite de oliva",
      sg: { t: "Fideos sin TACC con ajo, tomates cherry y aceitunas negras", p: "2 tazas de pasta sin TACC en cocido, con aceite de oliva" },
      c: [[C.carbo, "Fideos secos"], [C.veg, "Tomates cherry"], [C.gra, "Aceitunas negras"], [C.gra, "Aceite de oliva"]] },
    { id: "k4", m: ["almuerzo", "cena"], tipo: "carbo", d: "n", gl: true,
      t: "Wrap de pechuga o carne con ensalada mixta", p: "1 wrap relleno de pechuga o carne magra y vegetales, con ensalada mixta",
      c: [[C.carbo, "Rapiditas o tortillas para wrap"], [C.prot, "Pechuga de pollo"], [C.veg, "Lechuga"], [C.veg, "Tomate"]] },
    { id: "k5", m: ["almuerzo", "cena"], tipo: "carbo", d: "vg", gl: true,
      t: "Wrap de tofu o vegetales con ensalada mixta", p: "1 wrap relleno de tofu o vegetales, con ensalada mixta",
      c: [[C.carbo, "Rapiditas o tortillas para wrap"], [C.prot, "Tofu"], [C.veg, "Lechuga"], [C.veg, "Tomate"]] },
    { id: "k6", m: ["almuerzo", "cena"], tipo: "carbo", d: "nvg", gl: true,
      t: "Tarta de verduras con ensalada de tomate, cebolla y orégano", p: "2 porciones sin tapa (zapallito, berenjena, acelga o espinaca)",
      sg: { t: "Tarta de verduras con masa sin TACC y ensalada", p: "2 porciones sin tapa con masa sin TACC (zapallito, berenjena, acelga o espinaca)" },
      c: [[C.carbo, "Tapas de tarta"], [C.veg, "Acelga o espinaca"], [C.veg, "Zapallito"], [C.veg, "Tomate"], [C.veg, "Cebolla"]] },
    { id: "k7", m: ["almuerzo", "cena"], tipo: "carbo", d: "n", gl: true,
      t: "Canelones de verdura con salsa de tomate", p: "3 canelones",
      c: [[C.carbo, "Panqueques para canelones"], [C.veg, "Acelga o espinaca"], [C.lata, "Puré de tomates"]] },
    { id: "k7v", m: ["almuerzo", "cena"], tipo: "carbo", d: "vg", gl: true,
      t: "Canelones de verdura con salsa de tomate", p: "2 canelones",
      c: [[C.carbo, "Panqueques para canelones"], [C.veg, "Acelga o espinaca"], [C.lata, "Puré de tomates"]] },
    { id: "k8", m: ["almuerzo", "cena"], tipo: "carbo", d: "nv", gl: true,
      t: "Ñoquis de ricota con salsa de espinaca", p: "1/2 plancha de ñoquis (la base del plato hondo)",
      sg: { t: "Ñoquis sin TACC con salsa de espinaca", p: "1/2 plancha de ñoquis sin TACC (la base del plato hondo)" },
      c: [[C.carbo, "Ñoquis de ricota"], [C.veg, "Espinaca"]] },
    { id: "k9", m: ["almuerzo", "cena"], tipo: "carbo", d: "n", gl: false,
      t: "Arepas de pollo o cuadril con vegetales", p: "2 arepas rellenas de pechuga, cuadril o vegetales",
      c: [[C.carbo, "Harina de maíz para arepas"], [C.prot, "Pechuga de pollo"], [C.veg, "Lechuga"], [C.veg, "Tomate"]] },
    { id: "k9v", m: ["almuerzo", "cena"], tipo: "carbo", d: "v", gl: false,
      t: "Arepas de queso y vegetales", p: "2 arepas rellenas de queso descremado y vegetales",
      c: [[C.carbo, "Harina de maíz para arepas"], [C.lac, "Queso port salut descremado"], [C.veg, "Tomate"]] },
    { id: "k10", m: ["almuerzo", "cena"], tipo: "carbo", d: "nv", gl: true,
      t: "Ravioles con salsa de tomate natural", p: "20 ravioles",
      sg: { t: "Ravioles sin TACC con salsa de tomate natural", p: "1/2 plancha de ravioles sin TACC" },
      c: [[C.carbo, "Ravioles"], [C.lata, "Tomates en lata"]] },
    { id: "k10g", m: ["almuerzo", "cena"], tipo: "carbo", d: "g", gl: true,
      t: "Ravioles de verdura con salsa de tomate natural", p: "15 ravioles",
      sg: { t: "Ravioles sin TACC con salsa de tomate natural", p: "1/2 plancha de ravioles sin TACC" },
      c: [[C.carbo, "Ravioles"], [C.lata, "Tomates en lata"]] },
    { id: "k11", m: ["almuerzo", "cena"], tipo: "carbo", d: "nvg", gl: true,
      t: "Milanesa de soja con ensalada de zanahoria y tomate", p: "1 milanesa de soja con ensalada",
      c: [[C.prot, "Milanesas de soja"], [C.veg, "Zanahoria"], [C.veg, "Tomate"]] },
    { id: "k12", m: ["almuerzo", "cena"], tipo: "carbo", d: "vg", gl: false,
      t: "Ensalada de garbanzos, arroz yamaní y vegetales", p: "2 tazas de legumbres y arroz en cocido, con vegetales a gusto",
      c: [[C.carbo, "Garbanzos"], [C.carbo, "Arroz yamaní"], [C.veg, "Tomate"], [C.veg, "Cebolla"]] },
    { id: "k13", m: ["almuerzo", "cena"], tipo: "carbo", d: "n", gl: false, revisar: true,
      t: "Papa o batata al horno con vegetales", p: "1 papa o batata grande, con vegetales asados",
      c: [[C.carbo, "Papa o batata"], [C.veg, "Zapallo"], [C.veg, "Cebolla"]] },

    // ---------- almuerzo y cena con proteína
    { id: "p1", m: ["almuerzo", "cena"], tipo: "prote", pr: "huevo", d: "n", gl: false,
      t: "Omelette de claras con queso crema y champiñones o arvejas, con ensalada", p: "3 claras (o 3 huevos) con queso crema descremado 0%",
      c: [[C.prot, "Huevos"], [C.lac, "Queso crema descremado"], [C.veg, "Champiñones"], [C.veg, "Lechuga"]] },
    { id: "p1v", m: ["almuerzo", "cena"], tipo: "prote", pr: "huevo", d: "v", gl: false,
      t: "Omelette con queso crema y champiñones o arvejas, con ensalada", p: "2 huevos con queso crema descremado 0%",
      c: [[C.prot, "Huevos"], [C.lac, "Queso crema descremado"], [C.veg, "Champiñones"], [C.veg, "Lechuga"]] },
    { id: "p2", m: ["almuerzo", "cena"], tipo: "prote", pr: "huevo", d: "nv", gl: false,
      t: "Tortilla de espinaca al horno, con ensalada", p: "Con claras de huevo y ricota magra",
      c: [[C.prot, "Huevos"], [C.lac, "Ricota magra"], [C.veg, "Espinaca"]] },
    { id: "p3", m: ["almuerzo", "cena"], tipo: "prote", pr: "pollo", d: "n", gl: false,
      t: "Pechuga de pollo al verdeo con ensalada", p: "1 pechuga sin piel",
      c: [[C.prot, "Pechuga de pollo"], [C.veg, "Cebolla de verdeo"], [C.veg, "Lechuga"]] },
    { id: "p4", m: ["almuerzo", "cena"], tipo: "prote", pr: "vaca", d: "n", gl: false,
      t: "Bifes a la criolla con puré de calabaza", p: "1 bife mediano (200 g) de corte magro",
      c: [[C.prot, "Carne magra (nalga, cuadrada o peceto)"], [C.veg, "Calabaza"], [C.veg, "Cebolla"], [C.veg, "Pimiento"]] },
    { id: "p5", m: ["almuerzo", "cena"], tipo: "prote", pr: "vaca", d: "n", gl: false,
      t: "Colita de cuadril al horno, a la parrilla o a la cacerola, con ensalada", p: "200 g",
      c: [[C.prot, "Colita de cuadril"], [C.veg, "Lechuga"], [C.veg, "Tomate"]] },
    { id: "p6", m: ["almuerzo", "cena"], tipo: "prote", pr: "vaca", d: "n", gl: false,
      t: "Bifecitos de lomo con cebolla morada y calabaza al horno", p: "3 bifecitos",
      c: [[C.prot, "Lomo"], [C.veg, "Cebolla morada"], [C.veg, "Calabaza"]] },
    { id: "p7", m: ["almuerzo", "cena"], tipo: "prote", pr: "cerdo", d: "n", gl: false,
      t: "Costillas de cerdo con puré de manzana", p: "2 costillas medianas (200 g)",
      c: [[C.prot, "Costillas o solomillo de cerdo"], [C.veg, "Manzana"]] },
    { id: "p8", m: ["almuerzo", "cena"], tipo: "prote", pr: "pescado", d: "n", gl: false, revisar: true,
      t: "Merluza al horno con ensalada", p: "1 filet mediano (200 g)",
      c: [[C.prot, "Filet de merluza"], [C.veg, "Lechuga"], [C.veg, "Zanahoria"]] },
    { id: "p9", m: ["almuerzo", "cena"], tipo: "prote", pr: "pescado", d: "n", gl: false, revisar: true,
      t: "Ensalada completa con atún al natural", p: "1 lata de atún al natural con vegetales a gusto",
      c: [[C.lata, "Atún al natural"], [C.veg, "Lechuga"], [C.veg, "Tomate"], [C.veg, "Zanahoria"]] },
    { id: "p10", m: ["almuerzo", "cena"], tipo: "prote", pr: "pollo", d: "n", gl: false, revisar: true,
      t: "Pata y muslo al horno con vegetales", p: "1 pata y muslo sin piel",
      c: [[C.prot, "Pata y muslo de pollo"], [C.veg, "Zapallo"], [C.veg, "Cebolla"]] },
    { id: "p11", m: ["almuerzo", "cena"], tipo: "prote", pr: "vegetal", d: "nvg", gl: false,
      t: "Tofu grillado con semillas de sésamo y ensalada", p: "2 rebanadas de tofu",
      c: [[C.prot, "Tofu"], [C.gra, "Semillas de sésamo"], [C.veg, "Lechuga"]] },
    { id: "p12", m: ["almuerzo", "cena"], tipo: "prote", pr: "queso", d: "v", gl: false,
      t: "Berenjena a la napolitana con ensalada de remolacha", p: "Con 2 rebanadas de queso",
      c: [[C.veg, "Berenjena"], [C.lac, "Queso port salut descremado"], [C.veg, "Remolacha"]] },
    { id: "p13", m: ["almuerzo", "cena"], tipo: "prote", pr: "huevo", d: "v", gl: false,
      t: "Budín de espinaca con ensalada", p: "1 porción (con huevo batido para que quede aireado)",
      c: [[C.veg, "Espinaca"], [C.prot, "Huevos"]] },
    { id: "p14", m: ["almuerzo", "cena"], tipo: "prote", pr: "vegetal", d: "vg", gl: false,
      t: "Pastel de papas o calabaza relleno de soja texturizada", p: "1 porción (1 taza de soja ya hidratada)",
      c: [[C.prot, "Soja texturizada"], [C.carbo, "Papa"], [C.veg, "Calabaza"]] },
    { id: "p15", m: ["almuerzo", "cena"], tipo: "prote", pr: "vegetal", d: "vg", gl: false,
      t: "Hamburguesas de soja texturizada con ensalada", p: "2 hamburguesas caseras",
      c: [[C.prot, "Soja texturizada"], [C.veg, "Lechuga"], [C.veg, "Tomate"]] },
    { id: "p16", m: ["almuerzo", "cena"], tipo: "prote", pr: "vegetal", d: "g", gl: false,
      t: "Curry de tofu con leche de almendras y vegetales", p: "2 rebanadas de tofu",
      c: [[C.prot, "Tofu"], [C.prot, "Leche de almendras"], [C.veg, "Zanahoria"], [C.veg, "Brócoli"]] },
    { id: "p17", m: ["almuerzo", "cena"], tipo: "prote", pr: "vegetal", d: "g", gl: true,
      t: "Pasta con bolognesa de soja texturizada", p: "2 tazas de pasta en cocido y 1 taza de soja ya hidratada",
      sg: { t: "Pasta sin TACC con bolognesa de soja texturizada", p: "2 tazas de pasta sin TACC en cocido y 1 taza de soja ya hidratada" },
      c: [[C.carbo, "Fideos secos"], [C.prot, "Soja texturizada"], [C.lata, "Puré de tomates"]] },
    { id: "p18", m: ["almuerzo", "cena"], tipo: "prote", pr: "vegetal", d: "g", gl: true,
      t: "Tacos de vegetales y seitán con ensalada", p: "2 rebanadas de seitán",
      c: [[C.carbo, "Tortillas para tacos"], [C.prot, "Seitán"], [C.veg, "Pimiento"], [C.veg, "Cebolla"]] },
    { id: "p19", m: ["almuerzo", "cena"], tipo: "prote", pr: "vegetal", d: "g", gl: false,
      t: "Cazuela de vegetales con arroz yamaní y legumbres", p: "2 tazas en cocido",
      c: [[C.carbo, "Arroz yamaní"], [C.carbo, "Lentejas o porotos"], [C.veg, "Zapallo"], [C.veg, "Zanahoria"]] }
  ];

  /* Lo que siempre va a la lista, coma lo que coma */
  var BASE_COMPRAS = {
    n: [[C.veg, "Vegetales de hoja para ensaladas"], [C.veg, "Una fruta cítrica por día (naranja, mandarina, kiwi o frutillas)"], [C.gra, "Aceite de oliva"], [C.lac, "Leche descremada"], [C.conge, "Vegetales congelados"]],
    v: [[C.veg, "Vegetales de hoja para ensaladas"], [C.veg, "Una fruta cítrica por día (naranja, mandarina, kiwi o frutillas)"], [C.gra, "Aceite de oliva"], [C.lac, "Leche descremada"], [C.conge, "Vegetales congelados"], [C.conge, "Medallones de legumbres"]],
    g: [[C.veg, "Vegetales de hoja para ensaladas"], [C.veg, "Una fruta cítrica por día (naranja, mandarina, kiwi o frutillas)"], [C.gra, "Aceite de oliva"], [C.gra, "Semillas de lino, chía y sésamo"], [C.conge, "Vegetales congelados"], [C.conge, "Medallones de legumbres"]]
  };

  /* Porciones del día, como las escribe Ro (van a «Tus comidas» del plan) */
  function porciones(dieta, celiaco) {
    var carbo = celiaco
      ? "Carbohidratos, día por medio (todo con el logo sin TACC): 2 tazas de pasta sin TACC en cocido / 1 pocillo de arroz crudo / 2 tazas de legumbres en cocido / 1 papa, batata o choclo grande / polenta, la base del plato hondo / 2 tazas de quinoa en cocido"
      : "Carbohidratos, día por medio: 2 tazas de pasta corta en cocido / 1 pocillo de arroz crudo / 2 tazas de legumbres en cocido / 1 papa, batata o choclo grande / polenta, la base del plato hondo / 2 tazas de cous-cous en cocido";
    var prote = dieta === "g"
      ? "Proteína, en almuerzo y cena: 2 rebanadas de tofu / 1 taza de soja texturizada ya hidratada / 2 tazas de legumbres en cocido" + (celiaco ? "" : " / 2 rebanadas de seitán")
      : dieta === "v"
      ? "Proteína, en almuerzo y cena: 2 huevos / 2 rebanadas de queso / 2 rebanadas de tofu / 1 taza de soja texturizada ya hidratada" + (celiaco ? "" : " / 2 rebanadas de seitán")
      : "Proteína, en almuerzo y cena: carne magra 200 g (2 veces por semana) / cerdo 200 g (1 vez por semana) / 1 pechuga o 1 pata y muslo (2 veces por semana) / pescado / 3 huevos / 2 rebanadas de queso";
    var desayuno = "Infusión a gusto + " + (dieta === "g" ? "leche vegetal (soja, coco o almendras)" : "leche o yogurt descremado") + " + UNA opción: " +
      (celiaco ? "2 rebanadas de pan sin TACC / 1/2 taza de copos de arroz / 4 galletitas sin TACC / 3 galletas de arroz / 1 taza tipo té de avena certificada sin TACC"
               : "2 rebanadas de pan integral / 1 taza tipo té de avena arrollada / 1/2 taza de granola / 4 galletitas integrales o de salvado") +
      (dieta === "g" ? " + palta o pasta de maní en poca cantidad" : " + 2 cucharadas tipo postre de queso untable descremado");
    return { carbo: carbo, prote: prote, desayuno: desayuno,
      vegetales: "Vegetales libres, crudos o al vapor: la mitad del plato",
      colacion: "1 fruta / 6 almendras o 2 nueces / 1 puñado de maní" + (dieta === "g" ? "" : " / 1 yogurt descremado") };
  }

  function dietaDe(tipo) { var t = String(tipo || "").toLowerCase(); return /vegan/.test(t) ? "g" : /vegetar/.test(t) ? "v" : "n"; }
  function esCeliaco(etiquetas) { return (etiquetas || []).some(function (e) { return /gluten|cel[ií]ac|tacc/i.test(String(e)); }); }

  /* La opción como la ve esta persona (sin TACC si hace falta); null si no le sirve */
  function version(o, dieta, celiaco) {
    if (!o || o.d.indexOf(dieta) === -1) return null;
    if (celiaco && o.gl) { if (!o.sg) return null; return Object.assign({}, o, { t: o.sg.t, p: o.sg.p, singluten: true }); }
    return o;
  }
  function opciones(momento, dieta, celiaco) {
    return OP.map(function (o) { return o.m.indexOf(momento) !== -1 ? version(o, dieta, celiaco) : null; }).filter(Boolean);
  }
  function porId(id, dieta, celiaco) { var o = OP.filter(function (x) { return x.id === id; })[0]; return o ? version(o, dieta, celiaco) || o : null; }

  /* Topes por semana del modelo normal (Ro): carne 2, cerdo 1, pollo 2. El resto, sin tope. */
  var TOPES = { vaca: 2, cerdo: 1, pollo: 2 };

  /* Arma la semana.
     cfg: { dieta: "n"|"v"|"g", celiaco, elegidas: { momento: [ids] } (opcional), cenaSinCarbo (por defecto true), semilla }
     Regla: el carbohidrato va día por medio en el almuerzo (lunes, miércoles, viernes y domingo);
     los otros días el almuerzo es con proteína, y la cena siempre es con proteína y vegetales.
     Si cenaSinCarbo es false, los días de almuerzo con proteína la cena lleva carbohidrato. */
  function armarSemana(cfg) {
    cfg = cfg || {};
    var dieta = cfg.tipo || cfg.dieta || "n", cel = !!cfg.celiaco, el = cfg.elegidas || {}, sem = Math.abs(cfg.semilla | 0);
    var cenaSinCarbo = cfg.cenaSinCarbo !== false;
    function pool(momento, tipo) {
      var todas = opciones(momento, dieta, cel).filter(function (o) { return !tipo || o.tipo === tipo; });
      var ids = el[momento] || el[tipo] || null;
      var elegidas = ids ? todas.filter(function (o) { return ids.indexOf(o.id) !== -1; }) : [];
      return elegidas.length ? elegidas : todas;
    }
    var usos = {}, semana = [];
    function tomar(lista, i, controlar) {
      for (var k = 0; k < lista.length; k++) {
        var o = lista[(i + k) % lista.length];
        if (controlar && o.pr && TOPES[o.pr] != null && (usos[o.pr] || 0) >= TOPES[o.pr]) continue;
        if (controlar && o.pr) usos[o.pr] = (usos[o.pr] || 0) + 1;
        return o;
      }
      // todas topeadas: la que tenga menos usos
      return lista[i % lista.length];
    }
    var des = pool("desayuno"), mer = pool("merienda"), mm = pool("mm"), car = pool("almuerzo", "carbo"), pro = pool("almuerzo", "prote");
    var iC = sem, iP = sem;
    for (var d = 0; d < 7; d++) {
      var conCarbo = d % 2 === 0;
      var alm = conCarbo ? tomar(car, iC++, false) : tomar(pro, iP++, true);
      var cen = (conCarbo || cenaSinCarbo) ? tomar(pro, iP++, true) : tomar(car, iC++, false);
      var de = des[(d + sem) % des.length];
      var me = mer[(d + sem + Math.max(1, Math.floor(mer.length / 2))) % mer.length];
      if (me && de && me.id === de.id && mer.length > 1) me = mer[(d + sem + 1) % mer.length];
      semana.push({ dia: DIAS[d], comidas: [
        { k: "desayuno", id: de.id, t: de.t, p: de.p },
        { k: "mm", id: mm[(d + sem) % mm.length].id, t: mm[(d + sem) % mm.length].t, p: mm[(d + sem) % mm.length].p },
        { k: "almuerzo", id: alm.id, t: alm.t, p: alm.p, tipo: alm.tipo },
        { k: "merienda", id: me.id, t: me.t, p: me.p },
        { k: "cena", id: cen.id, t: cen.t, p: cen.p, tipo: cen.tipo }
      ] });
    }
    return semana;
  }

  /* Opciones para cambiar una comida de la semana: del mismo momento y del mismo tipo (carbohidrato o proteína) */
  function alternativas(semana, dia, k, dieta, celiaco) {
    var c = (semana[dia] || { comidas: [] }).comidas.filter(function (x) { return x.k === k; })[0];
    var actual = c ? porId(c.id, dieta, celiaco) : null;
    return opciones(k, dieta, celiaco).filter(function (o) { return !actual || !actual.tipo || (actual.tipo !== "carbo" && actual.tipo !== "prote") || o.tipo === actual.tipo; })
      .filter(function (o) { return !c || o.id !== c.id; });
  }
  function cambiar(semana, dia, k, id, dieta, celiaco) {
    var o = porId(id, dieta, celiaco); if (!o) return semana;
    var s = JSON.parse(JSON.stringify(semana));
    s[dia].comidas = s[dia].comidas.map(function (c) { return c.k === k ? { k: k, id: o.id, t: o.t, p: o.p, tipo: o.tipo } : c; });
    return s;
  }

  /* Lista de compras: solo lo que usa la semana, sin repetidos, por grupo */
  function compras(semana, dieta, celiaco) {
    var out = { carbsAndLegumes: [], proteins: [], dairy: [], vegetablesAndFruits: [], fats: [], canned: [], frozen: [] };
    var vistos = {};
    function sumar(par) {
      var g2 = par[0], item = par[1];
      if (celiaco && g2 === C.carbo && /^(Pan|Fideos|Avena|Ravioles|Ñoquis|Tapas|Panqueques|Copos|Granola|Barritas|Rapiditas|Tortillas)/.test(item) && !/sin TACC/.test(item)) item += " (sin TACC)";
      var clave = g2 + "|" + item.toLowerCase();
      if (vistos[clave]) return; vistos[clave] = 1; out[g2].push(item);
    }
    (BASE_COMPRAS[dieta] || BASE_COMPRAS.n).forEach(function (par) { if (!(dieta === "g" && par[0] === C.lac)) sumar(par); });
    (semana || []).forEach(function (d) { d.comidas.forEach(function (c) { var o = porId(c.id, dieta, celiaco); if (o) o.c.forEach(sumar); }); });
    return out;
  }

  var IDEAS = {
    n: { carbsIdeas: ["Wok de arroz parbolizado, integral o de pasta con vegetales", "Fideos con salsa de ajo, tomates cherry y aceitunas negras con aceite de oliva", "Wrap relleno de pechuga, carne o vegetales con ensalada mixta", "Tarta de verduras (zapallito, berenjena, acelga o espinaca) con ensalada de tomate, cebolla y orégano", "3 canelones de verdura con salsa de tomate", "Ñoquis de ricota con salsa de espinaca", "Arepa o sándwich de pan árabe de pollo o cuadril con vegetales", "Ravioles (20 unidades) con salsa de tomate natural", "Milanesa de soja con ensalada de zanahoria y tomate"],
         proteinIdeas: ["Omelette de 3 claras con queso crema descremado 0% y champiñón o arvejas, con ensalada", "Tortilla de espinaca al horno (claras de huevo, ricota magra) con ensalada", "Pechuga de pollo al verdeo con ensalada", "Bifes a la criolla con puré de calabaza", "Colita de cuadril al horno, parrilla o cacerola con ensalada", "Bifecitos de lomo (3 unidades) con cebolla morada y calabaza dorada al horno", "Costillas de cerdo (2 unidades medianas) con puré de manzana"] },
    v: { carbsIdeas: ["Wok de arroz parbolizado, integral o de pasta con vegetales", "Fideos con salsa de ajo, tomates cherry y aceitunas negras con aceite de oliva", "Wrap relleno de tofu o vegetales con ensalada mixta", "Tarta de verduras (zapallito, berenjena, acelga o espinaca) con ensalada de tomate, cebolla y orégano", "2 canelones de verdura con salsa de tomate", "Ensalada de garbanzos, arroz yamaní, huevo y vegetales", "Arepa o sándwich de pan árabe de queso y vegetales"],
         proteinIdeas: ["Omelette con queso crema descremado 0% y champiñón o arvejas", "Tortilla de espinaca al horno (claras de huevo, ricota magra) con ensalada", "Tofu grillado con semillas de sésamo y ensalada", "Berenjena a la napolitana con ensalada de remolacha", "Budín de espinaca con ensalada", "Pastel de papas o calabaza relleno de soja texturizada", "Hamburguesas de soja texturizada con ensalada"] },
    g: { carbsIdeas: ["Wok de arroz parbolizado, integral o de pasta con vegetales", "Fideos con salsa de ajo, tomates cherry y aceitunas negras con aceite de oliva", "Wrap relleno de tofu o vegetales con ensalada mixta", "Tarta de verduras (zapallito, berenjena, acelga o espinaca) con ensalada de tomate, cebolla y orégano", "2 canelones de verdura con salsa de tomate", "Ensalada de garbanzos, arroz yamaní y vegetales", "Ravioles (15 unidades) con salsa de tomate natural", "Milanesa de soja con ensalada de zanahoria y tomate"],
         proteinIdeas: ["Tofu grillado con semillas de sésamo y ensalada", "Curry de tofu con leche de almendras y vegetales", "Pastel de papas o calabaza relleno de soja texturizada", "Hamburguesas de soja texturizada con ensalada", "Pasta con bolognesa de soja texturizada", "Tacos rellenos de vegetales y seitán con ensalada", "Cazuela de vegetales con arroz yamaní y legumbres"] }
  };

  /* El plan entero, con la misma forma que el de la IA (así se ve, se edita, se guarda y se imprime igual) */
  function planSinIA(o) {
    o = o || {};
    var pref = o.preferences || {}, dieta = dietaDe(pref.dietType), cel = esCeliaco(pref.intolerances);
    var semana = o.semana || armarSemana({ dieta: dieta, celiaco: cel, cenaSinCarbo: o.cenaSinCarbo !== false, semilla: o.semilla || 0, elegidas: o.elegidas });
    var por = porciones(dieta, cel);
    var objetivo = String(pref.goal || String(pref.objectives || "").split(". ")[0] || "").trim();
    var nombre = o.nombre ? String(o.nombre).split(" ")[0] : "";
    var daily = [
      { type: "DESAYUNO", title: "8:00 hs", items: [por.desayuno], tip: "Un desayuno completo evita el picoteo el resto del día." },
      { type: "MEDIA MAÑANA", title: "10:30 hs", items: [por.colacion], tip: "Adecuá la colación a tus horarios y a tu actividad." },
      { type: "ALMUERZO", title: "13:00 hs", items: [por.vegetales, por.carbo, por.prote], tip: "Los días con carbohidrato, el carbohidrato ocupa su cuarto del plato y la proteína el otro." },
      { type: "MERIENDA", title: "17:00 hs", items: [por.desayuno], tip: "" },
      { type: "CENA", title: "21:00 hs", items: o.cenaSinCarbo === false ? [por.vegetales, por.carbo, por.prote] : [por.vegetales, por.prote], tip: o.cenaSinCarbo === false ? "" : "A la noche, la mitad del plato con vegetales y la otra mitad con proteína." }
    ];
    var lunes = semana[0].comidas.map(function (c) { return { meal: nombreMomento(c.k), dish: c.t + " · " + c.p }; });
    var supl = dieta === "n" ? [] : [
      { name: "Vitamina B12", dosage: "La que indique tu nutricionista", reason: "Obligatoria en una alimentación " + (dieta === "g" ? "vegana" : "vegetariana") + "." },
      { name: "Vitamina D", dosage: "Evaluar niveles y suplementar si corresponde", reason: "Sol entre las 10 y las 16 hs, sin protector en cara, cuello o brazos: 40 a 50 minutos por semana." }
    ];
    return {
      planObjective: (objetivo ? objetivo + ". " : "") + (nombre ? nombre + ", este" : "Este") + " plan sale de tus comidas reales: una opción por comida, con las porciones de cada grupo. Si algo no te gusta, se cambia por otra del mismo grupo.",
      dailyPlan: daily,
      sampleDayMenu: lunes,
      weeklyMenu: semana,
      menuIdeas: IDEAS[dieta],
      microHabits: (o.microHabits || []),
      supplements: supl,
      substitutes: [
        { category: "Reemplazos del carbohidrato", options: por.carbo.replace(/^[^:]*:\s*/, "").split(" / ") },
        { category: "Reemplazos de la proteína", options: por.prote.replace(/^[^:]*:\s*/, "").split(" / ") }
      ],
      shoppingList: compras(semana, dieta, cel),
      recommendationsAndRecipes: [],
      origen: "porciones",
      modeloRo: { tipo: dieta, celiaco: cel, cenaSinCarbo: o.cenaSinCarbo !== false }
    };
  }
  function nombreMomento(k) { var m = MOMENTOS.filter(function (x) { return x.k === k; })[0]; return m ? m.t : k; }

  g.NPMenu = { MOMENTOS: MOMENTOS, DIAS: DIAS, OP: OP, TOPES: TOPES, porciones: porciones, dietaDe: dietaDe, esCeliaco: esCeliaco,
    opciones: opciones, porId: porId, armarSemana: armarSemana, alternativas: alternativas, cambiar: cambiar,
    compras: compras, planSinIA: planSinIA, nombreMomento: nombreMomento, IDEAS: IDEAS };
})(typeof window !== "undefined" ? window : globalThis);
