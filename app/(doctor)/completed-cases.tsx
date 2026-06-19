import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { AppColors, Typography, Spacing } from '@/constants/theme';
import { CaseCard } from '@/components/ui/case-card';
import {
    useCompletedCasesQuery,
    formatCaseDate,
    caseDisplayId,
} from '@/lib/hooks/use-cases-api';

function daysSince(createdAt?: string): number | undefined {
    if (!createdAt) {
        return undefined;
    }
    const parsed = new Date(createdAt);
    if (Number.isNaN(parsed.getTime())) {
        return undefined;
    }
    const diffMs = Date.now() - parsed.getTime();
    return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

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

export default function CompletedCases() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { data: completedCases = [], isLoading, isError, error } = useCompletedCasesQuery();

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
                        Completed Cases
                    </Text>
                    <View
                        style={{
                            backgroundColor: '#DCFCE7',
                            borderRadius: 12,
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                        }}
                    >
                        <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_600SemiBold', color: '#16A34A' }}>
                            {completedCases.length}
                        </Text>
                    </View>
                </View>

                <View style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.md, gap: 12 }}>
                    {isLoading ? (
                        <View style={{ alignItems: 'center', paddingTop: 60, gap: 12 }}>
                            <ActivityIndicator color={AppColors.primary} />
                            <Text style={{ ...Typography.bodySmall, color: AppColors.border }}>Loading cases…</Text>
                        </View>
                    ) : isError ? (
                        <View style={{ alignItems: 'center', paddingTop: 60, gap: 12 }}>
                            <Text selectable style={{ ...Typography.bodySmall, color: AppColors.error, textAlign: 'center' }}>
                                {error instanceof Error ? error.message : 'Failed to load cases.'}
                            </Text>
                        </View>
                    ) : completedCases.length > 0 ? (
                        completedCases.map((c) => {
                            const displayId = caseDisplayId(c.id);
                            const date = formatCaseDate(c.created_at);
                            return (
                                <CaseCard
                                    key={c.id}
                                    title={c.name}
                                    description={c.description}
                                    caseId={displayId}
                                    date={date}
                                    completed
                                    daysAgo={daysSince(c.created_at)}
                                    onEdit={() => router.push({ pathname: '/(doctor)/case-details', params: { caseId: String(c.id), title: c.name, description: c.description, date } })}
                                />
                            );
                        })
                    ) : (
                        <View style={{ alignItems: 'center', paddingTop: 60, gap: 12 }}>
                            <Text style={{ ...Typography.bodySmall, color: AppColors.border }}>No completed cases yet</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
