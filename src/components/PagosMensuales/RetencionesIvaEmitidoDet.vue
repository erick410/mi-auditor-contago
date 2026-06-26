<template>
    <div class="q-pa-md">
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

                        <q-btn push color="green-10" @click="ExportExcel" icon="mdi-file-excel-box-outline" rounded flat
                            size="18px" padding="xs">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Exportar Excel</q-tooltip>
                        </q-btn>
                    </div>
                </q-card-section>
            </q-card>
            <q-table title="IVA Retenido Emitido Constancias" :filter="filter" class="my-sticky-column-table" :data="item.detallesConstancia"
                :columns="columnsConstancias" row-key="folioFiscal" :rows-per-page-options="[10]">
                <template v-slot:top-right>
                    <q-input filled dense debounce="300" v-model="filter" placeholder="Filtrar">
                        <template v-slot:append>
                            <q-icon name="search" />
                        </template>
                    </q-input>
                </template>
                <template v-slot:body="props">
                    <q-tr :props="props"  key="acciones">
                        <q-td auto-width>
                            <q-td auto-width>
                                <q-btn size="md" color="primary" rounded flat dense icon="mdi-file-pdf-box"
                                    @click="descargarPdf(props.row)">
                                    <q-tooltip>Ver PDF</q-tooltip>
                                </q-btn>
                                <q-btn size="md" color="teal-6" rounded flat dense icon="mdi-xml"
                                    @click="descargarXml(props.row)">
                                    <q-tooltip>Descargar XML</q-tooltip>
                                </q-btn>
                            </q-td>
                        </q-td>
                        <q-td key="uuid" :props="props">{{ props.row.uuid }}</q-td>
                        <q-td key="folioInt" :props="props">{{ props.row.folioInt }}</q-td>
                        <q-td key="fechaTimbrado" :props="props">{{ formatDate(props.row.fechaTimbrado) }}</q-td>
                        <q-td key="rfcEmisor" :props="props">{{ props.row.rfcEmisor }}</q-td>
                        <q-td key="nomEmisor" :props="props">{{ props.row.nomEmisor }}</q-td>
                        <q-td key="rfcReceptor" :props="props">{{ props.row.rfcReceptor }}</q-td>
                        <q-td key="nomReceptor" :props="props">{{ props.row.nomReceptor }}</q-td>
                        <q-td key="tipoPago" :props="props">{{ props.row.tipoPago }}</q-td>
                        <q-td key="baseRet" :props="props">{{ formatCurrency(props.row.baseRet) }}</q-td>
                        <q-td key="importe" :props="props">{{  formatCurrency(props.row.importe) }}</q-td>
                    </q-tr>
                </template>
            </q-table>

            <q-table title="IVA Retenido Emitido Comprobates" :filter="filter" class="my-sticky-column-table" :data="item.detalles"
                :columns="columns" row-key="folioFiscal" :rows-per-page-options="[10]">
                <template v-slot:top-right>
                    <q-input filled dense debounce="300" v-model="filter" placeholder="Filtrar">
                        <template v-slot:append>
                            <q-icon name="search" />
                        </template>
                    </q-input>
                </template>
                <template v-slot:body="props">
                    <q-tr :props="props"  >
                        
                        <q-td key="serie" :props="props">{{ props.row.serie }}</q-td>
                        <q-td key="folio" :props="props">{{ props.row.folio }}</q-td>
                        <q-td key="fecha" :props="props">{{ formatDate(props.row.fecha) }}</q-td>
                        <q-td key="fechaPago" :props="props">{{ formatDate(props.row.fechaPago) }}</q-td>
                        <q-td key="rfc" :props="props">{{ props.row.rfc }}</q-td>
                        <q-td key="nombre" :props="props">{{ props.row.nombre }}</q-td>
                        <q-td key="metodoPago" :props="props">{{ props.row.metodoPago }}</q-td>
                        <q-td key="base_" :props="props">{{ formatCurrency(props.row.base_) }}</q-td>
                        <q-td key="impuesto" :props="props">{{ props.row.impuesto }}</q-td>
                        <q-td key="tipoFactor" :props="props">{{ props.row.tipoFactor }}</q-td>
                        <q-td key="tasaOCuota" :props="props">{{ props.row.tasaOCuota }}</q-td>
                        <q-td key="importe" :props="props">{{  formatCurrency(props.row.importe) }}</q-td>
                        <q-td key="impPagado" :props="props">{{  formatCurrency(props.row.impPagado) }}</q-td>
                        <q-td key="moneda" :props="props">{{ props.row.moneda }}</q-td>
                        <q-td key="tipoCambio" :props="props">{{ props.row.tipoCambio }}</q-td>
                        <q-td key="formaPago" :props="props">{{ props.row.formaPago }}</q-td>
                        <q-td key="tipoComprobante" :props="props">{{ props.row.tipoComprobante }}</q-td>
                        <q-td key="folioFiscal" :props="props">{{ props.row.folioFiscal }}</q-td>
                        <q-td key="folioFiscalPago" :props="props">{{ props.row.folioFiscalPago }}</q-td>
                        <q-td key="porcentaje" :props="props">{{ props.row.porcentaje }}</q-td>
                    </q-tr>
                </template>
            </q-table>
        </q-page>
    </div>
</template>
<script>
import axios from "axios";
import moment from "moment";
import * as xlsx from "xlsx";
import { generarPdfRetencion } from '../Pdf/generarPdfRetencion'

export default {
    components: {
    },
    data() {
        return {
            columns: [
    { name: 'serie', label: 'Serie', field: 'serie', align: 'left', sortable: true },
    { name: 'folio', label: 'Folio', field: 'folio', align: 'left', sortable: true },
    { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left', sortable: true, format: val => val ? val.substring(0, 10) : '' },
    { name: 'fechaPago', label: 'Fecha Pago', field: 'fechaPago', align: 'left', sortable: true, format: val => val ? val.substring(0, 10) : '' },
    { name: 'rfc', label: 'RFC', field: 'rfc', align: 'left', sortable: true },
    { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
    { name: 'metodoPago', label: 'Método Pago', field: 'metodoPago', align: 'left', sortable: true },
    { name: 'base_', label: 'Base', field: 'base_', align: 'right', sortable: true, format: val => `$${val?.toFixed(2)}` },
    { name: 'impuesto', label: 'Impuesto', field: 'impuesto', align: 'left', sortable: true },
    { name: 'tipoFactor', label: 'Tipo Factor', field: 'tipoFactor', align: 'left', sortable: true },
    { name: 'tasaOCuota', label: 'Tasa/Cuota', field: 'tasaOCuota', align: 'right', sortable: true, format: val => `${(val * 100).toFixed(0)}%` },
    { name: 'importe', label: 'Importe', field: 'importe', align: 'right', sortable: true, format: val => `$${val?.toFixed(2)}` },
    { name: 'impPagado', label: 'Imp. Pagado', field: 'impPagado', align: 'right', sortable: true, format: val => `$${val?.toFixed(2)}` },
    { name: 'moneda', label: 'Moneda', field: 'moneda', align: 'left', sortable: true },
    { name: 'tipoCambio', label: 'Tipo Cambio', field: 'tipoCambio', align: 'right', sortable: true },
    { name: 'formaPago', label: 'Forma Pago', field: 'formaPago', align: 'left', sortable: true },
    { name: 'tipoComprobante', label: 'Tipo', field: 'tipoComprobante', align: 'center', sortable: true },
    { name: 'folioFiscal', label: 'Folio Fiscal', field: 'folioFiscal', align: 'left', sortable: true },
    { name: 'folioFiscalPago', label: 'Folio Fiscal Pago', field: 'folioFiscalPago', align: 'left', sortable: true },
    { name: 'porcentaje', label: 'Porcentaje', field: 'porcentaje', align: 'right', sortable: true, format: val => `${val?.toFixed(2)}%` },
],

            columnsConstancias: [
                { name: "acciones", align: "left", label: "Acciones", field: "acciones", sortable: true, },

                { name: "uuid", align: "left", label: "Folio Fiscal", field: "uuid", sortable: true, },
                { name: "folioInt", align: "left", label: "Folio", field: "folioInt", sortable: true, },
                { name: "fechaTimbrado", align: "left", label: "Fecha", field: "fechaTimbrado", sortable: true, },
                { name: "rfcEmisor", align: "left", label: "RFC Emisor", field: "rfcEmisor", sortable: true, },
                { name: "nomEmisor", align: "left", label: "Nombre Emisor", field: "nomEmisor", sortable: true, },
                { name: "rfcReceptor", align: "left", label: "RFC Receptor", field: "rfcReceptor", sortable: true, },
                { name: "nomReceptor", align: "left", label: "Nombre Receptor", field: "nomReceptor", sortable: true, },
                {
                    name: "tipoPago",
                    align: "left",
                    label: "Tipo de Pago",
                    field: "tipoPago",
                    sortable: true,
                },
                {
                    name: "baseRet",
                    align: "right",
                    label: "Base",
                    field: "baseRet",
                    sortable: true,
                },
                {
                    name: "importe",
                    align: "left",
                    label: "Importe",
                    field: "importe",
                    sortable: true,
                },
            ],

            //DETALLES
            filter: "",
        };
    },
    computed: {
        token() {
            return this.$store.state.usuario;
        },

        item() {
            return this.$store.state.detallesIvaRet;
        },

        rutaAxios() {
            return this.$store.state.rutaDescargas;
        },

    },
    created() { },
    methods: {
        async descargarPdf(row) {
            try {
                // Buscar el documento completo en la BD por UUID
                const res = await axios.get(
                    this.rutaAxios + 'Retenciones/GetRetencionesDocumentos/erp_' + this.token.rfc
                    + '/' + this.token.rfc + '?uuid=' + row.uuid)

                if (res.data && res.data.length > 0) {
                    await generarPdfRetencion(res.data[0], require('@/assets/logo_contago_sin_fondo.png'))
                }
            } catch (e) {
                this.$q.notify({ type: 'negative', message: 'Error al generar PDF.' })
            }
        },

        async descargarXml(row) {
            try {
                const res = await axios.get(
                    this.rutaAxios + 'Retenciones/GetXmlRetencion/erp_' + this.token.rfc
                    + '/' + this.token.rfc + '/' + row.uuid,
                    { responseType: 'blob' }
                )
                const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/xml' }))
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', row.uuid + '.xml')
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                window.URL.revokeObjectURL(url)
            } catch (e) {
                this.$q.notify({ type: 'negative', message: 'No se encontró el XML.' })
            }
        },

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
        ExportExcel() {
            let reporte = 'REPORTE DETALLADO DE RETENCIONES DE IVA EMITIDO'
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
                ["PERIODO:", periodo.toUpperCase()],
                // ["FECHA REPORTE:", new Date()],
                [],
            ];

            const columnasExcel = this.columns.filter(
                col => col.name !== "actions"
            );

            const dataExcel = this.item.detalles.map(row => {
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

            xlsx.utils.book_append_sheet(workbook, sheet, "RETENCIONES");

            xlsx.writeFile(
                workbook,
                rfc + ' - ' + empresa + ' - REPORTE DETALLADO DE RETENCIONES DE IVA EMITIDO DE ' + periodo.toUpperCase() + '.xlsx'
            );
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