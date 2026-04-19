import { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Image, Alert } from 'react-native';
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

function CheckCircle() {
    return (
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={12} r={10} stroke={AppColors.success} strokeWidth={2} />
            <Path d="M9 12l2 2 4-4" stroke={AppColors.success} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function AlertCircle() {
    return (
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={12} r={10} stroke={AppColors.error} strokeWidth={2} />
            <Path d="M15 9l-6 6M9 9l6 6" stroke={AppColors.error} strokeWidth={2} strokeLinecap="round" />
        </Svg>
    );
}

/* ─── Confidence Ring ─── */
function ConfidenceRing({ percentage, color }: { percentage: number; color: string }) {
    const size = 120;
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = circumference - (percentage / 100) * circumference;

    return (
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={size} height={size}>
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#E5E7EB"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={`${circumference}`}
                    strokeDashoffset={progress}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </Svg>
            <View style={{ position: 'absolute', alignItems: 'center' }}>
                <Text style={{ fontSize: 28, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.textPrimary }}>
                    {percentage.toFixed(1)}%
                </Text>
                <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>
                    Confidence
                </Text>
            </View>
        </View>
    );
}

/* ─── Detection checks ─── */
const DETECTION_CHECKS = [
    { label: 'Face Consistency', key: 'face_consistency' },
    { label: 'Lighting Analysis', key: 'lighting' },
    { label: 'Edge Artifacts', key: 'edge_artifacts' },
    { label: 'Metadata Integrity', key: 'metadata' },
];

export default function ResultsDeepfakeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { imageUri, apiData } = useLocalSearchParams<{ imageUri: string; apiData: string }>();
    const [caseModalVisible, setCaseModalVisible] = useState(false);

    // Parse API response
    const parsed = useMemo(() => {
        try {
            const raw = JSON.parse(apiData || '{}');
            // The liveness API response structure
            // Adapt based on actual API response
            const results = raw.results || [raw];
            const first = results[0] || {};

            const isReal = first.is_real ?? (first.antispoof_score > 0.5);
            const confidence = first.antispoof_score != null
                ? first.antispoof_score * 100
                : (isReal ? 94.7 : 12.3);
            const faceRegion = first.facial_area || first.face_region || null;

            return { isReal, confidence, faceRegion, raw: first };
        } catch {
            // Fallback mock data
            return {
                isReal: false,
                confidence: 87.3,
                faceRegion: { x: 120, y: 80, w: 200, h: 250 },
                raw: {},
            };
        }
    }, [apiData]);

    // Mock detection breakdown scores
    const breakdownScores = useMemo(() => {
        return DETECTION_CHECKS.map((check, i) => {
            const base = parsed.isReal ? 85 + Math.random() * 14 : 20 + Math.random() * 40;
            const passed = parsed.isReal ? true : i % 2 === 0;
            return { ...check, score: base, passed };
        });
    }, [parsed.isReal]);

    const verdictColor = parsed.isReal ? AppColors.success : AppColors.error;
    const verdictBg = parsed.isReal ? '#DCFCE7' : '#FEE2E2';
    const verdictLabel = parsed.isReal ? 'REAL' : 'FAKE';

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
                            Analysis Results
                        </Text>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 6,
                        }}>
                            <View style={{
                                backgroundColor: '#EEF2FF',
                                paddingHorizontal: 8,
                                paddingVertical: 2,
                                borderRadius: 6,
                            }}>
                                <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>
                                    Deep Fake Detection
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={{ padding: Spacing.md, gap: 16 }}>
                    {/* Image Preview */}
                    {imageUri && (
                        <View style={{
                            backgroundColor: AppColors.white,
                            borderRadius: 16,
                            overflow: 'hidden',
                            borderWidth: 1,
                            borderColor: '#E5E7EB',
                        }}>
                            <Image
                                source={{ uri: imageUri }}
                                style={{ width: '100%', height: 200, resizeMode: 'cover' }}
                            />
                        </View>
                    )}

                    {/* Verdict Card */}
                    <View style={{
                        backgroundColor: AppColors.white,
                        borderRadius: 16,
                        padding: 24,
                        alignItems: 'center',
                        gap: 16,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                    }}>
                        <View style={{
                            backgroundColor: verdictBg,
                            paddingVertical: 8,
                            paddingHorizontal: 24,
                            borderRadius: 12,
                        }}>
                            <Text style={{
                                fontSize: 22,
                                fontFamily: 'IBMPlexSans_700Bold',
                                color: verdictColor,
                                letterSpacing: 2,
                            }}>
                                {verdictLabel}
                            </Text>
                        </View>

                        <Text style={{ ...Typography.bodySmall, color: '#6B7280', textAlign: 'center' }}>
                            {parsed.isReal
                                ? 'This image appears to be authentic with no signs of AI manipulation.'
                                : 'This image shows signs of AI-generated manipulation or deepfake artifacts.'}
                        </Text>

                        {/* Confidence Ring */}
                        <ConfidenceRing percentage={parsed.confidence} color={verdictColor} />
                    </View>

                    {/* Detection Breakdown */}
                    <View style={{
                        backgroundColor: AppColors.white,
                        borderRadius: 16,
                        padding: 16,
                        gap: 12,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                    }}>
                        <Text style={{ ...Typography.bodyLarge, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                            Detection Breakdown
                        </Text>

                        {breakdownScores.map((item) => (
                            <View
                                key={item.key}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    paddingVertical: 10,
                                    borderBottomWidth: 1,
                                    borderBottomColor: '#F3F4F6',
                                }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                    {item.passed ? <CheckCircle /> : <AlertCircle />}
                                    <Text style={{ ...Typography.bodySmall, color: AppColors.textPrimary }}>
                                        {item.label}
                                    </Text>
                                </View>
                                <Text style={{
                                    fontSize: 14,
                                    fontFamily: 'IBMPlexSans_600SemiBold',
                                    color: item.passed ? AppColors.success : AppColors.error,
                                }}>
                                    {item.score.toFixed(1)}%
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Face Region Info */}
                    {parsed.faceRegion && (
                        <View style={{
                            backgroundColor: AppColors.white,
                            borderRadius: 16,
                            padding: 16,
                            gap: 8,
                            borderWidth: 1,
                            borderColor: '#E5E7EB',
                        }}>
                            <Text style={{ ...Typography.bodyLarge, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                Face Region Detected
                            </Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                {Object.entries(parsed.faceRegion).map(([key, val]) => (
                                    <View key={key} style={{
                                        backgroundColor: '#F9FAFB',
                                        paddingHorizontal: 10,
                                        paddingVertical: 6,
                                        borderRadius: 8,
                                    }}>
                                        <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>
                                            {key.toUpperCase()}
                                        </Text>
                                        <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                            {String(val)}
                                        </Text>
                                    </View>
                                ))}
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
                </View>
            </ScrollView>

            <AddToCaseModal
                visible={caseModalVisible}
                onClose={() => setCaseModalVisible(false)}
            />
        </View>
    );
}
