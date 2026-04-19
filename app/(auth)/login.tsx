import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, StatusBar, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { Button } from '@/components/ui/button';
import { TextInput } from '@/components/ui/text-input';
import { Checkbox } from '@/components/ui/checkbox';
import { SocialLoginRow } from '@/components/ui/social-login-row';
import { AppColors, Typography, Spacing } from '@/constants/theme';

export default function LoginScreen() {
    const router = useRouter();
    const { height } = useWindowDimensions();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    const handleLogin = () => {
        const emailLower = email.toLowerCase().trim();
        if (emailLower.includes('admin')) {
            router.replace('/(admin)');
        } else {
            router.replace('/(doctor)/(tabs)');
        }
    };

    const navyHeight = height * 0.30;

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
                <View style={{ padding: Spacing.lg, paddingTop: 32, gap: 24 }}>
                    <Text style={{ ...Typography.h3, color: AppColors.textPrimary, textAlign: 'center' }}>Login</Text>

                    <View style={{ gap: 20 }}>
                        <TextInput
                            placeholder="Email Address"
                            value={email}
                            onChangeText={setEmail}
                            icon="email"
                            keyboardType="email-address"
                        />

                        <View style={{ gap: 8 }}>
                            <TextInput
                                placeholder="Password"
                                value={password}
                                onChangeText={setPassword}
                                icon="lock"
                                secureTextEntry
                            />
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingHorizontal: 4,
                                }}
                            >
                                <Checkbox
                                    checked={rememberMe}
                                    onToggle={() => setRememberMe(!rememberMe)}
                                    label="Remember me"
                                />
                                <Pressable onPress={() => router.push('/(auth)/reset-password')} hitSlop={8}>
                                    <Text style={{ ...Typography.caption, color: AppColors.primary }}>
                                        Forget Password?
                                    </Text>
                                </Pressable>
                            </View>
                        </View>

                        <Button title="Login" onPress={handleLogin} />
                    </View>

                    <View style={{ marginTop: 8 }}>
                        <SocialLoginRow
                            onFacebook={() => { }}
                            onGoogle={() => { }}
                            onApple={() => { }}
                        />
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4, paddingTop: 24 }}>
                        <Text style={{ ...Typography.bodySmall, color: AppColors.textPrimary }}>
                            Don't have an Account?
                        </Text>
                        <Pressable onPress={() => router.push('/(auth)/sign-up')} hitSlop={8}>
                            <Text style={{ ...Typography.bodySmall, color: AppColors.primary, fontFamily: 'IBMPlexSans_600SemiBold' }}>
                                Sign up
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
