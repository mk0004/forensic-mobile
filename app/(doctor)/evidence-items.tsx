import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';
import { AppColors, Typography, Spacing } from '@/constants/theme';

function BackIcon() {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path
                d="M19 12H5M12 19l-7-7 7-7"
                stroke={AppColors.textPrimary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

function EvidenceIcon({ type }: { type: string }) {
    if (type === 'image') {
        return (
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Rect x={3} y={3} width={18} height={18} rx={2} stroke={AppColors.primary} strokeWidth={1.5} />
                <Path d="M3 16l5-5 4 4 3-3 6 6" stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M14.5 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" fill={AppColors.primary} />
            </Svg>
        );
    }
    if (type === 'video') {
        return (
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Path d="M23 7l-7 5 7 5V7z" stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                <Rect x={1} y={5} width={15} height={14} rx={2} stroke={AppColors.primary} strokeWidth={1.5} />
            </Svg>
        );
    }
    if (type === 'dna') {
        return (
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Path d="M2 15c6.667-6 13.333 0 20-6M2 9c6.667 6 13.333 0 20 6M12 3v18" stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" />
            </Svg>
        );
    }
    // document / default
    return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
                d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
                stroke={AppColors.primary}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path d="M14 2v6h6" stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function EditIcon() {
    return (
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path
                d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                stroke={AppColors.primary}
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                stroke={AppColors.primary}
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

function TrashIcon() {
    return (
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path
                d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
                stroke="#EF4444"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

function CalendarIcon() {
    return (
        <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
            <Rect x={3} y={4} width={18} height={18} rx={2} stroke="#9CA3AF" strokeWidth={1.8} />
            <Path d="M16 2v4M8 2v4M3 10h18" stroke="#9CA3AF" strokeWidth={1.8} strokeLinecap="round" />
        </Svg>
    );
}

interface EvidenceItem {
    id: string;
    title: string;
    type: 'image' | 'video' | 'dna' | 'document';
    typeLabel: string;
    size: string;
    caseId: string;
    date: string;
}

const evidenceItems: EvidenceItem[] = [
    { id: '1', title: 'Crime Scene Photo - Front Door', type: 'image', typeLabel: 'Image', size: '4.2 MB', caseId: 'CS-2024-0891', date: '2024-02-20' },
    { id: '2', title: 'DNA Sample - Blood Stain', type: 'dna', typeLabel: 'DNA Sample', size: '1.2 MB', caseId: 'CS-2024-0891', date: '2024-02-20' },
    { id: '3', title: 'Witness Statement Document', type: 'image', typeLabel: 'Image', size: '4.2 MB', caseId: 'CS-2024-0891', date: '2024-02-20' },
    { id: '4', title: 'CCTV Footage - Bank Entrance', type: 'video', typeLabel: 'Image', size: '4.2 MB', caseId: 'CS-2024-0891', date: '2024-02-20' },
    { id: '5', title: 'Fingerprint Scan - Door Handle', type: 'image', typeLabel: 'Image', size: '4.2 MB', caseId: 'CS-2024-0891', date: '2024-02-20' },
    { id: '6', title: 'Security Camera - Parking Lot', type: 'video', typeLabel: 'Video', size: '12.8 MB', caseId: 'CS-2024-0891', date: '2024-02-19' },
];

export default function EvidenceItems() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <View style={{ flex: 1, backgroundColor: AppColors.surface }}>
            <ScrollView
                contentContainerStyle={{
                    paddingTop: insets.top,
                    paddingBottom: insets.bottom + 40,
                }}
            >
                {/* Header */}
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: Spacing.md,
                        paddingVertical: 14,
                        backgroundColor: AppColors.white,
                        gap: 12,
                    }}
                >
                    <Pressable onPress={() => router.back()} hitSlop={8}>
                        <BackIcon />
                    </Pressable>
                    <Text style={{ ...Typography.h5, color: AppColors.textPrimary, flex: 1 }}>
                        Evidence Items
                    </Text>
                    <Text style={{ fontSize: 16, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                        {evidenceItems.length}
                    </Text>
                </View>

                {/* Evidence list */}
                <View style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.md, gap: 12 }}>
                    {evidenceItems.map((item) => (
                        <View
                            key={item.id}
                            style={{
                                backgroundColor: AppColors.white,
                                borderRadius: 14,
                                borderCurve: 'continuous',
                                borderWidth: 1,
                                borderColor: '#E5E7EB',
                                padding: 16,
                            }}
                        >
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                {/* Icon */}
                                <View
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 12,
                                        backgroundColor: AppColors.primary + '10',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <EvidenceIcon type={item.type} />
                                </View>

                                {/* Info */}
                                <View style={{ flex: 1, gap: 4 }}>
                                    <Text
                                        style={{
                                            fontSize: 14,
                                            fontFamily: 'IBMPlexSans_600SemiBold',
                                            color: AppColors.textPrimary,
                                        }}
                                        numberOfLines={1}
                                    >
                                        {item.title}
                                    </Text>
                                    <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: '#6B7280' }}>
                                        {item.typeLabel} • {item.size}
                                    </Text>
                                    <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>
                                        {item.caseId}
                                    </Text>
                                </View>
                            </View>

                            {/* Bottom row: date + actions */}
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginTop: 12,
                                    paddingTop: 10,
                                    borderTopWidth: 1,
                                    borderTopColor: '#F3F4F6',
                                }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    <CalendarIcon />
                                    <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>
                                        {item.date}
                                    </Text>
                                </View>

                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                                    <Pressable hitSlop={8}>
                                        <EditIcon />
                                    </Pressable>
                                    <Pressable hitSlop={8}>
                                        <TrashIcon />
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}
