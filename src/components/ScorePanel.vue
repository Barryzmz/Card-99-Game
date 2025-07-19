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
import { reactive, toRefs } from 'vue'
import type { Card } from '@/types/baseType'
function createScorePanelState() {
    return {
        latestEffect: '' as string,
        latestPlayer: '' as string,
        latestPlayedCard: null as Card | null,
    }
}
const state = reactive(createScorePanelState())
const { latestEffect, latestPlayer, latestPlayedCard } = toRefs(state)

const props = defineProps<{
    currentPlayer: string | null
    maxHandCardCount: number | null
    gameScore: number | null
    playCount: number | null
}>()

const {
    gameScore,
    playCount,
    currentPlayer,
    maxHandCardCount,
} = toRefs(props)

// 處理Effect 描述
function handleCardEffectDiscription(card: Card, dealer: string) {
    latestPlayer.value = dealer
    latestPlayedCard.value = card

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
    console.log('PlayCount:', playCount.value, latestPlayer.value, latestEffect.value, 'SCORE:', gameScore.value)
}

// 重置計分區塊
function resetScorePanel() {
    Object.assign(state, createScorePanelState())
}

defineExpose({
    handleCardEffectDiscription,
    resetScorePanel
})
</script>

<style scoped></style>