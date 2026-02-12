import moment from "moment";

export function formatoCantidad(numero) {
  let num = Number(numero);
  let respuesta = num.toFixed(3);
  return respuesta;
}

export function formatoCantidadMiles(valor) {
  return valor.toLocaleString('es-MX', { maximumFractionDigits: 0 });
}

export function formatoCantidadDos(numero) {
  let respuesta = numero.toFixed(2);
  return respuesta;
}

export function formatoCantidaCero(numero) {
  let respuesta = numero.toFixed(0);
  return respuesta;
}

export function formatoMilesConDosDecimales(numero) {
  let num = Number(numero);
  return num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
}

export function formatoMilesConSeisDecimales(numero) {
  let num = Number(numero);
  return num.toFixed(6).replace(/\d(?=(\d{3})+\.)/g, "$&,");
}

export function formatoImpuestos(numero) {
  let respuesta = numero.toFixed(4);
  return respuesta;
}

export function formatoNumerico(value) {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function formtaoFecha(value) {
  moment.locale("es");
  return moment(value).format("DD-MMMM-YYYY HH:mm:ss");
}

export function formatoFechaSinHora(value) {
  const fecha = new Date(value);

  const dia = fecha.getDate().toString().padStart(2, "0");
  const mes = (fecha.getMonth() + 1).toString().padStart(2, "0"); // getMonth() devuelve 0-11
  const año = fecha.getFullYear();

  const fechaFormateada = `${dia}/${mes}/${año}`;

  return fechaFormateada;
}

export function generarDegradadoHex(inicioHex, finHex, cantidad) {
  const colores = [];

  if (cantidad <= 1) {
    return inicioHex;
  }

  const hexToRgb = (hex) => {
    const bigint = parseInt(hex.replace("#", ""), 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    };
  };

  const rgbToHex = ({ r, g, b }) => {
    return (
      "#" +
      r.toString(16).padStart(2, "0") +
      g.toString(16).padStart(2, "0") +
      b.toString(16).padStart(2, "0")
    );
  };

  const start = hexToRgb(inicioHex);
  const end = hexToRgb(finHex);

  for (let i = 0; i < cantidad; i++) {
    const ratio = i / (cantidad - 1);
    const r = Math.round(start.r + (end.r - start.r) * ratio);
    const g = Math.round(start.g + (end.g - start.g) * ratio);
    const b = Math.round(start.b + (end.b - start.b) * ratio);
    colores.push(rgbToHex({ r, g, b }));
  }

  return colores;
}

export function rgbToHex(rgbArray) {
  // Aseguramos que cada componente esté en el rango 0-255
  const r = Math.min(255, Math.max(0, rgbArray[0]));
  const g = Math.min(255, Math.max(0, rgbArray[1]));
  const b = Math.min(255, Math.max(0, rgbArray[2]));

  // Convertimos cada componente a hexadecimal y agregamos ceros si es necesario
  const rHex = r.toString(16).padStart(2, "0");
  const gHex = g.toString(16).padStart(2, "0");
  const bHex = b.toString(16).padStart(2, "0");

  // Concatenamos los componentes con el prefijo #
  return `#${rHex}${gHex}${bHex}`;
}
