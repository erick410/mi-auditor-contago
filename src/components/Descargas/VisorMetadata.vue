<template>
    <!-- ═══════════════════════════════════════════════════════════════
         USO desde DescargasMetadata.vue:
  
         1. Importar y registrar:
            import VisorMetadata from './VisorMetadata.vue'
            components: { VisorMetadata }
  
         2. En el template:
            <visor-metadata ref="visor" />
  
         3. Llamar cuando el usuario hace click en "Extraer .txt":
            // después de recibir res.data.base64 del back:
            this.$refs.visor.abrir(res.data.base64, item.solicitudPaquete + '.txt')
    ═══════════════════════════════════════════════════════════════ -->

    <q-dialog v-model="abierto" maximized transition-show="slide-up" transition-hide="slide-down">
        <q-card class="vm-card-dialog">

            <!-- ── TOOLBAR ─────────────────────────────────────────────── -->
            <q-toolbar class="vm-toolbar">
                <div class="vm-toolbar__left">
                    <div class="vm-toolbar__icon">
                        <q-icon name="mdi-table-search" size="18px" color="white" />
                    </div>
                    <div>
                        <div class="vm-toolbar__title">Visor Metadata SAT</div>
                        <div class="vm-toolbar__sub">{{ nombreArchivo }}</div>
                    </div>
                </div>
                <q-space />
                <q-btn flat round dense icon="mdi-close" color="white" @click="abierto = false">
                    <q-tooltip>Cerrar</q-tooltip>
                </q-btn>
            </q-toolbar>

            <!-- ── CONTENIDO ───────────────────────────────────────────── -->
            <q-card-section class="vm-body">

                <!-- Spinner mientras procesa -->
                <div class="vm-loading" v-if="cargando">
                    <q-spinner-dots color="primary" size="3rem" />
                    <div>Procesando archivo...</div>
                </div>

                <template v-else-if="rows.length">

                    <!-- TARJETAS RESUMEN -->
                    <div class="vm-cards">
                        <div class="vm-stat">
                            <div class="vm-stat__label">Total</div>
                            <div class="vm-stat__val">{{ fmt(rows.length) }}</div>
                        </div>
                        <div class="vm-stat vm-stat--green">
                            <div class="vm-stat__label">Vigentes</div>
                            <div class="vm-stat__val">{{ fmt(vigentes) }}</div>
                        </div>
                        <div class="vm-stat vm-stat--red">
                            <div class="vm-stat__label">Cancelados</div>
                            <div class="vm-stat__val">{{ fmt(cancelados) }}</div>
                        </div>
                        <div class="vm-stat vm-stat--blue">
                            <div class="vm-stat__label">Monto vigente</div>
                            <div class="vm-stat__val vm-stat__val--sm">{{ montoTotal }}</div>
                        </div>
                        <div class="vm-stat vm-stat--indigo">
                            <div class="vm-stat__label">Ingresos</div>
                            <div class="vm-stat__val">{{ fmt(cntEfecto('I')) }}</div>
                        </div>
                        <div class="vm-stat vm-stat--purple">
                            <div class="vm-stat__label">Egresos</div>
                            <div class="vm-stat__val">{{ fmt(cntEfecto('E')) }}</div>
                        </div>
                        <div class="vm-stat vm-stat--teal">
                            <div class="vm-stat__label">Pagos</div>
                            <div class="vm-stat__val">{{ fmt(cntEfecto('P')) }}</div>
                        </div>
                        <div class="vm-stat vm-stat--orange">
                            <div class="vm-stat__label">Nómina</div>
                            <div class="vm-stat__val">{{ fmt(cntEfecto('N')) }}</div>
                        </div>
                    </div>

                    <!-- FILTROS -->
                    <div class="vm-filters">
                        <div class="vm-filter-row">

                            <div class="vm-field" style="flex:1; min-width:200px">
                                <div class="vm-field__label">Buscar</div>
                                <q-input dense outlined v-model="buscar" clearable placeholder="UUID, RFC, nombre..."
                                    class="vm-input">
                                    <template v-slot:prepend><q-icon name="search" size="15px" /></template>
                                </q-input>
                            </div>

                            <div class="vm-field" style="min-width:140px">
                                <div class="vm-field__label">Efecto</div>
                                <q-select dense outlined v-model="filtroEfecto" :options="opcionesEfecto"
                                    class="vm-input" />
                            </div>

                            <div class="vm-field" style="min-width:130px">
                                <div class="vm-field__label">Estatus</div>
                                <q-select dense outlined v-model="filtroEstatus"
                                    :options="['Todos', 'Vigente', 'Cancelado']" class="vm-input" />
                            </div>

                            <div class="vm-field" style="min-width:130px">
                                <div class="vm-field__label">Fecha desde</div>
                                <q-input dense outlined v-model="filtroFechaI" type="date" class="vm-input" />
                            </div>

                            <div class="vm-field" style="min-width:130px">
                                <div class="vm-field__label">Fecha hasta</div>
                                <q-input dense outlined v-model="filtroFechaF" type="date" class="vm-input" />
                            </div>

                            <div class="vm-field" style="align-self:flex-end">
                                <q-btn dense unelevated outline color="grey-7" icon="mdi-filter-remove" label="Limpiar"
                                    class="vm-btn" @click="limpiar" />
                            </div>

                        </div>

                        <div class="vm-filter-info">
                            Mostrando <b>{{ fmt(filtradas.length) }}</b> de {{ fmt(rows.length) }} registros
                            · Monto filtrado: <b>{{ montoFiltrado }}</b>
                        </div>
                    </div>

                    <!-- TABLA -->
                    <q-table dense flat bordered :data="filtradas" :columns="columns" row-key="uuid"
                        :pagination.sync="pagination" :rows-per-page-options="[25, 50, 100, 200]" class="vm-table">
                        <template v-slot:body="props">
                            <q-tr :props="props" :class="props.row.estatus === '0' ? 'vm-row--cancelado' : ''">

                                <q-td key="uuid" :props="props" class="vm-td">
                                    <span class="vm-uuid">{{ props.row.uuid }}</span>
                                    <q-btn flat dense round size="xs" icon="mdi-content-copy" color="grey-5"
                                        class="vm-copy-btn" @click="copiar(props.row.uuid)">
                                        <q-tooltip>Copiar UUID</q-tooltip>
                                    </q-btn>
                                </q-td>

                                <q-td key="rfcEmisor" :props="props" class="vm-td">
                                    <div class="vm-rfc">{{ props.row.rfcEmisor }}</div>
                                    <div class="vm-nombre">{{ props.row.nombreEmisor }}</div>
                                </q-td>

                                <q-td key="rfcReceptor" :props="props" class="vm-td">
                                    <div class="vm-rfc">{{ props.row.rfcReceptor }}</div>
                                    <div class="vm-nombre">{{ props.row.nombreReceptor }}</div>
                                </q-td>

                                <q-td key="fechaEmision" :props="props" class="vm-td text-center">
                                    {{ props.row.fechaEmision }}
                                </q-td>

                                <q-td key="monto" :props="props" class="vm-td text-right">
                                    <span class="vm-monto">{{ fmtMonto(props.row.monto) }}</span>
                                </q-td>

                                <q-td key="efecto" :props="props" class="vm-td text-center">
                                    <span :class="['vm-pill', efecto2class(props.row.efecto)]">
                                        {{ efecto2label(props.row.efecto) }}
                                    </span>
                                </q-td>

                                <q-td key="estatus" :props="props" class="vm-td text-center">
                                    <span :class="['vm-pill',
                                        props.row.estatus === '1' ? 'vm-pill--vigente' : 'vm-pill--cancelado']">
                                        {{ props.row.estatus === '1' ? 'Vigente' : 'Cancelado' }}
                                    </span>
                                </q-td>

                                <q-td key="fechaCancelacion" :props="props" class="vm-td text-center">
                                    <span class="vm-fecha-cancel">{{ props.row.fechaCancelacion || '—' }}</span>
                                </q-td>

                            </q-tr>
                        </template>

                        <template v-slot:no-data>
                            <div class="vm-empty">
                                <q-icon name="mdi-filter-off-outline" size="2rem" color="grey-4" />
                                <div>Sin registros con los filtros aplicados</div>
                            </div>
                        </template>
                    </q-table>

                </template>

            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script>
export default {
    name: 'VisorMetadata',

    data() {
        return {
            abierto: false,
            cargando: false,
            nombreArchivo: '',
            rows: [],

            buscar: '',
            filtroEfecto: 'Todos',
            filtroEstatus: 'Todos',
            filtroFechaI: '',
            filtroFechaF: '',

            opcionesEfecto: ['Todos', 'Ingreso (I)', 'Egreso (E)', 'Traslado (T)', 'Nomina (N)', 'Pago (P)'],

            pagination: { rowsPerPage: 50, sortBy: 'fechaEmision', descending: true },

            columns: [
                { name: 'uuid', label: 'UUID', field: 'uuid', align: 'left', sortable: true },
                { name: 'rfcEmisor', label: 'Emisor', field: 'rfcEmisor', align: 'left', sortable: true },
                { name: 'rfcReceptor', label: 'Receptor', field: 'rfcReceptor', align: 'left', sortable: true },
                { name: 'fechaEmision', label: 'Fecha emisión', field: 'fechaEmision', align: 'center', sortable: true },
                { name: 'monto', label: 'Monto', field: 'monto', align: 'right', sortable: true },
                { name: 'efecto', label: 'Efecto', field: 'efecto', align: 'center', sortable: true },
                { name: 'estatus', label: 'Estatus', field: 'estatus', align: 'center', sortable: true },
                { name: 'fechaCancelacion', label: 'F. Cancelación', field: 'fechaCancelacion', align: 'center', sortable: true },
            ],
        }
    },

    computed: {
        vigentes() { return this.rows.filter(r => r.estatus === '1').length },
        cancelados() { return this.rows.filter(r => r.estatus === '0').length },

        montoTotal() {
            return this.fmtMonto(
                this.rows.filter(r => r.estatus === '1').reduce((s, r) => s + r.monto, 0))
        },

        montoFiltrado() {
            return this.fmtMonto(
                this.filtradas.filter(r => r.estatus === '1').reduce((s, r) => s + r.monto, 0))
        },

        filtradas() {
            let data = this.rows

            if (this.buscar) {
                const q = this.buscar.toLowerCase()
                data = data.filter(r =>
                    r.uuid.toLowerCase().includes(q) ||
                    r.rfcEmisor.toLowerCase().includes(q) ||
                    r.nombreEmisor.toLowerCase().includes(q) ||
                    r.rfcReceptor.toLowerCase().includes(q) ||
                    r.nombreReceptor.toLowerCase().includes(q)
                )
            }

            if (this.filtroEfecto !== 'Todos') {
                const codigo = this.filtroEfecto.slice(-2, -1)
                data = data.filter(r => r.efecto === codigo)
            }

            if (this.filtroEstatus !== 'Todos') {
                const val = this.filtroEstatus === 'Vigente' ? '1' : '0'
                data = data.filter(r => r.estatus === val)
            }

            if (this.filtroFechaI)
                data = data.filter(r => r.fechaEmision >= this.filtroFechaI)

            if (this.filtroFechaF)
                data = data.filter(r => r.fechaEmision <= this.filtroFechaF + ' 23:59:59')

            return data
        },
    },

    methods: {
        // Llamar desde el padre: this.$refs.visor.abrir(base64, nombre)
        abrir(base64, nombre) {
            this.nombreArchivo = nombre || 'metadata.txt'
            this.rows = []
            this.abierto = true
            this.cargando = true
            this.limpiar()

            this.$nextTick(() => {
                try {
                    const text = decodeURIComponent(escape(atob(base64)))
                    const lines = text.split(/\r?\n/).filter(l => l.trim())
                    this.rows = lines.slice(1).map(line => {
                        const c = line.split('~')
                        return {
                            uuid: c[0] || '',
                            rfcEmisor: c[1] || '',
                            nombreEmisor: c[2] || '',
                            rfcReceptor: c[3] || '',
                            nombreReceptor: c[4] || '',
                            fechaEmision: c[6] || '',
                            monto: parseFloat(c[8]) || 0,
                            efecto: c[9] || '',
                            estatus: c[10] || '',
                            fechaCancelacion: c[11] || '',
                        }
                    })
                    this.$q.notify({
                        type: 'positive',
                        message: this.rows.length.toLocaleString('es-MX') + ' registros cargados.'
                    })
                } catch (e) {
                    this.$q.notify({ type: 'negative', message: 'Error al procesar el archivo.' })
                } finally {
                    this.cargando = false
                }
            })
        },

        limpiar() {
            this.buscar = ''
            this.filtroEfecto = 'Todos'
            this.filtroEstatus = 'Todos'
            this.filtroFechaI = ''
            this.filtroFechaF = ''
        },

        copiar(texto) {
            navigator.clipboard.writeText(texto)
            this.$q.notify({ type: 'info', message: 'UUID copiado.', timeout: 1000 })
        },

        cntEfecto(codigo) {
            return this.rows.filter(r => r.efecto === codigo && r.estatus === '1').length
        },

        efecto2label(e) {
            return { I: 'Ingreso', E: 'Egreso', T: 'Traslado', N: 'Nómina', P: 'Pago' }[e] || e
        },

        efecto2class(e) {
            return {
                I: 'vm-pill--ingreso', E: 'vm-pill--egreso',
                T: 'vm-pill--traslado', N: 'vm-pill--nomina', P: 'vm-pill--pago'
            }[e] || ''
        },

        fmt(n) { return n.toLocaleString('es-MX') },
        fmtMonto(v) {
            return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(v)
        },
    },
}
</script>

<style scoped>

.vm-card-dialog {
    display: flex;
    flex-direction: column;
}

/* Toolbar */
.vm-toolbar {
    background: linear-gradient(135deg, #fe3d3d, #f86969);
    padding: 10px 16px;
    flex-shrink: 0;
}

.vm-toolbar__left {
    display: flex;
    align-items: center;
    gap: 10px;
}

.vm-toolbar__icon {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    background: rgba(255, 255, 255, .2);
    display: flex;
    align-items: center;
    justify-content: center;
}

.vm-toolbar__title {
    font-size: 0.95rem;
    font-weight: 700;
    color: #fff;
}

.vm-toolbar__sub {
    font-size: 0.68rem;
    color: rgba(255, 255, 255, .75);
    letter-spacing: 0.3px;
    text-transform: uppercase;
}

/* Body */
.vm-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px 20px;
    background: #f4f6fb;
}

/* Tarjetas */
.vm-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 14px;
}

.vm-stat {
    background: #fff;
    border: 1px solid #e2e6f0;
    border-radius: 8px;
    padding: 10px 14px;
    flex: 1;
    min-width: 100px;
    border-left: 3px solid #e2e6f0;
}

.vm-stat--green {
    border-left-color: #10b981;
}

.vm-stat--red {
    border-left-color: #ef4444;
}

.vm-stat--blue {
    border-left-color: #3d5afe;
}

.vm-stat--indigo {
    border-left-color: #4f46e5;
}

.vm-stat--purple {
    border-left-color: #7c3aed;
}

.vm-stat--teal {
    border-left-color: #0d9488;
}

.vm-stat--orange {
    border-left-color: #f59e0b;
}

.vm-stat__label {
    font-size: 0.65rem;
    font-weight: 700;
    color: #7b86a0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 3px;
}

.vm-stat__val {
    font-size: 1.1rem;
    font-weight: 700;
    color: #0f1623;
}

.vm-stat__val--sm {
    font-size: 0.85rem;
}

/* Filtros */
.vm-filters {
    background: #fff;
    border: 1px solid #e2e6f0;
    border-radius: 10px;
    padding: 12px 16px;
    margin-bottom: 14px;
}

.vm-filter-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: flex-end;
}

.vm-field {
    display: flex;
    flex-direction: column;
}

.vm-field__label {
    font-size: 0.65rem;
    font-weight: 700;
    color: #7b86a0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 3px;
}

.vm-input {
    font-size: 0.8rem;
}

.vm-btn {
    font-size: 0.76rem;
    font-weight: 600;
    height: 36px;
    padding: 0 12px;
    border-radius: 8px !important;
}

.vm-filter-info {
    margin-top: 8px;
    font-size: 0.72rem;
    color: #7b86a0;
}

/* Tabla */
.vm-table {
    border-radius: 10px;
    overflow: hidden;
    font-size: 0.76rem;
    background: #fff;
}

.vm-td {
    padding: 4px 8px !important;
    font-size: 0.74rem;
}

.vm-uuid {
    font-size: 0.67rem;
    color: #3d5afe;
    letter-spacing: 0.2px;
}

.vm-copy-btn {
    opacity: 0;
    transition: opacity .15s;
}

.vm-td:hover .vm-copy-btn {
    opacity: 1;
}

.vm-rfc {
    font-weight: 600;
    font-size: 0.73rem;
    color: #0f1623;
}

.vm-nombre {
    font-size: 0.67rem;
    color: #8c93a8;
}

.vm-monto {
    font-weight: 600;
}

.vm-fecha-cancel {
    font-size: 0.7rem;
    color: #ef4444;
}

.vm-pill {
    display: inline-block;
    border-radius: 4px;
    padding: 1px 7px;
    font-size: 0.67rem;
    font-weight: 700;
    letter-spacing: 0.2px;
}

.vm-pill--vigente {
    background: #d1fae5;
    color: #065f46;
}

.vm-pill--cancelado {
    background: #fee2e2;
    color: #991b1b;
}

.vm-pill--ingreso {
    background: #dbeafe;
    color: #1d4ed8;
}

.vm-pill--egreso {
    background: #fef3c7;
    color: #92400e;
}

.vm-pill--traslado {
    background: #e0f2fe;
    color: #0369a1;
}

.vm-pill--nomina {
    background: #f3e8ff;
    color: #7c3aed;
}

.vm-pill--pago {
    background: #d1fae5;
    color: #065f46;
}

.vm-row--cancelado {
    background: #fff5f5 !important;
}

.vm-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 30px;
    font-size: 0.78rem;
    color: #94a3b8;
}

.vm-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 80px;
    font-size: 0.85rem;
    color: #8c93a8;
}
</style>