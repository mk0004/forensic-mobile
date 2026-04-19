import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { AppColors, Typography, Spacing } from '@/constants/theme';
import { DoctorCard } from '@/components/ui/doctor-card';

const initialDoctors = [
    { id: '1', name: 'Dr. Mohammed Sakr', email: 'Mohammedsakr@forensic.com', caseCount: 15, lastActive: '2 hours ago', blocked: false },
    { id: '2', name: 'Dr. Sara Ali', email: 'sara.Ali@forensic.com', caseCount: 9, lastActive: '1 hours ago', blocked: false },
    { id: '3', name: 'Dr. Mera Ali', email: 'Mera.Ali@forensic.com', caseCount: 12, lastActive: '1 hours ago', blocked: false },
    { id: '4', name: 'Dr. Sara Ali', email: 'abdelrahmansakr@forensic.com', caseCount: 0, lastActive: undefined as string | undefined, blocked: true },
    { id: '5', name: 'Dr. Sara Ali', email: 'sara.Ali@forensic.com', caseCount: 12, lastActive: '1 hours ago', blocked: false },
    { id: '6', name: 'Dr. Taghreed Mohammed', email: 'taghreedmohammed@forensic.com', caseCount: 14, lastActive: '1 hours ago', blocked: false },
    { id: '7', name: 'Dr. Walid Ali', email: 'walidali@forensic.com', caseCount: 0, lastActive: '1 hours ago', blocked: false },
    { id: '8', name: 'Prof. Ebrahem Sakr', email: 'ebrahemsakr@forensic.com', caseCount: 0, lastActive: '1 hours ago', blocked: false },
    { id: '9', name: 'Dr. Tarek Walied', email: 'Tarekwalied@forensic.com', caseCount: 0, lastActive: '1 hours ago', blocked: false },
    { id: '10', name: 'Dr. Zied Taha', email: 'ziedtaha@forensic.com', caseCount: 0, lastActive: '1 hours ago', blocked: false },
    { id: '11', name: 'Dr. Taghreed Mohammed', email: 'taghreedmohammed@forensic.com', caseCount: 9, lastActive: undefined as string | undefined, blocked: true },
];

export default function DoctorsManagementScreen() {
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
                    alignItems: 'center',
                    paddingHorizontal: Spacing.md,
                    paddingVertical: 16,
                    backgroundColor: AppColors.white,
                    gap: 12,
                }}
            >
                <Pressable onPress={() => router.back()} hitSlop={16}>
                    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                        <Path
                            d="M19 12H5M12 19l-7-7 7-7"
                            stroke={AppColors.textPrimary}
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </Svg>
                </Pressable>
                <Text style={{ ...Typography.h4, color: AppColors.textPrimary, fontFamily: 'IBMPlexSans_700Bold' }}>
                    Doctors Management
                </Text>
            </View>

            {/* Doctor List */}
            <View style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.md, gap: 10 }}>
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
        </ScrollView>
    );
}
