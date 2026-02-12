<template>
    <div class="q-pa-md">
        <q-tabs v-model="tab" align="justify" narrow-indicator class="q-mb-lg">
            <q-tab class="text-green" name="emitidos" label="Emitidos" />
            <q-tab class="text-orange" name="recibidos" label="Recibidos" />
        </q-tabs>
        <div class="q-gutter-y-sm">
            <q-tab-panels v-model="tab" animated transition-prev="scale" transition-next="scale">

                <q-tab-panel name="emitidos">
                    <emitidos></emitidos>
                </q-tab-panel>

                <q-tab-panel name="recibidos">
                    <recibidos></recibidos>
                </q-tab-panel>
            </q-tab-panels>
        </div>
    </div>
</template>

<script>
import Emitidos from './CuentaEmitidos.vue'
import Recibidos from './CuentaRecibidos.vue'

export default {
    components: {
        Emitidos,
        Recibidos,
    },
    data() {
        return {
            tab: 'emitidos'
        }
    },
    computed: {
        token() {
            return this.$store.state.usuario;
        },

        rutaAxios() {
            return this.$store.state.rutaMongoStore
        },
    },
    created() {

    },
    methods: {

    },
}
</script>