import { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { AppColors, Typography, Spacing } from '@/constants/theme';
import { AddToCaseModal } from '@/components/add-to-case-modal';

/* ─── Icons ─── */
function BackIcon() {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M19 12H5M12 19l-7-7 7-7" stroke={AppColors.textPrimary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function DownloadIcon() {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke={AppColors.white} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function FolderIcon() {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" stroke={AppColors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function DnaIcon() {
    return (
        <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
            <Path d="M12 2C7 2 3 6 3 11c0 2.5 1 4.8 2.7 6.5L12 22l6.3-4.5C20 15.8 21 13.5 21 11c0-5-4-9-9-9z" stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M9 10h6M9 14h6" stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" />
        </Svg>
    );
}

/* ─── Trait colors ─── */
const TRAIT_COLORS: Record<string, string> = {
    blue: '#3B82F6',
    green: '#22C55E',
    brown: '#92400E',
    hazel: '#A16207',
    black: '#1F2937',
    red: '#DC2626',
    blonde: '#EAB308',
    light: '#F5D0A9',
    medium: '#D4A574',
    dark: '#8B5E3C',
    european: AppColors.primary,
    african: '#7C3AED',
    asian: '#F59E0B',
    mixed: '#06B6D4',
    straight: '#3B82F6',
    wavy: '#8B5CF6',
    curly: '#D97706',
};

function getTraitColor(value: string): string {
    if (!value) return AppColors.secondary;
    const lower = value.toLowerCase();
    for (const [key, color] of Object.entries(TRAIT_COLORS)) {
        if (lower.includes(key)) return color;
    }
    return AppColors.secondary;
}

function getTraitIcon(trait: string): string {
    const lower = trait.toLowerCase();
    if (lower.includes('eye')) return '👁️';
    if (lower.includes('hair')) return '💇';
    if (lower.includes('skin')) return '✋';
    if (lower.includes('ancestry')) return '🌍';
    if (lower.includes('freckle')) return '•';
    return '🧬';
}

type PhenotypePrediction = {
    trait: string;
    value: string;
    confidence: number | null;
};

const TRAIT_LABELS: Record<string, string> = {
    eye_color: 'Eye Color',
    hair_color: 'Hair Color',
    skin_pigmentation: 'Skin Pigmentation',
    skin_tone: 'Skin Tone',
    skin: 'Skin Pigmentation',
    ancestry: 'Ancestry',
    hair_type: 'Hair Type',
    hair: 'Hair Type',
    freckling: 'Freckling',
    freckles: 'Freckling',
    iris_color: 'Eye Color',
    skin_color: 'Skin Color',
    height: 'Height',
};

const NON_TRAIT_KEYS = new Set([
    'panel',
    'sequence',
    'file',
    'snps',
    'raw_snps',
    'warnings',
    'message',
    'status',
]);

function formatTraitName(key: string) {
    return TRAIT_LABELS[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function normalizeConfidence(value: unknown) {
    if (typeof value !== 'number' || Number.isNaN(value)) return null;
    return value <= 1 ? value * 100 : value;
}

function getTopProbability(value: any) {
    if (!value || typeof value !== 'object') return null;
    const top = Object.entries(value)
        .filter(([, score]) => typeof score === 'number')
        .sort((a, b) => (b[1] as number) - (a[1] as number))[0];

    return top ? { label: top[0], confidence: normalizeConfidence(top[1]) } : null;
}

function normalizePrediction(item: any, fallbackTrait = 'Unknown'): PhenotypePrediction {
    const trait = item?.trait || item?.phenotype || item?.characteristic || item?.name || fallbackTrait;
    const topProbability = getTopProbability(item);
    const rawValue = item?.value ?? item?.prediction ?? item?.result ?? item?.label ?? item?.call ?? topProbability?.label ?? 'Unknown';
    const confidence = normalizeConfidence(item?.confidence ?? item?.probability ?? item?.score) ?? topProbability?.confidence ?? null;

    return {
        trait: formatTraitName(String(trait)),
        value: typeof rawValue === 'string' ? rawValue : JSON.stringify(rawValue),
        confidence,
    };
}

export default function ResultsDnaScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { inputMode, dnaText, fileName, apiData, errorData } = useLocalSearchParams<{
        inputMode: string;
        dnaText: string;
        fileName: string;
        apiData: string;
        errorData: string;
    }>();
    const [caseModalVisible, setCaseModalVisible] = useState(false);
    const [showSequence, setShowSequence] = useState(false);

    const seqLength = dnaText ? dnaText.length : 0;
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    // Parse API response
    const parsed = useMemo(() => {
        try {
            const raw = JSON.parse(apiData || '{}');
            const predictionSource = raw.predictions || raw.results || raw.phenotypes || raw.traits;
            
            if (Array.isArray(predictionSource)) {
                return {
                    predictions: predictionSource.map((p: any) => normalizePrediction(p)),
                    raw,
                };
            }
            
            if (predictionSource && typeof predictionSource === 'object') {
                const nested = Object.entries(predictionSource).map(([key, value]) => {
                    if (value && typeof value === 'object') {
                        return normalizePrediction(value, formatTraitName(key));
                    }
                    return {
                        trait: formatTraitName(key),
                        value: String(value),
                        confidence: null,
                    };
                });
                return { predictions: nested, raw };
            }
            
            const flatPredictions: PhenotypePrediction[] = [];
            
            for (const [key, value] of Object.entries(raw)) {
                if (NON_TRAIT_KEYS.has(key)) continue;
                const traitName = formatTraitName(key);
                if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                    flatPredictions.push({ trait: traitName, value: String(value), confidence: null });
                } else if (typeof value === 'object' && value !== null) {
                    flatPredictions.push(normalizePrediction(value, traitName));
                }
            }
            
            return { predictions: flatPredictions, raw };
        } catch {
            return { predictions: [] as PhenotypePrediction[], raw: {} };
        }
    }, [apiData]);

    const predictions = parsed.predictions;
    const hasPredictions = predictions.length > 0;

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
                    borderBottomWidth: 1,
                    borderBottomColor: '#F3F4F6',
                }}>
                    <Pressable onPress={() => router.back()} hitSlop={8}>
                        <BackIcon />
                    </Pressable>
                    <View style={{ flex: 1, gap: 2 }}>
                        <Text style={{ ...Typography.h5, color: AppColors.textPrimary }}>
                            DNA Analysis Results
                        </Text>
                        <View style={{
                            backgroundColor: '#EEF2FF',
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 6,
                            alignSelf: 'flex-start',
                        }}>
                            <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>
                                DNA Phenotyping
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={{ padding: Spacing.md, gap: 16 }}>
                    {/* Error State */}
                    {errorData ? (
                        <View style={{
                            backgroundColor: '#FEF2F2',
                            borderRadius: 16,
                            padding: 20,
                            borderWidth: 1,
                            borderColor: '#FECACA',
                            gap: 12,
                            alignItems: 'center',
                        }}>
                            <View style={{
                                width: 56,
                                height: 56,
                                borderRadius: 28,
                                backgroundColor: '#FEE2E2',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                                    <Circle cx={12} cy={12} r={10} stroke={AppColors.error} strokeWidth={2} />
                                    <Path d="M15 9l-6 6M9 9l6 6" stroke={AppColors.error} strokeWidth={2} strokeLinecap="round" />
                                </Svg>
                            </View>
                            <Text style={{ ...Typography.bodyLarge, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.error, textAlign: 'center' }}>
                                Analysis Failed
                            </Text>
                            <Text style={{ ...Typography.bodySmall, color: '#991B1B', textAlign: 'center', lineHeight: 20 }}>
                                {errorData}
                            </Text>
                            <Pressable
                                onPress={() => router.back()}
                                style={({ pressed }) => ({
                                    backgroundColor: pressed ? '#DC2626' : AppColors.error,
                                    borderRadius: 12,
                                    paddingVertical: 12,
                                    paddingHorizontal: 24,
                                    marginTop: 4,
                                })}
                            >
                                <Text style={{ ...Typography.button, color: AppColors.white }}>
                                    Try Again
                                </Text>
                            </Pressable>
                        </View>
                    ) : (
                        <>
                            {/* Sample Info Card */}
                            <View style={{
                                backgroundColor: AppColors.white,
                                borderRadius: 16,
                                padding: 16,
                                borderWidth: 1,
                                borderColor: '#E5E7EB',
                                gap: 10,
                            }}>
                                <Text style={{ ...Typography.bodyLarge, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                    Sample Information
                                </Text>
                                <View style={{ gap: 8 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Text style={{ ...Typography.caption, color: '#6B7280' }}>Input Method</Text>
                                        <Text style={{ ...Typography.caption, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                            {inputMode === 'text' ? 'Text Input' : 'File Upload'}
                                        </Text>
                                    </View>
                                    {inputMode === 'text' && seqLength > 0 && (
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Text style={{ ...Typography.caption, color: '#6B7280' }}>Sequence Length</Text>
                                            <Text style={{ ...Typography.caption, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                                {seqLength.toLocaleString()} bases
                                            </Text>
                                        </View>
                                    )}
                                    {inputMode === 'file' && fileName && (
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Text style={{ ...Typography.caption, color: '#6B7280' }}>File Name</Text>
                                            <Text style={{ ...Typography.caption, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }} numberOfLines={1}>
                                                {fileName}
                                            </Text>
                                        </View>
                                    )}
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Text style={{ ...Typography.caption, color: '#6B7280' }}>Submission Date</Text>
                                        <Text style={{ ...Typography.caption, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                            {today}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Phenotype Predictions */}
                            {hasPredictions ? (
                                <View style={{
                                    backgroundColor: AppColors.white,
                                    borderRadius: 16,
                                    padding: 16,
                                    borderWidth: 1,
                                    borderColor: '#E5E7EB',
                                    gap: 14,
                                }}>
                                    <Text style={{ ...Typography.bodyLarge, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                        Phenotype Predictions
                                    </Text>

                                    {predictions.map((pred, idx) => {
                                        const barColor = getTraitColor(pred.value);
                                        const hasConfidence = pred.confidence !== null && pred.confidence !== undefined;
                                        const confidence = pred.confidence ?? 0;
                                        return (
                                            <View key={idx} style={{ gap: 6 }}>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                        <Text style={{ fontSize: 16 }}>{getTraitIcon(pred.trait)}</Text>
                                                        <Text style={{ ...Typography.bodySmall, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.textPrimary }}>
                                                            {pred.trait}
                                                        </Text>
                                                    </View>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                        <View style={{
                                                            width: 12,
                                                            height: 12,
                                                            borderRadius: 6,
                                                            backgroundColor: barColor,
                                                        }} />
                                                        <Text style={{ ...Typography.bodySmall, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                                            {pred.value}
                                                        </Text>
                                                    </View>
                                                </View>

                                                {hasConfidence && (
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                        <View style={{ flex: 1, height: 10, borderRadius: 5, backgroundColor: '#F3F4F6' }}>
                                                            <View style={{
                                                                height: 10,
                                                                borderRadius: 5,
                                                                backgroundColor: barColor,
                                                                width: `${Math.min(100, Math.max(0, confidence))}%`,
                                                            }} />
                                                        </View>
                                                        <Text style={{
                                                            fontSize: 13,
                                                            fontFamily: 'IBMPlexSans_700Bold',
                                                            color: barColor,
                                                            minWidth: 40,
                                                            textAlign: 'right',
                                                        }}>
                                                            {confidence.toFixed(1)}%
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                        );
                                    })}
                                </View>
                            ) : apiData ? (
                                <View style={{
                                    backgroundColor: AppColors.white,
                                    borderRadius: 16,
                                    padding: 24,
                                    borderWidth: 1,
                                    borderColor: '#E5E7EB',
                                    alignItems: 'center',
                                    gap: 12,
                                }}>
                                    <DnaIcon />
                                    <Text style={{ ...Typography.bodyLarge, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary, textAlign: 'center' }}>
                                        No Predictions Available
                                    </Text>
                                    <Text style={{ ...Typography.bodySmall, color: '#6B7280', textAlign: 'center' }}>
                                        The API returned data but no recognizable phenotype predictions were found.
                                    </Text>
                                    <View style={{
                                        width: '100%',
                                        backgroundColor: '#F9FAFB',
                                        borderRadius: 10,
                                        padding: 12,
                                    }}>
                                        <Text style={{ ...Typography.caption, color: '#6B7280' }} numberOfLines={8}>
                                            {JSON.stringify(parsed.raw, null, 2)}
                                        </Text>
                                    </View>
                                </View>
                            ) : null}

                            {/* Sequence Summary */}
                            {inputMode === 'text' && dnaText && (
                                <Pressable
                                    onPress={() => setShowSequence(!showSequence)}
                                    style={{
                                        backgroundColor: AppColors.white,
                                        borderRadius: 16,
                                        padding: 16,
                                        borderWidth: 1,
                                        borderColor: '#E5E7EB',
                                        gap: 8,
                                    }}
                                >
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={{ ...Typography.bodySmall, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                            Submitted Sequence
                                        </Text>
                                        <Text style={{ ...Typography.caption, color: AppColors.primary }}>
                                            {showSequence ? 'Hide' : 'Show'}
                                        </Text>
                                    </View>
                                    {showSequence && (
                                        <View style={{
                                            backgroundColor: '#F9FAFB',
                                            borderRadius: 8,
                                            padding: 10,
                                            marginTop: 4,
                                        }}>
                                            <Text style={{
                                                fontSize: 11,
                                                fontFamily: 'IBMPlexSans_400Regular',
                                                color: '#6B7280',
                                                lineHeight: 16,
                                            }} numberOfLines={10}>
                                                {dnaText}
                                            </Text>
                                        </View>
                                    )}
                                </Pressable>
                            )}

                            {inputMode === 'file' && fileName && (
                                <View style={{
                                    backgroundColor: AppColors.white,
                                    borderRadius: 16,
                                    padding: 16,
                                    borderWidth: 1,
                                    borderColor: '#E5E7EB',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 10,
                                }}>
                                    <View style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 10,
                                        backgroundColor: '#EEF2FF',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                                            <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                                            <Path d="M14 2v6h6" stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                                        </Svg>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ ...Typography.bodySmall, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                            Uploaded File
                                        </Text>
                                        <Text style={{ ...Typography.caption, color: '#9CA3AF' }} numberOfLines={1}>
                                            {fileName}
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {/* Action Buttons */}
                            <View style={{ gap: 10 }}>
                                <Pressable
                                    onPress={() => Alert.alert('Download Report', 'Report downloaded successfully.')}
                                    style={({ pressed }) => ({
                                        backgroundColor: pressed ? AppColors.primaryHover : AppColors.primary,
                                        borderRadius: 14,
                                        paddingVertical: 14,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8,
                                    })}
                                >
                                    <DownloadIcon />
                                    <Text style={{ ...Typography.button, color: AppColors.white }}>
                                        Download Report
                                    </Text>
                                </Pressable>

                                <Pressable
                                    onPress={() => setCaseModalVisible(true)}
                                    style={({ pressed }) => ({
                                        backgroundColor: pressed ? '#F0F4FF' : AppColors.white,
                                        borderRadius: 14,
                                        paddingVertical: 14,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8,
                                        borderWidth: 1.5,
                                        borderColor: AppColors.primary,
                                    })}
                                >
                                    <FolderIcon />
                                    <Text style={{ ...Typography.button, color: AppColors.primary }}>
                                        Add to Case
                                    </Text>
                                </Pressable>
                            </View>
                        </>
                    )}
                </View>
            </ScrollView>

            <AddToCaseModal
                visible={caseModalVisible}
                onClose={() => setCaseModalVisible(false)}
                modelUsed="dna"
                resultData={parsed.raw as Record<string, unknown>}
            />
        </View>
    );
}
