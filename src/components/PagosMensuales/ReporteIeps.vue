<template>
    <div class="q-pa-md">
        <!-- DIALOG -->
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

        <q-dialog v-model="dialogPdf" persistent transition-show="scale" transition-hide="scale" maximized>
            <visor-pdf @CloseDialogPdf="CloseDialogPdf"></visor-pdf>
        </q-dialog>

        <!-- DIALOG DE LAS NOTAS -->
        <q-dialog v-model="dialogNotas" persistent transition-show="scale" transition-hide="scale">
            <q-card>
                <q-toolbar>
                    <q-btn flat round dense icon="close" v-close-popup color="red-14">
                        <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                            :offset="[10, 10]">Cerrar</q-tooltip>
                    </q-btn>
                    <q-toolbar-title><span class="text-weight-bold">{{ textoNotas }}</span></q-toolbar-title>
                </q-toolbar>
                <q-separator color="primary" inset />
                <q-card-section v-html="detalleNotas" />
            </q-card>
        </q-dialog>

        <!-- DIALOG DE LOS DETALLES -->
        <q-dialog v-model="dialogDetalles" persistent transition-show="scale" transition-hide="scale" maximized>
            <q-card>
                <q-toolbar>
                    <q-btn flat round dense icon="close" v-close-popup color="red-14">
                        <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                            :offset="[10, 10]">Cerrar</q-tooltip>
                    </q-btn>
                    <q-toolbar-title><span class="text-weight-bold">Detalles</span></q-toolbar-title>
                </q-toolbar>
                <q-separator color="primary" inset />
                <q-card-section>
                    <q-table title="Reporte IEPS" :data="dataIepsDetalle" :columns="columnsDet" row-key="folioFiscal">
                        <template v-slot:body="props">
                            <q-tr :props="props" :class="'clase-total-' + props.row.mes">
                                <q-td auto-width>
                                    <q-btn size="md" color="primary" rounded flat dense @click="VerPdf(props.row)"
                                        icon="mdi-file-pdf-box">
                                        <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                            content-style="font-size: 14px" :offset="[10, 10]">PDF</q-tooltip>
                                    </q-btn>
                                </q-td>
                                <q-td key="serie" :props="props">{{ props.row.serie }}</q-td>
                                <q-td key="folio" :props="props">{{ props.row.folio }}</q-td>
                                <q-td key="fecha" :props="props">{{ props.row.fecha }}</q-td>
                                <q-td key="metodoPago" :props="props">{{ props.row.metodoPago }}</q-td>
                                <q-td key="formaPago" :props="props">{{ props.row.formaPago }}</q-td>
                                <q-td key="rfc" :props="props">{{ props.row.rfc }}</q-td>
                                <q-td key="nombre" :props="props">{{ props.row.nombre }}</q-td>
                                <q-td key="importe" :props="props">{{ formatCurrency(props.row.importe) }}</q-td>
                                <q-td key="impuesto" :props="props">{{ props.row.impuesto }}</q-td>
                                <q-td key="base_" :props="props">{{ formatCurrency(props.row.base_) }}</q-td>
                                <q-td key="tasaOCuota" :props="props">{{ props.row.tasaOCuota }}</q-td>
                                <q-td key="tipoFactor" :props="props">{{ props.row.tipoFactor }}</q-td>
                                <q-td key="subTotal" :props="props">{{ formatCurrency(props.row.subTotal) }}</q-td>
                                <q-td key="total" :props="props">{{ formatCurrency(props.row.total) }}</q-td>
                                <q-td key="folioFiscal" :props="props">{{ props.row.folioFiscal }}</q-td>
                                <q-td key="folioFiscalPago" :props="props">{{ props.row.folioFiscalPago }}</q-td>
                            </q-tr>
                        </template>
                    </q-table>
                </q-card-section>
            </q-card>
        </q-dialog>

        <!-- DIALOG DE LA COMPARATIVA -->
        <q-dialog v-model="dialogComparativa" persistent transition-show="scale" transition-hide="scale">
            <comparativa @CloseDialogDetalles="CloseDialogDetalles"></comparativa>
        </q-dialog>

        <!-- SELECCIONA AÑO Y MES, BOTON DE BUSCAR Y EXPORTAR A EXCEL -->
        <div class="row no-wrap items-center q-mt-md q-pa-sm">
            <q-space />
            <q-select outlined dense v-model="selectedAnio" :options="itemsAnios" label="Año" style="width:80px"
                class="q-mr-xs" />
            <q-select outlined dense v-model="selectedMes" :options="itemsMes" label="Mes" style="width:136px"
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

        <!-- TABLA DE SUELDOS Y SALARIOS -->
        <q-table title="Reporte IEPS" :data="dataIepsE" :columns="columns" row-key="mes" hide-bottom
            :rows-per-page-options="[0]">
            <template v-slot:top>
                <span class="text-body1" content-style="font-size: 20px">IEPS Emitido</span>
                <q-space />
                <q-btn push color="blue-7" @click="OpenNotas(1)" icon="mdi-information-outline" rounded flat size="18px"
                    padding="xs">
                    <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                        :offset="[10, 10]">Información</q-tooltip>
                </q-btn>
                <q-btn push color="green-14" @click="OpenComparativa(1)" icon="mdi-compare" rounded flat size="18px"
                    padding="xs">
                    <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                        :offset="[10, 10]">Comparativa</q-tooltip>
                </q-btn>
            </template>
            <template v-slot:body="props">
                <q-tr :props="props" :class="'clase-total-' + props.row.mes">
                    <q-td auto-width>
                        <q-btn size="md" color="primary" rounded flat dense @click="VerDetalles(props.row)"
                            icon="mdi-format-list-bulleted" v-if="props.row.detalles.length != 0">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Detalles</q-tooltip>
                        </q-btn>
                    </q-td>
                    <q-td key="mes" :props="props">{{ props.row.mes }}</q-td>
                    <q-td key="importe" :props="props">{{ formatCurrency(props.row.importe) }}</q-td>
                    <q-td key="comparativa" :props="props">{{ formatCurrency(props.row.comparativa) }}</q-td>
                    <q-td key="diferencia" :props="props">{{ formatCurrency(props.row.diferencia) }}</q-td>
                </q-tr>
            </template>
        </q-table>

        <!-- GRAFICA-->
        <q-card style="width: 100%; " class="full-width q-mt-lg">
            <chart-component :chartData="chartData" :chartTitle="charTitleE"  ></chart-component>
        </q-card>
    </div>
</template>
<script>
import axios from 'axios';
import moment from 'moment';
import Detalles from './RetencionesIvaDet.vue';
import Comparativa from '../Nomina/ComparativaNomina.vue';
import * as xlsx from 'xlsx';
import ChartComponent from "../Graficas/ChartComponent.vue";
import visorPdf from "../Pdf/VisorPdf.vue";

export default {
    components: {
        Comparativa,
        ChartComponent,
        Detalles,
        visorPdf,
    },
    data() {
        return {
            itemsAnios: ['2026','2025', '2024','2023', '2022', '2021', '2020', '2019', '2018'],
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
            selectedMes: null,

            columns: [
                { name: 'actions', align: 'left', label: 'Acciones', field: 'actions' },
                { name: 'mes', align: 'left', label: 'Mes', field: 'mes' },
                { name: 'importe', align: 'right', label: 'Importe', field: 'importe' },
                { name: 'comparativa', align: 'right', label: 'Comparativa', field: 'comparativa' },
                { name: 'diferencia', align: 'right', label: 'Diferencia', field: 'diferencia' },
            ],

            columnsDet: [
                { name: 'actions', align: 'left', label: 'Acciones', field: 'actions' },
                { name: 'serie', align: 'left', label: 'Serie', field: 'serie' },
                { name: 'folio', align: 'left', label: 'Folio', field: 'folio' },
                { name: 'fecha', align: 'left', label: 'Fecha', field: 'fecha' },
                { name: 'metodoPago', align: 'left', label: 'Metodo de Pago', field: 'metodoPago' },
                { name: 'formaPago', align: 'left', label: 'Forma de Pago', field: 'formaPago' },
                { name: 'rfc', align: 'left', label: 'RFC', field: 'rfc' },
                { name: 'nombre', align: 'left', label: 'Nombre', field: 'nombre' },
                { name: 'importe', align: 'right', label: 'Importe', field: 'importe' },
                { name: 'impuesto', align: 'left', label: 'Impuesto', field: 'impuesto' },
                { name: 'base_', align: 'right', label: 'Base', field: 'base_' },
                { name: 'tasaOCuota', align: 'left', label: 'Tasa O Cuota', field: 'tasaOCuota' },
                { name: 'tipoFactor', align: 'left', label: 'Tipo Factor', field: 'tipoFactor' },
                { name: 'subTotal', align: 'right', label: 'SubTotal', field: 'subTotal' },
                { name: 'total', align: 'right', label: 'Total', field: 'total' },
                { name: 'folioFiscal', align: 'left', label: 'FolioFiscal', field: 'folioFiscal' },
                { name: 'folioFiscalPago', align: 'left', label: 'Folio Fiscal Pago', field: 'folioFiscalPago' },                
            ],
            dataIepsE: [],
            dataIepsDetalle: [],

            //DATOS DE CARGANDO
            dialog: false,
            dialogtext: '',

            //DATOS DE LOS DETALLES
            dialogDetalles: false,
            dialogPdf: false,

            //DATOS DE LA INFORMACION ADICIONAL
            dialogNotas: false,
            textoNotas: '',
            detalleNotas: '',

            //DATOS DE LA COMPARATAIVA
            dialogComparativa: false,

            charTitleE: 'Retenciones de IVA',
            chartData: null,
        }
    },
    computed: {
        token() {
            return this.$store.state.usuario;
        },

        comparativa() {
            return this.$store.state.comparativaStore;
        },

        rutaAxios() {
            return this.$store.state.rutaMongoStore
        },

    },
    created() {

    },
    methods: {
        async GetReporte() {
            if (!this.selectedAnio) {
                this.ShowNotifsWarning('Seleccione el año');
                return;
            }
            if (!this.selectedMes) {
                this.ShowNotifsWarning('Seleccione el mes');
                return;
            }
            this.dialog = true;
            await this.GetReporteIVARetenido();
            this.dialog = false;
        },

        async GetReporteIVARetenido() {
            try {
                //CONSULTANOS LAS COMPARATIVAS
                this.dataIepsE = [];
                let ivaRetenido = [];
                this.dialogtext = 'Calculando IEPS'
                const añoSel = this.selectedAnio;
                const mesFin = this.selectedMes.value;
                const fechaI = añoSel + '-' + '01' + '-01';
                const fechaF = añoSel + '-' + mesFin + '-01';
                const comparativa = await this.GetComparativa(this.selectedAnio, 'IEPSEmitido');
                const response = await axios.get(this.rutaAxios + 'Ingresos/GetReporteIepsAsync/erp_' + this.token.rfc + '/' + fechaI + '/' + fechaF);

                //ASIGNAMOS LAS COMPARATIVAS
                for(let i = 0; i < mesFin; i++){
                    const diferencia = response.data[i].importe - comparativa[i].importe;
                    const objIeps = {
                        mes: response.data[i].mes,
                        importe: response.data[i].importe,
                        comparativa: comparativa[i].importe,
                        diferencia: diferencia,
                        detalles: response.data[i].detalles
                    }
                    console.log(objIeps)
                    this.dataIepsE.push(objIeps)

                    // console.log(comparativaIva[i]);
                    // console.log(response.data[i]);
                }
                
                // let totales = {
                //     mes: 'Total',
                //     importeIva: this.dataIepsE.reduce((acumulador, objeto) => acumulador + objeto.importeIva, 0),
                //     comparativa: this.dataIepsE.reduce((acumulador, objeto) => acumulador + objeto.comparativa, 0),
                //     diferencia: this.dataIepsE.reduce((acumulador, objeto) => acumulador + objeto.diferencia, 0),
                //     detalles: [],
                // }
                // await this.GenerarGrafica(this.dataIepsE);

                // this.dataIepsE.push(totales)

            } catch (error) {
                console.log(error);
            }
        },

        async GenerarGrafica(data){
            const meses = data.map((item) => item.mes);
                const importe = data.map((item) => item.importeIva);

                let obj1 = {
                    type: 'line',
                    label: 'Importe (Linea)',
                    borderColor: '#66BB6A',
                    borderWidth: 2,
                    fill: false,
                    data: importe
                }

                let obj2 = {
                    type: 'bar',
                    label: 'Importe (Barra)',
                    backgroundColor: '#66BB6A',
                    data: importe,
                    borderColor: 'white',
                    borderWidth: 2
                }

            
                let chartDatas = {
                    labels: meses,
                    datasets: []
                }

                chartDatas.datasets.push(obj1)
                chartDatas.datasets.push(obj2)
                this.chartData = { ...chartDatas }
            },
        
        VerDetalles(item) {
            const detalles = item.detalles;
            // console.log(detalles);
            this.dataIepsDetalle = [];
            this.dataIepsDetalle = [...detalles]
            this.dialogDetalles = true;
        },

        // ExportExcel() {
        //     if (this.dataIepsE.length == 0) {
        //         this.ShowNotifsWarning('Genere el reporte, para exportar el excel')
        //         return;
        //     }

        //     const sueldosFiltrados = this.dataIepsE.map((fila) => {
        //         const { ["detalles"]: columnaExcluida, ...restoDeColumnas } = fila;
        //         return restoDeColumnas;
        //     });

        //     const workbook = xlsx.utils.book_new();

        //     const sheetSueldos = xlsx.utils.json_to_sheet(sueldosFiltrados);
        //     xlsx.utils.book_append_sheet(workbook, sheetSueldos, 'IVA RETENIDO');

        //     xlsx.writeFile(workbook, 'IVA RETENIDO DE ENERO A ' + this.selectedMes.label + ' ' + this.selectedAnio + '.xlsx');
        // },

        ExportExcel() {
            if (this.dataIepsE.length == 0) {
                this.ShowNotifsWarning('Genere el reporte, para exportar el excel')
                return;
            }

            const sueldosFiltrados = this.dataIepsE.map((fila) => {
                const { ["detalles"]: columnaExcluida, ...restoDeColumnas } = fila;
                return restoDeColumnas;
            });


            let reporte = 'REPORTE DE IEPS'
            let empresa = this.$store.state.empresaStore.nombre
            let rfc = this.$store.state.empresaStore.rfc
           
            let periodo = 'ENERO A ' + this.selectedMes.label + ' ' + this.selectedAnio

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
                col => col.name !== "actions" & col.name !== "detalles"
            );

            const dataExcel =sueldosFiltrados.map(row => {
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

            xlsx.utils.book_append_sheet(workbook, sheet, "CONCEPTOS");

            xlsx.writeFile(
                workbook,
                rfc + ' - ' + empresa +  ' - REPORTE DE IVA RETENIDO DE ' + periodo.toUpperCase() + '.xlsx'
            );
        },

        VerPdf(item){
            try {
                this.$store.state.vistaPreviaStore.folioFiscal = item.folioFiscal;
                this.$store.state.vistaPreviaStore.color = "19775C";
                this.$store.state.vistaPreviaStore.tipoComprobanteInterno = "FACTURA";
                this.$store.state.vistaPreviaStore.tipo = "E";
                this.$store.state.vistaPreviaStore.rfc = this.token.rfc;
                this.dialogPdf = true;
            } catch (error) {
                console.log(error);
            }
        },

        formatCurrency(value) {
            return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        },

        CloseDialogDetalles() {
            this.dialogComparativa = false;
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

        OpenNotas(item) {
            this.dialogNotas = true;
            if (item == 1) {
                this.textoNotas = 'IVA Retenido';
                this.detalleNotas = '';
            }
        },

        async OpenComparativa(item) {
            if (!this.selectedAnio) {
                this.ShowNotifsWarning('Seleccione el año');
                return;
            }
            this.dialog = true;
            this.dialogtext = 'Consultando datos ...'
            let respuesta = {}

            if (item == 1) {
                this.comparativa.textoComparativa = 'Comparativa IEPS Emitido';
                this.comparativa.año = this.selectedAnio;
                this.comparativa.tipo = 'IEPSEmitido';

                respuesta = await this.GetComparativa(this.selectedAnio, 'IEPSEmitido');
            }

            this.comparativa.comparativa.enero = respuesta[0].importe;
            this.comparativa.comparativa.febrero = respuesta[1].importe;
            this.comparativa.comparativa.marzo = respuesta[2].importe;
            this.comparativa.comparativa.abril = respuesta[3].importe;
            this.comparativa.comparativa.mayo = respuesta[4].importe;
            this.comparativa.comparativa.junio = respuesta[5].importe;
            this.comparativa.comparativa.julio = respuesta[6].importe;
            this.comparativa.comparativa.agosto = respuesta[7].importe;
            this.comparativa.comparativa.septiembre = respuesta[8].importe;
            this.comparativa.comparativa.octubre = respuesta[9].importe;
            this.comparativa.comparativa.noviembre = respuesta[10].importe;
            this.comparativa.comparativa.diciembre = respuesta[11].importe;

            this.dialogComparativa = true;
            this.dialog = false;
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
                console.log(error)
                return respuesta;
            }
        },

        CloseDialogPdf() {
            this.dialogPdf = false;
        },
    },
}
</script>