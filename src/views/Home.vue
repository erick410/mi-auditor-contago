<template>
  <div class="page">


    <div class="content-logo">
      <img class="wb-logo" src="../assets/logo_contago_sin_fondo.png" alt="Contago" />
    </div>

    <!-- MÓDULOS -->
    <div class="content">
      <div class="welcome-band">

        <div class="wb-left">
          <div class="wb-text">
            <div class="wb-title">¡Bienvenido!</div>
            <div class="wb-sub">¿Qué deseas hacer hoy?</div>
            <div class="wb-fecha">{{ fechaHoy }}</div>
          </div>
        </div>

        <div class="wb-right">
          <div class="ind" :style="{
            background: colorFondo(semaforo.emitidos),
            borderColor: colorBorde(semaforo.emitidos)
          }">
            <div class="ind-dot" :style="{ background: colorDot(semaforo.emitidos) }"></div>
            <div class="ind-info">
              <span class="ind-tipo" :style="{ color: colorTipo(semaforo.emitidos) }">Emitidos</span>
              <span class="ind-fecha" :style="{ color: colorFecha(semaforo.emitidos) }">
                {{ formatFecha(descarga.emitidos?.ultimaFecha) }}
              </span>
              <span class="ind-label" :style="{ color: colorLabel(semaforo.emitidos) }">
                {{ labelEstado(semaforo.emitidos) }}
              </span>
            </div>
          </div>

          <div class="ind" :style="{
            background: colorFondo(semaforo.recibidos),
            borderColor: colorBorde(semaforo.recibidos)
          }">
            <div class="ind-dot" :style="{ background: colorDot(semaforo.recibidos) }"></div>
            <div class="ind-info">
              <span class="ind-tipo" :style="{ color: colorTipo(semaforo.recibidos) }">Recibidos</span>
              <span class="ind-fecha" :style="{ color: colorFecha(semaforo.recibidos) }">
                {{ formatFecha(descarga.recibidos?.ultimaFecha) }}
              </span>
              <span class="ind-label" :style="{ color: colorLabel(semaforo.recibidos) }">
                {{ labelEstado(semaforo.recibidos) }}
              </span>
            </div>
          </div>

          <q-btn v-if="solicitudDisponible " flat round dense icon="mdi-plus-circle-outline" size="md" color="grey-7"
            @click="crearSolicitud">
            <q-tooltip content-style="font-size:13px">
              Crear solicitud de descarga
            </q-tooltip>
          </q-btn>
        </div>
      </div>
      <div class="sec">
        <div class="sec-hdr">
          <span class="sec-name">Menú</span>
          <div class="sec-line"></div>
        </div>
        <div class="cards">
          <div class="card" v-for="m in modulosFiltrados" :key="m.name" @click="m.action()">
            <div class="card-top">
              <div class="card-icon" style="background:#FCEBEB">
                <q-icon :name="m.icon" size="25px" style="color:#A32D2D" />
              </div>
              <span class="card-arr">→</span>
            </div>
            <div>
              <div class="card-label">{{ m.name }}</div>
              <div class="card-sub">{{ m.sub }}</div>
            </div>
          </div>
        </div>
      </div>

      <template v-if="esGasolinero">
        <div class="sec">
          <div class="sec-hdr">
            <span class="sec-name">Gasolinería</span>
            <span class="gas-badge">Solo Gasolineros</span>
            <div class="sec-line"></div>
          </div>
          <div class="cards" style="grid-template-columns: repeat(auto-fill, minmax(180px, 220px))">
            <div class="card" @click="$router.push({ name: 'Gasolineria' })">
              <div class="card-top">
                <div class="card-icon" style="background:#FAEEDA">
                  <q-icon name="mdi-gas-station" size="22px" style="color:#854F0B" />
                </div>
                <span class="card-arr">→</span>
              </div>
              <div>
                <div class="card-label">Gasolinerias</div>
                <div class="card-sub">Control de estaciones</div>
              </div>
            </div>
          </div>
        </div>
      </template>

    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      descarga: { emitidos: null, recibidos: null },
      semaforo: { emitidos: null, recibidos: null },
      modulosComprobantes: [
        { name: 'Ingresos', sub: 'CFDIs emitidos', icon: 'mdi-file-document-plus', action: () => this.$router.push({ name: 'Ingresos' }), bloqueados: [] },
        { name: 'Compras', sub: 'CFDIs recibidos', icon: 'mdi-file-document-minus', action: () => this.$router.push({ name: 'Compras' }), bloqueados: [] },
        { name: 'Nómina', sub: 'Comprobantes de pago', icon: 'mdi-account-cash', action: () => this.$router.push({ name: 'Nomina' }), bloqueados: ['ALICIA BALDERAS', 'KARINA GIRON', 'ANA ADAME'] },
        { name: 'Sustitución CFDIs', sub: 'Reemplazar comprobantes', icon: 'mdi-file-replace', action: () => this.$router.push({ name: 'MainSustitucion' }), bloqueados: [] },
        { name: 'Descargas SAT', sub: 'Solicitudes al SAT', icon: 'mdi-download-box', action: () => this.$router.push({ name: 'DescargasScraper' }), bloqueados: [] },
        { name: 'Pagos Mensuales', sub: 'Declaraciones y pagos', icon: 'mdi-cash-clock', action: () => this.$router.push({ name: 'PagosMensuales' }), bloqueados: [] },
        { name: 'Conceptos', sub: 'Catálogo de conceptos', icon: 'mdi-format-list-checkbox', action: () => this.$router.push({ name: 'Conceptos' }), bloqueados: [] },
        { name: 'Reporte Empresarial', sub: 'Análisis general', icon: 'mdi-file-chart', action: () => this.$router.push({ name: 'ReporteGeneral' }), bloqueados: ['ALICIA BALDERAS', 'KARINA GIRON', 'ANA ADAME'] },
      ]
    }
  },

  computed: {
  solicitudDisponible() {
    if (!this.fechaMasVieja) return false

    const hoy = new Date()
    const fecha = new Date(this.fechaMasVieja)

    const esHoy = (
      fecha.getDate()     === hoy.getDate()   &&
      fecha.getMonth()    === hoy.getMonth()  &&
      fecha.getFullYear() === hoy.getFullYear()
    )

    const emitidosAlDia  = this.semaforo.emitidos  === 'verde'
    const recibidosAlDia = this.semaforo.recibidos === 'verde'

    return !esHoy && !(emitidosAlDia && recibidosAlDia)
},
    usuarioActual() {
      return this.$store.state.usuario.nombre;
    },
    modulosFiltrados() {
      return this.modulosComprobantes.filter(m =>
        !m.bloqueados.includes(this.usuarioActual.toUpperCase())
      );
    },

    esGasolinero() { return this.$store.state.usuario.rol === 'Gasolinero' },
    fechaHoy() {
      return new Date().toLocaleDateString('es-MX', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      })
    },
    fechaMasVieja() {
      const fe = this.descarga.emitidos?.ultimaFecha
      const fr = this.descarga.recibidos?.ultimaFecha

      if (!fe && !fr) return null
      if (!fe) return fr
      if (!fr) return fe

      return new Date(fe) < new Date(fr) ? fe : fr
    }
  },

  created() {
    this.listaEmpresas()
    this.cargarSemaforo()
  },

  methods: {
    async cargarSemaforo() {
      try {
        const rfc = this.$store.state.usuario.rfc
        if (!rfc) return
        const { data } = await axios.get(
          `Descargas/GetUltimaDescarga/${rfc}`
        )
        this.descarga = { emitidos: data.emitidos, recibidos: data.recibidos }
        this.semaforo = { emitidos: data.emitidos?.semaforo, recibidos: data.recibidos?.semaforo }

        console.log(data)
      } catch (e) {
        console.error('Semáforo no disponible', e)
      }
    },
    colorDot(v) { return { rojo: '#E24B4A', amarillo: '#EF9F27', verde: '#639922' }[v] || '#ccc' },
    colorFondo(v) { return { rojo: '#FCEBEB', amarillo: '#FAEEDA', verde: '#EAF3DE' }[v] || '#f4f5f7' },
    colorBorde(v) { return { rojo: '#F09595', amarillo: '#FAC775', verde: '#97C459' }[v] || '#e3e3e3' },

    // ← estos son los que necesitas corregir
    colorTipo(v) { return { rojo: '#791F1F', amarillo: '#633806', verde: '#27500A' }[v] || '#aaa' },
    colorFecha(v) { return { rojo: '#A32D2D', amarillo: '#854F0B', verde: '#3B6D11' }[v] || '#111' },
    colorLabel(v) { return { rojo: '#A32D2D', amarillo: '#854F0B', verde: '#3B6D11' }[v] || '#aaa' },


    labelEstado(v) { return { rojo: 'Desactualizado', amarillo: 'Por actualizar', verde: 'Al día' }[v] || '—' },
    formatFecha(fecha) {
      if (!fecha) return '—'
      return new Date(fecha).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
    },
    listaEmpresas() {
      axios.get(`https://api-framework.contago.com.mx/api/Usuarios/Empresas/${this.$store.state.usuario.idusuariosApp}/DESERIALIZADOR`)
        .then(r => { this.$store.state.listaEmpresasStore = r.data.sort((a, b) => a.nombre_e.toUpperCase().localeCompare(b.nombre_e.toUpperCase())) })
        .catch(console.error)
    },

    // async crearSolicitud(tipo, model) {
    //   console.log(tipo)
    //   console.log(this.$store.state.empresaStore)

    //   const datos = tipo === 'Emitido' ? this.descarga.emitidos : this.descarga.recibidos

    //   if (!datos?.fechaInicioNuevaSolicitud) {
    //     this.$q.notify({
    //       type: 'warning',
    //       message: 'No hay fecha disponible para crear la solicitud',
    //       position: 'top-right'
    //     })
    //     return
    //   }

    //   let objeto = {
    //     Rfc: this.$store.state.usuario.rfc,
    //     razon_social: this.$store.state.empresaStore.nombre,
    //     fecha_de_la_solicitud: model.ultimaFecha,
    //     tipo : tipo
    //   }

    //   try {
    //     let response = await axios.post('Descargas/PostSolicitudDescargarSignalR', objeto);
    //     console.log(response)
    //     this.$q.notify({
    //       type: 'positive',
    //       message: 'Se ha creado la solicitud de descarga automatica.',
    //       position: 'top-right'
    //     })
    //   }catch{
    //     this.$q.notify({
    //       type: 'negative',
    //       message: 'Error al registra los datos',
    //       position: 'top-right'
    //     })
    //   }

    //   console.log(objeto)
    // }

    async crearSolicitud() {
      if (!this.fechaMasVieja) {
        this.$q.notify({
          type: 'warning',
          message: 'No hay fecha disponible para crear la solicitud',
          position: 'top-right'
        })
        return
      }
      this.$q.loading.show({ message: 'Generando solicitud...' })

      const objeto = {
        Rfc: this.$store.state.usuario.rfc,
        razon_social: this.$store.state.empresaStore.nombre,
        fecha_de_la_solicitud: this.fechaMasVieja,
        tipo: 'Ambos'  // ya no es por tipo individual
      }

      try {
        await axios.post('Descargas/PostSolicitudDescargarSignalR', objeto)
        this.$q.notify({
          type: 'positive',
          message: 'Solicitud de descarga creada correctamente.',
          position: 'top-right'
        })
        this.$q.loading.hide()
      } catch {
        this.$q.notify({
          type: 'negative',
          message: 'Error al registrar la solicitud',
          position: 'top-right'
        })
        this.$q.loading.hide()
      }
    }
  }
}
</script>

<style scoped>
.page {
  background: #f4f5f7;
}

.welcome-band {
  padding: 0px 0px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  flex-wrap: wrap;
  width: 100%;
  /* ← agrega esto */
  margin: 0;
}

.wb-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.wb-logo {
  height: 150px;
  width: auto;
  object-fit: contain;
  padding: 0px 0px;
}

.wb-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.wb-title {
  font-size: 32px;
  font-weight: 600;
  color: #303030;
}

.wb-sub {
  font-size: 16px;
  color: rgba(83, 83, 83, 0.7);
}

.wb-fecha {
  font-size: 11px;
  color: rgba(80, 80, 80, 0.5);
  margin-top: 1px;
}

.wb-right {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.ind {
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 155px;
  border: 0.5px solid transparent;
}

.ind-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.ind-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ind-tipo {
  font-size: 10px;
  color: rgba(255, 255, 255, .55);
  text-transform: uppercase;
  letter-spacing: .05em;
  font-weight: 600;
}

.ind-fecha {
  font-size: 12px;
  color: #fff;
  font-weight: 600;
}

.ind-label {
  font-size: 11px;
  font-weight: 600;
}

.content-logo {
  padding: 40px 0px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* ← límite de ancho */

.content {
  padding: 10px 100px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  max-width: 1400px;
  /* ← límite de ancho */
  margin: 0 auto;
  /* ← centra el contenido */
  width: 100%;
}

.sec {
  display: flex;
  flex-direction: column;
}

.sec-hdr {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.sec-line {
  flex: 1;
  height: 0.5px;
  background: #ddd;
}

.sec-name {
  font-size: 11px;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: .07em;
  font-weight: 600;
  white-space: nowrap;
}

.gas-badge {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 20px;
  background: #FAEEDA;
  color: #633806;
  font-weight: 600;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.card {
  background: #fff;
  border: 0.5px solid #e3e3e3;
  border-radius: 16px;
  padding: 20px 18px 18px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: border-color .15s, background .15s;
}

.card:hover {
  border-color: #bbb;
  background: #fafafa;
}

.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.card-icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-arr {
  font-size: 18px;
  color: #ddd;
  transition: color .15s;
  margin-top: 2px;
}

.card:hover .card-arr {
  color: #E74747;
}

.card-label {
  font-size: 16px;
  font-weight: 600;
  color: #111;
  line-height: 1.3;
}

.card-sub {
  font-size: 14px;
  color: #aaa;
  margin-top: 3px;
}
</style>