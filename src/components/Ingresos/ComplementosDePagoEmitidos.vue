<template>
    <div class="q-pa-md">

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

        <!-- DIALOG PARA VER LOS PDF -->
        <q-dialog v-model="dialogPdf" persistent transition-show="scale" transition-hide="scale" maximized>
            <visor-pdf @CloseDialogPdf="CloseDialogDetalles"></visor-pdf>
        </q-dialog>

        <!-- SELECCIONA AÑO Y MES, BOTON DE BUSCAR Y EXPORTAR A EXCEL -->
        <div class="row no-wrap items-center q-mt-md q-pa-sm">
            <q-space />

            <q-input v-model="fehaIMasked" label="Fecha Inicial" class="q-mr-sm" name="event" outlined dense>
                <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                    <q-date v-model="fechaI" @input="UltimoDiaMes">
                        <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Ok" color="primary" flat />
                        </div>
                    </q-date>
                </q-popup-proxy>
            </q-input>

            <q-input v-model="fechaFMasked" label="Fecha Final" class="q-mr-xs" outlined dense>
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
            <q-btn push color="red-10" @click="abrirDialogLista69B" icon="mdi-account-search" rounded flat size="18px"
                padding="xs">
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                    :offset="[10, 10]">Lista 69B</q-tooltip>
            </q-btn>
            <q-space />
        </div>

        <!-- TABLA DE COMPROBANTES -->
        <q-table :data="dataComprobantes" :columns="columns" row-key="folioFiscal"
            :rows-per-page-options="[10]" class="my-sticky-column-table" :filter="filter">
            <template v-slot:top>
                <span class="text-body1" content-style="font-size: 20px">Complementos de Pago</span>
                <q-space />
                <q-input borderless dense debounce="300" v-model="filter" placeholder="Filtrar">
                    <template v-slot:append>
                        <q-icon name="search" />
                    </template>
                </q-input>
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
    </div>
</template>
<script>
    import axios from 'axios'
    import moment from 'moment'
    import detalles from './CuentasXCobrarDet'
    import * as xlsx from 'xlsx';
    import { format, lastDayOfMonth } from 'date-fns';
    import { es } from 'date-fns/locale';

    import visorPdf from '../Pdf/VisorPdf.vue'
    import { QSpinnerCube } from 'quasar'
    import ChartComponent from "../Graficas/ChartComponent.vue";
    import lista69 from '../Lista69B/Lista69B.vue'

    export default {
        components: {
            ChartComponent,
            detalles,
            visorPdf,
            lista69
        },
        data() {
            return {
                totalCobrado: 0,
                totalFacturado: 0,
                totalNc: 0,
                totalPorCobrar: 0,
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

                //LOADING
                dialogtext: '',

                //DETALLES
                dialogDetalles: false,
                dialogPdf: false,
                filter: '',

                charTitleE: 'Cuentas por Cobrar',
                chartData: null,
                dialogLista69B: false
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
                    let response = await axios.get(this.rutaAxios + 'Ingresos/GetComplementosDePagoAsync/erp_' + this.token.rfc + '/' + fI + '/' + fF);
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
            //     XLSX.utils.book_append_sheet(workbook, sheetOtros, 'CXC');

            //     XLSX.writeFile(workbook, 'COMPLEMENTOS DE PAGO EMITIDOS DEL ' + fI + ' AL ' + fF + '.xlsx');
            // },

            ExportExcel() {
            let reporte = 'REPORTE DE COMPLEMENTOS DE PAGO EMITIDOS'
            let empresa = this.$store.state.empresaStore.nombre
            let rfc = this.$store.state.empresaStore.rfc
            let fi_ = new Date(this.fechaI);
                let ff_ = new Date(this.fechaF);

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
                rfc + ' - ' + empresa +  ' - REPORTE DE COMPLEMENTOS DE PAGO EMITIDOS DEL ' + periodo.toUpperCase() + '.xlsx'
            );
            },

            UltimoDiaMes() {
                const fecha = new Date(this.fechaI);

                const ultimoDiaDelMes = lastDayOfMonth(fecha);

                const fechaFormateada = format(ultimoDiaDelMes, 'yyyy-MM-dd');

                // const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
                this.fechaF = fechaFormateada;
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
                        this.$store.state.vistaPreviaStore.tipo = "E"
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
                    try {
                        this.$store.state.vistaPreviaStore.folioFiscal = item.idDocumento;
                        this.$store.state.vistaPreviaStore.color = "19775C"
                        this.$store.state.vistaPreviaStore.tipoComprobanteInterno = "FACTURA"
                        this.$store.state.vistaPreviaStore.tipo = "E"
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
            abrirDialogLista69B() {
                this.dialogLista69B = true
            }
        },
    }
</script>