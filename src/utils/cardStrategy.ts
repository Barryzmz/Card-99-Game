import type { Card, Account } from '@/types/baseType'
import type { GameController } from '@/utils/gameController'

// 宣告CardStrategy
export interface CardStrategy {
  execute(game: GameController, gamePlayerList: Account[], card: Card): void;
  effect: string
  updateEffect(card: Card): void
  nextPlayer: boolean
}

// 普通牌功能: 加點數
export class AddStrategy implements CardStrategy {
  effect = ''
  nextPlayer = true
  execute(game: GameController, gamePlayerList: Account[], card: Card): void {
    game.state.gameScore = game.state.gameScore + card.score;
    this.updateEffect(card);
  }
  updateEffect(card: Card): void {
    this.effect = `Add ${card.score}`
  }
}

// 10、Q功能: 可以選擇加或減(10、20)
export class AddOrSubStrategy implements CardStrategy {
  effect = ''
  nextPlayer = true
  execute(game: GameController, gamePlayerList: Account[], card: Card): void {
    game.state.gameScore = game.state.gameScore + card.score;
    this.updateEffect(card);
  }
  updateEffect(card: Card): void {
    this.effect = card.score >= 0
      ? `Add ${card.score}`
      : `Subtract ${Math.abs(card.score)}`
  }
}

// 4功能: 反轉出牌順序
export class ReverseTurnOrderStrategy implements CardStrategy {
  effect = ''
  nextPlayer = true
  execute(game: GameController, gamePlayerList: Account[], card: Card): void {
    game.state.isReversed = !game.state.isReversed
    this.updateEffect(card);
  }
  updateEffect(card: Card): void {
    this.effect = `Reverse turn order`
  }
}

// 5功能: 指定下一位玩家
export class DesignateNextPlayerStrategy implements CardStrategy {
  effect = ''
  nextPlayer = false
  execute(game: GameController, gamePlayerList: Account[], card: Card): void {
    const { activeIndex, activeAccount }  = setActiveByAccountId(card.designate.accountId, gamePlayerList)
    console.log('DesignateNextPlayerStrategy:', activeIndex, activeAccount)
    game.state.activeIndex = activeIndex;
    game.state.activeAccount = activeAccount;
    console.log('DesignateNextPlayerStrategy2:', game.state.activeIndex, game.state.activeAccount)
    this.updateEffect(card);
  }
  updateEffect(card: Card): void {
    this.effect = `Designate to ${card.designate.name}`
  }
}

// J功能: Pass
export class SkipTurnStrategy implements CardStrategy {
  effect = ''
  nextPlayer = true
  execute(game: GameController, gamePlayerList: Account[], card: Card): void {
    this.updateEffect(card);
  }
  updateEffect(card: Card): void {
    this.effect = `Skip turn`
  }
}

// K功能: 設gameScore為99
export class SetNinetyNineStrategy implements CardStrategy {
  effect = ''
  nextPlayer = true
  execute(game: GameController, gamePlayerList: Account[], card: Card): void {
    game.state.gameScore = 99;
    this.updateEffect(card);
  }
  updateEffect(card: Card): void {
    this.effect = `Set the score to 99`
  }
}

// 黑桃A功能: 設gameScore為0
export class ResetScoreStrategy implements CardStrategy {
  effect = ''
  nextPlayer = true
  execute(game: GameController, gamePlayerList: Account[], card: Card): void {
    game.state.gameScore = 0;
    this.updateEffect(card);
  }
  updateEffect(card: Card): void {
    this.effect = `Set the score to 0`
  }
}

// 指定牌用accountId設定activeIndex
function setActiveByAccountId(accountId: string, gamePlayerList: Account[]): { activeIndex: number; activeAccount: Account | null } {
  let activeIndex = 0;
  let activeAccount = null as Account | null;
  const idx = gamePlayerList.findIndex(p => p.accountId === accountId)
  if (idx !== -1) {
    activeIndex = idx
    activeAccount = gamePlayerList[idx]
  } else {
    console.warn(`setActiveByAccountId: Can't find player with accountId=${accountId}`)
  }
  return { activeIndex, activeAccount }
}

