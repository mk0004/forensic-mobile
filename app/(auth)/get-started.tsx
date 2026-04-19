import { View, Text, ImageBackground, Pressable, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { AppColors, Typography, Spacing } from '@/constants/theme';

export default function GetStartedScreen() {
    const router = useRouter();

    return (
        <ImageBackground
            source={require('@/assets/images/get-started-bg.png')}
            style={{ flex: 1 }}
            resizeMode="cover"
        >
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <View
                style={{
                    flex: 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.55)',
                    justifyContent: 'space-between',
                }}
            >
                {/* Top: "Get Started" title */}
                <Animated.View
                    entering={FadeInDown.delay(200).duration(600)}
                    style={{
                        paddingTop: 120,
                        alignItems: 'center',
                    }}
                >
                    <Text
                        style={{
                            ...Typography.h4,
                            color: AppColors.white,
                            opacity: 0.85,
                        }}
                    >
                        Get Started
                    </Text>
                </Animated.View>

                {/* Center: Main title + subtitle (animated in) */}
                <View
                    style={{
                        paddingHorizontal: Spacing.lg,
                        alignItems: 'center',
                        gap: 12,
                    }}
                >
                    <Animated.View entering={FadeInUp.delay(800).duration(700)}>
                        <Text
                            style={{
                                ...Typography.h2,
                                color: AppColors.white,
                                textAlign: 'center',
                                lineHeight: 42,
                            }}
                        >
                            Your Investigation{'\n'}Starts Here
                        </Text>
                    </Animated.View>
                    <Animated.View entering={FadeInUp.delay(1200).duration(700)}>
                        <Text
                            style={{
                                ...Typography.bodyLarge,
                                color: AppColors.white,
                                opacity: 0.7,
                                textAlign: 'center',
                                lineHeight: 24,
                            }}
                        >
                            Join the elite network of forensic experts and{'\n'}unlock the full power of AI analysis.
                        </Text>
                    </Animated.View>
                </View>

                {/* Bottom: Buttons (animated in) */}
                <Animated.View
                    entering={FadeInDown.delay(400).duration(600)}
                    style={{
                        paddingHorizontal: Spacing.lg,
                        paddingBottom: 60,
                        flexDirection: 'row',
                        gap: 16,
                    }}
                >
                    <View style={{ flex: 1 }}>
                        <Pressable
                            onPress={() => router.push('/(auth)/sign-up')}
                            style={({ pressed }) => ({
                                borderRadius: 12,
                                borderCurve: 'continuous',
                                borderWidth: 1.5,
                                borderColor: AppColors.white,
                                backgroundColor: 'transparent',
                                height: 48,
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: pressed ? 0.8 : 1,
                            })}
                        >
                            <Text style={{ ...Typography.button, color: AppColors.white }}>
                                Sign up
                            </Text>
                        </Pressable>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Pressable
                            onPress={() => router.push('/(auth)/login')}
                            style={({ pressed }) => ({
                                borderRadius: 12,
                                borderCurve: 'continuous',
                                backgroundColor: pressed ? AppColors.primaryHover : AppColors.primary,
                                height: 48,
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: pressed ? 0.9 : 1,
                            })}
                        >
                            <Text style={{ ...Typography.button, color: AppColors.white }}>
                                Login
                            </Text>
                        </Pressable>
                    </View>
                </Animated.View>
            </View>
        </ImageBackground>
    );
}
