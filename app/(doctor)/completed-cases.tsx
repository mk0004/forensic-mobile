import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { AppColors, Typography, Spacing } from '@/constants/theme';
import { CaseCard } from '@/components/ui/case-card';

function BackIcon() {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path
                d="M19 12H5M12 19l-7-7 7-7"
                stroke={AppColors.textPrimary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

const completedCases = [
    { title: 'Bank Robbery Evidence', description: 'Fingerprint analysis and CCTV footage examination for the downtown bank heist.', caseId: 'CASE-098', date: 'Dec 20, 2024', daysAgo: 26 },
    { title: 'Missing Person - Jane Doe', description: 'Location triangulation using cellular data and witness testimony cross-reference.', caseId: 'CASE-095', date: 'Dec 15, 2024', daysAgo: 31 },
    { title: 'Insurance Fraud Investigation', description: 'Document forgery analysis and financial discrepancy identification.', caseId: 'CASE-090', date: 'Dec 8, 2024', daysAgo: 38 },
    { title: 'Arson Investigation - Maple St', description: 'Accelerant detection and point-of-origin analysis confirming intentional fire.', caseId: 'CASE-087', date: 'Dec 1, 2024', daysAgo: 45 },
];

export default function CompletedCases() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <View style={{ flex: 1, backgroundColor: AppColors.surface }}>
            <ScrollView
                contentContainerStyle={{
                    paddingTop: insets.top,
                    paddingBottom: insets.bottom + 40,
                }}
            >
                {/* Header */}
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: Spacing.md,
                        paddingVertical: 14,
                        backgroundColor: AppColors.white,
                        gap: 12,
                    }}
                >
                    <Pressable onPress={() => router.back()} hitSlop={8}>
                        <BackIcon />
                    </Pressable>
                    <Text style={{ ...Typography.h5, color: AppColors.textPrimary, flex: 1 }}>
                        Completed Cases
                    </Text>
                    <View
                        style={{
                            backgroundColor: '#DCFCE7',
                            borderRadius: 12,
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                        }}
                    >
                        <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_600SemiBold', color: '#16A34A' }}>
                            {completedCases.length}
                        </Text>
                    </View>
                </View>

                <View style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.md, gap: 12 }}>
                    {completedCases.map((c) => (
                        <CaseCard
                            key={c.caseId}
                            title={c.title}
                            description={c.description}
                            caseId={c.caseId}
                            date={c.date}
                            completed
                            daysAgo={c.daysAgo}
                            onEdit={() => router.push({ pathname: '/(doctor)/case-details', params: { caseId: c.caseId, title: c.title, description: c.description, date: c.date } })}
                        />
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}
