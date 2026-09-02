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
import { PLANTILLA_OBJETIVOS_JPG } from "./plantillaObjetivos";
import { PLANTILLA_INDICE_JPG } from "./plantillaIndice";
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
    "Constancia de Situación Fiscal": "Información General y Cumplimiento",
    "Domicilio Fiscal": "Información General y Cumplimiento",
    "Actividades Económicas": "Información General y Cumplimiento",
    "Opinión de Cumplimiento de Obligaciones Fiscales": "Información General y Cumplimiento",
    "Prevención de Lavado de Dinero (PLD)": "Información General y Cumplimiento",
    "Listado 69-B (EFOS/EDOS)": "Información General y Cumplimiento",
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
    "Conclusión General de Riesgo": "Conclusión y Recomendación",
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
// OBJETIVO DEL ANÁLISIS — página 2, con texto interpretativo sobre el fondo
// de la plantilla de objetivos.
// ----------------------------------------------------------------------------
function agregarPaginaObjetivo(doc, { empresa, fechaReporte }) {
    doc.addPage();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.addImage(PLANTILLA_OBJETIVOS_JPG, "JPEG", 0, 0, pageWidth, pageHeight);

    const x = 20;
    const anchoTexto = pageWidth * 0.6;
    let y = pageHeight * 0.26;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(...COLOR_TEXT);
    doc.text("Objetivo del Análisis", x, y);

    y += 8;
    doc.setDrawColor(...COLOR_HEADER);
    doc.setLineWidth(0.6);
    doc.line(x, y, x + 32, y);
    y += 12;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(...COLOR_TEXT);

    const parrafos = [
        `Este Reporte de Riesgo Financiero tiene como propósito ofrecer un análisis integral y actualizado de la situación fiscal, contable y financiera de ${empresa || "la empresa"}.`,
        "Mediante la revisión de la Constancia de Situación Fiscal, la Opinión de Cumplimiento de Obligaciones Fiscales, la Prevención de Lavado de Dinero, el Listado 69-B, las obligaciones fiscales periódicas y las Razones Financieras de los dos últimos ejercicios cerrados, se evalúan los riesgos fiscales, la salud financiera y la congruencia operativa del negocio.",
        "Con ello se busca brindar elementos objetivos que apoyen la toma de decisiones y ayuden a mitigar posibles contingencias.",
    ];

    parrafos.forEach((texto) => {
        const lineas = doc.splitTextToSize(texto, anchoTexto);
        lineas.forEach((linea) => {
            doc.text(linea, x, y);
            y += 5.4;
        });
        y += 5;
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...COLOR_MUTED);
    doc.text(`Fecha de emisión: ${fechaReporte}`, x, pageHeight - 16);
}

// ----------------------------------------------------------------------------
// ÍNDICE — se reserva una página en blanco y se llena al final, cuando ya
// se conoce en qué página quedó cada sección.
// ----------------------------------------------------------------------------
function reservarIndice(doc) {
    doc.addPage(); // página 3 (después de portada y objetivo)
}

function agregarIndice(doc, partes) {
    const paginaIndice = 3;
    doc.setPage(paginaIndice);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.addImage(PLANTILLA_INDICE_JPG, "JPEG", 0, 0, pageWidth, pageHeight);

    let y = 24;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...COLOR_TEXT);
    doc.text("CONTENIDO", MARGEN, y);
    y += 6;
    doc.setDrawColor(...COLOR_HEADER);
    doc.setLineWidth(0.6);
    doc.line(MARGEN, y, MARGEN + 28, y);
    y += 14;

    partes.forEach((parte) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11.5);
        doc.setTextColor(...COLOR_TEXT);
        const textoIzquierda = `${parte.numeroParte}-  ${parte.categoria}`;
        const lineasTexto = doc.splitTextToSize(textoIzquierda, anchoUtil(doc) - 20);
        doc.text(lineasTexto, MARGEN, y);

        doc.setFont("helvetica", "normal");
        const textoDerecha = String(parte.pagina);
        const anchoDerecha = doc.getTextWidth(textoDerecha);
        doc.text(textoDerecha, pageWidth - MARGEN - anchoDerecha, y);

        const anchoIzquierda = doc.getTextWidth(lineasTexto[0]);
        const xInicioPuntos = MARGEN + anchoIzquierda + 3;
        const xFinPuntos = pageWidth - MARGEN - anchoDerecha - 3;
        doc.setDrawColor(205, 205, 205);
        doc.setLineDashPattern([0.6, 1.2], 0);
        if (xFinPuntos > xInicioPuntos) {
            doc.line(xInicioPuntos, y - 1, xFinPuntos, y - 1);
        }
        doc.setLineDashPattern([], 0);

        y += 8 * lineasTexto.length + 6;
    });
}

// ----------------------------------------------------------------------------
// Encabezado de página de contenido
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

function agregarPiePagina(doc, paginaInicioContenido, paginasOmitir = new Set()) {
    const totalPaginas = doc.internal.getNumberOfPages();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    for (let i = paginaInicioContenido; i <= totalPaginas; i++) {
        if (paginasOmitir.has(i)) continue;
        doc.setPage(i);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...COLOR_TEXT);
        doc.text(`Página ${i}`, pageWidth / 2, pageHeight - 10, { align: "center" });
    }
}

function agregarEncabezadoEnTodasLasPaginas(doc, paginaInicioContenido, meta, paginasOmitir = new Set()) {
    const totalPaginas = doc.internal.getNumberOfPages();
    for (let i = paginaInicioContenido; i <= totalPaginas; i++) {
        if (paginasOmitir.has(i)) continue;
        doc.setPage(i);
        agregarEncabezadoContenido(doc, meta);
    }
}

// Página divisoria de PARTE (a pantalla completa, con su propio mini-índice
// de subsecciones — estilo "1-1, 1-2, 1-3..." del ejemplo de referencia).
function agregarDividerParte(doc, numeroParte, categoria, items) {
    doc.addPage();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFillColor(...COLOR_HEADER);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    let y = pageHeight * 0.3;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text(`PARTE ${numeroParte}`, MARGEN, y);

    y += 11;
    doc.setFontSize(22);
    const lineasTitulo = doc.splitTextToSize(categoria.toUpperCase(), anchoUtil(doc) - 10);
    lineasTitulo.forEach((linea) => {
        doc.text(linea, MARGEN, y);
        y += 9.5;
    });

    y += 8;
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    doc.line(MARGEN, y, MARGEN + 40, y);
    y += 11;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.text("Este apartado se compone de:", MARGEN, y);
    y += 9;

    items.forEach((item) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.text(item.numero, MARGEN, y);
        doc.setFont("helvetica", "normal");
        const lineasItem = doc.splitTextToSize(item.titulo, anchoUtil(doc) - 20);
        doc.text(lineasItem, MARGEN + 16, y);
        y += 7.5 * lineasItem.length + 1;
    });
}

function iniciarSeccion(doc, indice, titulo, y, meta) {
    const { empresa, ubicacion, fechaReporte, numerosPorTitulo = {} } = meta;
    const categoria = CATEGORIA_SECCION[titulo] || "General";
    const color = COLOR_HEADER; // mismo color para todas las secciones

    if (indice.length > 0) {
        y += 10;
    }

    if (y + 22 > altoUtil(doc)) {
        doc.addPage();
        y = agregarEncabezadoContenido(doc, { empresa, ubicacion, fechaReporte });
    }

    const numero = numerosPorTitulo[titulo] || String(indice.length + 1);
    indice.push({ numero, titulo, pagina: doc.internal.getNumberOfPages(), categoria, color });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...color);
    doc.text(`${numero}.`, MARGEN, y);
    doc.setTextColor(...COLOR_TEXT);
    doc.text(titulo.toUpperCase(), MARGEN + 16, y);

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
// SECCIONES NUEVAS: INFORMACIÓN GENERAL Y CUMPLIMIENTO
// ============================================================================

function seccionConstancia(doc, y, datos, ctx, indice, meta) {
    y = iniciarSeccion(doc, indice, "Constancia de Situación Fiscal", y, meta);

    if (datos.constancia && datos.constancia.disponible) {
        y = agregarParrafo(
            doc,
            y,
            "Se anexa al final de este documento la Constancia de Situación Fiscal vigente del contribuyente, descargada directamente del portal del SAT."
        );
    } else {
        y = agregarParrafo(
            doc,
            y,
            "Aún no se ha descargado la Constancia de Situación Fiscal vigente del contribuyente.",
            { color: COLOR_MUTED }
        );
    }

    return y;
}

function construirDomicilioTexto(d) {
    const partes = [];
    if (d.tipoVialidad || d.calle) partes.push(`${d.tipoVialidad || ""} ${d.calle || ""}`.trim());
    if (d.numeroExterior) partes.push(`No. ${d.numeroExterior}`);
    if (d.numeroInterior) partes.push(`Int. ${d.numeroInterior}`);
    if (d.colonia) partes.push(`Col. ${d.colonia}`);
    if (d.municipio) partes.push(d.municipio);
    if (d.localidad && d.localidad !== d.municipio) partes.push(d.localidad);
    if (d.entidadFederativa) partes.push(d.entidadFederativa);
    if (d.codigoPostal) partes.push(`C.P. ${d.codigoPostal}`);
    return partes.filter(Boolean).join(", ");
}

function seccionDomicilio(doc, y, datos, ctx, indice, meta) {
    const d = datos.domicilioFiscal;
    if (!d) return y; // sin datos parseados todavía: la sección no se dibuja

    y = iniciarSeccion(doc, indice, "Domicilio Fiscal", y, meta);

    const direccion = construirDomicilioTexto(d);
    y = agregarParrafo(
        doc,
        y,
        `El domicilio fiscal registrado ante el SAT, según la Constancia de Situación Fiscal, es: ${direccion}.`
    );
    if (d.entreCalle) {
        y = agregarParrafo(doc, y, `Entre calle: ${d.entreCalle}.`, { fontSize: 9, color: COLOR_MUTED });
    }

    return y;
}

function seccionActividadesEconomicas(doc, y, datos, ctx, indice, meta) {
    const filas = datos.actividadesEconomicas;
    if (!filas || filas.length === 0) return y; // sin datos parseados todavía

    y = iniciarSeccion(doc, indice, "Actividades Económicas", y, meta);
    y = agregarParrafo(
        doc,
        y,
        "Las actividades económicas registradas ante el SAT, según la Constancia de Situación Fiscal, son:"
    );

    const activasSinBaja = filas.filter((f) => !f.fechaFin);
    const conBaja = filas.filter((f) => !!f.fechaFin);

    const columnas = [
        { name: "orden", label: "Orden", field: "orden", tipo: "numero" },
        { name: "actividad", label: "Actividad Económica", field: "actividad", tipo: "texto" },
        { name: "porcentaje", label: "Porcentaje", field: "porcentaje", tipo: "numero" },
        { name: "fechaInicio", label: "Fecha Inicio", field: "fechaInicio", tipo: "texto" },
        { name: "fechaFin", label: "Fecha Fin", field: "fechaFin", tipo: "texto" },
    ];
    y = dibujarTabla(doc, y, { columnas, filas });

    if (conBaja.length > 0) {
        y = agregarParrafo(
            doc,
            y,
            `Se identifican ${conBaja.length} actividad(es) económica(s) dada(s) de baja: ${conBaja.map((f) => f.actividad).join(", ")}.`,
            { fontSize: 9, color: COLOR_MUTED }
        );
    }
    if (activasSinBaja.length > 1) {
        y = agregarParrafo(
            doc,
            y,
            `La empresa declara ${activasSinBaja.length} actividades económicas vigentes de forma simultánea.`,
            { fontSize: 9, color: COLOR_MUTED }
        );
    }

    return y;
}

function seccionOpinionCumplimiento(doc, y, datos, ctx, indice, meta) {
    y = iniciarSeccion(doc, indice, "Opinión de Cumplimiento de Obligaciones Fiscales", y, meta);

    const op = datos.opinionCumplimiento;
    if (!op || !op.sentido) {
        y = agregarParrafo(
            doc,
            y,
            "Esta sección está pendiente de integrar el resultado de la Opinión de Cumplimiento de Obligaciones Fiscales.",
            { color: COLOR_MUTED }
        );
        return y;
    }

    const SENTIDOS = {
        POSITIVO: {
            texto: "El Servicio de Administración Tributaria emitió opinión POSITIVA respecto al cumplimiento de las obligaciones fiscales del contribuyente.",
            color: COLOR_POSITIVO,
        },
        NEGATIVO: {
            texto: "El Servicio de Administración Tributaria emitió opinión NEGATIVA respecto al cumplimiento de las obligaciones fiscales del contribuyente. Se recomienda revisar los adeudos u omisiones detectadas antes de continuar la relación comercial.",
            color: COLOR_NEGATIVO,
        },
        INSCRITO_SIN_OBLIGACIONES: {
            texto: "El contribuyente está inscrito en el RFC, pero no cuenta con obligaciones fiscales registradas ante el SAT.",
            color: [217, 119, 6],
        },
    };
    const info = SENTIDOS[op.sentido] || { texto: "No se pudo determinar el sentido de la Opinión de Cumplimiento.", color: COLOR_MUTED };

    y = agregarCallout(doc, y, "Sentido de la opinión", op.sentido.replace(/_/g, " "), info.color);
    y = agregarParrafo(doc, y, info.texto);
    if (op.fecha) {
        y = agregarParrafo(doc, y, `Revisión practicada el ${op.fecha}.`, { fontSize: 9, color: COLOR_MUTED });
    }

    return y;
}

function seccionPld(doc, y, datos, ctx, indice, meta) {
    y = iniciarSeccion(doc, indice, "Prevención de Lavado de Dinero (PLD)", y, meta);

    const pld = datos.pld;
    if (!pld) {
        y = agregarParrafo(
            doc,
            y,
            "Esta sección está pendiente de integrar el servicio de búsqueda en listas nacionales e internacionales de prevención de lavado de dinero, financiamiento al terrorismo y personas políticamente expuestas.",
            { color: COLOR_MUTED }
        );
        return y;
    }

    y = agregarParrafo(
        doc,
        y,
        `Se realizó una búsqueda del contribuyente en ${pld.totalRevisadas} listas nacionales e internacionales especializadas en la prevención de lavado de dinero, financiamiento al terrorismo y la identificación de personas políticamente expuestas.`
    );

    y = agregarTarjetasEstadisticas(doc, y, [
        { label: "Listas Revisadas", valor: pld.totalRevisadas, color: COLOR_HEADER },
        {
            label: "Coincidencias",
            valor: pld.totalCoincidencias,
            color: pld.totalCoincidencias > 0 ? COLOR_NEGATIVO : COLOR_POSITIVO,
        },
    ]);

    const columnas = [
        { name: "nombre", label: "Lista", field: "nombre", tipo: "texto" },
        { name: "coincidencia", label: "Coincidencia", field: "coincidencia", tipo: "texto" },
    ];
    const filas = (pld.listas || []).map((l) => ({ ...l, coincidencia: l.coincidencia ? "SÍ" : "NO" }));
    y = dibujarTabla(doc, y, { columnas, filas });

    return y;
}

function seccion69B(doc, y, datos, ctx, indice, meta) {
    y = iniciarSeccion(doc, indice, "Listado 69-B (EFOS/EDOS)", y, meta);

    const l69b = datos.listado69b;
    if (!l69b) {
        y = agregarParrafo(
            doc,
            y,
            "Esta sección está pendiente de integrar la consulta al Listado 69-B del SAT (empresas que facturan operaciones simuladas — EFOS — y sus contrapartes — EDOS).",
            { color: COLOR_MUTED }
        );
        return y;
    }

    const ESTADOS = {
        sin_coincidencia: { texto: "No se encontró al contribuyente en el Listado 69-B del SAT.", color: COLOR_POSITIVO },
        presunto: { texto: "El contribuyente se encuentra en el listado de PRESUNTOS EFOS.", color: COLOR_NEGATIVO },
        definitivo: { texto: "El contribuyente se encuentra en el listado de EFOS DEFINITIVOS.", color: COLOR_NEGATIVO },
        desvirtuado: { texto: "El contribuyente logró desvirtuar la presunción y fue retirado del listado.", color: [217, 119, 6] },
        sentencia_favorable: { texto: "El contribuyente obtuvo sentencia favorable respecto de su inclusión en el listado.", color: [217, 119, 6] },
    };
    const info = ESTADOS[l69b.estado] || { texto: "Estado no reconocido.", color: COLOR_MUTED };

    y = agregarCallout(doc, y, "Resultado 69-B", info.texto, info.color);
    if (l69b.fecha) {
        y = agregarParrafo(doc, y, `Fecha de publicación/actualización: ${l69b.fecha}.`, { fontSize: 9, color: COLOR_MUTED });
    }
    if (l69b.detalle) {
        y = agregarParrafo(doc, y, l69b.detalle);
    }

    return y;
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
    y = agregarParrafo(
        doc,
        y,
        tipo === "E"
            ? "El siguiente listado concentra, por cada RFC receptor, los comprobantes fiscales emitidos por la empresa durante el periodo, ordenados de mayor a menor importe."
            : "El siguiente listado concentra, por cada RFC emisor, los comprobantes fiscales recibidos por la empresa durante el periodo, ordenados de mayor a menor importe."
    );

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
    y = agregarParrafo(
        doc,
        y,
        "El siguiente resumen muestra, mes a mes, el número de trabajadores y los importes de percepciones, deducciones y pagos netos registrados en los comprobantes de nómina timbrados durante el periodo."
    );

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

function resumirTop10ConOtros(filas, campoImporte) {
    if (!filas || filas.length <= 10) return filas || [];

    const ordenado = [...filas].sort((a, b) => Math.abs(b[campoImporte] || 0) - Math.abs(a[campoImporte] || 0));
    const top10 = ordenado.slice(0, 10);
    const resto = ordenado.slice(10);

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
    y = agregarParrafo(
        doc,
        y,
        tipo === "cxc"
            ? "El siguiente listado muestra los comprobantes emitidos que, al cierre del periodo, aún no han sido cobrados en su totalidad, junto con los días de crédito otorgados a cada cliente."
            : "El siguiente listado muestra los comprobantes recibidos que, al cierre del periodo, aún no han sido pagados en su totalidad, junto con los días de crédito otorgados por cada proveedor."
    );

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
    y = agregarParrafo(
        doc,
        y,
        "Se compara, mes a mes y por cada moneda operada, el importe cobrado o pagado de forma inmediata (comprobantes con método de pago PUE) entre lo emitido y lo recibido."
    );

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

function seccionRazonesFinancierasDeUnEjercicio(doc, y, ejercicioRazones) {
    if (!ejercicioRazones.resumen) {
        if (!ejercicioRazones.mensaje) return y;
        y = agregarSubSubtitulo(doc, y, `Ejercicio ${ejercicioRazones.anio}`);
        y = agregarParrafo(doc, y, ejercicioRazones.mensaje, { color: COLOR_MUTED });
        return y;
    }

    y = agregarSubSubtitulo(doc, y, `Ejercicio ${ejercicioRazones.anio}`);
    y = agregarMedidorSalud(doc, y, ejercicioRazones.resumen.porcentajeSalud);
    y = agregarTarjetasEstadisticas(doc, y, [
        { label: "Buenas", valor: ejercicioRazones.resumen.buenas, color: COLOR_POSITIVO },
        { label: "Regulares", valor: ejercicioRazones.resumen.regulares, color: [217, 119, 6] },
        { label: "De Atención", valor: ejercicioRazones.resumen.malas, color: COLOR_NEGATIVO },
    ]);
    y = agregarParrafo(doc, y, ejercicioRazones.resumen.veredicto, { bold: true, fontSize: 10 });

    ejercicioRazones.categorias.forEach((cat) => {
        y = agregarSubSubtitulo(doc, y, cat.categoria);
        y = dibujarTablaRazones(doc, y, cat.items);
    });

    if (ejercicioRazones.advertencias && ejercicioRazones.advertencias.length > 0) {
        y = agregarParrafo(
            doc,
            y,
            `Estos datos vinieron en blanco en el Excel ${ejercicioRazones.anio} y se tomaron como $0: ${ejercicioRazones.advertencias.join(", ")}.`,
            { fontSize: 8, color: COLOR_MUTED }
        );
    }

    return y + 3;
}

// CAMBIO AUTORIZADO: ahora datos.razonesFinancieras trae { actual, anterior, mensaje }
// (los dos últimos ejercicios cerrados) en vez de un solo objeto {razones, categorias, resumen}.
function seccionRazonesFinancieras(doc, y, datos, ctx, indice, meta) {
    const rf = datos.razonesFinancieras;
    if (!rf || !rf.actual) return y;

    const hayAlgunResumen = (rf.actual && rf.actual.resumen) || (rf.anterior && rf.anterior.resumen);
    if (!hayAlgunResumen && !rf.actual.mensaje && !(rf.anterior && rf.anterior.mensaje)) return y;

    y = iniciarSeccion(doc, indice, "Razones Financieras", y, meta);
    const textoIntro = rf.anterior
        ? `Se evalúan los indicadores financieros de los dos últimos ejercicios cerrados (${rf.actual.anio} y ${rf.anterior.anio}), agrupados en cuatro categorías.`
        : `El análisis de razones financieras evalúa los indicadores del ejercicio ${rf.actual.anio}, agrupados en cuatro categorías.`;
    y = agregarParrafo(doc, y, textoIntro);

    y = seccionRazonesFinancierasDeUnEjercicio(doc, y, rf.actual);
    if (rf.anterior) y = seccionRazonesFinancierasDeUnEjercicio(doc, y, rf.anterior);

    return y;
}

// CAMBIO AUTORIZADO: usa rf.actual (ejercicio más reciente) como base de la
// conclusión de crédito, y agrega una línea de tendencia si rf.anterior
// también tiene datos.
function seccionConclusionCredito(doc, y, datos, ctx, indice, meta) {
    const rf = datos.razonesFinancieras;
    const ca = datos.comparativaAnual;
    if (!rf || !rf.actual || !rf.actual.resumen) return y;

    const rfActual = rf.actual;
    const rfAnterior = rf.anterior;

    y = iniciarSeccion(doc, indice, "Conclusión: ¿Es Sujeto de Crédito?", y, meta);
    y = agregarParrafo(
        doc,
        y,
        "A partir del análisis de Razones Financieras, se resumen a continuación los elementos que favorecen y los que perjudican la posibilidad de que la empresa sea sujeta de crédito, junto con un monto orientativo sugerido."
    );
    if (rfAnterior) {
        y = agregarParrafo(
            doc,
            y,
            `Esta conclusión se basa en las Razones Financieras del ejercicio ${rfActual.anio} (el más reciente disponible).`,
            { fontSize: 8, color: COLOR_MUTED }
        );
    }

    y = agregarSubSubtitulo(doc, y, "Elementos a favor");
    y = agregarListaBullets(doc, y, construirElementosAFavor({ razonesFinancieras: rfActual }));

    y = agregarSubSubtitulo(doc, y, "Elementos en contra");
    y = agregarListaBullets(doc, y, construirElementosEnContra({ razonesFinancieras: rfActual, comparativaAnual: ca }));

    if (rfAnterior && rfAnterior.resumen) {
        const delta = rfActual.resumen.porcentajeSalud - rfAnterior.resumen.porcentajeSalud;
        let textoTendencia;
        if (Math.abs(delta) < 0.03) {
            textoTendencia = `La salud financiera se mantuvo estable entre ${rfAnterior.anio} (${(rfAnterior.resumen.porcentajeSalud * 100).toFixed(0)}%) y ${rfActual.anio} (${(rfActual.resumen.porcentajeSalud * 100).toFixed(0)}%).`;
        } else if (delta > 0) {
            textoTendencia = `La salud financiera mejoró de ${(rfAnterior.resumen.porcentajeSalud * 100).toFixed(0)}% en ${rfAnterior.anio} a ${(rfActual.resumen.porcentajeSalud * 100).toFixed(0)}% en ${rfActual.anio}.`;
        } else {
            textoTendencia = `La salud financiera empeoró de ${(rfAnterior.resumen.porcentajeSalud * 100).toFixed(0)}% en ${rfAnterior.anio} a ${(rfActual.resumen.porcentajeSalud * 100).toFixed(0)}% en ${rfActual.anio}.`;
        }
        y = agregarParrafo(doc, y, textoTendencia, { fontSize: 9.5 });
    }

    y = agregarSubSubtitulo(doc, y, "Evaluación");
    y = agregarParrafo(doc, y, construirVeredictoCredito({ razonesFinancieras: rfActual, comparativaAnual: ca }));

    const rango = calcularRangoCredito({ razonesFinancieras: rfActual });
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

// Semáforo de conclusión: cada renglón es un círculo de color + símbolo,
// igual que las "Conclusiones" del ejemplo de referencia.
function dibujarSemaforo(doc, y, items) {
    const COLORES_ESTADO = {
        positivo: COLOR_POSITIVO,
        negativo: COLOR_NEGATIVO,
        alerta: [217, 119, 6],
        pendiente: COLOR_MUTED,
    };
    const SIMBOLOS_ESTADO = { positivo: "+", negativo: "–", alerta: "!", pendiente: "?" };

    items.forEach((item) => {
        y = asegurarEspacio(doc, y, 11);
        const color = COLORES_ESTADO[item.estado] || COLOR_MUTED;

        doc.setFillColor(...color);
        doc.circle(MARGEN + 3, y - 1.3, 3.2, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.text(SIMBOLOS_ESTADO[item.estado] || "?", MARGEN + 3, y, { align: "center" });

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...COLOR_TEXT);
        doc.text(item.texto, MARGEN + 11, y);

        y += 9.5;
    });

    return y + 3;
}

function seccionConclusionGeneralRiesgo(doc, y, datos, ctx, indice, meta) {
    y = iniciarSeccion(doc, indice, "Conclusión General de Riesgo", y, meta);
    y = agregarParrafo(
        doc,
        y,
        "Este resumen combina los principales hallazgos de cumplimiento y salud financiera revisados a lo largo de este reporte."
    );

    const items = [];

    if (datos.domicilioFiscal || (datos.actividadesEconomicas && datos.actividadesEconomicas.length > 0)) {
        items.push({ texto: "Domicilio y Actividades Económicas declarados ante el SAT", estado: "positivo" });
    } else {
        items.push({ texto: "Domicilio y Actividades Económicas declarados ante el SAT", estado: "pendiente" });
    }

    const op = datos.opinionCumplimiento;
    if (!op || !op.sentido) {
        items.push({ texto: "Opinión de Cumplimiento de Obligaciones Fiscales", estado: "pendiente" });
    } else if (op.sentido === "POSITIVO") {
        items.push({ texto: "Opinión de Cumplimiento de Obligaciones Fiscales", estado: "positivo" });
    } else if (op.sentido === "NEGATIVO") {
        items.push({ texto: "Opinión de Cumplimiento de Obligaciones Fiscales", estado: "negativo" });
    } else {
        items.push({ texto: "Opinión de Cumplimiento de Obligaciones Fiscales", estado: "alerta" });
    }

    if (!datos.pld) {
        items.push({ texto: "Prevención de Lavado de Dinero (PLD)", estado: "pendiente" });
    } else {
        items.push({
            texto: "Prevención de Lavado de Dinero (PLD)",
            estado: datos.pld.totalCoincidencias > 0 ? "negativo" : "positivo",
        });
    }

    if (!datos.listado69b) {
        items.push({ texto: "Listado 69-B (EFOS/EDOS)", estado: "pendiente" });
    } else {
        const negativos = ["presunto", "definitivo"];
        const alertas = ["desvirtuado", "sentencia_favorable"];
        const estado69b = negativos.includes(datos.listado69b.estado)
            ? "negativo"
            : alertas.includes(datos.listado69b.estado)
            ? "alerta"
            : "positivo";
        items.push({ texto: "Listado 69-B (EFOS/EDOS)", estado: estado69b });
    }

    const rf = datos.razonesFinancieras && datos.razonesFinancieras.actual;
    if (!rf || !rf.resumen) {
        items.push({ texto: "Salud Financiera (Razones Financieras)", estado: "pendiente" });
    } else if (rf.resumen.porcentajeSalud >= 0.75) {
        items.push({ texto: "Salud Financiera (Razones Financieras)", estado: "positivo" });
    } else if (rf.resumen.porcentajeSalud >= 0.5) {
        items.push({ texto: "Salud Financiera (Razones Financieras)", estado: "alerta" });
    } else {
        items.push({ texto: "Salud Financiera (Razones Financieras)", estado: "negativo" });
    }

    y = dibujarSemaforo(doc, y, items);

    y = agregarParrafo(
        doc,
        y,
        "Símbolos: (+) favorable · (!) requiere atención · (–) desfavorable · (?) pendiente de integrar.",
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
// MANIFIESTO DE SECCIONES
// ----------------------------------------------------------------------------
// Cada condición debe reflejar el mismo criterio con el que la sección
// correspondiente decide dibujarse o no (su primer "if (...) return y").
// Se usa para: (a) decidir qué entra en la página divisoria de cada Parte,
// y (b) asignar la numeración jerárquica "parte-subsección" (ej. "3-2").
// ============================================================================
const condicionDomicilio = (datos) => !!datos.domicilioFiscal;
const condicionConstancia = () => true; // siempre se muestra (con dato de disponibilidad, o "pendiente")
const condicionActividadesEconomicas = (datos) => !!(datos.actividadesEconomicas && datos.actividadesEconomicas.length > 0);
const condicionOpinionCumplimiento = () => true; // siempre se muestra (con datos, o "pendiente de integrar")
const condicionPld = () => true; // siempre se muestra (con datos, o "pendiente de integrar")
const condicion69B = () => true; // siempre se muestra (con datos, o "pendiente de integrar")
const condicionIva = (datos) => !!(datos.pagosIva && datos.pagosIva.length > 0);
const condicionIsr = (datos) => {
    const pagosIsr = datos.pagosIsr;
    if (!pagosIsr) return false;
    return ISR_CATEGORIAS.some((c) =>
        (pagosIsr[c.key] || []).some(
            (f) => Math.abs(f.importe || 0) > 0.009 || Math.abs(f.comparativa || 0) > 0.009 || Math.abs(f.diferencia || 0) > 0.009
        )
    );
};
const condicionPagosProvisionales = (datos) => !!datos.pagosProvisionales;
const condicionComparativaAnual = (datos) => !!(datos.comparativaAnual && datos.comparativaAnual.filas && datos.comparativaAnual.filas.length > 0);
const condicionUsoCfdi = (datos) => !!(datos.usoCfdi && datos.usoCfdi.length > 0);
const condicionEmitidos = (datos) => !!(datos.comprobantesEmitidos && datos.comprobantesEmitidos.length > 0);
const condicionRecibidos = (datos) => !!(datos.comprobantesRecibidos && datos.comprobantesRecibidos.length > 0);
const condicionNomina = (datos) => !!(datos.nomina && datos.nomina.length > 0);
const condicionCxc = (datos) => !!(datos.cxc && datos.cxc.length > 0);
const condicionCxp = (datos) => !!(datos.cxp && datos.cxp.length > 0);
const condicionFlujo = (datos) => !!(datos.comparativaFlujoPorMoneda && datos.comparativaFlujoPorMoneda.length > 0);
const condicionCiclo = (datos) => condicionCxc(datos) || condicionCxp(datos);
const condicionRazonesFinancieras = (datos) => {
    const rf = datos.razonesFinancieras;
    if (!rf || !rf.actual) return false;
    const hayAlgunResumen = (rf.actual && rf.actual.resumen) || (rf.anterior && rf.anterior.resumen);
    return !!(hayAlgunResumen || rf.actual.mensaje || (rf.anterior && rf.anterior.mensaje));
};
const condicionConclusionCredito = (datos) => {
    const rf = datos.razonesFinancieras;
    return !!(rf && rf.actual && rf.actual.resumen);
};
const condicionConclusionGeneralRiesgo = () => true; // síntesis: siempre se muestra, cada renglón resuelve su propio pendiente

const SECCIONES_DISPONIBLES = [
    { titulo: "Constancia de Situación Fiscal", condicion: condicionConstancia, dibujar: seccionConstancia },
    { titulo: "Domicilio Fiscal", condicion: condicionDomicilio, dibujar: seccionDomicilio },
    { titulo: "Actividades Económicas", condicion: condicionActividadesEconomicas, dibujar: seccionActividadesEconomicas },
    { titulo: "Opinión de Cumplimiento de Obligaciones Fiscales", condicion: condicionOpinionCumplimiento, dibujar: seccionOpinionCumplimiento },
    { titulo: "Prevención de Lavado de Dinero (PLD)", condicion: condicionPld, dibujar: seccionPld },
    { titulo: "Listado 69-B (EFOS/EDOS)", condicion: condicion69B, dibujar: seccion69B },
    { titulo: "Pagos de IVA", condicion: condicionIva, dibujar: seccionIva },
    { titulo: "Retenciones de ISR", condicion: condicionIsr, dibujar: seccionIsr },
    { titulo: "Pagos Provisionales de ISR", condicion: condicionPagosProvisionales, dibujar: seccionPagosProvisionales },
    { titulo: "Comparativa Anual", condicion: condicionComparativaAnual, dibujar: seccionComparativaAnual },
    { titulo: "Uso del CFDI", condicion: condicionUsoCfdi, dibujar: seccionUsoCfdi },
    { titulo: "Comprobantes Emitidos por RFC", condicion: condicionEmitidos, dibujar: (doc, y, datos, ctx, indice, meta) => seccionEmitidosRecibidos(doc, y, datos, ctx, indice, meta, "E") },
    { titulo: "Comprobantes Recibidos por RFC", condicion: condicionRecibidos, dibujar: (doc, y, datos, ctx, indice, meta) => seccionEmitidosRecibidos(doc, y, datos, ctx, indice, meta, "R") },
    { titulo: "Nómina Pagada", condicion: condicionNomina, dibujar: seccionNomina },
    { titulo: "Cuentas por Cobrar", condicion: condicionCxc, dibujar: (doc, y, datos, ctx, indice, meta) => seccionCuentas(doc, y, datos, ctx, indice, meta, "cxc") },
    { titulo: "Cuentas por Pagar", condicion: condicionCxp, dibujar: (doc, y, datos, ctx, indice, meta) => seccionCuentas(doc, y, datos, ctx, indice, meta, "cxp") },
    { titulo: "Comparativa de Flujo (PUE)", condicion: condicionFlujo, dibujar: seccionFlujo },
    { titulo: "Análisis de Ciclo de Cobro y Pago", condicion: condicionCiclo, dibujar: seccionAnalisisCicloCobroPago },
    { titulo: "Razones Financieras", condicion: condicionRazonesFinancieras, dibujar: seccionRazonesFinancieras },
    { titulo: "Conclusión: ¿Es Sujeto de Crédito?", condicion: condicionConclusionCredito, dibujar: seccionConclusionCredito },
    { titulo: "Conclusión General de Riesgo", condicion: condicionConclusionGeneralRiesgo, dibujar: seccionConclusionGeneralRiesgo },
];

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

    const doc = nuevoDocumento();

    // 1) Portada
    agregarPortada(doc, { empresa, rfc, mesInicialLabel, mesFinalLabel, anio, fechaReporte });

    // 2) Objetivo del Análisis
    agregarPaginaObjetivo(doc, { empresa, fechaReporte });

    // 3) Índice/CONTENIDO (se reserva, se llena al final ya con las páginas reales)
    reservarIndice(doc);

    // 3) Manifiesto: qué secciones tienen contenido, agrupadas por Parte, con
    //    numeración jerárquica "parte-subsección" (ej. Parte II, sección 2 = "II-2")
    const seccionesConContenido = SECCIONES_DISPONIBLES.filter((s) => {
        try {
            return s.condicion(datos);
        } catch (e) {
            console.log(`Error evaluando la condición de la sección "${s.titulo}":`, e);
            return false;
        }
    });

    const categoriasOrden = [];
    seccionesConContenido.forEach((s) => {
        const categoria = CATEGORIA_SECCION[s.titulo] || "General";
        if (!categoriasOrden.includes(categoria)) categoriasOrden.push(categoria);
    });

    const numerosPorTitulo = {};
    const gruposPorParte = categoriasOrden.map((categoria, idxParte) => {
        const numeroParte = ROMANOS[idxParte] || String(idxParte + 1);
        const items = seccionesConContenido.filter((s) => (CATEGORIA_SECCION[s.titulo] || "General") === categoria);
        items.forEach((s, idxSub) => {
            numerosPorTitulo[s.titulo] = `${numeroParte}-${idxSub + 1}`;
        });
        return { numeroParte, categoria, items };
    });

    const metaEncabezado = { empresa, ubicacion, fechaReporte, numerosPorTitulo };

    // 4) Una página divisoria por Parte (con su mini-índice de subsecciones),
    //    seguida del contenido real de cada una de sus secciones
    const partesParaIndice = [];
    const paginasDivisoras = new Set();
    const indice = [];
    let y = MARGEN + 6;

    gruposPorParte.forEach((grupo) => {
        const itemsConNumero = grupo.items.map((s) => ({ numero: numerosPorTitulo[s.titulo], titulo: s.titulo }));
        agregarDividerParte(doc, grupo.numeroParte, grupo.categoria, itemsConNumero);
        const paginaDivisoria = doc.internal.getNumberOfPages();
        paginasDivisoras.add(paginaDivisoria);
        partesParaIndice.push({ numeroParte: grupo.numeroParte, categoria: grupo.categoria, pagina: paginaDivisoria });

        doc.addPage();
        y = agregarEncabezadoContenido(doc, metaEncabezado);

        grupo.items.forEach((s) => {
            y = s.dibujar(doc, y, datos, ctx, indice, metaEncabezado);
        });
    });

    if (firmante) {
        agregarFirma(doc, y, firmante);
    }

    // 5) Rellenar el CONTENIDO ya con las páginas reales de cada Parte
    agregarIndice(doc, partesParaIndice);

    // 6) Encabezado y pie de página en UNA sola pasada final (se omiten las
    //    páginas divisorias, que tienen su propio fondo de color, y las
    //    páginas 1-3 que ya tienen su propio diseño de plantilla)
    agregarEncabezadoEnTodasLasPaginas(doc, 4, metaEncabezado, paginasDivisoras);
    agregarPiePagina(doc, 4, paginasDivisoras);

    if (descargarAutomaticamente) {
        const nombreArchivo = `${rfc ? rfc + " - " : ""}${empresa ? empresa + " - " : ""}REPORTE GENERAL ${mesInicialLabel} A ${mesFinalLabel} ${anio}.pdf`;
        doc.save(nombreArchivo);
    }

    return doc;
}