<template>
    <div style="width: 100%;">
        <div class="titulo-reporte-impuestos">
            REPORTE IVA RETENIDO - RECIBIDOS
        </div>
        <div v-for="(registros, mes) in items.contenido" :key="mes" class="q-mb-md">
            <q-table :data="registros" :columns="columns" row-key="concepto" flat bordered class="shadow-0 border-0"
                dense :title="mes">
                <template v-slot:body="props">
                    <q-tr :props="props">
                        <q-td key="concepto" :props="props">{{ props.row.concepto }}</q-td>
                        <q-td key="base_" :props="props">{{ formatCurrency(props.row.base_) }}</q-td>
                        <q-td key="importe" :props="props">{{ formatCurrency(props.row.importe) }}</q-td>
                    </q-tr>
                </template>
            </q-table>
            <q-table :data="[getTotales(registros)]" :columns="columnsTotales" dense flat bordered row-key="concepto"
                class="shadow-0 border-0 q-mt-sm" hide-header hide-bottom>
                <template v-slot:body="props">
                    <q-tr :props="props">
                        <q-td key="concepto" :props="props"><strong>Total</strong></q-td>
                        <q-td key="base_" :props="props">{{ formatCurrency(props.row.base_) }}</q-td>
                        <q-td key="importe" :props="props">{{ formatCurrency(props.row.importe) }}</q-td>
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
                    { name: 'concepto', label: 'Concepto', align: 'left', field: 'concepto', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-impuestos text-white' },
                    { name: 'base_', label: 'Base', align: 'right', field: 'base_', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-impuestos text-white', },
                    { name: 'importe', label: 'Importe', align: 'right', field: 'importe', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-impuestos text-white', },
                ],
                columnsTotales: [
                    { name: 'concepto', label: 'Concepto', align: 'left', field: 'concepto', sortable: true, classes: 'total-row-i ellipsis', headerClasses: 'bgc-impuestos text-white' },
                    { name: 'base_', label: 'Base', align: 'right', field: 'base_', sortable: true, classes: 'total-row-i ellipsis', headerClasses: 'bgc-impuestos text-white', },
                    { name: 'importe', label: 'Importe', align: 'right', field: 'importe', sortable: true, classes: 'total-row-i ellipsis', headerClasses: 'bgc-impuestos text-white', },
                ],
            }
        },
        computed: {
            token() {
                return this.$store.state.usuario;
            },
            items() {
                return this.$store.state.dataViewReporte[40];
            },
        },
        methods: {
            formatCurrency(value) {
                return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
            },
            getTotales(registros) {
                return {
                    concepto: 'Total',
                    base_: registros.reduce((sum, r) => sum + (r.base_ || 0), 0),
                    importe: registros.reduce((sum, r) => sum + (r.importe || 0), 0),
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