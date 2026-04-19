import { View, Text, Pressable } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { AppColors, Typography } from '@/constants/theme';

interface CaseCardProps {
    title: string;
    description: string;
    caseId: string;
    date: string;
    completed?: boolean;
    daysAgo?: number;
    onPress?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

function CalendarSmallIcon() {
    return (
        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Path
                d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18"
                stroke="#9CA3AF"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

function EditIcon() {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path
                d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                stroke={AppColors.primary}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

function TrashIcon() {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path
                d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"
                stroke={AppColors.error}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

function CheckCircleIcon() {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path
                d="M22 11.08V12a10 10 0 11-5.93-9.14"
                stroke={AppColors.success}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M22 4L12 14.01l-3-3"
                stroke={AppColors.success}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

export function CaseCard({
    title,
    description,
    caseId,
    date,
    completed = false,
    daysAgo,
    onPress,
    onEdit,
    onDelete,
}: CaseCardProps) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => ({
                backgroundColor: pressed ? '#F8FAFC' : AppColors.white,
                borderRadius: 14,
                borderCurve: 'continuous',
                borderWidth: 1,
                borderColor: '#E5E7EB',
                padding: 16,
                gap: 8,
            })}
        >
            {/* Title row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                    {completed && <CheckCircleIcon />}
                    <Text
                        style={{
                            ...Typography.bodySmall,
                            fontFamily: 'IBMPlexSans_600SemiBold',
                            color: AppColors.textPrimary,
                            flex: 1,
                        }}
                        numberOfLines={1}
                    >
                        {title}
                    </Text>
                </View>
                {completed && daysAgo !== undefined && (
                    <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>
                        {daysAgo} days
                    </Text>
                )}
            </View>

            {/* Description */}
            <Text style={{ ...Typography.caption, color: '#6B7280' }} numberOfLines={1}>
                {description}
            </Text>

            {/* Case ID */}
            <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.primary }}>
                {caseId}
            </Text>

            {/* Date + Actions row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <CalendarSmallIcon />
                    <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>
                        {date}
                    </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <Pressable onPress={onEdit} hitSlop={8}>
                        <EditIcon />
                    </Pressable>
                    <Pressable onPress={onDelete} hitSlop={8}>
                        <TrashIcon />
                    </Pressable>
                </View>
            </View>
        </Pressable>
    );
}
