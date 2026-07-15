import jsPDF from 'jspdf'
import 'jspdf-autotable'
import Chart from 'chart.js'
import { formatearValor, agruparPorCategoria, resumenGeneral } from './razonesFinancieras'

const ROJO = [231, 71, 71]
const GRIS_OSCURO = [50, 50, 50]

export async function generarReportePDF(razones, nombreEmpresa = this.$store.state.empresaStore.nombre, periodo = new Date().getFullYear()) {
    const doc = new jsPDF()
    const resumen = resumenGeneral(razones)
    const categorias = agruparPorCategoria(razones)

    // ===================== PORTADA =====================
    dibujarPortada(doc, nombreEmpresa, periodo, resumen)

    // ===================== RESUMEN EJECUTIVO =====================
    doc.addPage()
    await dibujarResumenEjecutivo(doc, resumen, categorias)

    // ===================== DETALLE POR CATEGORÍA =====================
    for (const cat of categorias) {
        doc.addPage()
        dibujarCategoria(doc, cat)
    }

    // ===================== PIE DE PÁGINA EN TODAS LAS HOJAS =====================
    agregarPiesDePagina(doc, nombreEmpresa)

    const hoy = new Date();
    const dd = String(hoy.getDate()).padStart(2, '0');
    const mm = String(hoy.getMonth() + 1).padStart(2, '0'); 
    const aaaa = hoy.getFullYear();
    doc.save(`razones_financieras_${nombreEmpresa.replace(/\s+/g, '_')}_${dd}/${mm}/${aaaa}.pdf`)
}

// ---------------------------------------------------------------
function dibujarPortada(doc, nombreEmpresa, periodo, resumen) {
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    doc.setFillColor(...ROJO)
    doc.rect(0, 0, pageWidth, 70, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont(undefined, 'bold')
    doc.text('Reporte de Razones Financieras', pageWidth / 2, 35, { align: 'center' })
    doc.setFontSize(13)
    doc.setFont(undefined, 'normal')
    doc.text(`Ejercicio Fiscal ${periodo}`, pageWidth / 2, 46, { align: 'center' })

    doc.setTextColor(...GRIS_OSCURO)
    doc.setFontSize(16)
    doc.setFont(undefined, 'bold')
    doc.text(nombreEmpresa, pageWidth / 2, 95, { align: 'center' })

    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')
    doc.text(`Generado el ${new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}`, pageWidth / 2, 103, { align: 'center' })

    // Semáforo general grande
    const cy = 150
    doc.setFontSize(12)
    doc.text('Salud financiera general', pageWidth / 2, cy - 25, { align: 'center' })

    doc.setFontSize(36)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(...colorSalud(resumen.porcentajeSalud))
    doc.text(`${(resumen.porcentajeSalud * 100).toFixed(0)}%`, pageWidth / 2, cy, { align: 'center' })

    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(...GRIS_OSCURO)
    const veredictoLineas = doc.splitTextToSize(resumen.veredicto, pageWidth - 60)
    doc.text(veredictoLineas, pageWidth / 2, cy + 15, { align: 'center' })

    // Mini leyenda de conteo
    const leyendaY = cy + 40
    doc.setFontSize(10)
    doc.setFillColor(33, 186, 69); doc.circle(pageWidth / 2 - 45, leyendaY, 2.5, 'F')
    doc.text(`${resumen.buenas} Buenas`, pageWidth / 2 - 40, leyendaY + 1)
    doc.setFillColor(242, 192, 55); doc.circle(pageWidth / 2, leyendaY, 2.5, 'F')
    doc.text(`${resumen.regulares} Regulares`, pageWidth / 2 + 5, leyendaY + 1)
    doc.setFillColor(193, 0, 21); doc.circle(pageWidth / 2 + 50, leyendaY, 2.5, 'F')
    doc.text(`${resumen.malas} Malas`, pageWidth / 2 + 55, leyendaY + 1)

    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text('Este reporte es una herramienta de apoyo a la toma de decisiones y no sustituye una auditoría financiera formal.', pageWidth / 2, pageHeight - 15, { align: 'center', maxWidth: pageWidth - 40 })
}

// ---------------------------------------------------------------
async function dibujarResumenEjecutivo(doc, resumen, categorias) {
    let y = 20
    doc.setTextColor(...GRIS_OSCURO)
    doc.setFontSize(16)
    doc.setFont(undefined, 'bold')
    doc.text('Resumen Ejecutivo', 14, y)
    y += 10

    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')
    const texto = doc.splitTextToSize(
        `De las ${resumen.total} razones financieras evaluadas, ${resumen.buenas} se encuentran en un nivel bueno, ` +
        `${resumen.regulares} en nivel regular y ${resumen.malas} en nivel de atención. ${resumen.veredicto}`,
        182,
    )
    doc.text(texto, 14, y)
    y += texto.length * 5 + 10

    // Gráfica de radar por categoría
    const imgRadar = await generarRadarCategorias(categorias)
    doc.addImage(imgRadar, 'PNG', 30, y, 150, 90)
    y += 100

    // Tabla resumen por categoría
    doc.autoTable({
        startY: y,
        head: [['Categoría', 'Promedio', 'Nivel']],
        body: categorias.map(c => [
            c.categoria,
            `${c.promedio.toFixed(1)} / 3.0`,
            c.promedio >= 2.5 ? 'BUENO' : c.promedio >= 1.5 ? 'REGULAR' : 'ATENCIÓN',
        ]),
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: ROJO },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 2) {
                const nivel = data.cell.raw
                const colores = { BUENO: [33, 186, 69], REGULAR: [242, 192, 55], 'ATENCIÓN': [193, 0, 21] }
                data.cell.styles.textColor = colores[nivel] || [0, 0, 0]
                data.cell.styles.fontStyle = 'bold'
            }
        },
    })
}

// ---------------------------------------------------------------
function dibujarCategoria(doc, cat) {
    let y = 20
    doc.setTextColor(...ROJO)
    doc.setFontSize(15)
    doc.setFont(undefined, 'bold')
    doc.text(cat.categoria, 14, y)
    y += 8

    doc.autoTable({
        startY: y,
        head: [['Razón', 'Valor', 'Bueno', 'Regular', 'Malo', 'Resultado']],
        body: cat.items.map(r => [
            r.nombre,
            formatearValor(r.valor, r.formato),
            r.rangos.bueno,
            r.rangos.regular,
            r.rangos.malo,
            r.estado.toUpperCase(),
        ]),
        styles: { fontSize: 8, cellPadding: 3, valign: 'middle', overflow: 'linebreak' },
        headStyles: { fillColor: ROJO, fontSize: 8 },
        // Anchos explícitos (suman ~182mm, el ancho útil de la página con márgenes de 14mm)
        columnStyles: {
            0: { cellWidth: 42 }, // Razón
            1: { cellWidth: 22 }, // Valor
            2: { cellWidth: 30 }, // Bueno   <- más ancho, ya no se corta
            3: { cellWidth: 30 }, // Regular
            4: { cellWidth: 30 }, // Malo
            5: { cellWidth: 24 }, // Resultado
        },
        didParseCell: (data) => {
            // Resultado ahora es la columna índice 5, no 6
            if (data.section === 'body' && data.column.index === 5) {
                const estado = data.cell.raw
                const colores = { BUENO: [33, 186, 69], REGULAR: [242, 192, 55], MALO: [193, 0, 21] }
                data.cell.styles.textColor = colores[estado] || [0, 0, 0]
                data.cell.styles.fontStyle = 'bold'
            }
        },
    })

    y = doc.lastAutoTable.finalY + 8

    // Interpretación de cada razón, en texto
    cat.items.forEach((r) => {
        if (y > 265) { doc.addPage(); y = 20 }
        doc.setFontSize(9.5)
        doc.setFont(undefined, 'bold')
        doc.setTextColor(...GRIS_OSCURO)
        doc.text(`${r.nombre}:`, 14, y)
        doc.setFont(undefined, 'normal')
        const lineas = doc.splitTextToSize(r.descripcion, 182)
        doc.text(lineas, 14, y + 5)
        y += 5 + lineas.length * 4.5 + 4
    })
}

// ---------------------------------------------------------------
function agregarPiesDePagina(doc, nombreEmpresa) {
    const totalPaginas = doc.internal.getNumberOfPages()
    for (let i = 1; i <= totalPaginas; i++) {
        doc.setPage(i)
        const pageWidth = doc.internal.pageSize.getWidth()
        const pageHeight = doc.internal.pageSize.getHeight()
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(nombreEmpresa, 14, pageHeight - 10)
        doc.text(`Página ${i} de ${totalPaginas}`, pageWidth - 14, pageHeight - 10, { align: 'right' })
    }
}

// ---------------------------------------------------------------
function colorSalud(porcentaje) {
    if (porcentaje >= 0.75) return [33, 186, 69]
    if (porcentaje >= 0.5) return [242, 192, 55]
    return [193, 0, 21]
}

// ---------------------------------------------------------------
function generarRadarCategorias(categorias) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas')
        canvas.width = 500
        canvas.height = 350
        canvas.style.position = 'fixed'
        canvas.style.top = '-9999px'
        document.body.appendChild(canvas)

        const ctx = canvas.getContext('2d')
        let chartInstance = null

        chartInstance = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: categorias.map(c => c.categoria),
                datasets: [{
                    label: 'Nivel',
                    data: categorias.map(c => c.promedio),
                    backgroundColor: 'rgba(231, 71, 71, 0.2)',
                    borderColor: '#e74747',
                    pointBackgroundColor: '#e74747',
                }],
            },
            options: {
                responsive: false,
                animation: {
                    duration: 0,
                    onComplete: () => {
                        setTimeout(() => {
                            try {
                                const imgData = canvas.toDataURL('image/png', 1.0)
                                if (chartInstance) chartInstance.destroy()
                                document.body.removeChild(canvas)
                                resolve(imgData)
                            } catch (err) {
                                if (chartInstance) chartInstance.destroy()
                                document.body.removeChild(canvas)
                                reject(err)
                            }
                        }, 0)
                    },
                },
                legend: { display: false },
                scale: {
                    ticks: { min: 0, max: 3, stepSize: 1, showLabelBackdrop: false },
                    pointLabels: { fontSize: 10 },
                },
            },
        })
    })
}