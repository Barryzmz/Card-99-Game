<template>
    <div class="position-relative d-flex justify-content-center align-items-start  mt-3 mb-0 pb-2"
        :class="{ 'bg-warning': props.isActive }">
        <div v-if="props.isActive" class="position-absolute top-0"
            style="left: 10%; transform: translate(-50%, -70%); z-index: 10;">
            <span class="badge bg-white text-dark fs-2 py-3 px-4 rounded-pill">
                請出牌
            </span>
        </div>
        <div class="row">
            <div class="col-10 text-white">
                <div class="d-flex flex-row gap-2 p-5">
                    <div v-for="(card, index) in cardList" :key="card.cardValue.code"
                        @click="toggleCardSelection(index)" :class="{
                            'card-raised': selectedCardIndex === index,
                            'card-disabled': isCardDisabled(card)
                        }" style="cursor: pointer;">
                        <img :src="card.cardValue?.images?.png" style="height: 180px;" />
                    </div>
                </div>
            </div>
            <div class="col-2 d-flex align-items-center">
                <button type="button" class="btn btn-primary my-3 fs-4 px-4 py-2"
                    :disabled="selectedCardIndex === null || !isActive" @click="playCard">
                    Play
                </button>
            </div>
        </div>
    </div>
    <AddOrSubEffectDialog :visible="showAddOrSubDialog" :category="categoryAddOrSubDialog" :gameScore="props.gameScore"
        @confirm="handleAddOrSubEffect" />
    <DesignateEffectDialog :visible="showDesignateDialog" :otherPlayerList="otherPlayerList"
        @confirm="handleDesignateEffect" />
</template>
<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import type { Card, Account } from '@/types/baseType'
import { translateCardsValue, translateCardsSuit, analyszeBestPlay } from '@/utils/cardUtils'
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
    (e: 'report-player-eliminated', playerInfo: Account): void
}>()

// 算出距離max score的的數值
const remainingToMaxScore = computed(() => {
    const result = 99 - props.gameScore;
    return result;
});

defineExpose({ receiveCards, getHandCardsCount, resetPlayer })

// 將卡牌傳出去
function handleCardScoring(card: Card) {
    emit('playCard', card)
}

// 處理出牌邏輯
async function AnalysisPlayCard() {
    const bestCard = analyszeBestPlay(cardList.value, remainingToMaxScore.value)
    if (bestCard == null) {
        console.log(props.playerInfo.name, '<<<<<lose>>>>>')
        reportPlayerEliminated(props.playerInfo)
    }
}

// 告知賽局這個玩家沒牌可出所以出局
function reportPlayerEliminated(player: Account) {
  props.playerInfo.status = 'eliminated'
  emit('report-player-eliminated', player)
}

// 判斷可出的手牌
function isCardDisabled(card: Card): boolean {
  return card.score > remainingToMaxScore.value && card.level == 1;
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
            otherPlayerList.value = props.playerList.filter(p => p.accountId !== props.playerInfo.accountId && p.status !== 'eliminated');
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

// 告知賽局目前手牌數量
function getHandCardsCount(): number {
  return cardList.value.length
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

// 重置Plaer
function resetPlayer() {
    cardList.value = [];
    selectedCardIndex.value = null;
    latestPlayedCard.value = null;
    showAddOrSubDialog.value = false;
    categoryAddOrSubDialog.value = '';
    showDesignateDialog.value = false;
    otherPlayerList.value = [];
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

.card-disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>