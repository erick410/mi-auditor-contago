// Lectura del PDF del pedimento en el navegador (pdfjs-dist 2.16.x, compatible con webpack 4 / Quasar v1).
// Uso:
//   import { leerPedimentoPdf } from './leerPedimentoPdf'
//   const leido = await leerPedimentoPdf(file)   // file = File de q-file
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'

// El worker se sirve desde statics (copia de node_modules/pdfjs-dist/legacy/build/pdf.worker.min.js).
// Debe ser de la MISMA versión que pdfjs-dist.
pdfjsLib.GlobalWorkerOptions.workerSrc = 'statics/pdf.worker.min.js'

// Conceptos que NO forman parte de la base del IVA
const NO_BASE = ['IVA', 'PRV', 'IVA/PRV']

export async function leerPedimentoPdf (file) {
  const buffer = await file.arrayBuffer()
  const doc = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise
  try {
    const lineas = await extraerLineas(doc)
    return parsearPedimento(lineas)
  } finally {
    doc.destroy()
  }
}

// Agrupa los textos por renglón (misma Y) y los ordena de izquierda a derecha
export async function extraerLineas (doc) {
  const lineas = []
  for (let p = 1; p <= doc.numPages; p++) {
    const pagina = await doc.getPage(p)
    const contenido = await pagina.getTextContent()
    const items = contenido.items
      .filter(i => i.str && i.str.trim() !== '')
      .map(i => ({ texto: i.str.trim(), x: i.transform[4], y: i.transform[5] }))
      .sort((a, b) => b.y - a.y) // pdf.js: origen abajo-izquierda

    let renglon = []
    let y = null
    for (const it of items) {
      if (y !== null && Math.abs(it.y - y) > 3) {
        lineas.push(unir(renglon))
        renglon = []
      }
      if (renglon.length === 0) y = it.y
      renglon.push(it)
    }
    if (renglon.length) lineas.push(unir(renglon))
  }
  return lineas.filter(l => l.trim() !== '')
}

function unir (renglon) {
  return renglon.sort((a, b) => a.x - b.x).map(i => i.texto).join(' ').replace(/\s+/g, ' ')
}

export function parsearPedimento (lineas) {
  const res = {
    numPedimento: null,
    rfc: null,
    fechaEntrada: null,
    fechaPago: null, // 'YYYY-MM-DD'
    tipoCambio: null,
    valorDolares: null,
    valorAduana: null,
    importeIva: 0,
    ivaPrv: 0,
    baseIva: 0,
    ivaPartidas: null,
    esBorrador: false,
    contribuciones: [],
    advertencias: []
  }

  if (!lineas.length) {
    res.advertencias.push('El PDF no tiene texto (posiblemente escaneado). Captura los datos manualmente.')
    return res
  }

  const texto = lineas.join('\n')

  // --- Encabezado ---
  let m = texto.match(/NUM\.?\s*PEDIMENTO:?\s*(\d{2}\s?\d{2}\s?\d{4}\s?\d{7})/) ||
          texto.match(/\b(\d{2} \d{2} \d{4} \d{7})\b/)
  if (m) res.numPedimento = normalizarNum(m[1])

  res.rfc = grupo(texto, /RFC:\s*([A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3})/)
  res.fechaEntrada = fecha(grupo(texto, /\bENTRADA\s+(\d{2}\/\d{2}\/\d{4})/))
  res.fechaPago = fecha(grupo(texto, /\bPAGO\s+(\d{2}\/\d{2}\/\d{4})/))
  res.tipoCambio = numero(grupo(texto, /TIPO\s+CAMBIO:\s*([\d,]+\.?\d*)/))
  res.valorDolares = numero(grupo(texto, /VALOR\s+DOLARES:\s*([\d,]+\.?\d*)/))
  res.valorAduana = numero(grupo(texto, /VALOR\s+ADUANA:\s*([\d,]+\.?\d*)/))
  res.esBorrador = /BORRADOR|PROFORMA/.test(texto)

  // --- Cuadro de liquidación ---
  const ini = texto.indexOf('CUADRO DE LIQUIDACION')
  if (ini >= 0) {
    let seccion = texto.substring(ini)
    const fines = [seccion.indexOf('DEPÓSITO'), seccion.indexOf('DEPOSITO'), seccion.indexOf('\nTOTAL')]
      .filter(i => i > 0)
    if (fines.length) seccion = seccion.substring(0, Math.min(...fines))

    const re = /\b([A-Z]{2,5}(?:\/[A-Z]{2,5})?)\s+(\d{1,2})\s+([\d,]+(?:\.\d+)?)(?=\s|$)/g
    let c
    while ((c = re.exec(seccion)) !== null) {
      const importe = numero(c[3])
      if (importe === null) continue
      res.contribuciones.push({ concepto: c[1], formaPago: parseInt(c[2], 10), importe })
    }
  } else {
    res.advertencias.push('No se encontró el CUADRO DE LIQUIDACION.')
  }

  const suma = (lista) => redondear(lista.reduce((a, x) => a + x.importe, 0))
  res.importeIva = suma(res.contribuciones.filter(c => c.concepto === 'IVA'))
  res.ivaPrv = suma(res.contribuciones.filter(c => c.concepto === 'IVA/PRV'))

  // --- Base del IVA: valor aduana + contribuciones distintas de IVA/PRV ---
  if (res.valorAduana !== null) {
    res.baseIva = redondear(res.valorAduana + suma(res.contribuciones.filter(c => !NO_BASE.includes(c.concepto))))
  } else if (res.importeIva > 0) {
    res.baseIva = redondear(res.importeIva / 0.16)
    res.advertencias.push('No se encontró el VALOR ADUANA; la base se calculó como IVA / 16%.')
  }

  // --- IVA de partidas (validación) ---
  const partidas = lineas
    .map(l => l.match(/^IVA\s+[\d.]+\s+\d+\s+\d+\s+([\d,]+(?:\.\d+)?)\s*$/))
    .filter(x => x)
    .map(x => numero(x[1]) || 0)
  if (partidas.length) res.ivaPartidas = redondear(partidas.reduce((a, b) => a + b, 0))

  // --- Advertencias ---
  if (!res.numPedimento) res.advertencias.push('No se encontró el número de pedimento.')
  if (!res.fechaPago) res.advertencias.push('No se encontró la fecha de pago.')
  if (!res.importeIva) res.advertencias.push('No se encontró el IVA en el cuadro de liquidación.')
  if (res.esBorrador) res.advertencias.push('El documento es PROFORMA / BORRADOR: las cifras pueden cambiar en el pedimento pagado.')

  if (res.ivaPartidas !== null && Math.abs(res.ivaPartidas - res.importeIva) > 1) {
    res.advertencias.push(`El IVA de las partidas (${fmt(res.ivaPartidas)}) no coincide con el del cuadro de liquidación (${fmt(res.importeIva)}).`)
  }
  if (res.baseIva > 0 && res.importeIva > 0) {
    const dif = Math.abs(Math.round(res.baseIva * 0.16) - res.importeIva)
    if (dif > 5) res.advertencias.push(`La base × 16% difiere ${fmt(dif)} del IVA del pedimento; revisa la base.`)
  }

  return res
}

// --- utilidades ---
function grupo (texto, re) {
  const m = texto.match(re)
  return m ? m[1] : null
}

function numero (valor) {
  if (!valor) return null
  const n = parseFloat(String(valor).replace(/,/g, ''))
  return isNaN(n) ? null : n
}

// 'dd/MM/yyyy' -> 'YYYY-MM-DD'
function fecha (valor) {
  if (!valor) return null
  const [d, m, a] = valor.split('/')
  return `${a}-${m}-${d}`
}

function normalizarNum (valor) {
  const d = valor.replace(/\D/g, '')
  return d.length === 15
    ? `${d.substr(0, 2)} ${d.substr(2, 2)} ${d.substr(4, 4)} ${d.substr(8, 7)}`
    : valor.trim()
}

function redondear (v) {
  return Math.round(v * 100) / 100
}

function fmt (v) {
  return v.toLocaleString('en-US')
}