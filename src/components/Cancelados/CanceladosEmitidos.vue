<template>
    <div class="q-pa-md">
        <!-- DIALOG PARA VER LOS PDF -->
        <q-dialog v-model="dialogDetalles" persistent transition-show="scale" transition-hide="scale" maximized>
            <visor-pdf @CloseDialog="CloseDialogDetalles"></visor-pdf>
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

        <!-- TABLA DE CANCELADOS -->
        <q-table title="Reporte ISR" :data="dataCancelados" :columns="columns" row-key="rfc" :rows-per-page-options="[10]"
            :filter="filter" class="my-sticky-column-table">
            <template v-slot:top>
                <span class="text-body1" content-style="font-size: 20px">Cancelados Emitidos</span>
                <q-space />
                <q-input borderless dense debounce="300" v-model="filter" placeholder="Filtrar">
                    <template v-slot:append>
                        <q-icon name="mdi-magnify" />
                    </template>
                </q-input>
                <q-btn push color="blue-7" @click="OpenNotas(1)" icon="mdi-information-outline" rounded flat size="18px"
                    padding="xs">
                    <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                        :offset="[10, 10]">Información</q-tooltip>
                </q-btn>
            </template>
            <template v-slot:body="props">
                <q-tr :props="props">
                    <q-td auto-width>
                        <q-btn size="md" color="primary" rounded flat dense @click="VerComprobante(props.row)"
                            icon="mdi-file-pdf-box">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Ver PDF</q-tooltip>
                        </q-btn>
                    </q-td>

                    <q-td key="serie" :props="props">{{ props.row.serie }}</q-td>
                    <q-td key="folio" :props="props">{{ props.row.folio }}</q-td>
                    <q-td key="fecha" :props="props">{{ FormatDate(props.row.fecha) }}</q-td>
                    <q-td key="fechaCancelacion" :props="props">{{ FormatDate(props.row.fechaCancelacion) }}</q-td>
                    <q-td key="rfc" :props="props">{{ props.row.rfc }}</q-td>
                    <q-td key="nombre" :props="props">{{ props.row.nombre }}</q-td>
                    <q-td key="metodoPago" :props="props">{{ props.row.metodoPago }}</q-td>
                    <q-td key="formaPago" :props="props">{{ props.row.formaPago }}</q-td>

                    <q-td key="subTotal" :props="props">{{ FormatCurrency(props.row.subTotal) }}</q-td>
                    <q-td key="descuento" :props="props">{{ FormatCurrency(props.row.descuento) }}</q-td>
                    <q-td key="total" :props="props">{{ FormatCurrency(props.row.total) }}</q-td>

                    <q-td key="moneda" :props="props">{{ props.row.moneda }}</q-td>
                    <q-td key="tipoCambio" :props="props">{{ FormatCurrency(props.row.tipoCambio) }}</q-td>
                    <q-td key="tipoComprobante" :props="props">{{ props.row.tipoComprobante }}</q-td>
                    <q-td key="folioFiscal" :props="props">{{ props.row.folioFiscal }}</q-td>
                </q-tr>
            </template>

        </q-table>
    </div>
</template>
<script>
import axios from 'axios'
import moment from 'moment'
import * as xlsx from 'xlsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { QSpinnerCube } from 'quasar'
import visorPdf from '../Pdf/VisorPdf.vue'
import { ComprobanteBase64 } from '../Pdf/ComprobanteBase64.js'
import { generarCodigoQR } from '../Pdf/qrcodeGenerator';

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
                { name: 'fechaCancelacion', align: 'left', label: 'Fecha de Cancelación', field: 'fechaCancelacion', sortable: true },
                { name: 'rfc', align: 'left', label: 'RFC', field: 'rfc', sortable: true },
                { name: 'nombre', align: 'left', label: 'Nombre', field: 'nombre', sortable: true },
                { name: 'metodoPago', align: 'left', label: 'Método de Pago', field: 'metodoPago', sortable: true },
                { name: 'formaPago', align: 'left', label: 'Forma de Pago', field: 'formaPago', sortable: true },
                { name: 'subTotal', align: 'right', label: 'Subtotal', field: 'subTotal', sortable: true },
                { name: 'descuento', align: 'right', label: 'Descuento', field: 'descuento', sortable: true },
                { name: 'total', align: 'right', label: 'Total', field: 'total', sortable: true },
                { name: 'moneda', align: 'left', label: 'Moneda', field: 'moneda', sortable: true },
                { name: 'tipoCambio', align: 'right', label: 'Tipo de Cambio', field: 'tipoCambio', sortable: true },
                { name: 'tipoComprobante', align: 'left', label: 'Tipo de Comprobante', field: 'tipoComprobante', sortable: true },
                { name: 'folioFiscal', align: 'left', label: 'Folio Fiscal', field: 'folioFiscal', sortable: true },
            ],
            dataCancelados: [],

            fechaI: new Date(),
            fechaF: new Date(),
            filter: '',

            //LOADING
            dialog: false,
            dialogtext: '',

            dialogDetalles: false,
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
        }

    },
    created() {

    },
    methods: {
        async GetReporte() {
            this.ShowLoading();
            this.dialogtext = 'Consultando, espere...'
            let fI = moment(this.fechaI).format('YYYY-MM-DD')
            let fF = moment(this.fechaF).format('YYYY-MM-DD')

            try {
                let response = await axios.get(this.rutaAxios + 'Ingresos/GetCanceladoAsync/erp_' + this.token.rfc + '/' + fI + '/' + fF);
                let x = response.data;
                this.dataCancelados = x;
                this.$q.loading.hide()
            } catch (error) {
                console.log(error)
                this.$q.loading.hide()
            }
        },

        FormatCurrency(value) {
            return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        },

        FormatDate(value) {
            let fecha_ = value.replace('T', ' ')
            let fecha_1 = fecha_.replace('Z', ' ')
            let listo = new Date(fecha_1);
            moment.locale('es-mx');
            return moment(listo).format('DD-MMMM-YYYY HH:mm:ss')
        },

        // ExportExcel() {
        //     let fi_ = new Date(this.fechaI);
        //     let ff_ = new Date(this.fechaF);

        //     let fI = format(fi_, 'dd-MMMM-yyyy', { locale: es })
        //     let fF = format(ff_, 'dd-MMMM-yyyy', { locale: es })

        //     const workbook = XLSX.utils.book_new();
        //     const sheetTrabajadores = XLSX.utils.json_to_sheet(this.dataCancelados);
        //     XLSX.utils.book_append_sheet(workbook, sheetTrabajadores, 'CANELADOS');
        //     XLSX.writeFile(workbook, 'REPORTE DE COMPROBANTES EMITIDOS CANCELADOS DEL ' + fI + ' AL ' + fF + '.xlsx');
        // },

        ExportExcel() {
            let fi_ = new Date(this.fechaI);
            let ff_ = new Date(this.fechaF);

            let reporte = 'REPORTE DE COMPROBANTES EMITIDOS CANCELADOS'
            let empresa = this.$store.state.empresaStore.nombre
            let rfc = this.$store.state.empresaStore.rfc
            let fI = format(fi_, 'dd-MMMM-yyyy', { locale: es })
            let fF = format(ff_, 'dd-MMMM-yyyy', { locale: es })
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

            const dataExcel = this.dataCancelados.map(row => {
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

            xlsx.utils.book_append_sheet(workbook, sheet, "CANCELADOS");

            xlsx.writeFile(
                workbook,
                rfc + ' - ' + empresa +  ' - REPORTE DE COMPROBANTES EMITIDOS CANCELADOS DEL ' + periodo.toUpperCase() + '.xlsx'
            );
            },

        UltimoDiaMes() {
            const fecha = new Date(this.fechaI);
            const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
            this.fechaF = ultimoDia;
        },

        ShowLoading() {
            this.$q.loading.show({
                spinner: QSpinnerCube,
                spinnerColor: 'red-8',
                spinnerSize: 140,
                // backgroundColor: 'purple',
                message: 'Consultando, esprer..',
                // messageColor: 'black'
            })
        },

        async VerComprobante(item) {
            console.log(item);
            this.ShowLoading();

            if (item.tipoComprobante === 'I') {
                await this.VerComprobanteI(item)
            }

            if (item.tipoComprobante === 'E') {
                await this.VerComprobanteI(item)
            }

            if (item.tipoComprobante === 'N') {
                await this.VerComprobanteN(item)
            }

            if (item.tipoComprobante === 'P') {
                await this.VerComprobanteP(item)
            }

            this.$q.loading.hide()
        },

        async VerComprobanteI(item) {
            try {
                console.log(item)
                let response = await axios.get(this.rutaAxios + 'Comprobante/GetComprobanteAsync/erp_' + this.token.rfc + '/' + item.folioFiscal);
                let x = response.data;
                console.log(x);
                let color = "#" + '00A35C';

                let extraQr = x.timbreFiscalDigital.selloCFD.slice(-8);
                let cadenaOriginal = '||1.1|' + x.folioFiscal + '|' + x.timbreFiscalDigital.fechaTimbrado + '|' + x.timbreFiscalDigital.rfcProvCertif + '|' + x.timbreFiscalDigital.selloCFD + '|' + x.timbreFiscalDigital.noCertificadoSAT + '||'
                x.timbreFiscalDigital.cadenaOriginal = cadenaOriginal;
                let codigoQR = await generarCodigoQR(x.folioFiscal, x.emisor.rfc, x.receptor.rfc, x.total, extraQr);

                let base64 = await ComprobanteBase64(x, x.tipoComprobanteInterno, x.estatus, color, codigoQR);

                this.$store.state.comprobanteStore.nombre = x.folioFiscal;
                this.$store.state.comprobanteStore.base64 = base64.split(',')[1];
                this.$store.state.comprobanteStore.fecha = x.fecha;

                // console.log(this.$store.state.comprobanteStore)
                this.dialogDetalles = true;
            } catch (error) {
                console.log(error)
            }
        },

        async VerComprobanteN(item) {
            try {
                console.log(item)
                let response = await axios.get(this.rutaAxios + 'Comprobante/GetComprobanteNominaAsync/erp_' + this.token.rfc + '/' + item.folioFiscal);
                let x = response.data;
                console.log(x);
                let color = "#" + '00A35C';

                let extraQr = x.timbreFiscalDigital.selloCFD.slice(-8);
                let cadenaOriginal = '||1.1|' + x.folioFiscal + '|' + x.timbreFiscalDigital.fechaTimbrado + '|' + x.timbreFiscalDigital.rfcProvCertif + '|' + x.timbreFiscalDigital.selloCFD + '|' + x.timbreFiscalDigital.noCertificadoSAT + '||'
                x.timbreFiscalDigital.cadenaOriginal = cadenaOriginal;
                let codigoQR = await generarCodigoQR(x.folioFiscal, x.emisor.rfc, x.receptor.rfc, x.total, extraQr);

                let base64 = await ComprobanteBase64(x, x.tipoComprobanteInterno, x.estatus, color, codigoQR);

                this.$store.state.comprobanteStore.nombre = x.folioFiscal;
                this.$store.state.comprobanteStore.base64 = base64.split(',')[1];
                this.$store.state.comprobanteStore.fecha = x.fecha;

                // console.log(this.$store.state.comprobanteStore)
                this.dialogDetalles = true;
            } catch (error) {
                console.log(error)
            }
        },

        async VerComprobanteP(item) {
            try {
                console.log(item)
                let response = await axios.get(this.rutaAxios + 'Comprobante/GetComprobantePagoEmitidoAsync/erp_' + this.token.rfc + '/' + item.folioFiscal);
                let x = response.data;
                console.log(x);
                let color = "#" + '00A35C';

                let extraQr = x.timbreFiscalDigital.selloCFD.slice(-8);
                let cadenaOriginal = '||1.1|' + x.folioFiscal + '|' + x.timbreFiscalDigital.fechaTimbrado + '|' + x.timbreFiscalDigital.rfcProvCertif + '|' + x.timbreFiscalDigital.selloCFD + '|' + x.timbreFiscalDigital.noCertificadoSAT + '||'
                x.timbreFiscalDigital.cadenaOriginal = cadenaOriginal;
                let codigoQR = await generarCodigoQR(x.folioFiscal, x.emisor.rfc, x.receptor.rfc, x.total, extraQr);

                let base64 = await ComprobanteBase64(x, x.tipoComprobanteInterno, x.estatus, color, codigoQR);

                this.$store.state.comprobanteStore.nombre = x.folioFiscal;
                this.$store.state.comprobanteStore.base64 = base64.split(',')[1];
                this.$store.state.comprobanteStore.fecha = x.fecha;

                // console.log(this.$store.state.comprobanteStore)
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