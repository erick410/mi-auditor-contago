<template>
    <div class="q-pa-md">
        <!-- DIALOG PARA VER LOS PDF -->
        <q-dialog v-model="dialogPdf" persistent transition-show="scale" transition-hide="scale" maximized>
            <visor-pdf @CloseDialogPdf="CloseDialogPdf"></visor-pdf>
        </q-dialog>

        <!-- ACEPTAR O RECHAZAR LA SOLICITUD DE CANCELACION -->
        <q-dialog v-model="dialogAceptaRechaza" persistent transition-show="scale" transition-hide="scale">
            <q-card>
                <q-bar class="bg-primary text-white">
                    <q-space />
                    <q-btn dense flat icon="close" v-close-popup>
                    <q-tooltip>Cerrar</q-tooltip>
                    </q-btn>
                </q-bar>
                <q-card-section>
                    <div class="text-h6">{{textAceptaRecahza}}</div>
                    <div class="text-subtitle2">{{textAceptaRecahzaDet}}</div>
                </q-card-section>
            
                <q-card-actions align="around">
                    <q-btn flat v-close-popup @click="AceptaSolicitud()">Cancelar</q-btn>
                    <q-btn flat @click="RechazaSolicitud()">Aceptar</q-btn>
                </q-card-actions>
            </q-card>
        </q-dialog>

        <!-- TABLA DE COMPROBANTES -->
        <q-table title="Reporte ISR" :data="dataComprobantes" :columns="columns" row-key="folioFiscal"
            :rows-per-page-options="[10]" class="my-sticky-column-table">
            <template v-slot:top>
                <span class="text-body1" content-style="font-size: 20px">Solicitudes de Cancelación</span>
                <q-space />
                <q-btn push color="primary" @click="getSolicitudes()" icon="mdi-reload" rounded flat size="18px"
                    padding="xs">
                    <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                        :offset="[10, 10]">Actualizar</q-tooltip>
                </q-btn>
            </template>
            <template v-slot:body="props">
                <q-tr :props="props">
                    <q-td auto-width>
                        <q-btn size="md" color="green-10" rounded flat dense @click="AceptaRechaza(props.row, 'Aceptar')"
                            icon="mdi-check-bold">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Aceptar</q-tooltip>
                        </q-btn>
                        <q-btn size="md" color="red-10" rounded flat dense @click="AceptaRechaza(props.row, 'Rechazar')"
                            icon="mdi-cancel">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Rechazar</q-tooltip>
                        </q-btn>
                        <q-btn size="md" color="primary" rounded flat dense @click="VerComprobante(props.row)"
                            icon="mdi-file-pdf-box">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Ver comprobante</q-tooltip>
                        </q-btn>
                    </q-td>
                    <q-td key="folioFiscal" :props="props">{{ props.row.folioFiscal }}</q-td>
                    <q-td key="fechaSolicitud" :props="props">{{ FormatDate(props.row.fechaSolicitud) }}</q-td>
                    <!-- <q-td key="estatus" :props="props">{{ props.row.estatus }}</q-td> -->
                    <!-- <q-td key="fechaAceptaCancela" :props="props">{{ FormatDate(props.row.fechaAceptaCancela) }}</q-td> -->
                </q-tr>
            </template>
        </q-table>        
    </div>
</template>

<script>
    import axios from 'axios'
    import moment from 'moment'
    import visorPdf from '../Pdf/VisorPdf.vue'
    import { ComprobanteBase64 } from '../Pdf/ComprobanteBase64.js'
    import { QSpinnerCube } from 'quasar'

    export default {
        components: {
            visorPdf,
        },
        data() {
            return {
                tab: 'activas',

                columns: [
                    { name: 'actions', align: 'left', label: 'Acciones', field: 'actions' },
                    { name: 'folioFiscal', align: 'left', label: 'Folio Fiscal', field: 'folioFiscal', sortable: true },
                    { name: 'fechaSolicitud', align: 'left', label: 'Fecha Consulta', field: 'fechaSolicitud', sortable: true },
                    // { name: 'estatus', align: 'left', label: 'Estatus', field: 'estatus', sortable: true },
                    // { name: 'fechaAceptaCancela', align: 'left', label: 'Fecha Acepta / Rechaza', field: 'fechaAceptaCancela', sortable: true },
                ],
                dataComprobantes: [],

                //PDF
                dialogPdf: false,

                //ACEPTAR O RECHAZAR SOLICITUD
                dialogAceptaRechaza: false,
                textAceptaRecahza: "",
                textAceptaRecahzaDet: "",
                folioFiscalAceptaRechaza: "",
            }
        },
        computed: {
            token() {
                return this.$store.state.usuario;
            },

            rutaAxios() {
                return this.$store.state.rutaMongoStore
            }

        },
        created() {
            this.getSolicitudes();
        },

        methods: {
            async getSolicitudes() {
                try {
                    this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'red-8', spinnerSize: 140, message: 'Consultando...' })
                    const response = await axios.get(`${this.rutaAxios }Comprobante/GetSolicitudesCancelacionAsync/${this.token.rfc}`);
                    this.dataComprobantes = [];
                    this.dataComprobantes = [...response.data];
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
                return moment(listo).format('DD-MMMM-YYYY HH:mm:ss')
            },

            async VerComprobante(item) {
                try {
                    const folioFiscal = item.folioFiscal.toUpperCase();
                    this.$store.state.vistaPreviaStore.folioFiscal = folioFiscal;
                    this.$store.state.vistaPreviaStore.color = "19775C"
                    this.$store.state.vistaPreviaStore.tipoComprobanteInterno = "FACTURA"
                    this.$store.state.vistaPreviaStore.tipo = "R"
                    this.$store.state.vistaPreviaStore.rfc = this.token.rfc.toLowerCase();
                    this.dialogPdf = true;
                } catch (error) {
                    console.log(error)
                }
            },

            CloseDialogPdf() {
                this.dialogPdf = false;
            },

            AceptaRechaza(item, tipo){
                this.dialogAceptaRechaza = true;
                this.textAceptaRecahza = `Confirma que desea ${tipo.toUpperCase()} la solicitud de cancelación del comprobante con folio fiscal: ${item.folioFiscal.toUpperCase()}`
                this.textAceptaRecahzaDet = `Al aceptar la solicitud el comprobante será CANCELADO. Esta acción no se podrá deshacer.`
                if(tipo === "Rechazar"){
                    this.textAceptaRecahzaDet = `Al rechazar la solicitud, el comprobate seguirá VIGENTE y se tendrá que generar otra solicitud por parte del proveedor para poder aceptar o rechazar nuevamente la solicitud.`
                }
                this.folioFiscalAceptaRechaza = item.folioFiscal;
            },
        
            async AceptaSolicitud(){
                try{
                    this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'red-8', spinnerSize: 140, message: 'Actualizando...' })
                    const response = await axios.post(`${this.rutaAxios }Comprobante/PostRechazaAceptaSolicitudAsync/${this.token.rfc}/${this.folioFiscalAceptaRechaza}/Aceptar`);
                    await this.AplicaCancelacion(this.folioFiscalAceptaRechaza);
                    this.$q.loading.hide()
                    this.dialogAceptaRechaza = false;
                }catch(error){
                    console.log(error)
                    this.$q.loading.hide()
                }
            },

            async RechazaSolicitud(){
                try{
                    this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'red-8', spinnerSize: 140, message: 'Actualizando...' })
                    const response = await axios.post(`${this.rutaAxios }Comprobante/PostRechazaAceptaSolicitudAsync/${this.token.rfc}/${this.folioFiscalAceptaRechaza}/Rechazar`);
                    this.$q.loading.hide()
                    this.dialogAceptaRechaza = false;
                }catch(error){
                    console.log(error)
                    this.$q.loading.hide()
                }
            },

            async AplicaCancelacion(folioFiscalSelected){
                this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'red-8', spinnerSize: 140, message: 'Aplicando cancelacion...' })
                let collection = "comprobantes_recibidos";
                try{
                    let response = await axios.put(this. rutaAxios + "Comprobante/PutCanceladosAsync/erp_" + this.token.rfc + "/" + collection + "/" + folioFiscalSelected);
                    console.log(response.data);
                }catch(error){
                    console.log(error);
                }
                this.dialogEstatusSat = false;
                this.$q.loading.hide()
            },
        },
    }
</script>