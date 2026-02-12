import jsPDF from "jspdf";
import {
  formatoNumerico,
  formatoCantidaCero,
  formatoFechaSinHora,
  generarDegradadoHex,
  formatoCantidadMiles,
  rgbToHex,
} from "./FuncionesFormatos.js";
import axios from "axios";
import "jspdf-autotable";
import Chart from "chart.js";
import { tr } from "date-fns/locale";

// variables globales
const rutaAxios = "https://api-mongo.contago.com.mx/api/";

/**
 * Genera un reporte empresarial en PDF
 * @param {Object} token - Token del usuario
 * @param {Array} secciones - Array de secciones del reporte
 * @param {Object} opciones - Opciones adicionales para personalizar el reporte
 * @returns {Promise<Object>} - Objeto con base64 y blob del PDF generado
 */
const generarReporteEmpresarial = async (token, secciones, opciones = {}) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Crear documento PDF
      const doc = new jsPDF({
        orientation: "l",
      });

      // obtener datos de la empresa
      try {
        // Agregar portada
        agregarPortada(doc, opciones.datosEmpresa, opciones);

        // agregar indiice
        agregarIndice(doc, opciones.datosEmpresa, "ENERO A MARZO 2025");

        //BANDERAS PARA LAS PORTADAS
        let bandera = {
          facturados: false,
          nominaFacturado: false,
          flujo: false,
          nominaFlujo: false,
          cuentasCobrarPagar: false,
          riesgoPue99: false,
          riesgoPue30: false,
          riesgoSinImpuestos: false,
          riesgoArrendamiento: false,
          riesgoConceptos: false,
          riegoNc: false,
          riesgoPagosFueraTiempo: false,
          riesgoPagosAntesComprobante: false,
          riesgoEfectivo: false,
          reisgoNominaDuplicada: false,
          impuestos: false,
          combustibles: false,
          anticipos: false,
          listasNegras: false,
        };

        console.log(secciones);

        // Agregar secciones
        for (const seccion of secciones) {
          const contenido = seccion.contenido;

          const colores = seccion.colores || {
            primario: [40, 75, 140], // Default blue
            secundario: [110, 140, 200],
          };

          switch (seccion.titulo) {
            // case "portada":
            //   agregarPortadaSeccion(doc, contenido, colores, seccion.esMensual);
            //   break;

            case "Emitidos":
              if (!contenido || !tieneContenidoValido(contenido)) break;
              await agregarPagEmitidosRecibidos(
                doc,
                colores,
                seccion.titulo,
                contenido,
                seccion.esMensual
              );
              break;

            case "Recibidos":
              if (!contenido || !tieneContenidoValido(contenido)) break;

              await agregarPagEmitidosRecibidos(
                doc,
                colores,
                seccion.titulo,
                contenido,
                seccion.esMensual
              );
              break;

            case "RFC Emitidos":
              if (!contenido || !tieneContenidoValido(contenido)) break;

              await agregaRfcEmitidos(
                doc,
                colores,
                "Comprobantes emitidos por RFC",
                contenido,
                seccion.esMensual
              );
              break;

            case "RFC Recibidos":
              if (!contenido || !tieneContenidoValido(contenido)) break;

              await agregaRfcEmitidos(
                doc,
                colores,
                "Comprobantes recibidos por RFC",
                contenido,
                seccion.esMensual
              );
              break;

            case "Nomina":
              if (!contenido || !tieneContenidoValido(contenido)) break;

              await agregarPaginaNomina(
                doc,
                colores,
                "Nomina timbrada",
                contenido,
                seccion.esMensual
              );
              break;

            case "Nomina General":
              if (!contenido || !tieneContenidoValido(contenido)) break;

              if (contenido.length == 0) break;
              await agregaSubPortada(doc, 3);
              await agregarPaginaNominaGeneral(
                doc,
                colores,
                "Nomina pagada",
                contenido,
                seccion.esMensual
              );
              break;

            case "Nomina Trabajadores":
              if (!contenido || !tieneContenidoValido(contenido)) break;

              await agregarPaginaTrabajadores(
                doc,
                colores,
                "Nomina Trabajadores",
                contenido,
                seccion.esMensual
              );
              break;

            case "Nomina Conceptos":
              if (!contenido || !tieneContenidoValido(contenido)) break;

              await agregarPaginaNominaConceptos(
                doc,
                colores,
                "Nomina Conceptos",
                contenido,
                seccion.esMensual
              );
              break;

            case "Reporte Flujo Emitido":
              if (!contenido || !tieneContenidoValido(contenido)) break;

              if (contenido.length == 0) break;
              if (!bandera.flujo) {
                await agregaSubPortada(doc, 2);
                bandera.flujo = true;
              }
              await agregarPaginaFlujo(
                doc,
                colores,
                "Reporte Flujo Efectivamente Cobrado",
                contenido,
                seccion.esMensual
              );
              break;

            case "Reporte Flujo Recibido":
              if (!contenido || !tieneContenidoValido(contenido)) break;

              if (contenido.length == 0) break;
              if (!bandera.flujo) {
                await agregaSubPortada(doc, 2);
                bandera.flujo = true;
              }
              await agregarPaginaFlujo(
                doc,
                colores,
                "Reporte Flujo Efectivamente Pagado",
                contenido,
                seccion.esMensual
              );
              break;

            case "metodosDePagoRecibidos":
              if (!contenido || !tieneContenidoValido(contenido)) break;

              await agregarPaginaMetodosPagos(
                doc,
                colores,
                "REPORTE METODOS DE PAGO | RECIBIDOS",
                contenido,
                seccion.esMensual
              );
              break;

            case "metodosDePagoEmitidos":
              if (!contenido || !tieneContenidoValido(contenido)) break;

              await agregarPaginaMetodosPagos(
                doc,
                colores,
                "REPORTE METODOS DE PAGO | EMITIDOS",
                contenido,
                seccion.esMensual
              );
              break;

            case "cuentasPendientesEmitidos":
              if (!contenido || !tieneContenidoValido(contenido)) break;

              if (contenido.length == 0) break;
              if (!bandera.cuentasCobrarPagar) {
                await agregaSubPortada(doc, 4);
                bandera.cuentasCobrarPagar = true;
              }
              await agregarPaginaCuentasPendientes(
                doc,
                colores,
                "REPORTE CUENTAS POR COBRAR",
                contenido,
                seccion.esMensual
              );
              break;

            case "cuentasPendientesRecibidos":
              if (!contenido || !tieneContenidoValido(contenido)) break;

              if (contenido.length == 0) break;
              if (!bandera.cuentasCobrarPagar) {
                await agregaSubPortada(doc, 4);
                bandera.cuentasCobrarPagar = true;
              }
              await agregarPaginaCuentasPendientes(
                doc,
                colores,
                "REPORTE CUENTAS POR PAGAR",
                contenido,
                seccion.esMensual
              );
              break;

            case "Reporte Uso CFDI":
              if (!contenido || !tieneContenidoValido(contenido)) break;
              await agregaSubPortada(doc, 0);
              await agregarPaginaUsoCFDI(
                doc,
                colores,
                "REPORTE USO DE CFDI | EMITIDOS Y RECIBIDOS",
                contenido,
                seccion.esMensual
              );
              break;

            case "PUE 99 Recibido":
              if (!contenido || !tieneContenidoValido(contenido)) break;

              if (contenido.length == 0) break;
              if (!bandera.riesgoPue99) {
                await agregaSubPortada(doc, 5);
                bandera.riesgoPue99 = true;
              }
              await agregarPaginaPue(
                doc,
                colores,
                "REPORTE PUE 99 | RECIBIDO",
                contenido,
                seccion.esMensual
              );
              break;

            case "PUE 99 Emitido":
              if (!contenido || !tieneContenidoValido(contenido)) break;

              if (contenido.length == 0) break;
              if (!bandera.riesgoPue99) {
                await agregaSubPortada(doc, 5);
                bandera.riesgoPue99 = true;
              }
              await agregarPaginaPue(
                doc,
                colores,
                "REPORTE PUE 99 | EMITIDO",
                contenido,
                seccion.esMensual
              );
              break;

            case "PUE 30 Recibido":
              if (!contenido || !tieneContenidoValido(contenido)) break;

              const validaPue30Recibido =
                contenido && Object.keys(contenido).length > 0;
              if (!validaPue30Recibido) break;
              if (!bandera.riesgoPue30) {
                await agregaSubPortada(doc, 6);
                bandera.riesgoPue30 = true;
              }
              await agregarPaginaPue(
                doc,
                colores,
                "REPORTE PUE 30 | RECIBIDO",
                contenido,
                seccion.esMensual
              );
              break;

            case "PUE 30 Emitido":
              if (!contenido || !tieneContenidoValido(contenido)) break;

              const validaPue30Emitido =
                contenido && Object.keys(contenido).length > 0;
              if (!validaPue30Emitido) break;
              if (!bandera.riesgoPue30) {
                await agregaSubPortada(doc, 6);
                bandera.riesgoPue30 = true;
              }
              await agregarPaginaPue(
                doc,
                colores,
                "REPORTE PUE 30 | EMITIDO",
                contenido,
                seccion.esMensual
              );
              break;

            case "Sin Impuestos Recibidos":
              if (!contenido || !tieneContenidoValido(contenido)) break;

              if (contenido.length == 0) break;
              if (!bandera.riesgoSinImpuestos) {
                await agregaSubPortada(doc, 7);
                bandera.riesgoSinImpuestos = true;
              }
              await agregarPaginaRSinImpuestos(
                doc,
                colores,
                "REPORTE SIN IMPUESTOS | RECIBIDOS",
                contenido,
                seccion.esMensual
              );
              break;

            case "Sin Impuestos Emitidos":
              if (!contenido || !tieneContenidoValido(contenido)) break;

              if (contenido.length == 0) break;
              if (!bandera.riesgoSinImpuestos) {
                await agregaSubPortada(doc, 7);
                bandera.riesgoSinImpuestos = true;
              }
              await agregarPaginaRSinImpuestos(
                doc,
                colores,
                "REPORTE SIN IMPUESTOS | EMITIDOS",
                contenido,
                seccion.esMensual
              );
              break;

            case "Riesgo Arrendamiento":
              if (!contenido || !tieneContenidoValido(contenido)) break;

              if (contenido.length == 0) break;
              if (!bandera.riesgoArrendamiento) {
                await agregaSubPortada(doc, 8);
                bandera.riesgoArrendamiento = true;
              }
              await agregarPaginaRiesgoArrendamiento(
                doc,
                colores,
                "REPORTE RIESGO ARRENDAMIENTO SIN CUENTA PREDIAL | RECIBIDO",
                contenido,
                seccion.esMensual
              );
              break;

            case "Riesgo Conceptos Recibidos":
              if (!contenido || !tieneContenidoValido(contenido)) break;

              if (contenido.length == 0) break;
              if (!bandera.riesgoConceptos) {
                await agregaSubPortada(doc, 9);
                bandera.riesgoConceptos = true;
              }
              await agregarPaginaRiesgoConceptos(
                doc,
                colores,
                "REPORTE RIESGO CONCEPTOS CON CLAVE 01010101 | RECIBIDO",
                contenido,
                seccion.esMensual
              );
              break;

            case "Riesgo Conceptos Emitidos":
              if (!contenido || !tieneContenidoValido(contenido)) break;

              if (contenido.length == 0) break;
              if (!bandera.riesgoConceptos) {
                await agregaSubPortada(doc, 9);
                bandera.riesgoConceptos = true;
              }
              await agregarPaginaRiesgoConceptos(
                doc,
                colores,
                "REPORTE RIESGO CONCEPTOS CON CLAVE 01010101 | EMITIDOS",
                contenido,
                seccion.esMensual
              );
              break;

            case "Gastos Efectivo":
              if (!contenido || !tieneContenidoValido(contenido)) break;
              await agregaSubPortada(doc, 13);

              await agregarPaginaGastosEfectivo(
                doc,
                colores,
                "REPORTE GASTOS EFECTIVO MAYORES A $2,000",
                contenido,
                seccion.esMensual
              );
              break;

            case "consumoCombustibleEmitido":
              if (!contenido || !tieneContenidoValido(contenido)) break;

              if (contenido.length == 0) break;
              if (!bandera.combustibles) {
                await agregaSubPortada(doc, 17);
                bandera.combustibles = true;
              }
              await agregarPaginaConsumoCombustible(
                doc,
                colores,
                "REPORTE CONSUMO COMBUSTIBLE | EMITIDO",
                contenido,
                seccion.esMensual
              );
              break;

            case "consumoCombustibleRecibido":
              if (!contenido || !tieneContenidoValido(contenido)) break;

              if (contenido.length == 0) break;
              if (!bandera.combustibles) {
                await agregaSubPortada(doc, 17);
                bandera.combustibles = true;
              }
              await agregarPaginaConsumoCombustible(
                doc,
                colores,
                "REPORTE CONSUMO COMBUSTIBLE | RECIBIDO",
                contenido,
                seccion.esMensual
              );
              break;

            case "Notas Sin Relación":
              if (!contenido || !tieneContenidoValido(contenido)) break;
              await agregaSubPortada(doc, 10);

              await agregarPaginaNotasSinRelacion(
                doc,
                colores,
                "REPORTE NOTAS DE CRÉDITO SIN RELACION",
                contenido,
                seccion.esMensual
              );
              break;

            case "pagoFueraDeTiempoRecibidos":
              if (!contenido || !tieneContenidoValido(contenido)) break;

              if (contenido.length == 0) break;
              if (!bandera.riesgoPagosFueraTiempo) {
                await agregaSubPortada(doc, 11);
                bandera.riesgoPagosFueraTiempo = true;
              }
              await agregarPaginaPagoFueraDeTiempo(
                doc,
                colores,
                "REPORTE PAGOS FUERA DE TIEMPO | RECIBIDOS",
                contenido,
                seccion.esMensual
              );
              break;

            case "pagoFueraDeTiempoEmitidos":
              if (!contenido || !tieneContenidoValido(contenido)) break;

              if (contenido.length == 0) break;
              if (!bandera.riesgoPagosFueraTiempo) {
                await agregaSubPortada(doc, 11);
                bandera.riesgoPagosFueraTiempo = true;
              }
              await agregarPaginaPagoFueraDeTiempo(
                doc,
                colores,
                "REPORTE PAGOS FUERA DE TIEMPO | EMITIDOS",
                contenido,
                seccion.esMensual
              );
              break;

            case "pagoAntesDeComprobanteRecibidos":
              if (!contenido || !tieneContenidoValido(contenido)) break;

              const validapagoAntesDeComprobanteRecibidos =
                contenido && Object.keys(contenido).length > 0;
              if (!validapagoAntesDeComprobanteRecibidos) break;
              if (!bandera.riesgoPagosAntesComprobante) {
                await agregaSubPortada(doc, 12);
                bandera.riesgoPagosAntesComprobante = true;
              }
              await agregarPaginaPagoAntesDeComprobante(
                doc,
                colores,
                "REPORTE PAGOS ANTES DE COMPROBANTE | RECIBIDOS",
                contenido,
                seccion.esMensual
              );

              break;

            case "pagoAntesDeComprobanteEmitidos":
              if (!contenido || !tieneContenidoValido(contenido)) break;

              const validapagoAntesDeComprobanteEmitidos =
                contenido && Object.keys(contenido).length > 0;
              if (!validapagoAntesDeComprobanteEmitidos) break;
              if (!bandera.riesgoPagosAntesComprobante) {
                await agregaSubPortada(doc, 12);
                bandera.riesgoPagosAntesComprobante = true;
              }
              await agregarPaginaPagoAntesDeComprobante(
                doc,
                colores,
                "REPORTE PAGOS ANTES DE COMPROBANTE | EMITIDOS",
                contenido,
                seccion.esMensual
              );
              break;

            case "nominaDuplicadoO":
              if (!contenido || !tieneContenidoValido(contenido)) break;

              await agregarPaginanNominaDuplicada(
                doc,
                colores,
                "REPORTE NOMINA DUPLICADA TIPO O",
                contenido,
                seccion.esMensual
              );
              break;

            case "nominaDuplicadoE":
              if (!contenido || !tieneContenidoValido(contenido)) break;

              await agregarPaginanNominaDuplicada(
                doc,
                colores,
                "REPORTE NOMINA DUPLICADA TIPO E",
                contenido,
                seccion.esMensual
              );
              break;

            case "reporteIva":
              if (!contenido || !tieneContenidoValido(contenido)) break;

              if (!bandera.impuestos) {
                await agregaSubPortada(doc, 16);
                bandera.impuestos = true;
              }

              await agregarPaginaIvaRecibidos(
                doc,
                colores,
                "REPORTE IVA",
                contenido,
                seccion.esMensual
              );
              break;

            case "ivaRetRecibidos":
              if (!contenido || !tieneContenidoValido(contenido)) break;

              await agregarPaginaIvaRet(
                doc,
                colores,
                "REPORTE IVA RETENIDO | RECIBIDOS",
                contenido,
                seccion.esMensual
              );
              break;

            case "ivaRetEmitidos":
              if (!contenido || !tieneContenidoValido(contenido)) break;

              await agregarPaginaIvaRet(
                doc,
                colores,
                "REPORTE IVA RETENIDO | EMITIDOS",
                contenido,
                seccion.esMensual
              );
              break;

            case "isrNomina":
              if (!contenido || !tieneContenidoValido(contenido)) break;

              await agregarPaginaIsrNomina(
                doc,
                colores,
                "REPORTE ISR NOMINA",
                contenido,
                seccion.esMensual
              );
              break;

            case "retencionesIsr":
              if (!contenido || !tieneContenidoValido(contenido)) break;

              await agregarPaginaRetencionesIsr(
                doc,
                colores,
                "REPORTE RETENCIONES ISR",
                contenido,
                seccion.esMensual
              );
              break;

            case "ieps":
              if (!contenido || !tieneContenidoValido(contenido)) break;

              await agregarPaginaIesp(
                doc,
                colores,
                "REPORTE IEPS",
                contenido,
                seccion.esMensual
              );
              break;

            case "riesgoFacturadoGlobal":
              if (!contenido || !tieneContenidoValido(contenido)) break;

              await agregarPaginaRiesgoFacturaGlobal(
                doc,
                colores,
                "REPORTE RIESGO FACTURA GLOBAL",
                contenido,
                seccion.esMensual
              );
              break;

            case "anticiposEmitidos":
              console.log(contenido);
              if (!contenido || !tieneContenidoValido(contenido)) break;

              if (!bandera.anticipos) {
                await agregaSubPortada(doc, 18);
                bandera.anticipos = true;
              }

              await agregarPaginaAnticipos(
                doc,
                colores,
                "REPORTE de ANTICIPOS | EMITIDOS",
                contenido,
                seccion.esMensual
              );
              break;

            case "anticiposRecibidos":
              console.log(contenido);

              if (!contenido || !tieneContenidoValido(contenido)) break;
              if (!bandera.anticipos) {
                await agregaSubPortada(doc, 18);
                bandera.anticipos = true;
              }

              await agregarPaginaAnticipos(
                doc,
                colores,
                "REPORTE de ANTICIPOS | RECIBIDOS",
                contenido,
                seccion.esMensual
              );
              break;

            case "listasNegras":
              console.log(contenido);

              if (!contenido || !tieneContenidoValido(contenido)) break;
              if (!bandera.listasNegras) {
                await agregaSubPortada(doc, 19);
                bandera.listasNegras = true;
              }

              await agregarPaginaListaNegra(
                doc,
                colores,
                "REPORTE de lista negra",
                contenido,
                seccion.esMensual
              );
              break;

            default:
              break;
          }
        }

        // Agregar pie de pagina en todas las paginas
        agregarPieDePagina(doc, opciones.datosEmpresa);

        // Generar nombre del documento
        let nombreDoc = `Reporte_${opciones.datosEmpresa.nombre}_${new Date().toISOString().split("T")[0]
          }`;

        // Obtener el PDF como base64
        const base64 = doc.output("datauristring");

        // Obtener el PDF como blob para descarga
        const blobPDF = doc.output("blob");

        resolve({
          base64: base64,
          blob: blobPDF,
          nombreDoc: nombreDoc,
        });
      } catch (error) {
        console.log("Error al obtener datos de la empresa:", error);
        reject(error);
      }
    } catch (error) {
      console.error("Error al generar el reporte:", error);
      reject(error);
    }
  });
};

/**
 * Funcion para verificar si hay datos
 */
const tieneContenidoValido = (contenido) => {
  // Si es un array simple
  if (Array.isArray(contenido)) {
    return contenido.length > 0;
  }

  // Si es un objeto con arrays o subobjetos
  if (typeof contenido === "object" && contenido !== null) {
    return (
      Object.keys(contenido).length > 0 &&
      Object.values(contenido).some((valor) => {
        if (Array.isArray(valor)) return valor.length > 0;
        if (typeof valor === "object" && valor !== null)
          return tieneContenidoValido(valor);
        return false;
      })
    );
  }

  return false;
};

/**
 * Agrega la portada al documento PDF
 * @param {jsPDF} doc - Documento PDF
 * @param {Object} empresaData - Datos de la empresa
 * @param {string} opciones - Logo en base64
 */
const agregarPortada = (doc, empresaData, opciones) => {
  // importamos imagen de la portada
  const imagenPortada = require("../../assets/portada 3.png");

  // aplicamos marca de agua de la portada
  doc.saveGraphicsState();
  doc.setGState(new doc.GState({ opacity: 1 }));
  doc.addImage(imagenPortada, "PNG", 0, 0, 298, 211, "", "FAST", 0);
  doc.restoreGraphicsState();

  // Datos de la empresa
  const margenDerecho = 25;
  let initPostY = 70;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(38);
  doc.setTextColor(0, 0, 0);
  doc.text("Reporte Empresarial", margenDerecho, initPostY, { align: "left" });

  initPostY += 10;
  doc.setFontSize(22);

  if (opciones.mesI === opciones.mesF) {
    doc.text(`DE ${opciones.mesI} ${opciones.anio}`, margenDerecho, initPostY, {
      align: "left",
    });
  } else {
    doc.text(
      `DE ${opciones.mesI} - ${opciones.mesF} ${opciones.anio}`,
      margenDerecho,
      initPostY,
      {
        align: "left",
      }
    );
  }

  initPostY += 10;
  doc.setFontSize(18);
  doc.text(empresaData.nombre, margenDerecho, initPostY, { align: "left" });

  initPostY += 6;
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text(empresaData.rfc, margenDerecho, initPostY, { align: "left" });

  initPostY += 6;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(empresaData.regimenFiscal, margenDerecho, initPostY, {
    align: "left",
  });

  initPostY += 6;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(empresaData.domicilio, margenDerecho, initPostY, { align: "left" });

  initPostY += 6;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Reporte emitido el: ${formatoFechaSinHora(new Date())}`,
    margenDerecho,
    initPostY,
    { align: "left" }
  );

  // Agregar texto
  doc.link(10, 10, 100, 10, {
    url: "https://miauditor.contago.com.mx",
    target: "_blank",
  });
  /* 
   footer portada
  */

  // URL contago
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text("https://miauditor.contago.com.mx", 15, 290, {
    align: "left",
  });

  // Primero colocamos el texto
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  /*doc.text("https://miauditor.contago.com.mx", 15, 290, {
    align: "left",
  });*/

  const url = "https://miauditor.contago.com.mx";
  const anchoTexto =
    (doc.getStringUnitWidth(url) * 12) / doc.internal.scaleFactor;
  doc.link(15, 290 - 12, anchoTexto, 12, { url: url, target: "_blank" });

  // fecha del reporte
  // doc.setTextColor(50, 50, 50);
  // doc.text(`Fecha: ${formtaoFecha(new Date())}`, 135, 290, {
  //   align: "left",
  // });
};

/**
 * Agrega una página de sección al documento PDF
 * Versión compatible con cualquier versión de jsPDF
 * @param {jsPDF} doc - Documento PDF
 * @param {string} titulo - Título de la sección
 * @param {Array} colorBarra - Color de la barra lateral en formato RGB [r,g,b]
 * @param {string} destinoId - Color de la barra lateral en formato RGB [r,g,b]
 */
const agregarPaginaSeccion = (doc, titulo, colorBarra, destinoId) => {
  const currentPage = doc.getCurrentPageInfo().pageNumber;

  if (!destinoId) {
    destinoId = titulo.toLowerCase().replace(/[^a-z0-9]+/g, "_");
  }

  doc.setPage(currentPage);
  // doc.addNamedDestination(destinoId, 0, 0);

  doc.setFillColor(colorBarra[0], colorBarra[1], colorBarra[2]);
  doc.rect(0, 0, 10, 297, "F");

  const tituloMayusculas = titulo.toUpperCase();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);

  const centroVertical = 297 / 2;

  const longitudTexto =
    (doc.getStringUnitWidth(tituloMayusculas) * doc.getFontSize()) /
    doc.internal.scaleFactor;

  const yPos = centroVertical + longitudTexto / 5;

  // Dibujar el texto en la posición calculada
  doc.text(tituloMayusculas, 7, yPos, { angle: 90 });
};

/**
 * Agrega pie de página a todas las páginas
 * @param {jsPDF} doc - Documento PDF
 * @param {Object} empresaData - Datos de la empresa
 */
const agregarPieDePagina = (doc, empresaData) => {
  const totalPages = doc.internal.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // No agregar pie de página en la portada
    if (i === 1) continue;

    // Establecer la fuente y el estilo del pie de página
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);

    // Agregar el contenido del pie de página
    doc.text(
      `Reporte generado por ContaGo para ${empresaData.nombre}`,
      105,
      285,
      { align: "center" }
    );

    doc.text(`Página ${i} de ${totalPages}`, 190, 285, { align: "right" });
  }
};

/**
 * Crear una página de índice para el reporte empresarial
 * Agrega una página de índice después de la portada con la lista de secciones organizadas por categoría
 * @param {jsPDF} doc - Documento PDF
 * @param {Object} empresaData - Datos de la empresa
 * @param {string} periodo - Periodo del reporte (ej. "ENERO A MARZO 2025")
 */
const agregarIndice = (
  doc,
  empresaData = {},
  periodo = "ENERO A MARZO 2025"
) => {
  // Añadir una página para el índice después de la portada
  doc.addPage();
  const indexPageNumber = doc.internal.getNumberOfPages(); // Guardamos el número de página del índice

  // Título del índice
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(0, 0, 0);
  doc.text("ÍNDICE", 150, 15, { align: "center" });

  // Definir los colores para cada categoría
  const categorias = [
    { nombre: "Nómina", color: [199, 80, 121] }, // Rosa
    { nombre: "Recibidos", color: [40, 75, 140] }, // Azul
    { nombre: "Emitidos", color: [67, 160, 71] }, // Verde
    { nombre: "CFDI", color: [226, 165, 18] }, // Amarillo
    { nombre: "Impuestos", color: [242, 133, 0] }, // Naranja
    { nombre: "Riesgo Fiscal", color: [155, 45, 45] }, // Rojo
    { nombre: "Otros", color: [98, 85, 70] }, // Café
  ];

  // Definir las secciones por categoría
  const secciones = {
    CFDI: [
      { nombre: "Uso de CFDI (Emitidos y Recibidos)", destino: "uso_cfdi" },
    ],
    Emitidos: [
      {
        nombre: "Comprobantes Emitidos (Tipo Ingreso)",
        destino: "emitidos_ingreso",
      },
      { nombre: "Comprobantes Emitidos por RFC", destino: "emitidos_rfc" },
      { nombre: "Flujo Efectivamente Cobrado", destino: "flujo_cobrado" },
      {
        nombre: "Métodos de Pago - Emitidos",
        destino: "metodos_pago_emitidos",
      },
      {
        nombre: "Cuentas Pendientes - Emitidos",
        destino: "cuentas_pendientes_emitidos",
      },
      {
        nombre: "Pagos Fuera de Tiempo - Emitidos",
        destino: "pagos_fuera_tiempo_emitidos",
      },
      {
        nombre: "Pagos Antes de Comprobante - Emitidos",
        destino: "pagos_antes_comprobante_emitidos",
      },
      { nombre: "IVA Retenido - Emitidos", destino: "iva_retenido_emitidos" },
      { nombre: "PUE 99 - Emitidos", destino: "pue_99_emitidos" },
      { nombre: "PUE 30 - Emitidos", destino: "pue_30_emitidos" },
      { nombre: "Sin Impuestos - Emitidos", destino: "sin_impuestos_emitidos" },
      {
        nombre: "Riesgo Conceptos con Clave 01010101 - Emitidos",
        destino: "riesgo_conceptos_emitidos",
      },
    ],
    Recibidos: [
      {
        nombre: "Comprobantes Recibidos (Tipo Ingreso)",
        destino: "recibidos_ingreso",
      },
      { nombre: "Comprobantes Recibidos por RFC", destino: "recibidos_rfc" },
      { nombre: "Flujo Efectivamente Pagado", destino: "flujo_pagado" },
      {
        nombre: "Métodos de Pago - Recibidos",
        destino: "metodos_pago_recibidos",
      },
      {
        nombre: "Cuentas Pendientes - Recibidos",
        destino: "cuentas_pendientes_recibidos",
      },
      {
        nombre: "Pagos Fuera de Tiempo - Recibidos",
        destino: "pagos_fuera_tiempo_recibidos",
      },
      {
        nombre: "Pagos Antes de Comprobante - Recibidos",
        destino: "pagos_antes_comprobante_recibidos",
      },
      { nombre: "IVA Retenido - Recibidos", destino: "iva_retenido_recibidos" },
      { nombre: "PUE 99 - Recibidos", destino: "pue_99_recibidos" },
      { nombre: "PUE 30 - Recibidos", destino: "pue_30_recibidos" },
      {
        nombre: "Sin Impuestos - Recibidos",
        destino: "sin_impuestos_recibidos",
      },
      {
        nombre: "Riesgo Conceptos con Clave 01010101 - Recibidos",
        destino: "riesgo_conceptos_recibidos",
      },
    ],
    Nómina: [
      { nombre: "Nómina Timbrada", destino: "nomina_timbrada" },
      { nombre: "Nómina Pagada", destino: "nomina_pagada" },
      { nombre: "Nómina por Trabajadores", destino: "nomina_trabajadores" },
      { nombre: "Conceptos de Nómina", destino: "nomina_conceptos" },
      { nombre: "Nómina Duplicada Tipo O", destino: "nomina_duplicada_o" },
      { nombre: "Nómina Duplicada Tipo E", destino: "nomina_duplicada_e" },
    ],
    "Riesgo Fiscal": [
      {
        nombre: "Gastos Efectivo Mayores a $2,000",
        destino: "gastos_efectivo",
      },
      { nombre: "Notas Sin Relación", destino: "notas_sin_relacion" },
      {
        nombre: "Riesgo Arrendamiento Sin Cuenta Predial",
        destino: "riesgo_arrendamiento",
      },
      { nombre: "Riesgo Factura Global", destino: "riesgo_factura_global" },
    ],
    Impuestos: [
      { nombre: "Reporte de IVA", destino: "reporte_iva" },
      { nombre: "ISR Nómina", destino: "isr_nomina" },
      { nombre: "Retenciones ISR", destino: "retenciones_isr" },
      { nombre: "Reporte IEPS", destino: "reporte_ieps" },
    ],
    Otros: [
      { nombre: "Consumo de Combustible", destino: "consumo_combustible" },
    ],
  };

  // Título para el listado de secciones
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("CONTENIDO DEL REPORTE", 150, 30, { align: "center" });

  // Variables para controlar la posición del contenido
  let startPosY = 45;
  let currentPosY = startPosY;
  let currentColumn = 0;
  const columnsX = [20, 120, 220]; // Posiciones X para cada columna en formato horizontal
  const maxHeight = 140; // Altura máxima por columna en formato horizontal

  window.sectionPageMap = {};

  // Función auxiliar para obtener el color por categoría
  const getColorForCategory = (category) => {
    const catObj = categorias.find((c) => c.nombre === category);
    return catObj ? catObj.color : [0, 0, 0];
  };

  // Recorrer las categorías y sus secciones - Contenido primero
  Object.keys(secciones).forEach((categoria) => {
    // Verificar si necesitamos cambiar de columna
    if (currentPosY + 20 > startPosY + maxHeight) {
      currentPosY = startPosY;
      currentColumn++;

      // Si excedemos las columnas disponibles, necesitamos añadir otra página
      if (currentColumn >= columnsX.length) {
        doc.addPage();
        currentColumn = 0;
        currentPosY = startPosY;

        // Añadir título en la nueva página
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("CONTENIDO DEL REPORTE (CONTINUACIÓN)", 150, 20, {
          align: "center",
        });
      }
    }

    // Obtener el color para esta categoría
    const color = getColorForCategory(categoria);

    // Título de la categoría
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(categoria, columnsX[currentColumn], currentPosY);
    currentPosY += 8;

    // Listar las secciones de esta categoría
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    secciones[categoria].forEach((seccion) => {
      // Verificar si necesitamos cambiar de columna
      if (currentPosY > startPosY + maxHeight) {
        currentPosY = startPosY;
        currentColumn++;

        // Si excedemos las columnas disponibles, necesitamos añadir otra página
        if (currentColumn >= columnsX.length) {
          doc.addPage();
          currentColumn = 0;
          currentPosY = startPosY;

          // Añadir título en la nueva página
          doc.setFontSize(16);
          doc.setFont("helvetica", "bold");
          doc.text("CONTENIDO DEL REPORTE (CONTINUACIÓN)", 150, 20, {
            align: "center",
          });
        }
      }

      // Dibujar un punto como viñeta
      doc.setFillColor(color[0], color[1], color[2]);
      doc.circle(columnsX[currentColumn] - 5, currentPosY - 3, 1.5, "F");

      const textWidth =
        (currentColumn < columnsX.length - 1
          ? columnsX[currentColumn + 1]
          : doc.internal.pageSize.getWidth() - 20) -
        columnsX[currentColumn] -
        10;

      // AÑADIR EL LINK DE LA SECCION
      doc.link(columnsX[currentColumn], currentPosY - 5, textWidth, 6, {
        url: `#${seccion.destino}`,
      });
      doc.text(seccion.nombre, columnsX[currentColumn], currentPosY);
      currentPosY += 6;
    });

    // Añadir espacio después de cada categoría
    currentPosY += 5;
  });

  // Sección para la guía de colores después del contenido
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("GUÍA DE COLORES", 150, 190, { align: "center" });

  // Dibujar la leyenda de colores en formato horizontal
  const colorBoxSize = 8;
  const colorBoxPadding = 10;
  const colorsPerRow = 7;
  let colorPosX = 40;
  let colorPosY = 205;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  // Dibujar cada cuadro de color con su descripción
  categorias.forEach((cat, index) => {
    // Calcular posición en la cuadrícula
    const rowIndex = Math.floor(index / colorsPerRow);
    const colIndex = index % colorsPerRow;

    // Calcular posición X e Y
    const posX = 15 + colIndex * 40;
    const posY = 200 + rowIndex * 15;

    // Dibujar el rectángulo de color
    doc.setFillColor(cat.color[0], cat.color[1], cat.color[2]);
    doc.rect(posX, posY, colorBoxSize, colorBoxSize / 2, "F");

    // Escribir el nombre de la categoría
    doc.setTextColor(0, 0, 0);
    doc.text(cat.nombre, posX + colorBoxSize + 3, posY + colorBoxSize / 2 - 2);
  });

  // Añadir nota al pie
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Este reporte contiene datos financieros y fiscales del periodo de ${periodo}`,
    150,
    245,
    { align: "center" }
  );

  // Si tenemos datos de la empresa, mostrarlos en el pie de página
  if (empresaData.nombre) {
    doc.text(
      `Reporte generado para ${empresaData.nombre} (${empresaData.rfc || ""})`,
      150,
      252,
      { align: "center" }
    );
  }

  // Agregar pie de página y número de página
  const totalPages = doc.internal.getNumberOfPages();
  doc.setFontSize(8);
  doc.text(`Página 2 de ${totalPages}`, 280, 285, { align: "right" });
};

const agregaSubPortada = async (doc, indice) => {
  const listaSubPortada = [
    {
      titulo: "Comprobantes facturados",
      descripcion:
        "Lista de comprobantes emitidos y recibidos durante el o los meses seleccionados, separados por USO de CFDI los comprobantes se encuentran separados en ingreso y egreso, tanto emitidos como recibidos. Además de señalar los 10 principales clientes y proveedores. ",
    },
    {
      titulo: "Nómina",
      descripcion: "Lista de comprobantes timbrados, separados por mes.",
    },
    {
      titulo: "Flujo",
      descripcion:
        "Se muestran los comprobantes emitidos y recibidos, cobrados y pagados, comprobantes con el método de pago en PUE,  Se consideran efectivamente cobrados o pagados,  conforme a la fecha de aplicación del comprobante,  este puede ser emitido con fecha y aplicación fiscal de hasta 72 horas anteriores a la fecha de timbrado. En estos comprobantes se debe indicar la forma de pago, así como la moneda y el tipo de cambio en caso de aplicar. Comprobantes con el método de pago en PPD con complemento de pago. Los comprobantes en PPD se consideran efectivamente cobrados o pagados, siempre y cuando exista un comprobante del tipo P y con complemento de pago, que haga referencia al comprobante emitido en un inicio en PPD, en el cual se debe señalar la fecha, moneda y forma de pago, esta fecha es la que se tomará en cuenta de manera fiscal, para la aplicación del mismo.",
    },
    {
      titulo: "Flujo Nómina",
      descripcion:
        "Los comprobantes de tipo N, tendrán afectación fiscal, dependiendo de la fecha de pago, indicada en el nodo del complemento de nómina, ya que este indica la fecha en la que efectivamente hubo una salida de recursos.",
    },
    {
      titulo: "Cuentas por cobrar y por pagar",
      descripcion:
        "Se considera una cuenta por cobrar al comprobante del tipo I, con método de pago PPD, que no contenga complementos de pago relacionados o cuya suma de complementos no cubran la totalidad del importe emitido, estos también pueden disminuir si se realizan notas de crédito (Comprobantes del tipo E), que tengan relacionado de manera adecuada un comprobante del tipo I, y que por ende disminuya el saldo insoluto,  marcando la deuda como saldada.",
    },
    {
      titulo: "Riesgo fiscal | Comprobantes en PUE, con forma de pago 99",
      descripcion:
        "Para los comprobantes emitidos con método de pago PUE, se debe de indicar la forma de pago, con la cual se está cubriendo el costo del bien o servicio, dejando únicamente la forma de pago 99,  para aquellos comprobantes emitidos en PPD, ya que se desconoce el método de pago, con el cual se pagará dicha factura.",
    },
    {
      titulo: "Riesgo fiscal | Comprobantes en PUE, con forma de pago 30",
      descripcion:
        "La forma de pago 30,  se utiliza para marcar la disminución de un anticipo,  esta debe de estar únicamente en los comprobantes del tipo E.",
    },
    {
      titulo: "Riesgo fiscal | Comprobantes sin impuestos",
      descripcion:
        "Se muestran comprobantes que no cuentan con el nodo impuestos en ninguno de sus conceptos, para su validación,  en algunos casos se debe de indicar el IVA  (Exento o tasa 0),  esto no implica que no deba de llevar impuestos.",
    },
    {
      titulo:
        "Riesgo fiscal | Comprobantes de arrendamiento sin cuenta predial",
      descripcion:
        "Estas facturas contemplan servicios con las claves 80131500,  80131501, 80131502 y 80131503  Para estos conceptos se recomienda indicar el numero de cuenta predial,  en el nodo establecido, con el fin de identificar de manera adecuada el inmueble arrendado.",
    },
    {
      titulo:
        "Riesgo fiscal | Conceptos con clave 01010101 No existe en el catálogo",
      descripcion:
        "Este clave se debe de utilizar siempre y cuando no se encuentre alguna clave que se asemeje al bien o servicio, esta clave se recomienda para la elaboración de facturas globales y no reemplaza la necesidad de consultar el catálogo del SAT para identificar la clasificación de los productos o servicios.",
    },
    {
      titulo: "Riesgo fiscal | Notas de crédito sin relación",
      descripcion:
        "El objetivo de las notas de crédito es la disminución de ingresos que fueron registrados en facturas previas o para corregir un importe registrado en una factura que ya fue emitida, en el cual  se recomienda que exista previamente un CFDI  de ingreso o un CFDI de egreso.",
    },
    {
      titulo: "Riesgo fiscal | Pagos fuera de tiempo",
      descripcion:
        "Se debe emitir el CFDI con complemento para recepción de pagos a más tardar al quinto día natural del mes siguiente al que se recibió el pago. Dado que en el dato es un insumo para la determinación del IVA, se consideró un plazo similar al establecido para la declaración de dicho impuesto.",
    },
    {
      titulo: "Riesgo fiscal | Pagos antes de comprobante",
      descripcion:
        "Esto incumple a la regla que nos indica que para la emisión de un complemento de pago, debe de existir un comprobante previo del tipo I,  estos comprobantes nos indican lo contrario.",
    },
    {
      titulo: "Riesgo fiscal | Gastos en efectivo",
      descripcion:
        "Se muestran todos los comprobantes que superan el importe de $2,000.00 pesos que no son deducibles.",
    },
    {
      titulo: "Riesgo fiscal | Factura global",
      descripcion: "",
    },
    {
      titulo: "Riesgo fiscal | Nominas duplicadas",
      descripcion:
        "El sistema nos permite identificar, aquellos recibos de nomina que cuenten con el mismo tipo de nómina, (O |Ordinaria, Extraordinaria) y tengan las mismas fechas de aplicación (fecha inicial, fecha final y fecha de pago).",
    },
    {
      titulo: "Impuestos",
      descripcion:
        "En este apartado sé determina el IVA conforme al flujo que se señaló anteriormente en los comprobantes emitidos y recibidos según las tasas de los comprobantes, así mismo para el IVA retenido y retenciones de ISR conforme a las tasas de los comprobantes efectivamente pagados, las retenciones de ISR de nómina se toman en cuenta conforme a la fecha de aplicación del comprobante y su régimen correspondiente  .",
    },
    {
      titulo: "Combustibles",
      descripcion:
        "Se muestra la compra y venta de combustibles durante el período, observando el tipo de combustible, el importe y el número de litros, de igual manera se observa sí estos fueron pagados de contado o a crédito. ",
    },
    {
      titulo: "Anticipos",
      descripcion: "",
    },
    {
      titulo: "Listas Negras",
      descripcion: "",
    },
  ];

  // importamos imagen de la portada
  const imagenPortada = require("../../assets/portada3.jpg");

  doc.addPage();

  const currentPage = doc.getNumberOfPages();

  doc.setPage(currentPage);

  // aplicamos marca de agua de la portada
  doc.saveGraphicsState();
  doc.setGState(new doc.GState({ opacity: 1 }));
  doc.addImage(imagenPortada, "PNG", 0, 0, 298, 211, "", "FAST", 0);
  doc.restoreGraphicsState();

  const objTexto = { ...listaSubPortada[indice] };

  // crear contenedor HTML dinamicamente
  const container = document.createElement("div");

  container.style.width = "180mm";
  container.style.textAlign = "justify";
  container.style.position = "relative";
  container.style.zIndex = "999";

  const titulo = document.createElement("h2");
  titulo.innerText = objTexto.titulo;
  titulo.style.textAlign = "right";
  titulo.style.fontFamily = "Helvetica";
  titulo.style.fontWeight = "bold";

  const descripcion = document.createElement("p");
  descripcion.innerHTML = objTexto.descripcion.replace(/\n/g, "<br>");
  descripcion.style.fontFamily = "Helvetica";
  descripcion.style.fontSize = "20px";
  descripcion.style.textAlign = "justify";

  container.appendChild(titulo);
  container.appendChild(descripcion);
  document.body.appendChild(container);

  try {
    await doc.html(container, {
      x: 100,
      y: 20,
      width: 180,
      autoPaging: false,
      windowWidth: 800,
      html2canvas: {
        scale: 0.25,
        allowTaint: true,
        useCORS: true,
        backgroundColor: null,
      },
      page: currentPage,
      callback: () => {
        document.body.removeChild(container);
      },
    });
  } catch (error) {
    console.error("Error al renderizar HTML en PDF:", error);
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
};

/**
 * Generar grafica
 * @param {jsPDF} doc - Documento PDF
 * @param {jsPDF} tipo - Tipo de grafica
 * @param {Object} opciones - Opciones para la grafica
 * @param {number} indiceColumna - Indice de la columna con los datos a graficar
 * @param {string} titulo - Titulo de la grafica
 * @param {Object} colores - Colores para la grafica
 * @param {Object} datos - Datos a mostrar
 */
const generarGrafica = async (
  doc,
  tipo,
  opciones = {
    width: 600,
    height: 300,
    posX: 50,
    posY: 120,
    ancho: 200,
    alto: 90,
  },
  indiceColumna,
  titulo,
  colores,
  datos
) => {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = opciones.width;
      canvas.height = opciones.height;

      const ctx = canvas.getContext("2d");

      // EXCLUIR ULTIMA FILA CON LOS TOTALES
      const datosSinTotal = datos.slice(0, -1);
      // EXTRAEMOS LOS MESES
      const meses = datosSinTotal.map((fila) => fila[0]);

      // EXTRAEMOS LOS DATOS
      let valores = [];
      let datasets = [];

      if (tipo === "pie") {
        // filtramos solo los meses con valores > 0
        const mesesFiltrados = [];
        const valoresFiltrados = [];

        for (let i = 0; i < datosSinTotal.length; i++) {
          const valor = datosSinTotal[i][indiceColumna];
          const valorNumerico =
            typeof valor === "string"
              ? parseFloat(valor.replace(/[^\d.-]/g, ""))
              : valor;

          // if (valorNumerico > 0) {
          //   mesesFiltrados.push(meses[i]);
          //   valoresFiltrados.push(valorNumerico);
          // }

          // Sin filtrar
          mesesFiltrados.push(meses[i]);
          valoresFiltrados.push(valorNumerico);
        }

        // Reemplazamos los arrays originales con los filtrados
        meses.length = 0;
        meses.push(...mesesFiltrados);
        valores = valoresFiltrados;
      } else if (tipo === "line") {
        const mesesFiltrados = [];
        const totalesFiltrados = [];

        for (let i = 0; i < meses.length; i++) {
          // Extraemos el valor de la columna
          const valor = datos[i][indiceColumna];
          const valorNumerico =
            typeof valor === "string"
              ? parseFloat(valor.replace(/[^\d.-]/g, ""))
              : valor;

          // Solo incluimos meses con valores mayores a cero
          // if (valorNumerico > 0) {
          //   mesesFiltrados.push(meses[i]);
          //   totalesFiltrados.push(valorNumerico);
          // }

          // meses sin flitrar
          mesesFiltrados.push(meses[i]);
          totalesFiltrados.push(valorNumerico);
        }

        // Creamos un unico dataset
        datasets.push({
          label: "Total",
          data: totalesFiltrados,
          backgroundColor: `rgba(${colores.primario[0]}, ${colores.primario[1]}, ${colores.primario[2]}, 0.2)`,
          borderColor: `rgba(${colores.primario[0]}, ${colores.primario[1]}, ${colores.primario[2]}, 1)`,
          borderWidth: 3,
          fill: false,
          tension: 0.4,
          pointRadius: 6,
          pointBackgroundColor: `rgba(${colores.secundario[0]}, ${colores.secundario[1]}, ${colores.secundario[2]}, 1)`,
        });

        // Actualizamos los meses
        meses.length = 0;
        meses.push(...mesesFiltrados);
      } else {
        // Para otros tipos de graficos
        valores = datos.slice(0, -1).map((fila) => {
          const valor = fila[indiceColumna];
          return typeof valor === "string"
            ? parseFloat(valor.replace(/[^\d.-]/g, ""))
            : valor;
        });
      }

      // Funcion para generar colores distintos y contrastantes
      const generarPaletaDeColores = (cantidad) => {
        // Paleta de colores bien diferenciados
        const paleta = [
          [255, 99, 132], // Rojo
          [54, 162, 235], // Azul
          [255, 206, 86], // Amarillo
          [75, 192, 192], // Verde agua
          [153, 102, 255], // Purpura
          [255, 159, 64], // Naranja
          [231, 76, 60], // Rojo tomate
          [46, 204, 113], // Verde esmeralda
          [52, 152, 219], // Azul claro
          [155, 89, 182], // Purpura medio
          [241, 196, 15], // Amarillo oro
          [230, 126, 34], // Naranja oscuro
          [26, 188, 156], // Verde turquesa
          [236, 112, 99], // Coral
          [93, 173, 226], // Azul claro
        ];

        return paleta.slice(0, cantidad);
      };

      // Colores segun el tipo de grafico
      let backgroundColors, borderColors;

      if (tipo === "pie") {
        // Generar colores distintos para cada segmento
        const coloresPaleta = generarPaletaDeColores(meses.length);

        backgroundColors = coloresPaleta.map(
          ([r, g, b]) => `rgba(${r}, ${g}, ${b}, 0.7)`
        );
        borderColors = coloresPaleta.map(
          ([r, g, b]) => `rgb(${r}, ${g}, ${b})`
        );
      } else if (tipo !== "line") {
        // Para otros tipos, usamos los colores proporcionados
        backgroundColors = `rgba(${colores.secundario[0]}, ${colores.secundario[1]}, ${colores.secundario[2]}, 0.7)`;
        borderColors = `rgb(${colores.primario[0]}, ${colores.primario[1]}, ${colores.primario[2]})`;
      }

      // Opciones
      let options = {
        responsive: false,
        animation: false,
        plugins: {
          legend: {
            display: true,
            position: tipo === "pie" ? "right" : "top",
            labels: {
              boxWidth: 12,
              font: {
                size: 10,
              },
            },
          },
          title: {
            display: true,
            text: titulo,
            font: {
              size: 16,
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                let label = context.label || "";
                if (label) {
                  label += ": ";
                }
                label += context.formattedValue;
                return label;
              },
            },
          },
        },
      };

      // CONFIGURACIONES ESPECIFICAS PARA PIE
      if (tipo === "pie") {
        options.circumference = 360;
        // options.rotation = 0;
      }

      // agregar scales solo para graficos que no son pie
      if (tipo !== "pie") {
        options.scales = {
          yAxes: [
            {
              ticks: { beginAtZero: true },
            },
          ],
        };
      }

      let chartData = {};

      if (tipo === "line") {
        chartData = {
          labels: meses,
          datasets: datasets,
        };
      } else if (tipo === "pie") {
        chartData = {
          labels: meses,
          datasets: [
            {
              label: titulo,
              data: valores,
              backgroundColor: backgroundColors,
              borderColor: borderColors,
              borderWidth: 1,
            },
          ],
        };
      } else {
        // PARA LAS DEMAS GRAFICAS FILTRAMOS VALORES DE CERO PARA MEJORAR LA VISUALIZACION

        const mesesFiltrados = [];
        const valoresFiltrados = [];

        for (let i = 0; i < meses.length; i++) {
          // if (valores[i] > 0) {
          //   mesesFiltrados.push(meses[i]);
          //   valoresFiltrados.push(valores[i]);
          // }
          mesesFiltrados.push(meses[i]);
          valoresFiltrados.push(valores[i]);
        }
        chartData = {
          labels: mesesFiltrados,
          datasets: [
            {
              label: titulo,
              data: valoresFiltrados,
              backgroundColor: backgroundColors,
              borderColor: borderColors,
              borderWidth: 1,
            },
          ],
        };
      }

      const chart = new Chart(ctx, {
        type: tipo,
        data: chartData,
        options: options,
      });

      // Convertir la grafica en imagen
      setTimeout(() => {
        try {
          const imgData = canvas.toDataURL("image/png");

          let posX, ancho;

          // if (tipo === "pie") {
          //   posX = 60;
          //   ancho = 185;
          // } else if (tipo === "line") {
          //   posX = opciones.posX;
          //   ancho = opciones.ancho;
          // } else {
          //   posX = 70;
          //   ancho = 165;
          // }

          posX = opciones.posX;
          ancho = opciones.ancho;

          // agregar la iamgen al pdf
          doc.addImage(
            imgData,
            "PNG",
            posX,
            opciones.posY,
            ancho,
            opciones.alto
          );
          chart.destroy();
          // eliminar canvas del dom
          // document.body.removeChild(canvas);

          resolve();
        } catch (error) {
          reject(error);
        }
      }, 300);
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

async function generarGraficaPastel(datos) {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 400;

    const ctx = canvas.getContext("2d");

    const chart = new Chart(ctx, {
      type: "pie",
      data: datos,
      options: {
        responsive: false,
        animation: false,
        layout: {
          padding: {
            top: 50,
            right: 250,
            bottom: 50,
            left: 250,
          },
        },
        legend: {
          display: false,
          position: "bottom",
        },
        tooltips: {
          enabled: true,
        },
      },
      plugins: [
        {
          afterDraw: function (chart) {
            const ctx = chart.ctx;

            // Obtener informacion sobre el centro y radio del grafico
            const chartArea = chart.chartArea;
            const centerX = (chartArea.left + chartArea.right) / 2;
            const centerY = (chartArea.top + chartArea.bottom) / 2;

            // Calcular el radio basado en el tamanio del area del grafico
            const radius = Math.min(
              (chartArea.right - chartArea.left) / 2,
              (chartArea.bottom - chartArea.top) / 2
            );

            // Lista para almacenar los valores pequeños
            let valoresPequenos = [];

            chart.data.datasets.forEach((dataset, datasetIndex) => {
              const meta = chart.getDatasetMeta(datasetIndex);
              const total = dataset.data.reduce((a, b) => a + b, 0);

              meta.data.forEach((element, index) => {
                // Calcular el porcentaje
                const value = dataset.data[index];
                const percentage = (value / total) * 100;

                // Si el porcentaje es menor a 0.9%, lo agregamos a la lista de valores pequeños
                if (percentage < 5.0) {
                  let label = chart.data.labels[index];
                  if (label === "") label = "Otros";

                  // Obtener el color del segmento
                  const backgroundColor = dataset.backgroundColor[index];

                  valoresPequenos.push({
                    label: label,
                    percentage: percentage.toFixed(1) + " %",
                    color: backgroundColor,
                  });

                  // No dibujar la línea para valores pequeños
                  return;
                }

                // Obtener el modelo para este punto de datos
                const model = element._model;

                // Obtener posicion y angulo del segmento
                const startAngle = model.startAngle;
                const endAngle = model.endAngle;
                const middleAngle = startAngle + (endAngle - startAngle) / 2;

                // Calcular posicion para la linea y la etiqueta
                const lineLength = radius * 0.3; // Longitud de la linea

                // Punto inicial de la linea (en el borde del pastel)
                const x1 = centerX + Math.cos(middleAngle) * radius;
                const y1 = centerY + Math.sin(middleAngle) * radius;

                // Punto intermedio de la linea (hacia afuera)
                const x2 =
                  centerX + Math.cos(middleAngle) * (radius + lineLength);
                const y2 =
                  centerY + Math.sin(middleAngle) * (radius + lineLength);

                // Punto final con ajuste horizontal para la etiqueta
                let x3 = x2;
                // Determinar si estamos en la mitad izquierda o derecha del circulo
                if (
                  middleAngle > Math.PI / 2 &&
                  middleAngle < (Math.PI * 3) / 2
                ) {
                  x3 = x2 - 40; // Lado izquierdo
                } else {
                  x3 = x2 + 40; // Lado derecho
                }

                // Dibujar la linea
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.lineTo(x3, y2);
                ctx.strokeStyle = "black";
                ctx.lineWidth = 1;
                ctx.stroke();

                // Configurar texto
                ctx.font = "14px Arial";
                ctx.fillStyle = "black";

                // Obtener la etiqueta
                let label = chart.data.labels[index];
                if (label === "") label = "Otros";

                // Formatear el porcentaje
                const percentageText = percentage.toFixed(1) + " %";

                // Alineacion del texto basada en qu lado del circulo estamos
                if (
                  middleAngle > Math.PI / 2 &&
                  middleAngle < (Math.PI * 3) / 2
                ) {
                  ctx.textAlign = "right";
                  ctx.fillText(`${label} - ${percentageText}`, x3 - 5, y2 + 5);
                } else {
                  ctx.textAlign = "left";
                  ctx.fillText(`${label} - ${percentageText}`, x3 + 5, y2 + 5);
                }
              });
            });

            // Dibujar la leyenda para valores pequeños
            // if (valoresPequenos.length > 0) {
            //   // Configurar texto para la leyenda
            //   ctx.font = "14px Arial";
            //   ctx.fillStyle = "black";
            //   ctx.textAlign = "left";

            //   // Posición de la leyenda (abajo a la derecha)
            //   const legendX = chartArea.right - 200;
            //   let legendY = chartArea.bottom + 20;

            //   // Título de la leyenda
            //   ctx.font = "bold 14px Arial";
            //   ctx.fillText("Valores < 0.9%:", legendX, legendY);
            //   legendY += 20;

            //   // Resetear fuente
            //   ctx.font = "14px Arial";

            //   // Tamaño del cuadro de color
            //   const colorBoxSize = 14;
            //   const colorBoxMargin = 5;

            //   // Listar los valores pequeños
            //   valoresPequenos.forEach((item) => {
            //     // Dibujar un cuadro con el color del segmento
            //     ctx.fillStyle = item.color;
            //     ctx.fillRect(
            //       legendX,
            //       legendY - colorBoxSize + 2,
            //       colorBoxSize,
            //       colorBoxSize
            //     );
            //     ctx.strokeStyle = "black";
            //     ctx.lineWidth = 0.5;
            //     ctx.strokeRect(
            //       legendX,
            //       legendY - colorBoxSize + 2,
            //       colorBoxSize,
            //       colorBoxSize
            //     );

            //     // Escribir el texto de la leyenda
            //     ctx.fillStyle = "black";
            //     ctx.fillText(
            //       `${item.label} - ${item.percentage}`,
            //       legendX + colorBoxSize + colorBoxMargin,
            //       legendY
            //     );
            //     legendY += 20;
            //   });
            // }

            // if (valoresPequenos.length > 0) {
            //   ctx.font = "italic 14px Arial";
            //   ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            //   ctx.textAlign = "center";
            //   ctx.fillText(
            //     "* Solo se muestran los valores mayores al 5%",
            //     centerX,
            //     chartArea.bottom + 30
            //   );
            // }
          },
        },
      ],
    });

    setTimeout(() => {
      let imgData = canvas.toDataURL("image/png");
      chart.destroy();
      resolve(imgData);
    }, 500);
  });
}

/*
 
PLANILLAS PAGINAS

*/

/**
 * Generar paginas para pagos emitidos y recibidos
 * @param {jsPDF} doc - Documento PDF
 * @param {Object} colores - Colores para la seccion
 * @param {string} titulo - Titulo para la seccion
 * @param {Object} contenido - Contenido de la seccion
 */
const agregarPagEmitidosRecibidos = async (
  doc,
  colores,
  titulo,
  contenido,
  esMensual
) => {
  const header = [
    "Mes",
    "# Comprobantes",
    "Subtotal",
    "Traslados",
    "Retenciones",
    "Total",
  ];

  let filasI = [];
  let filasE = [];

  let contadorITotal = 0;
  let subTotalITotal = 0;
  let trasladosITotal = 0;
  let retencionesITotal = 0;
  let totalITotal = 0;

  let contadorETotal = 0;
  let subTotalETotal = 0;
  let trasladosETotal = 0;
  let retencionesETotal = 0;
  let totalETotal = 0;

  for (const dato of contenido) {
    const filaI = [
      dato.mes || "N/A",
      dato.contadorI || 0,
      formatoNumerico(dato.subTotalI || 0),
      formatoNumerico(dato.trasladosI || 0),
      formatoNumerico(dato.retencionesI || 0),
      formatoNumerico(dato.totalI || 0),
    ];

    contadorITotal += dato.contadorI || 0;
    subTotalITotal += dato.subTotalI || 0;
    trasladosITotal += dato.trasladosI || 0;
    retencionesITotal += dato.retencionesI || 0;
    totalITotal += dato.totalI || 0;

    const filaE = [
      dato.mes || "N/A",
      dato.contadorE || 0,
      formatoNumerico(dato.subTotalE || 0),
      formatoNumerico(dato.trasladosE || 0),
      formatoNumerico(dato.retencionesE || 0),
      formatoNumerico(dato.totalE || 0),
    ];

    contadorETotal += dato.contadorE || 0;
    subTotalETotal += dato.subTotalE || 0;
    trasladosETotal += dato.trasladosE || 0;
    retencionesETotal += dato.retencionesE || 0;
    totalETotal += dato.totalE || 0;

    filasI.push(filaI);
    filasE.push(filaE);
  }

  // AGREGAMOS TOTALES
  filasI.push([
    "Total",
    contadorITotal,
    formatoNumerico(subTotalITotal),
    formatoNumerico(trasladosITotal),
    formatoNumerico(retencionesITotal),
    formatoNumerico(totalITotal),
  ]);

  filasE.push([
    "Total",
    contadorETotal,
    formatoNumerico(subTotalETotal),
    formatoNumerico(trasladosETotal),
    formatoNumerico(retencionesETotal),
    formatoNumerico(totalETotal),
  ]);

  // CONDICION DE RENDERIZADO
  // if (contadorETotal === 0 && contadorITotal === 0) return;

  if (contadorITotal != 0) {
    // PAGINA PARA EMITIDOS DE TIPO INGRESO
    doc.addPage();

    doc.autoTable({
      head: [header],
      body: [...filasI],
      startY: 10,
      startX: 10,
      margin: { left: 20, right: 10 },
      theme: "grid",
      headStyles: {
        fillColor: colores.primario,
        textColor: [255, 255, 255],
        fontSize: 12,
      },
      columnStyles: {
        1: { halign: "center" },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "right" },
      },
      didParseCell: function (data) {
        if (data.section === "head") {
          if (data.column.index === 0) {
            data.cell.styles.halign = "left";
          } else if (data.column.index === 1) {
            data.cell.styles.halign = "center";
          } else if (data.column.index > 1) {
            data.cell.styles.halign = "right";
          }
        }

        if (data.section === "body" && data.row.index === filasI.length - 1) {
          data.cell.styles.fillColor = colores.secundario;
          data.cell.styles.textColor = [0, 0, 0];
          data.cell.styles.fontStyle = "bold";
        }
      },
      didDrawPage: function (data) {
        agregarPaginaSeccion(
          doc,
          `${titulo} tipo ingreso`,
          colores.primario,
          "emitidos_ingreso"
        );
      },
    });

    const opciones = {
      width: 600,
      height: 300,
      posX: 70,
      posY: 120,
      ancho: 165,
      alto: 90,
    };

    if (filasI.length > 2) {
      await generarGrafica(
        doc,
        "bar",
        opciones,
        2,
        "Subtotal",
        colores,
        filasI
      );
    }
  }

  if (contadorETotal != 0) {
    // PAGINA PARA EMITIDOS DE TIPO EGRESO
    doc.addPage();

    doc.autoTable({
      head: [header],
      body: [...filasE],
      startY: 10,
      startX: 10,
      margin: { left: 20, right: 10 },
      theme: "grid",
      headStyles: {
        fillColor: colores.primario,
        textColor: [255, 255, 255],
        fontSize: 12,
      },
      columnStyles: {
        1: { halign: "center" },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "right" },
      },
      didParseCell: function (data) {
        if (data.section === "head") {
          if (data.column.index === 0) {
            data.cell.styles.halign = "left";
          } else if (data.column.index === 1) {
            data.cell.styles.halign = "center";
          } else if (data.column.index > 1) {
            data.cell.styles.halign = "right";
          }
        }

        if (data.section === "body" && data.row.index === filasE.length - 1) {
          data.cell.styles.fillColor = colores.secundario;
          data.cell.styles.textColor = [0, 0, 0];
          data.cell.styles.fontStyle = "bold";
        }
      },
      didDrawPage: function (data) {
        agregarPaginaSeccion(
          doc,
          `${titulo} tipo egreso`,
          colores.primario,
          "recibidos_ingreso"
        );
      },
    });

    const opciones = {
      width: 600,
      height: 300,
      posX: 70,
      posY: 120,
      ancho: 165,
      alto: 90,
    };

    if (filasE.length > 2) {
      await generarGrafica(
        doc,
        "bar",
        opciones,
        2,
        "Subtotal",
        colores,
        filasE
      );
    }
  }
};

const agregaRfcEmitidos = async (
  doc,
  colores,
  titulo,
  contenido,
  esMensual
) => {
  const header = [
    "RFC",
    "Nombre",
    "# Ingreso",
    "Importe",
    "# Egreso",
    "Importe",
  ];
  const body = contenido.map((obj) => Object.values(obj));

  const columnasConDecimales = [3, 5];
  const columnasSinDecimales = [2, 4];

  //TOTALES
  const totalIngreso = contenido.reduce((sum, row) => sum + row.ingresos, 0);
  const totalImporteI = contenido.reduce((sum, row) => sum + row.importeI, 0);
  const totalEgreso = contenido.reduce((sum, row) => sum + row.egresos, 0);
  const totalImporteE = contenido.reduce((sum, row) => sum + row.importeE, 0);
  const totales = [
    "Total",
    "",
    totalIngreso,
    totalImporteI,
    totalEgreso,
    totalImporteE,
  ];

  // CONDICION DE RENDERIZADO
  if (totalIngreso === 0 && totalEgreso === 0) return;

  doc.addPage();

  doc.autoTable({
    head: [header],
    body: [...body, totales],
    startY: 10,
    startX: 10,
    margin: { left: 20, right: 10 },
    theme: "grid",
    headStyles: {
      fillColor: colores.primario,
      textColor: [255, 255, 255],
      fontSize: 12,
    },
    columnStyles: {
      2: { halign: "center" },
      3: { halign: "right" },
      4: { halign: "center" },
      5: { halign: "right" },
    },
    didParseCell(data) {
      const i = data.column.index;
      const valor = data.cell.raw;
      if (typeof valor === "number") {
        if (columnasConDecimales.includes(i)) {
          data.cell.text = [formatoNumerico(valor)];
          data.cell.styles.halign = "right";
        } else if (columnasSinDecimales.includes(i)) {
          data.cell.text = [formatoCantidaCero(valor)];
          data.cell.styles.halign = "center";
        }
      }

      if (data.section === "head") {
        if (data.column.index === 3 || data.column.index === 5) {
          data.cell.styles.halign = "right"; // Columnas de importes alineadas a la derecha
        }
      }

      if (data.row.index === body.length) {
        data.cell.styles.fillColor = colores.secundario;
        data.cell.styles.textColor = [0, 0, 0];
        data.cell.styles.fontStyle = "bold";
      }
    },
    didDrawPage: function (data) {
      agregarPaginaSeccion(doc, titulo, colores.primario, "emitidos_rfc");
    },
  });

  //AGREGAMOS LA GRAFICA DE PASTEL DE IMPORTES INGRESO
  if (totalIngreso !== 0) {
    const listaRfc = body.map((fila) => fila[0]);
    const listaImportes = body.map((fila) => fila[3]);
    const degradado = generarDegradadoHex(
      rgbToHex(colores.primario),
      rgbToHex(colores.secundario),
      listaRfc.length
    );
    const datos = {
      labels: listaRfc,
      datasets: [
        {
          data: listaImportes,
          backgroundColor: degradado,
          hoverOffset: 4,
        },
      ],
    };
    let imgData = await generarGraficaPastel(datos);
    doc.addImage(imgData, "PNG", 60, 120, 170, 80);
  }

  //AGREGAMOS LA GRAFICA DE PASTEL DE IMPORTES EGRESO
  if (totalEgreso !== 0) {
    const listaRfc = body.map((fila) => fila[0]);
    const listaImportes = body.map((fila) => fila[3]);
    const degradado = generarDegradadoHex(
      rgbToHex(colores.primario),
      rgbToHex(colores.secundario),
      listaRfc.length
    );
    const datos = {
      labels: listaRfc,
      datasets: [
        {
          data: listaImportes,
          backgroundColor: degradado,
          hoverOffset: 4,
        },
      ],
    };
    let imgData = await generarGraficaPastel(datos);
    doc.addImage(imgData, "PNG", 60, 120, 170, 80);
  }

  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text("* Solo se muestran los valores mayores al 5%", 225, 205);
};

/**
 * Generar pagina para nomina
 * @param {jsPDF} doc - Documento PDF
 * @param {Object} colores - Colores para la seccion
 * @param {string} titulo - Titulo para la seccion
 * @param {Object} contenido - Contenido de la seccion
 */
const agregarPaginaNomina = async (
  doc,
  colores,
  titulo,
  contenido,
  esMensual
) => {
  const header = [
    "Mes",
    "# Comprobantes",
    "Percepciones",
    "Deducciones",
    "Otros Pagos",
    "Total",
  ];

  let filas = [];

  let contadorComprobantes = 0;
  let contadorDeducciones = 0;
  let contadorOtrosPagos = 0;
  let contadorPercepciones = 0;
  let contadorTotal = 0;

  for (const dato of contenido) {
    const fila = [
      dato.mes || "N/A",
      dato.contador || 0,
      formatoNumerico(dato.percepciones || 0),
      formatoNumerico(dato.deducciones || 0),
      formatoNumerico(dato.otrosPagos || 0),
      formatoNumerico(dato.total || 0),
    ];

    contadorComprobantes += dato.contador || 0;
    contadorPercepciones += dato.percepciones || 0;
    contadorDeducciones += dato.deducciones || 0;
    contadorOtrosPagos += dato.otrosPagos || 0;
    contadorTotal += dato.total || 0;

    filas.push(fila);
  }

  // AGREGAMOS TOTALES
  filas.push([
    "Total",
    contadorComprobantes,
    formatoNumerico(contadorPercepciones),
    formatoNumerico(contadorDeducciones),
    formatoNumerico(contadorOtrosPagos),
    formatoNumerico(contadorTotal),
  ]);

  // CONDICION DE RENDERIZADO
  if (contadorComprobantes === 0) return;

  // Se agrega la portada de la seccion
  await agregaSubPortada(doc, 1);

  doc.addPage();

  doc.autoTable({
    head: [header],
    body: [...filas],
    startY: 10,
    startX: 10,
    margin: { left: 20, right: 10 },
    theme: "grid",
    headStyles: {
      fillColor: colores.primario,
      textColor: [255, 255, 255],
      fontSize: 12,
    },
    columnStyles: {
      1: { halign: "center" },
      2: { halign: "right" },
      3: { halign: "right" },
      4: { halign: "right" },
      5: { halign: "right" },
    },
    didParseCell: function (data) {
      if (data.section === "head") {
        if (data.column.index === 0) {
          data.cell.styles.halign = "left";
        } else if (data.column.index === 1) {
          data.cell.styles.halign = "center";
        } else if (data.column.index > 1) {
          data.cell.styles.halign = "right";
        }
      }

      if (data.section === "body" && data.row.index === filas.length - 1) {
        data.cell.styles.fillColor = colores.secundario;
        data.cell.styles.textColor = [0, 0, 0];
        data.cell.styles.fontStyle = "bold";
      }
    },
    didDrawPage: function (data) {
      agregarPaginaSeccion(doc, titulo, colores.primario, "nomina_timbrada");
    },
  });

  const opciones = {
    width: 600,
    height: 300,
    posX: 50,
    posY: 120,
    ancho: 200,
    alto: 90,
  };

  if (filas.length > 2) {
    await generarGrafica(doc, "line", opciones, 5, titulo, colores, filas);
  }
};

/**
 * Generar pagina para nomina general
 * @param {jsPDF} doc - Documento PDF
 * @param {Object} colores - Colores para la seccion
 * @param {string} titulo - Titulo para la seccion
 * @param {Object} contenido - Contenido de la seccion
 */
const agregarPaginaNominaGeneral = async (
  doc,
  colores,
  titulo,
  contenido,
  esMensual
) => {
  const header = [
    "Mes",
    "# Comprobantes",
    "Total Percepciones",
    "Total Deducciones",
    "Total Otros Pagos",
    "Total",
  ];

  let filas = [];

  let contadorComprobantes = 0;
  let contadorPercepciones = 0;
  let contadorDeducciones = 0;
  let contadorOtrosPagos = 0;
  let contadorTotal = 0;

  for (const dato of contenido) {
    const fila = [
      dato.mes || "N/A",
      dato.contador || 0,
      formatoNumerico(dato.totalPercepciones || 0),
      formatoNumerico(dato.totalDeducciones || 0),
      formatoNumerico(dato.totalOtrosPagos || 0),
      formatoNumerico(dato.total || 0),
    ];

    contadorComprobantes += dato.contador || 0;
    contadorPercepciones += dato.totalPercepciones || 0;
    contadorDeducciones += dato.totalDeducciones || 0;
    contadorOtrosPagos += dato.totalOtrosPagos || 0;
    contadorTotal += dato.total || 0;

    filas.push(fila);
  }

  // AGREGAMOS TOTALES
  filas.push([
    "Total",
    contadorComprobantes,
    formatoNumerico(contadorPercepciones),
    formatoNumerico(contadorDeducciones),
    formatoNumerico(contadorOtrosPagos),
    formatoNumerico(contadorTotal),
  ]);

  // CONDICION DE RENDERIZADO
  if (contadorComprobantes === 0) return;

  doc.addPage();

  doc.autoTable({
    head: [header],
    body: [...filas],
    startY: 10,
    startX: 10,
    margin: { left: 20, right: 10 },
    theme: "grid",
    headStyles: {
      fillColor: colores.primario,
      textColor: [255, 255, 255],
      fontSize: 12,
    },
    columnStyles: {
      1: { halign: "center" },
      2: { halign: "right" },
      3: { halign: "right" },
      4: { halign: "right" },
      5: { halign: "right" },
    },
    didParseCell: function (data) {
      if (data.section === "head") {
        if (data.column.index === 0) {
          data.cell.styles.halign = "left";
        } else if (data.column.index === 1) {
          data.cell.styles.halign = "center";
        } else if (data.column.index > 1) {
          data.cell.styles.halign = "right";
        }
      }

      if (data.section === "body" && data.row.index === filas.length - 1) {
        data.cell.styles.fillColor = colores.secundario;
        data.cell.styles.textColor = [0, 0, 0];
        data.cell.styles.fontStyle = "bold";
      }
    },
    didDrawPage: function (data) {
      agregarPaginaSeccion(doc, titulo, colores.primario, "nomina_pagada");
    },
  });

  const opciones = {
    width: 600,
    height: 300,
    posX: 50,
    posY: 120,
    ancho: 200,
    alto: 90,
  };

  if (filas.length > 2) {
    await generarGrafica(doc, "line", opciones, 5, titulo, colores, filas);
  }
};

/**
 * Generar pagina para nomina trabajadores
 * @param {jsPDF} doc - Documento PDF
 * @param {Object} colores - Colores para la seccion
 * @param {string} titulo - Titulo para la seccion
 * @param {Object} contenido - Contenido de la seccion
 */
const agregarPaginaTrabajadores = async (
  doc,
  colores,
  titulo,
  contenido,
  esMensual
) => {
  const header = [
    "Nombre",
    "RFC",
    "# Comprobantes",
    "Total",
    "Total Deducciones",
    "Total Otros Pagos",
    "Total Percepciones",
  ];

  let filasGrafica = [];

  for (let [nombreMes, arregloDatos] of Object.entries(contenido)) {
    let filas = [];
    let contadorTotal = 0;
    let contadorDeducciones = 0;
    let contadorOtrosPagos = 0;
    let contadorPercepciones = 0;
    let contadorComprobantes = 0;

    for (const dato of arregloDatos) {
      const comprobantes = dato.contador || 0;
      const deducciones = dato.totalDeducciones || 0;
      const otrosPagos = dato.totalOtrosPagos || 0;
      const percepciones = dato.totalPercepciones || 0;
      const total = dato.total || 0;

      const fila = [
        dato.nombre || "N/A",
        dato.rfc || "N/A",
        comprobantes,
        formatoNumerico(total),
        formatoNumerico(deducciones),
        formatoNumerico(otrosPagos),
        formatoNumerico(percepciones),
      ];

      contadorTotal += total;
      contadorDeducciones += deducciones;
      contadorOtrosPagos += otrosPagos;
      contadorPercepciones += percepciones;
      contadorComprobantes += comprobantes;

      filas.push(fila);
    }

    // AGREGAMOS TOTALES
    filas.push([
      "Total",
      "",
      contadorComprobantes,
      formatoNumerico(contadorTotal),
      formatoNumerico(contadorDeducciones),
      formatoNumerico(contadorOtrosPagos),
      formatoNumerico(contadorPercepciones),
    ]);

    filasGrafica.push([nombreMes, contadorTotal]);

    // CONDICION DE RENDERIZADO
    if (contadorComprobantes === 0) return;

    doc.addPage();

    doc.autoTable({
      head: [header],
      body: [...filas],
      startY: 10,
      startX: 10,
      margin: { left: 20, right: 10 },
      theme: "grid",
      headStyles: {
        fillColor: colores.primario,
        textColor: [255, 255, 255],
      },
      columnStyles: {
        1: { halign: "left" },
        2: { halign: "left" },
        3: { halign: "center" },
        4: { halign: "right" },
        5: { halign: "right" },
        6: { halign: "right" },
        7: { halign: "right" },
      },
      didParseCell: function (data) {
        if (data.section === "head") {
          if (data.column.index < 2) {
            data.cell.styles.halign = "left";
          } else if (data.column.index === 2) {
            data.cell.styles.halign = "center";
          } else {
            data.cell.styles.halign = "right";
          }
        }

        if (data.section === "body") {
          if (data.column.index < 2) {
            data.cell.styles.halign = "left";
          } else if (data.column.index === 2) {
            data.cell.styles.halign = "center";
          } else {
            data.cell.styles.halign = "right";
          }

          if (data.row.index === filas.length - 1) {
            data.cell.styles.fillColor = colores.secundario;
            data.cell.styles.textColor = [0, 0, 0];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
      didDrawPage: function (data) {
        agregarPaginaSeccion(
          doc,
          `${titulo} - ${nombreMes}`,
          colores.primario,
          "nomina_trabajadores"
        );
      },
    });
  }
};

/**
 * Generar pagina para nomina conceptos
 * @param {jsPDF} doc - Documento PDF
 * @param {Object} colores - Colores para la seccion
 * @param {string} titulo - Titulo para la seccion
 * @param {Object} contenido - Contenido de la seccion
 */
const agregarPaginaNominaConceptos = async (
  doc,
  colores,
  titulo,
  contenido,
  esMensual
) => {
  const header = ["Clave", "Clave SAT", "Concepto", "Importe"];

  let filasGrafica = [];
  let contadorGeneral = 0;

  for (let [nombreMes, arregloDatos] of Object.entries(contenido)) {
    let filas = [];
    let contadorImporte = 0;

    for (const dato of arregloDatos) {
      const importe = dato.importe || 0;

      const fila = [
        dato.clave || "N/A",
        dato.claveSat || "N/A",
        dato.concepto || "N/A",
        formatoNumerico(importe),
      ];

      contadorImporte += importe;

      filas.push(fila);
    }

    // AGREGAMOS TOTALES
    filas.push(["Total", "", "", formatoNumerico(contadorImporte)]);
    contadorGeneral += contadorImporte;

    filasGrafica.push([nombreMes, contadorImporte]);

    // CONDICION DE RENDERIZADO
    if (contadorImporte === 0) continue;

    doc.addPage();

    doc.autoTable({
      head: [header],
      body: [...filas],
      startY: 10,
      startX: 10,
      margin: { left: 20, right: 10 },
      theme: "grid",
      headStyles: {
        fillColor: colores.primario,
        textColor: [255, 255, 255],
        fontSize: 12,
      },
      columnStyles: {
        1: { halign: "left" },
        2: { halign: "left" },
        3: { halign: "left" },
        4: { halign: "right" },
      },
      didParseCell: function (data) {
        if (data.section === "head") {
          if (data.column.index <= 2) {
            data.cell.styles.halign = "left";
          } else {
            data.cell.styles.halign = "right";
          }
        }

        if (data.section === "body") {
          if (data.column.index <= 2) {
            data.cell.styles.halign = "left";
          } else {
            data.cell.styles.halign = "right";
          }

          if (data.row.index === filas.length - 1) {
            data.cell.styles.fillColor = colores.secundario;
            data.cell.styles.textColor = [0, 0, 0];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
      didDrawPage: function (data) {
        agregarPaginaSeccion(
          doc,
          `${titulo} - ${nombreMes}`,
          colores.primario,
          "nomina_conceptos"
        );
      },
    });
  }

  if (!contadorGeneral) return;
};

/**
 * Generar pagina para flujo
 * @param {jsPDF} doc - Documento PDF
 * @param {Object} colores - Colores para la seccion
 * @param {string} titulo - Titulo para la seccion
 * @param {Object} contenido - Contenido de la seccion
 */
const agregarPaginaFlujo = async (
  doc,
  colores,
  titulo,
  contenido,
  esMensual
) => {
  const monedaNacional = "MXN";

  const headerMonedaNacional = [
    "Forma Pago",
    "Importe",
    "Metodo Pago",
    "Tipo Comprobante",
    "Total",
  ];

  const headerMonedaInternacional = [
    "Forma Pago",
    "Importe",
    "Importe Pesos",
    "Metodo Pago",
    "Tipo Comprobante",
    "Total",
    "Total Pesos",
  ];

  const concentradoGeneral = [];

  for (let mes of contenido) {
    // OBTENEMOS LAS MONEDAS DEL MES

    // CREAMOS PAGINAS POR MONEDA Y MES
    for (let [nombreMoneda, arregloDatos] of Object.entries(mes)) {
      doc.addPage();

      const filas = [];
      let contadorImportes = 0;
      let contadorTotal = 0;
      let contadorTotalOtraMoneda = 0;
      let contadorImportesOtraMoneda = 0;
      // Objeto para agrupar los importes por forma de pago
      const totalPorFormaPago = {};

      // Aseguramos que existe la entrada para esta moneda en el concentrado general
      if (!concentradoGeneral[nombreMoneda]) {
        concentradoGeneral[nombreMoneda] = [];
      }

      for (const dato of arregloDatos) {
        let importePesos = dato.importePesos || 0;
        let total = dato.totalPesos || 0;
        let importeOtraMoneda = dato.importe || 0;
        let totalOtraMoneda = dato.total || 0;

        if (dato.tipoComprobante === "E") {
          importePesos *= -1;
          total *= -1;
          importeOtraMoneda *= -1;
          totalOtraMoneda *= -1;
        }

        // CHECAMOS SI ES MONEDA NACIONAL O NO
        let fila = [];

        if (nombreMoneda === monedaNacional) {
          fila = [
            dato.formaPago || "",
            formatoNumerico(importePesos),
            dato.metodoPago || "",
            dato.tipoComprobante || "",
            formatoNumerico(total),
          ];
        } else {
          fila = [
            dato.formaPago || "",
            formatoNumerico(dato.importe),
            formatoNumerico(importePesos),
            dato.metodoPago || "",
            dato.tipoComprobante || "",
            formatoNumerico(dato.total),
            formatoNumerico(total),
          ];
        }

        contadorImportes += importePesos;
        contadorTotal += total;
        contadorTotalOtraMoneda += totalOtraMoneda;
        contadorImportesOtraMoneda += importeOtraMoneda;

        filas.push(fila);

        // Agregar al importe por forma de pago
        const formaPago = dato.formaPago || "Sin forma de pago";
        if (!totalPorFormaPago[formaPago]) {
          totalPorFormaPago[formaPago] = 0;
        }
        totalPorFormaPago[formaPago] += total;

        // CREAMOS UN OBJETO CON LA FORMA DE PAGO

        // Agregar al concentrado general
        const formaPagoStr = dato.formaPago || "Sin forma de pago";
        const metodoPagoStr = dato.metodoPago || "Sin método de pago";

        // Buscar si ya existe un registro
        let encontrado = false;
        for (let i = 0; i < concentradoGeneral[nombreMoneda].length; i++) {
          if (
            concentradoGeneral[nombreMoneda][i].formaPago === formaPagoStr &&
            concentradoGeneral[nombreMoneda][i].metodoPago === metodoPagoStr
          ) {
            // Si existe, sumamos los valores
            concentradoGeneral[nombreMoneda][i].importePesos += importePesos;
            concentradoGeneral[nombreMoneda][i].totalPesos += total;

            if (nombreMoneda !== monedaNacional) {
              concentradoGeneral[nombreMoneda][i].importe += importeOtraMoneda;
              concentradoGeneral[nombreMoneda][i].total += totalOtraMoneda;
            }

            encontrado = true;
            break;
          }
        }

        // Si no existe, agregamos un nuevo registro
        if (!encontrado) {
          if (nombreMoneda === monedaNacional) {
            concentradoGeneral[nombreMoneda].push({
              formaPago: formaPagoStr,
              importePesos: importePesos,
              metodoPago: metodoPagoStr,
              totalPesos: total,
            });
          } else {
            concentradoGeneral[nombreMoneda].push({
              formaPago: formaPagoStr,
              importe: importeOtraMoneda,
              importePesos: importePesos,
              metodoPago: metodoPagoStr,
              total: totalOtraMoneda,
              totalPesos: total,
            });
          }
        }
      }

      // AGREGAMOS TOTALES DEPENDIENDO DE LA MONEDA
      let header;
      let columnStyles;

      if (nombreMoneda === monedaNacional) {
        filas.push([
          "Total",
          formatoNumerico(contadorImportes),
          "",
          "",
          formatoNumerico(contadorTotal),
        ]);
        header = headerMonedaNacional;
        columnStyles = {
          0: { halign: "left" }, // Primera columna alineada a la izquierda
          1: { halign: "right" }, // Columna de Importe alineada a la derecha
          2: { halign: "center" }, // Método de Pago alineado al centro
          4: { halign: "right" }, // Columna de Total alineada a la derecha
        };
      } else {
        filas.push([
          "Total",
          formatoNumerico(contadorImportesOtraMoneda),
          formatoNumerico(contadorImportes),
          "",
          "",
          formatoNumerico(contadorTotalOtraMoneda),
          formatoNumerico(contadorTotal),
        ]);
        header = headerMonedaInternacional;
        columnStyles = {
          0: { halign: "left" }, // Primera columna alineada a la izquierda
          1: { halign: "right" }, // Columna de Importe alineada a la derecha
          1: { halign: "right" }, // Columna de Importe Pesos alineada a la derecha
          2: { halign: "center" }, // Método de Pago alineado al centro
          4: { halign: "right" }, // Columna de Total alineada a la derecha
          4: { halign: "right" }, // Columna de Total Pesos alineada a la derecha
        };
      }
      doc.autoTable({
        head: [header],
        body: [...filas],
        startY: 10,
        startX: 10,
        margin: { left: 20, right: 10 },
        theme: "grid",
        headStyles: {
          fillColor: colores.primario,
          textColor: [255, 255, 255],
          fontSize: 12,
        },
        columnStyles: columnStyles,
        didParseCell: function (data) {
          if (nombreMoneda === monedaNacional) {
            if (data.section === "head") {
              if (data.column.index === 0) {
                data.cell.styles.halign = "left";
              } else if (data.column.index === 1 || data.column.index === 4) {
                data.cell.styles.halign = "right";
              } else {
                data.cell.styles.halign = "center";
              }
            }

            if (data.section === "body") {
              if (data.column.index === 0) {
                data.cell.styles.halign = "left";
              } else if (data.column.index === 1 || data.column.index === 4) {
                data.cell.styles.halign = "right"; // Columnas de importes alineadas a la derecha
              } else {
                data.cell.styles.halign = "center"; // Resto de columnas al centro
              }

              if (data.row.index === filas.length - 1) {
                data.cell.styles.fillColor = colores.secundario;
                data.cell.styles.textColor = [0, 0, 0];
                data.cell.styles.fontStyle = "bold";
              }
            }
          } else {
            if (data.section === "head") {
              if (data.column.index === 0) {
                data.cell.styles.halign = "left";
              } else if (data.column.index === 3 || data.column.index === 4) {
                data.cell.styles.halign = "center";
              } else {
                data.cell.styles.halign = "right";
              }
            }

            if (data.section === "body") {
              if (data.column.index === 0) {
                data.cell.styles.halign = "left";
              } else if (data.column.index === 3 || data.column.index === 4) {
                data.cell.styles.halign = "center"; // Columnas de importes alineadas a la derecha
              } else {
                data.cell.styles.halign = "right"; // Resto de columnas al centro
              }

              if (data.row.index === filas.length - 1) {
                data.cell.styles.fillColor = colores.secundario;
                data.cell.styles.textColor = [0, 0, 0];
                data.cell.styles.fontStyle = "bold";
              }
            }
          }
        },
        didDrawPage: function (data) {
          agregarPaginaSeccion(
            doc,
            `${titulo} - ${arregloDatos[0].mes} (${nombreMoneda})`,
            colores.primario,
            "flujo_cobrado"
          );
        },
      });

      // FILTRAMOS POR FORMA DE PAGO
      const formasPago = Object.keys(totalPorFormaPago);
      const totalesFormasPago = Object.values(totalPorFormaPago);

      if (formasPago.length > 1) {
        // GENERAR COLORES PARA LA GRAFICA
        const degradado = generarDegradadoHex(
          rgbToHex(colores.primario),
          rgbToHex(colores.secundario),
          formasPago.length
        );

        // DATOS DE LA GRAFICA
        const datosPorFormaPago = {
          labels: formasPago,
          datasets: [
            {
              data: totalesFormasPago,
              backgroundColor: degradado,
              hoverOffset: 4,
            },
          ],
        };

        let imgDataFormaPago = await generarGraficaPastel(
          datosPorFormaPago,
          "Total por Forma de Pago"
        );
        doc.addImage(imgDataFormaPago, "PNG", 60, 120, 170, 80);

        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text("* Solo se muestran los valores mayores al 5%", 225, 205);
      }
    }
  }

  if (esMensual === false) {
    // CREAMOS TABLA CON EL CONCENTRADO GENERAL
    const headerConcentradoNacional = [
      "Forma Pago",
      "Importe",
      "Metodo Pago",
      "Total",
    ];
    const headerConcentradoInternacional = [
      "Forma Pago",
      "Importe",
      "Importe Pesos",
      "Metodo Pago",
      "Total",
      "Total Pesos",
    ];

    for (let [nombreMoneda, arregloDatos] of Object.entries(
      concentradoGeneral
    )) {
      doc.addPage();

      const filas = [];
      let contadorImportesNacional = 0;
      let contadorTotalNacional = 0;
      let contadorImporteInternacional = 0;
      let contadorTotalInternacional = 0;

      const totalPorFormaPago = {};

      for (const dato of arregloDatos) {
        let fila = [];

        if (nombreMoneda === monedaNacional) {
          fila = [
            dato.formaPago || "",
            formatoNumerico(dato.importePesos),
            dato.metodoPago || "",
            formatoNumerico(dato.totalPesos),
          ];
        } else {
          fila = [
            dato.formaPago || "",
            formatoNumerico(dato.importe),
            formatoNumerico(dato.importePesos),
            dato.metodoPago || "",
            formatoNumerico(dato.total),
            formatoNumerico(dato.totalPesos),
          ];
        }

        contadorImportesNacional += dato.importePesos;
        contadorTotalNacional += dato.totalPesos;
        contadorImporteInternacional += dato.importe;
        contadorTotalInternacional += dato.total;

        filas.push(fila);

        // Agregar al importe por forma de pago
        const formaPago = dato.formaPago || "Sin forma de pago";
        if (!totalPorFormaPago[formaPago]) {
          totalPorFormaPago[formaPago] = 0;
        }
        totalPorFormaPago[formaPago] += dato.totalPesos;
      }

      // AGREGAMOS TOTALES DEPENDIENDO DE LA MONEA

      let headerConcentrado;
      let columnStyles;

      if (nombreMoneda === monedaNacional) {
        filas.push([
          "Total",
          formatoNumerico(contadorImportesNacional),
          "",
          formatoNumerico(contadorTotalNacional),
        ]);
        headerConcentrado = headerConcentradoNacional;
        columnStyles = {
          0: { halign: "left" }, // Primera columna alineada a la izquierda
          1: { halign: "right" }, // Columna de Importe alineada a la derecha
          2: { halign: "center" }, // Método de Pago alineado al centro
          4: { halign: "right" }, // Columna de Total alineada a la derecha
        };
      } else {
        filas.push([
          "Total",
          formatoNumerico(contadorImportesNacional),
          formatoNumerico(contadorImporteInternacional),
          "",
          formatoNumerico(contadorTotalInternacional),
          formatoNumerico(contadorTotalNacional),
        ]);
        headerConcentrado = headerConcentradoInternacional;
        columnStyles = {
          0: { halign: "left" }, // Primera columna alineada a la izquierda
          1: { halign: "right" }, // Columna de Importe alineada a la derecha
          1: { halign: "right" }, // Columna de Importe Pesos alineada a la derecha
          2: { halign: "center" }, // Método de Pago alineado al centro
          4: { halign: "right" }, // Columna de Total alineada a la derecha
          4: { halign: "right" }, // Columna de Total Pesos alineada a la derecha
        };
      }

      // CREAMOS LA TABLA
      doc.autoTable({
        head: [headerConcentrado],
        body: [...filas],
        startY: 10,
        startX: 10,
        margin: { left: 20, right: 10 },
        theme: "grid",
        headStyles: {
          fillColor: colores.primario,
          textColor: [255, 255, 255],
          fontSize: 12,
        },
        columnStyles: columnStyles,
        didParseCell: function (data) {
          if (nombreMoneda === monedaNacional) {
            if (data.section === "head") {
              if (data.column.index === 0) {
                data.cell.styles.halign = "left";
              } else if (data.column.index === 1 || data.column.index === 3) {
                data.cell.styles.halign = "right";
              } else {
                data.cell.styles.halign = "center";
              }
            }

            if (data.section === "body") {
              if (data.column.index === 0) {
                data.cell.styles.halign = "left";
              } else if (data.column.index === 1 || data.column.index === 3) {
                data.cell.styles.halign = "right"; // Columnas de importes alineadas a la derecha
              } else {
                data.cell.styles.halign = "center"; // Resto de columnas al centro
              }

              if (data.row.index === filas.length - 1) {
                data.cell.styles.fillColor = colores.secundario;
                data.cell.styles.textColor = [0, 0, 0];
                data.cell.styles.fontStyle = "bold";
              }
            }
          } else {
            if (data.section === "head") {
              if (data.column.index === 0) {
                data.cell.styles.halign = "left";
              } else if (data.column.index === 3) {
                data.cell.styles.halign = "center";
              } else {
                data.cell.styles.halign = "right";
              }
            }

            if (data.section === "body") {
              if (data.column.index === 0) {
                data.cell.styles.halign = "left";
              } else if (data.column.index === 3) {
                data.cell.styles.halign = "center"; // Columnas de importes alineadas a la derecha
              } else {
                data.cell.styles.halign = "right"; // Resto de columnas al centro
              }

              if (data.row.index === filas.length - 1) {
                data.cell.styles.fillColor = colores.secundario;
                data.cell.styles.textColor = [0, 0, 0];
                data.cell.styles.fontStyle = "bold";
              }
            }
          }
        },
        didDrawPage: function (data) {
          agregarPaginaSeccion(
            doc,
            `${titulo} - CONCENTRADO (${nombreMoneda})`,
            colores.primario,
            "flujo_pagado"
          );
        },
      });

      // CREAMOS LA GRAFICA DE PASTEL

      const formasPago = Object.keys(totalPorFormaPago);
      const totalesFormasPago = Object.values(totalPorFormaPago);

      if (formasPago.length > 1) {
        // GENERAR COLORES PARA LA GRAFICA
        const degradado = generarDegradadoHex(
          rgbToHex(colores.primario),
          rgbToHex(colores.secundario),
          formasPago.length
        );

        // DATOS DE LA GRAFICA
        const datosPorFormaPago = {
          labels: formasPago,
          datasets: [
            {
              data: totalesFormasPago,
              backgroundColor: degradado,
              hoverOffset: 4,
            },
          ],
        };

        let imgDataFormaPago = await generarGraficaPastel(
          datosPorFormaPago,
          "Total por Forma de Pago"
        );
        doc.addImage(imgDataFormaPago, "PNG", 60, 120, 170, 80);

        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text("* Solo se muestran los valores mayores al 5%", 225, 205);
      }
    }
  }
};

/**
 * Generar pagina para metodos de pago
 * @param {jsPDF} doc - Documento PDF
 * @param {Object} colores - Colores para la seccion
 * @param {string} titulo - Titulo para la seccion
 * @param {Object} contenido - Contenido de la seccion
 */
const agregarPaginaMetodosPagos = async (
  doc,
  colores,
  titulo,
  contenido,
  esMensual
) => {
  const header = ["Mes", "Importe PUE", "Importe PPD"];

  const datosGraficaMensual = {};
  let filas = [];

  let contadorImportePue = 0;
  let contadorImportePpd = 0;

  for (let dato of contenido) {
    // CONCENTRADO MENSUAL
    const importePue = dato.importePue || 0;
    const importePpd = dato.importePpd || 0;

    const fila = [
      dato.mes || "N/A",
      formatoNumerico(importePue),
      formatoNumerico(importePpd),
    ];

    contadorImportePue += importePue;
    contadorImportePpd += importePpd;

    filas.push(fila);
  }

  // AGREGAMOS TOTALES
  filas.push([
    "Total",
    formatoNumerico(contadorImportePue),
    formatoNumerico(contadorImportePpd),
  ]);

  // CONDICION DE RENDERIZADO
  if (contadorImportePue === 0 && contadorImportePpd === 0) return;

  doc.addPage();

  doc.autoTable({
    head: [header],
    body: [...filas],
    startY: 10,
    startX: 10,
    margin: { left: 20, right: 10 },
    theme: "grid",
    headStyles: {
      fillColor: colores.primario,
      textColor: [255, 255, 255],
      fontSize: 9,
    },
    styles: {
      overflow: "linebreak",
    },
    columnStyles: {
      1: { halign: "left" },
      2: { halign: "left" },
      3: { halign: "left" },
      4: { halign: "right" },
      5: { halign: "right" },
    },
    didParseCell: function (data) {
      if (data.section === "head" || data.section === "body") {
        if (data.column.index > 0) {
          data.cell.styles.halign = "right";
        } else {
          data.cell.styles.halign = "left";
        }
      }

      if (data.section === "body" && data.row.index === filas.length - 1) {
        data.cell.styles.fillColor = colores.secundario;
        data.cell.styles.textColor = [0, 0, 0];
        data.cell.styles.fontStyle = "bold";
      }
    },
    didDrawPage: function (data) {
      agregarPaginaSeccion(
        doc,
        `${titulo}`,
        colores.primario,
        "metodos_pago_emitidos"
      );
    },
  });
};

/**
 * Generar pagina para reporte uso de CFDI
 * @param {jsPDF} doc - Documento PDF
 * @param {Object} colores - Colores para la seccion
 * @param {string} titulo - Titulo para la seccion
 * @param {Object} contenido - Contenido de la seccion
 */
const agregarPaginaUsoCFDI = async (
  doc,
  colores,
  titulo,
  contenido,
  esMensual
) => {
  const header = [
    "CFDI",
    "# Emitidos",
    "Importe Emitido",
    "# Recibidos",
    "Importe Recibido",
  ];

  let concentradoGeneral = {};

  for (let [nombreMes, arregloDatos] of Object.entries(contenido)) {
    let filas = [];
    let contadorImporteEmitido = 0;
    let contadorImporteRecibido = 0;
    let contadorEmitidos = 0;
    let contadorRecibidos = 0;

    for (const dato of arregloDatos) {
      const importeEmitido = dato.importeEmitido || 0;
      const importeRecibido = dato.importeRecibido || 0;
      const comprobantesEmitidos = dato.contadorEmitidos || 0;
      const comprobantesRecibidos = dato.contadorRecibidos || 0;

      const fila = [
        dato.usoCfdi || "N/A",
        comprobantesEmitidos,
        formatoNumerico(importeEmitido),
        comprobantesRecibidos,
        formatoNumerico(importeRecibido),
      ];

      contadorImporteEmitido += importeEmitido;
      contadorImporteRecibido += importeRecibido;
      contadorEmitidos += comprobantesEmitidos;
      contadorRecibidos += comprobantesRecibidos;

      filas.push(fila);

      if (!concentradoGeneral[dato.usoCfdi]) {
        concentradoGeneral[dato.usoCfdi] = {
          emitidos: 0,
          importeEmitido: 0,
          recibidos: 0,
          importeRecibido: 0,
        };
      }

      concentradoGeneral[dato.usoCfdi].emitidos += comprobantesEmitidos;
      concentradoGeneral[dato.usoCfdi].importeEmitido += importeEmitido;
      concentradoGeneral[dato.usoCfdi].recibidos += comprobantesRecibidos;
      concentradoGeneral[dato.usoCfdi].importeRecibido += importeRecibido;
    }

    // AGREGAMOS TOTALES
    filas.push([
      "Total",
      contadorEmitidos,
      formatoNumerico(contadorImporteEmitido),
      contadorRecibidos,
      formatoNumerico(contadorImporteRecibido),
    ]);

    // CONDICION DE RENDERIZADO
    if (contadorEmitidos === 0 && contadorRecibidos === 0) continue;

    // await agregaSubPortada(doc, 0);

    doc.addPage();

    doc.autoTable({
      head: [header],
      body: [...filas],
      startY: 10,
      startX: 10,
      margin: { left: 20, right: 10 },
      theme: "grid",
      headStyles: {
        fillColor: colores.primario,
        textColor: [255, 255, 255],
        fontSize: 12,
      },
      columnStyles: {
        1: { halign: "left" },
        2: { halign: "left" },
        3: { halign: "left" },
        4: { halign: "right" },
        5: { halign: "right" },
      },
      didParseCell: function (data) {
        if (data.section === "head") {
          if (data.column.index === 0) {
            data.cell.styles.halign = "left";
          } else if (data.column.index === 1 || data.column.index === 3) {
            data.cell.styles.halign = "center";
          } else {
            data.cell.styles.halign = "right";
          }
        }

        if (data.section === "body") {
          if (data.column.index === 0) {
            data.cell.styles.halign = "left";
          } else if (data.column.index === 1 || data.column.index === 3) {
            data.cell.styles.halign = "center";
          } else {
            data.cell.styles.halign = "right";
          }

          if (data.row.index === filas.length - 1) {
            data.cell.styles.fillColor = colores.secundario;
            data.cell.styles.textColor = [0, 0, 0];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
      didDrawPage: function (data) {
        agregarPaginaSeccion(
          doc,
          `${titulo} - ${nombreMes}`,
          colores.primario,
          "uso_cfdi"
        );
      },
    });

    // Verificamos que haya datos para generar la grafica Emitidos
    if (arregloDatos.length > 1) {
      const listaCfdi = arregloDatos.map((dato) => dato.usoCfdi || "N/A");
      const listaComprobantesTotales = arregloDatos.map(
        (dato) => dato.contadorEmitidos || 0
      );

      // Solo generamos la grafica si hay comprobantes
      if (listaComprobantesTotales.some((valor) => valor > 0)) {
        const degradado = generarDegradadoHex(
          rgbToHex(colores.primario),
          rgbToHex(colores.secundario),
          listaCfdi.length
        );

        const datos = {
          labels: listaCfdi,
          datasets: [
            {
              data: listaComprobantesTotales,
              backgroundColor: degradado,
              hoverOffset: 4,
            },
          ],
        };

        let imgData = await generarGraficaPastel(datos);
        doc.addImage(imgData, "PNG", 20, 140, 135, 60);

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text("Total de Comprobantes por Uso de CFDI Emitidos", 80, 135, {
          align: "center",
        });

        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text("* Solo se muestran los valores mayores al 5%", 225, 205);
      }
    }

    // Verificamos que haya datos para generar la grafica Recibidos
    if (arregloDatos.length > 1) {
      const listaCfdi = arregloDatos.map((dato) => dato.usoCfdi || "N/A");
      const listaComprobantesTotales = arregloDatos.map(
        (dato) => dato.contadorRecibidos || 0
      );

      // Solo generamos la gráfica si hay comprobantes
      if (listaComprobantesTotales.some((valor) => valor > 0)) {
        const degradado = generarDegradadoHex(
          rgbToHex(colores.secundario),
          rgbToHex(colores.primario),
          listaCfdi.length
        );

        const datos = {
          labels: listaCfdi,
          datasets: [
            {
              data: listaComprobantesTotales,
              backgroundColor: degradado,
              hoverOffset: 4,
            },
          ],
        };

        let imgData = await generarGraficaPastel(datos);
        doc.addImage(imgData, "PNG", 160, 140, 135, 60);

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text("Total de Comprobantes por Uso de CFDI Recibidos", 230, 135, {
          align: "center",
        });

        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text("* Solo se muestran los valores mayores al 5%", 225, 205);
      }
    }
  }

  if (esMensual === false) {
    // AGREGAMOS EL CONCENTRADO GENERAL
    let filasConcentrado = [];
    let contadorImporteEmitido = 0;
    let contadorImporteRecibido = 0;
    let contadorEmitidos = 0;
    let contadorRecibidos = 0;

    for (let [nombreCfdi, objetoDatos] of Object.entries(concentradoGeneral)) {
      const fila = [
        nombreCfdi,
        objetoDatos.emitidos,
        formatoNumerico(objetoDatos.importeEmitido),
        objetoDatos.recibidos,
        formatoNumerico(objetoDatos.importeRecibido),
      ];

      contadorImporteEmitido += objetoDatos.importeEmitido;
      contadorImporteRecibido += objetoDatos.importeRecibido;
      contadorEmitidos += objetoDatos.emitidos;
      contadorRecibidos += objetoDatos.recibidos;

      filasConcentrado.push(fila);
    }

    filasConcentrado.push([
      "Total",
      contadorEmitidos,
      formatoNumerico(contadorImporteEmitido),
      contadorRecibidos,
      formatoNumerico(contadorImporteRecibido),
    ]);

    // CONDICION DE RENDERIZADO
    if (contadorEmitidos === 0 && contadorRecibidos === 0) return;

    doc.addPage();

    doc.autoTable({
      head: [header],
      body: [...filasConcentrado],
      startY: 10,
      startX: 10,
      margin: { left: 20, right: 10 },
      theme: "grid",
      headStyles: {
        fillColor: colores.primario,
        textColor: [255, 255, 255],
        fontSize: 12,
      },
      columnStyles: {
        1: { halign: "left" },
        2: { halign: "left" },
        3: { halign: "left" },
        4: { halign: "right" },
        5: { halign: "right" },
      },
      didParseCell: function (data) {
        if (data.section === "head") {
          if (data.column.index === 0) {
            data.cell.styles.halign = "left";
          } else if (data.column.index === 1 || data.column.index === 3) {
            data.cell.styles.halign = "center";
          } else {
            data.cell.styles.halign = "right";
          }
        }

        if (data.section === "body") {
          if (data.column.index === 0) {
            data.cell.styles.halign = "left";
          } else if (data.column.index === 1 || data.column.index === 3) {
            data.cell.styles.halign = "center";
          } else {
            data.cell.styles.halign = "right";
          }

          if (data.row.index === filasConcentrado.length - 1) {
            data.cell.styles.fillColor = colores.secundario;
            data.cell.styles.textColor = [0, 0, 0];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
      didDrawPage: function (data) {
        agregarPaginaSeccion(
          doc,
          `${titulo} - CONCENTRADO`,
          colores.primario,
          "uso_cfdi"
        );
      },
    });

    // Verificamos que haya datos para generar la grafica Emitidos
    if (filasConcentrado.length > 1) {
      const datosSinTotal = filasConcentrado.slice(
        0,
        filasConcentrado.length - 1
      );

      const listaCfdi = datosSinTotal.map((fila) => fila[0]); // Primera columna (CFDI)
      const listaComprobantesTotales = datosSinTotal.map((fila) => fila[1]); // Segunda columna (# Emitidos)

      // Solo generamos la grafica si hay comprobantes
      if (listaComprobantesTotales.some((valor) => valor > 0)) {
        const degradado = generarDegradadoHex(
          rgbToHex(colores.primario),
          rgbToHex(colores.secundario),
          listaCfdi.length
        );

        const datos = {
          labels: listaCfdi,
          datasets: [
            {
              data: listaComprobantesTotales,
              backgroundColor: degradado,
              hoverOffset: 4,
            },
          ],
        };

        let imgData = await generarGraficaPastel(datos);
        doc.addImage(imgData, "PNG", 20, 140, 135, 60);

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text("Total de Comprobantes por Uso de CFDI Emitidos", 80, 135, {
          align: "center",
        });

        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text("* Solo se muestran los valores mayores al 5%", 225, 205);
      }
    }

    // Verificamos que haya datos para generar la grafica Recibidos
    if (filasConcentrado.length > 1) {
      const datosSinTotal = filasConcentrado.slice(
        0,
        filasConcentrado.length - 1
      );

      // Extraemos correctamente los datos del array
      const listaCfdi = datosSinTotal.map((fila) => fila[0]); // Primera columna (CFDI)
      const listaComprobantesTotales = datosSinTotal.map((fila) => fila[3]); // Cuarta columna (# Recibidos)

      if (listaComprobantesTotales.some((valor) => valor > 0)) {
        const degradado = generarDegradadoHex(
          rgbToHex(colores.secundario),
          rgbToHex(colores.primario),
          listaCfdi.length
        );

        const datos = {
          labels: listaCfdi,
          datasets: [
            {
              data: listaComprobantesTotales,
              backgroundColor: degradado,
              hoverOffset: 4,
            },
          ],
        };

        let imgData = await generarGraficaPastel(datos);
        doc.addImage(imgData, "PNG", 160, 140, 135, 60);

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text("Total de Comprobantes por Uso de CFDI Recibidos", 230, 135, {
          align: "center",
        });

        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text("* Solo se muestran los valores mayores al 5%", 225, 205);
      }
    }
  }
};

/**
 * Generar pagina para reporte uso de CFDI
 * @param {jsPDF} doc - Documento PDF
 * @param {Object} colores - Colores para la seccion
 * @param {string} titulo - Titulo para la seccion
 * @param {Object} contenido - Contenido de la seccion
 */
const agregarPaginaPue = async (doc, colores, titulo, contenido, esMensual) => {
  const header = [
    "Folio",
    "Folio Fiscal",
    "RFC",
    "Nombre",
    "Tipo Comprobante",
    "SubTotal",
    "Total Impuesto Transladados",
    "Total Impuesto Retenidos",
    "Total",
  ];

  let concentradoGeneral = {};

  for (let [nombreMes, arregloDatos] of Object.entries(contenido)) {
    let filas = [];
    let contadorSubTotal = 0;
    let contadorTotalImpuestosTransladados = 0;
    let contadorTotalImpuestosRetenidos = 0;
    let contadorTotal = 0;

    const datosGraficaMensual = {};

    for (const dato of arregloDatos) {
      // CONCENTRADO MENSUAL

      const subTotal = dato.subTotal || 0;
      const total = dato.total || 0;
      const totalImpuestosTransladados = dato.totalImpuestosTrasladados || 0;
      const totalImpuestosRetenidos = dato.totalImpuestosRetenidos || 0;

      const fila = [
        dato.folio || "N/A",
        dato.folioFiscal || "N/A",
        dato.rfc || "N/A",
        dato.nombre || "N/A",
        dato.tipoComprobante || "N/A",
        formatoNumerico(subTotal),
        formatoNumerico(totalImpuestosTransladados),
        formatoNumerico(totalImpuestosRetenidos),
        formatoNumerico(total),
      ];

      contadorSubTotal += subTotal;
      contadorTotalImpuestosTransladados += totalImpuestosTransladados;
      contadorTotalImpuestosRetenidos += totalImpuestosRetenidos;
      contadorTotal += total;

      filas.push(fila);

      // DATOS PARA CONCENTRADO MENSUAL
      if (!datosGraficaMensual[dato.rfc]) {
        datosGraficaMensual[dato.rfc] = {
          rfc: dato.rfc,
          total: 0,
        };
      }

      datosGraficaMensual[dato.rfc].total += total;

      // DATOS PARA CONCENTRADO GENERAL

      if (!concentradoGeneral[dato.rfc]) {
        concentradoGeneral[dato.rfc] = {
          nombre: "N/A",
          subTotal: 0,
          totalImpuestosTransladados: 0,
          totalImpuestosRetenidos: 0,
          total: 0,
        };
      }

      concentradoGeneral[dato.rfc].nombre = dato.nombre;
      concentradoGeneral[dato.rfc].subTotal += subTotal;
      concentradoGeneral[dato.rfc].totalImpuestosTransladados +=
        totalImpuestosTransladados;
      concentradoGeneral[dato.rfc].totalImpuestosRetenidos +=
        totalImpuestosRetenidos;
      concentradoGeneral[dato.rfc].total += total;
    }

    // AGREGAMOS TOTALES
    filas.push([
      "Total",
      "",
      "",
      "",
      "",
      formatoNumerico(contadorSubTotal),
      formatoNumerico(contadorTotalImpuestosTransladados),
      formatoNumerico(contadorTotalImpuestosRetenidos),
      formatoNumerico(contadorTotal),
    ]);

    // CONDICION DE RENDERIZADO
    if (contadorTotal === 0) continue;

    doc.addPage();

    doc.autoTable({
      head: [header],
      body: [...filas],
      bodyStyles: {
        fontSize: 8,
      },
      startY: 10,
      startX: 10,
      margin: { left: 20, right: 10 },
      theme: "grid",
      headStyles: {
        fillColor: colores.primario,
        textColor: [255, 255, 255],
        fontSize: 8,
      },
      // styles: {
      //   overflow: "linebreak", // Asegura que el contenido se ajuste
      //   cellPadding: 1,
      // },
      columnStyles: {
        0: { cellWidth: 20 }, // Folio
        1: { cellWidth: 30 }, // Folio Fiscal
        2: { cellWidth: 30 }, // RFC
        3: { cellWidth: 40 }, // Nombre
        4: { cellWidth: 20 }, // Tipo Comprobante
        5: { cellWidth: 30 }, // SubTotal
        6: { cellWidth: 30 }, // Total Impuesto Transladados
        7: { cellWidth: 30 }, // Total Impuesto Retenidos
        8: { cellWidth: 30 }, // Total
      },
      didParseCell: function (data) {
        if (data.section === "head" || data.section === "body") {
          if (data.column.index <= 4) {
            data.cell.styles.halign = "left";
          } else if (data.column.index === 5) {
            data.cell.styles.halign = "center";
          } else {
            data.cell.styles.halign = "right";
          }
        }

        if (data.section === "body" && data.row.index === filas.length - 1) {
          data.cell.styles.fillColor = colores.secundario;
          data.cell.styles.textColor = [0, 0, 0];
          data.cell.styles.fontStyle = "bold";
        }
      },
      didDrawPage: function (data) {
        agregarPaginaSeccion(
          doc,
          `${titulo} - ${nombreMes}`,
          colores.primario,
          "pue_99_emitidos"
        );
      },
    });

    // Generar la grafica agrupada por RFC
    if (Object.keys(datosGraficaMensual).length > 1) {
      const listaRfc = Object.keys(datosGraficaMensual);
      const listaComprobantesTotales = listaRfc.map(
        (rfc) => datosGraficaMensual[rfc].total
      );

      // Solo generamos la grafica si hay comprobantes
      if (listaComprobantesTotales.some((valor) => valor > 0)) {
        const degradado = generarDegradadoHex(
          rgbToHex(colores.primario),
          rgbToHex(colores.secundario),
          listaRfc.length
        );

        const datos = {
          labels: listaRfc,
          datasets: [
            {
              data: listaComprobantesTotales,
              backgroundColor: degradado,
              hoverOffset: 4,
            },
          ],
        };

        doc.addPage();

        let imgData = await generarGraficaPastel(datos);
        doc.addImage(imgData, "PNG", 0, 40, 290, 130);

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text(`Distribución por RFC - ${nombreMes}`, 150, 20, {
          align: "center",
        });

        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text("* Solo se muestran los valores mayores al 5%", 225, 205);
      }
    }
  }

  if (esMensual === false) {
    // AGREGAMOS EL CONCENTRADO GENERAL
    let filasConcentrado = [];
    let contadorSubTotal = 0;
    let contadorTotalImpuestosTransladados = 0;
    let contadorTotalImpuestosRetenidos = 0;
    let contadorTotal = 0;

    for (let [rfc, datos] of Object.entries(concentradoGeneral)) {
      const fila = [
        rfc,
        datos.nombre,
        formatoNumerico(datos.subTotal),
        formatoNumerico(datos.totalImpuestosTransladados),
        formatoNumerico(datos.totalImpuestosRetenidos),
        formatoNumerico(datos.total),
      ];

      contadorSubTotal += datos.subTotal;
      contadorTotalImpuestosTransladados += datos.totalImpuestosTransladados;
      contadorTotalImpuestosRetenidos += datos.totalImpuestosRetenidos;
      contadorTotal += datos.total;

      filasConcentrado.push(fila);
    }

    filasConcentrado.push([
      "Total",
      "",
      formatoNumerico(contadorSubTotal),
      formatoNumerico(contadorTotalImpuestosTransladados),
      formatoNumerico(contadorTotalImpuestosRetenidos),
      formatoNumerico(contadorTotal),
    ]);

    // CONDICION DE RENDERIZADO
    if (contadorTotal === 0) return;

    doc.addPage();

    const headerConcentrado = [
      "RFC",
      "Nombre",
      "SubTotal",
      "Total Impuesto Transladados",
      "Total Impuesto Retenidos",
      "Total",
    ];

    doc.autoTable({
      head: [headerConcentrado],
      body: [...filasConcentrado],
      bodyStyles: {
        fontSize: 10,
      },
      startY: 10,
      startX: 10,
      margin: { left: 20, right: 10 },
      theme: "grid",
      headStyles: {
        fillColor: colores.primario,
        textColor: [255, 255, 255],
        fontSize: 10,
      },
      columnStyles: {
        0: { halign: "left" }, // Serie
        1: { halign: "left" }, // Folio
        2: { halign: "left" }, // Folio Fiscal
        3: { halign: "left" }, // RFC
        4: { halign: "left" }, // Nombre
        5: { halign: "center" }, // Tipo Comprobante
        6: { halign: "right" }, // SubTotal
        7: { halign: "right" }, // Total Impuesto Transladados
        8: { halign: "right" }, // Total Impuesto Retenidos
        9: { halign: "right" }, // Total
      },
      didParseCell: function (data) {
        if (data.section === "head" || data.section === "body") {
          if (data.column.index <= 1) {
            data.cell.styles.halign = "left";
          } else {
            data.cell.styles.halign = "right";
          }
        }

        if (
          data.section === "body" &&
          data.row.index === filasConcentrado.length - 1
        ) {
          data.cell.styles.fillColor = colores.secundario;
          data.cell.styles.textColor = [0, 0, 0];
          data.cell.styles.fontStyle = "bold";
        }
      },
      didDrawPage: function (data) {
        agregarPaginaSeccion(
          doc,
          `${titulo} - CONCENTRADO`,
          colores.primario,
          "pue_99_emitidos"
        );
      },
    });

    // Verificamos que haya datos para generar la grafica del concentrado
    if (filasConcentrado.length > 1) {
      // Más de 1 porque incluye la fila de total
      const datosSinTotal = filasConcentrado.slice(
        0,
        filasConcentrado.length - 1
      );

      const listaRfc = datosSinTotal.map((fila) => fila[0]); // Primera columna (RFC)
      const listaTotales = datosSinTotal.map((fila) => {
        // Convertir de string formateado a número
        const totalStr = fila[5];
        return parseFloat(totalStr.replace(/[^\d.-]/g, "")) || 0;
      });

      // Solo generamos la grafica si hay valores mayores a cero
      if (listaTotales.some((valor) => valor > 0)) {
        const degradado = generarDegradadoHex(
          rgbToHex(colores.primario),
          rgbToHex(colores.secundario),
          listaRfc.length
        );

        const datos = {
          labels: listaRfc,
          datasets: [
            {
              data: listaTotales,
              backgroundColor: degradado,
              hoverOffset: 4,
            },
          ],
        };

        doc.addPage();

        let imgData = await generarGraficaPastel(datos);
        doc.addImage(imgData, "PNG", 0, 40, 300, 140);

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text("Distribución de Totales por RFC", 150, 20, {
          align: "center",
        });

        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text("* Solo se muestran los valores mayores al 5%", 225, 205);
      }
    }
  }
};

/**
 * Generar pagina para reporte uso de CFDI
 * @param {jsPDF} doc - Documento PDF
 * @param {Object} colores - Colores para la seccion
 * @param {string} titulo - Titulo para la seccion
 * @param {Object} contenido - Contenido de la seccion
 */
const agregarPaginaRSinImpuestos = async (
  doc,
  colores,
  titulo,
  contenido,
  esMensual
) => {
  const header = [
    "Folio",
    "Folio Fiscal",
    "RFC",
    "Fecha",
    "Nombre",
    "Clave Producto o Servicio",
    "Concepto",
    "Tipo Comprobante",
    "SubTotal",
    "Total Impuesto Transladados",
    "Total Impuesto Retenidos",
    "Total",
  ];

  let concentradoGeneral = {};

  for (let [nombreMes, arregloDatos] of Object.entries(contenido)) {
    let filas = [];
    let contadorSubTotal = 0;
    let contadorTotalImpuestosTransladados = 0;
    let contadorTotalImpuestosRetenidos = 0;
    let contadorTotal = 0;

    const datosGraficaMensual = {};

    for (const dato of arregloDatos) {
      // CONCENTRADO MENSUAL

      const subTotal = dato.subTotal || 0;
      const total = dato.total || 0;
      const totalImpuestosTransladados = dato.totalImpuestosTrasladados || 0;
      const totalImpuestosRetenidos = dato.totalImpuestosRetenidos || 0;
      const fecha = dato.fecha ? formatoFechaSinHora(dato.fecha) : "N/A";

      const fila = [
        dato.folio || "N/A",
        dato.folioFiscal || "N/A",
        dato.rfc || "N/A",
        fecha,
        dato.nombre || "N/A",
        dato.claveProdServ || "N/A",
        dato.concepto || "N/A",
        dato.tipoComprobante || "N/A",
        formatoNumerico(subTotal),
        formatoNumerico(totalImpuestosTransladados),
        formatoNumerico(totalImpuestosRetenidos),
        formatoNumerico(total),
      ];

      contadorSubTotal += subTotal;
      contadorTotalImpuestosTransladados += totalImpuestosTransladados;
      contadorTotalImpuestosRetenidos += totalImpuestosRetenidos;
      contadorTotal += total;

      filas.push(fila);

      // DATOS PARA CONCENTRADO MENSUAL
      if (!datosGraficaMensual[dato.rfc]) {
        datosGraficaMensual[dato.rfc] = {
          rfc: dato.rfc,
          total: 0,
        };
      }

      datosGraficaMensual[dato.rfc].total += total;

      // DATOS PARA CONCENTRADO GENERAL

      if (!concentradoGeneral[dato.rfc]) {
        concentradoGeneral[dato.rfc] = {
          nombre: "N/A",
          subTotal: 0,
          totalImpuestosTransladados: 0,
          totalImpuestosRetenidos: 0,
          total: 0,
        };
      }

      concentradoGeneral[dato.rfc].nombre = dato.nombre;
      concentradoGeneral[dato.rfc].subTotal += subTotal;
      concentradoGeneral[dato.rfc].totalImpuestosTransladados +=
        totalImpuestosTransladados;
      concentradoGeneral[dato.rfc].totalImpuestosRetenidos +=
        totalImpuestosRetenidos;
      concentradoGeneral[dato.rfc].total += total;
    }

    // AGREGAMOS TOTALES
    filas.push([
      "Total",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      formatoNumerico(contadorSubTotal),
      formatoNumerico(contadorTotalImpuestosTransladados),
      formatoNumerico(contadorTotalImpuestosRetenidos),
      formatoNumerico(contadorTotal),
    ]);

    // CONDICION DE RENDERIZADO
    if (contadorTotal === 0) continue;

    doc.addPage();

    doc.autoTable({
      head: [header],
      body: [...filas],
      bodyStyles: {
        fontSize: 8,
      },
      startY: 10,
      startX: 10,
      margin: { left: 20, right: 10 },
      theme: "grid",
      headStyles: {
        fillColor: colores.primario,
        textColor: [255, 255, 255],
        fontSize: 8,
      },
      // styles: {
      //   overflow: "linebreak", // Asegura que el contenido se ajuste
      // },
      columnStyles: {
        0: { cellWidth: 12 }, // Folio
        1: { cellWidth: 20 }, // Folio Fiscal
        2: { cellWidth: 28 }, // RFC
        3: { cellWidth: 20 }, // Fecha
        4: { cellWidth: 25 }, // Nombre
        5: { cellWidth: 30 }, // Clave
        6: { cellWidth: 30 }, // Concepto
        7: { cellWidth: 10 }, // Tipo comprobante
        8: { cellWidth: 25 }, // subtotal
        9: { cellWidth: 20 }, // traladado
        10: { cellWidth: 20 }, // retenido
        11: { cellWidth: 25 }, // total
      },
      didParseCell: function (data) {
        if (data.section === "head" || data.section === "body") {
          if (data.column.index <= 6) {
            data.cell.styles.halign = "left";
          } else if (data.column.index === 7) {
            data.cell.styles.halign = "center";
          } else {
            data.cell.styles.halign = "right";
          }
        }

        if (data.section === "body" && data.row.index === filas.length - 1) {
          data.cell.styles.fillColor = colores.secundario;
          data.cell.styles.textColor = [0, 0, 0];
          data.cell.styles.fontStyle = "bold";
        }
      },
      didDrawPage: function (data) {
        agregarPaginaSeccion(
          doc,
          `${titulo} - ${nombreMes}`,
          colores.primario,
          "sin_impuestos_emitidos"
        );
      },
    });

    // Generar la grafica agrupada por RFC
    if (Object.keys(datosGraficaMensual).length > 1) {
      const listaRfc = Object.keys(datosGraficaMensual);
      const listaComprobantesTotales = listaRfc.map(
        (rfc) => datosGraficaMensual[rfc].total
      );

      // Solo generamos la grafica si hay comprobantes
      if (listaComprobantesTotales.some((valor) => valor > 0)) {
        const degradado = generarDegradadoHex(
          rgbToHex(colores.primario),
          rgbToHex(colores.secundario),
          listaRfc.length
        );

        const datos = {
          labels: listaRfc,
          datasets: [
            {
              data: listaComprobantesTotales,
              backgroundColor: degradado,
              hoverOffset: 4,
            },
          ],
        };

        doc.addPage();

        let imgData = await generarGraficaPastel(datos);
        doc.addImage(imgData, "PNG", 0, 40, 290, 130);

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text(`Distribución por RFC - ${nombreMes}`, 150, 20, {
          align: "center",
        });

        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text("* Solo se muestran los valores mayores al 5%", 225, 205);
      }
    }
  }

  if (esMensual) return;

  // AGREGAMOS EL CONCENTRADO GENERAL
  let filasConcentrado = [];
  let contadorSubTotal = 0;
  let contadorTotalImpuestosTransladados = 0;
  let contadorTotalImpuestosRetenidos = 0;
  let contadorTotal = 0;

  for (let [rfc, datos] of Object.entries(concentradoGeneral)) {
    const fila = [
      rfc,
      datos.nombre,
      formatoNumerico(datos.subTotal),
      formatoNumerico(datos.totalImpuestosTransladados),
      formatoNumerico(datos.totalImpuestosRetenidos),
      formatoNumerico(datos.total),
    ];

    contadorSubTotal += datos.subTotal;
    contadorTotalImpuestosTransladados += datos.totalImpuestosTransladados;
    contadorTotalImpuestosRetenidos += datos.totalImpuestosRetenidos;
    contadorTotal += datos.total;

    filasConcentrado.push(fila);
  }

  filasConcentrado.push([
    "Total",
    "",
    formatoNumerico(contadorSubTotal),
    formatoNumerico(contadorTotalImpuestosTransladados),
    formatoNumerico(contadorTotalImpuestosRetenidos),
    formatoNumerico(contadorTotal),
  ]);

  if (contadorTotal === 0) return;

  doc.addPage();

  const headerConcentrado = [
    "RFC",
    "Nombre",
    "SubTotal",
    "Total Impuesto Transladados",
    "Total Impuesto Retenidos",
    "Total",
  ];

  doc.autoTable({
    head: [headerConcentrado],
    body: [...filasConcentrado],
    startY: 10,
    startX: 10,
    margin: { left: 20, right: 10 },
    theme: "grid",
    headStyles: {
      fillColor: colores.primario,
      textColor: [255, 255, 255],
      fontSize: 8,
    },
    columnStyles: {
      0: { halign: "left" },
      1: { halign: "left" },
      2: { halign: "right" },
      3: { halign: "right" },
      4: { halign: "right" },
      5: { halign: "right" },
    },
    didParseCell: function (data) {
      if (data.section === "head") {
        if (data.column.index <= 1) {
          data.cell.styles.halign = "left";
        } else {
          data.cell.styles.halign = "right";
        }
      }

      if (data.section === "body") {
        if (data.column.index <= 1) {
          data.cell.styles.halign = "left";
        } else {
          data.cell.styles.halign = "right";
        }

        if (data.row.index === filasConcentrado.length - 1) {
          data.cell.styles.fillColor = colores.secundario;
          data.cell.styles.textColor = [0, 0, 0];
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
    didDrawPage: function (data) {
      agregarPaginaSeccion(
        doc,
        `${titulo} - CONCENTRADO`,
        colores.primario,
        "sin_impuestos_emitidos"
      );
    },
  });

  // Verificamos que haya datos para generar la grafica del concentrado
  if (filasConcentrado.length > 1) {
    // Más de 1 porque incluye la fila de total
    const datosSinTotal = filasConcentrado.slice(
      0,
      filasConcentrado.length - 1
    );

    const listaRfc = datosSinTotal.map((fila) => fila[0]); // Primera columna (RFC)
    const listaTotales = datosSinTotal.map((fila) => {
      // Convertir de string formateado a número
      const totalStr = fila[5];
      return parseFloat(totalStr.replace(/[^\d.-]/g, "")) || 0;
    });

    // Solo generamos la grafica si hay valores mayores a cero
    if (listaTotales.some((valor) => valor > 0)) {
      const degradado = generarDegradadoHex(
        rgbToHex(colores.primario),
        rgbToHex(colores.secundario),
        listaRfc.length
      );

      const datos = {
        labels: listaRfc,
        datasets: [
          {
            data: listaTotales,
            backgroundColor: degradado,
            hoverOffset: 4,
          },
        ],
      };

      doc.addPage();

      let imgData = await generarGraficaPastel(datos);
      doc.addImage(imgData, "PNG", 0, 40, 300, 140);

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text("Distribución de Totales por RFC", 150, 20, {
        align: "center",
      });

      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.text("* Solo se muestran los valores mayores al 5%", 225, 205);
    }
  }
};

/**
 * Generar pagina para reporte riesgo arrendamiento
 * @param {jsPDF} doc - Documento PDF
 * @param {Object} colores - Colores para la seccion
 * @param {string} titulo - Titulo para la seccion
 * @param {Object} contenido - Contenido de la seccion
 */
const agregarPaginaRiesgoArrendamiento = async (
  doc,
  colores,
  titulo,
  contenido,
  esMensual
) => {
  const header = [
    "Folio",
    "Folio Fiscal",
    "Fecha",
    "RFC",
    "Nombre",
    "Clave Producto o Servicio",
    "Descripción",
    "Metodo Pago",
    "Tipo Comprobante",
    "SubTotal",
    "Total Impuesto Transladados",
    "Total Impuesto Retenidos",
    "Total",
  ];

  let concentradoGeneral = {};

  for (let [nombreMes, arregloDatos] of Object.entries(contenido)) {
    let filas = [];
    let contadorSubTotal = 0;
    let contadorTotalImpuestosTransladados = 0;
    let contadorTotalImpuestosRetenidos = 0;
    let contadorTotal = 0;

    const datosGraficaMensual = {};

    for (const dato of arregloDatos) {
      // CONCENTRADO MENSUAL

      const subTotal = dato.subTotal || 0;
      const total = dato.total || 0;
      const totalImpuestosTransladados = dato.totalImpuestosTrasladados || 0;
      const totalImpuestosRetenidos = dato.totalImpuestosRetenidos || 0;
      const fecha = dato.fecha ? formatoFechaSinHora(dato.fecha) : "N/A";

      const fila = [
        dato.folio || "N/A",
        dato.folioFiscal || "N/A",
        fecha,
        dato.rfc || "N/A",
        dato.nombre || "N/A",
        dato.claveProdServ || "N/A",
        dato.descripcion || "N/A",
        dato.metodoPago || "N/A",
        dato.tipoComprobante || "N/A",
        formatoNumerico(subTotal),
        formatoNumerico(totalImpuestosTransladados),
        formatoNumerico(totalImpuestosRetenidos),
        formatoNumerico(total),
      ];

      contadorSubTotal += subTotal;
      contadorTotalImpuestosTransladados += totalImpuestosTransladados;
      contadorTotalImpuestosRetenidos += totalImpuestosRetenidos;
      contadorTotal += total;

      filas.push(fila);

      // DATOS PARA CONCENTRADO MENSUAL
      if (!datosGraficaMensual[dato.rfc]) {
        datosGraficaMensual[dato.rfc] = {
          rfc: dato.rfc,
          total: 0,
        };
      }

      datosGraficaMensual[dato.rfc].total += total;

      // DATOS PARA CONCENTRADO GENERAL

      if (!concentradoGeneral[dato.rfc]) {
        concentradoGeneral[dato.rfc] = {
          nombre: "N/A",
          subTotal: 0,
          totalImpuestosTransladados: 0,
          totalImpuestosRetenidos: 0,
          total: 0,
        };
      }

      concentradoGeneral[dato.rfc].nombre = dato.nombre;
      concentradoGeneral[dato.rfc].subTotal += subTotal;
      concentradoGeneral[dato.rfc].totalImpuestosTransladados +=
        totalImpuestosTransladados;
      concentradoGeneral[dato.rfc].totalImpuestosRetenidos +=
        totalImpuestosRetenidos;
      concentradoGeneral[dato.rfc].total += total;
    }

    // AGREGAMOS TOTALES
    filas.push([
      "Total",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      formatoNumerico(contadorSubTotal),
      formatoNumerico(contadorTotalImpuestosTransladados),
      formatoNumerico(contadorTotalImpuestosRetenidos),
      formatoNumerico(contadorTotal),
    ]);

    // CONDICION DE RENDERIZADO
    if (contadorTotal === 0) continue;

    doc.addPage();
    doc.setFontSize(8);

    doc.autoTable({
      head: [header],
      body: [...filas],
      bodyStyles: {
        fontSize: 8,
      },
      startY: 10,
      startX: 10,
      margin: { left: 20, right: 10 },
      theme: "grid",
      headStyles: {
        fillColor: colores.primario,
        textColor: [255, 255, 255],
        fontSize: 8,
      },
      // styles: {
      //   overflow: "linebreak", // Asegura que el contenido se ajuste
      // },
      columnStyles: {
        0: { cellWidth: 10 }, // Folio
        1: { cellWidth: 20 }, // Folio Fiscal
        2: { cellWidth: 20 }, // Fecha
        3: { cellWidth: 26 }, // RFC
        4: { cellWidth: 20 }, // Nombre
        5: { cellWidth: 27 }, // Clave
        6: { cellWidth: 27 }, // Descripcion
        7: { cellWidth: 25 }, // Metodo de pago
        8: { cellWidth: 15 }, // Tipo Comprobante
        9: { cellWidth: 20 }, // SubTotal
        10: { cellWidth: 20 }, // Total Impuesto Transladados
        11: { cellWidth: 20 }, // Total Impuesto Retenidos
        12: { cellWidth: 20 }, // Total
        13: { cellWidth: 20 }, // Total
        14: { cellWidth: 20 }, // Total
      },
      didParseCell: function (data) {
        if (data.section === "head" || data.section === "body") {
          if (data.column.index <= 7) {
            data.cell.styles.halign = "left";
          } else if (data.column.index === 8) {
            data.cell.styles.halign = "center";
          } else {
            data.cell.styles.halign = "right";
          }
        }

        if (data.section === "body" && data.row.index === filas.length - 1) {
          data.cell.styles.fillColor = colores.secundario;
          data.cell.styles.textColor = [0, 0, 0];
          data.cell.styles.fontStyle = "bold";
        }
      },
      didDrawPage: function (data) {
        agregarPaginaSeccion(
          doc,
          `${titulo} - ${nombreMes}`,
          colores.primario,
          "riesgo_arrendamiento"
        );
      },
    });

    // Generar la grafica agrupada por RFC
    if (Object.keys(datosGraficaMensual).length > 1) {
      const listaRfc = Object.keys(datosGraficaMensual);
      const listaComprobantesTotales = listaRfc.map(
        (rfc) => datosGraficaMensual[rfc].total
      );

      // Solo generamos la grafica si hay comprobantes
      if (listaComprobantesTotales.some((valor) => valor > 0)) {
        const degradado = generarDegradadoHex(
          rgbToHex(colores.primario),
          rgbToHex(colores.secundario),
          listaRfc.length
        );

        const datos = {
          labels: listaRfc,
          datasets: [
            {
              data: listaComprobantesTotales,
              backgroundColor: degradado,
              hoverOffset: 4,
            },
          ],
        };

        doc.addPage();

        let imgData = await generarGraficaPastel(datos);
        doc.addImage(imgData, "PNG", 0, 40, 290, 130);

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text(`Distribución por RFC - ${nombreMes}`, 150, 20, {
          align: "center",
        });

        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text("* Solo se muestran los valores mayores al 5%", 225, 205);
      }
    }
  }

  if (esMensual === false) {
    // AGREGAMOS EL CONCENTRADO GENERAL
    let filasConcentrado = [];
    let contadorSubTotal = 0;
    let contadorTotalImpuestosTransladados = 0;
    let contadorTotalImpuestosRetenidos = 0;
    let contadorTotal = 0;

    for (let [rfc, datos] of Object.entries(concentradoGeneral)) {
      const fila = [
        rfc,
        datos.nombre,
        formatoNumerico(datos.subTotal),
        formatoNumerico(datos.totalImpuestosTransladados),
        formatoNumerico(datos.totalImpuestosRetenidos),
        formatoNumerico(datos.total),
      ];

      contadorSubTotal += datos.subTotal;
      contadorTotalImpuestosTransladados += datos.totalImpuestosTransladados;
      contadorTotalImpuestosRetenidos += datos.totalImpuestosRetenidos;
      contadorTotal += datos.total;

      filasConcentrado.push(fila);
    }

    filasConcentrado.push([
      "Total",
      "",
      formatoNumerico(contadorSubTotal),
      formatoNumerico(contadorTotalImpuestosTransladados),
      formatoNumerico(contadorTotalImpuestosRetenidos),
      formatoNumerico(contadorTotal),
    ]);

    if (contadorTotal === 0) return;

    doc.addPage();

    const headerConcentrado = [
      "RFC",
      "Nombre",
      "SubTotal",
      "Total Impuesto Transladados",
      "Total Impuesto Retenidos",
      "Total",
    ];

    doc.autoTable({
      head: [headerConcentrado],
      body: [...filasConcentrado],
      startY: 10,
      startX: 10,
      margin: { left: 20, right: 10 },
      theme: "grid",
      headStyles: {
        fillColor: colores.primario,
        textColor: [255, 255, 255],
        fontSize: 10,
      },
      columnStyles: {
        0: { halign: "left" },
        1: { halign: "left" },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "right" },
      },
      didParseCell: function (data) {
        if (data.section === "head") {
          if (data.column.index <= 1) {
            data.cell.styles.halign = "left";
          } else {
            data.cell.styles.halign = "right";
          }
        }

        if (data.section === "body") {
          if (data.column.index <= 1) {
            data.cell.styles.halign = "left";
          } else {
            data.cell.styles.halign = "right";
          }

          if (data.row.index === filasConcentrado.length - 1) {
            data.cell.styles.fillColor = colores.secundario;
            data.cell.styles.textColor = [0, 0, 0];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
      didDrawPage: function (data) {
        agregarPaginaSeccion(
          doc,
          `${titulo} - CONCENTRADO`,
          colores.primario,
          "riesgo_arrendamiento"
        );
      },
    });

    // Verificamos que haya datos para generar la grafica del concentrado
    if (filasConcentrado.length > 1) {
      // Más de 1 porque incluye la fila de total
      const datosSinTotal = filasConcentrado.slice(
        0,
        filasConcentrado.length - 1
      );

      const listaRfc = datosSinTotal.map((fila) => fila[0]); // Primera columna (RFC)
      const listaTotales = datosSinTotal.map((fila) => {
        // Convertir de string formateado a número
        const totalStr = fila[5];
        return parseFloat(totalStr.replace(/[^\d.-]/g, "")) || 0;
      });

      // Solo generamos la grafica si hay valores mayores a cero
      if (listaTotales.some((valor) => valor > 0)) {
        const degradado = generarDegradadoHex(
          rgbToHex(colores.primario),
          rgbToHex(colores.secundario),
          listaRfc.length
        );

        const datos = {
          labels: listaRfc,
          datasets: [
            {
              data: listaTotales,
              backgroundColor: degradado,
              hoverOffset: 4,
            },
          ],
        };

        doc.addPage();

        let imgData = await generarGraficaPastel(datos);
        doc.addImage(imgData, "PNG", 0, 40, 300, 140);

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text("Distribución de Totales por RFC", 150, 20, {
          align: "center",
        });

        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text("* Solo se muestran los valores mayores al 5%", 225, 205);
      }
    }
  }
};

/**
 * Generar pagina para reporte riesgo conceptos
 * @param {jsPDF} doc - Documento PDF
 * @param {Object} colores - Colores para la seccion
 * @param {string} titulo - Titulo para la seccion
 * @param {Object} contenido - Contenido de la seccion
 */
const agregarPaginaRiesgoConceptos = async (
  doc,
  colores,
  titulo,
  contenido,
  esMensual
) => {
  const header = [
    "Folio",
    "Folio Fiscal",
    "RFC",
    "Nombre",
    "Descripción",
    "Metodo Pago",
    "Forma Pago",
    "Tipo Comprobante",
    "SubTotal",
  ];

  let concentradoGeneral = {};

  for (let [nombreMes, arregloDatos] of Object.entries(contenido)) {
    let filas = [];
    let contadorSubTotal = 0;

    const datosGraficaMensual = {};

    for (const dato of arregloDatos) {
      // CONCENTRADO MENSUAL

      const subTotal = dato.subTotal || 0;

      const fila = [
        dato.folio || "N/A",
        dato.folioFiscal || "N/A",
        dato.rfc || "N/A",
        dato.nombre || "N/A",
        dato.descripcion || "N/A",
        dato.metodoPago || "N/A",
        dato.formaPago || "N/A",
        dato.tipoComprobante || "N/A",
        formatoNumerico(subTotal),
      ];

      contadorSubTotal += subTotal;

      filas.push(fila);

      // DATOS PARA CONCENTRADO MENSUAL
      if (!datosGraficaMensual[dato.rfc]) {
        datosGraficaMensual[dato.rfc] = {
          rfc: dato.rfc,
          subTotal: 0,
        };
      }

      datosGraficaMensual[dato.rfc].subTotal += subTotal;

      // DATOS PARA CONCENTRADO GENERAL

      if (!concentradoGeneral[dato.rfc]) {
        concentradoGeneral[dato.rfc] = {
          nombre: "N/A",
          subTotal: 0,
        };
      }

      concentradoGeneral[dato.rfc].nombre = dato.nombre;
      concentradoGeneral[dato.rfc].subTotal += subTotal;
    }

    // AGREGAMOS TOTALES
    filas.push([
      "Total",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      formatoNumerico(contadorSubTotal),
    ]);

    // CONDICION DE RENDERIZADO
    if (contadorSubTotal === 0) continue;

    doc.addPage();

    doc.autoTable({
      head: [header],
      body: [...filas],
      startY: 10,
      startX: 10,
      margin: { left: 20, right: 10 },
      theme: "grid",
      headStyles: {
        fillColor: colores.primario,
        textColor: [255, 255, 255],
      },
      styles: {
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 15 }, // Folio
        1: { cellWidth: 30 }, // Folio Fiscal
        2: { cellWidth: 30 }, // RFC
        3: { cellWidth: 35 }, // Nombre
        4: { cellWidth: 35 }, // Descripcion
        5: { cellWidth: 30 }, // Metodo de pago
        6: { cellWidth: 35 }, // Forma de pago
        7: { cellWidth: 20 }, // Tipo de comprobante
        8: { cellWidth: 35 }, // Subtotal
      },
      didParseCell: function (data) {
        if (data.section === "head" || data.section === "body") {
          if (data.column.index <= 6) {
            data.cell.styles.halign = "left";
          } else if (data.column.index === 7) {
            data.cell.styles.halign = "center";
          } else {
            data.cell.styles.halign = "right";
          }
        }

        if (data.section === "body" && data.row.index === filas.length - 1) {
          data.cell.styles.fillColor = colores.secundario;
          data.cell.styles.textColor = [0, 0, 0];
          data.cell.styles.fontStyle = "bold";
        }
      },
      didDrawPage: function (data) {
        agregarPaginaSeccion(
          doc,
          `${titulo} - ${nombreMes}`,
          colores.primario,
          "riesgo_conceptos_emitidos"
        );
      },
    });

    // Generar la grafica agrupada por RFC
    if (Object.keys(datosGraficaMensual).length > 1) {
      const listaRfc = Object.keys(datosGraficaMensual);
      const listaComprobantesTotales = listaRfc.map(
        (rfc) => datosGraficaMensual[rfc].total
      );

      // Solo generamos la grafica si hay comprobantes
      if (listaComprobantesTotales.some((valor) => valor > 0)) {
        const degradado = generarDegradadoHex(
          rgbToHex(colores.primario),
          rgbToHex(colores.secundario),
          listaRfc.length
        );

        const datos = {
          labels: listaRfc,
          datasets: [
            {
              data: listaComprobantesTotales,
              backgroundColor: degradado,
              hoverOffset: 4,
            },
          ],
        };

        doc.addPage();

        let imgData = await generarGraficaPastel(datos);
        doc.addImage(imgData, "PNG", 0, 40, 290, 130);

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text(`Distribución por RFC - ${nombreMes}`, 150, 20, {
          align: "center",
        });

        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text("* Solo se muestran los valores mayores al 5%", 225, 205);
      }
    }
  }

  // AGREGAMOS EL CONCENTRADO GENERAL
  let filasConcentrado = [];
  let contadorSubTotal = 0;

  for (let [rfc, datos] of Object.entries(concentradoGeneral)) {
    const fila = [rfc, datos.nombre, formatoNumerico(datos.subTotal)];

    contadorSubTotal += datos.subTotal;

    filasConcentrado.push(fila);
  }

  filasConcentrado.push(["Total", "", formatoNumerico(contadorSubTotal)]);

  if (contadorSubTotal === 0) return;

  if (esMensual === false) {
    doc.addPage();

    const headerConcentrado = ["RFC", "Nombre", "SubTotal"];

    doc.autoTable({
      head: [headerConcentrado],
      body: [...filasConcentrado],
      startY: 10,
      startX: 10,
      margin: { left: 20, right: 10 },
      theme: "grid",
      headStyles: {
        fillColor: colores.primario,
        textColor: [255, 255, 255],
        fontSize: 10,
      },
      columnStyles: {
        0: { halign: "left" },
        1: { halign: "left" },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "right" },
      },
      didParseCell: function (data) {
        if (data.section === "head") {
          if (data.column.index <= 1) {
            data.cell.styles.halign = "left";
          } else {
            data.cell.styles.halign = "right";
          }
        }

        if (data.section === "body") {
          if (data.column.index <= 1) {
            data.cell.styles.halign = "left";
          } else {
            data.cell.styles.halign = "right";
          }

          if (data.row.index === filasConcentrado.length - 1) {
            data.cell.styles.fillColor = colores.secundario;
            data.cell.styles.textColor = [0, 0, 0];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
      didDrawPage: function (data) {
        agregarPaginaSeccion(
          doc,
          `${titulo} - CONCENTRADO`,
          colores.primario,
          "riesgo_conceptos_emitidos"
        );
      },
    });
  }
};

/**
 * Generar pagina para reporte gastos efectivo
 * @param {jsPDF} doc - Documento PDF
 * @param {Object} colores - Colores para la seccion
 * @param {string} titulo - Titulo para la seccion
 * @param {Object} contenido - Contenido de la seccion
 */
const agregarPaginaGastosEfectivo = async (
  doc,
  colores,
  titulo,
  contenido,
  esMensual
) => {
  const header = [
    "Folio",
    "Folio Fiscal",
    "RFC",
    "Nombre",
    "Tipo Comprobante",
    "SubTotal",
    "Total Impuesto Transladados",
    "Total Impuesto Retenidos",
    "Total",
  ];

  let concentradoGeneral = {};

  for (let [nombreMes, arregloDatos] of Object.entries(contenido)) {
    let filas = [];
    let contadorSubTotal = 0;
    let contadorTotalImpuestosTransladados = 0;
    let contadorTotalImpuestosRetenidos = 0;
    let contadorTotal = 0;

    const datosGraficaMensual = {};

    for (const dato of arregloDatos) {
      // CONCENTRADO MENSUAL

      const subTotal = dato.subTotal || 0;
      const total = dato.total || 0;
      const totalImpuestosTransladados = dato.totalImpuestosTrasladados || 0;
      const totalImpuestosRetenidos = dato.totalImpuestosRetenidos || 0;

      const fila = [
        dato.folio || "N/A",
        dato.folioFiscal || "N/A",
        dato.rfc || "N/A",
        dato.nombre || "N/A",
        dato.tipoComprobante || "N/A",
        formatoNumerico(subTotal),
        formatoNumerico(totalImpuestosTransladados),
        formatoNumerico(totalImpuestosRetenidos),
        formatoNumerico(total),
      ];

      contadorSubTotal += subTotal;
      contadorTotalImpuestosTransladados += totalImpuestosTransladados;
      contadorTotalImpuestosRetenidos += totalImpuestosRetenidos;
      contadorTotal += total;

      filas.push(fila);

      // DATOS PARA CONCENTRADO MENSUAL
      if (!datosGraficaMensual[dato.rfc]) {
        datosGraficaMensual[dato.rfc] = {
          rfc: dato.rfc,
          total: 0,
        };
      }

      datosGraficaMensual[dato.rfc].total += total;

      // DATOS PARA CONCENTRADO GENERAL

      if (!concentradoGeneral[dato.rfc]) {
        concentradoGeneral[dato.rfc] = {
          nombre: "N/A",
          subTotal: 0,
          totalImpuestosTransladados: 0,
          totalImpuestosRetenidos: 0,
          total: 0,
        };
      }

      concentradoGeneral[dato.rfc].nombre = dato.nombre;
      concentradoGeneral[dato.rfc].subTotal += subTotal;
      concentradoGeneral[dato.rfc].totalImpuestosTransladados +=
        totalImpuestosTransladados;
      concentradoGeneral[dato.rfc].totalImpuestosRetenidos +=
        totalImpuestosRetenidos;
      concentradoGeneral[dato.rfc].total += total;
    }

    // AGREGAMOS TOTALES
    filas.push([
      "Total",
      "",
      "",
      "",
      "",
      formatoNumerico(contadorSubTotal),
      formatoNumerico(contadorTotalImpuestosTransladados),
      formatoNumerico(contadorTotalImpuestosRetenidos),
      formatoNumerico(contadorTotal),
    ]);

    // CONDICION DE RENDERIZADO
    if (contadorTotal === 0) continue;

    doc.addPage();
    doc.setFontSize(10);

    doc.autoTable({
      head: [header],
      body: [...filas],
      startY: 10,
      startX: 10,
      margin: { left: 20, right: 10 },
      theme: "grid",
      headStyles: {
        fillColor: colores.primario,
        textColor: [255, 255, 255],
      },
      styles: {
        fontSize: 8,
      },
      columnStyles: {
        // 1: { halign: "left" },
        // 2: { halign: "left" },
        // 3: { halign: "left" },
        // 4: { halign: "right" },
        // 5: { halign: "right" },
      },
      didParseCell: function (data) {
        if (data.section === "head" || data.section === "body") {
          if (data.column.index <= 4) {
            data.cell.styles.halign = "left";
          } else if (data.column.index === 5) {
            data.cell.styles.halign = "center";
          } else {
            data.cell.styles.halign = "right";
          }
        }

        if (data.section === "body" && data.row.index === filas.length - 1) {
          data.cell.styles.fillColor = colores.secundario;
          data.cell.styles.textColor = [0, 0, 0];
          data.cell.styles.fontStyle = "bold";
        }
      },
      didDrawPage: function (data) {
        agregarPaginaSeccion(
          doc,
          `${titulo} - ${nombreMes}`,
          colores.primario,
          "gastos_efectivo"
        );
      },
    });

    // Generar la grafica agrupada por RFC
    if (Object.keys(datosGraficaMensual).length > 1) {
      const listaRfc = Object.keys(datosGraficaMensual);
      const listaComprobantesTotales = listaRfc.map(
        (rfc) => datosGraficaMensual[rfc].total
      );

      // Solo generamos la grafica si hay comprobantes
      if (listaComprobantesTotales.some((valor) => valor > 0)) {
        const degradado = generarDegradadoHex(
          rgbToHex(colores.primario),
          rgbToHex(colores.secundario),
          listaRfc.length
        );

        const datos = {
          labels: listaRfc,
          datasets: [
            {
              data: listaComprobantesTotales,
              backgroundColor: degradado,
              hoverOffset: 4,
            },
          ],
        };

        doc.addPage();

        let imgData = await generarGraficaPastel(datos);
        doc.addImage(imgData, "PNG", 0, 40, 290, 130);

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text(`Distribución por RFC - ${nombreMes}`, 150, 20, {
          align: "center",
        });

        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text("* Solo se muestran los valores mayores al 5%", 225, 205);
      }
    }
  }

  if (esMensual === false) {
    // AGREGAMOS EL CONCENTRADO GENERAL
    let filasConcentrado = [];
    let contadorSubTotal = 0;
    let contadorTotalImpuestosTransladados = 0;
    let contadorTotalImpuestosRetenidos = 0;
    let contadorTotal = 0;

    for (let [rfc, datos] of Object.entries(concentradoGeneral)) {
      const fila = [
        rfc,
        datos.nombre,
        formatoNumerico(datos.subTotal),
        formatoNumerico(datos.totalImpuestosTransladados),
        formatoNumerico(datos.totalImpuestosRetenidos),
        formatoNumerico(datos.total),
      ];

      contadorSubTotal += datos.subTotal;
      contadorTotalImpuestosTransladados += datos.totalImpuestosTransladados;
      contadorTotalImpuestosRetenidos += datos.totalImpuestosRetenidos;
      contadorTotal += datos.total;

      filasConcentrado.push(fila);
    }

    filasConcentrado.push([
      "Total",
      "",
      formatoNumerico(contadorSubTotal),
      formatoNumerico(contadorTotalImpuestosTransladados),
      formatoNumerico(contadorTotalImpuestosRetenidos),
      formatoNumerico(contadorTotal),
    ]);

    if (contadorTotal === 0) return;

    doc.addPage();

    const headerConcentrado = [
      "RFC",
      "Nombre",
      "SubTotal",
      "Total Impuesto Transladados",
      "Total Impuesto Retenidos",
      "Total",
    ];

    doc.autoTable({
      head: [headerConcentrado],
      body: [...filasConcentrado],
      startY: 10,
      startX: 10,
      margin: { left: 20, right: 10 },
      theme: "grid",
      headStyles: {
        fillColor: colores.primario,
        textColor: [255, 255, 255],
        fontSize: 10,
      },
      columnStyles: {
        0: { halign: "left" },
        1: { halign: "left" },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "right" },
      },
      didParseCell: function (data) {
        if (data.section === "head") {
          if (data.column.index <= 1) {
            data.cell.styles.halign = "left";
          } else {
            data.cell.styles.halign = "right";
          }
        }

        if (data.section === "body") {
          if (data.column.index <= 1) {
            data.cell.styles.halign = "left";
          } else {
            data.cell.styles.halign = "right";
          }

          if (data.row.index === filasConcentrado.length - 1) {
            data.cell.styles.fillColor = colores.secundario;
            data.cell.styles.textColor = [0, 0, 0];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
      didDrawPage: function (data) {
        agregarPaginaSeccion(
          doc,
          `${titulo} - CONCENTRADO`,
          colores.primario,
          "gastos_efectivo"
        );
      },
    });

    // Verificamos que haya datos para generar la grafica del concentrado
    if (filasConcentrado.length > 1) {
      // Más de 1 porque incluye la fila de total
      const datosSinTotal = filasConcentrado.slice(
        0,
        filasConcentrado.length - 1
      );

      const listaRfc = datosSinTotal.map((fila) => fila[0]); // Primera columna (RFC)
      const listaTotales = datosSinTotal.map((fila) => {
        // Convertir de string formateado a número
        const totalStr = fila[5];
        return parseFloat(totalStr.replace(/[^\d.-]/g, "")) || 0;
      });

      // Solo generamos la grafica si hay valores mayores a cero
      if (listaTotales.some((valor) => valor > 0)) {
        const degradado = generarDegradadoHex(
          rgbToHex(colores.primario),
          rgbToHex(colores.secundario),
          listaRfc.length
        );

        const datos = {
          labels: listaRfc,
          datasets: [
            {
              data: listaTotales,
              backgroundColor: degradado,
              hoverOffset: 4,
            },
          ],
        };

        doc.addPage();

        let imgData = await generarGraficaPastel(datos);
        doc.addImage(imgData, "PNG", 0, 40, 300, 140);

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text("Distribución de Totales por RFC", 150, 20, {
          align: "center",
        });

        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text("* Solo se muestran los valores mayores al 5%", 225, 205);
      }
    }
  }
};

/**
 * Generar pagina para reporte consumo combustible
 * @param {jsPDF} doc - Documento PDF
 * @param {Object} colores - Colores para la seccion
 * @param {string} titulo - Titulo para la seccion
 * @param {Object} contenido - Contenido de la seccion
 */
const agregarPaginaConsumoCombustible = async (
  doc,
  colores,
  titulo,
  contenido,
  esMensual
) => {
  const header = [
    "Unidad",
    "Forma de Pago",
    "Método de Pago",
    "Descripción",
    "Total Cantidad",
    "SubTotal",
    "Total Translados",
    "Total Retenciones",
    "Total",
  ];

  let concentradoGeneral = {};

  for (let [nombreMes, arregloDatos] of Object.entries(contenido)) {
    let filas = [];
    let contadorSubTotal = 0;
    let contadorTotalTraslados = 0;
    let contadorTotalRetenciones = 0;
    let contadorTotal = 0;
    let contadorTotalCantidad = 0;

    const datosGraficaMensual = {};

    for (const dato of arregloDatos) {
      // CONCENTRADO MENSUAL

      const totalCantidad = dato.totalCantidad || 0;
      const subTotal = dato.totalSubTotal || 0;
      const total = dato.total || 0;
      const totalTraslados = dato.totalTraslados || 0;
      const totalRetenciones = dato.totalRetenciones || 0;

      const fila = [
        dato.unidad || "N/A",
        dato.formaPago || "N/A",
        dato.metodoPago || "N/A",
        dato.descripcion || "N/A",
        formatoCantidadMiles(totalCantidad),
        formatoNumerico(subTotal),
        formatoNumerico(totalTraslados),
        formatoNumerico(totalRetenciones),
        formatoNumerico(total),
      ];

      contadorSubTotal += subTotal;
      contadorTotalTraslados += totalTraslados;
      contadorTotalRetenciones += totalRetenciones;
      contadorTotal += total;
      contadorTotalCantidad += totalCantidad;

      filas.push(fila);

      // DATOS PARA CONCENTRADO MENSUAL
      if (!datosGraficaMensual[dato.descripcion]) {
        datosGraficaMensual[dato.descripcion] = {
          descripcion: dato.descripcion,
          total: 0,
        };
      }

      datosGraficaMensual[dato.descripcion].total += total;

      // DATOS PARA CONCENTRADO GENERAL

      if (!concentradoGeneral[dato.descripcion]) {
        concentradoGeneral[dato.descripcion] = {
          descripcion: "N/A",
          totalCantidad: 0,
          subTotal: 0,
          totalTraslados: 0,
          totalRetenciones: 0,
          total: 0,
        };
      }

      concentradoGeneral[dato.descripcion].descripcion = dato.nombre;
      concentradoGeneral[dato.descripcion].totalCantidad += dato.totalCantidad;
      concentradoGeneral[dato.descripcion].subTotal += subTotal;
      concentradoGeneral[dato.descripcion].totalTraslados += totalTraslados;
      concentradoGeneral[dato.descripcion].totalRetenciones += totalRetenciones;
      concentradoGeneral[dato.descripcion].total += total;
    }

    // AGREGAMOS TOTALES
    filas.push([
      "Total",
      "",
      "",
      "",
      formatoCantidadMiles(contadorTotalCantidad),
      formatoNumerico(contadorSubTotal),
      formatoNumerico(contadorTotalTraslados),
      formatoNumerico(contadorTotalRetenciones),
      formatoNumerico(contadorTotal),
    ]);

    // CONDICION DE RENDERIZADO
    if (contadorTotal === 0) continue;

    doc.addPage();
    doc.setFontSize(10);

    doc.autoTable({
      head: [header],
      body: [...filas],
      bodyStyles: {
        fontSize: 8,
      },
      startY: 10,
      startX: 10,
      margin: { left: 20, right: 10 },
      theme: "grid",
      headStyles: {
        fillColor: colores.primario,
        textColor: [255, 255, 255],
        fontSize: 8,
      },
      columnStyles: {
        1: { halign: "left" },
        2: { halign: "left" },
        3: { halign: "left" },
        4: { halign: "right" },
        5: { halign: "right" },
      },
      didParseCell: function (data) {
        if (data.section === "head" || data.section === "body") {
          if (data.column.index <= 3) {
            data.cell.styles.halign = "left";
          } else {
            data.cell.styles.halign = "right";
          }
        }

        if (data.section === "body" && data.row.index === filas.length - 1) {
          data.cell.styles.fillColor = colores.secundario;
          data.cell.styles.textColor = [0, 0, 0];
          data.cell.styles.fontStyle = "bold";
        }
      },
      didDrawPage: function (data) {
        agregarPaginaSeccion(
          doc,
          `${titulo} - ${nombreMes}`,
          colores.primario,
          "consumo_combustible"
        );
      },
    });

    // Generar la grafica agrupada por RFC
    if (Object.keys(datosGraficaMensual).length > 1) {
      const listaRfc = Object.keys(datosGraficaMensual);
      const listaComprobantesTotales = listaRfc.map(
        (rfc) => datosGraficaMensual[rfc].total
      );

      // Solo generamos la grafica si hay comprobantes
      if (listaComprobantesTotales.some((valor) => valor > 0)) {
        const degradado = generarDegradadoHex(
          rgbToHex(colores.primario),
          rgbToHex(colores.secundario),
          listaRfc.length
        );

        const datos = {
          labels: listaRfc,
          datasets: [
            {
              data: listaComprobantesTotales,
              backgroundColor: degradado,
              hoverOffset: 4,
            },
          ],
        };

        doc.addPage();

        let imgData = await generarGraficaPastel(datos);
        doc.addImage(imgData, "PNG", 0, 40, 290, 130);

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text(`Distribución por Descripción - ${nombreMes}`, 150, 20, {
          align: "center",
        });

        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text("* Solo se muestran los valores mayores al 5%", 225, 205);
      }
    }
  }

  if (esMensual === false) {
    // AGREGAMOS EL CONCENTRADO GENERAL
    let filasConcentrado = [];
    let contadorTotalCantidad = 0;
    let contadorSubTotal = 0;
    let contadorTotalTranslados = 0;
    let contadorTotalRetenciones = 0;
    let contadorTotal = 0;

    for (let [descripcion, datos] of Object.entries(concentradoGeneral)) {
      const fila = [
        descripcion,
        formatoCantidadMiles(datos.totalCantidad),
        formatoNumerico(datos.subTotal),
        formatoNumerico(datos.totalTraslados),
        formatoNumerico(datos.totalRetenciones),
        formatoNumerico(datos.total),
      ];

      contadorTotalCantidad += datos.totalCantidad;
      contadorSubTotal += datos.subTotal;
      contadorTotalTranslados += datos.totalTraslados;
      contadorTotalRetenciones += datos.totalRetenciones;
      contadorTotal += datos.total;

      filasConcentrado.push(fila);
    }

    filasConcentrado.push([
      "Total",
      formatoCantidadMiles(contadorTotalCantidad),
      formatoNumerico(contadorSubTotal),
      formatoNumerico(contadorTotalTranslados),
      formatoNumerico(contadorTotalRetenciones),
      formatoNumerico(contadorTotal),
    ]);

    if (contadorTotal === 0) return;

    doc.addPage();

    const headerConcentrado = [
      "Descripción",
      "Total Cantidad",
      "SubTotal",
      "Total Impuesto Transladados",
      "Total Impuesto Retenidos",
      "Total",
    ];

    doc.autoTable({
      head: [headerConcentrado],
      body: [...filasConcentrado],
      startY: 10,
      startX: 10,
      margin: { left: 20, right: 10 },
      theme: "grid",
      headStyles: {
        fillColor: colores.primario,
        textColor: [255, 255, 255],
        fontSize: 10,
      },
      columnStyles: {
        0: { halign: "left" },
        1: { halign: "left" },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "right" },
      },
      didParseCell: function (data) {
        if (data.section === "head") {
          if (data.column.index <= 1) {
            data.cell.styles.halign = "left";
          } else {
            data.cell.styles.halign = "right";
          }
        }

        if (data.section === "body") {
          if (data.column.index <= 1) {
            data.cell.styles.halign = "left";
          } else {
            data.cell.styles.halign = "right";
          }

          if (data.row.index === filasConcentrado.length - 1) {
            data.cell.styles.fillColor = colores.secundario;
            data.cell.styles.textColor = [0, 0, 0];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
      didDrawPage: function (data) {
        agregarPaginaSeccion(
          doc,
          `${titulo} - CONCENTRADO`,
          colores.primario,
          "consumo_combustible"
        );
      },
    });

    // Verificamos que haya datos para generar la grafica del concentrado
    if (filasConcentrado.length > 1) {
      // Más de 1 porque incluye la fila de total
      const datosSinTotal = filasConcentrado.slice(
        0,
        filasConcentrado.length - 1
      );

      const listaRfc = datosSinTotal.map((fila) => fila[0]); // Primera columna (RFC)
      const listaTotales = datosSinTotal.map((fila) => {
        // Convertir de string formateado a número
        const totalStr = fila[5];
        return parseFloat(totalStr.replace(/[^\d.-]/g, "")) || 0;
      });

      // Solo generamos la grafica si hay valores mayores a cero
      if (listaTotales.some((valor) => valor > 0)) {
        const degradado = generarDegradadoHex(
          rgbToHex(colores.primario),
          rgbToHex(colores.secundario),
          listaRfc.length
        );

        const datos = {
          labels: listaRfc,
          datasets: [
            {
              data: listaTotales,
              backgroundColor: degradado,
              hoverOffset: 4,
            },
          ],
        };

        doc.addPage();

        let imgData = await generarGraficaPastel(datos);
        doc.addImage(imgData, "PNG", 0, 40, 300, 140);

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text("Distribución de Totales por Descripción", 150, 20, {
          align: "center",
        });

        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text("* Solo se muestran los valores mayores al 5%", 225, 205);
      }
    }
  }
};

/**
 * Generar pagina para reporte notas sin relacion
 * @param {jsPDF} doc - Documento PDF
 * @param {Object} colores - Colores para la seccion
 * @param {string} titulo - Titulo para la seccion
 * @param {Object} contenido - Contenido de la seccion
 */
const agregarPaginaNotasSinRelacion = async (
  doc,
  colores,
  titulo,
  contenido,
  esMensual
) => {
  const header = [
    "Folio",
    "Folio Fiscal",
    "RFC",
    "Nombre",
    "Método de Pago",
    "Forma de Pago",
    "SubTotal",
    "Total Impuesto Transladados",
    "Total Impuesto Retenidos",
    "Total",
  ];

  let concentradoGeneral = {};

  for (let [nombreMes, arregloDatos] of Object.entries(contenido)) {
    let filas = [];
    let contadorSubTotal = 0;
    let contadorTotalImpuestosTransladados = 0;
    let contadorTotalImpuestosRetenidos = 0;
    let contadorTotal = 0;

    const datosGraficaMensual = {};

    for (const dato of arregloDatos) {
      // CONCENTRADO MENSUAL

      const subTotal = dato.subTotal || 0;
      const total = dato.total || 0;
      const totalImpuestosTransladados = dato.totalImpuestosTrasladados || 0;
      const totalImpuestosRetenidos = dato.totalImpuestosRetenidos || 0;

      const fila = [
        dato.folio || "N/A",
        dato.folioFiscal || "N/A",
        dato.rfc || "N/A",
        dato.nombre || "N/A",
        dato.metodoPago || "N/A",
        dato.formaPago || "N/A",
        formatoNumerico(subTotal),
        formatoNumerico(totalImpuestosTransladados),
        formatoNumerico(totalImpuestosRetenidos),
        formatoNumerico(total),
      ];

      contadorSubTotal += subTotal;
      contadorTotalImpuestosTransladados += totalImpuestosTransladados;
      contadorTotalImpuestosRetenidos += totalImpuestosRetenidos;
      contadorTotal += total;

      filas.push(fila);

      // DATOS PARA CONCENTRADO MENSUAL
      if (!datosGraficaMensual[dato.rfc]) {
        datosGraficaMensual[dato.rfc] = {
          rfc: dato.rfc,
          total: 0,
        };
      }

      datosGraficaMensual[dato.rfc].total += total;

      // DATOS PARA CONCENTRADO GENERAL

      if (!concentradoGeneral[dato.rfc]) {
        concentradoGeneral[dato.rfc] = {
          nombre: "N/A",
          subTotal: 0,
          totalImpuestosTransladados: 0,
          totalImpuestosRetenidos: 0,
          total: 0,
        };
      }

      concentradoGeneral[dato.rfc].nombre = dato.nombre;
      concentradoGeneral[dato.rfc].subTotal += subTotal;
      concentradoGeneral[dato.rfc].totalImpuestosTransladados +=
        totalImpuestosTransladados;
      concentradoGeneral[dato.rfc].totalImpuestosRetenidos +=
        totalImpuestosRetenidos;
      concentradoGeneral[dato.rfc].total += total;
    }

    // AGREGAMOS TOTALES
    filas.push([
      "Total",
      "",
      "",
      "",
      "",
      "",
      formatoNumerico(contadorSubTotal),
      formatoNumerico(contadorTotalImpuestosTransladados),
      formatoNumerico(contadorTotalImpuestosRetenidos),
      formatoNumerico(contadorTotal),
    ]);

    // CONDICION DE RENDERIZADO
    if (contadorTotal === 0) continue;

    doc.addPage();
    doc.setFontSize(10);

    doc.autoTable({
      head: [header],
      body: [...filas],
      bodyStyles: {
        fontSize: 8,
      },
      startY: 10,
      startX: 10,
      margin: { left: 20, right: 10 },
      theme: "grid",
      headStyles: {
        fillColor: colores.primario,
        textColor: [255, 255, 255],
        fontSize: 8,
      },
      columnStyles: {
        // 1: { halign: "left" },
        // 2: { halign: "left" },
        // 3: { halign: "left" },
        // 4: { halign: "right" },
        // 5: { halign: "right" },
      },
      didParseCell: function (data) {
        if (data.section === "head" || data.section === "body") {
          if (data.column.index <= 6) {
            data.cell.styles.halign = "left";
          } else {
            data.cell.styles.halign = "right";
          }
        }

        if (data.section === "body" && data.row.index === filas.length - 1) {
          data.cell.styles.fillColor = colores.secundario;
          data.cell.styles.textColor = [0, 0, 0];
          data.cell.styles.fontStyle = "bold";
        }
      },
      didDrawPage: function (data) {
        agregarPaginaSeccion(
          doc,
          `${titulo} - ${nombreMes}`,
          colores.primario,
          "notas_sin_relacion"
        );
      },
    });

    // Generar la grafica agrupada por RFC
    if (Object.keys(datosGraficaMensual).length > 1) {
      const listaRfc = Object.keys(datosGraficaMensual);
      const listaComprobantesTotales = listaRfc.map(
        (rfc) => datosGraficaMensual[rfc].total
      );

      // Solo generamos la grafica si hay comprobantes
      if (listaComprobantesTotales.some((valor) => valor > 0)) {
        const degradado = generarDegradadoHex(
          rgbToHex(colores.primario),
          rgbToHex(colores.secundario),
          listaRfc.length
        );

        const datos = {
          labels: listaRfc,
          datasets: [
            {
              data: listaComprobantesTotales,
              backgroundColor: degradado,
              hoverOffset: 4,
            },
          ],
        };

        doc.addPage();

        let imgData = await generarGraficaPastel(datos);
        doc.addImage(imgData, "PNG", 0, 40, 290, 130);

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text(`Distribución por RFC - ${nombreMes}`, 150, 20, {
          align: "center",
        });

        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text("* Solo se muestran los valores mayores al 5%", 225, 205);
      }
    }
  }

  if (esMensual === false) {
    // AGREGAMOS EL CONCENTRADO GENERAL
    let filasConcentrado = [];
    let contadorSubTotal = 0;
    let contadorTotalImpuestosTransladados = 0;
    let contadorTotalImpuestosRetenidos = 0;
    let contadorTotal = 0;

    for (let [rfc, datos] of Object.entries(concentradoGeneral)) {
      const fila = [
        rfc,
        datos.nombre,
        formatoNumerico(datos.subTotal),
        formatoNumerico(datos.totalImpuestosTransladados),
        formatoNumerico(datos.totalImpuestosRetenidos),
        formatoNumerico(datos.total),
      ];

      contadorSubTotal += datos.subTotal;
      contadorTotalImpuestosTransladados += datos.totalImpuestosTransladados;
      contadorTotalImpuestosRetenidos += datos.totalImpuestosRetenidos;
      contadorTotal += datos.total;

      filasConcentrado.push(fila);
    }

    filasConcentrado.push([
      "Total",
      "",
      formatoNumerico(contadorSubTotal),
      formatoNumerico(contadorTotalImpuestosTransladados),
      formatoNumerico(contadorTotalImpuestosRetenidos),
      formatoNumerico(contadorTotal),
    ]);

    if (contadorTotal === 0) return;

    doc.addPage();

    const headerConcentrado = [
      "RFC",
      "Nombre",
      "SubTotal",
      "Total Impuesto Transladados",
      "Total Impuesto Retenidos",
      "Total",
    ];

    doc.autoTable({
      head: [headerConcentrado],
      body: [...filasConcentrado],
      startY: 10,
      startX: 10,
      margin: { left: 20, right: 10 },
      theme: "grid",
      headStyles: {
        fillColor: colores.primario,
        textColor: [255, 255, 255],
        fontSize: 10,
      },
      columnStyles: {
        0: { halign: "left" },
        1: { halign: "left" },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "right" },
      },
      didParseCell: function (data) {
        if (data.section === "head") {
          if (data.column.index <= 1) {
            data.cell.styles.halign = "left";
          } else {
            data.cell.styles.halign = "right";
          }
        }

        if (data.section === "body") {
          if (data.column.index <= 1) {
            data.cell.styles.halign = "left";
          } else {
            data.cell.styles.halign = "right";
          }

          if (data.row.index === filasConcentrado.length - 1) {
            data.cell.styles.fillColor = colores.secundario;
            data.cell.styles.textColor = [0, 0, 0];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
      didDrawPage: function (data) {
        agregarPaginaSeccion(
          doc,
          `${titulo} - CONCENTRADO`,
          colores.primario,
          "notas_sin_relacion"
        );
      },
    });

    // Verificamos que haya datos para generar la grafica del concentrado
    if (filasConcentrado.length > 1) {
      // Más de 1 porque incluye la fila de total
      const datosSinTotal = filasConcentrado.slice(
        0,
        filasConcentrado.length - 1
      );

      const listaRfc = datosSinTotal.map((fila) => fila[0]); // Primera columna (RFC)
      const listaTotales = datosSinTotal.map((fila) => {
        // Convertir de string formateado a número
        const totalStr = fila[5];
        return parseFloat(totalStr.replace(/[^\d.-]/g, "")) || 0;
      });

      // Solo generamos la grafica si hay valores mayores a cero
      if (listaTotales.some((valor) => valor > 0)) {
        const degradado = generarDegradadoHex(
          rgbToHex(colores.primario),
          rgbToHex(colores.secundario),
          listaRfc.length
        );

        const datos = {
          labels: listaRfc,
          datasets: [
            {
              data: listaTotales,
              backgroundColor: degradado,
              hoverOffset: 4,
            },
          ],
        };

        doc.addPage();

        let imgData = await generarGraficaPastel(datos);
        doc.addImage(imgData, "PNG", 0, 40, 300, 140);

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text("Distribución de Totales por RFC", 150, 20, {
          align: "center",
        });

        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text("* Solo se muestran los valores mayores al 5%", 225, 205);
      }
    }
  }
};

/**
 * Generar pagina para reporte de pagos fuera de tiempo
 * @param {jsPDF} doc - Documento PDF
 * @param {Object} colores - Colores para la seccion
 * @param {string} titulo - Titulo para la seccion
 * @param {Object} contenido - Contenido de la seccion
 */
const agregarPaginaPagoFueraDeTiempo = async (
  doc,
  colores,
  titulo,
  contenido,
  esMensual
) => {
  const header = [
    "Folio",
    "ID Documento",
    "Folio Fiscal",
    "Fecha",
    "Fecha de Pago",
    "RFC",
    "Nombre",
    "Importe Pagado",
  ];

  let concentradoGeneral = {};

  for (let [nombreMes, arregloDatos] of Object.entries(contenido)) {
    let filas = [];
    let contadorImpPagado = 0;

    const datosGraficaMensual = {};

    for (const dato of arregloDatos) {
      // CONCENTRADO MENSUAL

      const impPagado = dato.impPagado || 0;
      const fecha = dato.fecha ? formatoFechaSinHora(dato.fecha) : "N/A";
      const fechaPago = dato.fecha
        ? formatoFechaSinHora(dato.fechaPago)
        : "N/A";

      const fila = [
        dato.folio || "N/A",
        dato.idDocumento || "N/A",
        dato.folioFiscal || "N/A",
        fecha,
        fechaPago,
        dato.rfc || "N/A",
        dato.nombre || "N/A",
        formatoNumerico(impPagado),
      ];

      contadorImpPagado += impPagado;

      filas.push(fila);

      // DATOS PARA CONCENTRADO MENSUAL
      if (!datosGraficaMensual[dato.rfc]) {
        datosGraficaMensual[dato.rfc] = {
          rfc: dato.rfc,
          impPagado: 0,
        };
      }

      datosGraficaMensual[dato.rfc].impPagado += impPagado;

      // DATOS PARA CONCENTRADO GENERAL

      if (!concentradoGeneral[dato.rfc]) {
        concentradoGeneral[dato.rfc] = {
          nombre: "N/A",
          impPagado: 0,
        };
      }

      concentradoGeneral[dato.rfc].nombre = dato.nombre;
      concentradoGeneral[dato.rfc].impPagado += impPagado;
    }

    // AGREGAMOS TOTALES
    filas.push([
      "Total",
      "",
      "",
      "",
      "",
      "",
      "",
      formatoNumerico(contadorImpPagado),
    ]);

    // CONDICION DE RENDERIZADO
    if (contadorImpPagado === 0) continue;

    doc.addPage();
    doc.setFontSize(10);

    doc.autoTable({
      head: [header],
      body: [...filas],
      startY: 10,
      startX: 10,
      margin: { left: 20, right: 10 },
      theme: "grid",
      headStyles: {
        fillColor: colores.primario,
        textColor: [255, 255, 255],
      },
      styles: {
        fontSize: 8,
      },
      columnStyles: {
        1: { halign: "left" },
        2: { halign: "left" },
        3: { halign: "left" },
        4: { halign: "right" },
        5: { halign: "right" },
      },
      didParseCell: function (data) {
        if (data.section === "head" || data.section === "body") {
          if (data.column.index <= 7) {
            data.cell.styles.halign = "left";
          } else {
            data.cell.styles.halign = "right";
          }
        }

        if (data.section === "body" && data.row.index === filas.length - 1) {
          data.cell.styles.fillColor = colores.secundario;
          data.cell.styles.textColor = [0, 0, 0];
          data.cell.styles.fontStyle = "bold";
        }
      },
      didDrawPage: function (data) {
        agregarPaginaSeccion(
          doc,
          `${titulo} - ${nombreMes}`,
          colores.primario,
          "pagos_fuera_tiempo_emitidos"
        );
      },
    });

    // Generar la grafica agrupada por RFC
    if (Object.keys(datosGraficaMensual).length > 1) {
      const listaRfc = Object.keys(datosGraficaMensual);
      const listaComprobantesTotales = listaRfc.map(
        (rfc) => datosGraficaMensual[rfc].impPagado
      );

      // Solo generamos la grafica si hay comprobantes
      if (listaComprobantesTotales.some((valor) => valor > 0)) {
        const degradado = generarDegradadoHex(
          rgbToHex(colores.primario),
          rgbToHex(colores.secundario),
          listaRfc.length
        );

        const datos = {
          labels: listaRfc,
          datasets: [
            {
              data: listaComprobantesTotales,
              backgroundColor: degradado,
              hoverOffset: 4,
            },
          ],
        };

        doc.addPage();

        let imgData = await generarGraficaPastel(datos);
        doc.addImage(imgData, "PNG", 0, 40, 290, 130);

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text(`Distribución por RFC - ${nombreMes}`, 150, 20, {
          align: "center",
        });

        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text("* Solo se muestran los valores mayores al 5%", 225, 205);
      }
    }
  }

  if (esMensual === false) {
    // AGREGAMOS EL CONCENTRADO GENERAL
    let filasConcentrado = [];
    let contadorImpPagado = 0;

    for (let [rfc, datos] of Object.entries(concentradoGeneral)) {
      const fila = [rfc, datos.nombre, formatoNumerico(datos.impPagado)];

      contadorImpPagado += datos.impPagado;

      filasConcentrado.push(fila);
    }

    filasConcentrado.push(["Total", "", formatoNumerico(contadorImpPagado)]);

    if (contadorImpPagado === 0) return;

    doc.addPage();

    const headerConcentrado = ["RFC", "Nombre", "Importe Pagado"];

    doc.autoTable({
      head: [headerConcentrado],
      body: [...filasConcentrado],
      startY: 10,
      startX: 10,
      margin: { left: 20, right: 10 },
      theme: "grid",
      headStyles: {
        fillColor: colores.primario,
        textColor: [255, 255, 255],
        fontSize: 10,
      },
      columnStyles: {
        0: { halign: "left" },
        1: { halign: "left" },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "right" },
      },
      didParseCell: function (data) {
        if (data.section === "head") {
          if (data.column.index <= 1) {
            data.cell.styles.halign = "left";
          } else {
            data.cell.styles.halign = "right";
          }
        }

        if (data.section === "body") {
          if (data.column.index <= 1) {
            data.cell.styles.halign = "left";
          } else {
            data.cell.styles.halign = "right";
          }

          if (data.row.index === filasConcentrado.length - 1) {
            data.cell.styles.fillColor = colores.secundario;
            data.cell.styles.textColor = [0, 0, 0];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
      didDrawPage: function (data) {
        agregarPaginaSeccion(
          doc,
          `${titulo} - CONCENTRADO`,
          colores.primario,
          "pagos_fuera_tiempo_emitidos"
        );
      },
    });

    // Verificamos que haya datos para generar la grafica del concentrado
    if (filasConcentrado.length > 1) {
      // Más de 1 porque incluye la fila de total
      const datosSinTotal = filasConcentrado.slice(
        0,
        filasConcentrado.length - 1
      );

      const listaRfc = datosSinTotal.map((fila) => fila[0]); // Primera columna (RFC)
      const listaTotales = datosSinTotal.map((fila) => {
        // Convertir de string formateado a número
        const totalStr = fila[2];
        return parseFloat(totalStr.replace(/[^\d.-]/g, "")) || 0;
      });

      // Solo generamos la grafica si hay valores mayores a cero
      if (listaTotales.some((valor) => valor > 0)) {
        const degradado = generarDegradadoHex(
          rgbToHex(colores.primario),
          rgbToHex(colores.secundario),
          listaRfc.length
        );

        const datos = {
          labels: listaRfc,
          datasets: [
            {
              data: listaTotales,
              backgroundColor: degradado,
              hoverOffset: 4,
            },
          ],
        };

        doc.addPage();

        let imgData = await generarGraficaPastel(datos);
        doc.addImage(imgData, "PNG", 0, 40, 300, 140);

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text("Distribución de Importes Pagados por RFC", 150, 20, {
          align: "center",
        });

        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text("* Solo se muestran los valores mayores al 5%", 225, 205);
      }
    }
  }
};

/**
 * Generar pagina para reporte de pagos fuera de tiempo
 * @param {jsPDF} doc - Documento PDF
 * @param {Object} colores - Colores para la seccion
 * @param {string} titulo - Titulo para la seccion
 * @param {Object} contenido - Contenido de la seccion
 */
const agregarPaginaPagoAntesDeComprobante = async (
  doc,
  colores,
  titulo,
  contenido,
  esMensual
) => {
  const header = [
    "Folio",
    "ID Documento",
    "Folio Fiscal",
    "Fecha",
    "Fecha de Pago",
    "RFC",
    "Nombre",
    "Importe Pagado",
  ];

  let concentradoGeneral = {};

  for (let [nombreMes, arregloDatos] of Object.entries(contenido)) {
    let filas = [];
    let contadorImpPagado = 0;

    const datosGraficaMensual = {};

    for (const dato of arregloDatos) {
      // CONCENTRADO MENSUAL

      const impPagado = dato.impPagado || 0;
      const fecha = dato.fecha ? formatoFechaSinHora(dato.fecha) : "N/A";
      const fechaPago = dato.fechaPago
        ? formatoFechaSinHora(dato.fechaPago)
        : "N/A";

      const fila = [
        dato.folio || "N/A",
        dato.idDocumento || "N/A",
        dato.folioFiscal || "N/A",
        fecha,
        fechaPago,
        dato.rfc || "N/A",
        dato.nombre || "N/A",
        formatoNumerico(impPagado),
      ];

      contadorImpPagado += impPagado;

      filas.push(fila);

      // DATOS PARA CONCENTRADO MENSUAL
      if (!datosGraficaMensual[dato.rfc]) {
        datosGraficaMensual[dato.rfc] = {
          rfc: dato.rfc,
          impPagado: 0,
        };
      }

      datosGraficaMensual[dato.rfc].impPagado += impPagado;

      // DATOS PARA CONCENTRADO GENERAL

      if (!concentradoGeneral[dato.rfc]) {
        concentradoGeneral[dato.rfc] = {
          nombre: "N/A",
          impPagado: 0,
        };
      }

      concentradoGeneral[dato.rfc].nombre = dato.nombre;
      concentradoGeneral[dato.rfc].impPagado += impPagado;
    }

    // AGREGAMOS TOTALES
    filas.push([
      "Total",
      "",
      "",
      "",
      "",
      "",
      "",
      formatoNumerico(contadorImpPagado),
    ]);

    // CONDICION DE RENDERIZADO
    if (contadorImpPagado === 0) continue;

    doc.addPage();
    doc.setFontSize(10);

    doc.autoTable({
      head: [header],
      body: [...filas],
      bodyStyles: {
        fontSize: 8,
      },
      startY: 10,
      startX: 10,
      margin: { left: 20, right: 10 },
      theme: "grid",
      headStyles: {
        fillColor: colores.primario,
        textColor: [255, 255, 255],
        fontSize: 8,
      },
      columnStyles: {
        1: { halign: "left" },
        2: { halign: "left" },
        3: { halign: "left" },
        4: { halign: "right" },
        5: { halign: "right" },
      },
      didParseCell: function (data) {
        if (data.section === "head" || data.section === "body") {
          if (data.column.index <= 7) {
            data.cell.styles.halign = "left";
          } else {
            data.cell.styles.halign = "right";
          }
        }

        if (data.section === "body" && data.row.index === filas.length - 1) {
          data.cell.styles.fillColor = colores.secundario;
          data.cell.styles.textColor = [0, 0, 0];
          data.cell.styles.fontStyle = "bold";
        }
      },
      didDrawPage: function (data) {
        agregarPaginaSeccion(
          doc,
          `${titulo} - ${nombreMes}`,
          colores.primario,
          "pagos_antes_comprobante_emitidos"
        );
      },
    });
  }

  if (esMensual === false) {
    // AGREGAMOS EL CONCENTRADO GENERAL
    let filasConcentrado = [];
    let contadorImpPagado = 0;

    for (let [rfc, datos] of Object.entries(concentradoGeneral)) {
      const fila = [rfc, datos.nombre, formatoNumerico(datos.impPagado)];

      contadorImpPagado += datos.impPagado;

      filasConcentrado.push(fila);
    }

    filasConcentrado.push(["Total", "", formatoNumerico(contadorImpPagado)]);

    if (contadorImpPagado === 0) return;

    doc.addPage();

    const headerConcentrado = ["RFC", "Nombre", "Importe Pagado"];

    doc.autoTable({
      head: [headerConcentrado],
      body: [...filasConcentrado],
      startY: 10,
      startX: 10,
      margin: { left: 20, right: 10 },
      theme: "grid",
      headStyles: {
        fillColor: colores.primario,
        textColor: [255, 255, 255],
        fontSize: 10,
      },
      columnStyles: {
        0: { halign: "left" },
        1: { halign: "left" },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "right" },
      },
      didParseCell: function (data) {
        if (data.section === "head") {
          if (data.column.index <= 1) {
            data.cell.styles.halign = "left";
          } else {
            data.cell.styles.halign = "right";
          }
        }

        if (data.section === "body") {
          if (data.column.index <= 1) {
            data.cell.styles.halign = "left";
          } else {
            data.cell.styles.halign = "right";
          }

          if (data.row.index === filasConcentrado.length - 1) {
            data.cell.styles.fillColor = colores.secundario;
            data.cell.styles.textColor = [0, 0, 0];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
      didDrawPage: function (data) {
        agregarPaginaSeccion(
          doc,
          `${titulo} - CONCENTRADO`,
          colores.primario,
          "pagos_antes_comprobante_emitidos"
        );
      },
    });
  }
};

/**
 * Generar pagina para nomina duplicada
 * @param {jsPDF} doc - Documento PDF
 * @param {Object} colores - Colores para la seccion
 * @param {string} titulo - Titulo para la seccion
 * @param {Object} contenido - Contenido de la seccion
 */
const agregarPaginanNominaDuplicada = async (
  doc,
  colores,
  titulo,
  contenido,
  esMensual
) => {
  const header = [
    "Serie",
    "Folio",
    "Folio Fiscal",
    "RFC",
    "Nombre",
    "Fecha Inicial Pago",
    "Fecha Final Pago",
    "Tipo Nomina",
    "Gravado",
    "Exento",
    "ISR",
    "Deduccion",
    "Otros Pagos",
    "Total",
  ];

  let concentradoGeneral = {};

  for (let [nombreMes, arregloDatos] of Object.entries(contenido)) {
    let filas = [];

    let contadorGravado = 0;
    let contadorExento = 0;
    let contadorIsr = 0;
    let contadorDeducciones = 0;
    let contadorOtrosPagos = 0;
    let contadorTotal = 0;

    const datosGraficaMensual = {};

    for (const dato of arregloDatos) {
      // CONCENTRADO MENSUAL

      const gravado = dato.gravado || 0;
      const exento = dato.exento || 0;
      const isr = dato.isr || 0;
      const deduccion = dato.deduccion || 0;
      const otrosPagos = dato.otrosPagos || 0;
      const total = dato.total || 0;
      const fechaInicialPago = dato.fechaInicialPago
        ? formatoFechaSinHora(dato.fechaInicialPago)
        : "N/A";
      const fechaFinalPago = dato.fechaFinalPago
        ? formatoFechaSinHora(dato.fechaFinalPago)
        : "N/A";

      const fila = [
        dato.serie || "N/A",
        dato.folio || "N/A",
        dato.folioFiscal || "N/A",
        dato.rfc || "N/A",
        dato.nombre || "N/A",
        fechaInicialPago,
        fechaFinalPago,
        dato.tipoNomina || "N/A",
        formatoNumerico(gravado),
        formatoNumerico(exento),
        formatoNumerico(isr),
        formatoNumerico(deduccion),
        formatoNumerico(otrosPagos),
        formatoNumerico(total),
      ];

      contadorGravado += gravado;
      contadorExento += exento;
      contadorIsr += isr;
      contadorDeducciones += deduccion;
      contadorOtrosPagos += otrosPagos;
      contadorTotal += total;

      filas.push(fila);

      // DATOS PARA CONCENTRADO MENSUAL
      if (!datosGraficaMensual[dato.rfc]) {
        datosGraficaMensual[dato.rfc] = {
          rfc: dato.rfc,
          total: 0,
        };
      }

      datosGraficaMensual[dato.rfc].total += total;

      // DATOS PARA CONCENTRADO GENERAL

      if (!concentradoGeneral[dato.rfc]) {
        concentradoGeneral[dato.rfc] = {
          nombre: "N/A",
          gravado: 0,
          exento: 0,
          isr: 0,
          deduccion: 0,
          otrosPagos: 0,
          total: 0,
        };
      }

      concentradoGeneral[dato.rfc].nombre = dato.nombre;
      concentradoGeneral[dato.rfc].gravado += gravado;
      concentradoGeneral[dato.rfc].exento += exento;
      concentradoGeneral[dato.rfc].isr += isr;
      concentradoGeneral[dato.rfc].deduccion += deduccion;
      concentradoGeneral[dato.rfc].otrosPagos += otrosPagos;
      concentradoGeneral[dato.rfc].total += total;
    }

    // AGREGAMOS TOTALES
    filas.push([
      "Total",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      formatoNumerico(contadorGravado),
      formatoNumerico(contadorExento),
      formatoNumerico(contadorIsr),
      formatoNumerico(contadorDeducciones),
      formatoNumerico(contadorOtrosPagos),
      formatoNumerico(contadorTotal),
    ]);

    // CONDICION DE RENDERIZADO
    if (contadorTotal === 0) continue;

    // await agregaSubPortada(doc, 15);

    doc.addPage();

    doc.autoTable({
      head: [header],
      body: [...filas],
      startY: 10,
      startX: 10,
      margin: { left: 20, right: 10 },
      theme: "grid",
      headStyles: {
        fillColor: colores.primario,
        textColor: [255, 255, 255],
      },
      styles: {
        // overflow: "linebreak",
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 13 }, // Serie
        1: { cellWidth: 13 }, // Folio
        2: { cellWidth: 20 }, // Folio Fiscal
        3: { cellWidth: 30 }, // RFC
        4: { cellWidth: 25 }, // Nombre
        5: { cellWidth: 20 }, // Fecha Inciial
        6: { cellWidth: 20 }, // Fecha final
        7: { cellWidth: 10 }, // Tipo Nomina
        8: { cellWidth: 20 }, // Gravado
        9: { cellWidth: 20 }, // Exento
        10: { cellWidth: 20 }, // Isr
        11: { cellWidth: 20 }, // Deduccion
        12: { cellWidth: 20 }, // Otros Pagos
        13: { cellWidth: 20 }, // Total
      },
      didParseCell: function (data) {
        if (data.section === "head" || data.section === "body") {
          if (data.column.index <= 6) {
            data.cell.styles.halign = "left";
          } else if (data.column.index === 7) {
            data.cell.styles.halign = "center";
          } else {
            data.cell.styles.halign = "right";
          }
        }

        if (data.section === "body" && data.row.index === filas.length - 1) {
          data.cell.styles.fillColor = colores.secundario;
          data.cell.styles.textColor = [0, 0, 0];
          data.cell.styles.fontStyle = "bold";
        }
      },
      didDrawPage: function (data) {
        agregarPaginaSeccion(
          doc,
          `${titulo} - ${nombreMes}`,
          colores.primario,
          "nomina_duplicada_o"
        );
      },
    });

    // Generar la grafica agrupada por RFC
    // if (Object.keys(datosGraficaMensual).length > 0) {
    //   const listaRfc = Object.keys(datosGraficaMensual);
    //   const listaComprobantesTotales = listaRfc.map(
    //     (rfc) => datosGraficaMensual[rfc].total
    //   );

    //   // Solo generamos la grafica si hay comprobantes
    //   if (listaComprobantesTotales.some((valor) => valor > 0)) {
    //     const degradado = generarDegradadoHex(
    //       rgbToHex(colores.primario),
    //       rgbToHex(colores.secundario),
    //       listaRfc.length
    //     );

    //     const datos = {
    //       labels: listaRfc,
    //       datasets: [
    //         {
    //           data: listaComprobantesTotales,
    //           backgroundColor: degradado,
    //           hoverOffset: 4,
    //         },
    //       ],
    //     };

    //     doc.addPage();

    //     let imgData = await generarGraficaPastel(datos);
    //     doc.addImage(imgData, "PNG", 0, 40, 290, 130);

    //     doc.setFontSize(16);
    //     doc.setTextColor(0, 0, 0);
    //     doc.text(`Distribución por RFC - ${nombreMes}`, 150, 20, {
    //       align: "center",
    //     });
    //   }
    // }
  }

  if (esMensual === false) {
    // AGREGAMOS EL CONCENTRADO GENERAL
    let filasConcentrado = [];

    let contadorGravado = 0;
    let contadorExento = 0;
    let contadorIsr = 0;
    let contadorDeducciones = 0;
    let contadorOtrosPagos = 0;
    let contadorTotal = 0;

    for (let [rfc, datos] of Object.entries(concentradoGeneral)) {
      const fila = [
        rfc,
        datos.nombre,
        formatoNumerico(datos.gravado),
        formatoNumerico(datos.exento),
        formatoNumerico(datos.isr),
        formatoNumerico(datos.deduccion),
        formatoNumerico(datos.otrosPagos),
        formatoNumerico(datos.total),
      ];

      contadorGravado += datos.gravado;
      contadorExento += datos.exento;
      contadorIsr += datos.isr;
      contadorDeducciones += datos.deduccion;
      contadorOtrosPagos += datos.otrosPagos;
      contadorTotal += datos.total;

      filasConcentrado.push(fila);
    }

    filasConcentrado.push([
      "Total",
      "",
      formatoNumerico(contadorGravado),
      formatoNumerico(contadorExento),
      formatoNumerico(contadorIsr),
      formatoNumerico(contadorDeducciones),
      formatoNumerico(contadorOtrosPagos),
      formatoNumerico(contadorTotal),
    ]);

    if (contadorTotal === 0) return;

    doc.addPage();

    const headerConcentrado = [
      "RFC",
      "Nombre",
      "Gravado",
      "Exento",
      "ISR",
      "Deduccion",
      "Otros Pagos",
      "Total",
    ];

    doc.autoTable({
      head: [headerConcentrado],
      body: [...filasConcentrado],
      startY: 10,
      startX: 10,
      margin: { left: 20, right: 10 },
      theme: "grid",
      headStyles: {
        fillColor: colores.primario,
        textColor: [255, 255, 255],
        fontSize: 10,
      },
      columnStyles: {
        0: { halign: "left" },
        1: { halign: "left" },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "right" },
      },
      didParseCell: function (data) {
        if (data.section === "head") {
          if (data.column.index <= 1) {
            data.cell.styles.halign = "left";
          } else {
            data.cell.styles.halign = "right";
          }
        }

        if (data.section === "body") {
          if (data.column.index <= 1) {
            data.cell.styles.halign = "left";
          } else {
            data.cell.styles.halign = "right";
          }

          if (data.row.index === filasConcentrado.length - 1) {
            data.cell.styles.fillColor = colores.secundario;
            data.cell.styles.textColor = [0, 0, 0];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
      didDrawPage: function (data) {
        agregarPaginaSeccion(
          doc,
          `${titulo} - CONCENTRADO`,
          colores.primario,
          "nomina_duplicada_o"
        );
      },
    });
  }
};

/**
 * Generar pagina para iva emitidos y recibidos en la misma hoja
 * @param {jsPDF} doc - Documento PDF
 * @param {Object} colores - Colores para la seccion
 * @param {string} titulo - Titulo para la seccion
 * @param {Object} contenido - Contenido de la seccion con datos de IVA emitidos y recibidos
 */
const agregarPaginaIvaRecibidos = async (
  doc,
  colores,
  titulo,
  contenido,
  esMensual
) => {
  const header = [
    "Concepto",
    "# Comprobantes",
    "Base IVA 16",
    "Importe IVA 16",
    "Base IVA 8",
    "Importe IVA 8",
    "Base IVA 0",
    "Importe IVA 0",
    "Base IVA Exento",
    "Importe IVA Exento",
  ];

  // Obtener todos los meses únicos de ambos conjuntos de datos
  const mesesEmitidos = Object.keys(contenido.ivaEmitidos || {});
  const mesesRecibidos = Object.keys(contenido.ivaRecibidos || {});
  const mesesUnicos = [...new Set([...mesesEmitidos, ...mesesRecibidos])];

  // Inicializar arrays para el concentrado correctamente
  const concentradoEmitidos = [];
  const concentradoRecibidos = [];

  // Procesar cada mes
  for (const mes of mesesUnicos) {
    const hayDatosEmitidos =
      contenido.ivaEmitidos &&
      contenido.ivaEmitidos[mes] &&
      contenido.ivaEmitidos[mes].length > 0;

    const hayDatosRecibidos =
      contenido.ivaRecibidos &&
      contenido.ivaRecibidos[mes] &&
      contenido.ivaRecibidos[mes].length > 0;

    if (!hayDatosEmitidos && !hayDatosRecibidos) {
      continue; // Saltar a la siguiente iteración si no hay datos
    }

    // await agregaSubPortada(doc, 16);

    doc.addPage();

    let posicionY = 25; // Posición inicial para la primera tabla

    // Variables para el concentrado por mes
    let totalComprobantesEmitidosMes = 0;
    let totalBaseEmitidosMes = 0;
    let totalImporteEmitidosMes = 0;

    let totalComprobantesRecibidosMes = 0;
    let totalBaseRecibidosMes = 0;
    let totalImporteRecibidosMes = 0;

    // PROCESAR DATOS EMITIDOS
    if (
      contenido.ivaEmitidos &&
      contenido.ivaEmitidos[mes] &&
      contenido.ivaEmitidos[mes].length > 0
    ) {
      const datosEmitidos = contenido.ivaEmitidos[mes];
      let filasEmitidos = [];

      let contadorComprobantesEmitidos = 0;
      let contadorBaseIva16Emitidos = 0;
      let contadorImporteIva16Emitidos = 0;
      let contadorBaseIva8Emitidos = 0;
      let contadorImporteIva8Emitidos = 0;
      let contadorBase0Emitidos = 0;
      let contadorImporteBase0Emitidos = 0;
      let contadorBaseExentoEmitidos = 0;
      let contadorImporteIvaExentoEmitidos = 0;

      // Procesar datos emitidos
      for (const dato of datosEmitidos) {
        const contador = dato.contador || 0;
        const baseIva16 = dato.baseIva16 || 0;
        const importeIva16 = dato.importeIva16 || 0;
        const baseIva8 = dato.baseIva8 || 0;
        const importeIva8 = dato.importeIva8 || 0;
        const baseIva0 = dato.baseIva0 || 0;
        const importeIva0 = dato.importeIva0 || 0;
        const baseIvaExento = dato.baseIvaExento || 0;
        const importeIvaExento = dato.importeIvaExento || 0;

        const fila = [
          dato.concepto || "N/A",
          contador,
          formatoNumerico(baseIva16),
          formatoNumerico(importeIva16),
          formatoNumerico(baseIva8),
          formatoNumerico(importeIva8),
          formatoNumerico(baseIva0),
          formatoNumerico(importeIva0),
          formatoNumerico(baseIvaExento),
          formatoNumerico(importeIvaExento),
        ];

        contadorComprobantesEmitidos += contador;
        contadorBaseIva16Emitidos += baseIva16;
        contadorImporteIva16Emitidos += importeIva16;
        contadorBaseIva8Emitidos += baseIva8;
        contadorImporteIva8Emitidos += importeIva8;
        contadorBase0Emitidos += baseIva0;
        contadorImporteBase0Emitidos += importeIva0;
        contadorBaseExentoEmitidos += baseIvaExento;
        contadorImporteIvaExentoEmitidos += importeIvaExento;

        filasEmitidos.push(fila);

        // Acumular para el concentrado mensual
        totalComprobantesEmitidosMes += contador;
        totalBaseEmitidosMes += baseIva16 + baseIva8 + baseIva0 + baseIvaExento;
        totalImporteEmitidosMes +=
          importeIva16 + importeIva8 + importeIva0 + importeIvaExento;
      }

      // Agregar fila de totales solo si hay datos
      if (filasEmitidos.length > 0) {
        filasEmitidos.push([
          "Total",
          contadorComprobantesEmitidos,
          formatoNumerico(contadorBaseIva16Emitidos),
          formatoNumerico(contadorImporteIva16Emitidos),
          formatoNumerico(contadorBaseIva8Emitidos),
          formatoNumerico(contadorImporteIva8Emitidos),
          formatoNumerico(contadorBase0Emitidos),
          formatoNumerico(contadorImporteBase0Emitidos),
          formatoNumerico(contadorBaseExentoEmitidos),
          formatoNumerico(contadorImporteIvaExentoEmitidos),
        ]);

        // Agregar título para la sección de emitidos
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text("IVA TRASLADADO", 20, posicionY - 5);

        // Crear tabla para emitidos
        doc.autoTable({
          head: [header],
          body: [...filasEmitidos],
          startY: posicionY,
          startX: 10,
          margin: { left: 20, right: 10 },
          theme: "grid",
          headStyles: {
            fillColor: colores.primario,
            textColor: [255, 255, 255],
            fontSize: 9,
          },
          styles: {
            overflow: "linebreak",
            fontSize: 8,
          },
          columnStyles: {
            0: { halign: "left" },
            1: { halign: "center" },
            2: { halign: "right" },
            3: { halign: "right" },
            4: { halign: "right" },
            5: { halign: "right" },
            6: { halign: "right" },
            7: { halign: "right" },
            8: { halign: "right" },
            9: { halign: "right" },
          },
          didParseCell: function (data) {
            if (
              data.section === "body" &&
              data.row.index === filasEmitidos.length - 1
            ) {
              data.cell.styles.fillColor = colores.secundario;
              data.cell.styles.textColor = [0, 0, 0];
              data.cell.styles.fontStyle = "bold";
            }
          },
          didDrawPage: function (data) {
            agregarPaginaSeccion(
              doc,
              `${titulo} - ${mes}`,
              colores.primario,
              "reporte_iva"
            );
          },
        });

        posicionY = doc.autoTable.previous.finalY + 15;
      }

      // Agregar datos al concentrado emitidos - UNA SOLA VEZ POR MES
      if (totalComprobantesEmitidosMes > 0) {
        concentradoEmitidos.push([
          mes,
          totalComprobantesEmitidosMes,
          totalBaseEmitidosMes,
          totalImporteEmitidosMes,
        ]);
      }
    }

    // PROCESAR DATOS RECIBIDOS
    if (
      contenido.ivaRecibidos &&
      contenido.ivaRecibidos[mes] &&
      contenido.ivaRecibidos[mes].length > 0
    ) {
      const datosRecibidos = contenido.ivaRecibidos[mes];
      let filasRecibidos = [];

      let contadorComprobantesRecibidos = 0;
      let contadorBaseIva16Recibidos = 0;
      let contadorImporteIva16Recibidos = 0;
      let contadorBaseIva8Recibidos = 0;
      let contadorImporteIva8Recibidos = 0;
      let contadorBase0Recibidos = 0;
      let contadorImporteBase0Recibidos = 0;
      let contadorBaseExentoRecibidos = 0;
      let contadorImporteIvaExentoRecibidos = 0;

      // Procesar datos recibidos
      for (const dato of datosRecibidos) {
        const contador = dato.contador || 0;
        const baseIva16 = dato.baseIva16 || 0;
        const importeIva16 = dato.importeIva16 || 0;
        const baseIva8 = dato.baseIva8 || 0;
        const importeIva8 = dato.importeIva8 || 0;
        const baseIva0 = dato.baseIva0 || 0;
        const importeIva0 = dato.importeIva0 || 0;
        const baseIvaExento = dato.baseIvaExento || 0;
        const importeIvaExento = dato.importeIvaExento || 0;

        const fila = [
          dato.concepto || "N/A",
          contador,
          formatoNumerico(baseIva16),
          formatoNumerico(importeIva16),
          formatoNumerico(baseIva8),
          formatoNumerico(importeIva8),
          formatoNumerico(baseIva0),
          formatoNumerico(importeIva0),
          formatoNumerico(baseIvaExento),
          formatoNumerico(importeIvaExento),
        ];

        contadorComprobantesRecibidos += contador;
        contadorBaseIva16Recibidos += baseIva16;
        contadorImporteIva16Recibidos += importeIva16;
        contadorBaseIva8Recibidos += baseIva8;
        contadorImporteIva8Recibidos += importeIva8;
        contadorBase0Recibidos += baseIva0;
        contadorImporteBase0Recibidos += importeIva0;
        contadorBaseExentoRecibidos += baseIvaExento;
        contadorImporteIvaExentoRecibidos += importeIvaExento;

        filasRecibidos.push(fila);

        // Acumular para el concentrado mensual
        totalComprobantesRecibidosMes += contador;
        totalBaseRecibidosMes +=
          baseIva16 + baseIva8 + baseIva0 + baseIvaExento;
        totalImporteRecibidosMes +=
          importeIva16 + importeIva8 + importeIva0 + importeIvaExento;
      }

      // Agregar fila de totales solo si hay datos
      if (filasRecibidos.length > 0) {
        filasRecibidos.push([
          "Total",
          contadorComprobantesRecibidos,
          formatoNumerico(contadorBaseIva16Recibidos),
          formatoNumerico(contadorImporteIva16Recibidos),
          formatoNumerico(contadorBaseIva8Recibidos),
          formatoNumerico(contadorImporteIva8Recibidos),
          formatoNumerico(contadorBase0Recibidos),
          formatoNumerico(contadorImporteBase0Recibidos),
          formatoNumerico(contadorBaseExentoRecibidos),
          formatoNumerico(contadorImporteIvaExentoRecibidos),
        ]);

        // Agregar título para la sección de recibidos
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text("IVA ACREDITADO", 20, posicionY - 5);

        // Crear tabla para recibidos
        doc.autoTable({
          head: [header],
          body: [...filasRecibidos],
          startY: posicionY,
          startX: 10,
          margin: { left: 20, right: 10 },
          theme: "grid",
          headStyles: {
            fillColor: colores.primario, // Usar colores diferentes para recibidos
            textColor: [255, 255, 255],
            fontSize: 9,
          },
          styles: {
            overflow: "linebreak",
            fontSize: 8,
          },
          columnStyles: {
            0: { halign: "left" },
            1: { halign: "center" },
            2: { halign: "right" },
            3: { halign: "right" },
            4: { halign: "right" },
            5: { halign: "right" },
            6: { halign: "right" },
            7: { halign: "right" },
            8: { halign: "right" },
            9: { halign: "right" },
          },
          didParseCell: function (data) {
            if (
              data.section === "body" &&
              data.row.index === filasRecibidos.length - 1
            ) {
              data.cell.styles.fillColor = colores.secundario;
              data.cell.styles.textColor = [0, 0, 0];
              data.cell.styles.fontStyle = "bold";
            }
          },
          didDrawPage: function (data) {
            agregarPaginaSeccion(
              doc,
              `${titulo} - ${mes}`,
              colores.primario,
              "reporte_iva"
            );
          },
        });
      }

      // Agregar datos al concentrado recibidos - UNA SOLA VEZ POR MES
      if (totalComprobantesRecibidosMes > 0) {
        concentradoRecibidos.push([
          mes,
          totalComprobantesRecibidosMes,
          totalBaseRecibidosMes,
          totalImporteRecibidosMes,
        ]);
      }
    }
  }

  if (esMensual === false) {
    // Solo mostrar la página de concentrado si hay datos
    if (concentradoEmitidos.length > 0 || concentradoRecibidos.length > 0) {
      // Preparar los datos del concentrado
      // Agregar fila de totales a los arrays de concentrado
      if (concentradoEmitidos.length > 0) {
        // Usar parseFloat para asegurar que estamos sumando números, no cadenas
        const totalContadorEmitidos = concentradoEmitidos.reduce(
          (sum, row) => sum + (typeof row[1] === "number" ? row[1] : 0),
          0
        );

        // Sumar directamente los valores de Base e Importe desde los datos mensuales detallados
        let totalBaseEmitidos = 0;
        let totalImporteEmitidos = 0;

        for (const mes of mesesUnicos) {
          if (contenido.ivaEmitidos && contenido.ivaEmitidos[mes]) {
            for (const dato of contenido.ivaEmitidos[mes]) {
              totalBaseEmitidos +=
                (dato.baseIva16 || 0) +
                (dato.baseIva8 || 0) +
                (dato.baseIva0 || 0) +
                (dato.baseIvaExento || 0);

              totalImporteEmitidos +=
                (dato.importeIva16 || 0) +
                (dato.importeIva8 || 0) +
                (dato.importeIva0 || 0) +
                (dato.importeIvaExento || 0);
            }
          }
        }

        concentradoEmitidos.push([
          "TOTAL",
          totalContadorEmitidos,
          totalBaseEmitidos,
          totalImporteEmitidos,
        ]);
      }

      if (concentradoRecibidos.length > 0) {
        // Usar parseFloat para asegurar que estamos sumando números, no cadenas
        const totalContadorRecibidos = concentradoRecibidos.reduce(
          (sum, row) => sum + (typeof row[1] === "number" ? row[1] : 0),
          0
        );

        // Sumar directamente los valores de Base e Importe desde los datos mensuales detallados
        let totalBaseRecibidos = 0;
        let totalImporteRecibidos = 0;

        for (const mes of mesesUnicos) {
          if (contenido.ivaRecibidos && contenido.ivaRecibidos[mes]) {
            for (const dato of contenido.ivaRecibidos[mes]) {
              totalBaseRecibidos +=
                (dato.baseIva16 || 0) +
                (dato.baseIva8 || 0) +
                (dato.baseIva0 || 0) +
                (dato.baseIvaExento || 0);

              totalImporteRecibidos +=
                (dato.importeIva16 || 0) +
                (dato.importeIva8 || 0) +
                (dato.importeIva0 || 0) +
                (dato.importeIvaExento || 0);
            }
          }
        }

        concentradoRecibidos.push([
          "TOTAL",
          totalContadorRecibidos,
          totalBaseRecibidos,
          totalImporteRecibidos,
        ]);
      }

      // Concentrado
      const headerConcentrado = [
        "Mes",
        "# Comprobantes",
        "Base IVA",
        "Importe IVA",
      ];

      doc.addPage();

      let posicionY = 25; // Posición inicial para la primera tabla

      // Solo mostrar la tabla de emitidos si hay datos
      if (concentradoEmitidos.length > 0) {
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text("IVA TRASLADADO - CONCENTRADO", 20, posicionY - 5);

        doc.autoTable({
          head: [headerConcentrado],
          body: concentradoEmitidos.map((row) => [
            row[0],
            row[1],
            formatoNumerico(row[2]),
            formatoNumerico(row[3]),
          ]),
          startY: posicionY,
          startX: 10,
          margin: { left: 20, right: 10 },
          theme: "grid",
          headStyles: {
            fillColor: colores.primario,
            textColor: [255, 255, 255],
            fontSize: 9,
          },
          styles: {
            overflow: "linebreak",
            fontSize: 8,
          },
          columnStyles: {
            0: { halign: "left" },
            1: { halign: "center" },
            2: { halign: "right" },
            3: { halign: "right" },
          },
          didParseCell: function (data) {
            if (
              data.section === "body" &&
              data.row.index === concentradoEmitidos.length - 1
            ) {
              data.cell.styles.fillColor = colores.secundario;
              data.cell.styles.textColor = [0, 0, 0];
              data.cell.styles.fontStyle = "bold";
            }
          },
          didDrawPage: function (data) {
            agregarPaginaSeccion(
              doc,
              `${titulo} - CONCENTRADO`,
              colores.primario,
              "reporte_iva"
            );
          },
        });

        posicionY = doc.autoTable.previous.finalY + 15;
      }

      // Solo mostrar la tabla de recibidos si hay datos
      if (concentradoRecibidos.length > 0) {
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text("IVA ACREDITADO - CONCENTRADO", 20, posicionY - 5);

        doc.autoTable({
          head: [headerConcentrado],
          body: concentradoRecibidos.map((row) => [
            row[0],
            row[1],
            formatoNumerico(row[2]),
            formatoNumerico(row[3]),
          ]),
          startY: posicionY,
          startX: 10,
          margin: { left: 20, right: 10 },
          theme: "grid",
          headStyles: {
            fillColor: colores.primario, // Usar colores diferentes para recibidos
            textColor: [255, 255, 255],
            fontSize: 9,
          },
          styles: {
            overflow: "linebreak",
            fontSize: 8,
          },
          columnStyles: {
            0: { halign: "left" },
            1: { halign: "center" },
            2: { halign: "right" },
            3: { halign: "right" },
          },
          didParseCell: function (data) {
            if (
              data.section === "body" &&
              data.row.index === concentradoRecibidos.length - 1
            ) {
              data.cell.styles.fillColor = colores.secundario;
              data.cell.styles.textColor = [0, 0, 0];
              data.cell.styles.fontStyle = "bold";
            }
          },
        });
      }
    }
  }
};

/**
 * Generar pagina para iva retenido
 * @param {jsPDF} doc - Documento PDF
 * @param {Object} colores - Colores para la seccion
 * @param {string} titulo - Titulo para la seccion
 * @param {Object} contenido - Contenido de la seccion
 */
const agregarPaginaIvaRet = async (
  doc,
  colores,
  titulo,
  contenido,
  esMensual
) => {
  const header = ["Concepto", "Base", "Importe"];

  let concentradoGeneral = {};

  for (let [nombreMes, arregloDatos] of Object.entries(contenido)) {
    let filas = [];

    let contadorBase = 0;
    let contadorImporte = 0;

    const datosGraficaMensual = {};

    for (const dato of arregloDatos) {
      // CONCENTRADO MENSUAL

      const base = dato.base_ || 0;
      const importe = dato.importe || 0;

      const fila = [
        dato.concepto || "N/A",
        formatoNumerico(base),
        formatoNumerico(importe),
      ];

      contadorBase += base;
      contadorImporte += importe;

      filas.push(fila);

      // DATOS PARA CONCENTRADO MENSUAL
      if (!datosGraficaMensual[dato.concepto]) {
        datosGraficaMensual[dato.concepto] = {
          concepto: dato.concepto,
          base: base,
          importe: importe,
        };
      }

      datosGraficaMensual[dato.concepto].importe += importe;

      // DATOS PARA CONCENTRADO GENERAL

      if (!concentradoGeneral[dato.concepto]) {
        concentradoGeneral[dato.concepto] = {
          concepto: dato.concepto,
          base: base,
          importe: importe,
        };
      }

      concentradoGeneral[dato.concepto].base += base;
      concentradoGeneral[dato.concepto].importe += importe;
    }

    // AGREGAMOS TOTALES
    filas.push([
      "Total",
      formatoNumerico(contadorBase),
      formatoNumerico(contadorImporte),
    ]);

    // CONDICION DE RENDERIZADO
    if (contadorBase === 0) continue;

    doc.addPage();

    doc.autoTable({
      head: [header],
      body: [...filas],
      startY: 10,
      startX: 10,
      margin: { left: 20, right: 10 },
      theme: "grid",
      headStyles: {
        fillColor: colores.primario,
        textColor: [255, 255, 255],
        fontSize: 10,
      },
      styles: {
        overflow: "linebreak",
      },
      columnStyles: {
        1: { halign: "left" },
        2: { halign: "left" },
        3: { halign: "left" },
        4: { halign: "right" },
        5: { halign: "right" },
      },
      didParseCell: function (data) {
        if (data.section === "head") {
          if (data.column.index <= 9) {
            data.cell.styles.halign = "left";
          } else if (data.column.index === 10) {
            data.cell.styles.halign = "center";
          } else {
            data.cell.styles.halign = "right";
          }
        }

        if (data.section === "body") {
          if (data.column.index <= 9) {
            data.cell.styles.halign = "left";
          } else if (data.column.index === 10) {
            data.cell.styles.halign = "center";
          } else {
            data.cell.styles.halign = "right";
          }

          if (data.row.index === filas.length - 1) {
            data.cell.styles.fillColor = colores.secundario;
            data.cell.styles.textColor = [0, 0, 0];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
      didDrawPage: function (data) {
        agregarPaginaSeccion(
          doc,
          `${titulo} - ${nombreMes}`,
          colores.primario,
          "iva_retenido_emitidos"
        );
      },
    });

    // Generar la grafica agrupada por RFC
    if (Object.keys(datosGraficaMensual).length > 1) {
      const listaRfc = Object.keys(datosGraficaMensual);
      const listaComprobantesTotales = listaRfc.map(
        (concepto) => datosGraficaMensual[concepto].importe
      );

      // Solo generamos la grafica si hay comprobantes
      if (listaComprobantesTotales.some((valor) => valor > 0)) {
        const degradado = generarDegradadoHex(
          rgbToHex(colores.primario),
          rgbToHex(colores.secundario),
          listaRfc.length
        );

        const datos = {
          labels: listaRfc,
          datasets: [
            {
              data: listaComprobantesTotales,
              backgroundColor: degradado,
              hoverOffset: 4,
            },
          ],
        };

        doc.addPage();

        let imgData = await generarGraficaPastel(datos);
        doc.addImage(imgData, "PNG", 0, 40, 290, 130);

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text(`Distribución por RFC - ${nombreMes}`, 150, 20, {
          align: "center",
        });

        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text("* Solo se muestran los valores mayores al 5%", 225, 205);
      }
    }
  }

  // AGREGAMOS EL CONCENTRADO GENERAL
  let filasConcentrado = [];

  let contadorBase = 0;
  let contadorImporte = 0;

  for (let [concepto, datos] of Object.entries(concentradoGeneral)) {
    const fila = [
      concepto,
      formatoNumerico(datos.base),
      formatoNumerico(datos.importe),
    ];

    contadorBase += datos.base;
    contadorImporte += datos.importe;

    filasConcentrado.push(fila);
  }

  filasConcentrado.push([
    "Total",
    formatoNumerico(contadorBase),
    formatoNumerico(contadorImporte),
  ]);

  if (contadorBase === 0) return;
  if (esMensual === false) {
    doc.addPage();

    const headerConcentrado = ["Concepto", "Base", "Importe"];

    doc.autoTable({
      head: [headerConcentrado],
      body: [...filasConcentrado],
      startY: 10,
      startX: 10,
      margin: { left: 20, right: 10 },
      theme: "grid",
      headStyles: {
        fillColor: colores.primario,
        textColor: [255, 255, 255],
        fontSize: 10,
      },
      columnStyles: {
        0: { halign: "left" },
        1: { halign: "left" },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "right" },
      },
      didParseCell: function (data) {
        if (data.section === "head") {
          if (data.column.index <= 1) {
            data.cell.styles.halign = "left";
          } else {
            data.cell.styles.halign = "right";
          }
        }

        if (data.section === "body") {
          if (data.column.index <= 1) {
            data.cell.styles.halign = "left";
          } else {
            data.cell.styles.halign = "right";
          }

          if (data.row.index === filasConcentrado.length - 1) {
            data.cell.styles.fillColor = colores.secundario;
            data.cell.styles.textColor = [0, 0, 0];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
      didDrawPage: function (data) {
        agregarPaginaSeccion(
          doc,
          `${titulo} - CONCENTRADO`,
          colores.primario,
          "iva_retenido_emitidos"
        );
      },
    });

    // Verificamos que haya datos para generar la grafica del concentrado
    if (filasConcentrado.length > 1) {
      // Más de 1 porque incluye la fila de total
      const datosSinTotal = filasConcentrado.slice(
        0,
        filasConcentrado.length - 1
      );

      const listaRfc = datosSinTotal.map((fila) => fila[0]); // Primera columna (RFC)
      const listaTotales = datosSinTotal.map((fila) => {
        // Convertir de string formateado a número
        const totalStr = fila[1];
        return parseFloat(totalStr.replace(/[^\d.-]/g, "")) || 0;
      });

      // Solo generamos la grafica si hay valores mayores a cero
      if (listaTotales.some((valor) => valor > 0)) {
        const degradado = generarDegradadoHex(
          rgbToHex(colores.primario),
          rgbToHex(colores.secundario),
          listaRfc.length
        );

        const datos = {
          labels: listaRfc,
          datasets: [
            {
              data: listaTotales,
              backgroundColor: degradado,
              hoverOffset: 4,
            },
          ],
        };

        doc.addPage();

        let imgData = await generarGraficaPastel(datos);
        doc.addImage(imgData, "PNG", 0, 40, 300, 140);

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text("Distribución de Totales por base", 150, 20, {
          align: "center",
        });

        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text("* Solo se muestran los valores mayores al 5%", 225, 205);
      }
    }
  }
};

/**
 * Generar pagina para iva retenido
 * @param {jsPDF} doc - Documento PDF
 * @param {Object} colores - Colores para la seccion
 * @param {string} titulo - Titulo para la seccion
 * @param {Object} contenido - Contenido de la seccion
 */
const agregarPaginaIsrNomina = async (
  doc,
  colores,
  titulo,
  contenido,
  esMensual
) => {
  const header = ["Mes", "Sueldos", "Otros"];

  let filas = [];
  let datosGrafica = [];

  let contadorOtros = 0;
  let contadorSueldos = 0;

  for (let dato of contenido) {
    // CONCENTRADO MENSUAL
    const otros = dato.otros || 0;
    const sueldos = dato.sueldos || 0;

    const fila = [
      dato.mes || "N/A",
      formatoNumerico(sueldos),
      formatoNumerico(otros),
    ];

    contadorOtros += otros;
    contadorSueldos += sueldos;

    filas.push(fila);

    // Datos para la gráfica - añadimos las cifras sin formatear
    datosGrafica.push([dato.mes || "N/A", sueldos, otros]);
  }

  // AGREGAMOS TOTALES
  filas.push([
    "Total",
    formatoNumerico(contadorSueldos),
    formatoNumerico(contadorOtros),
  ]);

  // CONDICION DE RENDERIZADO
  if (contadorOtros === 0 && contadorSueldos === 0) return;

  doc.addPage();

  doc.autoTable({
    head: [header],
    body: [...filas],
    startY: 10,
    startX: 10,
    margin: { left: 20, right: 10 },
    theme: "grid",
    headStyles: {
      fillColor: colores.primario,
      textColor: [255, 255, 255],
      fontSize: 10,
    },
    styles: {
      overflow: "linebreak",
    },
    columnStyles: {
      1: { halign: "right" }, // Sueldos alineados a la derecha
      2: { halign: "right" }, // Otros alineados a la derecha
    },
    didParseCell: function (data) {
      if (data.section === "head") {
        if (data.column.index === 0) {
          data.cell.styles.halign = "left";
        } else {
          data.cell.styles.halign = "right";
        }
      }

      if (data.section === "body") {
        if (data.column.index === 0) {
          data.cell.styles.halign = "left";
        } else {
          data.cell.styles.halign = "right";
        }

        if (data.row.index === filas.length - 1) {
          data.cell.styles.fillColor = colores.secundario;
          data.cell.styles.textColor = [0, 0, 0];
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
    didDrawPage: function (data) {
      agregarPaginaSeccion(
        doc,
        `${titulo}`,
        colores.primario,
        "isr_nomina",
        "isr_nomina"
      );
    },
  });

  // Añadimos una gráfica de barras
  // doc.addPage();
  // agregarPaginaSeccion(doc, `${titulo} - GRÁFICA`, colores.primario);

  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("Distribución ISR por mes", 150, 135, {
    align: "center",
  });

  // Añadimos la gráfica de barras - usando los datos numéricos
  // Necesitamos una fila de totales para que la función generarGrafica funcione correctamente
  datosGrafica.push(["Total", 0, 0]);

  const opciones = {
    width: 600,
    height: 300,
    posX: 20,
    posY: 140,
    ancho: 120,
    alto: 60,
  };

  // Crear una gráfica para los sueldos
  await generarGrafica(
    doc,
    "bar",
    opciones,
    1,
    "Sueldos por mes",
    colores,
    datosGrafica
  );

  // Añadir una segunda gráfica para los "otros"
  opciones.posX = 150; // Colocarla más abajo
  await generarGrafica(
    doc,
    "bar",
    opciones,
    2,
    "Otros por mes",
    colores,
    datosGrafica
  );
};

/**
 * Generar pagina para iva retenido
 * @param {jsPDF} doc - Documento PDF
 * @param {Object} colores - Colores para la seccion
 * @param {string} titulo - Titulo para la seccion
 * @param {Object} contenido - Contenido de la seccion
 */
const agregarPaginaRetencionesIsr = async (
  doc,
  colores,
  titulo,
  contenido,
  esMensual
) => {
  const header = [
    "Mes",
    "Honorarios",
    "Arrendamiento",
    "Demás Ingresos",
    "Resico",
  ];

  const datosGraficaMensual = {};
  let filas = [];

  let contadorHonorarios = 0;
  let contadorArrendamiento = 0;
  let contadorDemasIngresos = 0;
  let contadorResico = 0;

  for (let dato of contenido) {
    // CONCENTRADO MENSUAL
    const honorarios = dato.honorarios || 0;
    const arrendamiento = dato.arrendamiento || 0;
    const demasIngresos = dato.demasIngresos || 0;
    const resico = dato.resico || 0;

    const fila = [
      dato.mes || "N/A",
      formatoNumerico(honorarios),
      formatoNumerico(arrendamiento),
      formatoNumerico(demasIngresos),
      formatoNumerico(resico),
    ];

    contadorHonorarios += honorarios;
    contadorArrendamiento += arrendamiento;
    contadorDemasIngresos += demasIngresos;
    contadorResico += resico;

    filas.push(fila);

    // DATOS PARA CONCENTRADO MENSUAL
    if (!datosGraficaMensual[dato.mes]) {
      datosGraficaMensual[dato.mes] = {
        mes: dato.mes,
        total: 0,
      };
    }

    datosGraficaMensual[dato.mes].total +=
      honorarios + arrendamiento + demasIngresos + resico;
  }

  // AGREGAMOS TOTALES
  filas.push([
    "Total",
    formatoNumerico(contadorHonorarios),
    formatoNumerico(contadorArrendamiento),
    formatoNumerico(contadorDemasIngresos),
    formatoNumerico(contadorResico),
  ]);

  // CONDICION DE RENDERIZADO
  if (
    contadorHonorarios +
    contadorArrendamiento +
    contadorResico +
    contadorDemasIngresos ==
    0
  )
    return;

  doc.addPage();

  doc.autoTable({
    head: [header],
    body: [...filas],
    startY: 10,
    startX: 10,
    margin: { left: 20, right: 10 },
    theme: "grid",
    headStyles: {
      fillColor: colores.primario,
      textColor: [255, 255, 255],
      fontSize: 10,
    },
    styles: {
      overflow: "linebreak",
    },
    columnStyles: {
      // 1: { halign: "left" },
      // 2: { halign: "left" },
      // 3: { halign: "left" },
      // 4: { halign: "right" },
      // 5: { halign: "right" },
    },
    didParseCell: function (data) {
      if (data.section === "head" || data.section === "body") {
        if (data.column.index === 0) {
          data.cell.styles.halign = "left";
        } else {
          data.cell.styles.halign = "right";
        }
      }

      if (data.section === "body" && data.row.index === filas.length - 1) {
        data.cell.styles.fillColor = colores.secundario;
        data.cell.styles.textColor = [0, 0, 0];
        data.cell.styles.fontStyle = "bold";
      }
    },
    didDrawPage: function (data) {
      agregarPaginaSeccion(doc, `${titulo}`, colores.primario);
    },
  });

  // if (filas.length < 2) return;

  // Generar la grafica agrupada por RFC
  if (Object.keys(datosGraficaMensual).length > 1) {
    const listaRfc = Object.keys(datosGraficaMensual);
    const listaComprobantesTotales = listaRfc.map(
      (mes) => datosGraficaMensual[mes].total
    );

    // Solo generamos la grafica si hay comprobantes
    if (listaComprobantesTotales.some((valor) => valor > 0)) {
      const degradado = generarDegradadoHex(
        rgbToHex(colores.primario),
        rgbToHex(colores.secundario),
        listaRfc.length
      );

      const datos = {
        labels: listaRfc,
        datasets: [
          {
            data: listaComprobantesTotales,
            backgroundColor: degradado,
            hoverOffset: 4,
          },
        ],
      };

      doc.addPage();

      let imgData = await generarGraficaPastel(datos);
      doc.addImage(imgData, "PNG", 0, 40, 290, 130);

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text(`Distribución por mes`, 150, 20, {
        align: "center",
      });

      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.text("* Solo se muestran los valores mayores al 5%", 225, 205);
    }
  }
};

/**
 * Generar pagina para iesp
 * @param {jsPDF} doc - Documento PDF
 * @param {Object} colores - Colores para la seccion
 * @param {string} titulo - Titulo para la seccion
 * @param {Object} contenido - Contenido de la seccion
 */
const agregarPaginaIesp = async (
  doc,
  colores,
  titulo,
  contenido,
  esMensual
) => {
  const header = [
    "Mes",
    "# Emitidos",
    "Importe Emitido",
    "# Recibidos",
    "Importe Recibido",
  ];

  // Prepara los datos para las gráficas
  const datosEmitidos = {};
  const datosRecibidos = {};
  let filas = [];

  let contadorEmitidos = 0;
  let contadorImporteEmitidos = 0;
  let contadorRecibidos = 0;
  let contadorImporteRecibido = 0;

  for (let dato of contenido) {
    // CONCENTRADO MENSUAL
    const emitidos = dato.contadorEmitidos || 0;
    const importeEmitido = dato.importeEmitido || 0;
    const recibidos = dato.contadorRecibidos || 0;
    const importeRecibido = dato.importeRecibido || 0;

    const fila = [
      dato.mes || "N/A",
      emitidos,
      formatoNumerico(importeEmitido),
      recibidos,
      formatoNumerico(importeRecibido),
    ];

    contadorEmitidos += emitidos;
    contadorImporteEmitidos += importeEmitido;
    contadorRecibidos += recibidos;
    contadorImporteRecibido += importeRecibido;

    filas.push(fila);

    // DATOS PARA GRÁFICAS
    if (importeEmitido > 0) {
      datosEmitidos[dato.mes || "N/A"] = importeEmitido;
    }

    if (importeRecibido > 0) {
      datosRecibidos[dato.mes || "N/A"] = importeRecibido;
    }
  }

  // AGREGAMOS TOTALES
  filas.push([
    "Total",
    contadorEmitidos,
    formatoNumerico(contadorImporteEmitidos),
    contadorRecibidos,
    formatoNumerico(contadorImporteRecibido),
  ]);

  // CONDICION DE RENDERIZADO
  if (contadorEmitidos === 0 && contadorRecibidos === 0) return;

  doc.addPage();

  doc.autoTable({
    head: [header],
    body: [...filas],
    startY: 10,
    startX: 10,
    margin: { left: 20, right: 10 },
    theme: "grid",
    headStyles: {
      fillColor: colores.primario,
      textColor: [255, 255, 255],
      fontSize: 9,
    },
    styles: {
      overflow: "linebreak",
    },
    columnStyles: {
      1: { halign: "left" },
      2: { halign: "left" },
      3: { halign: "left" },
      4: { halign: "right" },
      5: { halign: "right" },
    },
    didParseCell: function (data) {
      if (data.section === "head" || data.section === "body") {
        if (data.column.index === 1 || data.column.index === 3) {
          data.cell.styles.halign = "center";
        } else if (data.column.index === 2 || data.column.index === 4) {
          data.cell.styles.halign = "right";
        } else {
          data.cell.styles.halign = "left";
        }
      }

      if (data.section === "body" && data.row.index === filas.length - 1) {
        data.cell.styles.fillColor = colores.secundario;
        data.cell.styles.textColor = [0, 0, 0];
        data.cell.styles.fontStyle = "bold";
      }
    },
    didDrawPage: function (data) {
      agregarPaginaSeccion(doc, `${titulo}`, colores.primario);
    },
  });

  // Generar gráficas de pastel si hay datos
  if (
    Object.keys(datosEmitidos).length > 1 ||
    Object.keys(datosRecibidos).length > 1
  ) {
    // doc.addPage();
    // agregarPaginaSeccion(doc, `${titulo} - GRÁFICAS`, colores.primario);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Distribución de IESP por mes", 150, 125, {
      align: "center",
    });

    // Gráfica para importes emitidos
    if (Object.keys(datosEmitidos).length > 1) {
      const mesesEmitidos = Object.keys(datosEmitidos);
      const importesEmitidos = mesesEmitidos.map((mes) => datosEmitidos[mes]);

      const degradadoEmitidos = generarDegradadoHex(
        rgbToHex(colores.primario),
        rgbToHex(colores.secundario),
        mesesEmitidos.length
      );

      const datosGraficaEmitidos = {
        labels: mesesEmitidos,
        datasets: [
          {
            data: importesEmitidos,
            backgroundColor: degradadoEmitidos,
            hoverOffset: 4,
          },
        ],
      };

      let imgDataEmitidos = await generarGraficaPastel(datosGraficaEmitidos);
      doc.addImage(imgDataEmitidos, "PNG", 20, 140, 130, 60);

      doc.setFontSize(14);
      doc.text("Importes Emitidos", 75, 35, {
        align: "center",
      });
    }

    // Gráfica para importes recibidos
    if (Object.keys(datosRecibidos).length > 1) {
      const mesesRecibidos = Object.keys(datosRecibidos);
      const importesRecibidos = mesesRecibidos.map(
        (mes) => datosRecibidos[mes]
      );

      const degradadoRecibidos = generarDegradadoHex(
        rgbToHex([249, 163, 61]), // Usar un color diferente para la segunda gráfica
        rgbToHex([255, 214, 166]),
        mesesRecibidos.length
      );

      const datosGraficaRecibidos = {
        labels: mesesRecibidos,
        datasets: [
          {
            data: importesRecibidos,
            backgroundColor: degradadoRecibidos,
            hoverOffset: 4,
          },
        ],
      };

      let imgDataRecibidos = await generarGraficaPastel(datosGraficaRecibidos);
      doc.addImage(imgDataRecibidos, "PNG", 160, 140, 130, 60);

      doc.setFontSize(12);
      doc.text("Importes Recibidos", 230, 135, {
        align: "center",
      });
    }

    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text("* Solo se muestran los valores mayores al 5%", 225, 205);
  }
};
/**
 * Generar pagina para reporte riesgo conceptos
 * @param {jsPDF} doc - Documento PDF
 * @param {Object} colores - Colores para la seccion
 * @param {string} titulo - Titulo para la seccion
 * @param {Object} contenido - Contenido de la seccion
 */
const agregarPaginaCuentasPendientes = async (
  doc,
  colores,
  titulo,
  contenido,
  esMensual
) => {
  const header = [
    "Folio",
    "Fecha",
    "Fecha Ultimo Pago",
    "Dias",
    "RFC",
    "Nombre",
    "Moneda",
    "Total",
    "Total Pagos",
    "Forma NC",
    "Pendiente",
  ];

  for (let [nombreMes, arregloDatos] of Object.entries(contenido)) {
    let contadorTotal = 0;
    let contadorTotalPagos = 0;
    let contadorTotalNC = 0;
    let contadorPendiente = 0;

    const filas = [];

    for (let dato of arregloDatos) {
      // CONCENTRADO MENSUAL
      const total = dato.total || 0;
      const totalPagos = dato.totalPagos || 0;
      const totalNc = dato.totalNc || 0;
      const pendiente = dato.pendiente || 0;
      let fecha = dato.fecha ? formatoFechaSinHora(dato.fecha) : "N/A";
      let fechaUltimoPago = dato.fechaUltimoPago
        ? formatoFechaSinHora(dato.fechaUltimoPago)
        : "N/A";

      const fila = [
        dato.folio || "N/A",
        fecha,
        fechaUltimoPago,
        dato.dias || "N/A",
        dato.rfc || "N/A",
        dato.nombre || "N/A",
        dato.moneda || "N/A",
        formatoNumerico(total),
        formatoNumerico(totalPagos),
        formatoNumerico(totalNc),
        formatoNumerico(pendiente),
      ];

      contadorTotal += total;
      contadorTotalPagos += totalPagos;
      contadorTotalNC += totalNc;
      contadorPendiente += pendiente;

      filas.push(fila);

      // DATOS PARA CONCENTRADO MENSUAL
      // if (!datosGraficaMensual[dato.mes]) {
      //   datosGraficaMensual[dato.mes] = {
      //     mes: dato.mes,
      //     total: 0,
      //   };
      // }

      // datosGraficaMensual[dato.mes].total += emitidos+ importeEmitido + contadorRecibidos+ importeRecibido;
    }

    // AGREGAMOS TOTALES
    filas.push([
      "Total",
      "",
      "",
      "",
      "",
      "",
      "",
      formatoNumerico(contadorTotal),
      formatoNumerico(contadorTotalPagos),
      formatoNumerico(contadorTotalNC),
      formatoNumerico(contadorPendiente),
    ]);

    // CONDICION DE RENDERIZADO
    if (contadorTotal === 0) return;

    doc.addPage();
    doc.setFontSize(8);

    doc.autoTable({
      head: [header],
      body: [...filas],
      bodyStyles: {
        fontSize: 8,
      },
      startY: 10,
      startX: 10,
      margin: { left: 20, right: 10 },
      theme: "grid",
      headStyles: {
        fillColor: colores.primario,
        textColor: [255, 255, 255],
        fontSize: 8,
      },
      // styles: {
      //   overflow: "linebreak", // Asegura que el contenido se ajuste
      // },
      columnStyles: {
        0: { cellWidth: 15 }, // Folio
        1: { cellWidth: 20 }, // Fecha
        2: { cellWidth: 20 }, // Fecha
        3: { cellWidth: 10 }, // Dias
        4: { cellWidth: 28 }, // RFC
        5: { cellWidth: 40 }, // Nombre
        6: { cellWidth: 15 }, // MONEDA
        7: { cellWidth: 30 }, // Total
        8: { cellWidth: 25 }, // Total Pagos
        9: { cellWidth: 25 }, // Forma NC
        10: { cellWidth: 30 }, // Pendiente
      },
      didParseCell: function (data) {
        if (data.section === "head" || data.section === "body") {
          if (data.column.index <= 6) {
            data.cell.styles.halign = "left";
          } else if (data.column.index === 4 || data.column.index === 7) {
            data.cell.styles.halign = "center";
          } else {
            data.cell.styles.halign = "right";
          }
        }

        if (data.section === "body" && data.row.index === filas.length - 1) {
          data.cell.styles.fillColor = colores.secundario;
          data.cell.styles.textColor = [0, 0, 0];
          data.cell.styles.fontStyle = "bold";
        }
      },
      didDrawPage: function (data) {
        agregarPaginaSeccion(doc, `${titulo} - ${nombreMes}`, colores.primario);
      },
    });
  }
};

/**
 * Generar pagina para reporte riesgo conceptos
 * @param {jsPDF} doc - Documento PDF
 * @param {Object} colores - Colores para la seccion
 * @param {string} titulo - Titulo para la seccion
 * @param {Object} contenido - Contenido de la seccion
 */
const agregarPaginaRiesgoFacturaGlobal = async (
  doc,
  colores,
  titulo,
  contenido,
  esMensual
) => {
  const header = [
    "Serie",
    "Folio",
    "Folio Fiscal",
    "No. Identificacion",
    "Fecha",
    "Conteo",
    "Periodicidad",
    "Importe",
  ];

  // Procesar los datos por mes
  for (let [nombreMes, arregloDatos] of Object.entries(contenido)) {
    // Datos agrupados por mes
    let filas = [];
    let contadorTotal = 0;
    let importeTotal = 0;

    // Procesar cada registro
    for (const dato of arregloDatos) {
      const conteo = dato.conteo || 0;
      const importe = dato.importe || 0;
      const folio = dato.folio || "N/A";
      const serie = dato.serie || "N/A";
      const noIdentificacion = dato.noIdentificacion || "N/A";
      const folioFiscal = dato.folioFiscal || "N/A";
      const periodicidad = dato.periodicidad || "N/A";
      const fecha = dato.fecha ? formatoFechaSinHora(dato.fecha) : "N/A";

      // Acumular totales
      contadorTotal += conteo;
      importeTotal += importe;

      const fila = [
        serie,
        folio,
        folioFiscal,
        noIdentificacion,
        fecha,
        conteo,
        periodicidad,
        formatoNumerico(importe),
      ];

      filas.push(fila);
    }

    filas.push([
      "Total",
      "",
      "",
      "",
      "",
      contadorTotal,
      "",
      formatoNumerico(importeTotal),
    ]);

    // CONDICIÓN DE RENDERIZADO
    if (contadorTotal === 0) return;
    // await agregaSubPortada(doc, 14);

    doc.addPage();

    doc.autoTable({
      head: [header],
      body: [...filas],
      startY: 10,
      startX: 10,
      margin: { left: 20, right: 10 },
      theme: "grid",
      headStyles: {
        fillColor: colores.primario,
        textColor: [255, 255, 255],
      },
      styles: {
        // overflow: "linebreak",
        fontSize: 8,
      },
      columnStyles: {
        // 0: { halign: "left" }, // Mes
        // 1: { halign: "left" }, // Folio
        // 2: { halign: "left" }, // Serie
        // 3: { halign: "left" }, // Folio Fiscal
        // 4: { halign: "center" }, // Conteo
        // 5: { halign: "left" }, // Periodicidad
        // 6: { halign: "right" }, // Importe
        // 7: { halign: "left" }, // Fecha
      },
      didParseCell: function (data) {
        if (data.section === "head" || data.section === "body") {
          if (data.column.index <= 6) {
            data.cell.styles.halign = "left";
          } else if (data.column.index === 5) {
            data.cell.styles.halign = "center";
          } else {
            data.cell.styles.halign = "right";
          }
        }

        if (data.section === "body" && data.row.index === filas.length - 1) {
          data.cell.styles.fillColor = colores.secundario;
          data.cell.styles.textColor = [0, 0, 0];
          data.cell.styles.fontStyle = "bold";
        }
      },
      didDrawPage: function (data) {
        agregarPaginaSeccion(doc, `${titulo} - ${nombreMes}`, colores.primario);
      },
    });
  }
};

/**
 * Generar pagina para reporte riesgo conceptos
 * @param {jsPDF} doc - Documento PDF
 * @param {Object} colores - Colores para la seccion
 * @param {string} titulo - Titulo para la seccion
 * @param {Object} contenido - Contenido de la seccion
 */
const agregarPaginaAnticipos = async (
  doc,
  colores,
  titulo,
  contenido,
  esMensual
) => {
  const header = [
    "Serie",
    "Folio",
    "Folio Fiscal",
    "Forma de Pago",
    "RFC",
    "Nombre",
    "Total Ingreso",
    "Total Egreso",
    "Diferencia",
    "Total",
  ];

  contenido.forEach((data) => {
    const arregloDatos = data.detalles;
    const nombreMes = data.mes;

    console.log(data);

    // Datos agrupados por mes
    let filas = [];

    let contadorTotalIngreso = 0;
    let contadorTotalEgresa = 0;
    let contadorTotal = 0;
    let contadorDiferencia = 0;

    // Procesar cada registro
    for (const dato of arregloDatos) {
      const serie = dato.serie || "N/A";
      const folio = dato.folio || "N/A";
      const folioFiscal = dato.folioFiscal || "N/A";
      const formaPago = dato.formaPago || "N/A";
      const rfc = dato.rfc || "N/A";
      const nombre = dato.nombre || "N/A";
      const totalIngreso = dato.totalIngreso || 0;
      const totalEgreso = dato.totalEgreso || 0;
      const diferencia = dato.diferencia || 0;
      const total = dato.total || 0;

      // Acumular totales
      contadorTotalIngreso += totalIngreso;
      contadorTotalEgresa += totalEgreso;
      contadorTotal += total;
      contadorDiferencia += diferencia;

      const fila = [
        serie,
        folio,
        folioFiscal,
        formaPago,
        rfc,
        nombre,
        formatoNumerico(totalIngreso),
        formatoNumerico(totalEgreso),
        formatoNumerico(diferencia),
        formatoNumerico(total),
      ];

      filas.push(fila);
    }

    filas.push([
      "Total",
      "",
      "",
      "",
      "",
      "",
      formatoNumerico(contadorTotalIngreso),
      formatoNumerico(contadorTotalEgresa),
      formatoNumerico(contadorDiferencia),
      formatoNumerico(contadorTotal),
    ]);

    // CONDICIÓN DE RENDERIZADO
    if (contadorTotal === 0) return;
    // await agregaSubPortada(doc, 14);

    doc.addPage();

    doc.autoTable({
      head: [header],
      body: [...filas],
      startY: 10,
      startX: 10,
      margin: { left: 20, right: 10 },
      theme: "grid",
      headStyles: {
        fillColor: colores.primario,
        textColor: [255, 255, 255],
      },
      styles: {
        // overflow: "linebreak",
        fontSize: 8,
      },
      columnStyles: {
        // 0: { cellWidth: 15 }, // Folio
        // 1: { cellWidth: 20 }, // Fecha
        2: { cellWidth: 35 }, // Fecha
        // 3: { cellWidth: 10 }, // Dias
        // 4: { cellWidth: 28 }, // RFCx
        // 5: { cellWidth: 40 }, // Nombre
        // 6: { cellWidth: 15 }, // MONEDAk
        // 7: { cellWidth: 30 }, // Total
        // 8: { cellWidth: 25 }, // Total Pagos
        // 9: { cellWidth: 25 }, // Forma NC
        // 10: { cellWidth: 30 }, // Pendiente
      },
      didParseCell: function (data) {
        if (data.section === "head" || data.section === "body") {
          if (data.column.index <= 5) {
            data.cell.styles.halign = "left";
          } else {
            data.cell.styles.halign = "right";
          }
        }

        if (data.section === "body" && data.row.index === filas.length - 1) {
          data.cell.styles.fillColor = colores.secundario;
          data.cell.styles.textColor = [0, 0, 0];
          data.cell.styles.fontStyle = "bold";
        }
      },
      didDrawPage: function (data) {
        agregarPaginaSeccion(doc, `${titulo} - ${nombreMes}`, colores.primario);
      },
    });
  });

  // Procesar los datos por mes
  // for (let [nombreMes, arregloDatos] of Object.entries(contenido)) {

  // }
};

/**
 * Generar pagina para reporte de lista negra
 * @param {jsPDF} doc - Documento PDF
 * @param {Object} colores - Colores para la seccion
 * @param {string} titulo - Titulo para la seccion
 * @param {Object} contenido - Contenido de la seccion
 */
const agregarPaginaListaNegra = async (
  doc,
  colores,
  titulo,
  contenido,
  esMensual
) => {
  const header = [
    "RFC",
    "Nombre",
    "No. Localizado",
    "Lista Negra",
    "Lista 69B",
  ];

  if (contenido.proveedores != null) {
    let filasProveedores = [];

    contenido.proveedores.forEach((data) => {
      const rfc = data.rfc || "N/A";
      const nombre = data.nombre || "N/A";
      const noLocalizado = data.noLocalizado || "N/A";
      const listaNegra = data.listaNegra || "N/A";
      const lista69B = data.lista69B || "N/A";

      const fila = [rfc, nombre, noLocalizado, listaNegra, lista69B];

      filasProveedores.push(fila);
    });

    if (filasProveedores.length > 0) {
      doc.addPage();

      doc.autoTable({
        head: [header],
        body: [...filasProveedores],
        startY: 10,
        startX: 10,
        margin: { left: 20, right: 10 },
        theme: "grid",
        headStyles: {
          fillColor: colores.primario,
          textColor: [255, 255, 255],
        },
        styles: {
          // overflow: "linebreak",
          fontSize: 8,
        },
        columnStyles: {},
        didParseCell: function (data) {
          if (data.section === "head" || data.section === "body") {
            data.cell.styles.halign = "left";
          }

          // if (
          //   data.section === "body" &&
          //   data.row.index === filasProveedores.length - 1
          // ) {
          //   data.cell.styles.fillColor = colores.secundario;
          //   data.cell.styles.textColor = [0, 0, 0];
          //   data.cell.styles.fontStyle = "bold";
          // }
        },
        didDrawPage: function (data) {
          agregarPaginaSeccion(
            doc,
            `${titulo} de proovedores`,
            colores.primario
          );
        },
      });
    }
  }

  if (contenido.clientes != null) {
    let filasClientes = [];

    contenido.clientes.forEach((data) => {
      const rfc = data.rfc || "N/A";
      const nombre = data.nombre || "N/A";
      const noLocalizado = data.noLocalizado || "N/A";
      const listaNegra = data.listaNegra || "N/A";
      const lista69B = data.lista69B || "N/A";

      const fila = [rfc, nombre, noLocalizado, listaNegra, lista69B];

      filasClientes.push(fila);
    });

    if (filasClientes.length > 0) {
      doc.addPage();

      doc.autoTable({
        head: [header],
        body: [...filasClientes],
        startY: 10,
        startX: 10,
        margin: { left: 20, right: 10 },
        theme: "grid",
        headStyles: {
          fillColor: colores.primario,
          textColor: [255, 255, 255],
        },
        styles: {
          // overflow: "linebreak",
          fontSize: 8,
        },
        columnStyles: {},
        didParseCell: function (data) {
          if (data.section === "head" || data.section === "body") {
            data.cell.styles.halign = "left";
          }

          // if (
          //   data.section === "body" &&
          //   data.row.index === filasClientes.length - 1
          // ) {
          //   data.cell.styles.fillColor = colores.secundario;
          //   data.cell.styles.textColor = [0, 0, 0];
          //   data.cell.styles.fontStyle = "bold";
          // }
        },
        didDrawPage: function (data) {
          agregarPaginaSeccion(doc, `${titulo} de clientes`, colores.primario);
        },
      });
    }


  }
};

/**
 * Funcion para descargar el PDF generado
 * @param {Blob} blob - Blob del PDF
 * @param {string} nombreArchivo - Nombre del archivo
 */
const descargarPDF = (blob, nombreArchivo) => {
  // Crear URL para el blob
  const url = URL.createObjectURL(blob);

  // Crear un elemento <a> invisible
  const enlaceDescarga = document.createElement("a");
  enlaceDescarga.href = url;
  enlaceDescarga.download = `${nombreArchivo}.pdf`;

  // Agregar al DOM, hacer clic y luego remover
  document.body.appendChild(enlaceDescarga);
  enlaceDescarga.click();

  // Pequeño retraso antes de remover
  setTimeout(() => {
    document.body.removeChild(enlaceDescarga);
    URL.revokeObjectURL(url);
  }, 100);
};

// Exportar funciones
export {
  generarReporteEmpresarial,
  agregarPortada,
  agregarPaginaSeccion,
  agregarPieDePagina,
  descargarPDF,
};
