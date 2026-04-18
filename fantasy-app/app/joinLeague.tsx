import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import { joinLeague } from '../services/leagues';
import { useRouter } from 'expo-router';

export default function JoinLeague() {
  const [name, setName] = useState('');
  const [leagueName, setLeagueName] = useState('');
  const router = useRouter();

  const handleJoin = async () => {
    try {
      await joinLeague(name, leagueName);
      router.replace('/leagues');
    } catch (err: any) {
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Team Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        placeholder="League Name"
        value={leagueName}
        onChangeText={setLeagueName}
      />
      <Button title="Join League" onPress={handleJoin} />
    </View>
  );
}