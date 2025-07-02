<template>
    <div class="d-flex justify-content-center align-items-start my-2">
        <div class="d-flex flex-row align-items-center justify-content-center text-white bg-dark p-4 rounded">
            <div class="mb-3 text-center mx-2">
                <div class="d-flex justify-content-center align-items-center bg-light rounded p-4"
                    style="background-color: white; width: 400px; min-height: 300px;">
                    <template v-if="latestPlayedCard !== null">
                        <div class="d-flex flex-row align-items-start">
                            <img :src="latestPlayedCard.cardValue?.images?.png" style="height: 200px;" class="me-3" />
                            <div class="text-dark text-start p-3" style="min-width: 150px;">
                                <p class="mb-1">Value: {{ latestPlayedCard.cardValue?.value }}</p>
                                <p class="mb-1">Suit: {{ latestPlayedCard.cardValue?.suit }}</p>
                                <p class="mb-1">Level: {{ latestPlayedCard.level }}</p>
                                <p class="mb-1">Score: {{ latestPlayedCard.score }}</p>
                                <p class="mb-0">Effect: {{ latestPlayedCard.effect }}</p>
                            </div>
                        </div>
                    </template>
                    <template v-else>
                        <p class="text-muted fst-italic">Start Game</p>
                    </template>
                </div>
            </div>
            <div class="mb-3 text-center mx-2">
                <div class="d-flex flex-column justify-content-start align-items-center bg-light rounded p-3">
                    <h1 class="mt-2 mb-0 text-dark">Current Score:</h1>
                    <h1 class="mt-2 mb-0 text-dark">{{ gameScore }}</h1>
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
}>()
let gameScore = ref(0);

// 處理分數功能
function handleScore(card: Card) {
    const translatedValue = parseInt(translateCardsValue(card.score))
    const lastGameScore = gameScore.value
    gameScore.value = translatedValue + lastGameScore
    console.log('lastGameScore:', lastGameScore, 'translatedValue:', translatedValue, 'GameScore:', gameScore.value)
}

defineExpose({
    handleScore
})
</script>

<style scoped></style>