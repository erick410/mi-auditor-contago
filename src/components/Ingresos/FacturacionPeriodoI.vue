<template>
    <div class="q-pa-md">
        <!-- DIALOG LOADING -->
        <q-dialog v-model="dialog" persistent transition-show="scale" transition-hide="scale">
            <q-card style="width: 200px">
                <q-card-section>
                    <div class="row justify-center">
                        <span>{{ dialogtext }}</span>
                        <q-spinner-dots color="primary" size="lg" />
                    </div>
                </q-card-section>
            </q-card>
        </q-dialog>

        <q-dialog v-model="dialogLista69B" persistent transition-show="scale" transition-hide="scale" maximized>
            <q-card>
                <q-bar class="bg-primary">
                    <q-icon color="white" name="mdi-account-search" />
                    <div class="text-white">Lista 69B</div>

                    <q-space />
                    <q-btn dense color="white" flat icon="close" v-close-popup>
                        <q-tooltip>Close</q-tooltip>
                    </q-btn>
                </q-bar>
                <q-card-section>
                    <lista69></lista69>
                </q-card-section>
            </q-card>
        </q-dialog>

        <!-- DIALOG DE LOS DETALLES -->
        <q-dialog v-model="dialogDetalles" persistent transition-show="scale" transition-hide="scale" maximized>
            <detalles @CloseDialogDetalles="CloseDialogDetalles"></detalles>
        </q-dialog>

        <!-- SELECCIONA AÑO Y MES, BOTON DE BUSCAR Y EXPORTAR A EXCEL -->
        <div class="row no-wrap items-center q-mt-md q-pa-sm">
            <q-space />
            <q-select outlined dense v-model="selectedAnio" :options="itemsAnios" label="Año" style="width:80px"
                class="q-mr-xs" />
            <q-select outlined dense v-model="selectedMesI" :options="itemsMes" label="Mes Inicial" style="width:136px"
                class="q-mr-xs" />
            <q-select outlined dense v-model="selectedMesF" :options="itemsMes" label="Mes Final" style="width:136px"
                class="q-mr-xs" />
            <q-btn push color="amber-9" @click="GetReporte" icon="mdi-text-box-search-outline" rounded flat size="18px"
                padding="xs">
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                    :offset="[10, 10]">Consultar</q-tooltip>
            </q-btn>
            <q-btn push color="green-10" @click="ExportExcel" icon="mdi-file-excel-box-outline" rounded flat size="18px"
                padding="xs">
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                    :offset="[10, 10]">Exportar Excel</q-tooltip>
            </q-btn>
            <q-btn push color="red-10" @click="abrirDialogLista69B" icon="mdi-account-search" rounded flat size="18px"
                padding="xs">
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                    :offset="[10, 10]">Lista 69B</q-tooltip>
            </q-btn>
            <q-space />
        </div>

        <!-- TABLA DE TRABAJADORES -->
        <q-card style="width: 100%;" class="full-width">

            <q-table title="Reporte ISR" :data="dataComprobantes" :columns="columns" row-key="rfc"
                :rows-per-page-options="[13]" class="my-sticky-column-table  shadow-0">
                <template v-slot:top>
                    <span class="text-body1" content-style="font-size: 20px">Comprobantes Emitidos por Periodo </span>
                    <q-space />
                    <q-btn push color="blue-7" @click="OpenNotas(1)" icon="mdi-information-outline" rounded flat
                        size="18px" padding="xs">
                        <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                            content-style="font-size: 14px" :offset="[10, 10]">Información</q-tooltip>
                    </q-btn>
                </template>
                <template v-slot:body="props">
                    <q-tr :props="props" :class="'clase-total-' + props.row.año">
                        <q-td auto-width>
                            <q-btn size="md" color="primary" rounded flat dense @click="GetDetalle(props.row)"
                                icon="mdi-format-list-bulleted" v-if="props.row.año != 'Total'">
                                <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                    content-style="font-size: 14px" :offset="[10, 10]">Detalles</q-tooltip>
                            </q-btn>
                        </q-td>

                        <q-td key="año" :props="props">{{ props.row.año }}</q-td>
                        <q-td key="mes" :props="props">{{ props.row.mes }}</q-td>
                        <q-td key="ingresos" :props="props">{{ props.row.ingresos }}</q-td>
                        <q-td key="egresos" :props="props">{{ props.row.egresos }}</q-td>
                        <q-td key="subTotalI" :props="props">{{ FormatCurrency(props.row.subTotalI) }}</q-td>
                        <q-td key="subTotalE" :props="props">{{ FormatCurrency(props.row.subTotalE) }}</q-td>
                        <q-td key="descuentoI" :props="props">{{ FormatCurrency(props.row.descuentoI) }}</q-td>
                        <q-td key="descuentoE" :props="props">{{ FormatCurrency(props.row.descuentoE) }}</q-td>
                        <q-td key="totalI" :props="props">{{ FormatCurrency(props.row.totalI) }}</q-td>
                        <q-td key="totalE" :props="props">{{ FormatCurrency(props.row.totalE) }}</q-td>
                        <q-td key="total" :props="props">{{ FormatCurrency(props.row.total) }}</q-td>
                    </q-tr>
                </template>
            </q-table>
        </q-card>

        <!-- GRAFICA-->
        <q-card style="width: 100%;" class="full-width q-mt-lg">
            <chart-component :chartData="chartData" :chartTitle="charTitleE"></chart-component>
        </q-card>
    </div>
</template>
<script>
    import axios from 'axios'
    import { parseISO, parse, isSameMonth } from 'date-fns'
    import detalles from './FacturacionDet.vue'
    import * as xlsx    from 'xlsx';
    import ChartComponent from "../Graficas/ChartComponent.vue";
    import { QSpinnerCube } from 'quasar'
    import lista69 from '../Lista69B/Lista69B.vue'

    export default {
        components: {
            ChartComponent,
            detalles,
            lista69
        },
        data() {
            return {
                columns: [
                    { name: 'actions', align: 'left', label: 'Acciones', field: 'actions' },
                    { name: 'año', align: 'left', label: 'Año', field: 'año' },
                    { name: 'mes', align: 'left', label: 'Mes', field: 'mes' },
                    { name: 'ingresos', align: 'left', label: '# Ingresos', field: 'ingresos' },
                    { name: 'egresos', align: 'left', label: '# Notas de Crédito', field: 'egresos' },
                    { name: 'subTotalI', align: 'right', label: 'Subtotal Ingresos', field: 'subTotalI' },
                    { name: 'subTotalE', align: 'right', label: 'Subtotal Notas de Crédito', field: 'subTotalE' },
                    { name: 'descuentoI', align: 'right', label: 'Descuento Ingresos', field: 'descuentoI' },
                    { name: 'descuentoE', align: 'right', label: 'Descuento Notas de Crédito', field: 'descuentoE' },
                    { name: 'totalI', align: 'right', label: 'Total Ingresos', field: 'totalI' },
                    { name: 'totalE', align: 'right', label: 'Total Notas de Crédito', field: 'totalE' },
                    { name: 'total', align: 'right', label: 'Total', field: 'total' },
                ],
                dataComprobantes: [],
                dataComprobantesDet: [],
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

                selectedAnio: null,
                selectedMesI: null,
                selectedMesF: null,

                //LOADING
                dialog: false,
                dialogtext: '',

                //DATOS DE LOS DETALLES
                dialogDetalles: false,

                charTitleE: 'Ingresos Por Periodo',
                chartData: null,
                dialogLista69B: false,

                eneroDet: [],
                febreroDet: [],
                marzoDet: [],
                abrilDet: [],
                mayoDet: [],
                junioDet: [],
                julioDet: [],
                agosto: [],
                septiembreDet: [],
                octubreDet: [],
                noviembreDet: [],
                diciembreDet: [],
            }
        },
        computed: {
            token() {
                return this.$store.state.usuario;
            },

            sumTotal() {
                let suma = this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.total, 0);
                let resultado = this.FormatCurrency(suma);
                return resultado;
            },

            rutaAxios() {
                return this.$store.state.rutaMongoStore
            },

        },
        created() {

        },
        methods: {
            async GetReporte() {
                this.dataComprobantes = [];
                this.dataComprobantesDet = [];
                this.dialogtext = 'Consultando, espere...';
                this.dialog = true;
                let fI = this.selectedAnio + '-' + this.selectedMesI.value + '-01';
                let fF = this.selectedAnio + '-' + this.selectedMesF.value + '-01';

                try {
                    let response = await axios.get(this.rutaAxios + 'Ingresos/GetReportePeriodoAsync/erp_' + this.token.rfc + '/' + fI + '/' + fF);
                    console.log(response.data)
                    let x = response.data;
                    this.dataComprobantes = [...x.general]
                    // this.dataComprobantesDet = [...x.detalles]

                    await this.GenerarGrafica(x);

                    let objetoTotales = {
                        año: 'Total',
                        mes: '',
                        ingresos: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.ingresos, 0),
                        egresos: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.egresos, 0),
                        subTotalI: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.subTotalI, 0),
                        subTotalE: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.subTotalE, 0),
                        descuentoI: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.descuentoI, 0),
                        descuentoE: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.descuentoE, 0),
                        totalI: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.totalI, 0),
                        totalE: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.totalE, 0),
                        total: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.total, 0),
                    }

                    this.dataComprobantes.push(objetoTotales);
                    this.dialog = false;
                } catch (error) {
                    console.log(error)
                    this.dialog = false;
                }
            },

            async GetDetalle(item) {
                this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'red-8', spinnerSize: 140, message: 'Consultando información...', })
                const nombresMeses = [
                    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
                ];
                const numeroMes = nombresMeses.indexOf(item.mes.toLowerCase()) + 1;
                const año = this.selectedAnio;
                console.log(numeroMes, año);
                let fI = año + '-' + numeroMes + '-01';
                let fF = año + '-' + numeroMes + '-01';
                //CONSULTAMOS LOS DETALLES DEL MES SELECCIONADO
                let respuesta = [];
                try {
                    let response = await axios.get(this.rutaAxios + 'Ingresos/GetReportePeriodoDetAsync/erp_' + this.token.rfc + '/' + fI + '/' + fF);
                    console.log(response.data.detalles)
                    respuesta = response.data.detalles;
                    this.$q.loading.hide()

                    this.$store.state.detallesFacturacionStore.cabecera = 'INGRESOS ' + item.mes.toUpperCase() + ' DEL ' + this.selectedAnio;
                    this.$store.state.detallesFacturacionStore.detalles = respuesta;
                    this.dialogDetalles = true;
                } catch (error) {
                    console.log(error);
                    this.$q.loading.hide()
                }
            },

            async GenerarGrafica(data) {
                const meses = data.general.map((item) => item.mes);
                const Tingresos = data.general.map((item) => item.totalI);
                const descuento = data.general.map((item) => item.descuentoE);
                const notas = data.general.map((item) => item.totalE);

                let obj1 = {
                    type: 'line',
                    label: 'Notas de credito (Linea)',
                    borderColor: '#FFA726',
                    borderWidth: 2,
                    fill: false,
                    data: notas
                }

                let obj2 = {
                    type: 'bar',
                    label: 'Notas de Credito (Barra)',
                    backgroundColor: '#FFA726',
                    data: notas,
                    borderColor: 'white',
                    borderWidth: 2
                }

                let obj3 = {
                    type: 'line',
                    label: 'Ingresos (Linea)',
                    borderColor: '#66BB6A',
                    borderWidth: 2,
                    fill: false,
                    data: Tingresos
                }

                let obj4 = {
                    type: 'bar',
                    label: 'Ingresos (Barra)',
                    backgroundColor: '#66BB6A',
                    data: Tingresos,
                    borderColor: 'white',
                    borderWidth: 2
                }
                let obj5 = {
                    type: 'line',
                    label: 'Descuentos (Linea)',
                    borderColor: '#E74747',
                    borderWidth: 2,
                    fill: false,
                    data: descuento
                }

                let obj6 = {
                    type: 'bar',
                    label: 'Descuentos (Barra)',
                    backgroundColor: '#E74747',
                    data: descuento,
                    borderColor: 'white',
                    borderWidth: 2
                }
                let chartDatas = {
                    labels: meses,
                    datasets: []
                }

                chartDatas.datasets.push(obj1)
                chartDatas.datasets.push(obj2)
                chartDatas.datasets.push(obj3)
                chartDatas.datasets.push(obj4)
                chartDatas.datasets.push(obj5)
                chartDatas.datasets.push(obj6)
                this.chartData = { ...chartDatas }
                console.log(this.chartData)
            },

            VerDetalles(item) {
                const nombresMeses = [
                    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
                ];

                const numeroMes = nombresMeses.indexOf(item.mes.toLowerCase());
                const año = this.selectedAnio;

                const objetosEnMes = this.dataComprobantesDet.filter(objeto => {
                    const fechaObjeto = parseISO(objeto.fecha);
                    return isSameMonth(fechaObjeto, new Date(año, numeroMes));
                });

                this.$store.state.detallesFacturacionStore.cabecera = 'INGRESOS ' + item.mes.toUpperCase() + ' DEL ' + this.selectedAnio;
                this.$store.state.detallesFacturacionStore.detalles = objetosEnMes;

                this.dialogDetalles = true;
            },

            FormatCurrency(value) {
                return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
            },

            // ExportExcel() {
            //     const workbook = XLSX.utils.book_new();

            //     const sheetOtros = XLSX.utils.json_to_sheet(this.dataComprobantes);
            //     XLSX.utils.book_append_sheet(workbook, sheetOtros, 'INGRESOS');

            //     XLSX.writeFile(workbook, 'INGRESOS FACTURADOS DE ' + this.selectedMesI.label + ' A ' + this.selectedMesF.label + ' ' + this.selectedAnio + '.xlsx');
            // },

            ExportExcel() {
            let reporte = 'REPORTE DE INGRESOS FACTURADOS POR PERIODO'
            let empresa = this.$store.state.empresaStore.nombre
            let rfc = this.$store.state.empresaStore.rfc
     
            let periodo = this.selectedMesI.label + ' A ' + this.selectedMesF.label + ' DEL ' + this.selectedAnio

            const workbook = xlsx.utils.book_new();

            const cabecera = [
                [reporte],
                ["EMPRESA:", empresa.toUpperCase()],
                ["RFC:", rfc.toUpperCase()],
                ["PERIODO:",periodo.toUpperCase()],
                // ["FECHA REPORTE:", new Date()],
                [],
            ];

            const columnasExcel = this.columns.filter(
                col => col.name !== "actions"
            );

            const dataExcel = this.dataComprobantes.map(row => {
                const obj = {};
                columnasExcel.forEach(col => {
                obj[col.label] = row[col.field];
                });
                return obj;
            });

            const sheet = xlsx.utils.aoa_to_sheet(cabecera);

            xlsx.utils.sheet_add_json(sheet, dataExcel, {
                origin: "A6", 
                skipHeader: false,
            });

            sheet["!merges"] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: columnasExcel.length - 1 } },
                { s: { r: 1, c: 1 }, e: { r: 1, c: columnasExcel.length - 1 } },
                { s: { r: 2, c: 1 }, e: { r: 2, c: columnasExcel.length - 1 } },
                { s: { r: 3, c: 1 }, e: { r: 3, c: columnasExcel.length - 1 } },
            ];

            sheet["!cols"] = columnasExcel.map(() => ({ wch: 20 }));

            // const fechaCell = sheet["B4"];
            // if (fechaCell) fechaCell.z = "dd/mm/yyyy";

            xlsx.utils.book_append_sheet(workbook, sheet, "INGRSOS");

            xlsx.writeFile(
                workbook,
                rfc + ' - ' + empresa +  ' - REPORTE DE INGRESOS FACTURADOS DE ' + periodo.toUpperCase() + '.xlsx'
            );
            },

            CloseDialogDetalles() {
                this.dialogDetalles = false;
            },

            abrirDialogLista69B() {
                this.dialogLista69B = true
            },


        },
    }
</script>

<!-- <style lang="sass">
    .my-sticky-column-table thead tr:first-child th:first-child
    /* bg color is important for th; just specify one */
    background-color: #ffffff td:first-child background-color: #ffffff th:first-child,
    td:first-child position: sticky left: 0 z-index: 1
</style> -->