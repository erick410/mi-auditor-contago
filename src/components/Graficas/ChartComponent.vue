<template>
    <div>
      <canvas style="max-height:700px" ref="chartCanvas"></canvas>
    </div>
  </template>
  
  <script>
  import Chart from 'chart.js'
  
  export default {
    props: {
      chartData:    Object,
      chartTitle:   String,
      chartOptions: Object,
    },
  
    mounted () {
      // Si los datos ya llegaron antes de que el canvas existiera, renderiza de una vez
      if (this.chartData) {
        this.updateChart(this.chartData)
      }
    },
  
    beforeDestroy () {
      // Limpia el chart antes de que el panel se destruya
      if (this.chart) {
        this.chart.destroy()
        this.chart = null
      }
    },
  
    watch: {
      chartData: {
        deep: true,
        handler (newData) {
          if (!newData) return
          // Espera al siguiente tick para asegurarse de que el canvas esté en el DOM
          this.$nextTick(() => {
            this.updateChart(newData)
          })
        }
      },
      chartTitle () {
        if (this.chartData) {
          this.$nextTick(() => this.updateChart(this.chartData))
        }
      }
    },
  
    methods: {
      updateChart (newData) {
        if (!this.$refs.chartCanvas) return   // canvas aún no existe
  
        const ctx = this.$refs.chartCanvas.getContext('2d')
  
        if (this.chart) {
          this.chart.destroy()
          this.chart = null
        }
  
        this.chart = new Chart(ctx, {
          type: 'bar',
          data: newData,
          options: {
            responsive: true,
            maintainAspectRatio: true,
            title: {
              display: !!this.chartTitle,
              text: this.chartTitle,
              fontSize: 14,
            },
            legend: {
              position: 'bottom',
            },
            scales: {
              yAxes: [{ ticks: { beginAtZero: true } }]
            }
          }
        })
      }
    }
  }
  </script>