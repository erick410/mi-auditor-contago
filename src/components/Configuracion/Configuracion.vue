<template>
    <q-page>
        <div class="row">
            <div class="col-12 q-pa-md">
                <q-toolbar class="bg-primary text-white">
                    <q-toolbar-title>
                        Configuración
                    </q-toolbar-title>
                    <q-btn flat round dense class="q-mr-sm" icon="mdi-image-off" @click="eliminarLogo()">
                        <q-tooltip>
                            Eliminar Logo
                        </q-tooltip></q-btn>
                    <q-btn flat round dense icon="mdi-content-save" @click="guardarOactualizar()">
                        <q-tooltip>
                            Guardar
                        </q-tooltip></q-btn>
                </q-toolbar>
            </div>
            <div class="col-12 col-md-6">
                <div class="row q-mt-md">
                    <!-- RFC -->
                    <div class="col-12 col-md-6 q-pa-sm" color="bg-primary">
                        <q-input filled outlined v-model="empresa.rfc" label="RFC" @change="validaRegimen" />
                    </div>
                    <!-- CODIGO POSTAL -->
                    <div class="col-12 col-md-6 q-pa-sm" color="bg-primary">
                        <q-input filled outlined v-model="empresa.domicilioFiscal" label="Código Postal" />
                    </div>
                    <!-- NOMBRE -->
                    <div class="col-12 col-md-12 q-pa-sm" color="bg-primary">
                        <q-input filled outlined v-model="empresa.nombre" label="Nombre" />
                    </div>
                    <!-- REGIMEN FISCAL -->
                    <div class="col-12 col-md-12 q-pa-sm" color="bg-primary">
                        <q-select filled option-label="regimenFiscal" outlined v-model="empresa.regimenFiscal"
                            :options="itemsRegimenFiscal" label="Régimen Fiscal" />
                    </div>
                    <!-- CARGAR LOGO -->
                    <div class="col-12 col-md-12 q-pa-sm" color="bg-primary">
                        <q-uploader :multiple="false" label="Cargar Archivo" class="full-width" no-thumbnails url="/"
                            accept=".jpg,.jpeg,.png" @added="uploadImage" />
                    </div>
                </div>
            </div>
            <div class="col-12 col-md-6">
                <div class="row q-mt-md ">
                    <div class="col-12 col-md-12 q-pa-sm text-center" color="bg-primary">
                        <q-img :src="empresa.logo.base64" style=" width: 600px;">
                            <div class=" absolute-bottom text-subtitle1 text-center">
                                LOGO DE LA EMPRESA
                            </div>
                        </q-img>
                    </div>
                </div>
            </div>
        </div>
        <div class="row q-mt-md">
            <div class="col-12 q-pa-md">
                <q-toolbar class="bg-primary text-white">
                    <q-toolbar-title>
                        Correo
                    </q-toolbar-title>
                </q-toolbar>
            </div>
        </div>
        <div class="row q-mt-md">
            <div class="col-12 col-md-6  q-pa-sm">
                <q-input outlined v-model="empresa.nombreCorreo" filled label="Nombre" />
            </div>
            <div class="col-12 col-md-6  q-pa-sm">
                <q-input outlined v-model="empresa.correo" filled label="Correo" />
            </div>
        </div>
        <div class="row ">
            <div class="col-12 col-md-4  q-pa-sm">
                <q-input v-model="empresa.password" filled :type="isPwd ? 'password' : 'text'">
                    <template v-slot:append>
                        <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                            @click="isPwd = !isPwd" />
                    </template>
                </q-input>
            </div>
            <div class="col-12 col-md-4  q-pa-sm">
                <q-input outlined v-model="empresa.puerto" filled label="Puerto" />
            </div>
            <div class="col-12 col-md-4  q-pa-sm">
                <q-input outlined v-model="empresa.host" filled label="Host" />
            </div>
        </div>
    </q-page>
</template>
<script>
import axios from "axios";
import { resizeImagePixels } from '../../plugins/rezizeImage.js'

export default {
    components: {},
    data() {
        return {
            itemsRegimenFiscal: [],
            isPwd: true,
        };
    },
    mounted() {

    },
    computed: {
        empresa() {
            return this.$store.state.empresaStore;
        },

        token() {
            return this.$store.state.usuario;
        },

        correo() {
            return this.$store.state.correoStore;
        },

        rutaAxios() {
            return this.$store.state.rutaMongoStore
        },
    },
    created() {
        this.GetRegimenFiscal();
        this.GetEmpresa();

    },
    methods: {
        async GetRegimenFiscal() {
            try {
                let response = await axios.get("CatalogosSat/GetRegimenFiscal");
                console.log(response.data)
                this.$store.state.listRegimenFiscalStore = response.data;
            } catch (error) {
                console.log(error);
            }
        },

        validaRegimen() {
            console.log(this.empresa.rfc)
            if (this.empresa.rfc.length === 13) {
                console.log('fisica')
                return this.itemsRegimenFiscal = this.$store.state.listRegimenFiscalStore.filter(regimen => regimen.fisica === 'Sí');
            }
            if (this.empresa.rfc.length === 12) {
                console.log('moral')
                return this.itemsRegimenFiscal = this.$store.state.listRegimenFiscalStore.filter(regimen => regimen.moral === 'Sí');
            }
        },

        guardarOactualizar() {
            if (this.empresa._id == 0 || this.empresa._id == null) {
                this.PostEmpresa();
            } else {
                this.putEmpresa();
            }
        },

        async PostEmpresa() {
            console.log(this.empresa)
            this.$q.loading.show({ message: '<b>Guardando Información...' })
            try {
                let response = await axios.post(this.rutaAxios + 'Empresa/PostEmpresa/erp_' + this.token.rfc, this.empresa);
                console.log(response.data)
                this.$q.notify({ type: 'positive', message: 'Configuración guardada exitosamente.' })
                this.$q.loading.hide()
            } catch (error) {
                console.log(error)
                this.$q.notify({ type: 'negative', message: 'Error al guardar, verifique la información e intentelo de nuevo.' })
                this.$q.loading.hide()
            }
        },


        async putEmpresa() {
            this.$q.loading.show({ message: '<b>Guardando Información...' })
            console.log(this.empresa)
            try {
                let response = await axios.put(this.rutaAxios + 'Empresa/PutEmpresa/erp_' + this.token.rfc, this.empresa)
                console.log(response.data)
                this.$q.notify({ type: 'positive', message: 'Configuración guardada exitosamente.' })
                this.$q.loading.hide()

            } catch (error) {
                console.log(error)
                this.$q.notify({ type: 'negative', message: 'Error al guardar, verifique la información e intentelo de nuevo.' })
                this.$q.loading.hide()
            }
        },
        async GetEmpresa() {
            try {
                let response = await axios.get(this.rutaAxios + 'Empresa/GetEmpresa/erp_' + this.token.rfc + '/' + this.token.rfc);
                console.log(response.data)
                if (response.data.idEmpresa != 0) {
                    this.$store.state.empresaStore = response.data
                    this.validaRegimen();
                }
            } catch (error) {
                console.log(error);
            }
        },

        eliminarLogo() {
            this.$store.state.empresaStore.logo.base64 = '../../assets/blanco.png'
        },

        convertBase64(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject(reader.error);
            });
        },

        async uploadImage(event) {
            console.log(event)
            const file = event[0];
            try {
                // const result = await this.convertBase64(file);
                const resizedImageBase64 = await resizeImagePixels(file, 600, 400);
                console.log(resizedImageBase64);
                this.$store.state.empresaStore.logo.base64 = resizedImageBase64;
                this.$store.state.empresaStore.logo.extension = file.type;
            } catch (error) {
                console.log('error')
                console.error(error);
                return;
            }
        },
    },
};
</script>
<style>