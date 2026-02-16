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
            <detalles @CloseDialogDetalles="CloseDialogDetalles"></detalles>
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
        <q-table title="Reporte IVA" :data="dataIvaRetenido" :columns="columns" row-key="mes" hide-bottom
            :rows-per-page-options="[0]">
            <template v-slot:top>
                <span class="text-body1" content-style="font-size: 20px">IVA Retenido</span>
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
                        <q-btn size="md" color="primary" rounded flat dense @click="VerDetalles(props.row, 'IVA Retenido')"
                            icon="mdi-format-list-bulleted" v-if="props.row.detalles.length != 0">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Detalles</q-tooltip>
                        </q-btn>
                    </q-td>
                    <q-td key="mes" :props="props">{{ props.row.mes }}</q-td>
                    <q-td key="importeIva" :props="props">{{ formatCurrency(props.row.importeIva) }}</q-td>
                    <q-td key="comparativa" :props="props">{{ formatCurrency(props.row.comparativa) }}</q-td>
                    <q-td key="diferencia" :props="props">{{ formatCurrency(props.row.diferencia) }}</q-td>
                </q-tr>
            </template>
        </q-table>

<!-- TABLA DE SUELDOS Y SALARIOS -->
<q-table title="IVA Retenido Emitido" :data="dataIvaRetenidoNeteado" :columns="columns" row-key="mes" hide-bottom
            :rows-per-page-options="[0]" class="q-mt-md">
           
            <template v-slot:body="props">
                <q-tr :props="props" :class="'clase-total-' + props.row.mes">
                    <q-td auto-width>
                        <q-btn size="md" color="primary" rounded flat dense @click="VerDetalles(props.row, 'IVA Retenido Recibidos')"
                            icon="mdi-format-list-bulleted" v-if="props.row.detalles.length != 0">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Detalles</q-tooltip>
                        </q-btn>
                    </q-td>
                    <q-td key="mes" :props="props">{{ props.row.mes }}</q-td>
                    <q-td key="importeIva" :props="props">{{ formatCurrency(props.row.importeIva) }}</q-td>
                    <q-td key="comparativa" :props="props">{{ formatCurrency(props.row.comparativa) }}</q-td>
                    <q-td key="diferencia" :props="props">{{ formatCurrency(props.row.diferencia) }}</q-td>
                </q-tr>
            </template>
        </q-table>

        <!-- GRAFICA-->
        <!-- <q-card style="width: 100%; " class="full-width q-mt-lg">
            <chart-component :chartData="chartData" :chartTitle="charTitleE"  ></chart-component>
        </q-card> -->
    </div>
</template>
<script>
import axios from 'axios';
import moment from 'moment';
import Detalles from './RetencionesIvaDet.vue';
import Comparativa from '../Nomina/ComparativaNomina.vue';
import * as xlsx from 'xlsx';
import ChartComponent from "../Graficas/ChartComponent.vue";

export default {
    components: {
        Comparativa,
        ChartComponent,
        Detalles,
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
                { name: 'importeIva', align: 'right', label: 'Importe', field: 'importeIva' },
                { name: 'comparativa', align: 'right', label: 'Comparativa', field: 'comparativa' },
                { name: 'diferencia', align: 'right', label: 'Diferencia', field: 'diferencia' },
            ],
            dataIvaRetenido: [],

            //DATOS DE CARGANDO
            dialog: false,
            dialogtext: '',

            //DATOS DE LOS DETALLES
            dialogDetalles: false,
            dialogDetallesIsr: false,

            //DATOS DE LA INFORMACION ADICIONAL
            dialogNotas: false,
            textoNotas: '',
            detalleNotas: '',

            //DATOS DE LA COMPARATAIVA
            dialogComparativa: false,

            charTitleE: 'Retenciones de IVA',
            chartData: null,

            dataIvaRetenidoNeteado:[]
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
            await this.GetReporteIVARetenidoNeteado();
            this.dialog = false;
        },

        async GetReporteIVARetenido() {
            try {
                //CONSULTANOS LAS COMPARATIVAS
                this.dataIvaRetenido = [];
                let ivaRetenido = [];
                let comparativaIva = await this.GetComparativa(this.selectedAnio, 'IVARetenido');
                this.dialogtext = 'Calculando IVA Retenido'
                let añoSel = this.selectedAnio - 1
                let fechaI = añoSel + '-' + '12' + '-01';
                let fechaF = this.selectedAnio + '-' + this.selectedMes.value + '-01';
                let response = await axios.get(this.rutaAxios + 'Gastos/GetReporteIvaRetenidoAsync/erp_' + this.token.rfc + '/' + fechaI + '/' + fechaF);
                ivaRetenido = response.data;
                let mesFin = this.selectedMes.value;

                //ASIGNAMOS LAS COMPARATIVAS
                for (let a = 1; a <= mesFin; a++) {
                    let diferencia = ivaRetenido[a].importeIva - comparativaIva[a - 1].importe
                    let objIva = {
                        mes: ivaRetenido[a].mes,
                        importeIva: ivaRetenido[a].importeIva,
                        comparativa: comparativaIva[a - 1].importe,
                        diferencia: diferencia,
                        detalles: ivaRetenido[a].detalles,
                    }
                    this.dataIvaRetenido.push(objIva);
                    objIva = {};
                }

                let totales = {
                    mes: 'Total',
                    importeIva: this.dataIvaRetenido.reduce((acumulador, objeto) => acumulador + objeto.importeIva, 0),
                    comparativa: this.dataIvaRetenido.reduce((acumulador, objeto) => acumulador + objeto.comparativa, 0),
                    diferencia: this.dataIvaRetenido.reduce((acumulador, objeto) => acumulador + objeto.diferencia, 0),
                    detalles: [],
                }
                await this.GenerarGrafica(this.dataIvaRetenido);

                this.dataIvaRetenido.push(totales)

            } catch (error) {
                console.log(error);
            }
        },

        async GetReporteIVARetenidoNeteado() {
            try {
                //CONSULTANOS LAS COMPARATIVAS
                this.dataIvaRetenidoNeteado = [];
                let ivaRetenido = [];
                let comparativaIva = await this.GetComparativa(this.selectedAnio, 'IVARetenido');
                this.dialogtext = 'Calculando IVA Retenido'
                let añoSel = this.selectedAnio - 1
                let fechaI = añoSel + '-' + '12' + '-01';
                let fechaF = this.selectedAnio + '-' + this.selectedMes.value + '-01';
                let response = await axios.get(this.rutaAxios + 'Gastos/GetReporteIvaRetenidoNeteadoAsync/erp_' + this.token.rfc + '/' + fechaI + '/' + fechaF);
                ivaRetenido = response.data;
                let mesFin = this.selectedMes.value;
console.log(response)
                //ASIGNAMOS LAS COMPARATIVAS
                for (let a = 1; a <= mesFin; a++) {
                    let diferencia = ivaRetenido[a].importeIva - comparativaIva[a - 1].importe
                    let objIva = {
                        mes: ivaRetenido[a].mes,
                        importeIva: ivaRetenido[a].importeIva,
                        comparativa: comparativaIva[a - 1].importe,
                        diferencia: diferencia,
                        detalles: ivaRetenido[a].detalles,
                    }
                    this.dataIvaRetenidoNeteado.push(objIva);
                    objIva = {};
                }

                let totales = {
                    mes: 'Total',
                    importeIva: this.dataIvaRetenidoNeteado.reduce((acumulador, objeto) => acumulador + objeto.importeIva, 0),
                    comparativa: this.dataIvaRetenidoNeteado.reduce((acumulador, objeto) => acumulador + objeto.comparativa, 0),
                    diferencia: this.dataIvaRetenidoNeteado.reduce((acumulador, objeto) => acumulador + objeto.diferencia, 0),
                    detalles: [],
                }

                this.dataIvaRetenidoNeteado.push(totales)

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
        
        VerDetalles(item, tipo) {
            console.log(item);
            const objDetalle = {
                año: this.selectedAnio,
                mes: item.mes,
                detalles: item.detalles,
                cabecera: "IVA RETENIDO"
            }
            this.$store.state.detallesIvaRet = {...objDetalle}
            this.dialogDetalles = true;
        },

        // ExportExcel() {
        //     if (this.dataIvaRetenido.length == 0) {
        //         this.ShowNotifsWarning('Genere el reporte, para exportar el excel')
        //         return;
        //     }

        //     const sueldosFiltrados = this.dataIvaRetenido.map((fila) => {
        //         const { ["detalles"]: columnaExcluida, ...restoDeColumnas } = fila;
        //         return restoDeColumnas;
        //     });

        //     const workbook = xlsx.utils.book_new();

        //     const sheetSueldos = xlsx.utils.json_to_sheet(sueldosFiltrados);
        //     xlsx.utils.book_append_sheet(workbook, sheetSueldos, 'IVA RETENIDO');

        //     xlsx.writeFile(workbook, 'IVA RETENIDO DE ENERO A ' + this.selectedMes.label + ' ' + this.selectedAnio + '.xlsx');
        // },

        ExportExcel() {
            if (this.dataIvaRetenido.length == 0) {
                this.ShowNotifsWarning('Genere el reporte, para exportar el excel')
                return;
            }

            const sueldosFiltrados = this.dataIvaRetenido.map((fila) => {
                const { ["detalles"]: columnaExcluida, ...restoDeColumnas } = fila;
                return restoDeColumnas;
            });


            let reporte = 'REPORTE DE IVA RETENIDO'
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

        formatCurrency(value) {
            return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        },

        CloseDialogDetalles() {
            this.dialogComparativa = false;
            this.dialogDetalles = false;
            this.dialogDetallesIsr = false;
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
                this.comparativa.textoComparativa = 'Comparativa IVA Retenido';
                this.comparativa.año = this.selectedAnio;
                this.comparativa.tipo = 'IVARetenido';

                respuesta = await this.GetComparativa(this.selectedAnio, 'IVARetenido');
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
    },
}
</script>