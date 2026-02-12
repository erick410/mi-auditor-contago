<template>
    <div class="q-pa-md">
        <q-card flat class="my-card">
            <q-card-section>
                <div class="row no-wrap items-center q-mt-md q-pa-sm">
                    <q-btn push color="red-14" @click="CloseDialog" icon="mdi-close" rounded flat size="18px" padding="xs">
                        <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                            :offset="[10, 10]">Cerrar</q-tooltip>
                    </q-btn>
                    <q-space />
                    <div class="text-h5">Cancelación</div>
                    <q-space />
                    <template v-if="estatusSat.estatusCancelacionSat === ''">
                        <q-btn push color="red-10" @click="ValidateCancelacion()" icon="mdi-send" rounded flat size="18px"
                            padding="xs">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Enviar Solicitud</q-tooltip>
                        </q-btn>
                    </template>
                    <template v-if="estatusSat.estatusCancelacionSat != ''">
                        <q-btn push color="amber-10" @click="PutEstatus()" icon="mdi-update" rounded flat size="18px"
                            padding="xs">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Actualizar estatus del
                                comprobante</q-tooltip>
                        </q-btn>
                    </template>
                </div>
                <q-separator color="primary" size="5px" />
            </q-card-section>
            <q-card-section>
                <div class="q-gutter-md row">
                    <div class="col">
                        <q-input outlined v-model="comprobante.serie" label="Serie" dense readonly />
                    </div>
                    <div class="col">
                        <q-input outlined v-model="comprobante.folio" label="Folio" dense readonly />
                    </div>
                    <div class="col-12">
                        <q-input outlined v-model="comprobante.receptor" label="Receptor" dense readonly />
                    </div>
                    <div class="col-12">
                        <q-input outlined v-model="comprobante.folioFiscal" label="Folio Fiscal" dense readonly />
                    </div>
                    <div class="col">
                        <q-input outlined v-model="estatusSat.estadoComprobante" label="Estatus" dense readonly />
                    </div>
                    <div class="col">
                        <q-input outlined v-model="estatusSat.tipoCancelacion" label="Tipo Cancelación" dense readonly />
                    </div>
                    <div class="col">
                        <q-input outlined v-model="estatusSat.esCancelable" label="Cancelable" dense readonly />
                    </div>
                    <div class="col-12">
                        <q-select outlined v-model="selectMotivoCancelacion" :options="itemsMotivosCancelacion" dense
                            options-dense option-label="descripcion" label="Motivo de Cancelación">
                        </q-select>
                    </div>
                </div>
            </q-card-section>
        </q-card>
    </div>
</template>
<script>
import axios from 'axios'
import { QSpinnerCube } from 'quasar'

export default {
    components: {

    },
    data() {
        return {
            itemsMotivosCancelacion: [
                // { clave: '01', descripcion: '01 | Comprobante emitido con errores con relación' },
                { clave: '02', descripcion: '02 | Comprobante emitido con errores sin relación' },
                { clave: '03', descripcion: '03 | No se llevó a cabo esta operación' },
            ],
            selectMotivoCancelacion: null,

            estatusSat: {
                estadoComprobante: '',
                tipoCancelacion: '',
                esCancelable: '',
                estatusCancelacionSat: '',
            }
        }
    },
    computed: {
        token() {
            return this.$store.state.usuario;
        },

        rutaAxios() {
            return this.$store.state.rutaMongoStore
        },

        comprobante() {
            return this.$store.state.cancelacionStore;
        },

    },
    created() {
        this.PostEstatusSat()
    },
    methods: {
        formatCurrency(value) {
            return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        },

        formatDate(value) {
            let fecha_ = value.replace('T', ' ')
            let fecha_1 = fecha_.replace('Z', ' ')
            let listo = new Date(fecha_1);
            moment.locale('es-mx');
            return moment(listo).format('DD-MMMM-YYYY HH:mm:ss')
        },

        CloseDialog() {
            this.$emit('CloseDialogCancelacion')
        },

        async ValidateCancelacion() {
            if (!this.selectMotivoCancelacion) {
                this.ShowNotifsWarning('Seleccione el motivo de la cancelación');
                return;
            }
            this.showNotification();
            // await this.PostCancelacion();
            // this.OpenDialogLoading();
        },

        showNotification() {
            this.$q.dialog({
                title: 'Confirmar',
                message: 'Desea cancelar el comprobante?',
                ok: {
                    push: true,
                    color: 'positive'
                },
                cancel: {
                    push: true,
                    color: 'negative'
                },
                persistent: true
            }).onOk(() => {
                this.PostSolicitudCancelacion();
            }).onCancel(() => {
                // console.log('>>>> Cancel')
            }).onDismiss(() => {
                // console.log('I am triggered on both OK and Cancel')
            })
        },

        ShowNotifsWarning(mensaje) {
            this.$q.notify({
                progress: true,
                message: mensaje,
                type: 'warning',
                position: 'top-right',
                actions: [
                    { label: 'Cerrar', color: 'white', handler: () => { /* ... */ } }
                ]
            })
        },

        OpenDialogLoading() {
            this.$q.loading.show({
                spinner: QSpinnerCube,
                spinnerColor: 'red-8',
                spinnerSize: 140,
                // backgroundColor: 'purple',
                message: 'Consultando...',
                // messageColor: 'black'
            })
        },

        async PostEstatusSat() {
            this.OpenDialogLoading();
            let comprobante = this.comprobante;
            try {
                let ObjSolicitud = {
                    rfcEmisor: this.token.rfc,
                    rfcReceptor: comprobante.receptor.split('|')[0].trim(),
                    folioFiscal: comprobante.folioFiscal,
                    total: 0,
                    motivoCancelacion: this.selectMotivoCancelacion,
                }
                console.log(ObjSolicitud)

                let response = await axios.post(this.rutaAxios + 'Comprobante/PostEstatusComprobanteAsync/', ObjSolicitud)
                console.log(response.data)
                this.estatusSat = response.data;
                this.$q.loading.hide()
            } catch (error) {
                console.log(error)
                this.$q.loading.hide()
            }
        },

        async PostSolicitudCancelacion() {
            this.$q.loading.show({
                spinner: QSpinnerCube,
                spinnerColor: 'red-8',
                spinnerSize: 140,
                // backgroundColor: 'purple',
                message: 'Enviando solicitud de cancelación...',
                // messageColor: 'black'
            })
            try {
                let comprobante = this.comprobante;
                let ObjSolicitud = {
                    rfcEmisor: this.token.rfc,
                    rfcReceptor: comprobante.receptor.split('|')[0].trim(),
                    folioFiscal: comprobante.folioFiscal,
                    total: 0,
                    motivoCancelacion: this.selectMotivoCancelacion,
                }
                let response = await axios.post(this.rutaAxios + 'Comprobante/PostCancelacionAsync/', ObjSolicitud);
                console.log(response.data)
                this.$q.loading.hide()
                this.$q.notify({
                    progress: true,
                    message: response.data,
                    type: 'positive',
                    position: 'top-right',
                    actions: [
                        { label: 'Cerrar', color: 'white', handler: () => { /* ... */ } }
                    ]
                });
                this.CloseDialog();
            } catch (error) {
                console.log(error)
                this.$q.loading.hide()
                this.$q.notify({
                    progress: true,
                    message: error,
                    type: 'warning',
                    position: 'top-right',
                    actions: [
                        { label: 'Cerrar', color: 'white', handler: () => { /* ... */ } }
                    ]
                })
            }
        },

        async PutEstatus() {
            this.$q.loading.show({
                spinner: QSpinnerCube,
                spinnerColor: 'red-8',
                spinnerSize: 140,
                // backgroundColor: 'purple',
                message: 'Actualizando estatus...',
                // messageColor: 'black'
            })
            try {
                let comprobante = this.comprobante;
                let response = await axios.put(this.rutaAxios + 'Comprobante/PutCanceladosAsync/erp_' + this.token.rfc + '/comprobantes_pagos/' + comprobante.folioFiscal);
                this.$q.loading.hide()
                this.$q.notify({
                    progress: true,
                    message: 'Estatus actualizado con éxito.',
                    type: 'positive',
                    position: 'top-right',
                    actions: [
                        { label: 'Cerrar', color: 'white', handler: () => { /* ... */ } }
                    ]
                });
                this.CloseDialog();
            } catch (error) {
                console.log(error)
                this.$q.loading.hide()
                this.$q.notify({
                    progress: true,
                    message: 'Error al actualizar, intente nuevamente',
                    type: 'warning',
                    position: 'top-right',
                    actions: [
                        { label: 'Cerrar', color: 'white', handler: () => { /* ... */ } }
                    ]
                })
            }
        },
    },
}
</script>