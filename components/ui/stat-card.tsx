import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { Typography } from '@/constants/theme';

interface StatCardProps {
    title: string;
    value: number | string;
    variant: 'blue' | 'green' | 'teal' | 'red' | 'red';
    fullWidth?: boolean;
    onPress?: () => void;
}

function DoctorIcon() {
    return (
        <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
            <Path
                d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

function GroupIcon() {
    return (
        <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
            <Path
                d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

function ClipboardIcon() {
    return (
        <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
            <Path
                d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2M9 2h6a1 1 0 011 1v2a1 1 0 01-1 1H9a1 1 0 01-1-1V3a1 1 0 011-1zM9 14l2 2 4-4"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

const gradients: Record<string, [string, string]> = {
    blue: ['#4A3AFF', '#1E2A5E'],
    green: ['#16A34A', '#065F46'],
    teal: ['#0D9488', '#065F46'],
    red: ['#EF4444', '#991B1B'],
    red: ['#EF4444', '#991B1B'],
};

const iconMap: Record<string, () => React.JSX.Element> = {
    blue: DoctorIcon,
    green: GroupIcon,
    red: GroupIcon,
    teal: ClipboardIcon,
    red: GroupIcon,
};

export function StatCard({ title, value, variant, fullWidth = false, onPress }: StatCardProps) {
    const Icon = iconMap[variant];

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => ({
                flex: fullWidth ? undefined : 1,
                width: fullWidth ? '100%' : undefined,
                opacity: pressed && onPress ? 0.9 : 1,
            })}
        >
            <LinearGradient
                colors={gradients[variant]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                    borderRadius: 16,
                    borderCurve: 'continuous' as const,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    minHeight: fullWidth ? 80 : 90,
                }}
            >
                {!fullWidth && (
                    <View style={{ opacity: 0.6 }}>
                        <Icon />
                    </View>
                )}
                {fullWidth && (
                    <View style={{ opacity: 0.6 }}>
                        <Icon />
                    </View>
                )}
                <View style={{ alignItems: fullWidth ? 'flex-end' : 'flex-end' }}>
                    <Text
                        style={{
                            ...Typography.caption,
                            color: 'rgba(255,255,255,0.8)',
                            marginBottom: 2,
                        }}
                    >
                        {title}
                    </Text>
                    <Text
                        style={{
                            fontSize: fullWidth ? 36 : 28,
                            fontFamily: 'IBMPlexSans_700Bold',
                            color: '#FFFFFF',
                            fontVariant: ['tabular-nums'],
                        }}
                    >
                        {value}
                    </Text>
                </View>
            </LinearGradient>
        </Pressable>
    );
}
