<template>
    <div class="q-pa-md">
        <!-- DIALOG PARA VER LOS PDF -->
        <q-dialog v-model="dialogDetalles" persistent transition-show="scale" transition-hide="scale" maximized>
            <visor-pdf @CloseDialogPdf="CloseDialogPdf"></visor-pdf>
        </q-dialog>

        <q-card flat class="my-card">
            <q-card-section>
                <!-- SELECCIONA AÑO Y MES, BOTON DE BUSCAR Y EXPORTAR A EXCEL -->
                <div class="row no-wrap items-center q-mt-md q-pa-sm">
                    <q-btn push color="red-14" @click="CloseDialog" icon="mdi-close" rounded flat size="18px" padding="xs">
                        <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                            :offset="[10, 10]">Cerrar</q-tooltip>
                    </q-btn>
                    <q-space />
                    <div class="text-h5">{{ items.cabecera }}</div>
                    <!-- <span>{{ items.tipo }}</span> -->
                    <q-space />
                    <q-btn push color="green-10" @click="ExportExcel" icon="mdi-file-excel-box-outline" rounded flat
                        size="18px" padding="xs">
                        <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                            :offset="[10, 10]">Exportar Excel</q-tooltip>
                    </q-btn>
                </div>
            </q-card-section>
        </q-card>

        <!-- TABLA DE SUELDOS Y SALARIOS -->
        <q-table :data="items.detalles" :columns="columns" row-key="folioFiscal" :rows-per-page-options="[10]" :filter="filter">
            <template v-slot:top-right>
                <q-input borderless dense debounce="300" v-model="filter" placeholder="Buscar">
                  <template v-slot:append>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </template>
            <template v-slot:body="props" >
                <q-tr :props="props">
                    <q-td auto-width>
                        <q-btn size="md" color="primary" rounded flat dense @click="VerComprobante(props.row)"
                            icon="mdi-file-pdf-box">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Detalles</q-tooltip>
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

                    <q-td key="claveProdServ" :props="props">{{ props.row.claveProdServ }}</q-td>
                    <q-td key="descricpion" :props="props">{{ props.row.descricpion }}</q-td>
                    <q-td key="valorUnitario" :props="props">{{ formatCurrency(props.row.valorUnitario) }}</q-td>
                    <q-td key="importe" :props="props">{{ formatCurrency(props.row.importe) }}</q-td>
                    <q-td key="cantidad" :props="props">{{ formatQuantity(props.row.cantidad) }}</q-td>
                    <q-td key="claveUnidad" :props="props">{{ props.row.claveUnidad }}</q-td>

                    <q-td key="base_" :props="props">{{ formatCurrency(props.row.base_) }}</q-td>
                    <q-td key="impuesto" :props="props">{{ props.row.impuesto }}</q-td>
                    <q-td key="tipoFactor" :props="props">{{ props.row.tipoFactor }}</q-td>
                    <q-td key="tasaOCuota" :props="props">{{ formatImpuestos(props.row.tasaOCuota) }}</q-td>
                    <q-td key="isr" :props="props">{{ formatCurrency(props.row.isr) }}</q-td>

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
                    <q-td key="porcentaje" :props="props">{{ props.row.porcentaje }} %</q-td>

                </q-tr>
            </template>
        </q-table>
    </div>
</template>
<script>
import axios from 'axios'
import moment from 'moment'
import * as xlsx from 'xlsx';
import visorPdf from '../Pdf/VisorPdf.vue'

export default {
    components: {
        visorPdf,
    },
    data() {
        return {
            filter:'',
            columns: [
                { name: 'actions', align: 'left', label: 'Acciones', field: 'actions', sortable: true },
                { name: 'serie', align: 'left', label: 'Serie', field: 'serie', sortable: true },
                { name: 'folio', align: 'left', label: 'Folio', field: 'folio', sortable: true },
                { name: 'fecha', align: 'left', label: 'Fecha de Emisión', field: 'fecha', sortable: true },
                { name: 'fechaPago', align: 'left', label: 'Fecha de Pago', field: 'fechaPago', sortable: true },
                { name: 'rfc', align: 'left', label: 'RFC', field: 'rfc', sortable: true },
                { name: 'nombre', align: 'left', label: 'Nombre', field: 'nombre', sortable: true },
                { name: 'metodoPago', align: 'left', label: 'Metodo de Pago', field: 'metodoPago', sortable: true },
                { name: 'formaPago', align: 'left', label: 'Forma de Pago', field: 'formaPago', sortable: true },

                { name: 'claveProdServ', align: 'left', label: 'Clave Prod Serv', field: 'claveProdServ', sortable: true },
                { name: 'descricpion', align: 'left', label: 'Descripción', field: 'descricpion', sortable: true },
                { name: 'valorUnitario', align: 'right', label: 'Valor Unitario', field: 'valorUnitario', sortable: true },
                { name: 'importe', align: 'right', label: 'Importe', field: 'importe', sortable: true },
                { name: 'cantidad', align: 'center', label: 'Cantidad', field: 'cantidad', sortable: true },
                { name: 'claveUnidad', align: 'left', label: 'Clave Unidad', field: 'claveUnidad', sortable: true },

                { name: 'base_', align: 'right', label: 'Base', field: 'base_', sortable: true },
                { name: 'impuesto', align: 'left', label: 'Impuesto', field: 'impuesto', sortable: true },
                { name: 'tipoFactor', align: 'left', label: 'Tipo Factor', field: 'tipoFactor', sortable: true },
                { name: 'tasaOCuota', align: 'right', label: 'Tasa O Cuota', field: 'tasaOCuota', sortable: true },
                { name: 'isr', align: 'right', label: 'ISR', field: 'isr', sortable: true },

                { name: 'total', align: 'right', label: 'Total', field: 'total', sortable: true },
                { name: 'impPagado', align: 'right', label: 'Imp. Pagado', field: 'impPagado', sortable: true },
                { name: 'moneda', align: 'left', label: 'Moneda', field: 'moneda', sortable: true },
                { name: 'tipoCambio', align: 'right', label: 'Tipo de Cambio', field: 'tipoCambio', sortable: true },
                { name: 'monedaP', align: 'left', label: 'Moneda P', field: 'monedaP', sortable: true },
                { name: 'tipoCambioP', align: 'right', label: 'Tipo de Cambio P', field: 'tipoCambioP', sortable: true },
                { name: 'monedaDr', align: 'left', label: 'moneda DR', field: 'monedaDr', sortable: true },
                { name: 'equivalenciaDr', align: 'right', label: 'Equivalencia DR', field: 'equivalenciaDr', sortable: true },
                { name: 'tipoComprobante', align: 'left', label: 'Tipo de Comprobante', field: 'tipoComprobante', sortable: true },
                { name: 'folioFiscal', align: 'left', label: 'Folio Fiscal', field: 'folioFiscal', sortable: true },
                { name: 'folioFiscalPago', align: 'left', label: 'Folio Fiscal Pago', field: 'folioFiscalPago', sortable: true },
                { name: 'porcentaje', align: 'right', label: 'Porcentaje', field: 'porcentaje', sortable: true },
            ],

            dataSueldos: [],
            dialogDetalles: false,
        }
    },
    computed: {
        token() {
            return this.$store.state.usuario;
        },

        items() {
            return this.$store.state.detallesIsrMStore;
        },

        rutaAxios() {
            return this.$store.state.rutaMongoStore
        },

    },
    created() {

    },
    methods: {
        formatCurrency(value) {
            return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        },

        formatQuantity(value) {
            let valor = value.toLocaleString('en-US', {
                minimumFractionDigits: 3,
                maximumFractionDigits: 3,
            });
            return valor;
        },

        formatImpuestos(value) {
            let valor = value.toLocaleString('en-US', {
                minimumFractionDigits: 6,
                maximumFractionDigits: 6,
            });
            return valor;
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
        //     const workbook = XLSX.utils.book_new();
        //     const sheet = XLSX.utils.json_to_sheet(this.items.detalles);
        //     XLSX.utils.book_append_sheet(workbook, sheet, 'Hoja1');
        //     XLSX.writeFile(workbook, this.items.origen + ' ' + this.items.tipo + '.xlsx');
        // },

        ExportExcel() {
            let reporte = 'REPORTE DE ' + this.items.origen.toUpperCase() + ' ' + this.items.tipo.toUpperCase()
            let empresa = this.$store.state.empresaStore.nombre
            let rfc = this.$store.state.empresaStore.rfc
            
            let periodo = this.items.tipo.toUpperCase()

            const workbook = xlsx.utils.book_new();

            const cabecera = [
                [reporte],
                ["EMPRESA:", empresa.toUpperCase()],
                ["RFC:", rfc.toUpperCase()],
                ["TIPO:",periodo.toUpperCase()],
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

            xlsx.utils.book_append_sheet(workbook, sheet, "DETALLES");

            xlsx.writeFile(
                workbook,
                rfc + ' - ' + empresa +  ' - ' + reporte.toUpperCase() + '.xlsx'
            );
            },

        async VerComprobante(item) {
            try {
                console.log(this.items.cabecera)
                let a = this.items.cabecera;
                if(a === 'ARRENDAMIENTOS'){
                    this.$store.state.vistaPreviaStore.folioFiscal = item.folioFiscal;
                    this.$store.state.vistaPreviaStore.color = "19775C"
                    this.$store.state.vistaPreviaStore.tipoComprobanteInterno = "FACTURA"
                    this.$store.state.vistaPreviaStore.tipo = "R"
                    this.$store.state.vistaPreviaStore.rfc = this.token.rfc
                    this.dialogDetalles = true;
                }else if(a === 'HONORARIOS'){
                    this.$store.state.vistaPreviaStore.folioFiscal = item.folioFiscal;
                    this.$store.state.vistaPreviaStore.color = "19775C"
                    this.$store.state.vistaPreviaStore.tipoComprobanteInterno = "FACTURA"
                    this.$store.state.vistaPreviaStore.tipo = "R"
                    this.$store.state.vistaPreviaStore.rfc = this.token.rfc
                    this.dialogDetalles = true;
                }
                else if(a === 'DEMAS INGRESOS'){
                    this.$store.state.vistaPreviaStore.folioFiscal = item.folioFiscal;
                    this.$store.state.vistaPreviaStore.color = "19775C"
                    this.$store.state.vistaPreviaStore.tipoComprobanteInterno = "FACTURA"
                    this.$store.state.vistaPreviaStore.tipo = "R"
                    this.$store.state.vistaPreviaStore.rfc = this.token.rfc
                    this.dialogDetalles = true;
                }
            } catch (error) {
                console.log(error)
            }
        },
        
        CloseDialogPdf() {
            this.dialogDetalles = false;
        },
    },
}
</script>
<style>
.my-card {
    width: 100%;
}
</style>