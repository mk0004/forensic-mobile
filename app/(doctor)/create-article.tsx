import { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput as RNTextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { AppColors, Typography, Spacing } from '@/constants/theme';
import { DiscardChangesModal } from '@/components/ui/discard-changes-modal';

function CloseIcon() {
    return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path d="M18 6L6 18M6 6l12 12" stroke={AppColors.white} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function UploadIcon() {
    return (
        <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
            <Path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M17 8l-5-5-5 5" stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M12 3v12" stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function ImageIcon() {
    return (
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z" stroke="#6B7280" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M3 16l5-5 4 4 3-3 6 6" stroke="#6B7280" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx={8.5} cy={8.5} r={1.5} fill="#6B7280" />
        </Svg>
    );
}

function RemoveIcon() {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={12} r={10} fill="#00000040" />
            <Path d="M15 9l-6 6M9 9l6 6" stroke={AppColors.white} strokeWidth={2} strokeLinecap="round" />
        </Svg>
    );
}

export default function CreateArticle() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [hasImage, setHasImage] = useState(false);
    const [showDiscard, setShowDiscard] = useState(false);
    const isDirty = title.length > 0 || body.length > 0 || hasImage;

    const handleBack = () => {
        if (isDirty) { setShowDiscard(true); } else { router.back(); }
    };

    return (
        <View style={{ flex: 1, backgroundColor: AppColors.surface }}>
            <ScrollView
                contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
                keyboardShouldPersistTaps="handled"
            >
                {/* Gradient Header */}
                <LinearGradient
                    colors={['#1E2A5E', '#2A3A7E']}
                    style={{
                        paddingTop: insets.top + 12,
                        paddingBottom: 20,
                        paddingHorizontal: Spacing.md,
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View>
                            <Text style={{ fontSize: 22, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.white }}>
                                Add New Article
                            </Text>
                            <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_400Regular', color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
                                Create a new forensic investigation Article
                            </Text>
                        </View>
                        <Pressable onPress={handleBack} hitSlop={12}>
                            <CloseIcon />
                        </Pressable>
                    </View>
                </LinearGradient>

                {/* Form */}
                <View style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, gap: 20 }}>
                    {/* Article Title */}
                    <View style={{ gap: 8 }}>
                        <Text style={{ ...Typography.bodySmall, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.textPrimary }}>
                            Article Title <Text style={{ color: '#EF4444' }}>*</Text>
                        </Text>
                        <View
                            style={{
                                backgroundColor: AppColors.white,
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: '#E5E7EB',
                                paddingHorizontal: 14,
                                height: 48,
                                justifyContent: 'center',
                            }}
                        >
                            <RNTextInput
                                placeholder="Enter article title"
                                value={title}
                                onChangeText={setTitle}
                                style={{
                                    fontSize: 14,
                                    fontFamily: 'IBMPlexSans_400Regular',
                                    color: AppColors.textPrimary,
                                }}
                                placeholderTextColor={AppColors.border}
                            />
                        </View>
                    </View>

                    {/* Write your article */}
                    <View style={{ gap: 8 }}>
                        <Text style={{ ...Typography.bodySmall, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.textPrimary }}>
                            Write your article <Text style={{ color: '#EF4444' }}>*</Text>
                        </Text>
                        <View
                            style={{
                                backgroundColor: AppColors.white,
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: '#E5E7EB',
                                paddingHorizontal: 14,
                                paddingVertical: 12,
                                minHeight: 180,
                            }}
                        >
                            <RNTextInput
                                placeholder="Write your article......."
                                value={body}
                                onChangeText={setBody}
                                multiline
                                textAlignVertical="top"
                                style={{
                                    flex: 1,
                                    fontSize: 14,
                                    fontFamily: 'IBMPlexSans_400Regular',
                                    color: AppColors.textPrimary,
                                    minHeight: 156,
                                }}
                                placeholderTextColor={AppColors.border}
                            />
                        </View>
                    </View>

                    {/* Upload Image (Optional) */}
                    <View style={{ gap: 8 }}>
                        <Text style={{ ...Typography.bodySmall, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.textPrimary }}>
                            Upload Image (Optional)
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            {/* Upload area */}
                            <Pressable
                                onPress={() => setHasImage(true)}
                                style={{
                                    flex: 1,
                                    height: 120,
                                    borderRadius: 12,
                                    borderWidth: 1.5,
                                    borderColor: '#D1D5DB',
                                    borderStyle: 'dashed',
                                    backgroundColor: AppColors.white,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 6,
                                }}
                            >
                                <UploadIcon />
                                <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                    Click to upload
                                </Text>
                                <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>
                                    Images, or documents
                                </Text>
                            </Pressable>

                            {/* Preview thumbnail */}
                            {hasImage && (
                                <View style={{ width: 120, height: 120, borderRadius: 12, backgroundColor: '#E5E7EB', overflow: 'hidden' }}>
                                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                        <ImageIcon />
                                        <Text style={{ fontSize: 10, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF', marginTop: 4 }}>Preview</Text>
                                    </View>
                                    <Pressable
                                        onPress={() => setHasImage(false)}
                                        style={{ position: 'absolute', top: 6, right: 6 }}
                                    >
                                        <RemoveIcon />
                                    </Pressable>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Action buttons */}
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                        <Pressable
                            onPress={handleBack}
                            style={({ pressed }) => ({
                                backgroundColor: pressed ? '#F3F4F6' : '#E5E7EB',
                                borderRadius: 10,
                                height: 48,
                                paddingHorizontal: 28,
                                alignItems: 'center',
                                justifyContent: 'center',
                            })}
                        >
                            <Text style={{ fontSize: 15, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>Cancel</Text>
                        </Pressable>
                        <Pressable
                            onPress={() => router.back()}
                            style={({ pressed }) => ({
                                backgroundColor: pressed ? AppColors.primaryHover : AppColors.primary,
                                borderRadius: 10,
                                height: 48,
                                paddingHorizontal: 28,
                                alignItems: 'center',
                                justifyContent: 'center',
                            })}
                        >
                            <Text style={{ fontSize: 15, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.white }}>Publish</Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
            <DiscardChangesModal visible={showDiscard} onCancel={() => setShowDiscard(false)} onDiscard={() => { setShowDiscard(false); router.back(); }} />
        </View>
    );
}
