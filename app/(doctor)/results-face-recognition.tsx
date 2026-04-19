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

function UserIcon() {
    return (
        <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={8} r={4} stroke="#9CA3AF" strokeWidth={1.5} />
            <Path d="M20 21a8 8 0 10-16 0" stroke="#9CA3AF" strokeWidth={1.5} strokeLinecap="round" />
        </Svg>
    );
}

export default function ResultsFaceRecognitionScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { imageUri, apiData } = useLocalSearchParams<{ imageUri: string; apiData: string }>();
    const [caseModalVisible, setCaseModalVisible] = useState(false);

    // Parse API response
    const parsed = useMemo(() => {
        try {
            const raw = JSON.parse(apiData || '{}');
            // /recognize response structure
            const results = Array.isArray(raw) ? raw : (raw.results || [raw]);
            return { results, raw };
        } catch {
            return { results: [], raw: {} };
        }
    }, [apiData]);

    // Extract match data from API response
    const matches = useMemo(() => {
        if (parsed.results.length === 0) {
            // Fallback mock data
            return [
                { identity: 'John Doe', distance: 0.23, threshold: 0.68, verified: true, model: 'ArcFace', faceRegion: { x: 120, y: 80, w: 200, h: 250 } },
                { identity: 'James Smith', distance: 0.45, threshold: 0.68, verified: true, model: 'ArcFace', faceRegion: null },
                { identity: 'Unknown #3847', distance: 0.62, threshold: 0.68, verified: false, model: 'ArcFace', faceRegion: null },
            ];
        }

        return parsed.results.map((r: any) => {
            const identity = r.identity || r.label || 'Unknown';
            const distance = r.distance ?? r.score ?? 0;
            const threshold = r.threshold ?? 0.68;
            const verified = distance <= threshold;
            const faceRegion = r.facial_area || r.face_region || r.source_region || null;
            const model = r.model || 'ArcFace';
            return { identity, distance, threshold, verified, model, faceRegion };
        });
    }, [parsed]);

    const primaryMatch = matches[0];
    const matchConfidence = primaryMatch
        ? Math.max(0, Math.min(100, (1 - primaryMatch.distance / primaryMatch.threshold) * 100))
        : 0;

    // Facial landmark measurements (mock)
    const landmarks = [
        { label: 'Inter-ocular Distance', value: '63.2 mm' },
        { label: 'Nose Width Ratio', value: '0.267' },
        { label: 'Jaw Angle', value: '122.4°' },
        { label: 'Face Symmetry', value: '96.1%' },
    ];

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
                            Recognition Results
                        </Text>
                        <View style={{
                            backgroundColor: '#EEF2FF',
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 6,
                            alignSelf: 'flex-start',
                        }}>
                            <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>
                                Face Recognition
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={{ padding: Spacing.md, gap: 16 }}>
                    {/* Uploaded Image */}
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
                            <View style={{ padding: 10 }}>
                                <Text style={{ ...Typography.caption, color: '#9CA3AF' }}>Uploaded Evidence</Text>
                            </View>
                        </View>
                    )}

                    {/* Primary Match Card */}
                    {primaryMatch && (
                        <View style={{
                            backgroundColor: AppColors.white,
                            borderRadius: 16,
                            padding: 20,
                            borderWidth: 1,
                            borderColor: '#E5E7EB',
                            gap: 14,
                        }}>
                            <Text style={{ ...Typography.bodyLarge, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                Primary Match
                            </Text>

                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                                <View style={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: 28,
                                    backgroundColor: '#F3F4F6',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <UserIcon />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ ...Typography.bodyLarge, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.textPrimary }}>
                                        {primaryMatch.identity}
                                    </Text>
                                    <Text style={{ ...Typography.caption, color: '#6B7280', marginTop: 2 }}>
                                        Model: {primaryMatch.model} • Distance: {primaryMatch.distance.toFixed(4)}
                                    </Text>
                                </View>
                            </View>

                            {/* Match confidence bar */}
                            <View style={{ gap: 6 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={{ ...Typography.caption, color: '#6B7280' }}>Match Confidence</Text>
                                    <Text style={{ ...Typography.caption, fontFamily: 'IBMPlexSans_600SemiBold', color: primaryMatch.verified ? AppColors.success : AppColors.error }}>
                                        {matchConfidence.toFixed(1)}%
                                    </Text>
                                </View>
                                <View style={{ height: 8, borderRadius: 4, backgroundColor: '#F3F4F6' }}>
                                    <View style={{
                                        height: 8,
                                        borderRadius: 4,
                                        backgroundColor: primaryMatch.verified ? AppColors.success : AppColors.error,
                                        width: `${Math.min(100, matchConfidence)}%`,
                                    }} />
                                </View>
                            </View>

                            <View style={{
                                backgroundColor: primaryMatch.verified ? '#DCFCE7' : '#FEE2E2',
                                paddingVertical: 6,
                                paddingHorizontal: 12,
                                borderRadius: 8,
                                alignSelf: 'flex-start',
                            }}>
                                <Text style={{
                                    fontSize: 12,
                                    fontFamily: 'IBMPlexSans_600SemiBold',
                                    color: primaryMatch.verified ? AppColors.success : AppColors.error,
                                }}>
                                    {primaryMatch.verified ? 'VERIFIED MATCH' : 'BELOW THRESHOLD'}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Face Region */}
                    {primaryMatch?.faceRegion && (
                        <View style={{
                            backgroundColor: AppColors.white,
                            borderRadius: 16,
                            padding: 16,
                            borderWidth: 1,
                            borderColor: '#E5E7EB',
                            gap: 10,
                        }}>
                            <Text style={{ ...Typography.bodyLarge, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                Face Region
                            </Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                {Object.entries(primaryMatch.faceRegion).map(([key, val]) => (
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

                    {/* Facial Landmarks */}
                    <View style={{
                        backgroundColor: AppColors.white,
                        borderRadius: 16,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        gap: 12,
                    }}>
                        <Text style={{ ...Typography.bodyLarge, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                            Facial Measurements
                        </Text>
                        {landmarks.map((lm) => (
                            <View
                                key={lm.label}
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    paddingVertical: 8,
                                    borderBottomWidth: 1,
                                    borderBottomColor: '#F3F4F6',
                                }}
                            >
                                <Text style={{ ...Typography.bodySmall, color: '#6B7280' }}>{lm.label}</Text>
                                <Text style={{ ...Typography.bodySmall, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                    {lm.value}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Similar Matches */}
                    {matches.length > 1 && (
                        <View style={{
                            backgroundColor: AppColors.white,
                            borderRadius: 16,
                            padding: 16,
                            borderWidth: 1,
                            borderColor: '#E5E7EB',
                            gap: 10,
                        }}>
                            <Text style={{ ...Typography.bodyLarge, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                Other Matches
                            </Text>
                            {matches.slice(1).map((m, i) => {
                                const sim = Math.max(0, Math.min(100, (1 - m.distance / m.threshold) * 100));
                                return (
                                    <View
                                        key={i}
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            gap: 12,
                                            paddingVertical: 10,
                                            borderBottomWidth: i < matches.length - 2 ? 1 : 0,
                                            borderBottomColor: '#F3F4F6',
                                        }}
                                    >
                                        <View style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 20,
                                            backgroundColor: '#F3F4F6',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_600SemiBold', color: '#9CA3AF' }}>
                                                {m.identity.charAt(0)}
                                            </Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ ...Typography.bodySmall, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.textPrimary }}>
                                                {m.identity}
                                            </Text>
                                            <Text style={{ ...Typography.caption, color: '#9CA3AF' }}>
                                                Distance: {m.distance.toFixed(4)}
                                            </Text>
                                        </View>
                                        <View style={{
                                            backgroundColor: m.verified ? '#DCFCE7' : '#FEF3C7',
                                            paddingHorizontal: 8,
                                            paddingVertical: 3,
                                            borderRadius: 6,
                                        }}>
                                            <Text style={{
                                                fontSize: 12,
                                                fontFamily: 'IBMPlexSans_600SemiBold',
                                                color: m.verified ? AppColors.success : '#D97706',
                                            }}>
                                                {sim.toFixed(1)}%
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}
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
