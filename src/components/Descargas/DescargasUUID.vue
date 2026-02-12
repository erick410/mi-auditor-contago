<template>
    <q-page>
        <div class="row q-ma-md justify-between">
            <div class="col-12 col-md-6 " color="bg-primary">
                <q-input filled v-model="uuid" label="Filled" />
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
        <q-table title="Historial de Descargas UUID" :data="historial" :columns="columns" row-key="solicitud">
            <template v-slot:body="props">
                <q-tr :props="props">
                    <q-td key="solicitud" :props="props">{{ props.row.solicitud }}</q-td>
                    <q-td key="fechaSolicitud" :props="props">{{ formatDate(props.row.fechaSolicitud) }}</q-td>
                    <q-td key="uuid" :props="props">{{ props.row.tipo }}</q-td>
                    <q-td key="estatusSolicitud" :props="props">{{ props.row.estatusSolicitud }}</q-td>
                    <q-td key="Acciones" auto-width>
                        <template v-if="props.row.estatusSolicitud == 'Listo para Descargar'">
                            <q-btn keysize="sm" color="accent" round dense @click="descargarSolicitud(props.row)"
                                icon="mdi-download" />
                        </template>
                        <template v-if="props.row.estatusSolicitud.includes('Procesando')">
                            <q-btn keysize="sm" color="accent" round dense @click="actualizarSolicitud(props.row)"
                                icon="mdi-update" />
                        </template>

                        <template v-if="props.row.estatusSolicitud == 'Solicitud Realizada'">
                            <q-btn keysize="sm" color="accent" round dense @click="actualizarSolicitud(props.row)"
                                icon="mdi-update" />
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
            uuid: '',
            columns: [
                { name: 'solicitud', align: 'center', label: 'ID Solicitud', field: 'solicitud', sortable: true },
                { name: 'fechaSolicitud', align: 'center', label: 'Fecha de Solicitud', field: 'fechaSolicitud', sortable: true },
                { name: 'uuid', align: 'center', label: 'UUID', field: 'uuid', sortable: true },
                { name: 'estatusSolicitud', align: 'center', label: 'Estatus', field: 'estatusSolicitud', sortable: true },
                { name: 'Acciones', align: 'center', label: 'Acciones', field: 'Acciones', sortable: true },
            ],
        }
    },
    computed: {
        token() {
            return this.$store.state.usuario;
        },

        historial() {
            return this.$store.state.listaHistorialDescargasUUIDStore
        },

        rutaAxios() {
            return this.$store.state.rutaMongoStore
        },
    },

    watch: {
    },
    methods: {
        async solicitarDescarga() {

            this.$q.loading.show({ message: '<b>Generando Solicitud...' })

            let solicitud = {
                rfc: this.token.rfc,
                solicitud: '',
                uuid: this.uuid,
                usuario: this.token.nombre,
                estatusSolicitud: ''
            }

            console.log(solicitud)
            try {
                let response = await axios.post(this.rutaAxios + 'Descargas/PostSolicitudUUID/erp_' + this.token.rfc, solicitud);
                console.log(response.data)
                solicitud.sollicitud = response.data
                solicitud.estatusSolicitud = "Solicitud Realizada"

                let objeto = {
                    rfc: this.token.rfc,
                    solicitud: response.data,
                    fechaSolicitud: new Date(),
                    uuid: this.uuid,
                    estatusSolicitud: "Solicitud Realizada"
                }

                this.$store.state.listaHistorialDescargasUUIDStore.push(objeto);

                let array = this.$store.state.listaHistorialDescargasUUIDStore
                this.$store.state.listaHistorialDescargasUUIDStore = array.sort(((b, a) => b.fechaSolicitud - a.fechaSolicitud))

                this.$q.loading.hide()
                this.$q.notify({ type: 'positive', message: 'Solicitud creada correctamente.' })

            } catch (error) {
                console.log(error);
                this.$q.loading.hide()
                this.$q.notify({ type: 'negative', message: error })
            }
        },

        async getHistorial() {
            this.$store.state.listaHistorialDescargasUUIDStore = []
            this.$q.loading.show({ message: '<b>Consultando datos...' })
            try {
                let response = await axios.post(this.rutaAxios + 'Descargas/GetHistorialDescargasUUID/erp_' + this.token.rfc);
                console.log(response.data)

                let array = response.data
                this.$store.state.listaHistorialDescargasUUIDStore = array.sort(((a, b) => b.fechaSolicitud - a.fechaSolicitud))

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
                tipoSolicitud: ''
            }
            console.log(objetoActualizar)
            this.$q.loading.show({ message: '<b>Actualizando solicitud...' })
            try {
                let response = await axios.put(this.rutaAxios + 'Descargas/PutActualizaEstatus/erp_' + this.token.rfc, objetoActualizar);
                console.log(response.data)

                if (response.data.mensaje == 'Solicitud Aceptada' && response.data.codigoEstadoSolicitud != '5002') {
                    item.estatusSolicitud = 'Listo para Descargar'

                }
                else if (response.data.codigoEstadoSolicitud == '5002') {
                    item.estatusSolicitud = 'Se ha alcanzado el límite de solicitudes, con el mismo criterio'
                    item.solicitudPaquete = ''
                }
                else {
                    item.estatusSolicitud = response.data.mensaje
                }


                let indice = this.$store.state.listaHistorialDescargasUUIDStore.findIndex(x => x.solicitud === item.solicitud);
                Object.assign(this.$store.state.listaHistorialDescargasUUIDStore[indice], item)

                let array = this.$store.state.listaHistorialDescargasUUIDStore
                this.$store.state.listaHistorialDescargasUUIDStore = array.sort(((a, b) => b.fechaSolicitud - a.fechaSolicitud))

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
                solicitudPaquete: item.solicitudPaquete
            }
            console.log(objetoDescargar)
            this.$q.loading.show({ message: '<b>Descargando solicitud...' })
            try {
                let response = await axios.post(this.rutaAxios + 'Descargas/DescargarSolicitud/erp_' + this.token.rfc, objetoDescargar);
                console.log(response.data)

                if (response.data.mensaje == 'Se han descargado satisfactoriamente las facturas') {
                    item.estatusSolicitud = 'Descargado'
                } else {
                    item.estatusSolicitud = response.data.mensaje
                }

                let indice = this.$store.state.listaHistorialDescargasCFDIStore.findIndex(x => x.solicitud === item.solicitud);
                Object.assign(this.$store.state.listaHistorialDescargasCFDIStore[indice], item);

                let array = this.$store.state.listaHistorialDescargasCFDIStore
                this.$store.state.listaHistorialDescargasCFDIStore = array.sort(((a, b) => b.fechaSolicitud - a.fechaSolicitud))

                this.$q.loading.hide()

            } catch (error) {
                console.log(error);
                this.$q.loading.hide()
            }
        },
        descargar(item) {
            console.log(item)
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