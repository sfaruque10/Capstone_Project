import { router } from "expo-router";
import { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";

function Login() {
  const [email, onChangeEmail] = useState("");
  const [password, onChangePassword] = useState("");
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        // borderWidth: 1,
      }}
    >
      <Text>Login</Text>
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
      <Button title="Login" onPress={() => router.push("/home")} />
    </View>
  );
}

export default Login;
