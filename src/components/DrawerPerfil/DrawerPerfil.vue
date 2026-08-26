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

export default {
    data() {
        return {
            isPwd: false,
            dialogSubirArchivos: false,
            dialogFielFaltante: false,
            GuardandoSellos: false
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
                let response = await axios.post(this.rutaDescargas + `Validacion/PostValidarArchivos/erp_${this.token.rfc}/${this.token.rfc}`, this.archivo)
                this.$q.notify({ type: 'positive', message: 'Archivo guardado exitosamente.' })
                this.GetVigenciaArchivos()
                this.inicializar()
                console.log(response)
            } catch (e) {
                console.log(e.response)
                this.$q.notify({ type: 'negative', message: e.response.data })
            } finally {
                this.GuardandoSellos = false
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