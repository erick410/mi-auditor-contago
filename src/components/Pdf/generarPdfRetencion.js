// generarPdfRetencion.js
// Requiere: npm install jspdf jspdf-autotable

import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

// ── Paleta suave Contago ─────────────────────────────────────────
const C = {
    red:        [220,  80,  80],
    redLight:   [255, 235, 235],
    redMid:     [240, 180, 180],
    dark:       [45,   52,  70],
    mid:        [110, 120, 145],
    soft:       [150, 160, 180],
    light:      [248, 249, 252],
    white:      [255, 255, 255],
    border:     [220, 225, 235],
    headerBg:   [235, 238, 248],
    isr:        [200, 160,  60],
    isrLight:   [255, 248, 220],
    iva:        [ 60, 160, 120],
    ivaLight:   [220, 248, 238],
}

const safe = (v) => {
    if (v === null || v === undefined) return '—'
    if (typeof v === 'object') return JSON.stringify(v)
    return String(v)
}

const fmt = (n) => {
    if (n === null || n === undefined || isNaN(Number(n))) return '0.00'
    return Number(n).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const fmtDate = (v) => {
    if (!v) return '—'
    try {
        const d = new Date(v)
        if (isNaN(d.getTime())) return safe(v)
        return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
            + ' ' + d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    } catch (e) { return safe(v) }
}

const mesNombre = (n) =>
    ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
     'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][n] || safe(n)

const impNombre = (c) => c === '001' ? 'ISR' : c === '002' ? 'IVA' : safe(c)

function lineaDivisora(doc, y) {
    doc.setDrawColor(C.border[0], C.border[1], C.border[2])
    doc.setLineWidth(0.2)
    doc.line(14, y, 196, y)
    return y + 4
}

function etiquetaSeccion(doc, y, texto) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(C.red[0], C.red[1], C.red[2])
    doc.text(texto.toUpperCase(), 14, y)
    doc.setDrawColor(C.redMid[0], C.redMid[1], C.redMid[2])
    doc.setLineWidth(0.4)
    doc.line(14, y + 1, 196, y + 1)
    return y + 5
}

function infoGrid(doc, y, pares) {
    const colW = 91
    pares.forEach((par, i) => {
        const col = i % 2
        const row = Math.floor(i / 2)
        const x = 14 + col * colW
        const yPos = y + row * 6

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(6.5)
        doc.setTextColor(C.soft[0], C.soft[1], C.soft[2])
        doc.text(safe(par[0]), x, yPos)

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(7)
        doc.setTextColor(C.dark[0], C.dark[1], C.dark[2])
        let val = safe(par[1])
        doc.text(val, x + 28, yPos)
    })
    const filas = Math.ceil(pares.length / 2)
    return y + filas * 6 + 2
}

export async function generarPdfRetencion(retencion, logoSrc) {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })
    let y = 0

    // HEADER
    doc.setFillColor(C.redLight[0], C.redLight[1], C.redLight[2])
    doc.rect(0, 0, 215.9, 30, 'F')
    doc.setFillColor(C.red[0], C.red[1], C.red[2])
    doc.rect(0, 0, 215.9, 1.5, 'F')

    if (logoSrc) {
        try {
            const img = await loadImage(logoSrc)
            doc.addImage(img, 'PNG', 5, 8, 50, 15)
        } catch (e) { /* sin logo */ }
    }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(C.dark[0], C.dark[1], C.dark[2])
    doc.text('Constancia de Retenciones', 48, 13)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(C.soft[0], C.soft[1], C.soft[2])
    doc.text('CFDI de Retenciones e Información de Pagos · Versión 2.0', 48, 19)
    doc.text('Contago · Mi Auditor', 48, 25)

    doc.setFillColor(C.white[0], C.white[1], C.white[2])
    doc.setDrawColor(C.redMid[0], C.redMid[1], C.redMid[2])
    doc.setLineWidth(0.3)
    doc.roundedRect(120, 7, 76, 14, 2, 2, 'FD')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(5.5)
    doc.setTextColor(C.red[0], C.red[1], C.red[2])
    doc.text('FOLIO FISCAL', 123, 12)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(5.8)
    doc.setTextColor(C.dark[0], C.dark[1], C.dark[2])
    doc.text(safe(retencion.uuid).toUpperCase(), 123, 17)

    y = 34

    // IDENTIFICACIÓN
    y = etiquetaSeccion(doc, y, 'Identificación del Comprobante')
    y = infoGrid(doc, y, [
        ['Folio interno',    retencion.folioInt],
        ['Clave retención',  retencion.cveRetenc],
        ['Fecha de emisión', fmtDate(retencion.fechaExp)],
        ['Fecha timbrado',   fmtDate(retencion.fechaTimbrado)],
        ['Lugar expedición', retencion.lugarExp],
        ['RFC prov. cert.',  retencion.rfcProvCertif],
        ['No. certificado',  retencion.noCertificado],
        ['Tipo descarga',    retencion.tipoDescarga],
    ])
    y = lineaDivisora(doc, y)

    // EMISOR
    y = etiquetaSeccion(doc, y, 'Emisor')
    y = infoGrid(doc, y, [
        ['RFC',            retencion.rfcEmisor],
        ['Régimen fiscal', retencion.regimenFiscalEmisor],
        ['Nombre',         retencion.nombreEmisor],
        ['',               ''],
    ])
    y = lineaDivisora(doc, y)

    // RECEPTOR
    y = etiquetaSeccion(doc, y, 'Receptor')
    y = infoGrid(doc, y, [
        ['RFC',              retencion.rfcReceptor],
        ['Nacionalidad',     retencion.nacionalidad],
        ['Nombre',           retencion.nombreReceptor],
        ['Domicilio fiscal', retencion.domicilioFiscal],
    ])
    y = lineaDivisora(doc, y)

    // PERÍODO
    y = etiquetaSeccion(doc, y, 'Período')
    const periodoStr = retencion.mesIni === retencion.mesFin
        ? `${mesNombre(retencion.mesIni)} ${retencion.ejercicio}`
        : `${mesNombre(retencion.mesIni)} — ${mesNombre(retencion.mesFin)} ${retencion.ejercicio}`

    doc.setFillColor(C.light[0], C.light[1], C.light[2])
    doc.setDrawColor(C.border[0], C.border[1], C.border[2])
    doc.roundedRect(14, y, 182, 9, 1.5, 1.5, 'FD')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(C.dark[0], C.dark[1], C.dark[2])
    doc.text(periodoStr, 105, y + 5.8, { align: 'center' })
    y += 13

    // TOTALES
    y = etiquetaSeccion(doc, y, 'Totales')
    doc.autoTable({
        startY: y,
        margin: { left: 14, right: 14 },
        tableWidth: 182,
        head: [['Total Operación', 'Total Gravado', 'Total Exento', 'Total Retenido']],
        body: [[
            '$' + fmt(retencion.montoTotOperacion),
            '$' + fmt(retencion.montoTotGrav),
            '$' + fmt(retencion.montoTotExent),
            '$' + fmt(retencion.montoTotRet),
        ]],
        headStyles: { fillColor: C.headerBg, textColor: C.mid, fontStyle: 'bold', fontSize: 6.5, halign: 'center' },
        bodyStyles: { fontSize: 9, fontStyle: 'bold', halign: 'center', textColor: C.dark, fillColor: C.white, cellPadding: 4 },
        columnStyles: { 3: { textColor: C.red, fillColor: C.redLight } },
        theme: 'grid',
        tableLineColor: C.border,
        tableLineWidth: 0.2,
    })
    y = doc.lastAutoTable.finalY + 5

    // IMPUESTOS RETENIDOS
    if (retencion.impuestosRetenidos && retencion.impuestosRetenidos.length) {
        y = etiquetaSeccion(doc, y, 'Detalle de Impuestos Retenidos')
        doc.autoTable({
            startY: y,
            margin: { left: 14, right: 14 },
            tableWidth: 182,
            head: [['Impuesto', 'Base retenida', 'Monto retenido', 'Tipo de pago']],
            body: retencion.impuestosRetenidos.map(imp => [
                impNombre(imp.impuesto),
                '$' + fmt(imp.baseRet),
                '$' + fmt(imp.montoRet),
                safe(imp.tipoPagoRet),
            ]),
            headStyles: { fillColor: C.headerBg, textColor: C.mid, fontStyle: 'bold', fontSize: 6.5, halign: 'center' },
            bodyStyles: { fontSize: 8, fontStyle: 'bold', halign: 'center', textColor: C.dark, cellPadding: 3 },
            alternateRowStyles: { fillColor: C.light },
            didDrawCell: (data) => {
                if (data.section === 'body' && data.column.index === 0) {
                    const val = data.cell.raw
                    const fillC = val === 'ISR' ? C.isrLight : C.ivaLight
                    const textC = val === 'ISR' ? C.isr      : C.iva
                    doc.setFillColor(fillC[0], fillC[1], fillC[2])
                    doc.roundedRect(data.cell.x + 2, data.cell.y + 1.5, data.cell.width - 4, data.cell.height - 3, 1, 1, 'F')
                    doc.setFont('helvetica', 'bold')
                    doc.setFontSize(7)
                    doc.setTextColor(textC[0], textC[1], textC[2])
                    doc.text(val, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 1, { align: 'center' })
                }
            },
            theme: 'grid',
            tableLineColor: C.border,
            tableLineWidth: 0.2,
        })
        y = doc.lastAutoTable.finalY + 5
    }

    // PLATAFORMAS TECNOLÓGICAS
    if (retencion.plataformasTecnologicas) {
        if (y > 210) { doc.addPage(); y = 15 }
        const plt = retencion.plataformasTecnologicas
        y = etiquetaSeccion(doc, y, 'Complemento — Servicios de Plataformas Tecnológicas')

        doc.autoTable({
            startY: y,
            margin: { left: 14, right: 14 },
            tableWidth: 182,
            head: [['Concepto', 'Valor', 'Concepto', 'Valor']],
            body: [
                ['Periodicidad',        safe(plt.periodicidad),             'Num. servicios',      safe(plt.numServ)],
                ['Monto tot. sin IVA', '$' + fmt(plt.monTotServSIVA),      'Uso de plataforma',  '$' + fmt(plt.monTotalUsoPlataforma)],
                ['IVA trasladado',     '$' + fmt(plt.totalIVATrasladado),  'IVA retenido',        '$' + fmt(plt.totalIVARetenido)],
                ['ISR retenido',       '$' + fmt(plt.totalISRRetenido),    'Dif. IVA entregado',  '$' + fmt(plt.difIVAEntregado)],
            ],
            headStyles: { fillColor: C.headerBg, textColor: C.mid, fontStyle: 'bold', fontSize: 6.5, halign: 'center' },
            bodyStyles: { fontSize: 7.5, textColor: C.dark, cellPadding: 3 },
            columnStyles: {
                0: { fontStyle: 'normal', textColor: C.soft, cellWidth: 38 },
                1: { fontStyle: 'bold',   halign: 'right',   cellWidth: 52 },
                2: { fontStyle: 'normal', textColor: C.soft, cellWidth: 38 },
                3: { fontStyle: 'bold',   halign: 'right',   cellWidth: 54 },
            },
            alternateRowStyles: { fillColor: C.light },
            theme: 'grid',
            tableLineColor: C.border,
            tableLineWidth: 0.2,
        })
        y = doc.lastAutoTable.finalY + 5

        if (plt.servicios && plt.servicios.length) {
            plt.servicios.forEach((srv, si) => {
                if (y > 220) { doc.addPage(); y = 15 }

                doc.setFillColor(C.light[0], C.light[1], C.light[2])
                doc.setDrawColor(C.border[0], C.border[1], C.border[2])
                doc.roundedRect(14, y, 182, 7, 1, 1, 'FD')
                doc.setFont('helvetica', 'bold')
                doc.setFontSize(6.8)
                doc.setTextColor(C.mid[0], C.mid[1], C.mid[2])
                doc.text(
                    `Servicio ${si + 1}  ·  Fecha: ${safe(srv.fechaServ)}  ·  Tipo: ${safe(srv.tipoDeServ)}  ·  Forma pago: ${safe(srv.formaPagoServ)}`,
                    105, y + 4.3, { align: 'center' })
                y += 9

                doc.autoTable({
                    startY: y,
                    margin: { left: 14, right: 14 },
                    tableWidth: 182,
                    head: [['Precio sin IVA', 'Comisión del servicio']],
                    body: [['$' + fmt(srv.precioSinIVA), '$' + fmt(srv.comisionImporte)]],
                    headStyles: { fillColor: C.headerBg, textColor: C.mid, fontStyle: 'bold', fontSize: 6.5, halign: 'center' },
                    bodyStyles: { fontSize: 8, fontStyle: 'bold', halign: 'center', textColor: C.dark, cellPadding: 3 },
                    theme: 'grid',
                    tableLineColor: C.border,
                    tableLineWidth: 0.2,
                })
                y = doc.lastAutoTable.finalY + 3

                if (srv.impuestosTrasladadados && srv.impuestosTrasladadados.length) {
                    doc.autoTable({
                        startY: y,
                        margin: { left: 14, right: 14 },
                        tableWidth: 182,
                        head: [['Base', 'Impuesto', 'Tipo factor', 'Tasa/Cuota', 'Importe']],
                        body: srv.impuestosTrasladadados.map(it => [
                            '$' + fmt(it.baseImp),
                            safe(it.impuesto),
                            safe(it.tipoFactor),
                            safe(it.tasaCuota),
                            '$' + fmt(it.importe),
                        ]),
                        headStyles: { fillColor: C.headerBg, textColor: C.mid, fontStyle: 'bold', fontSize: 6.5, halign: 'center' },
                        bodyStyles: { fontSize: 7.5, halign: 'center', textColor: C.dark, cellPadding: 2.5 },
                        alternateRowStyles: { fillColor: C.light },
                        theme: 'grid',
                        tableLineColor: C.border,
                        tableLineWidth: 0.2,
                    })
                    y = doc.lastAutoTable.finalY + 4
                }
            })
        }
    }

    // FOOTER
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setDrawColor(C.border[0], C.border[1], C.border[2])
        doc.setLineWidth(0.2)
        doc.line(14, 272, 196, 272)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(6)
        doc.setTextColor(C.soft[0], C.soft[1], C.soft[2])
        doc.text('Este documento es una representación del CFDI de Retenciones e Información de Pagos v2.0 · Contago Mi Auditor', 14, 276)
        doc.text(`Página ${i} de ${pageCount}`, 196, 276, { align: 'right' })
    }

    const nombre = `Retencion_${safe(retencion.rfcEmisor)}_${safe(retencion.uuid).substring(0, 8).toUpperCase()}.pdf`
    doc.save(nombre)
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
            const canvas = document.createElement('canvas')
            canvas.width  = img.width
            canvas.height = img.height
            canvas.getContext('2d').drawImage(img, 0, 0)
            resolve(canvas.toDataURL('image/png'))
        }
        img.onerror = reject
        img.src = src
    })
}