import { View, Text, Image, Pressable, StatusBar, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { AppColors } from '@/constants/theme';

export default function GetStartedScreen() {
    const router = useRouter();
    const { height } = useWindowDimensions();

    return (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Background image */}
            <Image
                source={require('@/assets/images/get-started-bg.png')}
                style={{ width: '100%', height: '100%', position: 'absolute' }}
                resizeMode="cover"
            />

            {/* Gradient overlay */}
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.8)', '#000']}
                locations={[0, 0.35, 0.65, 1]}
                style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: height * 0.65 }}
            />

            {/* Bottom content */}
            <View style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                paddingHorizontal: 28,
                paddingBottom: 50,
                gap: 32,
            }}>
                {/* Badge + title + subtitle */}
                <View style={{ gap: 14 }}>
                    <Animated.View entering={FadeIn.delay(100).duration(400)}>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 8,
                            alignSelf: 'flex-start',
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            borderRadius: 20,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                        }}>
                            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                                <Path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill={AppColors.white} fillOpacity={0.8} />
                            </Svg>
                            <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_500Medium', color: 'rgba(255,255,255,0.8)' }}>
                                Trusted by forensic experts
                            </Text>
                        </View>
                    </Animated.View>

                    <Animated.Text
                        entering={FadeInUp.delay(200).duration(400)}
                        style={{
                            fontSize: 34,
                            fontFamily: 'IBMPlexSans_700Bold',
                            color: AppColors.white,
                            lineHeight: 40,
                        }}
                    >
                        Your Investigation{'\n'}Starts Here
                    </Animated.Text>

                    <Animated.Text
                        entering={FadeInUp.delay(300).duration(400)}
                        style={{
                            fontSize: 15,
                            fontFamily: 'IBMPlexSans_400Regular',
                            color: 'rgba(255,255,255,0.55)',
                            lineHeight: 22,
                        }}
                    >
                        Join the elite network of forensic experts and unlock the full power of AI analysis.
                    </Animated.Text>
                </View>

                {/* Auth buttons */}
                <Animated.View
                    entering={FadeInUp.delay(400).duration(400)}
                    style={{ gap: 12 }}
                >
                    <Pressable
                        onPress={() => router.push('/(auth)/sign-up')}
                        style={({ pressed }) => ({
                            borderRadius: 14,
                            backgroundColor: pressed ? AppColors.primaryHover : AppColors.primary,
                            height: 52,
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: pressed ? 0.9 : 1,
                        })}
                    >
                        <Text style={{ fontSize: 15, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.white }}>
                            Create Account
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={() => router.push('/(auth)/login')}
                        style={({ pressed }) => ({
                            borderRadius: 14,
                            borderWidth: 1.5,
                            borderColor: 'rgba(255,255,255,0.25)',
                            backgroundColor: 'transparent',
                            height: 52,
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: pressed ? 0.7 : 1,
                        })}
                    >
                        <Text style={{ fontSize: 15, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.white }}>
                            Already have an account
                        </Text>
                    </Pressable>
                </Animated.View>
            </View>
        </View>
    );
}
