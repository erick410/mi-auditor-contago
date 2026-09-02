import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import moment from 'moment'
import { numeroALetras } from './numeroALetras'

pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs

// ==================================================================
// Mismo lenguaje visual que pdfComprobante.js / pdfCartaPorte.js
// ==================================================================

const colores = {
  ink: '#182333',
  inkSoft: '#3d4a5f',
  gold: '#b8892b',
  goldDeep: '#8f6a1e',
  slate: '#6b7280',
  line: '#dcd5c4',
  borde: '#dde2e8',
  paper: '#faf8f3'
}

const money = (n) =>
  '$' + Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const cantidad = (n, dec = 3) =>
  Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: dec, maximumFractionDigits: dec })

const CATALOGO_IMPUESTOS = { '001': 'ISR', '002': 'IVA', '003': 'IEPS' }

class pdfPago {
  // ---------------- helpers generales (idénticos a pdfCartaPorte.js) ----------------

  static _comoDataUri(base64, mime = 'image/png') {
    if (!base64) return null
    return base64.startsWith('data:') ? base64 : `data:${mime};base64,${base64}`
  }

  static _partirLargo(texto, cada = 90) {
    if (!texto) return ''
    return String(texto).replace(new RegExp(`(.{${cada}})`, 'g'), '$1 ')
  }

  static _limpiarTexto(html) {
    if (!html) return ''
    const pareceHtml = /<[a-z][\s\S]*>/i.test(html)
    if (!pareceHtml) return String(html).replace(/\s+/g, ' ').trim()
    const temp = document.createElement('div')
    temp.innerHTML = html
    return (temp.textContent || temp.innerText || '').replace(/\s+/g, ' ').trim()
  }

  static _hayCfdisRelacionados(f) {
    if (!Array.isArray(f.cfdiRelacionados) || f.cfdiRelacionados.length === 0) return false
    return f.cfdiRelacionados.some((rel) => {
      const tieneTipo = rel?.tipoRelacion?.tipoRelacion || rel?.tipoRelacion?.clave
      const tieneUuid = Array.isArray(rel?.uuid) && rel.uuid.length > 0
      return tieneTipo || tieneUuid
    })
  }

  static _mapearImpuestos(lista) {
    return (lista || []).map((item) => ({
      etiqueta: CATALOGO_IMPUESTOS[item.impuesto] || item.impuesto,
      importe: item.importe || 0
    }))
  }

  /** Color de acento según el RFC del emisor */
  static _colorPorRfc(rfc) {
    if ((rfc || '').trim().toUpperCase() === 'RTN090324267') return '#253364'
    return '#FF931E'
  }

  /** Formatea fechas ISO ("...Z" o "...-06:00") respetando el offset original, sin convertir a la zona local */
  static _formatearFecha(valor, formato = 'DD/MMM/YYYY HH:mm') {
    if (!valor) return ''
    moment.locale('es')
    const m = moment.parseZone(valor)
    return m.isValid() ? m.format(formato) : String(valor)
  }

  static _cadenaVerificacionQr(f) {
    if (f.cadenaVerificacionQr) return f.cadenaVerificacionQr
    const tfd = f.timbreFiscalDigital
    if (!tfd) return ''
    const uuid = (tfd.uuid || f.folioFiscal || '').toUpperCase()
    const re = f.emisor?.rfc || ''
    const rr = f.receptor?.rfc || ''
    const tt = Number(f.total || 0).toFixed(6)
    const fe = (tfd.selloCFD || '').slice(-8)
    return `https://verificacfdi.facturaelectronica.sat.gob.mx/default.aspx?id=${uuid}&re=${re}&rr=${rr}&tt=${tt}&fe=${fe}`
  }

  static _esSafari() {
    if (typeof navigator === 'undefined') return false
    const ua = navigator.userAgent
    return /^((?!chrome|android|crios|fxios|edg).)*safari/i.test(ua)
  }

  /** Ver nota en pdfCartaPorte.js: Safari no respeta `download` sobre blobs, así que ahí abrimos el PDF en pestaña nueva */
  static _entregarPdf(pdfDoc, nombreArchivo, ventanaPrevia) {
    if (pdfPago._esSafari()) {
      pdfDoc.getBlob((blob) => {
        const url = URL.createObjectURL(blob)
        const destino = ventanaPrevia || window.open(url, '_blank')
        if (destino && !destino.closed) {
          destino.location.href = url
        } else {
          window.location.href = url
        }
        setTimeout(() => URL.revokeObjectURL(url), 60000)
      })
      return
    }
    pdfDoc.download(nombreArchivo)
  }

  // ---------------- celdas / cajas reutilizables ----------------

  static _celdaBarra(etiqueta, valor, alineacion = 'left') {
    return {
      margin: [8, 7, 8, 7],
      stack: [
        { text: String(etiqueta).toUpperCase(), fontSize: 6.5, color: colores.slate, characterSpacing: 0.3, alignment: alineacion },
        { text: valor == null || valor === '' ? '—' : String(valor), fontSize: 9, bold: true, color: colores.ink, margin: [0, 3, 0, 0], alignment: alineacion }
      ]
    }
  }

  static _barra(acento, celdas, alineacion = 'left') {
    const visibles = celdas.filter((c) => c.valor !== undefined && c.valor !== null && c.valor !== '')
    if (!visibles.length) return null
    return {
      margin: [0, 6, 0, 0],
      table: {
        widths: visibles.map(() => '*'),
        body: [visibles.map((c) => pdfPago._celdaBarra(c.etiqueta, c.valor, alineacion))]
      },
      layout: { hLineColor: () => colores.borde, vLineColor: () => colores.borde, hLineWidth: () => 0.75, vLineWidth: () => 0.75 }
    }
  }

  /** Línea tipo lista: "ETIQUETA: valor" — para datos con cadenas largas sin espacios (certificados, folios) */
  static _lineaDato(etiqueta, valor, primero = false) {
    return {
      margin: [0, primero ? 0 : 2, 0, 0],
      text: [
        { text: `${etiqueta}: `, bold: true, fontSize: 8, color: colores.ink },
        { text: valor || '—', fontSize: 8, color: colores.inkSoft }
      ]
    }
  }

  static _bloqueSello(etiqueta, valor) {
    return {
      margin: [0, 0, 10, 2],
      stack: [
        { text: String(etiqueta).toUpperCase(), fontSize: 6, bold: true, color: colores.ink },
        { text: pdfPago._partirLargo(valor), style: 'mono', fontSize: 5, margin: [0, 2, 0, 0] }
      ]
    }
  }

  static _tablaConEncabezado(acento, encabezados, widths, filas, fontSizeCelda = 7.5) {
    return {
      margin: [0, 6, 0, 0],
      table: {
        headerRows: 1,
        widths,
        body: [encabezados.map((h) => ({ text: String(h.text).toUpperCase(), alignment: h.alignment || 'left', style: 'thConcepto' })), ...filas]
      },
      layout: {
        hLineColor: (i) => (i === 1 ? acento : colores.borde),
        vLineColor: () => colores.borde,
        hLineWidth: (i) => (i === 1 ? 1.25 : 0.5),
        vLineWidth: () => 0,
        paddingTop: () => 4,
        paddingBottom: () => 4
      },
      fontSize: fontSizeCelda
    }
  }

  // ==================================================================
  // docDefinition principal
  // ==================================================================

  static _crearDocDefinition(f, opciones = {}) {
    const acento = opciones.color || pdfPago._colorPorRfc(f.emisor?.rfc)
    const tipoComprobante = opciones.tipoComprobante || f.tipoComprobanteInterno || 'PAGO'
    const estatus = opciones.estatus || f.estatus || ''
    const cancelado = estatus.toLowerCase() === 'cancelado'
    const sinTimbrar = !f.timbreFiscalDigital
    const pago = f.pago || {}
    const totales = pago.totales || {}

    const celdasBarra = [
      { etiqueta: 'Forma de pago', valor: f.formaPago?.formaPago },
      { etiqueta: 'Método de pago', valor: f.metodoPago?.metodoPago },
      { etiqueta: 'Moneda', valor: f.moneda?.clave },
      { etiqueta: 'Condiciones', valor: f.condicionesDePago },
      { etiqueta: 'Orden de compra', valor: f.oc }
    ]

    const hayDescuento = (f.conceptos || []).some((c) => c.descuento > 0)
    const widthsConceptos = hayDescuento ? [28, 45, '*', 60, 55, 60] : [28, 45, '*', 60, 60]

    const filasTotales = []
    filasTotales.push([
      { text: 'Subtotal', style: 'totalLabel' },
      { text: money(f.subTotal), alignment: 'right', style: 'mono' }
    ])
    if (f.descuento > 0) {
      filasTotales.push([{ text: 'Descuento', style: 'totalLabel' }, { text: money(f.descuento), alignment: 'right', style: 'mono' }])
    }
    pdfPago._mapearImpuestos(f.impuestos?.traslados).forEach((t) => {
      filasTotales.push([{ text: t.etiqueta, style: 'totalLabel' }, { text: money(t.importe), alignment: 'right', style: 'mono' }])
    })
    pdfPago._mapearImpuestos(f.impuestos?.retenciones).forEach((r) => {
      filasTotales.push([{ text: r.etiqueta, style: 'totalLabel' }, { text: '-' + money(r.importe), alignment: 'right', style: 'mono' }])
    })
    filasTotales.push([
      { text: 'Total', bold: true, fontSize: 11, color: acento, margin: [6, 6, 0, 6] },
      { text: money(f.total), bold: true, fontSize: 11, color: acento, alignment: 'right', margin: [0, 6, 6, 6] }
    ])

    return {
      pageSize: 'LETTER',
      pageMargins: [30, 26, 30, 46],

      footer: function (currentPage, pageCount) {
        return {
          margin: [30, 10, 30, 0],
          stack: [
            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 552, y2: 0, lineWidth: 0.5, lineColor: acento, dash: { length: 2 } }] },
            {
              margin: [0, 5, 0, 0],
              columns: [
                {
                  width: '*',
                  style: 'nota',
                  lineHeight: 1.15,
                  text: f.timbreFiscalDigital
                    ? `Este documento es una representación impresa de un CFDI con Complemento de Pago · Documento generado por ContaGo · Fecha y hora de certificación: ${pdfPago._formatearFecha(f.timbreFiscalDigital.fechaTimbrado)} `
                    : 'Vista previa · Este comprobante aún no ha sido timbrado ante el SAT · Documento generado por ContaGo'
                },
                pageCount > 1
                  ? { width: 70, style: 'nota', alignment: 'right', text: `Hoja ${currentPage} de ${pageCount}` }
                  : { width: 0, text: '' }
              ]
            }
          ]
        }
      },

      ...(cancelado ? { watermark: { text: 'CANCELADO', color: '#c0392b', opacity: 0.15, bold: true, angle: -35 } } : {}),

      defaultStyle: { font: 'Roboto', fontSize: 9, color: colores.ink },
      styles: {
        etiqueta: { fontSize: 7.5, bold: true, color: acento, characterSpacing: 1 },
        razon: { fontSize: 13, bold: true, color: colores.ink },
        mono: { fontSize: 8, color: colores.inkSoft },
        slate: { fontSize: 8, color: colores.slate },
        tipoDoc: { fontSize: 12, bold: true, color: colores.ink, characterSpacing: 1.2 },
        serieFolio: { fontSize: 16, bold: true, color: colores.ink },
        thConcepto: { fontSize: 7.5, bold: true, color: acento, characterSpacing: 0.4 },
        totalLabel: { fontSize: 9, color: colores.inkSoft },
        totalFinal: { fontSize: 13, bold: true, color: colores.paper },
        nota: { fontSize: 7.5, color: colores.slate, italics: true },
        seccion: { fontSize: 11, bold: true, color: acento, characterSpacing: 0.8 }
      },

      content: [
        // ============ ENCABEZADO ============
        {
          columns: [
            {
              width: '*',
              ...(opciones.logoBase64
                ? { image: pdfPago._comoDataUri(opciones.logoBase64), fit: [220, 70], alignment: 'left' }
                : {
                    stack: [
                      { text: f.emisor.rfc, style: 'mono', fontSize: 10 },
                      { text: f.emisor.nombre, style: 'serieFolio' }
                    ]
                  })
            },
            {
              width: 190,
              alignment: 'right',
              stack: [
                { text: 'P · Pago', style: 'tipoDoc' },
                { text: `${tipoComprobante} · CFDI ${f.version || '4.0'} con Complemento de Pago ${pago.version || ''}`, style: 'slate', margin: [0, 1, 0, 0] },
                { text: `${f.serie || ''} ${f.folio || ''}`.trim(), style: 'serieFolio', margin: [0, 4, 0, 0] },
                { text: `Emisión: ${pdfPago._formatearFecha(f.fecha)}`, style: 'mono', margin: [0, 4, 0, 0] },
                {
                  text: sinTimbrar ? 'UUID: Pendiente de timbrado' : `UUID: ${f.folioFiscal || f.timbreFiscalDigital?.uuid || ''}`,
                  style: 'mono',
                  margin: [0, 6, 0, 0],
                  fontSize: 7
                },
                ...(estatus ? [{ text: estatus.toUpperCase(), style: 'mono', bold: true, color: cancelado ? '#c0392b' : colores.slate, margin: [0, 2, 0, 0], fontSize: 7 }] : [])
              ]
            }
          ]
        },

        { canvas: [{ type: 'line', x1: 0, y1: 8, x2: 550, y2: 8, lineWidth: 1.5, lineColor: acento }] },

        // ============ EMISOR / RECEPTOR ============
        // Sin cuadros: una sola línea vertical divide emisor y receptor
        {
          margin: [0, 10, 0, 0],
          table: {
            widths: ['*', '*'],
            body: [[
              {
                stack: [
                  { text: 'EMISOR', style: 'etiqueta' },
                  { text: f.emisor.nombre, bold: true, margin: [0, 5, 0, 2] },
                  { text: `RFC: ${f.emisor.rfc}`, style: 'mono' },
                  { text: `Régimen fiscal: ${f.emisor.regimenFiscal?.regimenFiscal || ''}`, margin: [0, 2, 0, 0], fontSize: 8.5 },
                  { text: `Lugar de expedición (C.P.): ${f.lugarExpedicion || ''}`, margin: [0, 2, 0, 0], fontSize: 8.5 }
                ]
              },
              {
                stack: [
                  { text: 'RECEPTOR', style: 'etiqueta' },
                  { text: f.receptor.nombre, bold: true, margin: [0, 5, 0, 2] },
                  { text: `RFC: ${f.receptor.rfc}`, style: 'mono' },
                  { text: `Régimen fiscal: ${f.receptor.regimenFiscalReceptor?.regimenFiscal || ''}`, margin: [0, 2, 0, 0], fontSize: 8.5 },
                  { text: `Uso de CFDI: ${f.receptor.usoCfdi?.usoCfdi || ''}`, margin: [0, 2, 0, 0], fontSize: 8.5 },
                  { text: `Domicilio fiscal (C.P.): ${f.receptor.domicilioFiscalReceptor || ''}`, margin: [0, 2, 0, 0], fontSize: 8.5 }
                ]
              }
            ]]
          },
          layout: {
            hLineWidth: () => 0,
            vLineWidth: (i) => (i === 1 ? 1 : 0),
            vLineColor: () => colores.borde,
            paddingLeft: (i) => (i === 0 ? 0 : 16),
            paddingRight: (i) => (i === 0 ? 16 : 0),
            paddingTop: () => 2,
            paddingBottom: () => 2
          }
        },

        // ============ BARRA DE DATOS DEL COMPROBANTE ============
        pdfPago._barra(acento, celdasBarra),

        // ============ CFDI RELACIONADOS ============
        ...(pdfPago._hayCfdisRelacionados(f)
          ? [{
              margin: [0, 8, 0, 0],
              table: {
                widths: ['*'],
                body: [[{
                  margin: [10, 6, 10, 6],
                  stack: [
                    { text: 'CFDI RELACIONADOS', style: 'etiqueta' },
                    ...f.cfdiRelacionados
                      .filter((rel) => rel?.tipoRelacion?.tipoRelacion || rel?.tipoRelacion?.clave || (rel?.uuid || []).length)
                      .map((rel, idx) => ({
                        margin: [0, idx === 0 ? 5 : 8, 0, 0],
                        stack: [
                          { text: rel.tipoRelacion?.tipoRelacion || `${rel.tipoRelacion?.clave || ''} · ${rel.tipoRelacion?.descripcion || ''}`, bold: true, fontSize: 8.5, color: colores.ink },
                          ...(rel.uuid || []).map((u) => ({ text: u, style: 'mono', fontSize: 8, margin: [0, 1, 0, 0] }))
                        ]
                      }))
                  ]
                }]]
              },
              layout: { hLineColor: () => colores.borde, vLineColor: () => colores.borde, hLineWidth: () => 0.75, vLineWidth: () => 0.75 }
            }]
          : []),

        // ============ CONCEPTOS ============
        {
          margin: [0, 10, 0, 0],
          table: {
            headerRows: 1,
            widths: widthsConceptos,
            body: [
              [
                { text: 'CANT.', style: 'thConcepto', alignment: 'right' },
                { text: 'UNIDAD', style: 'thConcepto' },
                { text: 'DESCRIPCIÓN', style: 'thConcepto' },
                { text: 'VALOR UNITARIO', style: 'thConcepto', alignment: 'right' },
                ...(hayDescuento ? [{ text: 'DESCUENTO', style: 'thConcepto', alignment: 'right' }] : []),
                { text: 'IMPORTE', style: 'thConcepto', alignment: 'right' }
              ],
              ...(f.conceptos || []).map((c) => [
                { text: cantidad(c.cantidad), alignment: 'right' },
                { text: c.unidad ? `${c.unidad} · ${c.claveUnidad?.clave || ''}` : (c.claveUnidad?.clave || '') },
                {
                  stack: [
                    { text: c.noIdentificacion ? `${c.noIdentificacion} · ${pdfPago._limpiarTexto(c.descripcion)}` : pdfPago._limpiarTexto(c.descripcion) },
                    { text: `${c.claveProdServ?.claveProdServ || ''}`, style: 'mono', fontSize: 7 }
                  ]
                },
                { text: money(c.valorUnitario), alignment: 'right', style: 'mono' },
                ...(hayDescuento ? [{ text: money(c.descuento), alignment: 'right', style: 'mono' }] : []),
                { text: money(c.cantidad * c.valorUnitario - (c.descuento || 0)), alignment: 'right', style: 'mono', bold: true }
              ])
            ]
          },
          layout: {
            hLineColor: (i) => (i === 1 ? acento : colores.borde),
            vLineColor: () => colores.borde,
            hLineWidth: (i) => (i === 1 ? 1.25 : 0.5),
            vLineWidth: () => 0,
            paddingTop: () => 5,
            paddingBottom: () => 5
          }
        },

        // ============ IMPORTE CON LETRA + TOTALES ============
        {
          margin: [0, 12, 0, 0],
          columns: [
            {
              width: '*',
              table: {
                widths: ['*'],
                body: [[{
                  stack: [
                    { text: 'IMPORTE CON LETRA', style: 'etiqueta' },
                    { text: `${numeroALetras(f.total, f.moneda?.clave === 'XXX' ? 'MXN' : f.moneda?.clave)}`, margin: [0, 4, 0, 0], fontSize: 8.5, color: colores.inkSoft }
                  ],
                  margin: [10, 6, 10, 6]
                }]]
              },
              layout: { hLineColor: () => colores.borde, vLineColor: () => colores.borde, hLineWidth: () => 0.75, vLineWidth: () => 0.75 }
            },
            { width: 10, text: '' },
            { width: 200, table: { widths: ['*', 'auto'], body: filasTotales }, layout: 'noBorders' }
          ]
        },

        // ============ NOTAS ============
        ...(f.notas && f.notas.trim() !== ''
          ? [{
              margin: [0, 12, 0, 0],
              table: {
                widths: ['*'],
                body: [[{
                  margin: [10, 6, 10, 6],
                  stack: [{ text: 'NOTAS', style: 'etiqueta' }, { text: f.notas, margin: [0, 4, 0, 0], fontSize: 8.5, color: colores.inkSoft }]
                }]]
              },
              layout: { hLineColor: () => colores.borde, vLineColor: () => colores.borde, hLineWidth: () => 0.75, vLineWidth: () => 0.75 }
            }]
          : []),

        // ==================================================================
        // COMPLEMENTO DE PAGO
        // ==================================================================
        { text: `COMPLEMENTO DE PAGO ${pago.version || ''}`.trim(), style: 'seccion', margin: [0, 20, 0, 0] },
        { canvas: [{ type: 'line', x1: 0, y1: 3, x2: 550, y2: 3, lineWidth: 1, lineColor: acento }] },

        // Monto total de pagos — único total destacado con relleno de color de toda la sección
        {
          margin: [0, 8, 0, 0],
          table: { widths: ['*', 'auto'], body: [[
            { text: 'MONTO TOTAL DE PAGOS', style: 'totalFinal', fillColor: acento, margin: [6, 6, 0, 6] },
            { text: money(totales.montoTotalPagos), style: 'totalFinal', fillColor: acento, alignment: 'right', margin: [0, 6, 6, 6] }
          ]] },
          layout: 'noBorders'
        },

        // Retenciones (solo si hay algo distinto de cero) — siempre se muestran los 3 conceptos (ISR/IVA/IEPS), igual que el archivo viejo
        ...(Number(totales.totalRetencionesISR || 0) + Number(totales.totalRetencionesIVA || 0) + Number(totales.totalRetencionesIEPS || 0) !== 0
          ? [pdfPago._barra(acento, [
              { etiqueta: 'Total ISR retenido', valor: money(totales.totalRetencionesISR) },
              { etiqueta: 'Total IVA retenido', valor: money(totales.totalRetencionesIVA) },
              { etiqueta: 'Total IEPS retenido', valor: money(totales.totalRetencionesIEPS) }
            ], 'center')].filter(Boolean)
          : []),

        // Traslados IVA 16% / 8% / 0% / Exento (cada uno solo si aplica)
        ...(Number(totales.totalTrasladosBaseIVA16 || 0) !== 0
          ? [pdfPago._barra(acento, [
              { etiqueta: 'Base IVA 16%', valor: money(totales.totalTrasladosBaseIVA16) },
              { etiqueta: 'Impuesto IVA 16%', valor: money(totales.totalTrasladosImpuestoIVA16) }
            ], 'center')].filter(Boolean)
          : []),
        ...(Number(totales.totalTrasladosBaseIVA8 || 0) !== 0
          ? [pdfPago._barra(acento, [
              { etiqueta: 'Base IVA 8%', valor: money(totales.totalTrasladosBaseIVA8) },
              { etiqueta: 'Impuesto IVA 8%', valor: money(totales.totalTrasladosImpuestoIVA8) }
            ], 'center')].filter(Boolean)
          : []),
        ...(Number(totales.totalTrasladosBaseIVA0 || 0) !== 0
          ? [pdfPago._barra(acento, [
              { etiqueta: 'Base IVA 0%', valor: money(totales.totalTrasladosBaseIVA0) },
              { etiqueta: 'Impuesto IVA 0%', valor: money(totales.totalTrasladosImpuestoIVA0) }
            ], 'center')].filter(Boolean)
          : []),
        ...(Number(totales.totalTrasladosBaseIVAExento || 0) !== 0
          ? [pdfPago._barra(acento, [{ etiqueta: 'Base IVA exento', valor: money(totales.totalTrasladosBaseIVAExento) }], 'center')].filter(Boolean)
          : []),

        // ---------- PAGOS ----------
        ...(Array.isArray(pago.pagos) ? pago.pagos : []).flatMap((pa, idx) => ([
          { text: `PAGO ${idx + 1} DE ${pago.pagos.length}`, style: 'seccion', margin: [0, 18, 0, 0] },
          { canvas: [{ type: 'line', x1: 0, y1: 3, x2: 550, y2: 3, lineWidth: 0.75, lineColor: acento }] },
          pdfPago._barra(acento, [
            { etiqueta: 'Fecha de pago', valor: pdfPago._formatearFecha(pa.fechaPago) },
            { etiqueta: 'Forma de pago', valor: pa.formaDePagoP?.formaPago },
            { etiqueta: 'Monto', valor: money(pa.monto) },
            { etiqueta: 'Moneda', valor: pa.monedaP?.clave },
            { etiqueta: 'Tipo de cambio', valor: pa.tipoCambioP != null ? cantidad(pa.tipoCambioP, 4) : undefined }
          ]),
          ...(Array.isArray(pa.doctoRelacionados)
            ? [
                { margin: [0, 10, 0, 0], text: 'DOCUMENTOS RELACIONADOS', style: 'etiqueta' },
                pdfPago._tablaConEncabezado(
                  acento,
                  [
                    { text: 'ID Documento' },
                    { text: 'Serie' },
                    { text: 'Folio' },
                    { text: 'Moneda' },
                    { text: 'Equiv.', alignment: 'right' },
                    { text: 'Parcial.', alignment: 'right' },
                    { text: 'Imp. anterior', alignment: 'right' },
                    { text: 'Imp. pagado', alignment: 'right' },
                    { text: 'Imp. insoluto', alignment: 'right' }
                  ],
                  ['*', 32, 26, 36, 32, 56, 50, 50, 50],
                  pa.doctoRelacionados.map((dr) => [
                    { text: dr.idDocumento || '', style: 'mono', fontSize: 6.5 },
                    { text: dr.serie || '', fontSize: 7 },
                    { text: dr.folio || '', fontSize: 7 },
                    { text: dr.monedaDR?.clave || '', fontSize: 7 },
                    { text: dr.equivalenciaDR != null ? cantidad(dr.equivalenciaDR, 2) : '', alignment: 'right', style: 'mono', fontSize: 7 },
                    { text: dr.numParcialidad != null ? String(dr.numParcialidad) : '', alignment: 'right', fontSize: 7 },
                    { text: money(dr.impSaldoAnt), alignment: 'right', style: 'mono', fontSize: 7 },
                    { text: money(dr.impPagado), alignment: 'right', style: 'mono', fontSize: 7 },
                    { text: money(dr.impSaldoInsoluto), alignment: 'right', style: 'mono', fontSize: 7 }
                  ]),
                  7
                )
              ]
            : [])
        ])),

        // ============ SELLOS DIGITALES + QR ============
        // Todo este bloque va "unbreakable" para que un salto de página no separe
        // el QR de la fecha de timbrado / folio fiscal / certificados.
        { canvas: [{ type: 'line', x1: 0, y1: 6, x2: 550, y2: 6, lineWidth: 1.5, lineColor: acento }], margin: [0, 18, 0, 0] },
        ...(f.timbreFiscalDigital
          ? [{
              unbreakable: true,
              margin: [0, 8, 0, 0],
              stack: [
                pdfPago._lineaDato('Fecha de timbrado', pdfPago._formatearFecha(f.timbreFiscalDigital.fechaTimbrado), true),
                pdfPago._lineaDato('Folio fiscal (UUID)', f.folioFiscal || f.timbreFiscalDigital.uuid),
                pdfPago._lineaDato('No. de serie del certificado del emisor (CSD)', f.timbreFiscalDigital.noCertificado),
                pdfPago._lineaDato('No. de serie del certificado del SAT', f.timbreFiscalDigital.noCertificadoSAT),
                {
                  margin: [0, 8, 0, 0],
                  columns: [
                    {
                      width: '*',
                      stack: [
                        pdfPago._bloqueSello('Sello digital del CFDI', f.timbreFiscalDigital.selloCFD),
                        pdfPago._bloqueSello('Sello del SAT', f.timbreFiscalDigital.selloSAT),
                        ...(f.timbreFiscalDigital.cadenaOriginal
                          ? [pdfPago._bloqueSello('Cadena original del complemento de certificación digital del SAT', f.timbreFiscalDigital.cadenaOriginal)]
                          : [])
                      ]
                    },
                    {
                      width: 120,
                      alignment: 'center',
                      stack: [
                        opciones.qrBase64
                          ? { image: pdfPago._comoDataUri(opciones.qrBase64), fit: [100, 100], margin: [0, 0, 0, 16] }
                          : { qr: pdfPago._cadenaVerificacionQr(f), fit: 100, foreground: colores.ink, margin: [0, 0, 0, 16] }
                      ]
                    }
                  ]
                }
              ]
            }]
          : [])
      ].filter(Boolean)
    }
  }

  // ==================================================================
  // Servicio — mismo patrón que pdfComprobante.js / pdfCartaPorte.js
  // ==================================================================

  static _nombreArchivo(f) {
    const base = f.serie ? `${f.serie}${f.folio}` : `${f.folio}`
    return `Pago_${base}_${f.receptor?.rfc || ''}.pdf`
  }

  static descargar(datos, opciones = {}) {
    const doc = pdfPago._crearDocDefinition(datos, opciones)
    const pdfDoc = pdfMake.createPdf(doc)
    pdfPago._entregarPdf(pdfDoc, pdfPago._nombreArchivo(datos), opciones.ventana)
  }

  static base64(datos, opciones = {}) {
    return new Promise((resolve, reject) => {
      try {
        const doc = pdfPago._crearDocDefinition(datos, opciones)
        pdfMake.createPdf(doc).getBase64((base64) => resolve(base64))
      } catch (err) {
        reject(err)
      }
    })
  }

  static async dataUri(datos, opciones = {}) {
    const base64 = await pdfPago.base64(datos, opciones)
    return `data:application/pdf;base64,${base64}`
  }

  /**
   * Compatible con la firma anterior de Pago20Base64:
   *   base64 = await Pago20Base64(x, tipoComprobante, estatus, color, codigoQR, logo)
   */
  static Pago20Base64(x, tipoComprobante, estatus, color, codigoQR, logo) {
    return new Promise((resolve, reject) => {
      try {
        const doc = pdfPago._crearDocDefinition(x, {
          color,
          logoBase64: logo,
          qrBase64: codigoQR,
          tipoComprobante,
          estatus
        })
        pdfMake.createPdf(doc).getDataUrl((dataUrl) => resolve(dataUrl))
      } catch (err) {
        reject(err)
      }
    })
  }

  static async generar(datos, opciones = { modo: 'vista' }) {
    if (!datos) throw new Error('DATOS_INCOMPLETOS: no se recibió información del comprobante.')
    const camposRequeridos = ['emisor', 'receptor', 'conceptos', 'total', 'pago']
    const faltantes = camposRequeridos.filter((campo) => datos[campo] == null)
    if (faltantes.length) throw new Error(`DATOS_INCOMPLETOS: faltan los siguientes datos: ${faltantes.join(', ')}.`)

    const docDefinition = pdfPago._crearDocDefinition(datos, opciones)
    const pdfDoc = pdfMake.createPdf(docDefinition)

    switch (opciones.modo) {
      case 'descargar':
        pdfPago._entregarPdf(pdfDoc, pdfPago._nombreArchivo(datos), opciones.ventana)
        break
      case 'vista':
        pdfDoc.open()
        break
      case 'embed':
        pdfDoc.getDataUrl((dataUrl) => {
          if (opciones.elementId) document.getElementById(opciones.elementId).src = dataUrl
        })
        break
      case 'base64':
        return new Promise((resolve) => pdfDoc.getBase64((base64) => resolve(base64)))
      default:
        console.warn(`Modo "${opciones.modo}" no reconocido`)
    }
  }
}

// Export nombrado compatible con tu import actual: import { Pago20Base64 } from './pdfPago'
export const Pago20Base64 = pdfPago.Pago20Base64
export default pdfPago