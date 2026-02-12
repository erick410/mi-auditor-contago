<template>
  <div class="q-pa-md">
    <!-- DIALOG PARA VER LOS PDF -->
    <q-dialog
      v-model="dialogDetalles"
      persistent
      transition-show="scale"
      transition-hide="scale"
      maximized
    >
      <visor-pdf @CloseDialogPdf="CloseDialogPdf"></visor-pdf>
    </q-dialog>

    <q-dialog
      v-model="dialogLista69B"
      persistent
      transition-show="scale"
      transition-hide="scale"
      maximized
    >
      <q-card>
        <q-bar class="bg-primary">
          <q-icon color="white" name="mdi-account-search" />
          <div class="text-white">Lista 69B</div>

          <q-space />

          <q-btn dense color="white" flat icon="close" v-close-popup>
            <q-tooltip>Close</q-tooltip>
          </q-btn>
        </q-bar>
        <q-card-section>
          <lista69></lista69>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-page class="bg-white">
      <q-card flat class="my-card">
        <q-card-section>
          <!-- SELECCIONA AÑO Y MES, BOTON DE BUSCAR Y EXPORTAR A EXCEL -->
          <div class="row no-wrap items-center q-mt-md q-pa-sm">
            <q-btn
              push
              color="red-14"
              @click="CloseDialog"
              icon="mdi-close"
              rounded
              flat
              size="18px"
              padding="xs"
            >
              <q-tooltip
                transition-show="flip-right"
                transition-hide="flip-left"
                content-style="font-size: 14px"
                :offset="[10, 10]"
                >Cerrar</q-tooltip
              >
            </q-btn>
            <q-space />
            <div class="text-h5">{{ itemExento.cabecera }}</div>
            <q-space />
            <q-btn
              push
              color="red-10"
              @click="abrirDialogLista69B"
              icon="mdi-account-search"
              rounded
              flat
              size="18px"
              padding="xs"
            >
              <q-tooltip
                transition-show="flip-right"
                transition-hide="flip-left"
                content-style="font-size: 14px"
                :offset="[10, 10]"
                >Lista 69B</q-tooltip
              >
            </q-btn>

            <q-btn
              push
              color="green-10"
              @click="ExportExcel"
              icon="mdi-file-excel-box-outline"
              rounded
              flat
              size="18px"
              padding="xs"
            >
              <q-tooltip
                transition-show="flip-right"
                transition-hide="flip-left"
                content-style="font-size: 14px"
                :offset="[10, 10]"
                >Exportar Excel</q-tooltip
              >
            </q-btn>

            <q-btn
              push
              color="green-10"
              @click="ExportExcelComparativa"
              icon="mdi-file-excel-box-outline"
              rounded
              flat
              size="18px"
              padding="xs"
            >
              <q-tooltip
                transition-show="flip-right"
                transition-hide="flip-left"
                content-style="font-size: 14px"
                :offset="[10, 10]"
                >Exportar Excel Comparativa</q-tooltip
              >
            </q-btn>
          </div>
        </q-card-section>
      </q-card>

      <q-list bordered class="rounded-borders bg-white q-pa-sm q-m-md">
        <q-expansion-item
          expand-separator
          label="Iva 16%"
          default-opened
          header-class="bg-red-9 text-white"
          expand-icon-class="text-white"
        >
          <!-- TABLA 16 -->
          <q-table
            selection="multiple"
            title="IVA 16%"
            :selected.sync="itemsSeleccion16"
            :filter="filter"
            class="my-sticky-column-table"
            :data="item16.detalles"
            :columns="columns"
            row-key="folioFiscal"
            :rows-per-page-options="[10]"
          >
            <template v-slot:top-right>
              <q-input
                filled
                dense
                debounce="300"
                v-model="filter"
                placeholder="Filtrar"
              >
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td auto-width>
                  <q-checkbox v-model="props.selected" />

                  <q-btn
                    size="md"
                    color="primary"
                    rounded
                    flat
                    dense
                    @click="VerComprobante(props.row)"
                    icon="mdi-file-pdf-box"
                  >
                    <q-tooltip
                      transition-show="flip-right"
                      transition-hide="flip-left"
                      content-style="font-size: 14px"
                      :offset="[10, 10]"
                      >Detalles</q-tooltip
                    >
                  </q-btn>
                </q-td>

                <q-td key="serie" :props="props">{{ props.row.serie }}</q-td>
                <q-td key="folio" :props="props">{{ props.row.folio }}</q-td>
                <q-td key="fecha" :props="props">{{
                  formatDate(props.row.fecha)
                }}</q-td>
                <q-td key="fechaPago" :props="props">{{
                  formatDate(props.row.fechaPago)
                }}</q-td>
                <q-td key="rfc" :props="props">{{ props.row.rfc }}</q-td>
                <q-td key="nombre" :props="props">{{ props.row.nombre }}</q-td>
                <q-td key="metodoPago" :props="props">{{
                  props.row.metodoPago
                }}</q-td>
                <q-td key="formaPago" :props="props">{{
                  props.row.formaPago
                }}</q-td>
                <q-td key="base_" :props="props">{{
                  formatCurrency(props.row.base_)
                }}</q-td>
                <q-td key="impuesto" :props="props">{{
                  props.row.impuesto
                }}</q-td>
                <q-td key="tipoFactor" :props="props">{{
                  props.row.tipoFactor
                }}</q-td>
                <q-td key="tasaOCuota" :props="props">{{
                  formatNumber(props.row.tasaOCuota)
                }}</q-td>
                <q-td key="importe" :props="props">{{
                  formatCurrency(props.row.importe)
                }}</q-td>
                <q-td key="total" :props="props">{{
                  formatCurrency(props.row.total)
                }}</q-td>
                <q-td key="impPagado" :props="props">{{
                  formatCurrency(props.row.impPagado)
                }}</q-td>
                <q-td key="moneda" :props="props">{{ props.row.moneda }}</q-td>
                <q-td key="tipoCambio" :props="props">{{
                  formatCurrency(props.row.tipoCambio)
                }}</q-td>
                <q-td key="monedaP" :props="props">{{
                  props.row.monedaP
                }}</q-td>
                <q-td key="tipoCambioP" :props="props">{{
                  formatCurrency(props.row.tipoCambioP)
                }}</q-td>
                <q-td key="monedaDr" :props="props">{{
                  props.row.monedaDr
                }}</q-td>
                <q-td key="equivalenciaDr" :props="props">{{
                  formatCurrency(props.row.equivalenciaDr)
                }}</q-td>
                <q-td key="tipoComprobante" :props="props">{{
                  props.row.tipoComprobante
                }}</q-td>
                <q-td key="folioFiscal" :props="props">{{
                  props.row.folioFiscal
                }}</q-td>
                <q-td key="folioFiscalPago" :props="props">{{
                  props.row.folioFiscalPago
                }}</q-td>
                <q-td key="porcentaje" :props="props"
                  >{{ formatNumber(props.row.porcentaje) }} %</q-td
                >
              </q-tr>
            </template>
          </q-table>

          <br />
          <br />

          <!-- TABLA COMPARATIVA 16 -->
          <q-table
            title="RESUMEN IVA 16%"
            :data="comparativa16"
            :columns="columnsComparativa"
            row-key="detalle"
            :rows-per-page-options="[0]"
            dense
          >
            <template v-slot:body="props">
              <q-tr :props="props" :class="getRowClass(props)">
                <q-td key="concepto" :props="props">{{
                  props.row.concepto
                }}</q-td>
                <q-td key="base" :props="props">{{
                  formatCurrency(props.row.base)
                }}</q-td>
                <q-td key="importe" :props="props">{{
                  formatCurrency(props.row.importe)
                }}</q-td>
                <q-td key="contador" :props="props">{{
                  formatmiles(props.row.contador)
                }}</q-td>
              </q-tr>
            </template>
          </q-table>
        </q-expansion-item>
        <br />
        <q-separator />

        <q-expansion-item
          expand-separator
          label="Iva 8%"
          header-class="bg-red-8 text-white"
          expand-icon-class="text-white"
        >
          <!-- TABLA DEL 8 -->
          <q-table
            selection="multiple"
            title="IVA 8%"
            :selected.sync="itemsSeleccion8"
            :filter="filter"
            class="my-sticky-column-table"
            :data="item8.detalles"
            :columns="columns"
            row-key="folioFiscal"
            :rows-per-page-options="[10]"
          >
            <template v-slot:top-right>
              <q-input
                filled
                dense
                debounce="300"
                v-model="filter"
                placeholder="Filtrar"
              >
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td auto-width>
                  q-checkbox v-model="props.selected" />

                  <q-btn
                    size="md"
                    color="primary"
                    rounded
                    flat
                    dense
                    @click="VerComprobante(props.row)"
                    icon="mdi-file-pdf-box"
                  >
                    <q-tooltip
                      transition-show="flip-right"
                      transition-hide="flip-left"
                      content-style="font-size: 14px"
                      :offset="[10, 10]"
                      >Detalles</q-tooltip
                    >
                  </q-btn>
                </q-td>
                <q-td key="serie" :props="props">{{ props.row.serie }}</q-td>
                <q-td key="folio" :props="props">{{ props.row.folio }}</q-td>
                <q-td key="fecha" :props="props">{{
                  formatDate(props.row.fecha)
                }}</q-td>
                <q-td key="fechaPago" :props="props">{{
                  formatDate(props.row.fechaPago)
                }}</q-td>
                <q-td key="rfc" :props="props">{{ props.row.rfc }}</q-td>
                <q-td key="nombre" :props="props">{{ props.row.nombre }}</q-td>
                <q-td key="metodoPago" :props="props">{{
                  props.row.metodoPago
                }}</q-td>
                <q-td key="formaPago" :props="props">{{
                  props.row.formaPago
                }}</q-td>
                <q-td key="base_" :props="props">{{
                  formatCurrency(props.row.base_)
                }}</q-td>
                <q-td key="impuesto" :props="props">{{
                  props.row.impuesto
                }}</q-td>
                <q-td key="tipoFactor" :props="props">{{
                  props.row.tipoFactor
                }}</q-td>
                <q-td key="tasaOCuota" :props="props">{{
                  formatNumber(props.row.tasaOCuota)
                }}</q-td>
                <q-td key="importe" :props="props">{{
                  formatCurrency(props.row.importe)
                }}</q-td>
                <q-td key="total" :props="props">{{
                  formatCurrency(props.row.total)
                }}</q-td>
                <q-td key="impPagado" :props="props">{{
                  formatCurrency(props.row.impPagado)
                }}</q-td>
                <q-td key="moneda" :props="props">{{ props.row.moneda }}</q-td>
                <q-td key="tipoCambio" :props="props">{{
                  formatCurrency(props.row.tipoCambio)
                }}</q-td>
                <q-td key="monedaP" :props="props">{{
                  props.row.monedaP
                }}</q-td>
                <q-td key="tipoCambioP" :props="props">{{
                  formatCurrency(props.row.tipoCambioP)
                }}</q-td>
                <q-td key="monedaDr" :props="props">{{
                  props.row.monedaDr
                }}</q-td>
                <q-td key="equivalenciaDr" :props="props">{{
                  formatCurrency(props.row.equivalenciaDr)
                }}</q-td>
                <q-td key="tipoComprobante" :props="props">{{
                  props.row.tipoComprobante
                }}</q-td>
                <q-td key="folioFiscal" :props="props">{{
                  props.row.folioFiscal
                }}</q-td>
                <q-td key="folioFiscalPago" :props="props">{{
                  props.row.folioFiscalPago
                }}</q-td>
                <q-td key="porcentaje" :props="props"
                  >{{ formatNumber(props.row.porcentaje) }} %</q-td
                >
              </q-tr>
            </template>
          </q-table>

          <br />
          <br />

          <!-- TABLA COMPARATIVA 8 -->
          <q-table
            title="RESUMEN IVA 8%"
            :data="comparativa8"
            :columns="columnsComparativa"
            row-key="detalle"
            :rows-per-page-options="[0]"
            dense
          >
            <template v-slot:body="props">
              <q-tr :props="props" :class="getRowClass(props)">
                <q-td key="concepto" :props="props">{{
                  props.row.concepto
                }}</q-td>
                <q-td key="base" :props="props">{{
                  formatCurrency(props.row.base)
                }}</q-td>
                <q-td key="importe" :props="props">{{
                  formatCurrency(props.row.importe)
                }}</q-td>
                <q-td key="contador" :props="props">{{
                  formatmiles(props.row.contador)
                }}</q-td>
              </q-tr>
            </template>
          </q-table>
        </q-expansion-item>
        <br />
        <q-separator />

        <q-expansion-item
          expand-separator
          label="Iva 0%"
          header-class="bg-red-7 text-white"
          expand-icon-class="text-white"
        >
          <!-- TABLA DEL 0 -->
          <q-table
            selection="multiple"
            title="IVA 0%"
            :selected.sync="itemsSeleccion0"
            :filter="filter"
            class="my-sticky-column-table"
            :data="item0.detalles"
            :columns="columns"
            row-key="folioFiscal"
            :rows-per-page-options="[10]"
          >
            <template v-slot:top-right>
              <q-input
                filled
                dense
                debounce="300"
                v-model="filter"
                placeholder="Filtrar"
              >
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td auto-width>
                  <q-checkbox v-model="props.selected" />

                  <q-btn
                    size="md"
                    color="primary"
                    rounded
                    flat
                    dense
                    @click="VerComprobante(props.row)"
                    icon="mdi-file-pdf-box"
                  >
                    <q-tooltip
                      transition-show="flip-right"
                      transition-hide="flip-left"
                      content-style="font-size: 14px"
                      :offset="[10, 10]"
                      >Detalles</q-tooltip
                    >
                  </q-btn>
                </q-td>

                <q-td key="serie" :props="props">{{ props.row.serie }}</q-td>
                <q-td key="folio" :props="props">{{ props.row.folio }}</q-td>
                <q-td key="fecha" :props="props">{{
                  formatDate(props.row.fecha)
                }}</q-td>
                <q-td key="fechaPago" :props="props">{{
                  formatDate(props.row.fechaPago)
                }}</q-td>
                <q-td key="rfc" :props="props">{{ props.row.rfc }}</q-td>
                <q-td key="nombre" :props="props">{{ props.row.nombre }}</q-td>
                <q-td key="metodoPago" :props="props">{{
                  props.row.metodoPago
                }}</q-td>
                <q-td key="formaPago" :props="props">{{
                  props.row.formaPago
                }}</q-td>
                <q-td key="base_" :props="props">{{
                  formatCurrency(props.row.base_)
                }}</q-td>
                <q-td key="impuesto" :props="props">{{
                  props.row.impuesto
                }}</q-td>
                <q-td key="tipoFactor" :props="props">{{
                  props.row.tipoFactor
                }}</q-td>
                <q-td key="tasaOCuota" :props="props">{{
                  formatNumber(props.row.tasaOCuota)
                }}</q-td>
                <q-td key="importe" :props="props">{{
                  formatCurrency(props.row.importe)
                }}</q-td>
                <q-td key="total" :props="props">{{
                  formatCurrency(props.row.total)
                }}</q-td>
                <q-td key="impPagado" :props="props">{{
                  formatCurrency(props.row.impPagado)
                }}</q-td>
                <q-td key="moneda" :props="props">{{ props.row.moneda }}</q-td>
                <q-td key="tipoCambio" :props="props">{{
                  formatCurrency(props.row.tipoCambio)
                }}</q-td>
                <q-td key="monedaP" :props="props">{{
                  props.row.monedaP
                }}</q-td>
                <q-td key="tipoCambioP" :props="props">{{
                  formatCurrency(props.row.tipoCambioP)
                }}</q-td>
                <q-td key="monedaDr" :props="props">{{
                  props.row.monedaDr
                }}</q-td>
                <q-td key="equivalenciaDr" :props="props">{{
                  formatCurrency(props.row.equivalenciaDr)
                }}</q-td>
                <q-td key="tipoComprobante" :props="props">{{
                  props.row.tipoComprobante
                }}</q-td>
                <q-td key="folioFiscal" :props="props">{{
                  props.row.folioFiscal
                }}</q-td>
                <q-td key="folioFiscalPago" :props="props">{{
                  props.row.folioFiscalPago
                }}</q-td>
                <q-td key="porcentaje" :props="props"
                  >{{ formatNumber(props.row.porcentaje) }} %</q-td
                >
              </q-tr>
            </template>
          </q-table>

          <br />
          <br />

          <!-- TABLA COMPARATIVA 0 -->
          <q-table
            title="RESUMEN IVA 0%"
            :data="comparativa0"
            :columns="columnsComparativa"
            row-key="detalle"
            :rows-per-page-options="[0]"
            dense
          >
            <template v-slot:body="props">
              <q-tr :props="props" :class="getRowClass(props)">
                <q-td key="concepto" :props="props">{{
                  props.row.concepto
                }}</q-td>
                <q-td key="base" :props="props">{{
                  formatCurrency(props.row.base)
                }}</q-td>
                <q-td key="importe" :props="props">{{
                  formatCurrency(props.row.importe)
                }}</q-td>
                <q-td key="contador" :props="props">{{
                  formatmiles(props.row.contador)
                }}</q-td>
              </q-tr>
            </template>
          </q-table>
        </q-expansion-item>
        <br />
        <q-separator />

        <q-expansion-item
          expand-separator
          label="Iva Exento"
          header-class="bg-red-6 text-white"
          expand-icon-class="text-white"
        >
          <!-- TABLA EXENTO -->
          <q-table
            selection="multiple"
            title="IVA Exento"
            :selected.sync="itemsSeleccionExento"
            :filter="filter"
            class="my-sticky-column-table"
            :data="itemExento.detalles"
            :columns="columns"
            row-key="folioFiscal"
            :rows-per-page-options="[10]"
          >
            <template v-slot:top-right>
              <q-input
                filled
                dense
                debounce="300"
                v-model="filter"
                placeholder="Filtrar"
              >
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td auto-width>
                  <q-checkbox v-model="props.selected" />

                  <q-btn
                    size="md"
                    color="primary"
                    rounded
                    flat
                    dense
                    @click="VerComprobante(props.row)"
                    icon="mdi-file-pdf-box"
                  >
                    <q-tooltip
                      transition-show="flip-right"
                      transition-hide="flip-left"
                      content-style="font-size: 14px"
                      :offset="[10, 10]"
                      >Detalles
                    </q-tooltip>
                  </q-btn>
                </q-td>
                <q-td key="serie" :props="props">{{ props.row.serie }}</q-td>
                <q-td key="folio" :props="props">{{ props.row.folio }}</q-td>
                <q-td key="fecha" :props="props">{{
                  formatDate(props.row.fecha)
                }}</q-td>
                <q-td key="fechaPago" :props="props">{{
                  formatDate(props.row.fechaPago)
                }}</q-td>
                <q-td key="rfc" :props="props">{{ props.row.rfc }}</q-td>
                <q-td key="nombre" :props="props">{{ props.row.nombre }}</q-td>
                <q-td key="metodoPago" :props="props">{{
                  props.row.metodoPago
                }}</q-td>
                <q-td key="formaPago" :props="props">{{
                  props.row.formaPago
                }}</q-td>
                <q-td key="base_" :props="props">{{
                  formatCurrency(props.row.base_)
                }}</q-td>
                <q-td key="impuesto" :props="props">{{
                  props.row.impuesto
                }}</q-td>
                <q-td key="tipoFactor" :props="props">{{
                  props.row.tipoFactor
                }}</q-td>
                <q-td key="tasaOCuota" :props="props">{{
                  formatNumber(props.row.tasaOCuota)
                }}</q-td>
                <q-td key="importe" :props="props">{{
                  formatCurrency(props.row.importe)
                }}</q-td>
                <q-td key="total" :props="props">{{
                  formatCurrency(props.row.total)
                }}</q-td>
                <q-td key="impPagado" :props="props">{{
                  formatCurrency(props.row.impPagado)
                }}</q-td>
                <q-td key="moneda" :props="props">{{ props.row.moneda }}</q-td>
                <q-td key="tipoCambio" :props="props">{{
                  formatCurrency(props.row.tipoCambio)
                }}</q-td>
                <q-td key="monedaP" :props="props">{{
                  props.row.monedaP
                }}</q-td>
                <q-td key="tipoCambioP" :props="props">{{
                  formatCurrency(props.row.tipoCambioP)
                }}</q-td>
                <q-td key="monedaDr" :props="props">{{
                  props.row.monedaDr
                }}</q-td>
                <q-td key="equivalenciaDr" :props="props">{{
                  formatCurrency(props.row.equivalenciaDr)
                }}</q-td>
                <q-td key="tipoComprobante" :props="props">{{
                  props.row.tipoComprobante
                }}</q-td>
                <q-td key="folioFiscal" :props="props">{{
                  props.row.folioFiscal
                }}</q-td>
                <q-td key="folioFiscalPago" :props="props">{{
                  props.row.folioFiscalPago
                }}</q-td>
                <q-td key="porcentaje" :props="props"
                  >{{ formatNumber(props.row.porcentaje) }} %</q-td
                >
              </q-tr>
            </template>
          </q-table>

          <br />
          <br />

          <!-- TABLA COMPARATIVA EXENTO -->
          <q-table
            title="RESUMEN IVA EXENTO"
            :data="comparativaExento"
            :columns="columnsComparativa"
            row-key="detalle"
            :rows-per-page-options="[0]"
            dense
          >
            <template v-slot:body="props">
              <q-tr :props="props" :class="getRowClass(props)">
                <q-td key="concepto" :props="props">{{
                  props.row.concepto
                }}</q-td>
                <q-td key="base" :props="props">{{
                  formatCurrency(props.row.base)
                }}</q-td>
                <q-td key="importe" :props="props">{{
                  formatCurrency(props.row.importe)
                }}</q-td>
                <q-td key="contador" :props="props">{{
                  formatmiles(props.row.contador)
                }}</q-td>
              </q-tr>
            </template>
          </q-table>
        </q-expansion-item>
        <q-separator />
      </q-list>
    </q-page>
  </div>
</template>
<script>
import axios from "axios";
import moment from "moment";
import visorPdf from "../Pdf/VisorPdf.vue";
import { ComprobanteBase64 } from "../Pdf/ComprobanteBase64.js";
import { generarCodigoQR } from "../Pdf/qrcodeGenerator";
import * as XLSX from "xlsx";
import lista69 from "../Lista69B/Lista69B.vue";

export default {
  components: {
    visorPdf,
    lista69,
  },
  data() {
    return {
      columns: [
        {
          name: "serie",
          align: "left",
          label: "Serie",
          field: "serie",
          sortable: true,
        },
        {
          name: "folio",
          align: "left",
          label: "Folio",
          field: "folio",
          sortable: true,
        },
        {
          name: "fecha",
          align: "left",
          label: "Fecha",
          field: "fecha",
          sortable: true,
        },
        {
          name: "fechaPago",
          align: "left",
          label: "Fecha de Pago",
          field: "fechaPago",
          sortable: true,
        },
        {
          name: "rfc",
          align: "left",
          label: "RFC",
          field: "rfc",
          sortable: true,
        },
        {
          name: "nombre",
          align: "left",
          label: "Nombre",
          field: "nombre",
          sortable: true,
        },
        {
          name: "metodoPago",
          align: "left",
          label: "Métdodo de Pago",
          field: "metodoPago",
          sortable: true,
        },
        {
          name: "formaPago",
          align: "left",
          label: "Forma de Pago",
          field: "formaPago",
          sortable: true,
        },
        {
          name: "base_",
          align: "right",
          label: "Base",
          field: "base_",
          sortable: true,
        },
        {
          name: "impuesto",
          align: "left",
          label: "Impuesto",
          field: "impuesto",
          sortable: true,
        },
        {
          name: "tipoFactor",
          align: "left",
          label: "Tipo Factor",
          field: "tipoFactor",
          sortable: true,
        },
        {
          name: "tasaOCuota",
          align: "right",
          label: "Tasa O Cuota",
          field: "tasaOCuota",
          sortable: true,
        },
        {
          name: "importe",
          align: "right",
          label: "Importe",
          field: "importe",
          sortable: true,
        },
        {
          name: "total",
          align: "right",
          label: "Total",
          field: "total",
          sortable: true,
        },
        {
          name: "impPagado",
          align: "right",
          label: "Importe Pagado",
          field: "impPagado",
          sortable: true,
        },
        {
          name: "moneda",
          align: "left",
          label: "Moneda",
          field: "moneda",
          sortable: true,
        },
        {
          name: "tipoCambio",
          align: "right",
          label: "Tipo de Cambio",
          field: "tipoCambio",
          sortable: true,
        },
        {
          name: "monedaP",
          align: "left",
          label: "Moneda P",
          field: "monedaP",
          sortable: true,
        },
        {
          name: "tipoCambioP",
          align: "right",
          label: "Tipo de Cambio P",
          field: "tipoCambioP",
          sortable: true,
        },
        {
          name: "monedaDr",
          align: "left",
          label: "Moneda DR",
          field: "monedaDr",
          sortable: true,
        },
        {
          name: "equivalenciaDr",
          align: "right",
          label: "Tipo Equivalencia DR Cambio Pago",
          field: "equivalenciaDr",
          sortable: true,
        },
        {
          name: "tipoComprobante",
          align: "left",
          label: "Tipo de Comprobante",
          field: "tipoComprobante",
          sortable: true,
        },
        {
          name: "folioFiscal",
          align: "left",
          label: "Folio Fiscal",
          field: "folioFiscal",
          sortable: true,
        },
        {
          name: "folioFiscalPago",
          align: "left",
          label: "Folio Fiscal Pago",
          field: "folioFiscalPago",
          sortable: true,
        },
        {
          name: "porcentaje",
          align: "right",
          label: "Porcentaje",
          field: "porcentaje",
          sortable: true,
        },
      ],

      columnsComparativa: [
        {
          name: "concepto",
          align: "left",
          label: "Concepto",
          field: "concepto",
          sortable: true,
        },
        {
          name: "base",
          align: "right",
          label: "Base",
          field: "base",
          sortable: true,
        },
        {
          name: "importe",
          align: "right",
          label: "Importe",
          field: "importe",
          sortable: true,
        },
        {
          name: "contador",
          align: "center",
          label: "Contador",
          field: "contador",
          sortable: true,
        },
      ],

      //DETALLES
      dialogDetalles: false,
      itemsSeleccion16: [],
      itemsSeleccion8: [],
      itemsSeleccion0: [],
      itemsSeleccionExento: [],
      filter: "",
      dialogLista69B: false,
    };
  },
  computed: {
    token() {
      return this.$store.state.usuario;
    },

    itemExento() {
      return this.$store.state.detallesIvaMensualExentoStore;
    },

    item16() {
      return this.$store.state.detallesIvaMensualTasa16Store;
    },

    item8() {
      return this.$store.state.detallesIvaMensualTasa8Store;
    },

    item0() {
      return this.$store.state.detallesIvaMensualTasa0Store;
    },

    visorSat() {
      return this.$store.state.visorSatIva;
    },

    rutaAxios() {
      return this.$store.state.rutaMongoStore;
    },

    sumaSeleccionado() {
      return this.itemsSeleccion.reduce(
        (acumulador, objeto) => acumulador + objeto.importe,
        0
      );
    },

    comparativa16() {
      const tabla = [
        ...this.$store.state.detallesIvaMensualTasa16Store.detalles,
      ];

      if (tabla.length === 0) {
        return [];
      }

      const añoBuscado = new Date(tabla[0].fecha).getFullYear();
      const pueEfectivo = {
        concepto: "PUE | Efectivo",
        base: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago === "01 | Efectivo" &&
            item.tipoComprobante === "I",
          "base_"
        ),
        importe: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago === "01 | Efectivo" &&
            item.tipoComprobante === "I",
          "importe"
        ),
        contador: tabla.filter(
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago === "01 | Efectivo" &&
            item.tipoComprobante === "I"
        ).length,
      };
      const pueOtros = {
        concepto: "PUE | Otros",
        base: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago != "01 | Efectivo" &&
            item.tipoComprobante === "I",
          "base_"
        ),
        importe: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago != "01 | Efectivo" &&
            item.tipoComprobante === "I",
          "importe"
        ),
        contador: tabla.filter(
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago != "01 | Efectivo" &&
            item.tipoComprobante === "I",
          "importe"
        ).length,
      };

      //
      const pueSum = {
        concepto: "PUE",
        base: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.tipoComprobante === "I",
          "base_"
        ),
        importe: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.tipoComprobante === "I",
          "importe"
        ),
        contador: tabla.filter(
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.tipoComprobante === "I",
          "importe"
        ).length,
      };
      const ppdEfectivoAño = {
        concepto: "PPD | Efectivo del periodo",
        base: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago === "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() === añoBuscado,
          "base_"
        ),
        importe: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago === "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() === añoBuscado,
          "importe"
        ),
        contador: tabla.filter(
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago === "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() === añoBuscado
        ).length,
      };
      const ppdOtrosAño = {
        concepto: "PPD | Otros del periodo",
        base: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago != "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() === añoBuscado,
          "base_"
        ),
        importe: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago != "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() === añoBuscado,
          "importe"
        ),
        contador: tabla.filter(
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago != "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() === añoBuscado
        ).length,
      };
      const ppdEfectivoAnterior = {
        concepto: "PPD | Efectivo de periodos anteriores",
        base: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago === "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() != añoBuscado,
          "base_"
        ),
        importe: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago === "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() != añoBuscado,
          "importe"
        ),
        contador: tabla.filter(
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago === "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() != añoBuscado
        ).length,
      };
      const ppdOtrosAnterior = {
        concepto: "PPD | Otros de periodos anteriores",
        base: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago != "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() != añoBuscado,
          "base_"
        ),
        importe: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago != "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() != añoBuscado,
          "importe"
        ),
        contador: tabla.filter(
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago != "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() != añoBuscado
        ).length,
      };

      //
      const ppdSum = {
        concepto: "PPD",
        base: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido",
          "base_"
        ),
        importe: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido",
          "importe"
        ),
        contador: tabla.filter(
          (item) => item.metodoPago === "PPD | Pago en parcialidades o diferido"
        ).length,
      };
      const ncEfectivo = {
        concepto: "NC | Efectivo",
        base: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago === "01 | Efectivo" &&
            item.tipoComprobante === "E",
          "base_"
        ),
        importe: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago === "01 | Efectivo" &&
            item.tipoComprobante === "E",
          "importe"
        ),
        contador: tabla.filter(
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago === "01 | Efectivo" &&
            item.tipoComprobante === "E"
        ).length,
      };
      const ncOtros = {
        concepto: "NC | Otros",
        base: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago != "01 | Efectivo" &&
            item.tipoComprobante === "E",
          "base_"
        ),
        importe: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago != "01 | Efectivo" &&
            item.tipoComprobante === "E",
          "importe"
        ),
        contador: tabla.filter(
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago != "01 | Efectivo" &&
            item.tipoComprobante === "E"
        ).length,
      };

      //
      const ncSum = {
        concepto: "NC",
        base: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.tipoComprobante === "E",
          "base_"
        ),
        importe: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.tipoComprobante === "E",
          "importe"
        ),
        contador: tabla.filter(
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.tipoComprobante === "E",
          "importe"
        ).length,
      };
      const espacio = { concepto: "", base: "", importe: "" };
      const total = {
        concepto: "Total",
        base:
          this.sumarPropiedad(
            tabla,
            (item) => item.tipoComprobante != "E",
            "base_"
          ) + ncSum.base,
        importe: pueSum.importe + ppdSum.importe + ncSum.importe,
        contador: tabla.length,
      };

      let result = [];
      pueEfectivo.contador != 0 && result.push(pueEfectivo);
      pueOtros.contador != 0 && result.push(pueOtros);
      pueSum.contador != 0 && result.push(pueSum);
      pueSum.contador != 0 && result.push(espacio); // QUITAR ESTO
      ppdEfectivoAño.contador != 0 && result.push(ppdEfectivoAño);
      ppdOtrosAño.contador != 0 && result.push(ppdOtrosAño);
      ppdEfectivoAnterior.contador != 0 && result.push(ppdEfectivoAnterior);
      ppdOtrosAnterior.contador != 0 && result.push(ppdOtrosAnterior);
      ppdSum.contador != 0 && result.push(ppdSum);
      ppdSum.contador != 0 && result.push(espacio);
      ncEfectivo.contador != 0 && result.push(ncEfectivo);
      ncOtros.contador != 0 && result.push(ncOtros);
      ncSum.contador != 0 && result.push(ncSum);
      ncSum.contador != 0 && result.push(espacio);
      total.contador != 0 && result.push(total);
      return result;
    },

    comparativa8() {
      const tabla = [
        ...this.$store.state.detallesIvaMensualTasa8Store.detalles,
      ];

      if (tabla.length === 0) {
        return [];
      }

      const añoBuscado = new Date(tabla[0].fecha).getFullYear();
      const pueEfectivo = {
        concepto: "PUE | Efectivo",
        base: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago === "01 | Efectivo" &&
            item.tipoComprobante === "I",
          "base_"
        ),
        importe: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago === "01 | Efectivo" &&
            item.tipoComprobante === "I",
          "importe"
        ),
        contador: tabla.filter(
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago === "01 | Efectivo" &&
            item.tipoComprobante === "I"
        ).length,
      };
      const pueOtros = {
        concepto: "PUE | Otros",
        base: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago != "01 | Efectivo" &&
            item.tipoComprobante === "I",
          "base_"
        ),
        importe: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago != "01 | Efectivo" &&
            item.tipoComprobante === "I",
          "importe"
        ),
        contador: tabla.filter(
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago != "01 | Efectivo" &&
            item.tipoComprobante === "I",
          "importe"
        ).length,
      };

      //
      const pueSum = {
        concepto: "PUE",
        base: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.tipoComprobante === "I",
          "base_"
        ),
        importe: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.tipoComprobante === "I",
          "importe"
        ),
        contador: tabla.filter(
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.tipoComprobante === "I",
          "importe"
        ).length,
      };
      const ppdEfectivoAño = {
        concepto: "PPD | Efectivo del periodo",
        base: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago === "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() === añoBuscado,
          "base_"
        ),
        importe: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago === "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() === añoBuscado,
          "importe"
        ),
        contador: tabla.filter(
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago === "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() === añoBuscado
        ).length,
      };
      const ppdOtrosAño = {
        concepto: "PPD | Otros del periodo",
        base: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago != "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() === añoBuscado,
          "base_"
        ),
        importe: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago != "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() === añoBuscado,
          "importe"
        ),
        contador: tabla.filter(
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago != "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() === añoBuscado
        ).length,
      };
      const ppdEfectivoAnterior = {
        concepto: "PPD | Efectivo de periodos anteriores",
        base: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago === "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() != añoBuscado,
          "base_"
        ),
        importe: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago === "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() != añoBuscado,
          "importe"
        ),
        contador: tabla.filter(
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago === "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() != añoBuscado
        ).length,
      };
      const ppdOtrosAnterior = {
        concepto: "PPD | Otros de periodos anteriores",
        base: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago != "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() != añoBuscado,
          "base_"
        ),
        importe: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago != "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() != añoBuscado,
          "importe"
        ),
        contador: tabla.filter(
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago != "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() != añoBuscado
        ).length,
      };

      //
      const ppdSum = {
        concepto: "PPD",
        base: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido",
          "base_"
        ),
        importe: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido",
          "importe"
        ),
        contador: tabla.filter(
          (item) => item.metodoPago === "PPD | Pago en parcialidades o diferido"
        ).length,
      };
      const ncEfectivo = {
        concepto: "NC | Efectivo",
        base: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago === "01 | Efectivo" &&
            item.tipoComprobante === "E",
          "base_"
        ),
        importe: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago === "01 | Efectivo" &&
            item.tipoComprobante === "E",
          "importe"
        ),
        contador: tabla.filter(
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago === "01 | Efectivo" &&
            item.tipoComprobante === "E"
        ).length,
      };
      const ncOtros = {
        concepto: "NC | Otros",
        base: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago != "01 | Efectivo" &&
            item.tipoComprobante === "E",
          "base_"
        ),
        importe: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago != "01 | Efectivo" &&
            item.tipoComprobante === "E",
          "importe"
        ),
        contador: tabla.filter(
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago != "01 | Efectivo" &&
            item.tipoComprobante === "E"
        ).length,
      };

      //
      const ncSum = {
        concepto: "NC",
        base: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.tipoComprobante === "E",
          "base_"
        ),
        importe: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.tipoComprobante === "E",
          "importe"
        ),
        contador: tabla.filter(
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.tipoComprobante === "E",
          "importe"
        ).length,
      };
      const espacio = { concepto: "", base: "", importe: "" };
      const total = {
        concepto: "Total",
        base:
          this.sumarPropiedad(
            tabla,
            (item) => item.tipoComprobante != "E",
            "base_"
          ) + ncSum.base,
        importe: pueSum.importe + ppdSum.importe + ncSum.importe,
        contador: tabla.length,
      };

      let result = [];
      pueEfectivo.contador != 0 && result.push(pueEfectivo);
      pueOtros.contador != 0 && result.push(pueOtros);
      pueSum.contador != 0 && result.push(pueSum);
      pueSum.contador != 0 && result.push(espacio); // QUITAR ESTO
      ppdEfectivoAño.contador != 0 && result.push(ppdEfectivoAño);
      ppdOtrosAño.contador != 0 && result.push(ppdOtrosAño);
      ppdEfectivoAnterior.contador != 0 && result.push(ppdEfectivoAnterior);
      ppdOtrosAnterior.contador != 0 && result.push(ppdOtrosAnterior);
      ppdSum.contador != 0 && result.push(ppdSum);
      ppdSum.contador != 0 && result.push(espacio);
      ncEfectivo.contador != 0 && result.push(ncEfectivo);
      ncOtros.contador != 0 && result.push(ncOtros);
      ncSum.contador != 0 && result.push(ncSum);
      ncSum.contador != 0 && result.push(espacio);
      total.contador != 0 && result.push(total);
      return result;
    },

    comparativa0() {
      const tabla = [
        ...this.$store.state.detallesIvaMensualTasa0Store.detalles,
      ];

      if (tabla.length === 0) {
        return [];
      }

      const añoBuscado = new Date(tabla[0].fecha).getFullYear();
      const pueEfectivo = {
        concepto: "PUE | Efectivo",
        base: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago === "01 | Efectivo" &&
            item.tipoComprobante === "I",
          "base_"
        ),
        importe: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago === "01 | Efectivo" &&
            item.tipoComprobante === "I",
          "importe"
        ),
        contador: tabla.filter(
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago === "01 | Efectivo" &&
            item.tipoComprobante === "I"
        ).length,
      };
      const pueOtros = {
        concepto: "PUE | Otros",
        base: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago != "01 | Efectivo" &&
            item.tipoComprobante === "I",
          "base_"
        ),
        importe: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago != "01 | Efectivo" &&
            item.tipoComprobante === "I",
          "importe"
        ),
        contador: tabla.filter(
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago != "01 | Efectivo" &&
            item.tipoComprobante === "I",
          "importe"
        ).length,
      };

      //
      const pueSum = {
        concepto: "PUE",
        base: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.tipoComprobante === "I",
          "base_"
        ),
        importe: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.tipoComprobante === "I",
          "importe"
        ),
        contador: tabla.filter(
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.tipoComprobante === "I",
          "importe"
        ).length,
      };
      const ppdEfectivoAño = {
        concepto: "PPD | Efectivo del periodo",
        base: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago === "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() === añoBuscado,
          "base_"
        ),
        importe: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago === "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() === añoBuscado,
          "importe"
        ),
        contador: tabla.filter(
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago === "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() === añoBuscado
        ).length,
      };
      const ppdOtrosAño = {
        concepto: "PPD | Otros del periodo",
        base: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago != "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() === añoBuscado,
          "base_"
        ),
        importe: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago != "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() === añoBuscado,
          "importe"
        ),
        contador: tabla.filter(
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago != "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() === añoBuscado
        ).length,
      };
      const ppdEfectivoAnterior = {
        concepto: "PPD | Efectivo de periodos anteriores",
        base: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago === "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() != añoBuscado,
          "base_"
        ),
        importe: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago === "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() != añoBuscado,
          "importe"
        ),
        contador: tabla.filter(
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago === "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() != añoBuscado
        ).length,
      };
      const ppdOtrosAnterior = {
        concepto: "PPD | Otros de periodos anteriores",
        base: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago != "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() != añoBuscado,
          "base_"
        ),
        importe: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago != "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() != añoBuscado,
          "importe"
        ),
        contador: tabla.filter(
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago != "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() != añoBuscado
        ).length,
      };

      //
      const ppdSum = {
        concepto: "PPD",
        base: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido",
          "base_"
        ),
        importe: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido",
          "importe"
        ),
        contador: tabla.filter(
          (item) => item.metodoPago === "PPD | Pago en parcialidades o diferido"
        ).length,
      };
      const ncEfectivo = {
        concepto: "NC | Efectivo",
        base: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago === "01 | Efectivo" &&
            item.tipoComprobante === "E",
          "base_"
        ),
        importe: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago === "01 | Efectivo" &&
            item.tipoComprobante === "E",
          "importe"
        ),
        contador: tabla.filter(
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago === "01 | Efectivo" &&
            item.tipoComprobante === "E"
        ).length,
      };
      const ncOtros = {
        concepto: "NC | Otros",
        base: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago != "01 | Efectivo" &&
            item.tipoComprobante === "E",
          "base_"
        ),
        importe: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago != "01 | Efectivo" &&
            item.tipoComprobante === "E",
          "importe"
        ),
        contador: tabla.filter(
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago != "01 | Efectivo" &&
            item.tipoComprobante === "E"
        ).length,
      };

      //
      const ncSum = {
        concepto: "NC",
        base: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.tipoComprobante === "E",
          "base_"
        ),
        importe: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.tipoComprobante === "E",
          "importe"
        ),
        contador: tabla.filter(
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.tipoComprobante === "E",
          "importe"
        ).length,
      };
      const espacio = { concepto: "", base: "", importe: "" };
      const total = {
        concepto: "Total",
        base:
          this.sumarPropiedad(
            tabla,
            (item) => item.tipoComprobante != "E",
            "base_"
          ) + ncSum.base,
        importe: pueSum.importe + ppdSum.importe + ncSum.importe,
        contador: tabla.length,
      };

      let result = [];
      pueEfectivo.contador != 0 && result.push(pueEfectivo);
      pueOtros.contador != 0 && result.push(pueOtros);
      pueSum.contador != 0 && result.push(pueSum);
      pueSum.contador != 0 && result.push(espacio); // QUITAR ESTO
      ppdEfectivoAño.contador != 0 && result.push(ppdEfectivoAño);
      ppdOtrosAño.contador != 0 && result.push(ppdOtrosAño);
      ppdEfectivoAnterior.contador != 0 && result.push(ppdEfectivoAnterior);
      ppdOtrosAnterior.contador != 0 && result.push(ppdOtrosAnterior);
      ppdSum.contador != 0 && result.push(ppdSum);
      ppdSum.contador != 0 && result.push(espacio);
      ncEfectivo.contador != 0 && result.push(ncEfectivo);
      ncOtros.contador != 0 && result.push(ncOtros);
      ncSum.contador != 0 && result.push(ncSum);
      ncSum.contador != 0 && result.push(espacio);
      total.contador != 0 && result.push(total);
      return result;
    },

    comparativaExento() {
      const tabla = [
        ...this.$store.state.detallesIvaMensualExentoStore.detalles,
      ];

      if (tabla.length === 0) {
        return [];
      }

      const añoBuscado = new Date(tabla[0].fecha).getFullYear();
      const pueEfectivo = {
        concepto: "PUE | Efectivo",
        base: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago === "01 | Efectivo" &&
            item.tipoComprobante === "I",
          "base_"
        ),
        importe: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago === "01 | Efectivo" &&
            item.tipoComprobante === "I",
          "importe"
        ),
        contador: tabla.filter(
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago === "01 | Efectivo" &&
            item.tipoComprobante === "I"
        ).length,
      };
      const pueOtros = {
        concepto: "PUE | Otros",
        base: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago != "01 | Efectivo" &&
            item.tipoComprobante === "I",
          "base_"
        ),
        importe: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago != "01 | Efectivo" &&
            item.tipoComprobante === "I",
          "importe"
        ),
        contador: tabla.filter(
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago != "01 | Efectivo" &&
            item.tipoComprobante === "I",
          "importe"
        ).length,
      };

      //
      const pueSum = {
        concepto: "PUE",
        base: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.tipoComprobante === "I",
          "base_"
        ),
        importe: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.tipoComprobante === "I",
          "importe"
        ),
        contador: tabla.filter(
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.tipoComprobante === "I",
          "importe"
        ).length,
      };
      const ppdEfectivoAño = {
        concepto: "PPD | Efectivo del periodo",
        base: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago === "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() === añoBuscado,
          "base_"
        ),
        importe: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago === "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() === añoBuscado,
          "importe"
        ),
        contador: tabla.filter(
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago === "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() === añoBuscado
        ).length,
      };
      const ppdOtrosAño = {
        concepto: "PPD | Otros del periodo",
        base: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago != "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() === añoBuscado,
          "base_"
        ),
        importe: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago != "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() === añoBuscado,
          "importe"
        ),
        contador: tabla.filter(
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago != "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() === añoBuscado
        ).length,
      };
      const ppdEfectivoAnterior = {
        concepto: "PPD | Efectivo de periodos anteriores",
        base: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago === "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() != añoBuscado,
          "base_"
        ),
        importe: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago === "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() != añoBuscado,
          "importe"
        ),
        contador: tabla.filter(
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago === "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() != añoBuscado
        ).length,
      };
      const ppdOtrosAnterior = {
        concepto: "PPD | Otros de periodos anteriores",
        base: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago != "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() != añoBuscado,
          "base_"
        ),
        importe: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago != "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() != añoBuscado,
          "importe"
        ),
        contador: tabla.filter(
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido" &&
            item.formaPago != "01 | Efectivo" &&
            new Date(item.fecha).getFullYear() != añoBuscado
        ).length,
      };

      //
      const ppdSum = {
        concepto: "PPD",
        base: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido",
          "base_"
        ),
        importe: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PPD | Pago en parcialidades o diferido",
          "importe"
        ),
        contador: tabla.filter(
          (item) => item.metodoPago === "PPD | Pago en parcialidades o diferido"
        ).length,
      };
      const ncEfectivo = {
        concepto: "NC | Efectivo",
        base: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago === "01 | Efectivo" &&
            item.tipoComprobante === "E",
          "base_"
        ),
        importe: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago === "01 | Efectivo" &&
            item.tipoComprobante === "E",
          "importe"
        ),
        contador: tabla.filter(
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago === "01 | Efectivo" &&
            item.tipoComprobante === "E"
        ).length,
      };
      const ncOtros = {
        concepto: "NC | Otros",
        base: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago != "01 | Efectivo" &&
            item.tipoComprobante === "E",
          "base_"
        ),
        importe: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago != "01 | Efectivo" &&
            item.tipoComprobante === "E",
          "importe"
        ),
        contador: tabla.filter(
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.formaPago != "01 | Efectivo" &&
            item.tipoComprobante === "E"
        ).length,
      };

      //
      const ncSum = {
        concepto: "NC",
        base: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.tipoComprobante === "E",
          "base_"
        ),
        importe: this.sumarPropiedad(
          tabla,
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.tipoComprobante === "E",
          "importe"
        ),
        contador: tabla.filter(
          (item) =>
            item.metodoPago === "PUE | Pago en una sola exhibición" &&
            item.tipoComprobante === "E",
          "importe"
        ).length,
      };
      const espacio = { concepto: "", base: "", importe: "" };
      const total = {
        concepto: "Total",
        base:
          this.sumarPropiedad(
            tabla,
            (item) => item.tipoComprobante != "E",
            "base_"
          ) + ncSum.base,
        importe: pueSum.importe + ppdSum.importe + ncSum.importe,
        contador: tabla.length,
      };

      let result = [];
      pueEfectivo.contador != 0 && result.push(pueEfectivo);
      pueOtros.contador != 0 && result.push(pueOtros);
      pueSum.contador != 0 && result.push(pueSum);
      pueSum.contador != 0 && result.push(espacio); // QUITAR ESTO
      ppdEfectivoAño.contador != 0 && result.push(ppdEfectivoAño);
      ppdOtrosAño.contador != 0 && result.push(ppdOtrosAño);
      ppdEfectivoAnterior.contador != 0 && result.push(ppdEfectivoAnterior);
      ppdOtrosAnterior.contador != 0 && result.push(ppdOtrosAnterior);
      ppdSum.contador != 0 && result.push(ppdSum);
      ppdSum.contador != 0 && result.push(espacio);
      ncEfectivo.contador != 0 && result.push(ncEfectivo);
      ncOtros.contador != 0 && result.push(ncOtros);
      ncSum.contador != 0 && result.push(ncSum);
      ncSum.contador != 0 && result.push(espacio);
      total.contador != 0 && result.push(total);
      return result;
    },
  },
  created() {},
  methods: {
    formatCurrency(value) {
      try {
        return value.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        });
      } catch (error) {
        return "";
      }
    },

    formatNumber(value) {
      return value.toLocaleString("en-US");
    },

    formatmiles(value) {
      try {
        const formato = value.toLocaleString("es-MX", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        });
        return formato;
      } catch (error) {
        return "";
      }
    },

    formatDate(value) {
      let fecha_ = value.replace("T", " ");
      let fecha_1 = fecha_.replace("Z", " ");
      let listo = new Date(fecha_1);
      moment.locale("es-mx");
      return moment(listo).format("DD-MMMM-YYYY HH:mm:ss");
    },

    CloseDialog() {
      this.$emit("CloseDialogDetalles");
    },

    ExportExcel() {
      const workbook = XLSX.utils.book_new();

      const sheetItem16 = XLSX.utils.json_to_sheet(this.item16.detalles);
      const sheetItem8 = XLSX.utils.json_to_sheet(this.item8.detalles);
      const sheetItem0 = XLSX.utils.json_to_sheet(this.item0.detalles);
      const sheetExento = XLSX.utils.json_to_sheet(this.itemExento.detalles);

      XLSX.utils.book_append_sheet(workbook, sheetItem16, "IVA 16%");
      XLSX.utils.book_append_sheet(workbook, sheetItem8, "IVA 8%");
      XLSX.utils.book_append_sheet(workbook, sheetItem0, "IVA 0%");
      XLSX.utils.book_append_sheet(workbook, sheetExento, "IVA Exento");

      const { mes, año } = this.ObtenerMesYAño(this.item16.detalles[0].fecha);
      //   console.log(typeof mes);
      //   console.log(typeof año);

      XLSX.writeFile(
        workbook,
        this.token.rfc +
          "|" +
          mes.toUpperCase() +
          "|" +
          año +
          "|" +
          this.item16.cabecera +
          ".xlsx"
      );
    },

    ExportExcelComparativa() {
      const workbook = XLSX.utils.book_new();

      const detalles16 = this.comparativa16;
      const detalles8 = this.comparativa8;
      const detalles0 = this.comparativa0;
      const detallesExento = this.comparativaExento;

      const sheetItem16 = XLSX.utils.json_to_sheet(detalles16);
      const sheetItem8 = XLSX.utils.json_to_sheet(detalles8);
      const sheetItem0 = XLSX.utils.json_to_sheet(detalles0);
      const sheetItemExento = XLSX.utils.json_to_sheet(detallesExento);

      XLSX.utils.book_append_sheet(workbook, sheetItem16, "IVA 16%");
      XLSX.utils.book_append_sheet(workbook, sheetItem8, "IVA 8%");
      XLSX.utils.book_append_sheet(workbook, sheetItem0, "IVA 0%");
      XLSX.utils.book_append_sheet(workbook, sheetItemExento, "IVA Exento");

      console.log(detalles16);

      const { mes, año } = this.ObtenerMesYAño(this.item16.detalles[0].fecha);

      XLSX.writeFile(
        workbook,
        this.token.rfc +
          "|" +
          mes.toUpperCase() +
          "|" +
          año +
          "|" +
          "RESUMEN" +
          ".xlsx"
      );
    },

    ObtenerMesYAño(value) {
      let fecha_ = value.replace("T", " ");
      let fecha_1 = fecha_.replace("Z", " ");
      let listo = new Date(fecha_1);

      moment.locale("es-mx");
      let mes = moment(listo).format("MMMM");
      let año = moment(listo).format("YYYY");

      return { mes, año };
    },

    async VerComprobante(item) {
      if (this.itemExento.cabecera === "Comprobantes IVA Trasladado") {
        await this.VerComprobanteIngresos(item);
      }
      if (this.itemExento.cabecera === "Comprobantes IVA Acreditado") {
        await this.VerComprobanteGastos(item);
      }
      //if (this.items.cabecera === 'Comprobantes IVA Trasladado') {
      //    await this.VerComprobanteGastos(item);
      //}
      if (this.item16.cabecera === "IVA Retenido") {
        await this.VerComprobanteGastos(item);
      }
    },

    async VerComprobanteIngresos(item) {
      try {
        this.$store.state.vistaPreviaStore.folioFiscal = item.folioFiscal;
        this.$store.state.vistaPreviaStore.color = "19775C";
        this.$store.state.vistaPreviaStore.tipoComprobanteInterno = "FACTURA";
        this.$store.state.vistaPreviaStore.tipo = "E";
        this.$store.state.vistaPreviaStore.rfc = this.token.rfc;
        this.dialogDetalles = true;
      } catch (error) {
        console.log(error);
      }
    },

    async VerComprobanteGastos(item) {
      try {
        this.$store.state.vistaPreviaStore.folioFiscal = item.folioFiscal;
        this.$store.state.vistaPreviaStore.color = "19775C";
        this.$store.state.vistaPreviaStore.tipoComprobanteInterno = "FACTURA";
        this.$store.state.vistaPreviaStore.tipo = "R";
        this.$store.state.vistaPreviaStore.rfc = this.token.rfc;
        this.dialogDetalles = true;
      } catch (error) {
        console.log(error);
      }
    },

    CloseDialogPdf() {
      this.dialogDetalles = false;
    },

    abrirDialogLista69B() {
      this.dialogLista69B = true;
    },

    sumarPropiedad(lista, filtroFn, propiedad) {
      return lista
        .filter(filtroFn)
        .reduce((total, item) => total + (item[propiedad] || 0), 0);
    },

    getRowClass(props) {
      if (props.row.concepto === "") {
        return;
      }
      if (
        props.row.concepto === "PUE" ||
        props.row.concepto === "PPD" ||
        props.row.concepto === "NC"
      ) {
        return "bg-red-2 text-black";
      }

      if (props.row.concepto === "Total") {
        return "bg-red-5 text-black text-bold text-h3 h3 last-row";
      }

      return "";
    },
  },
};
</script>
<style>
.my-card {
  width: 100%;
}

.last-row td {
  font-size: 16px !important;
}
</style>
