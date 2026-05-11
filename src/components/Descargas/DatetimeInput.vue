<template>
    <div class="dti-wrap">

        <!-- INPUT DISPLAY -->
        <q-input dense outlined readonly :value="displayValue" :label="label" :color="color" class="dti-input"
            @click="abrirFecha">
            <template v-slot:prepend>
                <q-icon :name="iconName" :color="color" size="16px" class="cursor-pointer" @click.stop="abrirFecha" />
            </template>
            <template v-slot:append>
                <q-icon v-if="displayValue" name="mdi-clock-check-outline" size="13px" color="grey-5" />
            </template>
        </q-input>

        <!-- POPUP FECHA -->
        <q-dialog v-model="showFecha" no-backdrop-dismiss>
            <q-card  style="width:auto" >
                <q-date v-model="fechaInterna" :color="color" mask="YYYY-MM-DD" today-btn flat
                    @input="onFechaSeleccionada" />
                <q-card-actions align="right" class="q-pt-none">
                    <q-btn flat dense label="Cancelar" color="grey-7" v-close-popup />
                    <q-btn flat dense label="Siguiente →" :color="color" @click="pasarAHora" />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <!-- POPUP HORA -->
        <q-dialog v-model="showHora" no-backdrop-dismiss>
            <q-card style="width:auto">
                <q-time v-model="horaInterna" :color="color" with-seconds format24h flat />
                <q-card-actions align="right" class="q-pt-none">
                    <q-btn flat dense label="← Fecha" color="grey-7" @click="volverAFecha" />
                    <q-btn flat dense label="Aceptar" :color="color" @click="confirmar" />
                </q-card-actions>
            </q-card>
        </q-dialog>

    </div>
</template>

<script>
import moment from 'moment'

export default {
    name: 'DateTimeInput',

    props: {
        // v-model recibe/emite un objeto { fecha: 'YYYY-MM-DD', hora: 'HH:mm:ss' }
        value: {
            type: Object,
            default: () => ({ fecha: '', hora: '' }),
        },
        label: { type: String, default: 'Fecha y hora' },
        color: { type: String, default: 'indigo' },
        iconName: { type: String, default: 'mdi-calendar-clock' },
    },

    data() {
        return {
            showFecha: false,
            showHora: false,
            fechaInterna: (this.value && this.value.fecha) ? this.value.fecha : '' || '',
            horaInterna: (this.value && this.value.hora) ? this.value.hora : '' || '00:00:00',
        }
    },

    watch: {
        value(v) {
            this.fechaInterna = v?.fecha || ''
            this.horaInterna = v?.hora || '00:00:00'
        },
    },

    computed: {
        displayValue() {
            if (!(this.value && this.value.fecha) ? this.value.fecha : '') return ''
            moment.locale('es-mx')
            const dt = moment(this.value.fecha + ' ' + (this.value.hora || '00:00:00'), 'YYYY-MM-DD HH:mm:ss')
            return dt.isValid() ? dt.format('DD-MMM-YY HH:mm:ss') : ''
        },
    },

    methods: {
        abrirFecha() {
            this.fechaInterna = (this.value && this.value.fecha) ? this.value.fecha : '' || moment().format('YYYY-MM-DD')
            this.horaInterna = (this.value && this.value.hora) ? this.value.hora : '' || '00:00:00'
            this.showFecha = true
        },

        // Cuando selecciona una fecha: si es hoy → hora = ahora
        onFechaSeleccionada(fecha) {
            this.fechaInterna = fecha
            const hoy = moment().format('YYYY-MM-DD')
            if (fecha === hoy) {
                this.horaInterna = moment().format('HH:mm:ss')
            }
        },

        pasarAHora() {
            if (!this.fechaInterna) return
            this.showFecha = false
            this.$nextTick(() => { this.showHora = true })
        },

        volverAFecha() {
            this.showHora = false
            this.$nextTick(() => { this.showFecha = true })
        },

        confirmar() {
            this.showHora = false
            this.$emit('input', {
                fecha: this.fechaInterna,
                hora: this.horaInterna || '00:00:00',
            })
        },
    },
}
</script>

<style scoped>
.dti-wrap {
    display: flex;
    flex-direction: column;
}

.dti-input {
    font-size: 0.82rem;
    cursor: pointer;
}

.dti-input :deep(input) {
    cursor: pointer;
}
</style>