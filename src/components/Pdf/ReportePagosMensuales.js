// reporte.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// --- FORMATO PESOS MXN ---
function formatoPesos(v) {
  if(v == null){
    return ""
  }
  return (
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(v ?? 0) ?? 0
  );
}

// --- FECHA REPORTE ---
function fechaActual() {
  return new Date().toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function FormatoPorcentaje(numero) {
  if (numero === "---") {
    return "";
  } else {
    const numeroConDecimales = Number(numero).toFixed(2);
    return numeroConDecimales.replace(/\d(?=(\d{3})+\.)/g, "$&,");
  }
}

function FormatoCantidad(numero) {
  if (numero === "---") {
    return "";
  } else {
    const numeroConDecimales = Number(numero).toFixed(3);
    return numeroConDecimales.replace(/\d(?=(\d{3})+\.)/g, "$&,");
  }
}

function FormatoMiles(numero) {
  return numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// --- JUSTIFICAR TEXTO ---
function textJustify(doc, text, x, y, maxWidth, lineHeight) {
  const lines = doc.splitTextToSize(text, maxWidth);

  lines.forEach((line, index) => {
    // Última línea no justifica
    if (index === lines.length - 1) {
      doc.text(line, x, y + index * lineHeight);
      return;
    }

    let words = line.trim().split(/\s+/);
    if (words.length === 1) {
      doc.text(line, x, y + index * lineHeight);
      return;
    }

    let lineWithoutSpaces = words.join("");
    let spaceCount = words.length - 1;
    let totalSpace = maxWidth - doc.getTextWidth(lineWithoutSpaces);
    let spaceSize = totalSpace / spaceCount;

    let cursorX = x;

    words.forEach((word, i) => {
      doc.text(word, cursorX, y + index * lineHeight);
      cursorX += doc.getTextWidth(word) + spaceSize;
    });
  });
}
function medirTexto(doc, text, maxWidth, lineHeight) {
  const lines = doc.splitTextToSize(text, maxWidth);
  return lines.length * lineHeight;
}

function agregarTextoConSaltos(doc, text, x, y, maxWidth, lineHeight) {
  const lines = doc.splitTextToSize(text, maxWidth);

  for (let i = 0; i < lines.length; i++) {
    // Si nos pasamos del límite de página → nueva página
    if (y > 750) {
      doc.addPage();
      y = 40; // margen superior
    }

    // última línea → sin justificar
    if (i === lines.length - 1) {
      doc.text(lines[i], x, y);
    } else {
      justificarLinea(doc, lines[i], x, y, maxWidth);
    }

    y += lineHeight;
  }

  return y; // devolver el nuevo Y para seguir escribiendo
}
function mesAnterior(nombreMes) {
  const meses = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];

  // Normalizamos el texto recibido
  nombreMes = nombreMes.toLowerCase();

  let index = meses.indexOf(nombreMes);

  if (index === -1) return null; // mes inválido

  let anteriorIndex = (index - 1 + 12) % 12;

  return meses[anteriorIndex];
}
function obtenerMesActual() {
  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const fecha = new Date();
  return meses[fecha.getMonth()];
}
function esAñoActual(año) {
  const añoActual = new Date().getFullYear();
  return Number(año) === añoActual;
}
function justificarLinea(doc, line, x, y, maxWidth) {
  const words = line.trim().split(/\s+/);
  if (words.length <= 1) {
    doc.text(line, x, y);
    return;
  }

  const lineWithoutSpaces = words.join("");
  const spaces = words.length - 1;
  const anchoTexto = doc.getTextWidth(lineWithoutSpaces);
  const espacioExtra = (maxWidth - anchoTexto) / spaces;

  let cursorX = x;

  words.forEach((w, idx) => {
    doc.text(w, cursorX, y);
    cursorX += doc.getTextWidth(w) + espacioExtra;
  });
}

export function generarReporte(
  anio,
  mesI,
  mesF,
  datos,
  retencionesIva,
  dataSueldos,
  dataAsimilados,
  dataOtros,
  dataHonorarios,
  dataArrendamientos,
  provisionalesISR,
  columnas,
  itemsReporteUso,
  dataVentas,
  dataCompras,
  dataMagna,
  dataPremium,
  dataDiesel,
  dataMagnaU,
  dataPremiumU,
  dataDieselU,
  datosRiesgoFiscal,
  datosRiesgoFiscalPagos,
  dataAnual,
  comentarios,
  empresa,
  logoBase64,
  usuario
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
  });
  //                      ENCABEZADO

  // LOGO IZQUIERDA
  if (logoBase64) {
    doc.addImage(logoBase64, "PNG", 20, 20, 170, 60);
  }

  // TEXTO DERECHA (alineado)
  const textoDerecha = `San Andrés Cholula, Puebla
    Fecha de reporte: ${fechaActual()}`;

  const lineas = doc.splitTextToSize(textoDerecha, 350);
  doc.setFontSize(10);
  doc.text(lineas, 570, 40, { align: "right" });

  //               NOMBRE DE LA EMPRESA
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(empresa, 40, 100);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Observaciones y conclusiones:", 40, 115);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("PAGOS DE IVA", 40, 140);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  const observaciones =
    `Según se desprende de la información registrada en el sistema MiAuditor, en la comparativa de los pagos definitivos de IVA del período de ENERO a ` +
    mesF +
    ` del ` +
    anio +
    `, entre lo que determina el sistema con base en comprobantes y lo que se declaró ante el SAT, se observan diferencias positivas y negativas. Las positivas son cantidades que faltó pagar (a cargo), y las negativas son cantidades que se pagaron de más (a favor). `;

  // textJustify(doc, observaciones, 40, 155, 520, 14);
  let y = 40;
  y = agregarTextoConSaltos(doc, observaciones, y, 155, 520, 14);
  y += 5; // espacio entre secciones

  autoTable(doc, {
    startY: y,
    head: [
      [
        "Mes",
        "Base IVA Trasladado",
        "Importe IVA Trasladado",
        "Base IVA Acreditado",
        "Importe IVA Acreditado",
        "IVA Retenido",
        "IVA Retenido Anterior",
        "IVA Cargo",
        "IVA Favor",
        "Cargo Registrado",
        "Favor Registrado",
        "Comparativa",
      ],
    ],
    body: datos.map((x) => [
      x.mes,
      formatoPesos(x.baseIvaTrasladado),
      formatoPesos(x.importeIvaTrasladado),
      formatoPesos(x.baseIvaAcreditado),
      formatoPesos(x.importeIvaAcreditado),
      formatoPesos(x.ivaRetenido),
      formatoPesos(x.ivaRetenidoAnterior),
      formatoPesos(x.ivaCargo),
      formatoPesos(x.ivaFavor),
      formatoPesos(x.cargoRegistrado),
      formatoPesos(x.favorRegistrado),
      formatoPesos(x.comparativa),
    ]),
    headStyles: {
      fillColor: "#E74747",
      textColor: "#FFF",
      fontSize: 6,
      halign: "center",
      valign: "middle",
    },
    styles: {
      fontSize: 6,
      cellPadding: 3,
    },
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "right" },
      3: { halign: "right" },
      4: { halign: "right" },
      5: { halign: "right" },
      6: { halign: "right" },
      7: { halign: "right" },
      8: { halign: "right" },
      9: { halign: "right" },
      10: { halign: "right" },
      11: { halign: "right" },
    },

    didParseCell: function (data) {
      if (data.section === "body") {
        if (data.row.index === datos.length - 1) {
          data.cell.styles.fillColor = "#F7C1C1";
          data.cell.styles.textColor = [0, 0, 0];
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
    didDrawPage: function (data) {
      // Pie de página
      const page = doc.internal.getNumberOfPages();
      doc.setFontSize(9);
      doc.text(`Página ${page}`, 300, doc.internal.pageSize.height - 20, {
        align: "center",
      });
    },
  });

  y = doc.lastAutoTable.finalY + 20;

  const condicion1 =
    "Las diferencias positivas pueden ser observadas por la autoridad y requeridas su aclaración.";
  const condicion2 =
    "Las negativas se acreditan en los pagos posteriores o se solicita su devolución.";
  let condicion3 =
    "Asi mismo el impuesto (a cargo) del mes " +
    mesAnterior(mesF).toUpperCase() +
    " se entera a más tardar el 17 de " +
    mesF;

  if (esAñoActual(anio) == false) {
    condicion3 = "";
  }

  const valores = datos.map((d) => d.comparativa);
  const hayPositivos = valores.some((v) => v > 5);
  const hayNegativos = valores.some((v) => v < -5);

  let texto1 = "";
  if (hayPositivos && hayNegativos) {
    console.log("Hay valores positivos y negativos");
    texto1 = condicion1 + " " + condicion2;
  } else if (hayPositivos) {
    console.log("Solo hay valores positivos");
    texto1 = condicion1;
  } else if (hayNegativos) {
    console.log("Solo hay valores negativos");
    texto1 = condicion2;
  } else {
    console.log("Solo hay ceros o la lista está vacía");
  }

  const hoy = new Date();
  const dia = hoy.getDate();
  if (dia < 17) {
    console.log("Hoy es antes del día 17");
    texto1 = texto1 + " " + condicion3;
  } else if (dia > 17) {
    console.log("Hoy es después del día 17");
  } else {
    console.log("Hoy ES el día 17");
    texto1 = texto1 + " " + condicion3;
  }

  // ---- SELECCIONAR SOLO UNA ----
  let condicionSeleccionada = texto1;

  // ---- CALCULAR ESPACIO ----
  y = agregarTextoConSaltos(
    doc,
    condicionSeleccionada,
    40, // margen izquierdo
    y, // continuar donde se quedó la tabla
    520, // ancho máximo
    14 // lineHeight
  );

  y += 10; // espacio entre secciones

  // y = agregarTextoConSaltos(doc, "Otro comentario…", 40, y, 520, 14);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("RETENCIONES DE IVA", 40, y);

  y += 15; // espacio entre secciones

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  y = agregarTextoConSaltos(
    doc,
    "En las retenciones de IVA el sistema compara lo que determina con base en comprobantes, contra lo que se declara ante el SAT, encontrando las siguientes diferencias:",
    40,
    y,
    520,
    14
  );

  y += 5; // espacio entre secciones

  autoTable(doc, {
    startY: y,
    head: [["Mes", "Importe IVA", "Comparativa", "Diferencia"]],
    body: retencionesIva.map((x) => [
      x.mes,
      formatoPesos(x.importeIva),
      formatoPesos(x.comparativa),
      formatoPesos(x.diferencia),
    ]),
    headStyles: {
      fillColor: "#E74747",
      textColor: "#FFF",
      fontSize: 6,
      halign: "center",
      valign: "middle",
    },
    styles: {
      fontSize: 6,
      cellPadding: 3,
    },
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "right" },
      3: { halign: "right" },
    },
    didParseCell: function (data) {
      if (data.section === "body") {
        if (data.row.index === retencionesIva.length - 1) {
          data.cell.styles.fillColor = "#F7C1C1";
          data.cell.styles.textColor = [0, 0, 0];
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
    didDrawPage: function (data) {
      // Pie de página
      const page = doc.internal.getNumberOfPages();
      doc.setFontSize(9);
      doc.text(`Página ${page}`, 300, doc.internal.pageSize.height - 20, {
        align: "center",
      });
    },
  });

  y = doc.lastAutoTable.finalY += 20;

  const condicion11 =
    "Las diferencias positivas pueden ser observadas por la autoridad y requeridas su aclaración.";
  const condicion22 =
    "Las diferencias negativas son pagos de lo indebido, las que se pueden recuperar mediante solicitud de devolución.";
  let condicion33 =
    "Asi mismo el impuesto (a cargo) del mes " +
    mesAnterior(mesF).toUpperCase() +
    " se entera a más tardar el 17 de " +
    mesF;

  if (esAñoActual(anio) == false) {
    condicion33 = "";
  }
  const valores1 = retencionesIva.map((d) => d.diferencia);
  const hayPositivos1 = valores1.some((v) => v > 5);
  const hayNegativos1 = valores1.some((v) => v < -5);

  let texto2 = "";
  if (hayPositivos1 && hayNegativos1) {
    console.log("Hay valores positivos y negativos");
    texto2 = condicion11 + " " + condicion22;
  } else if (hayPositivos1) {
    console.log("Solo hay valores positivos");
    texto2 = condicion11;
  } else if (hayNegativos1) {
    console.log("Solo hay valores negativos");
    texto2 = condicion22;
  } else {
    console.log("Solo hay ceros o la lista está vacía");
  }

  if (dia < 17) {
    console.log("Hoy es antes del día 17");
    texto2 = texto2 + " " + condicion33;
  } else if (dia > 17) {
    console.log("Hoy es después del día 17");
  } else {
    console.log("Hoy ES el día 17");
    texto2 = texto2 + " " + condicion33;
  }

  // ---- SELECCIONAR SOLO UNA ----
  let condicionSeleccionada2 = texto2;

  // ---- CALCULAR ESPACIO ----
  y = agregarTextoConSaltos(
    doc,
    condicionSeleccionada2,
    40, // margen izquierdo
    y, // continuar donde se quedó la tabla
    520, // ancho máximo
    14 // lineHeight
  );

  y += 10; // espacio entre secciones

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  y = agregarTextoConSaltos(doc, "RETENCIONES DE ISR", 40, y, 520, 14);

  y += 5; // espacio entre secciones

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  y = agregarTextoConSaltos(
    doc,
    "En las retenciones de ISR el sistema determina las siguientes diferencias:",
    40,
    y,
    520,
    14
  );

  let suma1 = dataSueldos.reduce(
    (acumulador, objeto) => acumulador + objeto.importe,
    0
  );
  if (suma1 > 0) {
    y += 10; // espacio entre secciones

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    y = agregarTextoConSaltos(
      doc,
      "RETENCIONES DE SUELDOS Y SALARIOS",
      40,
      y,
      520,
      14
    );

    y += 5; // espacio entre secciones

    autoTable(doc, {
      startY: y,
      head: [["Mes", "Importe", "Comparativa", "Diferencia"]],
      body: dataSueldos.map((x) => [
        x.mes,
        formatoPesos(x.importe),
        formatoPesos(x.comparativa),
        formatoPesos(x.diferencia),
      ]),
      headStyles: {
        fillColor: "#E74747",
        textColor: "#FFF",
        fontSize: 6,
        halign: "center",
        valign: "middle",
      },
      styles: {
        fontSize: 6,
        cellPadding: 3,
      },
      columnStyles: {
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right" },
      },
      didParseCell: function (data) {
        if (data.section === "body") {
          if (data.row.index === dataSueldos.length - 1) {
            data.cell.styles.fillColor = "#F7C1C1";
            data.cell.styles.textColor = [0, 0, 0];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
      didDrawPage: function (data) {
        // Pie de página
        const page = doc.internal.getNumberOfPages();
        doc.setFontSize(9);
        doc.text(`Página ${page}`, 300, doc.internal.pageSize.height - 20, {
          align: "center",
        });
      },
    });

    y = doc.lastAutoTable.finalY += 20;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    const condicionS1 =
      "Las diferencias positivas pueden ser observadas por la autoridad y requeridas su aclaración.";
    const condicionS2 =
      "Las diferencias negativas son pagos de lo indebido, las que se pueden recuperar mediante solicitud de devolución o son recibos de nómina por timbrar.";
    let condicionS3 =
      "Asi mismo el impuesto (a cargo) del mes " +
      mesAnterior(mesF).toUpperCase() +
      " se entera a más tardar el 17 de " +
      mesF;

    if (esAñoActual(anio) == false) {
      condicionS3 = "";
    }
    const valores2 = dataSueldos.map((d) => d.diferencia);
    const hayPositivos2 = valores2.some((v) => v > 5);
    const hayNegativos2 = valores2.some((v) => v < -5);

    let texto3 = "";
    if (hayPositivos2 && hayNegativos2) {
      console.log("Hay valores positivos y negativos");
      texto3 = condicionS1 + " " + condicionS2;
    } else if (hayPositivos2) {
      console.log("Solo hay valores positivos");
      texto3 = condicionS1;
    } else if (hayNegativos2) {
      console.log("Solo hay valores negativos");
      texto3 = condicionS2;
    } else {
      console.log("Solo hay ceros o la lista está vacía");
    }

    if (dia < 17) {
      console.log("Hoy es antes del día 17");
      texto3 = texto3 + " " + condicion33;
    } else if (dia > 17) {
      console.log("Hoy es después del día 17");
    } else {
      console.log("Hoy ES el día 17");
      texto3 = texto3 + " " + condicionS3;
    }

    // ---- SELECCIONAR SOLO UNA ----
    let condicionSeleccionada3 = texto3;

    // ---- CALCULAR ESPACIO ----
    y = agregarTextoConSaltos(
      doc,
      condicionSeleccionada3,
      40, // margen izquierdo
      y, // continuar donde se quedó la tabla
      520, // ancho máximo
      14 // lineHeight
    );
  }

  let suma2 = dataAsimilados.reduce(
    (acumulador, objeto) => acumulador + objeto.importe,
    0
  );
  if (suma2 > 0) {
    y += 10; // espacio entre secciones

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    y = agregarTextoConSaltos(
      doc,
      "ASIMILABLES A SUELDOS Y SALARIOS",
      40,
      y,
      520,
      14
    );

    y += 5; // espacio entre secciones

    autoTable(doc, {
      startY: y,
      head: [["Mes", "Importe", "Comparativa", "Diferencia"]],
      body: dataAsimilados.map((x) => [
        x.mes,
        formatoPesos(x.importe),
        formatoPesos(x.comparativa),
        formatoPesos(x.diferencia),
      ]),
      headStyles: {
        fillColor: "#E74747",
        textColor: "#FFF",
        fontSize: 6,
        halign: "center",
        valign: "middle",
      },
      styles: {
        fontSize: 6,
        cellPadding: 3,
      },
      columnStyles: {
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right" },
      },
      didParseCell: function (data) {
        if (data.section === "body") {
          if (data.row.index === dataAsimilados.length - 1) {
            data.cell.styles.fillColor = "#F7C1C1";
            data.cell.styles.textColor = [0, 0, 0];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
      didDrawPage: function (data) {
        // Pie de página
        const page = doc.internal.getNumberOfPages();
        doc.setFontSize(9);
        doc.text(`Página ${page}`, 300, doc.internal.pageSize.height - 20, {
          align: "center",
        });
      },
    });

    y = doc.lastAutoTable.finalY += 20;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    const condicionA1 =
      "Las diferencias positivas pueden ser observadas por la autoridad y requeridas su aclaración.";
    const condicionA2 =
      "Las diferencias negativas son pagos de lo indebido, las que se pueden recuperar mediante solicitud de devolución o son recibos de nómina por timbrar.";
    let condicionA3 =
      "Asi mismo el impuesto (a cargo) del mes " +
      mesAnterior(mesF).toUpperCase() +
      " se entera a más tardar el 17 de " +
      mesF;

    if (esAñoActual(anio) == false) {
      condicionA3 = "";
    }
    const valores3 = dataAsimilados.map((d) => d.diferencia);
    const hayPositivos3 = valores3.some((v) => v > 5);
    const hayNegativos3 = valores3.some((v) => v < -5);

    let texto4 = "";
    if (hayPositivos3 && hayNegativos3) {
      console.log("Hay valores positivos y negativos");
      texto4 = condicionA1 + " " + condicionA2;
    } else if (hayPositivos3) {
      console.log("Solo hay valores positivos");
      texto4 = condicionA1;
    } else if (hayNegativos3) {
      console.log("Solo hay valores negativos");
      texto4 = condicionA2;
    } else {
      console.log("Solo hay ceros o la lista está vacía");
    }

    if (dia < 17) {
      console.log("Hoy es antes del día 17");
      texto4 = texto4 + " " + condicionA3;
    } else if (dia > 17) {
      console.log("Hoy es después del día 17");
    } else {
      console.log("Hoy ES el día 17");
      texto4 = texto4 + " " + condicionA3;
    }

    // ---- SELECCIONAR SOLO UNA ----
    let condicionSeleccionada4 = texto4;

    // ---- CALCULAR ESPACIO ----
    y = agregarTextoConSaltos(
      doc,
      condicionSeleccionada4,
      40, // margen izquierdo
      y, // continuar donde se quedó la tabla
      520, // ancho máximo
      14 // lineHeight
    );
  }

  let suma3 = dataOtros.reduce(
    (acumulador, objeto) => acumulador + objeto.importe,
    0
  );
  if (suma3 > 0) {
    y += 10; // espacio entre secciones

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    y = agregarTextoConSaltos(doc, "OTROS", 40, y, 520, 14);

    y += 5; // espacio entre secciones

    autoTable(doc, {
      startY: y,
      head: [["Mes", "Importe", "Comparativa", "Diferencia"]],
      body: dataOtros.map((x) => [
        x.mes,
        formatoPesos(x.importe),
        formatoPesos(x.comparativa),
        formatoPesos(x.diferencia),
      ]),
      headStyles: {
        fillColor: "#E74747",
        textColor: "#FFF",
        fontSize: 6,
        halign: "center",
        valign: "middle",
      },
      styles: {
        fontSize: 6,
        cellPadding: 3,
      },
      columnStyles: {
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right" },
      },
      didParseCell: function (data) {
        if (data.section === "body") {
          if (data.row.index === dataOtros.length - 1) {
            data.cell.styles.fillColor = "#F7C1C1";
            data.cell.styles.textColor = [0, 0, 0];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
      didDrawPage: function (data) {
        // Pie de página
        const page = doc.internal.getNumberOfPages();
        doc.setFontSize(9);
        doc.text(`Página ${page}`, 300, doc.internal.pageSize.height - 20, {
          align: "center",
        });
      },
    });

    y = doc.lastAutoTable.finalY += 20;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    const condicionH1 =
      "Las diferencias positivas pueden ser observadas por la autoridad y requeridas su aclaración.";
    const condicionH2 =
      "Las diferencias negativas son pagos de lo indebido, las que se pueden recuperar mediante solicitud de devolución o son recibos de nómina por timbrar.";
    let condicionH3 =
      "Asi mismo el impuesto (a cargo) del mes " +
      mesAnterior(mesF).toUpperCase() +
      " se entera a más tardar el 17 de " +
      mesF;

    if (esAñoActual(anio) == false) {
      condicionH3 = "";
    }
    const valores4 = dataOtros.map((d) => d.diferencia);
    const hayPositivos4 = valores4.some((v) => v > 5);
    const hayNegativos4 = valores4.some((v) => v < -5);   

    let texto5 = "";
    if (hayPositivos4 && hayNegativos4) {
      console.log("Hay valores positivos y negativos");
      texto5 = condicionH1 + " " + condicionH2;
    } else if (hayPositivos4) {
      console.log("Solo hay valores positivos");
      texto5 = condicionH1;
    } else if (hayNegativos4) {
      console.log("Solo hay valores negativos");
      texto5 = condicionH2;
    } else {
      console.log("Solo hay ceros o la lista está vacía");
    }

    if (dia < 17) {
      console.log("Hoy es antes del día 17");
      texto5 = texto5 + " " + condicionH3;
    } else if (dia > 17) {
      console.log("Hoy es después del día 17");
    } else {
      console.log("Hoy ES el día 17");
      texto5 = texto5 + " " + condicionH3;
    }

    // ---- SELECCIONAR SOLO UNA ----
    let condicionSeleccionada5 = texto5;

    // ---- CALCULAR ESPACIO ----
    y = agregarTextoConSaltos(
      doc,
      condicionSeleccionada5,
      40, // margen izquierdo
      y, // continuar donde se quedó la tabla
      520, // ancho máximo
      14 // lineHeight
    );
  }

  let suma4 = dataHonorarios.reduce(
    (acumulador, objeto) => acumulador + objeto.importe,
    0
  );
  if (suma4 > 0) {
    y += 10; // espacio entre secciones

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    y = agregarTextoConSaltos(doc, "HONORARIOS", 40, y, 520, 14);

    y += 5; // espacio entre secciones

    autoTable(doc, {
      startY: y,
      head: [["Mes", "Importe", "Comparativa", "Diferencia"]],
      body: dataHonorarios.map((x) => [
        x.mes,
        formatoPesos(x.importe),
        formatoPesos(x.comparativa),
        formatoPesos(x.diferencia),
      ]),
      headStyles: {
        fillColor: "#E74747",
        textColor: "#FFF",
        fontSize: 6,
        halign: "center",
        valign: "middle",
      },
      styles: {
        fontSize: 6,
        cellPadding: 3,
      },
      columnStyles: {
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right" },
      },
      didParseCell: function (data) {
        if (data.section === "body") {
          if (data.row.index === dataHonorarios.length - 1) {
            data.cell.styles.fillColor = "#F7C1C1";
            data.cell.styles.textColor = [0, 0, 0];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
      didDrawPage: function (data) {
        // Pie de página
        const page = doc.internal.getNumberOfPages();
        doc.setFontSize(9);
        doc.text(`Página ${page}`, 300, doc.internal.pageSize.height - 20, {
          align: "center",
        });
      },
    });

    y = doc.lastAutoTable.finalY += 20;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    const condicionH1 =
      "Las diferencias positivas pueden ser observadas por la autoridad y requeridas su aclaración.";
    const condicionH2 =
      "Las diferencias negativas son pagos de lo indebido, las que se pueden recuperar mediante solicitud de devolución.";
    let condicionH3 =
      "Asi mismo el impuesto (a cargo) del mes " +
      mesAnterior(mesF).toUpperCase() +
      " se entera a más tardar el 17 de " +
      mesF;

    if (esAñoActual(anio) == false) {
      condicionH3 = "";
    }
    const valores4 = dataHonorarios.map((d) => d.diferencia);
    const hayPositivos4 = valores4.some((v) => v > 5);
    const hayNegativos4 = valores4.some((v) => v < -5);

    let texto5 = "";
    if (hayPositivos4 && hayNegativos4) {
      console.log("Hay valores positivos y negativos");
      texto5 = condicionH1 + " " + condicionH2;
    } else if (hayPositivos4) {
      console.log("Solo hay valores positivos");
      texto5 = condicionH1;
    } else if (hayNegativos4) {
      console.log("Solo hay valores negativos");
      texto5 = condicionH2;
    } else {
      console.log("Solo hay ceros o la lista está vacía");
    }

    if (dia < 17) {
      console.log("Hoy es antes del día 17");
      texto5 = texto5 + " " + condicionH3;
    } else if (dia > 17) {
      console.log("Hoy es después del día 17");
    } else {
      console.log("Hoy ES el día 17");
      texto5 = texto5 + " " + condicionH3;
    }

    // ---- SELECCIONAR SOLO UNA ----
    let condicionSeleccionada5 = texto5;

    // ---- CALCULAR ESPACIO ----
    y = agregarTextoConSaltos(
      doc,
      condicionSeleccionada5,
      40, // margen izquierdo
      y, // continuar donde se quedó la tabla
      520, // ancho máximo
      14 // lineHeight
    );
  }
  let suma5 = dataArrendamientos.reduce(
    (acumulador, objeto) => acumulador + objeto.importe,
    0
  );
  if (suma5 > 0) {
    y += 10; // espacio entre secciones

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    y = agregarTextoConSaltos(doc, "ARRENDAMIENTO", 40, y, 520, 14);

    y += 5; // espacio entre secciones

    autoTable(doc, {
      startY: y,
      head: [["Mes", "Importe", "Comparativa", "Diferencia"]],
      body: dataArrendamientos.map((x) => [
        x.mes,
        formatoPesos(x.importe),
        formatoPesos(x.comparativa),
        formatoPesos(x.diferencia),
      ]),
      headStyles: {
        fillColor: "#E74747",
        textColor: "#FFF",
        fontSize: 6,
        halign: "center",
        valign: "middle",
      },
      styles: {
        fontSize: 6,
        cellPadding: 3,
      },
      columnStyles: {
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right" },
      },
      didParseCell: function (data) {
        if (data.section === "body") {
          if (data.row.index === dataArrendamientos.length - 1) {
            data.cell.styles.fillColor = "#F7C1C1";
            data.cell.styles.textColor = [0, 0, 0];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
      didDrawPage: function (data) {
        // Pie de página
        const page = doc.internal.getNumberOfPages();
        doc.setFontSize(9);
        doc.text(`Página ${page}`, 300, doc.internal.pageSize.height - 20, {
          align: "center",
        });
      },
    });

    y = doc.lastAutoTable.finalY += 20;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    const condicionAR1 =
      "Las diferencias positivas pueden ser observadas por la autoridad y requeridas su aclaración.";
    const condicionAR2 =
      "Las diferencias negativas son pagos de lo indebido, las que se pueden recuperar mediante solicitud de devolución.";
    let condicionAR3 =
      "Asi mismo el impuesto (a cargo) del mes " +
      mesAnterior(mesF).toUpperCase() +
      " se entera a más tardar el 17 de " +
      mesF;

    if (esAñoActual(anio) == false) {
      condicionAR3 = "";
    }
    const valores5 = dataArrendamientos.map((d) => d.diferencia);
    const hayPositivos5 = valores5.some((v) => v > 5);
    const hayNegativos5 = valores5.some((v) => v < -5);

    let texto6 = "";
    if (hayPositivos5 && hayNegativos5) {
      console.log("Hay valores positivos y negativos");
      texto6 = condicionAR1 + " " + condicionAR2;
    } else if (hayPositivos5) {
      console.log("Solo hay valores positivos");
      texto6 = condicionAR1;
    } else if (hayNegativos5) {
      console.log("Solo hay valores negativos");
      texto6 = condicionAR2;
    } else {
      console.log("Solo hay ceros o la lista está vacía");
    }

    if (dia < 17) {
      console.log("Hoy es antes del día 17");
      texto6 = texto6 + " " + condicionAR3;
    } else if (dia > 17) {
      console.log("Hoy es después del día 17");
    } else {
      console.log("Hoy ES el día 17");
      texto6 = texto6 + " " + condicionAR3;
    }

    // ---- SELECCIONAR SOLO UNA ----
    let condicionSeleccionada6 = texto6;

    // ---- CALCULAR ESPACIO ----
    y = agregarTextoConSaltos(
      doc,
      condicionSeleccionada6,
      40, // margen izquierdo
      y, // continuar donde se quedó la tabla
      520, // ancho máximo
      14 // lineHeight
    );
  }

  y += 10; // espacio entre secciones

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  y = agregarTextoConSaltos(doc, "PAGOS PROVISIONALES DE ISR", 40, y, 520, 14);

  y += 5; // espacio entre secciones

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  y = agregarTextoConSaltos(
    doc,
    "En la determinación de los Pagos Provisionales de ISR, el sistema compara lo que determina con base en comprobantes y lo que se declara ante el SAT, encontrando las siguientes diferencias:",
    40,
    y,
    520,
    14
  ); 

  y += 10; // espacio entre secciones

  // Construir el encabezado dinámico
  const head = [columnas.map((c) => c.label)];

  const body = provisionalesISR.map((row) =>
    columnas.map((c) => {
      let value = row[c.field];
      // Si es número, aplicamos formato pesos
      if (typeof value === "number") {
        return formatoPesos(value);
      }
      return value ?? "";
    })
  );

  // ColumnStyles dinámico SOLO para campos que van a la derecha
  let columnStyles = {};
  columnas.forEach((c, idx) => {
    if (c.align === "right") {
      columnStyles[idx] = { halign: "right" };
    }
  });

  // Crear la tabla
  autoTable(doc, {
    startY: y,
    head:head,
    body: body,
    headStyles: {
      fillColor: "#E74747",
      textColor: "#FFF",
      fontSize: 6,
      halign: "center",
      valign: "middle",
    },
    styles: {
      fontSize: 6,
      cellPadding: 3,
    },
    columnStyles: columnStyles,
    didParseCell: function (data) {
      if (data.section === "body") {
        if (data.row.index === body.length - 1) {
          data.cell.styles.fillColor = "#F7C1C1";
          data.cell.styles.textColor = [0, 0, 0];
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
    didDrawPage: function (data) {
      const page = doc.internal.getNumberOfPages();
      doc.setFontSize(9);
      doc.text(`Página ${page}`, 300, doc.internal.pageSize.height - 20, {
        align: "center",
      });
    },
  });

  y = doc.lastAutoTable.finalY + 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const condicioni1 =
    "Las diferencias positivas y negativas podran ser requeridas por la autoridad y se deben a una determinación incorrecta del pago provisional, se reflejarán en el impuesto anual como un financiamiento a cargo o una disminución de impuesto a pagar";
  let condicioni2 =
    "Asi mismo el impuesto (a cargo) del mes " +
    mesAnterior(mesF).toUpperCase() +
    " se entera a más tardar el 17 de " +
    mesF;

  if (esAñoActual(anio) == false) {
    condicioni2 = "";
  }
  let texto7 = "";
  if (dia < 17) {
    texto7 = condicioni1 + " " + condicioni2;
  } else if (dia > 17) {
    texto7 = condicioni1;
  } else {
    console.log("Hoy ES el día 17");
    texto7 = condicioni1 + " " + condicioni2;
  }

  // ---- SELECCIONAR SOLO UNA ----
  let condicionSeleccionada7 = texto7;

  // ---- CALCULAR ESPACIO ----
  y = agregarTextoConSaltos(
    doc,
    condicionSeleccionada7,
    40, // margen izquierdo
    y, // continuar donde se quedó la tabla
    520, // ancho máximo
    14 // lineHeight
  );

  y += 10; // espacio entre secciones

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  y = agregarTextoConSaltos(doc, "USO DEL CFDI", 40, y, 520, 14);

  y += 5; // espacio entre secciones

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  y = agregarTextoConSaltos(
    doc,
    "Mostramos la comparativa de los ingresos con base en los comprobantes emitidos contra las compras y gastos de los comprobantes recibidos y emitidos de nómina, con la finalidad de observar el comportamiento de la empresa:",
    40,
    y,
    520,
    14
  );
  y += 5; // espacio entre secciones

  autoTable(doc, {
    startY: y,
    head: [["Uso del CFDI", "Emitidos", "Recibidos", "Nómina", "Diferencia"]],
    body: itemsReporteUso.map((x) => [
      x.uso,
      formatoPesos(x.emitidos),
      formatoPesos(x.recibidos),
      formatoPesos(x.nomina),
      formatoPesos(x.emitidos - x.recibidos - x.nomina),
    ]),
    headStyles: {
      fillColor: "#E74747",
      textColor: "#FFF",
      fontSize: 6,
      halign: "center",
      valign: "middle",
    },
    styles: {
      fontSize: 6,
      cellPadding: 3,
    },
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "right" },
      3: { halign: "right" },
      4: { halign: "right" },
    },
    didParseCell: function (data) {
      if (data.section === "body") {
        if (data.row.index === itemsReporteUso.length - 1) {
          data.cell.styles.fillColor = "#F7C1C1";
          data.cell.styles.textColor = [0, 0, 0];
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
    didDrawPage: function (data) {
      // Pie de página
      const page = doc.internal.getNumberOfPages();
      doc.setFontSize(9);
      doc.text(`Página ${page}`, 300, doc.internal.pageSize.height - 20, {
        align: "center",
      });
    },
  });

  y = doc.lastAutoTable.finalY + 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  let num = itemsReporteUso.length - 1;
  let cant =
    itemsReporteUso[num].emitidos -
    itemsReporteUso[num].recibidos -
    itemsReporteUso[num].nomina;

  const condicioniC1 =
    "Se observa una diferencia positiva en cantidad de " +
    formatoPesos(cant) +
    " que puede representar una utilidad.";
  const condicioniC2 =
    "Se observa una diferencia negativa en cantidad de " +
    formatoPesos(cant) +
    " que puede representar un financiamiento de proveedores o acredores.";

  let texto8 = "";
  if (cant > 0) {
    texto8 = condicioniC1;
  } else {
    texto8 = condicioniC2;
  }
  // ---- SELECCIONAR SOLO UNA ----
  let condicionSeleccionada8 = texto8;

  // ---- CALCULAR ESPACIO ----
  y = agregarTextoConSaltos(
    doc,
    condicionSeleccionada8,
    40, // margen izquierdo
    y, // continuar donde se quedó la tabla
    520, // ancho máximo
    14 // lineHeight
  );

  if(esAñoActual(anio)== false){
    y += 20;

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    y = agregarTextoConSaltos(doc, "DECLARACIÓN ANUAL", 40, y, 520, 14);
  
    y += 5; // espacio entre secciones
  
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    y = agregarTextoConSaltos(
      doc,
      "Se muestra la comparativa entre lo determinado y lo declarado anualmente",
      40,
      y,
      520,
      14
    );
    y += 5; // espacio entre secciones
  
    autoTable(doc, {
      startY: y,
      head: [["DECLARACION ANUAL", "DETERMINADO", "DECLARADO", "DIFERENCIA"]],
      body: dataAnual.map((x) => [
        x.columna1,
        formatoPesos(x.columna2),
        formatoPesos(x.columna3),
        formatoPesos(x.columna2 - x.columna3),
      ]),
      headStyles: {
        fillColor: "#E74747",
        textColor: "#FFF",
        fontSize: 6,
        halign: "center",
        valign: "middle",
      },
      styles: {
        fontSize: 6,
        cellPadding: 3,
      },
      columnStyles: {
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
      },
      
      didDrawPage: function (data) {
        // Pie de página
        const page = doc.internal.getNumberOfPages();
        doc.setFontSize(9);
        doc.text(`Página ${page}`, 300, doc.internal.pageSize.height - 20, {
          align: "center",
        });
      },
    });
    y = doc.lastAutoTable.finalY + 20;

  }else{
    y += 20; // espacio entre secciones

  }

if(comentarios.trim() != ''){
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  y = agregarTextoConSaltos(doc, "COMENTARIOS", 40, y, 520, 14);

  y += 5; // espacio entre secciones

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  y = agregarTextoConSaltos(
    doc,
    comentarios,
    40,
    y,
    520,
    14
  );

  y += 20;
}

  if (dataVentas.length != 0) {

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    y = agregarTextoConSaltos(doc, "VENTAS DE GASOLINA", 40, y, 520, 14);

    y += 5; // espacio entre secciones

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    y = agregarTextoConSaltos(
      doc,
      "Las ventas mensuales por producto son las siguientes:",
      40,
      y,
      520,
      14
    );
    y += 5; // espacio entre secciones

    const itemsMes = [
      { label: "ENERO" },
      { label: "FEBRERO" },
      { label: "MARZO" },
      { label: "ABRIL" },
      { label: "MAYO" },
      { label: "JUNIO" },
      { label: "JULIO" },
      { label: "AGOSTO" },
      { label: "SEPTIEMBRE" },
      { label: "OCTUBRE" },
      { label: "NOVIEMBRE" },
      { label: "DICIEMBRE" },
    ];

    for (let i = 0; i < dataVentas.length; i++) {
      const nombreMes = itemsMes[i].label;
      const ventasMes = dataVentas[i];
      y += 5; // espacio entre secciones

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      y = agregarTextoConSaltos(doc, "VENTAS DE " + nombreMes, 40, y, 520, 14);

      autoTable(doc, {
        startY: y,
        head: [
          [
            "Producto",
            "Cantidad",
            "subTotal",
            "IVA",
            "IEPS",
            "Total",
            "# Ventas",
            "# Comprobantes",
          ],
        ],
        body: ventasMes.map((x) => [
          x.producto,
          FormatoCantidad(x.cantidad),
          formatoPesos(x.subTotal),
          formatoPesos(x.iva),
          formatoPesos(x.ieps),
          formatoPesos(x.ieps),
          FormatoCantidad(x.ventas),
          FormatoCantidad(x.comprobantes),
        ]),
        headStyles: {
          fillColor: "#E74747",
          textColor: "#FFF",
          fontSize: 6,
          halign: "center",
          valign: "middle",
        },
        styles: {
          fontSize: 6,
          cellPadding: 3,
        },
        columnStyles: {
          1: { halign: "right" },
          2: { halign: "right" },
          3: { halign: "right" },
          4: { halign: "right" },
          5: { halign: "right" },
          6: { halign: "right" },
          7: { halign: "right" },
          8: { halign: "right" },
        },
        didParseCell: function (data) {
          if (data.section === "body") {
            if (data.row.index === ventasMes.length - 1) {
              data.cell.styles.fillColor = "#F7C1C1";
              data.cell.styles.textColor = [0, 0, 0];
              data.cell.styles.fontStyle = "bold";
            }
          }
        },
        didDrawPage: function (data) {
          // Pie de página
          const page = doc.internal.getNumberOfPages();
          doc.setFontSize(9);
          doc.text(`Página ${page}`, 300, doc.internal.pageSize.height - 20, {
            align: "center",
          });
        },
      });

      y = doc.lastAutoTable.finalY + 10;
    }
  }

  if (dataCompras.length != 0) {
    y += 10; // espacio entre secciones

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    y = agregarTextoConSaltos(doc, "COMPRAS DE GASOLINA", 40, y, 520, 14);

    y += 5; // espacio entre secciones

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    y = agregarTextoConSaltos(
      doc,
      "Las compras mensuales por producto son las siguientes:",
      40,
      y,
      520,
      14
    );
    y += 5; // espacio entre secciones

    const itemsMes = [
      { label: "ENERO" },
      { label: "FEBRERO" },
      { label: "MARZO" },
      { label: "ABRIL" },
      { label: "MAYO" },
      { label: "JUNIO" },
      { label: "JULIO" },
      { label: "AGOSTO" },
      { label: "SEPTIEMBRE" },
      { label: "OCTUBRE" },
      { label: "NOVIEMBRE" },
      { label: "DICIEMBRE" },
    ];

    for (let i = 0; i < dataCompras.length; i++) {
      const nombreMes = itemsMes[i].label;
      const comprasMes = dataCompras[i];

      y += 5; // espacio entre secciones

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      y = agregarTextoConSaltos(doc, "COMPRAS DE " + nombreMes, 40, y, 520, 14);

      autoTable(doc, {
        startY: y,
        head: [
          [
            "Producto",
            "Cantidad",
            "subTotal",
            "IVA",
            "IEPS",
            "Total",
            "# Compras",
            "# Comprobantes",
          ],
        ],
        body: comprasMes.map((x) => [
          x.producto,
          FormatoCantidad(x.cantidad),
          formatoPesos(x.subTotal),
          formatoPesos(x.iva),
          formatoPesos(x.ieps),
          formatoPesos(x.ieps),
          FormatoCantidad(x.ventas),
          FormatoCantidad(x.comprobantes),
        ]),
        headStyles: {
          fillColor: "#E74747",
          textColor: "#FFF",
          fontSize: 6,
          halign: "center",
          valign: "middle",
        },
        styles: {
          fontSize: 6,
          cellPadding: 3,
        },
        columnStyles: {
          1: { halign: "right" },
          2: { halign: "right" },
          3: { halign: "right" },
          4: { halign: "right" },
          5: { halign: "right" },
          6: { halign: "right" },
          7: { halign: "right" },
          8: { halign: "right" },
        },
        didParseCell: function (data) {
          if (data.section === "body") {
            if (data.row.index === comprasMes.length - 1) {
              data.cell.styles.fillColor = "#F7C1C1";
              data.cell.styles.textColor = [0, 0, 0];
              data.cell.styles.fontStyle = "bold";
            }
          }
        },
        didDrawPage: function (data) {
          // Pie de página
          const page = doc.internal.getNumberOfPages();
          doc.setFontSize(9);
          doc.text(`Página ${page}`, 300, doc.internal.pageSize.height - 20, {
            align: "center",
          });
        },
      });

      y = doc.lastAutoTable.finalY + 10;
    }
  }

  if (dataMagna.length != 0) {
    y = doc.lastAutoTable.finalY + 20;

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    y = agregarTextoConSaltos(doc, "INVENTARIOS", 40, y, 520, 14);

    y += 5; // espacio entre secciones

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    y = agregarTextoConSaltos(
      doc,
      "La comparativa entre los inventarios es la siguiente:",
      40,
      y,
      520,
      14
    );
    y += 5; // espacio entre secciones

    y += 5; // espacio entre secciones
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    y = agregarTextoConSaltos(doc, "MAGNA", 40, y, 520, 14);
    y += 5; // espacio entre secciones

    console.log(dataMagna);
    autoTable(doc, {
      startY: y,
      head: [
        [
          "MES",
          "Inventario Inicial",
          "Litros Comprados",
          "Litros Disponibles",
          "Litros Vendidos",
          "Mermas",
          "Inventario Teorico",
          "Registrado",
          "Diferencia",
        ],
      ],
      body: dataMagna.map((x) => [
        x.nombreMes,
        FormatoCantidad(x.inventarioInicial),
        FormatoCantidad(x.litrosComprados),
        FormatoCantidad(x.litrosDisponibles),
        FormatoCantidad(x.litrosVendidos),
        FormatoCantidad(x.mermas),
        FormatoCantidad(x.inventarioTeorico),
        FormatoCantidad(x.registrado),
        FormatoCantidad(x.diferencia),
      ]),
      headStyles: {
        fillColor: "#E74747",
        textColor: "#FFF",
        fontSize: 6,
        halign: "center",
        valign: "middle",
      },
      styles: {
        fontSize: 6,
        cellPadding: 3,
      },
      columnStyles: {
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "right" },
        6: { halign: "right" },
        7: { halign: "right" },
        8: { halign: "right" },
      },
      didParseCell: function (data) {
        if (data.section === "body") {
          if (data.row.index === dataMagna.length - 1) {
            data.cell.styles.fillColor = "#F7C1C1";
            data.cell.styles.textColor = [0, 0, 0];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
      didDrawPage: function (data) {
        // Pie de página
        const page = doc.internal.getNumberOfPages();
        doc.setFontSize(9);
        doc.text(`Página ${page}`, 300, doc.internal.pageSize.height - 20, {
          align: "center",
        });
      },
    });
  }

  if (dataPremium.length != 0) {
    y = doc.lastAutoTable.finalY + 20;

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    y = agregarTextoConSaltos(doc, "PREMIUM", 40, y, 520, 14);
    y += 5; // espacio entre secciones

    autoTable(doc, {
      startY: y,
      head: [
        [
          "MES",
          "Inventario Inicial",
          "Litros Comprados",
          "Litros Disponibles",
          "Litros Vendidos",
          "Mermas",
          "Inventario Teorico",
          "Registrado",
          "Diferencia",
        ],
      ],
      body: dataPremium.map((x) => [
        x.nombreMes,
        FormatoCantidad(x.inventarioInicial),
        FormatoCantidad(x.litrosComprados),
        FormatoCantidad(x.litrosDisponibles),
        FormatoCantidad(x.litrosVendidos),
        FormatoCantidad(x.mermas),
        FormatoCantidad(x.inventarioTeorico),
        FormatoCantidad(x.registrado),
        FormatoCantidad(x.diferencia),
      ]),
      headStyles: {
        fillColor: "#E74747",
        textColor: "#FFF",
        fontSize: 6,
        halign: "center",
        valign: "middle",
      },
      styles: {
        fontSize: 6,
        cellPadding: 3,
      },
      columnStyles: {
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "right" },
        6: { halign: "right" },
        7: { halign: "right" },
        8: { halign: "right" },
      },
      didParseCell: function (data) {
        if (data.section === "body") {
          if (data.row.index === dataPremium.length - 1) {
            data.cell.styles.fillColor = "#F7C1C1";
            data.cell.styles.textColor = [0, 0, 0];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
      didDrawPage: function (data) {
        // Pie de página
        const page = doc.internal.getNumberOfPages();
        doc.setFontSize(9);
        doc.text(`Página ${page}`, 300, doc.internal.pageSize.height - 20, {
          align: "center",
        });
      },
    });
  }

  if (dataDiesel.length != 0) {
    y = doc.lastAutoTable.finalY + 20;

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    y = agregarTextoConSaltos(doc, "DIESEL", 40, y, 520, 14);
    y += 5; // espacio entre secciones

    autoTable(doc, {
      startY: y,
      head: [
        [
          "MES",
          "Inventario Inicial",
          "Litros Comprados",
          "Litros Disponibles",
          "Litros Vendidos",
          "Mermas",
          "Inventario Teorico",
          "Registrado",
          "Diferencia",
        ],
      ],
      body: dataDiesel.map((x) => [
        x.nombreMes,
        FormatoCantidad(x.inventarioInicial),
        FormatoCantidad(x.litrosComprados),
        FormatoCantidad(x.litrosDisponibles),
        FormatoCantidad(x.litrosVendidos),
        FormatoCantidad(x.mermas),
        FormatoCantidad(x.inventarioTeorico),
        FormatoCantidad(x.registrado),
        FormatoCantidad(x.diferencia),
      ]),
      headStyles: {
        fillColor: "#E74747",
        textColor: "#FFF",
        fontSize: 6,
        halign: "center",
        valign: "middle",
      },
      styles: {
        fontSize: 6,
        cellPadding: 3,
      },
      columnStyles: {
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "right" },
        6: { halign: "right" },
        7: { halign: "right" },
        8: { halign: "right" },
      },
      didParseCell: function (data) {
        if (data.section === "body") {
          if (data.row.index === dataDiesel.length - 1) {
            data.cell.styles.fillColor = "#F7C1C1";
            data.cell.styles.textColor = [0, 0, 0];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
      didDrawPage: function (data) {
        // Pie de página
        const page = doc.internal.getNumberOfPages();
        doc.setFontSize(9);
        doc.text(`Página ${page}`, 300, doc.internal.pageSize.height - 20, {
          align: "center",
        });
      },
    });
  }

  if (dataMagnaU.length != 0) {
    y = doc.lastAutoTable.finalY + 20;

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    y = agregarTextoConSaltos(doc, "UTILIDAD", 40, y, 520, 14);

    y += 5; // espacio entre secciones

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    y = agregarTextoConSaltos(
      doc,
      "El sistema determina la utilidad por producto, cocnforme a los comprobantes fiscales:",
      40,
      y,
      520,
      14
    );
    y += 5; // espacio entre secciones

    y += 5; // espacio entre secciones
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    y = agregarTextoConSaltos(doc, "MAGNA", 40, y, 520, 14);
    y += 5; // espacio entre secciones

    autoTable(doc, {
      startY: y,
      head: [
        [
          "MES",
          "Litros Vendidos ",
          "SuTotal Ventas",
          "Promedio Ventas",
          "Litros Compras",
          "SuTotal Compras",
          "Promedio Compras",
          "Porcentaje de Utilidad",
          "Utilidad Estimada del Periodo",
        ],
      ],
      body: dataMagnaU.map((x) => [
        x.nombreMes,
        FormatoCantidad(x.litrosVentas),
        formatoPesos(x.subTotalVentas),
        formatoPesos(x.promedioVentas || 0),
        FormatoCantidad(x.litrosCompras),
        formatoPesos(x.subTotalCompras),
        formatoPesos(x.promedioCompras || 0),
        FormatoPorcentaje(x.porcentajeUtilidad),
        formatoPesos(x.utilidadPeriodo),
        // formatoPesos(x.subTotalCompras),
        // formatoPesos(x.promedioCompras),
        // FormatoPorcentaje(x.porcentajeUtilidad),
        // formatoPesos(x.utilidadPeriodo),
      ]),
      headStyles: {
        fillColor: "#E74747",
        textColor: "#FFF",
        fontSize: 6,
        halign: "center",
        valign: "middle",
      },
      styles: {
        fontSize: 6,
        cellPadding: 3,
      },
      columnStyles: {
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "right" },
        6: { halign: "right" },
        7: { halign: "right" },
        8: { halign: "right" },
      },
      didParseCell: function (data) {
        if (data.section === "body") {
          if (data.row.index === dataMagnaU.length - 1) {
            data.cell.styles.fillColor = "#F7C1C1";
            data.cell.styles.textColor = [0, 0, 0];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
      didDrawPage: function (data) {
        // Pie de página
        const page = doc.internal.getNumberOfPages();
        doc.setFontSize(9);
        doc.text(`Página ${page}`, 300, doc.internal.pageSize.height - 20, {
          align: "center",
        });
      },
    });
  }

  if (dataPremiumU.length != 0) {
    y = doc.lastAutoTable.finalY + 20;

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    y = agregarTextoConSaltos(doc, "PREMIUM", 40, y, 520, 14);
    y += 5; // espacio entre secciones

    autoTable(doc, {
      startY: y,
      head: [
        [
          "MES",
          "Litros Vendidos ",
          "SuTotal Ventas",
          "Promedio Ventas",
          "Litros Compras",
          "SuTotal Compras",
          "Promedio Compras",
          "Porcentaje de Utilidad",
          "Utilidad Estimada del Periodo",
        ],
      ],
      body: dataPremiumU.map((x) => [
        x.nombreMes,
        FormatoCantidad(x.litrosVentas),
        formatoPesos(x.subTotalVentas),
        formatoPesos(x.promedioVentas || 0),
        FormatoCantidad(x.litrosCompras),
        formatoPesos(x.subTotalCompras),
        formatoPesos(x.promedioCompras || 0),
        FormatoPorcentaje(x.porcentajeUtilidad),
        formatoPesos(x.utilidadPeriodo),
        // formatoPesos(x.subTotalCompras),
        // formatoPesos(x.promedioCompras),
        // FormatoPorcentaje(x.porcentajeUtilidad),
        // formatoPesos(x.utilidadPeriodo),
      ]),
      headStyles: {
        fillColor: "#E74747",
        textColor: "#FFF",
        fontSize: 6,
        halign: "center",
        valign: "middle",
      },
      styles: {
        fontSize: 6,
        cellPadding: 3,
      },
      columnStyles: {
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "right" },
        6: { halign: "right" },
        7: { halign: "right" },
        8: { halign: "right" },
      },
      didParseCell: function (data) {
        if (data.section === "body") {
          if (data.row.index === dataPremiumU.length - 1) {
            data.cell.styles.fillColor = "#F7C1C1";
            data.cell.styles.textColor = [0, 0, 0];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
      didDrawPage: function (data) {
        // Pie de página
        const page = doc.internal.getNumberOfPages();
        doc.setFontSize(9);
        doc.text(`Página ${page}`, 300, doc.internal.pageSize.height - 20, {
          align: "center",
        });
      },
    });
  }

  if (dataDieselU.length != 0) {
    y = doc.lastAutoTable.finalY + 20;

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    y = agregarTextoConSaltos(doc, "DIESEL", 40, y, 520, 14);
    y += 5; // espacio entre secciones

    autoTable(doc, {
      startY: y,
      head: [
        [
          "MES",
          "Litros Vendidos ",
          "SuTotal Ventas",
          "Promedio Ventas",
          "Litros Compras",
          "SuTotal Compras",
          "Promedio Compras",
          "Porcentaje de Utilidad",
          "Utilidad Estimada del Periodo",
        ],
      ],
      body: dataDieselU.map((x) => [
        x.nombreMes,
        FormatoCantidad(x.litrosVentas),
        formatoPesos(x.subTotalVentas),
        formatoPesos(x.promedioVentas || 0),
        FormatoCantidad(x.litrosCompras),
        formatoPesos(x.subTotalCompras),
        formatoPesos(!x.promedioCompras || 0),
        FormatoPorcentaje(x.porcentajeUtilidad),
        formatoPesos(x.utilidadPeriodo),
        // formatoPesos(x.subTotalCompras),
        // formatoPesos(x.promedioCompras),
        // FormatoPorcentaje(x.porcentajeUtilidad),
        // formatoPesos(x.utilidadPeriodo),
      ]),
      headStyles: {
        fillColor: "#E74747",
        textColor: "#FFF",
        fontSize: 6,
        halign: "center",
        valign: "middle",
      },
      styles: {
        fontSize: 6,
        cellPadding: 3,
      },
      columnStyles: {
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "right" },
        6: { halign: "right" },
        7: { halign: "right" },
        8: { halign: "right" },
      },
      didParseCell: function (data) {
        if (data.section === "body") {
          if (data.row.index === dataDieselU.length - 1) {
            data.cell.styles.fillColor = "#F7C1C1";
            data.cell.styles.textColor = [0, 0, 0];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
      didDrawPage: function (data) {
        // Pie de página
        const page = doc.internal.getNumberOfPages();
        doc.setFontSize(9);
        doc.text(`Página ${page}`, 300, doc.internal.pageSize.height - 20, {
          align: "center",
        });
      },
    });

  y = doc.lastAutoTable.finalY + 20;

  }


  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  y = agregarTextoConSaltos(doc, "RIESGO FISCAL", 40, y, 520, 14);
  y += 5; // espacio entre secciones

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  y = agregarTextoConSaltos(
    doc,
    "A continuación se relacionan los comprobantes que no cumplan con el anexo 20 de la RMF por lo que puede la autoridad rechazarlos.",
    40,
    y,
    520,
    14
  );

  for (let tab of datosRiesgoFiscal) {
    if (tab.datos.length != 0) {
      if (
        tab.titulo ==
        "CONCENTRADO - RIESGO CONCEPTOS CON CLAVE 01010101 EMTIDOS"
      ) {
        y += 5; // espacio entre secciones

        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        y = agregarTextoConSaltos(doc, tab.titulo, 40, y, 520, 14);

        y += 5; // espacio entre secciones

        autoTable(doc, {
          startY: y,
          head: [["RFC", "Nombre", "SubTotal"]],
          body: tab.datos.map((x) => [
            x.rfc,
            x.nombre,
            formatoPesos(x.subTotal),
          ]),
          headStyles: {
            fillColor: "#E74747",
            textColor: "#FFF",
            fontSize: 6,
            halign: "center",
            valign: "middle",
          },
          styles: {
            fontSize: 6,
            cellPadding: 3,
          },
          columnStyles: {
            2: { halign: "right" },
          },
          didParseCell: function (data) {
            if (data.section === "body") {
              if (data.row.index === tab.datos.length - 1) {
                data.cell.styles.fillColor = "#F7C1C1";
                data.cell.styles.textColor = [0, 0, 0];
                data.cell.styles.fontStyle = "bold";
              }
            }
          },

          didDrawPage: function (data) {
            // Pie de página
            const page = doc.internal.getNumberOfPages();
            doc.setFontSize(9);
            doc.text(`Página ${page}`, 300, doc.internal.pageSize.height - 20, {
              align: "center",
            });
          },
        });

        y = doc.lastAutoTable.finalY + 10;
      } else if (
        tab.titulo ==
        "CONCENTRADO - RIESGO CONCEPTOS CON CLAVE 01010101 RECIBIDOS"
      ) {
        y += 5; // espacio entre secciones

        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        y = agregarTextoConSaltos(doc, tab.titulo, 40, y, 520, 14);

        y += 5; // espacio entre secciones

        autoTable(doc, {
          startY: y,
          head: [["RFC", "Nombre", "SubTotal"]],
          body: tab.datos.map((x) => [
            x.rfc,
            x.nombre,
            formatoPesos(x.subTotal),
          ]),
          headStyles: {
            fillColor: "#E74747",
            textColor: "#FFF",
            fontSize: 6,
            halign: "center",
            valign: "middle",
          },
          styles: {
            fontSize: 6,
            cellPadding: 3,
          },
          columnStyles: {
            2: { halign: "right" },
          },
          didParseCell: function (data) {
            if (data.section === "body") {
              if (data.row.index === tab.datos.length - 1) {
                data.cell.styles.fillColor = "#F7C1C1";
                data.cell.styles.textColor = [0, 0, 0];
                data.cell.styles.fontStyle = "bold";
              }
            }
          },

          didDrawPage: function (data) {
            // Pie de página
            const page = doc.internal.getNumberOfPages();
            doc.setFontSize(9);
            doc.text(`Página ${page}`, 300, doc.internal.pageSize.height - 20, {
              align: "center",
            });
          },
        });

        y = doc.lastAutoTable.finalY + 10;
      }
    else {
      y += 5; // espacio entre secciones

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      y = agregarTextoConSaltos(doc, tab.titulo, 40, y, 520, 14);

      y += 5; // espacio entre secciones

      autoTable(doc, {
        startY: y,
        head: [
          [
            "RFC",
            "Nombre",
            "SubTotal",
            "Total Impuesto Transladados",
            "Total Impuesto Retenidos",
            "Total",
          ],
        ],
        body: tab.datos.map((x) => [
          x.rfc,
          x.nombre,
          formatoPesos(x.subTotal),
          formatoPesos(x.totalImpuestosTransladados),
          formatoPesos(x.totalImpuestosRetenidos),
          formatoPesos(x.total),
        ]),
        headStyles: {
          fillColor: "#E74747",
          textColor: "#FFF",
          fontSize: 6,
          halign: "center",
          valign: "middle",
        },
        styles: {
          fontSize: 6,
          cellPadding: 3,
        },
        columnStyles: {
          2: { halign: "right" },
          3: { halign: "right" },
          4: { halign: "right" },
          5: { halign: "right" },
        },
        didParseCell: function (data) {
          if (data.section === "body") {
            if (data.row.index === tab.datos.length - 1) {
              data.cell.styles.fillColor = "#F7C1C1";
              data.cell.styles.textColor = [0, 0, 0];
              data.cell.styles.fontStyle = "bold";
            }
          }
        },

        didDrawPage: function (data) {
          // Pie de página
          const page = doc.internal.getNumberOfPages();
          doc.setFontSize(9);
          doc.text(`Página ${page}`, 300, doc.internal.pageSize.height - 20, {
            align: "center",
          });
        },
      });

      y = doc.lastAutoTable.finalY + 10;
    }
  }
  }

  for (let tab of datosRiesgoFiscalPagos) {
    if (tab.datos.length != 0) {
      y += 10; // espacio entre secciones

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      y = agregarTextoConSaltos(doc, tab.titulo, 40, y, 520, 14);

      y += 5; // espacio entre secciones

      autoTable(doc, {
        startY: y,
        head: [["RFC", "Nombre", "Importe Pagado"]],
        body: tab.datos.map((x) => [
          x.rfc,
          x.nombre,
          formatoPesos(x.impPagado),
        ]),
        headStyles: {
          fillColor: "#E74747",
          textColor: "#FFF",
          fontSize: 6,
          halign: "center",
          valign: "middle",
        },
        styles: {
          fontSize: 6,
          cellPadding: 3,
        },
        columnStyles: {
          2: { halign: "right" },
        },
        didParseCell: function (data) {
          if (data.section === "body") {
            if (data.row.index === tab.datos.length - 1) {
              data.cell.styles.fillColor = "#F7C1C1";
              data.cell.styles.textColor = [0, 0, 0];
              data.cell.styles.fontStyle = "bold";
            }
          }
        },
        didDrawPage: function (data) {
          // Pie de página
          const page = doc.internal.getNumberOfPages();
          doc.setFontSize(9);
          doc.text(`Página ${page}`, 300, doc.internal.pageSize.height - 20, {
            align: "center",
          });
        },
      });

      y = doc.lastAutoTable.finalY + 10;
    }
  }

  y = doc.lastAutoTable.finalY + 40;

  // Texto centrado: "Atentamente"
  doc.setFontSize(10);
  doc.text("Atentamente", doc.internal.pageSize.width / 2, y, {
    align: "center",
  });

  // Espacio para la firma
  y += 25; // espacio en blanco
  doc.text(
    "______________________________",
    doc.internal.pageSize.width / 2,
    y,
    { align: "center" }
  );
console.log(usuario)
  // Nombre y puesto
  if(usuario.toLowerCase() == 'admin')
    {
  y += 12;
  doc.text("OSCAR JESUS LUENGAS SOLANO", doc.internal.pageSize.width / 2, y, {
    align: "center",
  });

  y += 10;
  doc.text("DIRECTOR LAUDEM AVE", doc.internal.pageSize.width / 2, y, {
    align: "center",
  });
}

if(usuario.toLowerCase() != 'admin')
  {
y += 12;
doc.text("ALIANZAS ESTRATÉGICAS", doc.internal.pageSize.width / 2, y, {
  align: "center",
});
y += 10;
doc.text("LAUDEM AVE", doc.internal.pageSize.width / 2, y, {
  align: "center",
});
}


  // DESCARGAR PDF
  doc.save('REPORTE - ' + empresa + ' ' + anio + ' - ' + mesI + ' - ' + mesF + '.pdf');
}
