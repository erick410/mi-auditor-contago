<template>
  <q-layout view="hHh lpR fFf">
  
    <q-dialog v-model="dialogAsistente" position="bottom">
      <Index style="max-width: 600px; min-width: 600px;"></Index>
    </q-dialog>

    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="mdi-home"
          aria-label="Menu"
          @click="$router.push({ name: 'Home' })"
        />
        <q-toolbar-title>
          <div class="text-h6 text-weight-bolder">
            SUSTITUCIÓN DE CFDI
          </div>
        </q-toolbar-title>
        <div class="text-h6 q-mr-lg">{{ $store.state.usuario.rfc }}</div>
                        <q-btn flat class="q-mx-sm" round dense icon="mdi-chat-question" @click="dialogAsistente = true" /> 
        <q-btn
          flat
          class="q-mx-sm"
          round
          dense
          icon="mdi-domain"
          @click="drawerEmpresas = !drawerEmpresas"
        />
        <q-btn
          flat
          class="q-mx-sm"
          round
          dense
          icon="mdi-account"
          @click="drawerPerfil = !drawerPerfil"
        />
      </q-toolbar>
    </q-header>

    <!-- DRAWER DERECHO -->
    <q-drawer
      :width="350"
      v-model="drawerPerfil"
      behavior="mobile"
      side="right"
      bordered
    >
      <drawerPerfil></drawerPerfil>
    </q-drawer>

    <!-- DRAWER EMPRESAS -->
    <q-drawer
      :width="350"
      v-model="drawerEmpresas"
      behavior="mobile"
      side="right"
      bordered
    >
      <drawerEmpresas></drawerEmpresas>
    </q-drawer>

    <q-page-container>
      <template>
        <div class="q-pa-md">
          <q-tabs
            v-model="tab"
            align="justify"
            narrow-indicator
            class="q-mb-lg"
          >
            <q-tab class="text-green" name="emitidos" label="Emitidos" />
            <q-tab class="text-orange" name="recibidos" label="Recibidos" />
          </q-tabs>
          <div class="q-gutter-y-sm">
            <q-tab-panels
              v-model="tab"
              animated
              transition-prev="scale"
              transition-next="scale"
            >
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
    </q-page-container>

    <q-footer style="height: 30px" bordered class="bg-dark text-white">
      <q-toolbar>
        <q-toolbar-title> </q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script>
import { ref } from "vue";
import axios from "axios";
import drawerPerfil from "../DrawerPerfil/DrawerPerfil.vue";
import drawerEmpresas from "../DrawerEmpresas/DrawerEmpresas.vue";
import Emitidos from "./SustitucionEmitidos.vue";
import Recibidos from "./SustitucionRecibidos.vue";
import Index from '../Asistente/Index.vue'

export default {
  name: "MainLayout",
  components: {
    drawerPerfil,
    drawerEmpresas,
    Emitidos,
    Recibidos,
            Index

  },
  data() {
    return {
      drawerEmpresas: false,
      drawerPerfil: false,
      isDarkMode: false,
      leftDrawerOpen: false,
      drawer: false,
      miniState: true,
      tab: "emitidos",
                  dialogAsistente: false,

    };
  },

  watch: {
    isDarkMode(val) {
      // Cambia entre modo oscuro y claro
      this.$q.dark.set(val);
    },
  },
  computed: {
    token() {
      return this.$store.state.usuario;
    },

    rutaAxios() {
      return this.$store.state.rutaMongoStore;
    },
  },
  methods: {},
};
</script>
