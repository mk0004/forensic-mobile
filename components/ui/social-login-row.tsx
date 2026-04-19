import { View, Pressable, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { AppColors, Typography } from '@/constants/theme';

function FacebookIcon() {
    return (
        <Svg width={30} height={30} viewBox="0 0 30 30" fill="none">
            <Path
                d="M15 0C6.72 0 0 6.72 0 15C0 22.49 5.47 28.73 12.62 29.81V19.34H8.84V15H12.62V11.7C12.62 7.96 14.86 5.9 18.26 5.9C19.88 5.9 21.58 6.19 21.58 6.19V9.87H19.71C17.88 9.87 17.38 11.0 17.38 12.17V15H21.41L20.83 19.34H17.38V29.81C24.53 28.73 30 22.49 30 15C30 6.72 23.28 0 15 0Z"
                fill="#1877F2"
            />
        </Svg>
    );
}

function GoogleIcon() {
    return (
        <Svg width={30} height={30} viewBox="0 0 30 30" fill="none">
            <Path
                d="M27.26 12.55H15.3V17.75H22.18C21.81 19.65 20.68 21.25 19.0 22.28L23.4 25.7C25.97 23.33 27.5 19.78 27.5 15.48C27.5 14.43 27.41 13.43 27.26 12.55Z"
                fill="#4285F4"
            />
            <Path
                d="M15.3 30C19.11 30 22.3 28.74 23.4 25.7L19.0 22.28C17.76 23.13 16.2 23.63 15.3 23.63C11.56 23.63 8.39 21.23 7.3 18.0L2.77 21.5C5.07 26.08 9.83 30 15.3 30Z"
                fill="#34A853"
            />
            <Path
                d="M7.3 18.0C6.87 16.73 6.63 15.38 6.63 14.0C6.63 12.62 6.87 11.27 7.3 10.0L2.77 6.5C1.37 9.3 0.5 12.53 0.5 15.0C0.5 17.48 1.37 20.7 2.77 21.5L7.3 18.0Z"
                fill="#FBBC05"
            />
            <Path
                d="M15.3 6.38C17.4 6.38 19.3 7.14 20.76 8.6L23.48 5.88C22.3 1.26 19.11 0 15.3 0C9.83 0 5.07 2.93 2.77 6.5L7.3 10.0C8.39 6.77 11.56 6.38 15.3 6.38Z"
                fill="#EA4335"
            />
        </Svg>
    );
}

function AppleIcon() {
    return (
        <Svg width={30} height={30} viewBox="0 0 30 30" fill="none">
            <Path
                d="M22.5 25.3C21.2 26.6 19.8 26.4 18.4 25.8C16.9 25.2 15.6 25.2 14.0 25.8C12.0 26.6 11.0 26.4 9.8 25.3C3.5 18.8 4.4 8.7 11.6 8.3C13.5 8.4 14.8 9.3 15.9 9.4C17.5 9.1 19.0 8.1 20.8 8.2C23.0 8.4 24.6 9.3 25.6 10.9C21.4 13.4 22.3 18.8 26.2 20.4C25.3 22.6 24.2 24.7 22.5 25.3ZM15.7 8.2C15.5 5.5 17.6 3.3 20.1 3.0C20.5 6.1 17.3 8.5 15.7 8.2Z"
                fill={AppColors.black}
            />
        </Svg>
    );
}

interface SocialLoginRowProps {
    onFacebook: () => void;
    onGoogle: () => void;
    onApple: () => void;
}

export function SocialLoginRow({ onFacebook, onGoogle, onApple }: SocialLoginRowProps) {
    return (
        <View style={{ gap: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: AppColors.border }} />
                <Text style={{ ...Typography.caption, color: AppColors.border }}>or open with</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: AppColors.border }} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12 }}>
                {[
                    { icon: <FacebookIcon />, onPress: onFacebook },
                    { icon: <GoogleIcon />, onPress: onGoogle },
                    { icon: <AppleIcon />, onPress: onApple },
                ].map((item, idx) => (
                    <Pressable
                        key={idx}
                        onPress={item.onPress}
                        style={{
                            flex: 1,
                            height: 60,
                            borderRadius: 14,
                            borderCurve: 'continuous',
                            borderWidth: 1,
                            borderColor: AppColors.border,
                            backgroundColor: '#F8F8FA',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {item.icon}
                    </Pressable>
                ))}
            </View>
        </View>
    );
}
