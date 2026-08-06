<template>
  <div class="rg-page">
    <!-- ===================== HEADER / PERIODO ===================== -->
    <q-card flat class="rg-card rg-card--header q-mb-lg full-width">
      <q-card-section>
        <div class="row items-start q-col-gutter-md">
          <div class="col-12 col-sm-8">
            <div class="rg-eyebrow">Reporte financiero</div>
            <div class="rg-title">Configuración del Reporte</div>
            <div class="rg-period" v-if="periodoValido">
              <q-icon name="event" size="16px" class="q-mr-xs" />
              {{ obtenerNombreMes(mesIValue) }} —
              {{ obtenerNombreMes(mesFValue) }} {{ anio }}
            </div>
            <div class="rg-period rg-period--pending" v-else>
              <q-icon name="hourglass_empty" size="16px" class="q-mr-xs" />
              Esperando periodo desde el componente padre...
            </div>
          </div>
          <div class="col-12 col-sm-4 flex items-center justify-end">
            <q-btn
              unelevated
              no-caps
              class="rg-btn-primary full-width"
              icon="summarize"
              label="Generar vista previa"
              :loading="loading"
              :disable="!puedeGenerar"
              @click="generarReporte"
            />
          </div>
        </div>

        <q-separator class="q-my-md rg-separator" />

        <!-- Toggle de secciones -->
        <div class="rg-toggle-label">Secciones a incluir</div>
        <div class="row q-col-gutter-sm">
          <div
            class="col-auto"
            v-for="(val, key) in mostrarSecciones"
            :key="key"
          >
            <q-chip
              clickable
              :selected="mostrarSecciones[key]"
              :class="[
                'rg-chip',
                `rg-chip--${key}`,
                { 'rg-chip--active': mostrarSecciones[key] },
              ]"
              :icon="
                mostrarSecciones[key]
                  ? 'check_circle'
                  : 'radio_button_unchecked'
              "
              @click="mostrarSecciones[key] = !mostrarSecciones[key]"
            >
              {{ labelsSecciones[key] }}
            </q-chip>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <div v-if="reporteGenerado">
      <!-- ===================== RESUMEN KPIs ===================== -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-6 col-md-3">
          <div class="rg-kpi rg-kpi--emitidos">
            <q-icon name="trending_up" class="rg-kpi__icon" />
            <div class="rg-kpi__label">Ingresos (Emitidos)</div>
            <div class="rg-kpi__value">{{ formatoPesos(totalIngresos) }}</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="rg-kpi rg-kpi--recibidos">
            <q-icon name="trending_down" class="rg-kpi__icon" />
            <div class="rg-kpi__label">Egresos (Recibidos)</div>
            <div class="rg-kpi__value">{{ formatoPesos(totalEgresos) }}</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="rg-kpi rg-kpi--nomina">
            <q-icon name="payments" class="rg-kpi__icon" />
            <div class="rg-kpi__label">Nómina Pagada</div>
            <div class="rg-kpi__value">{{ formatoPesos(totalNomina) }}</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="rg-kpi rg-kpi--flujo">
            <q-icon name="swap_horiz" class="rg-kpi__icon" />
            <div class="rg-kpi__label">Dif. Flujo PUE</div>
            <div class="rg-kpi__value">
              {{ formatoPesos(totalDiferenciaFlujo) }}
            </div>
          </div>
        </div>
      </div>

      <!-- ===================== COMPROBANTES EMITIDOS POR RFC ===================== -->
      <q-card
        flat
        class="rg-card rg-section rg-section--emitidos q-mb-md full-width"
        v-if="mostrarSecciones.emitidos"
      >
        <q-card-section class="rg-section__header">
          <q-icon name="north_east" class="rg-section__icon" />
          <div>
            <div class="rg-section__title">Comprobantes Emitidos por RFC</div>
            <div class="rg-section__subtitle">
              {{ tablaComprobantesEmitidos.length }} registros
            </div>
          </div>
        </q-card-section>
        <q-table
          :data="tablaComprobantesEmitidos"
          :columns="columnasComprobantesRfc"
          row-key="rfc"
          dense
          flat
          class="rg-table"
          :pagination="{ rowsPerPage: 10 }"
        >
          <template v-slot:body-cell-importeI="props">
            <q-td :props="props" class="rg-cell-money">{{
              formatoPesos(props.row.importeI)
            }}</q-td>
          </template>
          <template v-slot:body-cell-importeE="props">
            <q-td :props="props" class="rg-cell-money">{{
              formatoPesos(props.row.importeE)
            }}</q-td>
          </template>
        </q-table>
      </q-card>

      <!-- ===================== COMPROBANTES RECIBIDOS POR RFC ===================== -->
      <q-card
        flat
        class="rg-card rg-section rg-section--recibidos q-mb-md full-width"
        v-if="mostrarSecciones.recibidos"
      >
        <q-card-section class="rg-section__header">
          <q-icon name="south_west" class="rg-section__icon" />
          <div>
            <div class="rg-section__title">Comprobantes Recibidos por RFC</div>
            <div class="rg-section__subtitle">
              {{ tablaComprobantesRecibidos.length }} registros
            </div>
          </div>
        </q-card-section>
        <q-table
          :data="tablaComprobantesRecibidos"
          :columns="columnasComprobantesRfc"
          row-key="rfc"
          dense
          flat
          class="rg-table"
          :pagination="{ rowsPerPage: 10 }"
        >
          <template v-slot:body-cell-importeI="props">
            <q-td :props="props" class="rg-cell-money">{{
              formatoPesos(props.row.importeI)
            }}</q-td>
          </template>
          <template v-slot:body-cell-importeE="props">
            <q-td :props="props" class="rg-cell-money">{{
              formatoPesos(props.row.importeE)
            }}</q-td>
          </template>
        </q-table>
      </q-card>

      <!-- ===================== NOMINA - IMPORTES ===================== -->
      <q-card
        flat
        class="rg-card rg-section rg-section--nomina q-mb-md full-width"
        v-if="mostrarSecciones.nomina"
      >
        <q-card-section class="rg-section__header">
          <q-icon name="payments" class="rg-section__icon" />
          <div>
            <div class="rg-section__title">Nómina Pagada</div>
            <div class="rg-section__subtitle">Importes por mes</div>
          </div>
        </q-card-section>
        <q-table
          :data="tablaNominas"
          :columns="columnasNomina"
          row-key="mes"
          dense
          flat
          hide-bottom
          class="rg-table"
          :pagination="{ rowsPerPage: 0 }"
        >
          <template v-slot:body-cell-percepciones="props">
            <q-td :props="props" class="rg-cell-money">{{
              formatoPesos(props.row.percepciones)
            }}</q-td>
          </template>
          <template v-slot:body-cell-deducciones="props">
            <q-td :props="props" class="rg-cell-money">{{
              formatoPesos(props.row.deducciones)
            }}</q-td>
          </template>
          <template v-slot:body-cell-otrosPagos="props">
            <q-td :props="props" class="rg-cell-money">{{
              formatoPesos(props.row.otrosPagos)
            }}</q-td>
          </template>
          <template v-slot:body-cell-total="props">
            <q-td :props="props" class="rg-cell-money rg-cell-strong">{{
              formatoPesos(props.row.total)
            }}</q-td>
          </template>
        </q-table>

        <!-- CONCEPTOS DE NOMINA, POR MES -->
        <q-separator class="rg-separator" />
        <q-card-section>
          <div class="rg-subheading q-mb-sm">
            <q-icon name="receipt_long" size="18px" class="q-mr-xs" />
            Conceptos por mes
          </div>
          <q-expansion-item
            v-for="(conceptos, mes) in tablaNominaConceptos"
            :key="mes"
            :label="mes"
            group="conceptosNomina"
            dense
            class="rg-expansion"
            header-class="rg-expansion__header"
          >
            <q-table
              v-if="conceptosArray(conceptos).length > 0"
              :data="conceptosArray(conceptos)"
              :columns="columnasConceptosNomina"
              row-key="clave"
              dense
              flat
              hide-bottom
              class="rg-table rg-table--nested"
              :pagination="{ rowsPerPage: 0 }"
            >
              <template v-slot:body-cell-importe="props">
                <q-td :props="props" class="rg-cell-money">{{
                  formatoPesos(props.row.importe)
                }}</q-td>
              </template>
            </q-table>
            <div v-else class="rg-empty-note">Sin conceptos para este mes.</div>
          </q-expansion-item>
        </q-card-section>
      </q-card>

      <!-- ===================== CUENTAS POR COBRAR ===================== -->
      <q-card
        flat
        class="rg-card rg-section rg-section--cxc q-mb-md full-width"
        v-if="mostrarSecciones.cxc"
      >
        <q-card-section class="rg-section__header">
          <q-icon name="account_balance_wallet" class="rg-section__icon" />
          <div>
            <div class="rg-section__title">Cuentas por Cobrar</div>
            <div class="rg-section__subtitle">
              {{ tablaCxC.length }} comprobantes
            </div>
          </div>
        </q-card-section>
        <q-table
          :data="tablaCxC"
          :columns="columnasCxC"
          row-key="folioFiscal"
          dense
          flat
          class="rg-table"
          :pagination="{ rowsPerPage: 10 }"
        >
          <template v-slot:body-cell-porCobrar="props">
            <q-td :props="props" class="rg-cell-money">{{
              formatoPesos(props.row.porCobrar, props.row.moneda)
            }}</q-td>
          </template>
          <template v-slot:body-cell-cobrado="props">
            <q-td :props="props" class="rg-cell-money">{{
              formatoPesos(props.row.cobrado, props.row.moneda)
            }}</q-td>
          </template>
          <template v-slot:body-cell-total="props">
            <q-td :props="props" class="rg-cell-money rg-cell-strong">{{
              formatoPesos(props.row.total, props.row.moneda)
            }}</q-td>
          </template>
          <template v-slot:body-cell-dias="props">
            <q-td :props="props">
              <q-badge :color="colorDias(props.row.dias)" class="rg-badge"
                >{{ props.row.dias }} días</q-badge
              >
            </q-td>
          </template>
        </q-table>
      </q-card>

      <!-- ===================== CUENTAS POR PAGAR ===================== -->
      <q-card
        flat
        class="rg-card rg-section rg-section--cxp q-mb-md full-width"
        v-if="mostrarSecciones.cxp"
      >
        <q-card-section class="rg-section__header">
          <q-icon name="credit_card" class="rg-section__icon" />
          <div>
            <div class="rg-section__title">Cuentas por Pagar</div>
            <div class="rg-section__subtitle">
              {{ tablaCxP.length }} comprobantes
            </div>
          </div>
        </q-card-section>
        <q-table
          :data="tablaCxP"
          :columns="columnasCxP"
          row-key="folioFiscal"
          dense
          flat
          class="rg-table"
          :pagination="{ rowsPerPage: 10 }"
        >
          <template v-slot:body-cell-porPagar="props">
            <q-td :props="props" class="rg-cell-money">{{
              formatoPesos(props.row.porPagar, props.row.moneda)
            }}</q-td>
          </template>
          <template v-slot:body-cell-pagado="props">
            <q-td :props="props" class="rg-cell-money">{{
              formatoPesos(props.row.pagado, props.row.moneda)
            }}</q-td>
          </template>
          <template v-slot:body-cell-total="props">
            <q-td :props="props" class="rg-cell-money rg-cell-strong">{{
              formatoPesos(props.row.total, props.row.moneda)
            }}</q-td>
          </template>
          <template v-slot:body-cell-dias="props">
            <q-td :props="props">
              <q-badge :color="colorDias(props.row.dias)" class="rg-badge"
                >{{ props.row.dias }} días</q-badge
              >
            </q-td>
          </template>
        </q-table>
      </q-card>

      <!-- ===================== COMPARATIVA DE FLUJO (UNA TABLA POR MONEDA) ===================== -->
      <q-card
        flat
        class="rg-card rg-section rg-section--flujo q-mb-md full-width"
        v-if="mostrarSecciones.flujo"
      >
        <q-card-section class="rg-section__header">
          <q-icon name="swap_horiz" class="rg-section__icon" />
          <div>
            <div class="rg-section__title">Comparativa de Flujo (PUE)</div>
            <div class="rg-section__subtitle">
              Emitido vs. recibido, por moneda
            </div>
          </div>
        </q-card-section>

        <template v-if="comparativaFlujoPorMoneda.length > 0">
          <div
            v-for="(grupo, idx) in comparativaFlujoPorMoneda"
            :key="grupo.moneda"
          >
            <q-card-section class="rg-currency-header">
              <q-icon name="paid" size="16px" class="q-mr-xs" />
              {{ grupo.moneda }}
            </q-card-section>
            <q-table
              :data="grupo.filas"
              :columns="columnasComparativaFlujo"
              row-key="mes"
              dense
              flat
              hide-bottom
              class="rg-table"
              :pagination="{ rowsPerPage: 0 }"
            >
              <template v-slot:body-cell-totalEPUE="props">
                <q-td :props="props" class="rg-cell-money">{{
                  formatoPesos(props.row.totalEPUE, props.row.moneda)
                }}</q-td>
              </template>
              <template v-slot:body-cell-totalRPUE="props">
                <q-td :props="props" class="rg-cell-money">{{
                  formatoPesos(props.row.totalRPUE, props.row.moneda)
                }}</q-td>
              </template>
              <template v-slot:body-cell-diferenciaPUE="props">
                <q-td :props="props" class="rg-cell-money rg-cell-strong">
                  <span
                    :class="
                      props.row.diferenciaPUE >= 0
                        ? 'rg-positive'
                        : 'rg-negative'
                    "
                  >
                    {{
                      formatoPesos(props.row.diferenciaPUE, props.row.moneda)
                    }}
                  </span>
                </q-td>
              </template>
            </q-table>
            <q-separator
              v-if="idx < comparativaFlujoPorMoneda.length - 1"
              class="rg-separator q-my-sm"
            />
          </div>
        </template>
        <q-card-section v-else class="rg-empty-note">
          Sin datos de flujo para el periodo seleccionado.
        </q-card-section>
      </q-card>

      <!-- ===================== USO DE CFDI ===================== -->
      <q-card
        flat
        class="rg-card rg-section rg-section--usocfdi q-mb-md full-width"
        v-if="mostrarSecciones.usoCfdi"
      >
        <q-card-section class="rg-section__header">
          <q-icon name="sell" class="rg-section__icon" />
          <div>
            <div class="rg-section__title">Reporte por Uso de CFDI</div>
            <div class="rg-section__subtitle">
              Emitidos / Recibidos / Nómina por clave de uso
            </div>
          </div>
        </q-card-section>
        <q-table
          v-if="tablaUsoCfdi.length > 0"
          :data="tablaUsoCfdi"
          :columns="columnasUsoCfdi"
          row-key="uso"
          dense
          flat
          hide-bottom
          class="rg-table"
          :pagination="{ rowsPerPage: 0 }"
        >
          <template v-slot:body-cell-emitidos="props">
            <q-td :props="props" class="rg-cell-money">{{
              formatoPesos(props.row.emitidos)
            }}</q-td>
          </template>
          <template v-slot:body-cell-recibidos="props">
            <q-td :props="props" class="rg-cell-money">{{
              formatoPesos(props.row.recibidos)
            }}</q-td>
          </template>
          <template v-slot:body-cell-nomina="props">
            <q-td :props="props" class="rg-cell-money">{{
              formatoPesos(props.row.nomina)
            }}</q-td>
          </template>
        </q-table>
        <q-card-section v-else class="rg-empty-note">
          Sin datos de uso de CFDI para el periodo seleccionado.
        </q-card-section>
        <q-card-section
          v-if="tablaUsoCfdi.length > 0"
          class="rg-currency-header justify-end"
        >
          Diferencia (Emitidos − Recibidos − Nómina):
          {{ formatoPesos(diferenciaUsoCfdi) }}
        </q-card-section>
      </q-card>

      <!-- ===================== COMPARATIVA ANUAL ===================== -->
      <q-card
        flat
        class="rg-card rg-section rg-section--comparativaanual q-mb-md full-width"
        v-if="mostrarSecciones.comparativaAnual"
      >
        <q-card-section class="rg-section__header">
          <q-icon name="fact_check" class="rg-section__icon" />
          <div>
            <div class="rg-section__title">Comparativa Anual</div>
            <div class="rg-section__subtitle">
              Determinado (Uso de CFDI {{ anio }}) vs. Declarado (Declaración
              Anual SAT)
            </div>
          </div>
        </q-card-section>

        <q-table
          v-if="tablaComparativaAnual.length > 0"
          :data="tablaComparativaAnual"
          :columns="columnasComparativaAnual"
          row-key="concepto"
          dense
          flat
          hide-bottom
          class="rg-table"
          :pagination="{ rowsPerPage: 0 }"
        >
          <template v-slot:body-cell-determinado="props">
            <q-td :props="props" class="rg-cell-money">
              <span v-if="props.row.tipo === 'porcentaje'">{{
                formatoPorcentaje(props.row.determinado * 100)
              }}</span>
              <span v-else>{{ formatoPesos(props.row.determinado) }}</span>
            </q-td>
          </template>
          <template v-slot:body-cell-declarado="props">
            <q-td :props="props" class="rg-cell-money">
              <span
                v-if="
                  props.row.declarado === null ||
                  props.row.declarado === undefined
                "
                >—</span
              >
              <span v-else-if="props.row.tipo === 'porcentaje'">{{
                formatoPorcentaje(props.row.declarado * 100)
              }}</span>
              <span v-else>{{ formatoPesos(props.row.declarado) }}</span>
            </q-td>
          </template>
          <template v-slot:body-cell-diferencia="props">
            <q-td :props="props" class="rg-cell-money rg-cell-strong">
              <span
                v-if="
                  props.row.diferencia === null ||
                  props.row.diferencia === undefined
                "
                >—</span
              >
              <span
                v-else-if="props.row.tipo === 'porcentaje'"
                :class="
                  Math.abs(props.row.diferencia) < 0.0001
                    ? ''
                    : props.row.diferencia >= 0
                    ? 'rg-positive'
                    : 'rg-negative'
                "
              >
                {{ formatoPorcentaje(props.row.diferencia * 100) }}
              </span>
              <span
                v-else
                :class="
                  Math.abs(props.row.diferencia) < 1
                    ? ''
                    : props.row.diferencia >= 0
                    ? 'rg-positive'
                    : 'rg-negative'
                "
              >
                {{ formatoPesos(props.row.diferencia) }}
              </span>
            </q-td>
          </template>
        </q-table>
        <q-card-section v-else class="rg-empty-note">
          Sin datos suficientes para la Comparativa Anual.
        </q-card-section>
        <q-card-section v-if="comparativaAnualMensaje" class="rg-empty-note">
          <q-icon name="info" size="16px" class="q-mr-xs" />{{
            comparativaAnualMensaje
          }}
        </q-card-section>
      </q-card>

      <!-- ===================== RAZONES FINANCIERAS ===================== -->
      <q-card
        flat
        class="rg-card rg-section rg-section--razonesfinancieras q-mb-md full-width"
        v-if="mostrarSecciones.razonesFinancieras"
      >
        <q-card-section class="rg-section__header">
          <q-icon name="monitor_heart" class="rg-section__icon" />
          <div>
            <div class="rg-section__title">Razones Financieras</div>
            <div class="rg-section__subtitle">
              Ejercicio {{ anio - 1 }} · Balance General y Estado de Resultados
              (Declaración Anual SAT)
            </div>
          </div>
        </q-card-section>

        <template v-if="razonesFinancieras.resumen">
          <!-- Salud financiera general -->
          <q-card-section class="row items-center q-col-gutter-md">
            <div class="col-12 col-sm-4 text-center">
              <div
                class="rg-salud-valor"
                :class="'rg-salud-valor--' + saludColorClase"
              >
                {{
                  (razonesFinancieras.resumen.porcentajeSalud * 100).toFixed(0)
                }}%
              </div>
              <div class="rg-toggle-label">Salud Financiera General</div>
            </div>
            <div class="col-12 col-sm-8">
              <p class="rg-parrafo-veredicto">
                {{ razonesFinancieras.resumen.veredicto }}
              </p>
              <div class="row q-col-gutter-sm">
                <div class="col-auto">
                  <q-badge
                    color="green"
                    :label="razonesFinancieras.resumen.buenas + ' Buenas'"
                  />
                </div>
                <div class="col-auto">
                  <q-badge
                    color="orange"
                    :label="razonesFinancieras.resumen.regulares + ' Regulares'"
                  />
                </div>
                <div class="col-auto">
                  <q-badge
                    color="red"
                    :label="razonesFinancieras.resumen.malas + ' de Atención'"
                  />
                </div>
              </div>
            </div>
          </q-card-section>

          <q-separator class="rg-separator" />

          <!-- Tabla por categoría -->
          <q-card-section
            v-for="cat in razonesFinancieras.categorias"
            :key="cat.categoria"
          >
            <div class="rg-subheading q-mb-sm">{{ cat.categoria }}</div>
            <q-table
              :data="cat.items"
              :columns="columnasRazonesFinancieras"
              row-key="nombre"
              dense
              flat
              hide-bottom
              class="rg-table"
              :pagination="{ rowsPerPage: 0 }"
            >
              <template v-slot:body-cell-valor="props">
                <q-td :props="props" class="rg-cell-money rg-cell-strong">
                  {{ formatoValorRazon(props.row.valor, props.row.formato) }}
                </q-td>
              </template>
              <template v-slot:body-cell-estado="props">
                <q-td :props="props">
                  <q-badge
                    :style="{ backgroundColor: props.row.color }"
                    :label="props.row.estado.toUpperCase()"
                  />
                </q-td>
              </template>
            </q-table>
          </q-card-section>

          <q-card-section
            v-if="razonesFinancieras.advertencias.length > 0"
            class="rg-empty-note"
          >
            <q-icon name="warning" size="16px" class="q-mr-xs" />
            Estos datos vinieron en blanco en el Excel y se tomaron como $0:
            {{ razonesFinancieras.advertencias.join(", ") }}
          </q-card-section>
        </template>
        <q-card-section v-else class="rg-empty-note">
          <q-icon name="info" size="16px" class="q-mr-xs" />
          {{
            razonesFinancieras.mensaje ||
            "Sin datos suficientes para calcular las Razones Financieras."
          }}
        </q-card-section>
      </q-card>

      <!-- ===================== PAGOS DE IVA ===================== -->
      <q-card
        flat
        class="rg-card rg-section rg-section--pagosiva q-mb-md full-width"
        v-if="mostrarSecciones.pagosIva"
      >
        <q-card-section class="rg-section__header">
          <q-icon name="request_quote" class="rg-section__icon" />
          <div>
            <div class="rg-section__title">Pagos de IVA</div>
            <div class="rg-section__subtitle">
              Enero — {{ obtenerNombreMes(mesFValue) }} {{ anio }} (acumulado)
            </div>
          </div>
        </q-card-section>
        <q-table
          v-if="tablaPagosIva.length > 0"
          :data="tablaPagosIva"
          :columns="columnasPagosIva"
          row-key="mes"
          dense
          flat
          hide-bottom
          class="rg-table"
          :pagination="{ rowsPerPage: 0 }"
        >
          <template v-slot:body-cell-baseIvaTrasladado="props">
            <q-td :props="props" class="rg-cell-money">{{
              formatoPesos(props.row.baseIvaTrasladado)
            }}</q-td>
          </template>
          <template v-slot:body-cell-importeIvaTrasladado="props">
            <q-td :props="props" class="rg-cell-money">{{
              formatoPesos(props.row.importeIvaTrasladado)
            }}</q-td>
          </template>
          <template v-slot:body-cell-baseIvaAcreditado="props">
            <q-td :props="props" class="rg-cell-money">{{
              formatoPesos(props.row.baseIvaAcreditado)
            }}</q-td>
          </template>
          <template v-slot:body-cell-importeIvaAcreditado="props">
            <q-td :props="props" class="rg-cell-money">{{
              formatoPesos(props.row.importeIvaAcreditado)
            }}</q-td>
          </template>
          <template v-slot:body-cell-ivaRetenido="props">
            <q-td :props="props" class="rg-cell-money">{{
              formatoPesos(props.row.ivaRetenido)
            }}</q-td>
          </template>
          <template v-slot:body-cell-ivaRetenidoAnterior="props">
            <q-td :props="props" class="rg-cell-money">{{
              formatoPesos(props.row.ivaRetenidoAnterior)
            }}</q-td>
          </template>
          <template v-slot:body-cell-ivaCargo="props">
            <q-td :props="props" class="rg-cell-money rg-cell-strong">
              <span class="rg-negative">{{
                formatoPesos(props.row.ivaCargo)
              }}</span>
            </q-td>
          </template>
          <template v-slot:body-cell-ivaFavor="props">
            <q-td :props="props" class="rg-cell-money rg-cell-strong">
              <span class="rg-positive">{{
                formatoPesos(props.row.ivaFavor)
              }}</span>
            </q-td>
          </template>
          <template v-slot:body-cell-cargoRegistrado="props">
            <q-td :props="props" class="rg-cell-money">{{
              formatoPesos(props.row.cargoRegistrado)
            }}</q-td>
          </template>
          <template v-slot:body-cell-favorRegistrado="props">
            <q-td :props="props" class="rg-cell-money">{{
              formatoPesos(props.row.favorRegistrado)
            }}</q-td>
          </template>
          <template v-slot:body-cell-comparativa="props">
            <q-td :props="props" class="rg-cell-money rg-cell-strong">
              <span
                :class="
                  props.row.comparativa >= 0 ? 'rg-positive' : 'rg-negative'
                "
              >
                {{ formatoPesos(props.row.comparativa) }}
              </span>
            </q-td>
          </template>
        </q-table>
        <q-card-section v-else class="rg-empty-note">
          Sin datos de IVA para el periodo seleccionado.
        </q-card-section>
      </q-card>

      <!-- ===================== RETENCIONES DE ISR ===================== -->
      <q-card
        flat
        class="rg-card rg-section rg-section--pagosisr q-mb-md full-width"
        v-if="mostrarSecciones.pagosIsr"
      >
        <q-card-section class="rg-section__header">
          <q-icon name="gavel" class="rg-section__icon" />
          <div>
            <div class="rg-section__title">Retenciones de ISR</div>
            <div class="rg-section__subtitle">
              Enero — {{ obtenerNombreMes(mesFValue) }} {{ anio }} (acumulado)
            </div>
          </div>
        </q-card-section>

        <div v-for="(cat, idx) in categoriasIsr" :key="cat.key">
          <q-card-section class="rg-currency-header">
            <q-icon name="folder_open" size="16px" class="q-mr-xs" />
            {{ cat.label }}
          </q-card-section>
          <q-table
            v-if="tablaPagosIsr[cat.key].length > 0"
            :data="tablaPagosIsr[cat.key]"
            :columns="columnasPagosIsr"
            row-key="mes"
            dense
            flat
            hide-bottom
            class="rg-table"
            :pagination="{ rowsPerPage: 0 }"
          >
            <template v-slot:body-cell-importe="props">
              <q-td :props="props" class="rg-cell-money">{{
                formatoPesos(props.row.importe)
              }}</q-td>
            </template>
            <template v-slot:body-cell-comparativa="props">
              <q-td :props="props" class="rg-cell-money">{{
                formatoPesos(props.row.comparativa)
              }}</q-td>
            </template>
            <template v-slot:body-cell-diferencia="props">
              <q-td :props="props" class="rg-cell-money rg-cell-strong">
                <span
                  :class="
                    props.row.diferencia >= 0 ? 'rg-positive' : 'rg-negative'
                  "
                >
                  {{ formatoPesos(props.row.diferencia) }}
                </span>
              </q-td>
            </template>
          </q-table>
          <div v-else class="rg-empty-note">Sin datos para esta categoría.</div>
          <q-separator
            v-if="idx < categoriasIsr.length - 1"
            class="rg-separator q-my-sm"
          />
        </div>
      </q-card>

      <!-- ===================== PAGOS PROVISIONALES DE ISR ===================== -->
      <q-card
        flat
        class="rg-card rg-section rg-section--pp q-mb-md full-width"
        v-if="mostrarSecciones.pagosProvisionales"
      >
        <q-card-section class="rg-section__header">
          <q-icon name="account_balance" class="rg-section__icon" />
          <div>
            <div class="rg-section__title">Pagos Provisionales de ISR</div>
            <div
              class="rg-section__subtitle"
              v-if="tablaPagosProvisionales.regimenLabel"
            >
              {{ tablaPagosProvisionales.regimenLabel }} · Enero —
              {{ obtenerNombreMes(mesFValue) }} {{ anio }}
            </div>
            <div class="rg-section__subtitle" v-else>
              Enero — {{ obtenerNombreMes(mesFValue) }} {{ anio }} (acumulado)
            </div>
          </div>
        </q-card-section>

        <q-table
          v-if="tablaPagosProvisionales.filas.length > 0"
          :data="tablaPagosProvisionales.filas"
          :columns="tablaPagosProvisionales.columnas"
          row-key="mes"
          dense
          flat
          hide-bottom
          class="rg-table"
          :pagination="{ rowsPerPage: 0 }"
        >
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                :class="col.tipo === 'moneda' ? 'rg-cell-money' : ''"
              >
                <span v-if="col.tipo === 'moneda'">{{
                  formatoPesos(props.row[col.field])
                }}</span>
                <span v-else-if="col.tipo === 'porcentaje'">{{
                  formatoPorcentaje(props.row[col.field])
                }}</span>
                <span v-else>{{ props.row[col.field] }}</span>
              </q-td>
            </q-tr>
          </template>
        </q-table>
        <q-card-section v-else class="rg-empty-note">
          {{
            tablaPagosProvisionales.mensaje ||
            "Sin datos de pagos provisionales para el periodo seleccionado."
          }}
        </q-card-section>
      </q-card>

      <!-- ===================== ACCION PDF ===================== -->
      <div class="row justify-end q-mt-lg">
        <q-btn
          unelevated
          no-caps
          class="rg-btn-pdf"
          icon="picture_as_pdf"
          label="Generar PDF"
          @click="generarPdf"
        />
      </div>
    </div>
  </div>
</template>
<script>
import axios from "axios";
import moment from "moment";
import * as xlsx from "xlsx";
import { generarPdfReporteGeneral } from "./pdfReporteGeneral";
import { obtenerDeterminacionAnualDeclarada } from "./obtenerDeclaracionAnualDeclarada";
import { obtenerRazonesFinancieras } from "./obtenerRazonesFinancieras";

export default {
  name: "ReporteGeneralPreview",
  props: {
    // Vienen del componente padre, conectados al store (Vuex)
    anio: {
      type: [String, Number],
      default: null,
    },
    // Acepta tanto number (1-12) como objeto { label, value } por si el padre
    // manda el item completo de itemsMes tal cual lo tiene en el store
    mesI: {
      type: [Number, Object],
      default: null,
    },
    mesF: {
      type: [Number, Object],
      default: null,
    },
    // Si true, genera automáticamente cada vez que cambie el periodo
    autoGenerar: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      loading: false,
      reporteGenerado: false,

      // Solo se usa internamente para traducir número de mes -> nombre
      itemsMes: [
        { label: "ENERO", value: 1 },
        { label: "FEBRERO", value: 2 },
        { label: "MARZO", value: 3 },
        { label: "ABRIL", value: 4 },
        { label: "MAYO", value: 5 },
        { label: "JUNIO", value: 6 },
        { label: "JULIO", value: 7 },
        { label: "AGOSTO", value: 8 },
        { label: "SEPTIEMBRE", value: 9 },
        { label: "OCTUBRE", value: 10 },
        { label: "NOVIEMBRE", value: 11 },
        { label: "DICIEMBRE", value: 12 },
      ],

      mostrarSecciones: {
        emitidos: true,
        recibidos: true,
        nomina: true,
        cxc: true,
        cxp: true,
        flujo: true,
        pagosIva: true,
        pagosIsr: true,
        pagosProvisionales: true,
        usoCfdi: true,
        comparativaAnual: true,
        razonesFinancieras: true,
      },
      labelsSecciones: {
        emitidos: "Emitidos por RFC",
        recibidos: "Recibidos por RFC",
        nomina: "Nómina",
        cxc: "Cuentas por Cobrar",
        cxp: "Cuentas por Pagar",
        flujo: "Comparativa de Flujo",
        pagosIva: "Pagos de IVA",
        pagosIsr: "Retenciones de ISR",
        pagosProvisionales: "Pagos Provisionales",
        usoCfdi: "Uso de CFDI",
        comparativaAnual: "Comparativa Anual",
        razonesFinancieras: "Razones Financieras",
      },

      // ---- datos crudos / procesados ----
      tablaComprobantesEmitidos: [],
      tablaComprobantesRecibidos: [],
      tablaNominas: [],
      tablaNominaConceptos: {},
      tablaCxC: [],
      tablaCxP: [],
      tablaComparativaFlujo: [],
      tablaPagosIva: [],
      tablaPagosIsr: {
        sueldos: [],
        asimilados: [],
        otros: [],
        arrendamientos: [],
        honorarios: [],
        demasIngresos: [],
        isrRetenidoFavor: [],
      },
      categoriasIsr: [
        { key: "sueldos", label: "Sueldos y Salarios" },
        { key: "asimilados", label: "Asimilados" },
        { key: "otros", label: "Otros" },
        { key: "arrendamientos", label: "Arrendamientos" },
        { key: "honorarios", label: "Honorarios" },
        { key: "demasIngresos", label: "Demás Ingresos" },
        { key: "isrRetenidoFavor", label: "ISR Retenido a Favor" },
      ],
      // Columnas dinámicas: cambian según el régimen fiscal detectado
      // (General Moral, Física Actividad Empresarial, RESICO Física/Moral, AC/SC)
      tablaPagosProvisionales: {
        columnas: [],
        filas: [],
        mensaje: "",
        regimenLabel: "",
      },
      tablaUsoCfdi: [],
      columnasUsoCfdi: [
        { name: "uso", label: "Uso del CFDI", field: "uso", align: "left" },
        {
          name: "emitidos",
          label: "Emitidos",
          field: "emitidos",
          align: "right",
        },
        {
          name: "recibidos",
          label: "Recibidos",
          field: "recibidos",
          align: "right",
        },
        { name: "nomina", label: "Nómina", field: "nomina", align: "right" },
      ],
      columnasRazonesFinancieras: [
        { name: "nombre", label: "Razón", field: "nombre", align: "left" },
        { name: "formula", label: "Fórmula", field: "formula", align: "left" },
        { name: "valor", label: "Valor", field: "valor", align: "right" },
        {
          name: "estado",
          label: "Resultado",
          field: "estado",
          align: "center",
        },
      ],
      // Comparativa Anual: "Determinado" (calculado por el sistema con
      // base en Uso de CFDI del año completo) vs "Declarado" (leído del
      // xlsx de la Declaración Anual descargada del SAT).
      tablaComparativaAnual: [],
      comparativaAnualMensaje: "",
      comparativaAnualCargando: false,
      columnasComparativaAnual: [
        {
          name: "concepto",
          label: "Declaración Anual",
          field: "concepto",
          align: "left",
        },
        {
          name: "determinado",
          label: "Determinado",
          field: "determinado",
          align: "right",
        },
        {
          name: "declarado",
          label: "Declarado",
          field: "declarado",
          align: "right",
        },
        {
          name: "diferencia",
          label: "Diferencia",
          field: "diferencia",
          align: "right",
        },
      ],
      // Razones Financieras: se calculan a partir del MISMO xlsx de la
      // Declaración Anual que usa Comparativa Anual (no se sube nada).
      razonesFinancieras: {
        razones: [],
        categorias: [],
        resumen: null,
        advertencias: [],
        mensaje: "",
      },

      // ---- columnas ----
      columnasComprobantesRfc: [
        {
          name: "rfc",
          label: "RFC",
          field: "rfc",
          align: "left",
          sortable: true,
        },
        {
          name: "nombre",
          label: "Nombre",
          field: "nombre",
          align: "left",
          sortable: true,
        },
        {
          name: "ingresos",
          label: "# Ingresos",
          field: "ingresos",
          align: "center",
          sortable: true,
        },
        {
          name: "importeI",
          label: "Importe Ingresos",
          field: "importeI",
          align: "right",
          sortable: true,
        },
        {
          name: "egresos",
          label: "# Egresos",
          field: "egresos",
          align: "center",
          sortable: true,
        },
        {
          name: "importeE",
          label: "Importe Egresos",
          field: "importeE",
          align: "right",
          sortable: true,
        },
      ],
      columnasNomina: [
        { name: "mes", label: "Mes", field: "mes", align: "left" },
        {
          name: "contador",
          label: "# Trabajadores",
          field: "contador",
          align: "center",
        },
        {
          name: "percepciones",
          label: "Percepciones",
          field: "percepciones",
          align: "right",
        },
        {
          name: "deducciones",
          label: "Deducciones",
          field: "deducciones",
          align: "right",
        },
        {
          name: "otrosPagos",
          label: "Otros Pagos",
          field: "otrosPagos",
          align: "right",
        },
        { name: "total", label: "Total", field: "total", align: "right" },
      ],
      columnasConceptosNomina: [
        {
          name: "claveSat",
          label: "Clave SAT",
          field: "claveSat",
          align: "left",
        },
        { name: "clave", label: "Clave", field: "clave", align: "center" },
        {
          name: "concepto",
          label: "Concepto",
          field: "concepto",
          align: "left",
        },
        { name: "importe", label: "Importe", field: "importe", align: "right" },
      ],
      columnasCxC: [
        { name: "serie", label: "Serie", field: "serie", align: "center" },
        { name: "folio", label: "Folio", field: "folio", align: "center" },
        {
          name: "fecha",
          label: "Fecha",
          field: (row) => this.formatoFecha(row.fecha),
          align: "left",
        },
        { name: "rfc", label: "RFC", field: "rfc", align: "left" },
        { name: "nombre", label: "Nombre", field: "nombre", align: "left" },
        {
          name: "porCobrar",
          label: "Por Cobrar",
          field: "porCobrar",
          align: "right",
        },
        { name: "cobrado", label: "Cobrado", field: "cobrado", align: "right" },
        { name: "total", label: "Total", field: "total", align: "right" },
        { name: "moneda", label: "Moneda", field: "moneda", align: "center" },
        {
          name: "dias",
          label: "Días de Crédito",
          field: "dias",
          align: "center",
        },
      ],
      columnasCxP: [
        { name: "serie", label: "Serie", field: "serie", align: "center" },
        { name: "folio", label: "Folio", field: "folio", align: "center" },
        {
          name: "fecha",
          label: "Fecha",
          field: (row) => this.formatoFecha(row.fecha),
          align: "left",
        },
        { name: "rfc", label: "RFC", field: "rfc", align: "left" },
        { name: "nombre", label: "Nombre", field: "nombre", align: "left" },
        {
          name: "porPagar",
          label: "Por Pagar",
          field: "porPagar",
          align: "right",
        },
        { name: "pagado", label: "Pagado", field: "pagado", align: "right" },
        { name: "total", label: "Total", field: "total", align: "right" },
        { name: "moneda", label: "Moneda", field: "moneda", align: "center" },
        {
          name: "dias",
          label: "Días de Crédito",
          field: "dias",
          align: "center",
        },
      ],
      columnasComparativaFlujo: [
        { name: "mes", label: "Mes", field: "mes", align: "left" },
        {
          name: "totalEPUE",
          label: "Emitido PUE",
          field: "totalEPUE",
          align: "right",
        },
        {
          name: "totalRPUE",
          label: "Recibido PUE",
          field: "totalRPUE",
          align: "right",
        },
        {
          name: "diferenciaPUE",
          label: "Diferencia",
          field: "diferenciaPUE",
          align: "right",
        },
      ],
      columnasPagosIsr: [
        { name: "mes", label: "Mes", field: "mes", align: "left" },
        { name: "importe", label: "Importe", field: "importe", align: "right" },
        {
          name: "comparativa",
          label: "Comparativa",
          field: "comparativa",
          align: "right",
        },
        {
          name: "diferencia",
          label: "Diferencia",
          field: "diferencia",
          align: "right",
        },
      ],
    };
  },
  computed: {
    rutaAxios() {
      return this.$store.state.rutaMongoStore;
    },
    token() {
      return this.$store.state.usuario;
    },
    // Normaliza mesI/mesF: aceptan number directo u objeto {label, value}
    mesIValue() {
      return this.mesI && typeof this.mesI === "object"
        ? this.mesI.value
        : this.mesI;
    },
    mesFValue() {
      return this.mesF && typeof this.mesF === "object"
        ? this.mesF.value
        : this.mesF;
    },
    periodoValido() {
      return !!this.anio && !!this.mesIValue && !!this.mesFValue;
    },
    puedeGenerar() {
      return this.periodoValido && !this.loading;
    },
    totalIngresos() {
      return this.tablaComprobantesEmitidos.reduce(
        (acc, r) => acc + (r.importeI || 0),
        0
      );
    },
    totalEgresos() {
      return this.tablaComprobantesRecibidos.reduce(
        (acc, r) => acc + (r.importeI || 0),
        0
      );
    },
    totalNomina() {
      return this.tablaNominas.reduce((acc, r) => acc + (r.total || 0), 0);
    },
    totalDiferenciaFlujo() {
      return this.tablaComparativaFlujo.reduce(
        (acc, r) => acc + (r.diferenciaPUE || 0),
        0
      );
    },
    diferenciaUsoCfdi() {
      return this.tablaUsoCfdi.reduce(
        (acc, r) =>
          acc + (r.emitidos || 0) - (r.recibidos || 0) - (r.nomina || 0),
        0
      );
    },
    saludColorClase() {
      const resumen = this.razonesFinancieras.resumen;
      if (!resumen) return "malo";
      if (resumen.porcentajeSalud >= 0.75) return "bueno";
      if (resumen.porcentajeSalud >= 0.5) return "regular";
      return "malo";
    },
    // Agrupa tablaComparativaFlujo (flat, con {moneda, mes, totalEPUE, totalRPUE, diferenciaPUE})
    // en una tabla independiente por cada moneda, ordenada por # de mes calendario.
    comparativaFlujoPorMoneda() {
      const grupos = {};
      this.tablaComparativaFlujo.forEach((fila) => {
        const moneda = fila.moneda || "N/A";
        if (!grupos[moneda]) grupos[moneda] = [];
        grupos[moneda].push(fila);
      });

      const ordenMeses = this.itemsMes.map((m) => m.label);
      return Object.keys(grupos)
        .sort()
        .map((moneda) => ({
          moneda,
          filas: grupos[moneda]
            .slice()
            .sort(
              (a, b) => ordenMeses.indexOf(a.mes) - ordenMeses.indexOf(b.mes)
            ),
        }));
    },
    // Columnas de Pagos de IVA: "IVA Retenido Anterior" solo aplica a personas morales
    // (RFC de 12 caracteres), igual que en el reporte de impuestos original.
    columnasPagosIva() {
      const cols = [
        { name: "mes", label: "Mes", field: "mes", align: "left" },
        {
          name: "baseIvaTrasladado",
          label: "Base IVA Trasladado",
          field: "baseIvaTrasladado",
          align: "right",
        },
        {
          name: "importeIvaTrasladado",
          label: "Importe IVA Trasladado",
          field: "importeIvaTrasladado",
          align: "right",
        },
        {
          name: "baseIvaAcreditado",
          label: "Base IVA Acreditado",
          field: "baseIvaAcreditado",
          align: "right",
        },
        {
          name: "importeIvaAcreditado",
          label: "Importe IVA Acreditado",
          field: "importeIvaAcreditado",
          align: "right",
        },
        {
          name: "ivaRetenido",
          label: "IVA Retenido",
          field: "ivaRetenido",
          align: "right",
        },
      ];
      if (this.token && this.token.rfc && this.token.rfc.length === 12) {
        cols.push({
          name: "ivaRetenidoAnterior",
          label: "IVA Retenido Anterior",
          field: "ivaRetenidoAnterior",
          align: "right",
        });
      }
      cols.push(
        {
          name: "ivaCargo",
          label: "IVA a Cargo",
          field: "ivaCargo",
          align: "right",
        },
        {
          name: "ivaFavor",
          label: "IVA a Favor",
          field: "ivaFavor",
          align: "right",
        },
        {
          name: "cargoRegistrado",
          label: "Cargo Registrado",
          field: "cargoRegistrado",
          align: "right",
        },
        {
          name: "favorRegistrado",
          label: "Favor Registrado",
          field: "favorRegistrado",
          align: "right",
        },
        {
          name: "comparativa",
          label: "Comparativa",
          field: "comparativa",
          align: "right",
        }
      );
      return cols;
    },
    datosParaPdf() {
      return {
        filtros: {
          anio: this.anio,
          mesI: this.mesIValue,
          mesF: this.mesFValue,
        },
        comprobantesEmitidos: this.tablaComprobantesEmitidos,
        comprobantesRecibidos: this.tablaComprobantesRecibidos,
        nomina: this.tablaNominas,
        nominaConceptos: this.tablaNominaConceptos,
        cxc: this.tablaCxC,
        cxp: this.tablaCxP,
        comparativaFlujo: this.tablaComparativaFlujo,
        comparativaFlujoPorMoneda: this.comparativaFlujoPorMoneda,
        pagosIva: this.tablaPagosIva,
        pagosIsr: this.tablaPagosIsr,
        pagosProvisionales: this.tablaPagosProvisionales,
        usoCfdi: this.tablaUsoCfdi,
        comparativaAnual: {
          filas: this.tablaComparativaAnual,
          mensaje: this.comparativaAnualMensaje,
        },
        razonesFinancieras: this.razonesFinancieras,
      };
    },
  },
  watch: {
    // Si el padre pasa autoGenerar=true, cada vez que cambie el periodo
    // (año / mesI / mesF) que viene del store, se vuelve a generar solo.
    anio() {
      if (this.autoGenerar && this.periodoValido) this.generarReporte();
    },
    mesIValue() {
      if (this.autoGenerar && this.periodoValido) this.generarReporte();
    },
    mesFValue() {
      if (this.autoGenerar && this.periodoValido) this.generarReporte();
    },
  },
  methods: {
    // ---------------- UTILIDADES ----------------
    formatoPesos(valor, moneda = "MXN") {
      const num = Number(valor) || 0;
      try {
        return new Intl.NumberFormat("es-MX", {
          style: "currency",
          currency: moneda || "MXN",
        }).format(num);
      } catch (e) {
        return new Intl.NumberFormat("es-MX", {
          style: "currency",
          currency: "MXN",
        }).format(num);
      }
    },
    formatoFecha(fecha) {
      if (!fecha) return "";
      return moment(fecha).format("DD/MM/YYYY");
    },
    obtenerNombreMes(mesNum) {
      const item = this.itemsMes.find((m) => m.value === mesNum);
      return item ? item.label : mesNum;
    },
    colorDias(dias) {
      if (dias <= 30) return "green";
      if (dias <= 60) return "orange";
      return "red";
    },
    conceptosArray(conceptos) {
      return Array.isArray(conceptos) ? conceptos : [];
    },
    formatoPorcentaje(valor) {
      if (
        valor === "---" ||
        valor === null ||
        valor === undefined ||
        valor === ""
      )
        return "";
      const num = Number(valor);
      if (Number.isNaN(num)) return String(valor);
      return num.toFixed(2) + "%";
    },
    // Formatea el valor de una razón financiera según su tipo (porcentaje,
    // moneda, días, o veces) — mismo criterio que formatearValor().
    formatoValorRazon(valor, formato) {
      if (valor === null || valor === undefined || Number.isNaN(Number(valor)))
        return "N/D";
      const num = Number(valor);
      if (formato === "porcentaje") return `${(num * 100).toFixed(2)}%`;
      if (formato === "moneda") return this.formatoPesos(num);
      if (formato === "dias") return `${num.toFixed(1)} días`;
      return `${num.toFixed(2)} veces`;
    },

    // ---------------- FETCH: COMPROBANTES POR RFC ----------------
    async GetReporteRFc(rfc, coleccion, año, mesI, mesF, concentrado) {
      try {
        const response = await axios.get(
          `${this.rutaAxios}/ReporteGeneral/GetReporteRfcAsync/${rfc}/${coleccion}/${año}/${mesI}/${mesF}/${concentrado}`
        );
        return response.data;
      } catch (error) {
        console.log(error);
        return [];
      }
    },

    // ---------------- FETCH: NOMINA ----------------
    async GetReporteImportesNomina(rfc, coleccion, año, mesI, mesF) {
      try {
        const response = await axios.get(
          `${this.rutaAxios}/ReporteGeneral/GetReporteImportesNominaAsync/${rfc}/${coleccion}/${año}/${mesI}/${mesF}`
        );
        console.log(response.data)
        return response.data;
      } catch (error) {
        console.log(error);
        return [[], [], [], {}];
      }
    },

    // ---------------- FETCH: CxC ----------------
    async GetCxC(rfc, fI, fF) {
      try {
        const response = await axios.get(
          `${this.rutaAxios}Ingresos/GetCxCAsync/erp_${rfc}/${fI}/${fF}`
        );
        return response.data;
      } catch (error) {
        console.log(error);
        return [];
      }
    },

    // ---------------- FETCH: CxP ----------------
    async GetCxP(rfc, fI, fF) {
      try {
        const response = await axios.get(
          `${this.rutaAxios}Gastos/GetCxPAsync/erp_${rfc}/${fI}/${fF}`
        );
        return response.data;
      } catch (error) {
        console.log(error);
        return [];
      }
    },

    // ---------------- FETCH: FLUJO ----------------
    async GetReporteFlujo(rfc, tipo, año, mesI, mesF) {
      try {
        const response = await axios.get(
          `${this.rutaAxios}/ReporteGeneral/GetReporteFormaPagoFlujoAsync/${rfc}/${tipo}/${año}/${mesI}/${mesF}`
        );
        const data = response.data;
        const datosFinales = [];
        data.forEach((mes) => {
          const datosPorMoneda = {};
          mes.detalles.forEach((datos) => {
            const moneda = datos.moneda;
            if (!datosPorMoneda[moneda]) datosPorMoneda[moneda] = [];
            datos.mes = this.itemsMes[datos.mes - 1].label;
            datosPorMoneda[moneda].push(datos);
          });
          if (Object.keys(datosPorMoneda).length > 0)
            datosFinales.push(datosPorMoneda);
        });
        return datosFinales;
      } catch (error) {
        console.log(error);
        return [];
      }
    },

    compararPUEPorMes(emitidos, recibidos) {
      const resultado = {};
      const procesar = (lista, campo) => {
        lista.forEach((item) => {
          Object.keys(item).forEach((moneda) => {
            item[moneda].forEach((reg) => {
              if (reg.metodoPago !== "PUE") return;
              const key = `${moneda}_${reg.mes}`;
              if (!resultado[key]) {
                resultado[key] = {
                  moneda,
                  mes: reg.mes,
                  totalEPUE: 0,
                  totalRPUE: 0,
                };
              }
              resultado[key][campo] += reg.importePesos;
            });
          });
        });
      };
      procesar(emitidos, "totalEPUE");
      procesar(recibidos, "totalRPUE");
      Object.values(resultado).forEach((item) => {
        item.diferenciaPUE = item.totalEPUE - item.totalRPUE;
      });
      return Object.values(resultado);
    },

    // ================================================================
    // ==================== PAGOS DE IVA (PORTADO) ====================
    // ================================================================
    // Nota importante: igual que en el reporte de impuestos original,
    // este cálculo SIEMPRE arranca desde Enero (acumulado del año),
    // sin importar el "Mes Inicial" seleccionado — solo usa el año y
    // el "Mes Final". Soporta tanto años >= 2024 (endpoints "Completo")
    // como años anteriores (endpoints legacy), y las dos variantes de
    // RFC: persona moral (12 caracteres) y persona física (13).

    // ---- FETCH crudos ----
    async ivaGetTrasladadoLegacy(rfc, año, mesFValue) {
      try {
        const fechaI = `${año}-01-01`;
        const fechaF = `${año}-${mesFValue}-01`;
        const response = await axios.get(
          `${this.rutaAxios}Ingresos/GetReporteIvaAsync/erp_${rfc}/${fechaI}/${fechaF}`,
          { timeout: 240000 }
        );
        return response.data;
      } catch (error) {
        console.log(error);
        return null;
      }
    },
    async ivaGetAcreditadoLegacy(rfc, año, mesFValue) {
      try {
        const fechaI = `${año}-01-01`;
        const fechaF = `${año}-${mesFValue}-01`;
        const response = await axios.get(
          `${this.rutaAxios}Gastos/GetReporteIvaAsync/erp_${rfc}/${fechaI}/${fechaF}`
        );
        return response.data;
      } catch (error) {
        console.log(error);
        return null;
      }
    },
    async ivaGetRetenido(rfc, año, mesFValue) {
      try {
        const añoSel = año - 1;
        const fechaI = `${añoSel}-12-01`;
        const fechaF = `${año}-${mesFValue}-01`;
        const response = await axios.get(
          `${this.rutaAxios}Gastos/GetReporteIvaRetenidoAsync/erp_${rfc}/${fechaI}/${fechaF}`
        );
        return response.data;
      } catch (error) {
        console.log(error);
        return null;
      }
    },
    async ivaGetRetenidoNeteado(rfc, año, mesFValue) {
      try {
        const añoSel = año - 1;
        const fechaI = `${añoSel}-12-01`;
        const fechaF = `${año}-${mesFValue}-01`;
        const response = await axios.get(
          `${this.rutaAxios}Gastos/GetReporteIvaRetenidoNeteadoAsync/erp_${rfc}/${fechaI}/${fechaF}`
        );
        return response.data;
      } catch (error) {
        console.log(error);
        return null;
      }
    },
    async ivaGetEmitidosCompleto(rfc, fechaI, fechaF) {
      try {
        const response = await axios.get(
          `${this.rutaAxios}Ingresos/GetReporteIvaCompletoAsync/${rfc}/${fechaI}/${fechaF}`
        );
        return response.data;
      } catch (error) {
        console.log(error);
        return null;
      }
    },
    async ivaGetRecibidosCompleto(rfc, fechaI, fechaF) {
      try {
        const response = await axios.get(
          `${this.rutaAxios}Gastos/GetReporteIvaCompletoAsync/${rfc}/${fechaI}/${fechaF}`
        );
        return response.data;
      } catch (error) {
        console.log(error);
        return null;
      }
    },
    async ivaGetComparativa(rfc, año, tipo) {
      const meses = [
        "ENERO",
        "FEBRERO",
        "MARZO",
        "ABRIL",
        "MAYO",
        "JUNIO",
        "JULIO",
        "AGOSTO",
        "SEPTIEMBRE",
        "OCTUBRE",
        "NOVIEMBRE",
        "DICIEMBRE",
      ];
      const respuestaDefault = meses.map((mes) => ({
        mes,
        importe: 0,
        ivaCargo: 0,
        ivaFavor: 0,
      }));
      try {
        const response = await axios.get(
          `${this.rutaAxios}Comparativa/GetComparativaAsync/erp_${rfc}/${año}/${tipo}`
        );
        return response.data.comparativa;
      } catch (error) {
        console.log(error);
        return respuestaDefault;
      }
    },

    // ---- CÁLCULO: legacy (año < 2024), persona moral ----
    async ivaCalcularMoralesLegacy(rfc, año, mesFValue, ivaCargo) {
      const resultado = [];
      try {
        const ivaAcreditable = await this.ivaGetAcreditadoLegacy(
          rfc,
          año,
          mesFValue
        );
        const ivaRetenido = await this.ivaGetRetenido(rfc, año, mesFValue);
        const comparativa = await this.ivaGetComparativa(rfc, año, "IVA");
        if (!ivaAcreditable || !ivaRetenido || !comparativa) return resultado;

        for (let x = 0; x < mesFValue; x++) {
          const objIva = {
            año,
            mes: ivaCargo[x].mes,
            baseIvaTrasladado: ivaCargo[x].baseIva,
            importeIvaTrasladado: ivaCargo[x].importeIva,
            baseIvaAcreditado: ivaAcreditable[x].baseIva,
            importeIvaAcreditado: ivaAcreditable[x].importeIva,
            ivaRetenidoAnterior: ivaRetenido[x].importeIva,
            ivaRetenido: ivaRetenido[x + 1].importeIva,
          };

          const ivaCargo_ = ivaCargo[x].importeIva;
          const ivaAcreditado_ = ivaAcreditable[x].importeIva;
          const ivaRetenido_ = ivaRetenido[x].importeIva;
          const ivaRetenidoAnterior_ = ivaRetenido[x + 1].importeIva;

          const calculo =
            ivaCargo_ - ivaAcreditado_ - ivaRetenido_ + ivaRetenidoAnterior_;
          if (calculo > 0) {
            objIva.ivaCargo = calculo;
            objIva.ivaFavor = 0;
          } else {
            objIva.ivaCargo = 0;
            objIva.ivaFavor = calculo * -1;
          }

          objIva.cargoRegistrado = comparativa[x].ivaCargo;
          objIva.favorRegistrado = comparativa[x].ivaFavor;

          let comparativa_ =
            (objIva.ivaCargo -
              objIva.ivaFavor -
              objIva.cargoRegistrado +
              objIva.favorRegistrado) *
            -1;
          if (comparativa_ !== 0) comparativa_ = comparativa_ * -1;
          objIva.comparativa = comparativa_;

          resultado.push(objIva);
        }
      } catch (error) {
        console.log(error);
      }
      return resultado;
    },

    // ---- CÁLCULO: legacy (año < 2024), persona física ----
    async ivaCalcularFisicasLegacy(rfc, año, mesFValue, ivaCargo) {
      const resultado = [];
      try {
        const ivaAcreditable = await this.ivaGetAcreditadoLegacy(
          rfc,
          año,
          mesFValue
        );
        const ivaRetenido = await this.ivaGetRetenidoNeteado(
          rfc,
          año,
          mesFValue
        );
        const comparativa = await this.ivaGetComparativa(rfc, año, "IVA");
        if (!ivaAcreditable || !ivaRetenido || !comparativa) return resultado;

        for (let x = 0; x < mesFValue; x++) {
          const objIva = {
            año,
            mes: ivaCargo[x].mes,
            baseIvaTrasladado: ivaCargo[x].baseIva,
            importeIvaTrasladado: ivaCargo[x].importeIva,
            baseIvaAcreditado: ivaAcreditable[x].baseIva,
            importeIvaAcreditado: ivaAcreditable[x].importeIva,
            ivaRetenido: ivaRetenido[x + 1].importeIva,
            ivaRetenidoAnterior: 0,
          };

          const ivaCargo_ = ivaCargo[x].importeIva;
          const ivaAcreditado_ = ivaAcreditable[x].importeIva;
          const ivaRetenido_ = objIva.ivaRetenido;

          const calculo = ivaCargo_ - ivaAcreditado_ - ivaRetenido_;
          if (calculo > 0) {
            objIva.ivaCargo = calculo;
            objIva.ivaFavor = 0;
          } else {
            objIva.ivaCargo = 0;
            objIva.ivaFavor = calculo * -1;
          }

          objIva.cargoRegistrado = comparativa[x].ivaCargo;
          objIva.favorRegistrado = comparativa[x].ivaFavor;

          let comparativa_ =
            (objIva.ivaCargo -
              objIva.ivaFavor -
              objIva.cargoRegistrado +
              objIva.favorRegistrado) *
            -1;
          if (comparativa_ !== 0) comparativa_ = comparativa_ * -1;
          objIva.comparativa = comparativa_;

          resultado.push(objIva);
        }
      } catch (error) {
        console.log(error);
      }
      return resultado;
    },

    // ---- CÁLCULO: 2024+ , persona moral ----
    async ivaCalcularMoralesNuevo(rfc, año, mesFValue) {
      const resultado = [];
      const meses = [
        "ENERO",
        "FEBRERO",
        "MARZO",
        "ABRIL",
        "MAYO",
        "JUNIO",
        "JULIO",
        "AGOSTO",
        "SEPTIEMBRE",
        "OCTUBRE",
        "NOVIEMBRE",
        "DICIEMBRE",
      ];
      try {
        const fechaI = `${año}-01-01`;
        const fechaF = `${año}-${mesFValue}-01`;
        const emitidos =
          (await this.ivaGetEmitidosCompleto(rfc, fechaI, fechaF)) || [];

        const recibidos =
          (await this.ivaGetRecibidosCompleto(rfc, fechaI, fechaF)) || [];
        const ivaRet = (await this.ivaGetRetenido(rfc, año, mesFValue)) || [];
        const ivaRetEmitido =
          (await this.ivaGetRetenidoNeteado(rfc, año, mesFValue)) || [];
        const comp = (await this.ivaGetComparativa(rfc, año, "IVA")) || [];
          console.log(ivaRet)
          console.log(ivaRetEmitido)

        for (let x = 0; x < mesFValue; x++) {
          const mes = meses[x];
          if (!mes) continue;

          const baseIvaTrasladado = emitidos
            .filter((i) => i.mes?.toUpperCase() === mes)
            .reduce((a, i) => a + (i.baseIva || 0), 0);
          const importeIvaTrasladado = emitidos
            .filter((i) => i.mes?.toUpperCase() === mes)
            .reduce((a, i) => a + (i.importeIva || 0), 0);
          const baseIvaAcreditado = recibidos
            .filter((i) => i.mes?.toUpperCase() === mes)
            .reduce((a, i) => a + (i.baseIva || 0), 0);
          const importeIvaAcreditado = recibidos
            .filter((i) => i.mes?.toUpperCase() === mes)
            .reduce((a, i) => a + (i.importeIva || 0), 0);
          const ivaRetenido = ivaRet
            .filter((i) => i.mes?.toUpperCase() === mes && i.año === año.toString())
            .reduce((a, i) => a + (i.importeIva || 0), 0);

          // const ivaRetenidoE = ivaRetEmitido
          // .filter((i) => i.mes?.toUpperCase() === mes && i.año === año)
          // .reduce((a, i) => a + (i.importeIva || 0), 0);

          const ivaRetenidoE = ivaRetEmitido
            .filter((item) => item.mes == x + 1 && item.año === año)
            .reduce((acc, item) => acc + (item.importeIva || 0), 0);

          const ivaRetenidoAnterior =
            (ivaRet[x]?.importeIva || 0) + ivaRetenidoE;

          let ivaCargo = 0;
          let ivaFavor = 0;
          const calculo =
            importeIvaTrasladado -
            importeIvaAcreditado +
            ivaRetenido -
            ivaRetenidoAnterior;
          if (calculo > 0) {
            ivaCargo = calculo;
            ivaFavor = 0;
          } else {
            ivaCargo = 0;
            ivaFavor = Math.abs(calculo);
          }

          const cargoRegistrado = comp
            .filter((i) => i.mes?.toUpperCase() === mes)
            .reduce((a, i) => a + (i.ivaCargo || 0), 0);
          const favorRegistrado = comp
            .filter((i) => i.mes?.toUpperCase() === mes)
            .reduce((a, i) => a + (i.ivaFavor || 0), 0);

          let comparativa =
            (ivaCargo - ivaFavor - cargoRegistrado + favorRegistrado) * -1;
          if (comparativa !== 0) comparativa *= -1;

          resultado.push({
            año,
            mes,
            baseIvaTrasladado,
            importeIvaTrasladado,
            baseIvaAcreditado,
            importeIvaAcreditado,
            ivaRetenido,
            ivaRetenidoAnterior,
            ivaCargo,
            ivaFavor,
            cargoRegistrado,
            favorRegistrado,
            comparativa,
          });
        }
      } catch (error) {
        console.log(error);
      }
      return resultado;
    },

    // ---- CÁLCULO: 2024+ , persona física ----
    async ivaCalcularFisicasNuevo(rfc, año, mesFValue) {
      const resultado = [];
      const meses = [
        "ENERO",
        "FEBRERO",
        "MARZO",
        "ABRIL",
        "MAYO",
        "JUNIO",
        "JULIO",
        "AGOSTO",
        "SEPTIEMBRE",
        "OCTUBRE",
        "NOVIEMBRE",
        "DICIEMBRE",
      ];
      try {
        const fechaI = `${año}-01-01`;
        const fechaF = `${año}-${mesFValue}-01`;
        const emitidos =
          (await this.ivaGetEmitidosCompleto(rfc, fechaI, fechaF)) || [];
        const recibidos =
          (await this.ivaGetRecibidosCompleto(rfc, fechaI, fechaF)) || [];
        const ivaRet =
          (await this.ivaGetRetenidoNeteado(rfc, año, mesFValue)) || [];
        const comp = (await this.ivaGetComparativa(rfc, año, "IVA")) || [];

        for (let x = 0; x < mesFValue; x++) {
          const mes = meses[x];

          const baseIvaTrasladado = emitidos
            .filter((i) => i.mes?.toUpperCase() === mes)
            .reduce((a, i) => a + (i.baseIva || 0), 0);
          const importeIvaTrasladado = emitidos
            .filter((i) => i.mes?.toUpperCase() === mes)
            .reduce((a, i) => a + (i.importeIva || 0), 0);
          const baseIvaAcreditado = recibidos
            .filter((i) => i.mes?.toUpperCase() === mes)
            .reduce((a, i) => a + (i.baseIva || 0), 0);
          const importeIvaAcreditado = recibidos
            .filter((i) => i.mes?.toUpperCase() === mes)
            .reduce((a, i) => a + (i.importeIva || 0), 0);
          const ivaRetenido = ivaRet
            .filter((i) => i.mes?.toUpperCase() === mes && i.año === año)
            .reduce((a, i) => a + (i.importeIva || 0), 0);
          const ivaRetenidoAnterior = ivaRet[x]?.importeIva || 0;

          let ivaCargo = 0;
          let ivaFavor = 0;
          const calculo =
            importeIvaTrasladado - importeIvaAcreditado - ivaRetenido;
          if (calculo > 0) {
            ivaCargo = calculo;
            ivaFavor = 0;
          } else {
            ivaCargo = 0;
            ivaFavor = Math.abs(calculo);
          }

          const cargoRegistrado = comp
            .filter((i) => i.mes?.toUpperCase() === mes)
            .reduce((a, i) => a + (i.ivaCargo || 0), 0);
          const favorRegistrado = comp
            .filter((i) => i.mes?.toUpperCase() === mes)
            .reduce((a, i) => a + (i.ivaFavor || 0), 0);

          let comparativa =
            (ivaCargo - ivaFavor - cargoRegistrado + favorRegistrado) * -1;
          if (comparativa !== 0) comparativa *= -1;

          resultado.push({
            año,
            mes,
            baseIvaTrasladado,
            importeIvaTrasladado,
            baseIvaAcreditado,
            importeIvaAcreditado,
            ivaRetenido,
            ivaRetenidoAnterior,
            ivaCargo,
            ivaFavor,
            cargoRegistrado,
            favorRegistrado,
            comparativa,
          });
        }
      } catch (error) {
        console.log(error);
      }
      return resultado;
    },

    // ---- ORQUESTADOR: decide legacy vs 2024+, y moral vs física ----
    async ivaGetPagosReporte(rfc, año, mesFValue) {
      if (!rfc || !mesFValue) return [];
      const esMoral = rfc.length === 12;
      const esFisica = rfc.length === 13;
      if (!esMoral && !esFisica) return [];

      if (año < 2024) {
        const ivaCargo = await this.ivaGetTrasladadoLegacy(rfc, año, mesFValue);
        if (!ivaCargo) return [];
        return esMoral
          ? this.ivaCalcularMoralesLegacy(rfc, año, mesFValue, ivaCargo)
          : this.ivaCalcularFisicasLegacy(rfc, año, mesFValue, ivaCargo);
      }

      return esMoral
        ? this.ivaCalcularMoralesNuevo(rfc, año, mesFValue)
        : this.ivaCalcularFisicasNuevo(rfc, año, mesFValue);
    },

    // ================================================================
    // =============== RETENCIONES DE ISR (PORTADO) ===================
    // ================================================================
    // Mismo criterio que Pagos de IVA: siempre desde Enero hasta el
    // Mes Final seleccionado (ni un mes de más ni de menos).

    async isrGetNomina(rfc, año, mesFValue) {
      try {
        const fechaI = `${año}-01-01`;
        const fechaF = `${año}-${mesFValue}-01`;
        const response = await axios.get(
          `${this.rutaAxios}Nomina/GetReporteISrAsync/erp_${rfc}/${fechaI}/${fechaF}`
        );
        return response.data; // [sueldos, asimilados, otros]
      } catch (error) {
        console.log(error);
        return [[], [], []];
      }
    },
    async isrGetGastos(rfc, año, mesFValue) {
      try {
        const fechaI = `${año}-01-01`;
        const fechaF = `${año}-${mesFValue}-01`;
        const response = await axios.get(
          `${this.rutaAxios}Gastos/GetReporteIsrAsync/erp_${rfc}/${fechaI}/${fechaF}`
        );
        return response.data; // [arrendamientos, honorarios, demasIngresos]
      } catch (error) {
        console.log(error);
        return [[], [], []];
      }
    },
    async isrGetRetenidoFavor(rfc, año, mesFValue) {
      try {
        const fechaI = `${año}-01-01`;
        const fechaF = `${año}-${mesFValue}-01`;
        const response = await axios.get(
          `${this.rutaAxios}Ingresos/ReporteIsrEmitidoAsync/erp_${rfc}/${fechaI}/${fechaF}`
        );
        return response.data || [];
      } catch (error) {
        console.log(error);
        return [];
      }
    },

    // Arma una tabla {mes, importe, comparativa, diferencia} a partir de un
    // array del backend (ya indexado 0=Enero) y su comparativa correspondiente.
    isrConstruirFila(arr, comp, mesFValue) {
      const resultado = [];
      for (let a = 0; a < mesFValue; a++) {
        const base = (arr && arr[a]) || {
          mes: this.obtenerNombreMes(a + 1),
          importe: 0,
        };
        const importeComparativa = (comp && comp[a] && comp[a].importe) || 0;
        resultado.push({
          mes: base.mes,
          importe: base.importe || 0,
          comparativa: importeComparativa,
          diferencia: (base.importe || 0) - importeComparativa,
        });
      }
      return resultado;
    },

    // ---- ORQUESTADOR: junta las 7 categorías de ISR ----
    async isrGetPagosReporte(rfc, año, mesFValue) {
      const vacio = {
        sueldos: [],
        asimilados: [],
        otros: [],
        arrendamientos: [],
        honorarios: [],
        demasIngresos: [],
        isrRetenidoFavor: [],
      };
      if (!rfc || !mesFValue) return vacio;

      try {
        const [
          nomina,
          gastos,
          retFavorRaw,
          compSueldos,
          compAsimilados,
          compOtros,
          compArrendamientos,
          compHonorarios,
          compDemasIngresos,
          compIsrFavor,
        ] = await Promise.all([
          this.isrGetNomina(rfc, año, mesFValue),
          this.isrGetGastos(rfc, año, mesFValue),
          this.isrGetRetenidoFavor(rfc, año, mesFValue),
          this.ivaGetComparativa(rfc, año, "Sueldos"),
          this.ivaGetComparativa(rfc, año, "Asimilados"),
          this.ivaGetComparativa(rfc, año, "SueldosOtros"),
          this.ivaGetComparativa(rfc, año, "Arrendamientos"),
          this.ivaGetComparativa(rfc, año, "Honorarios"),
          this.ivaGetComparativa(rfc, año, "DemasIngresos"),
          this.ivaGetComparativa(rfc, año, "ISRRetenidoFavor"),
        ]);

        const sueldos = this.isrConstruirFila(
          nomina && nomina[0],
          compSueldos,
          mesFValue
        );
        const asimilados = this.isrConstruirFila(
          nomina && nomina[1],
          compAsimilados,
          mesFValue
        );
        const otros = this.isrConstruirFila(
          nomina && nomina[2],
          compOtros,
          mesFValue
        );
        const arrendamientos = this.isrConstruirFila(
          gastos && gastos[0],
          compArrendamientos,
          mesFValue
        );
        const honorarios = this.isrConstruirFila(
          gastos && gastos[1],
          compHonorarios,
          mesFValue
        );
        const demasIngresos = this.isrConstruirFila(
          gastos && gastos[2],
          compDemasIngresos,
          mesFValue
        );

        // ISR Retenido a Favor: el backend regresa objetos con "mes" NUMÉRICO
        // y "año" — hay que emparejar por mes/año (no por índice), igual que
        // en el reporte original, y rellenar con 0 los meses faltantes.
        const isrRetenidoFavor = [];
        for (let m = 1; m <= mesFValue; m++) {
          const item = (retFavorRaw || []).find(
            (x) => x.mes === m && x.año === parseInt(año)
          ) || { mes: m, año, importe: 0 };
          const importeComparativa =
            (compIsrFavor &&
              compIsrFavor[m - 1] &&
              compIsrFavor[m - 1].importe) ||
            0;
          isrRetenidoFavor.push({
            mes: this.obtenerNombreMes(m),
            importe: item.importe || 0,
            comparativa: importeComparativa,
            diferencia: (item.importe || 0) - importeComparativa,
          });
        }

        return {
          sueldos,
          asimilados,
          otros,
          arrendamientos,
          honorarios,
          demasIngresos,
          isrRetenidoFavor,
        };
      } catch (error) {
        console.log(error);
        return vacio;
      }
    },

    // ================================================================
    // ============= PAGOS PROVISIONALES DE ISR (PORTADO) ==============
    // ================================================================
    // Detecta automáticamente el régimen fiscal configurado para el año
    // (igual que tu componente original) y aplica el cálculo correspondiente:
    // General de Ley Personas Morales (601), Física Actividad Empresarial
    // (612/625), RESICO Física, RESICO Moral, o Sociedades Civiles/AC.
    // Siempre desde Enero hasta el Mes Final, sin totales ni gráficas.

    // ---- FETCH crudos ----
    async ppIsrGetRegimen(rfc) {
      try {
        const response = await axios.get(
          `${this.rutaAxios}PagosProvisionales/GetRegimenEmpresaAsync/erp_${rfc}`
        );
        return response.data;
      } catch (error) {
        console.log(error);
        return [];
      }
    },
    async ppIsrGetIngresosFacturados(rfc, año, mesFValue) {
      try {
        const fechaI = `${año}-01-01`;
        const fechaF = `${año}-${mesFValue}-01`;
        const response = await axios.get(
          `${this.rutaAxios}Ingresos/GetReporteIngresosPPISRAsync/erp_${rfc}/${fechaI}/${fechaF}`
        );
        return response.data;
      } catch (error) {
        console.log(error);
        return [];
      }
    },
    async ppIsrGetIngresosCobrados(rfc, año, mesFValue) {
      try {
        const fechaI = `${año}-01-01`;
        const fechaF = `${año}-${mesFValue}-01`;
        const response = await axios.get(
          `${this.rutaAxios}Ingresos/GetCobradoAsync/erp_${rfc}/${fechaI}/${fechaF}`
        );
        return response.data;
      } catch (error) {
        console.log(error);
        return [];
      }
    },
    async ppIsrGetIngresosCobradosResicoM(rfc, año, mesFValue) {
      try {
        const fechaI = `${año}-01-01`;
        const fechaF = `${año}-${mesFValue}-01`;
        const response = await axios.get(
          `${this.rutaAxios}Ingresos/GetCobradoResicoMoralAsync/erp_${rfc}/${fechaI}/${fechaF}`
        );
        return response.data;
      } catch (error) {
        console.log(error);
        return [];
      }
    },
    async ppIsrGetGastosPagadosResicoM(rfc, año, mesFValue) {
      try {
        const fechaI = `${año}-01-01`;
        const fechaF = `${año}-${mesFValue}-01`;
        const response = await axios.get(
          `${this.rutaAxios}Gastos/GetPagadoResicoMoralAsync/erp_${rfc}/${fechaI}/${fechaF}`
        );
        return response.data;
      } catch (error) {
        console.log(error);
        return [];
      }
    },
    async ppIsrGetGastosPagados(rfc, año, mesFValue) {
      try {
        const fechaI = `${año}-01-01`;
        const fechaF = `${año}-${mesFValue}-01`;
        const response = await axios.get(
          `${this.rutaAxios}Gastos/GetPagadoAsync/erp_${rfc}/${fechaI}/${fechaF}`
        );
        return response.data;
      } catch (error) {
        console.log(error);
        return [];
      }
    },
    async ppIsrGetPagoPtu(rfc, año, mesFValue) {
      try {
        const fechaI = `${año}-01-01`;
        const fechaF = `${año}-${mesFValue}-01`;
        const response = await axios.get(
          `${this.rutaAxios}Nomina/GetReportePagoPtuAsync/erp_${rfc}/${fechaI}/${fechaF}`
        );
        return response.data;
      } catch (error) {
        console.log(error);
        return [];
      }
    },
    async ppIsrGetTablas(año, tipo, periodicidad) {
      try {
        const response = await axios.get(
          `${this.rutaAxios}Empresa/GetTablas/${año}/${tipo}/${periodicidad}`
        );
        return response.data;
      } catch (error) {
        console.log(error);
        return null;
      }
    },

    // ---- CÁLCULO: General de Ley Personas Morales (601) ----
    async ppIsrCalcularGeneralMoral(rfc, año, mesFValue) {
      const columnas = [
        {
          name: "mes",
          label: "Mes",
          field: "mes",
          align: "left",
          tipo: "texto",
        },
        {
          name: "ingresosPorMes",
          label: "Ingresos por Mes",
          field: "ingresosPorMes",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "ingresosAcumulados",
          label: "Ingresos Acumulados",
          field: "ingresosAcumulados",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "utilidadFiscal",
          label: "Utilidad Fiscal",
          field: "utilidadFiscal",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "basePagoProvisional",
          label: "Base Pago Provisional",
          field: "basePagoProvisional",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "pagoProvisional",
          label: "Pago Provisional",
          field: "pagoProvisional",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "impuestoCargo",
          label: "Impuesto a Cargo",
          field: "impuestoCargo",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "impuestoregistrado",
          label: "Impuesto Registrado",
          field: "impuestoregistrado",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "comparativa",
          label: "Comparativa",
          field: "comparativa",
          align: "right",
          tipo: "moneda",
        },
      ];
      const filas = [];
      try {
        const ingresos =
          (await this.ppIsrGetIngresosFacturados(rfc, año, mesFValue)) || [];
        const coeficiente =
          (await this.ivaGetComparativa(rfc, año, "Coeficiente")) || [];
        const perdida =
          (await this.ivaGetComparativa(rfc, año, "Perdida")) || [];
        const registrados =
          (await this.ivaGetComparativa(rfc, año, "RegistradosPPIsr")) || [];

        let acumulado = 0;
        let pagoAnterior = 0;

        for (let i = 0; i < mesFValue; i++) {
          const ing = ingresos[i] || {
            mes: this.obtenerNombreMes(i + 1),
            importe: 0,
          };
          acumulado += ing.importe || 0;

          const fila = {
            mes: ing.mes,
            ingresosPorMes: ing.importe || 0,
            ingresosAcumulados: acumulado,
          };
          fila.utilidadFiscal =
            acumulado * ((coeficiente[i] && coeficiente[i].importe) || 0);
          let base =
            fila.utilidadFiscal - ((perdida[i] && perdida[i].importe) || 0);
          if (base < 0) base = 0;
          fila.basePagoProvisional = base;
          fila.pagoProvisional = (base * 30) / 100;

          let impuestoCargo = fila.pagoProvisional - pagoAnterior;
          if (impuestoCargo < 0) impuestoCargo = 0;
          fila.impuestoCargo = impuestoCargo;
          pagoAnterior += impuestoCargo;

          fila.impuestoregistrado =
            (registrados[i] && registrados[i].importe) || 0;
          fila.comparativa = fila.impuestoCargo - fila.impuestoregistrado;

          filas.push(fila);
        }
      } catch (error) {
        console.log(error);
      }
      return { columnas, filas };
    },

    // ---- CÁLCULO: Física Actividad Empresarial (612 / 625) ----
    async ppIsrCalcularFisicaActividadEmpresarial(rfc, año, mesFValue) {
      const columnas = [
        {
          name: "mes",
          label: "Mes",
          field: "mes",
          align: "left",
          tipo: "texto",
        },
        {
          name: "ingresosPorMes",
          label: "Ingresos por Mes",
          field: "ingresosPorMes",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "ingresosAcumulados",
          label: "Ingresos Acumulados",
          field: "ingresosAcumulados",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "gastosPorMes",
          label: "Gastos por Mes",
          field: "gastosPorMes",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "gastosAcumulados",
          label: "Gastos Acumulados",
          field: "gastosAcumulados",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "baseCalculo",
          label: "Base del Cálculo",
          field: "baseCalculo",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "limiteInferior",
          label: "Límite Inferior",
          field: "limiteInferior",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "baseImpuesto",
          label: "Base Impuesto",
          field: "baseImpuesto",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "porcentaje",
          label: "Porcentaje",
          field: "porcentaje",
          align: "right",
          tipo: "porcentaje",
        },
        {
          name: "impuestoMarginal",
          label: "Impuesto Marginal",
          field: "impuestoMarginal",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "cuotaFija",
          label: "Cuota Fija",
          field: "cuotaFija",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "importeIsr",
          label: "Importe ISR",
          field: "importeIsr",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "pagosAnteriores",
          label: "Pagos Anteriores",
          field: "pagosAnteriores",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "isrCargo",
          label: "ISR a Cargo",
          field: "isrCargo",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "isrEmitido",
          label: "ISR Retenido",
          field: "isrEmitido",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "isrPagar",
          label: "ISR a Pagar",
          field: "isrPagar",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "impuestoregistrado",
          label: "Impuesto Registrado",
          field: "impuestoregistrado",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "comparativa",
          label: "Comparativa",
          field: "comparativa",
          align: "right",
          tipo: "moneda",
        },
      ];
      const filas = [];
      try {
        const tablas = await this.ppIsrGetTablas(
          año,
          "personas_fisicas_actividad_empresarial",
          "mensual"
        );
        const ingresos =
          (await this.ppIsrGetIngresosCobrados(rfc, año, mesFValue)) || [];
        const gastos =
          (await this.ppIsrGetGastosPagados(rfc, año, mesFValue)) || [];
        const registrados =
          (await this.ivaGetComparativa(rfc, año, "RegistradosPPIsr")) || [];
        const isrEmitido =
          (await this.isrGetRetenidoFavor(rfc, año, mesFValue)) || [];

        let ingresosAcumulados = 0;
        let gastosAcumulados = 0;
        let pagosAnteriores = 0;

        for (let i = 0; i < mesFValue; i++) {
          const ing = ingresos[i] || {
            mes: this.obtenerNombreMes(i + 1),
            importe: 0,
          };
          const gas = gastos[i] || { importe: 0 };

          ingresosAcumulados += ing.importe || 0;
          gastosAcumulados += gas.importe || 0;
          let baseCalculo = ingresosAcumulados - gastosAcumulados;
          if (baseCalculo < 0) baseCalculo = 0;

          let limiteInferior = 0;
          let baseImpuesto = 0;
          let cuotaFija = 0;
          let porcentaje = 0;
          let impuestoMarginal = 0;
          let importeIsr = 0;

          if (baseCalculo !== 0 && tablas && tablas[0]) {
            const valor = (ing.mes || "").toLowerCase();
            const tablaMes = tablas[0][valor] || [];
            let encontrado = null;
            for (const rango of tablaMes) {
              const li = parseFloat(rango.limite_inferior);
              const ls = parseFloat(rango.limite_superior);
              if (baseCalculo >= li && baseCalculo <= ls) {
                encontrado = rango;
                break;
              }
            }
            if (encontrado) {
              limiteInferior = parseFloat(encontrado.limite_inferior);
              cuotaFija = parseFloat(encontrado.cuota_fija);
              porcentaje = parseFloat(encontrado.porcentaje);
              baseImpuesto = baseCalculo - limiteInferior;
              impuestoMarginal =
                Math.round(baseImpuesto * (porcentaje / 100) * 100) / 100;
              importeIsr = impuestoMarginal + cuotaFija;
            }
          }

          const isrCargoRaw = importeIsr - pagosAnteriores;
          const isrCargoMostrado = isrCargoRaw <= 0 ? 0 : isrCargoRaw;

          const fila = {
            mes: ing.mes,
            ingresosPorMes: ing.importe || 0,
            ingresosAcumulados,
            gastosPorMes: gas.importe || 0,
            gastosAcumulados,
            baseCalculo,
            limiteInferior,
            baseImpuesto,
            porcentaje,
            impuestoMarginal,
            cuotaFija,
            importeIsr,
            pagosAnteriores,
            isrCargo: isrCargoMostrado,
            isrEmitido: 0,
            isrPagar: 0,
            impuestoregistrado: (registrados[i] && registrados[i].importe) || 0,
          };
          fila.comparativa = isrCargoMostrado - fila.impuestoregistrado;

          filas.push(fila);
          pagosAnteriores += isrCargoRaw;
        }

        // Aplicamos el ISR retenido (emitido) por mes, igual que el original
        const isrMap = {};
        (isrEmitido || []).forEach((i) => {
          isrMap[this.obtenerNombreMes(i.mes)] = i;
        });
        filas.forEach((fila) => {
          const isr = isrMap[fila.mes];
          if (isr) {
            fila.isrEmitido = isr.importe || 0;
            fila.isrPagar = fila.importeIsr - fila.isrEmitido;
            fila.comparativa = fila.isrPagar - fila.impuestoregistrado;
          }
        });
      } catch (error) {
        console.log(error);
      }
      return { columnas, filas };
    },

    // ---- CÁLCULO: RESICO Física ----
    async ppIsrCalcularResicoFisica(rfc, año, mesFValue) {
      const columnas = [
        {
          name: "mes",
          label: "Mes",
          field: "mes",
          align: "left",
          tipo: "texto",
        },
        {
          name: "ingresosPorMes",
          label: "Ingresos por Mes",
          field: "ingresosPorMes",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "tasaAplicable",
          label: "Tasa Aplicable",
          field: "tasaAplicable",
          align: "right",
          tipo: "porcentaje",
        },
        {
          name: "importeIsr",
          label: "Importe ISR",
          field: "importeIsr",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "isrEmitido",
          label: "ISR Retenido",
          field: "isrEmitido",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "isrPagar",
          label: "ISR a Pagar",
          field: "isrPagar",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "impuestoregistrado",
          label: "Impuesto Registrado",
          field: "impuestoregistrado",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "comparativa",
          label: "Comparativa",
          field: "comparativa",
          align: "right",
          tipo: "moneda",
        },
      ];
      const filas = [];
      try {
        const tablas = await this.ppIsrGetTablas(
          año,
          "resico_fisica",
          "mensual"
        );
        const ingresos =
          (await this.ppIsrGetIngresosCobrados(rfc, año, mesFValue)) || [];
        const registrados =
          (await this.ivaGetComparativa(rfc, año, "RegistradosPPIsr")) || [];
        const isrEmitido =
          (await this.isrGetRetenidoFavor(rfc, año, mesFValue)) || [];

        for (let i = 0; i < mesFValue; i++) {
          const ing = ingresos[i] || {
            mes: this.obtenerNombreMes(i + 1),
            importe: 0,
          };
          const importeIngreso = Number(ing.importe) || 0;

          let tasaAplicable = {};
          let menorDiferencia = Infinity;
          const tablasArr = (tablas && tablas[0] && tablas[0].tablas) || [];
          for (const elemento of tablasArr) {
            if (elemento.hasta >= importeIngreso) {
              const diferencia = Math.abs(elemento.hasta - importeIngreso);
              if (diferencia < menorDiferencia) {
                menorDiferencia = diferencia;
                tasaAplicable = elemento;
              }
            } else {
              tasaAplicable.tasa = 2.5;
            }
          }

          let importeIsr = 0;
          if (importeIngreso !== 0)
            importeIsr = importeIngreso * ((tasaAplicable.tasa || 0) / 100);

          const fila = {
            mes: ing.mes,
            ingresosPorMes: importeIngreso,
            tasaAplicable: tasaAplicable.tasa || 0,
            importeIsr,
            isrEmitido: 0,
            isrPagar: 0,
            impuestoregistrado: (registrados[i] && registrados[i].importe) || 0,
          };
          fila.comparativa = importeIsr - fila.impuestoregistrado;
          filas.push(fila);
        }

        const isrMap = {};
        (isrEmitido || []).forEach((i) => {
          isrMap[this.obtenerNombreMes(i.mes)] = i;
        });
        filas.forEach((fila) => {
          const isr = isrMap[fila.mes];
          if (isr) {
            fila.isrEmitido = isr.importe || 0;
            fila.isrPagar = fila.importeIsr - fila.isrEmitido;
            fila.comparativa = fila.isrPagar - fila.impuestoregistrado;
          }
        });
      } catch (error) {
        console.log(error);
      }
      return { columnas, filas };
    },

    // ---- CÁLCULO: RESICO Moral ----
    async ppIsrCalcularResicoMoral(rfc, año, mesFValue) {
      const columnas = [
        {
          name: "mes",
          label: "Mes",
          field: "mes",
          align: "left",
          tipo: "texto",
        },
        {
          name: "ingresosPorMes",
          label: "Ingresos por Mes",
          field: "ingresosPorMes",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "ingresosAcumulados",
          label: "Ingresos Acumulados",
          field: "ingresosAcumulados",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "deduccionesPorMes",
          label: "Deducciones por Mes",
          field: "deduccionesPorMes",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "deduccionesAcumuladas",
          label: "Deducciones Acumuladas",
          field: "deduccionesAcumuladas",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "utilidadFiscalPrevia",
          label: "Utilidad Fiscal del Mes Previa",
          field: "utilidadFiscalPrevia",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "utilidadFiscalPreviaAcumulada",
          label: "Utilidad Fiscal del Mes Previa Acumulada",
          field: "utilidadFiscalPreviaAcumulada",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "ptuPagada",
          label: "PTU Pagada",
          field: "ptuPagada",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "utilidadFiscalAcumuladaPreviaAntesDePerdidasFiscales",
          label: "Utilidad Fiscal Acumulada Previa Antes de Pérdidas Fiscales",
          field: "utilidadFiscalAcumuladaPreviaAntesDePerdidasFiscales",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "perdidasFiscalesPorAplicar",
          label: "Pérdidas Fiscales Por Aplicar",
          field: "perdidasFiscalesPorAplicar",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "baseIsr",
          label: "Base de ISR",
          field: "baseIsr",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "tasaIsr",
          label: "Tasa de ISR",
          field: "tasaIsr",
          align: "right",
          tipo: "texto",
        },
        {
          name: "isrDelPeriodo",
          label: "ISR del Periodo",
          field: "isrDelPeriodo",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "isrPagosProvisionales",
          label: "ISR Pagos Provisionales",
          field: "isrPagosProvisionales",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "isrAPagar",
          label: "ISR A Pagar",
          field: "isrAPagar",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "impuestoregistrado",
          label: "Impuesto Registrado",
          field: "impuestoregistrado",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "comparativa",
          label: "Comparativa",
          field: "comparativa",
          align: "right",
          tipo: "moneda",
        },
      ];
      const filas = [];
      try {
        const ingresos =
          (await this.ppIsrGetIngresosCobradosResicoM(rfc, año, mesFValue)) ||
          [];
        const gastos =
          (await this.ppIsrGetGastosPagadosResicoM(rfc, año, mesFValue)) || [];
        const ptu = (await this.ppIsrGetPagoPtu(rfc, año, mesFValue)) || [];
        const registrados =
          (await this.ivaGetComparativa(rfc, año, "RegistradosPPIsr")) || [];
        const perdida =
          (await this.ivaGetComparativa(rfc, año, "Perdida")) || [];

        let ingresosAcumulados = 0;
        let deduccionesAcumuladas = 0;
        let utilidadFiscalPreviaAcumulada = 0;
        let isrPagosProvisionales = 0;

        for (let i = 0; i < mesFValue; i++) {
          const ing = ingresos[i] || {
            mes: this.obtenerNombreMes(i + 1),
            importe: 0,
          };
          const gas = gastos[i] || { importe: 0 };

          ingresosAcumulados += ing.importe || 0;
          deduccionesAcumuladas += gas.importe || 0;
          let utilidadFiscalPrevia = ingresosAcumulados - deduccionesAcumuladas;
          if (utilidadFiscalPrevia < 0) utilidadFiscalPrevia = 0;
          utilidadFiscalPreviaAcumulada += utilidadFiscalPrevia;

          const ptuPagada = (ptu[i] && ptu[i].importe) || 0;
          const utilidadFiscalAcumuladaPreviaAntesDePerdidasFiscales =
            utilidadFiscalPreviaAcumulada - ptuPagada;
          const perdidasFiscalesPorAplicar =
            (perdida[i] && perdida[i].importe) || 0;
          let baseIsr =
            utilidadFiscalAcumuladaPreviaAntesDePerdidasFiscales -
            perdidasFiscalesPorAplicar;
          if (baseIsr < 0) baseIsr = 0;
          const isrDelPeriodo = baseIsr * 0.3;
          const isrAPagar = isrDelPeriodo - isrPagosProvisionales;
          const impuestoregistrado =
            (registrados[i] && registrados[i].importe) || 0;

          filas.push({
            mes: ing.mes,
            ingresosPorMes: ing.importe || 0,
            ingresosAcumulados,
            deduccionesPorMes: gas.importe || 0,
            deduccionesAcumuladas,
            utilidadFiscalPrevia,
            utilidadFiscalPreviaAcumulada,
            ptuPagada,
            utilidadFiscalAcumuladaPreviaAntesDePerdidasFiscales,
            perdidasFiscalesPorAplicar,
            baseIsr,
            tasaIsr: "30.00%",
            isrDelPeriodo,
            isrPagosProvisionales,
            isrAPagar,
            impuestoregistrado,
            comparativa: isrAPagar - impuestoregistrado,
          });

          isrPagosProvisionales = isrDelPeriodo;
        }
      } catch (error) {
        console.log(error);
      }
      return { columnas, filas };
    },

    // ---- CÁLCULO: Sociedades Civiles / AC (backend ya regresa la tabla calculada) ----
    async ppIsrCalcularAcYSc(rfc, año, mesFValue) {
      const columnas = [
        {
          name: "mes",
          label: "Mes",
          field: "mes",
          align: "left",
          tipo: "texto",
        },
        {
          name: "ventas",
          label: "Ventas",
          field: "ventas",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "productosFinancieros",
          label: "Productos Financieros",
          field: "productosFinancieros",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "otrosProductos",
          label: "Otros Productos Financieros",
          field: "otrosProductos",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "anticipoDeClientes",
          label: "Anticipo de Clientes",
          field: "anticipoDeClientes",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "totalPeriodo",
          label: "Total del Periodo",
          field: "totalPeriodo",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "ingresoAcumulable",
          label: "Ingreso Acumulable",
          field: "ingresoAcumulable",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "coeficienteUtilidad",
          label: "Coeficiente de Utilidad",
          field: "coeficienteUtilidad",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "utilidadFiscalEstimada",
          label: "Utilidad Fiscal Estimada",
          field: "utilidadFiscalEstimada",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "ptu",
          label: "PTU a Aplicar en el Periodo",
          field: "ptu",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "ptuAcumulada",
          label: "PTU Acumulada",
          field: "ptuAcumulada",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "anticipoCuentaUtilidades",
          label: "Anticipo a Cuenta de Utilidades",
          field: "anticipoCuentaUtilidades",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "anticipoCuentaUtilidadesAcumulado",
          label: "Anticipo a Cuenta de Utilidades Acumulado",
          field: "anticipoCuentaUtilidadesAcumulado",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "resultadoFiscalPrevio",
          label: "Resultado Fiscal Previo",
          field: "resultadoFiscalPrevio",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "perdidaDelEjercicioAnterior",
          label: "Pérdida del Ejercicio Anterior",
          field: "perdidaDelEjercicioAnterior",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "baseParaIsr",
          label: "Base para ISR",
          field: "baseParaIsr",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "tasaParaIsr",
          label: "Tasa para ISR",
          field: "tasaParaIsr",
          align: "right",
          tipo: "texto",
        },
        {
          name: "pagoProvisionalIsr",
          label: "Pago Provisional ISR",
          field: "pagoProvisionalIsr",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "isrEnterado",
          label: "ISR Enterado",
          field: "isrEnterado",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "isrAPagar",
          label: "ISR a Pagar",
          field: "isrAPagar",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "impuestoregistrado",
          label: "Impuesto Registrado",
          field: "impuestoregistrado",
          align: "right",
          tipo: "moneda",
        },
        {
          name: "comparativa",
          label: "Comparativa",
          field: "comparativa",
          align: "right",
          tipo: "moneda",
        },
      ];
      let filas = [];
      try {
        const response = await axios.get(
          `${this.rutaAxios}PagosProvisionales/GetPagoIsrAcYScAsync/erp_${rfc}/${año}/${mesFValue}`
        );
        filas = Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.log(error);
      }
      return { columnas, filas };
    },

    // ---- ORQUESTADOR: detecta régimen y decide qué cálculo aplicar ----
    async ppIsrGetReporte(rfc, año, mesFValue) {
      const vacio = { columnas: [], filas: [], mensaje: "", regimenLabel: "" };
      if (!rfc || !mesFValue) return vacio;

      try {
        const regimenes = await this.ppIsrGetRegimen(rfc);
        const regimen = (regimenes || []).find(
          (o) => String(o.año) === String(año)
        );

        if (!regimen || !regimen.tipoRegimen) {
          return {
            ...vacio,
            mensaje: `Configura el régimen fiscal del año ${año} en Pagos Provisionales para ver este reporte.`,
          };
        }

        const regimenLabel = regimen.tipoRegimen.tipoRegimen || "";

        if (regimen.civiles === "SI") {
          const r = await this.ppIsrCalcularAcYSc(rfc, año, mesFValue);
          return { ...r, mensaje: "", regimenLabel };
        }

        const claveRegimen = regimen.tipoRegimen.clave;
        const tipoPersona =
          rfc.length === 12 ? "MORAL" : rfc.length === 13 ? "FISICA" : "";

        let resultado;
        if (claveRegimen === "601") {
          resultado = await this.ppIsrCalcularGeneralMoral(rfc, año, mesFValue);
        } else if (claveRegimen === "626" && tipoPersona === "FISICA") {
          resultado = await this.ppIsrCalcularResicoFisica(rfc, año, mesFValue);
        } else if (claveRegimen === "626" && tipoPersona === "MORAL") {
          resultado = await this.ppIsrCalcularResicoMoral(rfc, año, mesFValue);
        } else if (claveRegimen === "625" || claveRegimen === "612") {
          resultado = await this.ppIsrCalcularFisicaActividadEmpresarial(
            rfc,
            año,
            mesFValue
          );
        } else {
          return {
            ...vacio,
            mensaje: `El régimen "${regimenLabel}" no está soportado todavía en este reporte.`,
            regimenLabel,
          };
        }

        return { ...resultado, mensaje: "", regimenLabel };
      } catch (error) {
        console.log(error);
        return vacio;
      }
    },

    // ================================================================
    // =================== USO DE CFDI (PORTADO) =======================
    // ================================================================
    // A diferencia de IVA/ISR, este reporte SÍ respeta el rango normal
    // Mes Inicial -> Mes Final (fI/fF), igual que CxC/CxP, ya que no es
    // un cálculo acumulado desde Enero.

    async cfdiGetIngresos(rfc, fI, fF) {
      try {
        const response = await axios.get(
          `${this.rutaAxios}Consultas/GetReporteUsoCfdiIngresosAsync/erp_${rfc}/${fI}/${fF}`
        );
        return response.data;
      } catch (error) {
        console.log(error);
        return [];
      }
    },
    async cfdiGetGastos(rfc, fI, fF) {
      try {
        const response = await axios.get(
          `${this.rutaAxios}Consultas/GetReporteUsoCfdiGastosAsync/erp_${rfc}/${fI}/${fF}`
        );
        return response.data;
      } catch (error) {
        console.log(error);
        return [];
      }
    },
    async cfdiGetNomina(rfc, fI, fF) {
      try {
        const response = await axios.get(
          `${this.rutaAxios}Consultas/GetReporteUsoCfdiNomina/erp_${rfc}/${fI}/${fF}`
        );
        return response.data;
      } catch (error) {
        console.log(error);
        return [];
      }
    },

    // ---- ORQUESTADOR: cruza emitidos/recibidos/nómina por usoCfdi ----
    async cfdiGetReporte(rfc, fI, fF) {
      try {
        const [ingresos, gastos, nomina] = await Promise.all([
          this.cfdiGetIngresos(rfc, fI, fF),
          this.cfdiGetGastos(rfc, fI, fF),
          this.cfdiGetNomina(rfc, fI, fF),
        ]);

        const listaIngresos = Array.isArray(ingresos) ? ingresos : [];
        const listaGastos = Array.isArray(gastos) ? gastos : [];
        const listaNomina = Array.isArray(nomina) ? nomina : [];

        const usosUnicos = new Set();
        [listaIngresos, listaGastos, listaNomina].forEach((lista) => {
          lista.forEach((o) => usosUnicos.add(o.usoCfdi));
        });

        const filas = [];
        usosUnicos.forEach((uso) => {
          const objIngreso = listaIngresos.find((f) => f.usoCfdi === uso);
          const objGasto = listaGastos.find((f) => f.usoCfdi === uso);
          const objNomina = listaNomina.find((f) => f.usoCfdi === uso);

          const emitidos = objIngreso ? objIngreso.subTotal || 0 : 0;
          const recibidos = objGasto ? objGasto.subTotal || 0 : 0;
          const nominaTotal = objNomina
            ? (objNomina.subTotal || 0) - (objNomina.descuento || 0)
            : 0;

          filas.push({ uso, emitidos, recibidos, nomina: nominaTotal });
        });

        return filas;
      } catch (error) {
        console.log(error);
        return [];
      }
    },

    // ================================================================
    // =================== COMPARATIVA ANUAL ===========================
    // ================================================================
    // "Determinado": lo calcula el propio sistema, sumando Uso de CFDI
    //   del AÑO COMPLETO (Enero-Diciembre), sin importar el rango de
    //   meses que tengas seleccionado en el Reporte General.
    //   - Ingresos Acumulables = suma de "emitidos"
    //   - Deducciones Autorizadas = suma de "recibidos" + suma de "nomina"
    //   - Utilidad/Pérdida = Ingresos - Deducciones
    // "Declarado": se lee del xlsx de la última Declaración Anual
    //   completada para ese ejercicio (obtenerDeclaracionAnualDeclarada.js).
    async comparativaAnualObtener(rfc, año) {
      const filasVacias = [
        {
          concepto: "Coeficiente de Utilidad del Ejercicio",
          tipo: "porcentaje",
        },
        { concepto: "Total de Ingresos Acumulables", tipo: "moneda" },
        { concepto: "Total de Deducciones Autorizadas", tipo: "moneda" },
        { concepto: "Pérdida Fiscal", tipo: "moneda" },
        { concepto: "Utilidad Fiscal", tipo: "moneda" },
      ].map((f) => ({
        ...f,
        determinado: null,
        declarado: null,
        diferencia: null,
      }));

      if (!rfc || !año) return { filas: filasVacias, mensaje: "" };

      try {
        // ---- Determinado (Uso de CFDI, año completo) ----
        const fI = `${año}-01-01`;
        const fF = `${año}-12-31`;
        const usoCfdiAnual = await this.cfdiGetReporte(rfc, fI, fF);

        const ingresosDeterminado = (usoCfdiAnual || []).reduce(
          (a, f) => a + (f.emitidos || 0),
          0
        );
        const deduccionesDeterminado = (usoCfdiAnual || []).reduce(
          (a, f) => a + (f.recibidos || 0) + (f.nomina || 0),
          0
        );
        const resultadoDeterminado =
          ingresosDeterminado - deduccionesDeterminado;
        const utilidadDeterminado =
          resultadoDeterminado > 0 ? resultadoDeterminado : 0;
        const perdidaDeterminado =
          resultadoDeterminado < 0 ? Math.abs(resultadoDeterminado) : 0;
        const coeficienteDeterminado =
          ingresosDeterminado !== 0
            ? utilidadDeterminado / ingresosDeterminado
            : 0;

        // ---- Declarado (xlsx de la Declaración Anual, si existe) ----
        let declarado = null;
        let mensaje = "";
        try {
          declarado = await obtenerDeterminacionAnualDeclarada(rfc, año, xlsx);
          if (!declarado) {
            mensaje = `No se encontró una Declaración Anual completada para el ejercicio ${año}. Se muestra únicamente lo Determinado.`;
          }
        } catch (errorDeclarado) {
          console.log(
            "Error leyendo la Declaración Anual declarada:",
            errorDeclarado
          );
          mensaje =
            "No se pudo leer el archivo de la Declaración Anual. Se muestra únicamente lo Determinado.";
        }

        const armarFila = (
          concepto,
          tipo,
          valorDeterminado,
          campoDeclarado
        ) => {
          const valorDeclarado = declarado ? declarado[campoDeclarado] : null;
          return {
            concepto,
            tipo,
            determinado: valorDeterminado,
            declarado: valorDeclarado,
            diferencia:
              valorDeclarado !== null && valorDeclarado !== undefined
                ? valorDeterminado - valorDeclarado
                : null,
          };
        };

        const filas = [
          armarFila(
            "Coeficiente de Utilidad del Ejercicio",
            "porcentaje",
            coeficienteDeterminado,
            "coeficienteUtilidad"
          ),
          armarFila(
            "Total de Ingresos Acumulables",
            "moneda",
            ingresosDeterminado,
            "ingresosAcumulables"
          ),
          armarFila(
            "Total de Deducciones Autorizadas",
            "moneda",
            deduccionesDeterminado,
            "deduccionesAutorizadas"
          ),
          armarFila(
            "Pérdida Fiscal",
            "moneda",
            perdidaDeterminado,
            "perdidaFiscal"
          ),
          armarFila(
            "Utilidad Fiscal",
            "moneda",
            utilidadDeterminado,
            "utilidadFiscal"
          ),
        ];

        return { filas, mensaje };
      } catch (error) {
        console.log("Error en comparativaAnualObtener:", error);
        return {
          filas: filasVacias,
          mensaje: "Ocurrió un error calculando la Comparativa Anual.",
        };
      }
    },

    // ---------------- ORQUESTADOR PRINCIPAL ----------------
    async generarReporte() {
      if (!this.puedeGenerar) return;
      this.loading = true;
      this.$q.loading.show({ message: "Generando reporte..." });

      const rfc = this.token ? this.token.rfc : "";
      const año = this.anio;
      const mesI = this.mesIValue;
      const mesF = this.mesFValue;

      const fI = moment(`${año}-${String(mesI).padStart(2, "0")}-01`)
        .startOf("month")
        .format("YYYY-MM-DD");
      const fF = moment(`${año}-${String(mesF).padStart(2, "0")}-01`)
        .endOf("month")
        .format("YYYY-MM-DD");

      try {
        const tareas = [];

        // Emitidos / Recibidos por RFC (concentrado)
        tareas.push(
          this.mostrarSecciones.emitidos
            ? this.GetReporteRFc(
                rfc,
                "comprobantes_emitidos",
                año,
                mesI,
                mesF,
                1
              )
            : Promise.resolve([])
        );
        tareas.push(
          this.mostrarSecciones.recibidos
            ? this.GetReporteRFc(
                rfc,
                "comprobantes_recibidos",
                año,
                mesI,
                mesF,
                1
              )
            : Promise.resolve([])
        );

        // Nomina
        tareas.push(
          this.mostrarSecciones.nomina
            ? this.GetReporteImportesNomina(
                rfc,
                "comprobantes_nomina",
                año,
                mesI,
                mesF
              )
            : Promise.resolve([[], [], [], {}])
        );

        // CxC / CxP
        tareas.push(
          this.mostrarSecciones.cxc
            ? this.GetCxC(rfc, fI, fF)
            : Promise.resolve([])
        );
        tareas.push(
          this.mostrarSecciones.cxp
            ? this.GetCxP(rfc, fI, fF)
            : Promise.resolve([])
        );

        // Flujo (emitido / recibido)
        tareas.push(
          this.mostrarSecciones.flujo
            ? this.GetReporteFlujo(rfc, "E", año, mesI, mesF)
            : Promise.resolve([])
        );
        tareas.push(
          this.mostrarSecciones.flujo
            ? this.GetReporteFlujo(rfc, "R", año, mesI, mesF)
            : Promise.resolve([])
        );

        // Pagos de IVA (siempre desde Enero, usando solo el Mes Final)
        tareas.push(
          this.mostrarSecciones.pagosIva
            ? this.ivaGetPagosReporte(rfc, año, mesF)
            : Promise.resolve([])
        );

        // Retenciones de ISR (siempre desde Enero, usando solo el Mes Final)
        tareas.push(
          this.mostrarSecciones.pagosIsr
            ? this.isrGetPagosReporte(rfc, año, mesF)
            : Promise.resolve(null)
        );

        // Pagos Provisionales de ISR (detecta régimen automáticamente)
        tareas.push(
          this.mostrarSecciones.pagosProvisionales
            ? this.ppIsrGetReporte(rfc, año, mesF)
            : Promise.resolve(null)
        );

        // Uso de CFDI (respeta el rango Mes Inicial -> Mes Final, como CxC/CxP)
        tareas.push(
          this.mostrarSecciones.usoCfdi
            ? this.cfdiGetReporte(rfc, fI, fF)
            : Promise.resolve([])
        );

        // Comparativa Anual (Determinado desde Uso de CFDI del año completo
        // vs Declarado leído de la última Declaración Anual descargada)
        tareas.push(
          this.mostrarSecciones.comparativaAnual
            ? this.comparativaAnualObtener(rfc, año)
            : Promise.resolve({ filas: [], mensaje: "" })
        );

        // Razones Financieras (mismo xlsx de la Declaración Anual, ya cacheado)
        tareas.push(
          this.mostrarSecciones.razonesFinancieras
            ? obtenerRazonesFinancieras(rfc, año - 1, xlsx)
            : Promise.resolve({
                razones: [],
                categorias: [],
                resumen: null,
                advertencias: [],
                mensaje: "",
              })
        );

        const [
          emitidos,
          recibidos,
          importesN,
          cxc,
          cxp,
          flujoEmitido,
          flujoRecibido,
          pagosIva,
          pagosIsr,
          pagosProvisionales,
          usoCfdi,
          comparativaAnual,
          razonesFinancierasResultado,
        ] = await Promise.all(tareas);

        // ---- Comprobantes ----
        this.tablaComprobantesEmitidos = Array.isArray(emitidos)
          ? emitidos
          : [];
        this.tablaComprobantesRecibidos = Array.isArray(recibidos)
          ? recibidos
          : [];

        // ---- Nomina (importes) ----
        // El backend puede regresar dos shapes distintos:
        //  A) Array plano: [{mes,percepciones,...}, {mes,...}, ...]  <- confirmado en consola
        //  B) Array anidado viejo: [ [meses...], x, y, { conceptosPorMes } ]
        this.tablaNominas = [];
        let nominaMensual = [];
        let posiblesConceptos = null;

        if (Array.isArray(importesN)) {
          if (
            importesN.length &&
            importesN[0] &&
            !Array.isArray(importesN[0]) &&
            "mes" in importesN[0]
          ) {
            // Shape A: array plano de meses
            nominaMensual = importesN;
          } else if (Array.isArray(importesN[0])) {
            // Shape B: array anidado (el que asumimos originalmente)
            nominaMensual = importesN[0];
            posiblesConceptos = importesN[3];
          }
        }

        nominaMensual.forEach((item) => {
          this.tablaNominas.push({
            mes: this.obtenerNombreMes(item.mes),
            contador: item.contador,
            percepciones: item.percepciones,
            deducciones: item.deducciones,
            otrosPagos: item.otrosPagos,
            total: item.total,
          });
        });

        // Blindaje: solo aceptamos tablaNominaConceptos si es un objeto plano
        // (no array, no número, no null). Si el shape no coincide (como en el
        // shape A, donde no vienen conceptos), lo dejamos vacío.
        if (
          posiblesConceptos &&
          typeof posiblesConceptos === "object" &&
          !Array.isArray(posiblesConceptos)
        ) {
          this.tablaNominaConceptos = posiblesConceptos;
        } else {
          this.tablaNominaConceptos = {};
        }

        // ---- CxC / CxP con dias de credito ----
        const calcularDias = (lista) => {
          lista.forEach((c) => {
            const mayor = this.obtenerFechaMasGrande(c.detalles);
            const fechaReferencia = mayor || moment().format();
            c.dias = moment(fechaReferencia).diff(moment(c.fecha), "days");
          });
          return lista;
        };
        this.tablaCxC = calcularDias(Array.isArray(cxc) ? cxc : []);
        this.tablaCxP = calcularDias(Array.isArray(cxp) ? cxp : []);

        // ---- Comparativa de flujo ----
        this.tablaComparativaFlujo = this.compararPUEPorMes(
          flujoEmitido || [],
          flujoRecibido || []
        );

        // ---- Pagos de IVA ----
        this.tablaPagosIva = Array.isArray(pagosIva) ? pagosIva : [];

        // ---- Retenciones de ISR ----
        if (
          pagosIsr &&
          typeof pagosIsr === "object" &&
          !Array.isArray(pagosIsr)
        ) {
          this.tablaPagosIsr = {
            sueldos: Array.isArray(pagosIsr.sueldos) ? pagosIsr.sueldos : [],
            asimilados: Array.isArray(pagosIsr.asimilados)
              ? pagosIsr.asimilados
              : [],
            otros: Array.isArray(pagosIsr.otros) ? pagosIsr.otros : [],
            arrendamientos: Array.isArray(pagosIsr.arrendamientos)
              ? pagosIsr.arrendamientos
              : [],
            honorarios: Array.isArray(pagosIsr.honorarios)
              ? pagosIsr.honorarios
              : [],
            demasIngresos: Array.isArray(pagosIsr.demasIngresos)
              ? pagosIsr.demasIngresos
              : [],
            isrRetenidoFavor: Array.isArray(pagosIsr.isrRetenidoFavor)
              ? pagosIsr.isrRetenidoFavor
              : [],
          };
        } else {
          this.tablaPagosIsr = {
            sueldos: [],
            asimilados: [],
            otros: [],
            arrendamientos: [],
            honorarios: [],
            demasIngresos: [],
            isrRetenidoFavor: [],
          };
        }

        // ---- Pagos Provisionales de ISR ----
        if (
          pagosProvisionales &&
          typeof pagosProvisionales === "object" &&
          !Array.isArray(pagosProvisionales)
        ) {
          this.tablaPagosProvisionales = {
            columnas: Array.isArray(pagosProvisionales.columnas)
              ? pagosProvisionales.columnas
              : [],
            filas: Array.isArray(pagosProvisionales.filas)
              ? pagosProvisionales.filas
              : [],
            mensaje: pagosProvisionales.mensaje || "",
            regimenLabel: pagosProvisionales.regimenLabel || "",
          };
        } else {
          this.tablaPagosProvisionales = {
            columnas: [],
            filas: [],
            mensaje: "",
            regimenLabel: "",
          };
        }

        // ---- Uso de CFDI ----
        this.tablaUsoCfdi = Array.isArray(usoCfdi) ? usoCfdi : [];

        // ---- Comparativa Anual ----
        if (comparativaAnual && typeof comparativaAnual === "object") {
          this.tablaComparativaAnual = Array.isArray(comparativaAnual.filas)
            ? comparativaAnual.filas
            : [];
          this.comparativaAnualMensaje = comparativaAnual.mensaje || "";
        } else {
          this.tablaComparativaAnual = [];
          this.comparativaAnualMensaje = "";
        }

        // ---- Razones Financieras ----
        if (
          razonesFinancierasResultado &&
          typeof razonesFinancierasResultado === "object"
        ) {
          this.razonesFinancieras = {
            razones: Array.isArray(razonesFinancierasResultado.razones)
              ? razonesFinancierasResultado.razones
              : [],
            categorias: Array.isArray(razonesFinancierasResultado.categorias)
              ? razonesFinancierasResultado.categorias
              : [],
            resumen: razonesFinancierasResultado.resumen || null,
            advertencias: Array.isArray(
              razonesFinancierasResultado.advertencias
            )
              ? razonesFinancierasResultado.advertencias
              : [],
            mensaje: razonesFinancierasResultado.mensaje || "",
          };
        } else {
          this.razonesFinancieras = {
            razones: [],
            categorias: [],
            resumen: null,
            advertencias: [],
            mensaje: "",
          };
        }

        this.reporteGenerado = true;
      } catch (error) {
        console.error("Error generando el reporte general:", error);
        this.$q.notify({
          type: "negative",
          message: "Ocurrió un error al generar el reporte.",
        });
      } finally {
        this.loading = false;
        this.$q.loading.hide();
      }
    },

    obtenerFechaMasGrande(detalles) {
      if (!detalles || detalles.length === 0) return null;
      return detalles.reduce((max, d) => {
        return !max || moment(d.fechaPago).isAfter(moment(max))
          ? d.fechaPago
          : max;
      }, null);
    },

    // ---------------- GENERAR PDF ----------------
    generarPdf() {
      try {
        const empresaStore = this.$store.state.empresaStore || {};
        generarPdfReporteGeneral(this.datosParaPdf, {
          empresa: empresaStore.nombre || "",
          rfc: empresaStore.rfc || "",
          // Firmante opcional: si lo defines, se agrega una página de
          // firma al final del PDF (igual que tu reporte original).
          // firmante: { nombre: "OSCAR JESUS LUENGAS SOLANO", puesto: "DIRECTOR LAUDEM AVE" },
        });
      } catch (error) {
        console.error("Error generando el PDF:", error);
        this.$q.notify({
          type: "negative",
          message: "Ocurrió un error al generar el PDF.",
        });
      }
      this.$emit("generar-pdf", this.datosParaPdf);
    },
  },
};
</script>
<style scoped>
/* ===================== TOKENS ===================== */
.rg-page {
  width: 100%;
  max-width: 100%;
  --rg-ink: #1f2933;
  --rg-slate: #6b7684;
  --rg-paper: #f7f8fa;
  --rg-border: #e6e8ec;
  --rg-primary: #bf2f2f;
  --rg-primary-dark: #9c2424;

  --rg-emitidos: #157347;
  --rg-emitidos-soft: #eaf7f0;
  --rg-recibidos: #b42318;
  --rg-recibidos-soft: #fdecea;
  --rg-nomina: #1d4ed8;
  --rg-nomina-soft: #eaf0fe;
  --rg-cxc: #0f766e;
  --rg-cxc-soft: #e7f5f3;
  --rg-cxp: #b45309;
  --rg-cxp-soft: #fdf1e3;
  --rg-flujo: #6d28d9;
  --rg-flujo-soft: #f1eafc;
  --rg-pagosiva: #be123c;
  --rg-pagosiva-soft: #fdf2f4;
  --rg-pagosisr: #334155;
  --rg-pagosisr-soft: #eef1f5;
  --rg-pp: #0c4a6e;
  --rg-pp-soft: #eaf3f8;
  --rg-usocfdi: #0891b2;
  --rg-usocfdi-soft: #e5f6fa;
  --rg-comparativaanual: #7c3aed;
  --rg-comparativaanual-soft: #f3ecfe;
  --rg-razonesfinancieras: #a21caf;
  --rg-razonesfinancieras-soft: #fbe8f6;

  background: var(--rg-paper);
  color: var(--rg-ink);
  font-feature-settings: "tnum" 1;
}

/* ===================== CARDS BASE ===================== */
.rg-card {
  background: #ffffff;
  border: 1px solid var(--rg-border);
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.04);
}

.rg-card--header {
  border-top: 3px solid var(--rg-primary);
}

.rg-separator {
  background: var(--rg-border);
}

/* ===================== HEADER TEXT ===================== */
.rg-eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--rg-primary);
  margin-bottom: 2px;
}

.rg-title {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--rg-ink);
  line-height: 1.2;
}

.rg-period {
  display: flex;
  align-items: center;
  margin-top: 6px;
  font-size: 13px;
  color: var(--rg-slate);
}

.rg-period--pending {
  color: var(--rg-recibidos);
}

.rg-toggle-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--rg-slate);
  margin-bottom: 8px;
}

/* ===================== BOTONES ===================== */
.rg-btn-primary {
  background: var(--rg-primary) !important;
  color: #ffffff !important;
  font-weight: 600;
  letter-spacing: 0.01em;
  border-radius: 8px;
  padding: 10px 18px;
  transition: background-color 0.15s ease;
}
.rg-btn-primary:hover {
  background: var(--rg-primary-dark) !important;
}

.rg-btn-pdf {
  background: var(--rg-ink) !important;
  color: #ffffff !important;
  font-weight: 600;
  border-radius: 8px;
  padding: 10px 20px;
}

/* ===================== CHIPS (toggle secciones) ===================== */
.rg-chip {
  background: #fff !important;
  border: 1px solid var(--rg-border);
  color: var(--rg-slate) !important;
  font-weight: 500;
  font-size: 12.5px;
  transition: all 0.15s ease;
}
.rg-chip--active.rg-chip--emitidos {
  border-color: var(--rg-emitidos);
  color: var(--rg-emitidos) !important;
  background: var(--rg-emitidos-soft) !important;
}
.rg-chip--active.rg-chip--recibidos {
  border-color: var(--rg-recibidos);
  color: var(--rg-recibidos) !important;
  background: var(--rg-recibidos-soft) !important;
}
.rg-chip--active.rg-chip--nomina {
  border-color: var(--rg-nomina);
  color: var(--rg-nomina) !important;
  background: var(--rg-nomina-soft) !important;
}
.rg-chip--active.rg-chip--cxc {
  border-color: var(--rg-cxc);
  color: var(--rg-cxc) !important;
  background: var(--rg-cxc-soft) !important;
}
.rg-chip--active.rg-chip--cxp {
  border-color: var(--rg-cxp);
  color: var(--rg-cxp) !important;
  background: var(--rg-cxp-soft) !important;
}
.rg-chip--active.rg-chip--flujo {
  border-color: var(--rg-flujo);
  color: var(--rg-flujo) !important;
  background: var(--rg-flujo-soft) !important;
}
.rg-chip--active.rg-chip--pagosIva {
  border-color: var(--rg-pagosiva);
  color: var(--rg-pagosiva) !important;
  background: var(--rg-pagosiva-soft) !important;
}
.rg-chip--active.rg-chip--pagosIsr {
  border-color: var(--rg-pagosisr);
  color: var(--rg-pagosisr) !important;
  background: var(--rg-pagosisr-soft) !important;
}
.rg-chip--active.rg-chip--pagosProvisionales {
  border-color: var(--rg-pp);
  color: var(--rg-pp) !important;
  background: var(--rg-pp-soft) !important;
}
.rg-chip--active.rg-chip--usoCfdi {
  border-color: var(--rg-usocfdi);
  color: var(--rg-usocfdi) !important;
  background: var(--rg-usocfdi-soft) !important;
}
.rg-chip--active.rg-chip--comparativaAnual {
  border-color: var(--rg-comparativaanual);
  color: var(--rg-comparativaanual) !important;
  background: var(--rg-comparativaanual-soft) !important;
}
.rg-chip--active.rg-chip--razonesFinancieras {
  border-color: var(--rg-razonesfinancieras);
  color: var(--rg-razonesfinancieras) !important;
  background: var(--rg-razonesfinancieras-soft) !important;
}

/* ===================== KPI CARDS ===================== */
.rg-kpi {
  position: relative;
  background: #fff;
  border: 1px solid var(--rg-border);
  border-radius: 10px;
  padding: 16px 16px 14px;
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
  overflow: hidden;
}
.rg-kpi::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 4px;
}
.rg-kpi__icon {
  font-size: 20px;
  opacity: 0.55;
  float: right;
}
.rg-kpi__label {
  font-size: 12px;
  color: var(--rg-slate);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin-bottom: 4px;
}
.rg-kpi__value {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.rg-kpi--emitidos::before {
  background: var(--rg-emitidos);
}
.rg-kpi--emitidos .rg-kpi__icon {
  color: var(--rg-emitidos);
}
.rg-kpi--emitidos .rg-kpi__value {
  color: var(--rg-emitidos);
}

.rg-kpi--recibidos::before {
  background: var(--rg-recibidos);
}
.rg-kpi--recibidos .rg-kpi__icon {
  color: var(--rg-recibidos);
}
.rg-kpi--recibidos .rg-kpi__value {
  color: var(--rg-recibidos);
}

.rg-kpi--nomina::before {
  background: var(--rg-nomina);
}
.rg-kpi--nomina .rg-kpi__icon {
  color: var(--rg-nomina);
}
.rg-kpi--nomina .rg-kpi__value {
  color: var(--rg-nomina);
}

.rg-kpi--flujo::before {
  background: var(--rg-flujo);
}
.rg-kpi--flujo .rg-kpi__icon {
  color: var(--rg-flujo);
}
.rg-kpi--flujo .rg-kpi__value {
  color: var(--rg-flujo);
}

/* ===================== SECTION HEADERS ===================== */
.rg-section {
  border-top: 3px solid transparent;
}
.rg-section--emitidos {
  border-top-color: var(--rg-emitidos);
}
.rg-section--recibidos {
  border-top-color: var(--rg-recibidos);
}
.rg-section--nomina {
  border-top-color: var(--rg-nomina);
}
.rg-section--cxc {
  border-top-color: var(--rg-cxc);
}
.rg-section--cxp {
  border-top-color: var(--rg-cxp);
}
.rg-section--flujo {
  border-top-color: var(--rg-flujo);
}
.rg-section--pagosiva {
  border-top-color: var(--rg-pagosiva);
}
.rg-section--pagosisr {
  border-top-color: var(--rg-pagosisr);
}
.rg-section--pp {
  border-top-color: var(--rg-pp);
}
.rg-section--usocfdi {
  border-top-color: var(--rg-usocfdi);
}
.rg-section--comparativaanual {
  border-top-color: var(--rg-comparativaanual);
}
.rg-section--razonesfinancieras {
  border-top-color: var(--rg-razonesfinancieras);
}

.rg-section__header {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--rg-paper);
  border-bottom: 1px solid var(--rg-border);
}
.rg-section__icon {
  font-size: 22px;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.rg-section--emitidos .rg-section__icon {
  color: var(--rg-emitidos);
  background: var(--rg-emitidos-soft);
}
.rg-section--recibidos .rg-section__icon {
  color: var(--rg-recibidos);
  background: var(--rg-recibidos-soft);
}
.rg-section--nomina .rg-section__icon {
  color: var(--rg-nomina);
  background: var(--rg-nomina-soft);
}
.rg-section--cxc .rg-section__icon {
  color: var(--rg-cxc);
  background: var(--rg-cxc-soft);
}
.rg-section--cxp .rg-section__icon {
  color: var(--rg-cxp);
  background: var(--rg-cxp-soft);
}
.rg-section--flujo .rg-section__icon {
  color: var(--rg-flujo);
  background: var(--rg-flujo-soft);
}
.rg-section--pagosiva .rg-section__icon {
  color: var(--rg-pagosiva);
  background: var(--rg-pagosiva-soft);
}
.rg-section--pagosisr .rg-section__icon {
  color: var(--rg-pagosisr);
  background: var(--rg-pagosisr-soft);
}
.rg-section--pp .rg-section__icon {
  color: var(--rg-pp);
  background: var(--rg-pp-soft);
}
.rg-section--usocfdi .rg-section__icon {
  color: var(--rg-usocfdi);
  background: var(--rg-usocfdi-soft);
}
.rg-section--comparativaanual .rg-section__icon {
  color: var(--rg-comparativaanual);
  background: var(--rg-comparativaanual-soft);
}
.rg-section--razonesfinancieras .rg-section__icon {
  color: var(--rg-razonesfinancieras);
  background: var(--rg-razonesfinancieras-soft);
}

.rg-salud-valor {
  font-size: 34px;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.rg-salud-valor--bueno {
  color: var(--rg-emitidos);
}
.rg-salud-valor--regular {
  color: #b45309;
}
.rg-salud-valor--malo {
  color: var(--rg-recibidos);
}

.rg-parrafo-veredicto {
  font-size: 13px;
  color: var(--rg-ink);
  margin: 0 0 8px;
}

.rg-section__title {
  font-size: 15px;
  font-weight: 700;
  color: var(--rg-ink);
}
.rg-section__subtitle {
  font-size: 12px;
  color: var(--rg-slate);
  margin-top: 1px;
}

.rg-subheading {
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 700;
  color: var(--rg-slate);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.rg-currency-header {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--rg-flujo);
  padding-bottom: 4px;
  display: flex;
  align-items: center;
}

.rg-empty-note {
  font-size: 13px;
  color: var(--rg-slate);
  font-style: italic;
  padding: 8px 4px;
}

/* ===================== TABLAS ===================== */
.rg-table :deep(thead tr th) {
  background: var(--rg-paper);
  color: var(--rg-slate);
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid var(--rg-border);
}
.rg-table :deep(tbody tr:nth-child(even)) {
  background: #fafbfc;
}
.rg-table :deep(tbody tr:hover) {
  background: var(--rg-paper);
}
.rg-table :deep(tbody td) {
  font-size: 13px;
  color: var(--rg-ink);
}
.rg-table--nested :deep(thead tr th) {
  background: #f2f4f7;
}

.rg-cell-money {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum" 1;
}
.rg-cell-strong {
  font-weight: 700;
}

.rg-positive {
  color: var(--rg-emitidos);
}
.rg-negative {
  color: var(--rg-recibidos);
}

.rg-badge {
  font-weight: 600;
  letter-spacing: 0.01em;
}

.rg-expansion :deep(.rg-expansion__header) {
  font-size: 13px;
  font-weight: 600;
  color: var(--rg-ink);
}
</style>