import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, Modal, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { AppColors, Typography, Spacing } from '@/constants/theme';
import { useSwipeTabs } from '@/hooks/use-swipe-tabs';
import { TabSlideIn } from '@/components/tab-slide-in';
import { BottomDrawer } from '@/components/bottom-drawer';
import { DeepFakeIcon, FaceIcon, DnaIcon, ReconstructIcon, ChevronRightIcon } from '@/components/model-icons';
import { useDashboardQuery } from '@/lib/hooks/use-dashboard-api';
import { useAllCasesQuery, caseDisplayId } from '@/lib/hooks/use-cases-api';
import { AppHeader } from '@/components/app-header';

interface RecentActivityRow {
    id: string;
    title: string;
    status: string;
    statusColor: string;
    statusBg: string;
    updated: string;
}

interface NotificationRow {
    id: string;
    title: string;
    subtitle: string;
    time: string;
    caseId: string;
    read: boolean;
}

// The dashboard API exposes overview stats and chart data only — it carries no
// recent-activity list, so this section renders an empty state until the
// backend provides one.

const SCREEN_WIDTH = Dimensions.get('window').width;

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

function PlusIcon2() {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path
                d="M12 5v14M5 12h14"
                stroke={AppColors.primary}
                strokeWidth={2}
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
];

export default function DoctorDashboard() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const swipeHandlers = useSwipeTabs(0);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<NotificationRow[]>([]);
    const unreadCount = notifications.filter(n => !n.read).length;

    const dashboardQuery = useDashboardQuery();
    const overview = dashboardQuery.data?.overview;
    const activeCount = overview?.active_cases.total ?? 0;
    const evidenceCount = overview?.evidences.total ?? 0;
    const completedCount = overview?.completed_cases.total ?? 0;

    const newActiveCases = overview?.active_cases.new_this_week ?? 0;
    const pendingEvidence = overview?.evidences.pending_review ?? 0;
    const totalCases = activeCount + completedCount;
    const completionRate = totalCases > 0 ? Math.round((completedCount / totalCases) * 100) : 0;

    const allCasesQuery = useAllCasesQuery();
    const recentActivity: RecentActivityRow[] = (allCasesQuery.data ?? [])
        .slice()
        .sort((a, b) => b.id - a.id)
        .slice(0, 4)
        .map((c) => {
            const completed = ['complete', 'completed', 'closed', 'done'].includes((c.status ?? '').trim().toLowerCase());
            return {
                id: caseDisplayId(c.id),
                title: c.name || 'Untitled case',
                status: completed ? 'Completed' : 'Active',
                statusColor: completed ? AppColors.success : AppColors.primary,
                statusBg: completed ? '#DCFCE7' : AppColors.primary + '14',
                updated: c.created_at ?? '',
            };
        });

    return (
        <View style={{ flex: 1, backgroundColor: AppColors.surface }} {...swipeHandlers}>
            <TabSlideIn>
                <ScrollView
                    contentContainerStyle={{
                        paddingTop: insets.top,
                        paddingBottom: insets.bottom + 140,
                    }}
                >
                    <AppHeader onBellPress={() => setShowNotifications(true)} unreadCount={unreadCount} />

                    {/* Stats */}
                    <View style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.md }}>
                        <LinearGradient
                            colors={['#1E2A5E', '#2D3F7A']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ borderRadius: 14, overflow: 'hidden' }}
                        >
                            <View style={{ flexDirection: 'row' }}>
                                <Pressable
                                    onPress={() => router.push('/(doctor)/active-cases')}
                                    style={({ pressed }) => ({
                                        flex: 1,
                                        alignItems: 'center',
                                        paddingVertical: 16,
                                        opacity: pressed ? 0.7 : 1,
                                    })}
                                >
                                    <Text style={{ fontSize: 24, fontFamily: 'IBMPlexSans_700Bold', color: '#FFFFFF' }}>{activeCount}</Text>
                                    <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>Active</Text>
                                    {newActiveCases > 0 && (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, backgroundColor: 'rgba(99,204,255,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                                            <Svg width={8} height={8} viewBox="0 0 24 24" fill="none">
                                                <Path d="M12 19V5M5 12l7-7 7 7" stroke="#63CCFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                                            </Svg>
                                            <Text style={{ fontSize: 10, fontFamily: 'IBMPlexSans_600SemiBold', color: '#63CCFF' }}>+{newActiveCases}</Text>
                                        </View>
                                    )}
                                </Pressable>

                                <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 14 }} />

                                <Pressable
                                    onPress={() => router.push('/(doctor)/evidence-items')}
                                    style={({ pressed }) => ({
                                        flex: 1,
                                        alignItems: 'center',
                                        paddingVertical: 16,
                                        opacity: pressed ? 0.7 : 1,
                                    })}
                                >
                                    <Text style={{ fontSize: 24, fontFamily: 'IBMPlexSans_700Bold', color: '#FFFFFF' }}>{evidenceCount}</Text>
                                    <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>Evidence</Text>
                                    {pendingEvidence > 0 && (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, backgroundColor: 'rgba(251,191,36,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                                            <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: '#FBBF24' }} />
                                            <Text style={{ fontSize: 10, fontFamily: 'IBMPlexSans_600SemiBold', color: '#FBBF24' }}>{pendingEvidence} pending</Text>
                                        </View>
                                    )}
                                </Pressable>

                                <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 14 }} />

                                <Pressable
                                    onPress={() => router.push('/(doctor)/completed-cases')}
                                    style={({ pressed }) => ({
                                        flex: 1,
                                        alignItems: 'center',
                                        paddingVertical: 16,
                                        opacity: pressed ? 0.7 : 1,
                                    })}
                                >
                                    <Text style={{ fontSize: 24, fontFamily: 'IBMPlexSans_700Bold', color: '#FFFFFF' }}>{completedCount}</Text>
                                    <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>Completed</Text>
                                    {totalCases > 0 && (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, backgroundColor: 'rgba(52,211,153,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                                            <Svg width={8} height={8} viewBox="0 0 24 24" fill="none">
                                                <Path d="M5 13l4 4L19 7" stroke="#34D399" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                                            </Svg>
                                            <Text style={{ fontSize: 10, fontFamily: 'IBMPlexSans_600SemiBold', color: '#34D399' }}>{completionRate}%</Text>
                                        </View>
                                    )}
                                </Pressable>
                            </View>
                        </LinearGradient>
                    </View>

                    {/* Quick Actions */}
                    <View style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, gap: 12 }}>
                        <Text style={{ ...Typography.caption, fontFamily: 'IBMPlexSans_600SemiBold', color: '#9CA3AF', letterSpacing: 1, textTransform: 'uppercase' }}>
                            Quick Actions
                        </Text>

                        <View style={{ gap: 10 }}>
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <Pressable
                                    onPress={() => router.push('/(doctor)/add-case')}
                                    style={({ pressed }) => ({
                                        flex: 1,
                                        backgroundColor: pressed ? '#F8FAFC' : AppColors.white,
                                        borderRadius: 16,
                                        padding: 16,
                                        alignItems: 'center',
                                        gap: 10,
                                        borderWidth: 1,
                                        borderColor: '#E5E7EB',
                                    })}
                                >
                                    <View style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 10,
                                        backgroundColor: AppColors.primary + '12',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <PlusIcon2 />
                                    </View>
                                    <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                        New Case
                                    </Text>
                                </Pressable>

                                <Pressable
                                    onPress={() => router.push('/(doctor)/upload-evidence')}
                                    style={({ pressed }) => ({
                                        flex: 1,
                                        backgroundColor: pressed ? '#F8FAFC' : AppColors.white,
                                        borderRadius: 16,
                                        padding: 16,
                                        alignItems: 'center',
                                        gap: 10,
                                        borderWidth: 1,
                                        borderColor: '#E5E7EB',
                                    })}
                                >
                                    <View style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 10,
                                        backgroundColor: AppColors.primary + '12',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <FolderIcon />
                                    </View>
                                    <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                        Add Evidence
                                    </Text>
                                </Pressable>
                            </View>

                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <Pressable
                                    onPress={() => setDrawerVisible(true)}
                                    style={({ pressed }) => ({
                                        flex: 1,
                                        backgroundColor: pressed ? '#F8FAFC' : AppColors.white,
                                        borderRadius: 16,
                                        padding: 16,
                                        alignItems: 'center',
                                        gap: 10,
                                        borderWidth: 1,
                                        borderColor: '#E5E7EB',
                                    })}
                                >
                                    <View style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 10,
                                        backgroundColor: AppColors.primary + '12',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <SparkleIcon />
                                    </View>
                                    <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                        Analyze Case
                                    </Text>
                                </Pressable>

                                <Pressable
                                    onPress={() => router.push('/(doctor)/investigative-cases')}
                                    style={({ pressed }) => ({
                                        flex: 1,
                                        backgroundColor: pressed ? '#F8FAFC' : AppColors.white,
                                        borderRadius: 16,
                                        padding: 16,
                                        alignItems: 'center',
                                        gap: 10,
                                        borderWidth: 1,
                                        borderColor: '#E5E7EB',
                                    })}
                                >
                                    <View style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 10,
                                        backgroundColor: AppColors.primary + '12',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                                            <Path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9C21 7.89543 20.1046 7 19 7H13L11 5H5C3.89543 5 3 5.89543 3 7Z" stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                                        </Svg>
                                    </View>
                                    <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                        My Cases
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>

                    {/* Case Activity */}
                    <View style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, gap: 12 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ ...Typography.caption, fontFamily: 'IBMPlexSans_600SemiBold', color: '#9CA3AF', letterSpacing: 1, textTransform: 'uppercase' }}>
                                Recent Activity
                            </Text>
                            <Pressable onPress={() => router.push('/(doctor)/active-cases')} hitSlop={8}>
                                <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>View All</Text>
                            </Pressable>
                        </View>

                        <View style={{
                            backgroundColor: AppColors.white,
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: '#E5E7EB',
                            overflow: 'hidden',
                        }}>
                            {allCasesQuery.isPending ? (
                                <View style={{ paddingVertical: 32, alignItems: 'center', justifyContent: 'center' }}>
                                    <ActivityIndicator color={AppColors.primary} />
                                </View>
                            ) : recentActivity.length === 0 ? (
                                <View style={{ paddingVertical: 32, alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                    <Text style={{ ...Typography.bodySmall, fontFamily: 'IBMPlexSans_600SemiBold', color: '#9CA3AF' }}>
                                        No recent activity
                                    </Text>
                                    <Text style={{ ...Typography.caption, color: '#D1D5DB', textAlign: 'center' }}>
                                        Activity from your cases will appear here
                                    </Text>
                                </View>
                            ) : (
                                recentActivity.map((item, idx, arr) => (
                                    <Pressable
                                        key={item.id}
                                        onPress={() => router.push({
                                            pathname: '/(doctor)/case-details' as any,
                                            params: { caseId: item.id.replace('CASE-', ''), title: item.title },
                                        })}
                                        style={({ pressed }) => ({
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            paddingHorizontal: 16,
                                            paddingVertical: 14,
                                            backgroundColor: pressed ? '#F8FAFC' : 'transparent',
                                            borderBottomWidth: idx < arr.length - 1 ? 1 : 0,
                                            borderBottomColor: '#F3F4F6',
                                        })}
                                    >
                                        <View style={{ flex: 1, gap: 2 }}>
                                            <Text style={{ ...Typography.bodySmall, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                                {item.title}
                                            </Text>
                                            <Text style={{ ...Typography.caption, color: '#9CA3AF' }}>
                                                {item.updated ? `${item.id} · ${item.updated}` : item.id}
                                            </Text>
                                        </View>
                                        <View style={{
                                            backgroundColor: item.statusBg,
                                            paddingVertical: 3,
                                            paddingHorizontal: 8,
                                            borderRadius: 6,
                                        }}>
                                            <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_600SemiBold', color: item.statusColor }}>
                                                {item.status}
                                            </Text>
                                        </View>
                                    </Pressable>
                                ))
                            )}
                        </View>
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
                        return (
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
                        {notifications.length === 0 && (
                            <View style={{ paddingVertical: 32, paddingHorizontal: 16, alignItems: 'center', gap: 4 }}>
                                <Text style={{ ...Typography.bodySmall, fontFamily: 'IBMPlexSans_600SemiBold', color: '#9CA3AF' }}>
                                    You&apos;re all caught up
                                </Text>
                                <Text style={{ ...Typography.caption, color: '#D1D5DB', textAlign: 'center' }}>
                                    New notifications will appear here
                                </Text>
                            </View>
                        )}
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
