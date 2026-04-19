import { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    Pressable,
    FlatList,
    useWindowDimensions,
    StatusBar,
    ImageSourcePropType,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    useAnimatedStyle,
    withTiming,
    withSpring,
    withRepeat,
    Easing,
    FadeIn,
    FadeInUp,
    LinearTransition,
    FadeOut,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { AppColors, Typography, Spacing } from '@/constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const slides: { title: string; description: string; image: ImageSourcePropType }[] = [
    {
        title: 'Explore Forensic Cases',
        description:
            'Dive deep into a vast library of criminal cases, evidence types, and forensic techniques.',
        image: require('@/assets/images/onboarding-1.png'),
    },
    {
        title: 'AI Assistance',
        description:
            'Get instant answers to your forensic questions and receive AI-driven insights with suggested prompts.',
        image: require('@/assets/images/onboarding-2.png'),
    },
    {
        title: 'Secure Your Findings',
        description:
            'Manage your digital evidence and track investigation history with banking-grade security.',
        image: require('@/assets/images/onboarding-3.png'),
    },
];

const RING_SIZE = 88;
const RING_STROKE = 4;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function OnboardingScreen() {
    const router = useRouter();
    const { width, height } = useWindowDimensions();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const imageHeight = height * 0.55;
    const animatedOffset = useSharedValue(
        RING_CIRCUMFERENCE * (1 - 1 / slides.length)
    );

    useEffect(() => {
        const progress = (currentIndex + 1) / slides.length;
        animatedOffset.value = withTiming(
            RING_CIRCUMFERENCE * (1 - progress),
            { duration: 500, easing: Easing.bezier(0.4, 0, 0.2, 1) }
        );
    }, [currentIndex, animatedOffset]);

    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset: animatedOffset.value,
    }));

    // Ring pulse on last step
    const ringScale = useSharedValue(1);
    const ringOpacity = useSharedValue(1);

    useEffect(() => {
        if (currentIndex === slides.length - 1) {
            ringScale.value = withRepeat(
                withTiming(1.12, { duration: 800, easing: Easing.inOut(Easing.ease) }),
                -1, true
            );
            ringOpacity.value = withRepeat(
                withTiming(0.5, { duration: 800, easing: Easing.inOut(Easing.ease) }),
                -1, true
            );
        } else {
            ringScale.value = withTiming(1, { duration: 300 });
            ringOpacity.value = withTiming(1, { duration: 300 });
        }
    }, [currentIndex, ringScale, ringOpacity]);

    const ringPulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: ringScale.value }],
        opacity: ringOpacity.value,
    }));

    const buttonScale = useSharedValue(1);

    const buttonAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buttonScale.value }],
    }));

    const handleNext = () => {
        // Micro-interaction: quick spring bounce on press
        buttonScale.value = withSpring(0.9, { damping: 15, stiffness: 400 }, () => {
            buttonScale.value = withSpring(1, { damping: 12, stiffness: 300 });
        });

        if (currentIndex < slides.length - 1) {
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);
            flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        } else {
            router.replace('/(auth)/get-started');
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: AppColors.black }}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Skip button - over the image with fade-in */}
            <Animated.View
                entering={FadeIn.delay(300).duration(500)}
                style={{ position: 'absolute', top: 54, right: 24, zIndex: 10 }}
            >
                <Pressable
                    onPress={() => router.replace('/(auth)/get-started')}
                    hitSlop={16}
                >
                    <Text style={{ ...Typography.bodyLarge, color: AppColors.white }}>Skip</Text>
                </Pressable>
            </Animated.View>

            <FlatList
                ref={flatListRef}
                data={slides}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
                    setCurrentIndex(idx);
                }}
                keyExtractor={(_, i) => String(i)}
                renderItem={({ item }) => (
                    <View style={{ width, flex: 1 }}>
                        {/* Full-bleed image at top */}
                        <Image
                            source={item.image}
                            style={{
                                width: '100%',
                                height: imageHeight,
                            }}
                            resizeMode="cover"
                        />

                        {/* White bottom card */}
                        <View
                            style={{
                                flex: 1,
                                backgroundColor: AppColors.white,
                                borderTopLeftRadius: 32,
                                borderTopRightRadius: 32,
                                marginTop: -32,
                                paddingHorizontal: Spacing.lg,
                                paddingTop: 36,
                            }}
                        >
                            <Text
                                style={{
                                    ...Typography.h3,
                                    color: AppColors.textPrimary,
                                }}
                            >
                                {item.title}
                            </Text>
                            <Text
                                style={{
                                    ...Typography.bodyLarge,
                                    color: AppColors.border,
                                    lineHeight: 24,
                                    marginTop: 12,
                                }}
                            >
                                {item.description}
                            </Text>
                        </View>
                    </View>
                )}
            />

            {/* Bottom controls - overlaid on the white card, animated entrance */}
            <Animated.View
                entering={FadeInUp.delay(400).duration(600)}
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    paddingBottom: 48,
                    alignItems: 'center',
                    gap: 24,
                    backgroundColor: AppColors.white,
                }}
            >
                {/* Pagination dots with animated width */}
                <View style={{ flexDirection: 'row', gap: 6 }}>
                    {slides.map((_, i) => {
                        const isActive = i === currentIndex;
                        return (
                            <Animated.View
                                key={i}
                                layout={LinearTransition.springify().damping(15).stiffness(200)}
                                style={{
                                    width: isActive ? 32 : 8,
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: isActive ? AppColors.primary : AppColors.border,
                                }}
                            />
                        );
                    })}
                </View>

                {/* Arrow button with animated circular progress ring */}
                <Animated.View style={buttonAnimatedStyle}>
                    <Pressable onPress={handleNext} style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <Animated.View style={[{ position: 'absolute' }, ringPulseStyle]}>
                            <Svg
                                width={RING_SIZE}
                                height={RING_SIZE}
                            >
                                {/* Track (background ring) */}
                                <Circle
                                    cx={RING_SIZE / 2}
                                    cy={RING_SIZE / 2}
                                    r={RING_RADIUS}
                                    stroke={AppColors.border}
                                    strokeWidth={RING_STROKE}
                                    fill="none"
                                    opacity={0.25}
                                />
                                {/* Animated progress arc */}
                                <AnimatedCircle
                                    cx={RING_SIZE / 2}
                                    cy={RING_SIZE / 2}
                                    r={RING_RADIUS}
                                    stroke={AppColors.primary}
                                    strokeWidth={RING_STROKE}
                                    fill="none"
                                    strokeDasharray={`${RING_CIRCUMFERENCE}`}
                                    animatedProps={animatedProps}
                                    strokeLinecap="round"
                                    rotation="-90"
                                    origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
                                />
                            </Svg>
                        </Animated.View>
                        <View
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: 32,
                                backgroundColor: AppColors.primary,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {currentIndex === slides.length - 1 ? (
                                <Animated.View key="check" entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)}>
                                    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                                        <Path
                                            d="M20 6L9 17l-5-5"
                                            stroke={AppColors.white}
                                            strokeWidth={2.5}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </Svg>
                                </Animated.View>
                            ) : (
                                <Animated.View key="arrow" entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)}>
                                    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                                        <Path
                                            d="M5 12h14M12 5l7 7-7 7"
                                            stroke={AppColors.white}
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </Svg>
                                </Animated.View>
                            )}
                        </View>
                    </Pressable>
                </Animated.View>
            </Animated.View>
        </View>
    );
}
