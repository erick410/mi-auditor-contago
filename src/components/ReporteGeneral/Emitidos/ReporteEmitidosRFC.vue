<template>
    <div style="width: 100%;">

        <!-- DIALOG DE LOS DETALLES -->
        <q-dialog v-model="dialogDetalles" persistent transition-show="scale" transition-hide="scale" maximized>
            <detalles @CloseDialogDetalles="CloseDialogDetalles"></detalles>
        </q-dialog>


        <div class="titulo-reporte-emitidos">
            COMPROBANTES EMITIDOS POR RFC
        </div>
        <div v-if="items && items.contenido" class="q-mb-md">
            <q-table :data="items.contenido" :columns="columnsIngreso" row-key="mes" flat bordered
                class="shadow-0 border-0" dense>
                <template v-slot:body="props" class="hover-foliofiscal-e">
                    <q-tr :props="props" class="hover-foliofiscal-e">
                        <q-td key="rfc" :props="props" @click="GetReporte(props.row)">{{ props.row.rfc }}</q-td>
                        <q-td key="nombre" :props="props" @click="GetReporte(props.row)">{{ props.row.nombre }}</q-td>
                        <q-td key="ingresos" :props="props" @click="GetReporte(props.row)">{{ props.row.ingresos
                            }}</q-td>
                        <q-td key="importeI" :props="props" @click="GetReporte(props.row)">{{
                            formatCurrency(props.row.importeI) }}</q-td>
                        <q-td key="egresos" :props="props" @click="GetReporte(props.row)">{{ props.row.egresos }}</q-td>
                        <q-td key="importeE" :props="props" @click="GetReporte(props.row)">{{
                            formatCurrency(props.row.importeE) }}</q-td>
                    </q-tr>
                </template>
            </q-table>
            <q-table :data="[getTotales(items.contenido)]" :columns="columnsTotales" dense flat bordered row-key="rfc"
                class="shadow-0 border-0 q-mt-sm" hide-header hide-bottom>
                <template v-slot:body="props">
                    <q-tr :props="props">
                        <q-td key="rfc" :props="props"><strong>Total</strong></q-td>
                        <q-td key="nombre" :props="props">{{ props.row.nombre }}</q-td>
                        <q-td key="ingresos" :props="props">{{ props.row.ingresos }}</q-td>
                        <q-td key="importeI" :props="props">{{ formatCurrency(props.row.importeI) }}</q-td>
                        <q-td key="egresos" :props="props">{{ props.row.egresos }}</q-td>
                        <q-td key="importeE" :props="props">{{ formatCurrency(props.row.importeE) }}</q-td>
                    </q-tr>
                </template>
            </q-table>
        </div>
    </div>
</template>
<script>
    import moment from "moment";
    import { QSpinnerCube } from "quasar";
    import detalles from '../../Ingresos/FacturacionDet.vue'
    import axios from 'axios'

    export default {
        components: {
            detalles
        },
        data() {
            return {
                columnsIngreso: [
                    { name: 'rfc', label: 'RFC', align: 'center', field: 'rfc', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'nombre', label: 'Nombre', align: 'left', field: 'nombre', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'ingresos', label: '# Ingresos', align: 'center', field: 'ingresos', sortable: true, classes: 'bg-grey-2 ellipsis ', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'importeI', label: 'Importe', align: 'right', field: 'importeI', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'egresos', label: '# Egresos', align: 'center', field: 'egresos', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-emitidos text-white', },
                    { name: 'importeE', label: 'Importe', align: 'right', field: 'importeE', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-emitidos text-white', },
                ],
                columnsTotales: [
                    { name: 'rfc', label: 'RFC', align: 'center', field: 'rfc', sortable: true, classes: 'total-row-e ellipsis', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'nombre', label: 'Nombre', align: 'left', field: 'nombre', sortable: true, classes: 'total-row-e ellipsis', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'ingresos', label: '# Ingresos', align: 'center', field: 'ingresos', sortable: true, classes: 'total-row-e ellipsis ', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'importeI', label: 'Importe', align: 'right', field: 'importeI', sortable: true, classes: 'total-row-e ellipsis', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'egresos', label: '# Egresos', align: 'center', field: 'egresos', sortable: true, classes: 'total-row-e ellipsis', headerClasses: 'bgc-emitidos text-white', },
                    { name: 'importeE', label: 'Importe', align: 'right', field: 'importeE', sortable: true, classes: 'total-row-e ellipsis', headerClasses: 'bgc-emitidos text-white', },
                ],
                dialogDetalles: false
            }
        },
        computed: {
            token() {
                return this.$store.state.usuario;
            },
            items() {
                return this.$store.state.dataViewReporte[3];
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
                    rfc: 'Total',
                    nombre: '-',
                    ingresos: registros.reduce((sum, r) => sum + (r.ingresos || 0), 0),
                    importeI: registros.reduce((sum, r) => sum + (r.importeI || 0), 0),
                    egresos: registros.reduce((sum, r) => sum + (r.egresos || 0), 0),
                    importeE: registros.reduce((sum, r) => sum + (r.importeE || 0), 0),
                };
            },

            async GetReporte(item) {
                let i = moment({ year: this.fechas.anio, month: this.fechas.mesInicial - 1, day: 1 }).format('YYYY-MM-DD');
                let f = moment({ year: this.fechas.anio, month: this.fechas.mesFinal - 1, day: 1 }).format('YYYY-MM-DD');

                let fechaI = this.fechas.anio + '-' + i + '-01';
                let fechaF = this.fechas.anio + '-' + f + '-01';

                console.log(i)
                console.log(f)

                this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'primary', spinnerSize: 100, message: 'Consultando, espere... ', messageColor: 'white' })

                try {
                    let response = await axios.get(this.rutaAxios + 'Ingresos/GetReporteAcumuladoPorRfcAsync/erp_' + this.token.rfc + '/' + i + '/' + f);
                    let x = response.data;

                    this.$store.state.detallesFacturacionStore.cabecera = 'INGRESOS ' + item.rfc + ' | ' + item.nombre;

                    const objetosFiltrados = x.detalles.filter(objeto => objeto.rfc === item.rfc);
                    this.$store.state.detallesFacturacionStore.detalles = objetosFiltrados;

                    this.dialogDetalles = true;
                    this.$q.loading.hide()
                } catch (error) {
                    console.log(error)
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
    .bgc-emitidos {
        background-color: #42A147 !important;
        text-align: center !important;
    }

    .total-row-e {
        background-color: #99D69C !important;
        font-weight: bold;
    }

    .titulo-reporte-emitidos {
        background-color: #fff;
        color: #42A147;
        font-size: 20px;
        font-weight: bold;
        padding: 10px 20px;
        text-align: center;
        border-bottom: 2px solid #42A147;
        font-family: Arial, sans-serif;
    }

    .hover-foliofiscal-e:hover td {
        background-color: #99D69C !important;
        color: white;
        cursor: pointer;
    }
</style>