<template>
    <div class="q-pa-md">
        <!-- DIALOG PARA VER LOS PDF -->
        <q-dialog v-model="dialogPdf" persistent transition-show="scale" transition-hide="scale" maximized>
            <visor-pdf @CloseDialogPdf="CloseDialogPdf"></visor-pdf>
        </q-dialog>

        <!-- DIALOG PARA BUSCAR LOS FALTANTES -->
        <q-dialog v-model="dialogBusca" transition-show="scale" transition-hide="scale">
            <q-card>
                <q-card-section>
                    <q-input outlined v-model="minimo" label="Mínimo" />
                    <q-input outlined v-model="maximo" label="Máximo" />
                  </q-card-section>
                  <q-card-actions>
                    <q-btn flat @click="Faltantes">Validar</q-btn>
                  </q-card-actions>
            </q-card>
        </q-dialog>

        <!-- TABLA DE COMPROBANTES -->
        <q-table title="Reporte ISR" :data="comprobante.detalles" :columns="columns" row-key="rfc"
            :rows-per-page-options="[10]" :filter="filter" class="my-sticky-column-table">
            <template v-slot:top>
                <q-btn push color="red-12" v-close-popup icon="mdi-close" rounded flat size="18px" padding="xs">
                    <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                        :offset="[10, 10]">Cerrar</q-tooltip>
                </q-btn>
                <q-space />
                <span class="text-body1" content-style="font-size: 20px">{{ comprobante.tipo }}</span>
                <q-space />
                <q-input borderless dense debounce="300" v-model="filter" placeholder="Filtrar">
                    <template v-slot:append>
                        <q-icon name="mdi-magnify" />
                    </template>
                </q-input>
                <q-btn push color="green-10" @click="ExportExcel()" icon="mdi-file-excel-box-outline" rounded flat
                    size="18px" padding="xs">
                    <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                        :offset="[10, 10]">Exportar Excel</q-tooltip>
                </q-btn>
                <!-- <q-btn push color="blue-10" @click="ObtenerDespacho()" icon="mdi-file-arrow-left-right-outline" rounded flat
                    size="18px" padding="xs">
                    <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                        :offset="[10, 10]">Obtener despacho de descripción</q-tooltip>
                </q-btn> -->
                <q-btn push color="red-10" @click="Duplicados()" icon="mdi-content-duplicate" rounded flat
                    size="18px" padding="xs">
                    <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                        :offset="[10, 10]">Obtener duplicados</q-tooltip>
                </q-btn>
                <!-- <q-btn push color="orange-10" @click="OpenDialogBuscarVentas()" icon="mdi-file-find-outline" rounded flat
                    size="18px" padding="xs">
                    <q-tooltip transition-show="flip-right" transition-hide="flip-left" content-style="font-size: 14px"
                        :offset="[10, 10]">Validar Consecutivos</q-tooltip>
                </q-btn> -->
            </template>

            <template v-slot:body="props">
                <q-tr :props="props">
                    <q-td auto-width>
                        <q-btn size="md" color="red-10" rounded flat dense @click="VerComprobante(props.row)"
                            icon="mdi-file-pdf-box">
                            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                                content-style="font-size: 14px" :offset="[10, 10]">Ver Comprobante</q-tooltip>
                        </q-btn>
                    </q-td>

                    <q-td key="noVenta" :props="props">{{ props.row.noVenta }}</q-td>
                    <q-td key="noIdentificacion" :props="props">{{ props.row.noIdentificacion }}</q-td>
                    <q-td key="descripcion" :props="props">{{ props.row.descripcion }}</q-td>
                    <q-td key="cantidad" :props="props">{{ FormatoCantidad(props.row.cantidad) }}</q-td>
                    <q-td key="unidad" :props="props">{{ props.row.unidad }}</q-td>
                    <q-td key="valorUnitario" :props="props">{{ FormatCurrency(props.row.valorUnitario) }}</q-td>
                    <q-td key="descuento" :props="props">{{ FormatCurrency(props.row.descuento) }}</q-td>
                    <q-td key="importe" :props="props">{{ FormatCurrency(props.row.importe) }}</q-td>
                    <q-td key="iva" :props="props">{{ FormatCurrency(props.row.iva) }}</q-td>
                    <q-td key="ieps" :props="props">{{ FormatCurrency(props.row.ieps) }}</q-td>
                    <q-td key="total" :props="props">{{ FormatCurrency(props.row.total) }}</q-td>
                    <q-td key="claveProdServ" :props="props">{{ props.row.claveProdServ }}</q-td>
                    <q-td key="claveUnidad" :props="props">{{ props.row.claveUnidad }}</q-td>
                    <q-td key="serie" :props="props">{{ props.row.serie }}</q-td>
                    <q-td key="folio" :props="props">{{ props.row.folio }}</q-td>
                    <q-td key="fecha" :props="props">{{ FormatDate(props.row.fecha) }}</q-td>
                    <q-td key="rfc" :props="props">{{ props.row.rfc }}</q-td>
                    <q-td key="nombre" :props="props">{{ props.row.nombre }}</q-td>
                    <q-td key="metodoPago" :props="props">{{ props.row.metodoPago }}</q-td>
                    <q-td key="formaPago" :props="props">{{ props.row.formaPago }}</q-td>
                    <q-td key="folioFiscal" :props="props">{{ props.row.folioFiscal }}</q-td>
                    <q-td key="tipoComprobante" :props="props">{{ props.row.tipoComprobante }}</q-td>
                </q-tr>
            </template>

        </q-table>
    </div>
</template>
<script>
import axios from 'axios'
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { parse } from 'date-fns';
import { es } from 'date-fns/locale';
import visorPdf from '../Pdf/VisorPdf.vue'
import { QSpinnerCube } from 'quasar';
import { ComprobanteBase64 } from '../Pdf/ComprobanteBase64.js'
import { ComprobantePagoBase64 } from '../Pdf/ComprobantePagoBase64.js';
import { generarCodigoQR } from '../Pdf/qrcodeGenerator';

export default {
    components: {
        visorPdf
    },
    data() {
        return {
            columns: [
                { name: 'actions', align: 'left', label: 'Acciones', field: 'actions' },
                { name: 'noVenta', align: 'left', label: 'No. Venta', field: 'noVenta', sortable: true },
                { name: 'noIdentificacion', align: 'left', label: 'No. Identificación', field: 'noIdentificacion', sortable: true },
                { name: 'descripcion', align: 'left', label: 'Descripción', field: 'descripcion', sortable: true },
                { name: 'cantidad', align: 'right', label: 'Cantidad', field: 'cantidad', sortable: true },
                { name: 'unidad', align: 'left', label: 'Unidad', field: 'unidad', sortable: true },
                { name: 'valorUnitario', align: 'right', label: 'Valor Unitario', field: 'valorUnitario', sortable: true },
                { name: 'descuento', align: 'right', label: 'Descuento', field: 'descuento', sortable: true },
                { name: 'importe', align: 'right', label: 'Importe', field: 'importe', sortable: true },
                { name: 'iva', align: 'right', label: 'IVA', field: 'iva', sortable: true },
                { name: 'ieps', align: 'right', label: 'IEPS', field: 'ieps', sortable: true },
                { name: 'total', align: 'right', label: 'Total', field: 'total', sortable: true },
                { name: 'claveProdServ', align: 'left', label: 'Clave. Prod. Serv.', field: 'claveProdServ', sortable: true },
                { name: 'claveUnidad', align: 'left', label: 'Clave Unidad', field: 'claveUnidad', sortable: true },
                { name: 'serie', align: 'left', label: 'Serie', field: 'serie', sortable: true },
                { name: 'folio', align: 'left', label: 'Folio', field: 'folio', sortable: true },
                { name: 'fecha', align: 'left', label: 'Fecha', field: 'fecha', sortable: true },
                { name: 'rfc', align: 'left', label: 'RFC', field: 'rfc', sortable: true },
                { name: 'nombre', align: 'left', label: 'Nombre', field: 'nombre', sortable: true },
                { name: 'metodoPago', align: 'left', label: 'Método de Pago', field: 'metodoPago', sortable: true },
                { name: 'formaPago', align: 'left', label: 'Forma de Pago', field: 'formaPago', sortable: true },
                { name: 'folioFiscal', align: 'left', label: 'Folio Fiscal', field: 'folioFiscal', sortable: true },
                { name: 'tipoComprobante', align: 'left', label: 'Tipo de Comprobante', field: 'tipoComprobante', sortable: true },
            ],
            dataComprobantes: [],
            filter: '',

            dialogPdf: false,

            dialogBusca: false,

            maximo: 0,
            minimo: 0,
        }
    },
    computed: {
        token() {
            return this.$store.state.usuario;
        },

        rutaAxios() {
            return this.$store.state.rutaMongoStore
        },

        comprobante() {
            return this.$store.state.detalleVentasGasolineria;
        },

    },
    created() {

    },
    methods: {
        FormatCurrency(value) {
            if (value === '---') {
                return '';
            } else {
                let respuesta = value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
                return respuesta;
            }
        },

        FormatoCantidad(numero) {
            const numeroConDecimales = Number(numero).toFixed(3);
            return numeroConDecimales.replace(/\d(?=(\d{3})+\.)/g, '$&,')
        },

        FormatDate(value) {
            let fecha_ = value.replace('T', ' ')
            let fecha_1 = fecha_.replace('Z', '')
            const date = new Date(fecha_1);
            const formattedDate = format(date, 'dd-MMMM-yyyy', { locale: es })
            const final = formattedDate.toString()
            return final;
        },

        ExportExcel() {
            let empresa = this.$store.state.empresaStore.nombre
            let rfc = this.$store.state.empresaStore.rfc

            if (this.comprobante.tipo.includes('VENTAS')) {
                const workbook = XLSX.utils.book_new();
                const sheetTrabajadores = XLSX.utils.json_to_sheet(this.comprobante.detalles);
                XLSX.utils.book_append_sheet(workbook, sheetTrabajadores, 'VENTAS DET');
                XLSX.writeFile(workbook,    rfc + ' - ' + empresa +  ' - REPORTE DE VENTAS.xlsx');
            } else if (this.comprobante.tipo.includes('COMPRAS')) {
                const workbook = XLSX.utils.book_new();
                const sheetTrabajadores = XLSX.utils.json_to_sheet(this.comprobante.detalles);
                XLSX.utils.book_append_sheet(workbook, sheetTrabajadores, 'COMPRAS DET');
                XLSX.writeFile(workbook,   rfc + ' - ' + empresa +  ' - REPORTE DE COMPRAS.xlsx');
            }


        },

        UltimoDiaMes() {
            const fecha = new Date(this.fechaI);
            const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
            this.fechaF = ultimoDia;
        },

        ShowLoading() {
            this.$q.loading.show({
                spinner: QSpinnerCube,
                spinnerColor: 'red-8',
                spinnerSize: 140,
                // backgroundColor: 'purple',
                message: 'Consultando, esprer..',
                // messageColor: 'black'
            })
        },

        async VerComprobante(item) {
            if (this.comprobante.tipo.includes("VENTAS")) {
                this.VerComprobanteVenta(item)
            }
            if (this.comprobante.tipo.includes("COMPRAS")) {
                this.VerComprobanteCompra(item)
            }
        },

        async VerComprobanteVenta(item) {
            try {
                this.$store.state.vistaPreviaStore.folioFiscal = item.folioFiscal;
                this.$store.state.vistaPreviaStore.color = "19775C"
                this.$store.state.vistaPreviaStore.tipoComprobanteInterno = "FACTURA"
                this.$store.state.vistaPreviaStore.tipo = "E"
                this.$store.state.vistaPreviaStore.rfc = this.token.rfc
                this.dialogPdf = true;
            } catch (error) {
                console.log(error)
            }
        },

        async VerComprobanteCompra(item) {
            try {
                this.$store.state.vistaPreviaStore.folioFiscal = item.folioFiscal;
                this.$store.state.vistaPreviaStore.color = "19775C"
                this.$store.state.vistaPreviaStore.tipoComprobanteInterno = "FACTURA"
                this.$store.state.vistaPreviaStore.tipo = "R"
                this.$store.state.vistaPreviaStore.rfc = this.token.rfc
                this.dialogPdf = true;
            } catch (error) {
                console.log(error)
            }
        },
    
        // ObtenerDespacho(){
        //     this.$q.loading.show({
        //         spinner: QSpinnerCube,
        //         spinnerColor: 'red-8',
        //         spinnerSize: 140,
        //         message: 'Calculando, esprer..',
        //     });

        //     for(let a of this.comprobante.detalles){
        //         var cadena = a.descripcion;
        //         var regex = /\(([^)]+)\)/;
        //         var matches = regex.exec(cadena);
        //         if (matches) {
        //             var datosEntreParentesis = matches[1];
        //             var numeroExtraido = datosEntreParentesis.match(/\d+/);

        //             if (numeroExtraido) {
        //                 var numero = numeroExtraido[0];
        //                 a.noVenta = numero;
        //             } else {
        //                 a.descripcion = cadena;
        //             }
        //         } else {
        //             a.descripcion = cadena;
        //         }
        //     }
        //     this.$q.loading.hide()
        // },

        ObtenerDespacho(){
            this.$q.loading.show({
                spinner: QSpinnerCube,
                spinnerColor: 'red-8',
                spinnerSize: 140,
                message: 'Calculando, esprer..',
            });

            for(let a of this.comprobante.detalles){
                a.noVenta = a.noVenta.slice(0, 7);
            }

            this.$q.loading.hide()
        },

        Duplicados(){
            let empresa = this.$store.state.empresaStore.nombre
            let rfc = this.$store.state.empresaStore.rfc
            
            const foliosVistos = {};
            const listaDuplicados = [];
            const lista = [...this.comprobante.detalles]

            for (const elemento of lista) {
                const folio = elemento.noVenta;

                // Si el folio ya fue visto, es un duplicado
                if (foliosVistos[folio]) {
                    listaDuplicados.push(foliosVistos[folio]);  // Agregar el original
                    listaDuplicados.push(elemento);             // Agregar el duplicado
                } else {
                // Marcar el folio como visto y almacenar el elemento
                foliosVistos[folio] = elemento;
                }
            }

            //LISTA DE LOS FOLIOS FISCALES UNICOS
            const foliosUnicosSet = new Set(listaDuplicados.map(objeto => objeto.folioFiscal));
            const foliosUnicos = Array.from(foliosUnicosSet);
            console.log(foliosUnicos)


            let combustible = this.comprobante.tipo.split(' ')[2]
            let indice = 1;
            const workbook = XLSX.utils.book_new();
            for(let h of foliosUnicos){
                const nueva = this.comprobante.detalles.filter(f => f.folioFiscal === h)
                const sheetTrabajadores = XLSX.utils.json_to_sheet(nueva);
                XLSX.utils.book_append_sheet(workbook, sheetTrabajadores, 'Hoja ' + indice);
                indice++;
            }

            XLSX.writeFile(workbook,   rfc + ' - ' + empresa +  ' -  REPORTE DE VENTAS DUPLICADAS '+ combustible +'.xlsx');
        },
    
        Faltantes(){
            console.log('Empieza')
            this.$q.loading.show({
                spinner: QSpinnerCube,
                spinnerColor: 'red-8',
                spinnerSize: 140,
                message: 'Calculando, esprer..',
            });

            const lista = [...this.comprobante.detalles]
            var listaNoEncontrados = [];
            
            let listaBusqueda = lista.map(m => parseInt(m.noVenta, 10));
            // let min = 1304440;
            // let max = 1329677;
            let min = parseInt(this.minimo, 10)
            let max = parseInt(this.maximo, 10)

            console.log(min, max)

            for(let i = min; i< max; i++){
                const indice = listaBusqueda.indexOf(i);
                if(indice == -1){
                    listaNoEncontrados.push(i);
                }
            }
            this.$q.loading.hide()
            // console.log('Valores no encontrados',listaNoEncontrados)

            const texto = listaNoEncontrados.join('\n');
            const blob = new Blob([texto], { type: 'text/plain' });
            // Crear un enlace de descarga
            const enlaceDescarga = document.createElement('a');
            enlaceDescarga.href = URL.createObjectURL(blob);
            enlaceDescarga.download = 'No encontrados.txt';

            // Agregar el enlace al documento y hacer clic para iniciar la descarga
            document.body.appendChild(enlaceDescarga);
            enlaceDescarga.click();

            // Limpiar el enlace después de la descarga
            document.body.removeChild(enlaceDescarga);
        },

        ObtenerMaximoyMinimo(lista, propiedad){
            if (lista.length === 0) {
                return { maximo: undefined, minimo: undefined };
            }
            return lista.reduce((resultado, objeto) => {
                const valor = objeto[propiedad];

                // Comprobar el valor más grande
                resultado.maximo = resultado.maximo === undefined ? valor : Math.max(resultado.maximo, valor);

                // Comprobar el valor más pequeño
                resultado.minimo = resultado.minimo === undefined ? valor : Math.min(resultado.minimo, valor);

                return resultado;
            }, { maximo: undefined, minimo: undefined });
        },
    
        OpenDialogBuscarVentas(){
            this.dialogBusca = true;
        },

        CloseDialogPdf() {
            this.dialogPdf = false;
        },
    },
}
</script>