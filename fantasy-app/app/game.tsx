import { useLocalSearchParams } from "expo-router";
import { useState } from "react";

interface GameProps {
  gameID: string;
}
function Game() {
  const { gameID } = useLocalSearchParams<{ gameID: string }>();
  const [game, setGame] = useState();
  const fetchGame = async () => {
    try {
      const response = await fetch(
        `https://sports.core.api.espn.com/v2/sports/baseball/leagues/mlb/events/${gameID}`,
      );
      const data = response.json();
    } catch (error) {
      console.error(error);
    }
  };
}

export default Game;
