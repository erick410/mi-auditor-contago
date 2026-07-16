<template>
  <div>
    <q-btn
      :loading="descargando"
      :disable="descargando"
      color="primary"
      label="Descargar"
      @click="iniciarDescarga"
      class="full-width"
    >
      <template #loading>
        <q-spinner-hourglass class="on-left" />
        {{ mensajeEstado }}
      </template>
    </q-btn>

    <q-banner v-if="error" class="bg-negative text-white q-mt-md" rounded>
      {{ error }}
    </q-banner>
  </div>
</template>

<script>
import axios from 'axios'
const BASE_URL = 'https://api-scraper.contago.com.mx'
// const BASE_URL = 'http://localhost:8080'

export default {
  name: 'DescargaComprobantes',

  props: {
    rfc: { type: String, required: true },
    tipoDescarga: { type: String, required: true }, // 'emitidos' | 'recibidos'
    fechaInicio: { type: String, required: true },  // 'YYYY-MM-DD'
    fechaFin: { type: String, required: true },     // 'YYYY-MM-DD'
  },

  data () {
    return {
      descargando: false,
      error: null,
      pollTimer: null,
      pollIntervalMs: 3000,
      pollTimeoutMs: 15 * 60 * 1000,
      pollElapsedMs: 0,
      mensajeEstado: 'Descargando...',
    }
  },

  beforeDestroy () {
    this.detenerPolling()
  },

  methods: {
    async iniciarDescarga () {
      this.error = null
      this.descargando = true
      this.pollElapsedMs = 0
      this.mensajeEstado = 'Enviando solicitud...'

      try {
        const { data } = await axios.post(`${BASE_URL}/api/solicitudes`, {
          rfc: this.rfc,
          tipo_descarga: this.tipoDescarga,
          fecha_inicio: this.fechaInicio,
          fecha_fin: this.fechaFin,
        })

        this.mensajeEstado = 'Descargando del SAT...'
        this.consultarEstado(data.id)
      } catch (err) {
        this.descargando = false
        this.error = this.extraerMensajeError(err)
      }
    },

    consultarEstado (id) {
      axios.get(`${BASE_URL}/api/solicitudes/${id}`)
        .then(({ data }) => {
          if (data.status === 'completado') {
            this.descargando = false
            this.$emit('completado', data)
            return
          }

          if (data.status === 'error') {
            this.error = data.error || 'La descarga termino en error.'
            this.descargando = false
            this.$emit('error', this.error)
            return
          }

          this.pollElapsedMs += this.pollIntervalMs
          if (this.pollElapsedMs >= this.pollTimeoutMs) {
            this.error = 'La descarga esta tardando demasiado, intenta de nuevo mas tarde.'
            this.descargando = false
            this.$emit('error', this.error)
            return
          }

          this.pollTimer = setTimeout(() => this.consultarEstado(id), this.pollIntervalMs)
        })
        .catch((err) => {
          this.descargando = false
          this.error = this.extraerMensajeError(err)
          this.$emit('error', this.error)
        })
    },

    detenerPolling () {
      if (this.pollTimer) {
        clearTimeout(this.pollTimer)
        this.pollTimer = null
      }
    },

    extraerMensajeError (err) {
      if (err.response && err.response.data && err.response.data.error) {
        return err.response.data.error
      }
      return 'Ocurrio un error al conectar con el servicio.'
    },
  },
}
</script>