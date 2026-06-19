import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, StatusBar, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { Button } from '@/components/ui/button';
import { TextInput } from '@/components/ui/text-input';
import { AppColors, Typography, Spacing } from '@/constants/theme';
import { useForgotPasswordMutation } from '@/lib/hooks/use-auth-api';

export default function ResetPasswordScreen() {
    const router = useRouter();
    const { height } = useWindowDimensions();
    const forgotPasswordMutation = useForgotPasswordMutation();
    const [email, setEmail] = useState('');

    const navyHeight = height * 0.30;

    const handleSendLink = () => {
        const trimmed = email.trim();
        forgotPasswordMutation.mutate(
            { email: trimmed },
            {
                onSuccess: () => {
                    router.push({ pathname: '/(auth)/check-email', params: { email: trimmed } });
                },
            },
        );
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
                        <Text style={{ ...Typography.h3, color: AppColors.textPrimary }}>Reset Password</Text>
                        <Text
                            style={{
                                ...Typography.bodySmall,
                                color: AppColors.border,
                                lineHeight: 20,
                            }}
                        >
                            Provide your email to receive a password reset link.
                        </Text>
                    </View>

                    <View style={{ gap: 16 }}>
                        <TextInput
                            placeholder="Email Address"
                            value={email}
                            onChangeText={setEmail}
                            icon="email"
                            keyboardType="email-address"
                        />
                        {forgotPasswordMutation.error && (
                            <Text style={{ ...Typography.bodySmall, color: AppColors.error }}>
                                {forgotPasswordMutation.error.message}
                            </Text>
                        )}
                        <Button
                            title={forgotPasswordMutation.isPending ? 'Sending...' : 'Send Email'}
                            onPress={handleSendLink}
                            loading={forgotPasswordMutation.isPending}
                        />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
