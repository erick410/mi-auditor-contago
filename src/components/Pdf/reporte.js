// ============================================================
// AÑADIR A reporte.js
// ============================================================

import { PDFDocument } from 'pdf-lib'
import axios from 'axios'

const BASE_URL_DESCARGA = 'https://DescargaSat.contago.com.mx/api/Descarga'

// --- 1. Busca en el historial la última Opinión de Cumplimiento COMPLETADA ---
async function obtenerUltimaOpinionCumplimiento(rfc) {
  try {
    const { data } = await axios.get(`${BASE_URL_DESCARGA}/Historial/${rfc}`)
    if (!data.exito) return null

    const opiniones = data.registros
      .filter(r => r.tipoDocumento === 'opinion32d' && r.estado === 'COMPLETADO')
      .sort((a, b) => new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud))

    if (opiniones.length === 0) return null

    const ultima = opiniones[0]
    // mismo patrón de URL que usas en obtenerUrlArchivo() del componente Vue
    return `https://descargasat.contago.com.mx/api/Descarga/Archivo/${rfc}/${ultima.id}`
  } catch (e) {
    console.error('No se pudo consultar el historial de Opinión de Cumplimiento:', e)
    return null
  }
}

// --- 2. Descarga cualquier PDF como ArrayBuffer ---
async function descargarPdfComoArrayBuffer(url) {
  const { data } = await axios.get(url, { responseType: 'arraybuffer' })
  return data
}

// --- 3. Fusiona el PDF del reporte (jsPDF) con el PDF de la Opinión ---
async function anexarOpinionCumplimiento(doc, rfcEmpresa) {
  const reportBytes = doc.output('arraybuffer')

  const urlOpinion = await obtenerUltimaOpinionCumplimiento(rfcEmpresa)
  if (!urlOpinion) {
    // No hay opinión disponible: se entrega el reporte tal cual, sin romper el flujo
    console.warn('No se encontró Opinión de Cumplimiento COMPLETADA para el RFC:', rfcEmpresa)
    return reportBytes
  }

  try {
    const opinionBytes = await descargarPdfComoArrayBuffer(urlOpinion)

    const pdfFinal = await PDFDocument.load(reportBytes)
    const pdfOpinion = await PDFDocument.load(opinionBytes)

    const paginasOpinion = await pdfFinal.copyPages(
      pdfOpinion,
      pdfOpinion.getPageIndices()
    )
    paginasOpinion.forEach((pagina) => pdfFinal.addPage(pagina))

    return await pdfFinal.save()
  } catch (e) {
    console.error('No se pudo anexar la Opinión de Cumplimiento, se entrega solo el reporte:', e)
    return reportBytes
  }
}

// --- 4. Descarga del PDF final, con manejo especial para Safari ---
function descargarPdfFinal(bytes, nombreArchivo) {
  const blob = new Blob([bytes], { type: 'application/pdf' })
  const blobUrl = URL.createObjectURL(blob)

  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

  if (isSafari) {
    // Safari bloquea/ignora .download en muchos casos: abrimos en pestaña nueva
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

// ============================================================
// CAMBIO EN EL FINAL DE generarReporte():
// ============================================================
//
// Reemplaza esta línea:
//
//   doc.save('REPORTE - ' + empresa + ' ' + anio + ' - ' + mesI + ' - ' + mesF + '.pdf');
//
// Por esto:

