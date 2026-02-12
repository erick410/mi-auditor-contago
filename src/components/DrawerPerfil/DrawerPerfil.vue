<template>
    <div>
        <q-dialog v-model="dialogSubirArchivos" persistent transition-show="flip-down" transition-hide="flip-up">
            <q-card>
                <q-card-section class="bg-primary">
                    <div class="row justify-between">
                        <div class="text-h6 text-white">Cargar Archivo</div>
                        <q-btn flat round dense class="q-mr-sm text-white" icon="mdi-close" @click="inicializar()">
                        </q-btn>
                    </div>
                </q-card-section>
                <template v-if="GuardandoSellos">
                    <q-card-section>
                        <div class="text-center q-py-xl">
                            <q-spinner-cube color="blue" size="5.5em" />
                        </div>
                    </q-card-section>
                </template>
                <template v-else>
                    <q-card-section class="q-pa-sm">
                        <q-select class="q-px-md q-pt-md q-pb-md" filled v-model="archivo.tipo" :options="['FIEL', 'CSD']"
                            label="Tipo de Archivo" />
                        <q-bar dense class="q-mx-md bg-primary text-white">
                            <q-space />
                            <div>Archivo .key</div>
                            <q-space />
                        </q-bar>

                        <q-input class="q-px-md q-pb-md" @input="uploadKey" filled type="file" accept=".key" />

                        <q-bar dense class="q-mx-md bg-primary text-white">
                            <q-space />
                            <div>Archivo .cer</div>
                            <q-space />
                        </q-bar>
                        <q-input class="q-px-md q-pb-md" @input="uploadCer" filled type="file" accept=".cer" />

                        <q-input class="q-px-md q-pb-md" label="Contraseña" v-model="archivo.password" filled
                            :type="isPwd ? 'password' : 'text'">
                            <template v-slot:append>
                                <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                                    @click="isPwd = !isPwd" />
                            </template>
                        </q-input>
                    </q-card-section>
                    <q-card-actions class="q-px-md">
                        <q-btn unelevated color="primary" class="full-width" label="Guardar" @click="validarArchivos()" />
                    </q-card-actions>
                </template>

            </q-card>
        </q-dialog>

        <q-img class="" src="https://cdn.quasar.dev/img/material.png" style="height: 150px">
            <div class="absolute-bottom bg-transparent">
                <q-avatar size="56px" class="q-mb-sm">
                    <img src="https://cdn.quasar.dev/img/boy-avatar.png">
                </q-avatar>
                <div class="text-weight-bold">{{ token.nombre }}</div>
                <div class="text-weight-bold">{{ token.rfc }}</div>
                <div class="text-weight-bold">{{ token.empresa }}</div>
            </div>
        </q-img>
        <q-list padding>
        <q-item v-ripple v-for="a in archivos"  :key="a.tipo">
                <q-item-section avatar top>
                    <q-avatar icon="mdi-file-certificate" :color="a.color" text-color="white">
                        <q-tooltip>
                            {{ a.estatus }}
                        </q-tooltip>
                    </q-avatar>
                </q-item-section>

                <q-item-section>
                    <q-item-label lines="1">{{ a.tipo }}</q-item-label>
                    <q-item-label caption>{{ formatDate(a.fechaVigencia) }}</q-item-label>
                </q-item-section>

                <q-item-section side>
                    <q-icon :name="a.icono" :color="a.iconoColor" />
                </q-item-section>

            </q-item>
            <q-separator></q-separator>
              <q-item clickable   v-ripple @click="irReportes">
                <q-item-section avatar>
                    <q-icon name="mdi-file-document"  /> 
                </q-item-section>

                <q-item-section>
                    Reportes
                </q-item-section>
            </q-item>
            <q-separator />

            <q-item clickable   v-ripple @click="irDescargas">
                <q-item-section avatar>
                    <q-icon name="mdi-download-box"  /> 
                </q-item-section>

                <q-item-section>
                    Descargas
                </q-item-section>
            </q-item>
            <q-separator />

            <q-item clickable   v-ripple @click="irSolicitudCancelacion">
                <q-item-section avatar>
                    <q-icon name="mdi-bell-cancel"  /> 
                </q-item-section>

                <q-item-section>
                    Solicitudes de Cancelación
                </q-item-section>
            </q-item>
            <q-separator />

            <q-item clickable v-ripple   @click="irCancelados">
                <q-item-section avatar>
                    <q-icon name="mdi-cancel"  />
                </q-item-section>

                <q-item-section>
                    Cancelados
                </q-item-section>
            </q-item>

            <q-separator />
           
           <q-item clickable v-ripple   @click="irlista69b">
                <q-item-section avatar>
                    <q-icon name="mdi-account-search"  />
                </q-item-section>

                <q-item-section>
                    Lista 69B
                </q-item-section>
            </q-item>
            <q-separator />

            <q-item clickable   v-ripple @click="abriDialog()">
                <q-item-section avatar>
                    <q-icon name="mdi-upload"   />
                </q-item-section>

                <q-item-section>
                    Cargar Sellos
                </q-item-section>
            </q-item>
            <q-separator />
            <q-item v-if="nombreUsuario == 'ADMIN'" clickable v-ripple @click="irAdministrador()">
                <q-item-section avatar>
                    <q-icon name="mdi-account-group" />
                </q-item-section> 
                <q-item-section>
                    Administrador de empresas
                </q-item-section> 
            </q-item>
            <q-separator />

            <q-item clickable v-ripple @click="irConfiguracion()">
                <q-item-section avatar>
                    <q-icon name="mdi-cog" />
                </q-item-section>
                <q-item-section>
                    Configuración
                </q-item-section>
            </q-item>

            <!--<q-item tag="label" v-ripple>
                <q-item-section>
                    <q-item-label>Modo Oscuro</q-item-label>
                </q-item-section>
                <q-item-section side>
                    <q-toggle color="blue" :value="modoOscuro" v-model="isDarkMode" val="battery" />
                </q-item-section>
            </q-item>-->
             <q-separator />
            <q-item clickable active v-ripple @click="salir()">
                <q-item-section>
                    Cerrar Sesión
                </q-item-section>
                <q-item-section avatar>
                    <q-icon name="mdi-logout" />
                </q-item-section>
            </q-item>
        </q-list>
    </div>
</template>
<script>
import { ref } from 'vue'
import axios from "axios";
import moment from 'moment'
import { parseISO, toDate, format } from 'date-fns'

export default {

    components: {
    },
    data() {
        return {
            isPwd: false,
            isDarkMode: false,
            dialogSubirArchivos: false,
            GuardandoSellos: false
        }
    },

    watch: {
        isDarkMode(val) {
            this.$store.state.modoOscuro = val
            this.$q.dark.set(val);
        }
    },
    computed: {
        token() {
            return this.$store.state.usuario;
        },
        archivos() {
            return this.$store.state.listaArchivosVigenciaStore
        },
        modoOscuro() {
            return this.$store.state.modoOscuro;
        },
        archivo() {
            return this.$store.state.archivosStore
        },
        rutaAxios() {
            return this.$store.state.rutaMongoStore
        },
        nombreUsuario(){
            let nombre = this.token.nombre.toUpperCase()
            return nombre
        }
    },
    created() {
        this.GetVigenciaArchivos();
    },
    methods: {
        irAdministrador(){
            this.$router.push("PanelAdministrador")
        },
        irlista69b(){
            this.$router.push({ name: "Lista69B" })
        },
        irCancelados() {
            this.$router.push({ name: "Cancelados" })
        },
        irDescargas() {
            this.$router.push({ name: "DescargasScraper" })
        },
        irReportes(){
            this.$router.push({ name: "DocumentosEmitidos" })
        },
        irSolicitudCancelacion() {
            this.$router.push({ name: 'SolicitudCancelacion' })
        },
        async validarArchivos() {
            // console.log(this.archivo)
            if(this.archivo.tipo == ''){
                return  this.$q.notify({ type: 'negative', message: 'Seleccione el tipo de archivo que ingresara.' })
            }
            this.GuardandoSellos = true
            try {
                let response = await axios.post('Validacion/PostValidarArchivos/erp_' + this.token.rfc + '/' + this.token.rfc, this.archivo);
                // console.log(response.data)
                this.GuardandoSellos = false
                this.$q.notify({ type: 'positive', message: 'Archivo guardado exitosamente.' })
                this.GetVigenciaArchivos();
                this.inicializar()
            } catch (error) {
                // console.log(error);
                this.GuardandoSellos = false
                this.$q.notify({ type: 'negative', message: error.response.data })
            }
        },
        async GetVigenciaArchivos() {
            this.$store.state.listaArchivosVigenciaStore = []
            try {
                let response = await axios.get('Validacion/GetVigenciaArchivos/erp_' + this.token.rfc);
                // console.log(response.data)
                this.$store.state.listaArchivosVigenciaStore = response.data
            } catch (error) {
                console.log(error);
            }
        },
        async salir() {
            this.$q.loading.show({ message: '<b>Cerrando Sesión...</b>' })

            let respuesta;
            try {
                respuesta = await axios.put(
                    "https://api-framework.contago.com.mx/api/Usuarios/actualizaSesion/" +
                    this.$store.state.usuario.nombre +
                    "/INACTIVA"
                );
                this.$q.loading.hide()
                this.$store.dispatch("salir");
                this.$store.state.listaEmpresasStore=[]
            } catch (err) {
                console.log(err);
                this.$q.loading.hide()

            }
        },

        inicializar() {
            this.dialogSubirArchivos = false

            let archivosStore = {
                tipo: '',
                nombreCer: '',
                archivoCer: {
                    base64: ''
                },
                nombreKey: '',
                archivoKey: {
                    base64: ''
                },
                password: '',
            }

            this.$store.state.archivosStore = archivosStore
        },
        async uploadKey(event) {
            // console.log(event)
            const file = event[0];
            try {
                const result = await this.convertBase64(file);
                // console.log(result)

                this.$store.state.archivosStore.archivoKey.base64 = result;
                this.$store.state.archivosStore.nombreKey = file.name;
                this.dialogKey = false
            } catch (error) {
                console.log('error')
                console.error(error);
                return;
            }
        },
        async uploadCer(event) {
            const file = event[0];
            try {
                const result = await this.convertBase64(file);
                this.$store.state.archivosStore.archivoCer.base64 = result;
                this.$store.state.archivosStore.nombreCer = file.name;
                this.dialogCer = false
            } catch (error) {
                console.log('error')
                console.error(error);
                return;
            }
        },
        convertBase64(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject(reader.error);
            });
        },
        irConfiguracion() {
            this.$router.push('Configuracion')
        },
        formatDate(value) {
            let fecha_ = value.replace('T', ' ')
            let fecha_1 = fecha_.replace('Z', ' ')
            let listo = new Date(fecha_1);

            moment.locale('es-mx');
            return moment(listo).format('YYYY-MM-DD HH:mm:ss')
        },
        abriDialog() {
            this.dialogSubirArchivos = true
        },
    }
}
</script>
  
