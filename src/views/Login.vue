<template>
    <div class="bg-primary window-height window-width row justify-center items-center">
        <div class="column">
            <div class="row">
                <!-- FORMULARIO PARA SUBIR LA FIEL -->
                <q-card v-if="formGuardarSellos" square bordered class="q-pa-lg shadow-1">
                    <template v-if="GuardandoSellos">
                        <q-card-section>
                            <div class="text-center q-py-xl">
                                <q-spinner-cube color="blue" size="5.5em" />
                            </div>
                        </q-card-section>
                    </template>
                    <template v-else>
                        <q-card-section class="q-pa-sm">
                            <div class="text-h4 text-weight-bolder text-center q-py-md"
                                style="color: #FF931E; text-shadow:2px 2px 2px gray">Cargar FIEL
                            </div>
                            <q-bar dense class="q-mx-md bg-primary text-white">
                                <q-space />
                                <div>Archivo .key</div>
                                <q-space />
                            </q-bar>
                            <q-input class="q-px-md q-pb-md" @input="uploadKey" filled type="file" accept=".key" />
                            <q-bar dense class="q-mx-md bg-primary text-white">
                                <q-space />
                                <div>Archivo .cer</div>
                                <q-space />
                            </q-bar>
                            <q-input class="q-px-md q-pb-md" @input="uploadCer" filled type="file" accept=".cer" />

                            <q-input class="q-px-md q-pb-md" label="Contraseña" v-model="archivo.password" filled
                                :type="isPwd ? 'password' : 'text'">
                                <template v-slot:append>
                                    <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                                        @click="isPwd = !isPwd" />
                                </template>
                            </q-input>
                        </q-card-section>
                        <q-card-actions class="q-px-md">
                            <q-btn unelevated color="primary" class="full-width" label="Guardar"
                                @click="validarArchivos()" />
                            <q-btn flat color="primary" class="full-width q-mt-md" label="OMITIR"
                                @click="formCrearCuenta = false, formGuardarSellos = false" />
                        </q-card-actions>
                    </template>
                </q-card>

                <!-- FORMULARIO PARA CREAR CUENTA -->
                <q-card style="width: 800px;" v-if="formCrearCuenta && !formGuardarSellos" square bordered
                    class="q-pa-lg shadow-1">
                    <q-card-section>
                        <q-form class="q-gutter-md">
                            <div class="row">
                                <div class="col-12 col-md-4 ">
                                    <q-input square filled v-model="nuevoUsuario.nombre" type="nombre" label="Nombre" />
                                </div>
                                <div class="col-12 col-md-4 ">
                                    <q-input square filled v-model="nuevoUsuario.primerApellido" type="apellidoP"
                                        label="Apellido Paterno" />
                                </div>
                                <div class="col-12 col-md-4 ">
                                    <q-input square filled v-model="nuevoUsuario.segundoApellido" type="apellidoM"
                                        label="Apelldio Materno" />
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-12 col-md-3">
                                    <q-input square filled v-model="nuevoUsuario.rfc" type="rfc" label="RFC" />
                                </div>
                                <div class="col-12 col-md-9">
                                    <q-input square filled v-model="nuevoUsuario.razonSocial" type="razonSocial"
                                        label="Razón Social" />
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-12 col-md-4">
                                    <q-input square filled v-model="nuevoUsuario.usuario" type="usuario" label="Usuario" />
                                </div>
                                <div class="col-12 col-md-4">
                                    <q-input square filled v-model="nuevoUsuario.pin" type="password" label="Contraseña" />
                                </div>
                                <div class="col-12 col-md-4">
                                    <q-input square filled v-model="nuevoUsuario.telefono" type="telefono"
                                        label="Teléfono" />
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-12 col-md-12">
                                    <q-input square filled v-model="nuevoUsuario.correo" type="correo" label="Correo" />
                                </div>
                            </div>
                        </q-form>
                    </q-card-section>
                    <q-card-actions class="q-px-md">
                        <q-btn unelevated color="primary" size="lg" class="full-width" @click="guardarUsuario()"
                            label="CREAR CUENTA" />
                        <q-btn flat color="primary" class="full-width q-mt-md" label="CANCELAR"
                            @click="formCrearCuenta = false" />
                    </q-card-actions>
                </q-card>

                <!-- FORMULARIO PARA INICIAR SESION -->
                <q-card v-if="!formGuardarSellos && !formCrearCuenta" square bordered class="q-pa-lg shadow-1">
                    <q-card-section>
                        <q-form class="q-gutter-md">
                            <img alt="Contago logo" src="../assets/logo_contago_sin_fondo.png" style="height: 100px">
                        </q-form>
                    </q-card-section>

                    <template v-if="itemsEmpresa.length == 0">
                        <q-card-section>
                            <q-form class="q-gutter-md">
                                <!-- <img alt="Contago logo" src="../assets/logo_contago_sin_fondo.png" style="height: 100px"> -->
                                <q-input square filled v-model="nombreU" type="usuario" label="Usuario" />
                                <q-input square filled v-model="password" type="password" label="Contraseña"
                                    @keyup.enter="validarUsuario()" />
                            </q-form>
                        </q-card-section>
                        <q-card-actions class="q-px-md" v-if="itemsEmpresa.length == 0">
                            <q-btn unelevated color="primary" size="lg" class="full-width" @click="validarUsuario()"
                                label="Validar Empresa" />
                            <q-btn flat color="primary" class="full-width q-mt-md" label="Crear Cuenta"
                                @click="formCrearCuenta = true" />
                        </q-card-actions>
                    </template>

                    <template v-if="itemsEmpresa.length != 0">
                        <q-card-section>
                            <q-form class="q-gutter-md">
                                <q-select :options="filteredOptions" filled v-model="selectEmpresa" option-label="nombre_e"
                                    label="Empresa" use-input hide-selected fill-input @filter="filterFn" input-debounce="0"
                                    :popup-content-style="{ height: '300px' }">
                                    <template v-slot:no-option>
                                        <q-item>
                                            <q-item-section class="text-grey">
                                                No results
                                            </q-item-section>
                                        </q-item>
                                    </template>
                                </q-select>
                            </q-form>
                        </q-card-section>
                        <q-card-actions class="q-px-md">
                            <q-btn unelevated color="primary" size="lg" class="full-width" label="INICIAR SESIÓN"
                                @click="ingresar()" />
                            <q-btn flat color="primary" class="full-width q-mt-md" label="CANCELAR" @click="cancelar()" />
                        </q-card-actions>
                    </template>

                </q-card>

            </div>
        </div>
    </div>
</template>
  
<script>
import axios from "axios";
import { QSpinnerGears } from 'quasar'
export default {
    name: 'Login',
    data() {
        return {
            email: '',
            password: '',
            model: null,
            options: null,

            nombreU: "",
            selectEmpresa: {
                nombre_e: ''
            },
            itemsEmpresa: [],

            idUsuario: null,
            nombreUsuario: null,
            rolUsuario: null,
            empresa: null,
            empresaBase: null,
            rfc: "",
            firma: null,

            filteredOptions: [],

            formCrearCuenta: false,
            GuardandoSellos: false,
            formGuardarSellos: false,
            isPwd: false,

        }
    },
    computed: {
        nuevoUsuario() {
            return this.$store.state.nuevoUsuarioStore;
        },
        archivo() {
            return this.$store.state.archivosStore
        },
        rutaAxios() {
            return this.$store.state.rutaMongoStore
        },
    },
    methods: {

        filterFn(val, update, abort) {
            update(() => {
                const needle = val.toLowerCase()
                this.filteredOptions = this.itemsEmpresa.filter(v => v.nombre_e.toLowerCase().indexOf(needle) > -1)
            })
        },

        async validarUsuario() {
            this.$q.loading.show({ message: '<b>Buscando Empresas...</b><br/><span class="text-orange text-weight-bold">Espere...</span>' })

            //VALIDAMOS QUE EL USUARIO SEA VALIDO
            if (this.nombreU == '') {
                this.$q.notify({ type: 'info', icon: 'mdi-information', message: 'Ingrese un nombre de usuario.', timeout: 2000 })
                return
            }
            if (this.nombreU == '') {
                this.$q.notify({ type: 'info', icon: 'mdi-information', message: 'Ingrese su contraseña.', timeout: 2000 })
                return
            }
            try {
                let respuesta = await axios.post("https://api-framework.contago.com.mx/api/Usuarios/ValidaAsync", { nombre: this.nombreU, password: this.password, }
                );
                this.idUsuario = respuesta.data.idUsuario_;
                this.rolUsuario = respuesta.data.rol_;
                this.firma = respuesta.data.firma_;
                this.rfc = respuesta.data.rfc_;
                this.correo = respuesta.data.correo_;
                this.listaEmpresas(respuesta.data.idUsuario_);
                this.nombreUsuario = respuesta.data.nombre_;
                console.log(respuesta.data);
                this.$q.loading.hide()
            } catch (err) {
                console.log(err.response.status);
                this.$q.loading.hide()
                if (err.response.status == 400) {
                    this.$q.notify({ type: 'negative', message: "Usuario inexistente" })
                } else if (err.response.status == 404) {
                    this.$q.notify({ type: 'negative', message: "Contraseña incorrecta" })
                } else if (err.response.status == 401) {
                    this.$q.notify({ type: 'negative', message: "El usuario ya cuenta con una sesión iniciada" })
                } else {
                    this.$q.notify({ type: 'negative', message: "Datos incorrectos, verifique su usuario y contraseña" })

                }
            }
        },
        ingresar() {
            if (this.selectEmpresa.nombre_e == '') {
                this.$q.notify({ type: 'negative', message: "Seleccione uan empresa" })
                return
            }

            this.$q.loading.show({ message: '<b>Iniciando Sesión...</b>' })

            this.empresa = this.selectEmpresa.nombre_e;
            this.empresaBase = this.selectEmpresa.nombreBase;
            this.rfc = this.selectEmpresa.rfc;

            axios
                .post("https://api-framework.contago.com.mx/api/Usuarios/Login", {
                    idUsuario: this.idUsuario,
                    nombre: this.nombreUsuario,
                    rol: this.rolUsuario,
                    empresa: this.empresa,
                    empresaBase: this.empresaBase,
                    firma: this.firma,
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
                    this.nombre = "";
                    this.password = "";
                })
                .catch((err) => {
                    console.log(err);

                    if (err.response.status == 500) {
                        this.$q.notify({ type: 'negative', message: error.response.data })
                    }
                    this.$q.loading.hide()

                });
        },

        listaEmpresas(item) {
            axios
                .get("https://api-framework.contago.com.mx/api/Usuarios/Empresas/" + item + "/" + "DESERIALIZADOR")
                .then((response) => {
                    this.itemsEmpresa = response.data;
                    console.log(this.itemsEmpresa);
                })
                .catch(function (error) {
                    console.log(error);
                });
        },

        cancelar() {
            this.nombreU = ''
            this.password = ''
            this.itemsEmpresa = []

        },

        async guardarUsuario() {
            console.log(this.nuevoUsuario)

            if (this.nuevoUsuario.nombre == '') {
                this.$q.notify({ type: 'info', icon: 'mdi-information', message: 'Ingrese su nombre.', timeout: 2000 })
                return
            }
            if (this.nuevoUsuario.primerApellido == '') {
                this.$q.notify({ type: 'info', icon: 'mdi-information', message: 'Ingrese su primer apellido.', timeout: 2000 })
                return
            }
            if (this.nuevoUsuario.usuario == '') {
                this.$q.notify({ type: 'info', icon: 'mdi-information', message: 'Ingrese un nombre de usuario.', timeout: 2000 })
                return
            }
            if (this.nuevoUsuario.pin == '') {
                this.$q.notify({ type: 'info', icon: 'mdi-information', message: 'Ingrese un pin de seguridad o contraseña.', timeout: 2000 })
                return
            }
            if (this.nuevoUsuario.telefono == '') {
                this.$q.notify({ type: 'info', icon: 'mdi-information', message: 'Ingrese su número de teléfono.', timeout: 2000 })
                return
            }
            if (this.nuevoUsuario.correo == '') {
                this.$q.notify({ type: 'info', icon: 'mdi-information', message: 'Ingrese un correo vigente.', timeout: 2000 })
                return
            }
            if (this.nuevoUsuario.rfc == '') {
                this.$q.notify({ type: 'info', icon: 'mdi-information', message: 'Ingrese el RFC de la persona fisica o moral.', timeout: 2000 })
                return
            }
            if (this.nuevoUsuario.razonSocial == '') {
                this.$q.notify({ type: 'info', icon: 'mdi-information', message: 'Ingrese la Razón Social.', timeout: 2000 })
                return
            }
            this.$q.loading.show({ message: '<b>Creando Cuenta...</b><br/><span class="text-orange text-weight-bold">Espere...</span>' })

            try {
                let response = await axios.post('Registro/GuardarUsuarioMiAuditor', this.nuevoUsuario)
                console.log(response.data)
                this.formGuardarSellos = true
                this.formCrearCuenta = true
                this.$q.loading.hide()
                this.$q.notify({ type: 'positive', message: 'Cuenta creada correctamente.' })
            } catch (error) {
                console.log(error)
                this.$q.loading.hide()
                this.$q.notify({ type: 'error', icon: 'mdi-alert', message: error.response.data, timeout: 2000 });
            }
        },

        async uploadKey(event) {
            console.log(event)
            const file = event[0];
            try {
                const result = await this.convertBase64(file);
                console.log(result)

                this.$store.state.archivosStore.archivoKey.base64 = result;
                this.$store.state.archivosStore.nombreKey = file.name;
                this.dialogKey = false
            } catch (error) {
                console.log('error')
                console.error(error);
                return;
            }
        },

        async uploadCer(event) {
            const file = event[0];
            try {
                const result = await this.convertBase64(file);
                this.$store.state.archivosStore.archivoCer.base64 = result;
                this.$store.state.archivosStore.nombreCer = file.name;
                this.dialogCer = false
            } catch (error) {
                console.log('error')
                console.error(error);
                return;
            }
        },

        convertBase64(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject(reader.error);
            });
        },

        async validarArchivos() {
            this.archivo.tipo = "FIEL"

            console.log(this.archivo)
            this.GuardandoSellos = true
            try {
                let response = await axios.post('Validacion/PostValidarArchivos/erp_' + this.nuevoUsuario.rfc + '/' + this.nuevoUsuario.rfc, this.archivo);
                console.log(response.data)
                this.GuardandoSellos = false
                this.$q.notify({ type: 'positive', message: 'Archivo guardado exitosamente.' })
                this.formCrearCuenta = false
                this.formGuardarSellos = false
            } catch (error) {
                console.log(error);
                this.GuardandoSellos = false
                this.$q.notify({ type: 'negative', message: error.response.data })
            }
        },
    }
}
</script>
  
<style>
.q-card {
    width: 500px;
}
</style>
