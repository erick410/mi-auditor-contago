<template>
      <div class="q-pa-lg">
            <div class="row no-wrap justify-between q-mb-md" >
              <div class="text-bold  text-h5">
                Reporte de Impuestos
              </div>
           

              <q-btn
                  @click="runAll"
                  dense
                  color="primary"
                  class="q-ml-md q-px-xl q-py-xs btn-redondeado bg-red-5"
                >
                  <q-icon name="download" left size="sm" />
                  Consultar información
                </q-btn>
            </div>
            

              <div v-for="(task, index) in tasks" :key="index" class="q-mb-md">
                <div class="text-subtitle1">
                  {{ task.title }}
                </div>

                <div class="row items-center ">
                  <div class="col-12 row no-wrap" >
                    <q-linear-progress class="q-mr-md"
                      :value="task.progress"
                      :color="
                        task.status === 'success'
                          ? 'green'
                          : task.status === 'error'
                          ? 'red'
                          : 'primary'
                      "
                      rounded
                      striped
                      size="20px"
                    />
                    <q-btn round 
                      v-if="task.status !== 'loading'"
                      
                      :icon="task.status === 'error' ? 'mdi-update' : 'mdi-update'"
                      color="primary"
                      @click="runTask(index)"
                      style="margin-top:-10px"
                    />

                    <q-spinner v-else color="primary" size="24px" />
                  </div>

                  <!-- <div class="col">
                    <q-btn round 
                      v-if="task.status !== 'loading'"
                      
                      :icon="task.status === 'error' ? 'mdi-update' : 'mdi-update'"
                      color="primary"
                      @click="runTask(index)"
                    />

                    <q-spinner v-else color="primary" size="24px" />
                  </div> -->
                </div>
              </div>

              <div class="row no-wrap justify-between q-mb-md" >
              <div class="text-bold  text-h5">
                
              </div>
           

              <q-btn
                  @click="GetReportePMPDF()"
                  dense
                  color="primary"
                  class="q-ml-md q-px-xl q-py-xs btn-redondeado bg-red-5"
                >
                  <q-icon name="download" left size="sm" />
                  Generar PDF
                </q-btn>
            </div>
            </div>
</template>
<script>
import { ref } from "vue";
import axios from "axios";
import moment from "moment";
import { startOfMonth, endOfMonth, format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { QSpinnerCube } from "quasar";
import { generarReporte } from "../../Pdf/ReportePagosMensuales.js";
import logo from "@/assets/logo_contago_sin_fondo.png";
export default {
    components: {
    
  },
    data(){
        return {
            dataComprobantes: [],
      dataIvaRetenido: [],
      dataSueldos: [],
      dataAsimilados: [],
      dataOtros: [],
      dataHonorarios: [],
      dataArrendamientos: [],
      añosRegimen: [],
      columns: [],

      regimenSeleccionado: null,
      regimenSeleccionadoClave: "",
      tipoPersona: "",
      civiles: "NO",
      añosRegimen: [],

      columns: [],
      dataComprobantesP: [],
      itemsReporte: [],


      tasks: [
        {
          title: "Reporte IVA",
          progress: 0,
          status: "idle",
          run: () => this.GetReporteIVA(),
        },
        {
          title: "Retenciones IVA",
          progress: 0,
          status: "idle",
          run: () => this.GetReporteRetencionesIVA(),
        },
        {
          title: "Nómina / ISR",
          progress: 0,
          status: "idle",
          run: () => this.GetReporteNomina(),
        },
        {
          title: "Reporte ISR",
          progress: 0,
          status: "idle",
          run: () => this.GetReporteIsr(),
        },
        {
          title: "Pagos provisionales ISR",
          progress: 0,
          status: "idle",
          run: () => this.GetReportePagosProvisionales(),
        },
        {
          title: "Uso de CFDI",
          progress: 0,
          status: "idle",
          run: () => this.GetReporteUsoCFDI(),
        },
      ],
        }
    },
    computed: {
            token() {
                return this.$store.state.usuario;
            },
            rutaAxios() {
                return this.$store.state.rutaMongoStore
            },
        },
        created() {

        },

        methods: {

    // GENERAR REPORTE PAGOS MENSUALES
    async GetReportePMPDF() {
      this.$q.loading.show({
        spinner: QSpinnerCube,
        spinnerColor: "red-8",
        spinnerSize: 140,
        message: "Generando PDF...",
      });
      const base64Logo = await this.convertToBase64(logo);
      // REPORTE DE IVA
      // await this.GetReporteIVA();
      // // RETENCIONES DE IVA
      // await this.GetReporteRetencionesIVA();
      // // RETENCIONES DE ISR
      // await this.GetReporteNomina();
      // await this.GetReporteIsr();
      // // PAGOS PROVISIONALES DE ISR
      // await this.GetReportePagosProvisionales();
      // // USO DEL CFDI
      // await this.GetReporteUsoCFDI();
      await generarReporte(
        this.dataComprobantes,
        this.dataIvaRetenido,
        this.dataSueldos,
        this.dataAsimilados,
        this.dataOtros,
        this.dataHonorarios,
        this.dataArrendamientos,
        this.dataComprobantesP,
        this.columns,
        this.itemsReporte,
        this.$store.state.empresaStore.nombre,
        base64Logo
      );
      this.$q.loading.hide();

    },

    // GET REPORTE DE IVA
    async GetReporteIVA() {
      this.$q.loading.show({
        spinner: QSpinnerCube,
        spinnerColor: "red-8",
        spinnerSize: 140,
        message: "Gerando reporte de IVA...",
      });
      if (parseInt(this.selectedAnio) < 2024) {
        const ivaCargo = await this.GetIvaTrasladado();
        await this.GetReporteIva(ivaCargo);
      } else {
        await this.GetReporteIva2024();
      }
      this.$q.loading.hide();

    },
    async GetReporteIva(ivaCargo) {
      try {
        // this.columns = [...this.columnsDefault]
        this.dataComprobantes = [];
        let ivaAcreditable = await this.GetIvaAcreditado();
        let ivaRetenido = await this.GetIvaRetenido();
        let comparativa = await this.GetComparativaIva(
          this.selectedAnio,
          "IVA"
        );
        let ObjIva = {};
        for (let x = 0; x < this.selectedMesF.value; x++) {
          ObjIva.año = this.selectedAnio;
          ObjIva.mes = ivaCargo[x].mes;

          ObjIva.baseIvaTrasladado = ivaCargo[x].baseIva;
          ObjIva.importeIvaTrasladado = ivaCargo[x].importeIva;
          ObjIva.detallesTrasladado = ivaCargo[x].detalles;

          ObjIva.baseIvaAcreditado = ivaAcreditable[x].baseIva;
          ObjIva.importeIvaAcreditado = ivaAcreditable[x].importeIva;
          ObjIva.detallesAcreditado = ivaAcreditable[x].detalles;

          ObjIva.ivaRetenidoAnterior = ivaRetenido[x].importeIva;
          ObjIva.ivaRetenido = ivaRetenido[x + 1].importeIva;

          let ivaCargo_ = ivaCargo[x].importeIva;
          let ivaAcreditado_ = ivaAcreditable[x].importeIva;
          let ivaRetenido_ = ivaRetenido[x].importeIva;
          let ivaRetenidoAnterior_ = ivaRetenido[x + 1].importeIva;
          let calculo =
            ivaCargo_ - ivaAcreditado_ - ivaRetenido_ + ivaRetenidoAnterior_;
          if (calculo > 0) {
            ObjIva.ivaCargo = calculo;
            ObjIva.ivaFavor = 0;
          } else {
            ObjIva.ivaCargo = 0;
            ObjIva.ivaFavor = calculo * -1;
          }

          //COMPARATIVA
          ObjIva.cargoRegistrado = comparativa[x].ivaCargo;
          ObjIva.favorRegistrado = comparativa[x].ivaFavor;

          let comparativa_ =
            (ObjIva.ivaCargo -
              ObjIva.ivaFavor -
              ObjIva.cargoRegistrado +
              ObjIva.favorRegistrado) *
            -1;
          if (comparativa_ != 0) {
            comparativa_ = comparativa_ * -1;
          }
          ObjIva.comparativa = comparativa_;

          this.dataComprobantes.push(ObjIva);
          ObjIva = {};
        }

        let objetoTotales = {
          año: "Total",
          mes: "",

          baseIvaTrasladado: this.dataComprobantes.reduce(
            (acumulador, objeto) => acumulador + objeto.baseIvaTrasladado,
            0
          ),
          importeIvaTrasladado: this.dataComprobantes.reduce(
            (acumulador, objeto) => acumulador + objeto.importeIvaTrasladado,
            0
          ),
          detallesTrasladado: [],

          baseIvaAcreditado: this.dataComprobantes.reduce(
            (acumulador, objeto) => acumulador + objeto.baseIvaAcreditado,
            0
          ),
          importeIvaAcreditado: this.dataComprobantes.reduce(
            (acumulador, objeto) => acumulador + objeto.importeIvaAcreditado,
            0
          ),
          detallesAcreditado: [],

          ivaRetenidoAnterior: this.dataComprobantes.reduce(
            (acumulador, objeto) => acumulador + objeto.ivaRetenidoAnterior,
            0
          ),
          ivaRetenido: this.dataComprobantes.reduce(
            (acumulador, objeto) => acumulador + objeto.ivaRetenido,
            0
          ),
          ivaCargo: this.dataComprobantes.reduce(
            (acumulador, objeto) => acumulador + objeto.ivaCargo,
            0
          ),
          ivaFavor: this.dataComprobantes.reduce(
            (acumulador, objeto) => acumulador + objeto.ivaFavor,
            0
          ),
          cargoRegistrado: this.dataComprobantes.reduce(
            (acumulador, objeto) => acumulador + objeto.cargoRegistrado,
            0
          ),
          favorRegistrado: this.dataComprobantes.reduce(
            (acumulador, objeto) => acumulador + objeto.favorRegistrado,
            0
          ),
          comparativa: this.dataComprobantes.reduce(
            (acumulador, objeto) => acumulador + objeto.comparativa,
            0
          ),
        };

        this.dataComprobantes.push(objetoTotales);
      } catch (error) {
         console.log(this.dataComprobantes);
      this.$q.loading.hide();
      console.log(error);
      }
    },
    async GetReporteIva2024() {
      this.dataComprobantes = [];
      const rfc = this.token.rfc;
      const fechaI = `${this.selectedAnio}-01-01`;
      const fechaF = `${this.selectedAnio}-${this.selectedMesF.value}-01`;

      const emitidos =
        (await this.GetReporteIvaCompletoEmitidos(rfc, fechaI, fechaF)) || [];
      const recibidos =
        (await this.GetReporteIvaCompletoRecibidos(rfc, fechaI, fechaF)) || [];
      const ivaRet = (await this.GetIvaRetenido()) || [];
      const comp =
        (await this.GetComparativaIva(this.selectedAnio, "IVA")) || [];
      // this.columns = [...this.columnsDefault];
      const meses = [
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
      console.log(this.selectedMesF);

      for (let x = 0; x <= this.selectedMesF.value; x++) {
        console.log(meses[x]);
        const mes = meses[x];
        console.log(mes);

        const baseIvaTrasladado = emitidos
          .filter((item) => item.mes?.toUpperCase() === mes)
          .reduce((acc, item) => acc + (item.baseIva || 0), 0);

        const importeIvaTrasladado = emitidos
          .filter((item) => item.mes?.toUpperCase() === mes)
          .reduce((acc, item) => acc + (item.importeIva || 0), 0);

        const baseIvaAcreditado = recibidos
          .filter((item) => item.mes?.toUpperCase() === mes)
          .reduce((acc, item) => acc + (item.baseIva || 0), 0);

        const importeIvaAcreditado = recibidos
          .filter((item) => item.mes?.toUpperCase() === mes)
          .reduce((acc, item) => acc + (item.importeIva || 0), 0);

        console.log("Retenido", ivaRet);
        const ivaRetenido = ivaRet
          .filter((item) => item.mes?.toUpperCase() === mes)
          .reduce((acc, item) => acc + (item.importeIva || 0), 0);

        const ivaRetenidoAnterior = ivaRet[x]?.importeIva || 0;

        let ivaCargo = 0;
        let ivaFavor = 0;
        const calculo =
          importeIvaTrasladado -
          importeIvaAcreditado +
          ivaRetenido -
          ivaRetenidoAnterior;

        if (calculo > 0) {
          ivaCargo = calculo;
          ivaFavor = 0;
        } else {
          ivaCargo = 0;
          ivaFavor = Math.abs(calculo);
        }

        const cargoRegistrado = comp
          .filter((item) => item.mes?.toUpperCase() === mes)
          .reduce((acc, item) => acc + (item.ivaCargo || 0), 0);

        const favorRegistrado = comp
          .filter((item) => item.mes?.toUpperCase() === mes)
          .reduce((acc, item) => acc + (item.ivaFavor || 0), 0);

        let comparativa =
          (ivaCargo - ivaFavor - cargoRegistrado + favorRegistrado) * -1;
        if (comparativa !== 0) {
          comparativa *= -1;
        }

        const objIva = {
          año: this.selectedAnio,
          mes: mes,
          baseIvaTrasladado: baseIvaTrasladado,
          importeIvaTrasladado: importeIvaTrasladado,
          accionesT: [],
          baseIvaAcreditado: baseIvaAcreditado,
          importeIvaAcreditado: importeIvaAcreditado,
          accionesA: [],
          ivaRetenido: ivaRetenido,
          ivaRetenidoAnterior: ivaRetenidoAnterior,
          ivaCargo: ivaCargo,
          ivaFavor: ivaFavor,
          cargoRegistrado: cargoRegistrado,
          favorRegistrado: favorRegistrado,
          comparativa: comparativa,
        };

        console.log(objIva);
        this.dataComprobantes.push(objIva);
      }

      this.dataComprobantes.pop();
      // Asegura que existan datos
      if (this.dataComprobantes.length > 0) {
      } else {
        console.warn("No hay datos por mostrar.");
      }
    },
    async GetIvaTrasladado() {
      try {
        let fechaI = this.selectedAnio + "-" + "01" + "-01";
        let fechaF = this.selectedAnio + "-" + this.selectedMesF.value + "-01";
        let response = await axios.get(
          this.rutaAxios +
            "Ingresos/GetReporteIvaAsync/erp_" +
            this.token.rfc +
            "/" +
            fechaI +
            "/" +
            fechaF,
          {
            timeout: 240000, // 120 segundos
          }
        );
        this.$q.loading.hide();
        return response.data;
      } catch (error) {
        console.log(error);
        this.$q.loading.hide();
      }
    },
    async GetIvaAcreditado() {
      try {
        let fechaI = this.selectedAnio + "-" + "01" + "-01";
        let fechaF = this.selectedAnio + "-" + this.selectedMesF.value + "-01";

        let response = await axios.get(
          this.rutaAxios +
            "Gastos/GetReporteIvaAsync/erp_" +
            this.token.rfc +
            "/" +
            fechaI +
            "/" +
            fechaF
        );
        return response.data;
      } catch (error) {
        this.$q.loading.hide();
        console.log(error);
      }
    },
    async GetIvaRetenido() {
      try {
        let añoSel = this.selectedAnio - 1;
        let fechaI = añoSel + "-" + "12" + "-01";
        let fechaF = this.selectedAnio + "-" + this.selectedMesF.value + "-01";

        let response = await axios.get(
          this.rutaAxios +
            "Gastos/GetReporteIvaRetenidoAsync/erp_" +
            this.token.rfc +
            "/" +
            fechaI +
            "/" +
            fechaF
        );
        return response.data;
      } catch (error) {
        this.$q.loading.hide();
        console.log(error);
      }
    },
    async GetReporteIvaCompletoEmitidos(rfc, fechaI, fechaF) {
      try {
        const response = await axios.get(
          this.rutaAxios +
            `Ingresos/GetReporteIvaCompletoAsync/${rfc}/${fechaI}/${fechaF}`
        );
        return response.data;
      } catch (error) {
      this.$q.loading.hide();
      console.log(error);
        return null;
      }
    },
    async GetReporteIvaCompletoRecibidos(rfc, fechaI, fechaF) {
      try {
        const response = await axios.get(
          this.rutaAxios +
            `Gastos/GetReporteIvaCompletoAsync/${rfc}/${fechaI}/${fechaF}`
        );
        return response.data;
      } catch (error) {
      this.$q.loading.hide();
      console.log(error);
        return null;
      }
    },
    async GetIvaTrasladado() {
      try {
        let fechaI = this.selectedAnio + "-" + "01" + "-01";
        let fechaF = this.selectedAnio + "-" + this.selectedMesF.value + "-01";
        let response = await axios.get(
          this.rutaAxios +
            "Ingresos/GetReporteIvaAsync/erp_" +
            this.token.rfc +
            "/" +
            fechaI +
            "/" +
            fechaF,
          {
            timeout: 240000, // 120 segundos
          }
        );
        return response.data;
      } catch (error) {
      this.$q.loading.hide();
      console.log(error);
      }
    },
    async GetComparativaIva(año, tipo) {
      let respuesta = [
        { mes: "ENERO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "FEBRERO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "MARZO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "ABRIL", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "MAYO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "JUNIO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "JULIO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "AGOSTO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "SEPTIEMBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "OCTUBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "NOVIEMBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "DICIEMBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
      ];
      try {
        let response = await axios.get(
          this.rutaAxios +
            "Comparativa/GetComparativaAsync/erp_" +
            this.token.rfc +
            "/" +
            año +
            "/" +
            tipo
        );
        respuesta = response.data.comparativa;
        return respuesta;
      } catch (error) {
        console.log(error);
      this.$q.loading.hide();
      return respuesta;
      }
    },

    // RETENCIONES DE IVA
    async GetReporteRetencionesIVA() {
      this.$q.loading.show({
        spinner: QSpinnerCube,
        spinnerColor: "red-8",
        spinnerSize: 140,
        message: "Gerando reporte Retenciones de IVA...",
      });
      await this.GetReporteIVARetenido();
      console.log(this.dataIvaRetenido);
      this.$q.loading.hide();

    },
    async GetReporteIVARetenido() {
      try {
        //CONSULTANOS LAS COMPARATIVAS
        this.dataIvaRetenido = [];
        let ivaRetenido = [];
        let comparativaIva = await this.GetComparativa(
          this.selectedAnio,
          "IVARetenido"
        );
        let añoSel = this.selectedAnio - 1;
        let fechaI = añoSel + "-" + "12" + "-01";
        let fechaF = this.selectedAnio + "-" + this.selectedMesF.value + "-01";
        let response = await axios.get(
          this.rutaAxios +
            "Gastos/GetReporteIvaRetenidoAsync/erp_" +
            this.token.rfc +
            "/" +
            fechaI +
            "/" +
            fechaF
        );
        ivaRetenido = response.data;
        let mesFin = this.selectedMesF.value;

        //ASIGNAMOS LAS COMPARATIVAS
        for (let a = 1; a <= mesFin; a++) {
          let diferencia =
            ivaRetenido[a].importeIva - comparativaIva[a - 1].importe;
          let objIva = {
            mes: ivaRetenido[a].mes,
            importeIva: ivaRetenido[a].importeIva,
            comparativa: comparativaIva[a - 1].importe,
            diferencia: diferencia,
            detalles: ivaRetenido[a].detalles,
          };
          this.dataIvaRetenido.push(objIva);
          objIva = {};
        }
        let totales = {
          mes: "Total",
          importeIva: this.dataIvaRetenido.reduce(
            (acumulador, objeto) => acumulador + objeto.importeIva,
            0
          ),
          comparativa: this.dataIvaRetenido.reduce(
            (acumulador, objeto) => acumulador + objeto.comparativa,
            0
          ),
          diferencia: this.dataIvaRetenido.reduce(
            (acumulador, objeto) => acumulador + objeto.diferencia,
            0
          ),
          detalles: [],
        };

        this.dataIvaRetenido.push(totales);
      } catch (error) {
      this.$q.loading.hide();
      console.log(error);
      }
    },
    async GetComparativa(año, tipo) {
      let respuesta = [
        { mes: "ENERO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "FEBRERO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "MARZO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "ABRIL", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "MAYO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "JUNIO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "JULIO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "AGOSTO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "SEPTIEMBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "OCTUBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "NOVIEMBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "DICIEMBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
      ];
      try {
        let response = await axios.get(
          this.rutaAxios +
            "Comparativa/GetComparativaAsync/erp_" +
            this.token.rfc +
            "/" +
            año +
            "/" +
            tipo
        );
        respuesta = response.data.comparativa;
        return respuesta;
      } catch (error) {
      this.$q.loading.hide();
      console.log(error);
        return respuesta;
      }
    },

    // RETENCIONES DE ISR
    async GetReporteISR() {
      await this.GetReporteNomina();
      await this.GetReporteIsr();
    },
    async GetReporteNomina() {
      this.$q.loading.show({
        spinner: QSpinnerCube,
        spinnerColor: "red-8",
        spinnerSize: 140,
        message: "Gerando reporte de Retenciones de ISR...",
      });
      try {
        //CONSULTANOS LAS COMPARATIVAS
        let comparativaSueldos = await this.GetComparativa(
          this.selectedAnio,
          "Sueldos"
        );
        let comparativaAsimilados = await this.GetComparativa(
          this.selectedAnio,
          "Asimilados"
        );
        let comparativaOtros = await this.GetComparativa(
          this.selectedAnio,
          "SueldosOtros"
        );

        let fechaI = this.selectedAnio + "-01-01";
        let fechaF = this.selectedAnio + "-" + this.selectedMesF.value + "-01";
        let response = await axios.get(
          this.rutaAxios +
            "Nomina/GetReporteISrAsync/erp_" +
            this.token.rfc +
            "/" +
            fechaI +
            "/" +
            fechaF
        );
        let res = response.data;
        this.dataSueldos = res[0];
        this.dataAsimilados = res[1];
        this.dataOtros = res[2];

        let mesFin = this.selectedMesF.value;
        //ASIGNAMOS LAS COMPARATIVAS
        for (let a = 0; a < mesFin; a++) {
          this.dataSueldos[a].comparativa = comparativaSueldos[a].importe;
          let diferencia =
            this.dataSueldos[a].importe - comparativaSueldos[a].importe;
          this.dataSueldos[a].diferencia = diferencia;
        }
        for (let a = 0; a < mesFin; a++) {
          this.dataAsimilados[a].comparativa = comparativaAsimilados[a].importe;
          let diferencia =
            this.dataAsimilados[a].importe - comparativaAsimilados[a].importe;
          this.dataAsimilados[a].diferencia = diferencia;
        }
        for (let a = 0; a < mesFin; a++) {
          this.dataOtros[a].comparativa = comparativaOtros[a].importe;
          let diferencia =
            this.dataOtros[a].importe - comparativaOtros[a].importe;
          this.dataOtros[a].diferencia = diferencia;
        }

        let totalesSueldos = {
          detalles: [],
          mes: "Total",
          importe: this.dataSueldos.reduce(
            (acumulador, objeto) => acumulador + objeto.importe,
            0
          ),
          comparativa: this.dataSueldos.reduce(
            (acumulador, objeto) => acumulador + objeto.comparativa,
            0
          ),
          diferencia: this.dataSueldos.reduce(
            (acumulador, objeto) => acumulador + objeto.diferencia,
            0
          ),
        };

        let totalesAsimilados = {
          detalles: [],
          mes: "Total",
          importe: this.dataAsimilados.reduce(
            (acumulador, objeto) => acumulador + objeto.importe,
            0
          ),
          comparativa: this.dataAsimilados.reduce(
            (acumulador, objeto) => acumulador + objeto.comparativa,
            0
          ),
          diferencia: this.dataAsimilados.reduce(
            (acumulador, objeto) => acumulador + objeto.diferencia,
            0
          ),
        };
        let totalesOtros = {
          detalles: [],
          mes: "Total",
          importe: this.dataOtros.reduce(
            (acumulador, objeto) => acumulador + objeto.importe,
            0
          ),
          comparativa: this.dataOtros.reduce(
            (acumulador, objeto) => acumulador + objeto.comparativa,
            0
          ),
          diferencia: this.dataOtros.reduce(
            (acumulador, objeto) => acumulador + objeto.diferencia,
            0
          ),
        };
        this.dataSueldos.push(totalesSueldos);
        this.dataAsimilados.push(totalesAsimilados);
        this.dataOtros.push(totalesOtros);
      this.$q.loading.hide();

      } catch (error) {
      this.$q.loading.hide();
      console.log(error);
      }
      this.$q.loading.hide();

    },
    async GetReporteIsr() {
      this.$q.loading.show({
        spinner: QSpinnerCube,
        spinnerColor: "red-8",
        spinnerSize: 140,
        message: "Gerando reporte de Retenciones de ISR...",
      });
      try {
        //CONSULTANOS LAS COMPARATIVAS
        let comparativaArrendamientos = await this.GetComparativa(
          this.selectedAnio,
          "Arrendamientos"
        );
        let comparativaHonorarios = await this.GetComparativa(
          this.selectedAnio,
          "Honorarios"
        );

        this.dialogtext = "Calculando ISR";
        let fechaI = this.selectedAnio + "-01-01";
        let fechaF = this.selectedAnio + "-" + this.selectedMesF.value + "-01";
        let response = await axios.get(
          this.rutaAxios +
            "Gastos/GetReporteIsrAsync/erp_" +
            this.token.rfc +
            "/" +
            fechaI +
            "/" +
            fechaF
        );

        this.dataArrendamientos = response.data[0];
        this.dataHonorarios = response.data[1];

        let mesFin = this.selectedMesF.value;

        //ASIGNAMOS LAS COMPARATIVAS
        for (let a = 0; a < mesFin; a++) {
          this.dataArrendamientos[a].comparativa =
            comparativaArrendamientos[a].importe;
          let diferencia =
            this.dataArrendamientos[a].importe -
            comparativaArrendamientos[a].importe;
          this.dataArrendamientos[a].diferencia = diferencia;
        }
        for (let a = 0; a < mesFin; a++) {
          this.dataHonorarios[a].comparativa = comparativaHonorarios[a].importe;
          let diferencia =
            this.dataHonorarios[a].importe - comparativaHonorarios[a].importe;
          this.dataHonorarios[a].diferencia = diferencia;
        }

        let totalesArrendamientos = {
          detalles: [],
          mes: "Total",
          importe: this.dataArrendamientos.reduce(
            (acumulador, objeto) => acumulador + objeto.importe,
            0
          ),
          comparativa: this.dataArrendamientos.reduce(
            (acumulador, objeto) => acumulador + objeto.comparativa,
            0
          ),
          diferencia: this.dataArrendamientos.reduce(
            (acumulador, objeto) => acumulador + objeto.diferencia,
            0
          ),
        };
        let totalesHonorarios = {
          detalles: [],
          mes: "Total",
          importe: this.dataHonorarios.reduce(
            (acumulador, objeto) => acumulador + objeto.importe,
            0
          ),
          comparativa: this.dataHonorarios.reduce(
            (acumulador, objeto) => acumulador + objeto.comparativa,
            0
          ),
          diferencia: this.dataHonorarios.reduce(
            (acumulador, objeto) => acumulador + objeto.diferencia,
            0
          ),
        };
        this.dataArrendamientos.push(totalesArrendamientos);
        this.dataHonorarios.push(totalesHonorarios);
      this.$q.loading.hide();

      } catch (error) {
      this.$q.loading.hide();
      console.log(error);
      }
      this.$q.loading.hide();

    },
    async GetComparativa(año, tipo) {
      let respuesta = [
        { mes: "ENERO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "FEBRERO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "MARZO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "ABRIL", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "MAYO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "JUNIO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "JULIO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "AGOSTO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "SEPTIEMBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "OCTUBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "NOVIEMBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "DICIEMBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
      ];
      try {
        let response = await axios.get(
          this.rutaAxios +
            "Comparativa/GetComparativaAsync/erp_" +
            this.token.rfc +
            "/" +
            año +
            "/" +
            tipo
        );
        respuesta = response.data.comparativa;
        return respuesta;
      } catch (error) {
      this.$q.loading.hide();
      console.log(error);
        return respuesta;
      }
    },

    // PAGOS PROVISIONALES
    async GetReportePagosProvisionales() {
      if (!this.selectedAnio) {
        this.$q.notify({
          type: "warning",
          message: `Seleccione el año`,
          actions: [
            {
              label: "Cerrar",
              color: "white",
              handler: () => {
                /* ... */
              },
            },
          ],
        });
        return;
      }

      if (!this.selectedMesF) {
        this.$q.notify({
          type: "warning",
          message: `Seleccione el mes al que desea consultar`,
          actions: [
            {
              label: "Cerrar",
              color: "white",
              handler: () => {
                /* ... */
              },
            },
          ],
        });
        return;
      }

      //VALIDAMOS EL REGIMEN
      await this.GetRegimen();
      this.dialogRegimen = false;
      const listaRegimen = [...this.añosRegimen];
      const año = this.selectedAnio.toString();
      const regimen = listaRegimen.find((o) => o.año === año);

      if (!regimen.tipoRegimen) {
        this.$q.notify({
          type: "warning",
          message: `Indique el régimen fiscal del año ` + this.selectedAnio,
          actions: [
            {
              label: "Cerrar",
              color: "white",
              handler: () => {
                /* ... */
              },
            },
          ],
        });
        return;
      }

      this.$q.loading.show({
        spinner: QSpinnerCube,
        spinnerColor: "red-8",
        spinnerSize: 140,
        message: "Generando reporte, espere...",
      });
      this.regimenSeleccionado = regimen.tipoRegimen.tipoRegimen;
      this.civiles = "NO";
      this.columns = [];
      //VALIDAMOS QUE NO SEA UNA SC O AC
      if (regimen.civiles === "SI") {
        this.civiles = "SI";
        await this.GetPagoIsrAcYScA();
      } else {
        this.regimenSeleccionadoClave = regimen.tipoRegimen.clave;
        const claveRegimen = regimen.tipoRegimen.clave;
        const rfc = this.token.rfc;
        if (rfc.length == 12) {
          var tipoPersona = "MORAL";
        } else if (rfc.length == 13) {
          var tipoPersona = "FISICA";
        }

        switch (claveRegimen) {
          case "601":
            await this.GetGeneralMoral();
            this.$q.loading.hide();
            break;
          case "626":
            if (tipoPersona === "FISICA") {
              await this.GetResicoFisica();
            }
            if (tipoPersona === "MORAL") {
              await this.GetResicoMoral();
            }
            this.$q.loading.hide();
            break;
          case "612":
            await this.GetFisicaActividadEmpresarial();
            this.$q.loading.hide();
            break;
        }
      }

      console.log(this.dataComprobantesP);
    },
    //REGIMEN FISCAL
    async GetRegimen() {
      try {
        this.$q.loading.show({
          spinner: QSpinnerCube,
          spinnerColor: "red-8",
          spinnerSize: 140,
          message: "Consultando, espere...",
        });
        this.añosRegimen = [];
        let response = await axios.get(
          this.rutaAxios +
            "PagosProvisionales/GetRegimenEmpresaAsync/erp_" +
            this.token.rfc
        );
        let x = [...response.data];
        this.añosRegimen = [...x];
        this.dialogRegimen = true;
        this.$q.loading.hide();
      } catch (error) {
      this.$q.loading.hide();
      console.log(error);
        this.$q.loading.hide();
      }
    },
    //PAGOS PROVISIONALES V2.0
    async GetPagoIsrAcYScA() {
      try {
        this.dataComprobantesP = [];
        //ASIGANMOS LOS VALORES DE LA TABLA
        let columnas = [
          { name: "mes", align: "left", label: "Mes", field: "mes" },
          { name: "ventas", align: "right", label: "Ventas", field: "ventas" },
          {
            name: "productosFinancieros",
            align: "right",
            label: "Productos financieros",
            field: "productosFinancieros",
          },
          {
            name: "otrosProductos",
            align: "right",
            label: "Otros productos financieros",
            field: "otrosProductos",
          },
          {
            name: "anticipoDeClientes",
            align: "right",
            label: "Anticipo de clientes",
            field: "anticipoDeClientes",
          },
          {
            name: "totalPeriodo",
            align: "right",
            label: "Total del periodo",
            field: "totalPeriodo",
          },
          {
            name: "ingresoAcumulable",
            align: "right",
            label: "Ingreso Acumulable",
            field: "ingresoAcumulable",
          },
          {
            name: "coeficienteUtilidad",
            align: "right",
            label: "Coeficiente de utilidad",
            field: "coeficienteUtilidad",
          },
          {
            name: "utilidadFiscalEstimada",
            align: "right",
            label: "Utilidad fiscal estimada",
            field: "utilidadFiscalEstimada",
          },
          {
            name: "ptu",
            align: "right",
            label: "PTU a aplicar en el periodo",
            field: "ptu",
          },
          {
            name: "ptuAcumulada",
            align: "right",
            label: "PTU acumulada",
            field: "ptuAcumulada",
          },
          {
            name: "anticipoCuentaUtilidades",
            align: "right",
            label: "Anticipo a cuenta de utilidades",
            field: "anticipoCuentaUtilidades",
          },
          {
            name: "anticipoCuentaUtilidadesAcumulado",
            align: "right",
            label: "Anticipo a cuenta de utilidades acumulado",
            field: "anticipoCuentaUtilidadesAcumulado",
          },
          {
            name: "resultadoFiscalPrevio",
            align: "right",
            label: "Resultado fiscal previo",
            field: "resultadoFiscalPrevio",
          },
          {
            name: "perdidaDelEjercicioAnterior",
            align: "right",
            label: "Pérdida del ejercicio anterior",
            field: "perdidaDelEjercicioAnterior",
          },
          {
            name: "baseParaIsr",
            align: "right",
            label: "Base para ISR",
            field: "baseParaIsr",
          },
          {
            name: "tasaParaIsr",
            align: "right",
            label: "Tasa para ISR",
            field: "tasaParaIsr",
          },
          {
            name: "pagoProvisionalIsr",
            align: "right",
            label: "Pago provisional ISR",
            field: "pagoProvisionalIsr",
          },
          {
            name: "isrEnterado",
            align: "right",
            label: "ISR enterado",
            field: "isrEnterado",
          },
          {
            name: "isrAPagar",
            align: "right",
            label: "ISR a pagar",
            field: "isrAPagar",
          },
          {
            name: "impuestoregistrado",
            align: "right",
            label: "Impuesto Registrado",
            field: "impuestoregistrado",
          },
          {
            name: "comparativa",
            align: "right",
            label: "Comparativa",
            field: "comparativa",
          },
        ];
        this.columns = [...columnas];

        this.$q.loading.show({
          spinner: QSpinnerCube,
          spinnerColor: "red-8",
          spinnerSize: 140,
          message: "Generando reporte, espere...",
        });
        const año = this.selectedAnio;
        const mes = this.selectedMesF.value;
        let response = await axios.get(
          this.rutaAxios +
            "PagosProvisionales/GetPagoIsrAcYScAsync/erp_" +
            this.token.rfc +
            "/" +
            año +
            "/" +
            mes
        );
        // console.log(response.data);
        this.dataComprobantesP = [...response.data];
        this.$q.loading.hide();
      } catch (error) {
      this.$q.loading.hide();
      console.log(error);
        this.$q.loading.hide();
      }
    },
    async GetGeneralMoral() {
      try {
        let columnas = [
          { name: "mes", align: "left", label: "Mes", field: "mes" },
          {
            name: "ingresosPorMes",
            align: "right",
            label: "Ingresos por Mes",
            field: "ingresosPorMes",
          },

          {
            name: "ingresosAcumulados",
            align: "right",
            label: "Ingresos Acumulados",
            field: "ingresosAcumulados",
          },
          {
            name: "utilidadFiscal",
            align: "right",
            label: "Utilidad Fiscal",
            field: "utilidadFiscal",
          },
          {
            name: "basePagoProvisional",
            align: "right",
            label: "Base Pago Provisional",
            field: "basePagoProvisional",
          },
          {
            name: "pagoProvisional",
            align: "right",
            label: "Pago Provisional",
            field: "pagoProvisional",
          },
          {
            name: "impuestoCargo",
            align: "right",
            label: "Impuesto a Cargo",
            field: "impuestoCargo",
          },
          {
            name: "impuestoregistrado",
            align: "right",
            label: "Impuesto Registrado",
            field: "impuestoregistrado",
          },
          {
            name: "comparativa",
            align: "right",
            label: "Comparativa",
            field: "comparativa",
          },
        ];
        this.columns = [...columnas];

        this.dataComprobantesP = [];
        var ingresos = await this.GetIngresosFacturados();
        let coeficiente = await this.GetCoeficiente();
        let perdida = await this.GetPerdida();
        let registrados = await this.GetRegistrados();
        // console.log(ingresos);

        let ObjPp = {};
        let acumulado = 0;
        let pagoAnterior = 0;
        let impuestoCargo = 0;

        for (let i = 0; i < this.selectedMesF.value; i++) {
          acumulado += ingresos[i].importe;
          ObjPp.mes = ingresos[i].mes;
          ObjPp.ingresosPorMes = ingresos[i].importe;
          ObjPp.detalles = ingresos[i].detalles;
          ObjPp.ingresosAcumulados = acumulado;
          ObjPp.utilidadFiscal = acumulado * coeficiente[i].importe;
          let base = acumulado * coeficiente[i].importe - perdida[i].importe;
          if (base < 0) {
            base = 0;
          }
          ObjPp.basePagoProvisional = base;
          ObjPp.pagoProvisional = (base * 30) / 100;

          impuestoCargo = ObjPp.pagoProvisional - pagoAnterior;
          ObjPp.impuestoCargo = impuestoCargo;
          if (impuestoCargo < 0) {
            ObjPp.impuestoCargo = 0;
          }
          pagoAnterior += ObjPp.impuestoCargo;

          ObjPp.impuestoregistrado = registrados[i].importe;

          let comparativa = ObjPp.impuestoCargo - ObjPp.impuestoregistrado;
          ObjPp.comparativa = comparativa;
          this.dataComprobantesP.push(ObjPp);
          ObjPp = {};
        }

        let objetoTotales = {
          mes: "Total",
          ingresosPorMes: this.dataComprobantesP.reduce(
            (acumulador, objeto) => acumulador + objeto.ingresosPorMes,
            0
          ),
          detalles: [],
          ingresosAcumulados: this.dataComprobantesP.reduce(
            (acumulador, objeto) => acumulador + objeto.ingresosAcumulados,
            0
          ),
          utilidadFiscal: this.dataComprobantesP.reduce(
            (acumulador, objeto) => acumulador + objeto.utilidadFiscal,
            0
          ),
          basePagoProvisional: this.dataComprobantesP.reduce(
            (acumulador, objeto) => acumulador + objeto.basePagoProvisional,
            0
          ),
          pagoProvisional: this.dataComprobantesP.reduce(
            (acumulador, objeto) => acumulador + objeto.pagoProvisional,
            0
          ),
          impuestoCargo: this.dataComprobantesP.reduce(
            (acumulador, objeto) => acumulador + objeto.impuestoCargo,
            0
          ),
          impuestoregistrado: this.dataComprobantesP.reduce(
            (acumulador, objeto) => acumulador + objeto.impuestoregistrado,
            0
          ),
          comparativa: this.dataComprobantesP.reduce(
            (acumulador, objeto) => acumulador + objeto.comparativa,
            0
          ),
        };
        this.dataComprobantesP.push(objetoTotales);
      } catch (error) {
      this.$q.loading.hide();
      console.log(error);
      }
    },
    async GetFisicaActividadEmpresarial() {
      try {
        let columnas = [
          { name: "mes", align: "left", label: "Mes", field: "mes" },

          {
            name: "ingresosPorMes",
            align: "right",
            label: "Ingresos por Mes",
            field: "ingresosPorMes",
          },

          {
            name: "ingresosAcumulados",
            align: "right",
            label: "Ingresos Acumulados",
            field: "ingresosAcumulados",
          },

          {
            name: "gastosPorMes",
            align: "right",
            label: "Gastos por Mes",
            field: "gastosPorMes",
          },
          {
            name: "accionesG",
            align: "left",
            label: "Acciones",
            field: "accionesG",
          },
          {
            name: "gastosAcumulados",
            align: "right",
            label: "Gastos Acumulados",
            field: "gastosAcumulados",
          },

          {
            name: "baseCalculo",
            align: "right",
            label: "Base del Cálculo",
            field: "baseCalculo",
          },
          {
            name: "limiteInferior",
            align: "right",
            label: "Límite Inferior",
            field: "limiteInferior",
          },
          {
            name: "baseImpuesto",
            align: "right",
            label: "Base Impuesto",
            field: "baseImpuesto",
          },
          {
            name: "porcentaje",
            align: "right",
            label: "Porcentaje",
            field: "porcentaje",
          },
          {
            name: "impuestoMarginal",
            align: "right",
            label: "Impuesto Marginal",
            field: "impuestoMarginal",
          },
          {
            name: "cuotaFija",
            align: "right",
            label: "Cuota Fija",
            field: "cuotaFija",
          },
          {
            name: "importeIsr",
            align: "right",
            label: "Importe ISR",
            field: "importeIsr",
          },
          {
            name: "pagosAnteriores",
            align: "right",
            label: "Pagos Anteriores",
            field: "pagosAnteriores",
          },
          {
            name: "isrCargo",
            align: "right",
            label: "ISR a Cargo",
            field: "isrCargo",
          },

          {
            name: "impuestoregistrado",
            align: "right",
            label: "Impuesto Registrado",
            field: "impuestoregistrado",
          },
          {
            name: "comparativa",
            align: "right",
            label: "Comparativa",
            field: "comparativa",
          },
        ];
        this.columns = [...columnas];

        let tablas = await this.GetTablas(
          "personas_fisicas_actividad_empresarial",
          "mensual"
        );
        // console.log(tablas[0].enero)
        let ingresos = await this.GetIngresosCobrados();
        let gastos = await this.GetGastosPagados();
        let registrados = await this.GetRegistrados();

        let ListComprobantes = [];
        let contador = 0;

        let ingresosAcumulados = 0;
        let gastosAcumulados = 0;
        let pagosAnteriores = 0;
        let isrCargo = 0;

        for (let x of ingresos) {
          ingresosAcumulados += x.importe;
          gastosAcumulados += gastos[contador].importe;
          // let baseCalculo = x.importe - gastos[contador].importe;
          let baseCalculo = ingresosAcumulados - gastosAcumulados;
          let limiteInferior = 0;
          let baseImpuesto = 0;
          let cuotaFija = 0;
          let porcentaje = 0;
          let impuestoMarginal = 0;
          let importeIsr = 0;

          if (baseCalculo < 0) {
            baseCalculo = 0;
          }

          //SI LA BASE ES MAYOS A 0, BUSCAMOS EN TABLA
          if (baseCalculo != 0) {
            let valor = x.mes.toLowerCase();
            let tablaMes = tablas[0][valor];

            let valorEncontrado = null;
            for (const rango of tablaMes) {
              const limiteInferior = parseFloat(rango.limite_inferior);
              const limiteSuperior = parseFloat(rango.limite_superior);

              if (
                baseCalculo >= limiteInferior &&
                baseCalculo <= limiteSuperior
              ) {
                valorEncontrado = rango;
                break; // Salimos del bucle una vez que encontramos el valor
              }
            }
            limiteInferior = valorEncontrado.limite_inferior;
            cuotaFija = valorEncontrado.cuota_fija;
            porcentaje = valorEncontrado.porcentaje;

            //CALCULOS
            baseImpuesto = baseCalculo - limiteInferior;
            impuestoMarginal =
              Math.round(baseImpuesto * (porcentaje / 100) * 100) / 100;
            importeIsr = impuestoMarginal + cuotaFija;
            // console.log(cuotaFija, porcentaje);
          }

          isrCargo = importeIsr - pagosAnteriores;
          let representaIsrCargo = isrCargo;
          if (isrCargo <= 0) {
            representaIsrCargo = 0;
          }

          let ObjIngresos = {
            mes: x.mes,

            ingresosPorMes: x.importe,
            detalles: x.detalles,
            ingresosAcumulados: ingresosAcumulados,

            gastosPorMes: gastos[contador].importe,
            detallesG: gastos[contador].detalles,
            gastosAcumulados: gastosAcumulados,

            //CALCULAMOS IS HAY BASE
            baseCalculo: baseCalculo,
            limiteInferior: limiteInferior,
            baseImpuesto: baseImpuesto,
            porcentaje: porcentaje,
            impuestoMarginal: impuestoMarginal,
            cuotaFija: cuotaFija,
            importeIsr: importeIsr,

            pagosAnteriores: pagosAnteriores,
            isrCargo: representaIsrCargo,

            impuestoregistrado: registrados[contador].importe,
            comparativa: representaIsrCargo - registrados[contador].importe,
          };
          ListComprobantes.push(ObjIngresos);
          pagosAnteriores += isrCargo;
          contador++;
        }

        this.dataComprobantesP = [...ListComprobantes];

        let objetoTotales = {
          mes: "Total",
          ingresosPorMes: this.dataComprobantesP.reduce(
            (acumulador, objeto) => acumulador + objeto.ingresosPorMes,
            0
          ),
          detalles: [],
          ingresosAcumulados: "---",
          gastosPorMes: this.dataComprobantesP.reduce(
            (acumulador, objeto) => acumulador + objeto.gastosPorMes,
            0
          ),
          detallesG: [],
          gastosAcumulados: "---",
          baseCalculo: "---",
          limiteInferior: "---",
          baseImpuesto: "---",
          porcentaje: "---",
          impuestoMarginal: "---",
          cuotaFija: "---",
          importeIsr: "---",
          pagosAnteriores: "---",
          isrCargo: this.dataComprobantesP.reduce(
            (acumulador, objeto) => acumulador + objeto.isrCargo,
            0
          ),
          impuestoregistrado: this.dataComprobantesP.reduce(
            (acumulador, objeto) => acumulador + objeto.impuestoregistrado,
            0
          ),
          comparativa: this.dataComprobantesP.reduce(
            (acumulador, objeto) => acumulador + objeto.comparativa,
            0
          ),
        };
        this.dataComprobantesP.push(objetoTotales);
        // console.log(objetoTotales)
      } catch (error) {
      this.$q.loading.hide();

      }
    },
    async GetResicoFisica() {
      try {
        let columnas = [
          { name: "mes", align: "left", label: "Mes", field: "mes" },
          {
            name: "ingresosPorMes",
            align: "right",
            label: "Ingresos por Mes",
            field: "ingresosPorMes",
          },

          {
            name: "tasaAplicable",
            align: "right",
            label: "Tasa Aplicable",
            field: "tasaAplicable",
          },
          {
            name: "importeIsr",
            align: "right",
            label: "Importe ISR",
            field: "importeIsr",
          },
          {
            name: "impuestoregistrado",
            align: "right",
            label: "Impuesto Registrado",
            field: "impuestoregistrado",
          },
          {
            name: "comparativa",
            align: "right",
            label: "Comparativa",
            field: "comparativa",
          },
        ];
        this.columns = [...columnas];
        this.tipoPersona = "FISICA";

        let tablas = await this.GetTablas("resico_fisica", "mensual");
        let ingresos_ = await this.GetIngresosCobrados();
        let registrados = await this.GetRegistrados();

        let ListComprobantes = [];
        let contador = 0;
        for (let x of ingresos_) {
          // BUSCAMOS SU LIMITE EN LA TABLA
          let tasaAplicable = {};
          let ingresos = Number(x.importe);
          let menorDiferencia = Infinity;

          // console.log(ingresos)
          for (const elemento of tablas[0].tablas) {
            if (elemento.hasta >= ingresos) {
              const diferencia = Math.abs(elemento.hasta - ingresos);
              if (diferencia < menorDiferencia) {
                menorDiferencia = diferencia;
                tasaAplicable = elemento;
                // console.log(elemento.hasta, ingresos, tasaAplicable)
              }
            }
          }
          let importeIsr = ingresos * (tasaAplicable.tasa / 100);
          // console.log(tasaAplicable.tasa, importeIsr)

          let ObjIngresos = {
            mes: x.mes,
            ingresosPorMes: x.importe,
            detalles: x.detalles,
            tasaAplicable: tasaAplicable.tasa,
            importeIsr: importeIsr,
            impuestoregistrado: registrados[contador].importe,
            comparativa: importeIsr - registrados[contador].importe,
          };
          ListComprobantes.push(ObjIngresos);
          contador++;
        }
        this.dataComprobantesP = [...ListComprobantes];

        let objetoTotales = {
          mes: "Total",
          ingresosPorMes: this.dataComprobantesP.reduce(
            (acumulador, objeto) => acumulador + objeto.ingresosPorMes,
            0
          ),
          detalles: [],
          tasaAplicable: "---",
          importeIsr: this.dataComprobantesP.reduce(
            (acumulador, objeto) => acumulador + objeto.importeIsr,
            0
          ),
          impuestoregistrado: this.dataComprobantesP.reduce(
            (acumulador, objeto) => acumulador + objeto.impuestoregistrado,
            0
          ),
          comparativa: this.dataComprobantesP.reduce(
            (acumulador, objeto) => acumulador + objeto.comparativa,
            0
          ),
        };
        this.dataComprobantesP.push(objetoTotales);
      } catch (error) {
        console.log(error);
        this.$q.loading.hide();
      }
    },
    async GetResicoMoral() { 
      let columnas = [
        { name: "mes", align: "left", label: "Mes", field: "mes" },
        {
          name: "ingresosPorMes",
          align: "right",
          label: "Ingresos por Mes",
          field: "ingresosPorMes",
        },

        {
          name: "ingresosAcumulados",
          align: "right",
          label: "Ingresos Acumulados",
          field: "ingresosAcumulados",
        },

        {
          name: "deduccionesPorMes",
          align: "right",
          label: "Deducciones por Mes",
          field: "deduccionesPorMes",
        },
        {
          name: "accionesD",
          align: "left",
          label: "Acciones",
          field: "accionesD",
        },
        {
          name: "deduccionesAcumuladas",
          align: "right",
          label: "Deducciones Acumuladas",
          field: "deduccionesAcumuladas",
        },
        {
          name: "utilidadFiscalPrevia",
          align: "right",
          label: "Utilidad Fiscal del Mes Previa",
          field: "utilidadFiscalPrevia",
        },
        {
          name: "utilidadFiscalPreviaAcumulada",
          align: "right",
          label: "Utilidad Fiscal del Mes Previa Acumulada",
          field: "utilidadFiscalPreviaAcumulada",
        },
        {
          name: "ptuPagada",
          align: "right",
          label: "PTU Pagada",
          field: "ptuPagada",
        },
        {
          name: "utilidadFiscalAcumuladaPreviaAntesDePerdidasFiscales",
          align: "right",
          label: "Utilidad Fiscal Acumulada Previa Antes de Perdidas Fiscales",
          field: "utilidadFiscalAcumuladaPreviaAntesDePerdidasFiscales",
        },
        {
          name: "perdidasFiscalesPorAplicar",
          align: "right",
          label: "Pérdidas Fiscales Por Aplicar",
          field: "perdidasFiscalesPorAplicar",
        },
        {
          name: "baseIsr",
          align: "right",
          label: "Base de ISR",
          field: "baseIsr",
        },
        {
          name: "tasaIsr",
          align: "right",
          label: "Tasa de ISR",
          field: "tasaIsr",
        },
        {
          name: "isrDelPeriodo",
          align: "right",
          label: "ISR del Periodo",
          field: "isrDelPeriodo",
        },
        {
          name: "isrPagosProvisionales",
          align: "right",
          label: "ISR Pagos Provisionales",
          field: "isrPagosProvisionales",
        },
        {
          name: "isrAPagar",
          align: "right",
          label: "ISR A Pagar",
          field: "isrAPagar",
        },

        {
          name: "impuestoregistrado",
          align: "right",
          label: "Impuesto Registrado",
          field: "impuestoregistrado",
        },
        {
          name: "comparativa",
          align: "right",
          label: "Comparativa",
          field: "comparativa",
        },
      ];
      this.columns = [...columnas];
      this.tipoPersona = "MORAL";

      let ingresos = await this.GetIngresosCobradosResicoM();
      let gastos = await this.GetGastosPagadosResicoM();
      let ptu = await this.GetPagoPtu();
      let registrados = await this.GetRegistrados();
      let perdida = await this.GetPerdida();

      let ListComprobantes = [];
      let contador = 0;
      let ingresosAcumulados = 0;
      let deduccionesAcumuladas = 0;
      let utilidadFiscalPreviaAcumulada = 0;
      let isrPagosProvisionales = 0;

      for (let x of ingresos) {
        ingresosAcumulados += x.importe;
        deduccionesAcumuladas += gastos[contador].importe;
        let utilidadFiscalPrevia = x.importe - gastos[contador].importe;
        if (utilidadFiscalPrevia < 0) {
          utilidadFiscalPrevia = 0;
        }
        utilidadFiscalPreviaAcumulada += utilidadFiscalPrevia;
        let ptuPagada = ptu[contador].importe;
        let utilidadFiscalAcumuladaPreviaAntesDePerdidasFiscales =
          utilidadFiscalPreviaAcumulada - ptuPagada;
        let perdidasFiscalesPorAplicar = perdida[contador].importe;
        let baseIsr =
          utilidadFiscalAcumuladaPreviaAntesDePerdidasFiscales -
          perdidasFiscalesPorAplicar;
        if (baseIsr < 0) {
          baseIsr = 0;
        }
        let tasaIsr = "30.00%";
        let isrDelPeriodo = baseIsr * 0.3;
        let isrAPagar = isrDelPeriodo - isrPagosProvisionales;

        let ObjIngresos = {
          mes: x.mes,
          ingresosPorMes: x.importe,
          detalles: x.detalles,
          ingresosAcumulados: ingresosAcumulados,

          deduccionesPorMes: gastos[contador].importe,
          detallesD: gastos[contador].detalles,
          deduccionesAcumuladas: deduccionesAcumuladas,

          utilidadFiscalPrevia: utilidadFiscalPrevia,
          utilidadFiscalPreviaAcumulada: utilidadFiscalPreviaAcumulada,
          ptuPagada: ptuPagada,
          utilidadFiscalAcumuladaPreviaAntesDePerdidasFiscales:
            utilidadFiscalAcumuladaPreviaAntesDePerdidasFiscales,
          perdidasFiscalesPorAplicar: perdidasFiscalesPorAplicar,
          baseIsr: baseIsr,
          tasaIsr: tasaIsr,
          isrDelPeriodo: isrDelPeriodo,
          isrPagosProvisionales: isrPagosProvisionales,
          isrAPagar: isrAPagar,

          impuestoregistrado: registrados[contador].importe,
          comparativa: isrAPagar - registrados[contador].importe,
        };
        ListComprobantes.push(ObjIngresos);
        isrPagosProvisionales = isrDelPeriodo;
        contador++;
      }

      this.dataComprobantesP = [...ListComprobantes];

      // console.log(ingresos);
      // console.log(gastos);
    },
    async GetIngresosFacturados() {
      try {
        this.dialogtext = "Consultando ingresos...";

        let fechaI = this.selectedAnio + "-01-01";
        let fechaF = this.selectedAnio + "-" + this.selectedMesF.value + "-01";

        let response = await axios.get(
          this.rutaAxios +
            "Ingresos/GetReporteIngresosPPISRAsync/erp_" +
            this.token.rfc +
            "/" +
            fechaI +
            "/" +
            fechaF
        );
        return response.data;
      } catch (error) {
      this.$q.loading.hide();
      console.log(error);
      }
    },
    async GetIngresosCobrados() {
      let fechaI = this.selectedAnio + "-01-01";
      let fechaF = this.selectedAnio + "-" + this.selectedMesF.value + "-01";

      try {
        let response = await axios.get(
          this.rutaAxios +
            "Ingresos/GetCobradoAsync/erp_" +
            this.token.rfc +
            "/" +
            fechaI +
            "/" +
            fechaF
        );
        return response.data;
      } catch (error) {
      this.$q.loading.hide();
      console.log(error);
      }
    },
    async GetIngresosCobradosResicoM() {
      let fechaI = this.selectedAnio + "-01-01";
      let fechaF = this.selectedAnio + "-" + this.selectedMesF.value + "-01";

      try {
        let response = await axios.get(
          this.rutaAxios +
            "Ingresos/GetCobradoResicoMoralAsync/erp_" +
            this.token.rfc +
            "/" +
            fechaI +
            "/" +
            fechaF
        );
        return response.data;
      } catch (error) {
      this.$q.loading.hide();
      console.log(error);
      }
    },
    async GetGastosPagadosResicoM() {
      let fechaI = this.selectedAnio + "-01-01";
      let fechaF = this.selectedAnio + "-" + this.selectedMesF.value + "-01";

      try {
        let response = await axios.get(
          this.rutaAxios +
            "Gastos/GetPagadoResicoMoralAsync/erp_" +
            this.token.rfc +
            "/" +
            fechaI +
            "/" +
            fechaF
        );
        return response.data;
      } catch (error) {
      this.$q.loading.hide();
      console.log(error);
      }
    },
    async GetGastosPagados() {
      let fechaI = this.selectedAnio + "-01-01";
      let fechaF = this.selectedAnio + "-" + this.selectedMesF.value + "-01";

      try {
        let response = await axios.get(
          this.rutaAxios +
            "Gastos/GetPagadoAsync/erp_" +
            this.token.rfc +
            "/" +
            fechaI +
            "/" +
            fechaF
        );
        return response.data;
      } catch (error) {
      this.$q.loading.hide();
      console.log(error);
      }
    },
    async GetPagoPtu() {
      let fechaI = this.selectedAnio + "-01-01";
      let fechaF = this.selectedAnio + "-" + this.selectedMesF.value + "-01";

      try {
        let response = await axios.get(
          this.rutaAxios +
            "Nomina/GetReportePagoPtuAsync/erp_" +
            this.token.rfc +
            "/" +
            fechaI +
            "/" +
            fechaF
        );
        return response.data;
      } catch (error) {
      this.$q.loading.hide();
      console.log(error);
      }
    },
    async GetTablas(tipo, periodicidad) {
      try {
        let response = await axios.get(
          this.rutaAxios +
            "Empresa/GetTablas/" +
            this.selectedAnio +
            "/" +
            tipo +
            "/" +
            periodicidad
        );
        return response.data;
      } catch (error) {
      this.$q.loading.hide();
      console.log(error);
      }
    },
    async GetCoeficiente() {
      let respuesta = [
        { mes: "ENERO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "FEBRERO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "MARZO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "ABRIL", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "MAYO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "JUNIO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "JULIO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "AGOSTO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "SEPTIEMBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "OCTUBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "NOVIEMBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "DICIEMBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
      ];
      try {
        let response = await axios.get(
          this.rutaAxios +
            "Comparativa/GetComparativaAsync/erp_" +
            this.token.rfc +
            "/" +
            this.selectedAnio +
            "/Coeficiente"
        );
        let x = response.data.comparativa;
        respuesta = x;
      } catch (error) {
      this.$q.loading.hide();
      console.log(error);
      }
      // console.log(respuesta)
      return respuesta;
    },
    async GetPerdida() {
      let respuesta = [
        { mes: "ENERO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "FEBRERO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "MARZO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "ABRIL", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "MAYO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "JUNIO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "JULIO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "AGOSTO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "SEPTIEMBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "OCTUBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "NOVIEMBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "DICIEMBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
      ];
      try {
        let response = await axios.get(
          this.rutaAxios +
            "Comparativa/GetComparativaAsync/erp_" +
            this.token.rfc +
            "/" +
            this.selectedAnio +
            "/Perdida"
        );
        let x = response.data.comparativa;
        respuesta = x;
      } catch (error) {
      this.$q.loading.hide();
      console.log(error);
      }
      // console.log(respuesta)
      return respuesta;
    },
    async GetRegistrados() {
      let respuesta = [
        { mes: "ENERO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "FEBRERO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "MARZO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "ABRIL", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "MAYO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "JUNIO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "JULIO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "AGOSTO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "SEPTIEMBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "OCTUBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "NOVIEMBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "DICIEMBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
      ];
      try {
        let response = await axios.get(
          this.rutaAxios +
            "Comparativa/GetComparativaAsync/erp_" +
            this.token.rfc +
            "/" +
            this.selectedAnio +
            "/RegistradosPPIsr"
        );
        let x = response.data.comparativa;
        respuesta = x;
      } catch (error) {
      this.$q.loading.hide();
      console.log(error);
      }
      // console.log(respuesta)
      return respuesta;
    },

    // GET REPORTE DE USO DE CFDI
    async GetReporteUsoCFDI() {
      this.itemsReporte = [];
      this.$q.loading.show({
        spinner: QSpinnerCube,
        spinnerColor: "red-8",
        spinnerSize: 140,
        message: "Consultando Emitidos...",
      });
      const ingresos = await this.GetIngresos();
      this.$q.loading.show({
        spinner: QSpinnerCube,
        spinnerColor: "red-8",
        spinnerSize: 140,
        message: "Consultando Recibidos...",
      });
      const gastos = await this.GetGastos();
      this.$q.loading.show({
        spinner: QSpinnerCube,
        spinnerColor: "red-8",
        spinnerSize: 140,
        message: "Consultando Nómina...",
      });
      const nomina = await this.GetNomina();

      const unicos = await this.ObtieneUsoCfdi(ingresos, gastos, nomina);

      //CREAMOS EL CONTENIDO DE LA TABLA
      unicos.forEach((e) => {
        let objIngreso = ingresos.find((f) => f.usoCfdi === e);
        let objGasto = gastos.find((f) => f.usoCfdi === e);
        let objNomina = nomina.find((f) => f.usoCfdi === e);

        let ingresoTotal = 0;
        let detallesE = [];
        if (objIngreso) {
          // ingresoTotal = objIngreso.total;
          ingresoTotal = objIngreso.subTotal;
          // ingresoTotal = objIngreso.subTotal - objIngreso.descuento;
          detallesE = objIngreso.detalles;
        }

        let gastoTotal = 0;
        let detallesR = [];
        if (objGasto) {
          // gastoTotal = objGasto.total;
          gastoTotal = objGasto.subTotal;
          // gastoTotal = objGasto.subTotal - objGasto.descuento;
          detallesR = objGasto.detalles;
        }

        let nominaTotal = 0;
        let detallesN = [];
        if (objNomina) {
          // nominaTotal = objNomina.total;
          nominaTotal = objNomina.subTotal - objNomina.descuento;
          detallesN = objNomina.detalles;
        }

        let objNuevo = {
          uso: e,
          emitidos: ingresoTotal,
          detallesE: detallesE,
          recibidos: gastoTotal,
          detallesR: detallesR,
          nomina: nominaTotal,
          detallesN: detallesN,
        };
        this.itemsReporte.push(objNuevo);
      });

      //AGREGAMOS LOS TOTALES
      let sumaEmitidos = this.itemsReporte.reduce(
        (acumulador, objeto) => acumulador + objeto.emitidos,
        0
      );
      let sumaRecibidos = this.itemsReporte.reduce(
        (acumulador, objeto) => acumulador + objeto.recibidos,
        0
      );
      let sumaNomina = this.itemsReporte.reduce(
        (acumulador, objeto) => acumulador + objeto.nomina,
        0
      );

      let objTotales = {
        uso: "Suma",
        emitidos: sumaEmitidos,
        recibidos: sumaRecibidos,
        nomina: sumaNomina,
      };
      this.itemsReporte.push(objTotales);
      console.log(this.itemsReporte);
      this.$q.loading.hide();
    },

    async GetIngresos() {
      try {
        // let fI = moment(this.fechaI).format('YYYY-MM-DD')
        // let fF = moment(this.fechaF).format('YYYY-MM-DD')

        // const fI = new Date(this.selectedAnio, 0, 1);
        // const fF = new Date(this.selectedAnio, this.selectedMesF.value, 0);

        const fI = `${this.selectedAnio}-01-01`;
        const ultimoDia = new Date(
          this.selectedAnio,
          this.selectedMesF.value,
          0
        ).getDate();
        const fF = `${this.selectedAnio}-${String(
          this.selectedMesF.value
        ).padStart(2, "0")}-${String(ultimoDia).padStart(2, "0")}`;

        let response = await axios.get(
          this.rutaAxios +
            "Consultas/GetReporteUsoCfdiIngresosAsync/erp_" +
            this.token.rfc +
            "/" +
            fI +
            "/" +
            fF
        );
        return response.data;
      } catch (error) {
      this.$q.loading.hide();
      console.log(error);
      }
    },

    async GetGastos() {
      try {
        const fI = `${this.selectedAnio}-01-01`;
        const ultimoDia = new Date(
          this.selectedAnio,
          this.selectedMesF.value,
          0
        ).getDate();
        const fF = `${this.selectedAnio}-${String(
          this.selectedMesF.value
        ).padStart(2, "0")}-${String(ultimoDia).padStart(2, "0")}`;

        let response = await axios.get(
          this.rutaAxios +
            "Consultas/GetReporteUsoCfdiGastosAsync/erp_" +
            this.token.rfc +
            "/" +
            fI +
            "/" +
            fF
        );
        return response.data;
      } catch (error) {
      this.$q.loading.hide();
      console.log(error);
      }
    },

    async GetNomina() {
      try {
        const fI = `${this.selectedAnio}-01-01`;
        const ultimoDia = new Date(
          this.selectedAnio,
          this.selectedMesF.value,
          0
        ).getDate();
        const fF = `${this.selectedAnio}-${String(
          this.selectedMesF.value
        ).padStart(2, "0")}-${String(ultimoDia).padStart(2, "0")}`;

        let response = await axios.get(
          this.rutaAxios +
            "Consultas/GetReporteUsoCfdiNomina/erp_" +
            this.token.rfc +
            "/" +
            fI +
            "/" +
            fF
        );
        return response.data;
      } catch (error) {
      this.$q.loading.hide();
      console.log(error);
      }
    },

    async ObtieneUsoCfdi(...listas) {
      console.log(listas);
      const usoUnicos = new Set();
      listas.forEach((lista) => {
        lista.forEach((objeto) => {
          usoUnicos.add(objeto.usoCfdi);
        });
      });
      return Array.from(usoUnicos);
    },

    // ▶ Ejecutar una sola función
    async runTask(index) {
      if (!this.selectedAnio) {
        this.$q.notify({
          type: "warning",
          message: `Seleccione el año`,
          position:'top-right',
          actions: [
            {
              label: "Cerrar",
              color: "white",
              handler: () => {
                /* ... */
              },
            },
          ],
        });
        return;
      }

      if (!this.selectedMesF) {
        this.$q.notify({
          type: "warning",
          message: `Seleccione el mes al que desea consultar`,
          position:'top-right',
          actions: [
            {
              label: "Cerrar",
              color: "white",
              handler: () => {
                /* ... */
              },
            },
          ],
        });
        return;
      }

      console.log(index);
      const task = this.tasks[index];

      try {
        task.status = "loading";
        task.progress = 0;

        // Simulamos progreso visual
        this.animateProgress(task);

        await task.run(); // llamada a la función real

        task.status = "success";
        task.progress = 1;
      } catch (err) {
      this.$q.loading.hide();
      console.log(err);
        task.status = "error";
        task.progress = 0;
      }
    },

    // ▶ Ejecutar todas en orden
    async runAll() {
      for (let i = 0; i < this.tasks.length; i++) {
        await this.runTask(i);
        if (this.tasks[i].status === "error") break; // detener si falla
      }
    },

    // Pequeña animación visual del progreso
    animateProgress(task) {
      const interval = setInterval(() => {
        if (task.progress >= 0.9 || task.status !== "loading") {
          clearInterval(interval);
        } else {
          task.progress += 0.05;
        }
      }, 200);
    },
            
            

        }
}
</script>
