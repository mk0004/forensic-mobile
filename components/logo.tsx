import { View, Image } from 'react-native';

interface LogoProps {
    size?: 'small' | 'medium' | 'large';
}

export function Logo({ size = 'medium' }: LogoProps) {
    const dimensions = {
        small: { width: 60, height: 60, borderRadius: 12 },
        medium: { width: 100, height: 100, borderRadius: 20 },
        large: { width: 140, height: 140, borderRadius: 28 },
    }[size];

    return (
        <View
            style={{
                width: dimensions.width,
                height: dimensions.height,
                borderRadius: dimensions.borderRadius,
                overflow: 'hidden',
            }}
        >
            <Image
                source={require('@/assets/images/forensic-logo.png')}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
            />
        </View>
    );
}
