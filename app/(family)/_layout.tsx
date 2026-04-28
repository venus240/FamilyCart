import { Stack } from 'expo-router';

export default function FamilyLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#ffffff' },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="setup" />
      <Stack.Screen name="create" />
    </Stack>
  );
}
