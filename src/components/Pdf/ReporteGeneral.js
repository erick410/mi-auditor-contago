import jsPDF from "jspdf";
import axios from "axios";
const CartaPorte30Base64 = async (
  objFacturado
) => {
  return new Promise((resolve, reject) => {
    try {
        const doc = new jsPDF();

        //AGREGAMOS LA MARCA DE AGUA SI LA FACTURA ESTA CANCELADA
        const rutaImagen = require("../../assets/cancelado.png");
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: 0.2 }));
        doc.addImage(rutaImagen, "PNG", 25, 25, 150, 150, "", "FAST", 0);
        doc.restoreGraphicsState();

        const base64 = doc.output("datauristring");
        let nombreDoc = "";
        doc.save(nombreDoc + '.pdf');
        resolve(base64);

    } catch (error) {
      console.log(error);
    }
  });
};

export { CartaPorte30Base64 };