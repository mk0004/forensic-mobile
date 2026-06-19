import { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Modal, Dimensions, TextInput as RNTextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { AppColors, Typography, Spacing } from '@/constants/theme';
import { CaseCard } from '@/components/ui/case-card';
import { EditCaseDrawer } from '@/components/edit-case-drawer';
import {
    useActiveCasesQuery,
    useCompletedCasesQuery,
    useDeleteCaseMutation,
    useUpdateCaseMutation,
    formatCaseDate,
    caseDisplayId,
} from '@/lib/hooks/use-cases-api';
import type { Case } from '@/types/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/* ─── Icons ─── */
function BackIcon() {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M19 12H5M12 19l-7-7 7-7" stroke={AppColors.textPrimary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function SearchIcon() {
    return (
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35" stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function EmptyIcon() {
    return (
        <Svg width={64} height={64} viewBox="0 0 24 24" fill="none">
            <Path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" stroke="#D1D5DB" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function FabPlusIcon() {
    return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path d="M12 5v14M5 12h14" stroke={AppColors.white} strokeWidth={2.5} strokeLinecap="round" />
        </Svg>
    );
}

function ActiveDotIcon() {
    return (
        <Svg width={8} height={8} viewBox="0 0 8 8">
            <Circle cx={4} cy={4} r={4} fill={AppColors.success} />
        </Svg>
    );
}

function CompletedCheckIcon() {
    return (
        <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
            <Path d="M20 6L9 17l-5-5" stroke={AppColors.success} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

const FILTERS = ['All', 'Active', 'Completed'] as const;
type Filter = typeof FILTERS[number];

type DisplayCase = {
    id: number;
    title: string;
    description: string;
    caseId: string;
    date: string;
    completed: boolean;
};

function toDisplayCase(c: Case, completed: boolean): DisplayCase {
    return {
        id: c.id,
        title: c.name,
        description: c.description,
        caseId: caseDisplayId(c.id),
        date: formatCaseDate(c.created_at),
        completed,
    };
}

export default function InvestigativeCases() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const activeQuery = useActiveCasesQuery();
    const completedQuery = useCompletedCasesQuery();
    const deleteCase = useDeleteCaseMutation();
    const updateCase = useUpdateCaseMutation();
    const [activeFilter, setActiveFilter] = useState<Filter>('All');
    const [search, setSearch] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
    const [editTarget, setEditTarget] = useState<{ id: number; title: string; description: string } | null>(null);

    const activeCasesList = useMemo(() => activeQuery.data ?? [], [activeQuery.data]);
    const completedCasesList = useMemo(() => completedQuery.data ?? [], [completedQuery.data]);
    const isLoading = activeQuery.isLoading || completedQuery.isLoading;
    const isError = activeQuery.isError || completedQuery.isError;
    const errorObj = activeQuery.error ?? completedQuery.error;

    const getFilteredCases = useCallback(() => {
        let cases: DisplayCase[] = [];

        if (activeFilter === 'Active' || activeFilter === 'All') {
            cases = [...cases, ...activeCasesList.map(c => toDisplayCase(c, false))];
        }
        if (activeFilter === 'Completed' || activeFilter === 'All') {
            cases = [...cases, ...completedCasesList.map(c => toDisplayCase(c, true))];
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            cases = cases.filter(c =>
                c.title.toLowerCase().includes(q) ||
                c.caseId.toLowerCase().includes(q) ||
                c.description.toLowerCase().includes(q)
            );
        }

        return cases;
    }, [activeFilter, search, activeCasesList, completedCasesList]);

    const filteredCases = getFilteredCases();
    const activeCount = activeCasesList.length;
    const completedCount = completedCasesList.length;
    const totalCount = activeCount + completedCount;

    const handleDelete = () => {
        if (deleteTarget !== null) {
            deleteCase.mutate(deleteTarget, {
                onSettled: () => setDeleteTarget(null),
            });
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: AppColors.surface }}>
            <ScrollView
                contentContainerStyle={{
                    paddingTop: insets.top,
                    paddingBottom: insets.bottom + 100,
                }}
            >
                {/* Header */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: Spacing.md,
                    paddingVertical: 14,
                    backgroundColor: AppColors.white,
                    gap: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: '#F3F4F6',
                }}>
                    <Pressable onPress={() => router.back()} hitSlop={8}>
                        <BackIcon />
                    </Pressable>
                    <View style={{ flex: 1 }}>
                        <Text style={{ ...Typography.h5, color: AppColors.textPrimary }}>
                            Investigative Cases
                        </Text>
                    </View>
                    <View style={{
                        backgroundColor: AppColors.primary + '12',
                        borderRadius: 10,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                    }}>
                        <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>
                            {totalCount}
                        </Text>
                    </View>
                </View>

                {/* Summary stats row */}
                <View style={{ flexDirection: 'row', paddingHorizontal: Spacing.md, paddingTop: 14, gap: 10 }}>
                    <View style={{
                        flex: 1,
                        backgroundColor: AppColors.white,
                        borderRadius: 12,
                        padding: 14,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        gap: 4,
                    }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <ActiveDotIcon />
                            <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_500Medium', color: '#6B7280' }}>
                                Active
                            </Text>
                        </View>
                        <Text style={{ fontSize: 22, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.textPrimary }}>
                            {activeCount}
                        </Text>
                    </View>
                    <View style={{
                        flex: 1,
                        backgroundColor: AppColors.white,
                        borderRadius: 12,
                        padding: 14,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        gap: 4,
                    }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <CompletedCheckIcon />
                            <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_500Medium', color: '#6B7280' }}>
                                Completed
                            </Text>
                        </View>
                        <Text style={{ fontSize: 22, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.textPrimary }}>
                            {completedCount}
                        </Text>
                    </View>
                </View>

                {/* Search + Filters */}
                <View style={{ paddingHorizontal: Spacing.md, paddingTop: 14, gap: 12 }}>
                    {/* Search bar */}
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: AppColors.white,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        paddingHorizontal: 14,
                        height: 42,
                        gap: 10,
                    }}>
                        <SearchIcon />
                        <RNTextInput
                            value={search}
                            onChangeText={setSearch}
                            placeholder="Search by title, case ID..."
                            placeholderTextColor="#9CA3AF"
                            style={{
                                flex: 1,
                                fontSize: 14,
                                fontFamily: 'IBMPlexSans_400Regular',
                                color: AppColors.textPrimary,
                                height: 40,
                                padding: 0,
                            }}
                        />
                    </View>

                    {/* Filter chips */}
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        {FILTERS.map(f => {
                            const isActive = activeFilter === f;
                            return (
                                <Pressable
                                    key={f}
                                    onPress={() => setActiveFilter(f)}
                                    style={{
                                        backgroundColor: isActive ? AppColors.primary : AppColors.white,
                                        borderRadius: 20,
                                        borderWidth: isActive ? 0 : 1,
                                        borderColor: '#E5E7EB',
                                        paddingHorizontal: 16,
                                        paddingVertical: 7,
                                    }}
                                >
                                    <Text style={{
                                        fontSize: 13,
                                        fontFamily: isActive ? 'IBMPlexSans_600SemiBold' : 'IBMPlexSans_400Regular',
                                        color: isActive ? AppColors.white : '#6B7280',
                                    }}>
                                        {f}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                {/* Cases list */}
                <View style={{ paddingHorizontal: Spacing.md, paddingTop: 14, gap: 10 }}>
                    {isLoading ? (
                        <View style={{ alignItems: 'center', paddingTop: 60, gap: 12 }}>
                            <ActivityIndicator color={AppColors.primary} />
                            <Text style={{ ...Typography.bodySmall, color: '#9CA3AF' }}>Loading cases…</Text>
                        </View>
                    ) : isError ? (
                        <View style={{ alignItems: 'center', paddingTop: 60, gap: 12 }}>
                            <EmptyIcon />
                            <Text selectable style={{ ...Typography.bodySmall, color: AppColors.error, textAlign: 'center' }}>
                                {errorObj instanceof Error ? errorObj.message : 'Failed to load cases.'}
                            </Text>
                        </View>
                    ) : filteredCases.length > 0 ? (
                        filteredCases.map(c => (
                            <CaseCard
                                key={c.id}
                                title={c.title}
                                description={c.description}
                                caseId={c.caseId}
                                date={c.date}
                                completed={c.completed}
                                onPress={() => router.push({
                                    pathname: '/(doctor)/case-details',
                                    params: { caseId: String(c.id), title: c.title, description: c.description, date: c.date },
                                })}
                                onEdit={() => setEditTarget({ id: c.id, title: c.title, description: c.description })}
                                onDelete={!c.completed ? () => setDeleteTarget(c.id) : undefined}
                            />
                        ))
                    ) : (
                        <View style={{ alignItems: 'center', paddingTop: 60, gap: 12 }}>
                            <EmptyIcon />
                            <Text style={{ ...Typography.bodySmall, color: '#9CA3AF' }}>
                                {search.trim() ? 'No cases match your search' : 'No cases yet'}
                            </Text>
                            <Text style={{ ...Typography.caption, color: '#D1D5DB', textAlign: 'center' }}>
                                Tap the button below to create your first case
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Floating Action Button — New Case */}
            <Pressable
                onPress={() => router.push('/(doctor)/add-case')}
                style={({ pressed }) => ({
                    position: 'absolute',
                    right: 20,
                    bottom: insets.bottom + 24,
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: pressed ? AppColors.primaryHover : AppColors.primary,
                    borderRadius: 16,
                    paddingLeft: 14,
                    paddingRight: 18,
                    height: 52,
                    gap: 8,
                    shadowColor: AppColors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.25,
                    shadowRadius: 12,
                    elevation: 8,
                })}
            >
                <FabPlusIcon />
                <Text style={{ fontSize: 15, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.white }}>
                    New Case
                </Text>
            </Pressable>

            {/* Delete Confirmation Modal */}
            <Modal visible={deleteTarget !== null} transparent animationType="fade">
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
                    <View style={{ backgroundColor: AppColors.white, borderRadius: 20, padding: 28, width: '100%', alignItems: 'center', gap: 16 }}>
                        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: AppColors.error + '15', alignItems: 'center', justifyContent: 'center' }}>
                            <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                                <Path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" stroke={AppColors.error} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                            </Svg>
                        </View>
                        <Text style={{ fontSize: 18, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.textPrimary, textAlign: 'center' }}>
                            Delete Case?
                        </Text>
                        <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_400Regular', color: '#6B7280', textAlign: 'center', lineHeight: 20 }}>
                            Are you sure you want to delete this case? This action cannot be undone.
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 12, marginTop: 4, width: '100%' }}>
                            <Pressable
                                onPress={() => setDeleteTarget(null)}
                                style={({ pressed }) => ({
                                    flex: 1,
                                    backgroundColor: pressed ? '#F3F4F6' : AppColors.white,
                                    borderRadius: 12,
                                    borderWidth: 1.5,
                                    borderColor: '#E5E7EB',
                                    height: 48,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                })}
                            >
                                <Text style={{ fontSize: 15, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>Cancel</Text>
                            </Pressable>
                            <Pressable
                                onPress={handleDelete}
                                style={({ pressed }) => ({
                                    flex: 1,
                                    backgroundColor: pressed ? '#DC2626' : AppColors.error,
                                    borderRadius: 12,
                                    height: 48,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                })}
                            >
                                <Text style={{ fontSize: 15, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.white }}>Delete</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <EditCaseDrawer
                visible={editTarget !== null}
                onClose={() => setEditTarget(null)}
                caseTitle={editTarget?.title || ''}
                caseDescription={editTarget?.description || ''}
                onSave={(newTitle, newDescription) => {
                    if (editTarget) {
                        updateCase.mutate(
                            { id: editTarget.id, name: newTitle, description: newDescription },
                            { onSettled: () => setEditTarget(null) }
                        );
                    }
                }}
            />
        </View>
    );
}
