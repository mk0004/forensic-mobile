import { View, Text, ScrollView, Pressable, Image, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, Typography, Spacing } from '@/constants/theme';
import { useAdminDoctorProfileQuery } from '@/lib/hooks/use-admin-api';
import { resolveImageUrl } from '@/constants/railway-api';

export default function DoctorProfile() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams<{ id?: string }>();
    const profileQuery = useAdminDoctorProfileQuery(id);
    const data = profileQuery.data;
    const info = data?.doctor_info;
    const cases = data?.modals_data.cases_modal.data ?? [];
    const articles = data?.modals_data.articles_modal.data ?? [];

    const img = resolveImageUrl(info?.image);
    const initials = (info?.name ?? 'D').trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase();

    return (
        <View style={{ flex: 1, backgroundColor: AppColors.surface }}>
            <ScrollView contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 24 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 14, backgroundColor: AppColors.white, gap: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
                    <Pressable onPress={() => router.back()} hitSlop={8}>
                        <Ionicons name="arrow-back" size={22} color={AppColors.textPrimary} />
                    </Pressable>
                    <Text style={{ ...Typography.h5, color: AppColors.textPrimary, flex: 1 }}>Doctor Profile</Text>
                </View>

                {profileQuery.isLoading ? (
                    <View style={{ paddingTop: 60, alignItems: 'center' }}><ActivityIndicator color={AppColors.primary} /></View>
                ) : profileQuery.isError || !info ? (
                    <Text selectable style={{ ...Typography.bodySmall, color: AppColors.error, textAlign: 'center', paddingTop: 40 }}>
                        {profileQuery.error instanceof Error ? profileQuery.error.message : 'Failed to load profile'}
                    </Text>
                ) : (
                    <>
                        {/* Profile card */}
                        <View style={{ alignItems: 'center', paddingTop: Spacing.lg, gap: 10 }}>
                            <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: AppColors.primary + '15', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                {img ? <Image source={{ uri: img }} style={{ width: 84, height: 84 }} /> : <Text style={{ fontSize: 28, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.primary }}>{initials}</Text>}
                            </View>
                            <Text style={{ ...Typography.h5, color: AppColors.textPrimary }}>{info.name}</Text>
                            {!!info.email && <Text style={{ ...Typography.bodySmall, color: '#9CA3AF' }}>{info.email}</Text>}
                            {!!info.national_id && <Text style={{ ...Typography.caption, color: '#9CA3AF' }}>National ID: {info.national_id}</Text>}
                        </View>

                        {/* Stats */}
                        <View style={{ flexDirection: 'row', paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, gap: 12 }}>
                            <View style={{ flex: 1, backgroundColor: AppColors.white, borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', padding: 16, alignItems: 'center', gap: 4 }}>
                                <Text style={{ fontSize: 24, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.primary }}>{info.total_cases}</Text>
                                <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: '#6B7280' }}>Cases</Text>
                            </View>
                            <View style={{ flex: 1, backgroundColor: AppColors.white, borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', padding: 16, alignItems: 'center', gap: 4 }}>
                                <Text style={{ fontSize: 24, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.primary }}>{info.total_articles}</Text>
                                <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: '#6B7280' }}>Articles</Text>
                            </View>
                        </View>

                        {/* Cases */}
                        <View style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, gap: 10 }}>
                            <Text style={{ ...Typography.h5, color: AppColors.textPrimary }}>Recent Cases</Text>
                            <View style={{ backgroundColor: AppColors.white, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden' }}>
                                {cases.length === 0 ? (
                                    <Text style={{ ...Typography.bodySmall, color: '#9CA3AF', textAlign: 'center', paddingVertical: 24 }}>No cases</Text>
                                ) : cases.map((c, idx) => (
                                    <View key={c.id} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: idx < cases.length - 1 ? 1 : 0, borderBottomColor: '#F3F4F6' }}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>CASE-{c.id}</Text>
                                            <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>{c.evidences_count} evidence</Text>
                                        </View>
                                        <View style={{ backgroundColor: AppColors.primary + '12', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                                            <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>{c.status}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Articles */}
                        <View style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, gap: 10 }}>
                            <Text style={{ ...Typography.h5, color: AppColors.textPrimary }}>Recent Articles</Text>
                            <View style={{ backgroundColor: AppColors.white, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden' }}>
                                {articles.length === 0 ? (
                                    <Text style={{ ...Typography.bodySmall, color: '#9CA3AF', textAlign: 'center', paddingVertical: 24 }}>No articles</Text>
                                ) : articles.map((a, idx) => (
                                    <View key={a.id} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: idx < articles.length - 1 ? 1 : 0, borderBottomColor: '#F3F4F6' }}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.textPrimary }} numberOfLines={1}>{a.title ?? 'Untitled'}</Text>
                                        </View>
                                        <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>{a.views_count ?? 0} views</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>
        </View>
    );
}
