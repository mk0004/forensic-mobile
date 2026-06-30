import { useState } from 'react';
import { View, Text, Image, ScrollView, Pressable, Modal, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, Typography, Spacing } from '@/constants/theme';
import { EditCaseDrawer } from '@/components/edit-case-drawer';
import { DeepFakeIcon, FaceIcon, DnaIcon, ReconstructIcon, ChevronRightIcon as ChevronRightModelIcon } from '@/components/model-icons';
import {
    useCaseDetailQuery,
    useDeleteEvidenceMutation,
    useUpdateCaseMutation,
    useToggleActiveCaseMutation,
    formatCaseDate,
    caseDisplayId,
} from '@/lib/hooks/use-cases-api';
import type { Evidence } from '@/types/api';

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

function PlusIcon() {
    return (
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M12 5v14M5 12h14" stroke={AppColors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function AnalyzeIcon() {
    return (
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35" stroke={AppColors.white} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
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

function getAIInsights(analyses: AnalysisEvidence[]) {
    const insights: { text: string; type: 'info' | 'warning' | 'suggestion' }[] = [];

    if (analyses.length === 0) {
        return insights;
    }

    const hasDeepfake = analyses.some(a => a.modelType === 'deepfake');
    const hasFace = analyses.some(a => a.modelType === 'face');
    const hasDna = analyses.some(a => a.modelType === 'dna');
    const modelCount = new Set(analyses.map(a => a.modelType)).size;

    if (hasDeepfake && hasFace && !hasDna) {
        insights.push({ text: 'Deepfake and face analyses are attached. Running DNA phenotype would add a comprehensive profile.', type: 'suggestion' });
    }
    if (modelCount === 1) {
        insights.push({ text: 'Only one analysis model has been run on this case. Additional models improve case confidence.', type: 'suggestion' });
    }

    return insights.slice(0, 2);
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

type AnalysisEvidence = {
    id: string;
    name: string;
    modelType: string;
    modelName: string;
    resultSummary: string;
    date: string;
    verdict: string;
    verdictColor: string;
    mockData: unknown;
};

type UserEvidence = {
    id: string;
    name: string;
    type: string;
    date: string;
    description: string;
    imageUri: string | null;
};

const MODEL_TYPE_NAMES: Record<string, string> = {
    deepfake: 'Deep Fake Detection',
    face: 'Face Recognition',
    dna: 'DNA Phenotype Prediction',
    reconstruct: 'Reconstruct Image',
};

function asArray(value: unknown): any[] {
    return Array.isArray(value) ? value : [];
}

function summarizeResult(modelType: string, data: Record<string, unknown>): string {
    if (modelType === 'deepfake') {
        const faces = asArray(data.faces || data.results || data.predictions);
        if (faces.length === 0) {
            return 'No face detected';
        }
        const fake = faces.filter((f) => {
            const label = String(f?.label ?? f?.prediction ?? f?.result ?? '').toLowerCase();
            return label.includes('fake') || label.includes('spoof') || f?.is_real === false;
        }).length;
        const real = faces.length - fake;
        if (fake === 0) {
            return faces.length === 1 ? 'Real' : `${real} real`;
        }
        if (real === 0) {
            return faces.length === 1 ? 'Fake' : `${fake} fake`;
        }
        return `${real} real · ${fake} fake`;
    }
    if (modelType === 'face') {
        const matches = asArray(data.identities || data.matches || data.results || data.faces);
        const names = matches
            .map((m) => String(m?.person_name ?? m?.identity ?? m?.name ?? m?.label ?? '').trim())
            .filter((n) => n && !n.toLowerCase().includes('unknown'));
        if (names.length === 0) {
            return 'No match found';
        }
        if (names.length === 1) {
            return names[0];
        }
        return `${names[0]} +${names.length - 1} more`;
    }
    if (modelType === 'dna') {
        const source = data.predictions || data.results || data.phenotypes || data.traits;
        const count = Array.isArray(source)
            ? source.length
            : source && typeof source === 'object'
                ? Object.keys(source).length
                : 0;
        return count > 0 ? `${count} traits predicted` : 'Analysis complete';
    }
    if (modelType === 'reconstruct') {
        return data.restored_image || data.output || data.result ? 'Image enhanced' : 'Analysis complete';
    }
    return 'Analysis complete';
}

function normalizeModelType(modelUsed?: string): string | null {
    if (!modelUsed) {
        return null;
    }
    const value = modelUsed.toLowerCase();
    if (value.includes('deepfake') || value.includes('deep fake') || value.includes('spoof')) {
        return 'deepfake';
    }
    if (value.includes('face')) {
        return 'face';
    }
    if (value.includes('dna') || value.includes('phenotype')) {
        return 'dna';
    }
    if (value.includes('reconstruct') || value.includes('enhance')) {
        return 'reconstruct';
    }
    return null;
}

function splitEvidence(evidence: Evidence[]): { analyses: AnalysisEvidence[]; userEvidence: UserEvidence[] } {
    const analyses: AnalysisEvidence[] = [];
    const userEvidence: UserEvidence[] = [];

    for (const item of evidence) {
        const modelType = normalizeModelType(item.model_used);
        if (modelType) {
            const analysisData = (item.data ?? {}) as Record<string, unknown>;
            analyses.push({
                id: String(item.id),
                name: item.name,
                modelType,
                modelName: MODEL_TYPE_NAMES[modelType] ?? item.model_used,
                resultSummary: summarizeResult(modelType, analysisData),
                date: '',
                verdict: 'Analysis Complete',
                verdictColor: AppColors.primary,
                mockData: analysisData,
            });
        } else {
            const data = (item.data ?? {}) as Record<string, unknown>;
            userEvidence.push({
                id: String(item.id),
                name: item.name,
                type: 'Evidence',
                date: '',
                description: '',
                imageUri: typeof data.image_uri === 'string' ? data.image_uri : null,
            });
        }
    }

    return { analyses, userEvidence };
}

export default function CaseDetails() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<{ caseId: string; title: string; description: string; date: string }>();

    const caseId = params.caseId || '';
    const caseQuery = useCaseDetailQuery(caseId);
    const deleteEvidence = useDeleteEvidenceMutation();
    const updateCase = useUpdateCaseMutation();
    const toggleActiveCase = useToggleActiveCaseMutation();

    const fetchedCase = caseQuery.data;
    const evidence = splitEvidence(fetchedCase?.evidence ?? []);

    const caseTitle = fetchedCase?.name || params.title || '';
    const caseDescription = fetchedCase?.description || params.description || '';
    const caseDate = formatCaseDate(fetchedCase?.created_at) !== 'N/A'
        ? formatCaseDate(fetchedCase?.created_at)
        : (params.date || 'N/A');
    const displayCaseId = fetchedCase ? caseDisplayId(fetchedCase.id) : caseDisplayId(caseId || '000');

    const [editDrawerVisible, setEditDrawerVisible] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<UserEvidence | null>(null);

    const isCompleted = (fetchedCase?.status ?? 'active').toLowerCase() === 'completed';
    const caseStatus = isCompleted ? 'Completed' : 'Active';
    const userEvidence = evidence.userEvidence;
    const totalEvidence = evidence.analyses.length + userEvidence.length;
    const team = 'Unassigned';

    function handleAnalysisTap(analysis: AnalysisEvidence) {
        const route = MODEL_RESULTS_ROUTE[analysis.modelType];
        if (!route) return;

        const savedData = (analysis.mockData ?? {}) as Record<string, unknown>;
        const savedImageUri = typeof savedData.image_uri === 'string' ? savedData.image_uri : '';

        if (analysis.modelType === 'deepfake') {
            router.push({
                pathname: route as any,
                params: { imageUri: savedImageUri, apiData: JSON.stringify(analysis.mockData), fromCase: '1' },
            });
        } else if (analysis.modelType === 'face') {
            router.push({
                pathname: route as any,
                params: { imageUri: savedImageUri, apiData: JSON.stringify(analysis.mockData), fromCase: '1' },
            });
        } else if (analysis.modelType === 'dna') {
            router.push({
                pathname: route as any,
                params: { inputMode: 'text', dnaText: 'ATCGATCG...', fileName: '', fromCase: '1' },
            });
        } else if (analysis.modelType === 'reconstruct') {
            router.push({
                pathname: route as any,
                params: { imageUri: savedImageUri, fromCase: '1' },
            });
        }
    }

    const aiInsights = getAIInsights(evidence.analyses);

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
                    <Pressable
                        onPress={() => router.push({ pathname: '/(doctor)/ai-chat', params: { caseId: String(caseId) } })}
                        hitSlop={8}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 5,
                            height: 36,
                            paddingHorizontal: 10,
                            borderRadius: 10,
                            backgroundColor: '#1E2A5E' + '12',
                            marginRight: !isCompleted ? 8 : 0,
                        }}
                    >
                        <Ionicons name="sparkles" size={14} color="#1E2A5E" />
                        <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_600SemiBold', color: '#1E2A5E' }}>Ask AI</Text>
                    </Pressable>
                    {!isCompleted && (
                        <Pressable
                            onPress={() => setEditDrawerVisible(true)}
                            hitSlop={8}
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                backgroundColor: AppColors.primary + '10',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                                <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                            </Svg>
                        </Pressable>
                    )}
                </View>

                {caseQuery.isLoading ? (
                    <View style={{ alignItems: 'center', paddingTop: 80, gap: 12 }}>
                        <ActivityIndicator color={AppColors.primary} />
                        <Text style={{ ...Typography.bodySmall, color: '#9CA3AF' }}>Loading case…</Text>
                    </View>
                ) : caseQuery.isError ? (
                    <View style={{ alignItems: 'center', paddingTop: 80, gap: 12, paddingHorizontal: Spacing.md }}>
                        <Text selectable style={{ ...Typography.bodySmall, color: AppColors.error, textAlign: 'center' }}>
                            {caseQuery.error instanceof Error ? caseQuery.error.message : 'Failed to load case.'}
                        </Text>
                        <Pressable
                            onPress={() => caseQuery.refetch()}
                            style={({ pressed }) => ({
                                backgroundColor: pressed ? AppColors.primaryHover : AppColors.primary,
                                borderRadius: 10,
                                paddingHorizontal: 20,
                                paddingVertical: 10,
                            })}
                        >
                            <Text style={{ ...Typography.button, color: AppColors.white, fontSize: 13 }}>Retry</Text>
                        </Pressable>
                    </View>
                ) : (
                <View style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, gap: 16 }}>
                    {/* Case Info Card */}
                    <View style={{
                        backgroundColor: AppColors.white,
                        borderRadius: 16,
                        borderCurve: 'continuous',
                        padding: 18,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        gap: 14,
                    }}>
                        {/* ID + Status row */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <FolderIcon />
                                <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>
                                    {displayCaseId}
                                </Text>
                            </View>
                            <View style={{
                                backgroundColor: isCompleted ? AppColors.success + '12' : AppColors.success + '12',
                                borderRadius: 10,
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 5,
                            }}>
                                {isCompleted ? (
                                    <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
                                        <Path d="M20 6L9 17l-5-5" stroke={AppColors.success} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                                    </Svg>
                                ) : (
                                    <ActiveDotIcon />
                                )}
                                <Text style={{
                                    fontSize: 11,
                                    fontFamily: 'IBMPlexSans_600SemiBold',
                                    color: AppColors.success,
                                }}>
                                    {caseStatus}
                                </Text>
                            </View>
                        </View>

                        {/* Title */}
                        <Text style={{ fontSize: 18, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                            {caseTitle}
                        </Text>

                        {/* Description */}
                        <Text style={{ ...Typography.bodySmall, color: '#6B7280', lineHeight: 20 }}>
                            {caseDescription || 'No description provided.'}
                        </Text>

                        {/* Date + Team */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                <CalendarIcon />
                                <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>
                                    {caseDate}
                                </Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                <TeamIcon />
                                <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }} numberOfLines={1}>
                                    {team}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* AI Context Insights */}
                    {aiInsights.length > 0 && (
                        <View style={{
                            backgroundColor: AppColors.white,
                            borderRadius: 14,
                            borderWidth: 1,
                            borderColor: '#E5E7EB',
                            padding: 16,
                            gap: 12,
                        }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <View style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 8,
                                    backgroundColor: '#1E2A5E' + '12',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <Ionicons name="sparkles" size={14} color="#1E2A5E" />
                                </View>
                                <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                    AI Insights
                                </Text>
                            </View>
                            {aiInsights.map((insight, idx) => {
                                const bgColor = insight.type === 'warning' ? '#FEF3C7' : insight.type === 'info' ? '#DBEAFE' : '#F0FDF4';
                                const textColor = insight.type === 'warning' ? '#92400E' : insight.type === 'info' ? '#1E40AF' : '#166534';
                                const iconName = insight.type === 'warning' ? 'alert-circle-outline' : insight.type === 'info' ? 'information-circle-outline' : 'bulb-outline';
                                return (
                                    <View
                                        key={idx}
                                        style={{
                                            flexDirection: 'row',
                                            backgroundColor: bgColor,
                                            borderRadius: 10,
                                            padding: 12,
                                            gap: 10,
                                            alignItems: 'flex-start',
                                        }}
                                    >
                                        <Ionicons name={iconName as any} size={16} color={textColor} style={{ marginTop: 1 }} />
                                        <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_500Medium', color: textColor, flex: 1, lineHeight: 18 }}>
                                            {insight.text}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    {/* Evidence Collected Section */}
                    <View style={{ gap: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Text style={{ fontSize: 16, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                    Evidence
                                </Text>
                                <View style={{
                                    backgroundColor: AppColors.primary + '12',
                                    borderRadius: 10,
                                    paddingHorizontal: 8,
                                    paddingVertical: 2,
                                }}>
                                    <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>
                                        {totalEvidence}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Model Analyses */}
                        {evidence.analyses.length > 0 && (
                            <View style={{ gap: 8 }}>
                                <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_600SemiBold', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 }}>
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
                                                width: 38,
                                                height: 38,
                                                borderRadius: 10,
                                                backgroundColor: AppColors.primary + '0A',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}>
                                                <Icon size={18} />
                                            </View>
                                            <View style={{ flex: 1, gap: 3 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                    <Text style={{ flexShrink: 1, fontSize: 13, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }} numberOfLines={1}>
                                                        {a.name}
                                                    </Text>
                                                    <View style={{ backgroundColor: AppColors.primary + '14', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
                                                        <Text style={{ fontSize: 10, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary, letterSpacing: 0.3 }}>
                                                            AI
                                                        </Text>
                                                    </View>
                                                </View>
                                                <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: '#6B7280' }}>
                                                    {a.modelName}
                                                </Text>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                                                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: AppColors.secondary }} />
                                                    <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }} numberOfLines={1}>
                                                        {a.resultSummary}
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
                                <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_600SemiBold', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 }}>
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
                                        {e.imageUri ? (
                                            <Image
                                                source={{ uri: e.imageUri }}
                                                style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: '#F3F4F6' }}
                                            />
                                        ) : (
                                            <View style={{
                                                width: 38,
                                                height: 38,
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
                                        )}
                                        <View style={{ flex: 1, gap: 2 }}>
                                            <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }} numberOfLines={1}>
                                                {e.name}
                                            </Text>
                                            <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }} numberOfLines={1}>
                                                {e.type} · {e.date}
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
                                padding: 28,
                                alignItems: 'center',
                                gap: 8,
                            }}>
                                <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
                                    <Path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" stroke="#D1D5DB" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
                                </Svg>
                                <Text style={{ ...Typography.bodySmall, color: '#9CA3AF', marginTop: 4 }}>
                                    No evidence collected yet
                                </Text>
                                <Text style={{ ...Typography.caption, color: '#D1D5DB', textAlign: 'center' }}>
                                    Run an analysis or upload evidence to get started
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Action buttons */}
                    <View style={{ gap: 10, marginTop: 4 }}>
                        {/* Row 1: Add Evidence + Analyze Case */}
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <Pressable
                                onPress={() => router.push({ pathname: '/(doctor)/upload-evidence' as any, params: { caseId } })}
                                style={({ pressed }) => ({
                                    flex: 1,
                                    flexDirection: 'row',
                                    backgroundColor: pressed ? AppColors.primary + '08' : AppColors.white,
                                    borderRadius: 12,
                                    height: 48,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8,
                                    borderWidth: 1.5,
                                    borderColor: AppColors.primary,
                                })}
                            >
                                <PlusIcon />
                                <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>
                                    Add Evidence
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={() => router.push({ pathname: '/(doctor)/analysis-models' as any })}
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
                                <AnalyzeIcon />
                                <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.white }}>
                                    Analyze Case
                                </Text>
                            </Pressable>
                        </View>
                        {/* Edit Case */}
                        {!isCompleted && (
                            <Pressable
                                onPress={() => {
                                    if (fetchedCase) {
                                        toggleActiveCase.mutate(fetchedCase.id);
                                    }
                                }}
                                disabled={toggleActiveCase.isPending || !fetchedCase}
                                style={({ pressed }) => ({
                                    flexDirection: 'row',
                                    backgroundColor: pressed ? '#15803d' : AppColors.success,
                                    borderRadius: 12,
                                    height: 48,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8,
                                    opacity: toggleActiveCase.isPending ? 0.7 : 1,
                                })}
                            >
                                {toggleActiveCase.isPending ? (
                                    <ActivityIndicator color={AppColors.white} />
                                ) : (
                                    <>
                                        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                                            <Path d="M20 6L9 17l-5-5" stroke={AppColors.white} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                        </Svg>
                                        <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.white }}>
                                            Mark as Complete
                                        </Text>
                                    </>
                                )}
                            </Pressable>
                        )}
                    </View>
                </View>
                )}
            </ScrollView>

            <EditCaseDrawer
                visible={editDrawerVisible}
                onClose={() => setEditDrawerVisible(false)}
                caseTitle={caseTitle}
                caseDescription={caseDescription}
                onSave={(newTitle, newDescription) => {
                    if (fetchedCase) {
                        updateCase.mutate(
                            { id: fetchedCase.id, name: newTitle, description: newDescription },
                            { onSettled: () => setEditDrawerVisible(false) }
                        );
                    } else {
                        setEditDrawerVisible(false);
                    }
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
                                    if (deleteTarget && fetchedCase) {
                                        deleteEvidence.mutate(
                                            { evidenceId: deleteTarget.id, caseId: fetchedCase.id },
                                            { onSettled: () => setDeleteTarget(null) }
                                        );
                                    } else {
                                        setDeleteTarget(null);
                                    }
                                }}
                                disabled={deleteEvidence.isPending}
                                style={({ pressed }) => ({
                                    flex: 1,
                                    height: 44,
                                    borderRadius: 12,
                                    backgroundColor: pressed ? '#DC2626' : '#EF4444',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    opacity: deleteEvidence.isPending ? 0.7 : 1,
                                })}
                            >
                                {deleteEvidence.isPending ? (
                                    <ActivityIndicator color={AppColors.white} />
                                ) : (
                                    <Text style={{ ...Typography.button, color: AppColors.white }}>Delete</Text>
                                )}
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
