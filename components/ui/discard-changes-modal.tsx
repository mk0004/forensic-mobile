import { Modal, View, Text, Pressable } from 'react-native';
import { AppColors } from '@/constants/theme';

interface DiscardChangesModalProps {
    visible: boolean;
    onCancel: () => void;
    onDiscard: () => void;
}

export function DiscardChangesModal({ visible, onCancel, onDiscard }: DiscardChangesModalProps) {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View
                style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 32,
                }}
            >
                <View
                    style={{
                        backgroundColor: AppColors.white,
                        borderRadius: 20,
                        borderCurve: 'continuous',
                        paddingTop: 28,
                        paddingBottom: 24,
                        paddingHorizontal: 24,
                        width: '100%',
                        maxWidth: 340,
                        alignItems: 'center',
                    }}
                >
                    <Text
                        style={{
                            fontSize: 20,
                            fontFamily: 'IBMPlexSans_700Bold',
                            color: AppColors.primary,
                            textAlign: 'center',
                        }}
                    >
                        Discard changes?
                    </Text>
                    <Text
                        style={{
                            fontSize: 14,
                            fontFamily: 'IBMPlexSans_400Regular',
                            color: '#6B7280',
                            textAlign: 'center',
                            lineHeight: 21,
                            marginTop: 12,
                        }}
                    >
                        You have unsaved information.{'\n'}Are you sure you want to discard{'\n'}your changes and go back?
                    </Text>

                    <View style={{ flexDirection: 'row', gap: 12, marginTop: 24, width: '100%' }}>
                        <Pressable
                            onPress={onCancel}
                            style={({ pressed }) => ({
                                flex: 1,
                                height: 48,
                                borderRadius: 12,
                                borderCurve: 'continuous' as const,
                                backgroundColor: pressed ? '#F3F4F6' : AppColors.white,
                                borderWidth: 1.5,
                                borderColor: '#E5E7EB',
                                alignItems: 'center',
                                justifyContent: 'center',
                            })}
                        >
                            <Text style={{ fontSize: 15, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                Cancel
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={onDiscard}
                            style={({ pressed }) => ({
                                flex: 1,
                                height: 48,
                                borderRadius: 12,
                                borderCurve: 'continuous' as const,
                                backgroundColor: pressed ? AppColors.primaryHover : AppColors.primary,
                                alignItems: 'center',
                                justifyContent: 'center',
                            })}
                        >
                            <Text style={{ fontSize: 15, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.white }}>
                                Continue
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
