<template>
    <div class="d-flex justify-content-center align-items-start gap-4 mt-3 mb-0 pb-2">
        <div class="text-white" id="playerOne">
            <div class="d-flex flex-row gap-2">
                <div v-for="(card, index) in cardList" :key="card.cardValue.code" @click="toggleCardSelection(index)"
                    :class="{ 'card-raised': selectedCardIndex === index }" style="cursor: pointer;">
                    <img :src="card.cardValue?.images?.png" style="height: 180px;" />
                </div>
            </div>
        </div>
        <div class="d-flex flex-column">
            <button type="button" class="btn btn-primary btn-lg my-2"
                :disabled="selectedCardIndex === null || !isActive" @click="playCard">Play</button>
        </div>
        <AddOrSubEffectDialog :visible="showAddOrSubDialog" :category="categoryAddOrSubDialog"
            @confirm="handleAddOrSubEffect" />
        <DesignateEffectDialog :visible="showDesignateDialog" :otherPlayerList="otherPlayerList"
            @confirm="handleDesignateEffect" />
    </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Card, Account } from '@/types/baseType'
import { translateCardsValue, translateCardsSuit } from '@/utils/cardUtils'
import AddOrSubEffectDialog from '@/components/AddOrSubEffectDialog.vue'
import DesignateEffectDialog from '@/components/DesignateEffectDialog.vue'
const cardList = ref<Card[]>([]);
const selectedCardIndex = ref<number | null>(null)
const latestPlayedCard = ref<Card | null>(null);
const sortOrder = ref<'asc' | 'desc'>('desc')
const showAddOrSubDialog = ref(false)
const categoryAddOrSubDialog = ref('')
const showDesignateDialog = ref(false)
const otherPlayerList = ref<Account[]>([])

const props = defineProps<{
    playerList: Account[]
    playerInfo: Account
    isActive: boolean
    gameScore: number
}>()

const emit = defineEmits<{
    (e: 'playCard', card: Card): void
}>()

defineExpose({ receiveCards })

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
            showAddOrSubDialog.value = true;
            break;

        case 'add_or_sub_ten':
            categoryAddOrSubDialog.value = 'add_or_sub_ten'
            showAddOrSubDialog.value = true;
            break;

        case 'designate_next_player':
            otherPlayerList.value = props.playerList.filter(p => p.accountId !== props.playerInfo.accountId);
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
    sortCardList(cardList.value)
}

// 排序CardList
function sortCardList(cardList: Card[]) {
    try {
        cardList.sort((a, b) => {
            const aValue = parseInt(translateCardsValue(a.cardValue.value))
            const bValue = parseInt(translateCardsValue(b.cardValue.value))

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

onMounted(() => {
    try {
        sortCardList(cardList.value);
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