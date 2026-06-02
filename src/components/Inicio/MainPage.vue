<template>
    <q-layout view="hHh lpR fFf">
        <q-header v-if="logueado" style="background:#E74747">
            <q-toolbar style="min-height:60px">
                <q-btn flat dense round @click="irInicio" style="background:rgba(255,255,255,.12)">
                    <q-icon name="mdi-home" color="white" size="23px" />
                </q-btn>
                <q-toolbar-title>
                    <span style="font-size:16px;font-weight:500;letter-spacing:.01em">
                        CONTAGO MI AUDITOR
                    </span>
                </q-toolbar-title>
                <div class="rfc-chip" style="font-size:16px;">{{ $store.state.usuario.rfc }}</div>
                <q-btn flat round dense class="header-btn" @click="irSolicitudCancelacion()">
                    <q-icon name="mdi-bell" color="white" size="23px" />
                    <q-badge color="red-8" floating style="font-size:9px">
                        {{ cuentaSolicitudes }}
                    </q-badge>
                    <q-tooltip content-style="font-size:13px">
                        Solicitudes de cancelación
                    </q-tooltip> 
                </q-btn>

                <q-btn flat round dense class="header-btn" @click="drawerEmpresas = !drawerEmpresas">
                    <q-icon name="mdi-domain" color="white" size="23px" />
                    <q-tooltip content-style="font-size:13px">Empresas</q-tooltip>
                </q-btn>

                <q-btn flat round dense class="header-btn" @click="drawerPerfil = !drawerPerfil">
                    <q-icon name="mdi-account" color="white" size="23px" />
                    <q-tooltip content-style="font-size:13px">Perfil</q-tooltip>
                </q-btn>
            </q-toolbar>
        </q-header>

        <!-- DRAWER PERFIL -->
        <q-drawer :width="320" v-model="drawerPerfil" behavior="mobile" side="right" bordered v-if="logueado"
            style="background:#fff">
            <drawerPerfil />
        </q-drawer>

        <!-- DRAWER EMPRESAS -->
        <q-drawer :width="320" v-model="drawerEmpresas" behavior="mobile" side="right" bordered v-if="logueado"
            style="background:#fff">
            <drawerEmpresas />
        </q-drawer>

        <q-page-container >
            <router-view />
        </q-page-container>

        <q-footer v-if="logueado" style="background:#1a1a1a;height:28px;display:flex;align-items:center;padding:0 20px">
            <span style="font-size:11px;color:#555">Contago Mi Auditor © 2026</span>
        </q-footer>
    </q-layout>
</template>

<script>
import axios from 'axios'
import drawerPerfil from '../DrawerPerfil/DrawerPerfil.vue'
import drawerEmpresas from '../DrawerEmpresas/DrawerEmpresas.vue'
import { QSpinnerCube } from 'quasar'

export default {
    components: { drawerPerfil, drawerEmpresas },

    data() {
        return {
            drawerEmpresas: false,
            drawerPerfil: false,
            cuentaSolicitudes: 0,
        }
    },

    computed: {
        logueado() { return this.$store.state.usuario },
        token() { return this.$store.state.empresaStore },
        rutaAxios() { return this.$store.state.rutaMongoStore },
    },

    created() {
        this.$store.dispatch('autoLogin')
        this.getSolicitudes()
    },

    methods: {
        irInicio() {
            this.$router.push({ name: 'Home' })
        },
        irSolicitudCancelacion() {
            this.$router.push({ name: 'SolicitudCancelacion' })
        },
        async getSolicitudes() {
            try {
                this.$q.loading.show({
                    spinner: QSpinnerCube,
                    spinnerColor: 'red-8',
                    spinnerSize: 140,
                    message: 'Consultando...'
                })
                const { data } = await axios.get(
                    `${this.rutaAxios}Comprobante/GetSolicitudesCancelacionAsync/${this.logueado.rfc}`
                )
                this.cuentaSolicitudes = data.length
            } catch (e) {
                console.error(e)
            } finally {
                this.$q.loading.hide()
            }
        }
    }
}
</script>

<style>
.rfc-chip {
    font-size: 12px;
    color: rgba(255, 255, 255, .75);
    background: rgba(255, 255, 255, .12);
    padding: 4px 12px;
    border-radius: 20px;
    margin-right: 6px;
}

.header-btn {
    width: 36px !important;
    height: 36px !important;
    border-radius: 8px !important;
}

.header-btn:hover {
    background: rgba(255, 255, 255, .12) !important;
}

.drawer-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    border-bottom: 0.5px solid #e3e3e3;
}

.drawer-title {
    font-size: 14px;
    font-weight: 600;
    color: #111;
}
</style>