<template>
    <div class="q-pa-md">
        <!-- DIALOG LOADING -->
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

        <!-- SELECCIONA AÑO Y MES, BOTON DE BUSCAR Y EXPORTAR A EXCEL -->
        <div class="row no-wrap items-center q-mt-md q-pa-sm">
            <q-space />

            <q-input v-model="fehaIMasked" label="Fecha Inicial" class="q-mr-sm" name="event">
                <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                    <q-date v-model="fechaI" @input="UltimoDiaMes">
                        <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Ok" color="primary" flat />
                        </div>
                    </q-date>
                </q-popup-proxy>
            </q-input>

            <q-input v-model="fechaFMasked" label="Fecha Final" class="q-mr-xs">
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
            <q-space />
        </div>

        <!-- TABLA DE TRABAJADORES -->
        <q-table title="Reporte ISR" :data="dataConceptos" :columns="columns" row-key="rfc" :rows-per-page-options="[10]">
            <template v-slot:top>
                <span class="text-body1" content-style="font-size: 20px">Conceptos Catálogo SAT</span>
                <q-space />
                <q-btn push color="blue-7" @click="OpenNotas(1)" icon="mdi-information-outline" rounded flat size="18px"
                    padding="xs">
                    <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                        :offset="[10, 10]">Información</q-tooltip>
                </q-btn>
            </template>
            <template v-slot:body="props">
                <q-tr :props="props">
                    <q-td key="clave" :props="props">{{ props.row.clave }}</q-td>
                    <q-td key="descripcion" :props="props">{{ props.row.descripcion }}</q-td>
                    <q-td key="totalGravado" :props="props">{{ FormatCurrency(props.row.totalGravado) }}</q-td>
                    <q-td key="totalExento" :props="props">{{ FormatCurrency(props.row.totalExento) }}</q-td>
                    <q-td key="totalDeducciones" :props="props">{{ FormatCurrency(props.row.totalDeducciones) }}</q-td>
                    <q-td key="totalOtrosPagos" :props="props">{{ FormatCurrency(props.row.totalOtrosPagos) }}</q-td>
                </q-tr>
            </template>
        </q-table>
        <q-markup-table separator="vertical" v-if="dataConceptos.length != 0">
            <thead>
                <tr>
                    <th class="text-center">Total Gravado</th>
                    <th class="text-center">Total Exento</th>
                    <th class="text-center">Total Deducciones</th>
                    <th class="text-center">Total Otros Pagos</th>
                </tr>
            </thead>
            <tbody style="background: rgb(255, 190, 190)">
                <tr>
                    <td class="text-right">{{ FormatCurrency(totalGravado) }}</td>
                    <td class="text-right">{{ FormatCurrency(totalExento) }}</td>
                    <td class="text-right">{{ FormatCurrency(totalDeducciones) }}</td>
                    <td class="text-right">{{ FormatCurrency(totalOtrosPagos) }}</td>
                </tr>
            </tbody>
        </q-markup-table>

         <!-- GRAFICA-->
        <q-card style="width: 100%; " class="full-width q-mt-lg">
            <chart-component :chartData="chartData" :chartTitle="charTitleE"  ></chart-component>
        </q-card>

    </div>
</template>
<script>
import axios from 'axios'
import moment from 'moment'
import DetallesNomina from './DetallesNomina.vue';
import * as xlsx from 'xlsx';
import ChartComponent from "../Graficas/ChartComponent.vue";

export default {
    components: {
            ChartComponent,
        DetallesNomina,
    },
    data() {
        return {
            columns: [
                { name: 'clave', align: 'left', label: 'Clave', field: 'clave', sortable: true },
                { name: 'descripcion', align: 'left', label: 'Descripción', field: 'descripcion', sortable: true },
                { name: 'totalGravado', align: 'right', label: 'Total Gravado', field: 'totalGravado', sortable: true },
                { name: 'totalExento', align: 'right', label: 'Total Exento', field: 'totalExento', sortable: true },
                { name: 'totalDeducciones', align: 'right', label: 'Total Deducciones', field: 'totalDeducciones', sortable: true },
                { name: 'totalOtrosPagos', align: 'right', label: 'Total Otros Pagos', field: 'totalOtrosPagos', sortable: true },
            ],
            dataConceptos: [],
            fechaI: new Date(),
            fechaF: new Date(),

            //LOADING
            dialog: false,
            dialogtext: '',

            totalOtrosPagos: 0,
            totalDeducciones: 0,
            totalExento: 0,
            totalGravado: 0,

            charTitleE: 'Reporte Conceptos SAT',
            chartData: null,

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
            this.totalOtrosPagos = this.dataConceptos.reduce((acumulador, objeto) => acumulador + objeto.totalOtrosPagos, 0),
                this.totalDeducciones = this.dataConceptos.reduce((acumulador, objeto) => acumulador + objeto.totalDeducciones, 0),
                this.totalExento = this.dataConceptos.reduce((acumulador, objeto) => acumulador + objeto.totalExento, 0),
                this.totalGravado = this.dataConceptos.reduce((acumulador, objeto) => acumulador + objeto.totalGravado, 0)
        },
        async GetReporte() {
            this.dialogtext = 'Consultando, espere...';
            this.dialog = true;
            let fI = moment(this.fechaI).format('YYYY-MM-DD')
            let fF = moment(this.fechaF).format('YYYY-MM-DD')
            try {
                let response = await axios.get(this.rutaAxios + 'Nomina/GetReporteConceptosSatAsync/erp_' + this.token.rfc + '/' + fI + '/' + fF);
                let x = response.data;
                this.dataConceptos = [...x]
                this.calcularTotales()
                this.GenerarGrafica(this.dataConceptos)
                this.dialog = false;
            } catch (error) {
                console.log(error)
                this.dialog = false;
            }
        },

         async GenerarGrafica(dataConceptos){
                   const meses = dataConceptos.map((item) => item.descripcion);
                    const itemsTotalExento = dataConceptos.map((item) => item.totalExento);
                    const itemsTotalDeducciones = dataConceptos.map((item) => item.totalDeducciones);
                    const itemsTotalGravado = dataConceptos.map((item) => item.totalGravado);
                    const itemsTotalOtrosPagos = dataConceptos.map((item) => item.totalOtrosPagos);

                    let obj2 = {
                        type: 'bar',
                        label: 'Total Exento (Barra)',
                        backgroundColor: '#FFA726',
                        data: itemsTotalExento,
                        borderColor: 'white',
                        borderWidth: 2
                    }

                
                    let obj4 = {
                        type: 'bar',
                        label: 'Total Deducciones (Barra)',
                        backgroundColor: '#66BB6A',
                        data: itemsTotalDeducciones,
                        borderColor: 'white',
                        borderWidth: 2
                    }
                
                    let obj6 = {
                        type: 'bar',
                        label: 'Total Gravado (Barra)',
                        backgroundColor: '#E74747',
                        data: itemsTotalGravado,
                        borderColor: 'white',
                        borderWidth: 2
                    }

                     let obj7 = {
                        type: 'bar',
                        label: 'Otros Pagos (Barra)',
                        backgroundColor: '#1A4161',
                        data: itemsTotalOtrosPagos,
                        borderColor: 'white',
                        borderWidth: 2
                    }

                    let chartDatas = {
                        labels: meses,
                        datasets: []
                    }

                    chartDatas.datasets.push(obj2)
                    chartDatas.datasets.push(obj4)
                    chartDatas.datasets.push(obj6)
                    chartDatas.datasets.push(obj7)
                    this.chartData = { ...chartDatas }
                    console.log(this.chartData)
            },
        FormatCurrency(value) {
            return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        },

        // ExportExcel() {
        //     const nuevaLista = this.dataConceptos;

        //     let fI = moment(this.fechaI).format('DD/MMMM/yyyy')
        //     let fF = moment(this.fechaF).format('DD/MMMM/yyyy')

        //     const workbook = XLSX.utils.book_new();
        //     const sheetTrabajadores = XLSX.utils.json_to_sheet(nuevaLista);
        //     XLSX.utils.book_append_sheet(workbook, sheetTrabajadores, 'CONCEPTOS');
        //     XLSX.writeFile(workbook, 'Reporte conceptos SAT del ' + fI + ' al ' + fF + '.xlsx');
        // },

        ExportExcel() {
            let reporte = 'REPORTE DE CONCEPTOS SAT'
            let empresa = this.$store.state.empresaStore.nombre
            let rfc = this.$store.state.empresaStore.rfc
            let fI = moment(this.fechaI).format('DD-MMMM-YYYY')
            let fF = moment(this.fechaF).format('DD-MMMM-YYYY')
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

            const dataExcel = this.dataConceptos.map(row => {
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
                rfc + ' - ' + empresa +  ' - REPORTE DE CONCEPTOS SAT DEL ' + periodo.toUpperCase() + '.xlsx'
            );
            },

        UltimoDiaMes() {
            const fecha = new Date(this.fechaI);
            const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
            this.fechaF = ultimoDia;
        },
    },
}
</script>