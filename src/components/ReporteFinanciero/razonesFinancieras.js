// ============================================================================
// razonesFinancieras.js
// ----------------------------------------------------------------------------
// Portado de tu módulo original, con un fix: en "Margen de Utilidad Neta" el
// operador de precedencia hacía que se evaluara `utilidadNeta || (0 / ventasNetas)`
// en vez de `(utilidadNeta || 0) / ventasNetas` — ya corregido abajo.
//
// Cada razón incluye: categoría, fórmula en texto, y los rangos descritos en
// texto (para mostrarlos en pantalla/PDF), además de las funciones de
// evaluación reales.
// ============================================================================

export function calcularRazones(datos) {
    const {
        activoCirculante, inventarios, pasivoCirculante,
        costoVentas, inventarioPromedio,
        ventasNetas, ventasCredito,
        cuentasPorCobrar, cuentasPorCobrarPromedio,
        pasivoTotal, activoTotal, utilidadNeta,
    } = datos;

    const razones = [];

    razones.push(evaluar({
        categoria: "Liquidez",
        nombre: "Prueba Circulante",
        formula: "Activo Circulante / Pasivo Circulante",
        valor: activoCirculante / pasivoCirculante,
        formato: "veces",
        descripcion: "Mide la capacidad de la empresa para cubrir sus obligaciones de corto plazo usando sus activos de corto plazo.",
        rangos: { bueno: ">= 1.5 veces", regular: "1.0 - 1.5 veces", malo: "< 1.0 veces" },
        bueno: (v) => v >= 1.5,
        regular: (v) => v >= 1 && v < 1.5,
    }));

    razones.push(evaluar({
        categoria: "Liquidez",
        nombre: "Prueba del Ácido",
        formula: "(Activo Circulante − Inventarios) / Pasivo Circulante",
        valor: (activoCirculante - inventarios) / pasivoCirculante,
        formato: "veces",
        descripcion: "Mide la liquidez inmediata de la empresa sin depender de la venta de inventarios, que es el activo circulante menos líquido.",
        rangos: { bueno: ">= 1.0 veces", regular: "0.7 - 1.0 veces", malo: "< 0.7 veces" },
        bueno: (v) => v >= 1,
        regular: (v) => v >= 0.7 && v < 1,
    }));

    razones.push(evaluar({
        categoria: "Liquidez",
        nombre: "Capital de Trabajo",
        formula: "Activo Circulante − Pasivo Circulante",
        valor: activoCirculante - pasivoCirculante,
        formato: "moneda",
        descripcion: "Representa los recursos con los que cuenta la empresa después de cubrir sus obligaciones de corto plazo.",
        rangos: { bueno: "Positivo y creciente", regular: "Positivo pero ajustado", malo: "Negativo" },
        bueno: (v) => v > 0,
        regular: (v) => v === 0,
    }));

    const rotInv = costoVentas / (inventarioPromedio || inventarios);
    razones.push(evaluar({
        categoria: "Actividad",
        nombre: "Rotación de Inventario",
        formula: "Costo de Ventas / Inventario Promedio",
        valor: rotInv,
        formato: "veces",
        descripcion: "Indica cuántas veces al año la empresa vende y repone su inventario. Entre más alta, más eficiente es la gestión de inventarios.",
        rangos: { bueno: ">= 6 veces al año", regular: "3 - 6 veces al año", malo: "< 3 veces al año" },
        bueno: (v) => v >= 6,
        regular: (v) => v >= 3 && v < 6,
    }));

    razones.push(evaluar({
        categoria: "Actividad",
        nombre: "Días de Inventario",
        formula: "365 / Rotación de Inventario",
        valor: 365 / rotInv,
        formato: "dias",
        descripcion: "Días promedio que el inventario permanece almacenado antes de venderse. Entre menos días, mejor.",
        rangos: { bueno: "<= 60 días", regular: "60 - 90 días", malo: "> 90 días" },
        bueno: (v) => v <= 60,
        regular: (v) => v > 60 && v <= 90,
    }));

    const rotCxC = (ventasCredito || ventasNetas) / (cuentasPorCobrarPromedio || cuentasPorCobrar);
    razones.push(evaluar({
        categoria: "Actividad",
        nombre: "Rotación de Cuentas por Cobrar",
        formula: "Ventas a Crédito / Cuentas por Cobrar Promedio",
        valor: rotCxC,
        formato: "veces",
        descripcion: "Indica cuántas veces al año la empresa recupera su cartera de clientes. Entre más alta, más eficiente es la cobranza.",
        rangos: { bueno: ">= 8 veces al año", regular: "4 - 8 veces al año", malo: "< 4 veces al año" },
        bueno: (v) => v >= 8,
        regular: (v) => v >= 4 && v < 8,
    }));

    razones.push(evaluar({
        categoria: "Actividad",
        nombre: "Días de Cobranza",
        formula: "365 / Rotación de Cuentas por Cobrar",
        valor: 365 / rotCxC,
        formato: "dias",
        descripcion: "Días promedio que tarda la empresa en cobrarle a sus clientes. Entre menos días, mejor flujo de efectivo.",
        rangos: { bueno: "<= 30 días", regular: "30 - 60 días", malo: "> 60 días" },
        bueno: (v) => v <= 30,
        regular: (v) => v > 30 && v <= 60,
    }));

    razones.push(evaluar({
        categoria: "Endeudamiento",
        nombre: "Razón Deuda/Activo",
        formula: "Pasivo Total / Activo Total",
        valor: pasivoTotal / activoTotal,
        formato: "porcentaje",
        descripcion: "Proporción de los activos totales de la empresa que está financiada con deuda. Entre más baja, menor riesgo financiero.",
        rangos: { bueno: "<= 40%", regular: "40% - 60%", malo: "> 60%" },
        bueno: (v) => v <= 0.4,
        regular: (v) => v > 0.4 && v <= 0.6,
    }));

    razones.push(evaluar({
        categoria: "Endeudamiento",
        nombre: "Calidad de la Deuda",
        formula: "Pasivo Circulante / Pasivo Total",
        valor: pasivoCirculante / pasivoTotal,
        formato: "porcentaje",
        descripcion: "Proporción de la deuda total que vence en el corto plazo. Entre más baja, mejor calidad (menos presión inmediata de pago).",
        rangos: { bueno: "<= 50%", regular: "50% - 70%", malo: "> 70%" },
        bueno: (v) => v <= 0.5,
        regular: (v) => v > 0.5 && v <= 0.7,
    }));

    // FIX: antes era `utilidadNeta || 0 / ventasNetas` (precedencia incorrecta,
    // ese `0 / ventasNetas` se evaluaba primero y quedaba prácticamente
    // ignorado por el `||`). Ahora sí divide correctamente.
    razones.push(evaluar({
        categoria: "Rentabilidad",
        nombre: "Margen de Utilidad Neta",
        formula: "Utilidad Neta / Ventas Netas",
        valor: (utilidadNeta || 0) / ventasNetas,
        formato: "porcentaje",
        descripcion: "Porcentaje de cada peso vendido que se convierte en utilidad neta, después de todos los gastos e impuestos.",
        rangos: { bueno: ">= 10%", regular: "5% - 10%", malo: "< 5%" },
        bueno: (v) => v >= 0.1,
        regular: (v) => v >= 0.05 && v < 0.1,
    }));

    razones.push(evaluar({
        categoria: "Rentabilidad",
        nombre: "Rendimiento sobre Activos Totales (ROA)",
        formula: "Utilidad Neta / Activo Total",
        valor: (utilidadNeta || 0) / activoTotal,
        formato: "porcentaje",
        descripcion: "Mide la eficiencia con la que la empresa usa sus activos totales para generar utilidad.",
        rangos: { bueno: ">= 5%", regular: "2% - 5%", malo: "< 2%" },
        bueno: (v) => v >= 0.05,
        regular: (v) => v >= 0.02 && v < 0.05,
    }));

    return razones;
}

function evaluar({ categoria, nombre, formula, valor, formato, descripcion, rangos, bueno, regular }) {
    let estado = "malo";
    if (bueno(valor)) estado = "bueno";
    else if (regular(valor)) estado = "regular";

    return {
        categoria, nombre, formula, valor, formato, descripcion, rangos, estado,
        color: estado === "bueno" ? "#21BA45" : estado === "regular" ? "#F2C037" : "#C10015",
        puntaje: estado === "bueno" ? 3 : estado === "regular" ? 2 : 1,
    };
}

export function agruparPorCategoria(razones) {
    const categorias = ["Liquidez", "Actividad", "Endeudamiento", "Rentabilidad"];
    return categorias
        .map((categoria) => {
            const items = razones.filter((r) => r.categoria === categoria);
            if (items.length === 0) return null;
            const promedio = items.reduce((sum, r) => sum + r.puntaje, 0) / items.length;
            return { categoria, items, promedio };
        })
        .filter(Boolean);
}

export function resumenGeneral(razones) {
    const buenas = razones.filter((r) => r.estado === "bueno").length;
    const regulares = razones.filter((r) => r.estado === "regular").length;
    const malas = razones.filter((r) => r.estado === "malo").length;
    const puntajeTotal = razones.reduce((sum, r) => sum + r.puntaje, 0);
    const puntajeMaximo = razones.length * 3;
    const porcentajeSalud = puntajeMaximo > 0 ? puntajeTotal / puntajeMaximo : 0;

    let veredicto = "La empresa muestra señales de alerta importantes en varios indicadores financieros.";
    if (porcentajeSalud >= 0.75) {
        veredicto = "La empresa muestra una salud financiera sólida en la mayoría de los indicadores evaluados.";
    } else if (porcentajeSalud >= 0.5) {
        veredicto = "La empresa muestra una salud financiera aceptable, con áreas de oportunidad claras.";
    }

    return { buenas, regulares, malas, total: razones.length, porcentajeSalud, veredicto };
}

export function formatearValor(valor, formato) {
    if (formato === "porcentaje") return `${(valor * 100).toFixed(2)}%`;
    if (formato === "moneda") return valor.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
    if (formato === "dias") return `${valor.toFixed(1)} días`;
    return `${valor.toFixed(2)} veces`;
}