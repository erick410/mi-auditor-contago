import {
  formatoCantidad,
  formatoCantidadDos,
  formatoCantidaCero,
  formatoMilesConDosDecimales,
  formatoMilesConSeisDecimales,
  formatoImpuestos,
  formatoNumerico,
  formtaoFecha,
} from "./FuncionesFormatos.js";
import jsPDF from "jspdf";

const Pago20Base64 = async (
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
        doc.addImage(rutaImagen, "PNG", 25, 25, 150, 150, "", "FAST", angle);
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
      doc.text(ObjComprobante.emisor.rfc, 200, (yCabecera += 5), {
        align: "right",
      });
      doc.text(ObjComprobante.emisor.nombre, 200, (yCabecera += 5), {
        align: "right",
      });
      doc.setFontSize(9);
      doc.text(
        ObjComprobante.emisor.regimenFiscal.regimenFiscal,
        200,
        (yCabecera += 5),
        { align: "right" }
      );

      //DATOS DEL CLIENTE
      let xCliente = xCabecera;
      let yCliente = (yCabecera += 10);
      doc.setFontSize(12);
      doc.text("Cliente: ", xCliente, (yCliente += 5), { align: "left" });
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      let datosReceptor = doc.splitTextToSize(
        ObjComprobante.receptor.rfc + " | " + ObjComprobante.receptor.nombre,
        130
      );
      let datosReceptor_Height = doc.getTextDimensions(datosReceptor).h;
      doc.text(datosReceptor, xCliente, (yCliente += 5), { align: "left" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      let regimenFiscalReceptor = "";
      if (ObjComprobante.receptor.regimenFiscalReceptor.regimenFiscal) {
        regimenFiscalReceptor =
          ObjComprobante.receptor.regimenFiscalReceptor.regimenFiscal;
      }
      doc.text(
        ObjComprobante.receptor.usoCfdi.usoCfdi,
        xCliente,
        (yCliente += datosReceptor_Height),
        { align: "left" }
      );
      doc.text(
        ObjComprobante.receptor.domicilioFiscalReceptor,
        xCliente,
        (yCliente += 5),
        { align: "left" }
      );
      doc.text(regimenFiscalReceptor, xCliente, (yCliente += 4), {
        align: "left",
      });

      //DATOS GENERALES DE LA FACTURA
      let xGenerales = 145;
      let yGenerales = yCabecera;
      let yyGenerales = yGenerales;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      // doc.text('', xGenerales, yGenerales += 5, { align: 'left' });
      doc.text("Fecha: ", xGenerales, (yGenerales += 5), { align: "left" });
      doc.text("Moneda: ", xGenerales, (yGenerales += 5), { align: "left" });
      doc.text("Tipo de Comprobante: ", xGenerales, (yGenerales += 5), {
        align: "left",
      });
      doc.text("Lugar de Expedición: ", xGenerales, (yGenerales += 5), {
        align: "left",
      });

      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(formtaoFecha(ObjComprobante.fecha), 200, (yyGenerales += 5), {
        align: "right",
      });
      doc.text(ObjComprobante.moneda.clave, 200, (yyGenerales += 5), {
        align: "right",
      });
      let tipoComprobante = "P - Pago";
      doc.text(tipoComprobante, 200, (yyGenerales += 5), { align: "right" });
      doc.text(ObjComprobante.lugarExpedicion, 200, (yyGenerales += 5), {
        align: "right",
      });

      //VERIFICAMOS SI TIENE CFDI RELACIONADOS
      yyGenerales += 5;
      if (ObjComprobante.cfdiRelacionados != null) {
        let yRelacionados = (yyGenerales += 5);
        let xRelacionados = 10;
        for (var r of ObjComprobante.cfdiRelacionados) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.text("CFDI'S Relacionados", xRelacionados, yRelacionados, {
            align: "left",
          });
          //LINEA DE LOS CONCEPTOS
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          let width = 190;
          let height = 1;
          let cornerRadius = 0;
          const color_ = ObjColor;
          doc.setDrawColor(color_);
          yRelacionados += 1;
          doc.setLineWidth(1);
          doc.line(10, yRelacionados, 200, yRelacionados);
          for (var c of r.uuid) {
            doc.text(
              r.tipoRelacion.tipoRelacion + ":",
              xRelacionados,
              (yRelacionados += 4),
              { align: "left" }
            );
            var stringWidth =
              doc.getStringUnitWidth(r.tipoRelacion.tipoRelacion) * 8;
            var stringWidthInMM = (stringWidth * 25.4) / 72;

            doc.text(c, xRelacionados + stringWidthInMM + 2, yRelacionados, {
              align: "left",
            });
            yRelacionados += 4;
          }
        }
        yyGenerales = yRelacionados;
      }

      // //CONCEPTOS
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      let yConceptos = (yyGenerales += 5);
      let xConceptos = 10;
      doc.text("No.", xConceptos + 10, yConceptos, { align: "center" });
      doc.text("Identificación", xConceptos + 10, yConceptos + 5, {
        align: "center",
      });
      doc.text("Valor", xConceptos + 165, yConceptos, { align: "right" });
      doc.text("Unitario", xConceptos + 165, yConceptos + 5, {
        align: "right",
      });
      doc.text("Descripción", xConceptos + 25, (yConceptos += 3), {
        align: "left",
      });
      doc.text("Cantidad", xConceptos + 110, yConceptos, { align: "center" });
      doc.text("Unidad", xConceptos + 130, yConceptos, { align: "center" });
      doc.text("Importe", xConceptos + 190, yConceptos, { align: "right" });

      //LINEA DE LOS CONCEPTOS
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      let width = 190;
      let height = 1;
      let cornerRadius = 0;
      doc.setDrawColor(ObjColor);
      yConceptos += 4;
      doc.setLineWidth(1);
      doc.line(xConceptos - 1, yConceptos, 202, yConceptos);

      //RECORREMOS EL ARRAY DE LOS CONCEPTOS
      yConceptos += 5;
      for (let c of ObjComprobante.conceptos) {
        let ic = yConceptos;
        let fc = 0;
        //SEPARAMOS EL TEXTO, PRA HACER LOS SALTOS DE LINEA
        let arrayTexto = c.descripcion.split("<p>");
        for (let t of arrayTexto) {
          doc.setFont("helvetica", "bold");
          let tl = t.replace(/<[^>]+>/g, "");

          let concepto_ = doc.splitTextToSize(tl, 80);
          let concepto_Height = doc.getTextDimensions(concepto_).h;

          doc.text(concepto_, xConceptos + 25, yConceptos + 1, {
            align: "left",
          });
          yConceptos += concepto_Height + 1;
        }
        fc = yConceptos;
        //CLAVE DEL SAT
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        let claveProdServ_ = doc.splitTextToSize(
          c.claveProdServ.claveProdServ,
          80
        );
        let claveProdServ_Height = doc.getTextDimensions(claveProdServ_).h;
        doc.text(claveProdServ_, xConceptos + 25, yConceptos + 1, {
          align: "left",
        });

        //NO DE IDENTIFICACION
        doc.setFontSize(8);
        let divc = (fc - ic) / 2 + ic;
        doc.setFont("helvetica", "normal");
        let noIdentificacion_ = doc.splitTextToSize(c.noIdentificacion, 22);
        let noIdentificacion_Height =
          doc.getTextDimensions(noIdentificacion_).h;
        let yNoidentificacion = divc - noIdentificacion_Height / 2;
        doc.text(noIdentificacion_, xConceptos + 10, yNoidentificacion + 1, {
          align: "center",
        });

        let cantidad = Number(c.cantidad);
        doc.text(formatoCantidad(cantidad), xConceptos + 110, divc, {
          align: "center",
        });
        doc.setFont("helvetica", "bold");

        let unidad_ = c.unidad.toUpperCase();
        unidad_ = doc.splitTextToSize(unidad_, 20);
        let unidad_Height = doc.getTextDimensions(unidad_).h;
        doc.text(unidad_, xConceptos + 130, divc, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.text(
          c.claveUnidad.claveUnidad,
          xConceptos + 130,
          divc + unidad_Height,
          { align: "center" }
        );
        doc.setFontSize(8);
        doc.text(formatoNumerico(c.valorUnitario), xConceptos + 165, divc, {
          align: "right",
        });
        doc.text(formatoNumerico(c.importe), xConceptos + 190, divc, {
          align: "right",
        });

        //INSERTMOS EL SALTO DE PAGINA
        let espacioDisponible = doc.internal.pageSize.height - 40;
        let dif = yConceptos > espacioDisponible;
        if (dif) {
          doc.addPage();
          yConceptos = 10;
        } else {
          doc.setLineWidth(0.1);
          yConceptos += claveProdServ_Height;
          doc.line(xConceptos, yConceptos, 200, yConceptos);
          yConceptos += 4;
        }
      }

      //IMPORTE CON LETRA
      const func = require("./numeroALetras.js");
      let a = func.numeroALetras(ObjComprobante.total, "MXN");
      let xImporteLetra = 10;
      let yImporteLetra = yConceptos;
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
      let yTotales = yImporteLetra - 5;
      doc.text("SubTotal", xxTotales, yTotales, { align: "left" });
      doc.text(formatoNumerico(ObjComprobante.subTotal), xTotales, yTotales, {
        align: "right",
      });
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      yTotales += 1;
      doc.line(xxTotales, yTotales, 200, yTotales);
      doc.setFontSize(10);
      doc.text("Total", xxTotales, (yTotales += 5), { align: "left" });
      doc.text(formatoNumerico(ObjComprobante.total), xTotales, yTotales, {
        align: "right",
      });

      //APARTADO DEL COMPLEMENTO DE PAGO
      let yCarta = (yTotales += 4);
      let objPago = ObjComprobante.pago;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("COMPLEMENTO DE PAGO " + objPago.version, 100, (yCarta += 2), {
        align: "center",
      });
      doc.setLineWidth(1);
      yCarta += 1;
      doc.line(xConceptos - 1, yCarta, 202, yCarta);
      doc.setFontSize(10);

      //APARTADO DEL TOTAL
      doc.setFont("helvetica", "bold");
      doc.text("MONTO TOTAL PAGOS", 100, (yCarta += 5), { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.text(
        formatoNumerico(objPago.totales.montoTotalPagos),
        100,
        (yCarta += 5),
        { align: "center" }
      );

      // APARTADO DE LAS RETENCIONES
      let validaRetenciones =
        parseFloat(objPago.totales.totalRetencionesISR) +
        parseFloat(objPago.totales.totalRetencionesIVA) +
        parseFloat(objPago.totales.totalRetencionesIEPS);
      if (validaRetenciones != 0) {
        doc.setFont("helvetica", "bold");
        doc.text("TOTAL ISR RETENIDO", 50, (yCarta += 5), { align: "center" });
        doc.text("TOTAL IVA RETENIDO", 105, yCarta, { align: "center" });
        doc.text("TOTAL IEPS RETENIDO", 160, yCarta, { align: "center" });
        doc.setFont("helvetica", "normal");
        doc.text(
          formatoNumerico(objPago.totales.totalRetencionesISR),
          50,
          (yCarta += 5),
          { align: "center" }
        );
        doc.text(
          formatoNumerico(objPago.totales.totalRetencionesIVA),
          105,
          yCarta,
          { align: "center" }
        );
        doc.text(
          formatoNumerico(objPago.totales.totalRetencionesIEPS),
          160,
          yCarta,
          { align: "center" }
        );
      }

      // APARTADO DEL IVA 16
      if (objPago.totales.totalTrasladosBaseIVA16 != 0) {
        doc.setFont("helvetica", "bold");
        doc.text("TOTAL TRASLADADO BASE IVA 16%", 60, (yCarta += 5), {
          align: "center",
        });
        doc.text("TOTAL TRASLADADO IMPUESTO IVA 16%", 140, yCarta, {
          align: "center",
        });
        doc.setFont("helvetica", "normal");
        doc.text(
          formatoNumerico(objPago.totales.totalTrasladosBaseIVA16),
          60,
          (yCarta += 5),
          { align: "center" }
        );
        doc.text(
          formatoNumerico(objPago.totales.totalTrasladosImpuestoIVA16),
          140,
          yCarta,
          { align: "center" }
        );
      }

      // APARTADO DEL IVA 8
      if (objPago.totales.totalTrasladosBaseIVA8 != 0) {
        doc.setFont("helvetica", "bold");
        doc.text("TOTAL TRASLADADO BASE IVA 8%", 60, (yCarta += 5), {
          align: "center",
        });
        doc.text("TOTAL TRASLADADO IMPUESTO IVA 8%", 140, yCarta, {
          align: "center",
        });
        doc.setFont("helvetica", "normal");
        doc.text(
          formatoNumerico(objPago.totales.totalTrasladosBaseIVA8),
          60,
          (yCarta += 5),
          { align: "center" }
        );
        doc.text(
          formatoNumerico(objPago.totales.totalTrasladosImpuestoIVA8),
          140,
          yCarta,
          { align: "center" }
        );
      }

      // APARTADO DEL IVA 0
      if (objPago.totales.totalTrasladosBaseIVA0 != 0) {
        doc.setFont("helvetica", "bold");
        doc.text("TOTAL TRASLADADO BASE IVA 0%", 60, (yCarta += 5), {
          align: "center",
        });
        doc.text("TOTAL TRASLADADO IMPUESTO IVA 0%", 140, yCarta, {
          align: "center",
        });
        doc.setFont("helvetica", "normal");
        doc.text(
          formatoNumerico(objPago.totales.totalTrasladosBaseIVA0),
          60,
          (yCarta += 5),
          { align: "center" }
        );
        doc.text(
          formatoNumerico(objPago.totales.totalTrasladosImpuestoIVA0),
          140,
          yCarta,
          { align: "center" }
        );
      }

      // APARTADO DEL IVA EXENTO
      if (objPago.totales.totalTrasladosBaseIVAExento != 0) {
        doc.setFont("helvetica", "bold");
        doc.text("TOTAL TRASLADADO BASE IVA EXENTO", 100, (yCarta += 5), {
          align: "center",
        });
        doc.setFont("helvetica", "normal");
        doc.text(
          formatoNumerico(objPago.totales.totalTrasladosBaseIVAExento),
          100,
          (yCarta += 5),
          { align: "center" }
        );
      }

      //APARTADO DE LOS PAGOS
      for (let pa of objPago.pagos) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("PAGO", 100, (yCarta += 6), { align: "center" });
        doc.setLineWidth(0.6);
        yCarta += 1;
        doc.line(xConceptos - 1, yCarta, 202, yCarta);
        doc.setFont("helvetica", "bold");
        doc.text("Fecha de Pago", 30, (yCarta += 5), { align: "center" });
        doc.text("Forma de Pago P", 90, yCarta, { align: "center" });
        doc.text("Monto", 135, yCarta, { align: "center" });
        doc.text("Moneda P", 155, yCarta, { align: "center" });
        doc.text("Tipo de cambio P", 180, yCarta, { align: "center" });
        doc.setFont("helvetica", "normal");
        doc.text(formtaoFecha(pa.fechaPago), 30, (yCarta += 5), {
          align: "center",
        });
        doc.text(pa.formaDePagoP.formaPago, 90, yCarta, { align: "center" });
        doc.text(formatoNumerico(pa.monto), 135, yCarta, { align: "center" });
        doc.text(pa.monedaP.clave, 155, yCarta, { align: "center" });
        doc.text(formatoNumerico(pa.tipoCambioP), 180, yCarta, {
          align: "center",
        });

        //APARTADO DE LOS DOCUMENTOS RELACIONADOS
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.text("Documentos relacionados", 10, (yCarta += 6), {
          align: "left",
        });
        doc.setLineWidth(0.6);
        yCarta += 1;
        doc.line(xConceptos - 1, yCarta, 202, yCarta);
        doc.setFont("helvetica", "bold");
        doc.text("Id documento", 35, (yCarta += 5), { align: "center" });
        doc.text("Serie", 65, yCarta, { align: "center" });
        doc.text("Folio", 75, yCarta, { align: "center" });
        doc.text("Moneda Dr", 90, yCarta, { align: "center" });
        doc.text("Equivalencia DR", 108, yCarta, { align: "center" });
        doc.text("Num parcialidad", 130, yCarta, { align: "center" });
        doc.text("Imp anterior", 160, yCarta, { align: "right" });
        doc.text("Imp pagado", 180, yCarta, { align: "right" });
        doc.text("Imp insoluto", 200, yCarta, { align: "right" });
        doc.setFont("helvetica", "normal");
        doc.setLineWidth(0.4);
        yCarta += 1;
        doc.line(xConceptos - 1, yCarta, 202, yCarta);
        for (let dr of pa.doctoRelacionados) {
          doc.text(dr.idDocumento, 35, (yCarta += 4), { align: "center" });
          doc.text(dr.serie, 65, yCarta, { align: "center" });
          doc.text(dr.folio, 75, yCarta, { align: "center" });
          doc.text(dr.monedaDR.clave, 90, yCarta, { align: "center" });
          doc.text(formatoNumerico(dr.equivalenciaDR), 108, yCarta, {
            align: "center",
          });
          doc.text(dr.numParcialidad.toString(), 130, yCarta, {
            align: "center",
          });
          doc.text(formatoNumerico(dr.impSaldoAnt), 160, yCarta, {
            align: "right",
          });
          doc.text(formatoNumerico(dr.impPagado), 180, yCarta, {
            align: "right",
          });
          doc.text(formatoNumerico(dr.impSaldoInsoluto), 200, yCarta, {
            align: "right",
          });
          doc.setLineDash([1]);
          doc.setLineWidth(0.2);
          doc.line(10, yCarta + 1, 202, yCarta + 1);
          let espacioDisponible = doc.internal.pageSize.height - 30;
          let dif = yCarta > espacioDisponible;
          if (dif) {
            doc.addPage();
            yCarta = 10;
          }
        }
        let espacioDisponibleCp = doc.internal.pageSize.height - 30;
        let dif = yCarta > espacioDisponibleCp;
        if (dif) {
          doc.addPage();
          yCarta = 10;
        }
      }
      doc.setFontSize(10);

      //SELLOS FISCALES, SOLO CUANDO ESTA TIMBRADO
      if (ObjEstatus != "Sin timbrar") {
        //INSERTMOS EL SALTO DE PAGINA
        let xQr = 10;
        let yQr = (yCarta += 5);
        let espacioDisponibleS = doc.internal.pageSize.height - 45;
        let dif = yQr > espacioDisponibleS;
        if (dif) {
          doc.addPage();
          yQr = 10;
          yCertificado = -5;
        }

        //CERTIFICADOS
        let xCertificado = 10;
        let yCertificado = (yCarta += 2);
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
        if (yCarta < yCertificado) {
          yQr = yCertificado += 5;
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
        yTotales = ySellos;
      }

      //AGREGAMOS LAS NOTAS SI ES QUE LAS TIENE
      if (ObjComprobante.notas != "") {
        doc.setFontSize(10);
        let xNotas = 10;
        let yNotas = (yTotales += 10);
        doc.setLineWidth(1);
        doc.line(xNotas, yNotas - 4, xNotas, yNotas + 1);
        doc.text(ObjComprobante.notas, xNotas + 2, yNotas);
      }

      //AGREGAMOS EL PIE DE PAGINA
      var footerText = "Representación impresa de un CFDI";
      var totalPages = doc.internal.getNumberOfPages();
      for (var i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        // Establecer la fuente y el estilo del pie de página
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.setTextColor(150);

        // Agregar el contenido del pie de página
        doc.text(
          footerText,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
        doc.text(
          "Documento generado por ContaGo",
          10,
          doc.internal.pageSize.getHeight() - 10,
          { align: "left" }
        );
        doc.text(
          "Página " + i + " de " + totalPages,
          200,
          doc.internal.pageSize.getHeight() - 10,
          { align: "right" }
        );
      }

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

export { Pago20Base64 };
