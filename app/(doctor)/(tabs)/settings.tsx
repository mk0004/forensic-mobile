import { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, Image, ScrollView, Pressable, TextInput as RNTextInput, Animated, LayoutAnimation, Platform, UIManager, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Updates from 'expo-updates';
import { AppColors, Typography, Spacing } from '@/constants/theme';
import { DiscardChangesModal } from '@/components/ui/discard-changes-modal';
import { useSwipeTabs } from '@/hooks/use-swipe-tabs';
import { TabSlideIn } from '@/components/tab-slide-in';
import { useAuth } from '@/lib/auth-context';
import { useSettingQuery, useSaveChangeMutation, useChangePasswordMutation, useUploadUserImageMutation, SettingResult } from '@/lib/hooks/use-auth-api';
import { useAppToast } from '@/lib/error-toast';
import { resolveImageUrl } from '@/constants/railway-api';
import { User, SettingResponse } from '@/types/api';

/* ─── SVG Icons ─── */
function UserIcon() {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx={12} cy={7} r={4} stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}
function LockIcon() {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Rect x={3} y={11} width={18} height={11} rx={2} stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M7 11V7a5 5 0 0110 0v4" stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}
function LogOutIcon() {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke={AppColors.error} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}
function ChevronRight() {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M9 18l6-6-6-6" stroke="#9CA3AF" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}
function CameraIcon() {
    return (
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke={AppColors.white} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx={12} cy={13} r={4} stroke={AppColors.white} strokeWidth={1.5} />
        </Svg>
    );
}
function MailIcon() {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M22 6l-10 7L2 6" stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}
function PhoneIcon() {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}
function BriefcaseIcon() {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Rect x={2} y={7} width={20} height={14} rx={2} stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}
function BadgeIcon() {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M12 15l-2 5-1.5-3.5L5 15l3.5-1.5L10 10zM18 15l-2 5-1.5-3.5L11 15l3.5-1.5L16 10z" stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <Rect x={3} y={3} width={18} height={10} rx={2} stroke={AppColors.primary} strokeWidth={1.5} />
        </Svg>
    );
}
function BuildingIcon() {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9v.01M9 12v.01M9 15v.01M9 18v.01" stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

/* ─── Icons for form fields ─── */
function CalendarIcon() {
    return (
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Rect x={3} y={4} width={18} height={18} rx={2} stroke="#9CA3AF" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M16 2v4M8 2v4M3 10h18" stroke="#9CA3AF" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}
function HashIcon() {
    return (
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M4 9h16M4 15h16M10 3l-2 18M16 3l-2 18" stroke={AppColors.textPrimary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}
function ClockIcon() {
    return (
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={12} r={10} stroke={AppColors.textPrimary} strokeWidth={1.5} />
            <Path d="M12 6v6l4 2" stroke={AppColors.textPrimary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}
function ChevronUpDown() {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M7 10l5-5 5 5M7 14l5 5 5-5" stroke="#1A1A1A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

/* ─── Form Field Component ─── */
function FormField({ label, icon, value, onChangeText, editing, rightElement }: {
    label: string; icon?: React.ReactNode; value: string; onChangeText?: (t: string) => void; editing: boolean; rightElement?: React.ReactNode;
}) {
    return (
        <View style={{ flex: 1, gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                {icon}
                <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.textPrimary }}>{label}</Text>
                <Text style={{ fontSize: 13, color: AppColors.error }}>*</Text>
            </View>
            <View style={{
                backgroundColor: '#F9FAFB',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#E5E7EB',
                height: 48,
                paddingHorizontal: 14,
                flexDirection: 'row',
                alignItems: 'center',
            }}>
                {editing ? (
                    <RNTextInput
                        value={value}
                        onChangeText={onChangeText}
                        style={{
                            flex: 1,
                            fontSize: 15,
                            fontFamily: 'IBMPlexSans_400Regular',
                            color: AppColors.textPrimary,
                            paddingVertical: 0,
                        }}
                    />
                ) : (
                    <Text style={{ flex: 1, fontSize: 15, fontFamily: 'IBMPlexSans_400Regular', color: AppColors.textPrimary }}>{value}</Text>
                )}
                {rightElement}
            </View>
        </View>
    );
}
function MenuRow({ icon, label, rightElement, onPress }: { icon: React.ReactNode; label: string; rightElement?: React.ReactNode; onPress?: () => void }) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 14,
                paddingHorizontal: 16,
                backgroundColor: pressed ? '#F9FAFB' : 'transparent',
            })}
        >
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: AppColors.primary + '10', alignItems: 'center', justifyContent: 'center' }}>
                {icon}
            </View>
            <Text style={{ flex: 1, marginLeft: 12, fontSize: 15, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.textPrimary }}>{label}</Text>
            {rightElement || <ChevronRight />}
        </Pressable>
    );
}

/* ─── Section Card ─── */
function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <View style={{ gap: 0 }}>
            <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_600SemiBold', color: '#9CA3AF', letterSpacing: 0.5, marginBottom: 8, marginLeft: 4 }}>{title.toUpperCase()}</Text>
            <View style={{ backgroundColor: AppColors.white, borderRadius: 16, borderCurve: 'continuous' as const, overflow: 'hidden', borderWidth: 1, borderColor: '#F0F0F0' }}>
                {children}
            </View>
        </View>
    );
}

function Divider() {
    return <View style={{ height: 1, backgroundColor: '#F3F4F6', marginLeft: 64 }} />;
}

/* ─── Main ─── */

const initialInfo = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    nationalId: '',
};

type ProfileInfo = typeof initialInfo;

function resolveUser(result: SettingResult): User | null {
    const candidate = (result as SettingResponse).data
        ?? (result as SettingResponse).user
        ?? result;
    if (candidate && typeof (candidate as User).email === 'string') {
        return candidate as User;
    }
    return null;
}

function userToInfo(user: User): ProfileInfo {
    const [firstName, ...rest] = (user.name ?? '').trim().split(' ');
    return {
        firstName: firstName ?? '',
        lastName: rest.join(' '),
        email: user.email ?? '',
        phone: user.phone_number ?? '',
        dob: user.date_of_birth ?? '',
        nationalId: user.national_id ?? '',
    };
}

function getInitials(first: string, last: string): string {
    const a = first.trim();
    const b = last.trim();
    if (!a && !b) return 'U';
    if (a && b) return (a[0] + b[0]).toUpperCase();
    const single = (a || b);
    return single.slice(0, 2).toUpperCase();
}

function formatRole(role?: string): string {
    if (!role) return 'Forensic Expert';
    return role.charAt(0).toUpperCase() + role.slice(1);
}

export default function SettingsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { signOut, refreshUser } = useAuth();
    const settingQuery = useSettingQuery();
    const saveChangeMutation = useSaveChangeMutation();
    const changePasswordMutation = useChangePasswordMutation();
    const uploadImageMutation = useUploadUserImageMutation();
    const { showError, showSuccess } = useAppToast();
    const swipeHandlers = useSwipeTabs(3);
    const [pwOpen, setPwOpen] = useState(false);
    const [currentPw, setCurrentPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [pwError, setPwError] = useState('');
    const [pwSuccess, setPwSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState<'personal' | 'settings'>('personal');
    const [updateState, setUpdateState] = useState<'idle' | 'checking' | 'downloading' | 'uptodate' | 'available'>('idle');
    const [downloadProgress, setDownloadProgress] = useState(0);

    const handleCheckUpdate = useCallback(async () => {
        if (!Updates.isEnabled || __DEV__) {
            setUpdateState('uptodate');
            return;
        }
        setUpdateState('checking');
        try {
            const result = await Updates.checkForUpdateAsync();
            if (!result.isAvailable) {
                setUpdateState('uptodate');
                return;
            }
            setDownloadProgress(0);
            setUpdateState('downloading');
            const ticker = setInterval(() => {
                setDownloadProgress((p) => (p < 0.9 ? p + 0.05 : p));
            }, 120);
            try {
                await Updates.fetchUpdateAsync();
            } finally {
                clearInterval(ticker);
            }
            setDownloadProgress(1);
            setUpdateState('available');
        } catch {
            setUpdateState('idle');
            setDownloadProgress(0);
            showError('Could not check for updates. Please try again.');
        }
    }, [showError]);

    const handleApplyUpdate = useCallback(async () => {
        try {
            await Updates.reloadAsync();
        } catch {
            showError('Could not restart to apply the update.');
        }
    }, [showError]);
    const [info, setInfo] = useState<ProfileInfo>(initialInfo);
    const [baseline, setBaseline] = useState<ProfileInfo>(initialInfo);
    const [showDiscard, setShowDiscard] = useState(false);
    const [editing, setEditing] = useState(false);

    const resolvedUser = settingQuery.data ? resolveUser(settingQuery.data) : null;
    const avatarImage = resolveImageUrl(resolvedUser?.image);
    const avatarInitials = getInitials(info.firstName, info.lastName);
    const roleLabel = formatRole(resolvedUser?.role);

    useEffect(() => {
        if (!settingQuery.data) return;
        const user = resolveUser(settingQuery.data);
        if (user) {
            const mapped = userToInfo(user);
            setInfo(mapped);
            setBaseline(mapped);
        }
    }, [settingQuery.data]);

    // Animated tab indicator
    const tabAnim = useRef(new Animated.Value(0)).current;

    const switchTab = useCallback((tab: 'personal' | 'settings') => {
        if (tab === activeTab) return;
        const toValue = tab === 'personal' ? 0 : 1;
        Animated.spring(tabAnim, { toValue, useNativeDriver: false, friction: 20, tension: 200 }).start();
        LayoutAnimation.configureNext(LayoutAnimation.create(250, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity));
        setActiveTab(tab);
    }, [activeTab, tabAnim]);

    const isDirty = JSON.stringify(info) !== JSON.stringify(baseline);

    const handleLogout = async () => {
        await signOut();
        router.replace('/(auth)/login');
    };

    const handlePickAvatar = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            showError('Photo library access is required to change your avatar.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });
        if (result.canceled || !result.assets[0]) {
            return;
        }
        const asset = result.assets[0];
        uploadImageMutation.mutate(
            { uri: asset.uri, mimeType: asset.mimeType, fileName: asset.fileName ?? undefined },
            {
                onSuccess: () => showSuccess('Profile photo updated.'),
            },
        );
    };

    const handleSave = () => {
        const name = `${info.firstName} ${info.lastName}`.trim();
        saveChangeMutation.mutate(
            {
                name,
                email: info.email,
                phone_number: info.phone,
                date_of_birth: info.dob,
                national_id: info.nationalId,
            },
            {
                onSuccess: () => {
                    setBaseline(info);
                    setEditing(false);
                    settingQuery.refetch();
                    refreshUser();
                },
            },
        );
    };

    const handleChangePassword = () => {
        setPwError('');
        setPwSuccess(false);
        if (!currentPw) { setPwError('Current password is required'); return; }
        if (newPw.length < 8) { setPwError('New password must be at least 8 characters'); return; }
        if (newPw !== confirmPw) { setPwError('Passwords do not match'); return; }
        changePasswordMutation.mutate(
            { password: currentPw, new_password: newPw, new_password_confirmation: confirmPw },
            {
                onSuccess: () => {
                    setPwSuccess(true);
                    setCurrentPw(''); setNewPw(''); setConfirmPw('');
                    setPwOpen(false);
                },
                onError: (err) => setPwError(err.message),
            },
        );
    };

    const updateField = (key: keyof typeof info) => (val: string) => setInfo(prev => ({ ...prev, [key]: val }));

    return (
        <View style={{ flex: 1, backgroundColor: AppColors.surface }} {...swipeHandlers}>
            <TabSlideIn>
                <ScrollView
                    contentContainerStyle={{
                        paddingTop: insets.top + 8,
                        paddingBottom: insets.bottom + 40,
                        paddingHorizontal: Spacing.md,
                        gap: 24,
                    }}
                >
                    {/* Header */}
                    <Text style={{ ...Typography.h4, color: AppColors.textPrimary }}>Settings</Text>

                    {/* Profile Card */}
                    <LinearGradient
                        colors={['#3C4F92', '#1E2A5E', '#151D40']}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={{ borderRadius: 20, padding: 24, alignItems: 'center', gap: 12 }}
                    >
                        <View style={{ position: 'relative' }}>
                            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                {avatarImage ? (
                                    <Image source={{ uri: avatarImage }} style={{ width: 80, height: 80, borderRadius: 40 }} resizeMode="cover" />
                                ) : (
                                    <Text style={{ fontSize: 28, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.white }}>{avatarInitials}</Text>
                                )}
                            </View>
                            <Pressable
                                onPress={handlePickAvatar}
                                disabled={uploadImageMutation.isPending}
                                style={({ pressed }) => ({
                                    position: 'absolute',
                                    bottom: 0,
                                    right: -4,
                                    width: 28,
                                    height: 28,
                                    borderRadius: 14,
                                    backgroundColor: pressed ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.25)',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderWidth: 2,
                                    borderColor: 'rgba(255,255,255,0.5)',
                                })}
                            >
                                {uploadImageMutation.isPending ? (
                                    <ActivityIndicator size="small" color={AppColors.white} />
                                ) : (
                                    <CameraIcon />
                                )}
                            </Pressable>
                        </View>
                        <View style={{ alignItems: 'center', gap: 4 }}>
                            <Text style={{ fontSize: 18, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.white }}>{info.firstName} {info.lastName}</Text>
                            <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_400Regular', color: 'rgba(255,255,255,0.7)' }}>{info.email}</Text>
                        </View>
                        <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5 }}>
                            <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.white }}>{roleLabel}</Text>
                        </View>
                    </LinearGradient>

                    {/* Tab Switcher */}
                    <View style={{ flexDirection: 'row', backgroundColor: AppColors.white, borderRadius: 14, borderCurve: 'continuous' as const, padding: 4, borderWidth: 1, borderColor: '#F0F0F0' }}
                        onLayout={(e) => {
                            // no-op, just ensures container is measured
                        }}
                    >
                        {/* Animated sliding pill */}
                        <Animated.View
                            style={{
                                position: 'absolute',
                                top: 4,
                                bottom: 4,
                                width: '50%',
                                left: tabAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['0%', '48%'],
                                }),
                                backgroundColor: AppColors.primary,
                                borderRadius: 10,
                                marginLeft: 4,
                            }}
                        />
                        {(['personal', 'settings'] as const).map((tab) => {
                            const isActive = activeTab === tab;
                            const label = tab === 'personal' ? 'Personal Info' : 'App Settings';
                            return (
                                <Pressable
                                    key={tab}
                                    onPress={() => switchTab(tab)}
                                    style={{
                                        flex: 1,
                                        height: 40,
                                        borderRadius: 10,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        zIndex: 1,
                                    }}
                                >
                                    <Text style={{
                                        fontSize: 14,
                                        fontFamily: isActive ? 'IBMPlexSans_600SemiBold' : 'IBMPlexSans_500Medium',
                                        color: isActive ? AppColors.white : '#6B7280',
                                    }}>{label}</Text>
                                </Pressable>
                            );
                        })}
                    </View>

                    {/* ─── Personal Info Tab ─── */}
                    {activeTab === 'personal' && (
                        <>
                            {settingQuery.isLoading && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 8 }}>
                                    <ActivityIndicator color={AppColors.primary} />
                                    <Text style={{ ...Typography.bodySmall, color: '#9CA3AF' }}>Loading profile...</Text>
                                </View>
                            )}
                            {settingQuery.error && (
                                <Text style={{ ...Typography.bodySmall, color: AppColors.error, textAlign: 'center' }}>
                                    {settingQuery.error.message}
                                </Text>
                            )}
                            <SectionCard title="Personal Information">
                                <View style={{ paddingVertical: 4 }}>
                                    {([
                                        { key: 'firstName' as const, label: 'First Name', icon: <UserIcon /> },
                                        { key: 'lastName' as const, label: 'Last Name', icon: <UserIcon /> },
                                        { key: 'email' as const, label: 'Email Address', icon: <MailIcon /> },
                                        { key: 'phone' as const, label: 'Phone Number', icon: <PhoneIcon /> },
                                        { key: 'dob' as const, label: 'Date Of Birth', icon: <CalendarIcon /> },
                                        { key: 'nationalId' as const, label: 'National ID', icon: <HashIcon /> },
                                    ] as const).map((field, i) => (
                                        <View key={field.key}>
                                            {i > 0 && <Divider />}
                                            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 }}>
                                                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: AppColors.primary + '10', alignItems: 'center', justifyContent: 'center' }}>
                                                    {field.icon}
                                                </View>
                                                <View style={{ flex: 1, marginLeft: 12 }}>
                                                    <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_500Medium', color: '#9CA3AF', marginBottom: 2 }}>{field.label}</Text>
                                                    {editing ? (
                                                        <RNTextInput
                                                            value={info[field.key]}
                                                            onChangeText={updateField(field.key)}
                                                            keyboardType={field.key === 'phone' || field.key === 'nationalId' ? 'numeric' : 'default'}
                                                            style={{
                                                                fontSize: 15,
                                                                fontFamily: 'IBMPlexSans_500Medium',
                                                                color: AppColors.textPrimary,
                                                                borderBottomWidth: 1,
                                                                borderBottomColor: AppColors.primary + '40',
                                                                paddingVertical: 2,
                                                                paddingHorizontal: 0,
                                                            }}
                                                        />
                                                    ) : (
                                                        <Text style={{ fontSize: 15, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.textPrimary }}>{info[field.key]}</Text>
                                                    )}
                                                </View>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </SectionCard>

                            {/* Edit / Save */}
                            <View>
                                {editing ? (
                                    <View style={{ flexDirection: 'row', gap: 12 }}>
                                        <Pressable
                                            onPress={() => { setInfo(baseline); setEditing(false); }}
                                            style={({ pressed }) => ({
                                                flex: 1,
                                                height: 48,
                                                borderRadius: 12,
                                                borderWidth: 1.5,
                                                borderColor: '#E5E7EB',
                                                backgroundColor: pressed ? '#F3F4F6' : AppColors.white,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            })}
                                        >
                                            <Text style={{ fontSize: 15, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>Cancel</Text>
                                        </Pressable>
                                        <Pressable
                                            onPress={handleSave}
                                            disabled={saveChangeMutation.isPending}
                                            style={({ pressed }) => ({
                                                flex: 1,
                                                height: 48,
                                                borderRadius: 12,
                                                backgroundColor: pressed ? AppColors.primaryHover : AppColors.primary,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            })}
                                        >
                                            {saveChangeMutation.isPending ? (
                                                <ActivityIndicator color={AppColors.white} />
                                            ) : (
                                                <Text style={{ fontSize: 15, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.white }}>Save Changes</Text>
                                            )}
                                        </Pressable>
                                    </View>
                                ) : (
                                    <Pressable
                                        onPress={() => setEditing(true)}
                                        style={({ pressed }) => ({
                                            height: 48,
                                            borderRadius: 12,
                                            borderWidth: 1.5,
                                            borderColor: AppColors.primary,
                                            backgroundColor: pressed ? AppColors.primary + '10' : 'transparent',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        })}
                                    >
                                        <Text style={{ fontSize: 15, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>Edit Information</Text>
                                    </Pressable>
                                )}
                            </View>

                            <SectionCard title="Security">
                                <Pressable
                                    onPress={() => { setPwOpen((v) => !v); setPwError(''); setPwSuccess(false); }}
                                    style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 }}
                                >
                                    <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: AppColors.primary + '10', alignItems: 'center', justifyContent: 'center' }}>
                                        <LockIcon />
                                    </View>
                                    <Text style={{ flex: 1, marginLeft: 12, fontSize: 14, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.textPrimary }}>Change Password</Text>
                                    <Text style={{ fontSize: 18, color: '#9CA3AF' }}>{pwOpen ? '−' : '+'}</Text>
                                </Pressable>
                                {pwOpen && (
                                    <View style={{ paddingHorizontal: 16, paddingBottom: 16, gap: 10 }}>
                                        <RNTextInput
                                            value={currentPw}
                                            onChangeText={setCurrentPw}
                                            placeholder="Current password"
                                            placeholderTextColor="#9CA3AF"
                                            secureTextEntry
                                            style={{ height: 44, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 12, fontSize: 14, color: AppColors.textPrimary }}
                                        />
                                        <RNTextInput
                                            value={newPw}
                                            onChangeText={setNewPw}
                                            placeholder="New password (min 8 chars)"
                                            placeholderTextColor="#9CA3AF"
                                            secureTextEntry
                                            style={{ height: 44, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 12, fontSize: 14, color: AppColors.textPrimary }}
                                        />
                                        <RNTextInput
                                            value={confirmPw}
                                            onChangeText={setConfirmPw}
                                            placeholder="Confirm new password"
                                            placeholderTextColor="#9CA3AF"
                                            secureTextEntry
                                            style={{ height: 44, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 12, fontSize: 14, color: AppColors.textPrimary }}
                                        />
                                        {pwError ? (
                                            <Text style={{ ...Typography.bodySmall, color: AppColors.error }}>{pwError}</Text>
                                        ) : null}
                                        {pwSuccess ? (
                                            <Text style={{ ...Typography.bodySmall, color: AppColors.success }}>Password changed successfully.</Text>
                                        ) : null}
                                        <Pressable
                                            onPress={handleChangePassword}
                                            disabled={changePasswordMutation.isPending}
                                            style={({ pressed }) => ({ height: 46, borderRadius: 12, backgroundColor: pressed ? AppColors.primaryHover : AppColors.primary, alignItems: 'center', justifyContent: 'center' })}
                                        >
                                            {changePasswordMutation.isPending ? (
                                                <ActivityIndicator color={AppColors.white} />
                                            ) : (
                                                <Text style={{ fontSize: 15, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.white }}>Update Password</Text>
                                            )}
                                        </Pressable>
                                    </View>
                                )}
                            </SectionCard>
                        </>
                    )}

                    {/* ─── App Settings Tab ─── */}
                    {activeTab === 'settings' && (
                        <>
                            <Pressable
                                onPress={handleLogout}
                                style={({ pressed }) => ({
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8,
                                    height: 52,
                                    borderRadius: 14,
                                    borderCurve: 'continuous' as const,
                                    backgroundColor: pressed ? AppColors.error + '15' : AppColors.white,
                                    borderWidth: 1,
                                    borderColor: AppColors.error + '30',
                                })}
                            >
                                <LogOutIcon />
                                <Text style={{ fontSize: 16, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.error }}>Log Out</Text>
                            </Pressable>

                            <SectionCard title="App Version">
                                <View style={{ paddingHorizontal: 16, paddingVertical: 16, gap: 14 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Text style={{ fontSize: 15, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.textPrimary }}>
                                            Current Version
                                        </Text>
                                        <Text style={{ fontSize: 15, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>
                                            v{Updates.runtimeVersion ?? '1.0.0'}
                                        </Text>
                                    </View>

                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_400Regular', color: '#6B7280' }}>
                                            Update Channel
                                        </Text>
                                        <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_500Medium', color: '#6B7280' }}>
                                            {`${Updates.channel ?? 'development'} · ${Updates.isEmbeddedLaunch ? 'Embedded' : 'OTA'}`}
                                        </Text>
                                    </View>

                                    {updateState === 'available' ? (
                                        <Pressable
                                            onPress={handleApplyUpdate}
                                            style={({ pressed }) => ({
                                                height: 46,
                                                borderRadius: 12,
                                                borderCurve: 'continuous' as const,
                                                backgroundColor: pressed ? AppColors.primaryHover : AppColors.primary,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexDirection: 'row',
                                                gap: 8,
                                            })}
                                        >
                                            <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.white }}>
                                                Update available — Restart Now
                                            </Text>
                                        </Pressable>
                                    ) : updateState === 'downloading' ? (
                                        <View style={{ gap: 8 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                                    Downloading update…
                                                </Text>
                                                <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>
                                                    {Math.round(downloadProgress * 100)}%
                                                </Text>
                                            </View>
                                            <View style={{ height: 8, borderRadius: 4, backgroundColor: '#E5E7EB', overflow: 'hidden' }}>
                                                <View style={{
                                                    height: 8,
                                                    borderRadius: 4,
                                                    width: `${Math.round(downloadProgress * 100)}%`,
                                                    backgroundColor: AppColors.primary,
                                                }} />
                                            </View>
                                        </View>
                                    ) : (
                                        <Pressable
                                            onPress={handleCheckUpdate}
                                            disabled={updateState === 'checking'}
                                            style={({ pressed }) => ({
                                                height: 46,
                                                borderRadius: 12,
                                                borderCurve: 'continuous' as const,
                                                borderWidth: 1.5,
                                                borderColor: updateState === 'uptodate' ? AppColors.success + '40' : '#E5E7EB',
                                                backgroundColor: updateState === 'uptodate'
                                                    ? AppColors.success + '12'
                                                    : pressed ? '#F3F4F6' : AppColors.white,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexDirection: 'row',
                                                gap: 8,
                                            })}
                                        >
                                            {updateState === 'checking' ? (
                                                <>
                                                    <ActivityIndicator size="small" color={AppColors.primary} />
                                                    <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                                        Checking…
                                                    </Text>
                                                </>
                                            ) : updateState === 'uptodate' ? (
                                                <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.success }}>
                                                    Up to date
                                                </Text>
                                            ) : (
                                                <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                                    Check for Updates
                                                </Text>
                                            )}
                                        </Pressable>
                                    )}
                                </View>
                            </SectionCard>
                        </>
                    )}
                </ScrollView>

                <DiscardChangesModal
                    visible={showDiscard}
                    onCancel={() => setShowDiscard(false)}
                    onDiscard={() => { setShowDiscard(false); setInfo(baseline); setEditing(false); }}
                />
            </TabSlideIn>
        </View>
    );
}
