import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Button, FlatList, Text, View } from "react-native";

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

function Home() {
  const [teams, setTeams] = useState<TeamWrapper[]>([]);
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
  useEffect(() => {
    fetchTeams();
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
  );
}

export default Home;
// https://espnapi.com/
// https://github.com/pseudo-r/Public-ESPN-API?tab=readme-ov-file
// https://www.prizepicks.com/playbook-article/how-to-play-prizepicks-mlb-fantasy-scoring-system
