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
import { useRegisterMutation } from '@/lib/hooks/use-auth-api';
import { ApiError } from '@/lib/api-client';

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

// The form captures MM/DD/YYYY; the API requires YYYY-MM-DD.
function toApiDate(dateStr: string) {
    const [mm, dd, yyyy] = dateStr.split('/');
    return `${yyyy}-${mm}-${dd}`;
}

// The register endpoint returns a `{ msg, status, data: { field: [messages] } }`
// envelope; map those server field errors back onto the local form fields.
function mapServerFieldErrors(body?: string): Record<string, string> {
    if (!body) return {};
    try {
        const parsed = JSON.parse(body) as { data?: Record<string, unknown> };
        const data = parsed.data;
        if (!data || typeof data !== 'object') return {};
        const fieldMap: Record<string, string> = {
            national_id: 'nationalId',
            phone_number: 'phone',
            date_of_birth: 'dob',
            name: 'firstName',
            email: 'email',
            password: 'password',
        };
        const mapped: Record<string, string> = {};
        for (const [serverField, messages] of Object.entries(data)) {
            const key = fieldMap[serverField] ?? serverField;
            const message = Array.isArray(messages) ? String(messages[0]) : String(messages);
            mapped[key] = message;
        }
        return mapped;
    } catch {
        return {};
    }
}

export default function SignUpScreen() {
    const router = useRouter();
    const { height } = useWindowDimensions();
    const registerMutation = useRegisterMutation();
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

    const headerHeight = height * 0.22;

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
        const name = `${firstName} ${lastName}`.trim();
        registerMutation.mutate(
            {
                name,
                email: email.trim(),
                password,
                phone_number: phone.replace(/[\s-]/g, ''),
                national_id: nationalId,
                date_of_birth: toApiDate(dob),
            },
            {
                onSuccess: () => {
                    router.replace('/(auth)/login');
                },
                onError: (err) => {
                    const fieldErrors = err instanceof ApiError ? mapServerFieldErrors(err.body) : {};
                    const message = err.message;
                    if (Object.keys(fieldErrors).length > 0) {
                        setErrors({ ...fieldErrors, submit: message });
                    } else {
                        setErrors({ submit: message });
                    }
                },
            },
        );
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
                <View style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.03)' }} />
                <View style={{ position: 'absolute', bottom: 10, left: -30, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.02)' }} />

                <Animated.View entering={FadeInDown.duration(500)} style={{ alignItems: 'center' }}>
                    <View style={{
                        width: 86,
                        height: 86,
                        borderRadius: 22,
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Image
                            source={require('@/assets/images/forensic-logo.png')}
                            style={{ width: 72, height: 72, borderRadius: 18 }}
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
                <View style={{ paddingHorizontal: 24, paddingTop: 28, gap: 22 }}>
                    {/* Title */}
                    <Animated.View entering={FadeInUp.delay(100).duration(400)} style={{ gap: 6 }}>
                        <Text style={{ fontSize: 26, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.textPrimary }}>
                            Create Account
                        </Text>
                        <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF', lineHeight: 20 }}>
                            Fill in your details to get started
                        </Text>
                    </Animated.View>

                    {/* Form */}
                    <Animated.View entering={FadeInUp.delay(200).duration(400)} style={{ gap: 14 }}>
                        {/* Personal Info section label */}
                        <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_600SemiBold', color: '#9CA3AF', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                            Personal Information
                        </Text>

                        {/* Name row */}
                        <View style={{ flexDirection: 'row', gap: 10 }}>
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
                            placeholder="Email Address"
                            value={email}
                            onChangeText={setEmail}
                            icon="email"
                            keyboardType="email-address"
                            error={errors.email}
                        />

                        <TextInput
                            placeholder="National ID (14 digits)"
                            value={nationalId}
                            onChangeText={handleNationalIdChange}
                            icon="hash"
                            keyboardType="numeric"
                            error={errors.nationalId}
                        />

                        {/* Phone row */}
                        <View style={{ gap: 4 }}>
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    height: 50,
                                    borderRadius: 10,
                                    borderWidth: 1,
                                    borderColor: '#E5E7EB',
                                    backgroundColor: '#F9FAFB',
                                    paddingHorizontal: 12,
                                    gap: 4,
                                }}>
                                    <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.textPrimary }}>+20</Text>
                                    <Svg width={10} height={6} viewBox="0 0 10 6" fill="none">
                                        <Path d="M1 1l4 4 4-4" stroke="#9CA3AF" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                                    </Svg>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <TextInput
                                        placeholder="Phone number"
                                        value={phone}
                                        onChangeText={handlePhoneChange}
                                        icon="phone"
                                        keyboardType="phone-pad"
                                    />
                                </View>
                            </View>
                            {errors.phone && (
                                <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: AppColors.error, marginLeft: 4 }}>
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

                        {/* Divider */}
                        <View style={{ height: 1, backgroundColor: '#F3F4F6', marginVertical: 4 }} />

                        {/* Security section label */}
                        <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_600SemiBold', color: '#9CA3AF', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                            Security
                        </Text>

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
                                label="I agree to the Terms and Conditions"
                            />
                            {errors.terms && (
                                <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: AppColors.error, marginLeft: 4 }}>
                                    {errors.terms}
                                </Text>
                            )}
                        </View>

                        {errors.submit && (
                            <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: AppColors.error, marginLeft: 4 }}>
                                {errors.submit}
                            </Text>
                        )}

                        <View style={{ marginTop: 4 }}>
                            <Button
                                title={registerMutation.isPending ? 'Creating...' : 'Create Account'}
                                onPress={handleSignUp}
                                loading={registerMutation.isPending}
                            />
                        </View>
                    </Animated.View>

                    {/* Social */}
                    <Animated.View entering={FadeInUp.delay(300).duration(400)}>
                        <SocialLoginRow onFacebook={() => { }} onGoogle={() => { }} onApple={() => { }} />
                    </Animated.View>

                    {/* Login link */}
                    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4, paddingTop: 8 }}>
                        <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_400Regular', color: '#6B7280' }}>
                            Already have an account?
                        </Text>
                        <Pressable onPress={() => router.push('/(auth)/login')} hitSlop={8}>
                            <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>
                                Login
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
