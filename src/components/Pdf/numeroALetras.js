var numeroALetras = (function () {
    function Unidades(num) {

        switch (num) {
            case 1:
                return 'UN';
            case 2:
                return 'DOS';
            case 3:
                return 'TRES';
            case 4:
                return 'CUATRO';
            case 5:
                return 'CINCO';
            case 6:
                return 'SEIS';
            case 7:
                return 'SIETE';
            case 8:
                return 'OCHO';
            case 9:
                return 'NUEVE';
        }

        return '';
    } //Unidades()

    function Decenas(num) {

        let decena = Math.floor(num / 10);
        let unidad = num - (decena * 10);

        switch (decena) {
            case 1:
                switch (unidad) {
                    case 0:
                        return 'DIEZ';
                    case 1:
                        return 'ONCE';
                    case 2:
                        return 'DOCE';
                    case 3:
                        return 'TRECE';
                    case 4:
                        return 'CATORCE';
                    case 5:
                        return 'QUINCE';
                    default:
                        return 'DIECI' + (unidad === 6 ? 'SÉIS' : Unidades(unidad));
                }
            case 2:
                switch (unidad) {
                    case 0:
                        return 'VEINTE';
                    default:
                        // veintiuno->veintiún, veintidós, veintitrés y veintiséis llevan tilde
                        // al combinarse (aunque "uno","dos","tres","seis" solos no la llevan)
                        return 'VEINTI' + ({ 1: 'ÚN', 2: 'DÓS', 3: 'TRÉS', 6: 'SÉIS' }[unidad] || Unidades(unidad));
                }
            case 3:
                return DecenasY('TREINTA', unidad);
            case 4:
                return DecenasY('CUARENTA', unidad);
            case 5:
                return DecenasY('CINCUENTA', unidad);
            case 6:
                return DecenasY('SESENTA', unidad);
            case 7:
                return DecenasY('SETENTA', unidad);
            case 8:
                return DecenasY('OCHENTA', unidad);
            case 9:
                return DecenasY('NOVENTA', unidad);
            case 0:
                return Unidades(unidad);
        }
    } //Unidades()

    function DecenasY(strSin, numUnidades) {
        if (numUnidades > 0)
            return strSin + ' Y ' + Unidades(numUnidades)

        return strSin;
    } //DecenasY()

    function Centenas(num) {
        let centenas = Math.floor(num / 100);
        let decenas = num - (centenas * 100);
        let strDecenas = decenas > 0 ? ' ' + Decenas(decenas) : '';

        switch (centenas) {
            case 1:
                if (decenas > 0)
                    return 'CIENTO' + strDecenas;
                return 'CIEN';
            case 2:
                return 'DOSCIENTOS' + strDecenas;
            case 3:
                return 'TRESCIENTOS' + strDecenas;
            case 4:
                return 'CUATROCIENTOS' + strDecenas;
            case 5:
                return 'QUINIENTOS' + strDecenas;
            case 6:
                return 'SEISCIENTOS' + strDecenas;
            case 7:
                return 'SETECIENTOS' + strDecenas;
            case 8:
                return 'OCHOCIENTOS' + strDecenas;
            case 9:
                return 'NOVECIENTOS' + strDecenas;
        }

        return Decenas(decenas);
    } //Centenas()

    // NOTA: "num" aquí es el grupo de MILES (0 a 999,999), no el número completo.
    // Antes se usaba Centenas(cientos) para nombrar el grupo, pero Centenas()
    // solo entiende 0-999 — por eso se rompía con cifras de "mil millones" en adelante.
    // Ahora se usa Miles(cientos) recursivamente, que sí sabe manejar hasta 999,999.
    function Seccion(num, divisor, strSingular, strPlural, nombrarGrupo) {
        let cientos = Math.floor(num / divisor)
        let resto = num - (cientos * divisor)

        let letras = '';

        if (cientos > 0) {
            if (cientos > 1)
                letras = nombrarGrupo(cientos) + ' ' + strPlural;
            else
                letras = strSingular;
        }

        return { letras, resto };
    } //Seccion()

    function Miles(num) {
        let divisor = 1000;
        let { letras: strMiles, resto } = Seccion(num, divisor, 'MIL', 'MIL', Centenas);
        let strCentenas = Centenas(resto);

        return [strMiles, strCentenas].filter(Boolean).join(' ');
    } //Miles()

    function Millones(num) {
        let divisor = 1000000;
        // "DE" solo aplica cuando el millón es EXACTO (sin resto): "UN MILLÓN DE PESOS".
        // Si hay resto ("UN MILLÓN DOSCIENTOS MIL PESOS"), no lleva "DE".
        let esExacto = (num % divisor) === 0;
        let { letras: strMillones, resto } = Seccion(
            num, divisor,
            esExacto ? 'UN MILLÓN DE' : 'UN MILLÓN',
            esExacto ? 'MILLONES DE' : 'MILLONES',
            Miles // <- antes era Centenas; así ya soporta grupos de millones > 999 (miles de millones)
        );
        let strMiles = Miles(resto);

        return [strMillones, strMiles].filter(Boolean).join(' ');
    } //Millones()

    return function NumeroALetras(num, currency) {
        currency = currency || {};
        let data = {};

        switch (currency) {
            case 'MXN':
                let pesos = {
                    numero: num,
                    enteros: Math.floor(num),
                    centavos: (((Math.round(num * 100)) - (Math.floor(num) * 100))),
                    letrasCentavos: '',
                    letrasMonedaPlural: currency.plural || 'PESOS',
                    letrasMonedaSingular: currency.singular || 'PESO',
                    letrasMonedaCentavoPlural: currency.centPlural || 'Centavos',
                    letrasMonedaCentavoSingular: currency.centSingular || 'Centavos',
                    monedaS: currency.moneda || 'M.N.'
                };
                data = { ...pesos }
                break;
            case 'USD':
                let dolares = {
                    numero: num,
                    enteros: Math.floor(num),
                    centavos: (((Math.round(num * 100)) - (Math.floor(num) * 100))),
                    letrasCentavos: '',
                    letrasMonedaPlural: currency.plural || 'DÓLARES',
                    letrasMonedaSingular: currency.singular || 'DÓLAR',
                    letrasMonedaCentavoPlural: currency.centPlural || 'Centavos',
                    letrasMonedaCentavoSingular: currency.centSingular || 'Centavos',
                    monedaS: currency.moneda || 'USD'
                };
                data = { ...dolares }
                break;
            case 'EUR':
                let euros = {
                    numero: num,
                    enteros: Math.floor(num),
                    centavos: (((Math.round(num * 100)) - (Math.floor(num) * 100))),
                    letrasCentavos: '',
                    letrasMonedaPlural: currency.plural || 'EUROS',
                    letrasMonedaSingular: currency.singular || 'EURO',
                    letrasMonedaCentavoPlural: currency.centPlural || 'Centavos',
                    letrasMonedaCentavoSingular: currency.centSingular || 'Centavos',
                    monedaS: currency.moneda || 'EUR'
                };
                data = { ...euros }
                break;
        }

        if (data.centavos >= 0) {
            data.letrasCentavos = 'CON ' + (function () {
                // padStart asegura "01/100" en vez de "1/100"
                let centavosTexto = String(data.centavos).padStart(2, '0');
                return centavosTexto + '/100 ' + data.monedaS;
            })();
        };

        if (data.enteros == 0)
            return 'CERO ' + data.letrasMonedaPlural + ' ' + data.letrasCentavos;
        if (data.enteros == 1)
            return Millones(data.enteros) + ' ' + data.letrasMonedaSingular + ' ' + data.letrasCentavos;
        else
            return Millones(data.enteros) + ' ' + data.letrasMonedaPlural + ' ' + data.letrasCentavos;
    };

})();
module.exports = {
    numeroALetras,
}