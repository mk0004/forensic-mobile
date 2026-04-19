import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, StatusBar, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { Button } from '@/components/ui/button';
import { TextInput } from '@/components/ui/text-input';
import { AppColors, Typography, Spacing } from '@/constants/theme';

export default function NewPasswordScreen() {
    const router = useRouter();
    const { height } = useWindowDimensions();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const navyHeight = height * 0.30;

    const handleReset = () => {
        const e: Record<string, string> = {};
        if (!password) e.password = 'Password is required';
        else if (password.length < 8) e.password = 'Minimum 8 characters';
        if (!confirmPassword) e.confirmPassword = 'Confirm your password';
        else if (confirmPassword !== password) e.confirmPassword = 'Passwords do not match';
        setErrors(e);
        if (Object.keys(e).length > 0) return;

        router.replace('/(auth)/login');
    };

    return (
        <View style={{ flex: 1, backgroundColor: AppColors.primary }}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Back button */}
            <Pressable
                onPress={() => router.back()}
                hitSlop={16}
                style={{
                    position: 'absolute',
                    top: 54,
                    left: 20,
                    zIndex: 10,
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.3)',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path
                        d="M19 12H5M12 19l-7-7 7-7"
                        stroke={AppColors.white}
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </Svg>
            </Pressable>

            {/* Logo in navy area */}
            <View style={{ height: navyHeight, alignItems: 'center', justifyContent: 'center', paddingTop: 40 }}>
                <Image
                    source={require('@/assets/images/forensic-logo.png')}
                    style={{ width: 120, height: 120, borderRadius: 60 }}
                    resizeMode="contain"
                />
            </View>

            {/* White card */}
            <ScrollView
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
                style={{
                    flex: 1,
                    backgroundColor: AppColors.white,
                    borderTopLeftRadius: 32,
                    borderTopRightRadius: 32,
                }}
                keyboardShouldPersistTaps="handled"
            >
                <View style={{ padding: Spacing.lg, gap: 24 }}>
                    <View style={{ gap: 12 }}>
                        <Text style={{ ...Typography.h3, color: AppColors.textPrimary }}>Reset password</Text>
                        <Text
                            style={{
                                ...Typography.bodySmall,
                                color: AppColors.border,
                                lineHeight: 20,
                            }}
                        >
                            Please enter your new password to continue.
                        </Text>
                    </View>

                    <View style={{ gap: 16 }}>
                        <TextInput
                            placeholder="New Password"
                            value={password}
                            onChangeText={setPassword}
                            icon="lock"
                            secureTextEntry
                            error={errors.password}
                        />

                        <TextInput
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            icon="lock"
                            secureTextEntry
                            error={errors.confirmPassword}
                        />

                        <Button title="Reset Password" onPress={handleReset} />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
