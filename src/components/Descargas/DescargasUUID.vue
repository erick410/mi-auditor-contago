<template>
  <div class="dsc-panel">

    <!-- ╔══════════════════════════════════════════╗ -->
    <!-- ║  FILTROS                                 ║ -->
    <!-- ╚══════════════════════════════════════════╝ -->
    <div class="dsc-filters">
      <div class="dsc-filters__row">

        <div class="dsc-field dsc-field--wide">
          <div class="dsc-field__label">UUID / Folio Fiscal</div>
          <q-input dense outlined v-model="uuidValor" clearable placeholder="8F3A2C1D-0000-0000-0000-000000000000"
            class="dsc-input dsc-input--mono" />
        </div>

        <div class="dsc-field dsc-field--btns">
          <q-btn dense unelevated color="indigo" icon="mdi-send" label="Solicitar" :loading="cargando"
            :disable="cargando || !uuidValor" class="dsc-btn" @click="solicitar" />
          <q-btn dense unelevated outline color="indigo" icon="mdi-refresh" label="Actualizar" :loading="cargando"
            :disable="cargando" class="dsc-btn" @click="getHistorial" />
        </div>

      </div>

      <div v-if="descargandoId" class="dsc-alert">
        <q-spinner-dots color="indigo" size="1.1em" />
        <span>Descarga en progreso — no cierre la ventana ni repita la acción hasta que el estatus cambie a
          <b>Descargado</b>.</span>
      </div>
    </div>

    <!-- ╔══════════════════════════════════════════╗ -->
    <!-- ║  TABLA                                   ║ -->
    <!-- ╚══════════════════════════════════════════╝ -->
    <div class="dsc-table-wrap">
      <q-table dense flat bordered :data="historial" :columns="columns" :filter="filter" :pagination.sync="pagination"
        :rows-per-page-options="[15, 25, 50]" row-key="solicitud" class="dsc-table">
        <template v-slot:top>
          <div class="dsc-table__top">
            <span class="dsc-table__title">
              Historial UUID
              <q-badge color="indigo" class="q-ml-xs">{{ historial.length }}</q-badge>
            </span>
            <q-input dense outlined v-model="filter" placeholder="Buscar…" style="width:200px">
              <template v-slot:prepend><q-icon name="search" size="16px" /></template>
            </q-input>
          </div>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props" :class="rowClass(props.row)">
            <q-td key="fechaSolicitud" :props="props" class="dsc-td">{{ fd(props.row.fechaSolicitud) }}</q-td>
            <q-td key="uuid" :props="props" class="dsc-td dsc-td--mono">{{ props.row.uuid || '—' }}</q-td>
            <q-td key="estatusSolicitud" :props="props" class="dsc-td">
              <div v-if="descargandoId === props.row.solicitud" class="dsc-downloading">
                <q-spinner-dots size="1em" color="indigo" />&nbsp;Descargando...
              </div>
              <span v-else :class="['dsc-status', statusClass(props.row.estatusSolicitud)]">
                {{ props.row.estatusSolicitud }}
              </span>
            </q-td>
            <q-td key="acciones" :props="props" class="dsc-td" auto-width>
              <div class="dsc-actions">

                <q-btn v-if="props.row.estatusSolicitud === 'Listo para Descargar'" dense round unelevated size="xs"
                  color="emerald" icon="mdi-download" :loading="descargandoId === props.row.solicitud"
                  :disable="descargandoId !== null" @click="descargar(props.row)">
                  <q-tooltip class="dsc-tip">Descargar</q-tooltip>
                </q-btn>

                <q-btn
                  v-if="props.row.estatusSolicitud === 'Solicitud Realizada' || props.row.estatusSolicitud.includes('Procesando')"
                  dense round unelevated size="xs"
                  :color="props.row.estatusSolicitud === 'Solicitud Realizada' ? 'orange-8' : 'blue-7'"
                  icon="mdi-update" :disable="!!descargandoId" @click="actualizar(props.row)">
                  <q-tooltip class="dsc-tip">Actualizar estatus</q-tooltip>
                </q-btn>

                <q-btn v-if="props.row.estatusSolicitud === 'Descargado'" dense round unelevated size="xs"
                  color="grey-4" text-color="grey-6" icon="mdi-check-circle" disable>
                  <q-tooltip class="dsc-tip">Ya descargado</q-tooltip>
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
import moment from 'moment'

export default {
  name: 'DescargasUUID',
  data() {
    return {
      uuidValor: '', cargando: false, descargandoId: null,
      filter: '',
      pagination: { sortBy: 'fechaSolicitud', descending: true, rowsPerPage: 15 },
      columns: [
        { name: 'fechaSolicitud', label: 'Fecha solicitud', field: 'fechaSolicitud', align: 'left', sortable: true },
        { name: 'uuid', label: 'UUID', field: 'uuid', align: 'left', sortable: true },
        { name: 'estatusSolicitud', label: 'Estatus', field: 'estatusSolicitud', align: 'left', sortable: true },
        { name: 'acciones', label: '', field: 'acciones', align: 'right' },
      ],
    }
  },

  computed: {
    token() { return this.$store.state.usuario },
    ruta() { return this.$store.state.rutaDescargas },
    historial() { return this.$store.state.listaHistorialDescargasUUIDStore || [] },
    
  },

  created() { this.getHistorial() },

  methods: {
    async solicitar() {
      if (!this.uuidValor?.trim()) return
      this.cargando = true
      this.$q.loading.show({ message: '<b>Generando solicitud...</b>' })
      try {
        const res = await axios.post(
          this.ruta + 'Descargas/PostSolicitudUUID/erp_' + this.token.rfc,
          { rfc: this.token.rfc, solicitud: '', uuid: this.uuidValor, usuario: this.token.nombre, estatusSolicitud: '' })
        const arr = [...this.historial, {
          rfc: this.token.rfc, solicitud: res.data, uuid: this.uuidValor,
          fechaSolicitud: new Date(), estatusSolicitud: 'Solicitud Realizada',
        }]
        this.$store.state.listaHistorialDescargasUUIDStore =
          arr.sort((a, b) => new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud))
        this.$q.notify({ type: 'positive', message: 'Solicitud creada correctamente.' })
        this.uuidValor = ''
      } catch (e) {
        this.$q.notify({ type: 'negative', message: e.response?.data || 'Error al solicitar.' })
      } finally { this.cargando = false; this.$q.loading.hide() }
    },

    async getHistorial() {
      this.cargando = true
      this.$store.state.listaHistorialDescargasUUIDStore = []
      this.$q.loading.show({ message: '<b>Cargando historial...</b>' })
      try {
        const res = await axios.post(this.ruta + 'Descargas/GetHistorialDescargasUUID/erp_' + this.token.rfc)
        this.$store.state.listaHistorialDescargasUUIDStore =
          (res.data || []).sort((a, b) => new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud))
      } catch (e) { console.error(e) } finally { this.cargando = false; this.$q.loading.hide() }
    },

    async actualizar(item) {
      this.$q.loading.show({ message: '<b>Actualizando...</b>' })
      try {
        const res = await axios.put(
          this.ruta + 'Descargas/PutActualizaEstatus/erp_' + this.token.rfc,
          { solicitud: item.solicitud, rfc: item.rfc, tipoSolicitud: '' })
        const d = res.data
        if (d.mensaje === 'Solicitud Aceptada' && d.codigoEstadoSolicitud !== '5002')
          item.estatusSolicitud = 'Listo para Descargar'
        else if (d.codigoEstadoSolicitud === '5002')
          item.estatusSolicitud = 'Límite de solicitudes alcanzado'
        else item.estatusSolicitud = d.mensaje
        this.updateRow(item)
      } catch (e) { console.error(e) } finally { this.$q.loading.hide() }
    },

    async descargar(item) {
      this.descargandoId = item.solicitud
      this.$q.loading.show({ message: '<b>Descargando...</b><br>Este proceso puede tardar varios minutos.' })
      try {
        const res = await axios.post(
          this.ruta + 'Descargas/DescargarSolicitud/erp_' + this.token.rfc,
          {
            solicitud: item.solicitud, rfc: item.rfc,
            tipoSolicitud: item.tipoSolicitud || 'CFDI',
            tipoComprobante: item.tipoComprobante || '',
            solicitudPaquete: item.solicitudPaquete || '',
            tipo: item.tipo || ''
          })
          console.log(res)
        item.estatusSolicitud = res.data.mensaje === 'Se han descargado satisfactoriamente las facturas.'
          ? 'Descargado' : res.data.mensaje
        this.updateRow(item)
        this.$q.notify({ type: 'positive', message: '¡Descarga completada!' })
      } catch (e) {
        this.$q.notify({ type: 'negative', message: e.response?.data?.error || 'Error al descargar.' })
      } finally { this.descargandoId = null; this.$q.loading.hide() }
    },

    updateRow(item) {
      const lista = this.$store.state.listaHistorialDescargasUUIDStore || []
      const idx = lista.findIndex(x => x.solicitud === item.solicitud)
      if (idx >= 0) Object.assign(lista[idx], item)
      this.$store.state.listaHistorialDescargasUUIDStore =
        [...lista].sort((a, b) => new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud))
    },
    rowClass(row) {
      if (this.descargandoId === row.solicitud) return 'dsc-row--loading'
      if (row.estatusSolicitud === 'Descargado') return 'dsc-row--done'
      return ''
    },
    statusClass(s) {
      if (!s) return ''
      if (s === 'Descargado') return 'dsc-status--done'
      if (s === 'Listo para Descargar') return 'dsc-status--ready'
      if (s.includes('Procesando')) return 'dsc-status--processing'
      if (s === 'Solicitud Realizada') return 'dsc-status--sent'
      if (s.includes('Error') || s.includes('Rechaz') || s.includes('Vencid') || s.includes('Límite'))
        return 'dsc-status--error'
      return 'dsc-status--neutral'
    },
    fd(v) {
      if (!v) return '—'
      moment.locale('es-mx')
      const d = typeof v === 'string' ? new Date(v.replace('T', ' ').replace('Z', '')) : v
      return moment(d).format('DD/MM/YY HH:mm')
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&display=swap');

.dsc-panel {
  font-family: 'IBM Plex Sans', sans-serif;
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

.dsc-field {
  display: flex;
  flex-direction: column;
  min-width: 140px;
}

.dsc-field--wide {
  flex: 1;
  max-width: 420px;
}

.dsc-field--btns {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 6px;
  min-width: auto;
  margin-top: 16px;
}

.dsc-field__label {
  font-size: 0.68rem;
  font-weight: 700;
  color: #7b86a0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.dsc-input {
  font-size: 0.82rem;
}

.dsc-input--mono {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.8rem;
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
  background: #eef0ff;
  border-radius: 8px;
  font-size: 0.78rem;
  color: #3d5afe;
  font-weight: 500;
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
  display: flex;
  align-items: center;
}

.dsc-td {
  font-size: 0.78rem;
  padding: 5px 10px !important;
}

.dsc-td--mono {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.72rem;
  color: #475569;
}

.dsc-status {
  display: inline-block;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.2px;
}

.dsc-status--done {
  background: #d1fae5;
  color: #065f46;
}

.dsc-status--ready {
  background: #dbeafe;
  color: #1d4ed8;
}

.dsc-status--processing {
  background: #fef3c7;
  color: #92400e;
}

.dsc-status--sent {
  background: #e0f2fe;
  color: #0369a1;
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
  animation: pulse .18s ease-in-out infinite alternate;
}

.dsc-row--done {
  background: #f0fdf4 !important;
}

@keyframes pulse {
  from {
    background: #eef0ff;
  }

  to {
    background: #e0e4ff;
  }
}

.dsc-downloading {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: #3d5afe;
  gap: 4px;
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