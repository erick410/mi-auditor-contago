<template>
    <div class="q-pa-md">
        <!-- DIALOG DE LOS DETALLES -->
        <q-dialog v-model="dialogDetalles" persistent transition-show="scale" transition-hide="scale" maximized>
            <!-- <detalles @CloseDialogDetalles="CloseDialogDetalles"></detalles> -->
        </q-dialog>

        <!-- SELECCIONA AÑO Y MES, BOTON DE BUSCAR Y EXPORTAR A EXCEL -->
        <div class="row no-wrap items-center q-mt-md q-pa-sm">
            <q-space />
            <q-select outlined dense v-model="selectedAnio" :options="itemsAnios" label="Año" style="width:80px"
                class="q-mr-xs" />
            <q-select outlined dense v-model="selectedMesI" :options="itemsMes" label="Mes Inicial" style="width:136px"
                class="q-mr-xs" />
            <q-select outlined dense v-model="selectedMesF" :options="itemsMes" label="Mes Final" style="width:136px"
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

        <!-- TABLA DE MAGNA -->
        <q-table title="Reporte ISR" :data="dataMagna" :columns="columns" row-key="nombreMes" :rows-per-page-options="[13]"
            hide-bottom dense class="my-sticky-column-table">
            <template v-slot:top>
                <span class="text-body1 text-green-10" content-style="font-size: 20px">MAGNA </span>
            </template>

            <template v-slot:header="props">
                <q-tr :props="props">
                    <q-th v-for="col in props.cols" :key="col.name" :props="props" class="text-green-10">
                        {{ col.label }}
                    </q-th>
                </q-tr>
            </template>

            <template v-slot:body="props">
                <q-tr :props="props" :class="'clase-total-' + props.row.nombreMes">
                    <q-td key="nombreMes" :props="props">{{ props.row.nombreMes }}</q-td>

                    <q-td key="litrosVentas" :props="props">{{ FormatoCantidad(props.row.litrosVentas) }}</q-td>
                    <q-td key="importeVentas" :props="props">{{ FormatCurrency(props.row.importeVentas) }}</q-td>
                    <q-td key="descuentoVentas" :props="props">{{ FormatCurrency(props.row.descuentoVentas) }}</q-td>
                    <q-td key="subTotalVentas" :props="props">{{ FormatCurrency(props.row.subTotalVentas) }}</q-td>
                    <q-td key="promedioVentas" :props="props">{{ FormatCurrency(props.row.promedioVentas) }}</q-td>

                    <q-td key="litrosCompras" :props="props">{{ FormatoCantidad(props.row.litrosCompras) }}</q-td>
                    <q-td key="importeCompras" :props="props">{{ FormatCurrency(props.row.importeCompras) }}</q-td>
                    <q-td key="descuentoCompras" :props="props">{{ FormatCurrency(props.row.descuentoCompras) }}</q-td>
                    <q-td key="subTotalCompras" :props="props">{{ FormatCurrency(props.row.subTotalCompras) }}</q-td>
                    <q-td key="promedioCompras" :props="props">{{ FormatCurrency(props.row.promedioCompras) }}</q-td>

                    <q-td key="porcentajeUtilidad" :props="props">{{ FormatoPorcentaje(props.row.porcentajeUtilidad)
                    }}%</q-td>
                    <q-td key="utilidadPeriodo" :props="props">{{ FormatCurrency(props.row.utilidadPeriodo) }}</q-td>
                </q-tr>
            </template>

        </q-table>
        <br>
        <!-- TABLA DE PREMIUM -->
        <q-table title="Reporte ISR" :data="dataPremium" :columns="columns" row-key="nombreMes"
            :rows-per-page-options="[13]" hide-bottom dense class="my-sticky-column-table">
            <template v-slot:top>
                <span class="text-body1 text-red-10" content-style="font-size: 20px">PREMIUM </span>
            </template>

            <template v-slot:header="props">
                <q-tr :props="props">
                    <q-th v-for="col in props.cols" :key="col.name" :props="props" class="text-red-10">
                        {{ col.label }}
                    </q-th>
                </q-tr>
            </template>

            <template v-slot:body="props">
                <q-tr :props="props" :class="'clase-total-' + props.row.nombreMes">
                    <q-td key="nombreMes" :props="props">{{ props.row.nombreMes }}</q-td>

                    <q-td key="litrosVentas" :props="props">{{ FormatoCantidad(props.row.litrosVentas) }}</q-td>
                    <q-td key="importeVentas" :props="props">{{ FormatCurrency(props.row.importeVentas) }}</q-td>
                    <q-td key="descuentoVentas" :props="props">{{ FormatCurrency(props.row.descuentoVentas) }}</q-td>
                    <q-td key="subTotalVentas" :props="props">{{ FormatCurrency(props.row.subTotalVentas) }}</q-td>
                    <q-td key="promedioVentas" :props="props">{{ FormatCurrency(props.row.promedioVentas) }}</q-td>

                    <q-td key="litrosCompras" :props="props">{{ FormatoCantidad(props.row.litrosCompras) }}</q-td>
                    <q-td key="importeCompras" :props="props">{{ FormatCurrency(props.row.importeCompras) }}</q-td>
                    <q-td key="descuentoCompras" :props="props">{{ FormatCurrency(props.row.descuentoCompras) }}</q-td>
                    <q-td key="subTotalCompras" :props="props">{{ FormatCurrency(props.row.subTotalCompras) }}</q-td>
                    <q-td key="promedioCompras" :props="props">{{ FormatCurrency(props.row.promedioCompras) }}</q-td>

                    <q-td key="porcentajeUtilidad" :props="props">{{ FormatoPorcentaje(props.row.porcentajeUtilidad)
                    }}%</q-td>
                    <q-td key="utilidadPeriodo" :props="props">{{ FormatCurrency(props.row.utilidadPeriodo) }}</q-td>
                </q-tr>
            </template>
        </q-table>
        <br>
        <!-- TABLA DE DIESEL -->
        <q-table title="Reporte ISR" :data="dataDiesel" :columns="columns" row-key="nombreMes" :rows-per-page-options="[13]"
            hide-bottom dense class="my-sticky-column-table">
            <template v-slot:top>
                <span class="text-body1 text-blue-grey-10" content-style="font-size: 20px">DIESEL </span>
            </template>

            <template v-slot:header="props">
                <q-tr :props="props">
                    <q-th v-for="col in props.cols" :key="col.name" :props="props" class="text-blue-grey-10">
                        {{ col.label }}
                    </q-th>
                </q-tr>
            </template>

            <template v-slot:body="props">
                <q-tr :props="props" :class="'clase-total-' + props.row.nombreMes">
                    <q-td key="nombreMes" :props="props">{{ props.row.nombreMes }}</q-td>

                    <q-td key="litrosVentas" :props="props">{{ FormatoCantidad(props.row.litrosVentas) }}</q-td>
                    <q-td key="importeVentas" :props="props">{{ FormatCurrency(props.row.importeVentas) }}</q-td>
                    <q-td key="descuentoVentas" :props="props">{{ FormatCurrency(props.row.descuentoVentas) }}</q-td>
                    <q-td key="subTotalVentas" :props="props">{{ FormatCurrency(props.row.subTotalVentas) }}</q-td>
                    <q-td key="promedioVentas" :props="props">{{ FormatCurrency(props.row.promedioVentas) }}</q-td>

                    <q-td key="litrosCompras" :props="props">{{ FormatoCantidad(props.row.litrosCompras) }}</q-td>
                    <q-td key="importeCompras" :props="props">{{ FormatCurrency(props.row.importeCompras) }}</q-td>
                    <q-td key="descuentoCompras" :props="props">{{ FormatCurrency(props.row.descuentoCompras) }}</q-td>
                    <q-td key="subTotalCompras" :props="props">{{ FormatCurrency(props.row.subTotalCompras) }}</q-td>
                    <q-td key="promedioCompras" :props="props">{{ FormatCurrency(props.row.promedioCompras) }}</q-td>

                    <q-td key="porcentajeUtilidad" :props="props">{{ FormatoPorcentaje(props.row.porcentajeUtilidad)
                    }}%</q-td>
                    <q-td key="utilidadPeriodo" :props="props">{{ FormatCurrency(props.row.utilidadPeriodo) }}</q-td>
                </q-tr>
            </template>
        </q-table>
    </div>
</template>
<script>
import axios from 'axios'
import { parseISO, parse, isSameMonth } from 'date-fns'
import * as XLSX from 'xlsx';
import { QSpinnerCube } from 'quasar';

export default {
    components: {
    },
    data() {
        return {
            columns: [
                { name: 'nombreMes', align: 'left', label: 'Mes', field: 'nombreMes' },

                { name: 'litrosVentas', align: 'right', label: 'Litros Vendidos (Facturados)', field: 'litrosVentas' },
                { name: 'importeVentas', align: 'right', label: 'Importe Ventas (Facturados)', field: 'importeVentas' },
                { name: 'descuentoVentas', align: 'right', label: 'Descuento Ventas (Facturados)', field: 'descuentoVentas' },
                { name: 'subTotalVentas', align: 'right', label: 'SuTotal Ventas (Facturados)', field: 'subTotalVentas' },
                { name: 'promedioVentas', align: 'right', label: 'Promedio Ventas (Facturados)', field: 'promedioVentas' },

                { name: 'litrosCompras', align: 'right', label: 'Litros Compras (Facturados)', field: 'litrosCompras' },
                { name: 'importeCompras', align: 'right', label: 'Importe Compras (Facturados)', field: 'importeCompras' },
                { name: 'descuentoCompras', align: 'right', label: 'Descuento Compras (Facturados)', field: 'descuentoCompras' },
                { name: 'subTotalCompras', align: 'right', label: 'SuTotal Compras (Facturados)', field: 'subTotalCompras' },
                { name: 'promedioCompras', align: 'right', label: 'Promedio Compras (Facturados)', field: 'promedioCompras' },

                { name: 'porcentajeUtilidad', align: 'right', label: 'Porcentaje de Utilidad', field: 'porcentajeUtilidad' },
                { name: 'utilidadPeriodo', align: 'right', label: 'Utilidad Estimada del Periodo', field: 'utilidadPeriodo' },
            ],
            dataMagna: [],
            dataPremium: [],
            dataDiesel: [],

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
            selectedMesI: null,
            selectedMesF: null,

            //DATOS DE LOS DETALLES
            dialogDetalles: false,

        }
    },
    computed: {
        token() {
            return this.$store.state.usuario;
        },

        sumTotal() {
            let suma = this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.total, 0);
            let resultado = this.FormatCurrency(suma);
            return resultado;
        },

        rutaAxios() {
            return this.$store.state.rutaMongoStore
        },

    },
    created() {

    },
    methods: {
        async GetReporte() {
            this.dataMagna = [];
            this.dataPremium = [];
            this.dataDiesel = [];

            this.$q.loading.show({
                spinner: QSpinnerCube,
                spinnerColor: 'red-8',
                spinnerSize: 140,
                message: 'Consultando datos, espere...',
            })

            try {
                // //CONSULTAMOS LAS VENTAS Y LAS COMPRAS
                const ventas = await this.GetVentas();
                const compras = await this.GetCompras();

                // //RECORREMOS PARA HACER LA LISTA
                const meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE']

                let indiceM = 0;
                let indiceP = 0;
                let indiceD = 0;
                for (let a = this.selectedMesI.value; a <= this.selectedMesF.value; a++) {
                    //MAGNA
                    let BuscaMagnaV = ventas.find(f => f.mes == a && f.producto === 'MAGNA')
                    let BuscaMagnaC = compras.find(f => f.mes == a && f.producto === 'MAGNA')
                    let ObjMagna = {
                        nombreMes: meses[a - 1],

                        litrosVentas: 0,
                        importeVentas: 0,
                        descuentoVentas: 0,
                        subTotalVentas: 0,
                        promedioVentas: 0,

                        litrosCompras: 0,
                        importeCompras: 0,
                        descuentoCompras: 0,
                        subTotalCompras: 0,
                        promedioCompras: 0,

                        porcentajeUtilidad: 0,
                        utilidadPeriodo: 0,
                    }
                    if (BuscaMagnaV) {
                        ObjMagna.litrosVentas = BuscaMagnaV.litros;
                        ObjMagna.importeVentas = BuscaMagnaV.importe;
                        ObjMagna.descuentoVentas = BuscaMagnaV.descuento;
                        ObjMagna.subTotalVentas = BuscaMagnaV.subTotal;
                        ObjMagna.promedioVentas = BuscaMagnaV.subTotalPromedio;
                    }
                    if (BuscaMagnaC) {
                        ObjMagna.litrosCompras = BuscaMagnaC.litros;
                        ObjMagna.importeCompras = BuscaMagnaC.importe;
                        ObjMagna.descuentoCompras = BuscaMagnaC.descuento;
                        ObjMagna.subTotalCompras = BuscaMagnaC.subTotal;
                        ObjMagna.promedioCompras = BuscaMagnaC.subTotalPromedio;
                    }
                    //VALIDAMOS EL COSTO DE COMPRA
                    if (ObjMagna.promedioCompras != 0) {
                        indiceM = ObjMagna.promedioCompras;
                    }
                    ObjMagna.promedioCompras = indiceM;

                    ObjMagna.diferencia = ObjMagna.subTotalVentas - ObjMagna.subTotalCompras;
                    if (ObjMagna.promedioVentas != 0) {
                        ObjMagna.porcentajeUtilidad = ((ObjMagna.promedioCompras / ObjMagna.promedioVentas) - 1) * 100 * -1;
                    }

                    //UTILIDAD DEL PERIODO
                    let utilidadM = ObjMagna.subTotalVentas * ObjMagna.porcentajeUtilidad / 100;
                    ObjMagna.utilidadPeriodo = utilidadM;
                    this.dataMagna.push(ObjMagna)

                    //PREMIUM
                    let BuscaPremiumV = ventas.find(f => f.mes == a && f.producto === 'PREMIUM')
                    let BuscaPremiumC = compras.find(f => f.mes == a && f.producto === 'PREMIUM')
                    let ObjPremium = {
                        nombreMes: meses[a - 1],

                        litrosVentas: 0,
                        importeVentas: 0,
                        descuentoVentas: 0,
                        subTotalVentas: 0,
                        promedioVentas: 0,

                        litrosCompras: 0,
                        importeCompras: 0,
                        descuentoCompras: 0,
                        subTotalCompras: 0,
                        promedioCompras: 0,

                        porcentajeUtilidad: 0,
                        utilidadPeriodo: 0,
                    }
                    if (BuscaPremiumV) {
                        ObjPremium.litrosVentas = BuscaPremiumV.litros;
                        ObjPremium.importeVentas = BuscaPremiumV.importe;
                        ObjPremium.descuentoVentas = BuscaPremiumV.descuento;
                        ObjPremium.subTotalVentas = BuscaPremiumV.subTotal;
                        ObjPremium.promedioVentas = BuscaPremiumV.subTotalPromedio;
                    }
                    if (BuscaPremiumC) {
                        ObjPremium.litrosCompras = BuscaPremiumC.litros;
                        ObjPremium.importeCompras = BuscaPremiumC.importe;
                        ObjPremium.descuentoCompras = BuscaPremiumC.descuento;
                        ObjPremium.subTotalCompras = BuscaPremiumC.subTotal;
                        ObjPremium.promedioCompras = BuscaPremiumC.subTotalPromedio;
                    }

                    //VALIDAMOS EL COSTO DE COMPRA
                    if (ObjPremium.promedioCompras != 0) {
                        indiceP = ObjPremium.promedioCompras;
                    }
                    ObjPremium.promedioCompras = indiceP;

                    ObjPremium.diferencia = ObjPremium.subTotalVentas - ObjPremium.subTotalCompras;
                    if (ObjPremium.promedioVentas != 0) {
                        ObjPremium.porcentajeUtilidad = ((ObjPremium.promedioCompras / ObjPremium.promedioVentas) - 1) * 100 * -1;
                    }

                    //UTILIDAD DEL PERIODO
                    let utilidadP = ObjPremium.subTotalVentas * ObjPremium.porcentajeUtilidad / 100;
                    ObjPremium.utilidadPeriodo = utilidadP;

                    this.dataPremium.push(ObjPremium)

                    //DIESEL
                    let BuscaDieselV = ventas.find(f => f.mes == a && f.producto === 'DIESEL')
                    let BuscaDieselC = compras.find(f => f.mes == a && f.producto === 'DIESEL')
                    let ObjDiesel = {
                        nombreMes: meses[a - 1],

                        litrosVentas: 0,
                        importeVentas: 0,
                        descuentoVentas: 0,
                        subTotalVentas: 0,
                        promedioVentas: 0,

                        litrosCompras: 0,
                        importeCompras: 0,
                        descuentoCompras: 0,
                        subTotalCompras: 0,
                        promedioCompras: 0,

                        porcentajeUtilidad: 0,
                        utilidadPeriodo: 0,
                    }
                    if (BuscaDieselV) {
                        ObjDiesel.litrosVentas = BuscaDieselV.litros;
                        ObjDiesel.importeVentas = BuscaDieselV.importe;
                        ObjDiesel.descuentoVentas = BuscaDieselV.descuento;
                        ObjDiesel.subTotalVentas = BuscaDieselV.subTotal;
                        ObjDiesel.promedioVentas = BuscaDieselV.subTotalPromedio;
                    }
                    if (BuscaDieselC) {
                        ObjDiesel.litrosCompras = BuscaDieselC.litros;
                        ObjDiesel.importeCompras = BuscaDieselC.importe;
                        ObjDiesel.descuentoCompras = BuscaDieselC.descuento;
                        ObjDiesel.subTotalCompras = BuscaDieselC.subTotal;
                        ObjDiesel.promedioCompras = BuscaDieselC.subTotalPromedio;
                    }

                    //VALIDAMOS EL COSTO DE COMPRA
                    if (ObjDiesel.promedioCompras != 0) {
                        indiceD = ObjDiesel.promedioCompras;
                    }
                    ObjDiesel.promedioCompras = indiceD;

                    ObjDiesel.diferencia = ObjDiesel.subTotalVentas - ObjDiesel.subTotalCompras;
                    if (ObjDiesel.promedioVentas != 0) {
                        ObjDiesel.porcentajeUtilidad = ((ObjDiesel.promedioCompras / ObjDiesel.promedioVentas) - 1) * 100 * -1;
                    }

                    //UTILIDAD DEL PERIODO
                    let utilidadD = ObjDiesel.subTotalVentas * ObjDiesel.porcentajeUtilidad / 100;
                    ObjDiesel.utilidadPeriodo = utilidadD;

                    this.dataDiesel.push(ObjDiesel)
                }

                //SUMATORIAS
                let SumMagna = {
                    nombreMes: 'Total_Magna',
                    litrosVentas: this.dataMagna.reduce((acumulador, objeto) => acumulador + objeto.litrosVentas, 0),
                    importeVentas: this.dataMagna.reduce((acumulador, objeto) => acumulador + objeto.importeVentas, 0),
                    descuentoVentas: this.dataMagna.reduce((acumulador, objeto) => acumulador + objeto.descuentoVentas, 0),
                    subTotalVentas: this.dataMagna.reduce((acumulador, objeto) => acumulador + objeto.subTotalVentas, 0),
                    promedioVentas: '---',
                    litrosCompras: this.dataMagna.reduce((acumulador, objeto) => acumulador + objeto.litrosCompras, 0),
                    importeCompras: this.dataMagna.reduce((acumulador, objeto) => acumulador + objeto.importeCompras, 0),
                    descuentoCompras: this.dataMagna.reduce((acumulador, objeto) => acumulador + objeto.descuentoCompras, 0),
                    subTotalCompras: this.dataMagna.reduce((acumulador, objeto) => acumulador + objeto.subTotalCompras, 0),
                    promedioCompras: '---',
                    porcentajeUtilidad: '---',
                    utilidadPeriodo: this.dataMagna.reduce((acumulador, objeto) => acumulador + objeto.utilidadPeriodo, 0),
                }
                this.dataMagna.push(SumMagna);

                let SumPremium = {
                    nombreMes: 'Total_Premium',
                    litrosVentas: this.dataPremium.reduce((acumulador, objeto) => acumulador + objeto.litrosVentas, 0),
                    importeVentas: this.dataPremium.reduce((acumulador, objeto) => acumulador + objeto.importeVentas, 0),
                    descuentoVentas: this.dataPremium.reduce((acumulador, objeto) => acumulador + objeto.descuentoVentas, 0),
                    subTotalVentas: this.dataPremium.reduce((acumulador, objeto) => acumulador + objeto.subTotalVentas, 0),
                    promedioVentas: '---',
                    litrosCompras: this.dataPremium.reduce((acumulador, objeto) => acumulador + objeto.litrosCompras, 0),
                    importeCompras: this.dataPremium.reduce((acumulador, objeto) => acumulador + objeto.importeCompras, 0),
                    descuentoCompras: this.dataPremium.reduce((acumulador, objeto) => acumulador + objeto.descuentoCompras, 0),
                    subTotalCompras: this.dataPremium.reduce((acumulador, objeto) => acumulador + objeto.subTotalCompras, 0),
                    promedioCompras: '---',
                    porcentajeUtilidad: '---',
                    utilidadPeriodo: this.dataPremium.reduce((acumulador, objeto) => acumulador + objeto.utilidadPeriodo, 0),
                }
                this.dataPremium.push(SumPremium);

                let SumDiesel = {
                    nombreMes: 'Total_Diesel',
                    litrosVentas: this.dataDiesel.reduce((acumulador, objeto) => acumulador + objeto.litrosVentas, 0),
                    importeVentas: this.dataDiesel.reduce((acumulador, objeto) => acumulador + objeto.importeVentas, 0),
                    descuentoVentas: this.dataDiesel.reduce((acumulador, objeto) => acumulador + objeto.descuentoVentas, 0),
                    subTotalVentas: this.dataDiesel.reduce((acumulador, objeto) => acumulador + objeto.subTotalVentas, 0),
                    promedioVentas: 0,
                    litrosCompras: this.dataDiesel.reduce((acumulador, objeto) => acumulador + objeto.litrosCompras, 0),
                    importeCompras: this.dataDiesel.reduce((acumulador, objeto) => acumulador + objeto.importeCompras, 0),
                    descuentoCompras: this.dataDiesel.reduce((acumulador, objeto) => acumulador + objeto.descuentoCompras, 0),
                    subTotalCompras: this.dataDiesel.reduce((acumulador, objeto) => acumulador + objeto.subTotalCompras, 0),
                    promedioCompras: '---',
                    porcentajeUtilidad: '---',
                    utilidadPeriodo: this.dataDiesel.reduce((acumulador, objeto) => acumulador + objeto.utilidadPeriodo, 0),
                }
                this.dataDiesel.push(SumDiesel);

                this.$q.loading.hide()
            } catch (error) {
                console.log(error)
                this.$q.loading.hide()
            }
        },

        async GetVentas() {
            let fI = this.selectedAnio + '-' + this.selectedMesI.value + '-01';
            let fF = this.selectedAnio + '-' + this.selectedMesF.value + '-01';
            try {
                let response = await axios.get(this.rutaAxios + 'Gasolineros/GetVentasSubTotalMesAsync/erp_' + this.token.rfc + '/' + fI + '/' + fF);
                let x = response.data;
                console.log(x)
                return x;
            } catch (errro) {
                return [];
            }
        },

        async GetCompras() {
            let fI = this.selectedAnio + '-' + this.selectedMesI.value + '-01';
            let fF = this.selectedAnio + '-' + this.selectedMesF.value + '-01';
            try {
                let response = await axios.get(this.rutaAxios + 'Gasolineros/GetComprasSubTotalMesAsync/erp_' + this.token.rfc + '/' + fI + '/' + fF);
                let x = response.data;
                return x;
            } catch (errro) {
                return [];
            }
        },

        VerDetalles(item) {
            const nombresMeses = [
                'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
            ];

            const numeroMes = nombresMeses.indexOf(item.mes.toLowerCase());
            const año = this.selectedAnio;

            const objetosEnMes = this.dataComprobantesDet.filter(objeto => {
                const fechaObjeto = parseISO(objeto.fecha);
                return isSameMonth(fechaObjeto, new Date(año, numeroMes));
            });

            this.$store.state.detallesFacturacionStore.cabecera = 'INGRESOS ' + item.mes.toUpperCase() + ' DEL ' + this.selectedAnio;
            this.$store.state.detallesFacturacionStore.detalles = objetosEnMes;

            this.dialogDetalles = true;
        },

        FormatCurrency(value) {
            if (value === '---') {
                return '';
            } else {
                return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
            }
        },

        FormatoCantidad(numero) {
            const numeroConDecimales = Number(numero).toFixed(3);
            return numeroConDecimales.replace(/\d(?=(\d{3})+\.)/g, '$&,')
        },

        FormatoPorcentaje(numero) {
            if (numero === '---') {
                return '';
            } else {
                const numeroConDecimales = Number(numero).toFixed(2);
                return numeroConDecimales.replace(/\d(?=(\d{3})+\.)/g, '$&,')
            }
        },

        ExportExcel() {
            try{
                const columnsToInclude = [
                    'nombreMes',
                    'litrosVentas',
                    'importeVentas',
                    'descuentoVentas',
                    'subTotalVentas',
                    'promedioVentas',
                    'litrosCompras',
                    'importeCompras',
                    'descuentoCompras',
                    'subTotalCompras', 
                    'promedioCompras', 
                    'porcentajeUtilidad', 
                    'utilidadPeriodo',
                ];
                //MAGNA
                const dataMagna = [...this.dataMagna];
                const datosMagna = dataMagna.map(item =>
                    columnsToInclude.reduce((acc, column) => {
                        acc[column] = item[column];
                        return acc;
                    }, {})
                );
                const arrayDeValoresMagna = datosMagna.map(objeto => Object.values(objeto));
                //PREMIUM
                const dataPremiun = [...this.dataPremium];
                const datosPremium = dataPremiun.map(item =>
                    columnsToInclude.reduce((acc, column) => {
                        acc[column] = item[column];
                        return acc;
                    }, {})
                );
                const arrayDeValoresPremium = datosPremium.map(objeto => Object.values(objeto));
                //DIESEL
                const dataDiesel = [...this.dataDiesel];
                const datosDiesel = dataDiesel.map(item =>
                    columnsToInclude.reduce((acc, column) => {
                        acc[column] = item[column];
                        return acc;
                    }, {})
                );
                const arrayDeValoresDiesel = datosDiesel.map(objeto => Object.values(objeto));

                const libroTrabajo = XLSX.utils.book_new();
                const hojaCalculo = XLSX.utils.aoa_to_sheet([
                    ['REPORTE GASOLINERAS'],
                    [this.token.rfc + '| ' + this.token.empresa],
                    [],
                    ['MAGNA'],
                    [
                        'Mes',
                        'Litros Vendidos',
                        'Importe de Ventas',
                        'Descuento de Ventas',
                        'Sub Total de Ventas',
                        'Promedio de Ventas',
                        'Litros Comprados',
                        'Importe de Compras',
                        'Descuento de Compras',
                        'Sub Total de Compras', 
                        'Promedio de Compras', 
                        'Porcentaje de Utilidad', 
                        'Utilidad del Periodo',
                    ],
                    ...arrayDeValoresMagna.map((registro, index) => [
                        registro[0],
                        { t: 'n', v: registro[1], z: '#,##0.000' },
                        { t: 'n', v: registro[2], z: '#,##0.00' },
                        { t: 'n', v: registro[3], z: '#,##0.00' },
                        { t: 'n', v: registro[4], z: '#,##0.00' },
                        registro[5],
                        // { t: 'n', v: registro[5], z: '#,##0.00' },
                        { t: 'n', v: registro[6], z: '#,##0.000' },
                        { t: 'n', v: registro[7], z: '#,##0.00' },
                        { t: 'n', v: registro[8], z: '#,##0.00' },
                        { t: 'n', v: registro[9], z: '#,##0.00' },
                        registro[10],
                        registro[11],
                        // { t: 'n', v: registro[10], z: '#,##0.00' },
                        // { t: 'n', v: registro[11], z: '#,##0.00' },
                        { t: 'n', v: registro[12], z: '#,##0.00' },
                    ]),
                    [],
                    ['PREMIUM'],
                    [
                        'Mes',
                        'Litros Vendidos',
                        'Importe de Ventas',
                        'Descuento de Ventas',
                        'Sub Total de Ventas',
                        'Promedio de Ventas',
                        'Litros Comprados',
                        'Importe de Compras',
                        'Descuento de Compras',
                        'Sub Total de Compras', 
                        'Promedio de Compras', 
                        'Porcentaje de Utilidad', 
                        'Utilidad del Periodo',
                    ],
                    ...arrayDeValoresPremium.map((registro, index) => [
                        registro[0],
                        { t: 'n', v: registro[1], z: '#,##0.000' },
                        { t: 'n', v: registro[2], z: '#,##0.00' },
                        { t: 'n', v: registro[3], z: '#,##0.00' },
                        { t: 'n', v: registro[4], z: '#,##0.00' },
                        registro[5],
                        // { t: 'n', v: registro[5], z: '#,##0.00' },
                        { t: 'n', v: registro[6], z: '#,##0.000' },
                        { t: 'n', v: registro[7], z: '#,##0.00' },
                        { t: 'n', v: registro[8], z: '#,##0.00' },
                        { t: 'n', v: registro[9], z: '#,##0.00' },
                        registro[10],
                        registro[11],
                        // { t: 'n', v: registro[10], z: '#,##0.00' },
                        // { t: 'n', v: registro[11], z: '#,##0.00' },
                        { t: 'n', v: registro[12], z: '#,##0.00' },
                    ]),
                    [],
                    ['DIESEL'],
                    [
                        'Mes',
                        'Litros Vendidos',
                        'Importe de Ventas',
                        'Descuento de Ventas',
                        'Sub Total de Ventas',
                        'Promedio de Ventas',
                        'Litros Comprados',
                        'Importe de Compras',
                        'Descuento de Compras',
                        'Sub Total de Compras', 
                        'Promedio de Compras', 
                        'Porcentaje de Utilidad', 
                        'Utilidad del Periodo',
                    ],
                    ...arrayDeValoresDiesel.map((registro, index) => [
                        registro[0],
                        { t: 'n', v: registro[1], z: '#,##0.000' },
                        { t: 'n', v: registro[2], z: '#,##0.00' },
                        { t: 'n', v: registro[3], z: '#,##0.00' },
                        { t: 'n', v: registro[4], z: '#,##0.00' },
                        registro[5],
                        // { t: 'n', v: registro[5], z: '#,##0.00' },
                        { t: 'n', v: registro[6], z: '#,##0.000' },
                        { t: 'n', v: registro[7], z: '#,##0.00' },
                        { t: 'n', v: registro[8], z: '#,##0.00' },
                        { t: 'n', v: registro[9], z: '#,##0.00' },
                        registro[10],
                        registro[11],
                        // { t: 'n', v: registro[10], z: '#,##0.00' },
                        // { t: 'n', v: registro[11], z: '#,##0.00' },
                        { t: 'n', v: registro[12], z: '#,##0.00' },
                    ]),
                ]);
                    
                // Combinar celdas A1 a H1 y centrar texto
                hojaCalculo['!merges'] = [{ s: { r: 0, c: 0 }, e: { c: 7, r: 0 } }];
                hojaCalculo['!merges'].push({ s: { c: 0, r: 1 }, e: { c: 7, r: 1 } });
                hojaCalculo['!merges'].push({ s: { c: 0, r: 2 }, e: { c: 7, r: 2 } });

                // Añadir la hoja de cálculo al libro de trabajo
                XLSX.utils.book_append_sheet(libroTrabajo, hojaCalculo, 'Hoja1');

                // Guardar el libro como un archivo XLSX
                const nombreArchivo = 'REPORTE GASOLINERAS ' + this.token.rfc + '_' + this.token.empresa; 
                XLSX.writeFile(libroTrabajo, nombreArchivo + '.xlsx');
            }catch(error){
                console.log(error);
            }
            


            
            // const workbook = XLSX.utils.book_new();

            // const sheetMagna = XLSX.utils.json_to_sheet(this.dataMagna);
            // const sheetPremium = XLSX.utils.json_to_sheet(this.dataPremium);
            // const sheetDiesel = XLSX.utils.json_to_sheet(this.dataDiesel);
            // XLSX.utils.book_append_sheet(workbook, sheetMagna, 'MAGNA');
            // XLSX.utils.book_append_sheet(workbook, sheetPremium, 'PREMIUM');
            // XLSX.utils.book_append_sheet(workbook, sheetDiesel, 'DIESEL');

            // XLSX.writeFile(workbook, 'REPORTE UTILIDAD DE ' + this.selectedMesI.label + ' A ' + this.selectedMesF.label + ' ' + this.selectedAnio + '.xlsx');


        },

        CloseDialogDetalles() {
            this.dialogDetalles = false;
        },

    },
}
</script>
<style>
.clase-total-Total_Magna {
    background: rgb(102, 187, 106);
}

.clase-total-Total_Premium {
    background: rgb(239, 83, 80);
}

.clase-total-Total_Diesel {
    background: rgb(120, 144, 156);
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