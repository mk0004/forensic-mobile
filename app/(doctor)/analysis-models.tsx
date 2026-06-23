import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { AppColors, Typography, Spacing } from '@/constants/theme';
import { DeepFakeIcon, FaceIcon, DnaIcon, ReconstructIcon, ChevronRightIcon } from '@/components/model-icons';

/* ─── Icons ─── */
function BackIcon() {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M19 12H5M12 19l-7-7 7-7" stroke={AppColors.textPrimary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function SparkleIcon() {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M12 2l2.09 6.26L20 10.27l-4.91 3.82L16.18 22 12 18.27 7.82 22l1.09-7.91L4 10.27l5.91-2.01L12 2z" stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
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
        badge: 'Popular',
        badgeColor: '#1E2A5E',
    },
    {
        title: 'Face Recognition',
        description: "A system that identifies or confirms a person's identity by analyzing their facial features.",
        icon: FaceIcon,
        hasLaunch: true,
        modelType: 'face',
        badge: null,
        badgeColor: '',
    },
    {
        title: 'DNA Phenotype Prediction',
        description: 'A specialized tool that predicts physical traits from DNA sequences for forensic identification.',
        icon: DnaIcon,
        hasLaunch: true,
        modelType: 'dna',
        badge: 'Beta',
        badgeColor: '#D97706',
    },
    {
        title: 'Reconstruct Image',
        description: 'An AI tool that repairs low-quality or blurry photos to make the details much clearer.',
        icon: ReconstructIcon,
        hasLaunch: true,
        modelType: 'reconstruct',
        badge: null,
        badgeColor: '',
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
                    <View style={{ flex: 1, gap: 1 }}>
                        <Text style={{ fontSize: 17, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.textPrimary }}>
                            Analysis Models
                        </Text>
                        <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>
                            Select a forensic analysis model to start
                        </Text>
                    </View>
                    <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: AppColors.primary + '12', alignItems: 'center', justifyContent: 'center' }}>
                        <SparkleIcon />
                    </View>
                </View>

                {/* Model cards */}
                <View style={{ padding: 16, gap: 10 }}>
                    {analysisModels.map((model) => {
                        const Icon = model.icon;
                        return (
                            <Pressable
                                key={model.title}
                                onPress={() => router.push({
                                    pathname: '/(doctor)/model-upload',
                                    params: { modelType: model.modelType },
                                })}
                                style={({ pressed }) => ({
                                    backgroundColor: pressed ? '#F8FAFC' : AppColors.white,
                                    borderRadius: 14,
                                    borderWidth: 1,
                                    borderColor: '#E5E7EB',
                                    padding: 16,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 14,
                                })}
                            >
                                <View style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 14,
                                    backgroundColor: AppColors.primary + '0A',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <Icon />
                                </View>
                                <View style={{ flex: 1, gap: 3 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <Text style={{ fontSize: 15, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                            {model.title}
                                        </Text>
                                        {model.badge && (
                                            <View style={{ backgroundColor: model.badgeColor + '15', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 }}>
                                                <Text style={{ fontSize: 9, fontFamily: 'IBMPlexSans_600SemiBold', color: model.badgeColor, letterSpacing: 0.3 }}>
                                                    {model.badge}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF', lineHeight: 17 }} numberOfLines={2}>
                                        {model.description}
                                    </Text>
                                </View>
                                <ChevronRightIcon />
                            </Pressable>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
}
