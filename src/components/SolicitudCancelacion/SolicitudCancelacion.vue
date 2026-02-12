<template>
    <div class="q-pa-md">
        <q-tabs v-model="tab" align="justify" dense class="text-grey" active-color="primary" indicator-color="primary" narrow-indicator>
            <q-tab name="activas" label="Solicitudes Activas" />
            <q-tab name="anteriores" label="Consultas Anteriores" />
            <q-tab name="estatus" label="Estatus Comprobantes" />
        </q-tabs>

        <div class="q-gutter-y-sm">
            <q-tab-panels v-model="tab" animated transition-prev="scale" transition-next="scale">

                <q-tab-panel name="activas">
                    <activas></activas>
                </q-tab-panel>

                <q-tab-panel name="anteriores">
                    <anteriores></anteriores>
                </q-tab-panel>

                <q-tab-panel name="estatus">
                    <estatusC></estatusC>
                </q-tab-panel>
            </q-tab-panels>
        </div>
    </div>
</template>
<script>
    import activas from './SolicitudActiva.vue'
    import anteriores from './SolicitudAnterior.vue'
    import estatusC from './SolicitudEstatusComprobantes.vue'

    export default {
        components: {
            activas,
            anteriores,
            estatusC
        },
        data() {
            return {
                tab: 'activas',
            }
        },
        computed: {
            token() {
                return this.$store.state.usuario;
            },

            rutaAxios() {
                return this.$store.state.rutaMongoStore
            }

        },
        created() {

        },
        methods: {
            
        },
    }
</script>