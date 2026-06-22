<template>
    <div class="q-pa-md">
        <q-card flat class="my-card">
            <q-card-section>
                <div class="row no-wrap items-center q-mt-md q-pa-sm">
                    <q-btn push color="red-14" @click="CloseDialog" icon="mdi-close" rounded flat size="18px" padding="xs">
                        <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                            content-style="font-size: 14px" :offset="[10, 10]">Cerrar</q-tooltip>
                    </q-btn>
                    <q-space />
                    <div class="text-h5">{{ items.cabecera }}</div>
                    <q-space />
                    <q-btn push color="green-10" @click="ExportExcel" icon="mdi-file-excel-box-outline" rounded flat
                        size="18px" padding="xs">
                        <q-tooltip transition-show="flip-right" transition-hide="flip-left"
                            content-style="font-size: 14px" :offset="[10, 10]">Exportar Excel</q-tooltip>
                    </q-btn>
                </div>
            </q-card-section>
        </q-card>

        <q-table :data="items.detalles" :columns="columns" row-key="uuid"
            :rows-per-page-options="[10]" :filter="filter">
            <template v-slot:top-right>
                <q-input borderless dense debounce="300" v-model="filter" placeholder="Buscar">
                    <template v-slot:append>
                        <q-icon name="search" />
                    </template>
                </q-input>
            </template>
            <template v-slot:body="props">
                <q-tr :props="props">
                    <q-td auto-width>
                        <q-btn size="md" color="primary" rounded flat dense
                            icon="mdi-file-pdf-box"
                            @click="descargarPdf(props.row)">
                            <q-tooltip>Ver PDF</q-tooltip>
                        </q-btn>
                        <q-btn size="md" color="teal-6" rounded flat dense
                            icon="mdi-xml"
                            @click="descargarXml(props.row)">
                            <q-tooltip>Descargar XML</q-tooltip>
                        </q-btn>
                    </q-td>
                    <q-td key="uuid" :props="props">{{ props.row.uuid }}</q-td>
                    <q-td key="folioInt" :props="props">{{ props.row.folioInt }}</q-td>
                    <q-td key="fechaTimbrado" :props="props">{{ formatDate(props.row.fechaTimbrado) }}</q-td>
                    <q-td key="rfcEmisor" :props="props">{{ props.row.rfcEmisor }}</q-td>
                    <q-td key="nomEmisor" :props="props">{{ props.row.nomEmisor }}</q-td>
                    <q-td key="rfcReceptor" :props="props">{{ props.row.rfcReceptor }}</q-td>
                    <q-td key="nomReceptor" :props="props">{{ props.row.nomReceptor }}</q-td>
                    <q-td key="tipoPago" :props="props">{{ props.row.tipoPago }}</q-td>
                    <q-td key="baseRet" :props="props">{{ formatCurrency(props.row.baseRet) }}</q-td>
                    <q-td key="importe" :props="props">{{ formatCurrency(props.row.importe) }}</q-td>
                </q-tr>
            </template>
        </q-table>
    </div>
</template>

<script>
import axios from 'axios'
import moment from 'moment'
import * as xlsx from 'xlsx'
import { generarPdfRetencion } from '../Pdf/generarPdfRetencion'

export default {
    data() {
        return {
            filter: '',
            columns: [
                { name: 'acciones',      align: 'left',  label: 'Acciones',        field: 'acciones' },
                { name: 'uuid',          align: 'left',  label: 'Folio Fiscal',     field: 'uuid',          sortable: true },
                { name: 'folioInt',      align: 'left',  label: 'Folio',            field: 'folioInt',       sortable: true },
                { name: 'fechaTimbrado', align: 'left',  label: 'Fecha',            field: 'fechaTimbrado',  sortable: true },
                { name: 'rfcEmisor',     align: 'left',  label: 'RFC Emisor',       field: 'rfcEmisor',      sortable: true },
                { name: 'nomEmisor',     align: 'left',  label: 'Nombre Emisor',    field: 'nomEmisor',      sortable: true },
                { name: 'rfcReceptor',   align: 'left',  label: 'RFC Receptor',     field: 'rfcReceptor',    sortable: true },
                { name: 'nomReceptor',   align: 'left',  label: 'Nombre Receptor',  field: 'nomReceptor',    sortable: true },
                { name: 'tipoPago',      align: 'left',  label: 'Tipo de Pago',     field: 'tipoPago',       sortable: true },
                { name: 'baseRet',       align: 'right', label: 'Base',             field: 'baseRet',        sortable: true },
                { name: 'importe',       align: 'right', label: 'Importe',          field: 'importe',        sortable: true },
            ],
        }
    },

    computed: {
        token()    { return this.$store.state.usuario },
        rutaAxios(){ return this.$store.state.rutaDescargas },
        items()    { return this.$store.state.detallesIsrMStore || { cabecera: '', detalles: [] } },
    },

    methods: {
        formatCurrency(value) {
            try {
                return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
            } catch (e) { return '' }
        },

        formatDate(value) {
            try {
                let fecha_ = value.replace('T', ' ').replace('Z', ' ')
                moment.locale('es-mx')
                return moment(new Date(fecha_)).format('DD-MMMM-YYYY HH:mm:ss')
            } catch (e) { return value }
        },

        CloseDialog() {
            this.$emit('CloseDialogDetalles')
        },

        async descargarPdf(row) {
            console.log(row)
            try {
                const res = await axios.get(
                    this.rutaAxios + 'Retenciones/GetRetencionesDocumentos/erp_' + this.token.rfc
                    + '/' + this.token.rfc + '?uuid=' + row.uuid)
                if (res.data && res.data.length > 0) {
                    await generarPdfRetencion(res.data[0], require('@/assets/logo_contago_sin_fondo.png'))
                }
            } catch (e) {
                this.$q.notify({ type: 'negative', message: 'Error al generar PDF.' })
            }
        },

        async descargarXml(row) {
            try {
                const res = await axios.get(
                    this.rutaAxios + 'Retenciones/GetXmlRetencion/erp_' + this.token.rfc
                    + '/' + this.token.rfc + '/' + row.uuid,
                    { responseType: 'blob' })
                const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/xml' }))
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', row.uuid + '.xml')
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                window.URL.revokeObjectURL(url)
            } catch (e) {
                this.$q.notify({ type: 'negative', message: 'No se encontró el XML.' })
            }
        },

        ExportExcel() {
            const reporte   = 'REPORTE DETALLADO DE RETENCIONES DE ISR'
            const empresa   = this.$store.state.empresaStore.nombre
            const rfc       = this.$store.state.empresaStore.rfc
            const periodo   = (this.items.mes || '') + ' ' + (this.items.año || '')

            const workbook  = xlsx.utils.book_new()
            const cabecera  = [
                [reporte],
                ['EMPRESA:', empresa.toUpperCase()],
                ['RFC:', rfc.toUpperCase()],
                ['PERIODO:', periodo.toUpperCase()],
                [],
            ]

            const columnasExcel = this.columns.filter(c => c.name !== 'acciones')
            const dataExcel = this.items.detalles.map(row => {
                const obj = {}
                columnasExcel.forEach(col => { obj[col.label] = row[col.field] })
                return obj
            })

            const sheet = xlsx.utils.aoa_to_sheet(cabecera)
            xlsx.utils.sheet_add_json(sheet, dataExcel, { origin: 'A6', skipHeader: false })

            sheet['!merges'] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: columnasExcel.length - 1 } },
                { s: { r: 1, c: 1 }, e: { r: 1, c: columnasExcel.length - 1 } },
                { s: { r: 2, c: 1 }, e: { r: 2, c: columnasExcel.length - 1 } },
                { s: { r: 3, c: 1 }, e: { r: 3, c: columnasExcel.length - 1 } },
            ]
            sheet['!cols'] = columnasExcel.map(() => ({ wch: 20 }))

            xlsx.utils.book_append_sheet(workbook, sheet, 'ISR RETENCIONES')
            xlsx.writeFile(workbook,
                rfc + ' - ' + empresa + ' - ' + reporte + ' ' + periodo.toUpperCase() + '.xlsx')
        },
    },
}
</script>

<style>
.my-card { width: 100%; }
</style>