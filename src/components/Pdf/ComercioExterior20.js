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

const ComercioExterior20 = async (
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

      //DATOS DEL CLIENTE
      let xCliente = xCabecera;
      let yCliente = (yCabecera += 4);
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
        (yCliente += 4),
        { align: "left" }
      );
      doc.text(regimenFiscalReceptor, xCliente, (yCliente += 4), {
        align: "left",
      });
      // doc.text(ObjComprobante.cliente.direccion, xCliente, yCliente += 5, { align: 'left' });

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
      if (ObjComprobante.oc != "") {
        doc.text("OC: ", xGenerales, (yGenerales += 5), { align: "left" });
      }

      doc.setFontSize(14);
      // doc.text(ObjComprobante.serie + ' ' + ObjComprobante.folio, 200, yyGenerales += 5, { align: 'right' });
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
      let yDatosPago = (yyGenerales += 4);
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
      yConceptos += 2;
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
          yConceptos += 2;
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

      //APARTADO DEL COMPLEMENTO COMERCIO EXTERIOR
      let yCarta = (yTotales += 4);
      let ObjCarta = ObjComprobante.cartaPorte;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("COMERCIO EXTERIOR", 110, (yCarta += 2), { align: "center" });
      doc.setLineWidth(1);
      yCarta += 1;
      doc.line(xConceptos - 1, yCarta, 202, yCarta);
      doc.setFontSize(10);

      var ce = { ...ObjComprobante.comercioExterior };
      console.log(ce);
      doc.text("Versión", 30, (yCarta += 4), { align: "center" });
      doc.text("Clave de pedimento", 84, yCarta, { align: "center" });
      doc.text("Certificado origen", 164, yCarta, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.text(ce.version, 30, (yCarta += 4), { align: "center" });
      doc.text(ce.clavePedimento.claveDePedimento, 84, yCarta, {
        align: "center",
      });
      doc.text(ce.certificadoOrigen.certificadoOrigen, 164, yCarta, {
        align: "center",
      });

      doc.setFont("helvetica", "bold");
      doc.text("Incoterm", 60, (yCarta += 5), { align: "center" });
      doc.text("Tipo de cambio USD", 124, yCarta, { align: "center" });
      doc.text("Total USD", 164, yCarta, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.text(ce.incoterm.incoterm, 60, (yCarta += 4), { align: "center" });
      doc.text(formatoMilesConSeisDecimales(ce.tipoCambioUSD), 124, yCarta, {
        align: "center",
      });
      doc.text(formatoNumerico(ce.totalUSD), 164, yCarta, { align: "center" });

      //EMISOR
      doc.setFont("helvetica", "bold");
      yCarta += 6;
      doc.text("EMISOR", 50, yCarta, { align: "center" });
      doc.text("RECEPTOR", 140, yCarta, { align: "center" });
      doc.setLineWidth(1);
      yCarta += 1;
      doc.line(xConceptos - 1, yCarta, 100, yCarta);
      doc.setLineWidth(1);
      doc.line(101 - 1, yCarta, 202, yCarta);
      let yEmisor = yCarta;
      let yReceptor = yCarta;
      doc.setFontSize(9);
      doc.text("Nombre:", 10, (yEmisor += 4), { align: "left" });
      doc.setFont("helvetica", "normal");
      doc.text(ce.emisor.nombre, 24, yEmisor, { align: "left" });
      //CURP
      if (ce.emisor.curp != null) {
        if (ce.emisor.curp != "") {
          doc.setFont("helvetica", "bold");
          doc.text("CURP:", 10, (yEmisor += 4), { align: "left" });
          doc.setFont("helvetica", "normal");
          doc.text(ce.emisor.curp, 22, yEmisor, { align: "left" });
        }
      }
      // CALLE
      if (ce.emisor.domicilio.calle != null) {
        if (ce.emisor.domicilio.calle != "") {
          doc.setFont("helvetica", "bold");
          doc.text("Calle:", 10, (yEmisor += 4), { align: "left" });
          doc.setFont("helvetica", "normal");
          doc.text(ce.emisor.domicilio.calle, 20, yEmisor, { align: "left" });
        }
      }
      //NUMERO EXTERIOR
      if (ce.emisor.domicilio.numeroExterior != null) {
        if (ce.emisor.domicilio.numeroExterior != "") {
          doc.setFont("helvetica", "bold");
          doc.text("Num. Ext:", 10, (yEmisor += 4), { align: "left" });
          doc.setFont("helvetica", "normal");
          doc.text(ce.emisor.domicilio.numeroExterior, 26, yEmisor, {
            align: "left",
          });
        }
      }
      //NUMERO INTERIOR
      if (ce.emisor.domicilio.numeroInterior != null) {
        if (ce.emisor.domicilio.numeroInterior != "") {
          doc.setFont("helvetica", "bold");
          doc.text("Num. Int:", 10, (yEmisor += 4), { align: "left" });
          doc.setFont("helvetica", "normal");
          doc.text(ce.emisor.domicilio.numeroInterior, 26, yEmisor, {
            align: "left",
          });
        }
      }
      //COLONIA
      if (ce.emisor.domicilio.colonia != null) {
        if (ce.emisor.domicilio.colonia) {
          doc.setFont("helvetica", "bold");
          doc.text("Colonia:", 10, (yEmisor += 4), { align: "left" });
          doc.setFont("helvetica", "normal");
          doc.text(ce.emisor.domicilio.colonia.colonia, 24, yEmisor, {
            align: "left",
          });
        }
      }
      //LOCALIDAD
      if (ce.emisor.domicilio.localidad != null) {
        if (ce.emisor.domicilio.localidad) {
          doc.setFont("helvetica", "bold");
          doc.text("Localidad:", 10, (yEmisor += 4), { align: "left" });
          doc.setFont("helvetica", "normal");
          doc.text(ce.emisor.domicilio.localidad.localidad, 26, yEmisor, {
            align: "left",
          });
        }
      }
      //REFERENCIA
      if (ce.emisor.domicilio.referencia != null) {
        if (ce.emisor.domicilio.referencia != "") {
          doc.setFont("helvetica", "bold");
          doc.text("Referencia:", 10, (yEmisor += 4), { align: "left" });
          doc.setFont("helvetica", "normal");
          doc.text(ce.emisor.domicilio.referencia, 26, yEmisor, {
            align: "left",
          });
        }
      }
      //MUNICIPIO
      if (ce.emisor.domicilio.municipio != null) {
        if (ce.emisor.domicilio.municipio) {
          doc.setFont("helvetica", "bold");
          doc.text("Municipio:", 10, (yEmisor += 4), { align: "left" });
          doc.setFont("helvetica", "normal");
          doc.text(ce.emisor.domicilio.municipio.municipio, 27, yEmisor, {
            align: "left",
          });
        }
      }
      //ESTADO
      if (ce.emisor.domicilio.estado != null) {
        if (ce.emisor.domicilio.estado) {
          doc.setFont("helvetica", "bold");
          doc.text("Estado:", 10, (yEmisor += 4), { align: "left" });
          doc.setFont("helvetica", "normal");
          doc.text(ce.emisor.domicilio.estado.estado, 23, yEmisor, {
            align: "left",
          });
        }
      }
      //PAIS
      if (ce.emisor.domicilio.pais) {
        doc.setFont("helvetica", "bold");
        doc.text("Pais:", 10, (yEmisor += 4), { align: "left" });
        doc.setFont("helvetica", "normal");
        doc.text(ce.emisor.domicilio.pais.pais, 19, yEmisor, { align: "left" });
      }
      doc.setFont("helvetica", "bold");
      doc.text("Código postal:", 10, (yEmisor += 4), { align: "left" });
      doc.setFont("helvetica", "normal");
      doc.text(ce.emisor.domicilio.codigoPostal, 33, yEmisor, {
        align: "left",
      });
      doc.setFont("helvetica", "bold");

      //RECEPTOR
      let xReceptor = 110;
      //NOMBRE
      doc.text("Nombre:", xReceptor, (yReceptor += 4), { align: "left" });
      doc.setFont("helvetica", "normal");
      doc.text(ce.receptor.nombre, 124, yReceptor, { align: "left" });
      //NUM REG ID TRIB
      if (ce.receptor.numRegIdTrib != "") {
        doc.setFont("helvetica", "bold");
        doc.text("Num. Reg. Id. Trib:", xReceptor, (yReceptor += 4), {
          align: "left",
        });
        doc.setFont("helvetica", "normal");
        doc.text(ce.receptor.numRegIdTrib, xReceptor + 30, yReceptor, {
          align: "left",
        });
      }
      //CALLE
      if (ce.receptor.domicilio.calle != null) {
        if (ce.receptor.domicilio.calle != "") {
          doc.setFont("helvetica", "bold");
          doc.text("Calle:", xReceptor, (yReceptor += 4), { align: "left" });
          doc.setFont("helvetica", "normal");
          doc.text(ce.receptor.domicilio.calle, xReceptor + 10, yReceptor, {
            align: "left",
          });
        }
      }
      //NUMERO EXTERIOR
      if (ce.receptor.domicilio.numeroExterior != null) {
        if (ce.receptor.domicilio.numeroExterior != "") {
          doc.setFont("helvetica", "bold");
          doc.text("Num. Ext:", xReceptor, (yReceptor += 4), { align: "left" });
          doc.setFont("helvetica", "normal");
          doc.text(
            ce.receptor.domicilio.numeroExterior,
            xReceptor + 16,
            yReceptor,
            { align: "left" }
          );
        }
      }
      //NUMERO INTERIOR
      if (ce.receptor.domicilio.numeroInterior != null) {
        if (ce.receptor.domicilio.numeroInterior != "") {
          doc.setFont("helvetica", "bold");
          doc.text("Num. Int:", xReceptor, (yReceptor += 4), { align: "left" });
          doc.setFont("helvetica", "normal");
          doc.text(
            ce.receptor.domicilio.numeroInterior,
            xReceptor + 16,
            yReceptor,
            { align: "left" }
          );
        }
      }
      //COLONIA
      if (ce.receptor.domicilio.colonia != null) {
        if (ce.receptor.domicilio.colonia) {
          doc.setFont("helvetica", "bold");
          doc.text("Colonia:", xReceptor, (yReceptor += 4), { align: "left" });
          doc.setFont("helvetica", "normal");
          doc.text(
            ce.receptor.domicilio.colonia.colonia,
            xReceptor + 14,
            yReceptor,
            { align: "left" }
          );
        }
      }
      //LOCALIDAD
      if (ce.receptor.domicilio.localidad != null) {
        if (ce.receptor.domicilio.localidad) {
          doc.setFont("helvetica", "bold");
          doc.text("Localidad:", xReceptor, (yReceptor += 4), {
            align: "left",
          });
          doc.setFont("helvetica", "normal");
          doc.text(
            ce.receptor.domicilio.localidad.localidad,
            xReceptor + 14,
            yReceptor,
            { align: "left" }
          );
        }
      }
      //REFERENCIA
      if (ce.receptor.domicilio.referencia != null) {
        if (ce.receptor.domicilio.referencia != "") {
          doc.setFont("helvetica", "bold");
          doc.text("Referencia:", xReceptor, (yReceptor += 4), {
            align: "left",
          });
          doc.setFont("helvetica", "normal");
          doc.text(
            ce.receptor.domicilio.referencia,
            xReceptor,
            (yReceptor += 4),
            { align: "left" }
          );
        }
      }
      //MUNICIPIO
      if (ce.receptor.domicilio.municipio != null) {
        if (ce.receptor.domicilio.municipio) {
          doc.setFont("helvetica", "bold");
          doc.text("Municipio:", xReceptor, (yReceptor += 4), {
            align: "left",
          });
          doc.setFont("helvetica", "normal");
          doc.text(
            ce.receptor.domicilio.municipio.municipio,
            xReceptor + 17,
            yReceptor,
            { align: "left" }
          );
        }
      }
      //ESTADO
      if (ce.receptor.domicilio.estado != null) {
        if (ce.receptor.domicilio.estado) {
          doc.setFont("helvetica", "bold");
          doc.text("Estado:", xReceptor, (yReceptor += 4), { align: "left" });
          doc.setFont("helvetica", "normal");
          doc.text(
            ce.receptor.domicilio.estado.estado,
            xReceptor + 13,
            yReceptor,
            { align: "left" }
          );
        }
      }
      //PAIS
      doc.setFont("helvetica", "bold");
      doc.text("Pais:", xReceptor, (yReceptor += 4), { align: "left" });
      doc.setFont("helvetica", "normal");
      doc.text(ce.receptor.domicilio.pais.pais, xReceptor + 9, yReceptor, {
        align: "left",
      });

      //CODIGO POSTAL
      doc.setFont("helvetica", "bold");
      doc.text("Código postal:", xReceptor, (yReceptor += 4), {
        align: "left",
      });
      doc.setFont("helvetica", "normal");
      doc.text(ce.receptor.domicilio.codigoPostal, xReceptor + 23, yReceptor, {
        align: "left",
      });

      //PROPIETARIOS
      if (ce.propietario.length != 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("PROPIETARIOS", 110, (yEmisor += 8), { align: "center" });
        doc.setLineWidth(1);
        doc.line(xConceptos - 1, yEmisor + 1, 202, yEmisor + 1);

        doc.text("Nombre", 10, (yEmisor += 6), { align: "left" });
        doc.text("Num. Reg. Id Trib.", 100, yEmisor, { align: "left" });
        doc.text("Residencia fiscal", 140, yEmisor, { align: "left" });
        doc.setLineWidth(0.5);
        doc.line(xConceptos - 1, yEmisor + 1, 202, yEmisor + 1);
        doc.setFont("helvetica", "normal");
        for (let p of ce.propietario) {
          doc.text(p.nombre, 10, (yEmisor += 6), { align: "left" });
          doc.text(p.numRegIdTrib, 100, yEmisor, { align: "left" });
          doc.text(p.residenciaFiscal.pais, 140, yEmisor, { align: "left" });
          //SALTO DE LINEA SI ES NECESRIO
          let espacioDisponible = doc.internal.pageSize.height - 30;
          let dif = yEmisor > espacioDisponible;
          if (dif) {
            doc.addPage();
            yEmisor = 10;
          }
        }
      }

      //DESTINATARIOS
      if (ce.destinatarios.length != 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("DESTINATARIOS", 110, (yEmisor += 8), { align: "center" });
        doc.setLineWidth(1);
        doc.line(xConceptos - 1, yEmisor + 1, 202, yEmisor + 1);

        doc.text("Nombre", 10, (yEmisor += 6), { align: "left" });
        doc.text("Num. Reg. Id Trib.", 100, yEmisor, { align: "left" });
        doc.text("Domicilio", 132, yEmisor, { align: "left" });
        doc.setLineWidth(0.5);
        doc.line(xConceptos - 1, yEmisor + 1, 202, yEmisor + 1);
        doc.setFont("helvetica", "normal");
        yEmisor += 6;
        for (let p of ce.destinatarios) {
          doc.setFontSize(10);
          doc.text(p.nombre, 10, yEmisor, { align: "left" });
          doc.text(p.numRegIdTrib, 100, yEmisor, { align: "left" });
          doc.setFontSize(6);
          let domicilio_ = doc.splitTextToSize(p.domicilio.domicilio, 70);
          let domicilio_Height = doc.getTextDimensions(domicilio_).h;
          doc.text(domicilio_, 132, yEmisor - 2, { align: "left" });
          // doc.text(p.residenciaFiscal.pais, 140, yEmisor, { align: 'left' });
          //SALTO DE LINEA SI ES NECESRIO
          let espacioDisponible = doc.internal.pageSize.height - 30;
          let dif = yEmisor > espacioDisponible;
          if (dif) {
            doc.addPage();
            yEmisor = 10;
          } else {
            yEmisor += domicilio_Height;
          }
        }
      }

      //MERCANCIAS
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("MERCANCIAS", 110, (yEmisor += 6), { align: "center" });
      doc.setLineWidth(1);
      doc.setFontSize(8);
      doc.line(xConceptos - 1, yEmisor + 1, 202, yEmisor + 1);
      doc.text("No. identificación", 20, (yEmisor += 6), { align: "center" });
      doc.text("Fracción arancelaria.", 36, yEmisor, { align: "left" });
      doc.text("Cantidad aduana", 116, yEmisor, { align: "right" });
      doc.text("Unidad aduana", 132, yEmisor, { align: "center" });
      doc.text("Valor unitario aduana", 176, yEmisor, { align: "right" });
      doc.text("Valor dólares", 200, yEmisor, { align: "right" });
      doc.setLineWidth(0.5);
      doc.line(xConceptos - 1, yEmisor + 1, 202, yEmisor + 1);
      doc.setFont("helvetica", "normal");
      for (let m of ce.mercancias) {
        doc.text(m.noIdentificacion, 20, (yEmisor += 4), { align: "center" });
        doc.text(m.fraccionArancelaria.fraccionArancelaria, 36, yEmisor, {
          align: "left",
        });
        doc.text(formatoCantidad(m.cantidadAduana), 116, yEmisor, {
          align: "right",
        });
        doc.text(m.unidadAduana.unidadAduana, 132, yEmisor, {
          align: "center",
        });
        doc.text(
          formatoMilesConDosDecimales(m.valorUnitarioAduana),
          176,
          yEmisor,
          { align: "right" }
        );
        doc.text(formatoMilesConDosDecimales(m.valorDolares), 200, yEmisor, {
          align: "right",
        });

        let espacioDisponible = doc.internal.pageSize.height - 30;
        let dif = yEmisor > espacioDisponible;
        if (dif) {
          doc.addPage();
          yEmisor = 10;
        } else {
        }
      }

      //SELLOS FISCALES, SOLO CUANDO ESTA TIMBRADO
      let yCertificado = (yEmisor += 2);
      if (ObjEstatus != "Sin timbrar") {
        //INSERTMOS EL SALTO DE PAGINA
        let xQr = 10;
        let yQr = (yEmisor += 5);
        let espacioDisponibleS = doc.internal.pageSize.height - 60;
        let dif = yQr > espacioDisponibleS;
        console.log("QR: ", dif);
        if (dif) {
          doc.addPage();
          yQr = 10;
          yCertificado = -5;
        }

        //CERTIFICADOS
        let xCertificado = 10;
        let yyCertificado = yCertificado;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text("Fecha de Timbrado: ", xCertificado, (yCertificado += 4), {
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
          (yyCertificado += 4),
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
        if (yEmisor < yCertificado) {
          yQr = yCertificado += 4;
        }
        // if (codigoQr) {
        doc.addImage(ObjQr, "PNG", xQr - 4, yQr - 3, 44, 44);
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

export { ComercioExterior20 };
