<template>
  <div class="simple-container flex-wrap gap-8">
    <button
      v-for="option in renderedOptions"
      :key="option"
      class="style-3 surface-container-high on-surface-text"
      @click="submit(option)"
    >
      {{ option }}
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  activity: { type: Object, required: true },
  attemptsUsed: { type: Number, required: true }
})

const emit = defineEmits(['submit'])

const renderedOptions = computed(() => {
  const options = props.activity.interaction.options || []
  if (!props.activity.settings?.shuffle_choices) return options
  return [...options].sort(() => Math.random() - 0.5)
})

function submit(answer) {
  emit('submit', { answer, attemptsUsed: props.attemptsUsed + 1 })
}
</script>
