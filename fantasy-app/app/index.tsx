// import { Button } from "@react-navigation/elements";
import { router } from "expo-router";
import { Button, Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Fantasy Sportsball</Text>
      {/* <NavigationContainer> */}
      <Button title="Login" onPress={() => router.push("/login")} />
      <Button title="Sign up" onPress={() => router.push("/signup")} />
      {/* </NavigationContainer> */}
    </View>
  );
}
