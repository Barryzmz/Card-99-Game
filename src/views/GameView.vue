<template>
    <div class="container-fluid min-vh-100 p-0 bg-success">
        <div class="d-flex justify-content-center align-items-start pt-2">
            <h1 class="text-white">Card 99 Game</h1>
        </div>
        <ScorePanel ref="scorePanelRef" :latestPlayedCard="latestPlayedCard" />
        <PlayerArea ref="PlayerRef" :playerList="playerList" @playCard="handleCardScoring" />
    </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import axios from 'axios'
import type { CardValue, Card } from '@/types/baseType'
import { convertToCard } from '@/utils/cardUtils'
import ScorePanel from '@/components/ScorePanel.vue'
import PlayerArea from '@/components/Player.vue'
let gameOver = ref(true);
let deckID = ref(null);
const latestPlayedCard = ref<Card | null>(null);
let gameScore = ref(0);
const scorePanelRef = ref()
const playerList = ["playerZero", "playerOne", "playerTw0", "playerThree"]
const PlayerRef = ref()

// 洗牌
async function getDeck() {
    try {
        gameOver.value = false;
        if (deckID.value == null) {
            const result = await axios.get("https://www.deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1");
            deckID.value = result.data.deck_id;
        }
    } catch (error) {
        console.error('getDeck error:', error);
    }
}

// 一開始抽五張牌
async function getInitCards() {
    try {
        const result = await axios.get("https://www.deckofcardsapi.com/api/deck/" + deckID.value + "/draw/?count=5");
        const resultCards = result.data.cards;
        const initcardList: Card[] = []
        resultCards.forEach((cv: CardValue) => {
            initcardList.push(convertToCard(cv))
        })
        PlayerRef.value.receiveCards(initcardList)
    } catch (error) {
        console.error('getCards error:', error);
    }
}

// 將卡牌傳入ScorePanel 計分
function handleCardScoring(card: Card) {
    latestPlayedCard.value = card;
    scorePanelRef.value?.handleScore(card);
    getNewCard(PlayerRef)
}

// 發新一張牌到手牌
async function getNewCard(refTarget: any) {
    const result = await axios.get(
        `https://www.deckofcardsapi.com/api/deck/${deckID.value}/draw/?count=1`
    )
    const newCard = convertToCard(result.data.cards[0]);
    refTarget.value.receiveCards([newCard]);
}

onMounted(async () => {
    try {
        await getDeck();
        await getInitCards();
    } catch (e: any) {
        console.error('onMounted failed:', e)
        throw new Error(e);
    }
})
</script>
<style scoped></style>