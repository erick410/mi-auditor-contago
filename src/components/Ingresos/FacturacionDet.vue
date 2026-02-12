<template>
    <div class="q-pa-md">
        <!-- DIALOG PARA VER LOS PDF -->
        <q-dialog v-model="dialogDetalles" persistent transition-show="scale" transition-hide="scale" maximized>
            <visor-pdf @CloseDialogPdf="CloseDialogPdf"></visor-pdf>
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

        <q-card flat class="my-card">
            <q-card-section>
                <!-- SELECCIONA AÑO Y MES, BOTON DE BUSCAR Y EXPORTAR A EXCEL -->
                <div class="row no-wrap items-center q-mt-md q-pa-sm">
                    <q-btn push color="red-14" @click="CloseDialog" icon="mdi-close" rounded flat size="18px"
                        padding="xs">
                        <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                            content-style="font-size: 14px" :offset="[10, 10]">Cerrar</q-tooltip>
                    </q-btn>
                    <q-space />
                    <div class="text-h5">{{ items.cabecera }}</div>

                    <!-- <span>{{ items.tipo }}</span> -->
                    <q-space />

                    <q-btn push color="red-10" @click="abrirDialogLista69B" icon="mdi-account-search" rounded flat
                        size="18px" padding="xs">
                        <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                            content-style="font-size: 14px" :offset="[10, 10]">Lista 69B</q-tooltip>
                    </q-btn>

                    <q-btn push color="green-10" @click="ExportExcel" icon="mdi-file-excel-box-outline" rounded flat
                        size="18px" padding="xs">
                        <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                            content-style="font-size: 14px" :offset="[10, 10]">Exportar Excel</q-tooltip>
                    </q-btn>
                </div>
                <div class="row no-wrap justify-center">
                    <q-chip color="primary" text-color="white">
                        {{ 'Suma Parcial: ' + formatCurrency(sumaSeleccionado) }}
                    </q-chip>
                </div>
            </q-card-section>
        </q-card>

        <!-- TABLA DE COMPROBANTES -->
        <q-table :filter="filter" :data="items.detalles" :columns="columns" row-key="folioFiscal"
            :rows-per-page-options="[10]" class="my-sticky-column-table" selection="multiple"
            :selected.sync="itemsSeleccion" row-clickable>
            <template v-slot:header-selection="scope">
                <q-checkbox v-model="scope.selected" />
            </template>
            <template v-slot:top-right>
                <q-input filled dense debounce="300" v-model="filter" placeholder="Filtrar">
                    <template v-slot:append>
                        <q-icon name="search" />
                    </template>
                </q-input>
            </template>
            <template v-slot:body="props" v-slot:body-selection="scope">
                <q-tr :props="props">
                    <q-td>
                        <q-checkbox v-model="props.selected" />
                        <q-btn size="md" color="red-14" rounded flat dense @click="VerComprobante(props.row)"
                            icon="mdi-file-pdf-box">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Ver Comprobante</q-tooltip>
                        </q-btn>
                    </q-td>
                    <q-td key="serie" :props="props">{{ props.row.serie }}</q-td>
                    <q-td key="folio" :props="props">{{ props.row.folio }}</q-td>
                    <q-td key="fecha" :props="props">{{ formatDate(props.row.fecha) }}</q-td>
                    <q-td key="rfc" :props="props">{{ props.row.rfc }}</q-td>
                    <q-td key="nombre" :props="props">{{ props.row.nombre }}</q-td>
                    <q-td key="metodoPago" :props="props">{{ props.row.metodoPago }}</q-td>
                    <q-td key="formaPago" :props="props">{{ props.row.formaPago }}</q-td>
                    <q-td key="subTotal" :props="props">{{ formatCurrency(props.row.subTotal) }}</q-td>
                    <q-td key="descuento" :props="props">{{ formatCurrency(props.row.descuento) }}</q-td>
                    <q-td key="total" :props="props">{{ formatCurrency(props.row.total) }}</q-td>
                    <q-td key="moneda" :props="props">{{ props.row.moneda }}</q-td>
                    <q-td key="tipoCambio" :props="props">{{ formatCurrency(props.row.tipoCambio) }}</q-td>
                    <q-td key="tipoComprobante" :props="props">{{ props.row.tipoComprobante }}</q-td>
                    <q-td key="folioFiscal" :props="props">{{ props.row.folioFiscal }}</q-td>
                </q-tr>
            </template>
            <template v-slot:bottom-row>
                <q-tr>
                    <q-td colspan="100%" class="text-center">
                        <q-chip color="primary" text-color="white">
                            {{ 'Ingresos: ' + formatCurrency(sumaIngresos) }}
                        </q-chip>
                        <q-chip color="primary" text-color="white">
                            {{ 'Notas de crédito: ' + formatCurrency(sumaNc) }}
                        </q-chip>
                        <q-chip color="primary" text-color="white">
                            {{ 'Total: ' + formatCurrency(sumaTotal) }}
                        </q-chip>
                    </q-td>
                </q-tr>
            </template>
        </q-table>
    </div>
</template>
<script>
    import axios from 'axios'
    import moment from 'moment'
    import visorPdf from '../Pdf/VisorPdf.vue'
    import { ComprobanteBase64 } from '../Pdf/ComprobanteBase64.js'
    import { generarCodigoQR } from '../Pdf/qrcodeGenerator';
    import * as xlsx from 'xlsx';
    import lista69 from '../Lista69B/Lista69B.vue'
    export default {
        components: {
            visorPdf, lista69
        },
        data() {
            return {
                filter: '',
                columns: [
                    // { name: 'actions', align: 'left', label: 'Acciones', field: 'actions', sortable: true },
                    { name: 'serie', align: 'left', label: 'Serie', field: 'serie', sortable: true },
                    { name: 'folio', align: 'left', label: 'Folio', field: 'folio', sortable: true },
                    { name: 'fecha', align: 'left', label: 'Fecha', field: 'fecha', sortable: true },
                    { name: 'rfc', align: 'left', label: 'RFC', field: 'rfc', sortable: true },
                    { name: 'nombre', align: 'left', label: 'Nombre', field: 'nombre', sortable: true },
                    { name: 'metodoPago', align: 'left', label: 'Métdodo de Pago', field: 'metodoPago', sortable: true },
                    { name: 'formaPago', align: 'left', label: 'Forma de Pago', field: 'formaPago', sortable: true },
                    { name: 'subTotal', align: 'right', label: 'Subtotal', field: 'subTotal', sortable: true },
                    { name: 'descuento', align: 'right', label: 'Descuento', field: 'descuento', sortable: true },
                    { name: 'total', align: 'right', label: 'Total', field: 'total', sortable: true },
                    { name: 'moneda', align: 'left', label: 'Moneda', field: 'moneda', sortable: true },
                    { name: 'tipoCambio', align: 'right', label: 'Tipo de Cambio', field: 'tipoCambio', sortable: true },
                    { name: 'tipoComprobante', align: 'center', label: 'Tipo de Comprobante', field: 'tipoComprobante', sortable: true },
                    { name: 'folioFiscal', align: 'left', label: 'Folio Fiscal', field: 'folioFiscal', sortable: true },
                ],

                dialogDetalles: false,
                itemsSeleccion: [],
                dialogLista69B: false

            }
        },
        computed: {
            token() {
                return this.$store.state.usuario;
            },

            items() {
                return this.$store.state.detallesFacturacionStore;
            },

            rutaAxios() {
                return this.$store.state.rutaMongoStore
            },
            sumaTotal() {
                return this.items.detalles.reduce((acumulador, objeto) => acumulador + objeto.total, 0);
            },
            sumaDescuento() {
                return this.items.detalles.reduce((acumulador, objeto) => acumulador + objeto.descuento, 0);
            },
            sumaSubtotal() {
                return this.items.detalles.reduce((acumulador, objeto) => acumulador + objeto.subTotal, 0);
            },
            sumaIngresos() {
                let filtrado = this.items.detalles.filter(f => f.tipoComprobante === "I")
                return filtrado.reduce((acumulador, objeto) => acumulador + objeto.total, 0);
            },
            sumaNc() {
                let filtrado = this.items.detalles.filter(f => f.tipoComprobante === "E")
                return filtrado.reduce((acumulador, objeto) => acumulador + objeto.total, 0);
            },
            sumaSeleccionado() {
                return this.itemsSeleccion.reduce((acumulador, objeto) => acumulador + objeto.total, 0);
            }

        },
        created() {

        },
        methods: {
            formatCurrency(value) {
                return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
            },

            formatNumber(value) {
                return value.toLocaleString('en-US');
            },

            formatDate(value) {
                let fecha_ = value.replace('T', ' ')
                let fecha_1 = fecha_.replace('Z', ' ')
                let listo = new Date(fecha_1);
                moment.locale('es-mx');
                return moment(listo).format('DD-MMMM-YYYY HH:mm:ss')
            },

            CloseDialog() {
                this.$emit('CloseDialogDetalles')
            },

            // ExportExcel() {
            //     console.log(this.items)
            //     const workbook = XLSX.utils.book_new();
            //     const sheet = XLSX.utils.json_to_sheet(this.items.detalles);
            //     XLSX.utils.book_append_sheet(workbook, sheet, 'Hoja1');
            //     XLSX.writeFile(workbook, this.items.cabecera + '.xlsx');
            // },

            ExportExcel() {
            let reporte = 'REPORTE DETALLADO DE INGRESOS'
            let empresa = this.$store.state.empresaStore.nombre
            let rfc = this.$store.state.empresaStore.rfc
             
            let periodo = this.items.cabecera

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

            const dataExcel = this.items.detalles.map(row => {
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
                rfc + ' - ' + empresa +  ' - REPORTE DE ' + periodo.toUpperCase() + '.xlsx'
            );
            },
            async VerComprobante(item) {
                try {
                    this.$store.state.vistaPreviaStore.folioFiscal = item.folioFiscal;
                    this.$store.state.vistaPreviaStore.color = "19775C"
                    this.$store.state.vistaPreviaStore.tipoComprobanteInterno = "FACTURA"
                    this.$store.state.vistaPreviaStore.tipo = "E"
                    this.$store.state.vistaPreviaStore.rfc = this.token.rfc
                    this.dialogDetalles = true;
                } catch (error) {
                    console.log(error)
                }
            },

            CloseDialogPdf() {
                this.dialogDetalles = false;
            },

            abrirDialogLista69B() {
                this.dialogLista69B = true
            }
        },
    }
</script>