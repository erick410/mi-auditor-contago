<template>
    <div>
        <canvas style="max-height:700px" ref="chartCanvas"></canvas>
    </div>
</template>
  
<script>
import Chart from "chart.js";

export default {
    props: {
        chartData: Object, // Los datos para tu gráfica
        chartTitle: String,
        chartOptions:  Object,
    },
    mounted() {
        // Renderiza la gráfica cuando el componente se monta
        //  this.renderChart();
    },

    watch: {
        chartData: {
            deep: true,
            handler(newData) {
                this.updateChart(newData);
            },
        },
    },

    methods: {
        renderChart() {
            const ctx = this.$refs.chartCanvas.getContext("2d");

            new Chart(ctx, {
                type: "bar", // Cambia esto al tipo de gráfica que necesites (bar, line, pie, etc.)
                data: this.chartData,
                options: {
                    // Opciones de configuración de la gráfica (títulos, etiquetas, colores, etc.)
                },
            });
        },

        updateChart(newData) {
            const ctx = this.$refs.chartCanvas.getContext("2d");
            if (this.chart) {
                this.chart.destroy(); // Destruye la gráfica existente antes de crear una nueva
            }
            this.chart = new Chart(ctx, {
                type: "bar",
                data: newData,
                options: {
                    responsive: true,
                    title: {
                        display: true,
                        text: this.chartTitle
                    }
                },
                // options: this.chartOptions
            });
        },
    },
};
</script>
  