import { useEffect } from 'react';
import { View, Image, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { AppColors } from '@/constants/theme';

export default function SplashScreen() {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.replace('/(auth)/loading');
        }, 2000);
        return () => clearTimeout(timer);
    }, [router]);

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: AppColors.primary,
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <StatusBar barStyle="light-content" backgroundColor={AppColors.primary} />
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
    );
}
