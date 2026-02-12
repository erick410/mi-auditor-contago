<template>
    <div class="q-pa-md">
        <!-- DIALOG DE CARGANDO -->
        <q-dialog v-model="dialog" persistent transition-show="scale" transition-hide="scale">
            <q-card style="width: 200px">
                <q-card-section>
                    <div class="row justify-center">
                        <span>{{ dialogtext }}</span>
                        <q-spinner-dots color="primary" size="lg" />
                    </div>
                </q-card-section>
            </q-card>
        </q-dialog>

        <q-card flat class="my-card">
            <q-card-section>
                <div class="row no-wrap items-center q-mt-md q-pa-sm">
                    <q-btn push color="red-14" @click="CloseDialog" icon="mdi-close" rounded flat size="18px" padding="xs">
                        <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                            :offset="[10, 10]">Cerrar</q-tooltip>
                    </q-btn>
                    <!-- <q-space /> -->
                    <div class="text-h6">{{ comparativa.textoComparativa }}</div>
                    <!-- <q-toolbar-title><span class="text-weight-bold">{{ comparativa.textoComparativa }}</span></q-toolbar-title> -->
                    <q-space />
                    <q-btn push color="green-10" @click="PostComparativa" icon="mdi-content-save-check-outline" rounded flat
                        size="18px" padding="xs">
                        <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                            :offset="[10, 10]">Guardar</q-tooltip>
                    </q-btn>
                    <q-separator color="primary" inset />
                </div>
            </q-card-section>
            <q-separator color="primary" size="5px" />

            <q-card-section>
                <div class="row">
                    <div class="col self-end">
                        <span>Enero</span>
                    </div>
                    <div class="col">
                        <q-field v-model="comparativa.comparativa.eneroCargo" label="Cargo" dense class="q-mr-md">
                            <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                                <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                    v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                            </template>
                        </q-field>
                    </div>
                    <div class="col">
                        <q-field v-model="comparativa.comparativa.eneroFavor" label="Favor" dense>
                            <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                                <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                    v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                            </template>
                        </q-field>
                    </div>
                </div>

                <div class="row">
                    <div class="col self-end">
                        <span class="q-mt-sm">Febrero</span>
                    </div>
                    <div class="col">
                        <q-field v-model="comparativa.comparativa.febreroCargo" label="Cargo" dense class="q-mr-md">
                            <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                                <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                    v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                            </template>
                        </q-field>
                    </div>
                    <div class="col">
                        <q-field v-model="comparativa.comparativa.febreroFavor" label="Favor" dense>
                            <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                                <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                    v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                            </template>
                        </q-field>
                    </div>
                </div>

                <div class="row">
                    <div class="col self-end">
                        <span class="q-mt-sm">Marzo</span>
                    </div>
                    <div class="col">
                        <q-field v-model="comparativa.comparativa.marzoCargo" label="Cargo" dense class="q-mr-md">
                            <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                                <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                    v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                            </template>
                        </q-field>
                    </div>
                    <div class="col">
                        <q-field v-model="comparativa.comparativa.marzoFavor" label="Favor" dense>
                            <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                                <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                    v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                            </template>
                        </q-field>
                    </div>
                </div>

                <div class="row">
                    <div class="col self-end">
                        <span class="q-mt-sm">Abril</span>
                    </div>
                    <div class="col">
                        <q-field v-model="comparativa.comparativa.abrilCargo" label="Cargo" dense class="q-mr-md">
                            <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                                <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                    v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                            </template>
                        </q-field>
                    </div>
                    <div class="col">
                        <q-field v-model="comparativa.comparativa.abrilFavor" label="Favor" dense>
                            <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                                <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                    v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                            </template>
                        </q-field>
                    </div>
                </div>

                <div class="row">
                    <div class="col self-end">
                        <span class="q-mt-sm">Mayo</span>
                    </div>
                    <div class="col">
                        <q-field v-model="comparativa.comparativa.mayoCargo" label="Cargo" dense class="q-mr-md">
                            <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                                <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                    v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                            </template>
                        </q-field>
                    </div>
                    <div class="col">
                        <q-field v-model="comparativa.comparativa.mayoFavor" label="Favor" dense>
                            <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                                <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                    v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                            </template>
                        </q-field>
                    </div>
                </div>

                <div class="row">
                    <div class="col self-end">
                        <span class="q-mt-sm">Junio</span>
                    </div>
                    <div class="col">
                        <q-field v-model="comparativa.comparativa.junioCargo" label="Cargo" dense class="q-mr-md">
                            <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                                <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                    v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                            </template>
                        </q-field>
                    </div>
                    <div class="col">
                        <q-field v-model="comparativa.comparativa.junioFavor" label="Favor" dense>
                            <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                                <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                    v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                            </template>
                        </q-field>
                    </div>
                </div>

                <div class="row">
                    <div class="col self-end">
                        <span class="q-mt-sm">Julio</span>
                    </div>
                    <div class="col">
                        <q-field v-model="comparativa.comparativa.julioCargo" label="Cargo" dense class="q-mr-md">
                            <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                                <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                    v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                            </template>
                        </q-field>
                    </div>
                    <div class="col">
                        <q-field v-model="comparativa.comparativa.julioFavor" label="Favor" dense>
                            <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                                <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                    v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                            </template>
                        </q-field>
                    </div>
                </div>

                <div class="row">
                    <div class="col self-end">
                        <span class="q-mt-sm">Agosto</span>
                    </div>
                    <div class="col">
                        <q-field v-model="comparativa.comparativa.agostoCargo" label="Cargo" dense class="q-mr-md">
                            <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                                <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                    v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                            </template>
                        </q-field>
                    </div>
                    <div class="col">
                        <q-field v-model="comparativa.comparativa.agostoFavor" label="Favor" dense>
                            <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                                <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                    v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                            </template>
                        </q-field>
                    </div>
                </div>

                <div class="row">
                    <div class="col self-end">
                        <span class="q-mt-sm">Septiembre</span>
                    </div>
                    <div class="col">
                        <q-field v-model="comparativa.comparativa.septiembreCargo" label="Cargo" dense class="q-mr-md">
                            <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                                <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                    v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                            </template>
                        </q-field>
                    </div>
                    <div class="col">
                        <q-field v-model="comparativa.comparativa.septiembreFavor" label="Favor" dense>
                            <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                                <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                    v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                            </template>
                        </q-field>
                    </div>
                </div>

                <div class="row">
                    <div class="col self-end">
                        <span class="q-mt-sm">Octubre</span>
                    </div>
                    <div class="col">
                        <q-field v-model="comparativa.comparativa.octubreCargo" label="Cargo" dense class="q-mr-md">
                            <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                                <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                    v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                            </template>
                        </q-field>
                    </div>
                    <div class="col">
                        <q-field v-model="comparativa.comparativa.octubreFavor" label="Favor" dense>
                            <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                                <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                    v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                            </template>
                        </q-field>
                    </div>
                </div>

                <div class="row">
                    <div class="col self-end">
                        <span class="q-mt-sm">Noviembre</span>
                    </div>
                    <div class="col">
                        <q-field v-model="comparativa.comparativa.noviembreCargo" label="Cargo" dense class="q-mr-md">
                            <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                                <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                    v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                            </template>
                        </q-field>
                    </div>
                    <div class="col">
                        <q-field v-model="comparativa.comparativa.noviembreFavor" label="Favor" dense>
                            <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                                <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                    v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                            </template>
                        </q-field>
                    </div>
                </div>

                <div class="row">
                    <div class="col self-end">
                        <span class="q-mt-sm">Diciembre</span>
                    </div>
                    <div class="col">
                        <q-field v-model="comparativa.comparativa.diciembreCargo" label="Cargo" dense class="q-mr-md">
                            <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                                <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                    v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                            </template>
                        </q-field>
                    </div>
                    <div class="col">
                        <q-field v-model="comparativa.comparativa.diciembreFavor" label="Favor" dense>
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
import moment from 'moment'
import { Money } from 'v-money'

export default {
    components: {
        Money
    },
    data() {
        return {
            columns: [
                { name: 'mes', align: 'left', label: 'Mes', field: 'mes' },
                { name: 'comparativa', align: 'right', label: 'Importe', field: 'comparativa' },
            ],
            dataSueldos: [],
            moneyFormatForComponent: {
                decimal: '.',
                thousands: ',',
                precision: 2,
                masked: true
            },

            //DATOS DE CARGANDO
            dialog: false,
            dialogtext: '',
        }
    },
    computed: {
        token() {
            return this.$store.state.usuario;
        },

        comparativa() {
            return this.$store.state.comparativaStore;
        },

        rutaAxios() {
            return this.$store.state.rutaMongoStore
        },

    },
    created() {

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

        formatMayus(value) {
            return value.toUpperCase()
        },

        CloseDialog() {
            this.$emit('CloseDialogDetalles')
        },

        async PostComparativa() {
            console.log(this.comparativa)
            try {
                let ObjData = {
                    tipo: this.comparativa.tipo,
                    anio: this.comparativa.año,
                    comparativa: [
                        { mes: 'ENERO', importe: 0, ivaCargo: this.comparativa.comparativa.eneroCargo, ivaFavor: this.comparativa.comparativa.eneroFavor },
                        { mes: 'FEBRERO', importe: 0, ivaCargo: this.comparativa.comparativa.febreroCargo, ivaFavor: this.comparativa.comparativa.febreroFavor },
                        { mes: 'MARZO', importe: 0, ivaCargo: this.comparativa.comparativa.marzoCargo, ivaFavor: this.comparativa.comparativa.marzoFavor },
                        { mes: 'ABRIL', importe: 0, ivaCargo: this.comparativa.comparativa.abrilCargo, ivaFavor: this.comparativa.comparativa.abrilFavor },
                        { mes: 'MAYO', importe: 0, ivaCargo: this.comparativa.comparativa.mayoCargo, ivaFavor: this.comparativa.comparativa.mayoFavor },
                        { mes: 'JUNIO', importe: 0, ivaCargo: this.comparativa.comparativa.junioCargo, ivaFavor: this.comparativa.comparativa.junioFavor },
                        { mes: 'JULIO', importe: 0, ivaCargo: this.comparativa.comparativa.julioCargo, ivaFavor: this.comparativa.comparativa.julioFavor },
                        { mes: 'AGOSTO', importe: 0, ivaCargo: this.comparativa.comparativa.agostoCargo, ivaFavor: this.comparativa.comparativa.agostoFavor },
                        { mes: 'SEPTIEMBRE', importe: 0, ivaCargo: this.comparativa.comparativa.septiembreCargo, ivaFavor: this.comparativa.comparativa.septiembreFavor },
                        { mes: 'OCTUBRE', importe: 0, ivaCargo: this.comparativa.comparativa.octubreCargo, ivaFavor: this.comparativa.comparativa.octubreFavor },
                        { mes: 'NOVIEMBRE', importe: 0, ivaCargo: this.comparativa.comparativa.noviembreCargo, ivaFavor: this.comparativa.comparativa.noviembreFavor },
                        { mes: 'DICIEMBRE', importe: 0, ivaCargo: this.comparativa.comparativa.diciembreCargo, ivaFavor: this.comparativa.comparativa.diciembreFavor },
                    ]
                };
                console.log(ObjData)
                let response = await axios.post(this.rutaAxios + 'Comparativa/PostComparativaAsync/erp_' + this.token.rfc, ObjData);
                this.CloseDialog();
            } catch (error) {
                console.log(error)
            }
        },
    },
}
</script>
<style>
.my-card {
    width: 100%;
}
</style>