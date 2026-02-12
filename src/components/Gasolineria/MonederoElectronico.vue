<template>
    <div class="q-pa-md">
        <!-- SELECCIONA AÑO Y MES, BOTON DE BUSCAR Y EXPORTAR A EXCEL -->
        <div class="row no-wrap items-center q-mt-md q-pa-sm">
            <q-space />

            <q-input v-model="fehaIVentasMasked" label="Fecha Inicial" class="q-mr-sm" name="event" outlined dense>
                <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                    <q-date v-model="fechaIVentas" @input="UltimoDiaMes">
                        <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Ok" color="primary" flat />
                        </div>
                    </q-date>
                </q-popup-proxy>
            </q-input>

            <q-input v-model="fechaFVentasMasked" label="Fecha Final" class="q-mr-xs" outlined dense>
                <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                    <q-date v-model="fechaFVentas">
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
        <!-- TABLA CON RESUMEN DE VENTAS -->
        <q-table title="Reporte" :data="dataResumen" :columns="columnsResumen" row-key="tipoCombustible"
        :rows-per-page-options="[5]" class="my-sticky-column-table" >
            <template v-slot:top>
                <span class="text-body1" content-style="font-size: 20px">Resumen ventas monedero electrónico</span>
            </template>
            <template v-slot:body="props">
                <q-tr :props="props" :class="'clase-total-' + props.row.producto">
                    <q-td key="tipoCombustible" :props="props">{{ props.row.tipoCombustible }}</q-td>
                    <q-td key="nombreCombustible" :props="props">{{ props.row.nombreCombustible }}</q-td>
                    <q-td key="cantidad" :props="props">{{ FormatoCantidad(props.row.cantidad) }}</q-td>
                    <q-td key="importe" :props="props">{{ FormatCurrency(props.row.importe) }}</q-td>
                    <q-td key="iva" :props="props">{{ FormatCurrency(props.row.iva) }}</q-td>
                    <q-td key="total" :props="props">{{ FormatCurrency(props.row.total) }}</q-td>
                </q-tr>
            </template>
        </q-table>
        <!-- TABLA DE VENTAS -->
        <q-table title="Reporte" :data="dataVentas" :columns="columns" row-key="folioFiscal"
            :rows-per-page-options="[4]" class="my-sticky-column-table">
            <template v-slot:top>
                <span class="text-body1" content-style="font-size: 20px">Ventas monedero electrónico</span>
            </template>
            <template v-slot:body="props">
                <q-tr :props="props" :class="'clase-total-' + props.row.producto">
                    <!-- <q-td auto-width>
                        <q-btn size="md" color="primary" rounded flat dense @click="OpenDialogDetalle(props.row)"
                            icon="mdi-format-list-bulleted">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Detalles</q-tooltip>
                        </q-btn>
                    </q-td> -->

                    <q-td key="serie" :props="props">{{ props.row.serie }}</q-td>
                    <q-td key="folio" :props="props">{{ props.row.folio }}</q-td>
                    <q-td key="rfcEmisor" :props="props">{{ props.row.rfcEmisor }}</q-td>
                    <q-td key="nombreEmisor" :props="props">{{ props.row.nombreEmisor }}</q-td>
                    <q-td key="tipoComprobante" :props="props">{{ props.row.tipoComprobante }}</q-td>
                    <q-td key="foliofiscal" :props="props">{{ props.row.foliofiscal }}</q-td>
                    <q-td key="numeroDeCuenta" :props="props">{{ props.row.numeroDeCuenta }}</q-td>
                    <q-td key="tipoOperacion" :props="props">{{ props.row.tipoOperacion }}</q-td>
                    <q-td key="identificador" :props="props">{{ props.row.identificador }}</q-td>
                    <q-td key="fecha" :props="props">{{ props.row.fecha }}</q-td>
                    <q-td key="rfc" :props="props">{{ props.row.rfc }}</q-td>
                    <q-td key="claveEstacion" :props="props">{{ props.row.claveEstacion }}</q-td>
                    <q-td key="tipoCombustible" :props="props">{{ props.row.tipoCombustible }}</q-td>
                    <q-td key="cantidad" :props="props">{{ FormatoCantidad(props.row.cantidad) }}</q-td>
                    <q-td key="nombreCombustible" :props="props">{{ props.row.nombreCombustible }}</q-td>
                    <q-td key="folioOperacion" :props="props">{{ props.row.folioOperacion }}</q-td>
                    <q-td key="valorUnitario" :props="props">{{ FormatCurrency(props.row.valorUnitario) }}</q-td>
                    <q-td key="importe" :props="props">{{ FormatCurrency(props.row.importe) }}</q-td>
                    <q-td key="iva" :props="props">{{ FormatCurrency(props.row.iva) }}</q-td>
                    <q-td key="total" :props="props">{{ FormatCurrency(props.row.total) }}</q-td>
                </q-tr>
            </template>
        </q-table>
    </div>
</template>
<script>
import axios from 'axios'
import moment from 'moment'
import * as xlsx from 'xlsx';
import { format, lastDayOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { QSpinnerCube } from 'quasar';

export default {
    components: {

    },
    data() {
        return {
            columns: [
                // { name: 'actions', align: 'left', label: 'Acciones', field: 'actions' },
                { name: 'serie', align: 'left', label: 'Serie', field: 'serie', sortable: true },
                { name: 'folio', align: 'left', label: 'Folio', field: 'folio', sortable: true },
                { name: 'rfcEmisor', align: 'left', label: 'RFC emisor', field: 'rfcEmisor', sortable: true },
                { name: 'nombreEmisor', align: 'left', label: 'Nombre emisor', field: 'nombreEmisor', sortable: true },
                { name: 'tipoComprobante', align: 'left', label: 'Tipo de comprobante', field: 'tipoComprobante', sortable: true },
                { name: 'foliofiscal', align: 'left', label: 'Folio fiscal', field: 'foliofiscal', sortable: true },
                { name: 'numeroDeCuenta', align: 'left', label: 'Número de cuenta', field: 'numeroDeCuenta', sortable: true },
                { name: 'tipoOperacion', align: 'left', label: 'Tipo de operación', field: 'tipoOperacion', sortable: true },
                { name: 'identificador', align: 'left', label: 'Identificador', field: 'identificador', sortable: true },
                { name: 'fecha', align: 'left', label: 'Fecha', field: 'fecha', sortable: true },
                { name: 'rfc', align: 'left', label: 'RFC', field: 'rfc', sortable: true },
                { name: 'claveEstacion', align: 'left', label: 'Clave de estación', field: 'claveEstacion', sortable: true },
                { name: 'tipoCombustible', align: 'left', label: 'Tipo de combustible', field: 'tipoCombustible', sortable: true },
                { name: 'cantidad', align: 'left', label: 'Cantidad', field: 'cantidad', sortable: true },
                { name: 'nombreCombustible', align: 'left', label: 'Nombre de combustible', field: 'nombreCombustible', sortable: true },
                { name: 'folioOperacion', align: 'left', label: 'Folio de operación', field: 'folioOperacion', sortable: true },
                { name: 'valorUnitario', align: 'right', label: 'Valor unitario', field: 'valorUnitario', sortable: true },
                { name: 'importe', align: 'right', label: 'Importe', field: 'importe', sortable: true },
                { name: 'iva', align: 'right', label: 'IVA', field: 'iva', sortable: true },
                { name: 'total', align: 'right', label: 'Total', field: 'total', sortable: true },
            ],
            dataVentas: [],

            //FECHAS
            fechaIVentas: new Date(),
            fechaFVentas: new Date(),

            //RESUMEN GENERAL
            columnsResumen: [
                { name: 'tipoCombustible', align: 'left', label: 'Tipo de combustible', field: 'tipoCombustible', sortable: true },
                { name: 'nombreCombustible', align: 'left', label: 'Nombre de combustible', field: 'nombreCombustible', sortable: true },
                { name: 'cantidad', align: 'right', label: 'Cantidad', field: 'cantidad', sortable: true },
                { name: 'importe', align: 'right', label: 'Importe', field: 'importe', sortable: true },
                { name: 'iva', align: 'right', label: 'IVA', field: 'iva', sortable: true },
                { name: 'total', align: 'right', label: 'Total', field: 'total', sortable: true },
            ],
            dataResumen: [],
        }
    },
    computed: {
        token() {
            return this.$store.state.usuario;
        },

        fehaIVentasMasked() {
            moment.locale('es-mx');
            return this.fechaIVentas ? moment(this.fechaIVentas).format('DD/MMMM/yyyy') : ''
        },

        fechaFVentasMasked() {
            moment.locale('es-mx');
            return this.fechaFVentas ? moment(this.fechaFVentas).format('DD/MMMM/yyyy') : ''
        },

        rutaAxios() {
            return this.$store.state.rutaMongoStore
        }

    },
    created() {

    },
    methods: {
        async GetReporte() {
            this.dataVentas = [];
            this.$q.loading.show({
                spinner: QSpinnerCube,
                spinnerColor: 'red-8',
                spinnerSize: 140,
                message: 'Consultando datos, espere...',
            });

            try {
                let fI = moment(this.fechaIVentas).format('YYYY-MM-DD')
                let fF = moment(this.fechaFVentas).format('YYYY-MM-DD')
                let response = await axios.get(this.rutaAxios + 'Gasolineros/GetVentasMonederoElectronicoAsync/erp_' + this.token.rfc + '/' + fI + '/' + fF);
                let x = response.data;
                this.dataVentas = [...x]
                // console.log(x)

                this.dataResumen = [];
                this.dataResumen = this.AgrupaPorCombustible(x);
                this.$q.loading.hide()
            } catch (error) {
                console.log(error)
                this.$q.loading.hide()
            }
        },

        FormatCurrency(value) {
            return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        },

        FormatoCantidad(numero) {
            const numeroConDecimales = Number(numero).toFixed(3);
            return numeroConDecimales.replace(/\d(?=(\d{3})+\.)/g, '$&,')
        },

        FormatoMiles(numero) {
            return numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        },

        FormatDate(value) {
            let fecha_ = value.replace('T', ' ')
            let fecha_1 = fecha_.replace('Z', ' ')
            let listo = new Date(fecha_1);
            moment.locale('es-mx');
            return moment(listo).format('DD-MMMM-YYYY HH:mm:ss')
        },

        // ExportExcel() {
        //     let fi_ = new Date(this.fechaIVentas);
        //     let ff_ = new Date(this.fechaFVentas);

        //     let fI = format(fi_, 'dd-MMMM-yyyy', { locale: es })
        //     let fF = format(ff_, 'dd-MMMM-yyyy', { locale: es })

        //     const workbook = XLSX.utils.book_new();

        //     const sheetGeneral = XLSX.utils.json_to_sheet(this.dataResumen);
        //     XLSX.utils.book_append_sheet(workbook, sheetGeneral, 'Ventas');

        //     const sheetOtros = XLSX.utils.json_to_sheet(this.dataVentas);
        //     XLSX.utils.book_append_sheet(workbook, sheetOtros, 'Ventas Det');

        //     XLSX.writeFile(workbook, 'VENTAS MONEDERO ELECTRONICO DEL ' + fI + ' AL ' + fF + '.xlsx');
        // },

        ExportExcel() {
            let reporte = 'REPORTE DE VENTAS DE MONEDERO ELECTRONICO'
            let empresa = this.$store.state.empresaStore.nombre
            let rfc = this.$store.state.empresaStore.rfc

            let fi_ = new Date(this.fechaIVentas);
            let ff_ = new Date(this.fechaFVentas);

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

            const dataExcel = this.dataVentas.map(row => {
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

            xlsx.utils.book_append_sheet(workbook, sheet, "VENTAS");

            xlsx.writeFile(
                workbook,
                rfc + ' - ' + empresa +  ' - REPORTE DE VENTAS DE MONEDERO ELECTRONICO DEL ' + periodo.toUpperCase() + '.xlsx'
            );
            },

        UltimoDiaMes() {
            const fecha = new Date(this.fechaIVentas);

            const ultimoDiaDelMes = lastDayOfMonth(fecha);

            const fechaFormateada = format(ultimoDiaDelMes, 'yyyy-MM-dd');

            // const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
            this.fechaFVentas = fechaFormateada;
        },

        AgrupaPorCombustible(lista){
            var agrupado = lista.reduce(function (acumulador, elemento) {
                // Crear una clave única para el grupo
                var clave = elemento.tipoCombustible

                // Inicializar el grupo si es la primera vez que se encuentra la clave
                if (!acumulador[clave]) {
                    acumulador[clave] = {
                        tipoCombustible: elemento.tipoCombustible,
                        nombreCombustible: elemento.nombreCombustible,
                        cantidad: 0,
                        importe: 0,
                        iva: 0,
                        total: 0,
                    };
                }

                // Sumar base e importe al grupo correspondiente
                acumulador[clave].cantidad += parseFloat(elemento.cantidad);
                acumulador[clave].importe += parseFloat(elemento.importe);
                acumulador[clave].iva += parseFloat(elemento.iva);
                acumulador[clave].total += parseFloat(elemento.total);

                return acumulador;
            }, {});

            // Convertir el objeto agrupado de nuevo a una lista
            var resultado = Object.values(agrupado);

            for (let r of resultado) {
                r.cantidad = r.cantidad.toFixed(3);
                r.importe = r.importe.toFixed(2);
                r.iva = r.iva.toFixed(2);
                r.total = r.total.toFixed(2);
            }
            return resultado;
        },
    },
}
</script>
<style>
.clase-total-Total {
    background: rgb(255, 190, 190);
}
</style>
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