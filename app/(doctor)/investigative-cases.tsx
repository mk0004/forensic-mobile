import { useState, useRef, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Modal, Animated, Dimensions, TextInput as RNTextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { AppColors, Typography, Spacing } from '@/constants/theme';
import { CaseCard } from '@/components/ui/case-card';
import { EditCaseDrawer } from '@/components/edit-case-drawer';

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

/* ─── Data ─── */
const activeCasesData = [
    { title: 'Suspicious Fire Investigation', description: 'Analysis of fire origin and cause determination at the warehouse district.', caseId: 'CASE-001', date: 'Jan 15, 2025' },
    { title: 'Vehicle Theft Ring', description: 'Multi-county vehicle theft operation involving forged documents and VIN tampering.', caseId: 'CASE-002', date: 'Jan 12, 2025' },
    { title: 'Cyber Fraud Analysis', description: 'Digital forensic examination of financial transactions linked to phishing.', caseId: 'CASE-003', date: 'Jan 10, 2025' },
    { title: 'Homicide - Cold Case Review', description: 'Re-examination of physical evidence using updated DNA analysis techniques.', caseId: 'CASE-004', date: 'Jan 8, 2025' },
    { title: 'Narcotics Lab Evidence', description: 'Chemical analysis and documentation of seized substances and equipment.', caseId: 'CASE-005', date: 'Jan 5, 2025' },
];

const completedCasesData = [
    { title: 'Bank Robbery Evidence', description: 'Fingerprint analysis and CCTV footage examination for the downtown bank heist.', caseId: 'CASE-098', date: 'Dec 20, 2024', daysAgo: 26 },
    { title: 'Missing Person - Jane Doe', description: 'Location triangulation using cellular data and witness testimony cross-reference.', caseId: 'CASE-095', date: 'Dec 15, 2024', daysAgo: 31 },
    { title: 'Insurance Fraud Investigation', description: 'Document forgery analysis and financial discrepancy identification.', caseId: 'CASE-090', date: 'Dec 8, 2024', daysAgo: 38 },
    { title: 'Arson Investigation - Maple St', description: 'Accelerant detection and point-of-origin analysis confirming intentional fire.', caseId: 'CASE-087', date: 'Dec 1, 2024', daysAgo: 45 },
];

const FILTERS = ['All', 'Active', 'Completed'] as const;
type Filter = typeof FILTERS[number];

export default function InvestigativeCases() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [activeFilter, setActiveFilter] = useState<Filter>('All');
    const [search, setSearch] = useState('');
    const [activeCases, setActiveCases] = useState(activeCasesData);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [editTarget, setEditTarget] = useState<{ caseId: string; title: string; description: string } | null>(null);

    const getFilteredCases = useCallback(() => {
        let cases: Array<typeof activeCasesData[0] & { completed?: boolean; daysAgo?: number }> = [];

        if (activeFilter === 'Active' || activeFilter === 'All') {
            cases = [...cases, ...activeCases.map(c => ({ ...c, completed: false }))];
        }
        if (activeFilter === 'Completed' || activeFilter === 'All') {
            cases = [...cases, ...completedCasesData.map(c => ({ ...c, completed: true }))];
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
    }, [activeFilter, search, activeCases]);

    const filteredCases = getFilteredCases();
    const totalCount = activeCases.length + completedCasesData.length;

    const handleDelete = () => {
        if (deleteTarget) {
            setActiveCases(prev => prev.filter(c => c.caseId !== deleteTarget));
            setDeleteTarget(null);
        }
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
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: Spacing.md,
                    paddingVertical: 14,
                    backgroundColor: AppColors.white,
                    gap: 12,
                }}>
                    <Pressable onPress={() => router.back()} hitSlop={8}>
                        <BackIcon />
                    </Pressable>
                    <Text style={{ ...Typography.h5, color: AppColors.textPrimary, flex: 1 }}>
                        Investigative Cases
                    </Text>
                    <View style={{
                        backgroundColor: AppColors.primary + '15',
                        borderRadius: 12,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                    }}>
                        <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>
                            {totalCount}
                        </Text>
                    </View>
                </View>

                {/* Search + Filters */}
                <View style={{ paddingHorizontal: Spacing.md, paddingTop: 14, gap: 12, backgroundColor: AppColors.white, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
                    {/* Search bar */}
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#F4F4F4',
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
                                        backgroundColor: isActive ? AppColors.primary : 'transparent',
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
                <View style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.md, gap: 12 }}>
                    {filteredCases.length > 0 ? (
                        filteredCases.map(c => (
                            <CaseCard
                                key={c.caseId}
                                title={c.title}
                                description={c.description}
                                caseId={c.caseId}
                                date={c.date}
                                completed={c.completed}
                                daysAgo={c.daysAgo}
                                onPress={() => router.push({
                                    pathname: '/(doctor)/case-details',
                                    params: { caseId: c.caseId, title: c.title, description: c.description, date: c.date },
                                })}
                                onEdit={() => setEditTarget({ caseId: c.caseId, title: c.title, description: c.description })}
                                onDelete={!c.completed ? () => setDeleteTarget(c.caseId) : undefined}
                            />
                        ))
                    ) : (
                        <View style={{ alignItems: 'center', paddingTop: 60, gap: 12 }}>
                            <EmptyIcon />
                            <Text style={{ ...Typography.body, color: AppColors.border }}>
                                {search.trim() ? 'No cases match your search' : 'No cases yet'}
                            </Text>
                            <Pressable
                                onPress={() => router.push('/(doctor)/add-case')}
                                style={({ pressed }) => ({
                                    backgroundColor: pressed ? AppColors.primaryHover : AppColors.primary,
                                    borderRadius: 10,
                                    paddingHorizontal: 20,
                                    paddingVertical: 10,
                                    marginTop: 4,
                                })}
                            >
                                <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.white }}>
                                    + Add New Case
                                </Text>
                            </Pressable>
                        </View>
                    )}
                </View>
            </ScrollView>

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
                        setActiveCases(prev =>
                            prev.map(c =>
                                c.caseId === editTarget.caseId
                                    ? { ...c, title: newTitle, description: newDescription }
                                    : c
                            )
                        );
                        setEditTarget(null);
                    }
                }}
            />
        </View>
    );
}
