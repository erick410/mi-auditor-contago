<template>
    <q-page>
        <q-tabs v-model="tab" class="q-ma-md bg-grey-3 text-grey-7" active-color="primary" indicator-color="primary"
            align="justify" narrow-indicator>
            <q-tab name="validacionMetadata" label="VALIDACIÓN CON METADATA" />
            <q-tab name="metadata" label="METADATA" />
        </q-tabs>
        <q-separator />
        <q-tab-panels v-model="tab" animated class=" text-center">
            <q-tab-panel name="validacionMetadata">
                <div class="row q-col-gutter-sm">
                    <div class="col-12 col-md-1">
                        <q-select filled dense v-model="selectedAnio" :options="itemsAnios" label="Año" />
                    </div>
                    <div class="col-12 col-md-1">
                        <q-select filled dense v-model="selectedMes" :options="itemsMes" label="Mes" />
                    </div>
                    <div class="col-12 col-md-1">
                        <q-select filled dense :options="itemsTipo" v-model="tipo" label="Tipo">
                        </q-select>
                    </div>
                    <div class="col-12 col-md-9 text-right">
                        <q-btn color="green" class="q-mr-md" icon="mdi-check-circle" label="Solicitar"
                            @click="solicitarDescargaMes()">
                            <q-tooltip>
                                Solicitar Descarga
                            </q-tooltip>
                        </q-btn>
                        <q-btn color="secondary" icon="mdi-update" label="Actualizar Historial" @click="getHistorial()">
                            <q-tooltip>
                                Actualizar Historial
                            </q-tooltip>
                        </q-btn>
                    </div>
                </div>
                <q-bar class="bg-blue-1 q-mt-md">
                    <q-btn dense flat icon="info" />
                    <div class="text-weight-bold">
                        Info
                    </div>
                    <div style="font-size: 14px;">Este apartado se utiliza para validar el número de comprobantes
                        (emitidos o recibidos) a través de la metadata. Tenga en cuenta que el SAT solo permite realizar
                        hasta tres solicitudes con los mismos criterios.</div>
                </q-bar>

                <q-table class="q-mt-md" :filter="filter2" title="Historial de Descargas Validacion por Metadata"
                    :pagination.sync="pagination2" :data="historialValidacion" :columns="columns" row-key="solicitud"
                    :rows-per-page-options="[10]">
                    <template v-slot:top-right>
                        <q-input filled dense debounce="300" v-model="filter2" placeholder="Filtrar">
                            <template v-slot:append>
                                <q-icon name="search" />
                            </template>
                        </q-input>
                    </template>

                    <template v-slot:body="props">
                        <q-tr :props="props">
                            <!-- <q-td key="solicitud" :props="props">{{ props.row.solicitud }}</q-td>-->
                            <q-td key="fechaSolicitud" :props="props">{{ formatDate(props.row.fechaSolicitud) }}</q-td>
                            <q-td key="tipo" :props="props">{{ props.row.tipo }}</q-td>
                            <!--<q-td key="tipoSolicitud" :props="props">{{ props.row.tipoSolicitud }}</q-td>-->
                            <!--<q-td key="tipoComprobante" :props="props">{{ props.row.tipoComprobante }}</q-td>-->
                            <q-td key="estadoComprobante" :props="props">{{ props.row.estadoComprobante }}</q-td>
                            <q-td key="fechaInicial" :props="props">{{ formatDate(props.row.fechaInicial) }}</q-td>
                            <q-td key="fechaFinal" :props="props">{{ formatDate(props.row.fechaFinal) }}</q-td>
                            <q-td key="numComprobantes" :props="props">{{ props.row.numComprobantes }}</q-td>
                            <q-td key="estatusSolicitud" :props="props">{{ props.row.estatusSolicitud }}</q-td>
                            <q-td key="Acciones" auto-width>
                                <template v-if="props.row.estatusSolicitud == 'Listo para Descargar'">
                                    <q-btn keysize="sm" color="green" round dense @click="descargarSolicitud(props.row)"
                                        icon="mdi-download">
                                        <q-tooltip>
                                            Descargar Solicitud
                                        </q-tooltip>
                                    </q-btn>
                                </template>
                                <template v-if="props.row.estatusSolicitud.includes('Procesando')">
                                    <q-btn keysize="sm" color="accent" round dense
                                        @click="actualizarSolicitud(props.row)" icon="mdi-update">
                                        <q-tooltip>
                                            Actualizar Solicitud
                                        </q-tooltip>
                                    </q-btn>
                                </template>

                                <template v-if="props.row.estatusSolicitud == 'Solicitud Realizada'">
                                    <q-btn keysize="sm" color="blue" round dense @click="actualizarSolicitud(props.row)"
                                        icon="mdi-update">
                                        <q-tooltip>
                                            Actualizar Solicitud
                                        </q-tooltip>
                                    </q-btn>
                                </template>
                                <template v-if="props.row.estatusSolicitud == 'Descargado'">
                                    <q-btn keysize="sm" color="orange" round dense @click="descargaLocal(props.row)"
                                        icon="mdi-monitor-arrow-down">
                                        <q-tooltip>
                                            Extraer Metadata
                                        </q-tooltip>
                                    </q-btn>

                                    <q-btn keysize="sm" color="amber-10" round dense
                                        @click="ValidaCancelados(props.row)" icon="mdi-file-cancel-outline">
                                        <q-tooltip>
                                            Valida Cancelados
                                        </q-tooltip>
                                    </q-btn>
                                </template>
                            </q-td>
                        </q-tr>

                    </template>

                </q-table>
            </q-tab-panel>
            <q-tab-panel name="metadata">
                <div class="row q-ma-md">
                    <div class="col-12 col-md-2" color="bg-primary">
                        <div class="row">
                            <div class="col-12" color="bg-primary">
                                <q-input filled v-model="fechaIFormated" label="Fecha Inicial">
                                    <template v-slot:prepend>
                                        <q-icon name="event" class="cursor-pointer">
                                            <q-popup-proxy transition-show="scale" transition-hide="scale">
                                                <q-date v-model="fechaI" @input="UltimoDiaMes">
                                                    <div class="row items-center justify-end">
                                                        <q-btn v-close-popup label="Ok" color="primary" flat />
                                                    </div>
                                                </q-date>
                                            </q-popup-proxy>
                                        </q-icon>
                                    </template>
                                </q-input>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-12" color="bg-primary">
                                <q-input filled v-model="fechaFFormated" label="Fecha Final">
                                    <template v-slot:prepend>
                                        <q-icon name="event" class="cursor-pointer">
                                            <q-popup-proxy transition-show="scale" transition-hide="scale">
                                                <q-date name="event" v-model="fechaF">
                                                    <div class="row items-center justify-end">
                                                        <q-btn v-close-popup label="Ok" color="primary" flat />
                                                    </div>
                                                </q-date>
                                            </q-popup-proxy>
                                        </q-icon>
                                    </template>
                                </q-input>
                            </div>
                        </div>
                    </div>

                    <div class="col-12 col-md-2" color="bg-primary">
                        <div class="row">
                            <div class="col-12" color="bg-primary">
                                <q-input filled class="q-mb-none q-pb-none" v-model="horaI" mask="fulltime"
                                    :rules="['fulltime']" label="Hora Inicial">
                                    <template v-slot:append>
                                        <q-icon name="access_time" class="cursor-pointer">
                                            <q-popup-proxy transition-show="scale" transition-hide="scale">
                                                <q-time v-model="horaI" with-seconds format24h>
                                                    <div class="row items-center justify-end">
                                                        <q-btn v-close-popup label="Close" color="primary" flat />
                                                    </div>
                                                </q-time>
                                            </q-popup-proxy>
                                        </q-icon>
                                    </template>
                                </q-input>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-12" color="bg-primary">
                                <q-input filled v-model="horaF" class="q-mb-none q-pb-none" mask="fulltime"
                                    :rules="['fulltime']" label="Hora Final">
                                    <template v-slot:append>
                                        <q-icon name="access_time" class="cursor-pointer">
                                            <q-popup-proxy transition-show="scale" transition-hide="scale">
                                                <q-time v-model="horaF" with-seconds format24h>
                                                    <div class="row items-center justify-end">
                                                        <q-btn v-close-popup label="Close" color="primary" flat />
                                                    </div>
                                                </q-time>
                                            </q-popup-proxy>
                                        </q-icon>
                                    </template>
                                </q-input>
                            </div>
                        </div>
                    </div>
                    <div class=" col-12 col-md-2 " color="bg-primary">
                        <div class="row">
                            <div class="col-12" color="bg-primary">
                                <q-select filled :options="itemsTipo" v-model="tipo" label="Tipo">
                                </q-select>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-12" color="bg-primary">
                                <q-select filled :options="itemsTipoComprobante" v-model="TipoComprobante"
                                    option-label="tipo" label="Tipo Comprobante">
                                </q-select>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-2" color="bg-primary">
                        <q-select filled :options="itemsEstado" v-model="EstadoComprobante" option-label="estatus"
                            label="Estado Comprobante">
                        </q-select>
                    </div>
                    <div class="col-12 col-md-4" color="bg-primary">
                        <div class="row justify-end q-pa-sm">
                            <div class="col-12 col-md-4 text-center" color="bg-primary">
                                <q-btn color="green" icon="mdi-check-circle" class="full-width" label="Solicitar"
                                    @click="solicitarDescarga()">
                                    <q-tooltip>
                                        Solicitar Descarga
                                    </q-tooltip>
                                </q-btn>
                            </div>
                        </div>
                        <div class="row justify-end q-pa-sm">
                            <div class="col-12 col-md-4 " col-md-4 color="bg-primary">
                                <q-btn color="blue" icon="mdi-check-circle" class="full-width"
                                    label="Solicitar por Tipo" @click="solicitarDescargaPorTipo()">
                                    <q-tooltip>
                                        Solicitar por tipo de Comprobantes
                                    </q-tooltip>
                                </q-btn>
                            </div>
                        </div>
                        <div class="row justify-end q-pa-sm">
                            <div class="col-12 col-md-4" color="bg-primary">
                                <q-btn color="secondary" icon="mdi-update" class="full-width" label="Actualizar"
                                    @click="getHistorial()">
                                    <q-tooltip>
                                        Actualizar Historial
                                    </q-tooltip>
                                </q-btn>
                            </div>
                        </div>
                    </div>
                </div>
                <q-bar class="bg-blue-1 q-mt-md">
                    <q-btn dense flat icon="info" />
                    <div class="text-weight-bold">
                        Info
                    </div>
                    <div style="font-size: 14px;">Este apartado solo permite obtener la metadata, pero no valida los
                        comprobantes ya descargados con los datos de la metadata. Tenga en cuenta que el SAT solo
                        permite realizar hasta tres solicitudes con los mismos criterios.</div>
                </q-bar>
                <q-table :filter="filter" title="Historial de Descargas Metadata" :pagination.sync="pagination"
                    :data="historial" :columns="columns" row-key="solicitud" :rows-per-page-options="[10]">
                    <template v-slot:top-right>
                        <q-input filled dense debounce="300" v-model="filter" placeholder="Filtrar">
                            <template v-slot:append>
                                <q-icon name="search" />
                            </template>
                        </q-input>
                    </template>

                    <template v-slot:body="props">
                        <q-tr :props="props">
                            <!-- <q-td key="solicitud" :props="props">{{ props.row.solicitud }}</q-td>-->
                            <q-td key="fechaSolicitud" :props="props">{{ formatDate(props.row.fechaSolicitud) }}</q-td>
                            <q-td key="tipo" :props="props">{{ props.row.tipo }}</q-td>
                            <!--<q-td key="tipoSolicitud" :props="props">{{ props.row.tipoSolicitud }}</q-td>-->
                            <q-td key="tipoComprobante" :props="props">{{ props.row.tipoComprobante }}</q-td>
                            <q-td key="estadoComprobante" :props="props">{{ props.row.estadoComprobante }}</q-td>
                            <q-td key="fechaInicial" :props="props">{{ formatDate(props.row.fechaInicial) }}</q-td>
                            <q-td key="fechaFinal" :props="props">{{ formatDate(props.row.fechaFinal) }}</q-td>
                            <q-td key="numComprobantes" :props="props">{{ props.row.numComprobantes }}</q-td>
                            <q-td key="estatusSolicitud" :props="props">{{ props.row.estatusSolicitud }}</q-td>
                            <q-td key="Acciones" auto-width>
                                <template v-if="props.row.estatusSolicitud == 'Listo para Descargar'">
                                    <q-btn keysize="sm" color="green" round dense @click="descargarSolicitud(props.row)"
                                        icon="mdi-download">
                                        <q-tooltip>
                                            Descargar Solicitud
                                        </q-tooltip>
                                    </q-btn>
                                </template>
                                <template v-if="props.row.estatusSolicitud.includes('Procesando')">
                                    <q-btn keysize="sm" color="accent" round dense
                                        @click="actualizarSolicitud(props.row)" icon="mdi-update">
                                        <q-tooltip>
                                            Actualizar Solicitud
                                        </q-tooltip>
                                    </q-btn>
                                </template>

                                <template v-if="props.row.estatusSolicitud == 'Solicitud Realizada'">
                                    <q-btn keysize="sm" color="blue" round dense @click="actualizarSolicitud(props.row)"
                                        icon="mdi-update">
                                        <q-tooltip>
                                            Actualizar Solicitud
                                        </q-tooltip>
                                    </q-btn>
                                </template>
                                <template v-if="props.row.estatusSolicitud == 'Descargado'">
                                    <q-btn keysize="sm" color="orange" round dense @click="descargaLocal(props.row)"
                                        icon="mdi-monitor-arrow-down">
                                        <q-tooltip>
                                            Extraer Metadata
                                        </q-tooltip>
                                    </q-btn>

                                    <q-btn keysize="sm" color="amber-10" round dense
                                        @click="ValidaCancelados(props.row)" icon="mdi-file-cancel-outline">
                                        <q-tooltip>
                                            Valida Cancelados
                                        </q-tooltip>
                                    </q-btn>
                                </template>
                            </q-td>
                        </q-tr>
                    </template>
                </q-table>
            </q-tab-panel>
        </q-tab-panels>
    </q-page>
</template>
<script>
    import axios from "axios";
    import moment from 'moment'
    import { QSpinnerCube } from 'quasar'

    export default {

        components: {
        },
        data() {
            return {
                tab: 'validacionMetadata',
                fechaI: new Date(),
                fechaF: new Date(),
                horaI: '00:00:00',
                horaF: '23:59:59',
                TipoSolicitud: 'Metadata',
                itemsTipoComprobante: [
                    { tipo: 'Todos', value: '' },
                    { tipo: 'Ingreso', value: 'I' },
                    { tipo: 'Egreso', value: 'E' },
                    { tipo: 'Traslado', value: 'T' },
                    { tipo: 'Nomina', value: 'N' },
                    { tipo: 'Pago', value: 'P' }
                ],
                itemsEstado: [
                    { estatus: 'Todos', value: 'Todos' },
                    { estatus: 'Cancelado', value: 'Cancelado' },
                    { estatus: 'Vigente', value: 'Vigente' },
                ],
                itemsTipo: ['Emitido', 'Recibido'
                ],
                RfcReceptor: '',
                RfcEmisor: '',
                RfcSolicitante: '',
                TipoSolicitud: 'Metadata',
                TipoComprobante: { tipo: 'Todos', value: '' },
                EstadoComprobante: { estatus: 'Todos', value: 'Todos' },
                tipo: 'Emitido',

                columns: [
                    // { name: 'solicitud', align: 'center', label: 'ID Solicitud', field: 'solicitud', sortable: true },
                    { name: 'fechaSolicitud', align: 'center', label: 'Fecha de Solicitud', field: 'fechaSolicitud', sortable: true },
                    { name: 'tipo', align: 'center', label: 'Tipo', field: 'tipo', sortable: true },
                    // { name: 'tipoSolicitud', align: 'center', label: 'Tipo de Solicitud', field: 'tipoSolicitud', sortable: true },
                    // { name: 'tipoComprobante', align: 'center', label: 'Tipo Comprobante', field: 'tipoComprobante', sortable: true },
                    { name: 'estadoComprobante', align: 'center', label: 'Estado de Comprobante', field: 'estadoComprobante', sortable: true },
                    { name: 'fechaInicial', align: 'center', label: 'Fecha Inicial', field: 'fechaInicial', sortable: true },
                    { name: 'fechaFinal', align: 'center', label: 'Fecha Final', field: 'fechaFinal', sortable: true },
                    { name: 'numComprobantes', align: 'center', label: 'Total Comprobantes', field: 'numComprobantes', sortable: true },
                    { name: 'estatusSolicitud', align: 'center', label: 'Estatus', field: 'estatusSolicitud', sortable: true },
                    { name: 'Acciones', align: 'center', label: 'Acciones', field: 'Acciones', sortable: true },
                ],
                itemsDescargas: [],

                pagination: {
                    sortBy: 'fechaSolicitud',
                    descending: true,
                },
                filter: '',
                filter2: '',
                pagination2: {
                    sortBy: 'fechaSolicitud',
                    descending: true,
                },
                itemsAnios: ['2026','2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018'],
                itemsMes: [
                    { label: 'ENERO', value: 1 },
                    { label: 'FEBRERO', value: 2 },
                    { label: 'MARZO', value: 3 },
                    { label: 'ABRIL', value: 4 },
                    { label: 'MAYO', value: 5 },
                    { label: 'JUNIO', value: 6 },
                    { label: 'JULIO', value: 7 },
                    { label: 'AGOSTO', value: 8 },
                    { label: 'SEPTIEMBRE', value: 9 },
                    { label: 'OCTUBRE', value: 10 },
                    { label: 'NOVIEMBRE', value: 11 },
                    { label: 'DICIEMBRE', value: 12 },
                ],

                selectedAnio: null,
                selectedMes: null,
            }
        },
        created() {
            this.getHistorial();
        },
        computed: {
            token() {
                return this.$store.state.usuario;
            },
            fechaIFormated() {
                moment.locale('es-mx');
                return this.fechaI ? moment(this.fechaI).format('DD-MMMM-yyyy') : ''
            },

            fechaFFormated() {
                moment.locale('es-mx');
                return this.fechaF ? moment(this.fechaF).format('DD-MMMM-yyyy') : ''
            },

            historial() {
                return this.$store.state.listaHistorialDescargasMetadataStore.filter(x => x.tipoSolicitud == "Metadata")
            },
            historialValidacion() {
                return this.$store.state.listaHistorialDescargasMetadataStore.filter(x => x.tipoSolicitud == "Metadata_Validacion")
            },
            rutaAxios() {
                return this.$store.state.rutaMongoStore
            },
        },

        watch: {
        },
        methods: {
            UltimoDiaMes() {
                const fecha = new Date(this.fechaI);
                const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
                this.fechaF = ultimoDia;
            },
            async solicitarDescargaPorTipo() {
                let egreso = { tipo: 'Egreso', value: 'E' }
                await this.solicitarDescargaTipo(egreso);

                let Ingreso = { tipo: 'Ingreso', value: 'I' }
                await this.solicitarDescargaTipo(Ingreso);

                let pago = { tipo: 'Pago', value: 'P' }
                await this.solicitarDescargaTipo(pago);

                let traslado = { tipo: 'Traslado', value: 'T' }
                await this.solicitarDescargaTipo(traslado);

                let nomina = { tipo: 'Nomina', value: 'N' }
                await this.solicitarDescargaTipo(nomina);
            },
            async solicitarDescargaTipo(tipoComprobante) {
                console.log(tipoComprobante)
                this.$q.loading.show({ message: '<b>Generando Solicitud...' })
                let fI = moment(this.fechaI).format('YYYY-MM-DD')
                let fF = moment(this.fechaF).format('YYYY-MM-DD')
                let solicitud = {
                    tipo: this.tipo,
                    fechaInicial: fI + ' ' + this.horaI,
                    fechaFinal: fF + ' ' + this.horaF,
                    RfcReceptor: this.token.rfc,
                    RfcEmisor: this.token.rfc,
                    RfcSolicitante: this.token.rfc,
                    TipoSolicitud: 'Metadata',
                    usuario: this.token.nombre,
                    TipoComprobante: tipoComprobante,
                    EstadoComprobante: { estatus: 'Vigente', value: 1 }
                }
                console.log(solicitud)
                try {
                    let response = await axios.post('Descargas/PostSolicitud/erp_' + this.token.rfc, solicitud);
                    console.log(response.data)
                    solicitud.sollicitud = response.data
                    solicitud.estatusSolicitud = "Solicitud Realizada"

                    let objeto = {
                        rfc: this.token.rfc,
                        solicitud: response.data,
                        fechaSolicitud: new Date(),
                        tipo: this.tipo,
                        tipoSolicitud: 'Metadata',
                        tipoComprobante: tipoComprobante.tipo,
                        estadoComprobante: 'Vigente',
                        fechaInicial: fI + ' ' + this.horaI,
                        fechaFinal: fF + ' ' + this.horaF,
                        numComprobantes: 0,
                        estatusSolicitud: "Solicitud Realizada"
                    }

                    this.$store.state.listaHistorialDescargasMetadataStore.push(objeto);

                    let array = this.$store.state.listaHistorialDescargasMetadataStore
                    this.$store.state.listaHistorialDescargasMetadataStore = array.sort(((b, a) => b.fechaSolicitud - a.fechaSolicitud))

                    this.$q.loading.hide()
                    this.$q.notify({ type: 'positive', message: 'Solicitud creada correctamente.' })

                } catch (error) {
                    console.log(error);
                    this.$q.loading.hide()
                    this.$q.notify({ type: 'negative', message: error.response.data })
                }
            },
            async solicitarDescarga() {

                this.$q.loading.show({ message: '<b>Generando Solicitud...' })
                let fI = moment(this.fechaI).format('YYYY-MM-DD')
                let fF = moment(this.fechaF).format('YYYY-MM-DD')
                let solicitud = {
                    tipo: this.tipo,
                    fechaInicial: fI + ' ' + this.horaI,
                    fechaFinal: fF + ' ' + this.horaF,
                    RfcReceptor: this.token.rfc,
                    RfcEmisor: this.token.rfc,
                    RfcSolicitante: this.token.rfc,
                    TipoSolicitud: 'Metadata',
                    usuario: this.token.nombre,
                    TipoComprobante: this.TipoComprobante,
                    EstadoComprobante: this.EstadoComprobante
                }
                console.log(solicitud)
                try {
                    let response = await axios.post('Descargas/PostSolicitud/erp_' + this.token.rfc, solicitud);
                    console.log(response.data)
                    solicitud.sollicitud = response.data
                    solicitud.estatusSolicitud = "Solicitud Realizada"

                    let objeto = {
                        rfc: this.token.rfc,
                        solicitud: response.data,
                        fechaSolicitud: new Date(),
                        tipo: this.tipo,
                        tipoSolicitud: 'Metadata',
                        tipoComprobante: this.TipoComprobante.tipo,
                        estadoComprobante: this.EstadoComprobante.estatus,
                        fechaInicial: fI + ' ' + this.horaI,
                        fechaFinal: fF + ' ' + this.horaF,
                        numComprobantes: 0,
                        estatusSolicitud: "Solicitud Realizada"
                    }

                    this.$store.state.listaHistorialDescargasMetadataStore.push(objeto);

                    let array = this.$store.state.listaHistorialDescargasMetadataStore
                    this.$store.state.listaHistorialDescargasMetadataStore = array.sort(((b, a) => b.fechaSolicitud - a.fechaSolicitud))

                    this.$q.loading.hide()
                    this.$q.notify({ type: 'positive', message: 'Solicitud creada correctamente.' })

                } catch (error) {
                    console.log(error);
                    this.$q.loading.hide()
                    this.$q.notify({ type: 'negative', message: error.response.data })
                }
            },
            async solicitarDescargaMes() {

                if (this.selectedAnio == null) {
                    this.$q.notify({ type: 'warning', position: 'top-right', message: 'Indique el año a solicitar.' })
                    return
                }

                if (this.selectedMes == null) {
                    this.$q.notify({ type: 'warning', position: 'top-right', message: 'Indique el mes a solicitar.' })
                    return
                }
                // if (this.selectedAnio == '2024' ){
                //     if (this.selectedMes.value > 7) {
                //         this.$q.notify({ type: 'warning', position: 'top-right', message: 'El mes seleccionado aún no ha finalizado. Por favor, elija un mes completo para proceder.' })
                //         return
                //     }
                // }

                this.$q.loading.show({ message: '<b>Generando Solicitud...' })

                //  let fechaI = this.selectedAnio + '-' + this.selectedMes.value + '-01';

                // const fecha = new Date(fechaI)

                // let fechaF = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
                let fechaI = `${this.selectedAnio}-${String(this.selectedMes.value).padStart(2, '0')}-01`;
                const fechaInicio = moment(fechaI).startOf('month').format('YYYY-MM-DD 00:00:00');

                // Crear fecha de fin para el mes seleccionado (último día del mes)
                const fechaFin = moment(fechaI).endOf('month').format('YYYY-MM-DD 23:59:59');

                // let fI = moment(fechaI).format('YYYY-MM-DD')
                // let fF = moment(fechaF).format('YYYY-MM-DD')
                let solicitud = {
                    tipo: this.tipo,
                    fechaInicial: fechaInicio,
                    fechaFinal: fechaFin,
                    RfcReceptor: this.token.rfc,
                    RfcEmisor: this.token.rfc,
                    RfcSolicitante: this.token.rfc,
                    TipoSolicitud: 'Metadata_Validacion',
                    usuario: this.token.nombre,
                    TipoComprobante: { tipo: 'Todos', value: '' },
                    EstadoComprobante: { estatus: 'Todos', value: 'Todos' },
                }
                console.log(solicitud)
                try {
                    let response = await axios.post('Descargas/PostSolicitud/erp_' + this.token.rfc, solicitud);
                    console.log(response.data)
                    solicitud.sollicitud = response.data
                    solicitud.estatusSolicitud = "Solicitud Realizada"

                    let objeto = {
                        rfc: this.token.rfc,
                        solicitud: response.data,
                        fechaSolicitud: new Date(),
                        tipo: this.tipo,
                        tipoSolicitud: 'Metadata_Validacion',
                        tipoComprobante: 'Todos',
                        estadoComprobante: 'Todos',
                        fechaInicial: fechaInicio,
                        fechaFinal: fechaFin,
                        numComprobantes: 0,
                        estatusSolicitud: "Solicitud Realizada"
                    }

                    this.$store.state.listaHistorialDescargasMetadataStore.push(objeto);

                    let array = this.$store.state.listaHistorialDescargasMetadataStore
                    this.$store.state.listaHistorialDescargasMetadataStore = array.sort(((b, a) => b.fechaSolicitud - a.fechaSolicitud))

                    this.$q.loading.hide()
                    this.$q.notify({ type: 'positive', message: 'Solicitud creada correctamente.' })

                } catch (error) {
                    console.log(error);
                    this.$q.loading.hide()
                    this.$q.notify({ type: 'negative', message: error.response.data })
                }
            },
            async getHistorial() {
                this.$store.state.listaHistorialDescargasMetadataStore = []
                this.$q.loading.show({ message: '<b>Consultando datos...' })
                try {
                    let response = await axios.post('Descargas/GetHistorialDescargas/Metadata/erp_' + this.token.rfc);
                    console.log(response.data)

                    let array = response.data
                    this.$store.state.listaHistorialDescargasMetadataStore = array.sort(((a, b) => b.fechaSolicitud - a.fechaSolicitud))

                    this.$q.loading.hide()

                } catch (error) {
                    console.log(error);
                    this.$q.loading.hide()
                }
            },

            // async getHistorialValidacion() {
            //     this.historialValidacion = []
            //     this.$q.loading.show({ message: '<b>Consultando datos...' })
            //     try {
            //         let response = await axios.post('Descargas/GetHistorialDescargas/Metadata_Validacion/erp_' + this.token.rfc);
            //         console.log(response.data)

            //         let array = response.data
            //         this.historialValidacion = array.sort(((a, b) => b.fechaSolicitud - a.fechaSolicitud))

            //         this.$q.loading.hide()

            //     } catch (error) {
            //         console.log(error);
            //         this.$q.loading.hide()
            //     }
            // },

            async actualizarSolicitud(item) {
                let objetoActualizar = {
                    solicitud: item.solicitud,
                    rfc: item.rfc,
                    tipoSolicitud: item.tipoSolicitud
                }
                console.log(objetoActualizar)
                this.$q.loading.show({ message: '<b>Actualizando solicitud...' })
                try {
                    let response = await axios.put('Descargas/PutActualizaEstatus/erp_' + this.token.rfc, objetoActualizar);
                    console.log(response.data)

                    if (response.data.estadoSolicitud == "6") {
                        item.estatusSolicitud = 'Solicitud Vencida'
                    } else if (response.data.estadoSolicitud == "5") {
                        if (response.data.CodigoEstadoSolicitud == "5004") {
                            item.estatusSolicitud = 'Información no Encontrada'
                        } else if (response.data.CodigoEstadoSolicitud == "5002") {
                            item.estatusSolicitud = 'Se ha alcanzado el límite de solicitudes, con el mismo criterio'
                        }
                        else {
                            item.estatusSolicitud = 'Solicitud Rechazada'
                        }
                    } else if (response.data.estadoSolicitud == "4") {
                        item.estatusSolicitud = "Solicitud Erronea";
                    } else {
                        if (response.data.idsPaquetes != null) {
                            item.solicitudPaquete = response.data.idsPaquetes[0]
                            item.estatusSolicitud = 'Listo para Descargar'

                        } else {
                            item.solicitudPaquete = ''
                            item.estatusSolicitud = 'Procesando'
                        }
                    }

                    item.numComprobantes = response.data.numeroCFDIs

                    let indice = this.$store.state.listaHistorialDescargasMetadataStore.findIndex(x => x.solicitud === item.solicitud);
                    Object.assign(this.$store.state.listaHistorialDescargasMetadataStore[indice], item)

                    let array = this.$store.state.listaHistorialDescargasMetadataStore
                    this.$store.state.listaHistorialDescargasMetadataStore = array.sort(((a, b) => b.fechaSolicitud - a.fechaSolicitud))

                    this.$q.loading.hide()
                    // this.getHistorial();

                } catch (error) {
                    console.log(error);
                    this.$q.notify({ type: 'negative', message: error.response.data })

                    this.$q.loading.hide()
                }
            },



            async descargarSolicitud(item) {
                let objetoDescargar = {
                    solicitud: item.solicitud,
                    rfc: item.rfc,
                    tipoSolicitud: "Metadata",
                    tipoComprobante: item.tipoComprobante,
                    solicitudPaquete: item.solicitudPaquete,
                    tipo: item.tipo
                }
                console.log(objetoDescargar)
                this.$q.loading.show({ message: '<b>Descargando solicitud...' })
                try {
                    let response = await axios.post('Descargas/DescargarSolicitud/erp_' + this.token.rfc, objetoDescargar);
                    console.log(response.data)

                    if (response.data.mensaje == 'Se han descargado satisfactoriamente las facturas') {
                        item.estatusSolicitud = 'Descargado'
                    } else {
                        item.estatusSolicitud = response.data.mensaje
                    }

                    let indice = this.$store.state.listaHistorialDescargasMetadataStore.findIndex(x => x.solicitud === item.solicitud);
                    Object.assign(this.$store.state.listaHistorialDescargasMetadataStore[indice], item);

                    let array = this.$store.state.listaHistorialDescargasMetadataStore
                    this.$store.state.listaHistorialDescargasMetadataStore = array.sort(((a, b) => b.fechaSolicitud - a.fechaSolicitud))

                    this.$q.loading.hide()

                } catch (error) {
                    console.log(error);
                    this.$q.loading.hide()
                    this.$q.notify({ type: 'negative', message: error.response.data })
                }
            },


            async descargaLocal(item) {
                this.$q.loading.show({ message: '<b>Descargando solicitud...' })

                console.log(item)
                try {
                    let response = await axios.get('Descargas/GetMetadata/erp_' + this.token.rfc + '/' + item.rfc + '/' + item.solicitud + '/' + item.solicitudPaquete);
                    console.log(response.data)
                    let nombreArchivo = item.solicitudPaquete + '.txt'

                    if (response.data.base64 != '') {
                        this.descargarBase64ComoTexto(response.data.base64, nombreArchivo);
                        this.$q.notify({ type: 'positive', message: 'Archivo descargado.' })
                    } else {
                        this.$q.notify({ type: 'negative', message: 'No se encontro el archivo.' })
                    }
                    this.$q.loading.hide()
                } catch (error) {
                    console.log(error);
                    this.$q.loading.hide()
                    this.$q.notify({ type: 'negative', message: 'Error al descargar archivo Metadata.' })
                }
            },

            formatDate(value) {
                if (typeof value === 'string') {

                    let fecha_ = value.replace(/T/g, ' ')
                    let fecha_1 = fecha_.replace(/Z/g, ' ')
                    let listo = new Date(fecha_1);

                    moment.locale('es-mx');
                    return moment(listo).format('YYYY-MM-DD HH:mm:ss')
                } else {
                    moment.locale('es-mx');
                    return moment(value).format('YYYY-MM-DD HH:mm:ss')
                }
            },

            descargarBase64ComoTexto(base64Data, nombreArchivo) {
                const textoDecodificado = atob(base64Data);
                const blob = new Blob([textoDecodificado], { type: 'text/plain' });
                const blobURL = URL.createObjectURL(blob);

                const enlaceDescarga = document.createElement('a');
                enlaceDescarga.href = blobURL;
                enlaceDescarga.download = nombreArchivo;

                enlaceDescarga.click();

                URL.revokeObjectURL(blobURL);
            },

            async ValidaCancelados(item) {
                console.log(item);
                if (item.tipo === 'Emitido') {
                    await this.ValidaCanceladosEmitidos(item);
                } else if (item.tipo === 'Recibido') {
                    await this.ValidaCanceladosRecibidos(item);
                }
            },

            async ValidaCanceladosEmitidos(item) {
                this.showLoading();
                console.log(item)
                try {
                    let response = await axios.post('Descargas/PostValidaCanceladosAsync/' + item.rfc + '/' + item.solicitud + '/' + item.solicitudPaquete + '/' + item.tipo);
                    console.log(response.data)
                    this.$q.loading.hide()
                } catch (error) {
                    console.log(error);
                    this.$q.loading.hide()
                }
            },

            async ValidaCanceladosRecibidos(item) {
                this.showLoading();
                console.log(item)
                try {
                    let response = await axios.post('Descargas/PostValidaCanceladosAsync/' + item.rfc + '/' + item.solicitud + '/' + item.solicitudPaquete + '/' + item.tipo);
                    console.log(response.data)
                    this.$q.loading.hide()
                } catch (error) {
                    console.log(error);
                    this.$q.loading.hide()
                }
            },

            showLoading() {
                this.$q.loading.show({
                    spinner: QSpinnerCube,
                    spinnerColor: 'red-8',
                    spinnerSize: 140,
                    // backgroundColor: 'purple',
                    message: '<b>Actulizando estatus de los comprobantes...',
                    // messageColor: 'black'
                })
            },

        }
    }
</script>