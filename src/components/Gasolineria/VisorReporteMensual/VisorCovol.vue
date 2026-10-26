<template>
  <div class="visor-covol q-pa-md q-gutter-y-md">
    <!-- Barra de archivo -->
    <div class="row items-center justify-between q-col-gutter-sm">
      <div class="col-12 col-md">
        <div class="vc-label">Reporte mensual · JSON</div>
        <div class="text-h5 vc-display">Visor de Controles Volumétricos</div>
        <div class="vc-mono text-caption text-grey-7 ellipsis-2-lines">{{ nombreArchivo }}</div>
      </div>
      <div class="col-12 col-md-auto row items-center q-gutter-sm">
        <q-chip v-if="meta" dense :color="meta.ejemplo ? 'orange-2' : 'green-2'" :text-color="meta.ejemplo ? 'orange-10' : 'green-10'">
          {{ meta.ejemplo ? 'Datos de ejemplo' : meta.sinNombre ? 'Reporte de la API' : 'Archivo cargado' }}
        </q-chip>
        <!-- <q-btn outline no-caps label="Ver ejemplo" @click="cargarEjemplo" /> -->
      </div>
    </div>

    <q-card flat bordered :class="['vc-drop', { 'vc-drop--over': arrastrando }]"
            @dragenter.native.prevent="arrastrando = true" @dragover.native.prevent="arrastrando = true"
            @dragleave.native.prevent="arrastrando = false" @drop.native.prevent="soltar"
            class="full-width">
      <q-card-section class="row items-center q-col-gutter-md">
        <div class="col-12 col-sm-auto">
          <q-file v-model="archivo" dense outlined accept=".zip,.json,application/json,application/zip"
                  label="Abrir ZIP o JSON" style="min-width: 220px" :loading="cargando" @input="abrir">
            <template v-slot:prepend><q-icon name="attach_file" /></template>
          </q-file>
        </div>
        <div class="col text-grey-7">
          o arrastra aquí el archivo <span class="vc-mono">M_…_JSON.zip</span>. Se lee en tu navegador; no se sube a ningún lado.
        </div>
      </q-card-section>
    </q-card>

    <q-banner v-if="error" rounded class="bg-red-1 text-red-10">
      <template v-slot:avatar><q-icon name="error_outline" color="negative" /></template>
      {{ error }}
    </q-banner>

    <template v-if="datos">
      <!-- Encabezado -->
      <q-card flat bordered class="full-width">
        <q-card-section>
          <div class="row items-baseline justify-between">
            <div class="text-h6 vc-display">{{ datos.DescripcionInstalacion || datos.ClaveInstalacion }}</div>
            <div class="vc-label">Encabezado</div>
          </div>
          <div class="row q-col-gutter-md q-mt-xs">
            <div v-for="c in encabezado" :key="c[0]" class="col-12 col-sm-6 col-md-3">
              <div class="vc-label">{{ c[0] }}</div>
              <div class="vc-mono text-body2" style="word-break: break-word">{{ c[1] }}</div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Revisión -->
      <q-card flat bordered class="full-width">
        <q-card-section>
          <div class="row items-center justify-between q-mb-sm">
            <div class="text-h6 vc-display">Revisión</div>
            <div>
              <q-chip dense color="red-1" text-color="red-10">{{ conteo.error }} errores</q-chip>
              <q-chip dense color="orange-1" text-color="orange-10">{{ conteo.aviso }} avisos</q-chip>
            </div>
          </div>
          <div class="column q-gutter-y-xs">
            <div v-for="(r, i) in revisiones" :key="i" :class="['vc-chk', 'vc-chk--' + r.nivel]">
              <span class="vc-chk__tag">{{ r.nivel === 'error' ? 'Error' : r.nivel === 'aviso' ? 'Aviso' : 'OK' }}</span>
              <span>{{ r.texto }}</span>
            </div>
          </div>
          <div class="text-caption text-grey-7 q-mt-sm">
            Revisión local contra la guía de llenado del mensual. La validación definitiva la hace el portal del SAT al recibir el archivo.
          </div>
        </q-card-section>
      </q-card>

      <!-- Productos -->
      <div>
        <div class="text-h6 vc-display q-mb-sm">Productos</div>
        <div class="row q-col-gutter-md">
          <div v-for="(p, i) in datos.Producto" :key="i" class="col-12 col-md-4">
            <q-card flat bordered :class="['vc-prod cursor-pointer', { 'vc-prod--activo': i === prod }]"
                    :style="{ '--pc': colorProducto(p) }" tabindex="0"
                    @click.native="elegir(i)" @keyup.native.enter="elegir(i)">
              <q-card-section>
                <div class="row items-baseline justify-between no-wrap q-mb-sm">
                  <div class="text-subtitle1 vc-display">{{ nombreProducto(p) }}</div>
                  <div class="vc-mono text-caption text-grey-7">
                    {{ p.ClaveProducto }} · {{ p.ClaveSubProducto }}
                    <template v-if="p.ClaveProducto === 'PR07'">{{ p.ComposOctanajeGasolina }} oct.</template>
                  </div>
                </div>
                <div class="row q-col-gutter-sm">
                  <div class="col-4">
                    <div class="vc-label">Compras</div>
                    <div class="vc-big">{{ litros(seccion(p, 'Recepciones', 'SumaVolumenRecepcionMes.ValorNumerico')) }}</div>
                    <div class="text-caption text-grey-7">
                      {{ entero(seccion(p, 'Recepciones', 'TotalRecepcionesMes')) }} recepciones · {{ pesos(seccion(p, 'Recepciones', 'ImporteTotalRecepcionesMensual')) }}
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="vc-label">Ventas</div>
                    <div class="vc-big">{{ litros(seccion(p, 'Entregas', 'SumaVolumenEntregadoMes.ValorNumerico')) }}</div>
                    <div class="text-caption text-grey-7">
                      {{ entero(seccion(p, 'Entregas', 'TotalEntregasMes')) }} despachos · {{ pesos(seccion(p, 'Entregas', 'ImporteTotalEntregasMes')) }}
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="vc-label">Existencia final</div>
                    <div class="vc-big">{{ litros(existencia(p)) }}</div>
                    <div class="text-caption text-grey-7">
                      {{ unidad(p) }} · precio prom. {{ precioPromedio(p) }}
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Detalle -->
      <q-card flat bordered class="full-width">
        <q-card-section class="q-pb-none">
          <div class="row items-center justify-between">
            <div class="text-h6 vc-display row items-center q-gutter-x-sm">
              <span class="vc-dot" :style="{ background: colorProducto(producto) }" />
              <span>{{ nombreProducto(producto) }}</span>
            </div>
            <div class="vc-label">{{ tab === 'bitacora' || tab === 'json' ? 'Todo el reporte' : 'Detalle del producto' }}</div>
          </div>
        </q-card-section>

        <q-tabs v-model="tab" dense align="left" no-caps active-color="primary" indicator-color="primary" class="text-grey-7">
          <q-tab name="entregas" label="Ventas" />
          <q-tab name="recepciones" label="Compras" />
          <q-tab name="bitacora" label="Bitácora" />
          <q-tab name="json" label="JSON" />
        </q-tabs>
        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <!-- Ventas y compras comparten la misma tabla -->
          <q-tab-panel v-for="t in ['entregas', 'recepciones']" :key="t" :name="t">
            <div class="row items-center q-col-gutter-sm q-mb-sm">
              <div class="col-12 col-sm-5">
                <q-input v-model="buscar" dense outlined clearable debounce="250" placeholder="Buscar RFC, nombre o UUID">
                  <template v-slot:prepend><q-icon name="search" /></template>
                </q-input>
              </div>
              <div class="col-12 col-sm-auto">
                <q-toggle v-model="soloFuera" dense :label="'Solo fechas fuera de ' + per" />
              </div>
              <div class="col-12 col-sm text-right vc-mono text-caption text-grey-7">
                {{ entero(filasVisibles.length) }} CFDIs · {{ litros(totalVisible.vol) }} L · {{ pesos(totalVisible.importe) }}
              </div>
            </div>

            <q-banner v-for="(a, i) in seccionActual.aclaraciones" :key="'acl' + i" dense rounded class="bg-blue-1 q-mb-sm">
              <span class="vc-label">Aclaración</span><br>{{ a }}
            </q-banner>

            <q-table flat bordered dense :data="filasVisibles" :columns="columnas" row-key="i"
                     :pagination.sync="paginacion" :rows-per-page-options="[50, 100, 250]"
                     no-data-label="Sin CFDIs en esta sección" no-results-label="Sin CFDIs con ese filtro">
              <template v-slot:body="props">
                <q-tr :props="props" :class="['cursor-pointer', { 'vc-fuera': props.row.fuera }]" @click="props.expand = !props.expand">
                  <q-td v-for="col in props.cols" :key="col.name" :props="props"
                        :class="{ 'vc-mono': col.mono, 'vc-wrap': col.name === 'nombre' }">
                    {{ col.value }}
                  </q-td>
                </q-tr>
                <q-tr v-if="props.expand" :props="props" class="vc-detalle">
                  <q-td colspan="100%">
                    <pre class="vc-pre">{{ JSON.stringify(props.row.nodo, null, 2) }}</pre>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
            <div class="text-caption text-grey-7 q-mt-sm">
              Haz clic en una fila para ver su nodo <span class="vc-mono">Nacional</span> completo.
            </div>
          </q-tab-panel>

          <q-tab-panel name="bitacora">
            <q-table flat bordered dense :data="datos.BitacoraMensual || []" :columns="columnasBitacora"
                     row-key="NumeroRegistro" :pagination="{ rowsPerPage: 50 }" no-data-label="Sin eventos" />
          </q-tab-panel>

          <q-tab-panel name="json">
            <div class="row items-center q-gutter-sm q-mb-sm">
              <q-btn outline no-caps icon="content_copy" :label="textoCopiar" @click="copiar" />
              <span class="text-caption text-grey-7">Vista resumida: cada lista muestra sus primeros 2 elementos.</span>
            </div>
            <div class="vc-jsonbox"><pre class="vc-pre">{{ json }}</pre></div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </template>
  </div>
</template>

<script>
import { copyToClipboard } from 'quasar'
import {
  leerArchivo, filas, revisar, jsonResumido, ejemplo, periodo,
  nombreProducto, colorProducto, num, litros, pesos, entero, EVENTOS, UNIDADES
} from './covolMensual'

const valor = (o, ruta) => ruta.split('.').reduce((x, p) => (x == null ? undefined : x[p]), o)

export default {
  name: 'VisorCovol',

  props: {
    /** Muestra el ejemplo al abrir. Pon false si el componente recibe el reporte por la prop `reporte`. */
    mostrarEjemplo: { type: Boolean, default: true },
    /** Opcional: un reporte ya cargado (objeto JSON), p. ej. la respuesta de /mensual/vista → reporte. */
    reporte: { type: Object, default: null }
  },

  data () {
    return {
      archivo: null,
      cargando: false,
      arrastrando: false,
      error: '',
      datos: null,
      meta: null,
      prod: 0,
      tab: 'entregas',
      buscar: '',
      soloFuera: false,
      paginacion: { page: 1, rowsPerPage: 100 },
      textoCopiar: 'Copiar JSON completo'
    }
  },

  computed: {
    nombreArchivo () {
      if (!this.meta) return ''
      return this.meta.nombreInterno ? `${this.meta.nombreZip} → ${this.meta.nombreInterno}` : this.meta.nombreZip
    },
    per () { return this.datos ? periodo(this.datos) : '' },
    producto () { return this.datos ? this.datos.Producto[this.prod] : null },
    revisiones () { return this.datos ? revisar(this.datos, this.meta) : [] },
    conteo () {
      return {
        error: this.revisiones.filter(r => r.nivel === 'error').length,
        aviso: this.revisiones.filter(r => r.nivel === 'aviso').length
      }
    },
    encabezado () {
      const d = this.datos
      const n = v => (v == null ? 0 : v)
      return [
        ['Periodo', this.per], ['Fecha del reporte', d.FechaYHoraReporteMes], ['Versión', d.Version],
        ['RFC contribuyente', d.RfcContribuyente], ['Representante legal', d.RfcRepresentanteLegal || '—'],
        ['RFC proveedor', d.RfcProveedor], ['Carácter', d.Caracter],
        ['Permiso', `${d.ModalidadPermiso || '—'} · ${d.NumPermiso || '—'}`], ['Clave de instalación', d.ClaveInstalacion],
        ['Tanques / dispensarios', `${n(d.NumeroTanques)} / ${n(d.NumeroDispensarios)}`],
        ['Pozos / ductos', `${n(d.NumeroPozos)} / ${n(d.NumeroDuctosEntradaSalida) + n(d.NumeroDuctosTransporteDistribucion)}`],
        ['Eventos en bitácora', entero((d.BitacoraMensual || []).length)]
      ]
    },
    esRecepcion () { return this.tab === 'recepciones' },
    seccionActual () {
      if (!this.producto || (this.tab !== 'entregas' && this.tab !== 'recepciones')) return { rows: [], aclaraciones: [] }
      const rv = this.producto.ReporteDeVolumenMensual || {}
      return filas(this.esRecepcion ? rv.Recepciones : rv.Entregas, this.esRecepcion)
    },
    filasVisibles () {
      const q = (this.buscar || '').trim().toLowerCase()
      let rows = this.seccionActual.rows.map(x => Object.assign({}, x, { fuera: !!x.fecha && !x.fecha.startsWith(this.per) }))
      if (q) rows = rows.filter(x => `${x.rfc} ${x.nombre} ${x.uuid}`.toLowerCase().includes(q))
      if (this.soloFuera) rows = rows.filter(x => x.fuera)
      return rows
    },
    totalVisible () {
      return this.filasVisibles.reduce((a, x) => ({ vol: a.vol + x.vol, importe: a.importe + x.importe }), { vol: 0, importe: 0 })
    },
    columnas () {
      const cols = [
        { name: 'n', label: '#', field: r => r.i + 1, align: 'right', mono: true },
        { name: 'fecha', label: 'Fecha y hora', field: r => r.fecha.replace('T', ' '), align: 'left', sortable: true, mono: true },
        { name: 'rfc', label: 'RFC', field: 'rfc', align: 'left', sortable: true, mono: true },
        { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' },
        { name: 'uuid', label: 'UUID', field: 'uuid', align: 'left', mono: true },
        { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'left' },
        { name: 'vol', label: 'Litros', field: 'vol', format: litros, align: 'right', sortable: true, mono: true }
      ]
      if (!this.esRecepcion) cols.push({ name: 'precio', label: 'Precio/L', field: 'precio', format: pesos, align: 'right', mono: true })
      cols.push({ name: 'importe', label: 'Importe', field: 'importe', format: pesos, align: 'right', sortable: true, mono: true })
      return cols
    },
    columnasBitacora () {
      return [
        { name: 'num', label: 'No.', field: 'NumeroRegistro', align: 'right', sortable: true },
        { name: 'fecha', label: 'Fecha y hora', field: r => (r.FechaYHoraEvento || '').replace('T', ' '), align: 'left', sortable: true },
        { name: 'usuario', label: 'Usuario', field: 'UsuarioResponsable', align: 'left' },
        { name: 'tipo', label: 'Tipo', field: r => `${r.TipoEvento} · ${EVENTOS[r.TipoEvento] || ''}`, align: 'left' },
        { name: 'desc', label: 'Descripción', field: 'DescripcionEvento', align: 'left', classes: 'vc-wrap' },
        { name: 'comp', label: 'Componente', field: r => r.IdentificacionComponenteAlarma || '', align: 'left', classes: 'vc-wrap' }
      ]
    },
    json () { return this.datos ? jsonResumido(this.datos) : '' }
  },

  watch: {
    tab () { this.reiniciarTabla() },
    buscar () { this.paginacion.page = 1 },
    soloFuera () { this.paginacion.page = 1 },
    reporte: {
      immediate: true,
      handler (r) {
        // Sin archivo no hay nombre ni BOM que revisar
        if (r) this.mostrar(r, { nombreZip: 'Reporte recibido de la API', nombreInterno: null, entradas: 0, bom: false, ejemplo: false, sinNombre: true })
      }
    }
  },

  mounted () {
    // if (!this.reporte && this.mostrarEjemplo) this.cargarEjemplo()
  },

  methods: {
    nombreProducto,
    colorProducto (p) { return colorProducto(p, this.$q.dark.isActive) },
    litros,
    pesos,
    entero,

    async abrir (file) {
      if (!file) return
      this.cargando = true
      this.error = ''
      try {
        const { datos, meta } = await leerArchivo(file)
        this.mostrar(datos, meta)
      } catch (e) {
        this.error = e.message || String(e)
      } finally {
        this.cargando = false
        this.archivo = null
      }
    },
    soltar (e) {
      this.arrastrando = false
      const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]
      if (f) this.abrir(f)
    },
    cargarEjemplo () {
      const { datos, meta } = ejemplo()
      this.error = ''
      this.mostrar(datos, meta)
    },
    mostrar (datos, meta) {
      this.datos = Object.freeze(datos)      // sin reactividad profunda: archivos de 10 mil CFDIs
      this.meta = meta
      this.prod = 0
      this.tab = 'entregas'
      this.reiniciarTabla()
    },
    elegir (i) {
      this.prod = i
      if (this.tab === 'bitacora' || this.tab === 'json') this.tab = 'entregas'
      this.reiniciarTabla()
    },
    reiniciarTabla () {
      this.buscar = ''
      this.soloFuera = false
      this.paginacion = Object.assign({}, this.paginacion, { page: 1 })
    },

    seccion (p, s, ruta) { return valor((p.ReporteDeVolumenMensual || {})[s], ruta) },
    existencia (p) { return valor(p.ReporteDeVolumenMensual, 'ControlDeExistencias.VolumenExistenciasMes') },
    unidad (p) { return UNIDADES[this.seccion(p, 'Entregas', 'SumaVolumenEntregadoMes.UnidadDeMedida')] || '' },
    precioPromedio (p) {
      const v = num(this.seccion(p, 'Entregas', 'SumaVolumenEntregadoMes.ValorNumerico'))
      const i = num(this.seccion(p, 'Entregas', 'ImporteTotalEntregasMes'))
      return v ? pesos(i / v) : '—'
    },

    async copiar () {
      try {
        await copyToClipboard(JSON.stringify(this.datos, null, 2))
        this.textoCopiar = 'Copiado'
      } catch (e) {
        this.textoCopiar = 'No se pudo copiar'
      }
      setTimeout(() => { this.textoCopiar = 'Copiar JSON completo' }, 1800)
    }
  }
}
</script>

<style lang="scss">
/* Sin scoped: q-table pinta las celdas en componentes hijos */
.visor-covol {
  --vc-magna: #1f8a4c;
  --vc-premium: #c8322f;

  .vc-display { font-family: "Barlow Condensed", "Arial Narrow", sans-serif; font-weight: 600; letter-spacing: .01em; }
  .vc-mono { font-family: "JetBrains Mono", ui-monospace, Consolas, monospace; font-variant-numeric: tabular-nums; }
  .vc-label { font-size: .72rem; text-transform: uppercase; letter-spacing: .08em; color: #5b6873; font-weight: 600; }
  .vc-big { font-family: "JetBrains Mono", ui-monospace, Consolas, monospace; font-variant-numeric: tabular-nums; font-size: 1.02rem; font-weight: 500; }

  .vc-drop { border-style: dashed; border-width: 1.5px; }
  .vc-drop--over { border-color: var(--q-color-primary); background: rgba(15, 95, 116, .08); }

  .vc-chk { display: grid; grid-template-columns: auto 1fr; gap: 10px; align-items: start; padding: 7px 10px; border-radius: 6px; font-size: .9rem; }
  .vc-chk__tag { font-size: .68rem; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; padding: 2px 7px; border-radius: 4px; margin-top: 1px; }
  .vc-chk--error { background: #fbe0dd; }
  .vc-chk--error .vc-chk__tag { background: #b42318; color: #fff; }
  .vc-chk--aviso { background: #fbecd2; }
  .vc-chk--aviso .vc-chk__tag { background: #9a5b00; color: #fff; }
  .vc-chk--ok .vc-chk__tag { background: #ddf1e5; color: #1d7a46; }

  .vc-prod { position: relative; overflow: hidden; height: 100%; }
  .vc-prod::before { content: ""; position: absolute; top: 0; bottom: 0; left: 0; width: 5px; background: var(--pc); }
  .vc-prod--activo { border-color: var(--pc); box-shadow: 0 0 0 1px var(--pc); }
  .vc-dot { width: 10px; height: 10px; border-radius: 2px; display: inline-block; }

  .vc-fuera td { background: #fbecd2; }
  .vc-detalle td { background: #eef1f3; }
  .vc-wrap { white-space: normal !important; min-width: 180px; }
  .vc-pre { margin: 0; font-family: "JetBrains Mono", ui-monospace, Consolas, monospace; font-size: .78rem; line-height: 1.5; white-space: pre; overflow-x: auto; }
  .vc-jsonbox { background: #eef1f3; border-radius: 8px; padding: 12px; max-height: 560px; overflow: auto; }
}

/* Modo oscuro de Quasar */
.body--dark .visor-covol {
  .vc-label { color: #93a1ab; }
  .vc-chk--error { background: #3a1714; }
  .vc-chk--aviso { background: #33260f; }
  .vc-chk--ok .vc-chk__tag { background: #14301f; color: #5cc48a; }
  .vc-fuera td { background: #33260f; }
  .vc-detalle td, .vc-jsonbox { background: #0d1215; }
}
</style>
