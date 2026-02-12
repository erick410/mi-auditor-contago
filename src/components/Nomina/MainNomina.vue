<template>
    <q-layout view="hHh lpR fFf">
    <q-dialog v-model="dialogAsistente" position="bottom">
            <Index style="max-width: 600px; min-width: 600px;"></Index>
        </q-dialog>

        <q-header elevated>
            <q-toolbar>
                <q-btn flat dense round icon="mdi-home" aria-label="Menu" @click="$router.push({ name: 'Home' })" />
                <q-toolbar-title>
                    <div class="text-h6 text-weight-bolder">NÓMINA</div>
                </q-toolbar-title>
                <div class="text-h6 q-mr-lg">{{ $store.state.usuario.rfc }}</div>
                <q-btn flat class="q-mx-sm" round dense icon="mdi-chat-question" @click="dialogAsistente = true" /> 
                <q-btn flat class="q-mx-sm" round dense icon="mdi-domain" @click="drawerEmpresas = !drawerEmpresas" />
                <q-btn flat class="q-mx-sm" round dense icon="mdi-account" @click="drawerPerfil = !drawerPerfil" />
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
            @mouseout="miniState = true" :width="290" :breakpoint="500" bordered content-class="bg-grey-3">
            <q-scroll-area class="fit" :horizontal-thumb-style="{ opacity: 0 }">
                <q-list padding>

                    <q-item active clickable v-ripple @click="irNomina">
                        <q-item-section avatar>
                            <q-icon name="mdi-account-cash" />
                        </q-item-section>
                        <q-item-section>
                            Nómina
                        </q-item-section>
                    </q-item>

                    <q-item active clickable v-ripple @click="irReporteIsr">
                        <q-item-section avatar>
                            <q-icon name="mdi-chart-box-outline" />
                        </q-item-section>
                        <q-item-section>
                            Reporte ISR
                        </q-item-section>
                    </q-item>

                    <q-item active clickable v-ripple @click="irReporteTrabajadores">
                        <q-item-section avatar>
                            <q-icon name="mdi-account-hard-hat-outline" />
                        </q-item-section>
                        <q-item-section>
                            Reporte Trabajadores
                        </q-item-section>
                    </q-item>

                    <q-item active clickable v-ripple @click="irReporteConceptosSat">
                        <q-item-section avatar>
                            <q-icon name="mdi-format-list-bulleted" />
                        </q-item-section>
                        <q-item-section>
                            Reporte por Conceptos del SAT
                        </q-item-section>
                    </q-item>

                    <q-item active clickable v-ripple @click="irReporteConceptosInterno">
                        <q-item-section avatar>
                            <q-icon name="mdi-format-list-bulleted-type" />
                        </q-item-section>
                        <q-item-section>
                            Reporte por Conceptos Interno
                        </q-item-section>
                    </q-item>

                    <q-separator />

                    <q-item active clickable v-ripple @click="irReporteSubsidio">
                        <q-item-section avatar>
                            <q-icon name="mdi-account-cash" />
                        </q-item-section>
                        <q-item-section>
                            Reporte Subsidio
                        </q-item-section>
                    </q-item>
                    <q-separator />

                    <q-item active clickable v-ripple @click="irListaDeRaya">
                        <q-item-section avatar>
                            <q-icon name="mdi-account-cash" />
                        </q-item-section>
                        <q-item-section>
                            Lista de Raya
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
import Index from '../Asistente/Index.vue'


export default {

    name: 'MainLayout',
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

        }
    },

    watch: {
        isDarkMode(val) {
            // Cambia entre modo oscuro y claro
            this.$q.dark.set(val);
        }
    },
    methods: {
        irNomina() {
            this.$router.push({ name: 'Nomina' })
        },

        irReporteIsr() {
            this.$router.push({ name: 'ReporteIsr' })
        },

        irReporteTrabajadores() {
            this.$router.push({ name: 'ReporteTrabajadores' })
        },

        irReporteConceptosSat() {
            this.$router.push({ name: 'ReporteConceptosSat' })
        },

        irReporteConceptosInterno() {
            this.$router.push({ name: 'ReporteConceptosInterno' })
        },

        irReporteSubsidio() {
            this.$router.push({ name: 'ReporteSubsidio' })
        },

        irListaDeRaya() {
            this.$router.push({ name: 'ListaDeRaya' })
        },
    }
}
</script>
