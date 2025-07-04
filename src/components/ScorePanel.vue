<template>
    <div class="container bg-dark text-white p-3">
        <div class="d-flex gap-2 mb-2">
            <div class="flex-grow-1 bg-white text-dark p-3 rounded">
                <h1 class="m-0">Score: {{ gameScore }}</h1>
            </div>
        </div>
        <div class="d-flex gap-2 align-items-stretch">
            <div class="bg-white p-3 rounded d-flex flex-column justify-content-center align-items-center"
                style="height: 250px;">
                <template v-if="latestPlayedCard !== null">
                    <h3 class="text-dark mb-2">Latest Card:</h3>
                    <img :src="latestPlayedCard.cardValue?.images?.png" style="height: 200px;" />
                </template>
                <template v-else>
                    <h4 class="text-muted fst-italic">Start Game</h4>
                </template>
            </div>
            <div class="d-flex flex-column justify-content-between flex-grow-1" style="height: 250px;">
                <div class="bg-white text-dark p-3 rounded mb-2">
                    <h4 class="m-0">Now Playing:</h4>
                    <h4 class="m-0">{{ currentPlayer }}</h4>
                </div>
                <div class="bg-white text-dark p-3 rounded mt-auto d-flex flex-column align-items-start mt-1"
                    style="min-height: 3rem;">
                    <h3 class="m-0">Latest state:</h3>
                    <h4 class="m-0">player: {{ latestPlayer }}</h4>
                    <h4 class="m-0">play: {{ latestPlayedCard?.cardValue.code }}</h4>
                    <h4 class="m-0">effect: {{ latestPlayer }}</h4>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import type { Card } from '@/types/baseType'
import { translateCardsValue } from '@/utils/cardUtils'
const props = defineProps<{
    latestPlayedCard: Card | null
    latestPlayer: string | null
    currentPlayer: string | null
}>()

const emit = defineEmits<{
    (e: 'score-updated', newScore: number): void
}>()

let gameScore = ref(0);

// 處理分數功能
function handleScore(card: Card) {
    const translatedValue = parseInt(translateCardsValue(card.score))
    const lastGameScore = gameScore.value
    gameScore.value = translatedValue + lastGameScore
    emit('score-updated', gameScore.value)
    console.log('origin Score:', lastGameScore, 'Card value:', translatedValue, 'Score:', gameScore.value)
}

defineExpose({
    handleScore
})
</script>

<style scoped></style>