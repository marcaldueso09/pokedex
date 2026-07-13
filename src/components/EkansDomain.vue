<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits<{
  (e: 'exit'): void
}>()

const GRID_SIZE = 15
const CANVAS_WIDTH = 270
const CANVAS_HEIGHT = 270

interface Point {
  x: number
  y: number
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
const score = ref(0)
const highScore = ref(Number(localStorage.getItem('ekans_highscore') || '0'))
const isGameOver = ref(false)
const isPlaying = ref(false)

let snake: Point[] = []
let direction: Point = { x: 1, y: 0 }
let nextDirection: Point = { x: 1, y: 0 }
let food: Point = { x: 0, y: 0 }
let gameInterval: number | null = null
let ctx: CanvasRenderingContext2D | null = null

function initGame() {
  snake = [
    { x: 3, y: 5 },
    { x: 2, y: 5 },
    { x: 1, y: 5 },
  ]
  direction = { x: 1, y: 0 }
  nextDirection = { x: 1, y: 0 }
  score.value = 0
  isGameOver.value = false
  spawnFood()
}

function spawnFood() {
  const cols = CANVAS_WIDTH / GRID_SIZE
  const rows = CANVAS_HEIGHT / GRID_SIZE

  while (true) {
    const newFood = {
      x: Math.floor(Math.random() * cols),
      y: Math.floor(Math.random() * rows),
    }
    const hitsSnake = snake.some((part) => part.x === newFood.x && part.y === newFood.y)
    if (!hitsSnake) {
      food = newFood
      break
    }
  }
}

function startGame() {
  if (gameInterval) clearInterval(gameInterval)
  initGame()
  isPlaying.value = true
  gameInterval = window.setInterval(gameLoop, 130)
}

function gameLoop() {
  direction = nextDirection
  const [snakeHead] = snake
  if (!snakeHead) return

  const head = {
    x: snakeHead.x + direction.x,
    y: snakeHead.y + direction.y,
  }

  const cols = CANVAS_WIDTH / GRID_SIZE
  const rows = CANVAS_HEIGHT / GRID_SIZE

  if (
    head.x < 0 ||
    head.x >= cols ||
    head.y < 0 ||
    head.y >= rows ||
    snake.some((part) => part.x === head.x && part.y === head.y)
  ) {
    if (gameInterval) clearInterval(gameInterval)
    isGameOver.value = true
    isPlaying.value = false
    return
  }

  snake.unshift(head)

  if (head.x === food.x && head.y === food.y) {
    score.value += 10
    if (score.value > highScore.value) {
      highScore.value = score.value
      localStorage.setItem('ekans_highscore', highScore.value.toString())
    }
    spawnFood()
  } else {
    snake.pop()
  }

  draw()
}

function draw() {
  if (!ctx) return
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  ctx.fillStyle = '#100f0f'
  snake.forEach((part) => {
    ctx!.fillRect(part.x * GRID_SIZE + 1, part.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2)
  })

  ctx.fillRect(food.x * GRID_SIZE + 3, food.y * GRID_SIZE + 3, GRID_SIZE - 6, GRID_SIZE - 6)
}

function handleKeyDown(e: KeyboardEvent) {
  if (!isPlaying.value) return
  switch (e.key) {
    case 'ArrowUp':
      if (direction.y === 0) nextDirection = { x: 0, y: -1 }
      break
    case 'ArrowDown':
      if (direction.y === 0) nextDirection = { x: 0, y: 1 }
      break
    case 'ArrowLeft':
      if (direction.x === 0) nextDirection = { x: -1, y: 0 }
      break
    case 'ArrowRight':
      if (direction.x === 0) nextDirection = { x: 1, y: 0 }
      break
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  if (canvasRef.value) {
    ctx = canvasRef.value.getContext('2d')
    initGame()
    draw()
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  if (gameInterval) clearInterval(gameInterval)
})
</script>

<template>
  <div class="game-container">
    <div class="header">
      <div class="scores">
        <span>SCORE: {{ score }}</span>
        <span>HI: {{ highScore }}</span>
      </div>
      <button class="exit-btn" @click="emit('exit')">×</button>
    </div>

    <div class="screen">
      <canvas ref="canvasRef" :width="CANVAS_WIDTH" :height="CANVAS_HEIGHT"></canvas>

      <div v-if="!isPlaying" class="overlay">
        <h3>{{ isGameOver ? 'GAME OVER' : 'EKANS DOMAIN' }}</h3>
        <button class="action-btn" @click="startGame">
          {{ isGameOver ? 'RETRY' : 'START' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: rgb(167, 201, 102, 0.01);
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  background: transparent;
}

.header {
  display: flex;
  width: 270px;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.scores {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: #100f0f;
}

.exit-btn {
  background: transparent;
  border: 1px solid #100f0f;
  border-radius: 3px;
  cursor: pointer;
  font-weight: bold;
  font-size: 0.85rem;
  padding: 0px 6px;
}

.screen {
  position: relative;
  border: 2px solid #100f0f;
  border-radius: 4px;
  box-shadow:
    inset 1px 1px 1px rgba(40, 48, 14, 0.588),
    inset -2px -2px 2px rgba(227, 239, 189, 0.329),
    1.5px 1.5px 2px rgba(40, 48, 14, 0.426);
}

canvas {
  display: block;
  image-rendering: pixelated;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(68, 80, 46, 0.523);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

h3 {
  margin: 0;
  font-size: 1.1rem;
  letter-spacing: 1px;
  color: #100f0f;
}

.action-btn {
  font-weight: 900;
  font-size: 0.8rem;
  letter-spacing: 1px;
  padding: 4px 12px;
  cursor: pointer;
  border: 2px solid #100f0f;
  border-radius: 4px;
  box-shadow: 1px 1px #100f0f;
  background: transparent;
  color: #100f0f;
}

.action-btn:active {
  background-color: rgba(60, 74, 32, 0.2);
}
</style>
