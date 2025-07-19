import { reactive } from 'vue'
import type { Card, Account } from '@/types/baseType'

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
    maxHandCardCount: 5 as number,
  }
}

export function useGameController() {
  const state = reactive(createGameState())
  function reset() {
    Object.assign(state, createGameState())
  }
  const controller = {
    state,
    reset,
  }
  return controller
}

export type GameController = ReturnType<typeof useGameController>
