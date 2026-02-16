<template>
  <div class="q-ml-xl q-mr-lg">
    <q-dialog
      v-model="dialogAviso"
      transition-show="scale"
      transition-hide="scale"
    >
      <q-card>
        <q-card-section>
          <div class="text-h6">Aviso importante</div>
          <div class="text-h6">
            Actualización de la herramienta de carga de XML
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <p>
            Por el momento no se pueden realizar descargas directamente desde la
            aplicación, por lo que se les proporciona una herramienta la cual se
            puede instalar en equipos Windows, con la cual se pueden cargar los
            comprobantes al sistema, directamente desde su equipo personal.
          </p>
          <p>
            Para cualquier duda se pueden comunicar vía telefónica al número 222
            622 6540.
          </p>
          <p>
            Estamos trabajando, para que a la brevedad se restablezca el
            servicio de descargas, además de proporcionar nuevas herramientas
            para agilizar el proceso y ofrecerles el mejor servicio.
          </p>
          <div class="text-center">
            <q-btn
              dense
              round
              color="green"
              icon="mdi-download"
              class="q-mr-sm"
              @click="DescargaHerramienta()"
            >
              <q-tooltip> Descargar herramienta </q-tooltip>
            </q-btn>
          </div>
          <p>PASOS PARA INSTALACION Y USO DE LA HERRAMIENTA</p>
          <p>
            En caso de haber instalado la herramienta previamente, debe de
            desintalar dicha versión y actualizar con la que se porporciona en
            este moneto
          </p>
          <p>1.- Se debe descomprimir el archivo zip</p>
          <p>
            2.- Copiar y pegar la carpeta "CATALOGOS SAT JSON" directamente en
            C://
          </p>
          <p>3.- Instalar el programa "CargaXml.msi"</p>
          <p>Listo</p>
          <p>
            Con esta actualización deberas poder subir tus XML al sistema sin
            necesidad de renombar los archivos como en la versión anterios
          </p>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <div class="text-center q-my-xl">
      <img
        class="logo-home"
        alt="Contago logo"
        src="../assets/logo_contago_sin_fondo.png"
      />
    </div>

    <div class="row flex-center q-pr-xl q-pl-xl" style="gap: 20px">
      <div class="col-xs-12 col-sm-4 col-md-1 text-center" style="width: auto">
        <span
          @click="irIngresos()"
          class="q-pa-lg shadow-6 mb-3 inline-block surface-card"
          style="
            background: #e74747;
            border-radius: 10px;
            cursor: pointer;
            width: 160px;
          "
        >
          <q-icon
            name="mdi-file-document-plus q-pb-xs"
            style="color: aliceblue; font-size: 4em"
          />
          <div class="text-h5 text-weight-bolder" style="color: aliceblue">
            Ingresos
          </div>
        </span>
      </div>

      <div class="col-xs-12 col-sm-4 col-md-1 text-center" style="width: auto">
        <span
          @click="irCompras()"
          class="q-pa-lg shadow-6 mb-3 inline-block surface-card"
          style="
            background: #e74747;
            border-radius: 10px;
            cursor: pointer;
            width: 160px;
          "
        >
          <q-icon
            name="mdi-file-document-minus  q-pb-xs"
            style="color: aliceblue; font-size: 4em"
          />
          <div class="text-h5 text-weight-bolder" style="color: aliceblue">
            Compras
          </div>
        </span>
      </div>

      <div class="col-xs-12 col-sm-4 col-md-1 text-center" style="width: auto">
        <span
          @click="irNomina()"
          class="q-pa-lg shadow-6 mb-3 inline-block surface-card"
          style="
            background: #e74747;
            border-radius: 10px;
            cursor: pointer;
            width: 160px;
          "
        >
          <q-icon
            name="mdi-account-cash q-pb-xs"
            style="color: aliceblue; font-size: 4em"
          />
          <div class="text-h5 text-weight-bolder" style="color: aliceblue">
            Nómina
          </div>
        </span>
      </div>

      <div class="col-xs-12 col-sm-4 col-md-1 text-center" style="width: auto">
        <span
          @click="irDescargas()"
          class="q-pa-lg shadow-6 mb-3 inline-block surface-card"
          style="
            background: #e74747;
            border-radius: 10px;
            cursor: pointer;
            width: 160px;
          "
        >
          <q-icon
            name="mdi-download-box q-pb-xs"
            style="color: aliceblue; font-size: 4em"
          />
          <div class="text-h5 text-weight-bolder" style="color: aliceblue">
            Descargas
          </div>
        </span>
      </div>

      <!-- <div class="col-12 col-md-1 text-center q-mx-lg">
        <span @click="irDescarga()" class="q-pa-lg  shadow-6 mb-3 inline-block surface-card"
          style="background: #E74747;  border-radius: 10px; cursor: pointer;  width: 160px;">
          <q-icon name="mdi-download-box q-pb-xs" style="color: aliceblue;font-size: 4em;" />
          <div class="text-h5 text-weight-bolder" style="color: aliceblue;">Descargas Web Service</div>
        </span>
      </div> -->

      <div class="col-xs-12 col-sm-6 col-md-1 text-center" style="width: auto">
        <span
          @click="irPagosMensuales()"
          class="q-py-lg shadow-6 inline-block surface-card"
          style="
            background: #e74747;
            border-radius: 10px;
            cursor: pointer;
            width: 160px;
          "
        >
          <q-icon
            name="mdi-cash-clock  "
            style="color: aliceblue; font-size: 4em"
          />
          <div
            class="text-weight-bolder q-mt-md"
            style="font-size: 15px; color: aliceblue"
          >
            Pagos Mensuales
          </div>
        </span>
      </div>

      <!-- <div class="col-12 col-md-1 text-center q-mx-lg">
        <span @click="irCancelados" class="q-pa-lg shadow-6 inline-block surface-card"
          style="background: #E74747;  border-radius: 10px; cursor: pointer;  width: 160px;">
          <q-icon name="mdi-cancel q-pb-xs" style="color: aliceblue;font-size: 4em;" />
          <div class=" text-weight-bolder" style="font-size: 20px; color: aliceblue;">Cancelados</div>
        </span>
      </div> -->

      <!-- <div class="col-12 col-md-1 text-center q-mx-lg">
        <span @click="irFlujo" class="q-pa-lg  shadow-6 mb-3 inline-block surface-card"
          style="background: #E74747;  border-radius: 10px; cursor: pointer;  width: 160px;">
          <q-icon name="mdi-cash-multiple q-pb-xs" style="color: aliceblue;font-size: 4em;" />
          <div class="text-h5 text-weight-bolder" style="color: aliceblue;">Flujo</div>
        </span>
      </div>-->

      <div
        class="col-xs-12 col-sm-6 col-md-1 text-center"
        style="width: auto"
        v-show="this.$store.state.usuario.rol == 'Gasolinero'"
      >
        <span
          @click="irGasolineria"
          class="q-pa-lg shadow-6 mb-3 inline-block surface-card"
          style="
            background: #e74747;
            border-radius: 10px;
            cursor: pointer;
            width: 160px;
          "
        >
          <q-icon
            name="mdi-gas-station q-pb-xs"
            style="color: aliceblue; font-size: 4em"
          />
          <div
            class="text-weight-bolder"
            style="font-size: 20px; color: aliceblue"
          >
            Gasolinerias
          </div>
        </span>
      </div>

      <!--<div class="col-12 col-md-1 text-center q-mx-lg">
        <span @click="irlista69b" class="q-pa-lg  shadow-6 mb-3 inline-block surface-card"
          style="background: #E74747;  border-radius: 10px; cursor: pointer;  width: 160px;">
          <q-icon name="mdi-account-search q-pb-xs" style="color: aliceblue;font-size: 4em;" />
          <div class=" text-weight-bolder" style="font-size: 20px; color: aliceblue;">69B</div>
        </span>
      </div> -->

      <div class="col-xs-12 col-sm-6 col-md-1 text-center" style="width: auto">
        <span
          @click="irReporteEmpresarial"
          class="q-py-md shadow-6 inline-block surface-card"
          style="
            background: #e74747;
            border-radius: 10px;
            cursor: pointer;
            width: 160px;
          "
        >
          <q-icon
            name="mdi-file-chart"
            style="color: aliceblue; font-size: 4em"
          />
          <div
            class="text-weight-bolder"
            style="font-size: 18px; color: aliceblue"
          >
            Reporte <br />
            Empresarial
          </div>
        </span>
      </div>

      <!-- <div class="col-12 col-md-1 text-center q-mx-lg">
         <span @click="irReporteEmpresarial" class="q-py-md shadow-6 inline-block surface-card"
           style="background: #E74747;  border-radius: 10px; cursor: pointer;  width: 160px;">
           <q-icon name="mdi-file-chart" style="color: aliceblue;font-size: 4em;" />
           <div class=" text-weight-bolder" style="font-size: 18px; color: aliceblue;">Reportes</div>
         </span>
       </div> -->

      <!-- Sustitucion de CFDI -->
      <div class="col-xs-12 col-sm-6 col-md-1 text-center" style="width: auto">
        <span
          @click="irSustitucionCFDI"
          class="q-py-md shadow-6 inline-block surface-card"
          style="
            background: #e74747;
            border-radius: 10px;
            cursor: pointer;
            width: 160px;
          "
        >
          <q-icon
            name="mdi-file-replace"
            style="color: aliceblue; font-size: 4em"
          />
          <div
            class="text-weight-bolder"
            style="font-size: 18px; color: aliceblue"
          >
            Sustitucion <br />
            CFDIs
          </div>
        </span>
      </div>

       


      <div class="col-xs-12 col-sm-4 col-md-1 text-center" style="width: auto">
        <span
          @click="irConceptos()"
          class="q-pa-lg shadow-6 mb-3 inline-block surface-card"
          style="
            background: #e74747;
            border-radius: 10px;
            cursor: pointer;
            width: 160px;
          "
        >
          <q-icon
            name="mdi-format-list-checkbox"
            style="color: aliceblue; font-size: 4em"
          />
          <div class="text-h5 text-weight-bolder" style="color: aliceblue">
            Conceptos
          </div>
        </span>
      </div>

    </div>
  </div>
</template>

<!-- <script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'Home',
  components: {
    HelloWorld
  }
}
</script> -->
<script>
import axios from "axios";

export default {
  data() {
    return {
      menuOptions: [
        { name: "Opción 1", icon: "mdi-home" },
        { name: "Opción 2", icon: "mdi-account" },
        { name: "Opción 3", icon: "mdi-settings" },
      ],
      dialogAviso: false,
    };
  },
  created() {
    this.listaEmpresas();
  },
  methods: {
    irIngresos() {
      this.$router.push({ name: "Ingresos" });
    },
    irCompras() {
      this.$router.push({ name: "Compras" });
    },
    irNomina() {
      this.$router.push({ name: "Nomina" });
    },
    irDescarga() {
      this.$router.push({ name: "Descargas" });
    },
    irDescargas() {
      this.$router.push({ name: "DescargasScraper" });
    },
    irPagosMensuales() {
      this.$router.push({ name: "PagosMensuales" });
    },
    irCancelados() {
      this.$router.push({ name: "Cancelados" });
    },
    irFlujo() {
      this.$router.push({ name: "Flujo" });
    },
    irGasolineria() {
      this.$router.push({ name: "Gasolineria" });
    },
    irlista69b() {
      this.$router.push({ name: "Lista69B" });
    },
    irReporteEmpresarial() {
      this.$router.push({ name: "ReporteGeneral" });
    },
    irSustitucionCFDI() {
      this.$router.push({ name: "MainSustitucion" });
    },
    irConceptos(){
      this.$router.push({ name: "Conceptos" });

    },

    DescargaHerramienta() {
      try {
        const rutaArchivo = "/CargaXml.zip";
        const enlaceTemporal = document.createElement("a");
        enlaceTemporal.href = rutaArchivo;
        enlaceTemporal.download = "CargaXml.zip";
        document.body.appendChild(enlaceTemporal);
        enlaceTemporal.click();
        document.body.removeChild(enlaceTemporal);
      } catch (error) {
        console.log(erro);
      }
    },

    listaEmpresas(item) {
      axios
        .get(
          "https://api-framework.contago.com.mx/api/Usuarios/Empresas/" +
            this.$store.state.usuario.idusuariosApp +
            "/" +
            "DESERIALIZADOR"
        )
        .then((response) => {
          this.$store.state.listaEmpresasStore = response.data.sort(
            this.comparar
          );
        })
        .catch(function (error) {
          console.log(error);
        });
    },

    comparar(a, b) {
      const nombreA = a.nombre_e.toUpperCase();
      const nombreB = b.nombre_e.toUpperCase();

      let comparacion = 0;
      if (nombreA > nombreB) {
        comparacion = 1;
      } else if (nombreA < nombreB) {
        comparacion = -1;
      }
      return comparacion;
    },
  },
};
</script>

<style>
.logo-home {
  max-width: 60%;
  height: auto;
}

.main-menu {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 100vh;
}

.menu-option {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
