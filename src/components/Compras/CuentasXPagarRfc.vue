<template>
    <div class="q-pa-md">
        <!-- DIALOG PARA VER LOS PDF -->
        <q-dialog v-model="dialogPdf" persistent transition-show="scale" transition-hide="scale" maximized>
            <visor-pdf @CloseDialogPdf="CloseDialogDetalles"></visor-pdf>
        </q-dialog>

        <!-- DIALOG DE LOS DETALLES -->
        <q-dialog v-model="dialogDetalles" persistent transition-show="scale" transition-hide="scale" maximized>
            <detalles @CloseDialogDetalles="CloseDialogDetalles"></detalles>
        </q-dialog>

        <!-- SELECCIONA AÑO Y MES, BOTON DE BUSCAR Y EXPORTAR A EXCEL -->
        <div class="row no-wrap items-center q-mt-md q-pa-sm">
            <q-space />

            <q-input v-model="fehaIMasked" label="Fecha Inicial" class="q-mr-sm" name="event">
                <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                    <q-date v-model="fechaI" @input="UltimoDiaMes">
                        <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Ok" color="primary" flat />
                        </div>
                    </q-date>
                </q-popup-proxy>
            </q-input>

            <q-input v-model="fechaFMasked" label="Fecha Final" class="q-mr-xs">
                <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                    <q-date v-model="fechaF" @input="CambiaFecha">
                        <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Ok" color="primary" flat />
                        </div>
                    </q-date>
                </q-popup-proxy>
            </q-input>

            <q-select v-model="selectClientes" use-input input-debounce="0" label="Proveedores" :options="optionsClientes"
                @filter="filterFn" fill-input hide-selected style="width: 300px" :loading="loadingClientes">
                <template v-slot:no-option>
                    <q-item>
                        <q-item-section class="text-grey">
                            Buscar Proveedores por RFC
                        </q-item-section>
                    </q-item>
                </template>
            </q-select>

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

        <!-- TABLA DE COMPROBANTES -->
        <q-table title="Reporte ISR" :data="dataComprobantes" :columns="columns" row-key="folioFiscal"
            :rows-per-page-options="[10]" class="my-sticky-column-table">
            <template v-slot:top>
                <span class="text-body1" content-style="font-size: 20px">Cuentas Por Pagar por RFC</span>
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
                        <q-btn size="md" color="primary" rounded flat dense @click="OpenDialogDetalle(props.row)"
                            icon="mdi-format-list-bulleted">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Detalles</q-tooltip>
                        </q-btn>
                        <q-btn size="md" color="primary" rounded flat dense @click="VerComprobante(props.row)"
                            icon="mdi-file-pdf-box">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Ver Comprobante</q-tooltip>
                        </q-btn>
                    </q-td>

                    <q-td key="serie" :props="props">{{ props.row.serie }}</q-td>
                    <q-td key="folio" :props="props">{{ props.row.folio }}</q-td>
                    <q-td key="fecha" :props="props">{{ FormatDate(props.row.fecha) }}</q-td>
                    <q-td key="rfc" :props="props">{{ props.row.rfc }}</q-td>
                    <q-td key="nombre" :props="props">{{ props.row.nombre }}</q-td>

                    <q-td key="porPagar" :props="props">{{ FormatCurrency(props.row.porPagar) }}</q-td>
                    <q-td key="pagado" :props="props">{{ FormatCurrency(props.row.pagado) }}</q-td>
                    <q-td key="total" :props="props">{{ FormatCurrency(props.row.total) }}</q-td>
                    <q-td key="moneda" :props="props">{{ props.row.moneda }}</q-td>
                    <q-td key="nc" :props="props">{{ FormatCurrency(props.row.nc) }}</q-td>

                    <q-td key="folioFiscal" :props="props">{{ props.row.folioFiscal }}</q-td>
                </q-tr>
            </template>
        </q-table>
        <q-markup-table separator="vertical" v-if="dataComprobantes.length != 0">
            <thead>
                <tr>
                    <th class="text-center">Total Por Pagar</th>
                    <th class="text-center">Total Pagado</th>
                    <th class="text-center">Total Facturado</th>
                    <th class="text-center">Total Notas de Crédito</th>
                </tr>
            </thead>
            <tbody style="background: rgb(255, 190, 190)">
                <tr>
                    <td class="text-right">{{ FormatCurrency(totalPorPagar) }}</td>
                    <td class="text-right">{{ FormatCurrency(totalPagado) }}</td>
                    <td class="text-right">{{ FormatCurrency(totalFacurado) }}</td>
                    <td class="text-right">{{ FormatCurrency(totalNc) }}</td>
                </tr>
            </tbody>
        </q-markup-table>

           <!-- GRAFICA-->
           <q-card style="width: 100%; " class="full-width q-mt-lg">
            <chart-component :chartData="chartData" :chartTitle="charTitleE"  ></chart-component>
        </q-card>
    </div>
</template>
<script>
import axios from 'axios'
import moment from 'moment'
import detalles from './CuentasXPagarDet'
import * as xlsx from 'xlsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import visorPdf from '../Pdf/VisorPdf.vue'
import { ComprobanteBase64 } from '../Pdf/ComprobanteBase64.js'
import { generarCodigoQR } from '../Pdf/qrcodeGenerator';
import ChartComponent from "../Graficas/ChartComponent.vue";
import { QSpinnerCube } from 'quasar'

export default {
    components: {
        detalles,
            ChartComponent,
            visorPdf,
    },
    data() {
        return {
            totalPorPagar: 0,
            totalPagado: 0,
            totalFacurado: 0,
            totalNc: 0,

            columns: [
                { name: 'actions', align: 'left', label: 'Acciones', field: 'actions' },
                { name: 'serie', align: 'left', label: 'Serie', field: 'serie', sortable: true },
                { name: 'folio', align: 'left', label: 'Folio', field: 'folio', sortable: true },
                { name: 'fecha', align: 'left', label: 'Fecha', field: 'fecha', sortable: true },
                { name: 'rfc', align: 'left', label: 'RFC', field: 'rfc', sortable: true },
                { name: 'nombre', align: 'left', label: 'Nombre', field: 'nombre', sortable: true },
                { name: 'porPagar', align: 'right', label: 'Por Pagar', field: 'porPagar', sortable: true },
                { name: 'pagado', align: 'right', label: 'Pagado', field: 'pagado', sortable: true },
                { name: 'total', align: 'right', label: 'Total Facturado', field: 'total', sortable: true },
                { name: 'moneda', align: 'left', label: 'Moneda', field: 'moneda', sortable: true },
                { name: 'nc', align: 'right', label: 'Notas de Crédito', field: 'nc', sortable: true },
                { name: 'folioFiscal', align: 'left', label: 'Folio Fiscal', field: 'folioFiscal', sortable: true },
            ],
            dataComprobantes: [],

            //FECHAS
            fechaI: new Date(),
            fechaF: new Date(),

            //DETALLES
            dialogDetalles: false,
            dialogPdf: false,

            //LISTADO DE CLIENTES
            clientes: [],
            selectClientes: null,
            optionsClientes: [],
            options: [],
            loadingClientes: false,

            charTitleE: '',
            chartData: null,
        }
    },
    computed: {
        token() {
            return this.$store.state.usuario;
        },

        fehaIMasked() {
            moment.locale('es-mx');
            return this.fechaI ? moment(this.fechaI).format('DD/MMMM/yyyy') : ''
        },

        fechaFMasked() {
            moment.locale('es-mx');
            return this.fechaF ? moment(this.fechaF).format('DD/MMMM/yyyy') : ''
        },

        rutaAxios() {
            return this.$store.state.rutaMongoStore
        }

    },
    created() {
        // this.GetClientes();
    },
    methods: {
        calcularTotales() {
            this.totalPorPagar = this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.porPagar, 0)
            this.totalPagado = this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.pagado, 0)
            this.totalFacurado = this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.total, 0)
            this.totalNc = this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.nc, 0)
        },

        async GetReporte() {
            this.OpenDialogLoading()
            let fI = moment(this.fechaI).format('YYYY-MM-DD')
            let fF = moment(this.fechaF).format('YYYY-MM-DD')
            try {
                let response = await axios.get(this.rutaAxios + 'Gastos/GetCxPAsync/erp_' + this.token.rfc + '/' + fI + '/' + fF + '/' + this.selectClientes.value);
                let x = response.data;
                this.dataComprobantes = [...x]
                console.log(x)
                this.GetGrafica()
                this.calcularTotales();
                this.$q.loading.hide()
            } catch (error) {
                console.log(error)
                this.$q.loading.hide()
            }
        },
        async GetGrafica() {

const objetos = this.dataComprobantes;

if (objetos.length === 0) {
    return
}

const ordenados = [...objetos].sort((a, b) => b.porPagar - a.porPagar);

const todos = ordenados.slice(0, 10);
const importe = todos.map((item) => item.porPagar);

const sumaIngresos = this.dataComprobantes.reduce((acumulador, actual) => acumulador + actual.porPagar, 0);
const sumaTotal = sumaIngresos

let ObjIngresos = {
    label: "Por Pagar: " + this.FormatoMiles(sumaIngresos),
    backgroundColor: "rgba(0, 163, 92, 0.5)",
    borderColor: "rgba(0, 163, 92)",
    borderWidth: 1,
    data: importe,
}

let ObjIngresosLinea = {
    label: "Por Pagar (Linea): " + this.FormatoMiles(sumaIngresos),
    type: 'line',
    borderColor: "rgba(0, 163, 92)",
    borderWidth: 1,
    data: importe,
}

let descripcion = []
for (let a of todos) {
    descripcion.push(a.folioFiscal)
}

let chartDatas = {
    labels: descripcion,
    datasets: []
}
chartDatas.datasets.push(ObjIngresos)
chartDatas.datasets.push(ObjIngresosLinea)
this.chartData = { ...chartDatas }

this.charTitleE = 'Cuentas por Pagar por RFC: ' + this.FormatoMiles(sumaTotal)
},
        async GetClientes(ObjFechaI, ObjFechaF) {
            this.OpenDialogLoading()
            try {
                let response = await axios.get(this.rutaAxios + 'Gastos/GetProveedoresReporteAsync/erp_' + this.token.rfc + '/' + ObjFechaI + '/' + ObjFechaF);
                let x = response.data;
                // console.log(x);
                this.options = [...x]
                this.$q.loading.hide()
            } catch (error) {
                console.log(error)
                this.$q.loading.hide()
            }
        },

        FormatCurrency(value) {
            return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        },

        FormatDate(value) {
            let fecha_ = value.replace('T', ' ')
            let fecha_1 = fecha_.replace('Z', ' ')
            let listo = new Date(fecha_1);
            moment.locale('es-mx');
            return moment(listo).format('DD-MMMM-YYYY HH:mm:ss')
        },

        // ExportExcel() {
        //     let fi_ = new Date(this.fechaI);
        //     let ff_ = new Date(this.fechaF);

        //     let fI = format(fi_, 'dd-MMMM-yyyy', { locale: es })
        //     let fF = format(ff_, 'dd-MMMM-yyyy', { locale: es })

        //     const workbook = XLSX.utils.book_new();

        //     const sheetOtros = XLSX.utils.json_to_sheet(this.dataComprobantes);
        //     XLSX.utils.book_append_sheet(workbook, sheetOtros, 'CXC');

        //     XLSX.writeFile(workbook, 'CUENTAS POR PAGAR DE' + this.selectClientes.value + ' DEL ' + fI + ' AL ' + fF + '.xlsx');
        // },

        ExportExcel() {
            let reporte = 'REPORTE DE CUENTAS POR PAGAR DE ' + this.selectClientes.value
            let empresa = this.$store.state.empresaStore.nombre
            let rfc = this.$store.state.empresaStore.rfc
            let fi_ = new Date(this.fechaI);
            let ff_ = new Date(this.fechaF);

            let fI = format(fi_, 'dd-MMMM-yyyy', { locale: es })
            let fF = format(ff_, 'dd-MMMM-yyyy', { locale: es })
            let periodo = fI + ' AL ' + fF 

            const workbook = xlsx.utils.book_new();

            const cabecera = [
                [reporte.toUpperCase()],
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

            xlsx.utils.book_append_sheet(workbook, sheet, "CXP");

            xlsx.writeFile(
                workbook,
                rfc + ' - ' + empresa +  ' - ' + reporte + ' - DEL ' + periodo.toUpperCase() + '.xlsx'
            );
            },

        async UltimoDiaMes() {
            const fecha = new Date(this.fechaI);
            const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
            this.fechaF = ultimoDia;

            let fi_ = new Date(this.fechaI);
            let ff_ = new Date(this.fechaF);
            let fi = format(fi_, 'yyyy-MM-dd')
            let ff = format(ff_, 'yyyy-MM-dd')

            await this.GetClientes(fi, ff)
        },

        async CambiaFecha() {
            let fi_ = new Date(this.fechaI);
            let ff_ = new Date(this.fechaF);
            let fi = format(fi_, 'yyyy-MM-dd')
            let ff = format(ff_, 'yyyy-MM-dd')

            await this.GetClientes(fi, ff)
        },

        OpenDialogDetalle(item) {
            console.log(item)
            this.$store.state.detallesComplementosStore.origen = '';
            this.$store.state.detallesComplementosStore.tipo = 'CUENTAS POR PAGAR';
            this.$store.state.detallesComplementosStore.detalles = item.detalles;
            this.$store.state.detallesComplementosStore.notasCredito = item.notasCredito;            
            this.dialogDetalles = true;
        },

        CloseDialogDetalles() {
            this.dialogDetalles = false;
            this.dialogPdf = false;
        },

        filterFn(val, update) {
            let stringOptions = this.options
            if (val === '') {
                update(() => {
                    this.optionsClientes = stringOptions
                })
                return
            }

            update(() => {
                const needle = val.toLowerCase()
                this.optionsClientes = stringOptions.filter(v => v.label.toLowerCase().indexOf(needle) > -1)
            })
        },

        async VerComprobante(item) {
            this.OpenDialogLoading();
            try {
                this.$store.state.vistaPreviaStore.folioFiscal = item.folioFiscal;
                this.$store.state.vistaPreviaStore.color = "19775C"
                this.$store.state.vistaPreviaStore.tipoComprobanteInterno = "FACTURA"
                this.$store.state.vistaPreviaStore.tipo = "R"
                this.$store.state.vistaPreviaStore.rfc = this.token.rfc
                this.dialogPdf = true;
                this.$q.loading.hide()
            } catch (error) {
                console.log(error)
                this.$q.loading.hide()
            }
        },

        OpenDialogLoading() {
            this.$q.loading.show({
                spinner: QSpinnerCube,
                spinnerColor: 'red-8',
                spinnerSize: 140,
                // backgroundColor: 'purple',
                message: 'Consultando...',
                // messageColor: 'black'
            })
        },

        FormatoMiles(value) {
            return value.toLocaleString('en-US');
        },
    },
}
</script>

<style lang="sass">
    .my-sticky-column-table
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