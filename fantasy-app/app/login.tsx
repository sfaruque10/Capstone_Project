import { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
import { login } from '../services/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

function Login() {
  const [identifier, onChangeIdentifier] = useState("");
  const [password, onChangePassword] = useState("");
  const router = useRouter();

    const handleLogin = async () => {
    try {
      await login(identifier, password);
      console.log('Logged in!');

      const token = await AsyncStorage.getItem('token');
      console.log('TOKEN:', token);

      router.replace('/leagues');

    } catch (err) {
      console.error('Login error:', err);
    }
  };

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
        placeholder="Username or Email"
        placeholderTextColor="#a19f9f"
        value={identifier}
        onChangeText={onChangeIdentifier}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#a19f9f"
        secureTextEntry={true}
        value={password}
        onChangeText={onChangePassword}
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

export default Login;
