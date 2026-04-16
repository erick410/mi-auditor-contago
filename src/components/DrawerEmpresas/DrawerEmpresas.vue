<template>
    <div class="drawer-empresas">
  
      <div class="emp-banner">
        <div class="emp-banner-icon">
          <q-icon name="mdi-domain" color="white" size="20px" />
        </div>
        <div>
          <div class="emp-banner-title">Mis Empresas</div>
          <div class="emp-banner-sub">Selecciona para cambiar</div>
        </div>
      </div>
  
      <div class="search-wrap">
        <q-input filled dense v-model="filter"
          placeholder="Buscar empresa..." debounce="300"
          style="border-radius:10px">
          <template v-slot:prepend>
            <q-icon name="mdi-magnify" color="grey-5" size="18px" />
          </template>
        </q-input>
      </div>
  
      <div class="emp-count">
        {{ filteredEmpresas.length }} empresa{{ filteredEmpresas.length !== 1 ? 's' : '' }}
      </div>
  
      <q-list class="emp-list">
        <q-item clickable v-ripple class="emp-item"
          v-for="a in filteredEmpresas" :key="a.rfc"
          :class="{ active: a.rfc === token.rfc }"
          @click="ingresar(a)">
          <q-item-section avatar>
            <div class="emp-avatar" :class="{ 'emp-avatar-active': a.rfc === token.rfc }">
              {{ a.nombre_e.slice(0, 2).toUpperCase() }}
            </div>
          </q-item-section>
          <q-item-section>
            <q-item-label class="emp-name">{{ a.nombre_e }}</q-item-label>
            <q-item-label caption class="emp-rfc">{{ a.rfc }}</q-item-label>
          </q-item-section>
          <q-item-section side v-if="a.rfc === token.rfc">
            <div class="emp-check">
              <q-icon name="mdi-check" color="white" size="10px" />
            </div>
          </q-item-section>
        </q-item>
      </q-list>
  
    </div>
  </template>
  
  <script>
  import axios from 'axios'
  
  export default {
    data() {
      return { filter: '' }
    },
    computed: {
      token() { return this.$store.state.usuario },
      filteredEmpresas() {
        return this.$store.state.listaEmpresasStore.filter(a =>
          a.nombre_e.toLowerCase().includes(this.filter.toLowerCase())
        )
      }
    },
    methods: {
      ingresar(item) {
        this.$q.loading.show({ message: '<b>Cambiando empresa...</b>' })
        axios.post('https://api-framework.contago.com.mx/api/Usuarios/Login', {
          idUsuario:   this.token.idusuariosApp,
          nombre:      this.token.nombre,
          rol:         this.token.rol,
          empresa:     item.nombre_e,
          empresaBase: item.nombreBase,
          firma:       this.token.firma,
          rfc:         item.rfc,
        })
        .then(r => {
          this.$store.dispatch('guardarToken', r.data.token)
          this.$router.push({ name: 'Home' })
          location.reload()
        })
        .catch(e => {
          console.error(e)
          if (e.response?.status === 500)
            this.$q.notify({ type: 'negative', message: e.response.data })
        })
        .finally(() => this.$q.loading.hide())
      }
    }
  }
  </script>
  
  <style scoped>
  .drawer-empresas { display: flex; flex-direction: column; height: 100%; background: #fff; }
  
  .emp-banner      { background: #E74747; padding: 20px;
                     display: flex; align-items: center; gap: 12px; }
  .emp-banner-icon { width: 40px; height: 40px; border-radius: 10px;
                     background: rgba(255,255,255,.18);
                     display: flex; align-items: center; justify-content: center; }
  .emp-banner-title{ font-size: 14px; font-weight: 600; color: #fff; }
  .emp-banner-sub  { font-size: 11px; color: rgba(255,255,255,.6); margin-top: 1px; }
  
  .search-wrap { padding: 12px 16px; border-bottom: 0.5px solid #f0f0f0; }
  .emp-count   { font-size: 10px; color: #aaa; text-transform: uppercase;
                 letter-spacing: .07em; font-weight: 600; padding: 10px 20px 4px; }
  .emp-list    { flex: 1; overflow-y: auto; }
  
  .emp-item    { min-height: 56px !important; transition: background .12s; }
  .emp-item.active { background: #FCEBEB !important; }
  
  .emp-avatar  { width: 36px; height: 36px; border-radius: 10px; background: #f0f0f0;
                 display: flex; align-items: center; justify-content: center;
                 font-size: 12px; font-weight: 600; color: #888; }
  .emp-avatar-active { background: #E74747 !important; color: #fff !important; }
  
  .emp-name    { font-size: 13px; font-weight: 600; color: #111; }
  .emp-rfc     { font-size: 11px; color: #aaa !important; }
  .emp-check   { width: 18px; height: 18px; border-radius: 50%; background: #E74747;
                 display: flex; align-items: center; justify-content: center; }
  </style>