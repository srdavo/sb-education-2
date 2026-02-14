<template>
  <div class="view simple-container direction-column gap-16">

    <!-- Loading -->
    <div v-if="loading" class="simple-container direction-column gap-8">
      <span class="title-large weight-500">Nivel {{ level }}</span>
      <span class="body-large outline-text">Cargando actividades...</span>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="simple-container direction-column gap-8">
      <span class="title-medium">No se pudieron cargar las actividades</span>
      <button class="style-7 surface-container rounded" @click="router.push({ name: 'home' })">Volver al inicio</button>
    </div>

    <!-- Juego activo -->
    <template v-else-if="session && !isComplete">
      <!-- Header con progreso -->
      <div class="simple-container justify-between align-center">
        <span class="title-large weight-500">Nivel {{ level }}</span>
        <span class="label-medium outline-text">{{ session.current_index + 1 }} / {{ session.queue.length }}</span>
      </div>

      <!-- Barra de progreso -->
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>

      <ActivityPlayer
        :activity="currentActivity"
        :user-id="user.id"
        :session-id="session.id"
        @completed="onActivityCompleted"
        @next="onNext"
      />
    </template>

    <!-- Resultados finales -->
    <div v-else-if="isComplete" class="simple-container direction-column gap-24 align-center text-center">
      <span class="display-small weight-500">{{ score.percentage }}%</span>
      <div class="simple-container direction-column gap-8">
        <span class="title-large">Nivel {{ level }} completado</span>
        <span class="body-large outline-text">{{ score.correct }} de {{ score.total }} actividades correctas</span>
      </div>
      <button class="style-3 primary on-primary-text" @click="router.push({ name: 'home' })">
        Volver al inicio
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { supabase } from '@/lib/supabaseClient'
import { createSession, advanceSession, isSessionComplete, getSessionScore } from '@/engine/sessionEngine'
import { recordLevelCompletion } from '@/engine/resultsRecorder'
import ActivityPlayer from '@/components/player/ActivityPlayer.vue'

const route = useRoute()
const router = useRouter()
const { user } = useAuth()

const level = Number(route.params.level)
const loading = ref(true)
const error = ref(false)
const session = ref(null)
const isComplete = ref(false)
const score = ref({ correct: 0, total: 0, percentage: 0 })
const pendingResult = ref(null)

const currentActivity = computed(() =>
  session.value?.queue[session.value.current_index] ?? null
)

const progressPercent = computed(() => {
  if (!session.value) return 0
  return Math.round((session.value.current_index / session.value.queue.length) * 100)
})

onMounted(async () => {
  const { data, error: fetchError } = await supabase
    .from('activities')
    .select('definition')
    .eq('level', level)

  if (fetchError || !data?.length) {
    error.value = true
    loading.value = false
    return
  }

  const activities = data.map(row => row.definition)

  session.value = createSession({
    userId: user.value.id,
    level,
    activities
  })
  loading.value = false
})

function onActivityCompleted(result) {
  pendingResult.value = result
}

function onNext() {
  if (pendingResult.value) {
    advanceSession(session.value, pendingResult.value)
    pendingResult.value = null
  }
  if (isSessionComplete(session.value)) {
    score.value = getSessionScore(session.value)
    isComplete.value = true
    recordLevelCompletion({ userId: user.value.id, level, score: score.value })
  }
}
</script>

<style scoped>
.progress-bar {
  height: 4px;
  border-radius: 4px;
  background: var(--md-sys-color-surface-variant);
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  border-radius: 4px;
  background: var(--md-sys-color-primary);
  transition: width 400ms cubic-bezier(0, 0, 0.5, 1);
}
</style>
