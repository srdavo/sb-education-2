<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useLevels } from '@/composables/useLevels'
import { useLevelCompletions } from '@/composables/useLevelCompletions'

const router = useRouter()
const { user, signOut } = useAuth()
const { data: levels, isLoading: levelsLoading } = useLevels()
const { completions } = useLevelCompletions()

async function handleSignOut() {
    await signOut()
    router.push({ name: 'landing' })
}
</script>

<template>
    <div class="view simple-container direction-column gap-24">

        <div class="simple-container justify-between align-center">
            <span class="title-large weight-500">Elige un nivel</span>
            <button
                class="style-7 small surface-container rounded weight-500"
                @click="handleSignOut"
            >
                <md-ripple></md-ripple>
                Cerrar sesión
            </button>
        </div>

        <span class="body-large outline-text">{{ user?.email }}</span>

        <!-- Skeleton mientras carga -->
        <div v-if="levelsLoading" class="simple-container gap-16">
            <div v-for="n in 4" :key="n" class="level-card level-card--skeleton"></div>
        </div>

        <!-- Niveles desde DB -->
        <div v-else class="simple-container flex-wrap gap-16">
            <button
                v-for="lvl in levels"
                :key="lvl.id"
                class="style-3 surface-container level-card"
                @click="router.push({ name: 'play', params: { level: lvl.id } })"
            >
                <div class="simple-container justify-between align-center width-100">
                    <span class="title-medium weight-500">{{ lvl.label }}</span>
                    <span
                        v-if="completions[lvl.id]"
                        class="score-badge label-medium weight-500"
                    >
                        {{ completions[lvl.id].score_percentage }}%
                    </span>
                </div>
                <span class="body-medium outline-text">{{ lvl.description }}</span>
                <span v-if="completions[lvl.id]" class="label-small outline-text">
                    Mejor intento
                </span>
            </button>
        </div>

    </div>
</template>

<style scoped>
.level-card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    min-width: 160px;
    text-align: left;
}

.level-card--skeleton {
    min-width: 160px;
    height: 72px;
    border-radius: 24px;
    background: var(--md-sys-color-surface-variant);
    opacity: 0.5;
    animation: pulse 1.4s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 0.25; }
}

.score-badge {
    padding: 2px 8px;
    border-radius: 24px;
    background: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-primary-container);
}
</style>
