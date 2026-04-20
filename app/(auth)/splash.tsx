import { useEffect } from 'react';
import { View, Image, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    Easing,
    runOnJS,
} from 'react-native-reanimated';
import { AppColors } from '@/constants/theme';

export default function SplashScreen() {
    const router = useRouter();

    const logoScale = useSharedValue(0.5);
    const logoOpacity = useSharedValue(0);
    const screenOpacity = useSharedValue(1);

    const navigateAway = () => {
        router.replace('/(auth)/loading');
    };

    useEffect(() => {
        // Fast logo pop-in
        logoOpacity.value = withTiming(1, { duration: 350 });
        logoScale.value = withSpring(1, { damping: 14, stiffness: 180 });

        // Quick exit after 0.8s
        const exitTimer = setTimeout(() => {
            screenOpacity.value = withTiming(0, { duration: 200, easing: Easing.in(Easing.cubic) }, () => {
                runOnJS(navigateAway)();
            });
        }, 800);

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
        <Animated.View
            style={[{
                flex: 1,
                backgroundColor: AppColors.primary,
                alignItems: 'center',
                justifyContent: 'center',
            }, screenStyle]}
        >
            <StatusBar barStyle="light-content" backgroundColor={AppColors.primary} />
            <Animated.View style={logoStyle}>
                <Image
                    source={require('@/assets/images/forensic-logo.png')}
                    style={{ width: 180, height: 180, borderRadius: 90 }}
                    resizeMode="cover"
                />
            </Animated.View>
        </Animated.View>
    );
}
