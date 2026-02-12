<template>
    <div class="q-pa-md">
        <!-- DIALOG DE LOS DETALLES -->
        <q-dialog v-model="dialogInventrioInicial" transition-show="scale" transition-hide="scale">
            <inventario-inicial @closeDialogDetalle="CloseDialogDetalles"></inventario-inicial>
        </q-dialog>
        <q-dialog v-model="dialogMerma" transition-show="scale" transition-hide="scale">
            <merma @closeDialogDetalle="CloseDialogDetalles"></merma>
        </q-dialog>
        <q-dialog v-model="dialogComparativa" transition-show="scale" transition-hide="scale">
            <comparativa @closeDialogDetalle="CloseDialogDetalles"></comparativa>
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
                    :offset="[10, 10]">Consultar con inicial calculado</q-tooltip>
            </q-btn>
            <q-btn push color="deep-orange-9" @click="GetReporteRegistrado" icon="mdi-text-box-search-outline" rounded flat
                size="18px" padding="xs">
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                    :offset="[10, 10]">Consultar con inicial registrado</q-tooltip>
            </q-btn>
            <q-btn push color="green-10" @click="ExportExcel" icon="mdi-file-excel-box-outline" rounded flat size="18px"
                padding="xs">
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                    :offset="[10, 10]">Exportar Excel</q-tooltip>
            </q-btn>
            <q-space />
            <div class="q-mt-lg">
                <q-fab v-model="fabInicial" label="Inventario Inicial" vertical-actions-align="left" color="light-green-10"
                    padding="none md" icon="keyboard_arrow_down" direction="down">
                    <q-fab-action color="green-10" @click="OpenDialogInicial('MAGNA')" icon="mdi-gas-station-outline"
                        label="Magna" />
                    <q-fab-action color="red-10" @click="OpenDialogInicial('PREMIUM')" icon="mdi-gas-station-outline"
                        label="Premium" />
                    <q-fab-action color="blue-grey-10" @click="OpenDialogInicial('DIESEL')" icon="mdi-gas-station-outline"
                        label="Diesel" />
                </q-fab>
            </div>
            <div class="q-mt-lg">
                <q-fab v-model="fabMerma" label="Mermas" vertical-actions-align="left" color="orange-10" padding="none md"
                    icon="keyboard_arrow_down" direction="down">
                    <q-fab-action color="green-10" @click="OpenDialogMerma('MAGNA')" icon="mdi-gas-station-outline"
                        label="Magna" />
                    <q-fab-action color="red-10" @click="OpenDialogMerma('PREMIUM')" icon="mdi-gas-station-outline"
                        label="Premium" />
                    <q-fab-action color="blue-grey-10" @click="OpenDialogMerma('DIESEL')" icon="mdi-gas-station-outline"
                        label="Diesel" />
                </q-fab>
            </div>
            <div class="q-mt-lg">
                <q-fab v-model="fabComparativa" label="Comparativa" vertical-actions-align="left" color="blue-10"
                    padding="none md" icon="keyboard_arrow_down" direction="down">
                    <q-fab-action color="green-10" @click="OpenDialogComparativa('MAGNA')" icon="mdi-gas-station-outline"
                        label="Magna" />
                    <q-fab-action color="red-10" @click="OpenDialogComparativa('PREMIUM')" icon="mdi-gas-station-outline"
                        label="Premium" />
                    <q-fab-action color="blue-grey-10" @click="OpenDialogComparativa('DIESEL')"
                        icon="mdi-gas-station-outline" label="Diesel" />
                </q-fab>
            </div>

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
                    <q-td key="inventarioInicial" :props="props">{{ FormatoCantidad(props.row.inventarioInicial) }}</q-td>
                    <q-td key="litrosComprados" :props="props">{{ FormatoCantidad(props.row.litrosComprados) }}</q-td>
                    <q-td key="litrosDisponibles" :props="props">{{ FormatoCantidad(props.row.litrosDisponibles) }}</q-td>
                    <q-td key="litrosVendidos" :props="props">{{ FormatoCantidad(props.row.litrosVendidos) }}</q-td>
                    <q-td key="mermas" :props="props">{{ FormatoCantidad(props.row.mermas) }}</q-td>
                    <q-td key="inventarioTeorico" :props="props">{{ FormatoCantidad(props.row.inventarioTeorico) }}</q-td>
                    <q-td key="registrado" :props="props">{{ FormatoCantidad(props.row.registrado) }}</q-td>
                    <q-td key="diferencia" :props="props">{{ FormatoCantidad(props.row.diferencia) }}</q-td>
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
                    <q-td key="inventarioInicial" :props="props">{{ FormatoCantidad(props.row.inventarioInicial) }}</q-td>
                    <q-td key="litrosComprados" :props="props">{{ FormatoCantidad(props.row.litrosComprados) }}</q-td>
                    <q-td key="litrosDisponibles" :props="props">{{ FormatoCantidad(props.row.litrosDisponibles) }}</q-td>
                    <q-td key="litrosVendidos" :props="props">{{ FormatoCantidad(props.row.litrosVendidos) }}</q-td>
                    <q-td key="mermas" :props="props">{{ FormatoCantidad(props.row.mermas) }}</q-td>
                    <q-td key="inventarioTeorico" :props="props">{{ FormatoCantidad(props.row.inventarioTeorico) }}</q-td>
                    <q-td key="registrado" :props="props">{{ FormatoCantidad(props.row.registrado) }}</q-td>
                    <q-td key="diferencia" :props="props">{{ FormatoCantidad(props.row.diferencia) }}</q-td>
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
                    <q-td key="inventarioInicial" :props="props">{{ FormatoCantidad(props.row.inventarioInicial) }}</q-td>
                    <q-td key="litrosComprados" :props="props">{{ FormatoCantidad(props.row.litrosComprados) }}</q-td>
                    <q-td key="litrosDisponibles" :props="props">{{ FormatoCantidad(props.row.litrosDisponibles) }}</q-td>
                    <q-td key="litrosVendidos" :props="props">{{ FormatoCantidad(props.row.litrosVendidos) }}</q-td>
                    <q-td key="mermas" :props="props">{{ FormatoCantidad(props.row.mermas) }}</q-td>
                    <q-td key="inventarioTeorico" :props="props">{{ FormatoCantidad(props.row.inventarioTeorico) }}</q-td>
                    <q-td key="registrado" :props="props">{{ FormatoCantidad(props.row.registrado) }}</q-td>
                    <q-td key="diferencia" :props="props">{{ FormatoCantidad(props.row.diferencia) }}</q-td>
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
import InventarioInicial from './Litros/InventarioInicial.vue';
import Merma from './Litros/Merma.vue'
import Comparativa from './Litros/Comparativa.vue'

export default {
    components: {
        InventarioInicial,
        Merma,
        Comparativa
    },
    data() {
        return {
            columns: [
                { name: 'nombreMes', align: 'left', label: 'Mes', field: 'nombreMes' },
                { name: 'inventarioInicial', align: 'right', label: 'Inventario Inicial (Registrado)', field: 'inventarioInicial' },
                { name: 'litrosComprados', align: 'right', label: 'Litros Comprados (Facturados)', field: 'litrosComprados' },
                { name: 'litrosDisponibles', align: 'right', label: 'Litros Disponibles (Calculado)', field: 'litrosDisponibles' },
                { name: 'litrosVendidos', align: 'right', label: 'Litros Vendidos (Facturados)', field: 'litrosVendidos' },
                { name: 'mermas', align: 'right', label: 'Mermas (Registrados)', field: 'mermas' },
                { name: 'inventarioTeorico', align: 'right', label: 'Inventario Teorico (Calculado)', field: 'inventarioTeorico' },
                { name: 'registrado', align: 'right', label: 'Registrado', field: 'registrado' },
                { name: 'diferencia', align: 'right', label: 'Diferencia (Calculado)', field: 'diferencia' },
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

            //BOTONES PARA GUARDAR DATOS
            fabInicial: false,
            fabMerma: false,
            fabComparativa: false,

            //DIALOG PARA MOSTRAR LAS TABLAS A CAPTURAR
            dialogInventrioInicial: false,
            dialogMerma: false,
            dialogComparativa: false,
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
            this.$q.loading.show({
                spinner: QSpinnerCube,
                spinnerColor: 'red-8',
                spinnerSize: 140,
                message: 'Consultando datos, espere...',
            })

            try {
                //INICIALIZAMOS
                this.dataMagna = [];
                this.dataPremium = [];
                this.dataDiesel = [];

                //CONSULTAMOS LOS REGISTROS INICIALES
                let inicialMagna = await this.GetInicial('MAGNA');
                let inicialPremium = await this.GetInicial('PREMIUM');
                let inicialDiesel = await this.GetInicial('DIESEL');

                //CONSULTAMOS LAS MERMAS REGISTRADAS
                let mermaMagna = await this.GetMerma('MAGNA');
                let mermaPremium = await this.GetMerma('PREMIUM');
                let mermaDiesel = await this.GetMerma('DIESEL');

                //CONSULTAMOS LOS LITROS CALCULADOS
                let comparativaMagna = await this.GetComparativa('MAGNA');
                let comparativaPremium = await this.GetComparativa('PREMIUM');
                let comparativaDiesel = await this.GetComparativa('DIESEL');

                //CONSULTAMOS LAS VENTAS Y LAS COMPRAS
                let ventas = await this.GetVentas();
                let compras = await this.GetCompras();

                //RECORREMOS PARA HACER LA LISTA
                const meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE']

                let magnaInicial = inicialMagna.detalle[0].litros;
                let premiumInicial = inicialPremium.detalle[0].litros;
                let dieselInicial = inicialDiesel.detalle[0].litros;
                console.log(magnaInicial)
                for (let a = this.selectedMesI.value; a <= this.selectedMesF.value; a++) {
                    //MAGNA
                    let BuscaMagnaV = ventas.find(f => f.mes == a && f.producto === 'MAGNA');
                    let BuscaMagnaC = compras.find(f => f.mes == a && f.producto === 'MAGNA');
                    let buscaMagnaM = mermaMagna.detalle[a - 1].litros;
                    let buscaMagnaR = comparativaMagna.detalle[a - 1].litros;
                    let ObjMagna = {
                        nombreMes: meses[a - 1],
                        inventarioInicial: magnaInicial,
                        litrosComprados: 0,
                        litrosDisponibles: 0,
                        litrosVendidos: 0,
                        mermas: buscaMagnaM,
                        inventarioTeorico: 0,
                        registrado: buscaMagnaR,
                        diferencia: 0,
                    }
                    if (BuscaMagnaV) {
                        ObjMagna.litrosVendidos = BuscaMagnaV.cantidad;
                    }
                    if (BuscaMagnaC) {
                        ObjMagna.litrosComprados = BuscaMagnaC.cantidad;
                    }
                    ObjMagna.litrosDisponibles = ObjMagna.inventarioInicial + ObjMagna.litrosComprados;
                    ObjMagna.inventarioTeorico = ObjMagna.inventarioInicial + ObjMagna.litrosComprados - ObjMagna.litrosVendidos - ObjMagna.mermas;
                    ObjMagna.diferencia = ObjMagna.inventarioTeorico - ObjMagna.registrado;
                    this.dataMagna.push(ObjMagna)
                    magnaInicial = magnaInicial + ObjMagna.litrosComprados - ObjMagna.litrosVendidos - ObjMagna.mermas;

                    //PREMIUM
                    let BuscaPremiumV = ventas.find(f => f.mes == a && f.producto === 'PREMIUM')
                    let BuscaPremiumC = compras.find(f => f.mes == a && f.producto === 'PREMIUM')
                    let buscaPremiumM = mermaPremium.detalle[a - 1].litros;
                    let buscaPremiumR = comparativaPremium.detalle[a - 1].litros;

                    let ObjPremium = {
                        nombreMes: meses[a - 1],
                        inventarioInicial: premiumInicial,
                        litrosComprados: 0,
                        litrosDisponibles: 0,
                        litrosVendidos: 0,
                        mermas: buscaPremiumM,
                        inventarioTeorico: 0,
                        registrado: buscaPremiumR,
                        diferencia: 0,
                    }
                    if (BuscaPremiumV) {
                        ObjPremium.litrosVendidos = BuscaPremiumV.cantidad;
                    }
                    if (BuscaPremiumC) {
                        ObjPremium.litrosComprados = BuscaPremiumC.cantidad;
                    }
                    ObjPremium.litrosDisponibles = ObjPremium.inventarioInicial + ObjPremium.litrosComprados;
                    ObjPremium.inventarioTeorico = ObjPremium.inventarioInicial + ObjPremium.litrosComprados - ObjPremium.litrosVendidos - ObjPremium.mermas
                    ObjPremium.diferencia = ObjPremium.inventarioTeorico - ObjPremium.registrado;
                    this.dataPremium.push(ObjPremium);
                    premiumInicial = premiumInicial + ObjPremium.litrosComprados - ObjPremium.litrosVendidos - ObjPremium.mermas;

                    //DIESEL
                    let BuscaDieselV = ventas.find(f => f.mes == a && f.producto === 'DIESEL');
                    let BuscaDieselC = compras.find(f => f.mes == a && f.producto === 'DIESEL');
                    let buscaDieselM = mermaDiesel.detalle[a - 1].litros;
                    let buscaDieselR = comparativaDiesel.detalle[a - 1].litros;

                    let ObjDiesel = {
                        nombreMes: meses[a - 1],
                        inventarioInicial: dieselInicial,
                        litrosComprados: 0,
                        litrosDisponibles: 0,
                        litrosVendidos: 0,
                        mermas: buscaDieselM,
                        inventarioTeorico: 0,
                        registrado: buscaDieselR,
                        diferencia: 0,
                    }
                    if (BuscaDieselV) {
                        ObjDiesel.litrosVendidos = BuscaDieselV.cantidad;
                    }
                    if (BuscaDieselC) {
                        ObjDiesel.litrosComprados = BuscaDieselC.cantidad;
                    }
                    ObjDiesel.litrosDisponibles = ObjDiesel.inventarioInicial + ObjDiesel.litrosComprados;
                    ObjDiesel.inventarioTeorico = ObjDiesel.inventarioInicial + ObjDiesel.litrosComprados - ObjDiesel.litrosVendidos - ObjDiesel.mermas;
                    ObjDiesel.diferencia = ObjDiesel.inventarioTeorico - ObjDiesel.registrado;
                    this.dataDiesel.push(ObjDiesel)
                    dieselInicial = dieselInicial + ObjDiesel.litrosComprados - ObjDiesel.litrosVendidos - ObjDiesel.mermas;
                }

                //SUMATORIAS
                let SumMagna = {
                    nombreMes: 'Total_Magna',
                    inventarioInicial: '---',
                    litrosComprados: this.dataMagna.reduce((acumulador, objeto) => acumulador + objeto.litrosComprados, 0),
                    litrosDisponibles: '---',
                    litrosVendidos: this.dataMagna.reduce((acumulador, objeto) => acumulador + objeto.litrosVendidos, 0),
                    mermas: this.dataMagna.reduce((acumulador, objeto) => acumulador + objeto.mermas, 0),
                    inventarioTeorico: '---',
                    registrado: '---',
                    diferencia: '---',
                }
                this.dataMagna.push(SumMagna);

                let SumPremium = {
                    nombreMes: 'Total_Premium',
                    inventarioInicial: '---',
                    litrosComprados: this.dataPremium.reduce((acumulador, objeto) => acumulador + objeto.litrosComprados, 0),
                    litrosDisponibles: '---',
                    litrosVendidos: this.dataPremium.reduce((acumulador, objeto) => acumulador + objeto.litrosVendidos, 0),
                    mermas: this.dataPremium.reduce((acumulador, objeto) => acumulador + objeto.mermas, 0),
                    inventarioTeorico: '---',
                    registrado: '---',
                    diferencia: '---',
                }
                this.dataPremium.push(SumPremium);

                let SumDiesel = {
                    nombreMes: 'Total_Diesel',
                    inventarioInicial: '---',
                    litrosComprados: this.dataDiesel.reduce((acumulador, objeto) => acumulador + objeto.litrosComprados, 0),
                    litrosDisponibles: '---',
                    litrosVendidos: this.dataDiesel.reduce((acumulador, objeto) => acumulador + objeto.litrosVendidos, 0),
                    mermas: this.dataDiesel.reduce((acumulador, objeto) => acumulador + objeto.mermas, 0),
                    inventarioTeorico: '---',
                    registrado: '---',
                    diferencia: '---',
                }
                this.dataDiesel.push(SumDiesel);

                this.$q.loading.hide()
            } catch (error) {
                console.log(error)
                this.$q.loading.hide()
            }
        },

        async GetReporteRegistrado() {
            this.$q.loading.show({
                spinner: QSpinnerCube,
                spinnerColor: 'red-8',
                spinnerSize: 140,
                message: 'Consultando datos, espere...',
            })

            try {
                //INICIALIZAMOS
                this.dataMagna = [];
                this.dataPremium = [];
                this.dataDiesel = [];

                //CONSULTAMOS LOS REGISTROS INICIALES
                let inicialMagna = await this.GetInicial('MAGNA');
                let inicialPremium = await this.GetInicial('PREMIUM');
                let inicialDiesel = await this.GetInicial('DIESEL');

                //CONSULTAMOS LAS MERMAS REGISTRADAS
                let mermaMagna = await this.GetMerma('MAGNA');
                let mermaPremium = await this.GetMerma('PREMIUM');
                let mermaDiesel = await this.GetMerma('DIESEL');

                //CONSULTAMOS LOS LITROS CALCULADOS
                let comparativaMagna = await this.GetComparativa('MAGNA');
                let comparativaPremium = await this.GetComparativa('PREMIUM');
                let comparativaDiesel = await this.GetComparativa('DIESEL');

                //CONSULTAMOS LAS VENTAS Y LAS COMPRAS
                let ventas = await this.GetVentas();
                let compras = await this.GetCompras();

                //RECORREMOS PARA HACER LA LISTA
                const meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE']

                let magnaInicial = inicialMagna.detalle[0].litros;
                let premiumInicial = inicialPremium.detalle[0].litros;
                let dieselInicial = inicialDiesel.detalle[0].litros;
                console.log(magnaInicial)
                for (let a = this.selectedMesI.value; a <= this.selectedMesF.value; a++) {
                    //MAGNA
                    let BuscaMagnaV = ventas.find(f => f.mes == a && f.producto === 'MAGNA');
                    let BuscaMagnaC = compras.find(f => f.mes == a && f.producto === 'MAGNA');
                    let buscaMagnaM = mermaMagna.detalle[a - 1].litros;
                    let buscaMagnaR = comparativaMagna.detalle[a - 1].litros;
                    let ObjMagna = {
                        nombreMes: meses[a - 1],
                        inventarioInicial: magnaInicial,
                        litrosComprados: 0,
                        litrosDisponibles: 0,
                        litrosVendidos: 0,
                        mermas: buscaMagnaM,
                        inventarioTeorico: 0,
                        registrado: buscaMagnaR,
                        diferencia: 0,
                    }
                    if (BuscaMagnaV) {
                        ObjMagna.litrosVendidos = BuscaMagnaV.cantidad;
                    }
                    if (BuscaMagnaC) {
                        ObjMagna.litrosComprados = BuscaMagnaC.cantidad;
                    }
                    ObjMagna.litrosDisponibles = ObjMagna.inventarioInicial + ObjMagna.litrosComprados;
                    ObjMagna.inventarioTeorico = ObjMagna.inventarioInicial + ObjMagna.litrosComprados - ObjMagna.litrosVendidos - ObjMagna.mermas;
                    ObjMagna.diferencia = ObjMagna.inventarioTeorico - ObjMagna.registrado;
                    this.dataMagna.push(ObjMagna)
                    // magnaInicial = magnaInicial + ObjMagna.litrosComprados - ObjMagna.litrosVendidos - ObjMagna.mermas;
                    magnaInicial = buscaMagnaR;

                    //PREMIUM
                    let BuscaPremiumV = ventas.find(f => f.mes == a && f.producto === 'PREMIUM')
                    let BuscaPremiumC = compras.find(f => f.mes == a && f.producto === 'PREMIUM')
                    let buscaPremiumM = mermaPremium.detalle[a - 1].litros;
                    let buscaPremiumR = comparativaPremium.detalle[a - 1].litros;

                    let ObjPremium = {
                        nombreMes: meses[a - 1],
                        inventarioInicial: premiumInicial,
                        litrosComprados: 0,
                        litrosDisponibles: 0,
                        litrosVendidos: 0,
                        mermas: buscaPremiumM,
                        inventarioTeorico: 0,
                        registrado: buscaPremiumR,
                        diferencia: 0,
                    }
                    if (BuscaPremiumV) {
                        ObjPremium.litrosVendidos = BuscaPremiumV.cantidad;
                    }
                    if (BuscaPremiumC) {
                        ObjPremium.litrosComprados = BuscaPremiumC.cantidad;
                    }
                    ObjPremium.litrosDisponibles = ObjPremium.inventarioInicial + ObjPremium.litrosComprados;
                    ObjPremium.inventarioTeorico = ObjPremium.inventarioInicial + ObjPremium.litrosComprados - ObjPremium.litrosVendidos - ObjPremium.mermas
                    ObjPremium.diferencia = ObjPremium.inventarioTeorico - ObjPremium.registrado;
                    this.dataPremium.push(ObjPremium);
                    // premiumInicial = premiumInicial + ObjPremium.litrosComprados - ObjPremium.litrosVendidos - ObjPremium.mermas;
                    premiumInicial = buscaPremiumR;

                    //DIESEL
                    let BuscaDieselV = ventas.find(f => f.mes == a && f.producto === 'DIESEL');
                    let BuscaDieselC = compras.find(f => f.mes == a && f.producto === 'DIESEL');
                    let buscaDieselM = mermaDiesel.detalle[a - 1].litros;
                    let buscaDieselR = comparativaDiesel.detalle[a - 1].litros;

                    let ObjDiesel = {
                        nombreMes: meses[a - 1],
                        inventarioInicial: dieselInicial,
                        litrosComprados: 0,
                        litrosDisponibles: 0,
                        litrosVendidos: 0,
                        mermas: buscaDieselM,
                        inventarioTeorico: 0,
                        registrado: buscaDieselR,
                        diferencia: 0,
                    }
                    if (BuscaDieselV) {
                        ObjDiesel.litrosVendidos = BuscaDieselV.cantidad;
                    }
                    if (BuscaDieselC) {
                        ObjDiesel.litrosComprados = BuscaDieselC.cantidad;
                    }
                    ObjDiesel.litrosDisponibles = ObjDiesel.inventarioInicial + ObjDiesel.litrosComprados;
                    ObjDiesel.inventarioTeorico = ObjDiesel.inventarioInicial + ObjDiesel.litrosComprados - ObjDiesel.litrosVendidos - ObjDiesel.mermas;
                    ObjDiesel.diferencia = ObjDiesel.inventarioTeorico - ObjDiesel.registrado;
                    this.dataDiesel.push(ObjDiesel)
                    // dieselInicial = dieselInicial + ObjDiesel.litrosComprados - ObjDiesel.litrosVendidos - ObjDiesel.mermas;
                    dieselInicial = buscaDieselR;
                }

                //SUMATORIAS
                let SumMagna = {
                    nombreMes: 'Total_Magna',
                    inventarioInicial: '---',
                    litrosComprados: this.dataMagna.reduce((acumulador, objeto) => acumulador + objeto.litrosComprados, 0),
                    litrosDisponibles: '---',
                    litrosVendidos: this.dataMagna.reduce((acumulador, objeto) => acumulador + objeto.litrosVendidos, 0),
                    mermas: this.dataMagna.reduce((acumulador, objeto) => acumulador + objeto.mermas, 0),
                    inventarioTeorico: '---',
                    registrado: '---',
                    diferencia: '---',
                }
                this.dataMagna.push(SumMagna);

                let SumPremium = {
                    nombreMes: 'Total_Premium',
                    inventarioInicial: '---',
                    litrosComprados: this.dataPremium.reduce((acumulador, objeto) => acumulador + objeto.litrosComprados, 0),
                    litrosDisponibles: '---',
                    litrosVendidos: this.dataPremium.reduce((acumulador, objeto) => acumulador + objeto.litrosVendidos, 0),
                    mermas: this.dataPremium.reduce((acumulador, objeto) => acumulador + objeto.mermas, 0),
                    inventarioTeorico: '---',
                    registrado: '---',
                    diferencia: '---',
                }
                this.dataPremium.push(SumPremium);

                let SumDiesel = {
                    nombreMes: 'Total_Diesel',
                    inventarioInicial: '---',
                    litrosComprados: this.dataDiesel.reduce((acumulador, objeto) => acumulador + objeto.litrosComprados, 0),
                    litrosDisponibles: '---',
                    litrosVendidos: this.dataDiesel.reduce((acumulador, objeto) => acumulador + objeto.litrosVendidos, 0),
                    mermas: this.dataDiesel.reduce((acumulador, objeto) => acumulador + objeto.mermas, 0),
                    inventarioTeorico: '---',
                    registrado: '---',
                    diferencia: '---',
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
                let response = await axios.get(this.rutaAxios + 'Gasolineros/GetVentasLitrosMesAsync/erp_' + this.token.rfc + '/' + fI + '/' + fF);
                let x = response.data;
                return x;
            } catch (errro) {
                return [];
            }
        },

        async GetCompras() {
            let fI = this.selectedAnio + '-' + this.selectedMesI.value + '-01';
            let fF = this.selectedAnio + '-' + this.selectedMesF.value + '-01';
            try {
                let response = await axios.get(this.rutaAxios + 'Gasolineros/GetComprasLitrosMesAsync/erp_' + this.token.rfc + '/' + fI + '/' + fF);
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
            return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        },

        FormatoCantidad(numero) {
            if (numero === '---') {
                return "";
            } else {
                const numeroConDecimales = Number(numero).toFixed(3);
                return numeroConDecimales.replace(/\d(?=(\d{3})+\.)/g, '$&,')
            }
        },

        // FALTA
        ExportExcel() {
            let empresa = this.$store.state.empresaStore.nombre
            let rfc = this.$store.state.empresaStore.rfc

            const workbook = XLSX.utils.book_new();

            const sheetOtros = XLSX.utils.json_to_sheet(this.dataMagna);
            XLSX.utils.book_append_sheet(workbook, sheetOtros, 'Magna');

            const sheetOtrosP = XLSX.utils.json_to_sheet(this.dataPremium);
            XLSX.utils.book_append_sheet(workbook, sheetOtrosP, 'Premium');

            const sheetOtrosD = XLSX.utils.json_to_sheet(this.dataDiesel);
            XLSX.utils.book_append_sheet(workbook, sheetOtrosD, 'Diesel');

            XLSX.writeFile(workbook,    rfc + ' - ' + empresa +  ' - REPORTE LITROS DE ' + this.selectedMesI.label + ' A ' + this.selectedMesF.label + ' ' + this.selectedAnio + '.xlsx');
        },

        CloseDialogDetalles() {
            this.dialogInventrioInicial = false;
            this.dialogMerma = false;
            this.dialogComparativa = false;
        },

        async OpenDialogInicial(item) {
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
            };

            if (!this.selectedMesI) {
                this.$q.notify({
                    progress: true,
                    message: 'Seleccione el mes inicial para continuar',
                    type: 'warning',
                    position: 'top-right',
                    actions: [
                        { label: 'Cerrar', color: 'white', handler: () => { /* ... */ } }
                    ]
                })
                return;
            }
            let ObjInicial = await this.GetInicial(item);
            this.$store.state.litrosGasolineriaStore = { ...ObjInicial }
            this.dialogInventrioInicial = true;
        },

        async OpenDialogMerma(item) {
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
            let ObjInicial = await this.GetMerma(item);
            this.$store.state.litrosGasolineriaStore = { ...ObjInicial }
            this.dialogMerma = true;
        },

        async OpenDialogComparativa(item) {
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
            let ObjInicial = await this.GetComparativa(item);
            this.$store.state.litrosGasolineriaStore = { ...ObjInicial }
            this.dialogComparativa = true;
        },

        async GetInicial(item) {
            let ObjInicial = {
                año: this.selectedAnio,
                tipo: 'Inicial',
                combustible: item,
                detalle: [
                    { mes: this.selectedMesI.label, litros: 0 }
                ],
            };
            try {
                let response = await axios.get(this.rutaAxios + 'Gasolineros/GetLitrosGasolinerosAsync/erp_' + this.token.rfc + '/' + this.selectedAnio + '/Inicial/' + item);
                let x = response.data;
                return x;
            } catch (error) {
                return ObjInicial;
            }
        },

        async GetMerma(item) {
            let ObjInicial = {
                año: this.selectedAnio,
                tipo: 'Merma',
                combustible: item,
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
            try {
                let response = await axios.get(this.rutaAxios + 'Gasolineros/GetLitrosGasolinerosAsync/erp_' + this.token.rfc + '/' + this.selectedAnio + '/Merma/' + item);
                let x = response.data;
                return x;
            } catch (error) {
                return ObjInicial;
            }
        },

        async GetComparativa(item) {
            let ObjInicial = {
                año: this.selectedAnio,
                tipo: 'Comparativa',
                combustible: item,
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
            try {
                let response = await axios.get(this.rutaAxios + 'Gasolineros/GetLitrosGasolinerosAsync/erp_' + this.token.rfc + '/' + this.selectedAnio + '/Comparativa/' + item);
                let x = response.data;
                return x;
            } catch (error) {
                return ObjInicial;
            }
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