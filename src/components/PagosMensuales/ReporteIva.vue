<template>
    <div class="q-pa-md">
        <!-- DIALOG -->
        <q-dialog v-model="dialog" persistent transition-show="scale" transition-hide="scale">
            <q-card style="width: 200px">
                <q-card-section>
                    <div class="row justify-center">
                        <span>{{ dialogtext }}</span>
                        <q-spinner-dots color="primary" size="lg" />
                    </div>
                </q-card-section>
            </q-card>
        </q-dialog>

        <!-- DIALOG DE LOS DETALLES -->
        <q-dialog v-model="dialogDetalles" persistent transition-show="scale" transition-hide="scale" maximized>
            <detalles @CloseDialogDetalles="CloseDialogDetalles"></detalles>
        </q-dialog>

        <!-- DIALOG DE LA COMPARATIVA -->
        <q-dialog v-model="dialogComparativa" persistent transition-show="scale" transition-hide="scale">
            <comparativa @CloseDialogDetalles="CloseDialogDetalles"></comparativa>
        </q-dialog>

        <!-- DIALOG DE LA DIFERENCIA DE IMPUESTOS -->
        <q-dialog v-model="dialogDiferenciaimpuestos" persistent transition-show="scale" transition-hide="scale"
            maximized>
            <q-card>
                <q-toolbar>
                    <q-toolbar-title>Detalle impuestos entre comprobante y complemento de pago</q-toolbar-title>
                    <q-btn flat round dense icon="close" v-close-popup />
                </q-toolbar>
                <div style="width: 100%; height: 4px; background-color: red;"></div>
                <!-- APARTADO DEL RESUMEN PARA INFORMACION -->
                <q-card-section>
                    <div class="text-h6 text-center">{{objImpComprobante.nombre}}</div>
                    <div class="text-subtitle2 text-center">{{objImpComprobante.rfc}}</div>
                    <div class="row">
                        <div class="col">
                            <q-card class="full-width">
                                <q-card-section>
                                    <div class="text-h6 text-center">Comprobante</div>
                                    <span class="text-weight-bold">Serie: </span> {{objImpComprobante.serie}}
                                    <br>
                                    <span class="text-weight-bold">Folio: </span> {{objImpComprobante.folio}}
                                    <br>
                                    <span class="text-weight-bold">Fecha: </span>
                                    {{FormatoFecha(objImpComprobante.fecha)}}
                                    <br>
                                    <span class="text-weight-bold">Total: </span>
                                    {{FormatCurrency(objImpComprobante.total)}}
                                    <br>
                                    <!-- <span class="text-weight-bold">Folio fiscal: </span> {{objImpComprobante.folioFiscal}} -->
                                    <span class="text-weight-bold">Folio fiscal: </span>
                                    <span @click="pdfComprobanteIva(objImpComprobante.folioFiscal)"
                                        class="cursor-pointer text-blue">
                                        {{ objImpComprobante.folioFiscal }}
                                    </span>
                                </q-card-section>
                            </q-card>
                        </div>
                        <div class="col">
                            <q-card class="full-width">
                                <q-card-section>
                                    <div class="text-h6 text-center">Pago</div>
                                    <span class="text-weight-bold">Serie: </span> {{objImpPago.serie}}
                                    <br>
                                    <span class="text-weight-bold">Folio: </span> {{objImpPago.folio}}
                                    <br>
                                    <span class="text-weight-bold">Fecha de pago: </span>
                                    {{FormatoFecha(objImpPago.fecha)}}
                                    <br>
                                    <span class="text-weight-bold">Importe pagado: </span>
                                    {{FormatCurrency(objImpPago.total)}}
                                    <br>
                                    <!-- <span class="text-weight-bold">Folio fiscal: </span> {{objImpPago.folioFiscal}} -->
                                    <span class="text-weight-bold">Folio fiscal: </span>
                                    <span @click="pdfPagoIva(objImpPago.folioFiscal)" class="cursor-pointer text-blue">
                                        {{ objImpPago.folioFiscal }}
                                    </span>
                                </q-card-section>
                            </q-card>
                        </div>
                    </div>
                </q-card-section>
                <q-card-section>
                    <div class="text-h6 text-center">Porcentaje del pago</div>
                    <div class="text-subtitle2 text-center">{{objImpComprobante.porcentaje}}</div>
                </q-card-section>
                <q-card-section>
                    <div class="text-h6 text-center">Importe en IVA</div>
                    <div class="text-subtitle2 text-center">
                        {{FormatCurrency(objImpComprobante.importeIva)}}
                    </div>
                </q-card-section>
                <!-- TABA CON LOS IMPUESTOS -->
                <q-card-section>
                    <q-table table-class="primary lighten-5" :data="dataDiferenciaimpuestosComprobante"
                        :columns="columnsDiferenciaimpuestosDet" row-key="dia" :rows-per-page-options="[10]">
                        <template v-slot:top>
                            <span class="text-body1" content-style="font-size: 20px">Impuestos comprobante</span>
                            <q-space />
                        </template>
                        <template v-slot:body="props">
                            <q-tr :props="props">
                                <q-td key="base_" :props="props">{{ FormatCurrency(props.row.base_) }}</q-td>
                                <q-td key="impuesto" :props="props">{{ props.row.impuesto }}</q-td>
                                <q-td key="tipoFactor" :props="props">{{ props.row.tipoFactor }}</q-td>
                                <q-td key="tasaOcuota" :props="props">{{ props.row.tasaOcuota }}</q-td>
                                <q-td key="importe" :props="props">{{ FormatCurrency(props.row.importe) }}</q-td>
                                </q-td>
                            </q-tr>
                        </template>
                    </q-table>
                    <br>
                    <q-table table-class="primary lighten-5" :data="dataDiferenciaimpuestosPagos"
                        :columns="columnsDiferenciaimpuestosDet" row-key="dia" :rows-per-page-options="[10]">
                        <template v-slot:top>
                            <span class="text-body1" content-style="font-size: 20px">Impuestos complemento de
                                pago</span>
                            <q-space />
                        </template>
                        <template v-slot:body="props">
                            <q-tr :props="props">
                                <q-td key="base_" :props="props">{{ FormatCurrency(props.row.base_) }}</q-td>
                                <q-td key="impuesto" :props="props">{{ props.row.impuesto }}</q-td>
                                <q-td key="tipoFactor" :props="props">{{ props.row.tipoFactor }}</q-td>
                                <q-td key="tasaOcuota" :props="props">{{ props.row.tasaOcuota }}</q-td>
                                <q-td key="importe" :props="props">{{ FormatCurrency(props.row.importe) }}</q-td>
                                </q-td>
                            </q-tr>
                        </template>
                    </q-table>
                </q-card-section>
            </q-card>
        </q-dialog>

        <!-- DIALOG PARA VER LOS PDF -->
        <q-dialog v-model="dialogPdf" persistent transition-show="scale" transition-hide="scale" maximized>
            <visor-pdf @CloseDialogPdf="dialogPdf=false"></visor-pdf>
        </q-dialog>

        <!-- SELECCIONA AÑO Y MES, BOTON DE BUSCAR Y EXPORTAR A EXCEL -->
        <div class="row no-wrap items-center q-mt-md q-pa-sm">
            <q-space />
            <q-select outlined dense v-model="selectedAnio" :options="itemsAnios" label="Año" style="width:80px"
                class="q-mr-xs" />
            <q-select outlined dense v-model="selectedMes" :options="itemsMes" label="Mes" style="width:136px"
                class="q-mr-xs" />
            <q-btn push color="amber-9" @click="GetReporte" icon="mdi-text-box-search-outline" rounded flat size="18px"
                padding="xs">
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                    :offset="[10, 10]">Consultar</q-tooltip>
            </q-btn>
            <q-btn push color="green-10" @click="ExportExcel" icon="mdi-file-excel-box-outline" rounded flat size="18px"
                padding="xs">
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                    :offset="[10, 10]">Exportar Excel</q-tooltip>
            </q-btn>
            <!-- <q-btn push color="blue-10" @click="GetReporteIvaExento" icon="mdi-file-excel-box-outline" rounded flat
                size="18px" padding="xs">
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                    :offset="[10, 10]">Paso para el ivaexento</q-tooltip>
            </q-btn> -->
            <q-space />
        </div>
        <!-- TABLA PAGOS DE IVA -->
        <q-table table-class="primary lighten-5" title="Reporte ISR" :data="dataComprobantes" :columns="columns"
            row-key="dia" :rows-per-page-options="[13]">
            <template v-slot:top>
                <span class="text-body1" content-style="font-size: 20px">Pagos de IVA</span>
                <q-space />
                <!-- <q-btn push color="blue-7" @click="OpenNotas(1)" icon="mdi-information-outline" rounded flat size="18px"
                    padding="xs">
                    <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                        :offset="[10, 10]">Información</q-tooltip>
                </q-btn> -->
                <q-btn push color="green-14" @click="OpenComparativa()" icon="mdi-compare" rounded flat size="18px"
                    padding="xs">
                    <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                        :offset="[10, 10]">Comparativa</q-tooltip>
                </q-btn>
                <!-- COMPARATIVA POR TASA -->
                <q-fab v-model="fabIva" label="Importe por tasa" vertical-actions-align="left" color="blue-6"
                    icon="keyboard_arrow_down" direction="down" padding="none xl">
                    <q-fab-action color="blue-6" @click="OpenComparativaSat('16')" label="IVA 16%" />
                    <q-fab-action color="blue-6" @click="OpenComparativaSat('8')" label="IVA 8%" />
                    <q-fab-action color="blue-6" @click="OpenComparativaSat('0')" label="IVA 0%" />
                    <q-fab-action color="blue-6" @click="OpenComparativaSat('exento')" label="IVA Exento" />
                </q-fab>
            </template>
            <template v-slot:body="props">
                <q-tr :props="props" :class="'clase-total-' + props.row.año">
                    <q-td key="año" :props="props">{{ props.row.año }}</q-td>
                    <q-td key="mes" :props="props">{{ props.row.mes }}</q-td>

                    <q-td key="baseIvaTrasladado" :props="props">{{ FormatCurrency(props.row.baseIvaTrasladado)
                        }}</q-td>
                    <q-td key="importeIvaTrasladado" :props="props">{{
                        FormatCurrency(props.row.importeIvaTrasladado) }}</q-td>

                    <q-td auto-width>
                        <q-btn size="md" color="primary" rounded flat dense
                            @click="VerDetalles(props.row, 'Comprobantes IVA Trasladado')"
                            icon="mdi-format-list-bulleted">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Detalles</q-tooltip>
                        </q-btn>
                    </q-td>

                    <!-- CASO PARA IVA EXENTO -->
                    <template v-if="banderaExento">
                        <q-td key="porcentajeExento" :props="props">{{ FormatoCantidad(props.row.porcentajeExento)
                            }}</q-td>
                    </template>

                    <q-td key="baseIvaAcreditado" :props="props">{{ FormatCurrency(props.row.baseIvaAcreditado)
                        }}</q-td>
                    <q-td key="importeIvaAcreditado" :props="props">{{ FormatCurrency(props.row.importeIvaAcreditado)
                        }}</q-td>

                    <q-td auto-width>
                        <q-btn size="md" color="primary" rounded flat dense
                            @click="VerDetalles(props.row, 'Comprobantes IVA Acreditado')"
                            icon="mdi-format-list-bulleted">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Detalles</q-tooltip>
                        </q-btn>
                    </q-td>

                    <q-td key="ivaRetenido" :props="props">{{ FormatCurrency(props.row.ivaRetenido)
                        }}</q-td>
                    <q-td key="ivaRetenidoAnterior" :props="props">{{ FormatCurrency(props.row.ivaRetenidoAnterior)
                        }}</q-td>

                    <q-td key="ivaCargo" :props="props">{{ FormatCurrency(props.row.ivaCargo) }}</q-td>
                    <q-td key="ivaFavor" :props="props">{{ FormatCurrency(props.row.ivaFavor) }}</q-td>

                    <q-td key="cargoRegistrado" :props="props">{{ FormatCurrency(props.row.cargoRegistrado) }}</q-td>
                    <q-td key="favorRegistrado" :props="props">{{ FormatCurrency(props.row.favorRegistrado) }}</q-td>
                    <q-td key="comparativa" :props="props">{{ FormatCurrency(props.row.comparativa) }}</q-td>
                </q-tr>
            </template>

        </q-table>
        <br>
        <!-- TABLA DIFERENCIA IMPUESTOS-->
        <q-table table-class="primary lighten-5" title="diferenciaimpuestos" :data="dataDiferenciaimpuestos"
            :columns="columnsDiferenciaimpuestos" row-key="dia" :rows-per-page-options="[10]">
            <template v-slot:top>
                <span class="text-body1" content-style="font-size: 20px">Diferencia de Impuestos entre Pagos y
                    Comprobantes</span>
                <q-space />
            </template>
            <template v-slot:body="props">
                <q-tr :props="props">
                    <q-td auto-width>
                        <q-btn size="md" color="primary" rounded flat dense @click="DetalleImpuestos(props.row)"
                            icon="mdi-format-list-bulleted">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Detalles</q-tooltip>
                        </q-btn>
                    </q-td>
                    <q-td key="serie" :props="props">{{ props.row.serie }}</q-td>
                    <q-td key="folio" :props="props">{{ props.row.folio }}</q-td>
                    <q-td key="rfc" :props="props">{{ props.row.rfc }}</q-td>
                    <q-td key="nombre" :props="props">{{ props.row.nombre }}</q-td>
                    <q-td key="fecha" :props="props">{{ props.row.fecha }}</q-td>
                    <q-td key="cuentaIva" :props="props">{{ props.row.cuentaIva }}</q-td>
                    <q-td key="total" :props="props">{{ FormatCurrency(props.row.total) }}</q-td>
                    <q-td key="folioFiscal" :props="props">{{ props.row.folioFiscal }}</q-td>
                    <q-td key="serieP" :props="props">{{ props.row.serieP }}</q-td>
                    <q-td key="folioP" :props="props">{{ props.row.folioP }}</q-td>
                    <q-td key="fechaP" :props="props">{{ props.row.fechaP }}</q-td>
                    <q-td key="cuentaIvaP" :props="props">{{ props.row.cuentaIvaP }}</q-td>
                    <q-td key="totalP" :props="props">{{ FormatCurrency(props.row.totalP) }}</q-td>
                    <q-td key="folioFiscalP" :props="props">{{ props.row.folioFiscalP }}</q-td>
                    </q-td>
                </q-tr>
            </template>

        </q-table>
        <!-- GRAFICA-->
        <q-card style="width: 100%;" class="full-width q-mt-lg">
            <chart-component :chartData="chartData" :chartTitle="charTitleE"></chart-component>
        </q-card>
    </div>
</template>
<script>
    import axios from 'axios';
    import moment from 'moment';
    import * as xlsx from 'xlsx';
    import detalles from './ReporteIvaDetalles.vue'
    import Comparativa from '../Comparativas/ComparativaIva.vue';
    import { QSpinnerCube } from 'quasar';
    import ChartComponent from "../Graficas/ChartComponent.vue";
    import { format } from "date-fns";
    import { es } from "date-fns/locale";
    import visorPdf from '../Pdf/VisorPdf.vue'

    export default {
        components: {
            detalles,
            ChartComponent,
            Comparativa,
            visorPdf,
        },
        data() {
            return {
                itemsAnios: ['2026','2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018'],
                itemsMes: [
                    { label: 'ENERO', value: 1 },
                    { label: 'FEBRERO', value: 2 },
                    { label: 'MARZO', value: 3 },
                    { label: 'ABRIL', value: 4 },
                    { label: 'MAYO', value: 5 },
                    { label: 'JUNIO', value: 6 },
                    { label: 'JULIO', value: 7 },
                    { label: 'AGOSTO', value: 8 },
                    { label: 'SEPTIEMBRE', value: 9 },
                    { label: 'OCTUBRE', value: 10 },
                    { label: 'NOVIEMBRE', value: 11 },
                    { label: 'DICIEMBRE', value: 12 },
                ],

                selectedAnio: null,
                selectedMes: null,

                columns: [],
                columnsDefault: [
                    { name: 'año', align: 'left', label: 'Año', field: 'año' },
                    { name: 'mes', align: 'left', label: 'Mes', field: 'mes' },
                    { name: 'baseIvaTrasladado', align: 'right', label: 'Base IVA Trasladado', field: 'baseIvaTrasladado' },
                    { name: 'importeIvaTrasladado', align: 'right', label: 'Importe IVA Trasladado', field: 'importeIvaTrasladado' },
                    { name: 'accionesT', align: 'left', label: 'Acciones', field: 'accionesT' },
                    { name: 'baseIvaAcreditado', align: 'right', label: 'Base IVA Acreditado', field: 'baseIvaAcreditado' },
                    { name: 'importeIvaAcreditado', align: 'right', label: 'Importe IVA Acreditado', field: 'importeIvaAcreditado' },
                    { name: 'accionesA', align: 'left', label: 'Acciones', field: 'accionesA' },
                    { name: 'ivaRetenido', align: 'right', label: 'IVA Retenido', field: 'ivaRetenido' },
                    { name: 'ivaRetenidoAnterior', align: 'right', label: 'IVA Retenido Anterior', field: 'ivaRetenidoAnterior' },
                    { name: 'ivaCargo', align: 'right', label: 'IVA a Cargo', field: 'ivaCargo', headerClasses: 'bg-primary text-white', classes: 'bg-red-2 text-black text-right ellipsis ' },
                    { name: 'ivaFavor', align: 'right', label: 'IVA a Favor', field: 'ivaFavor', headerClasses: 'bg-primary text-white', classes: 'bg-red-2 text-black text-right ellipsis ' },
                    { name: 'cargoRegistrado', align: 'right', label: 'Cargo Registrado', field: 'cargoRegistrado', headerClasses: 'bg-green-14 text-white', classes: 'bg-green-2 text-black text-right ellipsis ' },
                    { name: 'favorRegistrado', align: 'right', label: 'Favor Registrado', field: 'favorRegistrado', headerClasses: 'bg-green-14 text-white', classes: 'bg-green-2 text-black text-right ellipsis ' },
                    { name: 'comparativa', align: 'right', label: 'Comparativa', field: 'comparativa' },
                ],

                columnsExento: [
                    { name: 'año', align: 'left', label: 'Año', field: 'año' },
                    { name: 'mes', align: 'left', label: 'Mes', field: 'mes' },
                    { name: 'baseIvaTrasladado', align: 'right', label: 'Base IVA Trasladado', field: 'baseIvaTrasladado' },
                    { name: 'importeIvaTrasladado', align: 'right', label: 'Importe IVA Trasladado', field: 'importeIvaTrasladado' },
                    { name: 'accionesT', align: 'left', label: 'Acciones', field: 'accionesT' },
                    { name: 'porcentajeExento', align: 'right', label: 'Porcentaje IVA Exento', field: 'porcentajeExento' },
                    { name: 'baseIvaAcreditado', align: 'right', label: 'Base IVA Acreditado', field: 'baseIvaAcreditado' },
                    { name: 'importeIvaAcreditado', align: 'right', label: 'Importe IVA Acreditado', field: 'importeIvaAcreditado' },
                    { name: 'accionesA', align: 'left', label: 'Acciones', field: 'accionesA' },
                    { name: 'ivaRetenido', align: 'right', label: 'IVA Retenido', field: 'ivaRetenido' },
                    { name: 'ivaRetenidoAnterior', align: 'right', label: 'IVA Retenido Anterior', field: 'ivaRetenidoAnterior' },
                    { name: 'ivaCargo', align: 'right', label: 'IVA a Cargo', field: 'ivaCargo', headerClasses: 'bg-primary text-white', classes: 'bg-red-2 text-black text-right ellipsis ' },
                    { name: 'ivaFavor', align: 'right', label: 'IVA a Favor', field: 'ivaFavor', headerClasses: 'bg-primary text-white', classes: 'bg-red-2 text-black text-right ellipsis ' },
                    { name: 'cargoRegistrado', align: 'right', label: 'Cargo Registrado', field: 'cargoRegistrado', headerClasses: 'bg-green-14 text-white', classes: 'bg-green-2 text-black text-right ellipsis ' },
                    { name: 'favorRegistrado', align: 'right', label: 'Favor Registrado', field: 'favorRegistrado', headerClasses: 'bg-green-14 text-white', classes: 'bg-green-2 text-black text-right ellipsis ' },
                    { name: 'comparativa', align: 'right', label: 'Comparativa', field: 'comparativa' },
                ],
                dataComprobantes: [],

                //DATOS DE CARGANDO
                dialog: false,
                dialogtext: '',

                //DATOS DE LOS DETALLES
                dialogDetalles: false,

                //DATOS DE LA COMPARATAIVA
                dialogComparativa: false,

                //CASO PARA IVA EXENTO
                banderaExento: false,

                charTitleE: 'Pagos de IVA',
                chartData: null,

                //IMPUESTOS COMPROBANTES PAGOS
                dialogDiferenciaimpuestos: false,
                dataDiferenciaimpuestosComprobante: [],
                dataDiferenciaimpuestosPagos: [],
                dataDiferenciaimpuestos: [],
                columnsDiferenciaimpuestos:
                    [
                        { name: 'acciones', align: 'left', label: 'Acciones', field: 'acciones' },
                        { name: 'serie', align: 'left', label: 'Serie', field: 'serie' },
                        { name: 'folio', align: 'left', label: 'Folio', field: 'folio' },
                        { name: 'rfc', align: 'left', label: 'RFC', field: 'rfc' },
                        { name: 'nombre', align: 'left', label: 'Nombre', field: 'nombre' },
                        { name: 'fecha', align: 'left', label: 'Fecha', field: 'fecha' },
                        { name: 'cuentaIva', align: 'center', label: '# Trasladados', field: 'cuentaIva' },
                        { name: 'total', align: 'right', label: 'Total', field: 'total' },
                        { name: 'folioFiscal', align: 'left', label: 'Folio fiscal', field: 'folioFiscal' },
                        { name: 'serieP', align: 'left', label: 'Serie pago', field: 'serieP' },
                        { name: 'folioP', align: 'left', label: 'Folio pago', field: 'folioP' },
                        { name: 'fechaP', align: 'left', label: 'Fecha pago', field: 'fechaP' },
                        { name: 'cuentaIvaP', align: 'center', label: '# Trasladados', field: 'cuentaIvaP' },
                        { name: 'totalP', align: 'right', label: 'Total pago', field: 'totalP' },
                        { name: 'folioFiscalP', align: 'left', label: 'Folio fiscal pago', field: 'folioFiscalP' },
                    ],
                columnsDiferenciaimpuestosDet:
                    [
                        { name: 'base_', align: 'right', label: 'Base', field: 'base_' },
                        { name: 'impuesto', align: 'left', label: 'Impuesto', field: 'impuesto' },
                        { name: 'tipoFactor', align: 'left', label: 'Tipo de factor', field: 'tipoFactor' },
                        { name: 'tasaOcuota', align: 'left', label: 'Tasa o cuota', field: 'tasaOcuota' },
                        { name: 'importe', align: 'right', label: 'Importe', field: 'importe' },
                    ],
                dataImpuestosComprobante: [],
                objImpComprobante: {
                    rfc: "",
                    nombre: "",
                    serie: "",
                    folio: "",
                    fecha: new Date(),
                    total: 0,
                    folioFiscal: "",
                    porcentaje: "",
                    importeIva: 0,
                },
                objImpPago: {
                    serie: "",
                    folio: "",
                    fecha: new Date(),
                    total: 0,
                    folioFiscal: "",
                },

                dialogPdf: false,

                //REGISTROS DEL IVA
                fabIva: false,
                ivaSat16: null,
                ivaSat8: null,
                ivaSat0: null,
                ivaSatExento: null,
            }
        },
        computed: {
            token() {
                return this.$store.state.usuario;
            },

            sumTotal() {
                let suma = this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.total, 0);
                let resultado = this.FormatCurrency(suma);
                return resultado;
            },

            rutaAxios() {
                return this.$store.state.rutaMongoStore
            },

            comparativa() {
                return this.$store.state.comparativaStore;
            },

        },
        created() {

        },

        methods: {
            async GetReporte() {
                //VALIDAMOS 
                if (!this.selectedAnio) {
                    this.ShowNotifsWarning('Seleccione el año');
                    return;
                }

                if (!this.selectedMes) {
                    this.ShowNotifsWarning('Seleccione el mes');
                    return;
                }

                //CONSULTAMOS LOS REGISTROS PREVIOS
                const respuesta16 = await this.GetComparativa(this.selectedAnio, 'IVA_visor_sat_16');
                const respuesta8 = await this.GetComparativa(this.selectedAnio, 'IVA_visor_sat_8');
                const respuesta0 = await this.GetComparativa(this.selectedAnio, 'IVA_visor_sat_0');
                const respuestaExento = await this.GetComparativa(this.selectedAnio, 'IVA_visor_sat_exento');
                this.ivaSat16 = respuesta16;
                this.ivaSat8 = respuesta8;
                this.ivaSat0 = respuesta0;
                this.ivaSatExento = respuestaExento;


                if (this.selectedAnio < 2024) {
                    // console.log('aqui 1')
                    const ivaCargo = await this.GetIvaTrasladado();
                    await this.GetReporteIva(ivaCargo);
                } else {
                    // console.log('aqui 2')
                    await this.GetReporteIva2024();
                }

                await this.GetReporteIvaPagosImpuestos();
                // console.log(this.dataComprobantes)
            },

            async GetReporteIva(ivaCargo) {
                try {
                    this.columns = [...this.columnsDefault]
                    this.dataComprobantes = [];
                    this.$q.loading.show({
                        spinner: QSpinnerCube,
                        spinnerColor: 'red-8',
                        spinnerSize: 140,
                        message: 'Consultando datos, espere...',
                    })

                    // let ivaCargo = await this.GetIvaTrasladado();
                    let ivaAcreditable = await this.GetIvaAcreditado()
                    let ivaRetenido = await this.GetIvaRetenido();
                    console.log("iva ret a",ivaRetenido);
                    let comparativa = await this.GetComparativa(this.selectedAnio, 'IVA')

                    let ObjIva = {}

                    for (let x = 0; x < this.selectedMes.value; x++) {
                        ObjIva.año = this.selectedAnio;
                        ObjIva.mes = ivaCargo[x].mes;

                        ObjIva.baseIvaTrasladado = ivaCargo[x].baseIva;
                        ObjIva.importeIvaTrasladado = ivaCargo[x].importeIva;
                        ObjIva.detallesTrasladado = ivaCargo[x].detalles;

                        ObjIva.baseIvaAcreditado = ivaAcreditable[x].baseIva
                        ObjIva.importeIvaAcreditado = ivaAcreditable[x].importeIva
                        ObjIva.detallesAcreditado = ivaAcreditable[x].detalles;

                        ObjIva.ivaRetenidoAnterior = ivaRetenido[x].importeIva
                        ObjIva.ivaRetenido = ivaRetenido[x + 1].importeIva
                        // ObjIva.ivaRetenidoAnterior = 0
                        // ObjIva.ivaRetenido = 0

                        let ivaCargo_ = ivaCargo[x].importeIva;
                        let ivaAcreditado_ = ivaAcreditable[x].importeIva
                        let ivaRetenido_ = ivaRetenido[x].importeIva
                        let ivaRetenidoAnterior_ = ivaRetenido[x + 1].importeIva
                        // let ivaRetenido_ = 0
                        // let ivaRetenidoAnterior_ = 0
                        let calculo = ivaCargo_ - ivaAcreditado_ - ivaRetenido_ + ivaRetenidoAnterior_
                        if (calculo > 0) {
                            ObjIva.ivaCargo = calculo
                            ObjIva.ivaFavor = 0
                        } else {
                            ObjIva.ivaCargo = 0
                            ObjIva.ivaFavor = calculo * -1
                        }

                        //COMPARATIVA
                        ObjIva.cargoRegistrado = comparativa[x].ivaCargo
                        ObjIva.favorRegistrado = comparativa[x].ivaFavor

                        let comparativa_ = (ObjIva.ivaCargo - ObjIva.ivaFavor - ObjIva.cargoRegistrado + ObjIva.favorRegistrado) * -1
                        if (comparativa_ != 0) {
                            comparativa_ = comparativa_ * -1;
                        }
                        ObjIva.comparativa = comparativa_;

                        this.dataComprobantes.push(ObjIva);
                        ObjIva = {}
                    }

                    let objetoTotales = {
                        año: 'Total',
                        mes: '',

                        baseIvaTrasladado: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.baseIvaTrasladado, 0),
                        importeIvaTrasladado: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.importeIvaTrasladado, 0),
                        detallesTrasladado: [],

                        baseIvaAcreditado: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.baseIvaAcreditado, 0),
                        importeIvaAcreditado: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.importeIvaAcreditado, 0),
                        detallesAcreditado: [],

                        ivaRetenidoAnterior: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.ivaRetenidoAnterior, 0),
                        ivaRetenido: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.ivaRetenido, 0),
                        ivaCargo: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.ivaCargo, 0),
                        ivaFavor: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.ivaFavor, 0),
                        cargoRegistrado: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.cargoRegistrado, 0),
                        favorRegistrado: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.favorRegistrado, 0),
                        comparativa: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.comparativa, 0),
                    }
                    this.dataComprobantes.push(objetoTotales);
                    await this.GenerarGrafica(this.dataComprobantes);

                    this.$q.loading.hide()
                } catch (error) {
                    console.log(error)
                    this.$q.loading.hide()
                }
            },

            async GenerarGrafica(data) {
                data.pop();
                const meses = data.map((item) => item.mes);
                const cargo = data.map((item) => item.ivaCargo);
                const favor = data.map((item) => item.ivaFavor);

                let obj1 = {
                    type: 'line',
                    label: 'Cargo (Linea)',
                    borderColor: '#E74747',
                    borderWidth: 2,
                    fill: false,
                    data: cargo
                }

                let obj2 = {
                    type: 'bar',
                    label: 'Cargo (Barra)',
                    backgroundColor: '#E74747',
                    data: cargo,
                    borderColor: 'white',
                    borderWidth: 2
                }


                let obj5 = {
                    type: 'line',
                    label: 'Favor (Linea)',
                    borderColor: '#66BB6A',
                    borderWidth: 2,
                    fill: false,
                    data: favor
                }

                let obj6 = {
                    type: 'bar',
                    label: 'Favor (Barra)',
                    backgroundColor: '#66BB6A',
                    data: favor,
                    borderColor: 'white',
                    borderWidth: 2
                }
                let chartDatas = {
                    labels: meses,
                    datasets: []
                }

                chartDatas.datasets.push(obj1)
                chartDatas.datasets.push(obj2)
                chartDatas.datasets.push(obj5)
                chartDatas.datasets.push(obj6)
                this.chartData = { ...chartDatas }
            },

            async GetReporteIvaExento(ivaCargo) {
                try {
                    this.columns = [...this.columnsExento];

                    this.dataComprobantes = [];
                    this.$q.loading.show({
                        spinner: QSpinnerCube,
                        spinnerColor: 'red-8',
                        spinnerSize: 140,
                        message: 'Consultando datos, espere...',
                    })

                    // let ivaCargo = await this.GetIvaTrasladado();
                    let ivaAcreditable = await this.GetIvaAcreditado()
                    let ivaRetenido = await this.GetIvaRetenido();
                    let comparativa = await this.GetComparativa(this.selectedAnio, 'IVA')

                    let ObjIva = {}

                    for (let x = 0; x < this.selectedMes.value; x++) {
                        ObjIva.año = this.selectedAnio;
                        ObjIva.mes = ivaCargo[x].mes;

                        ObjIva.baseIvaTrasladado = ivaCargo[x].baseIva;
                        ObjIva.importeIvaTrasladado = ivaCargo[x].importeIva;
                        ObjIva.detallesTrasladado = ivaCargo[x].detalles;

                        ObjIva.porcentajeExento = 0;

                        ObjIva.baseIvaAcreditado = ivaAcreditable[x].baseIva
                        ObjIva.importeIvaAcreditado = ivaAcreditable[x].importeIva
                        ObjIva.detallesAcreditado = ivaAcreditable[x].detalles;

                        ObjIva.ivaRetenidoAnterior = ivaRetenido[x].importeIva
                        ObjIva.ivaRetenido = ivaRetenido[x + 1].importeIva

                        let ivaCargo_ = ivaCargo[x].importeIva;
                        let ivaAcreditado_ = ivaAcreditable[x].importeIva
                        let ivaRetenido_ = ivaRetenido[x].importeIva
                        let ivaRetenidoAnterior_ = ivaRetenido[x + 1].importeIva
                        let calculo = ivaCargo_ - ivaAcreditado_ - ivaRetenido_ + ivaRetenidoAnterior_
                        if (calculo > 0) {
                            ObjIva.ivaCargo = calculo
                            ObjIva.ivaFavor = 0
                        } else {
                            ObjIva.ivaCargo = 0
                            ObjIva.ivaFavor = calculo * -1
                        }

                        //COMPARATIVA
                        ObjIva.cargoRegistrado = comparativa[x].ivaCargo
                        ObjIva.favorRegistrado = comparativa[x].ivaFavor

                        let comparativa_ = (ObjIva.ivaCargo - ObjIva.ivaFavor - ObjIva.cargoRegistrado + ObjIva.favorRegistrado) * -1
                        if (comparativa_ != 0) {
                            comparativa_ = comparativa_ * -1;
                        }
                        ObjIva.comparativa = comparativa_;

                        this.dataComprobantes.push(ObjIva);
                        ObjIva = {}
                    }

                    let objetoTotales = {
                        año: 'Total',
                        mes: '',

                        baseIvaTrasladado: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.baseIvaTrasladado, 0),
                        importeIvaTrasladado: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.importeIvaTrasladado, 0),
                        detallesTrasladado: [],
                        porcentajeExento: '---',
                        baseIvaAcreditado: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.baseIvaAcreditado, 0),
                        importeIvaAcreditado: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.importeIvaAcreditado, 0),
                        detallesAcreditado: [],

                        ivaRetenidoAnterior: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.ivaRetenidoAnterior, 0),
                        ivaRetenido: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.ivaRetenido, 0),
                        ivaCargo: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.ivaCargo, 0),
                        ivaFavor: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.ivaFavor, 0),
                        cargoRegistrado: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.cargoRegistrado, 0),
                        favorRegistrado: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.favorRegistrado, 0),
                        comparativa: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.comparativa, 0),
                    }
                    this.dataComprobantes.push(objetoTotales);

                    this.$q.loading.hide()
                } catch (error) {
                    console.log(error)
                    this.$q.loading.hide()
                }
                for (let item of this.dataComprobantes) {
                    let detalles = item.detallesTrasladado;
                    let exento = detalles.filter(x => x.tipoFactor === 'Exento')
                    let sumaTotal = detalles.reduce((acumulador, objeto) => acumulador + objeto.base_, 0)
                    let sumaExento = exento.reduce((acumulador, objeto) => acumulador + objeto.base_, 0)
                    let porcentaje = sumaExento / sumaTotal
                    if (item.mes != '') {
                        item.porcentajeExento = (porcentaje * 100);
                    }
                }
            },

            async GetIvaTrasladado() {
                try {
                    this.$q.loading.show({
                        spinner: QSpinnerCube,
                        spinnerColor: 'red-8',
                        spinnerSize: 140,
                        message: 'Calculando iva trasladado, espere...',
                    })
                    let fechaI = this.selectedAnio + '-' + '01' + '-01';
                    let fechaF = this.selectedAnio + '-' + this.selectedMes.value + '-01';
                    let response = await axios.get(this.rutaAxios + 'Ingresos/GetReporteIvaAsync/erp_' + this.token.rfc + '/' + fechaI + '/' + fechaF,
                        {
                            timeout: 240000 // 120 segundos
                        }
                    );
                    this.$q.loading.hide()
                    return response.data;
                } catch (error) {
                    console.log(error)
                    this.$q.loading.hide()
                }
            },

            async GetIvaAcreditado() {
                try {
                    this.dialogtext = 'Consultando IVA Acreditable ...'
                    let fechaI = this.selectedAnio + '-' + '01' + '-01';
                    let fechaF = this.selectedAnio + '-' + this.selectedMes.value + '-01';

                    let response = await axios.get(this.rutaAxios + 'Gastos/GetReporteIvaAsync/erp_' + this.token.rfc + '/' + fechaI + '/' + fechaF);
                    return response.data;
                } catch (error) {
                    console.log(error)
                }
            },

            async GetIvaRetenido() {
                try {
                    this.dialogtext = 'Consultando IVA Retenido ...'
                    let añoSel = this.selectedAnio - 1
                    let fechaI = añoSel + '-' + '12' + '-01';
                    let fechaF = this.selectedAnio + '-' + this.selectedMes.value + '-01';

                    let response = await axios.get(this.rutaAxios + 'Gastos/GetReporteIvaRetenidoAsync/erp_' + this.token.rfc + '/' + fechaI + '/' + fechaF);
                    return response.data;
                } catch (error) {
                    console.log(error)
                }
            },

            async VerDetalles(item, cabecera) {
                this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'red-8', spinnerSize: 140, message: 'Consultando información...', })
                const nombresMeses = [
                    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
                ];
                const numeroMes = nombresMeses.indexOf(item.mes.toLowerCase()) + 1;
                const año = this.selectedAnio;
                const fI = año + '-' + numeroMes + '-01';
                const fF = año + '-' + numeroMes + '-01';
                const rfc = this.token.rfc;

                //CONSULTAMOS EL IVA CALCULADO EN PLATAFORMA SAT
                const satIva16 = { ...this.ivaSat16[numeroMes - 1] };
                const satIva8 = { ...this.ivaSat8[numeroMes - 1] };
                const satIva0 = { ...this.ivaSat0[numeroMes - 1] };
                const satIvaExento = { ...this.ivaSatExento[numeroMes - 1] };

                if (año < 2024) {
                    try {
                        if (cabecera === "Comprobantes IVA Trasladado") {
                            await this.DetalesEmitidos(rfc, fI, fF)
                        } else if (cabecera === "Comprobantes IVA Acreditado") {
                            await this.DetallesRecibidos(rfc, fI, fF)
                        }
                    } catch (error) {
                        console.log(error);
                        this.$q.loading.hide()
                    }
                } else {
                    try {
                        if (cabecera === "Comprobantes IVA Trasladado") {
                            await this.GetReporteIvaCompletoDetEmitidos(rfc, fI, fF, satIva16.ivaCargo, satIva8.ivaCargo, satIva0.ivaCargo, satIvaExento.ivaCargo)
                        } else if (cabecera === "Comprobantes IVA Acreditado") {
                            await this.GetReporteIvaCompletoDetRecibidos(rfc, fI, fF, satIva16.ivaFavor, satIva8.ivaFavor, satIva0.ivaFavor, satIvaExento.ivaFavor)
                        }
                    } catch (error) {
                        console.log(error);
                        this.$q.loading.hide()
                    }
                }
            },

            async DetalesEmitidos(rfc, fechaI, fechaF) {
                const response = await axios.get(this.rutaAxios + `Ingresos/GetReporteIvaDetAsync/${rfc}/${fechaI}/${fechaF}`);
                // console.log(response.data)
                const factor1Data = response.data.filter(item => item.tipoFactor === 'Tasa' && item.tasaOCuota == .16);
                const factor2Data = response.data.filter(item => item.tipoFactor === 'Tasa' && item.tasaOCuota == .08);
                const factor3Data = response.data.filter(item => item.tipoFactor === 'Tasa' && item.tasaOCuota == .0);
                const factor4Data = response.data.filter(item => item.tipoFactor === 'Exento');

                this.$store.state.detallesIvaMensualExentoStore = {
                    cabecera: "Comprobantes IVA Trasladado",
                    detalles: factor4Data
                };
                this.$store.state.detallesIvaMensualTasa16Store = {
                    cabecera: "Comprobantes IVA Trasladado",
                    detalles: factor1Data
                };
                this.$store.state.detallesIvaMensualTasa8Store = {
                    cabecera: "Comprobantes IVA Trasladado",
                    detalles: factor2Data
                };
                this.$store.state.detallesIvaMensualTasa0Store = {
                    cabecera: "Comprobantes IVA Trasladado",
                    detalles: factor3Data
                };

                //ASIGNAMOS LOS IMPORTES REGISTRADOS EN EL VISOR SAT
                this.$store.state.visorSatIva = {
                    iva16: 0,
                    iva8: 0,
                    iva0: 0,
                    ivaExento: 0,
                }

                this.dialogDetalles = true;
                this.$q.loading.hide()
            },

            async DetallesRecibidos(rfc, fechaI, fechaF) {
                const response = await axios.get(this.rutaAxios + `Gastos/GetReporteIvaDetAsync/${rfc}/${fechaI}/${fechaF}`);
                const factor1Data = response.data.filter(item => item.tipoFactor === 'Tasa' && item.tasaOCuota == .16);
                const factor2Data = response.data.filter(item => item.tipoFactor === 'Tasa' && item.tasaOCuota == .08);
                const factor3Data = response.data.filter(item => item.tipoFactor === 'Tasa' && item.tasaOCuota == .0);
                const factor4Data = response.data.filter(item => item.tipoFactor === 'Exento');

                this.$store.state.detallesIvaMensualExentoStore = {
                    cabecera: "Comprobantes IVA Acreditado",
                    detalles: factor4Data
                };
                this.$store.state.detallesIvaMensualTasa16Store = {
                    cabecera: "Comprobantes IVA Acreditado",
                    detalles: factor1Data
                };
                this.$store.state.detallesIvaMensualTasa8Store = {
                    cabecera: "Comprobantes IVA Acreditado",
                    detalles: factor2Data
                };
                this.$store.state.detallesIvaMensualTasa0Store = {
                    cabecera: "Comprobantes IVA Acreditado",
                    detalles: factor3Data
                };

                //ASIGNAMOS LOS IMPORTES REGISTRADOS EN EL VISOR SAT
                this.$store.state.visorSatIva = {
                    iva16: 0,
                    iva8: 0,
                    iva0: 0,
                    ivaExento: 0,
                }

                this.dialogDetalles = true;
                this.$q.loading.hide()
            },

            // ExportExcel() {
            //     const workbook = xlsx.utils.book_new();

            //     const sheetOtros = xlsx.utils.json_to_sheet(this.dataComprobantes);
            //     xlsx.utils.book_append_sheet(workbook, sheetOtros, 'IVA');

            //     xlsx.writeFile(workbook, 'PAGOS IVA DE ENERO A ' + this.selectedMes.label + ' ' + this.selectedAnio + '.xlsx');
            // },

            ExportExcel() {
            let reporte = 'REPORTE PAGOS DE IVA'
            let empresa = this.$store.state.empresaStore.nombre
            let rfc = this.$store.state.empresaStore.rfc
           
            let periodo = 'ENERO A '+ this.selectedMes.label + ' ' + this.selectedAnio

            const workbook = xlsx.utils.book_new();

            const cabecera = [
                [reporte],
                ["EMPRESA:", empresa.toUpperCase()],
                ["RFC:", rfc.toUpperCase()],
                ["PERIODO:",periodo.toUpperCase()],
                // ["FECHA REPORTE:", new Date()],
                [],
            ];

            const columnasExcel = this.columns.filter(
                col => col.name !== "actions"
            );

            const dataExcel = this.dataComprobantes.map(row => {
                const obj = {};
                columnasExcel.forEach(col => {
                obj[col.label] = row[col.field];
                });
                return obj;
            });

            const sheet = xlsx.utils.aoa_to_sheet(cabecera);

            xlsx.utils.sheet_add_json(sheet, dataExcel, {
                origin: "A6", 
                skipHeader: false,
            });

            sheet["!merges"] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: columnasExcel.length - 1 } },
                { s: { r: 1, c: 1 }, e: { r: 1, c: columnasExcel.length - 1 } },
                { s: { r: 2, c: 1 }, e: { r: 2, c: columnasExcel.length - 1 } },
                { s: { r: 3, c: 1 }, e: { r: 3, c: columnasExcel.length - 1 } },
            ];

            sheet["!cols"] = columnasExcel.map(() => ({ wch: 20 }));

            // const fechaCell = sheet["B4"];
            // if (fechaCell) fechaCell.z = "dd/mm/yyyy";

            xlsx.utils.book_append_sheet(workbook, sheet, "IVA");

            xlsx.writeFile(
                workbook,
                rfc + ' - ' + empresa +  ' - REPORTE PAGOS DE IVA DE ' + periodo.toUpperCase() + '.xlsx'
            );
            },

            FormatCurrency(value) {
                return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
            },

            FormatoCantidad(numero) {
                if (numero === '---') {
                    return "";
                } else {
                    const numeroConDecimales = Number(numero).toFixed(2);
                    return numeroConDecimales.replace(/\d(?=(\d{3})+\.)/g, '$&,')
                }
            },

            FormatoFecha(fecha) {
                try {
                    const fecha_ = fecha.replace("Z", "");
                    const fechaISO = fecha_;
                    const fechaFormateada = format(new Date(fechaISO), "dd-MMMM-yyyy", { locale: es });
                    return fechaFormateada;
                }
                catch (error) {

                }
            },

            ShowNotifsWarning(mensaje) {
                this.$q.notify({
                    progress: true,
                    message: mensaje,
                    type: 'warning',
                    position: 'top-right',
                    actions: [
                        { label: 'Cerrar', color: 'white', handler: () => { /* ... */ } }
                    ]
                })
            },

            async OpenComparativa() {
                if (!this.selectedAnio) {
                    this.ShowNotifsWarning('Seleccione el año');
                    return;
                }

                this.dialog = true;
                this.dialogtext = 'Consultando datos ...'
                let respuesta = {}

                this.comparativa.textoComparativa = 'Comparativa Pagos de IVA';
                this.comparativa.año = this.selectedAnio;
                this.comparativa.tipo = 'IVA';

                respuesta = await this.GetComparativa(this.selectedAnio, 'IVA');

                this.comparativa.comparativa.eneroCargo = respuesta[0].ivaCargo;
                this.comparativa.comparativa.febreroCargo = respuesta[1].ivaCargo;
                this.comparativa.comparativa.marzoCargo = respuesta[2].ivaCargo;
                this.comparativa.comparativa.abrilCargo = respuesta[3].ivaCargo;
                this.comparativa.comparativa.mayoCargo = respuesta[4].ivaCargo;
                this.comparativa.comparativa.junioCargo = respuesta[5].ivaCargo;
                this.comparativa.comparativa.julioCargo = respuesta[6].ivaCargo;
                this.comparativa.comparativa.agostoCargo = respuesta[7].ivaCargo;
                this.comparativa.comparativa.septiembreCargo = respuesta[8].ivaCargo;
                this.comparativa.comparativa.octubreCargo = respuesta[9].ivaCargo;
                this.comparativa.comparativa.noviembreCargo = respuesta[10].ivaCargo;
                this.comparativa.comparativa.diciembreCargo = respuesta[11].ivaCargo;

                this.comparativa.comparativa.eneroFavor = respuesta[0].ivaFavor;
                this.comparativa.comparativa.febreroFavor = respuesta[1].ivaFavor;
                this.comparativa.comparativa.marzoFavor = respuesta[2].ivaFavor;
                this.comparativa.comparativa.abrilFavor = respuesta[3].ivaFavor;
                this.comparativa.comparativa.mayoFavor = respuesta[4].ivaFavor;
                this.comparativa.comparativa.junioFavor = respuesta[5].ivaFavor;
                this.comparativa.comparativa.julioFavor = respuesta[6].ivaFavor;
                this.comparativa.comparativa.agostoFavor = respuesta[7].ivaFavor;
                this.comparativa.comparativa.septiembreFavor = respuesta[8].ivaFavor;
                this.comparativa.comparativa.octubreFavor = respuesta[9].ivaFavor;
                this.comparativa.comparativa.noviembreFavor = respuesta[10].ivaFavor;
                this.comparativa.comparativa.diciembreFavor = respuesta[11].ivaFavor;

                this.dialogComparativa = true;
                this.dialog = false;
            },

            async OpenComparativaSat(tasa) {
                if (!this.selectedAnio) {
                    this.ShowNotifsWarning('Seleccione el año');
                    return;
                }

                this.dialog = true;
                this.dialogtext = 'Consultando datos ...'
                let respuesta = {}

                this.comparativa.textoComparativa = 'Comparativa Visor SAT IVA' + tasa;
                this.comparativa.año = this.selectedAnio;
                this.comparativa.tipo = 'IVA_visor_sat_' + tasa;

                respuesta = await this.GetComparativa(this.selectedAnio, 'IVA_visor_sat_' + tasa);

                this.comparativa.comparativa.eneroCargo = respuesta[0].ivaCargo;
                this.comparativa.comparativa.febreroCargo = respuesta[1].ivaCargo;
                this.comparativa.comparativa.marzoCargo = respuesta[2].ivaCargo;
                this.comparativa.comparativa.abrilCargo = respuesta[3].ivaCargo;
                this.comparativa.comparativa.mayoCargo = respuesta[4].ivaCargo;
                this.comparativa.comparativa.junioCargo = respuesta[5].ivaCargo;
                this.comparativa.comparativa.julioCargo = respuesta[6].ivaCargo;
                this.comparativa.comparativa.agostoCargo = respuesta[7].ivaCargo;
                this.comparativa.comparativa.septiembreCargo = respuesta[8].ivaCargo;
                this.comparativa.comparativa.octubreCargo = respuesta[9].ivaCargo;
                this.comparativa.comparativa.noviembreCargo = respuesta[10].ivaCargo;
                this.comparativa.comparativa.diciembreCargo = respuesta[11].ivaCargo;

                this.comparativa.comparativa.eneroFavor = respuesta[0].ivaFavor;
                this.comparativa.comparativa.febreroFavor = respuesta[1].ivaFavor;
                this.comparativa.comparativa.marzoFavor = respuesta[2].ivaFavor;
                this.comparativa.comparativa.abrilFavor = respuesta[3].ivaFavor;
                this.comparativa.comparativa.mayoFavor = respuesta[4].ivaFavor;
                this.comparativa.comparativa.junioFavor = respuesta[5].ivaFavor;
                this.comparativa.comparativa.julioFavor = respuesta[6].ivaFavor;
                this.comparativa.comparativa.agostoFavor = respuesta[7].ivaFavor;
                this.comparativa.comparativa.septiembreFavor = respuesta[8].ivaFavor;
                this.comparativa.comparativa.octubreFavor = respuesta[9].ivaFavor;
                this.comparativa.comparativa.noviembreFavor = respuesta[10].ivaFavor;
                this.comparativa.comparativa.diciembreFavor = respuesta[11].ivaFavor;

                this.dialogComparativa = true;
                this.dialog = false;
            },

            async GetComparativa(año, tipo) {
                let respuesta = [
                    { mes: 'ENERO', importe: 0, ivaCargo: 0, ivaFavor: 0 },
                    { mes: 'FEBRERO', importe: 0, ivaCargo: 0, ivaFavor: 0 },
                    { mes: 'MARZO', importe: 0, ivaCargo: 0, ivaFavor: 0 },
                    { mes: 'ABRIL', importe: 0, ivaCargo: 0, ivaFavor: 0 },
                    { mes: 'MAYO', importe: 0, ivaCargo: 0, ivaFavor: 0 },
                    { mes: 'JUNIO', importe: 0, ivaCargo: 0, ivaFavor: 0 },
                    { mes: 'JULIO', importe: 0, ivaCargo: 0, ivaFavor: 0 },
                    { mes: 'AGOSTO', importe: 0, ivaCargo: 0, ivaFavor: 0 },
                    { mes: 'SEPTIEMBRE', importe: 0, ivaCargo: 0, ivaFavor: 0 },
                    { mes: 'OCTUBRE', importe: 0, ivaCargo: 0, ivaFavor: 0 },
                    { mes: 'NOVIEMBRE', importe: 0, ivaCargo: 0, ivaFavor: 0 },
                    { mes: 'DICIEMBRE', importe: 0, ivaCargo: 0, ivaFavor: 0 },
                ]
                try {
                    let response = await axios.get(this.rutaAxios + 'Comparativa/GetComparativaAsync/erp_' + this.token.rfc + '/' + año + '/' + tipo);
                    respuesta = response.data.comparativa
                    return respuesta;
                } catch (error) {
                    console.log(error)
                    return respuesta;
                }
            },

            CloseDialogDetalles() {
                this.dialogComparativa = false;
                this.dialogDetalles = false;
            },

            //CALCULO DEL IVA
            async GetReporteIva2024() {
                this.$q.loading.show({
                    spinner: QSpinnerCube,
                    spinnerColor: 'red-8',
                    spinnerSize: 140,
                    message: 'Calculando..',
                });

                this.dataComprobantes = [];
                const rfc = this.token.rfc;
                const fechaI = `${this.selectedAnio}-01-01`;
                const fechaF = `${this.selectedAnio}-${this.selectedMes.value}-01`;

                // **Fetching data**
                const emitidos = (await this.GetReporteIvaCompletoEmitidos(rfc, fechaI, fechaF)) || [];
                const recibidos = (await this.GetReporteIvaCompletoRecibidos(rfc, fechaI, fechaF)) || [];
                const ivaRet = (await this.GetIvaRetenido()) || [];
                console.log("Retenido",ivaRet);
                const comp = (await this.GetComparativa(this.selectedAnio, 'IVA')) || [];
                this.columns = [...this.columnsDefault];
                const meses = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];

                for (let x = 0; x <= this.selectedMes.value; x++) {
                    const mes = meses[x];

                    const baseIvaTrasladado = emitidos
                        .filter(item => item.mes?.toUpperCase() === mes)
                        .reduce((acc, item) => acc + (item.baseIva || 0), 0);

                    const importeIvaTrasladado = emitidos
                        .filter(item => item.mes?.toUpperCase() === mes)
                        .reduce((acc, item) => acc + (item.importeIva || 0), 0);

                    const baseIvaAcreditado = recibidos
                        .filter(item => item.mes?.toUpperCase() === mes)
                        .reduce((acc, item) => acc + (item.baseIva || 0), 0);

                    const importeIvaAcreditado = recibidos
                        .filter(item => item.mes?.toUpperCase() === mes)
                        .reduce((acc, item) => acc + (item.importeIva || 0), 0);

                    // console.log("Retenido", ivaRet);
                    const ivaRetenido = ivaRet
                        .filter(item => item.mes?.toUpperCase() === mes && item.año === this.selectedAnio)
                        .reduce((acc, item) => acc + (item.importeIva || 0), 0);

                    const ivaRetenidoAnterior = ivaRet[x]?.importeIva || 0;

                    let ivaCargo = 0;
                    let ivaFavor = 0;
                    const calculo = importeIvaTrasladado - importeIvaAcreditado + ivaRetenido - ivaRetenidoAnterior;

                    if (calculo > 0) {
                        ivaCargo = calculo;
                        ivaFavor = 0;
                    } else {
                        ivaCargo = 0;
                        ivaFavor = Math.abs(calculo);
                    }

                    const cargoRegistrado = comp
                        .filter(item => item.mes?.toUpperCase() === mes)
                        .reduce((acc, item) => acc + (item.ivaCargo || 0), 0);

                    const favorRegistrado = comp
                        .filter(item => item.mes?.toUpperCase() === mes)
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


                // Asegura que existan datos 
                if (this.dataComprobantes.length > 0) {
                    await this.GenerarGrafica(this.dataComprobantes);
                } else {
                    console.warn("No hay datos por mostrar.");
                }

                this.$q.loading.hide();
            },

            async GetReporteIvaCompletoEmitidos(rfc, fechaI, fechaF) {
                try {
                    const response = await axios.get(this.rutaAxios + `Ingresos/GetReporteIvaCompletoAsync/${rfc}/${fechaI}/${fechaF}`);
                    return response.data;
                } catch (error) {
                    console.log(error);
                    return null;
                }
            },

            async GetReporteIvaCompletoRecibidos(rfc, fechaI, fechaF) {
                try {
                    const response = await axios.get(this.rutaAxios + `Gastos/GetReporteIvaCompletoAsync/${rfc}/${fechaI}/${fechaF}`);
                    return response.data;
                } catch (error) {
                    console.log(error);
                    return null;
                }
            },

            async GetReporteIvaCompletoDetRecibidos(rfc, fechaI, fechaF, iva16, iva8, iva0, ivaExento) {
                this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'red-8', spinnerSize: 140, message: 'Consultando iva acreditable...', })
                try {
                    const response = await axios.get(this.rutaAxios + `Gastos/GetReporteIvaCompletoDetAsync/${rfc}/${fechaI}/${fechaF}`);
                    const factor1Data = response.data.filter(item => item.tipoFactor === 'Tasa' && item.tasaOCuota == .16);
                    const factor2Data = response.data.filter(item => item.tipoFactor === 'Tasa' && item.tasaOCuota == .08);
                    const factor3Data = response.data.filter(item => item.tipoFactor === 'Tasa' && item.tasaOCuota == .0);
                    const factor4Data = response.data.filter(item => item.tipoFactor === 'Exento');


                    this.$store.state.detallesIvaMensualExentoStore = {
                        cabecera: "Comprobantes IVA Acreditado",
                        detalles: factor4Data
                    };
                    this.$store.state.detallesIvaMensualTasa16Store = {
                        cabecera: "Comprobantes IVA Acreditado",
                        detalles: factor1Data
                    };
                    this.$store.state.detallesIvaMensualTasa8Store = {
                        cabecera: "Comprobantes IVA Acreditado",
                        detalles: factor2Data
                    };
                    this.$store.state.detallesIvaMensualTasa0Store = {
                        cabecera: "Comprobantes IVA Acreditado",
                        detalles: factor3Data
                    };

                    //ASIGNAMOS LOS IMPORTES REGISTRADOS EN EL VISOR SAT
                    this.$store.state.visorSatIva = {
                        iva16: iva16,
                        iva8: iva8,
                        iva0: iva0,
                        ivaExento: ivaExento,
                    }

                    this.dialogDetalles = true;
                    this.$q.loading.hide()
                } catch (error) {
                    console.log(error);
                    this.$q.loading.hide()
                }
            },

            async GetReporteIvaCompletoDetEmitidos(rfc, fechaI, fechaF, iva16, iva8, iva0, ivaExento) {
                this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'red-8', spinnerSize: 140, message: 'Consultando iva acreditable...', })
                try {
                    const response = await axios.get(this.rutaAxios + `Ingresos/GetReporteIvaCompletoDetAsync/${rfc}/${fechaI}/${fechaF}`);
                    const factor1Data = response.data.filter(item => item.tipoFactor === 'Tasa' && item.tasaOCuota == .16);
                    const factor2Data = response.data.filter(item => item.tipoFactor === 'Tasa' && item.tasaOCuota == .08);
                    const factor3Data = response.data.filter(item => item.tipoFactor === 'Tasa' && item.tasaOCuota == .0);
                    const factor4Data = response.data.filter(item => item.tipoFactor === 'Exento');

                    this.$store.state.detallesIvaMensualExentoStore = {
                        cabecera: "Comprobantes IVA Trasladado",
                        detalles: factor4Data
                    };
                    this.$store.state.detallesIvaMensualTasa16Store = {
                        cabecera: "Comprobantes IVA Trasladado",
                        detalles: factor1Data
                    };
                    this.$store.state.detallesIvaMensualTasa8Store = {
                        cabecera: "Comprobantes IVA Trasladado",
                        detalles: factor2Data
                    };
                    this.$store.state.detallesIvaMensualTasa0Store = {
                        cabecera: "Comprobantes IVA Trasladado",
                        detalles: factor3Data
                    };

                    //ASIGNAMOS LOS IMPORTES REGISTRADOS EN EL VISOR SAT
                    this.$store.state.visorSatIva = {
                        iva16: iva16,
                        iva8: iva8,
                        iva0: iva0,
                        ivaExento: ivaExento,
                    }

                    this.dialogDetalles = true;
                    this.$q.loading.hide()
                } catch (error) {
                    console.log(error);
                    this.$q.loading.hide()
                }
            },

            //COMPARACION DE IMPUESTOS
            async GetReporteIvaPagosImpuestos() {
                this.$q.loading.show({
                    spinner: QSpinnerCube,
                    spinnerColor: 'red-8',
                    spinnerSize: 140,
                    message: 'Calculando..',
                });
                try {
                    this.dataDiferenciaimpuestos = [];
                    const rfc = this.token.rfc;
                    const fechaI = `${this.selectedAnio}-01-01`;
                    const fechaF = `${this.selectedAnio}-${this.selectedMes.value}-01`;
                    const response = await axios.get(this.rutaAxios + `Gastos/GetReporteIvaPagosImpuestosAsync/${rfc}/${fechaI}/${fechaF}`);
                    this.dataDiferenciaimpuestos = [...response.data];

                    this.dataDiferenciaimpuestosTipoFactor = [];
                    // this.dataDiferenciaimpuestosTipoFactor

                    this.$q.loading.hide();
                } catch (error) {
                    console.log(error)
                    this.$q.loading.hide();
                }
            },

            async DetalleImpuestos(item) {
                this.$q.loading.show({
                    spinner: QSpinnerCube,
                    spinnerColor: 'red-8',
                    spinnerSize: 140,
                    message: 'Calculando..',
                });
                try {
                    this.dataDiferenciaimpuestosComprobante = []
                    this.dataDiferenciaimpuestosPagos = []
                    const rfc = this.token.rfc;
                    //ASIGNAMOS VARIABLES DEL COMPROBANTE
                    this.objImpComprobante.nombre = item.nombre;
                    this.objImpComprobante.rfc = item.rfc;
                    this.objImpComprobante.serie = item.serie;
                    this.objImpComprobante.folio = item.folio;
                    this.objImpComprobante.fecha = item.fecha;
                    this.objImpComprobante.total = item.total;
                    this.objImpComprobante.folioFiscal = item.folioFiscal;

                    //ASIGNAMOS VARIABLES DEL PAGO
                    this.objImpPago.serie = item.serieP;
                    this.objImpPago.folio = item.folioP;
                    this.objImpPago.fecha = item.fechaP;
                    this.objImpPago.total = item.totalP;
                    this.objImpPago.folioFiscal = item.folioFiscalP;

                    //CALCULAMOS EL IVA NO REGISTRADO
                    let porcentaje = item.totalP / item.total;
                    porcentaje = parseFloat(porcentaje.toFixed(4));
                    const porcentaje_ = porcentaje * 100;
                    const porcentajeF = Math.round(porcentaje_ * 100) / 100;
                    this.objImpComprobante.porcentaje = `${porcentajeF}%`

                    const iComp = await this.GetComprobanteImpuestos(rfc, item.folioFiscal);
                    const iPago = await this.GetPagoImpuestos(rfc, item.folioFiscalP, item.folioFiscal);
                    this.dataDiferenciaimpuestosComprobante = [...iComp]
                    this.dataDiferenciaimpuestosPagos = [...iPago]

                    //CALCULAMOS EL IMPORTE DEL IVA QUE AFECTA
                    const importeIva = this.dataDiferenciaimpuestosComprobante.reduce((acumulador, objeto) => acumulador + objeto.importe, 0);
                    const montoIva = importeIva * porcentaje;
                    const montoIvaFinal = Math.round(montoIva * 100) / 100;
                    this.objImpComprobante.importeIva = montoIvaFinal

                    this.$q.loading.hide();
                    this.dialogDiferenciaimpuestos = true;
                } catch (error) {
                    console.log(error);
                    this.$q.loading.hide();
                }
            },

            async GetComprobanteImpuestos(rfc, folioFiscal) {
                try {
                    const response = await axios.get(this.rutaAxios + `Gastos/GetReporteIvaPagosImpuestosComprobanteDetAsync/${rfc}/${folioFiscal}`);
                    return response.data;
                } catch (error) {
                    console.log(error);
                    return null;
                }
            },

            async GetPagoImpuestos(rfc, folioFiscal, idDocumento) {
                try {
                    const response = await axios.get(this.rutaAxios + `Gastos/GetReporteIvaPagosImpuestosPagoDetAsync/${rfc}/${folioFiscal}/${idDocumento}`);
                    return response.data;
                } catch (error) {
                    console.log(error);
                    return null;
                }
            },

            async pdfComprobanteIva(folioFiscal) {
                this.$store.state.vistaPreviaStore.folioFiscal = folioFiscal;
                this.$store.state.vistaPreviaStore.color = "19775C"
                this.$store.state.vistaPreviaStore.tipoComprobanteInterno = "FACTURA"
                this.$store.state.vistaPreviaStore.tipo = "R"
                this.$store.state.vistaPreviaStore.rfc = this.token.rfc
                this.dialogPdf = true;
            },

            async pdfPagoIva(folioFiscal) {
                this.$store.state.vistaPreviaStore.folioFiscal = folioFiscal;
                this.$store.state.vistaPreviaStore.color = "19775C"
                this.$store.state.vistaPreviaStore.tipoComprobanteInterno = "PAGO"
                this.$store.state.vistaPreviaStore.tipo = "R"
                this.$store.state.vistaPreviaStore.rfc = this.token.rfc
                this.dialogPdf = true;
            },
        },
    }

</script>
<style>
    .clase-total-Total {
        background: rgb(255, 190, 190);
    }
</style>