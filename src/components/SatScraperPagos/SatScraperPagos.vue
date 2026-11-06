<template>
    <q-page class="page-wrap" style="background: #f0f2f5;">
        <div class="card-main">

            <!-- Formulario -->
            <q-card flat bordered class="q-mb-md full-width">
                <q-card-section class="q-pb-none">
                    <div class="row items-center q-mb-xs">
                        <div class="sat-logo">Declaraciones</div>
                        <q-space />
                        <div class="sat-sub">Scraper Descarga Pagos</div>
                    </div>
                    <q-separator class="q-my-md" />
                </q-card-section>
                <q-card-section class="q-pt-none">
                    <div class="row q-col-gutter-md">
                        <div class="col-3">
                            <q-input v-model="form.rfc" readonly label="RFC" outlined dense class="q-mb-md"
                                @input="form.rfc = form.rfc.toUpperCase()">
                                <template v-slot:prepend><q-icon name="badge" color="red-9" /></template>
                            </q-input>
                        </div>
                        <div class="col-3">
                            <q-select v-model="form.anio" :options="anios" label="Año fiscal" outlined dense
                                class="q-mb-md">
                                <template v-slot:prepend><q-icon name="calendar_today" color="red-9" /></template>
                            </q-select>
                        </div>
                        <div class="col-3">
                            <q-select v-model="form.meses" :options="mesesOpciones" label="Mes fiscal" outlined dense
                                class="q-mb-md">
                                <template v-slot:prepend><q-icon name="calendar_today" color="red-9" /></template>
                            </q-select>
                        </div>
                        <div class="col-3">
                            <q-btn unelevated color="red-9" label="Consultar" icon="search" class="full-width" size="md"
                                :loading="loading" :disable="!form.rfc || !form.anio" @click="getDescargaScraper">
                                <template v-slot:loading><q-spinner-dots color="white" /></template>
                            </q-btn>
                        </div>
                    </div>
                </q-card-section>
            </q-card>

            <!-- Resultado -->
            <q-card flat bordered v-if="resultado !== null && resultado.data" class="full-width">
                <q-card-section>
                    <div class="card-main full-width tabs-row">
                        <button class="tab-btn" :class="{ active: tab === 'isr' }" @click="tab = 'isr'">ISR</button>
                        <button class="tab-btn" :class="{ active: tab === 'iva' }" @click="tab = 'iva'">Pagos de
                            IVA</button>
                        <button class="tab-btn" :class="{ active: tab === 'ivaRet' }" @click="tab = 'ivaRet'">IVA
                            Retenido</button>
                        <button class="tab-btn" :class="{ active: tab === 'pagosIsr' }" @click="tab = 'pagosIsr'">Pagos
                            de
                            ISR</button>
                        <button class="tab-btn" :class="{ active: tab === 'meses' }" @click="tab = 'meses'">Por
                            mes</button>
                        <q-space></q-space>
                        <q-btn :loading="loadingRegistrar" unelevated rounded color="primary" @click="GuardarValores()"
                            label="Registrar">
                            <template v-slot:loading><q-spinner-dots color="white" /></template>
                        </q-btn>
                        <q-btn v-if="resultadoDataZip && resultadoDataZip._id" :loading="loadingDescarga" unelevated
                            rounded color="primary" @click="descargarZipGuardado(resultadoDataZip._id)"
                            label="Descargar Zip">
                            <template v-slot:loading><q-spinner-dots color="white" /></template>
                        </q-btn>
                        <q-btn v-else :loading="loadingDescarga" unelevated rounded color="primary"
                            @click="descargarPDF()" label="Descargar Zip">
                            <template v-slot:loading><q-spinner-dots color="white" /></template>
                        </q-btn>
                        <q-btn :loading="loading" unelevated rounded color="primary"
                            @click="consultar()" label="VOLVER A CONSULTAR AL SAT">
                            <template v-slot:loading><q-spinner-dots color="white" /></template>
                        </q-btn>
                    </div>
                    <div v-if="resultado.cached" class="text-orange-9 text-caption q-mt-xs">
                        El SAT no respondió; se muestran los últimos datos disponibles.
                    </div>
                </q-card-section>

                <q-card-section class="q-pb-sm">

                    <!-- ── ISR ── -->
                    <div v-if="tab === 'isr'">
                        <div class="section-title">Determinación de ISR</div>
                        <div class="table-card">
                            <table>
                                <thead class="table-head">
                                    <tr>
                                        <th>Concepto</th>
                                        <th v-for="d in datosOrdenados" :key="d.periodo" style="text-align:center">
                                            {{ d.periodo }}<br>
                                            <span :style="esComplementaria(d) ? 'color:#c62828;font-weight:700' : ''">
                                                {{ getTipoDeclaracion(d, conceptoISRPrincipal) }}
                                            </span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Coeficiente de utilidad</td>
                                        <td v-for="d in datosOrdenados" :key="d.periodo" class="num"
                                            :style="esMaxCoeficiente(d) ? 'background:#fff;font-weight:700;color:#000;border:1px solid #c62828;border-radius:4px;' : ''">
                                            {{ d.analisis.determinacion_isr.coeficiente_utilidad }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Pérdidas fiscales anteriores pendientes</td>
                                        <td class="num" v-for="d in datosOrdenados" :key="d.periodo">
                                            {{
                                                fmt(d.analisis.determinacion_isr.perdidas_fiscales_ejercicios_anteriores_pendientes)
                                            }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Pérdidas fiscales anteriores aplicables</td>
                                        <td class="num" v-for="d in datosOrdenados" :key="d.periodo"
                                            :style="esMaxPerdida(d) ? 'background:#fff;font-weight:700;color:#000;border:1px solid #c62828;border-radius:4px;' : ''">
                                            {{
                                                fmt(d.analisis.determinacion_isr.perdida_ejercicios_anteriores_aplicables)
                                            }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Pagos provisionales periodos anteriores</td>
                                        <td class="num" v-for="d in datosOrdenados" :key="d.periodo">
                                            {{ fmt(d.analisis.determinacion_isr.pagos_provisionales_periodos_anteriores)
                                            }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="section-title">{{ labelConcepto(conceptoISRPrincipal) }}</div>
                        <div class="table-card">
                            <table>
                                <thead class="table-head">
                                    <tr>
                                        <th>Concepto</th>
                                        <th v-for="d in datosOrdenados" :key="d.periodo" style="text-align:center">
                                            {{ d.periodo }}<br>{{ getTipoDeclaracion(d, conceptoISRPrincipal) }}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>A cargo</td>
                                        <td class="num" v-for="d in datosOrdenados" :key="d.periodo">
                                            {{ fmt(getImpuestoISR(d).a_cargo) }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>A favor</td>
                                        <td class="num" v-for="d in datosOrdenados" :key="d.periodo">
                                            {{ fmt(getImpuestoISR(d).a_favor) }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- ── PAGOS DE IVA ── -->
                    <div v-if="tab === 'iva'">
                        <div class="section-title">{{ labelConcepto(conceptoIVAPrincipal) }}</div>
                        <div class="table-card">
                            <table>
                                <thead class="table-head">
                                    <tr>
                                        <th>Concepto</th>
                                        <th v-for="d in datosOrdenados" :key="d.periodo" style="text-align:center">
                                            {{ d.periodo }}<br>{{ getTipoDeclaracion(d, conceptoIVAPrincipal) }}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>A cargo</td>
                                        <td class="num" v-for="d in datosOrdenados" :key="d.periodo">
                                            {{ fmt(getImpuestoIVA(d).a_cargo) }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>A favor</td>
                                        <td class="num" v-for="d in datosOrdenados" :key="d.periodo">
                                            {{ fmt(getImpuestoIVA(d).a_favor) }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- ── IVA RETENIDO ── -->
                    <div v-if="tab === 'ivaRet'">
                        <div class="section-title">IVA Retenido</div>
                        <div class="table-card">
                            <table>
                                <thead class="table-head">
                                    <tr>
                                        <th>Concepto</th>
                                        <th v-for="d in datosOrdenados" :key="d.periodo" style="text-align:center">
                                            {{ d.periodo }}<br>{{ getTipoDeclaracion(d, 'IVARETENCIONES') }}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>A cargo</td>
                                        <td class="num" v-for="d in datosOrdenados" :key="d.periodo">
                                            {{ fmt(getImpuesto(d, 'IVARETENCIONES').a_cargo) }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>A favor</td>
                                        <td class="num" v-for="d in datosOrdenados" :key="d.periodo">
                                            {{ fmt(getImpuesto(d, 'IVARETENCIONES').a_favor) }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- ── PAGOS DE ISR — retenciones dinámicas ── -->
                    <div v-if="tab === 'pagosIsr'">
                        <div class="section-title">Pagos de ISR — Retenciones</div>
                        <div class="table-card" v-for="concepto in conceptosISR" :key="concepto">
                            <div class="section-title" style="padding:8px 16px 0;font-size:12px;">
                                {{ labelConcepto(concepto) }}
                            </div>
                            <table>
                                <thead class="table-head">
                                    <tr>
                                        <th>Concepto</th>
                                        <th v-for="d in datosOrdenados" :key="d.periodo" style="text-align:center">
                                            {{ d.periodo }}<br>{{ getTipoDeclaracion(d, concepto) }}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>A cargo</td>
                                        <td class="num" v-for="d in datosOrdenados" :key="d.periodo">
                                            {{ fmt(getImpuesto(d, concepto).a_cargo) }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>A favor</td>
                                        <td class="num" v-for="d in datosOrdenados" :key="d.periodo">
                                            {{ fmt(getImpuesto(d, concepto).a_favor) }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- ── POR MES ── -->
                    <div v-if="tab === 'meses'">
                        <div class="section-title">Detalle por periodo</div>
                        <div class="compare-grid">
                            <div class="period-card" v-for="d in datosOrdenados" :key="d.periodo">
                                <div class="period-card-header">
                                    <span>{{ d.periodo }}</span>
                                </div>
                                <div class="period-row"><span class="lbl">Coeficiente de utilidad</span><span
                                        class="val info">{{
                                            d.analisis.determinacion_isr.coeficiente_utilidad }}</span></div>
                                <div class="period-row"><span class="lbl">Pérdidas anteriores pend.</span><span
                                        class="val">{{
                                            fmt(d.analisis.determinacion_isr.perdidas_fiscales_ejercicios_anteriores_pendientes)
                                        }}</span></div>
                                <div class="period-row">
                                    <span class="lbl">{{ labelConcepto(conceptoISRPrincipal) }} ({{
                                        getTipoDeclaracion(d,
                                        conceptoISRPrincipal) }}) a cargo</span>
                                    <span class="val neg">{{ fmt(getImpuestoISR(d).a_cargo) }}</span>
                                </div>
                                <div class="period-row">
                                    <span class="lbl">{{ labelConcepto(conceptoISRPrincipal) }} ({{
                                        getTipoDeclaracion(d,
                                        conceptoISRPrincipal) }}) a favor</span>
                                    <span class="val pos">{{ fmt(getImpuestoISR(d).a_favor) }}</span>
                                </div>
                                <div class="period-row">
                                    <span class="lbl">{{ labelConcepto(conceptoIVAPrincipal) }} ({{
                                        getTipoDeclaracion(d,
                                        conceptoIVAPrincipal) }}) a cargo</span>
                                    <span class="val neg">{{ fmt(getImpuestoIVA(d).a_cargo) }}</span>
                                </div>
                                <div class="period-row">
                                    <span class="lbl">{{ labelConcepto(conceptoIVAPrincipal) }} ({{
                                        getTipoDeclaracion(d,
                                        conceptoIVAPrincipal) }}) a favor</span>
                                    <span class="val pos">{{ fmt(getImpuestoIVA(d).a_favor) }}</span>
                                </div>
                                <div class="period-row">
                                    <span class="lbl">IVA Ret. ({{ getTipoDeclaracion(d, 'IVARETENCIONES') }}) a
                                        cargo</span>
                                    <span class="val neg">{{ fmt(getImpuesto(d, 'IVARETENCIONES').a_cargo) }}</span>
                                </div>
                                <div v-for="concepto in conceptosISR" :key="concepto" class="period-row">
                                    <span class="lbl">{{ labelConcepto(concepto) }} ({{ getTipoDeclaracion(d, concepto)
                                        }}) a
                                        cargo</span>
                                    <span class="val neg">{{ fmt(getImpuesto(d, concepto).a_cargo) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </q-card-section>
            </q-card>
        </div>
    </q-page>
</template>

<script>
import axios from "axios";

const SCRAPER = 'https://satscraper.contago.com.mx';

const ORDEN_MESES = {
    'Enero': 1, 'Febrero': 2, 'Marzo': 3, 'Abril': 4,
    'Mayo': 5, 'Junio': 6, 'Julio': 7, 'Agosto': 8,
    'Septiembre': 9, 'Octubre': 10, 'Noviembre': 11, 'Diciembre': 12,
};

const MESES = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
const ENE_FEB = ['Enero', 'Febrero'];
const MAR_DIC = ['Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const capMes = s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ArrayBuffer → base64 sin recorrer byte por byte
const bufferToBase64 = buf => new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result.split(',')[1]);
    fr.onerror = reject;
    fr.readAsDataURL(new Blob([buf]));
});

export default {
    data() {
        const anioActual = new Date().getFullYear();
        return {
            form: {
                rfc: this.$store.state.usuario.rfc,
                anio: String(anioActual),
                meses: 'TODOS',
                apiKey: 'sk_live_Vqm3D1BiHpSA43mOn7VOVn21UaTSFKuhupp3UpbnpM4',
            },
            loading: false,
            loadingDescarga: false,
            loadingRegistrar: false,
            resultado: null,
            resultadoDataZip: null,
            jobId: null,
            error: false,
            mesesOpciones: [
                'TODOS',
                'ENERO', 'FEBRERO', 'MARZO', 'ABRIL',
                'MAYO', 'JUNIO', 'JULIO', 'AGOSTO',
                'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE',
            ],
            anios: Array.from({ length: 9 }, (_, i) => String(anioActual - i)),
            tab: 'isr',
        };
    },

    computed: {
        token() { return this.$store.state.usuario; },
        rutaAxios() { return this.$store.state.rutaMongoStore; },
        headersScraper() { return { 'X-API-KEY': this.form.apiKey }; },

        datosOrdenados() {
            if (!Array.isArray(this.resultado?.data)) return [];
            return [...this.resultado.data].sort(
                (a, b) => (ORDEN_MESES[a.periodo] ?? 99) - (ORDEN_MESES[b.periodo] ?? 99)
            );
        },

        conceptoISRPrincipal() {
            const d = this.datosOrdenados[0];
            if (!d) return 'ISRPERSONASMORALES';
            return this.getConceptoISR(d);
        },

        conceptoIVAPrincipal() {
            const d = this.datosOrdenados[0];
            if (!d) return 'IVA.PERSONASMORALES';
            return this.getConceptoIVA(d);
        },

        // Todos los conceptos que NO son ISR principal ni IVA principal
        conceptosISR() {
            const ISR_PRINCIPALES = new Set(['ISRPERSONASMORALES', 'ISRSIMPLIFICADODECONFIANZA.PERSONASMORALES']);
            const IVA_PRINCIPALES = new Set(['IVA.PERSONASMORALES', 'IVASIMPLIFICADODECONFIANZA']);
            const set = new Set();
            this.datosOrdenados.forEach(d =>
                d.analisis.impuestos
                    ?.filter(i => !ISR_PRINCIPALES.has(i.concepto) && !IVA_PRINCIPALES.has(i.concepto))
                    .forEach(i => set.add(i.concepto))
            );
            return [...set];
        },
    },

    methods: {

        // ── Detección de régimen ──────────────────────────────────────────────

        getConceptoISR(d) {
            const lista = ['ISRPERSONASMORALES', 'ISRSIMPLIFICADODECONFIANZA.PERSONASMORALES'];
            return d.analisis.impuestos?.find(i => lista.includes(i.concepto))?.concepto ?? 'ISRPERSONASMORALES';
        },

        getConceptoIVA(d) {
            const lista = ['IVA.PERSONASMORALES', 'IVASIMPLIFICADODECONFIANZA'];
            return d.analisis.impuestos?.find(i => lista.includes(i.concepto))?.concepto ?? 'IVA.PERSONASMORALES';
        },

        // ── Acceso a impuestos ────────────────────────────────────────────────

        getImpuesto(d, concepto) {
            return d.analisis.impuestos?.find(i => i.concepto === concepto) ?? { a_cargo: 0, a_favor: 0 };
        },

        getImpuestoISR(d) {
            return this.getImpuesto(d, this.getConceptoISR(d));
        },

        getImpuestoIVA(d) {
            return this.getImpuesto(d, this.getConceptoIVA(d));
        },

        getTipoDeclaracion(d, concepto) {
            return d.analisis.impuestos?.find(i => i.concepto === concepto)?.tipo_declaracion ?? '—';
        },

        // ── Resaltado ISR ─────────────────────────────────────────────────────

        esComplementaria(d) {
            return this.getTipoDeclaracion(d, this.getConceptoISR(d)) === 'Complementaria';
        },

        _idxMax(meses, fn) {
            let ganadorIdx = null, ganadorVal = -Infinity, ganadorOrden = Infinity;
            this.datosOrdenados.forEach((d, idx) => {
                if (!meses.includes(d.periodo)) return;
                const val = fn(d), ord = ORDEN_MESES[d.periodo] ?? 99;
                if (val > ganadorVal || (val === ganadorVal && ord < ganadorOrden)) {
                    ganadorVal = val; ganadorOrden = ord; ganadorIdx = idx;
                }
            });
            return ganadorIdx;
        },

        _esMax(d, fn) {
            const idx = this._idxMax(ENE_FEB.includes(d.periodo) ? ENE_FEB : MAR_DIC, fn);
            return idx !== null && this.datosOrdenados[idx] === d;
        },

        esMaxCoeficiente(d) {
            return this._esMax(d, x => x.analisis.determinacion_isr.coeficiente_utilidad);
        },

        esMaxPerdida(d) {
            return this._esMax(d, x => x.analisis.determinacion_isr.perdida_ejercicios_anteriores_aplicables);
        },

        // ── Etiquetas legibles ────────────────────────────────────────────────

        labelConcepto(concepto) {
            const map = {
                'ISRPERSONASMORALES': 'ISR Personas Morales',
                'ISRSIMPLIFICADODECONFIANZA.PERSONASMORALES': 'ISR RESICO',
                'IVA.PERSONASMORALES': 'IVA Personas Morales',
                'IVASIMPLIFICADODECONFIANZA': 'IVA RESICO',
                'IVARETENCIONES': 'IVA Retenciones',
                'ISRRETENCIONESPORSALARIOS': 'ISR Ret. Salarios',
                'ISRRETENCIONESPORASIMILADOSASALARIOS': 'ISR Ret. Asimilados',
                'R14ISRRETENCIONESPORSERVICIOSPROFESIONALES': 'R14 Servicios Prof.',
                'R15ISRPORPAGOSPORCUENTADETERCEROSORETENCIONESPORARRENDAMIENTODEINMUEBLES': 'R15 Arrendamiento / Terceros',
            };
            return map[concepto] ?? concepto;
        },

        _getPeriodo(nombreMes) {
            const nombre = capMes(nombreMes);
            return this.datosOrdenados.find(x => x.periodo === nombre);
        },

        // ── Datos guardados en Mongo ──────────────────────────────────────────

        async getDescargaScraper() {
            this.loading = true;
            this.resultado = null;
            this.resultadoDataZip = null;
            this.jobId = null;
            this.getDescargaZipScraper();
            try {
                const response = await axios.get(
                    `${this.rutaAxios}ScraperDescargasPagos/GetDescarpaScraper/${this.token.rfc}/${this.form.anio}/${this.form.meses}`
                );
                if (response.data && response.data.respuesta) {
                    try {
                        this.resultado = JSON.parse(response.data.respuesta);
                        this.jobId = response.data.log_id || this.resultado?.job_id || null;
                    } catch { /* sigue al scraper */ }
                }
                if (!this.resultado) await this.consultar();
            } catch (err) {
                this.error = true;
                this.$q.notify({ type: 'negative', message: 'Error al consultar', position: 'top-right' });
            } finally {
                this.loading = false;
            }
        },

        async getDescargaZipScraper() {
            try {
                const r = await axios.get(
                    `${this.rutaAxios}ScraperDescargasPagos/GetDescarpaZipScraper/${this.token.rfc}/${this.form.anio}/${this.form.meses}`
                );
                this.resultadoDataZip = r.data || null;
            } catch { /* silencioso */ }
        },

        async saveDescargaScraper(model) {
            try {
                await axios.post(`${this.rutaAxios}ScraperDescargasPagos/PostDescargaScraper/${this.token.rfc}`, model);
                this.$q.notify({ type: 'positive', message: 'Información guardada.', position: 'top-right' });
            } catch {
                this.$q.notify({ type: 'negative', message: 'Error al guardar la información', position: 'top-right' });
            }
        },

        // ── API scraper (consulta asíncrona por job_id) ───────────────────────

        // 1. POST /sat/consultas → { job_id, status: 'procesando' }
        async iniciarConsulta() {
            const { data } = await axios.post(
                `${SCRAPER}/sat/consultas`,
                new URLSearchParams({ rfc: this.form.rfc, anio: this.form.anio, meses: this.form.meses }),
                { headers: { ...this.headersScraper, 'Content-Type': 'application/x-www-form-urlencoded' } }
            );
            if (!data?.job_id) throw new Error('El scraper no devolvió job_id');
            return data.job_id;
        },

        // 2. GET /sat/consultas/{job_id} hasta que deje de estar 'procesando'
        async esperarResultado(jobId, { intervalo = 6000, maxIntentos = 100 } = {}) {
            for (let i = 0; i < maxIntentos; i++) {
                const { data } = await axios.get(`${SCRAPER}/sat/consultas/${jobId}`, { headers: this.headersScraper });
                if (data.status !== 'procesando') return data;
                await sleep(intervalo);
            }
            throw new Error('La consulta al SAT tardó demasiado. Intenta de nuevo.');
        },

        async consultar() {
            this.loading = true;
            this.resultado = null;
            this.error = false;
            try {
                const jobId = await this.iniciarConsulta();
                const res = await this.esperarResultado(jobId);

                if (res.status === 'error' && !res.cached) {
                    throw new Error(res.message || res.error || 'El SAT no respondió');
                }

                this.resultado = res;
                this.jobId = jobId;

                if (res.cached) {
                    // Datos de respaldo: se muestran pero no reemplazan lo vigente
                    this.$q.notify({ type: 'warning', message: 'El SAT falló; se muestran los últimos datos disponibles', position: 'top-right' });
                    return;
                }

                await this.saveDescargaScraper({
                    _id: '', periodo: this.form.meses, anio: this.form.anio,
                    respuesta: JSON.stringify(res, null, 2), log_id: jobId,
                    estatus: 'Vigente', fecha: new Date().toISOString().slice(0, 10),
                });

                // Mismo job → ZIP sin volver al SAT; se guarda en el servidor antes de que expire (7 días)
                this.descargarZip(jobId, { abrir: false }).catch(() => { /* se puede descargar después */ });

                this.$q.notify({ type: 'positive', message: 'Consulta exitosa', position: 'top-right' });
            } catch (err) {
                this.error = true;
                this.$q.notify({ type: 'negative', message: err.message || 'Error al consultar', position: 'top-right' });
            } finally {
                this.loading = false;
            }
        },

        // 3. GET /sat/consultas/{job_id}/zip → ZIP, o PDF directo si solo hay uno
        async descargarZip(jobId, { abrir = true } = {}) {
            let r;
            try {
                r = await axios.get(`${SCRAPER}/sat/consultas/${jobId}/zip`, {
                    responseType: 'arraybuffer',
                    headers: this.headersScraper,
                });
            } catch (err) {
                const msg = {
                    409: 'La consulta aún está en proceso, intenta en unos segundos',
                    404: 'No hubo declaraciones en ese periodo',
                    410: 'Los archivos expiraron; vuelve a consultar al SAT',
                }[err.response?.status];
                throw new Error(msg || err.message || 'Error al descargar');
            }

            const tipo = r.headers['content-type'] || 'application/zip';
            const ext = tipo.includes('pdf') ? 'pdf' : 'zip';

            if (abrir) this.guardarBlob(r.data, tipo, `Declaraciones_${this.token.rfc}_${this.form.anio}.${ext}`);

            await axios.post(`${this.rutaAxios}ScraperDescargasPagos/GuardarZip`, {
                rfc: this.token.rfc, anio: this.form.anio, periodo: this.form.meses,
                log_id: jobId, fecha: new Date().toISOString().slice(0, 10),
                archivo: await bufferToBase64(r.data),
            });
            await this.getDescargaZipScraper();
        },

        async descargarPDF() {
            const jobId = this.jobId || this.resultado?.job_id;
            if (!jobId) {
                this.$q.notify({ type: 'warning', message: 'Vuelve a consultar al SAT para generar los archivos', position: 'top-right' });
                return;
            }
            this.loadingDescarga = true;
            try {
                await this.descargarZip(jobId);
                this.$q.notify({ type: 'positive', message: 'Descarga iniciada', position: 'top-right' });
            } catch (err) {
                this.$q.notify({ type: 'negative', message: err.message, position: 'top-right' });
            } finally {
                this.loadingDescarga = false;
            }
        },

        async descargarZipGuardado(_id) {
            this.loadingDescarga = true;
            try {
                const { data } = await axios.get(`${this.rutaAxios}ScraperDescargasPagos/DescargarZip/${this.token.rfc}/${_id}`);
                const ext = data.ext === 'pdf' ? 'pdf' : 'zip';
                const tipo = ext === 'pdf' ? 'application/pdf' : 'application/zip';
                const bytes = Uint8Array.from(atob(data.base64), c => c.charCodeAt(0));
                this.guardarBlob(bytes, tipo, `Declaraciones_${this.token.rfc}_${this.form.anio}.${ext}`);
            } catch (err) {
                this.$q.notify({ type: 'negative', message: err.response?.data || 'Error al descargar', position: 'top-right' });
            } finally {
                this.loadingDescarga = false;
            }
        },

        guardarBlob(data, tipo, nombre) {
            const url = URL.createObjectURL(new Blob([data], { type: tipo }));
            const a = document.createElement('a');
            a.href = url; a.download = nombre;
            a.click();
            URL.revokeObjectURL(url);
        },

        // ── GuardarValores ────────────────────────────────────────────────────

        async GuardarValores() {
            this.loadingRegistrar = true;
            try {
                await Promise.all([
                    this.PostCoeficiente(),
                    this.PostPerdida(),
                    this.PostRegistrados(),
                    this.PostIva(),
                    this.PostRetencionesAsimilados(),
                    this.PostRetencionesSueldos(),
                    this.PostRetencionesArrendamientos(),
                    this.PostRetencionesHonorarios(),
                    this.PostRetencionesIVA(),
                ]);
                this.$q.notify({ type: 'positive', message: 'Comparativas registradas', position: 'top-right' });
            } catch {
                this.$q.notify({ type: 'negative', message: 'Error al registrar comparativas', position: 'top-right' });
            } finally {
                this.loadingRegistrar = false;
            }
        },

        _buildComparativa(tipo, fn) {
            return {
                tipo, anio: this.form.anio,
                comparativa: MESES.map(mes => {
                    const periodo = this._getPeriodo(mes);
                    return { mes, importe: periodo ? (fn(periodo) ?? 0) : 0, ivaCargo: 0, ivaFavor: 0 };
                }),
            };
        },

        // Coeficiente / pérdida: el máximo de Ene-Feb aplica a Ene-Feb y el de Mar-Dic a Mar-Dic
        _buildComparativaPorBloque(tipo, fn) {
            const idxEF = this._idxMax(ENE_FEB, fn);
            const idxMD = this._idxMax(MAR_DIC, fn);
            const valEF = idxEF !== null ? fn(this.datosOrdenados[idxEF]) : 0;
            const valMD = idxMD !== null ? fn(this.datosOrdenados[idxMD]) : 0;
            const ef = new Set(['ENERO', 'FEBRERO']);
            return {
                tipo, anio: this.form.anio,
                comparativa: MESES.map(mes => ({ mes, importe: ef.has(mes) ? valEF : valMD, ivaCargo: 0, ivaFavor: 0 })),
            };
        },

        async _post(obj) {
            await axios.post(`${this.rutaAxios}Comparativa/PostComparativaAsync/erp_${this.token.rfc}`, obj);
        },

        async PostCoeficiente() {
            await this._post(this._buildComparativaPorBloque('Coeficiente',
                d => d.analisis.determinacion_isr.coeficiente_utilidad));
        },

        async PostPerdida() {
            await this._post(this._buildComparativaPorBloque('Perdida',
                d => d.analisis.determinacion_isr.perdida_ejercicios_anteriores_aplicables));
        },

        async PostRegistrados() {
            await this._post(this._buildComparativa('RegistradosPPIsr', d => this.getImpuestoISR(d).a_cargo));
        },

        async PostIva() {
            await this._post({
                tipo: 'IVA', anio: this.form.anio,
                comparativa: MESES.map(mes => {
                    const p = this._getPeriodo(mes);
                    return {
                        mes,
                        importe: 0,
                        ivaCargo: p ? (this.getImpuestoIVA(p).a_cargo ?? 0) : 0,
                        ivaFavor: p ? (this.getImpuestoIVA(p).a_favor ?? 0) : 0,
                    };
                }),
            });
        },

        async PostRetencionesAsimilados() {
            await this._post(this._buildComparativa('Asimilados', d =>
                this.getImpuesto(d, 'ISRRETENCIONESPORASIMILADOSASALARIOS').a_cargo ?? 0));
        },

        async PostRetencionesSueldos() {
            await this._post(this._buildComparativa('Sueldos', d =>
                this.getImpuesto(d, 'ISRRETENCIONESPORSALARIOS').a_cargo ?? 0));
        },

        async PostRetencionesArrendamientos() {
            await this._post(this._buildComparativa('Arrendamientos', d =>
                this.getImpuesto(d, 'R15ISRPORPAGOSPORCUENTADETERCEROSORETENCIONESPORARRENDAMIENTODEINMUEBLES').a_cargo ?? 0));
        },

        async PostRetencionesHonorarios() {
            await this._post(this._buildComparativa('Honorarios', d =>
                this.getImpuesto(d, 'R14ISRRETENCIONESPORSERVICIOSPROFESIONALES').a_cargo ?? 0));
        },

        async PostRetencionesIVA() {
            await this._post(this._buildComparativa('IVARetenido', d =>
                this.getImpuesto(d, 'IVARETENCIONES').a_cargo ?? 0));
        },

        // ── Formato ───────────────────────────────────────────────────────────

        fmt(n) {
            if (!n && n !== 0) return '—';
            return '$' + Number(n).toLocaleString('es-MX');
        },

        fmtFecha(f) {
            if (!f) return '—';
            const d = new Date(f);
            return isNaN(d) ? f : d.toLocaleString('es-MX');
        },
    },
};
</script>

<style scoped>
body {
    font-family: 'Roboto', sans-serif;
    background: #f0f2f5;
}

::v-deep .page-wrap {
    min-height: 100vh;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 32px 16px;
    background: #f0f2f5;
}

::v-deep .card-main {
    width: 100%;
    max-width: 100%;
}

::v-deep .sat-logo {
    font-size: 28px;
    font-weight: 700;
    letter-spacing: 2px;
    color: #303030;
}

::v-deep .sat-sub {
    font-size: 13px;
    color: #777;
    margin-top: 2px;
}

::v-deep .tabs-row {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    flex-wrap: wrap;
}

::v-deep .tab-btn {
    padding: 8px 20px;
    border-radius: 20px;
    border: 1.5px solid #e0e0e0;
    background: white;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    color: #555;
    transition: all .15s;
}

::v-deep .tab-btn.active {
    background: #c62828;
    color: white;
    border-color: #c62828;
}

::v-deep .tab-btn:hover:not(.active) {
    border-color: #c62828;
    color: #c62828;
}

::v-deep .section-title {
    font-size: 15px;
    font-weight: 500;
    color: #9e9e9e;
    text-transform: uppercase;
    letter-spacing: .8px;
    margin: 5px 0 10px;
}

::v-deep .table-card {
    background: white;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    overflow: hidden;
    margin-bottom: 16px;
}

::v-deep .table-head {
    background: #f5f5f5;
}

::v-deep table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
}

::v-deep th {
    padding: 10px 16px;
    text-align: left;
    font-weight: 500;
    color: #616161;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: .4px;
}

::v-deep td {
    padding: 11px 16px;
    border-top: 1px solid #f0f0f0;
    color: #212121;
}

::v-deep td.num {
    text-align: right;
    font-variant-numeric: tabular-nums;
}

::v-deep .compare-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

@media(max-width: 580px) {
    ::v-deep .compare-grid {
        grid-template-columns: 1fr;
    }
}

::v-deep .period-card {
    background: white;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    overflow: hidden;
}

::v-deep .period-card-header {
    background: #c62828;
    color: white;
    padding: 10px 16px;
    font-weight: 500;
    font-size: 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

::v-deep .period-card-header .folio {
    font-size: 11px;
    opacity: .8;
}

::v-deep .period-row {
    display: flex;
    justify-content: space-between;
    padding: 9px 16px;
    border-top: 1px solid #f0f0f0;
    font-size: 13px;
}

::v-deep .period-row .lbl {
    color: #757575;
}

::v-deep .period-row .val {
    font-weight: 500;
}

::v-deep .period-row .val.pos {
    color: #2e7d32;
}

::v-deep .period-row .val.neg {
    color: #c62828;
}

::v-deep .val.info {
    color: #1565c0;
}
</style>