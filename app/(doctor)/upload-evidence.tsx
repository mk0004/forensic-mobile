import { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput as RNTextInput, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';
import { AppColors, Typography, Spacing } from '@/constants/theme';
import { DiscardChangesModal } from '@/components/ui/discard-changes-modal';
import { BottomDrawer } from '@/components/bottom-drawer';
import { DeepFakeIcon, FaceIcon, DnaIcon, ReconstructIcon, ChevronRightIcon as ChevronRightModelIcon, SkipIcon } from '@/components/model-icons';
import { useActiveCasesQuery } from '@/lib/hooks/use-cases-api';
import { useSaveAsEvidenceMutation } from '@/lib/hooks/use-evidence-api';

const SCREEN_HEIGHT = Dimensions.get('window').height;

function BackIcon() {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M19 12H5M12 19l-7-7 7-7" stroke={AppColors.textPrimary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function UploadIcon() {
    return (
        <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
            <Path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke={AppColors.primary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function CameraIcon() {
    return (
        <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
            <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z" stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M12 17a4 4 0 100-8 4 4 0 000 8z" stroke={AppColors.primary} strokeWidth={1.5} />
        </Svg>
    );
}

function EvidenceIcon() {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M14 2v6h6" stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function XIcon() {
    return (
        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Path d="M18 6L6 18M6 6l12 12" stroke="#EF4444" strokeWidth={2.5} strokeLinecap="round" />
        </Svg>
    );
}

function FileIcon() {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M14 2v6h6" stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function ChevronIcon() {
    return (
        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Path d="M6 9l6 6 6-6" stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

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
    const { data: cases, isLoading: casesLoading } = useActiveCasesQuery();
    const saveEvidence = useSaveAsEvidenceMutation();
    const [evidenceName, setEvidenceName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedCaseId, setSelectedCaseId] = useState<number | null>(
        params.caseId ? Number(params.caseId) : null,
    );
    const [selectedModelKey, setSelectedModelKey] = useState<string>('');
    const [caseDropdownOpen, setCaseDropdownOpen] = useState(false);
    const [modelDrawerOpen, setModelDrawerOpen] = useState(false);
    const [files, setFiles] = useState<UploadedFile[]>([
        { id: '1', name: 'evidence_photo_01.jpg', size: '2.4 MB', type: 'image' },
        { id: '2', name: 'audio_recording.mp3', size: '5.1 MB', type: 'audio' },
    ]);
    const [showDiscard, setShowDiscard] = useState(false);
    const [successDrawerVisible, setSuccessDrawerVisible] = useState(false);

    const caseOptions = (cases ?? []).map((c) => ({ id: c.id, label: `Case #${c.id} - ${c.name}` }));
    const selectedCaseLabel = caseOptions.find((c) => c.id === selectedCaseId)?.label ?? '';
    const isDirty = evidenceName.length > 0 || description.length > 0 || selectedCaseId !== null || selectedModelKey.length > 0;

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

    const addCapturedFile = () => {
        const newFile: UploadedFile = {
            id: Date.now().toString(),
            name: `capture_${files.length + 1}.jpg`,
            size: '3.8 MB',
            type: 'image',
        };
        setFiles((prev) => [...prev, newFile]);
    };

    const handleSubmit = () => {
        if (selectedCaseId === null) {
            return;
        }
        saveEvidence.mutate(
            {
                name: evidenceName,
                model_used: selectedModelKey,
                case_id: selectedCaseId,
                data: description ? { description } : {},
            },
            {
                onSuccess: () => setSuccessDrawerVisible(true),
            },
        );
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
                    <Pressable onPress={handleBack} hitSlop={8}>
                        <BackIcon />
                    </Pressable>
                    <View style={{ flex: 1, gap: 1 }}>
                        <Text style={{ fontSize: 17, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.textPrimary }}>
                            Upload Evidence
                        </Text>
                        <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>
                            Add files or capture new evidence
                        </Text>
                    </View>
                    <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: AppColors.primary + '12', alignItems: 'center', justifyContent: 'center' }}>
                        <EvidenceIcon />
                    </View>
                </View>

                <View style={{ paddingHorizontal: Spacing.md, paddingTop: 20, gap: 16 }}>
                    {/* Upload Methods - two cards side by side */}
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <Pressable
                            onPress={addMockFile}
                            style={({ pressed }) => ({
                                flex: 1,
                                backgroundColor: pressed ? '#F3F4F6' : AppColors.white,
                                borderRadius: 14,
                                borderWidth: 1.5,
                                borderColor: AppColors.primary + '40',
                                borderStyle: 'dashed',
                                paddingVertical: 24,
                                alignItems: 'center',
                                gap: 10,
                            })}
                        >
                            <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: AppColors.primary + '0A', alignItems: 'center', justifyContent: 'center' }}>
                                <UploadIcon />
                            </View>
                            <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                Upload
                            </Text>
                            <Text style={{ fontSize: 10, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF', textAlign: 'center' }}>
                                Photos, docs, audio
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={addCapturedFile}
                            style={({ pressed }) => ({
                                flex: 1,
                                backgroundColor: pressed ? '#F3F4F6' : AppColors.white,
                                borderRadius: 14,
                                borderWidth: 1.5,
                                borderColor: AppColors.primary + '40',
                                borderStyle: 'dashed',
                                paddingVertical: 24,
                                alignItems: 'center',
                                gap: 10,
                            })}
                        >
                            <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: AppColors.primary + '0A', alignItems: 'center', justifyContent: 'center' }}>
                                <CameraIcon />
                            </View>
                            <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                Capture
                            </Text>
                            <Text style={{ fontSize: 10, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF', textAlign: 'center' }}>
                                Take photo or video
                            </Text>
                        </Pressable>
                    </View>

                    {/* Uploaded Files */}
                    {files.length > 0 && (
                        <View style={{ backgroundColor: AppColors.white, borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', padding: 14, gap: 10 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_600SemiBold', color: '#9CA3AF', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                                    Files ({files.length})
                                </Text>
                            </View>
                            {files.map((file) => (
                                <View
                                    key={file.id}
                                    style={{
                                        flexDirection: 'row', alignItems: 'center',
                                        backgroundColor: '#F9FAFB', borderRadius: 10,
                                        paddingHorizontal: 12, paddingVertical: 10, gap: 10,
                                    }}
                                >
                                    <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: AppColors.primary + '0A', alignItems: 'center', justifyContent: 'center' }}>
                                        <FileIcon />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.textPrimary }} numberOfLines={1}>
                                            {file.name}
                                        </Text>
                                        <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>
                                            {file.size}
                                        </Text>
                                    </View>
                                    <Pressable onPress={() => removeFile(file.id)} hitSlop={8} style={{ padding: 4 }}>
                                        <XIcon />
                                    </Pressable>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Evidence Details Card */}
                    <View style={{ backgroundColor: AppColors.white, borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', padding: 16, gap: 16 }}>
                        <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_600SemiBold', color: '#9CA3AF', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                            Evidence Details
                        </Text>

                        {/* Evidence Name */}
                        <View style={{ gap: 6 }}>
                            <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.textPrimary }}>
                                Evidence Name
                            </Text>
                            <View style={{ backgroundColor: '#F9FAFB', borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', height: 48, paddingHorizontal: 14, justifyContent: 'center' }}>
                                <RNTextInput
                                    placeholder="Enter evidence name"
                                    value={evidenceName}
                                    onChangeText={setEvidenceName}
                                    placeholderTextColor="#D1D5DB"
                                    style={{ fontSize: 14, fontFamily: 'IBMPlexSans_400Regular', color: AppColors.textPrimary }}
                                />
                            </View>
                        </View>

                        {/* Select Case */}
                        <View style={{ gap: 6, zIndex: 20 }}>
                            <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.textPrimary }}>
                                Select Case
                            </Text>
                            <Pressable
                                onPress={() => setCaseDropdownOpen(!caseDropdownOpen)}
                                style={{
                                    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                                    backgroundColor: '#F9FAFB', borderRadius: 10, borderWidth: 1,
                                    borderColor: caseDropdownOpen ? AppColors.primary : '#E5E7EB',
                                    height: 48, paddingHorizontal: 14,
                                }}
                            >
                                <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_400Regular', color: selectedCaseLabel ? AppColors.textPrimary : '#D1D5DB' }}>
                                    {selectedCaseLabel || 'Choose a case'}
                                </Text>
                                <ChevronIcon />
                            </Pressable>
                            {caseDropdownOpen && (
                                <View style={{
                                    position: 'absolute', top: 76, left: 0, right: 0,
                                    backgroundColor: AppColors.white, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB',
                                    overflow: 'hidden', elevation: 4, zIndex: 30,
                                }}>
                                    {casesLoading ? (
                                        <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                                            <ActivityIndicator color={AppColors.primary} />
                                        </View>
                                    ) : caseOptions.length === 0 ? (
                                        <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                                            <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>No active cases</Text>
                                        </View>
                                    ) : (
                                        caseOptions.map((c) => (
                                            <Pressable
                                                key={c.id}
                                                onPress={() => { setSelectedCaseId(c.id); setCaseDropdownOpen(false); }}
                                                style={({ pressed }) => ({
                                                    paddingVertical: 12, paddingHorizontal: 14,
                                                    backgroundColor: pressed ? '#F3F4F6' : selectedCaseId === c.id ? '#F0F4FF' : AppColors.white,
                                                })}
                                            >
                                                <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_400Regular', color: AppColors.textPrimary }}>{c.label}</Text>
                                            </Pressable>
                                        ))
                                    )}
                                </View>
                            )}
                        </View>

                        {/* Description */}
                        <View style={{ gap: 6 }}>
                            <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.textPrimary }}>
                                Description
                            </Text>
                            <View style={{ backgroundColor: '#F9FAFB', borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 14, paddingVertical: 12, minHeight: 90 }}>
                                <RNTextInput
                                    placeholder="Describe the evidence..."
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                    textAlignVertical="top"
                                    placeholderTextColor="#D1D5DB"
                                    style={{ flex: 1, fontSize: 14, fontFamily: 'IBMPlexSans_400Regular', color: AppColors.textPrimary, minHeight: 66 }}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Analysis Model Card */}
                    <View style={{ backgroundColor: AppColors.white, borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', padding: 16, gap: 12 }}>
                        <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_600SemiBold', color: '#9CA3AF', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                            Analysis Model
                        </Text>
                        <Pressable
                            onPress={() => setModelDrawerOpen(true)}
                            style={({ pressed }) => ({
                                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                                backgroundColor: pressed ? '#F3F4F6' : '#F9FAFB', borderRadius: 10, borderWidth: 1,
                                borderColor: selectedModelKey ? AppColors.primary : '#E5E7EB',
                                height: 48, paddingHorizontal: 14,
                            })}
                        >
                            <Text style={{ fontSize: 14, fontFamily: selectedModelKey ? 'IBMPlexSans_500Medium' : 'IBMPlexSans_400Regular', color: selectedModelKey ? AppColors.primary : '#D1D5DB', flex: 1 }}>
                                {selectedModelKey ? MODEL_NAME_MAP[selectedModelKey] : 'None — Skip analysis'}
                            </Text>
                            {selectedModelKey ? (
                                <Pressable onPress={() => setSelectedModelKey('')} hitSlop={8}>
                                    <XIcon />
                                </Pressable>
                            ) : (
                                <ChevronIcon />
                            )}
                        </Pressable>
                    </View>

                    {/* Action Buttons */}
                    <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                        <Pressable
                            onPress={handleBack}
                            style={({ pressed }) => ({
                                flex: 1,
                                backgroundColor: pressed ? '#F3F4F6' : AppColors.white,
                                borderRadius: 14,
                                borderWidth: 1.5,
                                borderColor: '#D1D5DB',
                                height: 52,
                                alignItems: 'center',
                                justifyContent: 'center',
                            })}
                        >
                            <Text style={{ fontSize: 15, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>Cancel</Text>
                        </Pressable>
                        <Pressable
                            onPress={handleSubmit}
                            disabled={saveEvidence.isPending || selectedCaseId === null}
                            style={({ pressed }) => ({
                                flex: 1,
                                backgroundColor: selectedCaseId === null
                                    ? '#D1D5DB'
                                    : pressed ? AppColors.primaryHover : AppColors.primary,
                                borderRadius: 14,
                                height: 52,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 6,
                            })}
                        >
                            {saveEvidence.isPending ? (
                                <ActivityIndicator color={AppColors.white} />
                            ) : (
                                <>
                                    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                                        <Path d="M12 5v14M5 12h14" stroke={AppColors.white} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                                    </Svg>
                                    <Text style={{ fontSize: 15, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.white }}>
                                        {selectedModelKey ? 'Analyze' : 'Upload'}
                                    </Text>
                                </>
                            )}
                        </Pressable>
                    </View>
                </View>
            </ScrollView>

            {/* Model Selection Drawer */}
            <BottomDrawer
                visible={modelDrawerOpen}
                onClose={() => setModelDrawerOpen(false)}
                title="Select Analysis Model"
                subtitle="Pick a model to run after upload"
            >
                <View style={{ gap: 6 }}>
                    {/* None option */}
                    <Pressable
                        onPress={() => { setSelectedModelKey(''); setModelDrawerOpen(false); }}
                        style={({ pressed }) => ({
                            backgroundColor: pressed ? '#F3F4F6' : !selectedModelKey ? AppColors.primary + '06' : AppColors.white,
                            borderRadius: 12,
                            borderWidth: !selectedModelKey ? 1.5 : 1,
                            borderColor: !selectedModelKey ? AppColors.primary : '#F3F4F6',
                            paddingHorizontal: 14,
                            paddingVertical: 12,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 12,
                        })}
                    >
                        <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' }}>
                            <SkipIcon size={18} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.textPrimary }}>Skip Analysis</Text>
                            <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>Just upload the evidence</Text>
                        </View>
                        {!selectedModelKey && (
                            <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: AppColors.primary, alignItems: 'center', justifyContent: 'center' }}>
                                <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                                    <Path d="M20 6L9 17l-5-5" stroke={AppColors.white} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                                </Svg>
                            </View>
                        )}
                    </Pressable>

                    {/* Model options */}
                    {MODEL_OPTIONS.map((model) => {
                        const Icon = model.icon;
                        const isSelected = selectedModelKey === model.key;
                        return (
                            <Pressable
                                key={model.key}
                                onPress={() => { setSelectedModelKey(model.key); setModelDrawerOpen(false); }}
                                style={({ pressed }) => ({
                                    backgroundColor: pressed ? '#F3F4F6' : isSelected ? AppColors.primary + '06' : AppColors.white,
                                    borderRadius: 12,
                                    borderWidth: isSelected ? 1.5 : 1,
                                    borderColor: isSelected ? AppColors.primary : '#F3F4F6',
                                    paddingHorizontal: 14,
                                    paddingVertical: 12,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 12,
                                })}
                            >
                                <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: AppColors.primary + '08', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon size={18} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.textPrimary }}>{model.title}</Text>
                                    <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>{model.description}</Text>
                                </View>
                                {isSelected && (
                                    <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: AppColors.primary, alignItems: 'center', justifyContent: 'center' }}>
                                        <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                                            <Path d="M20 6L9 17l-5-5" stroke={AppColors.white} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                                        </Svg>
                                    </View>
                                )}
                            </Pressable>
                        );
                    })}
                </View>
            </BottomDrawer>

            <DiscardChangesModal visible={showDiscard} onCancel={() => setShowDiscard(false)} onDiscard={() => { setShowDiscard(false); router.back(); }} />

            {/* Success Drawer */}
            <BottomDrawer
                visible={successDrawerVisible}
                onClose={() => { setSuccessDrawerVisible(false); router.back(); }}
                title=""
                height={SCREEN_HEIGHT * 0.35}
            >
                <View style={{ alignItems: 'center', gap: 14, paddingTop: 8, paddingBottom: 8 }}>
                    <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center' }}>
                        <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                            <Path d="M20 6L9 17l-5-5" stroke={AppColors.success} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                    </View>
                    <Text style={{ fontSize: 17, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.textPrimary, textAlign: 'center' }}>
                        Evidence Uploaded
                    </Text>
                    <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_400Regular', color: '#6B7280', textAlign: 'center', lineHeight: 19, paddingHorizontal: 20 }}>
                        {selectedModelKey
                            ? 'Analysis is running in the background — you\'ll be notified when results are ready.'
                            : 'Your evidence has been added to the case successfully.'}
                    </Text>
                    <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF', marginTop: 4 }}>
                        Tap outside to dismiss
                    </Text>
                </View>
            </BottomDrawer>
        </View>
    );
}
