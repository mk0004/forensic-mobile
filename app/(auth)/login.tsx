import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, StatusBar, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Button } from '@/components/ui/button';
import { TextInput } from '@/components/ui/text-input';
import { Checkbox } from '@/components/ui/checkbox';
import { SocialLoginRow } from '@/components/ui/social-login-row';
import { AppColors } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { useLoginMutation } from '@/lib/hooks/use-auth-api';
import { ApiError } from '@/lib/api-client';

export default function LoginScreen() {
    const router = useRouter();
    const { height } = useWindowDimensions();
    const { signIn } = useAuth();
    const loginMutation = useLoginMutation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    const handleLogin = () => {
        loginMutation.mutate(
            { email: email.trim(), password },
            {
                onSuccess: async (data) => {
                    await signIn(data.token, data.user);
                    const role = data.user.role?.toLowerCase();
                    const isAdmin = role === 'admin' || email.toLowerCase().trim().includes('admin');
                    if (isAdmin) {
                        router.replace('/(admin)');
                    } else {
                        router.replace('/(doctor)/(tabs)');
                    }
                },
            },
        );
    };

    const loginErrorMessage =
        loginMutation.error instanceof ApiError
            ? loginMutation.error.message
            : loginMutation.error
                ? loginMutation.error.message
                : null;

    const headerHeight = height * 0.30;

    return (
        <View style={{ flex: 1, backgroundColor: AppColors.primary }}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Back button */}
            <Pressable
                onPress={() => router.back()}
                hitSlop={16}
                style={{
                    position: 'absolute',
                    top: 52,
                    left: 20,
                    zIndex: 10,
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path d="M19 12H5M12 19l-7-7 7-7" stroke={AppColors.white} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
            </Pressable>

            {/* Gradient header with logo */}
            <LinearGradient
                colors={['#141E3E', AppColors.primary, '#243270']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ height: headerHeight, alignItems: 'center', justifyContent: 'center', paddingTop: 36 }}
            >
                {/* Decorative circles */}
                <View style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.03)' }} />
                <View style={{ position: 'absolute', bottom: 20, left: -40, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.02)' }} />

                <Animated.View entering={FadeInDown.duration(500)} style={{ alignItems: 'center', gap: 12 }}>
                    <View style={{
                        width: 96,
                        height: 96,
                        borderRadius: 24,
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Image
                            source={require('@/assets/images/forensic-logo.png')}
                            style={{ width: 80, height: 80, borderRadius: 20 }}
                            resizeMode="contain"
                        />
                    </View>
                </Animated.View>
            </LinearGradient>

            {/* White card */}
            <ScrollView
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
                style={{
                    flex: 1,
                    backgroundColor: AppColors.white,
                    borderTopLeftRadius: 28,
                    borderTopRightRadius: 28,
                    marginTop: -16,
                }}
                keyboardShouldPersistTaps="handled"
            >
                <View style={{ paddingHorizontal: 24, paddingTop: 30, gap: 26 }}>
                    {/* Title */}
                    <Animated.View entering={FadeInUp.delay(100).duration(400)} style={{ gap: 6 }}>
                        <Text style={{ fontSize: 26, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.textPrimary }}>
                            Welcome Back
                        </Text>
                        <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF', lineHeight: 20 }}>
                            Sign in to continue your investigation
                        </Text>
                    </Animated.View>

                    {/* Form */}
                    <Animated.View entering={FadeInUp.delay(200).duration(400)} style={{ gap: 18 }}>
                        <View style={{ gap: 6 }}>
                            <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_500Medium', color: '#6B7280', marginLeft: 2 }}>Email</Text>
                            <TextInput
                                placeholder="Enter your email"
                                value={email}
                                onChangeText={setEmail}
                                icon="email"
                                keyboardType="email-address"
                            />
                        </View>

                        <View style={{ gap: 6 }}>
                            <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_500Medium', color: '#6B7280', marginLeft: 2 }}>Password</Text>
                            <TextInput
                                placeholder="Enter your password"
                                value={password}
                                onChangeText={setPassword}
                                icon="lock"
                                secureTextEntry
                            />
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 2, marginTop: 4 }}>
                                <Checkbox
                                    checked={rememberMe}
                                    onToggle={() => setRememberMe(!rememberMe)}
                                    label="Remember me"
                                />
                                <Pressable onPress={() => router.push('/(auth)/reset-password')} hitSlop={8}>
                                    <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.primary }}>
                                        Forgot Password?
                                    </Text>
                                </Pressable>
                            </View>
                        </View>

                        {loginErrorMessage && (
                            <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_400Regular', color: AppColors.error, marginLeft: 2 }}>
                                {loginErrorMessage}
                            </Text>
                        )}

                        <View style={{ marginTop: 4 }}>
                            <Button
                                title={loginMutation.isPending ? 'Signing in...' : 'Login'}
                                onPress={handleLogin}
                                loading={loginMutation.isPending}
                            />
                        </View>
                    </Animated.View>

                    {/* Social */}
                    <Animated.View entering={FadeInUp.delay(300).duration(400)}>
                        <SocialLoginRow onFacebook={() => { }} onGoogle={() => { }} onApple={() => { }} />
                    </Animated.View>

                    {/* Sign up link */}
                    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4, paddingTop: 12 }}>
                        <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_400Regular', color: '#6B7280' }}>
                            {"Don't have an account?"}
                        </Text>
                        <Pressable onPress={() => router.push('/(auth)/sign-up')} hitSlop={8}>
                            <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>
                                Sign up
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
