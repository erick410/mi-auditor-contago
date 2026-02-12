<template>
    <div style="width: 100%;">

        <!-- DIALOG DE LOS DETALLES -->
        <q-dialog v-model="dialogDetalles" persistent transition-show="scale" transition-hide="scale" maximized>
            <detalles @CloseDialogDetalles="CloseDialogDetalles"></detalles>
        </q-dialog>

        <div class="titulo-reporte-recibidos">
            RECIBIDOS TIPO INGRESO
        </div>
        <div v-if="items && items.contenido" class="q-mb-md">
            <q-table :data="items.contenido" :columns="columnsIngreso" row-key="mes" flat bordered
                class="shadow-0 border-0" dense>
                <template v-slot:body="props">
                    <q-tr :props="props" class="hover-foliofiscal-r">
                        <q-td key="mes" :props="props" @click="GetDetalleI(props.row)">{{ props.row.mes }}</q-td>
                        <q-td key="contadorI" :props="props" @click="GetDetalleI(props.row)">{{ props.row.contadorI
                            }}</q-td>
                        <q-td key="subTotalI" :props="props" @click="GetDetalleI(props.row)">{{
                            formatCurrency(props.row.subTotalI) }}</q-td>
                        <q-td key="trasladosI" :props="props" @click="GetDetalleI(props.row)">{{
                            formatCurrency(props.row.trasladosI) }}</q-td>
                        <q-td key="retencionesI" :props="props" @click="GetDetalleI(props.row)">{{
                            formatCurrency(props.row.retencionesI) }}</q-td>
                        <q-td key="totalI" :props="props" @click="GetDetalleI(props.row)">{{
                            formatCurrency(props.row.totalI) }}</q-td>
                    </q-tr>
                </template>
            </q-table>
            <q-table :data="[getTotalesI(items.contenido)]" :columns="columnsTotalesI" dense flat bordered row-key="mes"
                class="shadow-0 border-0 q-mt-sm" hide-header hide-bottom>
                <template v-slot:body="props">
                    <q-tr :props="props">
                        <q-td key="mes" :props="props"><strong>Total</strong></q-td>
                        <q-td key="contadorI" :props="props">{{ props.row.contadorI }}</q-td>
                        <q-td key="subTotalI" :props="props">{{ formatCurrency(props.row.subTotalI) }}</q-td>
                        <q-td key="trasladosI" :props="props">{{ formatCurrency(props.row.trasladosI) }}</q-td>
                        <q-td key="retencionesI" :props="props">{{ formatCurrency(props.row.retencionesI) }}</q-td>
                        <q-td key="totalI" :props="props">{{ formatCurrency(props.row.totalI) }}</q-td>
                    </q-tr>
                </template>
            </q-table>
        </div>

        <div class="titulo-reporte-recibidos">
            RECIBIDOS TIPO EGRESO
        </div>
        <div v-if="items && items.contenido" class="q-mb-md">
            <q-table :data="items.contenido" :columns="columnsEgreso" row-key="mes" flat bordered
                class="shadow-0 border-0" dense>
                <template v-slot:body="props">
                    <q-tr :props="props" class="hover-foliofiscal-r">
                        <q-td key="mes" :props="props" @click="GetDetalleE(props.row)">{{ props.row.mes }}</q-td>
                        <q-td key="contadorE" :props="props" @click="GetDetalleE(props.row)">{{ props.row.contadorE
                            }}</q-td>
                        <q-td key="subTotalE" :props="props" @click="GetDetalleE(props.row)">{{
                            formatCurrency(props.row.subTotalE) }}</q-td>
                        <q-td key="trasladosE" :props="props" @click="GetDetalleE(props.row)">{{
                            formatCurrency(props.row.trasladosE) }}</q-td>
                        <q-td key="retencionesE" :props="props" @click="GetDetalleE(props.row)">{{
                            formatCurrency(props.row.retencionesE) }}</q-td>
                        <q-td key="totalE" :props="props" @click="GetDetalleE(props.row)">{{
                            formatCurrency(props.row.totalE) }}</q-td>
                    </q-tr>
                </template>
            </q-table>
            <q-table :data="[getTotalesE(items.contenido)]" :columns="columnsTotalesE" dense flat bordered row-key="mes"
                class="shadow-0 border-0 q-mt-sm" hide-header hide-bottom>
                <template v-slot:body="props">
                    <q-tr :props="props">
                        <q-td key="mes" :props="props"><strong>Total</strong></q-td>
                        <q-td key="contadorE" :props="props">{{ props.row.contadorE }}</q-td>
                        <q-td key="subTotalE" :props="props">{{ formatCurrency(props.row.subTotalE) }}</q-td>
                        <q-td key="trasladosE" :props="props">{{ formatCurrency(props.row.trasladosE) }}</q-td>
                        <q-td key="retencionesE" :props="props">{{ formatCurrency(props.row.retencionesE) }}</q-td>
                        <q-td key="totalE" :props="props">{{ formatCurrency(props.row.totalE) }}</q-td>
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
    import moment from "moment";
    import { QSpinnerCube } from 'quasar'
    export default {
        components: {
            detalles,
        },
        data() {
            return {
                columnsIngreso: [
                    { name: 'mes', label: 'Mes', align: 'center', field: 'mes', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-recibidos text-white' },
                    { name: 'contadorI', label: '# Comprobantes', align: 'center', field: 'contadorI', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-recibidos text-white', },
                    { name: 'subTotalI', label: 'SubTotal', align: 'right', field: 'subTotalI', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-recibidos text-white' },
                    { name: 'trasladosI', label: 'Traslados', align: 'right', field: 'trasladosI', sortable: true, classes: 'bg-grey-2 ellipsis ', headerClasses: 'bgc-recibidos text-white' },
                    { name: 'retencionesI', label: 'Retenciones', align: 'right', field: 'retencionesI', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-recibidos text-white' },
                    { name: 'totalI', label: 'Total', align: 'right', field: 'totalI', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-recibidos text-white' },
                ],

                columnsEgreso: [
                    { name: 'mes', label: 'Mes', align: 'center', field: 'mes', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-recibidos text-white' },
                    { name: 'contadorE', label: '# Comprobantes', align: 'center', field: 'contadorE', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-recibidos text-white', },
                    { name: 'subTotalE', label: 'SubTotal', align: 'right', field: 'subTotalE', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-recibidos text-white' },
                    { name: 'trasladosE', label: 'Traslados', align: 'right', field: 'trasladosE', sortable: true, classes: 'bg-grey-2 ellipsis ', headerClasses: 'bgc-recibidos text-white' },
                    { name: 'retencionesE', label: 'Retenciones', align: 'right', field: 'retencionesE', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-recibidos text-white' },
                    { name: 'totalE', label: 'Total', align: 'right', field: 'totalE', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-recibidos text-white' },
                ],
                columnsTotalesI: [
                    { name: 'mes', label: 'Mes', align: 'center', field: 'mes', sortable: true, classes: 'total-row-r ellipsis', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'contadorI', label: '# Comprobantes', align: 'center', field: 'contadorI', sortable: true, classes: 'total-row-r ellipsis', headerClasses: 'bgc-emitidos text-white', },
                    { name: 'subTotalI', label: 'SubTotal', align: 'right', field: 'subTotalI', sortable: true, classes: 'total-row-r ellipsis', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'trasladosI', label: 'Traslados', align: 'right', field: 'trasladosI', sortable: true, classes: 'total-row-r ellipsis ', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'retencionesI', label: 'Retenciones', align: 'right', field: 'retencionesI', sortable: true, classes: 'total-row-r ellipsis', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'totalI', label: 'Total', align: 'right', field: 'totalI', sortable: true, classes: 'total-row-r ellipsis', headerClasses: 'bgc-emitidos text-white' },
                ],

                columnsTotalesE: [
                    { name: 'mes', label: 'Mes', align: 'center', field: 'mes', sortable: true, classes: 'total-row-r ellipsis', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'contadorE', label: '# Comprobantes', align: 'center', field: 'contadorE', sortable: true, classes: 'total-row-r ellipsis', headerClasses: 'bgc-emitidos text-white', },
                    { name: 'subTotalE', label: 'SubTotal', align: 'right', field: 'subTotalE', sortable: true, classes: 'total-row-r ellipsis', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'trasladosE', label: 'Traslados', align: 'right', field: 'trasladosE', sortable: true, classes: 'total-row-r ellipsis ', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'retencionesE', label: 'Retenciones', align: 'right', field: 'retencionesE', sortable: true, classes: 'total-row-r ellipsis', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'totalE', label: 'Total', align: 'right', field: 'totalE', sortable: true, classes: 'total-row-r ellipsis', headerClasses: 'bgc-emitidos text-white' },
                ],
                //DATOS DE LOS DETALLES
                dialogDetalles: false,
            }
        },
        computed: {
            token() {
                return this.$store.state.usuario;
            },
            items() {
                return this.$store.state.dataViewReporte[4];
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
            getTotalesE(registros) {
                return {
                    mes: 'Total',
                    contadorE: registros.reduce((sum, r) => sum + (r.contadorE || 0), 0),
                    subTotalE: registros.reduce((sum, r) => sum + (r.subTotalE || 0), 0),
                    trasladosE: registros.reduce((sum, r) => sum + (r.trasladosE || 0), 0),
                    retencionesE: registros.reduce((sum, r) => sum + (r.retencionesE || 0), 0),
                    totalE: registros.reduce((sum, r) => sum + (r.totalE || 0), 0)
                };
            },
            getTotalesI(registros) {
                return {
                    mes: 'Total',
                    contadorI: registros.reduce((sum, r) => sum + (r.contadorI || 0), 0),
                    subTotalI: registros.reduce((sum, r) => sum + (r.subTotalI || 0), 0),
                    trasladosI: registros.reduce((sum, r) => sum + (r.trasladosI || 0), 0),
                    retencionesI: registros.reduce((sum, r) => sum + (r.retencionesI || 0), 0),
                    totalI: registros.reduce((sum, r) => sum + (r.totalI || 0), 0)
                };
            },
            async GetDetalleI(item) {
                this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'red-8', spinnerSize: 140, message: 'Consultando información...', })
                const nombresMeses = [
                    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
                ];
                const numeroMes = nombresMeses.indexOf(item.mes) + 1;
                const año = this.fechas.anio;

                let i = moment({ year: this.fechas.anio, month: this.fechas.mesInicial - 1, day: 1 }).format('MM');
                let f = moment({ year: this.fechas.anio, month: this.fechas.mesFinal - 1 }).endOf('month').format('YYYY-MM-DD');
                let fI = this.fechas.anio + '-' + numeroMes + '-01';
                let fF = this.fechas.anio + '-' + numeroMes + '-01';

                let respuesta = [];
                try {
                    let response = await axios.get(this.rutaAxios + 'Gastos/GetReportePeriodoDetAsync/erp_' + this.token.rfc + '/' + fI + '/' + fF);
                    console.log(response.data.detalles)
                    respuesta = response.data.detalles;
                    this.$q.loading.hide()

                    this.$store.state.detallesFacturacionStore.cabecera = 'RECIBIDOS TIPO INGRESO ' + item.mes.toUpperCase() + ' DEL ' + this.fechas.anio;
                    this.$store.state.detallesFacturacionStore.detalles = respuesta.filter(x => x.tipoComprobante == "I");
                    this.dialogDetalles = true;
                } catch (error) {
                    console.log(error);
                    this.$q.loading.hide()
                }
            },
            async GetDetalleE(item) {
                this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'red-8', spinnerSize: 140, message: 'Consultando información...', })
                const nombresMeses = [
                    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
                ];
                const numeroMes = nombresMeses.indexOf(item.mes) + 1;
                const año = this.fechas.anio;

                let i = moment({ year: this.fechas.anio, month: this.fechas.mesInicial - 1, day: 1 }).format('MM');
                let f = moment({ year: this.fechas.anio, month: this.fechas.mesFinal - 1 }).endOf('month').format('YYYY-MM-DD');
                let fI = this.fechas.anio + '-' + numeroMes + '-01';
                let fF = this.fechas.anio + '-' + numeroMes + '-01';

                let respuesta = [];
                try {
                    let response = await axios.get(this.rutaAxios + 'Gastos/GetReportePeriodoDetAsync/erp_' + this.token.rfc + '/' + fI + '/' + fF);
                    console.log(response.data.detalles)
                    respuesta = response.data.detalles;
                    this.$q.loading.hide()

                    this.$store.state.detallesFacturacionStore.cabecera = 'RECIBIDOS TIPO EGRESO ' + item.mes.toUpperCase() + ' DEL ' + this.fechas.anio;
                    this.$store.state.detallesFacturacionStore.detalles = respuesta.filter(x => x.tipoComprobante == "E");
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

    .hover-foliofiscal-r:hover td {
        background-color: #6E8CC7 !important;
        color: white;
        cursor: pointer;
    }
</style>