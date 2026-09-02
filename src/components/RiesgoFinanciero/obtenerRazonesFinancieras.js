// ============================================================================
// obtenerRazonesFinancieras.js
// ----------------------------------------------------------------------------
// Único módulo de Razones Financieras dentro de esta carpeta (RiesgoFinanciero).
// Calcula los DOS últimos ejercicios cerrados (los mismos que descarga por
// defecto el panel de Riesgo Financiero: aniosAnual = [actual-1, actual-2]),
// descargando y calculando cada ejercicio con su PROPIA Declaración Anual —
// no depende de que la columna "ejercicio anterior" de un solo Excel venga
// completa.
//
// Reutiliza (sin modificarlos) los módulos que también deben vivir en esta
// misma carpeta:
//   - obtenerDeclaracionAnualDeclarada.js  (obtenerXlsxDeclaracionAnual)
//   - parseEstadosFinancierosParaRazones.js
//   - razonesFinancieras.js  (calcularRazones, agruparPorCategoria, resumenGeneral)
// ============================================================================

import { obtenerXlsxDeclaracionAnual } from "./obtenerDeclaracionAnualDeclarada";
import { parseEstadosFinancierosParaRazones } from "./parseEstadosFinancierosParaRazones";
import { calcularRazones, agruparPorCategoria, resumenGeneral } from "./razonesFinancieras";

function ejercicioVacio(anio, mensaje = "") {
  return { anio, razones: [], categorias: [], resumen: null, advertencias: [], mensaje };
}

// Calcula las Razones Financieras de UN solo ejercicio (una sola Declaración
// Anual descargada). Nunca lanza: cualquier error se convierte en un
// ejercicioVacio() con mensaje explicativo, para que el llamador pueda
// mostrar el otro ejercicio aunque este falle.
async function obtenerRazonesFinancierasDeUnEjercicio(rfc, ejercicio, XLSX) {
  if (!rfc || !ejercicio) return ejercicioVacio(ejercicio, "");

  let archivo = null;
  try {
    archivo = await obtenerXlsxDeclaracionAnual(rfc, ejercicio);
  } catch (error) {
    console.log(`Error de RED obteniendo el xlsx de la Declaración Anual ${ejercicio}:`, error);
    const esErrorDeRed = !error.response;
    return ejercicioVacio(
      ejercicio,
      esErrorDeRed
        ? `No se pudo conectar con el servidor para obtener la Declaración Anual ${ejercicio}. Verifica tu conexión e intenta de nuevo.`
        : `Ocurrió un error al obtener la Declaración Anual ${ejercicio} (${error.response.status}). Intenta de nuevo más tarde.`
    );
  }

  if (!archivo) {
    return ejercicioVacio(
      ejercicio,
      `No se encontró una Declaración Anual completada para el ejercicio ${ejercicio}. No se pueden calcular sus Razones Financieras.`
    );
  }

  try {
    // Nota: aquí solo usamos "datos" (columna del ejercicio propio de ESTE
    // archivo) — no "datosAnterior" — porque cada ejercicio se calcula con
    // su PROPIA Declaración Anual descargada, no con la columna comparativa
    // de la del año siguiente.
    const { datos, advertencias } = parseEstadosFinancierosParaRazones(archivo.arrayBufferXlsx, XLSX);
    const razones = calcularRazones(datos);
    const categorias = agruparPorCategoria(razones);
    const resumen = resumenGeneral(razones);
    return { anio: Number(ejercicio), razones, categorias, resumen, advertencias, mensaje: "" };
  } catch (error) {
    console.log(`Error calculando Razones Financieras del ejercicio ${ejercicio}:`, error);
    return ejercicioVacio(
      ejercicio,
      `El archivo de la Declaración Anual ${ejercicio} no tiene el formato esperado, por lo que no se pudieron calcular sus Razones Financieras.`
    );
  }
}

/**
 * Calcula las Razones Financieras de los DOS últimos ejercicios cerrados
 * (ejercicioMasReciente y ejercicioMasReciente - 1) — los mismos dos que
 * descarga por defecto el panel de Reporte de Riesgo Financiero.
 *
 * @param {string} rfc
 * @param {string|number} ejercicioMasReciente - el más nuevo de los dos (ej. año-1 del reporte)
 * @param {object} XLSX - el módulo 'xlsx' (SheetJS)
 * @returns {Promise<{
 *   actual: { anio, razones, categorias, resumen, advertencias, mensaje },
 *   anterior: { anio, razones, categorias, resumen, advertencias, mensaje },
 *   mensaje: string
 * }>}
 */
export async function obtenerRazonesFinancieras(rfc, ejercicioMasReciente, XLSX) {
  if (!rfc || !ejercicioMasReciente) {
    return {
      actual: ejercicioVacio(ejercicioMasReciente, ""),
      anterior: ejercicioVacio(ejercicioMasReciente ? Number(ejercicioMasReciente) - 1 : null, ""),
      mensaje: "",
    };
  }

  const anioActual = Number(ejercicioMasReciente);
  const anioAnterior = anioActual - 1;

  const [actual, anterior] = await Promise.all([
    obtenerRazonesFinancierasDeUnEjercicio(rfc, anioActual, XLSX),
    obtenerRazonesFinancierasDeUnEjercicio(rfc, anioAnterior, XLSX),
  ]);

  return { actual, anterior, mensaje: "" };
}