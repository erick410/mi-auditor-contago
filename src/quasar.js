import Vue from 'vue'
import './styles/quasar.sass'
import lang from 'quasar/lang/es.js'
import '@quasar/extras/roboto-font/roboto-font.css'
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/mdi-v4/mdi-v4.css'
import { Quasar, Loading, LoadingBar, Notify, Dialog } from 'quasar'

Vue.use(Quasar, {
  config: {},
  plugins: {
    Loading, LoadingBar, Notify, Dialog
  },
  lang: lang
})