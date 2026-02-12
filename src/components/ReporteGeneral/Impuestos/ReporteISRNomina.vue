<template>
    <div style="width: 100%;">
        <div class="titulo-reporte-impuestos">
            REPORTE ISR NÓMINA
        </div>
        <div class="q-mb-md">
            <q-table :data="items.contenido" :columns="columns" row-key="mes" flat bordered class="shadow-0 border-0"
                dense>
                <template v-slot:body="props">
                    <q-tr :props="props">
                        <q-td key="mes" :props="props">{{ props.row.mes }}</q-td>
                        <q-td key="otros" :props="props">{{ formatCurrency(props.row.otros) }}</q-td>
                        <q-td key="sueldos" :props="props">{{ formatCurrency(props.row.sueldos) }}</q-td>
                    </q-tr>
                </template>
            </q-table>
            <q-table :data="[getTotales(items.contenido)]" :columns="columnsTotales" dense flat bordered row-key="mes"
                class="shadow-0 border-0 q-mt-sm" hide-header hide-bottom>
                <template v-slot:body="props">
                    <q-tr :props="props">
                        <q-td key="mes" :props="props"><strong>Total</strong></q-td>
                        <q-td key="otros" :props="props">{{ formatCurrency(props.row.otros) }}</q-td>
                        <q-td key="sueldos" :props="props">{{ formatCurrency(props.row.sueldos) }}</q-td>
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
                    { name: 'mes', label: 'Mes', align: 'center', field: 'mes', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-impuestos text-white' },
                    { name: 'otros', label: 'Sueldos', align: 'right', field: 'otros', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-impuestos text-white', },
                    { name: 'sueldos', label: 'Otros', align: 'right', field: 'sueldos', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-impuestos text-white', },
                ],
                columnsTotales: [
                    { name: 'mes', label: 'Mes', align: 'center', field: 'mes', sortable: true, classes: 'total-row-i ellipsis', headerClasses: 'bgc-impuestos text-white' },
                    { name: 'otros', label: 'Sueldos', align: 'right', field: 'otros', sortable: true, classes: 'total-row-i ellipsis', headerClasses: 'bgc-impuestos text-white', },
                    { name: 'sueldos', label: 'Otros', align: 'right', field: 'sueldos', sortable: true, classes: 'total-row-i ellipsis', headerClasses: 'bgc-impuestos text-white', },
                ],
            }
        },
        computed: {
            token() {
                return this.$store.state.usuario;
            },
            items() {
                return this.$store.state.dataViewReporte[41];
            },
        },
        methods: {
            formatCurrency(value) {
                return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
            },
            getTotales(registros) {
                return {
                    mes: 'Total',
                    otros: registros.reduce((sum, r) => sum + (r.otros || 0), 0),
                    sueldos: registros.reduce((sum, r) => sum + (r.sueldos || 0), 0),
                };
            },
        },
    }
</script>
<style>
    .bgc-impuestos {
        background-color: #F28500 !important;
        text-align: center !important;
    }

    .total-row-i {
        background-color: #FFC278 !important;
        font-weight: bold;
    }

    .titulo-reporte-impuestos {
        background-color: #fff;
        color: #F28500;
        font-size: 20px;
        font-weight: bold;
        padding: 10px 20px;
        text-align: center;
        border-bottom: 2px solid #F28500;
        font-family: Arial, sans-serif;
    }
</style>