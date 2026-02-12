<template>
    <div class="q-pa-md">
        <!-- DIALOG PARA VER LOS PDF -->
        <q-dialog v-model="dialogPdf" transition-show="scale" transition-hide="scale" maximized>
            <visor-pdf-gen @CloseDialogPdfG="CloseDialogPdfG"></visor-pdf-gen>
        </q-dialog>

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
                            <q-input readonly dense outlined v-model="validaEstatus.efossat" label="EFO"
                                :label-color="colorEfo">
                            </q-input>
                        </div>
                        <div class="col-12">
                            <q-input readonly dense outlined v-model="validaEstatus.estadoSAT" label="Estatus"
                                :label-color="colorEstatus">
                            </q-input>
                        </div>
                        <div class="col-12">
                            <q-input readonly dense outlined v-model="validaEstatus.estatusCancelacionSAT"
                                label="Estatus Cancelación" :label-color="colorEstatus">
                            </q-input>
                        </div>
                    </div>
                </q-card-section>
                <q-card-actions vertical>
                    <q-btn color="red" v-if="validaEstatus.estadoSAT!='Cancelado'" v-close-popup>Cerrar</q-btn>
                    <q-btn color="red" v-if="validaEstatus.estadoSAT=='Cancelado'" @click="AplicaCancelacion()">Aplicar
                        cancelación en el sistema</q-btn>
                </q-card-actions>
            </q-card>
        </q-dialog>

        <q-card class="my-card">
            <q-toolbar>
                <q-btn push color="red-10" @click="CloseDialog" icon="mdi-close" rounded flat size="18px" padding="xs">
                    <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                        :offset="[10, 10]">Cerrar</q-tooltip>
                </q-btn>
                <q-toolbar-title>Buscar comprobante</q-toolbar-title>
            </q-toolbar>
            <q-separator color="primary" inset size="4px" />
            <q-card-section>
                <div class="row q-col-gutter-sm">
                    <div class="col-12">
                        <q-select dense outlined v-model="selectTipo" :options="optionsTipo" label="Tipo" />
                    </div>
                    <div class="col-12 col-md-3">
                        <q-input dense outlined v-model="folio" label="Folio" @keydown.enter="GetFolio()">
                            <template v-slot:append>
                                <q-icon name="mdi-magnify" @click="GetFolio()" />
                            </template>
                        </q-input>
                    </div>
                    <div class="col-12 col-md-3">
                        <q-input dense outlined v-model="folioFiscal" label="Folio fiscal"
                            @keydown.enter="GetFolioFiscal()">
                            <template v-slot:append>
                                <q-icon name="mdi-magnify" @click="GetFolioFiscal()" />
                            </template>
                        </q-input>
                    </div>
                    <div class="col-12 col-md-3">
                        <q-input dense outlined v-model="rfc" label="RFC" @keydown.enter="GetRfc()">
                            <template v-slot:append>
                                <q-icon name="mdi-magnify" @click="GetRfc()" />
                            </template>
                        </q-input>
                    </div>
                    <div class="col-12 col-md-3">
                        <q-input dense outlined v-model="nombre" label="Nombre" @keydown.enter="GetNombre()">
                            <template v-slot:append>
                                <q-icon name="mdi-magnify" @click="GetNombre()" />
                            </template>
                        </q-input>
                    </div>
                </div>
                <q-table :data="dataComprobantes" :columns="columns" row-key="folioFiscal" :rows-per-page-options="[10]"
                    class="my-sticky-column-table shadow-0" :filter="filter">
                    <template v-slot:top-right>
                        <q-input borderless dense debounce="300" v-model="filter" placeholder="Filtrar">
                            <template v-slot:append>
                                <q-icon name="search" />
                            </template>
                        </q-input>
                    </template>
                    <template v-slot:body="props">
                        <q-tr :props="props">
                            <q-td auto-width>
                                <q-btn size="md" color="red" rounded flat dense @click="VerPdf(props.row)"
                                    icon="mdi-file-pdf-box">
                                    <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                        content-style="font-size: 14px" :offset="[10, 10]">Ver PDF</q-tooltip>
                                </q-btn>
                                <q-btn size="md" color="green" rounded flat dense @click="ValidaEstatusSat(props.row)"
                                    icon="mdi-check-decagram-outline">
                                    <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                        content-style="font-size: 14px" :offset="[10, 10]">Validar estatus
                                        SAT</q-tooltip>
                                </q-btn>
                            </q-td>
                            <q-td key="serie" :props="props">{{ props.row.serie }}</q-td>
                            <q-td key="folio" :props="props">{{ props.row.folio }}</q-td>
                            <q-td key="fecha" :props="props">{{ props.row.fecha }}</q-td>
                            <q-td key="rfc" :props="props">{{ props.row.rfc }}</q-td>
                            <q-td key="nombre" :props="props">{{ props.row.nombre }}</q-td>
                            <q-td key="subTotal" :props="props">{{ FormatCurrency(props.row.subTotal) }}</q-td>
                            <q-td key="descuento" :props="props">{{ FormatCurrency(props.row.descuento) }}</q-td>
                            <q-td key="total" :props="props">{{ FormatCurrency(props.row.total) }}</q-td>
                            <q-td key="moneda" :props="props">{{ props.row.moneda }}</q-td>
                            <q-td key="tipoComprobante" :props="props">{{ props.row.tipoComprobante }}</q-td>
                            <q-td key="folioFiscal" :props="props">{{ props.row.folioFiscal }}</q-td>
                        </q-tr>
                    </template>
                </q-table>
            </q-card-section>
        </q-card>
    </div>
</template>
<script>
    import axios from "axios";
    import { QSpinnerCube } from 'quasar'
    import visorPdfGen from '../Pdf/VisorPdfGen.vue'

    export default {
        components: {
            visorPdfGen
        },
        data() {
            return {
                folio: "",
                folioFiscal: "",
                rfc: "",
                nombre: "",

                dataComprobantes: [],
                columns: [
                    { name: 'actions', align: 'center', label: 'Actions', field: 'actions', sortable: false },
                    { name: 'serie', align: 'center', label: 'Serie', field: 'serie', sortable: true },
                    { name: 'folio', align: 'center', label: 'Folio', field: 'folio', sortable: true },
                    { name: 'fecha', align: 'center', label: 'Fecha', field: 'fecha', sortable: true },
                    { name: 'rfc', align: 'left', label: 'RFC', field: 'rfc', sortable: true },
                    { name: 'nombre', align: 'left', label: 'Nombre', field: 'nombre', sortable: true },
                    { name: 'subTotal', align: 'right', label: 'Subtotal', field: 'subTotal', sortable: true },
                    { name: 'descuento', align: 'right', label: 'Descuento', field: 'descuento', sortable: true },
                    { name: 'total', align: 'right', label: 'Total', field: 'total', sortable: true },
                    { name: 'moneda', align: 'left', label: 'Moneda', field: 'moneda', sortable: true },
                    { name: 'tipoComprobante', align: 'center', label: 'Tipo de comprobante', field: 'tipoComprobante', sortable: true },
                    { name: 'folioFiscal', align: 'center', label: 'Folio fiscal', field: 'folioFiscal', sortable: true },
                ],

                selectTipo: "Emitido",
                optionsTipo: ["Emitido", "Recibido"],

                filter: "",

                dialogPdf: false,
                dialogEstatusSat: false,
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
            },

        },
        created() {

        },
        methods: {
            CloseDialog() {
                this.$emit('CloseDialogComprobante')
            },

            FormatCurrency(value) {
                return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
            },

            async GetFolio() {
                this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'red-8', spinnerSize: 140, message: 'Consultando...' })
                this.dataComprobantes = [];
                if (this.folio.trim() === "") {
                    this.$q.notify({ type: 'warning', message: 'Indique un valor en folio para realizar la busqueda' })
                    return;
                }
                if (this.selectTipo === "Emitido") {
                    try {
                        let response = await axios.get(this.rutaAxios + "Comprobante/GetComprobantesGEmitidosAsync/erp_" + this.token.rfc + "/folio/" + this.folio);
                        this.dataComprobantes = response.data;
                    } catch (error) {
                        console.log(error);
                    }
                } else if (this.selectTipo === "Recibido") {
                    try {
                        let response = await axios.get(this.rutaAxios + "Comprobante/GetComprobantesGRecibidosAsync/erp_" + this.token.rfc + "/folio/" + this.folio);
                        this.dataComprobantes = response.data;
                    } catch (error) {
                        console.log(error);
                    }
                }
                this.$q.loading.hide()
            },

            async GetFolioFiscal() {
                this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'red-8', spinnerSize: 140, message: 'Consultando...' })
                this.dataComprobantes = [];
                if (this.folioFiscal.trim() === "") {
                    this.$q.notify({ type: 'warning', message: 'Indique un valor en folio fiscal para realizar la busqueda' })
                    return;
                }
                if (this.selectTipo === "Emitido") {
                    try {
                        let response = await axios.get(this.rutaAxios + "Comprobante/GetComprobantesGEmitidosAsync/erp_" + this.token.rfc + "/folioFiscal/" + this.folioFiscal);
                        this.dataComprobantes = response.data;
                    } catch (error) {
                        console.log(error);
                    }
                } else if (this.selectTipo === "Recibido") {
                    try {
                        let response = await axios.get(this.rutaAxios + "Comprobante/GetComprobantesGRecibidosAsync/erp_" + this.token.rfc + "/folioFiscal/" + this.folioFiscal);
                        this.dataComprobantes = response.data;
                    } catch (error) {
                        console.log(error);
                    }
                }
                this.$q.loading.hide()
            },

            async GetRfc() {
                this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'red-8', spinnerSize: 140, message: 'Consultando...' })
                this.dataComprobantes = [];
                if (this.rfc.trim() === "") {
                    this.$q.notify({ type: 'warning', message: 'Indique un valor en RFC para realizar la busqueda' })
                    return;
                }
                if (this.selectTipo === "Emitido") {
                    try {
                        let response = await axios.get(this.rutaAxios + "Comprobante/GetComprobantesGEmitidosAsync/erp_" + this.token.rfc + "/receptor.rfc/" + this.rfc);
                        this.dataComprobantes = response.data;
                    } catch (error) {
                        console.log(error);
                    }
                } else if (this.selectTipo === "Recibido") {
                    try {
                        let response = await axios.get(this.rutaAxios + "Comprobante/GetComprobantesGRecibidosAsync/erp_" + this.token.rfc + "/emisor.rfc/" + this.rfc);
                        this.dataComprobantes = response.data;
                    } catch (error) {
                        console.log(error);
                    }
                }
                this.$q.loading.hide()
            },

            async GetNombre() {
                this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'red-8', spinnerSize: 140, message: 'Consultando...' })
                this.dataComprobantes = [];
                if (this.nombre.trim() === "") {
                    this.$q.notify({ type: 'warning', message: 'Indique un valor en nombre para realizar la busqueda' })
                    return;
                }
                if (this.selectTipo === "Emitido") {
                    try {
                        let response = await axios.get(this.rutaAxios + "Comprobante/GetComprobantesGEmitidosAsync/erp_" + this.token.rfc + "/receptor.nombre/" + this.nombre);
                        this.dataComprobantes = response.data;
                    } catch (error) {
                        console.log(error);
                    }
                } else if (this.selectTipo === "Recibido") {
                    try {
                        let response = await axios.get(this.rutaAxios + "Comprobante/GetComprobantesGRecibidosAsync/erp_" + this.token.rfc + "/emisor.nombre/" + this.nombre);
                        this.dataComprobantes = response.data;
                    } catch (error) {
                        console.log(error);
                    }
                }
                this.$q.loading.hide()
            },

            VerPdf(item) {
                if (this.selectTipo === "Emitido") {
                    try {
                        if (item.tipoComprobante === "I") {
                            this.$store.state.vistaPreviaGenStore.tipoComprobanteInterno = "FACTURA"
                        }
                        if (item.tipoComprobante === "E") {
                            this.$store.state.vistaPreviaGenStore.tipoComprobanteInterno = "NOTA CREDITO"
                        }
                        if (item.tipoComprobante === "P") {
                            this.$store.state.vistaPreviaGenStore.tipoComprobanteInterno = "PAGO"
                        }
                        if (item.tipoComprobante === "N") {
                            this.$store.state.vistaPreviaGenStore.tipoComprobanteInterno = "NOMINA"
                        }
                        this.$store.state.vistaPreviaGenStore.folioFiscal = item.folioFiscal;
                        this.$store.state.vistaPreviaGenStore.color = "19775C"
                        this.$store.state.vistaPreviaGenStore.tipo = "E"
                        this.$store.state.vistaPreviaGenStore.rfc = this.token.rfc
                        this.dialogPdf = true;
                    } catch (error) {
                        console.log(error)
                    }
                } else if (this.selectTipo === "Recibido") {
                    try {
                        if (item.tipoComprobante === "I") {
                            this.$store.state.vistaPreviaGenStore.tipoComprobanteInterno = "FACTURA"
                        }
                        if (item.tipoComprobante === "E") {
                            this.$store.state.vistaPreviaGenStore.tipoComprobanteInterno = "NOTA CREDITO"
                        }
                        if (item.tipoComprobante === "P") {
                            this.$store.state.vistaPreviaGenStore.tipoComprobanteInterno = "PAGO"
                        }
                        this.$store.state.vistaPreviaGenStore.folioFiscal = item.folioFiscal;
                        this.$store.state.vistaPreviaGenStore.color = "19775C"
                        // this.$store.state.vistaPreviaGenStore.tipoComprobanteInterno = "FACTURA"
                        this.$store.state.vistaPreviaGenStore.tipo = "R"
                        this.$store.state.vistaPreviaGenStore.rfc = this.token.rfc
                        this.dialogPdf = true;
                    } catch (error) {
                        console.log(error)
                    }
                }
            },

            async ValidaEstatusSat(item) {
                this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'red-8', spinnerSize: 140, message: 'Validando estatus en plataforma del SAT...' })
                try {
                    const curl = this.rutaAxios + "Comprobante/GetEstatusSatAsync/" + item.rfcEmisor + "/" + item.rfcReceptor + "/" + item.total + "/" + item.folioFiscal;
                    console.log(curl);

                    let response = await axios.get(curl);
                    console.log(response.data);
                    this.validaEstatus = response.data;
                    if (response.data.efossat === "EL RFC NO ESTA LISTA DENTRO DE LA LISTA DE 69B") {
                        this.colorEfo = "green";
                    } else {
                        this.colorEfo = "red";
                    }
                    if (response.data.estadoSAT === "Cancelado") {
                        this.colorEstatus = "red";
                    } else {
                        this.colorEstatus = "green";
                    }
                    this.validaEstatus.rfc = item.rfc;
                    this.validaEstatus.nombre = item.nombre;
                    this.validaEstatus.folioFiscal = item.folioFiscal;
                    this.validaEstatus.tipoComprobante = item.tipoComprobante;
                    this.dialogEstatusSat = true;
                } catch (error) {
                    console.log(error)
                }
                this.$q.loading.hide()
            },

            async AplicaCancelacion() {
                this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'red-8', spinnerSize: 140, message: 'Aplicando cancelacion...' })
                let collection = "";
                let tipoC = this.validaEstatus.tipoComprobante;
                try {
                    //EVALUAMOS PARA SABER DONDE SE VA A ACTUALIZAR
                    if (this.selectTipo === "Emitido") {
                        if (tipoC === "I") {
                            collection = "comprobantes_emitidos";
                        }
                        if (tipoC === "E") {
                            collection = "comprobantes_emitidos";
                        }
                        if (tipoC === "P") {
                            collection = "comprobantes_pagos";
                        }
                        if (tipoC === "N") {
                            collection = "comprobantes_nomina";
                        }
                    } else {
                        if (tipoC === "I") {
                            collection = "comprobantes_recibidos";
                        }
                        if (tipoC === "E") {
                            collection = "comprobantes_recibidos";
                        }
                        if (tipoC === "P") {
                            collection = "comprobantes_pagos_recibidos";
                        }
                    }
                    let response = await axios.put(this.rutaAxios + "Comprobante/PutCanceladosAsync/erp_" + this.token.rfc + "/" + collection + "/" + this.validaEstatus.folioFiscal);
                    console.log(response.data);
                } catch (error) {
                    console.log(error);
                }
                this.dialogEstatusSat = false;
                this.$q.loading.hide()

            },

            CloseDialogPdfG() {
                this.dialogPdf = false;
            },
        },
    }
</script>