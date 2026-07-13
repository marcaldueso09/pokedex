<script setup lang="ts">
const props = defineProps<{
  currentId: number
  loading: boolean
  isActive: boolean
}>()

const emit = defineEmits<{
  (e: 'change-id', id: number): void
  (e: 'reset'): void
}>()

const next = () => {
  emit('change-id', props.currentId + 1)
}

const prev = () => {
  if (props.currentId > 1) {
    emit('change-id', props.currentId - 1)
  }
}
</script>

<template>
  <div id="buttons">
    <div id="power">
      <span
        id="powerBtn"
        class="material-symbols-outlined"
        @click="emit('reset')"
        :class="{ 'turned-on': isActive }"
      >
        power_settings_new
      </span>
    </div>
    <div id="nav">
      <span
        id="down"
        class="material-symbols-outlined"
        @click="prev"
        :disabled="currentId <= 1 || loading"
      >
        keyboard_arrow_down
      </span>
      <span id="up" class="material-symbols-outlined" @click="next"> keyboard_arrow_up </span>
    </div>
  </div>
</template>

<style scoped>
#buttons {
  margin-top: 1rem;
  width: 20rem;
  display: flex;
  padding: 0.5rem 0.5rem;
}
#power,
#nav {
  padding: 0.5rem;
  width: 50%;
  cursor: pointer;
}
#nav {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
#powerBtn,
#down,
#up {
  padding: 0.5rem 1rem;
  border-radius: 10px;
  background-color: rgb(221, 218, 218);
  transition: color 0.2s ease;
}
#powerBtn.turned-on {
  color: #ff3838;
  filter: drop-shadow(0 0 3px rgba(255, 56, 56, 0.6));
  transition:
    color 0.2s ease,
    filter 0.2s ease;
}
</style>
