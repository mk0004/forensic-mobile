import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, Typography, Spacing } from '@/constants/theme';
import { useAdminSystemLogInfinite } from '@/lib/hooks/use-admin-api';

export default function SystemLog() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { query: logQuery, items: logs } = useAdminSystemLogInfinite();

    return (
        <View style={{ flex: 1, backgroundColor: AppColors.surface }}>
            <ScrollView contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 24 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 14, backgroundColor: AppColors.white, gap: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
                    <Pressable onPress={() => router.back()} hitSlop={8}>
                        <Ionicons name="arrow-back" size={22} color={AppColors.textPrimary} />
                    </Pressable>
                    <Text style={{ ...Typography.h5, color: AppColors.textPrimary, flex: 1 }}>System Log</Text>
                </View>

                <View style={{ paddingHorizontal: Spacing.md, paddingTop: 14, gap: 10 }}>
                    {logQuery.isLoading ? (
                        <View style={{ paddingTop: 50, alignItems: 'center' }}><ActivityIndicator color={AppColors.primary} /></View>
                    ) : logQuery.isError ? (
                        <Text selectable style={{ ...Typography.bodySmall, color: AppColors.error, textAlign: 'center', paddingTop: 40 }}>
                            {logQuery.error instanceof Error ? logQuery.error.message : 'Failed to load system log'}
                        </Text>
                    ) : logs.length === 0 ? (
                        <Text style={{ ...Typography.bodySmall, color: '#9CA3AF', textAlign: 'center', paddingTop: 40 }}>No activity logged</Text>
                    ) : (
                        <>
                            {logs.map((log) => (
                                <View key={log.id} style={{ flexDirection: 'row', gap: 12, backgroundColor: AppColors.white, borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', padding: 14 }}>
                                    <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: AppColors.primary + '12', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                                        <Ionicons name="document-text-outline" size={16} color={AppColors.primary} />
                                    </View>
                                    <View style={{ flex: 1, gap: 2 }}>
                                        <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.textPrimary, lineHeight: 18 }}>{log.massage ?? '—'}</Text>
                                        <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>{log.name ?? ''}{log.created_at ? ` · ${log.created_at}` : ''}</Text>
                                    </View>
                                </View>
                            ))}
                            {logQuery.hasNextPage && (
                                <Pressable onPress={() => logQuery.fetchNextPage()} disabled={logQuery.isFetchingNextPage} style={({ pressed }) => ({ marginTop: 4, height: 44, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? '#F3F4F6' : AppColors.white })}>
                                    {logQuery.isFetchingNextPage ? <ActivityIndicator size="small" color={AppColors.primary} /> : <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>Load more</Text>}
                                </Pressable>
                            )}
                        </>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
