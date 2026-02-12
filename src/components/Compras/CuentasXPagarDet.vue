<template>
    <div class="q-pa-md">
        <!-- DIALOG PARA VER LOS PDF -->
        <q-dialog v-model="dialogDetalles" persistent transition-show="scale" transition-hide="scale" maximized>
            <visor-pdf @CloseDialogPdf="CloseDialogDetalles"></visor-pdf>
        </q-dialog>

        <!-- SELECCIONA AÑO Y MES, BOTON DE BUSCAR Y EXPORTAR A EXCEL -->
        <q-card flat class="my-card">
            <q-card-section>
                <div class="row no-wrap items-center q-mt-md q-pa-sm">
                    <q-btn push color="red-14" @click="CloseDialog" icon="mdi-close" rounded flat size="18px" padding="xs">
                        <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                            :offset="[10, 10]">Cerrar</q-tooltip>
                    </q-btn>
                    <q-space />
                    <div class="text-h5">{{ items.tipo }}</div>
                    <q-space />
                    <q-btn push color="green-10" @click="ExportExcel" icon="mdi-file-excel-box-outline" rounded flat
                        size="18px" padding="xs">
                        <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                            :offset="[10, 10]">Exportar Excel</q-tooltip>
                    </q-btn>
                </div>
            </q-card-section>
        </q-card>


        <!-- TABLA DE COMPLEMENTOS DE PAGO -->
        <q-table :data="items.detalles" :columns="columns" row-key="folioFiscal" :rows-per-page-options="[10]"
            title="Complementos de Pago" class="my-sticky-column-table">
            <template v-slot:body="props">
                <q-tr :props="props">

                    <q-td auto-width>
                        <q-btn size="md" color="primary" rounded flat dense @click="VerComprobante(props.row)"
                            icon="mdi-file-pdf-box">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Ver Gastos</q-tooltip>
                        </q-btn>

                        <q-btn size="md" color="blue-grey" rounded flat dense @click="VerComprobantePago(props.row)"
                            icon="mdi-file-pdf-box">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Ver Complemento de Pago</q-tooltip>
                        </q-btn>
                    </q-td>

                    <q-td key="serie" :props="props">{{ props.row.serie }}</q-td>
                    <q-td key="folio" :props="props">{{ props.row.folio }}</q-td>
                    <q-td key="rfc" :props="props">{{ props.row.rfc }}</q-td>
                    <q-td key="nombre" :props="props">{{ props.row.nombre }}</q-td>
                    <q-td key="fechaPago" :props="props">{{ formatDate(props.row.fechaPago) }}</q-td>
                    <q-td key="formaPago" :props="props">{{ props.row.formaPago }}</q-td>
                    <q-td key="monedaP" :props="props">{{ props.row.monedaP }}</q-td>
                    <q-td key="tipoCambioP" :props="props">{{ props.row.tipoCambioP }}</q-td>
                    <q-td key="idDocumento" :props="props">{{ props.row.idDocumento }}</q-td>
                    <q-td key="monedaDr" :props="props">{{ props.row.monedaDr }}</q-td>
                    <q-td key="equivalenciaDr" :props="props">{{ props.row.equivalenciaDr }}</q-td>
                    <q-td key="numParcialidad" :props="props">{{ props.row.numParcialidad }}</q-td>
                    <q-td key="impSaldoAnt" :props="props">{{ formatCurrency(props.row.impSaldoAnt) }}</q-td>
                    <q-td key="impPagado" :props="props">{{ formatCurrency(props.row.impPagado) }}</q-td>
                    <q-td key="impSaldoInsoluto" :props="props">{{ formatCurrency(props.row.impSaldoInsoluto) }}</q-td>
                    <q-td key="folioFiscal" :props="props">{{ props.row.folioFiscal }}</q-td>
                </q-tr>
            </template>
        </q-table>

        <!-- TABLA DE NOTAS DE CREDITO -->
        <q-table :data="items.notasCredito" :columns="columnsNc" row-key="folioFiscal" :rows-per-page-options="[10]"
            title="Notas de Crédito" class="my-sticky-column-table">
            <template v-slot:body="props">
                <q-tr :props="props">

                    <q-td auto-width>
                        <q-btn size="md" color="primary" rounded flat dense @click="VerNotaCredito(props.row)"
                            icon="mdi-file-pdf-box">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Ver Ingreso</q-tooltip>
                        </q-btn>
                    </q-td>

                    <q-td key="serie" :props="props">{{ props.row.serie }}</q-td>
                    <q-td key="folio" :props="props">{{ props.row.folio }}</q-td>
                    <q-td key="fecha" :props="props">{{ formatDate(props.row.fecha) }}</q-td>

                    <q-td key="rfc" :props="props">{{ props.row.rfc }}</q-td>
                    <q-td key="nombre" :props="props">{{ props.row.nombre }}</q-td>

                    <q-td key="tipoRelacion" :props="props">{{ props.row.tipoRelacion }}</q-td>
                    <!-- <q-td key="formaPago" :props="props">{{ props.row.formaPago }}</q-td>
                    <q-td key="monedaP" :props="props">{{ props.row.monedaP }}</q-td> -->

                    <q-td key="subTotal" :props="props">{{ formatCurrency(props.row.subTotal) }}</q-td>
                    <q-td key="descuento" :props="props">{{ formatCurrency(props.row.descuento) }}</q-td>
                    <q-td key="total" :props="props">{{ formatCurrency(props.row.total) }}</q-td>
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
import { generarCodigoQR } from '../Pdf/qrcodeGenerator';
import * as xlsx from 'xlsx';

export default {
    components: {
        visorPdf,
    },
    data() {
        return {
            columns: [
                { name: 'actions', align: 'left', label: 'Acciones', field: 'actions', sortable: true },
                { name: 'serie', align: 'left', label: 'Serie', field: 'serie', sortable: true },
                { name: 'folio', align: 'left', label: 'Folio', field: 'folio', sortable: true },
                { name: 'rfc', align: 'left', label: 'RFC', field: 'rfc', sortable: true },
                { name: 'nombre', align: 'left', label: 'Nombre', field: 'nombre', sortable: true },
                { name: 'fechaPago', align: 'left', label: 'Fecha de Pago', field: 'fechaPago', sortable: true },
                { name: 'formaPago', align: 'center', label: 'Fomra de Pago', field: 'formaPago', sortable: true },
                { name: 'monedaP', align: 'center', label: 'Moneda P', field: 'monedaP', sortable: true },
                { name: 'tipoCambioP', align: 'center', label: 'Tipo de Cambio P', field: 'tipoCambioP', sortable: true },
                { name: 'idDocumento', align: 'center', label: 'ID Documento Relacionado', field: 'idDocumento', sortable: true },
                { name: 'monedaDr', align: 'center', label: 'Moneda DR', field: 'monedaDr', sortable: true },
                { name: 'equivalenciaDr', align: 'center', label: 'Equivalencia DR', field: 'equivalenciaDr', sortable: true },
                { name: 'numParcialidad', align: 'center', label: 'Num. Parcialidad', field: 'numParcialidad', sortable: true },
                { name: 'impSaldoAnt', align: 'right', label: 'Imp. Saldo Anterior', field: 'impSaldoAnt', sortable: true },
                { name: 'impPagado', align: 'right', label: 'Imp. Pagado', field: 'impPagado', sortable: true },
                { name: 'impSaldoInsoluto', align: 'right', label: 'Imp Saldo Insoluto', field: 'impSaldoInsoluto', sortable: true },
                { name: 'folioFiscal', align: 'left', label: 'Folio Fiscal', field: 'folioFiscal', sortable: true },
            ],

            columnsNc: [
                { name: 'actions', align: 'left', label: 'Acciones', field: 'actions', sortable: true },
                { name: 'serie', align: 'left', label: 'Serie', field: 'serie', sortable: true },
                { name: 'folio', align: 'left', label: 'Folio', field: 'folio', sortable: true },
                { name: 'fecha', align: 'left', label: 'Fecha', field: 'fecha', sortable: true },
                { name: 'rfc', align: 'left', label: 'RFC', field: 'rfc', sortable: true },
                { name: 'nombre', align: 'left', label: 'Nombre', field: 'nombre', sortable: true },
                { name: 'tipoRelacion', align: 'left', label: 'Tipo de Relación', field: 'tipoRelacion', sortable: true },
                { name: 'subTotal', align: 'right', label: 'Sub Total', field: 'subTotal', sortable: true },
                { name: 'descuento', align: 'right', label: 'Descuento', field: 'descuento', sortable: true },
                { name: 'total', align: 'right', label: 'Total', field: 'total', sortable: true },
                { name: 'folioFiscal', align: 'left', label: 'Folio Fiscal', field: 'folioFiscal', sortable: true },
            ],

            dialogDetalles: false,

        }
    },
    computed: {
        token() {
            return this.$store.state.usuario;
        },

        items() {
            return this.$store.state.detallesComplementosStore;
        },

        rutaAxios() {
            return this.$store.state.rutaMongoStore
        }

    },
    created() {

    },
    methods: {
        formatCurrency(value) {
            return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
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
        //     XLSX.writeFile(workbook, this.items.origen + ' ' + this.items.tipo + '.xlsx');
        // },

        ExportExcel() {
            console.log(this.items)

            let reporte = 'COMPLEMENTOS DE PAGO DE LA CUENTA POR PAGAR'
            let empresa = this.$store.state.empresaStore.nombre
            let rfc = this.$store.state.empresaStore.rfc
           

            const workbook = xlsx.utils.book_new();

            const cabecera = [
                [reporte],
                ["EMPRESA:", empresa.toUpperCase()],
                ["RFC:", rfc.toUpperCase()],
                ["FOLIO FISCAL:",this.items.origen],
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

            xlsx.utils.book_append_sheet(workbook, sheet, "COMPLEMENTOS");

            xlsx.writeFile(
                workbook,
                rfc + ' - ' + empresa +  ' - COMPLEMENTOS DE PAGO DEL ' + this.items.origen + '.xlsx'
            );
            },

        async VerComprobante(item){
            console.log(item)
            this.$store.state.vistaPreviaStore.folioFiscal = item.idDocumento;
            this.$store.state.vistaPreviaStore.color = "19775C"
            this.$store.state.vistaPreviaStore.tipoComprobanteInterno = "FACTURA"
            this.$store.state.vistaPreviaStore.tipo = "R"
            this.$store.state.vistaPreviaStore.rfc = this.token.rfc
            this.dialogDetalles = true;
        },

        async VerComprobantePago(item) {
            try {
                this.$store.state.vistaPreviaStore.folioFiscal = item.folioFiscal;
                this.$store.state.vistaPreviaStore.color = "19775C"
                this.$store.state.vistaPreviaStore.tipoComprobanteInterno = "PAGO"
                this.$store.state.vistaPreviaStore.tipo = "R"
                this.$store.state.vistaPreviaStore.rfc = this.token.rfc
                this.dialogDetalles = true;
            } catch (error) {
                console.log(error)
            }
        },

        async VerNotaCredito(item) {
            try {
                this.$store.state.vistaPreviaStore.folioFiscal = item.folioFiscal;
                this.$store.state.vistaPreviaStore.color = "19775C"
                this.$store.state.vistaPreviaStore.tipoComprobanteInterno = "FACTURA"
                this.$store.state.vistaPreviaStore.tipo = "R"
                this.$store.state.vistaPreviaStore.rfc = this.token.rfc
                this.dialogDetalles = true;
            } catch (error) {
                console.log(error)
            }
        },

        CloseDialogDetalles() {
            this.dialogDetalles = false;
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