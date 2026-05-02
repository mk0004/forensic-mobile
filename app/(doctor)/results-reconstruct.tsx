import { useState, useRef, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Image, Alert, Dimensions, PanResponder } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { AppColors, Typography, Spacing } from '@/constants/theme';
import { AddToCaseModal } from '@/components/add-to-case-modal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDER_WIDTH = SCREEN_WIDTH - Spacing.md * 2 - 2;

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

function getTopLabel(value: any) {
    if (!value || typeof value !== 'object') return value ?? null;
    const top = Object.entries(value)
        .filter(([, score]) => typeof score === 'number')
        .sort((a, b) => (b[1] as number) - (a[1] as number))[0];
    return top?.[0] || JSON.stringify(value);
}

function getImageUri(value: any) {
    if (!value || typeof value !== 'string') return null;
    if (value.startsWith('data:') || value.startsWith('http://') || value.startsWith('https://') || value.startsWith('file:')) {
        return value;
    }
    return `data:image/jpeg;base64,${value}`;
}

export default function ResultsReconstructScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { imageUri, apiData, errorData } = useLocalSearchParams<{ imageUri: string; apiData: string; errorData: string }>();
    const [caseModalVisible, setCaseModalVisible] = useState(false);
    const [sliderPosition, setSliderPosition] = useState(0.5);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) => {
                const newPos = Math.max(0.05, Math.min(0.95, (gestureState.moveX - Spacing.md - 1) / SLIDER_WIDTH));
                setSliderPosition(newPos);
            },
        })
    ).current;

    // Parse API response
    const parsed = useMemo(() => {
        try {
            const raw = JSON.parse(apiData || '{}');
            const restoredImage = raw.restored_image || raw.restored_image_base64 || raw.enhanced_image || raw.enhanced_image_base64 || raw.image || raw.image_base64 || null;
            const analysisSource = raw.analysis || raw.result || raw.deepface_analysis || raw.face_analysis || raw || {};
            const analysis = Array.isArray(analysisSource) ? analysisSource[0] || {} : analysisSource;
            
            const age = analysis.age ?? analysis.Age ?? raw.age ?? raw.Age ?? null;
            const gender = analysis.gender ?? analysis.Gender ?? raw.gender ?? raw.Gender ?? null;
            const dominantGender = analysis.dominant_gender ?? analysis.dominantGender ?? raw.dominant_gender ?? null;
            const race = analysis.race ?? analysis.Race ?? raw.race ?? raw.Race ?? null;
            const dominantRace = analysis.dominant_race ?? analysis.dominantRace ?? raw.dominant_race ?? null;
            const emotion = analysis.dominant_emotion ?? analysis.dominantEmotion ?? raw.dominant_emotion ?? null;
            const genderLabel = getTopLabel(dominantGender || gender);
            const raceLabel = getTopLabel(dominantRace || race);
            const emotionLabel = getTopLabel(emotion || analysis.emotion || raw.emotion);
            
            const faceRegion = analysis.facial_area ?? analysis.face_region ?? analysis.region ?? raw.facial_area ?? null;
            
            return {
                restoredImage,
                age,
                gender: genderLabel,
                race: raceLabel,
                emotion: emotionLabel,
                faceRegion,
                hasData: !!(restoredImage || age || genderLabel || raceLabel || emotionLabel),
                raw,
            };
        } catch {
            return { restoredImage: null, age: null, gender: null, race: null, emotion: null, faceRegion: null, hasData: false, raw: {} };
        }
    }, [apiData]);

    // Determine after image URI
    const afterUri = getImageUri(parsed.restoredImage) || imageUri;

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
                            Reconstruction Results
                        </Text>
                        <View style={{
                            backgroundColor: '#EEF2FF',
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 6,
                            alignSelf: 'flex-start',
                        }}>
                            <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>
                                Forensic Analysis
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
                            {/* Before/After Slider */}
                            {imageUri && (
                                <View style={{
                                    backgroundColor: AppColors.white,
                                    borderRadius: 16,
                                    overflow: 'hidden',
                                    borderWidth: 1,
                                    borderColor: '#E5E7EB',
                                }}>
                                    <View style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
                                        <Text style={{ ...Typography.bodyLarge, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                            Before / After Comparison
                                        </Text>
                                        <Text style={{ ...Typography.caption, color: '#9CA3AF', marginTop: 2 }}>
                                            Drag the slider to compare original and restored image
                                        </Text>
                                    </View>

                                    <View
                                        style={{ height: 300, position: 'relative', overflow: 'hidden' }}
                                        {...panResponder.panHandlers}
                                    >
                                        {/* After image (full) */}
                                        <Image
                                            source={{ uri: afterUri || imageUri }}
                                            style={{ width: '100%', height: 300, resizeMode: 'contain' }}
                                        />

                                        {/* Before image (clipped) */}
                                        <View style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: SLIDER_WIDTH * sliderPosition,
                                            height: 300,
                                            overflow: 'hidden',
                                        }}>
                                            <Image
                                                source={{ uri: imageUri }}
                                                style={{ width: SLIDER_WIDTH, height: 300, resizeMode: 'contain' }}
                                            />
                                            <View style={{
                                                position: 'absolute',
                                                top: 10,
                                                left: 10,
                                                backgroundColor: 'rgba(0,0,0,0.6)',
                                                paddingHorizontal: 8,
                                                paddingVertical: 3,
                                                borderRadius: 6,
                                            }}>
                                                <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.white }}>
                                                    ORIGINAL
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Slider line */}
                                        <View style={{
                                            position: 'absolute',
                                            top: 0,
                                            bottom: 0,
                                            left: SLIDER_WIDTH * sliderPosition - 1,
                                            width: 3,
                                            backgroundColor: AppColors.white,
                                        }}>
                                            <View style={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: -14,
                                                width: 30,
                                                height: 30,
                                                borderRadius: 15,
                                                backgroundColor: AppColors.white,
                                                borderWidth: 2,
                                                borderColor: AppColors.primary,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                shadowColor: '#000',
                                                shadowOffset: { width: 0, height: 2 },
                                                shadowOpacity: 0.15,
                                                shadowRadius: 4,
                                                elevation: 3,
                                            }}>
                                                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                                                    <Path d="M8 5l-5 7 5 7M16 5l5 7-5 7" stroke={AppColors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                                </Svg>
                                            </View>
                                        </View>

                                        {/* After label */}
                                        <View style={{
                                            position: 'absolute',
                                            top: 10,
                                            right: 10,
                                            backgroundColor: 'rgba(30,42,94,0.8)',
                                            paddingHorizontal: 8,
                                            paddingVertical: 3,
                                            borderRadius: 6,
                                        }}>
                                            <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.white }}>
                                                RESTORED
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            )}

                            {/* Analysis Results */}
                            {parsed.hasData && (
                                <View style={{
                                    backgroundColor: AppColors.white,
                                    borderRadius: 16,
                                    padding: 20,
                                    borderWidth: 1,
                                    borderColor: '#E5E7EB',
                                    gap: 16,
                                }}>
                                    <Text style={{ ...Typography.bodyLarge, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                        DeepFace Analysis
                                    </Text>

                                    {parsed.age !== null && (
                                        <View style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            paddingVertical: 12,
                                            borderBottomWidth: 1,
                                            borderBottomColor: '#F3F4F6',
                                        }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                                <View style={{
                                                    width: 36,
                                                    height: 36,
                                                    borderRadius: 10,
                                                    backgroundColor: '#EEF2FF',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}>
                                                    <Text style={{ fontSize: 16, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.primary }}>
                                                        {typeof parsed.age === 'number' ? Math.round(parsed.age) : parsed.age}
                                                    </Text>
                                                </View>
                                                <Text style={{ ...Typography.bodySmall, color: AppColors.textPrimary }}>
                                                    Estimated Age
                                                </Text>
                                            </View>
                                            <Text style={{ ...Typography.bodySmall, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>
                                                {typeof parsed.age === 'number' ? `${Math.round(parsed.age)} years` : parsed.age}
                                            </Text>
                                        </View>
                                    )}

                                    {parsed.gender && (
                                        <View style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            paddingVertical: 12,
                                            borderBottomWidth: parsed.race || parsed.emotion ? 1 : 0,
                                            borderBottomColor: '#F3F4F6',
                                        }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                                <View style={{
                                                    width: 36,
                                                    height: 36,
                                                    borderRadius: 10,
                                                    backgroundColor: '#FDF2F8',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}>
                                                    <Text style={{ fontSize: 18 }}>
                                                        {String(parsed.gender).toLowerCase().includes('woman') || String(parsed.gender).toLowerCase().includes('female') ? '♀' : '♂'}
                                                    </Text>
                                                </View>
                                                <Text style={{ ...Typography.bodySmall, color: AppColors.textPrimary }}>
                                                    Gender
                                                </Text>
                                            </View>
                                            <Text style={{ ...Typography.bodySmall, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                                {parsed.gender}
                                            </Text>
                                        </View>
                                    )}

                                    {parsed.race && (
                                        <View style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            paddingVertical: 12,
                                            borderBottomWidth: parsed.emotion ? 1 : 0,
                                            borderBottomColor: '#F3F4F6',
                                        }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                                <View style={{
                                                    width: 36,
                                                    height: 36,
                                                    borderRadius: 10,
                                                    backgroundColor: '#ECFDF5',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}>
                                                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                                                        <Circle cx={12} cy={12} r={10} stroke={AppColors.success} strokeWidth={2} />
                                                        <Path d="M12 6v6l4 2" stroke={AppColors.success} strokeWidth={2} strokeLinecap="round" />
                                                    </Svg>
                                                </View>
                                                <Text style={{ ...Typography.bodySmall, color: AppColors.textPrimary }}>
                                                    Dominant Race
                                                </Text>
                                            </View>
                                            <Text style={{ ...Typography.bodySmall, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                                {parsed.race}
                                            </Text>
                                        </View>
                                    )}

                                    {parsed.emotion && (
                                        <View style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            paddingVertical: 12,
                                        }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                                <View style={{
                                                    width: 36,
                                                    height: 36,
                                                    borderRadius: 10,
                                                    backgroundColor: '#FEF3C7',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}>
                                                    <Text style={{ fontSize: 18 }}>
                                                        😊
                                                    </Text>
                                                </View>
                                                <Text style={{ ...Typography.bodySmall, color: AppColors.textPrimary }}>
                                                    Dominant Emotion
                                                </Text>
                                            </View>
                                            <Text style={{ ...Typography.bodySmall, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                                {parsed.emotion}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            )}

                            {!parsed.hasData && apiData && (
                                <View style={{
                                    backgroundColor: AppColors.white,
                                    borderRadius: 16,
                                    padding: 20,
                                    borderWidth: 1,
                                    borderColor: '#E5E7EB',
                                    gap: 12,
                                }}>
                                    <Text style={{ ...Typography.bodyLarge, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                        API Response
                                    </Text>
                                    <Text style={{ ...Typography.bodySmall, color: '#6B7280', lineHeight: 20 }}>
                                        The service responded, but no restored image or DeepFace attributes were found in the expected fields.
                                    </Text>
                                    <View style={{ backgroundColor: '#F9FAFB', borderRadius: 10, padding: 12 }}>
                                        <Text style={{ ...Typography.caption, color: '#6B7280' }} numberOfLines={8}>
                                            {JSON.stringify(parsed.raw, null, 2)}
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {/* Action Buttons */}
                            <View style={{ gap: 10 }}>
                                <Pressable
                                    onPress={() => Alert.alert('Download Report', 'Enhanced image and report downloaded successfully.')}
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
