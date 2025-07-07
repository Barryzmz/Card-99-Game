<template>
    <div class="container bg-dark text-white p-3">
        <div class="d-flex gap-2 mb-2">
            <div class="flex-grow-1 bg-white text-dark p-3 rounded">
                <h1 class="m-0">Score: {{ gameScore }}</h1>
            </div>
            <div class="flex-grow-1 bg-white text-dark p-3 rounded">
                <h3 class="m-0">Now Playing:</h3>
                <h4 class="fw-bold m-0">{{ currentPlayer }}</h4>
            </div>
        </div>
        <div class="d-flex gap-2 align-items-stretch">
            <div class="bg-white p-3 rounded d-flex flex-column justify-content-center align-items-center mb-0">
                <template v-if="latestPlayedCard !== null">
                    <h3 class="text-dark mb-2">Latest Card:</h3>
                    <img :src="latestPlayedCard.cardValue?.images?.png" style="height: 150px;" />
                </template>
                <template v-else>
                    <h4 class="text-muted fst-italic">Start Game</h4>
                </template>
            </div>
            <div class="d-flex flex-column justify-content-start flex-grow-1">
                <div class="bg-white text-dark p-3 rounded d-flex flex-column align-items-start mt-0">
                    <h4 class="m-0">Play Count: {{ playCount }}</h4>
                    <h4 class="m-0">Max hand card: {{ maxHandCardCount }}</h4>
                </div>
                <div class="bg-white text-dark p-3 rounded d-flex flex-column align-items-start mt-2">
                    <h3 class="m-0">Latest state:</h3>
                    <h4 class="m-0">player: {{ latestPlayer }}</h4>
                    <h4 class="m-0">play: {{ latestPlayedCard?.cardValue.code }}</h4>
                    <h4 class="m-0">effect: {{ latestEffect }}</h4>
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
    maxHandCardCount: number | null
}>()

const emit = defineEmits<{
    (e: 'score-updated', newScore: number): void
    (e: 'playCount-updated', playCount: number): void
}>()

let gameScore = ref(0);
let latestEffect = ref('')
let latestPlayer = ref('')
let playCount = ref(0)

// 處理分數功能
function handleScore(card: Card, player: string) {
    latestPlayer.value = player
    handleEffectCard(card)
    handleCardEffectDiscription(card)
    emit('score-updated', gameScore.value)
    playCount.value++
    emit('playCount-updated', playCount.value)
}

// 處理功能牌
function handleEffectCard(card: Card) {
    switch (card.effect) {
        case 'set_score_to_ninetyNine':
            gameScore.value = 99
            break;

        case 'reset_score':
            gameScore.value = 0
            break;

        default:
            const translatedValue = parseInt(translateCardsValue(card.score))
            const lastGameScore = gameScore.value
            gameScore.value = translatedValue + lastGameScore
            break;
    }
}

// 處理Effect 描述
function handleCardEffectDiscription(card: Card) {
    switch (card.effect) {
        case "reverse_turn_order":
            latestEffect.value = "Reverse turn order";
            break;
        case "designate_next_player":
            latestEffect.value = `Designate to ${card.designate.name}`;
            break;
        case "add_or_sub_ten":
            if (card.score > 0)
                latestEffect.value = `Add 10`
            else
                latestEffect.value = `subtract 10`
            break;
        case "skip_turn":
            latestEffect.value = `Skip turn`
            break;
        case "add_or_sub_twenty":
            if (card.score > 0)
                latestEffect.value = `Add 20`
            else
                latestEffect.value = `subtract 20`
            break;
        case "set_score_to_ninetyNine":
            latestEffect.value = `Set the score to 99`
            break;
        case "reset_score":
            latestEffect.value = `Set the score to 0`
            break;
        default:
            latestEffect.value = `Add ${card.score}`
            break;
    }
    console.log('effect:', latestPlayer.value, latestEffect.value, 'SCORE', gameScore.value)
}

// 重置計分區塊
function resetScorePanel() {
    gameScore.value = 0;
    latestEffect.value = '';
    latestPlayer.value = '';
    playCount.value = 0;
}

defineExpose({
    handleScore,
    resetScorePanel
})
</script>

<style scoped></style>