<template>
    <div class="q-pa-md">
        <!-- DIALOG LOADING -->
        <q-dialog v-model="dialog" persistent transition-show="scale" transition-hide="scale">
            <q-card style="width: 200px">
                <q-card-section>
                    <div class="row justify-center">
                        <span>{{ dialogtext }}</span>
                        <q-spinner-dots color="primary" size="lg" />
                    </div>
                </q-card-section>
            </q-card>
        </q-dialog>

        <!-- DIALOG PARA VER LA LISTA DE LOS COMPROBANTES -->
        <q-dialog v-model="dialogComprobantes" transition-show="scale" transition-hide="scale" maximized>
            <q-table title="Comprobantes" :data="itemsComprobantes" :columns="columnsComprobantes" row-key="folioFiscal"
            :rows-per-page-options="[10]" class="my-sticky-column-table" :filter="filterComprobantes">
                <template v-slot:top>
                    <q-btn push color="red-14" v-close-popup icon="mdi-close-circle-outline" rounded flat size="18px" padding="xs">
                        <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                            :offset="[10, 10]">Cerrar</q-tooltip>
                    </q-btn>
                    <span class="text-body1" content-style="font-size: 20px"> Comprobantes</span>
                    <q-space />
                    <q-input borderless dense debounce="300" v-model="filter" placeholder="Buscar">
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
                                icon="mdi-file-pdf">
                                <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                    content-style="font-size: 14px" :offset="[10, 10]">Ver Comprobantes</q-tooltip>
                            </q-btn>
                        </q-td>
                        <q-td key="folioFiscal" :props="props">{{ props.row.folioFiscal }}</q-td>
                    </q-tr>
                </template>
            </q-table>
        </q-dialog>

        <!-- DIALOG PARA VER LOS PDF -->
        <q-dialog v-model="dialogDetalles" persistent transition-show="scale" transition-hide="scale" maximized>
            <visor-pdf @CloseDialogPdf="CloseDialogPdf"></visor-pdf>
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
            <q-select v-model="selectAgrupador" label="Agrupador" :options="optionsAgrupador" style="width: 300px" >
            
            </q-select>
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

        <!-- TABLA DE COMPROBANTES -->
        <q-table title="Reporte ISR" :data="dataComprobantes" :columns="columns" row-key="folioFiscal"
            :rows-per-page-options="[10]" class="my-sticky-column-table" :filter="filter">
            <template v-slot:top>
                <span class="text-body1" content-style="font-size: 20px">Conceptos por Periodo</span>
                <q-space />
                <q-input borderless dense debounce="300" v-model="filter" placeholder="Buscar">
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
                        <q-btn size="md" color="primary" rounded flat dense @click="VerListaComprobantes(props.row)"
                            icon="mdi-format-list-numbered">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Ver Lista de Comprobantes</q-tooltip>
                        </q-btn>
                    </q-td>
                    <q-td key="contador" :props="props">{{ props.row.contador }}</q-td>
                    <q-td key="noIdentificacion" :props="props">{{ props.row.noIdentificacion }}</q-td>
                    <q-td key="claveProdServ" :props="props">{{ props.row.claveProdServ }}</q-td>
                    <q-td key="descripcion" :props="props">{{ props.row.descripcion }}</q-td>
                    <q-td key="cantidad" :props="props">{{ FormatCurrency(props.row.cantidad) }}</q-td>
                    <q-td key="unidad" :props="props">{{ props.row.unidad }}</q-td>
                    <q-td key="claveUnidad" :props="props">{{ props.row.claveUnidad }}</q-td>
                    <q-td key="descuento" :props="props">{{ FormatCurrency(props.row.descuento) }}</q-td>
                    <q-td key="importe" :props="props">{{ FormatCurrency(props.row.importe) }}</q-td>
                </q-tr>
            </template>
        </q-table>
        <!-- <q-markup-table separator="vertical" v-if="dataComprobantes.length != 0">
            <thead>
                <tr>
                    <th class="text-center">Total Descuentos</th>
                    <th class="text-center">Total Importe</th>
                </tr>
            </thead>
            <tbody style="background: rgb(255, 190, 190)">
                <tr>
                    <td class="text-right">{{ FormatCurrency(totalDecuentos) }}</td>
                    <td class="text-right">{{ FormatCurrency(totalImporte) }}</td>
                </tr>
            </tbody>
        </q-markup-table> -->
    </div>
</template>
<script>
import axios from 'axios'
import moment from 'moment'
import visorPdf from '../Pdf/VisorPdf.vue'
import { ComprobanteBase64 } from '../Pdf/ComprobanteBase64.js'
import { generarCodigoQR } from '../Pdf/qrcodeGenerator';
import * as xlsx from 'xlsx';

export default {
    components: {
        visorPdf,
    },
    data() {
        return {
            columns: [
                { name: 'actions', align: 'left', label: 'Acciones', field: 'actions' },
                { name: 'contador', align: 'left', label: 'Contador', field: 'contador', sortable: true },
                { name: 'noIdentificacion', align: 'left', label: 'No identificación', field: 'noIdentificacion', sortable: true },
                { name: 'claveProdServ', align: 'left', label: 'Clave prod serv', field: 'claveProdServ', sortable: true },
                { name: 'descripcion', align: 'left', label: 'Descripción', field: 'descripcion', sortable: true },
                { name: 'cantidad', align: 'right', label: 'Cantidad', field: 'cantidad', sortable: true },
                { name: 'unidad', align: 'left', label: 'Unidad', field: 'unidad', sortable: true },
                { name: 'claveUnidad', align: 'left', label: 'Clave unidad', field: 'claveUnidad', sortable: true },
                { name: 'descuento', align: 'right', label: 'Descuento', field: 'descuento', sortable: true },
                { name: 'importe', align: 'right', label: 'Importe', field: 'importe', sortable: true },
            ],
            dataComprobantes: [],

            //FECHAS
            fechaI: new Date(),
            fechaF: new Date(),

            //LOADING
            dialog: false,
            dialogtext: '',

            //DETALLES
            dialogDetalles: false,
            dialogComprobantes: false,
            itemsComprobantes: [],
            columnsComprobantes:[
                { name: 'actions', align: 'left', label: 'Acciones', field: 'actions' },
                { name: 'folioFiscal', align: 'left', label: 'Folio Fiscal', field: 'folioFiscal', sortable: true },
            ],

            filter: '',
            filterComprobantes: '',
            optionsAgrupador:['claveProdServ', 'descripcion', 'noIdentificacion'],
            selectAgrupador: 'claveProdServ',

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
        calcularTotales() {
            this.totalDecuentos = this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.descuento, 0)
            this.totalImporte = this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.importe, 0)
        },

        async GetReporte() {
            this.dialogtext = 'Consultando, espere...';
            this.dialog = true;
            let fI = moment(this.fechaI).format('YYYY-MM-DD')
            let fF = moment(this.fechaF).format('YYYY-MM-DD')
            try {
                let response = await axios.get(this.rutaAxios + 'Ingresos/GetReporteConceptosAcumuladoAsync/erp_' + this.token.rfc + '/' + fI + '/' + fF + '/' + this.selectAgrupador);
                let x = response.data;
                this.dataComprobantes = [...x]
                console.log(x)
                this.calcularTotales()

                this.dialog = false;
            } catch (error) {
                console.log(error)
                this.dialog = false;
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
        //     let fI = moment(this.fechaI).format('DD-MMMM-YYYY')
        //     let fF = moment(this.fechaF).format('DD-MMMM-YYYY')

        //     const workbook = XLSX.utils.book_new();

        //     const sheetOtros = XLSX.utils.json_to_sheet(this.dataComprobantes);
        //     XLSX.utils.book_append_sheet(workbook, sheetOtros, 'CONCEPTOS');

        //     XLSX.writeFile(workbook, 'CONCEPTOS VENDIDOS DEL ' + fI + ' AL ' + fF + '.xlsx');
        // },

        ExportExcel() {
            let reporte = 'REPORTE DE CONCEPTOS ACUMULADOS'
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

            xlsx.utils.book_append_sheet(workbook, sheet, "CONCEPTOS");

            xlsx.writeFile(
                workbook,
                rfc + ' - ' + empresa +  ' - REPORTE DE CONCEPTOS ACUMULADOS DEL ' + periodo.toUpperCase() + '.xlsx'
            );
            },

        UltimoDiaMes() {
            const fecha = new Date(this.fechaI);
            const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
            this.fechaF = ultimoDia;
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

        CloseDialogPdf() {
            this.dialogDetalles = false;
        },

        VerListaComprobantes(item){
            console.log(item)
            this.dialogComprobantes = true;
            this.itemsComprobantes = [];
            this.itemsComprobantes = item.listaFolioFiscal.map(folioFiscal => ({ folioFiscal }));;
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