<template>
  <q-layout view="hHh lpR fFf">
    <q-dialog v-model="dialogAsistente" position="bottom">
      <Index style="max-width: 600px; min-width: 600px"></Index>
    </q-dialog>

    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="mdi-home"
          aria-label="Menu"
          @click="$router.push({ name: 'Home' })"
        />
        <q-toolbar-title>
          <div class="text-h6 text-weight-bolder">REPORTES</div>
        </q-toolbar-title>
        <div class="text-h6 q-mr-lg">{{ $store.state.usuario.rfc }}</div>
        <q-btn
          flat
          class="q-mx-sm"
          round
          dense
          icon="mdi-chat-question"
          @click="dialogAsistente = true"
        />

        <q-btn
          flat
          class="q-mx-sm"
          round
          dense
          icon="mdi-domain"
          @click="drawerEmpresas = !drawerEmpresas"
        />
        <q-btn
          flat
          class="q-mx-sm"
          round
          dense
          icon="mdi-account"
          @click="drawerPerfil = !drawerPerfil"
        />
      </q-toolbar>
    </q-header>

    <!-- DRAWER DERECHO -->
    <q-drawer :width="350" v-model="drawerPerfil" behavior="mobile" side="right" bordered>
      <drawerPerfil></drawerPerfil>
    </q-drawer>

    <!-- DRAWER EMPRESAS -->
    <q-drawer
      :width="350"
      v-model="drawerEmpresas"
      behavior="mobile"
      side="right"
      bordered
    >
      <drawerEmpresas></drawerEmpresas>
    </q-drawer>

    <!-- TARJETA DE CONFIGURACIÓN CENTRADA -->

    <div
      class="row justify-center q-mt-md"
      v-if="mostrarAdvertenciaDatosEmpresa === true"
    >
      <q-card class="col-xs-12 col-sm-10 col-md-8 col-lg-6 q-mt-md no-shadow">
        <q-card-section>
          <div class="text-h6">¡Información empresarial incompleta!</div>
          <div class="text-subtitle2">
            Para generar reportes precisos y completos, necesitamos todos los datos de tu
            empresa.
            <strong>Los reportes actuales tienen información limitada.</strong>
          </div>
          <div class="text-body2 q-mt-sm">
            Completar tu perfil te permitirá:
            <ul class="q-mt-xs">
              <li>Generar reportes con información completa</li>
              <li>Acceder a análisis detallados</li>
              <li>Mejorar la presentación de tus documentos</li>
            </ul>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            color="primary"
            label="Completar ahora"
            icon="arrow_forward"
            class="q-px-md"
            @click="$router.push('/Configuracion')"
          />
        </q-card-actions>
      </q-card>
    </div>

    <div class="row justify-center q-mt-md">
      <q-card class="col-xs-12 col-sm-10 col-md-10 col-lg-10 q-mt-md no-shadow">
        <q-card-section>
          <div class="row justify-between items-center">
            <div class="text-h6">Configuración del reporte</div>
          </div>
        </q-card-section>

        <q-card-section>
          <div class="text-bold q-mb-md">Fecha y rango</div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-4">
              <q-select
                outlined
                dense
                v-model="selectedAnio"
                :options="itemsAnios"
                label="Año"
                class="full-width"
              />
            </div>
            <div class="col-12 col-sm-4">
              <q-select
                outlined
                dense
                v-model="selectedMesI"
                :options="itemsMes"
                label="Mes Inicial"
                class="full-width"
              />
            </div>
            <div class="col-12 col-sm-4">
              <q-select
                outlined
                dense
                v-model="selectedMesF"
                :options="itemsMes"
                label="Mes Final"
                class="full-width"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div class="row justify-center q-mt-md">
      <q-card bordered class="col-xs-12 col-sm-10 col-md-10 col-lg-10 q-mt-md no-shadow">
        <q-tabs
          v-model="tab"
          class="bg-grey-3"
          active-color="primary"
          indicator-color="primary"
          dense
          align="justify"
          narrow-indicator
          bordered
        >
          <q-tab name="mails" label="Reporte General" />
          <q-tab name="alarms" label="Reporte de Impuestos" />
        </q-tabs>

        <q-tab-panels bordered v-model="tab" animated>
          <q-tab-panel bordered name="mails" class="full-width">
            <div class="row full-width q-mt-md no-shadow">
              <div class="text-bold q-mb-md col-12">Configuración del reporte</div>
              <div class="col-12">
                <q-list bordered class="q-mt-md rounded-borders">
                  <q-expansion-item
                    expand-separator
                    icon="mdi-clipboard-list-outline"
                    label="Mostrar detalles de los reportes"
                  >
                    <q-list separator>
                      <!-- Iteramos sobre cada sección de concentrados -->
                      <q-expansion-item
                        v-for="(section, sectionName) in sections"
                        :key="sectionName"
                        expand-separator
                        icon="mdi-text-box-multiple"
                        :label="sectionName"
                        v-if="section && section.items"
                        :header-inset-level="1"
                      >
                        <q-list separator :content-inset-level="0.5">
                          <!-- Opción para seleccionar todos los elementos de la sección -->
                          <q-item tag="label" v-ripple :inset-level="2">
                            <q-item-section>
                              <q-item-label>Todos los elementos</q-item-label>
                            </q-item-section>
                            <q-item-section avatar>
                              <q-toggle
                                color="blue"
                                :value="checkConcentradosSelected(sectionName)"
                                @input="toggleAllConcentrados(sectionName, $event)"
                              />
                            </q-item-section>
                          </q-item>

                          <!-- Elementos individuales de la sección -->
                          <q-item
                            tag="label"
                            v-ripple
                            v-for="item in section.items"
                            :key="item.key"
                            :inset-level="2"
                          >
                            <q-item-section>
                              <q-item-label>{{ item.label }}</q-item-label>
                            </q-item-section>
                            <q-item-section avatar>
                              <q-toggle
                                color="blue"
                                v-model="mostrarConcentradosReporte[item.key]"
                                val="true"
                              />
                            </q-item-section>
                          </q-item>
                        </q-list>
                      </q-expansion-item>
                    </q-list>
                  </q-expansion-item>

                  <q-expansion-item
                    expand-separator
                    icon="mdi-clipboard-list-outline"
                    label="Secciones a mostrar en el reporte"
                  >
                    <q-list separator>
                      <q-expansion-item
                        v-for="(section, sectionName) in sections"
                        :key="sectionName"
                        expand-separator
                        icon="mdi-text-box-multiple"
                        :label="sectionName"
                        v-if="section && section.items"
                        :header-inset-level="1"
                      >
                        <q-list separator :content-inset-level="0.5">
                          <!-- Opción para seleccionar todos los elementos de la sección -->
                          <q-item tag="label" v-ripple :inset-level="2">
                            <q-item-section>
                              <q-item-label>Todos los elementos</q-item-label>
                            </q-item-section>
                            <q-item-section avatar>
                              <q-toggle
                                color="blue"
                                @input="toggleAllSecciones(sectionName, $event)"
                                :value="checkSeccionesSelected(sectionName)"
                              />
                            </q-item-section>
                          </q-item>

                          <!-- Elementos individuales de la sección -->
                          <q-item
                            tag="label"
                            v-ripple
                            v-for="item in section.items"
                            :key="item.key"
                            :inset-level="2"
                          >
                            <q-item-section>
                              <q-item-label>{{ item.label }}</q-item-label>
                            </q-item-section>
                            <q-item-section avatar>
                              <q-toggle
                                color="blue"
                                v-model="mostrarSeccionesReporte[item.key]"
                                val="true"
                              />
                            </q-item-section>
                          </q-item>
                        </q-list>
                      </q-expansion-item>
                    </q-list>
                  </q-expansion-item>
                  <!-- 
            <q-expansion-item
              expand-separator
              icon="palette"
              label="Personalizar colores del reporte"
            >
              <q-list separator>
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label> CFDI </q-item-label>
                  </q-item-section>

                  <q-item-section avatar>
                    <q-btn
                      :style="{ backgroundColor: colores.cfdi }"
                      round
                      size="sm"
                      unelevated
                      @click="abrirPickerCfdi = true"
                    >
                      <q-tooltip>{{ colores.encabezado }}</q-tooltip>
                    </q-btn>

                    <q-dialog v-model="abrirPickerCfdi">
                      <q-card>
                        <q-card-section>
                          <div class="text-h6">Color del CFDI</div>
                        </q-card-section>
                        <q-card-section class="q-pt-none">
                          <q-color
                            v-model="colores.cfdi"
                            @change="actualizarColores('cfdi', $event)"
                          />
                        </q-card-section>
                        <q-card-actions align="right">
                          <q-btn
                            flat
                            label="Cerrar"
                            color="primary"
                            v-close-popup
                          />
                        </q-card-actions>
                      </q-card>
                    </q-dialog>
                  </q-item-section>
                </q-item>

                <q-item v-ripple>
                  <q-item-section>
                    <q-item-label> Emitidos </q-item-label>
                  </q-item-section>

                  <q-item-section avatar>
                    <q-btn
                      :style="{ backgroundColor: colores.emitidos }"
                      round
                      size="sm"
                      unelevated
                      @click="abrirPickerEmitidos = true"
                    >
                      <q-tooltip>{{ colores.encabezado }}</q-tooltip>
                    </q-btn>

                    <q-dialog v-model="abrirPickerEmitidos">
                      <q-card>
                        <q-card-section>
                          <div class="text-h6">Color de emitidos</div>
                        </q-card-section>
                        <q-card-section class="q-pt-none">
                          <q-color
                            v-model="colores.emitidos"
                            @change="actualizarColores('emitidos', $event)"
                          />
                        </q-card-section>
                        <q-card-actions align="right">
                          <q-btn
                            flat
                            label="Cerrar"
                            color="primary"
                            v-close-popup
                          />
                        </q-card-actions>
                      </q-card>
                    </q-dialog>
                  </q-item-section>
                </q-item>

                <q-item v-ripple>
                  <q-item-section>
                    <q-item-label> Recibidos </q-item-label>
                  </q-item-section>

                  <q-item-section avatar>
                    <q-btn
                      :style="{ backgroundColor: colores.recibidos }"
                      round
                      size="sm"
                      unelevated
                      @click="abrirPickerRecibidos = true"
                    >
                      <q-tooltip>{{ colores.encabezado }}</q-tooltip>
                    </q-btn>

                    <q-dialog v-model="abrirPickerRecibidos">
                      <q-card>
                        <q-card-section>
                          <div class="text-h6">Color de recibidos</div>
                        </q-card-section>
                        <q-card-section class="q-pt-none">
                          <q-color
                            v-model="colores.recibidos"
                            @change="actualizarColores('recibidos', $event)"
                          />
                        </q-card-section>
                        <q-card-actions align="right">
                          <q-btn
                            flat
                            label="Cerrar"
                            color="primary"
                            v-close-popup
                          />
                        </q-card-actions>
                      </q-card>
                    </q-dialog>
                  </q-item-section>
                </q-item>

                <q-item v-ripple>
                  <q-item-section>
                    <q-item-label> Nómina </q-item-label>
                  </q-item-section>

                  <q-item-section avatar>
                    <q-btn
                      :style="{ backgroundColor: colores.nomina }"
                      round
                      size="sm"
                      unelevated
                      @click="abrirPickerNomina = true"
                    >
                      <q-tooltip>{{ colores.encabezado }}</q-tooltip>
                    </q-btn>

                    <q-dialog v-model="abrirPickerNomina">
                      <q-card>
                        <q-card-section>
                          <div class="text-h6">Color de nómina</div>
                        </q-card-section>
                        <q-card-section class="q-pt-none">
                          <q-color
                            v-model="colores.nomina"
                            @change="actualizarColores('nomina', $event)"
                          />
                        </q-card-section>
                        <q-card-actions align="right">
                          <q-btn
                            flat
                            label="Cerrar"
                            color="primary"
                            v-close-popup
                          />
                        </q-card-actions>
                      </q-card>
                    </q-dialog>
                  </q-item-section>
                </q-item>

                <q-item v-ripple>
                  <q-item-section>
                    <q-item-label> Riesgo Fiscal </q-item-label>
                  </q-item-section>

                  <q-item-section avatar>
                    <q-btn
                      :style="{ backgroundColor: colores.riesgoFiscal }"
                      round
                      size="sm"
                      unelevated
                      @click="abrirPickerRiesgoFiscal = true"
                    >
                      <q-tooltip>{{ colores.encabezado }}</q-tooltip>
                    </q-btn>

                    <q-dialog v-model="abrirPickerRiesgoFiscal">
                      <q-card>
                        <q-card-section>
                          <div class="text-h6">Color de riesgo fiscal</div>
                        </q-card-section>
                        <q-card-section class="q-pt-none">
                          <q-color
                            v-model="colores.riesgoFiscal"
                            @change="actualizarColores('riesgoFiscal', $event)"
                          />
                        </q-card-section>
                        <q-card-actions align="right">
                          <q-btn
                            flat
                            label="Cerrar"
                            color="primary"
                            v-close-popup
                          />
                        </q-card-actions>
                      </q-card>
                    </q-dialog>
                  </q-item-section>
                </q-item>

                <q-item v-ripple>
                  <q-item-section>
                    <q-item-label> Impuestos </q-item-label>
                  </q-item-section>

                  <q-item-section avatar>
                    <q-btn
                      :style="{ backgroundColor: colores.impuestos }"
                      round
                      size="sm"
                      unelevated
                      @click="abrirPickerImpuestos = true"
                    >
                      <q-tooltip>{{ colores.encabezado }}</q-tooltip>
                    </q-btn>

                    <q-dialog v-model="abrirPickerImpuestos">
                      <q-card>
                        <q-card-section>
                          <div class="text-h6">Color de impuestos</div>
                        </q-card-section>
                        <q-card-section class="q-pt-none">
                          <q-color
                            v-model="colores.impuestos"
                            @change="actualizarColores('impuestos', $event)"
                          />
                        </q-card-section>
                        <q-card-actions align="right">
                          <q-btn
                            flat
                            label="Cerrar"
                            color="primary"
                            v-close-popup
                          />
                        </q-card-actions>
                      </q-card>
                    </q-dialog>
                  </q-item-section>
                </q-item>

                <q-item v-ripple>
                  <q-item-section>
                    <q-item-label> Otros </q-item-label>
                  </q-item-section>

                  <q-item-section avatar>
                    <q-btn
                      :style="{ backgroundColor: colores.otros }"
                      round
                      size="sm"
                      unelevated
                      @click="abrirPickerOtros = true"
                    >
                      <q-tooltip>{{ colores.encabezado }}</q-tooltip>
                    </q-btn>

                    <q-dialog v-model="abrirPickerOtros">
                      <q-card>
                        <q-card-section>
                          <div class="text-h6">Color de otros</div>
                        </q-card-section>
                        <q-card-section class="q-pt-none">
                          <q-color
                            v-model="colores.otros"
                            @change="actualizarColores('otros', $event)"
                          />
                        </q-card-section>
                        <q-card-actions align="right">
                          <q-btn
                            flat
                            label="Cerrar"
                            color="primary"
                            v-close-popup
                          />
                        </q-card-actions>
                      </q-card>
                    </q-dialog>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>
           -->
                </q-list>
              </div>
              <div class="col-12 text-right q-mt-lg">
                <!-- <q-btn @click="ExportPdfIndice" dense color="primary"
            class="q-ml-md q-px-xl q-py-xs btn-redondeado bg-red-5">
            <q-icon name="download" left size="sm" />
            Descargar Índice
          </q-btn> -->
                <!-- <q-btn
            @click="GetReportePMPDF()"
            dense
            color="primary"
            class="q-ml-md q-px-xl q-py-xs btn-redondeado bg-red-5"
          >
            <q-icon name="download" left size="sm" />
            Generar reporte impuestos
          </q-btn> -->

                <q-btn
                  @click="generarReporteEmpresarial"
                  dense
                  color="primary"
                  class="q-ml-md q-px-xl q-py-xs btn-redondeado bg-red-5"
                >
                  <q-icon name="download" left size="sm" />
                  Generar reporte
                </q-btn>
                <!-- <q-btn @click="getResumenGeneral" dense color="primary"
            class="q-ml-md q-px-xl q-py-xs btn-redondeado bg-red-5">
            <q-icon name="download" left size="sm" />
            Generar resumen general
          </q-btn> -->
              </div>
              <div class="col-12 q-mt-lg">
                <ViewReporteGeneral></ViewReporteGeneral>
              </div>
            </div>
          </q-tab-panel>
          <q-tab-panel bordered name="alarms" class="full-width">
            <div class="q-pa-lg">
              <div class="row no-wrap justify-between q-mb-md">
                <div class="text-bold text-h5">Reporte de Impuestos</div>

                <q-btn
                  @click="runAll"
                  dense
                  color="primary"
                  class="q-ml-md q-px-xl q-py-xs btn-redondeado bg-red-5"
                >
                  <q-icon name="download" left size="sm" />
                  Consultar información
                </q-btn>
              </div>

              <div v-for="(task, index) in tasks" :key="index" class="q-mb-md">
                <div class="text-subtitle1">
                  {{ task.title }}
                </div>

                <div class="row items-center">
                  <div class="col-12 row no-wrap">
                    <q-linear-progress
                      class="q-mr-md"
                      :value="task.progress"
                      :color="
                        task.status === 'success'
                          ? 'green'
                          : task.status === 'error'
                          ? 'red'
                          : 'primary'
                      "
                      rounded
                      striped
                      size="20px"
                    />
                    <q-btn
                      round
                      v-if="task.status !== 'loading'"
                      :icon="task.status === 'error' ? 'mdi-update' : 'mdi-update'"
                      color="primary"
                      @click="runTask(index)"
                      style="margin-top: -10px"
                    />

                    <q-spinner v-else color="primary" size="24px" />
                  </div>
                </div>
              </div>

              <div class="row no-wrap justify-between q-mb-md">
                <q-table
                  class="full-width no-shadow"
                  bordered
                  title="Declaraciones Anuales"
                  :data="dataAnual"
                  :columns="columnsAnual"
                  row-key="columna1"
                >
                  <template v-slot:body="props">
                    <q-tr :props="props">
                      <q-td key="columna1" :props="props">
                        {{ props.row.columna1 }}
                      </q-td>
                      <q-td key="columna2" :props="props">
                        {{ formatCurrency(props.row.columna2) }}
                        <q-popup-edit
                          v-model="props.row.columna2"
                          title="Determinado"
                          auto-save
                          v-slot="scope"
                        >
                          <q-input
                            type="number"
                            v-model.number="scope.value"
                            dense
                            autofocus
                          />
                        </q-popup-edit>
                      </q-td>

                      <q-td key="columna3" :props="props">
                        {{ formatCurrency(props.row.columna3) }}
                        <q-popup-edit
                          v-model="props.row.columna3"
                          title="Declarado"
                          auto-save
                          v-slot="scope"
                        >
                          <q-input
                            type="number"
                            v-model.number="scope.value"
                            dense
                            autofocus
                          />
                        </q-popup-edit>
                      </q-td>
                      <q-td key="columna4" :props="props">{{
                        formatCurrency(props.row.columna2 - props.row.columna3)
                      }}</q-td>
                    </q-tr>
                  </template>
                </q-table>
              </div>
              <div class="row no-wrap justify-between q-mb-md">
                <q-input
                  v-model="comentarios"
                  filled
                  autogrow
                  label="Comentarios"
                  class="full-width"
                />
              </div>

              <div class="row no-wrap justify-between q-mb-md">
                <div class="text-bold text-h5"></div>
                <q-btn
                  @click="GetReportePMPDF()"
                  dense
                  color="primary"
                  class="q-ml-md q-px-xl q-py-xs btn-redondeado bg-red-5"
                >
                  <q-icon name="download" left size="sm" />
                  Generar PDF
                </q-btn>
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>
  </q-layout>
</template>

<script>
import { ref } from "vue";
import axios from "axios";
import drawerPerfil from "../DrawerPerfil/DrawerPerfil.vue";
import drawerEmpresas from "../DrawerEmpresas/DrawerEmpresas.vue";
import moment from "moment";
import { startOfMonth, endOfMonth, format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { QSpinnerCube } from "quasar";
import {
  generarReporteEmpresarial,
  agregarPortada,
  agregarPaginaSeccion,
  agregarPieDePagina,
  contenidoDatosGenerales,
  contenidoDatosFinancieros,
  descargarPDF,
} from "../Pdf/GeneradorPDF.js";
import { generarIndiceEmpresarial, descargarPDFIndice } from "../Pdf/PortadaPDF.js";
import ViewReporteGeneral from "./ViewReporteGeneral.vue";
import Index from "../Asistente/Index.vue";
import { generarReporte } from "../Pdf/ReportePagosMensuales.js";
import logo from "@/assets/logo_contago_sin_fondo.png";
export default {
  name: "MainLayout",
  components: {
    drawerPerfil,
    drawerEmpresas,
    ViewReporteGeneral,
    Index,
  },
  data() {
    return {
      dialogAsistente: false,
      drawerEmpresas: false,
      drawerPerfil: false,
      isDarkMode: false,
      leftDrawerOpen: false,
      drawer: false,
      miniState: true,

      //FECHAS
      itemsAnios: [
        "2026",
        "2025",
        "2024",
        "2023",
        "2022",
        "2021",
        "2020",
        "2019",
        "2018",
      ],
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

      tableColums: [],
      tableData: [],

      selectedAnio: null,
      selectedMesI: { label: "ENERO", value: 1 },
      selectedMesF: null,
      dataReporte: null,

      //VARIABLES
      clientesConcentrados: 1,
      proveedoresConcentrados: 1,
      opcionesReporte: {
        mesInicial: 1,
        mesFinal: 1,
        anio: 2026,
        esMensual: true,
      },
      datosEmpresa: {
        nombre: "",
        rfc: "",
        regimenFiscal: "",
        domicilio: "",
      },
      mostrarAdvertenciaDatosEmpresa: false,

      sections: {
        "CFDI y Comprobantes": {
          items: [
            { key: "mostrarUsoCFDI", label: "Uso CFDI" },
            { key: "mostrarEmitidos", label: "Emitidos" },
            { key: "mostrarRfcEmitidos", label: "RFC Emitidos" },
            { key: "mostrarRecibidos", label: "Recibidos" },
            { key: "mostrarRfcRecibidos", label: "RFC Recibidos" },
          ],
        },
        Nómina: {
          items: [
            { key: "mostrarNomina", label: "Nómina" },
            { key: "mostrarNominaGeneral", label: "Nómina General" },
            { key: "mostrarNominaTrabajadores", label: "Nómina Trabajadores" },
            { key: "mostrarNominaConceptos", label: "Nómina Conceptos" },
            { key: "mostrarNominaDuplicadoO", label: "Nómina Duplicado O" },
            { key: "mostrarNominaDuplicadoE", label: "Nómina Duplicado E" },
          ],
        },
        Flujo: {
          items: [
            { key: "mostrarFlujoEmitido", label: "Flujo Emitido" },
            { key: "mostrarFlujoRecibido", label: "Flujo Recibido" },
            {
              key: "mostrarCuentasPendientesEmitidos",
              label: "Cuentas Pendientes Emitidos",
            },
            {
              key: "mostrarCuentasPendientesRecibidos",
              label: "Cuentas Pendientes Recibidos",
            },
            {
              key: "mostrarMetodosPagoEmitidos",
              label: "Métodos Pago Emitidos",
            },
            {
              key: "mostrarMetodosPagoRecibidos",
              label: "Métodos Pago Recibidos",
            },
          ],
        },
        "Riesgo Fiscal": {
          items: [
            { key: "mostrarPue99Emitido", label: "PUE 99 Emitido" },
            { key: "mostrarPue99Recibido", label: "PUE 99 Recibido" },
            { key: "mostrarPue30Emitido", label: "PUE 30 Emitido" },
            { key: "mostrarPue30Recibido", label: "PUE 30 Recibido" },
            {
              key: "mostrarSinImpuestosEmitidos",
              label: "Sin Impuestos Emitidos",
            },
            {
              key: "mostrarSinImpuestosRecibidos",
              label: "Sin Impuestos Recibidos",
            },
            {
              key: "mostrarRiesgoArrendamiento",
              label: "Riesgo Arrendamiento",
            },
            {
              key: "mostrarRiesgoConceptosEmitidos",
              label: "Riesgo Conceptos Emitidos",
            },
            {
              key: "mostrarRiesgoConceptosRecibidos",
              label: "Riesgo Conceptos Recibidos",
            },
            { key: "mostrarGastosEfectivo", label: "Gastos Efectivo" },
            { key: "mostrarNotasSinRelacion", label: "Notas Sin Relación" },
            {
              key: "mostrarPagoFueraDeTiempoEmitidos",
              label: "Pago Fuera De Tiempo Emitidos",
            },
            {
              key: "mostrarPagoFueraDeTiempoRecibidos",
              label: "Pago Fuera De Tiempo Recibidos",
            },
            {
              key: "mostrarPagoAntesDeComprobanteEmitidos",
              label: "Pago Antes De Comprobante Emitidos",
            },
            {
              key: "mostrarPagoAntesDeComprobanteRecibidos",
              label: "Pago Antes De Comprobante Recibidos",
            },
            {
              key: "mostrarRiesgoFacturadoGlobal",
              label: "Riesgo Facturado Global",
            },
          ],
        },
        Impuestos: {
          items: [
            { key: "mostrarReporteIva", label: "Reporte IVA" },
            { key: "mostrarIvaRetEmitidos", label: "IVA Ret Emitidos" },
            { key: "mostrarIvaRetRecibidos", label: "IVA Ret Recibidos" },
            { key: "mostrarIsrNomina", label: "ISR Nómina" },
            { key: "mostrarRetencionesIsr", label: "Retenciones ISR" },
            { key: "mostrarIeps", label: "IEPS" },
          ],
        },
        Informativo: {
          items: [
            {
              key: "mostrarConsumoCombustibleEmitido",
              label: "Consumo Combustible Emitido",
            },
            {
              key: "mostrarConsumoCombustibleRecibido",
              label: "Consumo Combustible Recibido",
            },
          ],
        },
        Anticipos: {
          items: [
            { key: "mostrarAnticiposEmitidos", label: "Anticipos Emitidos" },
            { key: "mostrarAnticiposRecibidos", label: "Anticipos Recibidos" },
          ],
        },

        "Listas Negras": {
          items: [{ key: "mostrarListasNegras", label: "Lista Negra" }],
        },
      },

      mostrarSeccionesReporte: {
        // CFDI y Comprobantes
        mostrarUsoCFDI: true,
        mostrarEmitidos: true,
        mostrarRfcEmitidos: true,
        mostrarRecibidos: true,
        mostrarRfcRecibidos: true,

        // Nómina
        mostrarNomina: true,
        mostrarNominaGeneral: true,
        mostrarNominaTrabajadores: true,
        mostrarNominaConceptos: true,
        mostrarNominaDuplicadoO: true,
        mostrarNominaDuplicadoE: true,

        // Flujo
        mostrarFlujoEmitido: true,
        mostrarFlujoRecibido: true,
        mostrarCuentasPendientesEmitidos: true,
        mostrarCuentasPendientesRecibidos: true,
        mostrarMetodosPagoEmitidos: true,
        mostrarMetodosPagoRecibidos: true,

        // Riesgo Fiscal
        mostrarPue99Emitido: true,
        mostrarPue99Recibido: true,
        mostrarPue30Emitido: true,
        mostrarPue30Recibido: true,
        mostrarSinImpuestosEmitidos: true,
        mostrarSinImpuestosRecibidos: true,
        mostrarRiesgoArrendamiento: true,
        mostrarRiesgoConceptosEmitidos: true,
        mostrarRiesgoConceptosRecibidos: true,
        mostrarGastosEfectivo: true,
        mostrarNotasSinRelacion: true,
        mostrarPagoFueraDeTiempoEmitidos: true,
        mostrarPagoFueraDeTiempoRecibidos: true,
        mostrarPagoAntesDeComprobanteEmitidos: true,
        mostrarPagoAntesDeComprobanteRecibidos: true,

        mostrarRiesgoFacturadoGlobal: true,

        // Impuestos
        mostrarReporteIva: true,
        mostrarIvaRetEmitidos: true,
        mostrarIvaRetRecibidos: true,
        mostrarIsrNomina: true,
        mostrarRetencionesIsr: true,
        mostrarIeps: true,

        // Informativo
        mostrarConsumoCombustibleEmitido: true,
        mostrarConsumoCombustibleRecibido: true,

        // Anticipos
        mostrarAnticiposEmitidos: true,
        mostrarAnticiposRecibidos: true,
        mostrarListasNegras: true,
      },

      mostrarConcentradosReporte: {
        // CFDI y Comprobantes
        mostrarTodosUsoCFDI: true,
        mostrarUsoCFDI: true,
        mostrarEmitidos: true,
        mostrarRfcEmitidos: true,
        mostrarRecibidos: true,
        mostrarRfcRecibidos: true,

        // Nómina
        mostrarTodosNomina: true,
        mostrarNomina: true,

        // Flujo
        mostrarTodosFlujo: true,
        mostrarFlujoEmitido: true,
        mostrarFlujoRecibido: true,
        mostrarNominaGeneral: true,
        mostrarNominaTrabajadores: true,
        mostrarNominaConceptos: true,
        mostrarCuentasPendientesEmitidos: true,
        mostrarCuentasPendientesRecibidos: true,
        mostrarMetodosPagoEmitidos: true,
        mostrarMetodosPagoRecibidos: true,

        // Riesgo Fiscal
        mostrarPue99Emitido: true,
        mostrarPue99Recibido: true,
        mostrarPue30Emitido: true,
        mostrarPue30Recibido: true,
        mostrarSinImpuestosEmitidos: true,
        mostrarSinImpuestosRecibidos: true,
        mostrarRiesgoArrendamiento: true,
        mostrarRiesgoConceptosEmitidos: true,
        mostrarRiesgoConceptosRecibidos: true,
        mostrarGastosEfectivo: true,
        mostrarNotasSinRelacion: true,
        mostrarPagoFueraDeTiempoEmitidos: true,
        mostrarPagoFueraDeTiempoRecibidos: true,
        mostrarPagoAntesDeComprobanteEmitidos: true,
        mostrarPagoAntesDeComprobanteRecibidos: true,
        mostrarNominaDuplicadoO: true,
        mostrarNominaDuplicadoE: true,
        mostrarRiesgoFacturadoGlobal: true,

        // Impuestos
        mostrarReporteIva: true,
        mostrarIvaRetEmitidos: true,
        mostrarIvaRetRecibidos: true,
        mostrarIsrNomina: true,
        mostrarRetencionesIsr: true,
        mostrarIeps: true,

        // Informativo
        mostrarConsumoCombustibleEmitido: true,
        mostrarConsumoCombustibleRecibido: true,

        // Anticipos
        mostrarAnticiposEmitidos: true,
        mostrarAnticiposRecibidos: true,

        mostrarListasNegras: true,
      },

      coloresScheme: {
        emitidos: {
          primario: [67, 160, 71], // Verde
          secundario: [153, 215, 156],
        },
        recibidos: {
          primario: [40, 75, 140], // Azul
          secundario: [110, 140, 200],
        },
        nomina: {
          primario: [199, 80, 121], // Rosa
          secundario: [247, 179, 203],
        },
        riesgoFiscal: {
          primario: [155, 45, 45], // Rojo
          secundario: [230, 120, 120],
        },
        flujo: {
          primario: [67, 160, 71], // Verde para emitidos
          secundario: [153, 215, 156],
        },
        impuestos: {
          primario: [242, 133, 0], // Naranja
          secundario: [255, 194, 120],
        },
        informativo: {
          primario: [98, 85, 70], // Café
          secundario: [179, 164, 145],
        },
        usoCFDI: {
          primario: [226, 165, 18], // Amarillo
          secundario: [255, 235, 160],
        },
      },

      colores: {
        cfdi: rgbToHex(226, 165, 18), // usoCFDI
        emitidos: rgbToHex(67, 160, 71), // emitidos
        recibidos: rgbToHex(40, 75, 140), // recibidos
        nomina: rgbToHex(199, 80, 121), // nomina
        riesgoFiscal: rgbToHex(155, 45, 45), // riesgoFiscal
        impuestos: rgbToHex(242, 133, 0), // impuestos
        otros: rgbToHex(98, 85, 70), // informativo
      },

      abrirPickerCfdi: false,
      abrirPickerEmitidos: false,
      abrirPickerRecibidos: false,
      abrirPickerNomina: false,
      abrirPickerRiesgoFiscal: false,
      abrirPickerImpuestos: false,
      abrirPickerOtros: false,

      disabledItems: {
        "CFDI y Comprobantes": false,
        Nómina: false,
        Flujo: false,
        "Riesgo Fiscal": false,
        Impuestos: false,
        Informativo: false,
        Anticipos: false,
      },

      dataComprobantes: [],
      dataIvaRetenido: [],
      dataSueldos: [],
      dataAsimilados: [],
      dataOtros: [],
      dataHonorarios: [],
      dataArrendamientos: [],
      añosRegimen: [],
      columns: [],

      regimenSeleccionado: null,
      regimenSeleccionadoClave: "",
      tipoPersona: "",
      civiles: "NO",
      añosRegimen: [],

      columns: [],
      dataComprobantesP: [],
      itemsReporte: [],

      datosRiesgoFiscal: [],
      datosRiesgoFiscalPagos: [],
      tab: "mails",

      tasksUsuario: [
        {
          title: "Reporte IVA",
          progress: 0,
          status: "idle",
          run: () => this.GetReporteIVA(),
        },
        {
          title: "Retenciones IVA",
          progress: 0,
          status: "idle",
          run: () => this.GetReporteRetencionesIVA(),
        },
        {
          title: "Nómina / ISR",
          progress: 0,
          status: "idle",
          run: () => this.GetReporteNomina(),
        },
        {
          title: "Reporte ISR",
          progress: 0,
          status: "idle",
          run: () => this.GetReporteISRTodo(),
        },
        {
          title: "Pagos provisionales ISR",
          progress: 0,
          status: "idle",
          run: () => this.GetReportePagosProvisionales(),
        },
        {
          title: "Uso de CFDI",
          progress: 0,
          status: "idle",
          run: () => this.GetReporteUsoCFDIM(),
        },
        {
          title: "Reporte Comparativa de Flujo",
          progress: 0,
          status: "idle",
          run: () => this.GetReporteDos(),
        },
        {
          title: "Reporte de Conceptos",
          progress: 0,
          status: "idle",
          run: () => this.GetReporteConceptos(),
        },
        {
          title: "Riesgo Fiscal",
          progress: 0,
          status: "idle",
          run: () => this.GetRiesgoFiscalConcentrados(),
        },
      ],

      tasksGasolinero: [
        {
          title: "Reporte IVA",
          progress: 0,
          status: "idle",
          run: () => this.GetReporteIVA(),
        },
        {
          title: "Retenciones IVA",
          progress: 0,
          status: "idle",
          run: () => this.GetReporteRetencionesIVA(),
        },
        {
          title: "Nómina / ISR",
          progress: 0,
          status: "idle",
          run: () => this.GetReporteNomina(),
        },
        {
          title: "Reporte ISR",
          progress: 0,
          status: "idle",
          run: () => this.GetReporteISRTodo(),
        },
        {
          title: "Pagos provisionales ISR",
          progress: 0,
          status: "idle",
          run: () => this.GetReportePagosProvisionales(),
        },
        {
          title: "Uso de CFDI",
          progress: 0,
          status: "idle",
          run: () => this.GetReporteUsoCFDIM(),
        },
        {
          title: "Riesgo Fiscal",
          progress: 0,
          status: "idle",
          run: () => this.GetRiesgoFiscalConcentrados(),
        },
        {
          title: "Ventas/Gasolinera",
          progress: 0,
          status: "idle",
          run: () => this.GetReporteTodos(),
        },
        {
          title: "Compras/Gasolinera",
          progress: 0,
          status: "idle",
          run: () => this.GetReporteComprasTodos(),
        },
        {
          title: "Reporte Litros",
          progress: 0,
          status: "idle",
          run: () => this.GetReporteInventario(),
        },
        {
          title: "Reporte Utilidad",
          progress: 0,
          status: "idle",
          run: () => this.GetReporteUtilidad(),
        },
        {
          title: "Reporte Comparativa de Flujo",
          progress: 0,
          status: "idle",
          run: () => this.GetReporteDos(),
        },
        {
          title: "Reporte de Conceptos",
          progress: 0,
          status: "idle",
          run: () => this.GetReporteConceptos(),
        },
      ],

      dataVentas: [],
      dataCompras: [],

      dataMagna: [],
      dataPremium: [],
      dataDiesel: [],

      dataMagnaU: [],
      dataPremiumU: [],
      dataDieselU: [],
      dataAnual: [
        {
          columna1: "COEFICIENTE DE UTILIDAD DEL EJERCICIO",
          columna2: 0,
          columna3: 0,
          columna4: 0,
        },
        {
          columna1: "TOTAL DE INGRESOS ACUMULABLES",
          columna2: 0,
          columna3: 0,
          columna4: 0,
        },
        {
          columna1: "TOTAL DE DEDUCCIONES AUTORIZADAS",
          columna2: 0,
          columna3: 0,
          columna4: 0,
        },
        { columna1: "PÉRDIDA FISCAL ", columna2: 0, columna3: 0, columna4: 0 },
        { columna1: "UTILIDAD FISCAL", columna2: 0, columna3: 0, columna4: 0 },
      ],
      columnsAnual: [
        {
          name: "columna1",
          label: "Declaración Anual",
          align: "left",
          field: "columna1",
          sortable: true,
          classes: "bg-grey-2 ellipsis",
          headerClasses: "text-center bgc-recibidos text-white",
        },
        {
          name: "columna2",
          label: "Determinado",
          align: "right",
          field: "columna2",
          sortable: true,
          classes: "bg-grey-2 ellipsis",
          headerClasses: "text-center bgc-recibidos text-white",
        },
        {
          name: "columna3",
          label: "Declarado",
          align: "right",
          field: "columna3",
          sortable: true,
          classes: "bg-grey-2 ellipsis",
          headerClasses: "text-center bgc-recibidos text-white",
        },
        {
          name: "columna4",
          label: "Diferencia",
          align: "right",
          field: (row) => (row.columna2 || 0) - (row.columna3 || 0),
          sortable: true,
          classes: "bg-grey-2 ellipsis",
          headerClasses: "text-center bgc-recibidos text-white",
        },
      ],
      comentarios: "",
      comparativaFlujo: [],
      dataIvaRetenidoNeteado: [],
      dataISRRetenidoFavor: [],
      dataComprobantesConceptos: [],
    };
  },

  computed: {
    token() {
      return this.$store.state.usuario;
    },
    rutaAxios() {
      return this.$store.state.rutaMongoStore;
    },
    tasks() {
      if (this.token.rol == "Administrador") {
        return this.tasksUsuario;
      } else {
        return this.tasksGasolinero;
      }
    },
  },
  created() {
    this.fechaActual();
    // this.GetReporteDos();
    this.GetDatosEmpresa();

    // Inicializar disabledItems para cada sección
    Object.keys(this.sections).forEach((sectionName) => {
      this.$set(this.disabledItems, sectionName, false);
    });
  },

  watch: {
    isDarkMode(val) {
      this.$q.dark.set(val);
    },
  },
  methods: {
    checkConcentradosSelected(sectionName) {
      const section = this.sections[sectionName];
      if (!section || !section.items) return false;

      return section.items.every(
        (item) => this.mostrarConcentradosReporte[item.key] === true
      );
    },

    toggleAllConcentrados(sectionName, value) {
      const sectionItems = [...this.sections[sectionName].items];
      const nuevoEstatus = value;
      for (let x of sectionItems) {
        this.mostrarConcentradosReporte[x.key] = nuevoEstatus;
      }
    },

    // Para mostrarSeccionesReporte
    checkSeccionesSelected(sectionName) {
      const section = this.sections[sectionName];
      if (!section || !section.items) return false;

      return section.items.every(
        (item) => this.mostrarSeccionesReporte[item.key] === true
      );
    },

    toggleAllSecciones(sectionName, value) {
      const sectionItems = [...this.sections[sectionName].items];
      const nuevoEstatus = value;
      for (let x of sectionItems) {
        this.mostrarSeccionesReporte[x.key] = nuevoEstatus;
      }
    },

    async generarReporteEmpresarial() {
      try {
        //ASIGNAMOS LAS VARIABLES DE CONFIGURACION
        if (this.selectedMesI.value > this.selectedMesF.value) {
          return;
        }
        let esMensual = false;
        if (this.selectedMesI.value == this.selectedMesF.value) {
          esMensual = true;
        }
        const opcionesReporte = {
          mesInicial: this.selectedMesI.value,
          mesFinal: this.selectedMesF.value,
          anio: this.selectedAnio,
          esMensual: esMensual,
        };
        this.opcionesReporte = { ...opcionesReporte };

        const reporte = await this.GetReporteDos();

        this.$store.state.fechasReporteEmpresarialStore = {
          ...opcionesReporte,
        };

        const resultadoExport = await this.ExportPdf();

        return { reporte, resultadoExport };
      } catch (error) {
        console.log(error);
      }
    },

    async GetDatosEmpresa() {
      try {
        const rfc = this.token.rfc;
        // const rfc = "gep8501011s6";
        const curl = `${this.rutaAxios}/Empresa/GetEmpresa/erp_${rfc}/${rfc}`;
        let response = await axios.get(curl);

        console.log(response);

        if (response.data.rfc !== "") {
          this.datosEmpresa = {
            nombre: response.data.nombre || "",
            rfc: response.data.rfc || "",
            regimenFiscal: response.data.regimenFiscal?.regimenFiscal || "",
            domicilio: response.data.domicilioFiscal || "",
          };

          // Verificar si algún campo está vacío
          this.mostrarAdvertenciaDatosEmpresa =
            !this.datosEmpresa.nombre ||
            !this.datosEmpresa.rfc ||
            !this.datosEmpresa.regimenFiscal ||
            !this.datosEmpresa.domicilio;
        } else {
          // Si no hay datos de empresa, mostrar la advertencia
          this.mostrarAdvertenciaDatosEmpresa = true;
        }
      } catch (e) {
        console.log(e);
        // En caso de error, mostrar la advertencia
        this.mostrarAdvertenciaDatosEmpresa = true;
      }
    },

    async GetReporteDos() {
      const opcionesReporte = {
        mesInicial: this.selectedMesI.value,
        mesFinal: this.selectedMesF.value,
        anio: this.selectedAnio,
        esMensual: false,
      };
      this.opcionesReporte = { ...opcionesReporte };

      this.dataReporte = null;
      if (!this.token) {
        console.error("No hay token disponible para hacer la peticion");
        this.$store.dispatch("guardarToken");
        return;
      }
      const facturado = await this.GetReporteFacturado();
      this.dataReporte = facturado;
      console.log("facturado", facturado);

      // const rfc = this.token.rfc;
      // const rfc = "gep8501011s6";
      const flujo = await this.GetReporteFlujoGeneral();
      this.dataReporte.flujoEmitido = flujo.flujoEmitido;
      this.dataReporte.flujoRecibido = flujo.flujoRecibido;
      this.dataReporte.metodosDePagoRecibidos = flujo.metodosDePagoRecibidos;
      this.dataReporte.metodosDePagoEmitidos = flujo.metodosDePagoEmitidos;

      const resumen = this.compararPUEPorMes(
        this.dataReporte.flujoEmitido,
        this.dataReporte.flujoRecibido
      );
      this.comparativaFlujo = resumen;
      console.log("resumen", resumen);
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

    async GetReporteFlujoGeneral() {
      const rfc = this.token.rfc;
      // const rfc = "gep8501011s6";
      const año = this.selectedAnio;
      const mesI = this.opcionesReporte.mesInicial;
      const mesF = this.opcionesReporte.mesFinal;
      try {
        let flujoEmitido = [];
        if (this.mostrarSeccionesReporte.mostrarFlujoEmitido) {
          this.$q.loading.show({
            spinner: QSpinnerCube,
            spinnerColor: "white",
            spinnerSize: 120,
            message: "Obteniendo Flujo Emitido...",
            messageColor: "white",
          });

          flujoEmitido = await this.GetReporteFlujo(rfc, "E", año, mesI, mesF);
        }

        let flujoRecibido = [];
        if (this.mostrarSeccionesReporte.mostrarFlujoRecibido) {
          this.$q.loading.show({
            spinner: QSpinnerCube,
            spinnerColor: "white",
            spinnerSize: 120,
            message: "Obteniendo Flujo Recibido...",
            messageColor: "white",
          });

          flujoRecibido = await this.GetReporteFlujo(rfc, "R", año, mesI, mesF);
        }

        let metodosDePagoRecibidos = [];
        if (this.mostrarSeccionesReporte.mostrarMetodosPagoRecibidos) {
          metodosDePagoRecibidos = await this.GetReporteMetodoPagoAsync(
            rfc,
            "R",
            año,
            mesI,
            mesF
          );
        }

        let metodosDePagoEmitidos = [];
        if (this.mostrarSeccionesReporte.mostrarMetodosPagoEmitidos) {
          metodosDePagoEmitidos = await this.GetReporteMetodoPagoAsync(
            rfc,
            "E",
            año,
            mesI,
            mesF
          );
        }
        this.$q.loading.hide();

        return {
          flujoEmitido,
          flujoRecibido,
          metodosDePagoRecibidos,
          metodosDePagoEmitidos,
        };
      } catch (error) {
        console.error(`Error en el reporte general ${error}`);
        this.$q.loading.hide();
      }
    },

    async GetReporteFacturado() {
      const rfc = this.token.rfc;
      // const rfc = "gep8501011s6";
      const año = this.selectedAnio;
      const mesI = this.opcionesReporte.mesInicial;
      const mesF = this.opcionesReporte.mesFinal;

      console.log(this.mostrarSeccionesReporte);

      this.$q.loading.show({
        spinner: QSpinnerCube,
        spinnerColor: "white",
        spinnerSize: 120,
        message: "Contando comprobantes...",
        messageColor: "white",
      });

      try {
        const inicio = performance.now();
        // HACEMOS LAS CONSULTAS
        const tareasContador = [
          this.GetReporteContador(rfc, "comprobantes_emitidos", "I", año, mesI, mesF),
          this.GetReporteContador(rfc, "comprobantes_emitidos", "E", año, mesI, mesF),
          this.GetReporteContador(rfc, "comprobantes_recibidos", "I", año, mesI, mesF),
          this.GetReporteContador(rfc, "comprobantes_recibidos", "E", año, mesI, mesF),
          this.GetReporteContador(rfc, "comprobantes_nomina", "N", año, mesI, mesF),
        ];
        // const resultadosContador = await Promise.all(tareasContador);

        this.$q.loading.show({
          spinner: QSpinnerCube,
          spinnerColor: "white",
          spinnerSize: 120,
          message: "Calculando rfc...",
          messageColor: "white",
        });

        const tareasRFc = [];

        if (this.mostrarSeccionesReporte.mostrarEmitidos) {
          tareasRFc.push(
            this.GetReporteRFc(
              rfc,
              "comprobantes_emitidos",
              año,
              mesI,
              mesF,
              this.clientesConcentrados
            )
          );
        } else {
          tareasRFc.push([]);
        }

        if (this.mostrarSeccionesReporte.mostrarRecibidos) {
          tareasRFc.push(
            this.GetReporteRFc(
              rfc,
              "comprobantes_recibidos",
              año,
              mesI,
              mesF,
              this.proveedoresConcentrados
            )
          );
        } else {
          tareasRFc.push([]);
        }

        const resultadosRfc = await Promise.all(tareasRFc);

        this.$q.loading.show({
          spinner: QSpinnerCube,
          spinnerColor: "white",
          spinnerSize: 120,
          message: "Calculando importes...",
          messageColor: "white",
        });

        const tareasImportes = [];

        if (this.mostrarSeccionesReporte.mostrarEmitidos) {
          tareasImportes.push(
            this.GetReporteImportes(rfc, "comprobantes_emitidos", "I", año, mesI, mesF),
            this.GetReporteImportes(rfc, "comprobantes_emitidos", "E", año, mesI, mesF)
          );
        } else {
          tareasImportes.push([]);
        }

        if (this.mostrarSeccionesReporte.mostrarRecibidos) {
          tareasImportes.push(
            this.GetReporteImportes(rfc, "comprobantes_recibidos", "I", año, mesI, mesF),
            this.GetReporteImportes(rfc, "comprobantes_recibidos", "E", año, mesI, mesF)
          );
        } else {
          tareasImportes.push([]);
        }

        // const tareasImportes = [
        //   this.GetReporteImportes(
        //     rfc,
        //     "comprobantes_emitidos",
        //     "I",
        //     año,
        //     mesI,
        //     mesF
        //   ),
        //   this.GetReporteImportes(
        //     rfc,
        //     "comprobantes_emitidos",
        //     "E",
        //     año,
        //     mesI,
        //     mesF
        //   ),
        //   this.GetReporteImportes(
        //     rfc,
        //     "comprobantes_recibidos",
        //     "I",
        //     año,
        //     mesI,
        //     mesF
        //   ),
        //   this.GetReporteImportes(
        //     rfc,
        //     "comprobantes_recibidos",
        //     "E",
        //     año,
        //     mesI,
        //     mesF
        //   ),
        // ];
        const resultadosImportes = await Promise.all(tareasImportes);

        console.log(resultadosImportes);

        this.$q.loading.show({
          spinner: QSpinnerCube,
          spinnerColor: "white",
          spinnerSize: 120,
          message: "Calculando nómina...",
          messageColor: "white",
        });

        const tareasImportesN = [];

        if (this.mostrarSeccionesReporte.mostrarNomina) {
          tareasImportesN.push(
            this.GetReporteImportesNomina(rfc, "comprobantes_nomina", año, mesI, mesF)
          );
        } else {
          tareasImportesN.push([]);
        }

        if (this.mostrarSeccionesReporte.mostrarNominaGeneral) {
          tareasImportesN.push(this.GetReporteNominaGeneral(rfc, año, mesI, mesF));
        } else {
          tareasImportesN.push([]);
        }

        if (this.mostrarSeccionesReporte.mostrarNominaTrabajadores == true) {
          tareasImportesN.push(this.GetReporteNominaTrabajador(rfc, año, mesI, mesF));
        } else {
          tareasImportesN.push([]);
        }

        if (this.mostrarSeccionesReporte.mostrarNominaConceptos) {
          tareasImportesN.push(this.GetReporteNominaConceptos(rfc, año, mesI, mesF));
        } else {
          tareasImportesN.push([]);
        }

        if (this.mostrarSeccionesReporte.mostrarNominaDuplicadoO) {
          tareasImportesN.push(
            this.GetReporteNominaDuplicadaAsync(rfc, "O", año, mesI, mesF)
          );
        } else {
          tareasImportesN.push([]);
        }

        if (this.mostrarSeccionesReporte.mostrarNominaDuplicadoE) {
          tareasImportesN.push(
            this.GetReporteNominaDuplicadaAsync(rfc, "E", año, mesI, mesF)
          );
        } else {
          tareasImportesN.push([]);
        }

        // const tareasImportesN = [
        //   this.GetReporteImportesNomina(
        //     rfc,
        //     "comprobantes_nomina",
        //     año,
        //     mesI,
        //     mesF
        //   ),
        //   this.GetReporteNominaGeneral(rfc, año, mesI, mesF),
        //   this.GetReporteNominaTrabajador(rfc, año, mesI, mesF),
        //   this.GetReporteNominaConceptos(rfc, año, mesI, mesF),
        //   this.GetReporteNominaDuplicadaAsync(rfc, "O", año, mesI, mesF),
        //   this.GetReporteNominaDuplicadaAsync(rfc, "E", año, mesI, mesF),
        // ];
        const resultadosImportesN = await Promise.all(tareasImportesN);

        console.log(resultadosImportesN);

        this.$q.loading.show({
          spinner: QSpinnerCube,
          spinnerColor: "white",
          spinnerSize: 120,
          message: "Calculando uso de CFDI...",
          messageColor: "white",
        });

        const tareasUsoCFDI = [];

        if (this.mostrarSeccionesReporte.mostrarUsoCFDI) {
          tareasUsoCFDI.push(this.GetReporteUsoCFDI(rfc, año, mesI, mesF));
        } else {
          tareasUsoCFDI.push([]);
        }

        // const tareasUsoCFDI = [this.GetReporteUsoCFDI(rfc, año, mesI, mesF)];
        const resultadosUsoCFDI = await Promise.all(tareasUsoCFDI);

        this.$q.loading.show({
          spinner: QSpinnerCube,
          spinnerColor: "white",
          spinnerSize: 120,
          message: "Calculando PUE...",
          messageColor: "white",
        });

        const tareasUsoPUE = [];

        if (this.mostrarSeccionesReporte.mostrarPue99Recibido) {
          tareasUsoPUE.push(
            this.GetReportePue99Async(rfc, "R", año, mesI, mesF) // RECIBIDOS
          );
        } else {
          tareasUsoPUE.push([]);
        }

        if (this.mostrarSeccionesReporte.mostrarPue99Emitido) {
          tareasUsoPUE.push(
            this.GetReportePue99Async(rfc, "E", año, mesI, mesF) // EMITDOS - LA API NO DEVUELVE NADA
          );
        } else {
          tareasUsoPUE.push([]);
        }

        if (this.mostrarSeccionesReporte.mostrarPue30Recibido) {
          tareasUsoPUE.push(
            this.GetReportePue30Async(rfc, "R", año, mesI, mesF) // RECIBIDOS
          );
        } else {
          tareasUsoPUE.push([]);
        }

        if (this.mostrarSeccionesReporte.mostrarPue30Emitido) {
          tareasUsoPUE.push(
            this.GetReportePue30Async(rfc, "E", año, mesI, mesF) // EMITIDOS
          );
        } else {
          tareasUsoPUE.push([]);
        }

        // const tareasUsoPUE = [
        //   this.GetReportePue99Async(rfc, "R", año, mesI, mesF), // RECIBIDOS
        //   this.GetReportePue99Async(rfc, "E", año, mesI, mesF), // EMITDOS - LA API NO DEVUELVE NADA
        //   this.GetReportePue30Async(rfc, "R", año, mesI, mesF), // RECIBIDOS
        //   this.GetReportePue30Async(rfc, "E", año, mesI, mesF), // EMITIDOS
        // ];

        const resultadosPUE = await Promise.all(tareasUsoPUE);

        this.$q.loading.show({
          spinner: QSpinnerCube,
          spinnerColor: "white",
          spinnerSize: 120,
          message: "Obteniendo reporte sin impuestos...",
          messageColor: "white",
        });

        const tareasReporteSinImpuestos = [];

        if (this.mostrarSeccionesReporte.mostrarSinImpuestosRecibidos) {
          tareasReporteSinImpuestos.push(
            this.GetReporteSinImpuestosAsync(rfc, "R", año, mesI, mesF)
          );
        } else {
          tareasReporteSinImpuestos.push([]);
        }

        if (this.mostrarSeccionesReporte.mostrarSinImpuestosEmitidos) {
          tareasReporteSinImpuestos.push(
            this.GetReporteSinImpuestosAsync(rfc, "E", año, mesI, mesF)
          );
        } else {
          tareasReporteSinImpuestos.push([]);
        }

        // const tareasReporteSinImpuestos = [
        //   this.GetReporteSinImpuestosAsync(rfc, "R", año, mesI, mesF), // EMITIDOS
        //   this.GetReporteSinImpuestosAsync(rfc, "E", año, mesI, mesF), // EMITIDOS
        // ];
        const resultadosReporteSinImpuestos = await Promise.all(
          tareasReporteSinImpuestos
        );

        this.$q.loading.show({
          spinner: QSpinnerCube,
          spinnerColor: "white",
          spinnerSize: 120,
          message: "Obteniendo reporte de riesgos...",
          messageColor: "white",
        });

        const tareasReporteRiesgos = [];

        if (this.mostrarSeccionesReporte.mostrarRiesgoArrendamiento) {
          tareasReporteRiesgos.push(
            this.GetReporteRiesgoArrendamientoAsync(rfc, año, mesI, mesF)
          );
        } else {
          tareasReporteRiesgos.push([]);
        }

        if (this.mostrarSeccionesReporte.mostrarRiesgoConceptosEmitidos) {
          tareasReporteRiesgos.push(
            this.GetReporteRiesgoConceptosAsync(rfc, "E", año, mesI, mesF)
          );
        } else {
          tareasReporteRiesgos.push([]);
        }

        if (this.mostrarSeccionesReporte.mostrarSinImpuestosRecibidos) {
          tareasReporteRiesgos.push(
            this.GetReporteRiesgoConceptosAsync(rfc, "R", año, mesI, mesF)
          );
        } else {
          tareasReporteRiesgos.push([]);
        }

        if (this.mostrarSeccionesReporte.mostrarRiesgoFacturadoGlobal) {
          tareasReporteRiesgos.push(
            this.GetReporteRiesgoFacturaGlobalAsync(rfc, año, mesI, mesF)
          );
        } else {
          tareasReporteRiesgos.push([]);
        }

        // const tareasReporteRiesgos = [
        //   this.GetReporteRiesgoArrendamientoAsync(rfc, año, mesI, mesF), // SOLO RECIBIDOS
        //   this.GetReporteRiesgoConceptosAsync(rfc, "R", año, mesI, mesF), // RECIBIDOS
        //   this.GetReporteRiesgoConceptosAsync(rfc, "E", año, mesI, mesF), // RECIBIDOS
        //   this.GetReporteRiesgoFacturaGlobalAsync(rfc, año, mesI, mesF),
        // ];

        const resultadosReporteRiesgos = await Promise.all(tareasReporteRiesgos);

        this.$q.loading.show({
          spinner: QSpinnerCube,
          spinnerColor: "white",
          spinnerSize: 120,
          message: "Calculando gastos...",
          messageColor: "white",
        });

        const tareasReporteGastos = [];

        if (this.mostrarSeccionesReporte.mostrarGastosEfectivo) {
          tareasReporteGastos.push(
            this.GetReporteGastosEfectivoAsync(rfc, año, mesI, mesF)
          );
        } else {
          tareasReporteGastos.push([]);
        }

        if (this.mostrarSeccionesReporte.mostrarConsumoCombustibleEmitido) {
          tareasReporteGastos.push(
            this.GetReporteConsumoCombustibleAsync(rfc, "E", año, mesI, mesF)
          );
        } else {
          tareasReporteGastos.push([]);
        }

        if (this.mostrarSeccionesReporte.mostrarConsumoCombustibleRecibido) {
          tareasReporteGastos.push(
            this.GetReporteConsumoCombustibleAsync(rfc, "R", año, mesI, mesF)
          );
        } else {
          tareasReporteGastos.push([]);
        }

        if (this.mostrarSeccionesReporte.mostrarNotasSinRelacion) {
          tareasReporteGastos.push(
            this.GetReporteNotasSinRelacionAsync(rfc, año, mesI, mesF)
          );
        } else {
          tareasReporteGastos.push([]);
        }

        // const tareasReporteGastos = [
        //   this.GetReporteGastosEfectivoAsync(rfc, año, mesI, mesF),
        //   this.GetReporteConsumoCombustibleAsync(rfc, "E", año, mesI, mesF),
        //   this.GetReporteConsumoCombustibleAsync(rfc, "R", año, mesI, mesF),
        //   this.GetReporteNotasSinRelacionAsync(rfc, año, mesI, mesF),
        // ];

        const resultadosReporteGastos = await Promise.all(tareasReporteGastos);

        this.$q.loading.show({
          spinner: QSpinnerCube,
          spinnerColor: "white",
          spinnerSize: 120,
          message: "Calculando pagos...",
          messageColor: "white",
        });

        const tareasPagos = [];

        if (this.mostrarSeccionesReporte.mostrarPagoFueraDeTiempoRecibidos) {
          tareasPagos.push(
            this.GetReportePagoFueraDeTiempoAsync(rfc, "R", año, mesI, mesF)
          );
        } else {
          tareasPagos.push([]);
        }

        if (this.mostrarSeccionesReporte.mostrarPagoFueraDeTiempoEmitidos) {
          tareasPagos.push(
            this.GetReportePagoFueraDeTiempoAsync(rfc, "E", año, mesI, mesF)
          );
        } else {
          tareasPagos.push([]);
        }

        if (this.mostrarSeccionesReporte.mostrarPagoAntesDeComprobanteRecibidos) {
          tareasPagos.push(
            this.GetReportePagosAntesDeComprobanteAsync(rfc, "R", año, mesI, mesF)
          );
        } else {
          tareasPagos.push([]);
        }

        if (this.mostrarSeccionesReporte.mostrarPagoAntesDeComprobanteEmitidos) {
          tareasPagos.push(
            this.GetReportePagosAntesDeComprobanteAsync(rfc, "E", año, mesI, mesF)
          );
        } else {
          tareasPagos.push([]);
        }

        // const tareasPagos = [
        //   this.GetReportePagoFueraDeTiempoAsync(rfc, "R", año, mesI, mesF),
        //   this.GetReportePagoFueraDeTiempoAsync(rfc, "E", año, mesI, mesF),
        //   this.GetReportePagosAntesDeComprobanteAsync(
        //     rfc,
        //     "R",
        //     año,
        //     mesI,
        //     mesF
        //   ),
        //   this.GetReportePagosAntesDeComprobanteAsync(
        //     rfc,
        //     "E",
        //     año,
        //     mesI,
        //     mesF
        //   ),
        // ];

        const resultadosPagos = await Promise.all(tareasPagos);

        // impuestos
        this.$q.loading.show({
          spinner: QSpinnerCube,
          spinnerColor: "white",
          spinnerSize: 120,
          message: "Calculando impuestos...",
          messageColor: "white",
        });

        const tareasImpuestos = [];

        if (this.mostrarSeccionesReporte.mostrarReporteIva) {
          tareasImpuestos.push(
            this.GetReporteIvaAsync(rfc, "R", año, mesI, mesF),
            this.GetReporteIvaAsync(rfc, "E", año, mesI, mesF)
          );
        } else {
          tareasImpuestos.push([]);
        }

        if (this.mostrarSeccionesReporte.mostrarIvaRetRecibidos) {
          tareasImpuestos.push(this.GetReporteIvaRetAsync(rfc, "R", año, mesI, mesF));
        } else {
          tareasImpuestos.push([]);
        }

        if (this.mostrarSeccionesReporte.mostrarIvaRetEmitidos) {
          tareasImpuestos.push(this.GetReporteIvaRetAsync(rfc, "E", año, mesI, mesF));
        } else {
          tareasImpuestos.push([]);
        }

        if (this.mostrarSeccionesReporte.mostrarIsrNomina) {
          tareasImpuestos.push(this.GetReporteIsrNominaAsync(rfc, año, mesI, mesF));
        } else {
          tareasImpuestos.push([]);
        }

        if (this.mostrarSeccionesReporte.mostrarRetencionesIsr) {
          tareasImpuestos.push(this.GetRetencionesIsrAsync(rfc, año, mesI, mesF));
        } else {
          tareasImpuestos.push([]);
        }

        if (this.mostrarSeccionesReporte.mostrarIeps) {
          tareasImpuestos.push(this.GetReporteIepsAsync(rfc, año, mesI, mesF));
        } else {
          tareasImpuestos.push([]);
        }

        // const tareasImpuestos = [
        //   this.GetReporteIvaAsync(rfc, "R", año, mesI, mesF), // RECIBIDOS
        //   this.GetReporteIvaAsync(rfc, "E", año, mesI, mesF), // EMITIDOS
        //   this.GetReporteIvaRetAsync(rfc, "R", año, mesI, mesF), // RECIBIDOS
        //   this.GetReporteIvaRetAsync(rfc, "E", año, mesI, mesF), // EMITIDOS
        //   this.GetReporteIsrNominaAsync(rfc, año, mesI, mesF),
        //   this.GetRetencionesIsrAsync(rfc, año, mesI, mesF),
        //   this.GetReporteIepsAsync(rfc, año, mesI, mesF),
        // ];

        const resultadosImpuestos = await Promise.all(tareasImpuestos);

        // GetReporteCuentasPendientesAsync

        this.$q.loading.show({
          spinner: QSpinnerCube,
          spinnerColor: "white",
          spinnerSize: 120,
          message: "Calculando cuentas pendientes...",
          messageColor: "white",
        });

        const tareasCuentasPendientes = [];

        if (this.mostrarSeccionesReporte.mostrarCuentasPendientesEmitidos) {
          tareasCuentasPendientes.push(
            this.GetReporteCuentasPendientesAsync(rfc, "E", año, mesI, mesF)
          );
        } else {
          tareasCuentasPendientes.push([]);
        }

        if (this.mostrarSeccionesReporte.mostrarCuentasPendientesRecibidos) {
          tareasCuentasPendientes.push(
            this.GetReporteCuentasPendientesAsync(rfc, "R", año, mesI, mesF)
          );
        } else {
          tareasCuentasPendientes.push([]);
        }

        // const tareasCuentasPendientes = [
        //   this.GetReporteCuentasPendientesAsync(rfc, "E", año, mesI, mesF),
        //   this.GetReporteCuentasPendientesAsync(rfc, "R", año, mesI, mesF),
        // ];

        const resultadosCuentasPendientes = await Promise.all(tareasCuentasPendientes);

        this.$q.loading.show({
          spinner: QSpinnerCube,
          spinnerColor: "white",
          spinnerSize: 120,
          message: "Calculando anticipos...",
          messageColor: "white",
        });

        const tareasAnticipos = [];

        if (this.mostrarSeccionesReporte.mostrarAnticiposEmitidos) {
          tareasImpuestos.push(this.GetReporteAnticipoAsync(rfc, "E", año, mesI, mesF));
        } else {
          tareasAnticipos.push([]);
        }

        if (this.mostrarSeccionesReporte.mostrarAnticiposRecibidos) {
          tareasImpuestos.push(this.GetReporteAnticipoAsync(rfc, "R", año, mesI, mesF));
        } else {
          tareasAnticipos.push([]);
        }

        // const tareasAnticipos = [
        //   this.GetReporteAnticipoAsync(rfc, "E", año, mesI, mesF),
        //   this.GetReporteAnticipoAsync(rfc, "R", año, mesI, mesF),
        // ];

        const resultadosAnticipos = await Promise.all(tareasAnticipos);

        this.$q.loading.show({
          spinner: QSpinnerCube,
          spinnerColor: "white",
          spinnerSize: 120,
          message: "Calculando listas negras...",
          messageColor: "white",
        });

        const listasNegras = [];

        if (this.mostrarSeccionesReporte.mostrarListasNegras) {
          listasNegras.push(this.GetReporteListasNegrasAsync(rfc, año));
        } else {
          listasNegras.push([]);
        }

        const resultadosListasNegras = await Promise.all(listasNegras);

        const fin = performance.now();

        //CREAMOS LAS TABLAS
        var tablaEmitidos = [];
        var tablaRecibidos = [];
        var tablaPagos = [];
        var tablaNominas = [];
        var tablaNominaGeneral = resultadosImportesN[1];
        var tablaNominaTrabajadores = resultadosImportesN[2];
        var tabalaNominaConceptos = resultadosImportesN[3];

        // Primero, procesamos los datos de emitidos y recibidos si existen
        if (resultadosImportes[0]?.length > 0) {
          const tope = mesF - mesI + 1;
          for (let x = 0; x < tope; x++) {
            //EMITIDOS
            const nombreMes = this.obtenerNombreMes(resultadosImportes[0][x].mes);
            var objEmitidos = {
              mes: nombreMes,
              contadorI: resultadosImportes[0][x].contador,
              subTotalI: resultadosImportes[0][x].subTotal,
              trasladosI: resultadosImportes[0][x].traslados,
              retencionesI: resultadosImportes[0][x].retenciones,
              totalI: resultadosImportes[0][x].total,

              contadorE: resultadosImportes[1][x].contador,
              subTotalE: resultadosImportes[1][x].subTotal,
              trasladosE: resultadosImportes[1][x].traslados,
              retencionesE: resultadosImportes[1][x].retenciones,
              totalE: resultadosImportes[1][x].total,
            };

            //RECIBIDOS
            var objRecibidos = {
              mes: nombreMes,
              contadorI: resultadosImportes[2][x].contador,
              subTotalI: resultadosImportes[2][x].subTotal,
              trasladosI: resultadosImportes[2][x].traslados,
              retencionesI: resultadosImportes[2][x].retenciones,
              totalI: resultadosImportes[2][x].total,

              contadorE: resultadosImportes[3][x].contador,
              subTotalE: resultadosImportes[3][x].subTotal,
              trasladosE: resultadosImportes[3][x].traslados,
              retencionesE: resultadosImportes[3][x].retenciones,
              totalE: resultadosImportes[3][x].total,
            };

            //AGREGA A LAS TABLAS
            tablaEmitidos.push(objEmitidos);
            tablaRecibidos.push(objRecibidos);
          }
        }

        // Procesamos los datos de nómina en un bloque separado
        if (resultadosImportesN[0]?.length > 0) {
          const topeNomina = mesF - mesI + 1;
          for (let x = 0; x < topeNomina; x++) {
            const nombreMes = this.obtenerNombreMes(resultadosImportesN[0][x].mes);

            //NOMINA
            var objNomina = {
              mes: nombreMes,
              contador: resultadosImportesN[0][x].contador,
              percepciones: resultadosImportesN[0][x].percepciones,
              deducciones: resultadosImportesN[0][x].deducciones,
              otrosPagos: resultadosImportesN[0][x].otrosPagos,
              total: resultadosImportesN[0][x].total,
            };

            // AGREGA A LA TABLA
            tablaNominas.push(objNomina);
          }
        }

        // PONEMOS NOMBRE MES EN NOMINA GENERAL (solo si hay datos)
        if (tablaNominaGeneral?.length > 0) {
          for (let i = 0; i < tablaNominaGeneral.length; i++) {
            if (tablaNominaGeneral[i]?.mes) {
              tablaNominaGeneral[i].mes = this.obtenerNombreMes(
                tablaNominaGeneral[i].mes
              );
            }
          }
        }

        const mensual = mesF === mesF ? true : false;

        const objFacturado = {
          emitidos: tablaEmitidos,
          recibidos: tablaRecibidos,
          // pagos: tablaPagos,
          nomina: tablaNominas,
          nominaGeneral: tablaNominaGeneral,
          nominaTrabajadores: tablaNominaTrabajadores,
          nominaConceptos: tabalaNominaConceptos,
          rfcEmitidos: resultadosRfc[0],
          rfcRecibidos: resultadosRfc[1],
          usoCDFI: resultadosUsoCFDI[0],
          pue99Recibidos: resultadosPUE[0],
          pue99Emitidos: resultadosPUE[1],
          pue30Recibidos: resultadosPUE[2],
          pue30Emitidos: resultadosPUE[3],
          rSinImpuestosRecibidos: resultadosReporteSinImpuestos[0],
          rSinImpuestosEmitidos: resultadosReporteSinImpuestos[1],
          riesgoArrendamiento: resultadosReporteRiesgos[0],
          riesgoConceptosRecibidos: resultadosReporteRiesgos[1],
          riesgoConceptosEmitidos: resultadosReporteRiesgos[2],
          riesgoFacturadoGlobal: resultadosReporteRiesgos[3],
          gastosEfectivo: resultadosReporteGastos[0],
          consumoCombustibleEmitido: resultadosReporteGastos[1],
          consumoCombustibleRecibido: resultadosReporteGastos[2],
          notasSinRelacion: resultadosReporteGastos[3],
          pagoFueraDeTiempoRecibidos: resultadosPagos[0],
          pagoFueraDeTiempoEmitidos: resultadosPagos[1],
          pagoAntesDeComprobanteRecibidos: resultadosPagos[2],
          pagoAntesDeComprobanteEmitidos: resultadosPagos[3],
          nominaDuplicadoO: resultadosImportesN[4],
          nominaDuplicadoE: resultadosImportesN[5],
          reporteIva: {
            ivaRecibidos: resultadosImpuestos[0],
            ivaEmitidos: resultadosImpuestos[1],
          },
          ivaRetRecibidos: resultadosImpuestos[2],
          ivaRetEmitidos: resultadosImpuestos[3],
          isrNomina: resultadosImpuestos[4],
          retencionesIsr: resultadosImpuestos[5],
          ieps: resultadosImpuestos[6],
          cuentasPendientesEmitidos: resultadosCuentasPendientes[0],
          cuentasPendientesRecibidos: resultadosCuentasPendientes[1],
          anticiposEmitidos: resultadosAnticipos[0],
          anticiposRecibidos: resultadosAnticipos[1],
          listasNegras: resultadosListasNegras[0],
        };
        return objFacturado;
      } catch (error) {
        console.log(error);
        this.$q.loading.hide();
      }
    },

    async GetReporteContador(rfc, coleccion, tipo, año, mesI, mesF) {
      try {
        const curl = `${this.rutaAxios}/ReporteGeneral/GetReporteContadorAsync/${rfc}/${coleccion}/${tipo}/${año}/${mesI}/${mesF}`;
        const response = await axios.get(curl);
        return response.data;
      } catch (error) {
        console.log(error);
        return 0;
      }
    },

    async GetReporteImportes(rfc, coleccion, tipo, año, mesI, mesF) {
      try {
        const response = await axios.get(
          `${this.rutaAxios}/ReporteGeneral/GetReporteImportesAsync/${rfc}/${coleccion}/${tipo}/${año}/${mesI}/${mesF}`
        );
        return response.data;
      } catch (error) {
        console.log(error);
        return 0;
      }
    },

    async GetReporteImportesNomina(rfc, coleccion, año, mesI, mesF) {
      try {
        const response = await axios.get(
          `${this.rutaAxios}/ReporteGeneral/GetReporteImportesNominaAsync/${rfc}/${coleccion}/${año}/${mesI}/${mesF}`
        );
        return response.data;
      } catch (error) {
        console.log(error);
        return 0;
      }
    },

    async GetReporteRFc(rfc, coleccion, año, mesI, mesF, concentrado) {
      try {
        const response = await axios.get(
          `${this.rutaAxios}/ReporteGeneral/GetReporteRfcAsync/${rfc}/${coleccion}/${año}/${mesI}/${mesF}/${concentrado}`
        );
        return response.data;
      } catch (error) {
        console.log(error);
        return 0;
      }
    },

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

            if (!datosPorMoneda[moneda]) {
              datosPorMoneda[moneda] = [];
            }

            const nombreMes = this.itemsMes[datos.mes - 1].label;
            datos.mes = nombreMes;

            datosPorMoneda[moneda].push(datos);
          });

          if (Object.keys(datosPorMoneda).length > 0) {
            datosFinales.push(datosPorMoneda);
          }
        });
        console.log("flujo_" + tipo, datosFinales);

        return datosFinales;
      } catch (error) {
        console.log(error);
        return 0;
      }
    },

    async GetReporteMetodoPagoAsync(rfc, tipo, año, mesI, mesF) {
      try {
        const response = await axios.get(
          `${this.rutaAxios}/ReporteGeneral/GetReporteMetodoPagoAsync/${rfc}/${tipo}/${año}/${mesI}/${mesF}`
        );

        const data = response.data;

        for (let index = 0; index < data.length; index++) {
          const datoMes = data[index];
          const nombreMes = this.obtenerNombreMes(datoMes.mes);
          datoMes.mes = nombreMes;
        }

        return data;
      } catch (error) {
        console.log(error);
        return 0;
      }
    },

    async GetReporteNominaGeneral(rfc, año, mesI, mesF) {
      try {
        const curl = `${this.rutaAxios}ReporteGeneral/GetReporteNominaGeneralAsync/${rfc}/${año}/${mesI}/${mesF}`;
        const response = await axios.get(curl);
        return response.data;
      } catch (error) {
        console.log(error);
        return 0;
      }
    },

    async GetReporteNominaTrabajador(rfc, año, mesI, mesF) {
      try {
        const curl = `${this.rutaAxios}ReporteGeneral/GetReporteNominaTrabajadorAsync/${rfc}/${año}/${mesI}/${mesF}`;
        const response = await axios.get(curl);
        console.log(curl);

        // TRATAMOS LOS DATOS

        const data = response.data;
        const datosPorMes = {};

        data.forEach((mes) => {
          const nombreMes = this.obtenerNombreMes(mes.mes);
          if (!datosPorMes[nombreMes]) {
            datosPorMes[nombreMes] = [];
          }
          // YA QUE DETALLES SOLO TIENE UN ARREGLO, IGUALAMOS
          datosPorMes[nombreMes] = mes.detalles;
        });

        console.log(datosPorMes);

        return datosPorMes;
      } catch (error) {
        console.log(error);
        return 0;
      }
    },

    async GetReporteNominaConceptos(rfc, año, mesI, mesF) {
      try {
        const curl = `${this.rutaAxios}ReporteGeneral/GetReporteNominaConceptosAsync/${rfc}/${año}/${mesI}/${mesF}`;
        console.log(curl);

        const response = await axios.get(curl);

        // TRATAMOS LOS DATOS

        const data = response.data;
        const datosPorMes = {};

        data.forEach((mes) => {
          const nombreMes = this.obtenerNombreMes(mes.mes);
          if (!datosPorMes[nombreMes]) {
            datosPorMes[nombreMes] = [];
          }
          // YA QUE DETALLES SOLO TIENE UN ARREGLO, IGUALAMOS
          datosPorMes[nombreMes] = mes.detalles;
        });

        return datosPorMes;
      } catch (error) {
        console.log(error);
        return 0;
      }
    },

    async GetReporteUsoCFDI(rfc, año, mesI, mesF) {
      try {
        const curl = `${this.rutaAxios}ReporteGeneral/GetReporteUsoCfdiAsync/${rfc}/${año}/${mesI}/${mesF}`;
        const response = await axios.get(curl);

        // TRATAMOS LOS DATOS

        const data = response.data;
        const datosPorMes = {};

        data.forEach((mes) => {
          const nombreMes = this.obtenerNombreMes(mes.mes);
          if (!datosPorMes[nombreMes]) {
            datosPorMes[nombreMes] = [];
          }
          // YA QUE DETALLES SOLO TIENE UN ARREGLO, IGUALAMOS
          datosPorMes[nombreMes] = mes.detalle;
        });

        // STORE PARA EL VIEW REPORTE
        // this.$store.state.dataReporteCFDI = datosPorMes
        return datosPorMes;
      } catch (error) {
        console.log(error);
        return 0;
      }
    },

    async GetReportePue30Async(rfc, tipo, año, mesI, mesF) {
      try {
        const curl = `${this.rutaAxios}ReporteGeneral/GetReportePue30Async/${rfc}/${tipo}/${año}/${mesI}/${mesF}`;
        const response = await axios.get(curl);

        const objetoDatos = {};

        response.data.map((dato) => {
          try {
            // Extraer manualmente las partes de la fecha usando regex o split
            const fechaStr = dato.fecha;

            // Asumiendo formato ISO: "YYYY-MM-DDTHH:MM:SSZ"
            const partes = fechaStr.split("T")[0].split("-");
            const año = parseInt(partes[0], 10);
            const mes = parseInt(partes[1], 10); // Ya está en formato 1-12
            const nombreMes = this.obtenerNombreMes(mes);

            if (!objetoDatos[nombreMes]) {
              objetoDatos[nombreMes] = [];
            }

            objetoDatos[nombreMes].push(dato);
          } catch (error) {
            console.error(`Error procesando fecha: ${dato.fecha}`, error);
          }
        });

        return objetoDatos;
      } catch (error) {
        console.log(error);
        return 0;
      }
    },

    async GetReportePue99Async(rfc, tipo, año, mesI, mesF) {
      try {
        const curl = `${this.rutaAxios}ReporteGeneral/GetReportePue99Async/${rfc}/${tipo}/${año}/${mesI}/${mesF}`;
        const response = await axios.get(curl);
        const objetoDatos = {};

        response.data.map((dato) => {
          try {
            // Extraer manualmente las partes de la fecha usando regex o split
            const fechaStr = dato.fecha;

            // Asumiendo formato ISO: "YYYY-MM-DDTHH:MM:SSZ"
            const partes = fechaStr.split("T")[0].split("-");
            const año = parseInt(partes[0], 10);
            const mes = parseInt(partes[1], 10); // Ya está en formato 1-12
            const nombreMes = this.obtenerNombreMes(mes);

            if (!objetoDatos[nombreMes]) {
              objetoDatos[nombreMes] = [];
            }

            objetoDatos[nombreMes].push(dato);
          } catch (error) {
            console.error(`Error procesando fecha: ${dato.fecha}`, error);
          }
        });

        return objetoDatos;
      } catch (error) {
        console.log(error);
        return 0;
      }
    },

    async GetReporteSinImpuestosAsync(rfc, tipo, año, mesI, mesF) {
      try {
        const curl = `${this.rutaAxios}ReporteGeneral/GetReporteSinImpuestosAsync/${rfc}/${tipo}/${año}/${mesI}/${mesF}`;
        const response = await axios.get(curl);

        const objetoDatos = {};
        console.log('GetReporteSinImpuestosAsync',response)
        response.data.map((dato) => {
          try {
            // Extraer manualmente las partes de la fecha usando regex o split
            const fechaStr = dato.fecha;

            // Asumiendo formato ISO: "YYYY-MM-DDTHH:MM:SSZ"
            const partes = fechaStr.split("T")[0].split("-");
            const año = parseInt(partes[0], 10);
            const mes = parseInt(partes[1], 10);
            const nombreMes = this.obtenerNombreMes(mes);

            if (!objetoDatos[nombreMes]) {
              objetoDatos[nombreMes] = [];
            }
            if(dato.tipoComprobante != "T"){
              objetoDatos[nombreMes].push(dato);
            }

          } catch (error) {
            console.error(`Error procesando fecha: ${dato.fecha}`, error);
          }
        });

        return objetoDatos;
      } catch (error) {
        console.log(error);
        return 0;
      }
    },

    async GetReporteRiesgoArrendamientoAsync(rfc, año, mesI, mesF) {
      try {
        // SOLO FUNCIONA CON EL TIPO R
        const curl = `${this.rutaAxios}ReporteGeneral/GetReporteRiesgoArrendamientoAsync/${rfc}/R/${año}/${mesI}/${mesF}`;
        const response = await axios.get(curl);

        const objetoDatos = {};

        response.data.map((dato) => {
          try {
            // Extraer manualmente las partes de la fecha usando regex o split
            const fechaStr = dato.fecha;

            // Asumiendo formato ISO: "YYYY-MM-DDTHH:MM:SSZ"
            const partes = fechaStr.split("T")[0].split("-");
            const año = parseInt(partes[0], 10);
            const mes = parseInt(partes[1], 10);
            const nombreMes = this.obtenerNombreMes(mes);

            if (!objetoDatos[nombreMes]) {
              objetoDatos[nombreMes] = [];
            }

            objetoDatos[nombreMes].push(dato);
          } catch (error) {
            console.error(`Error procesando fecha: ${dato.fecha}`, error);
          }
        });

        return objetoDatos;
      } catch (error) {
        console.log(error);
        return 0;
      }
    },

    async GetReporteRiesgoConceptosAsync(rfc, tipo, año, mesI, mesF) {
      try {
        const curl = `${this.rutaAxios}ReporteGeneral/GetReporteRiesgoConceptosAsync/${rfc}/${tipo}/${año}/${mesI}/${mesF}`;
        const response = await axios.get(curl);

        const objetoDatos = {};

        response.data.map((dato) => {
          try {
            // Extraer manualmente las partes de la fecha usando regex o split
            const fechaStr = dato.fecha;

            // Asumiendo formato ISO: "YYYY-MM-DDTHH:MM:SSZ"
            const partes = fechaStr.split("T")[0].split("-");
            const año = parseInt(partes[0], 10);
            const mes = parseInt(partes[1], 10);
            const nombreMes = this.obtenerNombreMes(mes);

            if (!objetoDatos[nombreMes]) {
              objetoDatos[nombreMes] = [];
            }

            objetoDatos[nombreMes].push(dato);
          } catch (error) {
            console.error(`Error procesando fecha: ${dato.fecha}`, error);
          }
        });

        return objetoDatos;
      } catch (error) {
        console.log(error);
        return 0;
      }
    },

    async GetReporteRiesgoFacturaGlobalAsync(rfc, año, mesI, mesF) {
      try {
        const curl = `${this.rutaAxios}ReporteGeneral/GetReporteRiesgoFacturaGlobalAsync/${rfc}/${año}/${mesI}/${mesF}`;
        const response = await axios.get(curl);

        const objetoDatos = {};

        response.data.map((dato) => {
          try {
            // Extraer manualmente las partes de la fecha usando regex o split
            const fechaStr = dato.fecha;

            // Asumiendo formato ISO: "YYYY-MM-DDTHH:MM:SSZ"
            const partes = fechaStr.split("T")[0].split("-");
            const año = parseInt(partes[0], 10);
            const mes = parseInt(partes[1], 10);
            const nombreMes = this.obtenerNombreMes(mes);

            if (!objetoDatos[nombreMes]) {
              objetoDatos[nombreMes] = [];
            }

            objetoDatos[nombreMes].push(dato);
          } catch (error) {
            console.error(`Error procesando fecha: ${dato.fecha}`, error);
          }
        });

        return objetoDatos;
      } catch (error) {
        console.log(error);
        return 0;
      }
    },

    async GetReporteGastosEfectivoAsync(rfc, año, mesI, mesF) {
      try {
        const curl = `${this.rutaAxios}ReporteGeneral/GetReporteGastosEfectivoAsync/${rfc}/${año}/${mesI}/${mesF}`;
        const response = await axios.get(curl);

        const objetoDatos = {};

        response.data.map((dato) => {
          try {
            // Extraer manualmente las partes de la fecha usando regex o split
            const fechaStr = dato.fecha;

            // Asumiendo formato ISO: "YYYY-MM-DDTHH:MM:SSZ"
            const partes = fechaStr.split("T")[0].split("-");
            const año = parseInt(partes[0], 10);
            const mes = parseInt(partes[1], 10);
            const nombreMes = this.obtenerNombreMes(mes);

            if (!objetoDatos[nombreMes]) {
              objetoDatos[nombreMes] = [];
            }

            if (dato.subTotal > 2000) {
              objetoDatos[nombreMes].push(dato);
            }
          } catch (error) {
            console.error(`Error procesando fecha: ${dato.fecha}`, error);
          }
        });

        return objetoDatos;
      } catch (error) {
        console.log(error);
        return 0;
      }
    },

    async GetReporteConsumoCombustibleAsync(rfc, tipo, año, mesI, mesF) {
      try {
        const curl = `${this.rutaAxios}ReporteGeneral/GetReporteConsumoCombustibleAsync/${rfc}/${tipo}/${año}/${mesI}/${mesF}`;
        const response = await axios.get(curl);

        // TRATAMOS LOS DATOS
        const data = response.data;
        const datosPorMes = {};

        data.forEach((mes) => {
          const nombreMes = this.obtenerNombreMes(mes.mes);
          if (!datosPorMes[nombreMes]) {
            datosPorMes[nombreMes] = [];
          }
          // YA QUE DETALLES SOLO TIENE UN ARREGLO, IGUALAMOS
          datosPorMes[nombreMes] = mes.detalles;
        });

        return datosPorMes;
      } catch (error) {
        console.log(error);
        return 0;
      }
    },

    async GetReporteNotasSinRelacionAsync(rfc, año, mesI, mesF) {
      try {
        // SOLO TOMA RECIBIDOS
        const curl = `${this.rutaAxios}ReporteGeneral/GetReporteNotasSinRelacionAsync/${rfc}/R/${año}/${mesI}/${mesF}`;
        const response = await axios.get(curl);

        const objetoDatos = {};

        response.data.map((dato) => {
          try {
            // Extraer manualmente las partes de la fecha usando regex o split
            const fechaStr = dato.fecha;

            // Asumiendo formato ISO: "YYYY-MM-DDTHH:MM:SSZ"
            const partes = fechaStr.split("T")[0].split("-");
            const año = parseInt(partes[0], 10);
            const mes = parseInt(partes[1], 10);
            const nombreMes = this.obtenerNombreMes(mes);

            if (!objetoDatos[nombreMes]) {
              objetoDatos[nombreMes] = [];
            }

            objetoDatos[nombreMes].push(dato);
          } catch (error) {
            console.error(`Error procesando fecha: ${dato.fecha}`, error);
          }
        });

        return objetoDatos;
      } catch (error) {
        console.log(error);
        return 0;
      }
    },

    async GetReportePagoFueraDeTiempoAsync(rfc, tipo, año, mesI, mesF) {
      try {
        // SOLO TOMA RECIBIDOS
        const curl = `${this.rutaAxios}ReporteGeneral/GetReportePagoFueraDeTiempoAsync/${rfc}/${tipo}/${año}/${mesI}/${mesF}`;
        const response = await axios.get(curl);

        console.log("fuera de tiempo", response);
        const objetoDatos = {};

        response.data.map((dato) => {
          try {
            // Extraer manualmente las partes de la fecha usando regex o split
            const fechaStr = dato.fecha;
            const fechaP = dato.fechaPago;

            // Asumiendo formato ISO: "YYYY-MM-DDTHH:MM:SSZ"
            const partes = fechaStr.split("T")[0].split("-");
            const año = parseInt(partes[0], 10);
            const mes = parseInt(partes[1], 10);
            const nombreMes = this.obtenerNombreMes(mes);

            const partesP = fechaP.split("T")[0].split("-");
            const añoP = parseInt(partesP[0], 10);
            const mesP = parseInt(partesP[1], 10);

            if (año === añoP && mes === mesP) {
              return;
            }

            if (!objetoDatos[nombreMes]) {
              objetoDatos[nombreMes] = [];
            }

            objetoDatos[nombreMes].push(dato);
          } catch (error) {
            console.error(`Error procesando fecha: ${dato.fecha}`, error);
          }
        });

        return objetoDatos;
      } catch (error) {
        console.log(error);
        return 0;
      }
    },

    async GetReportePagosAntesDeComprobanteAsync(rfc, tipo, año, mesI, mesF) {
      try {
        // SOLO TOMA RECIBIDOS
        const curl = `${this.rutaAxios}ReporteGeneral/GetReportePagosAntesDeComprobanteAsync/${rfc}/${tipo}/${año}/${mesI}/${mesF}`;
        const response = await axios.get(curl);

        const objetoDatos = {};

        response.data.map((dato) => {
          try {
            // Extraer manualmente las partes de la fecha usando regex o split
            const fechaStr = dato.fecha;
            const fechaP = dato.fechaPago;

            // Asumiendo formato ISO: "YYYY-MM-DDTHH:MM:SSZ"
            const partes = fechaStr.split("T")[0].split("-");
            const año = parseInt(partes[0], 10);
            const mes = parseInt(partes[1], 10);
            const nombreMes = this.obtenerNombreMes(mes);
 

            const partesP = fechaP.split("T")[0].split("-");
            const añoP = parseInt(partesP[0], 10);
            const mesP = parseInt(partesP[1], 10);

            if (año === añoP && mes === mesP) {
              return;
            }

            if (!objetoDatos[nombreMes]) {
              objetoDatos[nombreMes] = [];
            }

            objetoDatos[nombreMes].push(dato);
          } catch (error) {
            console.error(`Error procesando fecha: ${dato.fecha}`, error);
          }
        });

        return objetoDatos;
      } catch (error) {
        console.log(error);
        return 0;
      }
    },

    async GetReporteNominaDuplicadaAsync(rfc, tipo, año, mesI, mesF) {
      try {
        // SOLO TOMA RECIBIDOS
        const curl = `${this.rutaAxios}ReporteGeneral/GetReporteNominaDuplicadaAsync/${rfc}/${tipo}/${año}/${mesI}/${mesF}`;
        const response = await axios.get(curl);

        const objetoDatos = {};

        response.data.map((dato) => {
          try {
            // Extraer manualmente las partes de la fecha usando regex o split
            const fechaStr = dato.fechaPago;

            // Asumiendo formato ISO: "YYYY-MM-DDTHH:MM:SSZ"
            const partes = fechaStr.split("T")[0].split("-");
            const año = parseInt(partes[0], 10);
            const mes = parseInt(partes[1], 10);
            const nombreMes = this.obtenerNombreMes(mes);

            if (!objetoDatos[nombreMes]) {
              objetoDatos[nombreMes] = [];
            }

            objetoDatos[nombreMes].push(dato);
          } catch (error) {
            console.error(`Error procesando fecha: ${dato.fecha}`, error);
          }
        });

        return objetoDatos;
      } catch (error) {
        console.log(error);
        return 0;
      }
    },

    async GetReporteIvaAsync(rfc, tipo, año, mesI, mesF) {
      try {
        const curl = `${this.rutaAxios}ReporteGeneral/GetReporteIvaAsync/${rfc}/${tipo}/${año}/${mesI}/${mesF}`;
        const response = await axios.get(curl);

        // TRATAMOS LOS DATOS
        const data = response.data;
        const datosPorMes = {};

        data.forEach((mes) => {
          const nombreMes = this.obtenerNombreMes(mes.mes);
          if (!datosPorMes[nombreMes]) {
            datosPorMes[nombreMes] = [];
          }
          // YA QUE DETALLES SOLO TIENE UN ARREGLO, IGUALAMOS
          datosPorMes[nombreMes] = mes.detalles;
        });

        return datosPorMes;
      } catch (error) {
        console.log(error);
        return 0;
      }
    },

    async GetReporteIvaRetAsync(rfc, tipo, año, mesI, mesF) {
      try {
        const curl = `${this.rutaAxios}ReporteGeneral/GetReporteIvaRetAsync/${rfc}/${tipo}/${año}/${mesI}/${mesF}`;
        const response = await axios.get(curl);

        // TRATAMOS LOS DATOS
        const data = response.data;
        const datosPorMes = {};

        data.forEach((mes) => {
          const nombreMes = this.obtenerNombreMes(mes.mes);
          if (!datosPorMes[nombreMes]) {
            datosPorMes[nombreMes] = [];
          }
          // YA QUE DETALLES SOLO TIENE UN ARREGLO, IGUALAMOS
          datosPorMes[nombreMes] = mes.detalles;
        });

        return datosPorMes;
      } catch (error) {
        console.log(error);
        return 0;
      }
    },

    async GetReporteIsrNominaAsync(rfc, año, mesI, mesF) {
      try {
        const curl = `${this.rutaAxios}ReporteGeneral/GetReporteIsrNominaAsync/${rfc}/${año}/${mesI}/${mesF}`;
        const response = await axios.get(curl);

        // TRATAMOS LOS DATOS
        const data = response.data;

        for (let index = 0; index < data.length; index++) {
          const datoMes = data[index];
          const nombreMes = this.obtenerNombreMes(datoMes.mes);
          datoMes.mes = nombreMes;
        }

        return data;
      } catch (error) {
        console.log(error);
        return 0;
      }
    },

    async GetRetencionesIsrAsync(rfc, año, mesI, mesF) {
      try {
        const curl = `${this.rutaAxios}ReporteGeneral/GetRetencionesIsrAsync/${rfc}/${año}/${mesI}/${mesF}`;
        const response = await axios.get(curl);

        // TRATAMOS LOS DATOS
        const data = response.data;

        for (let index = 0; index < data.length; index++) {
          const datoMes = data[index];
          const nombreMes = this.obtenerNombreMes(datoMes.mes);
          datoMes.mes = nombreMes;
        }

        return data;
      } catch (error) {
        console.log(error);
        return 0;
      }
    },

    async GetReporteIepsAsync(rfc, año, mesI, mesF) {
      try {
        const curl = `${this.rutaAxios}ReporteGeneral/GetReporteIepsAsync/${rfc}/${año}/${mesI}/${mesF}`;
        const response = await axios.get(curl);

        // TRATAMOS LOS DATOS
        const data = response.data;

        for (let index = 0; index < data.length; index++) {
          const datoMes = data[index];
          const nombreMes = this.obtenerNombreMes(datoMes.mes);
          datoMes.mes = nombreMes;
        }

        return data;
      } catch (error) {
        console.log(error);
        return 0;
      }
    },

    async GetReporteCuentasPendientesAsync(rfc, tipo, año, mesI, mesF) {
      try {
        // SOLO TOMA RECIBIDOS
        const curl = `${this.rutaAxios}ReporteGeneral/GetReporteCuentasPendientesAsync/${rfc}/${tipo}/${año}/${mesI}/${mesF}`;
        const response = await axios.get(curl);

        const objetoDatos = {};

        response.data.map((dato) => {
          try {
            // Extraer manualmente las partes de la fecha usando regex o split
            const fechaStr = dato.fecha;

            // Asumiendo formato ISO: "YYYY-MM-DDTHH:MM:SSZ"
            const partes = fechaStr.split("T")[0].split("-");
            const año = parseInt(partes[0], 10);
            const mes = parseInt(partes[1], 10);
            const nombreMes = this.obtenerNombreMes(mes);

            if (!objetoDatos[nombreMes]) {
              objetoDatos[nombreMes] = [];
            }

            objetoDatos[nombreMes].push(dato);
          } catch (error) {
            console.error(`Error procesando fecha: ${dato.fecha}`, error);
          }
        });

        return objetoDatos;
      } catch (error) {
        console.log(error);
        return 0;
      }
    },

    async GetReporteAnticipoAsync(rfc, tipo, año, mesI, mesF) {
      try {
        const curl = `${this.rutaAxios}ReporteGeneral/GetReporteAnticipoAsync/${rfc}/${tipo}/${año}/${mesI}/${mesF}`;
        const response = await axios.get(curl);

        // TRATAMOS LOS DATOS
        const data = response.data;

        // Procesamos y filtramos los datos
        const datosConDetalles = data.filter(
          (datoMes) => datoMes.detalles && datoMes.detalles.length > 0
        );

        // Convertimos los nombres de los meses para los datos que quedaron
        for (let index = 0; index < datosConDetalles.length; index++) {
          const datoMes = datosConDetalles[index];
          const nombreMes = this.obtenerNombreMes(datoMes.mes);
          datoMes.mes = nombreMes;
        }

        return datosConDetalles;
      } catch (error) {
        console.log(error);
        return 0;
      }
    },

    async GetReporteListasNegrasAsync(rfc, año) {
      try {
        const curl = `${this.rutaAxios}ReporteGeneral/GetReporteListasNegrasAsync/${rfc}/${año}`;
        const response = await axios.get(curl);

        // TRATAMOS LOS DATOS
        const data = response.data;

        return data;
      } catch (error) {
        console.log(error);
        return 0;
      }
    },

    obtenerNombreMes(numero) {
      const meses = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ];
      return meses[numero - 1] || "Mes inválido";
    },

    async ExportPdf() {
      this.$q.loading.show({
        spinner: QSpinnerCube,
        spinnerColor: "white",
        spinnerSize: 120,
        message: "Generando PDF...",
        messageColor: "white",
      });
      const esMensual = this.opcionesReporte.esMensual; // si el reporte es mensual
      const coloresScheme = this.coloresScheme;

      // const coloresScheme = {
      //   emitidos: {
      //     primario: [67, 160, 71], // Verde
      //     secundario: [153, 215, 156],
      //   },
      //   recibidos: {
      //     primario: [40, 75, 140], // Azul
      //     secundario: [110, 140, 200],
      //   },
      //   nomina: {
      //     primario: [199, 80, 121], // Rosa
      //     secundario: [247, 179, 203],
      //   },
      //   riesgoFiscal: {
      //     primario: [155, 45, 45], // Rojo
      //     secundario: [230, 120, 120],
      //   },
      //   flujo: {
      //     primario: [67, 160, 71], // Verde para emitidos
      //     secundario: [153, 215, 156],
      //   },
      //   impuestos: {
      //     primario: [242, 133, 0], // Naranja
      //     secundario: [255, 194, 120],
      //   },
      //   informativo: {
      //     primario: [98, 85, 70], // Café
      //     secundario: [179, 164, 145],
      //   },
      //   usoCFDI: {
      //     primario: [226, 165, 18], // Amarillo
      //     secundario: [255, 235, 160],
      //   },
      // };

      const sectionGroups = [
        {
          category: "Uso CFDI",
          colorScheme: coloresScheme.usoCFDI,
          sections: [
            {
              titulo: "portada",
              contenido: {
                titulo: "comprobantes facturados",
                descripcion: [
                  "Lista de comprobantes emitidos y recibidos durante el o los meses seleccionados, separados por USO de CFDI, los comprobantes se encuentran separados en ingreso y egreso, tanto emitidos como recibidos. Además de señalar los 10 principales clientes y proveedores.",
                ],
              },
              esMensual,
            },
            {
              titulo: "Reporte Uso CFDI",
              contenido: this.dataReporte.usoCDFI,
              esMensual: !this.mostrarConcentradosReporte.mostrarUsoCFDI && esMensual,
            },
            {
              titulo: "Emitidos",
              contenido: this.dataReporte.emitidos,
              colorOverride: coloresScheme.emitidos,
              esMensual: !this.mostrarConcentradosReporte.mostrarEmitidos && esMensual,
            },
            {
              titulo: "RFC Emitidos",
              contenido: this.dataReporte.rfcEmitidos,
              colorOverride: coloresScheme.emitidos,
              esMensual: !this.mostrarConcentradosReporte.mostrarRfcEmitidos && esMensual,
            },
            {
              titulo: "Recibidos",
              contenido: this.dataReporte.recibidos,
              colorOverride: coloresScheme.recibidos,
              esMensual: !this.mostrarConcentradosReporte.mostrarRecibidos && esMensual,
            },
            {
              titulo: "RFC Recibidos",
              contenido: this.dataReporte.rfcRecibidos,
              colorOverride: coloresScheme.recibidos,
              esMensual:
                !this.mostrarConcentradosReporte.mostrarRfcRecibidos && esMensual,
            },
          ],
        },
        {
          category: "Nomina",
          colorScheme: coloresScheme.nomina,
          sections: [
            {
              titulo: "portada",
              contenido: {
                titulo: "reporte de nómina",
                descripcion: ["Lista de comprobantes timbrados, separados por mes."],
              },
              esMensual,
            },
            {
              titulo: "Nomina",
              contenido: this.dataReporte.nomina,
              esMensual: !this.mostrarConcentradosReporte.mostrarNomina && esMensual,
            },
          ],
        },
        {
          category: "Flujo",
          colorScheme: coloresScheme.flujo,
          sections: [
            {
              titulo: "portada",
              contenido: {
                titulo: "reporte de flujo",
                descripcion: [
                  "Se muestran los comprobantes cobrados y pagados, conforme a la emisión de los mismos.",
                ],
              },
              esMensual,
            },
            {
              titulo: "Reporte Flujo Emitido",
              contenido: this.dataReporte.flujoEmitido,
              esMensual:
                !this.mostrarConcentradosReporte.mostrarFlujoEmitido && esMensual,
            },
            {
              titulo: "Reporte Flujo Recibido",
              contenido: this.dataReporte.flujoRecibido,
              esMensual:
                !this.mostrarConcentradosReporte.mostrarFlujoRecibido && esMensual,
              // Override color scheme for this specific section
              colorOverride: coloresScheme.recibidos,
            },
            {
              titulo: "Nomina General",
              contenido: this.dataReporte.nominaGeneral,
              esMensual:
                !this.mostrarConcentradosReporte.mostrarNominaGeneral && esMensual,
              colorOverride: coloresScheme.nomina,
            },
            {
              titulo: "Nomina Trabajadores",
              contenido: this.dataReporte.nominaTrabajadores,
              esMensual:
                !this.mostrarConcentradosReporte.mostrarNominaTrabajadores && esMensual,
              colorOverride: coloresScheme.nomina,
            },
            {
              titulo: "Nomina Conceptos",
              contenido: this.dataReporte.nominaConceptos,
              esMensual:
                !this.mostrarConcentradosReporte.mostrarNominaConceptos && esMensual,
              colorOverride: coloresScheme.nomina,
            },
            {
              titulo: "cuentasPendientesEmitidos",
              contenido: this.dataReporte.cuentasPendientesEmitidos,
              esMensual:
                !this.mostrarConcentradosReporte.mostrarCuentasPendientesEmitidos &&
                esMensual,
              colorOverride: coloresScheme.emitidos,
            },
            {
              titulo: "cuentasPendientesRecibidos",
              contenido: this.dataReporte.cuentasPendientesRecibidos,
              esMensual:
                !this.mostrarConcentradosReporte.mostrarCuentasPendientesRecibidos &&
                esMensual,
              colorOverride: coloresScheme.recibidos,
            },
            {
              titulo: "metodosDePagoEmitidos",
              contenido: this.dataReporte.metodosDePagoEmitidos,
              esMensual:
                !this.mostrarConcentradosReporte.mostrarMetodosPagoEmitidos && esMensual,
              colorOverride: coloresScheme.emitidos,
            },
            {
              titulo: "metodosDePagoRecibidos",
              contenido: this.dataReporte.metodosDePagoRecibidos,
              esMensual:
                !this.mostrarConcentradosReporte.mostrarMetodosPagoRecibidos && esMensual,
              colorOverride: coloresScheme.recibidos,
            },
            {
              titulo: "Comparativa Flujo Emitido - Recibido",
              contenido: this.comparativaFlujo,
              esMensual: false,
              // Override color scheme for this specific section
              colorOverride: coloresScheme.recibidos,
            },
          ],
        },
        {
          category: "Riesgo Fiscal",
          colorScheme: coloresScheme.riesgoFiscal,
          sections: [
            {
              titulo: "portada",
              contenido: {
                titulo: "reporte de riesgo fiscal",
                descripcion: [
                  "Comprobantes en PUE, con forma de pago 99: Para los comprobantes emitidos con método de pago PUE, se debe de indicar la forma de pago, con la cual se está cubriendo el costo del bien o servicio, dejando únicamente la forma de pago 99, para aquellos comprobantes emitidos en PPD, ya que se desconoce el método de pago, con el cual se pagará dicha factira.",
                ],
              },
              esMensual,
            },
            {
              titulo: "PUE 99 Emitido",
              contenido: this.dataReporte.pue99Emitidos,
              esMensual:
                !this.mostrarConcentradosReporte.mostrarPue99Emitido && esMensual,
            },
            {
              titulo: "PUE 99 Recibido",
              contenido: this.dataReporte.pue99Recibidos,
              esMensual:
                !this.mostrarConcentradosReporte.mostrarPue99Recibido && esMensual,
            },
            {
              titulo: "PUE 30 Emitido",
              contenido: this.dataReporte.pue30Emitidos,
              esMensual:
                !this.mostrarConcentradosReporte.mostrarPue30Emitido && esMensual,
            },
            {
              titulo: "PUE 30 Recibido",
              contenido: this.dataReporte.pue30Recibidos,
              esMensual:
                !this.mostrarConcentradosReporte.mostrarPue99Recibido && esMensual,
            },
            {
              titulo: "Sin Impuestos Emitidos",
              contenido: this.dataReporte.rSinImpuestosEmitidos,
              esMensual:
                !this.mostrarConcentradosReporte.mostrarSinImpuestosEmitidos && esMensual,
            },
            {
              titulo: "Sin Impuestos Recibidos",
              contenido: this.dataReporte.rSinImpuestosRecibidos,
              esMensual:
                !this.mostrarConcentradosReporte.mostrarSinImpuestosRecibidos &&
                esMensual,
            },
            {
              titulo: "Riesgo Arrendamiento",
              contenido: this.dataReporte.riesgoArrendamiento,
              esMensual:
                !this.mostrarConcentradosReporte.mostrarRiesgoArrendamiento && esMensual,
            },
            {
              titulo: "Riesgo Conceptos Emitidos",
              contenido: this.dataReporte.riesgoConceptosEmitidos,
              esMensual:
                !this.mostrarConcentradosReporte.mostrarRiesgoConceptosEmitidos &&
                esMensual,
            },
            {
              titulo: "Riesgo Conceptos Recibidos",
              contenido: this.dataReporte.riesgoConceptosRecibidos,
              esMensual:
                !this.mostrarConcentradosReporte.mostrarRiesgoConceptosRecibidos &&
                esMensual,
            },
            {
              titulo: "Gastos Efectivo",
              contenido: this.dataReporte.gastosEfectivo,
              esMensual:
                !this.mostrarConcentradosReporte.mostrarGastosEfectivo && esMensual,
            },
            {
              titulo: "Notas Sin Relación",
              contenido: this.dataReporte.notasSinRelacion,
              esMensual:
                !this.mostrarConcentradosReporte.mostrarNotasSinRelacion && esMensual,
            },
            {
              titulo: "pagoFueraDeTiempoEmitidos",
              contenido: this.dataReporte.pagoFueraDeTiempoEmitidos,
              esMensual:
                !this.mostrarConcentradosReporte.mostrarPagoFueraDeTiempoEmitidos &&
                esMensual,
            },
            {
              titulo: "pagoFueraDeTiempoRecibidos",
              contenido: this.dataReporte.pagoFueraDeTiempoRecibidos,
              esMensual:
                !this.mostrarConcentradosReporte.mostrarPagoFueraDeTiempoRecibidos &&
                esMensual,
            },
            {
              titulo: "pagoAntesDeComprobanteEmitidos",
              contenido: this.dataReporte.pagoAntesDeComprobanteEmitidos,
              esMensual:
                !this.mostrarConcentradosReporte.mostrarPagoAntesDeComprobanteEmitidos &&
                esMensual,
            },
            {
              titulo: "pagoAntesDeComprobanteRecibidos",
              contenido: this.dataReporte.pagoAntesDeComprobanteRecibidos,
              esMensual:
                !this.mostrarConcentradosReporte.mostrarPagoAntesDeComprobanteRecibidos &&
                esMensual,
            },
            {
              titulo: "nominaDuplicadoO",
              contenido: this.dataReporte.nominaDuplicadoO,
              esMensual:
                !this.mostrarConcentradosReporte.mostrarNominaDuplicadoO && esMensual,
            },
            {
              titulo: "nominaDuplicadoE",
              contenido: this.dataReporte.nominaDuplicadoE,
              esMensual:
                !this.mostrarConcentradosReporte.mostrarNominaDuplicadoE && esMensual,
            },
            {
              titulo: "riesgoFacturadoGlobal",
              contenido: this.dataReporte.riesgoFacturadoGlobal,
              esMensual:
                !this.mostrarConcentradosReporte.mostrarRiesgoFacturadoGlobal &&
                esMensual,
            },
          ],
        },
        {
          category: "Impuestos",
          colorScheme: coloresScheme.impuestos,
          sections: [
            {
              titulo: "portada",
              contenido: {
                titulo: "reporte de impuestos",
                descripcion: [
                  ": En este apartado se indica los impuestos conforme al flujo que se señalan en los comprobantes emitidos y recibidos, aplicando comprobantes del tipo I y del tipo E, emitidos con método de pago PUE, así como los complementos de pago y recibos de nómina, en los cuales se indica la fecha de aplicación.",
                ],
              },
              esMensual,
            },
            {
              titulo: "reporteIva",
              contenido: this.dataReporte.reporteIva,
              esMensual: !this.mostrarConcentradosReporte.mostrarReporteIva && esMensual,
            },
            {
              titulo: "ivaRetEmitidos",
              contenido: this.dataReporte.ivaRetEmitidos,
              esMensual:
                !this.mostrarConcentradosReporte.mostrarIvaRetEmitidos && esMensual,
            },
            {
              titulo: "ivaRetRecibidos",
              contenido: this.dataReporte.ivaRetRecibidos,
              esMensual:
                !this.mostrarConcentradosReporte.mostrarIvaRetRecibidos && esMensual,
            },
            {
              titulo: "isrNomina",
              contenido: this.dataReporte.isrNomina,
              esMensual: !this.mostrarConcentradosReporte.mostrarIsrNomina && esMensual,
            },
            {
              titulo: "retencionesIsr",
              contenido: this.dataReporte.retencionesIsr,
              esMensual:
                !this.mostrarConcentradosReporte.mostrarRetencionesIsr && esMensual,
            },
            {
              titulo: "ieps",
              contenido: this.dataReporte.ieps,
              esMensual: !this.mostrarConcentradosReporte.mostrarIeps && esMensual,
            },
          ],
        },
        {
          category: "Informativo",
          colorScheme: coloresScheme.informativo,
          sections: [
            {
              titulo: "portada",
              contenido: {
                titulo: "consumo de combustibles",
                descripcion: [
                  "Se muestra el consumo de combustibles durante el periodo, pudiendo observar el tipo de combustible, el importe y el número de litros consumidos, así como observar si estos fueron pagados de contado o a crédito.",
                ],
              },
              esMensual,
            },
            {
              titulo: "consumoCombustibleEmitido",
              contenido: this.dataReporte.consumoCombustibleEmitido,
              // colorOverride: coloresScheme.emitidos,
              esMensual:
                !this.mostrarConcentradosReporte.mostrarConsumoCombustibleEmitido &&
                esMensual,
            },
            {
              titulo: "consumoCombustibleRecibido",
              contenido: this.dataReporte.consumoCombustibleRecibido,
              // colorOverride: coloresScheme.recibidos,
              esMensual:
                !this.mostrarConcentradosReporte.mostrarConsumoCombustibleRecibido &&
                esMensual,
            },
          ],
        },
        {
          category: "Anticipos",
          colorScheme: coloresScheme.informativo,
          sections: [
            {
              titulo: "portada",
              contenido: {
                titulo: "Reporte de anticipos",
                descripcion: [
                  "Se muestra el consumo de combustibles durante el periodo, pudiendo observar el tipo de combustible, el importe y el número de litros consumidos, así como observar si estos fueron pagados de contado o a crédito.",
                ],
              },
              esMensual,
            },
            {
              titulo: "anticiposEmitidos",
              contenido: this.dataReporte.anticiposEmitidos,
              colorOverride: coloresScheme.emitidos,
              esMensual:
                !this.mostrarConcentradosReporte.mostrarAnticiposEmitidos && esMensual,
            },
            {
              titulo: "anticiposRecibidos",
              contenido: this.dataReporte.anticiposRecibidos,
              colorOverride: coloresScheme.recibidos,
              esMensual:
                !this.mostrarConcentradosReporte.mostrarAnticiposRecibidos && esMensual,
            },
          ],
        },
        {
          category: "Listas Negras",
          colorScheme: coloresScheme.informativo,
          sections: [
            {
              titulo: "portada",
              contenido: {
                titulo: "Reporte de listas negras",
                descripcion: [""],
              },
              esMensual,
            },
            {
              titulo: "listasNegras",
              contenido: this.dataReporte.listasNegras,
              colorOverride: coloresScheme.recibidos,
              esMensual: !this.mostrarConcentradosReporte.listasNegras && esMensual,
            },
          ],
        },
      ];

      const secciones = [];
      sectionGroups.forEach((group) => {
        group.sections.forEach((section) => {
          secciones.push({
            ...section,
            colores: section.colorOverride || group.colorScheme,
          });
        });
      });
      this.$store.state.dataViewReporte = secciones;
      console.log("secciones", secciones);
      try {
        const logo = require("../../assets/logo_contago_sin_fondo.png");
        const resultado = await generarReporteEmpresarial(this.token, secciones, {
          datosEmpresa: this.datosEmpresa,
          logo: logo,
          mesI: this.itemsMes[this.opcionesReporte.mesInicial - 1].label,
          mesF: this.itemsMes[this.opcionesReporte.mesFinal - 1].label,
          anio: this.opcionesReporte.anio,
        });

        // Descargar el PDF
        descargarPDF(resultado.blob, resultado.nombreDoc);
        this.$q.loading.hide();
        return resultado.base64;
      } catch (error) {
        console.error("Error en reporte general:", error);
        return null;
      }
      this.$q.loading.hide();
      return base64PDF;
    },

    async ExportPdfIndice() {
      this.$q.loading.show({
        spinner: QSpinnerCube,
        spinnerColor: "white",
        spinnerSize: 120,
        message: "Generando PDF...",
        messageColor: "white",
      });

      try {
        // Descargar el PDF
        const logo = require("../../assets/logo_contago_sin_fondo.png");
        const resultado = await generarIndiceEmpresarial({
          datosEmpresa: this.datosEmpresa,
          logo: logo,
          mesI: this.itemsMes[this.opcionesReporte.mesInicial - 1].label,
          mesF: this.itemsMes[this.opcionesReporte.mesFinal - 1].label,
          anio: this.opcionesReporte.anio,
        });

        descargarPDFIndice(resultado.blob, resultado.nombreDoc);
        this.$q.loading.hide();
        return resultado.base64;
      } catch (error) {
        console.error("Error en reporte general:", error);
        return null;
      }
      this.$q.loading.hide();
      return base64PDF;
    },

    fechaActual() {
      const fechaActual = new Date();
      const anioActaul = fechaActual.getFullYear();
      const mesActual = fechaActual.getMonth() - 1;

      this.selectedAnio = anioActaul;
      this.selectedMes = this.itemsMes[mesActual];
    },

    UltimoDiaMes() {
      const fecha = new Date(this.fechaI);
      const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
      this.fechaF = ultimoDia;
    },

    formatMiles(numero) {
      const formato = numero.toLocaleString("en-US", {
        maximumFractionDigits: 0,
      });
      return formato;
    },

    formatCurrency(value) {
      return value.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      });
    },

    formatCuantity(numero) {
      return numero.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    // GENERADOR DE TABLAS
    datosTabla(items) {
      items.shift();
      let columns = [];

      for (let item of items) {
        let tipos = Object.keys(item);
        for (let i = 0; i < tipos.length; i++) {
          if (tipos[i] === "NONE") {
            break;
          }
          const x = { ...item[tipos[i]] };
          let columasTipo = [];
          for (let y in x) {
            const colName = `${y}_${tipos[i]}`;
            const itemColumn = {
              name: colName,
              align: "left",
              label: y,
              field: colName,
            };
            columns.push(itemColumn);
            this.tableColums.push(itemColumn);
          }
        }
        break;
      }
      // console.log(columns);
      // console.log(this.tableData);
    },

    convertToBase64(url) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        fetch(url)
          .then((res) => res.blob())
          .then((blob) => {
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
      });
    },

    // GENERAR REPORTE PAGOS MENSUALES
    async GetReportePMPDF() {
      this.$q.loading.show({
        spinner: QSpinnerCube,
        spinnerColor: "red-8",
        spinnerSize: 140,
        message: "Generando PDF...",
      });
      const base64Logo = await this.convertToBase64(logo);
      // REPORTE DE IVA
      // await this.GetReporteIVA();
      // // RETENCIONES DE IVA
      // await this.GetReporteRetencionesIVA();
      // // RETENCIONES DE ISR
      // await this.GetReporteNomina();
      // await this.GetReporteIsr();
      // // PAGOS PROVISIONALES DE ISR
      // await this.GetReportePagosProvisionales();
      // // USO DEL CFDI
      // await this.GetReporteUsoCFDI();

      await generarReporte(
        this.selectedAnio,
        this.selectedMesI.label,
        this.selectedMesF.label,
        this.dataComprobantes,
        this.dataIvaRetenido,
        this.dataSueldos,
        this.dataAsimilados,
        this.dataOtros,
        this.dataHonorarios,
        this.dataArrendamientos,
        this.dataComprobantesP,
        this.columns,
        this.itemsReporte,

        this.dataVentas,
        this.dataCompras,

        this.dataMagna,
        this.dataPremium,
        this.dataDiesel,

        this.dataMagnaU,
        this.dataPremiumU,
        this.dataDieselU,
        this.datosRiesgoFiscal,
        this.datosRiesgoFiscalPagos,
        this.dataAnual,
        this.comentarios,
        this.$store.state.empresaStore.nombre,
        base64Logo,
        this.$store.state.usuario.nombre,
        this.comparativaFlujo,
        this.dataIvaRetenidoNeteado,
        this.dataISRRetenidoFavor,
        this.dataComprobantesConceptos,
        this.$store.state.empresaStore.rfc

      );
      this.$q.loading.hide();
    },

    // GET REPORTE DE IVA
    async GetReporteIVA() {
      this.$q.loading.show({
        spinner: QSpinnerCube,
        spinnerColor: "red-8",
        spinnerSize: 140,
        message: "Gerando reporte de IVA...",
      });
      // if (parseInt(this.selectedAnio) < 2024) {
      //   const ivaCargo = await this.GetIvaTrasladado();
      //   await this.GetReporteIva(ivaCargo);
      // } else {
      //   await this.GetReporteIva2024();
      // }
      const rfc = this.token.rfc;

      if (rfc.length == 12) {
        console.log('persona moral')
        if (this.selectedAnio < 2024) {
          const ivaCargo = await this.GetIvaTrasladado();
          await this.GetReporteIva(ivaCargo);
        } else {
          await this.GetReporteIva2024();
        }
      } else if (rfc.length == 13) {
        console.log('persona fisica')

        if (this.selectedAnio < 2024) {
          const ivaCargo = await this.GetIvaTrasladado();
          await this.GetReporteIvaFisicas(ivaCargo);
        } else {
          await this.GetReporteIva2024Fisicas();
        }
      }

      this.$q.loading.hide();
    },

    async GetReporteIva(ivaCargo) {
      try {
        this.dataComprobantes = [];
        let ivaAcreditable = await this.GetIvaAcreditado();
        let ivaRetenido = await this.GetIvaRetenido();
        let comparativa = await this.GetComparativaIva(this.selectedAnio, "IVA");
        let ObjIva = {};
        for (let x = 0; x < this.selectedMesF.value; x++) {
          ObjIva.año = this.selectedAnio;
          ObjIva.mes = ivaCargo[x].mes;

          ObjIva.baseIvaTrasladado = ivaCargo[x].baseIva;
          ObjIva.importeIvaTrasladado = ivaCargo[x].importeIva;
          ObjIva.detallesTrasladado = ivaCargo[x].detalles;

          ObjIva.baseIvaAcreditado = ivaAcreditable[x].baseIva;
          ObjIva.importeIvaAcreditado = ivaAcreditable[x].importeIva;
          ObjIva.detallesAcreditado = ivaAcreditable[x].detalles;

          ObjIva.ivaRetenidoAnterior = ivaRetenido[x].importeIva;
          ObjIva.ivaRetenido = ivaRetenido[x + 1].importeIva;

          let ivaCargo_ = ivaCargo[x].importeIva;
          let ivaAcreditado_ = ivaAcreditable[x].importeIva;

          let ivaRetenido_ = ivaRetenido[x].importeIva;
          let ivaRetenidoAnterior_ = ivaRetenido[x + 1].importeIva;

          let calculo = ivaCargo_ - ivaAcreditado_ - ivaRetenido_ + ivaRetenidoAnterior_;
          if (calculo > 0) {
            ObjIva.ivaCargo = calculo;
            ObjIva.ivaFavor = 0;
          } else {
            ObjIva.ivaCargo = 0;
            ObjIva.ivaFavor = calculo * -1;
          }

          //COMPARATIVA
          ObjIva.cargoRegistrado = comparativa[x].ivaCargo;
          ObjIva.favorRegistrado = comparativa[x].ivaFavor;

          let comparativa_ =
            (ObjIva.ivaCargo -
              ObjIva.ivaFavor -
              ObjIva.cargoRegistrado +
              ObjIva.favorRegistrado) *
            -1;
          if (comparativa_ != 0) {
            comparativa_ = comparativa_ * -1;
          }
          ObjIva.comparativa = comparativa_;

          this.dataComprobantes.push(ObjIva);
          ObjIva = {};
        }

        let objetoTotales = {
          año: "TOTAL",
          mes: "",

          baseIvaTrasladado: this.dataComprobantes.reduce(
            (acumulador, objeto) => acumulador + objeto.baseIvaTrasladado,
            0
          ),
          importeIvaTrasladado: this.dataComprobantes.reduce(
            (acumulador, objeto) => acumulador + objeto.importeIvaTrasladado,
            0
          ),
          detallesTrasladado: [],

          baseIvaAcreditado: this.dataComprobantes.reduce(
            (acumulador, objeto) => acumulador + objeto.baseIvaAcreditado,
            0
          ),
          importeIvaAcreditado: this.dataComprobantes.reduce(
            (acumulador, objeto) => acumulador + objeto.importeIvaAcreditado,
            0
          ),
          detallesAcreditado: [],

          ivaRetenidoAnterior: this.dataComprobantes.reduce(
            (acumulador, objeto) => acumulador + objeto.ivaRetenidoAnterior,
            0
          ),
          ivaRetenido: this.dataComprobantes.reduce(
            (acumulador, objeto) => acumulador + objeto.ivaRetenido,
            0
          ),
          ivaCargo: this.dataComprobantes.reduce(
            (acumulador, objeto) => acumulador + objeto.ivaCargo,
            0
          ),
          ivaFavor: this.dataComprobantes.reduce(
            (acumulador, objeto) => acumulador + objeto.ivaFavor,
            0
          ),
          cargoRegistrado: this.dataComprobantes.reduce(
            (acumulador, objeto) => acumulador + objeto.cargoRegistrado,
            0
          ),
          favorRegistrado: this.dataComprobantes.reduce(
            (acumulador, objeto) => acumulador + objeto.favorRegistrado,
            0
          ),
          comparativa: this.dataComprobantes.reduce(
            (acumulador, objeto) => acumulador + objeto.comparativa,
            0
          ),
        };

        this.dataComprobantes.push(objetoTotales);
      } catch (error) {
        console.log(this.dataComprobantes);
        this.$q.loading.hide();
        console.log(error);
      }
    },
    async GetReporteIvaFisicas(ivaCargo) {
      try {
        console.log("ivaCargo");

        this.dataComprobantes = [];
        this.$q.loading.show({
          spinner: QSpinnerCube,
          spinnerColor: "red-8",
          spinnerSize: 140,
          message: "Consultando datos, espere...",
        });

        // let ivaCargo = await this.GetIvaTrasladado();
        let ivaAcreditable = await this.GetIvaAcreditado();
        let ivaRetenido = await this.GetReporteIvaRetenidoNeteadoAsync();
        console.log("iva ret a", ivaRetenido);
        let comparativa = await this.GetComparativa(this.selectedAnio, "IVA");

        let ObjIva = {};

        for (let x = 0; x < this.selectedMesF.value; x++) {
          ObjIva.año = this.selectedAnio;
          ObjIva.mes = ivaCargo[x].mes;

          ObjIva.baseIvaTrasladado = ivaCargo[x].baseIva;
          ObjIva.importeIvaTrasladado = ivaCargo[x].importeIva;
          ObjIva.detallesTrasladado = ivaCargo[x].detalles;

          ObjIva.baseIvaAcreditado = ivaAcreditable[x].baseIva;
          ObjIva.importeIvaAcreditado = ivaAcreditable[x].importeIva;
          ObjIva.detallesAcreditado = ivaAcreditable[x].detalles;

          // ObjIva.ivaRetenidoAnterior = ivaRetenido[x].importeIva
          ObjIva.ivaRetenido = ivaRetenido[x + 1].importeIva;
          ObjIva.ivaRetenidoAnterior = 0;

          let ivaCargo_ = ivaCargo[x].importeIva;
          let ivaAcreditado_ = ivaAcreditable[x].importeIva;

          // let ivaRetenido_ = ivaRetenido[x].importeIva
          let ivaRetenido_ = ObjIva.ivaRetenido;
          let ivaRetenidoAnterior_ = ivaRetenido[x + 1].importeIva;

          // let calculo = ivaCargo_ - ivaAcreditado_ - ivaRetenido_ + ivaRetenidoAnterior_
          let calculo = ivaCargo_ - ivaAcreditado_ - ivaRetenido_;
          console.log(ivaCargo_ + " - " + ivaAcreditado_ + " - " + ivaRetenido_);
          console.log(calculo);
          if (calculo > 0) {
            ObjIva.ivaCargo = calculo;
            ObjIva.ivaFavor = 0;
          } else {
            ObjIva.ivaCargo = 0;
            ObjIva.ivaFavor = calculo * -1;
          }

          //COMPARATIVA
          ObjIva.cargoRegistrado = comparativa[x].ivaCargo;
          ObjIva.favorRegistrado = comparativa[x].ivaFavor;

          let comparativa_ =
            (ObjIva.ivaCargo -
              ObjIva.ivaFavor -
              ObjIva.cargoRegistrado +
              ObjIva.favorRegistrado) *
            -1;
          if (comparativa_ != 0) {
            comparativa_ = comparativa_ * -1;
          }
          ObjIva.comparativa = comparativa_;

          this.dataComprobantes.push(ObjIva);
          ObjIva = {};
        }

        let objetoTotales = {
          año: "Total",
          mes: "Total",

          baseIvaTrasladado: this.dataComprobantes.reduce(
            (acumulador, objeto) => acumulador + objeto.baseIvaTrasladado,
            0
          ),
          importeIvaTrasladado: this.dataComprobantes.reduce(
            (acumulador, objeto) => acumulador + objeto.importeIvaTrasladado,
            0
          ),
          detallesTrasladado: [],

          baseIvaAcreditado: this.dataComprobantes.reduce(
            (acumulador, objeto) => acumulador + objeto.baseIvaAcreditado,
            0
          ),
          importeIvaAcreditado: this.dataComprobantes.reduce(
            (acumulador, objeto) => acumulador + objeto.importeIvaAcreditado,
            0
          ),
          detallesAcreditado: [],

          ivaRetenidoAnterior: this.dataComprobantes.reduce(
            (acumulador, objeto) => acumulador + objeto.ivaRetenidoAnterior,
            0
          ),
          ivaRetenido: this.dataComprobantes.reduce(
            (acumulador, objeto) => acumulador + objeto.ivaRetenido,
            0
          ),
          ivaCargo: this.dataComprobantes.reduce(
            (acumulador, objeto) => acumulador + objeto.ivaCargo,
            0
          ),
          ivaFavor: this.dataComprobantes.reduce(
            (acumulador, objeto) => acumulador + objeto.ivaFavor,
            0
          ),
          cargoRegistrado: this.dataComprobantes.reduce(
            (acumulador, objeto) => acumulador + objeto.cargoRegistrado,
            0
          ),
          favorRegistrado: this.dataComprobantes.reduce(
            (acumulador, objeto) => acumulador + objeto.favorRegistrado,
            0
          ),
          comparativa: this.dataComprobantes.reduce(
            (acumulador, objeto) => acumulador + objeto.comparativa,
            0
          ),
        };
        this.dataComprobantes.push(objetoTotales);

        this.$q.loading.hide();
      } catch (error) {
        console.log(error);
        this.$q.loading.hide();
      }
    },
    async GetReporteIva2024() {
      this.dataComprobantes = [];
      const rfc = this.token.rfc;
      const fechaI = `${this.selectedAnio}-01-01`;
      const fechaF = `${this.selectedAnio}-${this.selectedMesF.value}-01`;

      const emitidos =
        (await this.GetReporteIvaCompletoEmitidos(rfc, fechaI, fechaF)) || [];
      const recibidos =
        (await this.GetReporteIvaCompletoRecibidos(rfc, fechaI, fechaF)) || [];
      const ivaRet = (await this.GetIvaRetenido()) || [];
      const comp = (await this.GetComparativaIva(this.selectedAnio, "IVA")) || [];
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
      console.log(this.selectedMesF);

      for (let x = 0; x <= this.selectedMesF.value; x++) {
        console.log(meses[x]);
        const mes = meses[x];
        console.log(mes);

        const baseIvaTrasladado = emitidos
          .filter((item) => item.mes?.toUpperCase() === mes)
          .reduce((acc, item) => acc + (item.baseIva || 0), 0);

        const importeIvaTrasladado = emitidos
          .filter((item) => item.mes?.toUpperCase() === mes)
          .reduce((acc, item) => acc + (item.importeIva || 0), 0);

        const baseIvaAcreditado = recibidos
          .filter((item) => item.mes?.toUpperCase() === mes)
          .reduce((acc, item) => acc + (item.baseIva || 0), 0);

        const importeIvaAcreditado = recibidos
          .filter((item) => item.mes?.toUpperCase() === mes)
          .reduce((acc, item) => acc + (item.importeIva || 0), 0);

        console.log("Retenido", ivaRet);
        const ivaRetenido = ivaRet
          .filter((item) => item.mes?.toUpperCase() === mes)
          .reduce((acc, item) => acc + (item.importeIva || 0), 0);

        const ivaRetenidoAnterior = ivaRet[x]?.importeIva || 0;

        let ivaCargo = 0;
        let ivaFavor = 0;
        const calculo =
          importeIvaTrasladado - importeIvaAcreditado + ivaRetenido - ivaRetenidoAnterior;

        if (calculo > 0) {
          ivaCargo = calculo;
          ivaFavor = 0;
        } else {
          ivaCargo = 0;
          ivaFavor = Math.abs(calculo);
        }

        const cargoRegistrado = comp
          .filter((item) => item.mes?.toUpperCase() === mes)
          .reduce((acc, item) => acc + (item.ivaCargo || 0), 0);

        const favorRegistrado = comp
          .filter((item) => item.mes?.toUpperCase() === mes)
          .reduce((acc, item) => acc + (item.ivaFavor || 0), 0);

        let comparativa = (ivaCargo - ivaFavor - cargoRegistrado + favorRegistrado) * -1;
        if (comparativa !== 0) {
          comparativa *= -1;
        }

        const objIva = {
          año: this.selectedAnio,
          mes: mes,
          baseIvaTrasladado: baseIvaTrasladado,
          importeIvaTrasladado: importeIvaTrasladado,
          accionesT: [],
          baseIvaAcreditado: baseIvaAcreditado,
          importeIvaAcreditado: importeIvaAcreditado,
          accionesA: [],
          ivaRetenido: ivaRetenido,
          ivaRetenidoAnterior: ivaRetenidoAnterior,
          ivaCargo: ivaCargo,
          ivaFavor: ivaFavor,
          cargoRegistrado: cargoRegistrado,
          favorRegistrado: favorRegistrado,
          comparativa: comparativa,
        };

        console.log(objIva);
        this.dataComprobantes.push(objIva);
      }

      this.dataComprobantes.pop();

      let objetoTotales = {
        año: "TOTAL",
        mes: "TOTAL",
        baseIvaTrasladado: this.dataComprobantes.reduce(
          (acumulador, objeto) => acumulador + objeto.baseIvaTrasladado,
          0
        ),
        importeIvaTrasladado: this.dataComprobantes.reduce(
          (acumulador, objeto) => acumulador + objeto.importeIvaTrasladado,
          0
        ),
        detallesTrasladado: [],
        baseIvaAcreditado: this.dataComprobantes.reduce(
          (acumulador, objeto) => acumulador + objeto.baseIvaAcreditado,
          0
        ),
        importeIvaAcreditado: this.dataComprobantes.reduce(
          (acumulador, objeto) => acumulador + objeto.importeIvaAcreditado,
          0
        ),
        detallesAcreditado: [],
        ivaRetenidoAnterior: this.dataComprobantes.reduce(
          (acumulador, objeto) => acumulador + objeto.ivaRetenidoAnterior,
          0
        ),
        ivaRetenido: this.dataComprobantes.reduce(
          (acumulador, objeto) => acumulador + objeto.ivaRetenido,
          0
        ),
        ivaCargo: this.dataComprobantes.reduce(
          (acumulador, objeto) => acumulador + objeto.ivaCargo,
          0
        ),
        ivaFavor: this.dataComprobantes.reduce(
          (acumulador, objeto) => acumulador + objeto.ivaFavor,
          0
        ),
        cargoRegistrado: this.dataComprobantes.reduce(
          (acumulador, objeto) => acumulador + objeto.cargoRegistrado,
          0
        ),
        favorRegistrado: this.dataComprobantes.reduce(
          (acumulador, objeto) => acumulador + objeto.favorRegistrado,
          0
        ),
        comparativa: this.dataComprobantes.reduce(
          (acumulador, objeto) => acumulador + objeto.comparativa,
          0
        ),
      };

      this.dataComprobantes.push(objetoTotales);
      // Asegura que existan datos
      if (this.dataComprobantes.length > 0) {
      } else {
        console.warn("No hay datos por mostrar.");
      }
    },
    async GetReporteIva2024Fisicas() {
      this.$q.loading.show({
        spinner: QSpinnerCube,
        spinnerColor: "red-8",
        spinnerSize: 140,
        message: "Calculando..",
      });

      this.dataComprobantes = [];
      const rfc = this.token.rfc;
      const fechaI = `${this.selectedAnio}-01-01`;
      const fechaF = `${this.selectedAnio}-${this.selectedMesF.value}-01`;

      // **Fetching data**
      const emitidos =
        (await this.GetReporteIvaCompletoEmitidos(rfc, fechaI, fechaF)) || [];
      const recibidos =
        (await this.GetReporteIvaCompletoRecibidos(rfc, fechaI, fechaF)) || [];
      const ivaRet = (await this.GetReporteIvaRetenidoNeteadoAsync()) || [];
      console.log("Retenido", ivaRet);
      const comp = (await this.GetComparativa(this.selectedAnio, "IVA")) || [];
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

      for (let x = 0; x <= this.selectedMesF.value; x++) {
        const mes = meses[x];

        const baseIvaTrasladado = emitidos
          .filter((item) => item.mes?.toUpperCase() === mes)
          .reduce((acc, item) => acc + (item.baseIva || 0), 0);

        const importeIvaTrasladado = emitidos
          .filter((item) => item.mes?.toUpperCase() === mes)
          .reduce((acc, item) => acc + (item.importeIva || 0), 0);

        const baseIvaAcreditado = recibidos
          .filter((item) => item.mes?.toUpperCase() === mes)
          .reduce((acc, item) => acc + (item.baseIva || 0), 0);

        const importeIvaAcreditado = recibidos
          .filter((item) => item.mes?.toUpperCase() === mes)
          .reduce((acc, item) => acc + (item.importeIva || 0), 0);

        // console.log("Retenido", ivaRet);
        const ivaRetenido = ivaRet
          .filter(
            (item) => item.mes?.toUpperCase() === mes && item.año === this.selectedAnio
          )
          .reduce((acc, item) => acc + (item.importeIva || 0), 0);

        const ivaRetenidoAnterior = ivaRet[x]?.importeIva || 0;

        let ivaCargo = 0;
        let ivaFavor = 0;
        // const calculo = importeIvaTrasladado - importeIvaAcreditado + ivaRetenido - ivaRetenidoAnterior;
        const calculo = importeIvaTrasladado - importeIvaAcreditado - ivaRetenido;

        if (calculo > 0) {
          ivaCargo = calculo;
          ivaFavor = 0;
        } else {
          ivaCargo = 0;
          ivaFavor = Math.abs(calculo);
        }

        const cargoRegistrado = comp
          .filter((item) => item.mes?.toUpperCase() === mes)
          .reduce((acc, item) => acc + (item.ivaCargo || 0), 0);

        const favorRegistrado = comp
          .filter((item) => item.mes?.toUpperCase() === mes)
          .reduce((acc, item) => acc + (item.ivaFavor || 0), 0);

        let comparativa = (ivaCargo - ivaFavor - cargoRegistrado + favorRegistrado) * -1;
        if (comparativa !== 0) {
          comparativa *= -1;
        }

        const objIva = {
          año: this.selectedAnio,
          mes: mes,
          baseIvaTrasladado: baseIvaTrasladado,
          importeIvaTrasladado: importeIvaTrasladado,
          accionesT: [],
          baseIvaAcreditado: baseIvaAcreditado,
          importeIvaAcreditado: importeIvaAcreditado,
          accionesA: [],
          ivaRetenido: ivaRetenido,
          ivaRetenidoAnterior: ivaRetenidoAnterior,
          ivaCargo: ivaCargo,
          ivaFavor: ivaFavor,
          cargoRegistrado: cargoRegistrado,
          favorRegistrado: favorRegistrado,
          comparativa: comparativa,
        };

        // console.log(objIva)
        this.dataComprobantes.push(objIva);
      }

      this.dataComprobantes.pop();

let objetoTotales = {
  año: "TOTAL",
  mes: "TOTAL",
  baseIvaTrasladado: this.dataComprobantes.reduce(
    (acumulador, objeto) => acumulador + objeto.baseIvaTrasladado,
    0
  ),
  importeIvaTrasladado: this.dataComprobantes.reduce(
    (acumulador, objeto) => acumulador + objeto.importeIvaTrasladado,
    0
  ),
  detallesTrasladado: [],
  baseIvaAcreditado: this.dataComprobantes.reduce(
    (acumulador, objeto) => acumulador + objeto.baseIvaAcreditado,
    0
  ),
  importeIvaAcreditado: this.dataComprobantes.reduce(
    (acumulador, objeto) => acumulador + objeto.importeIvaAcreditado,
    0
  ),
  detallesAcreditado: [],
  ivaRetenidoAnterior: this.dataComprobantes.reduce(
    (acumulador, objeto) => acumulador + objeto.ivaRetenidoAnterior,
    0
  ),
  ivaRetenido: this.dataComprobantes.reduce(
    (acumulador, objeto) => acumulador + objeto.ivaRetenido,
    0
  ),
  ivaCargo: this.dataComprobantes.reduce(
    (acumulador, objeto) => acumulador + objeto.ivaCargo,
    0
  ),
  ivaFavor: this.dataComprobantes.reduce(
    (acumulador, objeto) => acumulador + objeto.ivaFavor,
    0
  ),
  cargoRegistrado: this.dataComprobantes.reduce(
    (acumulador, objeto) => acumulador + objeto.cargoRegistrado,
    0
  ),
  favorRegistrado: this.dataComprobantes.reduce(
    (acumulador, objeto) => acumulador + objeto.favorRegistrado,
    0
  ),
  comparativa: this.dataComprobantes.reduce(
    (acumulador, objeto) => acumulador + objeto.comparativa,
    0
  ),
};

this.dataComprobantes.push(objetoTotales);

      this.$q.loading.hide();
    },
    async GetIvaTrasladado() {
      try {
        let fechaI = this.selectedAnio + "-" + "01" + "-01";
        let fechaF = this.selectedAnio + "-" + this.selectedMesF.value + "-01";
        let response = await axios.get(
          this.rutaAxios +
            "Ingresos/GetReporteIvaAsync/erp_" +
            this.token.rfc +
            "/" +
            fechaI +
            "/" +
            fechaF,
          {
            timeout: 240000, // 120 segundos
          }
        );
        this.$q.loading.hide();
        return response.data;
      } catch (error) {
        console.log(error);
        this.$q.loading.hide();
      }
    },
    async GetIvaAcreditado() {
      try {
        let fechaI = this.selectedAnio + "-" + "01" + "-01";
        let fechaF = this.selectedAnio + "-" + this.selectedMesF.value + "-01";

        let response = await axios.get(
          this.rutaAxios +
            "Gastos/GetReporteIvaAsync/erp_" +
            this.token.rfc +
            "/" +
            fechaI +
            "/" +
            fechaF
        );
        return response.data;
      } catch (error) {
        this.$q.loading.hide();
        console.log(error);
      }
    },
    async GetIvaRetenido() {
      try {
        let añoSel = this.selectedAnio - 1;
        let fechaI = añoSel + "-" + "12" + "-01";
        let fechaF = this.selectedAnio + "-" + this.selectedMesF.value + "-01";

        let response = await axios.get(
          this.rutaAxios +
            "Gastos/GetReporteIvaRetenidoAsync/erp_" +
            this.token.rfc +
            "/" +
            fechaI +
            "/" +
            fechaF
        );
        return response.data;
      } catch (error) {
        this.$q.loading.hide();
        console.log(error);
      }
    },
    async GetReporteIvaRetenidoNeteadoAsync() {
                try {
                    let añoSel = this.selectedAnio - 1
                    let fechaI = añoSel + '-' + '12' + '-01';
                    let fechaF = this.selectedAnio + '-' + this.selectedMesF.value + '-01';

                    let response = await axios.get(this.rutaAxios + 'Gastos/GetReporteIvaRetenidoNeteadoAsync/erp_' + this.token.rfc + '/' + fechaI + '/' + fechaF);
                    console.log('nueva', response)
                    return response.data;
                } catch (error) {
                    console.log(error)
                }
            },

    async GetReporteIvaCompletoEmitidos(rfc, fechaI, fechaF) {
      try {
        const response = await axios.get(
          this.rutaAxios +
            `Ingresos/GetReporteIvaCompletoAsync/${rfc}/${fechaI}/${fechaF}`
        );
        return response.data;
      } catch (error) {
        this.$q.loading.hide();
        console.log(error);
        return null;
      }
    },
    async GetReporteIvaCompletoRecibidos(rfc, fechaI, fechaF) {
      try {
        const response = await axios.get(
          this.rutaAxios + `Gastos/GetReporteIvaCompletoAsync/${rfc}/${fechaI}/${fechaF}`
        );
        return response.data;
      } catch (error) {
        this.$q.loading.hide();
        console.log(error);
        return null;
      }
    },
    async GetIvaTrasladado() {
      try {
        let fechaI = this.selectedAnio + "-" + "01" + "-01";
        let fechaF = this.selectedAnio + "-" + this.selectedMesF.value + "-01";
        let response = await axios.get(
          this.rutaAxios +
            "Ingresos/GetReporteIvaAsync/erp_" +
            this.token.rfc +
            "/" +
            fechaI +
            "/" +
            fechaF,
          {
            timeout: 240000, // 120 segundos
          }
        );
        return response.data;
      } catch (error) {
        this.$q.loading.hide();
        console.log(error);
      }
    },
    async GetComparativaIva(año, tipo) {
      let respuesta = [
        { mes: "ENERO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "FEBRERO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "MARZO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "ABRIL", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "MAYO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "JUNIO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "JULIO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "AGOSTO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "SEPTIEMBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "OCTUBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "NOVIEMBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "DICIEMBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
      ];
      try {
        let response = await axios.get(
          this.rutaAxios +
            "Comparativa/GetComparativaAsync/erp_" +
            this.token.rfc +
            "/" +
            año +
            "/" +
            tipo
        );
        respuesta = response.data.comparativa;
        return respuesta;
      } catch (error) {
        console.log(error);
        this.$q.loading.hide();
        return respuesta;
      }
    },

    // RETENCIONES DE IVA
    async GetReporteRetencionesIVA() {
      this.$q.loading.show({
        spinner: QSpinnerCube,
        spinnerColor: "red-8",
        spinnerSize: 140,
        message: "Gerando reporte Retenciones de IVA...",
      });
      await this.GetReporteIVARetenido();
      console.log(this.dataIvaRetenido);
      await this.GetReporteIVARetenidoNeteado();
      console.log("dataIvaRetenidoNeteado", this.dataIvaRetenidoNeteado);
      this.$q.loading.hide();
    },

    async GetReporteIVARetenido() {
      try {
        //CONSULTANOS LAS COMPARATIVAS
        this.dataIvaRetenido = [];
        let ivaRetenido = [];
        let comparativaIva = await this.GetComparativa(this.selectedAnio, "IVARetenido");

        console.log(comparativaIva);

        let añoSel = this.selectedAnio - 1;
        let fechaI = añoSel + "-" + "12" + "-01";
        let fechaF = this.selectedAnio + "-" + this.selectedMesF.value + "-01";
        let response = await axios.get(
          this.rutaAxios +
            "Gastos/GetReporteIvaRetenidoAsync/erp_" +
            this.token.rfc +
            "/" +
            fechaI +
            "/" +
            fechaF
        );
        ivaRetenido = response.data;
        let mesFin = this.selectedMesF.value;

        //ASIGNAMOS LAS COMPARATIVAS
        for (let a = 1; a <= mesFin; a++) {
          let diferencia = ivaRetenido[a].importeIva - comparativaIva[a - 1].importe;
          let objIva = {
            mes: ivaRetenido[a].mes,
            importeIva: ivaRetenido[a].importeIva,
            comparativa: comparativaIva[a - 1].importe,
            diferencia: diferencia,
            detalles: ivaRetenido[a].detalles,
          };
          this.dataIvaRetenido.push(objIva);
          objIva = {};
        }
        let totales = {
          mes: "Total",
          importeIva: this.dataIvaRetenido.reduce(
            (acumulador, objeto) => acumulador + objeto.importeIva,
            0
          ),
          comparativa: this.dataIvaRetenido.reduce(
            (acumulador, objeto) => acumulador + objeto.comparativa,
            0
          ),
          diferencia: this.dataIvaRetenido.reduce(
            (acumulador, objeto) => acumulador + objeto.diferencia,
            0
          ),
          detalles: [],
        };

        this.dataIvaRetenido.push(totales);
      } catch (error) {
        this.$q.loading.hide();
        console.log(error);
      }
    },
    async GetComparativa(año, tipo) {
      let respuesta = [
        { mes: "ENERO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "FEBRERO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "MARZO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "ABRIL", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "MAYO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "JUNIO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "JULIO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "AGOSTO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "SEPTIEMBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "OCTUBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "NOVIEMBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "DICIEMBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
      ];
      try {
        let response = await axios.get(
          this.rutaAxios +
            "Comparativa/GetComparativaAsync/erp_" +
            this.token.rfc +
            "/" +
            año +
            "/" +
            tipo
        );
        respuesta = response.data.comparativa;
        return respuesta;
      } catch (error) {
        this.$q.loading.hide();
        console.log(error);
        return respuesta;
      }
    },

    // RETENCIONES DE ISR
    async GetReporteISRTodo() {
      await this.GetReporteNomina();
      await this.GetReporteIsr();
      await this.GetReporteIsrEmitidoAsync();
    },
    async GetReporteIsrEmitidoAsync() {
      try {
        let fechaI = this.selectedAnio + "-01-01";
        let fechaF = this.selectedAnio + "-" + this.selectedMesF.value + "-01";

        let response = await axios.get(
          this.rutaAxios +
            "Ingresos/ReporteIsrEmitidoAsync/erp_" +
            this.token.rfc +
            "/" +
            fechaI +
            "/" +
            fechaF
        );
        console.log("isr emitido", response);
        this.dataISRRetenidoFavor = response.data;

        let totales = {
          detalles: [],
          mes: "Total",
          importe: this.dataISRRetenidoFavor.reduce(
            (acumulador, objeto) => acumulador + objeto.importe,
            0
          ),
        };
        this.dataISRRetenidoFavor.push(totales);
      } catch (error) {
        console.log(error);
        this.$q.loading.hide();
      }
    },

    mesNumeroALetra(mes) {
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

      if (mes < 1 || mes > 12) return "";

      return meses[mes - 1];
    },

    async GetReporteNomina() {
      this.$q.loading.show({
        spinner: QSpinnerCube,
        spinnerColor: "red-8",
        spinnerSize: 140,
        message: "Gerando reporte de Retenciones ISR...",
      });
      try {
        //CONSULTANOS LAS COMPARATIVAS
        let comparativaSueldos = await this.GetComparativa(this.selectedAnio, "Sueldos");
        let comparativaAsimilados = await this.GetComparativa(
          this.selectedAnio,
          "Asimilados"
        );
        let comparativaOtros = await this.GetComparativa(
          this.selectedAnio,
          "SueldosOtros"
        );

        let fechaI = this.selectedAnio + "-01-01";
        let fechaF = this.selectedAnio + "-" + this.selectedMesF.value + "-01";
        let response = await axios.get(
          this.rutaAxios +
            "Nomina/GetReporteISrAsync/erp_" +
            this.token.rfc +
            "/" +
            fechaI +
            "/" +
            fechaF
        );
        let res = response.data;
        this.dataSueldos = res[0];
        this.dataAsimilados = res[1];
        this.dataOtros = res[2];

        let mesFin = this.selectedMesF.value;
        //ASIGNAMOS LAS COMPARATIVAS
        for (let a = 0; a < mesFin; a++) {
          this.dataSueldos[a].comparativa = comparativaSueldos[a].importe;
          let diferencia = this.dataSueldos[a].importe - comparativaSueldos[a].importe;
          this.dataSueldos[a].diferencia = diferencia;
        }
        for (let a = 0; a < mesFin; a++) {
          this.dataAsimilados[a].comparativa = comparativaAsimilados[a].importe;
          let diferencia =
            this.dataAsimilados[a].importe - comparativaAsimilados[a].importe;
          this.dataAsimilados[a].diferencia = diferencia;
        }
        for (let a = 0; a < mesFin; a++) {
          this.dataOtros[a].comparativa = comparativaOtros[a].importe;
          let diferencia = this.dataOtros[a].importe - comparativaOtros[a].importe;
          this.dataOtros[a].diferencia = diferencia;
        }

        let totalesSueldos = {
          detalles: [],
          mes: "Total",
          importe: this.dataSueldos.reduce(
            (acumulador, objeto) => acumulador + objeto.importe,
            0
          ),
          comparativa: this.dataSueldos.reduce(
            (acumulador, objeto) => acumulador + objeto.comparativa,
            0
          ),
          diferencia: this.dataSueldos.reduce(
            (acumulador, objeto) => acumulador + objeto.diferencia,
            0
          ),
        };

        let totalesAsimilados = {
          detalles: [],
          mes: "Total",
          importe: this.dataAsimilados.reduce(
            (acumulador, objeto) => acumulador + objeto.importe,
            0
          ),
          comparativa: this.dataAsimilados.reduce(
            (acumulador, objeto) => acumulador + objeto.comparativa,
            0
          ),
          diferencia: this.dataAsimilados.reduce(
            (acumulador, objeto) => acumulador + objeto.diferencia,
            0
          ),
        };
        let totalesOtros = {
          detalles: [],
          mes: "Total",
          importe: this.dataOtros.reduce(
            (acumulador, objeto) => acumulador + objeto.importe,
            0
          ),
          comparativa: this.dataOtros.reduce(
            (acumulador, objeto) => acumulador + objeto.comparativa,
            0
          ),
          diferencia: this.dataOtros.reduce(
            (acumulador, objeto) => acumulador + objeto.diferencia,
            0
          ),
        };
        this.dataSueldos.push(totalesSueldos);
        this.dataAsimilados.push(totalesAsimilados);
        this.dataOtros.push(totalesOtros);
        this.$q.loading.hide();
      } catch (error) {
        this.$q.loading.hide();
        console.log(error);
      }
      this.$q.loading.hide();
    },
    async GetReporteIsr() {
      this.$q.loading.show({
        spinner: QSpinnerCube,
        spinnerColor: "red-8",
        spinnerSize: 140,
        message: "Gerando reporte de Retenciones ISR...",
      });
      try {
        //CONSULTANOS LAS COMPARATIVAS
        let comparativaArrendamientos = await this.GetComparativa(
          this.selectedAnio,
          "Arrendamientos"
        );
        let comparativaHonorarios = await this.GetComparativa(
          this.selectedAnio,
          "Honorarios"
        );

        let fechaI = this.selectedAnio + "-01-01";
        let fechaF = this.selectedAnio + "-" + this.selectedMesF.value + "-01";
        let response = await axios.get(
          this.rutaAxios +
            "Gastos/GetReporteIsrAsync/erp_" +
            this.token.rfc +
            "/" +
            fechaI +
            "/" +
            fechaF
        );

        this.dataArrendamientos = response.data[0];
        this.dataHonorarios = response.data[1];

        let mesFin = this.selectedMesF.value;

        //ASIGNAMOS LAS COMPARATIVAS
        for (let a = 0; a < mesFin; a++) {
          this.dataArrendamientos[a].comparativa = comparativaArrendamientos[a].importe;
          let diferencia =
            this.dataArrendamientos[a].importe - comparativaArrendamientos[a].importe;
          this.dataArrendamientos[a].diferencia = diferencia;
        }
        for (let a = 0; a < mesFin; a++) {
          this.dataHonorarios[a].comparativa = comparativaHonorarios[a].importe;
          let diferencia =
            this.dataHonorarios[a].importe - comparativaHonorarios[a].importe;
          this.dataHonorarios[a].diferencia = diferencia;
        }

        let totalesArrendamientos = {
          detalles: [],
          mes: "Total",
          importe: this.dataArrendamientos.reduce(
            (acumulador, objeto) => acumulador + objeto.importe,
            0
          ),
          comparativa: this.dataArrendamientos.reduce(
            (acumulador, objeto) => acumulador + objeto.comparativa,
            0
          ),
          diferencia: this.dataArrendamientos.reduce(
            (acumulador, objeto) => acumulador + objeto.diferencia,
            0
          ),
        };
        let totalesHonorarios = {
          detalles: [],
          mes: "Total",
          importe: this.dataHonorarios.reduce(
            (acumulador, objeto) => acumulador + objeto.importe,
            0
          ),
          comparativa: this.dataHonorarios.reduce(
            (acumulador, objeto) => acumulador + objeto.comparativa,
            0
          ),
          diferencia: this.dataHonorarios.reduce(
            (acumulador, objeto) => acumulador + objeto.diferencia,
            0
          ),
        };
        this.dataArrendamientos.push(totalesArrendamientos);
        this.dataHonorarios.push(totalesHonorarios);
      } catch (error) {
        this.$q.loading.hide();
        console.log(error);
      }
    },
    async GetComparativa(año, tipo) {
      let respuesta = [
        { mes: "ENERO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "FEBRERO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "MARZO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "ABRIL", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "MAYO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "JUNIO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "JULIO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "AGOSTO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "SEPTIEMBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "OCTUBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "NOVIEMBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "DICIEMBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
      ];
      try {
        let response = await axios.get(
          this.rutaAxios +
            "Comparativa/GetComparativaAsync/erp_" +
            this.token.rfc +
            "/" +
            año +
            "/" +
            tipo
        );
        respuesta = response.data.comparativa;
        return respuesta;
      } catch (error) {
        this.$q.loading.hide();
        console.log(error);
        return respuesta;
      }
    },

    // PAGOS PROVISIONALES
    async GetReportePagosProvisionales() {
      if (!this.selectedAnio) {
        this.$q.notify({
          type: "warning",
          message: `Seleccione el año`,
          actions: [
            {
              label: "Cerrar",
              color: "white",
              handler: () => {
                /* ... */
              },
            },
          ],
        });
        return;
      }

      if (!this.selectedMesF) {
        this.$q.notify({
          type: "warning",
          message: `Seleccione el mes al que desea consultar`,
          actions: [
            {
              label: "Cerrar",
              color: "white",
              handler: () => {
                /* ... */
              },
            },
          ],
        });
        return;
      }

      //VALIDAMOS EL REGIMEN
      await this.GetRegimen();
      this.dialogRegimen = false;
      const listaRegimen = [...this.añosRegimen];
      const año = this.selectedAnio.toString();
      const regimen = listaRegimen.find((o) => o.año === año);

      if (!regimen.tipoRegimen) {
        this.$q.notify({
          type: "warning",
          message: `Indique el régimen fiscal del año ` + this.selectedAnio,
          actions: [
            {
              label: "Cerrar",
              color: "white",
              handler: () => {
                /* ... */
              },
            },
          ],
        });
        return;
      }

      this.$q.loading.show({
        spinner: QSpinnerCube,
        spinnerColor: "red-8",
        spinnerSize: 140,
        message: "Generando reporte, espere...",
      });
      this.regimenSeleccionado = regimen.tipoRegimen.tipoRegimen;
      this.civiles = "NO";
      this.columns = [];
      //VALIDAMOS QUE NO SEA UNA SC O AC
      if (regimen.civiles === "SI") {
        this.civiles = "SI";
        await this.GetPagoIsrAcYScA();
      } else {
        this.regimenSeleccionadoClave = regimen.tipoRegimen.clave;
        const claveRegimen = regimen.tipoRegimen.clave;
        const rfc = this.token.rfc;
        if (rfc.length == 12) {
          var tipoPersona = "MORAL";
        } else if (rfc.length == 13) {
          var tipoPersona = "FISICA";
        }

        switch (claveRegimen) {
          case "601":
            await this.GetGeneralMoral();
            this.$q.loading.hide();
            break;
          case "626":
            if (tipoPersona === "FISICA") {
              await this.GetResicoFisica();
            }
            if (tipoPersona === "MORAL") {
              await this.GetResicoMoral();
            }
            this.$q.loading.hide();
            break;
          case "612":
            await this.GetFisicaActividadEmpresarial();
            this.$q.loading.hide();
            break;
        }
      }

      console.log(this.dataComprobantesP);
    },
    //REGIMEN FISCAL
    async GetRegimen() {
      try {
        this.$q.loading.show({
          spinner: QSpinnerCube,
          spinnerColor: "red-8",
          spinnerSize: 140,
          message: "Consultando, espere...",
        });
        this.añosRegimen = [];
        let response = await axios.get(
          this.rutaAxios +
            "PagosProvisionales/GetRegimenEmpresaAsync/erp_" +
            this.token.rfc
        );
        let x = [...response.data];
        this.añosRegimen = [...x];
        this.dialogRegimen = true;
        this.$q.loading.hide();
      } catch (error) {
        this.$q.loading.hide();
        console.log(error);
        this.$q.loading.hide();
      }
    },
    //PAGOS PROVISIONALES V2.0
    async GetPagoIsrAcYScA() {
      try {
        this.dataComprobantesP = [];
        //ASIGANMOS LOS VALORES DE LA TABLA
        let columnas = [
          { name: "mes", align: "left", label: "Mes", field: "mes" },
          { name: "ventas", align: "right", label: "Ventas", field: "ventas" },
          {
            name: "productosFinancieros",
            align: "right",
            label: "Productos financieros",
            field: "productosFinancieros",
          },
          {
            name: "otrosProductos",
            align: "right",
            label: "Otros productos financieros",
            field: "otrosProductos",
          },
          {
            name: "anticipoDeClientes",
            align: "right",
            label: "Anticipo de clientes",
            field: "anticipoDeClientes",
          },
          {
            name: "totalPeriodo",
            align: "right",
            label: "Total del periodo",
            field: "totalPeriodo",
          },
          {
            name: "ingresoAcumulable",
            align: "right",
            label: "Ingreso Acumulable",
            field: "ingresoAcumulable",
          },
          {
            name: "coeficienteUtilidad",
            align: "right",
            label: "Coeficiente de utilidad",
            field: "coeficienteUtilidad",
          },
          {
            name: "utilidadFiscalEstimada",
            align: "right",
            label: "Utilidad fiscal estimada",
            field: "utilidadFiscalEstimada",
          },
          {
            name: "ptu",
            align: "right",
            label: "PTU a aplicar en el periodo",
            field: "ptu",
          },
          {
            name: "ptuAcumulada",
            align: "right",
            label: "PTU acumulada",
            field: "ptuAcumulada",
          },
          {
            name: "anticipoCuentaUtilidades",
            align: "right",
            label: "Anticipo a cuenta de utilidades",
            field: "anticipoCuentaUtilidades",
          },
          {
            name: "anticipoCuentaUtilidadesAcumulado",
            align: "right",
            label: "Anticipo a cuenta de utilidades acumulado",
            field: "anticipoCuentaUtilidadesAcumulado",
          },
          {
            name: "resultadoFiscalPrevio",
            align: "right",
            label: "Resultado fiscal previo",
            field: "resultadoFiscalPrevio",
          },
          {
            name: "perdidaDelEjercicioAnterior",
            align: "right",
            label: "Pérdida del ejercicio anterior",
            field: "perdidaDelEjercicioAnterior",
          },
          {
            name: "baseParaIsr",
            align: "right",
            label: "Base para ISR",
            field: "baseParaIsr",
          },
          {
            name: "tasaParaIsr",
            align: "right",
            label: "Tasa para ISR",
            field: "tasaParaIsr",
          },
          {
            name: "pagoProvisionalIsr",
            align: "right",
            label: "Pago provisional ISR",
            field: "pagoProvisionalIsr",
          },
          {
            name: "isrEnterado",
            align: "right",
            label: "ISR enterado",
            field: "isrEnterado",
          },
          {
            name: "isrAPagar",
            align: "right",
            label: "ISR a pagar",
            field: "isrAPagar",
          },
          {
            name: "impuestoregistrado",
            align: "right",
            label: "Impuesto Registrado",
            field: "impuestoregistrado",
          },
          {
            name: "comparativa",
            align: "right",
            label: "Comparativa",
            field: "comparativa",
          },
        ];
        this.columns = [...columnas];

        this.$q.loading.show({
          spinner: QSpinnerCube,
          spinnerColor: "red-8",
          spinnerSize: 140,
          message: "Generando reporte, espere...",
        });
        const año = this.selectedAnio;
        const mes = this.selectedMesF.value;
        let response = await axios.get(
          this.rutaAxios +
            "PagosProvisionales/GetPagoIsrAcYScAsync/erp_" +
            this.token.rfc +
            "/" +
            año +
            "/" +
            mes
        );
        // console.log(response.data);
        this.dataComprobantesP = [...response.data];
        this.$q.loading.hide();
      } catch (error) {
        this.$q.loading.hide();
        console.log(error);
        this.$q.loading.hide();
      }
    },
    async GetGeneralMoral() {
      try {
        let columnas = [
          { name: "mes", align: "left", label: "Mes", field: "mes" },
          {
            name: "ingresosPorMes",
            align: "right",
            label: "Ingresos por Mes",
            field: "ingresosPorMes",
          },

          {
            name: "ingresosAcumulados",
            align: "right",
            label: "Ingresos Acumulados",
            field: "ingresosAcumulados",
          },
          {
            name: "utilidadFiscal",
            align: "right",
            label: "Utilidad Fiscal",
            field: "utilidadFiscal",
          },
          {
            name: "basePagoProvisional",
            align: "right",
            label: "Base Pago Provisional",
            field: "basePagoProvisional",
          },
          {
            name: "pagoProvisional",
            align: "right",
            label: "Pago Provisional",
            field: "pagoProvisional",
          },
          {
            name: "impuestoCargo",
            align: "right",
            label: "Impuesto a Cargo",
            field: "impuestoCargo",
          },
          {
            name: "impuestoregistrado",
            align: "right",
            label: "Impuesto Registrado",
            field: "impuestoregistrado",
          },
          {
            name: "comparativa",
            align: "right",
            label: "Comparativa",
            field: "comparativa",
          },
        ];
        this.columns = [...columnas];

        this.dataComprobantesP = [];
        var ingresos = await this.GetIngresosFacturados();
        let coeficiente = await this.GetCoeficiente();
        let perdida = await this.GetPerdida();
        let registrados = await this.GetRegistrados();
        // console.log(ingresos);

        let ObjPp = {};
        let acumulado = 0;
        let pagoAnterior = 0;
        let impuestoCargo = 0;

        for (let i = 0; i < this.selectedMesF.value; i++) {
          acumulado += ingresos[i].importe;
          ObjPp.mes = ingresos[i].mes;
          ObjPp.ingresosPorMes = ingresos[i].importe;
          ObjPp.detalles = ingresos[i].detalles;
          ObjPp.ingresosAcumulados = acumulado;
          ObjPp.utilidadFiscal = acumulado * coeficiente[i].importe;
          let base = acumulado * coeficiente[i].importe - perdida[i].importe;
          if (base < 0) {
            base = 0;
          }
          ObjPp.basePagoProvisional = base;
          ObjPp.pagoProvisional = (base * 30) / 100;

          impuestoCargo = ObjPp.pagoProvisional - pagoAnterior;
          ObjPp.impuestoCargo = impuestoCargo;
          if (impuestoCargo < 0) {
            ObjPp.impuestoCargo = 0;
          }
          pagoAnterior += ObjPp.impuestoCargo;

          ObjPp.impuestoregistrado = registrados[i].importe;

          let comparativa = ObjPp.impuestoCargo - ObjPp.impuestoregistrado;
          ObjPp.comparativa = comparativa;
          this.dataComprobantesP.push(ObjPp);
          ObjPp = {};
        }

        let objetoTotales = {
          mes: "Total",
          ingresosPorMes: this.dataComprobantesP.reduce(
            (acumulador, objeto) => acumulador + objeto.ingresosPorMes,
            0
          ),
          detalles: [],
          ingresosAcumulados: this.dataComprobantesP.reduce(
            (acumulador, objeto) => acumulador + objeto.ingresosAcumulados,
            0
          ),
          utilidadFiscal: this.dataComprobantesP.reduce(
            (acumulador, objeto) => acumulador + objeto.utilidadFiscal,
            0
          ),
          basePagoProvisional: this.dataComprobantesP.reduce(
            (acumulador, objeto) => acumulador + objeto.basePagoProvisional,
            0
          ),
          pagoProvisional: this.dataComprobantesP.reduce(
            (acumulador, objeto) => acumulador + objeto.pagoProvisional,
            0
          ),
          impuestoCargo: this.dataComprobantesP.reduce(
            (acumulador, objeto) => acumulador + objeto.impuestoCargo,
            0
          ),
          impuestoregistrado: this.dataComprobantesP.reduce(
            (acumulador, objeto) => acumulador + objeto.impuestoregistrado,
            0
          ),
          comparativa: this.dataComprobantesP.reduce(
            (acumulador, objeto) => acumulador + objeto.comparativa,
            0
          ),
        };
        this.dataComprobantesP.push(objetoTotales);
      } catch (error) {
        this.$q.loading.hide();
        console.log(error);
      }
    },
    async GetFisicaActividadEmpresarial() {
      try {
        let columnas = [
          { name: "mes", align: "left", label: "Mes", field: "mes" },

          {
            name: "ingresosPorMes",
            align: "right",
            label: "Ingresos por Mes",
            field: "ingresosPorMes",
          },

          {
            name: "ingresosAcumulados",
            align: "right",
            label: "Ingresos Acumulados",
            field: "ingresosAcumulados",
          },

          {
            name: "gastosPorMes",
            align: "right",
            label: "Gastos por Mes",
            field: "gastosPorMes",
          },
          {
            name: "accionesG",
            align: "left",
            label: "Acciones",
            field: "accionesG",
          },
          {
            name: "gastosAcumulados",
            align: "right",
            label: "Gastos Acumulados",
            field: "gastosAcumulados",
          },

          {
            name: "baseCalculo",
            align: "right",
            label: "Base del Cálculo",
            field: "baseCalculo",
          },
          {
            name: "limiteInferior",
            align: "right",
            label: "Límite Inferior",
            field: "limiteInferior",
          },
          {
            name: "baseImpuesto",
            align: "right",
            label: "Base Impuesto",
            field: "baseImpuesto",
          },
          {
            name: "porcentaje",
            align: "right",
            label: "Porcentaje",
            field: "porcentaje",
          },
          {
            name: "impuestoMarginal",
            align: "right",
            label: "Impuesto Marginal",
            field: "impuestoMarginal",
          },
          {
            name: "cuotaFija",
            align: "right",
            label: "Cuota Fija",
            field: "cuotaFija",
          },
          {
            name: "importeIsr",
            align: "right",
            label: "Importe ISR",
            field: "importeIsr",
          },
          {
            name: "pagosAnteriores",
            align: "right",
            label: "Pagos Anteriores",
            field: "pagosAnteriores",
          },
          {
            name: "isrCargo",
            align: "right",
            label: "ISR a Cargo",
            field: "isrCargo",
          },
          {
            name: "isrEmitido",
            align: "right",
            label: "ISR Retenido",
            field: "isrEmitido",
          },

          {
            name: "isrPagar",
            align: "right",
            label: "ISR a Pagar",
            field: "isrPagar",
          },

          {
            name: "impuestoregistrado",
            align: "right",
            label: "Impuesto Registrado",
            field: "impuestoregistrado",
          },
          {
            name: "comparativa",
            align: "right",
            label: "Comparativa",
            field: "comparativa",
          },
        ];
        this.columns = [...columnas];

        let tablas = await this.GetTablas(
          "personas_fisicas_actividad_empresarial",
          "mensual"
        );
        // console.log(tablas[0].enero)
        let ingresos = await this.GetIngresosCobrados();
        let gastos = await this.GetGastosPagados();
        let registrados = await this.GetRegistrados();
        let isrEmitido = await this.GetReporteIsrEmitidoAsync();

        let ListComprobantes = [];
        let contador = 0;

        let ingresosAcumulados = 0;
        let gastosAcumulados = 0;
        let pagosAnteriores = 0;
        let isrCargo = 0;

        for (let x of ingresos) {
          ingresosAcumulados += x.importe;
          gastosAcumulados += gastos[contador].importe;
          // let baseCalculo = x.importe - gastos[contador].importe;
          let baseCalculo = ingresosAcumulados - gastosAcumulados;
          let limiteInferior = 0;
          let baseImpuesto = 0;
          let cuotaFija = 0;
          let porcentaje = 0;
          let impuestoMarginal = 0;
          let importeIsr = 0;

          if (baseCalculo < 0) {
            baseCalculo = 0;
          }

          //SI LA BASE ES MAYOS A 0, BUSCAMOS EN TABLA
          if (baseCalculo != 0) {
            let valor = x.mes.toLowerCase();
            let tablaMes = tablas[0][valor];

            let valorEncontrado = null;
            for (const rango of tablaMes) {
              const limiteInferior = parseFloat(rango.limite_inferior);
              const limiteSuperior = parseFloat(rango.limite_superior);

              if (baseCalculo >= limiteInferior && baseCalculo <= limiteSuperior) {
                valorEncontrado = rango;
                break; // Salimos del bucle una vez que encontramos el valor
              }
            }
            limiteInferior = valorEncontrado.limite_inferior;
            cuotaFija = valorEncontrado.cuota_fija;
            porcentaje = valorEncontrado.porcentaje;

            //CALCULOS
            baseImpuesto = baseCalculo - limiteInferior;
            impuestoMarginal = Math.round(baseImpuesto * (porcentaje / 100) * 100) / 100;
            importeIsr = impuestoMarginal + cuotaFija;
            // console.log(cuotaFija, porcentaje);
          }

          isrCargo = importeIsr - pagosAnteriores;
          let representaIsrCargo = isrCargo;
          if (isrCargo <= 0) {
            representaIsrCargo = 0;
          }

          let ObjIngresos = {
            mes: x.mes,

            ingresosPorMes: x.importe,
            detalles: x.detalles,
            ingresosAcumulados: ingresosAcumulados,

            gastosPorMes: gastos[contador].importe,
            detallesG: gastos[contador].detalles,
            gastosAcumulados: gastosAcumulados,

            //CALCULAMOS IS HAY BASE
            baseCalculo: baseCalculo,
            limiteInferior: limiteInferior,
            baseImpuesto: baseImpuesto,
            porcentaje: porcentaje,
            impuestoMarginal: impuestoMarginal,
            cuotaFija: cuotaFija,
            importeIsr: importeIsr,

            pagosAnteriores: pagosAnteriores,
            isrCargo: representaIsrCargo,

            impuestoregistrado: registrados[contador].importe,
            comparativa: representaIsrCargo - registrados[contador].importe,
          };
          ListComprobantes.push(ObjIngresos);
          pagosAnteriores += isrCargo;
          contador++;
        }

        this.dataComprobantesP = [...ListComprobantes];

        this.dataComprobantesP.forEach((item) => {
          item.isrEmitido = 0;
          item.isrPagar = 0;
        });

        if (!Array.isArray(isrEmitido) || isrEmitido.length === 0) return;

        const isrMap = Object.fromEntries(
          isrEmitido.map((i) => [this.mesNumeroALetra(i.mes), i])
        );

        this.dataComprobantesP.forEach((item) => {
          const isr = isrMap[item.mes];

          if (isr) {
            item.isrEmitido = isr.importe ?? 0;
            item.isrDetalles = isr.detalles ?? [];
            item.isrPagar = item.importeIsr - item.isrEmitido;
            item.comparativa = item.isrPagar - item.impuestoregistrado;
          }
        });

        let objetoTotales = {
          mes: "Total",
          ingresosPorMes: this.dataComprobantesP.reduce(
            (acumulador, objeto) => acumulador + objeto.ingresosPorMes,
            0
          ),
          detalles: [],
          ingresosAcumulados: "---",
          gastosPorMes: this.dataComprobantesP.reduce(
            (acumulador, objeto) => acumulador + objeto.gastosPorMes,
            0
          ),
          detallesG: [],
          gastosAcumulados: "---",
          baseCalculo: "---",
          limiteInferior: "---",
          baseImpuesto: "---",
          porcentaje: "---",
          impuestoMarginal: "---",
          cuotaFija: "---",
          importeIsr: "---",
          pagosAnteriores: "---",
          isrEmitido: this.dataComprobantesP.reduce(
            (acumulador, objeto) => acumulador + objeto.isrEmitido,
            0
          ),
          isrPagar: this.dataComprobantesP.reduce(
            (acumulador, objeto) => acumulador + objeto.isrPagar,
            0
          ),
          isrCargo: this.dataComprobantesP.reduce(
            (acumulador, objeto) => acumulador + objeto.isrCargo,
            0
          ),
          impuestoregistrado: this.dataComprobantesP.reduce(
            (acumulador, objeto) => acumulador + objeto.impuestoregistrado,
            0
          ),
          comparativa: this.dataComprobantesP.reduce(
            (acumulador, objeto) => acumulador + objeto.comparativa,
            0
          ),
        };
        this.dataComprobantesP.push(objetoTotales);
        // console.log(objetoTotales)
      } catch (error) {
        this.$q.loading.hide();
      }
    },
    async GetReporteIsrEmitidoAsync() {
      try {
        let fechaI = this.selectedAnio + "-01-01";
        let fechaF = this.selectedAnio + "-" + this.selectedMesF.value + "-01";

        let response = await axios.get(
          this.rutaAxios +
            "Ingresos/ReporteIsrEmitidoAsync/erp_" +
            this.token.rfc +
            "/" +
            fechaI +
            "/" +
            fechaF
        );
        console.log("isr emitido", response);
        return response.data;
      } catch (error) {
        console.log(error);
        this.$q.loading.hide();
      }
    },

    async GetResicoFisica() {
      try {
        let columnas = [
          { name: "mes", align: "left", label: "Mes", field: "mes" },
          {
            name: "ingresosPorMes",
            align: "right",
            label: "Ingresos por Mes",
            field: "ingresosPorMes",
          },

          {
            name: "tasaAplicable",
            align: "right",
            label: "Tasa Aplicable",
            field: "tasaAplicable",
          },
          {
            name: "importeIsr",
            align: "right",
            label: "Importe ISR",
            field: "importeIsr",
          },
          {
            name: "isrEmitido",
            align: "right",
            label: "ISR Retenido",
            field: "isrEmitido",
          },

          {
            name: "isrPagar",
            align: "right",
            label: "ISR a Pagar",
            field: "isrPagar",
          },
          {
            name: "impuestoregistrado",
            align: "right",
            label: "Impuesto Registrado",
            field: "impuestoregistrado",
          },
          {
            name: "comparativa",
            align: "right",
            label: "Comparativa",
            field: "comparativa",
          },
        ];
        this.columns = [...columnas];
        this.tipoPersona = "FISICA";

        let tablas = await this.GetTablas("resico_fisica", "mensual");
        let ingresos_ = await this.GetIngresosCobrados();
        let registrados = await this.GetRegistrados();

        let isrEmitido = await this.GetReporteIsrEmitidoAsync();

        let ListComprobantes = [];
        let contador = 0;
        for (let x of ingresos_) {
          // BUSCAMOS SU LIMITE EN LA TABLA
          let tasaAplicable = {};
          let ingresos = Number(x.importe);
          let menorDiferencia = Infinity;

          // console.log(ingresos)
          for (const elemento of tablas[0].tablas) {
            if (elemento.hasta >= ingresos) {
              const diferencia = Math.abs(elemento.hasta - ingresos);
              if (diferencia < menorDiferencia) {
                menorDiferencia = diferencia;
                tasaAplicable = elemento;
                // console.log(elemento.hasta, ingresos, tasaAplicable)
              }
            } else {
              tasaAplicable.tasa = 2.5;
            }
          }

          let importeIsr = 0;
          if (ingresos != 0) {
            importeIsr = ingresos * (tasaAplicable.tasa / 100);
          }

          let ObjIngresos = {
            mes: x.mes,
            ingresosPorMes: x.importe,
            detalles: x.detalles,
            tasaAplicable: tasaAplicable.tasa,
            importeIsr: importeIsr,
            impuestoregistrado: registrados[contador].importe,
            comparativa: importeIsr - registrados[contador].importe,
          };
          ListComprobantes.push(ObjIngresos);
          contador++;
        }
        this.dataComprobantesP = [...ListComprobantes];

        this.dataComprobantesP.forEach((item) => {
          item.isrEmitido = 0;
          item.isrPagar = 0;
        });

        if (!Array.isArray(isrEmitido) || isrEmitido.length === 0) return;

        const isrMap = Object.fromEntries(
          isrEmitido.map((i) => [this.mesNumeroALetra(i.mes), i])
        );

        this.dataComprobantesP.forEach((item) => {
          const isr = isrMap[item.mes];

          if (isr) {
            item.isrEmitido = isr.importe ?? 0;
            item.isrDetalles = isr.detalles ?? [];
            item.isrPagar = item.importeIsr - item.isrEmitido;
            item.comparativa = item.isrPagar - item.impuestoregistrado;
          }
        });

        let objetoTotales = {
          mes: "Total",
          ingresosPorMes: this.dataComprobantesP.reduce(
            (acumulador, objeto) => acumulador + objeto.ingresosPorMes,
            0
          ),
          detalles: [],
          tasaAplicable: "---",
          isrEmitido: this.dataComprobantesP.reduce(
            (acumulador, objeto) => acumulador + objeto.isrEmitido,
            0
          ),
          importeIsr: this.dataComprobantesP.reduce(
            (acumulador, objeto) => acumulador + objeto.importeIsr,
            0
          ),
          isrPagar: this.dataComprobantesP.reduce(
            (acumulador, objeto) => acumulador + objeto.isrPagar,
            0
          ),
          impuestoregistrado: this.dataComprobantesP.reduce(
            (acumulador, objeto) => acumulador + objeto.impuestoregistrado,
            0
          ),
          comparativa: this.dataComprobantesP.reduce(
            (acumulador, objeto) => acumulador + objeto.comparativa,
            0
          ),
        };
        this.dataComprobantesP.push(objetoTotales);
      } catch (error) {
        console.log(error);
        this.$q.loading.hide();
      }
    },
    async GetResicoMoral() {
      let columnas = [
        { name: "mes", align: "left", label: "Mes", field: "mes" },
        {
          name: "ingresosPorMes",
          align: "right",
          label: "Ingresos por Mes",
          field: "ingresosPorMes",
        },

        {
          name: "ingresosAcumulados",
          align: "right",
          label: "Ingresos Acumulados",
          field: "ingresosAcumulados",
        },

        {
          name: "deduccionesPorMes",
          align: "right",
          label: "Deducciones por Mes",
          field: "deduccionesPorMes",
        },
        {
          name: "accionesD",
          align: "left",
          label: "Acciones",
          field: "accionesD",
        },
        {
          name: "deduccionesAcumuladas",
          align: "right",
          label: "Deducciones Acumuladas",
          field: "deduccionesAcumuladas",
        },
        {
          name: "utilidadFiscalPrevia",
          align: "right",
          label: "Utilidad Fiscal del Mes Previa",
          field: "utilidadFiscalPrevia",
        },
        {
          name: "utilidadFiscalPreviaAcumulada",
          align: "right",
          label: "Utilidad Fiscal del Mes Previa Acumulada",
          field: "utilidadFiscalPreviaAcumulada",
        },
        {
          name: "ptuPagada",
          align: "right",
          label: "PTU Pagada",
          field: "ptuPagada",
        },
        {
          name: "utilidadFiscalAcumuladaPreviaAntesDePerdidasFiscales",
          align: "right",
          label: "Utilidad Fiscal Acumulada Previa Antes de Perdidas Fiscales",
          field: "utilidadFiscalAcumuladaPreviaAntesDePerdidasFiscales",
        },
        {
          name: "perdidasFiscalesPorAplicar",
          align: "right",
          label: "Pérdidas Fiscales Por Aplicar",
          field: "perdidasFiscalesPorAplicar",
        },
        {
          name: "baseIsr",
          align: "right",
          label: "Base de ISR",
          field: "baseIsr",
        },
        {
          name: "tasaIsr",
          align: "right",
          label: "Tasa de ISR",
          field: "tasaIsr",
        },
        {
          name: "isrDelPeriodo",
          align: "right",
          label: "ISR del Periodo",
          field: "isrDelPeriodo",
        },
        {
          name: "isrPagosProvisionales",
          align: "right",
          label: "ISR Pagos Provisionales",
          field: "isrPagosProvisionales",
        },
        {
          name: "isrAPagar",
          align: "right",
          label: "ISR A Pagar",
          field: "isrAPagar",
        },

        {
          name: "impuestoregistrado",
          align: "right",
          label: "Impuesto Registrado",
          field: "impuestoregistrado",
        },
        {
          name: "comparativa",
          align: "right",
          label: "Comparativa",
          field: "comparativa",
        },
      ];
      this.columns = [...columnas];
      this.tipoPersona = "MORAL";

      let ingresos = await this.GetIngresosCobradosResicoM();
      let gastos = await this.GetGastosPagadosResicoM();
      let ptu = await this.GetPagoPtu();
      let registrados = await this.GetRegistrados();
      let perdida = await this.GetPerdida();

      let ListComprobantes = [];
      let contador = 0;
      let ingresosAcumulados = 0;
      let deduccionesAcumuladas = 0;
      let utilidadFiscalPreviaAcumulada = 0;
      let isrPagosProvisionales = 0;

      for (let x of ingresos) {
        ingresosAcumulados += x.importe;
        deduccionesAcumuladas += gastos[contador].importe;
        let utilidadFiscalPrevia = x.importe - gastos[contador].importe;
        if (utilidadFiscalPrevia < 0) {
          utilidadFiscalPrevia = 0;
        }
        utilidadFiscalPreviaAcumulada += utilidadFiscalPrevia;
        let ptuPagada = ptu[contador].importe;
        let utilidadFiscalAcumuladaPreviaAntesDePerdidasFiscales =
          utilidadFiscalPreviaAcumulada - ptuPagada;
        let perdidasFiscalesPorAplicar = perdida[contador].importe;
        let baseIsr =
          utilidadFiscalAcumuladaPreviaAntesDePerdidasFiscales -
          perdidasFiscalesPorAplicar;
        if (baseIsr < 0) {
          baseIsr = 0;
        }
        let tasaIsr = "30.00%";
        let isrDelPeriodo = baseIsr * 0.3;
        let isrAPagar = isrDelPeriodo - isrPagosProvisionales;

        let ObjIngresos = {
          mes: x.mes,
          ingresosPorMes: x.importe,
          detalles: x.detalles,
          ingresosAcumulados: ingresosAcumulados,

          deduccionesPorMes: gastos[contador].importe,
          detallesD: gastos[contador].detalles,
          deduccionesAcumuladas: deduccionesAcumuladas,

          utilidadFiscalPrevia: utilidadFiscalPrevia,
          utilidadFiscalPreviaAcumulada: utilidadFiscalPreviaAcumulada,
          ptuPagada: ptuPagada,
          utilidadFiscalAcumuladaPreviaAntesDePerdidasFiscales: utilidadFiscalAcumuladaPreviaAntesDePerdidasFiscales,
          perdidasFiscalesPorAplicar: perdidasFiscalesPorAplicar,
          baseIsr: baseIsr,
          tasaIsr: tasaIsr,
          isrDelPeriodo: isrDelPeriodo,
          isrPagosProvisionales: isrPagosProvisionales,
          isrAPagar: isrAPagar,

          impuestoregistrado: registrados[contador].importe,
          comparativa: isrAPagar - registrados[contador].importe,
        };
        ListComprobantes.push(ObjIngresos);
        isrPagosProvisionales = isrDelPeriodo;
        contador++;
      }

      this.dataComprobantesP = [...ListComprobantes];

      // console.log(ingresos);
      // console.log(gastos);
    },
    async GetIngresosFacturados() {
      try {
        this.dialogtext = "Consultando ingresos...";

        let fechaI = this.selectedAnio + "-01-01";
        let fechaF = this.selectedAnio + "-" + this.selectedMesF.value + "-01";

        let response = await axios.get(
          this.rutaAxios +
            "Ingresos/GetReporteIngresosPPISRAsync/erp_" +
            this.token.rfc +
            "/" +
            fechaI +
            "/" +
            fechaF
        );
        return response.data;
      } catch (error) {
        this.$q.loading.hide();
        console.log(error);
      }
    },
    async GetIngresosCobrados() {
      let fechaI = this.selectedAnio + "-01-01";
      let fechaF = this.selectedAnio + "-" + this.selectedMesF.value + "-01";

      try {
        let response = await axios.get(
          this.rutaAxios +
            "Ingresos/GetCobradoAsync/erp_" +
            this.token.rfc +
            "/" +
            fechaI +
            "/" +
            fechaF
        );
        return response.data;
      } catch (error) {
        this.$q.loading.hide();
        console.log(error);
      }
    },
    async GetIngresosCobradosResicoM() {
      let fechaI = this.selectedAnio + "-01-01";
      let fechaF = this.selectedAnio + "-" + this.selectedMesF.value + "-01";

      try {
        let response = await axios.get(
          this.rutaAxios +
            "Ingresos/GetCobradoResicoMoralAsync/erp_" +
            this.token.rfc +
            "/" +
            fechaI +
            "/" +
            fechaF
        );
        return response.data;
      } catch (error) {
        this.$q.loading.hide();
        console.log(error);
      }
    },
    async GetGastosPagadosResicoM() {
      let fechaI = this.selectedAnio + "-01-01";
      let fechaF = this.selectedAnio + "-" + this.selectedMesF.value + "-01";

      try {
        let response = await axios.get(
          this.rutaAxios +
            "Gastos/GetPagadoResicoMoralAsync/erp_" +
            this.token.rfc +
            "/" +
            fechaI +
            "/" +
            fechaF
        );
        return response.data;
      } catch (error) {
        this.$q.loading.hide();
        console.log(error);
      }
    },
    async GetGastosPagados() {
      let fechaI = this.selectedAnio + "-01-01";
      let fechaF = this.selectedAnio + "-" + this.selectedMesF.value + "-01";

      try {
        let response = await axios.get(
          this.rutaAxios +
            "Gastos/GetPagadoAsync/erp_" +
            this.token.rfc +
            "/" +
            fechaI +
            "/" +
            fechaF
        );
        return response.data;
      } catch (error) {
        this.$q.loading.hide();
        console.log(error);
      }
    },
    async GetPagoPtu() {
      let fechaI = this.selectedAnio + "-01-01";
      let fechaF = this.selectedAnio + "-" + this.selectedMesF.value + "-01";

      try {
        let response = await axios.get(
          this.rutaAxios +
            "Nomina/GetReportePagoPtuAsync/erp_" +
            this.token.rfc +
            "/" +
            fechaI +
            "/" +
            fechaF
        );
        return response.data;
      } catch (error) {
        this.$q.loading.hide();
        console.log(error);
      }
    },
    async GetTablas(tipo, periodicidad) {
      try {
        let response = await axios.get(
          this.rutaAxios +
            "Empresa/GetTablas/" +
            this.selectedAnio +
            "/" +
            tipo +
            "/" +
            periodicidad
        );
        return response.data;
      } catch (error) {
        this.$q.loading.hide();
        console.log(error);
      }
    },
    async GetCoeficiente() {
      let respuesta = [
        { mes: "ENERO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "FEBRERO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "MARZO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "ABRIL", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "MAYO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "JUNIO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "JULIO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "AGOSTO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "SEPTIEMBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "OCTUBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "NOVIEMBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "DICIEMBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
      ];
      try {
        let response = await axios.get(
          this.rutaAxios +
            "Comparativa/GetComparativaAsync/erp_" +
            this.token.rfc +
            "/" +
            this.selectedAnio +
            "/Coeficiente"
        );
        let x = response.data.comparativa;
        respuesta = x;
      } catch (error) {
        this.$q.loading.hide();
        console.log(error);
      }
      // console.log(respuesta)
      return respuesta;
    },
    async GetPerdida() {
      let respuesta = [
        { mes: "ENERO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "FEBRERO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "MARZO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "ABRIL", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "MAYO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "JUNIO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "JULIO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "AGOSTO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "SEPTIEMBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "OCTUBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "NOVIEMBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "DICIEMBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
      ];
      try {
        let response = await axios.get(
          this.rutaAxios +
            "Comparativa/GetComparativaAsync/erp_" +
            this.token.rfc +
            "/" +
            this.selectedAnio +
            "/Perdida"
        );
        let x = response.data.comparativa;
        respuesta = x;
      } catch (error) {
        this.$q.loading.hide();
        console.log(error);
      }
      // console.log(respuesta)
      return respuesta;
    },
    async GetRegistrados() {
      let respuesta = [
        { mes: "ENERO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "FEBRERO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "MARZO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "ABRIL", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "MAYO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "JUNIO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "JULIO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "AGOSTO", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "SEPTIEMBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "OCTUBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "NOVIEMBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
        { mes: "DICIEMBRE", importe: 0, ivaCargo: 0, ivaFavor: 0 },
      ];
      try {
        let response = await axios.get(
          this.rutaAxios +
            "Comparativa/GetComparativaAsync/erp_" +
            this.token.rfc +
            "/" +
            this.selectedAnio +
            "/RegistradosPPIsr"
        );
        let x = response.data.comparativa;
        respuesta = x;
      } catch (error) {
        this.$q.loading.hide();
        console.log(error);
      }
      // console.log(respuesta)
      return respuesta;
    },

    // GET REPORTE DE USO DE CFDI
    async GetReporteUsoCFDIM() {
      this.itemsReporte = [];
      this.$q.loading.show({
        spinner: QSpinnerCube,
        spinnerColor: "red-8",
        spinnerSize: 140,
        message: "Consultando Emitidos...",
      });
      const ingresos = await this.GetIngresos();
      this.$q.loading.show({
        spinner: QSpinnerCube,
        spinnerColor: "red-8",
        spinnerSize: 140,
        message: "Consultando Recibidos...",
      });
      const gastos = await this.GetGastos();
      this.$q.loading.show({
        spinner: QSpinnerCube,
        spinnerColor: "red-8",
        spinnerSize: 140,
        message: "Consultando Nómina...",
      });
      const nomina = await this.GetNomina();

      const unicos = await this.ObtieneUsoCfdi(ingresos, gastos, nomina);

      //CREAMOS EL CONTENIDO DE LA TABLA
      unicos.forEach((e) => {
        let objIngreso = ingresos.find((f) => f.usoCfdi === e);
        let objGasto = gastos.find((f) => f.usoCfdi === e);
        let objNomina = nomina.find((f) => f.usoCfdi === e);

        let ingresoTotal = 0;
        let detallesE = [];
        if (objIngreso) {
          // ingresoTotal = objIngreso.total;
          ingresoTotal = objIngreso.subTotal;
          // ingresoTotal = objIngreso.subTotal - objIngreso.descuento;
          detallesE = objIngreso.detalles;
        }

        let gastoTotal = 0;
        let detallesR = [];
        if (objGasto) {
          // gastoTotal = objGasto.total;
          gastoTotal = objGasto.subTotal;
          // gastoTotal = objGasto.subTotal - objGasto.descuento;
          detallesR = objGasto.detalles;
        }

        let nominaTotal = 0;
        let detallesN = [];
        if (objNomina) {
          // nominaTotal = objNomina.total;
          nominaTotal = objNomina.subTotal - objNomina.descuento;
          detallesN = objNomina.detalles;
        }

        let objNuevo = {
          uso: e,
          emitidos: ingresoTotal,
          detallesE: detallesE,
          recibidos: gastoTotal,
          detallesR: detallesR,
          nomina: nominaTotal,
          detallesN: detallesN,
        };
        this.itemsReporte.push(objNuevo);
      });

      //AGREGAMOS LOS TOTALES
      let sumaEmitidos = this.itemsReporte.reduce(
        (acumulador, objeto) => acumulador + objeto.emitidos,
        0
      );
      let sumaRecibidos = this.itemsReporte.reduce(
        (acumulador, objeto) => acumulador + objeto.recibidos,
        0
      );
      let sumaNomina = this.itemsReporte.reduce(
        (acumulador, objeto) => acumulador + objeto.nomina,
        0
      );

      let objTotales = {
        uso: "Suma",
        emitidos: sumaEmitidos,
        recibidos: sumaRecibidos,
        nomina: sumaNomina,
      };
      this.itemsReporte.push(objTotales);
      console.log(this.itemsReporte);
      this.$q.loading.hide();
    },

    async GetIngresos() {
      try {
        // let fI = moment(this.fechaI).format('YYYY-MM-DD')
        // let fF = moment(this.fechaF).format('YYYY-MM-DD')

        // const fI = new Date(this.selectedAnio, 0, 1);
        // const fF = new Date(this.selectedAnio, this.selectedMesF.value, 0);

        const fI = `${this.selectedAnio}-01-01`;
        const ultimoDia = new Date(
          this.selectedAnio,
          this.selectedMesF.value,
          0
        ).getDate();
        const fF = `${this.selectedAnio}-${String(this.selectedMesF.value).padStart(
          2,
          "0"
        )}-${String(ultimoDia).padStart(2, "0")}`;

        let response = await axios.get(
          this.rutaAxios +
            "Consultas/GetReporteUsoCfdiIngresosAsync/erp_" +
            this.token.rfc +
            "/" +
            fI +
            "/" +
            fF
        );
        return response.data;
      } catch (error) {
        this.$q.loading.hide();
        console.log(error);
      }
    },

    async GetGastos() {
      try {
        const fI = `${this.selectedAnio}-01-01`;
        const ultimoDia = new Date(
          this.selectedAnio,
          this.selectedMesF.value,
          0
        ).getDate();
        const fF = `${this.selectedAnio}-${String(this.selectedMesF.value).padStart(
          2,
          "0"
        )}-${String(ultimoDia).padStart(2, "0")}`;

        let response = await axios.get(
          this.rutaAxios +
            "Consultas/GetReporteUsoCfdiGastosAsync/erp_" +
            this.token.rfc +
            "/" +
            fI +
            "/" +
            fF
        );
        return response.data;
      } catch (error) {
        this.$q.loading.hide();
        console.log(error);
      }
    },

    async GetNomina() {
      try {
        const fI = `${this.selectedAnio}-01-01`;
        const ultimoDia = new Date(
          this.selectedAnio,
          this.selectedMesF.value,
          0
        ).getDate();
        const fF = `${this.selectedAnio}-${String(this.selectedMesF.value).padStart(
          2,
          "0"
        )}-${String(ultimoDia).padStart(2, "0")}`;

        let response = await axios.get(
          this.rutaAxios +
            "Consultas/GetReporteUsoCfdiNomina/erp_" +
            this.token.rfc +
            "/" +
            fI +
            "/" +
            fF
        );
        return response.data;
      } catch (error) {
        this.$q.loading.hide();
        console.log(error);
      }
    },

    async ObtieneUsoCfdi(...listas) {
      console.log(listas);
      const usoUnicos = new Set();
      listas.forEach((lista) => {
        lista.forEach((objeto) => {
          usoUnicos.add(objeto.usoCfdi);
        });
      });
      return Array.from(usoUnicos);
    },

    generarRangosPorMes(anio, mesInicial, mesFinal) {
      const rangos = [];

      for (let mes = mesInicial; mes <= mesFinal; mes++) {
        const inicio = moment(`${anio}-${mes}-01`).startOf("month").format("YYYY-MM-DD");
        const fin = moment(`${anio}-${mes}-01`).endOf("month").format("YYYY-MM-DD");

        rangos.push({ inicio, fin });
      }

      return rangos;
    },

    async GetReporteTodos() {
      const anio = this.selectedAnio;
      const mesInicial = 1;
      const mesFinal = this.selectedMesF.value;

      const rangos = this.generarRangosPorMes(anio, mesInicial, mesFinal);

      this.dataVentas = [];

      for (const r of rangos) {
        this.$q.loading.show({
          spinner: QSpinnerCube,
          spinnerColor: "red-8",
          spinnerSize: 140,
          message: "Gerando reporte de Ventas de " + r.inicio + " al " + r.fin + "...",
        });

        const response = await axios.get(
          `${this.rutaAxios}Gasolineros/GetVentasGasolinasAsync/erp_${this.token.rfc}/${r.inicio}/${r.fin}`
        );
        this.$q.loading.hide();
        let x = [];
        x = response.data;
        //VAMOS A CALCULAR LOS TOTALES
        let objetoTotales = {
          detalles: [],
          producto: "Total",
          cantidad: x.reduce((acumulador, objeto) => acumulador + objeto.cantidad, 0),
          subTotal: x.reduce((acumulador, objeto) => acumulador + objeto.subTotal, 0),
          descuento: x.reduce((acumulador, objeto) => acumulador + objeto.descuento, 0),
          iva: x.reduce((acumulador, objeto) => acumulador + objeto.iva, 0),
          ieps: x.reduce((acumulador, objeto) => acumulador + objeto.ieps, 0),
          total: x.reduce((acumulador, objeto) => acumulador + objeto.total, 0),
          ventas: x.reduce((acumulador, objeto) => acumulador + objeto.ventas, 0),
          comprobantes: x.reduce(
            (acumulador, objeto) => acumulador + objeto.comprobantes,
            0
          ),
        };
        x.push(objetoTotales);

        this.dataVentas.push(x);
      }
      this.$q.loading.hide();

      console.log("Datos totales:", this.dataVentas);
    },

    async GetReporteComprasTodos() {
      const anio = this.selectedAnio;
      const mesInicial = 1;
      const mesFinal = this.selectedMesF.value;

      const rangos = this.generarRangosPorMes(anio, mesInicial, mesFinal);

      this.dataCompras = [];

      for (const r of rangos) {
        this.$q.loading.show({
          spinner: QSpinnerCube,
          spinnerColor: "red-8",
          spinnerSize: 140,
          message: "Gerando reporte de Compras de " + r.inicio + " al " + r.fin + "...",
        });

        const response = await axios.get(
          `${this.rutaAxios}Gasolineros/GetComprasGasolineriasAsync/erp_${this.token.rfc}/${r.inicio}/${r.fin}`
        );
        this.$q.loading.hide();
        let x = [];
        x = response.data;
        //VAMOS A CALCULAR LOS TOTALES
        let objetoTotales = {
          detalles: [],
          producto: "Total",
          cantidad: x.reduce((acumulador, objeto) => acumulador + objeto.cantidad, 0),
          subTotal: x.reduce((acumulador, objeto) => acumulador + objeto.subTotal, 0),
          descuento: x.reduce((acumulador, objeto) => acumulador + objeto.descuento, 0),
          iva: x.reduce((acumulador, objeto) => acumulador + objeto.iva, 0),
          ieps: x.reduce((acumulador, objeto) => acumulador + objeto.ieps, 0),
          total: x.reduce((acumulador, objeto) => acumulador + objeto.total, 0),
          ventas: x.reduce((acumulador, objeto) => acumulador + objeto.ventas, 0),
          comprobantes: x.reduce(
            (acumulador, objeto) => acumulador + objeto.comprobantes,
            0
          ),
        };
        x.push(objetoTotales);

        this.dataCompras.push(x);
      }
      this.$q.loading.hide();

      console.log("Datos totales:", this.dataCompras);
    },

    // GET REPORTE DE INVENTARIOS
    async GetReporteInventario() {
      this.$q.loading.show({
        spinner: QSpinnerCube,
        spinnerColor: "red-8",
        spinnerSize: 140,
        message: "Consultando datos, espere...",
      });

      try {
        //INICIALIZAMOS
        this.dataMagna = [];
        this.dataPremium = [];
        this.dataDiesel = [];

        //CONSULTAMOS LOS REGISTROS INICIALES
        let inicialMagna = await this.GetInicialL("MAGNA");
        let inicialPremium = await this.GetInicialL("PREMIUM");
        let inicialDiesel = await this.GetInicialL("DIESEL");

        //CONSULTAMOS LAS MERMAS REGISTRADAS
        let mermaMagna = await this.GetMermaL("MAGNA");
        let mermaPremium = await this.GetMermaL("PREMIUM");
        let mermaDiesel = await this.GetMermaL("DIESEL");

        //CONSULTAMOS LOS LITROS CALCULADOS
        let comparativaMagna = await this.GetComparativaG("MAGNA");
        let comparativaPremium = await this.GetComparativaG("PREMIUM");
        let comparativaDiesel = await this.GetComparativaG("DIESEL");

        //CONSULTAMOS LAS VENTAS Y LAS COMPRAS
        let ventas = await this.GetVentasL();
        let compras = await this.GetComprasL();

        //RECORREMOS PARA HACER LA LISTA
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

        let magnaInicial = inicialMagna.detalle[0].litros;
        let premiumInicial = inicialPremium.detalle[0].litros;
        let dieselInicial = inicialDiesel.detalle[0].litros;
        console.log(magnaInicial);
        for (let a = this.selectedMesI.value; a <= this.selectedMesF.value; a++) {
          //MAGNA
          let BuscaMagnaV = ventas.find((f) => f.mes == a && f.producto === "MAGNA");
          let BuscaMagnaC = compras.find((f) => f.mes == a && f.producto === "MAGNA");
          let buscaMagnaM = mermaMagna.detalle[a - 1].litros;
          let buscaMagnaR = comparativaMagna.detalle[a - 1].litros;
          let ObjMagna = {
            nombreMes: meses[a - 1],
            inventarioInicial: magnaInicial,
            litrosComprados: 0,
            litrosDisponibles: 0,
            litrosVendidos: 0,
            mermas: buscaMagnaM,
            inventarioTeorico: 0,
            registrado: buscaMagnaR,
            diferencia: 0,
          };
          if (BuscaMagnaV) {
            ObjMagna.litrosVendidos = BuscaMagnaV.cantidad;
          }
          if (BuscaMagnaC) {
            ObjMagna.litrosComprados = BuscaMagnaC.cantidad;
          }
          ObjMagna.litrosDisponibles =
            ObjMagna.inventarioInicial + ObjMagna.litrosComprados;
          ObjMagna.inventarioTeorico =
            ObjMagna.inventarioInicial +
            ObjMagna.litrosComprados -
            ObjMagna.litrosVendidos -
            ObjMagna.mermas;
          ObjMagna.diferencia = ObjMagna.inventarioTeorico - ObjMagna.registrado;
          this.dataMagna.push(ObjMagna);
          magnaInicial =
            magnaInicial +
            ObjMagna.litrosComprados -
            ObjMagna.litrosVendidos -
            ObjMagna.mermas;

          //PREMIUM
          let BuscaPremiumV = ventas.find((f) => f.mes == a && f.producto === "PREMIUM");
          let BuscaPremiumC = compras.find((f) => f.mes == a && f.producto === "PREMIUM");
          let buscaPremiumM = mermaPremium.detalle[a - 1].litros;
          let buscaPremiumR = comparativaPremium.detalle[a - 1].litros;

          let ObjPremium = {
            nombreMes: meses[a - 1],
            inventarioInicial: premiumInicial,
            litrosComprados: 0,
            litrosDisponibles: 0,
            litrosVendidos: 0,
            mermas: buscaPremiumM,
            inventarioTeorico: 0,
            registrado: buscaPremiumR,
            diferencia: 0,
          };
          if (BuscaPremiumV) {
            ObjPremium.litrosVendidos = BuscaPremiumV.cantidad;
          }
          if (BuscaPremiumC) {
            ObjPremium.litrosComprados = BuscaPremiumC.cantidad;
          }
          ObjPremium.litrosDisponibles =
            ObjPremium.inventarioInicial + ObjPremium.litrosComprados;
          ObjPremium.inventarioTeorico =
            ObjPremium.inventarioInicial +
            ObjPremium.litrosComprados -
            ObjPremium.litrosVendidos -
            ObjPremium.mermas;
          ObjPremium.diferencia = ObjPremium.inventarioTeorico - ObjPremium.registrado;
          this.dataPremium.push(ObjPremium);
          premiumInicial =
            premiumInicial +
            ObjPremium.litrosComprados -
            ObjPremium.litrosVendidos -
            ObjPremium.mermas;

          //DIESEL
          let BuscaDieselV = ventas.find((f) => f.mes == a && f.producto === "DIESEL");
          let BuscaDieselC = compras.find((f) => f.mes == a && f.producto === "DIESEL");
          let buscaDieselM = mermaDiesel.detalle[a - 1].litros;
          let buscaDieselR = comparativaDiesel.detalle[a - 1].litros;

          let ObjDiesel = {
            nombreMes: meses[a - 1],
            inventarioInicial: dieselInicial,
            litrosComprados: 0,
            litrosDisponibles: 0,
            litrosVendidos: 0,
            mermas: buscaDieselM,
            inventarioTeorico: 0,
            registrado: buscaDieselR,
            diferencia: 0,
          };
          if (BuscaDieselV) {
            ObjDiesel.litrosVendidos = BuscaDieselV.cantidad;
          }
          if (BuscaDieselC) {
            ObjDiesel.litrosComprados = BuscaDieselC.cantidad;
          }
          ObjDiesel.litrosDisponibles =
            ObjDiesel.inventarioInicial + ObjDiesel.litrosComprados;
          ObjDiesel.inventarioTeorico =
            ObjDiesel.inventarioInicial +
            ObjDiesel.litrosComprados -
            ObjDiesel.litrosVendidos -
            ObjDiesel.mermas;
          ObjDiesel.diferencia = ObjDiesel.inventarioTeorico - ObjDiesel.registrado;
          this.dataDiesel.push(ObjDiesel);
          dieselInicial =
            dieselInicial +
            ObjDiesel.litrosComprados -
            ObjDiesel.litrosVendidos -
            ObjDiesel.mermas;
        }

        //SUMATORIAS
        let SumMagna = {
          nombreMes: "Total_Magna",
          inventarioInicial: "---",
          litrosComprados: this.dataMagna.reduce(
            (acumulador, objeto) => acumulador + objeto.litrosComprados,
            0
          ),
          litrosDisponibles: "---",
          litrosVendidos: this.dataMagna.reduce(
            (acumulador, objeto) => acumulador + objeto.litrosVendidos,
            0
          ),
          mermas: this.dataMagna.reduce(
            (acumulador, objeto) => acumulador + objeto.mermas,
            0
          ),
          inventarioTeorico: "---",
          registrado: "---",
          diferencia: "---",
        };
        this.dataMagna.push(SumMagna);

        let SumPremium = {
          nombreMes: "Total_Premium",
          inventarioInicial: "---",
          litrosComprados: this.dataPremium.reduce(
            (acumulador, objeto) => acumulador + objeto.litrosComprados,
            0
          ),
          litrosDisponibles: "---",
          litrosVendidos: this.dataPremium.reduce(
            (acumulador, objeto) => acumulador + objeto.litrosVendidos,
            0
          ),
          mermas: this.dataPremium.reduce(
            (acumulador, objeto) => acumulador + objeto.mermas,
            0
          ),
          inventarioTeorico: "---",
          registrado: "---",
          diferencia: "---",
        };
        this.dataPremium.push(SumPremium);

        let SumDiesel = {
          nombreMes: "Total_Diesel",
          inventarioInicial: "---",
          litrosComprados: this.dataDiesel.reduce(
            (acumulador, objeto) => acumulador + objeto.litrosComprados,
            0
          ),
          litrosDisponibles: "---",
          litrosVendidos: this.dataDiesel.reduce(
            (acumulador, objeto) => acumulador + objeto.litrosVendidos,
            0
          ),
          mermas: this.dataDiesel.reduce(
            (acumulador, objeto) => acumulador + objeto.mermas,
            0
          ),
          inventarioTeorico: "---",
          registrado: "---",
          diferencia: "---",
        };
        this.dataDiesel.push(SumDiesel);

        this.$q.loading.hide();
      } catch (error) {
        console.log(error);
        this.$q.loading.hide();
      }

      console.log(this.dataMagna);
      console.log(this.dataPremium);
      console.log(this.dataDiesel);
    },

    async GetVentasL() {
      let fI = this.selectedAnio + "-" + this.selectedMesI.value + "-01";
      let fF = this.selectedAnio + "-" + this.selectedMesF.value + "-01";
      try {
        let response = await axios.get(
          this.rutaAxios +
            "Gasolineros/GetVentasLitrosMesAsync/erp_" +
            this.token.rfc +
            "/" +
            fI +
            "/" +
            fF
        );
        let x = response.data;
        return x;
      } catch (errro) {
        return [];
      }
    },

    async GetComprasL() {
      let fI = this.selectedAnio + "-" + this.selectedMesI.value + "-01";
      let fF = this.selectedAnio + "-" + this.selectedMesF.value + "-01";
      try {
        let response = await axios.get(
          this.rutaAxios +
            "Gasolineros/GetComprasLitrosMesAsync/erp_" +
            this.token.rfc +
            "/" +
            fI +
            "/" +
            fF
        );
        let x = response.data;
        return x;
      } catch (errro) {
        return [];
      }
    },

    async GetInicialL(item) {
      let ObjInicial = {
        año: this.selectedAnio,
        tipo: "Inicial",
        combustible: item,
        detalle: [{ mes: this.selectedMesI.label, litros: 0 }],
      };
      try {
        let response = await axios.get(
          this.rutaAxios +
            "Gasolineros/GetLitrosGasolinerosAsync/erp_" +
            this.token.rfc +
            "/" +
            this.selectedAnio +
            "/Inicial/" +
            item
        );
        let x = response.data;
        return x;
      } catch (error) {
        return ObjInicial;
      }
    },

    async GetMermaL(item) {
      let ObjInicial = {
        año: this.selectedAnio,
        tipo: "Merma",
        combustible: item,
        detalle: [
          { mes: "ENERO", litros: 0 },
          { mes: "FEBRERO", litros: 0 },
          { mes: "MARZO", litros: 0 },
          { mes: "ABRIL", litros: 0 },
          { mes: "MAYO", litros: 0 },
          { mes: "JUNIO", litros: 0 },
          { mes: "JULIO", litros: 0 },
          { mes: "AGOSTO", litros: 0 },
          { mes: "SEPTIEMBRE", litros: 0 },
          { mes: "OCTUBRE", litros: 0 },
          { mes: "NOVIEMBRE", litros: 0 },
          { mes: "DICIEMBRE", litros: 0 },
        ],
      };
      try {
        let response = await axios.get(
          this.rutaAxios +
            "Gasolineros/GetLitrosGasolinerosAsync/erp_" +
            this.token.rfc +
            "/" +
            this.selectedAnio +
            "/Merma/" +
            item
        );
        let x = response.data;
        return x;
      } catch (error) {
        return ObjInicial;
      }
    },

    // REPORTE DE UTILIDAD
    async GetReporteUtilidad() {
      this.dataMagnaU = [];
      this.dataPremiumU = [];
      this.dataDieselU = [];

      this.$q.loading.show({
        spinner: QSpinnerCube,
        spinnerColor: "red-8",
        spinnerSize: 140,
        message: "Consultando datos, espere...",
      });

      try {
        // //CONSULTAMOS LAS VENTAS Y LAS COMPRAS
        const ventas = await this.GetVentas();
        const compras = await this.GetCompras();

        // //RECORREMOS PARA HACER LA LISTA
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

        let indiceM = 0;
        let indiceP = 0;
        let indiceD = 0;
        for (let a = this.selectedMesI.value; a <= this.selectedMesF.value; a++) {
          //MAGNA
          let BuscaMagnaV = ventas.find((f) => f.mes == a && f.producto === "MAGNA");
          let BuscaMagnaC = compras.find((f) => f.mes == a && f.producto === "MAGNA");
          let ObjMagna = {
            nombreMes: meses[a - 1],

            litrosVentas: 0,
            importeVentas: 0,
            descuentoVentas: 0,
            subTotalVentas: 0,
            promedioVentas: 0,

            litrosCompras: 0,
            importeCompras: 0,
            descuentoCompras: 0,
            subTotalCompras: 0,
            promedioCompras: 0,

            porcentajeUtilidad: 0,
            utilidadPeriodo: 0,
          };
          if (BuscaMagnaV) {
            ObjMagna.litrosVentas = BuscaMagnaV.litros;
            ObjMagna.importeVentas = BuscaMagnaV.importe;
            ObjMagna.descuentoVentas = BuscaMagnaV.descuento;
            ObjMagna.subTotalVentas = BuscaMagnaV.subTotal;
            ObjMagna.promedioVentas = BuscaMagnaV.subTotalPromedio;
          }
          if (BuscaMagnaC) {
            ObjMagna.litrosCompras = BuscaMagnaC.litros;
            ObjMagna.importeCompras = BuscaMagnaC.importe;
            ObjMagna.descuentoCompras = BuscaMagnaC.descuento;
            ObjMagna.subTotalCompras = BuscaMagnaC.subTotal;
            ObjMagna.promedioCompras = BuscaMagnaC.subTotalPromedio;
          }
          //VALIDAMOS EL COSTO DE COMPRA
          if (ObjMagna.promedioCompras != 0) {
            indiceM = ObjMagna.promedioCompras;
          }
          ObjMagna.promedioCompras = indiceM;

          ObjMagna.diferencia = ObjMagna.subTotalVentas - ObjMagna.subTotalCompras;
          if (ObjMagna.promedioVentas != 0) {
            ObjMagna.porcentajeUtilidad =
              (ObjMagna.promedioCompras / ObjMagna.promedioVentas - 1) * 100 * -1;
          }

          //UTILIDAD DEL PERIODO
          let utilidadM = (ObjMagna.subTotalVentas * ObjMagna.porcentajeUtilidad) / 100;
          ObjMagna.utilidadPeriodo = utilidadM;
          this.dataMagnaU.push(ObjMagna);

          //PREMIUM
          let BuscaPremiumV = ventas.find((f) => f.mes == a && f.producto === "PREMIUM");
          let BuscaPremiumC = compras.find((f) => f.mes == a && f.producto === "PREMIUM");
          let ObjPremium = {
            nombreMes: meses[a - 1],

            litrosVentas: 0,
            importeVentas: 0,
            descuentoVentas: 0,
            subTotalVentas: 0,
            promedioVentas: 0,

            litrosCompras: 0,
            importeCompras: 0,
            descuentoCompras: 0,
            subTotalCompras: 0,
            promedioCompras: 0,

            porcentajeUtilidad: 0,
            utilidadPeriodo: 0,
          };
          if (BuscaPremiumV) {
            ObjPremium.litrosVentas = BuscaPremiumV.litros;
            ObjPremium.importeVentas = BuscaPremiumV.importe;
            ObjPremium.descuentoVentas = BuscaPremiumV.descuento;
            ObjPremium.subTotalVentas = BuscaPremiumV.subTotal;
            ObjPremium.promedioVentas = BuscaPremiumV.subTotalPromedio;
          }
          if (BuscaPremiumC) {
            ObjPremium.litrosCompras = BuscaPremiumC.litros;
            ObjPremium.importeCompras = BuscaPremiumC.importe;
            ObjPremium.descuentoCompras = BuscaPremiumC.descuento;
            ObjPremium.subTotalCompras = BuscaPremiumC.subTotal;
            ObjPremium.promedioCompras = BuscaPremiumC.subTotalPromedio;
          }

          //VALIDAMOS EL COSTO DE COMPRA
          if (ObjPremium.promedioCompras != 0) {
            indiceP = ObjPremium.promedioCompras;
          }
          ObjPremium.promedioCompras = indiceP;

          ObjPremium.diferencia = ObjPremium.subTotalVentas - ObjPremium.subTotalCompras;
          if (ObjPremium.promedioVentas != 0) {
            ObjPremium.porcentajeUtilidad =
              (ObjPremium.promedioCompras / ObjPremium.promedioVentas - 1) * 100 * -1;
          }

          //UTILIDAD DEL PERIODO
          let utilidadP =
            (ObjPremium.subTotalVentas * ObjPremium.porcentajeUtilidad) / 100;
          ObjPremium.utilidadPeriodo = utilidadP;

          this.dataPremiumU.push(ObjPremium);

          //DIESEL
          let BuscaDieselV = ventas.find((f) => f.mes == a && f.producto === "DIESEL");
          let BuscaDieselC = compras.find((f) => f.mes == a && f.producto === "DIESEL");
          let ObjDiesel = {
            nombreMes: meses[a - 1],

            litrosVentas: 0,
            importeVentas: 0,
            descuentoVentas: 0,
            subTotalVentas: 0,
            promedioVentas: 0,

            litrosCompras: 0,
            importeCompras: 0,
            descuentoCompras: 0,
            subTotalCompras: 0,
            promedioCompras: 0,

            porcentajeUtilidad: 0,
            utilidadPeriodo: 0,
          };
          if (BuscaDieselV) {
            ObjDiesel.litrosVentas = BuscaDieselV.litros;
            ObjDiesel.importeVentas = BuscaDieselV.importe;
            ObjDiesel.descuentoVentas = BuscaDieselV.descuento;
            ObjDiesel.subTotalVentas = BuscaDieselV.subTotal;
            ObjDiesel.promedioVentas = BuscaDieselV.subTotalPromedio;
          }
          if (BuscaDieselC) {
            ObjDiesel.litrosCompras = BuscaDieselC.litros;
            ObjDiesel.importeCompras = BuscaDieselC.importe;
            ObjDiesel.descuentoCompras = BuscaDieselC.descuento;
            ObjDiesel.subTotalCompras = BuscaDieselC.subTotal;
            ObjDiesel.promedioCompras = BuscaDieselC.subTotalPromedio;
          }

          //VALIDAMOS EL COSTO DE COMPRA
          if (ObjDiesel.promedioCompras != 0) {
            indiceD = ObjDiesel.promedioCompras;
          }
          ObjDiesel.promedioCompras = indiceD;

          ObjDiesel.diferencia = ObjDiesel.subTotalVentas - ObjDiesel.subTotalCompras;
          if (ObjDiesel.promedioVentas != 0) {
            ObjDiesel.porcentajeUtilidad =
              (ObjDiesel.promedioCompras / ObjDiesel.promedioVentas - 1) * 100 * -1;
          }

          //UTILIDAD DEL PERIODO
          let utilidadD = (ObjDiesel.subTotalVentas * ObjDiesel.porcentajeUtilidad) / 100;
          ObjDiesel.utilidadPeriodo = utilidadD;

          this.dataDieselU.push(ObjDiesel);
        }

        //SUMATORIAS
        let SumMagna = {
          nombreMes: "Total_Magna",
          litrosVentas: this.dataMagnaU.reduce(
            (acumulador, objeto) => acumulador + objeto.litrosVentas,
            0
          ),
          importeVentas: this.dataMagnaU.reduce(
            (acumulador, objeto) => acumulador + objeto.importeVentas,
            0
          ),
          descuentoVentas: this.dataMagnaU.reduce(
            (acumulador, objeto) => acumulador + objeto.descuentoVentas,
            0
          ),
          subTotalVentas: this.dataMagnaU.reduce(
            (acumulador, objeto) => acumulador + objeto.subTotalVentas,
            0
          ),
          promedioVentas: "---",
          litrosCompras: this.dataMagnaU.reduce(
            (acumulador, objeto) => acumulador + objeto.litrosCompras,
            0
          ),
          importeCompras: this.dataMagnaU.reduce(
            (acumulador, objeto) => acumulador + objeto.importeCompras,
            0
          ),
          descuentoCompras: this.dataMagnaU.reduce(
            (acumulador, objeto) => acumulador + objeto.descuentoCompras,
            0
          ),
          subTotalCompras: this.dataMagnaU.reduce(
            (acumulador, objeto) => acumulador + objeto.subTotalCompras,
            0
          ),
          promedioCompras: "---",
          porcentajeUtilidad: "---",
          utilidadPeriodo: this.dataMagnaU.reduce(
            (acumulador, objeto) => acumulador + objeto.utilidadPeriodo,
            0
          ),
        };
        this.dataMagnaU.push(SumMagna);

        let SumPremium = {
          nombreMes: "Total_Premium",
          litrosVentas: this.dataPremiumU.reduce(
            (acumulador, objeto) => acumulador + objeto.litrosVentas,
            0
          ),
          importeVentas: this.dataPremiumU.reduce(
            (acumulador, objeto) => acumulador + objeto.importeVentas,
            0
          ),
          descuentoVentas: this.dataPremiumU.reduce(
            (acumulador, objeto) => acumulador + objeto.descuentoVentas,
            0
          ),
          subTotalVentas: this.dataPremiumU.reduce(
            (acumulador, objeto) => acumulador + objeto.subTotalVentas,
            0
          ),
          promedioVentas: "---",
          litrosCompras: this.dataPremiumU.reduce(
            (acumulador, objeto) => acumulador + objeto.litrosCompras,
            0
          ),
          importeCompras: this.dataPremiumU.reduce(
            (acumulador, objeto) => acumulador + objeto.importeCompras,
            0
          ),
          descuentoCompras: this.dataPremiumU.reduce(
            (acumulador, objeto) => acumulador + objeto.descuentoCompras,
            0
          ),
          subTotalCompras: this.dataPremiumU.reduce(
            (acumulador, objeto) => acumulador + objeto.subTotalCompras,
            0
          ),
          promedioCompras: "---",
          porcentajeUtilidad: "---",
          utilidadPeriodo: this.dataPremiumU.reduce(
            (acumulador, objeto) => acumulador + objeto.utilidadPeriodo,
            0
          ),
        };
        this.dataPremiumU.push(SumPremium);

        let SumDiesel = {
          nombreMes: "Total_Diesel",
          litrosVentas: this.dataDieselU.reduce(
            (acumulador, objeto) => acumulador + objeto.litrosVentas,
            0
          ),
          importeVentas: this.dataDieselU.reduce(
            (acumulador, objeto) => acumulador + objeto.importeVentas,
            0
          ),
          descuentoVentas: this.dataDieselU.reduce(
            (acumulador, objeto) => acumulador + objeto.descuentoVentas,
            0
          ),
          subTotalVentas: this.dataDieselU.reduce(
            (acumulador, objeto) => acumulador + objeto.subTotalVentas,
            0
          ),
          promedioVentas: 0,
          litrosCompras: this.dataDieselU.reduce(
            (acumulador, objeto) => acumulador + objeto.litrosCompras,
            0
          ),
          importeCompras: this.dataDieselU.reduce(
            (acumulador, objeto) => acumulador + objeto.importeCompras,
            0
          ),
          descuentoCompras: this.dataDieselU.reduce(
            (acumulador, objeto) => acumulador + objeto.descuentoCompras,
            0
          ),
          subTotalCompras: this.dataDieselU.reduce(
            (acumulador, objeto) => acumulador + objeto.subTotalCompras,
            0
          ),
          promedioCompras: "---",
          porcentajeUtilidad: "---",
          utilidadPeriodo: this.dataDieselU.reduce(
            (acumulador, objeto) => acumulador + objeto.utilidadPeriodo,
            0
          ),
        };
        this.dataDieselU.push(SumDiesel);

        this.$q.loading.hide();
      } catch (error) {
        console.log(error);
        this.$q.loading.hide();
      }
      console.log(this.dataMagnaU);
      console.log(this.dataPremiumU);
      console.log(this.dataDieselU);
    },

    async GetVentas() {
      let fI = this.selectedAnio + "-" + this.selectedMesI.value + "-01";
      let fF = this.selectedAnio + "-" + this.selectedMesF.value + "-01";
      try {
        let response = await axios.get(
          this.rutaAxios +
            "Gasolineros/GetVentasSubTotalMesAsync/erp_" +
            this.token.rfc +
            "/" +
            fI +
            "/" +
            fF
        );
        let x = response.data;
        console.log(x);
        return x;
      } catch (errro) {
        return [];
      }
    },

    async GetCompras() {
      let fI = this.selectedAnio + "-" + this.selectedMesI.value + "-01";
      let fF = this.selectedAnio + "-" + this.selectedMesF.value + "-01";
      try {
        let response = await axios.get(
          this.rutaAxios +
            "Gasolineros/GetComprasSubTotalMesAsync/erp_" +
            this.token.rfc +
            "/" +
            fI +
            "/" +
            fF
        );
        let x = response.data;
        return x;
      } catch (errro) {
        return [];
      }
    },

    async GetComparativaG(item) {
      let ObjInicial = {
        año: this.selectedAnio,
        tipo: "Comparativa",
        combustible: item,
        detalle: [
          { mes: "ENERO", litros: 0 },
          { mes: "FEBRERO", litros: 0 },
          { mes: "MARZO", litros: 0 },
          { mes: "ABRIL", litros: 0 },
          { mes: "MAYO", litros: 0 },
          { mes: "JUNIO", litros: 0 },
          { mes: "JULIO", litros: 0 },
          { mes: "AGOSTO", litros: 0 },
          { mes: "SEPTIEMBRE", litros: 0 },
          { mes: "OCTUBRE", litros: 0 },
          { mes: "NOVIEMBRE", litros: 0 },
          { mes: "DICIEMBRE", litros: 0 },
        ],
      };
      try {
        let response = await axios.get(
          this.rutaAxios +
            "Gasolineros/GetLitrosGasolinerosAsync/erp_" +
            this.token.rfc +
            "/" +
            this.selectedAnio +
            "/Comparativa/" +
            item
        );
        let x = response.data;
        return x;
      } catch (error) {
        return ObjInicial;
      }
    },
    // ▶ Ejecutar una sola función
    async runTask(index) {
      if (!this.selectedAnio) {
        this.$q.notify({
          type: "warning",
          message: `Seleccione el año`,
          position: "top-right",
          actions: [
            {
              label: "Cerrar",
              color: "white",
              handler: () => {
                /* ... */
              },
            },
          ],
        });
        return;
      }

      if (!this.selectedMesF) {
        this.$q.notify({
          type: "warning",
          message: `Seleccione el mes al que desea consultar`,
          position: "top-right",
          actions: [
            {
              label: "Cerrar",
              color: "white",
              handler: () => {
                /* ... */
              },
            },
          ],
        });
        return;
      }

      console.log(index);
      const task = this.tasks[index];

      try {
        task.status = "loading";
        task.progress = 0;

        // Simulamos progreso visual
        this.animateProgress(task);

        await task.run(); // llamada a la función real

        task.status = "success";
        task.progress = 1;
      } catch (err) {
        this.$q.loading.hide();
        console.log(err);
        task.status = "error";
        task.progress = 0;
      }
    },

    // REPORTE RIESGO FISCAL
    async GetRiesgoFiscalConcentrados() {
      const rfc = this.token.rfc;
      const año = this.selectedAnio;
      const mesI = this.selectedMesI.value;
      const mesF = this.selectedMesF.value;

      const [
        respuesta1,
        respuesta2,
        respuesta3,
        respuesta4,
        respuesta5,
        respuesta6,
        respuesta7,
        respuesta8,
        respuesta9,
        respuesta10,
        respuesta11,
        respuesta12,
        respuesta13,
        respuesta14,
        respuesta15,
      ] = await Promise.all([
        this.GetReporteGastosEfectivoAsync(rfc, año, mesI, mesF),
        this.GetReporteNotasSinRelacionAsync(rfc, año, mesI, mesF),
        this.GetReporteRiesgoArrendamientoAsync(rfc, año, mesI, mesF),
        this.GetReporteSinImpuestosAsync(rfc, "E", año, mesI, mesF),
        this.GetReporteSinImpuestosAsync(rfc, "R", año, mesI, mesF),
        this.GetReporteRiesgoConceptosAsync(rfc, "E", año, mesI, mesF),
        this.GetReporteRiesgoConceptosAsync(rfc, "R", año, mesI, mesF),
        this.GetReportePue99Async(rfc, "E", año, mesI, mesF),
        this.GetReportePue99Async(rfc, "R", año, mesI, mesF),
        this.GetReportePue30Async(rfc, "E", año, mesI, mesF),
        this.GetReportePue30Async(rfc, "R", año, mesI, mesF),
        this.GetReportePagoFueraDeTiempoAsync(rfc, "E", año, mesI, mesF),
        this.GetReportePagoFueraDeTiempoAsync(rfc, "R", año, mesI, mesF),
        this.GetReportePagosAntesDeComprobanteAsync(rfc, "E", año, mesI, mesF),
        this.GetReportePagosAntesDeComprobanteAsync(rfc, "R", año, mesI, mesF),
      ]);

      console.log(respuesta5);
      const concentrados = [
        {
          titulo: "CONCENTRADO - GASTOS EN EFECTIVO MAYORES A $2,000.00",
          datos: this.agruparPorRfc(respuesta1),
        },
        {
          titulo: "CONCENTRADO - NOTAS SIN RELACIÓN",
          datos: this.agruparPorRfc(respuesta2),
        },
        {
          titulo: "CONCENTRADO - RIESGO ARRENDAMIENTO SIN CUENTA PREDIAL",
          datos: this.agruparPorRfc(respuesta3),
        },
        {
          titulo: "CONCENTRADO - SIN IMPUESTOS EMITIDOS",
          datos: this.agruparPorRfc(respuesta4),
        },
        {
          titulo: "CONCENTRADO - SIN IMPUESTOS RECIBIDOS",
          datos: this.agruparPorRfc(respuesta5),
        },
        {
          titulo: "CONCENTRADO - RIESGO CONCEPTOS CON CLAVE 01010101 EMTIDOS",
          datos: this.agruparPorRfc(respuesta6),
        },
        {
          titulo: "CONCENTRADO - RIESGO CONCEPTOS CON CLAVE 01010101 RECIBIDOS",
          datos: this.agruparPorRfc(respuesta7),
        },
        {
          titulo: "CONCENTRADO - PUE 99 - EMITIDOS",
          datos: this.agruparPorRfc(respuesta8),
        },
        {
          titulo: "CONCENTRADO - PUE 99 - RECIBIDOS",
          datos: this.agruparPorRfc(respuesta9),
        },
        {
          titulo: "CONCENTRADO - PUE 30 - EMITIDOS",
          datos: this.agruparPorRfc(respuesta10),
        },
        {
          titulo: "CONCENTRADO - PUE 30 - RECIBIDOS",
          datos: this.agruparPorRfc(respuesta11),
        },
      ];

      const concentrados2 = [
        {
          titulo: "CONCENTRADO - PAGOS FUERA DE TIEMPO - EMITIDOS",
          datos: this.agruparPorRfcPagos(respuesta12),
        },
        {
          titulo: "CONCENTRADO - PAGOS FUERA DE TIEMPO - RECIBIDOS",
          datos: this.agruparPorRfcPagos(respuesta13),
        },
        {
          titulo: "CONCENTRADO - PAGOS ANTES DE COMPROBANTE - EMITIDOS",
          datos: this.agruparPorRfcPagos(respuesta14),
        },
        {
          titulo: "CONCENTRADO - PAGOS ANTES DE COMPROBANTE - RECIBIDOS",
          datos: this.agruparPorRfcPagos(respuesta15),
        },
      ];

      console.log(concentrados);
      this.datosRiesgoFiscal = concentrados;
      this.datosRiesgoFiscalPagos = concentrados2;
    },

    agruparPorRfc(datos) {
      // 1. Unir todos los meses en una sola lista
      const lista = Object.values(datos).flat();
      if (lista.length == 0) {
        return [];
      }
      // 2. Agrupar por RFC
      const mapa = {};

      lista.forEach((item) => {
        const rfc = item.rfc;

        if (!mapa[rfc]) {
          mapa[rfc] = {
            rfc: item.rfc,
            nombre: item.nombre,
            subTotal: 0,
            totalImpuestosTrasladados: 0,
            totalImpuestosRetenidos: 0,
            total: 0,
          };
        }

        mapa[rfc].subTotal += item.subTotal || 0;
        mapa[rfc].totalImpuestosTrasladados += item.totalImpuestosTrasladados || 0;
        mapa[rfc].totalImpuestosRetenidos += item.totalImpuestosRetenidos || 0;
        mapa[rfc].total += item.total || 0;
      });

      // 3. Convertir a lista normal
      const resultado = Object.values(mapa);

      // 4. Agregar fila de totales generales
      const totalGeneral = resultado.reduce(
        (acc, item) => {
          acc.subTotal += item.subTotal;
          acc.totalImpuestosTrasladados += item.totalImpuestosTrasladados;
          acc.totalImpuestosRetenidos += item.totalImpuestosRetenidos;
          acc.total += item.total;
          return acc;
        },
        {
          rfc: "TOTAL",
          nombre: "",
          subTotal: 0,
          totalImpuestosTrasladados: 0,
          totalImpuestosRetenidos: 0,
          total: 0,
        }
      );

      // 5. Agregar total general al final
      resultado.push(totalGeneral);

      return resultado;
    },

    agruparPorRfcPagos(datos) {
      // 1. Unir todos los meses en una sola lista
      const lista = Object.values(datos).flat();
      if (lista.length == 0) {
        return [];
      }
      // 2. Agrupar por RFC
      const mapa = {};

      lista.forEach((item) => {
        const rfc = item.rfc;

        if (!mapa[rfc]) {
          mapa[rfc] = {
            rfc: item.rfc,
            nombre: item.nombre,
            impPagado: 0,
          };
        }

        mapa[rfc].impPagado += item.impPagado || 0;
      });

      const resultado = Object.values(mapa);

      const totalGeneral = resultado.reduce(
        (acc, item) => {
          acc.impPagado += item.impPagado;
          return acc;
        },
        {
          rfc: "TOTAL",
          nombre: "",
          impPagado: 0,
        }
      );

      // 5. Agregar total general al final
      resultado.push(totalGeneral);

      return resultado;
    },
    async GetReporteIVARetenidoNeteado() {
      try {
        //CONSULTANOS LAS COMPARATIVAS
        this.dataIvaRetenidoNeteado = [];
        let ivaRetenido = [];
        let comparativaIva = await this.GetComparativa(this.selectedAnio, "IVARetenido");
        this.dialogtext = "Calculando IVA Retenido";

        let añoSel = this.selectedAnio - 1;
        let fechaI = añoSel + "-" + "12" + "-01";
        let fechaF = this.selectedAnio + "-" + this.selectedMesF.value + "-01";

        let response = await axios.get(
          this.rutaAxios +
            "Gastos/GetReporteIvaRetenidoNeteadoAsync/erp_" +
            this.token.rfc +
            "/" +
            fechaI +
            "/" +
            fechaF
        );
        ivaRetenido = response.data;
        let mesFin = this.selectedMesF.value;
        console.log("GetReporteIvaRetenidoNeteadoAsync", response);
        //ASIGNAMOS LAS COMPARATIVAS
        for (let a = 1; a <= mesFin; a++) {
          let diferencia = ivaRetenido[a].importeIva - 0;
          let objIva = {
            mes: ivaRetenido[a].mes,
            importeIva: ivaRetenido[a].importeIva,
            comparativa: 0,
            diferencia: diferencia,
            detalles: ivaRetenido[a].detalles,
          };
          this.dataIvaRetenidoNeteado.push(objIva);
          objIva = {};
        }

        let totales = {
          mes: "Total",
          importeIva: this.dataIvaRetenidoNeteado.reduce(
            (acumulador, objeto) => acumulador + objeto.importeIva,
            0
          ),
          comparativa: this.dataIvaRetenidoNeteado.reduce(
            (acumulador, objeto) => acumulador + objeto.comparativa,
            0
          ),
          diferencia: this.dataIvaRetenidoNeteado.reduce(
            (acumulador, objeto) => acumulador + objeto.diferencia,
            0
          ),
          detalles: [],
        };

        this.dataIvaRetenidoNeteado.push(totales);
      } catch (error) {
        console.log(error);
      }
    },

    async GetReporteConceptos() {
      this.$q.loading.show({
        spinner: QSpinnerCube,
        spinnerColor: "red-8",
        spinnerSize: 140,
        message: "Gerando reporte de conceptos...",
      });
      const fI = `${this.selectedAnio}-01-01`;
      const ultimoDia = new Date(this.selectedAnio, this.selectedMesF.value, 0).getDate();

      const fF = `${this.selectedAnio}-${String(this.selectedMesF.value).padStart(
        2,
        "0"
      )}-${String(ultimoDia).padStart(2, "0")}`;

      console.log(fF);
      // let fI = moment(this.fechaI).format('YYYY-MM-DD')
      // let fF = moment(this.fechaF).format('YYYY-MM-DD')
      try {
        let response = await axios.get(
          this.rutaAxios +
            "Ingresos/ReporteConceptoAsync/erp_" +
            this.token.rfc +
            "/" +
            fI +
            "/" +
            fF
        );
        let x = response.data;
        this.dataComprobantesConceptos = [...x];
        console.log(x);
        this.$q.loading.hide();
      } catch (error) {
        console.log(error);
        this.$q.loading.hide();
      }
    },

    //  Ejecutar todas en orden
    async runAll() {
      for (let i = 0; i < this.tasks.length; i++) {
        await this.runTask(i);
        if (this.tasks[i].status === "error") break; // detener si falla
      }
    },

    // Pequeña animación visual del progreso
    animateProgress(task) {
      const interval = setInterval(() => {
        if (task.progress >= 0.9 || task.status !== "loading") {
          clearInterval(interval);
        } else {
          task.progress += 0.05;
        }
      }, 200);
    },
  },

  // Convertir hexadecimal a RGB
  hexToRgb(hex) {
    // Eliminar el símbolo # si existe
    hex = hex.replace(/^#/, "");

    // Convertir a formato RGB
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return [r, g, b];
  },

  generarColorSecundario(rgb) {
    // Algoritmo para aclarar el color
    return rgb.map((c) => Math.min(255, Math.floor(c + (255 - c) * 0.6)));
  },

  // Actualizar los colores cuando se selecciona uno nuevo
  actualizarColores(tipo, valor) {
    // Actualizar el color primario
    this.colores[tipo] = valor;

    // Convertir el color a RGB
    const rgbPrimario = this.hexToRgb(valor);

    // Generar el color secundario
    const rgbSecundario = this.generarColorSecundario(rgbPrimario);

    // Actualizar el esquema de colores
    if (this.coloresScheme[tipo]) {
      this.coloresScheme[tipo].primario = rgbPrimario;
      this.coloresScheme[tipo].secundario = rgbSecundario;
    } else {
      if (tipo === "cfdi") {
        this.coloresScheme.usoCFDI.primario = rgbPrimario;
        this.coloresScheme.usoCFDI.secundario = rgbSecundario;
      } else if (tipo === "otros") {
        this.coloresScheme.informativo.primario = rgbPrimario;
        this.coloresScheme.informativo.secundario = rgbSecundario;
      }
    }
  },
};

// Convertir componentes RGB a formato hexadecimal
function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}
</script>

<style lang="scss">
.btn-redondeado {
  border-radius: 10px !important;
  padding-left: 25px 30px !important;
  font-weight: 500;
}

.encabezado-2 {
  border-left: 6px solid #e54646;
}
</style>
