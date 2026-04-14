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
                        COMPRAS
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
            @mouseout="miniState = true" :width="280" :breakpoint="500" bordered content-class="bg-grey-3">
            <q-scroll-area class="fit" :horizontal-thumb-style="{ opacity: 0 }">
                <q-list padding>
                    <q-item active clickable v-ripple @click="irCompras">
                        <q-item-section avatar>
                            <q-icon name="mdi-file-document-minus" />
                        </q-item-section>
                        <q-item-section>
                            Compras
                        </q-item-section>
                    </q-item>
                    <q-separator />

                    <q-item active clickable v-ripple @click="irFacturacionMesG">
                        <q-item-section avatar>
                            <q-icon name="mdi-file-document-plus" />
                        </q-item-section>
                        <q-item-section>
                            Facturación por Mes
                        </q-item-section>
                        <q-separator />
                    </q-item>
                    <q-separator />

                    <q-item active clickable v-ripple @click="irFacturacionPeriodoG">
                        <q-item-section avatar>
                            <q-icon name="mdi-file-document-plus" />
                        </q-item-section>
                        <q-item-section>
                            Facturación por Periodo
                        </q-item-section>
                        <q-separator />
                    </q-item>
                    <q-separator />

                    <q-item active clickable v-ripple @click="irFacturacionRfcG">
                        <q-item-section avatar>
                            <q-icon name="mdi-file-document-plus" />
                        </q-item-section>
                        <q-item-section>
                            Facturación por RFC
                        </q-item-section>
                        <q-separator />
                    </q-item>
                    <q-separator />


                    <q-item active clickable v-ripple @click="irCuentasPagar">
                        <q-item-section avatar>
                            <q-icon name="mdi-cash-minus" />
                        </q-item-section>
                        <q-item-section>
                            Cuentas por Pagar
                        </q-item-section>
                    </q-item>
                    <q-separator />
                    <q-item active clickable v-ripple @click="irCuentasPagarRfc">
                        <q-item-section avatar>
                            <q-icon name="mdi-cash-minus" />
                        </q-item-section>
                        <q-item-section>
                            Cuentas por Pagar por RFC
                        </q-item-section>
                    </q-item>
                    <q-separator />

                    <q-item active clickable v-ripple @click="irComplementosDePagoRecibido">
                        <q-item-section avatar>
                            <q-icon name="mdi-cash-minus" />
                        </q-item-section>
                        <q-item-section>
                            Complementos de PAgo
                        </q-item-section>
                    </q-item>
                    <q-separator />

                    <q-item active clickable v-ripple @click="irConceptosPeriodoG">
                        <q-item-section avatar>
                            <q-icon name="mdi-cash-minus" />
                        </q-item-section>
                        <q-item-section>
                            Conceptos por Periodo
                        </q-item-section>
                    </q-item>
                    <q-separator />
                    <q-item active clickable v-ripple @click="irConceptosPeriodoDescG">
                        <q-item-section avatar>
                            <q-icon name="mdi-cash-minus" />
                        </q-item-section>
                        <q-item-section>
                            Conceptos por Descripción
                        </q-item-section>
                    </q-item>
                    <q-separator />

                    <q-item active clickable v-ripple @click="irConceptosPeriodoProveedor">
                        <q-item-section avatar>
                            <q-icon name="mdi-cash-minus" />
                        </q-item-section>
                        <q-item-section>
                            Conceptos por Proveedor
                        </q-item-section>
                    </q-item>
                    <q-separator />

                    <q-item active clickable v-ripple @click="irConceptosAcumuladoG">
                        <q-item-section avatar>
                            <q-icon name="mdi-cash-minus" />
                        </q-item-section>
                        <q-item-section>
                            Conceptos Acumulados
                        </q-item-section>
                    </q-item>
                    <q-separator />

                    <q-item active clickable v-ripple @click="irIvaAcreditadoFacturado">
                        <q-item-section avatar>
                            <q-icon name="mdi-cash-minus" />
                        </q-item-section>
                        <q-item-section>
                            IVA Acreditado Facturado
                        </q-item-section>
                    </q-item>
                    <q-separator />

                    <q-item active clickable v-ripple @click="irAnticiposG">
                        <q-item-section avatar>
                            <q-icon name="mdi-page-previous" />
                        </q-item-section>
                        <q-item-section>
                            Anticipos
                        </q-item-section>
                    </q-item>
                    <q-separator />

                    <q-item active clickable v-ripple @click="irAnticiposProveedor">
                        <q-item-section avatar>
                            <q-icon name="mdi-account-multiple-minus-outline" />
                        </q-item-section>
                        <q-item-section>
                            Anticipos por proveedor
                        </q-item-section>
                    </q-item>
                    <q-separator />
                    <!-- <q-item active clickable v-ripple @click="irReportePagos">
                        <q-item-section avatar>
                            <q-icon name="mdi-file-document" />
                        </q-item-section>
                        <q-item-section>
                            Reporte Pagos
                        </q-item-section>
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
                drawerEmpresas: false,
                drawerPerfil: false,
                isDarkMode: false,
                leftDrawerOpen: false,
                drawer: false,
                miniState: true,
                dialogAsistente: false,
                cuentaSolicitudes: 0,

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
            irCompras() {
                this.$router.push({ name: 'Compras' })
            },

            irFacturacionMesG() {
                this.$router.push({ name: 'FacturacionMesG' })
            },

            irFacturacionPeriodoG() {
                this.$router.push({ name: 'FacturacionPeriodoG' })
            },

            irFacturacionRfcG() {
                this.$router.push({ name: 'FacturacionRfcG' })
            },

            irCuentasPagar() {
                this.$router.push({ name: 'CuentasXPagar' })
            },

            irCuentasPagarRfc() {
                this.$router.push({ name: 'CuentasXPagarRfc' })
            },

            irComplementosDePagoRecibido() {
                this.$router.push({ name: 'ComplementosDePagoRecibido' })
            },

            irConceptosPeriodoG() {
                this.$router.push({ name: 'ConceptosPeriodoG' })
            },

            irConceptosPeriodoDescG() {
                this.$router.push({ name: 'ConceptosPeriodoDescG' })
            },

            irConceptosPeriodoProveedor() {
                this.$router.push({ name: 'ConceptosPeriodoProveedor' })
            },

            irConceptosAcumuladoG() {
                this.$router.push({ name: 'ConceptosAcumuladoG' })
            },

            irIvaAcreditadoFacturado() {
                this.$router.push({ name: 'IvaAcreditadoFacturado' })
            },

            irAnticiposG() {
                this.$router.push({ name: 'AnticiposG' })
            },

            irAnticiposProveedor() {
                this.$router.push({ name: 'AnticiposProveedor' })
            },

            irReportePagos() {
                this.$router.push({ name: 'ReportePagos' })
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