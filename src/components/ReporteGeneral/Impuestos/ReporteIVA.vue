<template>
    <div style="width: 100%;">
        <!-- DIALOG DE LOS DETALLES -->
        <q-dialog v-model="dialogDetalles" persistent transition-show="scale" transition-hide="scale" maximized>
            <detalles @CloseDialogDetalles="CloseDialogDetalles"></detalles>
        </q-dialog>


        <div class="titulo-reporte-impuestos">
            REPORTE DE IVA - IVA TRASLADADO
        </div>

        <div class="q-mb-md" v-for="(registros, mes) in items.contenido.ivaEmitidos" :key="mes">
            <q-table :data="registros" :columns="columns" row-key="concepto" flat bordered class="shadow-0 border-0"
                dense :title="mes">
                <template v-slot:body="props">
                    <q-tr :props="props" class="hover-foliofiscal-i">
                        <q-td key="concepto" :props="props"
                            @click="VerDetalles(props.row, 'Comprobantes IVA Trasladado', mes)">{{ props.row.concepto
                            }}</q-td>
                        <q-td key="contador" :props="props"
                            @click="VerDetalles(props.row, 'Comprobantes IVA Trasladado', mes)">{{ props.row.contador
                            }}</q-td>
                        <q-td key="baseIva16" :props="props"
                            @click="VerDetalles(props.row, 'Comprobantes IVA Trasladado', mes)">{{
                            formatCurrency(props.row.baseIva16) }}</q-td>
                        <q-td key="importeIva16" :props="props"
                            @click="VerDetalles(props.row, 'Comprobantes IVA Trasladado', mes)">{{
                            formatCurrency(props.row.importeIva16) }}</q-td>
                        <q-td key="baseIva8" :props="props"
                            @click="VerDetalles(props.row, 'Comprobantes IVA Trasladado', mes)">{{
                            formatCurrency(props.row.baseIva8)}}</q-td>
                        <q-td key="importeIva8" :props="props"
                            @click="VerDetalles(props.row, 'Comprobantes IVA Trasladado', mes)">{{
                            formatCurrency(props.row.importeIva8)}}</q-td>
                        <q-td key="baseIva0" :props="props"
                            @click="VerDetalles(props.row, 'Comprobantes IVA Trasladado', mes)">{{
                            formatCurrency(props.row.baseIva0)}}</q-td>
                        <q-td key="importeIva0" :props="props"
                            @click="VerDetalles(props.row, 'Comprobantes IVA Trasladado', mes)">{{
                            formatCurrency(props.row.importeIva0)}}</q-td>
                        <q-td key="baseIvaExento" :props="props"
                            @click="VerDetalles(props.row, 'Comprobantes IVA Trasladado', mes)">{{
                            formatCurrency(props.row.baseIvaExento)}}</q-td>
                        <q-td key="importeIvaExento" :props="props"
                            @click="VerDetalles(props.row, 'Comprobantes IVA Trasladado', mes)">{{
                            formatCurrency(props.row.importeIvaExento)}}</q-td>
                    </q-tr>
                </template>
            </q-table>
            <q-table :data="[getTotales(registros)]" :columns="columnsTotales" dense flat bordered row-key="concepto"
                class="shadow-0 border-0 q-mt-sm" hide-header hide-bottom>
                <template v-slot:body="props">
                    <q-tr :props="props">
                        <q-td key="concepto" :props="props"><strong>Total</strong></q-td>
                        <q-td key="contador" :props="props">{{ props.row.contador }}</q-td>
                        <q-td key="baseIva16" :props="props">{{ formatCurrency(props.row.baseIva16) }}</q-td>
                        <q-td key="importeIva16" :props="props">{{ formatCurrency(props.row.importeIva16) }}</q-td>
                        <q-td key="baseIva8" :props="props">{{ formatCurrency(props.row.baseIva8)}}</q-td>
                        <q-td key="importeIva8" :props="props">{{ formatCurrency(props.row.importeIva8)}}</q-td>
                        <q-td key="baseIva0" :props="props">{{ formatCurrency(props.row.baseIva0)}}</q-td>
                        <q-td key="importeIva0" :props="props">{{ formatCurrency(props.row.importeIva0)}}</q-td>
                        <q-td key="baseIvaExento" :props="props">{{ formatCurrency(props.row.baseIvaExento)}}</q-td>
                        <q-td key="importeIvaExento" :props="props">{{
                            formatCurrency(props.row.importeIvaExento)}}</q-td>
                    </q-tr>
                </template>
            </q-table>
        </div>

        <div class="titulo-reporte-impuestos">
            REPORTE DE IVA - IVA ACREDITADO
        </div>
        <div class="q-mb-md" v-for="(registros, mes) in items.contenido.ivaRecibidos" :key="'retenido-'+mes">
            <q-table :data="registros" :columns="columns" row-key="concepto" flat bordered class="shadow-0 border-0"
                dense :title="mes">
                <template v-slot:body="props">
                    <q-tr :props="props" class="hover-foliofiscal-i">
                        <q-td key="concepto" :props="props"
                            @click="VerDetalles(props.row, 'Comprobantes IVA Acreditado', mes)">{{ props.row.concepto
                            }}</q-td>
                        <q-td key="contador" :props="props"
                            @click="VerDetalles(props.row, 'Comprobantes IVA Acreditado', mes)">{{ props.row.contador
                            }}</q-td>
                        <q-td key="baseIva16" :props="props"
                            @click="VerDetalles(props.row, 'Comprobantes IVA Acreditado', mes)">{{
                            formatCurrency(props.row.baseIva16) }}</q-td>
                        <q-td key="importeIva16" :props="props"
                            @click="VerDetalles(props.row, 'Comprobantes IVA Acreditado', mes)">{{
                            formatCurrency(props.row.importeIva16) }}</q-td>
                        <q-td key="baseIva8" :props="props"
                            @click="VerDetalles(props.row, 'Comprobantes IVA Acreditado', mes)">{{
                            formatCurrency(props.row.baseIva8)}}</q-td>
                        <q-td key="importeIva8" :props="props"
                            @click="VerDetalles(props.row, 'Comprobantes IVA Acreditado', mes)">{{
                            formatCurrency(props.row.importeIva8)}}</q-td>
                        <q-td key="baseIva0" :props="props"
                            @click="VerDetalles(props.row, 'Comprobantes IVA Acreditado', mes)">{{
                            formatCurrency(props.row.baseIva0)}}</q-td>
                        <q-td key="importeIva0" :props="props"
                            @click="VerDetalles(props.row, 'Comprobantes IVA Acreditado', mes)"> {{
                            formatCurrency(props.row.importeIva0)}}</q-td>
                        <q-td key="baseIvaExento" :props="props"
                            @click="VerDetalles(props.row, 'Comprobantes IVA Acreditado', mes)">{{
                            formatCurrency(props.row.baseIvaExento)}}</q-td>
                        <q-td key="importeIvaExento" :props="props"
                            @click="VerDetalles(props.row, 'Comprobantes IVA Acreditado', mes)">{{
                            formatCurrency(props.row.importeIvaExento)}}</q-td>
                    </q-tr>
                </template>
            </q-table>
            <q-table :data="[getTotales(registros)]" :columns="columnsTotales" dense flat bordered row-key="concepto"
                class="shadow-0 border-0 q-mt-sm" hide-header hide-bottom>
                <template v-slot:body="props">
                    <q-tr :props="props">
                        <q-td key="concepto" :props="props"><strong>Total</strong></q-td>
                        <q-td key="contador" :props="props">{{ props.row.contador }}</q-td>
                        <q-td key="baseIva16" :props="props">{{ formatCurrency(props.row.baseIva16) }}</q-td>
                        <q-td key="importeIva16" :props="props">{{ formatCurrency(props.row.importeIva16) }}</q-td>
                        <q-td key="baseIva8" :props="props">{{ formatCurrency(props.row.baseIva8)}}</q-td>
                        <q-td key="importeIva8" :props="props">{{ formatCurrency(props.row.importeIva8)}}</q-td>
                        <q-td key="baseIva0" :props="props">{{ formatCurrency(props.row.baseIva0)}}</q-td>
                        <q-td key="importeIva0" :props="props">{{ formatCurrency(props.row.importeIva0)}}</q-td>
                        <q-td key="baseIvaExento" :props="props">{{ formatCurrency(props.row.baseIvaExento)}}</q-td>
                        <q-td key="importeIvaExento" :props="props">{{
                            formatCurrency(props.row.importeIvaExento)}}</q-td>
                    </q-tr>
                </template>
            </q-table>
        </div>
    </div>
</template>
<script>
    import axios from 'axios';

    import moment from 'moment';
    import * as xlsx from 'xlsx';
    import detalles from '../../PagosMensuales/ReporteIvaDetalles.vue'
    import { QSpinnerCube } from 'quasar';
    import { format } from "date-fns";
    import { es } from "date-fns/locale";

    export default {
        components: {
            detalles,
        },
        data() {
            return {
                columns: [
                    { name: 'concepto', label: 'Concepto', align: 'left', field: 'concepto', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-impuestos text-white' },
                    { name: 'contador', label: '# Comprbantes', align: 'center', field: 'contador', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-impuestos text-white', },
                    { name: 'baseIva16', label: 'Base IVA 16', align: 'right', field: 'baseIva16', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-impuestos text-white', },
                    { name: 'importeIva16', label: 'Importe IVA 16', align: 'right', field: 'importeIva16', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-impuestos text-white', },
                    { name: 'baseIva8', label: 'Base IVA 8', align: 'right', field: 'baseIva8', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-impuestos text-white', },
                    { name: 'importeIva8', label: 'Importe IVA 8', align: 'right', field: 'importeIva8', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-impuestos text-white', },
                    { name: 'baseIva0', label: 'Base IVA 0', align: 'right', field: 'baseIva0', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-impuestos text-white', },
                    { name: 'importeIva0', label: 'Importe IVA 0', align: 'right', field: 'importeIva0', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-impuestos text-white', },
                    { name: 'baseIvaExento', label: 'Base IVA Exento', align: 'right', field: 'baseIvaExento', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-impuestos text-white', },
                    { name: 'importeIvaExento', label: 'Importe IVA Exento', align: 'right', field: 'importeIvaExento', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-impuestos text-white', },
                ],
                columnsTotales: [
                    { name: 'concepto', label: 'Concepto', align: 'left', field: 'concepto', sortable: true, classes: 'total-row-i ellipsis', headerClasses: 'bgc-impuestos text-white' },
                    { name: 'contador', label: '# Comprbantes', align: 'center', field: 'contador', sortable: true, classes: 'total-row-i ellipsis', headerClasses: 'bgc-impuestos text-white', },
                    { name: 'baseIva16', label: 'Base IVA 16', align: 'right', field: 'baseIva16', sortable: true, classes: 'total-row-i ellipsis', headerClasses: 'bgc-impuestos text-white', },
                    { name: 'importeIva16', label: 'Importe IVA 16', align: 'right', field: 'importeIva16', sortable: true, classes: 'total-row-i ellipsis', headerClasses: 'bgc-impuestos text-white', },
                    { name: 'baseIva8', label: 'Base IVA 8', align: 'right', field: 'baseIva8', sortable: true, classes: 'total-row-i ellipsis', headerClasses: 'bgc-impuestos text-white', },
                    { name: 'importeIva8', label: 'Importe IVA 8', align: 'right', field: 'importeIva8', sortable: true, classes: 'total-row-i ellipsis', headerClasses: 'bgc-impuestos text-white', },
                    { name: 'baseIva0', label: 'Base IVA 0', align: 'right', field: 'baseIva0', sortable: true, classes: 'total-row-i ellipsis', headerClasses: 'bgc-impuestos text-white', },
                    { name: 'importeIva0', label: 'Importe IVA 0', align: 'right', field: 'importeIva0', sortable: true, classes: 'total-row-i ellipsis', headerClasses: 'bgc-impuestos text-white', },
                    { name: 'baseIvaExento', label: 'Base IVA Exento', align: 'right', field: 'baseIvaExento', sortable: true, classes: 'total-row-i ellipsis', headerClasses: 'bgc-impuestos text-white', },
                    { name: 'importeIvaExento', label: 'Importe IVA Exento', align: 'right', field: 'importeIvaExento', sortable: true, classes: 'total-row-i ellipsis', headerClasses: 'bgc-impuestos text-white', },
                ],

                //DATOS DE LOS DETALLES
                dialogDetalles: false,

                //REGISTROS DEL IVA
                fabIva: false,
                ivaSat16: [],
                ivaSat8: [],
                ivaSat0: [],
                ivaSatExento: [],
            }
        },
        computed: {
            token() {
                return this.$store.state.usuario;
            },
            items() {
                return this.$store.state.dataViewReporte[38];
            },
            fechas() {
                return this.$store.state.fechasReporteEmpresarialStore;
            },
            rutaAxios() {
                return this.$store.state.rutaMongoStore
            }
        },
        methods: {
            formatCurrency(value) {
                return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
            },
            getTotales(registros) {
                return {
                    concepto: 'Total',
                    contador: registros.reduce((sum, r) => sum + (r.contador || 0), 0),
                    baseIva16: registros.reduce((sum, r) => sum + (r.baseIva16 || 0), 0),
                    importeIva16: registros.reduce((sum, r) => sum + (r.importeIva16 || 0), 0),
                    baseIva8: registros.reduce((sum, r) => sum + (r.baseIva8 || 0), 0),
                    importeIva8: registros.reduce((sum, r) => sum + (r.importeIva8 || 0), 0),
                    baseIva0: registros.reduce((sum, r) => sum + (r.baseIva0 || 0), 0),
                    importeIva0: registros.reduce((sum, r) => sum + (r.importeIva0 || 0), 0),
                    baseIvaExento: registros.reduce((sum, r) => sum + (r.baseIvaExento || 0), 0),
                    importeIvaExento: registros.reduce((sum, r) => sum + (r.importeIvaExento || 0), 0),
                };
            },

            async VerDetalles(item, cabecera, mes) {
                this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'red-8', spinnerSize: 140, message: 'Consultando información...', })
                const nombresMeses = [
                    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
                ];
                const numeroMes = nombresMeses.indexOf(mes.toLowerCase()) + 1;
                const año = this.fechas.anio;
                const fI = año + '-' + numeroMes + '-01';
                const fF = año + '-' + numeroMes + '-01';
                const rfc = this.token.rfc;

                console.log(fI)
                console.log(fF)

                //CONSULTAMOS EL IVA CALCULADO EN PLATAFORMA SAT
                const satIva16 = { ...this.ivaSat16[numeroMes - 1] };
                const satIva8 = { ...this.ivaSat8[numeroMes - 1] };
                const satIva0 = { ...this.ivaSat0[numeroMes - 1] };
                const satIvaExento = { ...this.ivaSatExento[numeroMes - 1] };

                if (año < 2024) {
                    try {
                        if (cabecera === "Comprobantes IVA Trasladado") {
                            await this.DetalesEmitidos(rfc, fI, fF)
                        } else if (cabecera === "Comprobantes IVA Acreditado") {
                            await this.DetallesRecibidos(rfc, fI, fF)
                        }
                    } catch (error) {
                        console.log(error);
                        this.$q.loading.hide()
                    }
                } else {
                    try {
                        if (cabecera === "Comprobantes IVA Trasladado") {
                            await this.GetReporteIvaCompletoDetEmitidos(rfc, fI, fF, satIva16.ivaCargo, satIva8.ivaCargo, satIva0.ivaCargo, satIvaExento.ivaCargo)
                        } else if (cabecera === "Comprobantes IVA Acreditado") {
                            await this.GetReporteIvaCompletoDetRecibidos(rfc, fI, fF, satIva16.ivaFavor, satIva8.ivaFavor, satIva0.ivaFavor, satIvaExento.ivaFavor)
                        }
                    } catch (error) {
                        this.$q.loading.hide()
                        console.log(error);
                    }
                }
            },
            async GetReporteIvaCompletoDetRecibidos(rfc, fechaI, fechaF, iva16, iva8, iva0, ivaExento) {
                this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'red-8', spinnerSize: 140, message: 'Consultando iva acreditable...', })
                try {
                    const response = await axios.get(this.rutaAxios + `Gastos/GetReporteIvaCompletoDetAsync/${rfc}/${fechaI}/${fechaF}`);
                    const factor1Data = response.data.filter(item => item.tipoFactor === 'Tasa' && item.tasaOCuota == .16);
                    const factor2Data = response.data.filter(item => item.tipoFactor === 'Tasa' && item.tasaOCuota == .08);
                    const factor3Data = response.data.filter(item => item.tipoFactor === 'Tasa' && item.tasaOCuota == .0);
                    const factor4Data = response.data.filter(item => item.tipoFactor === 'Exento');


                    this.$store.state.detallesIvaMensualExentoStore = {
                        cabecera: "Comprobantes IVA Acreditado",
                        detalles: factor4Data
                    };
                    this.$store.state.detallesIvaMensualTasa16Store = {
                        cabecera: "Comprobantes IVA Acreditado",
                        detalles: factor1Data
                    };
                    this.$store.state.detallesIvaMensualTasa8Store = {
                        cabecera: "Comprobantes IVA Acreditado",
                        detalles: factor2Data
                    };
                    this.$store.state.detallesIvaMensualTasa0Store = {
                        cabecera: "Comprobantes IVA Acreditado",
                        detalles: factor3Data
                    };

                    //ASIGNAMOS LOS IMPORTES REGISTRADOS EN EL VISOR SAT
                    this.$store.state.visorSatIva = {
                        iva16: iva16,
                        iva8: iva8,
                        iva0: iva0,
                        ivaExento: ivaExento,
                    }

                    this.dialogDetalles = true;
                    this.$q.loading.hide()
                } catch (error) {
                    console.log(error);
                    this.$q.loading.hide()
                }
            },

            async GetReporteIvaCompletoDetEmitidos(rfc, fechaI, fechaF, iva16, iva8, iva0, ivaExento) {
                this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'red-8', spinnerSize: 140, message: 'Consultando iva acreditable...', })
                try {
                    const response = await axios.get(this.rutaAxios + `Ingresos/GetReporteIvaCompletoDetAsync/${rfc}/${fechaI}/${fechaF}`);
                    const factor1Data = response.data.filter(item => item.tipoFactor === 'Tasa' && item.tasaOCuota == .16);
                    const factor2Data = response.data.filter(item => item.tipoFactor === 'Tasa' && item.tasaOCuota == .08);
                    const factor3Data = response.data.filter(item => item.tipoFactor === 'Tasa' && item.tasaOCuota == .0);
                    const factor4Data = response.data.filter(item => item.tipoFactor === 'Exento');

                    this.$store.state.detallesIvaMensualExentoStore = {
                        cabecera: "Comprobantes IVA Trasladado",
                        detalles: factor4Data
                    };
                    this.$store.state.detallesIvaMensualTasa16Store = {
                        cabecera: "Comprobantes IVA Trasladado",
                        detalles: factor1Data
                    };
                    this.$store.state.detallesIvaMensualTasa8Store = {
                        cabecera: "Comprobantes IVA Trasladado",
                        detalles: factor2Data
                    };
                    this.$store.state.detallesIvaMensualTasa0Store = {
                        cabecera: "Comprobantes IVA Trasladado",
                        detalles: factor3Data
                    };

                    //ASIGNAMOS LOS IMPORTES REGISTRADOS EN EL VISOR SAT
                    this.$store.state.visorSatIva = {
                        iva16: iva16,
                        iva8: iva8,
                        iva0: iva0,
                        ivaExento: ivaExento,
                    }

                    this.dialogDetalles = true;
                    this.$q.loading.hide()
                } catch (error) {
                    console.log(error);
                    this.$q.loading.hide()
                }
            },
            async DetalesEmitidos(rfc, fechaI, fechaF) {
                const response = await axios.get(this.rutaAxios + `Ingresos/GetReporteIvaDetAsync/${rfc}/${fechaI}/${fechaF}`);
                console.log(response.data)
                const factor1Data = response.data.filter(item => item.tipoFactor === 'Tasa' && item.tasaOCuota == .16);
                const factor2Data = response.data.filter(item => item.tipoFactor === 'Tasa' && item.tasaOCuota == .08);
                const factor3Data = response.data.filter(item => item.tipoFactor === 'Tasa' && item.tasaOCuota == .0);
                const factor4Data = response.data.filter(item => item.tipoFactor === 'Exento');

                this.$store.state.detallesIvaMensualExentoStore = {
                    cabecera: "Comprobantes IVA Trasladado",
                    detalles: factor4Data
                };
                this.$store.state.detallesIvaMensualTasa16Store = {
                    cabecera: "Comprobantes IVA Trasladado",
                    detalles: factor1Data
                };
                this.$store.state.detallesIvaMensualTasa8Store = {
                    cabecera: "Comprobantes IVA Trasladado",
                    detalles: factor2Data
                };
                this.$store.state.detallesIvaMensualTasa0Store = {
                    cabecera: "Comprobantes IVA Trasladado",
                    detalles: factor3Data
                };

                //ASIGNAMOS LOS IMPORTES REGISTRADOS EN EL VISOR SAT
                this.$store.state.visorSatIva = {
                    iva16: 0,
                    iva8: 0,
                    iva0: 0,
                    ivaExento: 0,
                }

                this.dialogDetalles = true;
                this.$q.loading.hide()
            },

            async DetallesRecibidos(rfc, fechaI, fechaF) {
                const response = await axios.get(this.rutaAxios + `Gastos/GetReporteIvaDetAsync/${rfc}/${fechaI}/${fechaF}`);
                const factor1Data = response.data.filter(item => item.tipoFactor === 'Tasa' && item.tasaOCuota == .16);
                const factor2Data = response.data.filter(item => item.tipoFactor === 'Tasa' && item.tasaOCuota == .08);
                const factor3Data = response.data.filter(item => item.tipoFactor === 'Tasa' && item.tasaOCuota == .0);
                const factor4Data = response.data.filter(item => item.tipoFactor === 'Exento');

                this.$store.state.detallesIvaMensualExentoStore = {
                    cabecera: "Comprobantes IVA Acreditado",
                    detalles: factor4Data
                };
                this.$store.state.detallesIvaMensualTasa16Store = {
                    cabecera: "Comprobantes IVA Acreditado",
                    detalles: factor1Data
                };
                this.$store.state.detallesIvaMensualTasa8Store = {
                    cabecera: "Comprobantes IVA Acreditado",
                    detalles: factor2Data
                };
                this.$store.state.detallesIvaMensualTasa0Store = {
                    cabecera: "Comprobantes IVA Acreditado",
                    detalles: factor3Data
                };

                //ASIGNAMOS LOS IMPORTES REGISTRADOS EN EL VISOR SAT
                this.$store.state.visorSatIva = {
                    iva16: 0,
                    iva8: 0,
                    iva0: 0,
                    ivaExento: 0,
                }

                this.dialogDetalles = true;
                this.$q.loading.hide()
            },

            CloseDialogDetalles() {
                this.dialogComparativa = false;
                this.dialogDetalles = false;
            },

        },
    }
</script>
<style>
    .bgc-impuestos {
        background-color: #F28500 !important;
        text-align: center !important;
    }

    .total-row-i {
        background-color: #FFC278 !important;
        font-weight: bold;
    }

    .titulo-reporte-impuestos {
        background-color: #fff;
        color: #F28500;
        font-size: 20px;
        font-weight: bold;
        padding: 10px 20px;
        text-align: center;
        border-bottom: 2px solid #F28500;
        font-family: Arial, sans-serif;
    }

    .hover-foliofiscal-i:hover td {
        background-color: #FFC278 !important;
        color: white;
        cursor: pointer;
    }
</style>