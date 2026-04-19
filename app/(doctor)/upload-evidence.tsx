import { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput as RNTextInput, Image, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { AppColors, Typography, Spacing } from '@/constants/theme';
import { DiscardChangesModal } from '@/components/ui/discard-changes-modal';
import { BottomDrawer } from '@/components/bottom-drawer';
import { DeepFakeIcon, FaceIcon, DnaIcon, ReconstructIcon, ChevronRightIcon as ChevronRightModelIcon, SkipIcon } from '@/components/model-icons';

const SCREEN_HEIGHT = Dimensions.get('window').height;

function BackIcon() {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path
                d="M19 12H5M12 19l-7-7 7-7"
                stroke={AppColors.textPrimary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

function UploadIcon() {
    return (
        <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
            <Path
                d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
                stroke={AppColors.primary}
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

function XIcon() {
    return (
        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Path
                d="M18 6L6 18M6 6l12 12"
                stroke="#EF4444"
                strokeWidth={2.5}
                strokeLinecap="round"
            />
        </Svg>
    );
}

function ChevronIcon() {
    return (
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path
                d="M6 9l6 6 6-6"
                stroke={AppColors.border}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

function FileIcon() {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path
                d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
                stroke={AppColors.primary}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M14 2v6h6"
                stroke={AppColors.primary}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

const mockCases = ['Case #001 - Suspicious Fire', 'Case #002 - Vehicle Theft', 'Case #003 - Homicide Investigation', 'Case #004 - Cyber Fraud'];

const MODEL_OPTIONS = [
    { key: 'deepfake', title: 'Deep Fake Detection', description: 'Detect AI-generated or manipulated images', icon: DeepFakeIcon },
    { key: 'face', title: 'Face Recognition', description: 'Identify faces against a reference database', icon: FaceIcon },
    { key: 'dna', title: 'DNA Phenotype Prediction', description: 'Predict physical traits from DNA sequences', icon: DnaIcon },
    { key: 'reconstruct', title: 'Reconstruct Image', description: 'Enhance low-quality or blurry photos', icon: ReconstructIcon },
];

const MODEL_NAME_MAP: Record<string, string> = {
    deepfake: 'Deep Fake Detection',
    face: 'Face Recognition',
    dna: 'DNA Phenotype Prediction',
    reconstruct: 'Reconstruct Image',
};

interface UploadedFile {
    id: string;
    name: string;
    size: string;
    type: string;
}

export default function UploadEvidence() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<{ caseId?: string }>();
    const [evidenceName, setEvidenceName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedCase, setSelectedCase] = useState(params.caseId ? mockCases.find(c => c.includes(params.caseId!)) || '' : '');
    const [selectedModelKey, setSelectedModelKey] = useState<string>('');
    const [caseDropdownOpen, setCaseDropdownOpen] = useState(false);
    const [modelDrawerOpen, setModelDrawerOpen] = useState(false);
    const [files, setFiles] = useState<UploadedFile[]>([
        { id: '1', name: 'evidence_photo_01.jpg', size: '2.4 MB', type: 'image' },
        { id: '2', name: 'audio_recording.mp3', size: '5.1 MB', type: 'audio' },
    ]);
    const [showDiscard, setShowDiscard] = useState(false);
    const [successDrawerVisible, setSuccessDrawerVisible] = useState(false);
    const isDirty = evidenceName.length > 0 || description.length > 0 || selectedCase.length > 0 || selectedModelKey.length > 0;

    const handleBack = () => {
        if (isDirty) { setShowDiscard(true); } else { router.back(); }
    };

    const removeFile = (id: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== id));
    };

    const addMockFile = () => {
        const newFile: UploadedFile = {
            id: Date.now().toString(),
            name: `evidence_${files.length + 1}.pdf`,
            size: '1.2 MB',
            type: 'document',
        };
        setFiles((prev) => [...prev, newFile]);
    };

    const handleSubmit = () => {
        setSuccessDrawerVisible(true);
    };

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
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: Spacing.md,
                        paddingVertical: 14,
                        backgroundColor: AppColors.white,
                        gap: 12,
                    }}
                >
                    <Pressable onPress={handleBack} hitSlop={8}>
                        <BackIcon />
                    </Pressable>
                    <Text style={{ ...Typography.h5, color: AppColors.textPrimary, flex: 1 }}>
                        Upload Evidence
                    </Text>
                </View>

                <View style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, gap: 20 }}>
                    {/* File Upload Area — at the top */}
                    <View style={{ gap: 8 }}>
                        <Text style={{ ...Typography.bodySmall, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.textPrimary }}>
                            Upload Files
                        </Text>
                        <Pressable
                            onPress={addMockFile}
                            style={({ pressed }) => ({
                                backgroundColor: pressed ? '#F3F4F6' : AppColors.white,
                                borderRadius: 12,
                                borderCurve: 'continuous' as const,
                                borderWidth: 1.5,
                                borderColor: AppColors.primary,
                                borderStyle: 'dashed',
                                paddingVertical: 24,
                                alignItems: 'center',
                                gap: 8,
                            })}
                        >
                            <UploadIcon />
                            <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.primary }}>
                                Tap to upload files
                            </Text>
                            <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: AppColors.border }}>
                                Supports images, audio, video, documents
                            </Text>
                        </Pressable>
                    </View>

                    {/* Uploaded Files */}
                    {files.length > 0 && (
                        <View style={{ gap: 10 }}>
                            <Text style={{ ...Typography.bodySmall, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.textPrimary }}>
                                Uploaded Files ({files.length})
                            </Text>
                            {files.map((file) => (
                                <View
                                    key={file.id}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        backgroundColor: AppColors.white,
                                        borderRadius: 10,
                                        borderWidth: 1,
                                        borderColor: '#E5E7EB',
                                        paddingHorizontal: 12,
                                        paddingVertical: 10,
                                        gap: 10,
                                    }}
                                >
                                    <FileIcon />
                                    <View style={{ flex: 1 }}>
                                        <Text
                                            style={{ fontSize: 13, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.textPrimary }}
                                            numberOfLines={1}
                                        >
                                            {file.name}
                                        </Text>
                                        <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_400Regular', color: AppColors.border }}>
                                            {file.size}
                                        </Text>
                                    </View>
                                    <Pressable onPress={() => removeFile(file.id)} hitSlop={8}>
                                        <XIcon />
                                    </Pressable>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Evidence Name */}
                    <View style={{ gap: 8 }}>
                        <Text style={{ ...Typography.bodySmall, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.textPrimary }}>
                            Evidence Name
                        </Text>
                        <View
                            style={{
                                backgroundColor: AppColors.white,
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: '#E5E7EB',
                                height: 50,
                                paddingHorizontal: 14,
                                justifyContent: 'center',
                            }}
                        >
                            <RNTextInput
                                placeholder="Enter evidence name"
                                value={evidenceName}
                                onChangeText={setEvidenceName}
                                placeholderTextColor={AppColors.border}
                                style={{
                                    fontSize: 14,
                                    fontFamily: 'IBMPlexSans_400Regular',
                                    color: AppColors.textPrimary,
                                }}
                            />
                        </View>
                    </View>

                    {/* Select Case dropdown */}
                    <View style={{ gap: 8, zIndex: 20 }}>
                        <Text style={{ ...Typography.bodySmall, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.textPrimary }}>
                            Select Case
                        </Text>
                        <Pressable
                            onPress={() => {
                                setCaseDropdownOpen(!caseDropdownOpen);
                            }}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                backgroundColor: AppColors.white,
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: caseDropdownOpen ? AppColors.primary : '#E5E7EB',
                                height: 50,
                                paddingHorizontal: 14,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 14,
                                    fontFamily: 'IBMPlexSans_400Regular',
                                    color: selectedCase ? AppColors.textPrimary : AppColors.border,
                                }}
                            >
                                {selectedCase || 'Choose a case'}
                            </Text>
                            <ChevronIcon />
                        </Pressable>
                        {caseDropdownOpen && (
                            <View
                                style={{
                                    position: 'absolute',
                                    top: 82,
                                    left: 0,
                                    right: 0,
                                    backgroundColor: AppColors.white,
                                    borderRadius: 10,
                                    borderWidth: 1,
                                    borderColor: '#E5E7EB',
                                    overflow: 'hidden',
                                    elevation: 4,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                }}
                            >
                                {mockCases.map((c) => (
                                    <Pressable
                                        key={c}
                                        onPress={() => {
                                            setSelectedCase(c);
                                            setCaseDropdownOpen(false);
                                        }}
                                        style={({ pressed }) => ({
                                            paddingVertical: 12,
                                            paddingHorizontal: 14,
                                            backgroundColor: pressed ? '#F3F4F6' : selectedCase === c ? '#EEF2FF' : AppColors.white,
                                        })}
                                    >
                                        <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_400Regular', color: AppColors.textPrimary }}>
                                            {c}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Analysis Model — BottomDrawer selector */}
                    <View style={{ gap: 8 }}>
                        <Text style={{ ...Typography.bodySmall, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.textPrimary }}>
                            Analysis Model
                        </Text>
                        <Pressable
                            onPress={() => setModelDrawerOpen(true)}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                backgroundColor: AppColors.white,
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: selectedModelKey ? AppColors.primary : '#E5E7EB',
                                height: 50,
                                paddingHorizontal: 14,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 14,
                                    fontFamily: selectedModelKey ? 'IBMPlexSans_500Medium' : 'IBMPlexSans_400Regular',
                                    color: selectedModelKey ? AppColors.primary : AppColors.border,
                                    flex: 1,
                                }}
                            >
                                {selectedModelKey ? MODEL_NAME_MAP[selectedModelKey] : 'None — Skip analysis'}
                            </Text>
                            {selectedModelKey ? (
                                <Pressable
                                    onPress={() => setSelectedModelKey('')}
                                    hitSlop={8}
                                >
                                    <XIcon />
                                </Pressable>
                            ) : (
                                <ChevronIcon />
                            )}
                        </Pressable>
                    </View>

                    {/* Description */}
                    <View style={{ gap: 8 }}>
                        <Text style={{ ...Typography.bodySmall, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.textPrimary }}>
                            Description
                        </Text>
                        <View
                            style={{
                                backgroundColor: AppColors.white,
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: '#E5E7EB',
                                paddingHorizontal: 14,
                                paddingVertical: 12,
                                minHeight: 100,
                            }}
                        >
                            <RNTextInput
                                placeholder="Describe the evidence..."
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                textAlignVertical="top"
                                style={{
                                    flex: 1,
                                    fontSize: 14,
                                    fontFamily: 'IBMPlexSans_400Regular',
                                    color: AppColors.textPrimary,
                                    minHeight: 76,
                                }}
                                placeholderTextColor={AppColors.border}
                            />
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                        <Pressable
                            onPress={handleBack}
                            style={({ pressed }) => ({
                                flex: 1,
                                backgroundColor: pressed ? '#F3F4F6' : AppColors.white,
                                borderRadius: 12,
                                borderCurve: 'continuous' as const,
                                borderWidth: 1.5,
                                borderColor: '#D1D5DB',
                                height: 52,
                                alignItems: 'center',
                                justifyContent: 'center',
                            })}
                        >
                            <Text style={{ ...Typography.button, color: AppColors.textPrimary }}>Cancel</Text>
                        </Pressable>
                        <Pressable
                            onPress={handleSubmit}
                            style={({ pressed }) => ({
                                flex: 1,
                                backgroundColor: pressed ? AppColors.primaryHover : AppColors.primary,
                                borderRadius: 12,
                                borderCurve: 'continuous' as const,
                                height: 52,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 6,
                            })}
                        >
                            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                                <Path d="M12 5v14M5 12h14" stroke={AppColors.white} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                            </Svg>
                            <Text style={{ ...Typography.button, color: AppColors.white, fontSize: 14 }}>
                                {selectedModelKey ? 'Analyze' : 'Upload'}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>

            {/* Model Selection Drawer */}
            <BottomDrawer
                visible={modelDrawerOpen}
                onClose={() => setModelDrawerOpen(false)}
                title="Select Analysis Model"
                subtitle="Analysis will run automatically after upload"
            >
                {/* None option */}
                <Pressable
                    onPress={() => {
                        setSelectedModelKey('');
                        setModelDrawerOpen(false);
                    }}
                    style={({ pressed }) => ({
                        backgroundColor: pressed ? '#F8FAFC' : !selectedModelKey ? '#F0F4FF' : AppColors.white,
                        borderRadius: 12,
                        borderWidth: 1.5,
                        borderColor: !selectedModelKey ? AppColors.primary : '#E5E7EB',
                        padding: 14,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                    })}
                >
                    <View style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        backgroundColor: '#F3F4F6',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <SkipIcon size={20} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                            None — Skip Analysis
                        </Text>
                        <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>
                            Just upload evidence without running a model
                        </Text>
                    </View>
                    {!selectedModelKey && (
                        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                            <Path d="M20 6L9 17l-5-5" stroke={AppColors.primary} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                    )}
                </Pressable>

                {/* Model options */}
                {MODEL_OPTIONS.map((model) => {
                    const Icon = model.icon;
                    const isSelected = selectedModelKey === model.key;
                    return (
                        <Pressable
                            key={model.key}
                            onPress={() => {
                                setSelectedModelKey(model.key);
                                setModelDrawerOpen(false);
                            }}
                            style={({ pressed }) => ({
                                backgroundColor: pressed ? '#F8FAFC' : isSelected ? '#F0F4FF' : AppColors.white,
                                borderRadius: 12,
                                borderWidth: 1.5,
                                borderColor: isSelected ? AppColors.primary : '#E5E7EB',
                                padding: 14,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 12,
                            })}
                        >
                            <View style={{
                                width: 40,
                                height: 40,
                                borderRadius: 12,
                                backgroundColor: AppColors.primary + '10',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <Icon size={20} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                    {model.title}
                                </Text>
                                <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>
                                    {model.description}
                                </Text>
                            </View>
                            {isSelected ? (
                                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                                    <Path d="M20 6L9 17l-5-5" stroke={AppColors.primary} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                                </Svg>
                            ) : (
                                <ChevronRightModelIcon size={16} />
                            )}
                        </Pressable>
                    );
                })}
            </BottomDrawer>

            <DiscardChangesModal visible={showDiscard} onCancel={() => setShowDiscard(false)} onDiscard={() => { setShowDiscard(false); router.back(); }} />

            {/* Success Drawer */}
            <BottomDrawer
                visible={successDrawerVisible}
                onClose={() => {
                    setSuccessDrawerVisible(false);
                    router.back();
                }}
                title=""
                height={SCREEN_HEIGHT * 0.42}
            >
                <View style={{ alignItems: 'center', gap: 16, paddingTop: 8, paddingBottom: 16 }}>
                    <View style={{
                        width: 64,
                        height: 64,
                        borderRadius: 32,
                        backgroundColor: '#DCFCE7',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                            <Path d="M20 6L9 17l-5-5" stroke={AppColors.success} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                    </View>
                    <Text style={{ ...Typography.h5, color: AppColors.textPrimary, textAlign: 'center' }}>
                        Evidence Uploaded
                    </Text>
                    <Text style={{ ...Typography.bodySmall, color: '#6B7280', textAlign: 'center', lineHeight: 20, paddingHorizontal: 16 }}>
                        {selectedModelKey
                            ? 'Your evidence has been added to the case. Analysis is running in the background — you\'ll be notified when results are ready.'
                            : 'Your evidence has been successfully added to the case.'}
                    </Text>
                    <Pressable
                        onPress={() => {
                            setSuccessDrawerVisible(false);
                            router.back();
                        }}
                        style={({ pressed }) => ({
                            width: '100%',
                            backgroundColor: pressed ? AppColors.primaryHover : AppColors.primary,
                            borderRadius: 12,
                            height: 48,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: 4,
                        })}
                    >
                        <Text style={{ ...Typography.button, color: AppColors.white }}>Done</Text>
                    </Pressable>
                </View>
            </BottomDrawer>
        </View>
    );
}
