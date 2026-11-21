"use strict";

const contenedorCatalogo = document.querySelector("#catalogo");
const contenedorCarrito = document.querySelector("#carrito");
const contenedorHistorial = document.querySelector("#historial");
const formulario = document.querySelector("#formulario-pedido");
const busqueda = document.querySelector("#busqueda");
const categoria = document.querySelector("#categoria");
const filtroHistorial = document.querySelector("#filtro-historial");
const avisoPedido = document.querySelector("#aviso-pedido");
const campos = formulario.querySelectorAll("input, textarea");
let siguienteIdPedido = 1;
let enviado = false;
const editados = [];

function crearElemento(etiqueta, texto) {
  const elemento = document.createElement(etiqueta);
  elemento.textContent = texto;
  return elemento;
}

function vaciarContenedor(contenedor) {
  for (const hijo of contenedor.querySelectorAll(":scope > *")) hijo.remove();
}

function euros(importe) {
  return importe.toFixed(2) + " €";
}

function nombreCategoria(valor) {
  if (valor === "perifericos") return "Periféricos";
  if (valor === "almacenamiento") return "Almacenamiento";
  return "Oficina";
}

function crearTarjetaProducto(producto) {
  const tarjeta = document.createElement("article");
  tarjeta.classList.add("tarjeta");
  const stock = crearElemento("p", "Existencias: " + producto.stock);
  const etiqueta = crearElemento("label", "Cantidad de " + producto.nombre);
  etiqueta.setAttribute("for", "cantidad-" + producto.id);
  const cantidad = document.createElement("input");
  cantidad.id = "cantidad-" + producto.id;
  cantidad.type = "number";
  cantidad.min = "1";
  cantidad.max = String(producto.stock);
  cantidad.step = "1";
  cantidad.required = true;
  cantidad.value = "1";
  cantidad.setAttribute("aria-describedby", "error-cantidad-" + producto.id);
  const error = crearElemento("small", "");
  error.id = "error-cantidad-" + producto.id;
  error.classList.add("error");
  error.setAttribute("aria-live", "polite");
  const boton = crearElemento("button", "Añadir al carrito");
  boton.type = "button";
  boton.dataset.productoId = String(producto.id);
  if (producto.stock === 0) {
    stock.textContent = "Agotado · Sin existencias";
    stock.classList.add("agotado");
    cantidad.disabled = true;
    boton.disabled = true;
  }
  tarjeta.append(crearElemento("h3", producto.nombre),
    crearElemento("p", nombreCategoria(producto.categoria)),
    crearElemento("p", "Precio: " + euros(producto.precio)), stock, etiqueta, cantidad, error, boton);
  return tarjeta;
}

function mostrarCatalogo() {
  vaciarContenedor(contenedorCatalogo);
  if (!["todas", ...categorias].includes(categoria.value)) {
    contenedorCatalogo.append(crearElemento("p", "Selecciona una categoría válida."));
    return;
  }
  const texto = busqueda.value.trim().toLowerCase();
  const filtrados = catalogo.filter(producto =>
    producto.nombre.toLowerCase().includes(texto) &&
    (categoria.value === "todas" || producto.categoria === categoria.value));
  if (filtrados.length === 0) {
    contenedorCatalogo.append(crearElemento("p", "No hay productos que coincidan con la búsqueda."));
  }
  filtrados.forEach(producto => contenedorCatalogo.append(crearTarjetaProducto(producto)));
}

function mostrarCarrito() {
  vaciarContenedor(contenedorCarrito);
  if (carrito.length === 0) contenedorCarrito.append(crearElemento("p", "Tu carrito está vacío."));
  carrito.forEach(linea => {
    const producto = catalogo.find(producto => producto.id === linea.productoId);
    const fila = document.createElement("article");
    fila.classList.add("linea");
    const boton = crearElemento("button", "Retirar " + producto.nombre);
    boton.type = "button";
    boton.dataset.productoId = String(producto.id);
    fila.append(crearElemento("h3", producto.nombre),
      crearElemento("p", "Cantidad: " + linea.cantidad + " · Precio unitario: " + euros(producto.precio) +
        " · Subtotal: " + euros(redondearImporte(producto.precio * linea.cantidad))), boton);
    contenedorCarrito.append(fila);
  });
  const resumen = calcularResumen(carrito, catalogo);
  document.querySelector("#resumen-carrito").textContent = "Unidades: " + resumen.unidades +
    " · Subtotal: " + euros(resumen.subtotal) + " · Descuento: " + euros(resumen.descuento) +
    " · Total: " + euros(resumen.total);
  document.querySelector("#confirmar").disabled = carrito.length === 0;
}

function mostrarHistorial() {
  vaciarContenedor(contenedorHistorial);
  if (!["todos", "recogida", "envio"].includes(filtroHistorial.value)) {
    document.querySelector("#resumen-historial").textContent = "Selecciona un filtro de entrega válido.";
    return;
  }
  const filtrados = pedidos.filter(pedido =>
    filtroHistorial.value === "todos" || pedido.modalidad === filtroHistorial.value);
  let suma = 0;
  filtrados.forEach(pedido => {
    suma += pedido.total;
    const detalle = document.createElement("details");
    const modalidad = pedido.modalidad === "envio" ? "Envío" : "Recogida";
    detalle.append(crearElemento("summary", "Pedido #" + pedido.id + " · " + pedido.fecha +
      " · " + pedido.cliente.nombre + " · " + modalidad + " · " + euros(pedido.total)));
    const lista = document.createElement("ul");
    pedido.lineas.forEach(linea => lista.append(crearElemento("li", linea.nombre + " · " +
      linea.cantidad + " unidades × " + euros(linea.precio) + " = " + euros(linea.subtotal))));
    detalle.append(lista, crearElemento("p", "Subtotal: " + euros(pedido.subtotal) +
      " · Descuento: " + euros(pedido.descuento) + " · Total: " + euros(pedido.total)));
    contenedorHistorial.append(detalle);
  });
  if (filtrados.length === 0) contenedorHistorial.append(crearElemento("p",
    pedidos.length === 0 ? "Todavía no hay pedidos confirmados." : "No hay pedidos con esta modalidad."));
  document.querySelector("#resumen-historial").textContent = "Pedidos: " + filtrados.length +
    " · Importe acumulado: " + euros(redondearImporte(suma));
}

function actualizarModalidad() {
  const seleccion = formulario.querySelector('input[name="modalidad"]:checked');
  const esEnvio = seleccion !== null && seleccion.value === "envio";
  document.querySelector("#datos-postales").hidden = !esEnvio;
  for (const nombre of ["direccion", "codigoPostal"]) {
    const campo = formulario.elements.namedItem(nombre);
    campo.disabled = !esEnvio;
    campo.required = esEnvio;
    if (!esEnvio) {
      campo.setCustomValidity("");
      campo.removeAttribute("aria-invalid");
      document.getElementById("error-" + nombre).textContent = "";
    }
  }
}

function leerDatosPedido() {
  const datos = new FormData(formulario);
  const correo = formulario.elements.namedItem("correo");
  return {
    nombre: datos.get("nombre") ?? "",
    correo: datos.get("correo") ?? "",
    correoValido: !correo.validity.typeMismatch && !correo.validity.valueMissing,
    modalidad: datos.get("modalidad"),
    direccion: datos.get("direccion") ?? "",
    codigoPostal: datos.get("codigoPostal") ?? "",
    observaciones: datos.get("observaciones") ?? "",
    aceptacion: formulario.elements.namedItem("aceptacion").checked
  };
}

function validarFormulario() {
  campos.forEach(campo => campo.setCustomValidity(""));
  const errores = validarDatosPedido(leerDatosPedido());
  campos.forEach(campo => {
    const mensaje = campo.disabled ? "" : (errores[campo.name] ?? "");
    campo.setCustomValidity(mensaje);
    const mostrar = enviado || editados.includes(campo.name);
    document.getElementById("error-" + campo.name).textContent = mostrar ? campo.validationMessage : "";
    campo.setAttribute("aria-invalid", String(mostrar && !campo.validity.valid));
  });
  return formulario.checkValidity();
}

function revisarEdicion(evento) {
  const campo = evento.target;
  if (!campo.name) return;
  if (!editados.includes(campo.name)) editados.push(campo.name);
  avisoPedido.textContent = "";
  actualizarModalidad();
  document.querySelector("#contador").textContent = formulario.elements.namedItem("observaciones").value.length + " / 200 caracteres";
  validarFormulario();
}

// Un único escuchador atiende todos los botones presentes y futuros del catálogo.
contenedorCatalogo.addEventListener("click", evento => {
  const boton = evento.target.closest("button[data-producto-id]");
  if (!boton || !contenedorCatalogo.contains(boton)) return;
  const id = Number(boton.dataset.productoId);
  const campo = document.getElementById("cantidad-" + id);
  campo.setCustomValidity("");
  const error = agregarAlCarrito(carrito, catalogo, id, campo.valueAsNumber);
  campo.setCustomValidity(error);
  campo.setAttribute("aria-invalid", String(error !== ""));
  document.getElementById("error-cantidad-" + id).textContent = error;
  if (error !== "") {
    campo.reportValidity();
    return;
  }
  document.querySelector("#aviso-catalogo").textContent = "Producto añadido al carrito.";
  avisoPedido.textContent = "";
  mostrarCarrito();
});

contenedorCatalogo.addEventListener("input", evento => {
  const campo = evento.target;
  if (campo.type !== "number") return;
  campo.setCustomValidity("");
  campo.removeAttribute("aria-invalid");
  document.getElementById("error-" + campo.id).textContent = "";
  document.querySelector("#aviso-catalogo").textContent = "";
});

contenedorCarrito.addEventListener("click", evento => {
  const boton = evento.target.closest("button[data-producto-id]");
  if (!boton || !contenedorCarrito.contains(boton)) return;
  retirarDelCarrito(carrito, Number(boton.dataset.productoId));
  avisoPedido.textContent = "Línea retirada del carrito.";
  mostrarCarrito();
});

formulario.addEventListener("input", revisarEdicion);
formulario.addEventListener("change", revisarEdicion);
formulario.addEventListener("submit", evento => {
  evento.preventDefault();
  enviado = true;
  actualizarModalidad();
  const formularioValido = validarFormulario();
  const errorCarrito = validarCarrito(carrito, catalogo);
  if (!formularioValido || errorCarrito !== "") {
    avisoPedido.textContent = errorCarrito || "Revisa los campos indicados antes de confirmar.";
    if (!formularioValido) formulario.reportValidity();
    return;
  }

  // Solo después de validar todo se modifican las tres colecciones.
  const pedido = crearPedido(siguienteIdPedido, leerDatosPedido(), carrito, catalogo);
  carrito.forEach(linea => {
    const producto = catalogo.find(producto => producto.id === linea.productoId);
    producto.descontarStock(linea.cantidad);
  });
  pedidos.push(pedido);
  siguienteIdPedido++;
  carrito.splice(0, carrito.length);
  formulario.reset();
  enviado = false;
  editados.splice(0, editados.length);
  campos.forEach(campo => {
    campo.setCustomValidity("");
    campo.removeAttribute("aria-invalid");
    document.getElementById("error-" + campo.name).textContent = "";
  });
  actualizarModalidad();
  document.querySelector("#contador").textContent = "0 / 200 caracteres";
  document.querySelector("#aviso-catalogo").textContent = "";
  // Si ya se exportó, se actualiza el texto para que no quede un historial antiguo.
  const salida = document.querySelector("#json-historial");
  if (salida.value !== "") salida.value = JSON.stringify(pedidos, null, 2);
  mostrarCatalogo();
  mostrarCarrito();
  mostrarHistorial();
  avisoPedido.textContent = "Pedido #" + pedido.id + " confirmado. Total: " + euros(pedido.total) + ".";
});

busqueda.addEventListener("input", mostrarCatalogo);
categoria.addEventListener("change", mostrarCatalogo);
filtroHistorial.addEventListener("change", mostrarHistorial);
document.querySelector("#exportar").addEventListener("click", () => {
  document.querySelector("#json-historial").value = JSON.stringify(pedidos, null, 2);
});

actualizarModalidad();
mostrarCatalogo();
mostrarCarrito();
mostrarHistorial();
