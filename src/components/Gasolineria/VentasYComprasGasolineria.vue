<template>
    <div class="q-pa-md">
        <!-- DETALLES DE LA VENTAS -->
        <q-dialog v-model="dialogDetallesV" transition-show="scale" transition-hide="scale" maximized>
            <detalles-v></detalles-v>
        </q-dialog>
        <q-dialog v-model="dialogComparativa" transition-show="scale" transition-hide="scale">
            <q-card  v-if="item != null">
            <q-toolbar>
                <q-btn push color="red-10" icon="mdi-close-circle-outline" rounded flat size="18px" padding="xs"
                    v-close-popup>
                    <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                        :offset="[10, 10]">Cerrar</q-tooltip>
                </q-btn>
                <q-toolbar-title><span class="text-weight-bold">{{ item.tipo }}</span>
                    {{ item.combustible }} {{ item.año }}</q-toolbar-title>
                <q-btn push color="green-9" @click="PostLitrosGasolineros" icon="mdi-content-save-check-outline" rounded
                    flat size="18px" padding="xs">
                    <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                        :offset="[10, 10]">Guardar</q-tooltip>
                </q-btn>
            </q-toolbar>
            <q-separator color="primary" size="5px" />
            <q-card-section v-if="item.detalle">
                <!-- <span>{{ item }}</span> -->
                <div class="row q-gutter-y-xs">
                    <div class="col-12">
                        <q-field v-model="item.detalle[0].litros" :label="item.detalle[0].mes" dense class="q-mr-md"
                            outlined>
                            <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                                <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                    v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                            </template>
                        </q-field>
                    </div>
                    <br>
                    <div class="col-12">
                        <q-field v-model="item.detalle[1].litros" :label="item.detalle[1].mes" dense class="q-mr-md"
                            outlined>
                            <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                                <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                    v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                            </template>
                        </q-field>
                    </div>
                    <br>
                    <div class="col-12">
                        <q-field v-model="item.detalle[2].litros" :label="item.detalle[2].mes" dense class="q-mr-md"
                            outlined>
                            <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                                <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                    v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                            </template>
                        </q-field>
                    </div>

                    <div class="col-12">
                        <q-field v-model="item.detalle[3].litros" :label="item.detalle[3].mes" dense class="q-mr-md"
                            outlined>
                            <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                                <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                    v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                            </template>
                        </q-field>
                    </div>
                    <div class="col-12">
                        <q-field v-model="item.detalle[4].litros" :label="item.detalle[4].mes" dense class="q-mr-md"
                            outlined>
                            <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                                <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                    v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                            </template>
                        </q-field>
                    </div>
                    <div class="col-12">
                        <q-field v-model="item.detalle[5].litros" :label="item.detalle[5].mes" dense class="q-mr-md"
                            outlined>
                            <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                                <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                    v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                            </template>
                        </q-field>
                    </div>
                    <div class="col-12">
                        <q-field v-model="item.detalle[6].litros" :label="item.detalle[6].mes" dense class="q-mr-md"
                            outlined>
                            <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                                <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                    v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                            </template>
                        </q-field>
                    </div>
                    <div class="col-12">
                        <q-field v-model="item.detalle[7].litros" :label="item.detalle[7].mes" dense class="q-mr-md"
                            outlined>
                            <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                                <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                    v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                            </template>
                        </q-field>
                    </div>
                    <div class="col-12">
                        <q-field v-model="item.detalle[8].litros" :label="item.detalle[8].mes" dense class="q-mr-md"
                            outlined>
                            <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                                <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                    v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                            </template>
                        </q-field>
                    </div>
                    <div class="col-12">
                        <q-field v-model="item.detalle[9].litros" :label="item.detalle[9].mes" dense class="q-mr-md"
                            outlined>
                            <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                                <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                    v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                            </template>
                        </q-field>
                    </div>
                    <div class="col-12">
                        <q-field v-model="item.detalle[10].litros" :label="item.detalle[10].mes" dense class="q-mr-md"
                            outlined>
                            <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                                <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                    v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                            </template>
                        </q-field>
                    </div>
                    <div class="col-12">
                        <q-field v-model="item.detalle[11].litros" :label="item.detalle[11].mes" dense class="q-mr-md"
                            outlined>
                            <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                                <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                    v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                            </template>
                        </q-field>
                    </div>
                </div>
            </q-card-section>
        </q-card>
        </q-dialog>

        <!-- SELECCIONA AÑO Y MES, BOTON DE BUSCAR Y EXPORTAR A EXCEL -->
        <div class="row no-wrap items-center q-mt-md q-pa-sm">
            <q-space />

            <!-- <q-input v-model="fehaIVentasMasked" label="Fecha Inicial" class="q-mr-sm" name="event" outlined dense>
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
            </q-input> -->

            <q-select outlined dense v-model="selectedAnio" :options="itemsAnios" label="Año" style="width:80px"
                class="q-mr-xs" />
            <q-select outlined dense v-model="selectedMesI" :options="itemsMes" label="Mes Inicial" style="width:136px"
                class="q-mr-xs" />
            <q-select outlined dense v-model="selectedMesF" :options="itemsMes" label="Mes Final" style="width:136px"
                class="q-mr-xs" />

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
            <!-- <div class="q-mt-lg"> -->
            <q-fab v-model="fabComparativa" label="Comparativa" vertical-actions-align="left" color="blue-10"
                padding="xs" icon="keyboard_arrow_down" direction="down">
                <q-fab-action color="green-10" @click="OpenDialogComparativa('VENTAS', 'MAGNA')"
                    icon="mdi-gas-station-outline" label="Magna" />
                <q-fab-action color="red-10" @click="OpenDialogComparativa('VENTAS', 'PREMIUM')"
                    icon="mdi-gas-station-outline" label="Premium" />
                <q-fab-action color="blue-grey-10" @click="OpenDialogComparativa('VENTAS', 'DIESEL')"
                    icon="mdi-gas-station-outline" label="Diesel" />
            </q-fab>
            <!-- </div> -->
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
                    <q-td key="comparativa" :props="props">{{ FormatoCantidad(props.row.comparativa) }}</q-td>
                    <q-td key="diferencia" :props="props">{{ FormatoCantidad(props.row.diferencia) }}</q-td>
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

            <!-- <q-input v-model="fehaIComprasMasked" label="Fecha Inicial" class="q-mr-sm" name="event" outlined dense>
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
            </q-input> -->
            <q-select outlined dense v-model="selectedAnioC" :options="itemsAnios" label="Año" style="width:80px"
                class="q-mr-xs" />
            <q-select outlined dense v-model="selectedMesIC" :options="itemsMes" label="Mes Inicial" style="width:136px"
                class="q-mr-xs" />
            <q-select outlined dense v-model="selectedMesFC" :options="itemsMes" label="Mes Final" style="width:136px"
                class="q-mr-xs" />

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
            <q-fab v-model="fabComparativaC" label="Comparativa" vertical-actions-align="left" color="blue-10"
                padding="xs" icon="keyboard_arrow_down" direction="down">
                <q-fab-action color="green-10" @click="OpenDialogComparativa('COMPRAS', 'MAGNA')"
                    icon="mdi-gas-station-outline" label="Magna" />
                <q-fab-action color="red-10" @click="OpenDialogComparativa('COMPRAS', 'PREMIUM')"
                    icon="mdi-gas-station-outline" label="Premium" />
                <q-fab-action color="blue-grey-10" @click="OpenDialogComparativa('COMPRAS', 'DIESEL')"
                    icon="mdi-gas-station-outline" label="Diesel" />
            </q-fab>
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
                    <q-td key="comparativa" :props="props">{{ FormatoCantidad(props.row.comparativa) }}</q-td>
                    <q-td key="diferencia" :props="props">{{ FormatoCantidad(props.row.diferencia) }}</q-td>
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
import { Money } from 'v-money'

export default {
    components: {
        DetallesV,
        Money,

    },
    data() {
        return {
            moneyFormatForComponent: {
                decimal: '.',
                thousands: ',',
                precision: 3,
                masked: true
            },
            columns: [
                { name: 'actions', align: 'left', label: 'Acciones', field: 'actions' },
                { name: 'producto', align: 'left', label: 'Producto', field: 'producto', sortable: true },
                { name: 'comparativa', align: 'right', label: 'Litros Control Volumetrico', field: 'comparativa', sortable: true },
                { name: 'diferencia', align: 'right', label: 'Diferencia', field: 'diferencia', sortable: true },
                { name: 'cantidad', align: 'right', label: 'Litros XML', field: 'cantidad', sortable: true },
                { name: 'subTotal', align: 'right', label: 'subTotal', field: 'subTotal', sortable: true },
                { name: 'iva', align: 'right', label: 'IVA', field: 'iva', sortable: true },
                { name: 'ieps', align: 'right', label: 'IEPS', field: 'ieps', sortable: true },
                { name: 'total', align: 'right', label: 'Total', field: 'total', sortable: true },
                { name: 'ventas', align: 'left', label: '# Ventas', field: 'ventas', sortable: true },
                { name: 'comprobantes', align: 'left', label: '# Comprobantes', field: 'comprobantes', sortable: true },
            ],

            columnsCompras: [
                { name: 'actions', align: 'left', label: 'Acciones', field: 'actions' },
                { name: 'producto', align: 'left', label: 'Producto', field: 'producto', sortable: true },
                { name: 'comparativa', align: 'right', label: 'Litros Control Volumetrico', field: 'comparativa', sortable: true },
                { name: 'diferencia', align: 'right', label: 'Diferencia', field: 'diferencia', sortable: true },

                { name: 'cantidad', align: 'right', label: 'Litros XML', field: 'cantidad', sortable: true },
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

            fabComparativa: false,
            fabComparativaC: false,
            dialogComparativa: false,
            itemsAnios: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018'],
            itemsMes: [
                { label: 'ENERO', value: 1 },
                { label: 'FEBRERO', value: 2 },
                { label: 'MARZO', value: 3 },
                { label: 'ABRIL', value: 4 },
                { label: 'MAYO', value: 5 },
                { label: 'JUNIO', value: 6 },
                { label: 'JULIO', value: 7 },
                { label: 'AGOSTO', value: 8 },
                { label: 'SEPTIEMBRE', value: 9 },
                { label: 'OCTUBRE', value: 10 },
                { label: 'NOVIEMBRE', value: 11 },
                { label: 'DICIEMBRE', value: 12 },
            ],

            selectedAnio: null,
            selectedMesI: null,
            selectedMesF: null,

            selectedAnioC: null,
            selectedMesIC: null,
            selectedMesFC: null,

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
        },
        item() {
            return this.$store.state.litrosGasolineriaStore;
        },

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

            // let fI = moment(this.fechaIVentas).format('YYYY-MM-DD')
            // let fF = moment(this.fechaFVentas).format('YYYY-MM-DD')
            if (!this.selectedAnio || !this.selectedMesI || !this.selectedMesF) {
                this.$q.notify({ type: 'warning', message: 'Selecciona año y meses', position: 'top-right' })
                return
            }

            const fI = new Date(this.selectedAnio, this.selectedMesI.value - 1, 1)
                .toISOString().split('T')[0]
            const fF = new Date(this.selectedAnio, this.selectedMesF.value, 0)
                .toISOString().split('T')[0]
            this.dataVentas = []
            this.OpenDialogLoading()

            let año =this.selectedAnio

            let ObjInicialMagna = await this.GetComparativa(año,'VENTAS','MAGNA');
            let ObjInicialPremium = await this.GetComparativa(año,'VENTAS','PREMIUM');
            let ObjInicialDiesel = await this.GetComparativa(año,'VENTAS','DIESEL');

            try {
                let response = await axios.get(this.rutaAxios + 'Gasolineros/GetVentasGasolinasAsync/erp_' + this.token.rfc + '/' + fI + '/' + fF);
                let x = response.data;
                // this.dataVentas = [...x]

                const mI = this.selectedMesI.value
                const mF = this.selectedMesF.value

                this.dataVentas = x.map(item => {
                    let objComp = null
                    if (item.producto === 'MAGNA') objComp = ObjInicialMagna
                    if (item.producto === 'PREMIUM') objComp = ObjInicialPremium
                    if (item.producto === 'DIESEL') objComp = ObjInicialDiesel

                    const comparativa = this.calcularComparativa(objComp, mI, mF)
                    return {
                        ...item,
                        comparativa,
                        diferencia: item.cantidad - comparativa
                    }
                })

                //VAMOS A CALCULAR LOS TOTALES
                let objetoTotales = {
                    detalles: [],
                    producto: 'Total',
                    cantidad: this.dataVentas.reduce((acumulador, objeto) => acumulador + objeto.cantidad, 0),
                    comparativa: this.dataVentas.reduce((a, o) => a + (o.comparativa ?? 0), 0),
                    diferencia: this.dataVentas.reduce((a, o) => a + (o.diferencia ?? 0), 0), subTotal: this.dataVentas.reduce((acumulador, objeto) => acumulador + objeto.subTotal, 0),
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
        calcularComparativa(objComparativa, mesInicial, mesFinal) {
            if (!objComparativa?.detalle) return 0
            return objComparativa.detalle
                .filter(d => {
                    const mesIndex = this.itemsMes.findIndex(m => m.label === d.mes) + 1
                    return mesIndex >= mesInicial && mesIndex <= mesFinal
                })
                .reduce((a, d) => a + parseFloat(d.litros), 0)
        },
        async GetReportePorSucursal() {
            if (!this.selectedAnio || !this.selectedMesI || !this.selectedMesF) {
                this.$q.notify({ type: 'warning', message: 'Selecciona año y meses', position: 'top-right' })
                return
            }

            const fI = new Date(this.selectedAnio, this.selectedMesI.value - 1, 1)
                .toISOString().split('T')[0]
            const fF = new Date(this.selectedAnio, this.selectedMesF.value, 0)
                .toISOString().split('T')[0]

            this.OpenDialogLoading()
 
            let año =this.selectedAnio

            let ObjInicialMagna = await this.GetComparativa(año,'VENTAS','MAGNA');
            let ObjInicialPremium = await this.GetComparativa(año,'VENTAS','PREMIUM');
            let ObjInicialDiesel = await this.GetComparativa(año,'VENTAS','DIESEL');


            let permiso = this.selectPermisoCre.replaceAll('/', '-');
            try {
                let response = await axios.get(this.rutaAxios + 'Gasolineros/GetVentasGasolinasSucursalAsync/erp_' + this.token.rfc + '/' + permiso + '/' + fI + '/' + fF);
                let x = response.data;
                // this.dataVentas = [...x]

                const mI = this.selectedMesI.value
                const mF = this.selectedMesF.value

                this.dataVentas = x.map(item => {
                    let objComp = null
                    if (item.producto === 'MAGNA') objComp = ObjInicialMagna
                    if (item.producto === 'PREMIUM') objComp = ObjInicialPremium
                    if (item.producto === 'DIESEL') objComp = ObjInicialDiesel

                    const comparativa = this.calcularComparativa(objComp, mI, mF)
                    return {
                        ...item,
                        comparativa,
                        diferencia: item.cantidad - comparativa
                    }
                })

                //VAMOS A CALCULAR LOS TOTALES
                let objetoTotales = {
                    detalles: [],
                    producto: 'Total',
                    cantidad: this.dataVentas.reduce((acumulador, objeto) => acumulador + objeto.cantidad, 0),
                    comparativa: this.dataVentas.reduce((a, o) => a + (o.comparativa ?? 0), 0),
                    diferencia: this.dataVentas.reduce((a, o) => a + (o.diferencia ?? 0), 0), subTotal: this.dataVentas.reduce((acumulador, objeto) => acumulador + objeto.subTotal, 0),
                    
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

            if (!this.selectedAnioC || !this.selectedMesIC || !this.selectedMesFC) {
                this.$q.notify({ type: 'warning', message: 'Selecciona año y meses', position: 'top-right' })
                return
            }

            const fI = new Date(this.selectedAnioC, this.selectedMesIC.value - 1, 1)
                .toISOString().split('T')[0]
            const fF = new Date(this.selectedAnioC, this.selectedMesFC.value, 0)
                .toISOString().split('T')[0]

            this.dataCompras = [];
            this.OpenDialogLoading()

            let año =this.selectedAnioC

            let ObjInicialMagna = await this.GetComparativa(año, 'COMPRAS','MAGNA');
            let ObjInicialPremium = await this.GetComparativa(año,'COMPRAS','PREMIUM');
            let ObjInicialDiesel = await this.GetComparativa(año, 'COMPRAS','DIESEL');

            // let fI = moment(this.fechaICompras).format('YYYY-MM-DD')
            // let fF = moment(this.fechaFCompras).format('YYYY-MM-DD')
            try {
                let response = await axios.get(this.rutaAxios + 'Gasolineros/GetComprasGasolineriasAsync/erp_' + this.token.rfc + '/' + fI + '/' + fF);
                let x = response.data;

                const mI = this.selectedMesIC.value
                const mF = this.selectedMesFC.value

                this.dataCompras = x.map(item => {
                    let objComp = null
                    if (item.producto === 'MAGNA') objComp = ObjInicialMagna
                    if (item.producto === 'PREMIUM') objComp = ObjInicialPremium
                    if (item.producto === 'DIESEL') objComp = ObjInicialDiesel

                    const comparativa = this.calcularComparativa(objComp, mI, mF)
                    return {
                        ...item,
                        comparativa,
                        diferencia: item.cantidad - comparativa
                    }
                })
                //VAMOS A CALCULAR LOS TOTALES

                let objetoTotales = {
                    detalles: [],
                    producto: 'Total',
                    cantidad: this.dataCompras.reduce((acumulador, objeto) => acumulador + objeto.cantidad, 0),
                    comparativa: this.dataCompras.reduce((a, o) => a + (o.comparativa ?? 0), 0),
                    diferencia: this.dataCompras.reduce((a, o) => a + (o.diferencia ?? 0), 0), subTotal: this.dataCompras.reduce((acumulador, objeto) => acumulador + objeto.subTotal, 0),
                    
                    subTotal: this.dataCompras.reduce((acumulador, objeto) => acumulador + objeto.subTotal, 0),
                    descuento: this.dataCompras.reduce((acumulador, objeto) => acumulador + objeto.descuento, 0),
                    iva: this.dataCompras.reduce((acumulador, objeto) => acumulador + objeto.iva, 0),
                    ieps: this.dataCompras.reduce((acumulador, objeto) => acumulador + objeto.ieps, 0),
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

                XLSX.writeFile(workbook, rfc + ' - ' + empresa + ' - VENTAS DEL ' + fI + ' AL ' + fF + '.xlsx');
            } else if (tipo === 'compras') {
                let fi_ = new Date(this.fechaICompras);
                let ff_ = new Date(this.fechaFCompras);

                let fI = format(fi_, 'dd-MMMM-yyyy', { locale: es })
                let fF = format(ff_, 'dd-MMMM-yyyy', { locale: es })

                const workbook = XLSX.utils.book_new();

                const sheetOtros = XLSX.utils.json_to_sheet(this.dataCompras);
                XLSX.utils.book_append_sheet(workbook, sheetOtros, 'COMPRAS');

                XLSX.writeFile(workbook, rfc + ' - ' + empresa + ' - COMPRAS DEL ' + fI + ' AL ' + fF + '.xlsx');
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
        async OpenDialogComparativa(tipo, item) {
            if (!this.selectedAnio) {
                this.$q.notify({
                    progress: true,
                    message: 'Seleccione el año para continuar',
                    type: 'warning',
                    position: 'top-right',
                    actions: [
                        { label: 'Cerrar', color: 'white', handler: () => { /* ... */ } }
                    ]
                })
                return;
            }

            if (this.selectPermisoCre == 'Todos') {
                this.$q.notify({
                    progress: true,
                    message: 'Especifique el número de permiso de la cre',
                    type: 'warning',
                    position: 'top-right',
                    actions: [
                        { label: 'Cerrar', color: 'white', handler: () => { /* ... */ } }
                    ]
                })
                return;
            }
            let año =this.selectedAnio

            let ObjInicial = await this.GetComparativa(año, tipo, item);
            console.log(ObjInicial)
            this.$store.state.litrosGasolineriaStore = { ...ObjInicial }
            this.dialogComparativa = true;
        },

        async OpenDialogComparativaCompras(tipo, item) {
            if (!this.selectedAnio) {
                this.$q.notify({
                    progress: true,
                    message: 'Seleccione el año para continuar',
                    type: 'warning',
                    position: 'top-right',
                    actions: [
                        { label: 'Cerrar', color: 'white', handler: () => { /* ... */ } }
                    ]
                })
                return;
            }
            let año =this.selectedAnioC
            let ObjInicial = await this.GetComparativa(año,tipo, item);
            console.log(ObjInicial)
            this.$store.state.litrosGasolineriaStore = { ...ObjInicial }
            this.dialogComparativa = true;
        },

        CloseDialogDetalles() {
            this.dialogInventrioInicial = false;
            this.dialogMerma = false;
            this.dialogComparativa = false;
        },

        async GetComparativa(año, tipo, item) {
            let noCre = ''
            if (tipo == 'COMPRAS'){
                noCre = 'Todos' 
            }else {
                noCre =this.selectPermisoCre
            }

            let ObjInicial = {
                año:año,
                tipo: tipo,
                combustible: item,
                noCre:noCre,
                detalle: [
                    { mes: 'ENERO', litros: 0 },
                    { mes: 'FEBRERO', litros: 0 },
                    { mes: 'MARZO', litros: 0 },
                    { mes: 'ABRIL', litros: 0 },
                    { mes: 'MAYO', litros: 0 },
                    { mes: 'JUNIO', litros: 0 },
                    { mes: 'JULIO', litros: 0 },
                    { mes: 'AGOSTO', litros: 0 },
                    { mes: 'SEPTIEMBRE', litros: 0 },
                    { mes: 'OCTUBRE', litros: 0 },
                    { mes: 'NOVIEMBRE', litros: 0 },
                    { mes: 'DICIEMBRE', litros: 0 }
                ],
            };
            let objeto = {
                databaseName:'erp_' + this.token.rfc,
                año:año,
                tipo:tipo,
                combustible: item,
                noCre:noCre,
            }
            console.log(objeto)
            try {
                let response = await axios.post(this.rutaAxios + 'Gasolineros/GetLitrosGasolinerosCVAsync', objeto);
                let x = response.data;
                return x;
            } catch (error) {
                return ObjInicial;
            }
        },

        
        async PostLitrosGasolineros() {
            try {
                console.log(this.item)
                let ObjLitros = { ...this.item };
                let response = await axios.post(this.rutaAxios + 'Gasolineros/PostLitrosGasolinerosCVAsync/erp_' + this.token.rfc, ObjLitros);
                this.$q.notify({
                    progress: true,
                    message: 'Comparativa guardada con éxito',
                    type: 'positive',
                    position: 'top-right',
                    actions: [
                        { label: 'Cerrar', color: 'white', handler: () => { /* ... */ } }
                    ]
                })
            } catch (error) {
                this.$q.notify({
                    progress: true,
                    message: 'Error al guardar',
                    type: 'negative',
                    position: 'top-right',
                    actions: [
                        { label: 'Cerrar', color: 'white', handler: () => { /* ... */ } }
                    ]
                })
                console.log(error);
            }finally{
                this.dialogComparativa = false
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