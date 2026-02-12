<template>
    <q-layout view="hHh lpR fFf">
        <q-header elevated>
            <q-toolbar>
                <q-btn flat dense round icon="mdi-home" aria-label="Menu" @click="$router.push({ name: 'Home' })" />
                <q-toolbar-title>
                    <div class="text-h6 text-weight-bolder">GASOLINERÍA</div>
                </q-toolbar-title>
                <div class="text-h6 q-mr-lg">{{ $store.state.usuario.rfc }}</div>
                <q-btn flat class="q-mx-sm" round dense icon="mdi-domain" @click="drawerEmpresas = !drawerEmpresas" />
                <q-btn flat  class="q-mx-sm" round dense icon="mdi-account" @click="drawerPerfil = !drawerPerfil" />
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
        }
    },

    watch: {
        isDarkMode(val) {
            // Cambia entre modo oscuro y claro
            this.$q.dark.set(val);
        }
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
    }
}
</script>
