<template>
  <div style="width: 100%;">

    <!-- DIALOG PARA VER LOS PDF -->
    <q-dialog v-model="dialogComprobante" persistent transition-show="scale" transition-hide="scale" maximized>
      <visor-pdf @CloseDialogPdf="CloseDialogPdf"></visor-pdf>
    </q-dialog>

    <!-- DIALG DE LOS DETALLES -->
    <q-dialog v-model="dialogDetalles" transition-show="scale" transition-hide="scale" maximized>
      <!-- SELECCIONA AÑO Y MES, BOTON DE BUSCAR Y EXPORTAR A EXCEL -->
      <q-card flat>
        <q-card-section>
          <div class="row no-wrap items-center q-mt-md q-pa-sm">
            <q-btn push color="red-14" icon="mdi-close" rounded flat size="18px" padding="xs" v-close-popup>
              <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                :offset="[10, 10]">Cerrar</q-tooltip>
            </q-btn>
            <q-space />
            <div class="text-h5">{{ tipoReporte }}</div>
            <q-space />
            <q-btn push color="green-10" @click="ExportExcelDetalles" icon="mdi-file-excel-box-outline" rounded flat
              size="18px" padding="xs">
              <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                :offset="[10, 10]">Exportar Excel</q-tooltip>
            </q-btn>
          </div>
          <div class="row no-wrap justify-center">
            <q-chip color="primary" text-color="white">
              {{ 'Suma Parcial: ' + formatCurrency(sumaSeleccionado) }}
            </q-chip>
          </div>
        </q-card-section>
        <q-table selection="multiple" :selected.sync="itemsSeleccion" title="Comprobantes" :data="itemDetalles"
          :columns="columnsDetalles" row-key="folioFiscal" :rows-per-page-options="[10]" class="my-sticky-column-table"
          :filter="filterDetalles">
          <template v-slot:top>
            <!-- <span class="text-body1" content-style="font-size: 20px">Reporte por uso de CFDI {{FormatCurrency(sumaFinal)}}</span> -->
            <q-space />
            <q-input borderless dense debounce="300" v-model="filterDetalles" placeholder="Filtrar">
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </template>
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="uso" :props="props">{{ props.row.uso }}</q-td>
              <q-td auto-width>
                <q-checkbox v-model="props.selected" />

                <q-btn size="md" color="primary" rounded flat dense @click="OpenDialogComprobante(props.row)"
                  icon="mdi-file-pdf-box">
                  <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                    :offset="[10, 10]">PDF</q-tooltip>
                </q-btn>
              </q-td>
              <q-td key="folioFiscal" :props="props">{{ props.row.folioFiscal }}</q-td>
              <q-td key="serie" :props="props">{{ props.row.serie }}</q-td>
              <q-td key="folio" :props="props">{{ props.row.folio }}</q-td>
              <q-td key="fecha" :props="props">{{ props.row.fecha }}</q-td>
              <q-td key="rfc" :props="props">{{ props.row.rfc }}</q-td>
              <q-td key="nombre" :props="props">{{ props.row.nombre }}</q-td>
              <q-td key="subTotal" :props="props">{{ FormatCurrency(props.row.subTotal) }}</q-td>
              <q-td key="descuento" :props="props">{{ FormatCurrency(props.row.descuento) }}</q-td>
              <q-td key="total" :props="props">{{ FormatCurrency(props.row.total) }}</q-td>
              <q-td key="moneda" :props="props">{{ props.row.moneda }}</q-td>
              <q-td key="tipoCambio" :props="props">{{ FormatCurrency(props.row.tipoCambio) }}</q-td>
              <q-td key="claveProdServ" :props="props">{{ props.row.claveProdServ }}</q-td>
              <q-td key="descripcion" :props="props">{{ props.row.descripcion }}</q-td>
            </q-tr>
          </template>
          <template v-slot:bottom-row>
            <q-tr>
              <q-td colspan="100%" class="text-center">
                <q-chip color="primary" text-color="white">
                  {{ 'Subtotal: ' + formatCurrency(sumaSubtotal) }}
                </q-chip>
                <q-chip color="primary" text-color="white">
                  {{ 'Descuento: ' + formatCurrency(sumaDescuento) }}
                </q-chip>
                <q-chip color="primary" text-color="white">
                  {{ 'Total: ' + formatCurrency(sumaTotal) }}
                </q-chip>
              </q-td>
            </q-tr>
          </template>
        </q-table>

      </q-card>
    </q-dialog>

    <div class="titulo-reporte">
      REPORTE USO DE CFDI | EMITIDOS Y RECIBIDOS
    </div>
    <div v-if="items && items.contenido">
      <div v-for="(registros, mes) in items.contenido" :key="mes" class="q-mb-md">
        <q-table :data="registros" :columns="columns" row-key="usoCfdi" flat bordered class="shadow-0 border-0" dense
          :title="mes">
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="usoCfdi" :props="props">{{ props.row.usoCfdi }}</q-td>
              <q-td key="contadorEmitidos" class="hover-foliofiscal-cfdi" :props="props"
                @click="verDetallesE(props.row, mes)">{{ props.row.contadorEmitidos
                }}</q-td>
              <q-td key="importeEmitido" :props="props">{{ formatCurrency(props.row.importeEmitido) }}</q-td>
              <q-td key="contadorRecibidos" :props="props" @click="verDetallesR(props.row, mes)">{{
                props.row.contadorRecibidos }}</q-td>
              <q-td key="importeRecibido" :props="props">{{ formatCurrency(props.row.importeRecibido) }}</q-td>
            </q-tr>
          </template>
        </q-table>
        <q-table :data="[getTotales(registros)]" :columns="columnsTotales" dense flat bordered row-key="usoCfdi"
          class="shadow-0 border-0 q-mt-sm" hide-header hide-bottom>
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="usoCfdi" :props="props"><strong>Total</strong></q-td>
              <q-td key="contadorEmitidos" :props="props">{{ props.row.contadorEmitidos }}</q-td>
              <q-td key="importeEmitido" :props="props">{{ formatCurrency(props.row.importeEmitido) }}</q-td>
              <q-td key="contadorRecibidos" :props="props">{{ props.row.contadorRecibidos }}</q-td>
              <q-td key="importeRecibido" :props="props">{{ formatCurrency(props.row.importeRecibido) }}</q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
    </div>
  </div>
</template>
<script>
  import { QSpinnerCube } from 'quasar'
  import axios from 'axios'
  import moment from 'moment'
  import * as XLSX from 'xlsx';
  import { format, lastDayOfMonth, differenceInDays, parseISO, utcToZonedTime } from 'date-fns';
  import { es } from 'date-fns/locale';
  import visorPdf from '../../Pdf/VisorPdf.vue'
  import { generarCodigoQR } from '../../Pdf/qrcodeGenerator';
  import { ComprobanteBase64 } from '../../Pdf/ComprobanteBase64.js'

  export default {
    components: {
      visorPdf
    },
    data() {
      return {
        columns: [
          { name: 'usoCfdi', label: 'CFDI', align: 'left', field: 'usoCfdi', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-cfdi justify-center text-white' },
          { name: 'contadorEmitidos', label: '# Emitidos', align: 'center', field: 'contadorEmitidos', sortable: true, classes: 'bg-grey-2   ellipsis hover-foliofiscal-cfdi', headerClasses: 'bgc-cfdi text-white', },
          { name: 'importeEmitido', label: 'Importe Emitido', align: 'right', field: 'importeEmitido', sortable: true, classes: 'bg-grey-2  ellipsis ', headerClasses: 'bgc-cfdi text-white' },
          { name: 'contadorRecibidos', label: '# Recibidos', align: 'center', field: 'contadorRecibidos', sortable: true, classes: 'bg-grey-2 ellipsis hover-foliofiscal-cfdi', headerClasses: 'bgc-cfdi text-white' },
          { name: 'importeRecibido', label: 'Importe Recibido', align: 'right', field: 'importeRecibido', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-cfdi text-white' },
        ],
        columnsTotales: [
          { name: 'usoCfdi', label: 'CFDI', align: 'left', field: 'usoCfdi', sortable: true, classes: 'total-row ellipsis', headerClasses: 'bgc-cfdi justify-center text-white' },
          { name: 'contadorEmitidos', label: '# Emitidos', align: 'center', field: 'contadorEmitidos', sortable: true, classes: 'total-row ellipsis', headerClasses: 'bgc-cfdi text-white', },
          { name: 'importeEmitido', label: 'Importe Emitido', align: 'right', field: 'importeEmitido', sortable: true, classes: 'total-row ellipsis', headerClasses: 'bgc-cfdi text-white' },
          { name: 'contadorRecibidos', label: '# Recibidos', align: 'center', field: 'contadorRecibidos', sortable: true, classes: 'total-row ellipsis ', headerClasses: 'bgc-cfdi text-white' },
          { name: 'importeRecibido', label: 'Importe Recibido', align: 'right', field: 'importeRecibido', sortable: true, classes: 'total-row ellipsis', headerClasses: 'bgc-cfdi text-white' },
        ],
        itemsReporte: [],
        //DETALLES
        tipoReporte: '',
        dialogDetalles: false,
        itemDetalles: [],
        columnsDetalles: [
          // { name: 'actions', align: 'left', label: 'Acciones', field: 'actions' },
          { name: 'folioFiscal', align: 'left', label: 'Folio fiscal', field: 'folioFiscal', sortable: true },
          { name: 'serie', align: 'left', label: 'Serie', field: 'serie', sortable: true },
          { name: 'folio', align: 'left', label: 'Folio', field: 'folio', sortable: true },
          { name: 'fecha', align: 'left', label: 'Fecha', field: 'fecha', sortable: true },
          { name: 'rfc', align: 'left', label: 'RFC', field: 'rfc', sortable: true },
          { name: 'nombre', align: 'left', label: 'Nombre', field: 'nombre', sortable: true },
          { name: 'subTotal', align: 'right', label: 'Subtotal', field: 'subTotal', sortable: true },
          { name: 'descuento', align: 'right', label: 'Descuento', field: 'descuento', sortable: true },
          { name: 'total', align: 'right', label: 'Total', field: 'total', sortable: true },
          { name: 'moneda', align: 'left', label: 'Moneda', field: 'moneda', sortable: true },
          { name: 'tipoCambio', align: 'right', label: 'Tipo de cambio', field: 'tipoCambio', sortable: true },
          { name: 'claveProdServ', align: 'right', label: 'Clave prod. serv.', field: 'claveProdServ', sortable: true },
          { name: 'descripcion', align: 'right', label: 'Descripción', field: 'descripcion', sortable: true },
        ],
        filterDetalles: '',
        dialogComprobante: false,
        itemsSeleccion: [],
        usoCfdiItem: '',

      }
    },
    computed: {
      token() {
        return this.$store.state.usuario;
      },
      items() {
        return this.$store.state.dataViewReporte[1];
      },
      fechas() {
        return this.$store.state.fechasReporteEmpresarialStore;
      },
      rutaAxios() {
        return this.$store.state.rutaMongoStore
      },
      sumaTotal() {
        return this.itemDetalles.reduce((acumulador, objeto) => acumulador + objeto.total, 0);
      },

      sumaDescuento() {
        return this.itemDetalles.reduce((acumulador, objeto) => acumulador + objeto.descuento, 0);
      },

      sumaSubtotal() {
        return this.itemDetalles.reduce((acumulador, objeto) => acumulador + objeto.subTotal, 0);
      },

      sumaSeleccionado() {
        return this.itemsSeleccion.reduce((acumulador, objeto) => acumulador + objeto.total, 0);
      }
    },
    methods: {
      formatCurrency(value) {
        return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
      },
      getTotales(registros) {
        return {
          usoCfdi: 'Total',
          contadorEmitidos: registros.reduce((sum, r) => sum + (r.contadorEmitidos || 0), 0),
          importeEmitido: registros.reduce((sum, r) => sum + (r.importeEmitido || 0), 0),
          contadorRecibidos: registros.reduce((sum, r) => sum + (r.contadorRecibidos || 0), 0),
          importeRecibido: registros.reduce((sum, r) => sum + (r.importeRecibido || 0), 0)
        };
      },
      async verDetallesR(item, mes) {
        this.itemsReporte = [];
        this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'red-8', spinnerSize: 140, message: 'Consultando Emitidos...' })
        const ingresos = await this.GetGastos(mes);

        const unicos = await this.ObtieneUsoCfdi(ingresos);

        unicos.forEach(e => {
          let objIngreso = ingresos.find(f => f.usoCfdi === e);

          let ingresoTotal = 0;
          let detallesE = [];
          if (objIngreso) {
            ingresoTotal = objIngreso.total;
            detallesE = objIngreso.detalles;
          }

          let objNuevo = {
            uso: e,
            emitidos: ingresoTotal,
            detallesE: detallesE,
          }
          this.itemsReporte.push(objNuevo);
        });

        console.log(this.itemsReporte)
        let detalle = this.itemsReporte.filter(x => x.uso == item.usoCfdi);
        console.log('detalle', detalle)
        this.itemDetalles = [];
        this.tipoReporte = 'RECIBIDOS - ' + item.usoCfdi;
        this.usoCfdiItem = item.usoCfdi
        this.itemDetalles = [...detalle[0].detallesE];
        this.dialogDetalles = true;
        this.$q.loading.hide()
      },
      async verDetallesE(item, mes) {
        this.itemsReporte = [];
        this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'red-8', spinnerSize: 140, message: 'Consultando Emitidos...' })
        const ingresos = await this.GetIngresos(mes);

        const unicos = await this.ObtieneUsoCfdi(ingresos);

        unicos.forEach(e => {
          let objIngreso = ingresos.find(f => f.usoCfdi === e);

          let ingresoTotal = 0;
          let detallesE = [];
          if (objIngreso) {
            ingresoTotal = objIngreso.total;
            detallesE = objIngreso.detalles;
          }

          let objNuevo = {
            uso: e,
            emitidos: ingresoTotal,
            detallesE: detallesE,
          }
          this.itemsReporte.push(objNuevo);
        });

        console.log(this.itemsReporte)
        let detalle = this.itemsReporte.filter(x => x.uso == item.usoCfdi);
        console.log('detalle', detalle)
        this.itemDetalles = [];
        this.tipoReporte = 'EMITIDOS - ' + item.usoCfdi;
        this.usoCfdiItem = item.usoCfdi
        this.itemDetalles = [...detalle[0].detallesE];
        this.dialogDetalles = true;
        this.$q.loading.hide()
      },

      async GetIngresos(mes) {
        try {

          const nombresMeses = [
            'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
            'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
          ];

          const numeroMes = nombresMeses.indexOf(mes.toLowerCase()) + 1;
          const año = this.fechas.anio;

          const mesFormateado = numeroMes.toString().padStart(2, '0');

          const fI = `${año}-${mesFormateado}-01`;

          const ultimoDia = new Date(año, numeroMes, 0).getDate(); // número de día
          const fF = `${año}-${mesFormateado}-${ultimoDia.toString().padStart(2, '0')}`;

          let response = await axios.get(this.rutaAxios + 'Consultas/GetReporteUsoCfdiIngresosAsync/erp_' + this.token.rfc + '/' + fI + '/' + fF);
          console.log(response.data)
          return response.data
        } catch (error) {
          console.log(error);
        }
      },

      async GetGastos(mes) {
        try {
          const nombresMeses = [
            'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
            'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
          ];

          const numeroMes = nombresMeses.indexOf(mes.toLowerCase()) + 1;
          const año = this.fechas.anio;

          const mesFormateado = numeroMes.toString().padStart(2, '0');

          const fI = `${año}-${mesFormateado}-01`;

          const ultimoDia = new Date(año, numeroMes, 0).getDate(); // número de día
          const fF = `${año}-${mesFormateado}-${ultimoDia.toString().padStart(2, '0')}`;

          let response = await axios.get(this.rutaAxios + 'Consultas/GetReporteUsoCfdiGastosAsync/erp_' + this.token.rfc + '/' + fI + '/' + fF);
          return response.data
        } catch (error) {
          console.log(error);
        }
      },

      async getReporte() {

        this.itemsReporte = [];
        this.$q.loading.show({ spinner: QSpinnerCube, spinnerColor: 'red-8', spinnerSize: 140, message: 'Consultando Emitidos...' })
        const ingresos = await this.GetIngresos();


        const unicos = await this.ObtieneUsoCfdi(ingresos);

        //CREAMOS EL CONTENIDO DE LA TABLA
        unicos.forEach(e => {
          let objIngreso = ingresos.find(f => f.usoCfdi === e);

          let ingresoTotal = 0;
          let detallesE = [];
          if (objIngreso) {
            ingresoTotal = objIngreso.total;
            detallesE = objIngreso.detalles;
          }

          let gastoTotal = 0;
          let detallesR = [];
          if (objGasto) {
            gastoTotal = objGasto.total;
            // gastoTotal = objGasto.subTotal - objGasto.descuento;
            detallesR = objGasto.detalles;
          }

          let objNuevo = {
            uso: e,
            emitidos: ingresoTotal,
            detallesE: detallesE,
            recibidos: gastoTotal,
            detallesR: detallesR,
          }
          this.itemsReporte.push(objNuevo);
        });
      },

      async ObtieneUsoCfdi(...listas) {
        console.log(listas)
        const usoUnicos = new Set();
        listas.forEach(lista => {
          lista.forEach(objeto => {
            usoUnicos.add(objeto.usoCfdi);
          });
        });
        return Array.from(usoUnicos);
      },

      async OpenDialogComprobante(item) {
        const tipo = this.tipoReporte.split("-")[0].trim();
        console.log("Item", item)
        console.log("Tipo", tipo)
        if (tipo === 'EMITIDOS') {
          await this.VerComprobanteE(item.folioFiscal);
        } else if (tipo === 'RECIBIDOS') {
          await this.VerComprobanteR(item.folioFiscal);
        } else if (tipo === 'NÓMINA') {
          await this.VerComprobanteN(item.folioFiscal);
        }
      },

      CloseDialogPdf() {
        this.dialogComprobante = false;
      },

      async VerComprobanteE(item) {
        console.log(item);
        try {
          this.$store.state.vistaPreviaStore.folioFiscal = item;
          this.$store.state.vistaPreviaStore.color = "19775C"
          this.$store.state.vistaPreviaStore.tipoComprobanteInterno = "FACTURA"
          this.$store.state.vistaPreviaStore.tipo = "E"
          this.$store.state.vistaPreviaStore.rfc = this.token.rfc
          this.dialogComprobante = true;
        } catch (error) {
          console.log(error)
        }
      },

      async VerComprobanteR(item) {
        try {
          this.$store.state.vistaPreviaStore.folioFiscal = item;
          this.$store.state.vistaPreviaStore.color = "19775C"
          this.$store.state.vistaPreviaStore.tipoComprobanteInterno = "FACTURA"
          this.$store.state.vistaPreviaStore.tipo = "R"
          this.$store.state.vistaPreviaStore.rfc = this.token.rfc
          this.dialogComprobante = true;
        } catch (error) {
          console.log(error)
        }
      },

      async VerComprobanteE(item) {
        console.log(item);
        try {
          this.$store.state.vistaPreviaStore.folioFiscal = item;
          this.$store.state.vistaPreviaStore.color = "19775C"
          this.$store.state.vistaPreviaStore.tipoComprobanteInterno = "FACTURA"
          this.$store.state.vistaPreviaStore.tipo = "E"
          this.$store.state.vistaPreviaStore.rfc = this.token.rfc
          this.dialogComprobante = true;
        } catch (error) {
          console.log(error)
        }
      },

      async VerComprobanteR(item) {
        try {
          this.$store.state.vistaPreviaStore.folioFiscal = item;
          this.$store.state.vistaPreviaStore.color = "19775C"
          this.$store.state.vistaPreviaStore.tipoComprobanteInterno = "FACTURA"
          this.$store.state.vistaPreviaStore.tipo = "R"
          this.$store.state.vistaPreviaStore.rfc = this.token.rfc
          this.dialogComprobante = true;
        } catch (error) {
          console.log(error)
        }
      },

      FormatCurrency(value) {
        return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
      },

      formatCurrency(value) {
        return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
      },

      // ExportExcel() {
      //   let fi_ = new Date(this.fechaI);
      //   let ff_ = new Date(this.fechaF);

      //   let fI = format(fi_, 'dd-MMMM-yyyy', { locale: es })
      //   let fF = format(ff_, 'dd-MMMM-yyyy', { locale: es })

      //   const workbook = XLSX.utils.book_new();

      //   const sheetOtros = XLSX.utils.json_to_sheet(this.itemsReporte);
      //   XLSX.utils.book_append_sheet(workbook, sheetOtros, 'USO CFDI');

      //   XLSX.writeFile(workbook, 'USO DE CFDI DEL ' + fI + ' AL ' + fF + '.xlsx');
      // },

      ExportExcel() {
            let reporte = 'REPORTE DE USO DEL CFDI'
            let empresa = this.$store.state.empresaStore.nombre
            let fi_ = new Date(this.fechaI);
        let ff_ = new Date(this.fechaF);

        let fI = format(fi_, 'dd-MMMM-yyyy', { locale: es })
        let fF = format(ff_, 'dd-MMMM-yyyy', { locale: es })
            let periodo = fI + ' AL ' + fF 

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

            const dataExcel = this.itemsReporte.map(row => {
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

            xlsx.utils.book_append_sheet(workbook, sheet, "USO CFDI");

            xlsx.writeFile(
                workbook,
                rfc + ' - ' + empresa +  ' - REPORTE USO DE CFDI DEL ' + periodo.toUpperCase() + '.xlsx'
            );
            },

      ExportExcelDetalles() {
        let fi_ = new Date(this.fechaI);
        let ff_ = new Date(this.fechaF);

        let fI = format(fi_, 'dd-MMMM-yyyy', { locale: es })
        let fF = format(ff_, 'dd-MMMM-yyyy', { locale: es })

        const workbook = XLSX.utils.book_new();

        const sheetOtros = XLSX.utils.json_to_sheet(this.itemDetalles);
        XLSX.utils.book_append_sheet(workbook, sheetOtros, 'USO CFDI');

        XLSX.writeFile(workbook, this.tipoReporte + ' - ' + this.usoCfdiItem + ' DEL ' + fI + ' AL ' + fF + '.xlsx');
      },

      ExportExcel() {
            let reporte = this.tipoReporte.toUpperCase() + ' - ' + this.usoCfdiItem.toUpperCase()
            let empresa = this.$store.state.empresaStore.nombre
            let rfc = this.$store.state.empresaStore.rfc
           
            let fi_ = new Date(this.fechaI);
        let ff_ = new Date(this.fechaF);

        let fI = format(fi_, 'dd-MMMM-yyyy', { locale: es })
        let fF = format(ff_, 'dd-MMMM-yyyy', { locale: es })

            let periodo = fI + ' AL ' + fF 

            const workbook = xlsx.utils.book_new();

            const cabecera = [
                [reporte],
                ["EMPRESA:", empresa.toUpperCase()],
                ["RFC:", rfc.toUpperCase()],
                ["PERIODO:",periodo.toUpperCase()],
                // ["FECHA REPORTE:", new Date()],
                [],
            ];

            const columnasExcel = this.columnsDetalles.filter(
                col => col.name !== "actions"
            );

            const dataExcel = this.itemDetalles.map(row => {
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

            xlsx.utils.book_append_sheet(workbook, sheet, "DETALLES");

            xlsx.writeFile(
                workbook,
                rfc + ' - ' + empresa +  ' - ' + reporte.toUpperCase() + ' DEL ' +periodo.toUpperCase() + '.xlsx'
            );
            },

      UltimoDiaMes() {
        const fecha = new Date(this.fechaI);

        const ultimoDiaDelMes = lastDayOfMonth(fecha);

        const fechaFormateada = format(ultimoDiaDelMes, 'yyyy-MM-dd');

        // const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
        this.fechaF = fechaFormateada;
      },
    },
  }
</script>
<style>
  .bgc-cfdi {
    background-color: #E3A612 !important;
    text-align: center !important;
  }

  .total-row {
    background-color: #FFEBA1 !important;
    font-weight: bold;
  }

  .titulo-reporte {
    background-color: #fff;
    color: #E3A612;
    font-size: 20px;
    font-weight: bold;
    padding: 10px 20px;
    text-align: center;
    border-bottom: 2px solid #E3A612;
    font-family: Arial, sans-serif;
  }

  .hover-foliofiscal-cfdi:hover {
    background-color: #FFEBA1 !important;
    cursor: pointer;
  }
</style>