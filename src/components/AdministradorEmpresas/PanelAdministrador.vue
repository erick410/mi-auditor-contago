<template>
    <div class="q-pa-md">

        <q-dialog v-model="dialogEmpresas" full-width persistent transition-show="flip-down" transition-hide="flip-up">
            <q-card>
                <q-bar class="bg-primary text-white">
                    <div>Empresas</div>
                    <q-space />
                    <q-btn dense flat icon="close" v-close-popup>
                        <q-tooltip>Close</q-tooltip>
                    </q-btn>
                </q-bar>
                <q-card-section>
                    <div class="row q-mx-lg">
                        <div class="col-12 text-h6"> Crear Nueva Empresa</div>
                        <div class="col-12 col-md-2 ">
                            <q-input dense filled class="q-mr-md" v-model="newRFC" label="RFC" />
                        </div>
                        <div class="col-12 col-md-3 ">
                            <q-input dense filled v-model="newEmpresa" label="Nombre Empresa">
                                <template v-slot:after>
                                    <q-btn round dense flat color="primary" icon="save"
                                        @click="InsertEmpresaDeserializador()">
                                        <q-tooltip>
                                            Guardar empresa
                                        </q-tooltip></q-btn>
                                </template>
                            </q-input>
                        </div>
                        <div class="col-12 col-md-7 text-right">
                            <q-btn color="primary" icon="mdi-share-all" label="Asginar empresas"
                                @click="PostEmpresaUser()" />
                        </div>
                    </div>
                    <q-table title="Listado de empresas" class="shadow-0 q-ma-lg" :data="listaEmpresasFaltantes"
                        selection="multiple" :selected.sync="selectedEmpresas" :columns="columns2" row-key="id_empresa"
                        :filter="filter2" :loading="loading2" :pagination="pagination">
                        <template v-slot:loading>
                            <q-inner-loading showing color="primary" />
                        </template>
                        <template v-slot:top-right>
                            <q-input filled borderless dense debounce="300" v-model="filter2" placeholder="Buscar">
                                <template v-slot:append>
                                    <q-icon name="search" />
                                </template>
                            </q-input>
                        </template>
                    </q-table>
                </q-card-section>
            </q-card>
        </q-dialog>

        <q-dialog v-model="dialogUsuarios" full-width persistent transition-show="flip-down" transition-hide="flip-up">
            <q-card>
                <q-bar class="bg-primary text-white">
                    <div>Usuarios</div>
                    <q-space />
                    <q-btn dense flat icon="close" v-close-popup>
                        <q-tooltip>Close</q-tooltip>
                    </q-btn>
                </q-bar>
                <q-card-section>
                    <div class="row q-mx-lg">
                        <div class="col-12 text-h6"> Crear Nuevo Usuario</div>
                        <div class="col-12 col-md-2 ">
                            <q-input dense filled class="q-mr-md" v-model="newNombre" label="Nombre" />
                        </div>
                        <div class="col-12 col-md-2">
                            <q-input dense class="q-mr-md" label="Contraseña" v-model="newPassword" filled :type="isPwd ? 'password' : 'text'"
                                 >
                                <template v-slot:append>
                                    <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                                        @click="isPwd = !isPwd" />
                                </template>
                            </q-input>
                        </div>
                        <div class="col-12 col-md-3 ">
                            <q-input class="q-mr-md"  dense filled v-model="newCorreo" label="Correo" />
                        </div>
                        <div class="col-12 col-md-2 ">
                            <q-select class="q-mr-md"  dense filled v-model="newRol" :options="['Administrador','Gasolinero']"
                                label="Rol" />
                        </div>
                        <div class="col-12 col-md-3 text-right">
                            <q-btn color="primary" icon="save" label="Guardar usuario"
                                @click="InsertUsuarios()" />
                        </div>
                    </div>
                    <q-table title="Listado de usuarios" class="shadow-0 q-ma-lg" :data="listaUsuarios"
                        :columns="columnsUsuarios" row-key="id_ususario" :loading="loading3" :pagination="pagination"
                        :filter="filter3">
                        <template v-slot:loading>
                            <q-inner-loading showing color="primary" />
                        </template>
                        <template v-slot:top-right>
                            <q-input filled borderless dense debounce="300" v-model="filter3" placeholder="Buscar">
                                <template v-slot:append>
                                    <q-icon name="search" />
                                </template>
                            </q-input>
                        </template>
                    </q-table>
                </q-card-section>
            </q-card>
        </q-dialog>

        <q-dialog v-model="confirm" persistent>
            <q-card>
                <q-card-section class="row items-center">
                    <q-avatar icon="mdi-information" color="primary" text-color="white" />
                    <span class="q-ml-sm">¿Estás seguro de que deseas eliminar la empresa de este usuario?</span>
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn flat label="Cancel" color="primary" v-close-popup />
                    <q-btn flat label="Aceptar" color="primary" @click="DeleteEmpresaDelUsuario()" />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <div class="row q-col-gutter-sm q-mx-lg">
            <div class="col-12 col-md-4">
                <q-select v-model="usuario" emit-value map-options @filter="filtroUsuarios"
                    :options="itemsfiltroUsuarios" use-input input-debounce="0" option-label="nombre" dense filled
                    label="Usuario" virtual-scroll-slice-size="1" @input="GetEmpresasXusuarioPanel()" >
                       <template v-slot:after>
                                    <q-btn round dense flat color="primary" icon="refresh"
                                        @click="GetUsuariosPanel()">
                                        <q-tooltip>
                                            Actualizar usuarios
                                        </q-tooltip></q-btn>

                        </template>
                    </q-select>
            </div>
            <div class="col-12 col-md-8 text-right">
                <q-btn class="q-mr-md" color="blue" icon="mdi-account-group" label="Lista de Usuarios"
                    @click="abrirDialogUsuarios()" />
                <q-btn color="green" icon="mdi-domain" label="Lista de Empresas" @click="abrirDialogEmpresas()" />
            </div>
        </div>
        <q-table title="Aministrador de empresas" class="shadow-0 q-ma-lg" :data="listaEmpresasXusuario"
            :columns="columns" row-key="id_empresa" :filter="filter" :loading="loading" :pagination="pagination">
            <template v-slot:loading>
                <q-inner-loading showing color="primary" />
            </template>
            <template v-slot:top-right>
                <q-input filled borderless dense debounce="300" v-model="filter" placeholder="Buscar">
                    <template v-slot:append>
                        <q-icon name="search" />
                    </template>
                </q-input>
            </template>
            <template v-slot:body="props">
                <q-tr :props="props">
                    <q-td auto-width key="acciones">
                        <q-btn size="md" color="red" rounded flat dense @click="deleteEmpresa(props.row)"
                            icon="mdi-delete">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px">Eliminar del usuario</q-tooltip>
                        </q-btn>
                    </q-td>
                    <q-td key="nombre_e" :props="props">{{ props.row.nombre_e }}</q-td>
                    <q-td key="rfc" :props="props">{{ props.row.rfc }}</q-td>
                </q-tr>
            </template>
        </q-table>
    </div>
</template>

<script>
    import axios from "axios";
    import { QSpinnerCube } from 'quasar'


    export default {
        components: {

        },
        data() {
            return {
                listaUsuarios: [],
                itemsfiltroUsuarios: null,
                filter: '',
                loading: false,
                columns: [
                    { name: 'acciones', align: 'center', label: 'Acciones', field: 'acciones', sortable: true, },
                    { name: 'nombre_e', align: 'center', label: 'Nombre', field: 'nombre_e', sortable: true, headerClasses: 'bg-primary text-white', classes: 'bg-grey-2 text-black text-left ellipsis' },
                    { name: 'rfc', align: 'center', label: 'RFC', field: 'rfc', sortable: true, classes: ' text-black text-center ellipsis' },
                ],
                items: [],
                pagination: {
                    sortBy: 'nombre_e',
                    descending: false,
                    page: 1,
                    rowsPerPage: 10
                },
                usuario: { nombre: '', id_ususario:0 },
                listaEmpresas: [],
                listaEmpresasXusuario: [],
                confirm: false,
                empresaDelete: 0,

                dialogUsuarios: false,
                dialogEmpresas: false,

                listaEmpresasFaltantes: [],
                filter2: '',
                loading2: false,
                selectedEmpresas: [],
                columns2: [
                    { name: 'nombre_e', align: 'center', label: 'Nombre', field: 'nombre_e', sortable: true, headerClasses: 'bg-primary text-white', classes: 'bg-grey-2 text-black text-left ellipsis' },
                    { name: 'rfc', align: 'center', label: 'RFC', field: 'rfc', sortable: true, classes: ' text-black text-center ellipsis' },
                ],

                newRFC: '',
                newEmpresa: '',

                filter3: '',
                loading3: false,
                columnsUsuarios: [
                    { name: 'nombre', align: 'center', label: 'Nombre', field: 'nombre', sortable: true, headerClasses: 'bg-primary text-white', classes: 'bg-grey-2 text-black text-left ellipsis' },
                    { name: 'correo', align: 'center', label: 'Correo', field: 'correo', sortable: true, classes: ' text-black text-left ellipsis' },
                    { name: 'rol', align: 'center', label: 'Rol', field: 'rol', sortable: true, classes: ' text-black text-center ellipsis' },
                ],

                isPwd: true,
                newNombre: '',
                newCorreo: '',
                newPassword: '',
                newRol: 'Administrador'
            }
        },
        computed: {
            token() {
                return this.$store.state.usuario;
            },

        },
        created() {
            this.GetUsuariosPanel()
            this.GetEmpresasPanel()
        },
        methods: {
             async InsertUsuarios() {
                if (this.newNombre == '') {
                    this.$q.notify({ type: 'warning', position: 'top-right', message: 'Indique el nombre del usuario.' })
                    return
                }
                if (this.newPassword == '') {
                    this.$q.notify({ type: 'warning', position: 'top-right', message: 'Indique la contraseña del usuario.' })
                    return
                }

                let objeto = {
                    id_ususario : 0,
                    nombre: this.newNombre,
                    rol:this.newRol,
                    contra:this.newPassword,
                    correo:this.newCorreo
                }

                this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'primary', spinnerSize: 140, message: 'Guardando usuario, espere... ', messageColor: 'white' })
                try {
                    let response = await axios.post("Empresas/InsertUsuarios", objeto);
                    let respuesta = response.data;
                    this.$q.loading.hide()
                    this.$q.notify({ type: 'positive', message: 'El usuario se ha registrado correctamente.' })
                    
                    objeto.id_ususario = respuesta
                    await this.listaUsuarios.push(objeto)
                    await this.encriptaContraseña(respuesta, this.newPassword)
                    this.newCorreo = ''
                    this.newNombre = ''
                    this.newPassword = ''

                } catch (error) {
                    console.log(error);
                    this.$q.loading.hide()
                    this.$q.notify({ type: 'negative', message: error.response.data })

                }
            },

            async PostEmpresaUser() {
                if (this.selectedEmpresas.length == 0) {
                    this.$q.notify({ type: 'warning', position: 'top-right', message: 'Seleccione al menos una empresa para asignar.' })
                    return
                }
                let listaEmpresasInt = []
                for (let a of this.selectedEmpresas) {
                    var intID = a.id_empresa
                    listaEmpresasInt.push(intID)
                }
                console.log(listaEmpresasInt)
                this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'primary', spinnerSize: 140, message: 'Asignando empresas, espere... ', messageColor: 'white' })
                try {
                    let response = await axios.post("Empresas/PostEmpresaUser/" + this.usuario.id_ususario, listaEmpresasInt);
                    let respuesta = response.data;
                    this.$q.loading.hide()
                    this.$q.notify({ type: 'positive', message: 'Las empresas fueron asignadas al usuario.' })

                    this.dialogEmpresas = false
                    this.GetEmpresasXusuarioPanel()

                } catch (error) {
                    console.log(error);
                    this.$q.loading.hide()
                    this.$q.notify({ type: 'negative', message: error.response.data })

                }
            },
            async InsertEmpresaDeserializador() {
                if (this.newRFC == '') {
                    this.$q.notify({ type: 'warning', position: 'top-right', message: 'Indique el RFC de la nueva empresa.' })
                    return
                }
                if (this.newEmpresa == '') {
                    this.$q.notify({ type: 'warning', position: 'top-right', message: 'Indique el nombre de la nueva empresa.' })
                    return
                }
                this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'primary', spinnerSize: 140, message: 'Guardando empresa, espere... ', messageColor: 'white' })
                try {
                    let response = await axios.post("Empresas/InsertEmpresaDeserializador/" + this.newRFC + '/' + this.newEmpresa);
                    let respuesta = response.data;
                    this.$q.loading.hide()
                    this.$q.notify({ type: 'positive', message: 'La empresa se ha creado exitosamente.' })
                    let objeto = {
                        id_empresa: respuesta,
                        nombre_e: this.newEmpresa,
                        base_e: "erp_" + this.newRFC,
                        Tipo: "DESERIALIZADOR",
                        rfc: this.newRFC
                    }
                    await this.listaEmpresasFaltantes.push(objeto)

                    this.newEmpresa = ''
                    this.newRFC = ''

                } catch (error) {
                    console.log(error);
                    this.$q.loading.hide()
                    this.$q.notify({ type: 'negative', message: error.response.data })

                }
            },

            abrirDialogEmpresas() {
                this.selectedEmpresas = []
                this.listaEmpresasFaltantes = []

                if (this.usuario.nombre == '') {
                    this.$q.notify({ type: 'warning', position: 'top-right', message: 'Seleccione un usuario.' })
                    return
                }
                this.listaEmpresasFaltantes = this.listaEmpresas.filter(emp =>
                    !this.listaEmpresasXusuario.some(userEmp => userEmp.id_empresa === emp.id_empresa)
                );

                this.dialogEmpresas = true
            },

            abrirDialogUsuarios() {
                this.GetUsuariosPanel()
                this.dialogUsuarios = true

            },

            deleteEmpresa(item) {
                this.empresaDelete = item.id_empresa
                this.confirm = true
            },

            async DeleteEmpresaDelUsuario() {
                this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'primary', spinnerSize: 140, message: 'Eliminando empresa, espere... ', messageColor: 'white' })
                try {
                    let response = await axios.post("Empresas/DeleteEmpresaDelUsuario/" + this.usuario.id_ususario + '/' + this.empresaDelete);
                    let respuesta = response.data;
                    this.$q.loading.hide()

                    if (respuesta == true) {
                        this.GetEmpresasXusuarioPanel();
                        this.$q.notify({ type: 'positive', message: 'Empresa eliminado exitosamente.' })
                    } else {
                        this.$q.notify({ type: 'negative', message: 'Error al eliminar, intentelo de nuevo.' })
                    }

                    this.confirm = false

                } catch (error) {
                    console.log(error);
                    this.$q.loading.hide()
                    this.$q.notify({ type: 'negative', message: 'Error al eliminar, intentelo de nuevo.' })

                }
            },
            async GetEmpresasXusuarioPanel() {
                if(this.usuario == null){
                    return
                }
                this.listaEmpresasXusuario = []
                this.loading = true
                try {
                    let response = await axios.get("Empresas/GetEmpresasXusuarioPanel/" + this.usuario.id_ususario);
                    let usuarios = response.data;
                    this.listaEmpresasXusuario = usuarios;
                    this.loading = false

                } catch (error) {
                    console.log(error);
                    this.loading = false

                }
            },

            async GetEmpresasPanel() {
                try {
                    let response = await axios.get("Empresas/GetEmpresasPanel");
                    let usuarios = response.data;
                    this.listaEmpresas = usuarios;

                } catch (error) {
                    console.log(error);
                }
            },

            async GetUsuariosPanel() {
                try {
                    let response = await axios.get("Empresas/GetUsuarisPanel");
                    let usuarios = response.data;
                    this.listaUsuarios = usuarios;

                } catch (error) {
                    console.log(error);
                }
            },

            filtroUsuarios(val, update, abort) {
                update(() => {
                    const needle = val.toLocaleLowerCase()
                    this.itemsfiltroUsuarios = this.listaUsuarios.filter(v => v.nombre.toLocaleLowerCase().indexOf(needle) > -1)
                },
                    ref => {
                        if (val !== '' && this.itemsfiltroUsuarios.length > 0) {
                            ref.setOptionIndex(-1)
                            ref.moveOptionSelection(1, true)
                        }
                    })
            },

            async encriptaContraseña(id, contra){
            try {
                    let response = await axios.put("https://api-framework.contago.com.mx/api/Usuarios/EditarContraseña/" + id + '/' + contra);
                    let res = response.data;
console.log(res)
                } catch (error) {
                    console.log(error);
                }
            }
        },
    }
</script>