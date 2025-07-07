<template>
    <div class="container-fluid min-vh-100 p-0 bg-success">
        <div class="row d-flex justify-content-center mx-0 ">
            <div class="col-3 pt-2 bg-secondary">
                <div class="d-flex justify-content-center align-items-center bg-light p-2 mb-2 rounded">
                    <div class="col-auto">
                        <h3 class="text-dark mb-0">Turn Order:</h3>
                    </div>
                    <div class="col-auto mx-3">
                        <img :src="isReversed ? upArrow : downArrow" style="height: 40px;" alt="turn order arrow" />
                    </div>
                </div>
                <ComputerPlayer ref="computerPlayerRef"
                    :isActive="activeAccount?.accountId === otherPlayer.accountId"
                    :playerInfo="otherPlayer"
                    :playerList="playerList"
                    :gameScore="gameScore"
                    @playCard="handleCardScoring"
                    @reportPlayerEliminated="handlePlayerEliminated"
                    @report-computerPlayer-eliminated="handleComputerPlayerEliminated"
                />
            </div>
            <div class="col-9 p-0">
                <div class="d-flex justify-content-center align-items-start pt-2">
                    <h3 class="text-white">Card 99 Game</h3>
                </div>
                <div class="row d-flex justify-content-center mx-0 overflow-hidden">
                    <div class="col-8 p-0">
                        <ScorePanel ref="scorePanelRef" 
                            :latestPlayer="latestPlayer?.name ?? null"
                            :currentPlayer="activeAccount?.name ?? null" 
                            :latestPlayedCard="latestPlayedCard"
                            :maxHandCardCount="maxHandCardCount"
                            @score-updated="gameScore = $event"
                            @playCount-updated="playCount = $event"
                        />
                    </div>
                </div>
                <PlayerArea ref="playerRef"
                    :isActive="activeAccount?.accountId === player.accountId"
                    :playerInfo="player"
                    :playerList="playerList"
                    :gameScore="gameScore"
                    @playCard="handleCardScoring"
                    @report-Player-eliminated="handlePlayerEliminated"
                />
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { reactive, toRefs, onMounted, ref, computed } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import type { CardValue, Card, Account } from '@/types/baseType'
import { convertToCard } from '@/utils/cardUtils'
import ScorePanel from '@/components/ScorePanel.vue'
import PlayerArea from '@/components/Player.vue'
import ComputerPlayer from '@/components/ComputerPlayer.vue'
import upArrow from '@/assets/up-arrow.svg'
import downArrow from '@/assets/down-arrow.svg'
import nyanCat from '@/assets/nyan-cat.gif'
function createGameState() {
    return {
        gameOver: false as boolean,
        deckID: null as string | null,
        playCount: 0 as number,
        latestPlayedCard: null as Card | null,
        latestPlayer: null as Account | null,
        gameScore: 0 as number,
        activeIndex: 0 as number,
        activeAccount: null as Account | null,
        isReversed: false as boolean,
        maxHandCardCount: 5 as number
    }
}
const state = reactive(createGameState())
const {
    gameOver,
    deckID,
    playCount,
    latestPlayedCard,
    latestPlayer,
    gameScore,
    activeIndex,
    activeAccount,
    isReversed,
    maxHandCardCount
} = toRefs(state)
let otherPlayer = ref<Account>(
    { idx: 1, avatar: '', accountId: 'player1', name: 'Player1', status: 'playing' },
)
let player = ref<Account>(
    { idx: 0, avatar: '', accountId: 'player0', name: 'BarryZhuang', status: 'playing' }
)
let playerList: Account[] = []
const gamePlayerList: Account[] = [
    { idx: 0, avatar: '', accountId: 'player0', name: 'BarryZhuang', status: 'playing' },
    { idx: 1, avatar: '', accountId: 'player1', name: 'Player1', status: 'playing' }
]
const scorePanelRef = ref()
const computerPlayerRef = ref<InstanceType<typeof ComputerPlayer> | null>(null)
const playerRef = ref<InstanceType<typeof PlayerArea> | null>(null)
const allPlayerRefs = computed(() => [
    playerRef.value,
    computerPlayerRef.value,
])
const maxHandCardCountRoundSetting = {
    firstRound: 10,
    nextRound: 5
}

// 檢查是否已經獲勝
function checkPlayerWin(): boolean {
    const alive = gamePlayerList.filter(p => p.status !== 'eliminated');
    return alive.length === 1 && alive[0].accountId === 'player0';
}

// 處理誰是下一位玩家
function nextPlayer() {
    const len = allPlayerRefs.value.length
    let newIndex = activeIndex.value
    let attempts = 0
    do {
        if (++attempts > len) {
            console.warn('All players are out')
            return
        }

        // 判斷賽局是否結束
        if (gameOver.value) {
            console.log('Game Over')
            return
        }

        // 判斷電腦玩家是否都出局，玩家獲得勝利
        if (checkPlayerWin()) {
            console.log('win')
            notifyPlayerWin()
        }

        newIndex = isReversed.value
            ? (newIndex - 1 + len) % len
            : (newIndex + 1) % len
        const candidate = gamePlayerList[newIndex]
        if (candidate.status !== 'eliminated') {
            break
        }
    } while (newIndex !== activeIndex.value)
    activeIndex.value = newIndex
    activeAccount.value = gamePlayerList[newIndex]
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
        for (const child of allPlayerRefs.value) {
            if (!child) continue

            const result = await axios.get(
                `https://www.deckofcardsapi.com/api/deck/${deckID.value}/draw/?count=5`
            )
            const initCardList: Card[] = (result.data.cards as CardValue[])
                .map(cv => convertToCard(cv))

            child.receiveCards([...initCardList])
        }
    } catch (error) {
        console.error('getInitCards error:', error)
    }
}

// 指定牌用accountId設定activeIndex
function setActiveByAccountId(accountId: string) {
    const idx = gamePlayerList.findIndex(p => p.accountId === accountId)
    if (idx !== -1) {
        activeIndex.value = idx
        activeAccount.value = gamePlayerList[idx]
    } else {
        console.warn(`Can't find player with accountId=${accountId}`)
    }
}

// 將卡牌傳入ScorePanel 計分
function handleCardScoring(card: Card) {
    const playerName = activeAccount.value?.name || ''
    latestPlayedCard.value = card
    latestPlayer.value = activeAccount.value
    scorePanelRef.value?.handleScore(card, playerName)
    //抓下一個玩家的組件ref
    const nextInst = allPlayerRefs.value[activeIndex.value]
    if (nextInst) {
        getNewCard(nextInst)
    }
    handleEffectCard(card);
}

// 將失敗的電腦玩家設定成eliminated
function handleComputerPlayerEliminated(account: Account) {
    const idx = gamePlayerList.findIndex(p => p.accountId === account.accountId);
    if (idx !== -1) {
        gamePlayerList[idx].status = 'eliminated';
    }
    nextPlayer();
}

// 將失敗的玩家設定成eliminated
function handlePlayerEliminated(account: Account) {
    const idx = gamePlayerList.findIndex(p => p.accountId === account.accountId);
    if (idx !== -1) {
        gamePlayerList[idx].status = 'eliminated';
    }
    gameOver.value = true
    notifyPlayerLose()
}

// 處理牌對回合效果
function handleEffectCard(card: Card) {
    switch (card.effect) {
        case 'reverse_turn_order':
            isReversed.value = !isReversed.value
            nextPlayer()
            break;

        case 'designate_next_player':
            setActiveByAccountId(card.designate.accountId)
            break;

        case 'skip_turn':
            nextPlayer();
            break;

        default:
            nextPlayer();
            break;
    }
}

// 計算目前輪次最高手牌上限
function calcMaxCurrentHandLimit(playCount: number, firstRound: number, nextRound: number): number {
    const originHandCardsCount = 5
    if (playCount <= firstRound) {
        return originHandCardsCount;
    }
    const extra = Math.floor((playCount - firstRound) / nextRound) + 1;
    const limit = originHandCardsCount - extra;
    return Math.max(limit, 2);
}

// 發新一張牌到手牌
async function getNewCard(targetInstance: { receiveCards: (cards: Card[]) => void; getHandCardsCount: () => number; }) {
    const handCardsCount = targetInstance.getHandCardsCount();
    maxHandCardCount.value = calcMaxCurrentHandLimit(playCount.value, maxHandCardCountRoundSetting.firstRound, maxHandCardCountRoundSetting.nextRound)
    if (maxHandCardCount.value <= handCardsCount) {
        return
    }

    async function tryDraw(count = 1) {
        const res = await axios.get(
            `https://www.deckofcardsapi.com/api/deck/${deckID.value}/draw/?count=${count}`
        );
        return res.data;
    }
    let data = await tryDraw(1);
    if (!data.cards.length) {
        deckID.value = null
        await getDeck();
        data = await tryDraw(1);
    }
    const newCard = convertToCard((data.cards as CardValue[])[0]);
    targetInstance.receiveCards([newCard]);
}

// 把使用者加入遊戲順序清單
function getPlayerNames() {
    playerList = [...gamePlayerList];
}

// 設定最一開始的玩家
function setInitTurn() {
    activeAccount.value = gamePlayerList[activeIndex.value];
}

// 設定最一開始的玩家
async function resetGame() {
    Object.assign(Object.assign(state, createGameState()))
    scorePanelRef.value?.resetScorePanel();
    for (const child of allPlayerRefs.value) {
        if (!child) continue
        child.resetPlayer();
    }
    otherPlayer.value.status = 'playing'
    player.value.status = 'playing'
    gamePlayerList.forEach(player => {
        player.status = 'playing';
    });
    getPlayerNames();
    await getDeck();
    await getInitCards();
    setInitTurn()
}

const notifyPlayerWin = () => {
    Swal.fire({
        title: "Winner winner chicken dinner.",
        width: 600,
        padding: "3em",
        color: "#716add",
        showDenyButton: true,
        confirmButtonText: 'Back to Home',
        denyButtonText: `Play Again`,
        backdrop: `
            rgba(0,0,123,0.4)
            url("${nyanCat}")
            left top
            no-repeat 
        `
    })
        .then((result) => {
            if (result.isConfirmed) {
                console.log('Confirmed')
            } else if (result.isDenied) {
                resetGame()
                console.log('Denied')
            }
        });
}

const notifyPlayerLose = () => {
    Swal.fire({
        title: 'You Lose',
        showDenyButton: true,
        confirmButtonText: 'Back to Home',
        denyButtonText: `Play Again`,
        customClass: {
            confirmButton: 'btn btn btn-primary me-2',
            denyButton: 'btn btn btn-primary'
        },
        buttonsStyling: false
    })
        .then((result) => {
            if (result.isConfirmed) {
                console.log('Confirmed')
            } else if (result.isDenied) {
                resetGame()
                console.log('Denied')
            }
        })
}

onMounted(async () => {
    try {
        getPlayerNames();
        await getDeck();
        await getInitCards();
        setInitTurn()
    } catch (e: any) {
        console.error('onMounted failed:', e)
        throw new Error(e);
    }
})
</script>
<style scoped></style>