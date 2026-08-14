// ============================================================================
// pdfReporteGeneral.js
// ----------------------------------------------------------------------------
// Generador de PDF del Reporte General, usando jsPDF + jspdf-autotable.
// Estructura de reporte financiero completo:
//   Portada -> Índice -> Secciones numeradas (con texto interpretativo,
//   viñetas de "principales" y gráficas de barra) -> Firma -> Pie de página.
//
// Instalación necesaria en el proyecto (si no la tienes ya):
//   npm install jspdf jspdf-autotable
//
// Uso típico (desde ReporteGeneralPreview.vue):
//   import { generarPdfReporteGeneral } from './pdfReporteGeneral';
//   generarPdfReporteGeneral(this.datosParaPdf, {
//     empresa: this.$store.state.empresaStore.nombre,
//     rfc: this.$store.state.empresaStore.rfc,
//     firmante: { nombre: 'OSCAR JESUS LUENGAS SOLANO', puesto: 'DIRECTOR LAUDEM AVE' },
//   });
// ============================================================================
import { PLANTILLA_PORTADA_PNG } from "./plantillaPortada";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { LOGO_CONTAGO_PNG, LOGO_CONTAGO_RATIO } from "./logoContago";
import {
    MESES,
    money,
    evaluarCasos,
    casosIvaIntro,
    casosIvaOutro,
    casosIsrOutro,
    casosPagosProvisionalesIntro,
    casosPagosProvisionalesOutro,
    casosUsoCfdi,
    casosFlujo,
    casosAntiguedadSaldos,
    casosComparativaAnual,
    construirElementosAFavor,
    construirElementosEnContra,
    calcularRangoCredito,
    construirVeredictoCredito,
} from "./pdfCasos";

// ============================================================================
// TOKENS DE DISEÑO
// ============================================================================
const COLOR_HEADER = [191, 47, 47]; // #BF2F2F — rojo de marca Contago
const COLOR_HEADER_TEXT = [255, 255, 255];

// Nota: ya no se usa un color distinto por sección — todas comparten
// COLOR_HEADER (ver iniciarSeccion). Se deja CATEGORIA_SECCION porque sigue
// controlando el agrupamiento por temas ("Parte I/II/III") del índice.

// Agrupa las secciones en 3 temas/partes del reporte
const CATEGORIA_SECCION = {
    "Pagos de IVA": "Cumplimiento Fiscal",
    "Retenciones de ISR": "Cumplimiento Fiscal",
    "Pagos Provisionales de ISR": "Cumplimiento Fiscal",
    "Comparativa Anual": "Cumplimiento Fiscal",
    "Uso del CFDI": "Comprobantes y Operación",
    "Comprobantes Emitidos por RFC": "Comprobantes y Operación",
    "Comprobantes Recibidos por RFC": "Comprobantes y Operación",
    "Nómina Pagada": "Comprobantes y Operación",
    "Cuentas por Cobrar": "Flujo y Cartera",
    "Cuentas por Pagar": "Flujo y Cartera",
    "Comparativa de Flujo (PUE)": "Flujo y Cartera",
    "Análisis de Ciclo de Cobro y Pago": "Flujo y Cartera",
    "Razones Financieras": "Conclusión y Recomendación",
    "Conclusión: ¿Es Sujeto de Crédito?": "Conclusión y Recomendación",
};

const ROMANOS = ["I", "II", "III", "IV", "V", "VI"];
const COLOR_TOTAL_BG = [246, 214, 211];
const COLOR_STRIPE = [250, 244, 244];
const COLOR_TEXT = [35, 35, 35];
const COLOR_NEGATIVO = [176, 30, 30];
const COLOR_POSITIVO = [21, 115, 71];
const COLOR_MUTED = [110, 110, 110];
const COLOR_PORTADA_BANDA = [191, 47, 47];

// Paleta para las gráficas de barra (varía el tono para distinguir barras)
const PALETA_BARRAS = [
    [191, 47, 47],
    [212, 92, 92],
    [226, 130, 130],
    [237, 165, 165],
    [245, 195, 195],
];

const MARGEN = 12; // mm
const LOGO_ANCHO_ENCABEZADO = 34; // mm
const LOGO_ANCHO_PORTADA = 85; // mm

// ============================================================================
// UTILIDADES DE MAQUETACIÓN
// ============================================================================

function nuevoDocumento() {
    return new jsPDF({ unit: "mm", format: "letter" });
}

function altoUtil(doc) {
    return doc.internal.pageSize.getHeight() - 20;
}

function anchoUtil(doc) {
    return doc.internal.pageSize.getWidth() - MARGEN * 2;
}

function asegurarEspacio(doc, y, alto) {
    if (y + alto > altoUtil(doc)) {
        doc.addPage();
        return MARGEN + 6;
    }
    return y;
}

// ----------------------------------------------------------------------------
// PORTADA
// ----------------------------------------------------------------------------
// function agregarPortada(doc, { empresa, rfc, mesInicialLabel, mesFinalLabel, anio, fechaReporte }) {
//     const pageWidth = doc.internal.pageSize.getWidth();
//     const pageHeight = doc.internal.pageSize.getHeight();

//     // Banda superior de color de marca
//     doc.setFillColor(...COLOR_PORTADA_BANDA);
//     doc.rect(0, 0, pageWidth, 8, "F");

//     // Logo centrado
//     const logoAlto = LOGO_ANCHO_PORTADA * LOGO_CONTAGO_RATIO;
//     try {
//         doc.addImage(
//             LOGO_CONTAGO_PNG,
//             "PNG",
//             (pageWidth - LOGO_ANCHO_PORTADA) / 2,
//             60,
//             LOGO_ANCHO_PORTADA,
//             logoAlto
//         );
//     } catch (e) {
//         console.log("No se pudo insertar el logo en portada:", e);
//     }

//     let y = 60 + logoAlto + 18;

//     doc.setFont("helvetica", "bold");
//     doc.setFontSize(11);
//     doc.setTextColor(...COLOR_PORTADA_BANDA);
//     doc.text("REPORTE FINANCIERO", pageWidth / 2, y, { align: "center", charSpace: 0.5 });

//     y += 9;
//     doc.setFont("helvetica", "bold");
//     doc.setFontSize(22);
//     doc.setTextColor(...COLOR_TEXT);
//     doc.text("REPORTE GENERAL", pageWidth / 2, y, { align: "center" });

//     y += 12;
//     doc.setFont("helvetica", "normal");
//     doc.setFontSize(15);
//     doc.text(empresa || "Empresa", pageWidth / 2, y, { align: "center" });

//     if (rfc) {
//         y += 7;
//         doc.setFontSize(10.5);
//         doc.setTextColor(...COLOR_MUTED);
//         doc.text(rfc.toUpperCase(), pageWidth / 2, y, { align: "center" });
//     }

//     y += 14;
//     doc.setDrawColor(...COLOR_PORTADA_BANDA);
//     doc.setLineWidth(0.6);
//     doc.line(pageWidth / 2 - 30, y, pageWidth / 2 + 30, y);

//     y += 10;
//     doc.setFont("helvetica", "bold");
//     doc.setFontSize(11);
//     doc.setTextColor(...COLOR_TEXT);
//     doc.text(`Periodo: ${mesInicialLabel} — ${mesFinalLabel} ${anio}`, pageWidth / 2, y, { align: "center" });

//     y += 6;
//     doc.setFont("helvetica", "normal");
//     doc.setFontSize(9.5);
//     doc.setTextColor(...COLOR_MUTED);
//     doc.text(`Fecha de emisión: ${fechaReporte}`, pageWidth / 2, y, { align: "center" });

//     // Banda inferior
//     doc.setFillColor(...COLOR_PORTADA_BANDA);
//     doc.rect(0, pageHeight - 8, pageWidth, 8, "F");
// }

// ----------------------------------------------------------------------------
// Escribe un valor en una celda de la portada, con salto de línea automático
// dentro del ancho real de la columna (nunca invade la columna vecina), y
// reduce el tamaño de letra si el texto no cabe en 2 líneas. Regresa la
// posición Y justo debajo del texto, para poder apilar más contenido (ej. RFC).
// ----------------------------------------------------------------------------
function agregarPortada(doc, { empresa, rfc, mesInicialLabel, mesFinalLabel, anio, fechaReporte }) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const anchoLogo = 26;


    // 1) Fondo: la plantilla cubre toda la página
    doc.addImage(PLANTILLA_PORTADA_PNG, "JPEG", 0, 0, pageWidth, pageHeight);

    // 2) Overlay de datos — misma X que las tres etiquetas (33.5mm)
    const x = 50;
    const anchoMax = 140; // ancho disponible antes de chocar con la gráfica de fondo

    doc.setTextColor(...COLOR_TEXT);

    // --- NOMBRE DE LA EMPRESA ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    let yEmpresa = 146.3;
    const lineasEmpresa = doc.splitTextToSize(empresa || "Empresa", anchoMax);
    doc.text(lineasEmpresa, x, yEmpresa);
    if (rfc) {
        const lineHeight = 13 * 0.42 + 1.2;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...COLOR_MUTED);
        doc.text(rfc.toUpperCase(), x, yEmpresa + lineasEmpresa.length * lineHeight + 1.5);
        doc.setTextColor(...COLOR_TEXT);
    }

    // --- PERIODO ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`${mesInicialLabel} — ${mesFinalLabel}`, x, 174.2);

    // --- AÑO ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(String(anio), x, 201.8);

    // Fecha de emisión, discreta al pie
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...COLOR_MUTED);
    doc.text(`Fecha de emisión: ${fechaReporte}`, x-35, pageHeight - 12);

    const altoLogo = anchoLogo * LOGO_CONTAGO_RATIO;
try {
    doc.addImage(LOGO_CONTAGO_PNG, "PNG", 140, 14.5, 55, 18);
} catch (e) {
    console.log("No se pudo insertar el logo en portada:", e);
}
}
// ----------------------------------------------------------------------------
// ÍNDICE — se reserva una página en blanco y se llena al final, cuando ya
// se conoce en qué página quedó cada sección.
// ----------------------------------------------------------------------------
function reservarIndice(doc) {
    doc.addPage(); // página 2
}

function agregarIndice(doc, secciones) {
    const paginaIndice = 2;
    doc.setPage(paginaIndice);
    const pageWidth = doc.internal.pageSize.getWidth();

    let y = 24;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...COLOR_TEXT);
    doc.text("ÍNDICE", MARGEN, y);
    y += 6;
    doc.setDrawColor(...COLOR_HEADER);
    doc.setLineWidth(0.6);
    doc.line(MARGEN, y, MARGEN + 28, y);
    y += 11;

    // Agrupamos preservando el orden en que aparecieron las categorías
    const categoriasOrden = [];
    secciones.forEach((s) => {
        if (!categoriasOrden.includes(s.categoria)) categoriasOrden.push(s.categoria);
    });

    categoriasOrden.forEach((categoria, idxCategoria) => {
        const items = secciones.filter((s) => s.categoria === categoria);
        const numeroParte = ROMANOS[idxCategoria] || String(idxCategoria + 1);

        // Nota: no usamos asegurarEspacio() aquí porque doc.addPage() agregaría
        // la página al FINAL del documento (ya generado), no dentro del índice.
        // Con el número de secciones típico (~10) esto siempre cabe en una página.
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(...COLOR_MUTED);
        doc.text(`PARTE ${numeroParte}  —  ${categoria.toUpperCase()}`, MARGEN, y);
        y += 8;

        items.forEach((seccion) => {
            // (mismo motivo: no agregar página aquí, ver nota arriba)

            // Punto de color de la sección (mismo color que su encabezado)
            doc.setFillColor(...seccion.color);
            doc.circle(MARGEN + 1.3, y - 1.3, 1.3, "F");

            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.setTextColor(...COLOR_TEXT);
            const textoIzquierda = `${seccion.numero}.  ${seccion.titulo}`;
            doc.text(textoIzquierda, MARGEN + 6, y);

            doc.setFont("helvetica", "normal");
            const textoDerecha = String(seccion.pagina);
            const anchoDerecha = doc.getTextWidth(textoDerecha);
            doc.text(textoDerecha, pageWidth - MARGEN - anchoDerecha, y);

            const anchoIzquierda = doc.getTextWidth(textoIzquierda);
            const xInicioPuntos = MARGEN + 6 + anchoIzquierda + 3;
            const xFinPuntos = pageWidth - MARGEN - anchoDerecha - 3;
            doc.setDrawColor(205, 205, 205);
            doc.setLineDashPattern([0.6, 1.2], 0);
            if (xFinPuntos > xInicioPuntos) {
                doc.line(xInicioPuntos, y - 1, xFinPuntos, y - 1);
            }
            doc.setLineDashPattern([], 0);

            y += 9;
        });

        y += 6; // aire entre temas
    });
}

// ----------------------------------------------------------------------------
// Encabezado de página de contenido (a partir de la página 3, sin logo — el
// logo ya vive en la portada; aquí solo un encabezado ligero de contexto)
// ----------------------------------------------------------------------------
function agregarEncabezadoContenido(doc, { empresa, ubicacion, fechaReporte }) {
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLOR_MUTED);
    doc.text(empresa || "", MARGEN, 10);
    doc.text(`${ubicacion}  |  ${fechaReporte}`, pageWidth - MARGEN, 10, { align: "right" });
    doc.setDrawColor(...COLOR_STRIPE);
    doc.setLineWidth(0.3);
    doc.line(MARGEN, 12, pageWidth - MARGEN, 12);
    return 20;
}

// Pie de página — "Página N" en TODAS las páginas de contenido (no en portada)
function agregarPiePagina(doc, paginaInicioContenido) {
    const totalPaginas = doc.internal.getNumberOfPages();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    for (let i = paginaInicioContenido; i <= totalPaginas; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...COLOR_TEXT);
        doc.text(`Página ${i}`, pageWidth / 2, pageHeight - 10, { align: "center" });
    }
}

// Encabezado (empresa / ubicación / fecha) — en TODAS las páginas de
// contenido, no solo en las que "iniciarSeccion" abrió a propósito. Se hace
// en una sola pasada AL FINAL, igual que el pie de página, porque durante la
// generación se crean páginas nuevas por muchos caminos que no controlamos
// directamente (tablas largas de jspdf-autotable partiéndose solas,
// párrafos/viñetas desbordándose vía asegurarEspacio, etc.) y sería fácil
// que alguno se nos escapara si lo intentáramos dibujar "al momento".
function agregarEncabezadoEnTodasLasPaginas(doc, paginaInicioContenido, meta) {
    const totalPaginas = doc.internal.getNumberOfPages();
    for (let i = paginaInicioContenido; i <= totalPaginas; i++) {
        doc.setPage(i);
        agregarEncabezadoContenido(doc, meta);
    }
}

// Subtítulo de sección NUMERADO (ej. "1. PAGOS DE IVA") — y registra su
// posición en el arreglo de índice.
// Divisor visual de categoría/tema (ej. "PARTE I — CUMPLIMIENTO FISCAL")
function agregarDivisorCategoria(doc, y, categoria, numeroParte) {
    y = asegurarEspacio(doc, y, 18);
    doc.setFillColor(244, 244, 245);
    doc.rect(MARGEN, y - 6, anchoUtil(doc), 11, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...COLOR_MUTED);
    doc.text(`PARTE ${numeroParte}  —  ${categoria.toUpperCase()}`, MARGEN + 3, y + 1);
    return y + 14;
}

function iniciarSeccion(doc, indice, titulo, y, { empresa, ubicacion, fechaReporte }) {
    const categoria = CATEGORIA_SECCION[titulo] || "General";
    const color = COLOR_HEADER; // mismo color para todas las secciones
    const categoriaAnterior = indice.length > 0 ? indice[indice.length - 1].categoria : null;
    const cambiaCategoria = categoria !== categoriaAnterior;

    // Separación extra antes de CADA sección nueva (excepto la primera, que ya
    // arranca justo debajo del encabezado de la página) para que el título y
    // la tabla no se vean pegados al contenido del tema anterior.
    if (indice.length > 0) {
        y += 10;
    }

    const alturaMinima = cambiaCategoria ? 36 : 22;
    if (y + alturaMinima > altoUtil(doc)) {
        doc.addPage();
        y = agregarEncabezadoContenido(doc, { empresa, ubicacion, fechaReporte });
    }

    if (cambiaCategoria) {
        const categoriasVistas = [...new Set(indice.map((s) => s.categoria))];
        if (!categoriasVistas.includes(categoria)) categoriasVistas.push(categoria);
        const numeroParte = ROMANOS[categoriasVistas.indexOf(categoria)] || categoriasVistas.length;
        y = agregarDivisorCategoria(doc, y, categoria, numeroParte);
    }

    const numero = indice.length + 1;
    indice.push({ numero, titulo, pagina: doc.internal.getNumberOfPages(), categoria, color });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...color);
    doc.text(`${numero}.`, MARGEN, y);
    doc.setTextColor(...COLOR_TEXT);
    doc.text(titulo.toUpperCase(), MARGEN + 8, y);

    doc.setDrawColor(...color);
    doc.setLineWidth(0.5);
    doc.line(MARGEN, y + 2.5, MARGEN + anchoUtil(doc), y + 2.5);

    return y + 10;
}

function agregarSubSubtitulo(doc, y, texto) {
    y = asegurarEspacio(doc, y, 10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...COLOR_TEXT);
    doc.text(texto, MARGEN, y);
    return y + 6;
}

function agregarParrafo(doc, y, texto, opciones = {}) {
    if (!texto) return y;
    const fontSize = opciones.fontSize || 10;
    doc.setFont("helvetica", opciones.bold ? "bold" : "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(...(opciones.color || COLOR_TEXT));

    const lineas = doc.splitTextToSize(texto, anchoUtil(doc));
    const lineHeight = fontSize * 0.42 + 0.8;

    lineas.forEach((linea) => {
        y = asegurarEspacio(doc, y, lineHeight + 2);
        doc.text(linea, MARGEN, y);
        y += lineHeight;
    });

    return y + 3;
}

// Lista con viñetas ("•"), tipo "Principales clientes: ... — 82.2% (97 comprobantes)"
// ----------------------------------------------------------------------------
// TARJETAS DE ESTADÍSTICA (stat cards) — para romper el ritmo de puras
// tablas: números grandes en cajitas de color, antes del detalle.
// tarjetas: [{ label, valor, color }]  — de 2 a 4 tarjetas en una sola fila
// ----------------------------------------------------------------------------
function agregarTarjetasEstadisticas(doc, y, tarjetas) {
    if (!tarjetas || tarjetas.length === 0) return y;

    const gap = 4;
    const anchoTotal = anchoUtil(doc);
    const anchoTarjeta = (anchoTotal - gap * (tarjetas.length - 1)) / tarjetas.length;
    const altoTarjeta = 20;

    y = asegurarEspacio(doc, y, altoTarjeta + 6);

    tarjetas.forEach((t, i) => {
        const x = MARGEN + i * (anchoTarjeta + gap);
        const color = t.color || COLOR_HEADER;

        doc.setFillColor(250, 250, 250);
        doc.roundedRect(x, y, anchoTarjeta, altoTarjeta, 1.5, 1.5, "F");
        doc.setFillColor(...color);
        doc.rect(x, y, 1.4, altoTarjeta, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(...color);
        doc.text(String(t.valor), x + 4, y + 9.5);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.5);
        doc.setTextColor(...COLOR_MUTED);
        const etiqueta = doc.splitTextToSize(String(t.label).toUpperCase(), anchoTarjeta - 6);
        doc.text(etiqueta[0] || "", x + 4, y + 15.5);
    });

    return y + altoTarjeta + 7;
}

// ----------------------------------------------------------------------------
// MEDIDOR DE SALUD (semáforo horizontal) — zonas rojo/amarillo/verde con un
// marcador en la posición del porcentaje real. Usado en Razones Financieras.
// porcentaje: 0..1
// ----------------------------------------------------------------------------
function agregarMedidorSalud(doc, y, porcentaje) {
    const ancho = anchoUtil(doc);
    const alto = 3;
    const x = MARGEN;

    y = asegurarEspacio(doc, y, alto + 15);

    const zonaMala = ancho * 0.5;
    const zonaRegular = ancho * 0.25;
    const zonaBuena = ancho * 0.25;

    doc.setFillColor(...COLOR_NEGATIVO);
    doc.roundedRect(x, y, zonaMala, alto, 1, 1, "F");
    doc.setFillColor(217, 119, 6);
    doc.rect(x + zonaMala, y, zonaRegular, alto, "F");
    doc.setFillColor(...COLOR_POSITIVO);
    doc.roundedRect(x + zonaMala + zonaRegular - 3, y, zonaBuena + 3, alto, 1, 1, "F");
    doc.setFillColor(...COLOR_POSITIVO);
    doc.rect(x + zonaMala + zonaRegular, y, zonaBuena - 3, alto, "F");

    const posX = x + ancho * Math.min(Math.max(porcentaje, 0), 1);
    doc.setFillColor(30, 30, 30);
    doc.triangle(posX - 2.2, y - 3.5, posX + 2.2, y - 3.5, posX, y - 0.5, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.text(`${(porcentaje * 100).toFixed(0)}%`, posX, y + alto + 7, { align: "center" });

    return y + alto + 13;
}

// ----------------------------------------------------------------------------
// CALLOUT (recuadro destacado) — para el monto de crédito sugerido, en vez de
// dejarlo perdido dentro de un párrafo.
// ----------------------------------------------------------------------------
function agregarCallout(doc, y, titulo, texto, color) {
    const ancho = anchoUtil(doc);
    const fontSizeTexto = 13;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(fontSizeTexto);
    const lineasTexto = doc.splitTextToSize(texto, ancho - 12);
    const alto = 10 + lineasTexto.length * 6 + 4;

    y = asegurarEspacio(doc, y, alto + 6);

    doc.setFillColor(...(color || COLOR_HEADER));
    doc.roundedRect(MARGEN, y, ancho, alto, 2, 2, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(titulo.toUpperCase(), MARGEN + 6, y + 7);

    doc.setFontSize(fontSizeTexto);
    lineasTexto.forEach((linea, i) => {
        doc.text(linea, MARGEN + 6, y + 15 + i * 6);
    });

    return y + alto + 6;
}


// Lista con viñetas ("•"), tipo "Principales clientes: ... — 82.2% (97 comprobantes)"
function agregarListaBullets(doc, y, items, opciones = {}) {
    if (!items || items.length === 0) return y;
    const fontSize = opciones.fontSize || 9.5;
    const anchoDisponible = anchoUtil(doc) - 6;

    items.forEach((item) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(fontSize);
        doc.setTextColor(...COLOR_TEXT);
        const lineas = doc.splitTextToSize(item, anchoDisponible);
        lineas.forEach((linea, i) => {
            y = asegurarEspacio(doc, y, 5.5);
            doc.text((i === 0 ? "•  " : "   ") + linea, MARGEN + 2, y);
            y += 4.8;
        });
        y += 1.8; // aire extra entre un ítem y el siguiente
    });

    return y + 3;
}

// ----------------------------------------------------------------------------
// Gráfica de barras horizontal, dibujada con primitivas de jsPDF (sin canvas
// ni librerías externas — 100% confiable dentro del PDF).
// datos: [{ label, valor }]  ya ordenados de mayor a menor
// ----------------------------------------------------------------------------
function agregarGraficaBarras(doc, y, datos, opciones = {}) {
    if (!datos || datos.length === 0) return y;

    const altoBarra = 5.5;
    const espacio = 3;
    const anchoEtiqueta = 46;
    const anchoBarraMax = anchoUtil(doc) - anchoEtiqueta - 28;
    const maxValor = Math.max(...datos.map((d) => Math.abs(d.valor))) || 1;

    const alturaNecesaria = datos.length * (altoBarra + espacio) + 6;
    y = asegurarEspacio(doc, y, alturaNecesaria);

    const xInicioBarra = MARGEN + anchoEtiqueta;

    datos.forEach((d, i) => {
        const anchoBarra = Math.max((Math.abs(d.valor) / maxValor) * anchoBarraMax, 1);
        const color = PALETA_BARRAS[i % PALETA_BARRAS.length];

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(...COLOR_TEXT);
        const etiqueta = doc.splitTextToSize(d.label || "N/D", anchoEtiqueta - 2)[0];
        doc.text(etiqueta, MARGEN, y + altoBarra - 1.4);

        doc.setFillColor(...color);
        doc.rect(xInicioBarra, y, anchoBarra, altoBarra, "F");

        doc.setFontSize(7.5);
        doc.setTextColor(...COLOR_TEXT);
        doc.text(money(d.valor, opciones.moneda), xInicioBarra + anchoBarra + 2, y + altoBarra - 1.4);

        y += altoBarra + espacio;
    });

    return y + 4;
}

// ============================================================================
// TABLA GENÉRICA (autoTable)
// ============================================================================
// Construye una fila de totales sintética a partir de las columnas: suma las
// columnas "moneda"/"numero" (excepto las listadas en `excluir`, típicamente
// columnas YA acumuladas mes a mes, donde sumarlas de nuevo no tendría
// sentido), pone la etiqueta "TOTAL" en la primera columna de texto, y deja
// en blanco las columnas "porcentaje". Se muestra SIEMPRE, incluso si el
// total da $0.00.
function construirFilaTotal(columnas, filas, excluir = []) {
    const filaTotal = {};
    const indiceEtiqueta = columnas.findIndex((c) => c.tipo === "texto" || c.tipo === undefined);
    columnas.forEach((c, i) => {
        if ((c.tipo === "moneda" || c.tipo === "numero") && !excluir.includes(c.name)) {
            filaTotal[c.field] = filas.reduce((a, f) => a + (Number(f[c.field]) || 0), 0);
        } else if (i === indiceEtiqueta) {
            filaTotal[c.field] = "TOTAL";
        } else {
            filaTotal[c.field] = "";
        }
    });
    if (filas.length > 0 && filas[0].moneda) filaTotal.moneda = filas[0].moneda;
    return filaTotal;
}

function dibujarTabla(doc, y, { columnas, filas, opciones = {} }) {
    if (!columnas || columnas.length === 0 || !filas || filas.length === 0) {
        return y;
    }

    const esAncha = columnas.length > 9;
    const fontSize = 6;

    // Fila de totales: se agrega SIEMPRE que se pida (opciones.agregarTotales),
    // sin importar si el total resulta en $0.00 — nunca se oculta.
    let filasFinales = filas;
    let filaTotalIndexFinal = opciones.filaTotalIndex !== undefined ? opciones.filaTotalIndex : null;
    if (opciones.agregarTotales) {
        const filaTotal = construirFilaTotal(columnas, filas, opciones.excluirDeSuma || []);
        filasFinales = [...filas, filaTotal];
        filaTotalIndexFinal = filasFinales.length - 1;
    }

    const head = [columnas.map((c) => c.label)];
    const body = filasFinales.map((fila) =>
        columnas.map((c) => {
            const valor = fila[c.field];
            if (c.field === "mes" || c.name === "mes") {
                return valor === undefined || valor === null ? "" : String(valor).toUpperCase();
            }
            if (c.tipo === "moneda") return money(valor, fila.moneda);
            if (c.tipo === "porcentaje") {
                if (valor === "---" || valor === null || valor === undefined || valor === "") return "";
                const num = Number(valor);
                return Number.isNaN(num) ? String(valor) : num.toFixed(2) + "%";
            }
            return valor === undefined || valor === null ? "" : String(valor);
        })
    );

    const enfatizar = opciones.enfatizarColumnas || [];
    const filaTotalIndex = filaTotalIndexFinal;

    doc.autoTable({
        head,
        body,
        startY: y,
        margin: { left: MARGEN, right: MARGEN, bottom: 16 },
        theme: "grid",
        styles: {
            font: "helvetica",
            fontSize,
            cellPadding: esAncha ? 1 : 1.6,
            textColor: COLOR_TEXT,
            lineColor: [225, 225, 225],
            lineWidth: 0.1,
            overflow: "linebreak",
        },
        headStyles: {
            fillColor: COLOR_HEADER,
            textColor: COLOR_HEADER_TEXT,
            fontStyle: "bold",
            halign: "center",
        },
        alternateRowStyles: { fillColor: COLOR_STRIPE },
        columnStyles: columnas.reduce((acc, c, i) => {
            acc[i] = { halign: c.align || (c.tipo === "moneda" || c.tipo === "numero" ? "right" : "left") };
            return acc;
        }, {}),
        didParseCell: (data) => {
            if (data.section !== "body") return;
            const col = columnas[data.column.index];
            if (!col) return;
            const fila = filasFinales[data.row.index];
            const valorCrudo = Number(fila[col.field]);

            if (col.tipo === "moneda" && !Number.isNaN(valorCrudo) && valorCrudo < 0) {
                data.cell.styles.textColor = COLOR_NEGATIVO;
                data.cell.styles.fontStyle = "bold";
            }
            if (enfatizar.includes(col.name) && !Number.isNaN(valorCrudo) && valorCrudo > 0) {
                data.cell.styles.textColor = COLOR_POSITIVO;
                data.cell.styles.fontStyle = "bold";
            }
            if (filaTotalIndex !== null && data.row.index === filaTotalIndex) {
                data.cell.styles.fillColor = COLOR_TOTAL_BG;
                data.cell.styles.fontStyle = "bold";
            }
        },
    });

    return doc.lastAutoTable.finalY + 6;
}

// ============================================================================
// HELPERS DE DATOS
// ============================================================================
function obtenerMesLabel(numero) {
    const idx = Number(numero) - 1;
    return MESES[idx] || String(numero);
}

// Top-N de un arreglo por un campo numérico, más el total general (para %).
function calcularTopN(filas, campoValor, n = 5) {
    if (!filas || filas.length === 0) return { top: [], totalGeneral: 0 };
    const ordenado = [...filas].sort((a, b) => (b[campoValor] || 0) - (a[campoValor] || 0));
    const top = ordenado.filter((f) => (f[campoValor] || 0) > 0).slice(0, n);
    const totalGeneral = filas.reduce((a, f) => a + (f[campoValor] || 0), 0);
    return { top, totalGeneral };
}

function construirListaPrincipales(top, totalGeneral, campoImporte, campoConteo) {
    return top.map((f) => {
        const pct = totalGeneral ? ((f[campoImporte] / totalGeneral) * 100).toFixed(1) : "0.0";
        const nombre = f.nombre || f.rfc || "N/D";
        const conteo =
            campoConteo && f[campoConteo] !== undefined
                ? ` (${f[campoConteo]} comprobante${f[campoConteo] === 1 ? "" : "s"})`
                : "";
        return `${nombre}: ${money(f[campoImporte])} — ${pct}% del total${conteo}`;
    });
}

// ============================================================================
// CONSTRUCTORES POR SECCIÓN
// ============================================================================

function seccionIva(doc, y, datos, ctx, indice, meta) {
    const filas = datos.pagosIva;
    if (!filas || filas.length === 0) return y;

    y = iniciarSeccion(doc, indice, "Pagos de IVA", y, meta);
    y = agregarParrafo(doc, y, evaluarCasos(casosIvaIntro, { filas, ...ctx }));

    const totalCargo = filas.reduce((a, f) => a + (f.ivaCargo || 0), 0);
    const totalFavor = filas.reduce((a, f) => a + (f.ivaFavor || 0), 0);
    const totalComparativa = filas.reduce((a, f) => a + (f.comparativa || 0), 0);
    y = agregarTarjetasEstadisticas(doc, y, [
        { label: "IVA a Cargo (acum.)", valor: money(totalCargo), color: COLOR_NEGATIVO },
        { label: "IVA a Favor (acum.)", valor: money(totalFavor), color: COLOR_POSITIVO },
        { label: "Comparativa Neta", valor: money(totalComparativa), color: COLOR_HEADER },
    ]);

    const tieneRetenidoAnterior = filas.some((f) => "ivaRetenidoAnterior" in f && f.ivaRetenidoAnterior !== 0);
    const columnas = [
        { name: "mes", label: "Mes", field: "mes", tipo: "texto" },
        { name: "baseIvaTrasladado", label: "Base IVA Trasladado", field: "baseIvaTrasladado", tipo: "moneda" },
        { name: "importeIvaTrasladado", label: "Importe IVA Trasladado", field: "importeIvaTrasladado", tipo: "moneda" },
        { name: "baseIvaAcreditado", label: "Base IVA Acreditado", field: "baseIvaAcreditado", tipo: "moneda" },
        { name: "importeIvaAcreditado", label: "Importe IVA Acreditado", field: "importeIvaAcreditado", tipo: "moneda" },
        { name: "ivaRetenido", label: "IVA Retenido", field: "ivaRetenido", tipo: "moneda" },
    ];
    if (tieneRetenidoAnterior) {
        columnas.push({ name: "ivaRetenidoAnterior", label: "IVA Retenido Anterior", field: "ivaRetenidoAnterior", tipo: "moneda" });
    }
    columnas.push(
        { name: "ivaCargo", label: "IVA Cargo", field: "ivaCargo", tipo: "moneda" },
        { name: "ivaFavor", label: "IVA Favor", field: "ivaFavor", tipo: "moneda" },
        { name: "cargoRegistrado", label: "Cargo Registrado", field: "cargoRegistrado", tipo: "moneda" },
        { name: "favorRegistrado", label: "Favor Registrado", field: "favorRegistrado", tipo: "moneda" },
        { name: "comparativa", label: "Comparativa", field: "comparativa", tipo: "moneda" }
    );

    y = dibujarTabla(doc, y, { columnas, filas, opciones: { enfatizarColumnas: ["comparativa"], agregarTotales: true } });
    y = agregarParrafo(doc, y, evaluarCasos(casosIvaOutro, { filas, ...ctx }));

    return y;
}

const ISR_CATEGORIAS = [
    { key: "sueldos", label: "Retenciones de Sueldos y Salarios" },
    { key: "asimilados", label: "Asimilados" },
    { key: "otros", label: "Otros" },
    { key: "arrendamientos", label: "Arrendamientos" },
    { key: "honorarios", label: "Honorarios" },
    { key: "demasIngresos", label: "Demás Ingresos" },
    { key: "isrRetenidoFavor", label: "ISR Retenido a Favor" },
];

function seccionIsr(doc, y, datos, ctx, indice, meta) {
    const pagosIsr = datos.pagosIsr;
    if (!pagosIsr) return y;

    const hayDatos = ISR_CATEGORIAS.some((c) =>
        (pagosIsr[c.key] || []).some(
            (f) => Math.abs(f.importe || 0) > 0.009 || Math.abs(f.comparativa || 0) > 0.009 || Math.abs(f.diferencia || 0) > 0.009
        )
    );
    if (!hayDatos) return y;

    y = iniciarSeccion(doc, indice, "Retenciones de ISR", y, meta);
    y = agregarParrafo(doc, y, "En las retenciones de ISR el sistema determina las siguientes diferencias:");

    // Tarjetas de estadística: total retenido determinado, total registrado y
    // diferencia neta, sumando las 7 categorías juntas.
    const todasLasFilas = ISR_CATEGORIAS.flatMap((cat) => pagosIsr[cat.key] || []);
    const totalImporte = todasLasFilas.reduce((a, f) => a + (f.importe || 0), 0);
    const totalComparativa = todasLasFilas.reduce((a, f) => a + (f.comparativa || 0), 0);
    const totalDiferencia = todasLasFilas.reduce((a, f) => a + (f.diferencia || 0), 0);
    y = agregarTarjetasEstadisticas(doc, y, [
        { label: "Total Retenido (Determinado)", valor: money(totalImporte), color: COLOR_HEADER },
        { label: "Total Registrado", valor: money(totalComparativa), color: COLOR_MUTED },
        {
            label: "Diferencia Neta",
            valor: money(totalDiferencia),
            color: totalDiferencia >= 0 ? COLOR_POSITIVO : COLOR_NEGATIVO,
        },
    ]);

    const columnas = [
        { name: "mes", label: "Mes", field: "mes", tipo: "texto" },
        { name: "importe", label: "Importe", field: "importe", tipo: "moneda" },
        { name: "comparativa", label: "Comparativa", field: "comparativa", tipo: "moneda" },
        { name: "diferencia", label: "Diferencia", field: "diferencia", tipo: "moneda" },
    ];

    ISR_CATEGORIAS.forEach((cat) => {
        const filas = pagosIsr[cat.key];
        if (!filas || filas.length === 0) return;

        // Si TODA la categoría (los 12 meses) no tiene actividad real —
        // importe, comparativa y diferencia en $0.00 — se salta por completo:
        // no aporta nada mostrar una tabla entera de puros ceros.
        const tieneActividad = filas.some(
            (f) => Math.abs(f.importe || 0) > 0.009 || Math.abs(f.comparativa || 0) > 0.009 || Math.abs(f.diferencia || 0) > 0.009
        );
        if (!tieneActividad) return;

        y = agregarSubSubtitulo(doc, y, cat.label);
        y = dibujarTabla(doc, y, { columnas, filas, opciones: { enfatizarColumnas: ["diferencia"], agregarTotales: true } });
        y = agregarParrafo(doc, y, evaluarCasos(casosIsrOutro, { filas, categoria: cat.key, ...ctx }));
    });

    return y;
}

function seccionPagosProvisionales(doc, y, datos, ctx, indice, meta) {
    const pp = datos.pagosProvisionales;
    if (!pp) return y;

    y = iniciarSeccion(doc, indice, "Pagos Provisionales de ISR", y, meta);

    if (pp.mensaje && (!pp.filas || pp.filas.length === 0)) {
        y = agregarParrafo(doc, y, pp.mensaje, { color: COLOR_MUTED });
        return y;
    }
    if (!pp.filas || pp.filas.length === 0) return y;

    y = agregarParrafo(doc, y, evaluarCasos(casosPagosProvisionalesIntro, { filas: pp.filas }));
    if (pp.regimenLabel) {
        y = agregarParrafo(doc, y, `Régimen fiscal: ${pp.regimenLabel}`, { bold: true, fontSize: 9.5 });
    }

    // Tarjetas: usamos el último mes (valores YA acumulados) para "Ingresos",
    // y sumamos solo columnas de "cargo/comparativa" que son montos mensuales
    // reales (no acumulados).
    const ultimaFila = pp.filas[pp.filas.length - 1] || {};
    const ingresosFinal = ultimaFila.ingresosAcumulados ?? ultimaFila.ingresosPorMes ?? null;
    const campoCargo = ["impuestoCargo", "isrCargo", "isrAPagar", "pagoProvisional"].find((c) =>
        pp.columnas.some((col) => col.field === c)
    );
    const totalCargo = campoCargo ? pp.filas.reduce((a, f) => a + (f[campoCargo] || 0), 0) : null;
    const totalComparativa = pp.filas.reduce((a, f) => a + (f.comparativa || 0), 0);

    const tarjetas = [];
    if (ingresosFinal !== null) {
        tarjetas.push({ label: "Ingresos Acumulados (último mes)", valor: money(ingresosFinal), color: COLOR_HEADER });
    }
    if (totalCargo !== null) {
        tarjetas.push({ label: "Total Impuesto a Cargo", valor: money(totalCargo), color: COLOR_NEGATIVO });
    }
    tarjetas.push({
        label: "Comparativa Neta",
        valor: money(totalComparativa),
        color: totalComparativa >= 0 ? COLOR_POSITIVO : COLOR_NEGATIVO,
    });
    y = agregarTarjetasEstadisticas(doc, y, tarjetas);

    // Columnas que YA vienen acumuladas mes a mes — se excluyen de la suma
    // en la fila de totales (sumarlas otra vez no tendría sentido).
    const columnasAcumuladas = [
        "ingresosAcumulados", "gastosAcumulados", "deduccionesAcumuladas",
        "utilidadFiscalPreviaAcumulada", "utilidadFiscalAcumuladaPreviaAntesDePerdidasFiscales",
        "pagosAnteriores", "isrPagosProvisionales", "baseCalculo",
    ];

    y = dibujarTabla(doc, y, {
        columnas: pp.columnas,
        filas: pp.filas,
        opciones: {
            enfatizarColumnas: ["comparativa", "isrAPagar", "isrCargo"],
            agregarTotales: true,
            excluirDeSuma: columnasAcumuladas,
        },
    });

    y = agregarParrafo(doc, y, evaluarCasos(casosPagosProvisionalesOutro, { filas: pp.filas, ...ctx }));

    return y;
}

function seccionUsoCfdi(doc, y, datos, ctx, indice, meta) {
    const filas = datos.usoCfdi;
    if (!filas || filas.length === 0) return y;

    y = iniciarSeccion(doc, indice, "Uso del CFDI", y, meta);
    y = agregarParrafo(
        doc,
        y,
        "A continuación se muestra la comparativa de los ingresos con base en los comprobantes emitidos contra las compras, gastos y nómina, con la finalidad de observar el comportamiento de la empresa:"
    );

    const filasConDiferencia = filas.map((f) => ({
        ...f,
        diferencia: (f.emitidos || 0) - (f.recibidos || 0) - (f.nomina || 0),
    }));
    const suma = {
        uso: "Suma",
        emitidos: filasConDiferencia.reduce((a, f) => a + (f.emitidos || 0), 0),
        recibidos: filasConDiferencia.reduce((a, f) => a + (f.recibidos || 0), 0),
        nomina: filasConDiferencia.reduce((a, f) => a + (f.nomina || 0), 0),
        diferencia: filasConDiferencia.reduce((a, f) => a + (f.diferencia || 0), 0),
    };
    const filasFinales = [...filasConDiferencia, suma];

    y = agregarTarjetasEstadisticas(doc, y, [
        { label: "Total Emitidos", valor: money(suma.emitidos), color: COLOR_POSITIVO },
        { label: "Total Recibidos + Nómina", valor: money(suma.recibidos + suma.nomina), color: COLOR_NEGATIVO },
        {
            label: "Diferencia Neta",
            valor: money(suma.diferencia),
            color: suma.diferencia >= 0 ? COLOR_POSITIVO : COLOR_NEGATIVO,
        },
    ]);

    const columnas = [
        { name: "uso", label: "Uso del CFDI", field: "uso", tipo: "texto" },
        { name: "emitidos", label: "Emitidos", field: "emitidos", tipo: "moneda" },
        { name: "recibidos", label: "Recibidos", field: "recibidos", tipo: "moneda" },
        { name: "nomina", label: "Nómina", field: "nomina", tipo: "moneda" },
        { name: "diferencia", label: "Diferencia", field: "diferencia", tipo: "moneda" },
    ];

    y = dibujarTabla(doc, y, { columnas, filas: filasFinales, opciones: { filaTotalIndex: filasFinales.length - 1 } });
    y = agregarParrafo(doc, y, evaluarCasos(casosUsoCfdi, { diferencia: suma.diferencia }));

    // Gráfica: distribución de ingresos emitidos por uso de CFDI
    const { top } = calcularTopN(filasConDiferencia, "emitidos", 6);
    if (top.length > 0) {
        y = agregarSubSubtitulo(doc, y, "Distribución de ingresos emitidos por uso de CFDI");
        y = agregarGraficaBarras(doc, y, top.map((f) => ({ label: f.uso, valor: f.emitidos })));
    }

    return y;
}

function seccionEmitidosRecibidos(doc, y, datos, ctx, indice, meta, tipo) {
    const filas = tipo === "E" ? datos.comprobantesEmitidos : datos.comprobantesRecibidos;
    if (!filas || filas.length === 0) return y;

    const titulo = tipo === "E" ? "Comprobantes Emitidos por RFC" : "Comprobantes Recibidos por RFC";
    y = iniciarSeccion(doc, indice, titulo, y, meta);

    const campoConteoTarjeta = tipo === "E" ? "ingresos" : "egresos";
    const totalImporte = filas.reduce((a, f) => a + (f.importeI || 0), 0);
    const totalComprobantes = filas.reduce((a, f) => a + (f[campoConteoTarjeta] || 0), 0);
    const ticketPromedio = totalComprobantes > 0 ? totalImporte / totalComprobantes : 0;
    y = agregarTarjetasEstadisticas(doc, y, [
        { label: tipo === "E" ? "Total Emitido" : "Total Recibido", valor: money(totalImporte), color: COLOR_HEADER },
        { label: "Total Comprobantes", valor: totalComprobantes, color: COLOR_MUTED },
        { label: "Ticket Promedio", valor: money(ticketPromedio), color: COLOR_HEADER },
    ]);

    const columnas = [
        { name: "rfc", label: "RFC", field: "rfc", tipo: "texto" },
        { name: "nombre", label: "Nombre", field: "nombre", tipo: "texto" },
        { name: "conteo", label: tipo === "E" ? "# Ingresos" : "# Egresos", field: tipo === "E" ? "ingresos" : "egresos", tipo: "numero" },
        { name: "importeI", label: "Importe", field: "importeI", tipo: "moneda" },
    ];
    y = dibujarTabla(doc, y, { columnas, filas, opciones: { agregarTotales: true } });

    const campoConteo = tipo === "E" ? "ingresos" : "egresos";
    const { top, totalGeneral } = calcularTopN(filas, "importeI", 5);
    if (top.length > 0) {
        y = agregarSubSubtitulo(doc, y, tipo === "E" ? "Principales clientes" : "Principales proveedores");
        const lineas = construirListaPrincipales(top, totalGeneral, "importeI", campoConteo);
        y = agregarListaBullets(doc, y, lineas);
        y = agregarGraficaBarras(doc, y, top.map((f) => ({ label: f.nombre || f.rfc, valor: f.importeI })));
    }

    return y;
}

function seccionNomina(doc, y, datos, ctx, indice, meta) {
    const filas = datos.nomina;
    if (!filas || filas.length === 0) return y;

    y = iniciarSeccion(doc, indice, "Nómina Pagada", y, meta);

    const totalPercepciones = filas.reduce((a, f) => a + (f.percepciones || 0), 0);
    const totalDeducciones = filas.reduce((a, f) => a + (f.deducciones || 0), 0);
    const totalNeto = filas.reduce((a, f) => a + (f.total || 0), 0);
    y = agregarTarjetasEstadisticas(doc, y, [
        { label: "Total Percepciones", valor: money(totalPercepciones), color: COLOR_HEADER },
        { label: "Total Deducciones", valor: money(totalDeducciones), color: COLOR_NEGATIVO },
        { label: "Total Neto Pagado", valor: money(totalNeto), color: COLOR_POSITIVO },
    ]);

    const columnas = [
        { name: "mes", label: "Mes", field: "mes", tipo: "texto" },
        { name: "contador", label: "# Trabajadores", field: "contador", tipo: "numero" },
        { name: "percepciones", label: "Percepciones", field: "percepciones", tipo: "moneda" },
        { name: "deducciones", label: "Deducciones", field: "deducciones", tipo: "moneda" },
        { name: "otrosPagos", label: "Otros Pagos", field: "otrosPagos", tipo: "moneda" },
        { name: "total", label: "Total", field: "total", tipo: "moneda" },
    ];
    y = dibujarTabla(doc, y, { columnas, filas, opciones: { agregarTotales: true, excluirDeSuma: ["contador"] } });

    // Desglose de conceptos: se agregan todos los meses en un solo top-N
    const conceptos = datos.nominaConceptos || {};
    const acumulado = {};
    Object.values(conceptos).forEach((lista) => {
        (lista || []).forEach((c) => {
            const key = c.concepto || c.clave || "Otro";
            acumulado[key] = (acumulado[key] || 0) + (Number(c.importe) || 0);
        });
    });
    const arregloConceptos = Object.entries(acumulado).map(([concepto, importe]) => ({ concepto, importe }));
    const { top: topConceptos } = calcularTopN(arregloConceptos, "importe", 6);

    if (topConceptos.length > 0) {
        y = agregarSubSubtitulo(doc, y, "Principales conceptos de nómina del periodo");
        y = agregarGraficaBarras(doc, y, topConceptos.map((c) => ({ label: c.concepto, valor: c.importe })));
    }

    return y;
}

// Resume un arreglo largo de comprobantes: los 10 principales por importe,
// más UN renglón adicional que agrupa el resto ("Otros"). Si hay 10 o menos
// no hace nada (regresa las filas tal cual).
function resumirTop10ConOtros(filas, campoImporte) {
    if (!filas || filas.length <= 10) return filas || [];

    const ordenado = [...filas].sort((a, b) => Math.abs(b[campoImporte] || 0) - Math.abs(a[campoImporte] || 0));
    const top10 = ordenado.slice(0, 10);
    const resto = ordenado.slice(10);

    // Si todo "el resto" comparte la misma moneda la usamos; si están
    // mezcladas (ej. algunas MXN y otras USD), se deja en blanco y el monto
    // se muestra en MXN por convención (money() usa MXN si no hay moneda).
    const monedaResto = resto.every((f) => f.moneda === resto[0].moneda) ? resto[0].moneda : "";

    const otros = {
        serie: "",
        folio: "",
        rfc: "",
        nombre: `Otros (${resto.length} comprobante${resto.length === 1 ? "" : "s"})`,
        [campoImporte]: resto.reduce((a, f) => a + (f[campoImporte] || 0), 0),
        total: resto.reduce((a, f) => a + (f.total || 0), 0),
        moneda: monedaResto,
        dias: "",
    };

    return [...top10, otros];
}

function seccionCuentas(doc, y, datos, ctx, indice, meta, tipo) {
    const filas = tipo === "cxc" ? datos.cxc : datos.cxp;
    if (!filas || filas.length === 0) return y;

    y = iniciarSeccion(doc, indice, tipo === "cxc" ? "Cuentas por Cobrar" : "Cuentas por Pagar", y, meta);

    const campoImporte = tipo === "cxc" ? "porCobrar" : "porPagar";

    if (filas.length > 10) {
        y = agregarParrafo(
            doc,
            y,
            `Se muestran los 10 comprobantes con mayor importe ${tipo === "cxc" ? "por cobrar" : "por pagar"}; el resto (${filas.length - 10} comprobante${filas.length - 10 === 1 ? "" : "s"}) se agrupa en el renglón "Otros".`,
            { fontSize: 8.5, color: COLOR_MUTED }
        );
    }

    const filasResumidas = resumirTop10ConOtros(filas, campoImporte);

    const totalImporte = filas.reduce((a, f) => a + (f[campoImporte] || 0), 0);
    const totalGeneral = filas.reduce((a, f) => a + (f.total || 0), 0);
    const vencidos = filas.filter((f) => (f.dias || 0) > 60).length;
    y = agregarTarjetasEstadisticas(doc, y, [
        { label: tipo === "cxc" ? "Total Por Cobrar" : "Total Por Pagar", valor: money(totalImporte), color: COLOR_HEADER },
        { label: "Total General", valor: money(totalGeneral), color: COLOR_MUTED },
        { label: "Comprobantes > 60 días", valor: vencidos, color: vencidos > 0 ? COLOR_NEGATIVO : COLOR_POSITIVO },
    ]);

    const columnas = [
        { name: "serie", label: "Serie", field: "serie", tipo: "texto" },
        { name: "folio", label: "Folio", field: "folio", tipo: "texto" },
        { name: "rfc", label: "RFC", field: "rfc", tipo: "texto" },
        { name: "nombre", label: "Nombre", field: "nombre", tipo: "texto" },
        { name: "porX", label: tipo === "cxc" ? "Por Cobrar" : "Por Pagar", field: campoImporte, tipo: "moneda" },
        { name: "total", label: "Total", field: "total", tipo: "moneda" },
        { name: "moneda", label: "Moneda", field: "moneda", tipo: "texto" },
        { name: "dias", label: "Días", field: "dias", tipo: "numero" },
    ];
    // agregarTotales aquí suma filasResumidas (top10 + "Otros" si se agrupó),
    // lo cual da el gran total real de TODOS los comprobantes — "Otros" ya
    // trae el subtotal del resto, así que la suma final cuadra exacto.
    y = dibujarTabla(doc, y, {
        columnas,
        filas: filasResumidas,
        opciones: { agregarTotales: true, excluirDeSuma: ["dias"] },
    });

    const textoCaso = evaluarCasos(casosAntiguedadSaldos, { filas, tipo: tipo === "cxc" ? "cobrar" : "pagar" });
    y = agregarParrafo(doc, y, textoCaso);

    return y;
}

function seccionFlujo(doc, y, datos, ctx, indice, meta) {
    const grupos = datos.comparativaFlujoPorMoneda;
    if (!grupos || grupos.length === 0) return y;

    y = iniciarSeccion(doc, indice, "Comparativa de Flujo (PUE)", y, meta);

    grupos.forEach((grupo) => {
        y = agregarSubSubtitulo(doc, y, grupo.moneda);

        const totalEmitido = grupo.filas.reduce((a, f) => a + (f.totalEPUE || 0), 0);
        const totalRecibido = grupo.filas.reduce((a, f) => a + (f.totalRPUE || 0), 0);
        const diferenciaTotal = grupo.filas.reduce((a, f) => a + (f.diferenciaPUE || 0), 0);
        y = agregarTarjetasEstadisticas(doc, y, [
            { label: "Total Emitido PUE", valor: money(totalEmitido, grupo.moneda), color: COLOR_POSITIVO },
            { label: "Total Recibido PUE", valor: money(totalRecibido, grupo.moneda), color: COLOR_NEGATIVO },
            {
                label: "Diferencia",
                valor: money(diferenciaTotal, grupo.moneda),
                color: diferenciaTotal >= 0 ? COLOR_POSITIVO : COLOR_NEGATIVO,
            },
        ]);

        const columnas = [
            { name: "mes", label: "Mes", field: "mes", tipo: "texto" },
            { name: "totalEPUE", label: "Emitido PUE", field: "totalEPUE", tipo: "moneda" },
            { name: "totalRPUE", label: "Recibido PUE", field: "totalRPUE", tipo: "moneda" },
            { name: "diferenciaPUE", label: "Diferencia", field: "diferenciaPUE", tipo: "moneda" },
        ];

        y = dibujarTabla(doc, y, {
            columnas,
            filas: grupo.filas,
            opciones: { enfatizarColumnas: ["diferenciaPUE"], agregarTotales: true },
        });

        y = agregarParrafo(doc, y, evaluarCasos(casosFlujo, { moneda: grupo.moneda, diferenciaTotal }));
    });

    return y;
}

// ----------------------------------------------------------------------------
// ANÁLISIS DE CICLO DE COBRO Y PAGO
// ----------------------------------------------------------------------------
// Compara cuánto tarda la empresa en COBRAR a sus clientes (tablaCxC) contra
// cuánto tarda en PAGAR a sus proveedores (tablaCxP), ponderado por el
// importe de cada comprobante (para que una factura grande pese más que una
// chica). Esto revela la brecha del ciclo de efectivo: si cobras mucho más
// lento de lo que pagas, estás financiando esa diferencia con capital propio
// o líneas de crédito.
function promedioPonderadoDias(filas, campoImporte) {
    if (!filas || filas.length === 0) return null;
    const totalImporte = filas.reduce((a, f) => a + Math.abs(f[campoImporte] || 0), 0);
    if (totalImporte === 0) return null;
    const sumaPonderada = filas.reduce((a, f) => a + (f.dias || 0) * Math.abs(f[campoImporte] || 0), 0);
    return sumaPonderada / totalImporte;
}

function seccionAnalisisCicloCobroPago(doc, y, datos, ctx, indice, meta) {
    const cxc = datos.cxc || [];
    const cxp = datos.cxp || [];
    if (cxc.length === 0 && cxp.length === 0) return y;

    const diasCobrar = promedioPonderadoDias(cxc, "porCobrar");
    const diasPagar = promedioPonderadoDias(cxp, "porPagar");

    y = iniciarSeccion(doc, indice, "Análisis de Ciclo de Cobro y Pago", y, meta);
    y = agregarParrafo(
        doc,
        y,
        "Este análisis compara cuánto tiempo tarda la empresa en cobrar a sus clientes frente a cuánto tiempo tarda en pagar a sus proveedores, ponderado por el importe de cada comprobante (las facturas de mayor monto pesan más en el promedio)."
    );

    if (diasCobrar === null || diasPagar === null) {
        y = agregarParrafo(
            doc,
            y,
            "No se cuenta con suficiente información de cuentas por cobrar y/o por pagar para determinar la brecha del ciclo de efectivo.",
            { color: COLOR_MUTED }
        );
        return y;
    }

    const brecha = diasCobrar - diasPagar;

    y = agregarTarjetasEstadisticas(doc, y, [
        { label: "Días Promedio para Cobrar", valor: `${diasCobrar.toFixed(1)} días`, color: COLOR_NEGATIVO },
        { label: "Días Promedio para Pagar", valor: `${diasPagar.toFixed(1)} días`, color: COLOR_POSITIVO },
        {
            label: "Brecha (Cobrar − Pagar)",
            valor: `${brecha >= 0 ? "+" : ""}${brecha.toFixed(1)} días`,
            color: brecha > 0 ? COLOR_NEGATIVO : COLOR_POSITIVO,
        },
    ]);

    y = agregarGraficaBarras(doc, y, [
        { label: "Días para Cobrar", valor: diasCobrar },
        { label: "Días para Pagar", valor: diasPagar },
    ]);

    let texto;
    if (brecha > 15) {
        texto = `La empresa tarda en promedio ${diasCobrar.toFixed(0)} días en cobrar a sus clientes, mientras que paga a sus proveedores en ${diasPagar.toFixed(0)} días — una brecha de ${brecha.toFixed(0)} días. Esto significa que la empresa financia esa diferencia con capital propio o líneas de crédito, ya que debe cubrir sus pagos antes de recibir el cobro correspondiente. Se recomienda negociar plazos de pago más amplios con proveedores, o políticas de cobranza más estrictas con clientes.`;
    } else if (brecha < -15) {
        texto = `La empresa cobra a sus clientes (${diasCobrar.toFixed(0)} días en promedio) más rápido de lo que paga a sus proveedores (${diasPagar.toFixed(0)} días) — una posición favorable de ${Math.abs(brecha).toFixed(0)} días que le permite financiar parte de su operación con el crédito otorgado por sus proveedores.`;
    } else {
        texto = `Los plazos de cobro (${diasCobrar.toFixed(0)} días) y de pago (${diasPagar.toFixed(0)} días) están razonablemente equilibrados, sin una brecha significativa en el ciclo de efectivo.`;
    }
    y = agregarParrafo(doc, y, texto);

    return y;
}

// ----------------------------------------------------------------------------
// Tabla especial de Comparativa Anual: a diferencia de dibujarTabla() (donde
// el "tipo" se define por COLUMNA), aquí el tipo (moneda/porcentaje) se
// define por FILA — el renglón "Coeficiente de Utilidad" es porcentaje, el
// resto son montos en pesos.
// ----------------------------------------------------------------------------
function formatoCeldaComparativaAnual(valor, tipo) {
    if (valor === null || valor === undefined) return "—";
    if (tipo === "porcentaje") return (Number(valor) * 100).toFixed(2) + "%";
    return money(valor);
}

function dibujarTablaComparativaAnual(doc, y, filas) {
    if (!filas || filas.length === 0) return y;

    const head = [["Declaración Anual", "Determinado", "Declarado", "Diferencia"]];
    const body = filas.map((f) => [
        f.concepto,
        formatoCeldaComparativaAnual(f.determinado, f.tipo),
        formatoCeldaComparativaAnual(f.declarado, f.tipo),
        formatoCeldaComparativaAnual(f.diferencia, f.tipo),
    ]);

    doc.autoTable({
        head,
        body,
        startY: y,
        margin: { left: MARGEN, right: MARGEN, bottom: 16 },
        theme: "grid",
        styles: {
            font: "helvetica",
            fontSize: 6,
            cellPadding: 1.6,
            textColor: COLOR_TEXT,
            lineColor: [225, 225, 225],
            lineWidth: 0.1,
        },
        headStyles: {
            fillColor: COLOR_HEADER,
            textColor: COLOR_HEADER_TEXT,
            fontStyle: "bold",
            halign: "center",
        },
        alternateRowStyles: { fillColor: COLOR_STRIPE },
        columnStyles: {
            0: { halign: "left" },
            1: { halign: "right" },
            2: { halign: "right" },
            3: { halign: "right" },
        },
        didParseCell: (data) => {
            if (data.section !== "body" || data.column.index !== 3) return;
            const fila = filas[data.row.index];
            if (!fila || fila.diferencia === null || fila.diferencia === undefined) return;
            const umbral = fila.tipo === "porcentaje" ? 0.0005 : 1;
            if (Math.abs(fila.diferencia) < umbral) return;
            data.cell.styles.textColor = fila.diferencia >= 0 ? COLOR_POSITIVO : COLOR_NEGATIVO;
            data.cell.styles.fontStyle = "bold";
        },
    });

    return doc.lastAutoTable.finalY + 6;
}

function seccionComparativaAnual(doc, y, datos, ctx, indice, meta) {
    const ca = datos.comparativaAnual;
    if (!ca || !ca.filas || ca.filas.length === 0) return y;

    y = iniciarSeccion(doc, indice, "Comparativa Anual", y, meta);
    y = agregarParrafo(
        doc,
        y,
        `Comparativa entre lo Determinado por el sistema (con base en el Uso de CFDI del ejercicio ${ctx.anio} completo) y lo Declarado ante el SAT en la Declaración Anual.`
    );

    const filaIngresos = ca.filas.find((f) => f.concepto === "Total de Ingresos Acumulables");
    const filaDeducciones = ca.filas.find((f) => f.concepto === "Total de Deducciones Autorizadas");
    const filaUtilidad = ca.filas.find((f) => f.concepto === "Utilidad Fiscal");
    const filaPerdida = ca.filas.find((f) => f.concepto === "Pérdida Fiscal");
    const resultadoDeterminado = (filaUtilidad && filaUtilidad.determinado) || 0;
    const perdidaDeterminada = (filaPerdida && filaPerdida.determinado) || 0;
    y = agregarTarjetasEstadisticas(doc, y, [
        { label: "Ingresos Determinados", valor: money((filaIngresos && filaIngresos.determinado) || 0), color: COLOR_HEADER },
        { label: "Deducciones Determinadas", valor: money((filaDeducciones && filaDeducciones.determinado) || 0), color: COLOR_MUTED },
        {
            label: resultadoDeterminado > 0 ? "Utilidad Determinada" : "Pérdida Determinada",
            valor: money(resultadoDeterminado > 0 ? resultadoDeterminado : perdidaDeterminada),
            color: resultadoDeterminado > 0 ? COLOR_POSITIVO : COLOR_NEGATIVO,
        },
    ]);

    y = dibujarTablaComparativaAnual(doc, y, ca.filas);

    if (ca.mensaje) {
        y = agregarParrafo(doc, y, ca.mensaje, { color: COLOR_MUTED });
    } else {
        y = agregarParrafo(doc, y, evaluarCasos(casosComparativaAnual, { filas: ca.filas }));
    }

    return y;
}


// ----------------------------------------------------------------------------
// Razones Financieras: tabla con "Resultado" coloreado según el semáforo
// (bueno/regular/malo) que ya trae calculado cada razón (campo .color, hex).
// ----------------------------------------------------------------------------
function hexARgb(hex) {
    const limpio = (hex || "#000000").replace("#", "");
    const bigint = parseInt(limpio, 16) || 0;
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

function formatoValorRazon(valor, formato) {
    if (formato === "porcentaje") return `${(valor * 100).toFixed(2)}%`;
    if (formato === "moneda") return money(valor);
    if (formato === "dias") return `${valor.toFixed(1)} días`;
    return `${valor.toFixed(2)} veces`;
}

function dibujarTablaRazones(doc, y, items) {
    if (!items || items.length === 0) return y;

    const head = [["Razón", "Fórmula", "Valor", "Resultado"]];
    const body = items.map((r) => [r.nombre, r.formula, formatoValorRazon(r.valor, r.formato), r.estado.toUpperCase()]);

    doc.autoTable({
        head,
        body,
        startY: y,
        margin: { left: MARGEN, right: MARGEN, bottom: 16 },
        theme: "grid",
        styles: {
            font: "helvetica",
            fontSize: 6,
            cellPadding: 1.4,
            textColor: COLOR_TEXT,
            lineColor: [225, 225, 225],
            lineWidth: 0.1,
            overflow: "linebreak",
        },
        headStyles: { fillColor: COLOR_HEADER, textColor: COLOR_HEADER_TEXT, fontStyle: "bold", halign: "center" },
        alternateRowStyles: { fillColor: COLOR_STRIPE },
        columnStyles: {
            0: { halign: "left", cellWidth: 45 },
            1: { halign: "left" },
            2: { halign: "right", cellWidth: 25 },
            3: { halign: "center", cellWidth: 22 },
        },
        didParseCell: (data) => {
            if (data.section !== "body" || data.column.index !== 3) return;
            const item = items[data.row.index];
            if (!item) return;
            data.cell.styles.textColor = hexARgb(item.color);
            data.cell.styles.fontStyle = "bold";
        },
    });

    return doc.lastAutoTable.finalY + 6;
}

function seccionRazonesFinancieras(doc, y, datos, ctx, indice, meta) {
    const rf = datos.razonesFinancieras;
    if (!rf) return y;

    if (!rf.resumen) {
        if (!rf.mensaje) return y;
        y = iniciarSeccion(doc, indice, "Razones Financieras", y, meta);
        y = agregarParrafo(doc, y, rf.mensaje, { color: COLOR_MUTED });
        return y;
    }

    y = iniciarSeccion(doc, indice, "Razones Financieras", y, meta);
    y = agregarParrafo(
        doc,
        y,
        `El análisis de razones financieras evalúa ${rf.resumen.total} indicadores agrupados en cuatro categorías.`
    );

    y = agregarSubSubtitulo(doc, y, "Salud Financiera General");
    y = agregarMedidorSalud(doc, y, rf.resumen.porcentajeSalud);
    y = agregarTarjetasEstadisticas(doc, y, [
        { label: "Buenas", valor: rf.resumen.buenas, color: COLOR_POSITIVO },
        { label: "Regulares", valor: rf.resumen.regulares, color: [217, 119, 6] },
        { label: "De Atención", valor: rf.resumen.malas, color: COLOR_NEGATIVO },
    ]);
    y = agregarParrafo(doc, y, rf.resumen.veredicto, { bold: true, fontSize: 10 });

    rf.categorias.forEach((cat) => {
        y = agregarSubSubtitulo(doc, y, cat.categoria);
        y = dibujarTablaRazones(doc, y, cat.items);
    });

    if (rf.advertencias && rf.advertencias.length > 0) {
        y = agregarParrafo(
            doc,
            y,
            `Estos datos vinieron en blanco en el Excel y se tomaron como $0: ${rf.advertencias.join(", ")}.`,
            { fontSize: 8, color: COLOR_MUTED }
        );
    }

    return y;
}

// Conclusión final: sintetiza Razones Financieras + Comparativa Anual en una
// recomendación de crédito (ver advertencia de "propuesta ajustable" en
// pdfCasos.js — calcularRangoCredito / construirVeredictoCredito).
function seccionConclusionCredito(doc, y, datos, ctx, indice, meta) {
    const rf = datos.razonesFinancieras;
    const ca = datos.comparativaAnual;
    if (!rf || !rf.resumen) return y; // sin Razones Financieras no hay base objetiva para esta conclusión

    y = iniciarSeccion(doc, indice, "Conclusión: ¿Es Sujeto de Crédito?", y, meta);

    y = agregarSubSubtitulo(doc, y, "Elementos a favor");
    y = agregarListaBullets(doc, y, construirElementosAFavor({ razonesFinancieras: rf }));

    y = agregarSubSubtitulo(doc, y, "Elementos en contra");
    y = agregarListaBullets(doc, y, construirElementosEnContra({ razonesFinancieras: rf, comparativaAnual: ca }));

    y = agregarSubSubtitulo(doc, y, "Evaluación");
    y = agregarParrafo(doc, y, construirVeredictoCredito({ razonesFinancieras: rf, comparativaAnual: ca }));

    const rango = calcularRangoCredito({ razonesFinancieras: rf });
    if (rango) {
        y = agregarCallout(
            doc,
            y,
            "Monto de crédito sugerido (orientativo)",
            `${money(rango.minimo)}  —  ${money(rango.maximo)}`,
            COLOR_HEADER
        );
    }

    y = agregarParrafo(
        doc,
        y,
        "Este reporte es una herramienta de apoyo a la toma de decisiones y no sustituye una auditoría financiera formal, un dictamen fiscal, ni asesoría crediticia profesional.",
        { fontSize: 8, color: COLOR_MUTED }
    );

    return y;
}

function agregarFirma(doc, y, firmante) {
    if (!firmante || !firmante.nombre) return y;

    doc.addPage();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yFirma = 60;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...COLOR_TEXT);
    doc.text("Atentamente", pageWidth / 2, yFirma, { align: "center" });

    yFirma += 25;
    doc.setLineWidth(0.3);
    doc.line(pageWidth / 2 - 45, yFirma, pageWidth / 2 + 45, yFirma);
    yFirma += 5;
    doc.text(firmante.nombre.toUpperCase(), pageWidth / 2, yFirma, { align: "center" });
    if (firmante.puesto) {
        yFirma += 5;
        doc.text(firmante.puesto.toUpperCase(), pageWidth / 2, yFirma, { align: "center" });
    }

    return yFirma;
}

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================
export function generarPdfReporteGeneral(datos, meta = {}) {
    const {
        empresa = "",
        rfc = "",
        ubicacion = "San Andrés Cholula, Puebla",
        firmante = null,
        descargarAutomaticamente = true,
    } = meta;

    const filtros = datos.filtros || {};
    const anio = filtros.anio || new Date().getFullYear();
    const mesInicialLabel = obtenerMesLabel(filtros.mesI);
    const mesFinalLabel = obtenerMesLabel(filtros.mesF);

    const fechaReporte = new Date().toLocaleDateString("es-MX", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    const ctx = { mesInicialLabel, mesFinalLabel, anio };
    const metaEncabezado = { empresa, ubicacion, fechaReporte };

    const doc = nuevoDocumento();

    // 1) Portada
    agregarPortada(doc, { empresa, rfc, mesInicialLabel, mesFinalLabel, anio, fechaReporte });

    // 2) Índice (se reserva, se llena al final con los números de página reales)
    reservarIndice(doc);

    // 3) Contenido — arranca en página 3
    doc.addPage();
    let y = agregarEncabezadoContenido(doc, metaEncabezado);

    const indice = [];
    y = seccionIva(doc, y, datos, ctx, indice, metaEncabezado);
    y = seccionIsr(doc, y, datos, ctx, indice, metaEncabezado);
    y = seccionPagosProvisionales(doc, y, datos, ctx, indice, metaEncabezado);
    y = seccionComparativaAnual(doc, y, datos, ctx, indice, metaEncabezado);
    y = seccionUsoCfdi(doc, y, datos, ctx, indice, metaEncabezado);
    y = seccionEmitidosRecibidos(doc, y, datos, ctx, indice, metaEncabezado, "E");
    y = seccionEmitidosRecibidos(doc, y, datos, ctx, indice, metaEncabezado, "R");
    y = seccionNomina(doc, y, datos, ctx, indice, metaEncabezado);
    y = seccionCuentas(doc, y, datos, ctx, indice, metaEncabezado, "cxc");
    y = seccionCuentas(doc, y, datos, ctx, indice, metaEncabezado, "cxp");
    y = seccionFlujo(doc, y, datos, ctx, indice, metaEncabezado);
    y = seccionAnalisisCicloCobroPago(doc, y, datos, ctx, indice, metaEncabezado);
    y = seccionRazonesFinancieras(doc, y, datos, ctx, indice, metaEncabezado);
    y = seccionConclusionCredito(doc, y, datos, ctx, indice, metaEncabezado);

    if (firmante) {
        agregarFirma(doc, y, firmante);
    }

    // 4) Rellenar el índice ya con las páginas reales
    agregarIndice(doc, indice);

    // 5) Encabezado (empresa/ubicación/fecha) y pie de página, en UNA sola
    // pasada final sobre todas las páginas de contenido (ver por qué en el
    // comentario de agregarEncabezadoEnTodasLasPaginas).
    agregarEncabezadoEnTodasLasPaginas(doc, 3, metaEncabezado);
    agregarPiePagina(doc, 3);

    if (descargarAutomaticamente) {
        const nombreArchivo = `${rfc ? rfc + " - " : ""}${empresa ? empresa + " - " : ""}REPORTE GENERAL ${mesInicialLabel} A ${mesFinalLabel} ${anio}.pdf`;
        doc.save(nombreArchivo);
    }

    return doc;
}