<template>
    <q-page class=" q-pa-lg ">
        <!-- DIALOG PARA VER LOS PDF -->
        <q-dialog v-model="dialogDetallesI" persistent transition-show="scale" transition-hide="scale" maximized>
            <DetallesIngresos @CloseDialogDetallesI="dialogDetallesI = false"></DetallesIngresos>
        </q-dialog>

        <q-dialog v-model="dialogDetallesG" persistent transition-show="scale" transition-hide="scale" maximized>
            <DetallesGastos @CloseDialogDetallesG="dialogDetallesG = false"></DetallesGastos>
        </q-dialog>

        <div class="row	justify-end">
            <div class="col-12 col-md-2">
                <q-select label="Tipo" filled dense v-model="tipo" :options="['Emisor', 'Receptor']" />
            </div>
            <div class="col-12 col-md-2">
                <q-input v-model="fehaIMasked" filled label="Fecha Inicial" name="event" outlined dense>
                    <template v-slot:before>
                        <q-icon name="event" color="primary" />
                    </template>
                    <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                        <q-date v-model="fechaI" @input="UltimoDiaMes">
                            <div class="row items-center justify-end">
                                <q-btn v-close-popup label="Ok" color="primary" flat />
                            </div>
                        </q-date>
                    </q-popup-proxy>
                </q-input>
            </div>
            <div class="col-12 col-md-2">
                <q-input v-model="fehaFMasked" filled label="Fecha Final" name="event" outlined dense>
                    <template v-slot:before>
                        <q-icon name="event" color="primary" />
                    </template>
                    <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                        <q-date v-model="fechaF">
                            <div class="row items-center justify-end">
                                <q-btn v-close-popup label="Ok" color="primary" flat />
                            </div>
                        </q-date>
                    </q-popup-proxy>

                </q-input>
            </div>
            <div class="col-12 col-md-1 text-right">
                <q-btn round color="primary" icon="mdi-magnify" @click="consultar()">
                    <q-tooltip>
                        Buscar
                    </q-tooltip>
                </q-btn>
                <q-btn class="q-ml-sm" round color="green" icon="mdi-microsoft-excel" @click="ExportExcel()">
                    <q-tooltip>
                        Exportar
                    </q-tooltip>
                </q-btn>
            </div>
        </div>
        <q-table :filter="filter" class="shadow-0 q-mt-md" title="Lista de 69B" :data="itemsLista" :columns="columns"
            row-key="rfc" :loading="loadingTabla">
            <template v-slot:top-right>
                <q-input filled dense debounce="300" v-model="filter" placeholder="Filtrar">
                    <template v-slot:append>
                        <q-icon name="search" />
                    </template>
                </q-input>
            </template>
            <template v-slot:loading>
                <q-inner-loading showing color="primary" />
            </template>
            <template v-slot:body="props">
                <q-tr :props="props">

                    <q-td auto-width>
                        <q-btn v-if="tipo == 'Emisor'" size="md" color="primary" rounded flat dense
                            @click="GetReporteI(props.row)" icon="mdi-format-list-bulleted">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Detalles</q-tooltip>
                        </q-btn>

                        <q-btn v-else size="md" color="primary" rounded flat dense @click="GetReporteG(props.row)"
                            icon="mdi-format-list-bulleted">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Detalles</q-tooltip>
                        </q-btn>
                    </q-td>

                    <q-td key="rfc" :props="props">{{ props.row.rfc }}</q-td>
                    <q-td key="nombre" :props="props">{{ props.row.nombre }}</q-td>
                    <q-td key="listaB" :props="props">{{ props.row.listaB }}</q-td>
                    <q-td key="localizado" :props="props">{{ props.row.localizado }}</q-td>
                    <q-td key="fecha_publicacion" :props="props">{{ props.row.fecha_publicacion }}</q-td>
                </q-tr>
            </template>
        </q-table>
    </q-page>
</template>
<script>
import axios from "axios";
import moment from 'moment'
import * as xlsx from 'xlsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import DetallesIngresos from "./DetallesIngresos.vue";
import DetallesGastos from "./DetallesGastos.vue";
import { QSpinnerCube } from 'quasar'

export default {
    components: { DetallesIngresos, DetallesGastos },
    data() {
        return {
            tipo: "Emisor",
            fechaI: new Date(),
            fechaF: new Date(),
            itemsLista: [],
            columns: [
                { name: 'actions', align: 'center', label: 'Acciones', field: 'actions', },
                { name: 'rfc', align: 'center', label: 'RFC', field: 'rfc', classes: 'text-center text-dark  bg-grey-2 ellipsis', headerClasses: 'bg-primary text-white', },
                { name: 'nombre', align: 'center', label: 'Nombre', classes: 'text-left', field: 'nombre' },
                { name: 'listaB', align: 'center', label: 'Lista 69B', field: 'listaB' },
                { name: 'localizado', align: 'center', label: 'No Localizado', field: 'localizado', },
                { name: 'fecha_publicacion', align: 'center', label: 'Fecha de publicación', field: 'fecha_publicacion', },
            ],
            loadingTabla: false,
            filter: '',

            dialogDetallesI: false,
            dialogDetallesG: false
        }
    },
    computed: {
        token() {
            return this.$store.state.usuario;
        },
        fehaIMasked() {
            moment.locale('es-mx');
            return this.fechaI ? moment.utc(this.fechaI).format('DD/MMMM/yyyy') : ''
        },
        fehaFMasked() {
            moment.locale('es-mx');
            return this.fechaF ? moment.utc(this.fechaF).format('DD/MMMM/yyyy') : ''
        },
        rutaAxios() {
            return 'https://api-mongo.contago.com.mx/api/';
        }
    },
    created() {

    },
    methods: {
        async consultar() {
            this.loadingTabla = true

            let fI = moment(this.fechaI).format('YYYY-MM-DD')
            let fF = moment(this.fechaF).format('YYYY-MM-DD')
            try {
                let response = await axios.get(this.rutaAxios + "Consultas/GetListaB/erp_" + this.token.rfc + "/" + this.tipo + "/" + fI + '/' + fF);
                console.log(response)
                this.itemsLista = response.data;
                this.loadingTabla = false
            } catch (error) {
                console.log(error);
                this.loadingTabla = false
            }
        },

        UltimoDiaMes() {
            const fecha = new Date(this.fechaI);
            const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
            this.fechaF = ultimoDia;
        },

        // ExportExcel() {
        //     let fi_ = new Date(this.fechaI);
        //     let ff_ = new Date(this.fechaF);

        //     let fI = format(fi_, 'dd-MMMM-yyyy', { locale: es })
        //     let fF = format(ff_, 'dd-MMMM-yyyy', { locale: es })

        //     const workbook = XLSX.utils.book_new();
        //     const sheetTrabajadores = XLSX.utils.json_to_sheet(this.itemsLista);
        //     XLSX.utils.book_append_sheet(workbook, sheetTrabajadores, 'LIBRO 1');
        //     XLSX.writeFile(workbook, 'LISTA DE 69B_' + this.tipo + '_' + fI + ' AL ' + fF + '.xlsx');
        // },

        ExportExcel() {
            let reporte = 'REPORTE LISTA DE 69B ' + this.tipo.toUpperCase()
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

            const dataExcel = this.itemsLista.map(row => {
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
                rfc + ' - ' + empresa +  ' - REPORTE LISTA DE 69B ' + this.tipo.toUpperCase() + ' DEL ' + periodo.toUpperCase() + '.xlsx'
            );
            },

        async GetReporteI(item) {
            this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'white', spinnerSize: 120, message: 'Consultando conceptos. Espere...', messageColor: 'white' })

            let fI = moment(this.fechaI).format('YYYY-MM-DD')
            let fF = moment(this.fechaF).format('YYYY-MM-DD')
            try {
                let response = await axios.get('https://api-mongo.contago.com.mx/api/Ingresos/GetReporteConceptosClienteAsync/erp_' + this.token.rfc + '/' + fI + '/' + fF + '/' + item.rfc);
                let x = response.data;
                this.$store.state.comprobantes69BI = [...x]
                this.dialogDetallesI = true
                this.$q.loading.hide()
            } catch (error) {
                console.log(error)
                this.$q.loading.hide()
            }
        },

        async GetReporteG(item) {
            this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'white', spinnerSize: 120, message: 'Consultando conceptos. Espere...', messageColor: 'white' })

            let fI = moment(this.fechaI).format('YYYY-MM-DD')
            let fF = moment(this.fechaF).format('YYYY-MM-DD')
            try {
                let response = await axios.get('https://api-mongo.contago.com.mx/api/Gastos/GetReporteConceptosProveedorAsync/erp_' + this.token.rfc + '/' + fI + '/' + fF + '/' + item.rfc);
                let x = response.data;
                this.$store.state.comprobantes69BG = [...x]
                this.dialogDetallesG = true
                console.log(x)
                this.$q.loading.hide()
            } catch (error) {
                console.log(error)
                this.$q.loading.hide()
            }
        },
    }
}
</script>