<template>
    <div>
        <q-img class="" src="https://cdn.quasar.dev/img/material.png" style="height: 150px">
            <div class="absolute-bottom bg-transparent">
                <q-avatar size="56px" class="q-mb-sm">
                    <img src="https://cdn.quasar.dev/img/boy-avatar.png">
                </q-avatar>
                <div class="text-weight-bold">{{ token.nombre }}</div>
                <div class="text-weight-bold">{{ token.rfc }}</div>
                <div class="text-weight-bold">{{ token.empresa }}</div>
            </div>
        </q-img>
        <q-input class="q-ma-md" filled dense debounce="300" v-model="filter" placeholder="Buscar">
            <template v-slot:append>
                <q-icon name="search" />
            </template>
        </q-input>
        <q-list >
            <q-item @click="ingresar(a)" clickable v-ripple v-for="a in this.filteredEmpresas" :key="a.rfc">
                <q-item-section avatar>
                    <q-icon color="primary" name="mdi-domain" />
                </q-item-section>
                <q-item-section>{{a.nombre_e}}</q-item-section>
            </q-item>
        </q-list>
    </div>
</template>
<script>
    import { ref } from 'vue'
    import axios from "axios";
    import moment from 'moment'
    import { parseISO, toDate, format } from 'date-fns'

    export default {

        components: {
        },
        data() {
            return {
                filter:'',
                empresa: '',
                empresaBase: '',
                rfc: ''
            }
        },

        watch: {

        },
        computed: {
            token() {
                return this.$store.state.usuario;
            },
            rutaAxios() {
                return this.$store.state.rutaMongoStore
            },

            filteredEmpresas() {
                return this.$store.state.listaEmpresasStore.filter((a) => {
                return a.nombre_e.toLowerCase().includes(this.filter.toLowerCase());
            });
        },
        },
        created() {
        },
        methods: {
            ingresar(item) {

                this.$q.loading.show({ message: '<b>Iniciando Sesión...</b>' })

                this.empresa = item.nombre_e;
                this.empresaBase = item.nombreBase;
                this.rfc = item.rfc;

                axios
                    .post("https://api-framework.contago.com.mx/api/Usuarios/Login", {
                        idUsuario: this.$store.state.usuario.idusuariosApp,
                        nombre: this.$store.state.usuario.nombre,
                        rol: this.$store.state.usuario.rol,

                        empresa: this.empresa,
                        empresaBase: this.empresaBase,
                        firma: this.$store.state.usuario.firma,
                        rfc: this.rfc,
                    })
                    .then((response) => {
                        console.log(response.data);
                        this.$q.loading.hide()

                        return response.data;
                    })
                    .then((data) => {
                        this.$q.loading.hide()

                        this.$store.dispatch("guardarToken", data.token);
                        this.$router.push({ name: "Home" });
                        location.reload();
                    })
                    .catch((err) => {
                        console.log(err);

                        if (err.response.status == 500) {
                            this.$q.notify({ type: 'negative', message: error.response.data })
                        }
                        this.$q.loading.hide()

                    });
            },
        }
    }
</script>