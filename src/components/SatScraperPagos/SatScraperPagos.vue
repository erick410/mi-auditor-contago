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
            <q-card flat bordered v-if="resultado !== null" class="full-width">
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
                        <button v-if="resultadoDataZip != ''" class="tab-btn active"
                            @click="descargarZipGuardado(resultadoDataZip._id)">Descargar Zip
                        </button>
                        <q-btn v-else :loading="loadingDescarga" unelevated rounded color="primary"
                            @click="descargarPDF()" label="Descargar Zip">
                            <template v-slot:loading><q-spinner-dots color="white" /></template>
                        </q-btn>
                        <q-btn  :loading="loading" unelevated rounded color="primary"
                            @click="consultar()" label="VOLVER A CONSULTAR AL SAT">
                            <template v-slot:loading><q-spinner-dots color="white" /></template>
                        </q-btn>
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
                                        <!-- Cada columna muestra el tipo_declaracion de ESE concepto específico -->
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

const ORDEN_MESES = {
    'Enero': 1, 'Febrero': 2, 'Marzo': 3, 'Abril': 4,
    'Mayo': 5, 'Junio': 6, 'Julio': 7, 'Agosto': 8,
    'Septiembre': 9, 'Octubre': 10, 'Noviembre': 11, 'Diciembre': 12,
};

const capMes = s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

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
            error: false,
            mesesOpciones: [
                'TODOS',
                'ENERO', 'FEBRERO', 'MARZO', 'ABRIL',
                'MAYO', 'JUNIO', 'JULIO', 'AGOSTO',
                'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE',
            ],
            anios: Array.from({ length: 6 }, (_, i) => String(anioActual - i)),
            tab: 'isr',
        };
    },

    computed: {
        token() { return this.$store.state.usuario; },
        rutaAxios() { return this.$store.state.rutaMongoStore; },

        datosOrdenados() {
            if (!this.resultado?.data) return [];
            return [...this.resultado.data].sort(
                (a, b) => (ORDEN_MESES[a.periodo] ?? 99) - (ORDEN_MESES[b.periodo] ?? 99)
            );
        },

        // Concepto ISR principal detectado del primer periodo disponible
        conceptoISRPrincipal() {
            const d = this.datosOrdenados[0];
            if (!d) return 'ISRPERSONASMORALES';
            return this.getConceptoISR(d);
        },

        // Concepto IVA principal detectado del primer periodo disponible
        conceptoIVAPrincipal() {
            const d = this.datosOrdenados[0];
            if (!d) return 'IVA.PERSONASMORALES';
            return this.getConceptoIVA(d);
        },

        // Todos los conceptos que NO son ISR principal ni IVA principal
        conceptosISR() {
            if (!this.resultado?.data) return [];
            const ISR_PRINCIPALES = new Set(['ISRPERSONASMORALES', 'ISRSIMPLIFICADODECONFIANZA.PERSONASMORALES']);
            const IVA_PRINCIPALES = new Set(['IVA.PERSONASMORALES', 'IVASIMPLIFICADODECONFIANZA']);
            const set = new Set();
            this.resultado.data.forEach(d =>
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

        // Busca un impuesto por concepto exacto; regresa {a_cargo:0,a_favor:0} si no existe
        getImpuesto(d, concepto) {
            return d.analisis.impuestos?.find(i => i.concepto === concepto) ?? { a_cargo: 0, a_favor: 0 };
        },

        // ISR principal sin importar régimen
        getImpuestoISR(d) {
            return this.getImpuesto(d, this.getConceptoISR(d));
        },

        // IVA principal sin importar régimen
        getImpuestoIVA(d) {
            return this.getImpuesto(d, this.getConceptoIVA(d));
        },

        // Tipo de declaración de un concepto específico dentro del periodo
        // (cada impuesto puede ser Normal o Complementaria de forma independiente)
        getTipoDeclaracion(d, concepto) {
            return d.analisis.impuestos?.find(i => i.concepto === concepto)?.tipo_declaracion ?? '—';
        },

        // ── Resaltado ISR ─────────────────────────────────────────────────────

        // Complementaria si el ISR principal del periodo es Complementaria
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

        esMaxCoeficiente(d) {
            const fn = x => x.analisis.determinacion_isr.coeficiente_utilidad;
            const eneFeb = ['Enero', 'Febrero'];
            const marDic = ['Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
            const idx = this._idxMax(eneFeb.includes(d.periodo) ? eneFeb : marDic, fn);
            return idx !== null && this.datosOrdenados[idx] === d;
        },

        esMaxPerdida(d) {
            const fn = x => x.analisis.determinacion_isr.perdida_ejercicios_anteriores_aplicables;
            const eneFeb = ['Enero', 'Febrero'];
            const marDic = ['Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
            const idx = this._idxMax(eneFeb.includes(d.periodo) ? eneFeb : marDic, fn);
            return idx !== null && this.datosOrdenados[idx] === d;
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

        // ── Helper periodo por nombre ─────────────────────────────────────────
        // Un solo registro por periodo en la nueva estructura
        _getPeriodo(nombreMes) {
            const nombre = capMes(nombreMes);
            return this.resultado.data.find(x => x.periodo === nombre);
        },

        // ── API ───────────────────────────────────────────────────────────────

        async getDescargaScraper() {
            this.loading = true;
            this.resultado = null;
            this.getDescargaZipScraper();
            try {
                const response = await axios.get(
                    `${this.rutaAxios}ScraperDescargasPagos/GetDescarpaScraper/${this.token.rfc}/${this.form.anio}/${this.form.meses}`
                );
                if (response.data !== '') {
                    try { this.resultado = JSON.parse(response.data.respuesta); } catch { /* sigue al scraper */ }
                }
                if (!this.resultado) await this.consultar();
            } catch (err) {
                this.error = true;
                this.resultado = err.response?.data || { message: err.message };
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
                this.resultadoDataZip = r.data;
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

        async consultar() {
            this.loading = true;
            this.resultado = null;
            this.error = false;
            try {
                const { data } = await axios.post(
                    'https://sat-api-scrapper-494247865916.us-central1.run.app/sat/consultar-datos',
                    new URLSearchParams({ rfc: this.form.rfc, anio: this.form.anio, meses: this.form.meses }),
                    { headers: { 'X-API-KEY': this.form.apiKey, 'Content-Type': 'application/x-www-form-urlencoded' } }
                );
                this.resultado = data;
                await this.saveDescargaScraper({
                    _id: '', periodo: this.form.meses, anio: this.form.anio,
                    respuesta: JSON.stringify(data, null, 2), log_id: data.log_id,
                    estatus: 'Vigente', fecha: new Date().toISOString().slice(0, 10),
                });
                this.$q.notify({ type: 'positive', message: 'Consulta exitosa', position: 'top-right' });
            } catch (err) {
                this.error = true;
                this.resultado = err.response?.data || { message: err.message };
                this.$q.notify({ type: 'negative', message: 'Error al consultar', position: 'top-right' });
            } finally {
                this.loading = false;
            }
        },

        async procesarDescargas() {
            const { data } = await axios.post(
                'https://sat-api-scrapper-494247865916.us-central1.run.app/sat/procesar-descargas',
                new URLSearchParams({ rfc: this.token.rfc, anio: this.form.anio, meses: this.form.meses }),
                { headers: { 'X-API-KEY': this.form.apiKey, 'Content-Type': 'application/x-www-form-urlencoded' } }
            );
            return data.log_id;
        },

        async esperarDescarga(logId, { intentos = 10, intervalo = 3000 } = {}) {
            for (let i = 0; i < intentos; i++) {
                try {
                    return await axios.get(
                        `https://sat-api-scrapper-494247865916.us-central1.run.app/sat/descargar/${logId}`,
                        { responseType: 'arraybuffer', transformResponse: [d => d], headers: { 'X-API-KEY': this.form.apiKey } }
                    );
                } catch (err) {
                    if ([410, 404].includes(err.response?.status)) await new Promise(r => setTimeout(r, intervalo));
                    else throw err;
                }
            }
            throw new Error('Tiempo de espera agotado. El archivo no estuvo disponible.');
        },

        async descargarPDF() {
            this.loadingDescarga = true;
            try {
                const logId = await this.procesarDescargas();
                const response = await this.esperarDescarga(logId);
                const zipBlob = new Blob([response.data], { type: 'application/zip' });
                const url = URL.createObjectURL(zipBlob);
                const a = document.createElement('a');
                a.href = url; a.download = `Declaraciones_${this.token.rfc}_${this.form.anio}.zip`;
                a.click(); URL.revokeObjectURL(url);
                await this.enviarZipBase64(response.data, logId);
                this.$q.notify({ type: 'positive', message: 'Descarga iniciada', position: 'top-right' });
            } catch (err) {
                this.$q.notify({ type: 'negative', message: err.message || 'Error al descargar', position: 'top-right' });
            } finally {
                this.loadingDescarga = false;
            }
        },

        async enviarZipBase64(arraybuffer, logId) {
            const uint8 = new Uint8Array(arraybuffer);
            let bin = ''; uint8.forEach(b => bin += String.fromCharCode(b));
            await axios.post(`${this.rutaAxios}ScraperDescargasPagos/GuardarZip`, {
                rfc: this.token.rfc, anio: this.form.anio, periodo: this.form.meses,
                log_id: logId, fecha: new Date().toISOString().slice(0, 10), archivo: btoa(bin),
            });
        },

        async descargarZipGuardado(_id) {
            const { data } = await axios.get(`${this.rutaAxios}ScraperDescargasPagos/DescargarZip/${this.token.rfc}/${_id}`);
            const bytes = Uint8Array.from(atob(data.base64), c => c.charCodeAt(0));
            const blob = new Blob([bytes], { type: 'application/zip' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `Declaraciones_${this.token.rfc}_${this.form.anio}.zip`;
            a.click(); URL.revokeObjectURL(url);
        },

        // ── GuardarValores ────────────────────────────────────────────────────

        async GuardarValores() {
            this.loadingRegistrar = true;
            await Promise.all([
                this.PostCoeficiente(),
                this.PostPerdida(),
                this.PostRegistrados(),
                this.PostIva(),
                this.PostRetencionesAsimilados(),
                this.PostRetencionesSueldos(),
                this.PostRetencionesArrendamientos(),
                this.PostRetencionesHonorarios(),
                this.PostRetencionesIVA()
            ]);
            this.loadingRegistrar = false;
            this.$q.notify({ type: 'positive', message: 'Comparativas registradas', position: 'top-right' });
        },

        _buildComparativa(tipo, fn) {
            const meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
            return {
                tipo, anio: this.form.anio,
                comparativa: meses.map(mes => {
                    const periodo = this._getPeriodo(mes);
                    return { mes, importe: periodo ? (fn(periodo) ?? 0) : 0, ivaCargo: 0, ivaFavor: 0 };
                }),
            };
        },

        async _post(obj) {
            await axios.post(`${this.rutaAxios}Comparativa/PostComparativaAsync/erp_${this.token.rfc}`, obj);
        },

        async PostCoeficiente() {
            const fn = d => d.analisis.determinacion_isr.coeficiente_utilidad;
            const eneFeb = ['Enero', 'Febrero'];
            const marDic = ['Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
            const idxEF = this._idxMax(eneFeb, fn);
            const idxMD = this._idxMax(marDic, fn);
            const coefEF = idxEF !== null ? fn(this.datosOrdenados[idxEF]) : 0;
            const coefMD = idxMD !== null ? fn(this.datosOrdenados[idxMD]) : 0;
            const ef = new Set(['ENERO', 'FEBRERO']);
            await this._post({
                tipo: 'Coeficiente', anio: this.form.anio,
                comparativa: ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE']
                    .map(mes => ({ mes, importe: ef.has(mes) ? coefEF : coefMD, ivaCargo: 0, ivaFavor: 0 })),
            });
        },

        async PostPerdida() {
            const fn = d => d.analisis.determinacion_isr.perdida_ejercicios_anteriores_aplicables;
            const eneFeb = ['Enero', 'Febrero'];
            const marDic = ['Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
            const idxEF = this._idxMax(eneFeb, fn);
            const idxMD = this._idxMax(marDic, fn);
            const pfEF = idxEF !== null ? fn(this.datosOrdenados[idxEF]) : 0;
            const pfMD = idxMD !== null ? fn(this.datosOrdenados[idxMD]) : 0;
            const ef = new Set(['ENERO', 'FEBRERO']);
            await this._post({
                tipo: 'Perdida', anio: this.form.anio,
                comparativa: ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE']
                    .map(mes => ({ mes, importe: ef.has(mes) ? pfEF : pfMD, ivaCargo: 0, ivaFavor: 0 })),
            });
        },

        async PostRegistrados() {
            await this._post(this._buildComparativa('RegistradosPPIsr', d =>
                this.getImpuestoISR(d).a_cargo
            ));
        },

        async PostIva() {
            const meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
            await this._post({
                tipo: 'IVA', anio: this.form.anio,
                comparativa: meses.map(mes => {
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
                this.getImpuesto(d, 'ISRRETENCIONESPORASIMILADOSASALARIOS')?.a_cargo ?? 0
            ));
        },

        async PostRetencionesSueldos() {
            await this._post(this._buildComparativa('Sueldos', d =>
                this.getImpuesto(d, 'ISRRETENCIONESPORSALARIOS')?.a_cargo ?? 0
            ));
        },

        async PostRetencionesArrendamientos() {
            await this._post(this._buildComparativa('Arrendamientos', d =>
                this.getImpuesto(d, 'R15ISRPORPAGOSPORCUENTADETERCEROSORETENCIONESPORARRENDAMIENTODEINMUEBLES')?.a_cargo ?? 0
            ));
        },

        async PostRetencionesHonorarios() {
            await this._post(this._buildComparativa('Honorarios', d =>
                this.getImpuesto(d, 'R14ISRRETENCIONESPORSERVICIOSPROFESIONALES')?.a_cargo ?? 0
            ));
        },

        async PostRetencionesIVA() {
            await this._post(this._buildComparativa('IVARetenido', d =>
                this.getImpuesto(d, 'IVARETENCIONES')?.a_cargo ?? 0
            ));
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