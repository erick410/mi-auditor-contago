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

const CartaPorte30Base64 = async (
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
      doc.text(ObjTipoComprobante, 200, yCabecera, { align: "right" });
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
      if (ObjComprobante.receptor.regimenFiscalReceptor.regimenFiscalReceptor) {
        regimenFiscalReceptor =
          ObjComprobante.receptor.regimenFiscalReceptor.regimenFiscalReceptor;
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
      doc.text(regimenFiscalReceptor, xCliente, (yCliente += 5), {
        align: "left",
      });
      // doc.text(ObjComprobante.cliente.direccion, xCliente, yCliente += 5, { align: 'left' });

      //DATOS GENERALES DE LA FACTURA
      let xGenerales = 145;
      let yGenerales = yCabecera;
      let yyGenerales = yGenerales;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("", xGenerales, (yGenerales += 5), { align: "left" });
      doc.text("Fecha: ", xGenerales, (yGenerales += 5), { align: "left" });
      doc.text("Moneda: ", xGenerales, (yGenerales += 5), { align: "left" });
      doc.text("Tipo de Comprobante: ", xGenerales, (yGenerales += 5), {
        align: "left",
      });
      doc.text("Lugar de Expedición: ", xGenerales, (yGenerales += 5), {
        align: "left",
      });
      if (ObjComprobante.oc != "") {
        doc.text("OC: ", xGenerales, (yGenerales += 5), { align: "left" });
      }

      doc.setFontSize(14);
      doc.text(
        ObjComprobante.serie + " " + ObjComprobante.folio,
        200,
        (yyGenerales += 5),
        { align: "right" }
      );
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(formtaoFecha(ObjComprobante.fecha), 200, (yyGenerales += 5), {
        align: "right",
      });
      doc.text(ObjComprobante.moneda.moneda, 200, (yyGenerales += 5), {
        align: "right",
      });
      let tipoComprobante = "I - Ingreso";
      if (ObjComprobante.tipoComprobante === "E") {
        tipoComprobante = "E - Egreso";
      }
      doc.text(tipoComprobante, 200, (yyGenerales += 5), { align: "right" });
      doc.text(ObjComprobante.lugarExpedicion, 200, (yyGenerales += 5), {
        align: "right",
      });
      if (ObjComprobante.oc != "") {
        doc.text(ObjComprobante.oc, 200, (yyGenerales += 5), {
          align: "right",
        });
      }

      //DATOS DEL PAGO
      let xDatosPago = 10;
      let yDatosPago = (yyGenerales += 5);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("Método de Pago", xDatosPago + 40, (yDatosPago += 5), {
        align: "center",
      });
      doc.text("Forma de Pago", xDatosPago + 100, yDatosPago, {
        align: "center",
      });
      doc.text("Condiciones de Pago", xDatosPago + 160, yDatosPago, {
        align: "center",
      });

      doc.setFont("helvetica", "normal");
      doc.text(
        ObjComprobante.metodoPago.metodoPago,
        xDatosPago + 40,
        (yDatosPago += 5),
        { align: "center" }
      );
      doc.text(
        ObjComprobante.formaPago.formaPago,
        xDatosPago + 100,
        yDatosPago,
        { align: "center" }
      );
      doc.text(ObjComprobante.condicionesDePago, xDatosPago + 160, yDatosPago, {
        align: "center",
      });

      //VERIFICAMOS SI TIENE CFDI RELACIONADOS
      if (ObjComprobante.cfdiRelacionados != null) {
        let yRelacionados = (yDatosPago += 5);
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
        yDatosPago = yRelacionados;
      }

      //CONCEPTOS
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      let yConceptos = (yDatosPago += 5);
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
      let yTotales = yImporteLetra - 10;
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

      //APARTADO DEL COMPLEMENTO CARTA PORTE
      let yCarta = (yTotales += 4);
      let ObjCarta = ObjComprobante.cartaPorte;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("COMPLEMENTO CARTA PORTE", 100, (yCarta += 2), {
        align: "center",
      });
      doc.setLineWidth(1);
      yCarta += 1;
      doc.line(xConceptos - 1, yCarta, 202, yCarta);
      doc.setFontSize(10);
      doc.text("Versión: ", 42, (yCarta += 4), { align: "left" });
      doc.text("Transporte internacional: ", 66, yCarta, { align: "left" });
      doc.text("Total distancia recorrida: ", 118, yCarta, { align: "left" });
      doc.setFont("helvetica", "normal");
      doc.text("3.0", 57, yCarta, { align: "left" });
      doc.text(ObjCarta.transpInternac, 109, yCarta, { align: "left" });
      doc.text(formatoCantidadDos(ObjCarta.totalDistRec) + " KM", 161, yCarta, {
        align: "left",
      });
      if (ObjCarta.transpInternac === "Sí") {
        yCarta += 5;
        doc.setFont("helvetica", "bold");
        doc.text("Régimen aduanero", 45, yCarta, { align: "center" });
        doc.text("Entarda o salida", 85, yCarta, { align: "center" });
        doc.text("Pais de origen o destino", 130, yCarta, { align: "center" });
        doc.text("Clave de transporte", 175, yCarta, { align: "center" });
        doc.setFont("helvetica", "normal");
        yCarta += 4;
        doc.text(ObjCarta.regimenAduanero.regimenAduanero, 45, yCarta, {
          align: "center",
        });
        doc.text(ObjCarta.entradaSalidaMerc, 85, yCarta, { align: "center" });
        doc.text(ObjCarta.paisOrigenDestino.pais, 130, yCarta, {
          align: "center",
        });
        doc.text(ObjCarta.viaEntradaSalida.cveTransporte, 175, yCarta, {
          align: "center",
        });
      }
      //UBICACIONES
      doc.setFont("helvetica", "bold");
      doc.text("UBICACIONES", 100, (yCarta += 6), { align: "center" });
      doc.setLineWidth(0.6);
      yCarta += 1;
      doc.line(xConceptos - 1, yCarta, 202, yCarta);
      yCarta += 4;
      doc.text("Tipo", 20, yCarta, { align: "center" });
      doc.text("de ubicación", 20, yCarta + 3, { align: "center" });
      doc.text("Ubicacion", 34, yCarta + 2, { align: "left" });
      doc.text("Fecha", 96, yCarta, { align: "center" });
      doc.text("salida / llegada", 96, yCarta + 3, { align: "center" });
      doc.text("Distancia ", 130, yCarta, { align: "right" });
      doc.text("recorrida ", 130, yCarta + 3, { align: "right" });
      doc.text("Domicilio ", 133, yCarta + 2, { align: "left" });
      doc.setFont("helvetica", "normal");
      yCarta += 10;
      doc.setFontSize(8);
      for (let u of ObjCarta.ubicaciones) {
        doc.text(u.tipoUbicacion, 20, yCarta, { align: "center" });
        let ubicacion_ = doc.splitTextToSize(u.ubicacion, 48);
        let ubicacion_Height = doc.getTextDimensions(ubicacion_).h;
        doc.text(ubicacion_, 34, yCarta, { align: "left" });
        let fechaHoraSalidaLlegada_ = doc.splitTextToSize(
          formtaoFecha(u.fechaHoraSalidaLlegada),
          28
        );
        doc.text(fechaHoraSalidaLlegada_, 96, yCarta, { align: "center" });
        let distanciaRecorrida = Number(u.distanciaRecorrida);
        doc.text(formatoCantidaCero(distanciaRecorrida), 130, yCarta, {
          align: "right",
        });

        let calle = u.domicilio.calle + " ";

        let numeroExterior = "";
        if (u.domicilio.numeroExterior != "") {
          numeroExterior = u.domicilio.numeroExterior + " ";
        }

        let numeroInterior = ",";
        if (u.domicilio.numeroExterior === "") {
          numeroInterior = u.domicilio.numeroInterior + ", ";
        }

        let colonia = "";
        if (u.domicilio.colonia) {
          colonia = u.domicilio.colonia.descripcion + ", ";
        }

        let localidad = "";
        if (u.domicilio.localidad) {
          localidad = u.domicilio.localidad.descripcion + ", ";
        }

        let municipio = "";
        if (u.domicilio.municipio) {
          municipio = u.domicilio.municipio.descripcion + ", ";
        }

        let estado = "";
        if (u.domicilio.estado) {
          estado = u.domicilio.estado.descripcion + ", ";
        }

        let pais = "";
        if (u.domicilio.pais) {
          pais = u.domicilio.pais.descripcion + ", ";
        }

        let codigoPostal = u.domicilio.codigoPostal + ".";

        let dom =
          calle +
          numeroExterior +
          numeroInterior +
          colonia +
          localidad +
          municipio +
          estado +
          pais +
          codigoPostal;
        let domicilio_ = doc.splitTextToSize(dom, 66);
        let domicilio_Height = doc.getTextDimensions(domicilio_).h;
        doc.text(domicilio_, 133, yCarta, { align: "left" });

        yCarta += domicilio_Height;
        doc.setLineDash([1]);
        doc.setLineWidth(0.2);
        doc.line(xConceptos - 1, yCarta - 3, 202, yCarta - 3);
        let espacioDisponible = doc.internal.pageSize.height - 30;
        let dif = yCarta > espacioDisponible;
        if (dif) {
          doc.addPage();
          yCarta = 10;
        }
      }
      doc.setFontSize(10);
      //MERCANCIAS
      doc.setLineDash([0]);
      doc.setFont("helvetica", "bold");
      doc.text("MERCANCIAS", 100, (yCarta += 6), { align: "center" });
      doc.setLineWidth(0.6);
      yCarta += 1;
      doc.line(xConceptos - 1, yCarta, 202, yCarta);

      yCarta += 5;
      doc.setFont("helvetica", "bold");
      doc.text("Peso bruto total", 40, yCarta + 1, { align: "center" });
      doc.text("Unidad de peso", 74, yCarta + 1, { align: "center" });
      doc.text("Num. total", 110, yCarta, { align: "center" });
      doc.text("de mercancias", 110, yCarta + 3, { align: "center" });
      doc.text("Logistica inversa", 160, yCarta, { align: "center" });
      doc.text("de recolección o devolución", 160 + 3, yCarta + 3, {
        align: "center",
      });
      doc.setFont("helvetica", "normal");
      yCarta += 6;
      doc.text(
        formatoMilesConDosDecimales(ObjCarta.mercancias.pesoBrutoTotal),
        40,
        yCarta,
        { align: "center" }
      );
      doc.text(ObjCarta.mercancias.unidadPeso.claveUnidadPeso, 74, yCarta, {
        align: "center",
      });
      doc.text(
        formatoMilesConDosDecimales(ObjCarta.mercancias.numTotalMercancias),
        110,
        yCarta,
        { align: "center" }
      );
      doc.text(
        ObjCarta.mercancias.logisticaInversaRecoleccionDevolucion,
        160,
        yCarta,
        { align: "center" }
      );
      yCarta += 5;
      doc.setFont("helvetica", "bold");
      doc.text("Bienes transportados", 10, yCarta + 1, { align: "left" });
      doc.text("Descripción", 60, yCarta + 1, { align: "left" });
      doc.text("Cantidad", 126, yCarta + 1, { align: "center" });
      doc.text("Clave unidad ", 148, yCarta + 1, { align: "center" });
      doc.text("Material", 170, yCarta, { align: "center" });
      doc.text("peligroso ", 170, yCarta + 3, { align: "center" });
      doc.text("Peso en KG ", 200, yCarta + 1, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.setLineWidth(0.6);
      yCarta += 4;
      doc.line(10, yCarta, 202, yCarta);
      yCarta += 4;
      doc.setFontSize(7);
      for (let c of ObjCarta.mercancias.mercancia) {
        doc.setFont("helvetica", "bold");
        let descripcion_ = doc.splitTextToSize(c.descripcion, 100);
        let descripcion_Height = doc.getTextDimensions(descripcion_).h;
        doc.text(descripcion_, 10, yCarta, { align: "left" });

        doc.setFont("helvetica", "normal");
        let bienesTransp_ = doc.splitTextToSize(
          c.bienesTransp.claveProdServCP,
          100
        );
        let bienesTransp_Height = doc.getTextDimensions(bienesTransp_).h;
        doc.text(bienesTransp_, 10, (yCarta += descripcion_Height), {
          align: "left",
        });

        doc.text(formatoMilesConDosDecimales(c.cantidad), 126, yCarta, {
          align: "center",
        });
        doc.text(c.claveUnidad.claveUnidad, 148, yCarta, { align: "center" });
        let materialPeligroso = "NO";
        if (c.materialPeligroso != null) {
          materialPeligroso = c.materialPeligroso;
        }
        doc.text(materialPeligroso, 170, yCarta, { align: "center" });

        doc.text(formatoMilesConDosDecimales(c.pesoEnKg), 200, yCarta, {
          align: "right",
        });
        if (bienesTransp_Height < descripcion_Height) {
          yCarta += descripcion_Height + 1;
        } else {
          yCarta += bienesTransp_Height + 1;
        }
        doc.setLineDash([1]);
        doc.setLineWidth(0.2);
        doc.line(10, yCarta - 3, 202, yCarta - 3);
        let espacioDisponible = doc.internal.pageSize.height - 30;
        let dif = yCarta > espacioDisponible;
        if (dif) {
          doc.addPage();
          yCarta = 10;
        }
      }
      doc.setFontSize(10);

      // APARTADO PERMISO SCT
      //VALIDAMOS SI VA EL SALTO DE PAGINA
      let espacioDisponiblePermiso = doc.internal.pageSize.height - 25;
      let difPermiso = yCarta > espacioDisponiblePermiso;
      if (difPermiso) {
        doc.addPage();
        yCarta = 4;
      }
      doc.setLineDash([0]);
      doc.setFont("helvetica", "bold");
      doc.text("PERMISO SCT", 100, (yCarta += 6), { align: "center" });
      doc.setLineWidth(0.6);
      yCarta += 1;
      doc.line(10, yCarta, 202, yCarta);
      yCarta += 3;
      doc.text("Permiso SCT", 80, yCarta + 1, { align: "center" });
      doc.text("Num. permiso SCT", 170, yCarta + 1, { align: "center" });
      doc.setFont("helvetica", "normal");
      yCarta += 3;
      let permSCT_ = doc.splitTextToSize(
        ObjCarta.mercancias.autotransporte.permSCT.tipoPermiso,
        110
      );
      let permSCT_Height = doc.getTextDimensions(permSCT_).h;
      doc.text(permSCT_, 80, yCarta + 1, { align: "center" });
      doc.text(
        ObjCarta.mercancias.autotransporte.numPermisoSCT,
        170,
        yCarta + 1,
        { align: "center" }
      );
      yCarta += permSCT_Height;
      //IDENTIFICADOR VEHICULAR
      //VALIDAMOS SI VA EL SALTO DE PAGINA
      let espacioDisponibleIdentificador = doc.internal.pageSize.height - 25;
      let difIdentificador = yCarta > espacioDisponibleIdentificador;
      if (difIdentificador) {
        doc.addPage();
        yCarta = 4;
      }
      doc.setFont("helvetica", "bold");
      doc.text("IDENTIFICADOR VEHICULAR", 100, (yCarta += 6), {
        align: "center",
      });
      doc.setLineWidth(0.6);
      yCarta += 1;
      doc.line(10, yCarta, 202, yCarta);
      doc.text("Configuración vehicular", 100, (yCarta += 6), {
        align: "center",
      });
      doc.setFont("helvetica", "normal");
      doc.text(
        ObjCarta.mercancias.autotransporte.identificadorVehicular
          .configVehicular.configAutotransporte,
        100,
        (yCarta += 4),
        { align: "center" }
      );
      yCarta += 6;
      doc.setFont("helvetica", "bold");
      doc.text("Placa VM", 40, yCarta, { align: "center" });
      doc.text("Peso bruto vehicular", 100, yCarta, { align: "center" });
      doc.text("Año / modelo VM", 160, yCarta, { align: "center" });
      doc.setFont("helvetica", "normal");
      yCarta += 4;
      doc.text(
        ObjCarta.mercancias.autotransporte.identificadorVehicular.placaVM,
        40,
        yCarta,
        { align: "center" }
      );
      doc.text(
        formatoMilesConDosDecimales(
          ObjCarta.mercancias.autotransporte.identificadorVehicular
            .pesoBrutoVehicular
        ),
        100,
        yCarta,
        { align: "center" }
      );
      let anioModeloVM =
        ObjCarta.mercancias.autotransporte.identificadorVehicular.anioModeloVM.toString();
      doc.text(anioModeloVM, 160, yCarta, { align: "center" });
      //SEGUROS
      //VALIDAMOS SI VA EL SALTO DE PAGINA
      let espacioDisponibleSeguros = doc.internal.pageSize.height - 25;
      let difSeguros = yCarta > espacioDisponibleSeguros;
      if (difSeguros) {
        doc.addPage();
        yCarta = 4;
      }
      doc.setFont("helvetica", "bold");
      doc.text("SEGUROS", 100, (yCarta += 6), { align: "center" });
      doc.setLineWidth(0.6);
      yCarta += 1;
      doc.line(10, yCarta, 202, yCarta);
      yCarta += 4;
      doc.text("Aseguradora responsabilidad civil", 60, yCarta, {
        align: "center",
      });
      doc.text("Póliza resposnabilidad civil", 150, yCarta, {
        align: "center",
      });
      yCarta += 4;
      doc.setFont("helvetica", "normal");
      doc.text(
        ObjCarta.mercancias.autotransporte.seguros.aseguraRespCivil,
        60,
        yCarta,
        { align: "center" }
      );
      doc.text(
        ObjCarta.mercancias.autotransporte.seguros.polizaRespCivil,
        150,
        yCarta,
        { align: "center" }
      );
      if (
        ObjCarta.mercancias.autotransporte.seguros.aseguraMedAmbiente != null
      ) {
        if (
          ObjCarta.mercancias.autotransporte.seguros.aseguraMedAmbiente != ""
        ) {
          yCarta += 5;
          doc.setFont("helvetica", "bold");
          doc.text("Aseguradora medio ambiente", 60, yCarta, {
            align: "center",
          });
          doc.text("Póliza medio ambiente", 150, yCarta, { align: "center" });
          yCarta += 4;
          doc.setFont("helvetica", "normal");
          doc.text(
            ObjCarta.mercancias.autotransporte.seguros.aseguraMedAmbiente,
            60,
            yCarta,
            { align: "center" }
          );
          doc.text(
            ObjCarta.mercancias.autotransporte.seguros.polizaMedAmbiente,
            150,
            yCarta,
            { align: "center" }
          );
        }
      }
      if (ObjCarta.mercancias.autotransporte.seguros.aseguraCarga != null) {
        if (ObjCarta.mercancias.autotransporte.seguros.aseguraCarga != "") {
          yCarta += 5;
          doc.setFont("helvetica", "bold");
          doc.text("Aseguradora de la carga", 50, yCarta, { align: "center" });
          doc.text("Póliza de la carga", 100, yCarta, { align: "center" });
          doc.text("Prima del seguro", 170, yCarta, { align: "center" });
          yCarta += 4;
          doc.setFont("helvetica", "normal");
          doc.text(
            ObjCarta.mercancias.autotransporte.seguros.aseguraCarga,
            50,
            yCarta,
            { align: "center" }
          );
          doc.text(
            ObjCarta.mercancias.autotransporte.seguros.polizaCarga,
            100,
            yCarta,
            { align: "center" }
          );
          doc.text(
            formatoMilesConDosDecimales(
              ObjCarta.mercancias.autotransporte.seguros.primaSeguro
            ),
            170,
            yCarta,
            { align: "center" }
          );
        }
      }

      //REMOLQUES
      //VALIDAMOS SI VA EL SALTO DE PAGINA
      let espacioDisponibleRemolque = doc.internal.pageSize.height - 25;
      let difRemolque = yCarta > espacioDisponibleRemolque;
      if (difRemolque) {
        doc.addPage();
        yCarta = 4;
      }
      if (ObjCarta.mercancias.autotransporte.remolques.length != 0) {
        doc.setFont("helvetica", "bold");
        doc.text("REMOLQUES", 100, (yCarta += 6), { align: "center" });
        doc.setLineWidth(0.6);
        yCarta += 1;
        doc.line(10, yCarta, 202, yCarta);
        yCarta += 4;
        doc.setFont("helvetica", "bold");
        doc.text("Sub tipo remolque", 10, yCarta + 1, { align: "left" });
        doc.text("Placa", 100, yCarta + 1, { align: "left" });
        doc.setLineWidth(0.4);
        yCarta += 2;
        doc.line(10, yCarta, 202, yCarta);
        yCarta += 4;
        doc.setFont("helvetica", "normal");
        for (let r of ObjCarta.mercancias.autotransporte.remolques) {
          doc.text(r.subTipoRem.subTipoRem, 10, yCarta + 1, { align: "left" });
          doc.text(r.placa, 100, yCarta + 1, { align: "left" });
          yCarta += 4;
          doc.setLineDash([1]);
          doc.setLineWidth(0.2);
          doc.line(10, yCarta - 2, 202, yCarta - 2);
          let espacioDisponible = doc.internal.pageSize.height - 30;
          let dif = yCarta > espacioDisponible;
          if (dif) {
            doc.addPage();
            yCarta = 10;
          }
        }
      }

      //FIGURAS DEL TRANSPORTE
      doc.setFont("helvetica", "bold");
      doc.text("FIGURAS DEL TRANSPORTE", 100, (yCarta += 6), {
        align: "center",
      });
      doc.setLineWidth(0.6);
      yCarta += 1;
      doc.line(10, yCarta, 202, yCarta);
      yCarta += 4;
      doc.setFont("helvetica", "bold");
      doc.text("RFC Figura", 10, yCarta + 1, { align: "left" });
      doc.text("Nombre figura", 50, yCarta + 1, { align: "left" });
      doc.text("Tipo figura", 140, yCarta + 1, { align: "left" });
      doc.setLineWidth(0.4);
      yCarta += 2;
      doc.line(10, yCarta, 202, yCarta);
      yCarta += 4;
      doc.setFont("helvetica", "normal");
      for (let f of ObjCarta.figuraTransporte) {
        doc.text(f.rfcFigura, 10, yCarta + 1, { align: "left" });
        doc.text(f.nombreFigura, 50, yCarta + 1, { align: "left" });
        doc.text(f.tipoFigura.tipoFigura, 140, yCarta + 1, { align: "left" });
        yCarta += 4;
        //LINEA ENTRE FIGURAS
        doc.setLineDash([1]);
        doc.setLineWidth(0.2);
        doc.line(10, yCarta - 2, 202, yCarta - 2);

        //CALCULA EL ESPACIO DISPONIBLE
        let espacioDisponible = doc.internal.pageSize.height - 30;
        let dif = yCarta > espacioDisponible;
        if (dif) {
          doc.addPage();
          yCarta = 10;
        }
      }
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
        // yTotales += 5;
      }

      //AGREGAMOS LAS NOTAS SI ES QUE LAS TIENE
      if (ObjComprobante.notas != "") {
        doc.setLineDash([0]);
        doc.setFontSize(10);
        let xNotas = 10;
        let yNotas = yTotales - 5;
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

export { CartaPorte30Base64 };
