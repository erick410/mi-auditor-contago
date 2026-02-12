<template>
    <div style="width: 100%;">
        <div class="titulo-reporte-nomina">
            NÓMINA CONCEPTOS
        </div>
        <div v-if="items && items.contenido">

            <div class="q-mb-md" v-for="(registros, mes) in items.contenido" :key="mes">
                <q-table :data="registros" :columns="columnsNomina" row-key="rfc" flat bordered
                    class="shadow-0 border-0" dense :title="mes">
                    <template v-slot:body="props">
                        <q-tr :props="props">
                            <q-td key="clave" :props="props">{{ props.row.clave }}</q-td>
                            <q-td key="claveSat" :props="props">{{ props.row.claveSat }}</q-td>
                            <q-td key="concepto" :props="props">{{ props.row.concepto }}</q-td>
                            <q-td key="importe" :props="props">{{ formatCurrency(props.row.importe) }}</q-td>
                        </q-tr>
                    </template>
                </q-table>
                <q-table :data="[getTotales(registros)]" :columns="columnsTotales" dense flat bordered row-key="clave"
                    class="shadow-0 border-0 q-mt-sm" hide-header hide-bottom>
                    <template v-slot:body="props">
                        <q-tr :props="props">
                            <q-td key="clave" :props="props"><strong>Total</strong></q-td>
                            <q-td key="claveSat" :props="props">{{ props.row.claveSat }}</q-td>
                            <q-td key="concepto" :props="props">{{ props.row.concepto }}</q-td>
                            <q-td key="importe" :props="props">{{ formatCurrency(props.row.importe) }}</q-td>
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
                columnsNomina: [
                    { name: 'clave', label: 'Mes', align: 'center', field: 'clave', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-nomina text-white' },
                    { name: 'claveSat', label: 'Clave SAT', align: 'left', field: 'claveSat', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-nomina text-white' },
                    { name: 'concepto', label: 'Concepto', align: 'left', field: 'concepto', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-nomina text-white' },
                    { name: 'importe', label: 'Importe', align: 'right', field: 'importe', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-nomina text-white', },
                ],
                columnsTotales: [
                    { name: 'clave', label: 'Mes', align: 'center', field: 'clave', sortable: true, classes: 'total-row-n ellipsis', headerClasses: 'bgc-nomina text-white' },
                    { name: 'claveSat', label: 'Clave SAT', align: 'left', field: 'claveSat', sortable: true, classes: 'total-row-n ellipsis', headerClasses: 'bgc-nomina text-white' },
                    { name: 'concepto', label: 'Concepto', align: 'left', field: 'concepto', sortable: true, classes: 'total-row-n ellipsis', headerClasses: 'bgc-nomina text-white' },
                    { name: 'importe', label: 'Importe', align: 'right', field: 'importe', sortable: true, classes: 'total-row-n ellipsis', headerClasses: 'bgc-nomina text-white', },
                ],
            }
        },
        computed: {
            token() {
                return this.$store.state.usuario;
            },
            items() {
                return this.$store.state.dataViewReporte[13];
            },
        },
        methods: {
            formatCurrency(value) {
                return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
            },
            getTotales(registros) {
                return {
                    clave: 'Total',
                    claveSat: '-',
                    concepto: '-',
                    importe: registros.reduce((sum, r) => sum + (r.importe || 0), 0),
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