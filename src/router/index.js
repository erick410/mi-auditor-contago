import Vue from "vue";
import VueRouter from "vue-router";
import Login from "../views/Login.vue";
import store from "../store/index";

import MainPage from "../components/Inicio/MainPage.vue";
import Home from "../views/Home.vue";
import Configuracion from "../components/Configuracion/Configuracion.vue";
import PanelAdministrador from "../components/AdministradorEmpresas/PanelAdministrador.vue";

import MainIngresos from "../components/Ingresos/MainIngresos.vue";
import Ingresos from "../components/Ingresos/Ingresos.vue";
import FacturacionMesI from "../components/Ingresos/FacturacionMesI.vue";
import FacturacionPeriodoI from "../components/Ingresos/FacturacionPeriodoI.vue";
import FacturacionRfcI from "../components/Ingresos/FacturacionRfcI.vue";
import CuentasXCobrar from "../components/Ingresos/CuentasXCobrar.vue";
import CuentasXCobrarRfc from "../components/Ingresos/CuentasXCobrarRfc.vue";
import ComplementosDePagoEmitidos from "../components/Ingresos/ComplementosDePagoEmitidos.vue";
import ConceptosPeriodoI from "../components/Ingresos/ConceptosPeriodoI.vue";
import ConceptosPeriodoDescI from "../components/Ingresos/ConceptosPeriodoDescI.vue";
import ConceptosPeriodoClienteI from "../components/Ingresos/ConceptosPeriodoClienteI.vue";
import ConceptosAcumuladoI from "../components/Ingresos/ConceptosAcumuladoI.vue";
import IvaTrasladadoFacturado from "../components/Ingresos/IvaTrasladadoFacturado.vue";
import IngresosFacturadosSinImpuestos from "../components/Ingresos/IngresosFacturadosSinImpuestos.vue";
import AnticiposI from "../components/Ingresos/AnticiposI.vue";
import AnticiposClientes from "../components/Ingresos/AnticiposClientes.vue";
import Factoraje from "../components/Ingresos/Factoraje.vue";

import MainCompras from "../components/Compras/MainCompras.vue";
import Compras from "../components/Compras/Compras.vue";
import FacturacionMesG from "../components/Compras/FacturacionMesG.vue";
import FacturacionPeriodoG from "../components/Compras/FacturacionPeriodoG.vue";
import FacturacionRfcG from "../components/Compras/FacturacionRfcG.vue";
import CuentasXPagar from "../components/Compras/CuentasXPagar.vue";
import CuentasXPagarRfc from "../components/Compras/CuentasXPagarRfc.vue";
import ComplementosDePagoRecibido from "../components/Compras/ComplementosDePagoRecibido.vue";
import ConceptosPeriodoG from "../components/Compras/ConceptosPeriodoG.vue";
import ConceptosPeriodoDescG from "../components/Compras/ConceptosPeriodoDescG.vue";
import ConceptosPeriodoProveedor from "../components/Compras/ConceptosPeriodoProveedor.vue";
import ConceptosAcumuladoG from "../components/Compras/ConceptosAcumuladoG.vue";
import IvaAcreditadoFacturado from "../components/Compras/IvaAcreditadoFacturado.vue";
import AnticiposG from "../components/Compras/AnticiposG.vue";
import AnticiposProveedor from "../components/Compras/AnticiposProveedor.vue";

import MainNomina from "../components/Nomina/MainNomina.vue";
import Nomina from "../components/Nomina/Nomina.vue";
import ReporteIsr from "../components/Nomina/ReporteIsr.vue";
import ReporteTrabajadores from "../components/Nomina/ReporteTrabajadores.vue";
import ReporteConceptosSat from "../components/Nomina/ReporteConceptosSat.vue";
import ReporteConceptosInterno from "../components/Nomina/ReporteConceptosInterno.vue";
import ReporteSubsidio from "../components/Nomina/ReporteSubsidio.vue";
import ListaDeRaya from "../components/Nomina/ListaDeRaya.vue";

import MainDescargas from "../components/Descargas/MainDescargas.vue";
import Descargas from "../components/Descargas/Descargas.vue";
import DescargasUUID from "../components/Descargas/DescargasUUID.vue";
import DescargasXMLS from "../components/Descargas/DescargasXMLS.vue";
import DescargasMetadata from "../components/Descargas/DescargasMetadata.vue";

import MainPagosMensuales from "../components/PagosMensuales/MainPagosMensuales.vue";
import PagosMensuales from "../components/PagosMensuales/PagosMensuales.vue";
import ReporteIva from "../components/PagosMensuales/ReporteIva.vue";
import ReporteIsrM from "../components/PagosMensuales/ReporteIsrM.vue";
import PagosProvisionales from "../components/PagosMensuales/PagosProvisionales.vue";
import RetencionesIva from "../components/PagosMensuales/RetencionesIva.vue";
import ReporteUsoCfdi from "../components/PagosMensuales/ReporteUsoCfdi.vue";
import ReporteIeps from "../components/PagosMensuales/ReporteIeps.vue";

import MainCancelados from "../components/Cancelados/MainCancelados.vue";
import Cancelados from "../components/Cancelados/Cancelados.vue";

import MainFlujo from "../components/Flujo/MainFlujo.vue";
import Flujo from "../components/Flujo/Flujo.vue";

import MainGasolineria from "../components/Gasolineria/MainGasolineria.vue";
import Gasolineria from "../components/Gasolineria/Gasolineria.vue";
import VentasYComprasGasolineria from "../components/Gasolineria/VentasYComprasGasolineria.vue";
import VentasSinDespacho from "../components/Gasolineria/VentasSinDespacho.vue";
import ReporteLitrosGasolineria from "../components/Gasolineria/ReporteLitrosGasolineria.vue";
import ReporteSubTotalGasolineria from "../components/Gasolineria/ReporteSubTotalGasolineria.vue";
import MonederoElectronico from "../components/Gasolineria/MonederoElectronico.vue";

import Lista69B from "../components/Lista69B/Lista69B.vue";
import ReporteEmpresarial from "../components/ReporteEmpresarial/ReporteEmpresarial.vue";
import ReporteGeneral from "../components/ReporteGeneral/ReporteGeneral.vue";

import MainDescargasScraper from "../components/DescargasScraper/MainDescargasScraper.vue";
import DescargasScraperXMLS from "../components/DescargasScraper/DescargasScraperXMLS.vue";

import MainReportes from "../components/Reportes/MainReportes.vue";
import ReportePagos from "../components/Reportes/ReportePagos.vue";
import DocumentosEmitidos from "../components/Reportes/ReporteDocumentosEmitidos.vue";
import ContabilidadDocumentosEmitidos from "../components/Reportes/ReporteContabilidadDocumentosEmitidos.vue";
import ContabilidadDocumentosRecibidos from "../components/Reportes/ReporteContabilidadDocumentosRecibidos.vue";
import DocumentosRecibidos from "../components/Reportes/ReporteDocumentosRecibidos.vue";
import ReportePagosProveedores from "../components/Reportes/ReportePagosProveedores.vue";
import ReporteNominaDetalles from "../components/Reportes/ReporteNominaDetalles.vue";
import ReporteContabilidadNominaDetalles from "../components/Reportes/ReporteContabilidadNominaDetalles.vue";

import MainSolicitudCancelacion from "../components/SolicitudCancelacion/MainSolicitudCancelacion.vue";
import SolicitudCancelacion from "../components/SolicitudCancelacion/SolicitudCancelacion.vue";

import MainSustitucion from "../components/Sustitucion/MainSustitucion.vue";

import ViewReporteGeneral from "../components/ReporteGeneral/ViewReporteGeneral.vue";

import MainConceptos from "../components/Conceptos/MainConceptos.vue"
import Conceptos from "../components/Conceptos/ListaConceptos.vue"

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    component: MainPage,
    meta: { Administrador: true, Gasolinero: true, PerfilA: true, PerfilB: true, PerfilC: true},
    children: [
      {
        path: "Home",
        component: Home,
        name: "Home",
        meta: { Administrador: true, Gasolinero: true, PerfilA: true },
      },
      {
        path: "Configuracion",
        component: Configuracion,
        name: "Configuracion",
        meta: { Administrador: true, Gasolinero: true, },
      },
      {
        path: "PanelAdministrador",
        component: PanelAdministrador,
        name: "PanelAdministrador",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "Lista69B",
        component: Lista69B,
        name: "Lista69B",
        meta: { Administrador: true, Gasolinero: true, },
      },
      {
        path: "ReporteEmpresarial",
        component: ReporteEmpresarial,
        name: "ReporteEmpresarial",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "ReporteGeneral",
        component: ReporteGeneral,
        name: "ReporteGeneral",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "ViewReporteGeneral",
        component: ViewReporteGeneral,
        name: "ViewReporteGeneral",
        meta: { Administrador: true, Gasolinero: true },
      },
    ],
  },
  {
    path: "/about",
    name: "About",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue"),
  },
  { path: "/Login", name: "Login", component: Login, meta: { libre: true } },
  //INGRESOS
  {
    path: "/MainIngresos",
    component: MainIngresos,
    meta: { Administrador: true, Gasolinero: true, PerfilA: true, PerfilC: true },
    children: [
      {
        path: "PanelAdministrador",
        component: PanelAdministrador,
        name: "PanelAdministrador",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "Configuracion",
        component: Configuracion,
        name: "Configuracion",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "Ingresos",
        component: Ingresos,
        name: "Ingresos",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "FacturacionMesI",
        component: FacturacionMesI,
        name: "FacturacionMesI",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "FacturacionPeriodoI",
        component: FacturacionPeriodoI,
        name: "FacturacionPeriodoI",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "FacturacionRfcI",
        component: FacturacionRfcI,
        name: "FacturacionRfcI",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "CuentasXCobrar",
        component: CuentasXCobrar,
        name: "CuentasXCobrar",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "CuentasXCobrarRfc",
        component: CuentasXCobrarRfc,
        name: "CuentasXCobrarRfc",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "ComplementosDePagoEmitidos",
        component: ComplementosDePagoEmitidos,
        name: "ComplementosDePagoEmitidos",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "ConceptosPeriodoI",
        component: ConceptosPeriodoI,
        name: "ConceptosPeriodoI",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "ConceptosPeriodoDescI",
        component: ConceptosPeriodoDescI,
        name: "ConceptosPeriodoDescI",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "ConceptosPeriodoClienteI",
        component: ConceptosPeriodoClienteI,
        name: "ConceptosPeriodoClienteI",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "ConceptosAcumuladoI",
        component: ConceptosAcumuladoI,
        name: "ConceptosAcumuladoI",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "IvaTrasladadoFacturado",
        component: IvaTrasladadoFacturado,
        name: "IvaTrasladadoFacturado",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "IngresosFacturadosSinImpuestos",
        component: IngresosFacturadosSinImpuestos,
        name: "IngresosFacturadosSinImpuestos",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "AnticiposI",
        component: AnticiposI,
        name: "AnticiposI",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "AnticiposClientes",
        component: AnticiposClientes,
        name: "AnticiposClientes",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "Factoraje",
        component: Factoraje,
        name: "Factoraje",
        meta: { Administrador: true, Gasolinero: true },
      },
      // { path: 'DocumentosEmitidos', component: DocumentosEmitidos, name: 'DocumentosEmitidos', meta: { Administrador: true, Gasolinero: true } },
    ],
  },
  //COMPRAS
  {
    path: "/MainCompras",
    component: MainCompras,
    meta: { Administrador: true, Gasolinero: true, PerfilA: true, PerfilB: true },
    children: [
      {
        path: "PanelAdministrador",
        component: PanelAdministrador,
        name: "PanelAdministrador",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "Configuracion",
        component: Configuracion,
        name: "Configuracion",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "Compras",
        component: Compras,
        name: "Compras",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "FacturacionMesG",
        component: FacturacionMesG,
        name: "FacturacionMesG",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "FacturacionPeriodoG",
        component: FacturacionPeriodoG,
        name: "FacturacionPeriodoG",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "FacturacionRfcG",
        component: FacturacionRfcG,
        name: "FacturacionRfcG",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "CuentasXPagar",
        component: CuentasXPagar,
        name: "CuentasXPagar",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "CuentasXPagarRfc",
        component: CuentasXPagarRfc,
        name: "CuentasXPagarRfc",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "ComplementosDePagoRecibido",
        component: ComplementosDePagoRecibido,
        name: "ComplementosDePagoRecibido",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "ConceptosPeriodoG",
        component: ConceptosPeriodoG,
        name: "ConceptosPeriodoG",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "ConceptosPeriodoDescG",
        component: ConceptosPeriodoDescG,
        name: "ConceptosPeriodoDescG",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "ConceptosPeriodoProveedor",
        component: ConceptosPeriodoProveedor,
        name: "ConceptosPeriodoProveedor",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "ConceptosAcumuladoG",
        component: ConceptosAcumuladoG,
        name: "ConceptosAcumuladoG",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "IvaAcreditadoFacturado",
        component: IvaAcreditadoFacturado,
        name: "IvaAcreditadoFacturado",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "AnticiposG",
        component: AnticiposG,
        name: "AnticiposG",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "AnticiposProveedor",
        component: AnticiposProveedor,
        name: "AnticiposProveedor",
        meta: { Administrador: true, Gasolinero: true },
      },
      // { path: 'ReportePagos', component: ReportePagos, name: 'ReportePagos', meta: { Administrador: true, Gasolinero: true } },
    ],
  },
  //NOMINA
  {
    path: "/MainNomina",
    component: MainNomina,
    meta: { Administrador: true, Gasolinero: true, PerfilA: true },
    children: [
      {
        path: "PanelAdministrador",
        component: PanelAdministrador,
        name: "PanelAdministrador",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "Configuracion",
        component: Configuracion,
        name: "Configuracion",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "Nomina",
        component: Nomina,
        name: "Nomina",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "ReporteIsr",
        component: ReporteIsr,
        name: "ReporteIsr",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "ReporteTrabajadores",
        component: ReporteTrabajadores,
        name: "ReporteTrabajadores",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "ReporteConceptosSat",
        component: ReporteConceptosSat,
        name: "ReporteConceptosSat",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "ReporteConceptosInterno",
        component: ReporteConceptosInterno,
        name: "ReporteConceptosInterno",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "ReporteSubsidio",
        component: ReporteSubsidio,
        name: "ReporteSubsidio",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "ListaDeRaya",
        component: ListaDeRaya,
        name: "ListaDeRaya",
        meta: { Administrador: true, Gasolinero: true },
      },
    ],
  },
  //DESCARGAS
  {
    path: "/MainDescargas",
    component: MainDescargas,
    meta: { Administrador: true, Gasolinero: true, PerfilA: true },
    children: [
      {
        path: "PanelAdministrador",
        component: PanelAdministrador,
        name: "PanelAdministrador",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "Configuracion",
        component: Configuracion,
        name: "Configuracion",
        meta: { Administrador: true, Gasolinero: true },
      },
      // { path: 'Descargas', component: Descargas, name: 'Descargas', meta: { Administrador: true, Gasolinero: true } },
      // { path: 'DescargasXMLS', component: DescargasXMLS, name: 'DescargasXMLS', meta: { Administrador: true, Gasolinero: true } },
      // { path: 'DescargasUUID', component: DescargasUUID, name: 'DescargasUUID', meta: { Administrador: true, Gasolinero: true } },
      // { path: 'DescargasMetadata', component: DescargasMetadata, name: 'DescargasMetadata', meta: { Administrador: true, Gasolinero: true } },
    ],
  },
  //PAGOS MENSUALES
  {
    path: "/MainPagosMensuales",
    component: MainPagosMensuales,
    meta: { Administrador: true, Gasolinero: true },
    children: [
      {
        path: "PanelAdministrador",
        component: PanelAdministrador,
        name: "PanelAdministrador",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "Configuracion",
        component: Configuracion,
        name: "Configuracion",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "PagosMensuales",
        component: PagosMensuales,
        name: "PagosMensuales",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "ReporteIva",
        component: ReporteIva,
        name: "ReporteIva",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "ReporteIsrM",
        component: ReporteIsrM,
        name: "ReporteIsrM",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "PagosProvisionales",
        component: PagosProvisionales,
        name: "PagosProvisionales",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "RetencionesIva",
        component: RetencionesIva,
        name: "RetencionesIva",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "ReporteUsoCfdi",
        component: ReporteUsoCfdi,
        name: "ReporteUsoCfdi",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "ReporteIeps",
        component: ReporteIeps,
        name: "ReporteIeps",
        meta: { Administrador: true, Gasolinero: true },
      },
    ],
  },
  //CANCELADOS
  {
    path: "/MainCancelados",
    component: MainCancelados,
    meta: { Administrador: true, Gasolinero: true, PerfilA: true },
    children: [
      {
        path: "PanelAdministrador",
        component: PanelAdministrador,
        name: "PanelAdministrador",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "Configuracion",
        component: Configuracion,
        name: "Configuracion",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "Cancelados",
        component: Cancelados,
        name: "Cancelados",
        meta: { Administrador: true, Gasolinero: true },
      },
    ],
  },
  //FLUJO
  {
    path: "/MainFlujo",
    component: MainFlujo,
    meta: { Administrador: true, Gasolinero: true },
    children: [
      {
        path: "PanelAdministrador",
        component: PanelAdministrador,
        name: "PanelAdministrador",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "Configuracion",
        component: Configuracion,
        name: "Configuracion",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "Flujo",
        component: Flujo,
        name: "Flujo",
        meta: { Administrador: true, Gasolinero: true },
      },
    ],
  },
  //GASOLINERA
  {
    path: "/MainGasolineria",
    component: MainGasolineria,
    meta: { Administrador: false, Gasolinero: true },
    children: [
      {
        path: "PanelAdministrador",
        component: PanelAdministrador,
        name: "PanelAdministrador",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "Configuracion",
        component: Configuracion,
        name: "Configuracion",
        meta: { Administrador: false, Gasolinero: true },
      },
      {
        path: "Gasolineria",
        component: Gasolineria,
        name: "Gasolineria",
        meta: { Administrador: false, Gasolinero: true },
      },
      {
        path: "VentasYComprasGasolineria",
        component: VentasYComprasGasolineria,
        name: "VentasYComprasGasolineria",
        meta: { Administrador: false, Gasolinero: true },
      },
      {
        path: "MonederoElectronico",
        component: MonederoElectronico,
        name: "MonederoElectronico",
        meta: { Administrador: false, Gasolinero: true },
      },
      {
        path: "VentasSinDespacho",
        component: VentasSinDespacho,
        name: "VentasSinDespacho",
        meta: { Administrador: false, Gasolinero: true },
      },
      {
        path: "ReporteLitrosGasolineria",
        component: ReporteLitrosGasolineria,
        name: "ReporteLitrosGasolineria",
        meta: { Administrador: false, Gasolinero: true },
      },
      {
        path: "ReporteSubTotalGasolineria",
        component: ReporteSubTotalGasolineria,
        name: "ReporteSubTotalGasolineria",
        meta: { Administrador: false, Gasolinero: true },
      },
    ],
  },
  //DESCARGAS SCRAPPER
  {
    path: "/MainDescargasScraper",
    component: MainDescargasScraper,
    meta: { Administrador: true, Gasolinero: true, PerfilA: true },
    children: [
      {
        path: "PanelAdministrador",
        component: PanelAdministrador,
        name: "PanelAdministrador",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "Configuracion",
        component: Configuracion,
        name: "Configuracion",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "DescargasScraper",
        component: Descargas,
        name: "DescargasScraper",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "DescargasScraperXMLS",
        component: DescargasScraperXMLS,
        name: "DescargasScraperXMLS",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "DescargasXMLS",
        component: DescargasXMLS,
        name: "DescargasXMLS",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "DescargasMetadata",
        component: DescargasMetadata,
        name: "DescargasMetadata",
        meta: { Administrador: true, Gasolinero: true },
      },
    ],
  },
  //REPORTES
  {
    path: "/MainReportes",
    component: MainReportes,
    meta: { Administrador: true, Gasolinero: true },
    children: [
      {
        path: "DocumentosEmitidos",
        component: DocumentosEmitidos,
        name: "DocumentosEmitidos",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "DocumentosRecibidos",
        component: DocumentosRecibidos,
        name: "DocumentosRecibidos",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "ReportePagos",
        component: ReportePagos,
        name: "ReportePagos",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "ReportePagosProveedores",
        component: ReportePagosProveedores,
        name: "ReportePagosProveedores",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "ContabilidadDocumentosEmitidos",
        component: ContabilidadDocumentosEmitidos,
        name: "ContabilidadDocumentosEmitidos",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "ContabilidadDocumentosRecibidos",
        component: ContabilidadDocumentosRecibidos,
        name: "ContabilidadDocumentosRecibidos",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "ReporteNominaDetalles",
        component: ReporteNominaDetalles,
        name: "ReporteNominaDetalles",
        meta: { Administrador: true, Gasolinero: true },
      },
      {
        path: "ReporteContabilidadNominaDetalles",
        component: ReporteContabilidadNominaDetalles,
        name: "ReporteContabilidadNominaDetalles",
        meta: { Administrador: true, Gasolinero: true },
      },
    ],
  },
  //SOLICITUD CANCELACION
  {
    path: "/MainSolicitudCancelacion",
    component: MainSolicitudCancelacion,
    meta: { Administrador: true, Gasolinero: true, PerfilA: true },
    children: [
      {
        path: "SolicitudCancelacion",
        component: SolicitudCancelacion,
        name: "SolicitudCancelacion",
        meta: { Administrador: true, Gasolinero: true },
      },
    ],
  },
  //SUSTITUCION
  {
    name: 'MainSustitucion',
    path: "/MainSustitucion",
    component: MainSustitucion,
    meta: { Administrador: true, Gasolinero: true, PerfilA: true },
    children: [

    ],
  },
  {
    path: "/MainConceptos",
    component: MainConceptos,
    meta: { Administrador: true, Gasolinero: true, PerfilA: true },
    children: [
      {
        path: "Conceptos",
        component: Conceptos,
        name: "Conceptos",
        meta: { Administrador: true, Gasolinero: true },
      },
    ],
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.libre)) {
    next();
  } else if (store.state.usuario && store.state.usuario.rol == "Administrador") {
    if (to.matched.some((record) => record.meta.Administrador)) {
      next();
    }
  } else if (store.state.usuario && store.state.usuario.rol == "Gasolinero") {
    if (to.matched.some((record) => record.meta.Gasolinero)) {
      next();
    }
  } else if (store.state.usuario && store.state.usuario.rol == "PerfilA") {
    if (to.matched.some((record) => record.meta.PerfilA)) {
      next();
    }
  } else if (store.state.usuario && store.state.usuario.rol == "PerfilB") {
    if (to.matched.some((record) => record.meta.PerfilB)) {
      next();
    }
  } else if (store.state.usuario && store.state.usuario.rol == "PerfilC") {
    if (to.matched.some((record) => record.meta.PerfilC)) {
      next();
    }
  } else {
    next({
      name: "Login",
    });
  }
});
export default router;
