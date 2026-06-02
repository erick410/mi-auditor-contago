<template>
  <div class="q-pa-md">

    <q-tabs v-model="tab" dense align="left" class="q-mb-md" active-color="primary" indicator-color="primary">
      <q-tab name="empresas" label="Empresas" icon="mdi-domain" />
      <q-tab name="usuarios" label="Usuarios" icon="mdi-account" />
      <!-- <q-tab name="accesos" label="Ligar" icon="mdi-link-variant" /> -->
    </q-tabs>

    <q-separator />

    <q-tab-panels v-model="tab" animated style="width:100%">
      <q-tab-panel name="empresas">

        <div class="row items-center q-mb-md">
          <div class="text-h6 col">Empresas registradas ({{ listaEmpresas.length }})</div>
          <q-input dense filled v-model="filtroEmpresas" placeholder="Buscar..." style="width:220px" class="q-mr-sm">
            <template v-slot:append><q-icon name="mdi-magnify" /></template>
          </q-input>
          <q-btn unelevated color="primary" icon="mdi-plus"  class="q-mr-sm" label="Nuevo Acceso" @click="dialogoAcceso = true" />
          <q-btn unelevated color="primary" icon="mdi-plus"  class="q-mr-sm" label="Nueva Empresa" @click="dialogEmpresa = true" />
          <q-btn unelevated color="primary" icon="mdi-refresh" label="Actualizar" @click="cargarEmpresas()" />
        </div>

        <q-table :data="listaEmpresas" :columns="colsEmpresas" row-key="_id" flat bordered dense
          :rows-per-page-options="[15, 30, 50]" :loading="loadingE" :filter="filtroEmpresas">
           
          <template v-slot:body-cell-sistemas="props">
            <q-td :props="props">
              <q-chip v-for="s in props.row.sistemas" :key="s" dense color="primary" text-color="white" size="sm">
                {{ s }}
              </q-chip>
            </q-td>
          </template>
          <template v-slot:body-cell-estatus="props">
            <q-td :props="props">
              <q-badge :color="props.row.estatus === 'Activo' ? 'positive' : 'negative'">
                {{ props.row.estatus }}
              </q-badge>
            </q-td>
          </template>
        </q-table>

      </q-tab-panel>

      <q-tab-panel name="usuarios">
        <div class="row items-center q-mb-md">
          <div class="text-h6 col">Usuarios registrados ({{ filtroUsuarios.length }})</div>
          <q-input dense filled v-model="filtroUsuarios" placeholder="Buscar..." style="width:220px" class="q-mr-sm">
            <template v-slot:append><q-icon name="mdi-magnify" /></template>
          </q-input>
          <q-btn unelevated color="primary" icon="mdi-plus" class="q-mr-sm" label="Nuevo Acceso" @click="dialogoAcceso = true" />
          <q-btn unelevated color="primary" icon="mdi-plus" class="q-mr-sm" label="Nuevo Usuario" @click="dialogUsuario = true" />
          <q-btn unelevated color="primary" icon="mdi-refresh" label="Actualizar" @click="cargarUsuarios()" />
        </div>
        <q-table :data="listaUsuarios" :columns="colsUsuarios" row-key="_id" flat bordered dense
          :rows-per-page-options="[15, 30, 50]" @row-click="verAccesosUsuario" :loading="loadingU" :filter="filtroUsuarios">
          <template v-slot:body-cell-estatus="props">
            <q-td :props="props">
              <q-badge :color="props.row.estatus === 'Activo' ? 'positive' : 'negative'">
                {{ props.row.estatus }}
              </q-badge>
            </q-td>
          </template>
        </q-table>

        <!-- EMPRESAS DEL USUARIO SELECCIONADO -->
        <q-card flat bordered class="q-mt-md  full-width" v-if="usuarioSeleccionado">
          <q-card-section class="bg-blue-1 row items-center">
            <q-icon name="mdi-account" class="q-mr-sm" color="primary" />
            <div class="text-subtitle1 text-weight-bold col">
              Empresas de: {{ usuarioSeleccionado.usuario }}
            </div>
            <q-btn flat round dense icon="mdi-close" @click="usuarioSeleccionado = null; accesoUsuario = []" />
          </q-card-section>
          <q-table :data="accesoUsuario" :columns="colsAccesos" row-key="_id" flat dense :loading="cargandoAccesos"
            :rows-per-page-options="[10, 20]">
            <template v-slot:body-cell-modulos="props">
              <q-td :props="props">
                <q-chip v-for="m in props.row.modulos" :key="m" dense color="teal" text-color="white" size="sm">
                  <template v-if="m == '*'">
                    Todos
                  </template>
                  <template v-else>
                    {{ m }}
                  </template>
                </q-chip>
              </q-td>
            </template>
            <template v-slot:body-cell-estatus="props">
              <q-td :props="props">
                <q-badge :color="props.row.estatus === 'Activo' ? 'positive' : 'negative'">
                  {{ props.row.estatus }}
                </q-badge>
              </q-td>
            </template>
          </q-table>
        </q-card>

      </q-tab-panel>

      <!-- ══════════ TAB LIGAR ══════════ -->
      <!-- <q-tab-panel name="accesos">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-5">
            <q-card flat bordered>
              <q-card-section class="bg-primary text-white">
                <div class="text-subtitle1 text-weight-bold">Ligar Usuario — Empresa</div>
              </q-card-section>
              <q-card-section class="q-gutter-sm">
                <q-input filled dense v-model="ligaUsuarioBusqueda" label="Buscar usuario" debounce="400"
                  @input="buscarUsuarioLiga()">
                  <template v-slot:append><q-icon name="mdi-magnify" /></template>
                </q-input>
                <q-select filled dense v-model="ligaUsuarioSelected" :options="resultadosUsuariosLiga"
                  option-label="usuario" option-value="_id" label="Seleccionar usuario" emit-value map-options />

                <q-input filled dense v-model="ligaEmpresaBusqueda" label="Buscar empresa" debounce="400"
                  @input="buscarEmpresaLiga()">
                  <template v-slot:append><q-icon name="mdi-magnify" /></template>
                </q-input>
                <q-select filled dense v-model="ligaEmpresaSelected" :options="resultadosEmpresasLiga"
                  option-label="nombre" option-value="_id" label="Seleccionar empresa" emit-value map-options />

                <q-select filled dense v-model="ligaSistema" :options="['auditoria', 'contabilidad', 'facturacion']"
                  label="Sistema" />
              </q-card-section>
              <q-card-actions class="q-px-md q-pb-md">
                <q-btn unelevated color="primary" class="full-width" label="Ligar" @click="ligarUsuarioEmpresa()" />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </q-tab-panel> -->

    </q-tab-panels>

    <!-- ══════════ DIALOGO NUEVO ACCESO ══════════ -->
    <q-dialog v-model="dialogoAcceso" persistent>
      <q-card style="min-width:400px">
        <q-card-section class="bg-primary text-white row items-center">
          <div class="text-h6">Nueva Empresa</div>
          <q-space />
          <q-btn flat round dense icon="mdi-close" color="white" v-close-popup />
        </q-card-section>
        <q-card-section class="q-gutter-sm">
          <!-- <q-input filled dense v-model="ligaUsuarioBusqueda" label="Buscar usuario" debounce="400"
            @input="buscarUsuarioLiga()">
            <template v-slot:append><q-icon name="mdi-magnify" /></template>
          </q-input> -->
          <q-select filled dense v-model="ligaUsuarioSelected" :options="listaUsuariosFilter" option-label="usuario"
            option-value="_id" label="Seleccionar usuario" emit-value map-options @filter="filterFnUsuario" use-input  />

          <!-- <q-input filled dense v-model="ligaEmpresaBusqueda" label="Buscar empresa" debounce="400"
            @input="buscarEmpresaLiga()">
            <template v-slot:append><q-icon name="mdi-magnify" /></template>
          </q-input> -->

          <q-select filled dense v-model="ligaEmpresaSelected" :options="listaEmpresasFilter" option-label="nombre"
            option-value="_id" label="Seleccionar empresa" emit-value map-options @filter="filterFn" use-input   />

          <q-select filled dense v-model="ligaSistema" :options="['auditor', 'autoconta', 'facturacion']"
            label="Sistema" />

        </q-card-section>
        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat  class="full-width" label="Cancelar" v-close-popup />
          <q-btn unelevated color="primary" class="full-width" label="Ligar" @click="ligarUsuarioEmpresa()" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ══════════ DIALOGO NUEVA EMPRESA ══════════ -->
    <q-dialog v-model="dialogEmpresa" persistent>
      <q-card style="min-width:400px">
        <q-card-section class="bg-primary text-white row items-center">
          <div class="text-h6">Nueva Empresa</div>
          <q-space />
          <q-btn flat round dense icon="mdi-close" color="white" v-close-popup />
        </q-card-section>
        <q-card-section class="q-gutter-sm">
          <q-input filled dense v-model="nuevaEmpresa.nombre" label="Nombre" />
          <q-input filled dense v-model="nuevaEmpresa.rfc" label="RFC" />
          <q-select filled dense v-model="nuevaEmpresa.tipo" label="Tipo"
            :options="['Empresa', 'Gasolinera', 'Sector_Publico']" />
          <q-select filled dense v-model="nuevaEmpresa.sistemas" label="Sistemas"
            :options="['auditor', 'autoconta', 'facturacion']" multiple use-chips />
        </q-card-section>
        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn unelevated color="primary" label="Crear" @click="crearEmpresa()" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ══════════ DIALOGO NUEVO USUARIO ══════════ -->
    <q-dialog v-model="dialogUsuario" persistent>
      <q-card style="min-width:400px">
        <q-card-section class="bg-primary text-white row items-center">
          <div class="text-h6">Nuevo Usuario</div>
          <q-space />
          <q-btn flat round dense icon="mdi-close" color="white" v-close-popup />
        </q-card-section>
        <q-card-section class="q-gutter-sm">
          <q-input filled dense v-model="nuevoUsuario.usuario" label="Usuario" />
          <q-input filled dense v-model="nuevoUsuario.nombreCompleto" label="Nombre Completo" />
          <q-input filled dense v-model="nuevoUsuario.password" label="Contraseña" :type="isPwd ? 'password' : 'text'">
            <template v-slot:append>
              <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="isPwd = !isPwd" />
            </template>
          </q-input>
        </q-card-section>
        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn unelevated color="primary" label="Crear" @click="crearUsuario()" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'PanelAdmin',
  data() {
    return {
      tab: 'empresas',
      isPwd: true,
      dialogEmpresa: false,
      dialogUsuario: false,
      dialogoAcceso: false,
      loadingE: false,
      loadingU: false,

      listaEmpresas: [],
      listaEmpresasFilter:[],
      filtroEmpresas: '',
      nuevaEmpresa: { nombre: '', rfc: '', tipo: '', sistemas: [] },

      listaUsuarios: [],
      listaUsuariosFilter:[],
      filtroUsuarios: '',
      nuevoUsuario: { usuario: '', nombreCompleto: '', password: '' },
      
      usuarioSeleccionado: null,
      accesoUsuario: [],
      cargandoAccesos: false,

      ligaUsuarioBusqueda: '',
      ligaEmpresaBusqueda: '',
      ligaUsuarioSelected: null,
      ligaEmpresaSelected: null,
      ligaSistema: 'auditor',
      resultadosUsuariosLiga: [],
      resultadosEmpresasLiga: [],

      colsEmpresas: [
        { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
        { name: 'rfc', label: 'RFC', field: 'rfc', align: 'left', sortable: true },
        { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'left', sortable: true },
        { name: 'sistemas', label: 'Sistemas', field: 'sistemas', align: 'left' },
        { name: 'estatus', label: 'Estatus', field: 'estatus', align: 'center' },
      ],
      colsUsuarios: [
        { name: 'usuario', label: 'Usuario', field: 'usuario', align: 'left', sortable: true },
        { name: 'nombreCompleto', label: 'Nombre', field: 'nombreCompleto', align: 'left', sortable: true },
        { name: 'ultimoAcceso', label: 'Último Acceso', field: 'ultimoAcceso', align: 'left', sortable: true },
        { name: 'estatus', label: 'Estatus', field: 'estatus', align: 'center' },
      ],
      colsAccesos: [
        { name: 'nombre', label: 'Empresa', field: 'nombre', align: 'left' },
        { name: 'rfc', label: 'RFC', field: 'rfc', align: 'left' },
        { name: 'sistema', label: 'Sistema', field: 'sistema', align: 'left' },
        { name: 'modulos', label: 'Módulos', field: 'modulos', align: 'left' },
        { name: 'rol', label: 'Rol', field: 'rol', align: 'left' },
        { name: 'estatus', label: 'Estatus', field: 'estatus', align: 'center' },
      ],
    }
  },
  computed: {
    rutaAxios() { return this.$store.state.rutaDescargas },  
    empresasFiltradas() {
      if (!this.filtroEmpresas) return this.listaEmpresas
      const f = this.filtroEmpresas.toLowerCase()
      return this.listaEmpresas.filter(e =>
        e.nombre?.toLowerCase().includes(f) ||
        e.rfc?.toLowerCase().includes(f)
      )
    },
    usuariosFiltrados() {
      if (!this.filtroUsuarios) return this.listaUsuarios
      const f = this.filtroUsuarios.toLowerCase()
      return this.listaUsuarios.filter(u =>
        u.usuario?.toLowerCase().includes(f) ||
        u.nombreCompleto?.toLowerCase().includes(f)
      )
    }
  },
  async created() {
    await this.cargarEmpresas()
    await this.cargarUsuarios()
  },
  methods: {
    async cargarEmpresas() {
      this.loadingE = true
      try {
        let r = await axios.get(this.rutaAxios + 'Administrador/lista-empresas')
        this.listaEmpresas = r.data
        this.loadingE = false

      } catch (e) {
        this.loadingE = false
        console.error(e)
      }
    },

    async cargarUsuarios() {
      this.loadingU = true
      try {
        let r = await axios.get(this.rutaAxios + 'Administrador/lista-usuarios')
        this.listaUsuarios = r.data
        this.loadingU = false
      } catch (e) { 
        console.error(e)
        this.loadingU = false
       }
    },

    async verAccesosUsuario(evt, row) {
      this.usuarioSeleccionado = row
      this.cargandoAccesos = true
      this.accesoUsuario = []
      try {
        let r = await axios.get(this.rutaAxios + `Administrador/accesos-usuario/${row._id}`)
        this.accesoUsuario = r.data
      } catch (e) { console.error(e) }
      finally { this.cargandoAccesos = false }
    },

    async crearEmpresa() {
      if (!this.nuevaEmpresa.nombre || !this.nuevaEmpresa.rfc || !this.nuevaEmpresa.tipo) {
        this.$q.notify({ type: 'warning', message: 'Complete todos los campos.' })
        return
      }
      try {
        let r = await axios.post(this.rutaAxios + 'Administrador/crear-empresa', this.nuevaEmpresa)
        this.$q.notify({ type: 'positive', message: r.data.mensaje })
        this.nuevaEmpresa = { nombre: '', rfc: '', tipo: '', sistemas: [] }
        this.dialogEmpresa = false
        await this.cargarEmpresas()
      } catch (e) {
        this.$q.notify({ type: 'negative', message: e.response?.data?.mensaje || 'Error al crear empresa' })
      }
    },

    async crearUsuario() {
      if (!this.nuevoUsuario.usuario || !this.nuevoUsuario.password) {
        this.$q.notify({ type: 'warning', message: 'Usuario y contraseña son obligatorios.' })
        return
      }
      try {
        let r = await axios.post(this.rutaAxios + 'Administrador/crear-usuario', this.nuevoUsuario)
        this.$q.notify({ type: 'positive', message: r.data.mensaje })
        this.nuevoUsuario = { usuario: '', nombreCompleto: '', password: '' }
        this.dialogUsuario = false
        await this.cargarUsuarios()
      } catch (e) {
        this.$q.notify({ type: 'negative', message: e.response?.data?.mensaje || 'Error al crear usuario' })
      }
    },

    async buscarUsuarioLiga() {
      if (!this.ligaUsuarioBusqueda) { this.resultadosUsuariosLiga = []; return }
      try {
        let r = await axios.get(this.rutaAxios + `Administrador/buscar-usuario/${this.ligaUsuarioBusqueda}`)
        this.resultadosUsuariosLiga = r.data
      } catch (e) { console.error(e) }
    },

    async buscarEmpresaLiga() {
      if (!this.ligaEmpresaBusqueda) { this.resultadosEmpresasLiga = []; return }
      try {
        let r = await axios.get(this.rutaAxios + `Administrador/buscar-empresa/${this.ligaEmpresaBusqueda}`)
        this.resultadosEmpresasLiga = r.data
      } catch (e) { console.error(e) }
    },

    async ligarUsuarioEmpresa() {
      if (!this.ligaUsuarioSelected || !this.ligaEmpresaSelected || !this.ligaSistema) {
        this.$q.notify({ type: 'warning', message: 'Seleccione usuario, empresa y sistema.' })
        return
      }
      try {
        let r = await axios.post(this.rutaAxios + 'Administrador/ligar-usuario-empresa', {
          _id_usuario: this.ligaUsuarioSelected,
          _id_empresa: this.ligaEmpresaSelected,
          sistema: this.ligaSistema
        })
        this.$q.notify({ type: 'positive', message: r.data.mensaje })
        this.ligaUsuarioSelected = null
        this.ligaEmpresaSelected = null
        this.ligaUsuarioBusqueda = ''
        this.ligaEmpresaBusqueda = ''
      } catch (e) {
        this.$q.notify({ type: 'negative', message: e.response?.data?.mensaje || 'Error al ligar' })
      }
    },

    filterFn(val, update) {
      update(() => {
        if (val === '') {
          this.listaEmpresasFilter = this.listaEmpresas  // muestra todo si no hay texto
        } else {
          const needle = val.toLowerCase()
          this.listaEmpresasFilter = this.listaEmpresas.filter(v =>
            v.nombre.toLowerCase().includes(needle)
          )
        }
      })
    },

    filterFnUsuario(val, update) {
      update(() => {
        if (val === '') {
          this.listaUsuariosFilter = this.listaUsuarios  // muestra todo si no hay texto
        } else {
          const needle = val.toLowerCase()
          this.listaUsuariosFilter = this.listaUsuarios.filter(v =>
            v.usuario.toLowerCase().includes(needle)
          )
        }
      })
    }
  }
}
</script>