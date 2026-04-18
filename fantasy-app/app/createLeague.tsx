import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import { createLeague } from '../services/leagues';
import { useRouter } from 'expo-router';

export default function CreateLeague() {
  const [name, setName] = useState('');
  const router = useRouter();

  const handleCreate = async () => {
    try {
      await createLeague(name);
      router.replace('/leagues');
    } catch (err: any) {
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="League Name"
        value={name}
        onChangeText={setName}
      />
      <Button title="Create League" onPress={handleCreate} />
    </View>
  );
}