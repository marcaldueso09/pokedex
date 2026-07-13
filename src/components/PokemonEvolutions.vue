<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Evolutions } from '@/type'

const props = defineProps<{
  currentPokemonName: string | undefined
}>()

const emit = defineEmits<{
  (e: 'select', name: string): void
}>()

const evoCache = new Map<string, string[]>()
const fullFamily = ref<string[]>([])
const loading = ref(false)
const error = ref('')
const isExpanded = ref(false)

function flattenChain(node: Evolutions, list: string[] = []): string[] {
  list.push(node.species.name)
  for (const nextNode of node.evolves_to) {
    flattenChain(nextNode, list)
  }
  return list
}

async function loadEvolutions(name: string) {
  const cleanName = name.toLowerCase().trim()

  if (evoCache.has(cleanName)) {
    fullFamily.value = evoCache.get(cleanName)!
    return
  }

  loading.value = true
  error.value = ''

  try {
    const species = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${cleanName}`)
    if (!species.ok) throw new Error('Evolution data not found.')
    const speciesData = await species.json()

    const chain = await fetch(speciesData.evolution_chain.url)
    const chainData = await chain.json()

    const flattened = flattenChain(chainData.chain)

    fullFamily.value = flattened
    evoCache.set(cleanName, flattened)
  } catch (err: unknown) {
    if (err instanceof Error) {
      error.value = err.message
    } else {
      error.value = 'An unexpected error occurred.'
    }
    fullFamily.value = []
  } finally {
    loading.value = false
  }
}

watch(
  () => props.currentPokemonName,
  (newName) => {
    if (newName) {
      loadEvolutions(newName)
    } else {
      fullFamily.value = []
    }
  },
  { immediate: true },
)
</script>

<template>
  <div id="pokemonSpecies">
    <button class="nokia-btn" @click="isExpanded = !isExpanded">EVL</button>

    <div v-if="isExpanded" class="evo-dropdown">
      <div v-if="loading" class="status">...</div>
      <div v-else-if="error" class="status error">{{ error }}</div>
      <div v-else class="evo-list">
        <template v-for="member in fullFamily" :key="member">
          <div
            v-if="member !== currentPokemonName?.toLowerCase()"
            class="evo-item clickable"
            @click="(emit('select', member), (isExpanded = false))"
          >
            {{ member.toUpperCase() }}
          </div>
          <div v-else class="evo-item current">
            {{ currentPokemonName?.toUpperCase() }}
          </div>
        </template>

        <div v-if="fullFamily.length <= 1" class="status">NONE</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#pokemonSpecies {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
}

.nokia-btn {
  font-weight: 900;
  font-size: 0.9rem;
  letter-spacing: 1px;
  padding: 4px 10px;
  cursor: pointer;
  border: 2px solid #100f0f;
  border-radius: 5px;
  box-shadow: 1.5px 1.5px rgba(60, 74, 32, 0.607);
  background: transparent;
}

.nokia-btn:active {
  background-color: #3f4d20b7;
}

button {
  text-shadow: 1.5px 1.5px rgba(60, 74, 32, 0.607);
}

.evo-dropdown {
  position: absolute;
  top: 110%;
  right: 0;
  background-color: rgb(167, 201, 102);
  border: 2px solid #100f0f;
  border-radius: 5px;
  min-width: 120px;
  z-index: 10;
  box-shadow: 1.5px 1.5px rgba(60, 74, 32, 0.607);
  max-height: 145px;
  overflow-y: scroll;
}

.evo-list {
  display: flex;
  flex-direction: column;
  background-color: rgb(167, 201, 102);
}

.evo-item {
  padding: 6px 10px;
  font-size: 0.85rem;
  color: #100f0f;
  text-align: center;
  font-weight: bold;
  background-color: rgb(167, 201, 102);
}

.clickable {
  cursor: pointer;
}

.clickable:hover {
  background-color: #3f4d20b7;
}

.current {
  background-color: rgba(60, 74, 32, 0.25);
  border-left: 3px solid #100f0f;
  border-right: 3px solid #100f0f;
}

.status {
  padding: 6px 10px;
  font-size: 0.85rem;
  color: #100f0f;
  text-align: center;
}

.error {
  color: #8b0000;
}

.evo-dropdown::-webkit-scrollbar {
  width: 8px;
}

.evo-dropdown::-webkit-scrollbar-track {
  background: rgb(147, 181, 82);
  border-left: 1px solid #100f0f;
}

.evo-dropdown::-webkit-scrollbar-thumb {
  background: #100f0f;
  border-radius: 0px;
}
</style>
