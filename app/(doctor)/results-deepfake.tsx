import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Image, Alert, Dimensions, LayoutChangeEvent } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
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

/* ─── Detection checks derived from API ─── */
function normalizePercent(value: unknown) {
    if (typeof value !== 'number' || Number.isNaN(value)) return null;
    return value <= 1 ? value * 100 : value;
}

function normalizeRealFlag(face: any) {
    if (typeof face?.is_real === 'boolean') return face.is_real;
    if (typeof face?.is_fake === 'boolean') return !face.is_fake;
    if (typeof face?.real === 'boolean') return face.real;
    if (typeof face?.is_ai_generated === 'boolean') return !face.is_ai_generated;
    if (typeof face?.is_spoofed === 'boolean') return !face.is_spoofed;
    const label = String(face?.label ?? face?.prediction ?? face?.verdict ?? '').toLowerCase();
    if (label.includes('real') || label.includes('authentic') || label.includes('live')) return true;
    if (label.includes('fake') || label.includes('spoof') || label.includes('generated')) return false;
    return false;
}

export default function ResultsDeepfakeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { imageUri, apiData, errorData } = useLocalSearchParams<{ imageUri: string; apiData: string; errorData: string }>();
    const [caseModalVisible, setCaseModalVisible] = useState(false);
    const [origSize, setOrigSize] = useState({ w: 0, h: 0 });
    const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 });
    const screenWidth = Dimensions.get('window').width - Spacing.md * 2; // account for padding

    // Get original image dimensions
    useEffect(() => {
        if (imageUri) {
            Image.getSize(imageUri, (w, h) => setOrigSize({ w, h }), () => { });
        }
    }, [imageUri]);

    // Compute display height to show full image without cropping
    const imageDisplayHeight = origSize.w > 0
        ? (screenWidth / origSize.w) * origSize.h
        : 250;

    // Parse API response — handle multiple faces
    // Actual response: { faces: [{ is_real: bool, score: number, facial_area: {...} }, ...] }
    const parsed = useMemo(() => {
        try {
            const raw = JSON.parse(apiData || '{}');
            const rawFaces = raw.faces || raw.results || raw.detections || (
                raw.is_real !== undefined || raw.is_fake !== undefined || raw.prediction || raw.verdict ? [raw] : []
            );

            const faces = rawFaces.map((f: any, idx: number) => {
                const isReal = normalizeRealFlag(f);
                const spoofScore = f.spoof_score ?? f.antispoof_score ?? null;
                const aiScore = f.ai_score ?? f.generated_score ?? null;
                const score = f.score ?? aiScore ?? spoofScore ?? f.probability ?? f.confidence ?? null;
                const strongestSignal = Math.max(
                    typeof spoofScore === 'number' ? spoofScore : 0,
                    typeof aiScore === 'number' ? aiScore : 0,
                    typeof f.score === 'number' ? f.score : 0
                );
                const confidence = normalizePercent(f.confidence ?? f.probability ?? strongestSignal) ?? (isReal ? 85 : 75);
                const faceRegion = f.facial_area || f.face_region || null;
                return {
                    isReal,
                    score,
                    spoofScore,
                    aiScore,
                    isSpoofed: f.is_spoofed,
                    isAiGenerated: f.is_ai_generated,
                    confidence,
                    faceRegion,
                    raw: f,
                    index: idx,
                };
            });

            const allReal = faces.length > 0 && faces.every((f: any) => f.isReal);
            const realCount = faces.filter((f: any) => f.isReal).length;
            const fakeCount = faces.filter((f: any) => !f.isReal).length;

            return { faces, allReal, realCount, fakeCount, hasData: faces.length > 0, message: raw.message || raw.detail || '' };
        } catch {
            return { faces: [], allReal: false, realCount: 0, fakeCount: 0, hasData: false, message: '' };
        }
    }, [apiData]);

    // Overall verdict based on all faces
    const overallReal = parsed.allReal;
    const overallColor = overallReal ? AppColors.success : AppColors.error;
    const overallBg = overallReal ? '#DCFCE7' : '#FEE2E2';
    const overallLabel = overallReal ? 'ALL REAL' : 'FAKE DETECTED';

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
                    {/* Image Preview with Face Overlay */}
                    {imageUri && (
                        <View style={{
                            backgroundColor: AppColors.white,
                            borderRadius: 16,
                            overflow: 'hidden',
                            borderWidth: 1,
                            borderColor: '#E5E7EB',
                        }}>
                            <View
                                style={{ width: '100%', height: imageDisplayHeight }}
                                onLayout={(e: LayoutChangeEvent) => setDisplaySize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
                            >
                                <Image
                                    source={{ uri: imageUri }}
                                    style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                                />
                                {parsed.faces.length > 0 && origSize.w > 0 && displaySize.w > 0 && (() => {
                                    // Image uses 'contain' — compute scale
                                    const scaleX = displaySize.w / origSize.w;
                                    const scaleY = displaySize.h / origSize.h;
                                    const scale = Math.min(scaleX, scaleY);
                                    const offsetX = (displaySize.w - origSize.w * scale) / 2;
                                    const offsetY = (displaySize.h - origSize.h * scale) / 2;
                                    const tx = (x: number) => x * scale + offsetX;
                                    const ty = (y: number) => y * scale + offsetY;

                                    return (
                                        <Svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                                            {parsed.faces.map((face: any, idx: number) => {
                                                const fa = face.faceRegion;
                                                if (!fa) return null;
                                                const boxColor = face.isReal ? AppColors.success : AppColors.error;
                                                return (
                                                    <React.Fragment key={idx}>
                                                        {/* Face bounding box */}
                                                        <Rect
                                                            x={tx(fa.x)}
                                                            y={ty(fa.y)}
                                                            width={fa.w * scale}
                                                            height={fa.h * scale}
                                                            stroke={boxColor}
                                                            strokeWidth={2}
                                                            fill="none"
                                                            rx={4}
                                                        />
                                                        {/* Facial landmarks */}
                                                        {fa.left_eye && <Circle cx={tx(fa.left_eye[0])} cy={ty(fa.left_eye[1])} r={3} fill="#60A5FA" />}
                                                        {fa.right_eye && <Circle cx={tx(fa.right_eye[0])} cy={ty(fa.right_eye[1])} r={3} fill="#60A5FA" />}
                                                        {fa.nose && <Circle cx={tx(fa.nose[0])} cy={ty(fa.nose[1])} r={3} fill="#FBBF24" />}
                                                        {fa.mouth_left && <Circle cx={tx(fa.mouth_left[0])} cy={ty(fa.mouth_left[1])} r={2.5} fill="#F87171" />}
                                                        {fa.mouth_right && <Circle cx={tx(fa.mouth_right[0])} cy={ty(fa.mouth_right[1])} r={2.5} fill="#F87171" />}
                                                        {fa.mouth_left && fa.mouth_right && (
                                                            <Line
                                                                x1={tx(fa.mouth_left[0])} y1={ty(fa.mouth_left[1])}
                                                                x2={tx(fa.mouth_right[0])} y2={ty(fa.mouth_right[1])}
                                                                stroke="#F87171" strokeWidth={1} opacity={0.6}
                                                            />
                                                        )}
                                                    </React.Fragment>
                                                );
                                            })}
                                        </Svg>
                                    );
                                })()}
                            </View>
                        </View>
                    )}

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
                    ) : !parsed.hasData ? (
                        <View style={{
                            backgroundColor: AppColors.white,
                            borderRadius: 16,
                            padding: 24,
                            borderWidth: 1,
                            borderColor: '#E5E7EB',
                            gap: 12,
                            alignItems: 'center',
                        }}>
                            <AlertCircle />
                            <Text style={{ ...Typography.bodyLarge, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary, textAlign: 'center' }}>
                                No Face Result Available
                            </Text>
                            <Text style={{ ...Typography.bodySmall, color: '#6B7280', textAlign: 'center', lineHeight: 20 }}>
                                {parsed.message || 'The API response did not include a deepfake detection result for this image.'}
                            </Text>
                        </View>
                    ) : (
                        <>
                            {/* Overall Verdict */}
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
                                    backgroundColor: overallBg,
                                    paddingVertical: 8,
                                    paddingHorizontal: 24,
                                    borderRadius: 12,
                                }}>
                                    <Text style={{
                                        fontSize: 22,
                                        fontFamily: 'IBMPlexSans_700Bold',
                                        color: overallColor,
                                        letterSpacing: 2,
                                    }}>
                                        {overallLabel}
                                    </Text>
                                </View>

                                <Text style={{ ...Typography.bodySmall, color: '#6B7280', textAlign: 'center' }}>
                                    {parsed.faces.length === 1
                                        ? (overallReal
                                            ? 'This image appears to be authentic with no signs of AI manipulation.'
                                            : 'This image shows signs of AI-generated manipulation or deepfake artifacts.')
                                        : `${parsed.faces.length} faces detected — ${parsed.realCount} real, ${parsed.fakeCount} fake.`}
                                </Text>

                                {/* Summary counts */}
                                <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%' }}>
                                    <View style={{ alignItems: 'center', gap: 4 }}>
                                        <Text style={{ fontSize: 24, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.textPrimary }}>
                                            {parsed.faces.length}
                                        </Text>
                                        <Text style={{ ...Typography.caption, color: '#6B7280' }}>Faces</Text>
                                    </View>
                                    <View style={{ width: 1, backgroundColor: '#E5E7EB' }} />
                                    <View style={{ alignItems: 'center', gap: 4 }}>
                                        <Text style={{ fontSize: 24, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.success }}>
                                            {parsed.realCount}
                                        </Text>
                                        <Text style={{ ...Typography.caption, color: '#6B7280' }}>Real</Text>
                                    </View>
                                    <View style={{ width: 1, backgroundColor: '#E5E7EB' }} />
                                    <View style={{ alignItems: 'center', gap: 4 }}>
                                        <Text style={{ fontSize: 24, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.error }}>
                                            {parsed.fakeCount}
                                        </Text>
                                        <Text style={{ ...Typography.caption, color: '#6B7280' }}>Fake</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Per-face details */}
                            {parsed.faces.map((face: any, idx: number) => {
                                const fColor = face.isReal ? AppColors.success : AppColors.error;
                                const fBg = face.isReal ? '#DCFCE7' : '#FEE2E2';
                                const fLabel = face.isReal ? 'REAL' : 'FAKE';
                                return (
                                    <View key={idx} style={{
                                        backgroundColor: AppColors.white,
                                        borderRadius: 16,
                                        padding: 16,
                                        gap: 12,
                                        borderWidth: 1,
                                        borderColor: face.isReal ? '#BBF7D0' : '#FECACA',
                                    }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text style={{ ...Typography.bodyLarge, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                                Face {idx + 1}
                                            </Text>
                                            <View style={{
                                                backgroundColor: fBg,
                                                paddingVertical: 4,
                                                paddingHorizontal: 10,
                                                borderRadius: 8,
                                            }}>
                                                <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_600SemiBold', color: fColor }}>
                                                    {fLabel}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Confidence ring for this face */}
                                        <View style={{ alignItems: 'center', paddingVertical: 8 }}>
                                            <ConfidenceRing percentage={face.confidence} color={fColor} />
                                        </View>

                                        <View style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            paddingVertical: 10,
                                            borderBottomWidth: 1,
                                            borderBottomColor: '#F3F4F6',
                                        }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                                {face.isReal ? <CheckCircle /> : <AlertCircle />}
                                                <Text style={{ ...Typography.bodySmall, color: AppColors.textPrimary }}>
                                                    Liveness Check
                                                </Text>
                                            </View>
                                            <Text style={{
                                                fontSize: 14,
                                                fontFamily: 'IBMPlexSans_600SemiBold',
                                                color: fColor,
                                            }}>
                                                {face.isReal ? 'PASSED' : 'FAILED'}
                                            </Text>
                                        </View>

                                        <View style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            paddingVertical: 10,
                                            borderBottomWidth: 1,
                                            borderBottomColor: '#F3F4F6',
                                        }}>
                                                <Text style={{ ...Typography.bodySmall, color: '#6B7280' }}>
                                                AI Generation Score
                                            </Text>
                                            <Text style={{ ...Typography.bodySmall, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                                {typeof face.aiScore === 'number' ? face.aiScore.toFixed(4) : 'N/A'}
                                            </Text>
                                        </View>

                                        <View style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            paddingVertical: 10,
                                            borderBottomWidth: 1,
                                            borderBottomColor: '#F3F4F6',
                                        }}>
                                            <Text style={{ ...Typography.bodySmall, color: '#6B7280' }}>
                                                Spoof Score
                                            </Text>
                                            <Text style={{ ...Typography.bodySmall, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                                {typeof face.spoofScore === 'number' ? face.spoofScore.toFixed(4) : 'N/A'}
                                            </Text>
                                        </View>

                                        <View style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            paddingVertical: 10,
                                        }}>
                                            <Text style={{ ...Typography.bodySmall, color: '#6B7280' }}>
                                                Detector Backend
                                            </Text>
                                            <Text style={{ ...Typography.bodySmall, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                                RetinaFace
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}

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
            />
        </View>
    );
}
