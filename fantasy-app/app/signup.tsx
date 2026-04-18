import { router } from "expo-router";
import { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
import { register } from '../services/auth';

function Signup() {
  const [username, onChangeUsername] = useState("");
  const [email, onChangeEmail] = useState("");
  const [password, onChangePassword] = useState("");
  const [reenterPassword, onChangeReenterPassword] = useState("");

  const handleSignup = async () => {
    if (password !== reenterPassword) {
      alert("Passwords do not match!");
      return;
    }
    try {
      await register(username, email, password);
      console.log('User registered!');
      router.replace('/');
    } catch (err) {
      console.error('Signup error:', err);
    }
  };


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
        placeholder="Username"
        placeholderTextColor="#a19f9f"
        value={username}
        onChangeText={onChangeUsername}
      />
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
      <Button title="Sign-up" onPress={handleSignup} />
    </View>
  );
}

export default Signup;
