# Flujo del gestor de pedidos

Fecha del cambio: 21/11/2026.

## Alcance y fuentes

Se ha añadido la aplicación completa en `index.html`, `css/estilos.css`, `js/productos.js`, `js/logica.js` y `js/interfaz.js`. Antes solo existía el documento de conceptos de las sesiones 1 a 11.

Fuentes: ese documento, el enunciado `DWEC_Práctica_2.pdf` y los apuntes `Sesión 12.pdf` y `Sesión 13.pdf` encontrados junto al enunciado en `Practica_DWEC_UD2/docs`. No se ha reutilizado el código de otro proyecto ni el documento `flujo-reservas.md` de esa carpeta, pues no es el temario de esta práctica.

La guía general de las sesiones 1 a 11 contiene ejemplos de participantes, cookies, iframe e importación JSON. No son requisitos de este gestor: se aplica el enunciado específico, que pide productos, pedidos en memoria y exportación JSON.

## Relación con el temario

| Contenido | Aplicación |
| --- | --- |
| Sesiones 2-5 | `const`, `let`, comparaciones estrictas, conversiones, bucles, `Number.isInteger`, `Number.isFinite`, `Math.round`, `trim`, `toLowerCase`, `includes`, `Date`, `JSON.stringify`. |
| Sesión 6 | Selección del DOM, `createElement`, `textContent`, `append`, atributos, `classList`, eliminación de nodos. |
| Sesión 8 | Funciones pequeñas, separación entre cálculos y DOM, parámetro por defecto y callbacks flecha. |
| Sesión 9 | `push` para nuevas líneas/pedidos; `splice` para retirar/vaciar; `find` por identificador; `filter` en las dos vistas; `map` para copiar líneas; `forEach` para renderizar y descontar stock. |
| Sesión 10 | Clase `Producto`, constructor, métodos con `this` y objetos que se serializan a JSON. |
| Sesión 11 | `addEventListener`, objeto Event, `target`, `closest`, `dataset`, delegación y `preventDefault`. |
| Sesión 12 | `form.elements`, `value`, `valueAsNumber`, `checked`, `FormData`, `input`, `change`, `submit`, controles y restricciones HTML5. |
| Sesión 13 | `novalidate`, Constraint Validation API, borrado de errores personalizados, validación completa al enviar y RegExp con agrupación y alternativas. |

## Datos y flujo

Hay tres arrays: `catalogo`, `carrito` y `pedidos`. El catálogo tiene seis instancias de Producto con IDs explícitos, únicos e independientes del índice (101, 102, 205, 208, 310, 315). El carrito contiene objetos `{productoId, cantidad}`. Los pedidos tienen IDs consecutivos durante la sesión, fecha ISO, cliente, modalidad, datos postales, observaciones, líneas e importes.

1. Al cargar, los scripts con `defer` se ejecutan en orden: productos, lógica e interfaz.
2. Añadir valida una cantidad entera positiva. Si ya existe la línea, comprueba la suma con su cantidad anterior. Si excede el stock, devuelve un error sin modificar el array.
3. El catálogo conserva sus existencias al añadir o retirar del carrito.
4. Al enviar, se evita la navegación. Se revisan todas las reglas del formulario y después todas las líneas del carrito, antes de cualquier modificación.
5. Si hay errores, no se modifica ninguna colección y no se limpia el formulario.
6. Si todo es válido, `crearPedido` crea objetos nuevos para las líneas y para el cliente. Se descuenta el stock, se añade el pedido al historial, se incrementa el ID, se vacía el carrito y se limpian los controles.
7. Se actualizan catálogo, carrito e historial. Se respetan los filtros que estuvieran seleccionados; un pedido puede quedar fuera del filtro visible. Si el JSON ya se había exportado, también se actualiza.

## Cálculos

Se usan bucles con acumuladores. El subtotal es precio por cantidad sumado para todas las líneas. `calcularDescuento` usa 10 como porcentaje por defecto, tal como exige el descuento de la práctica. El nombre y la operación coinciden con el enunciado; el ejemplo de firma del PDF usa 0 como valor orientativo, no como regla económica.

Con subtotal menor de 100 no hay descuento. A partir de 100, se calcula el 10 %. Se redondean importes a céntimos con `Math.round`, manteniéndolos como números. `toFixed(2)` solo aparece en la función de presentación `euros`. No se suma IVA ni coste de envío, ya que no los pide el enunciado.

## Validación y accesibilidad

`validarDatosPedido(datos)` es independiente del DOM: recibe cadenas, modalidad, booleano de aceptación y `correoValido`. Este último procede de las restricciones nativas de `type="email"`. Así no se inventa una expresión regular para email distinta de la comprobación que solicita el PDF.

El nombre y la dirección se comprueban después de `trim()`. El código postal permanece como texto para conservar ceros iniciales. Su patrón es `^(0[1-9]|[1-4][0-9]|5[0-2])[0-9]{3}$`: provincia 01-09, 10-49 o 50-52, seguida de tres cifras. Modalidades, categoría y filtro del historial se comparan con opciones admitidas.

En cada validación se limpia primero `setCustomValidity("")`. Los errores se muestran junto a los campos editados o a todos al enviar. Se relacionan mediante `aria-describedby`, se comunican con `aria-invalid` y tienen texto explicativo. `reportValidity` se reserva para intentos fallidos de añadir o confirmar. Los campos postales ocultos se deshabilitan, dejan de ser obligatorios y se limpian sus errores. FormData los omite y un pedido de recogida guarda esos datos vacíos.

Las cantidades se leen con `valueAsNumber`; un campo vacío da NaN y se rechaza con `Number.isInteger`. No se convierte la cadena vacía a cero.

## Decisiones y límites

- Tres scripts clásicos con `defer`, sin empaquetador ni dependencias: basta el servidor estático.
- Funciones y arrays sencillos; sin herencias, servicios, patrones avanzados ni persistencia.
- El historial copia valores de compra. No guarda referencias al producto ni al objeto del carrito.
- El formulario se limpia solo tras el éxito; no hay cambios parciales si falla la validación.
- Los datos iniciales son constantes controladas. `calcularSubtotal` presupone referencias a productos existentes; el flujo de confirmación valida primero el carrito. La consola permite alterar el programa, como cualquier ejercicio ejecutado solo en cliente.
- Es una simulación local sin pagos ni envío real. La validación del correo y del código postal comprueba formato, no existencia.
- Cada pestaña tiene su propio estado; no hay inventario compartido entre usuarios. Los IDs de pedido se reinician al recargar, igual que el historial.
- La fecha se almacena y muestra en ISO UTC (`Z`) para usar directamente el formato de Date explicado en el temario.

## Cómo probarlo

Ejecutar por HTTP según README y seguir su tabla completa de casos reproducibles. Las evidencias y comprobaciones realizadas están en `verificacion.md`.
