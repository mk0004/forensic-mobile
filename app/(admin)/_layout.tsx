import { Stack } from 'expo-router';

export default function AdminLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="doctors-management" />
            <Stack.Screen name="doctor-profile" />
            <Stack.Screen name="case-audit" />
            <Stack.Screen name="community" />
            <Stack.Screen name="chat-management" />
            <Stack.Screen name="system-log" />
            <Stack.Screen name="global-report" />
        </Stack>
    );
}
