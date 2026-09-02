// fusionPdfRiesgo.js
// Utilidades para descargar, extraer y fusionar los PDFs que arma el
// Reporte de Riesgo Financiero (Constancia, Opinión, Anual, Declaraciones).
//
// Requiere: npm install pdf-lib jszip

import axios from 'axios'
import JSZip from 'jszip'
import { PDFDocument } from 'pdf-lib'

// --- Descarga cualquier recurso binario como ArrayBuffer ---
export async function descargarComoArrayBuffer(url, config = {}) {
  const { data } = await axios.get(url, { responseType: 'arraybuffer', ...config })
  return data
}

// --- Detecta si los bytes son un ZIP (firma "PK") ---
function esZip(bytes) {
  const u8 = new Uint8Array(bytes)
  return u8.length > 2 && u8[0] === 0x50 && u8[1] === 0x4b
}

// --- Extrae todos los PDFs contenidos en un ZIP como ArrayBuffers ---
async function extraerPdfsDeZip(bytes) {
  const zip = await JSZip.loadAsync(bytes)
  const archivos = Object.values(zip.files)
    .filter((f) => !f.dir && f.name.toLowerCase().endsWith('.pdf'))

  const pdfs = []
  for (const archivo of archivos) {
    pdfs.push(await archivo.async('arraybuffer'))
  }
  return pdfs
}

// --- Dado un ArrayBuffer (PDF suelto o ZIP con PDFs adentro), regresa
//     un arreglo de ArrayBuffers, cada uno un PDF individual ---
export async function normalizarAPdfs(bytes) {
  if (esZip(bytes)) {
    return await extraerPdfsDeZip(bytes)
  }
  return [bytes]
}

// --- Copia todas las páginas de "origenBytes" (PDF o ZIP con PDFs)
//     al final de "pdfDestino" (instancia de PDFDocument de pdf-lib) ---
export async function anexarPaginas(pdfDestino, origenBytes, etiqueta = '') {
  const pdfsIndividuales = await normalizarAPdfs(origenBytes)

  for (const pdfBytes of pdfsIndividuales) {
    try {
      const pdfOrigen = await PDFDocument.load(pdfBytes, { ignoreEncryption: true })
      const paginas = await pdfDestino.copyPages(pdfOrigen, pdfOrigen.getPageIndices())
      paginas.forEach((p) => pdfDestino.addPage(p))
    } catch (e) {
      console.error(`No se pudo anexar un documento de "${etiqueta}":`, e)
    }
  }
}

// --- Descarga el PDF final, con manejo especial para Safari ---
export function descargarPdfFinal(bytes, nombreArchivo) {
  const blob = new Blob([bytes], { type: 'application/pdf' })
  const blobUrl = URL.createObjectURL(blob)

  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

  if (isSafari) {
    window.open(blobUrl, '_blank')
  } else {
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = nombreArchivo
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  setTimeout(() => URL.revokeObjectURL(blobUrl), 10000)
}

// --- Arma el PDF final a partir de una lista ordenada de fuentes.
//     Cada fuente: { etiqueta: string, cargar: () => Promise<ArrayBuffer> }
//     "cargar" decide cómo obtener los bytes (endpoint directo, JSON+base64, etc). ---
export async function construirReporteRiesgo(fuentes) {
  const pdfFinal = await PDFDocument.create()

  for (const fuente of fuentes) {
    try {
      const bytes = await fuente.cargar()
      if (!bytes) continue
      await anexarPaginas(pdfFinal, bytes, fuente.etiqueta)
    } catch (e) {
      console.error(`No se pudo descargar "${fuente.etiqueta}":`, e)
    }
  }

  return await pdfFinal.save()
}