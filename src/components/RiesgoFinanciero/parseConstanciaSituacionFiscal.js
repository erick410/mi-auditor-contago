// ============================================================================
// parseConstanciaSituacionFiscal.js
// ----------------------------------------------------------------------------
// Extrae Domicilio Fiscal y Actividades Económicas del PDF de la Constancia
// de Situación Fiscal (el mismo PDF que ya descargamos vía
// `_cargarArchivoDirecto(this.constancia.id)` en ReporteRiesgoFinanciero.vue).
//
// CÓMO FUNCIONA (importante para dar mantenimiento):
// El PDF lo genera Oracle BI Publisher posicionando CADA LETRA de forma
// individual, sin carácter de espacio real entre palabras — dentro de una
// palabra las letras quedan perfectamente pegadas (separación = 0), y entre
// palabras hay un huequito pequeño pero medible (~1-3pt). Por eso NO se
// puede usar pdf.getTextContent() tal cual (vendría "Mineríadeplata" sin
// espacios) — hay que reconstruir las palabras nosotros mismos comparando
// la posición X de cada fragmento de texto contra el fragmento anterior.
//
// Una vez reconstruidas las líneas con espacios correctos:
//   - Domicilio Fiscal: se extrae por "etiqueta conocida -> hasta la
//     siguiente etiqueta conocida" (robusto sin importar el layout exacto).
//   - Actividades Económicas: es una tabla, así que se ubica por columnas
//     usando la posición X de cada renglón (los títulos de columna del
//     encabezado NO comparten la misma X que los datos, así que las
//     posiciones de columna están calibradas contra los renglones de datos
//     reales, no contra el encabezado).
//
// Requiere: pdfjs-dist (ya debes tenerlo si usas xlsx/otros parsers de PDF
// en el proyecto; si no, `npm install pdfjs-dist`)
//
// Uso típico (desde ReporteRiesgoFinanciero.vue):
//   import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'
//   import { parseConstanciaSituacionFiscal } from './parseConstanciaSituacionFiscal'
//   const bytes = await this._cargarArchivoDirecto(this.constancia.id)
//   const { domicilioFiscal, actividadesEconomicas } = await parseConstanciaSituacionFiscal(bytes, pdfjsLib)
// ============================================================================

// Columnas de la tabla de Actividades Económicas, calibradas contra los
// RENGLONES DE DATOS reales (no contra el encabezado — el encabezado
// "Orden / Actividad Económica / Porcentaje / Fecha Inicio / Fecha Fin"
// está centrado sobre cada columna y su X no coincide con la X donde
// arrancan los datos, que van alineados a la izquierda de cada columna).
// Si el SAT cambia el diseño de la Constancia, recalibrar estos valores.
const COL_X = {
    orden: 37.5,
    actividad: 82.5,
    porcentaje: 371.5,
    fechaInicio: 449.0,
    fechaFin: 515.7
}
const COL_BOUNDARIES = [
    (COL_X.orden + COL_X.actividad) / 2,
    (COL_X.actividad + COL_X.porcentaje) / 2,
    (COL_X.porcentaje + COL_X.fechaInicio) / 2,
    (COL_X.fechaInicio + COL_X.fechaFin) / 2
]
const COL_NOMBRES = ['orden', 'actividad', 'porcentaje', 'fechaInicio', 'fechaFin']

function columnaDe(x) {
    for (let i = 0; i < COL_BOUNDARIES.length; i++) {
        if (x < COL_BOUNDARIES[i]) return COL_NOMBRES[i]
    }
    return COL_NOMBRES[COL_NOMBRES.length - 1]
}

// Reconstruye las líneas de una página con espacios correctos (ver
// explicación arriba), agrupando fragmentos de texto por su coordenada Y
// (misma línea) y ordenándolos por X dentro de cada línea.
async function extraerLineasDePagina(page) {
    const textContent = await page.getTextContent()
    const items = textContent.items
        .map((it) => ({ str: it.str, x: it.transform[4], y: it.transform[5], width: it.width || 0 }))
        .filter((it) => it.str !== '')

    const TOL_Y = 2
    const lineas = []
    items.forEach((it) => {
        let linea = lineas.find((l) => Math.abs(l.y - it.y) <= TOL_Y)
        if (!linea) {
            linea = { y: it.y, items: [] }
            lineas.push(linea)
        }
        linea.items.push(it)
    })
    lineas.sort((a, b) => b.y - a.y) // de arriba hacia abajo
    lineas.forEach((l) => l.items.sort((a, b) => a.x - b.x))

    const TOL_GAP = 0.6 // gap > 0.6pt entre fragmentos = espacio real
    return lineas.map((l) => {
        let texto = ''
        let finAnterior = null
        l.items.forEach((it) => {
            if (finAnterior !== null && it.x - finAnterior > TOL_GAP) texto += ' '
            texto += it.str
            finAnterior = it.x + it.width
        })
        return { texto, items: l.items }
    })
}

// ---- Domicilio Fiscal: extracción por "etiqueta -> siguiente etiqueta" ----
const ETIQUETAS_DOMICILIO = [
    { clave: 'codigoPostal', patron: /Código Postal:/ },
    { clave: 'tipoVialidad', patron: /Tipo de Vialidad:/ },
    { clave: 'calle', patron: /Nombre de Vialidad:/ },
    { clave: 'numeroExterior', patron: /Número Exterior:/ },
    { clave: 'numeroInterior', patron: /Número Interior:/ },
    { clave: 'colonia', patron: /Nombre de la Colonia:/ },
    { clave: 'localidad', patron: /Nombre de la Localidad:/ },
    { clave: 'municipio', patron: /Nombre del Municipio o Demarcación Territorial:/ },
    { clave: 'entidadFederativa', patron: /Nombre de la Entidad Federativa:/ },
    { clave: 'entreCalle', patron: /Entre Calle:/ },
    { clave: 'yCalle', patron: /Y Calle:/ }
]

function extraerCamposPorEtiquetas(texto, etiquetas) {
    const posiciones = etiquetas
        .map(({ clave, patron }) => {
            const m = patron.exec(texto)
            return m ? { clave, inicio: m.index, finEtiqueta: m.index + m[0].length } : null
        })
        .filter(Boolean)
        .sort((a, b) => a.finEtiqueta - b.finEtiqueta)

    const resultado = {}
    posiciones.forEach((pos, i) => {
        const finValor = i + 1 < posiciones.length ? posiciones[i + 1].inicio : texto.length
        resultado[pos.clave] = texto.slice(pos.finEtiqueta, finValor).replace(/\s+/g, ' ').trim()
    })
    return resultado
}

function extraerDomicilio(textoCompleto) {
    const inicio = textoCompleto.indexOf('Datos del domicilio registrado')
    if (inicio === -1) return null

    // Se acota al bloque del domicilio (hasta "Actividades Económicas:" o,
    // si no aparece, hasta 1500 caracteres después, como margen de seguridad)
    const finMarcador = textoCompleto.indexOf('Actividades Económicas', inicio)
    const bloque = textoCompleto.slice(
        inicio,
        finMarcador !== -1 ? finMarcador : inicio + 1500
    )

    const campos = extraerCamposPorEtiquetas(bloque, ETIQUETAS_DOMICILIO)
    if (Object.keys(campos).length === 0) return null
    return campos
}

// ---- Actividades Económicas: extracción por columnas (posición X) ----
function extraerActividades(todasLasLineas) {
    const idxInicio = todasLasLineas.findIndex((l) => l.texto.includes('Actividades Económicas'))
    if (idxInicio === -1) return []

    const idxFin = todasLasLineas.findIndex(
        (l, i) => i > idxInicio && /^Reg[ií]menes:?$/.test(l.texto.trim())
    )
    const rango = todasLasLineas.slice(idxInicio + 1, idxFin !== -1 ? idxFin : undefined)

    const actividades = []
    rango.forEach((linea) => {
        if (linea.items.length === 0) return
        const primerItem = linea.items[0]
        // Un renglón de datos siempre arranca con un número pequeño (el "Orden")
        // en la columna correspondiente — así se distingue de encabezados,
        // saltos de página, etc.
        const esRenglonDeDatos =
            columnaDe(primerItem.x) === 'orden' && /^\d{1,2}$/.test(primerItem.str.trim())
        if (!esRenglonDeDatos) return

        const fila = { orden: '', actividad: '', porcentaje: '', fechaInicio: '', fechaFin: '' }
        let ultimaColumna = null
        linea.items.forEach((it) => {
            const col = columnaDe(it.x)
            fila[col] = fila[col] ? `${fila[col]} ${it.str}` : it.str
            ultimaColumna = col
        })

        actividades.push({
            orden: Number(fila.orden) || fila.orden,
            actividad: fila.actividad.trim(),
            porcentaje: fila.porcentaje ? Number(fila.porcentaje.replace(/[^\d.]/g, '')) : null,
            fechaInicio: fila.fechaInicio.trim() || null,
            fechaFin: fila.fechaFin.trim() || null
        })
    })

    return actividades
}

/**
 * Extrae Domicilio Fiscal y Actividades Económicas de un PDF de Constancia
 * de Situación Fiscal.
 *
 * @param {ArrayBuffer} arrayBufferPdf - bytes del PDF (ej. lo que regresa
 *   `_cargarArchivoDirecto(this.constancia.id)` en ReporteRiesgoFinanciero.vue)
 * @param {object} pdfjsLib - el módulo pdfjs-dist:
 *   import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'
 * @returns {Promise<{
 *   domicilioFiscal: null | {
 *     codigoPostal, tipoVialidad, calle, numeroExterior, numeroInterior,
 *     colonia, localidad, municipio, entidadFederativa, entreCalle, yCalle
 *   },
 *   actividadesEconomicas: Array<{ orden, actividad, porcentaje, fechaInicio, fechaFin }>
 * }>}
 */
export async function parseConstanciaSituacionFiscal(arrayBufferPdf, pdfjsLib) {
    const doc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBufferPdf) }).promise

    const todasLasLineas = []
    for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i)
        const lineas = await extraerLineasDePagina(page)
        todasLasLineas.push(...lineas)
    }

    const textoCompleto = todasLasLineas.map((l) => l.texto).join('\n')

    return {
        domicilioFiscal: extraerDomicilio(textoCompleto),
        actividadesEconomicas: extraerActividades(todasLasLineas)
    }
}