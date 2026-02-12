<template>
    <q-layout view="hHh lpR fFf">
    <q-dialog v-model="dialogAsistente" position="bottom">
            <Index style="max-width: 600px; min-width: 600px;"></Index>
        </q-dialog>

        <q-header elevated v-if="logueado">
            <q-toolbar>
                <q-btn flat dense round icon="mdi-home" aria-label="Menu" @click="irInicio" />
                <q-toolbar-title>
                    <div class="text-h6 text-weight-bolder">CONTAGO MI AUDITOR</div>
                </q-toolbar-title>
                <!-- <q-toggle v-model="isDarkMode" label="Modo Oscuro" color="dark"></q-toggle> -->
                <div class="text-h6 q-mr-lg">{{ $store.state.usuario.rfc }}</div>
                <q-btn flat class="q-mx-sm" round dense icon="mdi-bell" @click="irSolicitudCancelacion()" >
                    <q-badge color="red-8" floating>{{cuentaSolicitudes}}</q-badge>
                    <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                    :offset="[10, 10]">Solicitudes de cancelación</q-tooltip>
                </q-btn>
                <!-- <q-btn flat class="q-mx-sm" round dense icon="mdi-download" @click="DescargaHerramienta()" >
                    <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                    :offset="[10, 10]">Obtener herramienta para descargar XML</q-tooltip>
                </q-btn>-->
                <q-btn flat class="q-mx-sm" round dense icon="mdi-chat-question" @click="dialogAsistente = true" /> 
                <q-btn flat class="q-mx-sm" round dense icon="mdi-domain" @click="drawerEmpresas = !drawerEmpresas" />
                <q-btn flat class="q-mx-sm" round dense icon="mdi-account" @click="drawerPerfil = !drawerPerfil" />

            </q-toolbar>
        </q-header>

        <!-- DRAWER DERECHO -->
        <q-drawer :width="350" v-model="drawerPerfil" behavior="mobile" side="right" bordered v-if="logueado">
            <drawerPerfil></drawerPerfil>
        </q-drawer>

        <!-- DRAWER EMPRESAS -->
        <q-drawer :width="350" v-model="drawerEmpresas" behavior="mobile" side="right" bordered v-if="logueado">
            <drawerEmpresas></drawerEmpresas>
        </q-drawer>

        <q-page-container>
            <router-view />
        </q-page-container>

        <q-footer style="height: 30px;" bordered class="bg-dark text-white" v-if="logueado">
            <q-toolbar>
                <q-toolbar-title>
                </q-toolbar-title>
            </q-toolbar>
        </q-footer>
    </q-layout>
</template>
  
<script>
import { ref } from 'vue'
import axios from "axios";
import drawerPerfil from "../DrawerPerfil/DrawerPerfil.vue"
import drawerEmpresas from "../DrawerEmpresas/DrawerEmpresas.vue"
import { QSpinnerCube } from 'quasar'
import Index from '../Asistente/Index.vue'

export default {

    components: {
        drawerPerfil,
        drawerEmpresas,
        Index

    },
    data() {
        return {
            drawerEmpresas:false,
            drawerPerfil: false,
            isDarkMode: false,
            leftDrawerOpen: false,
            drawer: false,
            miniState: true,
            dialogAsistente: false,

            cuentaSolicitudes: 0,
        }
    },

    watch: {
        isDarkMode(val) {
            this.$q.dark.set(val);
        }
    },
    computed: {
        logueado() {
            return this.$store.state.usuario;
        },

        token() {
            return this.$store.state.usuario;
        },

        rutaAxios() {
            return this.$store.state.rutaMongoStore
        },
    },
    created() {
        this.$store.dispatch("autoLogin");
        this.getSolicitudes();
    },
    methods: {
        irInicio() {
            this.$router.push({ name: 'Home' })
        },

        DescargaHerramienta(){
        try {
            const rutaArchivo = '/CargaXml.msi';
            const enlaceTemporal = document.createElement('a');
            enlaceTemporal.href = rutaArchivo;
            enlaceTemporal.download = 'CargaXml.msi';
            document.body.appendChild(enlaceTemporal);
            enlaceTemporal.click();
            document.body.removeChild(enlaceTemporal);
        } catch (error) {
            console.log(erro)
        }
        },
    
        async getSolicitudes() {
            try {
                this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'red-8', spinnerSize: 140, message: 'Consultando...' })
                const response = await axios.get(`${this.rutaAxios }Comprobante/GetSolicitudesCancelacionAsync/${this.token.rfc}`);
                this.cuentaSolicitudes = response.data.length;
                this.$q.loading.hide()
            } catch (error) {
                console.log(error)
                this.$q.loading.hide()
            }
        },
    
        irSolicitudCancelacion() {
            this.$router.push({ name: 'SolicitudCancelacion' })
        },
        
    }
}
</script>
  