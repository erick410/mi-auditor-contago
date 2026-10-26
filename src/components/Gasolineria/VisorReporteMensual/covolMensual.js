// Lectura y revisión del reporte mensual de controles volumétricos (JSON v1.12).
// Sin dependencias de Vue: se puede probar aparte o reutilizar en otro componente.
// Requiere: npm i jszip
//
// Escrito sin ?. ni ?? para que compile con cualquier configuración de Babel de Quasar 1.

import JSZip from 'jszip'

export const SUBPRODUCTOS = {
  SP16: { nombre: 'Gasolina regular < 91 oct.', corto: 'Magna', color: '#1f8a4c' },
  SP17: { nombre: 'Gasolina premium ≥ 91 oct.', corto: 'Premium', color: '#c8322f' },
  SP18: { nombre: 'Diésel automotriz', corto: 'Diésel', color: '#2f363c' }
}
const PRODUCTOS = { PR07: 'Gasolinas', PR03: 'Diésel', PR11: 'Turbosina', PR12: 'Gas LP', PR08: 'Petróleo', PR09: 'Gas natural' }
export const EVENTOS = {
  1: 'Administración / sesión', 2: 'Consulta', 3: 'Cambio de configuración', 5: 'Generación de reporte',
  7: 'Diferencia de volumen', 15: 'Alarma de comunicación', 20: 'Alarma de acceso'
}
export const UNIDADES = { UM01: 'm³', UM02: 'pie³', UM03: 'L', UM04: 'bbl' }

const UUID_RX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const NOMBRE_RX = /^M_([0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12})_([A-ZÑ&0-9]{12,13})_([A-ZÑ&0-9]{12,13})_(\d{4}-\d{2}-\d{2})_([A-Z]{3}-\d{4})_([A-Z]{3})_(JSON|XML)$/
const RFC_MORAL = /^[A-ZÑ&]{3}\d{6}[A-Z0-9]{3}$/
const RFC_FISICA = /^[A-ZÑ&]{4}\d{6}[A-Z0-9]{3}$/

const nf3 = new Intl.NumberFormat('es-MX', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
const nf2 = new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const nf0 = new Intl.NumberFormat('es-MX')
export const num = v => (typeof v === 'number' ? v : (v == null || v === '' ? 0 : Number(v)))
export const litros = v => nf3.format(num(v))
export const pesos = v => '$' + nf2.format(num(v))
export const entero = v => nf0.format(num(v))
const get = (o, ruta, def) => {
  let x = o
  for (const p of ruta.split('.')) { if (x == null) return def; x = x[p] }
  return x == null ? def : x
}

export function nombreProducto (p) {
  const sp = SUBPRODUCTOS[p.ClaveSubProducto]
  return sp ? sp.nombre : (PRODUCTOS[p.ClaveProducto] || p.ClaveProducto)
}
export function colorProducto (p, oscuro) {
  const sp = SUBPRODUCTOS[p.ClaveSubProducto]
  if (!sp) return oscuro ? '#5fb4c9' : '#0f5f74'
  return oscuro && p.ClaveSubProducto === 'SP18' ? '#b5bec5' : sp.color
}
export const periodo = d => (d.FechaYHoraReporteMes || '').slice(0, 7)

// ---------- Carga del archivo ----------

/** Lee un .zip (toma el primer .json de adentro) o un .json. */
export async function leerArchivo (file) {
  let bytes
  const meta = { nombreZip: file.name, nombreInterno: null, entradas: 0, bom: false, ejemplo: false }
  if (/\.zip$/i.test(file.name)) {
    const zip = await JSZip.loadAsync(file)
    const todos = Object.values(zip.files).filter(f => !f.dir)
    const jsons = todos.filter(f => /\.json$/i.test(f.name))
    if (!jsons.length) throw new Error('El ZIP no trae ningún .json adentro.')
    bytes = await jsons[0].async('uint8array')
    meta.nombreInterno = jsons[0].name
    meta.entradas = todos.length
  } else {
    bytes = new Uint8Array(await file.arrayBuffer())
  }
  meta.bom = bytes.length >= 3 && bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF

  let texto
  try {
    texto = new TextDecoder('utf-8', { fatal: true }).decode(meta.bom ? bytes.subarray(3) : bytes)
  } catch (e) {
    throw new Error('El archivo no está en UTF-8 válido (el SAT exige UTF-8, Apéndice 6).')
  }
  let datos
  try { datos = JSON.parse(texto) } catch (e) { throw new Error('El JSON no se pudo leer: ' + e.message) }
  if (!datos || !Array.isArray(datos.Producto)) throw new Error('No parece un reporte mensual: falta el arreglo Producto.')
  return { datos, meta }
}

// ---------- Filas de CFDIs ----------

/** Aplana Complemento[].Nacional[].CFDIs[] de Recepciones o Entregas. */
export function filas (seccion, esRecepcion) {
  const rows = []
  const aclaraciones = []
  for (const c of get(seccion, 'Complemento', [])) {
    if (c.Aclaracion) aclaraciones.push(c.Aclaracion)
    for (const n of (c.Nacional || [])) {
      for (const x of (n.CFDIs || [])) {
        rows.push({
          i: rows.length,
          rfc: n.RfcClienteOProveedor,
          nombre: n.NombreClienteOProveedor,
          uuid: x.Cfdi,
          tipo: x.TipoCfdi,
          fecha: x.FechaYHoraTransaccion || '',
          vol: num(get(x, 'VolumenDocumentado.ValorNumerico', 0)),
          um: get(x, 'VolumenDocumentado.UnidadDeMedida', ''),
          precio: num(x.PrecioVenta),
          importe: esRecepcion ? num(x.PrecioCompra) : num(x.PrecioDeVentaAlPublico),
          nodo: n
        })
      }
    }
  }
  return { rows, aclaraciones }
}

// ---------- Revisión contra la guía del mensual ----------

export function revisar (d, meta) {
  const r = []
  const add = (nivel, texto) => r.push({ nivel, texto })
  const per = periodo(d)

  if (meta.bom) add('error', 'El archivo trae BOM al inicio. El SAT pide UTF-8; quítalo para evitar rechazos.')
  else add('ok', 'Codificación UTF-8 sin BOM.')

  // Nombre (Apéndice 4)
  if (!meta.ejemplo && !meta.sinNombre) {
    const nombre = (meta.nombreInterno || meta.nombreZip || '').replace(/\.(zip|json)$/i, '')
    const m = nombre.match(NOMBRE_RX)
    if (!m) {
      add('error', `El nombre «${nombre}» no sigue el Apéndice 4: M_{GUID}_{RFC}_{RFCProveedor}_{AAAA-MM-DD}_{ClaveInstalacion}_{Tipo}_JSON.zip`)
    } else {
      const dif = []
      if (m[2] !== d.RfcContribuyente) dif.push(`RFC ${m[2]} ≠ ${d.RfcContribuyente}`)
      if (m[3] !== d.RfcProveedor) dif.push(`RFC proveedor ${m[3]} ≠ ${d.RfcProveedor}`)
      if (m[4] !== (d.FechaYHoraReporteMes || '').slice(0, 10)) dif.push(`periodo ${m[4]} ≠ ${(d.FechaYHoraReporteMes || '').slice(0, 10)}`)
      if (m[5] !== d.ClaveInstalacion) dif.push(`clave ${m[5]} ≠ ${d.ClaveInstalacion}`)
      if (m[7] !== 'JSON') dif.push('el formato del nombre dice XML')
      if (dif.length) add('error', 'El nombre del archivo no coincide con el contenido: ' + dif.join('; ') + '.')
      else add('ok', `Nombre del archivo correcto (tipo ${m[6]}).`)
    }
    if (meta.entradas > 1) add('aviso', `El ZIP trae ${meta.entradas} archivos; debe traer solo el .json.`)
  }

  // Encabezado
  const rfc = d.RfcContribuyente || ''
  const moral = RFC_MORAL.test(rfc)
  if (!moral && !RFC_FISICA.test(rfc)) add('error', 'RfcContribuyente no tiene formato de RFC.')
  if (moral && !d.RfcRepresentanteLegal) add('error', 'Persona moral sin RfcRepresentanteLegal.')
  if (!moral && d.RfcRepresentanteLegal) add('error', 'RfcRepresentanteLegal solo aplica a persona moral.')
  if (d.RfcProveedor === 'XAXX010101000') add('aviso', 'RfcProveedor es XAXX010101000 (público en general). La guía pide el RFC del proveedor del software, o XAX010101000 si es desarrollo propio.')
  if (d.Caracter === 'permisionario' && (!d.ModalidadPermiso || !d.NumPermiso)) add('error', 'Permisionario sin ModalidadPermiso o NumPermiso.')
  const fr = d.FechaYHoraReporteMes || ''
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/.test(fr)) {
    add('error', 'FechaYHoraReporteMes no tiene el formato yyyy-mm-ddThh:mm:ss±hh:mm.')
  } else {
    const ultimo = new Date(Date.UTC(+fr.slice(0, 4), +fr.slice(5, 7), 0)).getUTCDate()
    if (+fr.slice(8, 10) !== ultimo) add('aviso', `FechaYHoraReporteMes (${fr}) no es el último día del mes.`)
  }

  // Productos
  d.Producto.forEach(p => {
    const id = `${p.ClaveProducto}/${p.ClaveSubProducto || '—'}`
    const rv = p.ReporteDeVolumenMensual || {}
    if (p.ClaveProducto === 'PR07' && (p.ComposOctanajeGasolina == null || !p.GasolinaConCombustibleNoFosil)) add('error', `${id}: gasolina sin ComposOctanajeGasolina o GasolinaConCombustibleNoFosil.`)
    if (p.ClaveProducto === 'PR03' && !p.DieselConCombustibleNoFosil) add('error', `${id}: diésel sin DieselConCombustibleNoFosil.`)
    if (!rv.ControlDeExistencias) add('aviso', `${id}: sin ControlDeExistencias.`)
    else if (num(rv.ControlDeExistencias.VolumenExistenciasMes) < 0) add('error', `${id}: existencia negativa.`)

    const secciones = [
      ['Recepciones', 'TotalRecepcionesMes', 'SumaVolumenRecepcionMes', 'ImporteTotalRecepcionesMensual', true],
      ['Entregas', 'TotalEntregasMes', 'SumaVolumenEntregadoMes', 'ImporteTotalEntregasMes', false]
    ]
    for (const [k, tot, suma, imp, esRec] of secciones) {
      const s = rv[k]
      if (!s) { add('error', `${id}: falta ${k}.`); continue }
      const { rows, aclaraciones } = filas(s, esRec)
      const comps = s.Complemento || []
      const nNac = comps.reduce((a, c) => a + ((c.Nacional && c.Nacional.length) || 0), 0)
      if (!comps.length) add('error', `${id} ${k}: sin Complemento (obligatorio en el mensual).`)
      if (num(s.TotalDocumentosMes) !== nNac) add('error', `${id} ${k}: TotalDocumentosMes ${s.TotalDocumentosMes} ≠ ${nNac} nodos Nacional.`)
      if (num(s[tot]) === 0 && !aclaraciones.length) add('error', `${id} ${k}: sin operaciones y sin Aclaracion.`)

      const sv = rows.reduce((a, x) => a + x.vol, 0)
      const si = rows.reduce((a, x) => a + x.importe, 0)
      const vt = num(get(s, suma + '.ValorNumerico', 0))
      const it = num(s[imp])
      if (Math.abs(sv - vt) > 0.01) add(aclaraciones.length ? 'aviso' : 'error', `${id} ${k}: suma de CFDIs ${litros(sv)} L ≠ total ${litros(vt)} L${aclaraciones.length ? ' (hay aclaración)' : ''}.`)
      if (Math.abs(si - it) > 1) add('aviso', `${id} ${k}: suma de importes ${pesos(si)} ≠ total ${pesos(it)}.`)

      const fuera = rows.filter(x => x.fecha && !x.fecha.startsWith(per)).length
      if (fuera) add('aviso', `${id} ${k}: ${entero(fuera)} CFDIs con fecha fuera de ${per}.`)
      const malos = rows.filter(x => x.uuid && !UUID_RX.test(x.uuid)).length
      if (malos) add('error', `${id} ${k}: ${malos} UUID con formato inválido.`)

      const ums = new Set(rows.map(x => x.um).filter(Boolean))
      const umTotal = get(s, suma + '.UnidadDeMedida', '')
      if (umTotal) ums.add(umTotal)
      if (ums.size > 1) add('error', `${id} ${k}: unidades de medida mezcladas (${Array.from(ums).join(', ')}).`)

      if (!esRec) {
        const mal = rows.filter(x => Math.abs(x.precio * x.vol - x.importe) > 1).length
        if (mal) add('aviso', `${id} Entregas: ${mal} CFDIs donde precio × litros no da el importe.`)
      }
      if (num(s[tot]) < rows.length) add('aviso', `${id} ${k}: ${s[tot]} operaciones pero ${rows.length} CFDIs relacionados.`)
    }
  })

  // Bitácora
  const b = d.BitacoraMensual || []
  if (!b.length) {
    add('aviso', 'BitacoraMensual vacía.')
  } else {
    const nums = b.map(x => x.NumeroRegistro)
    if (new Set(nums).size !== nums.length) add('error', 'Bitácora: NumeroRegistro repetido.')
    const salto = nums.findIndex((n, i) => i > 0 && n !== nums[i - 1] + 1)
    if (salto > 0) add('aviso', `Bitácora: NumeroRegistro no consecutivo (${nums[salto - 1]} → ${nums[salto]}).`)
  }

  const orden = { error: 0, aviso: 1, ok: 2 }
  return r.sort((a, c) => orden[a.nivel] - orden[c.nivel])
}

/** JSON con las listas grandes recortadas, para leerlo a mano. */
export function jsonResumido (d) {
  return JSON.stringify(d, (k, v) => {
    if (k === 'Nacional' && Array.isArray(v) && v.length > 3) return v.slice(0, 2).concat([`… ${v.length - 2} nodos Nacional más`])
    if (k === 'BitacoraMensual' && Array.isArray(v) && v.length > 3) return v.slice(0, 2).concat([`… ${v.length - 2} eventos más`])
    return v
  }, 2)
}

// ---------- Ejemplo (datos inventados; RFCs de ejemplo de la guía del SAT) ----------

export function ejemplo () {
  let seed = 7
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  const hex = n => Array.from({ length: n }, () => '0123456789abcdef'[Math.floor(rnd() * 16)]).join('')
  const uuid = () => `${hex(8)}-${hex(4)}-4${hex(3)}-a${hex(3)}-${hex(12)}`
  const pad = n => String(n).padStart(2, '0')
  const f = (dia, h, m) => `2026-01-${pad(dia)}T${pad(h)}:${pad(m)}:00-06:00`

  const producto = (cp, sp, oct, precio, compras, nVentas, existencia) => {
    const nac = []
    const rec = []
    for (let i = 0; i < nVentas; i++) {
      const vol = Math.round((8 + rnd() * 42) * 1000) / 1000
      const imp = Math.round(vol * precio * 1000) / 1000
      const pg = rnd() < 0.85
      nac.push({
        RfcClienteOProveedor: pg ? 'XAXX010101000' : 'PAL7202161U0',
        NombreClienteOProveedor: pg ? 'PUBLICO EN GENERAL' : 'CLIENTE DE EJEMPLO SA DE CV',
        CFDIs: [{
          Cfdi: uuid(), TipoCfdi: 'Ingreso', PrecioCompra: 0, PrecioDeVentaAlPublico: imp, PrecioVenta: precio,
          FechaYHoraTransaccion: (i === nVentas - 1 && sp === 'SP16') ? '2026-02-01T09:15:00-06:00'
            : f(1 + Math.floor(i * 30 / nVentas), 7 + Math.floor(rnd() * 14), Math.floor(rnd() * 60)),
          VolumenDocumentado: { UnidadDeMedida: 'UM03', ValorNumerico: vol }
        }]
      })
    }
    compras.forEach(([dia, vol, imp]) => rec.push({
      RfcClienteOProveedor: 'GEO9806184R6', NombreClienteOProveedor: 'PROVEEDOR DE COMBUSTIBLE DE EJEMPLO',
      CFDIs: [{ Cfdi: uuid(), TipoCfdi: 'Ingreso', PrecioCompra: imp, PrecioDeVentaAlPublico: 0, PrecioVenta: 0, FechaYHoraTransaccion: f(dia, 21, 30), VolumenDocumentado: { UnidadDeMedida: 'UM03', ValorNumerico: vol } }]
    }))
    const sv = nac.reduce((a, n) => a + n.CFDIs[0].VolumenDocumentado.ValorNumerico, 0)
    const si = nac.reduce((a, n) => a + n.CFDIs[0].PrecioDeVentaAlPublico, 0)
    const p = { ClaveProducto: cp, ClaveSubProducto: sp }
    if (cp === 'PR07') { p.GasolinaConCombustibleNoFosil = 'No'; p.ComposOctanajeGasolina = oct } else p.DieselConCombustibleNoFosil = 'No'
    p.ReporteDeVolumenMensual = {
      ControlDeExistencias: { VolumenExistenciasMes: existencia, FechaYHoraEstaMedicionMes: '2026-01-31T23:59:59-06:00' },
      Recepciones: {
        TotalRecepcionesMes: rec.length,
        SumaVolumenRecepcionMes: { UnidadDeMedida: 'UM03', ValorNumerico: compras.reduce((a, c) => a + c[1], 0) },
        TotalDocumentosMes: rec.length,
        ImporteTotalRecepcionesMensual: compras.reduce((a, c) => a + c[2], 0),
        Complemento: [rec.length ? { TipoComplemento: 'Expendio', Nacional: rec } : { TipoComplemento: 'Expendio', Aclaracion: 'Sin recepciones en el mes.' }]
      },
      Entregas: {
        TotalEntregasMes: nVentas,
        SumaVolumenEntregadoMes: { UnidadDeMedida: 'UM03', ValorNumerico: Math.round(sv * 1000) / 1000 },
        TotalDocumentosMes: nVentas,
        ImporteTotalEntregasMes: Math.round(si * 1000) / 1000,
        Complemento: [{ TipoComplemento: 'Expendio', Nacional: nac }]
      }
    }
    return p
  }

  const datos = {
    Version: '1.12', RfcContribuyente: 'RAL9202161U0', RfcRepresentanteLegal: 'PEPC930514UN7', RfcProveedor: 'XAX010101000',
    Caracter: 'permisionario', ModalidadPermiso: 'PER2', NumPermiso: 'PL/0000/EXP/ES/2020', ClaveInstalacion: 'EDS-0745',
    DescripcionInstalacion: 'ESTACIÓN DE SERVICIO DE EJEMPLO CON 3 TANQUES Y 3 DISPENSARIOS',
    NumeroPozos: 0, NumeroTanques: 3, NumeroDuctosEntradaSalida: 0, NumeroDuctosTransporteDistribucion: 0, NumeroDispensarios: 3,
    FechaYHoraReporteMes: '2026-01-31T23:59:59-06:00',
    Producto: [
      producto('PR07', 'SP16', 87, 24.65, [[4, 21478, 468134.54], [12, 21530, 469268.10], [21, 21512, 468876.80]], 240, 12840),
      producto('PR07', 'SP17', 91, 29.60, [], 18, 5410),
      producto('PR03', 'SP18', null, 28.55, [[9, 21546, 534223.40]], 34, 4120)
    ],
    BitacoraMensual: [
      { NumeroRegistro: 1, FechaYHoraEvento: '2026-01-02T08:01:10-06:00', UsuarioResponsable: 'admin', TipoEvento: 1, DescripcionEvento: 'Inicio de sesión' },
      { NumeroRegistro: 2, FechaYHoraEvento: '2026-01-31T23:59:59-06:00', UsuarioResponsable: 'admin', TipoEvento: 5, DescripcionEvento: 'Generación reporte mensual 2026-01' }
    ]
  }
  return {
    datos,
    meta: {
      nombreZip: 'M_1E868758-9393-47A9-AA94-4229A61C1804_RAL9202161U0_XAX010101000_2026-01-31_EDS-0745_EXO_JSON.zip (ejemplo)',
      nombreInterno: null, entradas: 0, bom: false, ejemplo: true
    }
  }
}
