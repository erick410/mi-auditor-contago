<template>
    <div style="width: 100%;">
        <div class="titulo-reporte-nomina">
            NÓMINA TIMBRADA
        </div>
        <div v-if="items && items.contenido" class="q-mb-md">
            <q-table :data="items.contenido" :columns="columnsNomina" row-key="mes" flat bordered
                class="shadow-0 border-0" dense>
                <template v-slot:body="props">
                    <q-tr :props="props">
                        <q-td key="mes" :props="props">{{ props.row.mes }}</q-td>
                        <q-td key="contador" :props="props">{{ props.row.contador }}</q-td>
                        <q-td key="percepciones" :props="props">{{ formatCurrency(props.row.percepciones) }}</q-td>
                        <q-td key="deducciones" :props="props">{{ formatCurrency(props.row.deducciones) }}</q-td>
                        <q-td key="otrosPagos" :props="props">{{ formatCurrency(props.row.otrosPagos) }}</q-td>
                        <q-td key="total" :props="props">{{ formatCurrency(props.row.total) }}</q-td>
                    </q-tr>
                </template>
            </q-table>
            <q-table :data="[getTotales(items.contenido)]" :columns="columnsTotales" dense flat bordered row-key="mes"
                class="shadow-0 border-0 q-mt-sm" hide-header hide-bottom>
                <template v-slot:body="props">
                    <q-tr :props="props">
                        <q-td key="mes" :props="props"><strong>Total</strong></q-td>
                        <q-td key="contador" :props="props">{{ props.row.contador }}</q-td>
                        <q-td key="percepciones" :props="props">{{ formatCurrency(props.row.percepciones) }}</q-td>
                        <q-td key="deducciones" :props="props">{{ formatCurrency(props.row.deducciones) }}</q-td>
                        <q-td key="otrosPagos" :props="props">{{ formatCurrency(props.row.otrosPagos) }}</q-td>
                        <q-td key="total" :props="props">{{ formatCurrency(props.row.total) }}</q-td>
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
                columnsNomina: [
                    { name: 'mes', label: 'Mes', align: 'center', field: 'mes', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-nomina text-white' },
                    { name: 'contador', label: '# Comprobantes', align: 'center', field: 'contador', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-nomina text-white' },
                    { name: 'percepciones', label: 'Percepciones', align: 'right', field: 'percepciones', sortable: true, classes: 'bg-grey-2 ellipsis ', headerClasses: 'bgc-nomina text-white' },
                    { name: 'deducciones', label: 'Deducciones', align: 'right', field: 'deducciones', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-nomina text-white' },
                    { name: 'otrosPagos', label: 'Otros Pagos', align: 'right', field: 'otrosPagos', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-nomina text-white', },
                    { name: 'total', label: 'Importe', align: 'right', field: 'total', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-nomina text-white', },
                ],
                columnsTotales: [
                    { name: 'mes', label: 'Mes', align: 'center', field: 'mes', sortable: true, classes: 'total-row-n ellipsis', headerClasses: 'bgc-nomina text-white' },
                    { name: 'contador', label: '# Comprobantes', align: 'center', field: 'contador', sortable: true, classes: 'total-row-n ellipsis', headerClasses: 'bgc-nomina text-white' },
                    { name: 'percepciones', label: 'Percepciones', align: 'right', field: 'percepciones', sortable: true, classes: 'total-row-n ellipsis ', headerClasses: 'bgc-nomina text-white' },
                    { name: 'deducciones', label: 'Deducciones', align: 'right', field: 'deducciones', sortable: true, classes: 'total-row-n ellipsis', headerClasses: 'bgc-nomina text-white' },
                    { name: 'otrosPagos', label: 'Otros Pagos', align: 'right', field: 'otrosPagos', sortable: true, classes: 'total-row-n ellipsis', headerClasses: 'bgc-nomina text-white', },
                    { name: 'total', label: 'Importe', align: 'right', field: 'total', sortable: true, classes: 'total-row-n ellipsis', headerClasses: 'bgc-nomina text-white', },
                ],
            }
        },
        computed: {
            token() {
                return this.$store.state.usuario;
            },
            items() {
                return this.$store.state.dataViewReporte[7];
            },
        },
        methods: {
            formatCurrency(value) {
                return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
            },
            getTotales(registros) {
                return {
                    mes: 'Total',
                    contador: registros.reduce((sum, r) => sum + (r.contador || 0), 0),
                    percepciones: registros.reduce((sum, r) => sum + (r.percepciones || 0), 0),
                    deducciones: registros.reduce((sum, r) => sum + (r.deducciones || 0), 0),
                    otrosPagos: registros.reduce((sum, r) => sum + (r.otrosPagos || 0), 0),
                    total: registros.reduce((sum, r) => sum + (r.total || 0), 0),
                };
            },
        },
    }
</script>
<style>
    .bgc-nomina {
        background-color: #C74F78 !important;
        text-align: center !important;
    }

    .total-row-n {
        background-color: #F7B2CC !important;
        font-weight: bold;
    }

    .titulo-reporte-nomina {
        background-color: #fff;
        color: #C74F78;
        font-size: 20px;
        font-weight: bold;
        padding: 10px 20px;
        text-align: center;
        border-bottom: 2px solid #C74F78;
        font-family: Arial, sans-serif;

    }
</style>