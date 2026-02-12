<template>
    <div style="width: 100%;">

        <!-- DIALOG PARA VER LOS PDF -->
        <q-dialog v-model="dialogPdf" transition-show="scale" transition-hide="scale" maximized>
            <visor-pdf-gen @CloseDialogPdfG="CloseDialogPdfG"></visor-pdf-gen>
        </q-dialog>

        <div class="titulo-reporte-riesgo">
            REPORTE RIESGO CONCEPTOS CON CLAVE 01010101 - RECIBIDOS
        </div>
        <div v-for="(registros, mes) in items.contenido" :key="mes" class="q-mb-md">
            <q-table :data="registros" :columns="columns" row-key="folio" flat bordered class="shadow-0 border-0" dense
                :title="mes">
                <template v-slot:body="props">
                    <q-tr :props="props">
                        <q-td key="folio" :props="props">{{ props.row.folio }}</q-td>
                        <q-td key="folioFiscal" :props="props" @click="VerFolioFiscal(props.row)">{{
                            props.row.folioFiscal }}</q-td>
                        <q-td key="rfc" :props="props">{{ props.row.rfc }}</q-td>
                        <q-td key="nombre" :props="props">{{ props.row.nombre }}</q-td>
                        <q-td key="descripcion" :props="props">{{ props.row.descripcion }}</q-td>
                        <q-td key="metodoPago" :props="props">{{ props.row.metodoPago }}</q-td>
                        <q-td key="formaPago" :props="props">{{ props.row.formaPago }}</q-td>
                        <q-td key="tipoComprobante" :props="props">{{ props.row.tipoComprobante }}</q-td>
                        <q-td key="subTotal" :props="props">{{ formatCurrency(props.row.subTotal) }}</q-td>
                    </q-tr>
                </template>
            </q-table>
            <q-table :data="[getTotales(registros)]" :columns="columnsTotales" dense flat bordered row-key="folioFiscal"
                class="shadow-0 border-0 q-mt-sm" hide-header hide-bottom>
                <template v-slot:body="props">
                    <q-tr :props="props">
                        <q-td key="folio" :props="props"><strong>Total</strong></q-td>
                        <q-td key="folioFiscal" :props="props">{{ props.row.folioFiscal }}</q-td>
                        <q-td key="rfc" :props="props">{{ props.row.rfc }}</q-td>
                        <q-td key="nombre" :props="props">{{ props.row.nombre }}</q-td>
                        <q-td key="descripcion" :props="props">{{ props.row.descripcion }}</q-td>
                        <q-td key="metodoPago" :props="props">{{ props.row.metodoPago }}</q-td>
                        <q-td key="formaPago" :props="props">{{ props.row.formaPago }}</q-td>
                        <q-td key="tipoComprobante" :props="props">{{ props.row.tipoComprobante }}</q-td>
                        <q-td key="subTotal" :props="props">{{ formatCurrency(props.row.subTotal) }}</q-td>
                    </q-tr>
                </template>
            </q-table>
        </div>
    </div>
</template>
<script>
    import visorPdfGen from '../../Pdf/VisorPdfGen.vue'
    export default {
        components: {
            visorPdfGen
        },
        data() {
            return {
                columns: [
                    { name: 'folio', label: 'Folio', align: 'center', field: 'folio', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-riesgo text-white' },
                    { name: 'folioFiscal', label: 'Folio Fiscal', align: 'center', field: 'folioFiscal', sortable: true, classes: 'bg-grey-2 ellipsis hover-foliofiscal-rf', headerClasses: 'bgc-riesgo text-white', },
                    { name: 'rfc', label: 'RFC', align: 'center', field: 'rfc', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-riesgo text-white' },
                    { name: 'nombre', label: 'Nombre', align: 'left', field: 'importeRecibido', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-riesgo text-white' },
                    { name: 'descripcion', label: 'Descripción', align: 'left', field: 'descripcion', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-riesgo text-white' },
                    { name: 'metodoPago', label: 'Método de Pago', align: 'left', field: 'metodoPago', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-riesgo text-white' },
                    { name: 'formaPago', label: 'Forma de Pago', align: 'left', field: 'formaPago', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-riesgo text-white' },
                    { name: 'tipoComprobante', label: 'Tipo de Comprobante', align: 'right', field: 'tipoComprobante', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-riesgo text-white' },
                    { name: 'subTotal', label: 'SubTotal', align: 'right', field: 'subTotal', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-riesgo text-white' },
                ],
                columnsTotales: [
                    { name: 'folio', label: 'Folio', align: 'center', field: 'folio', sortable: true, classes: 'total-row-rf ellipsis', headerClasses: 'bgc-riesgo text-white' },
                    { name: 'folioFiscal', label: 'Folio Fiscal', align: 'center', field: 'folioFiscal', sortable: true, classes: 'total-row-rf ellipsis', headerClasses: 'bgc-riesgo text-white', },
                    { name: 'rfc', label: 'RFC', align: 'center', field: 'rfc', sortable: true, classes: 'total-row-rf ellipsis', headerClasses: 'bgc-riesgo text-white' },
                    { name: 'nombre', label: 'Nombre', align: 'left', field: 'nombre', sortable: true, classes: 'total-row-rf ellipsis', headerClasses: 'bgc-riesgo text-white' },
                    { name: 'descripcion', label: 'Descripción', align: 'left', field: 'descripcion', sortable: true, classes: 'total-row-rf ellipsis', headerClasses: 'bgc-riesgo text-white' },
                    { name: 'metodoPago', label: 'Método de Pago', align: 'left', field: 'metodoPago', sortable: true, classes: 'total-row-rf ellipsis', headerClasses: 'bgc-riesgo text-white' },
                    { name: 'formaPago', label: 'Forma de Pago', align: 'left', field: 'formaPago', sortable: true, classes: 'total-row-rf ellipsis', headerClasses: 'bgc-riesgo text-white' },
                    { name: 'tipoComprobante', label: 'Tipo de Comprobante', align: 'right', field: 'tipoComprobante', sortable: true, classes: 'total-row-rf ellipsis', headerClasses: 'bgc-riesgo text-white' },
                    { name: 'subTotal', label: 'SubTotal', align: 'right', field: 'subTotal', sortable: true, classes: 'total-row-rf ellipsis', headerClasses: 'bgc-riesgo text-white' },
                ],
                dialogPdf: false
            }
        },
        computed: {
            token() {
                return this.$store.state.usuario;
            },
            items() {
                return this.$store.state.dataViewReporte[27];
            },
        },
        methods: {
            formatCurrency(value) {
                return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
            },
            getTotales(registros) {
                return {
                    folio: 'Total',
                    folioFiscal: '-',
                    rfc: '-',
                    nombre: '-',
                    descripcion: '-',
                    metodoPago: '-',
                    formaPago: '-',
                    tipoComprobante: '-',
                    subTotal: registros.reduce((sum, r) => sum + (r.subTotal || 0), 0),
                };
            },
            VerFolioFiscal(item) {
                try {
                    if (item.tipoComprobante === "I") {
                        this.$store.state.vistaPreviaGenStore.tipoComprobanteInterno = "FACTURA"
                    }
                    if (item.tipoComprobante === "E") {
                        this.$store.state.vistaPreviaGenStore.tipoComprobanteInterno = "NOTA CREDITO"
                    }
                    if (item.tipoComprobante === "P") {
                        this.$store.state.vistaPreviaGenStore.tipoComprobanteInterno = "PAGO"
                    }
                    this.$store.state.vistaPreviaGenStore.folioFiscal = item.folioFiscal;
                    this.$store.state.vistaPreviaGenStore.color = "19775C"
                    this.$store.state.vistaPreviaGenStore.tipoComprobanteInterno = "FACTURA"
                    this.$store.state.vistaPreviaGenStore.tipo = "R"
                    this.$store.state.vistaPreviaGenStore.rfc = this.token.rfc
                    this.dialogPdf = true;
                } catch (error) {
                    console.log(error)
                }
            },
            CloseDialogPdfG() {
                this.dialogPdf = false;
            },
        },
    }
</script>
<style>
    .bgc-riesgo {
        background-color: #9C2E2E !important;
        text-align: center !important;
    }

    .total-row-rf {
        background-color: #E57878 !important;
        font-weight: bold;
    }

    .titulo-reporte-riesgo {
        background-color: #fff;
        color: #9C2E2E;
        font-size: 20px;
        font-weight: bold;
        padding: 10px 20px;
        text-align: center;
        border-bottom: 2px solid #9C2E2E;
        font-family: Arial, sans-serif;
    }

    .hover-foliofiscal-rf:hover {
        background-color: #E57878 !important;
        color: white;
        cursor: pointer;
    }
</style>