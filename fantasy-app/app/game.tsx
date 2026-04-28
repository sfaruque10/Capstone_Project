import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text } from "react-native";

interface GameProps {
  gameID: string;
}

interface GameResponse {
  situation: Situation;
  boxscore: Boxscore;
  gameInfo: GameInfo;
}

interface Situation {
  balls: number;
  strikes: number;
  outs: number;
}

interface Boxscore {
  teams: Teams[];
  players: Players[];
}
interface Teams {
  team: Team;
  // statistics: Statistics;
  homeAway: string;
}

interface Team {
  id: string;
  name: string;
  addreviation: string;
  displayName: string;
  logo: string;
}
// interface Statistics {}

interface Players {
  statistics: Statistics[];
}
interface Statistics {
  athletes: Athletes[];
}
interface Athletes {
  athlete: Athlete;
  position: Position;
  stats: string[];
}
interface Athlete {
  id: string;
  displayName: string;
}
interface Position {
  id: string;
  displayName: string;
  abbreviation: string;
}
interface GameInfo {
  venue: Venue;
}

interface Venue {
  id: string;
  fullName: string;
  shortName: string;
}

function Game() {
  const { gameID } = useLocalSearchParams<{ gameID: string }>();
  const [game, setGame] = useState<GameResponse | null>(null);
  const fetchGame = async () => {
    try {
      const response = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/summary?event=${gameID}`,
        // `https://sports.core.api.espn.com/v2/sports/baseball/leagues/mlb/events/${gameID}`,
      );
      const data = await response.json();
      setGame(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!gameID || gameID === "undefined") return;
    fetchGame();
  }, [gameID]);
  return (
    <ScrollView>
      <Text>{game?.gameInfo.venue.fullName}</Text>
    </ScrollView>
  );
}

export default Game;
