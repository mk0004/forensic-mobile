import { useState, useRef } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    FadeIn,
    FadeInUp,
    LinearTransition,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { AppColors } from '@/constants/theme';

const slides: { title: string; description: string; image: ImageSourcePropType }[] = [
    {
        title: 'Explore Forensic\nCases',
        description: 'Dive into a library of criminal cases, evidence types, and forensic techniques.',
        image: require('@/assets/images/onboarding-1.png'),
    },
    {
        title: 'AI-Powered\nInsights',
        description: 'Get instant answers and AI-driven analysis to speed up your investigations.',
        image: require('@/assets/images/onboarding-2.png'),
    },
    {
        title: 'Secure Your\nFindings',
        description: 'Manage digital evidence and track history with banking-grade security.',
        image: require('@/assets/images/onboarding-3.png'),
    },
];

export default function OnboardingScreen() {
    const router = useRouter();
    const { width, height } = useWindowDimensions();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const isLast = currentIndex === slides.length - 1;

    const buttonScale = useSharedValue(1);
    const buttonAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buttonScale.value }],
    }));

    const handleNext = () => {
        buttonScale.value = withSpring(0.92, { damping: 15, stiffness: 400 }, () => {
            buttonScale.value = withSpring(1, { damping: 12, stiffness: 300 });
        });

        if (!isLast) {
            const next = currentIndex + 1;
            setCurrentIndex(next);
            flatListRef.current?.scrollToIndex({ index: next, animated: true });
        } else {
            router.replace('/(auth)/get-started');
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <FlatList
                ref={flatListRef}
                data={slides}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                    setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width));
                }}
                keyExtractor={(_, i) => String(i)}
                renderItem={({ item }) => (
                    <View style={{ width, height }}>
                        <Image
                            source={item.image}
                            style={{ width: '100%', height: '100%', position: 'absolute' }}
                            resizeMode="cover"
                        />
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.85)', '#000']}
                            locations={[0, 0.45, 0.7, 1]}
                            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: height * 0.55 }}
                        />
                    </View>
                )}
            />

            {/* Skip */}
            <Animated.View
                entering={FadeIn.duration(300)}
                style={{ position: 'absolute', top: 52, right: 24, zIndex: 10 }}
            >
                <Pressable
                    onPress={() => router.replace('/(auth)/get-started')}
                    hitSlop={16}
                    style={({ pressed }) => ({
                        paddingHorizontal: 14,
                        paddingVertical: 6,
                        borderRadius: 20,
                        backgroundColor: pressed ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                    })}
                >
                    <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_500Medium', color: 'rgba(255,255,255,0.8)' }}>
                        Skip
                    </Text>
                </Pressable>
            </Animated.View>

            {/* Bottom content overlay */}
            <View style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                paddingHorizontal: 28,
                paddingBottom: 50,
                gap: 28,
            }}>
                <View style={{ gap: 10 }}>
                    <Animated.Text
                        entering={FadeInUp.duration(300)}
                        key={`title-${currentIndex}`}
                        style={{
                            fontSize: 32,
                            fontFamily: 'IBMPlexSans_700Bold',
                            color: AppColors.white,
                            lineHeight: 38,
                        }}
                    >
                        {slides[currentIndex].title}
                    </Animated.Text>
                    <Animated.Text
                        entering={FadeInUp.delay(80).duration(300)}
                        key={`desc-${currentIndex}`}
                        style={{
                            fontSize: 15,
                            fontFamily: 'IBMPlexSans_400Regular',
                            color: 'rgba(255,255,255,0.6)',
                            lineHeight: 22,
                        }}
                    >
                        {slides[currentIndex].description}
                    </Animated.Text>
                </View>

                {/* Dots + button row */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                        {slides.map((_, i) => {
                            const isActive = i === currentIndex;
                            return (
                                <Animated.View
                                    key={i}
                                    layout={LinearTransition.springify().damping(15).stiffness(200)}
                                    style={{
                                        width: isActive ? 24 : 6,
                                        height: 6,
                                        borderRadius: 3,
                                        backgroundColor: isActive ? AppColors.white : 'rgba(255,255,255,0.3)',
                                    }}
                                />
                            );
                        })}
                    </View>

                    <Animated.View style={buttonAnimatedStyle}>
                        <Pressable
                            onPress={handleNext}
                            style={({ pressed }) => ({
                                backgroundColor: pressed ? AppColors.primaryHover : AppColors.primary,
                                borderRadius: isLast ? 14 : 28,
                                height: 52,
                                paddingHorizontal: isLast ? 28 : 0,
                                width: isLast ? undefined : 52,
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'row',
                                gap: 6,
                            })}
                        >
                            {isLast ? (
                                <Text style={{ fontSize: 15, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.white }}>
                                    Get Started
                                </Text>
                            ) : (
                                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                                    <Path d="M5 12h14M12 5l7 7-7 7" stroke={AppColors.white} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                </Svg>
                            )}
                        </Pressable>
                    </Animated.View>
                </View>
            </View>
        </View>
    );
}
