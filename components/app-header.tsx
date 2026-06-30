import { View, Text, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { AppColors, Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { useSettingQuery } from '@/lib/hooks/use-auth-api';
import { resolveImageUrl } from '@/constants/railway-api';
import { User, SettingResponse } from '@/types/api';

function getInitials(name?: string): string {
    if (!name) {
        return 'U';
    }
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
        return 'U';
    }
    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function resolveSettingUser(raw: User | SettingResponse | undefined): User | null {
    if (!raw) {
        return null;
    }
    const wrapped = raw as SettingResponse;
    if (wrapped.data && typeof wrapped.data === 'object') {
        return wrapped.data;
    }
    if (wrapped.user && typeof wrapped.user === 'object') {
        return wrapped.user;
    }
    return raw as User;
}

function BellIcon() {
    return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke={AppColors.textPrimary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

type Props = {
    onBellPress?: () => void;
    unreadCount?: number;
};

export function AppHeader({ onBellPress, unreadCount = 0 }: Props) {
    const router = useRouter();
    const { user: authUser } = useAuth();
    const settingQuery = useSettingQuery();
    const currentUser = resolveSettingUser(settingQuery.data) ?? authUser;
    const avatarImage = resolveImageUrl(currentUser?.image);
    const avatarInitials = getInitials(currentUser?.name);

    return (
        <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: Spacing.md,
            paddingVertical: 12,
            backgroundColor: AppColors.white,
        }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Image
                    source={require('@/assets/images/forensic-logo.png')}
                    style={{ width: 40, height: 40, borderRadius: 20 }}
                    resizeMode="contain"
                />
                <Text style={{ fontSize: 18, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>
                    Forensic
                </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Pressable onPress={onBellPress} hitSlop={8} style={{ position: 'relative' }}>
                    <BellIcon />
                    {unreadCount > 0 && (
                        <View style={{
                            position: 'absolute',
                            top: -4,
                            right: -4,
                            width: 16,
                            height: 16,
                            borderRadius: 8,
                            backgroundColor: '#EF4444',
                            borderWidth: 1.5,
                            borderColor: AppColors.white,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <Text style={{ fontSize: 9, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.white }}>{unreadCount}</Text>
                        </View>
                    )}
                </Pressable>
                <Pressable
                    onPress={() => router.push('/(doctor)/(tabs)/settings')}
                    hitSlop={8}
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: AppColors.primary + '20',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                    }}
                >
                    {avatarImage ? (
                        <Image
                            source={{ uri: avatarImage }}
                            style={{ width: 36, height: 36, borderRadius: 18 }}
                            resizeMode="cover"
                        />
                    ) : (
                        <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>
                            {avatarInitials}
                        </Text>
                    )}
                </Pressable>
            </View>
        </View>
    );
}
