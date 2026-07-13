<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import type { Pokemon } from '../type'
import LoadingScreen from './LoadingScreen.vue'
import PokemonEvolutions from './PokemonEvolutions.vue'
import EkansDomain from './EkansDomain.vue'

const props = defineProps<{
  pokeData: Pokemon | null
  loading: boolean
  hollowPurple: boolean
}>()

const emit = defineEmits<{
  (e: 'search-pokemon', target: string | number): void
  (e: 'update:hollowPurple', value: boolean): void
}>()

const searchInput = ref('')
const displayName = ref('')
const error = ref<string>('')
const catching = ref(false)
const hover = ref(false)
const lastEmittedTarget = ref<string | number>('')

watch(
  () => props.pokeData,
  (newName) => {
    if (newName) {
      searchInput.value = ''
      displayName.value = newName.name
    } else {
      searchInput.value = ''
      displayName.value = ''
    }
    error.value = ''
  },
  { immediate: true },
)

const handleInput = () => {
  error.value = ''
  displayName.value = searchInput.value
}

const submitSearch = () => {
  if (props.loading || catching.value) return

  const trimmedValue = searchInput.value.trim().toLowerCase()

  if (trimmedValue) {
    const isNumeric = /^\d+$/.test(trimmedValue)
    const target = isNumeric ? parseInt(trimmedValue) : trimmedValue

    if (target === lastEmittedTarget.value && props.loading) return

    catching.value = true

    setTimeout(() => {
      catching.value = false
      emit('search-pokemon', target)
    }, 500)
  } else {
    error.value = 'Search input cannot be empty'
  }
}

onMounted(() => {
  searchInput.value = ''
  displayName.value = props.pokeData ? props.pokeData.name : ''
  error.value = ''
})

function handleEvoSelect(pokemonName: string) {
  searchInput.value = pokemonName
  submitSearch()
}

function playCry() {
  if (props.pokeData?.cries?.latest) {
    const audio = new Audio(props.pokeData.cries.latest)
    audio.volume = 0.4
    audio.play().catch((err) => {
      console.error('Audio playback failed:', err)
    })
  }
}
</script>

<template>
  <div v-if="loading">Loading Pokémon data...</div>
  <form @submit.prevent="submitSearch" autocomplete="off">
    <input type="text" v-model="searchInput" @input="handleInput" :disabled="loading || catching" />
  </form>
  <small v-if="error">
    {{ error }}
  </small>

  <div id="pokemon" v-else-if="pokeData || hollowPurple">
    <template v-if="hollowPurple">
      <EkansDomain @exit="emit('update:hollowPurple', false)" />
    </template>

    <template v-else-if="pokeData">
      <h3 id="name">{{ displayName.toUpperCase() }}</h3>
      <div id="types">
        <span v-for="(item, index) in pokeData.types" :key="item.type.name">
          {{ item.type.name.toUpperCase() }} {{ index < pokeData.types.length - 1 ? ', ' : ' ' }}
        </span>
      </div>
      <img
        id="sprite"
        :src="
          hover
            ? pokeData.sprites.other.showdown.front_default
            : pokeData.sprites.other.showdown.back_default
        "
        @mouseenter="hover = true"
        @mouseleave="hover = false"
      />
      <div id="abilities">
        <span v-for="(item, index) in pokeData.abilities" :key="item.ability.name">
          {{ item.ability.name }} {{ index < pokeData.abilities.length - 1 ? ', ' : ' ' }}
        </span>
      </div>
      <div id="info">
        <div id="stats">
          <h3>Stats:</h3>
          <ul>
            <li v-for="item in pokeData.stats" :key="item.stat.name">
              {{ item.stat.name }}: {{ item.base_stat }}
            </li>
          </ul>
        </div>
        <div id="evolutions">
          <PokemonEvolutions :currentPokemonName="pokeData?.name" @select="handleEvoSelect" />
          <div>
            <span id="cries" @click="playCry" class="material-symbols-outlined">volume_up</span>
          </div>
        </div>
      </div>
    </template>
  </div>

  <div v-else class="status-message error execution-placeholder">
    <div id="phName">
      <h3>
        {{ displayName ? displayName.toUpperCase() : 'SEARCH POKEMON' }}
      </h3>
      <LoadingScreen :catching="catching" @ekansDomain="emit('update:hollowPurple', true)" />
    </div>
  </div>
</template>

<style scoped>
input {
  border: 0;
  border-bottom: 1px solid black;
}
#search {
  margin: 0.5rem;
}
#pokemon {
  margin-top: 0.5rem;
  width: 20rem;
  min-height: 27rem;
  display: flex;
  justify-content: space-between;
  flex-flow: column;
  align-items: center;
  padding: 1rem;
  gap: 0.5rem;
  text-shadow: 1.5px 1.5px rgb(112, 146, 47);
}
#types {
  gap: 0.35rem;
}
#sprite {
  image-rendering: pixelated;
  transition: opacity 0.3s ease-in-out;
  cursor: cell;
}
#sprite:hover {
  opacity: 0.9;
}
ul {
  list-style: none;
}
#abilities {
  gap: 0.35rem;
  width: 100%;
  display: flex;
  flex-flow: row;
  justify-content: center;
}
#info {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 0.5rem;
}
#stats {
  flex: 1;
  width: 70%;
}
#stats ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
#evolutions {
  width: 30%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-flow: column;
  gap: 1rem;
}
#cries {
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
#placeholderCard {
  margin: 1rem 0;
}
#phName h3 {
  margin-top: 1rem;
  color: white;
  display: flex;
  justify-content: center;
}
</style>
