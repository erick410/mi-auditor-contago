import jsPDF from "jspdf";
 
import axios from "axios";
 
import Chart from "chart.js";
import { tr } from "date-fns/locale";

 
const generarIndiceEmpresarial = async (opciones = {}) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Crear documento PDF
      const doc = new jsPDF({
        orientation: "l",
      });

      // obtener datos de la empresa
      try {
     
        // agregar indiice
        agregarIndice(doc, opciones.datosEmpresa, "ENERO A MARZO 2025");

        //BANDERAS PARA LAS PORTADAS
     
        
    
        // Generar nombre del documento
        let nombreDoc = `ReporteIndice_${opciones.datosEmpresa.nombre}_${new Date().toISOString().split("T")[0]
          }`;

        // Obtener el PDF como base64
        const base64 = doc.output("datauristring");

        // Obtener el PDF como blob para descarga
        const blobPDF = doc.output("blob");

        resolve({
          base64: base64,
          blob: blobPDF,
          nombreDoc: nombreDoc,
        });

      } catch (error) {
        console.log("Error al obtener datos de la empresa:", error);
        reject(error);
      }
    } catch (error) {
      console.error("Error al generar el reporte:", error);
      reject(error);
    }
  });
};

 
/**
 * Crear una página de índice para el reporte empresarial
 * Agrega una página de índice después de la portada con la lista de secciones organizadas por categoría
 * @param {jsPDF} doc - Documento PDF
 * @param {Object} empresaData - Datos de la empresa
 * @param {string} periodo - Periodo del reporte (ej. "ENERO A MARZO 2025")
 */
const agregarIndice = (
  doc,
  empresaData = {},
  periodo = "ENERO A MARZO 2025"
) => {
  // Añadir una página para el índice después de la portada
  const indexPageNumber = doc.internal.getNumberOfPages(); // Guardamos el número de página del índice

  // Título del índice
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(0, 0, 0);
  doc.text("ÍNDICE", 150, 15, { align: "center" });

  // Definir los colores para cada categoría
  const categorias = [
    { nombre: "Reporte de Gastos", color: [40, 75, 140] }, // Azul
    { nombre: "Reporte de desglose de proveedores", color: [40, 75, 140] }, // Azul
    { nombre: "Reporte cuentas por Pagar", color: [40, 75, 140] }, // Azul
    { nombre: "Reporte de Ingresos", color: [67, 160, 71] }, // Verde
    { nombre: "Reporte cuentas por Cobrar", color: [67, 160, 71] }, // Verde
    { nombre: "Reporte de Pagos de IVA", color: [242, 133, 0] }, // Naranja
    { nombre: "Reporte de Retenciones", color: [242, 133, 0] }, // Naranja
    { nombre: "Reporte Validaciones de RFC", color: [155, 45, 45] }, // Rojo
  ];

  // Definir las secciones por categoría
  const secciones = {
    "Reporte de Ingresos": [
      { nombre: "Uso de CFDI (Emitidos y Recibidos)", destino: "uso_cfdi" },
      {
        nombre: "Comprobantes Emitidos (Tipo Ingreso)",
        destino: "emitidos_ingreso",
      },
      { nombre: "Comprobantes Emitidos por RFC", destino: "emitidos_rfc" },
      { nombre: "Flujo Efectivamente Cobrado", destino: "flujo_cobrado" },
    ],
    "Reporte de Gastos": [
        { nombre: "Uso de CFDI (Emitidos y Recibidos)", destino: "uso_cfdi" },
        {
        nombre: "Comprobantes Recibidos (Tipo Ingreso)",
        destino: "recibidos_ingreso",
      },
      { nombre: "Comprobantes Recibidos por RFC", destino: "recibidos_rfc" },
     
    ],

    
    "Reporte de desglose de proveedores":[
      { nombre: "Flujo Efectivamente pagado", destino: "reporte_ieps" },
    ],
    "Reporte cuentas por Cobrar":[],
    "Reporte cuentas por Pagar":[],
    "Reporte de Anticipos":[],
     "Reporte Validaciones de RFC": [
      {
        nombre: "Comprobantes sin Impuestos",
        destino: "gastos_efectivo",
      },
      { nombre: "Comprobantes de arrendamiento sin cuenta predial", destino: "notas_sin_relacion" },
      {
        nombre: "Conceptos con clave 01010101 (No existe en el catálogo)",
        destino: "riesgo_arrendamiento",
      },
      { nombre: "Gastos en Efectivo", destino: "riesgo_factura_global" },
      { nombre: "Notas de Crédito sin Relación", destino: "riesgo_factura_global" },
      { nombre: "Comprobantes en PUE con Forma de Pago 99", destino: "riesgo_factura_global" },
      { nombre: "Comprobantes en PUE con Forma de Pago 30", destino: "riesgo_factura_global" },
      { nombre: "Pagos Fuera de Tiempo", destino: "riesgo_factura_global" },
      { nombre: "Pagos antes del Comprobante", destino: "riesgo_factura_global" },
      { nombre: "Listas Negras", destino: "riesgo_factura_global" },
      { nombre: "Combustibles", destino: "riesgo_factura_global" },
    ],
    "Reporte de Pagos de IVA":[
        { nombre: "Reporte de IVA", destino: "reporte_iva" },
       
    ],
    "Reporte de Retenciones":[
          { nombre: "Retenciones ISR", destino: "retenciones_isr" },
           { nombre: "ISR Nómina", destino: "isr_nomina" },
          { nombre: "Reporte IVA Retenido", destino: "reporte_ieps" },
    ],
  };

  // Título para el listado de secciones
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("CONTENIDO DEL REPORTE", 150, 30, { align: "center" });

  // Variables para controlar la posición del contenido
  let startPosY = 45;
  let currentPosY = startPosY;
  let currentColumn = 0;
  const columnsX = [40, 160]; // Posiciones X para cada columna en formato horizontal
  const maxHeight = 140; // Altura máxima por columna en formato horizontal

  window.sectionPageMap = {};

  // Función auxiliar para obtener el color por categoría
  const getColorForCategory = (category) => {
    const catObj = categorias.find((c) => c.nombre === category);
    return catObj ? catObj.color : [0, 0, 0];
  };

  // Recorrer las categorías y sus secciones - Contenido primero
  Object.keys(secciones).forEach((categoria) => {
    // Verificar si necesitamos cambiar de columna
    if (currentPosY + 20 > startPosY + maxHeight) {
      currentPosY = startPosY;
      currentColumn++;

      // Si excedemos las columnas disponibles, necesitamos añadir otra página
      if (currentColumn >= columnsX.length) {
        doc.addPage();
        currentColumn = 0;
        currentPosY = startPosY;

        // Añadir título en la nueva página
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("CONTENIDO DEL REPORTE (CONTINUACIÓN)", 150, 20, {
          align: "center",
        });
      }
    }

    // Obtener el color para esta categoría
    const color = getColorForCategory(categoria);

    // Título de la categoría
    // doc.setFontSize(14);
    // doc.setFont("helvetica", "bold");
    // doc.setTextColor(color[0], color[1], color[2]);
    // doc.text(categoria, columnsX[currentColumn], currentPosY);
    // currentPosY += 8;
// Título de la categoría
doc.setFontSize(14);
doc.setFont("helvetica", "bold");
doc.setTextColor(color[0], color[1], color[2]);

// Dibujar círculo solo con contorno
doc.setDrawColor(color[0], color[1], color[2]); // Color del contorno
doc.circle(columnsX[currentColumn] - 5, currentPosY - 1.5, 1.5, "S"); // "S" = Stroke (sin relleno)
// doc.circle(columnsX[currentColumn] - 5, currentPosY - 3, 1.5, "F");

doc.text(categoria, columnsX[currentColumn], currentPosY);
currentPosY += 8;

    // Listar las secciones de esta categoría
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    secciones[categoria].forEach((seccion) => {
      // Verificar si necesitamos cambiar de columna
      if (currentPosY > startPosY + maxHeight) {
        currentPosY = startPosY;
        currentColumn++;

        // Si excedemos las columnas disponibles, necesitamos añadir otra página
        if (currentColumn >= columnsX.length) {
          doc.addPage();
          currentColumn = 0;
          currentPosY = startPosY;

          // Añadir título en la nueva página
          doc.setFontSize(16);
          doc.setFont("helvetica", "bold");
          doc.text("CONTENIDO DEL REPORTE (CONTINUACIÓN)", 150, 20, {
            align: "center",
          });
        }
      }

      // Dibujar un punto como viñeta
      doc.setFillColor(color[0], color[1], color[2]);
      doc.circle(columnsX[currentColumn] - 5, currentPosY - 1, 1.5, "F");

      const textWidth =
        (currentColumn < columnsX.length - 1
          ? columnsX[currentColumn + 1]
          : doc.internal.pageSize.getWidth() - 20) -
        columnsX[currentColumn] -
        10;

     
      doc.text(seccion.nombre, columnsX[currentColumn], currentPosY);
      currentPosY += 6;
    });

    // Añadir espacio después de cada categoría
    currentPosY += 5;
  });

  // Sección para la guía de colores después del contenido
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("GUÍA DE COLORES", 150, 180, { align: "center" });

  // Dibujar la leyenda de colores en formato horizontal
  const colorBoxSize = 8;

doc.setFontSize(10);
doc.setFont("helvetica", "normal");

function dibujarCategoria(nombre, color, x, y) {
  // Dibuja el rectángulo de color
  doc.setFillColor(...color);
  doc.rect(x, y, colorBoxSize, colorBoxSize / 2, "F");

  // Configura el texto
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);

  // Ajuste: subir un poco el rectángulo y alinear el texto al centro del cuadro
  const textY = y + (colorBoxSize / 2) - 0.5; // 👈 centra visualmente con el rectángulo

  doc.text(nombre, x + colorBoxSize + 4, textY);
}

// ---- FILA 1 ----
dibujarCategoria("Reporte de Ingresos", [67, 160, 71], 240, 190);
dibujarCategoria("Reporte de Gastos", [40, 75, 140], 20, 190);
dibujarCategoria("Reporte de desglose de proveedores", [40, 75, 140], 90, 190);
dibujarCategoria("Reporte Validaciones de RFC", [155, 45, 45], 240, 195);

// ---- FILA 2 ----
dibujarCategoria("Reporte cuentas por Cobrar", [67, 160, 71], 20, 195);
dibujarCategoria("Reporte cuentas por Pagar", [40, 75, 140], 170, 190);
dibujarCategoria("Reporte de Pagos de IVA", [242, 133, 0], 90, 195);
dibujarCategoria("Reporte de Retenciones", [242, 133, 0], 170, 195);

//   // Dibujar cada cuadro de color con su descripción
//   categorias.forEach((cat, index) => {
//     // Calcular posición en la cuadrícula
//     const rowIndex = Math.floor(index / colorsPerRow);
//     const colIndex = index % colorsPerRow;

//     // Calcular posición X e Y
//     const posX = 15 + colIndex * 40;
//     const posY = 200 + rowIndex * 15;

//     // Dibujar el rectángulo de color
//     doc.setFillColor(cat.color[0], cat.color[1], cat.color[2]);
//     doc.rect(posX, posY, colorBoxSize, colorBoxSize / 2, "F");

//     // Escribir el nombre de la categoría
//     doc.setTextColor(0, 0, 0);
//     doc.text(cat.nombre, posX + colorBoxSize + 3, posY + colorBoxSize / 2 - 2);
//   });
 

  // Añadir nota al pie
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Este reporte contiene datos financieros y fiscales del periodo de ${periodo}`,
    150,
    245,
    { align: "center" }
  );

  // Si tenemos datos de la empresa, mostrarlos en el pie de página
  if (empresaData.nombre) {
    doc.text(
      `Reporte generado para ${empresaData.nombre} (${empresaData.rfc || ""})`,
      150,
      252,
      { align: "center" }
    );
  }

  // Agregar pie de página y número de página
  const totalPages = doc.internal.getNumberOfPages();
  doc.setFontSize(8);
  doc.text(`Página 2 de ${totalPages}`, 280, 285, { align: "right" });
};
 
 
 

/**
 * Funcion para descargar el PDF generado
 * @param {Blob} blob - Blob del PDF
 * @param {string} nombreArchivo - Nombre del archivo
 */
const descargarPDFIndice = (blob, nombreArchivo) => {
  // Crear URL para el blob
  const url = URL.createObjectURL(blob);

  // Crear un elemento <a> invisible
  const enlaceDescarga = document.createElement("a");
  enlaceDescarga.href = url;
  enlaceDescarga.download = `${nombreArchivo}.pdf`;

  // Agregar al DOM, hacer clic y luego remover
  document.body.appendChild(enlaceDescarga);
  enlaceDescarga.click();

  // Pequeño retraso antes de remover
  setTimeout(() => {
    document.body.removeChild(enlaceDescarga);
    URL.revokeObjectURL(url);
  }, 100);
};

// Exportar funciones
export {
  generarIndiceEmpresarial,
  descargarPDFIndice,
};
