<template>
    <div class="container-fluid min-vh-100 p-0 bg-success">
        <div class="d-flex justify-content-center align-items-start pt-2">
            <h1 class="text-white">Card 99 Game</h1>
        </div>
        <div class="d-flex justify-content-center align-items-start my-2">
            <div class="d-flex flex-row align-items-center justify-content-center text-white bg-dark p-4 rounded">
                <!-- 顯示選中的牌 -->
                <div class="mb-3 text-center mx-2">
                    <div class="d-flex flex-column justify-content-center align-items-center bg-light rounded p-4"
                        style="background-color: white; width: 400px; min-height: 300px;">
                        <template v-if="lastPlayCard !== null">
                            <div class="d-flex flex-row align-items-start">
                                <!-- 圖片 -->
                                <img :src="lastPlayCard.cardValue?.images?.png" style="height: 200px;" class="me-3" />

                                <!-- 文字區塊 -->
                                <div class="text-dark text-start p-3" style="min-width: 150px;">
                                    <p class="mb-1">Value: {{ lastPlayCard.cardValue?.value }}</p>
                                    <p class="mb-1">Suit: {{ lastPlayCard.cardValue?.suit }}</p>
                                    <p class="mb-1">Level: {{ lastPlayCard.level }}</p>
                                    <p class="mb-1">Score: {{ lastPlayCard.score }}</p>
                                    <p class="mb-0">Effect: {{ lastPlayCard.effect }}</p>
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
import { onMounted, ref, nextTick } from 'vue'
import axios from 'axios'
import type { CardValue, Card } from '@/types/baseType'
let gameOver = ref(true);
let cardList = ref<Card[]>([]);
let deckID = ref(null);
const selectedCardIndex = ref<number | null>(null)
const lastPlayCard = ref<Card | null>(null);
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

function convertToCard(cardValue: CardValue): Card {
    const { score, level, effect } = determineCardAttributes(cardValue)
    // console.log({ score, level, effect })
    return {
        cardValue,
        level,
        value: parseInt(translateCardsValue(cardValue.value)),
        effect,
        score,
    }
}

function determineCardAttributes(cardValue: CardValue): { score: number, level: number; effect: string } {
    const value = cardValue.value;
    const suit = cardValue.suit;

    if (value === 'ACE') {
        if (suit === 'SPADES') {
            return { score: 0, level: 3, effect: 'reset_score' }
        }
        else {
            return { score: 1, level: 1, effect: '' }
        }
    }

    switch (value) {
        case "4":
            return { score: 0, level: 2, effect: 'turn_around' };
        case "5":
            return { score: 0, level: 2, effect: 'designate' };
        case "10":
            return { score: 10, level: 2, effect: 'add_or_sub_ten' };
        case "JACK":
            return { score: 0, level: 2, effect: 'pass' };
        case "QUEEN":
            return { score: 20, level: 2, effect: 'add_or_sub_twenty' };
        case "KING":
            return { score: 0, level: 2, effect: 'set_NinetyNine' };
        default:
            break;
    }

    return { score: parseInt(value), level: 1, effect: '' };
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

        lastPlayCard.value = cardList.value[selectedCardIndex.value]
        handleScore(lastPlayCard.value)
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
    const translatedValue = parseInt(translateCardsValue(card.score))
    lastGameScore.value = gameScore.value
    gameScore.value = translatedValue + lastGameScore.value
    console.log('lastGameScore:', lastGameScore.value, 'translatedValue:', translatedValue, 'GameScore:', gameScore.value)
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