<template>
    <div class="d-flex justify-content-start align-items-center gap-4 mx-4 pb-2">
        <div class="d-flex align-items-center bg-light p-2 rounded"
            :class="{ 'disabled-player': props.playerInfo.status === 'eliminated' }">
                <img :src=avatar  style="height: 50px;" />
                <div class="text-start mx-2">
                    <h5 class="mb-1">{{ props.playerInfo.name }}</h5>
                </div>
        </div>
        <div v-if="props.isActive" class="h-100 d-flex align-items-center">
            <img :src=pointer alt="arrow" style="height: 50px;">
        </div>
    </div>
</template>
<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import { analyszeBestPlay, getRandomAccount } from '@/utils/cardUtils'
import type { Card, Account } from '@/types/baseType'
import avatar from '@/assets/avator.svg'
import pointer from '@/assets/left-arrow.svg'
const cardList = ref<Card[]>([]);
const selectedCardIndex = ref<number | null>(null)
const latestPlayedCard = ref<Card | null>(null);
const otherPlayerList = ref<Account[]>([])
const props = defineProps<{
    playerList: Account[]
    playerInfo: Account
    isActive: boolean
    gameScore: number
}>()

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
    (e: 'reportPlayerEliminated', playerInfo: Account): void
}>()

// 算出距離max score的的數值
const remainingToMaxScore = computed(() => {
  const result = 99 - props.gameScore;
  return result;
});

defineExpose({ receiveCards })

// 處理出牌邏輯
async function AnalysisPlayCard() {
    //先等2秒再出牌
    await new Promise(resolve => setTimeout(resolve, 2000))
    const bestCard = analyszeBestPlay(cardList.value, remainingToMaxScore.value )
    if (bestCard == null){
        console.log(props.playerInfo.name, '<<<<<lose>>>>>')
        console.log(props.playerInfo.name,"'s cardList", cardList.value)
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
    emit('reportPlayerEliminated', player)
}

// 出牌
function playCard() {
    try {
        if (selectedCardIndex.value === null || selectedCardIndex.value ===-1 ) return
        latestPlayedCard.value = cardList.value[selectedCardIndex.value]
        handleCardEffect(latestPlayedCard.value)
    } catch (error) {
        console.error('draw new card failed:', error)
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
            handleAddOrSubEffect(-1);
            break;

        case 'add_or_sub_ten':
            handleAddOrSubEffect(-1);
            break;

        case 'designate_next_player':
            otherPlayerList.value = props.playerList.filter(p => p.accountId !== props.playerInfo.accountId);
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
function handleAddOrSubEffect(parameter: number) {
    if (latestPlayedCard.value !== null) {
        const originScore = latestPlayedCard.value.score;
        latestPlayedCard.value.score = originScore * parameter;
        handleCardScoring(latestPlayedCard.value);
    }
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