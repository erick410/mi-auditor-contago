// ============================================================================
// obtenerRazonesFinancieras.js
// ============================================================================

import { obtenerXlsxDeclaracionAnual } from "./obtenerDeclaracionAnualDeclarada";
import { parseEstadosFinancierosParaRazones } from "./parseEstadosFinancierosParaRazones";
import { calcularRazones, agruparPorCategoria, resumenGeneral } from "./razonesFinancieras";

export async function obtenerRazonesFinancieras(rfc, ejercicio, XLSX) {
    const vacio = { razones: [], categorias: [], resumen: null, advertencias: [], mensaje: "" };
    if (!rfc || !ejercicio) return vacio;

    // ---- Paso 1: descarga del xlsx — aquí es donde puede fallar la RED ----
    let archivo = null;
    try {
        archivo = await obtenerXlsxDeclaracionAnual(rfc, ejercicio);
    } catch (error) {
        console.log("Error de RED obteniendo el xlsx de la Declaración Anual:", error);
        // Sin response = nunca llegó al servidor (caído, CORS, timeout, sin internet).
        // Con response = el servidor sí contestó pero con error (404, 500, etc.).
        const esErrorDeRed = !error.response;
        return {
            ...vacio,
            mensaje: esErrorDeRed
                ? "No se pudo conectar con el servidor para obtener la Declaración Anual. Verifica tu conexión e intenta de nuevo."
                : `Ocurrió un error al obtener la Declaración Anual (${error.response.status}). Intenta de nuevo más tarde.`,
        };
    }

    if (!archivo) {
        return {
            ...vacio,
            // ejercicio YA viene como año-1 desde el componente — no se le resta otra vez.
            mensaje: `No se encontró una Declaración Anual completada para el ejercicio ${ejercicio}. No se pueden calcular las Razones Financieras.`,
        };
    }

    // ---- Paso 2: parseo + cálculo — aquí sí son errores de DATOS/lógica ----
    try {
        const { datos, advertencias } = parseEstadosFinancierosParaRazones(archivo.arrayBufferXlsx, XLSX);
        const razones = calcularRazones(datos);
        const categorias = agruparPorCategoria(razones);
        const resumen = resumenGeneral(razones);

        return { razones, categorias, resumen, advertencias, mensaje: "" };
    } catch (error) {
        console.log("Error calculando Razones Financieras:", error);
        return {
            ...vacio,
            mensaje: "El archivo de la Declaración Anual no tiene el formato esperado, por lo que no se pudieron calcular las Razones Financieras.",
        };
    }
}