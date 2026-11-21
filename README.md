# Gestor de pedidos de material · DWEC, práctica 2

Aplicación de nivel de 2.º de DAW realizada con HTML, CSS y JavaScript, basada en el temario aportado (sesiones 1 a 13). Fecha: **21/11/2026**.

## Ejecutar

Desde la carpeta del proyecto, con Python instalado:

```console
python -m http.server 8000 --bind 127.0.0.1
```

Abrir [http://127.0.0.1:8000](http://127.0.0.1:8000). También se puede usar Live Server de VS Code. No abrir `index.html` mediante `file://`. Para detener el servidor, pulsar Ctrl+C en su terminal.

La aplicación no necesita instalación de paquetes ni compilación. Python solo sirve los archivos: toda la lógica se ejecuta en el navegador. No hay frameworks, backend, base de datos, APIs remotas, cookies ni localStorage. Al recargar se restablece el catálogo y se vacían carrito e historial.

## Estructura

```text
index.html                     Estructura, formularios y controles HTML5
css/estilos.css                 Presentación sencilla y adaptación a móvil
js/productos.js                Clase Producto, catálogo y colecciones
js/logica.js                   Operaciones y cálculos independientes del DOM
js/interfaz.js                 Creación de elementos, eventos y validación del formulario
docs/flujo-pedidos.md           Lógica, decisiones, relación con el temario y límites
docs/verificacion.md            Resultados y explicación de las evidencias
docs/uso-ia.md                  Registro de la ayuda recibida y tareas de entrega
docs/evidencias/                Capturas de Network y del punto de interrupción
docs/conceptos-dwec-sesiones-1-11.md  Temario de partida
docs/DWEC_Práctica_2.pdf         Enunciado aportado
docs/Sesión 12.pdf              Formularios y controles
docs/Sesión 13.pdf              Validación
```

`output/playwright/` contiene herramientas y capturas de comprobación del asistente. No lo carga la aplicación y no se necesita para ejecutarla. El código de la práctica está en los cinco archivos HTML/CSS/JS indicados arriba.

## Funcionalidades y código que interviene

| Funcionalidad | Ficheros, clases y funciones |
| --- | --- |
| Catálogo inicial | `productos.js`: seis instancias de `Producto`, tres categorías y un teclado agotado. El constructor comprueba los datos. |
| Búsqueda y categoría | `interfaz.js`: `mostrarCatalogo`, `crearTarjetaProducto`. Usa `filter`, `includes`, `toLowerCase` y eventos `input` y `change`. Ambos filtros se combinan. |
| Añadir y acumular unidades | `logica.js`: `agregarAlCarrito`, `find` y `push`. `Producto.hayDisponibilidad` comprueba la cantidad acumulada. No se descuenta stock. |
| Retirar líneas | `logica.js`: `retirarDelCarrito`, bucle y `splice`. `interfaz.js`: un único evento en el contenedor del carrito atiende sus botones mediante delegación. |
| Importes y unidades | `logica.js`: `calcularSubtotal`, `calcularDescuento(subtotal, porcentaje = 10)`, `calcularResumen` y `redondearImporte`. `interfaz.js`: `mostrarCarrito` y `euros` presentan los resultados. |
| Datos del cliente y entrega | `index.html`: etiquetas, fieldset, legend y restricciones HTML5. `interfaz.js`: `leerDatosPedido` reúne los datos con `FormData`; `actualizarModalidad` activa o desactiva dirección y código postal. |
| Validación y errores | `logica.js`: `validarDatosPedido` devuelve errores por campo sin acceder al DOM. `interfaz.js`: `validarFormulario` utiliza `validity`, `setCustomValidity`, `checkValidity`; el envío usa `reportValidity`. |
| Observaciones | `interfaz.js`: `revisarEdicion` actualiza el contador con `input` y borra avisos antiguos. Máximo de 200 caracteres. |
| Confirmación | `interfaz.js`: evento `submit` y `preventDefault`. Primero se valida el formulario y `validarCarrito`; después se llama a `crearPedido`, `Producto.descontarStock`, `pedidos.push` y `carrito.splice`. |
| Historial y detalle | `logica.js`: `crearPedido` copia cada línea con `map`. `interfaz.js`: `mostrarHistorial` crea elementos `details` y `summary` con nombre, fecha ISO, modalidad e importes. |
| Filtro y resumen del historial | `interfaz.js`: `mostrarHistorial` usa `filter` y `forEach`; el contador y la suma corresponden únicamente al filtro seleccionado. |
| Exportación | `interfaz.js`: botón Exportar historial y `JSON.stringify(pedidos, null, 2)`. Exporta todo el historial, aunque haya un filtro activo. El textarea es seleccionable y de solo lectura. |

Se emplean `const`, `let`, comparaciones estrictas, funciones declaradas, parámetros por defecto y callbacks flecha. El DOM se construye con `createElement`, `textContent` y `append`; no se inserta contenido del usuario mediante `innerHTML`.

## Pruebas reproducibles en navegador

Salvo indicación contraria, recargar antes de cada prueba. Para un cliente válido usar **Ana García**, **ana@ejemplo.es**, modalidad **Recogida** y marcar la aceptación. Para envío, usar **Calle Sol 10**, **41001**. Son datos ficticios.

| Caso | Pasos y datos | Resultado esperado |
| --- | --- | --- |
| Catálogo y clase | Abrir la página. | Seis productos, tres categorías, precios positivos y stock visible. Teclado agotado. |
| Búsqueda combinada | Escribir `uSb` y elegir Almacenamiento. | Solo aparece Memoria USB 64 GB. La búsqueda ignora mayúsculas. |
| Catálogo sin resultados | Escribir `inexistente`. | Mensaje explícito, sin tarjetas. Borrar la búsqueda recupera los productos. |
| Producto agotado | Intentar añadir Teclado. | Cantidad y botón deshabilitados; carrito sin cambios. |
| Cantidad inválida | En Ratón USB probar campo vacío, `0`, `-1`, `1.5` y pulsar Añadir en cada caso. | Error junto al control; nada se añade. |
| Stock insuficiente | Añadir `9` ratones. | Se rechaza: solo hay 8. |
| Suma de cantidades | Añadir `2` ratones y después `3`. | Una sola línea con cantidad 5, subtotal 62,50 €, 5 unidades; stock del catálogo aún 8. |
| Stock acumulado | Tras el caso anterior, intentar añadir otros `4`. | Se rechaza; la línea sigue con 5. |
| Eliminación | Añadir un ratón y una memoria; pulsar Retirar Ratón USB. | Solo queda la memoria, 1 unidad y total 15 €. Retirar la memoria muestra carrito vacío. |
| Carrito vacío | Abrir sin añadir productos. | Mensaje de carrito vacío, importes a cero y Confirmar deshabilitado. |
| Menos de 100 € | Añadir `7` ratones. | Subtotal 87,50 €, descuento 0 €, total 87,50 €. |
| Exactamente 100 € | Añadir `8` ratones o `1` disco SSD. | Subtotal 100 €, descuento 10 €, total 90 €. |
| Más de 100 € | Añadir `1` silla. | Subtotal 125 €, descuento 12,50 €, total 112,50 €. Sin IVA adicional. |
| Nombre inválido | Añadir un producto, escribir espacios o `A`, completar el resto y confirmar. | Error de nombre; ni pedido ni cambios de stock. |
| Correo inválido | Añadir un producto, usar `ana` como correo y confirmar. | Error asociado al correo. Corregir a `ana@ejemplo.es` elimina ese error. No se comprueba la existencia del buzón. |
| Aceptación obligatoria | Con carrito y cliente válidos, dejar la casilla sin marcar y confirmar. | Error de aceptación; formulario conservado. |
| Dirección inválida | Elegir Envío y escribir `Sol`; confirmar con el resto válido. | Error: dirección entre 5 y 100 caracteres. |
| Código postal inválido | Elegir Envío y probar `00001`, `53000`, `4100A` y `1234`. | Se rechazan por provincia o formato. No se crea pedido. |
| Límites postales válidos | Probar `01001`, `41001` y `52001` con envío y cliente válido. | Se aceptan; el cero inicial de `01001` se conserva. La regla comprueba formato, no existencia real. |
| Cambio de modalidad | En Envío introducir `53000`; cambiar a Recogida. | Campos postales ocultos, deshabilitados, no obligatorios y sin error personalizado. Se puede confirmar con el resto válido. |
| Observaciones y contador | Escribir `Hola`, después borrar y pegar 200 letras. | Contador 4/200, luego 200/200. La edición no admite más de 200; JavaScript también comprueba el límite. |
| Confirmación por recogida | Añadir 8 ratones; introducir cliente válido y confirmar. | Pedido #1 de 90 €, stock del ratón a 0, botón de añadir deshabilitado, carrito y formulario limpios, historial actualizado. |
| Confirmación por envío | Añadir una silla, cliente válido y datos postales; confirmar. | Pedido con modalidad Envío, dirección y código postal; stock de silla baja de 4 a 3. |
| Revalidación del stock | Añadir 8 ratones y rellenar cliente válido. En Console ejecutar `catalogo.find(p => p.id === 101).stock = 7`. Confirmar. | Rechazo por stock; no se crea pedido; se conservan las 8 unidades del carrito, el stock 7 y los datos del formulario. Recargar después. |
| Historial independiente | Confirmar un pedido de un SSD y después otro del mismo producto. Abrir el detalle de ambos. | IDs 1 y 2, cada uno con una unidad a 100 €, total 90 €. El stock es 3 y las líneas anteriores no cambian. |
| Detalles | Confirmar un pedido y pulsar su cabecera en Historial. | Se despliegan nombre, cantidad, precio y subtotal de cada línea, más resumen económico. |
| Filtro de historial | Confirmar un SSD con recogida y una silla con envío; elegir Envío. | Un pedido visible; contador 1 y suma 112,50 €. Todos muestra 2 y 202,50 €. |
| Historial sin coincidencias | Confirmar solo una recogida; elegir Envío. | Mensaje sin coincidencias, contador 0 e importe 0,00 €. |
| Exportación | Después de dos pedidos, elegir Envío y pulsar Exportar historial. | JSON válido con los dos pedidos y sus datos. Se puede copiar; el filtro no limita la exportación. |
| Exportación vacía | Recargar y pulsar Exportar historial. | El textarea muestra `[]`. |
| Actualizar exportación | Exportar un pedido y confirmar otro sin volver a pulsar Exportar. | El textarea ya exportado se actualiza y contiene ambos pedidos. |
| Reinicio | Confirmar un pedido y recargar. | Se recupera el stock inicial; carrito e historial vacíos. |
| Teclado y móvil | Recorrer controles con Tab y abrir a 390 px de ancho. | Etiquetas y foco visibles, tarjetas en una columna, sin desplazamiento horizontal. |

## Depuración y carga HTTP

Evidencias reales del 21/11/2026 y explicación en [docs/verificacion.md](docs/verificacion.md).

- [Punto de interrupción](docs/evidencias/depuracion.png): `js/logica.js`, línea 17, dentro de `calcularDescuento`. Al añadir un SSD se observa `subtotal = 100` y `porcentaje = 10`. Después de continuar: descuento 10 y total 90.
- [Pestaña Network](docs/evidencias/network.png): petición GET a `http://127.0.0.1:8765/js/logica.js`. La captura muestra **304 Not Modified**, una revalidación HTTP correcta del fichero previamente descargado. No es una apertura con `file://`. En una primera carga o al deshabilitar la caché se espera 200.

Para reproducir la depuración, abrir F12 → Sources → `js/logica.js`, pulsar el número de línea 17 y añadir un SSD. Consultar Scope y continuar con F8. Quitar el punto al terminar. Para Network, abrir esa pestaña antes de recargar, seleccionar `logica.js` y comprobar URL, método y estado. Revisar también que Console no muestra errores.

## Ayuda de IA y entrega

Esta implementación se ha generado con ayuda de IA a petición del usuario. El [registro de uso](docs/uso-ia.md) describe la petición y las decisiones técnicas; no se atribuyen al alumno decisiones o pruebas realizadas por el asistente.

[Conversación compartida aportada por el autor](https://chatgpt.com/share/6b01f3e7-2134-83ed-a251-c5afe6456144).

**Pendiente del autor antes de entregar:** comprobar que el enlace permite consultar la conversación y que se incluyen las conversaciones utilizadas, incluida la de desarrollo; revisar el código y explicar sus decisiones propias. No se ha podido verificar el contenido del chat compartido desde la herramienta de consulta. El registro resumido no sustituye las conversaciones. El enunciado establece condiciones específicas sobre el uso de IA que el autor debe revisar.

Repositorio de entrega: [alvarops11/practica_dwec_2](https://github.com/alvarops11/practica_dwec_2). Comprobar que el profesor tiene acceso al repositorio. Según el enunciado, el último commit entregado debe ser anterior al **22/11/2026 a las 15:59, hora peninsular española**.
