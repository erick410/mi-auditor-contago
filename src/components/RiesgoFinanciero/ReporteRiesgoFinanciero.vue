<template>
  <div class="rrf-panel">
    <!-- Motor de datos del Reporte Financiero completo: se usa oculto, solo
         para reutilizar (sin modificar) su fetching y su generarPdfReporteGeneral.
         mesI=1/mesF=12 = año completo del ejercicio más reciente cerrado. -->
    <ReporteGeneralPreview
      ref="reporteGeneralOculto"
      v-show="false"
      :anio="periodoAnio"
      :mesI="periodoMesI"
      :mesF="periodoMesF"
    />

    <!-- ── HEADER ──────────────────────────────────────────────── -->
    <div class="rrf-header">
      <div class="rrf-header-info">
        <q-avatar size="42px" class="rrf-header-icon">
          <q-icon name="mdi-shield-alert-outline" size="22px" />
        </q-avatar>
        <div>
          <div class="rrf-title">Reporte de Riesgo Financiero</div>
          <div class="rrf-subtitle">
            RFC {{ rfc }} · Constancia, Opinión, Declaración Anual y Declaraciones
          </div>
        </div>
      </div>

      <div class="rrf-header-actions">
        <q-select
          dense outlined emit-value map-options
          v-model="periodoAnio"
          :options="opcionesAnios"
          label="Año del reporte"
          class="rrf-select-periodo"
        />
        <q-select
          dense outlined emit-value map-options
          v-model="periodoMesI"
          :options="opcionesMeses"
          label="Mes inicial"
          class="rrf-select-periodo"
        />
        <q-select
          dense outlined emit-value map-options
          v-model="periodoMesF"
          :options="opcionesMeses"
          label="Mes final"
          class="rrf-select-periodo"
        />
        <!-- <q-select
          dense outlined multiple emit-value map-options
          v-model="aniosDeclaraciones"
          :options="opcionesAnios"
          label="Ejercicios (Declaraciones)"
          class="rrf-select-anios"
          @input="verificarTodo"
        />
        <q-select
          dense outlined multiple emit-value map-options
          v-model="aniosAnual"
          :options="opcionesAnios"
          label="Ejercicios (Anual)"
          class="rrf-select-anios"
          @input="verificarTodo"
        /> -->
        <q-btn dense unelevated outline color="primary" icon="mdi-refresh" label="Verificar"
          :loading="cargandoEstatus" @click="verificarTodo" />
        <q-btn dense unelevated color="primary" icon="mdi-cloud-download-outline" label="Solicitar faltantes"
          :disable="!hayFaltantes || solicitandoTodo" :loading="solicitandoTodo" @click="solicitarFaltantes" />
      </div>
    </div>

    <!-- ── PROGRESO ────────────────────────────────────────────── -->
    <div class="rrf-progreso">
      <q-linear-progress rounded size="10px" :value="progreso" color="primary" track-color="grey-3" />
      <span class="rrf-progreso-texto">{{ totalCompletados }} de {{ totalDocumentos }} documentos listos</span>
    </div>

    <!-- ── DOCUMENTOS GENERALES (no dependen del ejercicio) ───────── -->
    <div class="rrf-seccion">
      <div class="rrf-seccion-titulo">Documentos generales</div>
      <div class="rrf-grid">
        <div class="rrf-card" :class="claseCard(constancia.estado)">
          <div class="rrf-card-top">
            <q-icon name="mdi-card-account-details-outline" size="20px" />
            <span class="rrf-card-nombre">Constancia de Situación Fiscal</span>
          </div>
          <span :class="['rrf-status', claseEstado(constancia.estado)]">{{ etiquetaEstado(constancia.estado) }}</span>
          <div class="rrf-card-fecha" v-if="constancia.fecha">{{ fd(constancia.fecha) }}</div>
          <q-btn v-if="constancia.estado !== 'COMPLETADO'" dense flat size="sm" color="primary" label="Solicitar"
            :loading="constancia.cargando" :disable="constancia.estado === 'EN_PROCESO'" @click="solicitarConstancia" />
        </div>

        <div class="rrf-card" :class="claseCard(opinion.estado)">
          <div class="rrf-card-top">
            <q-icon name="mdi-file-check-outline" size="20px" />
            <span class="rrf-card-nombre">Opinión de Cumplimiento (32D)</span>
          </div>
          <span :class="['rrf-status', claseEstado(opinion.estado)]">{{ etiquetaEstado(opinion.estado) }}</span>
          <span v-if="opinion.sentido" :class="['rrf-pill', opinion.sentido === 'POSITIVO' ? 'rrf-pill--blue' : 'rrf-pill--purple']">
            {{ opinion.sentido }}
          </span>
          <div class="rrf-card-fecha" v-if="opinion.fecha">{{ fd(opinion.fecha) }}</div>
          <q-btn v-if="opinion.estado !== 'COMPLETADO'" dense flat size="sm" color="primary" label="Solicitar"
            :loading="opinion.cargando" :disable="opinion.estado === 'EN_PROCESO'" @click="solicitarOpinion" />
        </div>

        <div class="rrf-card" :class="claseCard(estadoRazonesFinancieras)">
          <div class="rrf-card-top">
            <q-icon name="mdi-chart-bell-curve" size="20px" />
            <span class="rrf-card-nombre">Razones Financieras</span>
          </div>
          <span :class="['rrf-status', claseEstado(estadoRazonesFinancieras)]">{{ etiquetaEstado(estadoRazonesFinancieras) }}</span>
          <div class="rrf-card-fecha" v-if="estadoRazonesFinancieras !== 'COMPLETADO'">
            Requiere la Declaración Anual de {{ aniosAnual.join(' y ') }}
          </div>
        </div>
      </div>
    </div>

    <!-- ── DOCUMENTOS POR EJERCICIO ────────────────────────────────── -->
    <div class="rrf-seccion" v-for="anio in aniosUnion" :key="anio">
      <div class="rrf-seccion-titulo">Ejercicio {{ anio }}</div>
      <div class="rrf-grid">
        <div class="rrf-card" v-if="aniosAnual.includes(anio)" :class="claseCard(estadoAnual(anio))">
          <div class="rrf-card-top">
            <q-icon name="mdi-file-document-multiple-outline" size="20px" />
            <span class="rrf-card-nombre">Declaración Anual</span>
          </div>
          <span :class="['rrf-status', claseEstado(estadoAnual(anio))]">{{ etiquetaEstado(estadoAnual(anio)) }}</span>
          <div class="rrf-card-fecha" v-if="anual[anio] && anual[anio].fecha">{{ fd(anual[anio].fecha) }}</div>
          <q-btn v-if="estadoAnual(anio) !== 'COMPLETADO'" dense flat size="sm" color="primary" label="Solicitar"
            :loading="anual[anio] && anual[anio].cargando" :disable="estadoAnual(anio) === 'EN_PROCESO'"
            @click="solicitarAnual(anio)" />
        </div>

        <div class="rrf-card" v-if="aniosDeclaraciones.includes(anio)" :class="claseCard(estadoDeclaraciones(anio))">
          <div class="rrf-card-top">
            <q-icon name="mdi-cash-multiple" size="20px" />
            <span class="rrf-card-nombre">Declaraciones de pagos (datos)</span>
          </div>
          <span :class="['rrf-status', claseEstado(estadoDeclaraciones(anio))]">{{ etiquetaEstado(estadoDeclaraciones(anio)) }}</span>
          <div class="rrf-card-fecha" v-if="declaraciones[anio] && declaraciones[anio].fecha">{{ fd(declaraciones[anio].fecha) }}</div>
          <q-btn v-if="estadoDeclaraciones(anio) !== 'COMPLETADO'" dense flat size="sm" color="primary" label="Solicitar"
            :loading="declaraciones[anio] && declaraciones[anio].cargando"
            @click="solicitarDeclaraciones(anio)" />
        </div>

        <div class="rrf-card" v-if="aniosDeclaraciones.includes(anio)" :class="claseCard(estadoComprobantes(anio, 'Emitido'))">
          <div class="rrf-card-top">
            <q-icon name="mdi-file-document-outline" size="20px" />
            <span class="rrf-card-nombre">Comprobantes Emitidos</span>
          </div>
          <span :class="['rrf-status', claseEstado(estadoComprobantes(anio, 'Emitido'))]">{{ etiquetaEstado(estadoComprobantes(anio, 'Emitido')) }}</span>
          <div class="rrf-card-fecha" v-if="comprobantesEmitidos[anio]">{{ comprobantesEmitidos[anio].total }} comprobantes en el año</div>
          <q-btn v-if="estadoComprobantes(anio, 'Emitido') === 'PENDIENTE'" dense flat size="sm" color="primary" label="Solicitar al SAT"
            :loading="comprobantesEmitidos[anio] && comprobantesEmitidos[anio].cargando"
            @click="solicitarComprobantes(anio, 'Emitido')" />
        </div>

        <div class="rrf-card" v-if="aniosDeclaraciones.includes(anio)" :class="claseCard(estadoComprobantes(anio, 'Recibido'))">
          <div class="rrf-card-top">
            <q-icon name="mdi-file-document-outline" size="20px" />
            <span class="rrf-card-nombre">Comprobantes Recibidos</span>
          </div>
          <span :class="['rrf-status', claseEstado(estadoComprobantes(anio, 'Recibido'))]">{{ etiquetaEstado(estadoComprobantes(anio, 'Recibido')) }}</span>
          <div class="rrf-card-fecha" v-if="comprobantesRecibidos[anio]">{{ comprobantesRecibidos[anio].total }} comprobantes en el año</div>
          <q-btn v-if="estadoComprobantes(anio, 'Recibido') === 'PENDIENTE'" dense flat size="sm" color="primary" label="Solicitar al SAT"
            :loading="comprobantesRecibidos[anio] && comprobantesRecibidos[anio].cargando"
            @click="solicitarComprobantes(anio, 'Recibido')" />
        </div>
      </div>
    </div>

    <!-- ── AVISO DE POLLING ─────────────────────────────────────── -->
    <div v-if="hayEnProceso" class="rrf-alert">
      <q-spinner-dots color="primary" size="1.1em" />
      <span>Hay solicitudes en proceso — el estatus se actualiza automáticamente cada 2 minutos.</span>
    </div>

    <!-- ── GENERAR REPORTE FINAL ───────────────────────────────────── -->
    <div class="rrf-footer">
      <q-btn unelevated color="deep-orange" icon="mdi-file-pdf-box" label="Generar Reporte de Riesgo Financiero"
        :disable="!puedeGenerarReporte" :loading="generandoReporte" @click="generarReporteFinal" />
      <span class="rrf-footer-nota" v-if="!puedeGenerarReporte">
        Solicita al menos un documento antes de generar el reporte.
      </span>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import * as XLSX from 'xlsx'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'
import { parseConstanciaSituacionFiscal } from './parseConstanciaSituacionFiscal'

// pdf.js necesita el worker como archivo aparte (no lo puede resolver del
// bundle de webpack). Copia node_modules/pdfjs-dist/legacy/build/pdf.worker.js
// a tu carpeta public/ y déjalo referenciado así:
pdfjsLib.GlobalWorkerOptions.workerSrc = `${process.env.BASE_URL}pdf.worker.js`
import { construirReporteRiesgo, descargarPdfFinal } from './fusionPdfRiesgo'
import { obtenerRazonesFinancieras } from './obtenerRazonesFinancieras'
import { generarPdfReporteGeneral } from './pdfReporteGeneral'
import ReporteGeneralPreview from './ReporteFinanciero.vue'

const BASE_URL_DESCARGA = 'https://descargasat.contago.com.mx/api/Descarga'
const SCRAPER_URL = 'https://satscraper.contago.com.mx'
// TODO: idealmente esta key debería vivir en el backend (proxy), no en el bundle del cliente.
const SCRAPER_API_KEY = 'sk_live_Vqm3D1BiHpSA43mOn7VOVn21UaTSFKuhupp3UpbnpM4'

export default {
  name: 'ReporteRiesgoFinancieroPage',
  components: { ReporteGeneralPreview },
  data () {
    const anioActual = new Date().getFullYear()
    return {
      opcionesAnios: Array.from({ length: 6 }, (_, i) => String(anioActual - i)),
      opcionesMeses: [
        { label: 'Enero', value: 1 },
        { label: 'Febrero', value: 2 },
        { label: 'Marzo', value: 3 },
        { label: 'Abril', value: 4 },
        { label: 'Mayo', value: 5 },
        { label: 'Junio', value: 6 },
        { label: 'Julio', value: 7 },
        { label: 'Agosto', value: 8 },
        { label: 'Septiembre', value: 9 },
        { label: 'Octubre', value: 10 },
        { label: 'Noviembre', value: 11 },
        { label: 'Diciembre', value: 12 }
      ],
      // Periodo del Reporte Financiero (IVA, ISR, Comprobantes, CxC/CxP, Flujo...).
      // Por defecto el periodo actual: del 1 de enero al mes en curso del año en curso.
      periodoAnio: String(anioActual),
      periodoMesI: 1,
      periodoMesF: new Date().getMonth() + 1,
      // Declaraciones (pagos): ejercicio actual + anterior
      aniosDeclaraciones: [String(anioActual), String(anioActual - 1)],
      // Declaración Anual: se presenta hasta el año siguiente, así que por defecto
      // se piden los dos ejercicios ya cerrados (sin el actual)
      aniosAnual: [String(anioActual - 1), String(anioActual - 2)],

      cargandoEstatus: false,
      solicitandoTodo: false,
      generandoReporte: false,
      pollingTimer: null,

      historialGeneral: [],

      constancia: { estado: 'PENDIENTE', id: null, fecha: null, cargando: false },
      opinion: { estado: 'PENDIENTE', id: null, fecha: null, sentido: null, cargando: false },
      anual: {}, // { '2025': { estado, id, fecha, cargando } }
      declaraciones: {}, // { '2025': { estado, fecha, cargando } }
      comprobantesEmitidos: {}, // { '2025': { total, estado, cargando } }
      comprobantesRecibidos: {} // { '2025': { total, estado, cargando } }
    }
  },
  computed: {
    token () { return this.$store.state.usuario },
    rfc () { return this.token ? this.token.rfc : '' },
    rutaMongo () { return this.$store.state.rutaMongoStore },
    rutaDescargas () { return this.$store.state.rutaDescargas },
    empresaNombre () { return (this.$store.state.empresaStore && this.$store.state.empresaStore.nombre) || '' },
    anioReporte () { return Math.max(...this.aniosAnual.map(Number)) },

    // Unión de años a mostrar como secciones (Anual y Declaraciones pueden diferir)
    aniosUnion () {
      const set = new Set([...this.aniosAnual, ...this.aniosDeclaraciones])
      return [...set].sort((a, b) => Number(b) - Number(a))
    },
    // Razones Financieras no se "solicita": está disponible en cuanto las
    // dos Declaraciones Anuales (aniosAnual) ya se descargaron.
    estadoRazonesFinancieras () {
      const completos = this.aniosAnual.every((a) => this.estadoAnual(a) === 'COMPLETADO')
      return completos ? 'COMPLETADO' : 'PENDIENTE'
    },
    totalDocumentos () {
      return 3 + this.aniosAnual.length + this.aniosDeclaraciones.length
    },
    totalCompletados () {
      let total = 0
      if (this.constancia.estado === 'COMPLETADO') total++
      if (this.opinion.estado === 'COMPLETADO') total++
      if (this.estadoRazonesFinancieras === 'COMPLETADO') total++
      this.aniosAnual.forEach((a) => { if (this.estadoAnual(a) === 'COMPLETADO') total++ })
      this.aniosDeclaraciones.forEach((a) => { if (this.estadoDeclaraciones(a) === 'COMPLETADO') total++ })
      return total
    },
    progreso () {
      return this.totalDocumentos ? this.totalCompletados / this.totalDocumentos : 0
    },
    puedeGenerarReporte () {
      return this.totalCompletados > 0
    },
    hayFaltantes () {
      return this.totalCompletados < this.totalDocumentos
    },
    hayEnProceso () {
      if (this.constancia.estado === 'EN_PROCESO') return true
      if (this.opinion.estado === 'EN_PROCESO') return true
      return this.aniosAnual.some((a) => this.estadoAnual(a) === 'EN_PROCESO')
    }
  },
  methods: {
    // ── Lectura de estatus ──────────────────────────────────────────────

    estadoAnual (anio) {
      return (this.anual[anio] && this.anual[anio].estado) || 'PENDIENTE'
    },
    estadoDeclaraciones (anio) {
      return (this.declaraciones[anio] && this.declaraciones[anio].estado) || 'PENDIENTE'
    },
    estadoComprobantes (anio, tipo) {
      const store = tipo === 'Emitido' ? this.comprobantesEmitidos : this.comprobantesRecibidos
      return (store[anio] && store[anio].estado) || 'PENDIENTE'
    },

    async verificarTodo () {
      this.cargandoEstatus = true
      try {
        await this.consultarHistorialGeneral()
        this.actualizarConstancia()
        this.actualizarOpinion()
        this.aniosAnual.forEach((a) => this.actualizarAnual(a))
        await this.actualizarDeclaracionesTodas()
        await this.actualizarComprobantesTodas()

        if (this.hayEnProceso) {
          this.iniciarPolling()
        } else {
          this.detenerPolling()
        }
      } finally {
        this.cargandoEstatus = false
      }
    },

    async consultarHistorialGeneral () {
      try {
        const { data } = await axios.get(`${BASE_URL_DESCARGA}/Historial/${this.rfc}`)
        this.historialGeneral = data.exito ? data.registros : []
      } catch (e) {
        this.historialGeneral = []
        this.$q.notify({ type: 'negative', message: 'Error al consultar el historial de descargas' })
      }
    },

    _ultimoRegistro (lista) {
      return [...lista].sort((a, b) => new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud))[0] || null
    },

    actualizarConstancia () {
      const registros = this.historialGeneral.filter((r) => r.tipoDocumento === 'constancia')
      const ultimo = this._ultimoRegistro(registros)
      this.constancia = {
        estado: ultimo ? ultimo.estado : 'PENDIENTE',
        id: ultimo ? ultimo.id : null,
        fecha: ultimo ? ultimo.fechaSolicitud : null,
        cargando: false
      }
    },

    actualizarOpinion () {
      const registros = this.historialGeneral.filter((r) => r.tipoDocumento === 'opinion32d')
      const ultimo = this._ultimoRegistro(registros)
      this.opinion = {
        estado: ultimo ? ultimo.estado : 'PENDIENTE',
        id: ultimo ? ultimo.id : null,
        fecha: ultimo ? ultimo.fechaSolicitud : null,
        sentido: ultimo ? ultimo.sentido : null,
        cargando: false
      }
    },

    actualizarAnual (anio) {
      const registros = this.historialGeneral.filter(
        (r) => r.tipoDocumento === 'anual_todas' && String(r.ejercicio) === String(anio)
      )
      const ultimo = this._ultimoRegistro(registros)
      this.$set(this.anual, anio, {
        estado: ultimo ? ultimo.estado : 'PENDIENTE',
        id: ultimo ? ultimo.id : null,
        fecha: ultimo ? ultimo.fechaSolicitud : null,
        cargando: (this.anual[anio] && this.anual[anio].cargando) || false
      })
    },

    async actualizarDeclaracionesTodas () {
      await Promise.all(this.aniosDeclaraciones.map((a) => this.actualizarDeclaraciones(a)))
    },

    async actualizarDeclaraciones (anio) {
      const cargandoPrevio = (this.declaraciones[anio] && this.declaraciones[anio].cargando) || false

      let datosDisponibles = false
      let info = null
      try {
        const { data } = await axios.get(
          `${this.rutaMongo}ScraperDescargasPagos/GetDescarpaScraper/${this.rfc}/${anio}/TODOS`
        )
        datosDisponibles = !!(data && data._id)
        info = data
      } catch (e) {
        // sin datos consultados todavía
      }

      this.$set(this.declaraciones, anio, {
        estado: datosDisponibles ? 'COMPLETADO' : 'PENDIENTE',
        fecha: datosDisponibles ? info.fecha : null,
        cargando: cargandoPrevio
      })
    },

    // ── Comprobantes (Emitidos / Recibidos) ─────────────────────────────

    async actualizarComprobantesTodas () {
      const tareas = []
      this.aniosDeclaraciones.forEach((anio) => {
        tareas.push(this.actualizarComprobantes(anio, 'Emitido'))
        tareas.push(this.actualizarComprobantes(anio, 'Recibido'))
      })
      await Promise.all(tareas)
    },

    async actualizarComprobantes (anio, tipo) {
      const store = tipo === 'Emitido' ? this.comprobantesEmitidos : this.comprobantesRecibidos
      const cargandoPrevio = (store[anio] && store[anio].cargando) || false
      const estadoPrevio = (store[anio] && store[anio].estado) || 'PENDIENTE'
      const endpoint = tipo === 'Emitido'
        ? `${this.rutaMongo}Comprobante/GetCuentaComprobantesAsync/erp_${this.rfc}/${anio}`
        : `${this.rutaMongo}Comprobante/GetCuentaComprobantesRecibidosAsync/erp_${this.rfc}/${anio}`

      let total = 0
      try {
        const { data } = await axios.get(endpoint)
        total = (data || []).reduce(
          (s, r) => s + (r.ingreso || 0) + (r.notasCredito || 0) + (r.complementoPago || 0) + (r.nomina || 0),
          0
        )
      } catch (e) {
        total = 0
      }

      const nuevoEstado = total > 0 ? 'COMPLETADO' : (estadoPrevio === 'SOLICITADA' ? 'SOLICITADA' : 'PENDIENTE')
      const registro = { total, estado: nuevoEstado, cargando: cargandoPrevio }
      if (tipo === 'Emitido') this.$set(this.comprobantesEmitidos, anio, registro)
      else this.$set(this.comprobantesRecibidos, anio, registro)
    },

    async solicitarComprobantes (anio, tipo) {
      const store = tipo === 'Emitido' ? this.comprobantesEmitidos : this.comprobantesRecibidos
      if (!store[anio]) this.$set(store, anio, { total: 0, estado: 'PENDIENTE', cargando: false })
      store[anio].cargando = true
      try {
        const anioActual = new Date().getFullYear()
        const esAnioActual = String(anio) === String(anioActual)
        const hoy = new Date().toISOString().slice(0, 10)
        const payload = {
          tipo,
          fechaInicial: `${anio}-01-01 00:00:00`,
          fechaFinal: esAnioActual ? `${hoy} 23:59:59` : `${anio}-12-31 23:59:59`,
          RfcReceptor: this.rfc,
          RfcEmisor: this.rfc,
          RfcSolicitante: this.rfc,
          TipoSolicitud: 'CFDI',
          usuario: this.token ? this.token.nombre : '',
          TipoComprobante: { tipo: 'Todos', value: '' },
          EstadoComprobante: { estatus: 'Todos', value: 'Todos' }
        }
        await axios.post(`${this.rutaDescargas}Descargas/PostSolicitud/erp_${this.rfc}`, payload)
        store[anio].estado = 'SOLICITADA'
        this.$q.notify({
          type: 'positive',
          message: `Solicitud de comprobantes ${tipo === 'Emitido' ? 'emitidos' : 'recibidos'} ${anio} enviada al SAT. Da seguimiento en Descargas CFDI.`
        })
      } catch (e) {
        this.$q.notify({ type: 'negative', message: (e.response && e.response.data) || `Error al solicitar comprobantes ${tipo} ${anio}.` })
      } finally {
        store[anio].cargando = false
      }
    },

    // ── FIEL ──────────────────────────────────────────────────────────────

    obtenerFielVigente () {
      const fiel = (this.$store.state.listaArchivosVigenciaStore || []).find((x) => x.tipo === 'FIEL')
      if (!fiel || !fiel.password) {
        this.$q.notify({
          type: 'warning',
          icon: 'mdi-alert-circle-outline',
          message: 'No se encontró una FIEL vigente. Sube tu FIEL antes de solicitar la descarga.'
        })
        return null
      }
      return fiel
    },

    // ── Solicitudes individuales ────────────────────────────────────────

    async solicitarConstancia () {
      const fiel = this.obtenerFielVigente()
      if (!fiel) return
      this.constancia.cargando = true
      try {
        const { data } = await axios.post(`${BASE_URL_DESCARGA}/DescargarConstancia`, {
          rfc: this.rfc, password: fiel.password
        })
        if (data.exito) {
          this.constancia.estado = 'EN_PROCESO'
          this.$q.notify({ type: 'positive', message: data.mensaje || 'Solicitud enviada' })
          this.iniciarPolling()
        } else {
          this.$q.notify({ type: 'negative', message: data.mensaje || 'No se pudo procesar la solicitud' })
        }
      } catch (e) {
        this.$q.notify({ type: 'negative', message: (e.response && e.response.data && e.response.data.mensaje) || 'Error al solicitar la Constancia.' })
      } finally {
        this.constancia.cargando = false
      }
    },

    async solicitarOpinion () {
      const fiel = this.obtenerFielVigente()
      if (!fiel) return
      this.opinion.cargando = true
      try {
        const { data } = await axios.post(`${BASE_URL_DESCARGA}/DescargarOpinion`, {
          rfc: this.rfc, password: fiel.password
        })
        if (data.exito) {
          this.opinion.estado = 'EN_PROCESO'
          this.$q.notify({ type: 'positive', message: data.mensaje || 'Solicitud enviada' })
          this.iniciarPolling()
        } else {
          this.$q.notify({ type: 'negative', message: data.mensaje || 'No se pudo procesar la solicitud' })
        }
      } catch (e) {
        this.$q.notify({ type: 'negative', message: (e.response && e.response.data && e.response.data.mensaje) || 'Error al solicitar la Opinión.' })
      } finally {
        this.opinion.cargando = false
      }
    },

    async solicitarAnual (anio, formato = 'ambos') {
      const fiel = this.obtenerFielVigente()
      if (!fiel) return
      if (!this.anual[anio]) this.$set(this.anual, anio, { estado: 'PENDIENTE', id: null, fecha: null, cargando: false })
      this.anual[anio].cargando = true
      try {
        const { data } = await axios.post(`${BASE_URL_DESCARGA}/DescargarAnualTodas`, {
          rfc: this.rfc, password: fiel.password, ejercicio: anio, formato
        })
        if (data.exito) {
          this.anual[anio].estado = 'EN_PROCESO'
          this.$q.notify({ type: 'positive', message: data.mensaje || 'Solicitud enviada' })
          this.iniciarPolling()
        } else {
          this.$q.notify({ type: 'negative', message: data.mensaje || 'No se pudo procesar la solicitud' })
        }
      } catch (e) {
        this.$q.notify({ type: 'negative', message: (e.response && e.response.data && e.response.data.mensaje) || `Error al solicitar la Declaración Anual ${anio}.` })
      } finally {
        this.anual[anio].cargando = false
      }
    },

    async solicitarDeclaraciones (anio) {
      if (!this.declaraciones[anio]) this.$set(this.declaraciones, anio, { estado: 'PENDIENTE', fecha: null, cargando: false })
      this.declaraciones[anio].cargando = true
      try {
        // Consulta al SAT y guarda el JSON (sin generar el ZIP de PDFs mensuales)
        const { data } = await axios.post(
          `${SCRAPER_URL}/sat/consultar-datos`,
          new URLSearchParams({ rfc: this.rfc, anio: String(anio), meses: 'TODOS' }),
          { headers: { 'X-API-KEY': SCRAPER_API_KEY, 'Content-Type': 'application/x-www-form-urlencoded' } }
        )
        await axios.post(`${this.rutaMongo}ScraperDescargasPagos/PostDescargaScraper/${this.rfc}`, {
          _id: '',
          periodo: 'TODOS',
          anio: String(anio),
          respuesta: JSON.stringify(data, null, 2),
          log_id: data.log_id,
          estatus: 'Vigente',
          fecha: new Date().toISOString().slice(0, 10)
        })
        this.$q.notify({ type: 'positive', message: `Datos de Declaraciones ${anio} guardados` })
      } catch (e) {
        this.$q.notify({ type: 'negative', message: e.message || `Error al consultar las Declaraciones ${anio}.` })
      } finally {
        this.declaraciones[anio].cargando = false
        await this.actualizarDeclaraciones(anio)
      }
    },

    // ── Solicitar todo lo que falte ──────────────────────────────────────

    async solicitarFaltantes () {
      this.solicitandoTodo = true
      try {
        const tareas = []
        if (this.constancia.estado !== 'COMPLETADO' && this.constancia.estado !== 'EN_PROCESO') tareas.push(this.solicitarConstancia())
        if (this.opinion.estado !== 'COMPLETADO' && this.opinion.estado !== 'EN_PROCESO') tareas.push(this.solicitarOpinion())

        this.aniosAnual.forEach((anio) => {
          if (this.estadoAnual(anio) !== 'COMPLETADO' && this.estadoAnual(anio) !== 'EN_PROCESO') {
            tareas.push(this.solicitarAnual(anio))
          }
        })
        this.aniosDeclaraciones.forEach((anio) => {
          if (this.estadoDeclaraciones(anio) !== 'COMPLETADO' && this.estadoDeclaraciones(anio) !== 'EN_PROCESO') {
            tareas.push(this.solicitarDeclaraciones(anio))
          }
        })

        await Promise.allSettled(tareas)
      } finally {
        this.solicitandoTodo = false
      }
    },

    // ── Polling ───────────────────────────────────────────────────────────

    iniciarPolling () {
      this.detenerPolling()
      this.pollingTimer = setInterval(() => {
        if (this.hayEnProceso) {
          this.verificarTodo()
        } else {
          this.detenerPolling()
        }
      }, 120000) // 2 minutos
    },
    detenerPolling () {
      if (this.pollingTimer) {
        clearInterval(this.pollingTimer)
        this.pollingTimer = null
      }
    },

    // ── Generar el reporte fusionado ─────────────────────────────────────

    async generarReporteFinal () {
      this.generandoReporte = true
      try {
        const anio = this.periodoAnio

        // 1) Asegurar estatus fresco de comprobantes para el año del reporte
        await Promise.all([
          this.actualizarComprobantes(anio, 'Emitido'),
          this.actualizarComprobantes(anio, 'Recibido')
        ])
        const hayComprobantes =
          this.estadoComprobantes(anio, 'Emitido') === 'COMPLETADO' ||
          this.estadoComprobantes(anio, 'Recibido') === 'COMPLETADO'

        const motor = this.$refs.reporteGeneralOculto
        if (!motor) throw new Error('No se pudo inicializar el motor del Reporte Financiero.')
        if (!motor.mostrarSecciones) {
          console.error('DEBUG motor:', motor)
          console.error('DEBUG motor.$options.name:', motor.$options && motor.$options.name)
          throw new Error('El motor del Reporte Financiero (ReporteFinanciero.vue) no tiene "mostrarSecciones" en su data(). Revisa la consola para más detalle.')
        }

        // 2) Gating: todo lo que depende de comprobantes se excluye si no hay
        const seccionesComprobantes = [
          'emitidos', 'recibidos', 'nomina', 'cxc', 'cxp', 'flujo',
          'pagosIva', 'pagosIsr', 'pagosProvisionales', 'usoCfdi', 'comparativaAnual'
        ]
        seccionesComprobantes.forEach((clave) => { motor.mostrarSecciones[clave] = hayComprobantes })
        motor.mostrarSecciones.razonesFinancieras = true // no depende de comprobantes

        // 3) Corre el fetch normal del reporte financiero (sin tocar su código)
        await motor.generarReporte()

        // 4) Sustituye las Razones Financieras por las de los DOS ejercicios
        //    (aniosAnual) en vez de la de un solo año que calcula internamente
        const razonesDosAnios = await obtenerRazonesFinancieras(this.rfc, this.anioReporte, XLSX)
        motor.razonesFinancieras = razonesDosAnios

        // 5) Genera el PDF completo (portada+índice+secciones) con la función
        //    ya parcheada para aceptar los dos ejercicios de Razones Financieras
        // Se fusiona con datos que ya trae el panel pero que el motor
        // (ReporteFinanciero.vue) no conoce: el sentido de la Opinión de
        // Cumplimiento, y el Domicilio Fiscal + Actividades Económicas
        // parseados directamente del PDF de la Constancia.
        let bytesConstancia = null
        let domicilioFiscal = null
        let actividadesEconomicas = []
        if (this.constancia.estado === 'COMPLETADO') {
          try {
            bytesConstancia = await this._cargarArchivoDirecto(this.constancia.id)
            console.log('DEBUG workerSrc en uso:', pdfjsLib.GlobalWorkerOptions.workerSrc)
            const resultado = await parseConstanciaSituacionFiscal(bytesConstancia, pdfjsLib)
            domicilioFiscal = resultado.domicilioFiscal
            actividadesEconomicas = resultado.actividadesEconomicas
          } catch (e) {
            console.error('No se pudo parsear la Constancia de Situación Fiscal:', e)
          }
        }

        const datosParaPdf = {
          ...motor.datosParaPdf,
          domicilioFiscal,
          actividadesEconomicas,
          constancia: { disponible: this.constancia.estado === 'COMPLETADO' },
          opinionCumplimiento: this.opinion.estado === 'COMPLETADO' && this.opinion.sentido
            ? { sentido: this.opinion.sentido, fecha: this.opinion.fecha }
            : null
        }
        const docReporteGeneral = generarPdfReporteGeneral(datosParaPdf, {
          empresa: this.empresaNombre,
          rfc: this.rfc,
          descargarAutomaticamente: false
        })
        const bytesReporteGeneral = docReporteGeneral.output('arraybuffer')

        // 6) Anexa Constancia y Opinión (tal cual, sin reescribirlos) al final
        //    del Reporte Financiero completo
        const fuentes = [{ etiqueta: 'Reporte Financiero', cargar: async () => bytesReporteGeneral }]

        if (this.constancia.estado === 'COMPLETADO') {
          fuentes.push({
            etiqueta: 'Constancia de Situación Fiscal',
            cargar: () => bytesConstancia || this._cargarArchivoDirecto(this.constancia.id)
          })
        }
        if (this.opinion.estado === 'COMPLETADO') {
          fuentes.push({
            etiqueta: 'Opinión de Cumplimiento',
            cargar: () => this._cargarArchivoDirecto(this.opinion.id)
          })
        }

        const bytesFinales = await construirReporteRiesgo(fuentes)
        const nombreArchivo = `Reporte de Riesgo Financiero - ${this.rfc} - ${new Date().toISOString().slice(0, 10)}.pdf`
        descargarPdfFinal(bytesFinales, nombreArchivo)
      } catch (e) {
        console.error(e)
        this.$q.notify({ type: 'negative', message: e.message || 'Error al generar el Reporte de Riesgo Financiero.' })
      } finally {
        this.generandoReporte = false
      }
    },

    async _cargarArchivoDirecto (id) {
      const { data } = await axios.get(`${BASE_URL_DESCARGA}/Archivo/${this.rfc}/${id}`, { responseType: 'arraybuffer' })
      return data
    },

    // ── UI helpers ────────────────────────────────────────────────────────

    claseCard (estado) {
      if (estado === 'EN_PROCESO' || estado === 'SOLICITADA') return 'rrf-card--proceso'
      if (estado === 'COMPLETADO') return 'rrf-card--listo'
      if (estado === 'FALLIDO') return 'rrf-card--error'
      return ''
    },
    claseEstado (estado) {
      if (estado === 'EN_PROCESO' || estado === 'SOLICITADA') return 'rrf-status--proceso'
      if (estado === 'COMPLETADO') return 'rrf-status--listo'
      if (estado === 'FALLIDO') return 'rrf-status--error'
      return 'rrf-status--pendiente'
    },
    etiquetaEstado (estado) {
      const mapa = {
        PENDIENTE: 'Pendiente',
        EN_PROCESO: 'En proceso',
        SOLICITADA: 'Solicitud enviada',
        COMPLETADO: 'Disponible',
        FALLIDO: 'Fallido'
      }
      return mapa[estado] || estado
    },
    fd (v) {
      if (!v) return '—'
      const d = new Date(v)
      return d.toLocaleString('es-MX', {
        day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit'
      })
    }
  },
  async mounted () {
    await this.verificarTodo()
  },
  beforeDestroy () {
    this.detenerPolling()
  }
}
</script>

<style scoped>
.rrf-panel {
  width: 100%;
  box-sizing: border-box;
  background: #f4f6fb;
  min-height: calc(100vh - 68px);
  padding-bottom: 24px;
}

.rrf-header {
  background: #fff;
  border-bottom: 1px solid #e2e6f0;
  padding: 16px 20px 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: flex-end;
  justify-content: space-between;
}

.rrf-header-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rrf-header-icon {
  background: rgba(216, 67, 21, 0.12);
  color: #d84315;
}

.rrf-title {
  font-size: 1rem;
  font-weight: 700;
  color: #0f1623;
}

.rrf-subtitle {
  font-size: 0.76rem;
  color: #7b86a0;
  font-weight: 500;
}

.rrf-header-actions {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}

.rrf-select-anios {
  min-width: 170px;
}

.rrf-select-periodo {
  min-width: 130px;
}

.rrf-progreso {
  padding: 14px 20px 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rrf-progreso-texto {
  font-size: 0.75rem;
  color: #7b86a0;
  font-weight: 600;
}

.rrf-seccion {
  padding: 16px 20px 0;
}

.rrf-seccion-titulo {
  font-size: 0.8rem;
  font-weight: 700;
  color: #0f1623;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 8px;
}

.rrf-grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}

.rrf-card {
  background: #fff;
  border: 1px solid #e2e6f0;
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rrf-card--proceso {
  border-color: #90a4ffb0;
  background: #f5f6ff;
}

.rrf-card--listo {
  border-color: #a5d6c0;
  background: #f0fdf4;
}

.rrf-card--error {
  border-color: #f3b6b6;
  background: #fef3f3;
}

.rrf-card-top {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #333;
}

.rrf-card-nombre {
  font-size: 0.82rem;
  font-weight: 600;
  color: #0f1623;
}

.rrf-card-fecha {
  font-size: 0.72rem;
  color: #94a3b8;
}

.rrf-status {
  align-self: flex-start;
  display: inline-block;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.2px;
}

.rrf-status--pendiente {
  background: #f1f5f9;
  color: #475569;
}

.rrf-status--proceso {
  background: #dbeafe;
  color: #1e40af;
}

.rrf-status--listo {
  background: #d1fae5;
  color: #065f46;
}

.rrf-status--error {
  background: #fee2e2;
  color: #991b1b;
}

.rrf-pill {
  align-self: flex-start;
  display: inline-block;
  border-radius: 4px;
  padding: 1px 8px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.rrf-pill--blue {
  background: #e8edff;
  color: #3d5afe;
}

.rrf-pill--purple {
  background: #f3e8ff;
  color: #7c3aed;
}

.rrf-alert {
  margin: 16px 20px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  background: #eef0ff;
  color: #3d5afe;
  font-size: 0.78rem;
  font-weight: 500;
}

.rrf-footer {
  margin: 20px 20px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.rrf-footer-nota {
  font-size: 0.76rem;
  color: #94a3b8;
}
</style>