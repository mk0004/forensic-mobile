import { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, TextInput as RNTextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, Typography, Spacing } from '@/constants/theme';
import { useAdminDoctorsInfinite, useToggleUserMutation, useAssignAdminMutation } from '@/lib/hooks/use-admin-api';
import type { AdminDoctor } from '@/types/api';

function isBlocked(status?: string): boolean {
    return (status ?? '').trim().toLowerCase().startsWith('block');
}

export default function DoctorsManagement() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { query: doctorsQuery, items: allDoctors } = useAdminDoctorsInfinite();
    const toggleUser = useToggleUserMutation();
    const assignAdmin = useAssignAdminMutation();
    const [search, setSearch] = useState('');
    const [actioningId, setActioningId] = useState<number | null>(null);

    const doctors = allDoctors.filter((d) =>
        !search.trim() || d.name.toLowerCase().includes(search.toLowerCase()) || (d.national_id ?? '').includes(search),
    );

    const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase();

    const doToggle = (d: AdminDoctor) => {
        setActioningId(d.id);
        toggleUser.mutate(d.id, { onSettled: () => setActioningId(null) });
    };

    const doPromote = (d: AdminDoctor) => {
        setActioningId(d.id);
        assignAdmin.mutate(d.id, { onSettled: () => setActioningId(null) });
    };

    return (
        <View style={{ flex: 1, backgroundColor: AppColors.surface }}>
            <ScrollView contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 24 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 14, backgroundColor: AppColors.white, gap: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
                    <Pressable onPress={() => router.back()} hitSlop={8}>
                        <Ionicons name="arrow-back" size={22} color={AppColors.textPrimary} />
                    </Pressable>
                    <Text style={{ ...Typography.h5, color: AppColors.textPrimary, flex: 1 }}>Doctors</Text>
                    <View style={{ backgroundColor: AppColors.primary + '12', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 }}>
                        <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>{allDoctors.length}</Text>
                    </View>
                </View>

                <View style={{ paddingHorizontal: Spacing.md, paddingTop: 14 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: AppColors.white, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 14, height: 44, gap: 10 }}>
                        <Ionicons name="search" size={18} color="#9CA3AF" />
                        <RNTextInput value={search} onChangeText={setSearch} placeholder="Search by name or national ID..." placeholderTextColor="#9CA3AF" style={{ flex: 1, fontSize: 14, fontFamily: 'IBMPlexSans_400Regular', color: AppColors.textPrimary, height: 42, padding: 0 }} />
                    </View>
                </View>

                <View style={{ paddingHorizontal: Spacing.md, paddingTop: 14, gap: 10 }}>
                    {doctorsQuery.isLoading ? (
                        <View style={{ paddingTop: 50, alignItems: 'center' }}><ActivityIndicator color={AppColors.primary} /></View>
                    ) : doctorsQuery.isError ? (
                        <Text selectable style={{ ...Typography.bodySmall, color: AppColors.error, textAlign: 'center', paddingTop: 40 }}>
                            {doctorsQuery.error instanceof Error ? doctorsQuery.error.message : 'Failed to load doctors'}
                        </Text>
                    ) : doctors.length === 0 ? (
                        <Text style={{ ...Typography.bodySmall, color: '#9CA3AF', textAlign: 'center', paddingTop: 40 }}>No doctors found</Text>
                    ) : doctors.map((d) => {
                        const blocked = isBlocked(d.status);
                        const busy = actioningId === d.id;
                        return (
                            <View key={d.id} style={{ backgroundColor: AppColors.white, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 14, gap: 12 }}>
                                <Pressable onPress={() => router.push({ pathname: '/(admin)/doctor-profile', params: { id: String(d.id) } })} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: AppColors.primary + '15', alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ fontSize: 16, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>{initials(d.name)}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 15, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }} numberOfLines={1}>{d.name}</Text>
                                        <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>ID: {d.national_id ?? '—'}</Text>
                                    </View>
                                    <View style={{ backgroundColor: blocked ? AppColors.error + '14' : AppColors.success + '14', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                                        <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_600SemiBold', color: blocked ? AppColors.error : AppColors.success }}>{blocked ? 'Blocked' : 'Active'}</Text>
                                    </View>
                                </Pressable>

                                <View style={{ flexDirection: 'row', gap: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12 }}>
                                    <Pressable onPress={() => doPromote(d)} disabled={busy} style={({ pressed }) => ({ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 40, borderRadius: 10, borderWidth: 1, borderColor: AppColors.primary + '40', backgroundColor: pressed ? AppColors.primary + '08' : 'transparent' })}>
                                        <Ionicons name="shield-checkmark-outline" size={15} color={AppColors.primary} />
                                        <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>Make Admin</Text>
                                    </Pressable>
                                    <Pressable onPress={() => doToggle(d)} disabled={busy} style={({ pressed }) => ({ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 40, borderRadius: 10, borderWidth: 1, borderColor: (blocked ? AppColors.success : AppColors.error) + '40', backgroundColor: pressed ? (blocked ? AppColors.success : AppColors.error) + '0A' : 'transparent' })}>
                                        {busy ? <ActivityIndicator size="small" color={blocked ? AppColors.success : AppColors.error} /> : (
                                            <>
                                                <Ionicons name={blocked ? 'lock-open-outline' : 'lock-closed-outline'} size={15} color={blocked ? AppColors.success : AppColors.error} />
                                                <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_600SemiBold', color: blocked ? AppColors.success : AppColors.error }}>{blocked ? 'Unblock' : 'Block'}</Text>
                                            </>
                                        )}
                                    </Pressable>
                                </View>
                            </View>
                        );
                    })}

                    {doctorsQuery.hasNextPage && !search.trim() && (
                        <Pressable
                            onPress={() => doctorsQuery.fetchNextPage()}
                            disabled={doctorsQuery.isFetchingNextPage}
                            style={({ pressed }) => ({ height: 44, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? '#F3F4F6' : AppColors.white, marginTop: 4 })}
                        >
                            {doctorsQuery.isFetchingNextPage
                                ? <ActivityIndicator size="small" color={AppColors.primary} />
                                : <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>Load more</Text>}
                        </Pressable>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
