<template>
    <div class="q-pa-md">
        <!-- DETALLES DE LA VENTAS -->
        <q-dialog v-model="dialogDetallesV" transition-show="scale" transition-hide="scale" maximized>
            <detalles-v></detalles-v>
        </q-dialog>

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

            <q-select v-model="selectPermisoCre" label="NO. CRE" :options="optionsPermisoCre" style="width: 250px" dense
                outlined>
                <template v-slot:no-option>
                    <q-item>
                        <q-item-section class="text-grey">
                            Seleccione el No. de la CRE
                        </q-item-section>
                    </q-item>
                </template>
            </q-select>

            <q-btn push color="amber-9" @click="GetReporte" icon="mdi-text-box-search-outline" rounded flat size="18px"
                padding="xs">
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                    :offset="[10, 10]">Consultar</q-tooltip>
            </q-btn>
            <q-btn push color="green-10" @click="ExportExcel('ventas')" icon="mdi-file-excel-box-outline" rounded flat
                size="18px" padding="xs">
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                    :offset="[10, 10]">Exportar Excel</q-tooltip>
            </q-btn>
            <q-space />
        </div>

        <!-- TABLA DE VENTAS -->
        <q-table title="Reporte ISR" :data="dataVentas" :columns="columns" row-key="folioFiscal"
            :rows-per-page-options="[4]" class="my-sticky-column-table" hide-bottom dense>
            <template v-slot:top>
                <span class="text-body1" content-style="font-size: 20px">Ventas</span>
            </template>
            <template v-slot:body="props">
                <q-tr :props="props" :class="'clase-total-' + props.row.producto">
                    <q-td auto-width>
                        <q-btn size="md" color="primary" rounded flat dense @click="OpenDialogDetalleV(props.row)"
                            icon="mdi-format-list-bulleted">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Detalles</q-tooltip>
                        </q-btn>
                    </q-td>

                    <q-td key="producto" :props="props">{{ props.row.producto }}</q-td>
                    <q-td key="cantidad" :props="props">{{ FormatoCantidad(props.row.cantidad) }}</q-td>
                    <q-td key="subTotal" :props="props">{{ FormatCurrency(props.row.subTotal) }}</q-td>
                    <!-- <q-td key="descuento" :props="props">{{ FormatCurrency(props.row.descuento) }}</q-td> -->
                    <q-td key="iva" :props="props">{{ FormatCurrency(props.row.iva) }}</q-td>
                    <q-td key="ieps" :props="props">{{ FormatCurrency(props.row.ieps) }}</q-td>
                    <q-td key="total" :props="props">{{ FormatCurrency(props.row.total) }}</q-td>
                    <q-td key="ventas" :props="props">{{ FormatoMiles(props.row.ventas) }}</q-td>
                    <q-td key="comprobantes" :props="props">{{ FormatoMiles(props.row.comprobantes) }}</q-td>
                </q-tr>
            </template>
        </q-table>

        <!-- SELECCIONA AÑO Y MES, BOTON DE BUSCAR Y EXPORTAR A EXCEL -->
        <div class="row no-wrap items-center q-mt-md q-pa-sm">
            <q-space />

            <q-input v-model="fehaIComprasMasked" label="Fecha Inicial" class="q-mr-sm" name="event" outlined dense>
                <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                    <q-date v-model="fechaICompras" @input="UltimoDiaMesCompras">
                        <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Ok" color="primary" flat />
                        </div>
                    </q-date>
                </q-popup-proxy>
            </q-input>

            <q-input v-model="fechaFComprasMasked" label="Fecha Final" class="q-mr-xs" outlined dense>
                <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                    <q-date v-model="fechaFCompras">
                        <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Ok" color="primary" flat />
                        </div>
                    </q-date>
                </q-popup-proxy>
            </q-input>

            <q-btn push color="amber-9" @click="GetReporteComprasTodos" icon="mdi-text-box-search-outline" rounded flat
                size="18px" padding="xs">
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                    :offset="[10, 10]">Consultar</q-tooltip>
            </q-btn>
            <q-btn push color="green-10" @click="ExportExcel('compras')" icon="mdi-file-excel-box-outline" rounded flat
                size="18px" padding="xs">
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                    :offset="[10, 10]">Exportar Excel</q-tooltip>
            </q-btn>
            <q-space />
        </div>

        <!-- TABLA DE COMPRAS -->
        <q-table title="Reporte ISR" :data="dataCompras" :columns="columnsCompras" row-key="folioFiscal"
            :rows-per-page-options="[4]" class="my-sticky-column-table" hide-bottom dense>
            <template v-slot:top>
                <span class="text-body1" content-style="font-size: 20px">Compras</span>
            </template>
            <template v-slot:body="props">
                <q-tr :props="props" :class="'clase-total-' + props.row.producto">
                    <q-td auto-width>
                        <q-btn size="md" color="primary" rounded flat dense @click="OpenDialogDetalleC(props.row)"
                            icon="mdi-format-list-bulleted">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Detalles</q-tooltip>
                        </q-btn>
                    </q-td>

                    <q-td key="producto" :props="props">{{ props.row.producto }}</q-td>
                    <q-td key="cantidad" :props="props">{{ FormatoCantidad(props.row.cantidad) }}</q-td>
                    <q-td key="subTotal" :props="props">{{ FormatCurrency(props.row.subTotal) }}</q-td>
                    <!-- <q-td key="descuento" :props="props">{{ FormatCurrency(props.row.descuento) }}</q-td> -->
                    <q-td key="iva" :props="props">{{ FormatCurrency(props.row.iva) }}</q-td>
                    <q-td key="ieps" :props="props">{{ FormatCurrency(props.row.ieps) }}</q-td>
                    <q-td key="total" :props="props">{{ FormatCurrency(props.row.total) }}</q-td>
                    <q-td key="ventas" :props="props">{{ FormatoMiles(props.row.ventas) }}</q-td>
                    <q-td key="comprobantes" :props="props">{{ FormatoMiles(props.row.comprobantes) }}</q-td>
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
import DetallesV from './VentasYComprasGasolineriaDet.vue'

export default {
    components: {
        DetallesV,
    },
    data() {
        return {
            columns: [
                { name: 'actions', align: 'left', label: 'Acciones', field: 'actions' },
                { name: 'producto', align: 'left', label: 'Producto', field: 'producto', sortable: true },
                { name: 'cantidad', align: 'right', label: 'Cantidad', field: 'cantidad', sortable: true },
                { name: 'subTotal', align: 'right', label: 'subTotal', field: 'subTotal', sortable: true },
                // { name: 'descuento', align: 'right', label: 'Descuento', field: 'descuento', sortable: true },
                { name: 'iva', align: 'right', label: 'IVA', field: 'iva', sortable: true },
                { name: 'ieps', align: 'right', label: 'IEPS', field: 'ieps', sortable: true },
                { name: 'total', align: 'right', label: 'Total', field: 'total', sortable: true },
                { name: 'ventas', align: 'left', label: '# Ventas', field: 'ventas', sortable: true },
                { name: 'comprobantes', align: 'left', label: '# Comprobantes', field: 'comprobantes', sortable: true },
            ],

            columnsCompras: [
                { name: 'actions', align: 'left', label: 'Acciones', field: 'actions' },
                { name: 'producto', align: 'left', label: 'Producto', field: 'producto', sortable: true },
                { name: 'cantidad', align: 'right', label: 'Cantidad', field: 'cantidad', sortable: true },
                { name: 'subTotal', align: 'right', label: 'subTotal', field: 'subTotal', sortable: true },
                // { name: 'descuento', align: 'right', label: 'Descuento', field: 'descuento', sortable: true },
                { name: 'iva', align: 'right', label: 'IVA', field: 'iva', sortable: true },
                { name: 'ieps', align: 'right', label: 'IEPS', field: 'ieps', sortable: true },
                { name: 'total', align: 'right', label: 'Total', field: 'total', sortable: true },
                { name: 'ventas', align: 'left', label: '# Compras', field: 'ventas', sortable: true },
                { name: 'comprobantes', align: 'left', label: '# Comprobantes', field: 'comprobantes', sortable: true },
            ],

            dataVentas: [],
            dataCompras: [],

            //FECHAS
            fechaIVentas: new Date(),
            fechaFVentas: new Date(),
            fechaICompras: new Date(),
            fechaFCompras: new Date(),

            //NO DE PERMISO DE LA CRE
            selectPermisoCre: 'Todos',
            optionsPermisoCre: [],

            //DETALLES
            dialogDetallesV: false,
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

        fehaIComprasMasked() {
            moment.locale('es-mx');
            return this.fechaICompras ? moment(this.fechaICompras).format('DD/MMMM/yyyy') : ''
        },

        fechaFComprasMasked() {
            moment.locale('es-mx');
            return this.fechaFCompras ? moment(this.fechaFCompras).format('DD/MMMM/yyyy') : ''
        },

        rutaAxios() {
            return this.$store.state.rutaMongoStore
        }

    },
    created() {
        this.GetPermisoCre();
    },
    methods: {
        async GetReporte() {
            if (this.selectPermisoCre === 'Todos') {
                await this.GetReporteTodos();
            } else {
                await this.GetReportePorSucursal();
            }
        },

        async GetReporteTodos() {
            this.dataVentas = []
            this.OpenDialogLoading()
            let fI = moment(this.fechaIVentas).format('YYYY-MM-DD')
            let fF = moment(this.fechaFVentas).format('YYYY-MM-DD')
            try {
                let response = await axios.get(this.rutaAxios + 'Gasolineros/GetVentasGasolinasAsync/erp_' + this.token.rfc + '/' + fI + '/' + fF);
                let x = response.data;
                this.dataVentas = [...x]

                //VAMOS A CALCULAR LOS TOTALES
                let objetoTotales = {
                    detalles: [],
                    producto: 'Total',
                    cantidad: this.dataVentas.reduce((acumulador, objeto) => acumulador + objeto.cantidad, 0),
                    subTotal: this.dataVentas.reduce((acumulador, objeto) => acumulador + objeto.subTotal, 0),
                    descuento: this.dataVentas.reduce((acumulador, objeto) => acumulador + objeto.descuento, 0),
                    iva: this.dataVentas.reduce((acumulador, objeto) => acumulador + objeto.iva, 0),
                    ieps: this.dataVentas.reduce((acumulador, objeto) => acumulador + objeto.ieps, 0),
                    total: this.dataVentas.reduce((acumulador, objeto) => acumulador + objeto.total, 0),
                    ventas: this.dataVentas.reduce((acumulador, objeto) => acumulador + objeto.ventas, 0),
                    comprobantes: this.dataVentas.reduce((acumulador, objeto) => acumulador + objeto.comprobantes, 0),
                }
                this.dataVentas.push(objetoTotales);
                this.$q.loading.hide()
            } catch (error) {
                console.log(error)
                this.$q.loading.hide()
            }
        },

        async GetReportePorSucursal() {
            this.OpenDialogLoading()
            let fI = moment(this.fechaIVentas).format('YYYY-MM-DD')
            let fF = moment(this.fechaFVentas).format('YYYY-MM-DD')

            let permiso = this.selectPermisoCre.replaceAll('/', '-');
            try {
                let response = await axios.get(this.rutaAxios + 'Gasolineros/GetVentasGasolinasSucursalAsync/erp_' + this.token.rfc + '/' + permiso + '/' + fI + '/' + fF);
                let x = response.data;
                this.dataVentas = [...x]

                //VAMOS A CALCULAR LOS TOTALES
                let objetoTotales = {
                    detalles: [],
                    producto: 'Total',
                    cantidad: this.dataVentas.reduce((acumulador, objeto) => acumulador + objeto.cantidad, 0),
                    subTotal: this.dataVentas.reduce((acumulador, objeto) => acumulador + objeto.subTotal, 0),
                    descuento: this.dataVentas.reduce((acumulador, objeto) => acumulador + objeto.descuento, 0),
                    iva: this.dataVentas.reduce((acumulador, objeto) => acumulador + objeto.iva, 0),
                    ieps: this.dataVentas.reduce((acumulador, objeto) => acumulador + objeto.ieps, 0),
                    total: this.dataVentas.reduce((acumulador, objeto) => acumulador + objeto.total, 0),
                    ventas: this.dataVentas.reduce((acumulador, objeto) => acumulador + objeto.ventas, 0),
                    comprobantes: this.dataVentas.reduce((acumulador, objeto) => acumulador + objeto.comprobantes, 0),
                }
                this.dataVentas.push(objetoTotales);
                this.$q.loading.hide()
            } catch (error) {
                console.log(error)
                this.$q.loading.hide()
            }
        },

        async GetReporteComprasTodos() {
            this.dataCompras = [];
            this.OpenDialogLoading()
            let fI = moment(this.fechaICompras).format('YYYY-MM-DD')
            let fF = moment(this.fechaFCompras).format('YYYY-MM-DD')
            try {
                let response = await axios.get(this.rutaAxios + 'Gasolineros/GetComprasGasolineriasAsync/erp_' + this.token.rfc + '/' + fI + '/' + fF);
                let x = response.data;
                this.dataCompras = [...x]

                //VAMOS A CALCULAR LOS TOTALES

                let objetoTotales = {
                    detalles: [],
                    producto: 'Total',
                    cantidad: this.dataCompras.reduce((acumulador, objeto) => acumulador + objeto.cantidad, 0),
                    subTotal: this.dataCompras.reduce((acumulador, objeto) => acumulador + objeto.subTotal, 0),
                    descuento: this.dataCompras.reduce((acumulador, objeto) => acumulador + objeto.descuento, 0),
                    iva: this.dataVentas.reduce((acumulador, objeto) => acumulador + objeto.iva, 0),
                    ieps: this.dataVentas.reduce((acumulador, objeto) => acumulador + objeto.ieps, 0),
                    total: this.dataCompras.reduce((acumulador, objeto) => acumulador + objeto.total, 0),
                    ventas: this.dataCompras.reduce((acumulador, objeto) => acumulador + objeto.ventas, 0),
                    comprobantes: this.dataCompras.reduce((acumulador, objeto) => acumulador + objeto.comprobantes, 0),
                }
                this.dataCompras.push(objetoTotales);

                this.$q.loading.hide()
            } catch (error) {
                console.log(error)
                this.$q.loading.hide()
            }
        },

        async GetPermisoCre() {
            this.$q.loading.show({
                spinner: QSpinnerCube,
                spinnerColor: 'red-8',
                spinnerSize: 140,
                // backgroundColor: 'purple',
                message: 'Consultando permisos...',
                // messageColor: 'black'
            })
            try {
                let response = await axios.get(this.rutaAxios + 'Gasolineros/GetPermisoCREAsync/erp_' + this.token.rfc);
                let x = response.data;
                this.optionsPermisoCre = x;
                this.$q.loading.hide()
            } catch (error) {
                console.log(error);
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

        ExportExcel(tipo) {
            let empresa = this.$store.state.empresaStore.nombre
            let rfc = this.$store.state.empresaStore.rfc
            if (tipo === 'ventas') {
                let fi_ = new Date(this.fechaIVentas);
                let ff_ = new Date(this.fechaFVentas);

                let fI = format(fi_, 'dd-MMMM-yyyy', { locale: es })
                let fF = format(ff_, 'dd-MMMM-yyyy', { locale: es })

                const workbook = XLSX.utils.book_new();

                const sheetOtros = XLSX.utils.json_to_sheet(this.dataVentas);
                XLSX.utils.book_append_sheet(workbook, sheetOtros, 'VENTAS');

                XLSX.writeFile(workbook,    rfc + ' - ' + empresa +  ' - VENTAS DEL ' + fI + ' AL ' + fF + '.xlsx');
            } else if (tipo === 'compras') {
                let fi_ = new Date(this.fechaICompras);
                let ff_ = new Date(this.fechaFCompras);

                let fI = format(fi_, 'dd-MMMM-yyyy', { locale: es })
                let fF = format(ff_, 'dd-MMMM-yyyy', { locale: es })

                const workbook = XLSX.utils.book_new();

                const sheetOtros = XLSX.utils.json_to_sheet(this.dataCompras);
                XLSX.utils.book_append_sheet(workbook, sheetOtros, 'COMPRAS');

                XLSX.writeFile(workbook,    rfc + ' - ' + empresa +  ' - COMPRAS DEL ' + fI + ' AL ' + fF + '.xlsx');
            }
        },

        UltimoDiaMes() {
            const fecha = new Date(this.fechaIVentas);

            const ultimoDiaDelMes = lastDayOfMonth(fecha);

            const fechaFormateada = format(ultimoDiaDelMes, 'yyyy-MM-dd');

            // const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
            this.fechaFVentas = fechaFormateada;
        },

        UltimoDiaMesCompras() {
            const fecha = new Date(this.fechaICompras);

            const ultimoDiaDelMes = lastDayOfMonth(fecha);

            const fechaFormateada = format(ultimoDiaDelMes, 'yyyy-MM-dd');

            // const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
            this.fechaFCompras = fechaFormateada;
        },

        OpenDialogLoading() {
            this.$q.loading.show({
                spinner: QSpinnerCube,
                spinnerColor: 'red-8',
                spinnerSize: 140,
                message: 'Consultando datos, espere...',
            })
        },

        OpenDialogDetalleV(item) {
            console.log(item)
            if (item.producto === 'Total') {
                this.$store.state.detalleVentasGasolineria.tipo = "VENTAS GASOLINERIA CONCENTRADO";
                var ventasConcentradas = [...this.dataVentas[0].detalles, ...this.dataVentas[1].detalles, ...this.dataVentas[2].detalles]
                ventasConcentradas.sort((a, b) => {
                    if (a.fecha < b.fecha) {
                        return -1;
                    }
                    if (a.fecha > b.fecha) {
                        return 1;
                    }
                    return 0;
                })
                this.$store.state.detalleVentasGasolineria.detalles = [...ventasConcentradas];
                this.dialogDetallesV = true;
            } else {
                this.$store.state.detalleVentasGasolineria.tipo = "VENTAS GASOLINERIA " + item.producto;
                this.$store.state.detalleVentasGasolineria.detalles = [...item.detalles];
                this.dialogDetallesV = true;
            }
        },

        OpenDialogDetalleC(item) {
            console.log(item)
            if (item.producto === 'Total') {
                this.$store.state.detalleVentasGasolineria.tipo = "COMPRAS GASOLINERIA CONCENTRADO";
                var ventasConcentradas = [...this.dataCompras[0].detalles, ...this.dataCompras[1].detalles, ...this.dataCompras[2].detalles]
                ventasConcentradas.sort((a, b) => {
                    if (a.fecha < b.fecha) {
                        return -1;
                    }
                    if (a.fecha > b.fecha) {
                        return 1;
                    }
                    return 0;
                })
                this.$store.state.detalleVentasGasolineria.detalles = [...ventasConcentradas];
                this.dialogDetallesV = true;
            } else {
                this.$store.state.detalleVentasGasolineria.tipo = "COMPRAS GASOLINERIA " + item.producto;
                this.$store.state.detalleVentasGasolineria.detalles = [...item.detalles];
                this.dialogDetallesV = true;
            }
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