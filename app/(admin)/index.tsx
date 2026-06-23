import { View, Text, ScrollView, Pressable, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, Typography, Spacing } from '@/constants/theme';
import { StatCard } from '@/components/ui/stat-card';
import { useAuth } from '@/lib/auth-context';
import { useAdminDashboardQuery } from '@/lib/hooks/use-admin-api';
import { resolveImageUrl } from '@/constants/railway-api';

function LogoutIcon() {
    return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke={AppColors.textPrimary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

const ADMIN_SECTIONS: { label: string; subtitle: string; icon: keyof typeof Ionicons.glyphMap; tint: string; route: string }[] = [
    { label: 'Doctors', subtitle: 'Manage, block & promote', icon: 'people-outline', tint: '#1E2A5E', route: '/(admin)/doctors-management' },
    { label: 'Case Audit', subtitle: 'Review all cases & evidence', icon: 'folder-open-outline', tint: '#0EA5E9', route: '/(admin)/case-audit' },
    { label: 'Community', subtitle: 'Moderate posts & comments', icon: 'chatbubbles-outline', tint: '#7C3AED', route: '/(admin)/community' },
    { label: 'Chat Management', subtitle: 'AI assistant conversations', icon: 'sparkles-outline', tint: '#4CC1E9', route: '/(admin)/chat-management' },
    { label: 'System Log', subtitle: 'Admin activity history', icon: 'document-text-outline', tint: '#64748B', route: '/(admin)/system-log' },
    { label: 'Global Report', subtitle: 'Monthly platform analytics', icon: 'bar-chart-outline', tint: '#16A34A', route: '/(admin)/global-report' },
];

function AiModelsChart({ data }: { data: { models: string; total_used: number }[] }) {
    const max = Math.max(1, ...data.map((d) => d.total_used));
    return (
        <View style={{ backgroundColor: AppColors.white, borderRadius: 16, borderCurve: 'continuous', padding: 20, gap: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Text style={{ ...Typography.h5, color: AppColors.textPrimary }}>AI Models Usage</Text>
            {data.length === 0 ? (
                <Text style={{ ...Typography.bodySmall, color: '#9CA3AF', textAlign: 'center', paddingVertical: 16 }}>
                    No model runs yet
                </Text>
            ) : (
                <View style={{ gap: 12 }}>
                    {data.map((d) => (
                        <View key={d.models} style={{ gap: 4 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.textPrimary }}>{d.models}</Text>
                                <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>{d.total_used}</Text>
                            </View>
                            <View style={{ height: 8, borderRadius: 4, backgroundColor: '#EEF2FF', overflow: 'hidden' }}>
                                <View style={{ width: `${(d.total_used / max) * 100}%`, height: 8, borderRadius: 4, backgroundColor: AppColors.primary }} />
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}

export default function AdminDashboard() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { signOut } = useAuth();
    const dashboardQuery = useAdminDashboardQuery();
    const data = dashboardQuery.data;
    const stats = data?.statistics;
    const topDoctors = data?.top_doctors ?? [];

    const handleLogout = async () => {
        await signOut();
        router.replace('/(auth)/login');
    };

    return (
        <ScrollView contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 24, backgroundColor: AppColors.surface }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 12, backgroundColor: AppColors.white }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Image source={require('@/assets/images/forensic-logo.png')} style={{ width: 40, height: 40, borderRadius: 20 }} resizeMode="contain" />
                    <Text style={{ fontSize: 18, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>Forensic</Text>
                </View>
                <Pressable onPress={handleLogout} hitSlop={8}><LogoutIcon /></Pressable>
            </View>

            {/* Title */}
            <View style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, gap: 4 }}>
                <Text style={{ ...Typography.h4, color: AppColors.textPrimary }}>Admin Dashboard</Text>
                <Text style={{ ...Typography.bodySmall, color: AppColors.border }}>Overview of doctors, cases and platform activity.</Text>
            </View>

            {dashboardQuery.isLoading ? (
                <View style={{ paddingTop: 60, alignItems: 'center' }}><ActivityIndicator color={AppColors.primary} /></View>
            ) : dashboardQuery.isError ? (
                <View style={{ padding: Spacing.md }}>
                    <Text selectable style={{ ...Typography.bodySmall, color: AppColors.error, textAlign: 'center' }}>
                        {dashboardQuery.error instanceof Error ? dashboardQuery.error.message : 'Failed to load dashboard'}
                    </Text>
                </View>
            ) : (
                <>
                    {/* Stats */}
                    <View style={{ flexDirection: 'row', paddingHorizontal: Spacing.md, paddingTop: Spacing.md, gap: 12 }}>
                        <StatCard title="Total Doctors" value={stats?.total_doctors ?? 0} variant="blue" />
                        <StatCard title="Active Cases" value={stats?.active_cases ?? 0} variant="green" />
                    </View>
                    <View style={{ paddingHorizontal: Spacing.md, paddingTop: 12 }}>
                        <StatCard title="Community Posts" value={stats?.total_feeds_posts ?? 0} variant="teal" fullWidth />
                    </View>

                    {/* Admin sections */}
                    <View style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, gap: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={{ ...Typography.caption, fontFamily: 'IBMPlexSans_600SemiBold', color: '#9CA3AF', letterSpacing: 1, textTransform: 'uppercase' }}>Manage</Text>
                            <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_500Medium', color: '#D1D5DB' }}>{ADMIN_SECTIONS.length} sections</Text>
                        </View>
                        <View style={{ gap: 10 }}>
                            {ADMIN_SECTIONS.map((s) => (
                                <Pressable
                                    key={s.label}
                                    onPress={() => router.push(s.route as never)}
                                    style={({ pressed }) => ({
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 14,
                                        backgroundColor: pressed ? '#F8FAFC' : AppColors.white,
                                        borderRadius: 16,
                                        borderWidth: 1,
                                        borderColor: '#EEF0F3',
                                        padding: 14,
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                    })}
                                >
                                    <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: s.tint + '14', alignItems: 'center', justifyContent: 'center' }}>
                                        <Ionicons name={s.icon} size={22} color={s.tint} />
                                    </View>
                                    <View style={{ flex: 1, gap: 2 }}>
                                        <Text style={{ fontSize: 15, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>{s.label}</Text>
                                        <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>{s.subtitle}</Text>
                                    </View>
                                    <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' }}>
                                        <Ionicons name="chevron-forward" size={15} color="#9CA3AF" />
                                    </View>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    {/* AI Models chart */}
                    <View style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.lg }}>
                        <AiModelsChart data={data?.chart_data ?? []} />
                    </View>

                    {/* Top doctors */}
                    <View style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, gap: 12 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ ...Typography.h5, color: AppColors.textPrimary }}>Top Doctors</Text>
                            <Pressable onPress={() => router.push('/(admin)/doctors-management')} hitSlop={8}>
                                <Text style={{ ...Typography.bodySmall, color: AppColors.primary }}>Show All</Text>
                            </Pressable>
                        </View>
                        <View style={{ backgroundColor: AppColors.white, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden' }}>
                            {topDoctors.length === 0 ? (
                                <View style={{ paddingVertical: 28, alignItems: 'center' }}>
                                    <Text style={{ ...Typography.bodySmall, color: '#9CA3AF' }}>No doctors yet</Text>
                                </View>
                            ) : topDoctors.map((doc, idx, arr) => {
                                const img = resolveImageUrl(doc.image);
                                const initials = (doc.name || 'D').trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
                                return (
                                    <Pressable
                                        key={doc.id}
                                        onPress={() => router.push({ pathname: '/(admin)/doctor-profile', params: { id: String(doc.id) } })}
                                        style={({ pressed }) => ({
                                            flexDirection: 'row', alignItems: 'center', gap: 12,
                                            paddingHorizontal: 14, paddingVertical: 12,
                                            backgroundColor: pressed ? '#F8FAFC' : 'transparent',
                                            borderBottomWidth: idx < arr.length - 1 ? 1 : 0, borderBottomColor: '#F3F4F6',
                                        })}
                                    >
                                        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: AppColors.primary + '18', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                            {img ? <Image source={{ uri: img }} style={{ width: 40, height: 40 }} /> : <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>{initials}</Text>}
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }} numberOfLines={1}>{doc.name}</Text>
                                            <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>{doc.cases_count ?? 0} cases</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>
                </>
            )}
        </ScrollView>
    );
}
