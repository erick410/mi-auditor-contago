const qr = require('qrcode');

// Función para generar el código QR en base64
async function generarCodigoQR(uuid, re, rr, tt, fe) {
    let ruta = 'https://verificacfdi.facturaelectronica.sat.gob.mx/default.aspx?'
    let id_ = uuid;
    let re_ = re;
    let rr_ = rr;
    let tt_ = tt;
    let fe_ = fe;
    // const cadenaQR = `${ruta}“&id=${id_}&re=${re_}&rr=${rr_}&tt=${rr_}&fe=${fe_}`;
    const cadenaQR = ruta + '&id=' + id_ + '&re=' + re_ + '&rr=' + rr_ + '&tt=' + tt_ + '&fe=' + fe_

    try {
        let base64QR = "";
        await qr.toDataURL(cadenaQR, (err, url) => {
            if (err) {
                throw err;
            }
            base64QR = url.split(',')[1];
        });

        return base64QR;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    generarCodigoQR
};
