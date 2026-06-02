<template>
    <q-page class="flex column" style="height: 100vh;">
        <div class="dsc-root">

            <!-- Header -->
            <div class="dsc-header">
                <div class="dsc-header__left">
                    <div>
                        <div class="dsc-header__title">Descarga Scraper CFDIs SAT</div>
                        <div class="dsc-header__sub">Selecciona el tipo de comprobante y el mes a descargar.</div>
                    </div>
                </div>
            </div>

            <!-- Filtros -->
            <div class="dsc-body">
                <div class="dsc-panel">
                    <div class="dsc-filters">
                        <div class="dsc-filters__row">

                            <div class="dsc-field dsc-field--sm">
                                <div class="dsc-field__label">Año</div>
                                <q-select dense outlined v-model="anio" :options="opcionesAnios" class="dsc-input"
                                    emit-value map-options />
                            </div>

                            <div class="dsc-field" style="min-width:130px; max-width:150px;">
                                <div class="dsc-field__label">Mes</div>
                                <q-select dense outlined v-model="mes" :options="opcionesMeses" class="dsc-input"
                                    emit-value map-options />
                            </div>

                            <div class="dsc-field dsc-field--sm">
                                <div class="dsc-field__label">Tipo</div>
                                <q-select dense outlined v-model="tipo" :options="opcionesTipo" class="dsc-input"
                                    emit-value map-options />
                            </div>

                            <div class="dsc-field dsc-field--btns">
                                <q-btn dense unelevated color="primary" icon="mdi-send" label="Solicitar"
                                    :loading="cargando" :disable="cargando" class="dsc-btn" @click="solicitar" />
                                <q-btn dense unelevated outline color="primary" icon="mdi-refresh" label="Actualizar"
                                    :disable="cargando" class="dsc-btn" @click="getHistorial" />
                            </div>

                        </div>

                        <div class="dsc-alert" v-if="anio && mes !== null">
                            <q-icon name="mdi-calendar-range" size="16px" />
                            Periodo: {{ labelPeriodo }}
                        </div>
                    </div>

                    <!-- Tabla historial -->
                    <div class="dsc-table-wrap">
                        <div class="dsc-table__top">
                            <div class="dsc-table__title">
                                <q-icon name="mdi-history" size="18px" class="q-mr-xs" />
                                Historial de solicitudes
                            </div>
                            <div v-if="pollingActivo"
                                style="display:flex;align-items:center;gap:6px;font-size:0.75rem;color:#3d5afe;">
                                <q-spinner size="14px" color="primary" />
                                Actualizando...
                            </div>
                        </div>

                        <!-- Sin datos -->
                        <div v-if="!historialLocal.length" class="dsc-empty">
                            <q-icon name="mdi-inbox-outline" size="40px" color="grey-4" />
                            <div class="dsc-empty__text">No hay solicitudes registradas.</div>
                        </div>

                        <!-- Filas -->
                        <q-list v-else separator>
                            <q-item v-for="s in historialLocal" :key="s.id"
                                :class="['dsc-item', s.estado === 'procesando' ? 'dsc-item--procesando' : '']">
                                <!-- Tipo + periodo -->
                                <q-item-section>
                                    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                                        <span
                                            :class="['dsc-pill', s.tipo === 'emitidos' ? 'dsc-pill--blue' : 'dsc-pill--purple']">
                                            {{ s.tipo === 'emitidos' ? 'Emitidos' : 'Recibidos' }}
                                        </span>
                                        <span class="dsc-td" style="font-weight:600;color:#0f1623;">
                                            {{ formatPeriodo(s.fechaInicio, s.fechaFin) }}
                                        </span>
                                    </div>
                                    <div style="display:flex;gap:16px;margin-top:4px;flex-wrap:wrap;">
                                        <span class="dsc-td" style="color:#7b86a0;">
                                            <q-icon name="mdi-clock-outline" size="13px" />
                                            {{ formatFecha(s.fechaSolicitud) }}
                                        </span>
                                        <span v-if="s.fechaTermino" class="dsc-td" style="color:#7b86a0;">
                                            <q-icon name="mdi-flag-checkered" size="13px" />
                                            {{ formatFecha(s.fechaTermino) }}
                                        </span>
                                    </div>
                                </q-item-section>

                                <!-- Stats -->
                                <q-item-section side>
                                    <div style="display:flex;align-items:center;gap:10px;">
                                        <div v-if="s.estado !== 'procesando'" style="display:flex;gap:8px;">
                                            <span class="dsc-stat dsc-stat--ok">
                                                <q-icon name="mdi-check" size="12px" /> {{ s.exitosos }}
                                            </span>
                                            <span v-if="s.errores > 0" class="dsc-stat dsc-stat--err">
                                                <q-icon name="mdi-close" size="12px" /> {{ s.errores }}
                                            </span>
                                        </div>
                                        <!-- Estado -->
                                        <span :class="['dsc-status', `dsc-status--${s.estado}`]">
                                            <q-spinner v-if="s.estado === 'procesando'" size="11px" class="q-mr-xs" />
                                            {{ labelEstado(s.estado) }}
                                        </span>
                                        <!-- Detalle -->
                                        <q-btn v-if="s.estado === 'completado'" flat dense round icon="mdi-eye-outline"
                                            size="sm" color="primary" @click="verDetalle(s)" />
                                    </div>
                                </q-item-section>
                            </q-item>
                        </q-list>
                    </div>
                </div>
            </div>

        </div>

        <!-- Dialog detalle -->
        <q-dialog v-model="dialogDetalle">
            <q-card style="min-width:520px; max-width:90vw;">
                <q-card-section class="row items-center q-pb-none">
                    <div class="text-subtitle1" style="font-weight:700;">
                        Detalle — {{ detalleActivo ? formatPeriodo(detalleActivo.fechaInicio, detalleActivo.fechaFin) :
                            '' }}
                    </div>
                    <q-space />
                    <q-btn icon="close" flat round dense v-close-popup />
                </q-card-section>

                <q-card-section v-if="detalleActivo">
                    <!-- Stats -->
                    <div style="display:flex;gap:10px;margin-bottom:14px;">
                        <div class="dsc-statcard dsc-statcard--ok">
                            <div class="dsc-statcard__num">{{ detalleActivo.exitosos }}</div>
                            <div class="dsc-statcard__lbl">exitosos</div>
                        </div>
                        <div class="dsc-statcard dsc-statcard--err">
                            <div class="dsc-statcard__num">{{ detalleActivo.errores }}</div>
                            <div class="dsc-statcard__lbl">errores</div>
                        </div>
                        <div class="dsc-statcard">
                            <div class="dsc-statcard__num">{{ detalleActivo.exitosos + detalleActivo.errores }}</div>
                            <div class="dsc-statcard__lbl">total</div>
                        </div>
                    </div>

                    <!-- Log progreso -->
                    <div v-if="detalleActivo.progreso && detalleActivo.progreso.length" class="q-mb-md">
                        <div class="dsc-field__label q-mb-xs">Log de progreso</div>
                        <div class="dsc-log">
                            <div v-for="(msg, i) in detalleActivo.progreso" :key="i">› {{ msg }}</div>
                        </div>
                    </div>

                    <!-- CFDIs -->
                    <div class="dsc-field__label q-mb-xs">CFDIs descargados</div>
                    <q-list dense separator bordered class="rounded-borders" >
                        <q-item v-for="c in detalleActivo.cfdis" :key="c.uuid" dense style="max-height: 200px">
                            <q-item-section>
                                <span style="font-family:monospace;font-size:0.75rem;color:#0f1623;">{{ c.uuid }}</span>
                            </q-item-section>
                            <q-item-section side>
                                <span
                                    :class="['dsc-pill', c.tipo === 'Emitido' ? 'dsc-pill--blue' : 'dsc-pill--purple']">
                                    {{ c.tipo }}
                                </span>
                            </q-item-section>
                            <q-item-section side>
                                <q-icon :name="c.exitoso ? 'mdi-check-circle' : 'mdi-close-circle'"
                                    :color="c.exitoso ? 'green-7' : 'red-7'" size="18px" />
                            </q-item-section>
                        </q-item>
                    </q-list>
                </q-card-section>
            </q-card>
        </q-dialog>

    </q-page>
</template>

<script>
import axios from 'axios'

export default {
    name: 'DescargaCfdiPage',

    data() {
        const hoy = new Date()
        const anioActual = hoy.getFullYear()
        const mesActual = hoy.getMonth() + 1

        return {
            anio: anioActual,
            mes: mesActual,
            tipo: 'emitidos',

            opcionesTipo: [
                { label: 'Emitidos', value: 'emitidos' },
                { label: 'Recibidos', value: 'recibidos' }
            ],
            opcionesMeses: [
                { label: 'Enero', value: 1 },
                { label: 'Febrero', value: 2 },
                { label: 'Marzo', value: 3 },
                { label: 'Abril', value: 4 },
                { label: 'Mayo', value: 5 },
                { label: 'Junio', value: 6 },
                { label: 'Julio', value: 7 },
                { label: 'Agosto', value: 8 },
                { label: 'Septiembre', value: 9 },
                { label: 'Octubre', value: 10 },
                { label: 'Noviembre', value: 11 },
                { label: 'Diciembre', value: 12 }
            ],

            historialLocal: [],
            cargando: false,
            pollingActivo: false,
            pollingTimer: null,
            solicitudId: null,

            dialogDetalle: false,
            detalleActivo: null
        }
    },

    computed: {
        token() { return this.$store.state.usuario },
        rfc() { return this.token?.rfc || 'LAV1401142M6' },
        ruta() { return 'https://api-descargas-dos.contago.com.mx/api/' },

        opcionesAnios() {
            const actual = new Date().getFullYear()
            const anios = []
            for (let a = actual; a >= 2018; a--) {
                anios.push({ label: String(a), value: a })
            }
            return anios
        },

        fechaInicio() {
            if (!this.anio || !this.mes) return ''
            return `${this.anio}-${String(this.mes).padStart(2, '0')}-01`
        },
        fechaFin() {
            if (!this.anio || !this.mes) return ''
            const ultimo = new Date(this.anio, this.mes, 0).getDate()
            return `${this.anio}-${String(this.mes).padStart(2, '0')}-${String(ultimo).padStart(2, '0')}`
        },
        labelPeriodo() {
            const nombreMes = this.opcionesMeses.find(m => m.value === this.mes)?.label || ''
            return `${nombreMes} ${this.anio}  (${this.fechaInicio} → ${this.fechaFin})`
        }
    },

    created() {
        this.getHistorial()
    },

    beforeDestroy() {
        this.detenerPolling()
    },

    methods: {
        // ── Solicitar descarga ───────────────────────────────────
        async solicitar() {
            this.cargando = true
            try {
                const { data } = await axios.post(this.ruta + `Descargas/${this.tipo}`, {
                    FechaInicio: this.fechaInicio,
                    FechaFin: this.fechaFin,
                    Rfc: this.rfc,
                    CerPath: `C:\\Documentos - MI AUDITOR\\${this.rfc}\\Fiel\\${this.rfc}.cer`,
                    KeyPath: `C:\\Documentos - MI AUDITOR\\${this.rfc}\\Fiel\\${this.rfc}.key`,
                    Password: '',
                    CarpetaDestino: `C:\\DescargasMiAuditor\\${this.rfc}`
                })

                this.solicitudId = data.solicitudId

                this.historialLocal.unshift({
                    id: data.solicitudId,
                    rfc: this.rfc,
                    tipo: this.tipo,
                    fechaInicio: this.fechaInicio,
                    fechaFin: this.fechaFin,
                    estado: 'procesando',
                    fechaSolicitud: new Date().toISOString(),
                    exitosos: 0,
                    errores: 0,
                    progreso: [],
                    cfdis: []
                })

                this.iniciarPolling()
            } catch (err) {
                this.$q.notify({
                    type: 'negative',
                    message: err?.response?.data?.error || 'No se pudo conectar al servidor.',
                    timeout: 3000
                })
            } finally {
                this.cargando = false
            }
        },

        // ── Historial completo ───────────────────────────────────
        async getHistorial() {
            try {
                const { data } = await axios.get(this.ruta + `Descargas/historial/${this.rfc}`)
                this.historialLocal = data
            } catch (_) { }
        },

        // ── Polling de la solicitud activa ───────────────────────
        iniciarPolling() {
            if (this.pollingTimer) return
            this.pollingActivo = true
            this.pollingTimer = setInterval(async () => {
                try {
                    const { data } = await axios.get(
                        this.ruta + `Descargas/solicitud/${this.rfc}/${this.solicitudId}`)
                    this.actualizarEnHistorial(data)
                    if (data.estado === 'completado' || data.estado === 'error') {
                        this.detenerPolling()
                    }
                } catch (_) { }
            }, 4000)
        },

        detenerPolling() {
            clearInterval(this.pollingTimer)
            this.pollingTimer = null
            this.pollingActivo = false
        },

        actualizarEnHistorial(solicitud) {
            const idx = this.historialLocal.findIndex(h => h.id === solicitud.id)
            if (idx !== -1) this.$set(this.historialLocal, idx, solicitud)
        },

        // ── Dialog detalle ───────────────────────────────────────
        verDetalle(solicitud) {
            this.detalleActivo = solicitud
            this.dialogDetalle = true
        },

        // ── Helpers de formato ───────────────────────────────────
        formatFecha(iso) {
            if (!iso) return ''
            return new Date(iso).toLocaleString('es-MX', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            })
        },
        formatPeriodo(ini, fin) {
            if (!ini || !fin) return ''
            const f = s => s.split('T')[0]   // quita hora si viene con ISO
            return `${f(ini)} → ${f(fin)}`
        },
        labelEstado(estado) {
            const map = {
                procesando: 'Procesando',
                completado: 'Completado',
                error: 'Error'
            }
            return map[estado] || estado
        }
    }
}
</script>

<style scoped>
.dsc-root {
    --ink: #0f1623;
    --ink-soft: #5a6480;
    --indigo: #E74747;
    --indigo-dk: #E74747;
    --surface: #f4f6fb;
    --border: #e2e6f0;
    background: var(--surface);
    min-height: 100vh;
}

.dsc-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    padding: 14px 24px;
    background: #fff;
    border-bottom: 1px solid var(--border);
    box-shadow: 0 1px 6px rgba(0, 0, 0, .05);
}

.dsc-header__left {
    display: flex;
    align-items: center;
    gap: 12px;
}

.dsc-header__title {
    font-size: 1rem;
    font-weight: 700;
    color: var(--ink);
}

.dsc-header__sub {
    font-size: 0.72rem;
    font-weight: 500;
    color: var(--ink-soft);
    text-transform: uppercase;
    letter-spacing: 0.6px;
}

.dsc-body {
    padding: 0;
}

.dsc-panel {
    background: #f4f6fb;
    min-height: calc(100vh - 68px);
}

.dsc-filters {
    background: #fff;
    border-bottom: 1px solid #e2e6f0;
    padding: 14px 20px 12px;
}

.dsc-filters__row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: flex-end;
}

.dsc-field {
    display: flex;
    flex-direction: column;
    min-width: 140px;
}

.dsc-field--sm {
    min-width: 100px;
    max-width: 115px;
}

.dsc-field--btns {
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    gap: 6px;
    min-width: auto;
    margin-top: 16px;
}

.dsc-field__label {
    font-size: 0.68rem;
    font-weight: 700;
    color: #7b86a0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
}

.dsc-input {
    font-size: 0.82rem;
}

.dsc-btn {
    font-size: 0.78rem;
    font-weight: 600;
    height: 36px;
    padding: 0 14px;
    border-radius: 8px !important;
}

.dsc-alert {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 10px;
    padding: 7px 12px;
    background: #eef0ff;
    border-radius: 8px;
    font-size: 0.78rem;
    color: #3d5afe;
    font-weight: 500;
}

/* Tabla / lista */
.dsc-table-wrap {
    padding: 16px 20px;
}

.dsc-table__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
}

.dsc-table__title {
    font-size: 0.88rem;
    font-weight: 700;
    color: #0f1623;
    display: flex;
    align-items: center;
}

.dsc-item {
    padding: 10px 12px !important;
}

.dsc-item--procesando {
    background: #eef0ff !important;
}

.dsc-td {
    font-size: 0.78rem;
}

/* Pills */
.dsc-pill {
    display: inline-block;
    border-radius: 4px;
    padding: 1px 8px;
    font-size: 0.7rem;
    font-weight: 700;
}

.dsc-pill--blue {
    background: #e8edff;
    color: #3d5afe;
}

.dsc-pill--purple {
    background: #f3e8ff;
    color: #7c3aed;
}

/* Status badges */
.dsc-status {
    display: inline-flex;
    align-items: center;
    border-radius: 4px;
    padding: 2px 8px;
    font-size: 0.7rem;
    font-weight: 600;
}

.dsc-status--procesando {
    background: #dbeafe;
    color: #1e40af;
}

.dsc-status--completado {
    background: #d1fae5;
    color: #065f46;
}

.dsc-status--error {
    background: #fee2e2;
    color: #991b1b;
}

/* Stats inline */
.dsc-stat {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    border-radius: 4px;
    padding: 1px 7px;
    font-size: 0.72rem;
    font-weight: 700;
}

.dsc-stat--ok {
    background: #d1fae5;
    color: #065f46;
}

.dsc-stat--err {
    background: #fee2e2;
    color: #991b1b;
}

/* Stat cards dialog */
.dsc-statcard {
    flex: 1;
    background: #f4f6fb;
    border-radius: 8px;
    padding: 10px;
    text-align: center;
}

.dsc-statcard--ok {
    background: #d1fae5;
}

.dsc-statcard--err {
    background: #fee2e2;
}

.dsc-statcard__num {
    font-size: 1.4rem;
    font-weight: 700;
    color: #0f1623;
}

.dsc-statcard__lbl {
    font-size: 0.72rem;
    color: #5a6480;
    margin-top: 2px;
}

.dsc-statcard--ok .dsc-statcard__num {
    color: #065f46;
}

.dsc-statcard--err .dsc-statcard__num {
    color: #991b1b;
}

/* Log */
.dsc-log {
    background: #f4f6fb;
    border-radius: 8px;
    font-size: 0.75rem;
    font-family: monospace;
    color: #5a6480;
    padding: 10px 12px;
    max-height: 130px;
    overflow-y: auto;
    line-height: 1.8;
}

.dsc-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px;
    gap: 8px;
}

.dsc-empty__text {
    font-size: 0.82rem;
    color: #94a3b8;
    font-weight: 500;
}
</style>