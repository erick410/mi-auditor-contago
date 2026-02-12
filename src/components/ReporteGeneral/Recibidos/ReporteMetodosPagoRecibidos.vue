<template>
    <div style="width: 100%;">

        <!-- DIALOG DE LOS DETALLES -->
        <q-dialog v-model="dialogDetalles" persistent transition-show="scale" transition-hide="scale" maximized>
            <detalles @CloseDialogDetalles="CloseDialogDetalles"></detalles>
        </q-dialog>


        <div class="titulo-reporte-recibidos">
            REPORTE METODOS DE PAGO
        </div>
        <div v-if="items && items.contenido" class="q-mb-md">
            <q-table :data="items.contenido" :columns="columnsIngreso" row-key="mes" flat bordered
                class="shadow-0 border-0" dense>
                <template v-slot:body="props">
                    <q-tr :props="props">
                        <q-td key="mes" :props="props">{{ props.row.mes }}</q-td>
                        <q-td key="importePpd" :props="props" @click="GetDetallePPD(props.row)">{{
                            formatCurrency(props.row.importePpd) }}</q-td>
                        <q-td key="importePue" :props="props" @click="GetDetallePUE(props.row)">{{
                            formatCurrency(props.row.importePue) }}</q-td>
                    </q-tr>
                </template>
            </q-table>
            <q-table :data="[getTotales(items.contenido)]" :columns="columnsTotales" dense flat bordered row-key="mes"
                class="shadow-0 border-0 q-mt-sm" hide-header hide-bottom>
                <template v-slot:body="props">
                    <q-tr :props="props">
                        <q-td key="mes" :props="props"><strong>Total</strong></q-td>
                        <q-td key="importePpd" :props="props">{{ formatCurrency(props.row.importePpd) }}</q-td>
                        <q-td key="importePue" :props="props">{{ formatCurrency(props.row.importePue) }}</q-td>
                    </q-tr>
                </template>
            </q-table>
        </div>
    </div>
</template>
<script>
    import axios from 'axios'
    import { parseISO, parse, isSameMonth } from 'date-fns'
    import detalles from '../../Compras/FacturacionDetG.vue'
    import * as XLSX from 'xlsx';
    import { QSpinnerCube } from 'quasar'

    export default {
        components: {
            detalles
        },
        data() {
            return {
                columnsIngreso: [
                    { name: 'mes', label: 'Mes', align: 'center', field: 'mes', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-recibidos text-white' },
                    { name: 'importePpd', label: 'Importe PPD', align: 'right', field: 'importePpd', sortable: true, classes: 'bg-grey-2 ellipsis hover-foliofiscal-r', headerClasses: 'bgc-recibidos text-white', },
                    { name: 'importePue', label: 'Importe PUE', align: 'right', field: 'importePue', sortable: true, classes: 'bg-grey-2 ellipsis hover-foliofiscal-r', headerClasses: 'bgc-recibidos text-white' },
                ],

                columnsTotales: [
                    { name: 'mes', label: 'Mes', align: 'center', field: 'mes', sortable: true, classes: 'total-row-r ellipsis', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'importePpd', label: 'Importe PPD', align: 'right', field: 'importePpd', sortable: true, classes: 'total-row-r ellipsis', headerClasses: 'bgc-emitidos text-white', },
                    { name: 'importePue', label: 'Importe PUE', align: 'right', field: 'importePue', sortable: true, classes: 'total-row-r ellipsis', headerClasses: 'bgc-emitidos text-white' },
                ],

                //LOADING
                dialog: false,
                dialogtext: '',

                //DATOS DE LOS DETALLES
                dialogDetalles: false,
            }
        },
        computed: {
            token() {
                return this.$store.state.usuario;
            },
            items() {
                return this.$store.state.dataViewReporte[17];
            },
            fechas() {
                return this.$store.state.fechasReporteEmpresarialStore;
            },
            rutaAxios() {
                return this.$store.state.rutaMongoStore
            }
        },
        methods: {
            formatCurrency(value) {
                return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
            },
            getTotales(registros) {
                return {
                    mes: 'Total',
                    importePpd: registros.reduce((sum, r) => sum + (r.importePpd || 0), 0),
                    importePue: registros.reduce((sum, r) => sum + (r.importePue || 0), 0)
                };
            },
            async GetDetallePPD(item) {
                this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'red-8', spinnerSize: 140, message: 'Consultando información...', })
                const nombresMeses = [
                    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
                ];
                const numeroMes = nombresMeses.indexOf(item.mes.toLowerCase()) + 1;
                const año = this.fechas.anio;
                console.log(numeroMes, año);
                let fI = año + '-' + numeroMes + '-01';
                let fF = año + '-' + numeroMes + '-01';
                //CONSULTAMOS LOS DETALLES DEL MES SELECCIONADO
                let respuesta = [];
                try {
                    let response = await axios.get(this.rutaAxios + 'Gastos/GetReportePeriodoDetAsync/erp_' + this.token.rfc + '/' + fI + '/' + fF);
                    respuesta = response.data.detalles;
                    this.$q.loading.hide()

                    this.$store.state.detallesFacturacionStore.cabecera = 'INGRESOS ' + item.mes.toUpperCase() + ' DEL ' + this.fechas.anio;
                    this.$store.state.detallesFacturacionStore.detalles = respuesta.filter(x => x.metodoPago == 'PPD | Pago en parcialidades o diferido');
                    this.dialogDetalles = true;
                } catch (error) {
                    console.log(error);
                    this.$q.loading.hide()
                }
            },

            async GetDetallePUE(item) {
                this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'red-8', spinnerSize: 140, message: 'Consultando información...', })
                const nombresMeses = [
                    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
                ];
                const numeroMes = nombresMeses.indexOf(item.mes.toLowerCase()) + 1;
                const año = this.fechas.anio;
                console.log(numeroMes, año);
                let fI = año + '-' + numeroMes + '-01';
                let fF = año + '-' + numeroMes + '-01';
                //CONSULTAMOS LOS DETALLES DEL MES SELECCIONADO
                let respuesta = [];
                try {
                    let response = await axios.get(this.rutaAxios + 'Gastos/GetReportePeriodoDetAsync/erp_' + this.token.rfc + '/' + fI + '/' + fF);
                    respuesta = response.data.detalles;
                    this.$q.loading.hide()

                    this.$store.state.detallesFacturacionStore.cabecera = 'INGRESOS ' + item.mes.toUpperCase() + ' DEL ' + this.fechas.anio;
                    this.$store.state.detallesFacturacionStore.detalles = respuesta.filter(x => x.metodoPago == 'PUE | Pago en una sola exhibición');
                    this.dialogDetalles = true;
                } catch (error) {
                    console.log(error);
                    this.$q.loading.hide()
                }
            },
            CloseDialogDetalles() {
                this.dialogDetalles = false;
            },
        },
    }
</script>
<style>
    .bgc-recibidos {
        background-color: #294A8C !important;
        text-align: center !important;
    }

    .total-row-r {
        background-color: #6E8CC7 !important;
        font-weight: bold;
    }

    .titulo-reporte-recibidos {
        background-color: #fff;
        color: #294A8C;
        font-size: 20px;
        font-weight: bold;
        padding: 10px 20px;
        text-align: center;
        border-bottom: 2px solid #294A8C;
        font-family: Arial, sans-serif;
    }

    .hover-foliofiscal-r:hover {
        background-color: #6E8CC7 !important;
        color: white;
        cursor: pointer;
    }
</style>