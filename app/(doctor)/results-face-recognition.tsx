import { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Image, Alert, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { AppColors, Typography, Spacing } from '@/constants/theme';
import { AddToCaseModal } from '@/components/add-to-case-modal';

/* ─── Icons ─── */
function BackIcon() {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M19 12H5M12 19l-7-7 7-7" stroke={AppColors.textPrimary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function DownloadIcon() {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke={AppColors.white} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function FolderIcon() {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" stroke={AppColors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function UserIcon() {
    return (
        <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={8} r={4} stroke="#9CA3AF" strokeWidth={1.5} />
            <Path d="M20 21a8 8 0 10-16 0" stroke="#9CA3AF" strokeWidth={1.5} strokeLinecap="round" />
        </Svg>
    );
}

export default function ResultsFaceRecognitionScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { imageUri, apiData, errorData } = useLocalSearchParams<{ imageUri: string; apiData: string; errorData: string }>();
    const [caseModalVisible, setCaseModalVisible] = useState(false);
    const [origSize, setOrigSize] = useState({ w: 0, h: 0 });
    const screenWidth = Dimensions.get('window').width - Spacing.md * 2;

    useEffect(() => {
        if (imageUri) {
            Image.getSize(imageUri, (w, h) => setOrigSize({ w, h }), () => { });
        }
    }, [imageUri]);

    const imageDisplayHeight = origSize.w > 0
        ? (screenWidth / origSize.w) * origSize.h
        : 250;

    // Parse API response
    const parsed = useMemo(() => {
        try {
            const raw = JSON.parse(apiData || '{}');
            // API returns: { identities: ["Name1", "Name2"] }
            // or: { message: "No match found in database", identities: [] }
            if (Array.isArray(raw.identities)) {
                if (raw.identities.length === 0) {
                    return { identities: [], raw, noMatch: true, noMatchMessage: raw.message || 'No match found in database' };
                }
                return { identities: raw.identities, raw, noMatch: false, noMatchMessage: '' };
            }
            // Fallback for unexpected format
            return { identities: [], raw, noMatch: false, noMatchMessage: '' };
        } catch {
            return { identities: [], raw: {}, noMatch: false, noMatchMessage: '' };
        }
    }, [apiData]);

    const hasResults = parsed.identities.length > 0;
    const knownIdentities = parsed.identities.filter((name: string) =>
        !name.toLowerCase().includes('unknown')
    );
    const unknownIdentities = parsed.identities.filter((name: string) =>
        name.toLowerCase().includes('unknown')
    );

    return (
        <View style={{ flex: 1, backgroundColor: AppColors.surface }}>
            <ScrollView
                contentContainerStyle={{
                    paddingTop: insets.top,
                    paddingBottom: insets.bottom + 40,
                }}
            >
                {/* Header */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: Spacing.md,
                    paddingVertical: 14,
                    backgroundColor: AppColors.white,
                    gap: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: '#F3F4F6',
                }}>
                    <Pressable onPress={() => router.back()} hitSlop={8}>
                        <BackIcon />
                    </Pressable>
                    <View style={{ flex: 1, gap: 2 }}>
                        <Text style={{ ...Typography.h5, color: AppColors.textPrimary }}>
                            Recognition Results
                        </Text>
                        <View style={{
                            backgroundColor: '#EEF2FF',
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 6,
                            alignSelf: 'flex-start',
                        }}>
                            <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>
                                Face Recognition
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={{ padding: Spacing.md, gap: 16 }}>
                    {/* Uploaded Image */}
                    {imageUri && (
                        <View style={{
                            backgroundColor: AppColors.white,
                            borderRadius: 16,
                            overflow: 'hidden',
                            borderWidth: 1,
                            borderColor: '#E5E7EB',
                        }}>
                            <Image
                                source={{ uri: imageUri }}
                                style={{ width: '100%', height: imageDisplayHeight, resizeMode: 'contain' }}
                            />
                            <View style={{ padding: 10 }}>
                                <Text style={{ ...Typography.caption, color: '#9CA3AF' }}>Uploaded Evidence</Text>
                            </View>
                        </View>
                    )}

                    {/* Error State */}
                    {errorData ? (
                        <View style={{
                            backgroundColor: '#FEF2F2',
                            borderRadius: 16,
                            padding: 20,
                            borderWidth: 1,
                            borderColor: '#FECACA',
                            gap: 12,
                            alignItems: 'center',
                        }}>
                            <View style={{
                                width: 56,
                                height: 56,
                                borderRadius: 28,
                                backgroundColor: '#FEE2E2',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                                    <Circle cx={12} cy={12} r={10} stroke={AppColors.error} strokeWidth={2} />
                                    <Path d="M15 9l-6 6M9 9l6 6" stroke={AppColors.error} strokeWidth={2} strokeLinecap="round" />
                                </Svg>
                            </View>
                            <Text style={{ ...Typography.bodyLarge, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.error, textAlign: 'center' }}>
                                Analysis Failed
                            </Text>
                            <Text style={{ ...Typography.bodySmall, color: '#991B1B', textAlign: 'center', lineHeight: 20 }}>
                                {errorData}
                            </Text>
                            <Pressable
                                onPress={() => router.back()}
                                style={({ pressed }) => ({
                                    backgroundColor: pressed ? '#DC2626' : AppColors.error,
                                    borderRadius: 12,
                                    paddingVertical: 12,
                                    paddingHorizontal: 24,
                                    marginTop: 4,
                                })}
                            >
                                <Text style={{ ...Typography.button, color: AppColors.white }}>
                                    Try Again
                                </Text>
                            </Pressable>
                        </View>
                    ) : parsed.noMatch ? (
                        /* No Match Found State */
                        <View style={{
                            backgroundColor: AppColors.white,
                            borderRadius: 16,
                            padding: 24,
                            borderWidth: 1,
                            borderColor: '#E5E7EB',
                            gap: 12,
                            alignItems: 'center',
                        }}>
                            <View style={{
                                width: 56,
                                height: 56,
                                borderRadius: 28,
                                backgroundColor: '#FEF3C7',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <UserIcon />
                            </View>
                            <Text style={{ ...Typography.bodyLarge, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary, textAlign: 'center' }}>
                                No Match Found
                            </Text>
                            <Text style={{ ...Typography.bodySmall, color: '#6B7280', textAlign: 'center', lineHeight: 20 }}>
                                {parsed.noMatchMessage || 'The uploaded face could not be matched to any identity in the database.'}
                            </Text>
                            <View style={{
                                backgroundColor: '#FEF3C7',
                                paddingVertical: 6,
                                paddingHorizontal: 16,
                                borderRadius: 8,
                            }}>
                                <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_600SemiBold', color: '#D97706' }}>
                                    0 MATCHES
                                </Text>
                            </View>
                        </View>
                    ) : (
                        <>
                            {/* Summary */}
                            {hasResults && (
                                <View style={{
                                    backgroundColor: AppColors.white,
                                    borderRadius: 16,
                                    padding: 16,
                                    borderWidth: 1,
                                    borderColor: '#E5E7EB',
                                    flexDirection: 'row',
                                    justifyContent: 'space-around',
                                }}>
                                    <View style={{ alignItems: 'center', gap: 4 }}>
                                        <Text style={{ fontSize: 24, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.textPrimary }}>
                                            {parsed.identities.length}
                                        </Text>
                                        <Text style={{ ...Typography.caption, color: '#6B7280' }}>Faces Detected</Text>
                                    </View>
                                    <View style={{ width: 1, backgroundColor: '#E5E7EB' }} />
                                    <View style={{ alignItems: 'center', gap: 4 }}>
                                        <Text style={{ fontSize: 24, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.success }}>
                                            {knownIdentities.length}
                                        </Text>
                                        <Text style={{ ...Typography.caption, color: '#6B7280' }}>Identified</Text>
                                    </View>
                                    <View style={{ width: 1, backgroundColor: '#E5E7EB' }} />
                                    <View style={{ alignItems: 'center', gap: 4 }}>
                                        <Text style={{ fontSize: 24, fontFamily: 'IBMPlexSans_700Bold', color: '#D97706' }}>
                                            {unknownIdentities.length}
                                        </Text>
                                        <Text style={{ ...Typography.caption, color: '#6B7280' }}>Unknown</Text>
                                    </View>
                                </View>
                            )}

                            {/* Known Identities */}
                            {knownIdentities.length > 0 && (
                                <View style={{
                                    backgroundColor: AppColors.white,
                                    borderRadius: 16,
                                    padding: 20,
                                    borderWidth: 1,
                                    borderColor: '#E5E7EB',
                                    gap: 14,
                                }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={{ ...Typography.bodyLarge, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                            Identified Persons
                                        </Text>
                                        <View style={{
                                            backgroundColor: '#DCFCE7',
                                            paddingVertical: 4,
                                            paddingHorizontal: 10,
                                            borderRadius: 8,
                                        }}>
                                            <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.success }}>
                                                {knownIdentities.length} {knownIdentities.length === 1 ? 'MATCH' : 'MATCHES'}
                                            </Text>
                                        </View>
                                    </View>

                                    {knownIdentities.map((name: string, i: number) => (
                                        <View
                                            key={i}
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                gap: 14,
                                                paddingVertical: 12,
                                                borderTopWidth: i > 0 ? 1 : 0,
                                                borderTopColor: '#F3F4F6',
                                            }}
                                        >
                                            <View style={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: 24,
                                                backgroundColor: '#EEF2FF',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}>
                                                <Text style={{ fontSize: 18, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>
                                                    {name.charAt(0).toUpperCase()}
                                                </Text>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ ...Typography.bodyLarge, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.textPrimary }}>
                                                    {name}
                                                </Text>
                                                <Text style={{ ...Typography.caption, color: '#6B7280', marginTop: 2 }}>
                                                    Model: ArcFace • Backend: RetinaFace
                                                </Text>
                                            </View>
                                            <View style={{
                                                backgroundColor: '#DCFCE7',
                                                paddingVertical: 4,
                                                paddingHorizontal: 8,
                                                borderRadius: 6,
                                            }}>
                                                <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.success }}>
                                                    MATCH
                                                </Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* Unknown Identities */}
                            {unknownIdentities.length > 0 && (
                                <View style={{
                                    backgroundColor: AppColors.white,
                                    borderRadius: 16,
                                    padding: 20,
                                    borderWidth: 1,
                                    borderColor: '#FDE68A',
                                    gap: 14,
                                }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={{ ...Typography.bodyLarge, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                            Unidentified Persons
                                        </Text>
                                        <View style={{
                                            backgroundColor: '#FEF3C7',
                                            paddingVertical: 4,
                                            paddingHorizontal: 10,
                                            borderRadius: 8,
                                        }}>
                                            <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_600SemiBold', color: '#D97706' }}>
                                                {unknownIdentities.length} UNKNOWN
                                            </Text>
                                        </View>
                                    </View>

                                    {unknownIdentities.map((name: string, i: number) => (
                                        <View
                                            key={i}
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                gap: 14,
                                                paddingVertical: 12,
                                                borderTopWidth: i > 0 ? 1 : 0,
                                                borderTopColor: '#F3F4F6',
                                            }}
                                        >
                                            <View style={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: 24,
                                                backgroundColor: '#FEF3C7',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}>
                                                <UserIcon />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ ...Typography.bodyLarge, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                                    {name}
                                                </Text>
                                                <Text style={{ ...Typography.caption, color: '#9CA3AF', marginTop: 2 }}>
                                                    Not found in database
                                                </Text>
                                            </View>
                                            <View style={{
                                                backgroundColor: '#FEF3C7',
                                                paddingVertical: 4,
                                                paddingHorizontal: 8,
                                                borderRadius: 6,
                                            }}>
                                                <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_600SemiBold', color: '#D97706' }}>
                                                    NO MATCH
                                                </Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* Action Buttons */}
                            <View style={{ gap: 10 }}>
                                <Pressable
                                    onPress={() => Alert.alert('Download Report', 'Report downloaded successfully.')}
                                    style={({ pressed }) => ({
                                        backgroundColor: pressed ? AppColors.primaryHover : AppColors.primary,
                                        borderRadius: 14,
                                        paddingVertical: 14,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8,
                                    })}
                                >
                                    <DownloadIcon />
                                    <Text style={{ ...Typography.button, color: AppColors.white }}>
                                        Download Report
                                    </Text>
                                </Pressable>

                                <Pressable
                                    onPress={() => setCaseModalVisible(true)}
                                    style={({ pressed }) => ({
                                        backgroundColor: pressed ? '#F0F4FF' : AppColors.white,
                                        borderRadius: 14,
                                        paddingVertical: 14,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8,
                                        borderWidth: 1.5,
                                        borderColor: AppColors.primary,
                                    })}
                                >
                                    <FolderIcon />
                                    <Text style={{ ...Typography.button, color: AppColors.primary }}>
                                        Add to Case
                                    </Text>
                                </Pressable>
                            </View>
                        </>
                    )}
                </View>
            </ScrollView>

            <AddToCaseModal
                visible={caseModalVisible}
                onClose={() => setCaseModalVisible(false)}
            />
        </View>
    );
}
