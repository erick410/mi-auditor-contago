<template>
    <div style="width: 100%;">
        <div class="titulo-reporte-otros">
            REPORTE CONSUMO DE COMBUSTIBLE - RECIBIDOS
        </div>
        <div class="q-mb-md" v-for="(registros, mes) in items.contenido" :key="mes">
            <q-table :data="registros" :columns="columns" row-key="unidad" flat bordered class="shadow-0 border-0" dense
                :title="mes">
                <template v-slot:body="props">
                    <q-tr :props="props">
                        <q-td key="unidad" :props="props">{{ props.row.unidad }}</q-td>
                        <q-td key="formaPago" :props="props">{{ props.row.formaPago }}</q-td>
                        <q-td key="metodoPago" :props="props">{{ props.row.metodoPago }}</q-td>
                        <q-td key="descripcion" :props="props">{{ props.row.descripcion }}</q-td>
                        <q-td key="totalCantidad" :props="props">{{ props.row.totalCantidad }}</q-td>
                        <q-td key="totalSubTotal" :props="props">{{ formatCurrency(props.row.totalSubTotal) }}</q-td>
                        <q-td key="totalTraslados" :props="props">{{ formatCurrency(props.row.totalTraslados) }}</q-td>
                        <q-td key="totalRetenciones" :props="props">{{
                            formatCurrency(props.row.totalRetenciones)}}</q-td>
                        <q-td key="total" :props="props">{{ formatCurrency(props.row.total)}}</q-td>
                    </q-tr>
                </template>
            </q-table>
            <q-table :data="[getTotales(registros)]" :columns="columnsTotales" dense flat bordered row-key="concepto"
                class="shadow-0 border-0 q-mt-sm" hide-header hide-bottom>
                <template v-slot:body="props">
                    <q-tr :props="props">
                        <q-td key="unidad" :props="props"><strong>Total</strong></q-td>
                        <q-td key="formaPago" :props="props">{{ props.row.formaPago }}</q-td>
                        <q-td key="metodoPago" :props="props">{{ props.row.metodoPago }}</q-td>
                        <q-td key="descripcion" :props="props">{{ props.row.descripcion }}</q-td>
                        <q-td key="totalCantidad" :props="props">{{ props.row.totalCantidad }}</q-td>
                        <q-td key="totalSubTotal" :props="props">{{ formatCurrency(props.row.totalSubTotal) }}</q-td>
                        <q-td key="totalTraslados" :props="props">{{ formatCurrency(props.row.totalTraslados) }}</q-td>
                        <q-td key="totalRetenciones" :props="props">{{
                            formatCurrency(props.row.totalRetenciones)}}</q-td>
                        <q-td key="total" :props="props">{{ formatCurrency(props.row.total)}}</q-td>
                    </q-tr>
                </template>
            </q-table>
        </div>
    </div>
</template>
<script>
    export default {
        data() {
            return {
                columns: [
                    { name: 'unidad', label: 'Unidad', align: 'left', field: 'unidad', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-otros text-white' },
                    { name: 'formaPago', label: 'Forma de Pago', align: 'left', field: 'formaPago', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-otros text-white', },
                    { name: 'metodoPago', label: 'Método de Pago', align: 'left', field: 'metodoPago', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-otros text-white', },
                    { name: 'descripcion', label: 'Descripción', align: 'right', field: 'descripción', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-otros text-white', },
                    { name: 'totalCantidad', label: 'Total Cantidad', align: 'right', field: 'totalCantidad', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-otros text-white', },
                    { name: 'totalSubTotal', label: 'SubTotal', align: 'right', field: 'totalSubTotal', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-otros text-white', },
                    { name: 'totalTraslados', label: 'Total Traslados', align: 'right', field: 'totalTraslados', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-otros text-white', },
                    { name: 'totalRetenciones', label: 'Total Retenciones', align: 'right', field: 'totalRetenciones', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-otros text-white', },
                    { name: 'total', label: 'Total', align: 'right', field: 'total', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-otros text-white', },
                ],

                columnsTotales: [
                    { name: 'unidad', label: 'Unidad', align: 'left', field: 'unidad', sortable: true, classes: 'total-row-o ellipsis', headerClasses: 'bgc-otros text-white' },
                    { name: 'formaPago', label: 'Forma de Pago', align: 'left', field: 'formaPago', sortable: true, classes: 'total-row-o ellipsis', headerClasses: 'bgc-otros text-white', },
                    { name: 'metodoPago', label: 'Método de Pago', align: 'left', field: 'metodoPago', sortable: true, classes: 'total-row-o ellipsis', headerClasses: 'bgc-otros text-white', },
                    { name: 'descripcion', label: 'Descripción', align: 'left', field: 'descripción', sortable: true, classes: 'total-row-o ellipsis', headerClasses: 'bgc-otros text-white', },
                    { name: 'totalCantidad', label: 'Total Cantidad', align: 'right', field: 'totalCantidad', sortable: true, classes: 'total-row-o ellipsis', headerClasses: 'bgc-otros text-white', },
                    { name: 'totalSubTotal', label: 'SubTotal', align: 'right', field: 'totalSubTotal', sortable: true, classes: 'total-row-o ellipsis', headerClasses: 'bgc-otros text-white', },
                    { name: 'totalTraslados', label: 'Total Traslados', align: 'right', field: 'totalTraslados', sortable: true, classes: 'total-row-o ellipsis', headerClasses: 'bgc-otros text-white', },
                    { name: 'totalRetenciones', label: 'Total Retenciones', align: 'right', field: 'totalRetenciones', sortable: true, classes: 'total-row-o ellipsis', headerClasses: 'bgc-otros text-white', },
                    { name: 'total', label: 'Total', align: 'right', field: 'total', sortable: true, classes: 'total-row-o ellipsis', headerClasses: 'bgc-otros text-white', },
                ],
            }
        },
        computed: {
            token() {
                return this.$store.state.usuario;
            },
            items() {
                return this.$store.state.dataViewReporte[46];
            },
        },
        methods: {
            formatCurrency(value) {
                return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
            },
            getTotales(registros) {
                return {
                    unidad: 'Total',
                    formaPago: "-",
                    metodoPago: "-",
                    descripción: "-",
                    totalCantidad: registros.reduce((sum, r) => sum + (r.totalCantidad || 0), 0),
                    totalSubTotal: registros.reduce((sum, r) => sum + (r.totalSubTotal || 0), 0),
                    totalTraslados: registros.reduce((sum, r) => sum + (r.totalTraslados || 0), 0),
                    totalRetenciones: registros.reduce((sum, r) => sum + (r.totalRetenciones || 0), 0),
                    total: registros.reduce((sum, r) => sum + (r.total || 0), 0),
                };
            },
        },
    }
</script>
<style>
    .bgc-otros {
        background-color: #615445 !important;
        text-align: center !important;
    }

    .total-row-o {
        background-color: #B2A391 !important;
        font-weight: bold;
    }

    .titulo-reporte-otros {
        background-color: #fff;
        color: #615445;
        font-size: 20px;
        font-weight: bold;
        padding: 10px 20px;
        text-align: center;
        border-bottom: 2px solid #615445;
        font-family: Arial, sans-serif;
    }
</style>