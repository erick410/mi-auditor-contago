<template>
    <div style="width: 100%;">
        <div class="titulo-reporte-impuestos">
            REPORTE IEPS
        </div>
        <div class="q-mb-md">
            <q-table :data="items.contenido" :columns="columns" row-key="mes" flat bordered class="shadow-0 border-0"
                dense>
                <template v-slot:body="props">
                    <q-tr :props="props">
                        <q-td key="mes" :props="props">{{ props.row.mes }}</q-td>
                        <q-td key="contadorEmitidos" :props="props">{{ props.row.contadorEmitidos }}</q-td>
                        <q-td key="importeEmitido" :props="props">{{ formatCurrency(props.row.importeEmitido) }}</q-td>
                        <q-td key="contadorRecibidos" :props="props">{{ props.row.contadorRecibidos }}</q-td>
                        <q-td key="importeRecibido" :props="props">{{ formatCurrency(props.row.importeRecibido)
                            }}</q-td>
                    </q-tr>
                </template>
            </q-table>
            <q-table :data="[getTotales(items.contenido)]" :columns="columnsTotales" dense flat bordered row-key="mes"
                class="shadow-0 border-0 q-mt-sm" hide-header hide-bottom>
                <template v-slot:body="props">
                    <q-tr :props="props">
                        <q-td key="mes" :props="props"><strong>Total</strong></q-td>
                        <q-td key="contadorEmitidos" :props="props">{{ props.row.contadorEmitidos }}</q-td>
                        <q-td key="importeEmitido" :props="props">{{ formatCurrency(props.row.importeEmitido) }}</q-td>
                        <q-td key="contadorRecibidos" :props="props">{{ props.row.contadorRecibidos }}</q-td>
                        <q-td key="importeRecibido" :props="props">{{ formatCurrency(props.row.importeRecibido)
                            }}</q-td>
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
                    { name: 'contadorEmitidos', label: '# Comprbantes Emitidos', align: 'center', field: 'contadorEmitidos', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-impuestos text-white', },
                    { name: 'importeEmitido', label: 'Importe', align: 'right', field: 'importeEmitido', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-impuestos text-white', },
                    { name: 'contadorRecibidos', label: '# Comprobantes Recibidos', align: 'center', field: 'contadorRecibidos', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-impuestos text-white', },
                    { name: 'importeRecibido', label: 'Importe', align: 'right', field: 'importeRecibido', sortable: true, classes: 'bg-grey-2 ellipsis', headerClasses: 'bgc-impuestos text-white', },
                ],
                columnsTotales: [
                    { name: 'mes', label: 'Mes', align: 'center', field: 'mes', sortable: true, classes: 'total-row-i ellipsis', headerClasses: 'bgc-impuestos text-white' },
                    { name: 'contadorEmitidos', label: '# Comprbantes Emitidos', align: 'center', field: 'contadorEmitidos', sortable: true, classes: 'total-row-i ellipsis', headerClasses: 'bgc-impuestos text-white', },
                    { name: 'importeEmitido', label: 'Importe', align: 'right', field: 'importeEmitido', sortable: true, classes: 'total-row-i ellipsis', headerClasses: 'bgc-impuestos text-white', },
                    { name: 'contadorRecibidos', label: '# Comprobantes Recibidos', align: 'center', field: 'contadorRecibidos', sortable: true, classes: 'total-row-i ellipsis', headerClasses: 'bgc-impuestos text-white', },
                    { name: 'importeRecibido', label: 'Importe', align: 'right', field: 'importeRecibido', sortable: true, classes: 'total-row-i ellipsis', headerClasses: 'bgc-impuestos text-white', },
                ],
            }
        },
        computed: {
            token() {
                return this.$store.state.usuario;
            },
            items() {
                return this.$store.state.dataViewReporte[43];
            },
        },
        methods: {
            formatCurrency(value) {
                return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
            },
            getTotales(registros) {
                return {
                    mes: 'Total',
                    contadorEmitidos: registros.reduce((sum, r) => sum + (r.contadorEmitidos || 0), 0),
                    importeEmitido: registros.reduce((sum, r) => sum + (r.importeEmitido || 0), 0),
                    contadorRecibidos: registros.reduce((sum, r) => sum + (r.contadorRecibidos || 0), 0),
                    importeRecibido: registros.reduce((sum, r) => sum + (r.importeRecibido || 0), 0),
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