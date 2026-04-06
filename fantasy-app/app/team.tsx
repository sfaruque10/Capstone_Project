import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";

const styles = StyleSheet.create({
  logo: {
    width: 447 / 2,
    height: 325 / 2,
  },
});
interface TeamProps {
  teamID: string;
}
interface TeamResponse {
  team: Team;
}
interface Team {
  id: string;
  displayName: string;
  logos: Logo[];
}
interface Logo {
  href: string;
}
interface RosterResponse {
  athletes: Athletes[];
}
interface Athletes {
  position: string;
  items: Items[];
}

interface Items {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  displayWeight: string;
  displayHeight: string;
  age: number;
  headshot: Headshot;
  jersey: string;
  position: Position[];
}
interface Headshot {
  href: string;
}
interface Position {
  displayName: string;
  abbreviation: string;
}

function Team() {
  const { teamID } = useLocalSearchParams<{ teamID: string }>();
  const [team, setTeam] = useState<Team | null>(null);
  const [roster, setRoster] = useState<Athletes[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchTeamInfo = async () => {
    try {
      const response = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams/${teamID}`,
      );
      const data = await response.json();
      setTeam(data.team);
      //   const team = data.
    } catch (error) {
      console.error(error);
    }
  };

  const fetchRoster = async () => {
    try {
      const response = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams/${teamID}/roster`,
      );
      const rosterData = await response.json();
      setRoster(rosterData.athletes);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    if (!teamID || teamID === "undefined") return;
    fetchTeamInfo();
    fetchRoster();
  }, [teamID]);

  return (
    <ScrollView>
      <Text>{team?.displayName}</Text>
      {/* <Button title="Roster" onPress={() => fetchRoster()} /> */}
      {/* <Text>{roster[1]?.position}</Text> */}
      {roster.map((group) => (
        <View key={group.position}>
          <Text>{group.position}</Text>
          {group.items.map((player) => (
            <View key={player.id}>
              <Button
                title={player.fullName}
                onPress={() =>
                  router.push({
                    pathname: "/player",
                    params: { playerID: player.id },
                  })
                }
              />
              <Text>
                {player.jersey}: {player.fullName}
              </Text>
              <Image
                style={styles.logo}
                source={{
                  uri: player.headshot
                    ? player.headshot.href
                    : team?.logos[0].href,
                }}
              />
              {/* <Text>{player.jersey}</Text> */}
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

export default Team;
