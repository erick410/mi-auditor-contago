// ============================================================================
// parseDeclaracionAnualXlsx.js
// ----------------------------------------------------------------------------
// Extrae los valores "Declarado" para la Comparativa Anual, tomándolos
// ÚNICAMENTE de la hoja "Edo. Resul. Gral." (Estado de Resultados Generales)
// del .xlsx que viene dentro del zip de la Declaración Anual (SAT).
//
// Fórmulas usadas (confirmadas contigo):
//   Total de Ingresos Acumulables   = "Ingresos Netos"
//   Total de Deducciones Autorizadas = "Costo de ventas" + "Gastos de operación"
//   Utilidad / Pérdida               = "Utilidad de operación" / "Pérdida de operación"
//                                       (cuadra exacto con Ingresos - Deducciones)
//   Coeficiente de Utilidad          = Utilidad de operación (piso 0) / Ingresos Netos
//                                       (aproximado — NO es el coeficiente fiscal oficial
//                                       del Art. 14 LISR, que usa "ingresos nominales" y
//                                       la utilidad fiscal real de "Conc. Cont. Fiscal")
//
// Requiere la librería "xlsx" (SheetJS) — la misma que ya usas en tus
// ExportExcel() de otros componentes:
//   import * as xlsx from 'xlsx'
// ============================================================================

const ETIQUETAS = {
    ingresosNetos: "Ingresos Netos",
    costoVentas: "Costo de ventas",
    gastosOperacion: "Gastos de operación",
    utilidadOperacion: "Utilidad de operación",
    perdidaOperacion: "Pérdida de operación",
};

const NOMBRES_HOJA_POSIBLES = ["Edo. Resul. Gral.", "Edo Resul Gral", "Estado de Resultados"];

function limpiarEtiqueta(v) {
    return (v === null || v === undefined ? "" : String(v)).trim().toLowerCase();
}

// Busca la fila cuya columna A coincide con la etiqueta (ignora mayúsculas,
// espacios extra al final, como el "Gastos de operación " del archivo real).
function buscarFila(filas, etiqueta) {
    const objetivo = limpiarEtiqueta(etiqueta);
    return filas.find((f) => limpiarEtiqueta(f[0]) === objetivo);
}

// Columna G (índice 6, 0-based) = "Importe al cierre del periodo {año actual}"
// según el layout real del archivo del SAT.
function valorColumnaActual(fila) {
    if (!fila) return 0;
    const valor = fila[6];
    const num = Number(valor);
    return Number.isNaN(num) ? 0 : num;
}

// Intenta sacar el año del título ("ESTADO DE RESULTADOS AL CIERRE DEL PERIODO 2024")
function extraerAnioDelTitulo(filas) {
    for (const fila of filas) {
        const texto = (fila[0] || "").toString();
        const match = texto.match(/periodo\s+(\d{4})/i);
        if (match) return Number(match[1]);
    }
    return null;
}

/**
 * @param {ArrayBuffer|Uint8Array} datosXlsx - contenido crudo del .xlsx
 * @param {object} XLSX - el módulo 'xlsx' (SheetJS), pásalo tú para no forzar
 *                         una segunda copia de la librería en el bundle:
 *                         import * as XLSX from 'xlsx'; ...extraer(buf, XLSX)
 * @returns {{
 *   anio: number|null,
 *   coeficienteUtilidad: number,
 *   ingresosAcumulables: number,
 *   deduccionesAutorizadas: number,
 *   utilidadFiscal: number,
 *   perdidaFiscal: number,
 * }}
 */
export function extraerDeterminacionAnualDesdeXlsx(datosXlsx, XLSX) {
    const workbook = XLSX.read(datosXlsx, { type: "array" });

    const nombreHoja =
        workbook.SheetNames.find((n) => NOMBRES_HOJA_POSIBLES.includes(n)) ||
        workbook.SheetNames.find((n) => limpiarEtiqueta(n).includes("resul"));

    if (!nombreHoja) {
        throw new Error(
            `No se encontró la hoja "Edo. Resul. Gral." en el archivo. Hojas disponibles: ${workbook.SheetNames.join(", ")}`
        );
    }

    const hoja = workbook.Sheets[nombreHoja];
    const filas = XLSX.utils.sheet_to_json(hoja, { header: 1, defval: null, blankrows: true });

    const ingresosNetos = valorColumnaActual(buscarFila(filas, ETIQUETAS.ingresosNetos));
    const costoVentas = valorColumnaActual(buscarFila(filas, ETIQUETAS.costoVentas));
    const gastosOperacion = valorColumnaActual(buscarFila(filas, ETIQUETAS.gastosOperacion));
    const utilidadOperacion = valorColumnaActual(buscarFila(filas, ETIQUETAS.utilidadOperacion));
    const perdidaOperacion = valorColumnaActual(buscarFila(filas, ETIQUETAS.perdidaOperacion));

    const ingresosAcumulables = ingresosNetos;
    const deduccionesAutorizadas = costoVentas + gastosOperacion;

    // Solo uno de los dos viene con valor (el otro queda en 0 / blanco en el archivo real)
    const resultadoOperacion = utilidadOperacion - perdidaOperacion;
    const utilidadFiscal = resultadoOperacion > 0 ? resultadoOperacion : 0;
    const perdidaFiscal = resultadoOperacion < 0 ? Math.abs(resultadoOperacion) : 0;

    const coeficienteUtilidad = ingresosAcumulables !== 0 ? utilidadFiscal / ingresosAcumulables : 0;

    return {
        anio: extraerAnioDelTitulo(filas),
        coeficienteUtilidad,
        ingresosAcumulables,
        deduccionesAutorizadas,
        utilidadFiscal,
        perdidaFiscal,
    };
}