<template>
    <div class="q-pa-md">
        <!-- DIALOG PARA VER LOS PDF -->
        <q-dialog v-model="dialogPdf" persistent transition-show="scale" transition-hide="scale" maximized>
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

        <q-page class="bg-white">
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
                        <div class="text-h5">{{ item.cabecera }}</div>
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
                </q-card-section>
            </q-card>

            <q-list bordered class="rounded-borders bg-white q-pa-sm q-m-md">
                <q-expansion-item expand-separator default-opened header-class="bg-red-9 text-white"
                    expand-icon-class="text-white">
                    <!-- TABLA IVA RETENIDO -->
                    <q-table selection="multiple" title="IVA Retenido" :filter="filter"
                        class="my-sticky-column-table" :data="item.detalles" :columns="columns" row-key="folioFiscal"
                        :rows-per-page-options="[10]">
                        <template v-slot:top-right>
                            <q-input filled dense debounce="300" v-model="filter" placeholder="Filtrar">
                                <template v-slot:append>
                                    <q-icon name="search" />
                                </template>
                            </q-input>
                        </template>
                        <template v-slot:body="props">
                            <q-tr :props="props">
                                <q-td auto-width>
                                    <!-- <q-checkbox v-model="props.selected" /> -->
                                    <q-btn size="md" color="primary" rounded flat dense @click="VerComprobante(props.row)"
                                        icon="mdi-file-pdf-box">
                                        <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                                            :offset="[10, 10]">Detalles</q-tooltip>
                                    </q-btn>
                                </q-td>
                                <q-td key="serie" :props="props">{{ props.row.serie }}</q-td>
                                <q-td key="folio" :props="props">{{ props.row.folio }}</q-td>
                                <q-td key="fecha" :props="props">{{ formatDate(props.row.fecha) }}</q-td>
                                <q-td key="fechaPago" :props="props">{{ formatDate(props.row.fechaPago) }}</q-td>
                                <q-td key="rfc" :props="props">{{ props.row.rfc }}</q-td>
                                <q-td key="nombre" :props="props">{{ props.row.nombre }}</q-td>
                                <q-td key="metodoPago" :props="props">{{ props.row.metodoPago }}</q-td>
                                <q-td key="formaPago" :props="props">{{ props.row.formaPago }}</q-td>
                                <q-td key="base_" :props="props">{{ formatCurrency(props.row.base_) }}</q-td>
                                <q-td key="impuesto" :props="props">{{ props.row.impuesto }}</q-td>
                                <q-td key="tipoFactor" :props="props">{{ props.row.tipoFactor }}</q-td>
                                <q-td key="tasaOCuota" :props="props">{{ formatNumber(props.row.tasaOCuota) }}</q-td>
                                <q-td key="importe" :props="props">{{ formatCurrency(props.row.importe) }}</q-td>
                                <q-td key="total" :props="props">{{ formatCurrency(props.row.total) }}</q-td>
                                <q-td key="impPagado" :props="props">{{ formatCurrency(props.row.impPagado) }}</q-td>
                                <q-td key="moneda" :props="props">{{ props.row.moneda }}</q-td>
                                <q-td key="tipoCambio" :props="props">{{ formatCurrency(props.row.tipoCambio) }}</q-td>
                                <q-td key="monedaP" :props="props">{{ props.row.monedaP }}</q-td>
                                <q-td key="tipoCambioP" :props="props">{{ formatCurrency(props.row.tipoCambioP) }}</q-td>
                                <q-td key="monedaDr" :props="props">{{ props.row.monedaDr }}</q-td>
                                <q-td key="equivalenciaDr" :props="props">{{ formatCurrency(props.row.equivalenciaDr) }}</q-td>
                                <q-td key="tipoComprobante" :props="props">{{ props.row.tipoComprobante }}</q-td>
                                <q-td key="folioFiscal" :props="props">{{ props.row.folioFiscal }}</q-td>
                                <q-td key="folioFiscalPago" :props="props">{{ props.row.folioFiscalPago }}</q-td>
                                <q-td key="porcentaje" :props="props">{{ formatNumber(props.row.porcentaje) }} %</q-td>
                            </q-tr>
                        </template>
                    </q-table>
                </q-expansion-item>
                <br />
                <q-separator />
            </q-list>
        </q-page>
    </div>
</template>
<script>
    import axios from "axios";
    import moment from "moment";
    import visorPdf from "../Pdf/VisorPdf.vue";
    import { ComprobanteBase64 } from "../Pdf/ComprobanteBase64.js";
    import { generarCodigoQR } from "../Pdf/qrcodeGenerator";
    import * as xlsx from "xlsx";
    import lista69 from "../Lista69B/Lista69B.vue";

    export default {
        components: {
            visorPdf,
            lista69,
        },
        data() {
            return {
                columns: [
                    { name: "serie", align: "left", label: "Serie", field: "serie", sortable: true, },
                    { name: "folio", align: "left", label: "Folio", field: "folio", sortable: true, },
                    { name: "fecha", align: "left", label: "Fecha", field: "fecha", sortable: true, },
                    { name: "fechaPago", align: "left", label: "Fecha de Pago", field: "fechaPago", sortable: true, },
                    { name: "rfc", align: "left", label: "RFC", field: "rfc", sortable: true, },
                    { name: "nombre", align: "left", label: "Nombre", field: "nombre", sortable: true, },
                    { name: "metodoPago", align: "left", label: "Métdodo de Pago", field: "metodoPago", sortable: true, },
                    {
                        name: "formaPago",
                        align: "left",
                        label: "Forma de Pago",
                        field: "formaPago",
                        sortable: true,
                    },
                    {
                        name: "base_",
                        align: "right",
                        label: "Base",
                        field: "base_",
                        sortable: true,
                    },
                    {
                        name: "impuesto",
                        align: "left",
                        label: "Impuesto",
                        field: "impuesto",
                        sortable: true,
                    },
                    {
                        name: "tipoFactor",
                        align: "left",
                        label: "Tipo Factor",
                        field: "tipoFactor",
                        sortable: true,
                    },
                    {
                        name: "tasaOCuota",
                        align: "right",
                        label: "Tasa O Cuota",
                        field: "tasaOCuota",
                        sortable: true,
                    },
                    {
                        name: "importe",
                        align: "right",
                        label: "Importe",
                        field: "importe",
                        sortable: true,
                    },
                    {
                        name: "total",
                        align: "right",
                        label: "Total",
                        field: "total",
                        sortable: true,
                    },
                    {
                        name: "impPagado",
                        align: "right",
                        label: "Importe Pagado",
                        field: "impPagado",
                        sortable: true,
                    },
                    {
                        name: "moneda",
                        align: "left",
                        label: "Moneda",
                        field: "moneda",
                        sortable: true,
                    },
                    {
                        name: "tipoCambio",
                        align: "right",
                        label: "Tipo de Cambio",
                        field: "tipoCambio",
                        sortable: true,
                    },
                    {
                        name: "monedaP",
                        align: "left",
                        label: "Moneda P",
                        field: "monedaP",
                        sortable: true,
                    },
                    {
                        name: "tipoCambioP",
                        align: "right",
                        label: "Tipo de Cambio P",
                        field: "tipoCambioP",
                        sortable: true,
                    },
                    {
                        name: "monedaDr",
                        align: "left",
                        label: "Moneda DR",
                        field: "monedaDr",
                        sortable: true,
                    },
                    {
                        name: "equivalenciaDr",
                        align: "right",
                        label: "Tipo Equivalencia DR Cambio Pago",
                        field: "equivalenciaDr",
                        sortable: true,
                    },
                    {
                        name: "tipoComprobante",
                        align: "left",
                        label: "Tipo de Comprobante",
                        field: "tipoComprobante",
                        sortable: true,
                    },
                    { name: "folioFiscal", align: "left", label: "Folio Fiscal", field: "folioFiscal", sortable: true, },
                    { name: "folioFiscalPago", align: "left", label: "Folio Fiscal Pago", field: "folioFiscalPago", sortable: true, },
                    { name: "porcentaje", align: "right", label: "Porcentaje", field: "porcentaje", sortable: true, },
                ],

                //DETALLES
                filter: "",
                dialogLista69B: false,
                dialogPdf: false,
            };
        },
        computed: {
            token() {
                return this.$store.state.usuario;
            },

            item(){
                return this.$store.state.detallesIvaRet;
            },

            rutaAxios() {
                return this.$store.state.rutaMongoStore;
            },

        },
        created() { },
        methods: {
            formatCurrency(value) {
                try {
                    return value.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                    });

                } catch (error) {
                    return "";
                }
            },

            formatNumber(value) {
                return value.toLocaleString("en-US");
            },

            formatDate(value) {
                let fecha_ = value.replace("T", " ");
                let fecha_1 = fecha_.replace("Z", " ");
                let listo = new Date(fecha_1);
                moment.locale("es-mx");
                return moment(listo).format("DD-MMMM-YYYY HH:mm:ss");
            },

            CloseDialog() {
                this.$emit("CloseDialogDetalles");
            },

            // ExportExcel() {
            //     const workbook = XLSX.utils.book_new();
            //     const sheetItem16 = XLSX.utils.json_to_sheet(this.item.detalles);
            //     XLSX.utils.book_append_sheet(workbook, sheetItem16, "Retenciones de IVA");
            //     const mes = this.item.mes;
            //     const año = this.item.año;
            //     XLSX.writeFile(workbook,`${this.token.rfc}_${mes}_${año}_IVA RETENIDO.xlsx`);

            // },

            ExportExcel() {
            let reporte = 'REPORTE DETALLADO DE RETENCIONES DE IVA'
            let empresa = this.$store.state.empresaStore.nombre
            let rfc = this.$store.state.empresaStore.rfc
            const mes = this.item.mes;
            const año = this.item.año;
            let periodo = mes + ' ' + año

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

            const dataExcel =this.item.detalles.map(row => {
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

            xlsx.utils.book_append_sheet(workbook, sheet, "RETENCIONES");

            xlsx.writeFile(
                workbook,
                rfc + ' - ' + empresa +  ' - REPORTE DETALLADO DE RETENCIONES DE IVA DE ' + periodo.toUpperCase() + '.xlsx'
            );
            },

            async VerComprobante(item) {
                await this.VerComprobanteGastos(item);
            },

            async VerComprobanteGastos(item) {
                try {
                    this.$store.state.vistaPreviaStore.folioFiscal = item.folioFiscal;
                    this.$store.state.vistaPreviaStore.color = "19775C";
                    this.$store.state.vistaPreviaStore.tipoComprobanteInterno = "FACTURA";
                    this.$store.state.vistaPreviaStore.tipo = "R";
                    this.$store.state.vistaPreviaStore.rfc = this.token.rfc;
                    this.dialogPdf = true;
                } catch (error) {
                    console.log(error);
                }
            },

            CloseDialogPdf() {
                this.dialogPdf = false;
            },

            abrirDialogLista69B() {
                this.dialogLista69B = true;
            },

            sumarPropiedad(lista, filtroFn, propiedad) {
                return lista
                    .filter(filtroFn)
                    .reduce((total, item) => total + (item[propiedad] || 0), 0);
            }

        },
    };
</script>
<style>
    .my-card {
        width: 100%;
    }
</style>