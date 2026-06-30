import { useState, useEffect } from 'react';
import { Modal, View, Text, Pressable, ActivityIndicator } from 'react-native';
import * as Updates from 'expo-updates';
import { AppColors } from '@/constants/theme';

export function UpdatePrompt() {
    const [visible, setVisible] = useState(false);
    const [restarting, setRestarting] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function check() {
            if (!Updates.isEnabled || __DEV__) {
                return;
            }
            try {
                const result = await Updates.checkForUpdateAsync();
                if (cancelled || !result.isAvailable) {
                    return;
                }
                await Updates.fetchUpdateAsync();
                if (!cancelled) {
                    setVisible(true);
                }
            } catch {
                // Network/availability failures are non-fatal: the user keeps the current version.
            }
        }

        check();
        return () => {
            cancelled = true;
        };
    }, []);

    async function handleRestart() {
        setRestarting(true);
        try {
            await Updates.reloadAsync();
        } catch {
            setRestarting(false);
            setVisible(false);
        }
    }

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
                        New version available
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
                        An update has been downloaded.{'\n'}Restart now to use the latest version.
                    </Text>

                    <View style={{ flexDirection: 'row', gap: 12, marginTop: 24, width: '100%' }}>
                        <Pressable
                            onPress={() => setVisible(false)}
                            disabled={restarting}
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
                                Later
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={handleRestart}
                            disabled={restarting}
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
                            {restarting ? (
                                <ActivityIndicator color={AppColors.white} />
                            ) : (
                                <Text style={{ fontSize: 15, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.white }}>
                                    Restart Now
                                </Text>
                            )}
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
