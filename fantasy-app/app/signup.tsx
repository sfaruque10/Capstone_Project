import { router } from "expo-router";
import { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";

function Signup() {
  const [email, onChangeEmail] = useState("");
  const [password, onChangePassword] = useState("");
  const [reenterPassword, onChangeReenterPassword] = useState("");
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Sign up</Text>
      <TextInput
        placeholder="Email"
        placeholderTextColor="#a19f9f"
        value={email}
        onChangeText={onChangeEmail}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#a19f9f"
        secureTextEntry={true}
        value={password}
        onChangeText={onChangePassword}
      />
      <TextInput
        placeholder="Re-Enter Password"
        placeholderTextColor="#a19f9f"
        secureTextEntry={true}
        value={reenterPassword}
        onChangeText={onChangeReenterPassword}
      />
      <Button title="Sign-up" onPress={() => router.push("/home")} />
    </View>
  );
}

export default Signup;
