<template>
  <form class="simple-container direction-column gap-8" @submit.prevent="onSubmit">
    <input
      v-model="inputValue"
      class="input-1"
      :maxlength="activity.interaction.input_rules?.maxChars || 20"
      placeholder="Escribe tu respuesta"
      autocomplete="off"
    />
    <button type="submit" class="style-3 primary on-primary-text">Enviar</button>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  activity: { type: Object, required: true },
  attemptsUsed: { type: Number, required: true }
})

const emit = defineEmits(['submit'])
const inputValue = ref('')

watch(() => props.activity.id, () => { inputValue.value = '' }, { immediate: true })

function onSubmit() {
  if (!inputValue.value.trim()) return
  emit('submit', { answer: inputValue.value, attemptsUsed: props.attemptsUsed + 1 })
  inputValue.value = ''
}
</script>
