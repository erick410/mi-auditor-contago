<template>
    <div>
        <q-card>
            <q-toolbar class="full-width">
                <q-btn push color="red-10" icon="mdi-close-circle-outline" rounded flat size="18px" padding="xs"
                    v-close-popup>
                    <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                        :offset="[10, 10]">Cerrar</q-tooltip>
                </q-btn>

                <q-toolbar-title class="full-width">
                    <span class="text-weight-bold">{{ item.tipo }}</span>
                    {{ item.combustible }} {{ item.año }}
                </q-toolbar-title>

                <q-btn push color="green-9" @click="PostLitrosGasolineros" icon="mdi-content-save-check-outline" rounded
                    flat size="18px" padding="xs">
                    <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                        :offset="[10, 10]">Guardar</q-tooltip>
                </q-btn>
            </q-toolbar>

            <q-separator color="primary" size="5px" />
            <q-card-section>
                <div class="row">
                    <div class="col">
                        <q-field v-model="item.detalle[0].litros" :label="item.detalle[0].mes" dense class="q-mr-md"
                            outlined>
                            <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                                <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                    v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                            </template>
                        </q-field>
                    </div>
                </div>
            </q-card-section>

        </q-card>
    </div>
</template>
<script>
import axios from 'axios'
import { parseISO, parse, isSameMonth } from 'date-fns'
import * as XLSX from 'xlsx';
import { QSpinnerCube } from 'quasar';
import { Money } from 'v-money'

export default {
    components: {
        Money,
    },
    data() {
        return {
            moneyFormatForComponent: {
                decimal: '.',
                thousands: ',',
                precision: 3,
                masked: true
            },
        }
    },
    computed: {
        token() {
            return this.$store.state.usuario;
        },

        rutaAxios() {
            return this.$store.state.rutaMongoStore
        },

        item() {
            return this.$store.state.litrosGasolineriaStore;
        },

    },
    created() {

    },
    methods: {
        async PostLitrosGasolineros() {
            try {
                console.log(this.item)
                let ObjLitros = { ...this.item };
                let response = await axios.post(this.rutaAxios + 'Gasolineros/PostLitrosGasolinerosAsync/erp_' + this.token.rfc, ObjLitros)
                this.$q.notify({
                    progress: true,
                    message: 'Inventario inicial guardado con éxito',
                    type: 'positive',
                    position: 'top-right',
                    actions: [
                        { label: 'Cerrar', color: 'white', handler: () => { /* ... */ } }
                    ]
                })
                this.closeDialog();
            } catch (error) {
                this.$q.notify({
                    progress: true,
                    message: 'Error al guardar',
                    type: 'negative',
                    position: 'top-right',
                    actions: [
                        { label: 'Cerrar', color: 'white', handler: () => { /* ... */ } }
                    ]
                })
                console.log(error);
            }
        },

        closeDialog() {
            this.$emit('closeDialogDetalle')
        },
    },
}
</script>