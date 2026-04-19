import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
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

/* ─── Phenotype trait colors that match the predicted value ─── */
const TRAIT_COLORS: Record<string, string> = {
    Blue: '#3B82F6',
    Green: '#22C55E',
    Brown: '#92400E',
    Hazel: '#A16207',
    Black: '#1F2937',
    Red: '#DC2626',
    Blonde: '#EAB308',
    Light: '#F5D0A9',
    Medium: '#D4A574',
    Dark: '#8B5E3C',
    European: AppColors.primary,
    African: '#7C3AED',
    Asian: '#F59E0B',
    Mixed: '#06B6D4',
};

function getTraitColor(value: string): string {
    for (const [key, color] of Object.entries(TRAIT_COLORS)) {
        if (value.toLowerCase().includes(key.toLowerCase())) return color;
    }
    return AppColors.secondary;
}

/* ─── Mock phenotype predictions ─── */
const PHENOTYPE_PREDICTIONS = [
    { trait: 'Eye Color', value: 'Blue', confidence: 87 },
    { trait: 'Hair Color', value: 'Brown', confidence: 72 },
    { trait: 'Skin Pigmentation', value: 'Light', confidence: 91 },
    { trait: 'Ancestry', value: 'European', confidence: 84 },
    { trait: 'Hair Type', value: 'Straight', confidence: 68 },
    { trait: 'Freckling', value: 'Light', confidence: 76 },
];

export default function ResultsDnaScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { inputMode, dnaText, fileName } = useLocalSearchParams<{
        inputMode: string;
        dnaText: string;
        fileName: string;
    }>();
    const [caseModalVisible, setCaseModalVisible] = useState(false);
    const [showSequence, setShowSequence] = useState(false);

    const seqLength = dnaText ? dnaText.length : 0;
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

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
                                Phenotype Prediction
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={{ padding: Spacing.md, gap: 16 }}>
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

                        {PHENOTYPE_PREDICTIONS.map((pred) => {
                            const barColor = getTraitColor(pred.value);
                            return (
                                <View key={pred.trait} style={{ gap: 6 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={{ ...Typography.bodySmall, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.textPrimary }}>
                                            {pred.trait}
                                        </Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                            {/* Color swatch */}
                                            <View style={{
                                                width: 12,
                                                height: 12,
                                                borderRadius: 6,
                                                backgroundColor: barColor,
                                                borderWidth: barColor === '#F5D0A9' || barColor === '#EAB308' ? 1 : 0,
                                                borderColor: '#D1D5DB',
                                            }} />
                                            <Text style={{ ...Typography.bodySmall, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                                {pred.value}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Progress bar */}
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <View style={{ flex: 1, height: 10, borderRadius: 5, backgroundColor: '#F3F4F6' }}>
                                            <View style={{
                                                height: 10,
                                                borderRadius: 5,
                                                backgroundColor: barColor,
                                                width: `${pred.confidence}%`,
                                            }} />
                                        </View>
                                        <Text style={{
                                            fontSize: 13,
                                            fontFamily: 'IBMPlexSans_700Bold',
                                            color: barColor,
                                            minWidth: 40,
                                            textAlign: 'right',
                                        }}>
                                            {pred.confidence}%
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>

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
                </View>
            </ScrollView>

            <AddToCaseModal
                visible={caseModalVisible}
                onClose={() => setCaseModalVisible(false)}
            />
        </View>
    );
}
