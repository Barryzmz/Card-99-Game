<template>
    <div class="d-flex align-items-center bg-light p-2 rounded">
        <div class="text-start mx-1">
            <img :src=avatar style="height: 50px;" />
        </div>
        <div class="text-start">
            <h4>{{ props.playerInfo.name }}</h4>
        </div>
    </div>
</template>
<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import { analyszeBestPlay, getRandomAccount } from '@/utils/cardUtils'
import type { Card, Account } from '@/types/baseType'
import avatar from '@/assets/avator.svg'
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
        console.log(props.playerInfo.name,'`s card List',cardList.value )
    }
    selectedCardIndex.value = cardList.value.findIndex(card => card === bestCard)
    playCard()
}

// 將卡牌傳出去
function handleCardScoring(card: Card) {
    emit('playCard', card)
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
</style>