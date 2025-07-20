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
                    <h4 class="m-0">effect: {{ latestPlayedCard?.effectStrategy.effect }}</h4>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { toRefs } from 'vue'
import type { Card } from '@/types/baseType'

const props = defineProps<{
    currentPlayer: string | null
    maxHandCardCount: number | null
    gameScore: number | null
    playCount: number | null
    latestPlayedCard: Card | null
    latestPlayer: string | null
}>()

const {
    gameScore,
    playCount,
    currentPlayer,
    maxHandCardCount,
    latestPlayedCard,
    latestPlayer
} = toRefs(props)

</script>

<style scoped></style>