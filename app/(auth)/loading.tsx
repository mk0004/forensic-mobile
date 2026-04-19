import { useEffect, useState } from 'react';
import { View, Text, Image, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { AppColors, Typography } from '@/constants/theme';

const stages = ['Evidence. ', 'Evidence. Smart.', 'Evidence. Smart. Analysis'];

export default function LoadingScreen() {
    const router = useRouter();
    const [stage, setStage] = useState(0);

    useEffect(() => {
        const timers = [
            setTimeout(() => setStage(1), 1000),
            setTimeout(() => setStage(2), 2000),
            setTimeout(() => router.replace('/(auth)/onboarding'), 3500),
        ];
        return () => timers.forEach(clearTimeout);
    }, [router]);

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: AppColors.primary,
            }}
        >
            <StatusBar barStyle="light-content" backgroundColor={AppColors.primary} />
            <View
                style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Image
                    source={require('@/assets/images/forensic-logo.png')}
                    style={{
                        width: 260,
                        height: 260,
                        borderRadius: 130,
                    }}
                    resizeMode="cover"
                />
            </View>
            <View
                style={{
                    position: 'absolute',
                    bottom: 110,
                    left: 69,
                }}
            >
                <Animated.View entering={FadeIn.duration(500)}>
                    <Text
                        style={{
                            ...Typography.h5,
                            color: AppColors.white,
                            lineHeight: 30,
                        }}
                    >
                        {stages[stage]}
                    </Text>
                </Animated.View>
            </View>
        </View>
    );
}
