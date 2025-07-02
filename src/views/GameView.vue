<template>
    <div class="container-fluid min-vh-100 p-0 bg-success">
        <div class="d-flex justify-content-center align-items-start pt-2">
            <h1 class="text-white">Card 99 Game</h1>
        </div>
        <div class="d-flex justify-content-center align-items-start my-4">
            <div class="d-flex flex-row align-items-center justify-content-center text-white bg-dark p-4 rounded">
                <!-- 顯示選中的牌 -->
                <div class="mb-3 text-center mx-2">
                    <div class="d-flex flex-column justify-content-center align-items-center bg-light rounded p-4"
                        style="background-color: white; width: 250px; height: 300px;">
                        <template v-if="lastPlayCard !== null">
                            <img :src="lastPlayCard?.images?.png" style="height: 200px;" />
                            <p class="mt-2 mb-0 text-dark">Value: {{ lastPlayCard?.value }}</p>
                            <p class="mb-0 text-dark">Suit: {{ lastPlayCard?.suit }}</p>
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
        <div class="d-flex justify-content-center align-items-start gap-4 mt-3 mb-0 pb-2">
            <div class="text-white" id="playerOne">
                <div class="d-flex flex-row gap-2">
                    <div v-for="(card, index) in cardList" :key="card.code" @click="toggleCardSelection(index)"
                        :class="{ 'card-raised': selectedCardIndex === index }" style="cursor: pointer;">
                        <img :src="card?.images?.png" style="height: 180px;" />
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
import { onMounted, ref, nextTick } from 'vue'
import axios from 'axios'
import { CardValue, BackCard } from '@/types/baseType'
let gameOver = ref(true);
const backCard = BackCard;
let cardList = ref<CardValue[]>([]);
let deckID = ref(null);
let getCardsDone = ref(true);
const selectedCardIndex = ref<number | null>(null)
const lastPlayCard = ref<CardValue>(null);
let gameScore = ref(0);
let lastGameScore = ref(0);
const sortOrder = ref<'asc' | 'desc'>('desc')

function translateCardsValue(value: any) {
    switch (value) {
        case "JACK":
            value = "11";
            break;
        case "QUEEN":
            value = "12";
            break;
        case "KING":
            value = "13";
            break;
        case "ACE":
            value = "1";
            break;
        default:
            break;
    }
    return value;
}

// 控制點擊選取
function translateCardsSuit(suit: string): number {
    switch (suit) {
        case "CLUBS": return 1;
        case "DIAMONDS": return 2;
        case "HEARTS": return 3;
        case "SPADES": return 4;
        default: return 0;
    }
}

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
        cardList.value = result.data.cards;
    } catch (error) {
        console.error('getCards error:', error);
    }
}

// 出牌
async function playCard() {
    try {
        if (selectedCardIndex.value === null) return

        lastPlayCard.value = cardList.value[selectedCardIndex.value]
        const translatedValue = parseInt(translateCardsValue(lastPlayCard.value.value))
        lastGameScore.value = gameScore.value
        gameScore.value = translatedValue + lastGameScore.value
        console.log('lastGameScore:', lastGameScore.value, 'translatedValue:', translatedValue, 'GameScore:', gameScore.value)
        // 移除選中的那張牌
        cardList.value.splice(selectedCardIndex.value, 1)

        const result = await axios.get(
            `https://www.deckofcardsapi.com/api/deck/${deckID.value}/draw/?count=1`
        )
        const newCard = result.data.cards[0]
        cardList.value.push(newCard)

        sortCardList()
        selectedCardIndex.value = null
    } catch (error) {
        console.error('draw new card failed:', error)
    }
}

// 排序CardList
function sortCardList() {
    cardList.value.sort((a, b) => {
        const aValue = parseInt(translateCardsValue(a.value))
        const bValue = parseInt(translateCardsValue(b.value))

        if (aValue !== bValue) {
            return sortOrder.value === 'asc'
                ? aValue - bValue
                : bValue - aValue
        } else {
            const aSuit = translateCardsSuit(a.suit)
            const bSuit = translateCardsSuit(b.suit)
            return sortOrder.value === 'asc'
                ? aSuit - bSuit
                : bSuit - aSuit
        }
    })
}

// 控制點擊選取
function toggleCardSelection(index: number) {
    selectedCardIndex.value = selectedCardIndex.value === index ? null : index;
}

onMounted(async () => {
    try {
        await getDeck();
        await getInitCards();
        sortCardList()
    } catch (e: any) {
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