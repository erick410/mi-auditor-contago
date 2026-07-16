    <template>
    <div>
    <q-btn
        :loading="consultando"
        :disable="consultando"
        color="primary"
        label="Consultar"
        class="full-width"
        @click="iniciarConsulta"
    >
        <template #loading>
            <q-spinner-hourglass class="on-left" />
        </template>
    </q-btn>
    {{ mensajeEstado }}

    <q-banner v-if="error" class="bg-negative text-white q-mt-md" rounded>
        {{ error }}
    </q-banner>
    </div>
    </template>

    <script>
    import axios from 'axios'
    const BASE_URL = 'https://api-scraper.contago.com.mx'

    export default {
    name: 'ConsultaComprobantes',

    props: {
    rfc: { type: String, required: true },
    tipoDescarga: { type: String, required: true }, // 'emitidos' | 'recibidos'
    fechaInicio: { type: String, required: true },  // 'YYYY-MM-DD'
    fechaFin: { type: String, required: true },     // 'YYYY-MM-DD'
    },

    data () {
    return {
        consultando: false,
        resultado: null,
        error: null,
        pollTimer: null,
        pollIntervalMs: 3000,        // cada cuanto vuelve a preguntar
        pollTimeoutMs: 5 * 60 * 1000, // deja de intentar despues de 5 min
        pollElapsedMs: 0,
        mensajeEstado: '',
    }
    },

    beforeDestroy () {
    this.detenerPolling()
    },

    methods: {
    async iniciarConsulta () {
        this.error = null
        this.resultado = null
        this.consultando = true
        this.pollElapsedMs = 0
        this.mensajeEstado = 'Enviando solicitud...'

        try {
        console.log(this.fechaInicio, this.fechaFin, this.tipoDescarga)
        const { data } = await axios.post(`${BASE_URL}/api/consultas`, {
            rfc: this.rfc,
            tipo_descarga: this.tipoDescarga,
            fecha_inicio: this.fechaInicio,
            fecha_fin: this.fechaFin,
        })

        this.mensajeEstado = 'Procesando en el SAT...'
        this.consultarEstado(data.id)
        } catch (err) {
        this.consultando = false
        this.error = this.extraerMensajeError(err)
        }
    },

    consultarEstado (id) {
        axios.get(`${BASE_URL}/api/consultas/${id}`)
        .then(({ data }) => {
            if (data.status === 'completado') {
            this.resultado = data
            this.consultando = false
            this.$emit('completado', data)
            this.mensajeEstado = ''
            return
            }

            if (data.status === 'error') {
            this.error = data.error || 'La consulta termino en error.'
            this.consultando = false
            this.mensajeEstado = ''
            this.$emit('error', this.error)
            return
            }

            this.pollElapsedMs += this.pollIntervalMs
            if (this.pollElapsedMs >= this.pollTimeoutMs) {
            this.error = 'La consulta esta tardando demasiado, intenta de nuevo mas tarde.'
            this.consultando = false
            this.$emit('error', this.error)
            return
            }

            this.pollTimer = setTimeout(() => this.consultarEstado(id), this.pollIntervalMs)
        })
        .catch((err) => {
            this.consultando = false
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