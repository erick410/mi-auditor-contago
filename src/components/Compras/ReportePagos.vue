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
            title="Pagos"  :loading="loading">
              <template v-slot:loading>
        <q-inner-loading showing color="primary" />
      </template>
            <template v-slot:body="props">
                <q-tr :props="props">
                    <q-td key="receptor" :props="props">{{ props.row.receptor }}</q-td>
                    <q-td key="rfc" :props="props">{{ props.row.rfc }}</q-td>
                    <q-td key="nombre" :props="props">{{ props.row.nombre }}</q-td>
                    <q-td key="folioFiscal" :props="props">{{ props.row.folioFiscal }}</q-td>
                    <q-td key="documento" :props="props">{{ props.row.documento }}</q-td>
                    <q-td key="estatus" :props="props">{{ props.row.estatus }}</q-td>
                    <q-td key="fechaCancelacion" :props="props">{{ props.row.fechaCancelacion }}</q-td>
                    <q-td key="monedaP" :props="props">{{ props.row.monedaP }}</q-td>
                    <q-td key="idDocumento" :props="props">{{ props.row.idDocumento }}</q-td>
                    <q-td key="fechaPago" :props="props">{{ FormatDate(props.row.fechaPago) }}</q-td>
                    <q-td key="impPagado" :props="props">{{ formatCurrency(props.row.impPagado) }}</q-td>
                    <q-td key="tipoCambioP" :props="props">{{ props.row.tipoCambioP }}</q-td>
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
                { name: 'receptor', align: 'left', label: 'RFC Compañia', field: 'receptor', sortable: true },
                { name: 'rfc', align: 'left', label: 'RFC del Cliente', field: 'rfc', sortable: true },
                { name: 'nombre', align: 'left', label: 'Razon social del cliente', field: 'nombre', sortable: true },
                { name: 'folioFiscal', align: 'left', label: 'UUID del Pago', field: 'folioFiscal', sortable: true },
                { name: 'documento', align: 'left', label: 'Documento', field: 'documento', sortable: true },
                { name: 'estatus', align: 'left', label: 'Estatus', field: 'estatus', sortable: true },
                { name: 'fechaCancelacion', align: 'left', label: 'Fecha de Cancelación', field: 'fechaCancelacion', sortable: true },
                { name: 'monedaP', align: 'center', label: 'Moneda P', field: 'monedaP', sortable: true },
                { name: 'idDocumento', align: 'center', label: 'UUID Documento Relacionado', field: 'idDocumento', sortable: true },
                { name: 'fechaPago', align: 'left', label: 'Fecha de Pago', field: 'fechaPago', sortable: true },
                { name: 'impPagado', align: 'right', label: 'Imp. Pagado', field: 'impPagado', sortable: true },
                { name: 'tipoCambioP', align: 'center', label: 'Tipo de Cambio P', field: 'tipoCambioP', sortable: true },
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
                let response = await axios.get(this.rutaAxios + 'Gastos/GetReportePagosClientesAsync/erp_' + this.token.rfc + '/' + fI + '/' + fF);
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
         
            const formattedData = this.dataComprobantes.map(row => {
            const formattedRow = {};
            this.columns.forEach(col => {
                if (col.field === 'fechaPago') {
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
            XLSX.writeFile(wb, 'PAGOS  DEL ' + fI + ' AL ' + fF + '.xlsx');
        },

    //    FALTO ExportExcel() {
    //         let reporte = 'REPORTE DE CONCEPTOS COMPRADOS'
    //         let empresa = this.$store.state.empresaStore.nombre
    //         let rfc = this.$store.state.empresaStore.rfc
    //         let fI = moment(this.fechaI).format('DD-MMMM-YYYY')
    //         let fF = moment(this.fechaF).format('DD-MMMM-YYYY')
    //         let periodo = fI + ' AL ' + fF 

    //         const workbook = xlsx.utils.book_new();

    //         const cabecera = [
    //             [reporte],
    //             ["EMPRESA:", empresa.toUpperCase()],
    //             ["RFC:", rfc.toUpperCase()],
    //             ["PERIODO:",periodo.toUpperCase()],
    //             // ["FECHA REPORTE:", new Date()],
    //             [],
    //         ];

    //         const columnasExcel = this.columns.filter(
    //             col => col.name !== "actions"
    //         );

    //         const dataExcel = this.dataComprobantes.map(row => {
    //             const obj = {};
    //             columnasExcel.forEach(col => {
    //             obj[col.label] = row[col.field];
    //             });
    //             return obj;
    //         });

    //         const sheet = xlsx.utils.aoa_to_sheet(cabecera);

    //         xlsx.utils.sheet_add_json(sheet, dataExcel, {
    //             origin: "A6", 
    //             skipHeader: false,
    //         });

    //         sheet["!merges"] = [
    //             { s: { r: 0, c: 0 }, e: { r: 0, c: columnasExcel.length - 1 } },
    //             { s: { r: 1, c: 1 }, e: { r: 1, c: columnasExcel.length - 1 } },
    //             { s: { r: 2, c: 1 }, e: { r: 2, c: columnasExcel.length - 1 } },
    //             { s: { r: 3, c: 1 }, e: { r: 3, c: columnasExcel.length - 1 } },
    //         ];

    //         sheet["!cols"] = columnasExcel.map(() => ({ wch: 20 }));

    //         // const fechaCell = sheet["B4"];
    //         // if (fechaCell) fechaCell.z = "dd/mm/yyyy";

    //         xlsx.utils.book_append_sheet(workbook, sheet, "CONCEPTOS");

    //         xlsx.writeFile(
    //             workbook,
    //             rfc + ' - ' + empresa +  ' - REPORTE DE CONCEPTOS COMPRADOS DEL ' + periodo.toUpperCase() + '.xlsx'
    //         );
    //         },
    },
}
</script>