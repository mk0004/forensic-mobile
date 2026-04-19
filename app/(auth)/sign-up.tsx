import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, StatusBar, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { Button } from '@/components/ui/button';
import { TextInput } from '@/components/ui/text-input';
import { Checkbox } from '@/components/ui/checkbox';
import { SocialLoginRow } from '@/components/ui/social-login-row';
import { AppColors, Typography, Spacing } from '@/constants/theme';

function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function formatDateInput(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function validateDate(dateStr: string) {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return false;
    const [mm, dd, yyyy] = parts.map(Number);
    if (mm < 1 || mm > 12) return false;
    if (dd < 1 || dd > 31) return false;
    if (yyyy < 1920 || yyyy > 2010) return false;
    const d = new Date(yyyy, mm - 1, dd);
    return d.getFullYear() === yyyy && d.getMonth() === mm - 1 && d.getDate() === dd;
}

export default function SignUpScreen() {
    const router = useRouter();
    const { height } = useWindowDimensions();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [nationalId, setNationalId] = useState('');
    const [phone, setPhone] = useState('');
    const [dob, setDob] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const navyHeight = height * 0.22;

    const validate = () => {
        const e: Record<string, string> = {};
        if (!firstName.trim()) e.firstName = 'First name is required';
        if (!lastName.trim()) e.lastName = 'Last name is required';
        if (!email.trim()) e.email = 'Email is required';
        else if (!validateEmail(email)) e.email = 'Invalid email format';
        if (!nationalId.trim()) e.nationalId = 'National ID is required';
        else if (!/^\d{14}$/.test(nationalId)) e.nationalId = 'Must be exactly 14 digits';
        if (!phone.trim()) e.phone = 'Phone number is required';
        else if (!/^\d{10,15}$/.test(phone.replace(/[\s-]/g, ''))) e.phone = 'Invalid phone number';
        if (!dob.trim()) e.dob = 'Date of birth is required';
        else if (!validateDate(dob)) e.dob = 'Invalid date (MM/DD/YYYY)';
        if (!password) e.password = 'Password is required';
        else if (password.length < 8) e.password = 'Minimum 8 characters';
        if (!confirmPassword) e.confirmPassword = 'Confirm your password';
        else if (confirmPassword !== password) e.confirmPassword = 'Passwords do not match';
        if (!agreeTerms) e.terms = 'You must agree to the terms';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSignUp = () => {
        if (!validate()) return;
        // TODO: implement actual registration
        router.replace('/(auth)/login');
    };

    const handleNationalIdChange = (text: string) => {
        const digits = text.replace(/\D/g, '').slice(0, 14);
        setNationalId(digits);
    };

    const handlePhoneChange = (text: string) => {
        const digits = text.replace(/[^\d\s-]/g, '').slice(0, 15);
        setPhone(digits);
    };

    const handleDobChange = (text: string) => {
        setDob(formatDateInput(text));
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
                    style={{ width: 100, height: 100, borderRadius: 50 }}
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
                <View style={{ padding: Spacing.lg, paddingTop: 28, gap: 20 }}>
                    <Text style={{ ...Typography.h3, color: AppColors.textPrimary, textAlign: 'center' }}>
                        Sign up
                    </Text>

                    <View style={{ gap: 16 }}>
                        {/* First name / Last name */}
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <View style={{ flex: 1 }}>
                                <TextInput
                                    placeholder="First name"
                                    value={firstName}
                                    onChangeText={setFirstName}
                                    autoCapitalize="words"
                                    error={errors.firstName}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <TextInput
                                    placeholder="Last name"
                                    value={lastName}
                                    onChangeText={setLastName}
                                    autoCapitalize="words"
                                    error={errors.lastName}
                                />
                            </View>
                        </View>

                        <TextInput
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                            icon="email"
                            keyboardType="email-address"
                            error={errors.email}
                        />

                        <TextInput
                            placeholder="National ID"
                            value={nationalId}
                            onChangeText={handleNationalIdChange}
                            icon="hash"
                            keyboardType="numeric"
                            error={errors.nationalId}
                        />

                        {/* Phone number with country code */}
                        <View style={{ gap: 4 }}>
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                <Pressable
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        height: 50,
                                        borderRadius: 10,
                                        borderWidth: 1,
                                        borderColor: AppColors.border,
                                        backgroundColor: AppColors.white,
                                        paddingHorizontal: 10,
                                        gap: 4,
                                    }}
                                >
                                    <Text style={{ fontSize: 18 }}>🇪🇬</Text>
                                    <Svg width={10} height={6} viewBox="0 0 10 6" fill="none">
                                        <Path d="M1 1l4 4 4-4" stroke={AppColors.border} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                                    </Svg>
                                </Pressable>
                                <View style={{ flex: 1 }}>
                                    <TextInput
                                        placeholder="+20"
                                        value={phone}
                                        onChangeText={handlePhoneChange}
                                        icon="phone"
                                        keyboardType="phone-pad"
                                    />
                                </View>
                            </View>
                            {errors.phone && (
                                <Text style={{ ...Typography.caption, color: AppColors.error, marginLeft: 4 }}>
                                    {errors.phone}
                                </Text>
                            )}
                        </View>

                        <TextInput
                            placeholder="MM/DD/YYYY"
                            value={dob}
                            onChangeText={handleDobChange}
                            rightIcon="calendar"
                            keyboardType="numeric"
                            error={errors.dob}
                        />

                        <TextInput
                            placeholder="Password"
                            value={password}
                            onChangeText={setPassword}
                            icon="lock"
                            secureTextEntry
                            error={errors.password}
                        />

                        <TextInput
                            placeholder="Confirm password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            icon="lock"
                            secureTextEntry
                            error={errors.confirmPassword}
                        />

                        <View style={{ gap: 4 }}>
                            <Checkbox
                                checked={agreeTerms}
                                onToggle={() => setAgreeTerms(!agreeTerms)}
                                label="I have read and agree with the Terms and condition"
                            />
                            {errors.terms && (
                                <Text style={{ ...Typography.caption, color: AppColors.error, marginLeft: 4 }}>
                                    {errors.terms}
                                </Text>
                            )}
                        </View>

                        <Button title="Sign up" onPress={handleSignUp} />
                    </View>

                    <View style={{ marginTop: 4 }}>
                        <SocialLoginRow
                            onFacebook={() => { }}
                            onGoogle={() => { }}
                            onApple={() => { }}
                        />
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4, paddingTop: 16 }}>
                        <Text style={{ ...Typography.bodySmall, color: AppColors.textPrimary }}>
                            Do You have an Account?
                        </Text>
                        <Pressable onPress={() => router.push('/(auth)/login')} hitSlop={8}>
                            <Text style={{ ...Typography.bodySmall, color: AppColors.primary, fontFamily: 'IBMPlexSans_600SemiBold' }}>
                                Login
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
