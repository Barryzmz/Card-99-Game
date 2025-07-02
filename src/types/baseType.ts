export interface Account {
  avatar: string
  accountId: string
  accountName: string
  name: string
  type: string
  introduction: string
}

export interface CardValue {
  code: string,
  image: string,
  images: {
    svg: string, png: string
  },
  suit: string,
  value: string
}

export const BackCard: CardValue = {
  code: "", 
  image: "https://deckofcardsapi.com/static/img/back.png", 
  images: {svg: "", png: "https://deckofcardsapi.com/static/img/back.png"}, 
  value: "", 
  suit: ""
}

export interface Card {
  cardValue: CardValue,
  level: number,
  value: number,
  effect: string,
  score: number,
  designate: string
}
