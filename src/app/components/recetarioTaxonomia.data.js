// Taxonomía REAL del recetario, sacada de los libros de cocina 1 y 2.
//
// De dónde sale (y por qué no se inventa nada):
//   · «TABLA DE ICONOS» — páginas 13-17 del libro 1 y 34-38 del libro 2. Es la
//     tabla que el propio libro imprime en «Antes de empezar»: una fila por
//     receta y una columna por icono, con ✓ verde (lo tiene) o ⊗ rojo (no lo
//     tiene). En la columna «Leche» aparece además la palabra «Queso», que es
//     el condicional del libro: sin lácteos SI cambias el queso por uno vegano.
//     Un guion «-» significa que ese icono no aplica a esa receta.
//   · La CATEGORÍA es la banda del pie de cada receta («Comidas», «Cenas»…).
//
// Significado de cada icono, tal cual lo define la guía de la página 12:
//   vegan             Es apta para veganos o vegetarianos
//   sacia             Con una sola ración quedas bien lleno
//   keto              Receta apta para una dieta cetogénica
//   fibra             Con un alto contenido en fibra
//   kcal              Pocas calorías comparado con su tamaño
//   sinLacteos        Sin lácteos, o usa leche vegetal o queso vegano
//                     (`"queso"` = solo si cambias el queso por uno vegano)
//   sinGluten         O no usa gluten o se ofrece un sustituto
//   sinHuevo          En la receta no se utilizarán huevos
//   huevoSustituible  Se ofrece un sustituto en caso de llevar huevo
//   `null` = el libro marca «-» (no aplica).
//
// Cruce tabla ↔ receta: por SECCIÓN Y ORDEN, no por página ni por nombre.
// La tabla del libro 1 numera «Cenas» seis páginas por debajo de la real
// (errata del propio libro) y abrevia los títulos («Tortitas con frutas» por
// «Tortitas con frutos del bosque»), así que ni la página ni el nombre valen
// de clave; el orden dentro de cada sección sí. Dos recetas se quedan sin
// iconos a propósito («Batidos Squat Fit: Cookies & cream» y «Sándwich
// helado: Cookie chips»): el libro imprime UNA fila para cada pareja de
// hermanas y no hay dato propio que copiar — antes eso que inventarlo.
//
// La clave es el título de la receta normalizado (minúsculas y sin tildes),
// que es exactamente lo que `recipe/system` devuelve en `name`.
// Verificado el 5-ago-2026: las 149 recetas sembradas casan con este mapa.
//
// SI ALGÚN DÍA ESTO SE MUEVE AL BACKEND: la fuente son los PDFs de
// «04 Cocina Squad Fit/Edición» en Drive; el extractor vivió en el scratchpad
// de la sesión (pdftotext -bbox-layout sobre las páginas de la tabla).

export const TAXONOMIA_LIBRO = {
  "tortitas con frutos del bosque": { libro: 1, pagina: 41, categoria: "Desayunos", iconos: { vegan: true, sacia: true, keto: false, fibra: false, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "torti-french vainilla o chocolate": { libro: 1, pagina: 43, categoria: "Desayunos", iconos: { vegan: true, sacia: true, keto: false, fibra: false, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "crepes al pesto": { libro: 1, pagina: 45, categoria: "Desayunos", iconos: { vegan: true, sacia: false, keto: false, fibra: false, kcal: false, sinLacteos: true, sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "french toast estilo americano": { libro: 1, pagina: 47, categoria: "Desayunos", iconos: { vegan: true, sacia: true, keto: false, fibra: false, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "french toast a la italiana": { libro: 1, pagina: 49, categoria: "Desayunos", iconos: { vegan: true, sacia: true, keto: false, fibra: false, kcal: true, sinLacteos: "queso", sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "tostas saladas": { libro: 1, pagina: 51, categoria: "Desayunos", iconos: { vegan: true, sacia: false, keto: false, fibra: false, kcal: false, sinLacteos: "queso", sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "protein cereal": { libro: 1, pagina: 53, categoria: "Desayunos", iconos: { vegan: true, sacia: true, keto: true, fibra: false, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "boniato burger": { libro: 1, pagina: 56, categoria: "Comidas", iconos: { vegan: true, sacia: false, keto: true, fibra: false, kcal: true, sinLacteos: "queso", sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "kfc fit": { libro: 1, pagina: 58, categoria: "Comidas", iconos: { vegan: false, sacia: false, keto: true, fibra: false, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "ensalada burrito": { libro: 1, pagina: 60, categoria: "Comidas", iconos: { vegan: true, sacia: true, keto: true, fibra: true, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "pimientos rellenos": { libro: 1, pagina: 62, categoria: "Comidas", iconos: { vegan: true, sacia: true, keto: true, fibra: true, kcal: true, sinLacteos: "queso", sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "megawraps fit": { libro: 1, pagina: 64, categoria: "Comidas", iconos: { vegan: true, sacia: true, keto: false, fibra: false, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "bomba de patatas": { libro: 1, pagina: 66, categoria: "Comidas", iconos: { vegan: true, sacia: true, keto: false, fibra: false, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "lasana con repollo chimichurri": { libro: 1, pagina: 68, categoria: "Comidas", iconos: { vegan: true, sacia: true, keto: true, fibra: true, kcal: true, sinLacteos: "queso", sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "pizza keto (de barbacoa / o jamon y queso)": { libro: 1, pagina: 71, categoria: "Cenas", iconos: { vegan: true, sacia: true, keto: true, fibra: false, kcal: true, sinLacteos: "queso", sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "patatas supremas": { libro: 1, pagina: 73, categoria: "Cenas", iconos: { vegan: true, sacia: true, keto: false, fibra: false, kcal: true, sinLacteos: "queso", sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "canelones de berenjena": { libro: 1, pagina: 75, categoria: "Cenas", iconos: { vegan: true, sacia: true, keto: true, fibra: true, kcal: true, sinLacteos: "queso", sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "slim pasta": { libro: 1, pagina: 77, categoria: "Cenas", iconos: { vegan: true, sacia: true, keto: true, fibra: true, kcal: true, sinLacteos: "queso", sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "huevos rotos": { libro: 1, pagina: 79, categoria: "Cenas", iconos: { vegan: true, sacia: true, keto: false, fibra: false, kcal: true, sinLacteos: "queso", sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "pastel de brocoli gratinado": { libro: 1, pagina: 81, categoria: "Cenas", iconos: { vegan: true, sacia: true, keto: true, fibra: true, kcal: true, sinLacteos: "queso", sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "salmon con patatas alioli": { libro: 1, pagina: 83, categoria: "Cenas", iconos: { vegan: true, sacia: true, keto: true, fibra: true, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "patatas airfryer con alioli casero": { libro: 1, pagina: 86, categoria: "Guarniciones", iconos: { vegan: true, sacia: false, keto: false, fibra: false, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: null, huevoSustituible: null } },
  "pollo picado a la barbacoa": { libro: 1, pagina: 88, categoria: "Guarniciones", iconos: { vegan: true, sacia: true, keto: true, fibra: false, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "cebollas fit: encurtida o caramelizada": { libro: 1, pagina: 90, categoria: "Guarniciones", iconos: { vegan: true, sacia: false, keto: true, fibra: true, kcal: false, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "pimientos para fajitas y pico de gallo": { libro: 1, pagina: 92, categoria: "Guarniciones", iconos: { vegan: true, sacia: false, keto: true, fibra: true, kcal: false, sinLacteos: true, sinGluten: true, sinHuevo: null, huevoSustituible: null } },
  "repollo salteado chimichurri": { libro: 1, pagina: 94, categoria: "Guarniciones", iconos: { vegan: true, sacia: true, keto: true, fibra: true, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: null, huevoSustituible: null } },
  "calabacin crispy con pesto": { libro: 1, pagina: 96, categoria: "Guarniciones", iconos: { vegan: true, sacia: false, keto: true, fibra: false, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "chips de zanahoria crujiente": { libro: 1, pagina: 98, categoria: "Guarniciones", iconos: { vegan: true, sacia: true, keto: true, fibra: true, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "nachos al horno con guacamole y queso": { libro: 1, pagina: 101, categoria: "Snacks", iconos: { vegan: true, sacia: false, keto: false, fibra: false, kcal: false, sinLacteos: "queso", sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "montaditos de maiz": { libro: 1, pagina: 103, categoria: "Snacks", iconos: { vegan: true, sacia: false, keto: false, fibra: false, kcal: false, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "pan de ajo crunchy": { libro: 1, pagina: 105, categoria: "Snacks", iconos: { vegan: true, sacia: false, keto: false, fibra: false, kcal: false, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "pulpo a la gallega": { libro: 1, pagina: 107, categoria: "Snacks", iconos: { vegan: true, sacia: true, keto: true, fibra: true, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "tofu en salsa teriyaki": { libro: 1, pagina: 109, categoria: "Snacks", iconos: { vegan: true, sacia: false, keto: true, fibra: false, kcal: false, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "bolitas de queso fit": { libro: 1, pagina: 111, categoria: "Snacks", iconos: { vegan: true, sacia: false, keto: true, fibra: false, kcal: false, sinLacteos: "queso", sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "rollitos primavera fit": { libro: 1, pagina: 113, categoria: "Snacks", iconos: { vegan: true, sacia: false, keto: false, fibra: false, kcal: false, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "bolleria casera: tostas dulces": { libro: 1, pagina: 115, categoria: "Snacks", iconos: { vegan: true, sacia: false, keto: false, fibra: false, kcal: false, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "croquetas cremosas de queso": { libro: 1, pagina: 117, categoria: "Snacks", iconos: { vegan: true, sacia: true, keto: false, fibra: false, kcal: true, sinLacteos: "queso", sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "palomitas caseras al punto de sal": { libro: 1, pagina: 119, categoria: "Snacks", iconos: { vegan: true, sacia: true, keto: false, fibra: false, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "fitpudding choco blanco": { libro: 1, pagina: 121, categoria: "Snacks", iconos: { vegan: true, sacia: true, keto: false, fibra: false, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "cinnamon rolls choco blanco y canela": { libro: 1, pagina: 123, categoria: "Snacks", iconos: { vegan: true, sacia: true, keto: false, fibra: false, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "helados squat fit": { libro: 1, pagina: 126, categoria: "Postres", iconos: { vegan: true, sacia: true, keto: true, fibra: false, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "tarta de queso casera": { libro: 1, pagina: 128, categoria: "Postres", iconos: { vegan: true, sacia: true, keto: true, fibra: false, kcal: true, sinLacteos: "queso", sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "pop-tart de fresa o arandanos": { libro: 1, pagina: 130, categoria: "Postres", iconos: { vegan: true, sacia: false, keto: false, fibra: false, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "tarta tres leches squat fit": { libro: 1, pagina: 132, categoria: "Postres", iconos: { vegan: true, sacia: true, keto: false, fibra: false, kcal: true, sinLacteos: false, sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "tarta halloween naranja y choco blanco": { libro: 1, pagina: 134, categoria: "Postres", iconos: { vegan: true, sacia: true, keto: false, fibra: false, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "volcan de chocolate": { libro: 1, pagina: 136, categoria: "Postres", iconos: { vegan: true, sacia: false, keto: false, fibra: false, kcal: false, sinLacteos: true, sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "brownie muerte por chocolate": { libro: 1, pagina: 138, categoria: "Postres", iconos: { vegan: true, sacia: false, keto: false, fibra: false, kcal: false, sinLacteos: true, sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "tarta de zanahoria y choco blanco": { libro: 1, pagina: 140, categoria: "Postres", iconos: { vegan: true, sacia: true, keto: false, fibra: false, kcal: true, sinLacteos: false, sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "tarta pantera rosa squat fit": { libro: 1, pagina: 142, categoria: "Postres", iconos: { vegan: true, sacia: false, keto: false, fibra: false, kcal: false, sinLacteos: true, sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "cookie dough choco-nube": { libro: 1, pagina: 144, categoria: "Postres", iconos: { vegan: true, sacia: false, keto: false, fibra: false, kcal: false, sinLacteos: true, sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "bizcocho con frambuesas": { libro: 1, pagina: 146, categoria: "Postres", iconos: { vegan: true, sacia: true, keto: false, fibra: false, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "pie de limon": { libro: 1, pagina: 148, categoria: "Postres", iconos: { vegan: true, sacia: true, keto: false, fibra: false, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "tarta de manzana": { libro: 1, pagina: 150, categoria: "Postres", iconos: { vegan: true, sacia: true, keto: false, fibra: false, kcal: false, sinLacteos: true, sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "alino estilo big mac": { libro: 1, pagina: 153, categoria: "Salsas saladas", iconos: { vegan: true, sacia: null, keto: true, fibra: null, kcal: false, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "salsa alioli light": { libro: 1, pagina: 155, categoria: "Salsas saladas", iconos: { vegan: true, sacia: null, keto: true, fibra: null, kcal: false, sinLacteos: true, sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "guacamole casero": { libro: 1, pagina: 157, categoria: "Salsas saladas", iconos: { vegan: true, sacia: null, keto: true, fibra: null, kcal: false, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "humus casero": { libro: 1, pagina: 159, categoria: "Salsas saladas", iconos: { vegan: true, sacia: null, keto: true, fibra: null, kcal: false, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "crema agria casera": { libro: 1, pagina: 161, categoria: "Salsas saladas", iconos: { vegan: true, sacia: null, keto: true, fibra: null, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "dip de alubias rojas": { libro: 1, pagina: 163, categoria: "Salsas saladas", iconos: { vegan: true, sacia: null, keto: true, fibra: null, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "salsa burger": { libro: 1, pagina: 165, categoria: "Salsas saladas", iconos: { vegan: true, sacia: null, keto: true, fibra: null, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "salsa agridulce": { libro: 1, pagina: 167, categoria: "Salsas saladas", iconos: { vegan: true, sacia: null, keto: true, fibra: null, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "salsa pesto casera": { libro: 1, pagina: 169, categoria: "Salsas saladas", iconos: { vegan: true, sacia: null, keto: true, fibra: true, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: null, huevoSustituible: null } },
  "fitcream manihuete": { libro: 1, pagina: 172, categoria: "Salsas dulces", iconos: { vegan: true, sacia: null, keto: true, fibra: null, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "fitcream choco blanco": { libro: 1, pagina: 174, categoria: "Salsas dulces", iconos: { vegan: true, sacia: null, keto: false, fibra: null, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "sirope de arce casera": { libro: 1, pagina: 176, categoria: "Salsas dulces", iconos: { vegan: true, sacia: null, keto: false, fibra: null, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "mermelada de fresa y frambuesa": { libro: 1, pagina: 178, categoria: "Salsas dulces", iconos: { vegan: true, sacia: null, keto: false, fibra: true, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "frosting de vainilla fit": { libro: 1, pagina: 180, categoria: "Salsas dulces", iconos: { vegan: true, sacia: null, keto: true, fibra: null, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "el famoso mangu dominicano": { libro: 1, pagina: 183, categoria: "Zona tropical", iconos: { vegan: false, sacia: true, keto: false, fibra: false, kcal: false, sinLacteos: "queso", sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "la bandera dominicana": { libro: 1, pagina: 185, categoria: "Zona tropical", iconos: { vegan: false, sacia: true, keto: false, fibra: false, kcal: false, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "palitos de yuca": { libro: 1, pagina: 187, categoria: "Zona tropical", iconos: { vegan: true, sacia: false, keto: false, fibra: false, kcal: false, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "french toast frutos del bosque": { libro: 2, pagina: 41, categoria: "Desayunos", iconos: { vegan: true, sacia: false, keto: true, fibra: false, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "tostadas cheesecake": { libro: 2, pagina: 43, categoria: "Desayunos", iconos: { vegan: true, sacia: true, keto: true, fibra: true, kcal: true, sinLacteos: "queso", sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "protein burrito": { libro: 2, pagina: 45, categoria: "Desayunos", iconos: { vegan: true, sacia: false, keto: true, fibra: false, kcal: true, sinLacteos: "queso", sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "parfait de frutos rojos": { libro: 2, pagina: 47, categoria: "Desayunos", iconos: { vegan: true, sacia: true, keto: false, fibra: false, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "menu mc muffin": { libro: 2, pagina: 49, categoria: "Desayunos", iconos: { vegan: true, sacia: true, keto: true, fibra: false, kcal: false, sinLacteos: "queso", sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "tostas saladas: eggstravagante y americana": { libro: 2, pagina: 51, categoria: "Desayunos", iconos: { vegan: true, sacia: false, keto: true, fibra: false, kcal: true, sinLacteos: "queso", sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "porridge cookies & cream": { libro: 2, pagina: 53, categoria: "Desayunos", iconos: { vegan: true, sacia: true, keto: false, fibra: false, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "chicken burger: spicy y urban": { libro: 2, pagina: 56, categoria: "Comidas", iconos: { vegan: true, sacia: false, keto: true, fibra: false, kcal: false, sinLacteos: "queso", sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "pollo cajun": { libro: 2, pagina: 58, categoria: "Comidas", iconos: { vegan: false, sacia: false, keto: true, fibra: false, kcal: false, sinLacteos: true, sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "ensalada cesar": { libro: 2, pagina: 60, categoria: "Comidas", iconos: { vegan: true, sacia: true, keto: true, fibra: true, kcal: true, sinLacteos: "queso", sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "poke bowl": { libro: 2, pagina: 62, categoria: "Comidas", iconos: { vegan: true, sacia: true, keto: true, fibra: true, kcal: false, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "ensalada burger": { libro: 2, pagina: 64, categoria: "Comidas", iconos: { vegan: true, sacia: true, keto: true, fibra: true, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "cielito lindo fit": { libro: 2, pagina: 66, categoria: "Comidas", iconos: { vegan: true, sacia: false, keto: false, fibra: false, kcal: false, sinLacteos: "queso", sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "arroz con pollo al curry": { libro: 2, pagina: 68, categoria: "Comidas", iconos: { vegan: true, sacia: true, keto: true, fibra: true, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "tortilla de patatas al airfryer": { libro: 2, pagina: 71, categoria: "Cenas", iconos: { vegan: true, sacia: true, keto: false, fibra: false, kcal: true, sinLacteos: "queso", sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "musaka con queso fundido": { libro: 2, pagina: 73, categoria: "Cenas", iconos: { vegan: true, sacia: true, keto: true, fibra: true, kcal: true, sinLacteos: "queso", sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "pita pizza": { libro: 2, pagina: 75, categoria: "Cenas", iconos: { vegan: true, sacia: false, keto: false, fibra: false, kcal: true, sinLacteos: "queso", sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "risotto de pollo y setas": { libro: 2, pagina: 77, categoria: "Cenas", iconos: { vegan: true, sacia: true, keto: true, fibra: true, kcal: true, sinLacteos: "queso", sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "fondue del huerto": { libro: 2, pagina: 79, categoria: "Cenas", iconos: { vegan: true, sacia: false, keto: true, fibra: false, kcal: true, sinLacteos: "queso", sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "brochetas de pollo teriyaki": { libro: 2, pagina: 81, categoria: "Cenas", iconos: { vegan: true, sacia: false, keto: false, fibra: false, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "lubina al limon y boniato bravo": { libro: 2, pagina: 83, categoria: "Cenas", iconos: { vegan: true, sacia: true, keto: false, fibra: true, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "parmentier fit": { libro: 2, pagina: 86, categoria: "Guarniciones", iconos: { vegan: true, sacia: true, keto: true, fibra: true, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "filetes de coliflor airfryer": { libro: 2, pagina: 88, categoria: "Guarniciones", iconos: { vegan: true, sacia: true, keto: true, fibra: true, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "pancakes coreanos": { libro: 2, pagina: 90, categoria: "Guarniciones", iconos: { vegan: true, sacia: false, keto: false, fibra: false, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "crema de queso": { libro: 2, pagina: 92, categoria: "Guarniciones", iconos: { vegan: true, sacia: true, keto: true, fibra: true, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "crema trufada": { libro: 2, pagina: 94, categoria: "Guarniciones", iconos: { vegan: true, sacia: true, keto: true, fibra: true, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "crema serrana": { libro: 2, pagina: 96, categoria: "Guarniciones", iconos: { vegan: true, sacia: true, keto: true, fibra: true, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "arroz con maiz y caldo de pollo": { libro: 2, pagina: 98, categoria: "Guarniciones", iconos: { vegan: true, sacia: true, keto: false, fibra: false, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "tortitas de calabacin": { libro: 2, pagina: 100, categoria: "Guarniciones", iconos: { vegan: true, sacia: true, keto: true, fibra: false, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "bastones de berenjena y miel": { libro: 2, pagina: 102, categoria: "Guarniciones", iconos: { vegan: true, sacia: true, keto: true, fibra: true, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "montaditos trufados": { libro: 2, pagina: 105, categoria: "Snacks", iconos: { vegan: true, sacia: true, keto: true, fibra: false, kcal: true, sinLacteos: "queso", sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "montaditos de gambas": { libro: 2, pagina: 107, categoria: "Snacks", iconos: { vegan: true, sacia: false, keto: false, fibra: false, kcal: false, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "mini croissants de pizza": { libro: 2, pagina: 109, categoria: "Snacks", iconos: { vegan: true, sacia: false, keto: false, fibra: false, kcal: false, sinLacteos: "queso", sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "merluza airfryer a la bia mara": { libro: 2, pagina: 111, categoria: "Snacks", iconos: { vegan: true, sacia: true, keto: true, fibra: false, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "quesadillas de pollo": { libro: 2, pagina: 113, categoria: "Snacks", iconos: { vegan: true, sacia: false, keto: false, fibra: false, kcal: true, sinLacteos: "queso", sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "tofu-cheese fingers": { libro: 2, pagina: 115, categoria: "Snacks", iconos: { vegan: true, sacia: true, keto: true, fibra: false, kcal: false, sinLacteos: "queso", sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "rollitos vietnamitas": { libro: 2, pagina: 117, categoria: "Snacks", iconos: { vegan: true, sacia: false, keto: true, fibra: false, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "donut tropical": { libro: 2, pagina: 119, categoria: "Snacks", iconos: { vegan: true, sacia: false, keto: true, fibra: false, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "donut lotus": { libro: 2, pagina: 121, categoria: "Snacks", iconos: { vegan: true, sacia: false, keto: true, fibra: false, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "donut banoffee": { libro: 2, pagina: 123, categoria: "Snacks", iconos: { vegan: true, sacia: false, keto: true, fibra: false, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "cuadros crunchy": { libro: 2, pagina: 125, categoria: "Snacks", iconos: { vegan: true, sacia: false, keto: false, fibra: false, kcal: false, sinLacteos: "queso", sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "nubes caseras +proteina": { libro: 2, pagina: 127, categoria: "Snacks", iconos: { vegan: true, sacia: true, keto: true, fibra: false, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "mousse de chocolate xl": { libro: 2, pagina: 129, categoria: "Snacks", iconos: { vegan: true, sacia: true, keto: true, fibra: false, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "pop-tart de canela": { libro: 2, pagina: 131, categoria: "Snacks", iconos: { vegan: true, sacia: false, keto: false, fibra: false, kcal: false, sinLacteos: true, sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "fitpudding cookies & cream": { libro: 2, pagina: 133, categoria: "Snacks", iconos: { vegan: true, sacia: true, keto: false, fibra: false, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "batidos squat fit: pink cake": { libro: 2, pagina: 136, categoria: "Postres", iconos: { vegan: true, sacia: true, keto: true, fibra: false, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "batidos squat fit: cookies & cream": { libro: 2, pagina: 138, categoria: "Postres", iconos: null },
  "sandwich helado: black cookies": { libro: 2, pagina: 140, categoria: "Postres", iconos: { vegan: true, sacia: true, keto: false, fibra: false, kcal: true, sinLacteos: "queso", sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "sandwich helado: cookie chips": { libro: 2, pagina: 142, categoria: "Postres", iconos: null },
  "muffins de arandanos y cacahuete": { libro: 2, pagina: 144, categoria: "Postres", iconos: { vegan: true, sacia: false, keto: false, fibra: false, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "tarta de tres chocolates": { libro: 2, pagina: 146, categoria: "Postres", iconos: { vegan: true, sacia: false, keto: false, fibra: false, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "banana cake squat fit": { libro: 2, pagina: 148, categoria: "Postres", iconos: { vegan: true, sacia: false, keto: false, fibra: false, kcal: true, sinLacteos: "queso", sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "coulant de pistacho casero": { libro: 2, pagina: 150, categoria: "Postres", iconos: { vegan: true, sacia: false, keto: false, fibra: false, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "tarta de kinder blanco": { libro: 2, pagina: 152, categoria: "Postres", iconos: { vegan: true, sacia: false, keto: false, fibra: false, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "birthday cake squat fit": { libro: 2, pagina: 154, categoria: "Postres", iconos: { vegan: true, sacia: false, keto: false, fibra: false, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "tarta red velvet": { libro: 2, pagina: 156, categoria: "Postres", iconos: { vegan: true, sacia: false, keto: false, fibra: false, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "fusion tarta-pancake": { libro: 2, pagina: 158, categoria: "Postres", iconos: { vegan: true, sacia: false, keto: false, fibra: false, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "tarta raffaello squat fit": { libro: 2, pagina: 160, categoria: "Postres", iconos: { vegan: true, sacia: false, keto: false, fibra: false, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "bizcocho de limon": { libro: 2, pagina: 162, categoria: "Postres", iconos: { vegan: true, sacia: false, keto: false, fibra: false, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: null, huevoSustituible: true } },
  "crumble de manzana con nata": { libro: 2, pagina: 164, categoria: "Postres", iconos: { vegan: true, sacia: false, keto: false, fibra: false, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "salsa tartara": { libro: 2, pagina: 167, categoria: "Salsas saladas", iconos: { vegan: true, sacia: null, keto: true, fibra: null, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "salsa fit mac": { libro: 2, pagina: 169, categoria: "Salsas saladas", iconos: { vegan: true, sacia: null, keto: true, fibra: null, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "salsa cesar light": { libro: 2, pagina: 171, categoria: "Salsas saladas", iconos: { vegan: true, sacia: null, keto: true, fibra: null, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "mayo squat fit": { libro: 2, pagina: 173, categoria: "Salsas saladas", iconos: { vegan: true, sacia: null, keto: true, fibra: null, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "spicy mayo light": { libro: 2, pagina: 175, categoria: "Salsas saladas", iconos: { vegan: true, sacia: null, keto: true, fibra: null, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "chili casero": { libro: 2, pagina: 177, categoria: "Salsas saladas", iconos: { vegan: true, sacia: null, keto: true, fibra: null, kcal: false, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "salsa brava fusion": { libro: 2, pagina: 179, categoria: "Salsas saladas", iconos: { vegan: true, sacia: null, keto: true, fibra: null, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "salsa curry squat fit": { libro: 2, pagina: 181, categoria: "Salsas saladas", iconos: { vegan: true, sacia: null, keto: true, fibra: null, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "salsa teriyaki light": { libro: 2, pagina: 183, categoria: "Salsas saladas", iconos: { vegan: true, sacia: null, keto: true, fibra: null, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "untable de ajo y hierbas": { libro: 2, pagina: 185, categoria: "Salsas saladas", iconos: { vegan: true, sacia: null, keto: true, fibra: null, kcal: true, sinLacteos: "queso", sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "salsa stroganoff": { libro: 2, pagina: 187, categoria: "Salsas saladas", iconos: { vegan: true, sacia: null, keto: true, fibra: null, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "fitcream nutella": { libro: 2, pagina: 190, categoria: "Salsas dulces", iconos: { vegan: true, sacia: null, keto: true, fibra: null, kcal: false, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "fitcream pistacho": { libro: 2, pagina: 192, categoria: "Salsas dulces", iconos: { vegan: true, sacia: null, keto: true, fibra: null, kcal: false, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "sirope de choco blanco 0%": { libro: 2, pagina: 194, categoria: "Salsas dulces", iconos: { vegan: true, sacia: null, keto: true, fibra: null, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "mermelada manzana y naranja": { libro: 2, pagina: 196, categoria: "Salsas dulces", iconos: { vegan: true, sacia: null, keto: false, fibra: true, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "frosting chocolate fit": { libro: 2, pagina: 198, categoria: "Salsas dulces", iconos: { vegan: true, sacia: null, keto: true, fibra: null, kcal: true, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "pastelon de platano": { libro: 2, pagina: 201, categoria: "Zona tropical", iconos: { vegan: true, sacia: true, keto: false, fibra: false, kcal: true, sinLacteos: "queso", sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "el sancocho": { libro: 2, pagina: 203, categoria: "Zona tropical", iconos: { vegan: false, sacia: true, keto: false, fibra: false, kcal: false, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },
  "montaditos de yuca": { libro: 2, pagina: 205, categoria: "Zona tropical", iconos: { vegan: true, sacia: false, keto: false, fibra: false, kcal: false, sinLacteos: true, sinGluten: true, sinHuevo: true, huevoSustituible: null } },};
