// ============================================================================
// obtenerDeclaracionAnualDeclarada.js
// ----------------------------------------------------------------------------
// Busca en el historial de Declaración Anual (mismo backend que usa
// DeclaracionAnualPage.vue) la solicitud COMPLETADA más reciente para un
// ejercicio dado, descarga el archivo, lo descomprime (viene como .zip con
// PDF + XLSX cuando formato = 'ambos') y deja el ArrayBuffer del .xlsx listo
// para que CUALQUIER parser lo use (Comparativa Anual, Razones Financieras,
// futuros reportes anuales...) sin descargar/descomprimir dos veces.
//
// Requiere:
//   npm install jszip
//   (ya tienes 'axios' y 'xlsx' en el proyecto)
// ============================================================================

import axios from "axios";
import JSZip from "jszip";
import { extraerDeterminacionAnualDesdeXlsx } from "./parseDeclaracionAnualXlsx";

const BASE_URL = "https://descargasat.contago.com.mx/api/Descarga";

// Cache en memoria por sesión: evita volver a descargar/descomprimir el mismo
// xlsx si dentro del mismo Reporte General se usa tanto en Comparativa Anual
// como en Razones Financieras. Se limpia sola al recargar la página.
const cacheXlsxPorRfcYEjercicio = new Map();

// Busca, dentro de un historial ya descargado, el registro COMPLETADO más
// reciente para el ejercicio pedido. tipoDocumento por defecto 'anual_todas'
// (el mismo que usa DeclaracionAnualPage.vue).
function buscarRegistroAnual(registros, ejercicio, tipoDocumento = "anual_todas") {
    const candidatos = (registros || []).filter(
        (r) =>
            r.tipoDocumento === tipoDocumento &&
            String(r.ejercicio) === String(ejercicio) &&
            r.estado === "COMPLETADO"
    );
    if (candidatos.length === 0) return null;

    // El más reciente por fecha de solicitud
    return candidatos.sort((a, b) => new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud))[0];
}

// Dado el ArrayBuffer de la respuesta de /Archivo/{rfc}/{id}, regresa el
// ArrayBuffer del .xlsx que contiene — ya sea directo, o descomprimiendo
// el .zip si viene empaquetado con el PDF.
async function obtenerArrayBufferXlsx(arrayBuffer, nombreArchivo) {
    const nombre = (nombreArchivo || "").toLowerCase();

    // Caso simple: el archivo YA es el xlsx (formato = 'excel' en la solicitud)
    if (nombre.endsWith(".xlsx")) {
        return arrayBuffer;
    }

    // Caso normal cuando formato = 'ambos': viene un .zip con PDF + XLSX
    const zip = await JSZip.loadAsync(arrayBuffer);
    const entradaXlsx = Object.values(zip.files).find(
        (f) => !f.dir && f.name.toLowerCase().endsWith(".xlsx")
    );

    if (!entradaXlsx) {
        throw new Error(
            `El archivo descargado no contiene ningún .xlsx (archivos dentro del zip: ${Object.keys(zip.files).join(", ")}).`
        );
    }

    return entradaXlsx.async("arraybuffer");
}

/**
 * Descarga (y descomprime si hace falta) el .xlsx de la última Declaración
 * Anual COMPLETADA para un ejercicio. Es la pieza COMPARTIDA que reutilizan
 * tanto Comparativa Anual como Razones Financieras — así el usuario nunca
 * tiene que "subir" ni descargar el archivo dos veces.
 *
 * @param {string} rfc
 * @param {string|number} ejercicio
 * @returns {Promise<null | { arrayBufferXlsx: ArrayBuffer, nombreArchivoOrigen: string, fechaSolicitud: string }>}
 *   Regresa null si no hay ninguna declaración anual COMPLETADA para ese ejercicio.
 */
export async function obtenerXlsxDeclaracionAnual(rfc, ejercicio) {
    const claveCache = `${rfc}__${ejercicio}`;
    if (cacheXlsxPorRfcYEjercicio.has(claveCache)) {
        return cacheXlsxPorRfcYEjercicio.get(claveCache);
    }

    // 1) Historial
    const { data: historial } = await axios.get(`${BASE_URL}/Historial/${rfc}`);
    if (!historial || !historial.exito) {
        throw new Error("No se pudo consultar el historial de Declaración Anual.");
    }

    const registro = buscarRegistroAnual(historial.registros, ejercicio);
    if (!registro) {
        return null; // No hay declaración anual completada para ese ejercicio
    }

    // 2) Descargar el archivo (zip o xlsx directo) como ArrayBuffer
    const respuestaArchivo = await axios.get(`${BASE_URL}/ArchivoZip/${rfc}/${registro.id}`, {
        responseType: "arraybuffer",
    });

    // 3) Descomprimir si hace falta, y quedarnos con el ArrayBuffer del xlsx
    const arrayBufferXlsx = await obtenerArrayBufferXlsx(respuestaArchivo.data, registro.nombreArchivo);

    const resultado = {
        arrayBufferXlsx,
        nombreArchivoOrigen: registro.nombreArchivo || "",
        fechaSolicitud: registro.fechaSolicitud || "",
    };

    cacheXlsxPorRfcYEjercicio.set(claveCache, resultado);
    return resultado;
}

/**
 * Obtiene la "Determinación Declarada" (Coeficiente de Utilidad, Ingresos
 * Acumulables, Deducciones Autorizadas, Utilidad/Pérdida Fiscal) de la última
 * Declaración Anual completada para un ejercicio — para la sección
 * Comparativa Anual.
 *
 * @param {string} rfc
 * @param {string|number} ejercicio - año de la declaración anual, ej. 2024
 * @param {object} XLSX - el módulo 'xlsx' (SheetJS): import * as XLSX from 'xlsx'
 * @returns {Promise<null | {
 *   anio: number|null,
 *   coeficienteUtilidad: number,
 *   ingresosAcumulables: number,
 *   deduccionesAutorizadas: number,
 *   utilidadFiscal: number,
 *   perdidaFiscal: number,
 *   nombreArchivoOrigen: string,
 *   fechaSolicitud: string,
 * }>}
 *   Regresa null si no hay ninguna declaración anual COMPLETADA para ese ejercicio.
 */
export async function obtenerDeterminacionAnualDeclarada(rfc, ejercicio, XLSX) {
    const archivo = await obtenerXlsxDeclaracionAnual(rfc, ejercicio);
    if (!archivo) return null;

    const determinacion = extraerDeterminacionAnualDesdeXlsx(archivo.arrayBufferXlsx, XLSX);

    return {
        ...determinacion,
        nombreArchivoOrigen: archivo.nombreArchivoOrigen,
        fechaSolicitud: archivo.fechaSolicitud,
    };
}