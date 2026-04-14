<template>
    <q-layout view="hHh lpR fFf">
    <q-dialog v-model="dialogAsistente" position="bottom">
            <Index style="max-width: 600px; min-width: 600px;"></Index>
        </q-dialog>

        <q-header v-if="logueado" style="background:#E74747">
            <q-toolbar style="min-height:60px">

                <q-btn flat dense round @click="irInicio" style="background:rgba(255,255,255,.12)">
                    <q-icon name="mdi-home" color="white" size="23px" />
                </q-btn>

                <q-toolbar-title>
                    <span style="font-size:16px;font-weight:500;letter-spacing:.01em">
                        INGRESOS
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
        <q-drawer :width="350" v-model="drawerEmpresas" behavior="mobile" side="right" bordered>
            <drawerEmpresas></drawerEmpresas>
        </q-drawer>

        <!-- DRAWER IZQUIERDO -->
        <q-drawer v-model="leftDrawerOpen" show-if-above :mini="miniState" @mouseover="miniState = false"
            @mouseout="miniState = true" :width="300" :breakpoint="500" bordered content-class="bg-grey-3">
            <q-scroll-area class="fit" :horizontal-thumb-style="{ opacity: 0 }">
                <q-list padding>

                    <q-item active clickable v-ripple @click="irIngresos">
                        <q-item-section avatar>
                            <q-icon name="mdi-file-document-plus" />
                        </q-item-section>
                        <q-item-section>
                            Ingresos
                        </q-item-section>
                    </q-item>
                    <q-separator />

                    <q-item active clickable v-ripple @click="irFacturacionMesI">
                        <q-item-section avatar>
                            <q-icon name="mdi-file-document-plus" />
                        </q-item-section>
                        <q-item-section>
                            Facturación por Mes
                        </q-item-section>
                        <q-separator />
                    </q-item>
                    <q-separator />

                    <q-item active clickable v-ripple @click="irFacturacionPeriodoI">
                        <q-item-section avatar>
                            <q-icon name="mdi-file-document-plus" />
                        </q-item-section>
                        <q-item-section>
                            Facturación por Periodo
                        </q-item-section>
                        <q-separator />
                    </q-item>
                    <q-separator />

                    <q-item active clickable v-ripple @click="irFacturacionRfcI">
                        <q-item-section avatar>
                            <q-icon name="mdi-file-document-plus" />
                        </q-item-section>
                        <q-item-section>
                            Facturación por RFC
                        </q-item-section>
                        <q-separator />
                    </q-item>
                    <q-separator />

                    <q-item active clickable v-ripple @click="irCuentasCobrar">
                        <q-item-section avatar>
                            <q-icon name="mdi-cash-plus" />
                        </q-item-section>
                        <q-item-section>
                            Cuentas por Cobrar
                        </q-item-section>
                    </q-item>
                    <q-separator />

                    <q-item active clickable v-ripple @click="irCuentasXCobrarRfc">
                        <q-item-section avatar>
                            <q-icon name="mdi-cash-plus" />
                        </q-item-section>
                        <q-item-section>
                            Cuentas por Cobrar por RFC
                        </q-item-section>
                    </q-item>
                    <q-separator />

                    <q-item active clickable v-ripple @click="irComplementosDePagoEmitidos">
                        <q-item-section avatar>
                            <q-icon name="mdi-cash-plus" />
                        </q-item-section>
                        <q-item-section>
                            Complementos de Pago
                        </q-item-section>
                    </q-item>
                    <q-separator />

                    <q-item active clickable v-ripple @click="irConceptosPeriodoI">
                        <q-item-section avatar>
                            <q-icon name="mdi-file-document-plus" />
                        </q-item-section>
                        <q-item-section>
                            Conceptos por Periodo
                        </q-item-section>
                        <q-separator />
                    </q-item>
                    <q-separator />

                    <q-item active clickable v-ripple @click="irConceptosPeriodoDescI">
                        <q-item-section avatar>
                            <q-icon name="mdi-file-document-plus" />
                        </q-item-section>
                        <q-item-section>
                            Conceptos por Descripción
                        </q-item-section>
                        <q-separator />
                    </q-item>
                    <q-separator />

                    <q-item active clickable v-ripple @click="irConceptosPeriodoClienteI">
                        <q-item-section avatar>
                            <q-icon name="mdi-file-document-plus" />
                        </q-item-section>
                        <q-item-section>
                            Conceptos por Cliente
                        </q-item-section>
                        <q-separator />
                    </q-item>
                    <q-separator />

                    <q-item active clickable v-ripple @click="irConceptosAcumuladoI">
                        <q-item-section avatar>
                            <q-icon name="mdi-file-document-plus" />
                        </q-item-section>
                        <q-item-section>
                            Conceptos Agrupados
                        </q-item-section>
                        <q-separator />
                    </q-item>
                    <q-separator />

                    <q-item active clickable v-ripple @click="irIvaTrasladadoFacturado">
                        <q-item-section avatar>
                            <q-icon name="mdi-file-document-plus" />
                        </q-item-section>
                        <q-item-section>
                            IVA Trasladado Facturado
                        </q-item-section>
                        <q-separator />
                    </q-item>
                    <q-separator />

                    <q-item active clickable v-ripple @click="irIngresosFacturadosSinImpuestos">
                        <q-item-section avatar>
                            <q-icon name="mdi-file-document-plus" />
                        </q-item-section>
                        <q-item-section>
                            Facturas Sin Impuestos
                        </q-item-section>
                        <q-separator />
                    </q-item>
                    <q-separator />

                    <q-item active clickable v-ripple @click="irAnticipos">
                        <q-item-section avatar>
                            <q-icon name="mdi-page-previous" />
                        </q-item-section>
                        <q-item-section>
                            ANTICIPOS
                        </q-item-section>
                        <q-separator />
                    </q-item>
                    <q-separator />

                    <q-item active clickable v-ripple @click="irAnticiposClientes">
                        <q-item-section avatar>
                            <q-icon name="mdi-account-multiple-plus-outline" />
                        </q-item-section>
                        <q-item-section>
                            ANTICIPOS POR CLIENTE
                        </q-item-section>
                        <q-separator />
                    </q-item>
                    <q-separator />

                    <q-item active clickable v-ripple @click="irFactoraje">
                        <q-item-section avatar>
                            <q-icon name="mdi-chart-multiple" />
                        </q-item-section>
                        <q-item-section>
                            FACTORAJE
                        </q-item-section>
                        <q-separator />
                    </q-item>
                    <q-separator />

                  <!--  <q-item active clickable v-ripple @click="irDocumentosEmitidos">
                        <q-item-section avatar>
                            <q-icon name="mdi-file-document" />
                        </q-item-section>
                        <q-item-section>
                            Documentos Emitidos
                        </q-item-section>
                        <q-separator />
                    </q-item>
                    <q-separator /> -->

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
import { QSpinnerCube } from 'quasar'

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
            cuentaSolicitudes:0
        }
    },
    computed: {
        logueado() { return this.$store.state.usuario },
        token() { return this.$store.state.usuario },
        rutaAxios() { return this.$store.state.rutaMongoStore },
    },
    created() {
        this.getSolicitudes()
    },
    watch: {
        isDarkMode(val) {
            // Cambia entre modo oscuro y claro
            this.$q.dark.set(val);
        }
    },
    methods: {
        irIngresos() {
            this.$router.push({ name: 'Ingresos' })
        },

        irCuentasCobrar() {
            this.$router.push({ name: 'CuentasXCobrar' })
        },

        irCuentasXCobrarRfc() {
            this.$router.push({ name: 'CuentasXCobrarRfc' })
        },

        irComplementosDePagoEmitidos() {
            this.$router.push({ name: 'ComplementosDePagoEmitidos' })
        },

        irFacturacionMesI() {
            this.$router.push({ name: 'FacturacionMesI' })
        },

        irFacturacionPeriodoI() {
            this.$router.push({ name: 'FacturacionPeriodoI' })
        },

        irFacturacionRfcI() {
            this.$router.push({ name: 'FacturacionRfcI' })
        },

        irConceptosPeriodoI() {
            this.$router.push({ name: 'ConceptosPeriodoI' })
        },

        irConceptosPeriodoDescI() {
            this.$router.push({ name: 'ConceptosPeriodoDescI' })
        },

        irConceptosPeriodoClienteI() {
            this.$router.push({ name: 'ConceptosPeriodoClienteI' })
        },

        irConceptosAcumuladoI() {
            this.$router.push({ name: 'ConceptosAcumuladoI' })
        },

        irIvaTrasladadoFacturado() {
            this.$router.push({ name: 'IvaTrasladadoFacturado' })
        },

        irIngresosFacturadosSinImpuestos() {
            this.$router.push({ name: 'IngresosFacturadosSinImpuestos' })
        },

        irAnticipos() {
            this.$router.push({ name: 'AnticiposI' })
        },

        irAnticiposClientes() {
            this.$router.push({ name: 'AnticiposClientes' })
        },

        irFactoraje() {
            this.$router.push({ name: 'Factoraje' })
        },

        irDocumentosEmitidos(){
            this.$router.push({ name: 'DocumentosEmitidos' })
        },
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
