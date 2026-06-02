<template>
    <q-layout view="hHh lpR fFf">
        <q-header v-if="logueado" style="background:#E74747">
            <q-toolbar style="min-height:60px">

                <q-btn flat dense round @click="irInicio" style="background:rgba(255,255,255,.12)">
                    <q-icon name="mdi-home" color="white" size="23px" />
                </q-btn>

                <q-toolbar-title>
                    <span style="font-size:16px;font-weight:500;letter-spacing:.01em">
                        GASOLINERÍA
                    </span>
                </q-toolbar-title>

                <div class="rfc-chip "  style="font-size:16px;">{{ $store.state.usuario.rfc }}</div>

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

        <!-- DRAWER DERECHO -->
        <q-drawer :width="350" v-model="drawerPerfil" behavior="mobile" side="right" bordered>
            <drawerPerfil></drawerPerfil>
        </q-drawer>

        <!-- DRAWER EMPRESAS -->
        <q-drawer :width="350" v-model="drawerEmpresas" behavior="mobile" side="right" bordered >
            <drawerEmpresas></drawerEmpresas>
        </q-drawer>

        <!-- DRAWER IZQUIERDO -->
        <q-drawer v-model="leftDrawerOpen" show-if-above :mini="miniState" @mouseover="miniState = false"
            @mouseout="miniState = true" :width="270" :breakpoint="500" bordered content-class="bg-grey-3">
            <q-scroll-area class="fit" :horizontal-thumb-style="{ opacity: 0 }">
                <q-list padding>

                    <q-item active clickable v-ripple @click="irGasolineria">
                        <q-item-section avatar>
                            <q-icon name="mdi-file-document-plus" />
                        </q-item-section>
                        <q-item-section>
                            Gasolinería
                        </q-item-section>
                    </q-item>
                    <q-separator />

                    <q-item active clickable v-ripple @click="irVentasYCompras">
                        <q-item-section avatar>
                            <q-icon name="mdi-file-document-plus" />
                        </q-item-section>
                        <q-item-section>
                            Ventas / Compras
                        </q-item-section>
                    </q-item>
                    <q-separator />
<!-- 
                    <q-item active clickable v-ripple @click="irMonederoElectronico">
                        <q-item-section avatar>
                            <q-icon name="mdi-cash-fast" />
                        </q-item-section>
                        <q-item-section>
                            Monedero Electrónico
                        </q-item-section>
                    </q-item>
                    <q-separator /> -->

                    <q-item active clickable v-ripple @click="irVentasSinDespacho">
                        <q-item-section avatar>
                            <q-icon name="mdi-file-document-plus" />
                        </q-item-section>
                        <q-item-section>
                            Ventas sin despacho
                        </q-item-section>
                    </q-item>
                    <q-separator />

                    <q-item active clickable v-ripple @click="irReporteLitrosGasolineria">
                        <q-item-section avatar>
                            <q-icon name="mdi-file-document-plus" />
                        </q-item-section>
                        <q-item-section>
                            Reporte Litros
                        </q-item-section>
                    </q-item>
                    <q-separator />

                    <q-item active clickable v-ripple @click="irReporteSubTotalGasolineria">
                        <q-item-section avatar>
                            <q-icon name="mdi-file-document-plus" />
                        </q-item-section>
                        <q-item-section>
                            Reporte Utilidad
                        </q-item-section>
                    </q-item>
                    <q-separator />
                    <q-item active clickable v-ripple @click="irReporteViajes">
                        <q-item-section avatar>
                            <q-icon name="mdi-file-document-plus" />
                        </q-item-section>
                        <q-item-section>
                            Reporte de Viajes
                        </q-item-section>
                    </q-item>
                    <q-separator />

                </q-list>
            </q-scroll-area>
        </q-drawer>

        <q-page-container>
            <router-view />
        </q-page-container>

        <q-footer style="height: 30px;" bordered class="bg-dark text-white">
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

export default {

    name: 'MainLayout',
    components: {
        drawerPerfil,
        drawerEmpresas
    },
    data() {
        return {
            drawerEmpresas:false,
            drawerPerfil: false,
            isDarkMode: false,
            leftDrawerOpen: false,
            drawer: false,
            miniState: true,
            cuentaSolicitudes: 0,
        }
    },
    computed: {
        logueado() { return this.$store.state.usuario },
        token() { return this.$store.state.usuario },
        rutaAxios() { return this.$store.state.rutaMongoStore },
    },
    watch: {
        isDarkMode(val) {
            // Cambia entre modo oscuro y claro
            this.$q.dark.set(val);
        }
    },
    created() {
        this.getSolicitudes()
    },
    methods: {
        irGasolineria() {
            this.$router.push({ name: 'Gasolineria' })
        },

        irVentasYCompras() {
            this.$router.push({ name: 'VentasYComprasGasolineria' })
        },

        irMonederoElectronico() {
            this.$router.push({ name: 'MonederoElectronico' })
        },

        irVentasSinDespacho() {
            this.$router.push({ name: 'VentasSinDespacho' })
        },

        irReporteLitrosGasolineria() {
            this.$router.push({ name: 'ReporteLitrosGasolineria' })
        },

        irReporteSubTotalGasolineria() {
            this.$router.push({ name: 'ReporteSubTotalGasolineria' })
        },
        irInicio() {
            this.$router.push({ name: 'Home' })
        },
        irSolicitudCancelacion() {
            this.$router.push({ name: 'SolicitudCancelacion' })
        },
        irReporteViajes() {
            this.$router.push({ name: 'ReporteViajes' })
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
                    `${this.rutaAxios}Comprobante/GetSolicitudesCancelacionAsync/${this.token.rfc}`
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
