<template>
    <div class="dsc-root">

        <div class="dsc-header">
            <div class="dsc-header__left">
                <!-- <div class="dsc-header__icon">
                    <q-icon name="mdi-cloud-download" size="22px" color="white" />
                </div> -->
                <div>
                    <div class="dsc-header__title">Descarga Masiva SAT</div>
                    <div class="dsc-header__sub">
                        CFDI v1.5 &nbsp;·&nbsp; {{ token.rfc }}
                    </div>
                </div>
            </div>

            <!-- CHIPS DE NAVEGACIÓN -->
            <div class="dsc-nav">
                <div v-for="s in secciones" :key="s.value" class="dsc-nav__chip"
                    :class="{ 'dsc-nav__chip--active': seccion === s.value }" @click="seccion = s.value">
                    <q-icon :name="s.icon" size="15px" class="q-mr-xs" />
                    {{ s.label }}
                </div>
            </div>
        </div>

        <div class="dsc-body">
            <DescargasCFDI v-if="seccion === 'cfdi'" />
            <!-- <DescargasUUID v-if="seccion === 'uuid'" /> -->
            <DescargasMetadata v-if="seccion === 'metadata'" />

            <DescargasRetenciones v-if="seccion === 'retenciones'" />
        </div>

    </div>
</template>

<script>
import DescargasCFDI from './DescargasXMLS.vue'
// import DescargasUUID from './DescargasUUID.vue'
import DescargasMetadata from './DescargasMetadata.vue'
import DescargasRetenciones from './DescargasRetenciones.vue'
export default {
    name: 'Descargas',
    components: { DescargasCFDI, DescargasMetadata, DescargasRetenciones  },

    data() {
        return {
            seccion: 'cfdi',
            secciones: [
                { value: 'cfdi', label: 'CFDI', icon: 'mdi-file-document-multiple-outline' },
                { value: 'metadata', label: 'Metadata', icon: 'mdi-table-search' },
                { value: 'retenciones', label: 'Retenciones', icon: 'mdi-file-percent-outline' },  ],
        }
    },

    computed: {
        token() { return this.$store.state.usuario },
        componente() {
            return { cfdi: 'DescargasCFDI', uuid: 'DescargasUUID', metadata: 'DescargasMetadata' }[this.seccion]
        },
    },
}
</script>

<style scoped>

.dsc-root {
    --ink: #0f1623;
    --ink-soft: #5a6480;
    --indigo: #E74747;
    --indigo-dk: #E74747;
    --emerald: #00bfa5;
    --surface: #f4f6fb;
    --border: #e2e6f0;
    --chip-bg: rgba(61, 90, 254, .08);

    background: var(--surface);
    min-height: 100vh;
}

.dsc-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    padding: 14px 24px;
    background: #fff;
    border-bottom: 1px solid var(--border);
    box-shadow: 0 1px 6px rgba(0, 0, 0, .05);
}

.dsc-header__left {
    display: flex;
    align-items: center;
    gap: 12px;
}

.dsc-header__icon {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: linear-gradient(135deg, var(--indigo), #E74747);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(61, 90, 254, .35);
    flex-shrink: 0;
}

.dsc-header__title {
    font-size: 1rem;
    font-weight: 700;
    color: var(--ink);
    letter-spacing: -0.2px;
    line-height: 1.2;
}

.dsc-header__sub {
    font-size: 0.72rem;
    font-weight: 500;
    color: var(--ink-soft);
    letter-spacing: 0.6px;
    text-transform: uppercase;
    margin-top: 1px;
}

.dsc-nav {
    display: flex;
    gap: 6px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 4px;
}

.dsc-nav__chip {
    display: flex;
    align-items: center;
    padding: 5px 14px;
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--ink-soft);
    cursor: pointer;
    transition: all .18s ease;
    user-select: none;
    letter-spacing: 0.2px;
}

.dsc-nav__chip:hover {
    background: var(--chip-bg);
    color: var(--indigo);
}

.dsc-nav__chip--active {
    background: var(--indigo);
    color: #fff;
    box-shadow: 0 3px 10px rgba(61, 90, 254, .35);
}

.dsc-nav__chip--active:hover {
    background: var(--indigo-dk);
    color: #fff;
}

.dsc-body {
    padding: 0;
}
</style>