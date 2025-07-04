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
                <div class="bg-white text-dark p-3 rounded">
                    <h3 class="m-0">Now Playing:</h3>
                    <h4 class="m-0">{{ currentPlayer }}</h4>
                </div>
                <div class="bg-white text-dark p-3 rounded mt-auto d-flex flex-column align-items-start mt-1"
                    style="min-height: 3rem;">
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
}>()

const emit = defineEmits<{
    (e: 'score-updated', newScore: number): void
}>()

let gameScore = ref(0);
let latestEffect = ref('')

// 處理分數功能
function handleScore(card: Card) {
    const translatedValue = parseInt(translateCardsValue(card.score))
    const lastGameScore = gameScore.value
    gameScore.value = translatedValue + lastGameScore
    handleCardEffectDiscription(card)
    emit('score-updated', gameScore.value)
    console.log('origin Score:', lastGameScore, 'Card value:', translatedValue, 'Score:', gameScore.value)
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
}

defineExpose({
    handleScore
})
</script>

<style scoped></style>