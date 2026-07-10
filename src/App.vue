<script setup lang="ts">
import { ref } from 'vue'
import type { Pokemon } from './type'
import GetPokemon from './components/GetPokemon.vue'
import NavPokemon from './components/NavPokemon.vue'

const currentId = ref<number>()
const pokeData = ref<Pokemon | null>(null)
const loading = ref(false)

const fetchPokemon = async (search: string | number) => {
  loading.value = true
  try {
    const query = typeof search === 'string' ? search.toLowerCase().trim() : search

    const pokedexFetch = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`, {
      headers: { Accept: 'application/json' },
    })

    if (!pokedexFetch.ok) {
      throw new Error(`HTTP error! status: ${pokedexFetch.status}`)
    }
    const data = await pokedexFetch.json()
    pokeData.value = data

    if (data && typeof data.id === 'number') {
      currentId.value = data.id
    }
  } catch (error) {
    console.error('Failed to fetch data: ', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = (target: string | number) => {
  if (typeof target === 'number') {
    currentId.value = target
  }
  fetchPokemon(target)
}
</script>

<template>
  <header>
    <title>Pokedex</title>
  </header>
  <div id="app">
    <main>
      <h1>Pokedex</h1>
      <GetPokemon :poke-data="pokeData" :loading="loading" @search-pokemon="handleSearch" />
      <NavPokemon :current-id="currentId ?? 1" :loading="loading" @change-id="handleSearch" />
    </main>
  </div>
</template>

<style scoped>
h1 {
  color: white;
}
</style>
