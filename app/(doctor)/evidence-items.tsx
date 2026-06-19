import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';
import { AppColors, Typography, Spacing } from '@/constants/theme';
import { useEvidenceListQuery, useDeleteEvidenceMutation } from '@/lib/hooks/use-evidence-api';
import type { Evidence } from '@/types/api';

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
    caseId: number;
    title: string;
    type: 'image' | 'video' | 'dna' | 'document';
    typeLabel: string;
    caseLabel: string;
}

function deriveType(modelUsed: string): { type: EvidenceItem['type']; typeLabel: string } {
    const model = (modelUsed || '').toLowerCase();
    if (model.includes('dna')) {
        return { type: 'dna', typeLabel: 'DNA Sample' };
    }
    if (model.includes('reconstruct') || model.includes('deepfake') || model.includes('deep fake') || model.includes('face') || model.includes('image')) {
        return { type: 'image', typeLabel: modelUsed || 'Image' };
    }
    if (model.includes('video') || model.includes('cctv')) {
        return { type: 'video', typeLabel: modelUsed || 'Video' };
    }
    return { type: 'document', typeLabel: modelUsed || 'Document' };
}

function mapEvidence(ev: Evidence): EvidenceItem {
    const { type, typeLabel } = deriveType(ev.model_used);
    return {
        id: String(ev.id),
        caseId: ev.case_id,
        title: ev.name,
        type,
        typeLabel,
        caseLabel: `CASE-${ev.case_id}`,
    };
}

export default function EvidenceItems() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { data, isLoading, isError, error } = useEvidenceListQuery();
    const deleteEvidence = useDeleteEvidenceMutation();

    const evidenceItems: EvidenceItem[] = (data ?? []).map(mapEvidence);

    const handleDelete = (item: EvidenceItem) => {
        Alert.alert(
            'Delete Evidence',
            `Are you sure you want to delete "${item.title}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteEvidence.mutate({ evidenceId: item.id, caseId: item.caseId }),
                },
            ],
        );
    };

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
                {isLoading ? (
                    <View style={{ paddingTop: 60, alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={AppColors.primary} />
                    </View>
                ) : isError ? (
                    <View style={{ paddingTop: 60, paddingHorizontal: Spacing.md, alignItems: 'center', gap: 8 }}>
                        <Text selectable style={{ fontSize: 14, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.error, textAlign: 'center' }}>
                            {error instanceof Error ? error.message : 'Failed to load evidence'}
                        </Text>
                    </View>
                ) : evidenceItems.length === 0 ? (
                    <View style={{ paddingTop: 60, paddingHorizontal: Spacing.md, alignItems: 'center', gap: 8 }}>
                        <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_500Medium', color: '#9CA3AF', textAlign: 'center' }}>
                            No evidence items yet
                        </Text>
                    </View>
                ) : (
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
                                        {item.typeLabel}
                                    </Text>
                                    <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>
                                        {item.caseLabel}
                                    </Text>
                                </View>
                            </View>

                            {/* Bottom row: case + actions */}
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
                                        {item.caseLabel}
                                    </Text>
                                </View>

                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                                    <Pressable hitSlop={8}>
                                        <EditIcon />
                                    </Pressable>
                                    <Pressable
                                        hitSlop={8}
                                        onPress={() => handleDelete(item)}
                                        disabled={deleteEvidence.isPending}
                                    >
                                        <TrashIcon />
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
                )}
            </ScrollView>
        </View>
    );
}
