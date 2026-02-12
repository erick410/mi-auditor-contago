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
            <q-btn push color="green-10" @click="ExportExcel"  icon="mdi-file-excel-box-outline" rounded flat size="18px"
                padding="xs">
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                    :offset="[10, 10]">Exportar Excel</q-tooltip>
            </q-btn>
            <q-space />
        </div>

<!-- TABLA DE COMPLEMENTOS DE PAGO -->
    <q-table :data="dataComprobantes" :columns="columns" row-key="folioFiscal" :rows-per-page-options="[10]"
            title="Nomina Detalles"  :loading="loading">
              <template v-slot:loading>
    <q-inner-loading showing color="primary" />
     </template>
            <template v-slot:body="props">
                <q-tr :props="props">
                    <q-td key="rfcCompañia" :props="props">{{ props.row.rfcCompañia }}</q-td>
                    <q-td key="uuidDocumento" :props="props">{{ props.row.uuidDocumento }}</q-td>
                    <q-td key="documento" :props="props">{{ props.row.documento }}</q-td>
                    <q-td key="estatus" :props="props">{{ props.row.estatus }}</q-td>
                    <q-td key="fechaPago" :props="props">{{ FormatDate(props.row.fechaPago) }}</q-td>
                    <q-td key="fechaInicio" :props="props">{{ FormatDate(props.row.fechaInicio) }}</q-td>
                    <q-td key="tipoConcepto" :props="props">{{ props.row.tipoConcepto }}</q-td>
                    <q-td key="nombreEmpleado" :props="props">{{ props.row.nombreEmpleado }}</q-td>
                    <q-td key="numEmpleado" :props="props">{{ props.row.numEmpleado }}</q-td>
                    <q-td key="rfcEmpleado" :props="props">{{  props.row.rfcEmpleado }}</q-td>
                    <q-td key="claveConcepto" :props="props">{{ props.row.claveConcepto }}</q-td>
                    <q-td key="descripcionConcepto" :props="props">{{ props.row.descripcionConcepto }}</q-td>
                    <q-td key="fecha" :props="props">{{ FormatDate(props.row.fecha) }}</q-td>
                    <q-td key="subcidioCausado" :props="props">{{ formatCurrency(props.row.subcidioCausado) }}</q-td>
                    <q-td key="importe" :props="props">{{ formatCurrency(props.row.importe) }}</q-td>
                    <q-td key="importeGravado" :props="props">{{ formatCurrency(props.row.importeGravado) }}</q-td>
                    <q-td key="importeExento" :props="props">{{ formatCurrency(props.row.importeExento) }}</q-td>
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
                { name: 'rfcCompañia', align: 'left', label: 'RFC Compañia', field: 'rfcCompañia', sortable: true },
                { name: 'uuidDocumento', align: 'left', label: 'Folio Fiscal', field: 'uuidDocumento', sortable: true },
                { name: 'documento', align: 'left', label: 'Documento', field: 'documento', sortable: true },
                { name: 'estatus', align: 'left', label: 'Estatus', field: 'estatus', sortable: true },
                { name: 'fechaPago', align: 'left', label: 'Fecha Pago', field: 'fechaPago', sortable: true },
                { name: 'fechaInicio', align: 'left', label: 'Fecha Inicio', field: 'fechaInicio', sortable: true },
                { name: 'tipoConcepto', align: 'left', label: 'Tipo Concepto', field: 'tipoConcepto', sortable: true },
                { name: 'nombreEmpleado', align: 'center', label: 'Nombre Empleado', field: 'nombreEmpleado', sortable: true },
                { name: 'numEmpleado', align: 'center', label: 'Num. Empleado', field: 'numEmpleado', sortable: true },
                { name: 'rfcEmpleado', align: 'left', label: 'RFC Empleado', field: 'rfcEmpleado', sortable: true },
                { name: 'claveConcepto', align: 'right', label: 'Clave Concepto', field: 'claveConcepto', sortable: true },
                { name: 'descripcionConcepto', align: 'center', label: 'Descripción Concepto', field: 'descripcionConcepto', sortable: true },
                { name: 'fecha', align: 'center', label: 'Fecha', field: 'fecha', sortable: true },
                { name: 'subcidioCausado', align: 'center', label: 'Subsidio Causado', field: 'subcidioCausado', sortable: true },
                { name: 'importe', align: 'center', label: 'Importe', field: 'importe', sortable: true },
                { name: 'importeGravado', align: 'center', label: 'Importe Gravado', field: 'importeGravado', sortable: true },
                { name: 'importeExento', align: 'center', label: 'Importe Exento', field: 'importeExento', sortable: true },
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
                let response = await axios.get(this.rutaAxios + 'Ingresos/GetReporteNominaDetalleAsync/erp_' + this.token.rfc + '/' + fI + '/' + fF);
                let x = response.data;
                this.dataComprobantes = [...x]
                console.log(x)
                this.loading = false
            } catch (error) {
                console.log(error)
                this.loading = false
            }
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

        ExportExcel() {
            let fI = moment(this.fechaI).format('YYYY-MM-DD')
            let fF = moment(this.fechaF).format('YYYY-MM-DD')
            let empresa = this.$store.state.empresaStore.nombre
            let rfc = this.$store.state.empresaStore.rfc
            const formattedData = this.dataComprobantes.map(row => {
            const formattedRow = {};
            this.columns.forEach(col => {
                if (col.field === 'fecha' || col.field === 'fechaPago' || col.field === 'fechaInicio') {
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
            XLSX.writeFile(wb,  rfc + ' - ' + empresa + ' - NOMINA DETALLES DEL ' + fI + ' AL ' + fF + '.xlsx');
        },
    },
}
</script>