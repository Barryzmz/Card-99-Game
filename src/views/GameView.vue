<template>
    <div class="container-fluid min-vh-100 p-0 bg-success">
        <div class="row d-flex justify-content-center mx-0 ">
            <div class="col-2 p-0">
                <ComputerPlayer :isActive="activeIndex === otherPlayer.idx" :playerInfo="otherPlayer"
                    :playerList="playerList" ref="computerPlayerRef" @playCard="handleCardScoring" />
            </div>
            <div class="col-10 p-0">
                <div class="d-flex justify-content-center align-items-start pt-2">
                    <h3 class="text-white">Card 99 Game</h3>
                </div>
                <div class="row d-flex justify-content-center mx-0 overflow-hidden">
                    <div class="col-6 p-0">
                        <ScorePanel ref="scorePanelRef" :latestPlayedCard="latestPlayedCard"
                            @score-updated="gameScore = $event" />
                    </div>
                </div>
                <PlayerArea ref="playerRef" :playerInfo="player" :playerList="playerList"
                    :isActive="activeIndex === player.idx" @playCard="handleCardScoring" />
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import axios from 'axios'
import type { CardValue, Card, Account } from '@/types/baseType'
import { convertToCard } from '@/utils/cardUtils'
import ScorePanel from '@/components/ScorePanel.vue'
import PlayerArea from '@/components/Player.vue'
import ComputerPlayer from '@/components/ComputerPlayer.vue'
let deckID = ref(null);
const latestPlayedCard = ref<Card | null>(null);
let gameScore = ref(0);
const scorePanelRef = ref()
let otherPlayer = ref<Account>(
    { idx: 1, avatar: '', accountId: 'player1', name: 'Player1_Name' },
)
let player = ref<Account>(
    { idx: 0, avatar: '', accountId: 'player0', name: 'BarryZhuang' }
)
let playerList: Account[] = []
const gamePlayerList: Account[] = [
    { idx: 0, avatar: '', accountId: 'player0', name: 'BarryZhuang' },
    { idx: 1, avatar: '', accountId: 'player1', name: 'Player1_Name' }
]
const computerPlayerRef = ref<InstanceType<typeof ComputerPlayer> | null>(null)
const playerRef = ref<InstanceType<typeof PlayerArea> | null>(null)
const activeIndex = ref(0)
const isReversed = ref(false)
const allPlayerRefs = computed(() => [
    playerRef.value,
    computerPlayerRef.value,
])

// 處理誰是下一位玩家
const nextPlayer = () => {
    if (isReversed.value) {
        activeIndex.value = (activeIndex.value - 1 + allPlayerRefs.value.length) % allPlayerRefs.value.length
    } else {
        activeIndex.value = (activeIndex.value + 1) % allPlayerRefs.value.length
    }
}

// 洗牌
async function getDeck() {
    try {
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
        // 給每一位玩家發牌
        allPlayerRefs.value.forEach(async child => {
            const result = await axios.get(
                `https://www.deckofcardsapi.com/api/deck/${deckID.value}/draw/?count=5`
            )
            const initCardList: Card[] = (result.data.cards as CardValue[])
                .map(cv => convertToCard(cv))
            child?.receiveCards([...initCardList])
        })
    } catch (error) {
        console.error('getInitCards error:', error)
    }
}

// 將卡牌傳入ScorePanel 計分
function handleCardScoring(card: Card) {
    latestPlayedCard.value = card
    scorePanelRef.value?.handleScore(card)
    //抓下一個玩家的組件ref
    const nextInst = allPlayerRefs.value[activeIndex.value]
    if (nextInst) {
        getNewCard(nextInst)
    }
    nextPlayer()
}

// 發新一張牌到手牌
async function getNewCard(targetInstance: { receiveCards: (cards: Card[]) => void }) {
    console.log('getNewCard-targetInstance:', targetInstance)
    const { data } = await axios.get(
        `https://www.deckofcardsapi.com/api/deck/${deckID.value}/draw/?count=1`
    )
    const newCard = convertToCard(data.cards[0] as CardValue)
    targetInstance.receiveCards([newCard])
}

// 把使用者加入遊戲順序清單
function getPlayerNames() {
    playerList = [...gamePlayerList];
}

onMounted(async () => {
    try {
        getPlayerNames();
        await getDeck();
        await getInitCards();
    } catch (e: any) {
        console.error('onMounted failed:', e)
        throw new Error(e);
    }
})
</script>
<style scoped></style>