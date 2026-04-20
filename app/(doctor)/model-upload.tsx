import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, ActivityIndicator, TextInput, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { AppColors, Typography, Spacing } from '@/constants/theme';
import { DeepFakeIcon, FaceIcon, DnaIcon as DnaModelIcon, ReconstructIcon } from '@/components/model-icons';

const API_BASE = 'https://anastamer-deepface-communicated.hf.space';

type ModelType = 'deepfake' | 'face' | 'dna' | 'reconstruct';

const MODEL_INFO: Record<ModelType, { title: string; subtitle: string }> = {
    deepfake: { title: 'Deep Fake Detection', subtitle: 'Upload an image to check for AI manipulation' },
    face: { title: 'Face Recognition', subtitle: 'Upload a face image for identity recognition' },
    dna: { title: 'DNA Phenotype Prediction', subtitle: 'Enter a DNA sequence or upload a batch file' },
    reconstruct: { title: 'Reconstruct Image', subtitle: 'Upload a low-quality image to enhance' },
};

/* ─── Icons ─── */
function BackIcon() {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M19 12H5M12 19l-7-7 7-7" stroke={AppColors.textPrimary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function CameraIcon() {
    return (
        <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
            <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M12 17a4 4 0 100-8 4 4 0 000 8z" stroke={AppColors.primary} strokeWidth={1.5} />
        </Svg>
    );
}

function GalleryIcon() {
    return (
        <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
            <Path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z" stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM21 15l-5-5L5 21" stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function FileIcon() {
    return (
        <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
            <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function CloseIcon() {
    return (
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M18 6L6 18M6 6l12 12" stroke={AppColors.white} strokeWidth={2} strokeLinecap="round" />
        </Svg>
    );
}

const MODEL_ICONS: Record<ModelType, React.FC> = {
    deepfake: () => <DeepFakeIcon size={48} />,
    face: () => <FaceIcon size={48} />,
    dna: () => <DnaModelIcon size={40} />,
    reconstruct: () => <ReconstructIcon size={44} />,
};

export default function ModelUploadScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { modelType } = useLocalSearchParams<{ modelType: string }>();
    const model = (modelType as ModelType) || 'deepfake';
    const info = MODEL_INFO[model];
    const ModelIcon = MODEL_ICONS[model];

    const isDna = model === 'dna';

    // Image state (for non-DNA models)
    const [imageUri, setImageUri] = useState<string | null>(null);

    // DNA state
    const [dnaMode, setDnaMode] = useState<'text' | 'file'>('text');
    const [dnaText, setDnaText] = useState('');
    const [dnaFile, setDnaFile] = useState<{ name: string; uri: string } | null>(null);

    // Loading state for API calls
    const [loading, setLoading] = useState(false);

    const canProceed = isDna
        ? (dnaMode === 'text' ? dnaText.trim().length > 0 : dnaFile !== null)
        : imageUri !== null;

    async function pickFromCamera() {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permission needed', 'Camera access is required to capture photos.');
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.8,
        });
        if (!result.canceled && result.assets[0]) {
            setImageUri(result.assets[0].uri);
        }
    }

    async function pickFromGallery() {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.8,
        });
        if (!result.canceled && result.assets[0]) {
            setImageUri(result.assets[0].uri);
        }
    }

    async function pickDnaFile() {
        const result = await DocumentPicker.getDocumentAsync({
            type: ['text/plain', 'text/csv', 'application/octet-stream'],
            copyToCacheDirectory: true,
        });
        if (!result.canceled && result.assets[0]) {
            setDnaFile({ name: result.assets[0].name, uri: result.assets[0].uri });
        }
    }

    async function handleAnalyze() {
        if (!canProceed) return;

        // For Deep Fake and Face Recognition — call real API
        if ((model === 'deepfake' || model === 'face') && imageUri) {
            setLoading(true);
            try {
                const formData = new FormData();
                formData.append('file', {
                    uri: imageUri,
                    type: 'image/jpeg',
                    name: 'upload.jpg',
                } as any);
                if (model === 'face') {
                    formData.append('model_name', 'ArcFace');
                }
                formData.append('detector_backend', 'retinaface');

                const endpoint = model === 'deepfake' ? '/liveness' : '/recognize';

                // AbortController for timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

                const response = await fetch(`${API_BASE}${endpoint}`, {
                    method: 'POST',
                    body: formData,
                    signal: controller.signal,
                    // Do NOT set Content-Type manually — RN auto-sets it with the boundary
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    const errorText = await response.text().catch(() => '');
                    let errorMessage = `Server returned ${response.status}`;
                    try {
                        const errorJson = JSON.parse(errorText);
                        errorMessage = errorJson.error || errorJson.message || errorMessage;
                    } catch {
                        if (errorText) errorMessage = errorText;
                    }
                    setLoading(false);

                    // Navigate to result page with error instead of Alert
                    const resultPath = model === 'deepfake'
                        ? '/(doctor)/results-deepfake'
                        : '/(doctor)/results-face-recognition';
                    router.push({
                        pathname: resultPath as any,
                        params: { imageUri, errorData: errorMessage },
                    });
                    return;
                }

                const data = await response.json();
                setLoading(false);

                if (model === 'deepfake') {
                    router.push({
                        pathname: '/(doctor)/results-deepfake',
                        params: { imageUri, apiData: JSON.stringify(data) },
                    });
                } else {
                    router.push({
                        pathname: '/(doctor)/results-face-recognition',
                        params: { imageUri, apiData: JSON.stringify(data) },
                    });
                }
            } catch (error: any) {
                setLoading(false);
                const isTimeout = error?.name === 'AbortError';
                const isNetwork = error?.message?.includes('Network request failed');
                Alert.alert(
                    'Analysis Failed',
                    isTimeout
                        ? 'The analysis server is taking too long to respond. The server may be waking up — please try again in a minute.'
                        : isNetwork
                            ? 'Cannot reach the analysis server. Please check your internet connection and try again.'
                            : `Error: ${error?.message || 'Unknown error occurred'}`,
                    [{ text: 'OK' }]
                );
            }
            return;
        }

        // For DNA — navigate with mock
        if (model === 'dna') {
            router.push({
                pathname: '/(doctor)/results-dna',
                params: {
                    inputMode: dnaMode,
                    dnaText: dnaMode === 'text' ? dnaText : '',
                    fileName: dnaMode === 'file' ? dnaFile?.name || '' : '',
                },
            });
            return;
        }

        // For Reconstruct — navigate with mock
        if (model === 'reconstruct') {
            router.push({
                pathname: '/(doctor)/results-reconstruct',
                params: { imageUri: imageUri || '' },
            });
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: AppColors.surface }}>
            <ScrollView
                contentContainerStyle={{
                    paddingTop: insets.top,
                    paddingBottom: insets.bottom + 40,
                }}
                keyboardShouldPersistTaps="handled"
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
                            {info.title}
                        </Text>
                        <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: AppColors.border }}>
                            {info.subtitle}
                        </Text>
                    </View>
                </View>

                {/* Model Icon */}
                <View style={{ alignItems: 'center', marginTop: 32, marginBottom: 24 }}>
                    <View style={{
                        width: 88,
                        height: 88,
                        borderRadius: 20,
                        backgroundColor: '#EEF2FF',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <ModelIcon />
                    </View>
                </View>

                {isDna ? (
                    /* ─── DNA Input Section ─── */
                    <View style={{ paddingHorizontal: Spacing.md, gap: 16 }}>
                        {/* Mode toggle */}
                        <View style={{
                            flexDirection: 'row',
                            backgroundColor: AppColors.white,
                            borderRadius: 12,
                            padding: 4,
                            borderWidth: 1,
                            borderColor: '#E5E7EB',
                        }}>
                            <Pressable
                                onPress={() => setDnaMode('text')}
                                style={{
                                    flex: 1,
                                    paddingVertical: 10,
                                    borderRadius: 10,
                                    backgroundColor: dnaMode === 'text' ? AppColors.primary : 'transparent',
                                    alignItems: 'center',
                                }}
                            >
                                <Text style={{
                                    fontSize: 14,
                                    fontFamily: 'IBMPlexSans_600SemiBold',
                                    color: dnaMode === 'text' ? AppColors.white : AppColors.textPrimary,
                                }}>
                                    Text Input
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={() => setDnaMode('file')}
                                style={{
                                    flex: 1,
                                    paddingVertical: 10,
                                    borderRadius: 10,
                                    backgroundColor: dnaMode === 'file' ? AppColors.primary : 'transparent',
                                    alignItems: 'center',
                                }}
                            >
                                <Text style={{
                                    fontSize: 14,
                                    fontFamily: 'IBMPlexSans_600SemiBold',
                                    color: dnaMode === 'file' ? AppColors.white : AppColors.textPrimary,
                                }}>
                                    File Upload
                                </Text>
                            </Pressable>
                        </View>

                        {dnaMode === 'text' ? (
                            /* Text input */
                            <View style={{ gap: 8 }}>
                                <Text style={{ ...Typography.bodySmall, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                    Enter DNA Sequence
                                </Text>
                                <TextInput
                                    value={dnaText}
                                    onChangeText={setDnaText}
                                    placeholder="Paste your DNA sequence here (e.g. ATCGATCG...)"
                                    placeholderTextColor="#9CA3AF"
                                    multiline
                                    textAlignVertical="top"
                                    style={{
                                        backgroundColor: AppColors.white,
                                        borderRadius: 12,
                                        borderWidth: 1,
                                        borderColor: '#E5E7EB',
                                        padding: 14,
                                        minHeight: 180,
                                        fontSize: 14,
                                        fontFamily: 'IBMPlexSans_400Regular',
                                        color: AppColors.textPrimary,
                                    }}
                                />
                                <Text style={{ ...Typography.caption, color: '#9CA3AF' }}>
                                    Enter the DNA sequence as plain text. Supports FASTA format.
                                </Text>
                            </View>
                        ) : (
                            /* File upload */
                            <Pressable
                                onPress={pickDnaFile}
                                style={{
                                    backgroundColor: AppColors.white,
                                    borderRadius: 16,
                                    borderWidth: 2,
                                    borderColor: '#E5E7EB',
                                    borderStyle: 'dashed',
                                    padding: 32,
                                    alignItems: 'center',
                                    gap: 12,
                                }}
                            >
                                {dnaFile ? (
                                    <>
                                        <FileIcon />
                                        <Text style={{ ...Typography.bodySmall, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                            {dnaFile.name}
                                        </Text>
                                        <Pressable
                                            onPress={() => setDnaFile(null)}
                                            style={{
                                                paddingVertical: 6,
                                                paddingHorizontal: 14,
                                                borderRadius: 8,
                                                backgroundColor: '#FEE2E2',
                                            }}
                                        >
                                            <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.error }}>
                                                Remove File
                                            </Text>
                                        </Pressable>
                                    </>
                                ) : (
                                    <>
                                        <FileIcon />
                                        <Text style={{ ...Typography.bodySmall, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>
                                            Upload DNA Sequence File
                                        </Text>
                                        <Text style={{ ...Typography.caption, color: '#9CA3AF', textAlign: 'center' }}>
                                            Supports .txt, .csv, or FASTA files{'\n'}containing batch DNA sequences
                                        </Text>
                                    </>
                                )}
                            </Pressable>
                        )}
                    </View>
                ) : (
                    /* ─── Image Upload Section ─── */
                    <View style={{ paddingHorizontal: Spacing.md, gap: 16 }}>
                        {imageUri ? (
                            /* Image preview */
                            <View style={{
                                backgroundColor: AppColors.white,
                                borderRadius: 16,
                                overflow: 'hidden',
                                borderWidth: 1,
                                borderColor: '#E5E7EB',
                            }}>
                                <Image
                                    source={{ uri: imageUri }}
                                    style={{ width: '100%', height: 280, resizeMode: 'cover' }}
                                />
                                <Pressable
                                    onPress={() => setImageUri(null)}
                                    style={{
                                        position: 'absolute',
                                        top: 12,
                                        right: 12,
                                        width: 32,
                                        height: 32,
                                        borderRadius: 16,
                                        backgroundColor: 'rgba(0,0,0,0.5)',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <CloseIcon />
                                </Pressable>
                                <View style={{ padding: 14 }}>
                                    <Text style={{ ...Typography.bodySmall, color: AppColors.textPrimary, fontFamily: 'IBMPlexSans_500Medium' }}>
                                        Image selected
                                    </Text>
                                    <Text style={{ ...Typography.caption, color: '#9CA3AF', marginTop: 2 }}>
                                        Tap the X to remove and select a different image
                                    </Text>
                                </View>
                            </View>
                        ) : (
                            /* Upload area */
                            <View style={{
                                backgroundColor: AppColors.white,
                                borderRadius: 16,
                                borderWidth: 2,
                                borderColor: '#E5E7EB',
                                borderStyle: 'dashed',
                                padding: 24,
                                alignItems: 'center',
                                gap: 16,
                            }}>
                                {/* Capture Photo */}
                                <Pressable
                                    onPress={pickFromCamera}
                                    style={({ pressed }) => ({
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 10,
                                        backgroundColor: pressed ? '#EEF2FF' : '#F8FAFC',
                                        paddingVertical: 14,
                                        paddingHorizontal: 24,
                                        borderRadius: 12,
                                        borderWidth: 1,
                                        borderColor: '#E5E7EB',
                                        width: '100%',
                                        justifyContent: 'center',
                                    })}
                                >
                                    <CameraIcon />
                                    <Text style={{ fontSize: 15, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>
                                        Capture Photo
                                    </Text>
                                </Pressable>

                                {/* Divider */}
                                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', gap: 12 }}>
                                    <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
                                    <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>or</Text>
                                    <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
                                </View>

                                {/* Upload Image */}
                                <Pressable
                                    onPress={pickFromGallery}
                                    style={({ pressed }) => ({
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 10,
                                        backgroundColor: pressed ? '#EEF2FF' : '#F8FAFC',
                                        paddingVertical: 14,
                                        paddingHorizontal: 24,
                                        borderRadius: 12,
                                        borderWidth: 1,
                                        borderColor: '#E5E7EB',
                                        width: '100%',
                                        justifyContent: 'center',
                                    })}
                                >
                                    <GalleryIcon />
                                    <Text style={{ fontSize: 15, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>
                                        Upload Image
                                    </Text>
                                </Pressable>
                            </View>
                        )}
                    </View>
                )}

                {/* Analyze Button */}
                <View style={{ paddingHorizontal: Spacing.md, marginTop: 24 }}>
                    <Pressable
                        onPress={handleAnalyze}
                        disabled={!canProceed || loading}
                        style={({ pressed }) => ({
                            backgroundColor: !canProceed || loading
                                ? '#D1D5DB'
                                : pressed
                                    ? AppColors.primaryHover
                                    : AppColors.primary,
                            borderRadius: 14,
                            paddingVertical: 16,
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'row',
                            gap: 8,
                        })}
                    >
                        {loading ? (
                            <>
                                <ActivityIndicator color={AppColors.white} size="small" />
                                <Text style={{ ...Typography.button, color: AppColors.white }}>
                                    Analyzing...
                                </Text>
                            </>
                        ) : (
                            <Text style={{ ...Typography.button, color: AppColors.white }}>
                                Analyze Evidence
                            </Text>
                        )}
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    );
}
