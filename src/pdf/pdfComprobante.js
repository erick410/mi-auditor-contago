import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import { numeroALetras } from '../components/Pdf/numeroALetras'

// El interop de vfs_fonts cambia según la versión de webpack/vue-cli:
pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs

// ==================================================================
// PLANTILLA — construcción del docDefinition (antes en archivo aparte)
// ==================================================================

// ---------- Paleta (misma que la plantilla HTML) ----------
const colores = {
  ink: '#182333',
  inkSoft: '#3d4a5f',
  gold: '#b8892b',
  goldDeep: '#8f6a1e',
  slate: '#6b7280',
  line: '#dcd5c4',
  paper: '#faf8f3'
}

const money = (n) =>
  '$' + Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// Tema activo de color de acento — se actualiza en cada llamada a pdfComprobante._crearDocDefinition()
// y lo usan las funciones helper (bloqueSello) que quedan fuera de ese scope.
const tema = { gold: colores.gold, goldDeep: colores.goldDeep }

const CATALOGO_IMPUESTOS = {
  '001': 'ISR',
  '002': 'IVA',
  '003': 'IEPS'
}

const CATALOGO_TIPO_COMPROBANTE = {
  I: 'Ingreso',
  E: 'Egreso',
  P: 'Pago',
  N: 'Nómina',
  T: 'Traslado'
}

// ------------------------------------------------------------------
// Datos de ejemplo — reemplaza con los datos reales de tu CFDI
// (los mismos campos que ya manejas en tu backend de notificaciones)
// ------------------------------------------------------------------
const facturaEjemplo = {
  serie: 'A',
  folio: '00147',
  uuid: '3F2A1B9C-4D5E-4F60-8A7B-1C2D3E4F5A6B',
  fechaEmision: '01/07/2026 12:34:10',
  fechaCertificacion: '01/07/2026 12:34:15',
  rfcPac: 'PAC010101AAA',
  formaPago: '03 Transferencia',
  metodoPago: 'PUE · Una exhibición',
  moneda: 'MXN',
  condicionesPago: 'Contado',

  emisor: {
    razonSocial: 'RAZÓN SOCIAL DEL EMISOR S.A. DE C.V.',
    rfc: 'XAXX010101AAA',
    regimen: '601 General de Ley Personas Morales',
    domicilio: 'Calle y número, Colonia, Municipio, Estado',
    cp: '72000'
  },
  receptor: {
    nombre: 'NOMBRE O RAZÓN SOCIAL DEL RECEPTOR',
    rfc: 'XEXX010101000',
    usoCfdi: 'G03 Gastos en general',
    cp: '72100'
  },

  conceptos: [
    { cantidad: 1, unidad: 'Servicio', claveProdServ: '84131500', descripcion: 'Servicio de consultoría mensual', valorUnitario: 12500.0, descuento: 625.0 },
    { cantidad: 2, unidad: 'Pieza', claveProdServ: '43231500', descripcion: 'Licencia de software anual', valorUnitario: 3200.0, descuento: 0 }
  ],

  subtotal: 18900.0,
  descuento: 625.0,
  iva: 2924.0,
  retencionIsr: 0,

  // Complemento "Impuestos Locales" (ISH, ISN, etc. según el estado del emisor)
  impuestosLocales: [
    { impuesto: 'ISH', tasa: '2.5%', tipo: 'Traslado', importe: 472.5 }
  ],
  totalImpLocalesTrasladados: 472.5,
  totalImpLocalesRetenidos: 0,

  total: 21671.5,
  importeConLetra: 'VEINTIÚN MIL SEISCIENTOS SETENTA Y UN PESOS 50/100 M.N.',

  pago: {
    banco: 'Santander',
    cuenta: '0123456789',
    clabe: '014XXXXXXXXXXXXXXX',
    referencia: 'FOL-00147'
  },

  selloCfdi: 'Vk9jQmU3TzhLM2ZkUXJXMnZaTXhQN0xzR3RIRHlOYXBSMUZjV3JCVjZKQnk2S3d4TzlBPT0=...',
  selloSat: 'SUFHRk5UYW5RM0xzR3RIRHlOYXBSMUZjV3JCVjZKQnk2S3d4T5D3NDU2Nzg5MA==...',
  noCertificadoEmisor: '00001000000504465025',
  noCertificadoSat: '00001000000512345678',

  // URL real de verificación del SAT (con parámetros re/rr/tt/id) va aquí:
  cadenaVerificacionQr:
    'https://verificacfdi.facturaelectronica.sat.gob.mx/default.aspx?id=3F2A1B9C-4D5E-4F60-8A7B-1C2D3E4F5A6B&re=XAXX010101AAA&rr=XEXX010101000&tt=21199.00&fe=abcd'
}

class pdfComprobante {
    /** Oscurece un color hex un porcentaje dado (0-1). Usado para derivar el tono "deep" del acento. */
    static _oscurecer(hex, porcentaje) {
    const h = hex.replace('#', '')
    const r = Math.max(0, Math.round(parseInt(h.substring(0, 2), 16) * (1 - porcentaje)))
    const g = Math.max(0, Math.round(parseInt(h.substring(2, 4), 16) * (1 - porcentaje)))
    const b = Math.max(0, Math.round(parseInt(h.substring(4, 6), 16) * (1 - porcentaje)))
    return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')
    }

    /** Normaliza una imagen base64: acepta con o sin el prefijo data URI. */
    static _comoDataUri(base64, mime = 'image/png') {
    if (!base64) return null
    return base64.startsWith('data:') ? base64 : `data:${mime};base64,${base64}`
    }

    static _partirLargo(texto, cada = 70) {
        if (!texto) return ''
        return String(texto).replace(new RegExp(`(.{${cada}})`, 'g'), '$1 ')
    }

    static _cantidad(n) {
        return Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 3 })
    }

/**
 * Construye el docDefinition completo de pdfmake.
 * @param {Object} f - datos de la factura (emisor, receptor, conceptos, totales, etc.)
 * @param {Object} [opciones]
 * @param {string} [opciones.color]            - color de acento en hex (default: dorado '#b8892b')
 * @param {string} [opciones.logoBase64]        - logo del emisor en base64 (con o sin prefijo data URI)
 * @param {string} [opciones.qrBase64]          - imagen del QR ya generada en base64 (si no se manda, se genera con pdfmake a partir de f.cadenaVerificacionQr)
 * @param {string} [opciones.tipoComprobante]   - texto del tipo de comprobante, ej. 'FACTURA', 'NOTA DE CRÉDITO', 'RECIBO DE NÓMINA' (default: 'FACTURA')
 * @param {string} [opciones.estatus]           - si es 'Cancelado' (case-insensitive) se agrega una marca de agua diagonal
 */
static _crearDocDefinition(f, opciones = {}) {
    // const gold = opciones.color || colores.gold
    // const goldDeep = pdfComprobante._oscurecer(gold, 0.25)
    // tema.gold = gold
    // tema.goldDeep = goldDeep
    const acento = opciones.color || colores.gold  // un solo color para todo lo no-texto
    tema.acento = acento
    const tipoComprobante = opciones.tipoComprobante || 'FACTURA'
    const cancelado = (opciones.estatus || '').toLowerCase() === 'cancelado'
    const celdasBarra = [
        { etiqueta: 'Forma de pago', valor: f.formaPago.formaPago },
        { etiqueta: 'Método de pago', valor: f.metodoPago.metodoPago },
        { etiqueta: 'Moneda', valor: `${f.moneda.clave} · ${ money(f.tipoCambio)}` },
        { etiqueta: 'Condiciones', valor: f.condicionesDePago }
    ].filter((c) => c.valor)
    const hayDescuento = f.conceptos.some((c) => c.descuento > 0)
    const widthsConceptos = hayDescuento
    ? [28, 45, '*', 60, 55, 60]
    : [28, 45, '*', 60, 60]
    const filasTotales = []
    filasTotales.push([
        { text: 'Subtotal', style: 'totalLabel' },
        { text: money(f.subTotal), alignment: 'right', style: 'mono' }
    ])
    if (f.descuento > 0) {
        filasTotales.push([
            { text: 'Descuento', style: 'totalLabel' },
            { text: money(f.descuento), alignment: 'right', style: 'mono' }
        ])
    }
    
    pdfComprobante._mapearImpuestos(f.impuestos.traslados).forEach((t) => {
        filasTotales.push([
            { text: t.etiqueta, style: 'totalLabel' },
            { text: money(t.importe), alignment: 'right', style: 'mono' }
        ])
    })

    pdfComprobante._mapearImpuestos(f.impuestos.retenciones).forEach((r) => {
        filasTotales.push([
            { text: r.etiqueta, style: 'totalLabel' },
            { text: '-' + money(r.importe), alignment: 'right', style: 'mono' }
        ])
    })

    ;(f.impLocal?.retencionesLocales || []).forEach((r) => {
        filasTotales.push([
        { text: r.impLocRetenido, style: 'totalLabel' },
        { text: '-' + money(r.importe), alignment: 'right', style: 'mono' }
        ])
    })

    ;(f.impLocal?.trasladosLocales || []).forEach((t) => {
        filasTotales.push([
            { text: t.impLocTrasladado, style: 'totalLabel' },
            { text: money(t.importe), alignment: 'right', style: 'mono' }
        ])
    })

    filasTotales.push([
        { text: 'Total', style: 'totalFinal', fillColor: acento, margin: [6, 6, 0, 6] },
        { text: money(f.total), style: 'totalFinal', fillColor: acento, alignment: 'right', margin: [0, 6, 6, 6] }
    ])

  return {
    pageSize: 'LETTER',
    pageMargins: [30, 26, 30, 22],

    footer: function (currentPage, pageCount) {
        return {
            margin: [30, 8, 30, 0],
            stack: [
                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 552, y2: 0, lineWidth: 0.5, lineColor: acento, dash: { length: 2 } }] },
                {
                margin: [0, 4, 0, 0],
                columns: [
                    {
                    width: '*',
                    style: 'nota',
                    text: `Este documento es una representación impresa de un CFDI · Documento generado por ContaGo · Fecha y hora de certificación: ${f.timbreFiscalDigital.fechaTimbrado} `
                    },
                    pageCount > 1
                    ? { width: 70, style: 'nota', alignment: 'right', text: `Hoja ${currentPage} de ${pageCount}` }
                    : { width: 0, text: '' }
                ]
                }
            ]
        }
    },

    ...(cancelado
      ? { watermark: { text: 'CANCELADO', color: '#c0392b', opacity: 0.15, bold: true, angle: -35 } }
      : {}),

    // ---------- Estilos reutilizables ----------
    defaultStyle: { font: 'Roboto', fontSize: 9, color: colores.ink },
    styles: {
      etiqueta: { fontSize: 8, bold: true, color: colores.ink, characterSpacing: 1 },
      razon: { fontSize: 13, bold: true, color: colores.ink },
      mono: { fontSize: 8, color: colores.inkSoft },
      slate: { fontSize: 8, color: colores.slate },
      tipoDoc: { fontSize: 11, bold: true, color: colores.ink, characterSpacing: 1 },
      serieFolio: { fontSize: 16, bold: true, color: colores.ink },
      thConcepto: { fontSize: 8, bold: true, color: colores.paper, fillColor: acento },
      totalLabel: { fontSize: 9, color: colores.inkSoft },
      totalFinal: { fontSize: 13, bold: true, color: colores.paper },
      nota: { fontSize: 7.5, color: colores.slate, italics: true }
    },

    content: [
        // =========================================================
        // ENCABEZADO: logo + emisor  |  tipo de documento + folio
        // =========================================================
        {
            columns: [
            {
                width: '*',
                ...(opciones.logoBase64
                ? { image: pdfComprobante._comoDataUri(opciones.logoBase64), fit: [220, 70], alignment: 'left' }
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
                { text: `${f.tipoComprobante} · ${CATALOGO_TIPO_COMPROBANTE[f.tipoComprobante] || f.tipoComprobante}`, style: 'tipoDoc' },
                { text: `CFDI ${f.version} · Comprobante Fiscal Digital`, style: 'slate', margin: [0, 1, 0, 0] },
                { text: `${f.serie} · ${f.folio}`, style: 'serieFolio', margin: [0, 4, 0, 0] },
                { text: `Emisión: ${f.fecha}`, style: 'mono', margin: [0, 4, 0, 0] },
                {
                    text: `UUID: ${f.folioFiscal}`,
                    style: 'mono',

                    margin: [0, 6, 0, 0],
                    fontSize: 7,
                    decoration: undefined
                }
                ]
            }
            ]
        },

        // línea gruesa bajo el encabezado
        { canvas: [{ type: 'line', x1: 0, y1: 8, x2: 550, y2: 8, lineWidth: 1.5, lineColor: acento }] },

        // =========================================================
        // EMISOR / RECEPTOR
        // =========================================================
        {
        margin: [0, 5, 0, 0],
        columns: [
            {
            width: '*',
            table: {
                widths: ['*'],
                body: [[{
                stack: [
                    { text: 'EMISOR', style: 'etiqueta' },
                    { text: f.emisor.nombre, bold: true, margin: [0, 5, 0, 2] },
                    { text: `RFC: ${f.emisor.rfc}`, style: 'mono' },
                    { text: `Régimen fiscal: ${f.emisor.regimenFiscal.regimenFiscal}`, margin: [0, 2, 0, 0], fontSize: 8.5 },
                    { text: `Lugar de expedición (C.P.): ${f.lugarExpedicion}`, margin: [0, 2, 0, 0], fontSize: 8.5 },
                    { text: ` `, margin: [0, 2, 0, 0], fontSize: 8.5 }
                ],
                margin: [10, 6, 10, 6]
                }]]
            },
            layout: { hLineColor: () => acento, vLineColor: () => acento, hLineWidth: () => 1, vLineWidth: () => 1 }
            },
            { width: 10, text: '' },
            {
            width: '*',
            table: {
                widths: ['*'],
                body: [[{
                stack: [
                    { text: 'RECEPTOR', style: 'etiqueta' },
                    { text: f.receptor.nombre, bold: true, margin: [0, 5, 0, 2] },
                    { text: `RFC: ${f.receptor.rfc}`, style: 'mono' },
                    { text: `Régimen fiscal: ${f.receptor.regimenFiscalReceptor.regimenFiscal}`, margin: [0, 2, 0, 0], fontSize: 8.5 },
                    { text: `Uso de CFDI: ${f.receptor.usoCfdi.usoCfdi}`, margin: [0, 2, 0, 0], fontSize: 8.5 },
                    { text: `Domicilio fiscal (C.P.): ${f.receptor.domicilioFiscalReceptor}`, margin: [0, 2, 0, 0], fontSize: 8.5 }
                ],
                margin: [10, 6, 10, 6]
                }]]
            },
            layout: { hLineColor: () => acento, vLineColor: () => acento, hLineWidth: () => 1, vLineWidth: () => 1 }
            }
        ]
        },

        // =========================================================
        // BARRA DE DATOS DEL COMPROBANTE
        // =========================================================
        ...(celdasBarra.length
        ? [{
            margin: [0, 4, 0, 0],
            table: {
                widths: celdasBarra.map(() => '*'),
                body: [celdasBarra.map((c) => pdfComprobante._celdaBarra(c.etiqueta, c.valor))]
            },
            layout: { hLineColor: () => acento, vLineColor: () => acento, hLineWidth: () => 1, vLineWidth: () => 1 }
            }]
        : []),

        // =========================================================
        // CFDI RELACIONADOS
        // =========================================================
        ...(f.cfdiRelacionados && f.cfdiRelacionados.length
          ? [{
              margin: [0, 6, 0, 0],
              table: {
                widths: ['*'],
                body: [[{
                  margin: [10, 6, 10, 6],
                  stack: [
                    { text: 'CFDI RELACIONADOS', style: 'etiqueta' },
                    ...f.cfdiRelacionados.map((rel, idx) => ({
                      margin: [0, idx === 0 ? 5 : 8, 0, 0],
                      stack: [
                        {
                          text: rel.tipoRelacion?.tipoRelacion
                            || `${rel.tipoRelacion?.clave || ''} · ${rel.tipoRelacion?.descripcion || ''}`,
                          bold: true,
                          fontSize: 8.5,
                          color: colores.ink
                        },
                        ...(rel.uuid || []).map((u) => ({
                          text: u,
                          style: 'mono',
                          fontSize: 8,
                          margin: [0, 1, 0, 0]
                        }))
                      ]
                    }))
                  ]
                }]]
              },
              layout: { hLineColor: () => acento, vLineColor: () => acento, hLineWidth: () => 1, vLineWidth: () => 1 }
            }]
          : []),

        // =========================================================
        // CONCEPTOS (con descuento por línea)
        // =========================================================
        {
            margin: [0, 6, 0, 0],
            table: {
                headerRows: 1,
                widths: widthsConceptos,
                body: [
                [
                    { text: 'Cant.', style: 'thConcepto', alignment: 'right' },
                    { text: 'Unidad', style: 'thConcepto' },
                    { text: 'Descripción', style: 'thConcepto' },
                    { text: 'Valor unitario', style: 'thConcepto', alignment: 'right' },
                    ...(hayDescuento ? [{ text: 'Descuento', style: 'thConcepto', alignment: 'right' }] : []),
                    { text: 'Importe', style: 'thConcepto', alignment: 'right' }
                ],
                ...f.conceptos.map((c) => [
                    { text: pdfComprobante._cantidad(c.cantidad), alignment: 'right' },
                    { text: c.unidad ? `${c.unidad} · ${c.claveUnidad.clave}` : c.claveUnidad.clave },
                    {
                    stack: [
                        { text: c.noIdentificacion ? `${c.noIdentificacion} · ${c.descripcion}` : c.descripcion },
                        ...(c.cuentaPredial && c.cuentaPredial.numero ? [{ text: `Cuenta predial: ${c.cuentaPredial.numero}`, style: 'mono', fontSize: 7 }] : []),
                        { text: `${c.claveProdServ.claveProdServ}`, style: 'mono', fontSize: 7 }
                    ]
                    },
                    { text: money(c.valorUnitario), alignment: 'right', style: 'mono' },
                    ...(hayDescuento ? [{ text: money(c.descuento), alignment: 'right', style: 'mono' }] : []),
                    { text: money(c.cantidad * c.valorUnitario - c.descuento), alignment: 'right', style: 'mono', bold: true }
                ])
                ]
            },
            layout: {
                hLineColor: () => acento,
                vLineColor: () => acento,
                hLineWidth: () => 1,
                vLineWidth: () => 0,
                paddingTop: () => 4,
                paddingBottom: () => 4
            }
        },      

      // =========================================================
      // IMPORTE CON LETRA + TOTALES
      // =========================================================
        {
            margin: [0, 9, 0, 0],
            columns: [
                {
                width: '*',
                table: {
                    widths: ['*'],
                    body: [[{
                    stack: [
                        { text: 'IMPORTE CON LETRA', style: 'etiqueta' },
                        { text: `${numeroALetras(f.total, f.moneda.clave)}`, margin: [0, 4, 0, 0], fontSize: 8.5, color: colores.inkSoft }
                    ],
                    margin: [10, 6, 10, 6]
                    }]]
                },
                layout: { hLineColor: () => acento, vLineColor: () => acento, hLineWidth: () => 1, vLineWidth: () => 1 }
                },
                { width: 10, text: '' },
                {
                width: 200,
                table: {
                    widths: ['*', 'auto'],
                    body: filasTotales
                },
                layout: 'noBorders'
                }
            ]
        },

        // =========================================================
        // NOTAS
        // =========================================================
        ...(f.notas && f.notas.trim() !== ''
        ? [{
            margin: [0, 9, 0, 0],
            table: {
                widths: ['*'],
                body: [[{
                margin: [10, 6, 10, 6],
                stack: [
                    { text: 'NOTAS', style: 'etiqueta' },
                    { text: f.notas, margin: [0, 4, 0, 0], fontSize: 8.5, color: colores.inkSoft }
                ]
                }]]
            },
            layout: { hLineColor: () => acento, vLineColor: () => acento, hLineWidth: () => 1, vLineWidth: () => 1 }
            }]
        : []),

        // =========================================================
        // SELLOS DIGITALES + QR REAL (nodo nativo `qr` de pdfmake)
        // =========================================================
        { canvas: [{ type: 'line', x1: 0, y1: 6, x2: 550, y2: 6, lineWidth: 1.5, lineColor: acento}], margin: [0, 6, 0, 0] },    
        {
            margin: [0, 8, 0, 0],
            columns: [
                {
                    width: '*',
                    stack: [
                        pdfComprobante._bloqueSello('Sello digital del CFDI', f.timbreFiscalDigital.selloCFD),
                        pdfComprobante._bloqueSello('Sello del SAT', f.timbreFiscalDigital.selloSAT),
                        pdfComprobante._bloqueSello('No. de serie del certificado del emisor (CSD)', f.timbreFiscalDigital.noCertificado),
                        pdfComprobante._bloqueSello('No. de serie del certificado del SAT', f.timbreFiscalDigital.noCertificadoSAT)
                    ]
                },
                {
                    width: 120,
                    alignment: 'center',
                    stack: [
                    // QR real: usa la cadena de verificación del SAT (URL con UUID, RFCs y sello)
                    opciones.qrBase64
                        ? { image: pdfComprobante._comoDataUri(opciones.qrBase64), fit: [100, 100], margin: [0, 0, 0, 16] }
                        : { qr: f.cadenaVerificacionQr, fit: 100, foreground: colores.ink, margin: [0, 0, 0, 16] },
                    ]
                }
            ]
        }
    ]
  }
}

// ---------- Helpers de celdas repetidas ----------
static _celdaBarra(etiqueta, valor) {
  return {
    margin: [8, 6, 8, 6],
    stack: [
      { text: etiqueta.toUpperCase(), fontSize: 6.5, color: colores.slate },
      { text: valor, fontSize: 8.5, bold: true, margin: [0, 2, 0, 0] }
    ]
  }
}

static _celdaPago(etiqueta, valor) {
  return {
    width: '*',
    stack: [
      { text: etiqueta.toUpperCase(), fontSize: 6.5, color: colores.slate },
      { text: valor, style: 'mono', bold: true, margin: [0, 2, 0, 0] }
    ]
  }
}

static _bloqueSello(etiqueta, valor) {
  return {
    margin: [0, 0, 10, 2],
    stack: [
      { text: etiqueta.toUpperCase(), fontSize: 6, bold: true, color: colores.ink },
      { text: pdfComprobante._partirLargo(valor), style: 'mono', fontSize: 5, margin: [0, 2, 0, 0] }
    ]
  }
}

static _formatearTasa(item) {
    if (item.tipoFactor === 'Exento') return 'Exento'
    if (item.tipoFactor === 'Cuota') return `Cuota $${item.tasaOCuota}`
    const porcentaje = item.tasaOCuota * 100
    return `${porcentaje.toFixed(porcentaje % 1 === 0 ? 0 : 2)}%`
}

static _mapearImpuestos(lista) {
  return (lista || []).map((item) => ({
    etiqueta: `${CATALOGO_IMPUESTOS[item.impuesto] || item.impuesto} (${pdfComprobante._formatearTasa(item)})`,
    importe: item.importe || 0
  }))
}

// ==================================================================
// SERVICIO — descargar / base64 / abrir temporal
// ==================================================================

static _nombreArchivo(factura) {
  return `Factura_${factura.serie}${factura.folio}.pdf`
}

/**
 * 1) Descarga el PDF directamente al dispositivo del usuario.
 */
static descargar(factura) {
  const doc = pdfComprobante._crearDocDefinition(factura)
  pdfMake.createPdf(doc).download(pdfComprobante._nombreArchivo(factura))
}

/**
 * 2) Regresa el PDF en base64 (sin el prefijo "data:application/pdf;base64,").
 *    Útil para mandarlo a tu API de notificaciones, adjuntarlo a un correo,
 *    o guardarlo en Mongo/disco desde el backend.
 *
 * @returns {Promise<string>}
 */
static base64(factura) {
  return new Promise((resolve, reject) => {
    try {
      const doc = pdfComprobante._crearDocDefinition(factura)
      pdfMake.createPdf(doc).getBase64((base64) => {
        resolve(base64)
      })
    } catch (err) {
      reject(err)
    }
  })
}

/**
 * 2b) Igual que la anterior, pero con el prefijo data URI incluido
 *     (por si lo necesitas directo en un <embed>, <iframe> o <img>).
 */
static async dataUri(factura) {
  const base64 = await pdfComprobante.base64(factura)
  return `data:application/pdf;base64,${base64}`
}

/**
 * 4) Compatible con la firma de tu implementación anterior:
 *      base64 = await ComprobanteBase64(x, x.tipoComprobanteInterno, x.estatus, color, codigoQR, logo)
 *
 * Regresa el DATA URI COMPLETO (con el prefijo "data:application/pdf;base64,"),
 * igual que tu implementación anterior — así tu componente VisorPdf.vue,
 * que hace `base64.split(',')[1]` para quitar el prefijo, sigue funcionando
 * sin cambios.
 *
 * @param {Object} x               - JSON ya acomodado con la forma que espera crearDocDefinition
 * @param {string} tipoComprobante - ej. 'FACTURA', 'NOTA DE CRÉDITO', 'RECIBO DE NÓMINA'
 * @param {string} estatus         - si es 'Cancelado' se agrega la marca de agua
 * @param {string} color           - color de acento en hex, ej. '#1d4ed8'
 * @param {string} codigoQR        - imagen del QR en base64 (con o sin prefijo data URI)
 * @param {string} logo            - logo del emisor en base64 (con o sin prefijo data URI)
 * @returns {Promise<string>} data URI completo: "data:application/pdf;base64,XXXX..."
 */
static comprobanteBase64(x, tipoComprobante, estatus, color, codigoQR, logo) {
  return new Promise((resolve, reject) => {
    try {
      const doc = pdfComprobante._crearDocDefinition(x, {
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

// ==================================================================
// PUNTO DE ENTRADA UNIFICADO — mismo patrón "formatos + modo"
// ==================================================================

/**
 * Punto de entrada único para generar el comprobante en pdfmake.
 *
 * @param {Object} datos - el JSON del comprobante (mismo shape que espera crearDocDefinition)
 * @param {Object} [opciones]
 * @param {'descargar'|'vista'|'embed'|'base64'} [opciones.modo='vista']
 * @param {string} [opciones.elementId] - id del <embed>/<iframe> cuando modo === 'embed'
 * @param {string} [opciones.color]           - color de acento (ver crearDocDefinition)
 * @param {string} [opciones.logoBase64]
 * @param {string} [opciones.qrBase64]
 * @param {string} [opciones.tipoComprobante]  - texto mostrado en el PDF (ej. 'FACTURA')
 * @param {string} [opciones.estatus]          - 'Cancelado' agrega la marca de agua
 * @returns {Promise<string>|undefined} el base64 puro solo cuando opciones.modo === 'base64'
 */
static async generar(datos, opciones = { modo: 'vista' }) {
  const docDefinition = pdfComprobante._crearDocDefinition(datos, opciones)
  const pdfDoc = pdfMake.createPdf(docDefinition)

  switch (opciones.modo) {
    case 'descargar':
      pdfDoc.download(`${opciones.tipoComprobante || 'Comprobante'}_${datos.folio || ''}.pdf`)
      break

    case 'vista':
      // pdfMake arma un Blob URL internamente y abre una pestaña nueva —
      // no pasa base64 a nada, así que no hay riesgo del error 431 que vimos antes.
      pdfDoc.open()
      break

    case 'embed':
      // Para <embed>/<iframe>/<object> — estos SÍ soportan data URI nativo
      // (se decodifica en el propio navegador, no dispara una petición de red).
      pdfDoc.getDataUrl((dataUrl) => {
        if (opciones.elementId) {
          document.getElementById(opciones.elementId).src = dataUrl
        }
      })
      break

    case 'base64':
      // Base64 puro, sin prefijo "data:application/pdf;base64,"
      return new Promise((resolve) => {
        pdfDoc.getBase64((base64) => resolve(base64))
      })

    default:
      console.warn(`Modo "${opciones.modo}" no reconocido`)
      break
  }
}

  /** Dato de muestra para pruebas rápidas: pdfComprobante.generar(pdfComprobante.ejemplo, { modo: 'vista' }) */
  static get ejemplo() {
    return facturaEjemplo
  }
}

export default pdfComprobante