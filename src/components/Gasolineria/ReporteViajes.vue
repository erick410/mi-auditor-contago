<template>
  <q-page class="cne-page">
    <!-- ── HEADER ─────────────────────────────────────────────────────── -->
    <div class="cne-header">
      <div class="cne-header__left">
        <span class="cne-header__label">CNE · Unidad de Hidrocarburos</span>
        <h1 class="cne-header__title">Reporte Anexo 1</h1>
        <span class="cne-header__sub"
          >Oficio F00.07.UH/45187/2026 · PL/20815/TRA/OM/2018</span
        >
      </div>
      <div class="cne-header__right">
        <q-btn
          unelevated
          :loading="cargando"
          icon="download"
          label="Exportar Excel"
          class="btn-exportar"
          :disable="!datos.length"
          @click="exportarExcel"
        />
        <q-btn
          unelevated
          :loading="cargando"
          icon="refresh"
          label="Consultar"
          class="btn-consultar"
          @click="cargarDatos"
        />
      </div>
    </div>

    <!-- ── RESUMEN CHIPS ──────────────────────────────────────────────── -->
    <!-- <div v-if="resumen.length" class="cne-chips">
      <div
        v-for="(r, i) in resumen"
        :key="i"
        class="cne-chip"
        :class="chipClass(r.subProducto)"
      >
        <span class="cne-chip__label">{{ r.subProducto }}</span>
        <span class="cne-chip__mes">{{ nombreMes(r.mes) }} {{ r.anio }}</span>
        <span class="cne-chip__litros">{{ formatNum(r.totalLitros) }} L</span>
        <span class="cne-chip__flete">${{ formatNum(r.totalFlete) }}</span>
      </div>
    </div> -->

    <!-- ── ESTADO VACÍO / ERROR ───────────────────────────────────────── -->
    <div v-if="error" class="cne-estado cne-estado--error">
      <q-icon name="error_outline" size="2rem" />
      <span>{{ error }}</span>
    </div>

    <div v-if="!cargando && !datos.length && !error" class="cne-estado">
      <q-icon name="inbox" size="2rem" />
      <span>Presiona <strong>Consultar</strong> para cargar los datos</span>
    </div>

    <!-- ── TABLA ──────────────────────────────────────────────────────── -->
    <div v-if="datos.length" class="cne-tabla-wrapper">
      <q-table
        :data="datos"
        :columns="columnas"
        row-key="folioFiscal"
        flat
        dense
        :pagination.sync="paginacion"
        :loading="cargando"
        class="cne-tabla"
      >
        <!-- Subproducto con badge de color -->
        <template v-slot:body-cell-subProducto="props">
          <q-td :props="props">
            <span class="badge" :class="badgeClass(props.value)">
              {{ props.value }}
            </span>
          </q-td>
        </template>

        <!-- Volumen formateado -->
        <template v-slot:body-cell-volumenLitros="props">
          <q-td :props="props" class="text-right">
            {{ formatNum(props.value) }}
          </q-td>
        </template>

        <!-- Costo flete formateado -->
        <template v-slot:body-cell-costoTotalFlete="props">
          <q-td :props="props" class="text-right">
            ${{ formatNum(props.value) }}
          </q-td>
        </template>

        <!-- Costo unitario/litro -->
        <template v-slot:body-cell-costoUnitarioPorLitro="props">
          <q-td :props="props" class="text-right">
            ${{ props.value.toFixed(4) }}
          </q-td>
        </template>

        <!-- Costo unitario/km -->
        <template v-slot:body-cell-costoUnitarioPorKm="props">
          <q-td :props="props" class="text-right">
            ${{ props.value.toFixed(4) }}
          </q-td>
        </template>

        <!-- Fecha formateada -->
        <template v-slot:body-cell-fechaReportar="props">
          <q-td :props="props">
            {{ formatFecha(props.value) }}
          </q-td>
        </template>
      </q-table>
    </div>
  </q-page>
</template>
  
  <script>
import * as XLSX from "xlsx";
import axios from "axios";


export default {
  name: "CneAnexoUno",

  data() {
    return {
      cargando: false,
      error: null,
      datos: [],
      resumen: [],
      paginacion: { rowsPerPage: 20 },

      columnas: [
        {
          name: "fechaReportar",
          label: "Fecha",
          field: "fechaReportar",
          align: "left",
          sortable: true,
        },
        {
          name: "subProducto",
          label: "Subproducto",
          field: "subProducto",
          align: "left",
          sortable: true,
        },
        {
          name: "volumenLitros",
          label: "Volumen (L)",
          field: "volumenLitros",
          align: "right",
          sortable: true,
        },
        {
          name: "procedenciaEstado",
          label: "Origen (Estado)",
          field: "procedenciaEstado",
          align: "left",
          sortable: true,
        },
        {
          name: "procedenciaMunicipio",
          label: "Origen (Municipio)",
          field: "procedenciaMunicipio",
          align: "left",
          sortable: false,
        },
        {
          name: "destinoEstado",
          label: "Destino (Estado)",
          field: "destinoEstado",
          align: "left",
          sortable: true,
        },
        {
          name: "destinoMunicipio",
          label: "Destino (Municipio)",
          field: "destinoMunicipio",
          align: "left",
          sortable: false,
        },
        {
          name: "costoTotalFlete",
          label: "Costo Flete ($)",
          field: "costoTotalFlete",
          align: "right",
          sortable: true,
        },
        {
          name: "costoUnitarioPorLitro",
          label: "$/Litro",
          field: "costoUnitarioPorLitro",
          align: "right",
          sortable: false,
        },
        {
          name: "costoUnitarioPorKm",
          label: "$/Km",
          field: "costoUnitarioPorKm",
          align: "right",
          sortable: false,
        },
        {
          name: "folioFiscal",
          label: "Folio Fiscal",
          field: "folioFiscal",
          align: "left",
          sortable: false,
        },
      ],
    };
  },

  methods: {
    // ── Carga de datos ────────────────────────────────────────────────
    async cargarDatos() {
      this.cargando = true;
      this.error = null;
      this.datos = [];
      this.resumen = [];

      try {
        const { data } = await axios.get("https://localhost:44322/api/Gasolineros/anexo1");
        this.datos = data.datos || [];
        this.resumen = data.resumen || [];
      } catch (e) {
        this.error = e.response
          ? `Error ${e.response.status}: ${
              e.response.data?.mensaje || e.message
            }`
          : `Error de conexión: ${e.message}`;
      } finally {
        this.cargando = false;
      }
    },

    // ── Exportar Excel ────────────────────────────────────────────────
    exportarExcel() {
      // Encabezados exactos del Anexo 1 CNE
      const encabezados = [
        "Número de Permiso",
        "Razón Social",
        "Fecha a Reportar",
        "Modalidad de Transporte",
        "Producto",
        "Subproducto",
        "Volumen Transportado por Destino (litros)",
        "Procedencia del Producto (Entidad Federativa)",
        "Procedencia del Producto (Municipio)",
        "Destino del Producto (Entidad Federativa)",
        "Destino del Producto (Municipio)",
        "Costo Total del Flete (pesos)",
        "Costo de Flete Unitario (pesos/litro)",
        "Costo de Flete Unitario (pesos/kilometro)",
        'Folio Fiscal' ,
        'Folio'
      ];

      // Filas de datos
      const filas = this.datos.map((r) => [
        r.numeroPermiso,
        r.razonSocial,
        this.formatFecha(r.fechaReportar),
        r.modalidadTransporte,
        r.producto,
        r.subProducto,
        r.volumenLitros,
        r.procedenciaEstado,
        r.procedenciaMunicipio,
        r.destinoEstado,
        r.destinoMunicipio,
        r.costoTotalFlete,
        r.costoUnitarioPorLitro,
        r.costoUnitarioPorKm,
        r.folioFiscal,
        r.folio  
    ]);

      // Construir worksheet
      const ws = XLSX.utils.aoa_to_sheet([encabezados, ...filas]);

      // Ancho de columnas
      ws["!cols"] = [
        { wch: 24 }, // Número de Permiso
        { wch: 30 }, // Razón Social
        { wch: 16 }, // Fecha
        { wch: 22 }, // Modalidad
        { wch: 12 }, // Producto
        { wch: 14 }, // Subproducto
        { wch: 36 }, // Volumen
        { wch: 34 }, // Procedencia Estado
        { wch: 30 }, // Procedencia Municipio
        { wch: 30 }, // Destino Estado
        { wch: 30 }, // Destino Municipio
        { wch: 24 }, // Costo Total
        { wch: 30 }, // Costo/Litro
        { wch: 30 }, // Costo/Km
        { wch: 38 } ,
        { wch: 10 } 
      ];

      // Estilo encabezado (fondo azul oscuro, texto blanco, negrita)
      const rangoEncabezado = XLSX.utils.decode_range(ws["!ref"]);
      for (let col = rangoEncabezado.s.c; col <= rangoEncabezado.e.c; col++) {
        const celda = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!ws[celda]) continue;
        ws[celda].s = {
          font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
          fill: { fgColor: { rgb: "1A3A5C" } },
          alignment: {
            horizontal: "center",
            vertical: "center",
            wrapText: true,
          },
          border: {
            bottom: { style: "medium", color: { rgb: "FFFFFF" } },
          },
        };
      }

      // Workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Anexo 1");

      // Nombre del archivo con fecha actual
      const hoy = new Date();
      const sufijo = `${hoy.getFullYear()}${String(hoy.getMonth() + 1).padStart(
        2,
        "0"
      )}${String(hoy.getDate()).padStart(2, "0")}`;
      XLSX.writeFile(wb, `CNE_Anexo1_PL20815_${sufijo}.xlsx`);
    },

    // ── Helpers ───────────────────────────────────────────────────────
    formatNum(val) {
      if (!val && val !== 0) return "0";
      return Number(val).toLocaleString("es-MX", { maximumFractionDigits: 2 });
    },

    formatFecha(val) {
        if (!val) return ''
        const d = new Date(val)
        const dia = String(d.getDate()).padStart(2, '0')
        const mes = String(d.getMonth() + 1).padStart(2, '0')
        const anio = d.getFullYear()
        return `${dia}/${mes}/${anio}`
    },

    nombreMes(num) {
      const meses = [
        "Ene",
        "Feb",
        "Mar",
        "Abr",
        "May",
        "Jun",
        "Jul",
        "Ago",
        "Sep",
        "Oct",
        "Nov",
        "Dic",
      ];
      return meses[num - 1] || "";
    },

    badgeClass(subProducto) {
      if (subProducto === "Regular") return "badge--magna";
      if (subProducto === "Premium") return "badge--premium";
      if (subProducto.includes("Diésel")) return "badge--diesel";
      return "";
    },

    chipClass(subProducto) {
      if (subProducto === "Regular") return "cne-chip--magna";
      if (subProducto === "Premium") return "cne-chip--premium";
      if (subProducto.includes("Diésel")) return "cne-chip--diesel";
      return "";
    },
  },
};
</script>
  
  <style lang="scss" scoped>
// ── Variables ─────────────────────────────────────────────────────────────
$azul: #1a3a5c;
$rojo: #bf2f2f;
$magna: #2e7d32;
$premium: #1565c0;
$diesel: #e65100;
$gris: #f5f6fa;

// ── Page ──────────────────────────────────────────────────────────────────
.cne-page {
  background: $gris;
  min-height: 100vh;
  padding: 24px;
}

// ── Header ────────────────────────────────────────────────────────────────
.cne-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  background: $azul;
  border-radius: 12px;
  padding: 20px 28px;
  margin-bottom: 20px;

  &__label {
    display: block;
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.55);
    margin-bottom: 4px;
  }

  &__title {
    font-size: 1.6rem;
    font-weight: 700;
    color: #fff;
    margin: 0 0 4px 0;
  }

  &__sub {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.45);
  }

  &__right {
    display: flex;
    gap: 10px;
  }
}

// ── Botones ───────────────────────────────────────────────────────────────
.btn-consultar {
  background: $rojo !important;
  color: #fff !important;
  border-radius: 8px;
  font-weight: 600;
  padding: 0 20px;
}

.btn-exportar {
  background: $magna !important;
  color: #fff !important;
  border-radius: 8px;
  font-weight: 600;
  padding: 0 20px;
}

// ── Chips resumen ─────────────────────────────────────────────────────────
.cne-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
}

.cne-chip {
  background: #fff;
  border-radius: 10px;
  padding: 12px 18px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-left: 4px solid #ccc;
  min-width: 160px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);

  &--magna {
    border-color: $magna;
  }
  &--premium {
    border-color: $premium;
  }
  &--diesel {
    border-color: $diesel;
  }

  &__label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #888;
  }

  &__mes {
    font-size: 12px;
    color: #555;
  }

  &__litros {
    font-size: 1.1rem;
    font-weight: 700;
    color: $azul;
  }

  &__flete {
    font-size: 12px;
    color: #777;
  }
}

// ── Estado vacío / error ──────────────────────────────────────────────────
.cne-estado {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
  padding: 48px;
  color: #aaa;
  font-size: 1rem;

  &--error {
    color: $rojo;
    background: #fff5f5;
    border-radius: 10px;
  }
}

// ── Tabla ─────────────────────────────────────────────────────────────────
.cne-tabla-wrapper {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.07);
}

.cne-tabla {
  ::v-deep thead tr th {
    background: $azul;
    color: #fff;
    font-weight: 600;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  ::v-deep tbody tr:hover {
    background: rgba(26, 58, 92, 0.04);
  }
}

// ── Badges subproducto ────────────────────────────────────────────────────
.badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &--magna {
    background: #e8f5e9;
    color: $magna;
  }
  &--premium {
    background: #e3f2fd;
    color: $premium;
  }
  &--diesel {
    background: #fff3e0;
    color: $diesel;
  }
}
</style>