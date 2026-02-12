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

        <!-- DIALOG DE LOS DETALLES -->
        <q-dialog v-model="dialogDetalles" persistent transition-show="scale" transition-hide="scale" maximized>
            <detalles-nomina @CloseDialogDetalles="CloseDialogDetalles"></detalles-nomina>
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

            <q-btn push color="amber-9" @click="GetTrabajadores" icon="mdi-text-box-search-outline" rounded flat
                size="18px" padding="xs">
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
        <q-table title="Reporte ISR" :data="dataTrabajadores" :columns="columns" row-key="rfc"
            :rows-per-page-options="[10]" :filter="filter">
            <template v-slot:top>
                <span class="text-body1" content-style="font-size: 20px">Trabajadores</span>
                <q-space />
                <q-input borderless dense debounce="300" v-model="filter" placeholder="Filtrar">
                    <template v-slot:append>
                        <q-icon name="mdi-magnify" />
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
                    <q-td auto-width>
                        <q-btn size="md" color="primary" rounded flat dense @click="OpenDialogDetalle(props.row)"
                            icon="mdi-format-list-bulleted">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Detalles</q-tooltip>
                        </q-btn>
                    </q-td>

                    <q-td key="rfc" :props="props">{{ props.row.rfc }}</q-td>
                    <q-td key="curp" :props="props">{{ props.row.curp }}</q-td>
                    <q-td key="nombre" :props="props">{{ props.row.nombre }}</q-td>
                    <q-td key="edad" :props="props">{{ props.row.edad }}</q-td>
                    <q-td key="periodicidad" :props="props">{{ props.row.periodicidad }}</q-td>
                    <q-td key="tipoContrato" :props="props">{{ props.row.tipoContrato }}</q-td>
                    <q-td key="tipoRegimen" :props="props">{{ props.row.tipoRegimen }}</q-td>

                    <q-td key="totalPercepciones" :props="props">{{ FormatCurrency(props.row.totalPercepciones)
                        }}</q-td>
                    <q-td key="totalDeducciones" :props="props">{{ FormatCurrency(props.row.totalDeducciones) }}</q-td>
                    <q-td key="totalOtrosPagos" :props="props">{{ FormatCurrency(props.row.totalOtrosPagos) }}</q-td>
                    <q-td key="neto" :props="props">{{ FormatCurrency(props.row.neto) }}</q-td>

                    <q-td key="orinarias" :props="props">{{ props.row.orinarias }}</q-td>
                    <q-td key="extraordinarias" :props="props">{{ props.row.extraordinarias }}</q-td>
                    <q-td key="puesto" :props="props">{{ props.row.puesto }}</q-td>
                    <q-td key="departamento" :props="props">{{ props.row.departamento }}</q-td>
                </q-tr>
            </template>

        </q-table>
        <q-markup-table separator="vertical" v-if="dataTrabajadores.length != 0">
            <thead>
                <tr>
                    <th class="text-center">Total Percepciones</th>
                    <th class="text-center">Total Deducciones</th>
                    <th class="text-center">Total Otros Pagos</th>
                    <th class="text-center">Total Neto Pagado</th>
                </tr>
            </thead>
            <tbody style="background: rgb(255, 190, 190)">
                <tr>
                    <td class="text-right">{{ FormatCurrency(totalPercepciones) }}</td>
                    <td class="text-right">{{ FormatCurrency(totalDeducciones) }}</td>
                    <td class="text-right">{{ FormatCurrency(totalOtrosPagos) }}</td>
                    <td class="text-right">{{ FormatCurrency(totalNetoPagado) }}</td>
                </tr>
            </tbody>
        </q-markup-table>

        <!-- GRAFICA-->
        <q-card style="width: 100%;" class="full-width q-mt-lg">
            <chart-component :chartData="chartData" :chartTitle="charTitleE"></chart-component>
        </q-card>
    </div>
</template>
<script>
    import axios from 'axios'
    import moment from 'moment'
    import DetallesNomina from './DetallesNomina.vue';
    import * as xlsx from 'xlsx';
    import { format } from 'date-fns';
    import { es } from 'date-fns/locale';
    import ChartComponent from "../Graficas/ChartComponent.vue";

    export default {
        components: {
            ChartComponent,
            DetallesNomina,
        },
        data() {
            return {
                totalPercepciones: 0,
                totalDeducciones: 0,
                totalOtrosPagos: 0,
                totalNetoPagado: 0,

                columns: [
                    { name: 'actions', align: 'left', label: 'Acciones', field: 'actions' },
                    { name: 'rfc', align: 'left', label: 'RFC', field: 'rfc', sortable: true },
                    { name: 'curp', align: 'left', label: 'CURP', field: 'curp', sortable: true },
                    { name: 'nombre', align: 'left', label: 'Nombre', field: 'nombre', sortable: true },
                    { name: 'edad', align: 'left', label: 'Edad', field: 'edad', sortable: true },
                    { name: 'periodicidad', align: 'left', label: 'Periodicidad', field: 'periodicidad', sortable: true },
                    { name: 'tipoContrato', align: 'left', label: 'Tipo de Contrato', field: 'tipoContrato', sortable: true },
                    { name: 'tipoRegimen', align: 'left', label: 'Tipo de Régimen', field: 'tipoRegimen', sortable: true },
                    { name: 'totalPercepciones', align: 'right', label: 'Total Percepciones', field: 'totalPercepciones', sortable: true },
                    { name: 'totalDeducciones', align: 'right', label: 'Total Deducciones', field: 'totalDEduciiones', sortable: true },
                    { name: 'totalOtrosPagos', align: 'right', label: 'Total Otros Pagos', field: 'totalOtrosPagos', sortable: true },
                    { name: 'neto', align: 'right', label: 'Neto Pagado', field: 'neto', sortable: true },
                    { name: 'orinarias', align: 'left', label: '# Ordinarias', field: 'ordinarias', sortable: true },
                    { name: 'extraordinarias', align: 'left', label: '# Extraordinarias', field: 'extraordinarias', sortable: true },
                    { name: 'puesto', align: 'left', label: 'Puesto', field: 'puesto', sortable: true },
                    { name: 'departamento', align: 'left', label: 'Departamento', field: 'departamento', sortable: true },
                ],
                dataTrabajadores: [],
                dataDetalles: [],
                fechaI: new Date(),
                fechaF: new Date(),
                filter: '',

                //LOADING
                dialog: false,
                dialogtext: '',

                //DETALLES
                dialogDetalles: false,
                charTitleE: 'Ingresos Por Mes',
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
                this.totalPercepciones = this.dataTrabajadores.reduce((acumulador, objeto) => acumulador + objeto.totalPercepciones, 0),
                    this.totalDeducciones = this.dataTrabajadores.reduce((acumulador, objeto) => acumulador + objeto.totalDeducciones, 0),
                    this.totalOtrosPagos = this.dataTrabajadores.reduce((acumulador, objeto) => acumulador + objeto.totalOtrosPagos, 0),
                    this.totalNetoPagado = this.dataTrabajadores.reduce((acumulador, objeto) => acumulador + objeto.neto, 0)
            },

            async GetTrabajadores() {
                this.dialog = true;
                this.dialogtext = 'Consultando, espere...'
                let fI = moment(this.fechaI).format('YYYY-MM-DD')
                let fF = moment(this.fechaF).format('YYYY-MM-DD')
                try {
                    let response = await axios.get(this.rutaAxios + 'Nomina/GetReporteTrabajadoresAsync/erp_' + this.token.rfc + '/' + fI + '/' + fF);
                    this.dataTrabajadores = response.data.general;
                    this.dataDetalles = response.data.detalles;
                    console.log(response.data)
                    await this.GenerarGrafica(response.data)

                    this.calcularTotales();
                    this.dialog = false;
                } catch (error) {
                    console.log(error)
                    this.dialog = false;
                }
            },

            async GenerarGrafica(data) {
                let lista = data.general
                lista.sort((a, b) => b.totalPercepciones - a.totalPercepciones);

                // Tomar los primeros 10 elementos
                let primerosDiez = lista.slice(0, 10);

                const nombres = primerosDiez.map((item) => item.nombre);
                const Percepciones = primerosDiez.map((item) => item.totalPercepciones);

                let obj2 = {
                    type: 'bar',
                    label: 'Total percepciones',
                    backgroundColor: '#FFA726',
                    data: Percepciones,
                    borderColor: 'white',
                    borderWidth: 2
                }
                let chartDatas = {
                    labels: nombres,
                    datasets: []
                }
                chartDatas.datasets.push(obj2)
                this.chartData = { ...chartDatas }
                console.log(this.chartData)
            },

            FormatCurrency(value) {
                return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
            },

            // ExportExcel() {
            //     let fi_ = new Date(this.fechaI);
            //     let ff_ = new Date(this.fechaF);

            //     let fI = format(fi_, 'dd-MMMM-yyyy', { locale: es })
            //     let fF = format(ff_, 'dd-MMMM-yyyy', { locale: es })

            //     const workbook = XLSX.utils.book_new();
            //     const sheetTrabajadores = XLSX.utils.json_to_sheet(this.dataTrabajadores);
            //     XLSX.utils.book_append_sheet(workbook, sheetTrabajadores, 'TRABAJADORES');
            //     XLSX.writeFile(workbook, 'REPORTE TRABAJADORES DEL ' + fI + ' AL ' + fF + '.xlsx');
            // },

            ExportExcel() {
            let reporte = 'REPORTE DE TRABAJADORES'
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

            const dataExcel = this.dataTrabajadores.map(row => {
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

            xlsx.utils.book_append_sheet(workbook, sheet, "TRABAJADORES");

            xlsx.writeFile(
                workbook,
                rfc + ' - ' + empresa +  ' - REPORTE DE TRABAJADORES DEL ' + periodo.toUpperCase() + '.xlsx'
            );
            },

            OpenDialogDetalle(item) {
                console.log(item.rfc)
                let listaFiltrada = this.dataDetalles.filter(r => r.rfc === item.rfc);
                console.log(listaFiltrada);

                this.$store.state.detallesIsrStore.detalles = [...listaFiltrada]
                this.$store.state.detallesIsrStore.tipo = item.rfc + ' | ' + item.nombre
                this.$store.state.detallesIsrStore.origen = 'TRABAJADORES'
                this.dialogDetalles = true;
            },

            CloseDialogDetalles() {
                this.dialogDetalles = false;
            },

            UltimoDiaMes() {
                const fecha = new Date(this.fechaI);
                const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
                this.fechaF = ultimoDia;
            },
        },
    }
</script>