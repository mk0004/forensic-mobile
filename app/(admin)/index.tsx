import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { AppColors, Typography, Spacing } from '@/constants/theme';
import { StatCard } from '@/components/ui/stat-card';
import { DoctorCard } from '@/components/ui/doctor-card';

function LogoutIcon() {
    return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
                d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
                stroke={AppColors.textPrimary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

function StethoscopeIcon() {
    return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
                d="M4.8 2.655A.5.5 0 005 3.094v5.411a6.001 6.001 0 0012 0V3.094a.5.5 0 00-.2-.44M11 18.5a5.5 5.5 0 015.5-5.5M19 14a2 2 0 100-4 2 2 0 000 4z"
                stroke={AppColors.primary}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const loginsData = [39, 67, 29, 70, 18, 27, 39];
const casesData = [4, 5, 3, 5, 1, 2, 3];

function WeeklyChart() {
    const maxLogins = 100;
    const chartHeight = 180;
    const barWidth = 16;
    const gap = 3;

    const yLabels = [0, 20, 40, 60, 80, 100];

    return (
        <View
            style={{
                backgroundColor: AppColors.white,
                borderRadius: 16,
                borderCurve: 'continuous',
                padding: 20,
                gap: 16,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            }}
        >
            <Text style={{ ...Typography.h5, color: AppColors.textPrimary }}>Weekly Activity</Text>

            <View style={{ flexDirection: 'row', height: chartHeight }}>
                {/* Y-axis labels */}
                <View style={{ justifyContent: 'space-between', marginRight: 8, paddingBottom: 20 }}>
                    {[...yLabels].reverse().map((label) => (
                        <Text key={label} style={{ fontSize: 10, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>
                            {label}
                        </Text>
                    ))}
                </View>

                {/* Bars */}
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end' }}>
                    {weekDays.map((day, i) => (
                        <View key={day} style={{ alignItems: 'center', gap: 6 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: gap, height: chartHeight - 24 }}>
                                {/* Logins bar (light blue) */}
                                <View
                                    style={{
                                        width: barWidth,
                                        height: Math.max(4, (loginsData[i] / maxLogins) * (chartHeight - 24)),
                                        backgroundColor: AppColors.secondary,
                                        borderRadius: 3,
                                        borderCurve: 'continuous',
                                    }}
                                />
                                {/* Cases bar (dark navy) */}
                                <View
                                    style={{
                                        width: barWidth,
                                        height: Math.max(4, (casesData[i] / maxLogins) * (chartHeight - 24)),
                                        backgroundColor: AppColors.primary,
                                        borderRadius: 3,
                                        borderCurve: 'continuous',
                                    }}
                                />
                            </View>
                            <Text style={{ fontSize: 10, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>
                                {day}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Legend */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: AppColors.secondary }} />
                    <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: '#6B7280' }}>Logins</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: AppColors.primary }} />
                    <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: '#6B7280' }}>Active Cases</Text>
                </View>
            </View>
        </View>
    );
}

const initialDoctors = [
    { id: '1', name: 'Dr. Mohammed Sakr', email: 'Mohammedsakr@forensic.com', caseCount: 15, lastActive: '2 hours ago', blocked: false },
    { id: '2', name: 'Dr. Sara Ali', email: 'sara.Ali@forensic.com', caseCount: 9, lastActive: '1 hours ago', blocked: false },
    { id: '3', name: 'Dr. Mohammed Sakr', email: 'Mohammedsakr@forensic.com', caseCount: 15, lastActive: undefined as string | undefined, blocked: true },
];

export default function AdminDashboard() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [doctors, setDoctors] = useState(initialDoctors);

    const toggleBlock = (id: string) => {
        setDoctors((prev) =>
            prev.map((d) => (d.id === id ? { ...d, blocked: !d.blocked } : d))
        );
    };

    return (
        <ScrollView
            contentContainerStyle={{
                paddingTop: insets.top,
                paddingBottom: insets.bottom + 24,
                backgroundColor: AppColors.surface,
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
                <Pressable onPress={() => router.replace('/(auth)/login')} hitSlop={8}>
                    <LogoutIcon />
                </Pressable>
            </View>

            {/* Title */}
            <View style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, gap: 4 }}>
                <Text style={{ ...Typography.h4, color: AppColors.textPrimary }}>Admin Dashboard</Text>
                <Text style={{ ...Typography.bodySmall, color: AppColors.border }}>
                    simple chart to monitor daily work and logins.
                </Text>
            </View>

            {/* Stats — 2 cards in row */}
            <View
                style={{
                    flexDirection: 'row',
                    paddingHorizontal: Spacing.md,
                    paddingTop: Spacing.md,
                    gap: 12,
                }}
            >
                <StatCard title="Total Doctors" value={10} variant="blue" />
                <StatCard title="Active Doctors" value={8} variant="green" />
            </View>

            {/* Full-width stat */}
            <View style={{ paddingHorizontal: Spacing.md, paddingTop: 12 }}>
                <StatCard title="Completed Cases" value={112} variant="teal" fullWidth />
            </View>

            {/* Chart */}
            <View style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.md }}>
                <WeeklyChart />
            </View>

            {/* Doctors Management */}
            <View style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, gap: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <StethoscopeIcon />
                        <Text style={{ ...Typography.h5, color: AppColors.textPrimary }}>Doctors Management</Text>
                    </View>
                    <Pressable onPress={() => router.push('/(admin)/doctors-management')} hitSlop={8}>
                        <Text style={{ ...Typography.bodySmall, color: AppColors.primary }}>Show All</Text>
                    </Pressable>
                </View>
                <View style={{ gap: 10 }}>
                    {doctors.map((doc) => (
                        <DoctorCard
                            key={doc.id}
                            name={doc.name}
                            email={doc.email}
                            caseCount={doc.caseCount}
                            lastActive={doc.lastActive}
                            blocked={doc.blocked}
                            onToggleBlock={() => toggleBlock(doc.id)}
                        />
                    ))}
                </View>
            </View>
        </ScrollView>
    );
}
