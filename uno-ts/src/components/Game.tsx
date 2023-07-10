import React, { useEffect, useState } from "react";
import createDeck from "./functions/createDeck";
//todo revrse e skip cards
interface Player {
  name: string;
  hand: Card[];
}

interface Card {
  type: string;
  color: string | null;
  number?: string;
}

function Game() {
  const [numPlayers, setNumPlayers] = useState<number>(2);
  
  const [players, setPlayers] = useState<Player[]>(() => {
    const initialPlayers: Player[] = [];
    for (let i = 1; i <= numPlayers; i++) {
      initialPlayers.push({ name: `Player ${i}`, hand: [] });
    }
    return initialPlayers;
  });
  const [deck, setDeck] = useState<Card[]>([]);
  const [discardPile, setDiscardPile] = useState<Card[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<number>(0);
  const [lastCardPlayed, setLastCardPlayed] = useState<Card | null>(null);
  const [wildWindowOpen, setWildWindowOpen] = useState<boolean>(false);
  const [colorPicked, setColorPicked] = useState<string>("");
  const [waitForColorSelection, setWaitForColorSelection] = useState<boolean>(false);
  const [previousPlayer, setPreviousPlayer] = useState<number>(0);

  useEffect(() => {
    if (wildWindowOpen && colorPicked !== "") {
      setLastCardPlayed((prevCard) => {
        if (prevCard) {
          return { ...prevCard, color: colorPicked };
        }
        return null;
      });
      setWildWindowOpen(false);
      setColorPicked("");
      if (waitForColorSelection) {
        setWaitForColorSelection(false);
        setCurrentPlayer((prevPlayer) => (prevPlayer + 1) % players.length);
      }
    }
  }, [wildWindowOpen, colorPicked, waitForColorSelection, players.length]);

  useEffect(() => {
    resetGame();
  }, [numPlayers]);

  function resetGame() {
    setDeck([]);
    setDiscardPile([]);
    setPlayers(() => {
      const initialPlayers: Player[] = [];
      for (let i = 1; i <= numPlayers; i++) {
        initialPlayers.push({ name: `Player ${i}`, hand: [] });
      }
      return initialPlayers;
    });
    setLastCardPlayed(null);
    setCurrentPlayer(0);
    setWildWindowOpen(false);
    setColorPicked("");
    setWaitForColorSelection(false);
    setPreviousPlayer(0);
  }

  function shuffleAndStart() {
    const newDeck = createDeck();
    const shuffledDeck = shuffleCards([...newDeck]);
    const playerHands = distributeCards(shuffledDeck);

    setDeck(shuffledDeck);
    setDiscardPile([]);
    setPlayers(playerHands);
    setLastCardPlayed(shuffledDeck.pop()!);
  }

  function shuffleCards(deck: Card[]): Card[] {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  function distributeCards(deck: Card[]): Player[] {
    const playerHands: Player[] = [];

    for (let i = 0; i < numPlayers; i++) {
      const hand: Card[] = [];
      for (let j = 0; j < 7; j++) {
        hand.push(deck.pop()!);
      }
      playerHands.push({ name: players[i].name, hand });
    }

    return playerHands;
  }

  function handleCardClick(playerIndex: number, cardIndex: number) {
    if (playerIndex !== currentPlayer) {
      console.log("Not your turn");
      return;
    }
    if (waitForColorSelection) {
      console.log("Waiting for color selection");
      return;
    }
  
    const card = players[currentPlayer].hand[cardIndex];
  
    if (
      card.color !== lastCardPlayed?.color &&
      card.type !== "wild" &&
      card.color !== "wild" &&
      card.number !== lastCardPlayed?.number
    ) {
      console.log("Invalid card");
      return;
    }
  
    if (card.type === "reverse") {
      setCurrentPlayer((prevPlayer) => (prevPlayer - 1 + players.length) % players.length);
    } else if (card.type === "skip") {
      setCurrentPlayer((prevPlayer) => (prevPlayer + 2) % players.length);
    } else if (card.type === "drawTwo") {
      const nextPlayer = (currentPlayer + 1) % players.length;
      const newPlayers = [...players];
      const newHand = [...newPlayers[nextPlayer].hand];
      for (let i = 0; i < 2; i++) {
        const drawnCard = deck.shift();
        if (drawnCard) {
          newHand.push(drawnCard);
        }
      }
      newPlayers[nextPlayer] = { ...newPlayers[nextPlayer], hand: newHand };
      setPlayers(newPlayers);
      setDeck([...deck]);
    } else if (card.type === "wild" || card.type === "wildDrawFour") {
      const nextPlayer = (currentPlayer + 1) % players.length;
      const newPlayers = [...players];
      const newHand = [...newPlayers[nextPlayer].hand];
      const cardsToDraw = card.type === "wild" ? 0 : 4;
      for (let i = 0; i < cardsToDraw; i++) {
        const drawnCard = deck.shift();
        if (drawnCard) {
          newHand.push(drawnCard);
        }
      }
      newPlayers[nextPlayer] = { ...newPlayers[nextPlayer], hand: newHand };
      setPlayers(newPlayers);
      setDeck([...deck]);
      setCurrentPlayer((prevPlayer) => (prevPlayer + 2) % players.length);
    }
  
    if (card.color === "wild") {
      setWildWindowOpen(true);
      setWaitForColorSelection(true);
    }
  
    playCard(cardIndex, players[playerIndex].hand[cardIndex]);
  }
  

  function playCard(cardIndex: number, card: Card) {
    setPlayers((prevPlayers) => {
      const newPlayers = [...prevPlayers];
      const newHand = [...newPlayers[currentPlayer].hand];
      const removedCard = newHand.splice(cardIndex, 1)[0];
      newPlayers[currentPlayer] = {
        ...newPlayers[currentPlayer],
        hand: newHand,
      };
      return newPlayers;
    });
    setDiscardPile((prevDiscardPile) => [...prevDiscardPile, card]);
    setCurrentPlayer((prevPlayer) => (prevPlayer + 1) % players.length);
    setLastCardPlayed(card);
    console.log("Card played");
  }


  return (
    <div>
      <button onClick={shuffleAndStart}>Shuffle and Start</button>
      <div>Remaining Cards in Deck: {deck.length}</div>
      <div>Discard Pile: {discardPile.length}</div>
      <div>Current Player: {currentPlayer}</div>
      <div>Last Card Played Color: {lastCardPlayed?.color}</div>
      <div>Last Card Played Number: {lastCardPlayed?.number}</div>
      <div>Last Card Played Type: {lastCardPlayed?.type}</div>
      <button onClick={() => setNumPlayers(3)}>Set 3 Players</button>
      {wildWindowOpen && (
        <div>
          <h3>Pick a color:</h3>
          <button onClick={() => setColorPicked("red")}>Red</button>
          <button onClick={() => setColorPicked("blue")}>Blue</button>
          <button onClick={() => setColorPicked("green")}>Green</button>
          <button onClick={() => setColorPicked("yellow")}>Yellow</button>
        </div>
      )}
      {players.map((player, playerIndex) => (
        <div key={playerIndex}>
          <h2>{player.name}</h2>
          <ul>
            {player.hand.map((card, cardIndex) => (
              <li
                key={cardIndex}
                style={{
                  backgroundColor:
                    card.color === "wild" ? "purple" : card.color!,
                }}
                onClick={() => handleCardClick(playerIndex, cardIndex)}
              >
                {card.type === "number" ? card.number : card.type}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default Game;