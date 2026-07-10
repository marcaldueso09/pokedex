<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

defineProps<{
  catching: boolean
}>()

const defaultBall =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'
const ultraBall =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png'
const masterBall =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png'
const secretBall =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/23.gif'

const ballSrc = ref(defaultBall)

const masterSecret = [
  'arrowup',
  'arrowdown',
  'arrowup',
  'arrowdown',
  'm',
  'a',
  's',
  't',
  'e',
  'r',
  'arrowup',
  'arrowup',
]
const ultraSecret = [
  'u',
  'l',
  't',
  'r',
  'a',
  'arrowleft',
  'arrowright',
  'arrowleft',
  'arrowup',
  'arrowup',
]

const secretGame = [
  'arrowup',
  'arrowdown',
  'arrowleft',
  'arrowdown',
  's',
  'e',
  'c',
  'r',
  'e',
  't',
  'g',
  'a',
  'm',
  'e',
  'arrowup',
  'arrowup',
]

let keystrokeBuffer: string[] = []

const checkSecretMatch = (buffer: string[], secret: string[]): boolean => {
  if (buffer.length < secret.length) return false

  const trailingKeys = buffer.slice(-secret.length)
  return trailingKeys.every((val, index) => val === secret[index])
}

const readKeystrokes = (e: KeyboardEvent) => {
  const key = e.key.toLowerCase()
  console.log(key)

  if (key.length === 1 || key.startsWith('arrow')) {
    keystrokeBuffer.push(key)
  }

  const maxAllowedLength = Math.max(masterSecret.length, ultraSecret.length, secretGame.length)
  if (keystrokeBuffer.length > maxAllowedLength) {
    keystrokeBuffer.shift()
  }

  if (checkSecretMatch(keystrokeBuffer, masterSecret)) {
    ballSrc.value = masterBall
    keystrokeBuffer = []
  } else if (checkSecretMatch(keystrokeBuffer, ultraSecret)) {
    ballSrc.value = ultraBall
    keystrokeBuffer = []
  } else if (checkSecretMatch(keystrokeBuffer, secretGame)) {
    ballSrc.value = secretBall

    keystrokeBuffer = []
  }
}

onMounted(() => {
  window.addEventListener('keydown', readKeystrokes)
})

onUnmounted(() => {
  window.removeEventListener('keydown', readKeystrokes)
})
</script>

<template>
  <div id="placeholderCard">
    <div id="phImg">
      <img
        id="pokeball"
        :class="{ catch: catching }"
        :src="ballSrc || defaultBall"
        :style="ballSrc === secretBall ? { scale: 0.7 } : {}"
      />
    </div>
  </div>
</template>

<style scoped>
#placeholderCard {
  width: 20rem;
  height: 27rem;
  padding-top: 5rem;
  gap: 10rem;
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
}
#pokeball {
  transform: scale(5);
  image-rendering: pixelated;
  transform-origin: bottom center;
  animation: catchShake 2.75s ease-in-out infinite;
}

#pokeball.catch {
  animation: instantShine 0.525s ease-in-out forwards;
}

@keyframes instantShine {
  0% {
    transform: scale(5) rotate(0deg);
    filter: brightness(1);
  }
  45% {
    transform: scale(5) rotate(0deg);
    filter: brightness(1.45) drop-shadow(0 0 10px rgb(237, 200, 67));
  }
  100% {
    transform: scale(5) rotate(0deg);
    filter: brightness(0.825);
  }
}

@keyframes catchShake {
  0% {
    transform: scale(5) rotate(0deg);
  }
  10% {
    transform: scale(5) rotate(-20deg);
  }
  15% {
    transform: scale(5) rotate(20deg);
  }
  20% {
    transform: scale(5) rotate(0deg);
  }

  30% {
    transform: scale(5) rotate(0deg);
  }
  35% {
    transform: scale(5) rotate(10deg);
  }
  40% {
    transform: scale(5) rotate(-15deg);
  }
  45% {
    transform: scale(5) rotate(0deg);
  }

  55% {
    transform: scale(5) rotate(0deg);
  }
  60% {
    transform: scale(5) rotate(-15deg);
  }
  65% {
    transform: scale(5) rotate(20deg);
  }
  70% {
    transform: scale(5) rotate(0deg);
  }

  75% {
    transform: scale(5) rotate(0deg);
  }
  80% {
    transform: scale(5) rotate(5deg);
  }
  85% {
    transform: scale(5) rotate(-10deg);
  }
  90% {
    transform: scale(5) rotate(0deg);
  }
}
</style>
