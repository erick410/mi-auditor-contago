<template>
    <div class="q-pa-md">
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
                    <q-date v-model="fechaF"  >
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
        <q-table :data="dataComprobantes" :columns="columns" row-key="folioFiscal" :rows-per-page-options="[10]"
            title="Contabilidad Documentos Emitidos"  :loading="loading">
              <template v-slot:loading>
        <q-inner-loading showing color="primary" />
      </template>
            <template v-slot:body="props">
                <q-tr :props="props">
                    <q-td key="rfcEmisor" :props="props">{{ props.row.rfcEmisor }}</q-td>
                    <q-td key="rfcReceptor" :props="props">{{ props.row.rfcReceptor }}</q-td>
                    <q-td key="nombreReceptor" :props="props">{{ props.row.nombreReceptor }}</q-td>
                    <q-td key="tipoComprobante" :props="props">{{ props.row.tipoComprobante }}</q-td>
                    <q-td key="folioFiscal" :props="props">{{ props.row.folioFiscal }}</q-td>
                    <q-td key="serieFolio" :props="props">{{ props.row.serieFolio }}</q-td>
                    <q-td key="docRelacionados" :props="props">{{ props.row.docRelacionados }}</q-td>
                    <q-td key="numPoliza" :props="props">{{ props.row.numPoliza }}</q-td>
                    <q-td key="tipo" :props="props">{{ props.row.tipo }}</q-td>
                    <q-td key="moneda" :props="props">{{ props.row.moneda }}</q-td>
                    <q-td key="metodoPago" :props="props">{{ props.row.metodoPago }}</q-td>
                    <q-td key="estatus" :props="props">{{props.row.estatus }}</q-td>
                    <q-td key="fechaCancelacion" :props="props">{{  props.row.fechaCancelacion }}</q-td>
                    <q-td key="fecha" :props="props">{{  FormatDate(props.row.fecha) }}</q-td>
                    <q-td key="subTotal" :props="props">{{ formatCurrency(props.row.subTotal) }}</q-td>
                    <q-td key="descuentos" :props="props">{{ formatCurrency(props.row.descuentos) }}</q-td>
                    <q-td key="tipoCambio" :props="props">{{ formatCurrency(props.row.tipoCambio) }}</q-td>
                    <q-td key="iepsRetenido" :props="props">{{ formatCurrency(props.row.iepsRetenido) }}</q-td>
                    <q-td key="iepsTrasladado" :props="props">{{ formatCurrency(props.row.iepsTrasladado) }}</q-td>
                    <q-td key="isrRetenido" :props="props">{{ formatCurrency(props.row.isrRetenido) }}</q-td>
                    <q-td key="ivaRetenido" :props="props">{{ formatCurrency(props.row.ivaRetenido) }}</q-td>
                    <q-td key="ivaTrasladado" :props="props">{{ formatCurrency(props.row.ivaTrasladado) }}</q-td>
                    <q-td key="impLocalRetenido" :props="props">{{ formatCurrency(props.row.impLocalRetenido) }}</q-td>
                    <q-td key="impLocalTrasladado" :props="props">{{ formatCurrency(props.row.impLocalTrasladado) }}</q-td>
                </q-tr>
            </template>
        </q-table>

    </div>
</template>
<script>
import axios from 'axios'
import { format,lastDayOfMonth, differenceInDays, utcToZonedTime , parseISO, parse, isSameMonth } from 'date-fns'
import * as XLSX from 'xlsx';
import { QSpinnerCube } from 'quasar'
import moment from 'moment'
import { es } from 'date-fns/locale';
export default {
    components: {
    },
    data() {
        return {
            dataComprobantes: [],
            
            //FECHAS
            fechaI: new Date(),
            fechaF: new Date(),

            columns: [
                { name: 'rfcEmisor', align: 'left', label: 'RFC Compañia', field: 'rfcEmisor', sortable: true },
                { name: 'rfcReceptor', align: 'left', label: 'RFC del Cliente', field: 'rfcReceptor', sortable: true },
                { name: 'nombreReceptor', align: 'left', label: 'Razon social del cliente', field: 'nombreReceptor', sortable: true },
                { name: 'tipoComprobante', align: 'left', label: 'Tipo de Documento', field: 'tipoComprobante', sortable: true },
                
                { name: 'folioFiscal', align: 'left', label: 'UUID del Documento', field: 'folioFiscal', sortable: true },
                { name: 'serieFolio', align: 'left', label: 'Documento', field: 'serieFolio', sortable: true },
                { name: 'docRelacionados', align: 'left', label: 'Documentos Relacionados', field: 'docRelacionados', sortable: true },
                { name: 'numPoliza', align: 'center', label: 'Número de Poliza', field: 'numPoliza', sortable: true },
                { name: 'tipo', align: 'center', label: 'Tipo de Poliza', field: 'tipo', sortable: true },
                { name: 'moneda', align: 'center', label: 'Moneda', field: 'moneda', sortable: true },
                { name: 'metodoPago', align: 'center', label: 'Metodo de Pago', field: 'metodoPago', sortable: true },
                
                { name: 'estatus', align: 'left', label: 'Estatus', field: 'estatus', sortable: true },
                { name: 'fechaCancelacion', align: 'left', label: 'Fecha de Cancelación', field: 'fechaCancelacion', sortable: true },
                { name: 'fecha', align: 'left', label: 'Fecha del Documento', field: 'fecha', sortable: true },
                
                { name: 'subTotal', align: 'center', label: 'SubTotal', field: 'subTotal', sortable: true },
                { name: 'descuentos', align: 'left', label: 'Descuentos', field: 'descuentos', sortable: true },
                { name: 'tipoCambio', align: 'right', label: 'Tipo de Cambio', field: 'tipoCambio', sortable: true },
                { name: 'iepsRetenido', align: 'center', label: 'IEPS Retenido', field: 'iepsRetenido', sortable: true },
                { name: 'iepsTrasladado', align: 'center', label: 'IEPS Trasladado', field: 'iepsTrasladado', sortable: true },
                { name: 'isrRetenido', align: 'center', label: 'ISR Retenido', field: 'isrRetenido', sortable: true },
                { name: 'ivaRetenido', align: 'center', label: 'IVA Retenido', field: 'ivaRetenido', sortable: true },
                { name: 'ivaTrasladado', align: 'center', label: 'IVA Trasladado', field: 'ivaTrasladado', sortable: true },
                { name: 'impLocalRetenido', align: 'center', label: 'Impuesto Local Retenido', field: 'impLocalRetenido', sortable: true },
                { name: 'impLocalTrasladado', align: 'center', label: 'Impuesto Local Trasladado', field: 'impLocalTrasladado', sortable: true },
            ],
            loading:false
        }
    },
    computed: {
        token() {
            return this.$store.state.usuario;
        },
        rutaAxios() {
            return this.$store.state.rutaMongoStore
        },
        fehaIMasked() {
            moment.locale('es-mx');
            return this.fechaI ? moment(this.fechaI).format('DD/MMMM/yyyy') : ''
        },

        fechaFMasked() {
            moment.locale('es-mx');
            return this.fechaF ? moment(this.fechaF).format('DD/MMMM/yyyy') : ''
        },
    },
    created() {

    },
    methods: {
      async GetReporte() {
        this.loading = true
            let fI = moment(this.fechaI).format('YYYY-MM-DD')
            let fF = moment(this.fechaF).format('YYYY-MM-DD')
            try {
                let response = await axios.get(this.rutaAxios + 'Ingresos/GetReporteDocumentosContabilidadAsync/erp_' + this.token.rfc + '/' + fI + '/' + fF );
                let x = response.data;
                console.log(x)
                this.dataComprobantes = [...x]
                       this.loading = false

            } catch (error) {
                console.log(error)
                this.loading = false
            }
        },

        ExportExcel() {
            let empresa = this.$store.state.empresaStore.nombre
            let rfc = this.$store.state.empresaStore.rfc

            let fI = moment(this.fechaI).format('YYYY-MM-DD')
            let fF = moment(this.fechaF).format('YYYY-MM-DD')
         
            const formattedData = this.dataComprobantes.map(row => {
            const formattedRow = {};
            this.columns.forEach(col => {
                if (col.field === 'fecha') {
                formattedRow[col.label] = moment(row[col.field]).format('YYYY-MM-DD');
                } else {
                formattedRow[col.label] = row[col.field];
                }
            });
            return formattedRow;
            });

            const ws = XLSX.utils.json_to_sheet(formattedData, { header: this.columns.map(col => col.label) });

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Datos');
            XLSX.writeFile(wb, rfc + ' - ' + empresa + ' - CONTABILIDAD COMPROBANTES EMITIDOS ' + fI + ' AL ' + fF + '.xlsx');
        },
         UltimoDiaMes() {
            const fecha = new Date(this.fechaI);
            const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
            this.fechaF = ultimoDia;
        },

        formatCurrency(value) {
            return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        },

        FormatDate(value) {
            let fecha_ = value.replace('T', ' ')
            let fecha_1 = fecha_.replace('Z', ' ')
            let listo = new Date(fecha_1);
            moment.locale('es-mx');
            return moment(listo).format('DD-MMMM-YYYY HH:mm:ss')
        },
    },
}
</script>