import type { CardValue, Card, Account } from '@/types/baseType'

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

export function convertToCard(cardValue: CardValue): Card {
  const { score, level, effect } = determineCardAttributes(cardValue)
  return {
    cardValue,
    level,
    value: parseInt(translateCardsValue(cardValue.value)),
    effect,
    score,
    designate:{accountId:'',name:''},
  }
}

export function determineCardAttributes(cardValue: CardValue): { score: number, level: number; effect: string } {
  const value = cardValue.value
  const suit = cardValue.suit

  if (value === 'ACE') {
    if(suit === 'SPADES'){
        // 黑桃A為重置牌
        return { score: 0, level: 3, effect: 'reset_score' }
    }
    else
    {
        return { score: 1, level: 1, effect: '' }
    }
  }

  switch (value) {
    case '4':
      return { score: 0, level: 2, effect: 'reverse_turn_order' }
    case '5':
      return { score: 0, level: 2, effect: 'designate_next_player' }
    case '10':
      return { score: 10, level: 2, effect: 'add_or_sub_ten' }
    case 'JACK':
      return { score: 0, level: 2, effect: 'skip_turn' }
    case 'QUEEN':
      return { score: 20, level: 2, effect: 'add_or_sub_twenty' }
    case 'KING':
      return { score: 0, level: 2, effect: 'set_score_to_ninetyNine' }
    default:
      return { score: parseInt(value), level: 1, effect: '' }
  }
}

export function analyszeBestPlay(cardsList: Card[], score: number): Card | null {
  const level1 = cardsList
  .filter(card => card.level === 1 && card.score < score)
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