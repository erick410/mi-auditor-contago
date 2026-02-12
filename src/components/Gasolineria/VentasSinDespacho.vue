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

        <!-- TABLA DE VENTAS -->
        <q-table title="Reporte ISR" :data="dataVentas" :columns="columns" row-key="folioFiscal"
            :rows-per-page-options="[4]" class="my-sticky-column-table">
            <template v-slot:top>
                <span class="text-body1" content-style="font-size: 20px">Ventas sin despacho</span>
            </template>
            <template v-slot:body="props">
                <q-tr :props="props" :class="'clase-total-' + props.row.producto">
                    <q-td auto-width>
                        <q-btn size="md" color="primary" rounded flat dense @click="OpenDialogDetalle(props.row)"
                            icon="mdi-format-list-bulleted">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Detalles</q-tooltip>
                        </q-btn>
                    </q-td>

                    <q-td key="noVenta" :props="props">{{ props.row.noVenta }}</q-td>
                    <q-td key="noIdentificacion" :props="props">{{ props.row.noIdentificacion }}</q-td>
                    <q-td key="descripcion" :props="props">{{ props.row.descripcion }}</q-td>
                    <q-td key="cantidad" :props="props">{{ FormatoCantidad(props.row.cantidad) }}</q-td>
                    <q-td key="unidad" :props="props">{{ props.row.unidad }}</q-td>
                    <q-td key="valorUnitario" :props="props">{{ FormatCurrency(props.row.valorUnitario) }}</q-td>
                    <q-td key="descuento" :props="props">{{ FormatCurrency(props.row.descuento) }}</q-td>
                    <q-td key="importe" :props="props">{{ FormatCurrency(props.row.importe) }}</q-td>
                    <q-td key="total" :props="props">{{ FormatCurrency(props.row.total) }}</q-td>
                    <q-td key="claveProdServ" :props="props">{{ props.row.claveProdServ }}</q-td>
                    <q-td key="claveSat" :props="props">{{ props.row.claveSat }}</q-td>
                    <q-td key="claveUnidad" :props="props">{{ props.row.claveUnidad }}</q-td>
                    <q-td key="serie" :props="props">{{ props.row.serie }}</q-td>
                    <q-td key="folio" :props="props">{{ props.row.folio }}</q-td>
                    <q-td key="fecha" :props="props">{{ props.row.fecha }}</q-td>
                    <q-td key="rfc" :props="props">{{ props.row.rfc }}</q-td>
                    <q-td key="nombre" :props="props">{{ props.row.nombre }}</q-td>
                    <q-td key="metodoPago" :props="props">{{ props.row.metodoPago }}</q-td>
                    <q-td key="formaPago" :props="props">{{ props.row.formaPago }}</q-td>
                    <q-td key="folioFiscal" :props="props">{{ props.row.folioFiscal }}</q-td>
                </q-tr>
            </template>
        </q-table>
    </div>
</template>
<script>
import axios from 'axios'
import moment from 'moment'
import * as XLSX from 'xlsx';
import { format, lastDayOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { QSpinnerCube } from 'quasar';

export default {
    components: {

    },
    data() {
        return {
            columns: [
                { name: 'actions', align: 'left', label: 'Acciones', field: 'actions' },
                { name: 'noVenta', align: 'left', label: 'No. Venta', field: 'noVenta', sortable: true },
                { name: 'noIdentificacion', align: 'left', label: 'No. Identificación', field: 'noIdentificacion', sortable: true },
                { name: 'descripcion', align: 'left', label: 'Descripción', field: 'descripcion', sortable: true },
                { name: 'cantidad', align: 'right', label: 'Cantidad', field: 'cantidad', sortable: true },
                { name: 'unidad', align: 'left', label: 'Unidad', field: 'unidad', sortable: true },
                { name: 'valorUnitario', align: 'right', label: 'Valor Unitario', field: 'valorUnitario', sortable: true },
                { name: 'descuento', align: 'right', label: 'Descuento', field: 'descuento', sortable: true },
                { name: 'importe', align: 'right', label: 'Importe', field: 'importe', sortable: true },
                { name: 'total', align: 'right', label: 'Total', field: 'total', sortable: true },
                { name: 'claveProdServ', align: 'left', label: 'Clave Prod. Serv', field: 'claveProdServ', sortable: true },
                { name: 'claveUnidad', align: 'left', label: 'Clave Unidad', field: 'claveUnidad', sortable: true },
                { name: 'serie', align: 'left', label: 'Serie', field: 'serie', sortable: true },
                { name: 'folio', align: 'left', label: 'Folio', field: 'folio', sortable: true },
                { name: 'fecha', align: 'left', label: 'Fecha', field: 'fecha', sortable: true },
                { name: 'rfc', align: 'left', label: 'RFC', field: 'rfc', sortable: true },
                { name: 'nombre', align: 'left', label: 'Nombre', field: 'nombre', sortable: true },
                { name: 'metodoPago', align: 'left', label: 'Método de Pago', field: 'metodoPago', sortable: true },
                { name: 'formaPago', align: 'left', label: 'Forma de Pago', field: 'formaPago', sortable: true },
                { name: 'folioFiscal', align: 'left', label: 'Folio Fiscal', field: 'folioFiscal', sortable: true },
            ],
            dataVentas: [],

            //FECHAS
            fechaIVentas: new Date(),
            fechaFVentas: new Date(),
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
                let response = await axios.get(this.rutaAxios + 'Gasolineros/GetVentasSinDespachoAsync/erp_' + this.token.rfc + '/' + fI + '/' + fF);
                let x = response.data;
                this.dataVentas = [...x]
                this.$q.loading.hide()
            } catch (error) {
                conseol.log(error)
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

        // FALTA
        ExportExcel() {
            let empresa = this.$store.state.empresaStore.nombre
            let rfc = this.$store.state.empresaStore.rfc
            let fi_ = new Date(this.fechaIVentas);
            let ff_ = new Date(this.fechaFVentas);

            let fI = format(fi_, 'dd-MMMM-yyyy', { locale: es })
            let fF = format(ff_, 'dd-MMMM-yyyy', { locale: es })

            const workbook = XLSX.utils.book_new();

            const sheetOtros = XLSX.utils.json_to_sheet(this.dataVentas);
            XLSX.utils.book_append_sheet(workbook, sheetOtros, 'CXC');

            XLSX.writeFile(workbook,    rfc + ' - ' + empresa +  ' - VENTAS DEL ' + fI + ' AL ' + fF + '.xlsx');
        },

        UltimoDiaMes() {
            const fecha = new Date(this.fechaIVentas);

            const ultimoDiaDelMes = lastDayOfMonth(fecha);

            const fechaFormateada = format(ultimoDiaDelMes, 'yyyy-MM-dd');

            // const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
            this.fechaFVentas = fechaFormateada;
        },

        OpenDialogLoading() {
            this.$q.loading.show({
                spinner: QSpinnerCube,
                spinnerColor: 'red-8',
                spinnerSize: 140,
                message: 'Consultando datos, espere...',
            })
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