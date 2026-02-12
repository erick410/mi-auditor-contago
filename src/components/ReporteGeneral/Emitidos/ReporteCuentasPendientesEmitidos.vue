<template>
    <div style="width: 100%;">

        <!-- DIALOG PARA VER LOS PDF -->
        <q-dialog v-model="dialogPdf" transition-show="scale" transition-hide="scale" maximized>
            <visor-pdf-gen @CloseDialogPdfG="CloseDialogPdfG"></visor-pdf-gen>
        </q-dialog>

        <div class="titulo-reporte-emitidos">
            REPORTE CUENTAS POR COBRAR
        </div>
        <div v-if="items && items.contenido">
            <div v-for="(registros, mes) in items.contenido" :key="mes" class="q-mb-md">
                <q-table :data="registros" :columns="columns" row-key="folio" flat bordered class="shadow-0 border-0"
                    dense :title="mes">
                    <template v-slot:body="props">
                        <q-tr :props="props" class="hover-foliofiscal-e">
                            <q-td key="folio" :props="props" @click="VerFolioFiscal(props.row)">{{ props.row.folio
                                }}</q-td>
                            <q-td key="folioFiscal" :props="props" @click="VerFolioFiscal(props.row)">{{
                                props.row.folioFiscal }}</q-td>
                            <q-td key="fecha" :props="props" @click="VerFolioFiscal(props.row)">{{ props.row.fecha
                                }}</q-td>
                            <q-td key="fechaUltimoPago" :props="props" @click="VerFolioFiscal(props.row)">{{
                                props.row.fechaUltimoPago }}</q-td>
                            <q-td key="dias" :props="props" @click="VerFolioFiscal(props.row)">{{ props.row.dias
                                }}</q-td>
                            <q-td key="rfc" :props="props" @click="VerFolioFiscal(props.row)">{{ props.row.rfc }}</q-td>
                            <q-td key="nombre" :props="props" @click="VerFolioFiscal(props.row)">{{ props.row.nombre
                                }}</q-td>
                            <q-td key="moneda" :props="props" @click="VerFolioFiscal(props.row)">{{ props.row.moneda
                                }}</q-td>
                            <q-td key="total" :props="props" @click="VerFolioFiscal(props.row)">{{
                                formatCurrency(props.row.total) }}</q-td>
                            <q-td key="totalPagos" :props="props" @click="VerFolioFiscal(props.row)">{{
                                formatCurrency(props.row.totalPagos) }}</q-td>
                            <q-td key="totalNc" :props="props" @click="VerFolioFiscal(props.row)">{{
                                formatCurrency(props.row.totalNc) }}</q-td>
                            <q-td key="pendiente" :props="props" @click="VerFolioFiscal(props.row)">{{
                                formatCurrency(props.row.pendiente) }}</q-td>
                        </q-tr>
                    </template>
                </q-table>
                <q-table :data="[getTotales(registros)]" :columns="columnsTotales" dense flat bordered row-key="usoCfdi"
                    class="shadow-0 border-0 q-mt-sm" hide-header hide-bottom>
                    <template v-slot:body="props">
                        <q-tr :props="props">
                            <q-td key="folio" :props="props"><strong>Total</strong></q-td>
                            <q-td key="folioFiscal" :props="props">{{ props.row.folioFiscal }}</q-td>
                            <q-td key="fecha" :props="props">{{ props.row.fecha }}</q-td>
                            <q-td key="fechaUltimoPago" :props="props">{{ props.row.fechaUltimoPago }}</q-td>
                            <q-td key="dias" :props="props">{{ props.row.dias }}</q-td>
                            <q-td key="rfc" :props="props">{{ props.row.rfc }}</q-td>
                            <q-td key="nombre" :props="props">{{ props.row.nombre }}</q-td>
                            <q-td key="moneda" :props="props">{{ props.row.moneda }}</q-td>
                            <q-td key="total" :props="props">{{ formatCurrency(props.row.total) }}</q-td>
                            <q-td key="totalPagos" :props="props">{{ formatCurrency(props.row.totalPagos) }}</q-td>
                            <q-td key="totalNc" :props="props">{{ formatCurrency(props.row.totalNc) }}</q-td>
                            <q-td key="pendiente" :props="props">{{ formatCurrency(props.row.pendiente) }}</q-td>
                        </q-tr>
                    </template>
                </q-table>
            </div>
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
                    { name: 'folio', label: 'Folio', align: 'center', field: 'folio', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'folioFiscal', label: 'Folio Fiscal', align: 'center', field: 'folioFiscal', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'fecha', label: 'Fecha', align: 'center', field: 'fecha', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-emitidos text-white', },
                    { name: 'fechaUltimoPago', label: 'Fecha Ultimo Pago', align: 'center', field: 'fechaUltimoPago', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'dias', label: 'Dias', align: 'center', field: 'dias', sortable: true, classes: 'bg-grey-2 ellipsis ', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'rfc', label: 'RFC', align: 'center', field: 'rfc', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'nombre', label: 'Nombre', align: 'left', field: 'nombre', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'moneda', label: 'Moneda', align: 'center', field: 'moneda', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'total', label: 'Total', align: 'right', field: 'total', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'totalPagos', label: 'Total Pagos', align: 'right', field: 'totalPagos', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'totalNc', label: 'Total NC', align: 'right', field: 'totalNc', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'pendiente', label: 'Pendiente', align: 'right', field: 'pendiente', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-emitidos text-white' },
                ],

                columnsTotales: [
                    { name: 'folio', label: 'Folio', align: 'center', field: 'folio', sortable: true, classes: 'total-row-e ellipsis', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'folioFiscal', label: 'Folio Fiscal', align: 'center', field: 'folioFiscal', sortable: true, classes: 'total-row-e ellipsis', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'fecha', label: 'Fecha', align: 'center', field: 'fecha', sortable: true, classes: 'total-row-e ellipsis', headerClasses: 'bgc-emitidos text-white', },
                    { name: 'fechaUltimoPago', label: 'Fecha Ultimo Pago', align: 'center', field: 'fechaUltimoPago', sortable: true, classes: 'total-row-e ellipsis', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'dias', label: 'Dias', align: 'center', field: 'dias', sortable: true, classes: 'total-row-e ellipsis ', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'rfc', label: 'RFC', align: 'center', field: 'rfc', sortable: true, classes: 'total-row-e ellipsis', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'nombre', label: 'Nombre', align: 'left', field: 'nombre', sortable: true, classes: 'total-row-e ellipsis', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'moneda', label: 'Moneda', align: 'center', field: 'moneda', sortable: true, classes: 'total-row-e ellipsis', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'total', label: 'Total', align: 'right', field: 'total', sortable: true, classes: 'total-row-e ellipsis', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'totalPagos', label: 'Total Pagos', align: 'right', field: 'totalPagos', sortable: true, classes: 'total-row-e ellipsis', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'totalNc', label: 'Total NC', align: 'right', field: 'totalNc', sortable: true, classes: 'total-row-e ellipsis', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'pendiente', label: 'Pendiente', align: 'right', field: 'pendiente', sortable: true, classes: 'total-row-e ellipsis', headerClasses: 'bgc-emitidos text-white' },
                ],
                dialogPdf: false,

            }
        },
        computed: {
            token() {
                return this.$store.state.usuario;
            },
            items() {
                return this.$store.state.dataViewReporte[14];
            },
        },
        methods: {
            formatCurrency(value) {
                return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
            },
            getTotales(registros) {
                return {
                    folio: 'Total',
                    fecha: '-',
                    fechaUltimoPago: '-',
                    dias: '-',
                    rfc: '-',
                    nombre: '-',
                    moneda: '-',
                    total: registros.reduce((sum, r) => sum + (r.total || 0), 0),
                    totalPagos: registros.reduce((sum, r) => sum + (r.totalPagos || 0), 0),
                    totalNc: registros.reduce((sum, r) => sum + (r.totalNc || 0), 0),
                    pendiente: registros.reduce((sum, r) => sum + (r.pendiente || 0), 0)
                };
            },
            VerFolioFiscal(item) {
                try {
                    this.$store.state.vistaPreviaGenStore.tipoComprobanteInterno = "FACTURA"
                    this.$store.state.vistaPreviaGenStore.folioFiscal = item.folioFiscal;
                    this.$store.state.vistaPreviaGenStore.color = "19775C"
                    this.$store.state.vistaPreviaGenStore.tipo = "E"
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
    .bgc-emitidos {
        background-color: #42A147 !important;
        text-align: center !important;
    }

    .total-row-e {
        background-color: #99D69C !important;
        font-weight: bold;
    }

    .titulo-reporte-emitidos {
        background-color: #fff;
        color: #42A147;
        font-size: 20px;
        font-weight: bold;
        padding: 10px 20px;
        text-align: center;
        border-bottom: 2px solid #42A147;
        font-family: Arial, sans-serif;
    }

    .hover-foliofiscal-e:hover td {
        background-color: #99D69C !important;
        color: white;
        cursor: pointer;
    }
</style>