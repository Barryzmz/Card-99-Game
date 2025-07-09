<template>
  <div class="container-fluid vh-100 py-5 bg-success">
    <div class="card mb-4 mx-auto" style="max-width: 500px;">
      <div class="card-body text-center">
        <h2 class="card-title">Welcome Card - 99 Game</h2>
      </div>
    </div>

    <form @submit.prevent="onSubmit" class="mx-auto" style="max-width: 500px;">
      <div class="mb-3">
        <label for="playerName" class="text-white form-label">玩家名稱</label>
        <input
          id="playerName"
          type="text"
          class="form-control"
          v-model="playerName"
          maxlength="10"
          placeholder="最多 10 個字"
          required
        />
        <div class="text-white form-text">{{ playerName.length }}/10 字</div>
      </div>
      <div class="mb-3">
        <label for="opponentCount" class="text-white form-label">對手人數</label>
        <input
          id="opponentCount"
          type="number"
          class="form-control"
          v-model.number="opponentCount"
          :min="1"
          :max="5"
          placeholder="1 - 5 人"
          required
        />
      </div>
      <div class="d-flex flex-row gap-3 mb-3">
        <div class="flex-fill">
          <label for="startDecreaseTurn" class="text-white form-label">
            開始減少手牌的出手次數
          </label>
          <input
            id="startDecreaseTurn"
            type="number"
            class="form-control"
            v-model.number="roundSetting.firstRound"
            :min="1"
            :max="100"
            placeholder="例如：第5次出手開始"
            required
          />
        </div>
        <div class="flex-fill">
          <label for="decreaseInterval" class="text-white form-label">
            之後每幾次出手減 1 張手牌
          </label>
          <input
            id="decreaseInterval"
            type="number"
            class="form-control"
            v-model.number="roundSetting.nextRound"
            :min="1"
            :max="100"
            placeholder="例如：每 2 次減 1 張"
            required
          />
        </div>
      </div>
      <button type="submit" class="btn btn-primary w-100">
        開始遊戲
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import type { RoundSetting } from '@/types/baseType'
const router = useRouter()

const playerName = ref('')
const opponentCount = ref<number | null>(1)
const roundSetting =  reactive<RoundSetting>({
  firstRound: 20,
  nextRound: 5
})

function onSubmit() {
  if (
    playerName.value.trim() &&
    opponentCount.value !== null
  ) {
    router.push({
      name: 'GameView',
      query: {
        playerName: playerName.value,
        opponentCount: opponentCount.value,
        firstRound: roundSetting.firstRound,
        nextRound: roundSetting.nextRound
      }
    })
  }
}
</script>

<style scoped>
.container-fluid {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.card,form {
  width: 100%;
}
</style>
