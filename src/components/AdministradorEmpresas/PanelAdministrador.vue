<template>
  <div class="q-pa-md">
    <!-- DIALOGO EDITAR EMPRESA -->
    <q-dialog v-model="dialogEditarEmpresa" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="bg-primary text-white row items-center">
          <div class="text-h6">Editar Empresa</div>
          <q-space />
          <q-btn
            flat
            round
            dense
            icon="mdi-close"
            color="white"
            v-close-popup
          />
        </q-card-section>
        <q-card-section class="q-gutter-sm">
          <q-input filled dense v-model="empresaEdit.nombre" label="Nombre" />
          <q-input filled dense v-model="empresaEdit.rfc" label="RFC" />
          <q-select
            filled
            dense
            v-model="empresaEdit.tipo"
            label="Tipo"
            :options="['Empresa', 'Gasolinera', 'Sector_Publico']"
          />
          <q-select
            filled
            dense
            v-model="empresaEdit.sistemas"
            label="Sistemas"
            :options="['auditor', 'autoconta', 'facturacion']"
            multiple
            use-chips
          />
        </q-card-section>
        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            unelevated
            color="primary"
            label="Guardar"
            :loading="guardandoEdicion"
            @click="guardarEmpresa()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- DIALOGO EDITAR ACCESO -->
    <q-dialog v-model="dialogEditarAcceso" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="bg-primary text-white row items-center">
          <div class="text-h6">Editar Acceso</div>
          <q-space />
          <q-btn
            flat
            round
            dense
            icon="mdi-close"
            color="white"
            v-close-popup
          />
        </q-card-section>
        <q-card-section class="q-gutter-sm">
          <div class="text-caption text-grey-7">
            {{ usuarioSeleccionado ? usuarioSeleccionado.usuario : "" }} —
            {{ accesoEdit.nombre }}
          </div>
          <q-select
            filled
            dense
            v-model="accesoEdit.sistemas"
            label="Sistemas"
            :options="sistemasEmpresaEdit"
            multiple
            use-chips
          />
          <q-select
            filled
            dense
            v-model="accesoEdit.rol"
            label="Rol"
            :options="rolesDisponibles"
          />
          <q-toggle
            v-model="accesoEdit.todosModulos"
            label="Todos los módulos"
          />
          <q-select
            v-if="!accesoEdit.todosModulos"
            filled
            dense
            v-model="accesoEdit.modulos"
            label="Módulos (escribe y Enter)"
            multiple
            use-chips
            use-input
            hide-dropdown-icon
            new-value-mode="add-unique"
          />
        </q-card-section>
        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            unelevated
            color="primary"
            label="Guardar"
            :loading="guardandoEdicion"
            @click="guardarAcceso()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- DIALOGO EDITAR USUARIO -->
    <q-dialog v-model="dialogEditarUsuario" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="bg-primary text-white row items-center">
          <div class="text-h6">Editar Usuario</div>
          <q-space />
          <q-btn
            flat
            round
            dense
            icon="mdi-close"
            color="white"
            v-close-popup
          />
        </q-card-section>
        <q-card-section class="q-gutter-sm">
          <q-input filled dense v-model="usuarioEdit.usuario" label="Usuario" />
          <q-input
            filled
            dense
            v-model="usuarioEdit.nombreCompleto"
            label="Nombre Completo"
          />
          <q-input
            filled
            dense
            v-model="usuarioEdit.password"
            label="Nueva contraseña"
            hint="Déjala vacía para no cambiarla"
            :type="isPwdEdit ? 'password' : 'text'"
          >
            <template v-slot:append>
              <q-icon
                :name="isPwdEdit ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwdEdit = !isPwdEdit"
              />
            </template>
          </q-input>
        </q-card-section>
        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            unelevated
            color="primary"
            label="Guardar"
            :loading="guardandoUsuario"
            @click="guardarUsuario()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-tabs
      v-model="tab"
      dense
      align="left"
      class="q-mb-md"
      active-color="primary"
      indicator-color="primary"
    >
      <q-tab name="empresas" label="Empresas" icon="mdi-domain" />
      <q-tab name="usuarios" label="Usuarios" icon="mdi-account" />
    </q-tabs>

    <q-separator />

    <q-tab-panels v-model="tab" animated style="width: 100%">
      <!-- TAB EMPRESAS -->
      <q-tab-panel name="empresas">
        <div class="row items-center q-mb-md">
          <div class="text-h6 col">
            Empresas registradas ({{ listaEmpresas.length }})
          </div>
          <q-input
            dense
            filled
            v-model="filtroEmpresas"
            placeholder="Buscar..."
            style="width: 220px"
            class="q-mr-sm"
          >
            <template v-slot:append><q-icon name="mdi-magnify" /></template>
          </q-input>
          <q-btn
            unelevated
            color="green-7"
            icon="mdi-microsoft-excel"
            class="q-mr-sm"
            label="Excel"
            @click="exportarEmpresas()"
          />
          <q-btn
            unelevated
            color="primary"
            icon="mdi-plus"
            class="q-mr-sm"
            label="Nuevo Acceso"
            @click="dialogoAcceso = true"
          />
          <q-btn
            unelevated
            color="primary"
            icon="mdi-plus"
            class="q-mr-sm"
            label="Nueva Empresa"
            @click="dialogEmpresa = true"
          />
          <q-btn
            unelevated
            color="primary"
            icon="mdi-refresh"
            label="Actualizar"
            @click="cargarEmpresas()"
          />
        </div>

        <q-table
          :data="empresasFiltradas"
          :columns="colsEmpresas"
          row-key="_id"
          flat
          bordered
          dense
          :rows-per-page-options="[15, 30, 50]"
          :loading="loadingE"
          @row-click="verUsuariosEmpresa"
        >
          <template v-slot:body-cell-sistemas="props">
            <q-td :props="props">
              <q-chip
                v-for="s in props.row.sistemas"
                :key="s"
                dense
                color="primary"
                text-color="white"
                size="sm"
              >
                {{ s }}
              </q-chip>
            </q-td>
          </template>
          <template v-slot:body-cell-estatus="props">
            <q-td :props="props">
              <q-badge
                :color="
                  props.row.estatus === 'Activo' ? 'positive' : 'negative'
                "
              >
                {{ props.row.estatus }}
              </q-badge>
            </q-td>
          </template>
          <template v-slot:body-cell-acciones="props">
            <q-td :props="props">
              <q-btn
                v-if="props.row.estatus == 'Activo'"
                round
                dense
                flat
                icon="mdi-delete"
                color="negative"
                @click.stop="confirmarEliminarEmpresa(props.row)"
              >
                <q-tooltip>Eliminar empresa</q-tooltip>
              </q-btn>
              <q-btn
                v-if="props.row.estatus == 'Activo'"
                round
                dense
                flat
                icon="mdi-pencil"
                color="primary"
                @click.stop="abrirEditarEmpresa(props.row)"
              >
                <q-tooltip>Editar empresa</q-tooltip>
              </q-btn>
              <q-btn
                v-if="props.row.estatus == 'Eliminado'"
                round
                dense
                flat
                icon="mdi-check-circle"
                color="positive"
                @click.stop="confirmarActivarEmpresa(props.row)"
              >
                <q-tooltip>Activar empresa</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>

        <!-- USUARIOS DE LA EMPRESA SELECCIONADA -->
        <q-card
          flat
          bordered
          class="q-mt-md full-width"
          v-if="empresaSeleccionada"
        >
          <q-card-section class="bg-orange-1 row items-center">
            <q-icon name="mdi-domain" class="q-mr-sm" color="orange-8" />
            <div class="text-subtitle1 text-weight-bold col">
              Usuarios de: {{ empresaSeleccionada.nombre }}
            </div>
            <q-input
              dense
              filled
              v-model="filtroUsuariosEmpresa"
              placeholder="Buscar..."
              style="width: 220px"
              class="q-mr-sm"
            >
              <template v-slot:append><q-icon name="mdi-magnify" /></template>
            </q-input>

            <q-btn
              unelevated
              color="green-7"
              icon="mdi-microsoft-excel"
              class="q-mr-sm"
              label="Excel"
              @click="exportarUsuariosEmpresa()"
            />
            <q-btn
              flat
              round
              dense
              icon="mdi-close"
              @click="
                empresaSeleccionada = null;
                usuariosEmpresa = [];
              "
            />
          </q-card-section>
          <q-table
            :data="usuariosEmpresa"
            :columns="colsUsuariosEmpresa"
            row-key="idUsuario"
            flat
            dense
            :loading="cargandoUsuariosEmpresa"
            :rows-per-page-options="[10, 20]"
            :filter="filtroUsuariosEmpresa"
          >
            <template v-slot:body-cell-modulos="props">
              <q-td :props="props">
                <q-chip
                  v-for="m in props.row.modulos"
                  :key="m"
                  dense
                  color="teal"
                  text-color="white"
                  size="sm"
                >
                  {{ m === "*" ? "Todos" : m }}
                </q-chip>
              </q-td>
            </template>
            <template v-slot:body-cell-estatus="props">
              <q-td :props="props">
                <q-badge
                  :color="
                    props.row.estatus === 'Activo' ? 'positive' : 'negative'
                  "
                >
                  {{ props.row.estatus }}
                </q-badge>
              </q-td>
            </template>
          </q-table>
        </q-card>
      </q-tab-panel>

      <!-- TAB USUARIOS -->
      <q-tab-panel name="usuarios">
        <div class="row items-center q-mb-md">
          <div class="text-h6 col">
            Usuarios registrados ({{ usuariosFiltrados.length }})
          </div>
          <q-input
            dense
            filled
            v-model="filtroUsuarios"
            placeholder="Buscar..."
            style="width: 220px"
            class="q-mr-sm"
          >
            <template v-slot:append><q-icon name="mdi-magnify" /></template>
          </q-input>
          <q-btn
            unelevated
            color="green-7"
            icon="mdi-microsoft-excel"
            class="q-mr-sm"
            label="Excel"
            @click="exportarUsuarios()"
          />
          <q-btn
            unelevated
            color="primary"
            icon="mdi-plus"
            class="q-mr-sm"
            label="Nuevo Acceso"
            @click="dialogoAcceso = true"
          />
          <q-btn
            unelevated
            color="primary"
            icon="mdi-plus"
            class="q-mr-sm"
            label="Nuevo Usuario"
            @click="dialogUsuario = true"
          />
          <q-btn
            unelevated
            color="primary"
            icon="mdi-refresh"
            label="Actualizar"
            @click="cargarUsuarios()"
          />
        </div>

        <q-table
          :data="usuariosFiltrados"
          :columns="colsUsuarios"
          row-key="_id"
          flat
          bordered
          dense
          :rows-per-page-options="[15, 30, 50]"
          @row-click="verAccesosUsuario"
          :loading="loadingU"
        >
          <!-- <template v-slot:body-cell-estatus="props">
            <q-td :props="props">
              <q-badge :color="props.row.estatus === 'Activo' ? 'positive' : 'negative'">
                {{ props.row.estatus }}
              </q-badge>
            </q-td>
          </template> -->
          <template v-slot:body-cell-acciones="props">
            <q-td :props="props">
              <!-- Cambiar estatus -->
              <q-btn
                v-if="props.row.estatus == 'Eliminado'"
                round
                dense
                flat
                :icon="
                  props.row.estatus === 'Activo'
                    ? 'mdi-cancel'
                    : 'mdi-check-circle'
                "
                :color="
                  props.row.estatus === 'Activo' ? 'negative' : 'positive'
                "
                @click.stop="confirmarActivarUsuario(props.row)"
              >
                <q-tooltip>{{
                  props.row.estatus === "Activo" ? "Desactivar" : "Activar"
                }}</q-tooltip>
              </q-btn>
              <!-- Eliminar -->
              <q-btn
                v-if="props.row.estatus == 'Activo'"
                round
                dense
                flat
                icon="mdi-delete"
                color="negative"
                @click.stop="confirmarEliminarUsuario(props.row)"
              >
                <q-tooltip>Eliminar usuario</q-tooltip>
              </q-btn>

              <q-btn
                v-if="props.row.estatus == 'Activo'"
                round
                dense
                flat
                icon="mdi-pencil"
                color="primary"
                @click.stop="abrirEditarUsuario(props.row)"
              >
                <q-tooltip>Editar usuario</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>

        <!-- EMPRESAS DEL USUARIO SELECCIONADO -->
        <q-card
          flat
          bordered
          class="q-mt-md full-width"
          v-if="usuarioSeleccionado"
        >
          <q-card-section class="bg-blue-1 row items-center">
            <q-icon name="mdi-account" class="q-mr-sm" color="primary" />
            <div class="text-subtitle1 text-weight-bold col">
              Empresas de: {{ usuarioSeleccionado.usuario }}
            </div>
            <q-input
              dense
              filled
              v-model="filtroEmpresaUsuario"
              placeholder="Buscar..."
              style="width: 220px"
              class="q-mr-sm"
            >
              <template v-slot:append><q-icon name="mdi-magnify" /></template>
            </q-input>
            <q-btn
              unelevated
              color="green-7"
              icon="mdi-microsoft-excel"
              class="q-mr-sm"
              label="Excel"
              @click="exportarAccesosUsuario()"
            />
            <q-btn
              flat
              round
              dense
              icon="mdi-close"
              @click="
                usuarioSeleccionado = null;
                accesoUsuario = [];
              "
            />
          </q-card-section>
          <q-table
            :data="accesoUsuario"
            :columns="colsAccesos"
            row-key="_id"
            flat
            dense
            :loading="cargandoAccesos"
            :rows-per-page-options="[10, 20]"
            :filter="filtroEmpresaUsuario"
          >
            <template v-slot:body-cell-modulos="props">
              <q-td :props="props">
                <q-chip
                  v-for="m in props.row.modulos"
                  :key="m"
                  dense
                  color="teal"
                  text-color="white"
                  size="sm"
                >
                  {{ m === "*" ? "Todos" : m }}
                </q-chip>
              </q-td>
            </template>
            <template v-slot:body-cell-estatus="props">
              <q-td :props="props">
                <q-badge
                  :color="
                    props.row.estatus === 'Activo' ? 'positive' : 'negative'
                  "
                >
                  {{ props.row.estatus }}
                </q-badge>
              </q-td>
            </template>
            <template v-slot:body-cell-acciones="props">
              <q-td :props="props">
                <q-btn
                  v-if="props.row.estatus == 'Activo'"
                  round
                  dense
                  flat
                  icon="mdi-delete"
                  color="negative"
                  @click.stop="confirmarEliminarAcceso(props.row)"
                >
                  <q-tooltip>Quitar empresa</q-tooltip>
                </q-btn>

                <q-btn
                  v-if="props.row.estatus == 'Activo'"
                  round
                  dense
                  flat
                  icon="mdi-pencil"
                  color="primary"
                  @click.stop="abrirEditarAcceso(props.row)"
                >
                  <q-tooltip>Editar acceso</q-tooltip>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </q-card>
      </q-tab-panel>
    </q-tab-panels>

    <!-- DIALOGO NUEVO ACCESO -->
    <q-dialog v-model="dialogoAcceso" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="bg-primary text-white row items-center">
          <div class="text-h6">Nuevo Acceso</div>
          <q-space />
          <q-btn
            flat
            round
            dense
            icon="mdi-close"
            color="white"
            v-close-popup
          />
        </q-card-section>
        <q-card-section class="q-gutter-sm">
          <q-select
            filled
            dense
            v-model="ligaUsuarioSelected"
            :options="listaUsuariosFilter"
            option-label="usuario"
            option-value="_id"
            label="Seleccionar usuario"
            emit-value
            map-options
            @filter="filterFnUsuario"
            use-input
          />
          <q-select
            filled
            dense
            v-model="ligaEmpresaSelected"
            :options="listaEmpresasFilter"
            :option-label="(e) => e.rfc + ' — ' + e.nombre"
            option-value="_id"
            label="Seleccionar empresa"
            emit-value
            map-options
            @filter="filterFn"
            use-input
          />
          <q-select
            filled
            dense
            v-model="ligaSistema"
            :options="['auditor', 'autoconta', 'facturacion']"
            label="Sistema"
            multiple
            use-chips
          />
        </q-card-section>
        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat class="full-width" label="Cancelar" v-close-popup />
          <q-btn
            unelevated
            color="primary"
            class="full-width"
            label="Ligar"
            @click="ligarUsuarioEmpresa()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- DIALOGO NUEVA EMPRESA -->
    <q-dialog v-model="dialogEmpresa" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="bg-primary text-white row items-center">
          <div class="text-h6">Nueva Empresa</div>
          <q-space />
          <q-btn
            flat
            round
            dense
            icon="mdi-close"
            color="white"
            v-close-popup
          />
        </q-card-section>
        <q-card-section class="q-gutter-sm">
          <q-input filled dense v-model="nuevaEmpresa.nombre" label="Nombre" />
          <q-input filled dense v-model="nuevaEmpresa.rfc" label="RFC" />
          <q-select
            filled
            dense
            v-model="nuevaEmpresa.tipo"
            label="Tipo"
            :options="['Empresa', 'Gasolinera', 'Sector_Publico']"
          />
          <q-select
            filled
            dense
            v-model="nuevaEmpresa.sistemas"
            label="Sistemas"
            :options="['auditor', 'autoconta', 'facturacion']"
            multiple
            use-chips
          />
        </q-card-section>
        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            unelevated
            color="primary"
            label="Crear"
            @click="crearEmpresa()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- DIALOGO NUEVO USUARIO -->
    <q-dialog v-model="dialogUsuario" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="bg-primary text-white row items-center">
          <div class="text-h6">Nuevo Usuario</div>
          <q-space />
          <q-btn
            flat
            round
            dense
            icon="mdi-close"
            color="white"
            v-close-popup
          />
        </q-card-section>
        <q-card-section class="q-gutter-sm">
          <q-input
            filled
            dense
            v-model="nuevoUsuario.usuario"
            label="Usuario"
          />
          <q-input
            filled
            dense
            v-model="nuevoUsuario.nombreCompleto"
            label="Nombre Completo"
          />
          <q-input
            filled
            dense
            v-model="nuevoUsuario.password"
            label="Contraseña"
            :type="isPwd ? 'password' : 'text'"
          >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>
        </q-card-section>
        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            unelevated
            color="primary"
            label="Crear"
            @click="crearUsuario()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import axios from "axios";
import * as XLSX from "xlsx";

export default {
  name: "PanelAdmin",
  data() {
    return {
      tab: "empresas",
      isPwd: true,
      dialogEmpresa: false,
      dialogUsuario: false,
      dialogoAcceso: false,
      loadingE: false,
      loadingU: false,

      listaEmpresas: [],
      listaEmpresasFilter: [],
      filtroEmpresas: "",
      nuevaEmpresa: { nombre: "", rfc: "", tipo: "", sistemas: [] },

      // Usuarios de empresa seleccionada
      empresaSeleccionada: null,
      usuariosEmpresa: [],
      cargandoUsuariosEmpresa: false,

      listaUsuarios: [],
      listaUsuariosFilter: [],
      filtroUsuarios: "",
      nuevoUsuario: { usuario: "", nombreCompleto: "", password: "" },

      usuarioSeleccionado: null,
      accesoUsuario: [],
      cargandoAccesos: false,

      ligaUsuarioSelected: null,
      ligaEmpresaSelected: null,
      ligaSistema: [],

      colsEmpresas: [
        {
          name: "nombre",
          label: "Nombre",
          field: "nombre",
          align: "left",
          sortable: true,
        },
        {
          name: "rfc",
          label: "RFC",
          field: "rfc",
          align: "left",
          sortable: true,
        },
        {
          name: "tipo",
          label: "Tipo",
          field: "tipo",
          align: "left",
          sortable: true,
        },
        {
          name: "sistemas",
          label: "Sistemas",
          field: "sistemas",
          align: "left",
          sortable: true,
        },
        {
          name: "estatus",
          label: "Estatus",
          field: "estatus",
          align: "center",
          sortable: true,
        },
        {
          name: "acciones",
          label: "Acciones",
          field: "acciones",
          align: "center",
        },
      ],
      colsUsuarios: [
        {
          name: "usuario",
          label: "Usuario",
          field: "usuario",
          align: "left",
          sortable: true,
        },
        {
          name: "nombreCompleto",
          label: "Nombre",
          field: "nombreCompleto",
          align: "left",
          sortable: true,
        },
        {
          name: "ultimoAcceso",
          label: "Último Acceso",
          field: "ultimoAcceso",
          align: "left",
          sortable: true,
          format: (val) =>
            val
              ? new Date(val).toLocaleString("es-MX", {
                  timeZone: "America/Mexico_City",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })
              : "—",
        },
        {
          name: "estatus",
          label: "Estatus",
          field: "estatus",
          align: "center",
          sortable: true,
        },
        {
          name: "acciones",
          label: "Acciones",
          field: "acciones",
          align: "center",
        },
      ],
      colsAccesos: [
        {
          name: "nombre",
          label: "Empresa",
          field: "nombre",
          align: "left",
          sortable: true,
        },
        {
          name: "rfc",
          label: "RFC",
          field: "rfc",
          align: "left",
          sortable: true,
        },
        {
          name: "sistema",
          label: "Sistema",
          field: "sistema",
          align: "left",
          sortable: true,
        },
        {
          name: "modulos",
          label: "Módulos",
          field: "modulos",
          align: "left",
          sortable: true,
        },
        {
          name: "rol",
          label: "Rol",
          field: "rol",
          align: "left",
          sortable: true,
        },
        {
          name: "estatus",
          label: "Estatus",
          field: "estatus",
          align: "center",
          sortable: true,
        },
        {
          name: "acciones",
          label: "Acciones",
          field: "acciones",
          align: "center",
        },
      ],
      colsUsuariosEmpresa: [
        {
          name: "usuario",
          label: "Usuario",
          field: "usuario",
          align: "left",
          sortable: true,
        },
        {
          name: "nombreCompleto",
          label: "Nombre",
          field: "nombreCompleto",
          align: "left",
          sortable: true,
        },
        {
          name: "rol",
          label: "Rol",
          field: "rol",
          align: "left",
          sortable: true,
        },
        {
          name: "modulos",
          label: "Módulos",
          field: "modulos",
          align: "left",
          sortable: true,
        },
        {
          name: "estatus",
          label: "Estatus",
          field: "estatus",
          align: "center",
          sortable: true,
        },
      ],
      filtroUsuariosEmpresa: "",
      filtroEmpresaUsuario: "",

      dialogEditarEmpresa: false,
      dialogEditarAcceso: false,
      guardandoEdicion: false,
      empresaEdit: { _id: "", nombre: "", rfc: "", tipo: "", sistemas: [] },
      sistemasOriginalesEdit: [],
      accesoEdit: {
        _id_empresa: "",
        nombre: "",
        sistemas: [],
        rol: "Administrador",
        todosModulos: true,
        modulos: [],
      },
      sistemasEmpresaEdit: [],
      rolesDisponibles: ["Administrador"], // agrega aquí los roles que manejen

      dialogEditarUsuario: false,
      guardandoUsuario: false,
      isPwdEdit: true,
      usuarioEdit: { _id: "", usuario: "", nombreCompleto: "", password: "" },
    };
  },
  computed: {
    rutaAxios() {
      return this.$store.state.rutaDescargas;
    },
    empresasFiltradas() {
      if (!this.filtroEmpresas) return this.listaEmpresas;
      const f = this.filtroEmpresas.toLowerCase();
      return this.listaEmpresas.filter(
        (e) =>
          e.nombre?.toLowerCase().includes(f) ||
          e.rfc?.toLowerCase().includes(f)
      );
    },
    usuariosFiltrados() {
      if (!this.filtroUsuarios) return this.listaUsuarios;
      const f = this.filtroUsuarios.toLowerCase();
      return this.listaUsuarios.filter(
        (u) =>
          u.usuario?.toLowerCase().includes(f) ||
          u.nombreCompleto?.toLowerCase().includes(f)
      );
    },
  },
  async created() {
    await this.cargarEmpresas();
    await this.cargarUsuarios();
  },
  methods: {
    // ─── CARGA ───────────────────────────────────
    async cargarEmpresas() {
      this.loadingE = true;
      try {
        let r = await axios.get(
          this.rutaAxios + "Administrador/lista-empresas"
        );
        this.listaEmpresas = r.data;
      } catch (e) {
        console.error(e);
      } finally {
        this.loadingE = false;
      }
    },

    async cargarUsuarios() {
      this.loadingU = true;
      try {
        let r = await axios.get(
          this.rutaAxios + "Administrador/lista-usuarios"
        );
        this.listaUsuarios = r.data;
      } catch (e) {
        console.error(e);
      } finally {
        this.loadingU = false;
      }
    },

    // ─── VER USUARIOS DE EMPRESA ─────────────────
    async verUsuariosEmpresa(evt, row) {
      this.empresaSeleccionada = row;
      this.cargandoUsuariosEmpresa = true;
      this.usuariosEmpresa = [];
      try {
        let r = await axios.get(
          this.rutaAxios + `Administrador/usuarios-empresa/${row._id}`
        );
        this.usuariosEmpresa = r.data;
      } catch (e) {
        console.error(e);
      } finally {
        this.cargandoUsuariosEmpresa = false;
      }
    },

    // ─── VER EMPRESAS DE USUARIO ─────────────────
    async verAccesosUsuario(evt, row) {
      this.usuarioSeleccionado = row;
      this.cargandoAccesos = true;
      this.accesoUsuario = [];
      try {
        let r = await axios.get(
          this.rutaAxios + `Administrador/accesos-usuario/${row._id}`
        );
        this.accesoUsuario = r.data;
      } catch (e) {
        console.error(e);
      } finally {
        this.cargandoAccesos = false;
      }
    },

    // ─── CREAR ───────────────────────────────────
    async crearEmpresa() {
      if (
        !this.nuevaEmpresa.nombre ||
        !this.nuevaEmpresa.rfc ||
        !this.nuevaEmpresa.tipo
      ) {
        this.$q.notify({
          type: "warning",
          message: "Complete todos los campos.",
        });
        return;
      }
      try {
        let r = await axios.post(
          this.rutaAxios + "Administrador/crear-empresa",
          this.nuevaEmpresa
        );
        this.$q.notify({ type: "positive", message: r.data.mensaje });
        this.nuevaEmpresa = { nombre: "", rfc: "", tipo: "", sistemas: [] };
        this.dialogEmpresa = false;
        await this.cargarEmpresas();
      } catch (e) {
        this.$q.notify({
          type: "negative",
          message: e.response?.data?.mensaje || "Error al crear empresa",
        });
      }
    },

    async crearUsuario() {
      if (!this.nuevoUsuario.usuario || !this.nuevoUsuario.password) {
        this.$q.notify({
          type: "warning",
          message: "Usuario y contraseña son obligatorios.",
        });
        return;
      }
      try {
        let r = await axios.post(
          this.rutaAxios + "Administrador/crear-usuario",
          this.nuevoUsuario
        );
        this.$q.notify({ type: "positive", message: r.data.mensaje });
        this.nuevoUsuario = { usuario: "", nombreCompleto: "", password: "" };
        this.dialogUsuario = false;
        await this.cargarUsuarios();
      } catch (e) {
        this.$q.notify({
          type: "negative",
          message: e.response?.data?.mensaje || "Error al crear usuario",
        });
      }
    },

    async ligarUsuarioEmpresa() {
      if (
        !this.ligaUsuarioSelected ||
        !this.ligaEmpresaSelected ||
        !this.ligaSistema.length
      ) {
        this.$q.notify({
          type: "warning",
          message: "Seleccione usuario, empresa y al menos un sistema.",
        });
        return;
      }
      try {
        // ✅ Llama una vez por cada sistema seleccionado
        const promesas = this.ligaSistema.map((sistema) =>
          axios.post(this.rutaAxios + "Administrador/ligar-usuario-empresa", {
            _id_usuario: this.ligaUsuarioSelected,
            _id_empresa: this.ligaEmpresaSelected,
            sistema: sistema,
          })
        );

        await Promise.all(promesas);

        this.$q.notify({
          type: "positive",
          message: `Accesos creados: ${this.ligaSistema.join(", ")}`,
        });
        this.ligaUsuarioSelected = null;
        this.ligaEmpresaSelected = null;
        this.ligaSistema = [];
        this.dialogoAcceso = false;
      } catch (e) {
        this.$q.notify({
          type: "negative",
          message: e.response?.data?.mensaje || "Error al ligar",
        });
      }
    },

    // ─── EXPORTAR EXCEL ──────────────────────────
    exportarExcel(datos, columnas, nombreArchivo) {
      const filas = datos.map((row) => {
        const obj = {};
        columnas.forEach((col) => {
          let val = row[col.field];
          // Arrays como sistemas/modulos los convierte a string
          if (Array.isArray(val)) val = val.join(", ");
          obj[col.label] = val ?? "";
        });
        return obj;
      });

      const ws = XLSX.utils.json_to_sheet(filas);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Datos");
      XLSX.writeFile(wb, `${nombreArchivo}.xlsx`);
    },

    exportarEmpresas() {
      this.exportarExcel(this.empresasFiltradas, this.colsEmpresas, "Empresas");
    },

    exportarUsuarios() {
      this.exportarExcel(this.usuariosFiltrados, this.colsUsuarios, "Usuarios");
    },

    exportarAccesosUsuario() {
      const nombre = this.usuarioSeleccionado?.usuario || "usuario";
      this.exportarExcel(
        this.accesoUsuario,
        this.colsAccesos,
        `Accesos_${nombre}`
      );
    },

    exportarUsuariosEmpresa() {
      const nombre = this.empresaSeleccionada?.nombre || "empresa";
      this.exportarExcel(
        this.usuariosEmpresa,
        this.colsUsuariosEmpresa,
        `Usuarios_${nombre}`
      );
    },

    // ─── FILTROS SELECT ──────────────────────────
    filterFn(val, update) {
      update(() => {
        const needle = val.toLowerCase();
        this.listaEmpresasFilter =
          val === ""
            ? this.listaEmpresas
            : this.listaEmpresas.filter(
                (v) =>
                  v.nombre?.toLowerCase().includes(needle) ||
                  v.rfc?.toLowerCase().includes(needle) // ✅ busca por RFC también
              );
      });
    },

    filterFnUsuario(val, update) {
      update(() => {
        const needle = val.toLowerCase();
        this.listaUsuariosFilter =
          val === ""
            ? this.listaUsuarios
            : this.listaUsuarios.filter((v) =>
                v.usuario.toLowerCase().includes(needle)
              );
      });
    },

    confirmarEliminarUsuario(row) {
      this.$q
        .dialog({
          title: "Confirmar",
          message: `¿Eliminar al usuario "${row.usuario}"?`,
          cancel: true,
          persistent: true,
        })
        .onOk(async () => {
          try {
            await axios.delete(
              this.rutaAxios + `Administrador/eliminar-usuario/${row._id}`
            );
            row.estatus = "Eliminado";
            if (this.usuarioSeleccionado?._id === row._id) {
              this.usuarioSeleccionado = null;
              this.accesoUsuario = [];
            }
            this.$q.notify({ type: "positive", message: "Usuario eliminado." });
          } catch (e) {
            this.$q.notify({
              type: "negative",
              message: "Error al eliminar usuario",
            });
          }
        });
    },

    confirmarActivarUsuario(row) {
      this.$q
        .dialog({
          title: "Confirmar",
          message: `¿Activar usuario "${row.usuario}"?`,
          cancel: true,
          persistent: true,
        })
        .onOk(async () => {
          try {
            await axios.put(
              this.rutaAxios + `Administrador/activar-usuario/${row._id}`
            );
            row.estatus = "Activo";
            this.$q.notify({ type: "positive", message: "Usuario activado." });
          } catch (e) {
            this.$q.notify({
              type: "negative",
              message: "Error al activar usuario",
            });
          }
        });
    },

    confirmarEliminarEmpresa(row) {
      this.$q
        .dialog({
          title: "Confirmar",
          message: `¿Eliminar la empresa "${row.nombre}"? También se desactivarán todos sus accesos.`,
          cancel: true,
          persistent: true,
        })
        .onOk(async () => {
          try {
            await axios.delete(
              this.rutaAxios + `Administrador/eliminar-empresa/${row._id}`
            );
            row.estatus = "Eliminado";
            if (this.empresaSeleccionada?._id === row._id) {
              this.empresaSeleccionada = null;
              this.usuariosEmpresa = [];
            }
            this.$q.notify({ type: "positive", message: "Empresa eliminada." });
          } catch (e) {
            this.$q.notify({
              type: "negative",
              message: "Error al eliminar empresa",
            });
          }
        });
    },

    confirmarActivarEmpresa(row) {
      this.$q
        .dialog({
          title: "Confirmar",
          message: `¿Activar la empresa "${row.nombre}"? Los accesos de sus usuarios no se restauran, hay que volver a ligarlos.`,
          cancel: true,
          persistent: true,
        })
        .onOk(async () => {
          try {
            await axios.put(
              this.rutaAxios + `Administrador/activar-empresa/${row._id}`
            );
            row.estatus = "Activo";
            this.$q.notify({ type: "positive", message: "Empresa activada." });
          } catch (e) {
            this.$q.notify({
              type: "negative",
              message: "Error al activar empresa",
            });
          }
        });
    },

    confirmarEliminarAcceso(row) {
      console.log(row);
      this.$q
        .dialog({
          title: "Confirmar",
          message: `¿Quitar el acceso a "${row.nombre}" de este usuario?`,
          cancel: true,
          persistent: true,
        })
        .onOk(async () => {
          try {
            await axios.delete(
              this.rutaAxios + "Administrador/eliminar-acceso",
              {
                data: {
                  _id_usuario: this.usuarioSeleccionado._id,
                  _id_empresa: row._id_empresa,
                },
              }
            );
            // ✅ quitar de la lista sin recargar
            this.accesoUsuario = this.accesoUsuario.filter(
              (a) => a._id_empresa !== row._id_empresa
            );
            this.$q.notify({ type: "positive", message: "Acceso eliminado." });
          } catch (e) {
            this.$q.notify({
              type: "negative",
              message: "Error al eliminar acceso",
            });
          }
        });
    },

    formatFecha(fecha) {
      if (!fecha) return "—";
      const date = new Date(fecha);
      return date.toLocaleString("es-MX", {
        timeZone: "America/Mexico_City",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    },
    // ─── EDITAR EMPRESA ──────────────────────────
    abrirEditarEmpresa(row) {
      this.empresaEdit = {
        _id: row._id,
        nombre: row.nombre,
        rfc: row.rfc,
        tipo: row.tipo,
        sistemas: (row.sistemas || []).slice(),
      };
      this.sistemasOriginalesEdit = (row.sistemas || []).slice();
      this.dialogEditarEmpresa = true;
    },

    guardarEmpresa() {
      const e = this.empresaEdit;
      if (!e.nombre || !e.rfc || !e.tipo || !e.sistemas.length) {
        this.$q.notify({
          type: "warning",
          message: "Complete todos los campos y al menos un sistema.",
        });
        return;
      }

      const retirados = this.sistemasOriginalesEdit.filter(
        (s) => e.sistemas.indexOf(s) === -1
      );
      if (retirados.length) {
        this.$q
          .dialog({
            title: "Confirmar",
            message: `Se quitará ${retirados.join(
              ", "
            )} a la empresa y se eliminarán los accesos de sus usuarios a ese sistema. ¿Continuar?`,
            cancel: true,
            persistent: true,
          })
          .onOk(() => this.enviarEdicionEmpresa());
      } else {
        this.enviarEdicionEmpresa();
      }
    },

    async enviarEdicionEmpresa() {
      this.guardandoEdicion = true;
      try {
        let r = await axios.put(
          this.rutaAxios + "Administrador/editar-empresa",
          this.empresaEdit
        );
        this.$q.notify({ type: "positive", message: r.data.mensaje });
        this.dialogEditarEmpresa = false;
        await this.cargarEmpresas();

        if (
          this.empresaSeleccionada &&
          this.empresaSeleccionada._id === this.empresaEdit._id
        ) {
          const actualizada = this.listaEmpresas.find(
            (x) => x._id === this.empresaEdit._id
          );
          if (actualizada) await this.verUsuariosEmpresa(null, actualizada);
        }
      } catch (err) {
        this.$q.notify({
          type: "negative",
          message:
            (err.response && err.response.data && err.response.data.mensaje) ||
            "Error al editar empresa",
        });
      } finally {
        this.guardandoEdicion = false;
      }
    },

    // ─── EDITAR ACCESO ───────────────────────────
    abrirEditarAcceso(row) {
      const empresa = this.listaEmpresas.find((e) => e._id === row._id_empresa);
      this.sistemasEmpresaEdit =
        empresa && empresa.sistemas ? empresa.sistemas : [];

      const modulos = row.modulos || [];
      this.accesoEdit = {
        _id_empresa: row._id_empresa,
        nombre: row.nombre,
        sistemas: row.sistema ? row.sistema.split(", ") : [],
        rol: row.rol || "Administrador",
        todosModulos: modulos.length === 0 || modulos.indexOf("*") !== -1,
        modulos: modulos.filter((m) => m !== "*"),
      };
      this.dialogEditarAcceso = true;
    },

    async guardarAcceso() {
      const a = this.accesoEdit;
      if (!a.sistemas.length) {
        this.$q.notify({
          type: "warning",
          message:
            "Seleccione al menos un sistema. Para quitar el acceso use Eliminar.",
        });
        return;
      }
      if (!a.todosModulos && !a.modulos.length) {
        this.$q.notify({
          type: "warning",
          message: 'Agregue al menos un módulo o active "Todos los módulos".',
        });
        return;
      }

      this.guardandoEdicion = true;
      try {
        let r = await axios.put(
          this.rutaAxios + "Administrador/editar-acceso",
          {
            _id_usuario: this.usuarioSeleccionado._id,
            _id_empresa: a._id_empresa,
            sistemas: a.sistemas,
            rol: a.rol,
            modulos: a.todosModulos ? ["*"] : a.modulos,
          }
        );
        this.$q.notify({ type: "positive", message: r.data.mensaje });
        this.dialogEditarAcceso = false;
        await this.verAccesosUsuario(null, this.usuarioSeleccionado);

        if (
          this.empresaSeleccionada &&
          this.empresaSeleccionada._id === a._id_empresa
        ) {
          await this.verUsuariosEmpresa(null, this.empresaSeleccionada);
        }
      } catch (err) {
        this.$q.notify({
          type: "negative",
          message:
            (err.response && err.response.data && err.response.data.mensaje) ||
            "Error al editar acceso",
        });
      } finally {
        this.guardandoEdicion = false;
      }
    },

    // ─── EDITAR USUARIO ──────────────────────────
    abrirEditarUsuario(row) {
      this.usuarioEdit = {
        _id: row._id,
        usuario: row.usuario,
        nombreCompleto: row.nombreCompleto || "",
        password: "",
      };
      this.isPwdEdit = true;
      this.dialogEditarUsuario = true;
    },

    async guardarUsuario() {
      if (!this.usuarioEdit.usuario) {
        this.$q.notify({
          type: "warning",
          message: "El usuario es obligatorio.",
        });
        return;
      }

      this.guardandoUsuario = true;
      try {
        let r = await axios.put(
          this.rutaAxios + "Administrador/editar-usuario",
          this.usuarioEdit
        );
        this.$q.notify({ type: "positive", message: r.data.mensaje });
        this.dialogEditarUsuario = false;
        await this.cargarUsuarios();

        // Si es el usuario que está abierto en el panel de detalle, refresca el encabezado
        if (
          this.usuarioSeleccionado &&
          this.usuarioSeleccionado._id === this.usuarioEdit._id
        ) {
          const actualizado = this.listaUsuarios.find(
            (u) => u._id === this.usuarioEdit._id
          );
          if (actualizado) this.usuarioSeleccionado = actualizado;
        }

        // Si hay una empresa abierta, refresca su lista por si aparece este usuario
        if (this.empresaSeleccionada) {
          await this.verUsuariosEmpresa(null, this.empresaSeleccionada);
        }
      } catch (err) {
        this.$q.notify({
          type: "negative",
          message:
            (err.response && err.response.data && err.response.data.mensaje) ||
            "Error al editar usuario",
        });
      } finally {
        this.guardandoUsuario = false;
      }
    },
  },
};
</script>