// ============================================================================
// obtenerRazonesFinancieras.js
// ----------------------------------------------------------------------------
// Junta: descarga/descompresión del xlsx (compartida con Comparativa Anual,
// vía obtenerXlsxDeclaracionAnual) + parser de Balance/Resultados + cálculo
// de las 11 razones financieras.
// ============================================================================

import { obtenerXlsxDeclaracionAnual } from "./obtenerDeclaracionAnualDeclarada";
import { parseEstadosFinancierosParaRazones } from "./parseEstadosFinancierosParaRazones";
import { calcularRazones, agruparPorCategoria, resumenGeneral } from "./razonesFinancieras";

/**
 * @param {string} rfc
 * @param {string|number} ejercicio
 * @param {object} XLSX - import * as XLSX from 'xlsx'
 * @returns {Promise<{
 *   razones: array, categorias: array, resumen: object|null,
 *   advertencias: string[], mensaje: string,
 * }>}
 */
export async function obtenerRazonesFinancieras(rfc, ejercicio, XLSX) {
     
    const vacio = { razones: [], categorias: [], resumen: null, advertencias: [], mensaje: "" };
    if (!rfc || !ejercicio) return vacio;

    try {
        console.log(ejercicio)
        const archivo = await obtenerXlsxDeclaracionAnual(rfc, ejercicio);
        if (!archivo) {
            return {
                ...vacio,
                mensaje: `No se encontró una Declaración Anual completada para el ejercicio ${ejercicio - 1}. No se pueden calcular las Razones Financieras.`,
            };
        }

        const { datos, advertencias } = parseEstadosFinancierosParaRazones(archivo.arrayBufferXlsx, XLSX);
        const razones = calcularRazones(datos);
        const categorias = agruparPorCategoria(razones);
        const resumen = resumenGeneral(razones);

        return { razones, categorias, resumen, advertencias, mensaje: "" };
    } catch (error) {
        console.log("Error en obtenerRazonesFinancieras:", error);
        return { ...vacio, mensaje: error.message || "No se pudieron calcular las Razones Financieras." };
    }
}