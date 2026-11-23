<template>
    <div class="q-pa-md">
        <!-- DIALOG NUEVO / EDITAR -->
        <q-dialog v-model="dialogForm" persistent transition-show="scale" transition-hide="scale">
            <q-card style="width: 650px; max-width: 95vw;">
                <q-card-section>
                    <div class="row no-wrap items-center q-pa-sm">
                        <q-btn push color="red-14" icon="mdi-close" rounded flat size="18px" padding="xs" v-close-popup>
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                                :offset="[10, 10]">Cerrar</q-tooltip>
                        </q-btn>
                        <q-space />
                        <div class="text-h5">{{ pedimento.id ? 'Editar pedimento' : 'Nuevo pedimento' }}</div>
                        <q-space />
                        <q-btn push color="green-10" @click="Guardar" icon="mdi-content-save" rounded flat size="18px"
                            padding="xs">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                                :offset="[10, 10]">Guardar</q-tooltip>
                        </q-btn>
                    </div>
                </q-card-section>

                <q-card-section class="q-pt-none">
                    <div class="row q-col-gutter-sm">
                        <!-- 1. ARCHIVO PDF: al seleccionarlo se lee y se llena el formulario -->
                        <div class="col-12">
                            <q-file v-model="archivo" outlined dense accept=".pdf" max-file-size="10485760"
                                :label="pedimento.id ? 'Reemplazar PDF (opcional)' : 'Selecciona el PDF del pedimento'"
                                :loading="leyendo" @input="LeerPdf" @rejected="ArchivoRechazado">
                                <template v-slot:prepend>
                                    <q-icon name="mdi-file-pdf-box" color="red-8" />
                                </template>
                            </q-file>
                            <div v-if="pedimento.id && pedimento.pdf" class="text-caption text-grey-7 q-mt-xs">
                                PDF actual: {{ pedimento.pdf.nombre }}
                            </div>
                        </div>

                        <!-- ADVERTENCIAS DE LA LECTURA -->
                        <div class="col-12" v-if="leido && leido.advertencias.length">
                            <q-banner dense rounded class="bg-orange-1 text-orange-10">
                                <template v-slot:avatar>
                                    <q-icon name="mdi-alert-outline" color="orange-9" />
                                </template>
                                <div v-for="(a, i) in leido.advertencias" :key="i">{{ a }}</div>
                            </q-banner>
                        </div>

                        <!-- DATOS LEIDOS DEL PEDIMENTO (solo lectura, de referencia) -->
                        <div class="col-12" v-if="leido">
                            <div class="row justify-center">
                                <q-chip v-if="leido.valorAduana" color="grey-3" text-color="black" dense>
                                    {{ 'Valor aduana: ' + FormatCurrency(leido.valorAduana) }}
                                </q-chip>
                                <q-chip v-if="leido.tipoCambio" color="grey-3" text-color="black" dense>
                                    {{ 'T.C.: ' + leido.tipoCambio }}
                                </q-chip>
                                <q-chip v-for="c in leido.contribuciones" :key="c.concepto + c.formaPago"
                                    color="grey-3" text-color="black" dense>
                                    {{ c.concepto + ' (FP ' + c.formaPago + '): ' + FormatCurrency(c.importe) }}
                                </q-chip>
                            </div>
                        </div>

                        <!-- 2. FORMULARIO EDITABLE -->
                        <!-- NUM PEDIMENTO -->
                        <div class="col-12 col-md-6">
                            <q-input v-model="pedimento.numPedimento" label="Número de pedimento" outlined dense
                                mask="## ## #### #######" hint="Ej. 26 51 1681 6005782" />
                        </div>
                        <!-- FECHA DE PAGO -->
                        <div class="col-12 col-md-6">
                            <q-input v-model="fechaPagoMasked" label="Fecha de pago" outlined dense readonly>
                                <template v-slot:append>
                                    <q-icon name="event" class="cursor-pointer" />
                                </template>
                                <q-popup-proxy ref="qDateProxyPago" transition-show="scale" transition-hide="scale">
                                    <q-date v-model="pedimento.fechaPago" mask="YYYY-MM-DD">
                                        <div class="row items-center justify-end">
                                            <q-btn v-close-popup label="Ok" color="primary" flat />
                                        </div>
                                    </q-date>
                                </q-popup-proxy>
                            </q-input>
                        </div>
                        <!-- BASE IVA -->
                        <div class="col-12 col-md-4">
                            <q-input v-model.number="pedimento.baseIva" type="number" step="0.01" label="Base del IVA"
                                outlined dense prefix="$" hint="Valor aduana + IGI + DTA" />
                        </div>
                        <!-- IMPORTE IVA -->
                        <div class="col-12 col-md-4">
                            <q-input v-model.number="pedimento.importeIva" type="number" step="0.01" label="IVA"
                                outlined dense prefix="$" />
                        </div>
                        <!-- IVA PRV -->
                        <div class="col-12 col-md-4">
                            <q-input v-model.number="pedimento.ivaPrv" type="number" step="0.01" label="IVA/PRV"
                                outlined dense prefix="$" />
                        </div>
                        <!-- VALIDACION BASE x 16% -->
                        <!--<div class="col-12">
                            <div class="row no-wrap justify-center">
                                <q-chip color="primary" text-color="white">
                                    {{ 'IVA calculado (16%): ' + FormatCurrency(ivaCalculado) }}
                                </q-chip>
                                <q-chip :color="diferenciaOk ? 'green-8' : 'orange-9'" text-color="white">
                                    {{ 'Diferencia: ' + FormatCurrency(diferenciaIva) }}
                                </q-chip>
                            </div>
                        </div> -->
                    </div>
                </q-card-section>
            </q-card>
        </q-dialog>

        <!-- DIALOG CONFIRMAR ELIMINAR -->
        <q-dialog v-model="dialogEliminar" persistent>
            <q-card>
                <q-card-section class="row items-center">
                    <q-avatar icon="mdi-delete-alert" color="red-14" text-color="white" />
                    <span class="q-ml-sm">
                        ¿Eliminar el pedimento <b>{{ itemEliminar ? itemEliminar.numPedimento : '' }}</b> y su PDF?
                    </span>
                </q-card-section>
                <q-card-actions align="right">
                    <q-btn flat label="Cancelar" color="primary" v-close-popup />
                    <q-btn flat label="Eliminar" color="red-14" @click="Eliminar" />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <!-- DIALOG PARA VER LOS PDF -->
        <q-dialog v-model="dialogComprobante" persistent transition-show="scale" transition-hide="scale" maximized>
            <visor-pdf @CloseDialogPdf="CloseDialogPdf"></visor-pdf>
        </q-dialog>

        <!-- SELECCIONA FECHAS, BOTON DE BUSCAR, NUEVO Y EXPORTAR A EXCEL -->
        <div class="row no-wrap items-center q-mt-md q-pa-sm">
            <q-space />
            <!-- FECHA INICIAL -->
            <q-input v-model="fehaIMasked" label="Fecha Inicial" class="q-mr-sm" outlined dense>
                <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                    <q-date v-model="fechaI" @input="UltimoDiaMes">
                        <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Ok" color="primary" flat />
                        </div>
                    </q-date>
                </q-popup-proxy>
            </q-input>
            <!-- FECHA FINAL -->
            <q-input v-model="fechaFMasked" label="Fecha Final" class="q-mr-xs" outlined dense>
                <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                    <q-date v-model="fechaF">
                        <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Ok" color="primary" flat />
                        </div>
                    </q-date>
                </q-popup-proxy>
            </q-input>
            <!-- BOTON CONSULTAR -->
            <q-btn push color="amber-9" @click="GetPedimentos" icon="mdi-text-box-search-outline" rounded flat size="18px"
                padding="xs">
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                    :offset="[10, 10]">Consultar</q-tooltip>
            </q-btn>
            <!-- BOTON NUEVO -->
            <q-btn push color="primary" @click="OpenNuevo" icon="mdi-plus-circle-outline" rounded flat size="18px"
                padding="xs">
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                    :offset="[10, 10]">Nuevo pedimento</q-tooltip>
            </q-btn>
            <!-- BOTON DE EXPORTAR EXCEL -->
            <q-btn push color="green-10" @click="ExportExcel" icon="mdi-file-excel-box-outline" rounded flat size="18px"
                padding="xs">
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                    :offset="[10, 10]">Exportar Excel</q-tooltip>
            </q-btn>
            <q-space />
        </div>

        <!-- TABLA DE PEDIMENTOS -->
        <q-table title="Pedimentos" :data="itemsPedimentos" :columns="columns" row-key="id"
            :rows-per-page-options="[0]" class="my-sticky-column-table" :filter="filter">
            <template v-slot:top>
                <span class="text-body1">Pedimentos de importación · IVA {{ FormatCurrency(totales.importeIva + totales.ivaPrv) }}</span>
                <q-space />
                <q-input borderless dense debounce="300" v-model="filter" placeholder="Filtrar">
                    <template v-slot:append>
                        <q-icon name="search" />
                    </template>
                </q-input>
            </template>
            <template v-slot:body="props">
                <q-tr :props="props">
                    <q-td auto-width>
                        <q-btn size="md" color="primary" rounded flat dense @click="OpenEditar(props.row)"
                            icon="mdi-pencil">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Editar</q-tooltip>
                        </q-btn>
                        <q-btn size="md" color="red-8" rounded flat dense @click="VerPdf(props.row)"
                            icon="mdi-file-pdf-box">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">PDF</q-tooltip>
                        </q-btn>
                        <q-btn size="md" color="red-14" rounded flat dense @click="OpenEliminar(props.row)"
                            icon="mdi-delete">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Eliminar</q-tooltip>
                        </q-btn>
                    </q-td>
                    <q-td key="numPedimento" :props="props">{{ props.row.numPedimento }}</q-td>
                    <q-td key="fechaPago" :props="props">{{ FormatFechaPago(props.row.fechaPago) }}</q-td>
                    <q-td key="baseIva" :props="props">{{ FormatCurrency(props.row.baseIva) }}</q-td>
                    <q-td key="importeIva" :props="props">{{ FormatCurrency(props.row.importeIva) }}</q-td>
                    <q-td key="ivaPrv" :props="props">{{ FormatCurrency(props.row.ivaPrv) }}</q-td>
                    <q-td key="totalIva" :props="props">{{ FormatCurrency(props.row.importeIva + props.row.ivaPrv) }}</q-td>
                    <q-td key="fechaRegistro" :props="props">{{ FormatFechaRegistro(props.row.fechaRegistro) }}</q-td>
                    <q-td key="archivo" :props="props">{{ props.row.pdf ? props.row.pdf.nombre : '' }}</q-td>
                </q-tr>
            </template>
            <template v-slot:bottom-row>
                <q-tr>
                    <q-td colspan="100%" class="text-center">
                        <q-chip color="primary" text-color="white">
                            {{ 'Base IVA: ' + FormatCurrency(totales.baseIva) }}
                        </q-chip>
                        <q-chip color="primary" text-color="white">
                            {{ 'IVA: ' + FormatCurrency(totales.importeIva) }}
                        </q-chip>
                        <q-chip color="primary" text-color="white">
                            {{ 'IVA/PRV: ' + FormatCurrency(totales.ivaPrv) }}
                        </q-chip>
                        <q-chip color="primary" text-color="white">
                            {{ 'Total IVA: ' + FormatCurrency(totales.importeIva + totales.ivaPrv) }}
                        </q-chip>
                    </q-td>
                </q-tr>
            </template>
        </q-table>
    </div>
</template>
<script>
import { QSpinnerCube } from 'quasar'
import axios from 'axios'
import moment from 'moment'
import * as xlsx from 'xlsx';
import { format, lastDayOfMonth, startOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import visorPdf from '../Pdf/VisorPdf.vue'
import { leerPedimentoPdf } from './leerPedimentoPdf'

const pedimentoVacio = () => ({
    id: null,
    numPedimento: '',
    fechaPago: null,
    baseIva: 0,
    importeIva: 0,
    ivaPrv: 0,
    pdf: null,
})

export default {
    components: {
        visorPdf
    },
    data() {
        return {
            columns: [
                { name: 'actions', align: 'left', label: 'Acciones', field: 'actions' },
                { name: 'numPedimento', align: 'left', label: 'Pedimento', field: 'numPedimento', sortable: true },
                { name: 'fechaPago', align: 'left', label: 'Fecha de pago', field: 'fechaPago', sortable: true },
                { name: 'baseIva', align: 'right', label: 'Base IVA', field: 'baseIva', sortable: true },
                { name: 'importeIva', align: 'right', label: 'IVA', field: 'importeIva', sortable: true },
                { name: 'ivaPrv', align: 'right', label: 'IVA/PRV', field: 'ivaPrv', sortable: true },
                { name: 'totalIva', align: 'right', label: 'Total IVA', field: row => row.importeIva + row.ivaPrv, sortable: true },
                { name: 'fechaRegistro', align: 'left', label: 'Fecha de registro', field: 'fechaRegistro', sortable: true },
                { name: 'archivo', align: 'left', label: 'Archivo', field: row => row.pdf ? row.pdf.nombre : '' },
            ],

            itemsPedimentos: [],
            totales: { baseIva: 0, importeIva: 0, ivaPrv: 0 },

            //FECHAS (por fecha de registro)
            fechaI: format(startOfMonth(new Date()), 'yyyy/MM/dd'),
            fechaF: format(lastDayOfMonth(new Date()), 'yyyy/MM/dd'),

            filter: '',

            //FORMULARIO
            dialogForm: false,
            pedimento: pedimentoVacio(),
            archivo: null,
            leido: null,
            leyendo: false,

            //ELIMINAR
            dialogEliminar: false,
            itemEliminar: null,

            //PDF
            dialogComprobante: false,
        }
    },
    computed: {
        token() {
            return this.$store.state.usuario;
        },

        rutaAxios() {
            return this.$store.state.rutaMongoStore
        },

        // El back arma erp_{rfc} a partir de este valor
        urlBase() {
            return this.rutaAxios + 'Pedimentos/' + this.token.rfc
        },

        fehaIMasked() {
            moment.locale('es-mx');
            return this.fechaI ? moment(this.fechaI, 'YYYY/MM/DD').format('DD/MMMM/yyyy') : ''
        },

        fechaFMasked() {
            moment.locale('es-mx');
            return this.fechaF ? moment(this.fechaF, 'YYYY/MM/DD').format('DD/MMMM/yyyy') : ''
        },

        fechaPagoMasked() {
            moment.locale('es-mx');
            return this.pedimento.fechaPago ? moment(this.pedimento.fechaPago, 'YYYY-MM-DD').format('DD/MMMM/yyyy') : ''
        },

        ivaCalculado() {
            return this.Redondear((Number(this.pedimento.baseIva) || 0) * 0.16);
        },

        diferenciaIva() {
            return this.Redondear((Number(this.pedimento.importeIva) || 0) - this.ivaCalculado);
        },

        // Tolerancia por redondeo por partida
        diferenciaOk() {
            return Math.abs(this.diferenciaIva) <= 5;
        },
    },
    created() {
        this.GetPedimentos();
    },
    methods: {
        async GetPedimentos() {
            this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'red-8', spinnerSize: 140, message: 'Consultando pedimentos...' })
            try {
                let fI = moment(this.fechaI, 'YYYY/MM/DD').format('YYYY-MM-DD')
                let fF = moment(this.fechaF, 'YYYY/MM/DD').format('YYYY-MM-DD')
                let response = await axios.get(this.urlBase, { params: { desde: fI, hasta: fF } });
                this.itemsPedimentos = response.data.registros;
                this.totales = response.data.totales;
            } catch (error) {
                console.log(error);
                this.Notificar('Error al consultar los pedimentos', 'negative');
            }
            this.$q.loading.hide()
        },

        OpenNuevo() {
            this.pedimento = pedimentoVacio();
            this.archivo = null;
            this.leido = null;
            this.dialogForm = true;
        },

        OpenEditar(item) {
            this.pedimento = {
                ...item,
                fechaPago: item.fechaPago ? moment.utc(item.fechaPago).format('YYYY-MM-DD') : null,
            };
            this.archivo = null;
            this.leido = null;
            this.dialogForm = true;
        },

        // Lee el PDF en el navegador (pdf.js) y llena el formulario; el usuario puede corregir antes de guardar
        async LeerPdf(file) {
            this.leido = null;
            if (!file) return;

            this.leyendo = true;
            try {
                const x = await leerPedimentoPdf(file);

                // Validaciones contra la empresa y los registros cargados
                const rfcEmpresa = (this.token.rfc || '').toUpperCase();
                if (x.rfc && x.rfc.toUpperCase() !== rfcEmpresa) {
                    x.advertencias.push('El RFC del importador (' + x.rfc + ') no corresponde a la empresa (' + rfcEmpresa + ').');
                }
                const repetido = this.itemsPedimentos.find(p => p.numPedimento === x.numPedimento && p.id !== this.pedimento.id);
                if (x.numPedimento && repetido) {
                    x.advertencias.unshift('El pedimento ' + x.numPedimento + ' ya está registrado.');
                }

                this.leido = x;

                if (x.numPedimento) this.pedimento.numPedimento = x.numPedimento;
                if (x.fechaPago) this.pedimento.fechaPago = x.fechaPago;
                if (x.baseIva) this.pedimento.baseIva = x.baseIva;
                if (x.importeIva) this.pedimento.importeIva = x.importeIva;
                this.pedimento.ivaPrv = x.ivaPrv || 0;

                if (x.advertencias.length === 0) {
                    this.Notificar('Datos leídos del pedimento, revísalos antes de guardar', 'positive');
                }
            } catch (error) {
                console.log(error);
                this.Notificar('No se pudo leer el PDF, captura los datos manualmente', 'warning');
            }
            this.leyendo = false;
        },

        async Guardar() {
            //VALIDACIONES
            const num = (this.pedimento.numPedimento || '').replace(/\D/g, '');
            if (num.length !== 15) {
                this.Notificar('El número de pedimento debe tener 15 dígitos', 'warning');
                return;
            }
            if (!this.pedimento.id && !this.archivo) {
                this.Notificar('Selecciona el PDF del pedimento', 'warning');
                return;
            }
            if (!this.pedimento.importeIva || !this.pedimento.baseIva) {
                this.Notificar('Captura la base y el importe del IVA', 'warning');
                return;
            }

            const form = new FormData();
            form.append('numPedimento', this.pedimento.numPedimento);
            if (this.pedimento.fechaPago) form.append('fechaPago', this.pedimento.fechaPago);
            form.append('baseIva', this.pedimento.baseIva);
            form.append('importeIva', this.pedimento.importeIva);
            form.append('ivaPrv', this.pedimento.ivaPrv || 0);
            if (this.archivo) form.append('archivo', this.archivo);

            this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'red-8', spinnerSize: 140, message: 'Guardando...' })
            try {
                if (this.pedimento.id) {
                    await axios.put(this.urlBase + '/' + this.pedimento.id, form);
                    this.Notificar('Pedimento actualizado', 'positive');
                } else {
                    await axios.post(this.urlBase, form);
                    this.Notificar('Pedimento guardado', 'positive');
                }
                this.dialogForm = false;
                this.$q.loading.hide()
                await this.GetPedimentos();
            } catch (error) {
                console.log(error);
                this.$q.loading.hide()
                this.Notificar(this.MensajeError(error, 'Error al guardar el pedimento'), 'negative');
            }
        },

        OpenEliminar(item) {
            this.itemEliminar = item;
            this.dialogEliminar = true;
        },

        async Eliminar() {
            try {
                await axios.delete(this.urlBase + '/' + this.itemEliminar.id);
                this.dialogEliminar = false;
                this.Notificar('Pedimento eliminado', 'positive');
                await this.GetPedimentos();
            } catch (error) {
                console.log(error);
                this.Notificar('Error al eliminar el pedimento', 'negative');
            }
        },

        async VerPdf(item) {
            this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'red-8', spinnerSize: 140, message: 'Cargando PDF...' })
            try {
                let response = await axios.get(this.urlBase + '/' + item.id + '/pdf', { responseType: 'arraybuffer' });
                this.$store.state.comprobanteStore.nombre = item.pdf ? item.pdf.nombre.replace(/\.pdf$/i, '') : item.numPedimento;
                this.$store.state.comprobanteStore.base64 = this.ArrayBufferToBase64(response.data);
                this.$store.state.comprobanteStore.fecha = item.fechaPago;
                this.dialogComprobante = true;
            } catch (error) {
                console.log(error);
                this.Notificar('No se encontró el PDF', 'negative');
            }
            this.$q.loading.hide()
        },

        CloseDialogPdf() {
            this.dialogComprobante = false;
        },

        ExportExcel() {
            let reporte = 'REPORTE DE PEDIMENTOS'
            let empresa = this.$store.state.empresaStore.nombre
            let rfc = this.$store.state.empresaStore.rfc

            let fI = format(new Date(this.fechaI), 'dd-MMMM-yyyy', { locale: es })
            let fF = format(new Date(this.fechaF), 'dd-MMMM-yyyy', { locale: es })
            let periodo = fI + ' AL ' + fF

            const workbook = xlsx.utils.book_new();

            const cabecera = [
                [reporte],
                ["EMPRESA:", empresa.toUpperCase()],
                ["RFC:", rfc.toUpperCase()],
                ["PERIODO:", periodo.toUpperCase()],
                [],
            ];

            const columnasExcel = this.columns.filter(col => col.name !== 'actions');

            const dataExcel = this.itemsPedimentos.map(row => ({
                'Pedimento': row.numPedimento,
                'Fecha de pago': this.FormatFechaPago(row.fechaPago),
                'Base IVA': row.baseIva,
                'IVA': row.importeIva,
                'IVA/PRV': row.ivaPrv,
                'Total IVA': this.Redondear(row.importeIva + row.ivaPrv),
                'Fecha de registro': this.FormatFechaRegistro(row.fechaRegistro),
                'Archivo': row.pdf ? row.pdf.nombre : '',
            }));

            dataExcel.push({
                'Pedimento': 'TOTAL',
                'Fecha de pago': '',
                'Base IVA': this.totales.baseIva,
                'IVA': this.totales.importeIva,
                'IVA/PRV': this.totales.ivaPrv,
                'Total IVA': this.Redondear(this.totales.importeIva + this.totales.ivaPrv),
                'Fecha de registro': '',
                'Archivo': '',
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

            xlsx.utils.book_append_sheet(workbook, sheet, "PEDIMENTOS");

            xlsx.writeFile(
                workbook,
                rfc + ' - ' + empresa + ' - REPORTE DE PEDIMENTOS DEL ' + periodo.toUpperCase() + '.xlsx'
            );
        },

        UltimoDiaMes() {
            const fecha = new Date(this.fechaI);
            this.fechaF = format(lastDayOfMonth(fecha), 'yyyy/MM/dd');
        },

        // --- utilidades ---

        FormatCurrency(value) {
            return (Number(value) || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        },

        // fechaPago se guarda como fecha sin hora (medianoche UTC): se lee en UTC para no recorrer el día
        FormatFechaPago(value) {
            return value ? moment.utc(value).format('DD/MM/YYYY') : '';
        },

        FormatFechaRegistro(value) {
            return value ? moment(value).format('DD/MM/YYYY HH:mm') : '';
        },

        Redondear(value) {
            return Math.round((Number(value) || 0) * 100) / 100;
        },

        ArrayBufferToBase64(buffer) {
            let binary = '';
            const bytes = new Uint8Array(buffer);
            const chunk = 0x8000;
            for (let i = 0; i < bytes.length; i += chunk) {
                binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
            }
            return window.btoa(binary);
        },

        MensajeError(error, porDefecto) {
            if (error.response && error.response.data && error.response.data.mensaje) {
                return error.response.data.mensaje;
            }
            return porDefecto;
        },

        ArchivoRechazado() {
            this.Notificar('Solo se permiten archivos PDF de hasta 10 MB', 'warning');
        },

        Notificar(mensaje, tipo) {
            this.$q.notify({ type: tipo, message: mensaje, position: 'top-right', timeout: 3000 });
        },
    },
}
</script>