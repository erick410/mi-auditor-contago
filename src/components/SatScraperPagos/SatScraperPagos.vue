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
                        <!-- RFC -->
                        <div class="col-3">
                            <q-input v-model="form.rfc" readonly label="RFC" outlined dense class="q-mb-md"
                                @input="form.rfc = form.rfc.toUpperCase()">
                                <template v-slot:prepend><q-icon name="badge" color="red-9" /></template>
                            </q-input>
                        </div>
                        <!-- Año -->
                        <div class="col-3">
                            <q-select v-model="form.anio" :options="anios" label="Año fiscal" outlined dense
                                class="q-mb-md">
                                <template v-slot:prepend><q-icon name="calendar_today" color="red-9" /></template>
                            </q-select>
                        </div>

                        <!-- Meses -->
                        <div class="col-3">
                            <q-select v-model="form.meses" :options="mesesOpciones" label="Mes fiscal" outlined dense
                                class="q-mb-md">
                                <template v-slot:prepend><q-icon name="calendar_today" color="red-9" /></template>
                            </q-select>
                        </div>
                        <div class="col-3">
                            <q-btn unelevated color="red-9" label="Consultar" icon="search" class="full-width" size="md"
                                :loading="loading" :disable="!form.rfc || !form.anio" @click="getDescargaScraper">
                                <template v-slot:loading>
                                    <q-spinner-dots color="white" />
                                </template>
                            </q-btn>
                        </div>
                    </div>
                </q-card-section>
            </q-card>

            <!-- Resultado -->
            <q-card flat bordered v-if="resultado !== null" class="full-width">
                <!-- Tabs -->
                <q-card-section>
                    <div class="card-main full-width tabs-row">
                        <button class="tab-btn" :class="{ active: tab === 'ingresos' }"
                            @click="tab = 'ingresos'">Ingresos</button>
                        <button class="tab-btn" :class="{ active: tab === 'isr' }" @click="tab = 'isr'">ISR</button>
                        <button class="tab-btn" :class="{ active: tab === 'iva' }" @click="tab = 'iva'">IVA</button>
                        <button class="tab-btn" :class="{ active: tab === 'rentencionesISR' }"
                            @click="tab = 'rentencionesISR'">Retenciones ISR</button>
                        <button class="tab-btn" :class="{ active: tab === 'meses' }" @click="tab = 'meses'">Por
                            mes</button>

                        <q-space></q-space>
                        <button class="tab-btn active" @click="GuardarValores()">Registrar

                        </button>
                        <button v-if="resultadoDataZip != ''" class="tab-btn active"
                            @click="descargarZipGuardado(resultadoDataZip._id)">Descargar Zip

                        </button>

                        <button v-else class="tab-btn active" @click="descargarPDF()">Descargar Zip

                        </button>

                        <!-- <q-btn v-else :loading="loadingDescarga" unelevated rounded color="primary"
                            icon="mdi-file-document" @click="descargarPDF()" label="Descargar Zip">
                            <template v-slot:loading>
                                <q-spinner-dots color="white" />
                            </template>
                        </q-btn> -->

                    </div>
                </q-card-section>
                <q-card-section class="q-pb-sm">
                    <!-- INGRESOS -->
                    <div v-if="tab === 'ingresos'">
                        <div class="section-title">Ingresos por periodo</div>
                        <div class="table-card">
                            <table>
                                <thead class="table-head">
                                    <tr>
                                        <th>Concepto</th>
                                        <th v-for="d in resultado.data" :key="d.folio" style="text-align:center">
                                            {{ d.periodo }} <br>
                                            {{ d.analisis.encabezado.tipo_declaracion }}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Ingresos nominales facturados</td>
                                        <td class="num" v-for="d in resultado.data" :key="d.folio"
                                            style="text-align:right">{{
                                                fmt(d.analisis.ingresos.ingresos_nominales_facturados) }}</td>
                                    </tr>
                                    <tr>
                                        <td>Ingresos nominales</td>
                                        <td class="num" v-for="d in resultado.data" :key="d.folio">{{
                                            fmt(d.analisis.ingresos.ingresos_nominales) }}</td>
                                    </tr>
                                    <tr>
                                        <td>Ingresos periodos anteriores</td>
                                        <td class="num" v-for="d in resultado.data" :key="d.folio">{{
                                            fmt(d.analisis.ingresos.ingresos_nominales_periodos_anteriores) }}</td>
                                    </tr>
                                    <tr style="background:#e8f5e9">
                                        <td><b>Total ingresos nominales periodo</b></td>
                                        <td class="num" v-for="d in resultado.data" :key="d.folio"
                                            style="color:#2e7d32;font-weight:500">{{
                                                fmt(d.analisis.ingresos.total_ingresos_nominales_periodo) }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- ISR -->
                    <div v-if="tab === 'isr'">
                        <div class="section-title">Determinación de ISR</div>
                        <div class="table-card">
                            <table>
                                <thead class="table-head">
                                    <tr>
                                        <th>Concepto</th>
                                        <th v-for="d in datosDepurados" :key="d.folio" style="text-align:center">
                                            {{ d.periodo }}<br>
                                            <span :style="esComplementaria(d) ? 'color:#c62828;font-weight:700' : ''">
                                                {{ d.analisis.encabezado.tipo_declaracion }}
                                            </span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- Coeficiente con resaltado del máximo por grupo -->
                                    <tr>
                                        <td>Coeficiente de utilidad</td>
                                        <td v-for="d in datosDepurados" :key="d.folio" class="num"
                                            :style="esMaxCoeficiente(d) ? 'background:#fff; font-weight:700; color:#000; border: 1px solid #c62828; border-radius:4px;' : ''">
                                            {{ d.analisis.determinacion_isr.coeficiente_utilidad }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Utilidad fiscal pago provisional</td>
                                        <td class="num" v-for="d in datosDepurados" :key="d.folio">
                                            {{ fmt(d.analisis.determinacion_isr.utilidad_fiscal_pago_provisional) }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Pérdidas fiscales anteriores</td>
                                        <td class="num" v-for="d in datosDepurados" :key="d.folio"
                                            :style="esMaxPerdida(d) ? 'background:#fff; font-weight:700; color:#000; border: 1px solid #c62828; border-radius:4px;' : ''">
                                            {{
                                                fmt(d.analisis.determinacion_isr.perdidas_fiscales_ejercicios_anteriores_aplicables)
                                            }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Base gravable</td>
                                        <td class="num" v-for="d in datosDepurados" :key="d.folio">
                                            {{ fmt(d.analisis.determinacion_isr.base_gravable_pago_provisional) }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Impuesto causado</td>
                                        <td class="num" v-for="d in datosDepurados" :key="d.folio">
                                            {{ fmt(d.analisis.determinacion_isr.impuesto_causado) }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Impuesto del periodo</td>
                                        <td class="num" v-for="d in datosDepurados" :key="d.folio">
                                            {{ fmt(d.analisis.determinacion_isr.impuesto_periodo) }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Pagos provisionales anteriores</td>
                                        <td class="num" v-for="d in datosDepurados" :key="d.folio">
                                            {{ fmt(d.analisis.determinacion_isr.pagos_provisionales_periodos_anteriores)
                                            }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="section-title">ISR Personas morales</div>
                        <div class="table-card">
                            <table>
                                <thead class="table-head">
                                    <tr>
                                        <th>Concepto</th>
                                        <th v-for="d in resultado.data" :key="d.folio" style="text-align:center">{{
                                            d.periodo }}<br>
                                            {{ d.analisis.encabezado.tipo_declaracion }}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>A cargo</td>
                                        <td class="num" v-for="d in resultado.data" :key="d.folio">{{
                                            fmt(d.analisis.isr_personas_morales.a_cargo) }}</td>
                                    </tr>
                                    <tr>
                                        <td>A favor</td>
                                        <td class="num" v-for="d in resultado.data" :key="d.folio">{{
                                            fmt(d.analisis.isr_personas_morales.a_favor) }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- RETENCIONES ISR -->
                    <div v-if="tab === 'rentencionesISR'">
                        <div class="section-title">Retenciones asimilados a salarios</div>
                        <div class="table-card">
                            <table>
                                <thead class="table-head">
                                    <tr>
                                        <th>Concepto</th>
                                        <th v-for="d in resultado.data" :key="d.folio" style="text-align:center">{{
                                            d.periodo }}<br>
                                            {{ d.analisis.encabezado.tipo_declaracion }}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>A cargo</td>
                                        <td class="num" v-for="d in resultado.data" :key="d.folio">{{
                                            fmt(d.analisis.isr_retenciones_asimilados_salarios.a_cargo) }}</td>
                                    </tr>
                                    <tr>
                                        <td>A favor</td>
                                        <td class="num" v-for="d in resultado.data" :key="d.folio">{{
                                            fmt(d.analisis.isr_retenciones_asimilados_salarios.a_favor) }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>


                    <!-- IVA -->
                    <div v-if="tab === 'iva'">
                        <div class="section-title">IVA personas morales</div>
                        <div class="table-card">
                            <table>
                                <thead class="table-head">
                                    <tr>
                                        <th>Concepto</th>
                                        <th v-for="d in resultado.data" :key="d.folio" style="text-align:center">{{
                                            d.periodo }}<br>
                                            {{ d.analisis.encabezado.tipo_declaracion }}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>IVA a cargo total</td>
                                        <td class="num" v-for="d in resultado.data" :key="d.folio">{{
                                            fmt(d.analisis.iva_personas_morales.iva_a_cargo_total) }}</td>
                                    </tr>
                                    <tr>
                                        <td>IVA acreditable total</td>
                                        <td class="num" v-for="d in resultado.data" :key="d.folio">{{
                                            fmt(d.analisis.iva_personas_morales.iva_acreditable_total) }}</td>
                                    </tr>
                                    <tr>
                                        <td>A cargo neto</td>
                                        <td class="num" v-for="d in resultado.data" :key="d.folio">{{
                                            fmt(d.analisis.iva_personas_morales.a_cargo) }}</td>
                                    </tr>
                                    <tr>
                                        <td>A favor</td>
                                        <td class="num" v-for="d in resultado.data" :key="d.folio">{{
                                            fmt(d.analisis.iva_personas_morales.a_favor) }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- POR MES -->
                    <div v-if="tab === 'meses'">
                        <div class="section-title">Detalle por periodo</div>
                        <div class="compare-grid">
                            <div class="period-card" v-for="d in resultado.data" :key="d.folio">
                                <div class="period-card-header">
                                    <span>{{ d.periodo }}</span>
                                    <span class="folio">Folio: {{ d.folio }}</span>
                                </div>
                                <div class="period-row"><span class="lbl">Tipo de declaración</span><span class="val">{{
                                    fmtFecha(d.analisis.encabezado.tipo_declaracion) }}</span></div>
                                <div class="period-row"><span class="lbl">Presentación</span><span class="val">{{
                                    fmtFecha(d.analisis.encabezado.fecha_presentacion) }}</span></div>
                                <div class="period-row"><span class="lbl">Ingresos facturados</span><span
                                        class="val info">{{
                                            fmt(d.analisis.ingresos.ingresos_nominales_facturados) }}</span></div>
                                <div class="period-row"><span class="lbl">Total ingresos acum.</span><span
                                        class="val">{{
                                            fmt(d.analisis.ingresos.total_ingresos_nominales_periodo) }}</span></div>
                                <div class="period-row"><span class="lbl">Utilidad fiscal</span><span class="val">{{
                                    fmt(d.analisis.determinacion_isr.utilidad_fiscal_pago_provisional) }}</span>
                                </div>
                                <div class="period-row"><span class="lbl">ISR causado</span><span class="val neg">{{
                                    fmt(d.analisis.determinacion_isr.impuesto_causado) }}</span></div>
                                <div class="period-row"><span class="lbl">ISR a cargo</span><span class="val neg">{{
                                    fmt(d.analisis.isr_personas_morales.a_cargo) }}</span></div>
                                <div class="period-row"><span class="lbl">IVA a cargo total</span><span
                                        class="val neg">{{
                                            fmt(d.analisis.iva_personas_morales.iva_a_cargo_total) }}</span></div>
                                <div class="period-row"><span class="lbl">IVA acreditable</span><span class="val pos">{{
                                    fmt(d.analisis.iva_personas_morales.iva_acreditable_total) }}</span></div>
                                <div class="period-row"><span class="lbl">IVA a favor</span><span class="val pos">{{
                                    fmt(d.analisis.iva_personas_morales.a_favor) }}</span></div>
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
import moment from 'moment'
import fs from "fs";
export default {

    components: {
    },
    data() {
        const anioActual = new Date().getFullYear();
        return {
            form: {
                rfc: this.$store.state.usuario.rfc,
                anio: String(anioActual),
                meses: 'TODOS',
                apiKey: 'sk_live_Vqm3D1BiHpSA43mOn7VOVn21UaTSFKuhupp3UpbnpM4',
            },
            showKey: false,
            loading: false,
            loadingDescarga: false,
            resultado: null,
            resultadoDataZip: null,
            error: false,
            mesesOpciones: ['TODOS',
                'ENERO', 'FEBRERO',
                'MARZO', 'ABRIL',
                'MAYO', 'JUNIO',
                'JULIO', 'AGOSTO',
                'SEPTIEMBRE', 'OCTUBRE',
                'NOVIEMBRE', 'DICIEMBRE',
            ],
            anios: Array.from({ length: 6 }, (_, i) => String(anioActual - i)),
            tab: 'ingresos',
            clase: '',
        };
    },
    computed: {
        token() {
            return this.$store.state.usuario;
        },
        rutaAxios() {
            return this.$store.state.rutaMongoStore
        },
        resultadoFormateado() {
            return JSON.stringify(this.resultado, null, 2);
        },
        logId() {
            return this.resultado?.log_id || null;
        },
        mesesParam() {
            if (this.mesesSeleccionados.includes('TODOS')) return 'TODOS';
            return this.mesesSeleccionados.join(',');
        },
        datosDepurados() {
            if (!this.resultado?.data) return [];
            return this.resultado.data;
        },

        folioGanadorEneFeb() {
            const meses = ['ENERO', 'FEBRERO'];
            const orden = { 'ENERO': 1, 'FEBRERO': 2 };
            const candidatos = this.datosDepurados
                .filter(d => meses.includes(d.periodo))
                .sort((a, b) => {
                    const coefA = a.analisis.determinacion_isr.coeficiente_utilidad;
                    const coefB = b.analisis.determinacion_isr.coeficiente_utilidad;
                    if (coefB !== coefA) return coefB - coefA;
                    return orden[a.periodo] - orden[b.periodo];
                });
            return candidatos[0]?.folio ?? null;
        },

        folioGanadorMarDic() {
            const meses = ['MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
            const orden = { 'MARZO': 3, 'ABRIL': 4, 'MAYO': 5, 'JUNIO': 6, 'JULIO': 7, 'AGOSTO': 8, 'SEPTIEMBRE': 9, 'OCTUBRE': 10, 'NOVIEMBRE': 11, 'DICIEMBRE': 12 };
            const candidatos = this.datosDepurados
                .filter(d => meses.includes(d.periodo))
                .sort((a, b) => {
                    const coefA = a.analisis.determinacion_isr.coeficiente_utilidad;
                    const coefB = b.analisis.determinacion_isr.coeficiente_utilidad;
                    if (coefB !== coefA) return coefB - coefA;
                    return orden[a.periodo] - orden[b.periodo];
                });
            return candidatos[0]?.folio ?? null;
        },

        folioGanadorEneFebPF() {
            const meses = ['ENERO', 'FEBRERO'];
            const orden = { 'ENERO': 1, 'FEBRERO': 2 };
            const candidatos = this.datosDepurados
                .filter(d => meses.includes(d.periodo))
                .sort((a, b) => {
                    const coefA = a.analisis.determinacion_isr.perdidas_fiscales_ejercicios_anteriores_aplicables;
                    const coefB = b.analisis.determinacion_isr.perdidas_fiscales_ejercicios_anteriores_aplicables;
                    if (coefB !== coefA) return coefB - coefA;
                    return orden[a.periodo] - orden[b.periodo];
                });
            return candidatos[0]?.folio ?? null;
        },

        folioGanadorMarDicPF() {
            const meses = ['MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
            const orden = { 'MARZO': 3, 'ABRIL': 4, 'MAYO': 5, 'JUNIO': 6, 'JULIO': 7, 'AGOSTO': 8, 'SEPTIEMBRE': 9, 'OCTUBRE': 10, 'NOVIEMBRE': 11, 'DICIEMBRE': 12 };
            const candidatos = this.datosDepurados
                .filter(d => meses.includes(d.periodo))
                .sort((a, b) => {
                    const coefA = a.analisis.determinacion_isr.perdidas_fiscales_ejercicios_anteriores_aplicables;
                    const coefB = b.analisis.determinacion_isr.perdidas_fiscales_ejercicios_anteriores_aplicables;
                    if (coefB !== coefA) return coefB - coefA;
                    return orden[a.periodo] - orden[b.periodo];
                });
            return candidatos[0]?.folio ?? null;
        },
    },
    methods: {

        async getDescargaScraper() {
            console.log(this.form.meses)
            this.loading = true;
            this.resultado = null;

            this.getDescargaZipScraper();
            try {
                const response = await axios.get(this.rutaAxios + 'ScraperDescargasPagos/GetDescarpaScraper/' + this.token.rfc + '/' + this.form.anio + '/' + this.form.meses)
                console.log('Respuesta backend:', response)
                if (response.data != '') {
                    try {
                        this.resultado = JSON.parse(response.data.respuesta);
                        console.log(this.resultado)
                        this.loading = false;

                    } catch {
                        console.log('No se encontro la informacion en la BD')
                    }
                } else {
                    console.log('Vamos a Scrapear')
                    await this.consultar();
                }
            } catch (err) {
                this.error = true;
                this.resultado = err.response?.data || { message: err.message };
                this.$q.notify({ type: 'negative', message: 'Error al consultar', position: 'top-right' });
            }
        },

        async getDescargaZipScraper() {
            try {
                const response = await axios.get(this.rutaAxios + 'ScraperDescargasPagos/GetDescarpaZipScraper/' + this.token.rfc + '/' + this.form.anio + '/' + this.form.meses)
                console.log('Respuesta get zip backend:', response)
                this.resultadoDataZip = response.data
            } catch (err) {
            }
        },

        async saveDescargaScraper(model) {

            console.log(model)
            try {
                const response = await axios.post(this.rutaAxios + 'ScraperDescargasPagos/PostDescargaScraper/' + this.token.rfc, model)
                console.log('Respuesta backend:', response.data)
                this.$q.notify({ type: 'positive', message: 'Información guardada.', position: 'top-right' });

            } catch (error) {
                console.error('Error al guardar:', error)
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
                    new URLSearchParams({
                        rfc: this.form.rfc,
                        anio: this.form.anio,
                        meses: this.form.meses,
                    }),
                    {
                        headers: {
                            'X-API-KEY': this.form.apiKey,
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                    }
                );
                this.resultado = data;
                console.log(data)
                let objeto = {
                    _id: '',
                    periodo: this.form.meses,
                    anio: this.form.anio,
                    respuesta: JSON.stringify(data, null, 2),
                    log_id: data.log_id,
                    estatus: 'Vigente',
                    fecha: new Date().toISOString().slice(0, 10)
                }
                await this.saveDescargaScraper(objeto);
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
            let rfc = this.token.rfc
            let anio = this.form.anio
            let meses = this.form.meses
            try {
                const { data } = await axios.post(
                    `https://sat-api-scrapper-494247865916.us-central1.run.app/sat/procesar-descargas`,
                    new URLSearchParams({ rfc, anio, meses }),
                    {
                        headers: {
                            "X-API-KEY": this.form.apiKey,
                            "Content-Type": "application/x-www-form-urlencoded",
                        },
                    }
                );
                console.log(data)
                const logId = data.log_id;
                return logId;

            } catch (err) {
                if (err.response) {
                    console.error("Error del servidor:", err.response.status, err.response.data);
                } else {
                    console.error("Error de red:", err.message);
                }
                throw err;
            }
        },

        async esperarDescarga(logId, apiKey, { intentos = 10, intervalo = 3000 } = {}) {
            for (let i = 0; i < intentos; i++) {
                try {
                    const response = await axios.get(
                        `https://sat-api-scrapper-494247865916.us-central1.run.app/sat/descargar/${logId}`,
                        {
                            responseType: "arraybuffer",
                            transformResponse: [data => data],
                            headers: { "X-API-KEY": apiKey },
                        }
                    );
                    return response;
                } catch (err) {
                    const status = err.response?.status;

                    if (status === 410 || status === 404) {
                        console.log(`Intento ${i + 1}/${intentos} - archivo no listo, esperando...`);
                        await new Promise(r => setTimeout(r, intervalo));
                    } else {
                        throw err;
                    }
                }
            }
            throw new Error("Tiempo de espera agotado. El archivo no estuvo disponible.");
        },

        async descargarPDF() {
            this.loadingDescarga = true;
            try {
                const logId = await this.procesarDescargas();
                console.log("Procesando ZIP, log_id:", logId);

                const response = await this.esperarDescarga(logId, this.form.apiKey, {
                    intentos: 10,
                    intervalo: 3000,
                });

                const blob = response.data;

                console.log('zip', response)
                const zipBlob = new Blob([response.data], { type: "application/zip" });

                const url = URL.createObjectURL(zipBlob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `Declaraciones_${this.token.rfc}_${this.form.anio}.zip`;
                a.click();
                URL.revokeObjectURL(url);

                await this.enviarZipBase64(blob, logId, a.download);

                this.$q.notify({ type: 'positive', message: 'Descarga iniciada', position: 'top-right' });

            } catch (err) {
                console.error("Error:", err.message);
                this.$q.notify({ type: 'negative', message: err.message || 'Error al descargar', position: 'top-right' });
            } finally {
                this.loadingDescarga = false;
            }
        },


        async enviarZipBase64(arraybuffer, logId, fileName) {
            const uint8 = new Uint8Array(arraybuffer);
            let binary = "";
            uint8.forEach(b => binary += String.fromCharCode(b));
            const base64 = btoa(binary);

            console.log("Base64 length:", base64.length);

            const response = await axios.post(this.rutaAxios + "ScraperDescargasPagos/GuardarZip", {
                rfc: this.token.rfc,
                anio: this.form.anio,
                periodo: this.form.meses,
                log_id: logId,
                fecha: new Date().toISOString().slice(0, 10),
                archivo: base64,
            });

            console.log("Respuesta backend:", response.data);
        },

        async descargarZipGuardado(_id) {
            const { data } = await axios.get(
                this.rutaAxios + `ScraperDescargasPagos/DescargarZip/${this.token.rfc}/${_id}`
            );

            const bytes = Uint8Array.from(atob(data.base64), c => c.charCodeAt(0));
            const blob = new Blob([bytes], { type: "application/zip" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Declaraciones_${this.token.rfc}_${this.form.anio}.zip`;
            a.click();
            URL.revokeObjectURL(url);
        },

        fmt(n) {
            if (!n && n !== 0) return '—';
            return '$' + Number(n).toLocaleString('es-MX');
        },

        fmtFecha(f) {
            if (!f) return '—';
            const match = f.match(/^(\d{2})\/(\d{2})\/(\d{4})(\d{2}:\d{2})$/);
            if (match) return `${match[1]}/${match[2]}/${match[3]} ${match[4]}`;
            return f;
        },

        esMaxCoeficiente(d) {
            const eneFeb = ['ENERO', 'FEBRERO'];
            if (eneFeb.includes(d.periodo)) {
                return d.folio === this.folioGanadorEneFeb;
            } else {
                return d.folio === this.folioGanadorMarDic;
            }
        },

        esMaxPerdida(d) {
            const eneFeb = ['ENERO', 'FEBRERO'];
            if (eneFeb.includes(d.periodo)) {
                return d.folio === this.folioGanadorEneFebPF;
            } else {
                return d.folio === this.folioGanadorMarDicPF;
            }
        },

        // Retorna true si la declaración es complementaria
        esComplementaria(d) {
            return d.analisis.encabezado.tipo_declaracion === 'Complementaria';
        },

        folioGanadorEneFebFunction() {
            const meses = ['ENERO', 'FEBRERO'];
            const orden = { 'ENERO': 1, 'FEBRERO': 2 };
            const candidatos = this.datosDepurados
                .filter(d => meses.includes(d.periodo))
                .sort((a, b) => {
                    const coefA = a.analisis.determinacion_isr.coeficiente_utilidad;
                    const coefB = b.analisis.determinacion_isr.coeficiente_utilidad;
                    if (coefB !== coefA) return coefB - coefA;
                    return orden[a.periodo] - orden[b.periodo];
                });
            return candidatos[0]?.folio ?? null;
        },

        folioGanadorMarDicFunction() {
            const meses = ['MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
            const orden = { 'MARZO': 3, 'ABRIL': 4, 'MAYO': 5, 'JUNIO': 6, 'JULIO': 7, 'AGOSTO': 8, 'SEPTIEMBRE': 9, 'OCTUBRE': 10, 'NOVIEMBRE': 11, 'DICIEMBRE': 12 };
            const candidatos = this.datosDepurados
                .filter(d => meses.includes(d.periodo))
                .sort((a, b) => {
                    const coefA = a.analisis.determinacion_isr.coeficiente_utilidad;
                    const coefB = b.analisis.determinacion_isr.coeficiente_utilidad;
                    if (coefB !== coefA) return coefB - coefA;
                    return orden[a.periodo] - orden[b.periodo];
                });
            return candidatos[0]?.folio ?? null;
        },

        folioGanadorEneFebPFFunction() {
            const meses = ['ENERO', 'FEBRERO'];
            const orden = { 'ENERO': 1, 'FEBRERO': 2 };
            const candidatos = this.datosDepurados
                .filter(d => meses.includes(d.periodo))
                .sort((a, b) => {
                    const coefA = a.analisis.determinacion_isr.perdidas_fiscales_ejercicios_anteriores_aplicables;
                    const coefB = b.analisis.determinacion_isr.perdidas_fiscales_ejercicios_anteriores_aplicables;
                    if (coefB !== coefA) return coefB - coefA;
                    return orden[a.periodo] - orden[b.periodo];
                });
            return candidatos[0]?.folio ?? null;
        },

        folioGanadorMarDicPFFunction() {
            const meses = ['MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
            const orden = { 'MARZO': 3, 'ABRIL': 4, 'MAYO': 5, 'JUNIO': 6, 'JULIO': 7, 'AGOSTO': 8, 'SEPTIEMBRE': 9, 'OCTUBRE': 10, 'NOVIEMBRE': 11, 'DICIEMBRE': 12 };
            const candidatos = this.datosDepurados
                .filter(d => meses.includes(d.periodo))
                .sort((a, b) => {
                    const coefA = a.analisis.determinacion_isr.perdidas_fiscales_ejercicios_anteriores_aplicables;
                    const coefB = b.analisis.determinacion_isr.perdidas_fiscales_ejercicios_anteriores_aplicables;
                    if (coefB !== coefA) return coefB - coefA;
                    return orden[a.periodo] - orden[b.periodo];
                });
            return candidatos[0]?.folio ?? null;
        },

        async GuardarValores() {

            await this.PostCoeficiente();
            await this.PostPerdida();
            await this.PostRegistrados();
            await this.PostRetenciones();

            this.$q.notify({ type: 'positive', message: 'Comparativas registradas', position: 'top-right' });

        },

        async PostCoeficiente() {

            let folioEneroFebrero = this.folioGanadorEneFebFunction()
            let folioMarzoDiciembre = this.folioGanadorMarDicFunction()

            let coeEneroFebrero = this.resultado.data.filter(x => x.folio == folioEneroFebrero)
            let coeMarzoDiciembre = this.resultado.data.filter(x => x.folio == folioMarzoDiciembre)

            let valor1 = coeEneroFebrero[0].analisis.determinacion_isr.coeficiente_utilidad
            let valor2 = coeMarzoDiciembre[0].analisis.determinacion_isr.coeficiente_utilidad

            try {
                let ObjData = {
                    tipo: 'Coeficiente',
                    anio: this.form.anio,
                    comparativa: [
                        { mes: 'ENERO', importe: valor1, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'FEBRERO', importe: valor1, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'MARZO', importe: valor2, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'ABRIL', importe: valor2, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'MAYO', importe: valor2, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'JUNIO', importe: valor2, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'JULIO', importe: valor2, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'AGOSTO', importe: valor2, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'SEPTIEMBRE', importe: valor2, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'OCTUBRE', importe: valor2, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'NOVIEMBRE', importe: valor2, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'DICIEMBRE', importe: valor2, ivaCargo: 0, ivaFavor: 0 },
                    ]
                };
                console.log(ObjData)
                await axios.post(this.rutaAxios + 'Comparativa/PostComparativaAsync/erp_' + this.token.rfc, ObjData);

            } catch (error) {
                console.log(error)
            }
        },

        async PostPerdida() {
            let folioEneroFebrero = this.folioGanadorEneFebPFFunction()
            let folioMarzoDiciembre = this.folioGanadorMarDicPFFunction()

            let coeEneroFebrero = this.resultado.data.filter(x => x.folio == folioEneroFebrero)
            let coeMarzoDiciembre = this.resultado.data.filter(x => x.folio == folioMarzoDiciembre)

            let valor1 = coeEneroFebrero[0].analisis.determinacion_isr.perdidas_fiscales_ejercicios_anteriores_aplicables
            let valor2 = coeMarzoDiciembre[0].analisis.determinacion_isr.perdidas_fiscales_ejercicios_anteriores_aplicables

            try {
                let ObjData = {
                    tipo: 'Perdida',
                    anio: this.form.anio,
                    comparativa: [
                        { mes: 'ENERO', importe: valor1, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'FEBRERO', importe: valor1, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'MARZO', importe: valor2, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'ABRIL', importe: valor2, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'MAYO', importe: valor2, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'JUNIO', importe: valor2, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'JULIO', importe: valor2, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'AGOSTO', importe: valor2, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'SEPTIEMBRE', importe: valor2, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'OCTUBRE', importe: valor2, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'NOVIEMBRE', importe: valor2, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'DICIEMBRE', importe: valor2, ivaCargo: 0, ivaFavor: 0 },
                    ]
                };
                console.log(ObjData)
                await axios.post(this.rutaAxios + 'Comparativa/PostComparativaAsync/erp_' + this.token.rfc, ObjData);
            } catch (error) {
                console.log(error)
            }
        },

        async PostRegistrados() {
            let enero = this.resultado.data.find(x =>
                x.periodo == 'ENERO' && x.analisis.encabezado.tipo_declaracion == 'Complementaria'
            ) || this.resultado.data.find(x =>
                x.periodo == 'ENERO' && x.analisis.encabezado.tipo_declaracion == 'Normal'
            );
            let febrero = this.resultado.data.find(x =>
                x.periodo == 'FEBRERO' && x.analisis.encabezado.tipo_declaracion == 'Complementaria'
            ) || this.resultado.data.find(x =>
                x.periodo == 'FEBRERO' && x.analisis.encabezado.tipo_declaracion == 'Normal'
            );
            let marzo = this.resultado.data.find(x =>
                x.periodo == 'MARZO' && x.analisis.encabezado.tipo_declaracion == 'Complementaria'
            ) || this.resultado.data.find(x =>
                x.periodo == 'MARZO' && x.analisis.encabezado.tipo_declaracion == 'Normal'
            );
            let abril = this.resultado.data.find(x =>
                x.periodo == 'ABRIL' && x.analisis.encabezado.tipo_declaracion == 'Complementaria'
            ) || this.resultado.data.find(x =>
                x.periodo == 'ABRIL' && x.analisis.encabezado.tipo_declaracion == 'Normal'
            );
            let mayo = this.resultado.data.find(x =>
                x.periodo == 'MAYO' && x.analisis.encabezado.tipo_declaracion == 'Complementaria'
            ) || this.resultado.data.find(x =>
                x.periodo == 'MAYO' && x.analisis.encabezado.tipo_declaracion == 'Normal'
            );
            let junio = this.resultado.data.find(x =>
                x.periodo == 'JUNIO' && x.analisis.encabezado.tipo_declaracion == 'Complementaria'
            ) || this.resultado.data.find(x =>
                x.periodo == 'JUNIO' && x.analisis.encabezado.tipo_declaracion == 'Normal'
            );
            let julio = this.resultado.data.find(x =>
                x.periodo == 'JULIO' && x.analisis.encabezado.tipo_declaracion == 'Complementaria'
            ) || this.resultado.data.find(x =>
                x.periodo == 'JULIO' && x.analisis.encabezado.tipo_declaracion == 'Normal'
            );
            let agosto = this.resultado.data.find(x =>
                x.periodo == 'AGOSTO' && x.analisis.encabezado.tipo_declaracion == 'Complementaria'
            ) || this.resultado.data.find(x =>
                x.periodo == 'AGOSTO' && x.analisis.encabezado.tipo_declaracion == 'Normal'
            );
            let septiembre = this.resultado.data.find(x =>
                x.periodo == 'SEPTIEMBRE' && x.analisis.encabezado.tipo_declaracion == 'Complementaria'
            ) || this.resultado.data.find(x =>
                x.periodo == 'SEPTIEMBRE' && x.analisis.encabezado.tipo_declaracion == 'Normal'
            );
            let octubre = this.resultado.data.find(x =>
                x.periodo == 'OCTUBRE' && x.analisis.encabezado.tipo_declaracion == 'Complementaria'
            ) || this.resultado.data.find(x =>
                x.periodo == 'OCTUBRE' && x.analisis.encabezado.tipo_declaracion == 'Normal'
            );
            let noviembre = this.resultado.data.find(x =>
                x.periodo == 'NOVIEMBRE' && x.analisis.encabezado.tipo_declaracion == 'Complementaria'
            ) || this.resultado.data.find(x =>
                x.periodo == 'NOVIEMBRE' && x.analisis.encabezado.tipo_declaracion == 'Normal'
            );
            let diciembre = this.resultado.data.find(x =>
                x.periodo == 'DICIEMBRE' && x.analisis.encabezado.tipo_declaracion == 'Complementaria'
            ) || this.resultado.data.find(x =>
                x.periodo == 'DICIEMBRE' && x.analisis.encabezado.tipo_declaracion == 'Normal'
            );

            console.log(enero)
            try {
                let ObjData = {
                    tipo: 'RegistradosPPIsr',
                    anio: this.form.anio,
                    comparativa: [
                        { mes: 'ENERO', importe: enero.analisis.isr_personas_morales.a_cargo, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'FEBRERO', importe: febrero.analisis.isr_personas_morales.a_cargo, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'MARZO', importe: marzo.analisis.isr_personas_morales.a_cargo, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'ABRIL', importe: abril.analisis.isr_personas_morales.a_cargo, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'MAYO', importe: mayo.analisis.isr_personas_morales.a_cargo, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'JUNIO', importe: junio.analisis.isr_personas_morales.a_cargo, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'JULIO', importe: julio.analisis.isr_personas_morales.a_cargo, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'AGOSTO', importe: agosto.analisis.isr_personas_morales.a_cargo, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'SEPTIEMBRE', importe: septiembre.analisis.isr_personas_morales.a_cargo, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'OCTUBRE', importe: octubre.analisis.isr_personas_morales.a_cargo, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'NOVIEMBRE', importe: noviembre.analisis.isr_personas_morales.a_cargo, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'DICIEMBRE', importe: diciembre.analisis.isr_personas_morales.a_cargo, ivaCargo: 0, ivaFavor: 0 },
                    ]
                };
                console.log(ObjData)
                await axios.post(this.rutaAxios + 'Comparativa/PostComparativaAsync/erp_' + this.token.rfc, ObjData);
            } catch (error) {
                console.log(error)
            }
        },

        async PostRetenciones() {
            try {

                let enero = this.resultado.data.find(x =>
                x.periodo == 'ENERO' && x.analisis.encabezado.tipo_declaracion == 'Complementaria'
            ) || this.resultado.data.find(x =>
                x.periodo == 'ENERO' && x.analisis.encabezado.tipo_declaracion == 'Normal'
            );
            let febrero = this.resultado.data.find(x =>
                x.periodo == 'FEBRERO' && x.analisis.encabezado.tipo_declaracion == 'Complementaria'
            ) || this.resultado.data.find(x =>
                x.periodo == 'FEBRERO' && x.analisis.encabezado.tipo_declaracion == 'Normal'
            );
            let marzo = this.resultado.data.find(x =>
                x.periodo == 'MARZO' && x.analisis.encabezado.tipo_declaracion == 'Complementaria'
            ) || this.resultado.data.find(x =>
                x.periodo == 'MARZO' && x.analisis.encabezado.tipo_declaracion == 'Normal'
            );
            let abril = this.resultado.data.find(x =>
                x.periodo == 'ABRIL' && x.analisis.encabezado.tipo_declaracion == 'Complementaria'
            ) || this.resultado.data.find(x =>
                x.periodo == 'ABRIL' && x.analisis.encabezado.tipo_declaracion == 'Normal'
            );
            let mayo = this.resultado.data.find(x =>
                x.periodo == 'MAYO' && x.analisis.encabezado.tipo_declaracion == 'Complementaria'
            ) || this.resultado.data.find(x =>
                x.periodo == 'MAYO' && x.analisis.encabezado.tipo_declaracion == 'Normal'
            );
            let junio = this.resultado.data.find(x =>
                x.periodo == 'JUNIO' && x.analisis.encabezado.tipo_declaracion == 'Complementaria'
            ) || this.resultado.data.find(x =>
                x.periodo == 'JUNIO' && x.analisis.encabezado.tipo_declaracion == 'Normal'
            );
            let julio = this.resultado.data.find(x =>
                x.periodo == 'JULIO' && x.analisis.encabezado.tipo_declaracion == 'Complementaria'
            ) || this.resultado.data.find(x =>
                x.periodo == 'JULIO' && x.analisis.encabezado.tipo_declaracion == 'Normal'
            );
            let agosto = this.resultado.data.find(x =>
                x.periodo == 'AGOSTO' && x.analisis.encabezado.tipo_declaracion == 'Complementaria'
            ) || this.resultado.data.find(x =>
                x.periodo == 'AGOSTO' && x.analisis.encabezado.tipo_declaracion == 'Normal'
            );
            let septiembre = this.resultado.data.find(x =>
                x.periodo == 'SEPTIEMBRE' && x.analisis.encabezado.tipo_declaracion == 'Complementaria'
            ) || this.resultado.data.find(x =>
                x.periodo == 'SEPTIEMBRE' && x.analisis.encabezado.tipo_declaracion == 'Normal'
            );
            let octubre = this.resultado.data.find(x =>
                x.periodo == 'OCTUBRE' && x.analisis.encabezado.tipo_declaracion == 'Complementaria'
            ) || this.resultado.data.find(x =>
                x.periodo == 'OCTUBRE' && x.analisis.encabezado.tipo_declaracion == 'Normal'
            );
            let noviembre = this.resultado.data.find(x =>
                x.periodo == 'NOVIEMBRE' && x.analisis.encabezado.tipo_declaracion == 'Complementaria'
            ) || this.resultado.data.find(x =>
                x.periodo == 'NOVIEMBRE' && x.analisis.encabezado.tipo_declaracion == 'Normal'
            );
            let diciembre = this.resultado.data.find(x =>
                x.periodo == 'DICIEMBRE' && x.analisis.encabezado.tipo_declaracion == 'Complementaria'
            ) || this.resultado.data.find(x =>
                x.periodo == 'DICIEMBRE' && x.analisis.encabezado.tipo_declaracion == 'Normal'
            );

                let ObjData = {
                    tipo: 'Asimilados',
                    anio: this.form.anio,
                    comparativa: [
                        { mes: 'ENERO', importe: enero.analisis.isr_retenciones_asimilados_salarios.a_cargo, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'FEBRERO', importe: febrero.analisis.isr_retenciones_asimilados_salarios.a_cargo, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'MARZO', importe: marzo.analisis.isr_retenciones_asimilados_salarios.a_cargo, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'ABRIL', importe: abril.analisis.isr_retenciones_asimilados_salarios.a_cargo, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'MAYO', importe: mayo.analisis.isr_retenciones_asimilados_salarios.a_cargo, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'JUNIO', importe: junio.analisis.isr_retenciones_asimilados_salarios.a_cargo, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'JULIO', importe: julio.analisis.isr_retenciones_asimilados_salarios.a_cargo, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'AGOSTO', importe: agosto.analisis.isr_retenciones_asimilados_salarios.a_cargo, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'SEPTIEMBRE', importe: septiembre.analisis.isr_retenciones_asimilados_salarios.a_cargo, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'OCTUBRE', importe: octubre.analisis.isr_retenciones_asimilados_salarios.a_cargo, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'NOVIEMBRE', importe: noviembre.analisis.isr_retenciones_asimilados_salarios.a_cargo, ivaCargo: 0, ivaFavor: 0 },
                        { mes: 'DICIEMBRE', importe: diciembre.analisis.isr_retenciones_asimilados_salarios.a_cargo, ivaCargo: 0, ivaFavor: 0 },
                    ]
                };
                console.log(ObjData)
                 await axios.post(this.rutaAxios + 'Comparativa/PostComparativaAsync/erp_' + this.token.rfc, ObjData);
                
            } catch (error) {
                console.log(error)
            }
        },
    }
}
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

::v-deep .result-box {
    background: #1e1e2e;
    border-radius: 10px;
    padding: 16px;
    font-family: monospace;
    font-size: 13px;
    color: #cdd6f4;
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 320px;
    overflow-y: auto;
}

::v-deep .chip-mes {
    cursor: pointer;
    transition: transform .1s;
}

::v-deep .chip-mes:hover {
    transform: scale(1.05);
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


::v-deep .chip-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 16px;
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

::v-deep .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 12px;
    margin-bottom: 8px;
}

::v-deep .metric-card {
    background: white;
    border-radius: 8px;
    padding: 14px 16px;
    border: 1px solid #e0e0e0;
}

::v-deep .metric-label {
    font-size: 12px;
    color: #9e9e9e;
    margin-bottom: 4px;
}

::v-deep .metric-val {
    font-size: 22px;
    font-weight: 500;
    color: #212121;
}

::v-deep .metric-val.success {
    color: #2e7d32;
}

::v-deep .metric-val.danger {
    color: #c62828;
}

::v-deep .metric-val.info {
    color: #1565c0;
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

::v-deep .badge {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
}

::v-deep .badge-green {
    background: #e8f5e9;
    color: #2e7d32;
}

::v-deep .badge-red {
    background: #fce4ec;
    color: #c62828;
}

::v-deep .badge-blue {
    background: #e3f2fd;
    color: #1565c0;
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
</style>