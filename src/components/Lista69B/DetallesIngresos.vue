<template>
    <div class="q-pa-md">

        <!-- DIALOG PARA VER LOS PDF -->
        <q-dialog v-model="dialogDetalles" persistent transition-show="scale" transition-hide="scale" maximized>
            <visor-pdf @CloseDialog="dialogDetalles = false"></visor-pdf>
        </q-dialog>

        <q-card flat class="my-card">
            <q-card-section>
                <!-- SELECCIONA AÑO Y MES, BOTON DE BUSCAR Y EXPORTAR A EXCEL -->
                <div class="row no-wrap items-center q-mt-md q-pa-sm">
                    <q-btn push color="red-14" @click="CloseDialogI" icon="mdi-close" rounded flat size="18px"
                        padding="xs">
                        <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                            content-style="font-size: 14px" :offset="[10, 10]">Cerrar</q-tooltip>
                    </q-btn>
                    <q-space />
                    <div class="text-h5">CONCEPTOS POR RFC</div>
                    <q-space />
                    <q-btn push color="green-10" @click="ExportExcel" icon="mdi-file-excel-box-outline" rounded flat
                        size="18px" padding="xs">
                        <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                            content-style="font-size: 14px" :offset="[10, 10]">Exportar Excel</q-tooltip>
                    </q-btn>
                </div>
            </q-card-section>
            <q-card-section>
                <!-- TABLA DE COMPROBANTES -->
                <q-table :data="dataComprobantes" :columns="columns" row-key="folioFiscal" :rows-per-page-options="[10]"
                    class="shadow-0">

                    <template v-slot:body="props">
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
                            <q-td key="fecha" :props="props">{{ FormatDate(props.row.fecha) }}</q-td>
                            <q-td key="rfc" :props="props">{{ props.row.rfc }}</q-td>
                            <q-td key="nombre" :props="props">{{ props.row.nombre }}</q-td>
                            <q-td key="tipoComprobante" :props="props">{{ props.row.tipoComprobante }}</q-td>
                            <q-td key="noIdentificacion" :props="props">{{ props.row.noIdentificacion }}</q-td>
                            <q-td key="descripcion" :props="props">{{ props.row.descripcion }}</q-td>
                            <q-td key="claveProdServ" :props="props">{{ props.row.claveProdServ }}</q-td>
                            <q-td key="unidad" :props="props">{{ props.row.unidad }}</q-td>
                            <q-td key="claveUnidad" :props="props">{{ props.row.claveUnidad }}</q-td>

                            <q-td key="cantidad" :props="props">{{ FormatQuantity(props.row.cantidad) }}</q-td>
                            <q-td key="valorUnitario" :props="props">{{ FormatCurrency(props.row.valorUnitario)
                                }}</q-td>
                            <q-td key="descuento" :props="props">{{ FormatCurrency(props.row.descuento) }}</q-td>
                            <q-td key="importe" :props="props">{{ FormatCurrency(props.row.importe) }}</q-td>

                            <q-td key="folioFiscal" :props="props">{{ props.row.folioFiscal }}</q-td>
                        </q-tr>
                    </template>
                </q-table>
            </q-card-section>
        </q-card>
    </div>
</template>
<script>
import axios from 'axios';
import { parseISO, parse, isSameDay } from 'date-fns'
import visorPdf from '../Pdf/VisorPdf.vue'
import { ComprobanteBase64 } from '../Pdf/ComprobanteBase64.js'
import { generarCodigoQR } from '../Pdf/qrcodeGenerator';
import * as xlsx from 'xlsx';
import moment from 'moment'
import { QSpinnerCube } from 'quasar'
import { format } from 'date-fns';

export default {
    components: {
        visorPdf
    },
    data() {
        return {

            //FECHAS
            fechaI: new Date(),
            fechaF: new Date(),
            clientes: [],
            selectClientes: null,
            optionsClientes: [],
            options: [],
            loadingClientes: false,

            columns: [
                { name: 'actions', align: 'left', label: 'Acciones', field: 'actions' },
                { name: 'serie', align: 'left', label: 'Serie', field: 'serie', sortable: true },
                { name: 'folio', align: 'left', label: 'Folio', field: 'folio', sortable: true },
                { name: 'fecha', align: 'left', label: 'Fecha', field: 'fecha', sortable: true },
                { name: 'rfc', align: 'left', label: 'RFC', field: 'rfc', sortable: true },
                { name: 'nombre', align: 'left', label: 'Nombre', field: 'nombre', sortable: true },
                { name: 'tipoComprobante', align: 'left', label: 'Tipo de Comprobante', field: 'tipoComprobante', sortable: true },
                { name: 'noIdentificacion', align: 'left', label: 'No. Identificación', field: 'noIdentificacion', sortable: true },
                { name: 'descripcion', align: 'left', label: 'Descripción', field: 'descripcion', sortable: true },
                { name: 'claveProdServ', align: 'left', label: 'Clave Prod Serv', field: 'claveProdServ', sortable: true },
                { name: 'unidad', align: 'left', label: 'Unidad', field: 'unidad', sortable: true },
                { name: 'claveUnidad', align: 'left', label: 'Clave de Unidad', field: 'claveUnidad', sortable: true },
                { name: 'cantidad', align: 'right', label: 'Cantidad', field: 'cantidad', sortable: true },
                { name: 'valorUnitario', align: 'right', label: 'Valor Unitario', field: 'valorUnitario', sortable: true },
                { name: 'descuento', align: 'right', label: 'Descuento', field: 'descuento', sortable: true },
                { name: 'importe', align: 'right', label: 'Importe', field: 'importe', sortable: true },
                { name: 'folioFiscal', align: 'left', label: 'Folio Fiscal', field: 'folioFiscal', sortable: true },
            ],
            // dataComprobantes: [],

            totalDescuentos: 0,
            totalImporte: 0,

            //DETALLES
            dialogDetalles: false,

            comprobantes69BI: [],
    comprobantes69BG: [],
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
        dataComprobantes() {
            return this.$store.state.comprobantes69BI;

        }
    },
    created() {

    },
    methods: {
        calcularTotales() {
            this.totalDescuentos = this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.descuento, 0)
            this.totalImporte = this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.importe, 0)
        },



        async GetClientes(ObjFechaI, ObjFechaF) {
            this.loadingClientes = true;
            try {
                let response = await axios.get('https://api-mongo.contago.com.mx/api/Ingresos/GetClientesTodosReporteAsync/erp_' + this.token.rfc + '/' + ObjFechaI + '/' + ObjFechaF);
                let x = response.data;
                this.options = [...x]
                this.loadingClientes = false;
            } catch (error) {
                console.log(error)
                this.loadingClientes = false;
            }
        },

        FormatQuantity(value) {
            let valor = value.toLocaleString('en-US', {
                minimumFractionDigits: 3,
                maximumFractionDigits: 3,
            });
            return valor;
        },

        FormatDate(value) {
            let fecha_ = value.replace('T', ' ')
            let fecha_1 = fecha_.replace('Z', ' ')
            let listo = new Date(fecha_1);
            moment.locale('es-mx');
            return moment(listo).format('DD-MMMM-YYYY HH:mm:ss')
        },

        async UltimoDiaMes() {
            const fecha = new Date(this.fechaI);
            const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
            this.fechaF = ultimoDia;

            let fi_ = new Date(this.fechaI);
            let ff_ = new Date(this.fechaF);
            let fi = format(fi_, 'yyyy-MM-dd')
            let ff = format(ff_, 'yyyy-MM-dd')

            await this.GetClientes(fi, ff)
        },

        async CambiaFecha() {
            let fi_ = new Date(this.fechaI);
            let ff_ = new Date(this.fechaF);
            let fi = format(fi_, 'yyyy-MM-dd')
            let ff = format(ff_, 'yyyy-MM-dd')

            await this.GetClientes(fi, ff)
        },

        filterFn(val, update) {
            let stringOptions = this.options
            if (val === '') {
                update(() => {
                    this.optionsClientes = stringOptions
                })
                return
            }

            update(() => {
                const needle = val.toLowerCase()
                this.optionsClientes = stringOptions.filter(v => v.label.toLowerCase().indexOf(needle) > -1)
            })
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

        // ExportExcel() {
        //     let fI = moment(this.fechaI).format('DD-MMMM-YYYY')
        //     let fF = moment(this.fechaF).format('DD-MMMM-YYYY')

        //     const workbook = XLSX.utils.book_new();

        //     const sheetOtros = XLSX.utils.json_to_sheet(this.dataComprobantes);
        //     XLSX.utils.book_append_sheet(workbook, sheetOtros, 'CONCEPTOS');

        //     XLSX.writeFile(workbook, 'CONCEPTOS FACTURADOS POR CLIENTE.xlsx');
        // },

        ExportExcel() {
            let reporte = 'REPORTE DETALLADO DE INGRESOS'
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

            xlsx.utils.book_append_sheet(workbook, sheet, "COMPROBANTES");

            xlsx.writeFile(
                workbook,
                rfc + ' - ' + empresa +  ' - REPORTE DETALLADO DE INGRESOS DEL ' + periodo.toUpperCase() + '.xlsx'
            );
            },

        FormatCurrency(value) {
            return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        },
        CloseDialogI() {
            this.$emit('CloseDialogDetallesI')
        },
    },
}

</script>