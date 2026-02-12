<template>
  <div>
    <div class="encabezado">
      <div class="lado-izquierdo">
        <div class="titulo">Reporte Empresarial</div>
        <div class="empresa">{{ empresaStore.nombre }}</div>
        <div class="rfc">RFC: {{ empresaStore.rfc }}</div>
        <!-- <div class="fecha">Emitido el: 13/05/2025</div> -->
      </div>
      <div class="lado-derecho">
        <div class="dato">
          <span>Régimen:</span>
          {{ empresaStore.regimenFiscal.regimenFiscal }}
        </div>
        <div class="dato">
          <span>Código Postal:</span>
          {{ empresaStore.domicilioFiscal }}
        </div>
      </div>
    </div>
    <q-splitter v-model="splitterModel"  >
      <template v-slot:before>
        <q-tabs v-model="tab" vertical class="text-teal">
          <q-tab style="color: #e3a612" name="cfdi" icon="mdi-file-document" label="CFDI" />
          <q-tab style="color: #42a147" name="emitidos" icon="mdi-file-document" label="Emitidos" />
          <q-tab style="color: #294a8c" name="recibidos" icon="mdi-file-document" label="Recibidos" />
          <q-tab style="color: #c74f78" name="nomina" icon="mdi-file-document" label="Nómina" />
          <q-tab style="color: #9c2e2e" name="riesgoFiscal" icon="mdi-file-document" label="Riesgo Fiscal" />
          <q-tab style="color: #f28500" name="impuestos" icon="mdi-file-document" label="Impuestos" />
          <q-tab style="color: #615445" name="otros" icon="mdi-file-document" label="Otros" />
        </q-tabs>
      </template>

      <template v-slot:after>
        <q-tab-panels v-model="tab" animated swipeable vertical transition-prev="jump-up" transition-next="jump-up">
          <q-tab-panel name="cfdi">
            <q-expansion-item default-opened expand-separator header-class="bgc-cfdi text-white"
              expand-icon-class="text-white" label="Reporte por CFDI">
              <ReporteCFDI></ReporteCFDI>
            </q-expansion-item>
          </q-tab-panel>

          <q-tab-panel name="emitidos">
            <q-expansion-item default-opened expand-separator header-class="bgc-emitidos text-white"
              expand-icon-class="text-white" label="Comprobantes Emitidos (Tipo Ingreso)">
              <ReporteEmitidos></ReporteEmitidos>
            </q-expansion-item>
            <q-expansion-item expand-separator header-class="bgc-emitidos text-white" expand-icon-class="text-white"
              label="Comprobantes Emitidos por RFC">
              <ReporteEmitidosRFC></ReporteEmitidosRFC>
            </q-expansion-item>
            <q-expansion-item expand-separator header-class="bgc-emitidos text-white" expand-icon-class="text-white"
              label="Flujo Efectivamente Cobrado">
              <ReporteFlujoEmitido></ReporteFlujoEmitido>
            </q-expansion-item>
            <q-expansion-item expand-separator header-class="bgc-emitidos text-white" expand-icon-class="text-white"
              label="Cuentas Pendiente - Emitidos">
              <ReporteCuentasPendientesEmitidos></ReporteCuentasPendientesEmitidos>
            </q-expansion-item>
            <q-expansion-item expand-separator header-class="bgc-emitidos text-white" expand-icon-class="text-white"
              label="Métodos de Pago - Emitidos">
              <ReporteMetodosPagoEmitidos></ReporteMetodosPagoEmitidos>
            </q-expansion-item>
          </q-tab-panel>

          <q-tab-panel name="recibidos">
            <q-expansion-item default-opened expand-separator header-class="bgc-recibidos text-white"
              expand-icon-class="text-white" label="Comprobantes Recibidos (Tipo Ingreso)">
              <ReporteRecibidos></ReporteRecibidos>
            </q-expansion-item>
            <q-expansion-item expand-separator header-class="bgc-recibidos text-white" expand-icon-class="text-white"
              label="Comprobantes Recibidos por RFC">
              <ReporteRecibidosRFC></ReporteRecibidosRFC>
            </q-expansion-item>
            <q-expansion-item expand-separator header-class="bgc-recibidos text-white" expand-icon-class="text-white"
              label="Flujo Efectivamente Pagado">
              <ReporteFlujoRecibido></ReporteFlujoRecibido>
            </q-expansion-item>
            <q-expansion-item expand-separator header-class="bgc-recibidos text-white" expand-icon-class="text-white"
              label="Métodos de Pago - Recibidos">
              <ReporteMetodosPagoRecibidos></ReporteMetodosPagoRecibidos>
            </q-expansion-item>
            <q-expansion-item expand-separator header-class="bgc-recibidos text-white" expand-icon-class="text-white"
              label="Cuentas Pendientes - Recibidos">
              <ReporteCuentasPendientesRecibidos></ReporteCuentasPendientesRecibidos>
            </q-expansion-item>
          </q-tab-panel>

          <q-tab-panel name="nomina">
            <q-expansion-item default-opened expand-separator header-class="bgc-nomina text-white"
              expand-icon-class="text-white" label="Nómina Timbrada">
              <ReporteNominaTimbrada></ReporteNominaTimbrada>
            </q-expansion-item>
            <q-expansion-item expand-separator header-class="bgc-nomina text-white" expand-icon-class="text-white"
              label="Nómina Pagada">
              <ReporteNominaPagada></ReporteNominaPagada>
            </q-expansion-item>
            <q-expansion-item expand-separator header-class="bgc-nomina text-white" expand-icon-class="text-white"
              label="Nómina por Trabajadores">
              <ReporteNominaTrabajadores></ReporteNominaTrabajadores>
            </q-expansion-item>
            <q-expansion-item expand-separator header-class="bgc-nomina text-white" expand-icon-class="text-white"
              label="Conceptos de Nómina">
              <ReporteNominaConceptos></ReporteNominaConceptos>
            </q-expansion-item>
          </q-tab-panel>

          <q-tab-panel name="riesgoFiscal">
            <q-expansion-item default-opened expand-separator header-class="bgc-riesgo text-white"
              expand-icon-class="text-white" label="Gastos Efectivo Mayores a $2,000">
              <ReporteGastosEfectivo></ReporteGastosEfectivo>
            </q-expansion-item>
            <q-expansion-item expand-separator header-class="bgc-riesgo text-white" expand-icon-class="text-white"
              label="Notas Sin Relación">
              <ReporteNotasSinRelacion></ReporteNotasSinRelacion>
            </q-expansion-item>
            <q-expansion-item expand-separator header-class="bgc-riesgo text-white" expand-icon-class="text-white"
              label="Riesgo Arrendamiento Sin Cuenta Predial">
              <ReporteRiesgoArrendamiento></ReporteRiesgoArrendamiento>
            </q-expansion-item>
            <q-expansion-item expand-separator header-class="bgc-riesgo text-white" expand-icon-class="text-white"
              label="Sin Impuestos - Emitidos">
              <ReporteSinImpuestosEmitidos></ReporteSinImpuestosEmitidos>
            </q-expansion-item>
            <q-expansion-item expand-separator header-class="bgc-riesgo text-white" expand-icon-class="text-white"
              label="Sin Impuestos - Recibidos">
              <ReporteSinImpuestosRecibidos></ReporteSinImpuestosRecibidos>
            </q-expansion-item>
            <q-expansion-item expand-separator header-class="bgc-riesgo text-white" expand-icon-class="text-white"
              label="Riesgo Conceptos con Clave 01010101 - Emitidos">
              <ReporteRiesgoConceptosEmitidos></ReporteRiesgoConceptosEmitidos>
            </q-expansion-item>
            <q-expansion-item expand-separator header-class="bgc-riesgo text-white" expand-icon-class="text-white"
              label="Riesgo Conceptos con Clave 01010101 - Recibidos">
              <ReporteRiesgoConceptosRecibidos></ReporteRiesgoConceptosRecibidos>
            </q-expansion-item>
            <q-expansion-item expand-separator header-class="bgc-riesgo text-white" expand-icon-class="text-white"
              label="PUE 99 - Emitidos">
              <ReportePUE99Emitidos></ReportePUE99Emitidos>
            </q-expansion-item>
            <q-expansion-item expand-separator header-class="bgc-riesgo text-white" expand-icon-class="text-white"
              label="PUE 99 - Recibidos">
              <ReportePUE99Recibidos></ReportePUE99Recibidos>
            </q-expansion-item>
            <q-expansion-item expand-separator header-class="bgc-riesgo text-white" expand-icon-class="text-white"
              label="PUE 30 - Emitidos">
              <ReportePUE30Emitidos></ReportePUE30Emitidos>
            </q-expansion-item>
            <q-expansion-item expand-separator header-class="bgc-riesgo text-white" expand-icon-class="text-white"
              label="PUES 30 - Recibidos">
              <ReportePUE30Recibidos></ReportePUE30Recibidos>
            </q-expansion-item>
            <q-expansion-item expand-separator header-class="bgc-riesgo text-white" expand-icon-class="text-white"
              label="Pagos Fuera de Tiempo - Emitidos">
              <ReportePagoFueraTiempoEmitidos></ReportePagoFueraTiempoEmitidos>
            </q-expansion-item>
            <q-expansion-item expand-separator header-class="bgc-riesgo text-white" expand-icon-class="text-white"
              label="Pagos Fuera de Tiempo - Recibidos">
              <ReportePagoFueraTiempoRecibidos></ReportePagoFueraTiempoRecibidos>
            </q-expansion-item>
            <q-expansion-item expand-separator header-class="bgc-riesgo text-white" expand-icon-class="text-white"
              label="Pagos Antes de Comprobante - Emitidos">
              <ReportePagoAntesComprobanteEmitidos></ReportePagoAntesComprobanteEmitidos>
            </q-expansion-item>
            <q-expansion-item expand-separator header-class="bgc-riesgo text-white" expand-icon-class="text-white"
              label="Pagos Antes de Comprobante - Recibidos">
              <ReportePagoAntesComprobanteRecibidos></ReportePagoAntesComprobanteRecibidos>
            </q-expansion-item>
          </q-tab-panel>

          <q-tab-panel name="impuestos">
            <q-expansion-item default-opened expand-separator header-class="bgc-impuestos text-white"
              expand-icon-class="text-white" label="Reporte IVA">
              <ReporteIVA></ReporteIVA>
            </q-expansion-item>
            <q-expansion-item expand-separator header-class="bgc-impuestos text-white" expand-icon-class="text-white"
              label="IVA Retenido - Emitidos">
              <ReporteIVARetenidoEmitidos></ReporteIVARetenidoEmitidos>
            </q-expansion-item>
            <q-expansion-item expand-separator header-class="bgc-impuestos text-white" expand-icon-class="text-white"
              label="IVA Retenido - Recibidos">
              <ReporteIVARetenidoRecibidos></ReporteIVARetenidoRecibidos>
            </q-expansion-item>
            <q-expansion-item expand-separator header-class="bgc-impuestos text-white" expand-icon-class="text-white"
              label="ISR Nómina">
              <ReporteISRNomina></ReporteISRNomina>
            </q-expansion-item>
            <q-expansion-item expand-separator header-class="bgc-impuestos text-white" expand-icon-class="text-white"
              label="Retenciones ISR">
              <ReporteRetencionesISR></ReporteRetencionesISR>
            </q-expansion-item>
            <q-expansion-item expand-separator header-class="bgc-impuestos text-white" expand-icon-class="text-white"
              label="Reporte IEPS">
              <ReporteIEPS></ReporteIEPS>
            </q-expansion-item>
          </q-tab-panel>

          <q-tab-panel name="otros">
            <q-expansion-item default-opened expand-separator header-class="bgc-otros text-white"
              expand-icon-class="text-white" label="Consumo de Combustible - Emitidos">
              <ReporteCombustibleEmitidos></ReporteCombustibleEmitidos>
            </q-expansion-item>
            <q-expansion-item expand-separator header-class="bgc-otros text-white" expand-icon-class="text-white"
              label="Consumo de Combustibles - Recibidos">
              <ReporteCombustibleRecibidos></ReporteCombustibleRecibidos>
            </q-expansion-item>
          </q-tab-panel>
        </q-tab-panels>
      </template>
    </q-splitter>
  </div>
</template>
<script>
  import ReporteCFDI from './CFDI/ReporteCFDI.vue'
  import ReporteEmitidos from './Emitidos/ReporteEmitidos.vue'
  import ReporteEmitidosRFC from './Emitidos/ReporteEmitidosRFC.vue'
  import ReporteFlujoEmitido from './Emitidos/ReporteFlujoEmitido.vue'
  import ReporteCuentasPendientesEmitidos from './Emitidos/ReporteCuentasPendientesEmitidos.vue'
  import ReporteMetodosPagoEmitidos from './Emitidos/ReporteMetodosPagoEmitidos.vue'

  import ReporteRecibidos from './Recibidos/ReporteRecibidos.vue'
  import ReporteRecibidosRFC from './Recibidos/ReporteRecibidosRFC.vue'
  import ReporteFlujoRecibido from './Recibidos/ReporteFlujoRecibido.vue'
  import ReporteMetodosPagoRecibidos from './Recibidos/ReporteMetodosPagoRecibidos.vue'
  import ReporteCuentasPendientesRecibidos from './Recibidos/ReporteCuentasPendientesRecibidos.vue'

  import ReporteSinImpuestosRecibidos from './RiesgoFiscal/ReporteSinImpuestosRecibidos.vue'
  import ReporteSinImpuestosEmitidos from './RiesgoFiscal/ReporteSinImpuestosEmitidos.vue'
  import ReporteRiesgoConceptosEmitidos from './RiesgoFiscal/ReporteRiesgoConceptosEmitidos.vue'
  import ReporteRiesgoConceptosRecibidos from './RiesgoFiscal/ReporteRiesgoConceptosRecibidos.vue'
  import ReportePUE99Emitidos from './RiesgoFiscal/ReportePUE99Emitidos.vue'
  import ReportePUE99Recibidos from './RiesgoFiscal/ReportePUE99Recibidos.vue'
  import ReportePUE30Emitidos from './RiesgoFiscal/ReportePUE30Emitidos.vue'
  import ReportePUE30Recibidos from './RiesgoFiscal/ReportePUE30Recibidos.vue'
  import ReporteGastosEfectivo from './RiesgoFiscal/ReporteGastosEfectivo.vue'
  import ReporteNotasSinRelacion from './RiesgoFiscal/ReporteNotasSinRelacion.vue'
  import ReporteRiesgoArrendamiento from './RiesgoFiscal/ReporteRiesgoArrendamiento.vue'
  import ReportePagoFueraTiempoEmitidos from './RiesgoFiscal/ReportePagoFueraTiempoEmitidos.vue'
  import ReportePagoFueraTiempoRecibidos from './RiesgoFiscal/ReportePagoFueraTiempoRecibidos.vue'
  import ReportePagoAntesComprobanteEmitidos from './RiesgoFiscal/ReportePagoAntesComprobanteEmitidos.vue'
  import ReportePagoAntesComprobanteRecibidos from './RiesgoFiscal/ReportePagoAntesComprobanteRecibidos.vue'

  import ReporteNominaTimbrada from './Nomina/ReporteNominaTimbrada.vue'
  import ReporteNominaPagada from './Nomina/ReporteNominaPagada.vue'
  import ReporteNominaTrabajadores from './Nomina/ReporteNominaTrabajadores.vue'
  import ReporteNominaConceptos from './Nomina/ReporteNominaConceptos.vue'

  import ReporteIVARetenidoEmitidos from './Impuestos/ReporteIVARetenidoEmitidos.vue'
  import ReporteIVARetenidoRecibidos from './Impuestos/ReporteIVARetenidoRecibidos.vue'
  import ReporteISRNomina from './Impuestos/ReporteISRNomina.vue'
  import ReporteRetencionesISR from './Impuestos/ReporteRetencionesISR.vue'
  import ReporteIEPS from './Impuestos/ReporteIEPS.vue'
  import ReporteIVA from './Impuestos/ReporteIVA.vue'

  import ReporteCombustibleEmitidos from './Otros/ReporteCombustibleEmitidos.vue'
  import ReporteCombustibleRecibidos from './Otros/ReporteCombustibleRecibidos.vue'

  export default {
    components: {
      ReporteCFDI,

      ReporteEmitidos,
      ReporteEmitidosRFC,
      ReporteFlujoEmitido,
      ReporteCuentasPendientesEmitidos,
      ReporteMetodosPagoEmitidos,

      ReporteRecibidos,
      ReporteRecibidosRFC,
      ReporteFlujoRecibido,
      ReporteMetodosPagoRecibidos,
      ReporteCuentasPendientesRecibidos,

      ReporteSinImpuestosRecibidos,
      ReporteSinImpuestosEmitidos,
      ReporteRiesgoConceptosEmitidos,
      ReporteRiesgoConceptosRecibidos,
      ReportePUE99Emitidos,
      ReportePUE99Recibidos,
      ReportePUE30Emitidos,
      ReportePUE30Recibidos,
      ReporteGastosEfectivo,
      ReporteNotasSinRelacion,
      ReporteRiesgoArrendamiento,
      ReportePagoFueraTiempoEmitidos,
      ReportePagoFueraTiempoRecibidos,
      ReportePagoAntesComprobanteEmitidos,
      ReportePagoAntesComprobanteRecibidos,

      ReporteNominaTimbrada,
      ReporteNominaPagada,
      ReporteNominaTrabajadores,
      ReporteNominaConceptos,

      ReporteIVARetenidoEmitidos,
      ReporteIVARetenidoRecibidos,
      ReporteISRNomina,
      ReporteRetencionesISR,
      ReporteIEPS,
      ReporteIVA,

      ReporteCombustibleEmitidos,
      ReporteCombustibleRecibidos,
    },
    data() {
      return {
        tab: "cfdi",
        splitterModel: 20,
      };
    },
    computed: {
      empresaStore() {
        return this.$store.state.empresaStore;
      },

    },
  };  
</script>

<style>
  body {
    margin: 0;
    font-family: "Roboto", sans-serif;
    font-size: 14px;
    color: #333;
    background-color: #fff;
  }

  .encabezado {
    /* border-left: 6px solid #e54646; */
    padding: 20px 24px;
    background-color: #fff;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .lado-izquierdo {
    flex: 1 1 60%;
  }

  .titulo {
    font-size: 22px;
    font-weight: 700;
    color: #e54646;
    margin: 0 0 0px;
  }

  .empresa {
    font-size: 24px;
    font-weight: 700;
    color: #222;
    margin: 0 0 0px;
  }

  .rfc {
    font-size: 18px;
    font-weight: 500;
    color: #444;
    margin: 0 0 0px;
  }

  .fecha {
    font-size: 14px;
    color: #666;
    margin-top: 6px;
  }

  .lado-derecho {
    flex: 1 1 35%;
    font-size: 12px;
    color: #555;
    text-align: right;
  }

  .dato {
    margin-bottom: 6px;
  }

  .dato span {
    display: block;
    font-weight: 500;
    color: #333;
  }
</style>