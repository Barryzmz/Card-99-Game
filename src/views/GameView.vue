<template>
    <div class="container-fluid  p-0 bg-success">
        <div class="row d-flex justify-content-center mx-0 ">
            <div class="col-3 pt-2 min-vh-100 bg-secondary ">
                <div class="d-flex justify-content-center align-items-center bg-light p-2 mb-2 rounded">
                    <div class="col-auto">
                        <h3 class="text-dark mb-0">Turn Order:</h3>
                    </div>
                    <div class="col-auto mx-3">
                        <img :src="gameController.state.isReversed ? upArrow : downArrow" style="height: 40px;" alt="turn order arrow" />
                    </div>
                </div>
                <ComputerPlayer
                    v-for="(bot, idx) in selectComputerList"
                    :key="bot.accountId"
                    ref="computerPlayersRef"
                    :isActive="gameController.state.activeAccount?.accountId === bot.accountId"
                    :playerInfo="bot"
                    :playerList="gamePlayerList"
                    :gameScore="gameController.state.gameScore"
                    @playCard="handleCardScoring"
                    @report-computerPlayer-eliminated="handleComputerPlayerEliminated"
                />
            </div>
            <div class="col-9 p-0 d-flex flex-column justify-content-between">
                <div class="d-flex justify-content-center align-items-start pt-2 my-2">
                    <div class="col-4 p-0">
                        <h3 class="text-white"> </h3>
                    </div>
                    <div class="col-4 d-flex justify-content-center align-items-center">
                        <h3 class="text-white">Card 99 Game</h3>
                    </div>
                    <div class="col-4 p-0">
                        <div class="d-flex justify-content-center align-items-center">
                            <RouterLink to="/" class="btn btn-primary mx-1">
                                Back to Home
                            </RouterLink>
                            <button type="button" class="btn btn-primary mx-1" @click="resetGame">Reset Game</button>
                        </div>
                        
                    </div>
                </div>
                <div class="row d-flex justify-content-center mx-0 overflow-hidden">
                    <div class="col-8 p-0">
                        <ScorePanel ref="scorePanelRef" 
                            :currentPlayer="gameController.state.activeAccount?.name ?? null" 
                            :maxHandCardCount="gameController.state.maxHandCardCount"
                            :gameScore="gameController.state.gameScore"
                            :playCount="gameController.state.playCount"
                            @score-updated="gameController.state.gameScore = $event"
                            @playCount-updated="gameController.state.playCount = $event"
                        />
                    </div>
                </div>
                <PlayerArea ref="playerRef"
                    :isActive="gameController.state.activeAccount?.accountId === player.accountId"
                    :playerInfo="player"
                    :playerList="gamePlayerList"
                    :gameScore="gameController.state.gameScore"
                    @playCard="handleCardScoring"
                    @report-Player-eliminated="handlePlayerEliminated"
                />
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { toRefs, onMounted, ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import Swal from 'sweetalert2'
import type { CardValue, Card, Account } from '@/types/baseType'
import { cardFactory, getRandomAccount } from '@/utils/cardUtils'
import { useGameController } from '@/utils/gameController'
import ScorePanel from '@/components/ScorePanel.vue'
import PlayerArea from '@/components/Player.vue'
import ComputerPlayer from '@/components/ComputerPlayer.vue'
import upArrow from '@/assets/up-arrow.svg'
import downArrow from '@/assets/down-arrow.svg'
import nyanCat from '@/assets/nyan-cat.gif'

const router = useRouter()
const gameController = useGameController()
const props = defineProps<{
    playerName: string
    opponentCount: number
    firstRound: number
    nextRound: number
}>()
const { playerName, opponentCount, firstRound, nextRound } = props
let player: Account = { idx: 0, avatar: '', accountId: 'player0', name: playerName, status: 'playing' }
const computerList : Account[] = [
    { idx: 1, avatar: '', accountId: 'player1', name: 'Bot A', status: 'playing' },
    { idx: 2, avatar: '', accountId: 'player2', name: 'Bot B', status: 'playing' },
    { idx: 3, avatar: '', accountId: 'player3', name: 'Bot C', status: 'playing' },
    { idx: 4, avatar: '', accountId: 'player4', name: 'Bot D', status: 'playing' },
    { idx: 5, avatar: '', accountId: 'player5', name: 'Bot E', status: 'playing' }
]
let gamePlayerList: Account[] = []
let selectComputerList= ref<Account[]>([])
const scorePanelRef = ref()
const computerPlayersRef = ref<InstanceType<typeof ComputerPlayer>[]>([])
const playerRef = ref<InstanceType<typeof PlayerArea> | null>(null)
const allPlayerRefs = computed(() => [
    playerRef.value,
    ...computerPlayersRef.value,
])
const maxHandCardCountRoundSetting = {
    firstRound: firstRound,
    nextRound: nextRound
}

// 檢查是否已經獲勝
function checkPlayerWin(): boolean {
    const alive = gamePlayerList.filter(p => p.status !== 'eliminated');
    return alive.length === 1 && alive[0].accountId === 'player0';
}

// 處理誰是下一位玩家
function nextPlayer() {
    const len = allPlayerRefs.value.length
    let newIndex = gameController.state.activeIndex
    let attempts = 0
    do {
        if (++attempts > len) {
            console.warn('All players are out')
            return
        }

        // 判斷賽局是否結束
        if (gameController.state.gameOver) {
            console.log('Game Over')
            return
        }

        // 判斷電腦玩家是否都出局，玩家獲得勝利
        if (checkPlayerWin()) {
            console.log('win')
            notifyPlayerWin()
        }

        newIndex = gameController.state.isReversed
            ? (newIndex - 1 + len) % len
            : (newIndex + 1) % len
        const candidate = gamePlayerList[newIndex]
        if (candidate.status !== 'eliminated') {
            break
        }
    } while (newIndex !== gameController.state.activeIndex)
    gameController.state.activeIndex = newIndex
    gameController.state.activeAccount = gamePlayerList[newIndex]
}

// 洗牌
async function getDeck() {
    try {
        gameController.state.gameOver = false;
        if (gameController.state.deckID == null) {
            const result = await axios.get("https://www.deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1");
            gameController.state.deckID = result.data.deck_id;
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
                `https://www.deckofcardsapi.com/api/deck/${gameController.state.deckID}/draw/?count=5`
            )
            const initCardList: Card[] = (result.data.cards as CardValue[]).map(cv => cardFactory(cv))

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
        gameController.state.activeIndex = idx
        gameController.state.activeAccount = gamePlayerList[idx]
    } else {
        console.warn(`Can't find player with accountId=${accountId}`)
    }
}

// 計分並將卡牌傳入ScorePanel 顯示
async function handleCardScoring(card: Card) {
    const dealer = gameController.state.activeAccount?.name || ''
    gameController.state.latestPlayedCard = card
    gameController.state.latestPlayer = gameController.state.activeAccount
    const currentInst = allPlayerRefs.value[gameController.state.activeIndex] // 得到目前玩家的ref
    card.effectStrategy.execute(gameController, gamePlayerList, card); // 處理牌的功能
    gameController.state.playCount ++ // 輪次加1
    await nextTick()
    scorePanelRef.value?.handleCardEffectDiscription(card, dealer)
    //用currentInst發牌給目前玩家
    if (currentInst) {
        getNewCard(currentInst)
    }
    //非指定牌就輪下一位玩家
    if (card.effectStrategy.nextPlayer) {
        nextPlayer()
    }
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
    gameController.state.gameOver = true
    notifyPlayerLose()
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
    gameController.state.maxHandCardCount = calcMaxCurrentHandLimit(gameController.state.playCount, maxHandCardCountRoundSetting.firstRound, maxHandCardCountRoundSetting.nextRound)
    if (gameController.state.maxHandCardCount <= handCardsCount) {
        return
    }

    async function tryDraw(count = 1) {
        const res = await axios.get(
            `https://www.deckofcardsapi.com/api/deck/${gameController.state.deckID}/draw/?count=${count}`
        );
        return res.data;
    }
    let data = await tryDraw(1);
    if (!data.cards.length) {
        gameController.state.deckID = null
        await getDeck();
        data = await tryDraw(1);
    }
    const newCard = cardFactory((data.cards as CardValue[])[0]);
    targetInstance.receiveCards([newCard]);
}

// 把使用者加入遊戲順序清單
function getPlayerNames() {
    selectComputerList.value = computerList.slice(0, opponentCount)
    gamePlayerList = [ player, ...selectComputerList.value ]
}

// 設定第一位出牌的玩家
function setInitTurn() {
    const firstPlayer = getRandomAccount(gamePlayerList)
    if (!firstPlayer || typeof firstPlayer.accountId !== 'string') {
        gameController.state.activeAccount = gamePlayerList[gameController.state.activeIndex];
        console.warn('The first player accountId is empty');
        return;
    }
    else {
        setActiveByAccountId(firstPlayer?.accountId);
    }
}

// 重置遊戲
async function resetGame() {
    gameController.reset();
    scorePanelRef.value?.resetScorePanel();
    for (const child of allPlayerRefs.value) {
        if (!child) continue
        child.resetPlayer();
    }
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
                console.log('notifyPlayerWin-home')
                router.push({ name: 'home' })
            } else if (result.isDenied) {
                resetGame()
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
                console.log('notifyPlayerLose-home')
                router.push({ name: 'home' })
            } else if (result.isDenied) {
                resetGame()
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