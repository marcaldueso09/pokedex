<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Evolutions } from '@/type'

const props = defineProps<{
  currentPokemonName: string | undefined
}>()

const evoCache = new Map<string, { past: string[]; future: string[] }>()

const pastEvolutions = ref<string[]>([])
const futureEvolutions = ref<string[]>([])
const loading = ref(false)
const error = ref('')

function findEvolutions(
  node: Evolutions,
  targetName: string,
  ancestors: string[] = [],
): { past: string[]; future: string[] } | null {
  const currentName = node.species.name

  if (currentName === targetName) {
    const futureList = node.evolves_to.map((child) => child.species.name)
    return {
      past: [...ancestors],
      future: futureList,
    }
  }

  for (const nextNode of node.evolves_to) {
    const found = findEvolutions(nextNode, targetName, [...ancestors, currentName])
    if (found) return found
  }

  return null
}

async function loadEvolutions(name: string) {
  const cleanName = name.toLowerCase().trim()

  if (evoCache.has(cleanName)) {
    const cached = evoCache.get(cleanName)!
    pastEvolutions.value = cached.past
    futureEvolutions.value = cached.future
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

    const relation = findEvolutions(chainData.chain, cleanName)

    if (relation) {
      pastEvolutions.value = relation.past
      futureEvolutions.value = relation.future
      evoCache.set(cleanName, relation)
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      error.value = err.message
    } else {
      error.value = 'An unexpected error occured.'
    }
    pastEvolutions.value = []
    futureEvolutions.value = []
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
      pastEvolutions.value = []
      futureEvolutions.value = []
    }
  },
  { immediate: true },
)
</script>

<template>
  <div id="pokemonSpecies">
    <span> EVL </span>
  </div>
</template>
