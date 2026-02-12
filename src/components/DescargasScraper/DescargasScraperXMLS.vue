<template>
    <q-page class=" q-pa-md">
        <div class="row q-pa-md">
            <div class="col-12 col-md-2">
             <q-input v-model="fechaIFormated" dense filled label="Fecha Inicial" class="q-mr-sm" name="event">
                <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                    <q-date v-model="fechaI" @input="UltimoDiaMes">
                        <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Ok" color="primary" flat />
                        </div>
                    </q-date>
                </q-popup-proxy>
            </q-input>
             
            </div>
            <div class="col-12 col-md-2">
             <q-input v-model="fechaFFormated" dense filled label="Fecha Inicial" class="q-mr-sm" name="event">
                <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                    <q-date v-model="fechaF">
                        <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Ok" color="primary" flat />
                        </div>
                    </q-date>
                </q-popup-proxy>
            </q-input>
            
            
            </div>
            <div class="col-12 col-md-2">
                <q-select class="q-mr-md" filled dense :options="itemsTipo" v-model="tipo" label="Tipo">
                </q-select>
            </div>
            
            <div class="col-12 col-md-6 text-right">
                <q-btn color="green" class="q-mr-md" icon="mdi-check-circle" label="Solicitar" @click="solicitarDescarga()">
                    <q-tooltip>
                        Solicitar Descarga
                    </q-tooltip>
                </q-btn>
                <q-btn color="blue" icon="mdi-update" label="Actualizar" @click="getHistorial()">
                    <q-tooltip>
                        Actualizar Solicitudes
                    </q-tooltip>
                </q-btn>
            </div>
        </div>
        <q-table class="shadow-0" :filter="filter" title="Historial de Descargas CFDI" sortBy="fechaSolicitud" :descending="false"
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
                    <q-td key="fechaSolicitud" :props="props">{{ formatDate(props.row.fechaSolicitud) }}</q-td>
                    <q-td key="tipo" :props="props">{{ props.row.tipo }}</q-td>
                    <q-td key="fechaInicial" :props="props">{{ props.row.fechaInicial }}</q-td>
                    <q-td key="fechaFinal" :props="props">{{ props.row.fechaFinal }}</q-td>
                    <q-td key="numComprobantesDescargados" :props="props">{{ props.row.numComprobantesDescargados
                        }}</q-td>
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
                itemsAnios: ['2026','2025','2024', '2023', '2022', '2021', '2020', '2019', '2018'],
                itemsMes: [
                    { label: 'ENERO', value: '01' },
                    { label: 'FEBRERO', value: '02' },
                    { label: 'MARZO', value: '03' },
                    { label: 'ABRIL', value: '04' },
                    { label: 'MAYO', value: '05' },
                    { label: 'JUNIO', value: '06' },
                    { label: 'JULIO', value: '07' },
                    { label: 'AGOSTO', value: '08' },
                    { label: 'SEPTIEMBRE', value: '09' },
                    { label: 'OCTUBRE', value: '10' },
                    { label: 'NOVIEMBRE', value: '11' },
                    { label: 'DICIEMBRE', value: '12' },
                ],

                selectedAnio: null,
                selectedMes: null,

                fechaI: new Date(),
                fechaF: new Date(),
                horaI: '00:00:00',
                horaF: '23:59:59',

                itemsTipoComprobante: [
                    { tipo: 'Todos', value: '' },
                    { tipo: 'Ingreso', value: 'I' },
                    { tipo: 'Egreso', value: 'E' },
                    { tipo: 'Traslado', value: 'T' },
                    { tipo: 'Nomina', value: 'N' },
                    { tipo: 'Pago', value: 'P' }
                ],
                itemsEstado: [
                    { estatus: 'Todos', value: '' },
                    { estatus: 'Cancelado', value: 0 },
                    { estatus: 'Vigente', value: 1 },
                ],
                itemsTipo: ['Emitidos', 'Recibidos'
                ],
                TipoComprobante: { tipo: 'Todos', value: '' },
                EstadoComprobante: '',
                tipo: 'Emitidos',

                columns: [
                    { name: 'fechaSolicitud', align: 'center', label: 'Fecha de Solicitud', field: 'fechaSolicitud', sortable: true },
                    { name: 'tipo', align: 'center', label: 'Tipo', field: 'tipo', sortable: true },
                    { name: 'fechaInicial', align: 'center', label: 'Fecha Inicial', field: 'fechaInicial', sortable: true },
                    { name: 'fechaFinal', align: 'center', label: 'Fecha Final', field: 'fechaFinal', sortable: true },
                    { name: 'numComprobantesDescargados', align: 'center', label: 'Comprobantes Descargados', field: 'numComprobantesDescargados', sortable: true },
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
           historial(){
            return  this.$store.state.listaHistorialDescargasCFDIStore;
           }

        },

        watch: {
        },
        created() {
            this.getHistorial();
        },
        methods: {
            async solicitarDescarga() {
                this.$q.loading.show({ message: '<b>Generando descarga, espere...' })
                let fI = moment(this.fechaI).format('YYYY-MM-DD')
                let fF = moment(this.fechaF).format('YYYY-MM-DD')

                let yearI = moment(this.fechaI).year();
                let monthI = moment(this.fechaI).month(); // Los meses en moment.js son 0 indexados (0-11)
                let yearF = moment(this.fechaF).year();
                let monthF = moment(this.fechaF).month();

                //VALIDAMOS QUE NO SE PUEDAN DESCARGAR EJERCICIOS ANTERIORES
                const userA = this.token.nombre.toLowerCase();
                const anioActual = new Date().getFullYear();
                const anioAnterior = anioActual - 1;
                //console.log(this.token.nombre, anioActual, anioAnterior);
                if(userA != "admin" && yearI < anioAnterior){
                    this.$q.notify({ type: 'warning', position:'top-right', message: 'No es posible descargar el periodo seleccionado, para mayo información cominiquese con nosotros al : 222 622 6540' })
                    this.$q.loading.hide()                    
                    return;
                }
                if (yearI === yearF && monthI === monthF) {
                } else {
                    this.$q.notify({ type: 'warning', message: 'Las dos fechas deben coincidir en mes y año.' })
                    return
                }

                let respuesta = await this.DescargaScrapper();
                if(respuesta == 'error'){
                    this.$q.loading.hide()
                    return;
                }
                await this.delay(2000);
                let objDescargado = await this.EncarpetaDescarga(fI, fF);
                await this.delay(2000);
                await this.PostHistorial(objDescargado);
                this.$q.loading.hide()

            },

            async DescargaScrapper(){
                let fI = moment(this.fechaI).format('YYYY-MM-DD')
                let fF = moment(this.fechaF).format('YYYY-MM-DD')
                try {
                    let response = await axios.get('https://api-scrapper-a.contago.com.mx/Solicitud/' + fI + '/' + fF + '/' + this.tipo + '/' + this.token.rfc);
                    //console.log(response.data)
                    let numComprobantes = response.data

                    if(typeof(numComprobantes) == 'number'){
                        this.$q.notify({ type: 'positive', position:'top-right', message: 'Descarga generada.' })
                        return numComprobantes;
                    }else {
                        this.$q.notify({ type: 'negative', position:'top-right', message: 'Conexión fallida con el portal del SAT. Inténtelo de nuevo.' })
                        return 'error';
                    }  
                } catch (error) {
                    console.log(error);
                    let error1 = error.message 
                    if(error1.includes('Network Error') ){
                        this.$q.notify({ type: 'warning', position:'top-right', message: 'Descarga incompleta. Se interrumpio la conexión, solicite la descarga nuevamente.' })
                    this.$q.loading.hide()
                    }else{
                        this.$q.notify({ type: 'negative', position:'top-right', message: error })
                    this.$q.loading.hide()

                        return 'error';
                    }
                    this.$q.loading.hide()
                }
            },

            async EncarpetaDescarga(fI, fF) {
                this.$q.loading.show({ message: '<b>Guardando XMLS, espere...' })
                try {
                    let response = await axios.post('Descargas/PostEncarpetaXML/' + this.token.rfc);
                    //console.log('guardados',response)
                    this.$q.loading.hide()
                    let objeto = {
                        tipo : this.tipo,
                        fechaSolicitud  :new Date(),
                        fechaInicial : fI,
                        fechaFinal  :fF,
                        numComprobantesDescargados : response.data,
                    }
                    this.$q.notify({ type: 'positive', position:'top-right', message: 'Archivos guardados exitosamente.' })
                    return objeto;
                } catch (error) {
                    console.log(error);
                    this.$q.notify({ type: 'negative', position:'top-right', message: 'Error...' })
                }
            },

            async PostHistorial(solicitud) {
                try {
                    let response = await axios.post('Descargas/PostSolicitudScrapper/erp_' + this.token.rfc, solicitud);
                    //console.log(response)
                    this.$store.state.listaHistorialDescargasCFDIStore.push(solicitud);
                    this.$q.notify({ type: 'positive', position:'top-right', message: 'Solicitud registrada.' })
                } catch (error) {
                    console.log(error);
                    this.$q.notify({ type: 'negative', position:'top-right', message: 'Error al registrar solicitud.' })
                }
            },

            UltimoDiaMes() {
                const fecha = new Date(this.fechaI);
                const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
                this.fechaF = ultimoDia;
            },

            FormatDates(value) {
                let fecha_ = value.replace('T', ' ').replace('Z', ' ');
                let listo = new Date(fecha_ + ' UTC');

                moment.locale('es-mx');

                return moment.utc(listo).format('DD-MMMM-YYYY HH:mm:ss');
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

            async getHistorial() {
                this.$store.state.listaHistorialDescargasCFDIStore = []
                this.$q.loading.show({ message: '<b>Consultando datos...' })
                try {
                    let response = await axios.post('Descargas/GetHistorialDescargasScraper/erp_' + this.token.rfc);
                    //console.log(response.data)
                    this.$store.state.listaHistorialDescargasCFDIStore = response.data
                    this.$q.loading.hide()

                } catch (error) {
                    console.log(error);
                    this.$q.loading.hide()
                }
            },
        
            delay(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }
            
        }
    }
</script>