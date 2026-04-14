import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Button, FlatList, ScrollView, Text, View } from "react-native";

interface Team {
  id: string;
  displayName: string;
  abbreviation: string;
}

interface TeamWrapper {
  team: Team;
}

interface TeamResponse {
  sports: {
    leagues: {
      teams: TeamWrapper[];
    }[];
  }[];
}
// live game scores
interface GameResponse {
  events: Events[];
}

interface Events {
  id: string;
  competitions: Competitions[];
}

interface Competitions {
  id: string;
  date: string;
  competitors: Competitors[];
  venue: Venue;
  status: Status;
}

interface Competitors {
  team: TeamDetail;
  score: string;
  linescores: Linescores[];
  statistics: Statistics[];
}

interface TeamDetail {
  id: string;
  abbreviation: string;
  name: string;
  logo: string;
}

interface Linescores {
  displayValue: string;
  period: number;
}

interface Statistics {
  name: string;
  abbreviation: string;
  displayValue: string;
}

interface Venue {
  id: string;
  fullName: string;
  address: Address;
}

interface Address {
  city: string;
  state: string;
  // country: string;
}

interface Status {
  displayClock: string;
  period: number;
  type: Type;
}

interface Type {
  id: string;
  name: string;
  state: string;
  detail: string;
}

function Home() {
  const [teams, setTeams] = useState<TeamWrapper[]>([]);
  const [games, setGames] = useState<Events[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchTeams = async () => {
    try {
      const response = await fetch(
        "https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams",
      );
      const data: TeamResponse = await response.json();
      const mlbTeams = data.sports[0].leagues[0].teams;
      setTeams(mlbTeams);
    } catch (error) {
      console.error(error);
    }
  };
  const fetchGames = async () => {
    try {
      const response = await fetch(
        "https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard",
      );
      const data: GameResponse = await response.json();
      const mlbGames = data.events;
      // console.log(response);
      setGames(mlbGames);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    fetchTeams();
    fetchGames();
  }, []);
  // return (
  //   <View
  //     style={{
  //       flex: 1,
  //       justifyContent: "center",
  //       alignItems: "center",
  //     }}
  //   >
  //     <Text>Home</Text>
  //     {/* <FlatList data={teams} keyExtractor={(item) => item.team.id} /> */}
  //   </View>
  // );
  return (
    <>
      <ScrollView horizontal={true}>
        {games.map((game) => (
          <View key={game.id}>
            <Button
              title="Game"
              onPress={() =>
                router.push({
                  pathname: "/game",
                  params: { gameID: game.id },
                })
              }
            />
            {/* <Text>{game.competitions[0].status.type.detail}</Text> */}
            <Text>
              {game.competitions[0].competitors[1].team.abbreviation}:{" "}
              {game.competitions[0].competitors[1].score}
            </Text>
            <Text>
              {game.competitions[0].competitors[0].team.abbreviation}:{" "}
              {game.competitions[0].competitors[0].score}
            </Text>
          </View>
        ))}
      </ScrollView>
      <FlatList
        data={teams}
        keyExtractor={(item) => item.team.id}
        renderItem={({ item }) => (
          <View
            style={{ flexDirection: "row", padding: 15, alignItems: "center" }}
          >
            {/* {item.team.logos?.[0] && (
            <Image 
              source={{ uri: item.team.logos[0].href }} 
              style={{ width: 40, height: 40, marginRight: 12 }} 
            />
          )} */}
            <View>
              {/* <Text style={{ fontSize: 18, fontWeight: "bold" }}>
              {item.team.displayName}
            </Text> */}
              <Text style={{ color: "gray" }}>{item.team.abbreviation}</Text>
              <Button
                title={item.team.displayName}
                onPress={() =>
                  router.push({
                    pathname: "/team",
                    params: { teamID: item.team.id },
                  })
                }
              />
            </View>
          </View>
        )}
      />
    </>
  );
}

export default Home;
// https://espnapi.com/
// https://github.com/pseudo-r/Public-ESPN-API?tab=readme-ov-file
// https://www.prizepicks.com/playbook-article/how-to-play-prizepicks-mlb-fantasy-scoring-system
