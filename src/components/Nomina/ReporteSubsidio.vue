<template>
    <div class="q-pa-md">
        <!-- DIALOG PARA VER LOS PDF -->
        <q-dialog v-model="dialogPdf" persistent transition-show="scale" transition-hide="scale" maximized>
            <visor-pdf @CloseDialogPdf="dialogPdf = false"></visor-pdf>
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
        <q-table title="Reporte ISR" :data="dataConceptos" :columns="columns" row-key="rfc" :rows-per-page-options="[10]" :filter="filter">
            <template v-slot:top>
                <span class="text-body1" content-style="font-size: 20px">Subsidio</span>
                <q-space />
                <q-input borderless dense debounce="300" v-model="filter" placeholder="Buscar">
                    <template v-slot:append>
                      <q-icon name="search" />
                    </template>
                  </q-input>
            </template>
            <template v-slot:body="props">
                <q-tr :props="props">
                    <q-td auto-width>
                        <q-btn size="md" color="red-10" rounded flat dense @click="VerComprobante(props.row)"
                            icon="mdi-file-pdf">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Ver comprobante</q-tooltip>
                        </q-btn>
                    </q-td>
                    <q-td key="serie" :props="props">{{ props.row.serie }}</q-td>
                    <q-td key="folio" :props="props">{{ props.row.folio }}</q-td>
                    <q-td key="fechaPago" :props="props">{{ props.row.fechaPago }}</q-td>
                    <q-td key="rfc" :props="props">{{ props.row.rfc }}</q-td>
                    <q-td key="nombre" :props="props">{{ props.row.nombre }}</q-td>
                    <q-td key="deduccion036" :props="props">{{ FormatCurrency(props.row.deduccion036) }}</q-td>
                    <q-td key="deduccion071" :props="props">{{ FormatCurrency(props.row.deduccion071) }}</q-td>
                    <q-td key="deduccion086" :props="props">{{ FormatCurrency(props.row.deduccion086) }}</q-td>
                    <q-td key="deduccion107" :props="props">{{ FormatCurrency(props.row.deduccion107) }}</q-td>
                    <q-td key="otros002" :props="props">{{ FormatCurrency(props.row.otros002) }}</q-td>
                    <q-td key="otros007" :props="props">{{ FormatCurrency(props.row.otros007) }}</q-td>
                    <q-td key="otros008" :props="props">{{ FormatCurrency(props.row.otros008) }}</q-td>
                    <q-td key="folioFiscal" :props="props">{{ props.row.folioFiscal }}</q-td>
                </q-tr>
            </template>
        </q-table>
        <q-markup-table separator="vertical" v-if="dataConceptos.length != 0">
            <thead>
                <tr>
                    <th class="text-center" style="min-width:200px; white-space: normal">Ajuste en Subsidios por incapacidad Exento</th>
                    <th class="text-center" style="min-width:200px; white-space: normal">Ajuste en Subsidio para el empleo (efectivamente entregado al trabajador)</th>
                    <th class="text-center" style="min-width:200px; white-space: normal">Ajuste en Subsidios por incapacidad Gravado</th>
                    <th class="text-center" style="min-width:200px; white-space: normal">Ajuste al Subsidio Causado</th>
                    <th class="text-center" style="min-width:200px; white-space: normal">Subsidio para el empleo (efectivamente entregado al trabajador)</th>
                    <th class="text-center" style="min-width:200px; white-space: normal">ISR ajustado por subsidio</th>
                    <th class="text-center" style="min-width:200px; white-space: normal">Subsidio efectivamente entregado que no correspondía (Aplica sólo cuando haya ajuste al cierre de mes en relación con el Apéndice 7 de la guía de llenado de nómina)</th>
                </tr>
            </thead>
            <tbody style="background: rgb(255, 190, 190)">
                <tr>
                    <td class="text-right">{{ FormatCurrency(totalDeduccion036) }}</td>
                    <td class="text-right">{{ FormatCurrency(totalDeduccion071) }}</td>
                    <td class="text-right">{{ FormatCurrency(totalDeduccion086) }}</td>
                    <td class="text-right">{{ FormatCurrency(totalDeduccion107) }}</td>
                    
                    <td class="text-right">{{ FormatCurrency(totalOtros002) }}</td>
                    <td class="text-right">{{ FormatCurrency(totalOtros007) }}</td>
                    <td class="text-right">{{ FormatCurrency(totalOtros008) }}</td>
                </tr>
            </tbody>
        </q-markup-table>
    </div>
</template>
<script>
import axios from 'axios'
import moment from 'moment'
import DetallesNomina from './DetallesNomina.vue';
import * as XLSX from 'xlsx';
import { QSpinnerCube } from 'quasar';
import visorPdf from '../Pdf/VisorPdf.vue'

export default {
    components: {
        DetallesNomina,
        visorPdf,
    },
    data() {
        return {
            columns: [
                { name: 'actions', align: 'left', label: 'Acciones', field: 'actions' },
                { name: 'serie', align: 'left', label: 'Serie', field: 'serie', sortable: true },
                { name: 'folio', align: 'left', label: 'Folio', field: 'folio', sortable: true },
                { name: 'fechaPago', align: 'left', label: 'Fecha de Pago', field: 'fechaPago', sortable: true },
                { name: 'rfc', align: 'left', label: 'RFC', field: 'rfc', sortable: true },
                { name: 'nombre', align: 'left', label: 'Nombre', field: 'nombre', sortable: true },
                { name: 'deduccion036', align: 'right', label: 'Ajuste en Subsidios por incapacidad Exento', field: 'deduccion036', sortable: true, headerStyle: 'min-width: 200px;  white-space: normal;', headerClasses: 'bg-primary text-white'},
                { name: 'deduccion071', align: 'right', label: 'Ajuste en Subsidio para el empleo (efectivamente entregado al trabajador)', field: 'deduccion071', sortable: true, headerStyle: 'min-width: 200px;  white-space: normal;', headerClasses: 'bg-primary text-white' },
                { name: 'deduccion086', align: 'right', label: 'Ajuste en Subsidios por incapacidad Gravado', field: 'deduccion086', sortable: true, headerStyle: 'min-width: 200px;  white-space: normal;', headerClasses: 'bg-primary text-white' },
                { name: 'deduccion107', align: 'right', label: 'Ajuste al Subsidio Causado', field: 'deduccion107', sortable: true, headerStyle: 'min-width: 200px;  white-space: normal;', headerClasses: 'bg-primary text-white' },
                { name: 'otros002', align: 'right', label: 'Subsidio para el empleo (efectivamente entregado al trabajador)', field: 'otros002', sortable: true, headerStyle: 'min-width: 200px;  white-space: normal;', headerClasses: 'bg-amber-10 text-white' },
                { name: 'otros007', align: 'right', label: 'ISR ajustado por subsidio', field: 'otros007', sortable: true, headerStyle: 'min-width: 200px;  white-space: normal;', headerClasses: 'bg-amber-10 text-white'},
                { name: 'otros008', align: 'right', label: 'Subsidio efectivamente entregado que no correspondía (Aplica sólo cuando haya ajuste al cierre de mes en relación con el Apéndice 7 de la guía de llenado de nómina)', field: 'otros008', sortable: true, headerStyle: 'min-width: 200px;  white-space: normal;', headerClasses: 'bg-amber-10 text-white' },
                { name: 'folioFiscal', align: 'left', label: 'Folio Fiscal', field: 'folioFiscal', sortable: true },
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

            dialogPdf: false,
            filter: "",
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
        },

        totalDeduccion036(){
            let suma = this.dataConceptos.reduce((acumulador, objeto) => acumulador + objeto.deduccion036, 0)
            return suma;
        },

        totalDeduccion071(){
            let suma = this.dataConceptos.reduce((acumulador, objeto) => acumulador + objeto.deduccion071, 0)
            return suma;
        },

        totalDeduccion086(){
            let suma = this.dataConceptos.reduce((acumulador, objeto) => acumulador + objeto.deduccion086, 0)
            return suma;
        },

        totalDeduccion107(){
            let suma = this.dataConceptos.reduce((acumulador, objeto) => acumulador + objeto.deduccion107, 0)
            return suma;
        },

        totalOtros002(){
            let suma = this.dataConceptos.reduce((acumulador, objeto) => acumulador + objeto.otros002, 0)
            return suma;
        },

        totalOtros007(){
            let suma = this.dataConceptos.reduce((acumulador, objeto) => acumulador + objeto.otros007, 0)
            return suma;
        },

        totalOtros008(){
            let suma = this.dataConceptos.reduce((acumulador, objeto) => acumulador + objeto.otros008, 0)
            return suma;
        },

    },
    created() {

    },
    methods: {
        calcularTotales() {
            this.totalOtrosPagos = this.dataConceptos.reduce((acumulador, objeto) => acumulador + objeto.totalOtrosPagos, 0)
        },
        async GetReporte() {
            this.$q.loading.show({
                spinner: QSpinnerCube,
                spinnerColor: 'green-8',
                spinnerSize: 140,
                message: 'Consultando espere..',
            })
            this.dataConceptos = [];
            let fI = moment(this.fechaI).format('YYYY-MM-DD')
            let fF = moment(this.fechaF).format('YYYY-MM-DD')
            try {
                let response = await axios.get(this.rutaAxios + 'Nomina/GetReporteSubsidioAsync/erp_' + this.token.rfc + '/' + fI + '/' + fF);
                let x = response.data;
                this.dataConceptos = [...x]
                this.$q.loading.hide()
                // this.calcularTotales()
            } catch (error) {
                console.log(error)
                this.$q.loading.hide()
            }
        },

        FormatCurrency(value) {
            return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        },

        ExportExcel() {
            const nuevaLista = this.dataConceptos;
            let empresa = this.$store.state.empresaStore.nombre
            let rfc = this.$store.state.empresaStore.rfc
            let fI = moment(this.fechaI).format('DD/MMMM/yyyy')
            let fF = moment(this.fechaF).format('DD/MMMM/yyyy')
            const columnsToInclude = [
                "serie",
                "folio",
                "fechaPago",
                "rfc",
                "nombre",
                "deduccion036",
                "deduccion071",
                "deduccion086",
                "deduccion107",
                "otros002", 
                "otros007",
                "otros008",
                "folioFiscal",
            ];

            const data = [...this.dataConceptos];
            const datos = data.map(item =>
                columnsToInclude.reduce((acc, column) => {
                    acc[column] = item[column];
                    return acc;
                }, {})
            );
            const arrayDeValores = datos.map(objeto => Object.values(objeto));
            const libroTrabajo = XLSX.utils.book_new();
            const hojaCalculo = XLSX.utils.aoa_to_sheet([
                    ['REPORTE SUBSIDIO'],
                    [this.token.rfc + '| ' + this.token.empresa],
                    ["Del " + fI + " al " + fF],
                    [],
                    [
                        "Serie",
                        "Folio",
                        "Fecha de Pago",
                        "RFC",
                        "Nombre",
                        "Ajuste en Subsidio por Incapacidad Exento",
                        "Ajuste en Subsidio para el empleo (efectivamente entregado al trabajador)",
                        "Ajuste en Subsidios por incapacidad Gravado",
                        "Ajuste al Subsidio Causado",
                        "Subsidio para el empleo (efectivamente entregado al trabajador)", 
                        "ISR ajustado por subsidio",
                        "Subsidio efectivamente entregado que no correspondía (Aplica sólo cuando haya ajuste al cierre de mes en relación con el Apéndice 7 de la guía de llenado de nómina)",
                        "Folio Fiscal",
                    ],
                    ...arrayDeValores.map((registro, index) => [
                        registro[0],
                        registro[1],
                        registro[2],
                        registro[3],
                        registro[4],
                        { t: 'n', v: registro[5], z: '#,##0.000' },
                        { t: 'n', v: registro[6], z: '#,##0.000' },
                        { t: 'n', v: registro[7], z: '#,##0.000' },
                        { t: 'n', v: registro[8], z: '#,##0.000' },
                        { t: 'n', v: registro[9], z: '#,##0.000' },
                        { t: 'n', v: registro[10], z: '#,##0.000' },
                        { t: 'n', v: registro[11], z: '#,##0.000' },
                        registro[12],
                    ]),
                ]);
            // Combinar celdas A1 a H1 y centrar texto
            hojaCalculo['!merges'] = [{ s: { r: 0, c: 0 }, e: { c: 7, r: 0 } }];
            hojaCalculo['!merges'].push({ s: { c: 0, r: 1 }, e: { c: 7, r: 1 } });
            hojaCalculo['!merges'].push({ s: { c: 0, r: 2 }, e: { c: 7, r: 2 } });
            XLSX.utils.book_append_sheet(libroTrabajo, hojaCalculo, 'Hoja1');
            const nombreArchivo =  rfc + ' - ' + empresa +   ' - REPORTE ISR ';
            XLSX.writeFile(libroTrabajo, nombreArchivo + "DEL " + fI + " AL " + fF + '.xlsx');
        },

        UltimoDiaMes() {
            const fecha = new Date(this.fechaI);
            const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
            this.fechaF = ultimoDia;
        },

        VerComprobante(item){
            this.$store.state.vistaPreviaStore.folioFiscal = item.folioFiscal;
            this.$store.state.vistaPreviaStore.color = "19775C"
            this.$store.state.vistaPreviaStore.tipoComprobanteInterno = "NOMINA"
            this.$store.state.vistaPreviaStore.tipo = "E"
            this.$store.state.vistaPreviaStore.rfc = this.token.rfc
            this.dialogPdf = true;
        },
    },
}
</script>
<style>

</style>