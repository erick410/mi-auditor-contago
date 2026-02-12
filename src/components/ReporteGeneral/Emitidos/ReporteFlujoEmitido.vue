<template>
    <div style="width: 100%;">
        <div class="titulo-reporte-emitidos">
            REPORTE FLUJO EFECTIVAMENTE COBRADO - MXN
        </div>
        <div v-if="items && items.contenido">
            <div class="q-mb-md" v-for="lista in items.contenido">
                <q-table :data="lista.MXN" :columns="columnsMXN" row-key="formaPago" flat bordered
                    class="shadow-0 border-0" dense :title="lista.MXN[0].mes">
                    <template v-slot:body="props">
                        <q-tr :props="props">
                            <q-td key="formaPago" :props="props">{{ props.row.formaPago }}</q-td>
                            <q-td key="importe" :props="props">{{ formatCurrency(props.row.importe) }}</q-td>
                            <q-td key="metodoPago" :props="props">{{ props.row.metodoPago }}</q-td>
                            <q-td key="tipoComprobante" :props="props">{{ props.row.tipoComprobante }}</q-td>
                            <q-td key="total" :props="props">{{ formatCurrency(props.row.total) }}</q-td>
                        </q-tr>
                    </template>
                </q-table>
                <q-table :data="[getTotalesM(lista.MXN)]" :columns="columnsTotalesM" dense flat bordered
                    row-key="formaPago" class="shadow-0 border-0 q-mt-sm" hide-header hide-bottom>
                    <template v-slot:body="props">
                        <q-tr :props="props">
                            <q-td key="formaPago" :props="props"><strong>Total</strong></q-td>
                            <q-td key="importe" :props="props">{{ formatCurrency(props.row.importe) }}</q-td>
                            <q-td key="metodoPago" :props="props">{{ props.row.metodoPago }}</q-td>
                            <q-td key="tipoComprobante" :props="props">{{ props.row.tipoComprobante }}</q-td>
                            <q-td key="total" :props="props">{{ formatCurrency(props.row.total) }}</q-td>
                        </q-tr>
                    </template>
                </q-table>
            </div>
        </div>
        <div class="titulo-reporte-emitidos">
            REPORTE FLUJO EFECTIVAMENTE COBRADO - USD
        </div>
        <div v-if="items && items.contenido">
            <div class="q-mb-md" v-for="lista in items.contenido" v-if="('USD' in lista)">
                <q-table :data="lista.USD" :columns="columnsUSD" row-key="formaPago" flat bordered
                    class="shadow-0 border-0" dense :title="lista.MXN[0].mes">
                    <template v-slot:body="props">
                        <q-tr :props="props">
                            <q-td key="formaPago" :props="props">{{ props.row.formaPago }}</q-td>
                            <q-td key="importe" :props="props">{{ formatCurrency(props.row.importe) }}</q-td>
                            <q-td key="importePesos" :props="props">{{ formatCurrency(props.row.importePesos) }}</q-td>
                            <q-td key="metodoPago" :props="props">{{ props.row.metodoPago }}</q-td>
                            <q-td key="tipoComprobante" :props="props">{{ props.row.tipoComprobante }}</q-td>
                            <q-td key="total" :props="props">{{ formatCurrency(props.row.total) }}</q-td>
                            <q-td key="totalPesos" :props="props">{{ formatCurrency(props.row.totalPesos) }}</q-td>
                        </q-tr>
                    </template>
                </q-table>
                <q-table :data="[getTotalesU(lista.USD)]" :columns="columnsTotalesU" dense flat bordered
                    row-key="formaPago" class="shadow-0 border-0 q-mt-sm" hide-header hide-bottom>
                    <template v-slot:body="props">
                        <q-tr :props="props">
                            <q-td key="formaPago" :props="props"><strong>Total</strong></q-td>
                            <q-td key="importe" :props="props">{{ formatCurrency(props.row.importe) }}</q-td>
                            <q-td key="importePesos" :props="props">{{ formatCurrency(props.row.importePesos) }}</q-td>
                            <q-td key="metodoPago" :props="props">{{ props.row.metodoPago }}</q-td>
                            <q-td key="tipoComprobante" :props="props">{{ props.row.tipoComprobante }}</q-td>
                            <q-td key="total" :props="props">{{ formatCurrency(props.row.total) }}</q-td>
                            <q-td key="totalPesos" :props="props">{{ formatCurrency(props.row.totalPesos) }}</q-td>
                        </q-tr>
                    </template>
                </q-table>
            </div>
        </div>
    </div>
</template>
<script>
    export default {
        data() {
            return {
                columnsMXN: [
                    { name: 'formaPago', label: 'Forma de Pago', align: 'left', field: 'formaPago', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'importe', label: 'Importe', align: 'right', field: 'importe', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-emitidos text-white', },
                    { name: 'metodoPago', label: 'Metodo de Pago', align: 'center', field: 'metodoPago', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'tipoComprobante', label: 'Tipo Comprobante', align: 'center', field: 'tipoComprobante', sortable: true, classes: 'bg-grey-2 ellipsis ', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'total', label: 'Total', align: 'right', field: 'total', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-emitidos text-white' },
                ],

                columnsUSD: [
                    { name: 'formaPago', label: 'Forma de Pago', align: 'left', field: 'formaPago', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'importe', label: 'Importe', align: 'right', field: 'importe', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-emitidos text-white', },
                    { name: 'importePesos', label: 'Importe Pesos', align: 'right', field: 'importePesos', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-emitidos text-white', },
                    { name: 'metodoPago', label: 'Metodo de Pago', align: 'center', field: 'metodoPago', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'tipoComprobante', label: 'Tipo Comprobante', align: 'center', field: 'tipoComprobante', sortable: true, classes: 'bg-grey-2 ellipsis ', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'total', label: 'Total', align: 'right', field: 'total', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'totalPesos', label: 'Total Pesos', align: 'right', field: 'totalPesos', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-emitidos text-white' },
                ],
                columnsTotalesM: [
                    { name: 'formaPago', label: 'Forma de Pago', align: 'left', field: 'formaPago', sortable: true, classes: 'total-row-e ellipsis', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'importe', label: 'Importe', align: 'right', field: 'importe', sortable: true, classes: 'total-row-e ellipsis', headerClasses: 'bgc-emitidos text-white', },
                    { name: 'metodoPago', label: 'Metodo de Pago', align: 'center', field: 'metodoPago', sortable: true, classes: 'total-row-e ellipsis', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'tipoComprobante', label: 'Tipo Comprobante', align: 'center', field: 'tipoComprobante', sortable: true, classes: 'total-row-e ellipsis ', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'total', label: 'Total', align: 'right', field: 'total', sortable: true, classes: 'total-row-e ellipsis', headerClasses: 'bgc-emitidos text-white' },
                ],
                columnsTotalesU: [
                    { name: 'formaPago', label: 'Forma de Pago', align: 'left', field: 'formaPago', sortable: true, classes: 'total-row-e ellipsis', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'importe', label: 'Importe', align: 'right', field: 'importe', sortable: true, classes: 'total-row-e ellipsis', headerClasses: 'bgc-emitidos text-white', },
                    { name: 'importePesos', label: 'Importe Pesos', align: 'right', field: 'importePesos', sortable: true, classes: 'total-row-e ellipsis', headerClasses: 'bgc-emitidos text-white', },
                    { name: 'metodoPago', label: 'Metodo de Pago', align: 'center', field: 'metodoPago', sortable: true, classes: 'total-row-e ellipsis', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'tipoComprobante', label: 'Tipo Comprobante', align: 'center', field: 'tipoComprobante', sortable: true, classes: 'total-row-e ellipsis ', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'total', label: 'Total', align: 'right', field: 'total', sortable: true, classes: 'total-row-e ellipsis', headerClasses: 'bgc-emitidos text-white' },
                    { name: 'totalPesos', label: 'Total Pesos', align: 'right', field: 'totalPesos', sortable: true, classes: 'total-row-e ellipsis', headerClasses: 'bgc-emitidos text-white' },
                ],
            }
        },
        computed: {
            token() {
                return this.$store.state.usuario;
            },
            items() {
                return this.$store.state.dataViewReporte[9];
            },
        },
        methods: {
            formatCurrency(value) {
                return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
            },
            getTotalesM(registros) {
                return {
                    formaPago: 'Total',
                    importe: registros.reduce((sum, r) => sum + (r.importe || 0), 0),
                    metodoPago: '-',
                    tipoComprobante: '-',
                    total: registros.reduce((sum, r) => sum + (r.total || 0), 0)
                };
            },
            getTotalesU(registros) {
                return {
                    formaPago: 'Total',
                    importe: registros.reduce((sum, r) => sum + (r.importe || 0), 0),
                    importePesos: registros.reduce((sum, r) => sum + (r.importePesos || 0), 0),
                    metodoPago: '-',
                    tipoComprobante: '-',
                    total: registros.reduce((sum, r) => sum + (r.total || 0), 0),
                    totalPesos: registros.reduce((sum, r) => sum + (r.totalPesos || 0), 0)
                };
            },
        },
    }
</script>
<style>
    .bgc-emitidos {
        background-color: #42A147 !important;
        text-align: center !important;
    }

    .total-row-e {
        background-color: #99D69C !important;
        font-weight: bold;
    }

    .titulo-reporte-emitidos {
        background-color: #fff;
        color: #42A147;
        font-size: 20px;
        font-weight: bold;
        padding: 10px 20px;
        text-align: center;
        border-bottom: 2px solid #42A147;
        font-family: Arial, sans-serif;

    }
</style>