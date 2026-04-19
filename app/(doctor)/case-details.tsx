import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { AppColors, Typography, Spacing } from '@/constants/theme';
import { EditCaseDrawer } from '@/components/edit-case-drawer';
import { DeepFakeIcon, FaceIcon, DnaIcon, ReconstructIcon, ChevronRightIcon as ChevronRightModelIcon } from '@/components/model-icons';

/* ─── Icons ─── */
function BackIcon() {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M19 12H5M12 19l-7-7 7-7" stroke={AppColors.textPrimary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function CalendarIcon() {
    return (
        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Path d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18" stroke="#9CA3AF" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function FolderIcon() {
    return (
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function EditIcon() {
    return (
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={AppColors.white} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function ChevronIcon() {
    return (
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M9 18l6-6-6-6" stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function TrashIcon() {
    return (
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke="#EF4444" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function TeamIcon() {
    return (
        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="#9CA3AF" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

const MODEL_ICON_MAP: Record<string, React.FC<{ size?: number }>> = {
    deepfake: DeepFakeIcon,
    face: FaceIcon,
    dna: DnaIcon,
    reconstruct: ReconstructIcon,
};

const MODEL_RESULTS_ROUTE: Record<string, string> = {
    deepfake: '/(doctor)/results-deepfake',
    face: '/(doctor)/results-face-recognition',
    dna: '/(doctor)/results-dna',
    reconstruct: '/(doctor)/results-reconstruct',
};

/* ─── Mock evidence data per case ─── */
type AnalysisEvidence = {
    id: string;
    modelType: string;
    modelName: string;
    date: string;
    verdict: string;
    verdictColor: string;
    mockData: any;
};

type UserEvidence = {
    id: string;
    name: string;
    type: string;
    date: string;
    description: string;
};

type CaseEvidence = {
    analyses: AnalysisEvidence[];
    userEvidence: UserEvidence[];
};

const CASE_EVIDENCE: Record<string, CaseEvidence> = {
    'CASE-001': {
        analyses: [
            {
                id: 'a1',
                modelType: 'deepfake',
                modelName: 'Deep Fake Detection',
                date: 'Jan 15, 2025',
                verdict: 'REAL — 94.2%',
                verdictColor: AppColors.success,
                mockData: {
                    results: [{
                        is_real: true,
                        antispoof_score: 0.942,
                        facial_area: { x: 120, y: 80, w: 200, h: 250 },
                    }],
                },
            },
        ],
        userEvidence: [
            { id: 'u1', name: 'suspect_photo_01.jpg', type: 'Image', date: 'Jan 14, 2025', description: 'Photograph from surveillance camera at warehouse entrance' },
        ],
    },
    'CASE-002': {
        analyses: [
            {
                id: 'a2',
                modelType: 'face',
                modelName: 'Face Recognition',
                date: 'Jan 12, 2025',
                verdict: 'Match Found — 87.3%',
                verdictColor: AppColors.success,
                mockData: {
                    results: [{
                        identity: 'db/john_doe.jpg',
                        distance: 0.127,
                        threshold: 0.4,
                        verified: true,
                        facial_area: { x: 100, y: 60, w: 180, h: 220 },
                        model: 'ArcFace',
                        detector_backend: 'retinaface',
                    }],
                },
            },
        ],
        userEvidence: [
            { id: 'u2', name: 'forged_registration.pdf', type: 'Document', date: 'Jan 11, 2025', description: 'Suspected forged vehicle registration document' },
        ],
    },
    'CASE-003': {
        analyses: [
            {
                id: 'a3',
                modelType: 'dna',
                modelName: 'DNA Phenotype Prediction',
                date: 'Jan 10, 2025',
                verdict: 'Analysis Complete',
                verdictColor: AppColors.primary,
                mockData: {},
            },
            {
                id: 'a4',
                modelType: 'deepfake',
                modelName: 'Deep Fake Detection',
                date: 'Jan 9, 2025',
                verdict: 'FAKE — 23.1%',
                verdictColor: AppColors.error,
                mockData: {
                    results: [{
                        is_real: false,
                        antispoof_score: 0.231,
                        facial_area: { x: 95, y: 70, w: 190, h: 230 },
                    }],
                },
            },
        ],
        userEvidence: [],
    },
    'CASE-004': {
        analyses: [
            {
                id: 'a5',
                modelType: 'dna',
                modelName: 'DNA Phenotype Prediction',
                date: 'Jan 8, 2025',
                verdict: 'Analysis Complete',
                verdictColor: AppColors.primary,
                mockData: {},
            },
            {
                id: 'a6',
                modelType: 'dna',
                modelName: 'DNA Phenotype Prediction',
                date: 'Jan 7, 2025',
                verdict: 'Analysis Complete',
                verdictColor: AppColors.primary,
                mockData: {},
            },
            {
                id: 'a7',
                modelType: 'face',
                modelName: 'Face Recognition',
                date: 'Jan 6, 2025',
                verdict: 'No Match — 34.5%',
                verdictColor: '#F59E0B',
                mockData: {
                    results: [{
                        identity: 'unknown',
                        distance: 0.655,
                        threshold: 0.4,
                        verified: false,
                        facial_area: { x: 110, y: 75, w: 170, h: 210 },
                        model: 'ArcFace',
                        detector_backend: 'retinaface',
                    }],
                },
            },
        ],
        userEvidence: [],
    },
    'CASE-005': {
        analyses: [
            {
                id: 'a8',
                modelType: 'reconstruct',
                modelName: 'Reconstruct Image',
                date: 'Jan 5, 2025',
                verdict: 'Enhanced — 4x',
                verdictColor: AppColors.secondary,
                mockData: {},
            },
        ],
        userEvidence: [
            { id: 'u3', name: 'lab_samples_report.pdf', type: 'Document', date: 'Jan 4, 2025', description: 'Chemical analysis report of seized substances' },
        ],
    },
};

const CASE_META: Record<string, { team: string; status: string }> = {
    'CASE-001': { team: 'Dr. Smith, Det. Johnson', status: 'Active' },
    'CASE-002': { team: 'Dr. Martinez, Det. Lee', status: 'Active' },
    'CASE-003': { team: 'Dr. Chen, Det. Williams', status: 'Active' },
    'CASE-004': { team: 'Dr. Patel, Det. Brown', status: 'Active' },
    'CASE-005': { team: 'Dr. Kim, Det. Davis', status: 'Active' },
    'CASE-098': { team: 'Dr. Smith, Det. Johnson', status: 'Completed' },
    'CASE-095': { team: 'Dr. Martinez, Det. Lee', status: 'Completed' },
    'CASE-090': { team: 'Dr. Chen, Det. Williams', status: 'Completed' },
    'CASE-087': { team: 'Dr. Patel, Det. Brown', status: 'Completed' },
};

export default function CaseDetails() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<{ caseId: string; title: string; description: string; date: string }>();

    const caseId = params.caseId || 'CASE-000';
    const evidence = CASE_EVIDENCE[caseId] || { analyses: [], userEvidence: [] };
    const meta = CASE_META[caseId] || { team: 'Unassigned', status: 'Active' };

    const [caseTitle, setCaseTitle] = useState(params.title || '');
    const [caseDescription, setCaseDescription] = useState(params.description || '');
    const [editDrawerVisible, setEditDrawerVisible] = useState(false);
    const [caseStatus, setCaseStatus] = useState(meta.status);
    const [userEvidence, setUserEvidence] = useState(evidence.userEvidence);
    const [deleteTarget, setDeleteTarget] = useState<UserEvidence | null>(null);
    const totalEvidence = evidence.analyses.length + userEvidence.length;
    const isCompleted = caseStatus === 'Completed';

    function handleAnalysisTap(analysis: AnalysisEvidence) {
        const route = MODEL_RESULTS_ROUTE[analysis.modelType];
        if (!route) return;

        if (analysis.modelType === 'deepfake') {
            router.push({
                pathname: route as any,
                params: { imageUri: '', apiData: JSON.stringify(analysis.mockData) },
            });
        } else if (analysis.modelType === 'face') {
            router.push({
                pathname: route as any,
                params: { imageUri: '', apiData: JSON.stringify(analysis.mockData) },
            });
        } else if (analysis.modelType === 'dna') {
            router.push({
                pathname: route as any,
                params: { inputMode: 'text', dnaText: 'ATCGATCG...', fileName: '' },
            });
        } else if (analysis.modelType === 'reconstruct') {
            router.push({
                pathname: route as any,
                params: { imageUri: '' },
            });
        }
    }

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
                        borderBottomWidth: 1,
                        borderBottomColor: '#F3F4F6',
                    }}
                >
                    <Pressable onPress={() => router.back()} hitSlop={8}>
                        <BackIcon />
                    </Pressable>
                    <Text style={{ ...Typography.h5, color: AppColors.textPrimary, flex: 1 }}>
                        Case Details
                    </Text>
                </View>

                <View style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, gap: 16 }}>
                    {/* Case Info Card */}
                    <View style={{
                        backgroundColor: AppColors.white,
                        borderRadius: 16,
                        borderCurve: 'continuous',
                        padding: 18,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        gap: 12,
                    }}>
                        {/* ID + Status row */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <FolderIcon />
                                <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>
                                    {caseId}
                                </Text>
                            </View>
                            <View style={{
                                backgroundColor: isCompleted ? AppColors.success + '15' : AppColors.success + '15',
                                borderRadius: 12,
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 4,
                            }}>
                                {isCompleted && (
                                    <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
                                        <Path d="M20 6L9 17l-5-5" stroke={AppColors.success} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                                    </Svg>
                                )}
                                <Text style={{
                                    fontSize: 11,
                                    fontFamily: 'IBMPlexSans_600SemiBold',
                                    color: isCompleted ? AppColors.success : AppColors.success,
                                }}>
                                    {caseStatus}
                                </Text>
                            </View>
                        </View>

                        {/* Title */}
                        <Text style={{ ...Typography.h5, color: AppColors.textPrimary }}>
                            {caseTitle}
                        </Text>

                        {/* Description */}
                        <Text style={{ ...Typography.bodySmall, color: '#6B7280', lineHeight: 20 }}>
                            {caseDescription || 'No description provided.'}
                        </Text>

                        {/* Date + Team */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <CalendarIcon />
                                <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>
                                    {params.date || 'N/A'}
                                </Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <TeamIcon />
                                <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }} numberOfLines={1}>
                                    {meta.team}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Evidence Collected Section */}
                    <View style={{ gap: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Text style={{ ...Typography.h5, color: AppColors.textPrimary }}>
                                Evidence Collected
                            </Text>
                            <View style={{
                                backgroundColor: AppColors.primary + '15',
                                borderRadius: 10,
                                paddingHorizontal: 8,
                                paddingVertical: 2,
                            }}>
                                <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>
                                    {totalEvidence}
                                </Text>
                            </View>
                        </View>

                        {/* Model Analyses */}
                        {evidence.analyses.length > 0 && (
                            <View style={{ gap: 8 }}>
                                <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_600SemiBold', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    Model Analyses
                                </Text>
                                {evidence.analyses.map((a) => {
                                    const Icon = MODEL_ICON_MAP[a.modelType] || DeepFakeIcon;
                                    return (
                                        <Pressable
                                            key={a.id}
                                            onPress={() => handleAnalysisTap(a)}
                                            style={({ pressed }) => ({
                                                backgroundColor: pressed ? '#F8FAFC' : AppColors.white,
                                                borderRadius: 12,
                                                borderWidth: 1,
                                                borderColor: '#E5E7EB',
                                                padding: 14,
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                gap: 12,
                                            })}
                                        >
                                            <View style={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: 10,
                                                backgroundColor: AppColors.primary + '10',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}>
                                                <Icon size={18} />
                                            </View>
                                            <View style={{ flex: 1, gap: 2 }}>
                                                <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                                    {a.modelName}
                                                </Text>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                    <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_500Medium', color: a.verdictColor }}>
                                                        {a.verdict}
                                                    </Text>
                                                    <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>
                                                        {a.date}
                                                    </Text>
                                                </View>
                                            </View>
                                            <ChevronRightModelIcon size={16} />
                                        </Pressable>
                                    );
                                })}
                            </View>
                        )}

                        {/* User Evidence */}
                        {userEvidence.length > 0 && (
                            <View style={{ gap: 8 }}>
                                <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_600SemiBold', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    Uploaded Evidence
                                </Text>
                                {userEvidence.map((e) => (
                                    <View
                                        key={e.id}
                                        style={{
                                            backgroundColor: AppColors.white,
                                            borderRadius: 12,
                                            borderWidth: 1,
                                            borderColor: '#E5E7EB',
                                            padding: 14,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            gap: 12,
                                        }}
                                    >
                                        <View style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 10,
                                            backgroundColor: '#F3F4F6',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                                                <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#6B7280" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                                                <Path d="M14 2v6h6" stroke="#6B7280" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                                            </Svg>
                                        </View>
                                        <View style={{ flex: 1, gap: 2 }}>
                                            <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }} numberOfLines={1}>
                                                {e.name}
                                            </Text>
                                            <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }} numberOfLines={1}>
                                                {e.type} • {e.date}
                                            </Text>
                                            <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_400Regular', color: '#6B7280', marginTop: 2 }} numberOfLines={2}>
                                                {e.description}
                                            </Text>
                                        </View>
                                        <Pressable
                                            onPress={() => setDeleteTarget(e)}
                                            hitSlop={8}
                                            style={({ pressed }) => ({
                                                width: 32,
                                                height: 32,
                                                borderRadius: 8,
                                                backgroundColor: pressed ? '#FEE2E2' : '#FEF2F2',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            })}
                                        >
                                            <TrashIcon />
                                        </Pressable>
                                    </View>
                                ))}
                            </View>
                        )}

                        {totalEvidence === 0 && (
                            <View style={{
                                backgroundColor: AppColors.white,
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: '#E5E7EB',
                                padding: 24,
                                alignItems: 'center',
                                gap: 8,
                            }}>
                                <Text style={{ ...Typography.bodySmall, color: '#9CA3AF' }}>
                                    No evidence collected yet
                                </Text>
                                <Text style={{ ...Typography.caption, color: '#D1D5DB', textAlign: 'center' }}>
                                    Run an analysis or upload evidence to add it to this case
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Action buttons */}
                    <View style={{ gap: 10, marginTop: 8 }}>
                        {/* Row 1: Add Evidence + Edit Case */}
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <Pressable
                                onPress={() => router.push({ pathname: '/(doctor)/upload-evidence' as any, params: { caseId } })}
                                style={({ pressed }) => ({
                                    flex: 1,
                                    flexDirection: 'row',
                                    backgroundColor: pressed ? '#F0F4FF' : AppColors.white,
                                    borderRadius: 12,
                                    height: 48,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8,
                                    borderWidth: 1.5,
                                    borderColor: AppColors.primary,
                                })}
                            >
                                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                                    <Path d="M12 5v14M5 12h14" stroke={AppColors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                </Svg>
                                <Text style={{ ...Typography.button, color: AppColors.primary }}>Add Evidence</Text>
                            </Pressable>
                            <Pressable
                                onPress={() => setEditDrawerVisible(true)}
                                style={({ pressed }) => ({
                                    flex: 1,
                                    flexDirection: 'row',
                                    backgroundColor: pressed ? AppColors.primaryHover : AppColors.primary,
                                    borderRadius: 12,
                                    height: 48,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8,
                                })}
                            >
                                <EditIcon />
                                <Text style={{ ...Typography.button, color: AppColors.white }}>Edit Case</Text>
                            </Pressable>
                        </View>
                        {/* Mark as Complete */}
                        {!isCompleted && (
                            <Pressable
                                onPress={() => setCaseStatus('Completed')}
                                style={({ pressed }) => ({
                                    flexDirection: 'row',
                                    backgroundColor: pressed ? '#15803d' : AppColors.success,
                                    borderRadius: 12,
                                    height: 48,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8,
                                })}
                            >
                                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                                    <Path d="M20 6L9 17l-5-5" stroke={AppColors.white} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                </Svg>
                                <Text style={{ ...Typography.button, color: AppColors.white }}>Mark as Complete</Text>
                            </Pressable>
                        )}
                    </View>
                </View>
            </ScrollView>

            <EditCaseDrawer
                visible={editDrawerVisible}
                onClose={() => setEditDrawerVisible(false)}
                caseTitle={caseTitle}
                caseDescription={caseDescription}
                onSave={(newTitle, newDescription) => {
                    setCaseTitle(newTitle);
                    setCaseDescription(newDescription);
                    setEditDrawerVisible(false);
                }}
            />

            {/* Delete Evidence Confirmation Modal */}
            <Modal visible={!!deleteTarget} transparent animationType="fade">
                <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 32,
                }}>
                    <View style={{
                        backgroundColor: AppColors.white,
                        borderRadius: 20,
                        borderCurve: 'continuous',
                        padding: 24,
                        width: '100%',
                        maxWidth: 340,
                        gap: 16,
                    }}>
                        <View style={{
                            width: 48,
                            height: 48,
                            borderRadius: 14,
                            backgroundColor: '#FEF2F2',
                            alignItems: 'center',
                            justifyContent: 'center',
                            alignSelf: 'center',
                        }}>
                            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                                <Path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke="#EF4444" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                            </Svg>
                        </View>
                        <Text style={{ ...Typography.h5, color: AppColors.textPrimary, textAlign: 'center' }}>
                            Delete Evidence
                        </Text>
                        <Text style={{ ...Typography.bodySmall, color: '#6B7280', textAlign: 'center', lineHeight: 20 }}>
                            Are you sure you want to delete{' '}
                            <Text style={{ fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                {deleteTarget?.name}
                            </Text>
                            ? This action cannot be undone.
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                            <Pressable
                                onPress={() => setDeleteTarget(null)}
                                style={({ pressed }) => ({
                                    flex: 1,
                                    height: 44,
                                    borderRadius: 12,
                                    backgroundColor: pressed ? '#F3F4F6' : AppColors.white,
                                    borderWidth: 1.5,
                                    borderColor: '#E5E7EB',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                })}
                            >
                                <Text style={{ ...Typography.button, color: AppColors.textPrimary }}>Cancel</Text>
                            </Pressable>
                            <Pressable
                                onPress={() => {
                                    if (deleteTarget) {
                                        setUserEvidence((prev) => prev.filter((e) => e.id !== deleteTarget.id));
                                    }
                                    setDeleteTarget(null);
                                }}
                                style={({ pressed }) => ({
                                    flex: 1,
                                    height: 44,
                                    borderRadius: 12,
                                    backgroundColor: pressed ? '#DC2626' : '#EF4444',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                })}
                            >
                                <Text style={{ ...Typography.button, color: AppColors.white }}>Delete</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
