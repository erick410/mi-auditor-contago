<template>
    <div class="q-pa-md">
        <!-- DIALG DE LOS DETALLES -->
        <q-dialog v-model="dialogDetalles" transition-show="scale" transition-hide="scale" maximized>
            <!-- SELECCIONA AÑO Y MES, BOTON DE BUSCAR Y EXPORTAR A EXCEL -->
            <q-card flat>
                <q-card-section>
                    <div class="row no-wrap items-center q-mt-md q-pa-sm">
                        <q-btn push color="red-14" icon="mdi-close" rounded flat size="18px" padding="xs" v-close-popup>
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                                :offset="[10, 10]">Cerrar</q-tooltip>
                        </q-btn>
                        <q-space />
                        <div class="text-h5">{{ tipoReporte }}</div>
                        <q-space />
                        <q-btn push color="green-10" @click="ExportExcelDetalles" icon="mdi-file-excel-box-outline" rounded flat
                            size="18px" padding="xs">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                                :offset="[10, 10]">Exportar Excel</q-tooltip>
                        </q-btn>
                    </div>
                    <div class="row no-wrap justify-center">
                    <q-chip color="primary" text-color="white">
                        {{ 'Suma Parcial: ' + formatCurrency(sumaSeleccionado) }}
                    </q-chip>
                </div>
                </q-card-section>
                <q-table  selection="multiple" :selected.sync="itemsSeleccion" title="Comprobantes" :data="itemDetalles" :columns="columnsDetalles" row-key="folioFiscal"
                    :rows-per-page-options="[10]" class="my-sticky-column-table" :filter="filterDetalles">
                    <template v-slot:top>
                        <!-- <span class="text-body1" content-style="font-size: 20px">Reporte por uso de CFDI {{FormatCurrency(sumaFinal)}}</span> -->
                        <q-space />
                        <q-input borderless dense debounce="300" v-model="filterDetalles" placeholder="Filtrar">
                            <template v-slot:append>
                                <q-icon name="search" />
                            </template>
                        </q-input>
                    </template>
                    <template v-slot:body="props">
                        <q-tr :props="props">
                            <q-td key="uso" :props="props">{{ props.row.uso }}</q-td>
                            <q-td auto-width>
                        <q-checkbox v-model="props.selected" />

                                <q-btn size="md" color="primary" rounded flat dense @click="OpenDialogComprobante(props.row)"
                                    icon="mdi-file-pdf-box">
                                    <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                        content-style="font-size: 14px" :offset="[10, 10]">PDF</q-tooltip>
                                </q-btn>
                            </q-td>
                            <q-td key="folioFiscal" :props="props">{{ props.row.folioFiscal }}</q-td>
                            <q-td key="serie" :props="props">{{ props.row.serie }}</q-td>
                            <q-td key="folio" :props="props">{{ props.row.folio }}</q-td>
                            <q-td key="fecha" :props="props">{{ props.row.fecha }}</q-td>
                            <q-td key="rfc" :props="props">{{ props.row.rfc }}</q-td>
                            <q-td key="nombre" :props="props">{{ props.row.nombre }}</q-td>
                            <q-td key="subTotal" :props="props">{{ FormatCurrency(props.row.subTotal) }}</q-td>
                            <q-td key="descuento" :props="props">{{ FormatCurrency(props.row.descuento) }}</q-td>
                            <q-td key="total" :props="props">{{ FormatCurrency(props.row.total) }}</q-td>
                            <q-td key="moneda" :props="props">{{ props.row.moneda }}</q-td>
                            <q-td key="tipoCambio" :props="props">{{ FormatCurrency(props.row.tipoCambio) }}</q-td>
                            <q-td key="claveProdServ" :props="props">{{ props.row.claveProdServ }}</q-td>
                            <q-td key="descripcion" :props="props">{{ props.row.descripcion }}</q-td>
                        </q-tr>
                    </template>
                    <template v-slot:bottom-row>
                <q-tr>
                    <q-td colspan="100%" class="text-center">
                        <q-chip color="primary" text-color="white">
                            {{ 'Subtotal: ' + formatCurrency(sumaSubtotal) }}
                        </q-chip>
                        <q-chip color="primary" text-color="white">
                            {{ 'Descuento: ' + formatCurrency(sumaDescuento) }}
                        </q-chip>
                        <q-chip color="primary" text-color="white">
                            {{ 'Total: ' + formatCurrency(sumaTotal) }}
                        </q-chip>
                    </q-td>
                </q-tr>
            </template>
                </q-table>

            </q-card>
        </q-dialog>

        <!-- DIALOG PARA VER LOS PDF -->
        <q-dialog v-model="dialogComprobante" persistent transition-show="scale" transition-hide="scale" maximized>
            <visor-pdf @CloseDialogPdf="CloseDialogPdf"></visor-pdf>
        </q-dialog>

        <!-- SELECCIONA AÑO Y MES, BOTON DE BUSCAR Y EXPORTAR A EXCEL -->
        <div class="row no-wrap items-center q-mt-md q-pa-sm">
            <q-space />
            <!-- FECHA INICIAL -->
            <q-input v-model="fehaIMasked" label="Fecha Inicial" class="q-mr-sm" name="event" outlined dense>
                <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                    <q-date v-model="fechaI" @input="UltimoDiaMes">
                        <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Ok" color="primary" flat />
                        </div>
                    </q-date>
                </q-popup-proxy>
            </q-input>
            <!-- FECHA FINAL -->
            <q-input v-model="fechaFMasked" label="Fecha Final" class="q-mr-xs" outlined dense>
                <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                    <q-date v-model="fechaF">
                        <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Ok" color="primary" flat />
                        </div>
                    </q-date>
                </q-popup-proxy>
            </q-input>
            <!-- BOTON CONSULTAR -->
            <q-btn push color="amber-9" @click="GetReporte" icon="mdi-text-box-search-outline" rounded flat size="18px"
                padding="xs">
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                    :offset="[10, 10]">Consultar</q-tooltip>
            </q-btn>
            <!-- BOTON  DE EXPORTAR EXCEL -->
            <q-btn push color="green-10" @click="ExportExcel" icon="mdi-file-excel-box-outline" rounded flat size="18px"
                padding="xs">
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                    :offset="[10, 10]">Exportar Excel</q-tooltip>
            </q-btn>
            <q-space />
        </div>
        <!-- TABLA CON EL REPORTE -->
        <q-table title="Reporte ISR" :data="itemsReporte" :columns="columns" row-key="uso"
            :rows-per-page-options="[0]" class="my-sticky-column-table" :filter="filter">
            <template v-slot:top>
                <span class="text-body1" content-style="font-size: 20px">Reporte por uso de CFDI {{FormatCurrency(sumaFinal)}}</span>
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
                    <q-td key="uso" :props="props">{{ props.row.uso }}</q-td>
                    <q-td key="emitidos" :props="props">{{ FormatCurrency(props.row.emitidos) }}</q-td>
                    <q-td auto-width>
                        <q-btn size="md" color="primary" rounded flat dense @click="OpenDetalleE(props.row)"
                            icon="mdi-format-list-bulleted">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Detalles</q-tooltip>
                        </q-btn>
                    </q-td>
                    <q-td key="recibidos" :props="props">{{ FormatCurrency(props.row.recibidos) }}</q-td>
                    <q-td auto-width>
                        <q-btn size="md" color="primary" rounded flat dense @click="OpenDetalleR(props.row)"
                            icon="mdi-format-list-bulleted">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Detalles</q-tooltip>
                        </q-btn>
                    </q-td>
                    <q-td key="nomina" :props="props">{{ FormatCurrency(props.row.nomina) }}</q-td>
                    <q-td auto-width>
                        <q-btn size="md" color="primary" rounded flat dense @click="OpenDetalleN(props.row)"
                            icon="mdi-format-list-bulleted">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Detalles</q-tooltip>
                        </q-btn>
                    </q-td>
                </q-tr>
            </template>
            
        </q-table>
    </div>
</template>
<script>
import { QSpinnerCube } from 'quasar'
import axios from 'axios'
import moment from 'moment'
import * as xlsx from 'xlsx';
import { format, lastDayOfMonth, differenceInDays, parseISO, utcToZonedTime } from 'date-fns';
import { es } from 'date-fns/locale';
import visorPdf from '../Pdf/VisorPdf.vue'
import { generarCodigoQR } from '../Pdf/qrcodeGenerator';
import { ComprobanteNominaBase64 } from '../Pdf/ComprobanteNominaBase64.js'
import { ComprobanteBase64 } from '../Pdf/ComprobanteBase64.js'


export default {
    components: {
        visorPdf
    },
    data (){
        return {
            columns: [
                { name: 'uso', align: 'left', label: 'Uso del CFDI', field: 'uso', sortable: true },
                { name: 'emitidos', align: 'right', label: 'Emitidos', field: 'emitidos', sortable: true },
                { name: 'actionsE', align: 'left', label: 'Detalles emitidos', field: 'actionsE' },
                { name: 'recibidos', align: 'right', label: 'Recibidos', field: 'recibidos', sortable: true },
                { name: 'actionsR', align: 'left', label: 'Detalles recibidos', field: 'actionsR' },
                { name: 'nomina', align: 'right', label: 'Nómina', field: 'nomina', sortable: true },
                { name: 'actionsN', align: 'left', label: 'Detalles nómina', field: 'actionsN' },
            ],

            itemsReporte: [],

            //FECHAS
            fechaI: new Date(),
            fechaF: new Date(),

            filter: "",

            sumaFinal: 0,

            //DETALLES
            tipoReporte: '',
            dialogDetalles: false,
            itemDetalles: [],
            columnsDetalles: [
            // { name: 'actions', align: 'left', label: 'Acciones', field: 'actions' },
            { name: 'folioFiscal', align: 'left', label: 'Folio fiscal', field: 'folioFiscal', sortable: true },
            { name: 'serie', align: 'left', label: 'Serie', field: 'serie', sortable: true },
            { name: 'folio', align: 'left', label: 'Folio', field: 'folio', sortable: true },
            { name: 'fecha', align: 'left', label: 'Fecha', field: 'fecha', sortable: true },
            { name: 'rfc', align: 'left', label: 'RFC', field: 'rfc', sortable: true },
            { name: 'nombre', align: 'left', label: 'Nombre', field: 'nombre', sortable: true },
            { name: 'subTotal', align: 'right', label: 'Subtotal', field: 'subTotal', sortable: true },
            { name: 'descuento', align: 'right', label: 'Descuento', field: 'descuento', sortable: true },
            { name: 'total', align: 'right', label: 'Total', field: 'total', sortable: true },
            { name: 'moneda', align: 'left', label: 'Moneda', field: 'moneda', sortable: true },
            { name: 'tipoCambio', align: 'right', label: 'Tipo de cambio', field: 'tipoCambio', sortable: true },
            { name: 'claveProdServ', align: 'right', label: 'Clave prod. serv.', field: 'claveProdServ', sortable: true },
            { name: 'descripcion', align: 'right', label: 'Descripción', field: 'descripcion', sortable: true },
            ],
            filterDetalles: '',
            dialogComprobante: false,
                itemsSeleccion: [],
                usoCfdiItem:'',
        }
    },
    computed:{
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
        },

        sumaTotal() {
                return this.itemDetalles.reduce((acumulador, objeto) => acumulador + objeto.total, 0);
            },
        
        sumaDescuento() {
            return this.itemDetalles.reduce((acumulador, objeto) => acumulador + objeto.descuento, 0);
        },
        
        sumaSubtotal() {
            return this.itemDetalles.reduce((acumulador, objeto) => acumulador + objeto.subTotal, 0);
        },
        
        sumaSeleccionado() {
                return this.itemsSeleccion.reduce((acumulador, objeto) => acumulador + objeto.total, 0);
            }
    },
    created(){

    },
    methods:{
        async GetReporte() {
            this.itemsReporte = [];
            this.sumaFinal = 0;
            this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'red-8', spinnerSize: 140, message: 'Consultando Emitidos...' })
            const ingresos = await this.GetIngresos();
            this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'red-8', spinnerSize: 140, message: 'Consultando Recibidos...' })
            const gastos = await this.GetGastos();
            this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'red-8', spinnerSize: 140, message: 'Consultando Nómina...' })
            const nomina = await this.GetNomina();

            const unicos = await this.ObtieneUsoCfdi(ingresos, gastos, nomina);

            //CREAMOS EL CONTENIDO DE LA TABLA
            unicos.forEach(e => {
                let objIngreso = ingresos.find(f => f.usoCfdi === e);
                let objGasto = gastos.find(f => f.usoCfdi === e);
                let objNomina = nomina.find(f => f.usoCfdi === e);

                let ingresoTotal = 0;
                let detallesE = [];
                if(objIngreso){
                    // ingresoTotal = objIngreso.total;
                    ingresoTotal = objIngreso.subTotal;
                    // ingresoTotal = objIngreso.subTotal - objIngreso.descuento;
                    detallesE = objIngreso.detalles;
                }

                let gastoTotal = 0;
                let detallesR = [];
                if(objGasto){
                    // gastoTotal = objGasto.total;
                    gastoTotal = objGasto.subTotal;
                    // gastoTotal = objGasto.subTotal - objGasto.descuento;
                    detallesR = objGasto.detalles;
                }

                let nominaTotal = 0;
                let detallesN = [];
                if(objNomina){
                    // nominaTotal = objNomina.total;
                    nominaTotal = objNomina.subTotal - objNomina.descuento;
                    detallesN = objNomina.detalles;
                }
                 
                let objNuevo = {
                    uso: e,
                    emitidos: ingresoTotal,
                    detallesE: detallesE,
                    recibidos: gastoTotal,
                    detallesR: detallesR,
                    nomina: nominaTotal,
                    detallesN: detallesN,
                }
                this.itemsReporte.push(objNuevo);
            });

            //AGREGAMOS LOS TOTALES
            let sumaEmitidos = this.itemsReporte.reduce((acumulador, objeto) => acumulador + objeto.emitidos, 0);
            let sumaRecibidos = this.itemsReporte.reduce((acumulador, objeto) => acumulador + objeto.recibidos, 0);
            let sumaNomina = this.itemsReporte.reduce((acumulador, objeto) => acumulador + objeto.nomina, 0);

            let objTotales = {
                uso: 'Suma',
                emitidos: sumaEmitidos,
                recibidos: sumaRecibidos,
                nomina: sumaNomina,
            }

            this.sumaFinal = sumaEmitidos- sumaRecibidos-sumaNomina;

            this.itemsReporte.push(objTotales);
            console.log(this.itemsReporte)
            this.$q.loading.hide()
        },

        async GetIngresos(){
            try{
                let fI = moment(this.fechaI).format('YYYY-MM-DD')
                let fF = moment(this.fechaF).format('YYYY-MM-DD')  

                let response = await axios.get(this.rutaAxios + 'Consultas/GetReporteUsoCfdiIngresosAsync/erp_' + this.token.rfc + '/' + fI + '/' + fF);
                return response.data
            }catch(error){
                console.log(error);
            }
        },

        async GetGastos(){
            try{
                let fI = moment(this.fechaI).format('YYYY-MM-DD')
                let fF = moment(this.fechaF).format('YYYY-MM-DD')
                let response = await axios.get(this.rutaAxios + 'Consultas/GetReporteUsoCfdiGastosAsync/erp_' + this.token.rfc + '/' + fI + '/' + fF);
                return response.data
            }catch(error){
                console.log(error);
            }
        },

        async GetNomina(){
            try{
                let fI = moment(this.fechaI).format('YYYY-MM-DD')
                let fF = moment(this.fechaF).format('YYYY-MM-DD')
                let response = await axios.get(this.rutaAxios + 'Consultas/GetReporteUsoCfdiNomina/erp_' + this.token.rfc + '/' + fI + '/' + fF);
                return response.data;
            }catch(error){
                console.log(error);
            }
        },

        async ObtieneUsoCfdi(...listas){
            console.log(listas)
            const usoUnicos = new Set();
            listas.forEach(lista => {
                lista.forEach(objeto => {
                    usoUnicos.add(objeto.usoCfdi);
                });
            });
            return Array.from(usoUnicos);
        },

        FormatCurrency(value) {
            return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        },

        formatCurrency(value) {
            return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        },

        // ExportExcel() {
        //     let fi_ = new Date(this.fechaI);  
        //     let ff_ = new Date(this.fechaF);

        //     let fI = format(fi_, 'dd-MMMM-yyyy', { locale: es })
        //     let fF = format(ff_, 'dd-MMMM-yyyy', { locale: es })

        //     const workbook = XLSX.utils.book_new();

        //     const sheetOtros = XLSX.utils.json_to_sheet(this.itemsReporte);
        //     XLSX.utils.book_append_sheet(workbook, sheetOtros, 'USO CFDI');

        //     XLSX.writeFile(workbook, 'USO DE CFDI DEL ' + fI + ' AL ' + fF + '.xlsx');
        // },

        ExportExcel() {
            let reporte = 'REPORTE USO DE CFDI'
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

            const dataExcel = this.itemsReporte.map(row => {
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

            xlsx.utils.book_append_sheet(workbook, sheet, "CFDI");

            xlsx.writeFile(
                workbook,
                rfc + ' - ' + empresa +  ' - REPORTE USO DE CFDI DEL ' + periodo.toUpperCase() + '.xlsx'
            );
            },

        ExportExcelDetalles() {
            let fi_ = new Date(this.fechaI);
            let ff_ = new Date(this.fechaF);

            let fI = format(fi_, 'dd-MMMM-yyyy', { locale: es })
            let fF = format(ff_, 'dd-MMMM-yyyy', { locale: es })

            const workbook = XLSX.utils.book_new();

            const sheetOtros = XLSX.utils.json_to_sheet(this.itemDetalles);
            XLSX.utils.book_append_sheet(workbook, sheetOtros, 'USO CFDI');

            XLSX.writeFile(workbook,this.tipoReporte +  ' - '+ this.usoCfdiItem + ' DEL ' + fI + ' AL ' + fF + '.xlsx');
        },

        ExportExcelDetalles() {
            let reporte = this.tipoReporte.toUpperCase() +  ' - '+ this.usoCfdiItem.toUpperCase()
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

            const columnasExcel = this.columnsDetalles.filter(
                col => col.name !== "actions"
            );

            const dataExcel = this.itemDetalles.map(row => {
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
                rfc + ' - ' + empresa +  ' - ' + reporte + ' - DEL' + periodo.toUpperCase() + '.xlsx'
            );
            },
        UltimoDiaMes() {
            const fecha = new Date(this.fechaI);

            const ultimoDiaDelMes = lastDayOfMonth(fecha);

            const fechaFormateada = format(ultimoDiaDelMes, 'yyyy-MM-dd');

            // const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
            this.fechaF = fechaFormateada;
        },

        OpenDetalleE(item){
            let detalle = item.detallesE;
            this.itemDetalles = [];
            this.tipoReporte = 'EMITIDOS';
            this.usoCfdiItem = item.uso
            this.itemDetalles = [ ...detalle ];
            this.dialogDetalles = true;
        },

        OpenDetalleR(item){
            let detalle = item.detallesR;
            this.itemDetalles = [];
            this.usoCfdiItem = item.uso
            this.tipoReporte = 'RECIBIDOS';
            this.itemDetalles = [ ...detalle ];
            this.dialogDetalles = true;
        },

        OpenDetalleN(item){
            let detalle = item.detallesN;
            this.itemDetalles = [];
            this.usoCfdiItem = item.uso
            this.tipoReporte = 'NÓMINA';
            this.itemDetalles = [ ...detalle ];
            this.dialogDetalles = true;
        },    
        
        async OpenDialogComprobante(item){
            let tipo = this.tipoReporte;
            if(tipo === 'EMITIDOS'){
                await this.VerComprobanteE(item.folioFiscal);
            }else if(tipo === 'RECIBIDOS'){
                await this.VerComprobanteR(item.folioFiscal);                
            }else if(tipo === 'NÓMINA'){
                await this.VerComprobanteN(item.folioFiscal);
            }
        },

        CloseDialogPdf() {
            this.dialogComprobante = false;
        },
    
        async VerComprobanteE(item) {
            console.log(item);
            try {
                this.$store.state.vistaPreviaStore.folioFiscal = item;
                this.$store.state.vistaPreviaStore.color = "19775C"
                this.$store.state.vistaPreviaStore.tipoComprobanteInterno = "FACTURA"
                this.$store.state.vistaPreviaStore.tipo = "E"
                this.$store.state.vistaPreviaStore.rfc = this.token.rfc
                this.dialogComprobante = true;
            } catch (error) {
                console.log(error)
            }
        },

        async VerComprobanteR(item) {
            try {
                this.$store.state.vistaPreviaStore.folioFiscal = item;
                this.$store.state.vistaPreviaStore.color = "19775C"
                this.$store.state.vistaPreviaStore.tipoComprobanteInterno = "FACTURA"
                this.$store.state.vistaPreviaStore.tipo = "R"
                this.$store.state.vistaPreviaStore.rfc = this.token.rfc
                this.dialogComprobante = true;
            } catch (error) {
                console.log(error)
            }
        },

        async VerComprobanteN(item) {
            try {
                let response = await axios.get(this.rutaAxios + 'Comprobante/GetComprobanteNominaAsync/erp_' + this.token.rfc + '/' + item);
                let x = response.data;
                console.log(x);
                let color = "#" + '00A35C';

                let extraQr = x.timbreFiscalDigital.selloCFD.slice(-8);
                let cadenaOriginal = '||1.1|' + x.folioFiscal + '|' + x.timbreFiscalDigital.fechaTimbrado + '|' + x.timbreFiscalDigital.rfcProvCertif + '|' + x.timbreFiscalDigital.selloCFD + '|' + x.timbreFiscalDigital.noCertificadoSAT + '||'
                x.timbreFiscalDigital.cadenaOriginal = cadenaOriginal;
                let codigoQR = await generarCodigoQR(x.folioFiscal, x.emisor.rfc, x.receptor.rfc, x.total, extraQr);

                let base64 = await ComprobanteNominaBase64(x, x.tipoComprobanteInterno, x.estatus, color, codigoQR);

                this.$store.state.comprobanteStore.nombre = x.folioFiscal;
                this.$store.state.comprobanteStore.base64 = base64.split(',')[1];
                this.$store.state.comprobanteStore.fecha = x.fecha;

                // console.log(this.$store.state.comprobanteStore)
                this.dialogComprobante = true;
            } catch (error) {
                console.log(error)
            }
        },
    },
}
</script>