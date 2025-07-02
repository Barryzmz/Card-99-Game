<template>
    <div class="container-fluid min-vh-100 p-0 bg-success">
        <div class="d-flex justify-content-center align-items-start pt-2">
            <h1 class="text-white">Card 99 Game</h1>
        </div>
        <!-- 計分區塊 -->
        <ScorePanel ref="scorePanelRef" :latestPlayedCard="latestPlayedCard" />
        <div class="d-flex justify-content-center align-items-start gap-4 mt-3 mb-0 pb-2">
            <div class="text-white" id="playerOne">
                <div class="d-flex flex-row gap-2">
                    <div v-for="(card, index) in cardList" :key="card.cardValue.code"
                        @click="toggleCardSelection(index)" :class="{ 'card-raised': selectedCardIndex === index }"
                        style="cursor: pointer;">
                        <img :src="card.cardValue?.images?.png" style="height: 180px;" />
                    </div>
                </div>
            </div>
            <div class="d-flex flex-column">
                <button type="button" class="btn btn-primary btn-lg my-2" :disabled="selectedCardIndex === null"
                    @click="playCard">Play</button>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import axios from 'axios'
import type { CardValue, Card } from '@/types/baseType'
import { translateCardsValue, translateCardsSuit, convertToCard } from '@/utils/cardUtils'
import ScorePanel from '@/components/ScorePanel.vue'
let gameOver = ref(true);
let cardList = ref<Card[]>([]);
let deckID = ref(null);
const selectedCardIndex = ref<number | null>(null)
const latestPlayedCard = ref<Card | null>(null);
let gameScore = ref(0);
const sortOrder = ref<'asc' | 'desc'>('desc')
const scorePanelRef = ref()

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
        resultCards.forEach((cv: CardValue) => {
            cardList.value.push(convertToCard(cv))
        })
    } catch (error) {
        console.error('getCards error:', error);
    }
}

// 出牌
async function playCard() {
    try {
        if (selectedCardIndex.value === null) return

        latestPlayedCard.value = cardList.value[selectedCardIndex.value]
        handleScore(latestPlayedCard.value)
        // 移除選中的那張牌
        cardList.value.splice(selectedCardIndex.value, 1)

        const result = await axios.get(
            `https://www.deckofcardsapi.com/api/deck/${deckID.value}/draw/?count=1`
        )
        const newCard = result.data.cards[0]
        cardList.value.push(convertToCard(newCard))

        sortCardList(cardList.value)
        selectedCardIndex.value = null
    } catch (error) {
        console.error('draw new card failed:', error)
    }
}

// 處理出牌
function handleScore(card: Card) {
    scorePanelRef.value?.handleScore(card)
}

// 排序CardList
function sortCardList(cardList: Card[]) {
    try {
        cardList.sort((a, b) => {
            const aValue = parseInt(translateCardsValue(a.value))
            const bValue = parseInt(translateCardsValue(b.value))

            if (aValue !== bValue) {
                return sortOrder.value === 'asc'
                    ? aValue - bValue
                    : bValue - aValue
            } else {
                const aSuit = translateCardsSuit(a.cardValue.suit)
                const bSuit = translateCardsSuit(b.cardValue.suit)
                return sortOrder.value === 'asc'
                    ? aSuit - bSuit
                    : bSuit - aSuit
            }
        })
    } catch (e: any) {
        throw new Error(e);
    }
}

// 控制點擊選取
function toggleCardSelection(index: number) {
    selectedCardIndex.value = selectedCardIndex.value === index ? null : index;
}

onMounted(async () => {
    try {
        await getDeck();
        await getInitCards();
        sortCardList(cardList.value);
    } catch (e: any) {
        console.error('onMounted failed:', e)
        throw new Error(e);
    }
})
</script>

<style scoped>
.card-raised {
    transform: translateY(-20px);
    transition: transform 0.2s ease;
}
</style>