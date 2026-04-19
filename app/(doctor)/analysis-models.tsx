import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { AppColors, Typography, Spacing } from '@/constants/theme';
import { DeepFakeIcon, FaceIcon, DnaIcon, ReconstructIcon, RequestIcon, ChevronRightIcon } from '@/components/model-icons';

/* ─── Icons ─── */
function BackIcon() {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M19 12H5M12 19l-7-7 7-7" stroke={AppColors.textPrimary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

const analysisModels = [
    {
        title: 'Deep Fake Detection',
        description: 'A tool that finds fake or edited images by looking for digital traces left by AI.',
        icon: DeepFakeIcon,
        hasLaunch: true,
        modelType: 'deepfake',
    },
    {
        title: 'Face Recognition',
        description: "A system that identifies or confirms a person's identity by analyzing their facial features.",
        icon: FaceIcon,
        hasLaunch: true,
        modelType: 'face',
    },
    {
        title: 'DNA Phenotype Prediction',
        description: 'A specialized tool that predicts physical traits from DNA sequences for forensic identification.',
        icon: DnaIcon,
        hasLaunch: true,
        modelType: 'dna',
    },
    {
        title: 'Reconstruct Image',
        description: 'An AI tool that repairs low-quality or blurry photos to make the details much clearer.',
        icon: ReconstructIcon,
        hasLaunch: true,
        modelType: 'reconstruct',
    },
    {
        title: 'Request Custom Model',
        description: 'Need a specific forensic tool? Describe your requirements and our team will build it.',
        icon: RequestIcon,
        hasLaunch: false,
        modelType: null,
    },
];

export default function AnalysisModelsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

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
                            Analysis Models
                        </Text>
                        <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: AppColors.border }}>
                            Select a forensic analysis model to start
                        </Text>
                    </View>
                </View>

                {/* Model cards */}
                <View style={{ padding: 16, gap: 12 }}>
                    {analysisModels.map((model) => {
                        const Icon = model.icon;
                        const isDashed = !model.hasLaunch;
                        return isDashed ? (
                            <View
                                key={model.title}
                                style={{
                                    backgroundColor: AppColors.white,
                                    borderRadius: 16,
                                    borderCurve: 'continuous' as const,
                                    borderWidth: 1.5,
                                    borderColor: '#E5E7EB',
                                    borderStyle: 'dashed',
                                    padding: 16,
                                    gap: 10,
                                    alignItems: 'center',
                                }}
                            >
                                <Icon />
                                <Text style={{ ...Typography.bodyLarge, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>
                                    {model.title}
                                </Text>
                                <Text style={{ ...Typography.caption, color: '#6B7280', lineHeight: 18, textAlign: 'center' }}>
                                    {model.description}
                                </Text>
                            </View>
                        ) : (
                            <Pressable
                                key={model.title}
                                onPress={() => router.push({
                                    pathname: '/(doctor)/model-upload',
                                    params: { modelType: model.modelType },
                                })}
                                style={({ pressed }) => ({
                                    backgroundColor: pressed ? '#F8FAFC' : AppColors.white,
                                    borderRadius: 16,
                                    borderCurve: 'continuous' as const,
                                    borderWidth: 1,
                                    borderColor: '#E5E7EB',
                                    padding: 16,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 14,
                                })}
                            >
                                <View style={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: 14,
                                    backgroundColor: AppColors.primary + '08',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <Icon />
                                </View>
                                <View style={{ flex: 1, gap: 4 }}>
                                    <Text style={{ ...Typography.bodyLarge, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>
                                        {model.title}
                                    </Text>
                                    <Text style={{ ...Typography.caption, color: '#6B7280', lineHeight: 18 }} numberOfLines={2}>
                                        {model.description}
                                    </Text>
                                </View>
                                <ChevronRightIcon />
                            </Pressable>
                        );
                    })}

                    {/* Footer */}
                    <Text style={{ textAlign: 'center', ...Typography.caption, color: '#6B7280', marginTop: 8 }}>
                        Need more models? Visit the{' '}
                        <Text style={{ color: AppColors.primary, textDecorationLine: 'underline' }}>
                            Full Analysis Models Page
                        </Text>
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}
