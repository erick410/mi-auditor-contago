<template>
    <div class="bg-primary window-height window-width row justify-center items-center">
        <div class="column">
            <div class="row">
                <!-- FORMULARIO PARA SUBIR LA FIEL -->
                <!-- <q-card v-if="formGuardarSellos" square bordered class="q-pa-lg shadow-1">
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
                </q-card> -->

                <!-- FORMULARIO PARA CREAR CUENTA -->
                <q-card style="width: 800px;" v-if="formCrearCuenta" square bordered
                    class="q-pa-lg shadow-1">
                    <q-card-section>
                        <q-form class="q-gutter-md">
                            <div class="text-subtitle2 text-weight-bold">Datos de acceso</div>
                            <div class="row q-col-gutter-sm">
                                <div class="col-12 col-md-4">
                                    <q-input filled dense v-model="registro.usuario" label="Usuario" />
                                </div>
                                <div class="col-12 col-md-4">
                                    <q-input filled dense v-model="registro.nombreCompleto" label="Nombre Completo" />
                                </div>
                                <div class="col-12 col-md-4">
                                    <q-input filled dense v-model="registro.password" label="Contraseña"
                                        :type="isPwd ? 'password' : 'text'">
                                        <template v-slot:append>
                                            <q-icon :name="isPwd ? 'visibility_off' : 'visibility'"
                                                class="cursor-pointer" @click="isPwd = !isPwd" />
                                        </template>
                                    </q-input>
                                </div>
                            </div>

                            <q-separator />

                            <div class="text-subtitle2 text-weight-bold">Datos de la empresa</div>
                            <div class="row q-col-gutter-sm">
                                <div class="col-12 col-md-4">
                                    <q-input filled dense v-model="registro.rfc" label="RFC" />
                                </div>
                                <div class="col-12 col-md-8">
                                    <q-input filled dense v-model="registro.nombre" label="Razón Social" />
                                </div>
                            </div>
                            <!-- <div class="row q-col-gutter-sm">
                                <div class="col-12 col-md-6">
                                    <q-select filled dense v-model="registro.tipo" label="Tipo de empresa"
                                        :options="['empresa', 'gasolinero', 'sector_publico']" />
                                </div>
                                <div class="col-12 col-md-6">
                                    <q-select filled dense v-model="registro.sistemas" label="Sistemas"
                                        :options="['auditoria', 'contabilidad', 'facturacion']" multiple use-chips />
                                </div>
                            </div> -->

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
                <q-card v-if="!formCrearCuenta" square bordered class="q-pa-lg shadow-1">
                    <q-card-section>
                        <div class="text-center">
                            <img alt="Contago logo" src="../assets/logo_contago_sin_fondo.png" style="height: 100px">
                        </div>
                    </q-card-section>

                    <!-- PASO 1: Credenciales -->
                    <template v-if="itemsEmpresa.length == 0">
                        <q-card-section>
                            <q-form class="q-gutter-md">
                                <q-input square filled v-model="nombreU" label="Usuario" />
                                <q-input square filled v-model="password" type="password" label="Contraseña"
                                    @keyup.enter="validarUsuario()" />
                            </q-form>
                        </q-card-section>
                        <q-card-actions class="q-px-md">
                            <q-btn unelevated color="primary" size="lg" class="full-width" @click="validarUsuario()"
                                label="Validar Empresa" />
                            <q-btn   outline color="primary" class="full-width q-mt-md" size="lg" label="Crear Cuenta"
                                @click="formCrearCuenta = true" />
                        </q-card-actions>
                    </template>

                    <!-- PASO 2: Seleccionar empresa -->
                    <template v-if="itemsEmpresa.length != 0">
                        <q-card-section>
                            <q-form class="q-gutter-md">
                                <q-select :options="filteredOptions" filled v-model="selectEmpresa"
                                    option-label="empresa" label="Empresa" use-input hide-selected fill-input
                                    @filter="filterFn" input-debounce="0" :popup-content-style="{ height: '300px' }">
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
                            <q-btn flat color="primary" class="full-width q-mt-md" label="CANCELAR"
                                @click="cancelar()" />
                        </q-card-actions>
                    </template>
                </q-card>

            </div>
        </div>
    </div>
</template>

<script>
import axios from "axios";

export default {
    name: 'Login',
    data() {
        return {
            nombreU: '',
            password: '',
            selectEmpresa: null,
            itemsEmpresa: [],
            filteredOptions: [],

            // datos del usuario del paso 1
            idUsuario: null,
            nombreUsuario: null,
            firma: null,
            rfc: '',

            formCrearCuenta: false,
            GuardandoSellos: false,
            formGuardarSellos: false,
            isPwd: false,

            registro: {
                usuario:        '',
                password:       '',
                nombreCompleto: '',
                nombre:         '',
                rfc:            '',
                tipo:           'Empresa',
                sistemas:       ['auditor']
            }
        }
    },
    computed: {
        nuevoUsuario() {
            return this.$store.state.nuevoUsuarioStore;
        },
        archivo() {
            return this.$store.state.archivosStore;
        },
        rutaDescargas() {
            return this.$store.state.rutaDescargas;
        },
    },
    methods: {
        filterFn(val, update) {
            update(() => {
                const needle = val.toLowerCase();
                this.filteredOptions = this.itemsEmpresa.filter(
                    v => v.empresa.toLowerCase().indexOf(needle) > -1
                );
            });
        },

        async validarUsuario() {
            if (this.nombreU == '') {
                this.$q.notify({ type: 'info', message: 'Ingrese un nombre de usuario.' });
                return;
            }
            if (this.password == '') {
                this.$q.notify({ type: 'info', message: 'Ingrese su contraseña.' });
                return;
            }

            this.$q.loading.show({ message: '<b>Buscando Empresas...</b><br/><span class="text-orange text-weight-bold">Espere...</span>' });

            try {
                let respuesta = await axios.post(this.rutaDescargas + "Login/validar", {
                    usuario: this.nombreU,
                    password: this.password,
                    tipo: "auditor"
                });
                console.log(respuesta)

                this.idUsuario = respuesta.data.idUsuario;
                this.nombreUsuario = respuesta.data.nombre;
                this.itemsEmpresa = respuesta.data.empresas;
                this.filteredOptions = respuesta.data.empresas;
                this.$q.loading.hide();
            } catch (err) {
                this.$q.loading.hide();
                if (err.response && err.response.status == 401) {
                    this.$q.notify({ type: 'negative', message: err.response.data.mensaje });
                } else if (err.response && err.response.status == 400) {
                    this.$q.notify({ type: 'negative', message: "Usuario inexistente" });
                } else {
                    this.$q.notify({ type: 'negative', message: "Datos incorrectos, verifique su usuario y contraseña" });
                }
            }
        },

        async ingresar() {
            if (!this.selectEmpresa) {
                this.$q.notify({ type: 'negative', message: "Seleccione una empresa" });
                return;
            }

            this.$q.loading.show({ message: '<b>Iniciando Sesión...</b>' });

            try {
                let respuesta = await axios.post(this.rutaDescargas + "Login/login", {
                    idUsuario: this.idUsuario,
                    tipo: "auditor",
                    _id_empresa: this.selectEmpresa._id_empresa
                });

                this.$store.dispatch("guardarToken", respuesta.data.token);

                this.$q.loading.hide();
                this.$router.push({ name: "Home" }).catch(() => { });

            } catch (err) {
                this.$q.loading.hide();
                if (err.response && err.response.status == 500) {
                    this.$q.notify({ type: 'negative', message: err.response.data });
                } else {
                    this.$q.notify({ type: 'negative', message: "Error al iniciar sesión" });
                }
            }
        },

        cancelar() {
            this.nombreU = '';
            this.password = '';
            this.idUsuario = null;
            this.nombreUsuario = null;
            this.selectEmpresa = null;
            this.itemsEmpresa = [];
            this.filteredOptions = [];
        },

        async guardarUsuario() {
            // Validaciones
            if (!this.registro.usuario) {
                this.$q.notify({ type: 'warning', message: 'Ingrese un nombre de usuario.' }); return
            }
            if (!this.registro.password) {
                this.$q.notify({ type: 'warning', message: 'Ingrese una contraseña.' }); return
            }
            if (!this.registro.rfc) {
                this.$q.notify({ type: 'warning', message: 'Ingrese el RFC.' }); return
            }
            if (!this.registro.nombre) {
                this.$q.notify({ type: 'warning', message: 'Ingrese la razón social.' }); return
            }
            if (!this.registro.tipo) {
                this.$q.notify({ type: 'warning', message: 'Seleccione el tipo de empresa.' }); return
            }
            if (!this.registro.sistemas.length) {
                this.$q.notify({ type: 'warning', message: 'Seleccione al menos un sistema.' }); return
            }

            this.$q.loading.show({ message: '<b>Creando cuenta...</b>' })

            try {
                await axios.post(this.rutaDescargas + '/Administrador/registro', this.registro)
                this.$q.loading.hide()
                this.$q.notify({ type: 'positive', message: 'Cuenta creada correctamente. Ingrese sus datos de acceso para iniciar sesión.' })
                this.formCrearCuenta = false;
            } catch (err) {
                this.$q.loading.hide()
                this.$q.notify({
                    type: 'negative',
                    message: err.response?.data?.mensaje || 'Error al crear la cuenta.'
                })
            }
        },

        async uploadKey(event) {
            const file = event[0];
            try {
                const result = await this.convertBase64(file);
                this.$store.state.archivosStore.archivoKey.base64 = result;
                this.$store.state.archivosStore.nombreKey = file.name;
            } catch (error) {
                console.error(error);
            }
        },

        async uploadCer(event) {
            const file = event[0];
            try {
                const result = await this.convertBase64(file);
                this.$store.state.archivosStore.archivoCer.base64 = result;
                this.$store.state.archivosStore.nombreCer = file.name;
            } catch (error) {
                console.error(error);
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
            this.archivo.tipo = "FIEL";
            this.GuardandoSellos = true;
            try {
                let response = await axios.post(
                    this.rutaAxios + 'Validacion/PostValidarArchivos/erp_' + this.nuevoUsuario.rfc + '/' + this.nuevoUsuario.rfc,
                    this.archivo
                );
                this.GuardandoSellos = false;
                this.formCrearCuenta = false;
                this.formGuardarSellos = false;
                this.$q.notify({ type: 'positive', message: 'Archivo guardado exitosamente.' });
            } catch (error) {
                this.GuardandoSellos = false;
                this.$q.notify({ type: 'negative', message: error.response.data });
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