<template>
    <div class="q-pa-md">
        <!-- DIALOG PARA VER LOS PDF -->
        <q-dialog v-model="dialogPdf" persistent transition-show="scale" transition-hide="scale" maximized>
            <visor-pdf @CloseDialogPdf="CloseDialogDetalles"></visor-pdf>
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
                    <q-date v-model="fechaF">
                        <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Ok" color="primary" flat />
                        </div>
                    </q-date>
                </q-popup-proxy>
            </q-input>

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
                <span class="text-body1" content-style="font-size: 20px">Complementos de Pago</span>
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
                        <q-btn size="md" color="red-5" rounded flat dense @click="VerComplemento(props.row)"
                            icon="mdi-file-pdf-box">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Ver Complemento</q-tooltip>
                        </q-btn>
                        <q-btn size="md" color="red-10" rounded flat dense @click="VerComprobante(props.row)"
                            icon="mdi-file-pdf-box">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Ver Factura</q-tooltip>
                        </q-btn>
                    </q-td>

                    <q-td key="serie" :props="props">{{ props.row.serie }}</q-td>
                    <q-td key="folio" :props="props">{{ props.row.folio }}</q-td>
                    <q-td key="fecha" :props="props">{{ FormatDate(props.row.fecha) }}</q-td>
                    <q-td key="rfc" :props="props">{{ props.row.rfc }}</q-td>
                    <q-td key="nombre" :props="props">{{ props.row.nombre }}</q-td>
                    <q-td key="folioFiscal" :props="props">{{ props.row.folioFiscal }}</q-td>
                    <q-td key="fechaPago" :props="props">{{ FormatDate(props.row.fechaPago) }}</q-td>
                    <q-td key="formaDePagoP" :props="props">{{ props.row.formaDePagoP }}</q-td>
                    <q-td key="monedaP" :props="props">{{ props.row.monedaP }}</q-td>
                    <q-td key="tipoCambioP" :props="props">{{ props.row.tipoCambioP }}</q-td>
                    <q-td key="idDocumento" :props="props">{{ props.row.idDocumento }}</q-td>
                    <q-td key="numParcialidad" :props="props">{{ props.row.numParcialidad }}</q-td>
                    <q-td key="impSaldoAnt" :props="props">{{ FormatCurrency(props.row.impSaldoAnt) }}</q-td>
                    <q-td key="impPagado" :props="props">{{ FormatCurrency(props.row.impPagado) }}</q-td>
                    <q-td key="impSaldoInsoluto" :props="props">{{ FormatCurrency(props.row.impSaldoInsoluto) }}</q-td>
                    <q-td key="monedaDR" :props="props">{{ props.row.monedaDR }}</q-td>
                    <q-td key="equivalenciaDR" :props="props">{{ props.row.equivalenciaDR }}</q-td>
                </q-tr>
            </template>
        </q-table>

        <!-- GRAFICA-->
        <q-card style="width: 100%; " class="full-width q-mt-lg">
            <chart-component class="height:700px" :chartData="chartData" :chartTitle="charTitleE"></chart-component>
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
    import { QSpinnerCube } from 'quasar'
    import ChartComponent from "../Graficas/ChartComponent.vue";

    export default {
        components: {
            detalles,
            ChartComponent,
            visorPdf,
        },
        data() {
            return {
                columns: [
                    { name: 'actions', align: 'left', label: 'Acciones', field: 'actions' },
                    { name: 'serie', align: 'left', label: 'Serie', field: 'serie', sortable: true },
                    { name: 'folio', align: 'left', label: 'Folio', field: 'folio', sortable: true },
                    { name: 'fecha', align: 'left', label: 'Fecha', field: 'fecha', sortable: true },
                    { name: 'rfc', align: 'left', label: 'RFC', field: 'rfc', sortable: true },
                    { name: 'nombre', align: 'left', label: 'Nombre', field: 'nombre', sortable: true },
                    { name: 'folioFiscal', align: 'left', label: 'Folio Fiscal', field: 'folioFiscal', sortable: true },
                    { name: 'fechaPago', align: 'left', label: 'Fecha de Pago', field: 'fechaPago', sortable: true },
                    { name: 'formaDePagoP', align: 'left', label: 'Forma de Pago', field: 'formaDePagoP', sortable: true },
                    { name: 'monedaP', align: 'left', label: 'Moneda P', field: 'monedaP', sortable: true },
                    { name: 'tipoCambioP', align: 'left', label: 'Tipo de Cambio P', field: 'tipoCambioP', sortable: true },
                    { name: 'idDocumento', align: 'left', label: 'Id Documento', field: 'idDocumento', sortable: true },
                    { name: 'numParcialidad', align: 'left', label: 'Num. Parcialidad', field: 'numParcialidad', sortable: true },
                    { name: 'impSaldoAnt', align: 'right', label: 'Saldo Anterior', field: 'impSaldoAnt', sortable: true },
                    { name: 'impPagado', align: 'right', label: 'Pagado', field: 'impPagado', sortable: true },
                    { name: 'impSaldoInsoluto', align: 'right', label: 'Saldo Insoluto', field: 'total', sortable: true },
                    { name: 'monedaDR', align: 'left', label: 'Moneda DR', field: 'monedaDR', sortable: true },
                    { name: 'equivalenciaDR', align: 'left', label: 'Equivalencia DR', field: 'equivalenciaDR', sortable: true },
                ],
                dataComprobantes: [],

                //FECHAS
                fechaI: new Date(),
                fechaF: new Date(),

                //DETALLES
                dialogDetalles: false,
                dialogPdf: false,

                totalFacturado: 0,
                totalNc: 0,
                totalPagado: 0,
                totalPorPagar: 0,

                charTitleE: 'Cuentas por Pagar',
                chartData: null
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

        },
        methods: {
            async GetReporte() {
                this.OpenDialogLoading()
                let fI = moment(this.fechaI).format('YYYY-MM-DD')
                let fF = moment(this.fechaF).format('YYYY-MM-DD')
                try {
                    let response = await axios.get(this.rutaAxios + 'Gastos/GetComplementosDePagoAsync/erp_' + this.token.rfc + '/' + fI + '/' + fF);
                    let x = response.data;
                    this.dataComprobantes = [...x]
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
            //     XLSX.utils.book_append_sheet(workbook, sheetOtros, 'CXP');

            //     XLSX.writeFile(workbook, 'COMPLEMENTOS DE PAGO RECIBIDOS DEL ' + fI + ' AL ' + fF + '.xlsx');
            // },

            ExportExcel() {
            let fi_ = new Date(this.fechaI);
            let ff_ = new Date(this.fechaF);

            let reporte = 'REPORTE DE COMPLEMENTOS DE PAGO RECIBIDOS'
            let empresa = this.$store.state.empresaStore.nombre
            let rfc = this.$store.state.empresaStore.rfc
            let fI = format(fi_, 'dd-MMMM-yyyy', { locale: es })
            let fF = format(ff_, 'dd-MMMM-yyyy', { locale: es })
            let periodo = fI + ' AL ' + fF 

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

            xlsx.utils.book_append_sheet(workbook, sheet, "COMPLEMENTOS");

            xlsx.writeFile(
                workbook,
                rfc + ' - ' + empresa +  ' - REPORTE DE COMPLEMENTOS DE PAGO RECIBIDOS DEL ' + periodo.toUpperCase() + '.xlsx'
            );
            },

            UltimoDiaMes() {
                const fecha = new Date(this.fechaI);
                const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
                this.fechaF = ultimoDia;
            },

            CloseDialogDetalles() {
                this.dialogDetalles = false;
                this.dialogPdf = false;
            },

            async VerComplemento(item) {
                this.OpenDialogLoading();
                try {
                    try {
                        this.$store.state.vistaPreviaStore.folioFiscal = item.folioFiscal;
                        this.$store.state.vistaPreviaStore.color = "19775C"
                        this.$store.state.vistaPreviaStore.tipoComprobanteInterno = "PAGO"
                        this.$store.state.vistaPreviaStore.tipo = "R"
                        this.$store.state.vistaPreviaStore.rfc = this.token.rfc
                    } catch (error) {
                        console.log(error)
                    }
                    this.dialogPdf = true;
                    this.$q.loading.hide()
                } catch (error) {
                    console.log(error)
                    this.$q.loading.hide()
                }
            },

            async VerComprobante(item) {
                this.OpenDialogLoading();
                try {
                    this.$store.state.vistaPreviaStore.folioFiscal = item.idDocumento;
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
        },
    }
</script>