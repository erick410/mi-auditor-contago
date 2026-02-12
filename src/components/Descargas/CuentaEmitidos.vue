<template>
    <div class="q-pa-md">
        <!-- DIALOG LOADING -->
        <q-dialog v-model="dialog" persistent transition-show="scale" transition-hide="scale">
            <q-card style="width:100px; height: 110px;" :flat="true">
                <q-card-section>
                    <div class="text-center">
                        <q-spinner-cube color="blue" size="5.5em" />
                    </div>
                </q-card-section>
            </q-card>
        </q-dialog>

        <!-- DIALOG CONCILIACION -->
        <q-dialog v-model="dialogConciliaSat" transition-show="scale" transition-hide="scale">
            <q-card>
                <q-card-section class="bg-primary text-white">
                    <div class="text-h6">{{ cabeceraConciliacionSat }}</div>
                </q-card-section>
                <q-card-section>
                    <q-table :pagination.sync="pagination" :data="itemsConciliaSat" :columns="columnsConciliaSat"
                        row-key="tipo" :rows-per-page-options="[0]" flat>
                        <template v-slot:body="props">
                            <q-tr :props="props">
                                <q-td key="tipo" :props="props">{{ props.row.tipo }}</q-td>
                                <q-td key="cuentaC" :props="props">{{ FormatoMiles(props.row.cuentaC) }}</q-td>
                                <q-td key="cuentaS" :props="props">{{ FormatoMiles(props.row.cuentaS) }}</q-td>
                                <q-td key="diferencia" :props="props">{{ FormatoMiles(props.row.diferencia) }}</q-td>
                            </q-tr>
                        </template>
                    </q-table>
                </q-card-section>
                <q-card-actions vertical align="center">
                    <div>Fecha última conciliación</div>
                    <div>{{ fechaConciliaSat }}</div>
                    <q-btn color="primary" @click="ConsultaSat()">Consultar nuevamente</q-btn>
                </q-card-actions>
            </q-card>
        </q-dialog>

        <div class="row no-wrap items-center q-mt-md q-pa-sm">
            <q-space />
            <q-select outlined dense v-model="selectedAnio" :options="itemsAnios" label="Año" style="width:80px"
                class="q-mr-xs" />
            <q-btn push color="amber-9" @click="GetReporte" icon="mdi-text-box-search-outline" rounded flat size="18px"
                padding="xs">
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                    :offset="[10, 10]">Consultar</q-tooltip>
            </q-btn>
            <q-btn push color="green-9" @click="ConciliarPeriodo()" icon="mdi-code-equal" rounded flat size="18px"
                padding="xs">
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                    :offset="[10, 10]">Conciliar Periodo</q-tooltip>
            </q-btn>
            <q-space />
        </div>
        <div>
            <chart-component :chartData="chartData" :chartTitle="charTitleE"></chart-component>
        </div>
        <div class="row no-wrap items-center q-mt-md q-pa-sm">
            <q-space />
            <q-select outlined dense v-model="selectedMes" :options="itemsMes" label="Mes a Conciliar"
                style="width:170px" class="q-mr-xs" />
            <q-btn push color="green-9" @click="Conciliar()" icon="mdi-code-equal" rounded flat size="18px"
                padding="xs">
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                    :offset="[10, 10]">Conciliar Mes</q-tooltip>
            </q-btn>
            <q-space />
        </div>
        <q-table title="Comprobantes descargados y almacenados (Emitidos)" :pagination.sync="pagination"
            :data="itemsDescargas" :columns="columns" row-key="mes" :rows-per-page-options="[0]">
            <template v-slot:body="props">
                <q-tr :props="props">
                    <q-td key="Acciones" auto-width>
                        <q-btn keysize="sm" color="green" round dense @click="ConciliaSat(props.row)"
                            icon="mdi-select-compare">
                            <q-tooltip>
                                Conciliar con SAT
                            </q-tooltip>
                        </q-btn>

                        <!--<q-btn keysize="sm" color="red" round dense @click="ConciliaSatCancelados(props.row)"
                            icon="mdi-cancel">
                            <q-tooltip>
                                Validar Cancelados
                            </q-tooltip>
                        </q-btn> -->
                    </q-td>
                    <q-td key="mes" :props="props">{{ props.row.mes }}</q-td>
                    <q-td key="ingreso" :props="props">{{ FormatoMiles(props.row.ingreso) }}</q-td>
                    <q-td key="notasCredito" :props="props">{{ FormatoMiles(props.row.notasCredito) }}</q-td>
                    <q-td key="complementoPago" :props="props">{{ FormatoMiles(props.row.complementoPago) }}</q-td>
                    <q-td key="nomina" :props="props">{{ FormatoMiles(props.row.nomina) }}</q-td>
                    <q-td key="total" :props="props">{{ FormatoMiles(props.row.total) }}</q-td>
                </q-tr>
            </template>
        </q-table>
    </div>
</template>

<script>
    import axios from 'axios'
    import { parseISO, parse, isSameMonth } from 'date-fns'
    import * as XLSX from 'xlsx';
    import ChartComponent from "../Graficas/ChartComponent.vue";
    // import Utils from "../Graficas/Utils.js";
    import { QSpinnerCube } from 'quasar'

    export default {
        components: {
            ChartComponent,
        },
        data() {
            return {
                itemsAnios: ['2026','2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018'],
                itemsMes: [
                    { label: 'ENERO', value: 1 },
                    { label: 'FEBRERO', value: 2 },
                    { label: 'MARZO', value: 3 },
                    { label: 'ABRIL', value: 4 },
                    { label: 'MAYO', value: 5 },
                    { label: 'JUNIO', value: 6 },
                    { label: 'JULIO', value: 7 },
                    { label: 'AGOSTO', value: 8 },
                    { label: 'SEPTIEMBRE', value: 9 },
                    { label: 'OCTUBRE', value: 10 },
                    { label: 'NOVIEMBRE', value: 11 },
                    { label: 'DICIEMBRE', value: 12 },
                ],
                selectedAnio: 2026,
                selectedMes: null,

                //LOADING
                dialog: false,
                dialogtext: '',

                dataResult: null,

                chartData: null,
                charTitleE: '',

                columns: [
                    { name: 'Acciones', align: 'center', label: 'Acciones', field: 'Acciones', sortable: true },
                    { name: 'mes', align: 'center', label: 'Mes', field: 'mes', sortable: true },
                    { name: 'ingreso', align: 'right', label: 'Ingresos', field: 'ingreso', sortable: true },
                    { name: 'notasCredito', align: 'right', label: 'Notas de Crédito', field: 'notasCredito', sortable: true },
                    { name: 'complementoPago', align: 'right', label: 'Complementos de Pago', field: 'complementoPago', sortable: true },
                    { name: 'nomina', align: 'right', label: 'Nómina', field: 'nomina', sortable: true },
                    { name: 'total', align: 'right', label: 'Total', field: 'total', sortable: true },
                ],
                itemsDescargas: [],
                pagination: {
                    rowsPerPage: 0
                },

                //CONSILIACION SAT
                dialogConciliaSat: false,
                columnsConciliaSat: [
                    { name: 'tipo', align: 'center', label: 'Tipo', field: 'tipo', sortable: true },
                    { name: 'cuentaC', align: 'right', label: 'ContaGo', field: 'cuentaC', sortable: true },
                    { name: 'cuentaS', align: 'right', label: 'Sat', field: 'cuentaS', sortable: true },
                    { name: 'diferencia', align: 'right', label: 'Diferencia', field: 'diferencia', sortable: true },
                ],
                itemsConciliaSat: [],
                fechaConciliaSat: null,
                cabeceraConciliacionSat: '',
                mesConciliacion: 0,
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
            this.GetReporte()
        },
        methods: {
            async GetReporte() {
                this.dialogtext = 'Consultando, espere';
                this.dialog = true;
                this.itemsDescargas = [];
                try {
                    let response = await axios.get(this.rutaAxios + 'Comprobante/GetCuentaComprobantesAsync/erp_' + this.token.rfc + '/' + this.selectedAnio);
                    let x = response.data;
                    this.dataResult = x;
                    this.dialog = false;
                    this.charTitleE = 'Emitidos'
                    // console.log(x)
                    for (let a of x) {
                        a.total = a.ingreso + a.notasCredito + a.complementoPago + a.nomina;
                    }
                    this.itemsDescargas = [...x];
                    await this.GetGrafica();
                } catch (error) {
                    console.log(error)
                    this.dialog = false;
                }
            },

            async GetGrafica() {
                const ingresos = this.dataResult.map((item) => item.ingreso);
                const nominas = this.dataResult.map((item) => item.nomina);
                const pagos = this.dataResult.map((item) => item.complementoPago);
                const notas = this.dataResult.map((item) => item.notasCredito);

                const sumaIngresos = this.dataResult.reduce((acumulador, actual) => acumulador + actual.ingreso, 0);
                const sumaNotas = this.dataResult.reduce((acumulador, actual) => acumulador + actual.notasCredito, 0);
                const sumaNominas = this.dataResult.reduce((acumulador, actual) => acumulador + actual.nomina, 0);
                const sumaPagos = this.dataResult.reduce((acumulador, actual) => acumulador + actual.complementoPago, 0);
                const sumaTotal = sumaIngresos + sumaNotas + sumaNominas + sumaPagos;

                let ObjIngresos = {
                    label: "Ingresos: " + this.FormatoMiles(sumaIngresos),
                    backgroundColor: "rgba(0, 163, 92, 0.5)",
                    borderColor: "rgba(0, 163, 92)",
                    borderWidth: 1,
                    data: ingresos,
                }

                let ObjNomina = {
                    label: "Nómina: " + this.FormatoMiles(sumaNominas),
                    backgroundColor: "rgba(255, 148, 166, 0.5)",
                    borderColor: "rgba(255, 148, 166)",
                    borderWidth: 1,
                    data: nominas,
                }

                let ObjPagos = {
                    label: "Complementos de Pago: " + this.FormatoMiles(sumaPagos),
                    backgroundColor: "rgba(255, 108, 55, 0.5)",
                    borderColor: "rgba(255, 108, 55)",
                    borderWidth: 1,
                    data: pagos,
                }

                let ObjNotas = {
                    label: "Notas de Crédito: " + this.FormatoMiles(sumaNotas),
                    backgroundColor: "rgba(54, 162, 235, 0.5)",
                    borderColor: "rgba(54, 162, 235)",
                    borderWidth: 1,
                    data: notas,
                }

                let chartDatas = {
                    labels: ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'],
                    datasets: []
                }
                chartDatas.datasets.push(ObjIngresos)
                chartDatas.datasets.push(ObjNomina)
                chartDatas.datasets.push(ObjPagos)
                chartDatas.datasets.push(ObjNotas)
                this.chartData = { ...chartDatas }

                this.charTitleE = 'Emitidos: ' + this.FormatoMiles(sumaTotal)
            },

            FormatCurrency(value) {
                return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
            },

            FormatoMiles(value) {
                return value.toLocaleString('en-US');
            },

            async Conciliar() {
                this.dialog = true;
                let mes = this.selectedMes.label.toLowerCase();
                try {
                    let response = await axios.post('/Descargas/PostComprobantesMongoAsync/' + this.token.rfc + '/' + this.selectedAnio + '/' + mes + '/Emitido');
                    console.log(response.data)
                    this.dialog = false;
                } catch (error) {
                    console.log(error)
                    this.dialog = false;
                }
            },

            async ConciliarPeriodo() {
                let meses = this.itemsMes;
                for (let element of meses) {
                    let mes = element.label.toLowerCase();
                    this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'purple', spinnerSize: 140, message: 'Conciliando ' + mes + '...', messageColor: 'white' })
                    console.log(mes);
                    try {
                        let response = await axios.post('Descargas/PostComprobantesMongoAsync/' + this.token.rfc + '/' + this.selectedAnio + '/' + mes + '/Emitido');
                        console.log(response.data)
                    } catch (error) {
                        console.log(error)
                        this.$q.loading.hide()
                    }
                };
                this.$q.loading.hide()
            },

            async ConciliaSat(item) {
                this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'purple', spinnerSize: 140, message: 'Consultando con la platadorma del SAT...', messageColor: 'white' })
                const meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
                const año = this.selectedAnio;
                const mes = meses.indexOf(item.mes) + 1;
                const dia = await this.UltimoDiaDelMes(año, mes)
                let fI = año + '-' + mes + '-01';
                let fF = año + '-' + mes + '-' + dia;
                this.itemsConciliaSat = [];
                this.cabeceraConciliacionSat = 'Conciliación ' + item.mes + ' ' + año;
                this.mesConciliacion = mes;
                //VALIDAMOS SI YA SE HIZO LA CONCILIACION
                const conciliacion = await this.GetConciliaSat(año, mes);
                let lista_ = ['INGRESO', 'EGRESO', 'PAGO', 'NOMINA'];
                if (conciliacion) {
                    for (let x of lista_) {
                        if (x === 'INGRESO') {
                            let obj = {
                                tipo: x,
                                cuentaC: item.ingreso,
                                cuentaS: conciliacion[0].cantidad,
                                diferencia: item.ingreso - conciliacion[0].cantidad,
                            }
                            this.itemsConciliaSat.push(obj);
                        } else if (x === 'EGRESO') {
                            let obj = {
                                tipo: x,
                                cuentaC: item.notasCredito,
                                cuentaS: conciliacion[1].cantidad,
                                diferencia: item.notasCredito - conciliacion[1].cantidad,
                            }
                            this.itemsConciliaSat.push(obj);
                        } else if (x === 'PAGO') {
                            let obj = {
                                tipo: x,
                                cuentaC: item.complementoPago,
                                cuentaS: conciliacion[2].cantidad,
                                diferencia: item.complementoPago - conciliacion[2].cantidad,
                            }
                            this.itemsConciliaSat.push(obj);
                        } else if (x === 'NOMINA') {
                            let obj = {
                                tipo: x,
                                cuentaC: item.nomina,
                                cuentaS: conciliacion[3].cantidad,
                                diferencia: item.nomina - conciliacion[3].cantidad,
                            }
                            this.itemsConciliaSat.push(obj);
                        }
                    }
                } else {
                    const res = await this.GetConciliacionSat(mes, año, fI, fF);
                    if (!res) {
                        this.$q.notify({ type: 'negative', message: 'Error al consultar, intente nuevamente y verifique los datos de consulta' })
                        this.$q.loading.hide();
                        return;
                    }
                    for (let x of lista_) {
                        if (x === 'INGRESO') {
                            let obj = {
                                tipo: x,
                                cuentaC: item.ingreso,
                                cuentaS: res[0].cantidad,
                                diferencia: item.ingreso - res[0].cantidad,
                            }
                            this.itemsConciliaSat.push(obj);
                        } else if (x === 'EGRESO') {
                            let obj = {
                                tipo: x,
                                cuentaC: item.notasCredito,
                                cuentaS: res[1].cantidad,
                                diferencia: item.notasCredito - res[1].cantidad,
                            }
                            this.itemsConciliaSat.push(obj);
                        } else if (x === 'PAGO') {
                            let obj = {
                                tipo: x,
                                cuentaC: item.complementoPago,
                                cuentaS: res[2].cantidad,
                                diferencia: item.complementoPago - res[2].cantidad,
                            }
                            this.itemsConciliaSat.push(obj);
                        } else if (x === 'NOMINA') {
                            let obj = {
                                tipo: x,
                                cuentaC: item.nomina,
                                cuentaS: res[3].cantidad,
                                diferencia: item.nomina - res[3].cantidad,
                            }
                            this.itemsConciliaSat.push(obj);
                        }
                    }
                    this.$q.loading.hide();

                }
                this.dialogConciliaSat = true;
                this.$q.loading.hide();
            },

            async ConciliaSatCancelados(item){
                this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'purple', spinnerSize: 140, message: 'Consultando cancelados con la platadorma del SAT...', messageColor: 'white' })
                const meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
                const año = this.selectedAnio;
                const mes = meses.indexOf(item.mes) + 1;
                const dia = await this.UltimoDiaDelMes(año, mes)
                const fI = año + '-' + mes + '-01';
                const fF = año + '-' + mes + '-' + dia;
                console.log(fI, fF)
                try{
                    let response = await axios.get('https://api-scrapper-a.contago.com.mx/Cancelaciones/' + fI + '/' + fF + '/Emitidos/' + this.token.rfc);
                    this.$q.loading.hide();
                    this.$q.notify({ type: 'warning', message: response.data })
                }catch(error){
                    console.log(error)
                    this.$q.notify({ type: 'negative', message: error.data })
                    this.$q.loading.hide();
                }
                // let response = await axios.get('http://localhost:8080/Cancelaciones/' + fI + '/' + fF + '/Emitidos/' + this.token.rfc);
            },

            async GetConciliacionSat(mes, año, fI, fF) {
                try {
                    let items = [];
                    // let response = await axios.get('http://localhost:8080/Metadata/' + fI + '/' + fF + '/Emitidos/' + this.token.rfc);
                    let response = await axios.get('https://api-scrapper-a.contago.com.mx/Metadata/' + fI + '/' + fF + '/Emitidos/' + this.token.rfc);
                    let obj = { ...response.data }

                    let ingreso = obj.hasOwnProperty('ingreso') ? obj.ingreso : 0;
                    let egreso = obj.hasOwnProperty('egreso') ? obj.egreso : 0;
                    let pago = obj.hasOwnProperty('pago') ? obj.pago : 0;
                    let nomina = obj.hasOwnProperty('nómina') ? obj.nómina : 0;

                    if (ingreso + egreso + pago + nomina != 0) {
                        let objIngreso = { tipo: 'Ingreso', cantidad: ingreso };
                        let objEgreso = { tipo: 'Egreso', cantidad: egreso };
                        let objPago = { tipo: 'Pago', cantidad: pago };
                        let objNomina = { tipo: 'Nomina', cantidad: nomina };
                        items.push(objIngreso);
                        items.push(objEgreso);
                        items.push(objPago);
                        items.push(objNomina);
                        await this.PostConciliaSat(mes, año, items)
                    } else {
                        this.$q.loading.hide();
                        return null;
                    }
                    return items;
                } catch (error) {
                    console.log(error);
                    this.$q.loading.hide();
                }
            },

            async PostConciliaSat(mes, año, items) {
                try {
                    let objConcilado = {
                        año: año,
                        mes: mes,
                        tipo: 'Emitidos',
                        fechaConsulta: new Date(),
                        detalle: items,
                    };
                    let response = await axios.post('/Descargas/PostConcilacionSatAsync/' + this.token.rfc, objConcilado);
                } catch (erro) {
                    console.log(error);
                }
            },

            async GetConciliaSat(año, mes) {
                try {
                    let response = await axios.get('/Descargas/GetConcilacionSatAsync/' + this.token.rfc + '/' + año + '/' + mes + '/Emitidos');
                    this.fechaConciliaSat = response.data.fechaConsulta;
                    return response.data.detalle;
                } catch (error) {

                }
            },

            async UltimoDiaDelMes(año, mes) {
                let fecha = new Date(año, mes, 0);
                return fecha.getDate();
            },

            async ConsultaSat() {
                this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'purple', spinnerSize: 140, message: 'Consultando con la platadorma del SAT...', messageColor: 'white' });
                const año = this.selectedAnio;
                const mes = this.mesConciliacion;
                const dia = await this.UltimoDiaDelMes(año, mes)
                let fI = año + '-' + mes + '-01';
                let fF = año + '-' + mes + '-' + dia;
                let item = [...this.itemsConciliaSat]
                this.itemsConciliaSat = [];
                const res = await this.GetConciliacionSat(mes, año, fI, fF);
                if (!res) {

                    this.$q.notify({ type: 'negative', message: 'Error al consultar, intente nuevamente y verifique los datos de consulta' })
                    this.$q.loading.hide();
                    return;
                }
                let lista_ = ['INGRESO', 'EGRESO', 'PAGO', 'NOMINA'];

                for (let x of lista_) {
                    if (x === 'INGRESO') {
                        let obj = {
                            tipo: x,
                            cuentaC: item[0].cuentaC,
                            cuentaS: res[0].cantidad,
                            diferencia: item[0].cuentaC - res[0].cantidad,
                        }
                        this.itemsConciliaSat.push(obj);
                    } else if (x === 'EGRESO') {
                        let obj = {
                            tipo: x,
                            cuentaC: item[1].cuentaC,
                            cuentaS: res[1].cantidad,
                            diferencia: item[1].cuentaC - res[1].cantidad,
                        }
                        this.itemsConciliaSat.push(obj);
                    } else if (x === 'PAGO') {
                        let obj = {
                            tipo: x,
                            cuentaC: item[2].cuentaC,
                            cuentaS: res[2].cantidad,
                            diferencia: item[2].cuentaC - res[2].cantidad,
                        }
                        this.itemsConciliaSat.push(obj);
                    } else if (x === 'NOMINA') {
                        let obj = {
                            tipo: x,
                            cuentaC: item[3].cuentaC,
                            cuentaS: res[3].cantidad,
                            diferencia: item[3].cuentaC - res[3].cantidad,
                        }
                        this.itemsConciliaSat.push(obj);
                    }
                }
                this.$q.loading.hide();
            },

        },
    }
</script>