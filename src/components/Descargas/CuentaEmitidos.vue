<template>
  <div class="ce-root">
    <!-- DIALOG LOADING -->
    <q-dialog v-model="dialog" persistent transition-show="scale" transition-hide="scale">
      <q-card style="width: 100px; height: 110px" flat>
        <q-card-section>
          <div class="text-center">
            <q-spinner-cube color="blue" size="5.5em" />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- DIALOG VERIFICAR SAT -->
    <q-dialog v-model="dialogConciliaSat" transition-show="scale" transition-hide="scale">
      <q-card style="min-width: 460px">
        <q-card-section class="bg-primary text-white q-py-sm">
          <div class="text-subtitle1" style="font-weight: 600">
            {{ cabeceraConciliacionSat }}
          </div>
        </q-card-section>
        <q-card-section class="q-pa-sm">
          <q-table dense flat :data="itemsConciliaSat" :columns="columnsConciliaSat" row-key="tipo"
            :rows-per-page-options="[0]" :pagination.sync="pagination">
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="tipo" :props="props">{{ props.row.tipo }}</q-td>
                <q-td key="cuentaC" :props="props" class="text-right">{{
                  FormatoMiles(props.row.cuentaC)
                }}</q-td>
                <q-td key="cuentaS" :props="props" class="text-right">{{
                  FormatoMiles(props.row.cuentaS)
                }}</q-td>
                <q-td key="diferencia" :props="props" class="text-right">
                  <span :class="props.row.diferencia === 0 ? 'text-green-7' : 'text-red-7'
                    " style="font-weight: 600">
                    {{ FormatoMiles(props.row.diferencia) }}
                  </span>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-card-section>
        <!-- <q-card-actions align="center" class="q-pb-md column">
                    <div class="text-caption text-grey-6">Última consulta: {{ fechaConciliaSat }}</div>
                    <q-btn dense unelevated color="primary" icon="mdi-refresh" label="Consultar nuevamente"
                        class="q-mt-sm" @click="ConsultaSat" />
                </q-card-actions> -->
      </q-card>
    </q-dialog>

    <!-- ── FILTROS ── -->
    <div class="ce-filters">
      <div style="display: flex; align-items: flex-end; gap: 8px; flex-wrap: wrap">
        <div class="row">
          <div class="ce-title">Comprobantes Emitidos</div>
        </div>
      </div>
      <div class="row q-gutter-sm">
        <q-select dense outlined v-model="selectedAnio" :options="itemsAnios" style="width: 180px" hide-bottom-space />
        <q-btn dense unelevated color="green-1" text-color="green-9" icon="mdi-magnify" style="width: 180px"
          label="Consultar" @click="GetReporte" />

        <!-- <div v-if="totalAnual" class="ce-total-badge">
          Total {{ selectedAnio }}: {{ FormatoMiles(totalAnual) }}
        </div> -->
      </div>
    </div>

    <!-- ── PASOS ── -->
    <div class="ce-steps">
      <!-- PASO 1: SINCRONIZACIÓN -->
      <div class="ce-step">
        <div class="ce-step__header">
          <span class="ce-step__num ce-step__num--1">1</span>
          <div>
            <div class="ce-step__title">Sincronización</div>
            <div class="ce-step__desc">
              Clasifica los XML descargados en sus carpetas por tipo, año y mes.
            </div>
          </div>
        </div>
        <div class="ce-step__content">
          <div class="ce-step__status">
            <span :class="[
              'ce-dot',
              pendientes > 0 ? 'ce-dot--warn' : 'ce-dot--ok',
            ]"></span>
            <span :class="pendientes > 0 ? 'text-orange-9' : 'text-green-8'" style="font-size: 11px; font-weight: 500">
              {{ pendientes > 0 ? `${pendientes} XML pendientes por clasificar` : 'Sin archivos
              pendientes' }}
            </span>
          </div>
          <q-btn unelevated color="green-1" text-color="green-9" icon="mdi-folder-move-outline" label="Sincronizar"
            :loading="separando" :disable="pendientes === 0" @click="separarXmls" />
        </div>
      </div>

      <div class="ce-arrow">
        <q-icon name="mdi-chevron-right" size="20px" color="grey-4" />
      </div>

      <!-- PASO 2: CONCILIACIÓN -->
      <div class="ce-step">
        <div class="ce-step__header">
          <span class="ce-step__num ce-step__num--2">2</span>
          <div>
            <div class="ce-step__title">Conciliación</div>
            <div class="ce-step__desc">
              Lee los XML de las carpetas y guarda los comprobantes en el
              sistema.
            </div>
          </div>
        </div>
        <div class="ce-step__content">
          <div class="ce-step__status">
            <span class="ce-dot ce-dot--ok"></span>
            <span class="text-green-8" style="font-size: 11px; font-weight: 500">Listo para conciliar</span>
          </div>
          <div class="row q-col-gutter-sm" style="align-items: center">
            <div class="col-4">
              <q-select dense outlined v-model="selectedMes" :options="itemsMes" label="Mes" hide-bottom-space
                class="full-width" />
            </div>
            <div class="col-4">
              <q-btn unelevated color="green-1" text-color="green-9" icon="mdi-database-import" label="Conciliar mes"
                :loading="dialog" @click="Conciliar" class="full-width" />
            </div>
            <div class="col-4">
              <q-btn unelevated color="green-1" text-color="green-9" icon="mdi-database-sync" label="Todo el año"
                :loading="dialog" @click="ConciliarPeriodo" class="full-width" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── TABS TABLA / GRÁFICA ── -->
    <div class="ce-card">
      <q-tabs v-model="vistaTab" dense align="left" active-color="primary" indicator-color="primary" narrow-indicator
        class="q-px-sm">
        <q-tab name="tabla" icon="mdi-table" label="Resumen" />
        <q-tab name="grafica" icon="mdi-chart-bar" label="Gráfica" />
      </q-tabs>
      <q-separator />

      <q-tab-panels v-model="vistaTab" animated>
        <!-- TABLA -->
        <q-tab-panel name="tabla" class="q-pa-none">
          <q-table dense flat :data="itemsDescargas" :columns="columns" row-key="mes" :rows-per-page-options="[0]"
            :pagination.sync="pagination">
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="acciones" :props="props" auto-width>
                  <q-btn flat dense round color="green-9" icon="mdi-table" @click="ConciliaSat(props.row)">
                    <q-tooltip>Verificar contra el SAT</q-tooltip>
                  </q-btn>
                </q-td>
                <q-td key="mes" :props="props">{{ props.row.mes }}</q-td>
                <q-td key="ingreso" :props="props" class="text-right">{{
                  FormatoMiles(props.row.ingreso)
                }}</q-td>
                <q-td key="notasCredito" :props="props" class="text-right">{{
                  FormatoMiles(props.row.notasCredito)
                }}</q-td>
                <q-td key="complementoPago" :props="props" class="text-right">{{
                  FormatoMiles(props.row.complementoPago)
                }}</q-td>
                <q-td key="nomina" :props="props" class="text-right">{{
                  FormatoMiles(props.row.nomina)
                }}</q-td>
                <q-td key="total" :props="props" class="text-right" style="font-weight: 600">{{
                  FormatoMiles(props.row.total) }}</q-td>
              </q-tr>
              <q-tr v-if="props.rowIndex === itemsDescargas.length - 1"
                style="background:#eaf3de;border-top:2px solid #e2e6f0;">
                <q-td style="font-weight:700"></q-td>
                <q-td style="font-weight:700">TOTAL</q-td>
                <q-td class="text-right" style="font-weight:600">{{ FormatoMiles(totales.ingreso) }}</q-td>
                <q-td class="text-right" style="font-weight:600">{{ FormatoMiles(totales.notasCredito) }}</q-td>
                <q-td class="text-right" style="font-weight:600">{{ FormatoMiles(totales.complementoPago) }}</q-td>
                <q-td class="text-right" style="font-weight:600">{{ FormatoMiles(totales.nomina) }}</q-td>
                <q-td class="text-right" style="font-weight:700">{{ FormatoMiles(totales.total) }}</q-td>
                <q-td />
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>

        <!-- GRÁFICA -->
        <q-tab-panel name="grafica" class="q-pa-md">
          <chart-component :chartData="chartData" :chartTitle="charTitleE" />
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import ChartComponent from "../Graficas/ChartComponent.vue";

import { QSpinnerCube } from "quasar";

export default {
  name: "CuentaEmitidos",
  components: { ChartComponent },

  data() {
    return {
      vistaTab: "tabla",

      itemsAnios: [
        "2026",
        "2025",
        "2024",
        "2023",
        "2022",
        "2021",
        "2020",
        "2019",
        "2018",
      ],
      itemsMes: [
        { label: "Enero", value: 1 },
        { label: "Febrero", value: 2 },
        { label: "Marzo", value: 3 },
        { label: "Abril", value: 4 },
        { label: "Mayo", value: 5 },
        { label: "Junio", value: 6 },
        { label: "Julio", value: 7 },
        { label: "Agosto", value: 8 },
        { label: "Septiembre", value: 9 },
        { label: "Octubre", value: 10 },
        { label: "Noviembre", value: 11 },
        { label: "Diciembre", value: 12 },
      ],
      selectedAnio: 2026,
      selectedMes: null,

      dialog: false,
      separando: false,
      pendientes: 0,

      dataResult: null,
      chartData: null,
      charTitleE: "",

      columns: [
        {
          name: "acciones",
          align: "center",
          label: "SAT",
          field: "acciones",
          sortable: false,
        },
        {
          name: "mes",
          align: "left",
          label: "Mes",
          field: "mes",
          sortable: true,
        },
        {
          name: "ingreso",
          align: "right",
          label: "Ingresos",
          field: "ingreso",
          sortable: true,
        },
        {
          name: "notasCredito",
          align: "right",
          label: "Notas de crédito",
          field: "notasCredito",
          sortable: true,
        },
        {
          name: "complementoPago",
          align: "right",
          label: "Comp. de pago",
          field: "complementoPago",
          sortable: true,
        },
        {
          name: "nomina",
          align: "right",
          label: "Nómina",
          field: "nomina",
          sortable: true,
        },
        {
          name: "total",
          align: "right",
          label: "Total",
          field: "total",
          sortable: true,
        },
      ],
      itemsDescargas: [],
      pagination: { rowsPerPage: 0 },

      dialogConciliaSat: false,
      columnsConciliaSat: [
        {
          name: "tipo",
          align: "left",
          label: "Tipo",
          field: "tipo",
          sortable: true,
        },
        {
          name: "cuentaC",
          align: "right",
          label: "ContaGo",
          field: "cuentaC",
          sortable: true,
        },
        {
          name: "cuentaS",
          align: "right",
          label: "SAT",
          field: "cuentaS",
          sortable: true,
        },
        {
          name: "diferencia",
          align: "right",
          label: "Diferencia",
          field: "diferencia",
          sortable: true,
        },
      ],
      itemsConciliaSat: [],
      fechaConciliaSat: null,
      cabeceraConciliacionSat: "",
      mesConciliacion: 0,
    };
  },

  computed: {
    token() {
      return this.$store.state.usuario;
    },
    rutaAxios() {
      return this.$store.state.rutaMongoStore;
    },
    rutaDescargas() {
      return this.$store.state.rutaDescargas;
    },

    totalAnual() {
      return this.itemsDescargas.reduce((s, r) => s + (r.total || 0), 0);
    },
    totales() {
      return {
        ingreso: this.itemsDescargas.reduce((s, r) => s + r.ingreso, 0),
        notasCredito: this.itemsDescargas.reduce((s, r) => s + r.notasCredito, 0),
        complementoPago: this.itemsDescargas.reduce((s, r) => s + r.complementoPago, 0),
        nomina: this.itemsDescargas.reduce((s, r) => s + r.nomina, 0),
        total: this.itemsDescargas.reduce((s, r) => s + r.total, 0),
      }
    },
  },
  created() {
    this.GetReporte();
    this.GetPendientes();
  },

  methods: {
    // ── Paso 1: Sincronización ───────────────────────────────
    async GetPendientes() {
      try {
        const { data } = await axios.get(
          this.rutaDescargas + `Descargas/pendientes/${this.token.rfc}`
        );
        this.pendientes = data.pendientes;
      } catch (_) { }
    },

    async separarXmls() {
      this.separando = true;
      try {
        let respuesta = await axios.post(
          this.rutaDescargas + `Descargas/PostEncarpetaXML/${this.token.rfc}`
        );
        console.log(respuesta);
        this.$q.notify({
          type: "positive",
          message: "Archivos clasificados correctamente.",
        });
        await this.GetPendientes();
      } catch (err) {
        this.$q.notify({
          type: "negative",
          message:
            err?.response?.data?.error || "Error al clasificar los archivos.",
        });
      } finally {
        this.separando = false;
      }
    },

    // ── Paso 2: Conciliación ─────────────────────────────────

    async Conciliar() {
      if (!this.selectedMes) {
        this.$q.notify({
          type: "warning",
          message: "Selecciona un mes primero.",
        });
        return;
      }
      console.log(this.selectedMes);
      this.dialog = true;
      let mes = this.selectedMes.label.toLowerCase();
      try {
        let response = await axios.post(
          this.rutaDescargas +
          "/Descargas/PostComprobantesMongoAsync/" +
          this.token.rfc +
          "/" +
          this.selectedAnio +
          "/" +
          mes +
          "/Emitido"
        );
        console.log(response.data);
        this.dialog = false;
      } catch (error) {
        console.log(error);
        this.dialog = false;
      }
    },

    //  async ConciliarPeriodo() {
    //   for (const m of this.itemsMes) {
    //      const mes = m.label.toLowerCase()
    //        this.$q.loading.show({
    //            spinner: QSpinnerCube, spinnerColor: 'purple', spinnerSize: 140,
    //message: `Conciliando ${m.label}...`, messageColor: 'white'
    //         })
    //       try {
    //            await axios.post(
    //                `${this.rutaDescargas}Descargas/PostComprobantesMongoAsync/${this.token.rfc}/${this.selectedAnio}/${mes}/Emitido`)
    //         } catch (err) { console.error(err) }
    //   }
    //     this.$q.loading.hide()
    //    await this.GetReporte()
    //   this.$q.notify({ type: 'positive', message: 'Año completo conciliado.' })
    //  },

    async ConciliarPeriodo() {
      let meses = this.itemsMes;
      for (let element of meses) {
        let mes = element.label.toLowerCase();
        this.$q.loading.show({
          spinner: QSpinnerCube,
          spinnerColor: "purple",
          spinnerSize: 140,
          message: "Conciliando " + mes + "...",
          messageColor: "white",
        });
        console.log(mes);
        try {
          let response = await axios.post(
            this.rutaDescargas +
            "Descargas/PostComprobantesMongoAsync/" +
            this.token.rfc +
            "/" +
            this.selectedAnio +
            "/" +
            mes +
            "/Emitido"
          );
          console.log(response.data);
        } catch (error) {
          console.log(error);
          this.$q.loading.hide();
        }
      }
      this.$q.loading.hide();
    },

    // ── Reporte ──────────────────────────────────────────────
    async GetReporte() {
      this.dialog = true;
      this.itemsDescargas = [];
      try {
        const { data } = await axios.get(
          `${this.rutaAxios}Comprobante/GetCuentaComprobantesAsync/erp_${this.token.rfc}/${this.selectedAnio}`
        );
        for (const a of data) {
          a.total = a.ingreso + a.notasCredito + a.complementoPago + a.nomina;
        }
        this.dataResult = data;
        this.itemsDescargas = [...data];
        this.GetGrafica();
      } catch (err) {
        console.error(err);
      } finally {
        this.dialog = false;
      }
    },

    async GetGrafica() {
      const ingresos = this.dataResult.map((item) => item.ingreso);
      const nominas = this.dataResult.map((item) => item.nomina);
      const pagos = this.dataResult.map((item) => item.complementoPago);
      const notas = this.dataResult.map((item) => item.notasCredito);

      const sumaIngresos = this.dataResult.reduce(
        (acumulador, actual) => acumulador + actual.ingreso,
        0
      );
      const sumaNotas = this.dataResult.reduce(
        (acumulador, actual) => acumulador + actual.notasCredito,
        0
      );
      const sumaNominas = this.dataResult.reduce(
        (acumulador, actual) => acumulador + actual.nomina,
        0
      );
      const sumaPagos = this.dataResult.reduce(
        (acumulador, actual) => acumulador + actual.complementoPago,
        0
      );
      const sumaTotal = sumaIngresos + sumaNotas + sumaNominas + sumaPagos;

      let ObjIngresos = {
        label: "Ingresos: " + this.FormatoMiles(sumaIngresos),
        backgroundColor: "rgba(0, 163, 92, 0.5)",
        borderColor: "rgba(0, 163, 92)",
        borderWidth: 1,
        data: ingresos,
      };

      let ObjNomina = {
        label: "Nómina: " + this.FormatoMiles(sumaNominas),
        backgroundColor: "rgba(255, 148, 166, 0.5)",
        borderColor: "rgba(255, 148, 166)",
        borderWidth: 1,
        data: nominas,
      };

      let ObjPagos = {
        label: "Complementos de Pago: " + this.FormatoMiles(sumaPagos),
        backgroundColor: "rgba(255, 108, 55, 0.5)",
        borderColor: "rgba(255, 108, 55)",
        borderWidth: 1,
        data: pagos,
      };

      let ObjNotas = {
        label: "Notas de Crédito: " + this.FormatoMiles(sumaNotas),
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235)",
        borderWidth: 1,
        data: notas,
      };

      let chartDatas = {
        labels: [
          "ENERO",
          "FEBRERO",
          "MARZO",
          "ABRIL",
          "MAYO",
          "JUNIO",
          "JULIO",
          "AGOSTO",
          "SEPTIEMBRE",
          "OCTUBRE",
          "NOVIEMBRE",
          "DICIEMBRE",
        ],
        datasets: [],
      };
      chartDatas.datasets.push(ObjIngresos);
      chartDatas.datasets.push(ObjNomina);
      chartDatas.datasets.push(ObjPagos);
      chartDatas.datasets.push(ObjNotas);
      this.chartData = { ...chartDatas };

      console.log(this.chartData)
      this.charTitleE = "Emitidos: " + this.FormatoMiles(sumaTotal);
    },
    // ── Verificar SAT ────────────────────────────────────────
    async ConciliaSat(item) {
      this.$q.loading.show({
        spinner: QSpinnerCube,
        spinnerColor: "purple",
        spinnerSize: 140,
        message: "Consultando con la plataforma del SAT...",
        messageColor: "white",
      });
      const mesesIdx = [
        "ENERO",
        "FEBRERO",
        "MARZO",
        "ABRIL",
        "MAYO",
        "JUNIO",
        "JULIO",
        "AGOSTO",
        "SEPTIEMBRE",
        "OCTUBRE",
        "NOVIEMBRE",
        "DICIEMBRE",
      ];
      const año = this.selectedAnio;
      const mes = mesesIdx.indexOf(item.mes) + 1;

      this.itemsConciliaSat = [];
      this.cabeceraConciliacionSat = `Verificación SAT — ${item.mes} ${año}`;
      this.mesConciliacion = mes;

      const conciliacion = await this.GetConciliaSat(año, mes);
      const campos = ["ingreso", "notasCredito", "complementoPago", "nomina"];
      const lista = ["INGRESO", "EGRESO", "PAGO", "NÓMINA"];

      if (conciliacion) {
        lista.forEach((tipo, i) => {
          this.itemsConciliaSat.push({
            tipo,
            cuentaC: item[campos[i]],
            cuentaS: conciliacion[i].cantidad,
            diferencia: item[campos[i]] - conciliacion[i].cantidad,
          });
        });
        this.dialogConciliaSat = true;
      } else {
        this.$q.notify({
          type: "negative",
          position: "top-right",
          message:
            "Sin datos del SAT. Primero descargue el metadata del periodo.",
        });
      }
      this.$q.loading.hide();
    },

    async ConsultaSat() {
      this.$q.loading.show({
        spinner: QSpinnerCube,
        spinnerColor: "purple",
        spinnerSize: 140,
        message: "Consultando con la plataforma del SAT...",
        messageColor: "white",
      });
      const año = this.selectedAnio;
      const mes = this.mesConciliacion;
      const dia = new Date(año, mes, 0).getDate();
      const fI = `${año}-${mes}-01`;
      const fF = `${año}-${mes}-${dia}`;
      const item = [...this.itemsConciliaSat];
      this.itemsConciliaSat = [];

      const res = await this.GetConciliacionSat(mes, año, fI, fF);
      if (!res) {
        this.$q.notify({
          type: "negative",
          message: "Error al consultar. Intente nuevamente.",
        });
        this.$q.loading.hide();
        return;
      }
      const lista = ["INGRESO", "EGRESO", "PAGO", "NÓMINA"];
      lista.forEach((tipo, i) => {
        this.itemsConciliaSat.push({
          tipo,
          cuentaC: item[i].cuentaC,
          cuentaS: res[i].cantidad,
          diferencia: item[i].cuentaC - res[i].cantidad,
        });
      });
      this.$q.loading.hide();
    },

    async GetConciliaSat(año, mes) {
      try {
        const { data } = await axios.get(
          `${this.rutaDescargas}Descargas/GetConcilacionSatAsync/${this.token.rfc}/${año}/${mes}/Emitidos`
        );
        this.fechaConciliaSat = data.fechaConsulta;
        return data.detalle;
      } catch (_) {
        return null;
      }
    },

    async GetConciliacionSat(mes, año, fI, fF) {
      try {
        const { data } = await axios.get(
          `https://api-scrapper-a.contago.com.mx/Metadata/${fI}/${fF}/Emitidos/${this.token.rfc}`
        );
        const ingreso = data.ingreso || 0;
        const egreso = data.egreso || 0;
        const pago = data.pago || 0;
        const nomina = data["nómina"] || 0;
        if (ingreso + egreso + pago + nomina === 0) return null;
        const items = [
          { tipo: "Ingreso", cantidad: ingreso },
          { tipo: "Egreso", cantidad: egreso },
          { tipo: "Pago", cantidad: pago },
          { tipo: "Nomina", cantidad: nomina },
        ];
        await this.PostConciliaSat(mes, año, items);
        return items;
      } catch (err) {
        console.error(err);
        return null;
      }
    },

    async PostConciliaSat(mes, año, items) {
      try {
        await axios.post(
          `${this.rutaDescargas}Descargas/PostConcilacionSatAsync/${this.token.rfc}`,
          {
            año,
            mes,
            tipo: "Emitidos",
            fechaConsulta: new Date(),
            detalle: items,
          }
        );
      } catch (err) {
        console.error(err);
      }
    },

    FormatoMiles(value) {
      return (value || 0).toLocaleString("en-US");
    },
  },
};
</script>

<style scoped>
.ce-root {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  background: #f4f6fb;
  min-height: 100vh;
}

.ce-steps {
  display: flex;
  align-items: stretch;
  gap: 0;
  background: #fff;
  border: 0.5px solid #e2e6f0;
  border-radius: 10px;
  overflow: hidden;
}

.ce-step {
  flex: 1;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ce-step:first-child {
  border-right: 0.5px solid #e2e6f0;
}

.ce-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 2px;
}

.ce-step__header {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.ce-step__num {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
  margin-top: 1px;
}

.ce-step__num--1 {
  background: #e6f1fb;
  color: #0c447c;
}

.ce-step__num--2 {
  background: #eaf3de;
  color: #27500a;
}

.ce-step__title {
  font-size: 13px;
  font-weight: 600;
  color: #0f1623;
  line-height: 1.2;
}

.ce-step__desc {
  font-size: 11px;
  color: #7b86a0;
  line-height: 1.4;
  margin-top: 2px;
}

.ce-step__content {
  padding-left: 32px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ce-step__status {
  display: flex;
  align-items: center;
  gap: 5px;
}

.ce-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.ce-dot--ok {
  background: #639922;
}

.ce-dot--warn {
  background: #ef9f27;
}

.ce-filters {
  background: #fff;
  border: 0.5px solid #e2e6f0;
  border-radius: 10px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.ce-flbl {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #7b86a0;
  margin-bottom: 3px;
}

.ce-total-badge {
  background: #eaf3de;
  color: #27500a;
  font-size: 20px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
}

.ce-title {
  color: #27500a;
  font-size: 20px;
  font-weight: 600;
  padding: 4px 10px;
}

.ce-card {
  background: #fff;
  border: 0.5px solid #e2e6f0;
  border-radius: 10px;
  overflow: hidden;
}
</style>
