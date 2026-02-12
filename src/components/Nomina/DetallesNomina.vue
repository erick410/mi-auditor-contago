<template>
    <div class="q-pa-md">
        <!-- DIALOG PARA VER LOS PDF -->
        <q-dialog v-model="dialogDetalles" persistent transition-show="scale" transition-hide="scale" maximized>
            <visor-pdf @CloseDialogPdf="CloseDialogPdf"></visor-pdf>
        </q-dialog>

        <q-dialog v-model="dialogLista69B" persistent transition-show="scale" transition-hide="scale" maximized>
            <q-card>
                <q-bar class="bg-primary">
                    <q-icon color="white" name="mdi-account-search" />
                    <div class="text-white">Lista 69B</div>

                    <q-space />

                    <q-btn dense color="white" flat icon="close" v-close-popup>
                        <q-tooltip>Close</q-tooltip>
                    </q-btn>
                </q-bar>
                <q-card-section>
                    <lista69></lista69>
                </q-card-section>
            </q-card>
        </q-dialog>

        <q-card flat class="my-card">
            <q-card-section>
                <!-- SELECCIONA AÑO Y MES, BOTON DE BUSCAR Y EXPORTAR A EXCEL -->
                <div class="row no-wrap items-center q-mt-md q-pa-sm">
                    <q-btn push color="red-14" @click="CloseDialog" icon="mdi-close" rounded flat size="18px" padding="xs">
                        <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                            :offset="[10, 10]">Cerrar</q-tooltip>
                    </q-btn>
                    <q-space />
                    <div class="text-h5">{{ items.tipo }}</div>
                    <!-- <span>{{ items.tipo }}</span> -->
                    <q-space />
                   <q-btn push color="red-10" @click="abrirDialogLista69B" icon="mdi-account-search" rounded flat
                        size="18px" padding="xs">
                        <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                            content-style="font-size: 14px" :offset="[10, 10]">Lista 69B</q-tooltip>
                    </q-btn>
                    <q-btn push color="pink-6" @click="GetReporteDuplicados" icon="mdi-repeat-once" rounded flat size="18px"
                        padding="xs">
                        <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                            :offset="[10, 10]">Reporte Repetidos</q-tooltip>
                    </q-btn>
                    <q-btn push color="green-10" @click="ExportExcel" icon="mdi-file-excel-box-outline" rounded flat
                        size="18px" padding="xs">
                        <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                            :offset="[10, 10]">Exportar Excel</q-tooltip>
                    </q-btn>
                </div>
                <div class="row no-wrap justify-center">
                    <q-chip color="primary" text-color="white">
                        {{ 'Suma Parcial: ' + formatCurrency(sumaSeleccionado) }}
                    </q-chip>
                </div>
            </q-card-section>
        </q-card>

        <!-- TABLA DE SUELDOS Y SALARIOS -->
        <q-table  class="my-sticky-column-table" selection="multiple" :selected.sync="itemsSeleccion" :filter="filter" :data="items.detalles" :columns="columns" row-key="folioFiscal" :rows-per-page-options="[10]">
            <template v-slot:top-right>
        <q-input filled dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
            <template v-slot:body="props">
                <q-tr :props="props">
                    <q-td auto-width>
                        <q-checkbox v-model="props.selected" />
                        <q-btn size="md" color="red-10" rounded flat dense @click="VerComprobante(props.row)"
                            icon="mdi-file-pdf-box">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Ver Pdf</q-tooltip>
                        </q-btn>
                    </q-td>

                    <q-td key="serie" :props="props">{{ props.row.serie }}</q-td>
                    <q-td key="folio" :props="props">{{ props.row.folio }}</q-td>
                    <q-td key="rfc" :props="props">{{ props.row.rfc }}</q-td>
                    <q-td key="nombre" :props="props">{{ props.row.nombre }}</q-td>

                    <template v-if="items.origen === 'TRABAJADORES'">
                        <q-td key="fecha" :props="props">{{ formatDate(props.row.fecha) }}</q-td>
                    </template>

                    <q-td key="fechaPago" :props="props">{{ formatDate(props.row.fechaPago) }}</q-td>

                    <template v-if="items.origen === 'TRABAJADORES'">
                        <q-td key="fechaInicial" :props="props">{{ formatDate(props.row.fechaInicial) }}</q-td>
                        <q-td key="fechaFinal" :props="props">{{ formatDate(props.row.fechaFinal) }}</q-td>
                    </template>

                    <template v-if="items.origen === 'ISR'">
                        <q-td key="totalImpuestosRetenidos" :props="props">{{
                            formatCurrency(props.row.totalImpuestosRetenidos)
                        }}</q-td>
                    </template>

                    <q-td key="tipoRegimen" :props="props">{{ props.row.tipoRegimen }}</q-td>

                    <template v-if="items.origen === 'TRABAJADORES'">
                        <q-td key="totalPercepciones" :props="props">{{
                            formatCurrency(props.row.totalPercepciones)
                        }}</q-td>
                        <q-td key="totalDeducciones" :props="props">{{
                            formatCurrency(props.row.totalDeducciones)
                        }}</q-td>
                        <q-td key="totalOtrosPagos" :props="props">{{
                            formatCurrency(props.row.totalOtrosPagos)
                        }}</q-td>
                        <q-td key="total" :props="props">{{
                            formatCurrency(props.row.total)
                        }}</q-td>
                    </template>

                    <q-td key="tipoNomina" :props="props">{{ props.row.tipoNomina }}</q-td>
                    <q-td key="folioFiscal" :props="props">{{ props.row.folioFiscal }}</q-td>
                </q-tr>
            </template>
            <template v-slot:bottom-row>
                <q-tr>
                    <q-td colspan="100%" class="text-center">
                        <q-chip  v-if="$store.state.detallesIsrStore.origen == 'ISR'" color="primary" text-color="white">
                            {{ 'Total ISR: ' + formatCurrency(sumaISR) }}
                        </q-chip>

                        <q-chip  v-if="$store.state.detallesIsrStore.origen == 'TRABAJADORES'" color="primary" text-color="white">
                            {{ 'Total Percepciones: ' + formatCurrency(sumaPercepciones) }}
                        </q-chip>
                        <q-chip  v-if="$store.state.detallesIsrStore.origen == 'TRABAJADORES'" color="primary" text-color="white">
                            {{ 'Total Deducciones: ' + formatCurrency(sumaDeducciones) }}
                        </q-chip>
                        <q-chip  v-if="$store.state.detallesIsrStore.origen == 'TRABAJADORES'" color="primary" text-color="white">
                            {{ 'Total Neto Pagado: ' + formatCurrency(sumaNetoPagado) }}
                        </q-chip>
                    </q-td>
                </q-tr>
            </template>
        </q-table>
    </div>
</template>
<script>
import axios from 'axios'
import moment from 'moment'
import visorPdf from '../Pdf/VisorPdf.vue'
import lista69 from '../Lista69B/Lista69B.vue'

import * as xlsx from 'xlsx';

export default {
    components: {
        visorPdf,lista69
    },
    data() {
        return {
            filter:'',
            columnsISR: [
                // { name: 'actions', align: 'left', label: 'Acciones', field: 'actions' },
                { name: 'serie', align: 'left', label: 'Serie', field: 'serie', sortable: true },
                { name: 'folio', align: 'left', label: 'Folio', field: 'folio', sortable: true },
                { name: 'rfc', align: 'left', label: 'RFC', field: 'rfc', sortable: true },
                { name: 'nombre', align: 'left', label: 'Nombre', field: 'nombre', sortable: true },
                { name: 'fechaPago', align: 'left', label: 'Fecha de Pago', field: 'fechaPago', sortable: true },
                { name: 'totalImpuestosRetenidos', align: 'right', label: 'ISR', field: 'totalImpuestosRetenidos', sortable: true },
                { name: 'tipoRegimen', align: 'center', label: 'Tipo de Régimen', field: 'tipoRegimen', sortable: true },
                { name: 'tipoNomina', align: 'left', label: 'Tipo de Nómina', field: 'tipoNomina', sortable: true },
                { name: 'folioFiscal', align: 'left', label: 'Folio Fiscal', field: 'folioFiscal', sortable: true },
            ],

            columnsTrabajadores: [
                // { name: 'actions', align: 'left', label: 'Acciones', field: 'actions' },
                { name: 'serie', align: 'left', label: 'Serie', field: 'serie', sortable: true },
                { name: 'folio', align: 'left', label: 'Folio', field: 'folio', sortable: true },
                { name: 'rfc', align: 'left', label: 'RFC', field: 'rfc', sortable: true },
                { name: 'nombre', align: 'left', label: 'Nombre', field: 'nombre', sortable: true },

                { name: 'fecha', align: 'left', label: 'Fecha de Emisión', field: 'fecha', sortable: true },
                { name: 'fechaPago', align: 'left', label: 'Fecha de Pago', field: 'fechaPago', sortable: true },
                { name: 'fechaInicial', align: 'left', label: 'Fecha Inicial', field: 'fechaInicial', sortable: true },
                { name: 'fechaFinal', align: 'left', label: 'Fecha Final', field: 'fechaFinal', sortable: true },

                { name: 'tipoRegimen', align: 'center', label: 'Tipo de Régimen', field: 'tipoRegimen', sortable: true },

                { name: 'totalPercepciones', align: 'right', label: 'Total Percepciones', field: 'totalPercepciones', sortable: true },
                { name: 'totalDeducciones', align: 'right', label: 'Total Deducciones', field: 'totalDeducciones', sortable: true },
                { name: 'totalOtrosPagos', align: 'right', label: 'Tota Otros Pagos', field: 'totalOtrosPagos', sortable: true },
                { name: 'total', align: 'right', label: 'Neto Pagado', field: 'total', sortable: true },


                { name: 'tipoNomina', align: 'left', label: 'Tipo de Nómina', field: 'tipoNomina', sortable: true },
                { name: 'folioFiscal', align: 'left', label: 'Folio Fiscal', field: 'folioFiscal', sortable: true },
            ],

            dataSueldos: [],

            dialogDetalles: false,
    itemsSeleccion: [],
                dialogLista69B: false

        }
    },
    computed: {
        token() {
            return this.$store.state.usuario;
        },

        items() {
            return this.$store.state.detallesIsrStore;
        },

        columns() {
            switch (this.$store.state.detallesIsrStore.origen) {
                case "ISR":
                    return this.columnsISR;
                case "TRABAJADORES":
                    return this.columnsTrabajadores;
            }
        },

        rutaAxios() {
            return this.$store.state.rutaMongoStore
        },

        sumaSeleccionado() {
              switch (this.$store.state.detallesIsrStore.origen) {
                case "ISR":
                return this.itemsSeleccion.reduce((acumulador, objeto) => acumulador + objeto.totalImpuestosRetenidos, 0);
                   case "TRABAJADORES":
                return this.itemsSeleccion.reduce((acumulador, objeto) => acumulador + objeto.total, 0);

              }
            },
            sumaISR() {
              switch (this.$store.state.detallesIsrStore.origen) {
                case "ISR":
                return this.items.detalles.reduce((acumulador, objeto) => acumulador + objeto.totalImpuestosRetenidos, 0);
                   case "TRABAJADORES":
                return 0;
              }
            },
            sumaPercepciones(){
                 switch (this.$store.state.detallesIsrStore.origen) {
                case "ISR":
                return 0;
                   case "TRABAJADORES":
                return this.items.detalles.reduce((acumulador, objeto) => acumulador + objeto.totalPercepciones, 0);;
              }
            },
            sumaDeducciones(){
                 switch (this.$store.state.detallesIsrStore.origen) {
                case "ISR":
                return 0;
                   case "TRABAJADORES":
                return this.items.detalles.reduce((acumulador, objeto) => acumulador + objeto.totalDeducciones, 0);;
              }
            },
            sumaNetoPagado(){
                 switch (this.$store.state.detallesIsrStore.origen) {
                case "ISR":
                return 0;
                   case "TRABAJADORES":
                return this.items.detalles.reduce((acumulador, objeto) => acumulador + objeto.total, 0);;
              }
            }

    },
    created() {

    },
    methods: {
        formatCurrency(value) {
            return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        },

        formatDate(value) {
            let fecha_ = value.replace('T', ' ')
            let fecha_1 = fecha_.replace('Z', ' ')
            let listo = new Date(fecha_1);
            moment.locale('es-mx');
            return moment(listo).format('DD-MMMM-YYYY HH:mm:ss')
        },

        CloseDialog() {
            this.$emit('CloseDialogDetalles')
        },

        // ExportExcel() {
        //     const workbook = XLSX.utils.book_new();
        //     const sheet = XLSX.utils.json_to_sheet(this.items.detalles);
        //     XLSX.utils.book_append_sheet(workbook, sheet, 'Hoja1');
        //     XLSX.writeFile(workbook, this.items.origen + ' ' + this.items.tipo + '.xlsx');
        // },

        ExportExcel() {
            console.log(this.items)
            let reporte = 'REPORTE ' + this.items.origen.toUpperCase() + ' ' + this.items.tipo.toUpperCase()
            let empresa = this.$store.state.empresaStore.nombre
            let rfc = this.$store.state.empresaStore.rfc
         
            let periodo = this.items.tipo.toUpperCase()  

            const workbook = xlsx.utils.book_new();

            const cabecera = [
                [reporte],
                ["EMPRESA:", empresa.toUpperCase()],
                ["RFC:", rfc.toUpperCase()],
                ["TIPO:",periodo.toUpperCase()],
                // ["FECHA REPORTE:", new Date()],
                [],
            ];

            const columnasExcel = this.columns.filter(
                col => col.name !== "actions"
            );

            const dataExcel = this.items.detalles.map(row => {
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

            xlsx.utils.book_append_sheet(workbook, sheet, "DETALLES");

            xlsx.writeFile(
                workbook,
                rfc + ' - ' + empresa +  ' - ' + reporte.toUpperCase() + '.xlsx'
            );
            },

        BuscaRepetidos(obj1, obj2) {
            return (
                obj1.rfc === obj2.rfc &&
                obj1.tipoNomina === obj2.tipoNomina &&
                obj1.fechaPago === obj2.fechaPago
            );
        },

        GetReporteDuplicados() {
            let lista = [...this.items.detalles]
            const elementosRepetidos = lista.filter((elemento, index) => {
                return (
                    lista.findIndex((item) => this.BuscaRepetidos(item, elemento)) !== index
                );
            });

            const workbook = XLSX.utils.book_new();
            const sheet = XLSX.utils.json_to_sheet(elementosRepetidos);
            XLSX.utils.book_append_sheet(workbook, sheet, 'Hoja1');
            XLSX.writeFile(workbook, 'Reporte ISR ' + this.items.tipo + '_Repetidos.xlsx');
        },

        async VerComprobante(item) {
            try {
                this.$store.state.vistaPreviaStore.folioFiscal = item.folioFiscal;
                this.$store.state.vistaPreviaStore.color = "19775C"
                this.$store.state.vistaPreviaStore.tipoComprobanteInterno = "NOMINA"
                this.$store.state.vistaPreviaStore.tipo = "E"
                this.$store.state.vistaPreviaStore.rfc = this.token.rfc
                this.dialogDetalles = true;
            } catch (error) {
                console.log(error)
            }
        },

        CloseDialogPdf() {
            this.dialogDetalles = false;
        },

        abrirDialogLista69B() {
                this.dialogLista69B = true
            }
    },
}
</script>
<style>
.my-card {
    width: 100%;
}
</style>