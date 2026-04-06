import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

interface PlayerProps {
  playerID: string;
}

interface PlayerResponse {
  statistics: Statistics;
}

interface Statistics {
  displayName: string;
  labels: string[];
  names: string[];
  displayNames: string[];
  splits: Splits[];
}

interface Splits {
  displayName: string;
  stats: string[];
}
function Player() {
  const { playerID } = useLocalSearchParams<{ playerID: string }>();
  const [player, setPlayer] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchPlayerInfo = async () => {
    try {
      const response = await fetch(
        `https://site.web.api.espn.com/apis/common/v3/sports/baseball/mlb/athletes/${playerID}/overview`,
      );
      const data = await response.json();
      setPlayer(data.statistics);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    if (!playerID || playerID === "undefined") return;
    fetchPlayerInfo();
  }, [playerID]);

  return (
    <ScrollView>
      <Text>{player?.displayName}</Text>
      {player?.splits.map((name, index) => (
        <View key={index}>
          <Text key={index}>{name.displayName}</Text>
          {player?.displayNames.map((stat, index) => (
            <Text key={index}>
              {stat}: {name.stats[index]}
            </Text>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

export default Player;
