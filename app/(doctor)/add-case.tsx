import { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput as RNTextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { AppColors, Typography, Spacing } from '@/constants/theme';
import { TextInput } from '@/components/ui/text-input';
import { DiscardChangesModal } from '@/components/ui/discard-changes-modal';

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

function PlusIcon() {
    return (
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path
                d="M12 5v14M5 12h14"
                stroke={AppColors.primary}
                strokeWidth={2.5}
                strokeLinecap="round"
            />
        </Svg>
    );
}

export default function AddCase() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [showDiscard, setShowDiscard] = useState(false);
    const isDirty = title.length > 0 || description.length > 0;

    const handleBack = () => {
        if (isDirty) { setShowDiscard(true); } else { router.back(); }
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
                        Add New Case
                    </Text>
                </View>

                <View style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, gap: 20 }}>
                    {/* Case Title */}
                    <View style={{ gap: 8 }}>
                        <Text style={{ ...Typography.bodySmall, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.textPrimary }}>
                            Case Title
                        </Text>
                        <TextInput
                            placeholder="Enter case title"
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>

                    {/* Case Description */}
                    <View style={{ gap: 8 }}>
                        <Text style={{ ...Typography.bodySmall, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.textPrimary }}>
                            Case Description
                        </Text>
                        <View
                            style={{
                                backgroundColor: AppColors.white,
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: '#E5E7EB',
                                paddingHorizontal: 14,
                                paddingVertical: 12,
                                minHeight: 120,
                            }}
                        >
                            <RNTextInput
                                placeholder="Enter case description..."
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                textAlignVertical="top"
                                style={{
                                    flex: 1,
                                    fontSize: 14,
                                    fontFamily: 'IBMPlexSans_400Regular',
                                    color: AppColors.textPrimary,
                                    minHeight: 96,
                                }}
                                placeholderTextColor={AppColors.border}
                            />
                        </View>
                    </View>

                    {/* Add Evidence (optional) */}
                    <Pressable
                        onPress={() => router.push('/(doctor)/upload-evidence')}
                        style={({ pressed }) => ({
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: pressed ? '#F3F4F6' : AppColors.white,
                            borderRadius: 12,
                            borderCurve: 'continuous' as const,
                            borderWidth: 1.5,
                            borderColor: AppColors.primary,
                            borderStyle: 'dashed',
                            height: 48,
                            gap: 8,
                        })}
                    >
                        <PlusIcon />
                        <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.primary }}>
                            Add Evidence (Optional)
                        </Text>
                    </Pressable>

                    {/* Create Case button */}
                    <Pressable
                        onPress={() => router.back()}
                        style={({ pressed }) => ({
                            backgroundColor: pressed ? AppColors.primaryHover : AppColors.primary,
                            borderRadius: 12,
                            borderCurve: 'continuous' as const,
                            height: 52,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: 12,
                        })}
                    >
                        <Text style={{ ...Typography.button, color: AppColors.white }}>Create Case</Text>
                    </Pressable>
                </View>
            </ScrollView>
            <DiscardChangesModal visible={showDiscard} onCancel={() => setShowDiscard(false)} onDiscard={() => { setShowDiscard(false); router.back(); }} />
        </View>
    );
}
