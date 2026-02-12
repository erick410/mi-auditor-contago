<template>
    <div class="q-pa-md">
        <!-- DIALOG PARA VER LOS PDF -->
        <q-dialog v-model="dialogPdf" persistent transition-show="scale" transition-hide="scale" maximized>
            <visor-pdf @CloseDialogPdf="CloseDialogPdf"></visor-pdf>
        </q-dialog>
 
        <!-- DIALOG DETALLES -->
        <q-dialog v-model="dialogDetalles" transition-show="scale" transition-hide="scale" maximized>

            <!-- TABLA DE COMPROBANTES -->
            <q-table :selected.sync="itemsSeleccion"  selection="multiple" :data="itemsDetalles" :columns="columnsDet" row-key="folioFiscal"
            :rows-per-page-options="[10]" class="my-sticky-column-table" :filter="filterDos">
                <template v-slot:header-selection="scope">
                <q-checkbox v-model="scope.selected" />
            </template>
                <template v-slot:top>
                    <q-btn push color="red-14" v-close-popup icon="mdi-close-circle-outline" rounded flat size="18px" padding="xs">
                        <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                            :offset="[10, 10]">Cerrar</q-tooltip>
                    </q-btn>
                    <q-space />
                    <q-chip color="primary" text-color="white">
                        {{textDetalles}} ({{FormatCurrency(sumDetalles)}})
                    </q-chip>
                    <q-chip color="primary" text-color="white">
                        {{ 'Suma Parcial: ' + FormatCurrency(sumaSeleccionado) }}
                    </q-chip>
                    <!-- <span class="text-body1" content-style="font-size: 20px"> {{textDetalles}} ({{FormatCurrency(sumDetalles)}})</span>-->
                    <q-space />
                    <q-input borderless dense debounce="300" v-model="filterDos" placeholder="Buscar">
                    </q-input>
                </template>
                <template v-slot:body="props" v-slot:body-selection="scope">
                    <q-tr :props="props">
                        <q-td auto-width>
                        <q-checkbox v-model="props.selected" />
                            <q-btn size="md" color="red" rounded flat dense @click="VerPdf(props.row)"
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
                        <q-td key="subTotal" :props="props">{{ FormatCurrency(props.row.subTotal) }}</q-td>
                        <q-td key="descuento" :props="props">{{ FormatCurrency(props.row.descuento) }}</q-td>
                        <q-td key="total" :props="props">{{ FormatCurrency(props.row.total) }}</q-td>
                        <q-td key="formaPago" :props="props">{{ props.row.formaPago }}</q-td>
                        <q-td key="moneda" :props="props">{{ props.row.moneda }}</q-td>
                        <q-td key="tipoCambio" :props="props">{{ FormatCurrency(props.row.tipoCambio) }}</q-td>
                        <q-td key="folioFiscal" :props="props">{{ props.row.folioFiscal }}</q-td>
                    </q-tr>
                </template>
            </q-table>
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
        <q-table title="Reporte Anticipos" :data="dataComprobantes" :columns="columns" row-key="folioFiscal"
            :rows-per-page-options="[10]" class="my-sticky-column-table" :filter="filter">
            <template v-slot:top>
                <span>Reporte anticipos</span>
                <q-space />
                <q-input borderless dense debounce="300" v-model="filter" placeholder="Buscar">
                </q-input>
            </template>            
            <template v-slot:body="props">
                <q-tr :props="props">
                    <q-td auto-width>
                        <q-btn size="md" color="green" rounded flat dense @click="VerIngreso(props.row)"
                            icon="mdi-arrow-up-bold-outline">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Ver Ingresos</q-tooltip>
                        </q-btn>
                        <q-btn size="md" color="red" rounded flat dense @click="VerNc(props.row)"
                            icon="mdi-arrow-down-bold-outline">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Ver NC</q-tooltip>
                        </q-btn>
                        <q-btn size="md" color="red" rounded flat dense @click="VerPdf(props.row)"
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
                    <q-td key="subTotal" :props="props">{{ FormatCurrency(props.row.subTotal) }}</q-td>
                    <q-td key="descuento" :props="props">{{ FormatCurrency(props.row.descuento) }}</q-td>
                    <q-td key="total" :props="props">{{ FormatCurrency(props.row.total) }}</q-td>
                    <q-td key="totalIngreso" :props="props">{{ FormatCurrency(props.row.totalIngreso) }}</q-td>
                    <q-td key="totalNc" :props="props">{{ FormatCurrency(props.row.totalNc) }}</q-td>
                    <q-td key="formaPago" :props="props">{{ props.row.formaPago }}</q-td>
                    <q-td key="moneda" :props="props">{{ props.row.moneda }}</q-td>
                    <q-td key="tipoCambio" :props="props">{{ FormatCurrency(props.row.tipoCambio) }}</q-td>
                    <q-td key="folioFiscal" :props="props">{{ props.row.folioFiscal }}</q-td>
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
                    { name: 'subTotal', align: 'right', label: 'SubTotal', field: 'subTotal', sortable: true },
                    { name: 'descuento', align: 'right', label: 'Descuento', field: 'descuento', sortable: true },
                    { name: 'total', align: 'right', label: 'Total', field: 'total', sortable: true },
                    { name: 'totalIngreso', align: 'right', label: 'Total Ingreso', field: 'totalIngreso', sortable: true },
                    { name: 'totalNc', align: 'right', label: 'Total NC', field: 'totalNc', sortable: true },
                    { name: 'formaPago', align: 'left', label: 'Forma de Pago', field: 'formaPago', sortable: true },
                    { name: 'moneda', align: 'left', label: 'Moneda', field: 'moneda', sortable: true },
                    { name: 'tipoCambio', align: 'right', label: 'Tipo de cambio', field: 'tipoCambio', sortable: true },
                    { name: 'folioFiscal', align: 'left', label: 'Folio Fiscal', field: 'folioFiscal', sortable: true },
                ],

                columnsDet:[
                    { name: 'actions', align: 'left', label: 'Acciones', field: 'actions' },
                    { name: 'serie', align: 'left', label: 'Serie', field: 'serie', sortable: true },
                    { name: 'folio', align: 'left', label: 'Folio', field: 'folio', sortable: true },
                    { name: 'fecha', align: 'left', label: 'Fecha', field: 'fecha', sortable: true },
                    { name: 'rfc', align: 'left', label: 'RFC', field: 'rfc', sortable: true },
                    { name: 'nombre', align: 'left', label: 'Nombre', field: 'nombre', sortable: true },
                    { name: 'subTotal', align: 'right', label: 'SubTotal', field: 'subTotal', sortable: true },
                    { name: 'descuento', align: 'right', label: 'Descuento', field: 'descuento', sortable: true },
                    { name: 'total', align: 'right', label: 'Total', field: 'total', sortable: true },
                    { name: 'formaPago', align: 'left', label: 'Forma de Pago', field: 'formaPago', sortable: true },
                    { name: 'moneda', align: 'left', label: 'Moneda', field: 'moneda', sortable: true },
                    { name: 'tipoCambio', align: 'right', label: 'Tipo de cambio', field: 'tipoCambio', sortable: true },
                    { name: 'folioFiscal', align: 'left', label: 'Folio Fiscal', field: 'folioFiscal', sortable: true },
                ],

                dataComprobantes: [],
                filter: '',
                //FECHAS
                fechaI: new Date(),
                fechaF: new Date(),

                dialogDetalles: false,
                textDetalles: "",
                itemsDetalles: [],
                filterDos: "",
                itemsSeleccion: [],

                //PDF
                dialogPdf: false,
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
            }

        },
        created() {

        },
        methods: {
            async GetReporte() {
                this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'red-8', spinnerSize: 140, message: 'Consultando...' })
                let fI = moment(this.fechaI).format('YYYY-MM-DD')
                let fF = moment(this.fechaF).format('YYYY-MM-DD')
                try {
                    let response = await axios.get(this.rutaAxios + 'Gastos/GetReporteAnticiposAsync/erp_' + this.token.rfc + '/' + fI + '/' + fF);
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

            // ExportExcel() {
            //     let fI = moment(this.fechaI).format('DD-MMMM-YYYY')
            //     let fF = moment(this.fechaF).format('DD-MMMM-YYYY')
            //     const workbook = XLSX.utils.book_new();
            //     const sheetOtros = XLSX.utils.json_to_sheet(this.dataComprobantes);
            //     XLSX.utils.book_append_sheet(workbook, sheetOtros, 'CONCEPTOS');
            //     XLSX.writeFile(workbook, 'CONCEPTOS DE ANTICIOS DEL ' + fI + ' AL ' + fF + '.xlsx');
            // },

            ExportExcel() {
            let reporte = 'REPORTE DE ANTICIPOS RECIBIDOS'
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

            xlsx.utils.book_append_sheet(workbook, sheet, "ANTICIPOS");

            xlsx.writeFile(
                workbook,
                rfc + ' - ' + empresa +  ' - REPORTE DE ANTICIPOS RECIBIDOS DEL ' + periodo.toUpperCase() + '.xlsx'
            );
            },

            UltimoDiaMes() {
                const fecha = new Date(this.fechaI);
                const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
                this.fechaF = ultimoDia;
            },

            VerIngreso(item){
                this.itemsDetalles = [];
                this.itemsDetalles = [...item.ingreso];
                this.dialogDetalles = true;
                this.textDetalles = "INGRESOS";
                this.itemsSeleccion = []
            },

            VerNc(item){
                this.itemsDetalles = [];
                this.itemsDetalles = [...item.egreso];
                this.dialogDetalles = true;
                this.itemsSeleccion = []
                this.textDetalles = "NOTAS DE CRÉDITO";
            },
            
            VerPdf(item){
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
        },
    }
</script>