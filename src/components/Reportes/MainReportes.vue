<template>
    <q-layout view="hHh lpR fFf">
    <q-dialog v-model="dialogAsistente" position="bottom">
            <Index style="max-width: 600px; min-width: 600px;"></Index>
        </q-dialog>
        <q-header elevated>
            <q-toolbar>
                <q-btn flat dense round icon="mdi-home" aria-label="Menu" @click="$router.push({ name: 'Home' })" />
                <q-toolbar-title>
                    <div class="text-h6 text-weight-bolder">REPORTES</div>
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
            @mouseout="miniState = true" :width="350" :breakpoint="500" bordered content-class="bg-grey-3">
            <q-scroll-area class="fit" :horizontal-thumb-style="{ opacity: 0 }">
                <q-list padding>
                    <q-item active clickable v-ripple @click="irDocumentosEmitidos">
                        <q-item-section avatar>
                            <q-icon name="mdi-file-document" />
                        </q-item-section>
                        <q-item-section>
                            Documentos Emitidos
                        </q-item-section>
                    </q-item>
                    <q-separator />
                    <q-item active clickable v-ripple @click="irDocumentosRecibidos">
                        <q-item-section avatar>
                            <q-icon name="mdi-file-document" />
                        </q-item-section>
                        <q-item-section>
                            Documentos Recibidos
                        </q-item-section>
                    </q-item>
                    <q-separator />
                    <q-item active clickable v-ripple @click="irPagos">
                        <q-item-section avatar>
                            <q-icon name="mdi-file-document" />
                        </q-item-section>
                        <q-item-section>
                            Pagos Clientes
                        </q-item-section>
                    </q-item>
                    <q-separator />
                    <q-item active clickable v-ripple @click="irPagosProveedores">
                        <q-item-section avatar>
                            <q-icon name="mdi-file-document" />
                        </q-item-section>
                        <q-item-section>
                            Pagos Proveedores
                        </q-item-section>
                    </q-item>
                    <q-separator />
                   <q-item active clickable v-ripple @click="irContabilidadDocumentosEmitidos">
                        <q-item-section avatar>
                            <q-icon name="mdi-file-document" />
                        </q-item-section>
                        <q-item-section>
                            Contabilidad Documentos Emitidos
                        </q-item-section>
                    </q-item>
                    <q-separator />
                    <q-item active clickable v-ripple @click="irContabilidadDocumentosRecibidos">
                        <q-item-section avatar>
                            <q-icon name="mdi-file-document" />
                        </q-item-section>
                        <q-item-section>
                            Contabilidad Documentos Recibidos
                        </q-item-section>
                    </q-item>
                    <q-separator />
                    <q-item active clickable v-ripple @click="irNominaDetalles">
                        <q-item-section avatar>
                            <q-icon name="mdi-file-document" />
                        </q-item-section>
                        <q-item-section>
                            Nomina Detalles
                        </q-item-section>
                    </q-item>
                    <q-separator />
                    <q-item active clickable v-ripple @click="irContabilidadNominaDetalles">
                        <q-item-section avatar>
                            <q-icon name="mdi-file-document" />
                        </q-item-section>
                        <q-item-section>
                            Contabilidad Nomina Detalles
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
            this.$q.dark.set(val);
        }
    },
    methods: {
        irDocumentosEmitidos() {
            this.$router.push({ name: 'DocumentosEmitidos' })
        },
        irDocumentosRecibidos() {
            this.$router.push({ name: 'DocumentosRecibidos' })
        },
        irPagos() {
            this.$router.push({ name: 'ReportePagos' })
        },
        irPagosProveedores(){
            this.$router.push({ name: 'ReportePagosProveedores' })
        },
          irContabilidadDocumentosEmitidos() {
            this.$router.push({ name: 'ContabilidadDocumentosEmitidos' })
        },
        irContabilidadDocumentosRecibidos() {
            this.$router.push({ name: 'ContabilidadDocumentosRecibidos' })
        },
        irNominaDetalles() {
            this.$router.push({ name: 'ReporteNominaDetalles' })
        },
        irContabilidadNominaDetalles() {
            this.$router.push({ name: 'ReporteContabilidadNominaDetalles' })
        },
    }
}
</script>
