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
import { onMounted, ref, watch } from 'vue'
import type { Card, Account } from '@/types/baseType'
import avatar from '@/assets/avator.svg'
const cardList = ref<Card[]>([]);
const selectedCardIndex = ref<number | null>(null)
const latestPlayedCard = ref<Card | null>(null);
const showAddOrSubDialog = ref(false)
const categoryAddOrSubDialog = ref('')
const showDesignateDialog = ref(false)
const otherPlayerList = ref<Account[]>([])
const PlayerInfo: Account | null = null;
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
            // 2. 一旦变成 true，就自动出牌
            AnalysisPlayCard()
        }
    }
)

const emit = defineEmits<{
    (e: 'playCard', card: Card): void
}>()

defineExpose({ receiveCards })

// 處理出牌邏輯
async function AnalysisPlayCard() {
    //先等2秒再出牌
    await new Promise(resolve => setTimeout(resolve, 2000))
    selectedCardIndex.value = 0
    playCard()
}

// 將卡牌傳出去
function handleCardScoring(card: Card) {
    emit('playCard', card)
}

// 出牌
function playCard() {
    try {
        if (selectedCardIndex.value === null) return
        latestPlayedCard.value = cardList.value[selectedCardIndex.value]
        handleCardEffect(latestPlayedCard.value)
    } catch (error) {
        console.error('draw new card failed:', error)
    }
}

// 預處理功能牌
function handleCardEffect(card: Card) {
    if (selectedCardIndex.value !== null) {
        cardList.value.splice(selectedCardIndex.value, 1);
        selectedCardIndex.value = null;
    }

    switch (card.effect) {
        case 'add_or_sub_twenty':
            categoryAddOrSubDialog.value = 'add_or_sub_twenty'
            handleAddOrSubEffect(-1);
            break;

        case 'add_or_sub_ten':
            categoryAddOrSubDialog.value = 'add_or_sub_ten'
            handleAddOrSubEffect(-1);
            break;

        case 'designate_next_player':
            otherPlayerList.value = props.playerList.filter(p => p.accountId !== PlayerInfo?.accountId);
            handleDesignateEffect(otherPlayerList.value[0].accountId, otherPlayerList.value[0].name)
            showDesignateDialog.value = true;
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
        showAddOrSubDialog.value = false;
    }
}

// 預處理指定玩家功能
function handleDesignateEffect(accountId: string, name: string) {
  if (latestPlayedCard.value !== null) {
    latestPlayedCard.value.designate.accountId = accountId;
    latestPlayedCard.value.designate.name = name;
    handleCardScoring(latestPlayedCard.value);
    showDesignateDialog.value = false;
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