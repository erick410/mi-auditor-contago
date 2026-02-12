<template>
    <div class="q-pa-md">
        <!-- DIALOG PARA VER LOS PDF -->
        <q-dialog v-model="dialogPdf" persistent transition-show="scale" transition-hide="scale" maximized>
            <visor-pdf @CloseDialogPdf="CloseDialogPdf"></visor-pdf>
        </q-dialog>

        <!-- ACTUALIZA Y VALIDA EL ESTATUS DE LOS COMPROBANTES -->
        <q-dialog v-model="dialogEstatusSat" persistent transition-show="scale" transition-hide="scale">
            <q-card class="my-card">
                <q-toolbar>                    
                  <q-toolbar-title>Resultado consulta SAT</q-toolbar-title>
                </q-toolbar>
                <q-separator color="primary" inset size="4px" />
                <q-card-section>
                    <div class="row q-col-gutter-sm">
                        <div>                            
                            {{validaEstatus.rfc}} | {{validaEstatus.nombre}}
                        </div>
                        <div>
                            {{validaEstatus.folioFiscal}}
                        </div>
                        <div class="col-12">
                            <q-input readonly dense outlined v-model="validaEstatus.efossat" label="EFO" :label-color="colorEfo">                                
                            </q-input>
                        </div>
                        <div class="col-12">
                            <q-input readonly dense outlined v-model="validaEstatus.estadoSAT" label="Estatus" :label-color="colorEstatus">                                
                            </q-input>
                        </div>
                        <div class="col-12">
                            <q-input readonly dense outlined v-model="validaEstatus.estatusCancelacionSAT" label="Estatus Cancelación" :label-color="colorEstatus">                                
                            </q-input>
                        </div>
                    </div>
                </q-card-section>
                <q-card-actions vertical>
                    <q-btn color="red" v-if="validaEstatus.estadoSAT!='Cancelado'" v-close-popup>Cerrar</q-btn>
                    <q-btn color="red" v-if="validaEstatus.estadoSAT=='Cancelado'" @click="AplicaCancelacion()">Aplicar cancelación en el sistema</q-btn>
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
                        <q-btn size="md" color="primary" rounded flat dense @click="VerComprobante(props.row)"
                            icon="mdi-file-pdf-box">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Ver comprobante</q-tooltip>
                        </q-btn>
                        <q-btn size="md" color="green-10" rounded flat dense @click="openDialogEstatus(props.row)"
                            icon="mdi-check-decagram-outline">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Validad estatus SAT</q-tooltip>
                        </q-btn>
                    </q-td>
                    <q-td key="serie" :props="props">{{ props.row.serie }}</q-td>
                    <q-td key="folio" :props="props">{{ props.row.folio }}</q-td>
                    <q-td key="fecha" :props="props">{{ FormatDate(props.row.fecha) }}</q-td>
                    <q-td key="rfc" :props="props">{{ props.row.rfc }}</q-td>
                    <q-td key="nombre" :props="props">{{ props.row.nombre }}</q-td>
                    <q-td key="total" :props="props">{{ FormatCurrency(props.row.total) }}</q-td>
                    <q-td key="folioFiscal" :props="props">{{ props.row.folioFiscal }}</q-td>
                    <q-td key="estatus" :props="props">{{ props.row.estatus }}</q-td>
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
                    { name: 'serie', align: 'left', label: 'Serie', field: 'serie', sortable: true },
                    { name: 'folio', align: 'left', label: 'Folio', field: 'folio', sortable: true },
                    { name: 'fecha', align: 'left', label: 'Fecha', field: 'fecha', sortable: true },
                    { name: 'rfc', align: 'left', label: 'RFC', field: 'rfc', sortable: true },
                    { name: 'nombre', align: 'left', label: 'Nombre', field: 'nombre', sortable: true },
                    { name: 'total', align: 'right', label: 'Total', field: 'total', sortable: true },
                    { name: 'folioFiscal', align: 'left', label: 'Folio Fiscal', field: 'folioFiscal', sortable: true },
                    { name: 'estatus', align: 'left', label: 'Estatus', field: 'estatus', sortable: true },
                ],
                dataComprobantes: [],

                //PDF
                dialogPdf: false,

                dialogEstatusSat: false,
                folioFiscalSelected: null,
                validaEstatus: {},
                colorEfo: "green",
                colorEstatus: "green",

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
                    const response = await axios.get(`${this.rutaAxios }Comprobante/GetEstatusComprobanteAsync/${this.token.rfc}`);
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

            async openDialogEstatus(item){
                this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'red-8', spinnerSize: 140, message: 'Validando estatus en plataforma del SAT...' })
                try{
                    let response = await axios.get(this. rutaAxios + "Comprobante/GetEstatusSatAsync/" + item.rfcEmisor + "/" + item.rfcReceptor + "/" + item.total  + "/" + item.folioFiscal);
                    console.log(response.data);
                    this.validaEstatus = response.data;
                    if(response.data.efossat === "EL RFC NO ESTA LISTA DENTRO DE LA LISTA DE 69B"){
                        this.colorEfo = "green";
                    }else{
                        this.colorEfo = "red";
                    }
                    if(response.data.estadoSAT === "Cancelado"){
                        this.colorEstatus = "red";
                    }else{
                        this.colorEstatus = "green";
                    }
                    console.log(item)
                    this.validaEstatus.rfc = item.rfc;
                    this.validaEstatus.nombre = item.nombre;
                    this.validaEstatus.folioFiscal = item.folioFiscal;
                    // this.validaEstatus.tipoComprobante = item.tipoComprobante;
                    this.folioFiscalSelected = item.folioFiscal;
                    this.dialogEstatusSat = true;
                }catch(error){
                    console.log(error)
                }
                this.$q.loading.hide()
            },

            async AplicaCancelacion(){
                this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'red-8', spinnerSize: 140, message: 'Aplicando cancelacion...' })
                let collection = "comprobantes_recibidos";
                try{
                    let response = await axios.put(this. rutaAxios + "Comprobante/PutCanceladosAsync/erp_" + this.token.rfc + "/" + collection + "/" + this.folioFiscalSelected);
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