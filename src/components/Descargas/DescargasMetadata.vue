<template>
  <div class="dsc-panel">

    <!-- ── FILTROS ─────────────────────────────────────────────── -->
    <div class="dsc-filters">
      <div class="dsc-filters__row">

        <!-- Año -->
        <div class="dsc-field dsc-field--sm">
          <div class="dsc-field__label">Año</div>
          <q-select dense outlined v-model="anio" :options="catAnios" class="dsc-input"
            @input="onAnioMesChange" />
        </div>

        <!-- Mes -->
        <div class="dsc-field">
          <div class="dsc-field__label">Mes</div>
          <q-select dense outlined v-model="mes" :options="catMeses" option-label="label"
            class="dsc-input" @input="onAnioMesChange" />
        </div>

        <!-- Tipo -->
        <div class="dsc-field dsc-field--sm">
          <div class="dsc-field__label">Tipo</div>
          <q-select dense outlined v-model="tipo" :options="['Emitido', 'Recibido']"
            class="dsc-input" />
        </div>

        <!-- Resumen del rango seleccionado -->
        <div class="dsc-field dsc-field--range" v-if="rangoTexto">
          <div class="dsc-field__label">Período</div>
          <div class="dsc-range-text">{{ rangoTexto }}</div>
        </div>

        <!-- Botones -->
        <div class="dsc-field dsc-field--btns">
          <q-btn dense unelevated color="primary" icon="mdi-send" label="Solicitar"
            :loading="cargando" :disable="cargando || !mes || !anio"
            class="dsc-btn" @click="solicitar" />
          <q-btn dense unelevated outline color="primary" icon="mdi-refresh" label="Actualizar"
            :loading="cargando" :disable="cargando"
            class="dsc-btn" @click="getHistorial" />
        </div>

      </div>

      <!-- Aviso descarga activa -->
      <div v-if="descargandoId" class="dsc-alert dsc-alert--blue">
        <q-spinner-dots color="primary" size="1.1em" />
        <span>Descarga en progreso — no cierre la ventana ni repita la acción hasta que el
          estatus cambie a <b>Descargado</b>.</span>
      </div>
    </div>

    <!-- ── TABLA ──────────────────────────────────────────────── -->
    <div class="dsc-table-wrap">
      <q-table dense flat bordered
        :data="historial"
        :columns="columns"
        :filter="filter"
        :pagination.sync="pagination"
        :rows-per-page-options="[15, 25, 50]"
        row-key="solicitud"
        class="dsc-table"
      >
        <template v-slot:top>
          <div class="dsc-table__top">
            <span class="dsc-table__title">Historial Metadata</span>
            <q-input dense outlined v-model="filter" placeholder="Buscar…" style="width:200px">
              <template v-slot:prepend><q-icon name="search" size="16px" /></template>
            </q-input>
          </div>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props" :class="rowClass(props.row)">

            <q-td key="fechaSolicitud"  :props="props" class="dsc-td">{{ fd(props.row.fechaSolicitud) }}</q-td>
            <q-td key="tipo"            :props="props" class="dsc-td">
              <span :class="['dsc-pill', props.row.tipo === 'Emitido' ? 'dsc-pill--blue' : 'dsc-pill--purple']">
                {{ props.row.tipo }}
              </span>
            </q-td>
            <q-td key="fechaInicial"    :props="props" class="dsc-td">{{ fd(props.row.fechaInicial) }}</q-td>
            <q-td key="fechaFinal"      :props="props" class="dsc-td">{{ fd(props.row.fechaFinal) }}</q-td>
            <q-td key="numComprobantes" :props="props" class="dsc-td text-center">
              {{ props.row.numComprobantes || '—' }}
            </q-td>
            <q-td key="estatusSolicitud" :props="props" class="dsc-td">
              <!-- Descargando en servidor -->
              <div v-if="props.row.estatusSolicitud === 'Descargando'" class="dsc-downloading">
                <q-spinner-dots size="1em" color="primary" />&nbsp;Descargando en servidor...
              </div>
              <span v-else :class="['dsc-status', statusClass(props.row.estatusSolicitud)]">
                {{ props.row.estatusSolicitud }}
              </span>
            </q-td>

            <!-- ACCIONES -->
            <q-td key="acciones" :props="props" class="dsc-td" auto-width>
              <div class="dsc-actions">

                <!-- Descargando en servidor: spinner bloqueado -->
                <q-btn v-if="props.row.estatusSolicitud === 'Descargando'"
                  dense round flat size="md" color="blue-6"
                  icon="mdi-loading" disable loading>
                  <q-tooltip class="dsc-tip">Descarga en progreso en el servidor...</q-tooltip>
                </q-btn>

                <!-- Listo para descargar -->
                <q-btn v-if="props.row.estatusSolicitud === 'Listo para Descargar'"
                  dense round flat size="md" color="teal" icon="mdi-download"
                  :loading="descargandoId === props.row.solicitud"
                  :disable="descargandoId !== null"
                  @click="descargar(props.row)">
                  <q-tooltip class="dsc-tip">Descargar</q-tooltip>
                </q-btn>

                <!-- Actualizar estatus -->
                <q-btn
                  v-if="props.row.estatusSolicitud === 'Solicitud Realizada' ||
                        props.row.estatusSolicitud.includes('Procesando')"
                  dense round flat size="md"
                  :color="props.row.estatusSolicitud === 'Solicitud Realizada' ? 'orange-8' : 'blue-7'"
                  icon="mdi-update"
                  :disable="!!descargandoId"
                  @click="actualizar(props.row)">
                  <q-tooltip class="dsc-tip">Actualizar estatus</q-tooltip>
                </q-btn>

                <!-- Descargado: grupo de acciones -->
                <template v-if="props.row.estatusSolicitud === 'Descargado'">

                  <!-- Check permanente (re-descarga bloqueada) -->
                  <q-btn dense round flat size="md" color="grey-4" text-color="grey-6"
                    icon="mdi-check-circle" disable>
                    <q-tooltip class="dsc-tip">Ya descargado</q-tooltip>
                  </q-btn>

                  <!-- Extraer .txt -->
                  <q-btn dense round flat size="md" color="orange-6" icon="mdi-monitor-arrow-down"
                    @click="descargaLocal(props.row)">
                    <q-tooltip class="dsc-tip">Ver y Extraer archivo .txt</q-tooltip>
                  </q-btn>

                  <!-- Guardar en conciliación -->
                  <q-btn dense round flat size="md"
                    :color="props.row.conciliacionGuardada ? 'grey-5' : 'teal'"
                    icon="mdi-database-arrow-up"
                    :loading="guardandoId === props.row.solicitud"
                    :disable="props.row.conciliacionGuardada || guardandoId !== null"
                    @click="guardarConciliacion(props.row)">
                    <q-tooltip class="dsc-tip">
                      {{ props.row.conciliacionGuardada ? 'Ya guardado en conciliación' : 'Guardar en conciliación' }}
                    </q-tooltip>
                  </q-btn>

                  <!-- Validar cancelados -->
                  <q-btn dense round flat size="md" color="amber-8" icon="mdi-file-cancel-outline"
                    @click="ValidaCancelados(props.row)">
                    <q-tooltip class="dsc-tip">Validar cancelados</q-tooltip>
                  </q-btn>

                </template>

              </div>
            </q-td>
          </q-tr>
        </template>

        <template v-slot:no-data>
          <div class="dsc-empty">
            <q-icon name="mdi-inbox-outline" size="2.5rem" color="grey-4" />
            <div class="dsc-empty__text">Sin solicitudes registradas</div>
          </div>
        </template>
      </q-table>
    </div>
    <VisorMetadata ref="visor" />
  </div>
</template>

<script>
import axios  from 'axios'
import moment from 'moment'
import { QSpinnerCube } from 'quasar'
import VisorMetadata from './VisorMetadata.vue'
export default {
  name: 'DescargasMetadata',
  components: { VisorMetadata },

  data() {
    const hoy = moment()
    return {
      // Selector de mes
      anio: String(hoy.year()),
      mes:  null,   // se asigna en created()

      tipo: 'Emitido',

      // Rango calculado (lo que se envía al SAT)
      fechaInicial: '',
      fechaFinal:   '',

      catAnios: ['2026','2025','2024','2023','2022','2021','2020','2019','2018'],
      catMeses: [
        { label: 'ENERO',      value: 1  }, { label: 'FEBRERO',    value: 2  },
        { label: 'MARZO',      value: 3  }, { label: 'ABRIL',      value: 4  },
        { label: 'MAYO',       value: 5  }, { label: 'JUNIO',      value: 6  },
        { label: 'JULIO',      value: 7  }, { label: 'AGOSTO',     value: 8  },
        { label: 'SEPTIEMBRE', value: 9  }, { label: 'OCTUBRE',    value: 10 },
        { label: 'NOVIEMBRE',  value: 11 }, { label: 'DICIEMBRE',  value: 12 },
      ],

      cargando:      false,
      descargandoId: null,
      guardandoId:   null,

      filter: '',
      pagination: { sortBy: 'fechaSolicitud', descending: true, rowsPerPage: 15 },
      columns: [
        { name: 'fechaSolicitud',  label: 'Fecha solicitud', field: 'fechaSolicitud',  align: 'left',   sortable: true },
        { name: 'tipo',            label: 'Tipo',            field: 'tipo',            align: 'center', sortable: true },
        { name: 'fechaInicial',    label: 'Desde',           field: 'fechaInicial',    align: 'center', sortable: true },
        { name: 'fechaFinal',      label: 'Hasta',           field: 'fechaFinal',      align: 'center', sortable: true },
        { name: 'numComprobantes', label: 'CFDIs',           field: 'numComprobantes', align: 'center', sortable: true },
        { name: 'estatusSolicitud',label: 'Estatus',         field: 'estatusSolicitud',align: 'left',   sortable: true },
        { name: 'acciones',        label: 'Acciones',        field: 'acciones',        align: 'right'                  },
      ],
    }
  },

  computed: {
    token()   { return this.$store.state.usuario },
    ruta()    { return this.$store.state.rutaDescargas },
    historial() { return this.$store.state.listaHistorialDescargasMetadataStore || [] },

    // Texto descriptivo del rango seleccionado que se muestra al usuario
    rangoTexto() {
      if (!this.fechaInicial || !this.fechaFinal) return ''
      moment.locale('es-mx')
      const fi = moment(this.fechaInicial, 'YYYY-MM-DD HH:mm:ss')
      const ff = moment(this.fechaFinal,   'YYYY-MM-DD HH:mm:ss')
      return fi.format('DD/MM/YY HH:mm') + '  →  ' + ff.format('DD/MM/YY HH:mm')
    },
  },

  created() {
    // Seleccionar el mes actual por defecto
    const hoy = moment()
    this.anio = String(hoy.year())
    this.mes  = this.catMeses.find(m => m.value === hoy.month() + 1)
    this.calcularRango()
    this.getHistorial()
  },

  methods: {

    // ── RANGO ──────────────────────────────────────────────────
    // Reglas:
    //   - Fecha inicial  = primer día del mes a las 00:00:00
    //   - Fecha final:
    //       · Si el mes+año elegido == mes+año actual → HOY a la hora actual
    //       · Si es un mes pasado                    → último día del mes a las 23:59:59
    //   - El backend suma +6h a la fechaFinal antes de enviarla al SAT (zona horaria UTC-6)
    calcularRango() {
      if (!this.anio || !this.mes) return

      const hoy      = moment()
      const mesStr   = String(this.mes.value).padStart(2, '0')
      const baseDate = moment(this.anio + '-' + mesStr + '-01', 'YYYY-MM-DD')

      this.fechaInicial = baseDate.startOf('month').format('YYYY-MM-DD') + ' 00:00:00'

      const esMesActual = (
        parseInt(this.anio, 10) === hoy.year() &&
        this.mes.value === hoy.month() + 1
      )

      if (esMesActual) {
        // Mes en curso → hasta ahora mismo (hora exacta del momento)
        this.fechaFinal = hoy.format('YYYY-MM-DD HH:mm:ss')
      } else {
        // Mes pasado → día 1 del mes siguiente a las 00:00:00
        // El SAT captura todo lo timbrado hasta medianoche sin problema de zona horaria
        const primerDiaSiguiente = baseDate.clone().add(1, 'month').startOf('month')
        this.fechaFinal = primerDiaSiguiente.format('YYYY-MM-DD') + ' 00:00:00'
      }
    },

    onAnioMesChange() {
      this.calcularRango()
    },

    // ── SOLICITAR ──────────────────────────────────────────────
    async solicitar() {
      if (!this.mes || !this.anio) {
        this.$q.notify({ type: 'warning', message: 'Selecciona año y mes.' })
        return
      }

      // Recalcular justo antes de enviar para capturar la hora actual
      this.calcularRango()

      const payload = {
        tipo:             this.tipo,
        fechaInicial:     this.fechaInicial,
        fechaFinal:       this.fechaFinal,
        RfcReceptor:      this.token.rfc,
        RfcEmisor:        this.token.rfc,
        RfcSolicitante:   this.token.rfc,
        TipoSolicitud:    'Metadata',
        usuario:          this.token.nombre,
        TipoComprobante:  { tipo: 'Todos', value: '' },
        EstadoComprobante:{ estatus: 'Todos', value: 'Todos' },
      }

      this.cargando = true
      this.$q.loading.show({ message: '<b>Generando solicitud...</b>' })
      try {
        const res = await axios.post(
          this.ruta + 'Descargas/PostSolicitud/erp_' + this.token.rfc, payload)

        const nuevo = {
          rfc:                  this.token.rfc,
          solicitud:            res.data,
          fechaSolicitud:       new Date(),
          tipo:                 this.tipo,
          tipoSolicitud:        'Metadata',
          tipoComprobante:      'Todos',
          estadoComprobante:    'Todos',
          fechaInicial:         this.fechaInicial,
          fechaFinal:           this.fechaFinal,
          numComprobantes:      0,
          estatusSolicitud:     'Solicitud Realizada',
          conciliacionGuardada: false,
        }

        const arr = [...this.historial, nuevo]
        this.$store.state.listaHistorialDescargasMetadataStore =
          arr.sort((a, b) => new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud))

        this.$q.notify({ type: 'positive', message: 'Solicitud creada correctamente.' })
      } catch (e) {
        this.$q.notify({ type: 'negative', message: (e.response && e.response.data) || 'Error al solicitar.' })
      } finally {
        this.cargando = false
        this.$q.loading.hide()
      }
    },

    // ── HISTORIAL ──────────────────────────────────────────────
    async getHistorial() {
      this.cargando = true
      this.$store.state.listaHistorialDescargasMetadataStore = []
      this.$q.loading.show({ message: '<b>Cargando historial...</b>' })
      try {
        const res = await axios.post(
          this.ruta + 'Descargas/GetHistorialDescargas/Metadata/erp_' + this.token.rfc)
        this.$store.state.listaHistorialDescargasMetadataStore =
          (res.data || []).sort((a, b) => new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud))
      } catch (e) {
        console.error(e)
      } finally {
        this.cargando = false
        this.$q.loading.hide()
      }
    },

    // ── ACTUALIZAR ESTATUS ─────────────────────────────────────
    async actualizar(item) {
      this.$q.loading.show({ message: '<b>Actualizando...</b>' })
      try {
        const res = await axios.put(
          this.ruta + 'Descargas/PutActualizaEstatus/erp_' + this.token.rfc,
          { solicitud: item.solicitud, rfc: item.rfc, tipoSolicitud: item.tipoSolicitud })

        const d = res.data
        if (d.estadoSolicitud === '6') {
          item.estatusSolicitud = 'Solicitud Vencida'
        } else if (d.estadoSolicitud === '4') {
          item.estatusSolicitud = 'Solicitud Errónea'
        } else if (d.estadoSolicitud === '5') {
          item.estatusSolicitud =
            d.codigoEstadoSolicitud === '5004' ? 'Información no Encontrada' :
            d.codigoEstadoSolicitud === '5002' ? 'Límite de solicitudes alcanzado' :
            'Solicitud Rechazada'
        } else {
          if (d.idsPaquetes && d.idsPaquetes.length) {
            item.solicitudPaquete = d.idsPaquetes[0]
            item.estatusSolicitud = 'Listo para Descargar'
          } else {
            item.estatusSolicitud = 'Procesando'
          }
        }
        item.numComprobantes = d.numeroCFDIs
        this.updateRow(item)
      } catch (e) {
        console.error(e)
      } finally {
        this.$q.loading.hide()
      }
    },

    // ── DESCARGAR ──────────────────────────────────────────────
    async descargar(item) {
      this.descargandoId = item.solicitud
      this.$q.loading.show({
        message: '<b>Descargando...</b><br>Este proceso puede tardar varios minutos. No cierre la ventana.',
      })
      try {
        const res = await axios.post(
          this.ruta + 'Descargas/DescargarSolicitud/erp_' + this.token.rfc, {
            solicitud:        item.solicitud,
            rfc:              item.rfc,
            tipoSolicitud:    'Metadata',
            tipoComprobante:  item.tipoComprobante,
            solicitudPaquete: item.solicitudPaquete,
            tipo:             item.tipo,
          })

        item.estatusSolicitud =
          res.data.mensaje === 'Se han descargado satisfactoriamente las facturas.'
            ? 'Descargado' : res.data.mensaje

        if(item.estatusSolicitud == 'Descargado'){
          this.guardarConciliacion(item)
        }
        this.updateRow(item)
        this.$q.notify({ type: 'positive', message: '¡Descarga completada!' })
      } catch (e) {
        // El back revirtió a "Listo para Descargar" — refrescar la fila
        item.estatusSolicitud = 'Listo para Descargar'
        this.updateRow(item)
        this.$q.notify({ type: 'negative',
          message: (e.response && e.response.data && e.response.data.error) || 'Error al descargar.' })
      } finally {
        this.descargandoId = null
        this.$q.loading.hide()
      }
    },

    // ── GUARDAR CONCILIACIÓN ───────────────────────────────────
    async guardarConciliacion(item) {
      this.guardandoId = item.solicitud
      this.$q.loading.show({ message: '<b>Guardando en conciliación...</b>' })
      try {
        await axios.post(this.ruta + 'Descargas/PostGuardarConciliacion', {
          rfc:       item.rfc,
          solicitud: item.solicitud,
          paquete:   item.solicitudPaquete,
          tipo:      item.tipo,
        })
        item.conciliacionGuardada = true
        this.updateRow(item)
        this.$q.notify({ type: 'positive', message: 'Guardado en conciliación.' })
      } catch (e) {
        this.$q.notify({ type: 'negative',
          message: (e.response && e.response.data) || 'Error al guardar.' })
      } finally {
        this.guardandoId = null
        this.$q.loading.hide()
      }
    },

    // ── EXTRAER .TXT ───────────────────────────────────────────
    async descargaLocal(item) {
      this.$q.loading.show({ message: '<b>Descargando archivo...</b>' })
      try {
        const res = await axios.get(
          this.ruta + 'Descargas/GetMetadata/erp_' + this.token.rfc +
          '/' + item.rfc + '/' + item.solicitud + '/' + item.solicitudPaquete)
        if (res.data.base64) {
          this.$refs.visor.abrir(res.data.base64, (item.solicitudPaquete || item.solicitud) + '.txt')

          const blob = new Blob([atob(res.data.base64)], { type: 'text/plain' })
          const a = document.createElement('a')
          a.href = URL.createObjectURL(blob)
          a.download = (item.solicitudPaquete || item.solicitud) + '.txt'
          a.click()
          URL.revokeObjectURL(a.href)
          this.$q.notify({ type: 'positive', message: 'Archivo descargado.' })
        } else {
          this.$q.notify({ type: 'negative', message: 'No se encontró el archivo.' })
        }
      } catch (e) {
        this.$q.notify({ type: 'negative', message: 'Error al descargar archivo.' })
      } finally {
        this.$q.loading.hide()
      }
    },

    // ── VALIDAR CANCELADOS ─────────────────────────────────────
    async ValidaCancelados(item) {
      this.$q.loading.show({
        spinner: QSpinnerCube, spinnerColor: 'red-8', spinnerSize: 140,
        message: '<b>Actualizando estatus de comprobantes...</b>',
      })
      try {
        await axios.post(
          this.ruta + 'Descargas/PostValidaCanceladosAsync/' +
          item.rfc + '/' + item.solicitud + '/' + item.solicitudPaquete + '/' + item.tipo)
        this.$q.notify({ type: 'positive', message: 'Validación completada.' })
      } catch (e) {
        console.error(e)
      } finally {
        this.$q.loading.hide()
      }
    },

    // ── UTILIDADES ─────────────────────────────────────────────
    updateRow(item) {
      const lista = this.$store.state.listaHistorialDescargasMetadataStore || []
      const idx   = lista.findIndex(x => x.solicitud === item.solicitud)
      if (idx >= 0) Object.assign(lista[idx], item)
      this.$store.state.listaHistorialDescargasMetadataStore =
        [...lista].sort((a, b) => new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud))
    },

    rowClass(row) {
      if (row.estatusSolicitud === 'Descargando') return 'dsc-row--loading'
      if (row.estatusSolicitud === 'Descargado')  return 'dsc-row--done'
      return ''
    },

    statusClass(s) {
      if (!s) return ''
      if (s === 'Descargando')          return 'dsc-status--downloading'
      if (s === 'Descargado')           return 'dsc-status--done'
      if (s === 'Listo para Descargar') return 'dsc-status--ready'
      if (s.includes('Procesando'))     return 'dsc-status--processing'
      if (s === 'Solicitud Realizada')  return 'dsc-status--sent'
      if (s.includes('Error') || s.includes('Rechaz') ||
          s.includes('Vencid') || s.includes('Límite'))
        return 'dsc-status--error'
      return 'dsc-status--neutral'
    },

    fd(v) {
      if (!v) return '—'
      moment.locale('es-mx')
      const d = typeof v === 'string'
        ? new Date(v.replace('T', ' ').replace('Z', ''))
        : v
      return moment(d).format('DD/MM/YY HH:mm')
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');

.dsc-panel {
  font-family: 'IBM Plex Sans', sans-serif;
  background: #f4f6fb;
  min-height: calc(100vh - 68px);
}

/* Filtros */
.dsc-filters {
  background: #fff;
  border-bottom: 1px solid #e2e6f0;
  padding: 14px 20px 12px;
}
.dsc-filters__row {
  display: flex; flex-wrap: wrap; gap: 10px; align-items: flex-end;
}
.dsc-field {
  display: flex; flex-direction: column; min-width: 140px;
}
.dsc-field--sm   { min-width: 100px; max-width: 130px; }
.dsc-field--range{ min-width: 220px; }
.dsc-field--btns {
  display: flex; flex-direction: row; align-items: flex-end;
  gap: 6px; min-width: auto; margin-top: 16px;
}
.dsc-field__label {
  font-size: 0.68rem; font-weight: 700; color: #7b86a0;
  text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;
}
.dsc-range-text {
  font-size: 0.78rem; font-weight: 600; color: #3d5afe;
  background: #eef0ff; border-radius: 6px;
  padding: 6px 10px; line-height: 1.4;
  border: 1px solid #c7d0ff;
}
.dsc-input { font-size: 0.82rem; }
.dsc-btn {
  font-size: 0.78rem; font-weight: 600; letter-spacing: 0.2px;
  height: 36px; padding: 0 14px; border-radius: 8px !important;
}

/* Alerta */
.dsc-alert {
  display: flex; align-items: center; gap: 8px;
  margin-top: 10px; padding: 7px 12px; border-radius: 8px;
  font-size: 0.78rem; font-weight: 500;
}
.dsc-alert--blue { background: #eef0ff; color: #3d5afe; }

/* Tabla */
.dsc-table-wrap { padding: 16px 20px; }
.dsc-table { border-radius: 10px; overflow: hidden; font-size: 0.8rem; }
.dsc-table__top {
  display: flex; align-items: center; justify-content: space-between;
  width: 100%; padding: 6px 4px;
}
.dsc-table__title { font-size: 0.88rem; font-weight: 700; color: #0f1623; }
.dsc-td { font-size: 0.78rem; padding: 5px 10px !important; }

/* Pills */
.dsc-pill {
  display: inline-block; border-radius: 4px;
  padding: 1px 8px; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.3px;
}
.dsc-pill--blue   { background: #e8edff; color: #3d5afe; }
.dsc-pill--purple { background: #f3e8ff; color: #7c3aed; }

/* Status badges */
.dsc-status {
  display: inline-block; border-radius: 4px;
  padding: 2px 8px; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.2px;
}
.dsc-status--downloading{ background: #dbeafe; color: #1e40af; animation: pulse .8s ease-in-out infinite alternate; }
.dsc-status--done       { background: #d1fae5; color: #065f46; }
.dsc-status--ready      { background: #dbeafe; color: #1d4ed8; }
.dsc-status--processing { background: #fef3c7; color: #92400e; }
.dsc-status--sent       { background: #e0f2fe; color: #0369a1; }
.dsc-status--error      { background: #fee2e2; color: #991b1b; }
.dsc-status--neutral    { background: #f1f5f9; color: #475569; }

/* Filas especiales */
.dsc-row--loading {
  background: #eef0ff !important;
  animation: pulse .8s ease-in-out infinite alternate;
}
.dsc-row--done { background: #f0fdf4 !important; }

@keyframes pulse {
  from { background: #eef0ff; }
  to   { background: #d8ddff; }
}

/* Descargando inline */
.dsc-downloading {
  display: flex; align-items: center; gap: 4px;
  font-size: 0.75rem; font-weight: 600; color: #1e40af;
}

/* Acciones */
.dsc-actions { display: flex; gap: 4px; justify-content: flex-end; }

/* Empty */
.dsc-empty {
  display: flex; flex-direction: column; align-items: center;
  padding: 40px; gap: 8px;
}
.dsc-empty__text { font-size: 0.82rem; color: #94a3b8; font-weight: 500; }
.dsc-tip { font-size: 0.72rem; }
</style>