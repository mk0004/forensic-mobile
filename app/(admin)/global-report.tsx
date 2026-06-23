import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, Typography, Spacing } from '@/constants/theme';
import { useAdminGlobalReportQuery } from '@/lib/hooks/use-admin-api';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <View style={{ gap: 10 }}>
            <Text style={{ ...Typography.h5, color: AppColors.textPrimary }}>{title}</Text>
            <View style={{ backgroundColor: AppColors.white, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 16, gap: 10 }}>
                {children}
            </View>
        </View>
    );
}

function StatRow({ label, value }: { label: string; value: number | string }) {
    return (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_400Regular', color: '#6B7280' }}>{label}</Text>
            <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>{value}</Text>
        </View>
    );
}

export default function GlobalReport() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const reportQuery = useAdminGlobalReportQuery();
    const report = reportQuery.data;

    return (
        <View style={{ flex: 1, backgroundColor: AppColors.surface }}>
            <ScrollView contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 24 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 14, backgroundColor: AppColors.white, gap: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
                    <Pressable onPress={() => router.back()} hitSlop={8}>
                        <Ionicons name="arrow-back" size={22} color={AppColors.textPrimary} />
                    </Pressable>
                    <Text style={{ ...Typography.h5, color: AppColors.textPrimary, flex: 1 }}>Global Report</Text>
                </View>

                {reportQuery.isLoading ? (
                    <View style={{ paddingTop: 60, alignItems: 'center' }}><ActivityIndicator color={AppColors.primary} /></View>
                ) : reportQuery.isError || !report ? (
                    <Text selectable style={{ ...Typography.bodySmall, color: AppColors.error, textAlign: 'center', paddingTop: 40 }}>
                        {reportQuery.error instanceof Error ? reportQuery.error.message : 'Failed to load report'}
                    </Text>
                ) : (
                    <View style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.md, gap: Spacing.lg }}>
                        <View style={{ backgroundColor: AppColors.primary, borderRadius: 16, padding: 16 }}>
                            <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_400Regular', color: 'rgba(255,255,255,0.7)' }}>Report period</Text>
                            <Text style={{ fontSize: 20, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.white }}>{report.metadata.period}</Text>
                            <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_400Regular', color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>Generated {report.metadata.generated_at}</Text>
                        </View>

                        <Section title="Cases">
                            <StatRow label="Total this month" value={report.data.case_statistics.total} />
                            <StatRow label="Active" value={report.data.case_statistics.active} />
                            <StatRow label="Completed" value={report.data.case_statistics.completed} />
                        </Section>

                        <Section title="Community">
                            <StatRow label="Articles" value={report.data.community_engagement.articles} />
                            <StatRow label="Feeds" value={report.data.community_engagement.feeds} />
                            <StatRow label="Comments" value={report.data.community_engagement.comments} />
                        </Section>

                        <Section title="AI Performance">
                            {report.data.ai_performance.length === 0 ? (
                                <Text style={{ ...Typography.bodySmall, color: '#9CA3AF' }}>No model runs this period</Text>
                            ) : report.data.ai_performance.map((m) => (
                                <StatRow key={m.models} label={m.models} value={m.usage_count} />
                            ))}
                        </Section>

                        <Section title="Recent User Activity">
                            {report.data.user_activity.length === 0 ? (
                                <Text style={{ ...Typography.bodySmall, color: '#9CA3AF' }}>No activity</Text>
                            ) : report.data.user_activity.slice(0, 10).map((u, i) => (
                                <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <View>
                                        <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.textPrimary }}>{u.name}</Text>
                                        <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>{u.role}</Text>
                                    </View>
                                    <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>{u.updated_at}</Text>
                                </View>
                            ))}
                        </Section>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
