import { useState, useMemo } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { AppColors, Typography, Spacing } from '@/constants/theme';
import { BottomDrawer } from '@/components/bottom-drawer';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/* ─── Mock case data ─── */
const CASES = [
    { id: 'CASE-001', title: 'Suspicious Fire Investigation', description: 'Analysis of fire origin and cause determination at the warehouse district.', date: 'Jan 15, 2025' },
    { id: 'CASE-002', title: 'Vehicle Theft Ring', description: 'Multi-county vehicle theft operation involving forged documents and VIN tampering.', date: 'Jan 12, 2025' },
    { id: 'CASE-003', title: 'Cyber Fraud Analysis', description: 'Digital forensic examination of financial transactions linked to phishing.', date: 'Jan 10, 2025' },
    { id: 'CASE-004', title: 'Homicide - Cold Case Review', description: 'Re-examination of physical evidence using updated DNA analysis techniques.', date: 'Jan 8, 2025' },
    { id: 'CASE-005', title: 'Narcotics Lab Evidence', description: 'Chemical analysis and documentation of seized substances and equipment.', date: 'Jan 5, 2025' },
];

function SearchIcon() {
    return (
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35" stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function CheckIcon() {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M20 6L9 17l-5-5" stroke={AppColors.white} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

type Props = {
    visible: boolean;
    onClose: () => void;
    onSuccess?: (caseId: string) => void;
};

export function AddToCaseModal({ visible, onClose, onSuccess }: Props) {
    const [search, setSearch] = useState('');
    const [selectedCase, setSelectedCase] = useState<typeof CASES[0] | null>(null);
    const [evidenceTitle, setEvidenceTitle] = useState('');
    const [evidenceDescription, setEvidenceDescription] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const filtered = useMemo(() => {
        if (!search.trim()) return CASES;
        const q = search.toLowerCase();
        return CASES.filter(c => c.title.toLowerCase().includes(q) || c.id.toLowerCase().includes(q));
    }, [search]);

    function handleConfirm() {
        if (!selectedCase || !evidenceTitle.trim()) return;
        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
            setSelectedCase(null);
            setEvidenceTitle('');
            setEvidenceDescription('');
            setSearch('');
            onSuccess?.(selectedCase.id);
            onClose();
        }, 1800);
    }

    function handleClose() {
        setSelectedCase(null);
        setEvidenceTitle('');
        setEvidenceDescription('');
        setSearch('');
        onClose();
    }

    return (
        <BottomDrawer
            visible={visible}
            onClose={handleClose}
            title={selectedCase ? 'Add Evidence to Case' : 'Select a Case'}
            subtitle={selectedCase ? selectedCase.title : 'Choose a case to add evidence to'}
        >
            {/* Success toast overlay */}
            {showSuccess && (
                <View style={{
                    position: 'absolute',
                    top: -80,
                    left: -16,
                    right: -16,
                    bottom: -20,
                    backgroundColor: AppColors.white,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                    gap: 16,
                }}>
                    <View style={{
                        width: 64,
                        height: 64,
                        borderRadius: 32,
                        backgroundColor: AppColors.success,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <CheckIcon />
                    </View>
                    <Text style={{ ...Typography.h5, color: AppColors.textPrimary }}>
                        Evidence Added
                    </Text>
                    <Text style={{ ...Typography.bodySmall, color: '#6B7280', textAlign: 'center', paddingHorizontal: 32 }}>
                        Evidence added to {selectedCase?.id}
                    </Text>
                </View>
            )}

            {selectedCase ? (
                /* ─── Confirmation Popup ─── */
                <View>
                    {/* Selected case info */}
                    <View style={{
                        backgroundColor: '#F0F4FF',
                        borderRadius: 12,
                        padding: 14,
                        marginBottom: 20,
                        borderLeftWidth: 4,
                        borderLeftColor: AppColors.primary,
                    }}>
                        <Text style={{ ...Typography.bodySmall, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.primary }}>
                            {selectedCase.title}
                        </Text>
                        <Text style={{ ...Typography.caption, color: '#6B7280', marginTop: 4, lineHeight: 18 }}>
                            {selectedCase.description}
                        </Text>
                        <Text style={{ ...Typography.caption, color: '#9CA3AF', marginTop: 6 }}>
                            {selectedCase.id} • {selectedCase.date}
                        </Text>
                    </View>

                    {/* Evidence Title */}
                    <Text style={{ ...Typography.bodySmall, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary, marginBottom: 6 }}>
                        Evidence Title <Text style={{ color: AppColors.error }}>*</Text>
                    </Text>
                    <TextInput
                        value={evidenceTitle}
                        onChangeText={setEvidenceTitle}
                        placeholder="e.g. Deep Fake Analysis — suspect_photo.jpg"
                        placeholderTextColor="#9CA3AF"
                        style={{
                            backgroundColor: '#F9FAFB',
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: '#E5E7EB',
                            padding: 12,
                            fontSize: 14,
                            fontFamily: 'IBMPlexSans_400Regular',
                            color: AppColors.textPrimary,
                            marginBottom: 14,
                        }}
                    />

                    {/* Evidence Description */}
                    <Text style={{ ...Typography.bodySmall, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary, marginBottom: 6 }}>
                        Evidence Description <Text style={{ color: '#9CA3AF' }}>(optional)</Text>
                    </Text>
                    <TextInput
                        value={evidenceDescription}
                        onChangeText={setEvidenceDescription}
                        placeholder="Add a description for this evidence..."
                        placeholderTextColor="#9CA3AF"
                        multiline
                        textAlignVertical="top"
                        style={{
                            backgroundColor: '#F9FAFB',
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: '#E5E7EB',
                            padding: 12,
                            minHeight: 80,
                            fontSize: 14,
                            fontFamily: 'IBMPlexSans_400Regular',
                            color: AppColors.textPrimary,
                            marginBottom: 20,
                        }}
                    />

                    {/* Buttons */}
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <Pressable
                            onPress={() => {
                                setSelectedCase(null);
                                setEvidenceTitle('');
                                setEvidenceDescription('');
                            }}
                            style={({ pressed }) => ({
                                flex: 1,
                                paddingVertical: 14,
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: '#E5E7EB',
                                alignItems: 'center',
                                backgroundColor: pressed ? '#F9FAFB' : AppColors.white,
                            })}
                        >
                            <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                Cancel
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={handleConfirm}
                            disabled={!evidenceTitle.trim()}
                            style={({ pressed }) => ({
                                flex: 1,
                                paddingVertical: 14,
                                borderRadius: 12,
                                alignItems: 'center',
                                backgroundColor: !evidenceTitle.trim()
                                    ? '#D1D5DB'
                                    : pressed
                                        ? AppColors.primaryHover
                                        : AppColors.primary,
                            })}
                        >
                            <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.white }}>
                                Confirm
                            </Text>
                        </Pressable>
                    </View>
                </View>
            ) : (
                /* ─── Case Picker ─── */
                <>
                    {/* Search */}
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#F9FAFB',
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        paddingHorizontal: 12,
                        gap: 8,
                    }}>
                        <SearchIcon />
                        <TextInput
                            value={search}
                            onChangeText={setSearch}
                            placeholder="Search by title or case ID..."
                            placeholderTextColor="#9CA3AF"
                            style={{
                                flex: 1,
                                paddingVertical: 12,
                                fontSize: 14,
                                fontFamily: 'IBMPlexSans_400Regular',
                                color: AppColors.textPrimary,
                            }}
                        />
                    </View>

                    {filtered.map((c) => (
                        <Pressable
                            key={c.id}
                            onPress={() => setSelectedCase(c)}
                            style={({ pressed }) => ({
                                backgroundColor: pressed ? '#F0F4FF' : AppColors.white,
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: '#E5E7EB',
                                padding: 14,
                            })}
                        >
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ ...Typography.bodySmall, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                        {c.title}
                                    </Text>
                                    <Text style={{ ...Typography.caption, color: '#6B7280', marginTop: 4, lineHeight: 16 }} numberOfLines={2}>
                                        {c.description}
                                    </Text>
                                </View>
                                <Text style={{ ...Typography.caption, color: '#9CA3AF', marginLeft: 8 }}>
                                    {c.id}
                                </Text>
                            </View>
                            <Text style={{ ...Typography.caption, color: '#9CA3AF', marginTop: 6 }}>
                                {c.date}
                            </Text>
                        </Pressable>
                    ))}

                    {filtered.length === 0 && (
                        <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                            <Text style={{ ...Typography.bodySmall, color: '#9CA3AF' }}>
                                No cases found
                            </Text>
                        </View>
                    )}

                    {/* Close button */}
                    <Pressable
                        onPress={handleClose}
                        style={({ pressed }) => ({
                            paddingVertical: 14,
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: '#E5E7EB',
                            alignItems: 'center',
                            backgroundColor: pressed ? '#F9FAFB' : AppColors.white,
                            marginTop: 4,
                        })}
                    >
                        <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                            Cancel
                        </Text>
                    </Pressable>
                </>
            )}
        </BottomDrawer>
    );
}
