import * as XLSX from 'xlsx'

// ============================================================
// ÚNICO ARCHIVO A MODIFICAR CUANDO CAMBIEN LOS DATOS O EL FORMATO
// ============================================================
// Cada hoja tiene su propia columna de "valor" porque el Estado
// de Situación Financiera y el Estado de Resultados no comparten
// estructura de columnas.
//
// columnaValor / columnaValorAnterior son índices de columna
// EMPEZANDO EN 0 (A=0, B=1, C=2, D=3, E=4, F=5, G=6, H=7, I=8...)

const HOJAS_A_LEER = {
    'Edos. Sit. Fin.': {
        columnaValor: 2,          // C = EJERCICIO FISCAL 2025
        columnaValorAnterior: 3,  // D = EJERCICIO FISCAL 2024
        conceptos: {
            'Total de Activo a corto plazo': 'activoCirculante',
            'Inventarios': 'inventarios',
            'Total de Pasivo a corto plazo': 'pasivoCirculante',
            'TOTAL DE PASIVO': 'pasivoTotal',
            'TOTAL DE ACTIVO': 'activoTotal',
            'Clientes': 'cuentasPorCobrar',
        },
    },
    'Edo. Resul. Gral.': {
        columnaValor: 6,          // G = Importe al cierre del periodo 2025
        columnaValorAnterior: 8,  // I = Importe al cierre del periodo 2024
        conceptos: {
            'Costo de ventas': 'costoVentas',
            'Ingresos Netos': 'ventasNetas',
            'Utilidad neta': 'utilidadNeta',
            // Estos dos son auxiliares para calcular inventario promedio,
            // no se usan directo en las razones (ver abajo)
            'Inventario Inicial': '_inventarioInicial',
            'Inventario Final': '_inventarioFinal',
        },
    },
    // 'Conc. Cont. Fiscal' se ignora a propósito
}

export function parseExcel(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result)
                const workbook = XLSX.read(data, { type: 'array' })

                const datos = {}
                const datosAnterior = {}
                const conceptosEncontrados = new Set()

                Object.entries(HOJAS_A_LEER).forEach(([nombreHoja, config]) => {
                    const hoja = workbook.Sheets[nombreHoja]
                    if (!hoja) {
                        throw new Error(`No se encontró la hoja "${nombreHoja}" en el Excel`)
                    }

                    const filas = XLSX.utils.sheet_to_json(hoja, { header: 1 })

                    filas.forEach((fila) => {
                        const concepto = String(fila[0] || '').trim()
                        const clave = config.conceptos[concepto]
                        if (!clave) return

                        conceptosEncontrados.add(clave)

                        const valor = fila[config.columnaValor]
                        const valorAnterior = fila[config.columnaValorAnterior]

                        datos[clave] = celdaANumero(valor)
                        if (valorAnterior !== undefined) {
                            datosAnterior[clave] = celdaANumero(valorAnterior)
                        }
                    })
                })

                // --- Promedios (usan valor actual + valor del ejercicio anterior) ---

                // Inventario promedio: usa Inventario Inicial/Final del Edo. de Resultados
                // (vienen como negativo en "Inventario Final" porque se resta en la fórmula
                // del costo de ventas, por eso el Math.abs)
                if (datos._inventarioInicial !== undefined && datos._inventarioFinal !== undefined) {
                    datos.inventarioPromedio =
                        (Math.abs(datos._inventarioInicial) + Math.abs(datos._inventarioFinal)) / 2
                }
                delete datos._inventarioInicial
                delete datos._inventarioFinal

                // Cuentas por cobrar promedio: Clientes (2025) + Clientes (2024) / 2
                if (datos.cuentasPorCobrar !== undefined && datosAnterior.cuentasPorCobrar !== undefined) {
                    datos.cuentasPorCobrarPromedio =
                        (datos.cuentasPorCobrar + datosAnterior.cuentasPorCobrar) / 2
                }

                // Ventas a crédito: este Excel no separa contado/crédito.
                // Se deja sin mapear a propósito -> razonesFinancieras.js usa
                // ventasNetas como fallback. Si algún día tienes el dato real,
                // agrégalo aquí como 'ventasCredito'.

                // --- Validación de campos indispensables ---
                const requeridos = [
                    'activoCirculante', 'inventarios', 'pasivoCirculante',
                    'costoVentas', 'ventasNetas', 'cuentasPorCobrar',
                    'pasivoTotal', 'activoTotal', 'utilidadNeta',
                ]
                const faltantes = requeridos.filter((k) => datos[k] === undefined)
                if (faltantes.length) {
                    reject(new Error(`Faltan datos en el Excel: ${faltantes.join(', ')}`))
                    return
                }

                const advertencias = requeridos.filter((k) => datos[k] === 0)

                resolve({
                    datos, 
                    advertencias
                })
            } catch (err) {
                reject(err)
            }
        }
        reader.onerror = reject
        reader.readAsArrayBuffer(file)
    })
}

function celdaANumero(valor) {
    if (typeof valor === 'number') return valor
    return 0
}