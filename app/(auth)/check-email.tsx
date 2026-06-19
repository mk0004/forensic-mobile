import { useState, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    Pressable,
    Image,
    StatusBar,
    useWindowDimensions,
    TextInput as RNTextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { Button } from '@/components/ui/button';
import { AppColors, Typography, Spacing } from '@/constants/theme';
import { useVerifyCodeMutation, useForgotPasswordMutation } from '@/lib/hooks/use-auth-api';

const CODE_LENGTH = 6;

export default function VerificationCodeScreen() {
    const router = useRouter();
    const { height } = useWindowDimensions();
    const { email } = useLocalSearchParams<{ email: string }>();
    const verifyCodeMutation = useVerifyCodeMutation();
    const resendMutation = useForgotPasswordMutation();
    const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
    const inputRefs = useRef<(RNTextInput | null)[]>([]);

    const navyHeight = height * 0.30;
    const allFilled = code.every((d) => d !== '');

    const handleChange = (text: string, index: number) => {
        const digit = text.replace(/\D/g, '').slice(-1);
        const newCode = [...code];
        newCode[index] = digit;
        setCode(newCode);

        if (digit && index < CODE_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (key: string, index: number) => {
        if (key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
            const newCode = [...code];
            newCode[index - 1] = '';
            setCode(newCode);
        }
    };

    const handleContinue = () => {
        if (!allFilled) return;
        const otp = code.join('');
        verifyCodeMutation.mutate(
            { email, otp },
            {
                onSuccess: () => {
                    router.push({ pathname: '/(auth)/new-password', params: { email, otp } });
                },
            },
        );
    };

    const handleResend = () => {
        if (!email) return;
        resendMutation.mutate({ email });
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
                        <Text style={{ ...Typography.h3, color: AppColors.textPrimary }}>
                            Enter verification code
                        </Text>
                        <Text style={{ ...Typography.bodySmall, color: AppColors.border, lineHeight: 20 }}>
                            A 4-digit code was sent to{' '}
                            <Text style={{ color: AppColors.primary, textDecorationLine: 'underline' }}>
                                {email ?? 'your email'}
                            </Text>
                        </Text>
                    </View>

                    {/* OTP boxes */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                        {code.map((digit, i) => (
                            <RNTextInput
                                key={i}
                                ref={(ref) => { inputRefs.current[i] = ref; }}
                                value={digit}
                                onChangeText={(text) => handleChange(text, i)}
                                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                                keyboardType="numeric"
                                maxLength={1}
                                style={{
                                    flex: 1,
                                    height: 56,
                                    borderRadius: 12,
                                    borderWidth: 1.5,
                                    borderColor: digit ? AppColors.primary : AppColors.border,
                                    backgroundColor: AppColors.white,
                                    textAlign: 'center',
                                    fontSize: 24,
                                    fontFamily: 'IBMPlexSans_700Bold',
                                    color: AppColors.textPrimary,
                                }}
                            />
                        ))}
                    </View>

                    {verifyCodeMutation.error && (
                        <Text style={{ ...Typography.bodySmall, color: AppColors.error }}>
                            {verifyCodeMutation.error.message}
                        </Text>
                    )}

                    <Button
                        title={verifyCodeMutation.isPending ? 'Verifying...' : 'Continue'}
                        onPress={handleContinue}
                        variant={allFilled ? 'primary' : 'disabled'}
                        loading={verifyCodeMutation.isPending}
                    />

                    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
                        <Text style={{ ...Typography.bodySmall, color: AppColors.textPrimary }}>
                            {"Didn't receive code?"}
                        </Text>
                        <Pressable hitSlop={8} onPress={handleResend} disabled={resendMutation.isPending}>
                            <Text
                                style={{
                                    ...Typography.bodySmall,
                                    color: AppColors.primary,
                                    fontFamily: 'IBMPlexSans_600SemiBold',
                                    textDecorationLine: 'underline',
                                }}
                            >
                                {resendMutation.isPending ? 'Sending...' : 'Resend'}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
