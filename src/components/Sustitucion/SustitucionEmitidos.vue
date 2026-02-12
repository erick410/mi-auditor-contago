<template>
  <div class="q-pa-md">
    <div class="row no-wrap items-center q-mt-sm q-pa-sm">
      <q-space />
      <!-- FECHA INICIAL -->
      <q-input
        v-model="fehaIMasked"
        label="Fecha Inicial"
        class="q-mr-sm"
        name="event"
        outlined
        dense
      >
        <q-popup-proxy
          ref="qDateProxy"
          transition-show="scale"
          transition-hide="scale"
        >
          <q-date v-model="fechaI" @input="UltimoDiaMes">
            <div class="row items-center justify-end">
              <q-btn v-close-popup label="Ok" color="primary" flat />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-input>
      <!-- FECHA FINAL -->
      <q-input
        v-model="fechaFMasked"
        label="Fecha Final"
        class="q-mr-xs"
        outlined
        dense
      >
        <q-popup-proxy
          ref="qDateProxy"
          transition-show="scale"
          transition-hide="scale"
        >
          <q-date v-model="fechaF" today-btn>
            <div class="row items-center justify-end">
              <q-btn v-close-popup label="Ok" color="primary" flat />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-input>

      <q-btn
        push
        color="amber-9"
        @click="GetEmitidos"
        icon="mdi-text-box-search-outline"
        rounded
        flat
        size="18px"
        padding="xs"
      >
        <q-tooltip
          transition-show="flip-right"
          transition-hide="flip-left"
          content-style="font-size: 14px"
          :offset="[10, 10]"
          >Consultar</q-tooltip
        >
      </q-btn>
      <q-space />
    </div>

    <br />

    <q-dialog v-model="dialogEstatusSat" persistent transition-show="scale" transition-hide="scale">
      <q-card class="my-card">
          <q-toolbar>                    
            <q-toolbar-title>Resultado consulta SAT</q-toolbar-title>
          </q-toolbar>
          <q-separator color="primary" inset size="4px" />
          <q-card-section>
              <div class="row q-col-gutter-sm">
                  <div>                            
                      {{validaEstatus.rfc}} | {{validaEstatus.nombre}}
                  </div>
                  <div>
                      {{validaEstatus.folioFiscal}}
                  </div>
                  <div class="col-12">
                      <q-input readonly dense outlined v-model="validaEstatus.efossat" label="EFO" :label-color="colorEfo">                                
                      </q-input>
                  </div>
                  <div class="col-12">
                      <q-input readonly dense outlined v-model="validaEstatus.estadoSAT" label="Estatus" :label-color="colorEstatus">                                
                      </q-input>
                  </div>
                  <div class="col-12">
                      <q-input readonly dense outlined v-model="validaEstatus.estatusCancelacionSAT" label="Estatus Cancelación" :label-color="colorEstatus">                                
                      </q-input>
                  </div>
              </div>
          </q-card-section>
          <q-card-actions vertical>
              <q-btn color="red" v-if="validaEstatus.estadoSAT!='Cancelado'" v-close-popup>Cerrar</q-btn>
              <q-btn color="red" v-if="validaEstatus.estadoSAT=='Cancelado'" @click="AplicaCancelacion()">Aplicar cancelación en el sistema</q-btn>
            </q-card-actions>
      </q-card>
  </q-dialog>

    <q-table
      title="CFDI (Emitidos)"
      :pagination.sync="pagination"
      :data="itemsEmitidos"
      :columns="columns"
      row-key="mes"
      :rows-per-page-options="[0]"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="Acciones" auto-width>
            <template v-if="props.row.folioFiscalO != 'No encontrado'" >
            <!-- <q-btn
              keysize="sm"
              color="blue-9"
              round
              dense
              @click="EstatusSat(props.row)"
              icon="mdi-note-search"
              class="q-pa-xs"
            >
              <q-tooltip> Estatus SAT </q-tooltip>
            </q-btn> -->
            <q-btn
              keysize="sm"
              color="orange"
              round
              dense
              @click="CambiarFecha(props.row)"
              icon="mdi-calendar-edit"
              class="q-ml-md q-pa-xs"
            >
              <q-tooltip> Cambiar Fecha </q-tooltip>
            </q-btn>
          </template>
          </q-td>

          <q-td key="rfc" :props="props">{{ props.row.rfc }}</q-td>
          <q-td key="nombre" :props="props">{{ props.row.nombre }}</q-td>
          <q-td key="fecha" :props="props">{{ formatDate(props.row.fecha) }}</q-td>
          <q-td key="total" :props="props">{{ props.row.total }}</q-td>
          <q-td key="tipoComprobante" :props="props">{{
            props.row.tipoComprobante
          }}</q-td>
          <q-td key="folioFiscal" :props="props">{{
            props.row.folioFiscal
          }}</q-td>
          <q-td key="estatus" :props="props">{{
            props.row.estatus
          }}</q-td>
          <q-td key="rfcO" :props="props">{{ props.row.rfcO }}</q-td>
          <q-td key="nombreO" :props="props">{{ props.row.nombreO }}</q-td>
          <q-td key="fechaO" :props="props">{{ formatDate(props.row.fechaO) }}</q-td>
          <q-td key="totalO" :props="props">{{ props.row.totalO }}</q-td>
          <q-td key="tipoComprobanteO" :props="props">{{
            props.row.tipoComprobanteO
          }}</q-td>
          <q-td key="folioFiscalO" :props="props">{{
            props.row.folioFiscalO
          }}</q-td>
          <q-td key="estatusO" :props="props">{{
            props.row.estatusO
          }}</q-td>
        </q-tr>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script>
import axios from "axios";
import {
  format,
  lastDayOfMonth,
  differenceInDays,
  parseISO,
  utcToZonedTime,
} from "date-fns";
import * as XLSX from "xlsx";
import { QSpinnerCube } from "quasar";
import moment from "moment";

export default {
  components: {
  },
  data() {
    return {
      columns: [
        {
          name: "Acciones",
          align: "center",
          label: "Acciones",
          field: "Acciones",
          sortable: true,
        },
        {
          name: "rfc",
          align: "center",
          label: "RFC",
          field: "rfc",
          sortable: true,
          classes: 'bg-green-1 text-black'
        },
        {
          name: "nombre",
          align: "left",
          label: "Nombre",
          field: "nombre",
          sortable: true,
          classes: 'bg-green-1 text-black'
        },
        {
          name: "fecha",
          align: "right",
          label: "Fecha",
          field: "fecha",
          sortable: true,
          classes: 'bg-green-1 text-black'
        },
        {
          name: "total",
          align: "right",
          label: "Total",
          field: "total",
          sortable: true,
          classes: 'bg-green-1 text-black'
        },
        {
          name: "tipoComprobante",
          align: "right",
          label: "Tipo Comprobante",
          field: "tipoComprobante",
          sortable: true,
          classes: 'bg-green-1 text-black'
        },
        {
          name: "folioFiscal",
          align: "right",
          label: "Folio Fiscal",
          field: "folioFiscal",
          sortable: true,
          classes: 'bg-green-1 text-black'
        },
        {
          name: "estatus",
          align: "right",
          label: "Estatus",
          field: "estatus",
          sortable: true,
          classes: 'bg-green-1 text-black'
        },
        {
          name: "rfcO",
          align: "right",
          label: "RFC Origen",
          field: "rfcO",
          sortable: true,
          classes: 'bg-light-blue-1 text-black'
        },
        {
          name: "nombreO",
          align: "right",
          label: "Nombre Origen",
          field: "nombreO",
          sortable: true,
          classes: 'bg-light-blue-1 text-black'
        },
        {
          name: "fechaO",
          align: "right",
          label: "Fecha Origen",
          field: "fechaO",
          sortable: true,
          classes: 'bg-light-blue-1 text-black'
        },
        {
          name: "totalO",
          align: "right",
          label: "Total Origen",
          field: "totalO",
          sortable: true,
          classes: 'bg-light-blue-1 text-black'
        },
        {
          name: "tipoComprobanteO",
          align: "right",
          label: "Tipo Comprobante Origen",
          field: "tipoComprobanteO",
          sortable: true,
          classes: 'bg-light-blue-1 text-black'
        },
        {
          name: "folioFiscalO",
          align: "right",
          label: "Folio Fiscal Origen",
          field: "folioFiscal0",
          sortable: true,
          classes: 'bg-light-blue-1 text-black'
        },
        {
          name: "estatusO",
          align: "right",
          label: "Estatus Origen",
          field: "estatusO",
          sortable: true,
          classes: 'bg-light-blue-1 text-black'
        },
      ],
      itemsEmitidos: [],
      pagination: {
        rowsPerPage: 0,
      },

      // FECHAS
      fechaI: new Date(),
      fechaF: new Date(),

      // Estatus sat
      dialogEstatusSat: false,
      validaEstatus: {},
      colorEfo: "green",
      colorEstatus: "green",
    };
  },
  computed: {
    token() {
      return this.$store.state.usuario;
    },

    rutaAxios() {
      return this.$store.state.rutaMongoStore;
    },
    fehaIMasked() {
      moment.locale("es-mx");
      return this.fechaI ? moment(this.fechaI).format("DD/MMMM/yyyy") : "";
    },

    fechaFMasked() {
      moment.locale("es-mx");
      return this.fechaF ? moment(this.fechaF).format("DD/MMMM/yyyy") : "";
    },
  },
  created() {
    this.GetEmitidos();
  },
  methods: {
    async GetEmitidos() {
      this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'white', spinnerSize: 100, message: 'Consultando ingresos..', })
      let fI = moment(this.fechaI).format("YYYY-MM-DD");
      let fF = moment(this.fechaF).format("YYYY-MM-DD");

      try {
        const curl = `${this.rutaAxios}Consultas/GetReporteSustitucionAsync/${this.token.rfc}/comprobantes_emitidos/${fI}/${fF}`;
        let response = await axios.get(curl);
        this.itemsEmitidos = [...response.data];
        this.$q.loading.hide()
      } catch {
        console.log(error);
        this.$q.loading.hide()
      }
    },

    FormatCurrency(value) {
      return value.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      });
    },

    FormatoMiles(value) {
      return value.toLocaleString("en-US");
    },

    formatDate(value) {
      let fecha_ = value.replace("T", " ");
      let fecha_1 = fecha_.replace("Z", " ");
      let listo = new Date(fecha_1);
      moment.locale("es-mx");
      return moment(listo).format("DD-MMMM-YYYY HH:mm:ss");
    },

    async EstatusSat(item) {
      this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'red-8', spinnerSize: 140, message: 'Validando estatus en plataforma del SAT...' })
        try{
            this.validaEstatus = {
              efossat: "",
              estadoSAT: "",
              estatusCancelacionSAT: "",
              rfc: "",
              nombre: "",
              folioFiscal: "",
              tipoComprobante: ""
            };

            const curl =`${this.rutaAxios}Comprobante/GetEstatusSatAsync/${this.token.rfc}/${item.rfc}/${item.totalO}/${item.folioFiscalO}`
            console.log(curl);
            
            let response = await axios.get(curl); 
            console.log(response.data);

            this.validaEstatus.efossat = response.data.efossat;
            this.validaEstatus.estadoSAT = response.data.estadoSAT;
            this.validaEstatus.estatusCancelacionSAT = response.data.estatusCancelacionSAT;
          
            if(response.data.efossat === "EL RFC NO ESTA LISTA DENTRO DE LA LISTA DE 69B"){
                this.colorEfo = "green";
            }else{
                this.colorEfo = "red";
            }

            if(response.data.estadoSAT === "Cancelado"){
                this.colorEstatus = "red";
            }else{
                this.colorEstatus = "green";
            }

            this.validaEstatus.rfc = item.rfc;
            this.validaEstatus.nombre = item.nombre;
            this.validaEstatus.folioFiscal = item.folioFiscal;
            this.validaEstatus.tipoComprobante = item.tipoComprobante;
            this.dialogEstatusSat = true;
        }catch(error){
            console.log(error)
        }
        this.$q.loading.hide()
    },
    async CambiarFecha(item) {
      try{
        console.log(item)
        this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'white', spinnerSize: 100, message: 'Aplicando cambios..', })
        const oSustitucion = {
          folioFiscalActual: item.folioFiscal,
          folioFiscalOrigen: item.folioFiscalO,
          fechaActual: item.fecha,
          fechaOrigen: item.fechaO,
        };
        const curl = `${this.rutaAxios}Consultas/PutFechaSustitucionAsync/${this.token.rfc}/comprobantes_emitidos`;
        const response = await axios.put(curl, oSustitucion);
        const indice = this.itemsEmitidos.findIndex(x => x.folioFiscal === item.folioFiscal);
        this.itemsEmitidos.splice(indice, 1)
        this.$q.loading.hide()
      }catch(error){
        console.log(error);
        this.$q.loading.hide()
      }
    },

    UltimoDiaMes() {
      const fecha = new Date(this.fechaI);
      const ultimoDiaDelMes = lastDayOfMonth(fecha);
      const fechaFormateada = format(ultimoDiaDelMes, "yyyy-MM-dd");
      this.fechaF = fechaFormateada;
    },

  },
};
</script>
