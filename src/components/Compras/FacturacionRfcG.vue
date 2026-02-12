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
            <q-space />
        </div>

        <!-- TABLA -->
        <q-table title="Reporte ISR" :data="dataComprobantes" :columns="columns" row-key="rfc" :rows-per-page-options="[12]"
            class="my-sticky-column-table">
            <template v-slot:top>
                <span class="text-body1" content-style="font-size: 20px">Comprobantes Recibidos por RFC</span>
                <q-space />
                <q-btn push color="blue-7" @click="OpenNotas(1)" icon="mdi-information-outline" rounded flat size="18px"
                    padding="xs">
                    <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                        :offset="[10, 10]">Información</q-tooltip>
                </q-btn>
            </template>
            <template v-slot:body="props">
                <q-tr :props="props">

                    <q-td auto-width>
                        <q-btn size="md" color="primary" rounded flat dense @click="VerDetalles(props.row)"
                            icon="mdi-format-list-bulleted">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Detalles</q-tooltip>
                        </q-btn>
                    </q-td>

                    <q-td key="rfc" :props="props">{{ props.row.rfc }}</q-td>
                    <q-td key="nombre" :props="props">{{ props.row.nombre }}</q-td>
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

        <q-markup-table separator="vertical" v-if="dataComprobantes.length != 0">
            <thead>
                <tr>
                    <th class="text-center">Subtotal Ingresos</th>
                    <th class="text-center">Subtotal Notas de Crédito</th>
                    <th class="text-center">Descuento Ingresos</th>
                    <th class="text-center">Descuento Notas de Crédito</th>
                    <th class="text-center">Total Ingresos</th>
                    <th class="text-center">Total Notas de Crédito</th>
                    <th class="text-center">Total</th>
                </tr>
            </thead>
            <tbody style="background: rgb(255, 190, 190)">
                <tr>
                    <td class="text-right">{{ FormatCurrency(totalsubTotalI) }}</td>
                    <td class="text-right">{{ FormatCurrency(totalsubTotalE) }}</td>
                    <td class="text-right">{{ FormatCurrency(totaldescuentoI) }}</td>
                    <td class="text-right">{{ FormatCurrency(totaldescuentoE) }}</td>
                    <td class="text-right">{{ FormatCurrency(totaltotalI) }}</td>
                    <td class="text-right">{{ FormatCurrency(totaltotalE) }}</td>
                    <td class="text-right">{{ FormatCurrency(totaltotal) }}</td>
                </tr>
            </tbody>
        </q-markup-table>

        <!-- GRAFICA-->
        <q-card style="width: 100%;" class="full-width q-mt-lg">
            <chart-component :chartData="chartData" :chartTitle="charTitleE"  ></chart-component>
        </q-card>

    </div>
</template>
<script>
import axios from 'axios'
import moment from 'moment'
import detalles from './FacturacionDetG.vue'
import * as xlsx from 'xlsx';
import ChartComponent from "../Graficas/ChartComponent.vue";

export default {
    components: {
        ChartComponent,
        detalles,
    },
    data() {
        return {
            totalsubTotalI: 0,
            totalsubTotalE: 0,
            totaldescuentoI: 0,
            totaldescuentoE: 0,
            totaltotalI: 0,
            totaltotalE: 0,
            totaltotal: 0,

            columns: [
                { name: 'actions', align: 'left', label: 'Acciones', field: 'actions' },
                { name: 'rfc', align: 'left', label: 'RFC', field: 'rfc', sortable: true },
                { name: 'nombre', align: 'left', label: 'Nombre', field: 'nombre', sortable: true },
                { name: 'ingresos', align: 'left', label: '# Ingresos', field: 'ingresos', sortable: true },
                { name: 'egresos', align: 'left', label: '# Notas de Crédito', field: 'egresos', sortable: true },
                { name: 'subTotalI', align: 'right', label: 'Subtotal Ingresos', field: 'subTotalI', sortable: true },
                { name: 'subTotalE', align: 'right', label: 'Subtotal Notas de Crédito', field: 'subTotalE', sortable: true },
                { name: 'descuentoI', align: 'right', label: 'Descuento Ingresos', field: 'descuentoI', sortable: true },
                { name: 'descuentoE', align: 'right', label: 'Descuento Notas de Crédito', field: 'descuentoE', sortable: true },
                { name: 'totalI', align: 'right', label: 'Total Ingresos', field: 'totalI', sortable: true },
                { name: 'totalE', align: 'right', label: 'Total Notas de Crédito', field: 'totalE', sortable: true },
                { name: 'total', align: 'right', label: 'Total', field: 'total', sortable: true },
            ],
            dataComprobantes: [],
            dataDetalles: [],

            itemsAnios: ['2026','2025','2024','2023', '2022', '2021', '2020', '2019', '2018'],
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

            //DATOS DE LOS DETALLES
            dialogDetalles: false,

            //LOADING
            dialog: false,
            dialogtext: '',

            charTitleE: 'Gastos Por RFC',
            chartData: null,
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
        calcularTotales() {
            this.totalsubTotalI = this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.subTotalI, 0)
            this.totalsubTotalE = this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.subTotalE, 0)
            this.totaldescuentoI = this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.descuentoI, 0)
            this.totaldescuentoE = this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.descuentoE, 0)
            this.totaltotalI = this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.totalI, 0)
            this.totaltotalE = this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.totalE, 0)
            this.totaltotal = this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.total, 0)
        },

        async GetReporte() {
            this.dialogtext = 'Consultando, espere...';
            this.dialog = true;

            let fI = this.selectedAnio + '-' + this.selectedMesI.value + '-01';
            let fF = this.selectedAnio + '-' + this.selectedMesF.value + '-01';

            try {
                let response = await axios.get(this.rutaAxios + 'Gastos/GetReporteAcumuladoPorRfcAsync/erp_' + this.token.rfc + '/' + fI + '/' + fF);
                let x = response.data;
                await this.GenerarGrafica(x)

                this.dataComprobantes = [...x.general];
                this.dataDetalles = [...x.detalles];
                this.calcularTotales();
                this.dialog = false;
            } catch (error) {
                console.log(error)
                this.dialog = false;
            }
        },

async GenerarGrafica(data){
            let lista = data.general
            lista.sort((a, b) => b.totalI - a.totalI);

            // Tomar los primeros 10 elementos
            let primerosDiez = lista.slice(0, 10);

                    const nombres = primerosDiez.map((item) => item.nombre);
                    const Tingresos = primerosDiez.map((item) => item.totalI);
                    const descuento = primerosDiez.map((item) => item.descuentoE);
                    const notas = primerosDiez.map((item) => item.totalE);

                    // let obj1 = {
                    //     type: 'line',
                    //     label: 'Notas de credito (Linea)',
                    //     borderColor: '#FFA726',
                    //     borderWidth: 2,
                    //     fill: false,
                    //     data: notas
                    // }

                    let obj2 = {
                        type: 'bar',
                        label: 'Notas de Credito (Barra)',
                        backgroundColor: '#FFA726',
                        data: notas,
                        borderColor: 'white',
                        borderWidth: 2
                    }

                    // let obj3 = {
                    //     type: 'line',
                    //     label: 'Ingresos (Linea)',
                    //     borderColor: '#66BB6A',
                    //     borderWidth: 2,
                    //     fill: false,
                    //     data: Tingresos
                    // }

                    let obj4 = {
                        type: 'bar',
                        label: 'Ingresos (Barra)',
                        backgroundColor: '#66BB6A',
                        data: Tingresos,
                        borderColor: 'white',
                        borderWidth: 2
                    }
                    // let obj5 = {
                    //     type: 'line',
                    //     label: 'Descuentos (Linea)',
                    //     borderColor: '#E74747',
                    //     borderWidth: 2,
                    //     fill: false,
                    //     data: descuento
                    // }

                    let obj6 = {
                        type: 'bar',
                        label: 'Descuentos (Barra)',
                        backgroundColor: '#E74747',
                        data: descuento,
                        borderColor: 'white',
                        borderWidth: 2
                    }
                    let chartDatas = {
                        labels: nombres,
                        datasets: []
                    }

                    // chartDatas.datasets.push(obj1)
                    chartDatas.datasets.push(obj2)
                    // chartDatas.datasets.push(obj3)
                    chartDatas.datasets.push(obj4)
                    // chartDatas.datasets.push(obj5)
                    chartDatas.datasets.push(obj6)
                    this.chartData = { ...chartDatas }
                    console.log(this.chartData)
            },

        VerDetalles(item) {
            console.log(item);

            const objetosFiltrados = this.dataDetalles.filter(objeto => objeto.rfc === item.rfc);
            this.$store.state.detallesFacturacionStore.cabecera = 'GASTOS ' + item.rfc + ' | ' + item.nombre;
            this.$store.state.detallesFacturacionStore.detalles = objetosFiltrados;

            this.dialogDetalles = true;
        },


        FormatCurrency(value) {
            return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        },

        // ExportExcel() {
        //     const workbook = XLSX.utils.book_new();

        //     const sheetOtros = XLSX.utils.json_to_sheet(this.dataComprobantes);
        //     XLSX.utils.book_append_sheet(workbook, sheetOtros, 'GASTOS');

        //     XLSX.writeFile(workbook, 'GASTOS FACTURADOS DE ' + this.selectedMesI.label + ' A ' + this.selectedMesF.label + ' ' + this.selectedAnio + ' POR RFC.xlsx');
        // },

        ExportExcel() {
            let reporte = 'REPORTE DE GASTOS FACTURADOS POR RFC'
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

            xlsx.utils.book_append_sheet(workbook, sheet, "COMPROBANTES");

            xlsx.writeFile(
                workbook,
                rfc + ' - ' + empresa +  ' - REPORTE DE GASTOS FACTURADOS POR RFC DE ' + periodo.toUpperCase() + '.xlsx'
            );
            },

        CloseDialogDetalles() {
            this.dialogDetalles = false;
        },

    },
}
</script>
<style lang="sass">
.my-sticky-column-table
  /* specifying max-width so the example can
    highlight the sticky column on any browser window */
  /* max-width: 600px */

  thead tr:first-child th:first-child
    /* bg color is important for th; just specify one */
    background-color: #ffffff

  td:first-child
    background-color: #ffffff

  th:first-child,
  td:first-child
    position: sticky
    left: 0
    z-index: 1
</style>