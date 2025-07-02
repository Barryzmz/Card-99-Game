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
    <!-- Q AND 10 彈窗 -->
    <AddOrSubEffectDialog :visible="showAddOrSubDialog" :category="categoryAddOrSubDialog"
        @confirm="handleAddOrSubEffect" />
    <!-- 5 指定牌 彈窗 -->
    <DesignateEffectDialog :visible="showDesignateDialog" :otherPlayerList="otherPlayerList"
        @confirm="handleDesignateEffect" />
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import axios from 'axios'
import type { CardValue, Card } from '@/types/baseType'
import { translateCardsValue, translateCardsSuit, convertToCard } from '@/utils/cardUtils'
import ScorePanel from '@/components/ScorePanel.vue'
import AddOrSubEffectDialog from '@/components/AddOrSubEffectDialog.vue'
import DesignateEffectDialog from '@/components/DesignateEffectDialog.vue'
let gameOver = ref(true);
let cardList = ref<Card[]>([]);
let deckID = ref(null);
const selectedCardIndex = ref<number | null>(null)
const latestPlayedCard = ref<Card | null>(null);
let gameScore = ref(0);
const sortOrder = ref<'asc' | 'desc'>('desc')
const scorePanelRef = ref()
const showAddOrSubDialog = ref(false)
const categoryAddOrSubDialog = ref('')
const showDesignateDialog = ref(false)
const PlayerList = ["player0", "player1", "player2", "player3"]
const Player = "player0"
const otherPlayerList = ref<string[]>([])
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
function playCard() {
    try {
        if (selectedCardIndex.value === null)
            return
        latestPlayedCard.value = cardList.value[selectedCardIndex.value]
        handleCardEffect(latestPlayedCard.value)
    } catch (error) {
        console.error('draw new card failed:', error)
    }
}

// 將卡牌傳入ScorePanel 計分
function handleCardScoring(card: Card) {
    scorePanelRef.value?.handleScore(card)
}

// 預處理功能牌
async function handleCardEffect(card: Card) {
    if (selectedCardIndex.value !== null) {
        cardList.value.splice(selectedCardIndex.value, 1);
        selectedCardIndex.value = null;
    }

    switch (card.effect) {
        case 'add_or_sub_twenty':
            categoryAddOrSubDialog.value = 'add_or_sub_twenty'
            showAddOrSubDialog.value = true;
            break;

        case 'add_or_sub_ten':
            categoryAddOrSubDialog.value = 'add_or_sub_ten'
            showAddOrSubDialog.value = true;
            break;

        case 'designate_next_player':
            otherPlayerList.value = PlayerList.filter(p => p !== Player);
            showDesignateDialog.value = true;
            break;

        default:
            handleCardScoring(card);
            await getNewCard();
            break;
    }
}

// 預處理可加減功能(Q、10)
async function handleAddOrSubEffect(parameter: number) {
    if (latestPlayedCard.value !== null) {
        const originScore = latestPlayedCard.value.score;
        latestPlayedCard.value.score = originScore * parameter;
        handleCardScoring(latestPlayedCard.value);
        showAddOrSubDialog.value = false;
        await getNewCard();
    }
}

// 預處理指定玩家功能
async function handleDesignateEffect(parameter: string) {
    if (latestPlayedCard.value !== null) {
        latestPlayedCard.value.designate = parameter;
        handleCardScoring(latestPlayedCard.value);
        showDesignateDialog.value = false;
        await getNewCard();
    }
}

// 發新一張牌到手牌
async function getNewCard() {
    const result = await axios.get(
        `https://www.deckofcardsapi.com/api/deck/${deckID.value}/draw/?count=1`
    )
    const newCard = result.data.cards[0]
    cardList.value.push(convertToCard(newCard))

    sortCardList(cardList.value)
    selectedCardIndex.value = null
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