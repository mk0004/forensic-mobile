import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { AppColors, Typography, Spacing } from '@/constants/theme';
import { StatCard } from '@/components/ui/stat-card';
import { useSwipeTabs } from '@/hooks/use-swipe-tabs';
import { TabSlideIn } from '@/components/tab-slide-in';
import { BottomDrawer } from '@/components/bottom-drawer';
import { DeepFakeIcon, FaceIcon, DnaIcon, ReconstructIcon, RequestIcon, ChevronRightIcon } from '@/components/model-icons';

function BellIcon() {
    return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
                d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
                stroke={AppColors.textPrimary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

function PlusIcon() {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path
                d="M12 5v14M5 12h14"
                stroke={AppColors.white}
                strokeWidth={2.5}
                strokeLinecap="round"
            />
        </Svg>
    );
}

function FolderIcon() {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path
                d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"
                stroke={AppColors.primary}
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

function SparkleIcon() {
    return (
        <Svg width={18} height={18} viewBox="0 0 17 17" fill="none">
            <Path
                d="M16.5 16.5H6.72222C3.78889 16.5 2.32222 16.5 1.41111 15.5889C0.5 14.6778 0.5 13.2111 0.5 10.2778V0.5M4.05556 1.38889H4.94444M4.05556 4.05556H7.61111"
                stroke={AppColors.primary}
                strokeLinecap="round"
            />
            <Path
                d="M2.27783 15.6115C3.22894 13.8809 4.5205 9.40621 6.99428 9.40621C8.7045 9.40621 9.14717 11.5867 10.8236 11.5867C13.7063 11.5867 13.2885 6.72266 16.5001 6.72266"
                stroke={AppColors.primary}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

function AnalyticsIcon() {
    return (
        <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
            <Path
                d="M22 12h-4l-3 9L9 3l-3 9H2"
                stroke={AppColors.white}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

const analysisModels = [
    {
        title: 'Deep Fake Detection',
        description: 'A tool that finds fake or edited images by looking for digital traces left by AI.',
        icon: DeepFakeIcon,
        hasLaunch: true,
        modelType: 'deepfake',
    },
    {
        title: 'Face Recognition',
        description: 'A system that identifies or confirms a person\'s identity by analyzing their facial features.',
        icon: FaceIcon,
        hasLaunch: true,
        modelType: 'face',
    },
    {
        title: 'DNA Phenotype Prediction',
        description: 'A specialized tool that predicts physical traits from DNA sequences for forensic identification.',
        icon: DnaIcon,
        hasLaunch: true,
        modelType: 'dna',
    },
    {
        title: 'Reconstruct Image',
        description: 'An AI tool that repairs low-quality or blurry photos to make the details much clearer.',
        icon: ReconstructIcon,
        hasLaunch: true,
        modelType: 'reconstruct',
    },
    {
        title: 'Request Custom Model',
        description: 'Need a specific forensic tool? Describe your requirements and our team will build it.',
        icon: RequestIcon,
        hasLaunch: false,
        modelType: null,
    },
];

export default function DoctorDashboard() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const swipeHandlers = useSwipeTabs(0);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([
        { id: '1', title: 'Deep Fake Analysis Complete', subtitle: 'Case #2024-0892 — Evidence flagged as manipulated', time: '2m ago', caseId: '2024-0892', read: false },
        { id: '2', title: 'Face Recognition Done', subtitle: 'Case #2024-0756 — 2 matches found', time: '15m ago', caseId: '2024-0756', read: false },
        { id: '3', title: 'DNA Analysis Finished', subtitle: 'Case #2024-0891 — Results ready for review', time: '1h ago', caseId: '2024-0891', read: true },
    ]);
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <View style={{ flex: 1, backgroundColor: AppColors.surface }} {...swipeHandlers}>
            <TabSlideIn>
                <ScrollView
                    contentContainerStyle={{
                        paddingTop: insets.top,
                        paddingBottom: insets.bottom + 100,
                    }}
                >
                    {/* Header */}
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingHorizontal: Spacing.md,
                            paddingVertical: 12,
                            backgroundColor: AppColors.white,
                        }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Image
                                source={require('@/assets/images/forensic-logo.png')}
                                style={{ width: 40, height: 40, borderRadius: 20 }}
                                resizeMode="contain"
                            />
                            <Text style={{ fontSize: 18, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>
                                Forensic
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <Pressable onPress={() => setShowNotifications(true)} hitSlop={8} style={{ position: 'relative' }}>
                                <BellIcon />
                                {unreadCount > 0 && (
                                    <View style={{
                                        position: 'absolute',
                                        top: -4,
                                        right: -4,
                                        width: 16,
                                        height: 16,
                                        borderRadius: 8,
                                        backgroundColor: '#EF4444',
                                        borderWidth: 1.5,
                                        borderColor: AppColors.white,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <Text style={{ fontSize: 9, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.white }}>{unreadCount}</Text>
                                    </View>
                                )}
                            </Pressable>
                            <View
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 18,
                                    backgroundColor: AppColors.primary + '20',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>
                                    DR
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Welcome */}
                    <View style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, gap: 4 }}>
                        <Text style={{ ...Typography.h4, color: AppColors.textPrimary }}>Dashboard Overview</Text>
                        <Text style={{ ...Typography.bodySmall, color: AppColors.border }}>
                            Welcome back! Here's what's happening today.
                        </Text>
                    </View>

                    {/* Stat cards - 2 in row */}
                    <View
                        style={{
                            flexDirection: 'row',
                            paddingHorizontal: Spacing.md,
                            paddingTop: Spacing.md,
                            gap: 12,
                        }}
                    >
                        <StatCard
                            title="Active Cases"
                            value={15}
                            variant="blue"
                            onPress={() => router.push('/(doctor)/active-cases')}
                        />
                        <StatCard
                            title="Evidence Items"
                            value={120}
                            variant="red"
                            onPress={() => router.push('/(doctor)/evidence-items')}
                        />
                    </View>

                    {/* Full-width stat */}
                    <View style={{ paddingHorizontal: Spacing.md, paddingTop: 12 }}>
                        <StatCard
                            title="Completed Cases"
                            value={45}
                            variant="teal"
                            fullWidth
                            onPress={() => router.push('/(doctor)/completed-cases')}
                        />
                    </View>

                    {/* Quick Actions */}
                    <View style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, gap: 12 }}>
                        <Text style={{ ...Typography.h5, color: AppColors.textPrimary }}>Quick Actions</Text>

                        {/* Add new Cases - filled */}
                        <Pressable
                            onPress={() => router.push('/(doctor)/add-case')}
                            style={({ pressed }) => ({
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: pressed ? AppColors.primaryHover : AppColors.primary,
                                borderRadius: 12,
                                borderCurve: 'continuous' as const,
                                height: 52,
                                gap: 8,
                            })}
                        >
                            <PlusIcon />
                            <Text style={{ ...Typography.button, color: AppColors.white }}>Add new Cases</Text>
                        </Pressable>

                        {/* Upload Evidence - outline */}
                        <Pressable
                            onPress={() => router.push('/(doctor)/upload-evidence')}
                            style={({ pressed }) => ({
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: pressed ? '#F3F4F6' : AppColors.white,
                                borderRadius: 12,
                                borderCurve: 'continuous' as const,
                                borderWidth: 1.5,
                                borderColor: AppColors.primary,
                                height: 52,
                                gap: 8,
                            })}
                        >
                            <FolderIcon />
                            <Text style={{ ...Typography.button, color: AppColors.primary }}>Upload Evidence</Text>
                        </Pressable>

                        {/* Start Analysis - outline */}
                        <Pressable
                            onPress={() => setDrawerVisible(true)}
                            style={({ pressed }) => ({
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: pressed ? '#F3F4F6' : AppColors.white,
                                borderRadius: 12,
                                borderCurve: 'continuous' as const,
                                borderWidth: 1.5,
                                borderColor: AppColors.primary,
                                height: 52,
                                gap: 8,
                            })}
                        >
                            <SparkleIcon />
                            <Text style={{ ...Typography.button, color: AppColors.primary }}>Start Analysis</Text>
                        </Pressable>
                    </View>
                </ScrollView>

                {/* Analysis Models Drawer */}
                <BottomDrawer
                    visible={drawerVisible}
                    onClose={() => setDrawerVisible(false)}
                    title="Analysis Models"
                    subtitle="Select a forensic analysis model to start"
                >
                    {analysisModels.map((model) => {
                        const Icon = model.icon;
                        const isDashed = !model.hasLaunch;
                        return isDashed ? (
                            <View
                                key={model.title}
                                style={{
                                    backgroundColor: AppColors.white,
                                    borderRadius: 16,
                                    borderCurve: 'continuous',
                                    borderWidth: 1.5,
                                    borderColor: '#E5E7EB',
                                    borderStyle: 'dashed',
                                    padding: 16,
                                    gap: 10,
                                    alignItems: 'center',
                                }}
                            >
                                <Icon />
                                <Text style={{ ...Typography.bodyLarge, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>
                                    {model.title}
                                </Text>
                                <Text style={{ ...Typography.caption, color: '#6B7280', lineHeight: 18, textAlign: 'center' }}>
                                    {model.description}
                                </Text>
                            </View>
                        ) : (
                            <Pressable
                                key={model.title}
                                onPress={() => {
                                    setDrawerVisible(false);
                                    setTimeout(() => {
                                        router.push({
                                            pathname: '/(doctor)/model-upload',
                                            params: { modelType: model.modelType },
                                        });
                                    }, 300);
                                }}
                                style={({ pressed }) => ({
                                    backgroundColor: pressed ? '#F8FAFC' : AppColors.white,
                                    borderRadius: 16,
                                    borderCurve: 'continuous' as const,
                                    borderWidth: 1,
                                    borderColor: '#E5E7EB',
                                    padding: 14,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 14,
                                })}
                            >
                                <View style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 14,
                                    backgroundColor: AppColors.primary + '08',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <Icon />
                                </View>
                                <View style={{ flex: 1, gap: 4 }}>
                                    <Text style={{ ...Typography.bodyLarge, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>
                                        {model.title}
                                    </Text>
                                    <Text style={{ ...Typography.caption, color: '#6B7280', lineHeight: 18 }} numberOfLines={2}>
                                        {model.description}
                                    </Text>
                                </View>
                                <ChevronRightIcon />
                            </Pressable>
                        );
                    })}

                    {/* Footer link */}
                    <Text style={{ textAlign: 'center', ...Typography.caption, color: '#6B7280', marginTop: 8 }}>
                        Need more models? Visit the{' '}
                        <Text style={{ color: AppColors.primary, textDecorationLine: 'underline' }}>
                            Full Analysis Models Page
                        </Text>
                    </Text>

                    {/* Cancel button */}
                    <Pressable
                        onPress={() => setDrawerVisible(false)}
                        style={({ pressed }) => ({
                            backgroundColor: pressed ? AppColors.primaryHover : AppColors.primary,
                            borderRadius: 12,
                            borderCurve: 'continuous' as const,
                            paddingVertical: 14,
                            alignItems: 'center',
                            marginTop: 8,
                        })}
                    >
                        <Text style={{ ...Typography.button, color: AppColors.white }}>Cancel</Text>
                    </Pressable>
                </BottomDrawer>
            </TabSlideIn>

            {/* Notification Dropdown */}
            <Modal visible={showNotifications} transparent animationType="fade">
                <Pressable
                    onPress={() => setShowNotifications(false)}
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }}
                >
                    <View style={{
                        position: 'absolute',
                        top: insets.top + 56,
                        right: 16,
                        width: 320,
                        backgroundColor: AppColors.white,
                        borderRadius: 16,
                        borderCurve: 'continuous',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.15,
                        shadowRadius: 16,
                        elevation: 12,
                        overflow: 'hidden',
                    }}>
                        {/* Header */}
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingHorizontal: 16,
                            paddingVertical: 14,
                            borderBottomWidth: 1,
                            borderBottomColor: '#F3F4F6',
                        }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Text style={{ ...Typography.bodySmall, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                    Notifications
                                </Text>
                                {unreadCount > 0 && (
                                    <View style={{
                                        backgroundColor: '#EF4444',
                                        borderRadius: 10,
                                        paddingHorizontal: 6,
                                        paddingVertical: 1,
                                    }}>
                                        <Text style={{ fontSize: 10, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.white }}>{unreadCount}</Text>
                                    </View>
                                )}
                            </View>
                            {unreadCount > 0 && (
                                <Pressable
                                    onPress={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                                    hitSlop={8}
                                >
                                    <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.primary }}>Mark all read</Text>
                                </Pressable>
                            )}
                        </View>

                        {/* Notification Items */}
                        {notifications.map((n, i) => (
                            <Pressable
                                key={n.id}
                                onPress={() => {
                                    setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
                                    setShowNotifications(false);
                                    router.push({
                                        pathname: '/(doctor)/case-details' as any,
                                        params: { id: n.caseId, title: `Case ${n.caseId}` },
                                    });
                                }}
                                style={({ pressed }) => ({
                                    flexDirection: 'row',
                                    alignItems: 'flex-start',
                                    paddingHorizontal: 16,
                                    paddingVertical: 12,
                                    backgroundColor: pressed ? '#F9FAFB' : (!n.read ? '#F0F7FF' : AppColors.white),
                                    borderBottomWidth: i < notifications.length - 1 ? 1 : 0,
                                    borderBottomColor: '#F3F4F6',
                                    gap: 12,
                                })}
                            >
                                <View style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 10,
                                    backgroundColor: !n.read ? '#EEF2FF' : '#F3F4F6',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginTop: 1,
                                }}>
                                    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                                        <Path d="M18 8A6 6 0 106 8c0 7-3 9-3 9h18s-3-2-3-9z" stroke={!n.read ? AppColors.primary : '#9CA3AF'} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                                    </Svg>
                                </View>
                                <View style={{ flex: 1, gap: 2 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary, flex: 1 }} numberOfLines={1}>
                                            {n.title}
                                        </Text>
                                        {!n.read && (
                                            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: AppColors.primary }} />
                                        )}
                                    </View>
                                    <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_400Regular', color: '#6B7280', lineHeight: 16 }} numberOfLines={2}>
                                        {n.subtitle}
                                    </Text>
                                    <Text style={{ fontSize: 10, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF', marginTop: 2 }}>
                                        {n.time}
                                    </Text>
                                </View>
                            </Pressable>
                        ))}
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}
