<template>
    <div class="q-pa-md">
        <!-- DIALOG DE LOADING -->
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
        <q-dialog v-model="dialogDetallesFlujo" persistent transition-show="scale" transition-hide="scale" maximized>
            <detalles-flujo @CloseDialogDetalles="CloseDialogDetalles"></detalles-flujo>
        </q-dialog>
        <q-dialog v-model="dialogDetallesFlujoGastos" persistent transition-show="scale" transition-hide="scale"
            maximized>
            <detalles-flujo-gastos @CloseDialogDetalles="CloseDialogDetalles"></detalles-flujo-gastos>
        </q-dialog>

        <!-- DIALOG PARA GUARDAR EL COEFICIENTE Y LA PFEA -->
        <q-dialog v-model="dialogC_PFEA" persistent transition-show="scale" transition-hide="scale">
            <q-card>
                <q-toolbar>
                    <q-btn flat round dense icon="close" v-close-popup color="red-10" size="18px">
                        <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                            content-style="font-size: 14px" :offset="[10, 10]">Cerrar</q-tooltip>
                    </q-btn>

                    <q-toolbar-title><span class="text-weight-bold">{{ c_pfea.tipo }}
                            ({{selectedAnio}})</span></q-toolbar-title>
                    <template v-if="c_pfea.tipo === 'Coeficiente'">
                        <q-btn flat round dense icon="mdi-content-save-check-outline" color="green-10" size="18px"
                            @click="PostCoeficiente()">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Guardar Coeficiente</q-tooltip>
                        </q-btn>
                    </template>
                    <template v-if="c_pfea.tipo === 'Pérdida'">
                        <q-btn flat round dense icon="mdi-content-save-check-outline" color="green-10" size="18px"
                            @click="PostPerdida()">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Guardar Pérdida</q-tooltip>
                        </q-btn>
                    </template>
                </q-toolbar>
                <q-separator color="primary" size="5px" />
                <q-card-section>
                    <q-field v-model="c_pfea.eneroFebrero" label="Enero - Febrero">
                        <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                            <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                        </template>
                    </q-field>
                    <q-field v-model="c_pfea.marzoDiciembre" label="Marzo - Diciembre">
                        <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                            <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                v-bind="moneyFormatForComponent" v-show="floatingLabel" />
                        </template>
                    </q-field>
                </q-card-section>
            </q-card>
        </q-dialog>

        <!-- DIALOG DE LOS IMPORTES REGISTRADOS -->
        <q-dialog v-model="dialogRegistrados" persistent transition-show="scale" transition-hide="scale">
            <q-card>
                <q-toolbar>
                    <q-btn flat round dense icon="close" v-close-popup color="red-10" size="18px">
                        <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                            content-style="font-size: 14px" :offset="[10, 10]">Cerrar</q-tooltip>
                    </q-btn>

                    <q-toolbar-title><span class="text-weight-bold">Importes Registrados</span></q-toolbar-title>
                    <q-btn flat round dense icon="mdi-content-save-check-outline" color="green-10" size="18px"
                        @click="PostRegistrados()">
                        <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                            content-style="font-size: 14px" :offset="[10, 10]">Guardar Importes</q-tooltip>
                    </q-btn>
                </q-toolbar>
                <q-separator color="primary" size="5px" />

                <q-card-section>
                    <q-field v-model="registrados.enero" label="Enero">
                        <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                            <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                v-bind="moneyFormatForComponentDos" v-show="floatingLabel" />
                        </template>
                    </q-field>
                    <q-field v-model="registrados.febrero" label="Febrero">
                        <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                            <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                v-bind="moneyFormatForComponentDos" v-show="floatingLabel" />
                        </template>
                    </q-field>
                    <q-field v-model="registrados.marzo" label="Marzo">
                        <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                            <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                v-bind="moneyFormatForComponentDos" v-show="floatingLabel" />
                        </template>
                    </q-field>
                    <q-field v-model="registrados.abril" label="Abril">
                        <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                            <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                v-bind="moneyFormatForComponentDos" v-show="floatingLabel" />
                        </template>
                    </q-field>
                    <q-field v-model="registrados.mayo" label="Mayo">
                        <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                            <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                v-bind="moneyFormatForComponentDos" v-show="floatingLabel" />
                        </template>
                    </q-field>
                    <q-field v-model="registrados.junio" label="Junio">
                        <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                            <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                v-bind="moneyFormatForComponentDos" v-show="floatingLabel" />
                        </template>
                    </q-field>
                    <q-field v-model="registrados.julio" label="Julio">
                        <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                            <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                v-bind="moneyFormatForComponentDos" v-show="floatingLabel" />
                        </template>
                    </q-field>
                    <q-field v-model="registrados.agosto" label="Agosto">
                        <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                            <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                v-bind="moneyFormatForComponentDos" v-show="floatingLabel" />
                        </template>
                    </q-field>
                    <q-field v-model="registrados.septiembre" label="Septiembre">
                        <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                            <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                v-bind="moneyFormatForComponentDos" v-show="floatingLabel" />
                        </template>
                    </q-field>
                    <q-field v-model="registrados.octubre" label="Octubre">
                        <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                            <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                v-bind="moneyFormatForComponentDos" v-show="floatingLabel" />
                        </template>
                    </q-field>
                    <q-field v-model="registrados.noviembre" label="Noviembre">
                        <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                            <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                v-bind="moneyFormatForComponentDos" v-show="floatingLabel" />
                        </template>
                    </q-field>
                    <q-field v-model="registrados.diciembre" label="Diciembre">
                        <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                            <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                v-bind="moneyFormatForComponentDos" v-show="floatingLabel" />
                        </template>
                    </q-field>
                </q-card-section>
            </q-card>
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
            <q-space />
        </div>
        <div class="row no-wrap items-center q-mt-md q-pa-sm" v-if="regimenSeleccionado">
            <q-space />
            {{ regimenSeleccionado }}
            <q-space />
        </div>

        <!-- DIALOG DEL REGIMEN DE LA EMPRESA -->
        <q-dialog v-model="dialogRegimen" persistent transition-show="scale" transition-hide="scale">
            <q-card>
                <q-toolbar>
                    <q-btn flat round dense icon="close" v-close-popup color="red-10" size="18px">
                        <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                            content-style="font-size: 14px" :offset="[10, 10]">Cerrar</q-tooltip>
                    </q-btn>

                    <q-toolbar-title><span class="text-weight-bold">Régimen Fiscal</span></q-toolbar-title>
                    <q-btn flat round dense icon="mdi-content-save-check-outline" color="green-10" size="18px"
                        @click="PostRegimen()">
                        <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                            content-style="font-size: 14px" :offset="[10, 10]">Guardar</q-tooltip>
                    </q-btn>
                </q-toolbar>
                <q-separator color="primary" size="5px" />
                <q-card-section>
                    <div v-for="(item, index) in añosRegimen" :key="index">
                        <div class="">
                            <div class="row">
                                <div class="col-9">
                                    <q-select outlined dense v-model="item.tipoRegimen" :options="itemsRegimen"
                                        :label="item.año" class="q-mr-xs q-my-sm" use-input hide-selected fill-input
                                        option-label="tipoRegimen" />
                                </div>
                                <div class="col">
                                    <q-checkbox v-model="item.civiles" color="primary" label="AC / SC" true-value="SI"
                                        false-value="NO" dense />
                                </div>
                            </div>
                        </div>
                    </div>
                </q-card-section>
            </q-card>
            <!-- {{añosRegimen}} -->
        </q-dialog>

        <!-- DIALOG PARA PRODUCTOS FINANCIEROS -->
        <q-dialog v-model="dialogProductosFinancieros" persistent transition-show="scale" transition-hide="scale">
            <q-card>
                <q-toolbar>
                    <q-btn flat round dense icon="close" v-close-popup color="red-10" size="18px">
                        <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                            content-style="font-size: 14px" :offset="[10, 10]">Cerrar</q-tooltip>
                    </q-btn>

                    <q-toolbar-title><span class="text-weight-bold">Productos Financieros
                            ({{selectedAnio}})</span></q-toolbar-title>
                    <q-btn flat round dense icon="mdi-content-save-check-outline" color="green-10" size="18px"
                        @click="PostProductosfinancieros()">
                        <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                            content-style="font-size: 14px" :offset="[10, 10]">Guardar</q-tooltip>
                    </q-btn>
                </q-toolbar>
                <q-separator color="primary" size="5px" />
                <q-card-section>
                    <div v-for="item in itemsProductosFinancieros">
                        <q-field v-model="item.importe" :label="item.mes" dense>
                            <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                                <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                    v-bind="moneyFormatForComponentDos" v-show="floatingLabel" />
                            </template>
                        </q-field>
                    </div>
                </q-card-section>
            </q-card>
        </q-dialog>

        <!-- DIALOG PARA OTROS PRODUCTOS FINANCIEROS -->
        <q-dialog v-model="dialogOtrosProductosFinancieros" persistent transition-show="scale" transition-hide="scale">
            <q-card>
                <q-toolbar>
                    <q-btn flat round dense icon="close" v-close-popup color="red-10" size="18px">
                        <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                            content-style="font-size: 14px" :offset="[10, 10]">Cerrar</q-tooltip>
                    </q-btn>

                    <q-toolbar-title><span class="text-weight-bold">Otros Productos Financieros
                            ({{selectedAnio}})</span></q-toolbar-title>
                    <q-btn flat round dense icon="mdi-content-save-check-outline" color="green-10" size="18px"
                        @click="PostOtrosProductosFinancieros()">
                        <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                            content-style="font-size: 14px" :offset="[10, 10]">Guardar</q-tooltip>
                    </q-btn>
                </q-toolbar>
                <q-separator color="primary" size="5px" />
                <q-card-section>
                    <div v-for="item in itemsOtrosProductosFinancieros">
                        <q-field v-model="item.importe" :label="item.mes" dense>
                            <template v-slot:control="{ id, floatingLabel, value, emitValue }">
                                <money :id="id" class="q-field__input text-right" :value="value" @input="emitValue"
                                    v-bind="moneyFormatForComponentDos" v-show="floatingLabel" />
                            </template>
                        </q-field>
                    </div>
                </q-card-section>
            </q-card>
        </q-dialog>

        <!-- TABLA DE PAGOS PROVISIONALES -->
        <q-table title="Reporte ISR" :data="dataComprobantes" :columns="columns" row-key="dia"
            :rows-per-page-options="[13]">
            <template v-slot:top>
                <span class="text-body1" content-style="font-size: 20px">Pagos Provisionales</span>
                <q-space />
                <q-chip clickable @click="openDialogCoeficiente" color="primary" icon="mdi-calculator" outline>
                    Coeficiente de Utilidad
                </q-chip>
                <q-chip clickable @click="openDialogPedrdida" color="primary" icon="mdi-calendar-minus-outline" outline>
                    Perdida Fiscal de Ejercicios Anteriores
                </q-chip>
                <q-chip clickable @click="openDialogRegistrados" color="primary" icon="mdi-select-compare" outline>
                    Comparativa
                </q-chip>
                <q-chip clickable @click="GetProductosFinancieros()" color="primary" icon="mdi-finance" outline>
                    Productos Financieros
                </q-chip>
                <q-chip clickable @click="GetOtrosProductosFinancieros()" color="primary" icon="mdi-finance" outline>
                    Otros Productos Financieros
                </q-chip>

                <q-space />
                <q-btn push color="blue-7" @click="GetRegimen()" icon="mdi-card-account-details-outline" rounded flat
                    size="18px" padding="xs">
                    <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                        :offset="[10, 10]">Régimen</q-tooltip>
                </q-btn>
            </template>
            <template v-slot:body="props">
                <q-tr :props="props" :class="'clase-total-' + props.row.mes">
                    <q-td key="mes" :props="props">{{ props.row.mes }}</q-td>
                    <template v-if="civiles === 'NO'">
                        <!-- GENERAL PERSONAS MORALES -->
                        <template v-if="regimenSeleccionadoClave === '601'">
                            <q-td key="ingresosPorMes" :props="props">{{ FormatCurrency(props.row.ingresosPorMes)
                                }}</q-td>
                            <q-td auto-width>
                                <q-btn size="md" color="primary" rounded flat dense
                                    @click="VerDetalles(props.row, 'Ingresos Facturados')"
                                    icon="mdi-format-list-bulleted" v-if="props.row.detalles.length != 0">
                                    <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                        content-style="font-size: 14px" :offset="[10, 10]">Detalles</q-tooltip>
                                </q-btn>
                            </q-td>
                            <q-td key="ingresosAcumulados" :props="props">{{
                                FormatCurrency(props.row.ingresosAcumulados)
                                }}</q-td>
                            <q-td key="utilidadFiscal" :props="props">{{ FormatCurrency(props.row.utilidadFiscal)
                                }}</q-td>
                            <q-td key="basePagoProvisional" :props="props">{{
                                FormatCurrency(props.row.basePagoProvisional)
                                }}</q-td>
                            <q-td key="pagoProvisional" :props="props">{{ FormatCurrency(props.row.pagoProvisional)
                                }}</q-td>
                            <q-td key="impuestoCargo" :props="props">{{ FormatCurrency(props.row.impuestoCargo)
                                }}</q-td>
                        </template>
                        <!-- PERSONAS FISICAS ACTIVIDAD EMPRESARIAL -->
                        <template v-if="regimenSeleccionadoClave === '612'">
                            <q-td key="ingresosPorMes" :props="props">{{ FormatCurrency(props.row.ingresosPorMes)
                                }}</q-td>
                            <q-td auto-width>
                                <q-btn size="md" color="primary" rounded flat dense
                                    @click="VerDetallesFlujo(props.row, 'Ingresos Cobrados')"
                                    icon="mdi-format-list-bulleted" v-if="props.row.detalles.length != 0">
                                    <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                        content-style="font-size: 14px" :offset="[10, 10]">Detalles</q-tooltip>
                                </q-btn>
                            </q-td>
                            <q-td key="ingresosAcumulados" :props="props">{{
                                FormatCurrency(props.row.ingresosAcumulados)
                                }}</q-td>
                            <q-td key="gastosPorMes" :props="props">{{ FormatCurrency(props.row.gastosPorMes) }}</q-td>
                            <q-td auto-width>
                                <q-btn size="md" color="primary" rounded flat dense
                                    @click="VerDetallesFlujoG(props.row, 'Gastos Pagados')"
                                    icon="mdi-format-list-bulleted" v-if="props.row.detallesG.length != 0">
                                    <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                        content-style="font-size: 14px" :offset="[10, 10]">Detalles</q-tooltip>
                                </q-btn>
                            </q-td>
                            <q-td key="gastosAcumulados" :props="props">{{ FormatCurrency(props.row.gastosAcumulados)
                                }}</q-td>
                            <q-td key="baseCalculo" :props="props">{{ FormatCurrency(props.row.baseCalculo) }}</q-td>
                            <q-td key="limiteInferior" :props="props">{{ FormatCurrency(props.row.limiteInferior)
                                }}</q-td>
                            <q-td key="baseImpuesto" :props="props">{{ FormatCurrency(props.row.baseImpuesto) }}</q-td>
                            <q-td key="porcentaje" :props="props">{{ PorcentajeCurrency(props.row.porcentaje) }}</q-td>
                            <q-td key="impuestoMarginal" :props="props">{{ FormatCurrency(props.row.impuestoMarginal)
                                }}</q-td>
                            <q-td key="cuotaFija" :props="props">{{ FormatCurrency(props.row.cuotaFija) }}</q-td>
                            <q-td key="importeIsr" :props="props">{{ FormatCurrency(props.row.importeIsr) }}</q-td>
                            <q-td key="pagosAnteriores" :props="props">{{ FormatCurrency(props.row.pagosAnteriores)
                                }}</q-td>
                            <q-td key="isrCargo" :props="props">{{ FormatCurrency(props.row.isrCargo) }}</q-td>
                        </template>
                        <!-- RESICO FISICA -->
                        <template v-if="regimenSeleccionadoClave === '626' & tipoPersona === 'FISICA'">
                            <q-td key="ingresosPorMes" :props="props">{{ FormatCurrency(props.row.ingresosPorMes)
                                }}</q-td>
                            <q-td auto-width>
                                <q-btn size="md" color="primary" rounded flat dense
                                    @click="VerDetallesFlujo(props.row, 'Ingresos Cobrados')"
                                    icon="mdi-format-list-bulleted" v-if="props.row.detalles.length != 0">
                                    <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                        content-style="font-size: 14px" :offset="[10, 10]">Detalles</q-tooltip>
                                </q-btn>
                            </q-td>
                            <q-td key="tasaAplicable" :props="props">{{ PorcentajeCurrency(props.row.tasaAplicable)
                                }}</q-td>
                            <q-td key="importeIsr" :props="props">{{ FormatCurrency(props.row.importeIsr) }}</q-td>
                        </template>
                        <!-- RESICO MORAL -->
                        <template v-if="regimenSeleccionadoClave === '626' & tipoPersona === 'MORAL'">
                            <q-td key="ingresosPorMes" :props="props">{{ FormatCurrency(props.row.ingresosPorMes)
                                }}</q-td>
                            <q-td auto-width>
                                <q-btn size="md" color="primary" rounded flat dense
                                    @click="VerDetallesFlujo(props.row, 'Ingresos Cobrados')"
                                    icon="mdi-format-list-bulleted" v-if="props.row.detalles.length != 0">
                                    <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                        content-style="font-size: 14px" :offset="[10, 10]">Detalles</q-tooltip>
                                </q-btn>
                            </q-td>
                            <q-td key="ingresosAcumulados" :props="props">{{
                                FormatCurrency(props.row.ingresosAcumulados)
                                }}</q-td>

                            <q-td key="deduccionesPorMes" :props="props">{{ FormatCurrency(props.row.deduccionesPorMes)
                                }}</q-td>
                            <q-td auto-width>
                                <q-btn size="md" color="primary" rounded flat dense
                                    @click="VerDetallesFlujoG(props.row, 'Gastos Pagados')"
                                    icon="mdi-format-list-bulleted" v-if="props.row.detallesD.length != 0">
                                    <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                        content-style="font-size: 14px" :offset="[10, 10]">Detalles</q-tooltip>
                                </q-btn>
                            </q-td>
                            <q-td key="deduccionesAcumuladas" :props="props">{{
                                FormatCurrency(props.row.deduccionesAcumuladas)
                                }}</q-td>
                            <q-td key="utilidadFiscalPrevia" :props="props">{{
                                FormatCurrency(props.row.utilidadFiscalPrevia)
                                }}</q-td>
                            <q-td key="utilidadFiscalPreviaAcumulada" :props="props">{{
                                FormatCurrency(props.row.utilidadFiscalPreviaAcumulada)
                                }}</q-td>
                            <q-td key="ptuPagada" :props="props">{{ FormatCurrency(props.row.ptuPagada) }}</q-td>
                            <q-td key="utilidadFiscalAcumuladaPreviaAntesDePerdidasFiscales" :props="props">{{
                                FormatCurrency(props.row.utilidadFiscalAcumuladaPreviaAntesDePerdidasFiscales) }}</q-td>
                            <q-td key="perdidasFiscalesPorAplicar" :props="props">{{
                                FormatCurrency(props.row.perdidasFiscalesPorAplicar) }}</q-td>
                            <q-td key="baseIsr" :props="props">{{ FormatCurrency(props.row.baseIsr) }}</q-td>
                            <q-td key="tasaIsr" :props="props">{{ props.row.tasaIsr }}</q-td>
                            <q-td key="isrDelPeriodo" :props="props">{{ FormatCurrency(props.row.isrDelPeriodo)
                                }}</q-td>
                            <q-td key="isrPagosProvisionales" :props="props">{{
                                FormatCurrency(props.row.isrPagosProvisionales)
                                }}</q-td>
                            <q-td key="isrAPagar" :props="props">{{ FormatCurrency(props.row.isrAPagar) }}</q-td>

                        </template>
                    </template>
                    <!-- PARA AC Y SC (SOCIEDADES CIVILES) -->
                    <template v-if="civiles === 'SI'">
                        <q-td key="ventas" :props="props">{{ FormatCurrency(props.row.ventas) }}</q-td>
                        <q-td key="productosFinancieros" :props="props">{{
                            FormatCurrency(props.row.productosFinancieros) }}</q-td>
                        <q-td key="otrosProductos" :props="props">{{ FormatCurrency(props.row.otrosProductos) }}</q-td>
                        <q-td key="anticipoDeClientes" :props="props">{{ FormatCurrency(props.row.anticipoDeClientes)
                            }}</q-td>
                        <q-td key="totalPeriodo" :props="props">{{ FormatCurrency(props.row.totalPeriodo) }}</q-td>
                        <q-td key="ingresoAcumulable" :props="props">{{ FormatCurrency(props.row.ingresoAcumulable)
                            }}</q-td>
                        <q-td key="coeficienteUtilidad" :props="props">{{ FormatCurrency(props.row.coeficienteUtilidad)
                            }}</q-td>
                        <q-td key="utilidadFiscalEstimada" :props="props">{{
                            FormatCurrency(props.row.utilidadFiscalEstimada) }}</q-td>
                        <q-td key="ptu" :props="props">{{ FormatCurrency(props.row.ptu) }}</q-td>
                        <q-td key="ptuAcumulada" :props="props">{{ FormatCurrency(props.row.ptuAcumulada) }}</q-td>
                        <q-td key="anticipoCuentaUtilidades" :props="props">{{
                            FormatCurrency(props.row.anticipoCuentaUtilidades) }}</q-td>
                        <q-td key="anticipoCuentaUtilidadesAcumulado" :props="props">{{
                            FormatCurrency(props.row.anticipoCuentaUtilidadesAcumulado) }}</q-td>
                        <q-td key="resultadoFiscalPrevio" :props="props">{{
                            FormatCurrency(props.row.resultadoFiscalPrevio) }}</q-td>
                        <q-td key="perdidaDelEjercicioAnterior" :props="props">{{
                            FormatCurrency(props.row.perdidaDelEjercicioAnterior) }}</q-td>
                        <q-td key="baseParaIsr" :props="props">{{ FormatCurrency(props.row.baseParaIsr) }}</q-td>
                        <q-td key="tasaParaIsr" :props="props">{{ FormatCurrency(props.row.tasaParaIsr) }}</q-td>
                        <q-td key="pagoProvisionalIsr" :props="props">{{ FormatCurrency(props.row.pagoProvisionalIsr)
                            }}</q-td>
                        <q-td key="isrEnterado" :props="props">{{ FormatCurrency(props.row.isrEnterado) }}</q-td>
                        <q-td key="isrAPagar" :props="props">{{ FormatCurrency(props.row.isrAPagar) }}</q-td>
                    </template>
                    <q-td key="impuestoregistrado" :props="props">{{ FormatCurrency(props.row.impuestoregistrado)
                        }}</q-td>
                    <q-td key="comparativa" :props="props">{{ FormatCurrency(props.row.comparativa) }}</q-td>

                </q-tr>
            </template>
        </q-table>

        <!-- GRAFICA-->
        <q-card style="width: 100%; " class="full-width q-mt-lg">
            <chart-component :chartData="chartData" :chartTitle="charTitleE"></chart-component>
        </q-card>
    </div>
</template>
<script>
    import axios from 'axios';
    import moment from 'moment';
    import * as xlsx from 'xlsx';
    import detalles from './PagosProvisionalesDet.vue'
    import detallesFlujo from './PagosProvisionalesDetFlujo.vue'
    import detallesFlujoGastos from './PagosProvisionalesDetFlujoGastos.vue'
    import { Money } from 'v-money'
    import { QSpinnerCube } from 'quasar'
    import ChartComponent from "../Graficas/ChartComponent.vue";

    export default {
        components: {
            detalles,
            detallesFlujo,
            detallesFlujoGastos,
            ChartComponent,
            Money,
        },
        data() {
            return {
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
                dataComprobantes: [],

                //DATOS DE CARGANDO
                dialog: false,
                dialogtext: '',

                //DATOS DE LOS DETALLES
                dialogDetalles: false,
                dialogDetallesFlujo: false,
                dialogDetallesFlujoGastos: false,

                //PARA COEFICIENTE Y PERDIDA
                dialogC_PFEA: false,
                defaultErrorC_PFEA: [
                    { label: 'ENERO', value: 0 },
                    { label: 'FEBRERO', value: 0 },
                    { label: 'MARZO', value: 0 },
                    { label: 'ABRIL', value: 0 },
                    { label: 'MAYO', value: 0 },
                    { label: 'JUNIO', value: 0 },
                    { label: 'JULIO', value: 0 },
                    { label: 'AGOSTO', value: 0 },
                    { label: 'SEPTIEMBRE', value: 0 },
                    { label: 'OCTUBRE', value: 0 },
                    { label: 'NOVIEMBRE', value: 0 },
                    { label: 'DICIEMBRE', value: 0 },
                ],
                c_pfea: {
                    eneroFebrero: 0,
                    marzoDiciembre: 0,
                    tipo: '',
                },

                //IMPORTES REGISTRADOS
                dialogRegistrados: false,
                registrados: {
                    enero: 0,
                    febrero: 0,
                    marzo: 0,
                    abril: 0,
                    mayo: 0,
                    junio: 0,
                    julio: 0,
                    agosto: 0,
                    septiembre: 0,
                    octubre: 0,
                    noviembre: 0,
                    diciembre: 0,
                },

                moneyFormatForComponent: {
                    decimal: '.',
                    thousands: ',',
                    precision: 4,
                    masked: true
                },

                moneyFormatForComponentDos: {
                    decimal: '.',
                    thousands: ',',
                    precision: 2,
                    masked: true
                },

                //PARA EL REGIMEN FISCAL
                itemsRegimen: [
                    { clave: '601', descripcion: 'General de Ley Personas Morales', tipoRegimen: '601 | General de Ley Personas Morales' },
                    { clave: '603', descripcion: 'Personas Morales con Fines no Lucrativos', tipoRegimen: '603 | Personas Morales con Fines no Lucrativos' },
                    { clave: '605', descripcion: 'Sueldos y Salarios e Ingresos Asimilados a Salarios', tipoRegimen: '605 | Sueldos y Salarios e Ingresos Asimilados a Salarios' },
                    { clave: '606', descripcion: 'Arrendamiento', tipoRegimen: '606 | Arrendamiento' },
                    { clave: '608', descripcion: 'Demás ingresos', tipoRegimen: '608 | Demás ingresos' },
                    { clave: '609', descripcion: 'Consolidación', tipoRegimen: '609 | Consolidación' },
                    { clave: '610', descripcion: 'Residentes en el Extranjero sin Establecimiento Permanente en México', tipoRegimen: '610 | Residentes en el Extranjero sin Establecimiento Permanente en México' },
                    { clave: '611', descripcion: 'Ingresos por Dividendos (socios y accionistas)', tipoRegimen: '611 | Ingresos por Dividendos (socios y accionistas)' },
                    { clave: '612', descripcion: 'Personas Físicas con Actividades Empresariales y Profesionales', tipoRegimen: '612 | Personas Físicas con Actividades Empresariales y Profesionales' },
                    { clave: '614', descripcion: 'Ingresos por intereses', tipoRegimen: '614 | Ingresos por intereses' },
                    { clave: '616', descripcion: 'Sin obligaciones fiscales', tipoRegimen: '616 | Sin obligaciones fiscales' },
                    { clave: '620', descripcion: 'Sociedades Cooperativas de Producción que optan por diferir sus ingresos', tipoRegimen: '620 | Sociedades Cooperativas de Producción que optan por diferir sus ingresos' },
                    { clave: '621', descripcion: 'Incorporación Fiscal', tipoRegimen: '621 | Incorporación Fiscal' },
                    { clave: '622', descripcion: 'Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras', tipoRegimen: '622 | Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras' },
                    { clave: '623', descripcion: 'Opcional para Grupos de Sociedades', tipoRegimen: '623 | Opcional para Grupos de Sociedades' },
                    { clave: '624', descripcion: 'Coordinados', tipoRegimen: '624 | Coordinados' },
                    { clave: '628', descripcion: 'Hidrocarburos', tipoRegimen: '628 | Hidrocarburos' },
                    { clave: '607', descripcion: 'Régimen de Enajenación o Adquisición de Bienes', tipoRegimen: '607 | Régimen de Enajenación o Adquisición de Bienes' },
                    { clave: '629', descripcion: 'De los Regímenes Fiscales Preferentes y de las Empresas Multinacionales', tipoRegimen: '629 | De los Regímenes Fiscales Preferentes y de las Empresas Multinacionales' },
                    { clave: '630', descripcion: 'Enajenación de acciones en bolsa de valores', tipoRegimen: '630 | Enajenación de acciones en bolsa de valores' },
                    { clave: '615', descripcion: 'Régimen de los ingresos por obtención de premios', tipoRegimen: '615 | Régimen de los ingresos por obtención de premios' },
                    { clave: '625', descripcion: 'Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas', tipoRegimen: '625 | Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas' },
                    { clave: '626', descripcion: 'Régimen Simplificado de Confianza', tipoRegimen: '626 | Régimen Simplificado de Confianza' },

                ],
                dialogRegimen: false,
                regimenSeleccionado: null,
                regimenSeleccionadoClave: '',
                tipoPersona: '',
                civiles: "NO",
                añosRegimen: [],

                charTitleE: 'Pagos Provisionales',
                chartData: null,

                //PRODUCTOS FINANCIEROS
                dialogProductosFinancieros: false,
                itemsProductosFinancieros: [],
                //OTROS PRODUCTOS FINANCIEROS
                dialogOtrosProductosFinancieros: false,
                itemsOtrosProductosFinancieros: [],
            }
        },
        computed: {
            token() {
                return this.$store.state.usuario;
            },

            rutaAxios() {
                return this.$store.state.rutaMongoStore
            },

            itemsAnios() {
                let hoy = new Date().getFullYear();
                let años = [];
                for (let a = 0; a <= 6; a++) {
                    años.push(hoy)
                    hoy--;
                }
                return años;
            },

        },
        created() {
            this.Iniciales();
        },
        methods: {
            Iniciales() {
                let hoy = new Date().getFullYear();
                this.selectedAnio = hoy.toString()
            },

            async GetReporte() {
                if (!this.selectedAnio) {
                    this.$q.notify({
                        type: 'warning',
                        message: `Seleccione el año`,
                        actions: [
                            { label: 'Cerrar', color: 'white', handler: () => { /* ... */ } }
                        ]
                    })
                    return;
                }

                if (!this.selectedMes) {
                    this.$q.notify({
                        type: 'warning',
                        message: `Seleccione el mes al que desea consultar`,
                        actions: [
                            { label: 'Cerrar', color: 'white', handler: () => { /* ... */ } }
                        ]
                    })
                    return;
                }

                //VALIDAMOS EL REGIMEN            
                await this.GetRegimen();
                this.dialogRegimen = false;
                const listaRegimen = [...this.añosRegimen]
                const año = this.selectedAnio.toString();
                const regimen = listaRegimen.find(o => o.año === año);

                if (!regimen.tipoRegimen) {
                    this.$q.notify({
                        type: 'warning',
                        message: `Indique el régimen fiscal del año ` + this.selectedAnio,
                        actions: [
                            { label: 'Cerrar', color: 'white', handler: () => { /* ... */ } }
                        ]
                    })
                    return;
                }

                this.$q.loading.show({
                    spinner: QSpinnerCube,
                    spinnerColor: 'red-8',
                    spinnerSize: 140,
                    message: 'Generando reporte, espere...',
                })
                this.regimenSeleccionado = regimen.tipoRegimen.tipoRegimen
                this.civiles = "NO";
                this.columns = [];
                //VALIDAMOS QUE NO SEA UNA SC O AC
                if (regimen.civiles === "SI") {
                    this.civiles = "SI";
                    await this.GetPagoIsrAcYScA();
                } else {
                    this.regimenSeleccionadoClave = regimen.tipoRegimen.clave
                    const claveRegimen = regimen.tipoRegimen.clave;
                    const rfc = this.token.rfc
                    if (rfc.length == 12) {
                        var tipoPersona = 'MORAL';
                    } else if (rfc.length == 13) {
                        var tipoPersona = 'FISICA';
                    }

                    switch (claveRegimen) {
                        case '601':
                            await this.GetGeneralMoral();
                            this.$q.loading.hide()
                            break;
                        case '626':
                            if (tipoPersona === 'FISICA') {
                                await this.GetResicoFisica();
                            }
                            if (tipoPersona === 'MORAL') {
                                await this.GetResicoMoral();
                            }
                            this.$q.loading.hide()
                            break;
                        case '612':
                            await this.GetFisicaActividadEmpresarial();
                            this.$q.loading.hide()
                            break;
                    }
                }
            },

            async GetGeneralMoral() {
                try {
                    let columnas = [
                        { name: 'mes', align: 'left', label: 'Mes', field: 'mes' },
                        { name: 'ingresosPorMes', align: 'right', label: 'Ingresos por Mes', field: 'ingresosPorMes' },
                        { name: 'acciones', align: 'left', label: 'Acciones', field: 'acciones' },

                        { name: 'ingresosAcumulados', align: 'right', label: 'Ingresos Acumulados', field: 'ingresosAcumulados' },
                        { name: 'utilidadFiscal', align: 'right', label: 'Utilidad Fiscal', field: 'utilidadFiscal' },
                        { name: 'basePagoProvisional', align: 'right', label: 'Base Pago Provisional', field: 'basePagoProvisional' },
                        { name: 'pagoProvisional', align: 'right', label: 'Pago Provisional', field: 'pagoProvisional' },
                        { name: 'impuestoCargo', align: 'right', label: 'Impuesto a Cargo', field: 'impuestoCargo' },
                        { name: 'impuestoregistrado', align: 'right', label: 'Impuesto Registrado', field: 'impuestoregistrado' },
                        { name: 'comparativa', align: 'right', label: 'Comparativa', field: 'comparativa' },
                    ]
                    this.columns = [...columnas]

                    this.dataComprobantes = [];
                    var ingresos = await this.GetIngresosFacturados();
                    let coeficiente = await this.GetCoeficiente();
                    let perdida = await this.GetPerdida();
                    let registrados = await this.GetRegistrados();
                    // console.log(ingresos);

                    let ObjPp = {};
                    let acumulado = 0;
                    let pagoAnterior = 0;
                    let impuestoCargo = 0;

                    for (let i = 0; i < this.selectedMes.value; i++) {
                        acumulado += ingresos[i].importe
                        ObjPp.mes = ingresos[i].mes;
                        ObjPp.ingresosPorMes = ingresos[i].importe;
                        ObjPp.detalles = ingresos[i].detalles;
                        ObjPp.ingresosAcumulados = acumulado;
                        ObjPp.utilidadFiscal = acumulado * coeficiente[i].importe;
                        let base = (acumulado * coeficiente[i].importe) - perdida[i].importe
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

                        let comparativa = ObjPp.impuestoCargo - ObjPp.impuestoregistrado
                        ObjPp.comparativa = comparativa;
                        this.dataComprobantes.push(ObjPp);
                        ObjPp = {}
                    }

                    let objetoTotales = {
                        mes: 'Total',
                        ingresosPorMes: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.ingresosPorMes, 0),
                        detalles: [],
                        ingresosAcumulados: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.ingresosAcumulados, 0),
                        utilidadFiscal: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.utilidadFiscal, 0),
                        basePagoProvisional: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.basePagoProvisional, 0),
                        pagoProvisional: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.pagoProvisional, 0),
                        impuestoCargo: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.impuestoCargo, 0),
                        impuestoregistrado: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.impuestoregistrado, 0),
                        comparativa: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.comparativa, 0),
                    }
                    this.dataComprobantes.push(objetoTotales);
                } catch (error) {
                    console.log(error)
                }
            },

            async GetFisicaActividadEmpresarial() {
                this.ShowLoadingGet();
                try {
                    let columnas = [
                        { name: 'mes', align: 'left', label: 'Mes', field: 'mes' },

                        { name: 'ingresosPorMes', align: 'right', label: 'Ingresos por Mes', field: 'ingresosPorMes' },
                        { name: 'acciones', align: 'left', label: 'Acciones', field: 'acciones' },
                        { name: 'ingresosAcumulados', align: 'right', label: 'Ingresos Acumulados', field: 'ingresosAcumulados' },

                        { name: 'gastosPorMes', align: 'right', label: 'Gastos por Mes', field: 'gastosPorMes' },
                        { name: 'accionesG', align: 'left', label: 'Acciones', field: 'accionesG' },
                        { name: 'gastosAcumulados', align: 'right', label: 'Gastos Acumulados', field: 'gastosAcumulados' },


                        { name: 'baseCalculo', align: 'right', label: 'Base del Cálculo', field: 'baseCalculo' },
                        { name: 'limiteInferior', align: 'right', label: 'Límite Inferior', field: 'limiteInferior' },
                        { name: 'baseImpuesto', align: 'right', label: 'Base Impuesto', field: 'baseImpuesto' },
                        { name: 'porcentaje', align: 'right', label: 'Porcentaje', field: 'porcentaje' },
                        { name: 'impuestoMarginal', align: 'right', label: 'Impuesto Marginal', field: 'impuestoMarginal' },
                        { name: 'cuotaFija', align: 'right', label: 'Cuota Fija', field: 'cuotaFija' },
                        { name: 'importeIsr', align: 'right', label: 'Importe ISR', field: 'importeIsr' },
                        { name: 'pagosAnteriores', align: 'right', label: 'Pagos Anteriores', field: 'pagosAnteriores' },
                        { name: 'isrCargo', align: 'right', label: 'ISR a Cargo', field: 'isrCargo' },

                        { name: 'impuestoregistrado', align: 'right', label: 'Impuesto Registrado', field: 'impuestoregistrado' },
                        { name: 'comparativa', align: 'right', label: 'Comparativa', field: 'comparativa' },
                    ]
                    this.columns = [...columnas]

                    let tablas = await this.GetTablas('personas_fisicas_actividad_empresarial', 'mensual');
                    // console.log(tablas[0].enero)
                    let ingresos = await this.GetIngresosCobrados();
                    let gastos = await this.GetGastosPagados();
                    let registrados = await this.GetRegistrados();

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
                            limiteInferior = valorEncontrado.limite_inferior
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
                        }
                        ListComprobantes.push(ObjIngresos)
                        pagosAnteriores += isrCargo;
                        contador++;
                    }

                    this.dataComprobantes = [...ListComprobantes]

                    let objetoTotales = {
                        mes: 'Total',
                        ingresosPorMes: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.ingresosPorMes, 0),
                        detalles: [],
                        ingresosAcumulados: '---',
                        gastosPorMes: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.gastosPorMes, 0),
                        detallesG: [],
                        gastosAcumulados: '---',
                        baseCalculo: '---',
                        limiteInferior: '---',
                        baseImpuesto: '---',
                        porcentaje: '---',
                        impuestoMarginal: '---',
                        cuotaFija: '---',
                        importeIsr: '---',
                        pagosAnteriores: '---',
                        isrCargo: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.isrCargo, 0),
                        impuestoregistrado: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.impuestoregistrado, 0),
                        comparativa: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.comparativa, 0),
                    }
                    this.dataComprobantes.push(objetoTotales);
                    // console.log(objetoTotales)
                } catch (error) {

                }
            },

            async GenerarGrafica(data) {
                // console.log(data)
                data.pop();
                const meses = data.map((item) => item.mes);
                const ingresos = data.map((item) => item.ingresosPorMes);
                const impuestos = data.map((item) => item.impuestoCargo);

                let obj1 = {
                    type: 'line',
                    label: 'Ingresos por mes (Linea)',
                    borderColor: '#FFA726',
                    borderWidth: 2,
                    fill: false,
                    data: ingresos
                }

                let obj2 = {
                    type: 'bar',
                    label: 'Ingresos por mes (Barra)',
                    backgroundColor: '#FFA726',
                    data: ingresos,
                    borderColor: 'white',
                    borderWidth: 2
                }

                let obj3 = {
                    type: 'line',
                    label: 'Impuesto a cargo (Linea)',
                    borderColor: '#66BB6A',
                    borderWidth: 2,
                    fill: false,
                    data: impuestos
                }

                let obj4 = {
                    type: 'bar',
                    label: 'Impuesto a cargo (Barra)',
                    backgroundColor: '#66BB6A',
                    data: impuestos,
                    borderColor: 'white',
                    borderWidth: 2
                }

                let chartDatas = {
                    labels: meses,
                    datasets: []
                }

                chartDatas.datasets.push(obj1)
                chartDatas.datasets.push(obj2)
                chartDatas.datasets.push(obj3)
                chartDatas.datasets.push(obj4)
                this.chartData = { ...chartDatas }
                // console.log(this.chartData)
            },

            async GetResicoFisica() {

                this.ShowLoadingGet();
                try {
                    let columnas = [
                        { name: 'mes', align: 'left', label: 'Mes', field: 'mes' },
                        { name: 'ingresosPorMes', align: 'right', label: 'Ingresos por Mes', field: 'ingresosPorMes' },
                        { name: 'acciones', align: 'left', label: 'Acciones', field: 'acciones' },
                        { name: 'tasaAplicable', align: 'right', label: 'Tasa Aplicable', field: 'tasaAplicable' },
                        { name: 'importeIsr', align: 'right', label: 'Importe ISR', field: 'importeIsr' },
                        { name: 'impuestoregistrado', align: 'right', label: 'Impuesto Registrado', field: 'impuestoregistrado' },
                        { name: 'comparativa', align: 'right', label: 'Comparativa', field: 'comparativa' },
                    ]
                    this.columns = [...columnas]
                    this.tipoPersona = 'FISICA'

                    let tablas = await this.GetTablas('resico_fisica', 'mensual');
                    let ingresos_ = await this.GetIngresosCobrados();
                    let registrados = await this.GetRegistrados();

                    console.log(ingresos_);

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
                                }
                            }
                            else{
                                tasaAplicable.tasa = 2.5
                            }
                        }

                        let importeIsr = 0;
                        if(ingresos != 0){
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
                        }
                        ListComprobantes.push(ObjIngresos)
                        contador++;
                    }
                    this.dataComprobantes = [...ListComprobantes]

                    let objetoTotales = {
                        mes: 'Total',
                        ingresosPorMes: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.ingresosPorMes, 0),
                        detalles: [],
                        tasaAplicable: '---',
                        importeIsr: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.importeIsr, 0),
                        impuestoregistrado: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.impuestoregistrado, 0),
                        comparativa: this.dataComprobantes.reduce((acumulador, objeto) => acumulador + objeto.comparativa, 0),
                    }
                    this.dataComprobantes.push(objetoTotales);
                } catch (error) {
                    console.log(error)
                    this.$q.loading.hide()
                }
            },

            async GetResicoMoral() {
                let columnas = [
                    { name: 'mes', align: 'left', label: 'Mes', field: 'mes' },
                    { name: 'ingresosPorMes', align: 'right', label: 'Ingresos por Mes', field: 'ingresosPorMes' },
                    { name: 'acciones', align: 'left', label: 'Acciones', field: 'acciones' },
                    { name: 'ingresosAcumulados', align: 'right', label: 'Ingresos Acumulados', field: 'ingresosAcumulados' },

                    { name: 'deduccionesPorMes', align: 'right', label: 'Deducciones por Mes', field: 'deduccionesPorMes' },
                    { name: 'accionesD', align: 'left', label: 'Acciones', field: 'accionesD' },
                    { name: 'deduccionesAcumuladas', align: 'right', label: 'Deducciones Acumuladas', field: 'deduccionesAcumuladas' },
                    { name: 'utilidadFiscalPrevia', align: 'right', label: 'Utilidad Fiscal del Mes Previa', field: 'utilidadFiscalPrevia' },
                    { name: 'utilidadFiscalPreviaAcumulada', align: 'right', label: 'Utilidad Fiscal del Mes Previa Acumulada', field: 'utilidadFiscalPreviaAcumulada' },
                    { name: 'ptuPagada', align: 'right', label: 'PTU Pagada', field: 'ptuPagada' },
                    { name: 'utilidadFiscalAcumuladaPreviaAntesDePerdidasFiscales', align: 'right', label: 'Utilidad Fiscal Acumulada Previa Antes de Perdidas Fiscales', field: 'utilidadFiscalAcumuladaPreviaAntesDePerdidasFiscales' },
                    { name: 'perdidasFiscalesPorAplicar', align: 'right', label: 'Pérdidas Fiscales Por Aplicar', field: 'perdidasFiscalesPorAplicar' },
                    { name: 'baseIsr', align: 'right', label: 'Base de ISR', field: 'baseIsr' },
                    { name: 'tasaIsr', align: 'right', label: 'Tasa de ISR', field: 'tasaIsr' },
                    { name: 'isrDelPeriodo', align: 'right', label: 'ISR del Periodo', field: 'isrDelPeriodo' },
                    { name: 'isrPagosProvisionales', align: 'right', label: 'ISR Pagos Provisionales', field: 'isrPagosProvisionales' },
                    { name: 'isrAPagar', align: 'right', label: 'ISR A Pagar', field: 'isrAPagar' },

                    { name: 'impuestoregistrado', align: 'right', label: 'Impuesto Registrado', field: 'impuestoregistrado' },
                    { name: 'comparativa', align: 'right', label: 'Comparativa', field: 'comparativa' },
                ]
                this.columns = [...columnas]
                this.tipoPersona = 'MORAL'

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
                    let utilidadFiscalAcumuladaPreviaAntesDePerdidasFiscales = utilidadFiscalPreviaAcumulada - ptuPagada;
                    let perdidasFiscalesPorAplicar = perdida[contador].importe
                    let baseIsr = utilidadFiscalAcumuladaPreviaAntesDePerdidasFiscales - perdidasFiscalesPorAplicar;
                    if (baseIsr < 0) {
                        baseIsr = 0;
                    }
                    let tasaIsr = '30.00%';
                    let isrDelPeriodo = baseIsr * .3;
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
                    }
                    ListComprobantes.push(ObjIngresos)
                    isrPagosProvisionales = isrDelPeriodo
                    contador++;
                }

                this.dataComprobantes = [...ListComprobantes]

                // console.log(ingresos);
                // console.log(gastos);
            },

            async GetIngresosFacturados() {
                try {
                    this.dialogtext = 'Consultando ingresos...'

                    let fechaI = this.selectedAnio + '-01-01';
                    let fechaF = this.selectedAnio + '-' + this.selectedMes.value + '-01';

                    let response = await axios.get(this.rutaAxios + 'Ingresos/GetReporteIngresosPPISRAsync/erp_' + this.token.rfc + '/' + fechaI + '/' + fechaF);
                    return response.data
                } catch (error) {
                    console.log(error)
                }
            },

            async GetIngresosCobrados() {
                let fechaI = this.selectedAnio + '-01-01';
                let fechaF = this.selectedAnio + '-' + this.selectedMes.value + '-01';

                try {
                    let response = await axios.get(this.rutaAxios + 'Ingresos/GetCobradoAsync/erp_' + this.token.rfc + '/' + fechaI + '/' + fechaF);
                    return response.data;
                } catch (error) {
                    console.log(error);
                }
            },

            async GetIngresosCobradosResicoM() {
                let fechaI = this.selectedAnio + '-01-01';
                let fechaF = this.selectedAnio + '-' + this.selectedMes.value + '-01';

                try {
                    let response = await axios.get(this.rutaAxios + 'Ingresos/GetCobradoResicoMoralAsync/erp_' + this.token.rfc + '/' + fechaI + '/' + fechaF);
                    return response.data;
                } catch (error) {
                    console.log(error);
                }
            },

            async GetGastosPagadosResicoM() {
                let fechaI = this.selectedAnio + '-01-01';
                let fechaF = this.selectedAnio + '-' + this.selectedMes.value + '-01';

                try {
                    let response = await axios.get(this.rutaAxios + 'Gastos/GetPagadoResicoMoralAsync/erp_' + this.token.rfc + '/' + fechaI + '/' + fechaF);
                    return response.data;
                } catch (error) {
                    console.log(error);
                }
            },

            async GetGastosPagados() {
                let fechaI = this.selectedAnio + '-01-01';
                let fechaF = this.selectedAnio + '-' + this.selectedMes.value + '-01';

                try {
                    let response = await axios.get(this.rutaAxios + 'Gastos/GetPagadoAsync/erp_' + this.token.rfc + '/' + fechaI + '/' + fechaF);
                    return response.data;
                } catch (error) {
                    console.log(error);
                }
            },

            async GetPagoPtu() {
                let fechaI = this.selectedAnio + '-01-01';
                let fechaF = this.selectedAnio + '-' + this.selectedMes.value + '-01';

                try {
                    let response = await axios.get(this.rutaAxios + 'Nomina/GetReportePagoPtuAsync/erp_' + this.token.rfc + '/' + fechaI + '/' + fechaF);
                    return response.data;
                } catch (error) {
                    console.log(error);
                }
            },

            async GetTablas(tipo, periodicidad) {
                try {
                    let response = await axios.get(this.rutaAxios + 'Empresa/GetTablas/' + this.selectedAnio + '/' + tipo + '/' + periodicidad);
                    return response.data;
                } catch (error) {
                    console.log(error);
                }
            },

            VerDetalles(item, tipo) {
                // console.log(item)
                this.$store.state.detallesProvisionalesStore.cabecera = tipo + ' ' + item.mes + ' ' + this.selectedAnio;
                this.$store.state.detallesProvisionalesStore.detalles = item.detalles;
                // console.log(this.$store.state.detallesProvisionalesStore)
                this.dialogDetalles = true;
            },

            VerDetallesFlujo(item, tipo) {
                console.log(item.detalles)
                this.$store.state.detallesProvisionalesStore.cabecera = tipo + ' ' + item.mes + ' ' + this.selectedAnio;
                this.$store.state.detallesProvisionalesStore.detalles = item.detalles;
                this.$store.state.detallesProvisionalesStore.tipo = tipo;
                // console.log(this.$store.state.detallesProvisionalesStore)
                this.dialogDetallesFlujo = true;
            },

            VerDetallesFlujoG(item, tipo) {
                console.log(item.detallesD, "A")
                this.$store.state.detallesProvisionalesStore.cabecera = tipo + ' ' + item.mes + ' ' + this.selectedAnio;
                this.$store.state.detallesProvisionalesStore.detalles = item.detallesD;
                this.$store.state.detallesProvisionalesStore.tipo = tipo;
                // console.log(this.$store.state.detallesProvisionalesStore)
                this.dialogDetallesFlujo = true;
            },

            // ExportExcel() {
            //     const workbook = xlsx.utils.book_new();

            //     const sheetOtros = xlsx.utils.json_to_sheet(this.dataComprobantes);
            //     xlsx.utils.book_append_sheet(workbook, sheetOtros, 'PAGOS PROV.');

            //     xlsx.writeFile(workbook, 'INGRESOS REPORTE PAGOS PROVISIONALES DE ENERO A ' + this.selectedMes.label + ' ' + this.selectedAnio + '.xlsx');
            // },

            ExportExcel() {
            let reporte = 'REPORTE DE INGRESOS DE PAGOS PROVISIONALES'
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

            xlsx.utils.book_append_sheet(workbook, sheet, "PAGOS PROV");

            xlsx.writeFile(
                workbook,
                rfc + ' - ' + empresa +  ' - REPORTE DE INGRESOS DE PAGOS PROVISIONALES DE ' + periodo.toUpperCase() + '.xlsx'
            );
            },

            FormatCurrency(value) {
                if (value === '---') {
                    return '';
                } else {
                    let respuesta = value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
                    return respuesta;
                }
            },

            PorcentajeCurrency(value) {
                if (value === '---') {
                    return '';
                } else {
                    let respuesta = value.toFixed(2);
                    return respuesta + '%';
                }
            },

            CloseDialogDetalles() {
                this.dialogDetalles = false;
                this.dialogDetallesFlujo = false;
                this.dialogDetallesFlujoGastos = false;
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

            async openDialogCoeficiente() {
                if (!this.selectedAnio) {
                    this.ShowNotifsWarning('Seleccione un año para consultar')
                    return
                }
                let respuesta = await this.GetCoeficiente();
                this.c_pfea.eneroFebrero = respuesta[0].importe;
                this.c_pfea.marzoDiciembre = respuesta[3].importe;
                this.c_pfea.tipo = 'Coeficiente';

                this.dialogC_PFEA = true;
            },

            async openDialogPedrdida() {
                if (!this.selectedAnio) {
                    this.ShowNotifsWarning('Seleccione un año para consultar')
                    return
                }

                let respuesta = await this.GetPerdida();
                this.c_pfea.eneroFebrero = respuesta[0].importe;
                this.c_pfea.marzoDiciembre = respuesta[2].importe;
                this.c_pfea.tipo = 'Pérdida';

                this.dialogC_PFEA = true;
            },

            async openDialogRegistrados() {
                if (!this.selectedAnio) {
                    this.ShowNotifsWarning('Seleccione un año para consultar')
                    return
                }
                let respuesta = await this.GetRegistrados();
                this.registrados.enero = respuesta[0].importe;
                this.registrados.febrero = respuesta[1].importe;
                this.registrados.marzo = respuesta[2].importe;
                this.registrados.abril = respuesta[3].importe;
                this.registrados.mayo = respuesta[4].importe;
                this.registrados.junio = respuesta[5].importe;
                this.registrados.julio = respuesta[6].importe;
                this.registrados.agosto = respuesta[7].importe;
                this.registrados.septiembre = respuesta[8].importe;
                this.registrados.octubre = respuesta[9].importe;
                this.registrados.noviembre = respuesta[10].importe;
                this.registrados.diciembre = respuesta[11].importe;
                this.c_pfea.tipo = 'Registrados';

                this.dialogRegistrados = true;
            },

            async GetCoeficiente() {
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
                    let response = await axios.get(this.rutaAxios + 'Comparativa/GetComparativaAsync/erp_' + this.token.rfc + '/' + this.selectedAnio + '/Coeficiente');
                    let x = response.data.comparativa;
                    respuesta = x;
                } catch (error) {
                    console.log(error)
                }
                // console.log(respuesta)
                return respuesta;
            },

            async GetPerdida() {
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
                    let response = await axios.get(this.rutaAxios + 'Comparativa/GetComparativaAsync/erp_' + this.token.rfc + '/' + this.selectedAnio + '/Perdida');
                    let x = response.data.comparativa;
                    respuesta = x;
                } catch (error) {
                    console.log(error)
                }
                // console.log(respuesta)
                return respuesta;
            },

            async GetRegistrados() {
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
                    let response = await axios.get(this.rutaAxios + 'Comparativa/GetComparativaAsync/erp_' + this.token.rfc + '/' + this.selectedAnio + '/RegistradosPPIsr');
                    let x = response.data.comparativa;
                    respuesta = x;
                } catch (error) {
                    console.log(error)
                }
                // console.log(respuesta)
                return respuesta;
            },

            async PostCoeficiente() {
                try {
                    let ObjData = {
                        tipo: 'Coeficiente',
                        anio: this.selectedAnio,
                        comparativa: [
                            { mes: 'ENERO', importe: this.c_pfea.eneroFebrero, ivaCargo: 0, ivaFavor: 0 },
                            { mes: 'FEBRERO', importe: this.c_pfea.eneroFebrero, ivaCargo: 0, ivaFavor: 0 },
                            { mes: 'MARZO', importe: this.c_pfea.marzoDiciembre, ivaCargo: 0, ivaFavor: 0 },
                            { mes: 'ABRIL', importe: this.c_pfea.marzoDiciembre, ivaCargo: 0, ivaFavor: 0 },
                            { mes: 'MAYO', importe: this.c_pfea.marzoDiciembre, ivaCargo: 0, ivaFavor: 0 },
                            { mes: 'JUNIO', importe: this.c_pfea.marzoDiciembre, ivaCargo: 0, ivaFavor: 0 },
                            { mes: 'JULIO', importe: this.c_pfea.marzoDiciembre, ivaCargo: 0, ivaFavor: 0 },
                            { mes: 'AGOSTO', importe: this.c_pfea.marzoDiciembre, ivaCargo: 0, ivaFavor: 0 },
                            { mes: 'SEPTIEMBRE', importe: this.c_pfea.marzoDiciembre, ivaCargo: 0, ivaFavor: 0 },
                            { mes: 'OCTUBRE', importe: this.c_pfea.marzoDiciembre, ivaCargo: 0, ivaFavor: 0 },
                            { mes: 'NOVIEMBRE', importe: this.c_pfea.marzoDiciembre, ivaCargo: 0, ivaFavor: 0 },
                            { mes: 'DICIEMBRE', importe: this.c_pfea.marzoDiciembre, ivaCargo: 0, ivaFavor: 0 },
                        ]
                    };
                    let response = await axios.post(this.rutaAxios + 'Comparativa/PostComparativaAsync/erp_' + this.token.rfc, ObjData);
                    this.dialogC_PFEA = false;
                } catch (error) {
                    console.log(error)
                }
            },

            async PostPerdida() {
                try {
                    let ObjData = {
                        tipo: 'Perdida',
                        anio: this.selectedAnio,
                        comparativa: [
                            { mes: 'ENERO', importe: this.c_pfea.eneroFebrero, ivaCargo: 0, ivaFavor: 0 },
                            { mes: 'FEBRERO', importe: this.c_pfea.eneroFebrero, ivaCargo: 0, ivaFavor: 0 },
                            { mes: 'MARZO', importe: this.c_pfea.marzoDiciembre, ivaCargo: 0, ivaFavor: 0 },
                            { mes: 'ABRIL', importe: this.c_pfea.marzoDiciembre, ivaCargo: 0, ivaFavor: 0 },
                            { mes: 'MAYO', importe: this.c_pfea.marzoDiciembre, ivaCargo: 0, ivaFavor: 0 },
                            { mes: 'JUNIO', importe: this.c_pfea.marzoDiciembre, ivaCargo: 0, ivaFavor: 0 },
                            { mes: 'JULIO', importe: this.c_pfea.marzoDiciembre, ivaCargo: 0, ivaFavor: 0 },
                            { mes: 'AGOSTO', importe: this.c_pfea.marzoDiciembre, ivaCargo: 0, ivaFavor: 0 },
                            { mes: 'SEPTIEMBRE', importe: this.c_pfea.marzoDiciembre, ivaCargo: 0, ivaFavor: 0 },
                            { mes: 'OCTUBRE', importe: this.c_pfea.marzoDiciembre, ivaCargo: 0, ivaFavor: 0 },
                            { mes: 'NOVIEMBRE', importe: this.c_pfea.marzoDiciembre, ivaCargo: 0, ivaFavor: 0 },
                            { mes: 'DICIEMBRE', importe: this.c_pfea.marzoDiciembre, ivaCargo: 0, ivaFavor: 0 },
                        ]
                    };
                    let response = await axios.post(this.rutaAxios + 'Comparativa/PostComparativaAsync/erp_' + this.token.rfc, ObjData);
                    this.dialogC_PFEA = false;
                } catch (error) {
                    console.log(error)
                }
            },

            async PostRegistrados() {
                try {
                    let ObjData = {
                        tipo: 'RegistradosPPIsr',
                        anio: this.selectedAnio,
                        comparativa: [
                            { mes: 'ENERO', importe: this.registrados.enero, ivaCargo: 0, ivaFavor: 0 },
                            { mes: 'FEBRERO', importe: this.registrados.febrero, ivaCargo: 0, ivaFavor: 0 },
                            { mes: 'MARZO', importe: this.registrados.marzo, ivaCargo: 0, ivaFavor: 0 },
                            { mes: 'ABRIL', importe: this.registrados.abril, ivaCargo: 0, ivaFavor: 0 },
                            { mes: 'MAYO', importe: this.registrados.mayo, ivaCargo: 0, ivaFavor: 0 },
                            { mes: 'JUNIO', importe: this.registrados.junio, ivaCargo: 0, ivaFavor: 0 },
                            { mes: 'JULIO', importe: this.registrados.julio, ivaCargo: 0, ivaFavor: 0 },
                            { mes: 'AGOSTO', importe: this.registrados.agosto, ivaCargo: 0, ivaFavor: 0 },
                            { mes: 'SEPTIEMBRE', importe: this.registrados.septiembre, ivaCargo: 0, ivaFavor: 0 },
                            { mes: 'OCTUBRE', importe: this.registrados.octubre, ivaCargo: 0, ivaFavor: 0 },
                            { mes: 'NOVIEMBRE', importe: this.registrados.noviembre, ivaCargo: 0, ivaFavor: 0 },
                            { mes: 'DICIEMBRE', importe: this.registrados.diciembre, ivaCargo: 0, ivaFavor: 0 },
                        ]
                    };
                    let response = await axios.post(this.rutaAxios + 'Comparativa/PostComparativaAsync/erp_' + this.token.rfc, ObjData);
                } catch (error) {
                    console.log(error)
                }
            },

            ShowLoadingPost() {
                this.$q.loading.show({
                    spinner: QSpinnerCube,
                    spinnerColor: 'red-8',
                    spinnerSize: 140,
                    // backgroundColor: 'purple',
                    message: 'Guardando, espere...',
                    // messageColor: 'black'
                })
            },

            ShowLoadingGet() {
                this.$q.loading.show({
                    spinner: QSpinnerCube,
                    spinnerColor: 'red-8',
                    spinnerSize: 140,
                    // backgroundColor: 'purple',
                    message: 'Consultando, espere...',
                    // messageColor: 'black'
                })
            },

            //PRODUTOS FINANCIEROS
            async GetProductosFinancieros() {
                try {
                    this.itemsProductosFinancieros = [];
                    let año = this.selectedAnio.toString();
                    this.$q.loading.show({
                        spinner: QSpinnerCube,
                        spinnerColor: 'red-8',
                        spinnerSize: 140,
                        message: 'Consultando, espere...',
                    })
                    let response = await axios.get(this.rutaAxios + 'PagosProvisionales/GetRegistroManualAsync/erp_' + this.token.rfc + '/' + año + '/Productos_financieros')
                    this.dialogProductosFinancieros = true;
                    let x = response.data.comparativa;
                    this.itemsProductosFinancieros = [...x];
                    this.$q.loading.hide()
                } catch (error) {
                    console.log(error);
                    this.$q.loading.hide()
                }

            },

            async PostProductosfinancieros() {
                try {
                    this.$q.loading.show({
                        spinner: QSpinnerCube,
                        spinnerColor: 'red-8',
                        spinnerSize: 140,
                        message: 'Guardando, espere...',
                    })

                    let lista = [...this.itemsProductosFinancieros]
                    let año = this.selectedAnio;
                    let ObjProductos = {
                        anio: año,
                        tipo: "Productos_financieros",
                        comparativa: lista,
                    }
                    let response = await axios.post(this.rutaAxios + 'PagosProvisionales/PostRegistroManualAsync/erp_' + this.token.rfc, ObjProductos)
                    this.$q.notify({
                        type: 'positive',
                        message: `Productos financieros registrado con éxito`,
                        actions: [
                            { label: 'Cerrar', color: 'white', handler: () => { /* ... */ } }
                        ]
                    })
                    this.dialogProductosFinancieros = false;
                    this.$q.loading.hide()
                } catch (error) {
                    console.log(error);
                    this.$q.notify({
                        type: 'negative',
                        message: `Error al guardar, intente nuevamente`,
                        actions: [
                            { label: 'Cerrar', color: 'white', handler: () => { /* ... */ } }
                        ]
                    })
                    this.$q.loading.hide()
                }
            },

            async GetOtrosProductosFinancieros() {
                try {
                    this.itemsOtrosProductosFinancieros = [];
                    let año = this.selectedAnio.toString();
                    this.$q.loading.show({
                        spinner: QSpinnerCube,
                        spinnerColor: 'red-8',
                        spinnerSize: 140,
                        message: 'Consultando, espere...',
                    })
                    let response = await axios.get(this.rutaAxios + 'PagosProvisionales/GetRegistroManualAsync/erp_' + this.token.rfc + '/' + año + '/Otros_productos_financieros')
                    this.dialogOtrosProductosFinancieros = true;
                    let x = response.data.comparativa;
                    this.itemsOtrosProductosFinancieros = [...x];
                    this.$q.loading.hide()
                } catch (error) {
                    console.log(error);
                    this.$q.loading.hide()
                }

            },

            async PostOtrosProductosFinancieros() {
                try {
                    this.$q.loading.show({
                        spinner: QSpinnerCube,
                        spinnerColor: 'red-8',
                        spinnerSize: 140,
                        message: 'Guardando, espere...',
                    })

                    let lista = [...this.itemsOtrosProductosFinancieros]
                    let año = this.selectedAnio;
                    let ObjProductos = {
                        anio: año,
                        tipo: "Otros_productos_financieros",
                        comparativa: lista,
                    }
                    let response = await axios.post(this.rutaAxios + 'PagosProvisionales/PostRegistroManualAsync/erp_' + this.token.rfc, ObjProductos)
                    this.$q.notify({
                        type: 'positive',
                        message: `Otros productos financieros registrado con éxito`,
                        actions: [
                            { label: 'Cerrar', color: 'white', handler: () => { /* ... */ } }
                        ]
                    })
                    this.dialogOtrosProductosFinancieros = false;
                    this.$q.loading.hide()
                } catch (error) {
                    console.log(error);
                    this.$q.notify({
                        type: 'negative',
                        message: `Error al guardar, intente nuevamente`,
                        actions: [
                            { label: 'Cerrar', color: 'white', handler: () => { /* ... */ } }
                        ]
                    })
                    this.$q.loading.hide()
                }
            },

            //PAGOS PROVISIONALES V2.0
            async GetPagoIsrAcYScA() {
                try {
                    this.dataComprobantes = [];
                    //ASIGANMOS LOS VALORES DE LA TABLA
                    let columnas = [
                        { name: 'mes', align: 'left', label: 'Mes', field: 'mes' },
                        { name: 'ventas', align: 'right', label: 'Ventas', field: 'ventas' },
                        { name: 'productosFinancieros', align: 'right', label: 'Productos financieros', field: 'productosFinancieros' },
                        { name: 'otrosProductos', align: 'right', label: 'Otros productos financieros', field: 'otrosProductos' },
                        { name: 'anticipoDeClientes', align: 'right', label: 'Anticipo de clientes', field: 'anticipoDeClientes' },
                        { name: 'totalPeriodo', align: 'right', label: 'Total del periodo', field: 'totalPeriodo' },
                        { name: 'ingresoAcumulable', align: 'right', label: 'Ingreso Acumulable', field: 'ingresoAcumulable' },
                        { name: 'coeficienteUtilidad', align: 'right', label: 'Coeficiente de utilidad', field: 'coeficienteUtilidad' },
                        { name: 'utilidadFiscalEstimada', align: 'right', label: 'Utilidad fiscal estimada', field: 'utilidadFiscalEstimada' },
                        { name: 'ptu', align: 'right', label: 'PTU a aplicar en el periodo', field: 'ptu' },
                        { name: 'ptuAcumulada', align: 'right', label: 'PTU acumulada', field: 'ptuAcumulada' },
                        { name: 'anticipoCuentaUtilidades', align: 'right', label: 'Anticipo a cuenta de utilidades', field: 'anticipoCuentaUtilidades' },
                        { name: 'anticipoCuentaUtilidadesAcumulado', align: 'right', label: 'Anticipo a cuenta de utilidades acumulado', field: 'anticipoCuentaUtilidadesAcumulado' },
                        { name: 'resultadoFiscalPrevio', align: 'right', label: 'Resultado fiscal previo', field: 'resultadoFiscalPrevio' },
                        { name: 'perdidaDelEjercicioAnterior', align: 'right', label: 'Pérdida del ejercicio anterior', field: 'perdidaDelEjercicioAnterior' },
                        { name: 'baseParaIsr', align: 'right', label: 'Base para ISR', field: 'baseParaIsr' },
                        { name: 'tasaParaIsr', align: 'right', label: 'Tasa para ISR', field: 'tasaParaIsr' },
                        { name: 'pagoProvisionalIsr', align: 'right', label: 'Pago provisional ISR', field: 'pagoProvisionalIsr' },
                        { name: 'isrEnterado', align: 'right', label: 'ISR enterado', field: 'isrEnterado' },
                        { name: 'isrAPagar', align: 'right', label: 'ISR a pagar', field: 'isrAPagar' },
                        { name: 'impuestoregistrado', align: 'right', label: 'Impuesto Registrado', field: 'impuestoregistrado' },
                        { name: 'comparativa', align: 'right', label: 'Comparativa', field: 'comparativa' },
                    ]
                    this.columns = [...columnas]

                    this.$q.loading.show({
                        spinner: QSpinnerCube,
                        spinnerColor: 'red-8',
                        spinnerSize: 140,
                        message: 'Generando reporte, espere...',
                    })
                    const año = this.selectedAnio;
                    const mes = this.selectedMes.value;
                    let response = await axios.get(this.rutaAxios + 'PagosProvisionales/GetPagoIsrAcYScAsync/erp_' + this.token.rfc + '/' + año + '/' + mes);
                    // console.log(response.data);
                    this.dataComprobantes = [...response.data];
                    this.$q.loading.hide();
                } catch (error) {
                    console.log(error);
                    this.$q.loading.hide();
                }
            },

            //REGIMEN FISCAL
            async GetRegimen() {
                try {
                    this.$q.loading.show({
                        spinner: QSpinnerCube,
                        spinnerColor: 'red-8',
                        spinnerSize: 140,
                        message: 'Consultando, espere...',
                    })
                    this.añosRegimen = [];
                    let response = await axios.get(this.rutaAxios + 'PagosProvisionales/GetRegimenEmpresaAsync/erp_' + this.token.rfc)
                    let x = [...response.data];
                    this.añosRegimen = [...x];
                    this.dialogRegimen = true;
                    this.$q.loading.hide()
                } catch (error) {
                    console.log(error)
                    this.$q.loading.hide()
                }
            },

            async PostRegimen() {
                console.log(this.añosRegimen);
                try {
                    this.$q.loading.show({
                        spinner: QSpinnerCube,
                        spinnerColor: 'red-8',
                        spinnerSize: 140,
                        message: 'Guardando, espere...',
                    })
                    for (var a of this.añosRegimen) {
                        let ObjRegimen = { ...a };
                        console.log(ObjRegimen)
                        let response = await axios.post(this.rutaAxios + 'PagosProvisionales/PostRegimenEmpresaAsync/erp_' + this.token.rfc, ObjRegimen);
                    }
                    this.dialogRegimen = false;
                    this.$q.loading.hide();
                } catch (error) {
                    console.log(error)
                    this.$q.loading.hide();
                }
            },


        },
    }

</script>