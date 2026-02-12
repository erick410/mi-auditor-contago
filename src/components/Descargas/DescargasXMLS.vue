<template>
    <q-page>
        <div class="row q-ma-md">
            <div class="col-12 col-md-2 " color="bg-primary">
                <div class="row">
                    <div class="col-12  " color="bg-primary">
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
                    <div class="col-12 " color="bg-primary">
                        <q-input filled v-model="fechaFFormated" label="Fecha Final">
                            <template v-slot:prepend>
                                <q-icon name="event" class="cursor-pointer">
                                    <q-popup-proxy transition-show="scale" transition-hide="scale">
                                        <q-date name="event" v-model="fechaF" mask="YYYY-MM-DD">
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
                        <q-input class="q-mb-none q-pb-none" filled v-model="horaI" mask="fulltime"
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
                        <q-input filled class="q-mb-none q-pb-none" v-model="horaF" mask="fulltime"
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

            <div class="col-12 col-md-2" color="bg-primary">
                <div class="row">
                    <div class="col-12" color="bg-primary">
                        <q-select filled :options="itemsTipo" v-model="tipo" label="Tipo">
                        </q-select>
                    </div>
                </div>
                <div class="row">
                    <div class="col-12" color="bg-primary">
                        <q-select filled :options="itemsTipoComprobante" v-model="TipoComprobante" option-label="tipo"
                            label="Tipo Comprobante">
                        </q-select>
                    </div>
                </div>

            </div>

            <div class="col-12 col-md-6" color="bg-primary">
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
                        <q-btn color="blue" icon="mdi-check-circle" class="full-width" label="Solicitar por Tipo"
                            @click="solicitarDescargaPorTipo()">
                            <q-tooltip>
                                Solicitar por tipo de Comprobantes
                            </q-tooltip>
                        </q-btn>
                    </div>
                </div>
                <div class="row justify-end q-pa-sm">
                    <div class="col-12 col-md-4 " col-md-4 color="bg-primary">
                        <q-btn color="secondary" icon="mdi-update" class="full-width" label="Actualizar"
                            @click="getHistorial()">
                            <q-tooltip>
                                Actualizar Solicitudes
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
            <div style="font-size: 13px;">Tenga en cuenta que el SAT solo permite realizar hasta tres solicitudes con
                los mismos criterios. Una vez que finalice sus descargas, concilie la información para garantizar que
                los datos se actualicen correctamente. (Apartado de gráficas)</div>
        </q-bar>
        <q-table :filter="filter" title="Historial de Descargas CFDI" sortBy="fechaSolicitud" :descending="false"
            :data="historial" :pagination.sync="pagination" :columns="columns" row-key="solicitud"
            :rows-per-page-options="[10]">
            <template v-slot:top-right>
                <q-input filled dense debounce="300" v-model="filter" placeholder="Search">
                    <template v-slot:append>
                        <q-icon name="search" />
                    </template>
                </q-input>
            </template>

            <template v-slot:body="props">
                <q-tr :props="props" sortBy="fechaSolicitud" :descending="false">
                    <!--<q-td key="solicitud" :props="props">{{ props.row.solicitud }}</q-td>-->
                    <q-td key="fechaSolicitud" :props="props">{{ formatDate(props.row.fechaSolicitud) }}</q-td>
                    <q-td key="tipo" :props="props">{{ props.row.tipo }}</q-td>
                    <!--<q-td key="tipoSolicitud" :props="props">{{ props.row.tipoSolicitud }}</q-td>-->
                    <q-td key="tipoComprobante" :props="props">{{ props.row.tipoComprobante }}</q-td>
                    <q-td key="fechaInicial" :props="props">{{ formatDate(props.row.fechaInicial) }}</q-td>
                    <q-td key="fechaFinal" :props="props">{{ formatDate(props.row.fechaFinal) }}</q-td>
                    <q-td key="numComprobantes" :props="props">{{ props.row.numComprobantes }}</q-td>
                    <!--<q-td key="numComprobantesDescargados" :props="props">{{ props.row.numComprobantesDescargados
                        }}</q-td>-->
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
                            <q-btn keysize="sm" color="blue" round dense @click="actualizarSolicitud(props.row)"
                                icon="mdi-update">
                                <q-tooltip>
                                    Actualizar Solicitud
                                </q-tooltip>
                            </q-btn>
                        </template>

                        <template v-if="props.row.estatusSolicitud == 'Solicitud Realizada'">
                            <q-btn keysize="sm" color="accent" round dense @click="actualizarSolicitud(props.row)"
                                icon="mdi-update">
                                <q-tooltip>
                                    Actualizar Solicitud
                                </q-tooltip>
                            </q-btn>
                        </template>
                    </q-td>
                </q-tr>
            </template>
        </q-table>
    </q-page>
</template>
<script>
    import axios from "axios";
    import moment from 'moment'

    export default {

        components: {
        },
        data() {
            return {
                fechaI: new Date(),
                fechaF: new Date(),
                horaI: '00:00:00',
                horaF: '23:59:59',
                TipoSolicitud: 'CFDI',

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
                TipoSolicitud: 'CFDI',
                TipoComprobante: { tipo: 'Todos', value: '' },
                EstadoComprobante: '',
                tipo: 'Emitido',

                columns: [
                    // { name: 'solicitud', align: 'center', label: 'ID Solicitud', field: 'solicitud', sortable: true },
                    { name: 'fechaSolicitud', align: 'center', label: 'Fecha de Solicitud', field: 'fechaSolicitud', sortable: true },
                    { name: 'tipo', align: 'center', label: 'Tipo', field: 'tipo', sortable: true },
                    // { name: 'tipoSolicitud', align: 'center', label: 'Tipo de Solicitud', field: 'tipoSolicitud', sortable: true },
                    { name: 'tipoComprobante', align: 'center', label: 'Tipo Comprobante', field: 'tipoComprobante', sortable: true },
                    { name: 'fechaInicial', align: 'center', label: 'Fecha Inicial', field: 'fechaInicial', sortable: true },
                    { name: 'fechaFinal', align: 'center', label: 'Fecha Final', field: 'fechaFinal', sortable: true },
                    { name: 'numComprobantes', align: 'center', label: 'Comprobantes', field: 'numComprobantes', sortable: true },
                    // { name: 'numComprobantesDescargados', align: 'center', label: 'Comprobantes Descargados', field: 'numComprobantesDescargados', sortable: true },
                    { name: 'estatusSolicitud', align: 'center', label: 'Estatus', field: 'estatusSolicitud', sortable: true },
                    { name: 'Acciones', align: 'center', label: 'Acciones', field: 'Acciones', sortable: true },
                ],
                itemsDescargas: [],

                pagination: {
                    sortBy: 'fechaSolicitud',
                    descending: true,
                },

                filter: '',
            }
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
                return this.$store.state.listaHistorialDescargasCFDIStore
            },
            rutaAxios() {
                return this.$store.state.rutaMongoStore
            },
        },

        watch: {
        },
        created() {
            this.getHistorial();
        },
        methods: {
            UltimoDiaMes() {
                const fecha = new Date(this.fechaI);
                const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
                this.fechaF = ultimoDia;
            },
            async solicitarDescargaPorTipo() {
                //VALIDAMOS QUE NO SE PUEDAN DESCARGAR EJERCICIOS ANTERIORES
                const yearI = moment(this.fechaI).year();
                const userA = this.token.nombre.toLowerCase();
                const anioActual = new Date().getFullYear();
                const anioAnterior = anioActual - 1;
                if(userA != "admin" && yearI < anioAnterior){
                    this.$q.notify({ type: 'warning', position:'top-right', message: 'No es posible descargar el periodo seleccionado, para mayo información cominiquese con nosotros al : 222 622 6540' })
                    this.$q.loading.hide()                    
                    return;
                }
                
                let egreso = { tipo: 'Egreso', value: 'E' }
                await this.solicitarDescargaTipo(egreso);

                let Ingreso = { tipo: 'Ingreso', value: 'I' }
                await this.solicitarDescargaTipo(Ingreso);

                let pago = { tipo: 'Pago', value: 'P' }
                await this.solicitarDescargaTipo(pago);

                let nomina = { tipo: 'Nomina', value: 'N' }
                await this.solicitarDescargaTipo(nomina);

                let traslado = { tipo: 'Traslado', value: 'T' }
                await this.solicitarDescargaTipo(traslado);
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
                    TipoSolicitud: 'CFDI',
                    usuario: this.token.nombre,
                    TipoComprobante: tipoComprobante,
                    EstadoComprobante: { estatus: 'Todos', value: 'Todos' }
                }
                console.log(solicitud)
                try {
                    let response = await axios.post('Descargas/PostSolicitud/erp_' + this.token.rfc, solicitud);
                    console.log(response)
                    solicitud.sollicitud = response.data
                    solicitud.estatusSolicitud = "Solicitud Realizada"

                    let objeto = {
                        rfc: this.token.rfc,
                        solicitud: response.data,
                        fechaSolicitud: new Date(),
                        tipo: this.tipo,
                        tipoSolicitud: 'CFDI',
                        tipoComprobante: tipoComprobante.tipo,
                        estadoComprobante: { estatus: 'Todos', value: 'Todos' },
                        fechaInicial: fI + ' ' + this.horaI,
                        fechaFinal: fF + ' ' + this.horaF,
                        numComprobantes: 0,
                        numComprobantesDescargados: 0,
                        estatusSolicitud: "Solicitud Realizada"
                    }

                    this.$store.state.listaHistorialDescargasCFDIStore.push(objeto);

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

                //VALIDAMOS QUE NO SE PUEDAN DESCARGAR EJERCICIOS ANTERIORES
                const yearI = moment(this.fechaI).year();
                const userA = this.token.nombre.toLowerCase();
                const anioActual = new Date().getFullYear();
                const anioAnterior = anioActual - 1;
                if(userA != "admin" && yearI < anioAnterior){
                    this.$q.notify({ type: 'warning', position:'top-right', message: 'No es posible descargar el periodo seleccionado, para mayo información cominiquese con nosotros al : 222 622 6540' })
                    this.$q.loading.hide()                    
                    return;
                }

                let solicitud = {
                    tipo: this.tipo,
                    fechaInicial: fI + ' ' + this.horaI,
                    fechaFinal: fF + ' ' + this.horaF,
                    RfcReceptor: this.token.rfc,
                    RfcEmisor: this.token.rfc,
                    RfcSolicitante: this.token.rfc,
                    TipoSolicitud: 'CFDI',
                    usuario: this.token.nombre,
                    TipoComprobante: this.TipoComprobante,
                    EstadoComprobante: { estatus: 'Todos', value: 'Todos' }
                }
                console.log(solicitud)
                try {
                    let response = await axios.post('Descargas/PostSolicitud/erp_' + this.token.rfc, solicitud);
                    console.log(response)
                    solicitud.sollicitud = response.data
                    solicitud.estatusSolicitud = "Solicitud Realizada"

                    let objeto = {
                        rfc: this.token.rfc,
                        solicitud: response.data,
                        fechaSolicitud: new Date(),
                        tipo: this.tipo,
                        tipoSolicitud: 'CFDI',
                        tipoComprobante: this.TipoComprobante.tipo,
                        estadoComprobante: { estatus: 'Todos', value: 'Todos' },
                        fechaInicial: fI + ' ' + this.horaI,
                        fechaFinal: fF + ' ' + this.horaF,
                        numComprobantes: 0,
                        numComprobantesDescargados: 0,
                        estatusSolicitud: "Solicitud Realizada"
                    }

                    this.$store.state.listaHistorialDescargasCFDIStore.push(objeto);

                    this.$q.loading.hide()
                    this.$q.notify({ type: 'positive', message: 'Solicitud creada correctamente.' })

                } catch (error) {
                    console.log(error);
                    this.$q.loading.hide()
                    this.$q.notify({ type: 'negative', message: error.response.data })
                }
            },

            async getHistorial() {
                this.$store.state.listaHistorialDescargasCFDIStore = []
                this.$q.loading.show({ message: '<b>Consultando datos...' })
                try {
                    let response = await axios.post('Descargas/GetHistorialDescargas/CFDI/erp_' + this.token.rfc);
                    console.log(response.data)
                    this.$store.state.listaHistorialDescargasCFDIStore = response.data
                    this.$q.loading.hide()

                } catch (error) {
                    console.log(error);
                    this.$q.loading.hide()
                }
            },

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


                    // if (response.data.mensaje == 'Solicitud Aceptada' && response.data.codigoEstadoSolicitud != '5002') {
                    //     if (response.data.idsPaquetes != null) {
                    //         item.solicitudPaquete = response.data.idsPaquetes[0]
                    //         item.estatusSolicitud = 'Listo para Descargar'
                    //     } else {
                    //         item.solicitudPaquete = ''
                    //         item.estatusSolicitud = 'Procesando'
                    //     }
                    // }
                    // else if (response.data.codigoEstadoSolicitud == '5002') {
                    //     item.estatusSolicitud = 'Se ha alcanzado el límite de solicitudes, con el mismo criterio'
                    //     item.solicitudPaquete = ''

                    // }
                    // else {
                    //     item.estatusSolicitud = response.data.mensaje
                    // }
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

                    let indice = this.$store.state.listaHistorialDescargasCFDIStore.findIndex(x => x.solicitud === item.solicitud);
                    Object.assign(this.$store.state.listaHistorialDescargasCFDIStore[indice], item)

                    // this.getHistorial();
                    this.$q.loading.hide()

                } catch (error) {
                    console.log(error);
                    this.$q.loading.hide()
                }
            },

            async descargarSolicitud(item) {
                let objetoDescargar = {
                    solicitud: item.solicitud,
                    rfc: item.rfc,
                    tipoSolicitud: item.tipoSolicitud,
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
                        item.numComprobantesDescargados = response.data.numComprobantesDescargados
                    } else {
                        item.estatusSolicitud = response.data.mensaje
                    }

                    let indice = this.$store.state.listaHistorialDescargasCFDIStore.findIndex(x => x.solicitud === item.solicitud);
                    Object.assign(this.$store.state.listaHistorialDescargasCFDIStore[indice], item);

                    this.$q.loading.hide()

                } catch (error) {
                    console.log(error);
                    this.$q.loading.hide()
                }
            },
            async Ordenar() {
                try {
                    let response = await axios.post('Descargas/Ordenar');
                    console.log(response)
                } catch (error) {
                    console.log(error);

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
        }
    }
</script>