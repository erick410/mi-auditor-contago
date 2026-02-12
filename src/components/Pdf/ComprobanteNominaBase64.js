import {
  formatoCantidad,
  formatoCantidadDos,
  formatoCantidaCero,
  formatoMilesConDosDecimales,
  formatoMilesConSeisDecimales,
  formatoFechaSinHora,
  formatoImpuestos,
  formatoNumerico,
  formtaoFecha,
} from "./FuncionesFormatos.js";
import jsPDF from "jspdf";

const ComprobanteNominaBase64 = async (
  ObjComprobante,
  ObjTipoComprobante,
  ObjEstatus,
  ObjColor,
  ObjQr,
  ObjLogo
) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new jsPDF();

      //CABECERA
      let xCabecera = 10;
      let yCabecera = 15;

      //AGREGAMOS LA MARCA DE AGUA SI LA FACTURA ESTA CANCELADA
      const rutaImagen = require("../../assets/cancelado.png");
      if (ObjEstatus.includes("Cancelado")) {
        const watermarkImage = "BASE64_ENCODED_IMAGE_OR_IMAGE_URL";
        const opacity = 0.5;
        const angle = 0;

        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: 0.2 }));
        doc.addImage(rutaImagen, "PNG", 25, 15, 150, 150, "", "FAST", angle);
        doc.restoreGraphicsState();
      }

      //AGREGAMOS EL LOGO
      if (ObjLogo) {
        if (ObjLogo != "") {
          doc.addImage(ObjLogo, "PNG", 10, 10, 65, 25);
        }
      }

      //DATOS DE LA EMPRESA
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(
        ObjTipoComprobante +
        " " +
        ObjComprobante.serie +
        " " +
        ObjComprobante.folio,
        200,
        yCabecera,
        { align: "right" }
      );
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(ObjComprobante.emisor.nombre, 200, (yCabecera += 5), {
        align: "right",
      });
      doc.text(ObjComprobante.emisor.rfc, 200, (yCabecera += 5), {
        align: "right",
      });
      doc.setFontSize(9);
      doc.text(
        ObjComprobante.emisor.regimenFiscal.regimenFiscal,
        200,
        (yCabecera += 5),
        { align: "right" }
      );

      //DATOS DEL TRABAJADOR
      yCabecera += 6;
      let ObjTrabajador = { ...ObjComprobante.nomina.receptor };
      let xTrabajadore = 10;
      let yTrabajador = yCabecera;
      let width = 115;
      let height = 5;
      let cornerRadius = 2;
      let tipoRegimen = doc.splitTextToSize(
        ObjTrabajador.tipoRegimen.tipoRegimen,
        80
      );
      let tipoRegimenHeight = doc.getTextDimensions(tipoRegimen).h;

      doc.setFillColor(ObjColor);
      doc.setDrawColor(ObjColor);
      doc.roundedRect(
        xTrabajadore,
        yTrabajador,
        width,
        height,
        cornerRadius,
        cornerRadius,
        "FD"
      );
      //NOMBRE DEL TRABAJADOR
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255); // Blanco
      doc.text(
        ObjTrabajador.numEmpleado + " | " + ObjComprobante.receptor.nombre,
        60,
        yTrabajador + 4,
        { align: "center" }
      );

      //TEXTOS
      doc.setFontSize(9);
      yTrabajador += 6;
      let yyTrabajador = yTrabajador;
      doc.setTextColor(0, 0, 0);
      doc.text("RFC:", xTrabajadore, (yTrabajador += 4));
      doc.text("CURP:", xTrabajadore, (yTrabajador += 4));
      doc.text("Tipo Contrato:", xTrabajadore, (yTrabajador += 4));
      doc.text("Tipo Régimen:", xTrabajadore, (yTrabajador += 4));
      yTrabajador += tipoRegimenHeight;
      doc.text("Periodicidad:", xTrabajadore, yTrabajador);
      doc.text("Clave Ent Fed:", xTrabajadore, (yTrabajador += 4));
      if (ObjTrabajador.tipoRegimen.clave === "02") {
        doc.text("NSS:", xTrabajadore, (yTrabajador += 4));
        doc.text("Fecha Inicio Rel. Lab:", xTrabajadore, (yTrabajador += 4));
        doc.text("Antigüedad:", xTrabajadore, (yTrabajador += 4));
        doc.text("Riesgo Puesto:", xTrabajadore, (yTrabajador += 4));
        if (ObjTrabajador.departamento) {
          doc.text("Departamento:", xTrabajadore, (yTrabajador += 4));
        }
        if (ObjTrabajador.puesto) {
          doc.text("Puesto:", xTrabajadore, (yTrabajador += 4));
        }
      }
      doc.text("Domicilio Fiscal:", xTrabajadore, (yTrabajador += 4));

      //DATOS
      let xDatos = 45;
      doc.setFont("helvetica", "normal");
      doc.text(ObjComprobante.receptor.rfc, xDatos, (yyTrabajador += 4));
      doc.text(ObjTrabajador.curp, xDatos, (yyTrabajador += 4));
      doc.text(
        ObjTrabajador.tipoContrato.tipoContrato,
        xDatos,
        (yyTrabajador += 4)
      );
      doc.text(tipoRegimen, xDatos, (yyTrabajador += 4));
      yyTrabajador += tipoRegimenHeight;
      doc.text(
        ObjTrabajador.periodicidadPago.periodicidadPago,
        xDatos,
        yyTrabajador
      );
      let claveEntFed = "";
      if (ObjTrabajador.claveEntFed) {
        claveEntFed = ObjTrabajador.claveEntFed.estado;
      }
      doc.text(claveEntFed, xDatos, (yyTrabajador += 4));
      if (ObjTrabajador.tipoRegimen.clave === "02") {
        doc.text(ObjTrabajador.numSeguridadSocial, xDatos, (yyTrabajador += 4));
        doc.text(
          formatoFechaSinHora(ObjTrabajador.fechaInicioRelLaboral),
          xDatos,
          (yyTrabajador += 4)
        );
        doc.text(ObjTrabajador.antiguedad, xDatos, (yyTrabajador += 4));
        doc.text(
          ObjTrabajador.riesgoPuesto.riesgoPuesto,
          xDatos,
          (yyTrabajador += 4)
        );
        if (ObjTrabajador.departamento) {
          doc.text(ObjTrabajador.departamento, xDatos, (yyTrabajador += 4));
        }
        if (ObjTrabajador.puesto) {
          doc.text(ObjTrabajador.puesto, xDatos, (yyTrabajador += 4));
        }
      }
      doc.text(
        ObjComprobante.receptor.domicilioFiscalReceptor,
        xDatos,
        (yyTrabajador += 4)
      );

      //DATOS DEL PAGO
      let yPagos = yCabecera;
      let xPagos = 130;
      let yyPagos = 0;
      let xxPagos = 165;

      doc.setFillColor(ObjColor);
      doc.setDrawColor(ObjColor);
      doc.roundedRect(130, yPagos, 70, 5, 2, 2, "FD");
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255); // Blanco
      doc.text("PAGOS", 165, (yPagos += 4), { align: "center" });
      yyPagos = yPagos;
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text("Tipo de Nómina:", xPagos, (yPagos += 6));
      doc.text("Fecha Inicial: :", xPagos, (yPagos += 4));
      doc.text("Fecha Final:", xPagos, (yPagos += 4));
      doc.text("Fecha de Pago:", xPagos, (yPagos += 4));
      doc.text("Num Días:", xPagos, (yPagos += 4));
      if (ObjTrabajador.tipoJornada) {
        if (ObjTrabajador.tipoJornada.tipoJornada) {
          doc.text("Tipo Jornada:", xPagos, (yPagos += 4));
        }
      }
      doc.text("Total Percepciones:", xPagos, (yPagos += 4));
      doc.text("Total Deducciones:", xPagos, (yPagos += 4));
      doc.text("Total Otros Pagos:", xPagos, (yPagos += 4));
      if (ObjTrabajador.tipoRegimen.clave === "02") {
        doc.text("Salario Base Cot Apor:", xPagos, (yPagos += 4));
        doc.text("S.D.I.:", xPagos, (yPagos += 4));
      }

      doc.setFont("helvetica", "normal");
      doc.text(
        ObjComprobante.nomina.tipoNomina.tipoNomina,
        xxPagos,
        (yyPagos += 6)
      );
      doc.text(
        formtaoFecha(ObjComprobante.nomina.fechaInicialPago),
        xxPagos,
        (yyPagos += 4)
      );
      doc.text(
        formtaoFecha(ObjComprobante.nomina.fechaFinalPago),
        xxPagos,
        (yyPagos += 4)
      );
      doc.text(
        formtaoFecha(ObjComprobante.nomina.fechaPago),
        xxPagos,
        (yyPagos += 4)
      );
      doc.text(ObjComprobante.nomina.numDiasPagados, xxPagos, (yyPagos += 4));
      if (ObjComprobante.nomina.receptor.tipoJornada) {
        if (ObjComprobante.nomina.receptor.tipoJornada.tipoJornada) {
          doc.text(
            ObjComprobante.nomina.receptor.tipoJornada.tipoJornada,
            xxPagos,
            (yyPagos += 4)
          );
        }
      }
      doc.text(
        formatoNumerico(ObjComprobante.nomina.totalPercepciones),
        xxPagos,
        (yyPagos += 4)
      );
      doc.text(
        formatoNumerico(ObjComprobante.nomina.totalDeducciones),
        xxPagos,
        (yyPagos += 4)
      );
      doc.text(
        formatoNumerico(ObjComprobante.nomina.totalOtrosPagos),
        xxPagos,
        (yyPagos += 4)
      );
      if (ObjTrabajador.tipoRegimen.clave === "02") {
        doc.text(
          formatoNumerico(ObjComprobante.nomina.receptor.salarioBaseCotApor),
          xxPagos,
          (yyPagos += 4)
        );
        doc.text(
          formatoNumerico(
            ObjComprobante.nomina.receptor.salarioDiarioIntegrado
          ),
          xxPagos,
          (yyPagos += 4)
        );
      }

      //APARTADO DE CONCEPTOS
      // let yConceptos = yyPagos + 4
      let yConceptos = yTrabajador + 4;
      if (yyPagos > yTrabajador) {
        yConceptos = yyPagos + 4;
      }
      let yyConceptos = yyPagos + 4;
      doc.setFillColor(ObjColor);
      doc.setDrawColor(ObjColor);
      doc.roundedRect(10, yConceptos, 190, 5, 2, 2, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255); // Blanco
      doc.text("CONCEPTOS", 100, (yConceptos += 4), { align: "center" });

      //INICIA LA TABLA QUE SE DIBUJA CON UN FOR Y LOS REGISTROS
      //PRIMERO LA CABACERA
      doc.setTextColor(0, 0, 0); // NEGRO
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      let xDescripcion = 10;
      let xCantidad = 115;
      let xClaveUnidad = 138;
      let xValorUnitario = 175;
      let xImporte = 200;
      yConceptos += 5;

      doc.text("Descripción", xDescripcion, yConceptos, { align: "left" });
      doc.text("Cantidad", xCantidad, yConceptos, { align: "center" });
      doc.text("Clave Unidad", xClaveUnidad, yConceptos, { align: "center" });
      doc.text("Valor Unitario", xValorUnitario, yConceptos, {
        align: "right",
      });
      doc.text("Importe", xImporte, yConceptos, { align: "right" });
      doc.line(xDescripcion, (yConceptos += 1), xImporte, yConceptos);
      //RECORREMOS LA LISTA DE CONCEPTOS Y CREAMOS LA TABLA MANUALMENTE
      yyConceptos = yConceptos + 7;
      for (let c_ of ObjComprobante.conceptos) {
        doc.setFont("helvetica", "bold");
        doc.text(c_.descripcion, xDescripcion, (yConceptos += 4), {
          align: "left",
        });
        doc.setFont("helvetica", "normal");
        doc.text(formatoCantidad(c_.cantidad), xCantidad, yyConceptos, {
          align: "center",
        });
        doc.text(c_.claveUnidad.claveUnidad, xClaveUnidad, yyConceptos, {
          align: "center",
        });
        doc.text(
          formatoNumerico(c_.valorUnitario),
          xValorUnitario,
          yyConceptos,
          { align: "right" }
        );
        doc.text(formatoNumerico(c_.importe), xImporte, yyConceptos, {
          align: "right",
        });

        let claveProdServ = doc.splitTextToSize(
          c_.claveProdServ.claveProdServ,
          105
        );
        let claveProdServHeight = doc.getTextDimensions(claveProdServ).h;
        doc.text(claveProdServ, xDescripcion, (yConceptos += 4), {
          align: "left",
        });
        yConceptos += claveProdServHeight - 1;
        doc.line(xDescripcion, yConceptos, xImporte, yConceptos);
        yyConceptos += 4;
      }

      //IMPORTE CON LETRA
      const func = require("./numeroALetras.js");
      let a = func.numeroALetras(
        ObjComprobante.total,
        ObjComprobante.moneda.clave
      );
      let xImporteLetra = 10;
      let yImporteLetra = yConceptos + 5;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("Importe con letra: ", xImporteLetra, yImporteLetra, {
        align: "left",
      });
      doc.setFont("helvetica", "normal");

      let importeLetra_ = doc.splitTextToSize(a, 120);
      let importeLetra_Height = doc.getTextDimensions(importeLetra_).h;
      doc.text(importeLetra_, xImporteLetra + 10, (yImporteLetra += 5), {
        align: "left",
      });
      //TABLA CON LOS TOTALES
      let xTotales = 200;
      let xxTotales = 150;
      let yTotales = yImporteLetra - 6;
      doc.text("SubTotal", xxTotales, yTotales, { align: "left" });
      doc.text(formatoNumerico(ObjComprobante.subTotal), xTotales, yTotales, {
        align: "right",
      });

      if (ObjComprobante.descuento != 0) {
        doc.text("Descuento", xxTotales, (yTotales += 5), { align: "left" });
      }
      if (ObjComprobante.impuestos) {
        for (let t of ObjComprobante.impuestos.traslados) {
          let nombre = "";
          if (t.impuesto === "001") {
            nombre = "ISR(";
          } else if (t.impuesto === "002") {
            nombre = "IVA(";
          } else if (t.impuesto === "003") {
            nombre = "IEPS(";
          }
          let tasa = formatoImpuestos(t.tasaOCuota * 100);
          nombre = nombre + tasa + ")";
          doc.text(nombre, xxTotales, (yTotales += 5), { align: "left" });
          doc.text(formatoNumerico(t.importe), xTotales, yTotales, {
            align: "right",
          });
        }
        for (let t of ObjComprobante.impuestos.retenciones) {
          let nombre = "";
          if (t.impuesto === "001") {
            nombre = "ISR(";
          } else if (t.impuesto === "002") {
            nombre = "IVA(";
          } else if (t.impuesto === "003") {
            nombre = "IEPS(";
          }
          let tasa = formatoImpuestos(t.tasaOCuota * 100);
          nombre = nombre + tasa + ")";
          doc.text(nombre, xxTotales, (yTotales += 5), { align: "left" });
          doc.text(formatoNumerico(t.importe * -1), xTotales, yTotales, {
            align: "right",
          });
        }
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      yTotales += 1;
      doc.line(xxTotales, yTotales, 200, yTotales);
      doc.setFontSize(10);
      doc.text("Total", xxTotales, (yTotales += 5), { align: "left" });
      doc.text(formatoNumerico(ObjComprobante.total), xTotales, yTotales, {
        align: "right",
      });

      //PERCEPRIONES
      let yPercepciones = (yTotales += 2);
      if (ObjComprobante.nomina.percepciones.percepcion.length != 0) {
        let yyPercepciones = yPercepciones;
        doc.setFillColor(ObjColor);
        doc.setDrawColor(ObjColor);
        doc.roundedRect(10, yTotales, 190, 5, 2, 2, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255); // Blanco
        doc.text("PERCEPCIONES", 100, (yTotales += 4), { align: "center" });

        //INICIA LA TABLA QUE SE DIBUJA CON UN FOR Y LOS REGISTROS
        //PRIMERO LA CABACERA
        doc.setTextColor(0, 0, 0); // NEGRO
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        let xClaveP = 10;
        let xDescripcionP = 30;
        let xGravadoP = 150;
        let xExentoP = 200;
        yPercepciones += 9;
        doc.setFont("helvetica", "bold");
        doc.text("Clave", xClaveP, yPercepciones, { align: "left" });
        doc.text("Concepto", xDescripcionP, yPercepciones, { align: "left" });
        doc.text("Importe Gravado", xGravadoP, yPercepciones, {
          align: "right",
        });
        doc.text("Importe Exento", xExentoP, yPercepciones, { align: "right" });
        doc.setLineWidth(1);
        doc.line(xClaveP, (yPercepciones += 1), xExentoP, yPercepciones);
        doc.setLineWidth(0.2);

        //RECORREMOS LA TABLA DE PERCEPCIONES PARA MOSTRARLOS EN PANTALLA
        yyPercepciones += 10;
        for (let p_ of ObjComprobante.nomina.percepciones.percepcion) {
          doc.setFont("helvetica", "bold");
          doc.text(p_.concepto, xDescripcionP, (yPercepciones += 4), {
            align: "left",
          });
          doc.setFont("helvetica", "normal");
          doc.text(
            p_.tipoPercepcion.tipoPercepcion,
            xDescripcionP,
            (yPercepciones += 4),
            { align: "left" }
          );
          doc.text(p_.clave, xClaveP, (yyPercepciones += 6), { align: "left" });
          doc.text(
            formatoNumerico(p_.importeGravado),
            xGravadoP,
            yyPercepciones,
            { align: "right" }
          );
          doc.text(
            formatoNumerico(p_.importeExento),
            xExentoP,
            yyPercepciones,
            { align: "right" }
          );
          yPercepciones += 2;
          doc.line(xClaveP, yPercepciones, xExentoP, yPercepciones);
          yyPercepciones += 4;
        }
      }

      // DEDUCCIONES
      let yDeducciones = (yPercepciones += 4);
      if (ObjComprobante.nomina.deducciones) {
        if (ObjComprobante.nomina.deducciones.deduccion.length != 0) {
          let yyDeducciones = yDeducciones;
          doc.setFillColor(ObjColor);
          doc.setDrawColor(ObjColor);
          doc.roundedRect(10, yDeducciones, 190, 5, 2, 2, "FD");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(12);
          doc.setTextColor(255, 255, 255); // Blanco
          doc.text("DEDUCCIONES", 100, (yDeducciones += 4), {
            align: "center",
          });

          //INICIA LA TABLA QUE SE DIBUJA CON UN FOR Y LOS REGISTROS
          //PRIMERO LA CABACERA
          doc.setTextColor(0, 0, 0); // NEGRO
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          let xClaveD = 10;
          let xDescripcionD = 30;
          let xImporteD = 200;
          yDeducciones += 5;

          doc.setFont("helvetica", "bold");
          doc.text("Clave", xClaveD, yDeducciones, { align: "left" });
          doc.text("Concepto", xDescripcionD, yDeducciones, { align: "left" });
          doc.text("Importe", xImporteD, yDeducciones, { align: "right" });
          doc.setLineWidth(1);
          doc.line(xClaveD, (yDeducciones += 1), xImporteD, yDeducciones);
          doc.setLineWidth(0.2);
          yyDeducciones += 10;

          //CREAMOS LOS REGISTROS
          for (let d_ of ObjComprobante.nomina.deducciones.deduccion) {
            doc.setFont("helvetica", "bold");
            let cDeduccion = doc.splitTextToSize(d_.concepto, 120);
            let cDeduccion_Height = doc.getTextDimensions(cDeduccion).h;
            doc.text(cDeduccion, xDescripcionD, (yDeducciones += 4), {
              align: "left",
            });
            doc.setFont("helvetica", "normal");
            doc.text(
              d_.tipoDeduccion.tipoDeduccion,
              xDescripcionD,
              (yDeducciones += cDeduccion_Height),
              { align: "left" }
            );
            doc.text(d_.clave, xClaveD, (yyDeducciones += 6), {
              align: "left",
            });
            doc.text(formatoNumerico(d_.importe), xImporteD, yyDeducciones, {
              align: "right",
            });
            yDeducciones += 2;
            doc.line(xClaveD, yDeducciones, xImporteD, yDeducciones);
            yyDeducciones += 4;
          }
        }
      }

      //OTROS PAGOS
      let yOtros = (yDeducciones += 4);
      if (ObjComprobante.nomina.otrosPagos) {
        let yyOtros = yOtros;
        doc.setFillColor(ObjColor);
        doc.setDrawColor(ObjColor);
        doc.roundedRect(10, yOtros, 190, 5, 2, 2, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255); // Blanco
        doc.text("OTROS PAGOS", 100, (yOtros += 4), { align: "center" });

        //INICIA LA TABLA QUE SE DIBUJA CON UN FOR Y LOS REGISTROS
        //PRIMERO LA CABACERA
        doc.setTextColor(0, 0, 0); // NEGRO
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        let xClaveO = 10;
        let xDescripcionO = 30;
        let xImporteO = 200;
        yOtros += 5;
        doc.setFont("helvetica", "bold");
        doc.text("Clave", xClaveO, yOtros, { align: "left" });
        doc.text("Concepto", xDescripcionO, yOtros, { align: "left" });
        doc.text("Importe", xImporteO, yOtros, { align: "right" });
        doc.setLineWidth(1);
        doc.line(xClaveO, (yOtros += 1), xImporteO, yOtros);
        doc.setLineWidth(0.2);
        yyOtros += 10;
        //CREAMOS LOS REGISTROS
        for (let o_ of ObjComprobante.nomina.otrosPagos) {
          doc.setFont("helvetica", "bold");
          doc.text(o_.concepto, xDescripcionO, (yOtros += 4), {
            align: "left",
          });
          doc.setFont("helvetica", "normal");
          let otroP = doc.splitTextToSize(o_.tipoOtroPago.tipoOtroPago, 120);
          let otroP_Height = doc.getTextDimensions(otroP).h;
          doc.text(otroP, xDescripcionO, (yOtros += 4), { align: "left" });
          doc.text(o_.clave, xClaveO, (yyOtros += 6), { align: "left" });
          doc.text(formatoNumerico(o_.importe), xImporteO, yyOtros, {
            align: "right",
          });
          yOtros += otroP_Height;
          doc.line(xClaveO, yOtros, xImporteO, yOtros);
          yyOtros += 4;

          //INSERTMOS EL SALTO DE PAGINA
          let espacioDisponible = doc.internal.pageSize.height - 40;
          let dif = yOtros > espacioDisponible;
          if (dif) {
            doc.addPage();
            yOtros = 10;
            yyOtros = 10;
          } else {
            yOtros += otroP_Height;
            // doc.line(xClaveO, yOtros, 200, yOtros);
            yOtros += 4;
          }
        }
      }

      //SELLOS FISCALES, SOLO CUANDO ESTA TIMBRADO
      if (ObjEstatus != "Sin timbrar") {
        //INSERTMOS EL SALTO DE PAGINA
        let xQr = 10;
        let yQr = (yOtros += 5);
        let espacioDisponibleS = doc.internal.pageSize.height - 45;
        let dif = yQr > espacioDisponibleS;
        let yCertificado = (yOtros += 2);
        if (dif) {
          doc.addPage();
          yQr = 10;
          yCertificado = 10;
        }

        //CERTIFICADOS
        let xCertificado = 10;
        let yyCertificado = yCertificado;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text("Fecha de Timbrado: ", xCertificado, yCertificado, {
          align: "left",
        });
        doc.text("No. Certificado: ", xCertificado, (yCertificado += 4), {
          align: "left",
        });
        doc.text("No. Certificado SAT: ", xCertificado, (yCertificado += 4), {
          align: "left",
        });
        doc.text("Folio Fiscal: ", xCertificado, (yCertificado += 4), {
          align: "left",
        });
        doc.setFont("helvetica", "normal");
        doc.text(
          ObjComprobante.timbreFiscalDigital.fechaTimbrado,
          xCertificado + 32,
          yyCertificado,
          { align: "left" }
        );
        doc.text(
          ObjComprobante.timbreFiscalDigital.noCertificado,
          xCertificado + 32,
          (yyCertificado += 4),
          { align: "left" }
        );
        doc.text(
          ObjComprobante.timbreFiscalDigital.noCertificadoSAT,
          xCertificado + 32,
          (yyCertificado += 4),
          { align: "left" }
        );
        doc.text(
          ObjComprobante.timbreFiscalDigital.uuid,
          xCertificado + 32,
          (yyCertificado += 4),
          { align: "left" }
        );

        //CODIGO QR
        if (yOtros < yCertificado) {
          yQr = yCertificado += 5;
        } else {
          yQr = yCertificado += 6;
        }
        // if (codigoQr) {
        doc.addImage(ObjQr, "PNG", xQr - 4, yQr - 4, 44, 44);
        // }

        //SELLOS
        let xSellos = 50;
        let ySellos = yQr;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(6);

        let selloCfdi_ = doc.splitTextToSize(
          ObjComprobante.timbreFiscalDigital.selloCFD,
          150
        );
        let selloCfdi_Height = doc.getTextDimensions(selloCfdi_).h;
        let selloSat_ = doc.splitTextToSize(
          ObjComprobante.timbreFiscalDigital.selloSAT,
          150
        );
        let selloSat_Height = doc.getTextDimensions(selloSat_).h;
        let cadenaOriginal = doc.splitTextToSize(
          ObjComprobante.timbreFiscalDigital.cadenaOriginal,
          150
        );
        let cadenaOriginal_Height = doc.getTextDimensions(selloSat_Height).h;

        doc.setFont("helvetica", "bold");
        doc.text("Sello CFDI: ", xSellos, ySellos);
        doc.text("Sello SAT: ", xSellos, ySellos + selloCfdi_Height + 3);
        doc.text(
          "Cadena Original: ",
          xSellos,
          ySellos + selloCfdi_Height + selloSat_Height + 6
        );
        doc.setFont("helvetica", "normal");
        doc.text(selloCfdi_, xSellos, (ySellos += 3));
        doc.text(selloSat_, xSellos, (ySellos += selloCfdi_Height += 3));
        doc.text(cadenaOriginal, xSellos, (ySellos += selloSat_Height += 3));
        // yTotales += 5;
      }

      //DATOS FINALES PARA EXPORTAR EL ARCHIVO
      const base64 = doc.output("datauristring");
      let nombreDoc = "";
      if (ObjComprobante.serie === "") {
        nombreDoc =
          ObjComprobante.folio +
          "_" +
          ObjComprobante.receptor.rfc +
          "_" +
          ObjComprobante.folioFiscal;
      } else {
        nombreDoc =
          ObjComprobante.serie +
          "_" +
          ObjComprobante.folio +
          "_" +
          ObjComprobante.receptor.rfc +
          "_" +
          ObjComprobante.folioFiscal;
      }
      // doc.save(nombreDoc + '.pdf');
      resolve(base64);
    } catch (error) {
      console.log(error);
    }
  });
};

export { ComprobanteNominaBase64 };
