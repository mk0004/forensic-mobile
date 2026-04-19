import { Stack } from 'expo-router';

export default function DoctorLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                animationDuration: 250,
                gestureEnabled: true,
                gestureDirection: 'horizontal',
            }}
        >
            <Stack.Screen name="(tabs)" options={{ animation: 'none' }} />
            <Stack.Screen name="active-cases" />
            <Stack.Screen name="completed-cases" />
            <Stack.Screen name="add-case" />
            <Stack.Screen name="upload-evidence" />
            <Stack.Screen name="evidence-items" />
            <Stack.Screen name="ai-chat" />
            <Stack.Screen name="create-article" />
            <Stack.Screen name="case-details" />
            <Stack.Screen name="analysis-models" />
            <Stack.Screen name="investigative-cases" />
            <Stack.Screen name="model-upload" />
            <Stack.Screen name="results-deepfake" />
            <Stack.Screen name="results-face-recognition" />
            <Stack.Screen name="results-dna" />
            <Stack.Screen name="results-reconstruct" />
        </Stack>
    );
}
