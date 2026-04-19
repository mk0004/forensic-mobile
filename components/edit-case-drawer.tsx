import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { AppColors, Typography } from '@/constants/theme';
import { BottomDrawer } from '@/components/bottom-drawer';

type Props = {
    visible: boolean;
    onClose: () => void;
    caseTitle: string;
    caseDescription: string;
    onSave: (title: string, description: string) => void;
};

export function EditCaseDrawer({ visible, onClose, caseTitle, caseDescription, onSave }: Props) {
    const [title, setTitle] = useState(caseTitle);
    const [description, setDescription] = useState(caseDescription);

    useEffect(() => {
        if (visible) {
            setTitle(caseTitle);
            setDescription(caseDescription);
        }
    }, [visible, caseTitle, caseDescription]);

    const canSave = title.trim().length > 0;

    return (
        <BottomDrawer
            visible={visible}
            onClose={onClose}
            title="Edit Case"
            subtitle="Update case information"
        >
            {/* Case Title */}
            <View style={{ gap: 6 }}>
                <Text style={{ ...Typography.bodySmall, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                    Case Title <Text style={{ color: AppColors.error }}>*</Text>
                </Text>
                <TextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Enter case title"
                    placeholderTextColor="#9CA3AF"
                    style={{
                        backgroundColor: AppColors.white,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        padding: 12,
                        fontSize: 14,
                        fontFamily: 'IBMPlexSans_400Regular',
                        color: AppColors.textPrimary,
                    }}
                />
            </View>

            {/* Case Description */}
            <View style={{ gap: 6 }}>
                <Text style={{ ...Typography.bodySmall, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                    Description
                </Text>
                <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Enter case description..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    textAlignVertical="top"
                    style={{
                        backgroundColor: AppColors.white,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        padding: 12,
                        minHeight: 100,
                        fontSize: 14,
                        fontFamily: 'IBMPlexSans_400Regular',
                        color: AppColors.textPrimary,
                    }}
                />
            </View>

            {/* Buttons */}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                <Pressable
                    onPress={onClose}
                    style={({ pressed }) => ({
                        flex: 1,
                        paddingVertical: 14,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        alignItems: 'center',
                        backgroundColor: pressed ? '#F9FAFB' : AppColors.white,
                    })}
                >
                    <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                        Cancel
                    </Text>
                </Pressable>
                <Pressable
                    onPress={() => canSave && onSave(title.trim(), description.trim())}
                    disabled={!canSave}
                    style={({ pressed }) => ({
                        flex: 1,
                        paddingVertical: 14,
                        borderRadius: 12,
                        alignItems: 'center',
                        backgroundColor: !canSave
                            ? '#D1D5DB'
                            : pressed
                                ? AppColors.primaryHover
                                : AppColors.primary,
                    })}
                >
                    <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.white }}>
                        Save Changes
                    </Text>
                </Pressable>
            </View>
        </BottomDrawer>
    );
}
