import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, Typography, Spacing } from '@/constants/theme';
import { useAdminCasesInfinite } from '@/lib/hooks/use-admin-api';

export default function CaseAudit() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { query: casesQuery, items: cases } = useAdminCasesInfinite();

    return (
        <View style={{ flex: 1, backgroundColor: AppColors.surface }}>
            <ScrollView contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 24 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 14, backgroundColor: AppColors.white, gap: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
                    <Pressable onPress={() => router.back()} hitSlop={8}>
                        <Ionicons name="arrow-back" size={22} color={AppColors.textPrimary} />
                    </Pressable>
                    <Text style={{ ...Typography.h5, color: AppColors.textPrimary, flex: 1 }}>Case Audit</Text>
                    <View style={{ backgroundColor: AppColors.primary + '12', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 }}>
                        <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>{cases.length}</Text>
                    </View>
                </View>

                <View style={{ paddingHorizontal: Spacing.md, paddingTop: 14, gap: 10 }}>
                    {casesQuery.isLoading ? (
                        <View style={{ paddingTop: 50, alignItems: 'center' }}><ActivityIndicator color={AppColors.primary} /></View>
                    ) : casesQuery.isError ? (
                        <Text selectable style={{ ...Typography.bodySmall, color: AppColors.error, textAlign: 'center', paddingTop: 40 }}>
                            {casesQuery.error instanceof Error ? casesQuery.error.message : 'Failed to load cases'}
                        </Text>
                    ) : cases.length === 0 ? (
                        <Text style={{ ...Typography.bodySmall, color: '#9CA3AF', textAlign: 'center', paddingTop: 40 }}>No cases</Text>
                    ) : (
                        <>
                            {cases.map((c) => (
                                <View key={c.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: AppColors.white, borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', padding: 14 }}>
                                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: AppColors.primary + '12', alignItems: 'center', justifyContent: 'center' }}>
                                        <Ionicons name="folder-outline" size={18} color={AppColors.primary} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>CASE-{c.id}</Text>
                                        <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>by {c.user?.name ?? `User #${c.user_id}`}</Text>
                                    </View>
                                    <View style={{ backgroundColor: '#F3F4F6', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                                        <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_500Medium', color: '#6B7280' }}>{c.evidences_count} evidence</Text>
                                    </View>
                                </View>
                            ))}
                            {casesQuery.hasNextPage && (
                                <Pressable onPress={() => casesQuery.fetchNextPage()} disabled={casesQuery.isFetchingNextPage} style={({ pressed }) => ({ marginTop: 4, height: 44, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? '#F3F4F6' : AppColors.white })}>
                                    {casesQuery.isFetchingNextPage ? <ActivityIndicator size="small" color={AppColors.primary} /> : <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>Load more</Text>}
                                </Pressable>
                            )}
                        </>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
