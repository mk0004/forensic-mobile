import { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput as RNTextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { AppColors, Typography, Spacing } from '@/constants/theme';
import { DiscardChangesModal } from '@/components/ui/discard-changes-modal';
import { useAuth } from '@/lib/auth-context';
import { useCreateCaseMutation } from '@/lib/hooks/use-cases-api';
import { ApiError } from '@/lib/api-client';

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

function CaseIcon() {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9C21 7.89543 20.1046 7 19 7H13L11 5H5C3.89543 5 3 5.89543 3 7Z" stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

export default function AddCase() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const createCase = useCreateCaseMutation();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [showDiscard, setShowDiscard] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const isDirty = title.length > 0 || description.length > 0;

    const handleBack = () => {
        if (isDirty) { setShowDiscard(true); } else { router.back(); }
    };

    const handleCreate = () => {
        setErrorMessage(null);
        if (!user?.id) {
            setErrorMessage('You must be signed in to create a case.');
            return;
        }
        createCase.mutate(
            {
                name: title.trim(),
                description: description.trim(),
                status: 'active',
                user_id: user.id,
            },
            {
                onSuccess: () => {
                    router.back();
                },
                onError: (err) => {
                    setErrorMessage(err instanceof ApiError ? err.message : 'Failed to create case. Please try again.');
                },
            }
        );
    };

    const isCreating = createCase.isPending;

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
                            New Case
                        </Text>
                        <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>
                            Fill in the case details below
                        </Text>
                    </View>
                    <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: AppColors.primary + '12', alignItems: 'center', justifyContent: 'center' }}>
                        <CaseIcon />
                    </View>
                </View>

                <View style={{ paddingHorizontal: Spacing.md, paddingTop: 20, gap: 16 }}>
                    {/* Case Details Card */}
                    <View style={{ backgroundColor: AppColors.white, borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', padding: 16, gap: 16 }}>
                        <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_600SemiBold', color: '#9CA3AF', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                            Case Details
                        </Text>

                        {/* Case Title */}
                        <View style={{ gap: 6 }}>
                            <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.textPrimary }}>
                                Case Title
                            </Text>
                            <View style={{ backgroundColor: '#F9FAFB', borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', height: 48, paddingHorizontal: 14, justifyContent: 'center' }}>
                                <RNTextInput
                                    placeholder="e.g. Suspicious Activity — Park Avenue"
                                    value={title}
                                    onChangeText={setTitle}
                                    placeholderTextColor="#D1D5DB"
                                    style={{ fontSize: 14, fontFamily: 'IBMPlexSans_400Regular', color: AppColors.textPrimary }}
                                />
                            </View>
                        </View>

                        {/* Description */}
                        <View style={{ gap: 6 }}>
                            <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.textPrimary }}>
                                Description
                            </Text>
                            <View style={{ backgroundColor: '#F9FAFB', borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 14, paddingVertical: 12, minHeight: 110 }}>
                                <RNTextInput
                                    placeholder="Describe the case details, circumstances, and any initial findings..."
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                    textAlignVertical="top"
                                    placeholderTextColor="#D1D5DB"
                                    style={{ flex: 1, fontSize: 14, fontFamily: 'IBMPlexSans_400Regular', color: AppColors.textPrimary, minHeight: 86 }}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Add Evidence Card */}
                    <View style={{ backgroundColor: AppColors.white, borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', padding: 16, gap: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_600SemiBold', color: '#9CA3AF', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                                Evidence
                            </Text>
                            <View style={{ backgroundColor: '#F0FDF4', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                                <Text style={{ fontSize: 10, fontFamily: 'IBMPlexSans_500Medium', color: '#16A34A' }}>Optional</Text>
                            </View>
                        </View>
                        <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF', lineHeight: 17 }}>
                            Attach photos, documents, or capture new evidence directly from your camera.
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <Pressable
                                onPress={() => router.push('/(doctor)/upload-evidence')}
                                style={({ pressed }) => ({
                                    flex: 1,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: pressed ? '#F3F4F6' : '#F9FAFB',
                                    borderRadius: 10,
                                    borderWidth: 1,
                                    borderColor: '#E5E7EB',
                                    paddingVertical: 12,
                                    gap: 6,
                                })}
                            >
                                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                                    <Path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke={AppColors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                </Svg>
                                <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.primary }}>Upload</Text>
                            </Pressable>
                            <Pressable
                                onPress={() => router.push('/(doctor)/upload-evidence')}
                                style={({ pressed }) => ({
                                    flex: 1,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: pressed ? '#F3F4F6' : '#F9FAFB',
                                    borderRadius: 10,
                                    borderWidth: 1,
                                    borderColor: '#E5E7EB',
                                    paddingVertical: 12,
                                    gap: 6,
                                })}
                            >
                                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                                    <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z" stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                                    <Path d="M12 17a4 4 0 100-8 4 4 0 000 8z" stroke={AppColors.primary} strokeWidth={1.5} />
                                </Svg>
                                <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.primary }}>Capture</Text>
                            </Pressable>
                        </View>
                    </View>

                    {/* Error message */}
                    {errorMessage && (
                        <View style={{ backgroundColor: AppColors.error + '12', borderRadius: 10, padding: 12 }}>
                            <Text selectable style={{ fontSize: 13, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.error }}>
                                {errorMessage}
                            </Text>
                        </View>
                    )}

                    {/* Action Buttons */}
                    <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                        <Pressable
                            onPress={handleBack}
                            disabled={isCreating}
                            style={({ pressed }) => ({
                                flex: 1,
                                backgroundColor: pressed ? '#F3F4F6' : AppColors.white,
                                borderRadius: 14,
                                borderWidth: 1.5,
                                borderColor: '#D1D5DB',
                                height: 52,
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: isCreating ? 0.6 : 1,
                            })}
                        >
                            <Text style={{ fontSize: 15, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>Cancel</Text>
                        </Pressable>
                        <Pressable
                            onPress={handleCreate}
                            disabled={!title.trim() || isCreating}
                            style={({ pressed }) => ({
                                flex: 1,
                                backgroundColor: (!title.trim() || isCreating) ? '#E5E7EB' : (pressed ? AppColors.primaryHover : AppColors.primary),
                                borderRadius: 14,
                                height: 52,
                                alignItems: 'center',
                                justifyContent: 'center',
                            })}
                        >
                            {isCreating ? (
                                <ActivityIndicator color={AppColors.primary} />
                            ) : (
                                <Text style={{ fontSize: 15, fontFamily: 'IBMPlexSans_600SemiBold', color: !title.trim() ? '#9CA3AF' : AppColors.white }}>Create Case</Text>
                            )}
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
            <DiscardChangesModal visible={showDiscard} onCancel={() => setShowDiscard(false)} onDiscard={() => { setShowDiscard(false); router.back(); }} />
        </View>
    );
}
