<template>
    <div style="width: 100%;">

        <!-- DIALOG DE LOS DETALLES -->
        <q-dialog v-model="dialogDetalles" persistent transition-show="scale" transition-hide="scale" maximized>
            <detalles-nomina @CloseDialogDetalles="CloseDialogDetalles"></detalles-nomina>
        </q-dialog>

        <div class="titulo-reporte-nomina">
            NÓMINA TRABAJADORES
        </div>
        <div v-if="items && items.contenido">
            <div class="q-mb-md" v-for="(registros, mes) in items.contenido" :key="mes">
                <q-table :data="registros" :columns="columnsNomina" row-key="rfc" flat bordered
                    class="shadow-0 border-0" dense :title="mes">
                    <template v-slot:body="props">
                        <q-tr :props="props" class="hover-foliofiscal-n">
                            <q-td key="nombre" :props="props" @click="GetTrabajadores(props.row, mes)">{{
                                props.row.nombre }}</q-td>
                            <q-td key="rfc" :props="props" @click="GetTrabajadores(props.row, mes)">{{ props.row.rfc
                                }}</q-td>
                            <q-td key="contador" :props="props" @click="GetTrabajadores(props.row, mes)">{{
                                props.row.contador }}</q-td>
                            <q-td key="total" :props="props" @click="GetTrabajadores(props.row, mes)">{{
                                formatCurrency(props.row.total) }}</q-td>
                            <q-td key="totalPercepciones" :props="props" @click="GetTrabajadores(props.row, mes)">{{
                                formatCurrency(props.row.totalPercepciones)
                                }}</q-td>
                            <q-td key="totalDeducciones" :props="props" @click="GetTrabajadores(props.row, mes)">{{
                                formatCurrency(props.row.totalDeducciones)
                                }}</q-td>
                            <q-td key="totalOtrosPagos" :props="props" @click="GetTrabajadores(props.row, mes)">{{
                                formatCurrency(props.row.totalOtrosPagos)
                                }}</q-td>
                        </q-tr>
                    </template>
                </q-table>
                <q-table :data="[getTotales(registros)]" :columns="columnsTotales" dense flat bordered row-key="rfc"
                    class="shadow-0 border-0 q-mt-sm" hide-header hide-bottom>
                    <template v-slot:body="props">
                        <q-tr :props="props">
                            <q-td key="nombre" :props="props"><strong>Total</strong></q-td>
                            <q-td key="rfc" :props="props">{{ props.row.rfc }}</q-td>
                            <q-td key="contador" :props="props">{{ props.row.contador }}</q-td>
                            <q-td key="total" :props="props">{{ formatCurrency(props.row.total) }}</q-td>
                            <q-td key="totalPercepciones" :props="props">{{ formatCurrency(props.row.totalPercepciones)
                                }}</q-td>
                            <q-td key="totalDeducciones" :props="props">{{ formatCurrency(props.row.totalDeducciones)
                                }}</q-td>
                            <q-td key="totalOtrosPagos" :props="props">{{ formatCurrency(props.row.totalOtrosPagos)
                                }}</q-td>
                        </q-tr>
                    </template>
                </q-table>
            </div>
        </div>
    </div>
</template>
<script>

    import axios from 'axios'
    import moment from 'moment'
    import DetallesNomina from '../../Nomina/DetallesNomina.vue';
    import * as XLSX from 'xlsx';
    import { format } from 'date-fns';
    import { es } from 'date-fns/locale';
    import { QSpinnerCube } from 'quasar'

    export default {
        components: {
            DetallesNomina,
        },
        data() {
            return {
                columnsNomina: [
                    { name: 'nombre', label: 'Nombre', align: 'left', field: 'mes', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-nomina text-white' },
                    { name: 'rfc', label: 'RFC', align: 'center', field: 'mes', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-nomina text-white' },
                    { name: 'contador', label: '# Comprobantes', align: 'center', field: 'contador', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-nomina text-white' },
                    { name: 'total', label: 'Total', align: 'right', field: 'total', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-nomina text-white', },
                    { name: 'totalPercepciones', label: 'Total Percepciones', align: 'right', field: 'percepciones', sortable: true, classes: 'bg-grey-2 ellipsis ', headerClasses: 'bgc-nomina text-white' },
                    { name: 'totalDeducciones', label: 'Total Deducciones', align: 'right', field: 'deducciones', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-nomina text-white' },
                    { name: 'totalOtrosPagos', label: 'Total Otros Pagos', align: 'right', field: 'otrosPagos', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-nomina text-white', },
                ],
                columnsTotales: [
                    { name: 'nombre', label: 'Nombre', align: 'left', field: 'mes', sortable: true, classes: 'total-row-n ellipsis', headerClasses: 'bgc-nomina text-white' },
                    { name: 'rfc', label: 'RFC', align: 'center', field: 'mes', sortable: true, classes: 'total-row-n ellipsis', headerClasses: 'bgc-nomina text-white' },
                    { name: 'contador', label: '# Comprobantes', align: 'center', field: 'contador', sortable: true, classes: 'total-row-n ellipsis', headerClasses: 'bgc-nomina text-white' },
                    { name: 'total', label: 'Total', align: 'right', field: 'total', sortable: true, classes: 'total-row-n ellipsis', headerClasses: 'bgc-nomina text-white', },
                    { name: 'totalPercepciones', label: 'Total Percepciones', align: 'right', field: 'percepciones', sortable: true, classes: 'total-row-n ellipsis ', headerClasses: 'bgc-nomina text-white' },
                    { name: 'totalDeducciones', label: 'Total Deducciones', align: 'right', field: 'deducciones', sortable: true, classes: 'total-row-n ellipsis', headerClasses: 'bgc-nomina text-white' },
                    { name: 'totalOtrosPagos', label: 'Total Otros Pagos', align: 'right', field: 'otrosPagos', sortable: true, classes: 'total-row-n ellipsis', headerClasses: 'bgc-nomina text-white', },
                ],
                dataDetalles: [],
                dialogDetalles: false
            }
        },
        computed: {
            token() {
                return this.$store.state.usuario;
            },
            items() {
                return this.$store.state.dataViewReporte[12];
            },
            fechas() {
                return this.$store.state.fechasReporteEmpresarialStore;
            },
            rutaAxios() {
                return this.$store.state.rutaMongoStore
            },
        },
        methods: {
            formatCurrency(value) {
                return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
            },
            getTotales(registros) {
                return {
                    nombre: 'Total',
                    rfc: '-',
                    contador: registros.reduce((sum, r) => sum + (r.contador || 0), 0),
                    total: registros.reduce((sum, r) => sum + (r.total || 0), 0),
                    totalPercepciones: registros.reduce((sum, r) => sum + (r.totalPercepciones || 0), 0),
                    totalDeducciones: registros.reduce((sum, r) => sum + (r.totalDeducciones || 0), 0),
                    totalOtrosPagos: registros.reduce((sum, r) => sum + (r.totalOtrosPagos || 0), 0),
                };
            },
            async GetTrabajadores(item, mes) {
                this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'red-8', spinnerSize: 140, message: 'Consultando detalles de Trabajadores...' })

                const nombresMeses = [
                    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
                ];

                const numeroMes = nombresMeses.indexOf(mes.toLowerCase()) + 1;
                const año = this.fechas.anio;
                const mesFormateado = numeroMes.toString().padStart(2, '0');
                const fI = `${año}-${mesFormateado}-01`;
                const ultimoDia = new Date(año, numeroMes, 0).getDate(); // número de día
                const fF = `${año}-${mesFormateado}-${ultimoDia.toString().padStart(2, '0')}`;
                if (this.dataDetalles.length == 0) {
                    console.log('aqui si')
                    try {
                        let response = await axios.get(this.rutaAxios + 'Nomina/GetReporteTrabajadoresAsync/erp_' + this.token.rfc + '/' + fI + '/' + fF);
                        this.dataDetalles = response.data.detalles;
                        await this.OpenDialogDetalle(item)
                        this.$q.loading.hide()
                        return
                    } catch (error) {
                        console.log(error)
                    }
                }
                console.log('aqui no')

                await this.OpenDialogDetalle(item)
                this.$q.loading.hide()

            },
            OpenDialogDetalle(item) {
                let listaFiltrada = this.dataDetalles.filter(r => r.rfc === item.rfc);
                this.$store.state.detallesIsrStore.detalles = [...listaFiltrada]
                this.$store.state.detallesIsrStore.tipo = item.rfc + ' | ' + item.nombre
                this.$store.state.detallesIsrStore.origen = 'TRABAJADORES'
                this.dialogDetalles = true;
            },

            CloseDialogDetalles() {
                this.dialogDetalles = false;
            },

        },
    }
</script>
<style>
    .bgc-nomina {
        background-color: #C74F78 !important;
        text-align: center !important;
    }

    .total-row-n {
        background-color: #F7B2CC !important;
        font-weight: bold;
    }

    .titulo-reporte-nomina {
        background-color: #fff;
        color: #C74F78;
        font-size: 20px;
        font-weight: bold;
        padding: 10px 20px;
        text-align: center;
        border-bottom: 2px solid #C74F78;
        font-family: Arial, sans-serif;
    }

    .hover-foliofiscal-n:hover td {
        background-color: #F7B2CC !important;
        color: white;
        cursor: pointer;
    }
</style>