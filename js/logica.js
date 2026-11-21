"use strict";

function redondearImporte(importe) {
  return Math.round(importe * 100) / 100;
}

function calcularSubtotal(carrito, catalogo) {
  let subtotal = 0;
  for (const linea of carrito) {
    const producto = catalogo.find(producto => producto.id === linea.productoId);
    subtotal += producto.precio * linea.cantidad;
  }
  return redondearImporte(subtotal);
}

function calcularDescuento(subtotal, porcentaje = 10) {
  if (subtotal < 100) return 0;
  return redondearImporte(subtotal * porcentaje / 100);
}

function calcularResumen(carrito, catalogo) {
  const subtotal = calcularSubtotal(carrito, catalogo);
  const descuento = calcularDescuento(subtotal);
  let unidades = 0;
  for (const linea of carrito) unidades += linea.cantidad;
  return { unidades, subtotal, descuento, total: redondearImporte(subtotal - descuento) };
}

// Devuelve errores por campo; la comprobación nativa del correo se recibe como dato.
function validarDatosPedido(datos) {
  const errores = {};
  const nombre = datos.nombre.trim();
  if (nombre.length < 2 || nombre.length > 60) {
    errores.nombre = "Escribe entre 2 y 60 caracteres, sin contar los espacios exteriores.";
  }
  if (datos.correo.trim() === "" || !datos.correoValido) {
    errores.correo = "Escribe un correo con formato válido, por ejemplo ana@ejemplo.es.";
  }
  if (!["recogida", "envio"].includes(datos.modalidad)) {
    errores.modalidad = "Selecciona recogida o envío.";
  }
  if (datos.modalidad === "envio") {
    const direccion = datos.direccion.trim();
    if (direccion.length < 5 || direccion.length > 100) {
      errores.direccion = "Escribe una dirección de 5 a 100 caracteres.";
    }
    // 01-09, 10-49 o 50-52, seguidos de tres cifras. Conserva el cero inicial.
    const patronPostal = /^(0[1-9]|[1-4][0-9]|5[0-2])[0-9]{3}$/;
    if (!patronPostal.test(datos.codigoPostal)) {
      errores.codigoPostal = "Usa cinco cifras y una provincia entre 01 y 52 (ejemplo: 41001).";
    }
  }
  if (datos.observaciones.length > 200) {
    errores.observaciones = "Las observaciones no pueden superar 200 caracteres.";
  }
  if (datos.aceptacion !== true) {
    errores.aceptacion = "Debes confirmar que los datos son correctos.";
  }
  return errores;
}

function validarCarrito(carrito, catalogo) {
  if (carrito.length === 0) return "El carrito está vacío. Añade algún producto.";
  for (const linea of carrito) {
    const producto = catalogo.find(producto => producto.id === linea.productoId);
    if (!producto || !producto.hayDisponibilidad(linea.cantidad)) {
      return "El stock o la cantidad de una línea no es válido. Retírala y vuelve a añadirla.";
    }
  }
  return "";
}

function agregarAlCarrito(carrito, catalogo, productoId, cantidad) {
  const producto = catalogo.find(producto => producto.id === productoId);
  if (!producto) return "El producto no existe.";
  if (!Number.isInteger(cantidad) || cantidad <= 0) return "Indica una cantidad entera mayor que cero.";
  const linea = carrito.find(linea => linea.productoId === productoId);
  const cantidadTotal = cantidad + (linea ? linea.cantidad : 0);
  if (!producto.hayDisponibilidad(cantidadTotal)) {
    return "La cantidad total en el carrito no puede superar el stock (" + producto.stock + ").";
  }
  if (linea) linea.cantidad = cantidadTotal;
  else carrito.push({ productoId, cantidad });
  return "";
}

function retirarDelCarrito(carrito, productoId) {
  for (let i = 0; i < carrito.length; i++) {
    if (carrito[i].productoId === productoId) {
      carrito.splice(i, 1);
      return;
    }
  }
}

function crearPedido(id, datos, carrito, catalogo) {
  const resumen = calcularResumen(carrito, catalogo);
  // Cada línea es un objeto nuevo: el historial no comparte los productos ni el carrito.
  const lineas = carrito.map(linea => {
    const producto = catalogo.find(producto => producto.id === linea.productoId);
    return {
      productoId: producto.id, nombre: producto.nombre, precio: producto.precio,
      cantidad: linea.cantidad, subtotal: redondearImporte(producto.precio * linea.cantidad)
    };
  });
  return {
    id, fecha: new Date().toISOString(),
    cliente: { nombre: datos.nombre.trim(), correo: datos.correo.trim() },
    modalidad: datos.modalidad,
    direccion: datos.modalidad === "envio" ? datos.direccion.trim() : "",
    codigoPostal: datos.modalidad === "envio" ? datos.codigoPostal : "",
    observaciones: datos.observaciones,
    lineas, subtotal: resumen.subtotal, descuento: resumen.descuento, total: resumen.total
  };
}
