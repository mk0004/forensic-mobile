import { View, Text, Image, Pressable } from 'react-native';
import { AppColors, Typography } from '@/constants/theme';

interface DoctorCardProps {
    name: string;
    email: string;
    caseCount: number;
    lastActive?: string;
    blocked: boolean;
    avatarUrl?: any;
    onToggleBlock?: () => void;
}

export function DoctorCard({
    name,
    email,
    caseCount,
    lastActive,
    blocked,
    avatarUrl,
    onToggleBlock,
}: DoctorCardProps) {
    const initials = name
        .replace(/^(Dr\.|Prof\.)?\s*/i, '')
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return (
        <View
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: AppColors.white,
                borderRadius: 16,
                borderCurve: 'continuous',
                padding: 14,
                gap: 12,
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
            }}
        >
            {/* Avatar */}
            {avatarUrl ? (
                <Image
                    source={avatarUrl}
                    style={{
                        width: 52,
                        height: 52,
                        borderRadius: 26,
                        borderWidth: 2,
                        borderColor: '#E5E7EB',
                    }}
                />
            ) : (
                <View
                    style={{
                        width: 52,
                        height: 52,
                        borderRadius: 26,
                        backgroundColor: AppColors.primary + '15',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 2,
                        borderColor: '#E5E7EB',
                    }}
                >
                    <Text style={{ fontSize: 16, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>
                        {initials}
                    </Text>
                </View>
            )}

            {/* Info */}
            <View style={{ flex: 1, gap: 4 }}>
                {/* Name + online dot */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ ...Typography.bodySmall, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                        {name}
                    </Text>
                    {!blocked && (
                        <View
                            style={{
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: AppColors.success,
                            }}
                        />
                    )}
                </View>

                {/* Email */}
                <Text style={{ ...Typography.caption, color: AppColors.border }} numberOfLines={1}>
                    {email}
                </Text>

                {/* Badges */}
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 2 }}>
                    <View
                        style={{
                            backgroundColor: '#F3F4F6',
                            borderRadius: 8,
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                        }}
                    >
                        <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_500Medium', color: '#6B7280' }}>
                            {caseCount} Case
                        </Text>
                    </View>
                    {lastActive && (
                        <View
                            style={{
                                backgroundColor: '#F3F4F6',
                                borderRadius: 8,
                                paddingHorizontal: 8,
                                paddingVertical: 3,
                            }}
                        >
                            <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_500Medium', color: '#6B7280' }}>
                                {lastActive}
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Block/Unblock action */}
            <Pressable onPress={onToggleBlock} hitSlop={12}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <View
                        style={{
                            width: 14,
                            height: 14,
                            borderRadius: 7,
                            borderWidth: 1.5,
                            borderColor: blocked ? AppColors.success : AppColors.error,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <View
                            style={{
                                width: 6,
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: blocked ? AppColors.success : AppColors.error,
                            }}
                        />
                    </View>
                    <Text
                        style={{
                            fontSize: 13,
                            fontFamily: 'IBMPlexSans_500Medium',
                            color: blocked ? AppColors.success : AppColors.error,
                        }}
                    >
                        {blocked ? 'Unblock' : 'Block'}
                    </Text>
                </View>
            </Pressable>
        </View>
    );
}
