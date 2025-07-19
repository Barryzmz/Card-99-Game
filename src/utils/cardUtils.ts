import type { CardValue, Card, Account } from '@/types/baseType'
import * as strategies from '@/utils/cardStrategy'

export function translateCardsValue(value: any): string {
  switch (value) {
    case "JACK":
      value = "11";
      break;
    case "QUEEN":
      value = "12";
      break;
    case "KING":
      value = "13";
      break;
    case "ACE":
      value = "1";
      break;
    default:
      break;
  }
  return value;
}

export function translateCardsSuit(suit: string): number {
  switch (suit) {
    case "CLUBS": return 1;
    case "DIAMONDS": return 2;
    case "HEARTS": return 3;
    case "SPADES": return 4;
    default: return 0;
  }
}

// Factory：把 CardValue => Card
export function cardFactory(cardValue: CardValue): Card {
  const { score, level, effect, effectStrategy } = CardConfigMapping(cardValue);
  return {
    cardValue,
    score: score,
    level: level,
    effect: effect,
    designate: { accountId: '', name: '' },
    effectStrategy: effectStrategy
  }
}

export function CardConfigMapping(cardValue: CardValue): { score: number, level: number; effect: string; effectStrategy: strategies.CardStrategy } {
  const value = cardValue.value
  const suit = cardValue.suit

  if (value === 'ACE') {
    if(suit === 'SPADES'){
      // 黑桃A為重置牌
      return { score: 0, level: 3, effect: 'reset_score', effectStrategy: new strategies.ResetScoreStrategy() }
    }
    else
    {
      return { score: 1, level: 1, effect: '', effectStrategy: new strategies.AddStrategy() }
    }
  }

  switch (value) {
    case '4':
      return { score: 0, level: 2, effect: 'reverse_turn_order', effectStrategy: new strategies.ReverseTurnOrderStrategy() }
    case '5':
      return { score: 0, level: 2, effect: 'designate_next_player', effectStrategy: new strategies.DesignateNextPlayerStrategy() }
    case '10':
      return { score: 10, level: 2, effect: 'add_or_sub_ten', effectStrategy: new strategies.AddOrSubStrategy() }
    case 'JACK':
      return { score: 0, level: 2, effect: 'skip_turn', effectStrategy: new strategies.SkipTurnStrategy() }
    case 'QUEEN':
      return { score: 20, level: 2, effect: 'add_or_sub_twenty', effectStrategy: new strategies.AddOrSubStrategy() }
    case 'KING':
      return { score: 0, level: 2, effect: 'set_score_to_ninetyNine', effectStrategy: new strategies.SetNinetyNineStrategy() }
    default:
      return { score: parseInt(translateCardsValue(value)), level: 1, effect: '', effectStrategy: new strategies.AddStrategy() }
  }
}

export function analyzeBestPlay(cardsList: Card[], score: number): Card | null {
  const level1 = cardsList
  .filter(card => card.level === 1 && card.score <= score)
  .sort((a, b) => b.score - a.score);
  if (level1.length > 0) return level1[0];

  const level2 = cardsList
  .filter(card => card.level === 2)
  .sort((a, b) => a.score - b.score);
  if (level2.length > 0) return level2[0];

  const level3 = cardsList
  .filter(card => card.level === 3);
  if (level3.length > 0) return level3[0];

  return null;
}

export function getRandomAccount(accountList: Account[]) {
  if (accountList.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * accountList.length);
  return accountList[randomIndex];
}