<template>
  <div class="simple-container direction-column gap-16" v-if="activity">

    <!-- Progreso -->
    <div class="simple-container justify-between align-center">
      <span class="label-medium outline-text">{{ activity.prompt.title }}</span>
      <span class="label-medium outline-text">{{ attemptsUsed }} / {{ activity.settings?.attempts_limit ?? '∞' }} intentos</span>
    </div>

    <!-- Estímulo -->
    <div class="simple-container direction-column gap-8">
      <span class="title-medium">{{ activity.prompt.instruction }}</span>
      <img
        v-if="activity.stimulus?.imageUrl"
        :src="activity.stimulus.imageUrl"
        :alt="activity.prompt.title"
        class="stimulus-image"
      />
      <span v-if="activity.stimulus?.text" class="headline-small weight-500">{{ activity.stimulus.text }}</span>
    </div>

    <!-- Template dinámico -->
    <component
      v-if="state === 'ACTIVE' || state === 'READY'"
      :is="templateComponent"
      :key="activity.id"
      :activity="activity"
      :attempts-used="attemptsUsed"
      @submit="evaluate"
    />

    <!-- Feedback -->
    <div v-if="state === 'FEEDBACK' || state === 'COMPLETED'" class="simple-container direction-column gap-8">
      <span
        class="body-large weight-500"
        :style="{ color: isCorrect ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-error)' }"
      >
        {{ feedbackMessage }}
      </span>
    </div>

    <!-- Botón siguiente -->
    <button
      v-if="state === 'COMPLETED'"
      class="style-3 primary on-primary-text"
      @click="$emit('next')"
    >
      Siguiente
    </button>

  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { PLAYER_STATES } from '@/engine/playerStates'
import { templateRegistry } from './templateRegistry'
import { recordActivityResult } from '@/engine/resultsRecorder'

const props = defineProps({
  activity: { type: Object, required: true },
  userId: { type: String, required: true },
  sessionId: { type: String, required: true }
})

const emit = defineEmits(['completed', 'next'])

const state = ref(PLAYER_STATES.LOADING)
const startTs = ref(0)
const attemptsUsed = ref(0)
const feedbackMessage = ref('')
const isCorrect = ref(false)

const templateComponent = computed(() => templateRegistry[props.activity.type])

watch(
  () => props.activity.id,
  () => resetForNewActivity(),
  { immediate: true }
)

function resetForNewActivity() {
  state.value = PLAYER_STATES.LOADING
  startTs.value = 0
  attemptsUsed.value = 0
  feedbackMessage.value = ''
  isCorrect.value = false

  queueMicrotask(() => {
    startTs.value = Date.now()
    state.value = PLAYER_STATES.ACTIVE
  })
}

async function evaluate(submission) {
  state.value = PLAYER_STATES.EVALUATING
  attemptsUsed.value = submission.attemptsUsed

  const normalize = (v) => {
    const raw = String(v ?? '').trim()
    return props.activity.settings?.case_sensitive ? raw : raw.toUpperCase()
  }

  const input = normalize(submission.answer)
  const correct = normalize(props.activity.evaluation.correct_answer)
  const variants = (props.activity.evaluation.accepted_variants || []).map(normalize)

  isCorrect.value = input === correct || variants.includes(input)
  feedbackMessage.value = isCorrect.value
    ? props.activity.feedback.on_correct
    : props.activity.feedback.on_wrong
  state.value = PLAYER_STATES.FEEDBACK

  const exhausted = attemptsUsed.value >= (props.activity.settings?.attempts_limit ?? 1)

  if (isCorrect.value || exhausted) {
    const result = {
      user_id: props.userId,
      activity_id: props.activity.id,
      attempts_count: attemptsUsed.value,
      correct: isCorrect.value,
      time_spent_ms: Date.now() - startTs.value,
      hints_used: 0,
      answer_submitted: String(submission.answer),
      session_id: props.sessionId
    }
    recordActivityResult(result)
    emit('completed', result)
    state.value = PLAYER_STATES.COMPLETED
    return
  }

  setTimeout(() => { state.value = PLAYER_STATES.ACTIVE }, 350)
}
</script>

<style scoped>
.stimulus-image {
  max-width: 100%;
  max-height: 240px;
  border-radius: 12px;
  object-fit: contain;
}
</style>
