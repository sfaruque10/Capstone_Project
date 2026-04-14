import { Stack, Tabs } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Tabs>
        <Tabs.Screen name="home" />
        <Tabs.Screen name="league" />
        <Tabs.Screen
          name="index"
          options={{ href: null, tabBarStyle: { display: "none" } }}
        />
        <Tabs.Screen
          name="login"
          options={{ href: null, tabBarStyle: { display: "none" } }}
        />
        <Tabs.Screen
          name="signup"
          options={{ href: null, tabBarStyle: { display: "none" } }}
        />
        <Tabs.Screen name="navbar" options={{ href: null }} />
        <Tabs.Screen name="team" options={{ href: null }} />
        <Tabs.Screen name="player" options={{ href: null }} />
      </Tabs>
    </Stack>
  );
}
