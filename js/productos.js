"use strict";

const categorias = ["perifericos", "almacenamiento", "oficina"];

class Producto {
  constructor(id, nombre, categoria, precio, stock) {
    if (!Number.isInteger(id) || id <= 0 || typeof nombre !== "string" ||
        nombre.trim() === "" || !categorias.includes(categoria) ||
        !Number.isFinite(precio) || precio <= 0 ||
        !Number.isInteger(stock) || stock < 0) {
      throw new TypeError("Los datos del producto no son válidos.");
    }
    this.id = id;
    this.nombre = nombre.trim();
    this.categoria = categoria;
    this.precio = precio;
    this.stock = stock;
  }

  hayDisponibilidad(cantidad) {
    return Number.isInteger(cantidad) && cantidad > 0 && cantidad <= this.stock;
  }

  descontarStock(cantidad) {
    if (!this.hayDisponibilidad(cantidad)) return false;
    this.stock -= cantidad;
    return true;
  }
}

const catalogo = [
  new Producto(101, "Ratón USB", "perifericos", 12.5, 8),
  new Producto(102, "Teclado", "perifericos", 24.9, 0),
  new Producto(205, "Memoria USB 64 GB", "almacenamiento", 15, 12),
  new Producto(208, "Disco SSD 1 TB", "almacenamiento", 100, 5),
  new Producto(310, "Paquete de papel A4", "oficina", 6.5, 20),
  new Producto(315, "Silla de oficina", "oficina", 125, 4)
];
const carrito = [];
const pedidos = [];
