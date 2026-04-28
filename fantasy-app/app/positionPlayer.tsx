import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  ScrollView,
  Text,
  View,
} from "react-native";
import { addPlayerToTeam } from "@/services/teams";
import API from "@/services/api";

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
  parent: Parent;
}
interface Headshot {
  href: string;
}
interface Position {
  displayName: string;
  abbreviation: string;
  position: Position;
}

interface Parent {
  id: string;
  displayName: string;
}

function PositionPlayer() {
  const { position, teamId, lID, existingIds } = useLocalSearchParams<{
    position: string;
    teamId: string;
    lID: string;

    existingIds: string;
  }>();

  const router = useRouter();
  const [positionPlayers, setPositionPlayers] = useState<Items[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // const alreadyAdded = existingIds ? JSON.parse(existingIds) : [];
  const [alreadyAdded, setAlreadyAdded] = useState<number[]>(
    existingIds ? JSON.parse(existingIds) : [],
  );
  const fetchPlayer = async () => {
    setIsLoading(true);
    try {
      const teamIds = Array.from({ length: 30 }, (_, i) => i + 1);

      const batchSize = 10;
      let allResponses: RosterResponse[] = [];

      for (let i = 0; i < teamIds.length; i += batchSize) {
        const batch = teamIds.slice(i, i + batchSize);
        const batchResponses = await Promise.all(
          batch.map((id) =>
            fetch(
              `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams/${id}/roster`,
            ).then((res) => res.json()),
          ),
        );
        allResponses = [...allResponses, ...batchResponses];
      }

      const playersFromAllTeams = allResponses.flatMap(
        (data: RosterResponse) => {
          const target = position.toLowerCase().trim();

          const groupsToGrab = data.athletes?.filter((group: Athletes) => {
            const groupName = group.position.toLowerCase().trim();

            if (target === "designated hitter" || target === "dh") {
              return [
                "catchers",
                "catcher",
                "infielders",
                "infield",
                "outfielders",
                "outfield",
                "designated hitter",
                "designated hitters",
              ].includes(groupName);
            }

            const isInfield = [
              "first baseman",
              "second baseman",
              "third baseman",
              "shortstop",
              "infielder",
            ].includes(target);
            const isOutfield = ["outfielder"].includes(target);
            const isCatcher = target === "catcher";
            const isPitcher = target === "pitcher";

            return (
              groupName.includes(target) ||
              (isInfield &&
                (groupName === "infielders" || groupName === "infield")) ||
              (isOutfield &&
                (groupName === "outfielders" || groupName === "outfield")) ||
              (isCatcher &&
                (groupName === "catchers" || groupName === "catcher")) ||
              (isPitcher &&
                (groupName === "pitchers" || groupName === "pitcher"))
            );
          });

          const items = groupsToGrab
            ? groupsToGrab.flatMap((g) => g.items)
            : [];

          let targetAbbreviation = "";
          if (target === "first baseman") targetAbbreviation = "1B";
          else if (target === "second baseman") targetAbbreviation = "2B";
          else if (target === "third baseman") targetAbbreviation = "3B";
          else if (target === "shortstop") targetAbbreviation = "SS";
          else if (target === "catcher") targetAbbreviation = "C";

          return items.filter((player: any) => {
            if (
              target === "infielder" ||
              target === "outfielder" ||
              target === "catcher"
            )
              return true;

            const playerAbbreviation = player.position?.abbreviation;

            if (target === "designated hitter" || target === "dh") {
              return playerAbbreviation === "DH" || playerAbbreviation !== "P";
            }

            if (target === "pitcher") return true;

            return playerAbbreviation === targetAbbreviation;
          });
        },
      );

      setPositionPlayers(playersFromAllTeams);
    } catch (error) {
      console.error("Failed to fetch players:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPlayer = async (player: Items) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await addPlayerToTeam(Number(teamId), player, Number(lID), position);
      router.back();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchPlayer();
  }, [position]);

  useEffect(() => {
    const pollDraftedPlayers = async () => {
      try {
        const res = await API.get(`/leagues/${lID}/drafted-players`);
        setAlreadyAdded(res.data); // Updates the array with newly drafted player IDs
      } catch (error) {
        console.error("Failed to poll drafted players:", error);
      }
    };

    const intervalId = setInterval(pollDraftedPlayers, 5000);

    return () => clearInterval(intervalId);
  }, [lID]);
  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
        {position} List:
      </Text>

      {isLoading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : positionPlayers.length > 0 ? (
        positionPlayers.map((player) => {
          const isDuplicate = alreadyAdded.includes(Number(player.id));

          return (
            <View
              key={player.id}
              style={{
                marginBottom: 15,
                padding: 10,
                borderBottomWidth: 1,
                borderColor: "#eee",
              }}
            >
              <Text>
                {player.fullName} (#{player.jersey})
              </Text>

              {isDuplicate ? (
                <Text style={{ color: "gray", fontStyle: "italic" }}>
                  Already drafted in this league
                </Text>
              ) : (
                <Button
                  title="Add Player"
                  onPress={() => handleAddPlayer(player)}
                  disabled={isSubmitting}
                />
              )}
            </View>
          );
        })
      ) : (
        <Text style={{ textAlign: "center", marginTop: 20 }}>
          No players found for this position.
        </Text>
      )}
    </ScrollView>
  );
}

export default PositionPlayer;
