import { Stack } from 'expo-router';

export default function AuthLayout() {
    return (
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
            <Stack.Screen name="splash" />
            <Stack.Screen name="loading" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="get-started" />
            <Stack.Screen name="login" />
            <Stack.Screen name="sign-up" />
            <Stack.Screen name="reset-password" />
            <Stack.Screen name="check-email" />
            <Stack.Screen name="new-password" />
        </Stack>
    );
}
