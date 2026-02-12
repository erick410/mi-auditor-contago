<template>
    <div class="q-pa-md">
        <!-- DIALOG PARA VER LOS PDF -->
        <q-dialog v-model="dialogPdf" persistent transition-show="scale" transition-hide="scale" maximized>
            <visor-pdf @CloseDialogPdf="CloseDialogPdf"></visor-pdf>
        </q-dialog>
        <!-- DIALOG DETALLES -->
        <q-dialog v-model="dialogDetalles" transition-show="scale" transition-hide="scale" maximized>
            <!-- TABLA DE COMPROBANTES -->
            <q-table  :selected.sync="itemsSeleccion"  selection="multiple" :data="itemsDetalles" :columns="columnsDet" row-key="folioFiscal"
            :rows-per-page-options="[10]" class="my-sticky-column-table" :filter="filterDos">
               <template v-slot:header-selection="scope">
                    <q-checkbox v-model="scope.selected" />
                </template>
                <template v-slot:top >
                
                    <q-btn push color="red-14" v-close-popup icon="mdi-close-circle-outline" rounded flat size="18px" padding="xs">
                        <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                            :offset="[10, 10]">Cerrar</q-tooltip>
                    </q-btn>
                    <q-space />
                    <q-chip color="primary" text-color="white">
                        {{textDetalles}} ({{FormatCurrency(montoFacturado)}})
                    </q-chip>
                    <q-chip color="primary" text-color="white">
                        {{ 'TOTAL PAGOS: ' + FormatCurrency(montoPagos) }}
                    </q-chip>
                    <q-space />
                    <q-input borderless dense debounce="300" v-model="filterDos" placeholder="Buscar">
                    </q-input>

                     <div class="row no-wrap justify-center">
                    
                </div>
                </template>
                <template v-slot:body="props"  v-slot:body-selection="scope">
                    <q-tr :props="props">
                        <q-td auto-width>
                        <q-checkbox v-model="props.selected" />
                        </q-td>
                        <q-td auto-width>
                                <q-btn size="md" color="red" rounded flat dense @click="VerPdfPago(props.row)"
                                    icon="mdi-file-pdf-box">
                                    <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                        content-style="font-size: 14px" :offset="[10, 10]">Ver Comprobante</q-tooltip>
                                </q-btn>
                            </q-td>
                        <q-td key="serie" :props="props">{{ props.row.serie }}</q-td>
                        <q-td key="folio" :props="props">{{ props.row.folio }}</q-td>
                        <q-td key="fechaPago" :props="props">{{ props.row.fechaPago }}</q-td>
                        <q-td key="rfc" :props="props">{{ props.row.rfc }}</q-td>
                        <q-td key="nombre" :props="props">{{ props.row.nombre }}</q-td>
                        <q-td key="formaPago" :props="props">{{ props.row.formaPago }}</q-td>
                        <q-td key="idDocumento" :props="props">{{ props.row.idDocumento }}</q-td>
                        <q-td key="numParcialidad" :props="props">{{ props.row.numParcialidad }}</q-td>
                        <q-td key="impSaldoAnt" :props="props">{{ FormatCurrency(props.row.impSaldoAnt) }}</q-td>
                        <q-td key="impPagado" :props="props">{{ FormatCurrency(props.row.impPagado) }}</q-td>
                        <q-td key="impSaldoInsoluto" :props="props">{{ FormatCurrency(props.row.impSaldoInsoluto) }}</q-td>
                        <q-td key="folioFiscal" :props="props">{{ props.row.folioFiscal }}</q-td>
                    </q-tr>
                </template>
            </q-table>
        </q-dialog>
        <!-- DIALOG DETALLES RECIBIDOS -->
        <q-dialog v-model="dialogDetallesRecibidos" transition-show="scale" transition-hide="scale" maximized>
            <!-- TABLA DE COMPROBANTES -->
            <q-table  :selected.sync="itemsSeleccion"  selection="multiple" :data="itemsDetallesRecibidos" :columns="columnsDetRecibidos" row-key="folioFiscal"
            :rows-per-page-options="[10]" class="my-sticky-column-table" :filter="filterDos">
               <template v-slot:header-selection="scope">
                    <q-checkbox v-model="scope.selected" />
                </template>
                <template v-slot:top >
                
                    <q-btn push color="red-14" v-close-popup icon="mdi-close-circle-outline" rounded flat size="18px" padding="xs">
                        <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                            :offset="[10, 10]">Cerrar</q-tooltip>
                    </q-btn>
                    <q-space />
                    <q-chip color="primary" text-color="white">
                        {{ 'TOTAL: ' + FormatCurrency(montoFacturadoRecibido) }}
                    </q-chip>
                    <q-space />
                    <q-input borderless dense debounce="300" v-model="filterDos" placeholder="Buscar">
                    </q-input>

                     <div class="row no-wrap justify-center">
                    
                </div>
                </template>
                <template v-slot:body="props"  v-slot:body-selection="scope">
                    <q-tr :props="props">
                        <q-td auto-width>
                        <q-checkbox v-model="props.selected" />
                        </q-td>
                        <q-td auto-width>
                                <q-btn size="md" color="red" rounded flat dense @click="VerPdfRecibido(props.row)"
                                    icon="mdi-file-pdf-box">
                                    <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                        content-style="font-size: 14px" :offset="[10, 10]">Ver Comprobante</q-tooltip>
                                </q-btn>
                            </q-td>
                        <q-td key="serie" :props="props">{{ props.row.serie }}</q-td>
                        <q-td key="folio" :props="props">{{ props.row.folio }}</q-td>
                        <q-td key="fecha" :props="props">{{ props.row.fecha }}</q-td>
                        <q-td key="rfc" :props="props">{{ props.row.rfc }}</q-td>
                        <q-td key="nombre" :props="props">{{ props.row.nombre }}</q-td>
                        <q-td key="total" :props="props">{{ FormatCurrency(props.row.total) }}</q-td>
                        <q-td key="trasladados" :props="props">{{ FormatCurrency(props.row.trasladados) }}</q-td>
                        <q-td key="retenidos" :props="props">{{ FormatCurrency(props.row.retenidos) }}</q-td>
                        <q-td key="moneda" :props="props">{{ props.row.moneda }}</q-td>
                        <q-td key="folioFiscal" :props="props">{{ props.row.folioFiscal }}</q-td>
                    </q-tr>
                </template>
            </q-table>
        </q-dialog>
        <!-- SELECCIONA AÑO Y MES, BOTON DE BUSCAR Y EXPORTAR A EXCEL -->
        <div class="row no-wrap items-center q-mt-md q-pa-sm">
            <q-space />

            <!-- <q-input v-model="fehaIMasked" label="Fecha Inicial" class="q-mr-sm" name="event">
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
            </q-input> -->

            <q-btn push color="amber-9" @click="GeneraConsulta" icon="mdi-text-box-search-outline" rounded flat size="18px"
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
        <q-table title="Reporte Anticipos" :data="dataComprobantes" :columns="columns" row-key="folioFiscal"
            :rows-per-page-options="[10]" class="my-sticky-column-table" :filter="filter">
            <template v-slot:top>
                <span>Reporte factoraje directo</span>
                <q-space />
                <q-input borderless dense debounce="300" v-model="filter" placeholder="Buscar">
                </q-input>
            </template>
            <template v-slot:body="props">
                <q-tr :props="props">
                    <q-td auto-width>
                        <q-btn size="md" color="red" rounded flat dense @click="VerPdf(props.row)"
                            icon="mdi-file-pdf-box">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Ver Comprobante</q-tooltip>
                        </q-btn>
                        <q-btn size="md" color="red" rounded flat dense @click="VerPago(props.row)"
                            icon="mdi-cash-sync">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Ver Pagos</q-tooltip>
                        </q-btn>
                    </q-td>
                    <q-td key="serie" :props="props">{{ props.row.serie }}</q-td>
                    <q-td key="folio" :props="props">{{ props.row.folio }}</q-td>
                    <q-td key="fecha" :props="props">{{ props.row.fecha }}</q-td>
                    <q-td key="rfc" :props="props">{{ props.row.rfc }}</q-td>
                    <q-td key="nombre" :props="props">{{ props.row.nombre }}</q-td>
                    <q-td key="total" :props="props">{{ FormatCurrency(props.row.total) }}</q-td>
                    <q-td key="trasladados" :props="props">{{ FormatCurrency(props.row.trasladados) }}</q-td>
                    <q-td key="retenidos" :props="props">{{ FormatCurrency(props.row.retenidos) }}</q-td>
                    <q-td key="moneda" :props="props">{{ props.row.moneda }}</q-td>
                    <q-td key="folioFiscal" :props="props">{{ props.row.folioFiscal }}</q-td>
                    <q-td key="complementos17" :props="props">{{ FormatCurrency(props.row.complementos17) }}</q-td>
                    <q-td key="complementosOtro" :props="props">{{ FormatCurrency(props.row.complementosOtro) }}</q-td>
                    <q-td key="sumaComplementos" :props="props">{{ FormatCurrency(props.row.sumaComplementos) }}</q-td>
                    <q-td key="diferencia" :props="props">{{ FormatCurrency(props.row.diferencia) }}</q-td>
                </q-tr>
            </template>
        </q-table>
        <!-- TABLA DE COMPROBANTES RECIBIDOS -->
        <q-table title="Reporte Anticipos" :data="dataComprobantesRecibidos" :columns="columnsRecibidos" row-key="rfc"
            :rows-per-page-options="[10]" class="my-sticky-column-table" :filter="filter">
            <template v-slot:top>
                <span>Reporte comprobantes recibidos</span>
                <q-space />
                <q-input borderless dense debounce="300" v-model="filter" placeholder="Buscar">
                </q-input>
            </template>
            <template v-slot:body="props">
                <q-tr :props="props">
                    <q-td auto-width>
                        <q-btn size="md" color="red" rounded flat dense @click="VerDetalleRecibido(props.row)"
                            icon="mdi-format-list-bulleted">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Ver comrobantes</q-tooltip>
                        </q-btn>
                    </q-td>
                    <q-td key="rfc" :props="props">{{ props.row.rfc }}</q-td>
                    <q-td key="nombre" :props="props">{{ props.row.nombre }}</q-td>
                    <q-td key="total" :props="props">{{ FormatCurrency(props.row.total) }}</q-td>
                </q-tr>
            </template>
        </q-table>
    </div>
</template>

<script>
    import axios from 'axios'
    import moment from 'moment'
    import visorPdf from '../Pdf/VisorPdf.vue'
    import * as xlsx from 'xlsx';
    import { QSpinnerCube } from 'quasar'
    import { format, lastDayOfMonth, differenceInDays, parseISO, utcToZonedTime } from 'date-fns';

    export default {
        components: {
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
                    { name: 'total', align: 'right', label: 'Total', field: 'total', sortable: true },
                    { name: 'trasladados', align: 'right', label: 'Trasladados', field: 'trasladados', sortable: true },
                    { name: 'retenidos', align: 'right', label: 'Retenidos', field: 'retenidos', sortable: true },
                    { name: 'moneda', align: 'left', label: 'Moneda', field: 'moneda', sortable: true },
                    { name: 'folioFiscal', align: 'left', label: 'Folio Fiscal', field: 'folioFiscal', sortable: true },
                    { name: 'complementos17', align: 'right', label: 'Complementos 17', field: 'complementos17', sortable: true },
                    { name: 'complementosOtro', align: 'right', label: 'Complementos Otro', field: 'complementosOtro', sortable: true },
                    { name: 'sumaComplementos', align: 'right', label: 'Suma de complementos', field: 'sumaComplementos', sortable: true },
                    { name: 'diferencia', align: 'right', label: 'Diferencia', field: 'diferencia', sortable: true },
                ],

                columnsDet:[
                    { name: 'actions', align: 'left', label: 'Acciones', field: 'actions' },
                    { name: 'serie', align: 'left', label: 'Serie', field: 'serie', sortable: true },
                    { name: 'folio', align: 'left', label: 'Folio', field: 'folio', sortable: true },
                    { name: 'fechaPago', align: 'left', label: 'Fecha de Pago', field: 'fechaPago', sortable: true },
                    { name: 'rfc', align: 'left', label: 'RFC', field: 'rfc', sortable: true },
                    { name: 'nombre', align: 'left', label: 'Nombre', field: 'nombre', sortable: true },
                    { name: 'formaPago', align: 'left', label: 'Forma de Pago', field: 'formaPago', sortable: true },
                    { name: 'idDocumento', align: 'left', label: 'Id. Documento', field: 'idDocumento', sortable: true },
                    { name: 'numParcialidad', align: 'left', label: 'Num. Parcialidad', field: 'numParcialidad', sortable: true },
                    { name: 'impSaldoAnt', align: 'right', label: 'Imp. Saldo anterior', field: 'impSaldoAnt', sortable: true },
                    { name: 'impPagado', align: 'right', label: 'Imp. Pagado', field: 'impPagado', sortable: true },
                    { name: 'impSaldoInsoluto', align: 'right', label: 'Imp. Saldo insoluto', field: 'impSaldoInsoluto', sortable: true },
                    { name: 'folioFiscal', align: 'left', label: 'Folio Fiscal', field: 'folioFiscal', sortable: true },
                ],

                columnsRecibidos:[
                    { name: 'actions', align: 'left', label: 'Acciones', field: 'actions' },
                    { name: 'rfc', align: 'left', label: 'RFC', field: 'rfc', sortable: true },
                    { name: 'nombre', align: 'left', label: 'Nombre', field: 'nombre', sortable: true },
                    { name: 'total', align: 'right', label: 'Total', field: 'total', sortable: true },
                ],

                columnsDetRecibidos:[
                    { name: 'actions', align: 'left', label: 'Acciones', field: 'actions' },
                    { name: 'serie', align: 'left', label: 'Serie', field: 'serie', sortable: true },
                    { name: 'folio', align: 'left', label: 'Folio', field: 'folio', sortable: true },
                    { name: 'fecha', align: 'left', label: 'Fecha', field: 'fecha', sortable: true },
                    { name: 'rfc', align: 'left', label: 'RFC', field: 'rfc', sortable: true },
                    { name: 'nombre', align: 'left', label: 'Nombre', field: 'nombre', sortable: true },
                    { name: 'total', align: 'right', label: 'Total', field: 'total', sortable: true },
                    { name: 'trasladados', align: 'right', label: 'Trasladados', field: 'trasladados', sortable: true },
                    { name: 'retenidos', align: 'right', label: 'Retenidos', field: 'retenidos', sortable: true },
                    { name: 'moneda', align: 'left', label: 'Moneda', field: 'moneda', sortable: true },
                    { name: 'folioFiscal', align: 'left', label: 'Folio Fiscal', field: 'folioFiscal', sortable: true },
                ],

                dataComprobantes: [],
                dataComprobantesRecibidos: [],
                filter: '',
                //FECHAS
                fechaI: new Date(),
                fechaF: new Date(),

                dialogDetalles: false,
                dialogDetallesRecibidos: false,
                textDetalles: "",
                itemsDetalles: [],
                itemsDetallesRecibidos: [],
                filterDos: "",
                itemsSeleccion: [],

                //PDF
                dialogPdf: false,
                montoFacturado: 0,
                montoFacturadoRecibido: 0,
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
            },

            sumDetalles(){
                return this.itemsDetalles.reduce((acumulador, objeto) => acumulador + objeto.total, 0);
            },
             sumaSeleccionado() {
                return this.itemsSeleccion.reduce((acumulador, objeto) => acumulador + objeto.total, 0);
            },

            montoPagos(){
                return this.itemsDetalles.reduce((acumulador, objeto) => acumulador + objeto.impPagado, 0);
            },

        },
        created() {

        },
        methods: {
            async GeneraConsulta(){
                await this.GetReporte();
                await this.GetReporteRecibidos();
            },

            async GetReporte() {
                this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'red-8', spinnerSize: 140, message: 'Consultando...' })
                try {
                    let response = await axios.get(this.rutaAxios + 'Ingresos/GetReporteFactorajeAsync/erp_' + this.token.rfc);
                    let x = response.data;
                    this.dataComprobantes = [...x]
                    this.$q.loading.hide()
                } catch (error) {
                    console.log(error)
                    this.$q.loading.hide()
                }
            },

            async GetReporteRecibidos() {
                this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'red-8', spinnerSize: 140, message: 'Consultando...' })
                try {
                    let response = await axios.get(this.rutaAxios + 'Ingresos/GetReporteFactorajeRecibidosAsync/erp_' + this.token.rfc);
                    let x = response.data;
                    this.dataComprobantesRecibidos = [...x]
                    this.$q.loading.hide()
                } catch (error) {
                    console.log(error)
                    this.$q.loading.hide()
                }
            },

            FormatCurrency(value) {
                return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
            },

            // ExportExcel() {
            //     let fI = moment(this.fechaI).format('DD-MMMM-YYYY')
            //     let fF = moment(this.fechaF).format('DD-MMMM-YYYY')
            //     const workbook = XLSX.utils.book_new();
            //     const sheetOtros = XLSX.utils.json_to_sheet(this.dataComprobantes);
            //     XLSX.utils.book_append_sheet(workbook, sheetOtros, 'CONCEPTOS');
            //     XLSX.writeFile(workbook, 'FACTIRAJE.xlsx');
            // },

            ExportExcel() {
            let reporte = 'REPORTE DE FACTORAJE'
            let empresa = this.$store.state.empresaStore.nombre
            let rfc = this.$store.state.empresaStore.rfc
            let fI = moment(this.fechaI).format('DD-MMMM-YYYY')
            let fF = moment(this.fechaF).format('DD-MMMM-YYYY')
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

            xlsx.utils.book_append_sheet(workbook, sheet, "FACTORAJE");

            xlsx.writeFile(
                workbook,
                rfc + ' - ' + empresa +  ' - REPORTE DE FACTORAJE DEL ' + periodo.toUpperCase() + '.xlsx'
            );
            },

            UltimoDiaMes() {
                const fecha = new Date(this.fechaI);
                const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
                this.fechaF = ultimoDia;
            },

            VerPago(item){
                this.itemsDetalles = [];
                this.itemsDetalles = [...item.pagos];
                this.dialogDetalles = true;
                this.textDetalles = "TOTAL FACTURA";
                this.itemsSeleccion = []
                this.montoFacturado = item.total
            },

            VerPdf(item){
                this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'red-8', spinnerSize: 140, message: 'Consultando...' })
                let folioFiscal = item.folioFiscal;    
                
                try {
                    this.$store.state.vistaPreviaStore.folioFiscal = folioFiscal;
                    this.$store.state.vistaPreviaStore.color = "19775C"
                    this.$store.state.vistaPreviaStore.tipoComprobanteInterno = "FACTURA"
                    this.$store.state.vistaPreviaStore.tipo = "E"
                    this.$store.state.vistaPreviaStore.rfc = this.token.rfc
                    this.dialogPdf = true;
                    this.$q.loading.hide()
                } catch (error) {
                    console.log(error)
                    this.$q.loading.hide()
                }
            },

            VerPdfPago(item){
                this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'red-8', spinnerSize: 140, message: 'Consultando...' })
                let folioFiscal = item.folioFiscal;    
                
                try {
                    this.$store.state.vistaPreviaStore.folioFiscal = folioFiscal;
                    this.$store.state.vistaPreviaStore.color = "19775C"
                    this.$store.state.vistaPreviaStore.tipoComprobanteInterno = "PAGO"
                    this.$store.state.vistaPreviaStore.tipo = "E"
                    this.$store.state.vistaPreviaStore.rfc = this.token.rfc
                    this.dialogPdf = true;
                    this.$q.loading.hide()
                } catch (error) {
                    console.log(error)
                    this.$q.loading.hide()
                }
            },
            
            VerPdfRecibido(item){
                this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'red-8', spinnerSize: 140, message: 'Consultando...' })
                let folioFiscal = item.folioFiscal;    
                
                try {
                    this.$store.state.vistaPreviaStore.folioFiscal = folioFiscal;
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

            CloseDialogPdf(){
                this.dialogPdf = false;
            },
            
            VerDetalleRecibido(item){
                this.itemsDetallesRecibidos = [];
                this.itemsDetallesRecibidos = [...item.detalles];
                this.dialogDetallesRecibidos = true;
                this.textDetalles = "COMPROBANTES RECIBIDOS " + item.rfc;
                this.montoFacturadoRecibido = item.total
            }
        },
    }
</script>