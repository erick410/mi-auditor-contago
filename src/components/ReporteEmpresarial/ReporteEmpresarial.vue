<template>
  <div class="q-ma-lg">
    <div class="row q-col-gutter-sm  q-mx-xl justify-end">
      <div class="col-12 col-md-9 text-left ">
        <H4 class="q-pa-sm q-ma-sm">REPORTE EMPRESARIAL </H4>
      </div>

      <div class="col-12 col-md-1">
        <q-select filled v-model="selectedAnio" :options="itemsAnios" label="Año" />
      </div>
      <div class="col-12 col-md-2">
        <q-select filled v-model="selectedMes" :options="itemsMes" label="Mes">
          <template v-slot:after>
            <q-btn round color="primary" icon="mdi-magnify" @click="GetReporteIGN()" />
          </template>
        </q-select>
      </div>
    </div>

    <div class="row q-col-gutter-sm q-ma-xl">

      <!-- INGRESOS GASTOS NOMINA -->
      <div class="col-12">
        <q-card style="width: 100%;" full-width>
          <q-item>
            <q-item-section avatar>
              <q-avatar size="lg" color="primary" text-color="white" icon="mdi-file-document" />
            </q-item-section>
            <q-item-section>
              <q-item-label>INGRESOS - GASTOS - NÓMINA</q-item-label>
            </q-item-section>
          </q-item>
          <q-separator />
          <q-card-section>
            <div class="row q-col-gutter-sm">
              <div class="col-3">
                <q-field filled v-model="totalIngresos" label="TOTAL INGRESOS" dense class="q-mr-md">
                  <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                    <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                      v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                  </template>
                </q-field>
              </div>

              <div class="col-3">
                <q-field filled v-model="totalGastos" label="TOTAL GASTOS" dense class="q-mr-md">
                  <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                    <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                      v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                  </template>
                </q-field>
              </div>
              <div class="col-3">
                <q-field filled v-model="totalNomina" label="TOTAL NÓMINA" dense class="q-mr-md">
                  <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                    <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                      v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                  </template>
                </q-field>
              </div>
              <div class="col-3">
                <q-field filled v-model="resultado" label="TOTAL" dense class="q-mr-md">
                  <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                    <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                      v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                  </template>
                </q-field>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- CUENTAS POR PAGAR Y COBRAR -->
      <div class="col-12 q-mt-lg">
        <q-card style="width: 100%;" full-width>
          <q-item>
            <q-item-section avatar>
              <q-avatar size="lg" color="primary" text-color="white" icon="mdi-file-document" />
            </q-item-section>
            <q-item-section>
              <q-item-label>CUENTAS POR PAGAR - COBRAR</q-item-label>
            </q-item-section>
          </q-item>
          <q-separator />
          <q-card-section>
            <div class="row q-col-gutter-sm justify-center">
              <div class="col-3">
                <q-field filled v-model="totalPagar" label="CUENTAS POR PAGAR" dense class="q-mr-md">
                  <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                    <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                      v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                  </template>
                </q-field>
              </div>

              <div class="col-3">
                <q-field filled v-model="totalCobrar" label="CUENTAS POR COBRAR" dense class="q-mr-md">
                  <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                    <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                      v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                  </template>
                </q-field>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- IVA -->
      <div class="col-12 q-mt-lg">
        <q-card style="width: 100%;" full-width>
          <q-item>
            <q-item-section avatar>
              <q-avatar size="lg" color="primary" text-color="white" icon="mdi-file-document" />
            </q-item-section>
            <q-item-section>
              <q-item-label>IVA</q-item-label>
            </q-item-section>
          </q-item>
          <q-separator />
          <q-card-section>
            <div class="row q-col-gutter-sm justify-center">
              <div class="col-3">
                <q-field filled v-model="ivaCargo" label="IVA CARGO" dense class="q-mr-md">
                  <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                    <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                      v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                  </template>
                </q-field>
              </div>

              <div class="col-3">
                <q-field filled v-model="ivaFavor" label="IVA FAVOR" dense class="q-mr-md">
                  <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                    <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                      v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                  </template>
                </q-field>
              </div>

              <div class="col-3">
                <q-field filled v-model="diferenciaIva" label="DIFERENCIA" dense class="q-mr-md">
                  <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                    <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                      v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                  </template>
                </q-field>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- ISR -->
      <div class="col-12 q-mt-lg">
        <q-card style="width: 100%;" full-width>
          <q-item>
            <q-item-section avatar>
              <q-avatar size="lg" color="primary" text-color="white" icon="mdi-file-document" />
            </q-item-section>
            <q-item-section>
              <q-item-label>ISR</q-item-label>
            </q-item-section>
          </q-item>
          <q-separator />
          <q-card-section>
            <div class="row q-col-gutter-sm justify-center">
              <div class="col-3">
                <q-field filled v-model="totalSueldos" label="SUELDOS" dense class="q-mr-md">
                  <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                    <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                      v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                  </template>
                </q-field>
              </div>

              <div class="col-3">
                <q-field filled v-model="totalAsimilados" label="ASIMILADOS" dense class="q-mr-md">
                  <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                    <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                      v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                  </template>
                </q-field>
              </div>

              <div class="col-3">
                <q-field filled v-model="totalOtros" label="OTROS" dense class="q-mr-md">
                  <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                    <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                      v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                  </template>
                </q-field>
              </div>
            </div>
            <div class="row q-col-gutter-sm justify-center q-mt-md">
              <div class="col-3">
                <q-field filled v-model="totalHonorarios" label="HONORARIOS" dense class="q-mr-md">
                  <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                    <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                      v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                  </template>
                </q-field>
              </div>

              <div class="col-3">
                <q-field filled v-model="totalArrendamientos" label="ARRENDAMIENTOS" dense class="q-mr-md">
                  <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                    <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                      v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                  </template>
                </q-field>
              </div>

              <div class="col-3">
                <q-field filled v-model="totalResico" label="RESICO" dense class="q-mr-md">
                  <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                    <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                      v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                  </template>
                </q-field>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- PAGOS PROVISIONALES 
      <div class="col-12 q-mt-lg">
        <q-card style="width: 100%;" full-width>
          <q-item>
            <q-item-section avatar>
              <q-avatar size="lg" color="primary" text-color="white" icon="mdi-file-document" />
            </q-item-section>
            <q-item-section>
              <q-item-label>PAGOS PROVISIONALES</q-item-label>
            </q-item-section>
          </q-item>
          <q-separator />
          <q-card-section>
            <div class="row q-col-gutter-sm justify-center">
              <div class="col-3">
                <q-field filled v-model="totalPagosProvisionales" label="PAGOS PROVISIONALES" dense class="q-mr-md">
                  <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                    <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                      v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                  </template>
                </q-field>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div> -->

      <!-- RETENCIONES DE IVA -->
      <div class="col-12 q-mt-lg">
        <q-card style="width: 100%;" full-width>
          <q-item>
            <q-item-section avatar>
              <q-avatar size="lg" color="primary" text-color="white" icon="mdi-file-document" />
            </q-item-section>
            <q-item-section>
              <q-item-label>RETENCIONES DE IVA</q-item-label>
            </q-item-section>
          </q-item>
          <q-separator />
          <q-card-section>
            <div class="row q-col-gutter-sm justify-center">
              <div class="col-3">
                <q-field filled v-model="retencionRecibido" label="RECIBIDOS" dense class="q-mr-md">
                  <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                    <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                      v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                  </template>
                </q-field>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

    </div>
  </div>
  </div>
</template>
<script>
  import { Money } from 'v-money'
  import axios from 'axios'
  import { QSpinnerCube } from 'quasar';

  export default {
    components: { Money },
    data() {
      return {
        totalIngresos: 0,
        totalNomina: 0,
        totalGastos: 0,
        resultado: 0,

        totalCobrar: 0,
        totalPagar: 0,

        ivaCargo: 0,
        ivaFavor: 0,
        diferenciaIva: 0,

        totalPagosProvisionales: 0,

        totalSueldos: 0,
        totalAsimilados: 0,
        totalOtros: 0,
        totalHonorarios: 0,
        totalArrendamientos: 0,
        totalResico: 0,

        retencionRecibido: 0,

        moneyFormatForComponent: {
          decimal: '.',
          thousands: ',',
          precision: 2,
          masked: true
        },
        itemsAnios: ['2026','2025', "2024", "2023", "2022", "2021", "2020", "2019", "2018"],
        itemsMes: [
          { label: "ENERO", value: 1 },
          { label: "FEBRERO", value: 2 },
          { label: "MARZO", value: 3 },
          { label: "ABRIL", value: 4 },
          { label: "MAYO", value: 5 },
          { label: "JUNIO", value: 6 },
          { label: "JULIO", value: 7 },
          { label: "AGOSTO", value: 8 },
          { label: "SEPTIEMBRE", value: 9 },
          { label: "OCTUBRE", value: 10 },
          { label: "NOVIEMBRE", value: 11 },
          { label: "DICIEMBRE", value: 12 },
        ],

        selectedAnio: '2025',
        selectedMes: null,

        //CASO PARA IVA EXENTO
        banderaExento: false,
        dataComprobantes: [],
      };
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
      this.GetReportes();
    },
    methods: {
      GetReportes(){
        const mesActual = new Date().getMonth();
        const itemSeleccionado = this.itemsMes[mesActual];
        this.selectedMes = itemSeleccionado
        this.GetReporteIGN();
      },
      async GetReporteIGN() {
        if (!this.selectedAnio) {
          this.ShowNotifsWarning('Seleccione el año');
          return;
        }
        if (!this.selectedMes) {
          this.ShowNotifsWarning('Seleccione el mes');
          return;
        }

        await this.GetReporteIngresos();
        await this.GetReporteGastos();
        await this.GetNomina();
        await this.GetReporteCuentasCobrar();
        await this.GetReporteCuentasPagar();
        await this.GetReporteIVARetenido();
        await this.GetReporteIVA()
        await this.GetReporteISR()

        this.$q.loading.hide()
      },
      async GetReporteIngresos() {
        this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'white', spinnerSize: 100, message: 'Consultando ingresos..', })
        let fI = this.selectedAnio + '-' + this.selectedMes.value + '-01';
        let fF = this.selectedAnio + '-' + this.selectedMes.value + '-01';
        try {
          let response = await axios.get(this.rutaAxios + 'Ingresos/GetReportePeriodoAsync/erp_' + this.token.rfc + '/' + fI + '/' + fF);
          //console.log(response.data)
          let x = response.data.general;
          this.totalIngresos = x.reduce((acumulador, objeto) => acumulador + objeto.subTotalI, 0)
          this.$q.loading.hide()

        } catch (error) {
          console.log(error)
          this.$q.loading.hide()
        }
      },

      async GetReporteGastos() {
        this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'white', spinnerSize: 100, message: 'Consultando gastos..', })

        let fI = this.selectedAnio + '-' + this.selectedMes.value + '-01';
        let fF = this.selectedAnio + '-' + this.selectedMes.value + '-01';

        try {
          let response = await axios.get(this.rutaAxios + 'Gastos/GetReportePeriodoAsync/erp_' + this.token.rfc + '/' + fI + '/' + fF);
          //console.log(response.data)
          let x = response.data.general;
          this.totalGastos = x.reduce((acumulador, objeto) => acumulador + objeto.subTotalI, 0)
          this.$q.loading.hide()

        } catch (error) {
          console.log(error)
          this.$q.loading.hide()
        }
      },

      async GetNomina() {
        try {
          this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'white', spinnerSize: 100, message: 'Consultando nómina..', })

          let fI = this.selectedAnio + '-' + this.selectedMes.value + '-01';
          var year = parseInt(this.selectedAnio);
          var month = parseInt(this.selectedMes.value);
          var lastDayOfMonth = this.getLastDayOfMonth(year, month);
          let fF = lastDayOfMonth.getFullYear() + '-' + (lastDayOfMonth.getMonth() + 1) + '-' + lastDayOfMonth.getDate();

          //console.log('let', fF)

          let response = await axios.get(this.rutaAxios + 'Consultas/GetReporteUsoCfdiNomina/erp_' + this.token.rfc + '/' + fI + '/' + fF);
          let x = response.data;
          let nom = x.reduce((acumulador, objeto) => acumulador + objeto.total, 0)
          this.totalNomina = nom

          var ing = this.totalIngresos.replace(/,/g, '');
          var gas = this.totalGastos.replace(/,/g, '');
          this.resultado = parseFloat(ing) -  parseFloat(gas) - nom;
          this.$q.loading.hide()

        } catch (error) {
          console.log(error);
          this.$q.loading.hide()
        }
      },
      async GetReporteCuentasCobrar() {
        this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'white', spinnerSize: 100, message: 'Consultando cuentas por cobrar..', })

        let fI = this.selectedAnio + '-01-01';
        var year = parseInt(this.selectedAnio);
        var month = parseInt(this.selectedMes.value);
        var lastDayOfMonth = this.getLastDayOfMonth(year, month);
        let fF = lastDayOfMonth.getFullYear() + '-' + (lastDayOfMonth.getMonth() + 1) + '-' + lastDayOfMonth.getDate();
        //console.log('let', fF)

        try {
          let response = await axios.get(this.rutaAxios + 'Ingresos/GetCxCAsync/erp_' + this.token.rfc + '/' + fI + '/' + fF);
          let x = response.data;
          //console.log(x)
          this.totalCobrar = x.reduce((acumulador, objeto) => acumulador + objeto.porCobrar, 0)
          this.$q.loading.hide()
        } catch (error) {
          console.log(error)
          this.$q.loading.hide()
        }
      },

      async GetReporteCuentasPagar() {
        this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'white', spinnerSize: 100, message: 'Consultando cuentas por pagar..', })
        let fI = this.selectedAnio + '-01-01';
        var year = parseInt(this.selectedAnio);
        var month = parseInt(this.selectedMes.value);
        var lastDayOfMonth = this.getLastDayOfMonth(year, month);
        let fF = lastDayOfMonth.getFullYear() + '-' + (lastDayOfMonth.getMonth() + 1) + '-' + lastDayOfMonth.getDate();
        //console.log('let', fF)
        try {
          let response = await axios.get(this.rutaAxios + 'Gastos/GetCxPAsync/erp_' + this.token.rfc + '/' + fI + '/' + fF);
          let x = response.data;
          //console.log(x)
          this.totalPagar = x.reduce((acumulador, objeto) => acumulador + objeto.porPagar, 0)
          this.$q.loading.hide()
        } catch (error) {
          console.log(error)
          this.$q.loading.hide()
        }
      },

      async GetReporteIVA() {
        this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'white', spinnerSize: 100, message: 'Consultando reporte de IVA..', })

        this.banderaExento = true;

        let ivaCargo = await this.GetIvaTrasladado();
        //console.log('ivacargo', ivaCargo)
        let detalles = ivaCargo[0].detalles;
        let exento = detalles.find(x => x.tipoFactor === 'Exento')
        if (exento) {
          await this.GetReporteIvaExento(ivaCargo);
        } else {
          await this.GetReporteIva(ivaCargo);
        }
        this.$q.loading.hide()

      },

      async GetReporteIva(ivaCargo) {
        try {
          this.dataComprobantes = [];
          // let ivaCargo = await this.GetIvaTrasladado();
          let ivaAcreditable = await this.GetIvaAcreditado()
          let ivaRetenido = await this.GetIvaRetenido();
          //console.log(ivaAcreditable);
          //console.log(ivaRetenido);
          // let ivaRetenido = [];
          let comparativa = await this.GetComparativa(this.selectedAnio, 'IVA')

          let ObjIva = {}

          for (let x = 0; x < this.selectedMes.value; x++) {
            ObjIva.año = this.selectedAnio;
            ObjIva.mes = ivaCargo[x].mes;

            ObjIva.baseIvaTrasladado = ivaCargo[x].baseIva;
            ObjIva.importeIvaTrasladado = ivaCargo[x].importeIva;
            ObjIva.detallesTrasladado = ivaCargo[x].detalles;

            ObjIva.baseIvaAcreditado = ivaAcreditable[x].baseIva
            ObjIva.importeIvaAcreditado = ivaAcreditable[x].importeIva
            ObjIva.detallesAcreditado = ivaAcreditable[x].detalles;

            ObjIva.ivaRetenidoAnterior = ivaRetenido[x].importeIva
            ObjIva.ivaRetenido = ivaRetenido[x + 1].importeIva
            // ObjIva.ivaRetenidoAnterior = 0
            // ObjIva.ivaRetenido = 0

            let ivaCargo_ = ivaCargo[x].importeIva;
            let ivaAcreditado_ = ivaAcreditable[x].importeIva
            let ivaRetenido_ = ivaRetenido[x].importeIva
            let ivaRetenidoAnterior_ = ivaRetenido[x + 1].importeIva
            // let ivaRetenido_ = 0
            // let ivaRetenidoAnterior_ = 0
            let calculo = ivaCargo_ - ivaAcreditado_ - ivaRetenido_ + ivaRetenidoAnterior_
            if (calculo > 0) {
              ObjIva.ivaCargo = calculo
              ObjIva.ivaFavor = 0
            } else {
              ObjIva.ivaCargo = 0
              ObjIva.ivaFavor = calculo * -1
            }

            //COMPARATIVA
            ObjIva.cargoRegistrado = comparativa[x].ivaCargo
            ObjIva.favorRegistrado = comparativa[x].ivaFavor

            let comparativa_ = (ObjIva.ivaCargo - ObjIva.ivaFavor - ObjIva.cargoRegistrado + ObjIva.favorRegistrado) * -1
            if (comparativa_ != 0) {
              comparativa_ = comparativa_ * -1;
            }
            ObjIva.comparativa = comparativa_;

            this.dataComprobantes.push(ObjIva);
            // console.log(ObjIva)
            ObjIva = {}
          }
          this.ivaCargo = this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.ivaCargo, 0)
          this.ivaFavor = this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.ivaFavor, 0)
          this.diferenciaIva = this.ivaCargo - this.ivaFavor
        } catch (error) {
          console.log(error)
        }
      },

      async GetReporteIvaExento(ivaCargo) {
        try {

          this.dataComprobantes = [];
          // let ivaCargo = await this.GetIvaTrasladado();
          let ivaAcreditable = await this.GetIvaAcreditado()
          let ivaRetenido = await this.GetIvaRetenido();
          let comparativa = await this.GetComparativa(this.selectedAnio, 'IVA')

          let ObjIva = {}

          for (let x = 0; x < this.selectedMes.value; x++) {
            ObjIva.año = this.selectedAnio;
            ObjIva.mes = ivaCargo[x].mes;

            ObjIva.baseIvaTrasladado = ivaCargo[x].baseIva;
            ObjIva.importeIvaTrasladado = ivaCargo[x].importeIva;
            ObjIva.detallesTrasladado = ivaCargo[x].detalles;

            ObjIva.porcentajeExento = 0;

            ObjIva.baseIvaAcreditado = ivaAcreditable[x].baseIva
            ObjIva.importeIvaAcreditado = ivaAcreditable[x].importeIva
            ObjIva.detallesAcreditado = ivaAcreditable[x].detalles;

            ObjIva.ivaRetenidoAnterior = ivaRetenido[x].importeIva
            ObjIva.ivaRetenido = ivaRetenido[x + 1].importeIva

            let ivaCargo_ = ivaCargo[x].importeIva;
            let ivaAcreditado_ = ivaAcreditable[x].importeIva
            let ivaRetenido_ = ivaRetenido[x].importeIva
            let ivaRetenidoAnterior_ = ivaRetenido[x + 1].importeIva
            let calculo = ivaCargo_ - ivaAcreditado_ - ivaRetenido_ + ivaRetenidoAnterior_
            if (calculo > 0) {
              ObjIva.ivaCargo = calculo
              ObjIva.ivaFavor = 0
            } else {
              ObjIva.ivaCargo = 0
              ObjIva.ivaFavor = calculo * -1
            }

            //COMPARATIVA
            ObjIva.cargoRegistrado = comparativa[x].ivaCargo
            ObjIva.favorRegistrado = comparativa[x].ivaFavor

            let comparativa_ = (ObjIva.ivaCargo - ObjIva.ivaFavor - ObjIva.cargoRegistrado + ObjIva.favorRegistrado) * -1
            if (comparativa_ != 0) {
              comparativa_ = comparativa_ * -1;
            }
            ObjIva.comparativa = comparativa_;

            this.dataComprobantes.push(ObjIva);
            // console.log(ObjIva)
            ObjIva = {}
          }

          this.ivaCargo = this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.ivaCargo, 0)
          this.ivaFavor = this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.ivaFavor, 0)
          this.diferenciaIva = this.ivaCargo - this.ivaFavor

        } catch (error) {
          console.log(error)
        }
        for (let item of this.dataComprobantes) {
          let detalles = item.detallesTrasladado;
          let exento = detalles.filter(x => x.tipoFactor === 'Exento')
          let sumaTotal = detalles.reduce((acumulador, objeto) => acumulador + objeto.base_, 0)
          let sumaExento = exento.reduce((acumulador, objeto) => acumulador + objeto.base_, 0)
          let porcentaje = sumaExento / sumaTotal
          //console.log('Total', sumaTotal);
          //console.log('Exento', sumaExento);
         // console.log('Porcentaje', porcentaje)
          if (item.mes != '') {
            item.porcentajeExento = (porcentaje * 100);
          }
        }
      },

      async GetComparativa(año, tipo) {
        let respuesta = [
          { mes: 'ENERO', importe: 0, ivaCargo: 0, ivaFavor: 0 },
          { mes: 'FEBRERO', importe: 0, ivaCargo: 0, ivaFavor: 0 },
          { mes: 'MARZO', importe: 0, ivaCargo: 0, ivaFavor: 0 },
          { mes: 'ABRIL', importe: 0, ivaCargo: 0, ivaFavor: 0 },
          { mes: 'MAYO', importe: 0, ivaCargo: 0, ivaFavor: 0 },
          { mes: 'JUNIO', importe: 0, ivaCargo: 0, ivaFavor: 0 },
          { mes: 'JULIO', importe: 0, ivaCargo: 0, ivaFavor: 0 },
          { mes: 'AGOSTO', importe: 0, ivaCargo: 0, ivaFavor: 0 },
          { mes: 'SEPTIEMBRE', importe: 0, ivaCargo: 0, ivaFavor: 0 },
          { mes: 'OCTUBRE', importe: 0, ivaCargo: 0, ivaFavor: 0 },
          { mes: 'NOVIEMBRE', importe: 0, ivaCargo: 0, ivaFavor: 0 },
          { mes: 'DICIEMBRE', importe: 0, ivaCargo: 0, ivaFavor: 0 },
        ]
        try {
          let response = await axios.get(this.rutaAxios + 'Comparativa/GetComparativaAsync/erp_' + this.token.rfc + '/' + año + '/' + tipo);
          respuesta = response.data.comparativa
          return respuesta;
        } catch (error) {
          return respuesta;
        }
      },

      async GetIvaTrasladado() {
        try {
          let fechaI = this.selectedAnio + '-' + '01' + '-01';
          let fechaF = this.selectedAnio + '-' + this.selectedMes.value + '-01';

          let response = await axios.get(this.rutaAxios + 'Ingresos/GetReporteIvaAsync/erp_' + this.token.rfc + '/' + fechaI + '/' + fechaF);
          //console.log(response.data)
          return response.data;
        } catch (error) {
          console.log(error)
        }
      },

      async GetIvaAcreditado() {
        try {
          let fechaI = this.selectedAnio + '-' + '01' + '-01';
          let fechaF = this.selectedAnio + '-' + this.selectedMes.value + '-01';

          let response = await axios.get(this.rutaAxios + 'Gastos/GetReporteIvaAsync/erp_' + this.token.rfc + '/' + fechaI + '/' + fechaF);
          return response.data;
        } catch (error) {
          console.log(error)
        }
      },

      async GetIvaRetenido() {
        try {
          let añoSel = this.selectedAnio - 1
          let fechaI = añoSel + '-' + '12' + '-01';
          let fechaF = this.selectedAnio + '-' + this.selectedMes.value + '-01';

          let response = await axios.get(this.rutaAxios + 'Gastos/GetReporteIvaRetenidoAsync/erp_' + this.token.rfc + '/' + fechaI + '/' + fechaF);
          return response.data;
        } catch (error) {
          console.log(error)
        }
      },

      async GetReporteISR() {
        this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'white', spinnerSize: 100, message: 'Consultando reporte de ISR..', })

        await this.GetReporteNomina();
        await this.GetReporteIsr();
        this.$q.loading.hide()
      },

      async GetReporteNomina() {
        try {
          //CONSULTANOS LAS COMPARATIVAS
          let comparativaSueldos = await this.GetComparativa(this.selectedAnio, 'Sueldos');
          let comparativaAsimilados = await this.GetComparativa(this.selectedAnio, 'Asimilados');
          let comparativaOtros = await this.GetComparativa(this.selectedAnio, 'SueldosOtros');

          let fechaI = this.selectedAnio + '-' + this.selectedMes.value + '-01';
          let fechaF = this.selectedAnio + '-' + this.selectedMes.value + '-01';
          let response = await axios.get(this.rutaAxios + 'Nomina/GetReporteISrAsync/erp_' + this.token.rfc + '/' + fechaI + '/' + fechaF);
          let res = response.data;
          //console.log('res', res)
          let dataSueldos = res[0];
          let dataAsimilados = res[1];
          let dataOtros = res[2];

          this.totalSueldos = dataSueldos.reduce((acumulador, objeto) => acumulador + objeto.importe, 0)
          this.totalAsimilados = dataAsimilados.reduce((acumulador, objeto) => acumulador + objeto.importe, 0)
          this.totalOtros = dataOtros.reduce((acumulador, objeto) => acumulador + objeto.importe, 0)
        } catch (error) {
          console.log(error)
        }
      },

      async GetReporteIsr() {
        try {
          //CONSULTANOS LAS COMPARATIVAS
          let comparativaArrendamientos = await this.GetComparativa(this.selectedAnio, 'Arrendamientos');
          let comparativaHonorarios = await this.GetComparativa(this.selectedAnio, 'Honorarios');

          let fechaI = this.selectedAnio + '-' + this.selectedMes.value + '-01';
          let fechaF = this.selectedAnio + '-' + this.selectedMes.value + '-01';
          let response = await axios.get(this.rutaAxios + 'Gastos/GetReporteIsrAsync/erp_' + this.token.rfc + '/' + fechaI + '/' + fechaF);
          //console.log(response.data)

          let dataArrendamientos = response.data[0];
          let dataHonorarios = response.data[1];

          this.totalArrendamientos = dataArrendamientos.reduce((acumulador, objeto) => acumulador + objeto.importe, 0)
          this.totalHonorarios = dataHonorarios.reduce((acumulador, objeto) => acumulador + objeto.importe, 0)

        } catch (error) {
          console.log(error);
        }
      },

      async GetReporteIVARetenido() {
        try {
          //CONSULTANOS LAS COMPARATIVAS
          this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'white', spinnerSize: 100, message: 'Consultando retenciones de IVA..', })

          let ivaRetenido = [];
          let comparativaIva = await this.GetComparativa(this.selectedAnio, 'IVARetenido');

          let añoSel = this.selectedAnio - 1
          let fechaI = añoSel + '-' + '12' + '-01';
          let fechaF = this.selectedAnio + '-' + this.selectedMes.value + '-01';
          let response = await axios.get(this.rutaAxios + 'Gastos/GetReporteIvaRetenidoAsync/erp_' + this.token.rfc + '/' + fechaI + '/' + fechaF);
          ivaRetenido = response.data;

          this.retencionRecibido = ivaRetenido.reduce((acumulador, objeto) => acumulador + objeto.importeIva, 0)
          this.$q.loading.hide()

        } catch (error) {
          console.log(error);
          this.$q.loading.hide()
        }
      },
      ShowNotifsWarning(mensaje) {
        this.$q.notify({
          progress: true,
          message: mensaje,
          type: 'warning',
          position: 'top-right',
          actions: [
            { label: 'Cerrar', color: 'white', handler: () => { /* ... */ } }
          ]
        })
      },
      getLastDayOfMonth(year, month) {
        // El mes siguiente al mes actual
        var nextMonth = month < 12 ? month + 1 : 1;
        // El primer día del mes siguiente
        var nextMonthFirstDay = new Date(year, nextMonth - 1, 1);
        // Restar un día al primer día del mes siguiente
        return new Date(nextMonthFirstDay.getTime() - 1);
      }
    },
  };
</script>
<style>
  .logo-inicio {
    background-image: url("../../assets/logo_contago_sin_fondo.png");
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    margin: 0;
  }
</style>