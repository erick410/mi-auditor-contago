<template>
    <div class="q-pa-md">
        <!-- DIALOG -->
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

        <!-- DIALOG DE LAS NOTAS -->
        <q-dialog v-model="dialogNotas" persistent transition-show="scale" transition-hide="scale">
            <q-card>
                <q-toolbar>
                    <q-btn flat round dense icon="close" v-close-popup color="red-14">
                        <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                            :offset="[10, 10]">Cerrar</q-tooltip>
                    </q-btn>
                    <q-toolbar-title><span class="text-weight-bold">{{ textoNotas }}</span></q-toolbar-title>
                </q-toolbar>
                <q-separator color="primary" inset />
                <q-card-section v-html="detalleNotas" />
            </q-card>
        </q-dialog>

        <!-- DIALOG DE LOS DETALLES -->
        <q-dialog v-model="dialogDetalles" persistent transition-show="scale" transition-hide="scale" maximized>
            <detalles-nomina @CloseDialogDetalles="CloseDialogDetalles"></detalles-nomina>
        </q-dialog>

        <!-- DIALOG DE LOS DETALLES DE ISR POR HONORARIOS Y ARRENDAMIENTOS -->
        <q-dialog v-model="dialogDetallesIsr" persistent transition-show="scale" transition-hide="scale" maximized>
            <detalles-isr @CloseDialogDetalles="CloseDialogDetalles"></detalles-isr>
        </q-dialog>

        <!-- DIALOG DE LA COMPARATIVA -->
        <q-dialog v-model="dialogComparativa" persistent transition-show="scale" transition-hide="scale">
            <comparativa @CloseDialogDetalles="CloseDialogDetalles"></comparativa>
        </q-dialog>

        <!-- SELECCIONA AÑO Y MES, BOTON DE BUSCAR Y EXPORTAR A EXCEL -->
        <div class="row no-wrap items-center q-mt-md q-pa-sm">
            <q-space />
            <q-select outlined dense v-model="selectedAnio" :options="itemsAnios" label="Año" style="width:80px"
                class="q-mr-xs" />
            <q-select outlined dense v-model="selectedMes" :options="itemsMes" label="Mes" style="width:136px"
                class="q-mr-xs" />
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

        <!-- TABLA DE SUELDOS Y SALARIOS -->
        <q-table title="Reporte ISR" :data="dataSueldos" :columns="columns" row-key="mes" hide-bottom
            :rows-per-page-options="[0]">
            <template v-slot:top>
                <span class="text-body1" content-style="font-size: 20px">Sueldos y Salarios</span>
                <q-space />
                <q-btn push color="blue-7" @click="OpenNotas(1)" icon="mdi-information-outline" rounded flat size="18px"
                    padding="xs">
                    <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                        :offset="[10, 10]">Información</q-tooltip>
                </q-btn>
                <q-btn push color="green-14" @click="OpenComparativa(1)" icon="mdi-compare" rounded flat size="18px"
                    padding="xs">
                    <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                        :offset="[10, 10]">Comparativa</q-tooltip>
                </q-btn>
            </template>
            <template v-slot:body="props">
                <q-tr :props="props" :class="'clase-total-' + props.row.mes">
                    <q-td auto-width>
                        <q-btn size="md" color="primary" rounded flat dense
                            @click="VerDetalles(props.row, 'SUELDOS Y SALARIOS')" icon="mdi-format-list-bulleted"
                            v-if="props.row.detalles.length != 0">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Detalles</q-tooltip>
                        </q-btn>
                    </q-td>
                    <q-td key="mes" :props="props">{{ props.row.mes }}</q-td>
                    <q-td key="importe" :props="props">{{ formatCurrency(props.row.importe) }}</q-td>
                    <q-td key="comparativa" :props="props">{{ formatCurrency(props.row.comparativa) }}</q-td>
                    <q-td key="diferencia" :props="props">{{ formatCurrency(props.row.diferencia) }}</q-td>
                </q-tr>
            </template>
        </q-table>

        <!-- TABLA DE ASIMILADOS -->
        <q-table title="Reporte ISR" :data="dataAsimilados" :columns="columns" row-key="mes" hide-bottom
            :rows-per-page-options="[0]">
            <template v-slot:top>
                <span class="text-body1">Asimilados</span>
                <q-space />
                <q-btn push color="blue-7" @click="OpenNotas(2)" icon="mdi-information-outline" rounded flat size="18px"
                    padding="xs">
                    <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                        :offset="[10, 10]">Información</q-tooltip>
                </q-btn>
                <q-btn push color="green-14" @click="OpenComparativa(2)" icon="mdi-compare" rounded flat size="18px"
                    padding="xs">
                    <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                        :offset="[10, 10]">Comparativa</q-tooltip>
                </q-btn>
            </template>
            <template v-slot:body="props">
                <q-tr :props="props" :class="'clase-total-' + props.row.mes">
                    <q-td auto-width>
                        <q-btn size="md" color="primary" rounded flat dense @click="VerDetalles(props.row, 'ASIMILADOS')"
                            icon="mdi-format-list-bulleted" v-if="props.row.detalles.length != 0">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Detalles</q-tooltip>
                        </q-btn>
                    </q-td>
                    <q-td key="mes" :props="props">{{ props.row.mes }}</q-td>
                    <q-td key="importe" :props="props">{{ formatCurrency(props.row.importe) }}</q-td>
                    <q-td key="comparativa" :props="props">{{ formatCurrency(props.row.comparativa) }}</q-td>
                    <q-td key="diferencia" :props="props">{{ formatCurrency(props.row.diferencia) }}</q-td>
                </q-tr>
            </template>
        </q-table>

        <!-- TABLA DE OTROS -->
        <q-table title="Reporte ISR" :data="dataOtros" :columns="columns" row-key="mes" hide-bottom
            :rows-per-page-options="[0]">
            <template v-slot:top>
                <span class="text-body1">Otros</span>
                <q-space />
                <q-btn push color="blue-7" @click="OpenNotas(3)" icon="mdi-information-outline" rounded flat size="18px"
                    padding="xs">
                    <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                        :offset="[10, 10]">Información</q-tooltip>
                </q-btn>
                <q-btn push color="green-14" @click="OpenComparativa(3)" icon="mdi-compare" rounded flat size="18px"
                    padding="xs">
                    <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                        :offset="[10, 10]">Comparativa</q-tooltip>
                </q-btn>
            </template>
            <template v-slot:body="props">
                <q-tr :props="props" :class="'clase-total-' + props.row.mes">
                    <q-td auto-width>
                        <q-btn size="md" color="primary" rounded flat dense @click="VerDetalles(props.row, 'SUELDOS OTROS')"
                            icon="mdi-format-list-bulleted" v-if="props.row.detalles.length != 0">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Detalles</q-tooltip>
                        </q-btn>
                    </q-td>
                    <q-td key="mes" :props="props">{{ props.row.mes }}</q-td>
                    <q-td key="importe" :props="props">{{ formatCurrency(props.row.importe) }}</q-td>
                    <q-td key="comparativa" :props="props">{{ formatCurrency(props.row.comparativa) }}</q-td>
                    <q-td key="diferencia" :props="props">{{ formatCurrency(props.row.diferencia) }}</q-td>
                </q-tr>
            </template>
        </q-table>

        <!-- TABLA DE ARRENDAMIENTOS -->
        <q-table title="Reporte ISR" :data="dataArrendamientos" :columns="columns" row-key="mes" hide-bottom
            :rows-per-page-options="[0]">
            <template v-slot:top>
                <span class="text-body1">Arrendamientos</span>
                <q-space />
                <q-btn push color="blue-7" @click="OpenNotas(3)" icon="mdi-information-outline" rounded flat size="18px"
                    padding="xs">
                    <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                        :offset="[10, 10]">Información</q-tooltip>
                </q-btn>
                <q-btn push color="green-14" @click="OpenComparativa(4)" icon="mdi-compare" rounded flat size="18px"
                    padding="xs">
                    <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                        :offset="[10, 10]">Comparativa</q-tooltip>
                </q-btn>
            </template>
            <template v-slot:body="props">
                <q-tr :props="props" :class="'clase-total-' + props.row.mes">
                    <q-td auto-width>
                        <q-btn size="md" color="primary" rounded flat dense
                            @click="VerDetallesIsr(props.row, 'ARRENDAMIENTOS')" icon="mdi-format-list-bulleted"
                            v-if="props.row.detalles.length != 0">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Detalles</q-tooltip>
                        </q-btn>
                    </q-td>
                    <q-td key="mes" :props="props">{{ props.row.mes }}</q-td>
                    <q-td key="importe" :props="props">{{ formatCurrency(props.row.importe) }}</q-td>
                    <q-td key="comparativa" :props="props">{{ formatCurrency(props.row.comparativa) }}</q-td>
                    <q-td key="diferencia" :props="props">{{ formatCurrency(props.row.diferencia) }}</q-td>
                </q-tr>
            </template>
        </q-table>

        <!-- TABLA DE HONORARIOS -->
        <q-table title="Reporte ISR" :data="dataHonorarios" :columns="columns" row-key="mes" hide-bottom
            :rows-per-page-options="[0]">
            <template v-slot:top>
                <span class="text-body1">Honorarios</span>
                <q-space />
                <q-btn push color="blue-7" @click="OpenNotas(3)" icon="mdi-information-outline" rounded flat size="18px"
                    padding="xs">
                    <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                        :offset="[10, 10]">Información</q-tooltip>
                </q-btn>
                <q-btn push color="green-14" @click="OpenComparativa(5)" icon="mdi-compare" rounded flat size="18px"
                    padding="xs">
                    <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                        :offset="[10, 10]">Comparativa</q-tooltip>
                </q-btn>
            </template>
            <template v-slot:body="props">
                <q-tr :props="props" :class="'clase-total-' + props.row.mes">
                    <q-td auto-width>
                        <q-btn size="md" color="primary" rounded flat dense @click="VerDetallesIsr(props.row, 'HONORARIOS')"
                            icon="mdi-format-list-bulleted" v-if="props.row.detalles.length != 0">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Detalles</q-tooltip>
                        </q-btn>
                    </q-td>
                    <q-td key="mes" :props="props">{{ props.row.mes }}</q-td>
                    <q-td key="importe" :props="props">{{ formatCurrency(props.row.importe) }}</q-td>
                    <q-td key="comparativa" :props="props">{{ formatCurrency(props.row.comparativa) }}</q-td>
                    <q-td key="diferencia" :props="props">{{ formatCurrency(props.row.diferencia) }}</q-td>
                </q-tr>
            </template>
        </q-table>

        <!-- TABLA DE DEMAS INGRESOS -->
        <q-table title="Reporte ISR" :data="dataDemasIngresos" :columns="columns" row-key="mes" hide-bottom
            :rows-per-page-options="[0]">
            <template v-slot:top>
                <span class="text-body1">Demás Ingresos</span>
                <q-space />
                <q-btn push color="blue-7" @click="OpenNotas(3)" icon="mdi-information-outline" rounded flat size="18px"
                    padding="xs">
                    <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                        :offset="[10, 10]">Información</q-tooltip>
                </q-btn>
                <q-btn push color="green-14" @click="OpenComparativa(6)" icon="mdi-compare" rounded flat size="18px"
                    padding="xs">
                    <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                        :offset="[10, 10]">Comparativa</q-tooltip>
                </q-btn>
            </template>
            <template v-slot:body="props">
                <q-tr :props="props" :class="'clase-total-' + props.row.mes">
                    <q-td auto-width>
                        <q-btn size="md" color="primary" rounded flat dense @click="VerDetallesIsr(props.row, 'DEMAS INGRESOS')"
                            icon="mdi-format-list-bulleted" v-if="props.row.detalles.length != 0">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Detalles</q-tooltip>
                        </q-btn>
                    </q-td>
                    <q-td key="mes" :props="props">{{ props.row.mes }}</q-td>
                    <q-td key="importe" :props="props">{{ formatCurrency(props.row.importe) }}</q-td>
                    <q-td key="comparativa" :props="props">{{ formatCurrency(props.row.comparativa) }}</q-td>
                    <q-td key="diferencia" :props="props">{{ formatCurrency(props.row.diferencia) }}</q-td>
                </q-tr>
            </template>
        </q-table>

        <!-- GRAFICA-->
        <q-card style="width: 100%; " class="full-width q-mt-lg">
            <chart-component :chartData="chartData1" :chartTitle="charTitleE1"  ></chart-component>
        </q-card>

        <!-- GRAFICA-->
        <q-card style="width: 100%; " class="full-width q-mt-lg">
            <chart-component :chartData="chartData2" :chartTitle="charTitleE2"  ></chart-component>
        </q-card>
    </div>
</template>
<script>
import axios from 'axios';
import moment from 'moment';
import DetallesNomina from '../Nomina/DetallesNomina.vue';
import DetallesIsr from './ReporteIsrMDet.vue';
import Comparativa from '../Nomina/ComparativaNomina.vue';
import * as xlsx from 'xlsx';
import ChartComponent from "../Graficas/ChartComponent.vue";

export default {
    components: {
        DetallesNomina,
        Comparativa,
            ChartComponent,
        DetallesIsr,
    },
    data() {
        return {
            itemsAnios: ['2026','2025','2024','2023', '2022', '2021', '2020', '2019', '2018'],
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
            selectedMes: null,

            columns: [
                { name: 'actions', align: 'left', label: 'Acciones', field: 'actions' },
                { name: 'mes', align: 'left', label: 'Mes', field: 'mes' },
                { name: 'importe', align: 'right', label: 'Importe', field: 'importe' },
                { name: 'comparativa', align: 'right', label: 'Comparativa', field: 'comparativa' },
                { name: 'diferencia', align: 'right', label: 'Diferencia', field: 'diferencia' },
            ],
            dataSueldos: [],
            dataAsimilados: [],
            dataOtros: [],

            dataArrendamientos: [],
            dataHonorarios: [],
            dataDemasIngresos: [],

            //DATOS DE CARGANDO
            dialog: false,
            dialogtext: '',

            //DATOS DE LOS DETALLES
            dialogDetalles: false,
            dialogDetallesIsr: false,

            //DATOS DE LA INFORMACION ADICIONAL
            dialogNotas: false,
            textoNotas: '',
            detalleNotas: '',

            //DATOS DE LA COMPARATAIVA
            dialogComparativa: false,

            charTitleE1: 'Reporte de ISR (Arrendamientos, Honorarios)',
            chartData1: null,

            charTitleE2: 'Reporte de ISR (Sueldos - Salarios, Asimilados, Otros)',
            chartData2: null,
        }
    },
    computed: {
        token() {
            return this.$store.state.usuario;
        },

        sumaSueldos() {
            let suma = this.dataSueldos.reduce((acumulador, objeto) => acumulador + objeto.importe, 0);
            let resultado = this.formatCurrency(suma);
            return resultado;
        },

        sumaAsimilados() {
            let suma = this.dataAsimilados.reduce((acumulador, objeto) => acumulador + objeto.importe, 0);
            let resultado = this.formatCurrency(suma);
            return resultado;
        },

        sumaOtros() {
            let suma = this.dataOtros.reduce((acumulador, objeto) => acumulador + objeto.importe, 0);
            let resultado = this.formatCurrency(suma);
            return resultado;
        },

        sumaArrendamientos() {
            let suma = this.dataArrendamientos.reduce((acumulador, objeto) => acumulador + objeto.importe, 0);
            let resultado = this.formatCurrency(suma);
            return resultado;
        },

        sumaHonorarios() {
            let suma = this.dataHonorarios.reduce((acumulador, objeto) => acumulador + objeto.importe, 0);
            let resultado = this.formatCurrency(suma);
            return resultado;
        },

        sumaDemasIngresos() {
            let suma = this.dataDemasIngresos.reduce((acumulador, objeto) => acumulador + objeto.importe, 0);
            let resultado = this.formatCurrency(suma);
            return resultado;
        },

        comparativa() {
            return this.$store.state.comparativaStore;
        },

        rutaAxios() {
            return this.$store.state.rutaMongoStore
        },

    },
    created() {

    },
    methods: {
        async GetReporte() {
            if (!this.selectedAnio) {
                this.ShowNotifsWarning('Seleccione el año');
                return;
            }
            if (!this.selectedMes) {
                this.ShowNotifsWarning('Seleccione el mes');
                return;
            }
            this.dialog = true;
            await this.GetReporteNomina();
            await this.GetReporteIsr();
            this.dialog = false;
        },

        async GetReporteNomina() {
            try {
                this.dialogtext = 'Consultando comparativas'

                //CONSULTANOS LAS COMPARATIVAS
                let comparativaSueldos = await this.GetComparativa(this.selectedAnio, 'Sueldos');
                let comparativaAsimilados = await this.GetComparativa(this.selectedAnio, 'Asimilados');
                let comparativaOtros = await this.GetComparativa(this.selectedAnio, 'SueldosOtros');

                this.dialogtext = 'Calculando ISR ...'
                let fechaI = this.selectedAnio + '-01-01';
                let fechaF = this.selectedAnio + '-' + this.selectedMes.value + '-01';
                let response = await axios.get(this.rutaAxios + 'Nomina/GetReporteISrAsync/erp_' + this.token.rfc + '/' + fechaI + '/' + fechaF);
                let res = response.data;
                this.dataSueldos = res[0];
                this.dataAsimilados = res[1];
                this.dataOtros = res[2];
                console.log(this.dataSueldos);
                await this.GenerarGrafica(this.dataSueldos,this.dataAsimilados,this.dataOtros);

                let mesFin = this.selectedMes.value;
                //ASIGNAMOS LAS COMPARATIVAS
                for (let a = 0; a < mesFin; a++) {
                    this.dataSueldos[a].comparativa = comparativaSueldos[a].importe
                    let diferencia = this.dataSueldos[a].importe - comparativaSueldos[a].importe
                    this.dataSueldos[a].diferencia = diferencia
                }
                for (let a = 0; a < mesFin; a++) {
                    this.dataAsimilados[a].comparativa = comparativaAsimilados[a].importe
                    let diferencia = this.dataAsimilados[a].importe - comparativaAsimilados[a].importe
                    this.dataAsimilados[a].diferencia = diferencia
                }
                for (let a = 0; a < mesFin; a++) {
                    this.dataOtros[a].comparativa = comparativaOtros[a].importe
                    let diferencia = this.dataOtros[a].importe - comparativaOtros[a].importe
                    this.dataOtros[a].diferencia = diferencia
                }

                let totalesSueldos = {
                    detalles: [],
                    mes: 'Total',
                    importe: this.dataSueldos.reduce((acumulador, objeto) => acumulador + objeto.importe, 0),
                    comparativa: this.dataSueldos.reduce((acumulador, objeto) => acumulador + objeto.comparativa, 0),
                    diferencia: this.dataSueldos.reduce((acumulador, objeto) => acumulador + objeto.diferencia, 0),
                }

                let totalesAsimilados = {
                    detalles: [],
                    mes: 'Total',
                    importe: this.dataAsimilados.reduce((acumulador, objeto) => acumulador + objeto.importe, 0),
                    comparativa: this.dataAsimilados.reduce((acumulador, objeto) => acumulador + objeto.comparativa, 0),
                    diferencia: this.dataAsimilados.reduce((acumulador, objeto) => acumulador + objeto.diferencia, 0),
                }
                let totalesOtros = {
                    detalles: [],
                    mes: 'Total',
                    importe: this.dataOtros.reduce((acumulador, objeto) => acumulador + objeto.importe, 0),
                    comparativa: this.dataOtros.reduce((acumulador, objeto) => acumulador + objeto.comparativa, 0),
                    diferencia: this.dataOtros.reduce((acumulador, objeto) => acumulador + objeto.diferencia, 0),
                }
                this.dataSueldos.push(totalesSueldos)
                this.dataAsimilados.push(totalesAsimilados)
                this.dataOtros.push(totalesOtros)


            } catch (error) {
                console.log(error)
            }
        },

        async GenerarGrafica(dataSueldos,dataAsimilados,dataOtros){
                   const meses = dataSueldos.map((item) => item.mes);
                    const sueldos = dataSueldos.map((item) => item.importe);
                    const asimilados = dataAsimilados.map((item) => item.importe);
                    const otros = dataAsimilados.map((item) => item.importe);

                    let obj1 = {
                        type: 'line',
                        label: 'Sueldos y salarios (Linea)',
                        borderColor: '#FFA726',
                        borderWidth: 2,
                        fill: false,
                        data: sueldos
                    }

                    let obj2 = {
                        type: 'bar',
                        label: 'Sueldos y salarios (Barra)',
                        backgroundColor: '#FFA726',
                        data: sueldos,
                        borderColor: 'white',
                        borderWidth: 2
                    }

                    let obj3 = {
                        type: 'line',
                        label: 'Asimilados (Linea)',
                        borderColor: '#66BB6A',
                        borderWidth: 2,
                        fill: false,
                        data: asimilados
                    }

                    let obj4 = {
                        type: 'bar',
                        label: 'Asimilados (Barra)',
                        backgroundColor: '#66BB6A',
                        data: asimilados,
                        borderColor: 'white',
                        borderWidth: 2
                    }
                    let obj5 = {
                        type: 'line',
                        label: 'Otros (Linea)',
                        borderColor: '#E74747',
                        borderWidth: 2,
                        fill: false,
                        data: otros
                    }

                    let obj6 = {
                        type: 'bar',
                        label: 'Otros (Barra)',
                        backgroundColor: '#E74747',
                        data: otros,
                        borderColor: 'white',
                        borderWidth: 2
                    }
                    let chartDatas = {
                        labels: meses,
                        datasets: []
                    }

                    chartDatas.datasets.push(obj1)
                    chartDatas.datasets.push(obj2)
                    chartDatas.datasets.push(obj3)
                    chartDatas.datasets.push(obj4)
                    chartDatas.datasets.push(obj5)
                    chartDatas.datasets.push(obj6)
                    this.chartData2 = { ...chartDatas }
                    console.log(this.chartData2)
            },

        async GetReporteIsr() {
            try {
                //CONSULTANOS LAS COMPARATIVAS
                let comparativaArrendamientos = await this.GetComparativa(this.selectedAnio, 'Arrendamientos');
                let comparativaHonorarios = await this.GetComparativa(this.selectedAnio, 'Honorarios');
                let comparativaDemasIngresos = await this.GetComparativa(this.selectedAnio, 'DemasIngresos');

                this.dialogtext = 'Calculando ISR'
                let fechaI = this.selectedAnio + '-01-01';
                let fechaF = this.selectedAnio + '-' + this.selectedMes.value + '-01';
                let response = await axios.get(this.rutaAxios + 'Gastos/GetReporteIsrAsync/erp_' + this.token.rfc + '/' + fechaI + '/' + fechaF);
                console.log(response.data)
                this.dataArrendamientos = response.data[0];
                this.dataHonorarios = response.data[1];
                this.dataDemasIngresos = response.data[2];
                
                await this.GenerarGrafica1(this.dataArrendamientos,this.dataHonorarios);

                let mesFin = this.selectedMes.value;

                //ASIGNAMOS LAS COMPARATIVAS
                for (let a = 0; a < mesFin; a++) {
                    this.dataArrendamientos[a].comparativa = comparativaArrendamientos[a].importe
                    let diferencia = this.dataArrendamientos[a].importe - comparativaArrendamientos[a].importe
                    this.dataArrendamientos[a].diferencia = diferencia
                }
                for (let a = 0; a < mesFin; a++) {
                    this.dataHonorarios[a].comparativa = comparativaHonorarios[a].importe
                    let diferencia = this.dataHonorarios[a].importe - comparativaHonorarios[a].importe
                    this.dataHonorarios[a].diferencia = diferencia
                }
                for (let a = 0; a < mesFin; a++) {
                    this.dataDemasIngresos[a].comparativa = comparativaDemasIngresos[a].importe
                    let diferencia = this.dataDemasIngresos[a].importe - comparativaDemasIngresos[a].importe
                    this.dataDemasIngresos[a].diferencia = diferencia
                }

                let totalesArrendamientos = {
                    detalles: [],
                    mes: 'Total',
                    importe: this.dataArrendamientos.reduce((acumulador, objeto) => acumulador + objeto.importe, 0),
                    comparativa: this.dataArrendamientos.reduce((acumulador, objeto) => acumulador + objeto.comparativa, 0),
                    diferencia: this.dataArrendamientos.reduce((acumulador, objeto) => acumulador + objeto.diferencia, 0),
                }
                let totalesHonorarios = {
                    detalles: [],
                    mes: 'Total',
                    importe: this.dataHonorarios.reduce((acumulador, objeto) => acumulador + objeto.importe, 0),
                    comparativa: this.dataHonorarios.reduce((acumulador, objeto) => acumulador + objeto.comparativa, 0),
                    diferencia: this.dataHonorarios.reduce((acumulador, objeto) => acumulador + objeto.diferencia, 0),
                }
                let totalesDemasIngresos = {
                    detalles: [],
                    mes: 'Total',
                    importe: this.dataDemasIngresos.reduce((acumulador, objeto) => acumulador + objeto.importe, 0),
                    comparativa: this.dataDemasIngresos.reduce((acumulador, objeto) => acumulador + objeto.comparativa, 0),
                    diferencia: this.dataDemasIngresos.reduce((acumulador, objeto) => acumulador + objeto.diferencia, 0),
                }
                this.dataArrendamientos.push(totalesArrendamientos)
                this.dataHonorarios.push(totalesHonorarios)
                this.dataDemasIngresos.push(totalesDemasIngresos)

            } catch (error) {
                console.log(error);
            }
        },
        
        async GenerarGrafica1(dataArrendamientos,dataHonorarios){
            const meses = dataArrendamientos.map((item) => item.mes);
            const arrendamientos = dataArrendamientos.map((item) => item.importe);
            const honorarios = dataHonorarios.map((item) => item.importe);

            let obj1 = {
                type: 'line',
                label: 'Arrendamientos (Linea)',
                borderColor: '#FFA726',
                borderWidth: 2,
                fill: false,
                data: arrendamientos
            }

            let obj2 = {
                type: 'bar',
                label: 'Arrendamientos (Barra)',
                backgroundColor: '#FFA726',
                data: arrendamientos,
                borderColor: 'white',
                borderWidth: 2
            }

            let obj3 = {
                type: 'line',
                label: 'Honorarios (Linea)',
                borderColor: '#66BB6A',
                borderWidth: 2,
                fill: false,
                data: honorarios
            }

            let obj4 = {
                type: 'bar',
                label: 'Honorarios (Barra)',
                backgroundColor: '#66BB6A',
                data: honorarios,
                borderColor: 'white',
                borderWidth: 2
            }
            
            let chartDatas = {
                labels: meses,
                datasets: []
            }

            chartDatas.datasets.push(obj1)
            chartDatas.datasets.push(obj2)
            chartDatas.datasets.push(obj3)
            chartDatas.datasets.push(obj4)
            this.chartData1 = { ...chartDatas }
            console.log(this.chartData1)
        },
        
        VerDetalles(item, tipo) {
            this.$store.state.detallesIsrStore.detalles = [...item.detalles]
            this.$store.state.detallesIsrStore.tipo = tipo
            this.$store.state.detallesIsrStore.origen = "ISR"

            this.dialogDetalles = true;
        },

        VerDetallesIsr(item, tipo) {
            console.log(item.detalles)
            this.$store.state.detallesIsrMStore.cabecera = tipo;
            this.$store.state.detallesIsrMStore.origen = "ISR"
            this.$store.state.detallesIsrMStore.tipo = tipo
            this.$store.state.detallesIsrMStore.detalles = [...item.detalles]
            this.dialogDetallesIsr = true;
        },

        // FALTA
        ExportExcel() {
            if (this.dataSueldos.length == 0) {
                this.ShowNotifsWarning('Genere el reporte, para exportar el excel')
                return;
            }

            let empresa = this.$store.state.empresaStore.nombre
            let rfc = this.$store.state.empresaStore.rfc

            const sueldosFiltrados = this.dataSueldos.map((fila) => {
                const { ["detalles"]: columnaExcluida, ...restoDeColumnas } = fila;
                return restoDeColumnas;
            });

            const asimiladosFiltrados = this.dataAsimilados.map((fila) => {
                const { ["detalles"]: columnaExcluida, ...restoDeColumnas } = fila;
                return restoDeColumnas;
            });

            const otrosFiltrados = this.dataOtros.map((fila) => {
                const { ["detalles"]: columnaExcluida, ...restoDeColumnas } = fila;
                return restoDeColumnas;
            });

            const workbook = xlsx.utils.book_new();

            const sheetSueldos = xlsx.utils.json_to_sheet(sueldosFiltrados);
            xlsx.utils.book_append_sheet(workbook, sheetSueldos, 'SUELDOS Y SALARIOS');

            const sheetAsimilados = xlsx.utils.json_to_sheet(asimiladosFiltrados);
            xlsx.utils.book_append_sheet(workbook, sheetAsimilados, 'ASIMILADOS');

            const sheetOtros = xlsx.utils.json_to_sheet(otrosFiltrados);
            xlsx.utils.book_append_sheet(workbook, sheetOtros, 'OTROS');

            const sheetArrendamientos = xlsx.utils.json_to_sheet(this.dataArrendamientos);
            xlsx.utils.book_append_sheet(workbook, sheetArrendamientos, 'ARRENDAMIENTOS');

            const sheetHonorarios = xlsx.utils.json_to_sheet(this.dataHonorarios);
            xlsx.utils.book_append_sheet(workbook, sheetHonorarios, 'HONORARIOS');

            xlsx.writeFile(workbook, rfc + ' - ' + empresa + ' - REPORTE ISR DE ENERO A ' + this.selectedMes.label + ' ' + this.selectedAnio + '.xlsx');
        },

        formatCurrency(value) {
            return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        },

        CloseDialogDetalles() {
            this.dialogComparativa = false;
            this.dialogDetalles = false;
            this.dialogDetallesIsr = false;
        },

        ShowNotifsWarning(mensaje) {
            this.$q.notify({
                progress: true,
                message: mensaje,
                type: 'warning',
                position: 'top-right',
                actions: [
                    { label: 'Cerrar', color: 'white', handler: () => { /* ... */ } }
                ]
            })
        },

        OpenNotas(item) {
            this.dialogNotas = true;
            if (item == 1) {
                this.textoNotas = 'Sueldos y Salarios';
                this.detalleNotas = '♦ 02 | Sueldos (Incluye ingresos señalados en la fracción I del artículo 94 de LISR)';
            }
            if (item == 2) {
                this.textoNotas = 'Asimilados';
                this.detalleNotas = '♦ 05 | Asimilados Miembros Sociedades Cooperativas Produccion<br>♦ 06 | Asimilados Integrantes Sociedades Asociaciones Civiles<br>♦ 07 | Asimilados Miembros consejos<br>♦ 08 | Asimilados comisionistas<br>♦ 09 | Asimilados Honorarios<br>♦ 10 | Asimilados acciones<br>♦ 11 | Asimilados otros';
            }
            if (item == 3) {
                this.textoNotas = 'Sueldos Otros';
                this.detalleNotas = '♦ 03 | Jubilados<br>♦ 04 | Pensionados<br>♦ 12 | Jubilados o Pensionados<br>♦ 13 | Indemnización o Separación<br>♦ 99 | Otro Regimen';
            }
        },

        async OpenComparativa(item) {
            if (!this.selectedAnio) {
                this.ShowNotifsWarning('Seleccione el año');
                return;
            }
            this.dialog = true;
            this.dialogtext = 'Consultando datos ...'
            let respuesta = {}

            if (item == 1) {
                this.comparativa.textoComparativa = 'Comparativa Sueldos y Salarios';
                this.comparativa.año = this.selectedAnio;
                this.comparativa.tipo = 'Sueldos';

                respuesta = await this.GetComparativa(this.selectedAnio, 'Sueldos');
            }
            if (item == 2) {
                this.comparativa.textoComparativa = 'Comparativa Asimilados';
                this.comparativa.año = this.selectedAnio;
                this.comparativa.tipo = 'Asimilados';

                respuesta = await this.GetComparativa(this.selectedAnio, 'Asimilados');
            }
            if (item == 3) {
                this.comparativa.textoComparativa = 'Comparativa Sueldos Otros';
                this.comparativa.año = this.selectedAnio;
                this.comparativa.tipo = 'SueldosOtros';

                respuesta = await this.GetComparativa(this.selectedAnio, 'SueldosOtros');
            }
            if (item == 4) {
                this.comparativa.textoComparativa = 'Comparativa Arrendamientos';
                this.comparativa.año = this.selectedAnio;
                this.comparativa.tipo = 'Arrendamientos';

                respuesta = await this.GetComparativa(this.selectedAnio, 'Arrendamientos');
            }
            if (item == 5) {
                this.comparativa.textoComparativa = 'Comparativa Honorarios';
                this.comparativa.año = this.selectedAnio;
                this.comparativa.tipo = 'Honorarios';

                respuesta = await this.GetComparativa(this.selectedAnio, 'Honorarios');
            }

            if (item == 6) {
                this.comparativa.textoComparativa = 'Comparativa Demás Ingresos';
                this.comparativa.año = this.selectedAnio;
                this.comparativa.tipo = 'DemasIngresos';

                respuesta = await this.GetComparativa(this.selectedAnio, 'DemasIngresos');
            }

            this.comparativa.comparativa.enero = respuesta[0].importe;
            this.comparativa.comparativa.febrero = respuesta[1].importe;
            this.comparativa.comparativa.marzo = respuesta[2].importe;
            this.comparativa.comparativa.abril = respuesta[3].importe;
            this.comparativa.comparativa.mayo = respuesta[4].importe;
            this.comparativa.comparativa.junio = respuesta[5].importe;
            this.comparativa.comparativa.julio = respuesta[6].importe;
            this.comparativa.comparativa.agosto = respuesta[7].importe;
            this.comparativa.comparativa.septiembre = respuesta[8].importe;
            this.comparativa.comparativa.octubre = respuesta[9].importe;
            this.comparativa.comparativa.noviembre = respuesta[10].importe;
            this.comparativa.comparativa.diciembre = respuesta[11].importe;

            this.dialogComparativa = true;
            this.dialog = false;
        },

        async GetComparativa(año, tipo) {
            let respuesta = [
                { mes: 'ENERO', importe: 0, ivaCargo: 0, ivaFavor: 0 },
                { mes: 'FEBRERO', importe: 0, ivaCargo: 0, ivaFavor: 0 },
                { mes: 'MARZO', importe: 0, ivaCargo: 0, ivaFavor: 0 },
                { mes: 'ABRIL', importe: 0, ivaCargo: 0, ivaFavor: 0 },
                { mes: 'MAYO', importe: 0, ivaCargo: 0, ivaFavor: 0 },
                { mes: 'JUNIO', importe: 0, ivaCargo: 0, ivaFavor: 0 },
                { mes: 'JULIO', importe: 0, ivaCargo: 0, ivaFavor: 0 },
                { mes: 'AGOSTO', importe: 0, ivaCargo: 0, ivaFavor: 0 },
                { mes: 'SEPTIEMBRE', importe: 0, ivaCargo: 0, ivaFavor: 0 },
                { mes: 'OCTUBRE', importe: 0, ivaCargo: 0, ivaFavor: 0 },
                { mes: 'NOVIEMBRE', importe: 0, ivaCargo: 0, ivaFavor: 0 },
                { mes: 'DICIEMBRE', importe: 0, ivaCargo: 0, ivaFavor: 0 },
            ]
            try {
                let response = await axios.get(this.rutaAxios + 'Comparativa/GetComparativaAsync/erp_' + this.token.rfc + '/' + año + '/' + tipo);
                respuesta = response.data.comparativa
                return respuesta;
            } catch (error) {
                console.log(error)
                return respuesta;
            }
        },
    },
}
</script>