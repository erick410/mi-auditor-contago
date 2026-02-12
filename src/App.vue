<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-dialog v-model="dialogComprobante" transition-show="scale" transition-hide="scale" maximized>
        <!-- <visor-pdf @CloseDialogPdf="CloseDialogPdf"></visor-pdf> -->
         <busqueda @CloseDialogComprobante="CloseDialogComprobante"></busqueda>
      </q-dialog>
      <router-view />
      <!-- <q-page-sticky position="bottom-right" :offset="[18, 18]" > -->
      <q-page-sticky position="bottom-right" :offset="fabPos">
        <q-btn fab icon="mdi-magnify" color="primary" class="q-mb-md" @click="dialogComprobante=true" :disable="draggingFab" v-touch-pan.prevent.mouse="moveFab">
          <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px" :offset="[10, 10]">Buscar comprobante</q-tooltip>
        </q-btn>
      </q-page-sticky>
    </q-page-container>
  </q-layout>   
</template>

<script>
import HelloWorld from './components/Inicio/MainPage.vue'
import Busqueda from './components/BuscarComprobante/BuscarComprobante.vue'
import axios from 'axios'
export default { 
  name: 'LayoutDefault',
  
  components: {
    HelloWorld,
    Busqueda,
  },

  data() {
    return {
      leftDrawerOpen: false,
      dialogComprobante: false,
      fabPos: [ 18, 18 ],
      draggingFab: false
    }
  },
  created() {
    this.$store.dispatch("autoLogin");
    this.GetEmpresa(); 
    this.listaEmpresas()

  },
  computed: {
    token() {
      return this.$store.state.usuario;
    },
    rutaAxios() {
            return this.$store.state.rutaMongoStore
        },
  },
  methods: {
    CloseDialogComprobante(){
      this.dialogComprobante = false;
    },

    async GetEmpresa() {
      try {
        let response = await axios.get(this.rutaAxios + 'Empresa/GetEmpresa/erp_' + this.token.rfc + '/' + this.token.rfc);
        console.log(response)
        this.$store.state.empresaStore = response.data
      } catch (error) {
        console.log(error);
      }
      console.log(this.$q)

    },
    listaEmpresas(item) {
        axios.get('https://api-framework.contago.com.mx/api/Usuarios/Empresas/' + this.$store.state.usuario.idusuariosApp + '/' + 'DESERIALIZADOR')
          .then(response => {
            this.$store.state.listaEmpresasStore = response.data.sort(this.comparar);

          })
          .catch(function (error) {
            console.log(error);
          });
      },

      moveFab (ev) {
      this.draggingFab = ev.isFirst !== true && ev.isFinal !== true

      this.fabPos = [
        this.fabPos[0] - ev.delta.x,
        this.fabPos[1] - ev.delta.y
      ]
    },
      
      comparar(a, b) {
    const nombreA = a.nombre_e.toUpperCase();
    const nombreB = b.nombre_e.toUpperCase();

    let comparacion = 0;
    if (nombreA > nombreB) {
        comparacion = 1;
    } else if (nombreA < nombreB) {
        comparacion = -1;
    }
    return comparacion;
}
  }
}
</script>

<style></style>
