import { useEffect, useState } from 'react';
import { View, Text, Image, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    withDelay,
    withSequence,
    Easing,
    runOnJS,
} from 'react-native-reanimated';
import { AppColors } from '@/constants/theme';

const WORDS = ['Evidence.', 'Smart.', 'Analysis.'];
const DOT_COUNT = 3;

function AnimatedDot({ index }: { index: number }) {
    const opacity = useSharedValue(0.25);

    useEffect(() => {
        opacity.value = withDelay(
            index * 300,
            withSequence(
                withTiming(1, { duration: 300 }),
                withTiming(0.25, { duration: 300 }),
            ),
        );

        // Loop
        const interval = setInterval(() => {
            opacity.value = withDelay(
                index * 300,
                withSequence(
                    withTiming(1, { duration: 300 }),
                    withTiming(0.25, { duration: 300 }),
                ),
            );
        }, DOT_COUNT * 300 + 200);

        return () => clearInterval(interval);
    }, []);

    const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

    return (
        <Animated.View style={[{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: 'rgba(255,255,255,0.8)',
        }, style]} />
    );
}

function AnimatedWord({ word, delay }: { word: string; delay: number }) {
    const translateX = useSharedValue(12);
    const opacity = useSharedValue(0);

    useEffect(() => {
        translateX.value = withDelay(delay, withSpring(0, { damping: 16, stiffness: 140 }));
        opacity.value = withDelay(delay, withTiming(1, { duration: 280 }));
    }, []);

    const style = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateX: translateX.value }],
    }));

    return (
        <Animated.Text style={[{
            fontSize: 18,
            fontFamily: 'IBMPlexSans_600SemiBold',
            color: AppColors.white,
        }, style]}>
            {word}
        </Animated.Text>
    );
}

export default function LoadingScreen() {
    const router = useRouter();

    const logoOpacity = useSharedValue(0);
    const logoScale = useSharedValue(0.9);
    const screenOpacity = useSharedValue(1);

    const navigateAway = () => {
        router.replace('/(auth)/onboarding');
    };

    useEffect(() => {
        logoOpacity.value = withTiming(1, { duration: 300 });
        logoScale.value = withSpring(1, { damping: 16, stiffness: 160 });

        // Exit faster: 2.5s total
        const exitTimer = setTimeout(() => {
            screenOpacity.value = withTiming(0, { duration: 300, easing: Easing.in(Easing.cubic) }, () => {
                runOnJS(navigateAway)();
            });
        }, 2500);

        return () => clearTimeout(exitTimer);
    }, []);

    const logoStyle = useAnimatedStyle(() => ({
        opacity: logoOpacity.value,
        transform: [{ scale: logoScale.value }],
    }));

    const screenStyle = useAnimatedStyle(() => ({
        opacity: screenOpacity.value,
    }));

    return (
        <Animated.View style={[{ flex: 1, backgroundColor: AppColors.primary }, screenStyle]}>
            <StatusBar barStyle="light-content" backgroundColor={AppColors.primary} />

            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Animated.View style={logoStyle}>
                    <Image
                        source={require('@/assets/images/forensic-logo.png')}
                        style={{ width: 160, height: 160, borderRadius: 80 }}
                        resizeMode="cover"
                    />
                </Animated.View>
            </View>

            {/* Bottom: words slide in + animated dots */}
            <View style={{ position: 'absolute', bottom: 90, left: 0, right: 0, alignItems: 'center', gap: 16 }}>
                <View style={{ flexDirection: 'row', gap: 5 }}>
                    {WORDS.map((word, i) => (
                        <AnimatedWord key={word} word={word} delay={100 + i * 300} />
                    ))}
                </View>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                    {Array.from({ length: DOT_COUNT }).map((_, i) => (
                        <AnimatedDot key={i} index={i} />
                    ))}
                </View>
            </View>
        </Animated.View>
    );
}
