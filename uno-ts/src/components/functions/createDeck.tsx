interface Card {
    type: string;
    color: string | null;
    number?: string;
  }
  
  export function createDeck(): Card[] {
    const colors = ["red", "green", "yellow", "blue"];
    const numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    const specialCards = [
      { type: "skip", color: null },
      { type: "reverse", color: null },
      { type: "drawTwo", color: null },
    ];
    const wildCards = [
      { type: "wild", color: "wild" },
      { type: "wildDrawFour", color: "wild" },
    ];
  
    const deck: Card[] = [];
  
    for (let color of colors) {
      for (let number of numbers) {
        deck.push({ type: "number", color, number });
        if (number !== "0") {
          deck.push({ type: "number", color, number });
        }
      }
    }
  
    for (let color of colors) {
      for (let card of specialCards) {
        const newCard = { ...card, color };
        deck.push(newCard);
        deck.push(newCard);
      }
    }
  
    for (let card of wildCards) {
      for (let i = 0; i < 4; i++) {
        deck.push({ ...card });
      }
    }
  
    return deck;
  }
  

  export default createDeck;
  