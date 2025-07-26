<template>
    <div class="d-flex justify-content-start align-items-center gap-2 pb-2">
        <div class="d-flex flex-column bg-light p-2 rounded"
            :class="{ 'disabled-player': props.playerInfo.status === 'eliminated' }">
            <div class="d-flex align-items-center mb-2">
                <img :src="avatar" style="height: 40px;" />
                <div class="text-start ms-2">
                    <p class="mb-0">{{ props.playerInfo.name }}</p>
                </div>
            </div>
            <div class="mt-auto text-center">
                <small class="text-secondary">
                    Hand cards: {{ cardList.length }}
                </small>
            </div>
        </div>
        <div v-if="props.isActive" class="h-100 d-flex align-items-center">
            <img :src=pointer alt="arrow" style="height: 50px;">
        </div>
    </div>
</template>
<script setup lang="ts">
import {onMounted, toRefs, reactive, watch, computed } from 'vue'
import { analyzeBestPlay, getRandomAccount } from '@/utils/cardUtils'
import type { Card, Account } from '@/types/baseType'
import avatar from '@/assets/avator.svg'
import pointer from '@/assets/left-arrow.svg'
import { toast } from 'vue3-toastify';
function createPlayerState() {
  return {
    cardList: [] as Card[],
    selectedCardIndex: null as number | null,
    latestPlayedCard: null as Card | null,
    otherPlayerList: [] as Account[],
  }
}
const state = reactive(createPlayerState())
const { cardList, 
        selectedCardIndex, 
        latestPlayedCard,
        otherPlayerList } = toRefs(state)

const props = defineProps<{
    playerList: Account[]
    playerInfo: Account
    isActive: boolean
    gameScore: number
}>()

// 算出距離max score的的數值
const remainingToMaxScore = computed(() => {
    const result = 99 - props.gameScore;
    return result;
});

watch(
    () => props.isActive,
    (active) => {
        if (active) {
            AnalysisPlayCard()
        }
    }
)

const emit = defineEmits<{
    (e: 'playCard', card: Card): void
    (e: 'report-computerPlayer-eliminated', playerInfo: Account): void
}>()

defineExpose({ receiveCards, getHandCardsCount, resetPlayer })

// 跳出該玩家已經出局的訊息通知
function notifyPlayerEliminatedByToast(playerName: string): void {
    toast(`${playerName} is eliminated`);
}

// 處理出牌邏輯
async function AnalysisPlayCard() {
    //先等2秒再出牌
    await new Promise(resolve => setTimeout(resolve, 2000))
    const bestCard = analyzeBestPlay(cardList.value, remainingToMaxScore.value)
    if (bestCard == null) {
        console.log(props.playerInfo.name, '<<<<<lose>>>>>')
        console.log(props.playerInfo.name, 'gameScore', props.gameScore, "'s cardList", cardList.value)
        reportPlayerEliminated(props.playerInfo)
    }
    selectedCardIndex.value = cardList.value.findIndex(card => card === bestCard)
    playCard()
}

// 將卡牌傳出去
function handleCardScoring(card: Card) {
    emit('playCard', card)
}

// 告知賽局這個玩家沒牌可出所以出局
function reportPlayerEliminated(player: Account) {
    props.playerInfo.status = 'eliminated'
    notifyPlayerEliminatedByToast(props.playerInfo.name)
    emit('report-computerPlayer-eliminated', player)
}

// 出牌
function playCard() {
    try {
        if (selectedCardIndex.value === null || selectedCardIndex.value === -1) return
        latestPlayedCard.value = cardList.value[selectedCardIndex.value]
        handleCardEffect(latestPlayedCard.value)
    } catch (error) {
        console.error('computer playCard failed:', error)
    }
}

// 預處理功能牌
function handleCardEffect(card: Card) {
    if (card === null) return

    if (selectedCardIndex.value !== null) {
        cardList.value.splice(selectedCardIndex.value, 1);
        selectedCardIndex.value = null;
    }

    switch (card.effect) {
        case 'add_or_sub_twenty':
            handleAddOrSubEffect();
            break;

        case 'add_or_sub_ten':
            handleAddOrSubEffect();
            break;

        case 'designate_next_player':
            otherPlayerList.value = props.playerList.filter(p => p.accountId !== props.playerInfo.accountId && p.status !== 'eliminated');
            const designatePlayer = getRandomAccount(otherPlayerList.value)
            if (designatePlayer !== null)
                handleDesignateEffect(designatePlayer.accountId, designatePlayer.name)
            break;

        default:
            handleCardScoring(card);
            break;
    }
}

// 預處理可加減功能(Q、10)
function handleAddOrSubEffect() {
    const card = latestPlayedCard.value;
    if (!card) return;

    const ADD_THRESHOLD = 49;
    const functionCardCount = cardList.value.filter(c => c.level > 1).length;

    // 1. 分數在50分(包含)以下就選擇加分數
    // 2. 如果分數允許且手上功能牌大於1張就選擇加分數
    const shouldAdd =remainingToMaxScore.value >= ADD_THRESHOLD ||
        (
            remainingToMaxScore.value >= card.score &&
            functionCardCount > 1
        );

    const parameter = shouldAdd ? 1 : -1;
    card.score *= parameter;

    handleCardScoring(card);
}

// 預處理指定玩家功能
function handleDesignateEffect(accountId: string, name: string) {
    if (latestPlayedCard.value !== null) {
        latestPlayedCard.value.designate.accountId = accountId;
        latestPlayedCard.value.designate.name = name;
        handleCardScoring(latestPlayedCard.value);
    }
}

// 接收發牌
function receiveCards(cards: Card[]) {
    cards?.forEach(c => {
        cardList.value.push(c);
    });
}

// 告知賽局目前手牌數量
function getHandCardsCount(): number {
    return cardList.value.length
}

// 重置Player
function resetPlayer() {
    Object.assign(state, createPlayerState())
}

onMounted(() => {
    try {
    } catch (e: unknown) {
        console.error('onMounted failed:', e);
        throw e;
    }
})
</script>
<style scoped>
.card-raised {
    transform: translateY(-20px);
    transition: transform 0.2s ease;
}

.disabled-player {
    filter: grayscale(100%);
    opacity: 0.6;
}
</style>