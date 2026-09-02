// ============================================================================
// parseEstadosFinancierosParaRazones.js
// ----------------------------------------------------------------------------
// Adaptado de tu parseExcel.js original: MISMA lógica y mapeo de conceptos,
// pero recibe directamente el ArrayBuffer del xlsx (el mismo que ya
// descargamos/descomprimimos para Comparativa Anual vía
// obtenerDeclaracionAnualDeclarada.js) en vez de un File de <input type=file>.
//
// ============================================================
// ÚNICO ARCHIVO A MODIFICAR CUANDO CAMBIEN LOS DATOS O EL FORMATO
// ============================================================
// Cada hoja tiene su propia columna de "valor" porque el Estado
// de Situación Financiera y el Estado de Resultados no comparten
// estructura de columnas.
//
// columnaValor / columnaValorAnterior son índices de columna
// EMPEZANDO EN 0 (A=0, B=1, C=2, D=3, E=4, F=5, G=6, H=7, I=8...)
// ============================================================================

const HOJAS_A_LEER = {
    "Edos. Sit. Fin.": {
        columnaValor: 2, // C = EJERCICIO FISCAL actual
        columnaValorAnterior: 3, // D = EJERCICIO FISCAL anterior
        conceptos: {
            "Total de Activo a corto plazo": "activoCirculante",
            Inventarios: "inventarios",
            "Total de Pasivo a corto plazo": "pasivoCirculante",
            "TOTAL DE PASIVO": "pasivoTotal",
            "TOTAL DE ACTIVO": "activoTotal",
            Clientes: "cuentasPorCobrar",
        },
    },
    "Edo. Resul. Gral.": {
        columnaValor: 6, // G = Importe al cierre del periodo actual
        columnaValorAnterior: 8, // I = Importe al cierre del periodo anterior
        conceptos: {
            "Costo de ventas": "costoVentas",
            "Ingresos Netos": "ventasNetas",
            // "Utilidad neta" y "Pérdida neta" vienen como PAR: solo una trae
            // valor según si el ejercicio cerró en utilidad o en pérdida. Se
            // combinan más abajo en un solo "utilidadNeta" con signo (negativo
            // si fue pérdida) — si solo se mapeara "Utilidad neta", un año de
            // pérdida saldría incorrectamente como $0 en vez de negativo.
            "Utilidad neta": "_utilidadNetaPositiva",
            "Pérdida neta": "_perdidaNeta",
            // Auxiliares para inventario promedio, no se usan directo en las razones
            "Inventario Inicial": "_inventarioInicial",
            "Inventario Final": "_inventarioFinal",
        },
    },
    // 'Conc. Cont. Fiscal' se ignora a propósito
};

const REQUERIDOS = [
    "activoCirculante", "inventarios", "pasivoCirculante",
    "costoVentas", "ventasNetas", "cuentasPorCobrar",
    "pasivoTotal", "activoTotal", "utilidadNeta",
];

function celdaANumero(valor) {
    if (typeof valor === "number") return valor;
    return 0;
}

function limpiarEtiqueta(v) {
    return (v === null || v === undefined ? "" : String(v)).trim();
}

/**
 * @param {ArrayBuffer} arrayBufferXlsx
 * @param {object} XLSX - el módulo 'xlsx' (SheetJS): import * as XLSX from 'xlsx'
 * @returns {{ datos: object, datosAnterior: object, advertencias: string[] }}
 * @throws {Error} si falta alguna hoja o algún concepto indispensable
 */
export function parseEstadosFinancierosParaRazones(arrayBufferXlsx, XLSX) {
    const workbook = XLSX.read(arrayBufferXlsx, { type: "array" });

    const datos = {};
    const datosAnterior = {};

    Object.entries(HOJAS_A_LEER).forEach(([nombreHoja, config]) => {
        const hoja = workbook.Sheets[nombreHoja];
        if (!hoja) {
            throw new Error(`No se encontró la hoja "${nombreHoja}" en el Excel.`);
        }

        const filas = XLSX.utils.sheet_to_json(hoja, { header: 1 });

        filas.forEach((fila) => {
            const concepto = limpiarEtiqueta(fila[0]);
            const clave = config.conceptos[concepto];
            if (!clave) return;

            const valor = fila[config.columnaValor];
            const valorAnterior = fila[config.columnaValorAnterior];

            datos[clave] = celdaANumero(valor);
            if (valorAnterior !== undefined) {
                datosAnterior[clave] = celdaANumero(valorAnterior);
            }
        });
    });

    // --- Combinar Utilidad neta / Pérdida neta (par de renglones) en un solo
    // valor con signo: positivo si fue utilidad, negativo si fue pérdida ---
    datos.utilidadNeta = (datos._utilidadNetaPositiva || 0) - (datos._perdidaNeta || 0);
    delete datos._utilidadNetaPositiva;
    delete datos._perdidaNeta;

    if (datosAnterior._utilidadNetaPositiva !== undefined || datosAnterior._perdidaNeta !== undefined) {
        datosAnterior.utilidadNeta = (datosAnterior._utilidadNetaPositiva || 0) - (datosAnterior._perdidaNeta || 0);
    }
    delete datosAnterior._utilidadNetaPositiva;
    delete datosAnterior._perdidaNeta;

    // --- Promedios (usan valor actual + valor del ejercicio anterior) ---

    // Inventario promedio: usa Inventario Inicial/Final del Edo. de Resultados
    // (vienen como negativo en "Inventario Final" porque se resta en la fórmula
    // del costo de ventas, por eso el Math.abs)
    if (datos._inventarioInicial !== undefined && datos._inventarioFinal !== undefined) {
        datos.inventarioPromedio = (Math.abs(datos._inventarioInicial) + Math.abs(datos._inventarioFinal)) / 2;
    }
    delete datos._inventarioInicial;
    delete datos._inventarioFinal;

    // Cuentas por cobrar promedio: Clientes (actual) + Clientes (anterior) / 2
    if (datos.cuentasPorCobrar !== undefined && datosAnterior.cuentasPorCobrar !== undefined) {
        datos.cuentasPorCobrarPromedio = (datos.cuentasPorCobrar + datosAnterior.cuentasPorCobrar) / 2;
    }

    // Ventas a crédito: este Excel no separa contado/crédito.
    // razonesFinancieras.js usa ventasNetas como fallback. Si algún día tienes
    // el dato real, agrégalo aquí como 'ventasCredito'.

    // --- Validación de campos indispensables ---
    const faltantes = REQUERIDOS.filter((k) => datos[k] === undefined);
    if (faltantes.length) {
        throw new Error(`Faltan datos en el Excel para calcular las Razones Financieras: ${faltantes.join(", ")}`);
    }

    const advertencias = REQUERIDOS.filter((k) => datos[k] === 0);

    return { datos, datosAnterior, advertencias };
}