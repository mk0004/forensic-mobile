import { useState, useRef } from 'react';
import { View, Text, ScrollView, Pressable, Image, Alert, Dimensions, PanResponder } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { AppColors, Typography, Spacing } from '@/constants/theme';
import { AddToCaseModal } from '@/components/add-to-case-modal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDER_WIDTH = SCREEN_WIDTH - Spacing.md * 2 - 2; // minus padding and border

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

/* ─── Quality metrics ─── */
const METRICS = [
    { label: 'Resolution Increase', value: '4x Upscale', detail: '512×512 → 2048×2048' },
    { label: 'Noise Reduction', value: '78%', detail: 'Heavy noise removed' },
    { label: 'Sharpness Improvement', value: '3.2x', detail: 'Edge clarity enhanced' },
    { label: 'PSNR', value: '34.7 dB', detail: 'Peak Signal-to-Noise Ratio' },
    { label: 'SSIM', value: '0.962', detail: 'Structural Similarity Index' },
];

export default function ResultsReconstructScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
    const [caseModalVisible, setCaseModalVisible] = useState(false);
    const [sliderPosition, setSliderPosition] = useState(0.5);

    // PanResponder for the before/after slider
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
                                Image Reconstruction
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={{ padding: Spacing.md, gap: 16 }}>
                    {/* Before/After Slider */}
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
                                Drag the slider to compare
                            </Text>
                        </View>

                        {imageUri ? (
                            <View
                                style={{ height: 250, position: 'relative', overflow: 'hidden' }}
                                {...panResponder.panHandlers}
                            >
                                {/* "After" image (full) - mock: same image but we'll tint it to simulate enhancement */}
                                <Image
                                    source={{ uri: imageUri }}
                                    style={{ width: '100%', height: 250, resizeMode: 'cover' }}
                                />

                                {/* "Before" image (clipped) - mock: blurred overlay to simulate lower quality */}
                                <View style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: SLIDER_WIDTH * sliderPosition,
                                    height: 250,
                                    overflow: 'hidden',
                                }}>
                                    <Image
                                        source={{ uri: imageUri }}
                                        style={{ width: SLIDER_WIDTH, height: 250, resizeMode: 'cover', opacity: 0.5 }}
                                        blurRadius={4}
                                    />
                                    {/* Before label */}
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
                                            BEFORE
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
                                    {/* Slider handle */}
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
                                        AFTER
                                    </Text>
                                </View>
                            </View>
                        ) : (
                            <View style={{ height: 250, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB' }}>
                                <Text style={{ ...Typography.bodySmall, color: '#9CA3AF' }}>No image available</Text>
                            </View>
                        )}
                    </View>

                    {/* Enhancement Details */}
                    <View style={{
                        backgroundColor: AppColors.white,
                        borderRadius: 16,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        gap: 12,
                    }}>
                        <Text style={{ ...Typography.bodyLarge, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                            Enhancement Details
                        </Text>

                        {METRICS.slice(0, 3).map((m) => (
                            <View key={m.label} style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                paddingVertical: 10,
                                borderBottomWidth: 1,
                                borderBottomColor: '#F3F4F6',
                            }}>
                                <View>
                                    <Text style={{ ...Typography.bodySmall, color: AppColors.textPrimary }}>{m.label}</Text>
                                    <Text style={{ ...Typography.caption, color: '#9CA3AF' }}>{m.detail}</Text>
                                </View>
                                <View style={{
                                    backgroundColor: '#DCFCE7',
                                    paddingHorizontal: 10,
                                    paddingVertical: 4,
                                    borderRadius: 8,
                                }}>
                                    <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.success }}>
                                        {m.value}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Quality Metrics */}
                    <View style={{
                        backgroundColor: AppColors.white,
                        borderRadius: 16,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        gap: 12,
                    }}>
                        <Text style={{ ...Typography.bodyLarge, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                            Quality Metrics
                        </Text>

                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            {METRICS.slice(3).map((m) => (
                                <View key={m.label} style={{
                                    flex: 1,
                                    backgroundColor: '#F0F4FF',
                                    borderRadius: 12,
                                    padding: 14,
                                    alignItems: 'center',
                                    gap: 4,
                                }}>
                                    <Text style={{ fontSize: 22, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.primary }}>
                                        {m.value}
                                    </Text>
                                    <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_500Medium', color: '#6B7280', textAlign: 'center' }}>
                                        {m.label}
                                    </Text>
                                    <Text style={{ fontSize: 10, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF', textAlign: 'center' }}>
                                        {m.detail}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>

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
                </View>
            </ScrollView>

            <AddToCaseModal
                visible={caseModalVisible}
                onClose={() => setCaseModalVisible(false)}
            />
        </View>
    );
}
