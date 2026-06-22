<template>
    <div class="ret-root">

        <div class="ret-header">
            <div class="ret-header__left">
                <div>
                    <div class="ret-header__title">Retenciones e Información de Pagos</div>
                    <div class="ret-header__sub">
                        CFDI Retenciones v2.0 &nbsp;·&nbsp; {{ token.rfc }}
                    </div>
                </div>
            </div>

            <!-- CHIPS DE NAVEGACIÓN -->
            <div class="ret-nav">
                <div v-for="s in secciones" :key="s.value" class="ret-nav__chip"
                    :class="{ 'ret-nav__chip--active': seccion === s.value }"
                    @click="seccion = s.value">
                    <q-icon :name="s.icon" size="15px" class="q-mr-xs" />
                    {{ s.label }}
                </div>
            </div>
        </div>

        <div class="ret-body">
            <DescargasRetenciones v-if="seccion === 'historial'" />
            <RetencionesDocumentos v-if="seccion === 'documentos'" />
        </div>

    </div>
</template>

<script>
import DescargasRetenciones from './DescargasRetenciones.vue'
import RetencionesDocumentos from './RetencionesDocumentos.vue'

export default {
    name: 'Retenciones',
    components: { DescargasRetenciones, RetencionesDocumentos },

    data() {
        return {
            seccion: 'historial',
            secciones: [
                { value: 'historial',   label: 'Historial de Descargas', icon: 'mdi-download-multiple' },
                { value: 'documentos',  label: 'Documentos',             icon: 'mdi-file-percent-outline' },
            ],
        }
    },

    computed: {
        token() { return this.$store.state.usuario },
    },
}
</script>

<style scoped>
.ret-root {
    --ink:       #0f1623;
    --ink-soft:  #5a6480;
    --primary:   #dc2626;
    --primary-dk:#b91c1c;
    --surface:   #f4f6fb;
    --border:    #e2e6f0;
    --chip-bg:   rgba(220,38,38,.08);

    background: var(--surface);
    min-height: 100vh;
    font-family: 'IBM Plex Sans', sans-serif;
}

.ret-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    padding: 14px 24px;
    background: #fff;
    border-bottom: 1px solid var(--border);
    box-shadow: 0 1px 6px rgba(0,0,0,.05);
}

.ret-header__left {
    display: flex;
    align-items: center;
    gap: 12px;
}

.ret-header__title {
    font-size: 1rem;
    font-weight: 700;
    color: var(--ink);
    letter-spacing: -0.2px;
    line-height: 1.2;
}

.ret-header__sub {
    font-size: 0.72rem;
    font-weight: 500;
    color: var(--ink-soft);
    letter-spacing: 0.6px;
    text-transform: uppercase;
    margin-top: 1px;
}

.ret-nav {
    display: flex;
    gap: 6px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 4px;
}

.ret-nav__chip {
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

.ret-nav__chip:hover {
    background: var(--chip-bg);
    color: var(--primary);
}

.ret-nav__chip--active {
    background: var(--primary);
    color: #fff;
    box-shadow: 0 3px 10px rgba(220,38,38,.3);
}

.ret-nav__chip--active:hover {
    background: var(--primary-dk);
    color: #fff;
}

.ret-body { padding: 0; }
</style>