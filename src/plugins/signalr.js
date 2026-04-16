import { getConnection, startConnection } from '@/service/signalr'

export default {
  install(Vue) {
    Vue.prototype.$signalR = getConnection()
    Vue.prototype.$signalRStart = startConnection
  }
}