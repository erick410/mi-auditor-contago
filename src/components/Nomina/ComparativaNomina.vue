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
            <q-card-section>
                <q-field v-model="comparativa.comparativa.enero" label="Enero">
                    <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                        <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                            v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                    </template>
                </q-field>
                <q-field v-model="comparativa.comparativa.febrero" label="Febrero">
                    <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                        <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                            v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                    </template>
                </q-field>
                <q-field v-model="comparativa.comparativa.marzo" label="Marzo">
                    <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                        <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                            v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                    </template>
                </q-field>
                <q-field v-model="comparativa.comparativa.abril" label="Abril">
                    <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                        <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                            v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                    </template>
                </q-field>
                <q-field v-model="comparativa.comparativa.mayo" label="Mayo">
                    <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                        <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                            v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                    </template>
                </q-field>
                <q-field v-model="comparativa.comparativa.junio" label="Junio">
                    <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                        <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                            v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                    </template>
                </q-field>
                <q-field v-model="comparativa.comparativa.julio" label="Julio">
                    <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                        <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                            v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                    </template>
                </q-field>
                <q-field v-model="comparativa.comparativa.agosto" label="Agosto">
                    <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                        <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                            v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                    </template>
                </q-field>
                <q-field v-model="comparativa.comparativa.septiembre" label="Septiembre">
                    <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                        <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                            v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                    </template>
                </q-field>
                <q-field v-model="comparativa.comparativa.octubre" label="Octubre">
                    <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                        <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                            v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                    </template>
                </q-field>
                <q-field v-model="comparativa.comparativa.noviembre" label="Noviembre">
                    <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                        <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                            v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                    </template>
                </q-field>
                <q-field v-model="comparativa.comparativa.diciembre" label="Diciembre">
                    <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                        <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                            v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                    </template>
                </q-field>
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
                        { mes: 'ENERO', importe: this.comparativa.comparativa.enero, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'FEBRERO', importe: this.comparativa.comparativa.febrero, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'MARZO', importe: this.comparativa.comparativa.marzo, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'ABRIL', importe: this.comparativa.comparativa.abril, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'MAYO', importe: this.comparativa.comparativa.mayo, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'JUNIO', importe: this.comparativa.comparativa.junio, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'JULIO', importe: this.comparativa.comparativa.julio, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'AGOSTO', importe: this.comparativa.comparativa.agosto, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'SEPTIEMBRE', importe: this.comparativa.comparativa.septiembre, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'OCTUBRE', importe: this.comparativa.comparativa.octubre, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'NOVIEMBRE', importe: this.comparativa.comparativa.noviembre, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'DICIEMBRE', importe: this.comparativa.comparativa.diciembre, ivaCargo: 0, ivaFavor: 0 },
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