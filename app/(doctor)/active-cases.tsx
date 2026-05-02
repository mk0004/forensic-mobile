import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { AppColors, Typography, Spacing } from '@/constants/theme';
import { CaseCard } from '@/components/ui/case-card';

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

function EmptyIcon() {
    return (
        <Svg width={64} height={64} viewBox="0 0 24 24" fill="none">
            <Path
                d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"
                stroke="#D1D5DB"
                strokeWidth={1.2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

const initialCases = [
    { title: 'Suspicious Fire Investigation', description: 'Analysis of fire origin and cause determination at the warehouse district.', caseId: 'CASE-001', date: 'Jan 15, 2025' },
    { title: 'Vehicle Theft Ring', description: 'Multi-county vehicle theft operation involving forged documents and VIN tampering.', caseId: 'CASE-002', date: 'Jan 12, 2025' },
    { title: 'Cyber Fraud Analysis', description: 'Digital forensic examination of financial transactions linked to phishing.', caseId: 'CASE-003', date: 'Jan 10, 2025' },
    { title: 'Homicide - Cold Case Review', description: 'Re-examination of physical evidence using updated DNA analysis techniques.', caseId: 'CASE-004', date: 'Jan 8, 2025' },
    { title: 'Narcotics Lab Evidence', description: 'Chemical analysis and documentation of seized substances and equipment.', caseId: 'CASE-005', date: 'Jan 5, 2025' },
];

export default function ActiveCases() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [cases, setCases] = useState(initialCases);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

    const handleDelete = () => {
        if (deleteTarget) {
            setCases(prev => prev.filter(c => c.caseId !== deleteTarget));
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
                        Active Cases
                    </Text>
                    <View
                        style={{
                            backgroundColor: AppColors.primary + '15',
                            borderRadius: 12,
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                        }}
                    >
                        <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>
                            {cases.length}
                        </Text>
                    </View>
                </View>

                <View style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.md, gap: 12 }}>
                    {cases.length > 0 ? (
                        cases.map((c) => (
                            <CaseCard
                                key={c.caseId}
                                title={c.title}
                                description={c.description}
                                caseId={c.caseId}
                                date={c.date}
                                onEdit={() => router.push({ pathname: '/(doctor)/case-details', params: { caseId: c.caseId, title: c.title, description: c.description, date: c.date } })}
                                onDelete={() => setDeleteTarget(c.caseId)}
                            />
                        ))
                    ) : (
                        <View style={{ alignItems: 'center', paddingTop: 60, gap: 12 }}>
                            <EmptyIcon />
                            <Text style={{ ...Typography.bodySmall, color: AppColors.border }}>No active cases yet</Text>
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
                                <Text style={{ ...Typography.button, color: AppColors.white, fontSize: 13 }}>+ Add New Case</Text>
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
                        <Text style={{ fontSize: 18, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.textPrimary, textAlign: 'center' }}>Delete Case?</Text>
                        <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_400Regular', color: '#6B7280', textAlign: 'center', lineHeight: 20 }}>Are you sure you want to delete this case? This action cannot be undone.</Text>
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
        </View>
    );
}
