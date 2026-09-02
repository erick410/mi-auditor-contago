<template>
    <div class="drawer-perfil">

        <!-- Dialog FIEL faltante o vencida -->
        <q-dialog v-model="dialogFielFaltante" persistent transition-show="flip-down" transition-hide="flip-up">
            <q-card style="min-width:360px;border-radius:16px">
                <q-card-section style="background:#BF2F2F;border-radius:16px 16px 0 0" class="text-center">
                    <q-icon name="mdi-alert-circle" size="40px" color="white" />
                    <div class="text-h6 text-white q-mt-sm">
                        {{ fielInfo ? 'FIEL Vencida' : 'FIEL No Encontrada' }}
                    </div>
                </q-card-section>
                <q-card-section class="text-center q-pa-lg">
                    <div class="text-body2 text-grey-8">
                        {{ fielInfo
                            ? 'Tu FIEL se encuentra vencida. Por favor sube una nueva para continuar operando.'
                            : 'No se encontró una FIEL registrada. Por favor súbela para continuar operando.' }}
                    </div>
                </q-card-section>
                <q-card-actions class="q-px-md q-pb-md">
                    <q-btn unelevated color="red-7" class="full-width" label="Subir FIEL" style="border-radius:10px"
                        @click="subirFiel()" />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <!-- Dialog cargar sellos -->
        <q-dialog v-model="dialogSubirArchivos" persistent transition-show="flip-down" transition-hide="flip-up">
            <q-card style="min-width:360px;border-radius:16px">
                <q-card-section style="background:#BF2F2F;border-radius:16px 16px 0 0">
                    <div class="row justify-between items-center">
                        <div class="text-h6 text-white">Cargar Archivo</div>
                        <q-btn flat round dense icon="mdi-close" class="text-white" @click="inicializar()" />
                    </div>
                </q-card-section>
                <template v-if="GuardandoSellos">
                    <q-card-section>
                        <div class="text-center q-py-xl">
                            <q-spinner-cube color="red-7" size="5.5em" />
                        </div>
                    </q-card-section>
                </template>
                <template v-else>
                    <q-card-section class="q-pa-md">
                        <q-select filled v-model="archivo.tipo" :options="['FIEL', 'CSD']" label="Tipo de Archivo"
                            class="q-mb-md" />
                        <div class="upload-label">Archivo .key</div>
                        <q-input filled type="file" accept=".key" @input="uploadKey" class="q-mb-md" />
                        <div class="upload-label">Archivo .cer</div>
                        <q-input filled type="file" accept=".cer" @input="uploadCer" class="q-mb-md" />
                        <q-input filled label="Contraseña" v-model="archivo.password"
                            :type="isPwd ? 'password' : 'text'">
                            <template v-slot:append>
                                <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                                    @click="isPwd = !isPwd" />
                            </template>
                        </q-input>

                        <!-- Nuevo: solo aplica para FIEL, ya que Constancia/Opinión/Anual/
                             Declaraciones se solicitan con RFC + contraseña de la FIEL -->
                        <q-checkbox
                            v-if="archivo.tipo === 'FIEL'"
                            v-model="descargarDocumentos"
                            class="q-mt-md"
                            label="Al guardar, solicitar automáticamente los documentos del Reporte de Riesgo Financiero (Constancia, Opinión, Declaración Anual, Declaraciones de pagos y XML de comprobantes de los dos ejercicios anteriores y del periodo actual)"
                        />
                    </q-card-section>
                    <q-card-actions class="q-px-md q-pb-md">
                        <q-btn unelevated color="red-7" class="full-width" label="Guardar" style="border-radius:10px"
                            @click="validarArchivos()" />
                    </q-card-actions>
                </template>
            </q-card>
        </q-dialog>

        <!-- Banner perfil -->
        <div class="profile-banner">
            <div class="profile-avatar">{{ iniciales }}</div>
            <div class="profile-name">{{ token.nombre }}</div>
            <div class="profile-rfc">{{ token.rfc }}</div>
            <div class="profile-empresa">{{ token.empresa }}</div>
        </div>

        <!-- Certificados -->
        <div class="cert-section">
            <div class="section-label">Certificados</div>
            <div class="cert-item" v-for="a in archivos" :key="a.tipo">
                <div class="cert-dot" :style="{ background: dotColor(a.color) }"></div>
                <div class="cert-info">
                    <div class="cert-tipo">{{ a.tipo }}</div>
                    <div class="cert-fecha">{{ formatDate(a.fechaVigencia) }}</div>
                </div>
                <q-icon :name="a.icono" :color="a.iconoColor" size="16px">
                    <q-tooltip>{{ a.estatus }}</q-tooltip>
                </q-icon>
            </div>
        </div>

        <!-- Menú -->
        <q-list class="menu-list">
            <q-item clickable v-ripple class="menu-item" @click="irReportes">
                <q-item-section avatar><q-icon name="mdi-file-document" size="20px" color="grey-6" /></q-item-section>
                <q-item-section>Reportes</q-item-section>
            </q-item>
            <q-item clickable v-ripple class="menu-item" @click="irDescargas">
                <q-item-section avatar><q-icon name="mdi-download-box" size="20px" color="grey-6" /></q-item-section>
                <q-item-section>Descargas</q-item-section>
            </q-item>
            <q-item clickable v-ripple class="menu-item" @click="irSolicitudCancelacion">
                <q-item-section avatar><q-icon name="mdi-bell-cancel" size="20px" color="grey-6" /></q-item-section>
                <q-item-section>Solicitudes de Cancelación</q-item-section>
            </q-item>
            <q-item clickable v-ripple class="menu-item" @click="irCancelados">
                <q-item-section avatar><q-icon name="mdi-cancel" size="20px" color="grey-6" /></q-item-section>
                <q-item-section>Cancelados</q-item-section>
            </q-item>
            <q-item clickable v-ripple class="menu-item" @click="irlista69b">
                <q-item-section avatar><q-icon name="mdi-account-search" size="20px" color="grey-6" /></q-item-section>
                <q-item-section>Lista 69B</q-item-section>
            </q-item>
            <q-item clickable v-ripple class="menu-item" @click="abriDialog">
                <q-item-section avatar><q-icon name="mdi-upload" size="20px" color="grey-6" /></q-item-section>
                <q-item-section>Cargar Sellos</q-item-section>
            </q-item>
            <q-item v-if="nombreUsuario === 'ADMIN'" clickable v-ripple class="menu-item" @click="irAdministrador">
                <q-item-section avatar><q-icon name="mdi-account-group" size="20px" color="grey-6" /></q-item-section>
                <q-item-section>Administrador de empresas</q-item-section>
            </q-item>
            <q-item clickable v-ripple class="menu-item" @click="irConfiguracion">
                <q-item-section avatar><q-icon name="mdi-cog" size="20px" color="grey-6" /></q-item-section>
                <q-item-section>Configuración</q-item-section>
            </q-item>
            <q-separator class="q-my-xs" />
            <q-item clickable v-ripple class="menu-item menu-danger" @click="salir">
                <q-item-section>Cerrar Sesión</q-item-section>
                <q-item-section avatar><q-icon name="mdi-logout" size="20px" color="red-7" /></q-item-section>
            </q-item>
        </q-list>
    </div>
</template>

<script>
import axios from 'axios'
import moment from 'moment'

// Mismos endpoints/constantes que usa ReporteRiesgoFinanciero.vue para
// solicitar Constancia, Opinión, Declaración Anual y Declaraciones de pagos.
const BASE_URL_DESCARGA = 'https://descargasat.contago.com.mx/api/Descarga'
const SCRAPER_URL = 'https://satscraper.contago.com.mx'
// TODO: idealmente esta key debería vivir en el backend (proxy), no en el bundle del cliente.
const SCRAPER_API_KEY = 'sk_live_Vqm3D1BiHpSA43mOn7VOVn21UaTSFKuhupp3UpbnpM4'

export default {
    data() {
        return {
            isPwd: false,
            dialogSubirArchivos: false,
            dialogFielFaltante: false,
            GuardandoSellos: false,
            descargarDocumentos: true
        }
    },
    computed: {
        rutaDescargas() {
            return this.$store.state.rutaDescargas;
        },
        token() { return this.$store.state.usuario },
        empresa() { return this.$store.state.empresaStore },
        archivos() { return this.$store.state.listaArchivosVigenciaStore },
        archivo() { return this.$store.state.archivosStore },
        rutaAxios() { return this.$store.state.rutaMongoStore },
        nombreUsuario() { return this.token.nombre.toUpperCase() },
        iniciales() {
            return this.token.nombre
                .split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
        },
        fielInfo() {
            return this.archivos.find(a => a.tipo === 'FIEL')
        }
    },
    created() { this.GetVigenciaArchivos() },
    methods: {
        dotColor(c) {
            return { green: '#69d46e', orange: '#ffd166', red: '#ff8080' }[c] || '#ccc'
        },
        irAdministrador() { this.$router.push('PanelAdministrador') },
        irlista69b() { this.$router.push({ name: 'Lista69B' }) },
        irCancelados() { this.$router.push({ name: 'Cancelados' }) },
        irDescargas() { this.$router.push({ name: 'DescargasScraper' }) },
        irReportes() { this.$router.push({ name: 'DocumentosEmitidos' }) },
        irSolicitudCancelacion() { this.$router.push({ name: 'SolicitudCancelacion' }) },
        irConfiguracion() { this.$router.push('Configuracion') },
        abriDialog() { this.dialogSubirArchivos = true },

        checkFiel() {
            const fiel = this.fielInfo
            const vencida = fiel ? moment(fiel.fechaVigencia).isBefore(moment()) : false
            this.dialogFielFaltante = !fiel || vencida
        },

        subirFiel() {
            this.dialogFielFaltante = false
            this.dialogSubirArchivos = true
            this.$store.state.archivosStore.tipo = 'FIEL'
        },

        async validarArchivos() {
            if (!this.archivo.tipo)
                return this.$q.notify({ type: 'negative', message: 'Seleccione el tipo de archivo.' })
            this.GuardandoSellos = true
            try {
                const esFiel = this.archivo.tipo === 'FIEL'
                const password = this.archivo.password
                let response = await axios.post(this.rutaDescargas + `Validacion/PostValidarArchivos/erp_${this.token.rfc}/${this.token.rfc}`, this.archivo)
                this.$q.notify({ type: 'positive', message: 'Archivo guardado exitosamente.' })
                this.GetVigenciaArchivos()

                // Si es FIEL y el usuario marcó la casilla, dispara la solicitud
                // de todos los documentos del Reporte de Riesgo Financiero.
                if (esFiel && this.descargarDocumentos) {
                    this.solicitarDocumentosReporte(password)
                }

                this.inicializar()
                console.log(response)
            } catch (e) {
                console.log(e.response)
                this.$q.notify({ type: 'negative', message: e.response.data })
            } finally {
                this.GuardandoSellos = false
            }
        },

        // Dispara en paralelo la solicitud de: Constancia de Situación Fiscal,
        // Opinión de Cumplimiento, Declaración Anual (los dos ejercicios
        // cerrados), Declaraciones de pagos (datos, año actual y anterior) y
        // XML de comprobantes Emitidos/Recibidos (los dos ejercicios
        // anteriores completos, más el periodo actual del año en curso) —
        // la misma lista que rastrea el panel de Reporte de Riesgo
        // Financiero.
        async solicitarDocumentosReporte(password) {
            const rfc = this.token.rfc
            const anioActual = new Date().getFullYear()
            const aniosAnual = [String(anioActual - 1), String(anioActual - 2)]
            const aniosDeclaraciones = [String(anioActual), String(anioActual - 1)]

            // Cada tarea es { etiqueta, ejecutar() } — ejecutar() debe regresar
            // la promesa del axios.post sin atrapar el error aquí, para que el
            // resultado real (éxito/fallo) se refleje en el resumen final.
            const tareas = []

            tareas.push({
                etiqueta: 'Constancia de Situación Fiscal',
                ejecutar: () => axios.post(`${BASE_URL_DESCARGA}/DescargarConstancia`, { rfc, password })
            })
            tareas.push({
                etiqueta: 'Opinión de Cumplimiento',
                ejecutar: () => axios.post(`${BASE_URL_DESCARGA}/DescargarOpinion`, { rfc, password })
            })
            aniosAnual.forEach((anio) => {
                tareas.push({
                    etiqueta: `Declaración Anual ${anio}`,
                    ejecutar: () => axios.post(`${BASE_URL_DESCARGA}/DescargarAnualTodas`, { rfc, password, ejercicio: anio, formato: 'ambos' })
                })
            })
            aniosDeclaraciones.forEach((anio) => {
                tareas.push({
                    etiqueta: `Declaraciones de pagos ${anio}`,
                    ejecutar: () => axios.post(
                        `${SCRAPER_URL}/sat/consultar-datos`,
                        new URLSearchParams({ rfc, anio: String(anio), meses: 'TODOS' }),
                        { headers: { 'X-API-KEY': SCRAPER_API_KEY, 'Content-Type': 'application/x-www-form-urlencoded' } }
                    ).then(({ data }) => axios.post(`${this.rutaAxios}ScraperDescargasPagos/PostDescargaScraper/${rfc}`, {
                        _id: '',
                        periodo: 'TODOS',
                        anio: String(anio),
                        respuesta: JSON.stringify(data, null, 2),
                        log_id: data.log_id,
                        estatus: 'Vigente',
                        fecha: new Date().toISOString().slice(0, 10)
                    }))
                })
            })

            // XML de comprobantes (Emitidos y Recibidos): los dos ejercicios
            // anteriores completos, más el periodo actual (del 1 de enero al
            // día de hoy del año en curso, ya que ese ejercicio aún no cierra)
            const hoy = new Date().toISOString().slice(0, 10)
            const periodosXml = [
                ...aniosAnual.map((anio) => ({ anio, fechaInicial: `${anio}-01-01 00:00:00`, fechaFinal: `${anio}-12-31 23:59:59` })),
                { anio: String(anioActual), fechaInicial: `${anioActual}-01-01 00:00:00`, fechaFinal: `${hoy} 23:59:59` }
            ]
            periodosXml.forEach(({ anio, fechaInicial, fechaFinal }) => {
                ['Emitido', 'Recibido'].forEach((tipo) => {
                    const payload = {
                        tipo,
                        fechaInicial,
                        fechaFinal,
                        RfcReceptor: rfc,
                        RfcEmisor: rfc,
                        RfcSolicitante: rfc,
                        TipoSolicitud: 'CFDI',
                        usuario: this.token.nombre,
                        TipoComprobante: { tipo: 'Todos', value: '' },
                        EstadoComprobante: { estatus: 'Todos', value: 'Todos' }
                    }
                    tareas.push({
                        etiqueta: `XML ${tipo} ${anio}`,
                        ejecutar: () => axios.post(`${this.rutaDescargas}Descargas/PostSolicitud/erp_${rfc}`, payload)
                    })
                })
            })

            this.$q.notify({ type: 'info', message: 'Solicitando los documentos del Reporte de Riesgo Financiero...' })

            const resultados = await Promise.allSettled(tareas.map((t) => t.ejecutar()))

            const fallidas = []
            resultados.forEach((resultado, i) => {
                if (resultado.status === 'rejected') {
                    const e = resultado.reason
                    // Log del CUERPO real del error (el mensaje de validación del
                    // backend), no solo "Request failed with status code 400".
                    const detalle = (e && e.response && e.response.data) || (e && e.message) || e
                    console.error(`Error al solicitar "${tareas[i].etiqueta}":`, detalle)
                    fallidas.push(tareas[i].etiqueta)
                }
            })

            if (fallidas.length === 0) {
                this.$q.notify({ type: 'positive', message: 'Listo. Se solicitaron todos los documentos del Reporte de Riesgo Financiero.' })
            } else if (fallidas.length === tareas.length) {
                this.$q.notify({ type: 'negative', message: 'No se pudo solicitar ningún documento. Revisa la consola para ver el detalle de cada error.' })
            } else {
                this.$q.notify({
                    type: 'warning',
                    message: `Se solicitaron ${tareas.length - fallidas.length} de ${tareas.length} documentos. Fallaron: ${fallidas.join(', ')}. Revisa la consola para el detalle.`
                })
            }
        },

        async GetVigenciaArchivos() {
            this.$store.state.listaArchivosVigenciaStore = []
            console.log(this.$store.state.listaArchivosVigenciaStore)
            try {
                const { data } = await axios.get(this.rutaDescargas + `Validacion/GetVigenciaArchivos/erp_${this.token.rfc}`)
                this.$store.state.listaArchivosVigenciaStore = data
                this.checkFiel()
            } catch (e) { console.error(e) }
        },

        async salir() {
            this.$q.loading.show({ message: '<b>Cerrando Sesión...</b>' })
            try {
                await this.$store.dispatch('salir')
                this.$store.state.listaEmpresasStore = []
            } finally {
                this.$q.loading.hide()
            }
        },

        inicializar() {
            this.dialogSubirArchivos = false
            this.descargarDocumentos = false
            this.$store.state.archivosStore = {
                tipo: '', nombreCer: '', archivoCer: { base64: '' },
                nombreKey: '', archivoKey: { base64: '' }, password: ''
            }
        },

        async uploadKey(event) {
            const file = event[0]
            try {
                this.$store.state.archivosStore.archivoKey.base64 = await this.convertBase64(file)
                this.$store.state.archivosStore.nombreKey = file.name
            } catch (e) { console.error(e) }
        },

        async uploadCer(event) {
            const file = event[0]
            try {
                this.$store.state.archivosStore.archivoCer.base64 = await this.convertBase64(file)
                this.$store.state.archivosStore.nombreCer = file.name
            } catch (e) { console.error(e) }
        },

        convertBase64(file) {
            return new Promise((resolve, reject) => {
                const r = new FileReader()
                r.readAsDataURL(file)
                r.onload = () => resolve(r.result)
                r.onerror = () => reject(r.error)
            })
        },

        formatDate(value) {
            const d = new Date(value.replace('T', ' ').replace('Z', ' '))
            moment.locale('es-mx')
            return moment(d).format('YYYY-MM-DD HH:mm:ss')
        }
    }
}
</script>

<style scoped>
.drawer-perfil {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #fff;
}

.profile-banner {
    background: #E74747;
    padding: 24px 20px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.profile-avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: rgba(255, 255, 255, .2);
    border: 2px solid rgba(255, 255, 255, .35);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: 600;
    color: #fff;
}

.profile-name {
    font-size: 17px;
    font-weight: 600;
    color: #fff;
    text-align: center;
}

.profile-rfc {
    font-size: 16px;
    color: rgba(255, 255, 255, .7);
}

.profile-empresa {
    font-size: 14px;
    color: rgba(255, 255, 255, .5);
}

.cert-section {
    padding: 14px 20px;
    border-bottom: 0.5px solid #f0f0f0;
}

.section-label {
    font-size: 12px;
    color: #aaa;
    text-transform: uppercase;
    letter-spacing: .07em;
    font-weight: 600;
    margin-bottom: 10px;
}

.cert-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 7px 0;
    border-bottom: 0.5px solid #f5f5f5;
}

.cert-item:last-child {
    border-bottom: none;
}

.cert-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}

.cert-info {
    flex: 1;
}

.cert-tipo {
    font-size: 15px;
    font-weight: 600;
    color: #111;
}

.cert-fecha {
    font-size: 13px;
    color: #aaa;
}

.menu-list {
    flex: 1;
}

.menu-item {
    min-height: 44px !important;
    font-size: 15px;
    color: #333;
}

.menu-danger {
    color: #E74747 !important;
}

.upload-label {
    font-size: 11px;
    color: #888;
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: .05em;
    font-weight: 600;
}
</style>