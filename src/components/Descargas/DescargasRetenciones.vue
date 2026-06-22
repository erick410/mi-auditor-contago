<template>
  <div class="dsc-panel">
    <div class="dsc-filters">
      <div class="dsc-filters__row">
        <!-- Fecha+Hora inicial -->
        <div class="dsc-field" style="min-width: 185px">
          <div class="dsc-field__label">Inicio</div>
          <date-time-input
            v-model="dtInicial"
            color="primary"
            icon-name="mdi-calendar-arrow-right"
            @input="autoFechaFinal"
          />
        </div>

        <!-- Fecha+Hora final -->
        <div class="dsc-field" style="min-width: 185px">
          <div class="dsc-field__label">Fin</div>
          <date-time-input
            v-model="dtFinal"
            color="primary"
            icon-name="mdi-calendar-arrow-left"
          />
        </div>

        <!-- Tipo -->
        <div class="dsc-field dsc-field--sm">
          <div class="dsc-field__label">Tipo</div>
          <q-select
            dense
            outlined
            v-model="tipo"
            :options="[ 'Recibido']"
            class="dsc-input"
          />
        </div>

        <!-- Botones -->
        <div class="dsc-field dsc-field--btns">
          <q-btn
            dense
            unelevated
            color="primary"
            icon="mdi-send"
            label="Solicitar"
            :loading="cargando"
            :disable="cargando"
            class="dsc-btn"
            @click="solicitar"
          />
          <q-btn
            dense
            unelevated
            outline
            color="primary"
            icon="mdi-refresh"
            label="Actualizar"
            :loading="cargando"
            :disable="cargando"
            class="dsc-btn"
            @click="getHistorial"
          />
        </div>
      </div>

      <!-- Aviso descarga activa -->
      <div v-if="descargandoId" class="dsc-alert">
        <q-spinner-dots color="primary" size="1.1em" />
        <span
          >Descarga en progreso — no cierre la ventana ni repita la acción hasta
          que el estatus cambie a <b>Descargado</b>.</span
        >
      </div>
    </div>

    <!-- TABLA -->
    <div class="dsc-table-wrap">
      <q-table
        dense
        flat
        bordered
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
            <span class="dsc-table__title"> Historial Retenciones </span>
            <q-input
              dense
              outlined
              v-model="filter"
              placeholder="Buscar…"
              style="width: 200px"
            >
              <template v-slot:prepend
                ><q-icon name="search" size="16px"
              /></template>
            </q-input>
          </div>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props" :class="rowClass(props.row)">
            <q-td key="fechaSolicitud" :props="props" class="dsc-td">{{
              fd(props.row.fechaSolicitud)
            }}</q-td>
            <q-td key="tipo" :props="props" class="dsc-td">
              <span
                :class="[
                  'dsc-pill',
                  props.row.tipo === 'Emitido'
                    ? 'dsc-pill--blue'
                    : 'dsc-pill--purple',
                ]"
              >
                {{ props.row.tipo }}
              </span>
            </q-td>
            <q-td key="fechaInicial" :props="props" class="dsc-td">{{
              fd(props.row.fechaInicial)
            }}</q-td>
            <q-td key="fechaFinal" :props="props" class="dsc-td">{{
              fd(props.row.fechaFinal)
            }}</q-td>
            <q-td
              key="numComprobantes"
              :props="props"
              class="dsc-td text-center"
            >
              {{ props.row.numComprobantes || "—" }}
            </q-td>
            <q-td key="estatusSolicitud" :props="props" class="dsc-td">
              <div
                v-if="descargandoId === props.row.solicitud"
                class="dsc-downloading"
              >
                <q-spinner-dots size="1em" color="indigo" />&nbsp;Descargando...
              </div>
              <span
                v-else
                :class="['dsc-status', statusClass(props.row.estatusSolicitud)]"
              >
                {{ props.row.estatusSolicitud }}
              </span>
            </q-td>
            <q-td key="acciones" :props="props" class="dsc-td" auto-width>
              <div class="dsc-actions">
                <q-btn
                  v-if="props.row.estatusSolicitud === 'Listo para Descargar'"
                  dense
                  round
                  flat
                  size="md"
                  color="green"
                  icon="mdi-download"
                  :loading="descargandoId === props.row.solicitud"
                  :disable="descargandoId !== null"
                  @click="descargar(props.row)"
                >
                  <q-tooltip class="dsc-tip">Descargar</q-tooltip>
                </q-btn>

                <q-btn
                  v-if="
                    props.row.estatusSolicitud === 'Solicitud Realizada' ||
                    props.row.estatusSolicitud.includes('Procesando')
                  "
                  dense
                  round
                  flat
                  size="md"
                  :color="
                    props.row.estatusSolicitud === 'Solicitud Realizada'
                      ? 'orange-8'
                      : 'blue-7'
                  "
                  icon="mdi-update"
                  :disable="!!descargandoId"
                  @click="actualizar(props.row)"
                >
                  <q-tooltip class="dsc-tip">Actualizar estatus</q-tooltip>
                </q-btn>

                <q-btn
                  v-if="props.row.estatusSolicitud === 'Descargado'"
                  dense
                  round
                  flat
                  size="md"
                  color="grey-4"
                  text-color="grey-6"
                  icon="mdi-check-circle"
                  disable
                >
                  <q-tooltip class="dsc-tip">Ya descargado</q-tooltip>
                </q-btn>

                <q-btn
                  v-if="props.row.estatusSolicitud === 'Descargando'"
                  dense
                  round
                  flat
                  size="md"
                  color="blue-6"
                  icon="mdi-loading"
                  disable
                  loading
                >
                  <q-tooltip>Descarga en progreso en el servidor...</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </q-tr>
        </template>

        <template v-slot:no-data>
          <div class="dsc-empty">
            <q-icon name="mdi-inbox-outline" size="2.5rem" color="grey-4" />
            <div class="dsc-empty__text">
              Sin solicitudes de retenciones registradas
            </div>
          </div>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import moment from "moment";
import DateTimeInput from "./DatetimeInput.vue";

const STORE_KEY = "listaHistorialRetencionesStore";

export default {
  name: "DescargasRetenciones",
  components: { DateTimeInput },

  data() {
    return {
      dtInicial: { fecha: "", hora: "" },
      dtFinal: { fecha: "", hora: "" },
      tipo: "Recibido",
      cargando: false,
      descargandoId: null,
      filter: "",
      pagination: {
        sortBy: "fechaSolicitud",
        descending: true,
        rowsPerPage: 15,
      },
      columns: [
        {
          name: "fechaSolicitud",
          label: "Fecha solicitud",
          field: "fechaSolicitud",
          align: "left",
          sortable: true,
        },
        {
          name: "tipo",
          label: "Tipo",
          field: "tipo",
          align: "center",
          sortable: true,
        },
        {
          name: "fechaInicial",
          label: "Desde",
          field: "fechaInicial",
          align: "center",
          sortable: true,
        },
        {
          name: "fechaFinal",
          label: "Hasta",
          field: "fechaFinal",
          align: "center",
          sortable: true,
        },
        {
          name: "numComprobantes",
          label: "Retenciones",
          field: "numComprobantes",
          align: "center",
          sortable: true,
        },
        {
          name: "estatusSolicitud",
          label: "Estatus",
          field: "estatusSolicitud",
          align: "left",
          sortable: true,
        },
        { name: "acciones", label: "", field: "acciones", align: "right" },
      ],
    };
  },

  computed: {
    token() {
      return this.$store.state.usuario;
    },
    ruta() {
      return this.$store.state.rutaDescargas;
    },
    historial() {
      return this.$store.state[STORE_KEY] || [];
    },
  },

  created() {
    const hoy = moment();
    this.dtInicial = {
      fecha: hoy.clone().startOf("month").format("YYYY-MM-DD"),
      hora: "00:00:00",
    };
    this.dtFinal = {
      fecha: hoy.format("YYYY-MM-DD"),
      hora: hoy.format("HH:mm:ss"),
    };
    this.getHistorial();
    this.iniciarPolling();
  },

  beforeDestroy() {
    this.detenerPolling();
  },

  methods: {
    iniciarPolling() {
      this.detenerPolling();
      this.pollingTimer = setInterval(() => {
        const hayDescargando = (this.$store.state[STORE_KEY] || []).some(
          (x) => x.estatusSolicitud === "Descargando"
        );
        if (hayDescargando) this.getHistorial();
      }, 2 * 60 * 1000);
    },

    detenerPolling() {
      if (this.pollingTimer) {
        clearInterval(this.pollingTimer);
        this.pollingTimer = null;
      }
    },

    autoFechaFinal() {
      if (!this.dtInicial.fecha) return;
      const ultimoDia = moment(this.dtInicial.fecha)
        .endOf("month")
        .format("YYYY-MM-DD");
      this.dtFinal = { fecha: ultimoDia, hora: "23:59:59" };
    },

    async solicitar() {
      this.cargando = true;
      this.$q.loading.show({
        message: "<b>Generando solicitud de retenciones...</b>",
      });
      try {
        const payload = {
          tipo: this.tipo,
          fechaInicial: this.dtInicial.fecha + " " + this.dtInicial.hora,
          fechaFinal: this.dtFinal.fecha + " " + this.dtFinal.hora,
          RfcSolicitante: this.token.rfc,
          usuario: this.token.nombre,
        };
        const res = await axios.post(
          this.ruta +
            "Retenciones/PostSolicitudRetencion/erp_" +
            this.token.rfc,
          payload
        );

        this.pushHistorial({
          rfc: this.token.rfc,
          solicitud: res.data,
          fechaSolicitud: new Date(),
          tipo: this.tipo,
          fechaInicial: payload.fechaInicial,
          fechaFinal: payload.fechaFinal,
          numComprobantes: 0,
          estatusSolicitud: "Solicitud Realizada",
        });
        this.$q.notify({
          type: "positive",
          message: "Solicitud de retenciones creada correctamente.",
        });
      } catch (e) {
        this.$q.notify({
          type: "negative",
          message: e.response?.data || "Error al solicitar retenciones.",
        });
      } finally {
        this.cargando = false;
        this.$q.loading.hide();
      }
    },

    async getHistorial() {
      this.cargando = true;
      this.$q.loading.show({
        message: "<b>Cargando historial de retenciones...</b>",
      });
      try {
        const res = await axios.post(
          this.ruta +
            "Retenciones/GetHistorialRetenciones/erp_" +
            this.token.rfc
        );
        this.$store.state[STORE_KEY] = (res.data || []).sort(
          (a, b) => new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud)
        );
      } catch (e) {
        console.error(e);
      } finally {
        this.cargando = false;
        this.$q.loading.hide();
      }
    },

    async actualizar(item) {
      this.$q.loading.show({ message: "<b>Actualizando estatus...</b>" });
      try {
        const res = await axios.put(
          this.ruta +
            "Retenciones/PutActualizaEstatusRetencion/erp_" +
            this.token.rfc,
          { solicitud: item.solicitud, rfc: item.rfc }
        );
        const d = res.data;
        if (d.estadoSolicitud === "6")
          item.estatusSolicitud = "Solicitud Vencida";
        else if (d.estadoSolicitud === "4")
          item.estatusSolicitud = "Solicitud Errónea";
        else if (d.estadoSolicitud === "5") {
          item.estatusSolicitud =
            d.codigoEstadoSolicitud === "5004"
              ? "Información no Encontrada"
              : d.codigoEstadoSolicitud === "5002"
              ? "Límite de solicitudes alcanzado"
              : "Solicitud Rechazada";
        } else {
          if (d.idsPaquetes?.length) {
            item.solicitudPaquete = d.idsPaquetes[0];
            item.estatusSolicitud = "Listo para Descargar";
          } else {
            item.estatusSolicitud = "Procesando";
          }
        }
        item.numComprobantes = d.numeroCFDIs;
        this.updateRow(item);
      } catch (e) {
        console.error(e);
      } finally {
        this.$q.loading.hide();
      }
    },

    async descargar(item) {
      this.descargandoId = item.solicitud;
      this.$q.loading.show({
        message:
          "<b>Descargando retenciones...</b><br>Este proceso puede tardar varios minutos.",
      });
      try {
        const res = await axios.post(
          this.ruta + "Retenciones/DescargarRetencion/erp_" + this.token.rfc,
          {
            solicitud: item.solicitud,
            rfc: item.rfc,
            solicitudPaquete: item.solicitudPaquete,
            tipo: item.tipo,
          }
        );
        item.estatusSolicitud = res.data.error
          ? item.estatusSolicitud
          : "Descargado";

        await axios.post(
          this.ruta +
            "Retenciones/PostProcesarRetenciones/erp_" +
            this.token.rfc,
          {
            rfc: item.rfc,
            idSolicitud: item.solicitud,
            tipoDescarga: item.tipo,
          }
        );
        this.updateRow(item);
        this.$q.notify({
          type: "positive",
          message: "¡Retenciones descargadas correctamente!",
        });
      } catch (e) {
        await this.getHistorial();
        this.$q.notify({
          type: "negative",
          message: e.response?.data?.error || "Error al descargar retenciones.",
        });
      } finally {
        this.descargandoId = null;
        this.$q.loading.hide();
      }
    },

    pushHistorial(obj) {
      const arr = [...(this.$store.state[STORE_KEY] || []), obj];
      this.$store.state[STORE_KEY] = arr.sort(
        (a, b) => new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud)
      );
    },

    updateRow(item) {
      const lista = this.$store.state[STORE_KEY] || [];
      const idx = lista.findIndex((x) => x.solicitud === item.solicitud);
      if (idx >= 0) Object.assign(lista[idx], item);
      this.$store.state[STORE_KEY] = [...lista].sort(
        (a, b) => new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud)
      );
    },

    rowClass(row) {
      if (this.descargandoId === row.solicitud) return "dsc-row--loading";
      if (row.estatusSolicitud === "Descargado") return "dsc-row--done";
      return "";
    },

    statusClass(s) {
      if (!s) return "";
      if (s === "Descargando") return "dsc-status--downloading";
      if (s === "Descargado") return "dsc-status--done";
      if (s === "Listo para Descargar") return "dsc-status--ready";
      if (s.includes("Procesando")) return "dsc-status--processing";
      if (s === "Solicitud Realizada") return "dsc-status--sent";
      if (
        s.includes("Error") ||
        s.includes("Rechaz") ||
        s.includes("Vencid") ||
        s.includes("Límite")
      )
        return "dsc-status--error";
      return "dsc-status--neutral";
    },

    fd(v) {
      if (!v) return "—";
      moment.locale("es-mx");
      const d =
        typeof v === "string"
          ? new Date(v.replace("T", " ").replace("Z", ""))
          : v;
      return moment(d).format("DD/MM/YY HH:mm");
    },
  },
};
</script>

<style scoped>
.dsc-panel {
  font-family: "IBM Plex Sans", sans-serif;
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
.dsc-field--sm {
  min-width: 100px;
  max-width: 115px;
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
  animation: pulse 0.18s ease-in-out infinite alternate;
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