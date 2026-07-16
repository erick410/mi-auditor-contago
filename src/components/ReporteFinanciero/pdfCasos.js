// ============================================================================
// pdfCasos.js
// ----------------------------------------------------------------------------
// Catálogo de "casos" (semáforo) para los textos interpretativos del PDF.
//
// Un "caso" es: { id, condicion(contexto) => bool, texto(contexto) => string }
// Se evalúan EN ORDEN y se usa el texto del primer caso cuya condición sea
// verdadera. Por eso cada catálogo (casosIva, casosUsoCfdi, etc.) SIEMPRE debe
// terminar con un caso "default" cuya condición sea `() => true`.
//
// Esto te permite seguir agregando casos nuevos sin tocar el generador de PDF:
// solo agregas un objeto más al arreglo correspondiente, ANTES del default
// (el orden importa: el primero que aplique gana).
// ============================================================================

export const MESES = [
    "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
    "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE",
];

// ---------------------------------------------------------------------------
// Utilidades compartidas por los casos
// ---------------------------------------------------------------------------

export function money(valor, moneda = "MXN") {
    const num = Number(valor) || 0;
    try {
        return new Intl.NumberFormat("es-MX", { style: "currency", currency: moneda }).format(num);
    } catch (e) {
        return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(num);
    }
}

// Dado un mes en letra ("JUNIO"), regresa el mes anterior ("MAYO").
// Si no lo encuentra o es el primero, regresa null.
export function mesAnterior(mesLabel) {
    if (!mesLabel) return null;
    const idx = MESES.indexOf(String(mesLabel).toUpperCase());
    if (idx <= 0) return null;
    return MESES[idx - 1];
}

// Evalúa un catálogo de casos contra un contexto y regresa el texto del
// primer caso que aplique. Si ninguno aplica (no debería pasar si hay
// default), regresa cadena vacía.
export function evaluarCasos(catalogo, contexto) {
    for (const caso of catalogo) {
        try {
            if (caso.condicion(contexto)) {
                return caso.texto(contexto);
            }
        } catch (e) {
            console.log(`Error evaluando caso "${caso.id}":`, e);
        }
    }
    return "";
}

// Frase FIJA reutilizable: recordatorio de vencimiento (día 17 del mes
// siguiente al último mes con impuesto a cargo). Aparece en IVA, ISR y
// Pagos Provisionales en tu reporte original.
// mesFinalLabel = último mes del periodo consultado (ej. "JUNIO")
export function fraseVencimiento(mesFinalLabel) {
    const anterior = mesAnterior(mesFinalLabel);
    if (!anterior || !mesFinalLabel) return "";
    return `Así mismo, el impuesto (a cargo) del mes de ${anterior} se entera a más tardar el día 17 de ${mesFinalLabel}.`;
}

// ============================================================================
// CASOS: PAGOS DE IVA
// contexto = { filas, mesInicialLabel, mesFinalLabel, anio }
// ============================================================================
export const casosIvaIntro = [
    {
        id: "iva-intro-sin-datos",
        condicion: ({ filas }) => !filas || filas.length === 0,
        texto: () =>
            "No se encontraron comprobantes suficientes para determinar los pagos de IVA del periodo.",
    },
    {
        id: "iva-intro-default",
        condicion: () => true,
        texto: ({ mesInicialLabel, mesFinalLabel, anio }) =>
            `Según se desprende de la información registrada en el sistema MiAuditor, en la comparativa de los pagos definitivos de IVA del período de ${mesInicialLabel} a ${mesFinalLabel} del ${anio}, entre lo que determina el sistema con base en comprobantes y lo que se declaró ante el SAT, se observan diferencias positivas y negativas. Las positivas son cantidades que faltó pagar (a cargo), y las negativas son cantidades que se pagaron de más (a favor).`,
    },
];

export const casosIvaOutro = [
    {
        id: "iva-outro-sin-diferencias",
        condicion: ({ filas }) =>
            filas.every((f) => !f.ivaCargo && !f.ivaFavor),
        texto: () =>
            "No se detectaron diferencias entre el IVA determinado por el sistema y el declarado ante el SAT en el periodo.",
    },
    {
        id: "iva-outro-solo-cargo",
        condicion: ({ filas }) => filas.some((f) => f.ivaCargo > 0) && !filas.some((f) => f.ivaFavor > 0),
        texto: ({ mesFinalLabel }) =>
            `Las diferencias positivas pueden ser observadas por la autoridad y requeridas su aclaración. ${fraseVencimiento(mesFinalLabel)}`,
    },
    {
        id: "iva-outro-default",
        condicion: () => true,
        texto: ({ mesFinalLabel }) =>
            `Las diferencias positivas pueden ser observadas por la autoridad y requeridas su aclaración. Las negativas se acreditan en los pagos posteriores o se solicita su devolución. ${fraseVencimiento(mesFinalLabel)}`,
    },
];

// ============================================================================
// CASOS: RETENCIONES DE ISR
// contexto = { filas, categoria, mesFinalLabel }
// categoria: 'sueldos' | 'asimilados' | 'otros' | 'arrendamientos' |
//            'honorarios' | 'demasIngresos' | 'isrRetenidoFavor'
// ============================================================================

// Categorías tipo "retención" pura (sueldos/asimilados/otros): una diferencia
// negativa aquí normalmente solo significa que se retuvo de más o de menos,
// no representa "pago de lo indebido" recuperable.
const CATEGORIAS_RETENCION_SIMPLE = ["sueldos", "asimilados", "otros"];

export const casosIsrOutro = [
    {
        id: "isr-outro-sin-diferencias",
        condicion: ({ filas }) => filas.every((f) => Math.abs(f.diferencia || 0) < 1),
        texto: () => "No se detectaron diferencias relevantes en este concepto durante el periodo.",
    },
    {
        id: "isr-outro-retencion-simple",
        condicion: ({ categoria }) => CATEGORIAS_RETENCION_SIMPLE.includes(categoria),
        texto: ({ mesFinalLabel }) =>
            `Las diferencias positivas pueden ser observadas por la autoridad y requeridas su aclaración. ${fraseVencimiento(mesFinalLabel)}`,
    },
    {
        id: "isr-outro-default",
        condicion: () => true,
        texto: ({ mesFinalLabel }) =>
            `Las diferencias positivas pueden ser observadas por la autoridad y requeridas su aclaración. Las diferencias negativas son pagos de lo indebido, las que se pueden recuperar mediante solicitud de devolución. ${fraseVencimiento(mesFinalLabel)}`,
    },
];

// ============================================================================
// CASOS: PAGOS PROVISIONALES DE ISR
// contexto = { filas, mesFinalLabel }
// ============================================================================
export const casosPagosProvisionalesIntro = [
    {
        id: "pp-intro-sin-datos",
        condicion: ({ filas }) => !filas || filas.length === 0,
        texto: () =>
            "No fue posible determinar los pagos provisionales de ISR del periodo (verifica que el régimen fiscal del año esté configurado).",
    },
    {
        id: "pp-intro-default",
        condicion: () => true,
        texto: () =>
            "En la determinación de los Pagos Provisionales de ISR, el sistema compara lo que determina con base en comprobantes y lo que se declara ante el SAT, encontrando las siguientes diferencias:",
    },
];

export const casosPagosProvisionalesOutro = [
    {
        id: "pp-outro-default",
        condicion: () => true,
        texto: ({ mesFinalLabel }) =>
            `Las diferencias positivas y negativas podrán ser requeridas por la autoridad y se deben a una determinación incorrecta del pago provisional; se reflejarán en el impuesto anual como un financiamiento a cargo o una disminución de impuesto a pagar. ${fraseVencimiento(mesFinalLabel)}`,
    },
];

// ============================================================================
// CASOS: USO DE CFDI
// contexto = { diferencia }  (Emitidos - Recibidos - Nómina, ya sumado)
// ============================================================================
export const casosUsoCfdi = [
    {
        id: "cfdi-neutro",
        condicion: ({ diferencia }) => Math.abs(diferencia) < 1,
        texto: () =>
            "Los ingresos y egresos por uso de CFDI se encuentran prácticamente equilibrados en el periodo.",
    },
    {
        id: "cfdi-negativo",
        condicion: ({ diferencia }) => diferencia < 0,
        texto: ({ diferencia }) =>
            `Se observa una diferencia negativa en cantidad de ${money(diferencia)} que puede representar un financiamiento de proveedores o acreedores.`,
    },
    {
        id: "cfdi-positivo",
        condicion: () => true,
        texto: ({ diferencia }) =>
            `Se observa una diferencia positiva en cantidad de ${money(diferencia)} que puede representar un financiamiento otorgado a clientes, o bien, un margen operativo favorable en el periodo.`,
    },
];

// ============================================================================
// CASOS: COMPARATIVA DE FLUJO (por moneda)
// contexto = { moneda, diferenciaTotal }
// ============================================================================
export const casosFlujo = [
    {
        id: "flujo-negativo",
        condicion: ({ diferenciaTotal }) => diferenciaTotal < 0,
        texto: ({ moneda, diferenciaTotal }) =>
            `En ${moneda}, el flujo recibido superó al emitido por ${money(Math.abs(diferenciaTotal), moneda)} en el periodo, lo que puede representar mayor gasto operativo cobrado de forma inmediata (PUE) frente a los ingresos cobrados de igual forma.`,
    },
    {
        id: "flujo-positivo",
        condicion: () => true,
        texto: ({ moneda, diferenciaTotal }) =>
            `En ${moneda}, el flujo emitido superó al recibido por ${money(diferenciaTotal, moneda)} en el periodo, reflejando una posición de cobro favorable bajo el método PUE.`,
    },
];

// ============================================================================
// CASOS: COMPARATIVA ANUAL (Determinado vs Declarado)
// contexto = { filas }  (concepto, tipo, determinado, declarado, diferencia)
// ============================================================================
export const casosComparativaAnual = [
    {
        id: "ca-sin-declarado",
        condicion: ({ filas }) => filas.every((f) => f.declarado === null || f.declarado === undefined),
        texto: () =>
            "No se encontró una Declaración Anual descargada para comparar; se muestra únicamente lo determinado por el sistema.",
    },
    {
        id: "ca-sin-diferencias",
        condicion: ({ filas }) =>
            filas.every((f) => f.diferencia === null || f.diferencia === undefined || Math.abs(f.diferencia) < 1),
        texto: () =>
            "Lo determinado por el sistema con base en comprobantes coincide, prácticamente sin diferencia, con lo declarado ante el SAT en la Declaración Anual del ejercicio.",
    },
    {
        id: "ca-con-diferencias",
        condicion: () => true,
        texto: ({ filas }) => {
            const utilidad = filas.find((f) => f.concepto === "Utilidad Fiscal");
            const perdida = filas.find((f) => f.concepto === "Pérdida Fiscal");
            const diferenciaRelevante = (utilidad && utilidad.diferencia) || (perdida && perdida.diferencia) || 0;
            const interpretacion =
                diferenciaRelevante > 0
                    ? "Lo determinado por el sistema es mayor a lo declarado, lo que puede indicar ingresos no reconocidos en la declaración o deducciones declaradas por encima de lo comprobado con CFDI."
                    : "Lo declarado ante el SAT es mayor a lo determinado por el sistema, lo que puede deberse a ingresos acumulables adicionales no facturados vía CFDI, o a ajustes fiscales (inflacionarios, de conciliación) no reflejados en los comprobantes.";
            return `Se detectan diferencias entre lo determinado por el sistema y lo declarado en el ejercicio. ${interpretacion} Se recomienda revisar el detalle de cada concepto antes de tomar decisiones basadas en esta comparativa.`;
        },
    },
];
export const casosAntiguedadSaldos = [
    {
        id: "saldos-sin-datos",
        condicion: ({ filas }) => !filas || filas.length === 0,
        texto: ({ tipo }) => `No se registraron cuentas por ${tipo === "cobrar" ? "cobrar" : "pagar"} pendientes en el periodo.`,
    },
    {
        id: "saldos-con-antiguedad",
        condicion: ({ filas }) => filas.some((f) => (f.dias || 0) > 60),
        texto: ({ tipo, filas }) => {
            const vencidos = filas.filter((f) => (f.dias || 0) > 60);
            const suma = vencidos.reduce((a, f) => a + (f.total || 0), 0);
            const sujeto = tipo === "cobrar" ? "clientes" : "proveedores";
            return `Se identificaron ${vencidos.length} comprobante(s) con más de 60 días de antigüedad por un total de ${money(suma)}, lo que amerita dar seguimiento con los ${sujeto} correspondientes.`;
        },
    },
    {
        id: "saldos-default",
        condicion: () => true,
        texto: ({ tipo }) =>
            `Las cuentas por ${tipo === "cobrar" ? "cobrar" : "pagar"} del periodo se encuentran dentro de plazos de crédito razonables (menores a 60 días).`,
    },
];

// ============================================================================
// CONCLUSIÓN: ¿ES SUJETO DE CRÉDITO?
// ----------------------------------------------------------------------------
// IMPORTANTE: los umbrales de "% del capital de trabajo" usados aquí son una
// PROPUESTA DE PUNTO DE PARTIDA (inspirada en el criterio de un reporte
// ejecutivo de referencia), no una regla financiera universal ni asesoría
// profesional. Ajusta estos porcentajes según la política de crédito real
// de tu empresa/comité antes de usarlos en decisiones reales.
// ============================================================================

// ---- Elementos a favor (bullets), construidos solo con datos reales ----
export function construirElementosAFavor({ razonesFinancieras }) {
    const items = [];
    const razones = (razonesFinancieras && razonesFinancieras.razones) || [];

    const buscar = (nombre) => razones.find((r) => r.nombre === nombre);

    const capitalTrabajo = buscar("Capital de Trabajo");
    if (capitalTrabajo && capitalTrabajo.estado === "bueno") {
        items.push(`Capital de trabajo positivo y amplio (${money(capitalTrabajo.valor)}), nivel Bueno.`);
    }

    const rotCxC = buscar("Rotación de Cuentas por Cobrar");
    const diasCobranza = buscar("Días de Cobranza");
    if (rotCxC && rotCxC.estado === "bueno") {
        const detalleDias = diasCobranza ? ` (${diasCobranza.valor.toFixed(1)} días promedio)` : "";
        items.push(`Cobranza eficiente: rotación de cuentas por cobrar de ${rotCxC.valor.toFixed(2)} veces al año${detalleDias}.`);
    }

    const circulante = buscar("Prueba Circulante");
    if (circulante && circulante.estado === "bueno") {
        items.push(`Liquidez de corto plazo adecuada: prueba circulante de ${circulante.valor.toFixed(2)} veces.`);
    }

    const margen = buscar("Margen de Utilidad Neta");
    if (margen && margen.estado === "bueno") {
        items.push(`Rentabilidad saludable: margen de utilidad neta de ${(margen.valor * 100).toFixed(2)}%.`);
    }

    const buenas = razones.filter((r) => r.estado === "bueno");
    if (buenas.length >= 3) {
        items.push(`${buenas.length} de las ${razones.length} razones financieras evaluadas se ubican en nivel Bueno.`);
    }

    if (items.length === 0) {
        items.push("No se identificaron elementos claramente favorables en el análisis disponible.");
    }
    return items;
}

// ---- Elementos en contra (bullets), construidos solo con datos reales ----
export function construirElementosEnContra({ razonesFinancieras, comparativaAnual }) {
    const items = [];
    const razones = (razonesFinancieras && razonesFinancieras.razones) || [];
    const buscar = (nombre) => razones.find((r) => r.nombre === nombre);

    const endeudamiento = buscar("Razón Deuda/Activo");
    const calidadDeuda = buscar("Calidad de la Deuda");
    if (endeudamiento && endeudamiento.estado === "malo") {
        const detalleCalidad =
            calidadDeuda && calidadDeuda.valor >= 0.9
                ? `, y ${(calidadDeuda.valor * 100).toFixed(0)}% de esa deuda vence en el corto plazo`
                : "";
        items.push(`Endeudamiento elevado: ${(endeudamiento.valor * 100).toFixed(2)}% de los activos totales financiado con deuda${detalleCalidad}.`);
    }

    const margen = buscar("Margen de Utilidad Neta");
    const roa = buscar("Rendimiento sobre Activos Totales (ROA)");
    if (margen && margen.estado === "malo") {
        const detalleRoa = roa ? ` y ROA de ${(roa.valor * 100).toFixed(2)}%` : "";
        items.push(`Rentabilidad muy baja: margen neto de ${(margen.valor * 100).toFixed(2)}%${detalleRoa}, por debajo de los niveles considerados aceptables.`);
    }

    const acido = buscar("Prueba del Ácido");
    if (acido && acido.estado === "malo") {
        items.push(`Liquidez inmediata comprometida: prueba del ácido de ${acido.valor.toFixed(2)} veces, por debajo del mínimo recomendado de 1.0.`);
    }

    const rotInv = buscar("Rotación de Inventario");
    const diasInv = buscar("Días de Inventario");
    if (rotInv && rotInv.estado === "malo") {
        const detalleDias = diasInv ? ` (${diasInv.valor.toFixed(1)} días en promedio)` : "";
        items.push(`Rotación de inventario lenta: ${rotInv.valor.toFixed(2)} veces al año${detalleDias}, inmovilizando capital de trabajo.`);
    }

    // Comparativa Anual: deducciones declaradas por encima de lo comprobado
    // (mismo criterio de riesgo fiscal que en tu reporte de referencia)
    if (comparativaAnual && Array.isArray(comparativaAnual.filas)) {
        const deducciones = comparativaAnual.filas.find((f) => f.concepto === "Total de Deducciones Autorizadas");
        if (deducciones && deducciones.diferencia !== null && deducciones.diferencia !== undefined && deducciones.diferencia < 0) {
            items.push(
                `Deducciones declaradas ante el SAT superiores en ${money(Math.abs(deducciones.diferencia))} a lo que soportan los comprobantes — riesgo de observación por la autoridad.`
            );
        }
    }

    if (items.length === 0) {
        items.push("No se identificaron elementos claramente desfavorables en el análisis disponible.");
    }
    return items;
}

// ---- Rango de crédito sugerido (propuesta de punto de partida, AJUSTABLE) ----
export function calcularRangoCredito({ razonesFinancieras }) {
    const resumen = razonesFinancieras && razonesFinancieras.resumen;
    const razones = (razonesFinancieras && razonesFinancieras.razones) || [];
    const capitalTrabajo = razones.find((r) => r.nombre === "Capital de Trabajo");

    if (!resumen || !capitalTrabajo || capitalTrabajo.valor <= 0) {
        return null; // Sin capital de trabajo positivo no hay base objetiva para un rango
    }

    let pctMin;
    let pctMax;
    let nivel;
    if (resumen.porcentajeSalud >= 0.75) {
        pctMin = 0.5;
        pctMax = 0.8;
        nivel = "estándar";
    } else if (resumen.porcentajeSalud >= 0.5) {
        pctMin = 0.3;
        pctMax = 0.55;
        nivel = "conservador, con garantías";
    } else {
        pctMin = 0.15;
        pctMax = 0.3;
        nivel = "muy conservador, condicionado a garantías sólidas";
    }

    return {
        minimo: capitalTrabajo.valor * pctMin,
        maximo: capitalTrabajo.valor * pctMax,
        pctMin,
        pctMax,
        nivel,
        capitalTrabajo: capitalTrabajo.valor,
    };
}

// ---- Veredicto final (texto), combinando salud financiera + rango sugerido ----
export function construirVeredictoCredito({ razonesFinancieras, comparativaAnual }) {
    const resumen = razonesFinancieras && razonesFinancieras.resumen;
    if (!resumen) {
        return "No se cuenta con Razones Financieras calculadas para este ejercicio (falta la Declaración Anual descargada), por lo que no es posible emitir una recomendación de crédito con la metodología de este reporte.";
    }

    let apertura;
    if (resumen.porcentajeSalud >= 0.75) {
        apertura = "La empresa muestra indicadores financieros sólidos y puede considerarse sujeta de crédito bajo condiciones estándar.";
    } else if (resumen.porcentajeSalud >= 0.5) {
        apertura =
            "La empresa puede considerarse sujeta de crédito, pero no bajo condiciones estándar ni con un límite amplio; se recomienda un enfoque acotado y con garantías.";
    } else {
        apertura =
            "Los indicadores financieros evaluados muestran señales de alerta relevantes; no se recomienda otorgar crédito sin garantías sólidas y sin antes resolver los riesgos identificados.";
    }

    const rango = calcularRangoCredito({ razonesFinancieras });
    let textoMonto;
    if (rango) {
        textoMonto = ` Con base en el capital de trabajo disponible (${money(rango.capitalTrabajo)}), se sugiere un monto orientativo de entre ${money(rango.minimo)} y ${money(rango.maximo)} (equivalente al ${(rango.pctMin * 100).toFixed(0)}%–${(rango.pctMax * 100).toFixed(0)}% del capital de trabajo), bajo un esquema ${rango.nivel}.`;
    } else {
        textoMonto = " No fue posible sugerir un monto orientativo porque el capital de trabajo disponible es negativo, cero, o no se pudo determinar.";
    }

    return `${apertura}${textoMonto} Esta cifra es una referencia orientativa derivada del análisis de razones financieras y de los datos fiscales declarados ante el SAT; NO sustituye un proceso formal de análisis y aprobación crediticia, el cual debe incorporar además estados financieros dictaminados, historial de pago con otros acreedores, y las garantías reales ofrecidas por la empresa.`;
}