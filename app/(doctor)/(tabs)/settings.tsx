import { useState, useRef, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Switch, TextInput as RNTextInput, Animated, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { AppColors, Typography, Spacing } from '@/constants/theme';
import { DiscardChangesModal } from '@/components/ui/discard-changes-modal';
import { useSwipeTabs } from '@/hooks/use-swipe-tabs';
import { TabSlideIn } from '@/components/tab-slide-in';

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
function BellIcon() {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M18 8A6 6 0 106 8c0 7-3 9-3 9h18s-3-2-3-9zM13.73 21a2 2 0 01-3.46 0" stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}
function PaletteIcon() {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.63 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-1 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-4.97-4.5-9-10-9z" stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx={7.5} cy={11.5} r={1.5} fill={AppColors.primary} />
            <Circle cx={12} cy={7.5} r={1.5} fill={AppColors.primary} />
            <Circle cx={16.5} cy={11.5} r={1.5} fill={AppColors.primary} />
        </Svg>
    );
}
function GlobeIcon() {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={12} r={10} stroke={AppColors.primary} strokeWidth={1.5} />
            <Path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}
function DatabaseIcon() {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M12 2C6.48 2 2 3.79 2 6v12c0 2.21 4.48 4 10 4s10-1.79 10-4V6c0-2.21-4.48-4-10-4z" stroke={AppColors.primary} strokeWidth={1.5} />
            <Path d="M2 6c0 2.21 4.48 4 10 4s10-1.79 10-4M2 12c0 2.21 4.48 4 10 4s10-1.79 10-4" stroke={AppColors.primary} strokeWidth={1.5} />
        </Svg>
    );
}
function HelpIcon() {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={12} r={10} stroke={AppColors.primary} strokeWidth={1.5} />
            <Path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}
function FlagIcon() {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}
function ShieldIcon() {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
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
    firstName: 'Mohammed',
    lastName: 'Sakr',
    email: 'mohammedsakr87@gmail.com',
    phone: '01030860764',
    dob: '05/03/1967',
    nationalId: '30402151302829',
    yearsOfExperience: '7',
};

export default function SettingsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const swipeHandlers = useSwipeTabs(3);
    const [activeTab, setActiveTab] = useState<'personal' | 'settings'>('personal');
    const [notifications, setNotifications] = useState(true);
    const [info, setInfo] = useState(initialInfo);
    const [showDiscard, setShowDiscard] = useState(false);
    const [editing, setEditing] = useState(false);

    // Animated tab indicator
    const tabAnim = useRef(new Animated.Value(0)).current;

    const switchTab = useCallback((tab: 'personal' | 'settings') => {
        if (tab === activeTab) return;
        const toValue = tab === 'personal' ? 0 : 1;
        Animated.spring(tabAnim, { toValue, useNativeDriver: false, friction: 20, tension: 200 }).start();
        LayoutAnimation.configureNext(LayoutAnimation.create(250, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity));
        setActiveTab(tab);
    }, [activeTab, tabAnim]);

    const isDirty = JSON.stringify(info) !== JSON.stringify(initialInfo);

    const handleLogout = () => {
        router.replace('/(auth)/login');
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
                            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ fontSize: 28, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.white }}>MS</Text>
                            </View>
                            <Pressable
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
                                <CameraIcon />
                            </Pressable>
                        </View>
                        <View style={{ alignItems: 'center', gap: 4 }}>
                            <Text style={{ fontSize: 18, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.white }}>{info.firstName} {info.lastName}</Text>
                            <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_400Regular', color: 'rgba(255,255,255,0.7)' }}>{info.email}</Text>
                        </View>
                        <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5 }}>
                            <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.white }}>Forensic Expert</Text>
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
                            <SectionCard title="Personal Information">
                                <View style={{ paddingVertical: 4 }}>
                                    {([
                                        { key: 'firstName' as const, label: 'First Name', icon: <UserIcon /> },
                                        { key: 'lastName' as const, label: 'Last Name', icon: <UserIcon /> },
                                        { key: 'email' as const, label: 'Email Address', icon: <MailIcon /> },
                                        { key: 'phone' as const, label: 'Phone Number', icon: <PhoneIcon /> },
                                        { key: 'dob' as const, label: 'Date Of Birth', icon: <CalendarIcon /> },
                                        { key: 'nationalId' as const, label: 'National ID', icon: <HashIcon /> },
                                        { key: 'yearsOfExperience' as const, label: 'Years Of Experience', icon: <ClockIcon /> },
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
                                                            keyboardType={field.key === 'yearsOfExperience' || field.key === 'phone' || field.key === 'nationalId' ? 'numeric' : 'default'}
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
                                            onPress={() => { setInfo(initialInfo); setEditing(false); }}
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
                                            onPress={() => setEditing(false)}
                                            style={({ pressed }) => ({
                                                flex: 1,
                                                height: 48,
                                                borderRadius: 12,
                                                backgroundColor: pressed ? AppColors.primaryHover : AppColors.primary,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            })}
                                        >
                                            <Text style={{ fontSize: 15, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.white }}>Save Changes</Text>
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
                        </>
                    )}

                    {/* ─── App Settings Tab ─── */}
                    {activeTab === 'settings' && (
                        <>
                            <SectionCard title="App Settings">
                                <MenuRow icon={<PaletteIcon />} label="Appearance" />
                                <Divider />
                                <MenuRow icon={<GlobeIcon />} label="Language" rightElement={
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>English</Text>
                                        <ChevronRight />
                                    </View>
                                } />
                                <Divider />
                                <MenuRow
                                    icon={<BellIcon />}
                                    label="Notifications"
                                    rightElement={
                                        <Switch
                                            value={notifications}
                                            onValueChange={setNotifications}
                                            trackColor={{ false: '#E5E7EB', true: AppColors.primary + '60' }}
                                            thumbColor={notifications ? AppColors.primary : '#F4F4F4'}
                                        />
                                    }
                                />
                                <Divider />
                                <MenuRow icon={<DatabaseIcon />} label="Data & Storage" />
                            </SectionCard>

                            <SectionCard title="Security">
                                <MenuRow icon={<LockIcon />} label="Change Password" />
                            </SectionCard>

                            <SectionCard title="Support">
                                <MenuRow icon={<HelpIcon />} label="Help Center" />
                                <Divider />
                                <MenuRow icon={<FlagIcon />} label="Report a Problem" />
                                <Divider />
                                <MenuRow icon={<ShieldIcon />} label="Terms & Privacy Policy" />
                            </SectionCard>

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
                        </>
                    )}
                </ScrollView>

                <DiscardChangesModal
                    visible={showDiscard}
                    onCancel={() => setShowDiscard(false)}
                    onDiscard={() => { setShowDiscard(false); setInfo(initialInfo); setEditing(false); }}
                />
            </TabSlideIn>
        </View>
    );
}
