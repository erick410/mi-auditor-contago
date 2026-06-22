<template>
    <div class="dsc-panel">

        <!-- FILTROS -->
        <div class="dsc-filters">
            <div class="dsc-filters__row">

                <!-- Ejercicio -->
                <div class="dsc-field dsc-field--sm">
                    <div class="dsc-field__label">Ejercicio</div>
                    <q-select dense outlined v-model="ejercicio" :options="ejercicios"
                        class="dsc-input" emit-value map-options />
                </div>

                <!-- Mes -->
                <div class="dsc-field dsc-field--sm">
                    <div class="dsc-field__label">Mes</div>
                    <q-select dense outlined v-model="mes" :options="meses"
                        option-label="label" option-value="value"
                        emit-value map-options class="dsc-input" />
                </div>

                <!-- Tipo -->
                <div class="dsc-field dsc-field--sm">
                    <div class="dsc-field__label">Tipo</div>
                    <q-select dense outlined v-model="tipoFiltro"
                        :options="['Todos', 'Emitido', 'Recibido']" class="dsc-input" />
                </div>

                <!-- Botones -->
                <div class="dsc-field dsc-field--btns">
                    <q-btn dense unelevated color="red-7" icon="mdi-magnify" label="Consultar"
                        :loading="cargando" :disable="cargando" class="dsc-btn"
                        @click="consultar" />
                    <q-btn dense unelevated outline color="red-7" icon="mdi-refresh" label="Limpiar"
                        :disable="cargando" class="dsc-btn" @click="limpiar" />
                </div>

            </div>
        </div>

        <!-- RESUMEN CARDS -->
        <div v-if="documentos.length" class="dsc-cards">
            <div class="dsc-card">
                <div class="dsc-card__label">Documentos</div>
                <div class="dsc-card__val">{{ documentos.length }}</div>
            </div>
            <div class="dsc-card dsc-card--red">
                <div class="dsc-card__label">Total retenido</div>
                <div class="dsc-card__val">${{ fmtMonto(totalRetenido) }}</div>
            </div>
            <div class="dsc-card">
                <div class="dsc-card__label">Total operación</div>
                <div class="dsc-card__val">${{ fmtMonto(totalOperacion) }}</div>
            </div>
            <div class="dsc-card">
                <div class="dsc-card__label">ISR retenido</div>
                <div class="dsc-card__val">${{ fmtMonto(totalISR) }}</div>
            </div>
            <div class="dsc-card">
                <div class="dsc-card__label">IVA retenido</div>
                <div class="dsc-card__val">${{ fmtMonto(totalIVA) }}</div>
            </div>
        </div>

        <!-- TABLA -->
        <div class="dsc-table-wrap">
            <q-table dense flat bordered :data="documentosFiltrados" :columns="columns"
                :filter="filter" :pagination.sync="pagination"
                :rows-per-page-options="[15, 25, 50]" row-key="_id" class="dsc-table">

                <template v-slot:top>
                    <div class="dsc-table__top">
                        <span class="dsc-table__title">
                            <q-icon name="mdi-file-percent-outline" size="18px" color="red-7" class="q-mr-xs" />
                            Documentos de Retenciones
                        </span>
                        <q-input dense outlined v-model="filter" placeholder="Buscar…" style="width:200px">
                            <template v-slot:prepend><q-icon name="search" size="16px" /></template>
                        </q-input>
                    </div>
                </template>

                <template v-slot:body="props">
                    <q-tr :props="props" class="dsc-tr">

                        <!-- Folio fiscal -->
                        <q-td key="uuid" :props="props" class="dsc-td">
                            <div class="dsc-uuid">{{ props.row.uuid | uuidCorto }}</div>
                            <div class="dsc-uuid-full">{{ props.row.folioInt }}</div>
                        </q-td>

                        <!-- Tipo -->
                        <q-td key="tipoDescarga" :props="props" class="dsc-td">
                            <span :class="['dsc-pill',
                                props.row.tipoDescarga === 'Emitido' ? 'dsc-pill--blue' : 'dsc-pill--purple']">
                                {{ props.row.tipoDescarga }}
                            </span>
                        </q-td>

                        <!-- Emisor -->
                        <q-td key="emisor" :props="props" class="dsc-td">
                            <div class="dsc-bold">{{ props.row.rfcEmisor }}</div>
                            <div class="dsc-sub">{{ props.row.nombreEmisor }}</div>
                        </q-td>

                        <!-- Receptor -->
                        <q-td key="receptor" :props="props" class="dsc-td">
                            <div class="dsc-bold">{{ props.row.rfcReceptor }}</div>
                            <div class="dsc-sub">{{ props.row.nombreReceptor }}</div>
                        </q-td>

                        <!-- Periodo -->
                        <q-td key="periodo" :props="props" class="dsc-td text-center">
                            <span class="dsc-periodo">
                                {{ mesNombre(props.row.mesIni) }}
                                <span v-if="props.row.mesFin !== props.row.mesIni">
                                    — {{ mesNombre(props.row.mesFin) }}
                                </span>
                                {{ props.row.ejercicio }}
                            </span>
                        </q-td>

                        <!-- Total operación -->
                        <q-td key="montoTotOperacion" :props="props" class="dsc-td text-right">
                            <span class="dsc-monto">${{ fmtMonto(props.row.montoTotOperacion) }}</span>
                        </q-td>

                        <!-- Total retenido -->
                        <q-td key="montoTotRet" :props="props" class="dsc-td text-right">
                            <span class="dsc-monto dsc-monto--red">${{ fmtMonto(props.row.montoTotRet) }}</span>
                        </q-td>

                        <!-- Impuestos retenidos (badges ISR/IVA) -->
                        <q-td key="impuestos" :props="props" class="dsc-td">
                            <div class="dsc-imp-list">
                                <span v-for="imp in props.row.impuestosRetenidos" :key="imp.impuesto"
                                    :class="['dsc-imp', imp.impuesto === '001' ? 'dsc-imp--isr' : 'dsc-imp--iva']">
                                    {{ imp.impuesto === '001' ? 'ISR' : imp.impuesto === '002' ? 'IVA' : imp.impuesto }}
                                    ${{ fmtMonto(imp.montoRet) }}
                                </span>
                            </div>
                        </q-td>

                        <!-- Fecha timbrado -->
                        <q-td key="fechaTimbrado" :props="props" class="dsc-td">
                            {{ fd(props.row.fechaTimbrado) }}
                        </q-td>

                        <!-- Acciones -->
                        <q-td key="acciones" :props="props" class="dsc-td" auto-width>
                            <div class="dsc-actions">
                                <q-btn dense round flat   color="red-7"
                                    icon="mdi-file-pdf-box"
                                    :loading="generandoPdf === props.row._id"
                                    @click="descargarPdf(props.row)">
                                    <q-tooltip class="dsc-tip">Descargar PDF</q-tooltip>
                                </q-btn>
                                <q-btn dense round flat   color="indigo-6"
                                    icon="mdi-eye-outline"
                                    @click="verDetalle(props.row)">
                                    <q-tooltip class="dsc-tip">Ver detalle</q-tooltip>
                                </q-btn>
                                <q-btn dense round flat   color="teal-6"
                                    icon="mdi-xml"
                                    @click="descargarXml(props.row)">
                                    <q-tooltip class="dsc-tip">Descargar XML</q-tooltip>
                                </q-btn>
                            </div>
                        </q-td>

                    </q-tr>
                </template>

                <template v-slot:no-data>
                    <div class="dsc-empty">
                        <q-icon name="mdi-file-percent-outline" size="2.5rem" color="grey-4" />
                        <div class="dsc-empty__text">
                            {{ cargando ? 'Cargando...' : 'Sin documentos. Usa los filtros y presiona Consultar.' }}
                        </div>
                    </div>
                </template>
            </q-table>
        </div>

        <!-- DIALOG DETALLE -->
        <q-dialog v-model="dialogDetalle" maximized transition-show="slide-up" transition-hide="slide-down">
            <q-card class="det-card">
                <q-bar class="det-bar">
                    <q-icon name="mdi-file-percent-outline" color="white" />
                    <span class="det-bar__title">Detalle de Retención</span>
                    <q-space />
                    <q-btn dense flat round icon="mdi-file-pdf-box" color="white"
                        @click="descargarPdf(docSeleccionado)">
                        <q-tooltip>Descargar PDF</q-tooltip>
                    </q-btn>
                    <q-btn dense flat round icon="close" color="white" v-close-popup />
                </q-bar>

                <q-card-section v-if="docSeleccionado" class="det-body">

                    <!-- UUID -->
                    <div class="det-uuid">
                        <q-icon name="mdi-identifier" size="14px" color="red-7" />
                        {{ docSeleccionado.uuid }}
                    </div>

                    <div class="det-grid">

                        <!-- Identificación -->
                        <div class="det-section">
                            <div class="det-section__title">Identificación</div>
                            <div class="det-row"><span>Folio interno</span><b>{{ docSeleccionado.folioInt }}</b></div>
                            <div class="det-row"><span>Clave retención</span><b>{{ docSeleccionado.cveRetenc }}</b></div>
                            <div class="det-row"><span>Lugar expedición</span><b>{{ docSeleccionado.lugarExp }}</b></div>
                            <div class="det-row"><span>Fecha emisión</span><b>{{ fd(docSeleccionado.fechaExp) }}</b></div>
                            <div class="det-row"><span>Fecha timbrado</span><b>{{ fd(docSeleccionado.fechaTimbrado) }}</b></div>
                            <div class="det-row"><span>RFC prov. cert.</span><b>{{ docSeleccionado.rfcProvCertif }}</b></div>
                        </div>

                        <!-- Emisor -->
                        <div class="det-section">
                            <div class="det-section__title">Emisor</div>
                            <div class="det-row"><span>RFC</span><b>{{ docSeleccionado.rfcEmisor }}</b></div>
                            <div class="det-row"><span>Nombre</span><b>{{ docSeleccionado.nombreEmisor }}</b></div>
                            <div class="det-row"><span>Régimen fiscal</span><b>{{ docSeleccionado.regimenFiscalEmisor }}</b></div>
                        </div>

                        <!-- Receptor -->
                        <div class="det-section">
                            <div class="det-section__title">Receptor</div>
                            <div class="det-row"><span>RFC</span><b>{{ docSeleccionado.rfcReceptor }}</b></div>
                            <div class="det-row"><span>Nombre</span><b>{{ docSeleccionado.nombreReceptor }}</b></div>
                            <div class="det-row"><span>Nacionalidad</span><b>{{ docSeleccionado.nacionalidad }}</b></div>
                            <div class="det-row"><span>Domicilio fiscal</span><b>{{ docSeleccionado.domicilioFiscal }}</b></div>
                        </div>

                        <!-- Periodo -->
                        <div class="det-section">
                            <div class="det-section__title">Período</div>
                            <div class="det-row"><span>Mes inicial</span><b>{{ mesNombre(docSeleccionado.mesIni) }}</b></div>
                            <div class="det-row"><span>Mes final</span><b>{{ mesNombre(docSeleccionado.mesFin) }}</b></div>
                            <div class="det-row"><span>Ejercicio</span><b>{{ docSeleccionado.ejercicio }}</b></div>
                        </div>

                        <!-- Totales -->
                        <div class="det-section det-section--full">
                            <div class="det-section__title">Totales</div>
                            <div class="det-totales">
                                <div class="det-total-card">
                                    <span>Total operación</span>
                                    <b>${{ fmtMonto(docSeleccionado.montoTotOperacion) }}</b>
                                </div>
                                <div class="det-total-card">
                                    <span>Total gravado</span>
                                    <b>${{ fmtMonto(docSeleccionado.montoTotGrav) }}</b>
                                </div>
                                <div class="det-total-card">
                                    <span>Total exento</span>
                                    <b>${{ fmtMonto(docSeleccionado.montoTotExent) }}</b>
                                </div>
                                <div class="det-total-card det-total-card--red">
                                    <span>Total retenido</span>
                                    <b>${{ fmtMonto(docSeleccionado.montoTotRet) }}</b>
                                </div>
                            </div>
                        </div>

                        <!-- Impuestos retenidos -->
                        <div class="det-section det-section--full">
                            <div class="det-section__title">Impuestos Retenidos</div>
                            <table class="det-table">
                                <thead>
                                    <tr>
                                        <th>Impuesto</th>
                                        <th>Base retenida</th>
                                        <th>Monto retenido</th>
                                        <th>Tipo pago</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="imp in docSeleccionado.impuestosRetenidos" :key="imp.impuesto">
                                        <td>
                                            <span :class="['dsc-imp', imp.impuesto === '001' ? 'dsc-imp--isr' : 'dsc-imp--iva']">
                                                {{ imp.impuesto === '001' ? 'ISR' : imp.impuesto === '002' ? 'IVA' : imp.impuesto }}
                                            </span>
                                        </td>
                                        <td>${{ fmtMonto(imp.baseRet) }}</td>
                                        <td><b>${{ fmtMonto(imp.montoRet) }}</b></td>
                                        <td>{{ imp.tipoPagoRet }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <!-- Plataformas Tecnológicas -->
                        <div v-if="docSeleccionado.plataformasTecnologicas"
                            class="det-section det-section--full">
                            <div class="det-section__title">Complemento — Plataformas Tecnológicas</div>
                            <div class="det-totales">
                                <div class="det-total-card">
                                    <span>Periodicidad</span>
                                    <b>{{ docSeleccionado.plataformasTecnologicas.periodicidad }}</b>
                                </div>
                                <div class="det-total-card">
                                    <span>Num. servicios</span>
                                    <b>{{ docSeleccionado.plataformasTecnologicas.numServ }}</b>
                                </div>
                                <div class="det-total-card">
                                    <span>Monto tot. sin IVA</span>
                                    <b>${{ fmtMonto(docSeleccionado.plataformasTecnologicas.monTotServSIVA) }}</b>
                                </div>
                                <div class="det-total-card">
                                    <span>IVA trasladado</span>
                                    <b>${{ fmtMonto(docSeleccionado.plataformasTecnologicas.totalIVATrasladado) }}</b>
                                </div>
                                <div class="det-total-card">
                                    <span>IVA retenido</span>
                                    <b>${{ fmtMonto(docSeleccionado.plataformasTecnologicas.totalIVARetenido) }}</b>
                                </div>
                                <div class="det-total-card">
                                    <span>ISR retenido</span>
                                    <b>${{ fmtMonto(docSeleccionado.plataformasTecnologicas.totalISRRetenido) }}</b>
                                </div>
                                <div class="det-total-card">
                                    <span>Dif. IVA entregado</span>
                                    <b>${{ fmtMonto(docSeleccionado.plataformasTecnologicas.difIVAEntregado) }}</b>
                                </div>
                                <div class="det-total-card det-total-card--red">
                                    <span>Uso plataforma</span>
                                    <b>${{ fmtMonto(docSeleccionado.plataformasTecnologicas.monTotalUsoPlataforma) }}</b>
                                </div>
                            </div>

                            <!-- Servicios detalle -->
                            <div v-for="(srv, i) in docSeleccionado.plataformasTecnologicas.servicios"
                                :key="i" class="det-servicio">
                                <div class="det-servicio__header">
                                    Servicio {{ i + 1 }} &nbsp;·&nbsp;
                                    Fecha: {{ srv.fechaServ }} &nbsp;·&nbsp;
                                    Tipo: {{ srv.tipoDeServ }} &nbsp;·&nbsp;
                                    Forma pago: {{ srv.formaPagoServ }}
                                </div>
                                <div class="det-totales">
                                    <div class="det-total-card">
                                        <span>Precio sin IVA</span>
                                        <b>${{ fmtMonto(srv.precioSinIVA) }}</b>
                                    </div>
                                    <div class="det-total-card">
                                        <span>Comisión</span>
                                        <b>${{ fmtMonto(srv.comisionImporte) }}</b>
                                    </div>
                                </div>
                                <table v-if="srv.impuestosTrasladadados && srv.impuestosTrasladadados.length"
                                    class="det-table" style="margin-top:8px">
                                    <thead>
                                        <tr>
                                            <th>Impuesto</th><th>Base</th>
                                            <th>Tipo factor</th><th>Tasa</th><th>Importe</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(it, j) in srv.impuestosTrasladadados" :key="j">
                                            <td>{{ it.impuesto }}</td>
                                            <td>${{ fmtMonto(it.baseImp) }}</td>
                                            <td>{{ it.tipoFactor }}</td>
                                            <td>{{ it.tasaCuota }}</td>
                                            <td><b>${{ fmtMonto(it.importe) }}</b></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </q-card-section>
            </q-card>
        </q-dialog>

    </div>
</template>

<script>
import axios from 'axios'
import moment from 'moment'
import { generarPdfRetencion } from '../Pdf/generarPdfRetencion'

const MESES = [
    { label: 'Todos', value: null },
    { label: 'Enero',      value: 1  }, { label: 'Febrero',    value: 2  },
    { label: 'Marzo',      value: 3  }, { label: 'Abril',      value: 4  },
    { label: 'Mayo',       value: 5  }, { label: 'Junio',      value: 6  },
    { label: 'Julio',      value: 7  }, { label: 'Agosto',     value: 8  },
    { label: 'Septiembre', value: 9  }, { label: 'Octubre',    value: 10 },
    { label: 'Noviembre',  value: 11 }, { label: 'Diciembre',  value: 12 },
]

const MESES_NOMBRES = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                           'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export default {
    name: 'RetencionesDocumentos',

    filters: {
        uuidCorto(v) {
            if (!v) return '—'
            return v.substring(0, 8).toUpperCase() + '...'
        },
    },

    data() {
        const anioActual = new Date().getFullYear()
        return {
            ejercicio:      anioActual,
            ejercicios:     [anioActual, anioActual - 1, anioActual - 2, anioActual - 3],
            mes:            null,
            meses:          MESES,
            tipoFiltro:     'Todos',
            cargando:       false,
            generandoPdf:   null,
            filter:         '',
            documentos:     [],
            pagination:     { sortBy: 'fechaTimbrado', descending: true, rowsPerPage: 15 },
            dialogDetalle:  false,
            docSeleccionado: null,
            columns: [
                { name: 'uuid',             label: 'Folio fiscal',    field: 'uuid',             align: 'left'   },
                { name: 'tipoDescarga',     label: 'Tipo',            field: 'tipoDescarga',     align: 'center', sortable: true },
                { name: 'emisor',           label: 'Emisor',          field: 'rfcEmisor',        align: 'left',   sortable: true },
                { name: 'receptor',         label: 'Receptor',        field: 'rfcReceptor',      align: 'left',   sortable: true },
                { name: 'periodo',          label: 'Período',         field: 'mesIni',           align: 'center', sortable: true },
                { name: 'montoTotOperacion',label: 'Operación',       field: 'montoTotOperacion',align: 'right',  sortable: true },
                { name: 'montoTotRet',      label: 'Retenido',        field: 'montoTotRet',      align: 'right',  sortable: true },
                { name: 'impuestos',        label: 'ISR / IVA',       field: 'impuestosRetenidos',align: 'left'  },
                { name: 'fechaTimbrado',    label: 'Timbrado',        field: 'fechaTimbrado',    align: 'left',   sortable: true },
                { name: 'acciones',         label: '',                field: 'acciones',         align: 'right'  },
            ],
        }
    },

    computed: {
        token()  { return this.$store.state.usuario },
        ruta()   { return this.$store.state.rutaDescargas },

        documentosFiltrados() {
            if (this.tipoFiltro === 'Todos') return this.documentos
            return this.documentos.filter(d => d.tipoDescarga === this.tipoFiltro)
        },

        totalRetenido()  { return this.documentosFiltrados.reduce((s, d) => s + (d.montoTotRet      || 0), 0) },
        totalOperacion() { return this.documentosFiltrados.reduce((s, d) => s + (d.montoTotOperacion || 0), 0) },
        totalISR() {
            return this.documentosFiltrados.reduce((s, d) => {
                const isr = (d.impuestosRetenidos || []).find(i => i.impuesto === '001')
                return s + (isr ? isr.montoRet : 0)
            }, 0)
        },
        totalIVA() {
            return this.documentosFiltrados.reduce((s, d) => {
                const iva = (d.impuestosRetenidos || []).find(i => i.impuesto === '002')
                return s + (iva ? iva.montoRet : 0)
            }, 0)
        },
    },

    methods: {
        async consultar() {
            this.cargando = true
            this.$q.loading.show({ message: '<b>Consultando documentos...</b>' })
            try {
                let url = this.ruta + 'Retenciones/GetRetencionesDocumentos/erp_'
                    + this.token.rfc + '/' + this.token.rfc
                    + '?ejercicio=' + this.ejercicio
                if (this.mes) url += '&mes=' + this.mes

                const res = await axios.get(url)
                this.documentos = res.data || []
            } catch (e) {
                console.error(e)
                this.$q.notify({ type: 'negative', message: 'Error al consultar documentos.' })
            } finally {
                this.cargando = false
                this.$q.loading.hide()
            }
        },

        limpiar() {
            this.documentos  = []
            this.mes         = null
            this.tipoFiltro  = 'Todos'
            this.filter      = ''
        },

        verDetalle(doc) {
            this.docSeleccionado = doc
            this.dialogDetalle   = true
        },

        async descargarPdf(doc) {
            this.generandoPdf = doc._id
            try {
                await generarPdfRetencion(doc, require('@/assets/logo_contago_sin_fondo.png'))
            } catch (e) {
                this.$q.notify({ type: 'negative', message: 'Error al generar PDF.' })
            } finally {
                this.generandoPdf = null
            }
        },

        fmtMonto(n) {
            if (n == null) return '0.00'
            return Number(n).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        },

        mesNombre(n) { return MESES_NOMBRES[n] || n },

        fd(v) {
            if (!v) return '—'
            moment.locale('es-mx')
            const d = typeof v === 'string' ? new Date(v.replace('T', ' ').replace('Z', '')) : v
            return moment(d).format('DD/MM/YY HH:mm')
        },

        async descargarXml(doc) {
            try {
                const res = await axios.get(
                    this.ruta + 'Retenciones/GetXmlRetencion/erp_' + this.token.rfc
                    + '/' + this.token.rfc + '/' + doc.uuid,
                    { responseType: 'blob' }
                )
                const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/xml' }))
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', `${doc.uuid}.xml`)
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                window.URL.revokeObjectURL(url)
            } catch (e) {
                this.$q.notify({ type: 'negative', message: 'No se encontró el XML.' })
            }
        },
    },
}
</script>

<style scoped>

/* .dsc-panel { font-family: 'IBM Plex Sans', sans-serif; background: #f4f6fb; min-height: calc(100vh - 68px); } */

/* Filtros */
.dsc-filters { background: #fff; border-bottom: 1px solid #e2e6f0; padding: 14px 20px 12px; }
.dsc-filters__row { display: flex; flex-wrap: wrap; gap: 10px; align-items: flex-end; }
.dsc-field { display: flex; flex-direction: column; min-width: 140px; }
.dsc-field--sm { min-width: 110px; max-width: 130px; }
.dsc-field--btns { display: flex; flex-direction: row; align-items: flex-end; gap: 6px; min-width: auto; margin-top: 16px; }
.dsc-field__label { font-size: 0.68rem; font-weight: 700; color: #7b86a0; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
.dsc-input { font-size: 0.82rem; }
.dsc-btn { font-size: 0.78rem; font-weight: 600; height: 36px; padding: 0 14px; border-radius: 8px !important; }

/* Cards resumen */
.dsc-cards { display: flex; gap: 12px; padding: 14px 20px 0; flex-wrap: wrap; }
.dsc-card { background: #fff; border: 1px solid #e2e6f0; border-radius: 10px; padding: 10px 18px; min-width: 130px; }
.dsc-card--red { border-color: #fecaca; background: #fff5f5; }
.dsc-card__label { font-size: 0.65rem; font-weight: 700; color: #7b86a0; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
.dsc-card__val { font-size: 1rem; font-weight: 700; color: #0f1623; }
.dsc-card--red .dsc-card__val { color: #dc2626; }

/* Tabla */
.dsc-table-wrap { padding: 14px 20px; }
.dsc-table { border-radius: 10px; overflow: hidden; font-size: 0.8rem; }
.dsc-table__top { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 6px 4px; }
.dsc-table__title { font-size: 0.88rem; font-weight: 700; color: #0f1623; display: flex; align-items: center; }
.dsc-td { font-size: 0.75rem; padding: 5px 8px !important; }
.dsc-tr:hover { background: #f8f9ff !important; }

/* UUID */
.dsc-uuid { font-size: 0.72rem; font-weight: 700; color: #3d5afe; font-family: monospace; }
.dsc-uuid-full { font-size: 0.65rem; color: #94a3b8; }

/* Pills */
.dsc-pill { display: inline-block; border-radius: 4px; padding: 1px 8px; font-size: 0.68rem; font-weight: 700; }
.dsc-pill--blue   { background: #e8edff; color: #3d5afe; }
.dsc-pill--purple { background: #f3e8ff; color: #7c3aed; }

/* Bold/sub en celdas */
.dsc-bold { font-weight: 700; font-size: 0.75rem; color: #0f1623; }
.dsc-sub  { font-size: 0.65rem; color: #94a3b8; }

/* Montos */
.dsc-monto { font-weight: 700; font-size: 0.78rem; color: #0f1623; }
.dsc-monto--red { color: #dc2626; }

/* Periodo */
.dsc-periodo { font-size: 0.72rem; font-weight: 600; color: #0f1623; }

/* Badges ISR/IVA */
.dsc-imp-list { display: flex; flex-direction: column; gap: 2px; }
.dsc-imp { display: inline-block; border-radius: 4px; padding: 1px 6px; font-size: 0.65rem; font-weight: 700; }
.dsc-imp--isr { background: #fef3c7; color: #92400e; }
.dsc-imp--iva { background: #d1fae5; color: #065f46; }

/* Acciones */
.dsc-actions { display: flex; gap: 2px; justify-content: flex-end; }
.dsc-tip { font-size: 0.72rem; }

/* Empty */
.dsc-empty { display: flex; flex-direction: column; align-items: center; padding: 40px; gap: 8px; }
.dsc-empty__text { font-size: 0.82rem; color: #94a3b8; font-weight: 500; text-align: center; }

/* ── DIALOG DETALLE ─────────────────────────────────────────────── */
.det-card { font-family: 'IBM Plex Sans', sans-serif; background: #f4f6fb; }

.det-bar { background: #dc2626; color: #fff; min-height: 42px; }
.det-bar__title { font-weight: 700; font-size: 0.9rem; margin-left: 8px; }

.det-body { padding: 20px; }

.det-uuid { font-size: 0.72rem; font-family: monospace; color: #dc2626; font-weight: 700;
    background: #fff5f5; border: 1px solid #fecaca; border-radius: 6px;
    padding: 6px 12px; margin-bottom: 16px; word-break: break-all; }

.det-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }

.det-section { background: #fff; border: 1px solid #e2e6f0; border-radius: 10px; padding: 12px 16px; }
.det-section--full { grid-column: 1 / -1; }
.det-section__title { font-size: 0.68rem; font-weight: 700; color: #dc2626;
    text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 8px; }

.det-row { display: flex; justify-content: space-between; align-items: baseline;
    padding: 3px 0; border-bottom: 1px solid #f1f5f9; font-size: 0.75rem; }
.det-row span { color: #7b86a0; }
.det-row b { color: #0f1623; font-weight: 600; text-align: right; max-width: 60%; word-break: break-word; }

/* Totales cards */
.det-totales { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 6px; }
.det-total-card { background: #f4f6fb; border: 1px solid #e2e6f0; border-radius: 8px;
    padding: 8px 14px; min-width: 130px; }
.det-total-card--red { background: #fff5f5; border-color: #fecaca; }
.det-total-card span { display: block; font-size: 0.65rem; font-weight: 700; color: #7b86a0;
    text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 2px; }
.det-total-card b { font-size: 0.95rem; font-weight: 700; color: #0f1623; }
.det-total-card--red b { color: #dc2626; }

/* Tabla interna */
.det-table { width: 100%; border-collapse: collapse; font-size: 0.75rem; margin-top: 4px; }
.det-table th { background: #f4f6fb; font-weight: 700; color: #7b86a0; font-size: 0.68rem;
    text-transform: uppercase; letter-spacing: 0.4px; padding: 5px 10px; text-align: left; }
.det-table td { padding: 5px 10px; border-bottom: 1px solid #f1f5f9; color: #0f1623; }
.det-table tr:last-child td { border-bottom: none; }

/* Servicio detalle */
.det-servicio { margin-top: 10px; }
.det-servicio__header { font-size: 0.72rem; font-weight: 600; color: #5a6480;
    background: #f4f6fb; border-radius: 6px; padding: 5px 10px; margin-bottom: 6px; }
</style>