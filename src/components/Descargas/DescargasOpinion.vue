<template>
  <div class="dsc-panel">
    <!-- ── HEADER ──────────────────────────────────────────────── -->
    <div class="dsc-filters">
      <div class="dsc-filters__row dsc-filters__row--header">
        <div class="dsc-header-info">
          <q-avatar size="38px" class="dsc-header-icon">
            <q-icon name="mdi-file-check-outline" size="20px" />
          </q-avatar>
          <div>
            <div class="dsc-header-title">Opinión de Cumplimiento (32D)</div>
            <div class="dsc-header-subtitle">Solicita y consulta el historial de descargas ante el SAT</div>
          </div>
        </div>

        <div class="dsc-field dsc-field--btns">
          <q-btn dense unelevated color="primary" icon="mdi-cloud-download" label="Solicitar Opinión"
            :loading="cargandoSolicitud" :disable="cargandoSolicitud" class="dsc-btn" @click="solicitarDescarga" />
          <q-btn dense unelevated outline color="primary" icon="mdi-refresh" label="Actualizar"
            :loading="cargandoHistorial" :disable="cargandoHistorial" class="dsc-btn" @click="consultarHistorial" />
        </div>
      </div>

      <!-- Aviso descarga activa -->
      <div v-if="hayEnProceso" class="dsc-alert dsc-alert--blue">
        <q-spinner-dots color="primary" size="1.1em" />
        <span>Hay una solicitud en proceso — el estatus se actualizará automáticamente cada 2 minutos.</span>
      </div>
    </div>

    <!-- ── TABLA ──────────────────────────────────────────────── -->
    <div class="dsc-table-wrap">
      <q-table dense flat bordered :data="registrosFiltrados" :columns="columns" :filter="filter"
        :pagination.sync="pagination" :rows-per-page-options="[15, 25, 50]" row-key="id" class="dsc-table">
        <template v-slot:top>
          <div class="dsc-table__top">
            <span class="dsc-table__title">Historial Opinión 32D</span>
            <q-input dense outlined v-model="filter" placeholder="Buscar…" style="width: 200px">
              <template v-slot:prepend><q-icon name="search" size="16px" /></template>
            </q-input>
          </div>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props" :class="rowClass(props.row)">
            <q-td key="fechaSolicitud" :props="props" class="dsc-td">{{ fd(props.row.fechaSolicitud) }}</q-td>
            <q-td key="estado" :props="props" class="dsc-td">
              <span :class="['dsc-status', statusClass(props.row.estado)]">
                {{ displayEstatus(props.row.estado) }}
              </span>
            </q-td>
            <q-td key="sentido" :props="props" class="dsc-td text-center">
              <span v-if="props.row.sentido" :class="[
                'dsc-pill',
                props.row.sentido === 'POSITIVO' ? 'dsc-pill--blue' : 'dsc-pill--purple',
              ]">
                {{ props.row.sentido }}
              </span>
              <span v-else>—</span>
            </q-td>
            <q-td key="nombreArchivo" :props="props" class="dsc-td">{{ props.row.nombreArchivo || '—' }}</q-td>

            <q-td key="acciones" :props="props" class="dsc-td" auto-width>
              <div class="dsc-actions">
                <q-btn v-if="props.row.estado === 'EN_PROCESO'" dense round flat size="md" color="blue-6"
                  icon="mdi-loading" disable loading>
                  <q-tooltip class="dsc-tip">En proceso en el servidor...</q-tooltip>
                </q-btn>

                <q-btn v-else-if="props.row.estado === 'COMPLETADO'" dense round flat size="md" color="teal"
                  icon="mdi-download" :href="obtenerUrlArchivo(props.row.id)" target="_blank">
                  <q-tooltip class="dsc-tip">Descargar archivo</q-tooltip>
                </q-btn>

                <q-btn v-else-if="props.row.estado === 'FALLIDO'" dense round flat size="md" color="red-6"
                  icon="mdi-alert-circle-outline">
                  <q-tooltip class="dsc-tip">{{ props.row.mensajeError }}</q-tooltip>
                </q-btn>
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
  </div>
</template>

<script>
import axios from 'axios'

const BASE_URL = 'https://DescargaSat.contago.com.mx/api/Descarga'

export default {
  name: 'OpinionCumplimientoPage',
  data () {
    return {
      tipoDocumento: 'opinion32d',
      endpointSolicitud: 'DescargarOpinion',
      cargandoSolicitud: false,
      cargandoHistorial: false,
      registros: [],
      pollingTimer: null,
      filter: '',
      pagination: {
        sortBy: 'fechaSolicitud',
        descending: true,
        rowsPerPage: 15
      },
      columns: [
        { name: 'fechaSolicitud', label: 'Fecha solicitud', field: 'fechaSolicitud', align: 'left', sortable: true },
        { name: 'estado', label: 'Estado', field: 'estado', align: 'left', sortable: true },
        { name: 'sentido', label: 'Sentido', field: 'sentido', align: 'center', sortable: true },
        { name: 'nombreArchivo', label: 'Archivo', field: 'nombreArchivo', align: 'left' },
        { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'right' }
      ]
    }
  },
  computed: {
    token () {
      return this.$store.state.usuario
    },
    ruta () {
      return this.$store.state.rutaDescargas // TODO: confirmar si Opinión/Constancia usan la misma ruta base del store o BASE_URL fija
    },
    registrosFiltrados () {
      return this.registros.filter(r => r.tipoDocumento === this.tipoDocumento)
    },
    hayEnProceso () {
      return this.registrosFiltrados.some(r => r.estado === 'EN_PROCESO')
    }
  },
  methods: {
    async solicitarDescarga () {
  const fiel = (this.$store.state.listaArchivosVigenciaStore || [])
    .find(x => x.tipo === 'FIEL')

  if (!fiel || !fiel.password) {
    this.$q.notify({
      type: 'warning',
      icon: 'mdi-alert-circle-outline',
      message: 'No se encontró una FIEL vigente. Sube tu FIEL antes de solicitar la descarga.'
    })
    return
  }

  this.cargandoSolicitud = true
  this.$q.loading.show({ message: '<b>Generando solicitud...</b>' })
  try {
    const { data } = await axios.post(`${BASE_URL}/${this.endpointSolicitud}`, {
      rfc: this.token.rfc,
      password: fiel.password
    })
    if (data.exito) {
      this.$q.notify({ type: 'positive', message: data.mensaje || 'Solicitud enviada' })
      await this.consultarHistorial()
      this.iniciarPolling()
    } else {
      this.$q.notify({ type: 'negative', message: data.mensaje || 'No se pudo procesar la solicitud' })
    }
  } catch (e) {
    const esTimeout = !e.response || e.code === 'ECONNABORTED'
    this.$q.notify({
      type: esTimeout ? 'warning' : 'negative',
      timeout: esTimeout ? 8000 : 4000,
      icon: esTimeout ? 'mdi-timer-sand' : 'mdi-alert-circle',
      message: esTimeout
        ? 'La solicitud sigue en proceso en el servidor. El estatus se actualizará automáticamente cada 2 minutos.'
        : (e.response?.data?.mensaje || 'Error al solicitar la descarga.')
    })
  } finally {
    this.cargandoSolicitud = false
    this.$q.loading.hide()
  }
},
    async consultarHistorial () {
      this.cargandoHistorial = true
      try {
        const { data } = await axios.get(`${BASE_URL}/Historial/${this.token.rfc}`)
        if (data.exito) {
          this.registros = data.registros
        }
      } catch (e) {
        this.$q.notify({ type: 'negative', message: 'Error al consultar el historial' })
      } finally {
        this.cargandoHistorial = false
      }
    },
    iniciarPolling () {
      this.detenerPolling()
      this.pollingTimer = setInterval(() => {
        if (this.hayEnProceso) {
          this.consultarHistorial()
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
    obtenerUrlArchivo (id) {
      return `https://descargasat.contago.com.mx/api/Descarga/Archivo/${this.token.rfc}/${id}`
    },
    displayEstatus (estado) {
      const mapa = { EN_PROCESO: 'En proceso', COMPLETADO: 'Completado', FALLIDO: 'Fallido' }
      return mapa[estado] || estado
    },
    statusClass (estado) {
      if (estado === 'EN_PROCESO') return 'dsc-status--downloading'
      if (estado === 'COMPLETADO') return 'dsc-status--done'
      if (estado === 'FALLIDO') return 'dsc-status--error'
      return 'dsc-status--neutral'
    },
    rowClass (row) {
      if (row.estado === 'EN_PROCESO') return 'dsc-row--loading'
      if (row.estado === 'COMPLETADO') return 'dsc-row--done'
      return ''
    },
    fd (v) {
      if (!v) return '—'
      const d = new Date(v)
      return d.toLocaleString('es-MX', {
        day: '2-digit', month: '2-digit', year: '2-digit',
        hour: '2-digit', minute: '2-digit'
      })
    }
  },
  async mounted () {
    await this.consultarHistorial()
    if (this.hayEnProceso) {
      this.iniciarPolling()
    }
  },
  beforeDestroy () {
    this.detenerPolling()
  }
}
</script>

<style scoped>

.dsc-panel {
  background: #f4f6fb;
  min-height: calc(100vh - 68px);
}

.dsc-filters {
  background: #fff;
  border-bottom: 1px solid #e2e6f0;
  padding: 14px 20px 12px;
}

.dsc-filters__row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: flex-end;
}

.dsc-filters__row--header {
  justify-content: space-between;
  align-items: center;
}

.dsc-header-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dsc-header-icon {
  background: rgba(61, 90, 254, 0.12);
  color: #3d5afe;
}

.dsc-header-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f1623;
}

.dsc-header-subtitle {
  font-size: 0.76rem;
  color: #7b86a0;
  font-weight: 500;
}

.dsc-field--btns {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 6px;
  min-width: auto;
}

.dsc-btn {
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.2px;
  height: 36px;
  padding: 0 14px;
  border-radius: 8px !important;
}

.dsc-alert {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  padding: 7px 12px;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 500;
}

.dsc-alert--blue {
  background: #eef0ff;
  color: #3d5afe;
}

.dsc-table-wrap {
  padding: 16px 20px;
}

.dsc-table {
  border-radius: 10px;
  overflow: hidden;
  font-size: 0.8rem;
}

.dsc-table__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 6px 4px;
}

.dsc-table__title {
  font-size: 0.88rem;
  font-weight: 700;
  color: #0f1623;
}

.dsc-td {
  font-size: 0.78rem;
  padding: 5px 10px !important;
}

.dsc-pill {
  display: inline-block;
  border-radius: 4px;
  padding: 1px 8px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.dsc-pill--blue {
  background: #e8edff;
  color: #3d5afe;
}

.dsc-pill--purple {
  background: #f3e8ff;
  color: #7c3aed;
}

.dsc-status {
  display: inline-block;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.2px;
}

.dsc-status--downloading {
  background: #dbeafe;
  color: #1e40af;
  animation: pulse 0.8s ease-in-out infinite alternate;
}

.dsc-status--done {
  background: #d1fae5;
  color: #065f46;
}

.dsc-status--error {
  background: #fee2e2;
  color: #991b1b;
}

.dsc-status--neutral {
  background: #f1f5f9;
  color: #475569;
}

.dsc-row--loading {
  background: #eef0ff !important;
  animation: pulse 0.8s ease-in-out infinite alternate;
}

.dsc-row--done {
  background: #f0fdf4 !important;
}

@keyframes pulse {
  from { background: #eef0ff; }
  to { background: #d8ddff; }
}

.dsc-actions {
  display: flex;
  gap: 4px;
  justify-content: flex-end;
}

.dsc-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  gap: 8px;
}

.dsc-empty__text {
  font-size: 0.82rem;
  color: #94a3b8;
  font-weight: 500;
}

.dsc-tip {
  font-size: 0.72rem;
}
</style>