import Vue from "vue";
import Vuex from "vuex";
import decode from "jwt-decode";
import router from "../router/index";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    token: null,
    usuario: null,
    listaEmpresasStore: [],
    modoOscuro: false,

    //VIUSTA PREVIA
    vistaPreviaStore: {},
    vistaPreviaGenStore: {},

    // NUEVO USUARIO
    nuevoUsuarioStore: {
      nombre: "",
      primerApellido: "",
      segundoApellido: "",
      usuario: "",
      pin: "",
      telefono: "",
      correo: "",
      razonSocial: "",
    },

    // VALIDACION DE ARCHIVOS
    listaArchivosVigenciaStore: [],
    archivosStore: {
      tipo: "",
      nombreCer: "",
      archivoCer: {
        base64: "",
      },
      nombreKey: "",
      archivoKey: {
        base64: "",
      },
      password: "",
    },

    // EMPRESA
    empresaStore: {
      rfc: "",
      nombre: "",
      regimenFiscal: {
        regimenFiscal: "",
      },
      domicilioFiscal: "",
      logo: {
        base64: "https://contago.com.mx/img/descargas/logo-contago.png",
      },
      nombreCorreo: "",
      correo: "",
      password: "",
      puerto: "",
      host: "",
    },

    //NOMINA
    detallesIsrStore: {
      tipo: "",
      detalles: [],
      origen: "",
    },

    //COMPARATIVA
    comparativaStore: {
      textoComparativa: "",
      tipo: "",
      año: "",
      comparativa: {},
    },

    //CXC
    detallesComplementosStore: {
      origen: "",
      tipo: "",
      detalles: [],
      notasCredito: [],
    },

    // DESCARGAS
    listaHistorialDescargasMetadataStore: [],
    listaHistorialDescargasCFDIStore: [],
    listaHistorialDescargasUUIDStore: [],

    //REPORTES MENSUALES
    detallesIvaMensualExentoStore: {},
    detallesIvaMensualTasa16Store: {},
    detallesIvaMensualTasa8Store: {},
    detallesIvaMensualTasa0Store: {},
    visorSatIva: {},

    detallesIsrMStore: {
      cabecera: "",
      detalles: [],
    },

    detallesProvisionalesStore: {
      cabecera: "",
      detalles: [],
    },

    //COMPROBANTE PDF
    comprobanteStore: {
      nombre: "",
      comprobante: {},
      estatus: "",
      xmlBase64: "",
      rfc: "",
      fecha: null,
    },

    //INGRESOS
    detallesFacturacionStore: {
      cabecera: "",
      detalles: [],
    },

    //CANCELACIONES
    cancelacionStore: {},

    //FLUJO
    detalleFlujoStore: {},

    //GASOLINERIAS
    detalleVentasGasolineria: {},
    litrosGasolineriaStore: {},

    //RUTA DEL AXIOS MONGO
    // rutaMongoStore: 'https://api-mongo.contago.com.mx/api/',
    rutaMongoStore: "https://localhost:44322/api/",

    detallesIvaRet: null,

    dataViewReporte: [],
    fechasReporteEmpresarialStore: null,
  },
  mutations: {
    setToken(state, token) {
      state.token = token;
    },
    setUsuario(state, usuario) {
      state.usuario = usuario;
    },
  },
  actions: {
    guardarToken({ commit }, token) {
      commit("setToken", token);
      commit("setUsuario", decode(token));
      localStorage.setItem("token", token);
    },
    autoLogin({ commit }) {
      let token = localStorage.getItem("token");
      if (token) {
        commit("setToken", token);
        commit("setUsuario", decode(token));
        router.push({ name: "Home" });
      }
    },
    salir({ commit }) {
      commit("setToken", null);
      commit("setUsuario", null);
      localStorage.removeItem("token");
      router.push({ name: "Login" });
    },
  },
  modules: {},
});
