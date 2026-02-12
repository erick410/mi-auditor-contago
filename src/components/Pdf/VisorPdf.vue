<template>
    <div class="q-pa-md">
        <q-card class="full-width">
            <q-card-section>
                <div class="row">
                    <div class="col-3">
                        <q-icon name="mdi-close-circle-outline" size="md" class="q-mr-lg" style="cursor: pointer;"
                            color="red" @click="CierraDialog"></q-icon>
                    </div>
                    <div class="col-6">
                        <div class="text-center">
                            <q-icon name="mdi-minus" size="md" style="cursor: pointer;" color="primary"
                                @click="AnteriorPagina"></q-icon>
                            {{ page }} /{{ numPages }}
                            <q-icon name="mdi-plus" size="md" style="cursor: pointer;" color="primary"
                                @click="SiguientePagina"></q-icon>
                        </div>
                    </div>
                    <div class="col-3">
                        <div class="text-right">
                            <q-icon name="mdi-download" size="sm" style="cursor: pointer;" color="green"
                                @click="descargarComprobante()"></q-icon>
                            <q-icon name="mdi-printer" size="sm" class="q-ml-sm" style="cursor: pointer;" color="blue"
                                @click="$refs.pdf.print()"></q-icon>
                            <q-icon name="mdi-xml" size="sm" class="q-ml-sm" style="cursor: pointer;" color="red"
                                @click="GetXML"></q-icon>
                        </div>
                    </div>
                    <div style="width: 100%">
                        <pdf ref="pdf" :src="pdfBase64" :page="page" :rotate="rotate" @progress="loadedRatio = $event"
                            @num-pages="numPages = $event" @link-clicked="page = $event"></pdf>
                    </div>
                </div>
            </q-card-section>
        </q-card>
    </div>
</template>

<script>
    import { format } from 'date-fns';
    import { parse } from 'date-fns';
    import { endOfMonth } from 'date-fns';
    import { es } from 'date-fns/locale';
    import moment from 'moment';
    import axios from 'axios';
    import { QSpinnerCube } from 'quasar';
    import pdf from 'vue-pdf';
    import { generarCodigoQR } from './qrcodeGenerator.js';
    import { ComprobanteBase64 } from './ComprobanteBase64.js';
    import { CartaPorte30Base64 } from './CartaPorte30Base64.js';
    import { Pago20Base64 } from './ComprobantePagoBase64.js';
    import { ComercioExterior20 } from './ComercioExterior20.js';
    import { ComprobanteNominaBase64 } from './ComprobanteNominaBase64.js';

    export default {
        components: {
            pdf: pdf
        },
        data() {
            return {
                pdfBase64: '',
                loadedRatio: 0,
                page: 1,
                numPages: 0,
                rotate: 0,
                tipoComprobante: 'I',
                fecha: null,
            }
        },
        computed: {
            token() {
                return this.$store.state.usuario;
            },

            folioFiscal() {
                return this.$store.state.folioFiscalStore;
            },

            rfc() {
                return this.$store.state.rfcStore;
            },

            vistaPrevia() {
                return this.$store.state.vistaPreviaStore;
            },

            empresa() {
                return this.$store.state.empresaStore;
            },

            ObjLogo() {
                return this.$store.state.empresaStore.logo.base64;
            },

            rutaAxios() {
                return this.$store.state.rutaMongoStore
            },
        },

        watch: {

        },

        created() {
            this.Iniciales();
        },

        methods: {
            async Iniciales() {
                this.$q.loading.show({
                    spinner: QSpinnerCube,
                    spinnerColor: 'primary',
                    spinnerSize: 140,
                    message: 'Consultando, esprere..',
                })
                await this.GetEmpresa();
                await this.VerComprobante();
                this.$q.loading.hide()
            },

            async GetEmpresa() {
                try {
                    let response = await axios.get(this.rutaAxios + 'Empresa/GetEmpresa/erp_' + this.token.rfc + '/' + this.token.rfc);
                    if (response.data.idEmpresa != 0) {
                        this.$store.state.empresaStore = response.data
                    }
                } catch (error) {
                    console.log(error);
                }
            },

            async VerComprobante() {
                if (this.vistaPrevia.tipo === "E") {
                    await this.VerComprobanteEmitido();
                } else if (this.vistaPrevia.tipo === "R") {
                    await this.VerComprobanteRecibido();
                }
            },

            async VerComprobanteEmitido() {
                this.splitterModel = 40
                let rfc = this.vistaPrevia.rfc;
                let folioFiscal = this.vistaPrevia.folioFiscal;
                let color = "#" + this.vistaPrevia.color;
                let tipoComprobanteInterno = this.vistaPrevia.tipoComprobanteInterno;
                let logo = this.ObjLogo;

                let colection = ""
                console.log(tipoComprobanteInterno)
                switch (tipoComprobanteInterno) {
                    case 'FACTURA':
                        colection = 'comprobantes_emitidos'
                        break;
                    case 'NOTA CREDITO':
                        colection = 'comprobantes_emitidos'
                        break;
                    case 'PAGO':
                        colection = 'comprobantes_pagos'
                        break;
                    case 'CARTA PORTE':
                        colection = 'comprobantes_emitidos'
                        break;
                    case 'COMERCIO EXTERIOR':
                        colection = 'comprobantes_emitidos'
                        break;
                    case 'NOMINA':
                        colection = 'comprobantes_nomina'
                        break;
                }
                try {
                    // console.log(this.vistaPrevia)
                    let response = await axios.get('https://api-beta-erp.contago.com.mx/api/Comprobantes/GetComprobanteAsync/erp_' + rfc + '/' + colection + '/' + folioFiscal);
                    let x = response.data;
                    console.log(x)
                    let extraQr = x.timbreFiscalDigital.selloCFD.slice(-8);
                    let cadenaOriginal = '||1.1|' + x.folioFiscal + '|' + x.timbreFiscalDigital.fechaTimbrado + '|' + x.timbreFiscalDigital.rfcProvCertif + '|' + x.timbreFiscalDigital.selloCFD + '|' + x.timbreFiscalDigital.noCertificadoSAT + '||'
                    x.timbreFiscalDigital.cadenaOriginal = cadenaOriginal;

                    let codigoQR = await generarCodigoQR(x.folioFiscal, x.emisor.rfc, x.receptor.rfc, x.total, extraQr);
                    let base64 = ''
                    switch (tipoComprobanteInterno) {
                        case "FACTURA":
                            base64 = await ComprobanteBase64(x, x.tipoComprobanteInterno, x.estatus, color, codigoQR, logo);
                            break;
                        case "NOTA CREDITO":
                            base64 = await ComprobanteBase64(x, x.tipoComprobanteInterno, x.estatus, color, codigoQR, logo);
                            break;
                        case "PAGO":
                            base64 = await Pago20Base64(x, x.tipoComprobanteInterno, x.estatus, color, codigoQR, logo);
                            break;
                        case "CARTA PORTE":
                            base64 = await CartaPorte30Base64(x, x.tipoComprobanteInterno, x.estatus, color, codigoQR, logo);
                            break;
                        case 'COMERCIO EXTERIOR':
                            base64 = await ComercioExterior20(x, x.tipoComprobanteInterno, x.estatus, color, codigoQR, logo);
                            break;
                        case 'NOMINA':
                            base64 = await ComprobanteNominaBase64(x, x.tipoComprobanteInterno, x.estatus, color, codigoQR, logo);
                            break;
                    }
                    this.pdfBase64 = 'data:application/pdf;base64,' + base64.split(',')[1];
                    this.fecha = x.fecha;
                } catch (error) {
                    console.log(error)
                }
            },

            async VerComprobanteRecibido() {
                this.splitterModel = 40
                let rfc = this.vistaPrevia.rfc;
                let folioFiscal = this.vistaPrevia.folioFiscal;
                let color = "#" + this.vistaPrevia.color;
                let tipoComprobanteInterno = this.vistaPrevia.tipoComprobanteInterno;
                let logo = this.ObjLogo;

                let colection = ""
                switch (tipoComprobanteInterno) {
                    case 'FACTURA':
                        colection = 'comprobantes_recibidos'
                        break;
                    case "NOTA CREDITO":
                        base64 = await ComprobanteBase64(x, x.tipoComprobanteInterno, x.estatus, color, codigoQR, logo);
                        break;
                    case 'PAGO':
                        colection = 'comprobantes_pagos_recibidos'
                        break;
                    case 'CARTA PORTE':
                        colection = 'comprobantes_recibidos'
                        break;
                    case 'COMERCIO EXTERIOR':
                        colection = 'comprobantes_recibidos'
                        break;
                }
                try {
                    // console.log(item)
                    let response = await axios.get('https://api-beta-erp.contago.com.mx/api/Comprobantes/GetComprobanteAsync/erp_' + rfc + '/' + colection + '/' + folioFiscal);
                    let x = response.data;
                    // console.log(x)
                    let extraQr = x.timbreFiscalDigital.selloCFD.slice(-8);
                    let cadenaOriginal = '||1.1|' + x.folioFiscal + '|' + x.timbreFiscalDigital.fechaTimbrado + '|' + x.timbreFiscalDigital.rfcProvCertif + '|' + x.timbreFiscalDigital.selloCFD + '|' + x.timbreFiscalDigital.noCertificadoSAT + '||'
                    x.timbreFiscalDigital.cadenaOriginal = cadenaOriginal;

                    let codigoQR = await generarCodigoQR(x.folioFiscal, x.emisor.rfc, x.receptor.rfc, x.total, extraQr);
                    let base64 = ''
                    switch (tipoComprobanteInterno) {
                        case "FACTURA":
                            base64 = await ComprobanteBase64(x, x.tipoComprobanteInterno, x.estatus, color, codigoQR, logo);
                            break;
                        case "PAGO":
                            base64 = await Pago20Base64(x, x.tipoComprobanteInterno, x.estatus, color, codigoQR, logo);
                            break;
                        case "CARTA PORTE":
                            base64 = await CartaPorte30Base64(x, x.tipoComprobanteInterno, x.estatus, color, codigoQR, logo);
                            break;
                        case 'COMERCIO EXTERIOR':
                            base64 = await ComercioExterior20(x, x.tipoComprobanteInterno, x.estatus, color, codigoQR, logo);
                            break;
                    }
                    this.pdfBase64 = 'data:application/pdf;base64,' + base64.split(',')[1];
                    this.fecha = x.fecha;
                } catch (error) {
                    console.log(error)
                }
            },

            descargarComprobante() {
                if (this.vistaPrevia.folioFiscal) {
                    const fileName = this.vistaPrevia.folioFiscal + ".pdf";
                    const link = document.createElement("a");
                    link.href = this.pdfBase64;
                    link.download = fileName;
                    link.click();
                } else {
                    const fileName = "Vista previa.pdf";
                    const link = document.createElement("a");
                    link.href = this.pdfBase64;
                    link.download = fileName;
                    link.click();
                }
            },

            async GetXML() {
                const nombresMeses = [
                    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
                ];

                let folioFiscal = this.vistaPrevia.folioFiscal;
                let rfc = this.vistaPrevia.rfc;
                let fecha = new Date(this.fecha);
                let año = fecha.getFullYear();
                let mes = fecha.getMonth();
                let nombreMes = nombresMeses[mes]

                try {
                    let response = await axios.get('Comprobantes/GetXmlAsync/' + rfc + '/' + año + '/' + nombreMes + '/' + folioFiscal);
                    await this.descargaComprobanteXml(response.data)
                } catch (error) {
                    console.log(error)
                }
            },

            async descargaComprobanteXml(item) {
                const xmlBase64 = item
                const fileName = this.vistaPrevia.folioFiscal + ".xml";
                const link = document.createElement("a");
                link.href = "data:text/xml;base64," + xmlBase64;
                link.download = fileName;
                link.click();
            },

            SiguientePagina() {
                let paginas = this.numPages;
                if (this.page < paginas) {
                    this.page++;
                } else {
                    // this.page = 1;
                }
            },

            AnteriorPagina() {
                let paginas = this.numPages;
                if (this.page > paginas) {
                    this.page--;
                } else {
                    this.page = 1;
                }
            },

            CierraDialog() {
                this.$emit("CloseDialogPdf");
            },
        }
    }
</script>


<style lang="sass" scoped>

</style>