<template>
    <div class="q-pa-md">
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
                    <q-td key="fechaPago" :props="props">{{ FormatDate(props.row.fechaPago) }}</q-td>
                    <q-td key="clave" :props="props">{{ props.row.clave }}</q-td>
                    <q-td key="nombre" :props="props">{{ props.row.nombre }}</q-td>
                    <q-td key="dias" :props="props">{{ props.row.dias }}</q-td>
                    <q-td key="salDiario" :props="props">{{ props.row.salDiario }}</q-td>
                    <q-td key="sueldo" :props="props">{{ props.row.sueldo }}</q-td>
                    <q-td key="otrasPercep" :props="props">{{ props.row.otrasPercep }}</q-td>
                    <q-td key="rfc" :props="props">{{ props.row.rfc }}</q-td>
                    <q-td key="nss" :props="props">{{ props.row.nss }}</q-td>
                    <q-td key="curp" :props="props">{{ props.row.curp }}</q-td>
                    <q-td key="sdi" :props="props">{{ props.row.sdi }}</q-td>
                    <q-td key="netoPagado" :props="props">{{ props.row.netoPagado }}</q-td>
                    <q-td key="totalISr" :props="props">{{ props.row.totalISr }}</q-td>
                    <q-td key="otrasDeduc" :props="props">{{ props.row.otrasDeduc }}</q-td>
                    <q-td key="totalDeducciones" :props="props">{{ props.row.totalDeducciones }}</q-td>
                    <q-td key="fechaAlta" :props="props">{{ FormatDate(props.row.fechaAlta) }}</q-td>
                    <q-td key="firma" :props="props">{{ props.row.firma }}</q-td>
                </q-tr>
            </template>

        </q-table>
    </div>
</template>
<script>
    import axios from 'axios'
    import moment from 'moment'
    import * as xlsx from 'xlsx';
    import { format } from 'date-fns';
    import { es } from 'date-fns/locale';
    import { QSpinnerCube } from 'quasar'

    export default {
        components: {},
        data() {
            return {
                columns: [                    
                    { name: 'fechaPago', align: 'left', label: 'Fecha de pago', field: 'fechaPago', sortable: true },
                    { name: 'clave', align: 'left', label: 'Clave', field: 'clave', sortable: true },
                    { name: 'nombre', align: 'left', label: 'Nombre', field: 'nombre', sortable: true },
                    { name: 'dias', align: 'left', label: 'Dias trabajados', field: 'dias', sortable: true },

                    { name: 'salDiario', align: 'right', label: 'Sal. diario', field: 'salDiario', sortable: true },
                    { name: 'sueldo', align: 'right', label: 'Sueldo', field: 'sueldo', sortable: true },
                    { name: 'otrasPercep', align: 'right', label: 'Otras percep.', field: 'otrasPercep', sortable: true },

                    { name: 'rfc', align: 'left', label: 'RFC', field: 'rfc', sortable: true },
                    { name: 'nss', align: 'left', label: 'NSS', field: 'nss', sortable: true },
                    { name: 'curp', align: 'left', label: 'CURP', field: 'curp', sortable: true },

                    { name: 'sdi', align: 'right', label: 'S.D.I.', field: 'sdi', sortable: true },
                    { name: 'netoPagado', align: 'right', label: 'Neto pagado', field: 'netoPagado', sortable: true },
                    { name: 'totalISr', align: 'right', label: 'Total ISR', field: 'totalISr', sortable: true },
                    { name: 'otrasDeduc', align: 'right', label: 'Otras deduc.', field: 'otrasDeduc', sortable: true },
                    { name: 'totalDeducciones', align: 'right', label: 'Total deduc', field: 'totalDeducciones', sortable: true },

                    { name: 'fechaAlta', align: 'left', label: 'Fecha alta', field: 'fechaAlta', sortable: true },
                    { name: 'firma', align: 'left', label: 'Firma', field: 'firma', sortable: true },
                ],
                dataTrabajadores: [],
                fechaI: new Date(),
                fechaF: new Date(),
                filter: '',
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
            async GetTrabajadores() {
                this.$q.loading.show({
                    spinner: QSpinnerCube,
                    spinnerColor: 'red-8',
                    spinnerSize: 140,
                    // backgroundColor: 'purple',
                    message: 'Consultando...',
                    // messageColor: 'black'
                })
                let fI = moment(this.fechaI).format('YYYY-MM-DD')
                let fF = moment(this.fechaF).format('YYYY-MM-DD')
                try {
                    let response = await axios.get(this.rutaAxios + 'Nomina/GetListaRayaAsync/erp_' + this.token.rfc + '/' + fI + '/' + fF);
                    console.log(response.data)
                    this.dataTrabajadores = response.data;
                    this.$q.loading.hide()
                } catch (error) {
                    console.log(error)
                    this.$q.loading.hide()
                }
            },

            FormatCurrency(value) {
                return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
            },

            FormatDate(value) {
                let fecha_ = value.replace('T', ' ')
                let fecha_1 = fecha_.replace('Z', ' ')
                let listo = new Date(fecha_1);
                moment.locale('es-mx');
                return moment(listo).format('DD-MMMM-YYYY')
            },

            // ExportExcel() {
            //     let fi_ = new Date(this.fechaI);
            //     let ff_ = new Date(this.fechaF);

            //     let fI = format(fi_, 'dd-MMMM-yyyy', { locale: es })
            //     let fF = format(ff_, 'dd-MMMM-yyyy', { locale: es })

            //     const workbook = XLSX.utils.book_new();
            //     const sheetTrabajadores = XLSX.utils.json_to_sheet(this.dataTrabajadores);
            //     XLSX.utils.book_append_sheet(workbook, sheetTrabajadores, 'TRABAJADORES');
            //     XLSX.writeFile(workbook, 'LSITA DE RAYA DEL ' + fI + ' AL ' + fF + '.xlsx');
            // },

            ExportExcel() {
            let reporte = 'REPORTE LISTA DE RAYA'
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
                rfc + ' - ' + empresa +  ' - REPORTE LISTA DE RAYA DEL ' + periodo.toUpperCase() + '.xlsx'
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