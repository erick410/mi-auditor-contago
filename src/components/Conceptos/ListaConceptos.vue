<template>
    <div class="q-pa-md">
 
        <!-- SELECCIONA AÑO Y MES, BOTON DE BUSCAR Y EXPORTAR A EXCEL -->
        <div class="row no-wrap items-center q-mt-md q-pa-sm">
            <q-space />

            <q-input v-model="fehaIMasked" label="Fecha Inicial" class="q-mr-sm" name="event" outlined dense>
                <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                    <q-date v-model="fechaI" @input="UltimoDiaMes">
                        <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Ok" color="primary" flat />
                        </div>
                    </q-date>
                </q-popup-proxy>
            </q-input>

            <q-input v-model="fechaFMasked" label="Fecha Final" class="q-mr-xs" outlined dense>
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
            <q-btn push color="red-10" @click="abrirDialogLista69B" icon="mdi-account-search" rounded flat size="18px"
                padding="xs">
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                    :offset="[10, 10]">Lista 69B</q-tooltip>
            </q-btn>
            <q-space />
        </div>

        <!-- TABLA DE COMPROBANTES -->
        <q-table title="Conceptos" :data="dataComprobantes" :columns="columns" row-key="folioFiscal"
            :rows-per-page-options="[10]" class="my-sticky-column-table" :filter="filter">
            <template v-slot:top>
                <span class="text-body1" content-style="font-size: 20px">Cuentas Por Cobrar</span>
                <q-space />
                <q-input borderless dense debounce="300" v-model="filter" placeholder="Filtrar">
                    <template v-slot:append>
                        <q-icon name="search" />
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
                        <q-btn size="md" color="primary" rounded flat dense @click="OpenDialogDetalle(props.row)"
                            icon="mdi-format-list-bulleted">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Detalles</q-tooltip>
                        </q-btn>
                        <q-btn size="md" color="primary" rounded flat dense @click="VerComprobante(props.row)"
                            icon="mdi-file-pdf-box">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Ver Comprobante</q-tooltip>
                        </q-btn>
                    </q-td>

                    <q-td key="serie" :props="props">{{ props.row.serie }}</q-td>
                    <q-td key="folio" :props="props">{{ props.row.folio }}</q-td>
                    <q-td key="fecha" :props="props">{{ FormatDate(props.row.fecha) }}</q-td>
                    <q-td key="rfc" :props="props">{{ props.row.rfc }}</q-td>
                    <q-td key="nombre" :props="props">{{ props.row.nombre }}</q-td>

                    <q-td key="porCobrar" :props="props">{{ FormatCurrency(props.row.porCobrar) }}</q-td>
                    <q-td key="cobrado" :props="props">{{ FormatCurrency(props.row.cobrado) }}</q-td>
                    <q-td key="total" :props="props">{{ FormatCurrency(props.row.total) }}</q-td>
                    <q-td key="moneda" :props="props">{{ props.row.moneda }}</q-td>
                    <q-td key="nc" :props="props">{{ FormatCurrency(props.row.nc) }}</q-td>

                    <q-td key="folioFiscal" :props="props">{{ props.row.folioFiscal }}</q-td>
                    <q-td key="dias" :props="props">{{ props.row.dias }}</q-td>
                </q-tr>
            </template>
        </q-table>
        <q-markup-table separator="vertical" v-if="dataComprobantes.length != 0">
            <thead>
                <tr>
                    <th class="text-center">Total Por Cobrar</th>
                    <th class="text-center">Total Cobrado</th>
                    <th class="text-center">Total Facturado</th>
                    <th class="text-center">Total Notas de Crédito</th>
                </tr>
            </thead>
            <tbody style="background: rgb(255, 190, 190)">
                <tr>
                    <td class="text-right">{{ FormatCurrency(totalPorCobrar) }}</td>
                    <td class="text-right">{{ FormatCurrency(totalCobrado) }}</td>
                    <td class="text-right">{{ FormatCurrency(totalFacturado) }}</td>
                    <td class="text-right">{{ FormatCurrency(totalNc) }}</td>
                </tr>
            </tbody>
        </q-markup-table>

         
    </div>
</template>
<script>
    import axios from 'axios'
    import moment from 'moment'
    import * as xlsx from 'xlsx';
    import { format, lastDayOfMonth, differenceInDays, parseISO, utcToZonedTime } from 'date-fns';
    import { es } from 'date-fns/locale';

    // import visorPdf from '../Pdf/VisorPdf.vue'
    // import { ComprobanteBase64 } from '../Pdf/ComprobanteBase64.js'
    // import { generarCodigoQR } from '../Pdf/qrcodeGenerator';
    import { QSpinnerCube } from 'quasar'

    export default {
        components: {
        },
        data() {
            return {
                totalCobrado: 0,
                totalFacturado: 0,
                totalNc: 0,
                totalPorCobrar: 0,
                columns: [
                    { name: 'actions', align: 'left', label: 'Acciones', field: 'actions' },
                    { name: 'serie', align: 'left', label: 'Serie', field: 'serie', sortable: true },
                    { name: 'folio', align: 'left', label: 'Folio', field: 'folio', sortable: true },
                    { name: 'fecha', align: 'left', label: 'Fecha', field: 'fecha', sortable: true },
                    { name: 'rfc', align: 'left', label: 'RFC', field: 'rfc', sortable: true },
                    { name: 'nombre', align: 'left', label: 'Nombre', field: 'nombre', sortable: true },
                    { name: 'porCobrar', align: 'right', label: 'Por Cobrar', field: 'porCobrar', sortable: true },
                    { name: 'cobrado', align: 'right', label: 'Cobrado', field: 'cobrado', sortable: true },
                    { name: 'total', align: 'right', label: 'Total Facturado', field: 'total', sortable: true },
                    { name: 'moneda', align: 'left', label: 'Moneda', field: 'moneda', sortable: true },
                    { name: 'nc', align: 'right', label: 'Notas de Crédito', field: 'nc', sortable: true },
                    { name: 'folioFiscal', align: 'left', label: 'Folio Fiscal', field: 'folioFiscal', sortable: true },
                    { name: 'dias', align: 'left', label: 'Días de Crédito', field: 'dias', sortable: true },
                ],
                dataComprobantes: [],

                //FECHAS
                fechaI: new Date(),
                fechaF: new Date(),

                //LOADING
                dialogtext: '',

                //DETALLES
                dialogDetalles: false,
                dialogPdf: false,
                filter: '',

                charTitleE: 'Cuentas por Cobrar',
                chartData: null,
                dialogLista69B: false
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
                this.totalPorCobrar = this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.porCobrar, 0),
                    this.totalCobrado = this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.cobrado, 0),
                    this.totalFacturado = this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.total, 0),
                    this.totalNc = this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.nc, 0)
            },

            async GetReporte() {
                this.OpenDialogLoading()
                let fI = moment(this.fechaI).format('YYYY-MM-DD')
                let fF = moment(this.fechaF).format('YYYY-MM-DD')
                try {
                    let response = await axios.get(this.rutaAxios + 'Ingresos/ReporteConceptoAsync/erp_' + this.token.rfc + '/' + fI + '/' + fF);
                    let x = response.data;
                    this.dataComprobantes = [...x]
                    console.log(x)
                    
                } catch (error) {
                    console.log(error)
                    this.$q.loading.hide()
                }
            },
           
            ObtenerFechaMasGrande(array) {
                if (array.length === 0) {
                    const fechaActual = new Date();
                    const fechaFormateada = format(fechaActual, "yyyy-MM-dd'T'HH:mm:ss'Z'");
                    return fechaFormateada;
                }
                return array.reduce((fechaMasGrande, objeto) => {
                    const fechaActual = objeto.fechaPago;

                    // Compara las fechas y actualiza fechaMasGrande si la fechaActual es mayor
                    return fechaActual > fechaMasGrande ? fechaActual : fechaMasGrande;
                }, array[0].fechaPago); // Inicializa con la fecha del primer objeto
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
 

            ExportExcel() {
            let reporte = 'REPORTE DE CUENTAS POR COBRAR'
            let empresa = this.$store.state.empresaStore.nombre
            let rfc = this.$store.state.empresaStore.rfc
                let fi_ = new Date(this.fechaI);
                let ff_ = new Date(this.fechaF);

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

            xlsx.utils.book_append_sheet(workbook, sheet, "CXC");

            xlsx.writeFile(
                workbook,
                rfc + ' - ' + empresa +  ' - REPORTE DE CUENTAS POR COBRAR DEL ' + periodo.toUpperCase() + '.xlsx'
            );
            },
            UltimoDiaMes() {
                const fecha = new Date(this.fechaI);

                const ultimoDiaDelMes = lastDayOfMonth(fecha);

                const fechaFormateada = format(ultimoDiaDelMes, 'yyyy-MM-dd');

                // const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
                this.fechaF = fechaFormateada;
            },

            OpenDialogDetalle(item) {
                this.$store.state.detallesComplementosStore.origen = item.folioFiscal;
                this.$store.state.detallesComplementosStore.tipo = 'CUENTAS POR COBRAR';
                this.$store.state.detallesComplementosStore.detalles = item.detalles;
                this.$store.state.detallesComplementosStore.notasCredito = item.notasCredito;
                this.dialogDetalles = true;
            },

            CloseDialogDetalles() {
                this.dialogDetalles = false;
                this.dialogPdf = false;
            },

            async VerComprobante(item) {
                this.OpenDialogLoading();
                try {
                    try {
                        this.$store.state.vistaPreviaStore.folioFiscal = item.folioFiscal;
                        this.$store.state.vistaPreviaStore.color = "19775C"
                        this.$store.state.vistaPreviaStore.tipoComprobanteInterno = "FACTURA"
                        this.$store.state.vistaPreviaStore.tipo = "E"
                        this.$store.state.vistaPreviaStore.rfc = this.token.rfc
                    } catch (error) {
                        console.log(error)
                    }
                    this.dialogPdf = true;
                    this.$q.loading.hide()
                } catch (error) {
                    console.log(error)
                    this.$q.loading.hide()
                }
            },

            OpenDialogLoading() {
                this.$q.loading.show({
                    spinner: QSpinnerCube,
                    spinnerColor: 'red-8',
                    spinnerSize: 140,
                    // backgroundColor: 'purple',
                    message: 'Consultando...',
                    // messageColor: 'black'
                })
            },
            abrirDialogLista69B() {
                this.dialogLista69B = true
            }
        },
    }
</script>

 