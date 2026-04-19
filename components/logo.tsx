import { View, Text } from 'react-native';
import { AppColors, Typography } from '@/constants/theme';

interface LogoProps {
    size?: 'small' | 'medium' | 'large';
    color?: string;
}

export function Logo({ size = 'medium', color = AppColors.primary }: LogoProps) {
    const dimensions = {
        small: { width: 60, height: 60, fontSize: 14, iconSize: 28 },
        medium: { width: 100, height: 100, fontSize: 20, iconSize: 48 },
        large: { width: 140, height: 140, fontSize: 28, iconSize: 64 },
    }[size];

    return (
        <View
            style={{
                width: dimensions.width,
                height: dimensions.height,
                borderRadius: 20,
                borderCurve: 'continuous',
                backgroundColor: color,
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Text
                style={{
                    color: AppColors.white,
                    fontSize: dimensions.iconSize,
                    fontFamily: Typography.h1.fontFamily,
                }}
            >
                F
            </Text>
        </View>
    );
}
