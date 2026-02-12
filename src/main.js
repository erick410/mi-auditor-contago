import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './quasar'
import axios from 'axios'

Vue.config.productionTip = false
// axios.defaults.baseURL = "https://localhost:44394/api/"
axios.defaults.baseURL = "https://api-erp.contago.com.mx/api/"

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
